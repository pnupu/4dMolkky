#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"

sdk_path="$(xcrun --sdk iphoneos --show-sdk-path)"
build_path="$PWD/build/iphoneos"
app_path="$build_path/PhoneController.app"
mkdir -p "$app_path" "$build_path/modules" "$build_path/module-cache"

xcrun --sdk iphoneos swiftc -swift-version 6 -parse-as-library -sdk "$sdk_path" \
    -target arm64-apple-ios17.0 -module-cache-path "$build_path/module-cache" \
    -emit-library -static -emit-module -module-name PhoneThrowCore \
    -emit-module-path "$build_path/modules/PhoneThrowCore.swiftmodule" \
    Sources/PhoneThrowCore/*.swift -o "$build_path/libPhoneThrowCore.a"

xcrun --sdk iphoneos swiftc -swift-version 6 -parse-as-library -sdk "$sdk_path" \
    -target arm64-apple-ios17.0 -module-cache-path "$build_path/module-cache" \
    -I "$build_path/modules" -L "$build_path" -lPhoneThrowCore \
    -Xlinker -no_adhoc_codesign \
    App/*.swift -o "$app_path/PhoneController"

cp App/Info.plist "$app_path/Info.plist"
plutil -lint "$app_path/Info.plist"
printf 'Unsigned iOS scaffold: %s\n' "$app_path"
