
import { useState } from "react";
import Navigation from "../components/Navigation";

function Notes() {
    const [notes, setNotes] = useState([]);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [search, setSearch] = useState("");

    const addNote = (e) => {
        e.preventDefault();

        if (title.trim() === "" || content.trim() === "") {
            return;
        }

        const newNote = {
            id: Date.now(),
            title: title.trim(),
            content: content.trim(),
            createdAt: new Date().toLocaleDateString("en-ZA"),
        };

        setNotes((currentNotes) => [...currentNotes, newNote]);

        setTitle("");
        setContent("");
    };

    const deleteNote = (id) => {
        setNotes((currentNotes) =>
            currentNotes.filter((note) => note.id !== id)
        );
    };

    const filteredNotes = notes.filter((note) =>
        `${note.title} ${note.content}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    return (
        <>
            <Navigation />

            <main>
                <h1>Notes</h1>
                <p>Create and organise your study notes.</p>

                <section>
                    <h2>Create a note</h2>

                    <form onSubmit={addNote}>
                        <label htmlFor="noteTitle">Title</label>
                        <input
                            id="noteTitle"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter note title"
                            required
                        />

                        <label htmlFor="noteContent">Content</label>
                        <textarea
                            id="noteContent"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write your notes here..."
                            rows={5}
                            required
                        />

                        <button type="submit">Save Note</button>
                    </form>
                </section>

                <section>
                    <h2>Your notes</h2>

                    <label htmlFor="noteSearch">Search notes</label>
                    <input
                        id="noteSearch"
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by title or content..."
                    />

                    {filteredNotes.length === 0 ? (
                        <p>No notes found.</p>
                    ) : (
                        <ul>
                            {filteredNotes.map((note) => (
                                <li key={note.id}>
                                    <h3>{note.title}</h3>
                                    <p>{note.content}</p>
                                    <small>Created: {note.createdAt}</small>
                                    <br />
                                    <button
                                        type="button"
                                        onClick={() => deleteNote(note.id)}
                                    >
                                        Delete
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </main>
        </>
    );
}

export default Notes;
