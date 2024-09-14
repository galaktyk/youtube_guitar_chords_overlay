// background.js
let isEnable = true;

// Listener for messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getData") {
        sendResponse({ data: isEnable });
    } else if (message.action === "setData") {
        isEnable = message.newData;
        sendResponse({ success: true });
    }
    // Return true to indicate you want to send a response asynchronously
    return true;
});