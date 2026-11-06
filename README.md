# Hany Samir Portfolio

A modern personal portfolio website for Hany Samir, built with vanilla HTML, CSS, and JavaScript. The site includes multilingual support, dark and light themes, animated sections, project cards, social links, and a public project API.

## Features

- Responsive portfolio layout for desktop and mobile.
- English as the default language.
- Additional languages: Arabic, French, Italian, and Turkish.
- Right-to-left layout support for Arabic.
- Dark and light theme toggle.
- Animated hero section and project cards.
- Scrollbar-free scrolling with scroll-aware motion, adaptive background particles, and iPhone safe-area support.
- Language dictionaries split into per-language files and loaded on demand.
- Discord profile avatar loaded server-side with a bot token, with a Discord default avatar fallback.
- Project data loaded through the local API.
- Dedicated Project API Access page at `/api.html`.
- Netlify Functions support for production deployment.

## Requirements

- Node.js 18 or newer
- npm

## Local Development

Install the project dependencies:

```bash
npm install
```

Start the local server:

```bash
npm start
```

For the Discord profile image, copy `.env.example` to `.env` and set
`DISCORD_BOT_TOKEN` to your bot token. Keep `.env` private and never commit or
share the token. On Netlify, set `DISCORD_BOT_TOKEN` in the site's environment
variables instead.

The website will be available at:

```text
http://localhost:3000/
```

The development command is also available:

```bash
npm run dev
```

To use another port in PowerShell:

```powershell
$env:PORT=3010; npm start
```

## Pages

- `/` or `/index.html` - Main portfolio page
- `/api.html` - Project API Access page
- `/html/api.html` - Direct path to the API page

## API v2

The API uses version `v2`.

### Get all projects

```http
GET /api/v2/projects
```

Example:

```bash
curl http://localhost:3000/api/v2/projects
```

### Get one project by ID

```http
GET /api/v2/projects/{projectId}
```

Example:

```bash
curl http://localhost:3000/api/v2/projects/1354011147
```

The response includes the project data and its request key:

```json
{
  "id": 1354011147,
  "name": "Trap-Room",
  "request_key": "/api/v2/projects/1354011147"
}
```

If the project ID does not exist, the API returns `404 Project not found`.

### JavaScript example

```javascript
fetch("http://localhost:3000/api/v2/projects/1354011147")
  .then((response) => response.json())
  .then((project) => {
    console.log(project.name);
  });
```

### Python example

```python
import requests

response = requests.get(
    "http://localhost:3000/api/v2/projects/1354011147"
)
project = response.json()
print(project["name"])
```

## Project Structure

```text
.
├── css/
│   └── style.css
├── html/
│   ├── index.html
│   └── api.html
├── images/
│   └── hany.png (legacy; not used for the profile or favicon)
├── js/
│   ├── animations.js
│   ├── api-page.js
│   ├── api.js
│   ├── discord-avatar.js
│   ├── favicon.js
│   ├── i18n.js
│   ├── locales/
│   │   ├── ar.js
│   │   ├── en.js
│   │   ├── fr.js
│   │   ├── it.js
│   │   └── tr.js
│   ├── main.js
│   ├── name-changer.js
│   ├── particles.js
│   ├── projects.js
│   └── server.js
├── json/
│   └── projects.json
├── netlify/
│   └── functions/
│       ├── projects.js
│       └── discord-avatar.js
├── .env.example
├── .gitignore
├── netlify.toml
├── package.json
└── README.md
```

## Deployment

This project is configured for Netlify:

- Static files are published from the project root.
- Netlify Functions are located in `netlify/functions`.
- API requests are redirected to the `projects` Netlify Function.
- The SPA fallback redirects unknown routes to `html/index.html`.

Deploy the project using the Netlify dashboard or Netlify CLI. Make sure the project root contains `netlify.toml` before deploying.

## External Profiles

- npm: https://www.npmjs.com/~hanysamir
- GitHub: https://github.com/Abu-al-Hun
- Instagram: https://instagram.com/abualhun.2001
- Facebook: https://facebook.com/abualhun
- WhatsApp: https://wa.me/@abualhun/
- Discord: https://discord.com/users/1111249680660181012
- Email: info@abualhoun.com, support@abualhoun.com

The Discord avatar is retrieved server-side through the bot API. The bot token
must remain in the server's environment and must never be exposed to browser code.
For local development, create `.env` from `.env.example`; for Netlify, set the
token in the site's environment-variable settings.
