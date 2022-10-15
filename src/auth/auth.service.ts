import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { verify } from "argon2";

import { ViewableUser } from "../model";
import { UsersService } from "../users/users.service";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(
    username: string,
    plainPassword: string
  ): Promise<ViewableUser> {
    const user = this.usersService.findOne(username);

    if (!user) {
      return undefined;
    }

    const { hashedPassword, ...info } = user;
    const isValid = await verify(hashedPassword, plainPassword);

    if (!isValid) {
      return undefined;
    }

    return info;
  }

  async login(user: ViewableUser) {
    return {
      access_token: this.jwtService.sign(user),
    };
  }
}
