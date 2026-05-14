const axios = require('axios');

async function testPublish() {
    try {
        console.log("Attempting to publish announcement...");
        const annRes = await axios.post('http://localhost:5000/api/announcements/add', {
            title: "Test Announcement",
            content: "This is a test content",
            category: "General",
            priority: "Medium"
        });
        console.log("Announcement Success:", annRes.status);

        console.log("Attempting to publish event...");
        const evtRes = await axios.post('http://localhost:5000/api/events/add', {
            title: "Test Event",
            description: "This is a test event",
            date: "2026-05-14",
            location: "Test Location",
            startTime: "10:00"
        });
        console.log("Event Success:", evtRes.status);
    } catch (err) {
        console.error("Test Failed:", err.response ? err.response.data : err.message);
    }
}

testPublish();
