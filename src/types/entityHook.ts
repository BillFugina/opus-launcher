export interface EntityHookResult<TEntity> {
  data: TEntity[]
  loading: boolean
  error: boolean
  query: (queryString?: string) => void
  add: (entity: TEntity) => void
}
export type EntityHook<T> = () => EntityHookResult<T>
