import { useState, type FormEvent } from 'react'
import type { ChecklistItem } from '../types'

interface TaskWindowContentProps {
  description: string
  checklist: ChecklistItem[]
  onDescriptionChange: (description: string) => void
  onAddItem: (text: string) => void
  onToggleItem: (itemId: string) => void
  onRemoveItem: (itemId: string) => void
}

function TaskWindowContent({
  description,
  checklist,
  onDescriptionChange,
  onAddItem,
  onToggleItem,
  onRemoveItem
}: TaskWindowContentProps) {
  const [newItemText, setNewItemText] = useState('')

  const total = checklist.length
  const done = checklist.filter((item) => item.done).length
  const progress = total === 0 ? 0 : Math.round((done / total) * 100)

  function handleAddItem(event: FormEvent): void {
    event.preventDefault()
    const trimmed = newItemText.trim()
    if (!trimmed) return
    onAddItem(trimmed)
    setNewItemText('')
  }

  return (
    <div className="task-content">
      <div className="field-row-stacked">
        <label>Descrição</label>
        <textarea
          className="task-description"
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          placeholder="Descreva a tarefa..."
        />
      </div>

      <div className="field-row-stacked">
        <label>
          Checklist ({done}/{total})
        </label>
        <div className="progress-indicator segmented">
          <span className="progress-indicator-bar" style={{ width: `${progress}%` }} />
        </div>

        {checklist.length > 0 && (
          <ul className="checklist-items">
            {checklist.map((item) => (
              <li key={item.id} className="checklist-item">
                <input
                  type="checkbox"
                  id={`check-${item.id}`}
                  checked={item.done}
                  onChange={() => onToggleItem(item.id)}
                />
                <label htmlFor={`check-${item.id}`} className={item.done ? 'checklist-done' : ''}>
                  {item.text}
                </label>
                <button
                  type="button"
                  className="checklist-remove"
                  onClick={() => onRemoveItem(item.id)}
                  aria-label="Remover item"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleAddItem} className="checklist-add-row">
          <input
            type="text"
            value={newItemText}
            onChange={(event) => setNewItemText(event.target.value)}
            placeholder="Novo item da checklist..."
          />
          <button type="submit" disabled={!newItemText.trim()}>
            Adicionar
          </button>
        </form>
      </div>
    </div>
  )
}

export default TaskWindowContent
