import { Ash } from "../modules/ash.js";
const { createClient } = supabase;

const s = createClient('https://lhjukjfrbjipxrpezkuy.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoanVramZyYmppcHhycGV6a3V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDI3NjE1NzcsImV4cCI6MjAxODMzNzU3N30.9txcN8AsNBCvQm7naJ4sPQfDO7V7EqOnHoS1mUhWV-E')

// const tils = [
//   "TIL that honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible.",
//   "TIL that the shortest war in history was between Britain and Zanzibar on August 27, 1896. Zanzibar surrendered after just 38 minutes.",
//   "TIL that octopuses have three hearts. Two pump blood to the gills, while the third pumps it to the rest of the body.",
//   "TIL that Finland offers a 'baby box' to all expectant mothers. The box contains baby essentials and can also be used as a bed, contributing to Finland's low infant mortality rates.",
//   "TIL that the inventor of the Frisbee was cremated and made into Frisbees after he died. This was in accordance with his wishes.",
// ];



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

const generateComment = (comment) => {
  return {
    div: [
      { p: comment.text },
      { p: `- ${comment.by}`, class: "italic text-slate-500" },
    ],
    class: "my-2 rounded-md bg-white p-4",
  };
};

const routes = {
  "": indexRoute,
  "/post": postRoute,
};

/**
 * Index marker
 */

let showNewTilInput = false;

async function indexRoute(render) {
  const tils = await s.from("tils").select("*")
  return [
    {
      div: [
        {
          h1: "TIL",
          class: "text-6xl text-center mt-2",
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
                  onclick: async () => {
                    const text =
                      document.getElementById("til-box").value;
                    const by = document.getElementById("by-box").value || "Anonymous"
                    const {error} = await s.from("tils").insert({text, by})
                    if (error) {
                      alert(error.message)
                    }
                    else {
                      showNewTilInput = false;
                    }
                    render();
                  },
                  class:
                    "mt-2 inline-block rounded border border-indigo-600 bg-indigo-600 px-12 py-3 text-sm font-medium text-white hover:bg-transparent hover:text-indigo-600 focus:outline-none focus:ring active:text-indigo-500",
                },
              ],
              class: "max-w-[50rem] mx-auto my-3",
            }
          : { p: "" },
        ...tils.data.map((til, index) => generateTil(til)),
      ],
    },
  ];
}

const generateTil = (til) => {
  const commentCount = comments.filter((c) => c.parent === `${til.id}`).length;

  return {
    div: [
      { p: til.text, class: "text-2xl mb-2" },
      {
        div: [
          { p: `- ${til.by}`, class: "italic text-slate-500" },
          ,
          {
            a: `Comments (${commentCount})`,
            class: "text-blue-700",
            href: `/til/index.html#/post?id=${til.id}`,
          },
          { span: "3 hours ago" },
        ],
        class: "flex justify-between",
      },
    ],
    class: " mt-2 mb-8 mx-auto max-w-[50rem]",
  };
};

/**
 * Post marker
 */

let postsToHideCommentInput = new Set();

async function postRoute(render, { id }) {
  const tils = await s.from("tils").select("*")

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
          href: `/til/index.html#`,
        },
        {
          div: [
            {
              p: tils.data.find(t => `${t.id}` === id).text,
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
                  placeholder: "Your name (optional)",
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
                  onclick: async () => {
                    const comment =
                      document.getElementById("comment-box").value;
                    const by = document.getElementById("by-box").value || "Anonymous"
                    debugger;
                    const { error } = await s.from("comments").insert({parent: id, comment, by })
                    if (error) {
                      alert(error.message)
                    }
                    else {
                      postsToHideCommentInput.add(id);
                    }
                    render();
                  },
                  class:
                    "mt-2 inline-block rounded border border-indigo-600 bg-indigo-600 px-12 py-3 text-sm font-medium text-white hover:bg-transparent hover:text-indigo-600 focus:outline-none focus:ring active:text-indigo-500",
                },
              ],
              id: "post-comment-area",
              class: `${postsToHideCommentInput.has(id) ? "invisible" : ""}`,
            },
          ],
          class: "mt-10 mx-auto max-w-[50rem]",
        },
      ]
    },
  ];
}

const ash = new Ash(routes);
