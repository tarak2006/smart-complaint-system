const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const dotenv = require('dotenv');
const uploadRoutes = require('./routes/upload');

const appInsights = require('applicationinsights');
const complaintRoutes = require('./routes/complaints');

dotenv.config();

// 1. Initialize Application Insights (as early as possible)
if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
  appInsights.setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true, true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true)
    .setUseDiskRetryCaching(true)
    .setSendLiveMetrics(false)
    .setDistributedTracingMode(appInsights.DistributedTracingModes.AI)
    .start();
}

const app = express();
const path = require('path');
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/bot', require('./routes/bot'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/chat', require('./routes/chat'));

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Appliance Service API</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0a0a0a; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { background: #1a1a1a; padding: 2rem; border-radius: 12px; border: 1px solid #333; box-shadow: 0 10px 30px rgba(0,0,0,0.5); text-align: center; }
            h1 { color: #3b82f6; margin-bottom: 0.5rem; }
            p { color: #888; }
            .status { color: #10b981; font-weight: bold; margin-top: 1rem; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>Backend is LIVE! 🚀</h1>
            <p>Appliance Service Management System API</p>
            <div class="status">● System Operational</div>
        </div>
    </body>
    </html>
  `);
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    version: '1.0.1',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'production'
  });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
