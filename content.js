if (window.linkedinAutoLikerLoaded) {
  return;
}
window.linkedinAutoLikerLoaded = true;

let isRunning = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startInteraction" && !isRunning) {
    isRunning = true;
    const { likeCount, commentCount } = request;
    console.log("Received likeCount:", likeCount);
    console.log("Received commentCount:", commentCount);

    interactWithFeed(likeCount, commentCount).finally(() => {
      isRunning = false;
    });
    sendResponse({ success: true });
  }
});

async function interactWithFeed(likeCount, commentCount) {
  const predefinedComments = ["CFBR", "Congratulations", "Well said!", "Thanks for sharing!"];

  let liked = 0;
  let commented = 0;
  let processedPosts = new Set(); 
  let currentPostIndex = 0;

  console.log(`Starting interaction. Target: ${likeCount} likes, ${commentCount} comments`);

  while (liked < likeCount || commented < commentCount) {
    // Get all posts currently loaded in the DOM
    const posts = Array.from(document.querySelectorAll('div.feed-shared-update-v2'));
    console.log(`Found ${posts.length} posts loaded in DOM, processing from index ${currentPostIndex}`);
    
    let processedAnyPost = false;

    // Process posts starting from where we left off
    for (let i = currentPostIndex; i < posts.length; i++) {
      const post = posts[i];
      
      // Generate unique ID for this post
      const postId = post.getAttribute('data-urn') || post.getAttribute('data-id') || `post-${i}-${post.innerHTML.substring(0, 50)}`;
      
      if (processedPosts.has(postId)) {
        continue;
      }

      let postInteracted = false;


      post.scrollIntoView({ behavior: "smooth", block: "center" });
      await sleep(500);

      // Like
      if (liked < likeCount) {
        const likeBtn = post.querySelector('button[aria-label*="Like"]');
        if (likeBtn && likeBtn.getAttribute('aria-pressed') === 'false') {
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
        let commentBtn = post.querySelector('button[aria-label*="Comment"]') ||
                         post.querySelector('button[data-control-name="comment"]') ||
                         post.querySelector('button.comment-button') ||
                         post.querySelector('button.social-action-button[aria-label*="Comment"]');
      
        if (!commentBtn) {
          const buttons = post.querySelectorAll('button');
          for (const btn of buttons) {
            const spanText = btn.querySelector('span.artdeco-button__text');
            if (spanText && (spanText.textContent.includes('Comment') || 
                            spanText.textContent.includes('comment') ||
                            btn.innerHTML.includes('comment-icon'))) {
              commentBtn = btn;
              break;
            }
          }
        }

        if (commentBtn) {
          try {
            commentBtn.click();
            await sleep(1500);

            const commentBox = post.querySelector('[contenteditable="true"]') ||
                              post.querySelector('textarea[placeholder*="comment" i]') ||
                              post.querySelector('.ql-editor');
            
            if (commentBox) {
              const commentText = predefinedComments[Math.floor(Math.random() * predefinedComments.length)];

              commentBox.focus();
              await sleep(500);
              
              commentBox.value = commentText;
              commentBox.textContent = commentText;
              commentBox.innerText = commentText;
              
              commentBox.dispatchEvent(new Event('focus', { bubbles: true }));
              commentBox.dispatchEvent(new Event('input', { bubbles: true }));
              commentBox.dispatchEvent(new Event('change', { bubbles: true }));
              commentBox.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
              
              let submitBtn = null;
              let attempts = 0;
              const maxAttempts = 10;
              
              console.log("Waiting for submit button to become available...");
              
              while (!submitBtn && attempts < maxAttempts) {
                submitBtn = document.querySelector('.comments-comment-box button.comments-comment-box__submit-button--cr:not([disabled])') ||
                            document.querySelector('.comments-comment-box button.comments-comment-box__submit-button:not([disabled])') ||
                            document.querySelector('button.comments-comment-box__submit-button--cr:not([disabled])') ||
                            document.querySelector('button.comments-comment-box__submit-button:not([disabled])') ||
                            document.querySelector('button[class*="comments-comment-box__submit-button"]:not([disabled])') ||
                            document.querySelector('button.artdeco-button--primary[class*="comments-comment-box"]:not([disabled])') ||
                            post.querySelector('button.comments-comment-box__submit-button--cr:not([disabled])') ||
                            post.querySelector('button.comments-comment-box__submit-button:not([disabled])') ||
                            post.querySelector('button[class*="comments-comment-box__submit-button"]:not([disabled])');
                
                if (!submitBtn) {
                  const commentButtons = document.querySelectorAll('.comments-comment-box button:not([disabled])');
                  for (const btn of commentButtons) {
                    const buttonText = btn.querySelector('.artdeco-button__text');
                    if (buttonText && buttonText.textContent.trim() === 'Comment') {
                      submitBtn = btn;
                      break;
                    }
                  }
                }
                
                if (!submitBtn) {
                  await sleep(100);
                  attempts++;
                  
                  if (attempts % 10 === 0) {
                    console.log(`Attempt ${attempts}: Still searching for submit button...`);
                    const allSubmitButtons = document.querySelectorAll('.comments-comment-box button');
                    console.log(`Found ${allSubmitButtons.length} buttons in comment boxes`);
                    allSubmitButtons.forEach((btn, index) => {
                      console.log(`Button ${index}:`, {
                        className: btn.className,
                        disabled: btn.disabled,
                        textContent: btn.textContent.trim(),
                        id: btn.id
                      });
                    });
                  }
                }
              }

              if (submitBtn) {
                console.log(`✅ Found submit button after ${attempts * 100}ms`);
                console.log("Submit button details:", {
                  className: submitBtn.className,
                  disabled: submitBtn.disabled,
                  textContent: submitBtn.textContent.trim(),
                  id: submitBtn.id
                });
                
                submitBtn.click();
                commented++;
                postInteracted = true;
                console.log(`💬 Commented (${commented}/${commentCount}): "${commentText}"`);
                await sleep(randomDelay(2000, 3000));
              } else {
                console.warn(`⚠️ Submit button not found after ${maxAttempts * 100}ms`);

                const allButtons = document.querySelectorAll('.comments-comment-box button, button[class*="comment"]');
                console.log("All comment-related buttons found:", allButtons.length);
                allButtons.forEach((btn, index) => {
                  console.log(`Button ${index}:`, {
                    className: btn.className,
                    disabled: btn.disabled,
                    textContent: btn.textContent.trim(),
                    id: btn.id,
                    parentElement: btn.parentElement.className
                  });
                });
              }
            }
          } catch (err) {
            console.warn("❌ Comment failed:", err);
          }
        }
      }

      if (postInteracted) {
        processedPosts.add(postId);
        processedAnyPost = true;
      }

      currentPostIndex = i + 1;

      if (liked >= likeCount && commented >= commentCount) {
        console.log("✅ Targets reached!");
        return;
      }

      await sleep(randomDelay(500, 1000));
    }
    if (currentPostIndex >= posts.length) {
      console.log("Reached end of loaded posts, scrolling to load more...");
      const initialPostCount = posts.length;
    
      window.scrollTo(0, document.body.scrollHeight);
      await sleep(3000); 
      

      const newPosts = document.querySelectorAll('div.feed-shared-update-v2');
      if (newPosts.length === initialPostCount) {
        console.log("No more posts loaded, end of feed reached");
        break;
      } else {
        console.log(`Loaded ${newPosts.length - initialPostCount} more posts`);
      }
    }
  }

  console.log(`✅ Done: Liked ${liked}/${likeCount}, Commented ${commented}/${commentCount}`);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
