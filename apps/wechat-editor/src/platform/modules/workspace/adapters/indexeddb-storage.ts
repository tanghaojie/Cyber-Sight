import { storageName } from '../../../app.config'
import type { DraftStorage, WorkspaceDraft } from '../draft-storage.port'

export function createDraftStorage(): DraftStorage {
  let database: Promise<IDBDatabase> | undefined
  function open(): Promise<IDBDatabase> {
    database ??= new Promise(function connect(resolve, reject) {
      const request = indexedDB.open(storageName, 1)
      request.onupgradeneeded = function upgrade() {
        request.result.createObjectStore('drafts')
      }
      request.onsuccess = function connected() {
        request.result.onversionchange = function close() {
          request.result.close()
        }
        resolve(request.result)
      }
      request.onerror = function failed() {
        reject(request.error)
      }
      request.onblocked = function blocked() {
        reject(new Error('草稿库被其他页面占用，请关闭旧页面后重试。'))
      }
    })
    return database
  }
  async function load(): Promise<unknown> {
    const db = await open()
    return new Promise(function read(resolve, reject) {
      const transaction = db.transaction('drafts', 'readonly')
      const request = transaction.objectStore('drafts').get('current')
      transaction.oncomplete = function completed() {
        resolve(request.result)
      }
      transaction.onerror = function failed() {
        reject(transaction.error)
      }
      transaction.onabort = function aborted() {
        reject(transaction.error)
      }
    })
  }
  async function save(draft: WorkspaceDraft): Promise<void> {
    const db = await open()
    return new Promise(function write(resolve, reject) {
      const transaction = db.transaction('drafts', 'readwrite')
      transaction.objectStore('drafts').put(draft, 'current')
      transaction.oncomplete = function completed() {
        resolve()
      }
      transaction.onerror = function failed() {
        reject(transaction.error)
      }
      transaction.onabort = function aborted() {
        reject(transaction.error)
      }
    })
  }
  return { load, save }
}
