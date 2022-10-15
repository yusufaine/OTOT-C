import { Role } from "./role.enum";
import { hash } from "argon2";

export type User = {
  name: string;
  username: string;
  hashedPassword: string;
  roles: Role[];
};

export type ViewableUser = Omit<User, "hashedPassword">;

const defaultUsers: (Omit<User, "hashedPassword"> & { password: string })[] = [
  {
    name: "Alice",
    username: "adminAlice",
    password: "alice_password",
    roles: [Role.ADMIN, Role.USER],
  },
  {
    name: "Bob",
    username: "userBob",
    password: "bob_password",
    roles: [Role.USER],
  },
  {
    name: "John Doe",
    username: "unknown",
    password: "unknown",
    roles: [Role.USER],
  },
];

export async function getHashedDefaultUsers(): Promise<User[]> {
  const hashedUsers: User[] = [];
  for (const user of defaultUsers) {
    const { password, ...data } = user;
    const hashedPassword = await hash(password);
    hashedUsers.push({
      ...data,
      hashedPassword,
    });
  }
  return hashedUsers;
}
