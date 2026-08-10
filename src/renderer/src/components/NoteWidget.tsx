import { useState } from 'react'

const NOTE_Z_INDEX = 500

interface NoteWidgetProps {
  onClose: () => void
}

function NoteWidget({ onClose }: NoteWidgetProps) {
  const [text, setText] = useState('')

  return (
    <div className="window note-widget" style={{ zIndex: NOTE_Z_INDEX }}>
      <div className="title-bar">
        <div className="title-bar-text">Notas Rápidas</div>
        <div className="title-bar-controls">
          <button aria-label="Close" onClick={onClose}></button>
        </div>
      </div>
      <div className="window-body note-body">
        <textarea
          className="note-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Digite suas anotações aqui..."
          autoFocus
          spellCheck={false}
        />
      </div>
    </div>
  )
}

export default NoteWidget
