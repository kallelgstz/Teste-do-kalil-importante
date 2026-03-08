import { Copy, Server } from 'lucide-react';
import Prism from 'prismjs';
import Editor from 'react-simple-code-editor';
import 'prismjs/components/prism-json';
import 'prismjs/themes/prism-dark.css';

export function ApiDocs() {
  const exampleRequest = `
curl -X POST https://nova-obf.netlify.app/v1/obf \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "code": "print(\\"Hello World\\")",
    "level": "premium"
  }'
  `.trim();

  const exampleResponse = `
{
  "success": true,
  "code": "-- Obfuscated Code...",
  "level": "premium"
}
  `.trim();

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="space-y-4 border-b border-zinc-800 pb-8">
        <h1 className="text-4xl font-bold text-white flex items-center gap-3">
          <Server className="text-violet-500" />
          API Documentation
        </h1>
        <p className="text-zinc-400 text-lg">
          Integrate our powerful Lua obfuscation engine directly into your workflow or application.
        </p>
      </div>

      <div className="space-y-8">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-zinc-100 flex items-center gap-2">
            <span className="bg-violet-500/10 text-violet-400 text-sm px-2 py-1 rounded">POST</span>
            /v1/obf
          </h2>
          <p className="text-zinc-400">
            Obfuscates a Lua script with the specified security level.
          </p>
          
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Parameters</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-400">
                <thead className="text-zinc-500 border-b border-zinc-800">
                  <tr>
                    <th className="py-2 px-4">Field</th>
                    <th className="py-2 px-4">Type</th>
                    <th className="py-2 px-4">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  <tr>
                    <td className="py-3 px-4 font-mono text-violet-400">code</td>
                    <td className="py-3 px-4">string</td>
                    <td className="py-3 px-4">The raw Lua source code to obfuscate.</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono text-violet-400">level</td>
                    <td className="py-3 px-4">string</td>
                    <td className="py-3 px-4">Security level: <code className="bg-zinc-800 px-1 py-0.5 rounded">weak</code>, <code className="bg-zinc-800 px-1 py-0.5 rounded">medium</code>, <code className="bg-zinc-800 px-1 py-0.5 rounded">harder</code>, <code className="bg-zinc-800 px-1 py-0.5 rounded">strong</code>, <code className="bg-zinc-800 px-1 py-0.5 rounded">premium</code></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono text-violet-400">key</td>
                    <td className="py-3 px-4">string</td>
                    <td className="py-3 px-4">Optional. API Key required for <code className="bg-zinc-800 px-1 py-0.5 rounded">premium</code> level access.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-zinc-100">Example Request</h2>
          <div className="relative rounded-lg border border-zinc-800 bg-zinc-950 p-4 font-mono text-sm overflow-hidden group">
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <button 
                onClick={() => navigator.clipboard.writeText(exampleRequest)}
                className="p-2 bg-zinc-800 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white"
              >
                <Copy size={14} />
              </button>
            </div>
            <pre className="text-zinc-300 overflow-x-auto whitespace-pre-wrap">
              {exampleRequest}
            </pre>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-zinc-100">Example Response</h2>
           <div className="relative rounded-lg border border-zinc-800 bg-zinc-950 font-mono text-sm overflow-hidden">
            <Editor
              value={exampleResponse}
              onValueChange={() => {}}
              highlight={code => Prism.highlight(code, Prism.languages.json, 'json')}
              padding={20}
              readOnly
              style={{
                fontFamily: '"Fira Code", monospace',
                fontSize: 14,
                backgroundColor: 'transparent',
              }}
            />
          </div>
        </section>

        <div className="bg-violet-900/10 border border-violet-500/20 rounded-lg p-6 text-center space-y-4">
          <h3 className="text-lg font-semibold text-violet-300">Ready to start?</h3>
          <p className="text-zinc-400">Get your API key by logging into your account dashboard.</p>
          <button className="px-6 py-2 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-lg transition-colors">
            Get API Key
          </button>
        </div>
      </div>
    </div>
  );
}

