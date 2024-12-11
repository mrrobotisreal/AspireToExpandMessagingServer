const https = require('https');
const fs = require('fs');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const { User } = require('./models/user');
const { Room } = require('./models/room');
const { Message } = require('./models/message');

const certFile = fs.readFileSync(
    '/etc/letsencrypt/live/aspirewithalina.com/fullchain.pem'
);
const keyFile = fs.readFileSync(
    '/etc/letsencrypt/live/aspirewithalina.com/privkey.pem'
);

const server = https.createServer({
    cert: certFile,
    key: keyFile,
});
const io = new Server(server);
mongoose.connect('mongodb://localhost:27017/chat', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

io.on('connection', (socket) => {
    socket.on(
        'registerUser',
        async ({
            userId,
            userType,
            preferredName,
            firstName,
            lastName,
            profilePictureUrl,
        }) => {
            let user = await User.findOne({
                userId: userID,
                userType: userType,
            });
            if (!user) {
                user = new User({
                    userId: userId,
                    userType: userType,
                    preferredName: preferredName,
                    firstName: firstName,
                    lastName: lastName,
                    profilePictureUrl: profilePictureUrl,
                });
            }
            user.socketId = socket.id;
            await user.save();
            console.log(
                `${firstName} ${lastName} has been registered and is online!`
            );
        }
    );

    socket.on('createChatRoom', async ({ sender, participants, message }) => {
        let room = await Room.findOne({
            users: {
                $all: [
                    sender.userId,
                    ...participants.map((participant) => participant.userId),
                ],
            },
        });
        if (!room) {
            room = new Room({
                roomId: uuidv4(),
                users: [
                    sender.userId,
                    ...participants.map((participant) => participant.userId),
                ],
            });
            await room.save();
        }

        const newMessage = new Message({
            roomId: room.roomId,
            sender: sender.userId,
            content: message,
        });
        await newMessage.save();

        room.messages.push(newMessage._id);
        await room.save();

        socket.emit('chatRoomCreated', {
            roomId: room.roomId,
            participants,
            message,
        });

        participants.forEach(async (participant) => {
            const participantData = await User.findOne({
                userId: participant.userId,
            });
            if (participantData && participantData.socketId) {
                io.to(participantData.socketId).emit('joinChatRoom', {
                    roomId: room.roomId,
                    participants: [
                        sender,
                        ...participants.filter(
                            (user) => user.userId !== participant.userId
                        ),
                    ],
                    message,
                });
            } else {
                console.log(
                    `User ${participant.userId} is not online. Message will be sent when they are online.`
                );
            }
        });
    });

    socket.on('fetchMissedMessages', async (userId) => {
        const user = await User.findOne({ userId });
        if (user) {
            const rooms = await Room.find({ users: userId }).populate(
                'messages'
            );
            rooms.forEach((room) => {
                const missedMessages = room.messages.filter(
                    (msg) => msg.sender !== userId
                );
                if (missedMessages.length > 0) {
                    socket.emit('missedMessages', {
                        roomId: room.roomId,
                        messages: missedMessages,
                    });
                }
            });
        }
    });

    socket.on('joinChatRoom', async ({ roomId, participants }) => {});

    socket.on('disonnect', () => {
        const userID = Object.keys(userSockets).find(
            (key) => userSockets[key] === socket.id
        );
        if (userID) {
            delete userSockets[userID];
            console.log(`User ${userID} disconnected`);
        }
    });
});

server.listen(11112, () => {
    console.log(
        'WebSocket server started securely on https://localhost:11112/chat'
    );
});
