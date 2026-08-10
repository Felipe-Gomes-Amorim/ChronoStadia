export {}

declare global {
  interface Window {
    api: {
      toggleFullscreen: () => Promise<boolean>
      isFullscreen: () => Promise<boolean>
    }
  }
}
