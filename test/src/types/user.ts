export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface CreateUserData {
  email: string;
  name?: string;
}

export interface UpdateUserData extends Partial<CreateUserData> {}
