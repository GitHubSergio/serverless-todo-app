import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import * as createError from 'http-errors';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { createLogger } from '../utils/logger';
import { TodoItem } from '../models/TodoItem';
import { TodoUpdate } from '../models/TodoUpdate';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';

const XAWS = AWSXRay.captureAWS(AWS);
const logger = createLogger('TodosAccess');

export class TodosAccess {
  constructor(
    private readonly documentClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE) { }

  public async getTodosForUser(userId: string): Promise<TodoItem[]> {
    logger.info('Fetching user todos...');

    const result = await this.documentClient.query({
      TableName: this.todosTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
    }).promise();

    logger.info('Fetched user todos', {
      result,
    });

    return result.Items as TodoItem[];
  }

  public async createTodo(newTodo: CreateTodoRequest): Promise<TodoItem> {
    logger.info('Creating Todo...');

    await this.documentClient.put({
      TableName: this.todosTable,
      Item: newTodo
    }).promise();

    return newTodo as TodoItem;
  }

  public async deleteTodo(userId: string, todoId: string): Promise<void> {
    const findTodo = await this.getTodoById(userId, todoId);

    logger.info('Deleting Todo...');

    await this.documentClient.delete({
      TableName: this.todosTable,
      Key: {
        todoId: findTodo.todoId,
        userId: findTodo.userId,
      }
    }).promise();
  }

  public async updateTodo(userId: string, todoId: string, updatedTodo: TodoUpdate): Promise<void> {
    await this.getTodoById(userId, todoId);

    logger.info('Updating Todo...');

    await this.documentClient.update({
      TableName: this.todosTable,
      Key: { userId, todoId },
      UpdateExpression: "set updatedName=:name, updatedDueDate=:dueDate, updatedDone=:done",
      ExpressionAttributeValues: {
        ":name": updatedTodo.name,
        ":dueDate": updatedTodo.dueDate,
        ":done": updatedTodo.done
      },
    }).promise();
  }

  public async addTodoImage(userId: string, todoId: string, uploadUrl: string): Promise<string> {
    await this.getTodoById(userId, todoId);

    logger.info('Adding Todo image...');

    await this.documentClient.update({
      TableName: this.todosTable,
      Key: { userId, todoId },
      UpdateExpression: "set attachmentUrl=:URL",
      ExpressionAttributeValues: {
        ":URL": uploadUrl.split("?")[0]
      },
      ReturnValues: "UPDATED_NEW"
    }).promise();

    return uploadUrl;
  }

  public async getTodoById(userId: string, todoId: string): Promise<TodoItem> {
    logger.info('Fetching todo...');

    const result = await this.documentClient.query({
      TableName: this.todosTable,
      KeyConditionExpression: 'userId = :userId and todoId = :todoId',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':todoId': todoId
      }
    }).promise();

    if (result.Count === 0)
      throw createError(404, 'Todo not found');

    return result.Items[0] as TodoItem;
  }

}