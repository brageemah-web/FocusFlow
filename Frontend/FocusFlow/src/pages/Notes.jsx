
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
    const [editingNoteId, setEditingNoteId] = useState(null);

    // Save notes whenever they change.
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

    // Clear the form and exit editing mode.
    const clearForm = () => {
        setNoteTitle("");
        setNoteContent("");
        setEditingNoteId(null);
    };

    // Create a new note.
    const addNote = (event) => {
        event.preventDefault();

        const title = noteTitle.trim();
        const content = noteContent.trim();

        if (!title || !content) return;

        const now = new Date().toISOString();

        const newNote = {
            id: crypto.randomUUID(),
            title,
            content,
            createdAt: now,
            updatedAt: now,
        };

        setNotes((currentNotes) => [
            newNote,
            ...currentNotes,
        ]);

        clearForm();
    };

    // Load an existing note into the form.
    const startEditing = (note) => {
        setEditingNoteId(note.id);
        setNoteTitle(note.title || "");
        setNoteContent(note.content || "");
    };

    // Save changes to the existing note.
    const saveNoteChanges = (event) => {
        event.preventDefault();

        const title = noteTitle.trim();
        const content = noteContent.trim();

        if (!title || !content || editingNoteId === null) {
            return;
        }

        setNotes((currentNotes) =>
            currentNotes.map((note) =>
                note.id === editingNoteId
                    ? {
                          ...note,
                          title,
                          content,
                          updatedAt: new Date().toISOString(),
                      }
                    : note
            )
        );

        clearForm();
    };

    // Delete a note.
    const deleteNote = (noteId) => {
        setNotes((currentNotes) =>
            currentNotes.filter(
                (note) => note.id !== noteId
            )
        );

        if (editingNoteId === noteId) {
            clearForm();
        }
    };

    // Search note titles and content.
    const filteredNotes = notes.filter((note) => {
        const search = searchTerm.toLowerCase();

        return (
            (note.title || "").toLowerCase().includes(search) ||
            (note.content || "").toLowerCase().includes(search)
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
                    <h2>
                        {editingNoteId !== null
                            ? "Edit Note"
                            : "Create a Note"}
                    </h2>

                    <form
                        onSubmit={
                            editingNoteId !== null
                                ? saveNoteChanges
                                : addNote
                        }
                    >
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
                            {editingNoteId !== null
                                ? "Save Changes"
                                : "Save Note"}
                        </button>

                        {editingNoteId !== null && (
                            <button
                                type="button"
                                onClick={clearForm}
                            >
                                Cancel
                            </button>
                        )}
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
                                <h3>{note.title || "Untitled note"}</h3>
                                <p>{note.content}</p>

                                <small>
                                    Created:{" "}
                                    {note.createdAt
                                        ? new Date(
                                              note.createdAt
                                          ).toLocaleString()
                                        : "Unknown"}
                                </small>

                                {note.updatedAt &&
                                    note.updatedAt !== note.createdAt && (
                                        <p>
                                            <small>
                                                Last updated:{" "}
                                                {new Date(
                                                    note.updatedAt
                                                ).toLocaleString()}
                                            </small>
                                        </p>
                                    )}

                                <div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            startEditing(note)
                                        }
                                    >
                                        Edit
                                    </button>

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
