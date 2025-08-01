const fs = require('fs');
const path = require('path');
const getBot1Client = require("../bots/bot1/bot1");
const getBot2Client = require("../bots/bot2/bot2");
const { sendMessageToAdmin } = require("./telegram");

const sendWhatsAppMessage = async (botId, message, number) => {
  try {
    const client = botId === 'bot1' ? getBot1Client() : getBot2Client();
    if (!client) return { success: false, message: 'Client not initialized' };

    //number must be 12 in length without +
    if (number.length !== 12) return { success: false, message: 'Invalid number format. Use 12 digits without +' };

    const chatId = `${number}@c.us`
    await client.sendMessage(chatId, message);
    return { success: true, message: `Message sent to ${chatId}` };
  } catch (error) {
    console.error(`Error sending WhatsApp message for ${botId}:`, error);
    return { success: false, message: `Failed to send message for ${botId}: ${error.message}` };
  }
};

const sendWhatsAppChannelMessage = async (botId, message, channelId) => {
  try {
    const client = botId === 'bot1' ? getBot1Client() : getBot2Client();
    if (!client) return { success: false, message: 'Client not initialized' };

    await client.sendMessage(channelId, message);
    return { success: true, message: `Message sent to ${channelId}` };
  } catch (error) {
    console.error(`Error sending WhatsApp channel message for ${botId}:`, error);
    return { success: false, message: `Failed to send channel message for ${botId}: ${error.message}` };
  }
};

function clearSession(clientId) {
  const sessionFolder = `session-${clientId.replace(/_/g, '-')}`;
  const sessionPath = path.join(__dirname, '..', '.wwebjs_auth', sessionFolder);

  if (fs.existsSync(sessionPath)) {
    fs.rmSync(sessionPath, { recursive: true, force: true });
    console.log(`[clearSession] Deleted session for "${clientId}"`);
    sendMessageToAdmin(`✅ Session for bot1 cleared successfully`)
    return true;
  } else {
    console.log(`[clearSession] No session found for "${clientId}"`);
    sendMessageToAdmin(`❌ No session found for "${clientId}"`)
    return false;
  }
}

module.exports = { sendWhatsAppMessage, sendWhatsAppChannelMessage, clearSession };