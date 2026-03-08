import { ReactNode } from 'react';
import { Navbar } from './Navbar';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-violet-500/30 selection:text-violet-200">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="border-t border-zinc-800 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-zinc-500 text-sm">
          &copy; {new Date().getFullYear()} Nova Obfuscador v1. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

