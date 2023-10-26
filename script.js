import { Ash } from "./modules/ash.js";

const ash = new Ash();

function generateLaunchObject(launch, index) {
  return {
    div: [
      {
        h3: launch.title,
        id: `launch-${index + 1}`,
      },
      {
        p: launch.description,
      },
      {
        button: "Like",
        onclick: function () {
          ash.update({
            [`launch-${index + 1}`]: {
              style: "color: green;",
            },
          });
        },
      },
    ],
  };
}

fetch("http://localhost:3000/api/launches").then((res) => {
  res.json().then((launchData) => {
    const data = [
      {
        h1: "MiniLaunch",
      },
      {
        p: "Share your project",
      },
      {
        h2: "Recent launches",
      },
      ...launchData.map(generateLaunchObject),
    ];

    ash.data = data;
    ash.render();
  });
});
