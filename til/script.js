import { Ash } from "../modules/ash.js";

const tils = [
  "TIL that honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible.",
  "TIL that the shortest war in history was between Britain and Zanzibar on August 27, 1896. Zanzibar surrendered after just 38 minutes.",
  "TIL that octopuses have three hearts. Two pump blood to the gills, while the third pumps it to the rest of the body.",
  "TIL that Finland offers a 'baby box' to all expectant mothers. The box contains baby essentials and can also be used as a bed, contributing to Finland's low infant mortality rates.",
  "TIL that the inventor of the Frisbee was cremated and made into Frisbees after he died. This was in accordance with his wishes.",
];

const comments = [
  {
    parent: "1",
    by: "Ash",
    text: "Wow this is a great fact",
    datetime: 1701134030,
  },
  {
    parent: "1",
    by: "Bob",
    text: "I never knew this",
    datetime: 1701134031,
  },
];

const generateTil = (til, id) => ({
  div: [
    { p: til, class: "text-2xl" },
    {
      div: [
        { p: "- Ash", class: "italic text-slate-500" },
        ,
        {
          a: "Comments",
          class: "text-blue-700",
          href: `/til/index.html#/post?id=${id}`,
        },
        { span: "3 hours ago" },
      ],
      class: "flex justify-between",
    },
  ],
  class: " mt-2 mb-8 mx-auto max-w-[50rem]",
});

const generateComment = (comment) => {
  return {
    div: [
      { p: comment.text },
      { p: `- ${comment.by}`, class: "italic text-slate-500" },
    ],
    class: "my-2 rounded-md bg-white p-4",
  };
};

let showNewTilInput = false;

const routes = {
  "": (render) => {
    return [
      {
        div: [
          {
            h1: "TIL",
            class: "text-6xl text-center",
          },
          {
            p: "Submit new TIL",
            class: "text-md text-blue-700 text-center mt-2 cursor-pointer",
            onclick: () => {
              showNewTilInput = true;
              render();
            },
          },
          showNewTilInput
            ? {
                div: [
                  {
                    p: "If your TIL gets through the moderation process, it will be published within 24 hours.",
                    class: "mb-2 text-center",
                  },
                  {
                    input: "",
                    id: "by-box",
                    type: "text",
                    placeholder: "Your name",
                    class:
                      "p-2 w-full rounded-lg border-gray-200 border-solid border-2 align-top shadow-sm sm:text-sm mb-2",
                  },
                  {
                    textarea: "",
                    id: "til-box",
                    class:
                      "p-2 w-full rounded-lg border-gray-200 border-solid border-2 align-top shadow-sm sm:text-sm",
                    rows: 4,
                    value: "TIL that ",
                  },
                  {
                    button: "Post",
                    onclick: () => {
                      const comment =
                        document.getElementById("comment-box").value;
                      comments.push({
                        parent: id,
                        by:
                          document.getElementById("by-box").value ||
                          "Anonymous",
                        text: comment,
                        datetime: Date.now(),
                      });
                      render();
                    },
                    class:
                      "mt-2 inline-block rounded border border-indigo-600 bg-indigo-600 px-12 py-3 text-sm font-medium text-white hover:bg-transparent hover:text-indigo-600 focus:outline-none focus:ring active:text-indigo-500",
                  },
                ],
                class: "max-w-[50rem] mx-auto my-3",
              }
            : { p: "" },
          ...tils.map((til, index) => generateTil(til, index)),
        ],
        class: "bg-indigo-50 h-screen",
      },
    ];
  },
  "/post": (render, { id }) => {
    const markupForComments = [
      ...comments
        .filter((comment) => comment.parent === id)
        .map((comment) => generateComment(comment)),
    ];

    return [
      {
        div: [
          {
            a: "TIL",
            class: "text-6xl text-center block",
            href: `/til/index.html`,
          },
          {
            div: [
              {
                p: tils[id],
                class: "text-2xl",
              },
              {
                div: markupForComments.length
                  ? markupForComments
                  : "No comments yet...",
                class: "my-5",
              },
              {
                div: [
                  { p: "Write a comment", class: "p-1 text-lg" },
                  {
                    input: "",
                    id: "by-box",
                    type: "text",
                    placeholder: "Your name",
                    class:
                      "p-2 w-full rounded-lg border-gray-200 border-solid border-2 align-top shadow-sm sm:text-sm mb-2",
                  },
                  {
                    textarea: "",
                    id: "comment-box",
                    class:
                      "p-2 w-full rounded-lg border-gray-200 border-solid border-2 align-top shadow-sm sm:text-sm",
                    rows: 4,
                    placeholder: "Type something...",
                  },
                  {
                    button: "Post",
                    onclick: () => {
                      const comment =
                        document.getElementById("comment-box").value;
                      comments.push({
                        parent: id,
                        by:
                          document.getElementById("by-box").value ||
                          "Anonymous",
                        text: comment,
                        datetime: Date.now(),
                      });
                      render();
                    },
                    class:
                      "mt-2 inline-block rounded border border-indigo-600 bg-indigo-600 px-12 py-3 text-sm font-medium text-white hover:bg-transparent hover:text-indigo-600 focus:outline-none focus:ring active:text-indigo-500",
                  },
                ],
              },
            ],
            class: "mt-10 mx-auto max-w-[50rem]",
          },
        ],
        class: "bg-indigo-50 h-screen",
      },
    ];
  },
};

const ash = new Ash(routes);
