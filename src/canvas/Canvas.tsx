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
  const interactionRef = useRef<'idle' | 'resizing' | 'panning' | 'dragging'>('idle')

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

  // Clique no fundo = deselecionar — usa onClick (não mouseDown) para evitar race com pan
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

  const markInteraction = useCallback((type: 'idle' | 'resizing' | 'panning' | 'dragging') => {
    interactionRef.current = type
  }, [])

  if (!root) return null

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-hidden relative bg-editor-bg"
      onWheel={handleWheel}
      onClick={handleBackgroundClick}
    >
      {/* Grid de fundo — linhas sutis (desligado por padrão, ativável pelo menu Exibir) */}
      {canvasSettings.showGrid && (
        <div
          data-canvas-bg
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, color-mix(in srgb, var(--color-editor-border) 30%, transparent) 1px, transparent 1px),
              linear-gradient(to bottom, color-mix(in srgb, var(--color-editor-border) 30%, transparent) 1px, transparent 1px)
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
            onSelect={setSelectedElementIds}
            onToggle={toggleSelectedElement}
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
// Callbacks recebidas do pai — sem subscribe no store por nó

function RenderNode({
  node,
  selectedElementIds,
  onSelect,
  onToggle,
}: {
  node: ElementNode
  selectedElementIds: string[]
  onSelect: (ids: string[]) => void
  onToggle: (id: string) => void
}) {
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
    if (e.ctrlKey || e.metaKey || e.shiftKey) {
      onToggle(node.id)
    } else {
      onSelect([node.id])
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
          onSelect={onSelect}
          onToggle={onToggle}
        />
      ))}
    </Tag>
  )
}

// ─── Selection Overlay — posicionado FORA do artboard ────────
// Usa getBoundingClientRect + ResizeObserver para posicionar handles
// Suporta drag-to-move e resize com preservação de origem

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
  markInteraction: (type: 'idle' | 'resizing' | 'panning' | 'dragging') => void
  isPrimary: boolean
}) {
  const pushHistory = useAppStore(s => s.pushHistory)
  const updateSilent = useAppStore(s => s.updateElementStylesSilent)
  const node = useAppStore(s => {
    if (!s.project) return null
    return findNodeById(s.project.root, selectedElementId)
  })
  const [rect, setRect] = useState<DOMRect | null>(null)

  // ─── Medir posição do elemento real no DOM ─────────────────
  const measure = useCallback(() => {
    const el = document.querySelector(`[data-editor-id="${selectedElementId}"]`) as HTMLElement | null
    if (!el || !containerRef.current) { setRect(null); return }
    const elRect = el.getBoundingClientRect()
    const containerRect = containerRef.current.getBoundingClientRect()
    setRect(new DOMRect(
      elRect.x - containerRect.x,
      elRect.y - containerRect.y,
      elRect.width,
      elRect.height,
    ))
  }, [selectedElementId, containerRef])

  // Re-medir quando zoom/offset mudam
  useEffect(() => { measure() }, [measure, zoom, offsetX, offsetY])

  // ResizeObserver + MutationObserver para re-medir quando o elemento muda
  useEffect(() => {
    const el = document.querySelector(`[data-editor-id="${selectedElementId}"]`) as HTMLElement | null
    if (!el) return

    const ro = new ResizeObserver(() => measure())
    ro.observe(el)

    const mo = new MutationObserver(() => measure())
    mo.observe(el, { attributes: true, attributeFilter: ['style'] })

    return () => { ro.disconnect(); mo.disconnect() }
  }, [selectedElementId, measure])

  if (!rect || !node) return null

  const handleSize = 8

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

  // ─── Resize com preservação de origem ──────────────────────
  function handleResizeStart(direction: string) {
    return (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      markInteraction('resizing')

      // Salvar histórico UMA VEZ antes do resize
      pushHistory()

      const startX = e.clientX
      const startY = e.clientY
      const startW = parseInt(node!.styles.width || '0') || 0
      const startH = parseInt(node!.styles.height || '0') || 0
      const startLeft = parseInt(node!.styles.left || '0') || 0
      const startTop = parseInt(node!.styles.top || '0') || 0

      function onMove(ev: MouseEvent) {
        const dx = (ev.clientX - startX) / zoom
        const dy = (ev.clientY - startY) / zoom
        const changes: Record<string, string> = {}

        // Resize para a direita: só atualiza width
        if (direction.includes('e')) {
          changes.width = `${Math.round(Math.max(16, startW + dx))}px`
        }
        // Resize para a esquerda: atualiza width E left (preserva borda direita)
        if (direction.includes('w')) {
          const newW = Math.max(16, startW - dx)
          changes.width = `${Math.round(newW)}px`
          if (node!.styles.position === 'absolute') {
            changes.left = `${Math.round(startLeft + (startW - newW))}px`
          }
        }
        // Resize para baixo: só atualiza height
        if (direction.includes('s')) {
          changes.height = `${Math.round(Math.max(16, startH + dy))}px`
        }
        // Resize para cima: atualiza height E top (preserva borda inferior)
        if (direction.includes('n')) {
          const newH = Math.max(16, startH - dy)
          changes.height = `${Math.round(newH)}px`
          if (node!.styles.position === 'absolute') {
            changes.top = `${Math.round(startTop + (startH - newH))}px`
          }
        }

        // Silent — sem push no histórico
        updateSilent(selectedElementId, changes)
      }

      function onUp() {
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
        requestAnimationFrame(() => markInteraction('idle'))
      }

      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    }
  }

  // ─── Drag para mover ──────────────────────────────────────
  function handleDragStart(e: React.MouseEvent) {
    // Não interceptar handles de resize
    if ((e.target as HTMLElement).dataset.resizeHandle) return
    e.stopPropagation()
    e.preventDefault()
    markInteraction('dragging')

    // Salvar histórico UMA VEZ antes do drag
    pushHistory()

    const startX = e.clientX
    const startY = e.clientY
    const startLeft = parseInt(node!.styles.left || '0') || 0
    const startTop = parseInt(node!.styles.top || '0') || 0

    // Se o elemento não é absolute, torná-lo
    // Decisão de design: drag só funciona com position:absolute.
    // Mutation é silenciosa (updateSilent) pois já foi feito pushHistory() no mousedown.
    // Undo restaura ao estado pré-drag, inclusive a posição original.
    if (node!.styles.position !== 'absolute') {
      updateSilent(selectedElementId, { position: 'absolute', left: '0px', top: '0px' })
    }

    function onMove(ev: MouseEvent) {
      const dx = (ev.clientX - startX) / zoom
      const dy = (ev.clientY - startY) / zoom
      updateSilent(selectedElementId, {
        left: `${Math.round(startLeft + dx)}px`,
        top: `${Math.round(startTop + dy)}px`,
      })
    }

    function onUp() {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      requestAnimationFrame(() => markInteraction('idle'))
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
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
        outline: '2px solid #3b82f6',
        outlineOffset: '0px',
      }}
    >
      {/* Área central arrastável para mover */}
      {isPrimary && (
        <div
          className="absolute inset-0 pointer-events-auto cursor-move"
          onMouseDown={handleDragStart}
        />
      )}
      {/* Handles de resize */}
      {isPrimary && handles.map(h => (
        <div
          key={h.dir}
          data-resize-handle
          className="absolute pointer-events-auto bg-white rounded-sm"
          style={{
            top: h.style.top,
            left: h.style.left,
            width: handleSize,
            height: handleSize,
            cursor: h.cursor,
            border: '2px solid #3b82f6',
            zIndex: 1,
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
