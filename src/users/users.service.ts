import { Injectable } from "@nestjs/common";

import { getHashedDefaultUsers, User, ViewableUser } from "../model";

@Injectable()
export class UsersService {
  // Mock database, indexed by username
  private users: Record<string, User> = {};

  constructor() {
    getHashedDefaultUsers().then((user) => {
      for (const hashUser of user) {
        this.users[hashUser.username] = hashUser;
      }
    });
  }

  findOne(username: string): User | undefined {
    return this.users[username];
  }

  findOneAsViewable(username: string): ViewableUser | undefined {
    const user = this.users[username];

    if (!user) {
      return undefined;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hashedPassword, ...viewable } = user;
    return viewable;
  }
}
