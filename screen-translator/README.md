# Screen Translator

Android live screen translator MVP.

## What it does
- Captures the device screen after the user approves screen capture.
- OCRs visible text.
- Detects the source language.
- Uses the phone's current system language as the translation target.
- Draws the translated text as a non-touch overlay at the original text coordinates with an approximate size.

## Important
This is an MVP. Exact font recreation, background reconstruction, and all writing systems require additional OCR/rendering work. The current OCR module is optimized for Latin text.

## Build
GitHub Actions builds a debug APK from `app/build/outputs/apk/debug/app-debug.apk` and publishes it as the `screen-translator-debug` workflow artifact.
