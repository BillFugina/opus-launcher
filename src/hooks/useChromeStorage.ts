import React, { useState, useEffect, useCallback } from 'react'
import { EntityHook } from 'src/types/entityHook'
import { string } from 'prop-types'

type QueryPredicate<TEntity> = (entity: TEntity) => boolean

type ChromeStorageEventChanges = {
  [key: string]: chrome.storage.StorageChange
}

export const useChromeStorage = <TEntity>(storageKey: string, initialEntity: TEntity) => {
  const [data, setData] = useState<TEntity>(initialEntity)
  const [storageValue, setStorageValue] = useState<TEntity | null>()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [error, setError] = useState<string | false>(false)

  useEffect(() => {
    console.log(`getting from chrome storage`)
    if (chrome.storage) {
      setIsLoading(true)
      chrome.storage.sync.get([storageKey], result => {
        console.log(`received from chrome storage`, result)
        console.log(`storageKey`, storageKey)

        if (!chrome.runtime.lastError) {
          const newData = result[storageKey]
          console.log(`data`, data)
          console.log(`newData`, newData)
          if (newData && data !== newData) {
            setData(newData)
            setStorageValue(newData)
          }
        } else {
          console.log(`error receiving from chrome storage`, chrome.runtime.lastError)
          setError(chrome.runtime.lastError.message || 'unknown error')
          setStorageValue(null)
        }

        setIsLoading(false)
      })
    } else {
      setError(`chrome.storage not available: get`)
    }
  }, [])

  useEffect(() => {
    if (storageValue !== undefined) {
      console.log(`saving to chrome storage`, data)
      if (chrome.storage) {
        setIsSaving(true)
        chrome.storage.sync.set({ [storageKey]: data }, () => {
          if (chrome.runtime.lastError) {
            setError(chrome.runtime.lastError.message || 'unknown error')
          }
          setIsSaving(false)
        })
      } else {
        console.log(`chrome.storage not available: set`)
        setError(`chrome.storage not available: set`)
      }
    }
  }, [data])

  const storageCallback = useCallback((changes: ChromeStorageEventChanges, namespace: string) => {
    console.log(`chrome storage changed`, changes)
    const dataChange = changes[storageKey]
    if (dataChange && data !== dataChange.newValue) {
      setData(dataChange.newValue)
    }
  }, [])

  useEffect(() => {
    console.log(`setting chrome storage listener`)
    if (chrome.storage) {
      chrome.storage.onChanged.addListener(storageCallback)
      return () => {
        chrome.storage.onChanged.removeListener(storageCallback)
      }
    } else {
      setError(`chrome storage not available: addListener`)
    }
  }, [])

  return { data, setData, isLoading, isSaving, error }
}

const fetchChromeStorage = <TResult>(storageKey: string) => {
  return new Promise<TResult>((resolve, reject) => {
    try {
      chrome.storage.sync.get([storageKey], result => {
        resolve(result[storageKey])
      })
    } catch (error) {
      reject(error)
    }
  })
}

const setChromeStorage = <TEntity>(storageKey: string, value: TEntity) => {
  return new Promise<void>((resolve, reject) => {
    try {
      chrome.storage.sync.set({ [storageKey]: value }, () => {
        resolve()
      })
    } catch (error) {
      reject(error)
    }
  })
}
