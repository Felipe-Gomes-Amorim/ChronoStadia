import type { MouseEvent as ReactMouseEvent } from 'react'
import { resolveIconAsset } from '../assets/icons/builtins'
import { useDraggable } from '../hooks/useDraggable'
import type { DesktopIconData } from '../types'

const ICON_GRID = { x: 96, y: 96 }
const DESKTOP_TOP_OFFSET = 8
const ICON_W = 80   // largura do .desktop-icon
const ICON_H = 60   // altura visual aproximada (offset + glyph + gap + label)
const TASKBAR_H = 36

interface DesktopIconProps {
  icon: DesktopIconData
  onOpen: () => void
  onContextMenu: (x: number, y: number) => void
  onMove: (position: { x: number; y: number }) => void
}

function DesktopIcon({ icon, onOpen, onContextMenu, onMove }: DesktopIconProps) {
  // Última coluna/linha de grid que mantém o ícone completamente dentro do desktop.
  const bounds = {
    maxX: Math.floor((window.innerWidth - ICON_W)  / ICON_GRID.x) * ICON_GRID.x,
    maxY: Math.floor((window.innerHeight - TASKBAR_H - ICON_H) / ICON_GRID.y) * ICON_GRID.y
  }

  const { position, dragging, handleMouseDown } = useDraggable(icon.position, {
    grid: ICON_GRID,
    bounds,
    onSettle: onMove
  })

  function handleContextMenu(event: ReactMouseEvent): void {
    event.preventDefault()
    event.stopPropagation()
    onContextMenu(event.clientX, event.clientY)
  }

  const assetSrc = resolveIconAsset(icon.builtin, icon.id, icon.glyph)

  return (
    <div
      className="desktop-icon"
      style={{ left: position.x, top: position.y + DESKTOP_TOP_OFFSET }}
      onMouseDown={handleMouseDown}
      onDoubleClick={() => !dragging && onOpen()}
      onContextMenu={handleContextMenu}
      onDragStart={(e) => e.preventDefault()}
    >
      <div className="desktop-icon-glyph">
        {assetSrc
          ? <img src={assetSrc} width={32} height={32} alt={icon.label} className="pixel-icon" draggable={false} />
          : icon.glyph}
      </div>
      <span>{icon.label}</span>
    </div>
  )
}

export default DesktopIcon
