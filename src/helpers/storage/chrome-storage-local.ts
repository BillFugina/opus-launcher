import { IStorage } from 'src/helpers/storage/types'

export const ChromeStorageLocal = <T = any>(): IStorage<T> => ({
  get: (keys: string[], callback: (items: { [key: string]: any }) => void) => {
    chrome.storage.local.get(keys, callback)
  },

  set: (items: { [key: string]: any }, callback?: () => void) => {
    chrome.storage.local.set(items, callback)
  },

  onChanged: chrome.storage.onChanged,
  lastError: chrome.runtime.lastError
})
