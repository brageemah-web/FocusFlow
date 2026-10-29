
import { useState } from "react";
import Navigation from "../components/Navigation";

function Friends() {
    const [friends, setFriends] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [receivedRequests, setReceivedRequests] = useState([]);

    const searchUsers = async (event) => {
        event.preventDefault();

        const query = searchTerm.trim();

        if (!query) {
            setSearchResults([]);
            return;
        }

        // Backend user-search API will be connected here.
        setSearchResults([]);
    };

    const sendFriendRequest = (user) => {
        setSentRequests((current) =>
            current.some((request) => request.id === user.id)
                ? current
                : [...current, user]
        );

        setSearchResults((current) =>
            current.filter((result) => result.id !== user.id)
        );
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
    };

    const declineRequest = (requestId) => {
        setReceivedRequests((current) =>
            current.filter((request) => request.id !== requestId)
        );
    };

    const removeFriend = (friendId) => {
        setFriends((current) =>
            current.filter((friend) => friend.id !== friendId)
        );
    };

    return (
        <>
            <Navigation />

            <main>
                <h1>Friends</h1>
                <p>Connect with friends and keep each other motivated.</p>

                <section>
                    <h2>Find Friends</h2>

                    <form onSubmit={searchUsers}>
                        <label htmlFor="searchUsers">
                            Search by name or username
                        </label>

                        <input
                            id="searchUsers"
                            type="search"
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                            placeholder="Search users..."
                        />

                        <button type="submit">Search</button>
                    </form>

                    {searchResults.length === 0 && searchTerm.trim() && (
                        <p>
                            No search results yet. User search will work once
                            the backend is connected.
                        </p>
                    )}

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

                    {friends.length === 0 ? (
                        <p>You haven't added any friends yet.</p>
                    ) : (
                        friends.map((friend) => (
                            <div key={friend.id}>
                                <span>{friend.name}</span>
                                <button
                                    type="button"
                                    onClick={() =>
                                        removeFriend(friend.id)
                                    }
                                >
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
                                <span>{request.name}</span>
                                <span> Pending</span>
                            </div>
                        ))
                    )}
                </section>

                <section>
                    <h2>Received Requests ({receivedRequests.length})</h2>

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
                                    onClick={() =>
                                        declineRequest(request.id)
                                    }
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
