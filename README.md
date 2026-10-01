# OrderApp (Android + Google Sheets backend)

Login/register, change password, create order, view orders + delivery status
(PENDING -> APPROVED -> SHIPPED -> DELIVERED / REJECTED), and a Manager tab to approve/reject/update orders.

## 1. Google Sheet backend
1. Create a new Google Sheet.
2. Extensions -> Apps Script. Replace the code with `apps-script/Code.gs`. Save.
3. Deploy -> New deployment -> type **Web app** -> Execute as: **Me**, Who has access: **Anyone** -> Deploy. Authorize when asked.
4. Copy the Web app URL (ends with `/exec`).
5. In the app, open `Repo.kt` and paste it into `SCRIPT_URL`.
Tabs Users / Orders / Sessions are created automatically on first use.
(After editing Code.gs later: Deploy -> Manage deployments -> edit -> New version.)

## 2. Make a manager
Register the account in the app, then open the **Users** tab in the sheet and change that row's `role` from `user` to `manager`.

## 3. Run
Open the folder in Android Studio (generates the Gradle wrapper) and run on a device/emulator.

## 4. Push to GitHub
    git init && git add . && git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/<you>/OrderApp.git
    git push -u origin main
Tip: keep your web app URL out of public repos (anyone with it can call your API).
