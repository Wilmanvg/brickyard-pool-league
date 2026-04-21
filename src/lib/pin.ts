import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export function hashPin(pin: string): string {
  return bcrypt.hashSync(pin, SALT_ROUNDS);
}

export function verifyPin(pin: string, pinHash: string): boolean {
  return bcrypt.compareSync(pin, pinHash);
}

export function validatePinFormat(pin: string): string | null {
  if (pin.length < 4) return "PIN must be at least 4 characters";
  if (pin.length > 72) return "PIN must be at most 72 characters";
  return null;
}
