const htmlTags = new Set(["div"]);

enum TokenTypes {
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

function tokenize(markup: string): Token[] {
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

const exampleMarkup = `
-div(class="container")
--p
---"This is my"
---a(href="www.example.com")"website"
---".Please visit it to learn more"
--button(onClick="clicked")"Click me"
`;

const result1 = tokenize(exampleMarkup);
console.log(result1);
