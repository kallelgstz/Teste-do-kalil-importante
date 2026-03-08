import { Handler } from '@netlify/functions';
import { saveScriptToLocalDb } from './utils/db';

const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  try {
    const { code, owner, title } = JSON.parse(event.body || '{}');

    if (!code) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing code' }),
      };
    }

    const id = Math.random().toString(36).substring(2, 15);
    
    // Save to local file system (JSON DB)
    await saveScriptToLocalDb(id, code, owner, title);

    const isDev = process.env.NETLIFY_DEV || process.env.NODE_ENV === 'development';
    // const baseUrl = isDev ? 'http://localhost:8888' : 'https://lua-obfuscator.netlify.app'; // We can just use relative path or return the full link if we knew the host.
    // Ideally we return the ID and let the frontend construct the link, or return a relative link.
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        success: true, 
        id,
        link: `/api/get-script?id=${id}` 
      }),
    };
  } catch (error) {
    console.error('Save script error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};

export { handler };
