# ash.js Documentation

## Introduction

ash.js is my experimental frontend framework, which I use to build my personal projects. You can see it in action in the [Phonetic GitHub repo](https://github.com/asnewman/phonetic). It is an extremely lightweight SPA framework for small frontend web apps that focuses on allowing you to build quickly without needing to learn/fight complicated JS frameworks made for large-scale applications.

Core concepts that I am trying to solve/experiment with:

1. Create an alternative syntax to HTML/JSX
2. Imperative engine re-rendering
3. A global, mutable storage
4. Event based action system

Some of these bullets go against conventional programming best practices. However, my hypothesis is, they make sense and allow for a better programming experience in a small-project setting. For more information around my thought process, please read my blog post [Question Best Practices](https://ajkprojects.com/questionbestpractices.html)

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

- Define routes: Map URL paths to functions that return component trees.
- ashjs markup: Write UI code using ashjs's simple markup syntax.
- Define events: Map event names to business logic that update your UI.
- Initialize the Ash instance: Pass the routes and events to Ash.

The most basic application will look like this:

```javascript
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Example</title>
    <script src="https://cdn.jsdelivr.net/gh/asnewman/ashjs@v0.0.6/index.js"></script>
  </head>
  <body class="">
    <div id="ashjs"></div>
    <script type="text/javascript">
      const store = {
        showGoodbye: false
      }

      const routes = {
        "/": () => `
          -div()
          --p()
          ---"${store.showBye ? "Bye" : "Welcome to Ash.js!"}"
          --button(onclick="bye")
          ---"Goodbye"
          `
        }

      const events = {
        "bye": (data, render) => {
          store.showBye = true;
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

### Targetted Re-renders

The simplest way to re-render your UI is by calling the `render()` function. This will re-render the entire page based on the URL and the `routes` you've provided. However, re-rendering the entire page is not performant, so instead, you can pass in an `id` into `render` to selectively re-render a portion of the UI. Make sure you attach an `id` field into the element you need to re-render, like so:

```
// UI snippet with the `id` attribute attached
`
-div()
--p(id="message")
---"${store.showBye ? "Bye" : "Welcome to Ash.js!"}"
--button(onclick="bye")
---"Goodbye"
`

// Event snippet to only re-render the displayed message
"bye": (data, render) => {
  store.showBye = true;
  render("message")
}
```

### Passing Events Data

Pass data to event handlers like so:

```
-div()
--"Current count: ${store.count}"
--button(onclick='increaseCountBy("1")')
```

### Nested Generator Function

Often, it makes sense to use a helper function to build portions of UI that is reused in multiple places. For example:

```
function footer() {
  return `
    -div(id="footer")
    --"Please contact me"
  `
}
```

To make sure the UI gets rendered at the approriate HTML level, use `{}` like so:

```
-div("root")
// some content
{ ${footer()} }
```

Here, even though `footer()` generates UI code at the same `-` level as `-div("root")`, the engine will properly nest the footer inside "root".

For more details, please see https://github.com/asnewman/ashjs/issues/2.

## Development

Build command: `esbuild main.js --bundle --outfile=index.js`
