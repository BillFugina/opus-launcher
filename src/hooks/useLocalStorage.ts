import React, { useState, useEffect, useCallback } from 'react'

export const useLocalStorage = <T>(storageKey: string, initialValue: T) => {
  const [value, setValue] = useState<T>(initialValue)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<any>(false)

  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(storageKey)
      const value = storedValue ? JSON.parse(storedValue) : initialValue
      setValue(value)
    } catch (error) {
      setError(error)
    }
  }, [])

  const setData = (data: T) => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(data))
      setValue(data)
    } catch (error) {
      setError(error)
    }
  }

  return { data: value, setData, isLoading, isSaving, error }
}
