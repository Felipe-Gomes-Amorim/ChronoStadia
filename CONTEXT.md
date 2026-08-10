# ChronoStadia — Referência Técnica de Desenvolvimento

App desktop estilo Y2K (Windows 98/2000) para gestão de tarefas com checklist, calendário, cronômetro e kanban.

## Comandos

```bash
npm install        # instala dependências
npm run dev        # abre o app com hot-reload
npm run typecheck  # valida TypeScript sem build
npm run build:win  # gera .exe em release/
```

> **Atenção:** `ELECTRON_RUN_AS_NODE` não deve estar definido no ambiente ao rodar `npm run dev`, caso contrário o app trava com `app` undefined.

---

## Glossário de Termos Canônicos

Usar sempre estes nomes nas conversas e no código para evitar ambiguidade.

### Interface Principal

| Termo | Descrição |
|---|---|
| **Área de trabalho** | Superfície principal do OS, acima da barra de tarefas. `Desktop.tsx`. Ocupa `top: 0; bottom: 36px`. |
| **Grade da área de trabalho** | Grid invisível de 96×96 px ao qual os ícones encaixam (snap). Constante `ICON_GRID = 96`. Os ícones têm 8 px de offset visual no topo (`DESKTOP_TOP_OFFSET`). |
| **Barra de tarefas** | Faixa de 36 px na base da tela. Botão Iniciar + botões de programas abertos + relógio. `Taskbar.tsx`. |
| **Menu Iniciar** | Painel ao clicar em "Iniciar". Lado esquerdo (branco): programas fixados. Lado direito (azul): sistema + tela cheia. `StartMenu.tsx`. |
| **Relógio** | Display de hora no canto direito da barra de tarefas. |

### Ícones e Programas

| Termo | Descrição |
|---|---|
| **Ícone** | Elemento visual na área de trabalho. Tipo `DesktopIconData`. Persiste em `chronostadia.icons.v1`. |
| **Programa** | Qualquer ícone que abre algo ao ser clicado duas vezes. Inclui tarefas, pastas, notas e programas fixos. |
| **Tarefa** | Programa criado pelo usuário. Sem campo `builtin`. Tem `description` e `checklist`. Abre `TaskWindowContent` num `WindowFrame`. |
| **Nota** | Programa criado pelo usuário. `builtin: 'note'`. Abre `NoteWindowContent` num `WindowFrame` sem padding. Conteúdo salvo em `icon.description`. Pode ser excluída. |
| **Programa fixo** | Programa pré-instalado. Campo `builtin` definido. Não pode ser excluído (exceto `'note'` e `'folder'`). |
| **Pasta** | Programa com `builtin: 'folder'`. Abre um board Kanban. Pode ser excluída sem excluir as tarefas. |
| **Glyph** | O emoji ou caminho de asset PNG do ícone. Campo `glyph` em `DesktopIconData`. Se termina em `.png`, é um asset pixel art. |
| **Fixar** | Adicionar um programa ao lado esquerdo do Menu Iniciar. Campo `pinned: true`. |

### Ícones Pixel Art

| Termo | Descrição |
|---|---|
| **`resolveIconAsset(builtin, id, glyph?)`** | Função em `builtins.ts`. Prioridade: builtin → id → glyph `.endsWith('.png')`. Retorna URL do asset ou `null`. |
| **`BUILTIN_ICON_ASSETS`** | Map `builtin → asset URL`. Inclui: `notes`, `timer`, `calendar`, `upcoming`, `folder`, `note`. |
| **`ID_ICON_ASSETS`** | Map `id → asset URL`. Inclui: `tasks` (chest). |
| **`ICON_OPTIONS`** | Array `{ src, label }` com 16 opções de pixel art para o IconPicker. Exportado de `IconPicker.tsx`. |
| **`.pixel-icon`** | Classe CSS. `image-rendering: pixelated`, `-webkit-user-drag: none`. |

### Janelas

| Termo | Descrição |
|---|---|
| **Janela** | Container com barra de título, controles e corpo. `WindowFrame.tsx`. Arrastável e redimensionável por padrão. |
| **Diálogo** | Janela não-redimensionável para inputs do usuário (criar tarefa, propriedades, personalizar). `resizable={false}`, `zIndex = DIALOG_Z_INDEX` (1000). |
| **Widget** | Programa fixo posicionado absolutamente na tela, **sem** usar `WindowFrame`. Notas Rápidas (canto inferior direito), Cronômetro e Dias Próximos (canto superior direito). `zIndex = 500`. |
| **Controles de janela** | Botões minimizar / maximizar / fechar na barra de título. Prop `showWindowControls` em `WindowFrame`. |
| **Alça de redimensionamento** | Handles `.resize-e`, `.resize-s`, `.resize-se` nas bordas. Ativos quando `resizable && !maximized`. |
| **`DIALOG_Z_INDEX`** | Constante `1000`. Exportada de `WindowFrame.tsx`. Acima de janelas (10+), abaixo de menu iniciar (2000) e menu de contexto (2100). |
| **`noPadding`** | Prop booleana em `WindowFrame`. Remove o padding do `.window-body`. Usado em `NoteWindowContent`. |
| **`titleIconSrc`** | Prop string em `WindowFrame`. Exibe img pixel art 14×14 na barra de título antes do nome. |

### Sistema de Janelas (`openWindows`)

| Termo | Descrição |
|---|---|
| **`openWindows`** | Array de `OpenWindowState` em `App.tsx`. Estado de todos os programas abertos. |
| **Minimizar** | `minimized: true`. Janela some da área de trabalho mas fica na barra de tarefas. |
| **Maximizar** | `maximized: true`. Janela ocupa `inset: 0; bottom: 36px`. |
| **Focar** | Incrementar `zIndex` da janela clicada para trazê-la ao topo. `focusWindow()`. |
| **Fechar** | Remover da `openWindows`. Não deleta o ícone. |

### Conteúdo de Tarefas

| Termo | Descrição |
|---|---|
| **Descrição** | Textarea livre dentro da janela de tarefa. Campo `description`. |
| **Checklist** | Lista de itens. Array `checklist: ChecklistItem[]`. Cada item: `id`, `text`, `done`. |
| **Item de checklist** | Um único item. Tipo `ChecklistItem`. |
| **Barra de progresso** | Visual de progresso da checklist. `.progress-indicator.segmented` do 98.css. |
| **Checklist rápida** | Versão compacta (só toggle) usada no Cronômetro. `ChecklistQuick.tsx`. |

### Pastas e Kanban

| Termo | Descrição |
|---|---|
| **Board Kanban** | Janela de uma pasta: colunas side-by-side com scroll horizontal. `FolderWindow.tsx`. |
| **Coluna** | Faixa vertical do board. Tipo `KanbanColumn`: `id`, `name`, `taskIds[]`. |
| **Card** | Representação de uma tarefa dentro de uma coluna. Draggável via HTML5 DnD. |
| **Mover card** | Arrastar card de uma coluna para outra. Por pasta, cada tarefa pode estar em apenas uma coluna por vez. |

### Calendário

| Termo | Descrição |
|---|---|
| **Visão de mês** | Layout padrão do calendário. Grid com dias do mês. |
| **Visão de dia** | Layout alternativo ativado por duplo-clique num dia. Lista todas as tarefas do dia. |
| **Tarefa do dia** | Associação entre tarefa e data específica. Persiste em `chronostadia.calendar.v1` como `Record<"YYYY-MM-DD", string[]>`. |
| **Tarefa semanal** | Associação entre tarefa e dia da semana (recorrente). Persiste em `chronostadia.weekly.v1` como `Record<"0"–"6", string[]>`. Exibida apenas nos dias em que a tarefa não está associada especificamente. |
| **Badge de tarefa** | Etiqueta azul no dia com glyph + nome. Máximo 2 visíveis; excedente exibe `+ N`. |
| **Badge semanal** | Badge com classe `.calendar-task-badge-weekly` e prefixo ↺. |
| **`makeDateKey(date)`** | Exportada de `CalendarWindow.tsx`. Formata `Date` como `"YYYY-MM-DD"`. |

### Programas Fixos (builtins)

| `builtin` | Label padrão | Descrição |
|---|---|---|
| `'notes'` | Notas Rápidas | Widget canto inferior direito. Estado `notesOpen` separado (não entra em `openWindows`). Conteúdo **não** salvo. |
| `'timer'` | Cronômetro | Widget canto superior direito. Entra em `openWindows`. `zIndex = 500`. |
| `'calendar'` | Calendário | Janela normal. 580×500 px padrão. |
| `'upcoming'` | Dias Próximos | Widget canto superior direito, abaixo do timer. Entra em `openWindows`. Leitura somente; recebe `top` dinâmico (16 ou 310 px). |
| `'folder'` | — | Janela Kanban. Pode ser excluída. |
| `'note'` | — | Janela de nota salva. Conteúdo salvo em `icon.description`. Pode ser excluída. |

### Persistência (localStorage)

| Chave | Tipo | Conteúdo |
|---|---|---|
| `chronostadia.icons.v1` | `DesktopIconData[]` | Todos os ícones e posições |
| `chronostadia.background.v1` | `BackgroundState` | Cor ou dataUrl da imagem de fundo |
| `chronostadia.calendar.v1` | `Record<string, string[]>` | Datas (`YYYY-MM-DD`) → arrays de IDs de tarefas |
| `chronostadia.weekly.v1` | `Record<string, string[]>` | Dia da semana (`"0"`–`"6"`, domingo=0) → arrays de IDs de tarefas |
| `chronostadia.folders.v1` | `Record<string, KanbanColumn[]>` | ID de pasta → colunas |

> **Migração:** ao carregar `icons.v1`, o App verifica se ícones builtin antigos estão sem o campo `builtin` e restaura a partir de `INITIAL_ICONS` por correspondência de `id`.

### Menus de Contexto

| Contexto | Itens disponíveis |
|---|---|
| **Ícone (tarefa, sem builtin)** | Abrir · Fixar/Desafixar · Propriedades · Anexar ao Cronômetro\* · Excluir tarefa |
| **Ícone (`builtin: 'note'`)** | Abrir · Fixar/Desafixar · Propriedades · Excluir nota |
| **Ícone (`builtin: 'folder'`)** | Abrir · Fixar/Desafixar · Propriedades · Excluir pasta |
| **Ícone (outros builtins)** | Abrir · Fixar/Desafixar · Propriedades |
| **Área de trabalho vazia** | Criar nova tarefa · Criar nova nota · Criar nova pasta · Personalizar |
| **Barra de tarefas (item)** | Fechar |
| **Dia do calendário** | Anexar tarefa... |
| **Cabeçalho de dia da semana** | Marcar tarefa semanal... (abre seletor; tarefa marcada aparece em todos os dias daquele weekday) |

\* Visível apenas quando o Cronômetro está aberto.

### IPC Electron

| Canal | Direção | Retorno | Descrição |
| --- | --- | --- | --- |
| `toggle-fullscreen` | renderer → main | `boolean` (novo estado) | Alterna tela cheia/janela |
| `is-fullscreen` | renderer → main | `boolean` | Consulta estado atual |

Expostos via `contextBridge` em `preload/index.ts` como `window.api.toggleFullscreen()` e `window.api.isFullscreen()`. Tipados em `preload/index.d.ts`.

---

## Arquivos Chave

| Arquivo | Responsabilidade |
|---|---|
| `src/main/index.ts` | BrowserWindow, IPC handlers (`toggle-fullscreen`, `is-fullscreen`) |
| `src/preload/index.ts` | Expõe `window.api` via contextBridge |
| `src/preload/index.d.ts` | Tipagem de `window.api` |
| `src/renderer/src/App.tsx` | Estado global, roteamento de janelas, todos os handlers |
| `src/renderer/src/components/Desktop.tsx` | Ícones na área de trabalho e menus de contexto |
| `src/renderer/src/components/WindowFrame.tsx` | Frame draggável/redimensionável; exporta `DIALOG_Z_INDEX` |
| `src/renderer/src/components/Taskbar.tsx` | Barra de tarefas e botões de programas abertos |
| `src/renderer/src/components/StartMenu.tsx` | Menu Iniciar dois lados (fixados + sistema + tela cheia) |
| `src/renderer/src/components/TaskWindowContent.tsx` | Conteúdo da janela de tarefa (descrição + checklist) |
| `src/renderer/src/components/NoteWindowContent.tsx` | Textarea de nota salva (zero-padded, height 100%) |
| `src/renderer/src/components/FolderWindow.tsx` | Board Kanban de uma pasta |
| `src/renderer/src/components/CalendarWindow.tsx` | Calendário mensal, visão de dia, tarefas semanais |
| `src/renderer/src/components/TimerWidget.tsx` | Widget Cronômetro (posição fixa, usa `.window` do 98.css) |
| `src/renderer/src/components/UpcomingWidget.tsx` | Widget Dias Próximos (leitura somente, 3 dias) |
| `src/renderer/src/components/NoteWidget.tsx` | Widget Notas Rápidas (não salva, canto inferior direito) |
| `src/renderer/src/components/GuideWindow.tsx` | Janela de ajuda do usuário final |
| `src/renderer/src/components/NewTaskWindow.tsx` | Diálogo de criação de tarefa |
| `src/renderer/src/components/NewNoteWindow.tsx` | Diálogo de criação de nota (só nome, glyph fixo) |
| `src/renderer/src/components/NewFolderWindow.tsx` | Diálogo de criação de pasta |
| `src/renderer/src/components/IconPicker.tsx` | Picker de ícones pixel art; exporta `ICON_OPTIONS` |
| `src/renderer/src/assets/icons/builtins.ts` | `resolveIconAsset`, `BUILTIN_ICON_ASSETS`, `ID_ICON_ASSETS` |
| `src/renderer/src/storage.ts` | load/save para todos os dados persistidos |
| `src/renderer/src/types.ts` | Tipos: `DesktopIconData`, `ChecklistItem`, `KanbanColumn`, `BackgroundState`, `OpenWindowState` |
| `src/renderer/src/hooks/useDraggable.ts` | Hook de drag para ícones (grid snap, onSettle, resync externo) |
| `src/renderer/src/index.css` | Todos os estilos customizados (98.css é a base global) |
