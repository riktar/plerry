# Plerry⚡Supercharge your Node Applications
> Plerry is a pluggable system that makes it easy for developers to extend the functionality of their NodeJS applications.

[![npm version](https://badge.fury.io/js/plerry.svg)](https://badge.fury.io/js/plerry)


With Plerry, you can quickly and easily add new features to your app, without having to spend hours coding and debugging

```js
const Plerry = require('plerry');
const plerry = new Plerry();

const main = async () => {
  plerry.register((app) => {
    console.log('Plugin Loaded!');
    app.decorate('test', () => {
      console.log('test')
    })
  }, {name: 'test'})

  // Load all plugins
  await plerry.ready()
  // in the console you will see "Plugin Loaded!"

  // Call the test function decorated by the plugin
  plerry.test()
}

main()

```

## Installation

To install Plerry, run the following command:

```bash
npm install plerry
```

## How to Use

Using Plerry is simple. First, require the module in your code:

```js
const Plerry = require('plerry');
```

Next, create a new Plerry instance and register your plugins:

```js
const plerry = new Plerry();
plerry.register(myPlugin);
```

## Writing Plugins
To write a plugin for Plerry, create a javascript module that exports a function. This function will be called with the Plerry instance as an argument, allowing you to register event handlers and access other plugins.

For example:

```js
module.exports = function(plerry) {
  console.log('Hello, world!');
  plerry.decorate('hello', function() {
    console.log('Hello, world!');
  });
}
```
## API

- `register(plugin, manifest)` - Registers a plugin with Plerry. The plugin argument is a function that will be called with the Plerry instance as an argument. The manifest argument is an object that can be used to specify the plugin's name and dependencies.

- `on(eventName, handler)` Registers an event handler for the specified event.

- `decorate(name, fn)` Adds a property to the Plerry instance.

- `ready()` - Loads all registered plugins and waits for them to complete loading.