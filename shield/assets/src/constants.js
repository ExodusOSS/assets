export const CT_UPDATEABLE_PROPERTIES = [
  'displayName',
  'displayTicker',
  'gradientColors',
  'gradientCoords',
  'icon',
  'info.description',
  'info.reddit',
  'info.telegram',
  'info.twitter',
  'info.website',
  'lifecycleStatus',
  'primaryColor',
  'properName',
  'properTicker',
]

export const CT_STATUS = {
  VERIFIED: 'v',
  CURATED: 'c',
  UNVERIFIED: 'u',
  DISABLED: 'd',
}

export const CT_ALL_STATUSES = Object.values(CT_STATUS)

export const CT_DEFAULT_SERVER = 'https://ctr.a.exodus.io/registry'
