import { readFileSync, writeFileSync } from 'fs';

// These are the corrupted sequences: UTF-8 bytes read as Latin-1 then re-encoded as UTF-8
// The fix: decode the corrupted UTF-8 string back to Latin-1 bytes, then re-interpret as UTF-8
function fixMojibake(str) {
  // Encode the string as Latin-1 bytes, then decode as UTF-8
  try {
    const bytes = Buffer.from(str, 'latin1');
    return bytes.toString('utf8');
  } catch {
    return str;
  }
}

function fixFile(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  
  // We need to fix sequences that look like double-encoded UTF-8
  // Strategy: find sequences of chars that look like mojibake and fix them
  // The pattern: chars in range 0xC0-0xFF followed by chars in range 0x80-0xBF (as unicode codepoints)
  
  let result = '';
  let i = 0;
  
  while (i < raw.length) {
    const code = raw.charCodeAt(i);
    
    // Check if this looks like the start of a mojibake sequence
    // Mojibake UTF-8 chars appear as Latin-1 chars in range 0xC0-0xFF
    if (code >= 0xC0 && code <= 0xFF) {
      // Try to collect a sequence of chars that could be mojibake
      let seq = raw[i];
      let j = i + 1;
      
      // Collect continuation bytes (0x80-0xBF range as unicode)
      while (j < raw.length && raw.charCodeAt(j) >= 0x80 && raw.charCodeAt(j) <= 0xBF) {
        seq += raw[j];
        j++;
      }
      
      if (seq.length > 1) {
        // Try to decode this sequence as mojibake
        try {
          const bytes = Buffer.from(seq, 'latin1');
          const decoded = bytes.toString('utf8');
          // Only use the decoded version if it's valid UTF-8 and different
          if (decoded !== seq && !decoded.includes('\uFFFD')) {
            result += decoded;
            i = j;
            continue;
          }
        } catch {
          // Fall through
        }
      }
    }
    
    result += raw[i];
    i++;
  }
  
  if (result !== raw) {
    writeFileSync(filePath, result, 'utf8');
    console.log('Fixed:', filePath);
  } else {
    console.log('No changes:', filePath);
  }
}

const files = process.argv.slice(2);
for (const file of files) {
  fixFile(file);
}
