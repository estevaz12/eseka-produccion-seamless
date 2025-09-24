const {
  app,
  BrowserWindow,
  session,
  utilityProcess,
  Tray,
  Menu,
} = require('electron');
const path = require('path');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const processMonitorMessages = require('./utils/processMonitorMessages');
const log = require('./utils/log');

app.setAppUserModelId('Tejeduria');

// to avoid squirrel multiple app spawning
if (require('electron-squirrel-startup')) app.quit();

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('America/Buenos_Aires');

app.commandLine.appendSwitch('lang', 'es-419');

let mainWindow;
let tray;
let monitorProcess;

function startNServerMonitor() {
  log(mainWindow, '[MAIN] Starting NServer monitor...');

  monitorProcess = utilityProcess.fork(
    path.join(__dirname, 'nserverMonitor.js')
  );

  monitorProcess.on('message', (msg) => {
    // handle and notify accordingly
    processMonitorMessages(mainWindow, msg);
  });
}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    title: 'Tejeduría',
    width: 1366,
    height: 727,
    icon: path.join(__dirname, 'assets', 'icons', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    autoHideMenuBar: true,
    menuBarVisible: false,
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // for window.open()
  mainWindow.webContents.setWindowOpenHandler(() => ({
    action: 'allow',
    overrideBrowserWindowOptions: {
      width: 1366,
      height: 727,
      autoHideMenuBar: true,
      menuBarVisible: false,
      resizable: false,
    },
  }));

  mainWindow.maximize();

  mainWindow.on('will-resize', (event) => {
    event.preventDefault();
  });

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();

      if (process.platform === 'win32') {
        // Show tray notification on Windows when minimizing to tray
        tray.displayBalloon({
          iconType: 'info',
          title: 'Aplicación minimizada',
          content: 'La aplicación sigue funcionando en segundo plano.',
        });
      }
    }
  });
};

function createTray() {
  const iconPath = path.join(__dirname, 'assets', 'icons', 'icon.ico');
  tray = new Tray(iconPath);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Abrir',
      click: () => {
        if (mainWindow) mainWindow.show();
      },
    },
    {
      label: 'Cerrar',
      click: () => {
        app.isQuitting = true;
        if (monitorProcess) monitorProcess.kill();
        app.quit();
      },
    },
  ]);

  tray.setToolTip('Tejeduría');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow) mainWindow.show();
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; " +
            "connect-src 'self' http://localhost:3001/ ws://localhost:3000 https://api.argentinadatos.com https://api.telegram.org;" +
            "style-src 'self' 'unsafe-inline'; " +
            "script-src 'self' 'unsafe-eval'; " +
            "img-src 'self' data: blob: file:;",
        ],
      },
    });
  });

  createWindow();
  if (app.isPackaged) createTray();
  // start nserver monitor process
  setTimeout(startNServerMonitor, 1000);
});

// auto-launch on login
app.setLoginItemSettings({
  openAtLogin: true,
  path: process.execPath,
  args: [],
});

app.on('window-all-closed', (event) => {
  event.preventDefault();
});

// On OS X it's common to re-create a window in the app when the
// dock icon is clicked and there are no other windows open.
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  if (monitorProcess) monitorProcess.kill();
});
