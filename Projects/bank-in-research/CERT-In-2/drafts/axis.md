# Responsible Disclosure: Dangling DNS Records on `AXIS.bank.in` (20 records)

| | |
| --- | --- |
| To | incident@cert-in.org.in |
| From | Cashless Consumer <cashlessconsumerin@gmail.com> |
| Date | 26 August 2026 |
| Status | **DRAFT v0.2 - not sent** |
| Entity | Axis Bank Ltd (axis) |
| Highest severity | **LOW** |
| Records affected | 20 |
| Registry context | IDRBT `.bank.in` domain space (RBI-mandated) |

> **Drafting note (v0.2):** numbers and evidence auto-generated from the scan of
> 25-26 Aug 2026. Severities re-assessed 28 Aug 2026 after a claimability review
> (AWS ELB/ALB + Salesforce + F5 names are claimable; CloudFront, Global
> Accelerator, Cloudflare and Akamai edge targets require owner validation and
> are NOT claimable). Human review required before any dispatch.

---

## 1. Summary

Seventeen hostname records under axis.bank.in point to cloud resources that no longer resolve to an active configuration: seven Amazon CloudFront distribution CNAMEs (apollo-content, juno-content, mercury-content, neocldweb, neocldapp, nucleus-content, supernova-content) and thirteen AWS Global Accelerator static anycast IDs (devneo, devneopay, neo, neopay, qaneo, qaneopay, sitvelocity, sitvelocitypay, oniuat, uatvelocity, uatneo, uatembsaas, uatembsaaspay).

**Affected hostnames (20 records):** `apollo-content.axis.bank.in`, `devneo.axis.bank.in`, `devneopay.axis.bank.in`, `juno-content.axis.bank.in`, `mercury-content.axis.bank.in`, `neo.axis.bank.in` (+14 more).

We are reporting this to CERT-In under its vulnerability-note process because
the affected names sit inside the RBI-mandated `.bank.in` namespace operated by
IDRBT. We note that the CloudFront and Global Accelerator targets here are
validation-gated and not claimable by third parties, so these records represent
broken-service and DNS-hygiene exposure rather than confirmed hostile takeover.
We request that CERT-In coordinate remediation with the bank (and IDRBT where
registry-level action is useful).

## 2. What we did

- Universe: the full published `axis.bank.in` zone from the IDRBT-derived
  dataset released by the bank-in-domains project (release v2026.8.4, 23 Aug 2026).
- Every hostname was resolved via the bank's own authoritative DNS on 25 Aug 2026;
  records whose CNAME/A target no longer resolve were flagged as *dangling*.
- Each flagged record was then manually re-verified with independent DNS queries
  (repeated at generation time of this draft) to exclude transient failures,
  wildcard catches, and CDN geo-variation false positives.
- No probing, exploitation, or interaction with bank applications took place;
  all observations come from passive public DNS data plus HTTP HEAD checks.

## 3. Findings


### F1 - `apollo-content.axis.bank.in`

| Field | Value |
| --- | --- |
| Severity | **LOW** |
| Issue class | CloudFront dangling CNAME (alias attach requires domain validation; not claimable) |
| Dangling target | `d13dwtmxjp7qqk.cloudfront.net` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer apollo-content.axis.bank.in CNAME
apollo-content.axis.bank.in. 300 IN  CNAME  d13dwtmxjp7qqk.cloudfront.net.

$ dig apollo-content.axis.bank.in   # -> status: NOERROR
# CNAME target does not resolve (NOERROR); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** The record points at a third-party name that no longer resolves or is misconfigured. Depending on the target platform this may permit content injection at the bank's subdomain or simply breaks the service. Each case needs individual triage.

**Assessment note (v0.2).** CloudFront distributions cannot be claimed by third parties: attaching a custom hostname to a distribution requires a certificate validated against that hostname's DNS, which only the domain owner can complete. Impact here is broken/degraded service, not hostile takeover.

### F2 - `devneo.axis.bank.in`

| Field | Value |
| --- | --- |
| Severity | **LOW** |
| Issue class | AWS Global Accelerator orphaned static IP set (random ID; unclaimable by design) |
| Dangling target | `ad81a19ad1c875ade.awsglobalaccelerator.com` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer devneo.axis.bank.in CNAME
devneo.axis.bank.in.  180  IN  CNAME  ad81a19ad1c875ade.awsglobalaccelerator.com.

$ dig devneo.axis.bank.in   # -> status: NXDOMAIN
# CNAME target does not resolve (NXDOMAIN); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** Global Accelerator anycast names use random identifiers, so direct re-registration is unlikely; however the records are stale by definition, indicate abandoned environments (several are UAT/SIT payment stacks), and may begin to fail open or get reassigned as AWS policy evolves. They also leak internal environment naming for reconnaissance.

**Assessment note (v0.2).** Global Accelerator names are AWS-assigned random identifiers and are never reissued to another account, so the target is not claimable. This is a hygiene / broken-service finding.

### F3 - `devneopay.axis.bank.in`

| Field | Value |
| --- | --- |
| Severity | **LOW** |
| Issue class | AWS Global Accelerator orphaned static IP set (random ID; unclaimable by design) |
| Dangling target | `a98a41db71f1fff3a.awsglobalaccelerator.com` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer devneopay.axis.bank.in CNAME
devneopay.axis.bank.in.  180  IN  CNAME  a98a41db71f1fff3a.awsglobalaccelerator.com.

$ dig devneopay.axis.bank.in   # -> status: NXDOMAIN
# CNAME target does not resolve (NXDOMAIN); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** Global Accelerator anycast names use random identifiers, so direct re-registration is unlikely; however the records are stale by definition, indicate abandoned environments (several are UAT/SIT payment stacks), and may begin to fail open or get reassigned as AWS policy evolves. They also leak internal environment naming for reconnaissance.

**Assessment note (v0.2).** Global Accelerator names are AWS-assigned random identifiers and are never reissued to another account, so the target is not claimable. This is a hygiene / broken-service finding.

### F4 - `juno-content.axis.bank.in`

| Field | Value |
| --- | --- |
| Severity | **LOW** |
| Issue class | CloudFront dangling CNAME (alias attach requires domain validation; not claimable) |
| Dangling target | `d1ovscizflyfb3.cloudfront.net` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer juno-content.axis.bank.in CNAME
juno-content.axis.bank.in. 300  IN  CNAME  d1ovscizflyfb3.cloudfront.net.

$ dig juno-content.axis.bank.in   # -> status: NOERROR
# CNAME target does not resolve (NOERROR); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** The record points at a third-party name that no longer resolves or is misconfigured. Depending on the target platform this may permit content injection at the bank's subdomain or simply breaks the service. Each case needs individual triage.

**Assessment note (v0.2).** CloudFront distributions cannot be claimed by third parties: attaching a custom hostname to a distribution requires a certificate validated against that hostname's DNS, which only the domain owner can complete. Impact here is broken/degraded service, not hostile takeover.

### F5 - `mercury-content.axis.bank.in`

| Field | Value |
| --- | --- |
| Severity | **LOW** |
| Issue class | CloudFront dangling CNAME (alias attach requires domain validation; not claimable) |
| Dangling target | `d15i12s32m5q24.cloudfront.net` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer mercury-content.axis.bank.in CNAME
mercury-content.axis.bank.in. 30 IN  CNAME  d15i12s32m5q24.cloudfront.net.

$ dig mercury-content.axis.bank.in   # -> status: NOERROR
# CNAME target does not resolve (NOERROR); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** The record points at a third-party name that no longer resolves or is misconfigured. Depending on the target platform this may permit content injection at the bank's subdomain or simply breaks the service. Each case needs individual triage.

**Assessment note (v0.2).** CloudFront distributions cannot be claimed by third parties: attaching a custom hostname to a distribution requires a certificate validated against that hostname's DNS, which only the domain owner can complete. Impact here is broken/degraded service, not hostile takeover.

### F6 - `neo.axis.bank.in`

| Field | Value |
| --- | --- |
| Severity | **LOW** |
| Issue class | AWS Global Accelerator orphaned static IP set (random ID; unclaimable by design) |
| Dangling target | `a85426234ca3c91e3.awsglobalaccelerator.com` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer neo.axis.bank.in CNAME
neo.axis.bank.in.  30  IN  CNAME  a85426234ca3c91e3.awsglobalaccelerator.com.

$ dig neo.axis.bank.in   # -> status: NXDOMAIN
# CNAME target does not resolve (NXDOMAIN); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** Global Accelerator anycast names use random identifiers, so direct re-registration is unlikely; however the records are stale by definition, indicate abandoned environments (several are UAT/SIT payment stacks), and may begin to fail open or get reassigned as AWS policy evolves. They also leak internal environment naming for reconnaissance.

**Assessment note (v0.2).** Global Accelerator names are AWS-assigned random identifiers and are never reissued to another account, so the target is not claimable. This is a hygiene / broken-service finding.

### F7 - `neocldweb.axis.bank.in`

| Field | Value |
| --- | --- |
| Severity | **LOW** |
| Issue class | CloudFront dangling CNAME (alias attach requires domain validation; not claimable) |
| Dangling target | `d1r0faotr5jcix.cloudfront.net` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer neocldweb.axis.bank.in CNAME
neocldweb.axis.bank.in.  38  IN  CNAME  d1r0faotr5jcix.cloudfront.net.

$ dig neocldweb.axis.bank.in   # -> status: NOERROR
# CNAME target does not resolve (NOERROR); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** The record points at a third-party name that no longer resolves or is misconfigured. Depending on the target platform this may permit content injection at the bank's subdomain or simply breaks the service. Each case needs individual triage.

**Assessment note (v0.2).** CloudFront distributions cannot be claimed by third parties: attaching a custom hostname to a distribution requires a certificate validated against that hostname's DNS, which only the domain owner can complete. Impact here is broken/degraded service, not hostile takeover.

### F8 - `neopay.axis.bank.in`

| Field | Value |
| --- | --- |
| Severity | **LOW** |
| Issue class | AWS Global Accelerator orphaned static IP set (random ID; unclaimable by design) |
| Dangling target | `ad2630be5e827fd7e.awsglobalaccelerator.com` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer neopay.axis.bank.in CNAME
neopay.axis.bank.in.  30  IN  CNAME  ad2630be5e827fd7e.awsglobalaccelerator.com.

$ dig neopay.axis.bank.in   # -> status: NXDOMAIN
# CNAME target does not resolve (NXDOMAIN); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** Global Accelerator anycast names use random identifiers, so direct re-registration is unlikely; however the records are stale by definition, indicate abandoned environments (several are UAT/SIT payment stacks), and may begin to fail open or get reassigned as AWS policy evolves. They also leak internal environment naming for reconnaissance.

**Assessment note (v0.2).** Global Accelerator names are AWS-assigned random identifiers and are never reissued to another account, so the target is not claimable. This is a hygiene / broken-service finding.

### F9 - `neocldapp.axis.bank.in`

| Field | Value |
| --- | --- |
| Severity | **LOW** |
| Issue class | CloudFront dangling CNAME (alias attach requires domain validation; not claimable) |
| Dangling target | `d1feaw0wpl3snc.cloudfront.net` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer neocldapp.axis.bank.in CNAME
neocldapp.axis.bank.in.  300  IN  CNAME  d1feaw0wpl3snc.cloudfront.net.

$ dig neocldapp.axis.bank.in   # -> status: NOERROR
# CNAME target does not resolve (NOERROR); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** The record points at a third-party name that no longer resolves or is misconfigured. Depending on the target platform this may permit content injection at the bank's subdomain or simply breaks the service. Each case needs individual triage.

**Assessment note (v0.2).** CloudFront distributions cannot be claimed by third parties: attaching a custom hostname to a distribution requires a certificate validated against that hostname's DNS, which only the domain owner can complete. Impact here is broken/degraded service, not hostile takeover.

### F10 - `nucleus-content.axis.bank.in`

| Field | Value |
| --- | --- |
| Severity | **LOW** |
| Issue class | CloudFront dangling CNAME (alias attach requires domain validation; not claimable) |
| Dangling target | `d26jekaep9z3yg.cloudfront.net` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer nucleus-content.axis.bank.in CNAME
nucleus-content.axis.bank.in. 180 IN  CNAME  d26jekaep9z3yg.cloudfront.net.

$ dig nucleus-content.axis.bank.in   # -> status: NOERROR
# CNAME target does not resolve (NOERROR); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** The record points at a third-party name that no longer resolves or is misconfigured. Depending on the target platform this may permit content injection at the bank's subdomain or simply breaks the service. Each case needs individual triage.

**Assessment note (v0.2).** CloudFront distributions cannot be claimed by third parties: attaching a custom hostname to a distribution requires a certificate validated against that hostname's DNS, which only the domain owner can complete. Impact here is broken/degraded service, not hostile takeover.

### F11 - `oniuat.axis.bank.in`

| Field | Value |
| --- | --- |
| Severity | **LOW** |
| Issue class | AWS Global Accelerator orphaned static IP set (random ID; unclaimable by design) |
| Dangling target | `a841df261f5f29b0b.awsglobalaccelerator.com` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer oniuat.axis.bank.in CNAME
oniuat.axis.bank.in.  180  IN  CNAME  a841df261f5f29b0b.awsglobalaccelerator.com.

$ dig oniuat.axis.bank.in   # -> status: NXDOMAIN
# CNAME target does not resolve (NXDOMAIN); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** Global Accelerator anycast names use random identifiers, so direct re-registration is unlikely; however the records are stale by definition, indicate abandoned environments (several are UAT/SIT payment stacks), and may begin to fail open or get reassigned as AWS policy evolves. They also leak internal environment naming for reconnaissance.

**Assessment note (v0.2).** Global Accelerator names are AWS-assigned random identifiers and are never reissued to another account, so the target is not claimable. This is a hygiene / broken-service finding.

### F12 - `qaneopay.axis.bank.in`

| Field | Value |
| --- | --- |
| Severity | **LOW** |
| Issue class | AWS Global Accelerator orphaned static IP set (random ID; unclaimable by design) |
| Dangling target | `adfc74bab6e1091a2.awsglobalaccelerator.com` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer qaneopay.axis.bank.in CNAME
qaneopay.axis.bank.in.  180  IN  CNAME  adfc74bab6e1091a2.awsglobalaccelerator.com.

$ dig qaneopay.axis.bank.in   # -> status: NXDOMAIN
# CNAME target does not resolve (NXDOMAIN); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** Global Accelerator anycast names use random identifiers, so direct re-registration is unlikely; however the records are stale by definition, indicate abandoned environments (several are UAT/SIT payment stacks), and may begin to fail open or get reassigned as AWS policy evolves. They also leak internal environment naming for reconnaissance.

**Assessment note (v0.2).** Global Accelerator names are AWS-assigned random identifiers and are never reissued to another account, so the target is not claimable. This is a hygiene / broken-service finding.

### F13 - `qaneo.axis.bank.in`

| Field | Value |
| --- | --- |
| Severity | **LOW** |
| Issue class | AWS Global Accelerator orphaned static IP set (random ID; unclaimable by design) |
| Dangling target | `a2875293e8ce78399.awsglobalaccelerator.com` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer qaneo.axis.bank.in CNAME
qaneo.axis.bank.in.  180  IN  CNAME  a2875293e8ce78399.awsglobalaccelerator.com.

$ dig qaneo.axis.bank.in   # -> status: NXDOMAIN
# CNAME target does not resolve (NXDOMAIN); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** Global Accelerator anycast names use random identifiers, so direct re-registration is unlikely; however the records are stale by definition, indicate abandoned environments (several are UAT/SIT payment stacks), and may begin to fail open or get reassigned as AWS policy evolves. They also leak internal environment naming for reconnaissance.

**Assessment note (v0.2).** Global Accelerator names are AWS-assigned random identifiers and are never reissued to another account, so the target is not claimable. This is a hygiene / broken-service finding.

### F14 - `sitvelocitypay.axis.bank.in`

| Field | Value |
| --- | --- |
| Severity | **LOW** |
| Issue class | AWS Global Accelerator orphaned static IP set (random ID; unclaimable by design) |
| Dangling target | `aa4da80d046aa7135.awsglobalaccelerator.com` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer sitvelocitypay.axis.bank.in CNAME
sitvelocitypay.axis.bank.in. 60  IN  CNAME  aa4da80d046aa7135.awsglobalaccelerator.com.

$ dig sitvelocitypay.axis.bank.in   # -> status: NXDOMAIN
# CNAME target does not resolve (NXDOMAIN); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** Global Accelerator anycast names use random identifiers, so direct re-registration is unlikely; however the records are stale by definition, indicate abandoned environments (several are UAT/SIT payment stacks), and may begin to fail open or get reassigned as AWS policy evolves. They also leak internal environment naming for reconnaissance.

**Assessment note (v0.2).** Global Accelerator names are AWS-assigned random identifiers and are never reissued to another account, so the target is not claimable. This is a hygiene / broken-service finding.

### F15 - `sitvelocity.axis.bank.in`

| Field | Value |
| --- | --- |
| Severity | **LOW** |
| Issue class | AWS Global Accelerator orphaned static IP set (random ID; unclaimable by design) |
| Dangling target | `a1c8f5525d2030f8e.awsglobalaccelerator.com` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer sitvelocity.axis.bank.in CNAME
sitvelocity.axis.bank.in. 30  IN  CNAME  a1c8f5525d2030f8e.awsglobalaccelerator.com.

$ dig sitvelocity.axis.bank.in   # -> status: NXDOMAIN
# CNAME target does not resolve (NXDOMAIN); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** Global Accelerator anycast names use random identifiers, so direct re-registration is unlikely; however the records are stale by definition, indicate abandoned environments (several are UAT/SIT payment stacks), and may begin to fail open or get reassigned as AWS policy evolves. They also leak internal environment naming for reconnaissance.

**Assessment note (v0.2).** Global Accelerator names are AWS-assigned random identifiers and are never reissued to another account, so the target is not claimable. This is a hygiene / broken-service finding.

### F16 - `supernova-content.axis.bank.in`

| Field | Value |
| --- | --- |
| Severity | **LOW** |
| Issue class | CloudFront dangling CNAME (alias attach requires domain validation; not claimable) |
| Dangling target | `d2bf6tjmdy10dn.cloudfront.net` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer supernova-content.axis.bank.in CNAME
supernova-content.axis.bank.in.  300 IN  CNAME  d2bf6tjmdy10dn.cloudfront.net.

$ dig supernova-content.axis.bank.in   # -> status: NOERROR
# CNAME target does not resolve (NOERROR); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** The record points at a third-party name that no longer resolves or is misconfigured. Depending on the target platform this may permit content injection at the bank's subdomain or simply breaks the service. Each case needs individual triage.

**Assessment note (v0.2).** CloudFront distributions cannot be claimed by third parties: attaching a custom hostname to a distribution requires a certificate validated against that hostname's DNS, which only the domain owner can complete. Impact here is broken/degraded service, not hostile takeover.

### F17 - `uatembsaas.axis.bank.in`

| Field | Value |
| --- | --- |
| Severity | **LOW** |
| Issue class | AWS Global Accelerator orphaned static IP set (random ID; unclaimable by design) |
| Dangling target | `af924497213569bd2.awsglobalaccelerator.com` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer uatembsaas.axis.bank.in CNAME
uatembsaas.axis.bank.in. 30  IN  CNAME  af924497213569bd2.awsglobalaccelerator.com.

$ dig uatembsaas.axis.bank.in   # -> status: NXDOMAIN
# CNAME target does not resolve (NXDOMAIN); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** Global Accelerator anycast names use random identifiers, so direct re-registration is unlikely; however the records are stale by definition, indicate abandoned environments (several are UAT/SIT payment stacks), and may begin to fail open or get reassigned as AWS policy evolves. They also leak internal environment naming for reconnaissance.

**Assessment note (v0.2).** Global Accelerator names are AWS-assigned random identifiers and are never reissued to another account, so the target is not claimable. This is a hygiene / broken-service finding.

### F18 - `uatembsaaspay.axis.bank.in`

| Field | Value |
| --- | --- |
| Severity | **LOW** |
| Issue class | AWS Global Accelerator orphaned static IP set (random ID; unclaimable by design) |
| Dangling target | `a46a81487ad9e3583.awsglobalaccelerator.com` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer uatembsaaspay.axis.bank.in CNAME
uatembsaaspay.axis.bank.in. 60  IN  CNAME  a46a81487ad9e3583.awsglobalaccelerator.com.

$ dig uatembsaaspay.axis.bank.in   # -> status: NXDOMAIN
# CNAME target does not resolve (NXDOMAIN); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** Global Accelerator anycast names use random identifiers, so direct re-registration is unlikely; however the records are stale by definition, indicate abandoned environments (several are UAT/SIT payment stacks), and may begin to fail open or get reassigned as AWS policy evolves. They also leak internal environment naming for reconnaissance.

**Assessment note (v0.2).** Global Accelerator names are AWS-assigned random identifiers and are never reissued to another account, so the target is not claimable. This is a hygiene / broken-service finding.

### F19 - `uatvelocity.axis.bank.in`

| Field | Value |
| --- | --- |
| Severity | **LOW** |
| Issue class | AWS Global Accelerator orphaned static IP set (random ID; unclaimable by design) |
| Dangling target | `a993919e3c123b819.awsglobalaccelerator.com` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer uatvelocity.axis.bank.in CNAME
uatvelocity.axis.bank.in. 30  IN  CNAME  a993919e3c123b819.awsglobalaccelerator.com.

$ dig uatvelocity.axis.bank.in   # -> status: NXDOMAIN
# CNAME target does not resolve (NXDOMAIN); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** Global Accelerator anycast names use random identifiers, so direct re-registration is unlikely; however the records are stale by definition, indicate abandoned environments (several are UAT/SIT payment stacks), and may begin to fail open or get reassigned as AWS policy evolves. They also leak internal environment naming for reconnaissance.

**Assessment note (v0.2).** Global Accelerator names are AWS-assigned random identifiers and are never reissued to another account, so the target is not claimable. This is a hygiene / broken-service finding.

### F20 - `uatneo.axis.bank.in`

| Field | Value |
| --- | --- |
| Severity | **LOW** |
| Issue class | AWS Global Accelerator orphaned static IP set (random ID; unclaimable by design) |
| Dangling target | `a300fc6ffde89e4dd.awsglobalaccelerator.com` |

The bank's authoritative nameservers still publish this record, but the
service it points to is gone:

```text
$ dig +noall +answer uatneo.axis.bank.in CNAME
uatneo.axis.bank.in.  180  IN  CNAME  a300fc6ffde89e4dd.awsglobalaccelerator.com.

$ dig uatneo.axis.bank.in   # -> status: NXDOMAIN
# CNAME target does not resolve (NXDOMAIN); the bank still owns the
# name, so anyone who claims the dangling target serves content here.
```

**Why this matters.** Global Accelerator anycast names use random identifiers, so direct re-registration is unlikely; however the records are stale by definition, indicate abandoned environments (several are UAT/SIT payment stacks), and may begin to fail open or get reassigned as AWS policy evolves. They also leak internal environment naming for reconnaissance.

## 4. Recommended remediation

In order of urgency:

**Dangling CNAME (miscellaneous target)** *(fix within days)*

Identify the original vendor/purpose per record; delete or repair accordingly. Where the target was a SaaS vanity host, re-validate ownership before restoring.

**AWS Global Accelerator orphaned static IP set** *(fix within days)*

Verify whether each accelerator is intentional; delete orphaned accelerators and their DNS records. Track all GA names in the DNS inventory.

**Housekeeping (this month)**

- Inventory every CNAME under the bank's `.bank.in` zone and reconcile it against
  live cloud resources; repeat quarterly. The registry (IDRBT) can assist with a
  zone export on request.
- Route all public DNS changes through change control that requires the target's
  owner to confirm decommissioning *before* the record is edited.
- Consider CERT-In empanelled auditor validation of the cleanup, and add dangling-
  record checks to periodic VA cycles.

## 5. Impact statement

Cookie scoping (*.axis.bank.in), brand-credible phishing of retail customers, potential capture of API traffic to legacy endpoints.

We have not attempted to register or claim any of the dangling targets, and we
will not do so. All findings were derived passively. We request acknowledgement
of this report and, where practicable, coordination with IDRBT so that similar
hygiene issues across other banks in the namespace can be addressed systematically.

---

*Generated by the Cashless Consumer bank-in audit pipeline. Draft only -
requires human review before sending. Evidence files: `evidence/takeover_candidates.json`,
`evidence/dns_sweep.jsonl`.*

**Assessment note (v0.2).** Global Accelerator names are AWS-assigned random identifiers and are never reissued to another account, so the target is not claimable. This is a hygiene / broken-service finding.
