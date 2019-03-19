interface EntityHookResult<T> {
  data: T[]
  loading: boolean
  error: boolean
  fetch: (query?: string) => void
}
export type EntityHook<T> = () => EntityHookResult<T>
