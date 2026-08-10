import { useState } from 'react'
import ContextMenu from './ContextMenu'
import DesktopIcon from './DesktopIcon'
import type { DesktopIconData } from '../types'

interface DesktopProps {
  icons: DesktopIconData[]
  onOpen: (id: string) => void
  onTogglePinned: (id: string) => void
  onDeleteIcon: (id: string) => void
  onOpenProperties: (id: string) => void
  onMoveIcon: (id: string, position: { x: number; y: number }) => void
  timerOpen: boolean
  onAttachToTimer: (id: string) => void
}

type IconContextMenu = { iconId: string; x: number; y: number }

function Desktop({
  icons,
  onOpen,
  onTogglePinned,
  onDeleteIcon,
  onOpenProperties,
  onMoveIcon,
  timerOpen,
  onAttachToTimer
}: DesktopProps) {
  const [iconMenu, setIconMenu] = useState<IconContextMenu | null>(null)

  return (
    <div className="desktop">
      {icons.map((icon) => (
        <DesktopIcon
          key={icon.id}
          icon={icon}
          onOpen={() => onOpen(icon.id)}
          onContextMenu={(x, y) => setIconMenu({ iconId: icon.id, x, y })}
          onMove={(position) => onMoveIcon(icon.id, position)}
        />
      ))}

      {iconMenu &&
        (() => {
          const ctxIcon = icons.find((icon) => icon.id === iconMenu.iconId)
          return (
            <ContextMenu
              x={iconMenu.x}
              y={iconMenu.y}
              onClose={() => setIconMenu(null)}
              items={[
                { label: 'Abrir', onClick: () => onOpen(iconMenu.iconId) },
                {
                  label: ctxIcon?.pinned ? 'Desafixar do menu Iniciar' : 'Fixar no menu Iniciar',
                  onClick: () => onTogglePinned(iconMenu.iconId)
                },
                { label: 'Propriedades', onClick: () => onOpenProperties(iconMenu.iconId) },
                ...(timerOpen && !ctxIcon?.builtin
                  ? [{ label: 'Anexar ao Cronômetro', onClick: () => onAttachToTimer(iconMenu.iconId) }]
                  : []),
                ...(!ctxIcon?.builtin
                  ? [{ label: 'Excluir tarefa', onClick: () => onDeleteIcon(iconMenu.iconId) }]
                  : []),
                ...(ctxIcon?.builtin === 'note'
                  ? [{ label: 'Excluir nota', onClick: () => onDeleteIcon(iconMenu.iconId) }]
                  : []),
                ...(ctxIcon?.builtin === 'folder'
                  ? [{ label: 'Excluir pasta', onClick: () => onDeleteIcon(iconMenu.iconId) }]
                  : []),
                ...(ctxIcon?.builtin === 'expense'
                  ? [{ label: 'Excluir despesa', onClick: () => onDeleteIcon(iconMenu.iconId) }]
                  : [])
              ]}
            />
          )
        })()}
    </div>
  )
}

export default Desktop
