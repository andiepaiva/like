import { useRef, useState, useCallback, useEffect } from 'react'
import { useAppStore } from '@/store'
import type { ElementNode } from '@/types'

export function Canvas() {
  const root = useAppStore(s => s.project?.root)
  const selectedElementId = useAppStore(s => s.selectedElementId)
  const setSelectedElementId = useAppStore(s => s.setSelectedElementId)
  const canvasSettings = useAppStore(s => s.canvasSettings)
  const updateCanvasSettings = useAppStore(s => s.updateCanvasSettings)

  const containerRef = useRef<HTMLDivElement>(null)
  const artboardRef = useRef<HTMLDivElement>(null)
  const isPanningRef = useRef(false)
  const panStart = useRef({ x: 0, y: 0 })
  const interactionRef = useRef<'idle' | 'resizing' | 'panning'>('idle')

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
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let spaceDown = false
    const offsetRef = { x: canvasSettings.offsetX, y: canvasSettings.offsetY }
    offsetRef.x = canvasSettings.offsetX
    offsetRef.y = canvasSettings.offsetY

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
        isPanningRef.current = false
        interactionRef.current = 'idle'
      }
    }

    function onMouseDown(e: MouseEvent) {
      if (spaceDown || e.button === 1) {
        isPanningRef.current = true
        interactionRef.current = 'panning'
        panStart.current = { x: e.clientX - offsetRef.x, y: e.clientY - offsetRef.y }
        container!.style.cursor = 'grabbing'
        e.preventDefault()
      }
    }

    function onMouseMove(e: MouseEvent) {
      if (!isPanningRef.current) return
      const newX = e.clientX - panStart.current.x
      const newY = e.clientY - panStart.current.y
      offsetRef.x = newX
      offsetRef.y = newY
      updateCanvasSettings({ offsetX: newX, offsetY: newY })
    }

    function onMouseUp() {
      if (isPanningRef.current) {
        isPanningRef.current = false
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
  }, [canvasSettings.offsetX, canvasSettings.offsetY, updateCanvasSettings])

  // Clique no fundo = deselecionar (APENAS se não acabamos de resize/pan)
  function handleBackgroundClick(e: React.MouseEvent) {
    // Se acabou de interagir (resize, pan), não deselecionar
    if (interactionRef.current !== 'idle') return

    const target = e.target as HTMLElement
    // Só deselecionar se clicou no container, no grid, ou no artboard background
    const isBackground = target === containerRef.current
      || target.dataset.canvasBg !== undefined
      || target.dataset.artboard !== undefined
    if (isBackground) {
      setSelectedElementId(null)
    }
  }

  // Marcar que uma interação está em andamento (chamado pelo SelectionOverlay)
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
      {/* Grid de fundo */}
      {canvasSettings.showGrid && (
        <div
          data-canvas-bg
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)`,
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
            selectedElementId={selectedElementId}
            zoom={canvasSettings.zoom}
            markInteraction={markInteraction}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Renderizar nó da árvore como elemento HTML real ─────────
// SEM wrapper <div> parasita — o elemento é renderizado diretamente

function RenderNode({
  node,
  selectedElementId,
  zoom,
  markInteraction,
}: {
  node: ElementNode
  selectedElementId: string | null
  zoom: number
  markInteraction: (type: 'idle' | 'resizing' | 'panning') => void
}) {
  const setSelectedElementId = useAppStore(s => s.setSelectedElementId)
  const updateElementStyles = useAppStore(s => s.updateElementStyles)
  const isSelected = selectedElementId === node.id
  const elementRef = useRef<HTMLElement>(null)

  if (!node.visible) return null

  const Tag = node.tag as keyof React.JSX.IntrinsicElements

  // Converter CSSProperties do nosso tipo para React.CSSProperties
  // Adicionar position: relative para que o overlay de seleção se posicione corretamente
  const styles: React.CSSProperties = {
    ...(node.styles as React.CSSProperties),
    position: (node.styles.position as React.CSSProperties['position']) || 'relative',
  }

  function handleMouseDown(e: React.MouseEvent) {
    if (node.locked) return
    e.stopPropagation()
    setSelectedElementId(node.id)
  }

  // Props do elemento
  const elementProps: Record<string, unknown> = {
    ref: elementRef,
    'data-editor-id': node.id,
    style: styles,
    onMouseDown: handleMouseDown,
    className: node.className?.join(' '),
  }

  // Atributos HTML
  for (const [key, value] of Object.entries(node.attributes)) {
    elementProps[key] = value
  }

  const isVoid = node.tag === 'img' || node.tag === 'input'

  return (
    <Tag {...(elementProps as Record<string, unknown>)}>
      {/* Selection overlay — dentro do próprio elemento */}
      {isSelected && (
        <SelectionOverlay
          node={node}
          zoom={zoom}
          markInteraction={markInteraction}
        />
      )}
      {!isVoid && node.content}
      {!isVoid && node.children.map(child => (
        <RenderNode
          key={child.id}
          node={child}
          selectedElementId={selectedElementId}
          zoom={zoom}
          markInteraction={markInteraction}
        />
      ))}
    </Tag>
  )
}

// ─── Overlay de seleção com handles ──────────────────────────

function SelectionOverlay({
  node,
  zoom,
  markInteraction,
}: {
  node: ElementNode
  zoom: number
  markInteraction: (type: 'idle' | 'resizing' | 'panning') => void
}) {
  const updateElementStyles = useAppStore(s => s.updateElementStyles)
  const startPos = useRef({ x: 0, y: 0, w: 0, h: 0 })

  function handleResizeStart(direction: string) {
    return (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      markInteraction('resizing')

      startPos.current = {
        x: e.clientX,
        y: e.clientY,
        w: parseInt(node.styles.width || '0') || 0,
        h: parseInt(node.styles.height || '0') || 0,
      }

      function onMove(ev: MouseEvent) {
        // Compensar zoom: mouse move de 10px com zoom 0.5 = 20px no canvas
        const dx = (ev.clientX - startPos.current.x) / zoom
        const dy = (ev.clientY - startPos.current.y) / zoom
        const changes: Record<string, string> = {}

        if (direction.includes('e')) changes.width = `${Math.round(Math.max(16, startPos.current.w + dx))}px`
        if (direction.includes('w')) changes.width = `${Math.round(Math.max(16, startPos.current.w - dx))}px`
        if (direction.includes('s')) changes.height = `${Math.round(Math.max(16, startPos.current.h + dy))}px`
        if (direction.includes('n')) changes.height = `${Math.round(Math.max(16, startPos.current.h - dy))}px`

        updateElementStyles(node.id, changes)
      }

      function onUp() {
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
        // Delay para evitar que o click que vem após mouseup deselecione
        requestAnimationFrame(() => {
          markInteraction('idle')
        })
      }

      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    }
  }

  // Tamanho dos handles compensado pelo zoom (sempre 8px na tela)
  const handleSize = 8 / zoom

  const handles = [
    { dir: 'nw', cursor: 'nw-resize', style: { top: 0, left: 0, transform: 'translate(-50%, -50%)' } },
    { dir: 'n', cursor: 'n-resize', style: { top: 0, left: '50%', transform: 'translate(-50%, -50%)' } },
    { dir: 'ne', cursor: 'ne-resize', style: { top: 0, right: 0, transform: 'translate(50%, -50%)' } },
    { dir: 'e', cursor: 'e-resize', style: { top: '50%', right: 0, transform: 'translate(50%, -50%)' } },
    { dir: 'se', cursor: 'se-resize', style: { bottom: 0, right: 0, transform: 'translate(50%, 50%)' } },
    { dir: 's', cursor: 's-resize', style: { bottom: 0, left: '50%', transform: 'translate(-50%, 50%)' } },
    { dir: 'sw', cursor: 'sw-resize', style: { bottom: 0, left: 0, transform: 'translate(-50%, 50%)' } },
    { dir: 'w', cursor: 'w-resize', style: { top: '50%', left: 0, transform: 'translate(-50%, -50%)' } },
  ]

  // Outline width compensado pelo zoom
  const outlineWidth = 2 / zoom

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        zIndex: 9999,
        outline: `${outlineWidth}px solid #3b82f6`,
        outlineOffset: '0px',
      }}
    >
      {handles.map(h => (
        <div
          key={h.dir}
          className="absolute pointer-events-auto bg-white rounded-sm"
          style={{
            ...h.style,
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
