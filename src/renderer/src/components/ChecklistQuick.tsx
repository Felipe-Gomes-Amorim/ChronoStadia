import type { ChecklistItem } from '../types'

interface ChecklistQuickProps {
  checklist: ChecklistItem[]
  onToggleItem: (itemId: string) => void
}

function ChecklistQuick({ checklist, onToggleItem }: ChecklistQuickProps) {
  if (checklist.length === 0) {
    return <p className="timer-no-checklist">Essa tarefa ainda não tem checklist.</p>
  }

  return (
    <ul className="checklist-items">
      {checklist.map((item) => (
        <li key={item.id} className="checklist-item">
          <input
            type="checkbox"
            id={`timer-check-${item.id}`}
            checked={item.done}
            onChange={() => onToggleItem(item.id)}
          />
          <label
            htmlFor={`timer-check-${item.id}`}
            className={item.done ? 'checklist-done' : ''}
          >
            {item.text}
          </label>
        </li>
      ))}
    </ul>
  )
}

export default ChecklistQuick
