/**
 * @module preload
 */
import type {IpcRendererEvent} from 'electron';
import {contextBridge, ipcRenderer} from 'electron';

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    sendMessage(channel: Channels, args: unknown[]) {
      ipcRenderer.send(channel, args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) => func(...args);
      ipcRenderer.on(channel, subscription);

      return () => ipcRenderer.removeListener(channel, subscription);
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
});

export type Channels = 'ipc-cmd' | 'ipc-msg' | 'ipc-filter' | 'ipc-mode' | 'ipc-isAll';

export {sha256sum} from './nodeCrypto';
export {versions} from './versions';
