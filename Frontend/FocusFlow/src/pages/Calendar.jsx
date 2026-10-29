import {useState} from "react";
import Navigation from "../components/Navigation";

function Calendar(){
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(
        new Date(today.getFullYear(), today.getMonth(),1)
    );

    const [selectedDate, setSelectedDate] = useState(
        today.toISOString().split("T")[0]
    );

    const [eventTitle, setEventTitle] = useState("");
    const [events, setEvents] = useState([]);

    const monthName = currentMonth.toLocaleString("en-Za", {
        month : "long",
        year : "numeric",
    });

    const firstDay = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        1
    ).getDay();

    const daysInMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        0
    ).getDate();

    const changeMonth = (amount) => {
        setCurrentMonth(
            new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth() + amount,
                1
            )
        );
    };

    const addEvent = (e) => {
        e.preventDefault();

        if (eventTitle.trim() === "" || !selectedDate) {
            return;
        }

        const newEvent = {
            id: Date.now(),
            title: eventTitle.trim(),
            date: selectedDate,
        };

        setEvents((currentEvents) => [...currentEvents, newEvent]);
        setEventTitle("");
    };

    const deleteEvent = (id) => {
        setEvents((currentEvents) =>
            currentEvents.filter((event) => event.id !== id)
        );
    };

    const selectedEvents = events.filter(
        (event) => event.date === selectedDate
    );

    return (
        <>
            <Navigation />

            <main>
                <h1>Calendar</h1>
                <p>Keep track of your events and important dates.</p>

                <section>
                    <button
                        type="button"
                        onClick={() => changeMonth(-1)}
                    >
                        Previous
                    </button>

                    <h2>{monthName}</h2>

                    <button
                        type="button"
                        onClick={() => changeMonth(1)}
                    >
                        Next
                    </button>
                </section>

                <section>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(7, 1fr)",
                            gap: "8px",
                        }}
                    >
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                            (day) => (
                                <strong key={day}>{day}</strong>
                            )
                        )}

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

                                const dateString = [
                                    currentMonth.getFullYear(),
                                    String(currentMonth.getMonth() + 1).padStart(2, "0"),
                                    String(day).padStart(2, "0"),
                                ].join("-");

                                const hasEvents = events.some(
                                    (event) => event.date === dateString
                                );

                                return (
                                    <button
                                        key={dateString}
                                        type="button"
                                        onClick={() => setSelectedDate(dateString)}
                                        style={{
                                            minHeight: "50px",
                                            border:
                                                selectedDate === dateString
                                                    ? "2px solid #6b8e5a"
                                                    : "1px solid #ccc",
                                            borderRadius: "6px",
                                        }}
                                    >
                                        {day}
                                        {hasEvents && <span> •</span>}
                                    </button>
                                );
                            }
                        )}
                    </div>
                </section>

                <section>
                    <h2>Add an event</h2>

                    <form onSubmit={addEvent}>
                        <label htmlFor="eventTitle">Event title</label><br/>

                        <input
                            id="eventTitle"
                            type="text"
                            value={eventTitle}
                            onChange={(e) => setEventTitle(e.target.value)}
                            placeholder="e.g. Study for exam"
                            required
                        /><br/>

                        <label htmlFor="eventDate">Event date</label><br/>

                        <input
                            id="eventDate"
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            required
                        /><br/>

                        <button type="submit">Add Event</button>
                    </form>
                </section>

                <section>
                    <h2>
                        Events for {selectedDate}
                    </h2>

                    {selectedEvents.length === 0 ? (
                        <p>No events for this date.</p>
                    ) : (
                        <ul>
                            {selectedEvents.map((event) => (
                                <li key={event.id}>
                                    {event.title}{" "}
                                    <button
                                        type="button"
                                        onClick={() => deleteEvent(event.id)}
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

export default Calendar;