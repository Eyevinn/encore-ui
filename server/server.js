import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Context } from '@osaas/client-core';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? 
    process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()) : 
    ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the React app build
const buildPath = path.join(__dirname, '../dist');
app.use(express.static(buildPath));

// Encore API configuration
const ENCORE_API_URL = process.env.ENCORE_API_URL || 'http://localhost:8080';
const ENCORE_BEARER_TOKEN = process.env.ENCORE_BEARER_TOKEN;
const OSC_ACCESS_TOKEN = process.env.OSC_ACCESS_TOKEN;

// OSC Context for dynamic token generation
let oscContext = null;
if (OSC_ACCESS_TOKEN) {
  try {
    oscContext = new Context();
    console.log('🔑 OSC Context initialized for dynamic token generation');
  } catch (error) {
    console.warn('⚠️  Failed to initialize OSC Context:', error.message);
  }
}

// Function to get bearer token (static or dynamic)
const getBearerToken = async () => {
  // Use static token if provided
  if (ENCORE_BEARER_TOKEN) {
    return ENCORE_BEARER_TOKEN;
  }
  
  // Generate dynamic token using OSC if available
  if (oscContext && OSC_ACCESS_TOKEN) {
    try {
      const sat = await oscContext.getServiceAccessToken('encore');
      return sat;
    } catch (error) {
      console.error('❌ Failed to generate OSC service access token:', error.message);
      throw new Error('Failed to generate authentication token');
    }
  }
  
  // No authentication available
  return null;
};

// Create axios instance factory for Encore API
const createEncoreApiClient = async () => {
  const token = await getBearerToken();
  
  return axios.create({
    baseURL: ENCORE_API_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  });
};

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const hasStaticToken = !!ENCORE_BEARER_TOKEN;
    const hasOscToken = !!OSC_ACCESS_TOKEN && !!oscContext;
    const token = await getBearerToken();
    
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      encoreApiUrl: ENCORE_API_URL,
      hasToken: !!token,
      authMethod: hasStaticToken ? 'static' : hasOscToken ? 'osc-dynamic' : 'none'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Token generation failed',
      message: error.message
    });
  }
});

// Generic proxy middleware
const proxyToEncore = async (req, res) => {
  try {
    const { method, url, body, query } = req;
    
    console.log(`Proxying ${method} ${url} to Encore API`);
    
    // Create API client with fresh token for each request
    const encoreApi = await createEncoreApiClient();
    
    const response = await encoreApi({
      method: method.toLowerCase(),
      url: url,
      data: body,
      params: query
    });
    
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    
    if (error.message === 'Failed to generate authentication token') {
      res.status(401).json({
        error: 'Authentication failed',
        details: 'Unable to generate or retrieve authentication token'
      });
    } else if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      res.status(error.response.status).json({
        error: error.response.data?.message || error.response.statusText,
        details: error.response.data
      });
    } else if (error.request) {
      // The request was made but no response was received
      res.status(503).json({
        error: 'Service unavailable - Could not reach Encore API',
        details: error.message
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      res.status(500).json({
        error: 'Internal server error',
        details: error.message
      });
    }
  }
};

// API Routes - proxy all API calls to Encore
app.all('/api/*', (req, res) => {
  // Remove '/api' prefix before forwarding to Encore
  req.url = req.url.replace('/api', '');
  proxyToEncore(req, res);
});

// Root API calls (for backward compatibility if frontend calls root endpoints)
app.all('/encoreJobs*', proxyToEncore);
app.all('/queue*', proxyToEncore);

// Catch-all for other potential Encore endpoints
app.all('/encore*', proxyToEncore);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// Serve React app for all non-API routes (SPA fallback)
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/') || req.path.startsWith('/health')) {
    return res.status(404).json({
      error: 'API endpoint not found',
      message: `Route ${req.method} ${req.originalUrl} not found`
    });
  }
  
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Encore UI Server running on port ${PORT}`);
  console.log(`📡 Proxying to Encore API: ${ENCORE_API_URL}`);
  
  // Authentication method logging
  if (ENCORE_BEARER_TOKEN) {
    console.log(`🔒 Authentication: Static bearer token configured`);
  } else if (OSC_ACCESS_TOKEN && oscContext) {
    console.log(`🔑 Authentication: OSC dynamic token generation enabled`);
  } else if (OSC_ACCESS_TOKEN && !oscContext) {
    console.log(`⚠️  Authentication: OSC token provided but context failed to initialize`);
  } else {
    console.log(`⚠️  Authentication: No authentication configured`);
  }
  
  console.log(`🌐 CORS origins: ${corsOptions.origin.join(', ')}`);
  console.log(`📂 Serving static files from: ${buildPath}`);
  console.log(`🌍 Access the application at: http://localhost:${PORT}`);
});