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
      console.log(this.cursor);
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
        console.log("tag: " + this.markup[this.cursor]);
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

export function parse(tokens: Token[]): Expression | null {
  const result: Expression | null = { type: TokenTypes, body: [] };

  let i = 0;
  while (i < tokens.length) {
    if (tokens[i].type === TokenTypes.NEW_LINE) {
      i++;
      continue;
    }

    if (tokens[i].type === TokenTypes.TAG) {
      const tagExpression = {
        type: ExpressionTypes.TAG,
        tagName: tokens[i].value,
        attributes: {} as any,
        body: "",
      };

      i++;

      if (tokens[i].type === TokenTypes.L_PAREN) {
        while (tokens[i].type !== TokenTypes.R_PAREN && i < tokens.length) {
          i++;
          if (tokens[i].type !== TokenTypes.WORD) {
            throw new Error("Expected attribute for tag");
          }

          const attributeName = tokens[i].value;

          i++;
          if (tokens[i].type !== TokenTypes.EQUAL) {
            throw new Error("Expected = after attribute name");
          }

          i++;
          if (tokens[i].type !== TokenTypes.STRING) {
            throw new Error("Expected attribute value after =");
          }

          const attributeValue = tokens[i].value;

          tagExpression.attributes[attributeName] = attributeValue;
        }
        i++;
      }

      if (tokens[i].type === TokenTypes.STRING) {
        tagExpression.body = tagExpression.body.concat(tokens[i].value);
        i++;
        continue;
      }
    }

    i++;
  }

  return result;
}
