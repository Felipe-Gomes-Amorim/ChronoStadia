import { useState, type FormEvent } from 'react'
import IconPicker, { ICON_OPTIONS } from './IconPicker'
import WindowFrame, { DIALOG_Z_INDEX } from './WindowFrame'

interface NewTaskWindowProps {
  onCreate: (name: string, glyph: string) => void
  onClose: () => void
}

function NewTaskWindow({ onCreate, onClose }: NewTaskWindowProps) {
  const [name, setName] = useState('')
  const [glyph, setGlyph] = useState(ICON_OPTIONS[0].src)

  function handleSubmit(event: FormEvent): void {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onCreate(trimmed, glyph)
  }

  return (
    <WindowFrame
      title="Nova Tarefa"
      onClose={onClose}
      initialPosition={{ x: 260, y: 160 }}
      showWindowControls={false}
      resizable={false}
      width={420}
      zIndex={DIALOG_Z_INDEX}
    >
      <form onSubmit={handleSubmit}>
        <div className="field-row-stacked">
          <label htmlFor="new-task-name">Nome da tarefa</label>
          <input
            id="new-task-name"
            type="text"
            value={name}
            autoFocus
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div className="field-row-stacked">
          <label>Ícone</label>
          <IconPicker value={glyph} onChange={setGlyph} />
        </div>

        <div className="dialog-actions">
          <button type="submit" disabled={!name.trim()}>
            Criar
          </button>
          <button type="button" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </form>
    </WindowFrame>
  )
}

export default NewTaskWindow
