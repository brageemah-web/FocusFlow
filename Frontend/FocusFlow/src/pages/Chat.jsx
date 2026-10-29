import { useEffect, useState } from "react";
import Navigation from "../components/Navigation";

const STORAGE_KEY = "focusflow_chat_conversations";

function loadConversations() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) return [];

        const parsed = JSON.parse(saved);

        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("Could not load conversations:", error);
        return [];
    }
}

function Chat() {
    const [conversations, setConversations] = useState(loadConversations);
    const [selectedChatId, setSelectedChatId] = useState(null);

    const [friendName, setFriendName] = useState("");
    const [friendUsername, setFriendUsername] = useState("");

    const [message, setMessage] = useState("");
    const [statusMessage, setStatusMessage] = useState("");

    const selectedChat = conversations.find(
        (chat) => chat.id === selectedChatId
    );

    // Save conversations whenever they change
    useEffect(() => {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(conversations)
            );
        } catch (error) {
            console.error("Could not save conversations:", error);
        }
    }, [conversations]);

    // Create a new conversation
    const createConversation = (event) => {
        event.preventDefault();

        const name = friendName.trim();
        const username = friendUsername.trim();

        if (!name || !username) {
            setStatusMessage("Enter both a name and username.");
            return;
        }

        const existingChat = conversations.find(
            (chat) =>
                chat.username.toLowerCase() === username.toLowerCase()
        );

        if (existingChat) {
            setSelectedChatId(existingChat.id);
            setStatusMessage("This conversation already exists.");
            setFriendName("");
            setFriendUsername("");
            return;
        }

        const newConversation = {
            id: crypto.randomUUID(),
            name,
            username,
            messages: [],
            createdAt: new Date().toISOString(),
        };

        setConversations((current) => [
            ...current,
            newConversation,
        ]);

        setSelectedChatId(newConversation.id);
        setFriendName("");
        setFriendUsername("");
        setStatusMessage(`Conversation with ${name} created.`);
    };

    // Send a message
    const sendMessage = (event) => {
        event.preventDefault();

        const text = message.trim();

        if (!text || !selectedChat) return;

        const newMessage = {
            id: crypto.randomUUID(),
            text,
            sender: "me",
            createdAt: new Date().toISOString(),
        };

        setConversations((current) =>
            current.map((chat) =>
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

    // Delete one of your messages
    const deleteMessage = (messageId) => {
        setConversations((current) =>
            current.map((chat) =>
                chat.id === selectedChatId
                    ? {
                          ...chat,
                          messages: chat.messages.filter(
                              (item) => item.id !== messageId
                          ),
                      }
                    : chat
            )
        );
    };

    // Delete a conversation and its local messages
    const deleteConversation = (chatId) => {
        setConversations((current) =>
            current.filter((chat) => chat.id !== chatId)
        );

        if (selectedChatId === chatId) {
            setSelectedChatId(null);
        }

        setStatusMessage("Conversation deleted.");
    };

    return (
        <>
            <Navigation />

            <main>
                <h1>Chat</h1>
                <p>
                    Connect with your friends and keep each other motivated.
                </p>

                {statusMessage && (
                    <p role="status" aria-live="polite">
                        {statusMessage}
                    </p>
                )}

                <section>
                    <h2>Start New Conversation</h2>

                    <form onSubmit={createConversation}>
                        <div>
                            <label htmlFor="friendName">
                                Friend's name
                            </label>

                            <input
                                id="friendName"
                                type="text"
                                value={friendName}
                                onChange={(event) =>
                                    setFriendName(event.target.value)
                                }
                                placeholder="Enter a name"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="friendUsername">
                                Friend's username
                            </label>

                            <input
                                id="friendUsername"
                                type="text"
                                value={friendUsername}
                                onChange={(event) =>
                                    setFriendUsername(event.target.value)
                                }
                                placeholder="e.g. alex123"
                                required
                            />
                        </div>

                        <button type="submit">
                            Start Conversation
                        </button>
                    </form>

                    <p>
                        For now, you can create local test conversations.
                        These do not contact real users.
                    </p>
                </section>

                <section>
                    <h2>Conversations ({conversations.length})</h2>

                    {conversations.length === 0 ? (
                        <p>
                            No conversations yet. Create one above to get
                            started.
                        </p>
                    ) : (
                        conversations.map((chat) => (
                            <article key={chat.id}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedChatId(chat.id);
                                        setStatusMessage("");
                                    }}
                                    disabled={selectedChatId === chat.id}
                                >
                                    {chat.name} (@{chat.username})
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        deleteConversation(chat.id)
                                    }
                                >
                                    Delete Conversation
                                </button>
                            </article>
                        ))
                    )}
                </section>

                {selectedChat && (
                    <section>
                        <h2>Chat with {selectedChat.name}</h2>
                        <p>@{selectedChat.username}</p>

                        <div
                            aria-label={`Messages with ${selectedChat.name}`}
                            aria-live="polite"
                            style={{
                                border: "1px solid #ccc",
                                padding: "16px",
                                minHeight: "250px",
                            }}
                        >
                            {selectedChat.messages.length === 0 ? (
                                <p>
                                    No messages yet. Start the conversation!
                                </p>
                            ) : (
                                selectedChat.messages.map((item) => (
                                    <article key={item.id}>
                                        <p>
                                            <strong>
                                                {item.sender === "me"
                                                    ? "You"
                                                    : selectedChat.name}
                                            </strong>
                                        </p>

                                        <p>{item.text}</p>

                                        <small>
                                            {new Date(
                                                item.createdAt
                                            ).toLocaleString()}
                                        </small>

                                        {item.sender === "me" && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    deleteMessage(item.id)
                                                }
                                            >
                                                Delete Message
                                            </button>
                                        )}
                                    </article>
                                ))
                            )}
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
                                required
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
