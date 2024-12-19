const htmlTags = new Set(["div", "p", "button", "a", "img"]);

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
        const isWord = this.tokens[this.cursor].type === TokenTypes.WORD;
        const isString = this.tokens[this.cursor].type === TokenTypes.STRING;
        if (!isWord && !isString) {
          throw new Error("Expected attribute value after =");
        }

        const funcName = this.tokens[this.cursor].value;

        this.cursor++;

        const isLParen = this.tokens[this.cursor].type === TokenTypes.L_PAREN;

        if (isString || (isWord && !isLParen)) {
          tagExpression.attributes[attributeName] = funcName;
          continue;
        }

        this.cursor++;
        const attributeValue = { name: "", arg: "" };

        if (this.tokens[this.cursor].type !== TokenTypes.WORD) {
          console.log(this.tokens[this.cursor]);
          throw new Error("Expect arg after (");
        }

        tagExpression.attributes[attributeName] = {
          type: ExpressionTypes.EVENT_FUNCTION,
          name: funcName,
          arg: this.tokens[this.cursor].value,
        };

        this.cursor++;
        if (this.tokens[this.cursor].type !== TokenTypes.R_PAREN) {
          throw new Error("Expected ) after function arg");
        }

        this.cursor++;
      }
    }

    return tagExpression;
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
          const anyValue = value as any
          jsonTag[key] = () => this.emit(anyValue.name, anyValue.arg)
        }
        else {
          jsonTag[key] = () => this.emit(value as string);
        }
      } else {
        jsonTag[key] = value as string;
      }
    }

    return jsonTag;
  }
}
