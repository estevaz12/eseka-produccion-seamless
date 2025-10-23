const {
  app,
  BrowserWindow,
  session,
  utilityProcess,
  dialog,
  ipcMain,
  shell,
  Notification,
  Tray,
  Menu,
} = require('electron');
const path = require('path');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const processMonitorMessages = require('./utils/processMonitorMessages');

app.setAppUserModelId('Tejeduria');

// to avoid squirrel multiple app spawning
if (require('electron-squirrel-startup')) app.quit();

// Ensure single instance: if a second instance is launched (e.g. user clicks taskbar/shortcut),
// focus the existing window instead of creating a new one.
if (app.isPackaged) {
  const gotTheLock = app.requestSingleInstanceLock();
  if (!gotTheLock) {
    app.quit();
  } else {
    app.on('second-instance', (event, argv, workingDirectory) => {
      // Someone tried to run a second instance, focus the main window.
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
      }
    });
  }
}

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('America/Buenos_Aires');

app.commandLine.appendSwitch('lang', 'es-419');

let mainWindow;
let tray;
let serverProcess;
let monitorProcess;

function startServer() {
  serverProcess = utilityProcess.fork(path.join(__dirname, 'server.js'));
  // let the server know if on dev or prod mode
  serverProcess.postMessage(app.isPackaged);
  // when server sends a message
  serverProcess.on('message', (msg) => {
    console.log(`[${dayjs.tz().format('DD/MM/YYYY HH:mm:ss')}] ${msg}`);
  });
}

function startNServerMonitor() {
  console.log('[MAIN] Starting NServer monitor...');

  monitorProcess = utilityProcess.fork(
    path.join(__dirname, 'nserverMonitor.js')
  );

  monitorProcess.on('message', (msg) =>
    processMonitorMessages(msg, mainWindow)
  );
}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    title: 'Tejeduría',
    width: 1366,
    height: 727,
    icon: path.join(__dirname, 'assets', 'icons', 'icon.ico'),
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
    autoHideMenuBar: true,
    menuBarVisible: false,
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  if (!app.isPackaged) mainWindow.webContents.openDevTools();

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
        if (serverProcess) serverProcess.kill();
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
  // start child server process
  startServer();

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

  // wait for server to start
  setTimeout(() => {
    // file uploading
    ipcMain.handle('dialog:openFile', handleFileOpen);
    ipcMain.handle(
      'shell:openPath',
      async (event, path) => await shell.openPath(path)
    );

    // notifications
    ipcMain.on('notifyElectronico', (event, opts) => {
      const notif = new Notification({
        ...opts,
        icon: path.join(__dirname, 'assets', 'icons', 'electronico.ico'),
      });

      notif.on('click', () => {
        // focus main window
        const win = BrowserWindow.getAllWindows()[0];
        if (win) {
          if (win.isMinimized()) win.restore();
          win.focus();
        }
        // close notif
        notif.close();
      });

      notif.show();
    });

    createWindow();
    if (app.isPackaged) {
      createTray();
      startNServerMonitor();
    }
  }, 1000);
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
  if (serverProcess) serverProcess.kill();
  if (!app.isPackaged && mainWindow) mainWindow.webContents.closeDevTools();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     serverProcess.kill();
//     monitorProcess.kill();
//     app.quit();
//   }
// });

async function handleFileOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    filters: [{ name: 'PDFs', extensions: ['pdf'] }],
  });
  if (!canceled) {
    return filePaths[0];
  }
}
