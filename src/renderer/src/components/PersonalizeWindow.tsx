import { useRef, type ChangeEvent } from 'react'
import WindowFrame, { DIALOG_Z_INDEX } from './WindowFrame'
import type { BackgroundState } from '../types'

const WIN98_COLORS: { label: string; value: string }[] = [
  { label: 'Verde-azulado', value: '#008080' },
  { label: 'Azul Marinho', value: '#000080' },
  { label: 'Verde Floresta', value: '#006400' },
  { label: 'Roxo', value: '#800080' },
  { label: 'Cinza', value: '#808080' },
  { label: 'Prata', value: '#C0C0C0' },
  { label: 'Preto', value: '#000000' },
  { label: 'Borgonha', value: '#800000' }
]

interface PersonalizeWindowProps {
  current: BackgroundState
  onBackground: (bg: BackgroundState) => void
  onClose: () => void
}

function PersonalizeWindow({ current, onBackground, onClose }: PersonalizeWindowProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onBackground({ kind: 'image', dataUrl: reader.result })
      }
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  const selectedColor = current.kind === 'color' ? current.color : null

  return (
    <WindowFrame
      title="Personalizar Área de Trabalho"
      onClose={onClose}
      initialPosition={{ x: 240, y: 120 }}
      showWindowControls={false}
      resizable={false}
      width={420}
      zIndex={DIALOG_Z_INDEX}
    >
      <div className="field-row-stacked">
        <label>Cor de fundo</label>
        <div className="color-swatch-grid">
          {WIN98_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              className={`color-swatch${selectedColor === c.value ? ' selected' : ''}`}
              style={{ background: c.value }}
              title={c.label}
              onClick={() => onBackground({ kind: 'color', color: c.value })}
            />
          ))}
        </div>
      </div>

      <div className="field-row-stacked" style={{ marginTop: 12 }}>
        <label>Papel de parede</label>
        <div className="wallpaper-row">
          <button type="button" onClick={() => fileInputRef.current?.click()}>
            Procurar...
          </button>
          {current.kind === 'image' && (
            <>
              <img
                className="wallpaper-preview"
                src={current.dataUrl}
                alt="preview"
              />
              <button
                type="button"
                onClick={() => onBackground({ kind: 'color', color: '#008080' })}
              >
                Remover
              </button>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      <div className="dialog-actions">
        <button type="button" onClick={onClose}>
          Fechar
        </button>
      </div>
    </WindowFrame>
  )
}

export default PersonalizeWindow
