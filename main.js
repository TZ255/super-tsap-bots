require('dotenv').config();
const express = require('express');
const TelegramWhatsAppManagerBot = require('./telegram/bot');
const { start, stop, restart, status } = require('./controllers/botManager');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

function checkEnv() {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN is required');
    process.exit(1);
  }
  
  if (!process.env.TELEGRAM_ADMIN_ID) {
    console.error('❌ TELEGRAM_ADMIN_ID is required');
    process.exit(1);
  }
  
  console.log('✅ Environment variables OK');
}

// Basic health check route
app.get('/', (req, res) => {
  res.json({ 
    status: 'running',
    service: 'WhatsApp Bot Manager',
    timestamp: new Date().toISOString()
  });
});

// Bot status API endpoint
app.get('/api/status', (req, res) => {
  try {
    const botStatus = status();
    res.json({
      success: true,
      data: botStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// // Start bot endpoint
// app.post('/api/start/:botId', (req, res) => {
//   const { botId } = req.params;
  
//   if (botId !== 'bot1' && botId !== 'bot2') {
//     return res.status(400).json({
//       success: false,
//       error: 'Invalid bot ID. Use bot1 or bot2'
//     });
//   }
  
//   try {
//     start[botId]();
//     res.json({
//       success: true,
//       message: `${botId} start command sent`,
//       timestamp: new Date().toISOString()
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

// // Stop bot endpoint
// app.post('/api/stop/:botId', async (req, res) => {
//   const { botId } = req.params;
  
//   if (botId !== 'bot1' && botId !== 'bot2') {
//     return res.status(400).json({
//       success: false,
//       error: 'Invalid bot ID. Use bot1 or bot2'
//     });
//   }
  
//   try {
//     await stop[botId]();
//     res.json({
//       success: true,
//       message: `${botId} stopped`,
//       timestamp: new Date().toISOString()
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

// // Restart bot endpoint
// app.post('/api/restart/:botId', async (req, res) => {
//   const { botId } = req.params;
  
//   if (botId !== 'bot1' && botId !== 'bot2') {
//     return res.status(400).json({
//       success: false,
//       error: 'Invalid bot ID. Use bot1 or bot2'
//     });
//   }
  
//   try {
//     await restart[botId]();
//     res.json({
//       success: true,
//       message: `${botId} restart command sent`,
//       timestamp: new Date().toISOString()
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Express error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

async function startServer() {
  try {
    console.log('🚀 Starting WhatsApp Bot Manager Server...');
    
    checkEnv();
    
    // Start Telegram bot
    console.log('📱 Initializing Telegram bot...');
    TelegramWhatsAppManagerBot();
    
    // Start Express server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Express server running on port ${PORT}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/`);
      console.log(`📊 Bot status: http://localhost:${PORT}/api/status`);
      console.log('📱 Send /start to Telegram bot to manage WhatsApp bots');
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
function shutdown() {
  console.log('\n🛑 Shutting down server...');
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  shutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  shutdown();
});

startServer();