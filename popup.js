document.addEventListener("DOMContentLoaded", () => {
  const likeInput = document.getElementById("likeCount");
  const commentInput = document.getElementById("commentCount");
  const startBtn = document.getElementById("startFeed");

  let isRunning = false;

  function checkInputs() {
    const hasLikeValue = likeInput.value.trim() !== "";
    const hasCommentValue = commentInput.value.trim() !== "";
    startBtn.disabled = isRunning || !hasLikeValue || !hasCommentValue;
  }

  likeInput.addEventListener("input", checkInputs);
  commentInput.addEventListener("input", checkInputs);

  startBtn.addEventListener("click", async () => {
    if (isRunning) return;

    isRunning = true;
    startBtn.disabled = true;
    startBtn.textContent = "Running...";

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab.url.includes('linkedin.com')) {
        alert('Please navigate to LinkedIn first!');
        return;
      }

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"],
      });

      chrome.tabs.sendMessage(tab.id, {
        action: "startInteraction",
        likeCount: parseInt(likeInput.value) || 0,
        commentCount: parseInt(commentInput.value) || 0,
      });

      setTimeout(() => {
        isRunning = false;
        startBtn.disabled = false;
        startBtn.textContent = "Start Feed Interaction";
        checkInputs();
      }, 30000);
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + error.message);
      isRunning = false;
      startBtn.disabled = false;
      startBtn.textContent = "Start Feed Interaction";
      checkInputs();
    }
  });

  checkInputs();
});
