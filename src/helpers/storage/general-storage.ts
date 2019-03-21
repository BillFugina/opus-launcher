import { IStorage } from 'src/helpers/storage/types'
import { ChromeStorageLocal } from 'src/helpers/storage/chrome-storage-local'
import { ChromeStorageSync } from 'src/helpers/storage/chrome-storage-sync'
import { LocalStorage } from 'src/helpers/storage/local-storage'

export const hasChromeStorageSync = chrome != null && chrome.storage != null && chrome.storage.sync != null
export const hasChromeStorageLocal = chrome != null && chrome.storage != null && chrome.storage.local != null

export const GeneralStorage = hasChromeStorageSync
  ? ChromeStorageSync()
  : hasChromeStorageLocal
  ? ChromeStorageLocal()
  : LocalStorage()
