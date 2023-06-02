import {
  addTodo,
  deleteTodo,
  getTodosGroupedByColumn,
  updateTodoLocation,
  uploadImage
} from '@/lib/databaseActions'
import { create } from 'zustand'

interface BoardState {
  board: Board
  getBoard: () => void
  setBoardState: (board: Board) => void
  updateTodoInDB: (todo: Todo, columnId: TypedColumn) => void

  searchText: string
  setSearchText: (searchText: string) => void

  addTask: (todo: string, columnId: TypedColumn, image?: File | null) => void
  deleteTask: (taskId: number, todoId: Todo, id: TypedColumn) => void

  newTaskInput: string
  setNewTaskInput: (input: string) => void

  newTaskType: TypedColumn
  setNewTaskType: (columnId: TypedColumn) => void

  image: File | null
  setImage: (image: File | null) => void
}

export const useBoardStore = create<BoardState>((set, get) => ({
  board: { columns: new Map<TypedColumn, Column>() },
  searchText: '',
  setSearchText: (searchText: string) => set({ searchText }),
  newTaskInput: '',
  setNewTaskInput: (input: string) => set({ newTaskInput: input }),
  newTaskType: 'todo',
  setNewTaskType: (columnId: TypedColumn) => set({ newTaskType: columnId }),
  image: null,
  setImage: (image: File | null) => set({ image }),

  getBoard: async () => {
    const board = await getTodosGroupedByColumn()
    set({ board })
  },

  setBoardState: board => set({ board }),

  addTask: async (todo: string, columnId: TypedColumn, image?: File | null) => {
    let file: Image | undefined

    if (image) {
      const fileUploaded = await uploadImage(image)

      if (fileUploaded) {
        file = {
          bucketId: fileUploaded.bucketId,
          fileId: fileUploaded.$id
        }
      }
    }

    const $id = await addTodo(todo, columnId, file)

    set({ newTaskInput: '' })

    set(state => {
      const newColumns = new Map(state.board.columns)

      const newTodo: Todo = {
        $id,
        $createdAt: new Date().toISOString(),
        title: todo,
        status: columnId,
        ...(file && { image: file })
      }

      const column = newColumns.get(columnId)

      if (!column) {
        newColumns.set(columnId, {
          id: columnId,
          todos: [newTodo]
        })
      } else {
        newColumns.get(columnId)?.todos.push(newTodo)
      }

      return {
        board: {
          columns: newColumns
        }
      }
    })
  },
  deleteTask: async (taskIndex: number, todo: Todo, id: TypedColumn) => {
    const newColumns = new Map(get().board.columns)

    // delete todoId from newColumns
    newColumns.get(id)?.todos.splice(taskIndex, 1)

    set({ board: { columns: newColumns } })

    await deleteTodo(todo)
  },

  updateTodoInDB: async (todo, columnId) => updateTodoLocation(todo, columnId)
}))
