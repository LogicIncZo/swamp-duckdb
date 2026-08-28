# v0.2 Severity Corrections — 28 August 2026

**Trigger.** External review (and AWS's own documentation) confirmed the v0.1
drafts overstated claimability for several AWS/Akamai/Cloudflare target classes.
The "AWS names can't be taken over" claim is *partly* true: it depends entirely
on which AWS surface the dangling CNAME points at. Corrections applied to all
entity drafts, `02_evidence_ledger.csv`, and `cert-in_master_cover_DRAFT.md`.

## What actually is/isn't claimable (the ELI5)

| Target | Claimable by attacker? | Why | Severity now |
|---|---|---|---|
| ALB/NLB (`*.elb.amazonaws.com`) | **Yes** — name is drawn from a shared regional pool; you can request names until you hit the exact one | This is the one real AWS takeover class | CRITICAL (prod) / HIGH (UAT/PoC) |
| Salesforce Sites (`*.siteforce.com`) | **Yes** — deleted site can be recreated/claimed | original HIGH stands | HIGH |
| F5 Volterra (`*.ves.io`) | **Yes** — deleted load balancer, distributed-cloud claim | original HIGH stands | HIGH |
| CloudFront (`*.cloudfront.net`) | **No** — attaching your distribution to the bank's hostname requires a TLS certificate for that hostname, validated via DNS the attacker doesn't control | v0.1 MEDIUM → **LOW** |
| AWS Global Accelerator (`*.awsglobalaccelerator.com`) | **No** — names are random 28-char IDs assigned by AWS and never reissued | v0.1 MEDIUM → **LOW** |
| Cloudflare (`*.cdn.cloudflare.net`) | **No** — custom-hostname attach requires ownership validation (TXT/HTTP token) | v0.1 MEDIUM → **LOW** |
| Akamai (`*.edgekey.net`) | **No** — edge hostnames are contract-gated with ownership re-verification | v0.1 HIGH → **MEDIUM** (broken service, brandabuse-adjacent, but no takeover) |
| Bare-IP CNAME | **No** | LOW (unchanged) |

The popular claim "AWS names can't be taken over" is therefore **false for ELB/ALB
and true for CloudFront + Global Accelerator**. The generic takeover checklists
that flatten all of AWS into one bucket get this wrong in both directions.

## Applied changes

1. **CSB (`vkyc`, `turnvkyc` → prod ALB/NLB)** — unchanged CRITICAL; the only
   true reclaimable-name exposure on production traffic in this batch.
2. **HDFC (`mybusiness.uatdigital` ALB)** — CRITICAL → **HIGH** (reclaimable
   name, but UAT zone).
3. **IDBI (`adapidpoc` ALB)** — CRITICAL → **HIGH** (reclaimable name, but
   decommissioned PoC host).
4. **Axis (20), DBS (14), Kotak (5), Emirates NBD (3)** — all CloudFront /
   Global Accelerator / Cloudflare targets → **LOW**.
5. **Union Bank (5), JPMorgan edgekey** — Akamai edgekey → **MEDIUM**.
6. **ELB caveat added to every ELB finding:** a claimant cannot obtain a valid
   TLS certificate for the bank's hostname (CA validation requires control of
   the bank's DNS), so realistic impact is HTTP-level content
   injection/phishing and outage for TLS-failing clients — not silent HTTPS
   impersonation.
7. Per-finding "Assessment note (v0.2)" paragraphs added; per-entity "Highest
   severity" recomputed; master cover table and legend rewritten.
8. `axis.md` summary prose corrected (13 Global Accelerator IDs, not 8) and
   its "successful exploitation would let an attacker serve active content"
   sentence softened to match non-claimable reality.

## Remaining open items for human review

- Canara UAT / CBOI "miscellaneous broken CNAME" rows: claimability could not
  be established — kept MEDIUM pending vendor confirmation.
- IDBI `ns-c` NS anomaly and Kotak `nb3` internal names were left as-is.

**Status: v0.2. Nothing sent. Human sign-off required before dispatch.**
