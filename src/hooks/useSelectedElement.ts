import type { ElementNode } from '@/types'
import { useAppStore } from '@/store'
import { findElementById } from '@/utils'

export function useSelectedElement(): ElementNode | null {
  const project = useAppStore(s => s.project)
  const selectedElementId = useAppStore(s => s.selectedElementId)
  if (!project || !selectedElementId) return null
  return findElementById(project.root, selectedElementId)
}
