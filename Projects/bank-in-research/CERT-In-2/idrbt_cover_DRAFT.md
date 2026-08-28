# DRAFT — To: IDRBT (info@idrbt.ac.in) — informational copy
# Registry hygiene note: stale DNS records across the .bank.in namespace

| | |
| --- | --- |
| Date | 26 August 2026 |
| Status | **DRAFT v0.1 — NOT SENT** |

Dear IDRBT team,

As part of independent research into the `.bank.in` domain space instituted under RBI's directive, we identified 82 DNS records across 18 banking groups that point at decommissioned external infrastructure (Salesforce Sites, Akamai edgekey/akadns, AWS ELB/ALB, CloudFront, F5 Distributed Cloud, Cloudflare partial setups). Such "dangling" records allow third parties who re-register the abandoned targets to serve content from the affected `*.bank.in` hostnames.

Per-entity details are being reported to CERT-In with coordination requested; this note is an informational copy because several mitigations are most effective at registry/namespace level:

1. Periodic automated reconciliation between published zone data and live services.
2. Guidance to banks on DNS change control (decommission-before-delete workflow).
3. A registry-side reporting channel for stale-record findings.

Our methodology (passive public-DNS observation only; no exploitation attempted) is enclosed. We would be glad to share the full dataset.

Regards,
Cashless Consumer

*DRAFT — requires human review before dispatch.*
