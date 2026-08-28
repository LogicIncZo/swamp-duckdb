# Responsible Disclosure: Dangling DNS Records on `UNIONBANKOFINDIA.bank.in` (5 records)

| | |
| --- | --- |
| To | incident@cert-in.org.in |
| From | Cashless Consumer <cashlessconsumerin@gmail.com> |
| Date | 26 August 2026 |
| Status | **DRAFT v0.2 - not sent** |
| Entity | Union Bank of India (unionbankofindia) |
| Highest severity | **MEDIUM** |
| Records affected | 5 |
| Registry context | IDRBT `.bank.in` domain space (RBI-mandated) |

> **Drafting note (v0.2):** numbers and evidence auto-generated from the scan of
> 25-26 Aug 2026. Severities re-assessed 28 Aug 2026 after a claimability review
> (AWS ELB/ALB + Salesforce + F5 names are claimable; CloudFront, Global
> Accelerator, Cloudflare and Akamai edge targets require owner validation and
> are NOT claimable). Human review required before any dispatch.

---

## 1. Summary

Six hostnames CNAME into the bank's own edgekey.net tenant but the edge configurations no longer answer: apibanking, cmsdbp, developer, msmelow, retail. apibanking is an API-pattern name; cmsdbp suggests a content-management deployment.

**Affected hostnames (5 records):** `apibanking.unionbankofindia.bank.in`, `cmsdbp.unionbankofindia.bank.in`, `developer.unionbankofindia.bank.in`, `msmelow.unionbankofindia.bank.in`, `retail.unionbankofindia.bank.in`.

We are reporting this to CERT-In under its vulnerability-note process because
the affected names sit inside the RBI-mandated `.bank.in` namespace operated by
IDRBT, and because successful exploitation would let an attacker serve active
content on a hostname users have been trained to trust as "a bank domain".
We request that CERT-In coordinate remediation with the bank (and IDRBT where
registry-level action is useful).

## 2. What we did

- Universe: the full published `unionbankofindia.bank.in` zone from the IDRBT-derived
  dataset released by the bank-in-domains project (release v2026.8.4, 23 Aug 2026).
- Every hostname was resolved via the bank's own authoritative DNS on 25 Aug 2026;
  records whose CNAME/A target no longer resolve were flagged as *dangling*.
- Each flagged record was then manually re-verified with independent DNS queries
  (repeated at generation time of this draft) to exclude transient failures,
  wildcard catches, and CDN geo-variation false positives.
- No probing, exploitation, or interaction with bank applications took place;
  all observations come from passive public DNS data plus HTTP HEAD checks.

## 3. Findings


### F1 - `apibanking.unionbankofindia.bank.in`

| Field | Value |
| --- | --- |
| Severity | **MEDIUM** |
| Issue class | Akamai edge hostname dangling CNAME (ownership-validated; not claimable without contract) |
| Dangling target | `apibanking.unionbankofindia.bank.in.edgekey.net` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer apibanking.unionbankofindia.bank.in CNAME
apibanking.unionbankofindia.bank.in. 3600 IN CNAME apibanking.unionbankofindia.bank.in.edgekey.net.

$ dig apibanking.unionbankofindia.bank.in   # -> status: NXDOMAIN
# CNAME target does not resolve (NXDOMAIN); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** edgekey.net hostnames are Akamai-managed delivery entries tied to a property contract. If the bank's Akamai contract or property lapsed, the same edge hostname can be re-assigned to another Akamai customer, letting them serve content under the bank's subdomain after standard domain-validation steps. Ownership status must be confirmed with the CDN before exploitation is ruled out.

**Assessment note (v0.2).** Akamai edge hostnames are provisioned only under an Akamai contract with ownership re-verification, so a third party cannot silently claim this target. Impact is broken service; hostile takeover is unlikely.

### F2 - `cmsdbp.unionbankofindia.bank.in`

| Field | Value |
| --- | --- |
| Severity | **MEDIUM** |
| Issue class | Akamai edge hostname dangling CNAME (ownership-validated; not claimable without contract) |
| Dangling target | `cmsdbp.unionbankofindia.bank.in.edgekey.net` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer cmsdbp.unionbankofindia.bank.in CNAME
cmsdbp.unionbankofindia.bank.in. 3600 IN CNAME  cmsdbp.unionbankofindia.bank.in.edgekey.net.

$ dig cmsdbp.unionbankofindia.bank.in   # -> status: NXDOMAIN
# CNAME target does not resolve (NXDOMAIN); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** edgekey.net hostnames are Akamai-managed delivery entries tied to a property contract. If the bank's Akamai contract or property lapsed, the same edge hostname can be re-assigned to another Akamai customer, letting them serve content under the bank's subdomain after standard domain-validation steps. Ownership status must be confirmed with the CDN before exploitation is ruled out.

**Assessment note (v0.2).** Akamai edge hostnames are provisioned only under an Akamai contract with ownership re-verification, so a third party cannot silently claim this target. Impact is broken service; hostile takeover is unlikely.

### F3 - `developer.unionbankofindia.bank.in`

| Field | Value |
| --- | --- |
| Severity | **MEDIUM** |
| Issue class | Akamai edge hostname dangling CNAME (ownership-validated; not claimable without contract) |
| Dangling target | `developer.unionbankofindia.bank.in.edgekey.net` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer developer.unionbankofindia.bank.in CNAME
developer.unionbankofindia.bank.in. 3600 IN CNAME developer.unionbankofindia.bank.in.edgekey.net.

$ dig developer.unionbankofindia.bank.in   # -> status: NXDOMAIN
# CNAME target does not resolve (NXDOMAIN); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** edgekey.net hostnames are Akamai-managed delivery entries tied to a property contract. If the bank's Akamai contract or property lapsed, the same edge hostname can be re-assigned to another Akamai customer, letting them serve content under the bank's subdomain after standard domain-validation steps. Ownership status must be confirmed with the CDN before exploitation is ruled out.

**Assessment note (v0.2).** Akamai edge hostnames are provisioned only under an Akamai contract with ownership re-verification, so a third party cannot silently claim this target. Impact is broken service; hostile takeover is unlikely.

### F4 - `msmelow.unionbankofindia.bank.in`

| Field | Value |
| --- | --- |
| Severity | **MEDIUM** |
| Issue class | Akamai edge hostname dangling CNAME (ownership-validated; not claimable without contract) |
| Dangling target | `msmselow.unionbankofindia.bank.in.edgekey.net` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer msmelow.unionbankofindia.bank.in CNAME
msmelow.unionbankofindia.bank.in. 3600 IN CNAME  msmselow.unionbankofindia.bank.in.edgekey.net.

$ dig msmelow.unionbankofindia.bank.in   # -> status: NXDOMAIN
# CNAME target does not resolve (NXDOMAIN); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** edgekey.net hostnames are Akamai-managed delivery entries tied to a property contract. If the bank's Akamai contract or property lapsed, the same edge hostname can be re-assigned to another Akamai customer, letting them serve content under the bank's subdomain after standard domain-validation steps. Ownership status must be confirmed with the CDN before exploitation is ruled out.

**Assessment note (v0.2).** Akamai edge hostnames are provisioned only under an Akamai contract with ownership re-verification, so a third party cannot silently claim this target. Impact is broken service; hostile takeover is unlikely.

### F5 - `retail.unionbankofindia.bank.in`

| Field | Value |
| --- | --- |
| Severity | **MEDIUM** |
| Issue class | Akamai edge hostname dangling CNAME (ownership-validated; not claimable without contract) |
| Dangling target | `retail.unionbankofindia.bank.in.edgekey.net` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer retail.unionbankofindia.bank.in CNAME
retail.unionbankofindia.bank.in. 3600 IN CNAME  retail.unionbankofindia.bank.in.edgekey.net.

$ dig retail.unionbankofindia.bank.in   # -> status: NXDOMAIN
# CNAME target does not resolve (NXDOMAIN); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** edgekey.net hostnames are Akamai-managed delivery entries tied to a property contract. If the bank's Akamai contract or property lapsed, the same edge hostname can be re-assigned to another Akamai customer, letting them serve content under the bank's subdomain after standard domain-validation steps. Ownership status must be confirmed with the CDN before exploitation is ruled out.

## 4. Recommended remediation

In order of urgency:

**Akamai edgekey.net dangling CNAME** *(fix within days)*

Confirm property status with the bank's Akamai account team. Remove records for retired properties; for active ones, fix the enrollment so edgekey resolves. Request Akamai lock the edge hostnames to the bank's contract.

**Housekeeping (this month)**

- Inventory every CNAME under the bank's `.bank.in` zone and reconcile it against
  live cloud resources; repeat quarterly. The registry (IDRBT) can assist with a
  zone export on request.
- Route all public DNS changes through change control that requires the target's
  owner to confirm decommissioning *before* the record is edited.
- Consider CERT-In empanelled auditor validation of the cleanup, and add dangling-
  record checks to periodic VA cycles.

## 5. Impact statement

HTTPS content control under unionbankofindia.bank.in; API traffic interception for legacy integrations.

We have not attempted to register or claim any of the dangling targets, and we
will not do so. All findings were derived passively. We request acknowledgement
of this report and, where practicable, coordination with IDRBT so that similar
hygiene issues across other banks in the namespace can be addressed systematically.

---

*Generated by the Cashless Consumer bank-in audit pipeline. Draft only -
requires human review before sending. Evidence files: `evidence/takeover_candidates.json`,
`evidence/dns_sweep.jsonl`.*

**Assessment note (v0.2).** Akamai edge hostnames are provisioned only under an Akamai contract with ownership re-verification, so a third party cannot silently claim this target. Impact is broken service; hostile takeover is unlikely.
