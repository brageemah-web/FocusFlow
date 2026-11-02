import { useEffect, useState } from "react";
import Navigation from "../components/Navigation";
import api from "../api";
import socket from "../socket";


function Chat() {
    const [conversations, setConversations] = useState([]);
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [selectedChatId, setSelectedChatId] = useState(null);

    const [message, setMessage] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const [loadingMessages, setLoadingMessages] = useState(false);

    const [friends, setFriends] = useState([]);
    const [loadingFriends, setLoadingFriends] = useState(true);
    const [selectedFriendId, setSelectedFriendId] = useState("");

    const [onlineUsers, setOnlineUsers] = useState([]);

    const selectedChat = conversations.find(
        (chat) => chat.id === selectedChatId
    );

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
            friendId: friend._id.toString(),
            name: friend.name,
            username: friend.email,
            messages: [],
            unreadCount: 0
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
const sendMessage = async (event) => {
    event.preventDefault();

    const text = message.trim();

    if (!text || !selectedChat) return;

    try {
        const data = await api(`/messages/${selectedChatId}`, {
            method: "POST",
            body: JSON.stringify({ text })
        });

        console.log("Message sent:", data.message);

        const savedMessage = data.data;

        const formattedMessage = {
            id: savedMessage._id,
            text: savedMessage.text,
            sender: "me",
            createdAt: savedMessage.createdAt
        };

        setConversations((current) =>
            current.map((chat) => {
                if (chat.id !== selectedChatId) {
                    return chat;
                }

                const alreadyExists = chat.messages.some(
                    (item) => item.id === formattedMessage.id
                );

                if (alreadyExists) {
                    return chat;
                }

                return {
                    ...chat,
                    messages: [...chat.messages, formattedMessage]
                };
            })
        );

        setMessage("");
        setStatusMessage("");

    } catch (error) {
        console.error("Failed to send message:", error);
        setStatusMessage(error.message);
    }
};

    // Delete one of your messages
    const deleteMessage = async (messageId) => {
    try {
        await api(`/messages/${selectedChatId}/${messageId}`, {
            method: "DELETE"
        });

        setConversations((current) =>
            current.map((chat) =>
                chat.id === selectedChatId
                    ? {
                        ...chat,
                        messages: chat.messages.filter(
                            (item) => item.id !== messageId
                        )
                    }
                    : chat
            )
        );

        setStatusMessage("Message deleted successfully.");

    } catch (error) {
        console.error("Failed to delete message:", error);
        setStatusMessage(error.message);
    }
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

useEffect(() => {
    const fetchConversations = async () => {
        try {
            const data = await api("/conversations");

            console.log("Conversations response:", data);

            const currentUserId = localStorage.getItem("userId");

            console.log("Current user ID:", currentUserId);

            const formattedConversations = data.conversations.map(
                (conversation) => {
                    console.log(
                        "Conversation participants:",
                        conversation.participants
                    );

                    const friend = conversation.participants.find(
                        (participant) =>
                            participant._id.toString() !== currentUserId
                    );

                    return {
                        id: conversation._id,
                        friendId: friend?._id.toString(),
                        name: friend?.name || "Unknown User",
                        username: friend?.email || "",
                        messages: [],
                        unreadCount: conversation.unreadCount || 0
                    };
                }
            );

            console.log("Formatted conversations:", formattedConversations);

            setConversations(formattedConversations);

        } catch (error) {
            console.error("Failed to retrieve conversations:", error);
            setStatusMessage(error.message);
        } finally {
            setLoadingConversations(false);
        }
    };

    fetchConversations();
}, []);

// Fetch messages when a conversation is selected
useEffect(() => {
    if (!selectedChatId) return;

    const fetchMessages = async () => {
        try {
            setLoadingMessages(true);

            const data = await api(`/messages/${selectedChatId}`);

            await api(`/messages/${selectedChatId}/read`, {
                method: "PUT"
            });

            setConversations((current) =>
                current.map((chat) =>
                    chat.id === selectedChatId
                        ? { ...chat, unreadCount: 0 }
                        : chat
                )
            );

            console.log("Messages retrieved:", data.messages);

            const currentUserId = localStorage.getItem("userId");

            const formattedMessages = data.messages.map((item) => ({
                id: item._id,
                text: item.text,
                sender:
                    item.sender._id === currentUserId
                        ? "me"
                        : "friend",
                createdAt: item.createdAt,
                isRead: item.sender._id === currentUserId
                    ? item.isRead
                    : true
            }));

            setConversations((current) =>
                current.map((chat) =>
                    chat.id === selectedChatId
                        ? { ...chat, messages: formattedMessages }
                        : chat
                )
            );

        } catch (error) {
            console.error("Failed to retrieve messages:", error);
            setStatusMessage(error.message);
        } finally {
            setLoadingMessages(false);
        }
    };

    fetchMessages();

}, [selectedChatId]);

// Listen for incoming real-time messages
useEffect(() => {
    const handleReceiveMessage = (newMessage) => {
        console.log("Real-time message received:", newMessage);
        const currentUserId = localStorage.getItem("userId");

        const formattedMessage = {
            id: newMessage._id,
            text: newMessage.text,
            sender:
                newMessage.sender._id === currentUserId
                    ? "me"
                    : "friend",
            createdAt: newMessage.createdAt
        };

        setConversations((current) =>
            current.map((chat) => {
                if (chat.id !== newMessage.conversation) {
                    return chat;
                }

                // Prevent duplicate messages
                const alreadyExists = chat.messages.some(
                    (item) => item.id === formattedMessage.id
                );

                if (alreadyExists) {
                    return chat;
                }

                return {
                    ...chat,
                    messages: [...chat.messages, formattedMessage]
                };
            })
        );
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
        socket.off("receive_message", handleReceiveMessage);
    };
}, []);

// Listen for new message notifications
useEffect(() => {
    const handleNewMessageNotification = (data) => {
        const currentUserId = localStorage.getItem("userId");

        // Don't increase the count for your own messages
        if (data.senderId === currentUserId) return;

        // Don't increase the count if this conversation is currently open
        if (data.conversationId === selectedChatId) return;

        setConversations((current) =>
            current.map((chat) =>
                chat.id === data.conversationId
                    ? {
                        ...chat,
                        unreadCount: (chat.unreadCount || 0) + 1
                    }
                    : chat
            )
        );
    };

    socket.on(
        "new_message_notification",
        handleNewMessageNotification
    );

    return () => {
        socket.off(
            "new_message_notification",
            handleNewMessageNotification
        );
    };
}, [selectedChatId]);

// Listen for real-time message deletion
useEffect(() => {
    const handleMessageDeleted = (data) => {
        console.log("Message deleted event received:", data);

        setConversations((current) =>
            current.map((chat) =>
                chat.id === data.conversationId
                    ? {
                        ...chat,
                        messages: chat.messages.filter(
                            (item) => item.id !== data.messageId
                        )
                    }
                    : chat
            )
        );
    };

    socket.on("message_deleted", handleMessageDeleted);

    return () => {
        socket.off("message_deleted", handleMessageDeleted);
    };
}, []);

// Listen for real-time read receipts
useEffect(() => {
    const handleMessagesRead = (data) => {
        console.log("Messages read event received:", data);

        const currentUserId = localStorage.getItem("userId");

        setConversations((current) =>
            current.map((chat) =>
                chat.id === data.conversationId
                    ? {
                        ...chat,
                        messages: chat.messages.map((item) =>
                            item.sender === "me"
                                ? { ...item, isRead: true }
                                : item
                        )
                    }
                    : chat
            )
        );
    };

    socket.on("messages_read", handleMessagesRead);

    return () => {
        socket.off("messages_read", handleMessagesRead);
    };
}, []);

// Join the selected conversation room
useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("No authentication token found.");
        return;
    }

    socket.auth = { token };

    if (!socket.connected) {
        socket.connect();
    }

}, []);

// Get the initial list of online users
useEffect(() => {
    const handleOnlineUsers = (users) => {
        setOnlineUsers(users);
    };

    socket.on("online_users", handleOnlineUsers);

    return () => {
        socket.off("online_users", handleOnlineUsers);
    };
}, []);

// Listen for online/offline status changes
useEffect(() => {
    const handleUserStatus = (data) => {
        setOnlineUsers((current) => {
            if (data.status === "online") {
                return current.includes(data.userId)
                    ? current
                    : [...current, data.userId];
            }

            return current.filter((id) => id !== data.userId);
        });
    };

    socket.on("user_status", handleUserStatus);

    return () => {
        socket.off("user_status", handleUserStatus);
    };
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

                    {loadingConversations ? (
                        <p>Loading conversations...</p>
                    ) : (
                        conversations.map((chat) => (
                            <article key={chat.id}>
                                <p>
                                    {chat.name}

                                    {chat.unreadCount > 0 && (
                                        <span>
                                            {" "}({chat.unreadCount} unread)
                                        </span>
                                    )}
                                </p>

                                <p>
                                    {onlineUsers.includes(chat.friendId)
                                        ? "🟢 Online"
                                        : "⚫ Offline"}
                                </p>

                                <p>{chat.username}</p>

                                <button
                                    type="button"
                                    onClick={() => setSelectedChatId(chat.id)}
                                >
                                    Open Chat
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
                            {loadingMessages ? (
                                <p>Loading messages...</p>
                            ) : selectedChat.messages.length === 0 ? (
                                <p>No messages yet. Start the conversation!</p>
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
                                            {new Date(item.createdAt).toLocaleString()}
                                        </small>
                                        {item.sender === "me" && (
                                            <small>
                                                {item.isRead ? "✓✓ Read" : "✓ Sent"}
                                            </small>
                                        )}

                                        {item.sender === "me" && (
                                            <button
                                                type="button"
                                                onClick={() => deleteMessage(item.id)}
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
