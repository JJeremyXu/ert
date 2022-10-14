import { app, ipcMain } from 'electron';
import { OroDevice, Events } from '@orosound/node-sdk';
import './security-restrictions';
import { restoreOrCreateWindow } from '/@/mainWindow';
const device = new OroDevice();
let api_version : number;
device.on(Events.DEVICE_READY, () => {
  api_version = device.api_version;
  console.log('api-version', device.api_version);
},
);

attachDevice(device);


function attachDevice(device: OroDevice) {
  device
    .attach()
    .then(() => {
      device.init();
    })
    .catch(() => {
      console.log('please connect your device');
    });
}

ipcMain.on('ipc-cmd', async (event, arg) => {
  if(arg == 'api-version'){
    const msgTemplate = (msg: number) => `api-version: ${msg}`;
    // console.log(msgTemplate(arg));
    event.reply('ipc-cmd', msgTemplate(api_version));
  }else{
    return;
  }
});

/**
 * Prevent electron from running multiple instances.
 */
const isSingleInstance = app.requestSingleInstanceLock();
if (!isSingleInstance) {
  app.quit();
  process.exit(0);
}
app.on('second-instance', restoreOrCreateWindow);

/**
 * Disable Hardware Acceleration to save more system resources.
 */
app.disableHardwareAcceleration();

/**
 * Shout down background process if all windows was closed
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * @see https://www.electronjs.org/docs/latest/api/app#event-activate-macos Event: 'activate'.
 */
app.on('activate', restoreOrCreateWindow);

/**
 * Create the application window when the background process is ready.
 */
app
  .whenReady()
  .then(restoreOrCreateWindow)
  .catch(e => console.error('Failed create window:', e));

/**
 * Install Vue.js or any other extension in development mode only.
 * Note: You must install `electron-devtools-installer` manually
 */
// if (import.meta.env.DEV) {
//   app.whenReady()
//     .then(() => import('electron-devtools-installer'))
//     .then(({default: installExtension, REACT_DEVELOPER_TOOLS}) => installExtension(REACT_DEVELOPER_TOOLS, {
//       loadExtensionOptions: {
//         allowFileAccess: true,
//       },
//     }))
//     .catch(e => console.error('Failed install extension:', e));
// }

/**
 * Check for new version of the application - production mode only.
 */
if (import.meta.env.PROD) {
  app
    .whenReady()
    .then(() => import('electron-updater'))
    .then(({autoUpdater}) => autoUpdater.checkForUpdatesAndNotify())
    .catch(e => console.error('Failed check updates:', e));
}
