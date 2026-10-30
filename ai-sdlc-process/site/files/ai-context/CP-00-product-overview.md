# CP-00 Product Overview and Domain Glossary

| Owner | Version | Status |
|---|---|---|
| Architect | 1.0-draft | STARTER — the owner completes every `OWNER TO COMPLETE` block before go-live |

What the product is, how it is divided, and the domain vocabulary AI must use precisely.

> **For AI:** this file is binding. If something you need is not defined here, list it under OPEN QUESTIONS in your self-check. Do not invent it.

## Surfaces
| Surface | Description | Golden example |
|---|---|---|
| Web application + microservices | Loosely coupled services behind the web front end | CP-99/microservice |
| Mobile application | Field use: scanning, labelling, physical verification; works offline | CP-99/mobile |
| Internal web applications | Finance, admin and audit back-office screens | CP-99/internal-web |

## Modules and ID prefixes
- FAM asset master
- DEP depreciation
- LBL labelling and tracking
- AUD validation and audit
- PLT platform

> **OWNER TO COMPLETE:** list every microservice with its bounded context, owning team and data it owns.

## Domain glossary
| Term | Definition in this product |
|---|---|
| Asset class | `OWNER TO COMPLETE` |
| SLM (straight-line method) | Equal charge per period over useful life after salvage value |
| WDV (written-down value) | Fixed rate applied to the opening carrying amount each period |
| Useful life | `OWNER TO COMPLETE` (by asset class) |
| Put-to-use date | Date from which depreciation starts |
| CWIP | Capital work in progress; not depreciated until capitalised |
| NBV | Net book value = cost − accumulated depreciation − impairment |
| Impairment / revaluation | `OWNER TO COMPLETE` |
| Disposal / retirement | `OWNER TO COMPLETE` |
| Label / tag | `OWNER TO COMPLETE` (barcode and RFID formats) |
| Physical verification | `OWNER TO COMPLETE` (statuses, discrepancy handling) |

> **OWNER TO COMPLETE:** confirm every definition against the company accounting policy, and add the policy reference.
