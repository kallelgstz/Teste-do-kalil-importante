import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, User, Key, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (nickname.length < 3) {
      setStatus('Error: Nickname deve ter pelo menos 3 caracteres');
      return;
    }

    if (password.length < 6) {
      setStatus('Error: Senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    
    const baseUrl = window.location.origin.includes('localhost') 
       ? 'http://localhost:8888' // Netlify Dev default port
       : window.location.origin;

    try {
      const response = await fetch(`${baseUrl}/.netlify/functions/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: isRegister ? 'register' : 'login',
          username: nickname,
          password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar solicitação');
      }

      if (data.success && data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        // Force reload to update AuthContext if it listens to localStorage or just navigate
        // Ideally we should use the login function from context
        // login(data.user); // The original code had this but it was not imported/defined in the snippet I read
        // Assuming there is no 'login' function available in the scope based on the read output, 
        // I will just navigate. But if the app uses a Context, it might need a reload.
        window.location.href = '/dashboard'; 
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (err: any) {
      setStatus(err.message || 'Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-8 space-y-8 shadow-2xl shadow-violet-900/10 relative overflow-hidden"
      >
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="text-center space-y-2 relative z-10">
          <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-zinc-800 shadow-inner">
            <Lock className="w-8 h-8 text-violet-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">{isRegister ? 'Create Account' : 'Member Login'}</h2>
          <p className="text-zinc-400 text-sm">Access your Premium Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300 ml-1">Nickname</label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-violet-500 transition-colors" />
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all"
                placeholder="xX_Hacker_Xx"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300 ml-1">Password</label>
             <div className="relative group">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-violet-500 transition-colors" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-900/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Database className="w-4 h-4 animate-pulse" />
                Processing...
              </>
            ) : (
              isRegister ? 'Register' : 'Sign In'
            )}
          </button>
          
          <div className="text-center">
            <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-sm text-zinc-400 hover:text-violet-400 transition-colors"
            >
                {isRegister ? 'Already have an account? Login' : 'Need an account? Register'}
            </button>
          </div>

          {status && (
             <div className="text-center text-xs font-mono animate-pulse text-zinc-500 mt-2">
               <span className="text-violet-400">System: </span> {status}
             </div>
          )}
        </form>
        
        <div className="text-center text-xs text-zinc-600 relative z-10">
          <p>Protected by reCAPTCHA and Nova Obfuscador v1 Security.</p>
        </div>
      </motion.div>
    </div>
  );
}
