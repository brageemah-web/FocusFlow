
import { useEffect, useState } from "react";
import Navigation from "../components/Navigation";
import api from "../api";
import "../styles/pages/Notes.css";

function Notes() {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const [noteTitle, setNoteTitle] = useState("");
    const [noteContent, setNoteContent] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingNoteId, setEditingNoteId] = useState(null);

    useEffect(() =>{
        const fetchNotes = async () =>{
            try{
                const data = await api("/notes");
                console.log("Notes retrieved from backend: ", data);
                setNotes(data);
            }
            catch(error){
                console.error("Failed to retrieve notes: ", error);
                setMessage(error.message);
            }
            finally{
                setLoading(false);
            }
        };
        fetchNotes();
    }, []);


    // Clear the form and exit editing mode.
    const clearForm = () => {
        setNoteTitle("");
        setNoteContent("");
        setEditingNoteId(null);
    };

    // Create a new note.
    const addNote = async (event) => {
        event.preventDefault();

        const title = noteTitle.trim();
        const content = noteContent.trim();

        if (!title || !content){
            setMessage("Please enter a title and content");
            return;
        }

        const noteData = {
            title,
            content,
        };

        try{

            const newNote = await api("/notes",{
                method : "POST",
                body: JSON.stringify(noteData)
            })

            setNotes((currentNotes) => [
                newNote,
                ...currentNotes,
            ]);

            clearForm();
            setMessage("Note created successfully");
        }
        catch(error){
            console.error("Failed to create note: ", error);
            setMessage(error.message);
        }
    };

    // Load an existing note into the form.
    const startEditing = (note) => {
        setEditingNoteId(note._id);
        setNoteTitle(note.title || "");
        setNoteContent(note.content || "");
    };

    // Save changes to the existing note.
    const saveNoteChanges = async (event) => {
        event.preventDefault();

        const title = noteTitle.trim();
        const content = noteContent.trim();

        if (!title || !content || editingNoteId === null) {
            return;
        }

        try {
            const updatedNote = await api(`/notes/${editingNoteId}`, {
                method: "PUT",
                body: JSON.stringify({ title, content })
            });

            setNotes((currentNotes) =>
                currentNotes.map((note) =>
                    note._id === editingNoteId ? updatedNote : note
                )
            );

            clearForm();
            setMessage("Note updated successfully.");

        } catch (error) {
            console.error("Failed to update note:", error);
            setMessage(error.message);
        }
    };

    // Delete a note.
    const deleteNote = async (noteId) => {
        try{
            await api(`/notes/${noteId}`,{
                method : "DELETE"
            });

        setNotes((currentNotes) =>
            currentNotes.filter(
                (note) => note._id !== noteId
            )
        );

        setMessage("Note deleted successfully.");
    }
    catch(error){
        console.error("Failed to delete note: ", error);
        setMessage(error.message);
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

            <main className="notesContent">
                <h1>Notes</h1>
                <p>
                    Keep your ideas, reminders, and study notes
                    organised in one place.
                </p>

                <section className="noteFormSection">
                    <h2>
                        {editingNoteId !== null
                            ? "Edit Note"
                            : "Create a Note"}
                    </h2>

                    <form className="noteForm"
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

                        <div className="noteFormActions">
                        <button type="submit" className="saveButton">
                            {editingNoteId
                                ? "Save Changes"
                                : "Save Note"}
                        </button>

                        {editingNoteId !== null && (
                            <button className="cancelButton"
                                type="button"
                                onClick={clearForm}
                            >
                                Cancel
                            </button>
                        )}
                        </div>
                    </form>
                </section>

                <section className="notesListSection">
                    <h2>My Notes ({notes.length})</h2>

                    <label htmlFor="searchNotes">
                        Search notes
                    </label>

                    <input className="notesSearch"
                        id="searchNotes"
                        type="search"
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(event.target.value)
                        }
                        placeholder="Search by title or content..."
                    />
                    {message && <p className="noteMessage" role="status">{message}</p>}

                    {loading ? (
                        <p>Loading notes...</p>
                    ) :filteredNotes.length === 0 ? (
                        <p>
                            {notes.length === 0
                                ? "No notes yet. Create your first note above!"
                                : "No notes match your search."}
                        </p>
                    ) : (
                        <div className="notesCardList">
                        {filteredNotes.map((note) => (
                            <article className="noteCard" key={note._id}>
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

                                <div className="noteActions">
                                    <button className="editButton"
                                        type="button"
                                        onClick={() =>
                                            startEditing(note)
                                        }
                                    >
                                        Edit
                                    </button>

                                    <button className="deleteButton"
                                        type="button"
                                        onClick={() =>
                                            deleteNote(note._id)
                                        }
                                    >
                                        Delete
                                    </button>
                                </div>
                            </article>
                        ))}
                        </div>
                    )}
                </section>
            </main>
        </>
    );
}

export default Notes;
