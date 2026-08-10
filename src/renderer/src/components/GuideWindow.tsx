import { useRef } from 'react'
import WindowFrame, { DIALOG_Z_INDEX } from './WindowFrame'

const SECTIONS = [
  { id: 'welcome',     label: '🏠 Bem-vindo' },
  { id: 'desktop',     label: '🖥️ Área de Trabalho' },
  { id: 'tasks',       label: '📋 Tarefas' },
  { id: 'folders',     label: '📁 Pastas / Kanban' },
  { id: 'calendar',    label: '📅 Calendário' },
  { id: 'upcoming',    label: '📆 Dias Próximos' },
  { id: 'timer',       label: '⏱️ Cronômetro' },
  { id: 'notes',       label: '🗒️ Notas' },
  { id: 'spending',    label: '💰 Gastos' },
  { id: 'personalize', label: '🎨 Personalização' },
  { id: 'credits',     label: '🎖️ Créditos' },
]

interface GuideWindowProps {
  onClose: () => void
}

function GuideWindow({ onClose }: GuideWindowProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  function scrollTo(id: string): void {
    const el = contentRef.current?.querySelector(`#guide-${id}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <WindowFrame
      title="📖 Guia do ChronoStadia"
      onClose={onClose}
      showWindowControls={false}
      width={720}
      initialHeight={520}
      zIndex={DIALOG_Z_INDEX}
      initialPosition={{ x: 80, y: 40 }}
    >
      <div className="guide-layout">
        {/* ── Sumário lateral ── */}
        <nav className="guide-sidebar">
          <div className="guide-sidebar-title">✦ ÍNDICE ✦</div>
          {SECTIONS.map((s) => (
            <button key={s.id} className="guide-sidebar-link" onClick={() => scrollTo(s.id)}>
              {s.label}
            </button>
          ))}
          <div className="guide-sidebar-footer">ChronoStadia v1.1.0</div>
        </nav>

        {/* ── Conteúdo principal ── */}
        <div ref={contentRef} className="guide-content">

          {/* ══ Bem-vindo ══ */}
          <section id="guide-welcome" className="guide-section">
            <h2 className="guide-section-header">🏠 Bem-vindo ao ChronoStadia</h2>
            <div className="guide-section-body">
              <p>
                <strong>ChronoStadia</strong> é um ambiente de produtividade com visual retrô
                Windows 98/2000. Você organiza suas tarefas como programas numa área de trabalho,
                com janelas arrastáveis, checklist, cronômetro e calendário.
              </p>
              <div className="guide-tip">
                💡 <strong>Dica:</strong> Tudo funciona com clique duplo pra abrir e
                clique com o botão direito pra ver as opções de cada elemento.
              </div>
              <p>O ambiente é composto por:</p>
              <ul className="guide-list">
                <li><strong>Área de trabalho</strong> — onde ficam seus ícones</li>
                <li><strong>Barra de tarefas</strong> — programas abertos + relógio</li>
                <li><strong>Menu Iniciar</strong> — acesso rápido, guia e botão de tela cheia</li>
                <li><strong>Programas fixos</strong> — Notas Rápidas, Cronômetro, Calendário, Dias Próximos e Gastos</li>
              </ul>
              <div className="guide-note">
                📁 Todos os seus dados ficam salvos localmente no navegador/app —
                nada vai pra internet.
              </div>
            </div>
          </section>

          {/* ══ Área de trabalho ══ */}
          <section id="guide-desktop" className="guide-section">
            <h2 className="guide-section-header">🖥️ Área de Trabalho</h2>
            <div className="guide-section-body">
              <p>
                A <strong>área de trabalho</strong> é a superfície principal do OS.
                Os ícones ficam posicionados em uma <strong>grade invisível de 96×96 px</strong>
                — ao soltar um ícone, ele encaixa automaticamente na célula mais próxima.
              </p>
              <ul className="guide-list">
                <li><strong>Duplo-clique</strong> num ícone → abre o programa</li>
                <li><strong>Clique e arraste</strong> um ícone → move pra outra posição</li>
                <li><strong>Botão direito</strong> num ícone → menu de opções</li>
                <li><strong>Botão direito</strong> em área vazia → criar tarefa/pasta, personalizar</li>
              </ul>
              <div className="guide-tip">
                💡 Se dois ícones ficarem na mesma célula por acaso, o sistema resolve
                a colisão automaticamente empurrando um deles pra próxima célula livre.
              </div>
              <p><strong>Menu de contexto do ícone:</strong></p>
              <ul className="guide-list">
                <li><strong>Abrir</strong> — abre a janela do programa</li>
                <li><strong>Fixar no menu Iniciar</strong> — adiciona ao atalho rápido</li>
                <li><strong>Propriedades</strong> — renomear ou trocar o ícone (glyph)</li>
                <li><strong>Anexar ao Cronômetro</strong> — vincula ao cronômetro ativo</li>
                <li><strong>Excluir tarefa / Excluir pasta / Excluir nota</strong> — remove o programa</li>
              </ul>
              <p><strong>Menu de contexto da área vazia:</strong></p>
              <ul className="guide-list">
                <li><strong>Criar nova tarefa</strong> — abre o diálogo de criação de tarefa</li>
                <li><strong>Criar nova nota</strong> — cria uma nota com nome e salva automaticamente</li>
                <li><strong>Criar nova pasta</strong> — cria um board Kanban</li>
                <li><strong>Personalizar</strong> — altera o plano de fundo</li>
              </ul>
            </div>
          </section>

          {/* ══ Tarefas ══ */}
          <section id="guide-tasks" className="guide-section">
            <h2 className="guide-section-header">📋 Tarefas</h2>
            <div className="guide-section-body">
              <p>
                <strong>Tarefas</strong> são os programas que você cria. Cada tarefa tem
                um nome, um ícone (glyph emoji), uma descrição livre e uma checklist.
              </p>
              <p><strong>Criar uma tarefa:</strong></p>
              <ul className="guide-list">
                <li>Clique com o botão direito na área de trabalho vazia</li>
                <li>Selecione <em>"Criar nova tarefa"</em></li>
                <li>Digite o nome e escolha um ícone</li>
                <li>Clique em <em>"Criar"</em></li>
              </ul>
              <p><strong>Dentro da janela de uma tarefa:</strong></p>
              <ul className="guide-list">
                <li><strong>Descrição</strong> — área de texto livre no topo</li>
                <li><strong>Barra de progresso</strong> — mostra % de itens concluídos na checklist</li>
                <li><strong>Checklist</strong> — lista de itens que você cria e marca como feitos</li>
                <li>Clique no <strong>label do item</strong> (não no checkbox diretamente) pra marcar</li>
              </ul>
              <div className="guide-tip">
                💡 A janela é redimensionável — arraste as bordas ou o canto para ajustar o tamanho.
              </div>
              <div className="guide-note">
                📌 Tarefas ficam sempre na área de trabalho mesmo quando adicionadas a
                uma pasta/kanban ou ao calendário. Excluir uma tarefa a remove de todos
                esses lugares automaticamente.
              </div>
            </div>
          </section>

          {/* ══ Pastas / Kanban ══ */}
          <section id="guide-folders" className="guide-section">
            <h2 className="guide-section-header">📁 Pastas e Kanban</h2>
            <div className="guide-section-body">
              <p>
                <strong>Pastas</strong> organizam suas tarefas em um board estilo Kanban —
                colunas nomeadas onde você distribui as tarefas em diferentes estágios.
              </p>
              <p><strong>Criar uma pasta:</strong></p>
              <ul className="guide-list">
                <li>Botão direito na área de trabalho → <em>"Criar nova pasta"</em></li>
                <li>A pasta nasce com 3 colunas padrão: A Fazer · Em Andamento · Concluído</li>
              </ul>
              <p><strong>Dentro do board:</strong></p>
              <ul className="guide-list">
                <li><strong>Adicionar tarefa</strong> — botão no rodapé de cada coluna</li>
                <li><strong>Mover card</strong> — arraste um card e solte em outra coluna</li>
                <li><strong>Duplo-clique no card</strong> — abre a janela da tarefa</li>
                <li><strong>× no card</strong> — remove da coluna (não exclui a tarefa)</li>
                <li><strong>Duplo-clique no nome da coluna</strong> — renomeia</li>
                <li><strong>× na coluna</strong> — exclui a coluna</li>
                <li><strong>+ Nova coluna</strong> — adiciona uma coluna vazia</li>
              </ul>
              <div className="guide-tip">
                💡 Uma tarefa pode estar em apenas uma coluna por pasta. Adicioná-la a
                uma segunda coluna a remove da primeira automaticamente.
              </div>
              <div className="guide-note">
                ⚠️ Excluir uma pasta não exclui as tarefas que ela continha —
                elas continuam na área de trabalho.
              </div>
            </div>
          </section>

          {/* ══ Calendário ══ */}
          <section id="guide-calendar" className="guide-section">
            <h2 className="guide-section-header">📅 Calendário</h2>
            <div className="guide-section-body">
              <p>
                O <strong>Calendário</strong> é um programa fixo (ícone 📅 na área de trabalho).
                Abre sempre no mês atual do sistema.
              </p>
              <p><strong>Navegação:</strong></p>
              <ul className="guide-list">
                <li><strong>‹ ›</strong> — mês anterior / próximo</li>
                <li><strong>« »</strong> — ano anterior / próximo</li>
                <li><strong>Hoje</strong> — volta pro mês atual (aparece só quando fora do mês atual)</li>
              </ul>
              <p><strong>Anexar tarefas a dias:</strong></p>
              <ul className="guide-list">
                <li>Botão direito num dia → <em>"Anexar tarefa..."</em></li>
                <li>Selecione a tarefa no explorador que abre</li>
                <li>A tarefa aparece como badge azul no dia</li>
                <li><strong>× no badge</strong> — remove a tarefa daquele dia</li>
              </ul>
              <p><strong>Tarefas semanais (recorrentes):</strong></p>
              <ul className="guide-list">
                <li>Botão direito no cabeçalho de um dia da semana (Seg, Ter, ...) → <em>"Marcar tarefa semanal"</em></li>
                <li>A tarefa aparece em <strong>todos os dias daquele dia da semana</strong> no mês</li>
                <li>Badges semanais têm o prefixo ↺ para se distinguir das específicas do dia</li>
                <li>Para remover, botão direito no cabeçalho novamente e desmarque a tarefa</li>
              </ul>
              <div className="guide-tip">
                💡 Se um dia tiver mais de 2 tarefas, o calendário mostra as duas primeiras
                e um contador <em>"+ N"</em>. Duplo-clique no dia pra ver todas.
              </div>
              <p><strong>Visão de dia (duplo-clique):</strong></p>
              <ul className="guide-list">
                <li>Mostra todas as tarefas daquele dia em lista</li>
                <li><strong>Duplo-clique na tarefa</strong> → abre a janela da tarefa</li>
                <li><strong>Anexar tarefa...</strong> → adiciona mais tarefas ao dia</li>
                <li><strong>← Voltar</strong> → retorna ao calendário mensal</li>
              </ul>
            </div>
          </section>

          {/* ══ Dias Próximos ══ */}
          <section id="guide-upcoming" className="guide-section">
            <h2 className="guide-section-header">📆 Dias Próximos</h2>
            <div className="guide-section-body">
              <p>
                <strong>Dias Próximos</strong> é um widget fixo que aparece no canto superior
                direito da tela (abaixo do Cronômetro quando ele estiver aberto). Mostra as
                tarefas dos próximos 3 dias em leitura rápida.
              </p>
              <ul className="guide-list">
                <li>Exibe <strong>Hoje</strong>, <strong>Amanhã</strong> e <strong>Depois de amanhã</strong></li>
                <li>Lê os dados do Calendário em tempo real — sem duplicação</li>
                <li>Inclui tarefas específicas do dia <em>e</em> tarefas semanais recorrentes</li>
                <li>É somente leitura — para adicionar tarefas, use o Calendário</li>
              </ul>
              <div className="guide-tip">
                💡 O widget desce automaticamente se o Cronômetro estiver aberto,
                para os dois não se sobreporem.
              </div>
            </div>
          </section>

          {/* ══ Cronômetro ══ */}
          <section id="guide-timer" className="guide-section">
            <h2 className="guide-section-header">⏱️ Cronômetro</h2>
            <div className="guide-section-body">
              <p>
                O <strong>Cronômetro</strong> fica fixo no canto superior direito da tela.
                Aparece na barra de tarefas e pode ser minimizado como qualquer programa.
              </p>
              <ul className="guide-list">
                <li>Digite a duração em minutos e clique <strong>▶ Iniciar</strong></li>
                <li><strong>⏸ Pausar</strong> — pausa sem perder o progresso</li>
                <li><strong>⟳ Resetar</strong> — zera e volta ao estado inicial</li>
                <li>A barra de progresso segmentada mostra o tempo decorrido</li>
                <li>Ao terminar, o cronômetro exibe <em>"✓ Concluído!"</em></li>
              </ul>
              <p><strong>Anexar uma tarefa ao cronômetro:</strong></p>
              <ul className="guide-list">
                <li>Com o cronômetro aberto, clique com botão direito num ícone de tarefa</li>
                <li>Selecione <em>"Anexar ao Cronômetro"</em></li>
                <li>A checklist da tarefa aparece no cronômetro para marcação rápida</li>
              </ul>
              <div className="guide-tip">
                💡 Técnica Pomodoro: defina 25 minutos, anexe uma tarefa e trabalhe até o timer terminar.
              </div>
            </div>
          </section>

          {/* ══ Notas ══ */}
          <section id="guide-notes" className="guide-section">
            <h2 className="guide-section-header">🗒️ Notas</h2>
            <div className="guide-section-body">
              <p>Existem dois tipos de nota no ChronoStadia:</p>

              <p><strong>Notas Rápidas</strong> (programa fixo 🗒️)</p>
              <ul className="guide-list">
                <li>Widget fixo no canto inferior direito</li>
                <li>Ideal para rascunhos rápidos durante a sessão</li>
                <li>O conteúdo <strong>não é salvo</strong> ao fechar — é temporário</li>
              </ul>

              <p><strong>Notas</strong> (programa criável 📝)</p>
              <ul className="guide-list">
                <li>Botão direito na área de trabalho → <em>"Criar nova nota"</em></li>
                <li>Cada nota tem um nome próprio e aparece como ícone na área de trabalho</li>
                <li>O conteúdo <strong>é salvo</strong> automaticamente ao digitar</li>
                <li>Janela redimensionável como qualquer programa</li>
                <li>Pode ter quantas notas quiser, cada uma independente</li>
              </ul>
              <div className="guide-tip">
                💡 Use Notas Rápidas para ideias do momento e Notas salvas para
                informações que precisam persistir entre sessões.
              </div>
            </div>
          </section>

          {/* ══ Gastos ══ */}
          <section id="guide-spending" className="guide-section">
            <h2 className="guide-section-header">💰 Controle de Gastos</h2>
            <div className="guide-section-body">
              <p>
                O sistema de gastos é composto por dois elementos: os programas <strong>Despesa</strong>
                (criados pelo usuário) e o widget fixo <strong>Gastos</strong>.
              </p>

              <p><strong>Criar uma despesa:</strong></p>
              <ul className="guide-list">
                <li>Botão direito na área de trabalho → <em>"Criar nova despesa"</em></li>
                <li>Digite o nome e o valor em R$</li>
                <li>A despesa aparece como ícone na área de trabalho</li>
                <li>Duplo-clique no ícone para editar o valor</li>
              </ul>

              <p><strong>Anexar despesas ao calendário:</strong></p>
              <ul className="guide-list">
                <li>Botão direito em um dia → <em>"Anexar despesa..."</em> — valor conta apenas naquele dia</li>
                <li>Botão direito no cabeçalho do dia da semana → <em>"Marcar despesa semanal..."</em> — valor conta em todos os dias daquela semana</li>
                <li>Despesas no calendário aparecem com badge âmbar (marrom escuro)</li>
              </ul>

              <p><strong>Widget Gastos:</strong></p>
              <ul className="guide-list">
                <li>Fixo no lado direito da tela, acima das Notas Rápidas</li>
                <li><strong>Total geral</strong> — soma dos valores de todas as despesas cadastradas</li>
                <li><strong>Este mês</strong> — soma das despesas anexadas a dias do mês atual, contando cada ocorrência (despesas semanais multiplicam pelo número de dias do tipo no mês)</li>
              </ul>
              <div className="guide-tip">
                💡 Uma despesa semanal de R$ 5,00 na sexta-feira contribui R$ 20,00 ou R$ 25,00
                para o total do mês (dependendo de quantas sextas existem naquele mês).
              </div>
            </div>
          </section>

          {/* ══ Personalização ══ */}
          <section id="guide-personalize" className="guide-section">
            <h2 className="guide-section-header">🎨 Personalização</h2>
            <div className="guide-section-body">
              <p>
                Personalize o plano de fundo da área de trabalho clicando com o
                botão direito na área vazia e escolhendo <em>"Personalizar"</em>.
              </p>
              <ul className="guide-list">
                <li><strong>Cor sólida</strong> — escolha uma das cores da paleta</li>
                <li><strong>Imagem</strong> — clique em <em>"Escolher imagem..."</em> para usar uma foto</li>
                <li>A imagem é redimensionada pra cobrir toda a tela (<em>cover</em>)</li>
                <li>A escolha é salva automaticamente e persiste ao reabrir o app</li>
              </ul>
              <div className="guide-tip">
                💡 A cor teal (#008080) padrão é uma homenagem ao Windows 95/98 original.
              </div>
              <p><strong>Tela cheia:</strong></p>
              <ul className="guide-list">
                <li>Abra o Menu Iniciar → clique em <em>"Tela Cheia"</em> no lado direito (azul)</li>
                <li>Para sair da tela cheia, abra o Menu Iniciar novamente → <em>"Sair Tela Cheia"</em></li>
              </ul>
            </div>
          </section>

          {/* ══ Créditos ══ */}
          <section id="guide-credits" className="guide-section">
            <h2 className="guide-section-header">🎖️ Créditos e Atribuições</h2>
            <div className="guide-section-body">
              <p><strong>Ícones pixel art</strong></p>
              <div className="guide-note">
                Os ícones utilizados no ChronoStadia foram criados por{' '}
                <strong>Justin Arnold</strong> e estão disponíveis em{' '}
                <em>Justin's 16x16 Icon Pack</em> (zeromatrix.itch.io/rpgiab-icons).
                Utilizados sob licença{' '}
                <strong>Creative Commons Attribution 4.0 International (CC BY 4.0)</strong>.
              </div>
              <ul className="guide-list">
                <li>Autor: Justin Arnold — justin@rpginabox.com</li>
                <li>Fonte: zeromatrix.itch.io/rpgiab-icons</li>
                <li>Licença: creativecommons.org/licenses/by/4.0</li>
              </ul>

              <p><strong>Tecnologias</strong></p>
              <ul className="guide-list">
                <li><strong>Electron</strong> — MIT</li>
                <li><strong>React</strong> — MIT</li>
                <li><strong>98.css</strong> (Jordan Scales) — MIT</li>
                <li><strong>Vite / electron-vite</strong> — MIT</li>
              </ul>
            </div>
          </section>

        </div>
      </div>
    </WindowFrame>
  )
}

export default GuideWindow
