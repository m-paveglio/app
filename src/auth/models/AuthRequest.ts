import { Request } from 'express';
import { user } from 'src/user/user.entity';

export interface AuthRequest extends Request {
  user: user;
}