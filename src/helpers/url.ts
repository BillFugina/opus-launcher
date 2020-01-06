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

type HostAndDomain = {
  domain: string
  environment: string
  subdomain: string
}

export const hostnameToParts = (hostname: string): HostAndDomain => {
  const parts = hostname.split('.')
  const subdomain = parts.length > 0 ? parts[0] : ''
  const environment = parts.length > 1 ? parts[1] : ''
  const domain = parts.length > 2 ? parts.slice(2, parts.length).join('.') : ''

  return {
    subdomain,
    environment,
    domain
  }
}
export const getPath = (url: URL): string => {
  console.log(`getPath('${url.hostname}')`)
  const { subdomain, environment } = hostnameToParts(url.hostname)
  console.log(`{ subdomain: ${subdomain}, environment: ${environment} }`)
  const testUrl = environment && createURL(environment, subdomain)
  console.log(`testUrl: ${testUrl}`)
  const currentlyInIgnite = testUrl === url.origin
  console.log(`currentlyInIgnite: ${currentlyInIgnite}`)
  const pathname = currentlyInIgnite ? url.pathname : ''
  console.log(`pathname: ${pathname}`)
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
