export const corsConfig = {
  origin: process.env.NODE_ENV === 'development' 
    ? ['http://localhost:5173'] // Vite's default port
    : ['https://your-production-domain.com'], // Replace with your production domain
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600 // 10 minutes
}; 