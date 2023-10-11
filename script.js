import { render } from "./modules/ash";

const items = []

const exampleFunc = () => {
  items.push(new Date())

  return [{
    type: "list",
    id: "log-area",
    items: items
  }]
}

const data = [
  {
    type: "title",
    content: "Dailies",
    subtitle: "Track your daily challenges."
  },
  {
    type: "text",
    content: "Let's get started",
  },
  {
    type: "button",
    content: "New log",
    onclick: () => {
      const newData = exampleFunc()
    }
  },
  {
    type: "list",
    id: "log-area",
    items: items
  }
];

const typeToHtmlContainer = {
  "title": "div",
  "text": "p",
  "button": "button",
  "list": "ul"
}

function replacer(data, replacementData) {
  return data.map((item) => {
    for (const replacementItem of replacementData) {
      if (item.id && item.id === replacementItem.id) {
        return replacementItem
      }
    }
    return item
  })
}

console.log("attempting to render")
render(data)
