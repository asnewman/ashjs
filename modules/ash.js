export function render(data) {
  console.log("rendering")
  data.forEach((item) => {
    let newElement = document.createElement(typeToHtmlContainer[item.type]);
    switch (item.type) {
      case "title":
        title = document.createElement("h1");
        title.innerText = item.content;

        newElement.appendChild(title)
        if (item.subtitle) {
          subtitle = document.createElement("p");
          subtitle.style.marginTop = "-16px";
          subtitle.innerText = item.subtitle;
          newElement.appendChild(subtitle)

        }

        break;
      case "text":
        newElement.innerText = item.content;
        break;
      case "list":
        newElement.id = item.id;
        break;
      case "button":
        newElement.innerText = item.content
        newElement.onclick = item.onclick
        break;
      default:
        break;
    }

    if (newElement) {
      document.getElementById("ashjs").appendChild(newElement);
    }
  });
}