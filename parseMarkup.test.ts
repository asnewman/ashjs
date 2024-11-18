import { assertEquals } from "jsr:@std/assert";
import {
  Tokenizer,
  parse,
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

Deno.test.only("simple parse", () => {
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

  // const result = parse(tokens);
  //
  // 	assertEquals(result, {
  // 		type: ExpressionTypes.ROOT,
  // 		body: [
  // 			{
  // 				type: ExpressionTypes.TAG,
  // 				tagName: "div",
  // 				attributes: { class: "myClass" },
  // 				body: "What is up",
  // 			},
  // 		],
  // 	});
});
