import React, { Component, useState, useCallback, useReducer } from 'react'
import { Environment } from 'src/entities/environment'
import { EntityHook } from 'src/types/entityHook'

const environments: Environment[] = [
  { id: 'localhost', name: 'localhost' },
  { id: 'develop', name: 'develop' },
  { id: 'sandbox', name: 'sandbox' },
  { id: 'staging', name: 'staging' },
  { id: 'demo', name: 'demo' },
  { id: 'production', name: 'production' }
]

export const useGetEnvironmentEntities: EntityHook<Environment> = () => {
  const [data, setData] = useState<Environment[]>([])
  const [loading, setIsLoading] = useState(false)
  const [error, setIsError] = useState(false)

  const query = () => {
    setData(environments)
  }

  const add = (environment: Environment) => {}

  return { data, loading, error, query, add }
}
