import { useState, type FormEvent } from 'react'
import IconPicker from './IconPicker'
import WindowFrame, { DIALOG_Z_INDEX } from './WindowFrame'
import type { DesktopIconData } from '../types'

interface PropertiesWindowProps {
  icon: DesktopIconData
  onSave: (id: string, name: string, glyph: string) => void
  onClose: () => void
}

function PropertiesWindow({ icon, onSave, onClose }: PropertiesWindowProps) {
  const [name, setName] = useState(icon.label)
  const [glyph, setGlyph] = useState(icon.glyph)

  function handleSubmit(event: FormEvent): void {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onSave(icon.id, trimmed, glyph)
  }

  return (
    <WindowFrame
      title={`Propriedades de ${icon.label}`}
      onClose={onClose}
      initialPosition={{ x: 280, y: 180 }}
      showWindowControls={false}
      resizable={false}
      width={420}
      zIndex={DIALOG_Z_INDEX}
    >
      <form onSubmit={handleSubmit}>
        <div className="field-row-stacked">
          <label htmlFor="task-properties-name">Nome</label>
          <input
            id="task-properties-name"
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
            Salvar
          </button>
          <button type="button" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </form>
    </WindowFrame>
  )
}

export default PropertiesWindow
