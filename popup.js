document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const modeIcon = document.getElementById('modeIcon');
  const closeBtn = document.getElementById('closeBtn');
  const getTitleBtn = document.getElementById('getTitle');
  const loading = document.getElementById('loading');
  const titleDisplay = document.getElementById('titleDisplay');
  const titleText = document.getElementById('titleText');

  let isDark = false; 

  const updateTheme = () => {
    if (isDark) {
      body.classList.replace('light', 'dark');
      modeIcon.src = 'sun.png'; 
    } else {
      body.classList.replace('dark', 'light');
      modeIcon.src = 'moon.png'; 
    }
  };

  document.querySelector('.theme-toggle').addEventListener('click', () => {
    isDark = !isDark;
    updateTheme();
  });

  closeBtn.addEventListener('click', () => window.close());

  getTitleBtn.addEventListener('click', async () => {
    loading.classList.add('show');
    titleDisplay.classList.remove('show');
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    loading.classList.remove('show');
    titleText.textContent = tab?.title ?? 'Unable to get tab title';
    titleDisplay.classList.add('show');
  });
});
