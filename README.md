# Ash.js Documentation
## Introduction

Ash.js is a lightweight JavaScript framework designed for building single-page applications (SPAs) with minimal setup and overhead. It provides a simple way to manage routes, render components, and maintain application state without the complexity of larger frameworks.

Installation

Ash.js is designed to be included directly in your project without the need for package managers or build tools. Simply include the Ash.js code in your script:

```html
<head>
    <!-- Include via CDN -->
    <script src="https://cdn.jsdelivr.net/gh/ash-js/ash.js@main/dist/ash.js"></script>
</head>
```

Alternatively, you can place the Ash.js code in a separate JavaScript file and include it using a <script> tag with the src attribute.

## Getting Started

To build an application with Ash.js, you need to:

    Define your routes: Map URL paths to functions that return component trees.
    Create your store: An object that holds your application's state.
    Initialize the Ash instance: Pass the routes and store to Ash.

The most basic application will look like this:

```javascript
const routes = {
    '': (render, store) => {
        return [
            {
                div: [
                    { h1: "Welcome to Ash.js" },
                ],
            }
        ]
    }
};

const store = {};

const ash = new Ash(routes, store);
```

Conclusion

Ash.js offers a minimalist approach to building SPAs by leveraging plain JavaScript objects to represent components and using simple routing based on the URL hash. It's ideal for small projects or for developers who prefer to have more control over their application's architecture without the overhead of larger frameworks.

Feel free to extend Ash.js to suit your needs, and enjoy building your applications with simplicity and ease!