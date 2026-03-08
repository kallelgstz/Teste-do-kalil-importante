import { Handler } from '@netlify/functions';
import { saveUserToLocalDb, getUserFromLocalDb, User } from './utils/db';

const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  try {
    const { action, username, password } = JSON.parse(event.body || '{}');

    if (!username || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Username and password are required' })
      };
    }

    if (action === 'register') {
      const existingUser = await getUserFromLocalDb(username);
      if (existingUser) {
        return {
          statusCode: 409,
          headers,
          body: JSON.stringify({ error: 'Username already exists' })
        };
      }

      // In a real app, hash the password! For this "JSON/File" demo, we store plain/simple hash
      const newUser: User = {
        username,
        passwordHash: Buffer.from(password).toString('base64'), // Simple encoding for demo
        role: 'free',
        createdAt: new Date().toISOString()
      };

      const success = await saveUserToLocalDb(newUser);
      if (!success) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Failed to create user' })
        };
      }

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ 
          success: true, 
          user: { username: newUser.username, role: newUser.role } 
        })
      };
    }

    if (action === 'login') {
      const user = await getUserFromLocalDb(username);
      if (!user) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Invalid credentials' })
        };
      }

      // Verify password (simple check for demo)
      const inputHash = Buffer.from(password).toString('base64');
      if (user.passwordHash !== inputHash) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Invalid credentials' })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          user: { username: user.username, role: user.role } 
        })
      };
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid action' })
    };

  } catch (error) {
    console.error('Auth error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

export { handler };

