import { ORIGIN, BETTER_AUTH_SECRET } from '$app/env/private';
import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { phoneNumber } from 'better-auth/plugins/phone-number';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { isCanonicalBdPhone } from '#lib/phone.ts';
import { getDb } from '#lib/server/db/index.ts';
import { sendOtpSms } from '#lib/server/providers/sms/index.ts';

const authConfig = {
	baseURL: ORIGIN,
	secret: BETTER_AUTH_SECRET,
	plugins: [
		phoneNumber({
			// Callers must normalize with `normalizeBdPhone` before calling the auth API.
			phoneNumberValidator: isCanonicalBdPhone,
			sendOTP: ({ phoneNumber, code }) => sendOtpSms(phoneNumber, code),
			otpLength: 6,
			expiresIn: 300,
			allowedAttempts: 3,
			signUpOnVerification: {
				// Better Auth requires an email on every user; `.invalid` can never receive mail.
				getTempEmail: (phone) => `${phone.slice(1)}@phone.invalid`,
				getTempName: (phone) => phone
			}
		}),
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	]
} satisfies Omit<Parameters<typeof betterAuth>[0], 'database'>;

export const createAuth = (d1: D1Database) =>
	betterAuth({
		...authConfig,
		database: drizzleAdapter(getDb(d1), { provider: 'sqlite' })
	});

/**
 * DO NOT USE!
 *
 * This instance is used by the `auth` CLI for schema generation ONLY.
 * To access `auth` at runtime, use `event.locals.auth`.
 */
export const auth = createAuth(null!);
