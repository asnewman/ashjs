import { getUrlInformation } from "./getUrlInformation";
import { Tokenizer, Parser, Transformer } from "./parseMarkup";

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

    // Get the tag name and its content or children
    const [tagName, contentOrChildren] = Object.entries(element)[0];

    // Create the DOM element for the tag
    const node = document.createElement(tagName);

    if (typeof contentOrChildren === "string") {
      node.textContent = contentOrChildren;
    } else if (Array.isArray(contentOrChildren)) {
      contentOrChildren.forEach((childElement) => {
        if (typeof childElement === "string") {
          node.textContent += childElement;
          return;
        }

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

function convert(markup, emit) {
  const tokenizer = new Tokenizer(markup); 
  const tokens = tokenizer.tokenize()
  const parser = new Parser(tokens)
  const ast = parser.parse();
  const transformer = new Transformer(ast, emit)
  const result = transformer.transform();
  console.log({
    markup,
    result
  })
  return result
}

window.convert = convert;
window.Ash = Ash;
