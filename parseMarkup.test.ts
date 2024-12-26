import { assertEquals } from "jsr:@std/assert";
import {
  Tokenizer,
  Parser,
  ExpressionTypes,
  TokenTypes,
  Transformer,
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
        body: [{ type: ExpressionTypes.STRING_LITERAL, body: "What is up" }],
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
        body: [{ type: ExpressionTypes.STRING_LITERAL, body: "What is up" }],
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
        body: [
          { type: ExpressionTypes.STRING_LITERAL, body: "What is up" },
          { type: ExpressionTypes.STRING_LITERAL, body: "My name is Ash" },
        ],
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
          { type: ExpressionTypes.STRING_LITERAL, body: "I'm not nested" },
          {
            type: ExpressionTypes.TAG,
            tagName: "div",
            attributes: { class: "anotherClass" },
            body: [
              { type: ExpressionTypes.STRING_LITERAL, body: "I'm nested" },
            ],
          },
        ],
      },
    ],
  });
});

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
        body: [{ type: ExpressionTypes.STRING_LITERAL, body: "hello world" }],
      },
    ],
  });
});

Deno.test("transform basic", () => {
  const expression = {
    type: ExpressionTypes.ROOT,
    body: [
      {
        type: ExpressionTypes.TAG,
        tagName: "div",
        attributes: { class: "myClass", id: "myDiv" },
        body: [{ type: ExpressionTypes.STRING_LITERAL, body: "hello world" }],
      },
    ],
  };

  const transformer = new Transformer(expression, (e: string) => {});
  const result = transformer.transform();

  assertEquals(result, [
    {
      div: ["hello world"],
      class: "myClass",
      id: "myDiv",
    },
  ]);
});

Deno.test("transform nested", () => {
  const expression = {
    type: ExpressionTypes.ROOT,
    body: [
      {
        type: ExpressionTypes.TAG,
        tagName: "div",
        attributes: { class: "myClass", id: "myDiv", onclick: "myeventname" },
        body: [
          { type: ExpressionTypes.STRING_LITERAL, body: "hello world" },
          {
            type: ExpressionTypes.TAG,
            tagName: "div",
            attributes: {
              class: "myNestedClass",
              id: "myNestedDiv",
              onclick: "mynestedeventname",
            },
            body: [{ type: ExpressionTypes.STRING_LITERAL, body: "good bye" }],
          },
        ],
      },
    ],
  };

  const fakeEmit = (e: string) => {
    console.log(`Event emitted: ${e}`);
  };

  const transformer = new Transformer(expression, fakeEmit);
  const result = transformer.transform() as any;

  // Expected result
  const expected = [
    {
      div: [
        "hello world",
        {
          div: ["good bye"],
          class: "myNestedClass",
          id: "myNestedDiv",
          onclick: () => fakeEmit("mynestedeventname"),
        },
      ],
      class: "myClass",
      id: "myDiv",
      onclick: () => fakeEmit("myeventname"),
    },
  ];

  assertEquals(typeof result[0].div[1].onclick, "function");

  assertEquals(typeof result[0].onclick, "function");
});

Deno.test("counter example", () => {
  const markup = `
    -div(id="wrapper")
    --div(id="count")
    ---"Current count: 0"
    --button(onclick="increaseCount")
    ---"Increase count"
  `;
  const tokenizer = new Tokenizer(markup);
  const tokens = tokenizer.tokenize();
  const parser = new Parser(tokens);
  const ast = parser.parse();
  const transformer = new Transformer(ast, (s: string) => {});
  const result = transformer.transform() as any;

  assertEquals(result.length, 1);
  assertEquals(result[0].div.length, 2);
  assertEquals(result[0].div[1].button.length, 1);
  assertEquals(result[0].div[1].button[0], "Increase count");
});

Deno.test("pass in data to event", () => {
  const markup = `
-div(id="wrapper")
--div(id="count")
---"Current count: 0"
--button(onclick='increaseCount("2")')
---"Increase count by two"
`;
  const tokenizer = new Tokenizer(markup);
  const tokens = tokenizer.tokenize();
  assertEquals(tokens, [
    { type: TokenTypes.NEW_LINE, value: "\n" },
    { type: TokenTypes.DASH, value: "-" },
    { type: TokenTypes.TAG, value: "div" },
    { type: TokenTypes.L_PAREN, value: "(" },
    { type: TokenTypes.WORD, value: "id" },
    { type: TokenTypes.EQUAL, value: "=" },
    { type: TokenTypes.STRING, value: "wrapper" },
    { type: TokenTypes.R_PAREN, value: ")" },
    { type: TokenTypes.NEW_LINE, value: "\n" },
    { type: TokenTypes.DASH, value: "-" },
    { type: TokenTypes.DASH, value: "-" },
    { type: TokenTypes.TAG, value: "div" },
    { type: TokenTypes.L_PAREN, value: "(" },
    { type: TokenTypes.WORD, value: "id" },
    { type: TokenTypes.EQUAL, value: "=" },
    { type: TokenTypes.STRING, value: "count" },
    { type: TokenTypes.R_PAREN, value: ")" },
    { type: TokenTypes.NEW_LINE, value: "\n" },
    { type: TokenTypes.DASH, value: "-" },
    { type: TokenTypes.DASH, value: "-" },
    { type: TokenTypes.DASH, value: "-" },
    { type: TokenTypes.STRING, value: "Current count: 0" },
    { type: TokenTypes.NEW_LINE, value: "\n" },
    { type: TokenTypes.DASH, value: "-" },
    { type: TokenTypes.DASH, value: "-" },
    { type: TokenTypes.TAG, value: "button" },
    { type: TokenTypes.L_PAREN, value: "(" },
    { type: TokenTypes.WORD, value: "onclick" },
    { type: TokenTypes.EQUAL, value: "=" },
    { type: TokenTypes.STRING, value: 'increaseCount("2")' },
    { type: TokenTypes.R_PAREN, value: ")" },
    { type: TokenTypes.NEW_LINE, value: "\n" },
    { type: TokenTypes.DASH, value: "-" },
    { type: TokenTypes.DASH, value: "-" },
    { type: TokenTypes.DASH, value: "-" },
    { type: TokenTypes.STRING, value: "Increase count by two" },
    { type: TokenTypes.NEW_LINE, value: "\n" },
  ]);

  const parser = new Parser(tokens);
  const ast = parser.parse();

  const expectedAst = {
    type: ExpressionTypes.ROOT,
    body: [
      {
        type: ExpressionTypes.TAG,
        tagName: "div",
        attributes: { id: "wrapper" },
        body: [
          {
            type: ExpressionTypes.TAG,
            tagName: "div",
            attributes: {
              id: "count",
            },
            body: [
              {
                type: ExpressionTypes.STRING_LITERAL,
                body: "Current count: 0",
              },
            ],
          },
          {
            type: ExpressionTypes.TAG,
            tagName: "button",
            attributes: {
              onclick: {
                type: ExpressionTypes.EVENT_FUNCTION,
                name: "increaseCount",
                arg: '"2"',
              },
            },
            body: [
              {
                type: ExpressionTypes.STRING_LITERAL,
                body: "Increase count by two",
              },
            ],
          },
        ],
      },
    ],
  };

  assertEquals(ast, expectedAst);

  const transformer = new Transformer(ast, (s: string) => {});
  const result = transformer.transform() as any;

  assertEquals(result.length, 1);
  assertEquals(result[0].div.length, 2);
  assertEquals(result[0].div[1].button.length, 1);
  assertEquals(result[0].div[1].button[0], "Increase count by two");
});

Deno.test("String into event", () => {
  const markup = `
    -div()
    --button(onclick='foo("hi")')
    ---"Foo"
  `;
  const tokenizer = new Tokenizer(markup);
  const tokens = tokenizer.tokenize();
  const parser = new Parser(tokens);
  const ast = parser.parse();
  const transformer = new Transformer(ast, (s: string) => {});
  const result = transformer.transform() as any;

  assertEquals(result.length, 1);
  assertEquals(result[0].div.length, 1);
  assertEquals(result[0].div[0].button.length, 1);
  assertEquals(result[0].div[0].button[0], "Foo");
});

Deno.test("Nesting marker", () => {
  function genButton() {
    return `
      -button()
      --"I am a button"
    `;
  }

  function genButtonWrapper() {
    return `
      -div(id="wrapper")
      {${genButton()}}
    `;
  }

  const markup = `
    -div(id="root")
    {${genButtonWrapper()}}
  `;

  const tokenizer = new Tokenizer(markup);
  const tokens = tokenizer.tokenize();
  const parser = new Parser(tokens);
  const ast = parser.parse();
  assertEquals(ast, {
    type: ExpressionTypes.ROOT,
    body: [
      {
        type: ExpressionTypes.TAG,
        attributes: {
          id: "root",
        },
        tagName: "div",
        body: [
          {
            type: ExpressionTypes.TAG,
            tagName: "div",
            attributes: {
              id: "wrapper",
            },
            body: [
              {
                type: ExpressionTypes.TAG,
                tagName: "button",
                attributes: {},
                body: [
                  {
                    type: ExpressionTypes.STRING_LITERAL,
                    body: "I am a button",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  });
});
