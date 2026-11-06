import { dev } from '$app/env';

/**
 * Sends a login OTP by SMS.
 *
 * No SMS gateway has been chosen yet. The dev server prints the code to the terminal;
 * every built deployment (staging and production) refuses to send, so a missing gateway
 * fails closed instead of silently skipping verification.
 */
export async function sendOtpSms(phoneNumber: string, code: string): Promise<void> {
	if (dev) {
		console.warn(`[sms:dev] OTP for ${phoneNumber}: ${code}`);
		return;
	}

	throw new Error('SMS gateway is not configured');
}
