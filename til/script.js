import { Ash } from "../modules/ash.js";
const { createClient } = supabase;

const s = createClient('https://lhjukjfrbjipxrpezkuy.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoanVramZyYmppcHhycGV6a3V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDI3NjE1NzcsImV4cCI6MjAxODMzNzU3N30.9txcN8AsNBCvQm7naJ4sPQfDO7V7EqOnHoS1mUhWV-E')

const routes = {
  "": indexRoute,
  "/post": postRoute,
};

const globalStore = {
  tils: undefined
}

async function initTils(refresh) {
  if (!globalStore["tils"] || refresh) {
    globalStore["tils"] = (await s.from("tils").select("*")).data
  }
}

/**
 * Index marker
 */

let showNewTilInput = false;

async function indexRoute(render) {
  await initTils()
  const comments = await s.from("comments").select("*")

  return [
    {
      div: [
        {
          h1: "TIL",
          class: "text-6xl text-center mt-2",
        },
        {
          p: !showNewTilInput ? "Submit new TIL" : "Close",
          class: "text-md text-center mt-2 cursor-pointer text-cyan-800 font-bold",
          onclick: () => {
            showNewTilInput = !showNewTilInput;
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
                    await initTils(true)
                    render();
                  },
                  class:
                    "mt-2 inline-block rounded border border-cyan-800 bg-cyan-800 px-12 py-3 text-sm font-medium text-white hover:bg-transparent hover:text-cyan-800 focus:outline-none focus:ring active:text-cyan-500",
                },
              ],
              class: "max-w-[50rem] mx-auto my-3",
            }
          : { p: "" },
          {
            div: "",
            class: "mb-10"
          },
        ...globalStore.tils.map((til, index) => generateTil(til, comments.data)),
      ],
    },
  ];
}

const generateTil = (til, comments) => {
  const commentCount = comments.filter((c) => c.parent_id === til.id).length;

  return {
    div: [
      { p: til.text, class: "text-2xl mb-2" },
      {
        div: [
          { p: `- ${til.by}`, class: "italic text-slate-500" },
          ,
          {
            a: `Comments (${commentCount})`,
            class: "text-cyan-800 font-bold",
            href: `/til/index.html#/post?id=${til.id}`,
          },//
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
  const tils = await s.from("tils").select("*").eq("id", parseInt(id))
  const comments = await s.from("comments").select("*").eq("parent_id", parseInt(id))
  const markupForComments = [
    ...comments.data
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
              p: tils.data[0].text,
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
                    const { error } = await s.from("comments").insert({parent_id: id, comment, by })
                    if (error) {
                      alert(error.message)
                    }
                    else {
                      postsToHideCommentInput.add(id);
                    }
                    render();
                  },
                  class:
                    "mt-2 inline-block rounded border border-cyan-800 bg-cyan-800 px-12 py-3 text-sm font-medium text-white hover:bg-transparent hover:text-cyan-800 focus:outline-none focus:ring active:text-cyan-500",
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

const generateComment = (comment) => {
  return {
    div: [
      { p: comment.comment },
      { p: `- ${comment.by}`, class: "italic text-slate-500" },
    ],
    class: "my-2 rounded-md bg-white p-4",
  };
};

const ash = new Ash(routes);
