#!/usr/bin/env python3
"""Pass 1: DNS sweep of all .bank.in subdomains -> dangling CNAME / takeover candidates."""
import asyncio, csv, json, re
import dns.resolver, dns.asyncresolver, dns.exception

BASE = "/home/.z/workspaces/con_bCouXuLOgCvtViFA/bankin-scan"
OUT = f"{BASE}/dns_sweep.jsonl"

TAKEOVER_FINGERPRINTS = {
    "github.io": "GitHub Pages",
    "herokuapp.com": "Heroku",
    "azurewebsites.net": "Azure App Service",
    "cloudapp.net": "Azure CloudApp",
    "azureedge.net": "Azure CDN",
    "blob.core.windows.net": "Azure Blob",
    "cloudfront.net": "AWS CloudFront",
    "amazonaws.com": "AWS (S3/ELB)",
    "web.app": "Firebase Hosting",
    "firebaseapp.com": "Firebase Hosting",
    "netlify.app": "Netlify",
    "vercel.app": "Vercel",
    "surge.sh": "Surge.sh",
    "bitbucket.io": "Bitbucket Pages",
    "myshopify.com": "Shopify",
    "tumblr.com": "Tumblr",
    "wordpress.com": "WordPress.com",
    "ghost.io": "Ghost(Pro)",
    "readme.io": "Readme.io",
    "helpjuice.com": "HelpJuice",
    "helpscoutdocs.com": "HelpScout Docs",
    "pantheonsite.io": "Pantheon",
    "freshdesk.com": "Freshdesk",
    "zendesk.com": "Zendesk",
    "teamwork.com": "Teamwork",
    "unbouncepages.com": "Unbounce",
    "pagespeedmobilizer.com": "PagespeedMobilizer",
}

PRIVATE_RE = re.compile(r"^(10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.)")

async def q(resolver, name, rtype):
    try:
        ans = await resolver.resolve(name, rtype, raise_on_no_answer=False, lifetime=6.0)
        return [r.to_text().rstrip('.').lower() if rtype == 'CNAME' else r.to_text() for r in ans.rrset] if ans.rrset else None
    except dns.resolver.NXDOMAIN:
        return "NXDOMAIN"
    except (dns.exception.Timeout, asyncio.TimeoutError):
        return "TIMEOUT"
    except dns.resolver.NoNameservers:
        return "SERVFAIL"
    except Exception as e:
        return f"ERR:{type(e).__name__}"

async def sweep(hostname, sem, resolver, results):
    async with sem:
        entry = {"host": hostname}
        cname = await q(resolver, hostname, "CNAME")
        if isinstance(cname, list) and cname:
            target = cname[0]
            entry["cname"] = target
            tgt_a = await q(resolver, target, "A")
            if tgt_a is None or tgt_a in ("NXDOMAIN", "SERVFAIL"):
                entry["dangling"] = True
                svc = next((v for k, v in TAKEOVER_FINGERPRINTS.items() if target.endswith(k)), "unknown")
                entry["service"] = svc
                entry["target_status"] = "no-A" if tgt_a is None else tgt_a
            elif isinstance(tgt_a, list):
                entry["ips"] = tgt_a[:3]
                if any(PRIVATE_RE.match(ip) for ip in tgt_a):
                    entry["private_ip"] = True
        else:
            a = await q(resolver, hostname, "A")
            if a is None:
                aaaa = await q(resolver, hostname, "AAAA")
                if isinstance(aaaa, list) and aaaa:
                    entry["ips"] = ["v6:" + x for x in aaaa[:2]]
                    return results.append(entry)
            if isinstance(a, list) and a:
                entry["ips"] = a[:2]
                if any(PRIVATE_RE.match(ip) for ip in a):
                    entry["private_ip"] = True
            elif a == "NXDOMAIN" and cname != "NXDOMAIN":
                pass
            else:
                entry["dead"] = a if isinstance(a, str) else "none"
        results.append(entry)

def load_universe():
    hosts = set()
    with open(f"{BASE}/new_subdomains.txt") as f:
        for line in f:
            h = line.strip().lower()
            if h and h.endswith(".bank.in"):
                hosts.add(h)
    with open(f"{BASE}/bank_domains_status.csv") as f:
        for row in csv.DictReader(f):
            h = row["domain"].strip().lower()
            if h.endswith(".bank.in"):
                hosts.add(h)
    return sorted(hosts)

async def main():
    hosts = load_universe()
    print(f"universe: {len(hosts)} hostnames", flush=True)
    resolver = dns.asyncresolver.Resolver(configure=True)
    resolver.nameservers = ["1.1.1.1", "8.8.8.8"]
    sem = asyncio.Semaphore(150)
    results = []
    BATCH = 3000
    for i in range(0, len(hosts), BATCH):
        chunk = hosts[i:i+BATCH]
        await asyncio.gather(*[sweep(h, sem, resolver, results) for h in chunk])
        print(f"  {min(i+BATCH,len(hosts))}/{len(hosts)} done", flush=True)
    with open(OUT, "w") as f:
        for e in results:
            f.write(json.dumps(e) + "\n")
    dangling = [e for e in results if e.get("dangling")]
    private = [e for e in results if e.get("private_ip") and not e.get("dangling")]
    dead = [e for e in results if e.get("dead")]
    alive = len(results) - len(dangling) - len(dead)
    print(f"alive={alive} dangling_cname={len(dangling)} private_ip={len(private)} dead={len(dead)}")
    for d in dangling[:50]:
        print("DANGLING:", json.dumps(d))

asyncio.run(main())
