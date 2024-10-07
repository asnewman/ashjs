export function getUrlInformation(definitions, url) {
  // ash.js uses the hash part of the URL to identify the current page
  const currentPathWithSearch = "/" + (url.split("#")[1] || "");
  const path = currentPathWithSearch.split("?")[0] || "";
  const search = url.split("?")[1] || "";

  // Parse the search parameters
  const searchParams = Object.fromEntries(new URLSearchParams(search));

  // Parse the URL parameters
  let urlParams = {};

  let matchedDefinition = null;

  if (definitions) {
    const currentPathParts = path.split("/");

    for (const definition of definitions) {
      const parts = definition.split("/");

      if (parts.length !== currentPathParts.length) {
        continue;
      }

      const isMatch = parts.every((part, index) => {
        if (part.startsWith(":")) {
          urlParams[part.substring(1)] = currentPathParts[index];
          return true;
        }

        return part === currentPathParts[index];
      });

      if (isMatch) {
        matchedDefinition = definition;
        break;
      }
    }
  }

  return { path, searchParams, urlParams, matchedDefinition };
}
