"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const http_1 = __importDefault(require("http"));
const next_1 = __importDefault(require("next"));
const socket_io_1 = require("socket.io");
const redis_adapter_1 = require("@socket.io/redis-adapter");
const redis_1 = require("redis");
const cookie_1 = require("cookie");
const db_1 = require("./src/lib/db");
const env_1 = require("./src/lib/env");
const auth_1 = require("./src/lib/auth");
async function ensureParticipant(chatId, userId) {
    const participant = await db_1.prisma.chatParticipant.findUnique({
        where: { chatId_userId: { chatId, userId } },
        select: { chatId: true },
    });
    if (!participant) {
        throw new Error('Not a chat participant');
    }
}
async function main() {
    const dev = env_1.env.NODE_ENV !== 'production';
    const port = env_1.env.PORT ?? 3000;
    const app = (0, next_1.default)({ dev, hostname: '0.0.0.0', port });
    const handle = app.getRequestHandler();
    await app.prepare();
    const server = http_1.default.createServer((req, res) => {
        void handle(req, res);
    });
    const io = new socket_io_1.Server(server, {
        path: '/socket.io',
        cors: {
            origin: false,
            credentials: true,
        },
    });
    // Optional Redis adapter for horizontal scaling
    if (env_1.env.REDIS_URL) {
        const pubClient = (0, redis_1.createClient)({ url: env_1.env.REDIS_URL });
        const subClient = pubClient.duplicate();
        await Promise.all([pubClient.connect(), subClient.connect()]);
        io.adapter((0, redis_adapter_1.createAdapter)(pubClient, subClient));
    }
    io.use(async (socket, nextFn) => {
        try {
            const cookieHeader = socket.handshake.headers.cookie;
            if (!cookieHeader) {
                return nextFn(new Error('Missing auth cookie'));
            }
            const cookies = (0, cookie_1.parse)(cookieHeader);
            const token = cookies[(0, auth_1.getAuthCookieName)()];
            if (!token) {
                return nextFn(new Error('Missing auth token'));
            }
            const payload = await (0, auth_1.verifyAuthToken)(token);
            socket.data.userId = payload.userId;
            return nextFn();
        }
        catch {
            return nextFn(new Error('Unauthorized'));
        }
    });
    io.on('connection', (socket) => {
        const userId = socket.data.userId;
        socket.on('chat:join', async (chatId, ack) => {
            try {
                await ensureParticipant(chatId, userId);
                await socket.join(chatId);
                ack?.(true);
            }
            catch {
                ack?.(false);
            }
        });
        socket.on('message:send', async (payload, ack) => {
            try {
                if (!payload?.chatId || !payload?.content?.trim()) {
                    ack?.(false);
                    return;
                }
                await ensureParticipant(payload.chatId, userId);
                const message = await db_1.prisma.message.create({
                    data: {
                        chatId: payload.chatId,
                        senderId: userId,
                        content: payload.content.trim(),
                    },
                    include: {
                        sender: { select: { id: true, displayName: true } },
                    },
                });
                io.to(payload.chatId).emit('message:new', {
                    id: message.id,
                    chatId: message.chatId,
                    sender: message.sender,
                    content: message.content,
                    createdAt: message.createdAt,
                });
                ack?.(true);
            }
            catch {
                ack?.(false);
            }
        });
    });
    server.listen(port, () => {
        console.log(`Inchat server listening on http://localhost:${port}`);
    });
}
void main();
