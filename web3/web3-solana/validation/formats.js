// 3 base64URL encoded dot separated strings.
const jwtRegEx = /^(?:[\w-]+\.){2}[\w-]*$/i

export const formats = {
  jwt: jwtRegEx,
  base64String: (input) => /^[\d+/a-z]*={0,3}$/i.test(input),
}
