import { orderBy } from '@exodus/basic-utils'

const sortValidationResults = (results) => {
  return orderBy(
    results,
    [
      'type',
      'priority',
      (item) => {
        if (item.topValidationComponent) return 1
        if (item.bottomValidationComponent) return 1
        return item.message?.length || 0
      },
    ],
    ['asc', 'desc', 'desc']
  )
}

export default sortValidationResults
