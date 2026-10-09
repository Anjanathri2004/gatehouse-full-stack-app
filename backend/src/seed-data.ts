import { Database, RecordEntity, UserEntity } from './models';
import { hashPasswordSync } from './password';

const daysAgo = (n: number): string => new Date(Date.now() - n * 86_400_000).toISOString();

/** Demo data used by every storage backend. */
export function buildSeed(): Database {
  const user = (userId: string, name: string, role: UserEntity['role'], department: string, pw: string): UserEntity => ({
    userId, name, role, department, email: `${userId}@gatehouse.dev`, active: true,
    passwordHash: hashPasswordSync(pw), createdAt: daysAgo(90)
  });
  const rec = (id: number, title: string, category: string, owner: string,
               status: RecordEntity['status'], access: RecordEntity['access'], d: number): RecordEntity =>
    ({ id, title, category, owner, status, access, updatedAt: daysAgo(d) });

  return {
    users: [
      user('admin', 'Meera Admin', 'Admin', 'Platform', 'Admin@123'),
      user('john', 'John Mathew', 'General User', 'Support', 'User@123'),
      user('asha', 'Asha Raman', 'General User', 'Finance', 'User@123')
    ],
    records: [
      rec(1001, 'Company holiday calendar', 'Notice', 'admin', 'Closed', 'public', 30),
      rec(1002, 'Quarterly support backlog', 'Operations', 'john', 'Open', 'general', 2),
      rec(1003, 'Vendor invoice reconciliation', 'Finance', 'asha', 'In review', 'general', 4),
      rec(1004, 'Office network upgrade plan', 'IT', 'admin', 'Open', 'public', 6),
      rec(1005, 'Salary band revision draft', 'HR', 'admin', 'In review', 'admin', 1),
      rec(1006, 'Production access audit', 'Security', 'admin', 'Open', 'admin', 3),
      rec(1007, 'Customer escalation: Acme Ltd', 'Support', 'john', 'Open', 'general', 1),
      rec(1008, 'Disaster recovery drill report', 'IT', 'admin', 'Closed', 'admin', 12),
      rec(1009, 'Employee onboarding checklist', 'HR', 'admin', 'Closed', 'public', 21),
      rec(1010, 'Budget forecast Q4', 'Finance', 'asha', 'In review', 'general', 5)
    ]
  };
}
