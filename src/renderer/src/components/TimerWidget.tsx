import { forwardRef, useEffect, useState } from 'react'
import hourglassIcon from '../assets/icons/32x32/hourglass.png'
import { resolveIconAsset } from '../assets/icons/builtins'
import type { DesktopIconData } from '../types'
import ChecklistQuick from './ChecklistQuick'

const TIMER_Z_INDEX = 500

interface TimerWidgetProps {
  minimized?: boolean
  side?: 'right' | 'left'
  attachedIcon: DesktopIconData | null
  onToggleItem: (itemId: string) => void
  onDetach: () => void
  onMinimize?: () => void
  onClose: () => void
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

const TimerWidget = forwardRef<HTMLDivElement, TimerWidgetProps>(
  function TimerWidget({
    minimized = false,
    side = 'right',
    attachedIcon,
    onToggleItem,
    onDetach,
    onMinimize,
    onClose
  }, ref) {
    const [minutes, setMinutes] = useState(25)
    const [totalSeconds, setTotalSeconds] = useState(0)
    const [elapsedSeconds, setElapsedSeconds] = useState(0)
    const [running, setRunning] = useState(false)

    const configured = totalSeconds > 0
    const finished = configured && elapsedSeconds >= totalSeconds
    const remaining = Math.max(0, totalSeconds - elapsedSeconds)
    const progress = configured ? Math.min(100, Math.round((elapsedSeconds / totalSeconds) * 100)) : 0

    useEffect(() => {
      if (!running || finished) return
      const id = setInterval(() => setElapsedSeconds((s) => s + 1), 1000)
      return () => clearInterval(id)
    }, [running, finished])

    function handleStart(): void {
      if (finished) return
      if (!configured) {
        const total = Math.max(1, minutes) * 60
        setTotalSeconds(total)
        setElapsedSeconds(0)
      }
      setRunning(true)
    }

    function handlePause(): void {
      setRunning(false)
    }

    function handleReset(): void {
      setRunning(false)
      setTotalSeconds(0)
      setElapsedSeconds(0)
    }

    const remainingDisplay = `${pad(Math.floor(remaining / 60))}:${pad(remaining % 60)}`
    // When side === 'left': position in the column immediately to the left of the right-side widgets
    // 16 (margin) + 240 (right-col widget width) + 8 (gap) = 264
    const sideStyle = side === 'left' ? { right: 264 } : {}

    return (
      <div
        ref={ref}
        className="window timer-widget"
        style={{ zIndex: TIMER_Z_INDEX, display: minimized ? 'none' : undefined, ...sideStyle }}
      >
        <div className="title-bar">
          <div className="title-bar-text">
            <img src={hourglassIcon} width={14} height={14} alt="" className="pixel-icon title-bar-icon" />
            Cronômetro
          </div>
          <div className="title-bar-controls">
            {onMinimize && <button aria-label="Minimize" onClick={onMinimize}></button>}
            <button aria-label="Close" onClick={onClose}></button>
          </div>
        </div>

        <div className="window-body timer-body">
          <div className="timer-controls">
            {!configured && (
              <div className="field-row">
                <input
                  type="number"
                  className="timer-minutes-input"
                  value={minutes}
                  min={1}
                  max={999}
                  onChange={(e) => setMinutes(Math.max(1, Number(e.target.value)))}
                  disabled={running}
                />
                <span>min</span>
              </div>
            )}
            <div className="field-row">
              {!running && !finished && (
                <button onClick={handleStart}>▶ {configured ? 'Continuar' : 'Iniciar'}</button>
              )}
              {running && !finished && (
                <button onClick={handlePause}>⏸ Pausar</button>
              )}
              <button onClick={handleReset}>⟳ Resetar</button>
            </div>
          </div>

          {configured && (
            <div className="timer-progress-section">
              <div className="progress-indicator segmented">
                <span className="progress-indicator-bar" style={{ width: `${progress}%` }} />
              </div>
              <div className="timer-time-display">
                {finished ? '✓ Concluído!' : `${remainingDisplay} restando`}
              </div>
            </div>
          )}

          <div className="timer-task-section">
            <div className="timer-section-label">Tarefa</div>
            {attachedIcon ? (
              <div className="timer-attached-task">
                <span>
                  {(() => {
                    const src = resolveIconAsset(attachedIcon.builtin, attachedIcon.id, attachedIcon.glyph)
                    return src
                      ? <img src={src} width={14} height={14} alt="" className="pixel-icon" style={{ verticalAlign: 'middle', marginRight: 4 }} />
                      : <>{attachedIcon.glyph}{' '}</>
                  })()}
                  {attachedIcon.label}
                </span>
                <button
                  type="button"
                  className="timer-detach"
                  onClick={onDetach}
                  title="Desanexar"
                >
                  ✕
                </button>
              </div>
            ) : (
              <p className="timer-no-task">
                Clique com o botão direito num ícone e escolha "Anexar ao Cronômetro".
              </p>
            )}
          </div>

          {attachedIcon && (
            <div className="timer-checklist-section">
              <div className="timer-section-label">
                Checklist ({attachedIcon.checklist.filter((i) => i.done).length}/
                {attachedIcon.checklist.length})
              </div>
              <ChecklistQuick checklist={attachedIcon.checklist} onToggleItem={onToggleItem} />
            </div>
          )}
        </div>
      </div>
    )
  }
)

export default TimerWidget
