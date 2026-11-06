const http = require("http");
const fs = require("fs");
const path = require("path");

loadEnvironmentFile(path.join(__dirname, "..", ".env"));

const PORT = Number(process.env.PORT) || 3000;
const ROOT_DIR = path.join(__dirname, "..");
const discordAvatarHandler = require("../netlify/functions/discord-avatar").handler;

function loadEnvironmentFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const contents = fs.readFileSync(filePath, "utf8");
  for (const line of contents.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || match[1] in process.env) continue;

    const value = match[2].replace(/^(['"])(.*)\1$/, "$2");
    process.env[match[1]] = value;
  }
}

const MIME_TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".wav": "audio/wav",
  ".mp4": "video/mp4",
  ".woff": "application/font-woff",
  ".ttf": "application/font-ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".otf": "application/font-otf",
  ".wasm": "application/wasm",
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = req.url.split("?")[0];

  if (/^\/\.env(?:$|[./])/i.test(url)) {
    res.writeHead(404);
    res.end("Not Found");
    return;
  }

  if (url === "/api/v2/projects" || url === "/api/v2") {
    serveProjectsAPI(res);
    return;
  }

  if (url.startsWith("/api/v2/projects/")) {
    const projectId = decodeURIComponent(url.replace("/api/v2/projects/", ""));
    serveProjectById(res, projectId);
    return;
  }

  if (url === "/api/discord-avatar") {
    serveDiscordAvatar(res);
    return;
  }

  let filePath = path.join(ROOT_DIR, req.url);

  try {
    const decoded = decodeURIComponent(req.url);
    if (decoded && decoded !== req.url) {
      filePath = path.join(ROOT_DIR, decoded);
    }
  } catch (e) {
    filePath = path.join(ROOT_DIR, req.url);
  }

  if (url === "/" || url === "/index.html") {
    filePath = path.join(ROOT_DIR, "html", "index.html");
  }

  if (url === "/api.html") {
    filePath = path.join(ROOT_DIR, "html", "api.html");
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || "application/octet-stream";

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === "ENOENT") {
        const dir = path.dirname(filePath);
        const fileName = path.basename(filePath);

        fs.readdir(dir, (err, files) => {
          if (err) {
            res.writeHead(404, { "Content-Type": "text/html" });
            res.end(`<h1>404 - File Not Found</h1><p>Path: ${filePath}</p>`);
          } else {
            const foundFile = files.find(
              (f) =>
                f === fileName ||
                decodeURIComponent(req.url).includes(f)
            );
            if (foundFile) {
              fs.readFile(path.join(dir, foundFile), (err2, content2) => {
                if (err2) {
                  res.writeHead(404, { "Content-Type": "text/html" });
                  res.end(`<h1>404 - File Not Found</h1>`);
                } else {
                  res.writeHead(200, {
                    "Content-Type": contentType,
                    "Cache-Control": "no-cache",
                  });
                  res.end(content2);
                }
              });
            } else {
              res.writeHead(404, { "Content-Type": "text/html" });
              res.end(`<h1>404 - File Not Found</h1>`);
            }
          }
        });
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      res.writeHead(200, {
        "Content-Type": contentType,
        "Cache-Control": "no-cache",
      });
      res.end(content);
    }
  });
});

async function serveDiscordAvatar(res) {
  try {
    const result = await discordAvatarHandler({ httpMethod: "GET" });
    res.writeHead(result.statusCode, result.headers);
    res.end(result.body);
  } catch (error) {
    console.error("Failed to serve Discord avatar:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Failed to load Discord avatar" }));
  }
}

function serveProjectsAPI(res) {
  const projectsPath = path.join(ROOT_DIR, "json", "projects.json");

  fs.readFile(projectsPath, "utf-8", (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Failed to load projects" }));
      return;
    }

    try {
      const jsonData = JSON.parse(data);
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      });
      res.end(JSON.stringify(jsonData));
    } catch (parseErr) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid JSON format" }));
    }
  });
}

function serveProjectById(res, projectId) {
  const projectsPath = path.join(ROOT_DIR, "json", "projects.json");

  fs.readFile(projectsPath, "utf-8", (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Failed to load projects" }));
      return;
    }

    try {
      const jsonData = JSON.parse(data);
      const projects = jsonData.projects || [];
      const project = projects.find((p) => String(p.id) === projectId);

      if (!project) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Project not found" }));
        return;
      }

      res.writeHead(200, {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      });
      res.end(JSON.stringify({
        ...project,
        request_key: `/api/v2/projects/${project.id}`,
      }));
    } catch (parseErr) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid JSON format" }));
    }
  });
}

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`API endpoint: http://localhost:${PORT}/api/v2/projects/{id}`);
  console.log("Press Ctrl+C to stop the server");
});