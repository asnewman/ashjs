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

  // parseMarkup.ts
  var htmlTags = /* @__PURE__ */ new Set([
    "html",
    "head",
    "title",
    "base",
    "link",
    "meta",
    "style",
    "script",
    "noscript",
    "body",
    "section",
    "nav",
    "article",
    "aside",
    "header",
    "footer",
    "address",
    "main",
    "div",
    "p",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "ul",
    "ol",
    "li",
    "dl",
    "dt",
    "dd",
    "figure",
    "figcaption",
    "blockquote",
    "pre",
    "hr",
    "br",
    "a",
    "em",
    "strong",
    "small",
    "s",
    "cite",
    "q",
    "dfn",
    "abbr",
    "ruby",
    "rt",
    "rp",
    "code",
    "var",
    "samp",
    "kbd",
    "sub",
    "sup",
    "i",
    "b",
    "u",
    "mark",
    "bdi",
    "bdo",
    "span",
    "ins",
    "del",
    "img",
    "iframe",
    "embed",
    "object",
    "param",
    "video",
    "audio",
    "source",
    "track",
    "canvas",
    "map",
    "area",
    "svg",
    "math",
    "table",
    "caption",
    "colgroup",
    "col",
    "tbody",
    "thead",
    "tfoot",
    "tr",
    "td",
    "th",
    "form",
    "fieldset",
    "legend",
    "label",
    "input",
    "button",
    "select",
    "datalist",
    "optgroup",
    "option",
    "textarea",
    "keygen",
    "output",
    "progress",
    "meter",
    "details",
    "summary",
    "menu",
    "menuitem",
    "dialog",
    "script",
    "template",
    "slot",
    "g",
    "path"
  ]);
  var Tokenizer = class {
    cursor = 0;
    markup = "";
    result = [];
    inAttributes = false;
    constructor(markup) {
      this.markup = markup;
    }
    tokenize() {
      while (this.cursor < this.markup.length) {
        if (this.markup[this.cursor] === "-") {
          this.result.push({ type: 0 /* DASH */, value: "-" });
          this.cursor++;
          continue;
        }
        if (this.markup[this.cursor] === "=") {
          this.result.push({ type: 2 /* EQUAL */, value: "=" });
          this.cursor++;
          continue;
        }
        if (this.markup[this.cursor] === "(") {
          this.result.push({ type: 3 /* L_PAREN */, value: "(" });
          this.cursor++;
          this.inAttributes = true;
          continue;
        }
        if (this.markup[this.cursor] === ")") {
          this.result.push({ type: 4 /* R_PAREN */, value: ")" });
          this.cursor++;
          this.inAttributes = false;
          continue;
        }
        if (this.markup[this.cursor] === "{") {
          this.result.push({ type: 5 /* L_CURLY */, value: "{" });
          this.cursor++;
          continue;
        }
        if (this.markup[this.cursor] === "}") {
          this.result.push({ type: 6 /* R_CURLY */, value: "}" });
          this.cursor++;
          continue;
        }
        if (this.markup[this.cursor] === "\n") {
          this.result.push({ type: 8 /* NEW_LINE */, value: "\n" });
          this.cursor++;
          continue;
        }
        if (this.markup[this.cursor] === " ") {
          this.result.push({ type: 10 /* SPACE */, value: " " });
          this.cursor++;
          continue;
        }
        if (this.markup[this.cursor] === '"' || this.markup[this.cursor] === "'") {
          this.tokenizeQuote();
          continue;
        }
        let wordArr = [];
        while (this.isNotWordSymbol()) {
          wordArr.push(this.markup[this.cursor]);
          this.cursor++;
        }
        let word = wordArr.join("");
        if (htmlTags.has(word) && !this.inAttributes) {
          const tokenizedHtmlTag = { type: 1 /* TAG */, value: word };
          this.result.push(tokenizedHtmlTag);
          continue;
        } else {
          this.result.push({ type: 9 /* WORD */, value: word });
          continue;
        }
      }
      return this.result;
    }
    tokenizeQuote() {
      const startingQuoteSymbol = this.markup[this.cursor];
      this.cursor++;
      const strArr = [];
      while (this.markup[this.cursor] !== startingQuoteSymbol && this.cursor < this.markup.length) {
        if (this.markup[this.cursor] === "/") {
          strArr.push(this.markup[this.cursor]);
          this.cursor++;
        }
        strArr.push(this.markup[this.cursor]);
        this.cursor++;
      }
      this.result.push({ type: 7 /* STRING */, value: strArr.join("") });
      this.cursor++;
    }
    isNotWordSymbol() {
      return this.markup[this.cursor] !== " " && this.markup[this.cursor] !== "=" && this.markup[this.cursor] !== "(" && this.markup[this.cursor] !== ")" && this.markup[this.cursor] !== "{" && this.markup[this.cursor] !== "}" && this.markup[this.cursor] !== "\n" && this.cursor < this.markup.length;
    }
  };
  var Parser = class {
    tokens = [];
    cursor = 0;
    result = { type: 0 /* ROOT */, body: [] };
    currDashLevel = 0;
    // This variable tracks last seen expressions for each dash level to know
    // where children should end up
    currLevels = {};
    // A stack tracking any active curly brackets
    activeCurly = [];
    constructor(tokens) {
      const tokensNoSpaces = tokens.filter(
        (t) => t.type !== 10 /* SPACE */ && t.type !== 8 /* NEW_LINE */
      );
      this.tokens = tokensNoSpaces;
    }
    parse() {
      while (this.cursor < this.tokens.length) {
        if (this.tokens[this.cursor].type === 5 /* L_CURLY */) {
          this.activeCurly.push(this.currDashLevel);
          this.cursor++;
          continue;
        }
        if (this.tokens[this.cursor].type === 6 /* R_CURLY */) {
          this.activeCurly.pop();
          this.cursor++;
          continue;
        }
        if (this.tokens[this.cursor].type === 0 /* DASH */) {
          this.currDashLevel = 0;
          if (this.activeCurly.length > 0) {
            this.currDashLevel = this.activeCurly[this.activeCurly.length - 1];
          }
          while (this.tokens[this.cursor].type === 0 /* DASH */) {
            this.currDashLevel++;
            this.cursor++;
          }
          continue;
        }
        if (this.tokens[this.cursor].type === 1 /* TAG */) {
          const parsedTag = this.parseTag();
          this.currLevels[this.currDashLevel] = parsedTag;
          if (this.currDashLevel === 1) {
            this.result.body.push(parsedTag);
          } else {
            this.currLevels[this.currDashLevel - 1].body.push(parsedTag);
          }
          this.cursor++;
          continue;
        }
        if (this.tokens[this.cursor].type === 7 /* STRING */) {
          const newStringExpression = {
            type: 3 /* STRING_LITERAL */,
            body: this.tokens[this.cursor].value
          };
          this.currLevels[this.currDashLevel - 1].body.push(newStringExpression);
          this.cursor++;
        } else {
          console.log({ tokens: this.tokens });
          throw new Error(`Unexpected token ${JSON.stringify(this.tokens[this.cursor])} (token # ${this.cursor})`);
        }
      }
      return this.result;
    }
    parseTag() {
      const tagExpression = {
        type: 2 /* TAG */,
        tagName: this.tokens[this.cursor].value,
        attributes: {},
        body: []
      };
      this.cursor++;
      if (this.tokens[this.cursor].type === 3 /* L_PAREN */) {
        this.cursor++;
        while (this.tokens[this.cursor].type !== 4 /* R_PAREN */ && this.cursor < this.tokens.length) {
          if (this.tokens[this.cursor].type !== 9 /* WORD */) {
            throw new Error("Expected attribute for tag");
          }
          const attributeName = this.tokens[this.cursor].value;
          this.cursor++;
          if (this.tokens[this.cursor].type !== 2 /* EQUAL */) {
            throw new Error("Expected = after attribute name");
          }
          this.cursor++;
          tagExpression.attributes[attributeName] = this.parseAttributeValue();
        }
      }
      return tagExpression;
    }
    parseAttributeValue() {
      const token = this.tokens[this.cursor];
      this.cursor++;
      if (token.type === 7 /* STRING */) {
        const value = token.value;
        if (value.includes("(") && value[value.length - 1] === ")") {
          const parts = value.split("(");
          return {
            type: 4 /* EVENT_FUNCTION */,
            name: parts[0],
            arg: parts[1].replace(")", "")
          };
        } else {
          return token.value;
        }
      }
      throw new Error(
        "On event function must be a string. Instead found " + JSON.stringify(token)
      );
    }
  };
  var Transformer = class {
    ast = { type: 0 /* ROOT */, body: [] };
    cursor = 0;
    emit = (e, d) => {
    };
    constructor(ast, emit) {
      this.ast = ast;
      this.emit = emit;
    }
    transform() {
      this.cursor = 0;
      const result = [];
      while (this.cursor < this.ast.body.length) {
        result.push(this.transformTag(this.ast.body[this.cursor]));
        this.cursor++;
      }
      return result;
    }
    transformTag(tagExpression) {
      if (tagExpression.type !== 2 /* TAG */) {
        throw new Error(
          "Expected tag expression, instead received: " + tagExpression.type
        );
      }
      const jsonTag = {
        [tagExpression.tagName]: tagExpression.body.map((element) => {
          if (element.type === 2 /* TAG */)
            return this.transformTag(element);
          if (element.type === 3 /* STRING_LITERAL */)
            return element.body;
        })
      };
      const onEventAttributes = [];
      for (const [key, value] of Object.entries(tagExpression.attributes)) {
        if (key.includes("on")) {
          if (typeof value === "object") {
            const anyValue = value;
            jsonTag[key] = () => this.emit(anyValue.name, anyValue.arg);
          } else {
            jsonTag[key] = () => this.emit(value);
          }
        } else {
          jsonTag[key] = value;
        }
      }
      return jsonTag;
    }
  };

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
        go: (rawPath) => {
          const path = JSON.parse(rawPath);
          const removedSlash = path.startsWith("/") ? path.substring(1) : path;
          window.location.hash = `#${removedSlash}`;
        }
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
      const markup = await this.routes[route]({ urlInformation });
      const tree = convert(markup, this.emit);
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
  function convert(markup, emit) {
    const tokenizer = new Tokenizer(markup);
    const tokens = tokenizer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    const transformer = new Transformer(ast, emit);
    const result = transformer.transform();
    return result;
  }
  window.convert = convert;
  window.Ash = Ash;
})();
