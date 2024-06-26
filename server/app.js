const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors"); // Import cors package
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        credentials: true
    }
});

app.use(
    cors({
        origin: "*",
        credentials: true
    })
);

// MongoDB setup
mongoose
    .connect("mongodb+srv://codewithrahulnikam:rahulnikam2002@cluster0.iz5qb.mongodb.net/chatDB")
    .then((con) => console.log("DB connected"))
    .catch((error) => console.log("error at db connection", error));

const chatSchema = new mongoose.Schema({
    user: String,
    message: String,
    timestamp: { type: Date, default: Date.now }
});

const Chat = mongoose.model("Chat", chatSchema);

// Serve static files from the client/build directory
const clientBuildPath = path.join(__dirname, "../client/build");
app.use(express.static(clientBuildPath));

// Send the index.html file for any other requests
app.get("*", (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
});

// Socket.IO setup
io.on("connection", async (socket) => {
    console.log("A user connected");

    try {
        // Fetch initial message history from the database
        const messages = await Chat.find().sort({ timestamp: 1 });
        socket.emit("messageHistory", messages);
    } catch (error) {
        console.error("Error fetching message history:", error);
    }

    // Listen for new messages
    socket.on("newMessage", async (data) => {
        const { user, message } = data;

        // Save message to database
        const newMessage = new Chat({ user, message });
        await newMessage.save();

        // Broadcast message to all clients
        io.emit("newMessage", newMessage);
    });

    // Fetch all previous messages
    // socket.on("fetchMessages", async () => {
    //     const messages = await Chat.find().sort({ timestamp: 1 });
    //     socket.emit("messageHistory", messages);
    // });

    // Handle disconnection
    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
