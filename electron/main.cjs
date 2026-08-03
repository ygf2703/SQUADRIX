const { app, BrowserWindow, shell } = require('electron');
const path = require('node:path');

const isDevelopment = !app.isPackaged && process.env.SQUADRIX_DEV_URL;

function createWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 940,
    minWidth: 1120,
    minHeight: 720,
    title: 'SQUADRIX — Football Team Operations',
    backgroundColor: '#061d39',
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
  });

  window.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (isDevelopment) window.loadURL(process.env.SQUADRIX_DEV_URL);
  else window.loadFile(path.join(__dirname, '..', 'dist', 'index.html'), { hash: '/app/' });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
