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

    // Call JDoodle API
    const jdoodleRes = await fetch('https://api.jdoodle.com/v1/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: 'd8c13286d7e3d33d8c13286d7e3d33d',
        clientSecret: 'e2157a97d2eb3e8f1a9d2eb3e8f1a9d2eb3e8f1a9d2eb3e8f',
        script: code,
        language: language,
        stdin: stdin || '',
        versionIndex: '0'
      })
    });

    const data = await jdoodleRes.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Execution error:', error);
    return res.status(500).json({ error: error.message });
  }
}
