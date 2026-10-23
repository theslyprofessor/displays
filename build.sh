#!/bin/bash
# Build and install Displays.app (menu bar + window display preset manager by room/machine) + CLI.
set -euo pipefail
cd "$(dirname "$0")"
chmod +x bin/displays
ln -sf "$PWD/bin/displays" ~/.local/bin/displays
APP=~/Applications/Displays.app
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"
swiftc -O -swift-version 5 -o "$APP/Contents/MacOS/Displays" Sources/DisplaysApp.swift
cp app/Info.plist "$APP/Contents/Info.plist"
IDENTITY=$(security find-identity -v -p codesigning | awk -F'"' '/Apple Development|Developer ID Application/{print $2; exit}')
codesign --force --sign "${IDENTITY:--}" "$APP"
osascript -e 'tell application id "com.nakul.displays" to quit' 2>/dev/null || true
for _ in 1 2 3 4 5; do pgrep -f "Displays.app/Contents/MacOS/Displays" >/dev/null || break; sleep 1; done
open "$APP"
echo "Displays.app installed and running at $APP"
