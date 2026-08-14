# Tool: sherlock

## Purpose
Define integration contract and operating notes for sherlock.

## Inputs
- Query payload
- Workspace context

## Outputs
- Normalized enrichment or verification result
- Raw diagnostic metadata

## Runtime
- Execution mode: worker job
- Failure mode: retry then fallback

## Related Specs
- ../../opensource_leadgen_and_osint_tools.md
- ../../data_pipeline.md

## Code Upload Targets
- src/tools/sherlock/
- src/workers/osint/
