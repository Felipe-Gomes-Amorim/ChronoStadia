import { useState } from 'react'
import WindowFrame from './WindowFrame'

const DIALOG_Z_INDEX = 1000
const NOTE_GLYPH = '📝'

interface NewNoteWindowProps {
  onCreate: (name: string, glyph: string) => void
  onClose: () => void
}

function NewNoteWindow({ onCreate, onClose }: NewNoteWindowProps) {
  const [name, setName] = useState('')

  function handleSubmit(): void {
    const trimmed = name.trim()
    if (!trimmed) return
    onCreate(trimmed, NOTE_GLYPH)
  }

  return (
    <WindowFrame
      title="Nova Nota"
      onClose={onClose}
      zIndex={DIALOG_Z_INDEX}
      width={320}
      resizable={false}
      showWindowControls={false}
    >
      <div className="new-task-form">
        <div className="field-row-stacked">
          <label htmlFor="note-name">Nome da nota</label>
          <input
            id="note-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit()
              if (e.key === 'Escape') onClose()
            }}
            autoFocus
            maxLength={60}
          />
        </div>
        <div className="new-task-actions">
          <button onClick={handleSubmit} disabled={!name.trim()}>Criar</button>
          <button onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </WindowFrame>
  )
}

export default NewNoteWindow
