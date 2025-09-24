const color = {
  type: 'string',
  pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$',
  maxLength: 7,
}

const assetId = {
  type: 'string',
  pattern: '^[A-Za-z0-9:_\\-]{6,128}$',
}

const assetName = {
  type: 'string',
  pattern: '^[a-z0-9]{1,10}_[a-z0-9]+_[0-9a-f]{8}(?:[0-9a-f]{8})?$',
  maxLength: 34,
}

const parentAssetName = {
  type: 'string',
  pattern: '^[_a-zA-Z0-9]+$',
  maxLength: 34,
}

const assetType = {
  type: 'string',
  pattern: '^[A-Z0-9_]+$',
  maxLength: 40,
}

const baseAssetName = {
  type: 'string',
  pattern: '^[a-zA-Z0-9]+$',
  maxLength: 20,
}

const url = {
  type: 'string',
  maxLength: 100,
  pattern: '^(https?://.*|)$',
}

const displayName = {
  type: 'string',
  maxLength: 200,
  pattern:
    "^[a-zA-Z\\d()$!.&\\-_'/,+:@#%^*=~?{}\\[\\] |\\u{1F600}-\\u{1F64F}\\u{1F300}-\\u{1F5FF}\\u{1F680}-\\u{1F6FF}\\u2600-\\u26FF\\u{1F1E6}-\\u{1F1FF}\\u{1F900}-\\u{1F9FF}\\u{1D6A8}-\\u{1D7FF}\\u0370-\\u03FF\\u25A0-\\u25FF\\u00C0-\\u017F\\u4E00-\\u9FFF\\u3400-\\u4DBF\\u3040-\\u309F\\u30A0-\\u30FF\\uAC00-\\uD7AF\\u1100-\\u11FF]+$",
}

const ticker = {
  type: 'string',
  pattern: '^[A-Z0-9]{1,10}[a-z0-9]+[0-9A-F]{8}(?:[0-9A-F]{8})?$',
  maxLength: 32,
}

// regex is like displayName without underscore `_`!
const displayTicker = {
  type: 'string',
  maxLength: 100,
  pattern:
    "^[a-zA-Z\\d()$!.&\\-'/,+:@#%^*=~?{}\\[\\] |\\u{1F600}-\\u{1F64F}\\u{1F300}-\\u{1F5FF}\\u{1F680}-\\u{1F6FF}\\u2600-\\u26FF\\u{1F1E6}-\\u{1F1FF}\\u{1F900}-\\u{1F9FF}\\u{1D6A8}-\\u{1D7FF}\\u0370-\\u03FF\\u25A0-\\u25FF\\u00C0-\\u017F\\u4E00-\\u9FFF\\u3400-\\u4DBF\\u3040-\\u309F\\u30A0-\\u30FF\\uAC00-\\uD7AF\\u1100-\\u11FF]+$",
}

const description = {
  type: 'string',
  pattern: '^[\\s\\S]*$',
  maxLength: 1000,
}

const website = url

const twitter = url

const reddit = url

const telegram = url

const icon = {
  type: ['string', 'null'],
  pattern: '^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$',
  maxLength: 25_600,
}

export {
  assetId,
  assetName,
  assetType,
  baseAssetName,
  color,
  description,
  displayName,
  displayTicker,
  icon,
  parentAssetName,
  reddit,
  telegram,
  ticker,
  twitter,
  website,
}
