# DRAFT — To: incident@cert-in.org.in
# Responsible Disclosure: Dangling DNS Records Enabling Subdomain Takeover across .bank.in Entities (Batch 2)

| | |
| --- | --- |
| To | incident@cert-in.org.in |
| From | Cashless Consumer <cashlessconsumerin@gmail.com> |
| Date | 26 August 2026 |
| Status | **DRAFT v0.1 — NOT SENT** |

Dear CERT-In Team,

We are writing to report **82 dangling DNS records across 21 zones belonging to 18 banking groups** in the RBI-mandated `.bank.in` namespace. In each case the bank's authoritative nameservers still publish a CNAME whose target no longer resolves, leaving the bank's hostname servable by whichever third party claims the abandoned target. This is the class of issue commonly called *subdomain takeover*.

This batch is distinct from, and additional to, our earlier reports of exposed `.env` files and debug endpoints (acknowledged correspondence ongoing). No exploitation or registration of any target was attempted; all findings derive from passive public-DNS observation plus HTTP HEAD checks against the v2026.8.4 dataset release of the bank-in-domains project.

## Entities covered (one detailed report per entity attached)

| # | Entity / zone | Records | Highest severity | Notable exposure |
|---|---|---|---|---|
| 1 | Axis Bank (`axis.bank.in`) | 20 | LOW | 7 CloudFront + 13 Global Accelerator names; targets not claimable (validation-gated) |
| 2 | DBS Bank India (`dbs.bank.in`) | 14 | LOW | API/UAT names on Cloudflare partial setups; not claimable |
| 3 | HDFC Bank incl. `hdfcuat` (`hdfc.bank.in`) | 8 | HIGH | `asset.`/`emailers.`/UAT fleet on deleted F5 XC LBs; reclaimable UAT ALB |
| 4 | IDFC First Bank (`idfcfirst.bank.in`) | 9 | HIGH | Salesforce Sites deleted-site claims incl. corporate banking |
| 5 | Kotak (`kotak`, `kotak811`, `kotakuat`) | 5 | LOW | Cloudflare partial setups, nb3 dev/UAT; not claimable |
| 6 | Union Bank of India (`unionbankofindia.bank.in`) | 5 | MEDIUM | Akamai edgekey dangling incl. developer portal; ownership-validated, not claimable |
| 7 | Emirates NBD India | 3 | LOW | dev/preprod/uat Cloudflare partials; not claimable |
| 8 | CSB Bank (`csb.bank.in`) | 2 | CRITICAL | Production Video-KYC ALB + NLB records (reclaimable names) |
| 9 | IndusInd Bank (`indusind.bank.in`) | 2 | HIGH | UPI-PIP production hostnames on deleted F5 XC LBs |
| 10 | IDBI Bank (`idbi.bank.in`) | 1 | HIGH | `adapidpoc.` → reclaimable ALB name (decommissioned PoC) |
| 11 | SBI (`sbi.bank.in`) | 1 | HIGH | Broken Akamai akadns delegation (`siapis`) |
| 12 | JPMorgan Chase India | 2 | MEDIUM | edgekey (ownership-validated, not claimable) + internal GSLB pointer |
| 13 | Ujjivan SFB | 1 | MEDIUM | UAT marketing site pointer |
| 14 | Canara Bank UAT | 1 | MEDIUM | WaaS vendor pointer |
| 15–21 | Small co-op banks (CBOI, IPC, Jagruti, Devigayatri, SPC, UMUCB, ZP Shikshak Bank) | 7 total | LOW/MEDIUM | Invalid/broken records incl. www apexes |

Severities follow v0.2 claimability review (28 Aug 2026): CRITICAL = reclaimable ELB name on production traffic; HIGH = claimable target (Salesforce/F5 XC) or reclaimable ELB on UAT/decommissioned host; MEDIUM = ownership-validated but contract-gated target (Akamai edgekey); LOW = validation-gated target not claimable by third parties (Cloudflare, CloudFront, Global Accelerator, bare IPs).

## What we ask

1. Coordination with each listed bank to remove or repoint the stale records.
2. Consideration of registry-level guidance via IDRBT on DNS lifecycle hygiene for `.bank.in`.
3. Acknowledgement of this report under your vulnerability disclosure process.

Full technical detail, live-verified evidence blocks, and remediation steps are in the per-entity drafts accompanying this cover. Methodology and false-positive controls are described in `01_methodology.md`; the complete machine-readable finding set is `02_evidence_ledger.csv`.

Regards,
Cashless Consumer

---
*DRAFT — requires human review before dispatch.*
