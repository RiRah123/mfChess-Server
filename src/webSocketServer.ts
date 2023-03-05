import { WebSocket } from 'ws';
import jwt, { JwtPayload }  from "jsonwebtoken";
import { pairGameRoom } from './utils/pairGameRoom';
import { UserModel, UserType } from './models/Users';
import { MoveType }  from './models/Game';
import { Document, Types } from 'mongoose';
import { RoomModel, RoomType } from './models/Room';

export interface WSInfo {
  verified: boolean;
  user: UserType | undefined;
  roomID: string;
  name: string;
}

const defaultWSInfo = (): WSInfo => {
  return {
    verified: false,
    user: undefined,
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

export interface RoomMapType {
    players: WebSocket[],
    roomMongoID: Types.ObjectId
}

// const wss = new WebSocket.Server({ port: 4000 });

// TODO Migrate to a better data structure for queue
const queue: WebSocket[] = []

// ! needs method to check if rooms are alive
const rooms = new Map<string, RoomMapType>();

// ! needs method to check if the ws are alive
// * (Solved) There can be duplicate of same user using different ws
const wsInfo = new Map<WebSocket, WSInfo>();

const onConnection = (ws: WebSocket) => {
    wsInfo.set(ws, defaultWSInfo())
    ws.send(authRequestToken)

    console.log("Connection Made")
    ws.on('error', console.error);
  
    ws.on('message', async (byteString) => {
      //* Destructure message and check if ws is in wsInfo
      const {type, payload} = JSON.parse(byteString.toString());
      if (!wsInfo.has(ws) || wsInfo.get(ws) == undefined) throw new Error("WebSocket Info is None");
      if (type === "chat" || type === "game") {
        if (!wsInfo.get(ws)?.verified) {
          ws.send(authRequestToken)
          return
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
          return
        }
      }
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
            
            let duplicateUser = null;
            //* Verify jwtCredential to check that client is real
            try {
              const decoded = jwt.decode(payload.data) as JwtPayload;
              if (decoded != null) {
  
                // * Check for duplicate users using different ws
                // ! Bugs when interrupt ongoing game with duplicate login
                wsInfo.forEach((value, key) => {
                  if (value.user && value.user.userID === decoded.sub! && key !== ws) {
                    key.send(JSON.stringify({
                      type: "status",
                      payload: {
                        name: "status update",
                        userID: "",
                        data: "duplicate user",
                      }
                    }))
                    key.close();
                    duplicateUser = wsInfo.get(key)
                    // wsInfo.set(key, defaultWSInfo());
                    wsInfo.delete(key);
                    
                    // * Remove from queue
                    // TODO clean up
                    const idx = queue.indexOf(key);
                    if (idx > -1) { // only splice array when item is found
                      queue.splice(idx, 1); // 2nd parameter means remove one item only
                    }
                  }
                }) 
                // ! to fix
                if (!duplicateUser) {
                  const result: UserType | null = await UserModel.findOne({userID:decoded.sub});
                  if (!result) throw new Error("Cannot find user.")
                  wsInfo.set(ws, {
                      verified: true,
                      user: result,
                      roomID: "",
                      name: decoded.name,
                  })
                } else {
                  wsInfo.set(ws, duplicateUser)
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
            } else {
              ws.send(JSON.stringify({
                type: "status",
                payload: {
                  name: "status update",
                  userID: "",
                  data: "duplicate user",
                }
              }))
            }
            // else {
            //   console.log("Authentication Failed")
            //   ws.send(JSON.stringify({
            //     type: "status",
            //     payload: {
            //       name: "status update",
            //       userID: "",
            //       data: "connected",
            //     }
            //   }))
            // }
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
            // ! fix the uncertainties in here (wsInfo.get(ws)?.roomID!)
            const room = rooms.get(wsInfo.get(ws)?.roomID!);
            room?.players.forEach((ws) => {
              ws.send(byteString.toString())
            })
            RoomModel.updateOne(
                { _id: room?.roomMongoID }, 
                { $push: { messages: {
                    sender: payload.name,
                    userID: payload.userID,
                    body: payload.data
                } } }
            ).catch(err=> {
                console.error(err)
                throw new Error()
            });
          break;
        case "game":
          if (payload.name === "move") {
            const room = rooms.get(wsInfo.get(ws)?.roomID!);
            const move: MoveType = JSON.parse(payload.data);
            // console.log("Move:", move)
            room?.players.forEach((ws) => {
              ws.send(byteString.toString())
            })
            RoomModel.updateOne(
              { _id: room?.roomMongoID }, 
              { $push: { "game.moves": move } }
            ).catch(err=> {
                console.error(err)
                throw new Error()
            });
          }
        
      }
      // console.log("----------")
      // console.log("WSINFO")
      // wsInfo.forEach((value, key) => {
      //   console.log(value.name)
      // }) 
      // console.log("Queue")
      // console.log("Length:", queue.length)
      // console.log("Rooms")
      // rooms.forEach((value, key) => {
      //   console.log(key, value)
      // }) 
      // console.log("----------")

    });
}
export default onConnection