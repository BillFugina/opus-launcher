import React, { useState, useEffect, useCallback, useReducer, useRef } from 'react'
import { EntityHook } from 'src/types/entityHook'
import { string } from 'prop-types'
import { isChromeExtension } from 'src/helpers/is-chrome-extension'
import { ChromeStorageEventChanges } from 'src/types/chrome-types'
import { DeepCompare } from '@inmotionnow/utilities'
import { StorageHook, IStorageHookResult, IStorageState } from 'src/types/storageHook'

type QueryPredicate<TEntity> = (entity: TEntity) => boolean

const initialState: IStorageState<any> = {
  data: null,
  storageValue: undefined,
  isLoading: false,
  isSaving: false,
  error: false
}

interface IChromeStorageAction {
  type:
    | 'initialize'
    | 'set'
    | 'get'
    | 'get-succeeded'
    | 'get-failed'
    | 'value-not-in-storage'
    | 'save'
    | 'save-succeeded'
    | 'save-failed'
    | 'storage-changed'
    | 'error'
  payload?: any
}

type IChromeStorageReducer<T> = (state: IStorageState<T>, action: IChromeStorageAction) => IStorageState<T>

const reducer: IChromeStorageReducer<any> = <T>(state: IStorageState<T>, action: IChromeStorageAction) => {
  switch (action.type) {
    case 'initialize':
      return { ...state, data: action.payload, storageValue: undefined }
    case 'set':
      return { ...state, data: action.payload }
    case 'get':
      return { ...state, isLoading: true }
    case 'get-succeeded':
      return { ...state, data: action.payload, storageValue: action.payload, isLoading: false }
    case 'get-failed':
      return { ...state, isLoading: false, storageValue: null, error: action.payload }
    case 'value-not-in-storage':
      return { ...state, storageValue: null, isLoading: false }
    case 'save':
      return { ...state, isSaving: true }
    case 'save-succeeded':
      return { ...state, isSaving: false, storageValue: action.payload }
    case 'save-failed':
      return { ...state, isSaving: false, error: action.payload }
    case 'storage-changed':
      return { ...state, data: action.payload, storageValue: action.payload }
    case 'error':
      return { ...state, error: action.payload }
    default:
      return state
  }
}

export const useChromeStorage = <TEntity>(storageKey: string, initialEntity: TEntity) => {
  const initialData = useRef<IStorageState<TEntity>>({
    data: initialEntity,
    storageValue: undefined,
    isLoading: false,
    isSaving: false,
    error: false
  })

  const [state, dispatch] = useReducer(reducer, initialData.current)

  useEffect(() => {
    dispatch({ type: 'initialize', payload: initialEntity })
  }, [])

  useEffect(() => {
    if (isChromeExtension()) {
      console.log(`getting from chrome storage`)
      dispatch({ type: 'get' })

      chrome.storage.sync.get([storageKey], result => {
        console.log(`received from chrome storage`, result)
        if (!chrome.runtime.lastError) {
          const newData = result[storageKey]
          if (newData && !DeepCompare.equal(state.data, newData)) {
            dispatch({ type: 'get-succeeded', payload: newData })
          } else {
            dispatch({ type: 'value-not-in-storage' })
          }
        } else {
          console.log(`error receiving from chrome storage`, chrome.runtime.lastError)
          dispatch({ type: 'get-failed', payload: chrome.runtime.lastError })
        }
      })
    } else {
      console.log(`getting from local storage`)
      try {
        dispatch({ type: 'get' })
        const storedValue = window.localStorage.getItem(storageKey)
        const value = storedValue ? JSON.parse(storedValue) : initialEntity
        if (value && !DeepCompare.equal(state.data, value)) {
          dispatch({ type: 'get-succeeded', payload: value })
        } else {
          dispatch({ type: 'value-not-in-storage' })
        }
      } catch (error) {
        dispatch({ type: 'get-failed', payload: error })
      }
    }
  }, [])

  useEffect(() => {
    console.log(`state.data has changed`)

    const isChrome = isChromeExtension()
    const storageName = isChrome ? 'chrome' : 'local'

    if (state.storageValue === undefined) {
      console.log(`state.storageValue is undefined`)
    } else if (!DeepCompare.equal(state.data, state.storageValue)) {
      console.log(`saving to ${storageName} storage`, state.data)

      dispatch({ type: 'save' })

      if (isChrome) {
        chrome.storage.sync.set({ [storageKey]: state.data }, () => {
          if (!chrome.runtime.lastError) {
            dispatch({ type: 'save-succeeded', payload: state.data })
          } else {
            dispatch({ type: 'save-failed', payload: chrome.runtime.lastError })
          }
        })
      } else {
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(state.data))
          dispatch({ type: 'save-succeeded', payload: state.data })
        } catch (error) {
          dispatch({ type: 'save-failed', payload: error })
        }
      }
    } else {
      console.log(`${storageName} storage already has new value`)
    }
  }, [state.data])

  const storageCallback = (changes: ChromeStorageEventChanges, namespace: string) => {
    console.log(`chrome storage changed`, changes, state.data)
    const dataChange = changes[storageKey]
    if (dataChange && !DeepCompare.equal(state.data, dataChange.newValue)) {
      dispatch({ type: 'storage-changed', payload: dataChange.newValue })
      console.log(`updating state`)
    }
    {
      console.log(`state already has new value`)
    }
  }

  useEffect(() => {
    if (isChromeExtension()) {
      chrome.storage.onChanged.addListener(storageCallback)
      return () => {
        chrome.storage.onChanged.removeListener(storageCallback)
      }
    }
  })

  const setData = (data: TEntity) => {
    dispatch({ type: 'set', payload: data })
  }

  const result: IStorageHookResult<TEntity> = { ...state, setData }

  return result
}
