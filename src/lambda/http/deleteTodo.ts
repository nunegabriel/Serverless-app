import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deleteTodo } from '../../businessLogic/todo'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import { getToken } from '../../auth/utils'
const logger = createLogger('deleteTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const jwtToken: string = getToken(event.headers.Authorization)
    // TODO: Remove a TODO item by id
    
    try {
      await deleteTodo(todoId, jwtToken)

      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": '*',
          "Access-Control-Allow-Credentials": true
        },

        body: ""
      }
    } catch (error) 
    {

      logger.error("Error: " + error.message)

      return {
        statusCode: 500,
        body: error.message
      }
    }
  }
  
)

