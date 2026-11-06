(function () {
  "use strict";

  async function setDiscordFavicon() {
    const avatarUrl = await window.discordAvatarReady;
    const icon =
      document.querySelector("link[rel~='icon']") ||
      document.createElement("link");

    icon.rel = "icon";
    icon.type = avatarUrl.includes(".gif?") ? "image/gif" : "image/png";
    icon.href = avatarUrl;
    document.head.appendChild(icon);
  }

  setDiscordFavicon().catch((error) => {
    console.error("Failed to set the Discord favicon:", error);
  });
})();
