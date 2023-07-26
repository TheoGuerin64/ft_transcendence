import { AuthGuard } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OAuth2AuthGuard extends AuthGuard('oauth2') {}
