import axios from 'axios'
import { formatTodosForAI } from '@/lib/functions'

export const fetchSuggestion = async (board: Board) => {
  const todos = formatTodosForAI(board)

  const { data } = await axios.post(
    '/api/generateSummary',
    JSON.stringify({ todos }),
    { headers: { 'Content-Type': 'application/json' } }
  )

  const { content } = data

  return content
}

