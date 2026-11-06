const DISCORD_USER_ID = "1111249680660181012";

exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=300",
  };

  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const token = process.env.DISCORD_BOT_TOKEN?.trim();
  if (!token) {
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({
        code: "missing_bot_token",
        error: "DISCORD_BOT_TOKEN is not available to this Netlify Function",
      }),
    };
  }

  try {
    const response = await fetch(
      `https://discord.com/api/v10/users/${DISCORD_USER_ID}`,
      { headers: { Authorization: `Bot ${token}` } },
    );

    if (!response.ok) {
      console.error(`Discord user lookup failed with HTTP ${response.status}`);
      const error =
        response.status === 401
          ? "Discord rejected the bot token"
          : response.status === 403
            ? "Discord denied access to the requested user"
            : response.status === 404
              ? "Discord could not find the requested user"
              : "Discord profile lookup failed";
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({
          code: `discord_http_${response.status}`,
          error,
        }),
      };
    }

    const user = await response.json();
    if (user.id !== DISCORD_USER_ID) {
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: "Discord returned an unexpected user" }),
      };
    }

    const avatarUrl = user.avatar
      ? `https://cdn.discordapp.com/avatars/${DISCORD_USER_ID}/${user.avatar}.${user.avatar.startsWith("a_") ? "gif" : "png"}?size=512`
      : `https://cdn.discordapp.com/embed/avatars/${Number((BigInt(DISCORD_USER_ID) >> 22n) % 6n)}.png`;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ avatarUrl }),
    };
  } catch (error) {
    console.error("Discord avatar request failed:", error);
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ error: "Failed to fetch Discord profile" }),
    };
  }
};
