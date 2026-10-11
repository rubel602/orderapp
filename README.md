# Business Software ERP – Android app + Google Sheet

Android app = ei ERP software ta WebView e chole (offline e kaj kore, data phone e thake).
Google Sheet = data er backup / sync (Apps Script diye).

## 1) APK banano (GitHub e)
1. github.com e notun repository banan (jemon `business-software-android`).
2. Ei folder er shob file (`.github`, `app`, `apps-script`, `build.gradle`, `settings.gradle`, `gradle.properties`) repository te upload korun (Add file -> Upload files).
3. Repository -> **Settings -> General** e giye Public kore din (auto update er jonno). Tarpor **Actions** tab -> "Build Android APK" -> **Run workflow** (ba upload korlei auto chole).
4. 3-5 minute por run er pashe **Artifacts -> BusinessSoftwareERP-apk** download korun, zip khulle `.apk` pabe.
5. Phone e APK install korun (Settings e "Install unknown apps" allow korte hobe).

Software e kono change korle `app/src/main/assets/index.html` file ta notun version diye replace korun, tarpor abar upload korun.

## Auto update (app nijei notun version khuje)
- Protibar GitHub e kichu upload/commit korle workflow notun APK banay ar **Releases** e (v1, v2, v3 …) rakhe.
- App khulle (6 ghonta por por) GitHub er latest Release dekhe. Notun version thakle "New version available" dekhay -> **Update now** -> download -> Install.
- Prothom bar Android "Install unknown apps" allow korte bolbe, ekbar-i.
- Shob build ek-i signing key (`app/release.jks`) diye hoy, tai update korle phone er data muche jay na.
- **Repository ke Public rakhte hobe**, na hole app GitHub theke version dekhte parbe na (Private hole update auto hobe na, shudhu hate APK install korte hobe).
- App er Data Backup -> Google Sheet sync card e "Check for update" button o ache.

## update.zip diye GitHub file auto update
Software e notun kichu hole ami ekta `update.zip` dibo (bhitore notun `index.html` ar onno file, `.github` chhara).
1. GitHub repository te jan -> **Add file -> Upload files**.
2. `update.zip` file ta **zip obosthay-i** (khulben na) repository er shobar upore (root e) drag kore din -> Commit.
3. "Apply update.zip" workflow nijei zip khule file bodle dey, zip muche dey, tarpor notun APK build kore Release e dey.
4. Kichukkhon por phone e app khulle "New version available" ashbe.
(Ei auto apply kaj korar jonno `.github/workflows/apply-update.yml` file ta prothom bar repository te thakte hobe. Ei zip e deya ache.)

## 2) Google Sheet sync
1. Google Sheet e jan -> **Extensions -> Apps Script**.
2. `apps-script/Code.gs` er shob code paste korun. `SECRET` er jaiga e nijer ekta boro secret shobdo likhun.
3. **Deploy -> New deployment -> Web app** -> Execute as: **Me**, Who has access: **Anyone** -> Deploy. (Prothom bar permission chaile Allow korun.)
4. Web app URL ta copy korun.
5. App e: **Data Backup -> Google Sheet sync** -> (URL age thekei boshano ache, bodlale notun URL din) shudhu Secret key boshan -> **Test connection** -> **Sync now**.
6. "Auto-sync" tick dile data change hole protimin ute auto Sheet e jabe.
7. Notun phone e / data hariye gele: ei sheet er URL ar key boshiye **Restore from Sheet**.

Sheet e tab gulo: Customers, Suppliers, Products, Sales, Collections, Route Plan (porar jonno), ar ekta hidden `_data` tab (puro data, restore er jonno).

## Shotorkota
- Sheet e puro data thake, login password er hash shoho. Sheet ta private rakhun, keo er sathe share korben na.
- Secret key ar URL jar kache thakbe se data pathate/niye nite pare.
- App e data phone e thake. Sheet sync ekdik theke arekdike "replace" kore, tai ek-i somoy duto phone e kaj korle shesh sync jitbe.
