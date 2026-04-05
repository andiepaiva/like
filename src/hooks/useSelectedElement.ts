import type { ElementNode } from '@/types'
import { useAppStore } from '@/store'
import { findElementById } from '@/utils'

/**
 * Retorna o primeiro elemento selecionado (para o PropertiesPanel quando 1 selecionado)
 */
export function useSelectedElement(): ElementNode | null {
  const project = useAppStore(s => s.project)
  const selectedElementIds = useAppStore(s => s.selectedElementIds)
  if (!project || selectedElementIds.length === 0) return null
  return findElementById(project.root, selectedElementIds[0])
}

/**
 * Retorna todos os elementos selecionados
 */
export function useSelectedElements(): ElementNode[] {
  const project = useAppStore(s => s.project)
  const selectedElementIds = useAppStore(s => s.selectedElementIds)
  if (!project || selectedElementIds.length === 0) return []
  return selectedElementIds
    .map(id => findElementById(project.root, id))
    .filter((el): el is ElementNode => el !== null)
}
