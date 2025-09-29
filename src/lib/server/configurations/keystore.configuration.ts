import { createPublicKey, createSecretKey, generateKeyPairSync } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { env } from '@sourceregistry/node-env';

const publicKeyPath = env.string('SECRET_PUBLIC_KEY_PATH', 'res/secret/public_key.pem');
const privateKeyPath = env.string('SECRET_PRIVATE_KEY_PATH', 'res/secret/private_key.pem');

function ensureKeyPairExists() {
	// Check if both key files exist
	if (existsSync(publicKeyPath) && existsSync(privateKeyPath)) {
		return; // Keys already exist
	}

	console.log('🔒 Key pair not found, generating new RSA key pair...');

	// Generate new RSA key pair
	const { publicKey, privateKey } = generateKeyPairSync('rsa', {
		modulusLength: 2048,
		publicKeyEncoding: {
			type: 'spki',
			format: 'pem'
		},
		privateKeyEncoding: {
			type: 'pkcs8',
			format: 'pem'
		}
	});

	// Ensure directories exist
	mkdirSync(dirname(publicKeyPath), { recursive: true });
	mkdirSync(dirname(privateKeyPath), { recursive: true });

	// Write key files
	writeFileSync(publicKeyPath, publicKey, { mode: 0o600 });
	writeFileSync(privateKeyPath, privateKey, { mode: 0o600 });

	console.log(`Generated new key pair:`);
	console.log(`Public key: ${publicKeyPath}`);
	console.log(`Private key: ${privateKeyPath}`);
}

export const KeyStore = {
	get public() {
		return createPublicKey(readFileSync(publicKeyPath));
	},
	get private() {
		return createSecretKey(readFileSync(privateKeyPath));
	}
};

ensureKeyPairExists();
