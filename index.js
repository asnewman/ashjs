(() => {
  // getUrlInformation.js
  function getUrlInformation(definitions, url) {
    const currentPathWithSearch = "/" + (url.split("#")[1] || "");
    const path = currentPathWithSearch.split("?")[0] || "";
    const search = url.split("?")[1] || "";
    const searchParams = Object.fromEntries(new URLSearchParams(search));
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

  // main.js
  var Ash = class {
    routes = {};
    events = {};
    constructor(routes, events) {
      this.render = this.render.bind(this);
      this.emit = this.emit.bind(this);
      this.routes = routes;
      this.events = {
        ...events,
        go: (path) => {
          const removedSlash = path.startsWith("/") ? path.substring(1) : path;
          window.location.hash = `#${removedSlash}`;
        },
      };
      this.render();
      window.onhashchange = () => {
        this.render();
      };
    }
    async render(id) {
      const url = window.location.href;
      const urlInformation = getUrlInformation(Object.keys(this.routes), url);
      const route = urlInformation.matchedDefinition ?? urlInformation.path;
      const tree = await this.routes[route](this.emit, { urlInformation });
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
      const [tagName, contentOrChildren] = Object.entries(element)[0];
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
  };
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
})();
