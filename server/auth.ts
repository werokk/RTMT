import crypto from 'crypto';
import { promisify } from 'util';

// Utility functions for password hashing and verification
const pbkdf2 = promisify(crypto.pbkdf2);

export async function generateHash(password: string): Promise<string> {
  // Generate a random salt
  const salt = crypto.randomBytes(16).toString('hex');
  
  // Hash the password with the salt
  const derivedKey = await pbkdf2(
    password,
    salt,
    1000,
    64,
    'sha512'
  );
  
  // Return the salt and hash together
  return `${salt}:${derivedKey.toString('hex')}`;
}

export async function verifyHash(password: string, hash: string): Promise<boolean> {
  // Split the stored hash into salt and hash
  const [salt, storedHash] = hash.split(':');
  
  // Hash the provided password with the same salt
  const derivedKey = await pbkdf2(
    password,
    salt,
    1000,
    64,
    'sha512'
  );
  
  // Compare the hashes
  return storedHash === derivedKey.toString('hex');
}
