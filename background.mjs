chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === 'SEND_TO_BACKEND') {
    try {
      const response = await fetch('http://localhost:3000/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message.data)
      });

      const result = await response.json();
      console.log('Profile saved:', result);
    } catch (error) {
      console.error('Failed to send profile:', error);
    }
  }
});
