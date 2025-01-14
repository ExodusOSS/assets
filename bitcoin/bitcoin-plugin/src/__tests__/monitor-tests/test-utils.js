import path from 'path'

export const getSafeReportFile = (dirname, filename) =>
  path.join(dirname, filename.split(/[/\\]/).pop().replace('.js', '.json'))
