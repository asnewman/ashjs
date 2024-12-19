# ash.js Documentation

## Introduction

ash.js is my experimental frontend framework, which I use to build my personal projects. You can see it in action in the [Phonetic GitHub repo](https://github.com/asnewman/phonetic). It is an extremely lightweight SPA framework for small frontend web apps that focuses on allowing you to build quickly without needing to learn/fight complicated JS frameworks made for large-scale applications (stop using React for your blog).

Core concepts that I am trying to solve/experiment with:

1. Eliminate HTML syntax (I find it not ergonomic)
2. Tell the engine when to re-render what (the auto-rerendering paradigm was a mistake)
3. A global, mutable store is fine (until I'm proven otherwise)
4. Vanilla JavaScript is beautiful and should not be seen as an escape hatch

## Installation

ash.js is designed to be included directly in your project without the need for package managers or build tools. Simply include the ash.js code in your script:

```html
<head>
  <!-- Include via CDN -->
  <script src="https://cdn.jsdelivr.net/gh/asnewman/ashjs@main/index.js"></script>
</head>
```

Alternatively, you can copy and paste the source code for ash.js into your project (trust me, it's fine!). Currently, I have no plans to publish this code on NPM.

## Getting Started

To build an application with ash.js, you need to:

    Define routes: Map URL paths to functions that return component trees.
    Define events: Map event names to business logic that update your UI.
    Initialize the Ash instance: Pass the routes and events to Ash.

The most basic application will look like this:

```javascript
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Example</title>
    <script src="https://cdn.jsdelivr.net/gh/asnewman/ashjs@v0.0.2/index.js"></script>
  </head>
  <body class="">
    <div id="ashjs"></div>
    <script type="text/javascript">
      const store = {
        showGoodbye: false
      }

      const routes = {
        "/": (emit) => {
          return [
            {
              div: [
                {p: store.showGoodbye ? "Bye!" : "Welcome to Ash.js!"},
                {button: "Good bye", onclick: () => emit("bye")}
              ]
            },
          ]
        }
      }

      const events = {
        "bye": (data, render) => {
          store.showGoodbye = true;
          render()
        }
      }

      new window.Ash(routes, events)
    </script>
  </body>
</html>
```

Please remember that I am still building and experimenting with ash.js. If you have any ideas or suggestions, feel free to create an issue as I would love to hear them.

## Usage

### Targetted re-renders

The simplest way to re-render your UI is by calling the `render()` function. This will re-render the entire page based on the URL and the `routes` you've provided. However, re-rendering the entire page is not performant, so instead, you can pass in an `id` into `render` to selectively re-render a portion of the UI. Make sure you attach an `id` field into the element you need to re-render, like so:

```
// UI snippet with the `id` attribute attached
div: [
  {p: store.showGoodbye ? "Bye!" : "Welcome to Ash.js!", id: "message"},
  {button: "Good bye", onclick: () => emit("bye")}
]

// Event snippet to only re-render the displayed message
"bye": (data, render) => {
  store.showGoodbye = true;
  render("message")
}
```

## Development

Build command: `esbuild main.js --bundle --outfile=index.js`
