import { useState, type FormEvent } from 'react'
import WindowFrame, { DIALOG_Z_INDEX } from './WindowFrame'

interface NewExpenseWindowProps {
  onCreate: (name: string, value: number) => void
  onClose: () => void
}

function NewExpenseWindow({ onCreate, onClose }: NewExpenseWindowProps) {
  const [name, setName] = useState('')
  const [rawValue, setRawValue] = useState('')

  const parsedValue = parseFloat(rawValue.replace(',', '.'))
  const isValid = name.trim().length > 0 && !isNaN(parsedValue) && parsedValue >= 0

  function handleSubmit(event: FormEvent): void {
    event.preventDefault()
    if (!isValid) return
    onCreate(name.trim(), parsedValue)
  }

  return (
    <WindowFrame
      title="Nova Despesa"
      onClose={onClose}
      initialPosition={{ x: 260, y: 160 }}
      showWindowControls={false}
      resizable={false}
      width={320}
      zIndex={DIALOG_Z_INDEX}
    >
      <form onSubmit={handleSubmit}>
        <div className="field-row-stacked">
          <label htmlFor="new-expense-name">Nome da despesa</label>
          <input
            id="new-expense-name"
            type="text"
            value={name}
            autoFocus
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Café, Aluguel, Academia..."
          />
        </div>

        <div className="field-row-stacked">
          <label htmlFor="new-expense-value">Valor (R$)</label>
          <input
            id="new-expense-value"
            type="text"
            inputMode="decimal"
            value={rawValue}
            onChange={(e) => setRawValue(e.target.value)}
            placeholder="0,00"
          />
        </div>

        <div className="dialog-actions">
          <button type="submit" disabled={!isValid}>Criar</button>
          <button type="button" onClick={onClose}>Cancelar</button>
        </div>
      </form>
    </WindowFrame>
  )
}

export default NewExpenseWindow
