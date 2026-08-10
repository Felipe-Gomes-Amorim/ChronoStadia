import { useState } from 'react'

const FONT_SIZES = [13, 15, 17, 20]

interface NoteWindowContentProps {
  content: string
  onChange: (value: string) => void
}

function NoteWindowContent({ content, onChange }: NoteWindowContentProps) {
  const [sizeIdx, setSizeIdx] = useState(0)

  return (
    <div className="note-window-wrap">
      <textarea
        className="note-window-textarea"
        style={{ fontSize: FONT_SIZES[sizeIdx] }}
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Digite suas anotações aqui..."
        spellCheck={false}
      />
      <div className="note-font-bar">
        <button
          className="note-font-btn"
          onClick={() => setSizeIdx((i) => Math.max(0, i - 1))}
          disabled={sizeIdx === 0}
          title="Diminuir texto"
        >
          <span style={{ fontSize: 10 }}>A</span>
          <span style={{ fontSize: 13 }}>A</span>
          <span style={{ fontSize: 9, marginLeft: 1 }}>−</span>
        </button>
        <button
          className="note-font-btn"
          onClick={() => setSizeIdx((i) => Math.min(FONT_SIZES.length - 1, i + 1))}
          disabled={sizeIdx === FONT_SIZES.length - 1}
          title="Aumentar texto"
        >
          <span style={{ fontSize: 10 }}>A</span>
          <span style={{ fontSize: 13 }}>A</span>
          <span style={{ fontSize: 9, marginLeft: 1 }}>+</span>
        </button>
        <span className="note-font-label">{FONT_SIZES[sizeIdx]}px</span>
      </div>
    </div>
  )
}

export default NoteWindowContent
