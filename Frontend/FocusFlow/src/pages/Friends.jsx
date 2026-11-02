
import { useEffect, useState } from "react";
import Navigation from "../components/Navigation";
import api from "../api";


function Friends() {
    const [friends, setFriends] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    const [sentRequests, setSentRequests] = useState([]);
    const [receivedRequests, setReceivedRequests] = useState([]);

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);


    // User search requires the backend.
    const searchUsers = (event) => {
        event.preventDefault();

        if (!searchTerm.trim()) {
            setSearchResults([]);
            setMessage("Enter a name or username to search.");
            return;
        }

        setSearchResults([]);
        setMessage(
            "User search will be available when the backend is connected."
        );
    };

    const sendFriendRequest = (user) => {
        const alreadyFriend = friends.some(
            (friend) => friend.id === user.id
        );

        const alreadySent = sentRequests.some(
            (request) => request.id === user.id
        );

        if (alreadyFriend || alreadySent) return;

        setSentRequests((current) => [...current, user]);
        setSearchResults((current) =>
            current.filter((result) => result.id !== user.id)
        );
        setMessage(`Friend request sent to ${user.name}.`);
    };

    const acceptRequest = (request) => {
        setFriends((current) =>
            current.some((friend) => friend.id === request.id)
                ? current
                : [...current, request]
        );

        setReceivedRequests((current) =>
            current.filter((item) => item.id !== request.id)
        );

        setMessage(`You are now friends with ${request.name}.`);
    };

    const declineRequest = (requestId) => {
        setReceivedRequests((current) =>
            current.filter((request) => request.id !== requestId)
        );

        setMessage("Friend request declined.");
    };

    const cancelRequest = (requestId) => {
        setSentRequests((current) =>
            current.filter((request) => request.id !== requestId)
        );

        setMessage("Friend request cancelled.");
    };

    const removeFriend = (friendId) => {
        setFriends((current) =>
            current.filter((friend) => friend.id !== friendId)
        );

        setMessage("Friend removed.");
    };

    // Temporary helper for testing the received-request workflow.
    const addTestRequest = () => {
        const testUser = {
            id: crypto.randomUUID(),
            name: `Test User ${receivedRequests.length + 1}`,
        };

        setReceivedRequests((current) => [...current, testUser]);
        setMessage("A test friend request was added.");
    };

    useEffect(() => {
    const fetchFriendsData = async () => {
        try {
            const [friendsData, sentData, receivedData] =
                await Promise.all([
                    api("/friends"),
                    api("/friends/requests/sent"),
                    api("/friends/requests/received")
                ]);

            setFriends(friendsData.friends);

            setSentRequests(
                sentData.map((request) => ({
                    id: request._id,
                    userId: request.receiver._id,
                    name: request.receiver.name,
                    email: request.receiver.email
                }))
            );

            setReceivedRequests(
                receivedData.map((request) => ({
                    id: request._id,
                    userId: request.sender._id,
                    name: request.sender.name,
                    email: request.sender.email
                }))
            );

        } catch (error) {
            console.error("Failed to load friends data:", error);
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    fetchFriendsData();
}, []);

    return (
        <>
            <Navigation />

            <main>
                <h1>Friends</h1>
                <p>
                    Connect with friends and keep each other motivated.
                </p>

                {message && (
                    <p role="status" aria-live="polite">
                        {message}
                    </p>
                )}

                <section>
                    <h2>Find Friends </h2>

                    <form onSubmit={searchUsers}>
                        <label htmlFor="searchUsers">
                            Search by name or username
                        </label>

                        <input
                            id="searchUsers"
                            type="search"
                            value={searchTerm}
                            onChange={(event) => {
                                setSearchTerm(event.target.value);
                                setMessage("");
                            }}
                            placeholder="Search users..."
                        />

                        <button type="submit">Search</button>
                    </form>

                    {searchResults.map((user) => (
                        <div key={user.id}>
                            <span>{user.name}</span>
                            <button
                                type="button"
                                onClick={() => sendFriendRequest(user)}
                            >
                                Add Friend
                            </button>
                        </div>
                    ))}
                </section>

                <section>
                    <h2>My Friends ({friends.length})</h2>

                    {loading ? (
                        <p>Loading friends...</p>
                    ) : friends.length === 0 ? (
                        <p>You haven't added any friends yet.</p>
                    ) : (
                        friends.map((friend) => (
                            <div key={friend._id}>
                                <span>{friend.name}</span>
                            </div>
                        ))
                    )}
                </section>

                <section>
                    <h2>Sent Requests ({sentRequests.length})</h2>

                    {sentRequests.length === 0 ? (
                        <p>You have no pending sent requests.</p>
                    ) : (
                        sentRequests.map((request) => (
                            <div key={request.id}>
                                <span>{request.name} — Pending</span>
                                <button
                                    type="button"
                                    onClick={() => cancelRequest(request.id)}
                                >
                                    Cancel
                                </button>
                            </div>
                        ))
                    )}
                </section>

                <section>
                    <h2>
                        Received Requests ({receivedRequests.length})
                    </h2>

                 
                    {receivedRequests.length === 0 ? (
                        <p>You have no incoming friend requests.</p>
                    ) : (
                        receivedRequests.map((request) => (
                            <div key={request.id}>
                                <span>{request.name}</span>

                                <button
                                    type="button"
                                    onClick={() => acceptRequest(request)}
                                >
                                    Accept
                                </button>

                                <button
                                    type="button"
                                    onClick={() => declineRequest(request.id)}
                                >
                                    Decline
                                </button>
                            </div>
                        ))
                    )}
                </section>
            </main>
        </>
    );
}

export default Friends;
