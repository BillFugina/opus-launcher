import { isChromeExtension } from 'src/helpers/is-chrome-extension'

export interface INavigateToOptions {
  newWindow?: boolean
}

const defaultNavigateToOptions: Required<INavigateToOptions> = {
  newWindow: false
}

export function navigateTo(url: string, options: INavigateToOptions = defaultNavigateToOptions) {
  const finalOptions = { ...defaultNavigateToOptions, ...options }
  if (isChromeExtension()) {
    chromeExtensionNavigateTo(url, finalOptions)
  } else {
    browserNavigateTo(url, finalOptions)
  }
}

function chromeExtensionNavigateTo(url: string, options: INavigateToOptions = defaultNavigateToOptions) {
  const finalOptions = { ...defaultNavigateToOptions, ...options }
  if (finalOptions.newWindow) {
    chrome.tabs.create({ url })
  } else {
    chrome.tabs.update({ url })
  }
}

function browserNavigateTo(url: string, options: INavigateToOptions = defaultNavigateToOptions) {
  const finalOptions = { ...defaultNavigateToOptions, ...options }
  if (finalOptions.newWindow) {
    window.open(url)
  } else {
    window.location.href = url
  }
}
