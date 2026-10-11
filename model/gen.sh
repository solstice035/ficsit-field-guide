#!/usr/bin/env sh
# Regenerates model/generated/* from the LinkML schema. Needs uv (https://docs.astral.sh/uv/).
set -eu
cd "$(dirname "$0")"
# Pin Python and (via --exclude-newer) LinkML's dependencies: gen-sqlddl orders
# indexes differently on other Python versions, and CI checks for drift.
LINKML="uvx --python 3.13 --exclude-newer 2026-10-11 --from linkml==1.12.0"
mkdir -p generated
$LINKML gen-json-schema ficsit.linkml.yaml > generated/ficsit.schema.json
$LINKML gen-sqlddl ficsit.linkml.yaml > generated/ficsit.sql
$LINKML gen-jsonld-context ficsit.linkml.yaml > generated/ficsit.context.jsonld
$LINKML gen-shacl ficsit.linkml.yaml > generated/ficsit.shacl.ttl
