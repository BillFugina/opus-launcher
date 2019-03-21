import { useEffect, useReducer, useRef } from 'react'
import { DeepCompare } from '@inmotionnow/utilities'
import { IStorageHookResult, IStorageState } from 'src/types/storageHook'
import { GeneralStorage } from 'src/helpers/storage/helpers'
import { StorageEventChanges } from 'src/helpers/storage/types'

interface IStorageAction {
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

type IStorageReducer<T> = (state: IStorageState<T>, action: IStorageAction) => IStorageState<T>

const reducer: IStorageReducer<any> = <T>(state: IStorageState<T>, action: IStorageAction) => {
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

export const useStorage = <TEntity>(storageKey: string, initialEntity: TEntity) => {
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
    dispatch({ type: 'get' })

    GeneralStorage.get([storageKey], result => {
      if (!GeneralStorage.lastError) {
        const newData = result[storageKey]
        if (newData && !DeepCompare.equal(state.data, newData)) {
          dispatch({ type: 'get-succeeded', payload: newData })
        } else {
          dispatch({ type: 'value-not-in-storage' })
        }
      } else {
        dispatch({ type: 'get-failed', payload: GeneralStorage.lastError })
      }
    })
  }, [])

  useEffect(() => {
    if (state.storageValue !== undefined && !DeepCompare.equal(state.data, state.storageValue)) {
      dispatch({ type: 'save' })

      GeneralStorage.set({ [storageKey]: state.data }, () => {
        if (!GeneralStorage.lastError) {
          dispatch({ type: 'save-succeeded', payload: state.data })
        } else {
          dispatch({ type: 'save-failed', payload: GeneralStorage.lastError })
        }
      })
    }
  }, [state.data])

  const storageCallback = (changes: StorageEventChanges) => {
    const dataChange = changes[storageKey]
    if (dataChange && !DeepCompare.equal(state.data, dataChange.newValue)) {
      dispatch({ type: 'storage-changed', payload: dataChange.newValue })
    }
  }

  useEffect(() => {
    GeneralStorage.onChanged.addListener(storageCallback)
    return () => {
      GeneralStorage.onChanged.removeListener(storageCallback)
    }
  })

  const setData = (data: TEntity) => {
    dispatch({ type: 'set', payload: data })
  }

  const result: IStorageHookResult<TEntity> = { ...state, setData }

  return result
}
