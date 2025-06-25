export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Eliminar espacios en blanco al final de la URL y token
  const directusUrl = (process.env.VITE_DIRECTUS_URL || 'https://admin-api-directus.dqyvuv.easypanel.host').trim();
  const directusToken = (process.env.VITE_DIRECTUS_TOKEN || 'mcp_414xdh4vq47mcao0jg2').trim();
  
  // Extract the path from the query parameters
  const { path } = req.query;
  const pathString = Array.isArray(path) ? path.join('/') : path || '';
  const targetUrl = `${directusUrl}/${pathString}`;

  console.log('Proxying request to:', targetUrl);
  console.log('Method:', req.method);
  console.log('Body:', req.body);

  try {
    const headers = {};

    // Copy relevant headers
    if (req.headers['content-type']) {
      headers['Content-Type'] = req.headers['content-type'];
    }
    
    // Always add the Directus token
    headers['Authorization'] = `Bearer ${directusToken}`;

    const options = {
      method: req.method,
      headers,
    };

    // Add body for POST, PUT, PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      options.body = JSON.stringify(req.body);
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(targetUrl, options);
    
    // Get response text first
    const responseText = await response.text();
    
    // Set the response status
    res.status(response.status);
    
    // Try to parse as JSON, otherwise return as text
    try {
      const data = JSON.parse(responseText);
      res.json(data);
    } catch (e) {
      // If not JSON, return the raw text
      res.send(responseText);
    }
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message,
      targetUrl: targetUrl 
    });
  }
}
