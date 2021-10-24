import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler, warmup } from 'middy/middlewares';
import { Todos } from '../../businessLogic/todos';
import { getUserId } from '../utils';

const todos = new Todos();

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId;
    const userId = getUserId(event);
    const imageUrl = await todos.addTodoImage(userId, todoId);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        uploadUrl: imageUrl,
      })
    };
  });

handler
  .use(warmup({
    isWarmingUp: (event) => event.source === 'WARMUP',
    onWarmup: () => 'It is warm'
  }))
  .use(httpErrorHandler())
  .use(cors({ credentials: true }));
