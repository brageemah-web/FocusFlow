

import { useEffect, useState } from "react";
import Navigation from "../components/Navigation";

const STORAGE_KEY = "focusflow_notes";

function Notes() {
    const [notes, setNotes] = useState(() => {
        try {
            const savedNotes = localStorage.getItem(STORAGE_KEY);
            return savedNotes ? JSON.parse(savedNotes) : [];
        } catch (error) {
            console.error("Could not load notes:", error);
            return [];
        }
    });

    const [noteTitle, setNoteTitle] = useState("");
    const [noteContent, setNoteContent] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    // Save notes whenever they change
    useEffect(() => {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(notes)
            );
        } catch (error) {
            console.error("Could not save notes:", error);
        }
    }, [notes]);

    // Create a new note
    const addNote = (event) => {
        event.preventDefault();

        const title = noteTitle.trim();
        const content = noteContent.trim();

        if (!title || !content) return;

        const newNote = {
            id: crypto.randomUUID(),
            title,
            content,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        setNotes((currentNotes) => [
            newNote,
            ...currentNotes,
        ]);

        setNoteTitle("");
        setNoteContent("");
    };

    // Delete a note
    const deleteNote = (noteId) => {
        setNotes((currentNotes) =>
            currentNotes.filter(
                (note) => note.id !== noteId
            )
        );
    };

    // Search note titles and content
    const filteredNotes = notes.filter((note) => {
        const search = searchTerm.toLowerCase();

        return (
            note.title.toLowerCase().includes(search) ||
            note.content.toLowerCase().includes(search)
        );
    });

    return (
        <>
            <Navigation />

            <main>
                <h1>Notes</h1>
                <p>
                    Keep your ideas, reminders, and study notes
                    organised in one place.
                </p>

                <section>
                    <h2>Create a Note</h2>

                    <form onSubmit={addNote}>
                        <div>
                            <label htmlFor="noteTitle">
                                Note title
                            </label>

                            <input
                                id="noteTitle"
                                type="text"
                                value={noteTitle}
                                onChange={(event) =>
                                    setNoteTitle(event.target.value)
                                }
                                placeholder="Enter note title"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="noteContent">
                                Note content
                            </label>

                            <textarea
                                id="noteContent"
                                value={noteContent}
                                onChange={(event) =>
                                    setNoteContent(event.target.value)
                                }
                                placeholder="Write your notes here..."
                                rows={6}
                                required
                            />
                        </div>

                        <button type="submit">
                            Save Note
                        </button>
                    </form>
                </section>

                <section>
                    <h2>My Notes ({notes.length})</h2>

                    <label htmlFor="searchNotes">
                        Search notes
                    </label>

                    <input
                        id="searchNotes"
                        type="search"
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(event.target.value)
                        }
                        placeholder="Search by title or content..."
                    />

                    {filteredNotes.length === 0 ? (
                        <p>
                            {notes.length === 0
                                ? "No notes yet. Create your first note above!"
                                : "No notes match your search."}
                        </p>
                    ) : (
                        filteredNotes.map((note) => (
                            <article key={note.id}>
                                <h3>{note.title}</h3>
                                <p>{note.content}</p>

                                <small>
                                    Created:{" "}
                                    {new Date(
                                        note.createdAt
                                    ).toLocaleString()}
                                </small>

                                <div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            deleteNote(note.id)
                                        }
                                    >
                                        Delete
                                    </button>
                                </div>
                            </article>
                        ))
                    )}
                </section>
            </main>
        </>
    );
}

export default Notes;
