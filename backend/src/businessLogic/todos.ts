import * as uuid from 'uuid';
import { TodoItem } from '../models/TodoItem';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { TodosAccess } from '../dataLayer/todosAccess';
import { TodoUpdate } from '../models/TodoUpdate';
import { AttachmentUtils } from '../dataLayer/attachmentUtils';

export class Todos {
  constructor(
    private readonly todosAccess: TodosAccess = new TodosAccess(),
    private readonly attachmentUtils: AttachmentUtils = new AttachmentUtils()) { }

  public async getTodosForUser(userId: string): Promise<TodoItem[]> {
    return this.todosAccess.getTodosForUser(userId);
  }

  public async createTodo(userId: string, newTodo: CreateTodoRequest): Promise<TodoItem> {
    const todoId = uuid.v4();
    const timestamp = new Date().toISOString();

    const newItem = {
      userId,
      createdAt: timestamp,
      todoId,
      ...newTodo,
      done: false
    };

    return this.todosAccess.createTodo(newItem);
  }

  public async updateTodo(userId: string, todoId: string, updatedTodo: TodoUpdate): Promise<void> {
    await this.todosAccess.updateTodo(userId, todoId, updatedTodo);
  };

  public async addTodoImage(userId: string, todoId: string): Promise<string> {
    const uploadUrl = await this.attachmentUtils.createAttachmentPresignedUrl(todoId);
    return this.todosAccess.addTodoImage(userId, todoId, uploadUrl);
  }

  public async deleteTodo(userId: string, todoId: string): Promise<void> {
    await this.todosAccess.deleteTodo(userId, todoId);
  }

}