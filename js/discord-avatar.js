(function () {
  "use strict";

  const discordUserId = "1111249680660181012";
  const fallbackAvatarIndex = Number((BigInt(discordUserId) >> 22n) % 6n);
  const fallbackAvatarUrl = `https://cdn.discordapp.com/embed/avatars/${fallbackAvatarIndex}.png`;
  window.discordAvatarFallbackUrl = fallbackAvatarUrl;

  async function loadDiscordAvatar() {
    const profileImage = document.getElementById("profile-img");

    if (profileImage) {
      profileImage.src = fallbackAvatarUrl;
    }

    try {
      const response = await fetch("/api/discord-avatar");
      const payload = await response.json();

      if (!response.ok) {
        const code = payload.code ? ` (${payload.code})` : "";
        throw new Error(
          `${payload.error || "Avatar endpoint failed"}${code}; HTTP ${response.status}`,
        );
      }

      if (typeof payload.avatarUrl !== "string") {
        throw new Error("Avatar endpoint returned an invalid response");
      }

      if (profileImage) {
        profileImage.src = payload.avatarUrl;
      }

      return payload.avatarUrl;
    } catch (error) {
      console.warn(
        "Could not load the Discord avatar; using the Discord default avatar instead. Check the server's DISCORD_BOT_TOKEN configuration.",
        error,
      );
      return fallbackAvatarUrl;
    }
  }

  window.discordAvatarReady = loadDiscordAvatar();
})();
