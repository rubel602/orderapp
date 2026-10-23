# Business Software ERP – Android + Windows

## Quick download

- **Android APK — direct download:** https://github.com/rubel602/orderapp/releases/latest/download/BusinessSoftwareERP.apk
- **Android releases/download page:** https://github.com/rubel602/orderapp/releases
- **Android build status:** https://github.com/rubel602/orderapp/actions/workflows/android.yml
- **Windows installer:** https://github.com/rubel602/orderapp/releases/download/win-latest/BusinessSoftwareERP-Setup-1.0.6.exe

If the direct Android link does not download, open the releases page above, open the newest **Android APK** release, and tap `BusinessSoftwareERP.apk` under Assets. On your phone, open the downloaded APK from Downloads and allow your browser/file manager to install unknown apps if Android asks.

## Project structure

```
index.html          <- main software source
app/                <- Android app (WebView) project
windows/            <- Windows EXE (Electron) project
apps-script/Code.gs <- Google Sheet sync script
.github/workflows/  <- automatic build workflows
```

## Android build and download

Every push to `main` runs **Build Android APK**. It builds a signed APK, uploads a 90-day workflow artifact for troubleshooting, and creates a versioned Android release. Use the direct download link above to download the APK file without downloading an Actions artifact ZIP.

## Updating the software

1. Update `index.html` in the repository.
2. Commit the change to `main`.
3. Open Actions and wait for **Build Android APK** to finish successfully.
4. Download the APK using the direct link above.

## Google Sheet sync

1. Open the Google Sheet → Extensions → Apps Script and add `apps-script/Code.gs`.
2. Set your own `SECRET` in Apps Script and deploy it as a Web app.
3. In the app, open **Data Backup → Google Sheet sync**, enter the secret, test the connection, and sync.
4. On a new device, use **Restore from Sheet**.

## Important data note

Android and Windows keep separate local data unless Google Sheet sync is configured. Back up important data before reinstalling or restoring. A software update is not intended to erase local data.
