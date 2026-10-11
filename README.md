# Business Software ERP – Android + Windows, ek-i GitHub repository

```
index.html          <- SOFTWARE ER ASOL FILE. Software bodlate shudhu eta bodlan
android/            <- Android app (WebView) project
windows/            <- Windows EXE (Electron) project
apps-script/Code.gs <- Google Sheet sync script
.github/workflows/  <- auto build + auto update
```
`index.html` ek-i file theke Android ar Windows duto-i toiri hoy. Software e notun kichu hole shudhu `index.html` bodlalei duto app notun hoye jay.

## 1) Prothom bar setup
1. github.com e notun repository banan, jemon `business-software`. **Public** rakhun (auto update er jonno).
2. Ei zip er shob file (`.github` shoho) upload korun (Add file -> Upload files).
3. **Actions** tab e "Build Android APK" ar "Build Windows EXE" duto-i nijei chalu hobe (na hole Run workflow). Android 3-5 min, Windows 5-8 min.
4. Sesh hole repository er daan pashe **Releases** e duto release thakbe:
   - **Android (latest)** -> `BusinessSoftwareERP.apk` (phone e install korun)
   - **Windows (latest)** -> `BusinessSoftwareERP-Setup-1.0.x.exe` (computer e install korun)
   Windows e "Windows protected your PC" ashle **More info -> Run anyway** (digital signature nei).
5. Android: "Install unknown apps" allow korte hobe (prothom bar).

## 2) Software bodle (update.zip)
Ami notun `update.zip` dile:
1. Repository -> **Add file -> Upload files** -> `update.zip` zip obosthay-i (khulben na) root e drag kore Commit.
2. "Apply update.zip" workflow zip khule file bodlay, zip muche, Android + Windows duto-i abar build kore.
3. Kichukkhon por phone ar computer e app khulle "New version available / Restart and update" ashbe.
Ba nijei: repository te `index.html` file ta pencil/Upload diye replace kore Commit korun, eo duto build hoy.

## 3) Auto update kibhabe
- Android: app protie 6 ghonta e `android-latest` release er `version.txt` dekhe, notun thakle Update now dekhay.
- Windows: installed app `win-latest` release er `latest.yml` dekhe, nijei download kore Restart and update dekhay.
- Data (phone/computer e) update e muche jay na. Data Backup page e "Check for update" button o ache.

## 4) Google Sheet
1. Google Sheet -> Extensions -> Apps Script -> `apps-script/Code.gs` paste, `SECRET` bodlan.
2. Deploy -> New deployment -> Web app -> Execute as: Me, Who has access: Anyone.
3. App e Data Backup -> Google Sheet sync -> Secret key din (URL age thekei boshano), Test connection -> Sync now.
Notun phone/computer e data anar jonno: Restore from Sheet.

## Shotorkota
- Public repository te software er code (index.html) ar Android signing key (`android/app/release.jks`) sobai dekhte pabe. Apnar Sheet er Secret key repository te nei.
- Duto app e ek-i data nei, protita device e nijer data thake. Data share korte Google Sheet sync use korun (shesh sync jitbe).
