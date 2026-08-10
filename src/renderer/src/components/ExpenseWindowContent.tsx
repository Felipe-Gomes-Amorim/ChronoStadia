interface ExpenseWindowContentProps {
  value: number
  onChange: (value: number) => void
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function ExpenseWindowContent({ value, onChange }: ExpenseWindowContentProps) {
  function handleChange(raw: string): void {
    const parsed = parseFloat(raw.replace(',', '.'))
    if (!isNaN(parsed) && parsed >= 0) onChange(parsed)
  }

  return (
    <div className="expense-window-body">
      <div className="field-row-stacked">
        <label htmlFor="expense-value">Valor (R$)</label>
        <input
          id="expense-value"
          type="text"
          inputMode="decimal"
          defaultValue={value.toFixed(2).replace('.', ',')}
          key={value}
          onBlur={(e) => handleChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
          className="expense-value-input"
        />
      </div>

      <div className="expense-total-display">{formatCurrency(value)}</div>
    </div>
  )
}

export default ExpenseWindowContent
