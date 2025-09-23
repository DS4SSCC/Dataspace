import { pbkdf2Sync, randomBytes } from 'crypto';

export type PasswordDefinition = {
    password_salt: string,
    password_hash: string,
    password_digest: string
}

export function hash(password: string, digest: string = 'sha256'):PasswordDefinition {
	const salt = randomBytes(32).toString('hex');
	const genHash = pbkdf2Sync(password, salt, 10000, 64, digest).toString('hex');
	return {
		password_salt: salt,
		password_hash: genHash,
		password_digest: digest
	};
}

export function validate(password: string, hash: string , salt: string, digest: string = 'sha256') {
	const checkHash = pbkdf2Sync(password, salt, 10000, 64, digest).toString('hex');
	return hash === checkHash;
}
