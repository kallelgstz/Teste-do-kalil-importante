
import { readFileSync, writeFileSync } from 'fs';
import { obfuscateLua, ObfuscationLevel } from './utils/obfuscator';

const args = process.argv.slice(2);

if (args.length < 3) {
    console.error("Usage: npx tsx src/cli.ts <input_file> <output_file> <level>");
    process.exit(1);
}

const inputFile = args[0];
const outputFile = args[1];
const level = args[2] as ObfuscationLevel;

const validLevels = ['weak', 'medium', 'harder', 'strong', 'premium'];
if (!validLevels.includes(level)) {
    console.error(`Invalid level: ${level}. Must be one of: ${validLevels.join(', ')}`);
    process.exit(1);
}

try {
    const code = readFileSync(inputFile, 'utf-8');
    const obfuscated = obfuscateLua(code, level);
    writeFileSync(outputFile, obfuscated);
    console.log(`Successfully obfuscated ${inputFile} to ${outputFile} with level ${level}`);
} catch (error) {
    console.error("Error during obfuscation:", error);
    process.exit(1);
}
