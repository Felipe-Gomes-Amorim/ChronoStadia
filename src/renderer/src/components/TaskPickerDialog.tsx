import { useState } from 'react'
import { resolveIconAsset } from '../assets/icons/builtins'
import type { DesktopIconData } from '../types'
import WindowFrame, { DIALOG_Z_INDEX } from './WindowFrame'

interface TaskPickerDialogProps {
  tasks: DesktopIconData[]
  alreadyAttached: string[]
  onSelect: (taskId: string) => void
  onClose: () => void
  dialogTitle?: string
  emptyLabel?: string
}

function TaskPickerDialog({ tasks, alreadyAttached, onSelect, onClose, dialogTitle = 'Selecionar Tarefa', emptyLabel = 'Não há tarefas disponíveis.' }: TaskPickerDialogProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const available = tasks.filter((t) => !alreadyAttached.includes(t.id))

  const cx = Math.round(window.innerWidth / 2 - 170)
  const cy = Math.round(window.innerHeight / 2 - 150)

  return (
    <WindowFrame
      title={dialogTitle}
      onClose={onClose}
      resizable={false}
      showWindowControls={false}
      width={340}
      initialHeight={290}
      zIndex={DIALOG_Z_INDEX + 10}
      initialPosition={{ x: cx, y: cy }}
    >
      <div className="task-picker">
        <div className="task-picker-address">
          <label>Examinar:</label>
          <div className="task-picker-address-bar">🖥️ Área de Trabalho</div>
        </div>

        <div className="task-picker-panel">
          {available.length === 0 ? (
            <p className="task-picker-empty">{emptyLabel}</p>
          ) : (
            <ul className="task-picker-list">
              {available.map((task) => {
                const iconSrc = resolveIconAsset(task.builtin, task.id, task.glyph)
                return (
                  <li
                    key={task.id}
                    className={`task-picker-item${selected === task.id ? ' selected' : ''}`}
                    onClick={() => setSelected(task.id)}
                    onDoubleClick={() => onSelect(task.id)}
                  >
                    <span className="task-picker-glyph">
                      {iconSrc
                        ? <img
                            src={iconSrc}
                            width={18} height={18}
                            alt=""
                            draggable={false}
                            style={{ imageRendering: 'pixelated', display: 'inline-block', verticalAlign: 'middle' }}
                          />
                        : task.glyph}
                    </span>
                    <span>{task.label}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="dialog-actions">
          <button disabled={!selected} onClick={() => selected && onSelect(selected)}>
            OK
          </button>
          <button onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </WindowFrame>
  )
}

export default TaskPickerDialog
