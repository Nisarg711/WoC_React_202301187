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

    // Map languages to Paiza language codes
    const languageMap = {
      'python': 'python3',
      'javascript': 'javascript',
      'cpp': 'cpp',
      'c': 'c',
      'java': 'java',
      'bash': 'bash',
      'kotlin': 'kotlin',
      'typescript': 'javascript'
    };

    const lang = languageMap[language] || 'python3';

    // Step 1: Create execution request
    const createRes = await fetch('https://api.paiza.io/runners/create.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        source_code: code,
        language: lang,
        input: stdin || ''
      }).toString()
    });

    if (!createRes.ok) {
      throw new Error(`Paiza create failed: ${createRes.status}`);
    }

    const createData = await createRes.json();
    const sessionId = createData.id;

    if (!sessionId) {
      throw new Error('No session ID returned');
    }

    // Step 2: Poll for result
    let result = null;
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      const statusRes = await fetch(`https://api.paiza.io/runners/get_status.json?id=${sessionId}`);
      
      if (!statusRes.ok) {
        throw new Error(`Status check failed: ${statusRes.status}`);
      }

      const statusData = await statusRes.json();
      
      if (statusData.status === 'completed') {
        result = {
          stdout: statusData.stdout || '',
          stderr: statusData.stderr || ''
        };
        break;
      }
      
      attempts++;
    }

    if (!result) {
      return res.status(500).json({ error: 'Execution timeout' });
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error('Execution error:', error);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
}
