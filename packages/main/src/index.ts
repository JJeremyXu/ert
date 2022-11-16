import { app }                from 'electron';
import './security-restrictions';
import {
  restoreOrCreateWindow }     from '/@/mainWindow';
import { oro_device }         from './orosound';


oro_device.onEvent((evt)=>{
  console.log(JSON.stringify(evt));

});
async function connect(){
  try {
    await oro_device.attach();

  } catch (error) {
    console.log(error);
  }
  oro_device.rawTrace('setLanguage 1');
//  oro_device.getBattery().then(res => console.log(JSON.stringify(res)));
//  oro_device.setLanguage(1).then(res => console.log(JSON.stringify(res)));
}

connect();

// ipcMain.on('ipc-cmd', async (event, arg) => {
//   oro_device.rawTrace(arg[0]);
// });


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
