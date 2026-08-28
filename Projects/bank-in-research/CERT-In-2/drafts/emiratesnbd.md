# Responsible Disclosure: Dangling DNS Records on `EMIRATESNBD.bank.in` (3 records)

| | |
| --- | --- |
| To | incident@cert-in.org.in |
| From | Cashless Consumer <cashlessconsumerin@gmail.com> |
| Date | 26 August 2026 |
| Status | **DRAFT v0.2 - not sent** |
| Entity | Emirates NBD (India operations) (emiratesnbd) |
| Highest severity | **LOW** |
| Records affected | 3 |
| Registry context | IDRBT `.bank.in` domain space (RBI-mandated) |

> **Drafting note (v0.2):** numbers and evidence auto-generated from the scan of
> 25-26 Aug 2026. Severities re-assessed 28 Aug 2026 after a claimability review
> (AWS ELB/ALB + Salesforce + F5 names are claimable; CloudFront, Global
> Accelerator, Cloudflare and Akamai edge targets require owner validation and
> are NOT claimable). Human review required before any dispatch.

---

## 1. Summary

Four hostnames (dev, preprod, uat, and apex-adjacent records) CNAME into the bank's cdn.cloudflare.net namespace without resolving addresses.

**Affected hostnames (3 records):** `dev.emiratesnbd.bank.in`, `preprod.emiratesnbd.bank.in`, `uat.emiratesnbd.bank.in`.

We are reporting this to CERT-In under its vulnerability-note process because
the affected names sit inside the RBI-mandated `.bank.in` namespace operated by
IDRBT, and because successful exploitation would let an attacker serve active
content on a hostname users have been trained to trust as "a bank domain".
We request that CERT-In coordinate remediation with the bank (and IDRBT where
registry-level action is useful).

## 2. What we did

- Universe: the full published `emiratesnbd.bank.in` zone from the IDRBT-derived
  dataset released by the bank-in-domains project (release v2026.8.4, 23 Aug 2026).
- Every hostname was resolved via the bank's own authoritative DNS on 25 Aug 2026;
  records whose CNAME/A target no longer resolve were flagged as *dangling*.
- Each flagged record was then manually re-verified with independent DNS queries
  (repeated at generation time of this draft) to exclude transient failures,
  wildcard catches, and CDN geo-variation false positives.
- No probing, exploitation, or interaction with bank applications took place;
  all observations come from passive public DNS data plus HTTP HEAD checks.

## 3. Findings


### F1 - `dev.emiratesnbd.bank.in`

| Field | Value |
| --- | --- |
| Severity | **LOW** |
| Issue class | Cloudflare partial-zone dangling configuration (custom-hostname validation required; not claimable) |
| Dangling target | `dev.emiratesnbd.bank.in.cdn.cloudflare.net` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer dev.emiratesnbd.bank.in CNAME
dev.emiratesnbd.bank.in. 300  IN  CNAME  dev.emiratesnbd.bank.in.cdn.cloudflare.net.

$ dig dev.emiratesnbd.bank.in   # -> status: NOERROR
# CNAME target does not resolve (NOERROR); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** *.cdn.cloudflare.net targets that do not resolve usually reflect an incomplete or lapsed Cloudflare partial/CNAME setup. Until claimed by a hostile party (requires passing Cloudflare's domain pre-validation, which currently fails) the practical takeover risk is lower, but the records break availability of those hosts and signal abandoned environments (many are UAT/payment-simulation names).

**Assessment note (v0.2).** Cloudflare requires validation of hostname ownership before a custom hostname can be attached to another account's zone, so the dangling target is not claimable by a third party. This is a broken-configuration / hygiene finding.

### F2 - `preprod.emiratesnbd.bank.in`

| Field | Value |
| --- | --- |
| Severity | **LOW** |
| Issue class | Cloudflare partial-zone dangling configuration (custom-hostname validation required; not claimable) |
| Dangling target | `preprod.emiratesnbd.bank.in.cdn.cloudflare.net` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer preprod.emiratesnbd.bank.in CNAME
preprod.emiratesnbd.bank.in. 300 IN  CNAME  preprod.emiratesnbd.bank.in.cdn.cloudflare.net.

$ dig preprod.emiratesnbd.bank.in   # -> status: NOERROR
# CNAME target does not resolve (NOERROR); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** *.cdn.cloudflare.net targets that do not resolve usually reflect an incomplete or lapsed Cloudflare partial/CNAME setup. Until claimed by a hostile party (requires passing Cloudflare's domain pre-validation, which currently fails) the practical takeover risk is lower, but the records break availability of those hosts and signal abandoned environments (many are UAT/payment-simulation names).

**Assessment note (v0.2).** Cloudflare requires validation of hostname ownership before a custom hostname can be attached to another account's zone, so the dangling target is not claimable by a third party. This is a broken-configuration / hygiene finding.

### F3 - `uat.emiratesnbd.bank.in`

| Field | Value |
| --- | --- |
| Severity | **LOW** |
| Issue class | Cloudflare partial-zone dangling configuration (custom-hostname validation required; not claimable) |
| Dangling target | `uat.emiratesnbd.bank.in.cdn.cloudflare.net` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer uat.emiratesnbd.bank.in CNAME
uat.emiratesnbd.bank.in. 300  IN  CNAME  uat.emiratesnbd.bank.in.cdn.cloudflare.net.

$ dig uat.emiratesnbd.bank.in   # -> status: NOERROR
# CNAME target does not resolve (NOERROR); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** *.cdn.cloudflare.net targets that do not resolve usually reflect an incomplete or lapsed Cloudflare partial/CNAME setup. Until claimed by a hostile party (requires passing Cloudflare's domain pre-validation, which currently fails) the practical takeover risk is lower, but the records break availability of those hosts and signal abandoned environments (many are UAT/payment-simulation names).

## 4. Recommended remediation

In order of urgency:

**Cloudflare partial-zone dangling configuration** *(fix within days)*

Re-complete the partial setup in Cloudflare for hosts still needed, or delete the records for decommissioned ones. Verify each resolves after change.

**Housekeeping (this month)**

- Inventory every CNAME under the bank's `.bank.in` zone and reconcile it against
  live cloud resources; repeat quarterly. The registry (IDRBT) can assist with a
  zone export on request.
- Route all public DNS changes through change control that requires the target's
  owner to confirm decommissioning *before* the record is edited.
- Consider CERT-In empanelled auditor validation of the cleanup, and add dangling-
  record checks to periodic VA cycles.

## 5. Impact statement

Trusted-subdomain phishing staging; internal-tool impersonation.

We have not attempted to register or claim any of the dangling targets, and we
will not do so. All findings were derived passively. We request acknowledgement
of this report and, where practicable, coordination with IDRBT so that similar
hygiene issues across other banks in the namespace can be addressed systematically.

---

*Generated by the Cashless Consumer bank-in audit pipeline. Draft only -
requires human review before sending. Evidence files: `evidence/takeover_candidates.json`,
`evidence/dns_sweep.jsonl`.*

**Assessment note (v0.2).** Cloudflare requires validation of hostname ownership before a custom hostname can be attached to another account's zone, so the dangling target is not claimable by a third party. This is a broken-configuration / hygiene finding.
