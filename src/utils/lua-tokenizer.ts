
export type TokenType = 'code' | 'string' | 'comment';

export interface Token {
    type: TokenType;
    value: string;
}

export function tokenizeLua(code: string): Token[] {
    const tokens: Token[] = [];
    let current = 0;
    
    while (current < code.length) {
        const char = code[current];
        
        // 1. Comments
        if (char === '-' && code[current + 1] === '-') {
            const start = current;
            // Check if block comment --[[ or --[=[
            let isBlock = false;
            let level = 0;
            let contentStart = current + 2;
            
            if (code[contentStart] === '[') {
                isBlock = true;
                level = 0;
                contentStart++; // Points after [[
            } else if (code[contentStart] === '=') {
                let check = contentStart;
                while (check < code.length && code[check] === '=') {
                    check++;
                }
                if (code[check] === '[') {
                    isBlock = true;
                    level = check - contentStart;
                    contentStart = check + 1; // Points after [=*[
                }
            }
            
            if (isBlock) {
                const closePattern = ']' + '='.repeat(level) + ']';
                const closeIndex = code.indexOf(closePattern, contentStart);
                if (closeIndex !== -1) {
                    current = closeIndex + closePattern.length;
                } else {
                    current = code.length; // Unclosed comment consumes rest
                }
            } else {
                // Line comment
                const newlineIndex = code.indexOf('\n', current);
                if (newlineIndex !== -1) {
                    current = newlineIndex; // Stop before newline? Or consume?
                    // Usually comments end at newline. We can include the newline or not.
                    // Let's include up to newline but not the newline itself, so code structure is preserved?
                    // Or include the newline in the comment token?
                    // If we remove the comment token, we remove the newline too?
                    // That might merge lines: `a=1 --comment\nb=2` -> `a=1 b=2`. Valid.
                    // `a=1 --comment\n` -> `a=1`. Valid.
                    // But if `a=1 --comment` (EOF), then `a=1`. Valid.
                    // Let's exclude the newline from the comment so it remains as Code (whitespace).
                    current = newlineIndex;
                } else {
                    current = code.length;
                }
            }
            tokens.push({ type: 'comment', value: code.slice(start, current) });
            continue;
        }
        
        // 2. Strings (Short)
        if (char === '"' || char === "'") {
            const start = current;
            const quote = char;
            current++;
            
            while (current < code.length) {
                if (code[current] === quote) {
                    // Check if escaped
                    let backslashCount = 0;
                    let i = current - 1;
                    while (i >= start && code[i] === '\\') {
                        backslashCount++;
                        i--;
                    }
                    if (backslashCount % 2 === 0) {
                        current++; // Consume closing quote
                        break;
                    }
                }
                current++;
            }
            tokens.push({ type: 'string', value: code.slice(start, current) });
            continue;
        }
        
        // 3. Long Strings [[ ... ]] or [=[ ... ]=]
        // Note: Long strings start with [ followed by [ or =...=[
        // If it is just [, it's code (table constructor or index)
        if (char === '[') {
            let isLongString = false;
            let level = 0;
            let contentStart = current + 1;
            
            if (code[contentStart] === '[') {
                isLongString = true;
                level = 0;
                contentStart++;
            } else if (code[contentStart] === '=') {
                let check = contentStart;
                while (check < code.length && code[check] === '=') {
                    check++;
                }
                if (code[check] === '[') {
                    isLongString = true;
                    level = check - contentStart;
                    contentStart = check + 1;
                }
            }
            
            if (isLongString) {
                const start = current;
                const closePattern = ']' + '='.repeat(level) + ']';
                const closeIndex = code.indexOf(closePattern, contentStart);
                if (closeIndex !== -1) {
                    current = closeIndex + closePattern.length;
                } else {
                    current = code.length;
                }
                tokens.push({ type: 'string', value: code.slice(start, current) });
                continue;
            }
        }
        
        // 4. Code
        // Consume until we hit something that looks like start of comment or string
        const start = current;
        while (current < code.length) {
            const c = code[current];
            
            // Check for comment start
            if (c === '-' && code[current + 1] === '-') break;
            
            // Check for string start
            if (c === '"' || c === "'") break;
            
            // Check for long string start
            if (c === '[') {
                let check = current + 1;
                if (code[check] === '[') break;
                if (code[check] === '=') {
                    while (check < code.length && code[check] === '=') check++;
                    if (code[check] === '[') break;
                }
            }
            
            current++;
        }
        
        if (current > start) {
            tokens.push({ type: 'code', value: code.slice(start, current) });
        } else {
            // Force progress if we didn't match anything (e.g. '[' that isn't a long string)
            // But the 'Code' loop consumes everything except what matches the break conditions.
            // If we broke, it means we found a start.
            // If we didn't break, we hit EOF.
            // So if current == start, it means we are at a special char.
            // But we already checked for special chars in 1, 2, 3.
            // The only case we fall through to 4 is if 1, 2, 3 didn't match.
            // So if 4 breaks immediately, it must be because it sees a special char.
            // BUT 1, 2, 3 should have handled it!
            // Wait.
            // If I have `[` (code), step 3 checks if it is long string. If not, it continues to 4.
            // Step 4 sees `[`. It checks if it is long string. If not, it continues consuming!
            // So it works.
            // Example: `t[1]`.
            // `t` -> Code.
            // `[` -> Step 3 checks. Not long string. Step 4 loop starts.
            // Loop sees `[`. Checks break condition. `[` is NOT long string start. Loop continues.
            // `1` -> Loop continues.
            // `]` -> Loop continues.
            // Works.
            
            // Example: `print"hi"`
            // `print` -> Code.
            // `"` -> Code loop breaks.
            // Next iteration: Step 2 handles `"`.
            // Works.
            
            if (current === start && current < code.length) {
                // This shouldn't happen if logic is correct, but as safeguard:
                tokens.push({ type: 'code', value: code[current] });
                current++;
            }
        }
    }
    
    return tokens;
}
