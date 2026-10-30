# CP-30 Test Standards

| Owner | Version | Status |
|---|---|---|
| QA Lead | 1.0-draft | STARTER — the owner completes every `OWNER TO COMPLETE` block before go-live |

How test cases are written, named and automated, so AI-generated tests look like ours.

> **For AI:** this file is binding. If something you need is not defined here, list it under OPEN QUESTIONS in your self-check. Do not invent it.

## Test case template and IDs
Use T07. Test case ID: `TC-<MOD>-<REQ nnn>-<nn>`.

## Negative and boundary pattern library
| Pattern | Apply to | Example |
|---|---|---|
| Closed-period posting | Any dated financial transaction | Post depreciation into a closed month |
| Mid-period start | Depreciation | Put-to-use on the 15th |
| Transfer within period | Transfers | Transfer on the 20th; one charge only |
| Leap year | Date arithmetic | 29 February |
| OWNER TO COMPLETE | | |

## Automation patterns
> **OWNER TO COMPLETE:** page-object pattern, locator strategy, waits policy (no fixed waits), tagging, data-driven style.

## Device, browser and role matrix
> **OWNER TO COMPLETE:** supported devices / OS versions, browsers, and roles every feature is tested with.
