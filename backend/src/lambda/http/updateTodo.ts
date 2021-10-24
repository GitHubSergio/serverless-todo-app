import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler, warmup } from 'middy/middlewares';
import { Todos } from '../../businessLogic/todos';
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest';
import { getUserId } from '../utils';

const todos = new Todos();

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId;
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body);
    const userId = getUserId(event);
    await todos.updateTodo(userId, todoId, updatedTodo);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: ''
    };
  });

handler
  .use(warmup({
    isWarmingUp: (event: any) => {
      console.log('WarmUp - Lambda is warm!', event);
      return event.source === 'serverless-plugin-warmup';
    },
    onWarmup: () => 'It is warm'
  }))
  .use(httpErrorHandler())
  .use(cors({ credentials: true }));
