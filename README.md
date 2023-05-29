# mfChess Web Backend
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)]()
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=MongoDB&logoColor=white)]()
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)]()
[![Google_Authentication](https://img.shields.io/badge/Google_Authentication-4285F4?style=for-the-badge&logo=google&logoColor=white)]()
[![Yarn](https://img.shields.io/badge/Yarn-2C8EBB?style=for-the-badge&logo=Yarn&logoColor=white)]()

## ♟️ What is the mfChess?

<p align="center">
  <img src="mfChess-front-page.png" height="200" width="400" alt="mfChess Front Page">
  <img src="mfChess-profile-page.png" height="200" width="400" alt="mfChess Profile Page">
</p>
<p align="center">
  <img src="mfChess-board-page.png" height="350" width="700" alt="mfChess Board Page">
</p>

Introducing the mfChess backend repository, a crucial component responsible for handling server-client interactions and powering the seamless experience of the mfChess platform. Designed with efficiency and scalability in mind, the backend seamlessly integrates with the frontend to provide an exceptional online chess experience.

At its core, the backend utilizes a MongoDB database server to securely store user information. This ensures that player profiles, game history, and customizable preferences are reliably persisted.

To facilitate real-time gameplay, the backend employs web-socketing technology, enabling two users to connect with each other on the same chess board hosted on the mfChess website. Through this robust connection, players can seamlessly communicate their moves, enabling synchronized gameplay experiences.

For enhanced analysis capabilities, the backend stores each player's moves, allowing for in-depth analysis powered by Stockfish. This integration empowers players to review their strategic decisions and gain valuable insights into their gameplay.

To ensure a seamless experience across sessions, local storage is utilized to save the state of each player's chess pieces. This feature guarantees that players can easily resume their games even after resigning or reloading the page.

mfChess is currently live at mfchess.com, offering a seamless and captivating online chess experience. Developers can explore the frontend codebase, contribute to its growth, and collaborate with the frontend repository found at https://github.com/RiRah123/mfChess-Web-Client, where the frontend client handles the immersive user interface, gameplay interactions, and seamless integration with the backend. Together, these repositories power the live mfChess platform, offering chess enthusiasts a captivating online chess experience like no other.

## 🏃‍♂️ Running mfChess Backend Locally

Using the terminal:

1. Clone the GitHub Project
   ```
   $ git clone https://github.com/RiRah123/mfChess-Server.git
   ```
2. Navigate to the cloned project
   ```
   $ cd mfChess-Server
   ```
3. Install necessary packages using yarn
   ```
   $ yarn install
   ```
   `Note:` If you do not already have yarn install, please check out the <a href="https://classic.yarnpkg.com/lang/en/docs/install/#windows-stable">yarn documentation website</a> for details on how to.
 4. Run using yarn
    ```
    $ yarn run
    ```
    `Note:` You should run the frontend locally at the sametime to ensure the application runs with error. Please check out the frontend repo, <a href="https://github.com/RiRah123/mfChess-Web-Client">`mfChess-Web-Client`</a>, for more details.

## Scripts

1. `yarn dev`
    - Runs the app in the development mode.
    - Open [http://localhost:3000/graphql](http://localhost:3000/graphql) to view it in the browser.
2. `yarn test`
    - Launches the test runner in the interactive watch mode.\
3. `yarn build`
    - Builds the app for production to the `bin` folder.\
4. `yarn start`
    - Runs app for production.
