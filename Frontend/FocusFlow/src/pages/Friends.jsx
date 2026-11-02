
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
    const searchUsers = async (event) => {
        event.preventDefault();

        if (!searchTerm.trim()) {
            setSearchResults([]);
            setMessage("Enter a name or username to search.");
            return;
        }

        try {
        setMessage("");

        const results = await api(`/friends/search?search=${encodeURIComponent(searchTerm.trim())}`);

        setSearchResults(
            results.map((user) => ({
                id: user._id,
                name: user.name,
                email: user.email
            }))
        );

        if (results.length === 0) {
            setMessage("No users found.");
        }
    } catch (error) {
        console.error("User search failed:", error);
        setMessage(error.message);
    }
};

    const sendFriendRequest = async (user) => {
    try {
        const response = await api(
            `/friends/request/${user.id}`,
            {
                method: "POST"
            }
        );

        setSentRequests((current) => [
            ...current,
            {
                id: response.request._id,
                userId: user.id,
                name: user.name,
                email: user.email
            }
        ]);

        setSearchResults((current) =>
            current.filter((result) => result.id !== user.id)
        );

        setMessage(`Friend request sent to ${user.name}.`);
    } catch (error) {
        console.error("Failed to send friend request:", error);
        setMessage(error.message);
    }
};

    const acceptRequest = async (request) => {
    try {
        await api(`/friends/requests/${request.id}/accept`, {
            method: "PUT"
        });

        setFriends((current) => [
            ...current,
            {
                _id: request.userId,
                name: request.name,
                email: request.email
            }
        ]);

        setReceivedRequests((current) =>
            current.filter((item) => item.id !== request.id)
        );

        setMessage(`You are now friends with ${request.name}.`);
    } catch (error) {
        console.error("Failed to accept friend request:", error);
        setMessage(error.message);
    }
};

    const declineRequest = async (requestId) => {
    try {
        await api(`/friends/requests/${requestId}/reject`, {
            method: "PUT"
        });

        setReceivedRequests((current) =>
            current.filter((request) => request.id !== requestId)
        );

        setMessage("Friend request declined.");
    } catch (error) {
        console.error("Failed to decline friend request:", error);
        setMessage(error.message);
    }
};

    const cancelRequest = async (requestId) => {
    try {
        await api(`/friends/requests/${requestId}/cancel`, {
            method: "DELETE"
        });

        setSentRequests((current) =>
            current.filter((request) => request.id !== requestId)
        );

        setMessage("Friend request cancelled.");
    } catch (error) {
        console.error("Failed to cancel friend request:", error);
        setMessage(error.message);
    }
};

    const removeFriend = async (friendId) => {
    const confirmRemoval = window.confirm(
        "Are you sure you want to remove this friend?"
    );

    if (!confirmRemoval) return;

    try {
        await api(`/friends/remove/${friendId}`, {
            method: "DELETE"
        });

        setFriends((current) =>
            current.filter((friend) => friend._id !== friendId)
        );

        setMessage("Friend removed successfully.");
    } catch (error) {
        console.error("Failed to remove friend:", error);
        setMessage(error.message);
    }
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

                                <button type="button"
                                    onClick={() => removeFriend(friend._id)}>
                                    Remove
                                </button>
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
