import bcrypt from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import config from '@/config';
import prisma from '@/infrastructure/database/connection';
import { AppError } from '@/utils/AppError';
import { asyncHandler } from '@/utils/asyncHandler';
import ms from 'ms';
import { ZLogin, ZRegister } from './validators';

export class AuthController {
  register = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = ZRegister.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw AppError.conflict('User already exists');
    }
    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: hashedPassword,
      },
    });

    const { accessToken, refreshToken } = this.generateTokens(user.id, user.email);


    res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        accessToken,
      },
    });
  });

  login = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = ZLogin.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        password: true,
      },
    });

    if (!user) {
      throw AppError.unauthorized('Invalid credentials');
    }

    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) {
      throw AppError.unauthorized('Invalid credentials');
    }

    const { accessToken, refreshToken } = this.generateTokens(user.id, user.email);

    res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, 
  });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        accessToken,
      },
    });
  });

  refreshToken = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
   const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) throw AppError.badRequest('Refresh token required');

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as {
        userId: string;
        email: string;
      };
    } catch (_) {
      throw AppError.unauthorized('Invalid refresh token');
    }

    const { accessToken, refreshToken: newRefreshToken } = this.generateTokens(
      decoded.userId,
      decoded.email
    );

    res.cookie('refreshToken', newRefreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: { accessToken },
    });
  });

logout = asyncHandler(async (_req, res) => {
  res.clearCookie('refreshToken');

  return res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
});

  private generateTokens(userId: string, email: string) {
    const accessToken = jwt.sign({ userId, email }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as ms.StringValue,
    });

    const refreshToken = jwt.sign({ userId, email }, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn as ms.StringValue,
    });

    return { accessToken, refreshToken };
  }
}
