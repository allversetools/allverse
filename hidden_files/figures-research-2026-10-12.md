# Pakistan Figures Research — 2026-10-12
Research for AllVerse calculator live-verification (Batch 1: Pakistan + Islamic + money tools).
All figures checked against web sources on 2026-10-12. "Effective date" = when the figure took effect.

## 1. FBR salaried income tax slabs

### (a) Tax Year 2026 = Finance Act 2025 (1 Jul 2025 – 30 Jun 2026) — 6 slabs

| Taxable salary (Rs) | Tax |
|---|---|
| Up to 600,000 | Nil |
| 600,001 – 1,200,000 | 1% of amount over 600,000 |
| 1,200,001 – 2,200,000 | 6,000 + 11% of amount over 1,200,000 |
| 2,200,001 – 3,200,000 | 116,000 + 23% of amount over 2,200,000 |
| 3,200,001 – 4,100,000 | 346,000 + 30% of amount over 3,200,000 |
| Above 4,100,000 | 616,000 + 35% of amount over 4,100,000 |
| Surcharge | 9% of tax payable where taxable income > Rs 10,000,000 |

Sources: Finance Act 2025; FBR Circular No. 01 of 2025-26. Cross-checked: ict.edu.pk
(https://www.ict.edu.pk/blogs/steps-filing-income-tax-return-pakistan-2026),
taxaccountant.pk (https://taxaccountant.pk/tax-calculator-2023-24-for-fbr-pakistan/),
guidedbite.com (https://www.guidedbite.com/tax-calculator-salaried-pakistan).

**Matches our site's 8-slab values? NO — correct each as follows:**
Our site's values (116000+20%, 316000+25%, 541000+29%, 976000+32%, 1424000+35%)
are the **Tax Year 2027** slabs (Finance Act 2026, assented 26 June 2026), NOT TY2026:

### (b) Tax Year 2027 = Finance Act 2026 (1 Jul 2026 – 30 Jun 2027) — 8 slabs (CURRENT year as of Oct 2026)

| Taxable salary (Rs) | Tax |
|---|---|
| Up to 600,000 | Nil |
| 600,001 – 1,200,000 | 1% of amount over 600,000 |
| 1,200,001 – 2,200,000 | 6,000 + 11% of amount over 1,200,000 |
| 2,200,001 – 3,200,000 | 116,000 + 20% of amount over 2,200,000 |
| 3,200,001 – 4,100,000 | 316,000 + 25% of amount over 3,200,000 |
| 4,100,001 – 5,600,000 | 541,000 + 29% of amount over 4,100,000 |
| 5,600,001 – 7,000,000 | 976,000 + 32% of amount over 5,600,000 |
| Above 7,000,000 | 1,424,000 + 35% of amount over 7,000,000 |
| Surcharge | Abolished for salaried individuals |

Source: Finance Act 2026; statutory table verified Aug 2026 at
https://github.com/smafnan/pakistan-salary-tax-calculator/blob/HEAD/README.md
("Rates last verified: August 2026").

**Recommendation:** our site's 8 figures are CORRECT for the current tax year (Oct 2026 falls
in TY2027), but the calculator must be labeled "Tax Year 2027 (Finance Act 2026),
effective 1 July 2026" — not "Tax Year 2026". Add "last updated" + source line on the page.

## 2. PTA mobile import tax (DIRBS) — duty + sales tax by value band

Source: Pakistan Observer, "Passport vs CNIC: PTA tax rate — January 2026 Update"
https://pakobserver.net/passport-vs-cnic-pta-tax-rate-for-mobile-phones-january-2026-update/

| Phone value | Passport (within 60 days of arrival) | CNIC |
|---|---|---|
| Up to $30 | Rs 430 | Rs 550 |
| $30 – $100 | Rs 3,200 | Rs 4,323 |
| $100 – $200 | Rs 9,580 | Rs 11,561 |
| $200 – $350 | Rs 12,200 + 17% sales tax | Rs 14,661 + 17% sales tax |
| $350 – $500 | Rs 17,800 + 17% sales tax | Rs 23,420 + 17% sales tax |
| Above $500 | Rs 27,600 + 17% sales tax | Rs 37,007 + 17% sales tax |

Effective: DIRBS schedule as of Jan 2026 update (duty-free traveler facility ended Jul 2019).
Updates since: (i) Finance Act 2026-27 cut $101–200 band duties from 1 Jul 2026
(regulatory duty 7,500→6,000; income tax 930→100; mobile levy 600→20 — commercial-import
channel; https://propakistani.pk/2026/06/24/govt-reduces-pta-tax-on-mid-range-mobile-phones/);
(ii) FBR Circular No. 1 of 2026 (11 Sep 2026) allows sales tax on imported phones in
installments via DIRBS (https://bloompakistan.com/fbr-approves-installments-for-imported-phone-taxes/).
**Matches our site?** Site's bands/rates to be compared against the table above; the 17%
sales-tax-on-upper-bands and passport/CNIC split must be shown. Add source + date note.

## 3. LESCO/NEPRA domestic (A-1) unit rates — current as of Oct 2026

Source: Federal government notification 12 Feb 2026 (uniform tariff incl. K-Electric),
reported page-by-page at https://pakera.pk/electricity-unit-price-slab-rates-pakistan-2026/
(updated 10 Oct 2026); corroborated by a1blogs.com and pricedata.pk.

| Slab (units/month) | Rs/unit | Site value | Match? |
|---|---|---|---|
| Lifeline 1 – 50 | 3.95 | 3.95 | ✅ yes |
| Lifeline 51 – 100 | 7.74 | 7.74 | ✅ yes |
| Protected 1 – 100 | 10.54 | (missing?) | ⚠️ site has no 10.54 entry — add |
| Protected 101 – 200 | 13.01 | 13.01 | ✅ yes |
| Unprotected 1 – 100 | 22.44 | 22.44 | ✅ yes |
| Unprotected 101 – 200 | 28.91 | 28.91 | ✅ yes |
| 201 – 300 | 33.10 | 33.10 | ✅ yes |
| 301 – 400 | 36.46 | 37.99 | ❌ correct to 36.46 |
| 401 – 500 | 38.95 | 40.22 | ❌ correct to 38.95 |
| 501 – 600 | 40.22 | 41.62 | ❌ correct to 40.22 |
| 601 – 700 | 41.85 | 42.76 | ❌ correct to 41.85 |
| Above 700 | 47.20 | 47.69 | ❌ correct to 47.20 |

Effective date: 12 Feb 2026 notification (NEPRA uniform tariff; Jan 2026 NEPRA decision
kept the older upper-slab values our site still uses — superseded).
Notes: fixed charges Rs 200–675/kW by slab; lifeline = ≤100 units/month; protected =
≤200 units/month for previous 6 months. Subsidies due to move to BISP-targeted from
Jan 2027 (pakera.pk, 10 Oct 2026). Bills also carry FCA/quarterly adjustments — page
should say rates are base tariff before taxes/adjustments, with "last updated" + source.

## 4. Punjab stamp duty 2026

| Item | Figure |
|---|---|
| Urban property | **1%** of value |
| Rural/other areas | **1%** of value (reduced from 3%) |
| Extra stamp duty on registration | Rs 500 (up to Rs 500k value); Rs 1,000 above |
| Transactions completed >12 months | up to 2% (per ordinance reports) |

Source: Stamp (Amendment) Ordinance 2026, approved by Governor Punjab 10 Apr 2026;
Stamp (Amendment) Act 2026 published in Punjab Gazette 6 May 2026.
https://www.zameen.com/news/punjab-slashes-stamp-duty.html,
https://tribune.com.pk/story/2603069/punjab-moves-to-cut-stamp-duty-on-property-transactions-from-3-to-1
Legal nuance (flag): pakera.pk (updated Oct 2026,
https://pakera.pk/punjab-property-e-registration/) notes the consolidated Stamp Act text
still shows 2% urban and the Punjab Finance Act 2026 did not amend it — but the
market/official consensus since April 2026 is uniform 1%. Page should show 1% with
source + date note.
**Matches our site?** Site uses 1% rural Punjab — correct, but extend to 1% urban too
(uniform since Apr 2026).
Other provinces (brief): Sindh immovable property tax 1% via e-Stamping (Dawn, 23 Apr 2026,
https://www.dawn.com/news/1994274). KPK/Balochistan current rates **unverifiable** from
sources found (aggregator sites claim 4% but conflict with official news — do not use).
FBR advance taxes (context): buyer 236K 1.25% (ATL) / 10.5–18.5% (non-ATL); seller 236C
2.75% (ATL) / 11.5% (non-ATL) — pakera.pk Oct 2026.

## 5. Zakat nisab 2026

| Item | Figure |
|---|---|
| Nisab (bank deduction), Zakat year 1446–47 AH | **Rs 503,529** |
| Basis | Value of 612.32 g silver (≈52.5 tola) |
| Deduction date | 1 Ramadan 1447 AH (≈19–20 Feb 2026) |
| Previous year (2025) | Rs 179,689 |

Source: Administrator General Zakat notification via Ministry of Poverty Alleviation
and Social Safety, dated 16 Feb 2026; SBP BPRD Circular Letter No. 03 of 2026 dated
17 Feb 2026. https://www.brecorder.com/news/40407690,
https://www.geo.tv/latest/651314-ramadan-2026-govt-announces-zakat-nisab-heres-what-you-need-to-know
Note: new nisab for Ramadan 1448 will be notified ~Feb 2027 — page must show
"last updated" and not hardcode this forever.

## 6. Gold rate Pakistan, Oct 2026

| Item | Figure |
|---|---|
| 24K per tola (10–12 Oct 2026) | **≈ Rs 440,636 – 442,036** |
| 24K per 10 g | ≈ Rs 377,774 – 378,974 |
| Silver per tola | ≈ Rs 6,512 – 6,752 |

Source: All Pakistan Sarafa Gems & Jewellers Association, as reported 10–12 Oct 2026:
https://www.samaa.tv/2087358268-gold-price-in-pakistan-rises-again-oct-10-2026,
https://pakobserver.net/gold-rates-in-pakistan-today-24-22-and-21-karat-prices-on-12-october-2026/
**Where live rates come from:** the Association has NO official website or public API
(rates are issued to media daily). → Recommendation: manual-rate input with date note,
or a clearly-labeled third-party feed; never hardcode. Show "as of {date}".

## 7. USD/PKR interbank, 11–12 Oct 2026

| Item | Figure |
|---|---|
| Interbank buying (12 Oct 2026) | **Rs 276.90** |
| Interbank selling (12 Oct 2026) | **Rs 277.40** |
| Open market (12 Oct) | 277.50 / 278.10 |

Sources: http://hamariweb.com/finance/forex/CurrenyconvertNew.aspx?ccode=USD,
https://pakobserver.com.pk/forex/interbank-exchange-rates-today-in-pakistan-latest-pkr-rates-26/
**Where live rates come from:** SBP publishes interbank closing rates; there is no free
official SBP API for live rates. → Recommendation: manual-rate input (default = latest
checked rate with date) or a forex API with source attribution; always show "as of {date}".

## 8. Prayer-time calculation method for Pakistan

| Item | Figure |
|---|---|
| Standard method | **University of Islamic Sciences, Karachi** |
| Fajr angle | **18°** |
| Isha angle | **18°** |
| Asr juristic method | Hanafi (shadow = 2×) |

Confirmed by: https://getsalahtime.com/cities/karachi.html ("standard convention in
Pakistan"), adhan-kotlin README (https://github.com/batoulapps/adhan-kotlin/blob/main/README.md),
https://dev.to/wesalna/why-two-prayer-time-apps-disagree-by-one-or-two-minutes-15df
No official government notification sets this; it is the universally used convention in
Pakistan (also used by Aladhan API method=1). Page should name the method + angles.
