export interface IStorage<T = any> {
  get: (keys: string[], callback: (items: { [key: string]: any }) => void) => void
  set: (items: { [key: string]: any }, callback?: () => void) => void

  onChanged: IStorageChangedEvent<T>
  lastError: ILastError | undefined
}

export interface IStorageEvent<TCallback extends Function> {
  addListener(callback: TCallback): void
  removeListener(callback: TCallback): void
}

export interface IStorageChangedEvent<T = any>
  extends IStorageEvent<(changes: { [key: string]: IStorageChange<T> }, areaName: string) => void> {}

export interface IStorageChange<T = any> {
  newValue?: T
  oldValue?: T
}

export interface ILastError {
  message?: string
}

export type StorageEventChanges<T = any> = { [key: string]: IStorageChange<T> }
