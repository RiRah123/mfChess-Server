
import { WebSocket } from 'ws';
import jwt, { JwtPayload }  from "jsonwebtoken";
import { pairGameRoom } from './utils/pairGameRoom';

export interface WSInfo {
  verified: boolean;
  userID: string;
  roomID: string;
  name: string;
}

const defaultWSInfo = () => {
  return {
    verified: false,
    userID: "",
    roomID: "",
    name: ""
  }
}

const authRequestToken = JSON.stringify({
  type: "status",
  payload: {
    name: "authentication request",
    userID: "",
    data: "",
  }
})

// const wss = new WebSocket.Server({ port: 4000 });

// TODO Migrate to a better data structure for queue
const queue: WebSocket[] = []

// ! needs method to check if rooms are alive
const rooms = new Map<string, WebSocket[]>();

// ! needs method to check if the ws are alive
// * (Solved) There can be duplicate of same user using different ws
const wsInfo = new Map<WebSocket, WSInfo>();

const onConnection = (ws: WebSocket) => {
    wsInfo.set(ws, defaultWSInfo())
    ws.send(authRequestToken)
  
    console.log("Connection Made")
    ws.on('error', console.error);
  
    ws.on('message', (byteString) => {
      //* Destructure message and check if ws is in wsInfo
      const {type, payload} = JSON.parse(byteString.toString());
      if (!wsInfo.has(ws) || wsInfo.get(ws) == undefined) throw new Error("WebSocket Info is None");
  
      switch (type) {
        case "upgrade status":
          if (payload.name == "authentication") {
            //* Repeated authentication request
            if (wsInfo.get(ws)!.verified) {
              console.log("Repeated Authentication from", wsInfo.get(ws)?.name)
              ws.send(JSON.stringify({
                type: "status",
                payload: {
                  name: "status update",
                  userID: "",
                  data: "authenticated",
                }
              }))
              break;
            }
            
            let isDuplicateUser = false;
            //* Verify jwtCredential to check that client is real
            try {
              const decoded = jwt.decode(payload.data) as JwtPayload;
              if (decoded != null) {
  
                // * Check for duplicate users using different ws
                wsInfo.forEach((value, key) => {
                  if (value.userID === decoded.sub!) {
                    isDuplicateUser = true;
                  }
                }) 
                if (!isDuplicateUser) {
                  wsInfo.set(ws, {
                    verified: true,
                    userID: decoded.sub!,
                    roomID: "",
                    name: decoded.name,
                  })
                } else {
                  console.log("Duplicate User!")
                }
              }
            } catch (error) {
              console.log("Authentication Failed")
            }
  
            //* Send updated status to client
            if (wsInfo.get(ws)?.verified) {
              console.log("Authentication Succeeded for", wsInfo.get(ws)?.name)
              ws.send(JSON.stringify({
                type: "status",
                payload: {
                  name: "status update",
                  userID: "",
                  data: "authenticated",
                }
              }))
  
            // ! had weird bug that this keeps firing but can't reproduce
            } else if (isDuplicateUser) {
              ws.send(JSON.stringify({
                type: "status",
                payload: {
                  name: "status update",
                  userID: "",
                  data: "duplicate user",
                }
              }))
            } else {
              console.log("Authentication Failed")
              ws.send(JSON.stringify({
                type: "status",
                payload: {
                  name: "status update",
                  userID: "",
                  data: "connected",
                }
              }))
            }
            break;
  
          } else if (payload.name == "joinRoom") {
            if (wsInfo.get(ws)!.roomID != "") {
              console.log("Already in room")
              ws.send(JSON.stringify({
                type: "status",
                payload: {
                  name: "status update",
                  userID: "",
                  data: "paired",
                }
              }))
            } else {
              if (!queue.includes(ws)) queue.push(ws);
              ws.send(JSON.stringify({
                type: "status",
                payload: {
                  name: "status update",
                  userID: "",
                  data: "in queue",
                }
              }))
              pairGameRoom(queue, rooms, wsInfo)
            }
  
          }
          case "chat":
            if (!wsInfo.get(ws)?.verified) {
              ws.send(authRequestToken)
              break;
            } else if (wsInfo.get(ws)?.roomID === "") {
              console.error("Using chat while not paired")
  
              // ? This is duplicate code
              if (!queue.includes(ws)) queue.push(ws);
              ws.send(JSON.stringify({
                type: "status",
                payload: {
                  name: "status update",
                  userID: "",
                  data: "in queue",
                }
              }))
              pairGameRoom(queue, rooms, wsInfo)
              break;
            }
            // ! fix the uncertainties in here (wsInfo.get(ws)?.roomID!)
            const players = rooms.get(wsInfo.get(ws)?.roomID!);
            players?.forEach((ws) => {
              ws.send(byteString.toString())
            })
            break;
      }
    });
}
export default onConnection