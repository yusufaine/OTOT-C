import { Injectable, NotFoundException } from "@nestjs/common";

import { defaultUsers, User, ViewableUser } from "../model";

@Injectable()
export class UsersService {
  // Mock database, indexed by username
  private users: Record<string, User> = {};

  constructor() {
    defaultUsers.forEach((user) => (this.users[user.username] = user));
  }

  getAll() {
    return Object.values(this.users);
  }

  findOne(username: string): User | undefined {
    return this.users[username];
  }

  findOneAsViewable(username: string): ViewableUser | undefined {
    const user = this.users[username];

    if (!user) {
      throw new NotFoundException(`${username} not found`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hashedPassword, ...viewable } = user;
    return viewable;
  }
}
