import React, { Component, useState, useCallback, useReducer, useEffect } from 'react'
import { Subdomain } from 'src/entities/subdomain'
import { EntityHook } from 'src/types/entityHook'
import { useChromeStorage } from 'src/hooks/useChromeStorage'
import { useLocalStorage } from 'src/hooks/useLocalStorage'

const defaultSubdomains: Subdomain[] = [{ id: 'opus', name: 'opus' }]

export const useGetSubdomainEntities: EntityHook<Subdomain> = () => {
  const subdomainStorage = useChromeStorage('subdomains', defaultSubdomains)

  const [filter, setFilter] = useState<string>('')
  const [data, setData] = useState<Subdomain[]>([])

  const [loading, setIsLoading] = useState(false)
  const [error, setIsError] = useState(false)

  useEffect(() => {
    const result = filter ? subdomainStorage.data.filter(sd => sd.name.includes(filter)) : subdomainStorage.data
    setData(result)
  }, [filter])

  const query = (query?: string) => {
    setFilter(query || '')
  }

  const add = (subdomain: Subdomain) => {
    const subdomains = [...subdomainStorage.data, subdomain]
    console.log(`setting subdomain storage`, subdomains)
    subdomainStorage.setData(subdomains)
  }

  return { data, loading, error, query, add }
}
