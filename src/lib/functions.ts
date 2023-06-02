export const searchInString = (search: string, text: string) => {
  if (typeof search !== 'string' && typeof text !== 'string')
    throw Error('Type not string')

  search = search.trim().toLowerCase()
  text = text.trim().toLowerCase()

  const words = search.split(/\s+/).filter(word => word !== '')

  for (const word of words) {
    if (text.includes(word)) return true
  }

  return false
}

export const formatTodosForAI = (board: Board) => {
  const todos = Array.from(board.columns.entries())

  const flatArray = todos.reduce((map, [key, value]) => {
    map[key] = value.todos
    return map
  }, {} as { [key in TypedColumn]: Todo[] })

  const flatArrayCounted = Object.entries(flatArray).reduce(
    (map, [key, value]) => {
      map[key as TypedColumn] = value.length
      return map
    },
    {} as { [key in TypedColumn]: number }
  )

  return flatArrayCounted
}
