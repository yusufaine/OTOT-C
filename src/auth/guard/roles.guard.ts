import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";

import { Role, ViewableUser } from "../../model";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    /**
     * Reads the roles that was set in the metadata by `HasRoles`
     */
    const requiredRoles = this.reflector.get<Role[]>(
      "roles",
      context.getHandler()
    );

    // If roles are not set, it is a public route
    if (!requiredRoles) {
      return true;
    }

    // True iff user has specified role
    const { user } = context.switchToHttp().getRequest() as {
      user: ViewableUser;
    };
    return requiredRoles.some((role) => user.roles.includes(role));
  }
}
