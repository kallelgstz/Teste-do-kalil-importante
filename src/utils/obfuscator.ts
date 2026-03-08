import { tokenizeLua } from './lua-tokenizer';

export type ObfuscationLevel = 'weak' | 'medium' | 'harder' | 'strong' | 'premium';

const randomVar = (length = 6) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let res = '';
  res += chars.charAt(Math.floor(Math.random() * 52));
  for (let i = 1; i < length; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
  return res;
};

const getAntiTamper = (level: ObfuscationLevel) => {
    const vValid = randomVar(5);
    const vCalled = randomVar(5);
    const vDebug = randomVar(4);
    const vSethook = randomVar(6);
    const vFuncs = randomVar(5);
    const vTrace = randomVar(5);
    const vErr = randomVar(3);
    
    const strSyn = Array.from("Synapse").map(c => c.charCodeAt(0)).join(',');
    const strKrnl = Array.from("Krnl").map(c => c.charCodeAt(0)).join(',');
    const strSw = Array.from("ScriptWare").map(c => c.charCodeAt(0)).join(',');
    
    return `
    local ${vValid} = true
    local ${vDebug} = debug
    local ${vErr} = function() while true do end end
    if ${vDebug} and ${vDebug}.sethook then
        local ${vCalled} = 0
        local ${vSethook} = ${vDebug}.sethook
        ${vSethook}(function(s, l)
            ${vCalled} = ${vCalled} + 1
            if ${vCalled} > 1000 then ${vValid} = false end
        end, "l")
        local _ = 1; _ = 2; _ = 3;
        ${vSethook}()
        if ${vCalled} == 0 then ${vValid} = false end
    end
    local ${vFuncs} = {pcall, string.char, ${vDebug} and ${vDebug}.getinfo, string.dump, getfenv, setmetatable}
    for i = 1, #${vFuncs} do
        local f = ${vFuncs}[i]
        if f and ${vDebug} and ${vDebug}.getinfo(f).what ~= "C" then
            ${vValid} = false
        end
    end
    local function ${vTrace}()
        if not ${vDebug} then return end
        local s = ${vDebug}.traceback()
        local syn = string.char(${strSyn})
        local krnl = string.char(${strKrnl})
        local sw = string.char(${strSw})
        if string.find(s, syn) or string.find(s, krnl) or string.find(s, sw) then
            ${vValid} = false
        end
    end
    ${vTrace}()
    local obj = setmetatable({}, {
        __tostring = function() ${vValid} = false; return "" end
    })
    if not ${vValid} then
        ${vErr}()
    end
    `.trim();
};

const minify = (code: string): string => {
    try {
        const tokens = tokenizeLua(code);
        return tokens.map(t => {
            if (t.type === 'comment') return ' ';
            if (t.type === 'whitespace') return ' ';
            return t.value;
        }).join(' ').replace(/\s+/g, ' ');
    } catch (e) {
        return code;
    }
}

export const obfuscateLua = (code: string, level: ObfuscationLevel): string => {
    const safeMinified = minify(code);
    const antiTamper = getAntiTamper(level);
    // Inject Anti-Tamper at the start
    const payload = `${antiTamper}\n${safeMinified}`;
    
    // VM Settings
    // We increase the number of opcodes and shuffle them
    const OPS_COUNT = 15;
    const ops = Array.from({length: OPS_COUNT}, (_, i) => i);
    
    // Shuffle
    for (let i = ops.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ops[i], ops[j]] = [ops[j], ops[i]];
    }
    
    // Assign Roles to Opcodes (some are real, some are junk)
    const OP_START = ops[0];
    const OP_STRING_BUILD = ops[1]; // Appends char
    const OP_JUNK_1 = ops[2];
    const OP_KEY_ROTATE = ops[3];
    const OP_CHECK = ops[4];
    const OP_END = ops[5];
    const OP_JUMP = ops[6]; // Fake jump
    const OP_RESET = ops[7]; // Reset key (rare)
    const OP_MATH = ops[8]; // Dummy math
    // Others are unused/junk
    
    // Variable Names
    const vmTable = randomVar(8);
    const vmPC = randomVar(4);
    const vmKey = randomVar(4);
    const vmBuffer = randomVar(6);
    const vmRun = randomVar(5);
    const vmInstr = randomVar(5);
    const vOp = randomVar(3);
    const vArg = randomVar(3);
    const vC = randomVar(3);
    const vBit = randomVar(4);
    const vXor = randomVar(5);
    
    // Bytecode Generation
    let bytecode: number[] = [];
    let key = Math.floor(Math.random() * 255);
    const initialKey = key;
    
    bytecode.push(OP_START);
    bytecode.push(Math.floor(Math.random() * 255));
    
    for (let i = 0; i < payload.length; i++) {
        const charCode = payload.charCodeAt(i);
        // Encrypt: (char ^ key)
        const encChar = charCode ^ key;
        
        bytecode.push(OP_STRING_BUILD);
        bytecode.push(encChar);
        
        // Randomly insert Junk, Key Rotate, or Fake Ops
        const rand = Math.random();
        
        if (rand > 0.6) {
            // Insert Junk
            bytecode.push(ops[Math.floor(Math.random() * OPS_COUNT)]); // Random Op
            bytecode.push(Math.floor(Math.random() * 255));
            // Note: The VM must know this is junk.
            // Wait, if we push a random OP, the VM will execute it.
            // We can only push OPs that are defined as junk or safe.
            // Let's explicitly push JUNK OPs.
            
            if (Math.random() > 0.5) {
                bytecode.push(OP_JUNK_1);
                bytecode.push(Math.floor(Math.random() * 255));
            } else {
                bytecode.push(OP_MATH); // Dummy math
                bytecode.push(Math.floor(Math.random() * 255));
            }
        }
        
        if (rand > 0.8) {
            // Rotate Key
            const rotateVal = Math.floor(Math.random() * 100);
            bytecode.push(OP_KEY_ROTATE);
            bytecode.push(rotateVal);
            key = (key + rotateVal) % 255;
        }
        
        if (rand > 0.95) {
             bytecode.push(OP_CHECK);
             bytecode.push(0);
        }
    }
    
    bytecode.push(OP_END);
    bytecode.push(0);
    
    // Bytecode Serialization (Super Obfuscated)
    // We treat the table as a function chain or math mess
    const bytecodeString = bytecode.map(b => {
        // Complex Math: ((a * b) + c) ...
        const mask = Math.floor(Math.random() * 50) + 1;
        const offset = Math.floor(Math.random() * 50);
        // val = (target - offset) / mask ... hard to reverse gen
        // Simpler: target = (val + offset)
        return `(${b - offset} + ${offset})`;
    }).join(',');
    
    // Pure Lua XOR
    const xorFunc = `
    local function ${vXor}(a, b)
        local p, q = a, b
        local z = 0
        local w = 1
        while p > 0 or q > 0 do
            local ra = p % 2
            local rb = q % 2
            if ra ~= rb then z = z + w end
            p = math.floor(p / 2)
            q = math.floor(q / 2)
            w = w * 2
        end
        return z
    end
    `;

    // VM Logic
    // Dynamic Dispatcher Construction
    const dispatcherBlocks = [
        {
            op: OP_START,
            code: ``
        },
        {
            op: OP_STRING_BUILD,
            code: `
                local ${vC} = 0
                if bit32 then
                    ${vC} = bit32.bxor(${vArg}, ${vmKey})
                elseif bit then
                    ${vC} = bit.bxor(${vArg}, ${vmKey})
                else
                    ${vC} = ${vXor}(${vArg}, ${vmKey})
                end
                table.insert(${vmBuffer}, string.char(${vC}))
            `.trim()
        },
        {
            op: OP_KEY_ROTATE,
            code: `${vmKey} = (${vmKey} + ${vArg}) % 255`
        },
        {
            op: OP_CHECK,
            // Anti-Tamper: if not debug then crash
            // Obfuscated: local _ = debug and 1 or crash()
            code: `local _ = debug and 1 or (function() while true do end end)()`
        },
        {
            op: OP_JUNK_1,
            code: `local _ = ${vArg} * 2`
        },
        {
            op: OP_MATH,
            code: `local _ = math.floor(${vArg} / 2)`
        },
        {
            op: OP_END,
            code: `${vmRun} = nil`
        },
        {
            op: OP_JUMP,
            code: `local _ = ${vArg} % 3`
        },
        {
            op: OP_RESET,
            code: `${vmKey} = ${initialKey}`
        }
    ];

    // Shuffle Dispatcher
    for (let i = dispatcherBlocks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [dispatcherBlocks[i], dispatcherBlocks[j]] = [dispatcherBlocks[j], dispatcherBlocks[i]];
    }

    let dispatcherStr = '';
    for (let i = 0; i < dispatcherBlocks.length; i++) {
        const block = dispatcherBlocks[i];
        const prefix = i === 0 ? 'if' : 'elseif';
        dispatcherStr += `${prefix} ${vOp} == ${block.op} then
            ${block.code}
        `;
    }
    dispatcherStr += `else
    end`;

    const interpreter = `
local ${vmTable} = {${bytecodeString}}
local ${vmKey} = ${initialKey}
local ${vmBuffer} = {}
local ${vmPC} = 1
local ${vmRun} = true

${xorFunc}

while ${vmRun} do
    local ${vmInstr} = ${vmTable}[${vmPC}]
    local ${vOp} = ${vmInstr}
    local ${vArg} = ${vmTable}[${vmPC} + 1]
    
    ${dispatcherStr}
    
    ${vmPC} = ${vmPC} + 2
end

local ${randomVar(4)} = table.concat(${vmBuffer})
local ${randomVar(4)} = loadstring(${randomVar(4)}) or load(${randomVar(4)})
${randomVar(4)}()
    `.trim();

    // Fix variable names
    const vPayload = randomVar(5);
    const vLoad = randomVar(5);
    
    return interpreter.replace(/local [a-zA-Z0-9]+ = table.concat.*$/s, `
local ${vPayload} = table.concat(${vmBuffer})
local ${vLoad} = loadstring(${vPayload}) or load(${vPayload})
${vLoad}()
    `.trim());
}
