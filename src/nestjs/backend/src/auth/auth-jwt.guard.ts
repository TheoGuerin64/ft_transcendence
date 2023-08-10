import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Send a 401 Unauthorized if the user is not authenticated
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
