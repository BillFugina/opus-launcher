import { IStorage } from 'src/helpers/storage/types'
import { ChromeStorageLocal } from 'src/helpers/storage/chrome-storage-local'
import { ChromeStorageSync } from 'src/helpers/storage/chrome-storage-sync'
import { LocalStorage } from 'src/helpers/storage/local-storage'

export const hasChromeStorageSync = chrome && chrome.storage && chrome.storage.sync
export const hasChromeStorageLocal = chrome && chrome.storage && chrome.storage.local

export const GeneralStorage = hasChromeStorageSync
  ? ChromeStorageSync()
  : hasChromeStorageLocal
  ? ChromeStorageLocal()
  : LocalStorage()

// export const GeneralStorage: IStorage<any> = {
//   get: (keys: string[], callback: (items: { [key: string]: any }) => void) => {
//     hasChromeStorageSync
//       ? ChromeStorageSync.get(keys, callback)
//       : hasChromeStorageLocal
//       ? ChromeStorageLocal.get(keys, callback)
//       : LocalStorage.get(keys, callback)
//   },

//   set: (items: { [key: string]: any }, callback?: () => void) => {
//     hasChromeStorageSync
//       ? ChromeStorageSync.set(items, callback)
//       : hasChromeStorageLocal
//       ? ChromeStorageLocal.set(items, callback)
//       : LocalStorage.set(items, callback)
//   },

//   onChanged: hasChromeStorageSync
//     ? ChromeStorageSync.onChanged
//     : hasChromeStorageLocal
//     ? ChromeStorageLocal.onChanged
//     : LocalStorage.onChanged,

//   lastError: hasChromeStorageSync
//     ? ChromeStorageSync.lastError
//     : hasChromeStorageLocal
//     ? ChromeStorageLocal.lastError
//     : LocalStorage.lastError
// }
