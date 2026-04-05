import { useRef, useState, useCallback, useEffect } from 'react'
import { useAppStore } from '@/store'
import type { ElementNode } from '@/types'

export function Canvas() {
  const root = useAppStore(s => s.project?.root)
  const selectedElementIds = useAppStore(s => s.selectedElementIds)
  const setSelectedElementIds = useAppStore(s => s.setSelectedElementIds)
  const toggleSelectedElement = useAppStore(s => s.toggleSelectedElement)
  const canvasSettings = useAppStore(s => s.canvasSettings)
  const updateCanvasSettings = useAppStore(s => s.updateCanvasSettings)

  const containerRef = useRef<HTMLDivElement>(null)
  const artboardRef = useRef<HTMLDivElement>(null)
  const interactionRef = useRef<'idle' | 'resizing' | 'panning'>('idle')

  // Refs estáveis para pan — evitam que o useEffect re-attache listeners
  const panStateRef = useRef({
    offsetX: canvasSettings.offsetX,
    offsetY: canvasSettings.offsetY,
  })
  panStateRef.current.offsetX = canvasSettings.offsetX
  panStateRef.current.offsetY = canvasSettings.offsetY

  const updateCanvasSettingsRef = useRef(updateCanvasSettings)
  updateCanvasSettingsRef.current = updateCanvasSettings

  // ─── Zoom com Ctrl+Scroll ─────────────────────────────────
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.1 : 0.1
      const newZoom = Math.min(3, Math.max(0.25, canvasSettings.zoom + delta))
      updateCanvasSettings({ zoom: Math.round(newZoom * 100) / 100 })
    }
  }, [canvasSettings.zoom, updateCanvasSettings])

  // ─── Pan com Espaço+Drag ou Middle click ───────────────────
  // Deps vazias: usa refs para tudo, então listeners são registrados uma única vez
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let spaceDown = false
    let isPanning = false
    const panStart = { x: 0, y: 0 }

    function onKeyDown(e: KeyboardEvent) {
      if (e.code === 'Space' && !spaceDown && e.target === document.body) {
        spaceDown = true
        container!.style.cursor = 'grab'
        e.preventDefault()
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      if (e.code === 'Space') {
        spaceDown = false
        container!.style.cursor = ''
        isPanning = false
        interactionRef.current = 'idle'
      }
    }

    function onMouseDown(e: MouseEvent) {
      if (spaceDown || e.button === 1) {
        isPanning = true
        interactionRef.current = 'panning'
        panStart.x = e.clientX - panStateRef.current.offsetX
        panStart.y = e.clientY - panStateRef.current.offsetY
        container!.style.cursor = 'grabbing'
        e.preventDefault()
      }
    }

    function onMouseMove(e: MouseEvent) {
      if (!isPanning) return
      const newX = e.clientX - panStart.x
      const newY = e.clientY - panStart.y
      updateCanvasSettingsRef.current({ offsetX: newX, offsetY: newY })
    }

    function onMouseUp() {
      if (isPanning) {
        isPanning = false
        interactionRef.current = 'idle'
        container!.style.cursor = spaceDown ? 'grab' : ''
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    container.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      container.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, []) // ← sem deps: registra listeners uma vez, usa refs para valores mutáveis

  // Clique no fundo = deselecionar (APENAS se não acabamos de resize/pan)
  function handleBackgroundClick(e: React.MouseEvent) {
    if (interactionRef.current !== 'idle') return

    const target = e.target as HTMLElement
    const isBackground = target === containerRef.current
      || target.dataset.canvasBg !== undefined
      || target.dataset.artboard !== undefined
    if (isBackground) {
      setSelectedElementIds([])
    }
  }

  const markInteraction = useCallback((type: 'idle' | 'resizing' | 'panning') => {
    interactionRef.current = type
  }, [])

  if (!root) return null

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-hidden bg-editor-bg relative"
      onWheel={handleWheel}
      onMouseDown={handleBackgroundClick}
    >
      {/* Grid de fundo — linhas sutis (ativável pelo menu Exibir) */}
      {canvasSettings.showGrid && (
        <div
          data-canvas-bg
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(128,128,128,0.06) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(128,128,128,0.06) 1px, transparent 1px)
            `,
            backgroundSize: `${canvasSettings.gridSize * canvasSettings.zoom}px ${canvasSettings.gridSize * canvasSettings.zoom}px`,
            backgroundPosition: `${canvasSettings.offsetX % (canvasSettings.gridSize * canvasSettings.zoom)}px ${canvasSettings.offsetY % (canvasSettings.gridSize * canvasSettings.zoom)}px`,
          }}
        />
      )}

      {/* Zoom indicator */}
      <div className="absolute bottom-3 right-3 text-[10px] text-editor-text-muted font-mono z-10 bg-editor-surface/80 px-2 py-1 rounded-md border border-editor-border">
        {Math.round(canvasSettings.zoom * 100)}%
      </div>

      {/* Container do canvas com zoom e pan */}
      <div
        className="absolute"
        style={{
          transform: `translate(${canvasSettings.offsetX}px, ${canvasSettings.offsetY}px) scale(${canvasSettings.zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {/* Artboard */}
        <div
          ref={artboardRef}
          data-artboard
          className="bg-white relative shadow-2xl"
          style={{
            width: `${canvasSettings.width}px`,
            minHeight: `${canvasSettings.height}px`,
          }}
        >
          <RenderNode
            node={root}
            selectedElementIds={selectedElementIds}
          />
        </div>
      </div>

      {/* Selection overlays — um por elemento selecionado */}
      {selectedElementIds.map(id => (
        containerRef.current && (
          <SelectionOverlay
            key={id}
            selectedElementId={id}
            containerRef={containerRef}
            zoom={canvasSettings.zoom}
            offsetX={canvasSettings.offsetX}
            offsetY={canvasSettings.offsetY}
            markInteraction={markInteraction}
            isPrimary={selectedElementIds.length === 1}
          />
        )
      ))}
    </div>
  )
}

// ─── Renderizar nó da árvore como elemento HTML real ─────────
// Sem overlay dentro do elemento — o overlay é renderizado fora do artboard

function RenderNode({
  node,
  selectedElementIds,
}: {
  node: ElementNode
  selectedElementIds: string[]
}) {
  const setSelectedElementIds = useAppStore(s => s.setSelectedElementIds)
  const toggleSelectedElement = useAppStore(s => s.toggleSelectedElement)

  if (!node.visible) return null

  const Tag = node.tag as keyof React.JSX.IntrinsicElements
  const isSelected = selectedElementIds.includes(node.id)

  const styles: React.CSSProperties = {
    ...(node.styles as React.CSSProperties),
    position: (node.styles.position as React.CSSProperties['position']) || 'relative',
    outline: isSelected ? '2px solid #3b82f6' : undefined,
    outlineOffset: isSelected ? '0px' : undefined,
  }

  function handleMouseDown(e: React.MouseEvent) {
    if (node.locked) return
    e.stopPropagation()
    // Ctrl/Meta ou Shift = adicionar/remover da seleção
    if (e.ctrlKey || e.metaKey || e.shiftKey) {
      toggleSelectedElement(node.id)
    } else {
      setSelectedElementIds([node.id])
    }
  }

  const elementProps: Record<string, unknown> = {
    'data-editor-id': node.id,
    style: styles,
    onMouseDown: handleMouseDown,
    className: node.className?.join(' '),
  }

  for (const [key, value] of Object.entries(node.attributes)) {
    elementProps[key] = value
  }

  const isVoid = node.tag === 'img' || node.tag === 'input' || node.tag === 'br' || node.tag === 'hr'

  if (isVoid) {
    return <Tag {...(elementProps as Record<string, unknown>)} />
  }

  return (
    <Tag {...(elementProps as Record<string, unknown>)}>
      {node.content}
      {node.children.map(child => (
        <RenderNode
          key={child.id}
          node={child}
          selectedElementIds={selectedElementIds}
        />
      ))}
    </Tag>
  )
}

// ─── Selection Overlay — posicionado FORA do artboard ────────
// Usa getBoundingClientRect do elemento real no DOM para posicionar handles

function SelectionOverlay({
  selectedElementId,
  containerRef,
  zoom,
  offsetX,
  offsetY,
  markInteraction,
  isPrimary,
}: {
  selectedElementId: string
  containerRef: React.RefObject<HTMLDivElement | null>
  zoom: number
  offsetX: number
  offsetY: number
  markInteraction: (type: 'idle' | 'resizing' | 'panning') => void
  isPrimary: boolean
}) {
  const updateElementStyles = useAppStore(s => s.updateElementStyles)
  const node = useAppStore(s => {
    if (!s.project) return null
    return findNodeById(s.project.root, selectedElementId)
  })
  const [rect, setRect] = useState<DOMRect | null>(null)

  // Recalcular posição do overlay quando muda seleção, zoom, offset ou estilo do nó
  useEffect(() => {
    const el = document.querySelector(`[data-editor-id="${selectedElementId}"]`) as HTMLElement | null
    if (!el || !containerRef.current) {
      setRect(null)
      return
    }

    function measure() {
      const elRect = el!.getBoundingClientRect()
      const containerRect = containerRef.current!.getBoundingClientRect()
      setRect(new DOMRect(
        elRect.x - containerRect.x,
        elRect.y - containerRect.y,
        elRect.width,
        elRect.height,
      ))
    }

    measure()

    // Re-medir em cada frame enquanto estiver selecionado (cobre resize em andamento)
    let raf: number
    function loop() {
      measure()
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [selectedElementId, containerRef, zoom, offsetX, offsetY])

  if (!rect || !node) return null

  const handleSize = 8
  const outlineWidth = 2

  const handles = [
    { dir: 'nw', cursor: 'nw-resize', style: { top: -handleSize / 2, left: -handleSize / 2 } },
    { dir: 'n', cursor: 'n-resize', style: { top: -handleSize / 2, left: rect.width / 2 - handleSize / 2 } },
    { dir: 'ne', cursor: 'ne-resize', style: { top: -handleSize / 2, left: rect.width - handleSize / 2 } },
    { dir: 'e', cursor: 'e-resize', style: { top: rect.height / 2 - handleSize / 2, left: rect.width - handleSize / 2 } },
    { dir: 'se', cursor: 'se-resize', style: { top: rect.height - handleSize / 2, left: rect.width - handleSize / 2 } },
    { dir: 's', cursor: 's-resize', style: { top: rect.height - handleSize / 2, left: rect.width / 2 - handleSize / 2 } },
    { dir: 'sw', cursor: 'sw-resize', style: { top: rect.height - handleSize / 2, left: -handleSize / 2 } },
    { dir: 'w', cursor: 'w-resize', style: { top: rect.height / 2 - handleSize / 2, left: -handleSize / 2 } },
  ]

  function handleResizeStart(direction: string) {
    return (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      markInteraction('resizing')

      const startX = e.clientX
      const startY = e.clientY
      const startW = parseInt(node!.styles.width || '0') || 0
      const startH = parseInt(node!.styles.height || '0') || 0

      function onMove(ev: MouseEvent) {
        const dx = (ev.clientX - startX) / zoom
        const dy = (ev.clientY - startY) / zoom
        const changes: Record<string, string> = {}

        if (direction.includes('e')) changes.width = `${Math.round(Math.max(16, startW + dx))}px`
        if (direction.includes('w')) changes.width = `${Math.round(Math.max(16, startW - dx))}px`
        if (direction.includes('s')) changes.height = `${Math.round(Math.max(16, startH + dy))}px`
        if (direction.includes('n')) changes.height = `${Math.round(Math.max(16, startH - dy))}px`

        updateElementStyles(selectedElementId, changes)
      }

      function onUp() {
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
        requestAnimationFrame(() => {
          markInteraction('idle')
        })
      }

      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    }
  }

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        top: rect.y,
        left: rect.x,
        width: rect.width,
        height: rect.height,
        zIndex: 9999,
        outline: `${outlineWidth}px solid #3b82f6`,
        outlineOffset: '0px',
      }}
    >
      {isPrimary && handles.map(h => (
        <div
          key={h.dir}
          className="absolute pointer-events-auto bg-white rounded-sm"
          style={{
            top: h.style.top,
            left: h.style.left,
            width: handleSize,
            height: handleSize,
            cursor: h.cursor,
            border: `${outlineWidth}px solid #3b82f6`,
          }}
          onMouseDown={handleResizeStart(h.dir)}
        />
      ))}
    </div>
  )
}

// Busca recursiva por id (local, sem import extra)
function findNodeById(node: ElementNode, id: string): ElementNode | null {
  if (node.id === id) return node
  for (const child of node.children) {
    const found = findNodeById(child, id)
    if (found) return found
  }
  return null
}
