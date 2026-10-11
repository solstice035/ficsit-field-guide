#!/usr/bin/env sh
# Regenerates model/generated/* from the LinkML schema. Needs uv (https://docs.astral.sh/uv/).
set -eu
cd "$(dirname "$0")"
# Pin Python and (via --exclude-newer) LinkML's dependencies: gen-sqlddl orders
# indexes differently on other Python versions, and CI checks for drift.
LINKML="uvx --python 3.13 --exclude-newer 2026-10-11 --from linkml==1.12.0"
mkdir -p generated
$LINKML gen-json-schema ficsit.linkml.yaml > generated/ficsit.schema.json
# gen-sqlddl emits each table's CREATE INDEX lines in an unstable order, so
# sort each run of them to keep the drift check meaningful.
$LINKML gen-sqlddl ficsit.linkml.yaml | python3 -c '
import sys
out, run = [], []
for line in sys.stdin:
    if line.startswith("CREATE INDEX"):
        run.append(line)
        continue
    out += sorted(run) + [line]
    run = []
sys.stdout.write("".join(out + sorted(run)))
' > generated/ficsit.sql
$LINKML gen-jsonld-context ficsit.linkml.yaml > generated/ficsit.context.jsonld
$LINKML gen-shacl ficsit.linkml.yaml > generated/ficsit.shacl.ttl
