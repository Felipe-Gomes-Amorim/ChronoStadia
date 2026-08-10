import { useEffect, useState, type RefObject } from 'react'
import { resolveIconAsset } from '../assets/icons/builtins'
import ContextMenu from './ContextMenu'
import type { DesktopIconData, OpenWindowState } from '../types'

interface TaskbarProps {
  isStartMenuOpen: boolean
  onToggleStartMenu: () => void
  startButtonRef: RefObject<HTMLButtonElement | null>
  openWindows: OpenWindowState[]
  icons: DesktopIconData[]
  onTaskbarItemClick: (id: string) => void
  onCloseWindow: (id: string) => void
}

interface OpenContextMenu {
  windowId: string
  x: number
}

function Taskbar({
  isStartMenuOpen,
  onToggleStartMenu,
  startButtonRef,
  openWindows,
  icons,
  onTaskbarItemClick,
  onCloseWindow
}: TaskbarProps) {
  const [now, setNow] = useState(new Date())
  const [contextMenu, setContextMenu] = useState<OpenContextMenu | null>(null)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="taskbar">
      <button
        ref={startButtonRef}
        className={`start-button${isStartMenuOpen ? ' active' : ''}`}
        onClick={onToggleStartMenu}
      >
        Iniciar
      </button>

      <div className="taskbar-items">
        {openWindows.map((win) => {
          const icon = icons.find((candidate) => candidate.id === win.id)
          if (!icon) return null

          return (
            <button
              key={win.id}
              className={`taskbar-item${!win.minimized ? ' active' : ''}`}
              onClick={() => onTaskbarItemClick(win.id)}
              onContextMenu={(event) => {
                event.preventDefault()
                const rect = event.currentTarget.getBoundingClientRect()
                setContextMenu({ windowId: win.id, x: rect.left })
              }}
            >
              {(() => {
                const src = resolveIconAsset(icon.builtin, icon.id, icon.glyph)
                return src
                  ? <img src={src} width={16} height={16} alt="" className="pixel-icon" />
                  : <span>{icon.glyph}</span>
              })()}
              <span>{icon.label}</span>
            </button>
          )
        })}
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          anchorBottom={36}
          onClose={() => setContextMenu(null)}
          items={[{ label: 'Fechar', onClick: () => onCloseWindow(contextMenu.windowId) }]}
        />
      )}

      <div className="taskbar-clock">{time}</div>
    </div>
  )
}

export default Taskbar
