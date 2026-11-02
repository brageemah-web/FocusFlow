
import { useEffect, useState } from "react";
import Navigation from "../components/Navigation";
import api from "../api";


function Calendar() {
    const [events, setEvents] = useState([]);
    const [loading, setloading] = useState(true);
    const [message, setMessage] = useState("");

    const [currentDate, setCurrentDate] = useState(new Date());

    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date();

        return [
            today.getFullYear(),
            String(today.getMonth() + 1).padStart(2, "0"),
            String(today.getDate()).padStart(2, "0"),
        ].join("-");
    });

    const [eventTitle, setEventTitle] = useState("");
    const [editingEventId, setEditingEventId] = useState(null);

    useEffect(() => {
        const fetchEvents = async() => {
            try{
                const data = await api("/calendar");
                console.log("Events retrieved from backend: ", data);
                setEvents(data);
            }
            catch(error){
                console.error("Failed to retrieve calendar events: ", error);
                setMessage(error.message);
            }
            finally{
                setloading(false);
            }   
        }; 
        fetchEvents();
    }, []);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthName = currentDate.toLocaleString("default", {
        month: "long",
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Change the displayed month.
    const changeMonth = (amount) => {
        setCurrentDate(new Date(year, month + amount, 1));
    };

    // Clear the event form.
    const clearForm = () => {
        setEventTitle("");
        setEditingEventId(null);
    };

    // Add a new event.
    const addEvent = async (event) => {
        event.preventDefault();

        const title = eventTitle.trim();

        if (!title || !selectedDate){
            setMessage("Please enter an event title and date.")
            return;
        }

        const eventData ={
            title: title,
            date: selectedDate,
        };

        console.log("Sending calendar event: ", eventData);

        try{
            const newEvent = await api("/calendar",{
                method : "POST",
                body: JSON.stringify(
                    eventData
                ),
            });

            setEvents((currentEvents) => [
                ...currentEvents,
                newEvent,
            ]);

            clearForm();
            setMessage("Event added successfully.");
        }
        catch(error){
            console.error("Failed to add calendar event: ", error);
            setMessage(error.message);
        }
    };

    // Load an existing event into the form.
    const startEditing = (event) => {
    setEditingEventId(event._id);
    setEventTitle(event.title || "");

    const eventDate = String(event.date).slice(0, 10);
    setSelectedDate(eventDate);

    const parsedDate = new Date(`${eventDate}T12:00:00`);

    if (!Number.isNaN(parsedDate.getTime())) {
        setCurrentDate(
            new Date(
                parsedDate.getFullYear(),
                parsedDate.getMonth(),
                1
            )
        );
    }
};

    // Save changes to an existing event.
    const saveEventChanges = async (event) => {
        event.preventDefault();

        const title = eventTitle.trim();

        if (!title || !selectedDate || editingEventId === null) {
            return;
        }

        const eventData = {
            title,
            data: selectedDate,
        }

        try{
            const updatedEvent = await api(`/calendar/${editingEventId}`,{
                method: "PUT",
                body: JSON.stringify(eventData),
            })

        setEvents((currentEvents) =>
            currentEvents.map((calendarEvent) =>
                calendarEvent._id === editingEventId
                    ? updatedEvent
                    : calendarEvent
            )
        );

        clearForm();
        setMessage("Event updated successfully.")
        }
        catch(error){
            console.error("Failed to update calendar event: ", error);
            setMessage(error.message);
        }
    };

    // Delete an event.
    const deleteEvent = async (eventId) => {
        try{
            await api(`/calendar/${eventId}`, {
                method: "DELETE",
            });
        setEvents((currentEvents) =>
            currentEvents.filter(
                (calendarEvent) => calendarEvent._id !== eventId
            )
        );

        if (editingEventId === eventId) {
            clearForm();
        }

        setMessage("Event deleted successfully");
    }
    catch(error){
        console.error("Failed to delete calendar event: ", error);
    }
    };

    // Get events for a specific date.
    const getEventsForDate = (date) =>
        events.filter(
            (calendarEvent) => 
                String(calendarEvent.date).slice(0,10) === date
        );

    // Select a day on the calendar.
    const selectDay = (day) => {
        const date = [
            year,
            String(month + 1).padStart(2, "0"),
            String(day).padStart(2, "0"),
        ].join("-");

        setSelectedDate(date);

        // If the user selects another date while editing,
        // cancel editing to avoid accidentally changing the wrong event.
        if (editingEventId !== null) {
            clearForm();
        }
    };

    const selectedEvents = getEventsForDate(selectedDate);
    console.log("Selected Date: ", selectedDate);
    console.log("Matching events: ", selectedEvents);

    return (
        <>
            <Navigation />

            <main>
                <h1>Calendar</h1>
                <p>
                    Plan your deadlines and keep track of important dates.
                </p>

                <section>
                    <div>
                        <button
                            type="button"
                            onClick={() => changeMonth(-1)}
                            aria-label="Previous month"
                        >
                            Previous
                        </button>

                        <h2>
                            {monthName} {year}
                        </h2>

                        <button
                            type="button"
                            onClick={() => changeMonth(1)}
                            aria-label="Next month"
                        >
                            Next
                        </button>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                            gap: "8px",
                        }}
                    >
                        {[
                            "Sun",
                            "Mon",
                            "Tue",
                            "Wed",
                            "Thu",
                            "Fri",
                            "Sat",
                        ].map((day) => (
                            <div key={day}>
                                <strong>{day}</strong>
                            </div>
                        ))}

                        {Array.from(
                            { length: firstDay },
                            (_, index) => (
                                <div key={`empty-${index}`} />
                            )
                        )}

                        {Array.from(
                            { length: daysInMonth },
                            (_, index) => {
                                const day = index + 1;

                                const date = [
                                    year,
                                    String(month + 1).padStart(2, "0"),
                                    String(day).padStart(2, "0"),
                                ].join("-");

                                const hasEvents =
                                    getEventsForDate(date).length > 0;

                                return (
                                    <button
                                        key={date}
                                        type="button"
                                        onClick={() => selectDay(day)}
                                        aria-pressed={selectedDate === date}
                                        style={{
                                            minHeight: "55px",
                                            border:
                                                selectedDate === date
                                                    ? "2px solid currentColor"
                                                    : "1px solid #ccc",
                                            borderRadius: "6px",
                                        }}
                                    >
                                        {day}

                                        {hasEvents && (
                                            <span aria-label="Has events">
                                                {" "}•
                                            </span>
                                        )}
                                    </button>
                                );
                            }
                        )}
                    </div>
                </section>

                <section>
                    <h2>Events for {selectedDate}</h2>

                    <form
                        onSubmit={
                            editingEventId !== null
                                ? saveEventChanges
                                : addEvent
                        }
                    >
                        <div>
                            <label htmlFor="selectedEventDate">
                                Event date
                            </label>

                            <input
                                id="selectedEventDate"
                                type="date"
                                value={selectedDate}
                                onChange={(event) => {
                                    setSelectedDate(event.target.value);

                                    if (editingEventId !== null) {
                                        clearForm();
                                    }
                                }}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="eventTitle">
                                Event title
                            </label>

                            <input
                                id="eventTitle"
                                type="text"
                                value={eventTitle}
                                onChange={(event) =>
                                    setEventTitle(event.target.value)
                                }
                                placeholder="e.g. Submit assignment"
                                required
                            />
                        </div>

                        <button type="submit">
                            {editingEventId !== null
                                ? "Save Changes"
                                : "Add Event"}
                        </button>

                        {editingEventId !== null && (
                            <button
                                type="button"
                                onClick={clearForm}
                            >
                                Cancel
                            </button>
                        )}
                    </form>

                    {message && <p role = "status">{message}</p>}
                    {loading ? (
                        <p>Loading events...</p>) :
                    selectedEvents.length === 0 ? (
                        <p>No events scheduled for this date.</p>
                    ) : (
                        selectedEvents.map((calendarEvent) => (
                            <article key={calendarEvent._id}>
                                <p>{calendarEvent.title}</p>

                                <button
                                    type="button"
                                    onClick={() =>
                                        startEditing(calendarEvent)
                                    }
                                >
                                    Edit
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        deleteEvent(calendarEvent._id)
                                    }
                                >
                                    Delete
                                </button>
                            </article>
                        ))
                    )}
                </section>
            </main>
        </>
    );
}

export default Calendar;
