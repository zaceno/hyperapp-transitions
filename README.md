# <img height=24 src=https://cdn.rawgit.com/JorgeBucaran/f53d2c00bafcf36e84ffd862f0dc2950/raw/882f20c970ff7d61aa04d44b92fc3530fa758bc0/Hyperapp.svg> Hyperapp Transitions

[![npm](https://img.shields.io/npm/v/hyperapp-transitions.svg)](https://www.npmjs.org/package/hyperapp-transitions) [![Slack](https://hyperappjs.herokuapp.com/badge.svg)](https://hyperappjs.herokuapp.com "Join us")

Hyperapp Transitions lets you animate your [Hyperapp](https://github.com/hyperapp/hyperapp) components as they are appear, dissapear and move around on the page. Use it to provide your user with important cues and a smoother experience.

* **CSS Based** — Anything you can `transition` with CSS can be animated, including background-color, opacity, position and scale.
* **Animate Layouts** — Reorder nodes in a list or flexbox-layout, and watch them gracefully *slide* into place 
* **Composable** — Stack multiple transitions with different delay and duration for complex animation effects.

## Getting Started

Simply wrap your component in one of the decorator components exported from Hyperapp Transitions:

```jsx
import {Enter} from "transitions"

const Notification = ({key, message}) => (
    <Enter css={{opacity: "0", transform: "translateX(100%)"}}>
        <div key={key} class="notification">
            {message}
        </div>
    </Enter>
)
```

Use it as you would any component. The difference is, now your newly added `Notifications` will not just suddenly appear, but rather fade and slide in from the right.

## Installation

Install with npm or Yarn.

<pre>
npm i <a href=https://www.npmjs.com/package/@hyperapp/transitions>hyperapp-transitions</a>
</pre>

Then with a module bundler like [Rollup](https://rollupjs.org) or [Webpack](https://webpack.js.org), use as you would anything else.

```js
import transitions from "@hyperapp/transitions"
```

If you don't want to set up a build environment, you can download Hyperapp Transitions from a CDN like [unpkg.com](https://unpkg.com/@hyperapp/transitions) and it will be globally available through the <samp>window.transitions</samp> object.

```html
<script src="https://unpkg.com/@hyperapp/transitions"></script>
```

## Overview

Hyperapp Transitions exports three components: `Enter`, `Exit` and `Move` described below. Each take a number of attributes for defining the animation.

The components are *decorator-components* (a.k.a "higher-order components"), which means that they do not add anything to the virtual DOM tree, but rather modify and return their children. 

## Enter

Use the Enter component to make elements appear in an animated fashion, when they are added to the DOM.

### Attributes

The Enter component takes the following attributes:

#### `css`

The css overrides the element should have *before* it begins to appear. This can also be a function, allowing you to defer the decision until right before the animation starts.

Default: `{}`

#### `time`

The duration of the transition in milliseconds.

Default: `300`.

#### `easing`

A string with the [timing function](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-timing-function) of the transition.

Default: `"linear"`.

#### `delay`

Wait this amount of milliseconds before starting the transition.

Default: `0`.

### Example:

```jsx
//make messages pop and fade in:
<Enter time={200} easing="ease-in-out" css={{
    opacity: "0",
    transform: "scale(0.1, 0.1)",
}}>
    <p class="message">some message</p>
</Enter>
```

## Exit

Use the Exit component to animate out elements before they are removed from the DOM.

### Attributes: 

The Exit component takes the following attributes:

#### `css`

The css overrides the element should have *after* it has left. This can also be a function, allowing you to defer the decision until right before the animation starts.

Default: `{}`

#### `time`

The duration of the transition in milliseconds.

Default: `300`.

#### `easing`

A string with the [timing function](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-timing-function) of the transition.

Default: `"linear"`

#### `delay`

Wait this amount of milliseconds before beginning the transition.

Default: `0`.

#### `keep`

When composing multiple Exit-transition components, set this to `true` on all but the last one, in order to prevent previous ones from removing the element when complete.

Default: `false`.

### Example:

```jsx
//make messages slide and fade out, and change backgroundcolor
<Exit time={200} easing="ease-in-out" css={{
    transform: "translateY(-100%)",
    opacity: "0",
}}>
    <p class="message">some message</p>
</Exit>
```

## Move

When the order of sibling nodes (items in a list, for example) changes, their elements are laid out in new positions on the page. When the sibling nodes are wrapped with the `Move` transition-component, they will glide smoothly to their new positions.

Remember to key the nodes you wish to apply the `Move` transition to, so that the vdom engine is able to detct that it is the *order* that has changed, and not just all the attributes.

### Attributes:

The `Move` component takes the following attributes:

#### `time`

The duration of the transition in milliseconds.

Default: `300`.

#### `easing`

A string with the [timing function](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-timing-function) of the transition.

Default: `"linear"`.

### Example:

```jsx

<ul class="todo-list">
    <Move time={200} easing="ease-in-out">
    {state.todos.map(todo => (
        <li class="todo-item" key={todo.id}>
            ...
        </li>
    ))}
    </Move>
</ul>
```

## Composing Transitions

The transition components work by adding handlers for the `oncreate`, `onremove` and/or `onupdate` lifecycle events to their children. If a child already has a handler for those lifecycle events, it is not overwritten. Rather, we compose the transition-handlers with existing lifecycle event handlers.

This makes it possible to compose multiple transition components on top of eachother.

### Example:

```jsx
const FadeInPopOut = (props, children) => (
    <Enter css={{opacity: "0"}}>
        <Exit css={{opacity: "0", transform: "scale(2.0,2.0)"}}>
            {children}
        </Exit>
    </Enter>
)
```

## Keys

As a general rule: make sure to have keys on all nodes you apply transitions to.

The lifecycle events which trigger the transitions, are based on *elements* - not virtual nodes. Without keys, Hyperapp's virtual DOM engine will often associate the a nodes with an unintended element in the real DOM, with unexpected transition-behavior as a consequence.


## Examples

Please have a look at these live, editable examples, for some ideas of what is possible:

- **[Toasts](https://codepen.io/zaceno/pen/QOYOZd)** - Combining Enter, Exit and Move transitions for an elegant notification display.
- **[15-puzzle](https://codepen.io/zaceno/pen/XzOwPd)** - Slide squares around a grid using the Move transition
- **[Carousel](https://codepen.io/zaceno/pen/ZawNmb)** - A situation you'll need deferred css for the Exit transition.

## Bugs & Questions

Do you have questions? Or think you've found a bug? Please file an issue att https://github.com/hyperappcommunity/hyperapp-transitions

Or come join the us on the [Hyperapp Slack](https://hyperappjs.herokuapp.com)!

## License

Hyperapp Transitions is MIT licensed. See [LICENSE](LICENSE.md).
