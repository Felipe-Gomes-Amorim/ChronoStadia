export interface ChecklistItem {
  id: string
  text: string
  done: boolean
}

export interface DesktopIconData {
  id: string
  label: string
  glyph: string
  pinned: boolean
  position: { x: number; y: number }
  builtin?: string
  description: string
  checklist: ChecklistItem[]
  value?: number
  monthly?: boolean
}

export interface KanbanColumn {
  id: string
  name: string
  taskIds: string[]
}

export type BackgroundState =
  | { kind: 'color'; color: string }
  | { kind: 'image'; dataUrl: string }

export interface OpenWindowState {
  id: string
  minimized: boolean
  maximized: boolean
  zIndex: number
}
