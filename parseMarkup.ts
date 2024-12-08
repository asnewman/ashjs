const htmlTags = new Set(["div", "p", "button", "a"]);

export enum TokenTypes {
  DASH,
  TAG,
  EQUAL,
  L_PAREN,
  R_PAREN,
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
        continue;
      }

      if (this.markup[this.cursor] === ")") {
        this.result.push({ type: TokenTypes.R_PAREN, value: ")" });
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

      if (this.markup[this.cursor] === '"') {
        this.tokenizeQuote();
        continue;
      }

      let wordArr: string[] = [];

      while (this.isNotSymbol()) {
        wordArr.push(this.markup[this.cursor]);
        this.cursor++;
      }

      let word = wordArr.join("");

      if (htmlTags.has(word)) {
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
    this.cursor++;
    const strArr: string[] = [];

    while (
      this.markup[this.cursor] !== '"' &&
      this.cursor < this.markup.length
    ) {
      strArr.push(this.markup[this.cursor]);
      this.cursor++;
    }

    this.result.push({ type: TokenTypes.STRING, value: strArr.join("") });
    this.cursor++;
  }

  isNotSymbol() {
    return (
      this.markup[this.cursor] !== " " &&
      this.markup[this.cursor] !== "-" &&
      this.markup[this.cursor] !== "=" &&
      this.markup[this.cursor] !== "(" &&
      this.markup[this.cursor] !== ")" &&
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
}

export type Expression = { type: ExpressionTypes } & any;

export class Parser {
  tokens: Token[] = [];
  cursor = 0;
  result: Expression = { type: ExpressionTypes.ROOT, body: [] as any[] };
  currDashLevel = 0;

  constructor(tokens: Token[]) {
    const tokensNoSpaces = tokens.filter(
      (t) => t.type !== TokenTypes.SPACE && t.type !== TokenTypes.NEW_LINE,
    );
    this.tokens = tokensNoSpaces;
  }

  parse(): Expression {
    while (this.cursor < this.tokens.length) {
      if (this.tokens[this.cursor].type === TokenTypes.DASH) {
        this.currDashLevel = 0;
        while (this.tokens[this.cursor].type === TokenTypes.DASH) {
          this.currDashLevel++;
          this.cursor++;
        }
      }

      if (this.tokens[this.cursor].type === TokenTypes.SPACE) {
        this.cursor++;
        continue;
      }

      if (this.tokens[this.cursor].type === TokenTypes.TAG) {
        this.result.body.push(this.parseTag());
      }

      this.cursor++;
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
        if (this.tokens[this.cursor].type !== TokenTypes.STRING) {
          throw new Error("Expected attribute value after =");
        }

        const attributeValue = this.tokens[this.cursor].value;

        tagExpression.attributes[attributeName] = attributeValue;
        this.cursor++;
      }
    }

    this.cursor++; // should be R_PAREN

    const childDashLevel = this.currDashLevel + 1;

    // Go through all children
    while (true) {
      let lookAheadCursor = this.cursor;
      this.currDashLevel = 0;

      while (
        this.tokens[lookAheadCursor] &&
        this.tokens[lookAheadCursor].type === TokenTypes.DASH
      ) {
        this.currDashLevel++;
        lookAheadCursor++;
      }

      if (childDashLevel !== this.currDashLevel) break;

      // Calculate dashes to see if it belongs in the body
      let dashesCnt = 0;
      while (
        this.cursor < this.tokens.length &&
        this.tokens[this.cursor].type === TokenTypes.DASH
      ) {
        dashesCnt++;
        this.cursor++;
      }

      if (this.cursor >= this.tokens.length) continue;

      if (this.tokens[this.cursor].type === TokenTypes.STRING) {
        const newStringExpression: Expression = {
          type: ExpressionTypes.STRING_LITERAL,
          body: this.tokens[this.cursor].value,
        };
        tagExpression.body.push(newStringExpression);
        this.cursor++;
      } else if (this.tokens[this.cursor].type === TokenTypes.TAG) {
        tagExpression.body.push(this.parseTag());
        this.cursor++;
      }
    }

    return tagExpression;
  }
}

export class Transformer {
  ast: Expression = { type: ExpressionTypes.ROOT, body: [] as any[] };
  cursor = 0;

  constructor(ast) {
    this.ast = ast;
  }

  transform() {
    this.cursor = 0;
    const result: Object[] = [];

    // for now let's assume that there are no root level
    // string literals, so these are all tags
    while (this.cursor < this.ast.body) {
      result.push(this.transformTag());
      this.cursor++;
    }
  }

  transformTag() {
    const tagExpression = ast.body[this.cursor];

    if (tagExpression.type !== ExpressionTypes.TAG) {
      throw new Error(
        "Expected tag expression, instead received: " + this.tagExpression.type,
      );
    }

    const jsonTag = {
      [tagExpression.tagName]: tagExpression.body.map((element) => {
        if (element.type === ExpressionTypes.TAG) return transformTag();
      }),
    };
  }
}
