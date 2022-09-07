import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('todoAccess')

export class TodoAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' }),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly bucketName = process.env.TODOS_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION,
    private readonly indexName = process.env.TODOS_TABLE_IDX
  ) { }

  async getAllTodos(userId: string): Promise<TodoItem[]> {
    logger.info('Getting all todo items')

    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        IndexName: this.indexName,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },

        //
      })
      .promise()

    const items = result.Items

    return items as TodoItem[]
  }

  async updateTodo(todo: TodoItem): Promise<TodoItem> {
    logger.info("updating a todo ");

    const updateExpression = 'set #name = :name, dueDate = :dueDate, done = :done'

    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: { userId: todo.userId, todoId: todo.todoId },
        UpdateExpression: updateExpression,
        ConditionExpression: 'todoId = :todoId',
        ExpressionAttributeValues: {
          ':name': todo.name,
          ':todoId': todo.todoId,
          ':dueDate': todo.dueDate,
          ':done': todo.done

        },
        ExpressionAttributeNames: {
          '#name': 'name'
        },
        ReturnValues: 'UPDATED_NEW'
      })
      .promise()

    return todo
  }


  async deleteTodo(todoId: string, userId: string): Promise<string> {
    //
    logger.info("Deleting todo ")

    await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: {
          todoId, userId,
        },
        ConditionExpression:
          'todoId = :todoId',
        ExpressionAttributeValues: { ':todoId': todoId }
      })
      .promise()

    return userId
  }



  async generateUploadUrl(todoId: string): Promise<string> {
    logger.info('Generating upload Url')

    return this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: todoId,
      Expires: this.urlExpiration
    })
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    logger.info("Creating a todo ")

    const newItem = {
      ...todo, attachmentUrl: `https://${this.bucketName}.s3.amazonaws.com/${todo.todoId}`
    }

    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: newItem
      })
      .promise()

    return todo
  }

  const createDynamoDBClient = () => {
    return new XAWS.DynamoDB.DocumentClient()

  }
}