import { openDB, type IDBPDatabase } from 'idb'
import type { Project } from '@/types'

const DB_NAME = 'like-editor'
const DB_VERSION = 1
const STORE_NAME = 'projects'
const CURRENT_KEY = 'current'

let dbPromise: Promise<IDBPDatabase> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME)
        }
      },
    })
  }
  return dbPromise
}

export async function saveProject(project: Project): Promise<void> {
  const db = await getDB()
  await db.put(STORE_NAME, project, CURRENT_KEY)
}

export async function loadProject(): Promise<Project | null> {
  const db = await getDB()
  const project = await db.get(STORE_NAME, CURRENT_KEY)
  return (project as Project) ?? null
}
