import type { ElementNode } from '@/types'

export function findElementById(root: ElementNode, id: string): ElementNode | null {
  if (root.id === id) return root
  for (const child of root.children) {
    const found = findElementById(child, id)
    if (found) return found
  }
  return null
}

export function findParentOf(root: ElementNode, id: string): ElementNode | null {
  for (const child of root.children) {
    if (child.id === id) return root
    const found = findParentOf(child, id)
    if (found) return found
  }
  return null
}

export function updateNodeInTree(
  root: ElementNode,
  id: string,
  updater: (node: ElementNode) => ElementNode,
): ElementNode {
  if (root.id === id) return updater(root)
  return {
    ...root,
    children: root.children.map(child => updateNodeInTree(child, id, updater)),
  }
}

export function removeNodeFromTree(root: ElementNode, id: string): ElementNode {
  return {
    ...root,
    children: root.children
      .filter(child => child.id !== id)
      .map(child => removeNodeFromTree(child, id)),
  }
}

export function insertNodeInTree(
  root: ElementNode,
  parentId: string,
  node: ElementNode,
  index?: number,
): ElementNode {
  if (root.id === parentId) {
    const children = [...root.children]
    if (index !== undefined && index >= 0 && index <= children.length) {
      children.splice(index, 0, node)
    } else {
      children.push(node)
    }
    return { ...root, children }
  }
  return {
    ...root,
    children: root.children.map(child => insertNodeInTree(child, parentId, node, index)),
  }
}

export function getPathToElement(root: ElementNode, id: string): ElementNode[] {
  if (root.id === id) return [root]
  for (const child of root.children) {
    const path = getPathToElement(child, id)
    if (path.length > 0) return [root, ...path]
  }
  return []
}

export function cloneSubtree(node: ElementNode, idGenerator: () => string): ElementNode {
  return {
    ...node,
    id: idGenerator(),
    meta: {
      ...node.meta,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    children: node.children.map(child => cloneSubtree(child, idGenerator)),
  }
}
