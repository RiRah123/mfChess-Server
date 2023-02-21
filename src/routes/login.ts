import { Request, Response } from "express";

const express = require("express");
const jwt = require("jsonwebtoken");
const UserModel = require('../models/Users');

let router = express.Router();

//* Login Route
router.post("/", (req: Request, res: Response) => {
    const token = req.body.token;
    const decoded = jwt.decode(token);
    //console.log(decoded);

    //* Check if user is in DB, if not then create new.
    UserModel.find({userID:decoded.sub}, async (err: Error, result: Array<typeof UserModel>) => { 
      console.log(decoded)
      if (err) {
        res.json(err);
      } else if (result.length == 0){
        const user = {
          userID: decoded.sub,
          name: decoded.name,
          email: decoded.email,
          profilePictureUrl: decoded.picture,
          isAdmin: false, //default not an admin
        };
        const newUser = new UserModel(user);
        await newUser.save();
        res.json({sub:decoded.sub});
      } else {
        res.json({sub:decoded.sub});
      }
    });
  });

export default router