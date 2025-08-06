chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startInteraction") {
    const { likeCount, commentCount } = request;
    console.log("Received likeCount:", likeCount);
    console.log("Received commentCount:", commentCount);

    interactWithFeed(likeCount, commentCount);
    sendResponse({ success: true });
  }
});

async function interactWithFeed(likeCount, commentCount) {
  const posts = Array.from(document.querySelectorAll('div.feed-shared-update-v2'));
  const predefinedComments = ["CFBR", "Congratulations", "Well said!", "Thanks for sharing!"];

  let liked = 0;
  let commented = 0;
  let i = 0;

  console.log(`Starting interaction. Total posts on page: ${posts.length}`);

  while ((liked < likeCount || commented < commentCount) && i < posts.length) {
    const post = posts[i];
    let postInteracted = false;

    // Like
    if (liked < likeCount) {
      const likeBtn = post.querySelector('button[aria-label*="Like"]');
      if (likeBtn && likeBtn.getAttribute('aria-pressed') === 'false') {
        likeBtn.scrollIntoView({ behavior: "smooth", block: "center" });
        await sleep(800);
        try {
          likeBtn.click();
          liked++;
          postInteracted = true;
          console.log(`✅ Liked (${liked}/${likeCount})`);
          await sleep(randomDelay(1000, 2000));
        } catch (err) {
          console.warn("❌ Like failed:", err);
        }
      }
    }

    // Comment
    if (commented < commentCount) {
      const commentBtn = post.querySelector('button[aria-label*="Comment"]');
      if (commentBtn) {
        try {
          commentBtn.click();
          await sleep(1000);

          const commentBox = post.querySelector('[contenteditable="true"]');
          if (commentBox) {
            const commentText = predefinedComments[Math.floor(Math.random() * predefinedComments.length)];

            commentBox.focus();
            document.execCommand("insertText", false, commentText);
            commentBox.dispatchEvent(new InputEvent("input", { bubbles: true }));

            await sleep(500);

            const submitBtn = post.querySelector('button.comments-comment-box__submit-button:not([disabled])');
            if (submitBtn) {
              submitBtn.click();
              commented++;
              postInteracted = true;
              console.log(`💬 Commented (${commented}/${commentCount}): "${commentText}"`);
              await sleep(randomDelay(2000, 3000));
            } else {
              console.warn("⚠️ Submit button not found or disabled");
            }
          } else {
            console.warn("⚠️ Comment box not found");
          }
        } catch (err) {
          console.warn("❌ Comment failed:", err);
        }
      }
    }

    if (postInteracted) {
      await sleep(randomDelay(1000, 2000));
    }

    i++;
  }

  console.log(`✅ Done: Liked ${liked}/${likeCount}, Commented ${commented}/${commentCount}`);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
