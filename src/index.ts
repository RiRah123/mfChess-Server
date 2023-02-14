import cors from 'cors';
import express, { Express, Request, Response } from 'express';
import db from './db';
import morgan from 'morgan';
import dotenv from 'dotenv'; 

const app: Express = express()

dotenv.config();

const port = process.env.PORT || 3002;

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));


app.get("/", (req: Request, res: Response) => {
    res.status(200).send("Root")
})

app.listen(port, () => {
    console.log(`listening ${port}`);
  });
  

db.connect()