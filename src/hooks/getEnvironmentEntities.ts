import React, { Component, useState, useCallback, useReducer } from 'react'
import { Environment } from 'src/entities/environment'
import { EntityHook } from 'src/types/entityHook'

const environments: Environment[] = [
  { id: 'localhost', name: 'localhost' },
  { id: 'develop', name: 'develop' },
  { id: 'staging', name: 'staging' }
]

export const useGetEnvironmentEntities: EntityHook<Environment> = () => {
  const [data, setData] = useState<Environment[]>([])
  const [loading, setIsLoading] = useState(false)
  const [error, setIsError] = useState(false)

  const fetch = () => {
    setData(environments)
  }

  return { data, loading, error, fetch }
}
