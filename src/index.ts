//* import third-party
import 'dotenv/config'; //* less lines + a one-time import across modules
import cors from 'cors';
import express, { Express, Request, Response } from 'express';
import morgan from 'morgan';

//* import local
import db from './db';

//* server init
const app: Express = express();
db.connect();

//* configure middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

//* index route
app.get("/", (req: Request, res: Response) => {
    res.status(200).send("Root")
});

//* start server
app.listen(process.env.PORT, () => {
  console.log(`listening ${process.env.PORT}`);
});