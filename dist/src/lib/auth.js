"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuthCookieName = getAuthCookieName;
exports.signAuthToken = signAuthToken;
exports.verifyAuthToken = verifyAuthToken;
const jose_1 = require("jose");
const env_1 = require("./env");
const tokenName = 'inchat_token';
function secretKey() {
    return new TextEncoder().encode(env_1.env.JWT_SECRET);
}
function getAuthCookieName() {
    return tokenName;
}
async function signAuthToken(userId) {
    const nowSeconds = Math.floor(Date.now() / 1000);
    return new jose_1.SignJWT({ userId })
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
        .setIssuedAt(nowSeconds)
        .setExpirationTime(nowSeconds + 60 * 60 * 24 * 7) // 7 days
        .sign(secretKey());
}
async function verifyAuthToken(token) {
    const { payload } = await (0, jose_1.jwtVerify)(token, secretKey(), {
        algorithms: ['HS256'],
    });
    if (!payload.userId) {
        throw new Error('Invalid token payload');
    }
    return payload;
}
