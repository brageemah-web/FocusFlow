
import { useState } from "react";
import Navigation from "../components/Navigation";

function Chat() {
    const [conversations, setConversations] = useState([]);
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [message, setMessage] = useState("");

    const selectedChat = conversations.find(
        (chat) => chat.id === selectedChatId
    );

    const sendMessage = (event) => {
        event.preventDefault();

        const trimmedMessage = message.trim();

        if (!trimmedMessage || !selectedChat) return;

        const newMessage = {
            id: crypto.randomUUID(),
            text: trimmedMessage,
            sender: "me",
            time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
        };

        setConversations((currentConversations) =>
            currentConversations.map((chat) =>
                chat.id === selectedChatId
                    ? {
                          ...chat,
                          messages: [...chat.messages, newMessage],
                      }
                    : chat
            )
        );

        setMessage("");
    };

    return (
        <>
            <Navigation />

            <main>
                <h1>Chat</h1>
                <p>Connect with your friends and keep each other motivated.</p>

                <section>
                    <h2>Conversations</h2>

                    {conversations.length === 0 ? (
                        <p>
                            No conversations yet. Connect with a friend to
                            start chatting.
                        </p>
                    ) : (
                        conversations.map((chat) => (
                            <button
                                key={chat.id}
                                type="button"
                                onClick={() => setSelectedChatId(chat.id)}
                                disabled={selectedChatId === chat.id}
                            >
                                {chat.name}
                            </button>
                        ))
                    )}
                </section>

                {selectedChat && (
                    <section>
                        <h2>{selectedChat.name}</h2>
                        <p>{selectedChat.username}</p>

                        <div
                            style={{
                                border: "1px solid #ccc",
                                padding: "16px",
                                minHeight: "250px",
                            }}
                            aria-live="polite"
                            aria-label={`Messages with ${selectedChat.name}`}
                        >
                            {selectedChat.messages.map((chatMessage) => (
                                <div key={chatMessage.id}>
                                    <p>
                                        <strong>
                                            {chatMessage.sender === "me"
                                                ? "You"
                                                : selectedChat.name}
                                        </strong>
                                    </p>
                                    <p>{chatMessage.text}</p>
                                    <small>{chatMessage.time}</small>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={sendMessage}>
                            <label htmlFor="chatMessage">
                                Type a message
                            </label>

                            <input
                                id="chatMessage"
                                type="text"
                                value={message}
                                onChange={(event) =>
                                    setMessage(event.target.value)
                                }
                                placeholder="Write a message..."
                            />

                            <button
                                type="submit"
                                disabled={!message.trim()}
                            >
                                Send
                            </button>
                        </form>
                    </section>
                )}
            </main>
        </>
    );
}

export default Chat;
