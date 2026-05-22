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

    // Map language to Rextester language ID
    const languageMap = {
      'python': 5,      // Python 3
      'javascript': 18, // Node.js
      'cpp': 1,         // C++
      'c': 27,          // C
      'java': 10,       // Java
      'bash': 28,       // Bash
      'kotlin': 19,     // Kotlin
      'typescript': 18  // Node.js (TypeScript)
    };

    const languageId = languageMap[language] || 5;

    // Call Rextester API
    const rextesterRes = await fetch('https://rextester.com/api/compile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        LanguageChoice: languageId,
        Program: code,
        Input: stdin || '',
        CompilerArgs: ''
      }).toString()
    });

    const data = await rextesterRes.json();
    
    // Transform Rextester response to match our format
    const result = {
      stdout: data.Output || data.Result || '',
      stderr: data.Errors || data.Error || ''
    };
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Execution error:', error);
    return res.status(500).json({ error: error.message });
  }
}
