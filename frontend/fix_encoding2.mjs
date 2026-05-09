import { readFileSync, writeFileSync } from 'fs';

// The corrupted sequences are UTF-8 bytes that were read as Latin-1 and then re-encoded as UTF-8
// To fix: for each char in the string, if it's in the Latin-1 extended range (0x80-0xFF),
// collect consecutive such chars and try to decode them as UTF-8

function fixMojibake(str) {
  // Convert the string to a buffer treating each char as its Unicode codepoint (which equals Latin-1 byte value for 0x00-0xFF)
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code <= 0xFF) {
      bytes.push(code);
    } else {
      // Multi-byte Unicode char - keep as-is by encoding to UTF-8
      const encoded = Buffer.from(str[i], 'utf8');
      for (const b of encoded) bytes.push(b);
    }
  }
  
  // Now try to decode the byte array as UTF-8
  const buf = Buffer.from(bytes);
  try {
    const decoded = buf.toString('utf8');
    // Check if decoding introduced replacement chars
    if (!decoded.includes('\uFFFD')) {
      return decoded;
    }
  } catch {}
  
  return str;
}

// More targeted approach: find sequences of chars that look like mojibake
// and fix them individually
function fixFile(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  
  // Build a byte array from the string, treating each char as its codepoint (Latin-1 compatible)
  // Then decode as UTF-8
  let result = '';
  let i = 0;
  
  while (i < raw.length) {
    const code = raw.charCodeAt(i);
    
    // If this char is in the Latin-1 extended range (0x80-0xFF), it might be mojibake
    if (code >= 0x80 && code <= 0xFF) {
      // Collect a sequence of chars in the 0x80-0xFF range
      const seqStart = i;
      const seqBytes = [];
      
      while (i < raw.length && raw.charCodeAt(i) >= 0x80 && raw.charCodeAt(i) <= 0xFF) {
        seqBytes.push(raw.charCodeAt(i));
        i++;
      }
      
      // Try to decode this sequence as UTF-8
      const buf = Buffer.from(seqBytes);
      try {
        const decoded = buf.toString('utf8');
        if (!decoded.includes('\uFFFD') && decoded !== raw.slice(seqStart, i)) {
          result += decoded;
          continue;
        }
      } catch {}
      
      // Fall back to original chars
      result += raw.slice(seqStart, i);
    } else {
      result += raw[i];
      i++;
    }
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
