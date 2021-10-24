import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register';
import * as middy from 'middy';
import { cors, warmup } from 'middy/middlewares';
import { CreateTodoRequest } from '../../requests/CreateTodoRequest';
import { Todos } from '../../businessLogic/todos';

import { getUserId } from '../utils';

const todos = new Todos();

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body);
    const userId = getUserId(event);
    const newItem = await todos.createTodo(userId, newTodo);

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        item: newItem
      })
    };

  });

handler
  .use(warmup({
    isWarmingUp: (event) => event.source === 'WARMUP',
    onWarmup: () => 'It is warm'
  }))
  .use(cors({ credentials: true }));
