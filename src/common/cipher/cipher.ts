import config from '@src/common/config/config';
import * as bcrypt from 'bcrypt';
export async function encrypt(input: string, saltRounds = config().auth.saltRounds): Promise<string> {
  return await bcrypt.hash(input, saltRounds);
}

export async function compareEncryption(input: string, encryptedInput: string): Promise<boolean> {
  return bcrypt.compare(input, encryptedInput);
}
