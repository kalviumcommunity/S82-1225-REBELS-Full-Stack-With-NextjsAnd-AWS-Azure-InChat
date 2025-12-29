"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserIdFromCookies = getUserIdFromCookies;
exports.requireUserId = requireUserId;
const headers_1 = require("next/headers");
const auth_1 = require("./auth");
async function getUserIdFromCookies() {
    const token = (await (0, headers_1.cookies)()).get((0, auth_1.getAuthCookieName)())?.value;
    if (!token)
        return null;
    try {
        const payload = await (0, auth_1.verifyAuthToken)(token);
        return payload.userId;
    }
    catch {
        return null;
    }
}
async function requireUserId() {
    const userId = await getUserIdFromCookies();
    if (!userId) {
        throw new Error('UNAUTHORIZED');
    }
    return userId;
}
