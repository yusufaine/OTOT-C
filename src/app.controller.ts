import {
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { AuthService } from "./auth/auth.service";
import { HasRoles, RolesGuard } from "./auth/guard";
import { Role } from "./model";
import { UsersService } from "./users/users.service";

@Controller()
export class AppController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService
  ) {}

  @Get()
  welcomeMessage() {
    return "Greetings EVERYONE!";
  }

  // Local login
  @UseGuards(AuthGuard("local"))
  @Post("auth/login")
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  // Given JWT
  @HasRoles(Role.ADMIN, Role.USER)
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Get(["me", "profile"])
  getMe(@Request() req) {
    return req.user;
  }

  @HasRoles(Role.ADMIN)
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Get("profile/:username")
  getOtherProfile(@Param() param) {
    return this.usersService.findOneAsViewable(param.username);
  }
}
