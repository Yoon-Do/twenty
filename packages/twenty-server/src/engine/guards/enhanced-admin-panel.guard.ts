import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { Observable } from 'rxjs';

@Injectable()
export class EnhancedAdminPanelGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    // Allow if super admin
    const isSuperAdmin =
      request.isSuperAdmin === true &&
      request.user?.canAccessFullAdminPanel === true;

    if (isSuperAdmin) {
      return true;
    }

    // Regular admin panel check
    return request.user?.canAccessFullAdminPanel === true;
  }
}
