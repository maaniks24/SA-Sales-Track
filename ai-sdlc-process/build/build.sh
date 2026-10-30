#!/usr/bin/env bash
# Rebuilds every artifact from process_data.js. Requires: node with docx, pptxgenjs, sharp, react, react-dom,
# react-icons, jszip; python3 with openpyxl; LibreOffice for the optional formula recalculation.
set -euo pipefail
cd "$(dirname "$0")"
export NODE_PATH="${NODE_PATH:-}:$(npm root -g):$(cd ../../ai-sdlc-session && pwd)/node_modules"
node diagrams.js
node build_process_doc3.js
node build_templates.js
python3 build_tracker.py
node build_context_pack.js
cat deck_base.js deck_slides1.js deck_slides2.js > build_impl_deck.js
node build_impl_deck.js
echo "Done. Recalculate templates/X01-AI-SDLC-Tracker.xlsx in Excel or LibreOffice before distributing (formulas have no cached values)."
