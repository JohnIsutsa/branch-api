import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
    port: process.env.PORT,
    mode: process.env.NODE_ENV || 'production',
    jwtSecret: process.env.JWT_SECRET,
    jwtExpirationInterval: process.env.JWT_EXPIRATION,
}));