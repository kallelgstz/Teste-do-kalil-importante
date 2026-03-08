import fs from 'fs';
import path from 'path';
import os from 'os';

// Determine the directory for storing data
// In local development, we want to store it in the project root under .data
// process.cwd() is usually the project root when running 'netlify dev' or 'npm run dev'
const isLocal = process.env.NETLIFY_DEV || process.env.NODE_ENV === 'development' || os.platform() === 'win32';

const BASE_DIR = isLocal
  ? path.join(process.cwd(), '.data') 
  : path.join('/tmp', 'lua-obf-data'); // Use /tmp for AWS Lambda/Netlify

// Ensure absolute path safety
if (!path.isAbsolute(BASE_DIR) && isLocal) {
    // Fallback if process.cwd() is weird
    console.warn('BASE_DIR is relative, resolving...');
}

const SCRIPTS_DIR = path.join(BASE_DIR, 'scripts');
const USERS_DIR = path.join(BASE_DIR, 'users');

// Ensure the directories exist
try {
  // Check if we have write permissions
  // On Netlify/Lambda, we only have write access to /tmp
  
  if (!fs.existsSync(BASE_DIR)) {
      fs.mkdirSync(BASE_DIR, { recursive: true });
  }
  if (!fs.existsSync(SCRIPTS_DIR)) {
    fs.mkdirSync(SCRIPTS_DIR, { recursive: true });
  }
  if (!fs.existsSync(USERS_DIR)) {
    fs.mkdirSync(USERS_DIR, { recursive: true });
  }
  console.log('Data directories initialized at:', BASE_DIR);
} catch (error) {
  console.error('Failed to create data directories at ' + BASE_DIR, error);
}

// --- USERS ---

export interface SavedScript {
  id: string;
  title: string;
  date: string;
  link: string;
}

export interface User {
  username: string;
  passwordHash: string;
  role: 'free' | 'premium';
  createdAt: string;
  scripts?: SavedScript[];
}

export const saveUserToLocalDb = async (user: User): Promise<boolean> => {
  try {
    const filePath = path.join(USERS_DIR, `${user.username}.json`);
    fs.writeFileSync(filePath, JSON.stringify(user, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving user:', error);
    return false;
  }
};

export const getUserFromLocalDb = async (username: string): Promise<User | null> => {
  try {
    const filePath = path.join(USERS_DIR, `${username}.json`);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content) as User;
    }
  } catch (error) {
    console.error('Error reading user:', error);
  }
  return null;
};

// --- SCRIPTS ---

export const saveScriptToLocalDb = async (id: string, content: string, owner?: string, title?: string): Promise<boolean> => {
  try {
    // 1. Save the raw content
    const filePath = path.join(SCRIPTS_DIR, `${id}.lua`);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Script saved locally: ${filePath}`);

    // 2. If there's an owner, update the user's record
    if (owner) {
      const user = await getUserFromLocalDb(owner);
      if (user) {
        if (!user.scripts) user.scripts = [];
        // Check if script already exists to avoid duplicates
        const existingIndex = user.scripts.findIndex(s => s.id === id);
        const scriptEntry = {
          id,
          title: title || `Script ${id}`,
          date: new Date().toISOString(),
          link: `/api/get-script?id=${id}`
        };
        
        if (existingIndex >= 0) {
          user.scripts[existingIndex] = scriptEntry;
        } else {
          user.scripts.push(scriptEntry);
        }
        
        await saveUserToLocalDb(user);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error saving script:', error);
    return false;
  }
};

export const getScriptFromLocalDb = async (id: string): Promise<string | null> => {
  try {
    const filePath = path.join(SCRIPTS_DIR, `${id}.lua`);
    console.log(`Attempting to read script from: ${filePath}`);
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8');
    } else {
        console.warn(`Script file not found: ${filePath}`);
    }
  } catch (error) {
    console.error('Error reading script:', error);
  }
  return null;
};

