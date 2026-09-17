<img width="3192" height="1239" alt="CHronostadia banner" src="https://github.com/user-attachments/assets/129bd7ef-8c21-4ae9-88c9-3b7ffc3fbc01" />


# ChronoStadia

> Um desktop de produtividade independente com visual e comportamento de Windows 98.

![Electron](https://img.shields.io/badge/Electron-42-47848F?logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Platform](https://img.shields.io/badge/Platform-Windows-0078D4?logo=windows&logoColor=white)

---

## O Problema

Ferramentas de produtividade são fragmentadas. Gerenciador de tarefas aqui, calendário ali, notas em outro lugar, planilha de gastos em outra aba. Cada app tem sua própria conta, seu próprio sync, seu próprio sistema de notificações. O custo cognitivo de ficar alternando entre eles acumula — e nenhum deles parece que foi feito para funcionar junto.

## A Solução

ChronoStadia é um único app desktop que se comporta como um mini sistema operacional. Você tem uma área de trabalho real: arrasta ícones de programas, abre várias janelas redimensionáveis, mantém widgets sempre visíveis fixados nos cantos. Tudo — tarefas, notas, pastas, calendário, cronômetro, despesas — fica em um lugar só, offline, sem nenhuma conta necessária.

A estética do Win98 é uma escolha deliberada, não só nostalgia. A linguagem visual é imediatamente compreendida por qualquer pessoa que tocou num computador nos últimos 30 anos: ícones que você clica duas vezes, janelas com barra de título que você arrasta, menu Iniciar, barra de tarefas. Isso elimina qualquer ambiguidade sobre como a interface funciona, liberando atenção para o trabalho em si.

---

## O Que Faz

### Área de Trabalho

Ícones arrastáveis em uma grade de 96×96 px. Botão direito em qualquer lugar abre o menu de criação. Cada tipo de ícone abre um tipo diferente de janela.

### Tarefas

Crie ícones de tarefa com uma textarea de descrição e uma checklist. A barra de progresso preenche conforme os itens são marcados. Ícones usam pixel art de um seletor embutido ou emoji.

### Notas

Janelas de nota redimensionáveis com uma textarea simples. Tamanho de fonte ajustável por janela (13 → 20 px). Conteúdo salvo automaticamente.

### Pastas / Kanban

Cada ícone de pasta abre um board Kanban com colunas A Fazer / Em Andamento / Concluído. Arraste cards de tarefas entre colunas. As colunas são por pasta; a tarefa em si permanece na área de trabalho.

### Calendário

Grade mensal. Clique num dia para anexar tarefas pontuais, ou botão direito no cabeçalho de um dia da semana para definir tarefas recorrentes semanais. Despesas funcionam da mesma forma — diárias, semanais ou mensais. Trata casos como agendar uma despesa mensal recorrente no dia 31 em meses que não o têm.

### Cronômetro Pomodoro

Widget sempre visível no canto superior direito. Defina uma duração, inicie a contagem regressiva, anexe qualquer ícone de tarefa. A checklist da tarefa anexada aparece diretamente no cronômetro para marcação rápida sem abrir uma janela separada.

### Dias Próximos

Widget mostrando hoje, amanhã e depois de amanhã — todas as tarefas agendadas resolvidas a partir das regras pontuais e recorrentes.

### Controle de Gastos

Cada despesa é seu próprio ícone. Um widget de gastos mostra totais por dia, semana e mês em todas as despesas.

### Meu Computador

Lista estilo Windows Explorer de todos os ícones da área de trabalho. Com pesquisa. Botão direito nos itens abre o mesmo menu de contexto da área de trabalho (abrir, fixar, propriedades, excluir, reiniciar posição).

### Protetor de Tela

Logo quicando estilo DVD, ativado pelo menu Iniciar. Dispensado com qualquer clique.

---

## Arquitetura

```text
Electron 42
└─ BrowserWindow
   ├─ preload  →  contextBridge expõe window.api (alternar tela cheia)
   └─ renderer  →  React 19 + Vite 7
        ├─ App.tsx              todo o estado global, roteamento de janelas, handlers
        ├─ Desktop.tsx          grade de ícones, menus de contexto dos ícones
        ├─ WindowFrame.tsx      shell arrastável + redimensionável (hook useDraggable)
        ├─ Taskbar.tsx          botões de programas abertos + relógio
        ├─ StartMenu.tsx        programas fixados + área do sistema
        └─ components/          um arquivo por janela ou widget de funcionalidade
```

**Armazenamento:** somente `localStorage`. Sem backend, sem chamadas de rede. Todas as chaves são versionadas (`chronostadia.icons.v1`, etc.) com lógica de migração que recupera campos `builtin` ausentes a partir de `INITIAL_ICONS` no carregamento.

---

## Decisões Técnicas

**Todo o estado em `App.tsx`.** `openWindows`, `icons`, dados do calendário, dados de despesas — tudo desce como props. Sem store global. O app é pequeno o suficiente para que prop-drilling seja mais simples e rastreável do que introduzir um contexto ou store.

**Widgets são irmãos do Desktop, não filhos.** `TimerWidget`, `UpcomingWidget` e `SpendingWidget` ficam ao lado de `<Desktop>` dentro da div do OS shell. Eventos de botão direito de widgets sobem para o shell — não para o `Desktop`. O menu de criação da área de trabalho vazia está no `onContextMenu` do `os-shell`, então botão direito em qualquer superfície (widget ou desktop) o exibe, enquanto cliques em ícones param a propagação.

**Resolução de colisão da grade de ícones.** `resolveCollisions()` processa ícones em ordem de array (índice menor = prioridade) e atribui a cada um a primeira célula livre descendo a coluna e depois indo para a direita. `findFreeCell()` é chamada na criação para que novos ícones sempre pousem no primeiro slot visível e desocupado — sem posicionamento fora da tela.

**Limites de arrasto aplicados no nível do hook.** `useDraggable` aceita uma opção `bounds`. `DesktopIcon` calcula `maxX` e `maxY` a partir das dimensões da janela em cada render e os passa. Um `ref` dentro do hook mantém os limites atuais para que o handler de `mousemove` sempre leia o valor mais recente sem precisar se reinscever.

**Layout de widgets é matemática de orçamento de altura.** Em tempo de render, `App.tsx` soma as alturas estimadas de todos os widgets da coluna direita visíveis (Timer, Próximos, Notas, Gastos). Se o total excede o espaço vertical disponível, Timer e Próximos deslocam para a esquerda em `264px` em vez de se sobreporem.

**`position: fixed` para menus de contexto.** Menus de contexto usam `position: fixed` para que as coordenadas do viewport funcionem corretamente independente do `overflow: hidden` de qualquer ancestral, que a div do desktop usa para cortar ícones na borda da barra de tarefas.

---

## Stack

| Camada | Escolha |
| --- | --- |
| Runtime | Electron 42 |
| UI | React 19 |
| Linguagem | TypeScript 6 |
| Bundler | electron-vite (Vite 7) |
| Estilos | 98.css + CSS customizado |
| Armazenamento | localStorage |
| Empacotamento | electron-builder (NSIS + portable) |

---

## Rodando Localmente

```bash
npm install
npm run dev          # Electron + hot-reload do renderer
npm run typecheck    # Verificação TypeScript (sem emit)
npm run build:win    # Instalador Windows (.exe) → release/
```

> Se `ELECTRON_RUN_AS_NODE` estiver definido no seu ambiente de shell, remova-o antes de rodar `npm run dev`. Quando definido, o Electron pula o bootstrap do app e o processo encerra imediatamente com `app undefined`.

---

## Créditos

Ícones pixel art por [Justin Arnold](https://zeromatrix.itch.io/rpgiab-icons) — [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

CSS Win98 por [jdan/98.css](https://github.com/jdan/98.css) — MIT
