import { useEffect, useRef, useState, type CSSProperties } from 'react'
import CalendarWindow from './components/CalendarWindow'
import ComputerWindow from './components/ComputerWindow'
import ContextMenu from './components/ContextMenu'
import Desktop from './components/Desktop'
import ExpenseWindowContent from './components/ExpenseWindowContent'
import FolderWindow from './components/FolderWindow'
import GuideWindow from './components/GuideWindow'
import NewExpenseWindow from './components/NewExpenseWindow'
import NewFolderWindow from './components/NewFolderWindow'
import NewTaskWindow from './components/NewTaskWindow'
import NewNoteWindow from './components/NewNoteWindow'
import NoteWidget from './components/NoteWidget'
import NoteWindowContent from './components/NoteWindowContent'
import ScreenSaver from './components/ScreenSaver'
import PersonalizeWindow from './components/PersonalizeWindow'
import PropertiesWindow from './components/PropertiesWindow'
import SpendingWidget from './components/SpendingWidget'
import StartMenu from './components/StartMenu'
import Taskbar from './components/Taskbar'
import TaskWindowContent from './components/TaskWindowContent'
import TimerWidget from './components/TimerWidget'
import UpcomingWidget from './components/UpcomingWidget'
import WindowFrame from './components/WindowFrame'
import { BUILTIN_ICON_ASSETS, resolveIconAsset } from './assets/icons/builtins'
import { loadBackground, loadCalendar, loadDayExpenses, loadFolders, loadIcons, loadMonthlyExpenses, loadWeekly, loadWeeklyExpenses, saveBackground, saveCalendar, saveDayExpenses, saveFolders, saveIcons, saveMonthlyExpenses, saveWeekly, saveWeeklyExpenses } from './storage'
import type { BackgroundState, DesktopIconData, KanbanColumn, OpenWindowState } from './types'

const DEFAULT_BACKGROUND: BackgroundState = { kind: 'color', color: '#008080' }

// ── Posicionamento na grade ───────────────────────────────────────────────
const ICON_GRID = 96

function posKey(pos: { x: number; y: number }): string {
  return `${pos.x},${pos.y}`
}

function nextCell(pos: { x: number; y: number }, desktopHeight: number): { x: number; y: number } {
  if (pos.y + ICON_GRID < desktopHeight) {
    return { x: pos.x, y: pos.y + ICON_GRID }
  }
  return { x: pos.x + ICON_GRID, y: 0 }
}

// Encontra a primeira célula visível não ocupada, varrendo coluna por coluna.
function findFreeCell(
  taken: Set<string>,
  desktopHeight: number
): { x: number; y: number } {
  let pos = { x: 0, y: 0 }
  while (taken.has(posKey(pos))) {
    pos = nextCell(pos, desktopHeight)
  }
  return pos
}

// Resolve sobreposições: processa ícones na ordem do array (prioridade = índice mais baixo).
// Ícones deslocados são movidos pra próxima célula livre, descendo até a borda e
// depois começando uma nova coluna à direita.
function resolveCollisions(
  icons: DesktopIconData[],
  desktopHeight: number
): DesktopIconData[] {
  const taken = new Set<string>()

  return icons.map((icon) => {
    let pos = icon.position
    while (taken.has(posKey(pos))) {
      pos = nextCell(pos, desktopHeight)
    }
    taken.add(posKey(pos))
    return pos.x === icon.position.x && pos.y === icon.position.y ? icon : { ...icon, position: pos }
  })
}

const INITIAL_ICONS: DesktopIconData[] = [
  {
    id: 'tasks',
    label: 'Minhas Tarefas',
    glyph: '🗂️',
    pinned: false,
    position: { x: 0, y: 0 },
    description: '',
    checklist: []
  },
  {
    id: 'notes',
    label: 'Notas Rápidas',
    glyph: '🗒️',
    pinned: false,
    position: { x: 0, y: 96 },
    builtin: 'notes',
    description: '',
    checklist: []
  },
  {
    id: 'timer',
    label: 'Cronômetro',
    glyph: '⏱️',
    pinned: false,
    position: { x: 0, y: 192 },
    builtin: 'timer',
    description: '',
    checklist: []
  },
  {
    id: 'calendar',
    label: 'Calendário',
    glyph: '📅',
    pinned: false,
    position: { x: 0, y: 288 },
    builtin: 'calendar',
    description: '',
    checklist: []
  },
  {
    id: 'upcoming',
    label: 'Dias Próximos',
    glyph: '📆',
    pinned: false,
    position: { x: 0, y: 384 },
    builtin: 'upcoming',
    description: '',
    checklist: []
  },
  {
    id: 'spending',
    label: 'Gastos',
    glyph: '💰',
    pinned: false,
    position: { x: 0, y: 480 },
    builtin: 'spending',
    description: '',
    checklist: []
  },
  {
    id: 'computer',
    label: 'Meu Computador',
    glyph: '💻',
    pinned: false,
    position: { x: 0, y: 576 },
    builtin: 'computer',
    description: '',
    checklist: []
  }
]

function App() {
  const [icons, setIcons] = useState<DesktopIconData[]>(() => {
    const saved = loadIcons()
    const base = (() => {
      if (!saved) return INITIAL_ICONS
      // Migração: restaura o campo `builtin` em ícones que foram salvos antes dele existir,
      // e garante que ícones builtin adicionados depois da primeira instalação apareçam.
      const builtinById = new Map(INITIAL_ICONS.filter(b => b.builtin).map(b => [b.id, b.builtin!]))
      const migrated = saved.map(icon =>
        !icon.builtin && builtinById.has(icon.id)
          ? { ...icon, builtin: builtinById.get(icon.id) }
          : icon
      )
      const missing = INITIAL_ICONS.filter((b) => b.builtin && !migrated.find((s) => s.id === b.id))
      return missing.length > 0 ? [...migrated, ...missing] : migrated
    })()
    return resolveCollisions(base, window.innerHeight - 36)
  })
  const [openWindows, setOpenWindows] = useState<OpenWindowState[]>([])
  const [isStartMenuOpen, setStartMenuOpen] = useState(false)
  const [isCreatingTask, setCreatingTask] = useState(false)
  const [editingIconId, setEditingIconId] = useState<string | null>(null)
  const [isPersonalizing, setPersonalizing] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const [folders, setFolders] = useState<Record<string, KanbanColumn[]>>(() => loadFolders())
  const [isCreatingFolder, setCreatingFolder] = useState(false)
  const [isCreatingNote, setCreatingNote] = useState(false)
  const [dayTasks, setDayTasks]             = useState<Record<string, string[]>>(() => loadCalendar())
  const [weeklyTasks, setWeeklyTasks]       = useState<Record<string, string[]>>(() => loadWeekly())
  const [dayExpenses, setDayExpenses]         = useState<Record<string, string[]>>(() => loadDayExpenses())
  const [weeklyExpenses, setWeeklyExpenses]   = useState<Record<string, string[]>>(() => loadWeeklyExpenses())
  const [monthlyExpenses, setMonthlyExpenses] = useState<Record<string, string[]>>(() => loadMonthlyExpenses())
  const [isCreatingExpense, setCreatingExpense] = useState(false)
  // timerOpen é derivado de openWindows (timer entra no sistema de janelas normalmente)
  // para aparecer na barra de tarefas como qualquer outro programa
  const [attachedTaskId, setAttachedTaskId] = useState<string | null>(null)
  const [shellCtx, setShellCtx] = useState<{ x: number; y: number } | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isScreenSaver, setScreenSaver] = useState(false)
  const [desktopBackground, setDesktopBackground] = useState<BackgroundState>(
    () => loadBackground() ?? DEFAULT_BACKGROUND
  )
  const [windowH, setWindowH] = useState(window.innerHeight)
  const [timerMeasuredH, setTimerMeasuredH] = useState(220)
  const startButtonRef = useRef<HTMLButtonElement>(null)
  const nextZIndexRef = useRef(10)
  const timerWidgetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    saveIcons(icons)
  }, [icons])

  // Rede de segurança: se por qualquer motivo dois ícones ficarem na mesma
  // célula, resolve automaticamente sem precisar de ação do usuário.
  useEffect(() => {
    const resolved = resolveCollisions(icons, window.innerHeight - 36)
    if (resolved.some((r, i) => r.position.x !== icons[i].position.x || r.position.y !== icons[i].position.y)) {
      setIcons(resolved)
    }
  }, [icons])

  useEffect(() => {
    saveBackground(desktopBackground)
  }, [desktopBackground])

  useEffect(() => {
    saveFolders(folders)
  }, [folders])

  useEffect(() => { saveCalendar(dayTasks) }, [dayTasks])
  useEffect(() => { saveWeekly(weeklyTasks) }, [weeklyTasks])
  useEffect(() => { saveDayExpenses(dayExpenses) }, [dayExpenses])
  useEffect(() => { saveWeeklyExpenses(weeklyExpenses) }, [weeklyExpenses])
  useEffect(() => { saveMonthlyExpenses(monthlyExpenses) }, [monthlyExpenses])

  useEffect(() => {
    window.api.isFullscreen().then(setIsFullscreen)
  }, [])

  useEffect(() => {
    function onResize() { setWindowH(window.innerHeight) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Derived early so the ResizeObserver effect can use it as a stable dependency.
  const timerVisible = openWindows.some((w) => w.id === 'timer' && !w.minimized)

  // Measure the timer widget's actual rendered height so we can stack Upcoming below it.
  // Re-attaches only when the timer opens, closes, or is minimized/restored.
  useEffect(() => {
    const el = timerWidgetRef.current
    if (!el) return
    const obs = new ResizeObserver(() => {
      if (timerWidgetRef.current) setTimerMeasuredH(timerWidgetRef.current.offsetHeight)
    })
    obs.observe(el)
    return () => obs.disconnect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerVisible])

  function openWindow(id: string): void {
    const icon = icons.find((candidate) => candidate.id === id)
    if (icon?.builtin === 'notes') {
      setNotesOpen(true)
      return
    }
    setOpenWindows((current) => {
      const existing = current.find((win) => win.id === id)
      if (existing) {
        return current.map((win) =>
          win.id === id ? { ...win, minimized: false, zIndex: nextZIndexRef.current++ } : win
        )
      }
      return [...current, { id, minimized: false, maximized: false, zIndex: nextZIndexRef.current++ }]
    })
  }

  function closeWindow(id: string): void {
    setOpenWindows((current) => current.filter((win) => win.id !== id))
  }

  function focusWindow(id: string): void {
    const z = nextZIndexRef.current++
    setOpenWindows((current) => current.map((win) => (win.id === id ? { ...win, zIndex: z } : win)))
  }

  function toggleMinimize(id: string): void {
    setOpenWindows((current) =>
      current.map((win) => {
        if (win.id !== id) return win
        const willBeMinimized = !win.minimized
        return {
          ...win,
          minimized: willBeMinimized,
          zIndex: willBeMinimized ? win.zIndex : nextZIndexRef.current++
        }
      })
    )
  }

  function toggleMaximize(id: string): void {
    setOpenWindows((current) =>
      current.map((win) => (win.id === id ? { ...win, maximized: !win.maximized } : win))
    )
  }

  function togglePinned(id: string): void {
    setIcons((current) =>
      current.map((icon) => (icon.id === id ? { ...icon, pinned: !icon.pinned } : icon))
    )
  }

  function createTask(name: string, glyph: string): void {
    setIcons((current) => {
      const desktopH = window.innerHeight - 36
      const taken = new Set(current.map((i) => posKey(i.position)))
      const withNew = [
        ...current,
        {
          id: crypto.randomUUID(),
          label: name,
          glyph,
          pinned: false,
          position: findFreeCell(taken, desktopH),
          description: '',
          checklist: []
        }
      ]
      return resolveCollisions(withNew, desktopH)
    })
    setCreatingTask(false)
  }

  function deleteIcon(id: string): void {
    const icon = icons.find((i) => i.id === id)
    setIcons((current) => current.filter((i) => i.id !== id))
    closeWindow(id)
    if (icon?.builtin === 'folder') {
      setFolders((prev) => {
        const { [id]: _removed, ...rest } = prev
        return rest
      })
    }
  }

  function createFolder(name: string, glyph: string): void {
    const id = crypto.randomUUID()
    const defaultColumns: KanbanColumn[] = [
      { id: crypto.randomUUID(), name: 'A Fazer', taskIds: [] },
      { id: crypto.randomUUID(), name: 'Em Andamento', taskIds: [] },
      { id: crypto.randomUUID(), name: 'Concluído', taskIds: [] }
    ]
    setIcons((current) => {
      const desktopH = window.innerHeight - 36
      const taken = new Set(current.map((i) => posKey(i.position)))
      const withNew = [
        ...current,
        {
          id,
          label: name,
          glyph,
          pinned: false,
          position: findFreeCell(taken, desktopH),
          builtin: 'folder' as const,
          description: '',
          checklist: []
        }
      ]
      return resolveCollisions(withNew, desktopH)
    })
    setFolders((prev) => ({ ...prev, [id]: defaultColumns }))
    setCreatingFolder(false)
  }

  function createNote(name: string, glyph: string): void {
    setIcons((current) => {
      const desktopH = window.innerHeight - 36
      const taken = new Set(current.map((i) => posKey(i.position)))
      const withNew = [
        ...current,
        {
          id: crypto.randomUUID(),
          label: name,
          glyph,
          pinned: false,
          position: findFreeCell(taken, desktopH),
          builtin: 'note' as const,
          description: '',
          checklist: []
        }
      ]
      return resolveCollisions(withNew, desktopH)
    })
    setCreatingNote(false)
  }

  function createExpense(name: string, value: number): void {
    setIcons((current) => {
      const desktopH = window.innerHeight - 36
      const taken = new Set(current.map((i) => posKey(i.position)))
      const withNew = [
        ...current,
        {
          id: crypto.randomUUID(),
          label: name,
          glyph: BUILTIN_ICON_ASSETS['expense'],
          pinned: false,
          position: findFreeCell(taken, desktopH),
          builtin: 'expense' as const,
          description: '',
          checklist: [],
          value
        }
      ]
      return resolveCollisions(withNew, desktopH)
    })
    setCreatingExpense(false)
  }

  function updateExpenseValue(id: string, value: number): void {
    setIcons((current) =>
      current.map((icon) => (icon.id === id ? { ...icon, value } : icon))
    )
  }

  function updateIcon(id: string, name: string, glyph: string): void {
    setIcons((current) =>
      current.map((icon) => (icon.id === id ? { ...icon, label: name, glyph } : icon))
    )
    setEditingIconId(null)
  }

  function resetIconPosition(id: string): void {
    setIcons((current) => {
      const desktopH = window.innerHeight - 36
      const taken = new Set(current.filter((i) => i.id !== id).map((i) => posKey(i.position)))
      const position = findFreeCell(taken, desktopH)
      return current.map((i) => (i.id === id ? { ...i, position } : i))
    })
  }

  function moveIcon(id: string, position: { x: number; y: number }): void {
    setIcons((current) => {
      const withMoved = current.map((icon) => (icon.id === id ? { ...icon, position } : icon))
      const desktopHeight = window.innerHeight - 36
      // O ícone arrastado fica na frente pra ter prioridade na célula escolhida.
      const movedFirst = [
        ...withMoved.filter((i) => i.id === id),
        ...withMoved.filter((i) => i.id !== id)
      ]
      const resolved = resolveCollisions(movedFirst, desktopHeight)
      // Restaura a ordem original do array.
      const byId = new Map(resolved.map((i) => [i.id, i]))
      return current.map((orig) => byId.get(orig.id) ?? orig)
    })
  }

  function toggleFullscreen(): void {
    window.api.toggleFullscreen().then(setIsFullscreen)
  }

  function attachToTimer(id: string): void {
    setAttachedTaskId(id)
  }

  function detachTimer(): void {
    setAttachedTaskId(null)
  }

  function updateDescription(id: string, description: string): void {
    setIcons((current) =>
      current.map((icon) => (icon.id === id ? { ...icon, description } : icon))
    )
  }

  function addChecklistItem(id: string, text: string): void {
    setIcons((current) =>
      current.map((icon) =>
        icon.id === id
          ? { ...icon, checklist: [...icon.checklist, { id: crypto.randomUUID(), text, done: false }] }
          : icon
      )
    )
  }

  function toggleChecklistItem(id: string, itemId: string): void {
    setIcons((current) =>
      current.map((icon) =>
        icon.id === id
          ? {
              ...icon,
              checklist: icon.checklist.map((item) =>
                item.id === itemId ? { ...item, done: !item.done } : item
              )
            }
          : icon
      )
    )
  }

  function removeChecklistItem(id: string, itemId: string): void {
    setIcons((current) =>
      current.map((icon) =>
        icon.id === id
          ? { ...icon, checklist: icon.checklist.filter((item) => item.id !== itemId) }
          : icon
      )
    )
  }

  const editingIcon = icons.find((icon) => icon.id === editingIconId) ?? null
  const attachedIcon = icons.find((icon) => icon.id === attachedTaskId) ?? null
  const timerOpen = openWindows.some((w) => w.id === 'timer')
  const upcomingVisible = openWindows.some((w) => {
    const ic = icons.find((i) => i.id === w.id)
    return ic?.builtin === 'upcoming' && !w.minimized
  })
  const spendingVisible = openWindows.some((w) => {
    const ic = icons.find((i) => i.id === w.id)
    return ic?.builtin === 'spending' && !w.minimized
  })
  const expenseIcons = icons.filter((i) => i.builtin === 'expense')

  // ── Widget layout ─────────────────────────────────────────────
  // Compute whether Timer+Upcoming fit on the right side alongside Notes+Spending
  const LAYOUT_TASKBAR = 36
  const LAYOUT_SIDE    = 16
  const LAYOUT_GAP     = 8
  const NOTE_H         = 220  // fixed in CSS
  const SPENDING_H_EST = 112  // approximate
  const UPCOMING_H_EST = 180  // approximate

  // Space consumed from the bottom of the right column
  const rightColFromBottom =
    (notesOpen       ? NOTE_H         + LAYOUT_GAP : 0) +
    (spendingVisible ? SPENDING_H_EST + LAYOUT_GAP : 0)

  // Space consumed from the top (Timer + Upcoming)
  const timerTopUsed    = timerVisible    ? timerMeasuredH  + LAYOUT_GAP : 0
  const upcomingTopUsed = upcomingVisible ? UPCOMING_H_EST  + LAYOUT_GAP : 0

  // Total required height if all stacked in one column
  const totalRequired = LAYOUT_SIDE + timerTopUsed + upcomingTopUsed + rightColFromBottom
  const availH        = windowH - LAYOUT_TASKBAR - LAYOUT_SIDE
  const topWidgetsFitRight = totalRequired <= availH

  const topWidgetSide: 'right' | 'left' = topWidgetsFitRight ? 'right' : 'left'
  const upcomingTop = LAYOUT_SIDE + timerTopUsed

  // SpendingWidget bottom: sits above NoteWidget when notes are open
  const spendingBottom =
    LAYOUT_TASKBAR + LAYOUT_SIDE + (notesOpen ? NOTE_H + LAYOUT_GAP : 0)

  const backgroundStyle: CSSProperties =
    desktopBackground.kind === 'color'
      ? { background: desktopBackground.color }
      : {
          backgroundImage: `url(${desktopBackground.dataUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }

  return (
    <div
      className="os-shell"
      style={backgroundStyle}
      onContextMenu={(e) => {
        e.preventDefault()
        setShellCtx({ x: e.clientX, y: e.clientY })
      }}
    >
      <Desktop
        icons={icons}
        onOpen={openWindow}
        onTogglePinned={togglePinned}
        onDeleteIcon={deleteIcon}
        onOpenProperties={setEditingIconId}
        onMoveIcon={moveIcon}
        timerOpen={timerOpen}
        onAttachToTimer={attachToTimer}
      />

      {openWindows.map((win, index) => {
        const icon = icons.find((candidate) => candidate.id === win.id)
        if (!icon) return null

        if (icon.builtin === 'timer') {
          return (
            <TimerWidget
              key={win.id}
              ref={timerWidgetRef}
              minimized={win.minimized}
              side={topWidgetSide}
              attachedIcon={attachedIcon}
              onToggleItem={(itemId) => {
                if (attachedTaskId) toggleChecklistItem(attachedTaskId, itemId)
              }}
              onDetach={detachTimer}
              onMinimize={() => toggleMinimize(win.id)}
              onClose={() => closeWindow(win.id)}
            />
          )
        }

        if (icon.builtin === 'note') {
          return (
            <WindowFrame
              key={win.id}
              title={icon.label}
              titleIconSrc={BUILTIN_ICON_ASSETS['note']}
              onClose={() => closeWindow(win.id)}
              onMinimize={() => toggleMinimize(win.id)}
              onMaximize={() => toggleMaximize(win.id)}
              onFocus={() => focusWindow(win.id)}
              minimized={win.minimized}
              maximized={win.maximized}
              zIndex={win.zIndex}
              width={360}
              initialHeight={320}
              noPadding
              initialPosition={{ x: 160 + index * 24, y: 100 + index * 24 }}
            >
              <NoteWindowContent
                content={icon.description}
                onChange={(value) => updateDescription(win.id, value)}
              />
            </WindowFrame>
          )
        }

        if (icon.builtin === 'upcoming') {
          return (
            <UpcomingWidget
              key={win.id}
              minimized={win.minimized}
              tasks={icons.filter((i) => !i.builtin)}
              dayTasks={dayTasks}
              weeklyTasks={weeklyTasks}
              top={upcomingTop}
              side={topWidgetSide}
              onMinimize={() => toggleMinimize(win.id)}
              onClose={() => closeWindow(win.id)}
            />
          )
        }

        if (icon.builtin === 'spending') {
          return (
            <SpendingWidget
              key={win.id}
              minimized={win.minimized}
              expenses={expenseIcons}
              dayExpenses={dayExpenses}
              weeklyExpenses={weeklyExpenses}
              monthlyExpenses={monthlyExpenses}
              bottomOffset={spendingBottom}
              onMinimize={() => toggleMinimize(win.id)}
              onClose={() => closeWindow(win.id)}
            />
          )
        }

        if (icon.builtin === 'expense') {
          return (
            <WindowFrame
              key={win.id}
              title={icon.label}
              titleIconSrc={BUILTIN_ICON_ASSETS['expense']}
              onClose={() => closeWindow(win.id)}
              onMinimize={() => toggleMinimize(win.id)}
              onMaximize={() => toggleMaximize(win.id)}
              onFocus={() => focusWindow(win.id)}
              minimized={win.minimized}
              maximized={win.maximized}
              zIndex={win.zIndex}
              width={280}
              initialHeight={130}
              initialPosition={{ x: 200 + index * 24, y: 150 + index * 24 }}
            >
              <ExpenseWindowContent
                value={icon.value ?? 0}
                onChange={(value) => updateExpenseValue(win.id, value)}
              />
            </WindowFrame>
          )
        }

        if (icon.builtin === 'folder') {
          return (
            <WindowFrame
              key={win.id}
              title={icon.label}
              titleIconSrc={resolveIconAsset(icon.builtin, icon.id) ?? undefined}
              onClose={() => closeWindow(win.id)}
              onMinimize={() => toggleMinimize(win.id)}
              onMaximize={() => toggleMaximize(win.id)}
              onFocus={() => focusWindow(win.id)}
              minimized={win.minimized}
              maximized={win.maximized}
              zIndex={win.zIndex}
              width={860}
              initialHeight={480}
              initialPosition={{ x: 80 + index * 24, y: 60 + index * 24 }}
            >
              <FolderWindow
                columns={folders[win.id] ?? []}
                tasks={icons.filter((i) => !i.builtin)}
                onUpdateColumns={(cols) => setFolders((prev) => ({ ...prev, [win.id]: cols }))}
                onOpenTask={openWindow}
              />
            </WindowFrame>
          )
        }

        if (icon.builtin === 'calendar') {
          return (
            <WindowFrame
              key={win.id}
              title="Calendário"
              titleIconSrc={BUILTIN_ICON_ASSETS['calendar']}
              onClose={() => closeWindow(win.id)}
              onMinimize={() => toggleMinimize(win.id)}
              onMaximize={() => toggleMaximize(win.id)}
              onFocus={() => focusWindow(win.id)}
              minimized={win.minimized}
              maximized={win.maximized}
              zIndex={win.zIndex}
              width={580}
              initialHeight={500}
              initialPosition={{ x: 200 + index * 24, y: 80 + index * 24 }}
            >
              <CalendarWindow
                tasks={icons.filter((i) => !i.builtin)}
                dayTasks={dayTasks}
                weeklyTasks={weeklyTasks}
                onUpdateDayTasks={setDayTasks}
                onUpdateWeeklyTasks={setWeeklyTasks}
                expenses={expenseIcons}
                dayExpenses={dayExpenses}
                weeklyExpenses={weeklyExpenses}
                onUpdateDayExpenses={setDayExpenses}
                onUpdateWeeklyExpenses={setWeeklyExpenses}
                monthlyExpenses={monthlyExpenses}
                onUpdateMonthlyExpenses={setMonthlyExpenses}
                onOpenTask={openWindow}
              />
            </WindowFrame>
          )
        }

        if (icon.builtin === 'computer') {
          return (
            <WindowFrame
              key={win.id}
              title="Meu Computador"
              titleIconSrc={BUILTIN_ICON_ASSETS['computer']}
              onClose={() => closeWindow(win.id)}
              onMinimize={() => toggleMinimize(win.id)}
              onMaximize={() => toggleMaximize(win.id)}
              onFocus={() => focusWindow(win.id)}
              minimized={win.minimized}
              maximized={win.maximized}
              zIndex={win.zIndex}
              width={480}
              initialHeight={400}
              initialPosition={{ x: 180 + index * 24, y: 80 + index * 24 }}
              noPadding
            >
              <ComputerWindow
                icons={icons}
                timerOpen={timerOpen}
                onOpen={openWindow}
                onTogglePinned={togglePinned}
                onDeleteIcon={deleteIcon}
                onOpenProperties={setEditingIconId}
                onAttachToTimer={attachToTimer}
                onResetPosition={resetIconPosition}
              />
            </WindowFrame>
          )
        }

        return (
          <WindowFrame
            key={win.id}
            title={icon.label}
            onClose={() => closeWindow(win.id)}
            onMinimize={() => toggleMinimize(win.id)}
            onMaximize={() => toggleMaximize(win.id)}
            onFocus={() => focusWindow(win.id)}
            minimized={win.minimized}
            maximized={win.maximized}
            zIndex={win.zIndex}
            width={380}
            initialPosition={{ x: 160 + index * 24, y: 100 + index * 24 }}
          >
            <TaskWindowContent
              description={icon.description}
              checklist={icon.checklist}
              onDescriptionChange={(description) => updateDescription(win.id, description)}
              onAddItem={(text) => addChecklistItem(win.id, text)}
              onToggleItem={(itemId) => toggleChecklistItem(win.id, itemId)}
              onRemoveItem={(itemId) => removeChecklistItem(win.id, itemId)}
            />
          </WindowFrame>
        )
      })}

      {isCreatingTask && (
        <NewTaskWindow onCreate={createTask} onClose={() => setCreatingTask(false)} />
      )}

      {isCreatingFolder && (
        <NewFolderWindow onCreate={createFolder} onClose={() => setCreatingFolder(false)} />
      )}

      {isCreatingNote && (
        <NewNoteWindow onCreate={createNote} onClose={() => setCreatingNote(false)} />
      )}

      {isCreatingExpense && (
        <NewExpenseWindow onCreate={createExpense} onClose={() => setCreatingExpense(false)} />
      )}

      {editingIcon && (
        <PropertiesWindow
          icon={editingIcon}
          onSave={updateIcon}
          onClose={() => setEditingIconId(null)}
        />
      )}

      {isPersonalizing && (
        <PersonalizeWindow
          current={desktopBackground}
          onBackground={setDesktopBackground}
          onClose={() => setPersonalizing(false)}
        />
      )}

      {notesOpen && <NoteWidget onClose={() => setNotesOpen(false)} />}

      {guideOpen && <GuideWindow onClose={() => setGuideOpen(false)} />}

      {isScreenSaver && <ScreenSaver onDismiss={() => setScreenSaver(false)} />}

      {isStartMenuOpen && (
        <StartMenu
          pinnedIcons={icons.filter((icon) => icon.pinned)}
          onOpen={openWindow}
          onClose={() => setStartMenuOpen(false)}
          onOpenGuide={() => setGuideOpen(true)}
          onOpenComputer={() => openWindow('computer')}
          onScreenSaver={() => setScreenSaver(true)}
          excludeRef={startButtonRef}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
        />
      )}

      {shellCtx && (
        <ContextMenu
          x={shellCtx.x}
          y={shellCtx.y}
          onClose={() => setShellCtx(null)}
          items={[
            { label: 'Criar nova tarefa',  onClick: () => setCreatingTask(true) },
            { label: 'Criar nova nota',    onClick: () => setCreatingNote(true) },
            { label: 'Criar nova pasta',   onClick: () => setCreatingFolder(true) },
            { label: 'Criar nova despesa', onClick: () => setCreatingExpense(true) },
            { label: 'Personalizar',       onClick: () => setPersonalizing(true) }
          ]}
        />
      )}

      <Taskbar
        isStartMenuOpen={isStartMenuOpen}
        onToggleStartMenu={() => setStartMenuOpen((current) => !current)}
        startButtonRef={startButtonRef}
        openWindows={openWindows}
        icons={icons}
        onTaskbarItemClick={toggleMinimize}
        onCloseWindow={closeWindow}
      />
    </div>
  )
}

export default App
