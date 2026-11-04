const User = require("../models/User");

const getLocalDate = (date = new Date()) => {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Africa/Johannesburg",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(date);
};

// Calculate yesterday using the South African calendar date
const getYesterday = (today) => {
    const [year, month, day] = today.split("-").map(Number);

    const yesterdayDate = new Date(
        Date.UTC(year, month - 1, day - 1)
    );

    return yesterdayDate.toISOString().slice(0, 10);
};

const updateStreak = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    const today = getLocalDate();
    const yesterday = getYesterday(today);

    // Already logged in today
    if (user.lastActiveDate === today) {
        return user;
    }

    // Consecutive login
    if (user.lastActiveDate === yesterday) {
        user.currentStreak += 1;
    } else {
        // First login or missed day
        user.currentStreak = 1;
    }

    // Update longest streak
    user.longestStreak = Math.max(
        user.currentStreak,
        user.longestStreak
    );

    // Save today's activity date
    user.lastActiveDate = today;

    await user.save();

    return user;
};

module.exports = updateStreak;