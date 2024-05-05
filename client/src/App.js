import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

function App() {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [username, setUsername] = useState("");

    useEffect(() => {
        // Fetch initial message history when component mounts
        socket.emit("fetchMessages");

        // Listen for initial message history
        socket.on("messageHistory", (history) => {
            setMessages(history);
        });

        // Listen for new messages
        socket.on("newMessage", (message) => {
            setMessages([...messages, message]);
        });

        // Clean up on component unmount
        return () => {
            socket.off("messageHistory");
            socket.off("newMessage");
        };
    }, [messages]);

    const sendMessage = () => {
        if (inputMessage.trim() !== "") {
            socket.emit("newMessage", { user: username, message: inputMessage });
            setInputMessage("");
        }
    };

    return (
        <div className="App">
            <h1>Chat App</h1>
            <div>
                <input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>
            <div>
                <textarea
                    placeholder="Enter your message"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                />
            </div>
            <button onClick={sendMessage}>Send</button>
            <div>
                {messages.map((msg, index) => (
                    <div key={index}>
                        <strong>{msg.user}: </strong>
                        <span>{msg.message}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;
