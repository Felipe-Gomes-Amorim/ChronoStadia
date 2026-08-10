import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'

interface Position {
  x: number
  y: number
}

interface UseDraggableOptions {
  grid?: Position
  bounds?: { maxX: number; maxY: number }
  onSettle?: (position: Position) => void
}

function snapTo(value: number, cellSize: number): number {
  return Math.round(value / cellSize) * cellSize
}

export function useDraggable(initialPosition: Position, options?: UseDraggableOptions) {
  const [position, setPosition] = useState(initialPosition)
  const [dragging, setDragging] = useState(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const latestPosition = useRef(initialPosition)
  const grid = options?.grid
  const onSettle = options?.onSettle
  // Ref para que o handler de mousemove sempre leia os limites atuais
  // sem precisar recriar o listener a cada render.
  const boundsRef = useRef(options?.bounds)
  boundsRef.current = options?.bounds

  // Ressincroniza a posição visual quando a posição do ícone é alterada
  // externamente (ex.: resolução de colisão) e não há arrasto em andamento.
  useEffect(() => {
    if (!dragging) {
      setPosition(initialPosition)
      latestPosition.current = initialPosition
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPosition.x, initialPosition.y])

  function handleMouseDown(event: ReactMouseEvent): void {
    dragOffset.current = { x: event.clientX - position.x, y: event.clientY - position.y }
    setDragging(true)
  }

  useEffect(() => {
    if (!dragging) return

    function handleMouseMove(event: MouseEvent): void {
      let x = event.clientX - dragOffset.current.x
      let y = event.clientY - dragOffset.current.y

      if (grid) {
        x = snapTo(x, grid.x)
        y = snapTo(y, grid.y)
      }

      const maxX = boundsRef.current?.maxX ?? Infinity
      const maxY = boundsRef.current?.maxY ?? Infinity
      const next = {
        x: Math.min(Math.max(0, x), maxX),
        y: Math.min(Math.max(0, y), maxY)
      }
      latestPosition.current = next
      setPosition(next)
    }

    function handleMouseUp(): void {
      setDragging(false)
      onSettle?.(latestPosition.current)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragging, grid, onSettle])

  return { position, dragging, handleMouseDown }
}
