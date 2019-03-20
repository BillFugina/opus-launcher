import React, { Component, useState, useCallback, useReducer, useEffect } from 'react'
import { Subdomain } from 'src/entities/subdomain'
import { EntityHook } from 'src/types/entityHook'
import { useChromeStorage } from 'src/hooks/useChromeStorage'

const subdomains: Subdomain[] = [{ id: 'opus', name: 'opus' }, { id: 'bfugina', name: 'bfugina' }]

export const useGetSubdomainEntities: EntityHook<Subdomain> = () => {
  const [data, setData] = useState<Subdomain[]>([])
  const [loading, setIsLoading] = useState(false)
  const [error, setIsError] = useState(false)

  const subdomainStorage = useChromeStorage('subdomain', 'version 12')

  console.log(`subdomainStorage`, subdomainStorage)

  const fetch = (query?: string) => {
    const result = query ? subdomains.filter(sd => sd.name.includes(query)) : subdomains
    setData(result)
  }

  useEffect(() => {}, [])

  return { data, loading, error, fetch }
}
