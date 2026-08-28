# Responsible Disclosure: Dangling DNS Records on `HDFC.bank.in` (8 records)

| | |
| --- | --- |
| To | incident@cert-in.org.in |
| From | Cashless Consumer <cashlessconsumerin@gmail.com> |
| Date | 26 August 2026 |
| Status | **DRAFT v0.2 - not sent** |
| Entity | HDFC Bank Ltd (hdfc) |
| Highest severity | **HIGH** |
| Records affected | 8 |
| Registry context | IDRBT `.bank.in` domain space (RBI-mandated) |

> **Drafting note (v0.2):** numbers and evidence auto-generated from the scan of
> 25-26 Aug 2026. Severities re-assessed 28 Aug 2026 after a claimability review
> (AWS ELB/ALB + Salesforce + F5 names are claimable; CloudFront, Global
> Accelerator, Cloudflare and Akamai edge targets require owner validation and
> are NOT claimable). Human review required before any dispatch.

---

## 1. Summary

Seven hostnames across production and UAT zones: emailers.hdfc.bank.in, asset.hdfc.bank.in and translation.hdfc.bank.in in production; five in the UAT zone (corporateservices, emailersut, hdfcbl, scmuat1 on F5 Distributed Cloud; mybusiness.uatdigital on an AWS ALB named nwinfra-inbound-uat-bizexp-alb). Volterra LB identifiers belong to a multi-tenant namespace; deleted load balancers are re-creatable.

**Affected hostnames (8 records):** `asset.hdfc.bank.in`, `corporateservices.hdfcuat.bank.in`, `emailers.hdfc.bank.in`, `emailersut.hdfcuat.bank.in`, `hdfcbl.hdfcuat.bank.in`, `mybusiness.uatdigital.hdfcuat.bank.in` (+2 more).

We are reporting this to CERT-In under its vulnerability-note process because
the affected names sit inside the RBI-mandated `.bank.in` namespace operated by
IDRBT, and because successful exploitation would let an attacker serve active
content on a hostname users have been trained to trust as "a bank domain".
We request that CERT-In coordinate remediation with the bank (and IDRBT where
registry-level action is useful).

## 2. What we did

- Universe: the full published `hdfc.bank.in` zone from the IDRBT-derived
  dataset released by the bank-in-domains project (release v2026.8.4, 23 Aug 2026).
- Every hostname was resolved via the bank's own authoritative DNS on 25 Aug 2026;
  records whose CNAME/A target no longer resolve were flagged as *dangling*.
- Each flagged record was then manually re-verified with independent DNS queries
  (repeated at generation time of this draft) to exclude transient failures,
  wildcard catches, and CDN geo-variation false positives.
- No probing, exploitation, or interaction with bank applications took place;
  all observations come from passive public DNS data plus HTTP HEAD checks.

## 3. Findings


### F1 - `asset.hdfc.bank.in`

| Field | Value |
| --- | --- |
| Severity | **LOW** |
| Issue class | CloudFront dangling CNAME (alias attach requires domain validation; not claimable) |
| Dangling target | `d1wsttm9l9x0m5.cloudfront.net` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer asset.hdfc.bank.in CNAME
asset.hdfc.bank.in.  300  IN  CNAME  d1wsttm9l9x0m5.cloudfront.net.

$ dig asset.hdfc.bank.in   # -> status: NOERROR
# CNAME target does not resolve (NOERROR); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** The record points at a third-party name that no longer resolves or is misconfigured. Depending on the target platform this may permit content injection at the bank's subdomain or simply breaks the service. Each case needs individual triage.

**Assessment note (v0.2).** CloudFront distributions cannot be claimed by third parties: attaching a custom hostname to a distribution requires a certificate validated against that hostname's DNS, which only the domain owner can complete. Impact here is broken/degraded service, not hostile takeover.

### F2 - `corporateservices.hdfcuat.bank.in`

| Field | Value |
| --- | --- |
| Severity | **HIGH** |
| Issue class | F5 Distributed Cloud (Volterra) deleted load balancer (name claimable) |
| Dangling target | `ves-io-f659058e-f5e6-481b-aa08-9261dd4fe0e2.ac.vh.ves.io` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer corporateservices.hdfcuat.bank.in CNAME
corporateservices.hdfcuat.bank.in. 300 IN CNAME  ves-io-f659058e-f5e6-481b-aa08-9261dd4fe0e2.ac.vh.ves.io.

$ dig corporateservices.hdfcuat.bank.in   # -> status: NXDOMAIN
# CNAME target does not resolve (NXDOMAIN); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** ves.io load-balancer addresses are globally reusable: when a Distributed Cloud LB is deleted its name can be recreated by another tenant. A claimant receives traffic (including TLS, depending on cert state) addressed to the bank's hostname and can proxy or phish it. Several of these names relate to emailers and Video-KYC flows, raising phishing value.

**Assessment note (v0.2).** Claimability of this target type could not be established; treat as broken-service finding pending vendor-specific triage.

### F3 - `emailers.hdfc.bank.in`

| Field | Value |
| --- | --- |
| Severity | **HIGH** |
| Issue class | F5 Distributed Cloud (Volterra) deleted load balancer (name claimable) |
| Dangling target | `ves-io-2e548570-0e80-47f1-94f1-2df68a7ebb79.ac.vh.ves.io` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer emailers.hdfc.bank.in CNAME
emailers.hdfc.bank.in.  300  IN  CNAME  ves-io-2e548570-0e80-47f1-94f1-2df68a7ebb79.ac.vh.ves.io.

$ dig emailers.hdfc.bank.in   # -> status: NXDOMAIN
# CNAME target does not resolve (NXDOMAIN); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** ves.io load-balancer addresses are globally reusable: when a Distributed Cloud LB is deleted its name can be recreated by another tenant. A claimant receives traffic (including TLS, depending on cert state) addressed to the bank's hostname and can proxy or phish it. Several of these names relate to emailers and Video-KYC flows, raising phishing value.

**Assessment note (v0.2).** Claimability of this target type could not be established; treat as broken-service finding pending vendor-specific triage.

### F4 - `emailersut.hdfcuat.bank.in`

| Field | Value |
| --- | --- |
| Severity | **HIGH** |
| Issue class | F5 Distributed Cloud (Volterra) deleted load balancer (name claimable) |
| Dangling target | `ves-io-c2f9f17b-4e79-4c17-aec4-5ddc41cb5dfe.ac.vh.ves.io` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer emailersut.hdfcuat.bank.in CNAME
emailersut.hdfcuat.bank.in. 300  IN  CNAME  ves-io-c2f9f17b-4e79-4c17-aec4-5ddc41cb5dfe.ac.vh.ves.io.

$ dig emailersut.hdfcuat.bank.in   # -> status: NXDOMAIN
# CNAME target does not resolve (NXDOMAIN); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** ves.io load-balancer addresses are globally reusable: when a Distributed Cloud LB is deleted its name can be recreated by another tenant. A claimant receives traffic (including TLS, depending on cert state) addressed to the bank's hostname and can proxy or phish it. Several of these names relate to emailers and Video-KYC flows, raising phishing value.

**Assessment note (v0.2).** Claimability of this target type could not be established; treat as broken-service finding pending vendor-specific triage.

### F5 - `hdfcbl.hdfcuat.bank.in`

| Field | Value |
| --- | --- |
| Severity | **HIGH** |
| Issue class | F5 Distributed Cloud (Volterra) deleted load balancer (name claimable) |
| Dangling target | `ves-io-784c0448-c853-4bd0-a484-3a7a9c73ec83.ac.vh.ves.io` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer hdfcbl.hdfcuat.bank.in CNAME
hdfcbl.hdfcuat.bank.in.  28  IN  CNAME  ves-io-784c0448-c853-4bd0-a484-3a7a9c73ec83.ac.vh.ves.io.

$ dig hdfcbl.hdfcuat.bank.in   # -> status: NXDOMAIN
# CNAME target does not resolve (NXDOMAIN); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** ves.io load-balancer addresses are globally reusable: when a Distributed Cloud LB is deleted its name can be recreated by another tenant. A claimant receives traffic (including TLS, depending on cert state) addressed to the bank's hostname and can proxy or phish it. Several of these names relate to emailers and Video-KYC flows, raising phishing value.

**Assessment note (v0.2).** Claimability of this target type could not be established; treat as broken-service finding pending vendor-specific triage.

### F6 - `mybusiness.uatdigital.hdfcuat.bank.in`

| Field | Value |
| --- | --- |
| Severity | **HIGH** |
| Issue class | AWS ELB/ALB dangling CNAME (reclaimable name) |
| Dangling target | `nwinfra-inbound-uat-bizexp-alb-597088414.ap-south-1.elb.amazonaws.com` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer mybusiness.uatdigital.hdfcuat.bank.in CNAME
mybusiness.uatdigital.hdfcuat.bank.in. 300 IN CNAME nwinfra-inbound-uat-bizexp-alb-597088414.ap-south-1.elb.amazonaws.com.

$ dig mybusiness.uatdigital.hdfcuat.bank.in   # -> status: NXDOMAIN
# CNAME target does not resolve (NXDOMAIN); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** Elastic/Application Load Balancer DNS names are allocated from a global pool; an attacker who creates a new ALB until AWS assigns the identical name can receive all traffic for the bank's hostname, including TLS if they obtain a matching ACME cert (possible once DNS points at them). The affected names include production Video-KYC and API endpoints, so interception/phishing risk is direct.

**Assessment note (v0.2).** The ELB/ALB name is claimable: an attacker can create a load balancer with the same name in the same region and receive this traffic. However, they cannot obtain a valid TLS certificate for the bank's hostname (DV/ACM validation requires control of the bank's DNS), so the realistic impact is HTTP-level content injection / phishing and outage for TLS-failing clients — not silent HTTPS impersonation.

### F7 - `scmuat1.hdfcuat.bank.in`

| Field | Value |
| --- | --- |
| Severity | **HIGH** |
| Issue class | F5 Distributed Cloud (Volterra) deleted load balancer (name claimable) |
| Dangling target | `ves-io-9ca6efa3-e3b6-4aba-9f21-14f677a08470.ac.vh.ves.io` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer scmuat1.hdfcuat.bank.in CNAME
scmuat1.hdfcuat.bank.in. 300  IN  CNAME  ves-io-9ca6efa3-e3b6-4aba-9f21-14f677a08470.ac.vh.ves.io.

$ dig scmuat1.hdfcuat.bank.in   # -> status: NXDOMAIN
# CNAME target does not resolve (NXDOMAIN); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** ves.io load-balancer addresses are globally reusable: when a Distributed Cloud LB is deleted its name can be recreated by another tenant. A claimant receives traffic (including TLS, depending on cert state) addressed to the bank's hostname and can proxy or phish it. Several of these names relate to emailers and Video-KYC flows, raising phishing value.

**Assessment note (v0.2).** Claimability of this target type could not be established; treat as broken-service finding pending vendor-specific triage.

### F8 - `translation.hdfc.bank.in`

| Field | Value |
| --- | --- |
| Severity | **LOW** |
| Issue class | CloudFront dangling CNAME (alias attach requires domain validation; not claimable) |
| Dangling target | `d1wsttm9l9x0m5.cloudfront.net` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer translation.hdfc.bank.in CNAME
translation.hdfc.bank.in. 300  IN  CNAME  d1wsttm9l9x0m5.cloudfront.net.

$ dig translation.hdfc.bank.in   # -> status: NOERROR
# CNAME target does not resolve (NOERROR); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** The record points at a third-party name that no longer resolves or is misconfigured. Depending on the target platform this may permit content injection at the bank's subdomain or simply breaks the service. Each case needs individual triage.

## 4. Recommended remediation

In order of urgency:

**Dangling CNAME (miscellaneous target)** *(fix within days)*

Identify the original vendor/purpose per record; delete or repair accordingly. Where the target was a SaaS vanity host, re-validate ownership before restoring.

**F5 Distributed Cloud (Volterra) deleted load balancer** *(fix within days)*

Remove the stale CNAME from bank DNS. For any still-required service, recreate the F5 XC load balancer with the same advertised name under the bank's tenant and restore the record only after verification. Add ves.io names to the quarterly DNS-reconciliation inventory.

**AWS ELB/ALB dangling CNAME (reclaimable name)** *(fix within days)*

Delete the stale DNS records now. Where the endpoint is still required, provision a replacement ALB, update DNS, and keep old records removed. Consider Route53 health-checks that alarm when a CNAME target stops resolving.

**Housekeeping (this month)**

- Inventory every CNAME under the bank's `.bank.in` zone and reconcile it against
  live cloud resources; repeat quarterly. The registry (IDRBT) can assist with a
  zone export on request.
- Route all public DNS changes through change control that requires the target's
  owner to confirm decommissioning *before* the record is edited.
- Consider CERT-In empanelled auditor validation of the cleanup, and add dangling-
  record checks to periodic VA cycles.

## 5. Impact statement

Mass-mailer infrastructure (emailers) is a direct phish-delivery vector; asset/translation CDNs serve customer-facing static content.

We have not attempted to register or claim any of the dangling targets, and we
will not do so. All findings were derived passively. We request acknowledgement
of this report and, where practicable, coordination with IDRBT so that similar
hygiene issues across other banks in the namespace can be addressed systematically.

---

*Generated by the Cashless Consumer bank-in audit pipeline. Draft only -
requires human review before sending. Evidence files: `evidence/takeover_candidates.json`,
`evidence/dns_sweep.jsonl`.*

**Assessment note (v0.2).** CloudFront distributions cannot be claimed by third parties: attaching a custom hostname to a distribution requires a certificate validated against that hostname's DNS, which only the domain owner can complete. Impact here is broken/degraded service, not hostile takeover.
