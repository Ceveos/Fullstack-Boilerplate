import * as argon2 from "argon2";

const { HASH_SECRET } = process.env;

/**
 * Returns a hash given a password
 * @param password Password to hash
 */
export async function hashPassword(password: string): Promise<string> {
  // Return hashed password
  // Argon2 is the recommended hashing algorithm for passwords.
  // Argon2's hashing algorithm generates a salt
  return await argon2.hash(`${HASH_SECRET}${password}`)
}

/**
 * Returns a hash given a password
 * @param password Plaintext password to verify
 * @param hash Hashed password to compare against
 */
export async function verifyPassword(password: string, hash: string) {
    return await argon2.verify(hash, `${HASH_SECRET}${password}`)
}