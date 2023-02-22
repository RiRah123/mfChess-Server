//* import third-party
import 'dotenv/config'; //* less lines + a one-time import across modules
import cors from 'cors';
import express, { Express, Request, Response } from 'express';
import morgan from 'morgan';
import login from "./routes/login"
import { WebSocket } from 'ws';


const app: Express = express();

//* import local
import db from './db';

//* server init
db.connect();

//* configure middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

app.use("/login", login)

//* index route
app.get("/", (req: Request, res: Response) => {
    res.status(200).send("Root")
});

//* start server
app.listen(process.env.PORT, () => {
  console.log(`listening ${process.env.PORT}`);
});



import jwt, { JwtPayload }  from "jsonwebtoken";
// import jwt_decode, { JwtPayload } from 'jwt-decode'

interface WSInfo {
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
  type: "authentication",
  payload: {
    name: "request",
    userID: "",
    data: "",
  }
})

const wss = new WebSocket.Server({ port: 4000 });
const rooms = new Map<string, WebSocket[]>();
const wsInfo = new Map<WebSocket, WSInfo>();

wss.on('connection', function connection(ws) {
  wsInfo.set(ws, defaultWSInfo())
  ws.send(authRequestToken)

  console.log("Connection Made")
  ws.on('error', console.error);

  ws.on('message', (byteString) => {
    const {type, payload} = JSON.parse(byteString.toString());
    // console.log(obj)
    // switch data
    switch (type) {
      case "authentication":
        if (wsInfo.get(ws)?.verified) {
          console.log("Repeated Authentication from", wsInfo.get(ws)?.name)
          ws.send(JSON.stringify({
            type: "authentication",
            payload: {
              name: "result",
              userID: "",
              data: "success",
            }
          }))
          break;
        }
        console.log("Received auth")
        try {
          const decoded = jwt.decode(payload.data) as JwtPayload;
          if (decoded != null) {
            if (true) {
              wsInfo.set(ws, {
                verified: true,
                userID: decoded.sub!,
                roomID: "",
                name: decoded.name,
              })
            }
          }
        } catch (error) {
          throw new Error("Error in authentication")
        }
        if (wsInfo.get(ws)?.verified) {
          console.log("Authentication Succeeded for", wsInfo.get(ws)?.name)
          ws.send(JSON.stringify({
            type: "authentication",
            payload: {
              name: "result",
              userID: "",
              data: "success",
            }
          }))
        } else {
          console.log("Authentication Failed")
          ws.send(JSON.stringify({
            type: "authentication",
            payload: {
              name: "result",
              userID: "",
              data: "retry",
            }
          }))
        }
        break;
      case "chat":
        if (!wsInfo.get(ws)?.verified) {
          ws.send(authRequestToken)
          break;
        }
        wss.clients.forEach((client) => {
          client.send(byteString.toString())
        });
        break;
      // case "joinRoom":
      //   rooms.has()
    }
    // console.log('received: %s', data);
    // // ws.send('something');
  });
});

// wss.on('listening', () => {
//   console.log(`WebSocket server listening on ws://localhost:${wss.address()}`);
// });