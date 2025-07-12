import { Injectable } from '@nestjs/common';

import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import {
  SuperAdminTokenJwtPayload,
  JwtTokenTypeEnum,
} from 'src/engine/core-modules/auth/types/auth-context.type';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';

@Injectable()
export class SuperAdminTokenService {
  constructor(private readonly jwtWrapperService: JwtWrapperService) {}

  async generateSuperAdminToken(
    userId: string,
    workspaceId?: string,
    authProvider?: AuthProviderEnum,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: SuperAdminTokenJwtPayload = {
      type: JwtTokenTypeEnum.SUPER_ADMIN,
      sub: userId,
      userId,
      workspaceId,
      authProvider,
    };

    const secret = this.jwtWrapperService.generateAppSecret(
      JwtTokenTypeEnum.SUPER_ADMIN,
      userId,
    );

    const accessToken = this.jwtWrapperService.sign(payload, {
      secret,
      expiresIn: '1h', // Short-lived for security
    });

    const refreshPayload = {
      ...payload,
      tokenType: 'refresh',
    };

    const refreshToken = this.jwtWrapperService.sign(refreshPayload, {
      secret,
      expiresIn: '30d',
    });

    return { accessToken, refreshToken };
  }

  async validateSuperAdminToken(
    token: string,
  ): Promise<SuperAdminTokenJwtPayload | null> {
    try {
      const decoded =
        this.jwtWrapperService.decode<SuperAdminTokenJwtPayload>(token);

      if (decoded.type !== JwtTokenTypeEnum.SUPER_ADMIN) {
        return null;
      }

      return decoded;
    } catch (error) {
      return null;
    }
  }
}
