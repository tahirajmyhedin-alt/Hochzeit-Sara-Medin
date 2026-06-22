export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const chunks = [];

    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);

    const fileName =
      req.headers['x-file-name'] ||
      `hochzeit-${Date.now()}.jpg`;

    const response = await fetch(
      'https://content.dropboxapi.com/2/files/upload',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.DROPBOX_ACCESS_TOKEN}`,
          'Content-Type': 'application/octet-stream',
          'Dropbox-API-Arg': JSON.stringify({
            path: `/Hochzeitsbilder/${Date.now()}-${fileName}`,
            mode: 'add',
            autorename: true
          })
        },
        body: buffer
      }
    );

    if (!response.ok) {
      const text = await response.text();
      return res.status(500).json({ error: text });
    }

    return res.status(200).json({
      success: true
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
}
