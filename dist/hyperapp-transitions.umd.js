!function(t){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this).transitions=t()}}(function(){return function t(n,e,r){function o(u,a){if(!e[u]){if(!n[u]){var f="function"==typeof require&&require;if(!a&&f)return f(u,!0);if(i)return i(u,!0);var s=new Error("Cannot find module '"+u+"'");throw s.code="MODULE_NOT_FOUND",s}var c=e[u]={exports:{}};n[u][0].call(c.exports,function(t){var e=n[u][1][t];return o(e||t)},c,c.exports,t,n,e,r)}return e[u].exports}for(var i="function"==typeof require&&require,u=0;u<r.length;u++)o(r[u]);return o}({1:[function(t,n,e){"use strict";function r(t){if(Array.isArray(t)){for(var n=0,e=Array(t.length);n<t.length;n++)e[n]=t[n];return e}return Array.from(t)}function o(t){t.parentNode&&t.parentNode.removeChild(t)}function i(t,n){n.style.transition="all "+t.easing+" "+t.time+"ms"}function u(t){return function(n){var e="function"==typeof t?t():t;return Object.assign({},l,e)}}function a(t,n){return function(e){var r=u(e),o=function(t){return n(r(),t)};return function(n){if(n&&n.props){var e=n.props[t]||function(t){};return n.props[t]=function(){return e.apply(void 0,arguments),o.apply(void 0,arguments),function(){}},n}}}}function f(t){var n=+t.getAttribute("data-t-x"),e=+t.getAttribute("data-t-y"),r=t.getBoundingClientRect(),o=r.left,i=r.top;return t.setAttribute("data-t-x",o),t.setAttribute("data-t-y",i),n?[n-o,e-i]:[null,null]}function s(){for(var t=arguments.length,n=Array(t),e=0;e<t;e++)n[e]=arguments[e];var o=[].concat(n),i=o.length,u=o[0];if(1===i)return u;var a;return a=i>2?s.apply(void 0,r(o.slice(1))):o[1],function(t){return u(a(t))}}var c=function(){function t(t,n){var e=[],r=!0,o=!1,i=void 0;try{for(var u,a=t[Symbol.iterator]();!(r=(u=a.next()).done)&&(e.push(u.value),!n||e.length!==n);r=!0);}catch(t){o=!0,i=t}finally{try{!r&&a.return&&a.return()}finally{if(o)throw i}}return e}return function(n,e){if(Array.isArray(n))return n;if(Symbol.iterator in Object(n))return t(n,e);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),l={name:"",time:0,delay:0,ready:0,easing:"",last:!0},d=a("onremove",function(t,n){var e=t.name+"-leave";n.style.transition="",n.style.transform="",n.classList.add(e);var r=getComputedStyle(n).getPropertyValue("transform"),u="none"===r?[1,0,0,1,0,0]:r.match(/^matrix\(([^\)]*)\)$/)[1].split(", ").map(function(t){return+t}),a=c(u,6),s=a[0],l=a[1],d=a[2],y=a[3],p=a[4],m=a[5];n.classList.remove(e);var v=f(n),g=c(v,2),h=g[0],x=g[1];n.style.transform="translate("+h+"px, "+x+"px)",setTimeout(function(r){n.classList.add(e),n.style.transform="matrix("+s+", "+l+", "+d+", "+y+", "+(p+h)+", "+(m+x)+")",i(t,n),t.last&&setTimeout(function(t){return o(n)},t.time)},t.delay)}),y=a("oncreate",function(t,n){return setTimeout(function(t){return f(n)},t.ready)}),p=a("oncreate",function(t,n){var e=t.name+"-enter";n.classList.add(e),setTimeout(function(r){i(t,n),n.classList.remove(e)},t.delay)}),m=a("oncreate",function(t,n){return i(t,n)}),v=a("onupdate",function(t,n){var e=f(n),r=c(e,2),o=r[0],u=r[1];n.style.transition="",n.style.transform="translate("+o+"px, "+u+"px)",setTimeout(function(e){i(t,n),n.style.transform="translate(0,0)",setTimeout(function(t){n.style.transform="",n.style.transition=""},t.time)})}),g=a("oncreate",function(t,n){return setTimeout(function(t){return f(n)},t.ready)});n.exports={change:m,enter:p,leave:function(t){return s(y(t),d(t))},move:function(t){return s(g(t),v(t))},group:function(t){return function(n){return n.children.forEach(t),n}},combine:s}},{}]},{},[1])(1)});
