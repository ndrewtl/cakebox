# Cakebox

A DIY build system for javascript et. al

## Why?
Grunt and Gulp are great build systems, but sometimes depend on plugins that aren't frequently updated.
Sometimes building a project with Webpack feels like cocking a bazooka at an ant.

This project is designed to obviate plugins by putting configuration entirely in the developer's hands.
Bring your own modules and build your project how you'd like.

## Installation
```zsh
$ yarn add @andrewtl/cakebox --dev
```

## Use
### Build:
```zsh
$ npx cakebox
```

### Watch:
```zsh
$ npx cakebox --watch
```
or
```zsh
$ npx cakebox -w
```

### With node:
Add to your `package.json`
```json
...
scripts: {
  "build": "cakebox",
  "watch": "cakebox --watch"
}
...
```
And then run:
```zsh
$ npm run watch
```
to automatically compile your project

