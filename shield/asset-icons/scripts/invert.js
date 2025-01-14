const invert = (obj) => Object.fromEntries(Object.entries(obj).map(([key, val]) => [val, key]))

module.exports = invert
