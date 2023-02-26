import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { AppDataSource } from '../conectdb';
import { User } from '../entity/user';
import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import config from '../config/config';

export class AuthController {
  checkIfUnencryptedPasswordIsValid(unencryptedPassword: string, password: string): boolean {
    return bcrypt.compareSync(unencryptedPassword, password);
  }

  async login(req: Request, res: Response) {
    const repository = AppDataSource.getRepository(User);
    const { email, password } = req.body;
    const user = await repository.createQueryBuilder('u').where('u.email = :email', { email }).getOne();
    if (!user) {
      return res.status(401).json({ message: 'Login Fail' });
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: 'Login Fail' });
    }
    // console.log('jwt', jwtSecret);
    const token = jwt.sign({ id: user.id }, config.jwtSecret, { expiresIn: '30m' });
    return res.status(200).json({ token });
  }
}
