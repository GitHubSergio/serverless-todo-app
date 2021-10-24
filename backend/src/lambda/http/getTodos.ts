import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors, warmup } from 'middy/middlewares';
import { Todos } from '../../businessLogic/todos';
import { getUserId } from '../utils';

const todos = new Todos();

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = getUserId(event);
    const todosForUser = await todos.getTodosForUser(userId);

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        items: todosForUser,
      })
    };
  });

handler
  .use(warmup({
    isWarmingUp: (event) => event.source === 'WARMUP',
    onWarmup: () => 'It is warm'
  }))
  .use(cors({ credentials: true }));