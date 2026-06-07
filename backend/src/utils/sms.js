// Twilio wrapper for parent SMS — gracefully no-ops if creds absent.
let client;
function getClient() {
  if (!client && process.env.TWILIO_SID) {
    const twilio = require('twilio');
    client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);
  }
  return client;
}
exports.sendSMS = async (to, body) => {
  const c = getClient();
  if (!c) { console.log('[SMS DISABLED]', to, body); return; }
  return c.messages.create({ from: process.env.TWILIO_FROM, to, body });
};
