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

app.get('/', (req, res) => {
  res.send('<h1>Backend is LIVE!</h1><p>If you see this, the server is running correctly from the root folder.</p>');
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
