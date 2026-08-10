// Ícones pixel art para programas fixos e ícones especiais.
// Criados por Justin Arnold — https://zeromatrix.itch.io/rpgiab-icons
// Licença: CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/

import calendar       from './32x32/map.png'
import chest          from './32x32/chest.png'
import chestCheckmark from './32x32/chest_checkmark.png'
import coins          from './32x32/coins.png'
import computer       from './32x32/computer.png'
import folder         from './32x32/folder.png'
import hourglass      from './32x32/hourglass.png'
import message        from './32x32/message.png'
import pencil         from './32x32/pencil.png'
import clockPlay      from './32x32/clock_play.png'

// Mapeamento por campo `builtin` do ícone
export const BUILTIN_ICON_ASSETS: Record<string, string> = {
  notes:    message,        // Notas Rápidas
  timer:    hourglass,      // Cronômetro
  calendar: calendar,       // Calendário
  upcoming: clockPlay,      // Dias Próximos
  folder:   folder,         // Pastas
  note:     pencil,         // Notas (programa)
  expense:  coins,          // Despesa (programa)
  spending: chestCheckmark, // Controle de Gastos (widget)
  computer: computer,       // Meu Computador
}

// Mapeamento por id para ícones iniciais sem campo `builtin`
export const ID_ICON_ASSETS: Record<string, string> = {
  tasks: chest, // Minhas Tarefas
}

// Retorna o caminho do asset pixel art para um ícone, ou null se deve usar o glyph emoji.
// Prioridade: builtin → id fixo → glyph armazenado como path de imagem (picker de pixel art)
export function resolveIconAsset(
  builtin: string | undefined,
  id: string,
  glyph?: string
): string | null {
  if (builtin) return BUILTIN_ICON_ASSETS[builtin] ?? null
  const byId = ID_ICON_ASSETS[id]
  if (byId) return byId
  if (glyph && (glyph.endsWith('.png') || glyph.startsWith('data:image/'))) return glyph
  return null
}
