import { useEffect, useState } from "react";
import Navigation from "../components/Navigation";
import api from "../api";

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

    const [message, setMessage] = useState("");
    const [statusMessage, setStatusMessage] = useState("");

    const [friends, setFriends] = useState([]);
    const [loadingFriends, setLoadingFriends] = useState(true);
    const [selectedFriendId, setSelectedFriendId] = useState("");

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
    
const createConversation = async (event) => {
    event.preventDefault();

    if (!selectedFriendId) {
        setStatusMessage("Please select a friend.");
        return;
    }

    try {
        const data = await api(`/conversations/${selectedFriendId}`, {
            method: "POST"
        });

        const conversation = data.conversation;

        const friend = conversation.participants.find(
            (participant) => participant._id === selectedFriendId
        );

        if (!friend) {
            throw new Error("Could not find the selected friend.");
        }

        const newChat = {
            id: conversation._id,
            name: friend.name,
            username: friend.email,
            messages: []
        };

        setConversations((current) => {
            const exists = current.some(
                (chat) => chat.id === newChat.id
            );

            return exists ? current : [...current, newChat];
        });

        setSelectedChatId(conversation._id);
        setSelectedFriendId("");
        setStatusMessage(data.message);

    } catch (error) {
        setStatusMessage(error.message);
    }
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

    useEffect(() => {
    const fetchFriends = async () => {
        try {
            const data = await api("/friends");

            console.log("Friends retrieved:", data.friends);
            setFriends(data.friends);
        } catch (error) {
            console.error("Failed to retrieve friends:", error);
            setStatusMessage(error.message);
        } finally {
            setLoadingFriends(false);
        }
    };

    fetchFriends();
}, []);

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
                    <label htmlFor="friendSelect">
                        Select a friend
                    </label>

                    <select
                        id="friendSelect"
                        value={selectedFriendId}
                        onChange={(event) => setSelectedFriendId(event.target.value)}
                        required
                    >
                        <option value="">Choose a friend</option>

                        {friends.map((friend) => (
                            <option key={friend._id} value={friend._id}>
                                {friend.name} ({friend.email})
                            </option>
                        ))}
                    </select>

                    <button type="submit" disabled={!selectedFriendId}>
                        Start Conversation
                    </button>
                </form>

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
