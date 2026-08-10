import { useState } from 'react'
import { createPortal } from 'react-dom'
import { resolveIconAsset } from '../assets/icons/builtins'
import type { DesktopIconData, KanbanColumn } from '../types'
import TaskPickerDialog from './TaskPickerDialog'

interface FolderWindowProps {
  columns: KanbanColumn[]
  tasks: DesktopIconData[]
  onUpdateColumns: (columns: KanbanColumn[]) => void
  onOpenTask: (id: string) => void
}

function FolderWindow({ columns, tasks, onUpdateColumns, onOpenTask }: FolderWindowProps) {
  const [dragInfo, setDragInfo] = useState<{ taskId: string; sourceColId: string } | null>(null)
  const [dragOverColId, setDragOverColId] = useState<string | null>(null)
  const [editingColId, setEditingColId] = useState<string | null>(null)
  const [editingColName, setEditingColName] = useState('')
  const [addingToColId, setAddingToColId] = useState<string | null>(null)

  const taskMap = new Map(tasks.map((t) => [t.id, t]))
  const allAttachedIds = columns.flatMap((c) => c.taskIds)

  function moveTask(taskId: string, fromColId: string, toColId: string): void {
    if (fromColId === toColId) return
    onUpdateColumns(
      columns.map((col) => {
        if (col.id === fromColId) return { ...col, taskIds: col.taskIds.filter((id) => id !== taskId) }
        if (col.id === toColId) return { ...col, taskIds: [...col.taskIds, taskId] }
        return col
      })
    )
  }

  function removeFromCol(taskId: string, colId: string): void {
    onUpdateColumns(
      columns.map((col) =>
        col.id === colId ? { ...col, taskIds: col.taskIds.filter((id) => id !== taskId) } : col
      )
    )
  }

  function addTaskToCol(colId: string, taskId: string): void {
    // Remove from any other column in this folder first, then add to target
    onUpdateColumns(
      columns.map((col) => {
        const without = col.taskIds.filter((id) => id !== taskId)
        if (col.id === colId) return { ...col, taskIds: [...without, taskId] }
        return { ...col, taskIds: without }
      })
    )
    setAddingToColId(null)
  }

  function startEditCol(col: KanbanColumn): void {
    setEditingColId(col.id)
    setEditingColName(col.name)
  }

  function finishEditCol(): void {
    if (!editingColId) return
    const trimmed = editingColName.trim()
    if (trimmed) {
      onUpdateColumns(
        columns.map((col) => (col.id === editingColId ? { ...col, name: trimmed } : col))
      )
    }
    setEditingColId(null)
  }

  function deleteCol(colId: string): void {
    onUpdateColumns(columns.filter((col) => col.id !== colId))
  }

  function addColumn(): void {
    const newCol: KanbanColumn = { id: crypto.randomUUID(), name: 'Nova Coluna', taskIds: [] }
    onUpdateColumns([...columns, newCol])
    setEditingColId(newCol.id)
    setEditingColName(newCol.name)
  }

  return (
    <div className="folder-kanban">
      {columns.map((col) => {
        const colTasks = col.taskIds
          .map((id) => taskMap.get(id))
          .filter((t): t is DesktopIconData => t != null)
        const isDragOver = dragOverColId === col.id

        return (
          <div
            key={col.id}
            className={`kanban-column${isDragOver ? ' kanban-column-dragover' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOverColId(col.id) }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setDragOverColId(null)
              }
            }}
            onDrop={(e) => {
              e.preventDefault()
              setDragOverColId(null)
              if (dragInfo) moveTask(dragInfo.taskId, dragInfo.sourceColId, col.id)
            }}
          >
            <div className="kanban-col-header">
              {editingColId === col.id ? (
                <input
                  className="kanban-col-name-input"
                  value={editingColName}
                  autoFocus
                  onChange={(e) => setEditingColName(e.target.value)}
                  onBlur={finishEditCol}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') finishEditCol()
                    if (e.key === 'Escape') setEditingColId(null)
                  }}
                />
              ) : (
                <span
                  className="kanban-col-name"
                  onDoubleClick={() => startEditCol(col)}
                  title="Duplo-clique para renomear"
                >
                  {col.name}
                </span>
              )}
              <button
                className="kanban-col-delete"
                onClick={() => deleteCol(col.id)}
                title="Excluir coluna"
              >
                ×
              </button>
            </div>

            <div className="kanban-col-body">
              {colTasks.map((task) => (
                <div
                  key={task.id}
                  className="kanban-card"
                  draggable
                  onDragStart={() => setDragInfo({ taskId: task.id, sourceColId: col.id })}
                  onDragEnd={() => { setDragInfo(null); setDragOverColId(null) }}
                  onDoubleClick={() => onOpenTask(task.id)}
                  title="Arraste para mover • Duplo-clique para abrir"
                >
                  <span className="kanban-card-glyph">
                    {(() => {
                      const src = resolveIconAsset(task.builtin, task.id, task.glyph)
                      return src
                        ? <img src={src} width={16} height={16} alt="" className="pixel-icon" style={{ verticalAlign: 'middle' }} />
                        : task.glyph
                    })()}
                  </span>
                  <span className="kanban-card-name">{task.label}</span>
                  <button
                    className="kanban-card-remove"
                    onClick={(e) => { e.stopPropagation(); removeFromCol(task.id, col.id) }}
                    title="Remover da coluna"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <button className="kanban-add-task" onClick={() => setAddingToColId(col.id)}>
              + Adicionar tarefa
            </button>
          </div>
        )
      })}

      <div className="kanban-add-col-wrapper">
        <button className="kanban-add-col" onClick={addColumn}>
          + Nova coluna
        </button>
      </div>

      {addingToColId != null && createPortal(
        <TaskPickerDialog
          tasks={tasks}
          alreadyAttached={allAttachedIds}
          onSelect={(taskId) => addTaskToCol(addingToColId, taskId)}
          onClose={() => setAddingToColId(null)}
        />,
        document.body
      )}
    </div>
  )
}

export default FolderWindow
