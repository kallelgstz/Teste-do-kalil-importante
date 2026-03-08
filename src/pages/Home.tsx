import React, { useState, useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-lua';
import 'prismjs/themes/prism-dark.css'; 
import { motion } from 'framer-motion';
import { Copy, ShieldCheck, Download, Zap, Layers, Lock, Cpu, Check, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ObfuscationLevel, obfuscateLua } from '../utils/obfuscator';

const levels: { id: ObfuscationLevel; label: string; icon: React.ElementType; description: string; color: string }[] = [
  { id: 'weak', label: 'Weak', icon: ShieldCheck, description: 'Basic minification & comment removal.', color: 'text-zinc-400' },
  { id: 'medium', label: 'Medium', icon: Layers, description: 'Variable renaming & hex encoding.', color: 'text-blue-400' },
  { id: 'harder', label: 'Harder', icon: Cpu, description: 'XOR Encryption & Control Flow.', color: 'text-cyan-400' },
  { id: 'strong', label: 'Strong', icon: Lock, description: 'VM-based Protection (No Anti-Tamper).', color: 'text-violet-400' },
  { id: 'premium', label: 'Premium', icon: Zap, description: 'Full VM + Advanced Anti-Tamper.', color: 'text-yellow-400' },
];

export function Home() {
  const [code, setCode] = useState('-- Paste your Lua script here\nprint("Hello World")');
  const [output, setOutput] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<ObfuscationLevel>('weak');
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleObfuscate = () => {
    setIsProcessing(true);
    
    // Process async
    setTimeout(async () => {
      const result = obfuscateLua(code, selectedLevel);
      
      // Directly show the obfuscated code
      setOutput(result);
      
      // If user is logged in, save to backend for history
      if (user) {
        try {
          const payload: any = { code: result, title: `Script (${selectedLevel})` };
          payload.owner = user.nickname;

          // Fire and forget save
          fetch('/.netlify/functions/save-script', {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' }
          }).catch(e => console.warn('Background save failed', e));
          
        } catch (e) {
          console.warn('Failed to save script to backend', e);
        }
      }
      
      setIsProcessing(false);
    }, 800); 
  };

  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `obfuscated_${selectedLevel}.lua`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-500">
          Nova Obfuscador v1
        </h1>
        <p className="text-zinc-400 max-w-2xl mx-auto">
          Protect your Roblox scripts with our advanced Lua obfuscation engine. 
          Choose from multiple security levels to balance performance and protection.
        </p>
        {!user && (
           <div className="mt-4">
             <Link to="/login" className="text-violet-400 hover:text-violet-300 text-sm underline underline-offset-4">
               Login to save scripts & generate Lua Links
             </Link>
           </div>
        )}
      </div>

      {/* Level Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {levels.map((level) => (
          <motion.button
            key={level.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedLevel(level.id)}
            className={`p-4 rounded-xl border transition-all text-left space-y-2
              ${selectedLevel === level.id 
                ? 'bg-zinc-900 border-violet-500 ring-1 ring-violet-500' 
                : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
              }`}
          >
            <div className={`p-2 w-fit rounded-lg bg-zinc-900 ${level.color}`}>
              <level.icon size={20} />
            </div>
            <div>
              <h3 className={`font-semibold ${selectedLevel === level.id ? 'text-white' : 'text-zinc-300'}`}>
                {level.label}
              </h3>
              <p className="text-xs text-zinc-500 mt-1">{level.description}</p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Editors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-sm font-medium text-zinc-400">Input Script</span>
            <span className="text-xs text-zinc-600">{code.length} chars</span>
          </div>
          <div className="relative rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden h-[400px]">
            <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
              <Editor
                value={code}
                onValueChange={setCode}
                highlight={code => Prism.highlight(code, Prism.languages.lua, 'lua')}
                padding={20}
                className="font-mono text-sm min-h-full"
                textareaClassName="focus:outline-none"
                style={{
                  fontFamily: '"Fira Code", "Fira Mono", monospace',
                  fontSize: 14,
                  backgroundColor: 'transparent',
                  color: '#e4e4e7',
                }}
              />
            </div>
          </div>
        </div>

        {/* Output */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-sm font-medium text-zinc-400">Obfuscated Output</span>
            <div className="flex gap-2">
              <button 
                onClick={copyToClipboard}
                disabled={!output}
                className={`p-1.5 rounded transition-colors ${copied ? 'text-green-400' : 'text-zinc-400 hover:text-white disabled:opacity-50'}`}
                title={copied ? "Copied!" : "Copy"}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
              <button 
                onClick={downloadFile}
                disabled={!output}
                className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-50 transition-colors"
                title="Download"
              >
                <Download size={16} />
              </button>
            </div>
          </div>
          <div className="relative rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden h-[400px]">
             {isProcessing ? (
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-sm z-10">
                 <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                 <p className="mt-4 text-sm text-violet-400 font-medium animate-pulse">Obfuscating...</p>
               </div>
             ) : output ? (
              <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
                <Editor
                  value={output}
                  onValueChange={() => {}} 
                  highlight={code => Prism.highlight(code, Prism.languages.lua, 'lua')}
                  padding={20}
                  readOnly
                  className="font-mono text-sm min-h-full"
                  style={{
                    fontFamily: '"Fira Code", "Fira Mono", monospace',
                    fontSize: 14,
                    backgroundColor: 'transparent',
                    color: '#a1a1aa', 
                  }}
                />
              </div>
             ) : (
               <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600">
                 <Cpu size={48} className="mb-4 opacity-20" />
                 <p>Ready to process</p>
               </div>
             )}
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleObfuscate}
          disabled={isProcessing || !code.trim()}
          className="px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-full font-bold shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 transition-all"
        >
          <ShieldCheck className="w-5 h-5" />
          Obfuscate Script
        </motion.button>
      </div>
    </div>
  );
}
