import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from './constants';
import { JwtPayload } from './types/interfaces/jwt-payload.interface';
import { AuthenticatedUser } from './types/authenticated-request';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    console.log('🔍 JWT Payload received:', payload);
    console.log('🔍 Roles from payload:', payload.roles);

    return {
      id: payload.sub, // ✅ Changed from payload.id to payload.sub
      userId: payload.sub, // ✅ This was already correct
      email: payload.email,
      roles: payload.roles || [],
    };
  }
}
