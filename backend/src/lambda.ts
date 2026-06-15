import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import serverless from 'serverless-http';
import app, { prisma } from './index';

// Wrap the Express app with serverless-http
const serverlessHandler = serverless(app, {
  // Optional: Binary media types support if API serves images/files
  binary: ['image/*', 'application/pdf', 'application/octet-stream'],
});

export const handler = async (event: APIGatewayProxyEvent, context: Context) => {
  // Ensure database connections are cleaned up or managed correctly in serverless
  context.callbackWaitsForEmptyEventLoop = false;
  
  try {
    const response = await serverlessHandler(event, context);
    return response;
  } catch (error) {
    console.error('Lambda handler execution error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }
};
