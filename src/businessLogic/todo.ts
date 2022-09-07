import { TodoAccess } from '../dataLayer/todoAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { parseUserId } from '../auth/utils'
import * as uuid from 'uuid'
import { TodoItem } from '../models/TodoItem'
import { createLogger } from '../utils/logger'

const logger = createLogger('todos')
const todoAccess = new TodoAccess()

export const getAllTodos = async (jwtToken: string): Promise<TodoItem[]> => {
  const userId = parseUserId(jwtToken)

  return await todoAccess.getAllTodos(userId)
}

export const createTodo = async (
  jwtToken: string,
  createTodoRequest: CreateTodoRequest
  ): Promise<TodoItem> => {
  logger.info('Item created')

  const userId = parseUserId(jwtToken)
  const todoId = uuid.v4()

  
  

  return await todoAccess.createTodo({
    userId,
    todoId,
    dueDate: createTodoRequest.dueDate,
    name: createTodoRequest.name,
    done: false,
    createdAt: new Date().toISOString()
  })
}

export const deleteTodo = async (
  jwtToken: string,
  todoId: string

  ): Promise<string> => {
  logger.info('Delete')
  const userId = parseUserId(jwtToken)

  logger.info('User Id: ' + userId)

  return await todoAccess.deleteTodo(todoId, userId)
}

export const updateTodo = async (
  todoId: string,
  updateTodoRequest: UpdateTodoRequest,
  jwtToken: string
): Promise<TodoItem> => {
  logger.info('In updateTodo() function')

  const userId = parseUserId(jwtToken)
  logger.info('User Id: ' + userId)

  return await todoAccess.updateTodo({
    todoId,
    userId,
    dueDate: updateTodoRequest.dueDate,
    name: updateTodoRequest.name,
    done: updateTodoRequest.done,
    createdAt: new Date().toISOString()
  })
}

   export const generateUrl = async (todoId: string): Promise<string> => {
    logger.info('Generating URL')
  
    return await todoAccess.generateUrl(todoId)
  }


