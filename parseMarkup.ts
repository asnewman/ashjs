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

export function tokenize(markup: string): Token[] {
  let i = 0;
  const result: Token[] = [];

  while (i < markup.length) {
    if (markup[i] === "-") {
      result.push({ type: TokenTypes.DASH, value: "-" });
      i++;
      continue;
    }

    if (markup[i] === "=") {
      result.push({ type: TokenTypes.EQUAL, value: "=" });
      i++;
      continue;
    }

    if (markup[i] === "(") {
      result.push({ type: TokenTypes.L_PAREN, value: "(" });
      i++;
      continue;
    }

    if (markup[i] === ")") {
      result.push({ type: TokenTypes.R_PAREN, value: ")" });
      i++;
      continue;
    }

    if (markup[i] === "\n") {
      result.push({ type: TokenTypes.NEW_LINE, value: "\n" });
      i++;
      continue;
    }

    if (markup[i] === '"') {
      i++;
      const strArr: string[] = [];

      while (markup[i] !== '"' && i < markup.length) {
        strArr.push(markup[i]);
        i++;
      }

      result.push({ type: TokenTypes.STRING, value: strArr.join("") });
      i++;
      continue;
    }

    let wordArr: string[] = [];

    while (
      markup[i] !== " " &&
      markup[i] !== "-" &&
      markup[i] !== "=" &&
      markup[i] !== "(" &&
      markup[i] !== ")" &&
      markup[i] !== "\n" &&
      i < markup.length
    ) {
      wordArr.push(markup[i]);
      i++;
    }

    let word = wordArr.join("");

    if (htmlTags.has(word)) {
      const tokenizedHtmlTag = { type: TokenTypes.TAG, value: word };
      result.push(tokenizedHtmlTag);
      continue;
    } else {
      result.push({ type: TokenTypes.WORD, value: word });
      continue;
    }

    // throw new Error("Unrecognized token " + markup[i] + " on character " + i);
  }

  return result;
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
    console.log(tokens[i].value);
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
          console.log(tokens[i].value);
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
