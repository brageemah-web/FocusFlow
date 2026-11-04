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
    
    console.log("STREAK DEBUG", {
    lastActiveDate: user.lastActiveDate,
    type: typeof user.lastActiveDate,
    currentStreak: user.currentStreak,
    today: getLocalDate(),
});
    if (!user) throw new Error("User not found");

    
    const today = getLocalDate();
    const yesterday = getYesterday(today);

    const last = user.lastActiveDate
        ? getLocalDate(new Date(user.lastActiveDate))
        : null;

    if (last === today) return user;

    user.currentStreak =
        last === yesterday ? (user.currentStreak || 0) + 1 : 1;

    // Update longest streak
    user.longestStreak = Math.max(
        user.currentStreak,
        user.longestStreak || 0 
    );

    // Save today's activity date
    user.lastActiveDate = today;

    await user.save();

    return user;
};

module.exports = updateStreak;