export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { language, code, stdin } = req.body;

    // Map language to Wandbox compiler ID
    const compilerMap = {
      'python': 'python3',
      'javascript': 'node-head',
      'cpp': 'clang-head',
      'c': 'clang-head',
      'java': 'openjdk-head',
      'bash': 'bash',
      'kotlin': 'kotlin-head',
      'typescript': 'node-head'
    };

    const compiler = compilerMap[language] || 'python3';

    // Call Wandbox API
    const wandboxRes = await fetch('https://wandbox.org/api/compile.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        compiler: compiler,
        code: code,
        stdin: stdin || '',
        'compiler-option-raw': language === 'cpp' ? '-std=c++17' : ''
      })
    });

    const data = await wandboxRes.json();
    
    // Transform Wandbox response to match our format
    const result = {
      stdout: data.program_output || data.output || '',
      stderr: data.compiler_error || data.error || data.compiler_message || ''
    };
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Execution error:', error);
    return res.status(500).json({ error: error.message });
  }
}
