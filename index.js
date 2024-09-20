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
    const { currentPath, paramsObject } = getUrlInformation();
    const tree = await this.routes[currentPath](this.emit);

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
    this.events[event](data, this.render);
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
function extractPath(hash) {
  // Check if the string is not empty and starts with a hash
  if (hash && hash.startsWith("#")) {
    // Split the string at the question mark
    const parts = hash.split("?");

    // The first part of the array will contain everything before the '?'
    // Remove the '#' and return the result
    return parts[0].substring(1);
  }
  return ""; // Return an empty string if the conditions are not met
}

function getUrlInformation() {
  let hash = window.location.hash;
  const currentPath = extractPath(hash);
  let queryString = window.location.hash;
  let searchParams = new URLSearchParams(
    queryString.substring(1).replace(currentPath, "")
  );
  let paramsObject = {};

  for (let [key, value] of searchParams) {
    paramsObject[key] = value;
  }

  return { currentPath, paramsObject };
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

module.exports = { Ash };
