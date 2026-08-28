# CERT-In Batch 2 — Dangling DNS / Subdomain Takeover (.bank.in)

**Status: ALL FILES ARE DRAFTS. Nothing sent, nothing will be auto-sent. Human sign-off required before dispatch of anything.**

Generated 2026-08-26 from release v2026.8.4 (2026-08-23) of CCAgentOrg/bank-in-domains.
Universe: 15,266 hostnames swept → 82 confirmed dangling records → 21 zones / 18 banking groups.

## Contents
- `cert-in_master_cover_DRAFT.md` — cover email body listing all entities
- `idrbt_cover_DRAFT.md`, `rbi_cover_DRAFT.md` — informational copies (draft)
- `00_index.md` — per-entity index with severities
- `01_methodology.md` — sweep pipeline + false-positive controls
- `02_evidence_ledger.csv` — machine-readable findings (hostname, target, class, severity)
- `drafts/<zone>.md` — one longer-form disclosure per entity (21 files), each with:
  summary, methodology, per-record findings with live `dig` evidence blocks,
  class-specific remediation, impact statement, drafting notes
- `evidence/` — raw sweep output (`dns_sweep.jsonl`, `takeover_candidates.json`)
- `repro/` — scan scripts (`takeover_dns.py`, `http_tls_scan.py`)

## Dispatch checklist (manual)
- [ ] Re-verify a sample of findings same-day as sending (records can be fixed/claimed)
- [ ] Review each draft for factual accuracy and tone
- [ ] Attach only relevant drafts to the master cover (or all, as one bundle)
- [ ] Send manually from cashlessconsumerin@gmail.com — do NOT automate this step
- [ ] Log dispatch date in bank-in-research README

## Related prior work
Batch 1 (2026-08-18/19): `.env` exposures — Baran Nagrik Sahakari Bank, NSDL Payments Bank (+ IDRBT context). See `../CERT-In-reply-draft.md`.
