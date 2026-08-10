import { useState } from 'react'
import { createPortal } from 'react-dom'
import { resolveIconAsset } from '../assets/icons/builtins'
import type { DesktopIconData } from '../types'
import ContextMenu from './ContextMenu'
import TaskPickerDialog from './TaskPickerDialog'

const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]
const WEEKDAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const WEEKDAYS_FULL_PT = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
  'Quinta-feira', 'Sexta-feira', 'Sábado'
]

const MAX_VISIBLE_BADGES = 2

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

interface DateRef { year: number; month: number; day: number }

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size))
  return result
}

export function makeDateKey(d: DateRef): string {
  return `${d.year}-${String(d.month + 1).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`
}

function GlyphIcon({ icon, size = 16 }: { icon: DesktopIconData; size?: number }) {
  const src = resolveIconAsset(icon.builtin, icon.id, icon.glyph)
  if (src) {
    return (
      <img
        src={src} width={size} height={size} alt="" draggable={false}
        style={{ imageRendering: 'pixelated', display: 'inline-block', verticalAlign: 'middle' }}
      />
    )
  }
  return <>{icon.glyph}</>
}

type BadgeItem =
  | { kind: 'task';            item: DesktopIconData; isWeekly: boolean }
  | { kind: 'expense';         item: DesktopIconData; isWeekly: boolean }
  | { kind: 'monthly-expense'; item: DesktopIconData; storedDay: number }

interface CalendarWindowProps {
  tasks: DesktopIconData[]
  dayTasks: Record<string, string[]>
  weeklyTasks: Record<string, string[]>
  onUpdateDayTasks: (u: (p: Record<string, string[]>) => Record<string, string[]>) => void
  onUpdateWeeklyTasks: (u: (p: Record<string, string[]>) => Record<string, string[]>) => void
  expenses: DesktopIconData[]
  dayExpenses: Record<string, string[]>
  weeklyExpenses: Record<string, string[]>
  onUpdateDayExpenses: (u: (p: Record<string, string[]>) => Record<string, string[]>) => void
  onUpdateWeeklyExpenses: (u: (p: Record<string, string[]>) => Record<string, string[]>) => void
  monthlyExpenses: Record<string, string[]>
  onUpdateMonthlyExpenses: (u: (p: Record<string, string[]>) => Record<string, string[]>) => void
  onOpenTask: (id: string) => void
}

interface DayCtx  { kind: 'day';     x: number; y: number; day: number }
interface WeekCtx { kind: 'weekday'; x: number; y: number; weekday: number }

type PickerState =
  | { mode: 'task-day';        date: DateRef }
  | { mode: 'task-weekly';     weekday: number }
  | { mode: 'expense-day';     date: DateRef }
  | { mode: 'expense-weekly';  weekday: number }
  | { mode: 'expense-monthly'; dayNum: number }

function CalendarWindow({
  tasks, dayTasks, weeklyTasks, onUpdateDayTasks, onUpdateWeeklyTasks,
  expenses, dayExpenses, weeklyExpenses, onUpdateDayExpenses, onUpdateWeeklyExpenses,
  monthlyExpenses, onUpdateMonthlyExpenses, onOpenTask
}: CalendarWindowProps) {
  const today = new Date()
  const [year, setYear]       = useState(today.getFullYear())
  const [month, setMonth]     = useState(today.getMonth())
  const [dayView, setDayView] = useState<DateRef | null>(null)
  const [ctx, setCtx]         = useState<DayCtx | WeekCtx | null>(null)
  const [picker, setPicker]   = useState<PickerState | null>(null)

  function prevMonth(): void {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  function nextMonth(): void {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }
  function goToday(): void { setYear(today.getFullYear()); setMonth(today.getMonth()) }

  // ── Day tasks ──────────────────────────────────────────────────
  function attachDayTask(date: DateRef, taskId: string): void {
    const key = makeDateKey(date)
    onUpdateDayTasks(prev => {
      const ex = prev[key] ?? []
      return ex.includes(taskId) ? prev : { ...prev, [key]: [...ex, taskId] }
    })
    setPicker(null)
  }
  function detachDayTask(date: DateRef, taskId: string): void {
    const key = makeDateKey(date)
    onUpdateDayTasks(prev => {
      const next = (prev[key] ?? []).filter(id => id !== taskId)
      if (next.length === 0) { const { [key]: _, ...rest } = prev; return rest }
      return { ...prev, [key]: next }
    })
  }

  // ── Weekly tasks ───────────────────────────────────────────────
  function attachWeeklyTask(weekday: number, taskId: string): void {
    const k = String(weekday)
    onUpdateWeeklyTasks(prev => {
      const ex = prev[k] ?? []
      return ex.includes(taskId) ? prev : { ...prev, [k]: [...ex, taskId] }
    })
    setPicker(null)
  }
  function detachWeeklyTask(weekday: number, taskId: string): void {
    const k = String(weekday)
    onUpdateWeeklyTasks(prev => {
      const next = (prev[k] ?? []).filter(id => id !== taskId)
      if (next.length === 0) { const { [k]: _, ...rest } = prev; return rest }
      return { ...prev, [k]: next }
    })
  }

  // ── Day expenses ───────────────────────────────────────────────
  function attachDayExpense(date: DateRef, expenseId: string): void {
    const key = makeDateKey(date)
    onUpdateDayExpenses(prev => {
      const ex = prev[key] ?? []
      return ex.includes(expenseId) ? prev : { ...prev, [key]: [...ex, expenseId] }
    })
    setPicker(null)
  }
  function detachDayExpense(date: DateRef, expenseId: string): void {
    const key = makeDateKey(date)
    onUpdateDayExpenses(prev => {
      const next = (prev[key] ?? []).filter(id => id !== expenseId)
      if (next.length === 0) { const { [key]: _, ...rest } = prev; return rest }
      return { ...prev, [key]: next }
    })
  }

  // ── Weekly expenses ────────────────────────────────────────────
  function attachWeeklyExpense(weekday: number, expenseId: string): void {
    const k = String(weekday)
    onUpdateWeeklyExpenses(prev => {
      const ex = prev[k] ?? []
      return ex.includes(expenseId) ? prev : { ...prev, [k]: [...ex, expenseId] }
    })
    setPicker(null)
  }
  function detachWeeklyExpense(weekday: number, expenseId: string): void {
    const k = String(weekday)
    onUpdateWeeklyExpenses(prev => {
      const next = (prev[k] ?? []).filter(id => id !== expenseId)
      if (next.length === 0) { const { [k]: _, ...rest } = prev; return rest }
      return { ...prev, [k]: next }
    })
  }

  // ── Monthly expenses ───────────────────────────────────────────
  // Key = "1"–"31" (day number). If the month has fewer days than stored day,
  // the expense falls back to the last day of that month (handled in display).
  function attachMonthlyExpense(dayNum: number, expenseId: string): void {
    const k = String(dayNum)
    onUpdateMonthlyExpenses(prev => {
      const ex = prev[k] ?? []
      return ex.includes(expenseId) ? prev : { ...prev, [k]: [...ex, expenseId] }
    })
    setPicker(null)
  }
  function detachMonthlyExpense(expenseId: string, storedDay: number): void {
    const k = String(storedDay)
    onUpdateMonthlyExpenses(prev => {
      const next = (prev[k] ?? []).filter(id => id !== expenseId)
      if (next.length === 0) { const { [k]: _, ...rest } = prev; return rest }
      return { ...prev, [k]: next }
    })
  }

  // ── Helpers ────────────────────────────────────────────────────
  function combinedTaskIds(dateKey: string, weekday: number): { specific: string[]; weekly: string[] } {
    const specific = dayTasks[dateKey] ?? []
    const weekly   = (weeklyTasks[String(weekday)] ?? []).filter(id => !specific.includes(id))
    return { specific, weekly }
  }
  function combinedExpenseIds(dateKey: string, weekday: number): { specific: string[]; weekly: string[] } {
    const specific = dayExpenses[dateKey] ?? []
    const weekly   = (weeklyExpenses[String(weekday)] ?? []).filter(id => !specific.includes(id))
    return { specific, weekly }
  }

  // Returns monthly expense entries for a display day, including overflow fallback.
  // If displayDay is the last day of the viewed month and < 31, expenses stored on
  // days 32+…31 also fall here (e.g. day 31 expense shows on Feb 28).
  function getMonthlyItemsForDay(displayDay: number): { id: string; storedDay: number }[] {
    const daysInViewedMonth = new Date(year, month + 1, 0).getDate()
    const result: { id: string; storedDay: number }[] = []
    const seen = new Set<string>()
    for (const id of (monthlyExpenses[String(displayDay)] ?? [])) {
      if (!seen.has(id)) { result.push({ id, storedDay: displayDay }); seen.add(id) }
    }
    if (displayDay === daysInViewedMonth && displayDay < 31) {
      for (let overflow = displayDay + 1; overflow <= 31; overflow++) {
        for (const id of (monthlyExpenses[String(overflow)] ?? [])) {
          if (!seen.has(id)) { result.push({ id, storedDay: overflow }); seen.add(id) }
        }
      }
    }
    return result
  }

  function allMonthlyIds(): string[] {
    return [...new Set(Object.values(monthlyExpenses).flat())]
  }

  const taskMap    = new Map(tasks.map(t => [t.id, t]))
  const expenseMap = new Map(expenses.map(e => [e.id, e]))

  // ── Already-attached helper (used by pickers in both views) ────
  function getAlreadyAttached(): string[] {
    if (!picker) return []
    if (picker.mode === 'task-day') {
      const wd = new Date(picker.date.year, picker.date.month, picker.date.day).getDay()
      const { specific, weekly } = combinedTaskIds(makeDateKey(picker.date), wd)
      return [...specific, ...weekly]
    }
    if (picker.mode === 'task-weekly') return weeklyTasks[String(picker.weekday)] ?? []
    if (picker.mode === 'expense-day') {
      const wd = new Date(picker.date.year, picker.date.month, picker.date.day).getDay()
      const { specific, weekly } = combinedExpenseIds(makeDateKey(picker.date), wd)
      return [...specific, ...weekly]
    }
    if (picker.mode === 'expense-weekly') return weeklyExpenses[String(picker.weekday)] ?? []
    if (picker.mode === 'expense-monthly') return allMonthlyIds()
    return []
  }

  // ── Day view ───────────────────────────────────────────────────
  if (dayView != null) {
    const dvKey     = makeDateKey(dayView)
    const dvWeekday = new Date(dayView.year, dayView.month, dayView.day).getDay()
    const { specific: dvTaskSpec,  weekly: dvTaskWeekly  } = combinedTaskIds(dvKey, dvWeekday)
    const { specific: dvExpSpec,   weekly: dvExpWeekly   } = combinedExpenseIds(dvKey, dvWeekday)

    const dvTasks    = [...dvTaskSpec, ...dvTaskWeekly]
      .map(id => taskMap.get(id)).filter((t): t is DesktopIconData => t != null)
    const dvExpenses = [...dvExpSpec, ...dvExpWeekly]
      .map(id => expenseMap.get(id)).filter((e): e is DesktopIconData => e != null)

    const dvMonthlyRaw = getMonthlyItemsForDay(dayView.day)
    const dvMonthly    = dvMonthlyRaw
      .map(({ id, storedDay }) => {
        const e = expenseMap.get(id)
        return e ? { expense: e, storedDay } : null
      })
      .filter((x): x is { expense: DesktopIconData; storedDay: number } => x != null)

    const dvIsToday     = dayView.year === today.getFullYear() && dayView.month === today.getMonth() && dayView.day === today.getDate()
    const dvHasContent  = dvTasks.length > 0 || dvExpenses.length > 0 || dvMonthly.length > 0
    const dvExpTotal    = dvExpenses.reduce((s, e) => s + (e.value ?? 0), 0)
    const dvMonthTotal  = dvMonthly.reduce((s, { expense }) => s + (expense.value ?? 0), 0)
    const dvDayTotal    = dvExpTotal + dvMonthTotal

    return (
      <>
        <div className="calendar-day-view">
          <div className="calendar-day-view-header">
            <button onClick={() => setDayView(null)}>← Voltar</button>
            <div className="calendar-day-view-title">
              {WEEKDAYS_FULL_PT[dvWeekday]}, {dayView.day} de {MONTHS_PT[dayView.month]} de {dayView.year}
              {dvIsToday && <span className="calendar-day-view-today-badge">Hoje</span>}
            </div>
          </div>

          <div className="calendar-day-view-body">
            {!dvHasContent && <p className="calendar-day-view-empty">Nenhum item neste dia.</p>}

            {dvTasks.length > 0 && (
              <>
                <div className="calendar-day-section-label">Tarefas</div>
                <ul className="calendar-day-task-list">
                  {dvTasks.map(task => {
                    const isWeekly = dvTaskWeekly.includes(task.id)
                    return (
                      <li
                        key={task.id}
                        className="calendar-day-task-row"
                        onDoubleClick={() => onOpenTask(task.id)}
                        title="Duplo-clique para abrir"
                      >
                        <span className="calendar-day-task-glyph"><GlyphIcon icon={task} size={20} /></span>
                        <span className="calendar-day-task-name">
                          {task.label}
                          {isWeekly && <span className="calendar-weekly-badge">↺ toda {WEEKDAYS_PT[dvWeekday]}</span>}
                        </span>
                        <button
                          className="calendar-day-task-remove"
                          onClick={() => isWeekly ? detachWeeklyTask(dvWeekday, task.id) : detachDayTask(dayView, task.id)}
                          title={isWeekly ? `Remover de todas as ${WEEKDAYS_FULL_PT[dvWeekday]}s` : `Remover ${task.label}`}
                        >×</button>
                      </li>
                    )
                  })}
                </ul>
              </>
            )}

            {(dvExpenses.length > 0 || dvMonthly.length > 0) && (
              <>
                <div className="calendar-day-section-label calendar-expense-section-label">
                  Despesas
                  <span className="calendar-day-expense-total">{formatCurrency(dvDayTotal)}</span>
                </div>
                <ul className="calendar-day-task-list">
                  {dvExpenses.map(expense => {
                    const isWeekly = dvExpWeekly.includes(expense.id)
                    return (
                      <li
                        key={expense.id}
                        className="calendar-day-task-row calendar-expense-row"
                        onDoubleClick={() => onOpenTask(expense.id)}
                        title="Duplo-clique para abrir"
                      >
                        <span className="calendar-day-task-glyph calendar-expense-glyph">
                          <GlyphIcon icon={expense} size={20} />
                        </span>
                        <span className="calendar-day-task-name">
                          {expense.label}
                          <span className="calendar-expense-value-inline">{formatCurrency(expense.value ?? 0)}</span>
                          {isWeekly && <span className="calendar-weekly-badge">↺ toda {WEEKDAYS_PT[dvWeekday]}</span>}
                        </span>
                        <button
                          className="calendar-day-task-remove"
                          onClick={() => isWeekly ? detachWeeklyExpense(dvWeekday, expense.id) : detachDayExpense(dayView, expense.id)}
                          title={isWeekly ? `Remover de todas as ${WEEKDAYS_FULL_PT[dvWeekday]}s` : `Remover ${expense.label}`}
                        >×</button>
                      </li>
                    )
                  })}
                  {dvMonthly.map(({ expense, storedDay }) => (
                    <li
                      key={`monthly-${expense.id}`}
                      className="calendar-day-task-row calendar-expense-row"
                      onDoubleClick={() => onOpenTask(expense.id)}
                      title="Despesa mensal – duplo-clique para abrir"
                    >
                      <span className="calendar-day-task-glyph calendar-expense-glyph">
                        <GlyphIcon icon={expense} size={20} />
                      </span>
                      <span className="calendar-day-task-name">
                        {expense.label}
                        <span className="calendar-expense-value-inline">{formatCurrency(expense.value ?? 0)}</span>
                        <span className="calendar-weekly-badge calendar-monthly-badge">↻ todo mês</span>
                      </span>
                      <button
                        className="calendar-day-task-remove"
                        onClick={() => detachMonthlyExpense(expense.id, storedDay)}
                        title={`Remover despesa mensal ${expense.label}`}
                      >×</button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div className="calendar-day-view-footer">
            <button onClick={() => setPicker({ mode: 'task-day', date: dayView })}>Anexar tarefa...</button>
            <button onClick={() => setPicker({ mode: 'expense-day', date: dayView })}>Anexar despesa...</button>
            <button onClick={() => setPicker({ mode: 'expense-monthly', dayNum: dayView.day })}>Despesa mensal...</button>
          </div>
        </div>

        {picker?.mode === 'task-day' && createPortal(
          <TaskPickerDialog
            tasks={tasks}
            alreadyAttached={getAlreadyAttached()}
            onSelect={taskId => attachDayTask(picker.date, taskId)}
            onClose={() => setPicker(null)}
          />,
          document.body
        )}
        {picker?.mode === 'expense-day' && createPortal(
          <TaskPickerDialog
            tasks={expenses}
            alreadyAttached={getAlreadyAttached()}
            onSelect={expId => attachDayExpense(picker.date, expId)}
            onClose={() => setPicker(null)}
            dialogTitle="Selecionar Despesa"
            emptyLabel="Não há despesas disponíveis."
          />,
          document.body
        )}
        {picker?.mode === 'expense-monthly' && createPortal(
          <TaskPickerDialog
            tasks={expenses}
            alreadyAttached={getAlreadyAttached()}
            onSelect={expId => attachMonthlyExpense(picker.dayNum, expId)}
            onClose={() => setPicker(null)}
            dialogTitle={`Despesa Mensal – Todo dia ${picker.dayNum}`}
            emptyLabel="Não há despesas disponíveis."
          />,
          document.body
        )}
      </>
    )
  }

  // ── Month view ─────────────────────────────────────────────────
  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const daysInMonth    = new Date(year, month + 1, 0).getDate()

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const weeks = chunk(cells, 7)
  const isViewingToday = year === today.getFullYear() && month === today.getMonth()
  const weekdayHasWeeklyExpense = (i: number) => (weeklyExpenses[String(i)] ?? []).length > 0

  return (
    <>
      <div className="calendar-content">
        <div className="calendar-nav">
          <button title="Ano anterior" onClick={() => setYear(y => y - 1)}>«</button>
          <button title="Mês anterior" onClick={prevMonth}>‹</button>
          <span className="calendar-title">{MONTHS_PT[month]} {year}</span>
          <button title="Próximo mês" onClick={nextMonth}>›</button>
          <button title="Próximo ano" onClick={() => setYear(y => y + 1)}>»</button>
          {!isViewingToday && <button className="calendar-today-btn" onClick={goToday}>Hoje</button>}
        </div>

        <div className="calendar-days-wrapper">
          <div className="calendar-weekday-row">
            {WEEKDAYS_PT.map((d, i) => (
              <div
                key={d}
                className={[
                  'calendar-weekday-header',
                  i === 0 ? 'calendar-sunday-header' : '',
                  (weeklyTasks[String(i)] ?? []).length > 0 || weekdayHasWeeklyExpense(i) ? 'calendar-weekday-has-weekly' : ''
                ].filter(Boolean).join(' ')}
                onContextMenu={e => {
                  e.preventDefault()
                  setCtx({ kind: 'weekday', x: e.clientX, y: e.clientY, weekday: i })
                }}
                title="Botão direito para adicionar tarefa ou despesa semanal"
              >
                {d}
                {((weeklyTasks[String(i)] ?? []).length > 0 || weekdayHasWeeklyExpense(i)) && (
                  <span className="calendar-weekday-weekly-dot" title="Tem itens semanais">↺</span>
                )}
              </div>
            ))}
          </div>

          <div className="calendar-body">
            {weeks.map((week, wi) => (
              <div key={wi} className="calendar-week-row">
                {week.map((day, di) => {
                  if (day == null) return <div key={di} className="calendar-cell calendar-cell-empty" />

                  const date: DateRef = { year, month, day }
                  const key  = makeDateKey(date)
                  const { specific: taskSpec, weekly: taskWeekly } = combinedTaskIds(key, di)
                  const { specific: expSpec,  weekly: expWeekly  } = combinedExpenseIds(key, di)
                  const monthlyRaw = getMonthlyItemsForDay(day)

                  const allTaskItems    = [...taskSpec, ...taskWeekly]
                    .map(id => taskMap.get(id)).filter((t): t is DesktopIconData => t != null)
                  const allExpenseItems = [...expSpec, ...expWeekly]
                    .map(id => expenseMap.get(id)).filter((e): e is DesktopIconData => e != null)
                  const allMonthlyItems = monthlyRaw
                    .map(({ id, storedDay }) => {
                      const e = expenseMap.get(id)
                      return e ? { item: e, storedDay } : null
                    })
                    .filter((x): x is { item: DesktopIconData; storedDay: number } => x != null)

                  const allBadges: BadgeItem[] = [
                    ...allTaskItems.map(t => ({ kind: 'task' as const, item: t, isWeekly: taskWeekly.includes(t.id) })),
                    ...allExpenseItems.map(e => ({ kind: 'expense' as const, item: e, isWeekly: expWeekly.includes(e.id) })),
                    ...allMonthlyItems.map(({ item, storedDay }) => ({ kind: 'monthly-expense' as const, item, storedDay })),
                  ]
                  const shown    = allBadges.slice(0, MAX_VISIBLE_BADGES)
                  const overflow = allBadges.length - MAX_VISIBLE_BADGES
                  const isToday  = isViewingToday && day === today.getDate()
                  const isSunday = di === 0

                  return (
                    <div
                      key={di}
                      className={['calendar-cell', isToday ? 'calendar-today' : '', isSunday ? 'calendar-sunday-day' : ''].filter(Boolean).join(' ')}
                      onContextMenu={e => { e.preventDefault(); e.stopPropagation(); setCtx({ kind: 'day', x: e.clientX, y: e.clientY, day }) }}
                      onDoubleClick={() => setDayView(date)}
                    >
                      <span className="calendar-day-num">{day}</span>
                      {shown.map(badge => {
                        const isMonthly = badge.kind === 'monthly-expense'
                        const isExpense = badge.kind === 'expense'
                        const isWeekly  = (badge.kind === 'task' || badge.kind === 'expense') && badge.isWeekly
                        return (
                          <div
                            key={`${badge.kind}-${badge.item.id}`}
                            className={[
                              'calendar-task-badge',
                              isWeekly ? 'calendar-task-badge-weekly' : '',
                              isExpense ? 'calendar-task-badge-expense' : '',
                              isMonthly ? 'calendar-task-badge-monthly-expense' : '',
                            ].filter(Boolean).join(' ')}
                          >
                            <span className="calendar-task-badge-text">
                              {isWeekly && <span className="calendar-badge-weekly-icon">↺</span>}
                              {isMonthly && <span className="calendar-badge-weekly-icon">↻</span>}
                              <GlyphIcon icon={badge.item} size={12} />
                              {' '}{badge.item.label}
                            </span>
                            <button
                              className="calendar-task-remove"
                              onClick={e => {
                                e.stopPropagation()
                                if (badge.kind === 'monthly-expense') {
                                  detachMonthlyExpense(badge.item.id, badge.storedDay)
                                } else if (badge.kind === 'expense') {
                                  badge.isWeekly ? detachWeeklyExpense(di, badge.item.id) : detachDayExpense(date, badge.item.id)
                                } else {
                                  badge.isWeekly ? detachWeeklyTask(di, badge.item.id) : detachDayTask(date, badge.item.id)
                                }
                              }}
                              title={
                                isMonthly ? `Remover despesa mensal ${badge.item.label}` :
                                isWeekly  ? `Remover de todas as ${WEEKDAYS_FULL_PT[di]}s` :
                                `Remover ${badge.item.label}`
                              }
                            >×</button>
                          </div>
                        )
                      })}
                      {overflow > 0 && <div className="calendar-task-more">+ {overflow}</div>}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {ctx?.kind === 'day' && (
        <ContextMenu
          x={ctx.x} y={ctx.y}
          items={[
            { label: 'Anexar tarefa...',                    onClick: () => { setPicker({ mode: 'task-day',        date: { year, month, day: ctx.day } }); setCtx(null) } },
            { label: 'Anexar despesa...',                   onClick: () => { setPicker({ mode: 'expense-day',     date: { year, month, day: ctx.day } }); setCtx(null) } },
            { label: `Despesa mensal (dia ${ctx.day})...`,  onClick: () => { setPicker({ mode: 'expense-monthly', dayNum: ctx.day }); setCtx(null) } },
          ]}
          onClose={() => setCtx(null)}
        />
      )}

      {ctx?.kind === 'weekday' && (
        <ContextMenu
          x={ctx.x} y={ctx.y}
          items={[
            { label: `Marcar tarefa semanal (${WEEKDAYS_PT[ctx.weekday]})...`,  onClick: () => { setPicker({ mode: 'task-weekly',    weekday: ctx.weekday }); setCtx(null) } },
            { label: `Marcar despesa semanal (${WEEKDAYS_PT[ctx.weekday]})...`, onClick: () => { setPicker({ mode: 'expense-weekly', weekday: ctx.weekday }); setCtx(null) } },
          ]}
          onClose={() => setCtx(null)}
        />
      )}

      {picker?.mode === 'task-day' && createPortal(
        <TaskPickerDialog
          tasks={tasks}
          alreadyAttached={getAlreadyAttached()}
          onSelect={taskId => attachDayTask(picker.date, taskId)}
          onClose={() => setPicker(null)}
        />,
        document.body
      )}
      {picker?.mode === 'task-weekly' && createPortal(
        <TaskPickerDialog
          tasks={tasks}
          alreadyAttached={getAlreadyAttached()}
          onSelect={taskId => attachWeeklyTask(picker.weekday, taskId)}
          onClose={() => setPicker(null)}
        />,
        document.body
      )}
      {picker?.mode === 'expense-day' && createPortal(
        <TaskPickerDialog
          tasks={expenses}
          alreadyAttached={getAlreadyAttached()}
          onSelect={expId => attachDayExpense(picker.date, expId)}
          onClose={() => setPicker(null)}
          dialogTitle="Selecionar Despesa"
          emptyLabel="Não há despesas disponíveis."
        />,
        document.body
      )}
      {picker?.mode === 'expense-weekly' && createPortal(
        <TaskPickerDialog
          tasks={expenses}
          alreadyAttached={getAlreadyAttached()}
          onSelect={expId => attachWeeklyExpense(picker.weekday, expId)}
          onClose={() => setPicker(null)}
          dialogTitle="Selecionar Despesa"
          emptyLabel="Não há despesas disponíveis."
        />,
        document.body
      )}
      {picker?.mode === 'expense-monthly' && createPortal(
        <TaskPickerDialog
          tasks={expenses}
          alreadyAttached={getAlreadyAttached()}
          onSelect={expId => attachMonthlyExpense(picker.dayNum, expId)}
          onClose={() => setPicker(null)}
          dialogTitle={`Despesa Mensal – Todo dia ${picker.dayNum}`}
          emptyLabel="Não há despesas disponíveis."
        />,
        document.body
      )}
    </>
  )
}

export default CalendarWindow
