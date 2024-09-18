class Ash {
  routes = {};
  events = {};

  constructor(routes, events) {
    this.render = this.render.bind(this);

    this.routes = routes;
    this.events = events;

    this.render();

    window.onhashchange = () => {
      this.render();
    };
  }

  async render(id) {
    const { currentPath, paramsObject } = getUrlInformation();
    const tree = await this.routes[currentPath](emit);

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
    this.events[event](data);
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

module.exports = { Ash};