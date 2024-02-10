const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const cookieParser = require("cookie-parser");
const cors = require('cors');
const socketIO = require('socket.io');
const http = require('http');

const server = http.createServer(app);
const io = socketIO(server);

let countdown = 10;

function startSharedTimer() {
  setInterval(() => {
    countdown--;

    // Emit the countdown as an object with a property 'remainingTime'
    io.emit('timer', { remainingTime: countdown });

    if (countdown === 0) {
      countdown = 10;
    }
  }, 1000);
}


io.on('connection', (socket) => {
  console.log("timer start")
  socket.emit('timer', countdown);
});

startSharedTimer();

app.use(cookieParser());
app.use(cors());

require("./db");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "hbs");
app.use(express.static(path.join(__dirname, '../public')));
app.set('views', path.join(__dirname, 'views'));
hbs.registerPartials(path.join(__dirname, '/views/partials'));

app.get("/signup", (req, res) => {
  res.render("register");
});

app.get("/signin", (req, res) => {
  res.render("login");
});

const loginController = require("./controller/singinController");
app.use(loginController);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server started at port", PORT);
});
