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
    by: "Ash",
    text: "Wow this is a great fact",
    datetime: 1701134030,
  },
  {
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
        { span: "By Ash" },
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
  class: "mt-10 mx-auto max-w-[50rem]",
});

const generateComment = (comment) => {
  console.log(comment);
  return {
    div: [
      { p: comment.text },
      { p: `- ${comment.by}`, class: "italic text-slate-500" },
    ],
    class: "my-2 rounded-md bg-white p-4",
  };
};

const routes = {
  "": () => {
    return [
      {
        h1: "TIL",
        class: "text-6xl text-center",
      },
      ...tils.map((til, index) => generateTil(til, index)),
    ];
  },
  "/post": (render, { id }) => {
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
                div: [...comments.map((comment) => generateComment(comment))],
                class: "my-5",
              },
              {
                div: [
                  {
                    textarea: "",
                    id: "comment-box",
                    class:
                      "p-2 w-full rounded-lg border-gray-200 border-solid border-2 align-top shadow-sm sm:text-sm",
                    rows: 4,
                    placeholder: "Write a comment...",
                  },
                  {
                    button: "Post",
                    onclick: () => {
                      const comment = document.getElementById("comment-box");
                      comments.push({
                        by: "Ash",
                        text: comment,
                        datetime: Date.now(),
                      });
                      console.log(comments);
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
