const INVALID_DATE_LABEL = 'Data indisponível'
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
})

export function formatLocalDate(dateTime: string): string {
  const match = ISO_DATE_PATTERN.exec(dateTime)

  if (!match) {
    return INVALID_DATE_LABEL
  }

  const [, yearText, monthText, dayText] = match
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)
  const date = new Date(0)

  date.setUTCFullYear(year, month - 1, day)
  date.setUTCHours(0, 0, 0, 0)

  const isValidDate =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day

  if (!isValidDate) {
    return INVALID_DATE_LABEL
  }

  const formattedDate = dateFormatter.format(date)

  return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)
}
