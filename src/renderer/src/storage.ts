import type { BackgroundState, DesktopIconData, KanbanColumn } from './types'

const STORAGE_KEY = 'chronostadia.icons.v1'
const BACKGROUND_KEY = 'chronostadia.background.v1'
const CALENDAR_KEY = 'chronostadia.calendar.v1'

export function loadIcons(): DesktopIconData[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return null
    // Ícones salvos antes do recurso de descrição/checklist não têm esses campos.
    return parsed.map((icon) => ({ description: '', checklist: [], ...icon })) as DesktopIconData[]
  } catch {
    return null
  }
}

export function saveIcons(icons: DesktopIconData[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(icons))
  } catch {
    // localStorage indisponível ou quota excedida — não quebra o app
  }
}

export function loadBackground(): BackgroundState | null {
  try {
    const raw = localStorage.getItem(BACKGROUND_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed?.kind !== 'color' && parsed?.kind !== 'image') return null
    return parsed as BackgroundState
  } catch {
    return null
  }
}

export function saveBackground(bg: BackgroundState): void {
  try {
    localStorage.setItem(BACKGROUND_KEY, JSON.stringify(bg))
  } catch {
    // imagem muito grande ou storage indisponível — ignora silenciosamente
  }
}

export function loadCalendar(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(CALENDAR_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (typeof parsed !== 'object' || Array.isArray(parsed) || parsed === null) return {}
    return parsed as Record<string, string[]>
  } catch {
    return {}
  }
}

export function saveCalendar(data: Record<string, string[]>): void {
  try {
    localStorage.setItem(CALENDAR_KEY, JSON.stringify(data))
  } catch {}
}

const FOLDERS_KEY = 'chronostadia.folders.v1'

export function loadFolders(): Record<string, KanbanColumn[]> {
  try {
    const raw = localStorage.getItem(FOLDERS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (typeof parsed !== 'object' || Array.isArray(parsed) || parsed === null) return {}
    return parsed as Record<string, KanbanColumn[]>
  } catch {
    return {}
  }
}

export function saveFolders(data: Record<string, KanbanColumn[]>): void {
  try {
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(data))
  } catch {}
}

const WEEKLY_KEY = 'chronostadia.weekly.v1'

// Chave "0"–"6" (domingo–sábado) → array de taskIds
export function loadWeekly(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(WEEKLY_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (typeof parsed !== 'object' || Array.isArray(parsed) || parsed === null) return {}
    return parsed as Record<string, string[]>
  } catch {
    return {}
  }
}

export function saveWeekly(data: Record<string, string[]>): void {
  try {
    localStorage.setItem(WEEKLY_KEY, JSON.stringify(data))
  } catch {}
}

const CALENDAR_EXPENSES_KEY = 'chronostadia.calendar_expenses.v1'

export function loadDayExpenses(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(CALENDAR_EXPENSES_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (typeof parsed !== 'object' || Array.isArray(parsed) || parsed === null) return {}
    return parsed as Record<string, string[]>
  } catch {
    return {}
  }
}

export function saveDayExpenses(data: Record<string, string[]>): void {
  try {
    localStorage.setItem(CALENDAR_EXPENSES_KEY, JSON.stringify(data))
  } catch {}
}

const WEEKLY_EXPENSES_KEY = 'chronostadia.weekly_expenses.v1'

export function loadWeeklyExpenses(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(WEEKLY_EXPENSES_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (typeof parsed !== 'object' || Array.isArray(parsed) || parsed === null) return {}
    return parsed as Record<string, string[]>
  } catch {
    return {}
  }
}

export function saveWeeklyExpenses(data: Record<string, string[]>): void {
  try {
    localStorage.setItem(WEEKLY_EXPENSES_KEY, JSON.stringify(data))
  } catch {}
}

const MONTHLY_EXPENSES_KEY = 'chronostadia.monthly_expenses.v1'

// Chave "1"–"31" (dia do mês) → array de expenseIds
export function loadMonthlyExpenses(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(MONTHLY_EXPENSES_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (typeof parsed !== 'object' || Array.isArray(parsed) || parsed === null) return {}
    return parsed as Record<string, string[]>
  } catch {
    return {}
  }
}

export function saveMonthlyExpenses(data: Record<string, string[]>): void {
  try {
    localStorage.setItem(MONTHLY_EXPENSES_KEY, JSON.stringify(data))
  } catch {}
}
