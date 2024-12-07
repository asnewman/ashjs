import { assertEquals } from "jsr:@std/assert";
import {
  Tokenizer,
  Parser,
  ExpressionTypes,
  TokenTypes,
} from "./parseMarkup.ts";

const exampleMarkup = `
-div(class="container")
--p
---"This is my"
---a(href="www.example.com")"website"
---".Please visit it to learn more"
--button(onClick="clicked")"Click me"
`;

const expectedTokens = [
  { type: TokenTypes.NEW_LINE, value: "\n" },
  { type: TokenTypes.DASH, value: "-" },
  { type: TokenTypes.TAG, value: "div" },
  { type: TokenTypes.L_PAREN, value: "(" },
  { type: TokenTypes.WORD, value: "class" },
  { type: TokenTypes.EQUAL, value: "=" },
  { type: TokenTypes.STRING, value: "container" },
  { type: TokenTypes.R_PAREN, value: ")" },
  { type: TokenTypes.NEW_LINE, value: "\n" },
  { type: TokenTypes.DASH, value: "-" },
  { type: TokenTypes.DASH, value: "-" },
  { type: TokenTypes.TAG, value: "p" },
  { type: TokenTypes.NEW_LINE, value: "\n" },
  { type: TokenTypes.DASH, value: "-" },
  { type: TokenTypes.DASH, value: "-" },
  { type: TokenTypes.DASH, value: "-" },
  { type: TokenTypes.STRING, value: "This is my" },
  { type: TokenTypes.NEW_LINE, value: "\n" },
  { type: TokenTypes.DASH, value: "-" },
  { type: TokenTypes.DASH, value: "-" },
  { type: TokenTypes.DASH, value: "-" },
  { type: TokenTypes.TAG, value: "a" },
  { type: TokenTypes.L_PAREN, value: "(" },
  { type: TokenTypes.WORD, value: "href" },
  { type: TokenTypes.EQUAL, value: "=" },
  { type: TokenTypes.STRING, value: "www.example.com" },
  { type: TokenTypes.R_PAREN, value: ")" },
  { type: TokenTypes.STRING, value: "website" },
  { type: TokenTypes.NEW_LINE, value: "\n" },
  { type: TokenTypes.DASH, value: "-" },
  { type: TokenTypes.DASH, value: "-" },
  { type: TokenTypes.DASH, value: "-" },
  { type: TokenTypes.STRING, value: ".Please visit it to learn more" },
  { type: TokenTypes.NEW_LINE, value: "\n" },
  { type: TokenTypes.DASH, value: "-" },
  { type: TokenTypes.DASH, value: "-" },
  { type: TokenTypes.TAG, value: "button" },
  { type: TokenTypes.L_PAREN, value: "(" },
  { type: TokenTypes.WORD, value: "onClick" },
  { type: TokenTypes.EQUAL, value: "=" },
  { type: TokenTypes.STRING, value: "clicked" },
  { type: TokenTypes.R_PAREN, value: ")" },
  { type: TokenTypes.STRING, value: "Click me" },
  { type: TokenTypes.NEW_LINE, value: "\n" },
];

Deno.test("token test", () => {
  const tokenizer = new Tokenizer(exampleMarkup);
  const result = tokenizer.tokenize();
  assertEquals(result, expectedTokens);
});

Deno.test("simple parse", () => {
  const markup = `
-div(class="myClass")
--"What is up"
`;

  const tokenizer = new Tokenizer(markup);
  const tokens = tokenizer.tokenize();
  assertEquals(tokens, [
    { type: TokenTypes.NEW_LINE, value: "\n" },
    { type: TokenTypes.DASH, value: "-" },
    { type: TokenTypes.TAG, value: "div" },
    { type: TokenTypes.L_PAREN, value: "(" },
    { type: TokenTypes.WORD, value: "class" },
    { type: TokenTypes.EQUAL, value: "=" },
    { type: TokenTypes.STRING, value: "myClass" },
    { type: TokenTypes.R_PAREN, value: ")" },
    { type: TokenTypes.NEW_LINE, value: "\n" },
    { type: TokenTypes.DASH, value: "-" },
    { type: TokenTypes.DASH, value: "-" },
    { type: TokenTypes.STRING, value: "What is up" },
    { type: TokenTypes.NEW_LINE, value: "\n" },
  ]);

  const parser = new Parser(tokens);
  const result = parser.parse();

  assertEquals(result, {
    type: ExpressionTypes.ROOT,
    body: [
      {
        type: ExpressionTypes.TAG,
        tagName: "div",
        attributes: { class: "myClass" },
        body: [{ type: ExpressionTypes.STRING_LITERAL, body: "What is up"}],
      },
    ],
  });
});

Deno.test("multiple attribute parse", () => {
  const markup = `
-div(class="myClass" id="myDiv")
--"What is up"
`;

  const tokenizer = new Tokenizer(markup);
  const tokens = tokenizer.tokenize();
  assertEquals(tokens, [
    { type: TokenTypes.NEW_LINE, value: "\n" },
    { type: TokenTypes.DASH, value: "-" },
    { type: TokenTypes.TAG, value: "div" },
    { type: TokenTypes.L_PAREN, value: "(" },
    { type: TokenTypes.WORD, value: "class" },
    { type: TokenTypes.EQUAL, value: "=" },
    { type: TokenTypes.STRING, value: "myClass" },
    { type: TokenTypes.SPACE, value: " " },
    { type: TokenTypes.WORD, value: "id" },
    { type: TokenTypes.EQUAL, value: "=" },
    { type: TokenTypes.STRING, value: "myDiv" },
    { type: TokenTypes.R_PAREN, value: ")" },
    { type: TokenTypes.NEW_LINE, value: "\n" },
    { type: TokenTypes.DASH, value: "-" },
    { type: TokenTypes.DASH, value: "-" },
    { type: TokenTypes.STRING, value: "What is up" },
    { type: TokenTypes.NEW_LINE, value: "\n" },
  ]);

  const parser = new Parser(tokens);
  const result = parser.parse();

  assertEquals(result, {
    type: ExpressionTypes.ROOT,
    body: [
      {
        type: ExpressionTypes.TAG,
        tagName: "div",
        attributes: { class: "myClass", id: "myDiv" },
        body: [{ type: ExpressionTypes.STRING_LITERAL, body: "What is up"}],
      },
    ],
  });
});

Deno.test("multiple tags and multiple body", () => {
  const markup = `
-div(class="myClass" id="myDiv")
--"What is up"
--"My name is Ash"
-div(class="anotherClass")
`;

  const tokenizer = new Tokenizer(markup);
  const tokens = tokenizer.tokenize();

  const parser = new Parser(tokens);
  const result = parser.parse();

  assertEquals(result, {
    type: ExpressionTypes.ROOT,
    body: [
      {
        type: ExpressionTypes.TAG,
        tagName: "div",
        attributes: { class: "myClass", id: "myDiv" },
        body: [{ type: ExpressionTypes.STRING_LITERAL, body: "What is up"}, { type: ExpressionTypes.STRING_LITERAL, body: "My name is Ash"}],
      },
      {
        type: ExpressionTypes.TAG,
        tagName: "div",
        attributes: { class: "anotherClass" },
        body: [],
      },
    ],
  });
});

Deno.test("nested tags", () => {
  const markup = `
-div(class="myClass" id="myDiv")
--"I'm not nested"
--div(class="anotherClass")
---"I'm nested"
`;
  const tokenizer = new Tokenizer(markup);
  const tokens = tokenizer.tokenize();

  const parser = new Parser(tokens);
  const result = parser.parse();

  assertEquals(result, {
    type: ExpressionTypes.ROOT,
    body: [
      {
        type: ExpressionTypes.TAG,
        tagName: "div",
        attributes: { class: "myClass", id: "myDiv" },
        body: [
          { type: ExpressionTypes.STRING_LITERAL, body: "I'm not nested"},
          {
            type: ExpressionTypes.TAG,
            tagName: "div",
            attributes: { class: "anotherClass" },
            body: [{ type: ExpressionTypes.STRING_LITERAL, body: "I'm nested"}],
          },
        ],
      },
    ],
  });
})

Deno.test("parses events", () => {
  const markup = `
-div(class="myClass" id="myDiv" onclick="myeventname")
--"hello world"
`;
  
  const tokenizer = new Tokenizer(markup);
  const tokens = tokenizer.tokenize();

  const parser = new Parser(tokens);
  const result = parser.parse();

  assertEquals(result, {
    type: ExpressionTypes.ROOT,
    body: [
      {
        type: ExpressionTypes.TAG,
        tagName: "div",
        attributes: { class: "myClass", id: "myDiv", onclick: "myeventname" },
        body: [
          { type: ExpressionTypes.STRING_LITERAL, body: "hello world" },
        ],
      },
    ],
  });
})
