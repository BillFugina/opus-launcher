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
