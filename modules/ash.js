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

export class Ash {
  data = [];
  routes = {};

  constructor(routes) {
    this.render = this.render.bind(this);

    this.routes = routes;

    this.render();

    window.onhashchange = () => {
      this.render();
    };
  }

  render() {
    const { currentPath, paramsObject } = getUrlInformation();
    this.data = this.routes[currentPath](this.render, paramsObject);

    document.getElementById("ashjs").innerHTML = "";

    this.data.forEach((element) => {
      const node = this.createNode(element);
      if (node) {
        document.getElementById("ashjs").appendChild(node);
      }
    });
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

  update(replacements) {
    for (const [id, updateProps] of Object.entries(replacements)) {
      this.updateNodeData(this.data, id, updateProps);
    }
    // Re-render the view after updating data
    this.render();
  }

  updateNodeData(data, id, updateProps) {
    for (const item of data) {
      for (const [tagName, contentOrChildren] of Object.entries(item)) {
        if (item.id === id) {
          Object.assign(item, updateProps);
        }
        if (Array.isArray(contentOrChildren)) {
          this.updateNodeData(contentOrChildren, id, updateProps);
        }
      }
    }
  }
}
