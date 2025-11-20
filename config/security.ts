export const securityConfig = {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  
  jwt: {
    secret: process.env.JWT_SECRET!,
    refreshSecret: process.env.JWT_REFRESH_SECRET!,
    expiresIn: '7d',
    refreshExpiresIn: '30d'
  },
  
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },
  
  bcrypt: {
    saltRounds: 10
  },
  
  session: {
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}

export const packageConfig = {
  allowedAmounts: [1, 2, 3, 500, 1000, 3000, 5000, 10000, 25000, 50000],
  minAmount: 1,
  maxAmount: 50000,
  withdrawalMinimum: 20
}

export const contentSecurityPolicy = {
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    scriptSrc: ["'self'"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'"],
    fontSrc: ["'self'"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"],
  }
}
