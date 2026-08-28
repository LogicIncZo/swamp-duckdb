# Responsible Disclosure: Dangling DNS Records on `DBS.bank.in` (14 records)

| | |
| --- | --- |
| To | incident@cert-in.org.in |
| From | Cashless Consumer <cashlessconsumerin@gmail.com> |
| Date | 26 August 2026 |
| Status | **DRAFT v0.2 - not sent** |
| Entity | DBS Bank India Ltd (dbs) |
| Highest severity | **LOW** |
| Records affected | 14 |
| Registry context | IDRBT `.bank.in` domain space (RBI-mandated) |

> **Drafting note (v0.2):** numbers and evidence auto-generated from the scan of
> 25-26 Aug 2026. Severities re-assessed 28 Aug 2026 after a claimability review
> (AWS ELB/ALB + Salesforce + F5 names are claimable; CloudFront, Global
> Accelerator, Cloudflare and Akamai edge targets require owner validation and
> are NOT claimable). Human review required before any dispatch.

---

## 1. Summary

Fifteen hostnames under dbs.bank.in carry CNAMEs into the bank's own <host>.cdn.cloudflare.net namespace but return no address records: aping-ideal, aping-ideal-uat, consumers-api, partners-api, uat-partners-api, uat-consumers-api, egov, egov-uat, gem, gem-rapid, gem-rapiduat, gem-uat, prod-in-enc, uat-enc. API-style names (consumers-api, partners-api) indicate decommissioned integration endpoints rather than marketing pages.

**Affected hostnames (14 records):** `aping-ideal-uat.dbs.bank.in`, `aping-ideal.dbs.bank.in`, `consumers-api.dbs.bank.in`, `egov-uat.dbs.bank.in`, `egov.dbs.bank.in`, `gem-rapiduat.dbs.bank.in` (+8 more).

We are reporting this to CERT-In under its vulnerability-note process because
the affected names sit inside the RBI-mandated `.bank.in` namespace operated by
IDRBT, and because successful exploitation would let an attacker serve active
content on a hostname users have been trained to trust as "a bank domain".
We request that CERT-In coordinate remediation with the bank (and IDRBT where
registry-level action is useful).

## 2. What we did

- Universe: the full published `dbs.bank.in` zone from the IDRBT-derived
  dataset released by the bank-in-domains project (release v2026.8.4, 23 Aug 2026).
- Every hostname was resolved via the bank's own authoritative DNS on 25 Aug 2026;
  records whose CNAME/A target no longer resolve were flagged as *dangling*.
- Each flagged record was then manually re-verified with independent DNS queries
  (repeated at generation time of this draft) to exclude transient failures,
  wildcard catches, and CDN geo-variation false positives.
- No probing, exploitation, or interaction with bank applications took place;
  all observations come from passive public DNS data plus HTTP HEAD checks.

## 3. Findings


### F1 - `aping-ideal-uat.dbs.bank.in`

| Field | Value |
| --- | --- |
| Severity | **LOW** |
| Issue class | Cloudflare partial-zone dangling configuration (custom-hostname validation required; not claimable) |
| Dangling target | `aping-ideal-uat.dbs.bank.in.cdn.cloudflare.net` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer aping-ideal-uat.dbs.bank.in CNAME
aping-ideal-uat.dbs.bank.in. 300 IN  CNAME  aping-ideal-uat.dbs.bank.in.cdn.cloudflare.net.

$ dig aping-ideal-uat.dbs.bank.in   # -> status: NOERROR
# CNAME target does not resolve (NOERROR); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** *.cdn.cloudflare.net targets that do not resolve usually reflect an incomplete or lapsed Cloudflare partial/CNAME setup. Until claimed by a hostile party (requires passing Cloudflare's domain pre-validation, which currently fails) the practical takeover risk is lower, but the records break availability of those hosts and signal abandoned environments (many are UAT/payment-simulation names).

**Assessment note (v0.2).** Cloudflare requires validation of hostname ownership before a custom hostname can be attached to another account's zone, so the dangling target is not claimable by a third party. This is a broken-configuration / hygiene finding.

### F2 - `aping-ideal.dbs.bank.in`

| Field | Value |
| --- | --- |
| Severity | **LOW** |
| Issue class | Cloudflare partial-zone dangling configuration (custom-hostname validation required; not claimable) |
| Dangling target | `aping-ideal.dbs.bank.in.cdn.cloudflare.net` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer aping-ideal.dbs.bank.in CNAME
aping-ideal.dbs.bank.in. 300  IN  CNAME  aping-ideal.dbs.bank.in.cdn.cloudflare.net.

$ dig aping-ideal.dbs.bank.in   # -> status: NOERROR
# CNAME target does not resolve (NOERROR); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** *.cdn.cloudflare.net targets that do not resolve usually reflect an incomplete or lapsed Cloudflare partial/CNAME setup. Until claimed by a hostile party (requires passing Cloudflare's domain pre-validation, which currently fails) the practical takeover risk is lower, but the records break availability of those hosts and signal abandoned environments (many are UAT/payment-simulation names).

**Assessment note (v0.2).** Cloudflare requires validation of hostname ownership before a custom hostname can be attached to another account's zone, so the dangling target is not claimable by a third party. This is a broken-configuration / hygiene finding.

### F3 - `consumers-api.dbs.bank.in`

| Field | Value |
| --- | --- |
| Severity | **LOW** |
| Issue class | Cloudflare partial-zone dangling configuration (custom-hostname validation required; not claimable) |
| Dangling target | `consumers-api.dbs.bank.in.cdn.cloudflare.net` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer consumers-api.dbs.bank.in CNAME
consumers-api.dbs.bank.in. 300  IN  CNAME  consumers-api.dbs.bank.in.cdn.cloudflare.net.

$ dig consumers-api.dbs.bank.in   # -> status: NOERROR
# CNAME target does not resolve (NOERROR); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** *.cdn.cloudflare.net targets that do not resolve usually reflect an incomplete or lapsed Cloudflare partial/CNAME setup. Until claimed by a hostile party (requires passing Cloudflare's domain pre-validation, which currently fails) the practical takeover risk is lower, but the records break availability of those hosts and signal abandoned environments (many are UAT/payment-simulation names).

**Assessment note (v0.2).** Cloudflare requires validation of hostname ownership before a custom hostname can be attached to another account's zone, so the dangling target is not claimable by a third party. This is a broken-configuration / hygiene finding.

### F4 - `egov-uat.dbs.bank.in`

| Field | Value |
| --- | --- |
| Severity | **LOW** |
| Issue class | Cloudflare partial-zone dangling configuration (custom-hostname validation required; not claimable) |
| Dangling target | `egov-uat.dbs.bank.in.cdn.cloudflare.net` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer egov-uat.dbs.bank.in CNAME
egov-uat.dbs.bank.in.  300  IN  CNAME  egov-uat.dbs.bank.in.cdn.cloudflare.net.

$ dig egov-uat.dbs.bank.in   # -> status: NOERROR
# CNAME target does not resolve (NOERROR); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** *.cdn.cloudflare.net targets that do not resolve usually reflect an incomplete or lapsed Cloudflare partial/CNAME setup. Until claimed by a hostile party (requires passing Cloudflare's domain pre-validation, which currently fails) the practical takeover risk is lower, but the records break availability of those hosts and signal abandoned environments (many are UAT/payment-simulation names).

**Assessment note (v0.2).** Cloudflare requires validation of hostname ownership before a custom hostname can be attached to another account's zone, so the dangling target is not claimable by a third party. This is a broken-configuration / hygiene finding.

### F5 - `egov.dbs.bank.in`

| Field | Value |
| --- | --- |
| Severity | **LOW** |
| Issue class | Cloudflare partial-zone dangling configuration (custom-hostname validation required; not claimable) |
| Dangling target | `egov.dbs.bank.in.cdn.cloudflare.net` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer egov.dbs.bank.in CNAME
egov.dbs.bank.in.  300  IN  CNAME  egov.dbs.bank.in.cdn.cloudflare.net.

$ dig egov.dbs.bank.in   # -> status: NOERROR
# CNAME target does not resolve (NOERROR); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** *.cdn.cloudflare.net targets that do not resolve usually reflect an incomplete or lapsed Cloudflare partial/CNAME setup. Until claimed by a hostile party (requires passing Cloudflare's domain pre-validation, which currently fails) the practical takeover risk is lower, but the records break availability of those hosts and signal abandoned environments (many are UAT/payment-simulation names).

**Assessment note (v0.2).** Cloudflare requires validation of hostname ownership before a custom hostname can be attached to another account's zone, so the dangling target is not claimable by a third party. This is a broken-configuration / hygiene finding.

### F6 - `gem-rapiduat.dbs.bank.in`

| Field | Value |
| --- | --- |
| Severity | **LOW** |
| Issue class | Cloudflare partial-zone dangling configuration (custom-hostname validation required; not claimable) |
| Dangling target | `gem-rapiduat.dbs.bank.in.cdn.cloudflare.net` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer gem-rapiduat.dbs.bank.in CNAME
gem-rapiduat.dbs.bank.in. 22  IN  CNAME  gem-rapiduat.dbs.bank.in.cdn.cloudflare.net.

$ dig gem-rapiduat.dbs.bank.in   # -> status: NOERROR
# CNAME target does not resolve (NOERROR); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** *.cdn.cloudflare.net targets that do not resolve usually reflect an incomplete or lapsed Cloudflare partial/CNAME setup. Until claimed by a hostile party (requires passing Cloudflare's domain pre-validation, which currently fails) the practical takeover risk is lower, but the records break availability of those hosts and signal abandoned environments (many are UAT/payment-simulation names).

**Assessment note (v0.2).** Cloudflare requires validation of hostname ownership before a custom hostname can be attached to another account's zone, so the dangling target is not claimable by a third party. This is a broken-configuration / hygiene finding.

### F7 - `gem.dbs.bank.in`

| Field | Value |
| --- | --- |
| Severity | **LOW** |
| Issue class | Cloudflare partial-zone dangling configuration (custom-hostname validation required; not claimable) |
| Dangling target | `gem.dbs.bank.in.cdn.cloudflare.net` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer gem.dbs.bank.in CNAME
gem.dbs.bank.in.  22  IN  CNAME  gem.dbs.bank.in.cdn.cloudflare.net.

$ dig gem.dbs.bank.in   # -> status: NOERROR
# CNAME target does not resolve (NOERROR); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** *.cdn.cloudflare.net targets that do not resolve usually reflect an incomplete or lapsed Cloudflare partial/CNAME setup. Until claimed by a hostile party (requires passing Cloudflare's domain pre-validation, which currently fails) the practical takeover risk is lower, but the records break availability of those hosts and signal abandoned environments (many are UAT/payment-simulation names).

**Assessment note (v0.2).** Cloudflare requires validation of hostname ownership before a custom hostname can be attached to another account's zone, so the dangling target is not claimable by a third party. This is a broken-configuration / hygiene finding.

### F8 - `gem-rapid.dbs.bank.in`

| Field | Value |
| --- | --- |
| Severity | **LOW** |
| Issue class | Cloudflare partial-zone dangling configuration (custom-hostname validation required; not claimable) |
| Dangling target | `gem-rapid.dbs.bank.in.cdn.cloudflare.net` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer gem-rapid.dbs.bank.in CNAME
gem-rapid.dbs.bank.in.  22  IN  CNAME  gem-rapid.dbs.bank.in.cdn.cloudflare.net.

$ dig gem-rapid.dbs.bank.in   # -> status: NOERROR
# CNAME target does not resolve (NOERROR); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** *.cdn.cloudflare.net targets that do not resolve usually reflect an incomplete or lapsed Cloudflare partial/CNAME setup. Until claimed by a hostile party (requires passing Cloudflare's domain pre-validation, which currently fails) the practical takeover risk is lower, but the records break availability of those hosts and signal abandoned environments (many are UAT/payment-simulation names).

**Assessment note (v0.2).** Cloudflare requires validation of hostname ownership before a custom hostname can be attached to another account's zone, so the dangling target is not claimable by a third party. This is a broken-configuration / hygiene finding.

### F9 - `gem-uat.dbs.bank.in`

| Field | Value |
| --- | --- |
| Severity | **LOW** |
| Issue class | Cloudflare partial-zone dangling configuration (custom-hostname validation required; not claimable) |
| Dangling target | `gem-uat.dbs.bank.in.cdn.cloudflare.net` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer gem-uat.dbs.bank.in CNAME
gem-uat.dbs.bank.in.  22  IN  CNAME  gem-uat.dbs.bank.in.cdn.cloudflare.net.

$ dig gem-uat.dbs.bank.in   # -> status: NOERROR
# CNAME target does not resolve (NOERROR); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** *.cdn.cloudflare.net targets that do not resolve usually reflect an incomplete or lapsed Cloudflare partial/CNAME setup. Until claimed by a hostile party (requires passing Cloudflare's domain pre-validation, which currently fails) the practical takeover risk is lower, but the records break availability of those hosts and signal abandoned environments (many are UAT/payment-simulation names).

**Assessment note (v0.2).** Cloudflare requires validation of hostname ownership before a custom hostname can be attached to another account's zone, so the dangling target is not claimable by a third party. This is a broken-configuration / hygiene finding.

### F10 - `partners-api.dbs.bank.in`

| Field | Value |
| --- | --- |
| Severity | **LOW** |
| Issue class | Cloudflare partial-zone dangling configuration (custom-hostname validation required; not claimable) |
| Dangling target | `partners-api.dbs.bank.in.cdn.cloudflare.net` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer partners-api.dbs.bank.in CNAME
partners-api.dbs.bank.in. 300  IN  CNAME  partners-api.dbs.bank.in.cdn.cloudflare.net.

$ dig partners-api.dbs.bank.in   # -> status: NOERROR
# CNAME target does not resolve (NOERROR); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** *.cdn.cloudflare.net targets that do not resolve usually reflect an incomplete or lapsed Cloudflare partial/CNAME setup. Until claimed by a hostile party (requires passing Cloudflare's domain pre-validation, which currently fails) the practical takeover risk is lower, but the records break availability of those hosts and signal abandoned environments (many are UAT/payment-simulation names).

**Assessment note (v0.2).** Cloudflare requires validation of hostname ownership before a custom hostname can be attached to another account's zone, so the dangling target is not claimable by a third party. This is a broken-configuration / hygiene finding.

### F11 - `prod-in-enc.dbs.bank.in`

| Field | Value |
| --- | --- |
| Severity | **LOW** |
| Issue class | Cloudflare partial-zone dangling configuration (custom-hostname validation required; not claimable) |
| Dangling target | `prod-in-enc.dbs.bank.in.cdn.cloudflare.net` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer prod-in-enc.dbs.bank.in CNAME
prod-in-enc.dbs.bank.in. 300  IN  CNAME  prod-in-enc.dbs.bank.in.cdn.cloudflare.net.

$ dig prod-in-enc.dbs.bank.in   # -> status: NOERROR
# CNAME target does not resolve (NOERROR); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** *.cdn.cloudflare.net targets that do not resolve usually reflect an incomplete or lapsed Cloudflare partial/CNAME setup. Until claimed by a hostile party (requires passing Cloudflare's domain pre-validation, which currently fails) the practical takeover risk is lower, but the records break availability of those hosts and signal abandoned environments (many are UAT/payment-simulation names).

**Assessment note (v0.2).** Cloudflare requires validation of hostname ownership before a custom hostname can be attached to another account's zone, so the dangling target is not claimable by a third party. This is a broken-configuration / hygiene finding.

### F12 - `uat-consumers-api.dbs.bank.in`

| Field | Value |
| --- | --- |
| Severity | **LOW** |
| Issue class | Cloudflare partial-zone dangling configuration (custom-hostname validation required; not claimable) |
| Dangling target | `uat-consumers-api.dbs.bank.in.cdn.cloudflare.net` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer uat-consumers-api.dbs.bank.in CNAME
uat-consumers-api.dbs.bank.in. 300 IN  CNAME  uat-consumers-api.dbs.bank.in.cdn.cloudflare.net.

$ dig uat-consumers-api.dbs.bank.in   # -> status: NOERROR
# CNAME target does not resolve (NOERROR); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** *.cdn.cloudflare.net targets that do not resolve usually reflect an incomplete or lapsed Cloudflare partial/CNAME setup. Until claimed by a hostile party (requires passing Cloudflare's domain pre-validation, which currently fails) the practical takeover risk is lower, but the records break availability of those hosts and signal abandoned environments (many are UAT/payment-simulation names).

**Assessment note (v0.2).** Cloudflare requires validation of hostname ownership before a custom hostname can be attached to another account's zone, so the dangling target is not claimable by a third party. This is a broken-configuration / hygiene finding.

### F13 - `uat-enc.dbs.bank.in`

| Field | Value |
| --- | --- |
| Severity | **LOW** |
| Issue class | Cloudflare partial-zone dangling configuration (custom-hostname validation required; not claimable) |
| Dangling target | `uat-enc.dbs.bank.in.cdn.cloudflare.net` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer uat-enc.dbs.bank.in CNAME
uat-enc.dbs.bank.in.  300  IN  CNAME  uat-enc.dbs.bank.in.cdn.cloudflare.net.

$ dig uat-enc.dbs.bank.in   # -> status: NOERROR
# CNAME target does not resolve (NOERROR); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** *.cdn.cloudflare.net targets that do not resolve usually reflect an incomplete or lapsed Cloudflare partial/CNAME setup. Until claimed by a hostile party (requires passing Cloudflare's domain pre-validation, which currently fails) the practical takeover risk is lower, but the records break availability of those hosts and signal abandoned environments (many are UAT/payment-simulation names).

**Assessment note (v0.2).** Cloudflare requires validation of hostname ownership before a custom hostname can be attached to another account's zone, so the dangling target is not claimable by a third party. This is a broken-configuration / hygiene finding.

### F14 - `uat-partners-api.dbs.bank.in`

| Field | Value |
| --- | --- |
| Severity | **LOW** |
| Issue class | Cloudflare partial-zone dangling configuration (custom-hostname validation required; not claimable) |
| Dangling target | `uat-partners-api.dbs.bank.in.cdn.cloudflare.net` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer uat-partners-api.dbs.bank.in CNAME
uat-partners-api.dbs.bank.in. 300 IN  CNAME  uat-partners-api.dbs.bank.in.cdn.cloudflare.net.

$ dig uat-partners-api.dbs.bank.in   # -> status: NOERROR
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

Full HTTPS control of API-named hosts inside dbs.bank.in; credential-harvesting pages indistinguishable from genuine domains; cookie-scope abuse.

We have not attempted to register or claim any of the dangling targets, and we
will not do so. All findings were derived passively. We request acknowledgement
of this report and, where practicable, coordination with IDRBT so that similar
hygiene issues across other banks in the namespace can be addressed systematically.

---

*Generated by the Cashless Consumer bank-in audit pipeline. Draft only -
requires human review before sending. Evidence files: `evidence/takeover_candidates.json`,
`evidence/dns_sweep.jsonl`.*

**Assessment note (v0.2).** Cloudflare requires validation of hostname ownership before a custom hostname can be attached to another account's zone, so the dangling target is not claimable by a third party. This is a broken-configuration / hygiene finding.
