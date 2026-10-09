export type Role = 'General User' | 'Admin';
export type AccessLevel = 'public' | 'general' | 'admin';

export interface UserEntity {
  userId: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  active: boolean;
  passwordHash: string;
  createdAt: string;
}

export interface RecordEntity {
  id: number;
  title: string;
  category: string;
  owner: string;
  status: 'Open' | 'In review' | 'Closed';
  access: AccessLevel;
  updatedAt: string;
}

export interface Database { users: UserEntity[]; records: RecordEntity[]; }
export type PublicUser = Omit<UserEntity, 'passwordHash'>;

export const toPublic = (u: UserEntity): PublicUser => {
  const { passwordHash, ...rest } = u;
  return rest;
};
