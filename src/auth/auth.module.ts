import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";

import { AuthService } from "./auth.service";
import { UsersModule } from "../users/users.module";
import { JwtModule } from "@nestjs/jwt";
import { JWT_OPTIONS } from "./constants";
import { JwtStrategy } from "./strategy/jwt.strategy";
import { LocalStrategy } from "./strategy/local.strategy";

@Module({
  imports: [UsersModule, PassportModule, JwtModule.register(JWT_OPTIONS)],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
