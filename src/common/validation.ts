// src/common/validation.ts

const EMAIL_REGEX =
	/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Validates email format on client-side (RFC 5322 pattern)
 * @param email - Email address to validate
 * @returns true if format is valid, false otherwise
 */
export function validateEmailFormat(email: string): boolean {
	if (!email || typeof email !== "string") {
		return false;
	}

	// Check for double dots, leading/trailing dots
	if (email.includes("..") || email.startsWith(".") || email.includes(".@")) {
		return false;
	}

	return EMAIL_REGEX.test(email.trim());
}
