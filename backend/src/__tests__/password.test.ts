import { hashPassword, verifyPassword } from '../password';

describe('password hashing', () => {
  it('hashes with bcrypt and verifies the right password only', async () => {
    const hash = await hashPassword('Secret#1');
    expect(hash).not.toContain('Secret#1');
    expect(hash.startsWith('$2')).toBe(true);
    expect(await verifyPassword('Secret#1', hash)).toBe(true);
    expect(await verifyPassword('wrong', hash)).toBe(false);
  });
});
