import chestCheckmarkIcon from '../assets/icons/32x32/chest_checkmark.png'
import type { DesktopIconData } from '../types'

const WIDGET_Z_INDEX = 500

const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function calcCalendarMonthTotal(
  expenses: DesktopIconData[],
  dayExpenses: Record<string, string[]>,
  weeklyExpenses: Record<string, string[]>
): number {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const expenseMap = new Map(expenses.map(e => [e.id, e.value ?? 0]))

  let total = 0
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const weekday = new Date(year, month, d).getDay()
    const specific = dayExpenses[dateKey] ?? []
    const weekly = (weeklyExpenses[String(weekday)] ?? []).filter(id => !specific.includes(id))
    for (const id of [...specific, ...weekly]) {
      total += expenseMap.get(id) ?? 0
    }
  }
  return total
}

interface SpendingWidgetProps {
  minimized?: boolean
  expenses: DesktopIconData[]
  dayExpenses: Record<string, string[]>
  weeklyExpenses: Record<string, string[]>
  monthlyExpenses: Record<string, string[]>
  bottomOffset?: number
  onMinimize?: () => void
  onClose: () => void
}

function SpendingWidget({ minimized, expenses, dayExpenses, weeklyExpenses, monthlyExpenses, bottomOffset, onMinimize, onClose }: SpendingWidgetProps) {
  const now = new Date()
  const expenseMap = new Map(expenses.map(e => [e.id, e]))

  const totalGeral = expenses.reduce((sum, e) => sum + (e.value ?? 0), 0)

  // Monthly recurring: each expense counted once regardless of day
  const monthlyIds = new Set<string>()
  for (const ids of Object.values(monthlyExpenses)) {
    for (const id of ids) monthlyIds.add(id)
  }
  const monthlyRecurringTotal = [...monthlyIds].reduce(
    (sum, id) => sum + (expenseMap.get(id)?.value ?? 0), 0
  )

  // Specific-day + weekly calendar expenses for this month
  const calendarTotal = calcCalendarMonthTotal(expenses, dayExpenses, weeklyExpenses)

  const totalMes = monthlyRecurringTotal + calendarTotal
  const mesLabel = `${MONTHS_PT[now.getMonth()]} ${now.getFullYear()}`

  return (
    <div className="window spending-widget" style={{ zIndex: WIDGET_Z_INDEX, ...(bottomOffset !== undefined ? { bottom: bottomOffset } : {}) }}>
      <div className="title-bar">
        <div className="title-bar-text">
          <img src={chestCheckmarkIcon} width={14} height={14} alt="" className="pixel-icon title-bar-icon" />
          Gastos
        </div>
        <div className="title-bar-controls">
          {onMinimize && <button aria-label="Minimize" onClick={onMinimize}></button>}
          <button aria-label="Close" onClick={onClose}></button>
        </div>
      </div>

      {!minimized && (
        <div className="window-body spending-body">
          <div className="spending-row">
            <span className="spending-label">Total geral</span>
            <span className="spending-value">{formatCurrency(totalGeral)}</span>
          </div>
          <hr className="spending-divider" />
          <div className="spending-row">
            <span className="spending-label">Este mês</span>
            <span className="spending-value spending-value-month">{formatCurrency(totalMes)}</span>
          </div>
          <div className="spending-month-hint">{mesLabel}</div>
        </div>
      )}
    </div>
  )
}

export default SpendingWidget
