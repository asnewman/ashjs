const htmlTags = new Set([
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
  "path",
]);

export enum TokenTypes {
  DASH,
  TAG,
  EQUAL,
  L_PAREN,
  R_PAREN,
  L_CURLY,
  R_CURLY,
  STRING,
  NEW_LINE,
  WORD,
  SPACE,
}

interface Token {
  type: TokenTypes;
  value: string;
}

export class Tokenizer {
  cursor = 0;
  markup = "";
  result: Token[] = [];
  inAttributes = false;

  constructor(markup: string) {
    this.markup = markup;
  }

  tokenize() {
    while (this.cursor < this.markup.length) {
      if (this.markup[this.cursor] === "-") {
        this.result.push({ type: TokenTypes.DASH, value: "-" });
        this.cursor++;
        continue;
      }

      if (this.markup[this.cursor] === "=") {
        this.result.push({ type: TokenTypes.EQUAL, value: "=" });
        this.cursor++;
        continue;
      }

      if (this.markup[this.cursor] === "(") {
        this.result.push({ type: TokenTypes.L_PAREN, value: "(" });
        this.cursor++;
        this.inAttributes = true;
        continue;
      }

      if (this.markup[this.cursor] === ")") {
        this.result.push({ type: TokenTypes.R_PAREN, value: ")" });
        this.cursor++;
        this.inAttributes = false;
        continue;
      }

      if (this.markup[this.cursor] === "{") {
        this.result.push({ type: TokenTypes.L_CURLY, value: "{" });
        this.cursor++;
        continue;
      }

      if (this.markup[this.cursor] === "}") {
        this.result.push({ type: TokenTypes.R_CURLY, value: "}" });
        this.cursor++;
        continue;
      }

      if (this.markup[this.cursor] === "\n") {
        this.result.push({ type: TokenTypes.NEW_LINE, value: "\n" });
        this.cursor++;
        continue;
      }

      if (this.markup[this.cursor] === " ") {
        this.result.push({ type: TokenTypes.SPACE, value: " " });
        this.cursor++;
        continue;
      }

      if (
        this.markup[this.cursor] === '"' ||
        this.markup[this.cursor] === "'"
      ) {
        this.tokenizeQuote();
        continue;
      }

      let wordArr: string[] = [];

      while (this.isNotWordSymbol()) {
        wordArr.push(this.markup[this.cursor]);
        this.cursor++;
      }

      let word = wordArr.join("");

      if (htmlTags.has(word) && !this.inAttributes) {
        const tokenizedHtmlTag = { type: TokenTypes.TAG, value: word };
        this.result.push(tokenizedHtmlTag);
        continue;
      } else {
        this.result.push({ type: TokenTypes.WORD, value: word });
        continue;
      }
    }
    return this.result;
  }

  tokenizeQuote() {
    const startingQuoteSymbol = this.markup[this.cursor];
    this.cursor++;
    const strArr: string[] = [];

    while (
      this.markup[this.cursor] !== startingQuoteSymbol &&
      this.cursor < this.markup.length
    ) {
      if (this.markup[this.cursor] === "/") {
        strArr.push(this.markup[this.cursor]);
        this.cursor++;
      }

      strArr.push(this.markup[this.cursor]);
      this.cursor++;
    }

    this.result.push({ type: TokenTypes.STRING, value: strArr.join("") });
    this.cursor++;
  }

  isNotWordSymbol() {
    return (
      this.markup[this.cursor] !== " " &&
      this.markup[this.cursor] !== "=" &&
      this.markup[this.cursor] !== "(" &&
      this.markup[this.cursor] !== ")" &&
      this.markup[this.cursor] !== "{" &&
      this.markup[this.cursor] !== "}" &&
      this.markup[this.cursor] !== "\n" &&
      this.cursor < this.markup.length
    );
  }
}

export enum ExpressionTypes {
  ROOT,
  LEVEL,
  TAG,
  STRING_LITERAL,
  EVENT_FUNCTION,
}

export type Expression = { type: ExpressionTypes } & any;

export class Parser {
  tokens: Token[] = [];
  cursor = 0;
  result: Expression = { type: ExpressionTypes.ROOT, body: [] as any[] };
  currDashLevel = 0;
  // This variable tracks last seen expressions for each dash level to know
  // where children should end up
  currLevels: Record<number, Expression> = {};
  // A stack tracking any active curly brackets
  activeCurly: number[] = [];

  constructor(tokens: Token[]) {
    const tokensNoSpaces = tokens.filter(
      (t) => t.type !== TokenTypes.SPACE && t.type !== TokenTypes.NEW_LINE,
    );
    this.tokens = tokensNoSpaces;
  }

  parse(): Expression {
    while (this.cursor < this.tokens.length) {
      if (this.tokens[this.cursor].type === TokenTypes.L_CURLY) {
        this.activeCurly.push(this.currDashLevel);
        this.cursor++;
        continue;
      }

      if (this.tokens[this.cursor].type === TokenTypes.R_CURLY) {
        this.activeCurly.pop();
        this.cursor++;
        continue;
      }

      if (this.tokens[this.cursor].type === TokenTypes.DASH) {
        this.currDashLevel = 0;

        if (this.activeCurly.length > 0) {
          this.currDashLevel = this.activeCurly[this.activeCurly.length - 1];
        }

        while (this.tokens[this.cursor].type === TokenTypes.DASH) {
          this.currDashLevel++;
          this.cursor++;
        }
        continue;
      }

      if (this.tokens[this.cursor].type === TokenTypes.TAG) {
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

      if (this.tokens[this.cursor].type === TokenTypes.STRING) {
        const newStringExpression: Expression = {
          type: ExpressionTypes.STRING_LITERAL,
          body: this.tokens[this.cursor].value,
        };
        this.currLevels[this.currDashLevel - 1].body.push(newStringExpression);
        this.cursor++;
      }

      else {
        console.log({tokens: this.tokens})
        throw new Error(`Unexpected token ${JSON.stringify(this.tokens[this.cursor])} (token # ${this.cursor})`)
      }
    }

    return this.result;
  }

  parseTag() {
    const tagExpression = {
      type: ExpressionTypes.TAG,
      tagName: this.tokens[this.cursor].value,
      attributes: {} as any,
      body: [] as any[],
    };

    this.cursor++;

    if (this.tokens[this.cursor].type === TokenTypes.L_PAREN) {
      this.cursor++;

      while (
        this.tokens[this.cursor].type !== TokenTypes.R_PAREN &&
        this.cursor < this.tokens.length
      ) {
        if (this.tokens[this.cursor].type !== TokenTypes.WORD) {
          throw new Error("Expected attribute for tag");
        }

        const attributeName = this.tokens[this.cursor].value;

        this.cursor++;
        if (this.tokens[this.cursor].type !== TokenTypes.EQUAL) {
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

    if (token.type === TokenTypes.STRING) {
      const value = token.value;
      if (value.includes("(") && value[value.length - 1] === ")") {
        const parts = value.split("(");
        return {
          type: ExpressionTypes.EVENT_FUNCTION,
          name: parts[0],
          arg: parts[1].replace(")", ""),
        };
      } else {
        return token.value;
      }
    }

    throw new Error(
      "On event function must be a string. Instead found " +
        JSON.stringify(token),
    );
  }
}

type Emit = (eventName: string, data?: any) => void;

export class Transformer {
  ast: Expression = { type: ExpressionTypes.ROOT, body: [] as any[] };
  cursor = 0;
  emit: Emit = (e: string, d?: any) => {};

  constructor(ast: Expression, emit: Emit) {
    this.ast = ast;
    this.emit = emit;
  }

  transform() {
    this.cursor = 0;
    const result: Object[] = [];

    // for now let's assume that there are no root level
    // string literals, so these are all tags
    while (this.cursor < this.ast.body.length) {
      result.push(this.transformTag(this.ast.body[this.cursor]));
      this.cursor++;
    }

    return result;
  }

  transformTag(tagExpression: Expression): Object {
    if (tagExpression.type !== ExpressionTypes.TAG) {
      throw new Error(
        "Expected tag expression, instead received: " + tagExpression.type,
      );
    }

    const jsonTag: Record<string, string | (() => void)> = {
      [tagExpression.tagName]: tagExpression.body.map((element: any) => {
        if (element.type === ExpressionTypes.TAG)
          return this.transformTag(element);

        if (element.type === ExpressionTypes.STRING_LITERAL)
          return element.body;
      }),
    };

    const onEventAttributes: Record<string, string>[] = [];

    for (const [key, value] of Object.entries(tagExpression.attributes)) {
      if (key.includes("on")) {
        if (typeof value === "object") {
          const anyValue = value as any;
          jsonTag[key] = () => this.emit(anyValue.name, anyValue.arg);
        } else {
          jsonTag[key] = () => this.emit(value as string);
        }
      } else {
        jsonTag[key] = value as string;
      }
    }

    return jsonTag;
  }
}
