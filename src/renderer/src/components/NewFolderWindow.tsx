import { useState, type FormEvent } from 'react'
import WindowFrame, { DIALOG_Z_INDEX } from './WindowFrame'

const FOLDER_GLYPH = '📁'

interface NewFolderWindowProps {
  onCreate: (name: string, glyph: string) => void
  onClose: () => void
}

function NewFolderWindow({ onCreate, onClose }: NewFolderWindowProps) {
  const [name, setName] = useState('')

  function handleSubmit(event: FormEvent): void {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onCreate(trimmed, FOLDER_GLYPH)
  }

  return (
    <WindowFrame
      title="Nova Pasta"
      onClose={onClose}
      initialPosition={{ x: 260, y: 160 }}
      showWindowControls={false}
      resizable={false}
      width={340}
      zIndex={DIALOG_Z_INDEX}
    >
      <form onSubmit={handleSubmit}>
        <div className="field-row-stacked">
          <label htmlFor="new-folder-name">Nome da pasta</label>
          <input
            id="new-folder-name"
            type="text"
            value={name}
            autoFocus
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="dialog-actions">
          <button type="submit" disabled={!name.trim()}>Criar</button>
          <button type="button" onClick={onClose}>Cancelar</button>
        </div>
      </form>
    </WindowFrame>
  )
}

export default NewFolderWindow
