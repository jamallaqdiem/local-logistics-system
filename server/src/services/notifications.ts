import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export const sendTrackingSMS = async (
  toPhone: string,
  trackingToken: string,
  customerName: string,
) => {
  const trackingUrl = process.env.CLIENT_URL
    ? `${process.env.CLIENT_URL}/track/${trackingToken}`
    : `http://localhost:5173/track/${trackingToken}`;

  const message = `Hi ${customerName}, your delivery is on the way! Track your driver live here: ${trackingUrl}`;

  if (client && twilioPhoneNumber) {
    try {
      await client.messages.create({
        body: message,
        from: twilioPhoneNumber,
        to: toPhone,
      });
      console.log(`[SMS SENT] Live tracking link sent to ${toPhone}`);
    } catch (error) {
      console.error("[TWILIO ERROR] Failed to send SMS:", error);
    }
  } else {
    // Dev Mode Fallback Logging
    console.log("--------------------------------------------------");
    console.log(`[DEV NOTIFICATION] SMS to ${toPhone}`);
    console.log(`Message: ${message}`);
    console.log("--------------------------------------------------");
  }
};
