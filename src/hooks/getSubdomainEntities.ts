import { useState, useEffect } from 'react'
import { Subdomain } from 'src/entities/subdomain'
import { EntityHook } from 'src/types/entityHook'
import { useStorage } from 'src/hooks/useStorage'

const defaultSubdomains: Subdomain[] = [{ id: 'opus', name: 'opus' }]

export const useGetSubdomainEntities: EntityHook<Subdomain> = () => {
  const subdomainStorage = useStorage<Subdomain[]>('subdomains', defaultSubdomains)

  const [filter, setFilter] = useState<string>('')
  const [data, setData] = useState<Subdomain[]>([])

  useEffect(() => {
    const result = filter ? subdomainStorage.data.filter(sd => sd.name.includes(filter)) : subdomainStorage.data
    setData(result)
  }, [filter, subdomainStorage.data])

  const query = (query?: string) => {
    setFilter(query || '')
  }

  const add = (subdomain: Subdomain) => {
    const subdomains = [...subdomainStorage.data, subdomain]
    subdomainStorage.setData(subdomains)
  }

  return {
    data,
    loading: subdomainStorage.isLoading,
    error: subdomainStorage.error,
    query,
    add
  }
}
