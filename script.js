const avatarBtn = document.getElementById("avatarBtn");
const dropdownMenu = document.getElementById("dropdownMenu");
const loginLink = document.getElementById("loginLink");
const logoutLink = document.getElementById("logoutLink");
const avatarIcon = document.getElementById("avatarIcon");
const menuToggle = document.getElementById("menuToggle");
const sideMenu = document.getElementById("sideMenu");
const overlay = document.getElementById("overlay");
const menuLoginLink = document.getElementById("menuLoginLink");
const loadingSpinner = document.getElementById("loadingSpinner");
const errorToast = document.getElementById("errorToast");

const profileInfo = document.getElementById("profileInfo");
const profileAvatar = document.getElementById("profileAvatar");
const profileUsername = document.getElementById("profileUsername");
const profileId = document.getElementById("profileId");

const darkModeSwitch = document.getElementById("darkModeSwitch");
const discordWidgetIframe = document.querySelector('iframe[src*="discord.com/widget"]');

// お知らせバナー要素
const notificationBanner = document.getElementById("notification-banner");

// カーソルエフェクトを有効にするかどうかのフラグ
const enableCursorSparkle = false;
// 背景浮き上がり文房具アイコンエフェクトを有効にするかどうかのフラグ
const enableFloatingBungu = false;
// 浮き上がる文房具の絵文字リスト (設定は維持)
const bunguEmojis = ['✏️', '📏', '✒️', '💧', '📄', '✂️', '📎'];
// アイコン生成の間隔 (ミリ秒) (設定は維持)
const bunguSpawnInterval = 1500;

// ====================================================================
// お知らせ設定
// ここを変更することで、お知らせの内容を手軽に更新できます
const notificationData = {
  enabled: false,
  title: "新イベント開催！詳細はこちら！",
  buttonText: "イベントページへ",
  buttonLink: "https://example.com/new-event",
  // closeable: true // (オプション) ユーザーが閉じられるかどうか
};
// ====================================================================


function showError(message) {
  errorToast.textContent = message;
  errorToast.classList.add("show");
  setTimeout(() => {
    errorToast.classList.remove("show");
  }, 4000);
}

menuToggle.addEventListener("click", () => {
  menuToggle.classList.toggle("open");
  sideMenu.classList.toggle("open");
  overlay.classList.toggle("show");
  const isOpen = menuToggle.classList.contains("open");
  menuToggle.setAttribute("aria-expanded", isOpen);
  sideMenu.setAttribute("aria-hidden", "false"); // メニューが開いたらaria-hiddenをfalseに
  if (isOpen) {
    sideMenu.focus();
  }
});

overlay.addEventListener("click", (event) => {
  menuToggle.classList.remove("open");
  sideMenu.classList.remove("open");
  overlay.classList.remove("show");
  menuToggle.setAttribute("aria-expanded", "false");
  sideMenu.setAttribute("aria-hidden", "true"); // メニューが閉じたらaria-hiddenをtrueに
});

avatarBtn.addEventListener("click", (event) => {
  event.stopPropagation(); // イベントの伝播を停止
  const isDropdownOpen = dropdownMenu.style.display === "block";
  dropdownMenu.style.display = isDropdownOpen ? "none" : "block";
  avatarBtn.setAttribute("aria-expanded", !isDropdownOpen);
});

document.addEventListener("click", (event) => {
  const isClickInside = avatarBtn.contains(event.target) || dropdownMenu.contains(event.target);

  if (dropdownMenu.style.display === "block" && !isClickInside) {
    dropdownMenu.style.display = "none";
    avatarBtn.setAttribute("aria-expanded", "false");
  }
});

function loginWithDiscord() {
  const clientId = "1388483034935984211";
  const redirectUri = encodeURIComponent(location.origin + location.pathname);
  const scope = encodeURIComponent("identify");
  const url = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;
  window.location.href = url;
}

loginLink.addEventListener("click", e => { 
  e.preventDefault(); 
  loginWithDiscord(); 
});
if (menuLoginLink) {
  menuLoginLink.addEventListener("click", e => { 
    e.preventDefault(); 
    loginWithDiscord(); 
  });
}

logoutLink.addEventListener("click", e => {
  e.preventDefault();
  localStorage.removeItem("discord_token");
  location.reload();
});

// お知らせバナーを生成する関数
function createNotificationBanner() {
  if (!notificationData.enabled || !notificationBanner) {
    notificationBanner.style.display = 'none';
    // バナーが非表示の場合はヘッダーとサイドメニューのtopをリセット
    const headerElement = document.querySelector('header');
    const sideMenuElement = document.getElementById('sideMenu');
    
    document.body.style.paddingTop = `var(--header-height)`;
    if (headerElement) {
      headerElement.style.top = `0px`;
    }
    if (sideMenuElement) {
      sideMenuElement.style.top = `var(--header-height)`;
      sideMenuElement.style.height = `calc(100vh - var(--header-height))`;
    }
    return;
  }

  notificationBanner.innerHTML = `
    <span class="notification-title">${notificationData.title}</span>
    <a href="${notificationData.buttonLink}" class="notification-button" target="_blank" rel="noopener noreferrer">${notificationData.buttonText}</a>
    <button class="notification-close-btn" aria-label="お知らせを閉じる">&times;</button>
  `;
  notificationBanner.style.display = 'flex';

  const closeBtn = notificationBanner.querySelector(".notification-close-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      notificationBanner.style.display = 'none';
      // バナーが閉じられたら、body, ヘッダー, サイドメニューのtopをリセット
      const headerElement = document.querySelector('header');
      const sideMenuElement = document.getElementById('sideMenu');

      document.body.style.paddingTop = `var(--header-height)`;
      if (headerElement) {
          headerElement.style.top = `0px`;
      }
      if (sideMenuElement) {
        sideMenuElement.style.top = `var(--header-height)`;
        sideMenuElement.style.height = `calc(100vh - var(--header-height))`;
      }
    });
  }

  // バナーの高さに基づいてbody, ヘッダー, サイドメニューのtopを調整
  // レイアウトの計算後に実行するため、setTimeoutを使用
  setTimeout(() => {
    const bannerHeight = notificationBanner.offsetHeight;
    const headerElement = document.querySelector('header');
    const sideMenuElement = document.getElementById('sideMenu');

    // CSS変数から --header-height の値を取得し数値に変換
    const headerHeightCss = getComputedStyle(document.documentElement).getPropertyValue('--header-height');
    const headerHeight = parseFloat(headerHeightCss);

    // bodyのpadding-topを設定
    document.body.style.paddingTop = `${headerHeight + bannerHeight}px`;

    // ヘッダーのtop位置を設定
    if (headerElement) {
        headerElement.style.top = `${bannerHeight}px`;
    }
    
    // サイドメニューのtop位置と高さを設定
    if (sideMenuElement) {
      const newSideMenuTop = headerHeight + bannerHeight;
      sideMenuElement.style.top = `${newSideMenuTop}px`;
      sideMenuElement.style.height = `calc(100vh - ${newSideMenuTop}px)`;
    }

  }, 0);
}


document.addEventListener("DOMContentLoaded", () => {
  const hash = window.location.hash;
  if (hash.includes("access_token")) {
    const params = new URLSearchParams(hash.substring(1));
    const token = params.get("access_token");
    localStorage.setItem("discord_token", token);
    history.replaceState(null, null, location.pathname);
    fetchUserData(token);
  } else {
    const token = localStorage.getItem("discord_token");
    if (token) fetchUserData(token);
  }

  // お知らせバナーの生成を呼び出す
  createNotificationBanner();

  // カーソル追従キラキラエフェクトのロジック
  if (enableCursorSparkle) {
    document.addEventListener("mousemove", (e) => {
      const sparkle = document.createElement("div");
      sparkle.className = "sparkle";
      document.body.appendChild(sparkle);

      sparkle.style.left = `${e.clientX}px`;
      sparkle.style.top = `${e.clientY}px`;

      sparkle.addEventListener('animationend', () => {
        sparkle.remove();
      });
    });
  }

  // 背景浮き上がり文房具アイコンのロジック
  if (enableFloatingBungu) {
    setInterval(() => {
      const bungu = document.createElement("div");
      bungu.className = "floating-bungu";
      
      const randomEmoji = bunguEmojis[Math.floor(Math.random() * bunguEmojis.length)];
      bungu.textContent = randomEmoji;

      document.body.appendChild(bungu);

      const startX = Math.random() * window.innerWidth;
      const startY = window.innerHeight;

      bungu.style.left = `${startX}px`;
      bungu.style.top = `${startY}px`;

      bungu.addEventListener('animationend', () => {
        bungu.remove();
      });
    }, bunguSpawnInterval);
  }

  // ダークモード切り替え機能
  if (darkModeSwitch) {
    // ウィジェットのテーマを更新する関数
    const updateWidgetTheme = (isDarkMode) => {
      if (discordWidgetIframe) {
        let src = discordWidgetIframe.src;
        src = src.replace(/&theme=(light|dark)/, '');
        const newTheme = isDarkMode ? 'dark' : 'light';
        discordWidgetIframe.src = `${src}&theme=${newTheme}`;
      }
    };

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-mode');
      darkModeSwitch.checked = true;
      updateWidgetTheme(true);
    } else {
      document.body.classList.remove('dark-mode');
      darkModeSwitch.checked = false;
      updateWidgetTheme(false);
    }

    darkModeSwitch.addEventListener('change', () => {
      const isDarkMode = darkModeSwitch.checked;
      if (isDarkMode) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
      } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
      }
      updateWidgetTheme(isDarkMode);
    });
  }
});

function fetchUserData(token) {
  avatarIcon.style.display = "none";
  loadingSpinner.style.display = "block";

  fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(res => {
    if (!res.ok) {
      if (res.status === 401) {
        return Promise.reject("認証トークンが無効です。再度ログインしてください。");
      }
      return Promise.reject(`Discord APIエラー: ${res.status}`);
    }
    return res.json();
  })
  .then(data => {
    const displayName = data.global_name || data.username;
    const usernameWithTag = data.discriminator === "0" ? `@${data.username}` : `@${data.username}#${data.discriminator}`;
    
    const avatarUrl = data.avatar
      ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png`
      : `https://cdn.discordapp.com/embed/avatars/${parseInt(data.id.slice(-1)) % 5}.png`;
    
    avatarIcon.src = avatarUrl;
    avatarIcon.alt = `${displayName}のアバター`;

    if (profileInfo && profileAvatar && profileUsername && profileId) {
        profileAvatar.src = avatarUrl;
        profileAvatar.alt = `${displayName}のプロフィールアバター`;
        profileUsername.textContent = displayName;
        profileId.textContent = usernameWithTag;
        profileInfo.style.display = "flex";
    }

    loginLink.style.display = "none";
    logoutLink.style.display = "block";
    if (menuLoginLink) {
      menuLoginLink.style.display = "none";
    }
  })
  .catch(err => {
    console.error("ユーザーデータの取得中にエラーが発生しました:", err);
    localStorage.removeItem("discord_token");

    const errorMessage = typeof err === 'string' ? err : "ユーザーデータの取得に失敗しました。";
    showError(errorMessage);

    avatarIcon.src = "https://cdn.discordapp.com/embed/avatars/1.png";
    avatarIcon.alt = "ログインアイコン";

    if (profileInfo && profileAvatar && profileUsername && profileId) {
        profileInfo.style.display = "none";
        profileAvatar.src = "";
        profileUsername.textContent = "";
        profileId.textContent = "";
    }

    loginLink.style.display = "block";
    logoutLink.style.display = "none";
    if (menuLoginLink) {
      menuLoginLink.style.display = "block";
    }
  })
  .finally(() => {
    loadingSpinner.style.display = "none";
    avatarIcon.style.display = "block";
  });
}