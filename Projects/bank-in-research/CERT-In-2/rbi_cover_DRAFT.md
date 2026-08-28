# DRAFT — To: RBI (supervision / cyber security channels) — informational copy
# DNS lifecycle hygiene in the .bank.in namespace: 82 stale records across 18 banking groups

| | |
| --- | --- |
| Date | 26 August 2026 |
| Status | **DRAFT v0.1 — NOT SENT** |

Respected Sir/Madam,

We are independent consumer-advocacy researchers. Following RBI's 2025 mandate migrating banks to `.bank.in` under IDRBT operation, we have been auditing the namespace for security hygiene. We report, via CERT-In coordination (copies enclosed), **82 dangling DNS records across 18 banking groups** — including scheduled commercial banks, small finance banks, and co-operative banks.

A dangling record publishes a hostname whose cloud target has been decommissioned elsewhere; whoever re-registers that target can serve content from the bank's own `*.bank.in` name — including UAT and API-labelled hosts. This is a supervisory-relevant control gap in IT-asset and DNS change management rather than an active intrusion; we have not attempted any claim or exploitation.

We respectfully suggest that DNS lifecycle reconciliation be added to the periodic cyber-security audit expectations for `.bank.in` registrants.

Regards,
Cashless Consumer

*DRAFT — requires human review before dispatch.*
