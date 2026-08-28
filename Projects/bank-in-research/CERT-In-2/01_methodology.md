# Methodology - bank-in dangling-record sweep (CERT-In-2)

_Date: 26 August 2026_

## Data source
- IDRBT-derived `.bank.in` universe: release **v2026.8.4** (2026-08-23) of
  github.com/CCAgentOrg/bank-in-domains (`bank_domains_status.csv`, `new_subdomains.txt`,
  CT-expansion list). 15,266 unique hostnames.

## Pipeline
1. **Authoritative-first resolution.** Each hostname resolved against the bank's own
   NS (fallback public resolver), A + CNAME, lifetime 6 s. Output: `dns_sweep.jsonl`
   (one JSON object per hostname).
2. **Dangling detection.** A record is *dangling* when the parent name resolves
   authoritatively but its CNAME target returns NXDOMAIN / no-A / SERVFAIL, and the
   failure reproduces across resolvers and time.
3. **Service fingerprinting.** Target matched against known claimable-service patterns
   (Salesforce Sites, Akamai edgekey, Cloudflare partial setup, AWS Global Accelerator,
   CloudFront, ELB/ALB naming, F5 xc/ves.io).
4. **Manual re-verification.** Every candidate re-checked by hand with repeated `dig`
   runs (different resolvers, hours apart). Wildcard zones, geo-CDN variation and
   registry-side glue issues excluded.
5. **Private-address leak check.** A records pointing at RFC1918 space logged
   separately (31 hosts) - reported as informational hygiene findings, not takeover.

## False-positive controls
- Wildcard detection: probe random non-existent labels under same zone.
- Geo/anycast variation: compare answers from local modal resolver vs DoH (dns.google).
- Transient NS failure: require reproducible failure over >= 30 min window.

## Tooling
- Python 3.12 + dnspython async resolver (concurrency 200).
- Scripts preserved in `repro/` (`takeover_dns.py`, `http_tls_scan.py`).
- No exploitation attempted at any stage; passive observation only.
