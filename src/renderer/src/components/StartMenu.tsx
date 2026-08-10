import { useEffect, useMemo, useRef, type RefObject } from 'react'
import computerIcon      from '../assets/icons/32x32/computer.png'
import diskIcon          from '../assets/icons/32x32/disk.png'
import fullscreenIcon    from '../assets/icons/32x32/fullscreen.png'
import helpIcon          from '../assets/icons/32x32/help.png'
import hourglassIcon     from '../assets/icons/32x32/hourglass.png'
import screenSaverIcon   from '../assets/icons/32x32/loading_screen.png'
import windowCompactIcon from '../assets/icons/32x32/window_compact_on.png'
import { resolveIconAsset } from '../assets/icons/builtins'
import type { DesktopIconData } from '../types'

const STORAGE_KEYS = [
  'chronostadia.icons.v1',
  'chronostadia.background.v1',
  'chronostadia.calendar.v1',
  'chronostadia.folders.v1',
  'chronostadia.weekly.v1'
]

function calcStorageSize(): string {
  let bytes = 0
  for (const key of STORAGE_KEYS) {
    const val = localStorage.getItem(key)
    if (val) bytes += (key.length + val.length) * 2
  }
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

interface StartMenuProps {
  pinnedIcons: DesktopIconData[]
  onOpen: (id: string) => void
  onClose: () => void
  onOpenGuide: () => void
  onOpenComputer: () => void
  onScreenSaver: () => void
  excludeRef: RefObject<HTMLElement | null>
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
}

function StartMenu({ pinnedIcons, onOpen, onClose, onOpenGuide, onOpenComputer, onScreenSaver, excludeRef, isFullscreen, onToggleFullscreen }: StartMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const storageSize = useMemo(calcStorageSize, [])

  useEffect(() => {
    function handleMouseDown(event: MouseEvent): void {
      const target = event.target as Node
      if (excludeRef.current?.contains(target)) return
      if (menuRef.current && !menuRef.current.contains(target)) {
        onClose()
      }
    }
    window.addEventListener('mousedown', handleMouseDown)
    return () => window.removeEventListener('mousedown', handleMouseDown)
  }, [onClose, excludeRef])

  return (
    <div ref={menuRef} className="start-menu">
      <div className="start-menu-header">
        <img src={hourglassIcon} width={28} height={28} alt="" className="pixel-icon start-menu-header-icon" />
        <div>
          <div className="start-menu-header-title">ChronoStadia</div>
          <div className="start-menu-header-version">v1.0.0</div>
        </div>
      </div>

      <div className="start-menu-body">
        {/* ── Lado esquerdo: programas fixados ── */}
        <div className="start-menu-left">
          {pinnedIcons.length === 0 ? (
            <div className="start-menu-empty">
              Nada fixado ainda. Clique com o botão direito num ícone da área de trabalho pra fixar aqui.
            </div>
          ) : (
            <ul className="start-menu-list">
              {pinnedIcons.map((icon) => (
                <li key={icon.id}>
                  <button
                    className="start-menu-item"
                    onClick={() => { onOpen(icon.id); onClose() }}
                  >
                    {(() => {
                      const src = resolveIconAsset(icon.builtin, icon.id, icon.glyph)
                      return src
                        ? <img src={src} width={20} height={20} alt="" className="pixel-icon" />
                        : <span>{icon.glyph}</span>
                    })()}
                    <span>{icon.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Lado direito: sistema ── */}
        <div className="start-menu-right">
          <button
            className="start-menu-right-item start-menu-right-btn"
            onClick={() => { onOpenComputer(); onClose() }}
          >
            <img src={computerIcon} width={20} height={20} alt="" className="pixel-icon start-menu-right-icon" />
            <span className="start-menu-right-name">Meu Computador</span>
          </button>

          <div className="start-menu-right-item">
            <img src={diskIcon} width={20} height={20} alt="" className="pixel-icon start-menu-right-icon" />
            <span className="start-menu-right-name">{storageSize} em uso</span>
          </div>

          <button
            className="start-menu-right-item start-menu-right-btn"
            onClick={() => { onOpenGuide(); onClose() }}
          >
            <img src={helpIcon} width={20} height={20} alt="" className="pixel-icon start-menu-right-icon" />
            <span className="start-menu-right-name">Guia</span>
          </button>

          <button
            className="start-menu-right-item start-menu-right-btn"
            onClick={() => { onScreenSaver(); onClose() }}
          >
            <img src={screenSaverIcon} width={20} height={20} alt="" className="pixel-icon start-menu-right-icon" />
            <span className="start-menu-right-name">Protetor de Tela</span>
          </button>

          <button
            className="start-menu-right-item start-menu-right-btn"
            onClick={() => { onToggleFullscreen?.(); onClose() }}
          >
            <img
              src={isFullscreen ? windowCompactIcon : fullscreenIcon}
              width={20} height={20} alt=""
              className="pixel-icon start-menu-right-icon"
            />
            <span className="start-menu-right-name">
              {isFullscreen ? 'Sair Tela Cheia' : 'Tela Cheia'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default StartMenu
