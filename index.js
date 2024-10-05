class Ash {
  routes = {};
  events = {};

  constructor(routes, events) {
    this.render = this.render.bind(this);
    this.emit = this.emit.bind(this);

    this.routes = routes;
    this.events = {
      ...events,
      go: (path) => {
        window.location.hash = `#${path}`;
      },
    };

    this.render();

    window.onhashchange = () => {
      this.render();
    };
  }

  async render(id) {
    const urlInformation = getUrlInformation();
    const tree = await this.routes[
      urlInformation.matchedDefinition ?? urlInformation.path
    ](this.emit, { urlInformation });

    if (id) {
      const newElement = findInTree(tree, id);
      if (newElement) {
        const node = this.createNode(newElement);
        if (node) {
          document.getElementById(id).replaceWith(node);
        }
      }

      return;
    }

    document.getElementById("ashjs").innerHTML = "";

    tree.forEach((element) => {
      const node = this.createNode(element);
      if (node) {
        document.getElementById("ashjs").appendChild(node);
      }
    });
  }

  emit(event, data) {
    console.debug("emit", event, data);
    this.events[event](data, this.render, this.emit);
  }

  createNode(element) {
    if (typeof element !== "object" || element === null) {
      return null;
    }

    // Get the tag name and its content or children
    const [tagName, contentOrChildren] = Object.entries(element)[0];

    // Create the DOM element for the tag
    const node = document.createElement(tagName);

    if (typeof contentOrChildren === "string") {
      node.textContent = contentOrChildren;
    } else if (Array.isArray(contentOrChildren)) {
      contentOrChildren.forEach((childElement) => {
        const childNode = this.createNode(childElement);
        if (childNode) {
          node.appendChild(childNode);
        }
      });
    }

    // Handle additional props (attributes or event listeners)
    for (const [key, value] of Object.entries(element)) {
      if (key !== tagName) {
        if (key.startsWith("on") && typeof value === "function") {
          node.addEventListener(key.substring(2).toLowerCase(), value);
        } else {
          node.setAttribute(key, value.toString());
        }
      }
    }

    return node;
  }
}

/**
 * ash.js helper functions
 */

function getUrlInformation(definitions, url) {
  // ash.js uses the hash part of the URL to identify the current page
  const currentPathWithSearch = "/" + url.split("#")[1] || "";
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

function findInTree(tree, id) {
  for (const element of tree) {
    if (element.id === id) {
      return element;
    }

    if (element.div && Array.isArray(element.div)) {
      const foundElement = findInTree(element.div, id);
      if (foundElement) {
        return foundElement;
      }
    }
  }

  return null;
}

window.Ash = Ash;

export { getUrlInformation };
