import { IStorage } from 'src/helpers/storage/types'
import { object } from 'prop-types'

export const LocalStorage = <T = any>(): IStorage<any> => ({
  get: (keys: string[], callback: (items: { [key: string]: any }) => void) => {
    const result: { [key: string]: any } = {}
    keys.forEach(key => {
      const storedString = window.localStorage.getItem(key) || 'null'
      const value = JSON.parse(storedString)
      result[key] = value
    })
    callback(result)
  },

  set: (items: { [key: string]: any }, callback?: () => void) => {
    Object.keys(items).forEach(k => {
      const value = items[k]
      window.localStorage.setItem(k, JSON.stringify(items[k]))
      if (callback) {
        callback()
      }
    })
  },

  onChanged: {
    addListener: callback => {},
    removeListener: callback => {}
  },

  lastError: undefined
})
