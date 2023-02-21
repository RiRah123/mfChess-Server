import express from 'express';
import {google,   // The top level object used to access services
        drive_v3, // For every service client, there is an exported namespace
        Auth,     // Namespace for auth related types
        Common,   // General types used throughout the library
       } from 'googleapis';

const app = express();
app.set('views', 'src/views');
app.set('view engine', 'pug');
app.use(express.json());
app.use(express.urlencoded({extended: false}));

const oauth2Client: Auth.OAuth2Client = new google.auth.OAuth2(
    'Client Id',
    'Client Secret',
    'http://localhost:8080/auth/google/callback'
);

const redirectUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['email', 'profile']
});

let auth = false;

app.get('/', async function (req, res) {
    let oauth2 = google.oauth2({version: 'v2', auth: oauth2Client});
    if (auth) {
        let userInfo = await oauth2.userinfo.v2.me.get();
        res.render('index', {buttonSpan: 'Sign out', url: 'http://localhost:8080/logout', userInfo: userInfo.data})
    } else {
        res.render('index', {buttonSpan: 'Sign in', url: redirectUrl, userInfo: {}})
    }
});

app.get('/auth/google/callback', async function (req, res) {
    if (typeof req.query.code !== 'string') return;
    const code: string | undefined = req.query.code;
    if (code) {
        const {tokens} = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        auth = true;
    }
    res.redirect('/');
});

app.get('/logout', (req, res) => {
    oauth2Client.revokeCredentials().then(r => console.log('revoke ', r));
    auth = false;
    res.redirect('/');
});

app.listen(8080);