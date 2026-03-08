import { Link, useLocation } from 'react-router-dom';
import { Shield, Code, Database, LogIn } from 'lucide-react';

export function Navbar() {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-violet-500 font-bold text-xl">
          <Shield className="h-6 w-6" />
          <span>Nova Obfuscador v1</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            to="/"
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              isActive('/') ? 'text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Code className="h-4 w-4" />
            Obfuscator
          </Link>
          <Link
            to="/api"
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              isActive('/api') ? 'text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Database className="h-4 w-4" />
            API
          </Link>
          
          {user ? (
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 text-sm font-medium transition-colors px-4 py-2 rounded-md ${
                isActive('/dashboard') 
                  ? 'bg-violet-600 text-white' 
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              <Database className="h-4 w-4" />
              {user.nickname}
            </Link>
          ) : (
            <Link
              to="/login"
              className={`flex items-center gap-2 text-sm font-medium transition-colors px-4 py-2 rounded-md ${
                isActive('/login') 
                  ? 'bg-violet-600 text-white' 
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              <LogIn className="h-4 w-4" />
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
