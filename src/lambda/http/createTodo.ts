import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { createLogger } from '../../utils/logger'
import { cors } from 'middy/middlewares'
import { getToken } from '../../auth/utils'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createTodo } from '../../businessLogic/todo'


const logger = createLogger('create-todo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // const newTodo: CreateTodoRequest = JSON.parse(event.body)
    // TODO: Implement creating a new TODO item


      const newTodo: CreateTodoRequest = JSON.parse(event.body)
      const jwtToken: string = getToken(event.headers.Authorization)
      const newItem = await createTodo(newTodo, jwtToken)

      return {
        statusCode: 201,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
          newItem
        })
      }
    } 


)