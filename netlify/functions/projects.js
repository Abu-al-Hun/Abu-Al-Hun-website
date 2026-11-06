const projects = require("../../json/projects.json");

exports.handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=300",
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers,
      body: "",
    };
  }

  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const pathParts = event.path.split("/").filter(Boolean);
    const projectId = pathParts.length >= 4 ? pathParts[3] : null;

    if (projectId) {
      const project = projects.projects.find(
        (item) => String(item.id) === String(projectId)
      );

      if (!project) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: "Project not found" }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ...project,
          request_key: `/api/v2/projects/${project.id}`,
        }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(projects),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to load projects" }),
    };
  }
};