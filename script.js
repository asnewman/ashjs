import { Ash } from "./modules/ash.js";

const ash = new Ash();

const items = [];

const addNewListItem = () => {
  items.push(new Date());

  ash.update({
    "log-area": {
      items,
    },
  });
};

const data = [
  {
    type: "title",
    content: "Dailies",
    subtitle: "Track your daily challenges.",
  },
  {
    type: "text",
    content: "Let's get started",
  },
  {
    type: "button",
    content: "New log",
    onclick: addNewListItem,
  },
  {
    type: "list",
    id: "log-area",
    items: items,
  },
];

ash.setData(data).render();
