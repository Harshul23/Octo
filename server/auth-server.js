const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// GitHub OAuth callback endpoint
app.post('/auth/github/callback', async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
      },
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    const { access_token, token_type, scope } = tokenResponse.data;

    if (!access_token) {
      return res.status(400).json({ error: 'Failed to obtain access token' });
    }

    res.json({
      access_token,
      token_type,
      scope,
    });
  } catch (error) {
    console.error('GitHub OAuth error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Authentication failed',
      details: error.response?.data || error.message,
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'GitHub OAuth proxy server is running' });
});

app.listen(PORT, () => {
  console.log(`GitHub OAuth proxy server running on http://localhost:${PORT}`);
  console.log(`Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
});
