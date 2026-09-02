---
title: "UPI Mandates 101: India's Auto-Debit Infrastructure for Recurring Payments"
description: "A comprehensive guide to UPI Mandates (e-Mandates / AutoPay) — how recurring auto-debits work on UPI, the regulatory framework, transaction limits, consumer rights, dark-pattern risks, and how to check, pause, and cancel mandates."
date: 2026-09-02
draft: false
tags: ["upi", "upi-autopay", "e-mandate", "npci", "rbi", "recurring-payments", "subscriptions", "auto-debit", "fintech", "india", "consumer-rights", "dark-patterns"]
categories: ["DPI Basics"]
image: ""
author: "CashlessConsumer"
readingTime: "18 min"
---

# UPI Mandates 101: India's Auto-Debit Infrastructure for Recurring Payments

## What is a UPI Mandate?

A **UPI Mandate** (also called an **e-Mandate** or operated under the consumer-facing brand **UPI AutoPay**) is a pre-authorized digital instruction that allows a merchant or biller to automatically debit your bank account at agreed-upon intervals for recurring payments. Instead of manually approving each monthly subscription, EMI, insurance premium, or SIP, you approve the *rule* once using your UPI PIN — and subsequent debits execute automatically within the boundaries you set. [^1]

UPI Mandates sit within the broader **e-Mandate** ecosystem governed by the RBI, which also covers card-based standing instructions and prepaid wallet mandates. The RBI's **Digital Payments E-Mandate Framework, 2026** (issued April 21, 2026) is the current master regulation — a consolidated rulebook that replaces earlier piecemeal guidelines and applies uniformly across UPI, cards, and prepaid payment instruments (PPIs). [^2]

The system is operated and managed by the **National Payments Corporation of India (NPCI)** under authorisation from the RBI under the Payment and Settlement Systems Act, 2007. NPCI launched UPI AutoPay in July 2020 as part of its UPI 2.0 suite. [^3]

UPI Mandates have become a critical piece of India's digital payments infrastructure. In November 2025, the top 10 banks alone processed **926 million UPI AutoPay transactions** — up from 530.5 million in November 2024, a year-on-year doubling. AutoPay now accounts for roughly **5% of all UPI transaction volume**, positioning it to cross 1 billion transactions per month by mid-2026. [^4]

## How It Works

### The Mandate Lifecycle

Every UPI Mandate follows a defined lifecycle from creation to execution to revocation:

**1. Registration (One-Time Setup)**
- The merchant or biller sends a mandate collect request to the customer via their UPI app.
- The customer reviews the mandate terms: **maximum amount per debit**, **frequency** (daily, weekly, fortnightly, monthly, quarterly, half-yearly, yearly), **start date**, and **validity period**.
- The customer authenticates with their **UPI PIN** (this is the Additional Factor of Authentication, or AFA).
- Once approved, the mandate is registered on NPCI's central switch and the customer's bank. The customer receives a unique **mandate reference number**. [^1][^5]

**2. Pre-Debit Notification (Mandatory)**
- At least **24 hours before** each scheduled debit, the customer receives a pre-debit notification specifying: merchant name, debit amount, scheduled date/time, and the mandate reference. [^2][^6]
- This is mandatory for all e-Mandates under RBI regulations, regardless of amount.

**3. Execution**
- On the scheduled date, the merchant triggers the debit. If the amount is within the mandate's approved limit and below the AFA-exempt threshold (see Limits section), the payment executes without requiring the customer to enter their UPI PIN again.
- If the debit exceeds the mandate's maximum amount, the transaction is declined. [^5]
- A **post-debit notification** is sent after execution, including the merchant name, amount, date/time, transaction reference, and mandate reference. [^2]

**4. Failure and Retry**
- From August 2025, NPCI limits each mandate to a **maximum of four execution attempts** per cycle: one original plus three retries.
- Banks must schedule AutoPay executions during **non-peak hours** to reduce technical failures caused by server congestion. [^7]
- Despite these rules, failure rates remain high — see the Consumer Risks section.

**5. Modification, Pause, and Revocation**
- Customers can **pause, unpause, modify, or revoke** any mandate at any time through their UPI app or bank's mandate management section. [^1][^8]
- Revocation requires UPI PIN authentication and takes immediate effect for future debits.
- Under the October 2025 NPCI circular (OC-223), **mandate portability** allows customers to move a mandate from one UPI app to another without re-approval, subject to a 90-day cooling-off between ports. [^9]

### Where Mandates Live

A critical design choice: UPI Mandates are stored on **your bank's servers and NPCI's central switch**, not inside any single UPI app. This means:
- Even if you uninstall the UPI app you used to create the mandate, the mandate remains active.
- You can view and revoke mandates from **any** UPI app linked to your mobile number, or from NPCI's central portal. [^10]

## Key Statistics

| Metric | Value | Source |
| --- | --- | --- |
| UPI AutoPay transactions (Top 10 banks, Nov 2025) | 926 million | NPCI / Economic Times [^4] |
| UPI AutoPay transactions (Top 10 banks, Nov 2024) | 530.5 million | NPCI / Economic Times [^4] |
| UPI AutoPay share of total UPI volume | ~5% | Industry estimates [^4] |
| SBI AutoPay transactions (Nov 2025) | 290 million | NPCI / Economic Times [^4] |
| SBI AutoPay transactions (Nov 2023) | 3.8 million | NPCI / Economic Times [^4] |
| Active UPI mandates (estimated) | 87 crore | Industry reports [^11] |
| Total UPI users (Jun 2026) | 55.49 crore | PIB / NPCI [^12] |
| Total UPI transactions FY 2025-26 | 24,161.69 crore (volume) | PIB [^12] |
| AutoPay failure rate (major banks) | 50–60% | NPCI data / Industry analysis [^4][^13] |
| UPI users experiencing subscription traps | 68% | Consumer surveys [^11] |

## Types of UPI Mandates

### By Amount Structure

**Fixed Mandate:** The debit amount is set at a fixed value at the time of registration (e.g., ₹599/month for Netflix). Every debit is for exactly that amount. [^5]

**Variable Mandate:** The customer sets a **maximum ceiling** per debit. The actual debit amount can vary up to that ceiling (e.g., electricity bills that fluctuate monthly, capped at ₹5,000). Under the 2026 RBI framework, issuers must incorporate a maximum transaction limit for variable mandates to protect consumers. [^2][^5]

**One-Time Mandate:** A single future-dated payment rather than a recurring one. Useful for booking deposits or pre-orders. [^1]

### By Frequency

Mandates can be set for: one-time, daily, weekly, fortnightly, monthly, bi-monthly, quarterly, half-yearly, and yearly. [^1][^3]

### By Category (RBI 2026 Framework)

The 2026 E-Mandate Framework establishes **two tiers** for AFA-exempt recurring debits: [^2]

| Category | AFA-Exempt Limit per Transaction | Examples |
| --- | --- | --- |
| General recurring payments | Up to ₹15,000 | OTT subscriptions, utility bills, DTH recharges |
| High-trust recurring payments | Up to ₹1,00,000 | Insurance premiums, mutual fund SIPs, credit card bill payments |

Transactions exceeding these thresholds require AFA (i.e., your UPI PIN) for each individual debit. [^2][^6]

## Major Players

### Infrastructure

- **NPCI (National Payments Corporation of India):** Operates the UPI switch, sets technical standards, manages the AutoPay framework, and runs the central mandate registry. [^3]
- **RBI (Reserve Bank of India):** Regulator. Issues the E-Mandate Framework, sets transaction limits, mandates consumer protection requirements, and enforces compliance. [^2]

### UPI Apps / PSPs (Payment Service Providers)

Google Pay, PhonePe, Paytm, BHIM, and bank-integrated UPI apps all support mandate creation and management. Under OC-223 (October 2025), all UPI apps must show mandates created on any app — not just their own. [^9]

### Payment Aggregators & Gateways

Razorpay, PayU, Cashfree, BillDesk, and others provide merchant-side mandate integration. These entities connect merchants to the UPI AutoPay rails. Cashfree Payments was penalised ₹3.10 lakh by RBI in March 2026 for non-compliance with Payment Aggregator directions. [^14]

### Major Use-Case Merchants

- **OTT & Streaming:** Netflix, Prime Video, Disney+ Hotstar, Spotify
- **Financial Services:** Mutual fund SIPs (via AMCs and platforms like Groww, Zerodha), insurance premium payments, loan EMIs, credit card bill payments
- **Utilities:** Electricity, gas, water, DTH, mobile postpaid
- **Subscriptions:** Software-as-a-service, publications, gym memberships

## Regulatory Framework

### Timeline of Key Regulations

| Date | Regulation | Key Change |
| --- | --- | --- |
| July 2020 | NPCI launches UPI AutoPay | Initial rollout; ₹2,000 AFA-exempt limit for recurring payments [^3] |
| 2021 | RBI e-Mandate framework for cards & PPIs | Pre-debit notification mandated; AFA required at registration [^6] |
| 2022 | AFA-exempt limit raised to ₹15,000 | General recurring payments up to ₹15,000 can auto-debit without UPI PIN per transaction [^6] |
| Oct 7, 2025 | NPCI Circular OC-223 | Mandate portability, interoperable viewing across apps, anti-dark-pattern measures, 90-day port cooling-off [^9] |
| Dec 31, 2025 | OC-223 implementation deadline | All UPI members must enable revised framework [^9] |
| Sep 25, 2025 | RBI Authentication Mechanisms Directions, 2025 | Updated AFA rules for digital payments (effective Apr 1, 2026) [^2] |
| Apr 21, 2026 | **RBI Digital Payments E-Mandate Framework, 2026** | Consolidated rulebook for all e-Mandates (UPI + cards + PPIs); fixed vs variable mandate choice; ₹15,000/₹1,00,000 AFA-exempt tiers; dispute redressal; no charges for creation/modification [^2] |
| Jul 1, 2026 | RBI Integrated Ombudsman Scheme, 2026 | Replaced RB-IOS 2021; enhanced grievance redressal for e-Mandate disputes [^15] |

### The 2026 E-Mandate Framework — Key Provisions

The RBI's April 2026 framework is the current governing regulation. Key consumer-relevant provisions: [^2]

1. **One-time AFA registration:** Mandate registration and first-transaction execution both require AFA (UPI PIN).
2. **AFA for modifications:** Any change to an existing mandate (amount, frequency, validity) requires AFA.
3. **Pre-debit notification:** Mandatory at least 24 hours before every scheduled debit.
4. **Post-debit notification:** Mandatory after every execution, with full transaction details.
5. **No charges for mandate creation or modification:** Banks and payment intermediaries cannot levy fees on customers for setting up or changing e-Mandates.
6. **Immediate revocation right:** Customers can revoke any mandate at any time; the bank must stop all future debits immediately.
7. **Dispute redressal:** Issuers must maintain an appropriate grievance redressal system for e-Mandate-related complaints.
8. **Variable mandate cap:** For variable-amount mandates, the issuer must set a maximum transaction limit.
9. **Liability provisions:** RBI's existing customer liability rules for unauthorised electronic transactions apply (see Consumer Rights section).

## Consumer Rights Analysis

### Your Rights Under UPI Mandates

**1. Right to Informed Consent.** No mandate can be registered without your explicit authentication via UPI PIN. You must see the merchant name, amount (or cap), frequency, and validity before approving. [^2]

**2. Right to 24-Hour Pre-Debit Notice.** You must receive a notification at least 24 hours before any auto-debit, specifying the exact amount and merchant. If you don't want the debit, you have a window to pause or revoke the mandate. [^2][^6]

**3. Right to Immediate Revocation.** You can cancel any mandate at any time through your UPI app, bank app, or NPCI portal. Revocation is effective immediately for future debits. No bank or merchant can impose a waiting period, penalty, or charge for cancellation. [^2][^8]

**4. Right to Zero Charges.** No entity — bank, UPI app, payment aggregator, or merchant — can charge you for creating, modifying, or cancelling a UPI mandate. [^2]

**5. Right to Dispute Unauthorized Debits.** If you are debited without a valid mandate or outside the mandate's terms, you have the right to: (a) raise a **UDIR (UPI Dispute Resolution)** complaint through your UPI app, (b) report to your bank's nodal officer, and (c) escalate to the **RBI Integrated Ombudsman** if unresolved within 30 days. [^15][^16]

**6. Zero Liability for Reported Fraud.** Under RBI's customer liability framework, if you report an unauthorised transaction within **3 working days** of receiving the debit notification, your liability is **zero** — the bank must reverse the full amount. [^17]

### Critical Consumer Risks

**1. Subscription Traps and Dark Patterns.**

This is the single biggest consumer risk in the UPI Mandate ecosystem. A 2025 investigation by *The Ken* documented widespread "subscription traps" — one-click to subscribe, a maze to cancel. [^18] Consumer surveys indicate that **68% of UPI users have experienced subscription traps** — being signed up for recurring debits through opaque free-trial flows, hidden auto-renewals, or confusing cancellation processes. [^11]

Common dark patterns include:
- Free trials that auto-convert to paid mandates without clear disclosure.
- "Subscribe and save" options pre-selected at checkout.
- Cancellation buttons buried deep in app settings or absent entirely from the UPI mandate management view.
- Merchants continuing to attempt debits even after the customer has cancelled the service (but not the mandate).

NPCI's OC-223 circular (October 2025) and the launch of the central portal at **upihelp.npci.org.in** are direct regulatory responses to these patterns. [^9][^10]

**2. High Failure Rates and Silent Declines.**

As of late 2025, UPI AutoPay failure rates at major banks range from **50% to 60%** — meaning more than half of all scheduled auto-debits fail. [^4][^13] These failures split into two categories:

- **Technical declines:** Server congestion, bank downtime, timing issues. NPCI's August 2025 rule mandating non-peak-hour execution aims to address this.
- **Business declines:** Insufficient balance, mandate revoked, account closed.

The consumer harm is twofold: unwanted debits that do go through (due to dark patterns), and wanted debits that silently fail, causing subscription lapses, late fees, and insurance policy discontinuities without adequate communication. [^13]

**3. Visibility Fragmentation.**

While OC-223 mandates that all UPI apps show all active mandates (not just their own), the rollout remains **partial as of mid-2026**. Many consumers still cannot see a complete picture of their active mandates in one place, making it easy to lose track of old subscriptions. [^10] The NPCI central portal (upihelp.npci.org.in) is the most reliable single view but its revocation flow still redirects to the parent UPI app for many mandates. [^10]

**4. Scope Blind Spot — Non-UPI Mandates.**

The UPI mandate list in your UPI app or NPCI portal shows **only UPI AutoPay mandates**. It does not show: card-billed subscriptions, Google Play / Apple App Store subscriptions, NACH/e-mandates that debit your bank account directly, wallet auto-reloads, or other standing instructions. [^10] Consumers must check each originating system separately.

## Privacy Implications

### What Data Is Shared

When you register a UPI Mandate, the following data elements are involved:
- Your **VPA (UPI ID)** and bank account details (masked at the PSP level but available to your bank and NPCI).
- **Merchant identity** (name, VPA, merchant ID).
- **Mandate parameters:** amount/frequency/validity.
- **Transaction history:** each execution is logged with amount, timestamp, and status.

The mandate data is stored on **NPCI's switch and your remitter bank's servers**. [^5] NPCI acts as the central clearing infrastructure.

### Key Privacy Concerns

**1. Mandate Data Repurposing.** OC-223 explicitly bars UPI apps from repurposing mandate data beyond display purposes. [^9] However, enforcement of this provision remains to be tested.

**2. Merchant Visibility into Account Details.** Merchants see your VPA and mandate reference but not your bank account number or balance. The merchant's payment aggregator / bank handles the actual settlement. [^5]

**3. Data Retention.** Mandate records persist for the duration of the mandate's validity plus any regulatory retention period applicable to the bank. Consumers have limited visibility into how long historical mandate data is retained after revocation.

**4. Cross-App Visibility Trade-off.** Mandate portability and cross-app visibility (OC-223) improve consumer control but also mean that mandate data is shared more broadly across the UPI ecosystem. The privacy safeguard is that all mandate actions require UPI PIN authentication. [^9]

## Safeguards

### What You Should Do

**1. Audit Your Mandates Regularly.**
- Open your UPI app → Profile → Mandates / AutoPay / Recurring Payments.
- Or visit **upihelp.npci.org.in** → My Mandates (login with mobile number + OTP) for a cross-app view. [^10]
- Cancel every mandate you don't actively use or recognise.

**2. Use the Central Portal.**
- **upihelp.npci.org.in** is NPCI's official portal for viewing and revoking all UPI AutoPay mandates linked to your mobile number, regardless of which UPI app created them. [^10]

**3. Watch for Pre-Debit Notifications.**
- If you receive a pre-debit notification for a mandate you don't recognise, revoke it immediately through your UPI app or the NPCI portal before the scheduled debit.

**4. Report Unauthorised Debits Within 3 Days.**
- Under RBI's zero-liability framework, reporting an unauthorised transaction within **3 working days** entitles you to a full refund. [^17]
- Steps: (a) Raise a UDIR dispute in your UPI app, (b) Inform your bank's nodal officer in writing, (c) If unresolved in 30 days, escalate to the RBI Ombudsman.

**5. Cancel Mandates AND Subscriptions Separately.**
- Revoking a UPI mandate stops the auto-debit but does **not** cancel your subscription with the merchant. You must also cancel the service on the merchant's platform. [^8]

**6. Prefer Fixed Mandates Over Variable Ones.**
- Fixed-amount mandates give you more predictable debits. Variable mandates with high caps can lead to unexpectedly large debits.

### What Regulators Are Doing

- **NPCI OC-223 (Oct 2025):** Mandate portability, cross-app visibility, anti-dark-pattern rules, 90-day port cooling-off, ban on using incentives to push mandate switching, bar on repurposing mandate data. [^9]
- **NPCI Central Portal (Dec 2025):** upihelp.npci.org.in provides a single dashboard for viewing and revoking all UPI AutoPay mandates. [^10]
- **RBI E-Mandate Framework 2026 (Apr 2026):** Consolidated rules, mandatory pre/post-debit notifications, no-charge mandate creation/modification, variable mandate caps, mandatory dispute redressal systems. [^2]
- **NPCI Non-Peak Execution Rule (Aug 2025):** Banks must schedule AutoPay executions during non-peak hours to reduce technical failures. Maximum 4 attempts per mandate per cycle. [^7]
- **RBI Enforcement:** Cashfree Payments penalised ₹3.10 lakh (March 2026) for non-compliance with Payment Aggregator directions, signalling active regulatory enforcement. [^14]

## Complaints & Grievance Redressal

### Tier 1: Merchant / UPI App

- Raise a **UDIR (UPI Dispute Resolution)** complaint through your UPI app for the specific transaction.
- Contact the merchant's customer support to cancel the subscription AND the mandate.

### Tier 2: Bank Nodal Officer

- Write to your bank's **nodal officer** detailing the unauthorised debit, mandate reference, and your cancellation request.
- Under RBI rules, banks must resolve complaints by re-crediting the customer's account within **7 working days** (or up to 10 working days for certain categories) of receiving the complaint. [^17]
- If the bank does not respond within 30 days, or you reject their response, you can escalate.

### Tier 3: RBI Integrated Ombudsman (RB-IOS, 2026)

- File **free of cost** at [cms.rbi.org.in](https://cms.rbi.org.in) or call **14448**.
- The **Reserve Bank – Integrated Ombudsman Scheme, 2026** (effective July 1, 2026) replaced the 2021 scheme with enhanced consumer protections. [^15]
- The Ombudsman can award up to **₹30 lakh for consequential loss** and up to **₹3 lakh for mental agony, time, and expense**. [^15]
- You must first approach the bank and wait 30 days (or the applicable NPCI/card-network window) before filing with the Ombudsman. The complaint must be filed within **90 days** of the bank's response (or 90 days from the deadline if the bank didn't respond). [^15]

### Tier 4: Consumer Court + FIR

- For unresolved disputes or criminal fraud, file a complaint via **e-Daakhil** (the consumer dispute redressal online platform) and/or an FIR at the local police station or through the **National Cyber Crime Reporting Portal** (cybercrime.gov.in) or helpline **1930**. [^16]

### Quick Reference: Escalation Ladder

| Step | Action | Timeline |
| --- | --- | --- |
| 1 | Revoke mandate via UPI app / NPCI portal | Immediate |
| 2 | Raise UDIR dispute in UPI app | Immediately after unauthorised debit |
| 3 | Report to bank (for zero liability) | Within 3 working days of debit notification |
| 4 | Write to bank's nodal officer | If UDIR not resolved |
| 5 | File at RBI Ombudsman (cms.rbi.org.in) | After 30 days of bank complaint / within 90 days |
| 6 | e-Daakhil / FIR (cybercrime.gov.in / 1930) | If Ombudsman doesn't cover the grievance |

## Prime References

[^1]: https://www.npci.org.in/product/autopay — NPCI UPI AutoPay product page
[^2]: https://m.rbi.org.in/scripts/BS_ViewMasDirections.aspx?id=13374 — RBI Digital Payments E-Mandate Framework, 2026 (April 21, 2026)
[^3]: https://www.prnewswire.com/news-releases/npci-introduces-upi-autopay-facility-for-recurring-payment-301098018.html — NPCI UPI AutoPay launch announcement (July 22, 2020)
[^4]: https://m.economictimes.com/tech/technology/upi-autopay-volume-doubles-in-a-year-npci-launches-portal-for-e-mandate-management/articleshow/126172927.cms — Economic Times, UPI Autopay volume doubles (Dec 25, 2025)
[^5]: https://razorpay.com/blog/what-is-upi-mandate — Razorpay, What is UPI Mandate (technical framework)
[^6]: https://www.chargebee.com/docs/payments/2.0/others/rbi-e-mandate — Chargebee, RBI e-Mandate regulations documentation
[^7]: https://www.oxigenwallet.com/upi/upi-autopay — Oxigen Wallet, UPI AutoPay limits and retry rules (2026)
[^8]: https://www.nestapp.in/blogs/upi-autopay-how-to-set-up-manage-recurring-payments-2026 — Nest App, How to Cancel UPI AutoPay (2026)
[^9]: https://timesofindia.indiatimes.com/business/india-business/tracking-upi-autopay-gets-easier/articleshow/126169072.cms — Times of India, NPCI mandate portability and central portal (Dec 2025)
[^10]: https://essara.space/guides/what-is-upi-autopay-how-it-works — Essara, UPI AutoPay mandate management and NPCI portal guide (2026)
[^11]: https://www.instagram.com/reel/DX0_88cTKH5 — Ajay Shokeen, UPI dark patterns and subscription trap data (Jul 2026)
[^12]: https://www.pib.gov.in/PressReleasePage.aspx?PRID=2302664 — PIB, UPI transaction statistics FY 2025-26 (Jul 2026)
[^13]: https://medium.com/@designstudiouiux/upi-autopay-mandate-the-ux-flaw-rbi-caught-b44cdb6b4b2a — Medium, UPI AutoPay UX flaws and failure rates (2026)
[^14]: https://www.mondaq.com/india/fund-management-reits/1796446/fintech-frontline-legal-and-market-intelligence-from-india-twelfth-edition-2026 — Mondaq, Cashfree Payments RBI penalty (Mar 2026)
[^15]: https://www.rbi.org.in/commonman/English/Scripts/FAQs.aspx?Id=3407 — RBI Integrated Ombudsman Scheme, 2026 FAQs (Jul 2026)
[^16]: https://righttoinformation.wiki/upi-autopay-mandate-fraud-india — RTI Wiki, UPI AutoPay Mandate Fraud: Cancel Debits and Recover Money
[^17]: https://www.rbi.org.in/commonman/english/Scripts/SMSLimitedliability.aspx — RBI, Customer Liability for Unauthorised Electronic Banking Transactions
[^18]: https://the-ken.com/kaching/dark-patterns-shadow-upi-autopays-ascent — The Ken, Dark patterns shadow UPI Autopay's ascent (May 2025)
