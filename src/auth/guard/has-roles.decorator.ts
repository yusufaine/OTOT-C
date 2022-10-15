import { SetMetadata } from "@nestjs/common";
import { Role } from "../../model";

/**
 * Decorator used to ensure that the given user has the roles specified in a route
 */
export const HasRoles = (...roles: Role[]) => SetMetadata("roles", roles);
