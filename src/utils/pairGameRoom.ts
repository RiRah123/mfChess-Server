import { WebSocket } from 'ws';
import { WSInfo } from '..';

const roomIDLength = 6;

/**
 * ! Algorithm to be improved
 * * Currently looks sync but later on should add in timeouts to wait for better pairings, and when timeout is
 * * up, it returns the suboptimal pairing
 * @param queue 
 * @param rooms 
 * @param wsInfo 
 */
export const pairGameRoom = async (queue: WebSocket[], rooms: Map<string, WebSocket[]>, wsInfo: Map<WebSocket, WSInfo>) => {
    while (queue.length >= 2) {
        const players = [queue[0], queue[1]];
        queue.splice(0, 2);
        const newRoomID = createNewRoomID(rooms)
        rooms.set(newRoomID, players)

        if (!wsInfo.has(players[0]) || !wsInfo.has(players[1])) throw new Error("Can't find player");
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
const createNewRoomID = (rooms: Map<string, WebSocket[]>) => {
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