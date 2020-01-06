export function assertNever(n: never): never {
  throw `Error: never assertion`
  return n
}
