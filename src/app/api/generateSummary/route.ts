import openai from '@/utils/openai'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { todos } = await request.json()

  const { data } = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    temperature: 0.8,
    n: 1,
    stream: false,
    messages: [
      {
        role: 'system',
        content:
          'when responding, welcome the user always as Mr. Askin and say welcome the Trello Clone App! Limit the response to 200 characters'
      },
      {
        role: 'user',
        content: `Hi there, provide a summary of the following todos. Count how many todos are in each category such as To do, in progress and done, then tell the user to have a productive day! Here's the data: ${JSON.stringify(
          todos
        )}`
      }
    ]
  })

  return NextResponse.json(data.choices[0].message)
}
