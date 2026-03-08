import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Copy, Plus, LogOut, Code, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SavedScript {
  id: string;
  title: string;
  date: string;
  link: string;
  // code is not stored in user profile to keep it light
}

interface User {
  nickname: string;
  scripts: SavedScript[];
}

export function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    
    // Fetch latest scripts from API
    fetch(`/.netlify/functions/get-user-scripts?username=${parsedUser.nickname}`)
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Failed to fetch scripts');
      })
      .then(data => {
        setUser({
          ...parsedUser,
          scripts: data.scripts || []
        });
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        // Fallback to local storage if API fails
        setUser(parsedUser);
        setLoading(false);
      });
      
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast notification here
  };
  
  const deleteScript = (id: string) => {
    // TODO: Implement delete endpoint
    if (!user) return;
    const updatedScripts = user.scripts.filter(s => s.id !== id);
    setUser({ ...user, scripts: updatedScripts });
    // Note: This only deletes from UI, not server yet
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex items-center justify-between p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-violet-600/20 rounded-xl flex items-center justify-center border border-violet-500/30">
              <Terminal className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Welcome back, {user.nickname}</h1>
              <p className="text-zinc-400 text-sm">Manage your obfuscated scripts</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button 
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Obfuscation
            </button>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </header>

        {/* Stats / Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {/* Scripts List */}
           <div className="md:col-span-3 space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Code className="w-5 h-5 text-violet-400" />
                Your Scripts
              </h2>
              
              {(!user.scripts || user.scripts.length === 0) ? (
                <div className="text-center py-12 bg-zinc-900/30 rounded-2xl border border-zinc-800/50 border-dashed">
                  <p className="text-zinc-500">No scripts saved yet.</p>
                  <button onClick={() => navigate('/')} className="mt-4 text-violet-400 hover:text-violet-300 text-sm">
                    Obfuscate your first script &rarr;
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {user.scripts.map((script) => (
                    <motion.div 
                      key={script.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:border-violet-500/30 transition-colors group relative"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-medium text-white text-lg">{script.title || 'Untitled Script'}</h3>
                          <span className="text-xs text-zinc-500">{new Date(script.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => deleteScript(script.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-zinc-500 hover:text-red-400 transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="bg-black/50 rounded-lg p-3 font-mono text-xs text-zinc-400 mb-4 overflow-hidden border border-zinc-800/50">
                        <div className="flex items-center justify-between mb-2 pb-2 border-b border-zinc-800/50">
                          <span className="text-violet-400 font-bold">Lua Link</span>
                          <button onClick={() => copyToClipboard(script.link)} className="text-zinc-500 hover:text-white">
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="break-all line-clamp-2">
                          loadstring(game:HttpGet("{window.location.origin}{script.link}"))()
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => copyToClipboard(`loadstring(game:HttpGet("${window.location.origin}${script.link}"))()`)}
                          className="flex-1 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <Copy className="w-4 h-4" />
                          Copy Loadstring
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
