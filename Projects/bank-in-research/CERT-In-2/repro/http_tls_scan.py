#!/usr/bin/env python3
"""Pass 2+3: HTTP header/cookie scan + TLS cert health for live .bank.in hosts."""
import asyncio, csv, json, ssl, re, datetime
import aiohttp

BASE = "/home/.z/workspaces/con_bCouXuLOgCvtViFA/bankin-scan"
OUT_HTTP = f"{BASE}/http_scan.jsonl"
UA = "Mozilla/5.0 (compatible; bank-in-security-audit/2026.08; +mailto:cashlessconsumerin@gmail.com)"
CONC = 120

def parse_cert(cert_der):
    try:
        import OpenSSL.crypto as oc
    except ImportError:
        return {}
    try:
        x = oc.load_certificate(oc.FILETYPE_ASN1, cert_der)
        not_after = x.get_notAfter().decode()
        not_before = x.get_notBefore().decode()
        subj = dict(x.get_subject().get_components())
        iss = dict(x.get_issuer().get_components())
        exp = datetime.datetime.strptime(not_after, "%Y%m%d%H%M%SZ").replace(tzinfo=datetime.timezone.utc)
        return {
            "not_after": exp.date().isoformat(),
            "days_left": (exp - datetime.datetime.now(datetime.timezone.utc)).days,
            "subject_cn": subj.get(b"CN", b"").decode(errors="replace"),
            "issuer_o": iss.get(b"O", b"").decode(errors="replace"),
            "self_signed": subj.get(b"CN") == iss.get(b"CN") and subj.get(b"O") == iss.get(b"O"),
        }
    except Exception as e:
        return {"parse_error": str(e)[:80]}

async def tls_check(host, out):
    # grab cert ignoring verification
    try:
        ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        reader, writer = await asyncio.wait_for(asyncio.open_connection(host, 443, ssl=ctx), timeout=8)
        der = writer.get_extra_info("ssl_object").getpeercert(True)
        proto = writer.get_extra_info("ssl_object").version()
        info = parse_cert(der)
        info["proto"] = proto
        writer.close()
        try:
            await writer.wait_closed()
        except Exception:
            pass
    except Exception as e:
        out["tls"] = {"error": f"{type(e).__name__}: {str(e)[:60]}"}
        return
    out["tls"] = info
    # legacy TLS 1.0 probe only if cert ok
    try:
        lctx = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
        lctx.check_hostname = False
        lctx.verify_mode = ssl.CERT_NONE
        try:
            lctx.minimum_version = ssl.TLSVersion.TLSv1
            lctx.maximum_version = ssl.TLSVersion.TLSv1_1
            lctx.set_ciphers("DEFAULT:@SECLEVEL=0")
        except Exception:
            return
        lr, lw = await asyncio.wait_for(asyncio.open_connection(host, 443, ssl=lctx), timeout=8)
        out["tls_legacy_ok"] = lw.get_extra_info("ssl_object").version()
        lw.close()
        try:
            await lw.wait_closed()
        except Exception:
            pass
    except Exception:
        pass

async def http_check(host, sem, session, out):
    async with sem:
        entry = {"host": host}
        url = f"https://{host}/"
        try:
            async with session.get(url, allow_redirects=True, timeout=aiohttp.ClientTimeout(total=15)) as r:
                body = await r.content.read(4096)
                h = r.headers
                entry.update({
                    "https_status": r.status,
                    "final_url": str(r.url),
                    "title": (re.search(rb"<title[^>]*>(.*?)</title>", body[:4096], re.S | re.I).group(1)[:100].decode(errors="replace") if re.search(rb"<title[^>]*>(.*?)</title>", body[:4096], re.S | re.I) else ""),
                    "server": h.get("Server", "")[:60],
                    "hsts": h.get("Strict-Transport-Security", ""),
                    "xfo": h.get("X-Frame-Options", ""),
                    "frame_ancestors": ("frame-ancestors" in h.get("Content-Security-Policy", "").lower()),
                    "csp": bool(h.get("Content-Security-Policy")),
                    "xcto": h.get("X-Content-Type-Options", ""),
                    "rp": h.get("Referrer-Policy", ""),
                    "cookies": [
                        {"name": c.split("=")[0][:40], "secure": "secure" in c.lower().split(";")[-3:] or bool(re.search(r";\s*secure", c, re.I)), "httponly": bool(re.search(r";\s*httponly", c, re.I)), "samesite": (re.search(r";\s*samesite=([^;]+)", c, re.I).group(1) if re.search(r";\s*samesite=", c, re.I) else "")}
                        for c in h.getall("Set-Cookie", [])
                    ][:5],
                })
        except Exception as e:
            entry["https_error"] = f"{type(e).__name__}: {str(e)[:70]}"
            # fallback plain HTTP
            try:
                async with session.get(f"http://{host}/", allow_redirects=True, timeout=aiohttp.ClientTimeout(total=10)) as r:
                    body = await r.content.read(2048)
                    t = re.search(rb"<title[^>]*>(.*?)</title>", body, re.S | re.I)
                    entry.update({"http_status": r.status, "final_url": str(r.url),
                                  "title": t.group(1)[:100].decode(errors="replace") if t else ""})
                    if r.url.scheme == "http":
                        entry["no_https_redirect"] = True
            except Exception as e2:
                entry["http_error"] = f"{type(e).__name__}: {str(e2)[:50]}"
        out.append(entry)
        await tls_check(host, entry)

async def main():
    hosts = []
    for line in open(f"{BASE}/dns_sweep.jsonl"):
        e = json.loads(line)
        if e.get("dead"):
            continue
        ips = [ip for ip in e.get("ips", []) if not ip.startswith("v6:") and not ip.startswith("127.")]
        if e.get("private_ip"):
            continue
        if e.get("dangling") or ips:
            hosts.append((e["host"], bool(e.get("dangling"))))
    hosts.sort()
    print(f"scanning {len(hosts)} hosts ({sum(1 for _,d in hosts if d)} dangling)", flush=True)

    sem = asyncio.Semaphore(CONC)
    conn = aiohttp.TCPConnector(limit=CONC, ttl_dns_cache=600)
    outf = open(OUT_HTTP, "w")
    async with aiohttp.ClientSession(connector=conn, headers={"User-Agent": UA}) as session:
        results = []
        BATCH = 500
        for i in range(0, len(hosts), BATCH):
            chunk = hosts[i:i+BATCH]
            await asyncio.gather(*[http_check(h, sem, session, results) for h, _ in chunk])
            for e in results:
                outf.write(json.dumps(e) + "\n")
            outf.flush()
            print(f"  {min(i+BATCH,len(hosts))}/{len(hosts)} flushed={len(results)}", flush=True)
            results = []

    outf.close()
    n = sum(1 for _ in open(OUT_HTTP))
    print(f"final lines on disk: {n}")

asyncio.run(main())
