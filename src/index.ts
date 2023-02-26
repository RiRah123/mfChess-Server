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
import onConnection from './webSocketServer';

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


const wss = new WebSocket.Server({ port: 4000 });

wss.on('connection', onConnection);