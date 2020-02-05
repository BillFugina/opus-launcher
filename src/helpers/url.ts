import { isChromeExtension } from 'src/helpers/is-chrome-extension'

export const createURL = (environment: string, subdomain: string, pathname: string = ''): string => {
  const port = environment == 'localhost' ? ':9002' : ''
  const domain = environmentToDomain(environment)
  const env = environment === 'production' ? 'ignite' : environment

  const path = pathname !== '' && !pathname.startsWith('/') ? `/${pathname}` : pathname
  const url: string = `https://${subdomain}.${env}${domain}${port}${path}`
  return url
}
export const environmentToDomain = (environment: string): string => {
  return environment === 'production' ? '.inmotionnow.com' : '.goinmo.com'
}

type EnvAndSubdomain = {
  environment: string
  subdomain: string
}

export const hostnameToParts = (hostname: string): EnvAndSubdomain => {
  const parts = hostname.split('.')
  const subdomain = parts.length > 0 ? parts[0] : ''
  const environment = parts.length > 1 ? parts[1] : ''

  return {
    subdomain,
    environment
  }
}
export const getPath = (url: URL): string => {
  const currentlyInIgnite = getIsInIgnite(url)
  const pathname = currentlyInIgnite ? `${url.pathname}${url.search}` : ''
  return pathname
}

export const getCurrentURL = (callback: (url: URL) => void): void => {
  if (isChromeExtension()) {
    chrome.tabs.query({ currentWindow: true, active: true }, tabs => {
      callback(tabs.length > 0 ? new URL(tabs[0].url || '') : new URL(''))
    })
  } else {
    callback(new URL(window.location.href))
  }
}

export function getIsInIgnite(url: URL) {
  if (!url || !url.hostname) {
    return false
  }
  const { subdomain, environment } = hostnameToParts(url.hostname)
  const testUrl = environment && createURL(environment, subdomain)
  const currentlyInIgnite = testUrl === url.origin
  return currentlyInIgnite
}

export const igniteURLToParts = (url: URL, defaults: EnvAndSubdomain): EnvAndSubdomain => {
  if (url && getIsInIgnite(url)) {
    return hostnameToParts(url.hostname)
  }
  return defaults
}
