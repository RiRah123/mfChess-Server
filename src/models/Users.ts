import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    isAdmin: {
        type: Boolean,
        required: true
    },
    profilePictureUrl: {
        type: String,
        required: true
    },
});

const UserModel = mongoose.model("Users", UserSchema);
module.exports = UserModel;