const {
  app,
  BrowserWindow,
  session,
  utilityProcess,
  dialog,
  ipcMain,
  shell,
} = require('electron');
const path = require('path');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

// to avoid squirrel multiple app spawning
if (require('electron-squirrel-startup')) app.quit();

app.setAppUserModelId('com.squirrel.Tejeduria.Tejeduria');

dayjs.extend(utc);
dayjs.extend(timezone);

app.commandLine.appendSwitch('lang', 'es-419');

let serverProcess;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

async function handleFileOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    filters: [{ name: 'PDFs', extensions: ['pdf'] }],
  });
  if (!canceled) {
    return filePaths[0];
  }
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
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
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // start child server process
  serverProcess = utilityProcess.fork(path.join(__dirname, 'server.js'));
  // let the server know if on dev or prod mode
  serverProcess.postMessage(app.isPackaged);
  // when server sends a message
  serverProcess.on('message', (msg) => {
    console.log(
      `[${dayjs()
        .tz('America/Buenos_Aires')
        .format('DD/MM/YYYY HH:mm:ss')}] ${msg}`
    );
  });

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; " +
            "connect-src 'self' http://localhost:3001/ ws://localhost:3000 https://api.argentinadatos.com; " +
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

    createWindow();
  }, 1000);

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    serverProcess.kill();
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
