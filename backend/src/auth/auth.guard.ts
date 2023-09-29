import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { jwtConstants } from './constants';
  import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';
import { ConfigService } from '@nestjs/config';

  
  @Injectable()
  export class AuthGuard implements CanActivate {

    PERMANENT_TOKEN = process.env.PERMANENT_TOKEN || "permanentTokenExample"

    constructor(private jwtService: JwtService, private reflector: Reflector, configService: ConfigService) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      if (isPublic) {
        // 💡 See this condition
        return true;
      }
  
      const request = context.switchToHttp().getRequest();
      const token = this.extractTokenFromHeader(request);
      if (!token) {
        throw new UnauthorizedException();
      }
      try {
        if (token !== this.PERMANENT_TOKEN){
          const payload = await this.jwtService.verifyAsync(token, {
            secret: jwtConstants.secret,
          });
          request['user'] = payload;
        }
      } catch {
        throw new UnauthorizedException();
      }
      return true;
    }
  
    private extractTokenFromHeader(request: Request): string | undefined {
      const [type, token] = request.headers.authorization?.split(' ') ?? [];
      return type === 'Bearer' ? token : undefined;
    }
  }
  