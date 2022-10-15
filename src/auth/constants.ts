import { JwtModuleOptions } from "@nestjs/jwt";

export const JWT_OPTIONS: JwtModuleOptions = {
  secret: "access-secret",
  signOptions: { expiresIn: 300 },
};
