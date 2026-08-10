import { useState } from 'react'
import ContextMenu from './ContextMenu'
import { resolveIconAsset } from '../assets/icons/builtins'
import type { DesktopIconData } from '../types'

interface ComputerWindowProps {
  icons: DesktopIconData[]
  timerOpen: boolean
  onOpen: (id: string) => void
  onTogglePinned: (id: string) => void
  onDeleteIcon: (id: string) => void
  onOpenProperties: (id: string) => void
  onAttachToTimer: (id: string) => void
  onResetPosition: (id: string) => void
}

type CtxMenu = { iconId: string; x: number; y: number }

function typeLabel(icon: DesktopIconData): string {
  if (!icon.builtin) return 'Tarefa'
  if (icon.builtin === 'note') return 'Nota'
  if (icon.builtin === 'folder') return 'Pasta'
  if (icon.builtin === 'expense') return 'Despesa'
  return 'Sistema'
}

function ComputerWindow({
  icons,
  timerOpen,
  onOpen,
  onTogglePinned,
  onDeleteIcon,
  onOpenProperties,
  onAttachToTimer,
  onResetPosition
}: ComputerWindowProps) {
  const [query, setQuery] = useState('')
  const [ctxMenu, setCtxMenu] = useState<CtxMenu | null>(null)

  const visible = icons.filter((icon) => icon.id !== 'computer')
  const filtered = visible.filter((icon) =>
    icon.label.toLowerCase().includes(query.toLowerCase())
  )

  const ctxIcon = ctxMenu ? icons.find((i) => i.id === ctxMenu.iconId) ?? null : null

  return (
    <div className="computer-window">
      {/* Barra de endereço / pesquisa */}
      <div className="computer-toolbar">
        <span className="computer-toolbar-label">Pesquisar:</span>
        <input
          className="computer-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      {/* Área de lista com borda inset */}
      <div className="computer-list-wrap">
        {/* Cabeçalho de colunas */}
        <div className="computer-col-header">
          <span className="computer-col-icon-ph" />
          <span className="computer-col-name-h">Nome</span>
          <span className="computer-col-type-h">Tipo</span>
        </div>

        {/* Itens */}
        <div className="computer-list">
          {filtered.length === 0 ? (
            <div className="computer-empty">Nenhum item encontrado.</div>
          ) : (
            filtered.map((icon) => {
              const src = resolveIconAsset(icon.builtin, icon.id, icon.glyph)
              return (
                <div
                  key={icon.id}
                  className="computer-item"
                  onClick={() => onOpen(icon.id)}
                  onContextMenu={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setCtxMenu({ iconId: icon.id, x: e.clientX, y: e.clientY })
                  }}
                >
                  <span className="computer-item-icon">
                    {src
                      ? <img src={src} width={16} height={16} alt="" className="pixel-icon" />
                      : <span style={{ fontSize: 14 }}>{icon.glyph}</span>}
                  </span>
                  <span className="computer-item-label">{icon.label}</span>
                  <span className="computer-item-type">{typeLabel(icon)}</span>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Barra de status */}
      <div className="computer-statusbar">
        {filtered.length} objeto{filtered.length !== 1 ? 's' : ''}
        {query && ` (de ${visible.length})`}
      </div>

      {ctxMenu && ctxIcon && (
        <ContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          onClose={() => setCtxMenu(null)}
          items={[
            { label: 'Abrir', onClick: () => onOpen(ctxMenu.iconId) },
            {
              label: ctxIcon.pinned ? 'Desafixar do menu Iniciar' : 'Fixar no menu Iniciar',
              onClick: () => onTogglePinned(ctxMenu.iconId)
            },
            { label: 'Propriedades', onClick: () => onOpenProperties(ctxMenu.iconId) },
            { label: 'Reiniciar posição', onClick: () => onResetPosition(ctxMenu.iconId) },
            ...(timerOpen && !ctxIcon.builtin
              ? [{ label: 'Anexar ao Cronômetro', onClick: () => onAttachToTimer(ctxMenu.iconId) }]
              : []),
            ...(!ctxIcon.builtin
              ? [{ label: 'Excluir tarefa', onClick: () => onDeleteIcon(ctxMenu.iconId) }]
              : []),
            ...(ctxIcon.builtin === 'note'
              ? [{ label: 'Excluir nota', onClick: () => onDeleteIcon(ctxMenu.iconId) }]
              : []),
            ...(ctxIcon.builtin === 'folder'
              ? [{ label: 'Excluir pasta', onClick: () => onDeleteIcon(ctxMenu.iconId) }]
              : []),
            ...(ctxIcon.builtin === 'expense'
              ? [{ label: 'Excluir despesa', onClick: () => onDeleteIcon(ctxMenu.iconId) }]
              : [])
          ]}
        />
      )}
    </div>
  )
}

export default ComputerWindow
