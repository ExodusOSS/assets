// 3 base64URL encoded dot separated strings.
const jwtRegEx = /^[A-Z0-9_-]+\.[A-Z0-9_-]+\.[A-Z0-9_-]*$/i

export const formats = {
  jwt: jwtRegEx,
  base64String: (input) => /^[a-z0-9+/]*={0,3}$/i.test(input),
}
