const typeToHtmlContainer = {
  title: "div",
  text: "p",
  button: "button",
  list: "ul",
};

export class Ash {
  data = [];

  constructor(data) {
    this.data = data;
  }

  render() {
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
