import { app, BrowserWindow,
  ipcMain }                   from 'electron';
import { join }               from 'path';
import { URL }                from 'url';
import { oro_device }         from './orosound';
import Message                from './message';
import type {Trace}           from './message';

type cmdMessage = {
  time: string;
  mod: string;
  ct: number;
  terminal: string;
};


const allMessages : cmdMessage[] = [];
let renderMessages : cmdMessage[] = [];
let filter : string[] = [];
let isAll = true;


function send(browserWindow: BrowserWindow){
  if(isAll){
    browserWindow.webContents.send('ipc-msg',allMessages);
  }else{
    browserWindow.webContents.send('ipc-msg',renderMessages);
  }
}

ipcMain.on('ipc-isAll',async (event, arg) =>{
  isAll = arg[0];
});




export async function createWindow() {
  const browserWindow = new BrowserWindow({
    show: false, // Use the 'ready-to-show' event to show the instantiated BrowserWindow.
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false, // Sandbox disabled because the demo of preload script depend on the Node.js api
      webviewTag: false, // The webview tag is not recommended. Consider alternatives like an iframe or Electron's BrowserView. @see https://www.electronjs.org/docs/latest/api/webview-tag#warning
      preload: join(app.getAppPath(), 'packages/preload/dist/index.cjs'),
    },
  });

  /**
   * If the 'show' property of the BrowserWindow's constructor is omitted from the initialization options,
   * it then defaults to 'true'. This can cause flickering as the window loads the html content,
   * and it also has show problematic behaviour with the closing of the window.
   * Use `show: false` and listen to the  `ready-to-show` event to show the window.
   *
   * @see https://github.com/electron/electron/issues/25012 for the afford mentioned issue.
   */
  browserWindow.on('ready-to-show', () => {
    browserWindow?.show();
    if (import.meta.env.DEV) {
      browserWindow?.webContents.openDevTools();
    }
  });
  const makeCmd = (cmd: string) => {
    const time = new Date();
    return {
      time: time.toLocaleString(),
      mod: 'CMD',
      ct: 4,
      terminal: cmd,
    };
  };

  ipcMain.on('ipc-filter',async (event, arg) => {
    filter = arg;
    renderMessages = allMessages.filter((msg)=>{
      return (arg as Array<string>).includes(msg.mod);
    });
    send(browserWindow);
  });

  // command line
  ipcMain.on('ipc-cmd', async (event, arg) => {
    oro_device.rawTrace(arg[0]);
    const cmd = makeCmd(arg[0]);
    allMessages.push(cmd);
    mode = allMessages.map((msg)=>msg.mod);
    mode = Array.from(new Set(mode));
    if(mode.length>0){
      browserWindow.webContents.send('ipc-mode',mode);
    }
    send(browserWindow);
  });

  // trace
  let mode : string[] = [];
  oro_device.onEvent((evt)=>{
    if(evt.eid == 0){
      evt.value = (evt.value as string).replace(/\n/g, '');
      const message = new Message(evt as Trace);
      allMessages.push(message.getCmdMessage());
      renderMessages = allMessages.filter((msg)=>{
        return filter.includes(msg.mod);
      });
      mode = allMessages.map((msg)=>msg.mod);
      mode = Array.from(new Set(mode));
    }
    browserWindow.webContents.send('ipc-msg',renderMessages);
    if(mode.length>0){
      browserWindow.webContents.send('ipc-mode',mode);
    }
  });


  // let dom_ready = 0;
  // device.hid.on('hid-receive', (data) => {
  //   if (!dom_ready) {
  //     setTimeout(() => {
  //       browserWindow.webContents.send('ipc-msg', '<-- (' + data.length + ')' + data.toString('hex'));
  //       dom_ready = 1;
  //     }, 1000);
  //   } else {
  //     browserWindow.webContents.send('ipc-msg', '<-- (' + data.length + ')' + data.toString('hex'));
  //   }

  // });

  /**
   * URL for main window.
   * Vite dev server for development.
   * `file://../renderer/index.html` for production and test.
   */
  const pageUrl =
    import.meta.env.DEV && import.meta.env.VITE_DEV_SERVER_URL !== undefined
      ? import.meta.env.VITE_DEV_SERVER_URL
      : new URL('../renderer/dist/index.html', 'file://' + __dirname).toString();

  await browserWindow.loadURL(pageUrl);

  return browserWindow;
}

/**
 * Restore an existing BrowserWindow or Create a new BrowserWindow.
 */
export async function restoreOrCreateWindow() {
  let window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());

  if (window === undefined) {
    window = await createWindow();
  }

  if (window.isMinimized()) {
    window.restore();
  }

  window.focus();
}
