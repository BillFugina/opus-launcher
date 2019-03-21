import React, { useState, useEffect, useCallback } from 'react'
import { EntityHook } from 'src/types/entityHook'
import { string } from 'prop-types'
import { isChromeExtension } from 'src/helpers/is-chrome-extension'
import { ChromeStorageEventChanges } from 'src/types/chrome-types'
import { DeepCompare } from '@inmotionnow/utilities'

type QueryPredicate<TEntity> = (entity: TEntity) => boolean

export const useChromeStorage = <TEntity>(storageKey: string, initialEntity: TEntity) => {
  const [data, setData] = useState<TEntity>(initialEntity)
  const [storageValue, setStorageValue] = useState<TEntity | null>()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [error, setError] = useState<string | false>(false)

  useEffect(() => {
    console.log(`getting from chrome storage`)
    if (isChromeExtension()) {
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
          }
          setStorageValue(newData || null)
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
    console.log(`data change effect`, storageValue)
    if (storageValue !== undefined) {
      console.log(`saving to chrome storage`, data)
      if (isChromeExtension()) {
        setIsSaving(true)
        chrome.storage.sync.set({ [storageKey]: data }, () => {
          if (chrome.runtime.lastError) {
            setError(chrome.runtime.lastError.message || 'unknown error')
          }
          setIsSaving(false)
          setStorageValue(data)
        })
      } else {
        console.log(`chrome.storage not available: set`)
        setError(`chrome.storage not available: set`)
      }
    }
  }, [data])

  const storageCallback = (changes: ChromeStorageEventChanges, namespace: string) => {
    console.log(`chrome storage changed`, changes, data)
    const dataChange = changes[storageKey]
    if (dataChange && !DeepCompare.equal(data, dataChange.newValue)) {
      console.log(`updating state`)
      setData(dataChange.newValue)
      setStorageValue(dataChange.newValue)
    }
    {
      console.log(`state already has new value`)
    }
  }

  useEffect(() => {
    console.log(`setting chrome storage listener`)
    if (isChromeExtension()) {
      chrome.storage.onChanged.addListener(storageCallback)
      return () => {
        chrome.storage.onChanged.removeListener(storageCallback)
      }
    } else {
      setError(`chrome storage not available: addListener`)
    }
  })

  return { data, setData, isLoading, isSaving, error }
}
