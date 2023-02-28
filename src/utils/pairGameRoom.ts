import { WebSocket } from 'ws';
import { RoomModel } from '../models/Room';
import { RoomMapType, WSInfo } from '../webSocketServer';

const roomIDLength = 6;

/**
 * ! Algorithm to be improved
 * * Currently looks sync but later on should add in timeouts to wait for better pairings, and when timeout is
 * * up, it returns the suboptimal pairing
 * @param queue 
 * @param rooms 
 * @param wsInfo 
 */
export const pairGameRoom = async (queue: WebSocket[], rooms: Map<string, RoomMapType>, wsInfo: Map<WebSocket, WSInfo>) => {
    while (queue.length >= 2) {
        const players = [queue[0], queue[1]];
        queue.splice(0, 2);

        // ? Not really sure if this is needed, it is just a neater ID, probably for users to type in to join room?
        const newRoomID = createNewRoomID(rooms)
        
        /**
         * * Don't confuse the server side "rooms" and the db side "room", server side is for quick access to
         * * websockets, while db side is for saving all messages and game moves in database.
         */

        if (!wsInfo.has(players[0]) || !wsInfo.has(players[1])) throw new Error("Can't find player");
        const room = new RoomModel({
            roomID: newRoomID,
            users: players.map((ws) => {
                return wsInfo.get(ws)!.user
            }),
            messages:[],
            game: ""
        })
        try {
            await room.save().then((res) => {
                console.log("Room saved:", res.roomID)
            })
        } catch (err) {
            console.log(err)
            throw new Error("error while saving room")
        }
        rooms.set(newRoomID, {players, roomMongoID: room._id})
        players.forEach((ws) => {
            wsInfo.get(ws)!.roomID = newRoomID
            ws.send(JSON.stringify({
                type: "status",
                payload: {
                name: "status update",
                userID: "",
                data: "paired",
                }
            }))
        })
        console.log(`Paired:", [${wsInfo.get(players[0])!.name}] and [${wsInfo.get(players[1])!.name}]`)
    }
    return {
        leftOver: queue.length
    }
}
const createNewRoomID = (rooms: Map<string, RoomMapType>) => {
    let roomID = createRandomString(roomIDLength);

    // ! Total number of rooms: 2176782336, should avoid having more than 80% of that
    while (rooms.has(roomID)) {
        roomID = createRandomString(roomIDLength);
    }
    return roomID;
}
const createRandomString = (length: number) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * characters.length));
    }
    return result;
}