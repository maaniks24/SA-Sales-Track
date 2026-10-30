# CP-23 Validation and Error Registry

| Owner | Version | Status |
|---|---|---|
| Architect | 1.0-draft | STARTER — the owner completes every `OWNER TO COMPLETE` block before go-live |

The only valid source of validation IDs and error codes. SFVDs, code and tests may use only IDs listed here. New entries come through T14.

> **For AI:** this file is binding. If something you need is not defined here, list it under OPEN QUESTIONS in your self-check. Do not invent it.

| Validation ID | Rule | Error code | Message text | Used by screens / APIs |
|---|---|---|---|---|
| `EXAMPLE VAL-DT-004` | Date must not be in a closed period | `ERR-AST-112` | The date falls in a closed accounting period. | DEP-SCR-07 |

> **OWNER TO COMPLETE:** migrate the existing validation and error codes from the product. Remove the EXAMPLE row.
