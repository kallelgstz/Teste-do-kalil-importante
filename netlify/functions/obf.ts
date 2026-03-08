import { obfuscateLua } from '../../src/utils/obfuscator';

// Define types locally since we might not have @netlify/functions installed
type HandlerEvent = {
  body: string | null;
  headers: Record<string, string | undefined>;
  httpMethod: string;
  queryStringParameters: Record<string, string | undefined> | null;
};

type HandlerResponse = {
  statusCode: number;
  body: string;
  headers?: Record<string, string | number | boolean>;
};

type Handler = (event: HandlerEvent, context: any) => Promise<HandlerResponse>;

const PREMIUM_KEY = 'zdC1qO138ZgK3ym6';

export const handler: Handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { code, level, key } = body;

    // Check API Key from body or header
    const apiKey = key || event.headers['x-api-key'];

    if (!code) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing code' })
      };
    }

    // Determine level
    let targetLevel = level || 'medium';
    
    // Premium Authorization Check
    if (targetLevel === 'premium') {
      if (apiKey !== PREMIUM_KEY) {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ 
            error: 'Premium access denied. Invalid API Key.',
            message: 'You need a valid API key for premium obfuscation.'
          })
        };
      }
    }

    const obfuscated = obfuscateLua(code, targetLevel);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        code: obfuscated,
        level: targetLevel
      })
    };

  } catch (error: any) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal Server Error', 
        details: error.message || String(error) 
      })
    };
  }
};
