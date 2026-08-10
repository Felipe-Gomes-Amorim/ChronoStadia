import { contextBridge, ipcRenderer } from 'electron'

const api = {
  toggleFullscreen: (): Promise<boolean> => ipcRenderer.invoke('toggle-fullscreen'),
  isFullscreen: (): Promise<boolean> => ipcRenderer.invoke('is-fullscreen'),
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.api = api
}
