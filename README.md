# Business Software ERP – Android + Windows

## Quick download

- **Android APK — direct download:** https://github.com/rubel602/orderapp/releases/download/android-latest/BusinessSoftwareERP.apk
- **Android download page:** https://github.com/rubel602/orderapp/releases/tag/android-latest
- **Windows installer:** https://github.com/rubel602/orderapp/releases/download/win-latest/BusinessSoftwareERP-Setup-1.0.6.exe
- **Build status / older APK artifact:** https://github.com/rubel602/orderapp/actions/workflows/android.yml

If the direct Android link does not download, open the Android download page above and tap `BusinessSoftwareERP.apk) under Assets. On your phone, open the downloaded APK from Downloads and allow your browser/file manager to install unknown apps if Android asks.

## Project structure

```
index.html          <- main software source
app/                <- Android app (WebView) project
windows/            <- Windows EXE (Electron) project
apps-script/Code.gs <- Google Sheet sync script
.github/workflows/  <- automatic build workflows
```

The Android workflow now builds a signed APK, gives it a stable download filename, and publishes it to the `android-latest` GitHub Release so it can be downloaded without opening the Actions artifact ZIP. Each new successful build replaces the APK attached to that release.

## Updating the software

1. Update `index.html` in the repository.
2. Commit the change to `main`.
3. Open Actions and wait for **Build Android APK** to finish successfully.
4. Download the new APK using the direct link above.

## Google Sheet sync

1. Open the Google Sheet → Extensions → Apps Script and add `apps-script/Code.gs`.
2. Set your own `SECRET` in Apps Script and deploy it as a Web app.
3. In the app, open **Data Backup → Google Sheet sync**, enter the secret, test the connection, and sync.
4. On a new device, use **Restore from Sheet**.

## Important data note

Android and Windows keep separate local data unless Google Sheet sync is configured. Back up important data before reinstalling or restoring. A software update is not intended to erase local data.
