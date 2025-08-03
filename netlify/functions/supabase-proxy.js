
// This is a Netlify serverless function that acts as a proxy.
// It forwards requests from your app to the real Supabase API.
const fetch = require('node-fetch');

exports.handler = async (event) => {
  // Your actual Supabase project URL.
  const supabaseUrl = 'https://qvchlehzdrdmbcsufeyw.supabase.co';
  
  // Reconstruct the path to the Supabase API.
  // event.path will be like '/api/auth/v1/token', we remove '/api'.
  const path = event.path.replace('/api', '');
  const targetUrl = `${supabaseUrl}${path}`;

  // Forward most headers from the client, but set the correct 'host'.
  const headers = { ...event.headers };
  headers.host = new URL(supabaseUrl).host;

  try {
    const response = await fetch(targetUrl, {
      method: event.httpMethod,
      headers: headers,
      body: event.body,
      redirect: 'follow'
    });

    const data = await response.text();

    // Create a new headers object to send back to the client.
    const responseHeaders = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    // Return the exact response from Supabase to the client.
    return {
      statusCode: response.status,
      body: data,
      headers: responseHeaders,
    };

  } catch (error) {
    console.error("Proxy Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Proxy request failed', details: error.message }),
    };
  }
};
