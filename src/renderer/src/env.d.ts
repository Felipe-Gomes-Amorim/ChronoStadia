/// <reference types="vite/client" />

declare global {
  interface Window {
    api: {
      toggleFullscreen: () => Promise<boolean>
      isFullscreen: () => Promise<boolean>
    }
  }
}

export {}
