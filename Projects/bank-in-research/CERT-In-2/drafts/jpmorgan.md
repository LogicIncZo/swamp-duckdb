# Responsible Disclosure: Dangling DNS Records on `JPMORGAN.bank.in` (2 records)

| | |
| --- | --- |
| To | incident@cert-in.org.in |
| From | Cashless Consumer <cashlessconsumerin@gmail.com> |
| Date | 26 August 2026 |
| Status | **DRAFT v0.2 - not sent** |
| Entity | J.P. Morgan (JPMorgan Chase India operations) (jpmorgan) |
| Highest severity | **MEDIUM** |
| Records affected | 2 |
| Registry context | IDRBT `.bank.in` domain space (RBI-mandated) |

> **Drafting note (v0.2):** numbers and evidence auto-generated from the scan of
> 25-26 Aug 2026. Severities re-assessed 28 Aug 2026 after a claimability review
> (AWS ELB/ALB + Salesforce + F5 names are claimable; CloudFront, Global
> Accelerator, Cloudflare and Akamai edge targets require owner validation and
> are NOT claimable). Human review required before any dispatch.

---

## 1. Summary

login-sit.test.jpmorgan.bank.in -> *.edgekey.net (dangling) and wca-u02.jpmorgan.bank.in -> wca-u02.intl.gslbjpmchase.com, an intra-corporate global server-load-balancer name leaking through public DNS.

**Affected hostnames (2 records):** `login-sit.test.jpmorgan.bank.in`, `wca-u02.jpmorgan.bank.in`.

We are reporting this to CERT-In under its vulnerability-note process because
the affected names sit inside the RBI-mandated `.bank.in` namespace operated by
IDRBT, and because successful exploitation would let an attacker serve active
content on a hostname users have been trained to trust as "a bank domain".
We request that CERT-In coordinate remediation with the bank (and IDRBT where
registry-level action is useful).

## 2. What we did

- Universe: the full published `jpmorgan.bank.in` zone from the IDRBT-derived
  dataset released by the bank-in-domains project (release v2026.8.4, 23 Aug 2026).
- Every hostname was resolved via the bank's own authoritative DNS on 25 Aug 2026;
  records whose CNAME/A target no longer resolve were flagged as *dangling*.
- Each flagged record was then manually re-verified with independent DNS queries
  (repeated at generation time of this draft) to exclude transient failures,
  wildcard catches, and CDN geo-variation false positives.
- No probing, exploitation, or interaction with bank applications took place;
  all observations come from passive public DNS data plus HTTP HEAD checks.

## 3. Findings


### F1 - `login-sit.test.jpmorgan.bank.in`

| Field | Value |
| --- | --- |
| Severity | **MEDIUM** |
| Issue class | Akamai edge hostname dangling CNAME (ownership-validated; not claimable without contract) |
| Dangling target | `login-sit.test.jpmorgan.bank.in.edgekey.net` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer login-sit.test.jpmorgan.bank.in CNAME
login-sit.test.jpmorgan.bank.in. 3515 IN CNAME  login-sit.test.jpmorgan.bank.in.edgekey.net.

$ dig login-sit.test.jpmorgan.bank.in   # -> status: NXDOMAIN
# CNAME target does not resolve (NXDOMAIN); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** edgekey.net hostnames are Akamai-managed delivery entries tied to a property contract. If the bank's Akamai contract or property lapsed, the same edge hostname can be re-assigned to another Akamai customer, letting them serve content under the bank's subdomain after standard domain-validation steps. Ownership status must be confirmed with the CDN before exploitation is ruled out.

**Assessment note (v0.2).** Akamai edge hostnames are provisioned only under an Akamai contract with ownership re-verification, so a third party cannot silently claim this target. Impact is broken service; hostile takeover is unlikely.

### F2 - `wca-u02.jpmorgan.bank.in`

| Field | Value |
| --- | --- |
| Severity | **MEDIUM** |
| Issue class | Dangling CNAME (miscellaneous target) |
| Dangling target | `wca-u02.intl.gslbjpmchase.com` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer wca-u02.jpmorgan.bank.in CNAME
wca-u02.jpmorgan.bank.in. 3600  IN  CNAME  wca-u02.intl.gslbjpmchase.com.

$ dig wca-u02.jpmorgan.bank.in   # -> status: NOERROR
# CNAME target does not resolve (NOERROR); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** The record points at a third-party name that no longer resolves or is misconfigured. Depending on the target platform this may permit content injection at the bank's subdomain or simply breaks the service. Each case needs individual triage.

## 4. Recommended remediation

In order of urgency:

**Dangling CNAME (miscellaneous target)** *(fix within days)*

Identify the original vendor/purpose per record; delete or repair accordingly. Where the target was a SaaS vanity host, re-validate ownership before restoring.

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

Login-SIT hostname is credential-page-shaped - high phishing value despite test scope.

We have not attempted to register or claim any of the dangling targets, and we
will not do so. All findings were derived passively. We request acknowledgement
of this report and, where practicable, coordination with IDRBT so that similar
hygiene issues across other banks in the namespace can be addressed systematically.

---

*Generated by the Cashless Consumer bank-in audit pipeline. Draft only -
requires human review before sending. Evidence files: `evidence/takeover_candidates.json`,
`evidence/dns_sweep.jsonl`.*

**Assessment note (v0.2).** Claimability of this target type could not be established; treat as broken-service finding pending vendor-specific triage.
