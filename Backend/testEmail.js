require("dotenv").config();

const sendEmail = require("./utils/emailService");

const testEmail = async () => {
    try {
        await sendEmail(
            "rageemahb11@gmail.com",
            "FocusFlow Email Test",
            "<h1>FocusFlow</h1><p>Your email service is working!</p>"
        );

        console.log("Test email sent successfully!");
    } catch (error) {
        console.error("Test failed:", error.message);
    }
};

testEmail();