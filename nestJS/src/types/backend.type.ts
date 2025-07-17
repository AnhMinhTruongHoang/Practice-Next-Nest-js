export type RoleType = 'USERS' | 'ADMIN';
export type AccountType = 'LOCAL' | 'GOOGLE';

export interface IUser {
  _id?: string;
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  address?: string;
  image?: string;
  role?: RoleType;
  accountType?: AccountType;
  isActive?: boolean;
  codeId?: string;
  codeExpired?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
