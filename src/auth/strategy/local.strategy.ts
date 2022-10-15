import { Strategy } from "passport-local";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";

import { AuthService } from "../auth.service";
import { ViewableUser } from "../../model";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(
    username: string,
    plainPassword: string
  ): Promise<ViewableUser> {
    const user = await this.authService.validateUser(username, plainPassword);

    if (!user) {
      throw new UnauthorizedException("invalid credentials");
    }

    return user;
  }
}
