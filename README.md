# Transition Helpers for Hyperapp / Picodom


Transitions, or more specifically transition-*animations* are animations that smooth out the appearance of your app as elements are added, changed and removed. Well designed transitions provide important cues to the user, and are essential for a good experience.

On the web, the favored approach is to use the CSS-transition property. Some javascript is often also needed, in order to apply the css properties with appropriate timing to achieve the desired effect.

This library provides function to help you design your app with beautiful, meaningful transitions without cluttering your code. Specifically for apps based on [Hyperapp](https://hyperapp.js.org) and [Picodom](https://github.com/picodom/picodom).


## Set up

### NPM

Install the package in your project

```
> npm install hyperapp-transitions
```

... then include it in your app, using `require` (or `import`, if using es6 modules).

```js
const transitions = require('hyperapp-transitions')
```

The imported object exposes `enter`, `exit` and `move` functions described below.

### HTML

Include the following script tag in the `<head>...</head>` of your html page:

```html
<script src="https://unpkg.com/hyperapp-transitions"></script>
```

This creates a `transitions` object in the global scope, through which you access the `enter`, `exit` and `move` functions described below.



## Using transitions

The `enter`, `move` and `exit` transitions are vnode decorators. They attach to the `oncreate`, `onupdate` and `onremove` lifecycle events of your nodes, in order to make the nodes transition. They *compose* with any existing lifecycle event-handlers, leaving them working the same as before.

The signature of these functions is the familiar JSX compatible `(props, children)`, so you can use them with jsx, and even compose them.

The transitions will apply to all the children (not recursively though).

### `enter`

Cause elements to appear, with animation. The props are:

- `css` the css overrides the element should have *before* it begins to appear. This can also be a function, allowing you to defer the decision until right before the animation starts.
- `time` the duration of the transition in milliseconds. Default: `300`.
- `easing` A string with the [timing function](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-timing-function) of the transition. Default: `"linear"`.

Example:

```jsx
//make messages pop and fade in:
<transitions.enter time={200} easing="ease-in-out" css={{
    opacity: '0',
    transform: 'scale(0.1, 0.1)',
}}>
    <p class="message">some message</p>
</transitions.enter>
```


### `exit`

Cause elements to leave with animation. The props are:

- `css` the css overrides the element should have *after* it has left. This can also be a function, allowing you to defer the decision until right before the animation starts.
- `time` the duration of the transition in milliseconds. Default: `300`.
- `easing` A string with the [timing function](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-timing-function) of the transition. Default: `"linear"`.

Example:

```jsx
//make messages slide and fade out, and change backgroundcolor
<transitions.exit time={200} easing="ease-in-out" css={{
    transform: 'translateY(-100%)',
    background-color: '#999',
}}>
    <p class="message">some message</p>
</transitions.exit>
```

### `move`

Whenever an element changes position on the page, you can make it slide to the new position, with desired timing.

Valid props are:

- `time` the duration of the transition in milliseconds. Default: `300`.
- `easing` A string with the [timing function](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-timing-function) of the transition. Default: `"linear"`.


## Examples

[Toasts](https://codepen.io/zaceno/pen/QOYOZd)

This example demonstrates composing together move, enter and exit transitions.

[15-puzzle](https://codepen.io/zaceno/pen/XzOwPd)

This example focuses on using move transitions, and demonstrates how it applies to all the children it encloses

[Carousel](https://codepen.io/zaceno/pen/ZawNmb)

This is an example of a situation where using deferred properties help, because the exit-transition can't know which direction to go, until it's too late (it's already not in the vdom anymore). But by using a function call for it's `css` prop, it can know the current direction to exit.

