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
# Slide images for the portal's deck viewer (needs LibreOffice and pdftoppm; skipped if missing, cached images are reused)
if command -v soffice >/dev/null 2>&1 && command -v pdftoppm >/dev/null 2>&1; then
  tmp="$(mktemp -d)"
  soffice --headless --convert-to pdf --outdir "$tmp" ../presentation/AI-SDLC-Process-Implementation.pptx >/dev/null
  rm -rf deck_cache && mkdir deck_cache
  pdftoppm -jpeg -jpegopt quality=82 -scale-to-x 1600 -scale-to-y -1 "$tmp"/*.pdf deck_cache/slide
fi
# The portal (../site) copies the tracker: recalculate X01 first if LibreOffice is available
node build_site2.js
echo "Done. Open templates/X01-AI-SDLC-Tracker.xlsx in Excel or LibreOffice and save once so formulas have cached values, then rerun node build_site2.js."
