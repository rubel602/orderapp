const { app, BrowserWindow, shell, Menu, dialog, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

let win = null;
let manualCheck = false;

if (!app.requestSingleInstanceLock()) {
  app.quit();
}
app.on('second-instance', () => {
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

function isExternal(url) {
  return /^(https?:|mailto:|tel:|whatsapp:)/i.test(url);
}

function createWindow() {
  Menu.setApplicationMenu(null);
  win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 650,
    show: false,
    backgroundColor: '#f4f5fa',
    title: 'Business Software ERP',
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false
    }
  });
  win.once('ready-to-show', () => {
    win.maximize();
    win.show();
  });
  win.loadFile(path.join(__dirname, 'app', 'index.html'));

  // window.open(...) (WhatsApp, maps, ...) opens in the default browser / app
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isExternal(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('file://')) {
      e.preventDefault();
      if (isExternal(url)) shell.openExternal(url);
    }
  });

  // F11 = full screen, Ctrl+R = reload
  win.webContents.on('before-input-event', (e, i) => {
    if (i.type !== 'keyDown') return;
    if (i.key === 'F11') {
      win.setFullScreen(!win.isFullScreen());
      e.preventDefault();
    } else if (i.control && i.key.toLowerCase() === 'r') {
      win.webContents.reload();
      e.preventDefault();
    }
  });
}

/* ------------------------------------------------------------ auto update */
function setupUpdater() {
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('update-available', (info) => {
    if (manualCheck && win) {
      dialog.showMessageBox(win, {
        type: 'info',
        message: 'New version ' + info.version + ' found. It is downloading in the background.'
      });
    }
  });
  autoUpdater.on('update-not-available', () => {
    if (manualCheck && win) {
      dialog.showMessageBox(win, { type: 'info', message: 'You have the latest version (' + app.getVersion() + ').' });
    }
    manualCheck = false;
  });
  autoUpdater.on('error', () => {
    if (manualCheck && win) {
      dialog.showMessageBox(win, {
        type: 'warning',
        message: 'Could not check for updates. Check the internet connection and that the GitHub repository is Public.'
      });
    }
    manualCheck = false;
  });
  autoUpdater.on('update-downloaded', (info) => {
    manualCheck = false;
    if (!win) return;
    dialog
      .showMessageBox(win, {
        type: 'question',
        buttons: ['Restart and update', 'Later'],
        defaultId: 0,
        cancelId: 1,
        message: 'Version ' + info.version + ' is ready.',
        detail: 'Your data stays on this computer. The app restarts to finish the update.'
      })
      .then((r) => {
        if (r.response === 0) autoUpdater.quitAndInstall();
      });
  });

  if (app.isPackaged) {
    autoUpdater.checkForUpdates().catch(() => {});
    setInterval(() => autoUpdater.checkForUpdates().catch(() => {}), 6 * 3600 * 1000);
  }
}

ipcMain.on('app:version', (e) => {
  e.returnValue = app.getVersion();
});
ipcMain.on('app:check', () => {
  if (!app.isPackaged) {
    if (win) dialog.showMessageBox(win, { type: 'info', message: 'Updates work only in the installed app.' });
    return;
  }
  manualCheck = true;
  autoUpdater.checkForUpdates().catch(() => {});
});

app.whenReady().then(() => {
  createWindow();
  setupUpdater();
});
app.on('window-all-closed', () => app.quit());
