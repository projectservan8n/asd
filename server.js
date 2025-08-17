const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
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
        },
    },
}));

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://yourdomain.com'] 
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Set correct MIME types first
app.use((req, res, next) => {
    if (req.url.endsWith('.css')) {
        res.type('text/css');
    } else if (req.url.endsWith('.js') && !req.url.includes('node_modules')) {
        res.type('application/javascript');
    }
    next();
});

// Serve static files from root directory
app.use(express.static(__dirname, {
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.set('Content-Type', 'text/css');
        } else if (path.endsWith('.js')) {
            res.set('Content-Type', 'application/javascript');
        }
    }
}));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint for calculation data (optional)
app.post('/api/calculate', (req, res) => {
    try {
        const { emailsPerWeek, dataEntry, followUps, reporting } = req.body;
        
        // Validation
        if (typeof emailsPerWeek !== 'number' || emailsPerWeek < 0 || emailsPerWeek > 1000) {
            return res.status(400).json({ error: 'Invalid emailsPerWeek value' });
        }
        if (typeof dataEntry !== 'number' || dataEntry < 0 || dataEntry > 100) {
            return res.status(400).json({ error: 'Invalid dataEntry value' });
        }
        if (typeof followUps !== 'number' || followUps < 0 || followUps > 500) {
            return res.status(400).json({ error: 'Invalid followUps value' });
        }
        if (typeof reporting !== 'number' || reporting < 0 || reporting > 100) {
            return res.status(400).json({ error: 'Invalid reporting value' });
        }

        // Calculation logic (same as frontend)
        const TIME_SAVINGS = {
            emailsPerWeek: 0.02,
            dataEntry: 0.7,
            followUps: 0.08,
            reporting: 0.6
        };

        const emailHours = emailsPerWeek * TIME_SAVINGS.emailsPerWeek;
        const dataEntryHours = dataEntry * TIME_SAVINGS.dataEntry;
        const followUpHours = followUps * TIME_SAVINGS.followUps;
        const reportingHours = reporting * TIME_SAVINGS.reporting;

        const totalHours = Math.max(Math.round(emailHours + dataEntryHours + followUpHours + reportingHours), 1);

        res.json({
            success: true,
            totalHours,
            breakdown: {
                email: Math.round(emailHours * 10) / 10,
                dataEntry: Math.round(dataEntryHours * 10) / 10,
                followUp: Math.round(followUpHours * 10) / 10,
                reporting: Math.round(reportingHours * 10) / 10
            }
        });
    } catch (error) {
        console.error('Calculation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Analytics endpoint (optional)
app.post('/api/analytics', (req, res) => {
    try {
        const { event, properties } = req.body;
        
        // Log analytics data (integrate with your analytics service)
        console.log('Analytics Event:', {
            timestamp: new Date().toISOString(),
            event,
            properties,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Lead capture endpoint (optional)
app.post('/api/lead', (req, res) => {
    try {
        const { email, phone, company, calculatedHours } = req.body;
        
        // Basic validation
        if (!email || !email.includes('@')) {
            return res.status(400).json({ error: 'Valid email is required' });
        }

        // Store lead data (integrate with your CRM/database)
        console.log('New lead:', {
            timestamp: new Date().toISOString(),
            email,
            phone: phone || null,
            company: company || null,
            calculatedHours: calculatedHours || null,
            ip: req.ip
        });

        res.json({ success: true, message: 'Lead captured successfully' });
    } catch (error) {
        console.error('Lead capture error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Handle 404 errors
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        error: 'Something went wrong!',
        ...(process.env.NODE_ENV === 'development' && { details: err.message })
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
