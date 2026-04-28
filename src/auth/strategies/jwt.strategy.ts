import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { TokenPayload } from 'src/common/interfaces';
import jwtConfig from '../config/jwt.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(jwtConfig.KEY)
    jwtcon: ConfigType<typeof jwtConfig>,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtcon.secret as string,
    });
  }

  async validate(payload: TokenPayload) {
    const user = await this.authService.validateUserJwt(payload);
    if (!user) throw new UnauthorizedException('Invalid Session');
    return user;
  }
}
