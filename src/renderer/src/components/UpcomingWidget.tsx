import clockPlayIcon from '../assets/icons/32x32/clock_play.png'
import { resolveIconAsset } from '../assets/icons/builtins'
import type { DesktopIconData } from '../types'

const UPCOMING_Z_INDEX = 500

const WEEKDAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS_SHORT_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const DAY_LABELS = ['Hoje', 'Amanhã', 'Depois de amanhã']

function makeDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

interface UpcomingWidgetProps {
  minimized?: boolean
  tasks: DesktopIconData[]
  dayTasks: Record<string, string[]>
  weeklyTasks: Record<string, string[]>
  top: number
  side?: 'right' | 'left'
  onMinimize?: () => void
  onClose: () => void
}

function UpcomingWidget({
  minimized = false,
  tasks,
  dayTasks,
  weeklyTasks,
  top,
  side = 'right',
  onMinimize,
  onClose
}: UpcomingWidgetProps) {
  const taskMap = new Map(tasks.map(t => [t.id, t]))

  const today = new Date()
  const days = [0, 1, 2].map(offset => {
    const d = new Date(today)
    d.setDate(d.getDate() + offset)
    return d
  })

  return (
    <div
      className="window upcoming-widget"
      style={{ zIndex: UPCOMING_Z_INDEX, top, display: minimized ? 'none' : undefined, ...(side === 'left' ? { right: 264 } : {}) }}
    >
      <div className="title-bar">
        <div className="title-bar-text">
          <img src={clockPlayIcon} width={14} height={14} alt="" className="pixel-icon title-bar-icon" />
          Dias Próximos
        </div>
        <div className="title-bar-controls">
          {onMinimize && <button aria-label="Minimize" onClick={onMinimize}></button>}
          <button aria-label="Close" onClick={onClose}></button>
        </div>
      </div>

      <div className="window-body upcoming-body">
        {days.map((d, i) => {
          const key     = makeDateKey(d)
          const weekday = d.getDay()
          const specific = dayTasks[key] ?? []
          const weekly   = (weeklyTasks[String(weekday)] ?? []).filter(id => !specific.includes(id))
          const allIds   = [...specific, ...weekly]
          const dayTaskList = allIds.map(id => taskMap.get(id)).filter((t): t is DesktopIconData => t != null)
          const isWeekend = weekday === 0 || weekday === 6

          return (
            <div key={key} className={`upcoming-day${i === 0 ? ' upcoming-day-today' : ''}`}>
              <div className="upcoming-day-header">
                <span className="upcoming-day-label">{DAY_LABELS[i]}</span>
                <span className={`upcoming-day-date${isWeekend ? ' upcoming-day-weekend' : ''}`}>
                  {WEEKDAYS_PT[weekday]}, {d.getDate()} {MONTHS_SHORT_PT[d.getMonth()]}
                </span>
              </div>

              {dayTaskList.length === 0 ? (
                <div className="upcoming-empty">sem tarefas</div>
              ) : (
                <ul className="upcoming-task-list">
                  {dayTaskList.map(task => {
                    const isWeekly = weekly.includes(task.id)
                    const iconSrc = resolveIconAsset(task.builtin, task.id, task.glyph)
                    return (
                      <li key={task.id} className="upcoming-task-item">
                        <span className="upcoming-task-glyph">
                          {iconSrc
                            ? <img src={iconSrc} width={16} height={16} alt="" draggable={false} style={{ imageRendering: 'pixelated', display: 'inline-block', verticalAlign: 'middle' }} />
                            : task.glyph}
                        </span>
                        <span className="upcoming-task-name">{task.label}</span>
                        {isWeekly && <span className="upcoming-weekly-dot" title="Tarefa semanal">↺</span>}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default UpcomingWidget
