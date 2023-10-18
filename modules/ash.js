const typeToHtmlContainer = {
  title: "div",
  text: "p",
  button: "button",
  list: "ul",
};

export class Ash {
  data = [];

  constructor(data) {
    this.data = data;
  }

  setData(data) {
    this.data = data;

    return this;
  }

  render() {
    document.getElementById("ashjs").innerHTML = "";

    this.data.forEach((item) => {
      let newElement = this.generateNewElement(item);

      if (newElement) {
        document.getElementById("ashjs").appendChild(newElement);
      }
    });
  }

  update(replacements) {
    const newData = this.data.map((item) => {
      if (item.id && replacements[item.id]) {
        const newItem = {
          ...item,
          ...replacements[item.id],
        };

        const newElement = this.generateNewElement(newItem);
        const existingElement = document.getElementById(item.id);

        if (!newElement) {
          console.warn("Something went wrong generating new element.");
        } else if (!existingElement) {
          console.warn("No element found with id: ", item.id);
        } else {
          existingElement.replaceWith(newElement);
        }

        return newItem;
      } else return item;
    });

    this.data = newData;
  }

  generateNewElement(item) {
    let newElement = document.createElement(typeToHtmlContainer[item.type]);
    switch (item.type) {
      case "title":
        const title = document.createElement("h1");
        title.innerText = item.content;

        newElement.appendChild(title);
        if (item.subtitle) {
          const subtitle = document.createElement("p");
          subtitle.style.marginTop = "-16px";
          subtitle.innerText = item.subtitle;
          newElement.appendChild(subtitle);
        }

        break;
      case "text":
        newElement.innerText = item.content;
        break;
      case "list":
        newElement.id = item.id;

        item.items.forEach((listItem) => {
          const listItemElement = document.createElement("li");
          listItemElement.innerText = listItem;
          newElement.appendChild(listItemElement);
        });
        break;
      case "button":
        newElement.innerText = item.content;
        newElement.onclick = item.onclick;
        break;
      default:
        break;
    }

    return newElement;
  }
}
