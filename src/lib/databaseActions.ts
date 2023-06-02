import { databases, id, storage } from '@/utils/appwrite'

export const getTodosGroupedByColumn = async () => {
  const data = await databases.listDocuments(
    process.env.NEXT_PUBLIC_DATABASE_ID!,
    process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!
  )

  const todos = data.documents

  const columns = todos.reduce((acc, todo) => {
    if (!acc.get(todo.status)) {
      acc.set(todo.status, {
        id: todo.status,
        todos: []
      })
    }

    acc.get(todo.status)!.todos.push({
      $id: todo.$id,
      $createdAt: todo.$createdAt,
      title: todo.title,
      status: todo.status,
      ...(todo.image && { image: JSON.parse(todo.image) })
    })

    return acc
  }, new Map<TypedColumn, Column>())

  const columnTypes: TypedColumn[] = ['todo', 'inprogress', 'done']

  for (const columnType of columnTypes) {
    if (!columns.get(columnType)) {
      columns.set(columnType, {
        id: columnType,
        todos: []
      })
    }
  }

  const sortedColumns = new Map(
    Array.from(columns.entries()).sort(
      (a, b) => columnTypes.indexOf(a[0]) - columnTypes.indexOf(b[0])
    )
  )

  const board: Board = { columns: sortedColumns }

  return board
}

export const updateTodoLocation = async (todo: Todo, columnId: TypedColumn) => {
  await databases.updateDocument(
    process.env.NEXT_PUBLIC_DATABASE_ID!,
    process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
    todo.$id,
    {
      title: todo.title,
      status: columnId
    }
  )
}

export const deleteTodo = async (todo: Todo) => {
  if (todo.image) {
    await storage.deleteFile(todo.image.buckedId, todo.image.fileId)
  }

  await databases.deleteDocument(
    process.env.NEXT_PUBLIC_DATABASE_ID!,
    process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
    todo.$id
  )
}

export const uploadImage = async (file: File) => {
  if (!file) return

  const fileUploaded = await storage.createFile(
    process.env.NEXT_PUBLIC_STORAGE_BUCKET_ID!,
    id.unique(),
    file
  )

  return fileUploaded
}

export const addTodo = async (
  todo: string,
  columnId: TypedColumn,
  file: Image | undefined
) => {
  const { $id } = await databases.createDocument(
    process.env.NEXT_PUBLIC_DATABASE_ID!,
    process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
    id.unique(),
    {
      title: todo,
      status: columnId,
      ...(file && { image: JSON.stringify(file) })
    }
  )

  return $id
}

export const getUrl = async (image: Image) => {
  const url = storage.getFilePreview(image.bucketId, image.fileId)

  return url;
}
