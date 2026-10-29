
import { useEffect, useState } from "react";
import Navigation from "../components/Navigation";

const STORAGE_KEY = "focusflow_calendar_events";

function Calendar() {
    const [events, setEvents] = useState(() => {
        try {
            const savedEvents = localStorage.getItem(STORAGE_KEY);
            return savedEvents ? JSON.parse(savedEvents) : [];
        } catch (error) {
            console.error("Could not load calendar events:", error);
            return [];
        }
    });

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [eventTitle, setEventTitle] = useState("");

    // Save events whenever they change
    useEffect(() => {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(events)
            );
        } catch (error) {
            console.error("Could not save calendar events:", error);
        }
    }, [events]);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthName = currentDate.toLocaleString("default", {
        month: "long",
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const changeMonth = (amount) => {
        setCurrentDate(new Date(year, month + amount, 1));
    };

    const addEvent = (event) => {
        event.preventDefault();

        const title = eventTitle.trim();

        if (!title || !selectedDate) return;

        const newEvent = {
            id: crypto.randomUUID(),
            title,
            date: selectedDate,
            createdAt: new Date().toISOString(),
        };

        setEvents((currentEvents) => [
            ...currentEvents,
            newEvent,
        ]);

        setEventTitle("");
    };

    const deleteEvent = (eventId) => {
        setEvents((currentEvents) =>
            currentEvents.filter((event) => event.id !== eventId)
        );
    };

    const getEventsForDate = (date) => {
        return events.filter((event) => event.date === date);
    };

    const selectDay = (day) => {
        const date = [
            year,
            String(month + 1).padStart(2, "0"),
            String(day).padStart(2, "0"),
        ].join("-");

        setSelectedDate(date);
    };

    const selectedEvents = getEventsForDate(selectedDate);

    return (
        <>
            <Navigation />

            <main>
                <h1>Calendar</h1>
                <p>Plan your deadlines and keep track of important dates.</p>

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
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                            (day) => (
                                <div key={day}>
                                    <strong>{day}</strong>
                                </div>
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

                    <form onSubmit={addEvent}>
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

                        <button type="submit">Add Event</button>
                    </form>

                    {selectedEvents.length === 0 ? (
                        <p>No events scheduled for this date.</p>
                    ) : (
                        selectedEvents.map((event) => (
                            <article key={event.id}>
                                <p>{event.title}</p>

                                <button
                                    type="button"
                                    onClick={() => deleteEvent(event.id)}
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
