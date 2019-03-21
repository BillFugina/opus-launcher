export interface IStorageState<T> {
  data: T
  storageValue: T | null | undefined
  isLoading: boolean
  isSaving: boolean
  error: any
}

export interface IStorageHookResult<T> extends IStorageState<T> {
  setData: (data: T) => void
}

export type StorageHook<T> = (storageKey: string, initialEntity: T) => IStorageHookResult<T>
