// eslint-disable-next-line import/no-extraneous-dependencies
const electron = require('electron');

const { app, ipcMain, BrowserWindow } = electron;

const path = require('path');
const isDev = require('electron-is-dev');
const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer');
const { getSettings, setSettings } = require('./settings-store');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 750,
    height: 650,
    webPreferences: {
      enableRemoteModule: true,
      nodeIntegration: true,
    },
  });

  mainWindow.loadURL(
    isDev ? 'http://localhost:1234' : `file://${path.join(__dirname, '../build/index.html')}`,
  );

  if (isDev && process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
    mainWindow.maximize();
    installExtension(REACT_DEVELOPER_TOOLS)
      .then((name) => {
        console.log(`Added extension ${name}`);
      })
      .catch((e) => {
        console.log(`Error occurred: ${e.message}`);
      });
  }
  // eslint-disable-next-line no-return-assign
  mainWindow.on('closed', () => (mainWindow = null));

  mainWindow.once('ready-to-show', () => {
    mainWindow.webContents.send('getSettings', getSettings());
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('saveSettings', (event, values) => {
  setSettings(values);
});

ipcMain.on('getSettings', (event) => {
  event.reply('getSettings', getSettings());
});
