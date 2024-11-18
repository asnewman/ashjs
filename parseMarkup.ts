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

      if (this.markup[this.cursor] === '"') {
        this.tokenizeQuote();
        continue;
      }

      let wordArr: string[] = [];

      while (this.isSymbol()) {
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

  isSymbol() {
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

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): Expression {
    while (this.cursor < this.tokens.length) {
      if (this.tokens[this.cursor].type === TokenTypes.NEW_LINE) {
        this.cursor++;
        continue;
      }

      if (this.tokens[this.cursor].type === TokenTypes.TAG) {
        const tagExpression = {
          type: ExpressionTypes.TAG,
          tagName: this.tokens[this.cursor].value,
          attributes: {} as any,
          body: "",
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

        if (this.tokens[this.cursor].type === TokenTypes.NEW_LINE) {
          this.cursor++;
        }

        // Calculate dashes to see if it belongs in the body
        let dashesCnt = 0;
        while (
          this.tokens[this.cursor].type === TokenTypes.DASH &&
          this.cursor < this.tokens.length
        ) {
          dashesCnt++;
          this.cursor++;
        }

        // TODO check current dashes level
        if (this.tokens[this.cursor].type === TokenTypes.STRING) {
          tagExpression.body = tagExpression.body.concat(
            this.tokens[this.cursor].value,
          );
          this.cursor++;
        }

        this.result.body.push(tagExpression);
      }

      this.cursor++;
    }

    return this.result;
  }
}
