import { Handler } from '@netlify/functions';
import { getScriptFromLocalDb } from './utils/db';

const handler: Handler = async (event, context) => {
  const { id } = event.queryStringParameters || {};

  if (!id) {
    return {
      statusCode: 400,
      body: 'Missing script ID',
    };
  }

  // Fetch from JSON DB
  const script = await getScriptFromLocalDb(id);

  if (!script) {
     return {
       statusCode: 404,
       body: `print("Error: Script not found (ID: ${id})")`,
       headers: { 'Content-Type': 'text/plain' }
     }
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*', // Allow Roblox to fetch
    },
    body: script,
  };
};

export { handler };
