import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ViewableUser } from "src/model";

import { JWT_OPTIONS } from "../constants";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_OPTIONS.secret,
    });
  }

  async validate(payload: ViewableUser) {
    return payload;
  }
}
