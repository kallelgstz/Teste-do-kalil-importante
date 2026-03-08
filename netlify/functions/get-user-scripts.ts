import { Handler } from '@netlify/functions';
import { getUserFromLocalDb } from './utils/db';

const handler: Handler = async (event, context) => {
  const { username } = event.queryStringParameters || {};

  if (!username) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing username' }),
    };
  }

  // Fetch user from JSON DB
  const user = await getUserFromLocalDb(username);

  if (!user) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'User not found' }),
    };
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({ scripts: user.scripts || [] }),
  };
};

export { handler };
