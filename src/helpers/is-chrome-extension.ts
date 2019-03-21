export function isChromeExtension() {
  const result = window.chrome && chrome.runtime && chrome.runtime.id ? true : false
  return result
}
