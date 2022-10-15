import { Role } from "./role.enum";

export type User = {
  name: string;
  username: string;
  hashedPassword: string;
  roles: Role[];
};

export type ViewableUser = Omit<User, "hashedPassword">;

export const defaultUsers: User[] = [
  {
    name: "Alice",
    username: "adminAlice",
    roles: [Role.ADMIN, Role.USER],
    // "alice_password"
    hashedPassword:
      "$argon2id$v=19$m=65536,t=3,p=4$TlvG0sq5sVpvGDzXLvTf1w$kiRG0xnemY0k9KLZcOsGgj6h+Je+NZBMPkkhfOsmE4o",
  },
  {
    name: "Bob",
    username: "userBob",
    roles: [Role.USER],
    // "bob_password"
    hashedPassword:
      "$argon2id$v=19$m=65536,t=3,p=4$zycI/6WlJGB1aC2FGQR6Gw$unAiq1Ebye6f9NJ/VHso3XPjJ+E7ugodkFMdBj7/DNI",
  },
  {
    name: "John Doe",
    username: "unknown",
    roles: [Role.USER],
    // "unknown"
    hashedPassword:
      "$argon2id$v=19$m=65536,t=3,p=4$4IhFo+bNF2SFvgpolBgoxw$5NpEDbxfKVJ9wPfCLb7ONN2gkR/q6+adeZRXapAbyo4",
  },
];
