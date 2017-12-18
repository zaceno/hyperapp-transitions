    
    
addEventListener('resize', updateAllTracked)
addEventListener('scroll', updateAllTracked)

var trackingRegistry = []

function removeElement (el) {
    el.parentNode.removeChild(el)
}

function setStyle (el, props) {
    Object.keys(props)
    .forEach(function (name) {
        el.style[name] = props[name]
    })
}

function registerTracking (el) {
    if (trackingRegistry.indexOf(el) > -1 ) return
    updateTracking(el)
    trackingRegistry.push(el)
}

function unregisterTracking(el) {
    var i = trackingRegistry.indexOf(el)
    if (i === -1) return
    trackingRegistry.splice(i, 1)
}

function updateAllTracked () {
    trackingRegistry.forEach(updateTracking)  
} 

function invertLastMove (el) {
    var x = el._x
    var y = el._y
    if (!x) return 'translate(0, 0)'
    var n = updateTracking(el)
    var dx = Math.floor(x - n.x)
    var dy = Math.floor(y - n.y)
    return 'translate(' + dx + 'px, ' + dy + 'px)'
}

function updateTracking (el) {
    var rect = el.getBoundingClientRect()
    el._x = rect.left
    el._y = rect.top
    return {x: rect.left, y: rect.top}
}

function runTransition (el, props, before, after, ondone) {
    var easing = props.easing || 'linear'
    var time = props.time || 300
    setStyle(el, before)
    //two nested rAF required for it to work in Chrome
    requestAnimationFrame(function () {
        requestAnimationFrame(function () {
            setStyle(el, after)
            el.style.transition = 'all ' + easing + ' ' + time + 'ms'
            setTimeout(function () {
                el.style.transition = null
                ondone && ondone()
            }, time)
        })
    })
}

function runEnter (el, props, css) {
    if (typeof css === 'function') css = css()
    runTransition(
        el, props,
        css,
        Object.keys(css).reduce(function (o, n) {
            o[n] = null
            return o
        }, {}),
        function () { updateTracking(el) }
    )
}

function runMove (el, props) {
    runTransition(
        el, props,
        {transform: invertLastMove(el)},
        {transform: null}
    )
}

function runExit (el, props, css) {
    if (typeof css === 'function') css = css()
    unregisterTracking(el)
    var translation = invertLastMove(el)
    css.transform = translation + (css.transform ? (' ' + css.transform) : '')
    runTransition(
        el, props,
        {transform: translation},
        css,
        function () { removeElement(el) }
    )
}
    
function noop () {}
    
function composeHandlers (f1, f2) {
    return function (el) {
        f1 && f1(el)
        f2 && f2(el)
        return noop 
    }
}

function transitionComponent (handlersFn) {
    return function (props, children) {
        var handlers = handlersFn(props || {})
        return children
        .filter(function (child) { return !!child.props})
        .map(function (child) {
            ['oncreate', 'onupdate', 'onbeforeremove'].forEach(function (n) {
                child.props[n] = composeHandlers(child.props[n], handlers[n])
            })  
            return child
        })
    }
}

var _track = transitionComponent(function (props) { 
    return {oncreate: function (el) { registerTracking(el)} }
})

var _move = transitionComponent(function (props) { 
    return { onupdate: function (el) { runMove(el, props) } }
})

var _exit = transitionComponent(function (props) {
    return { onbeforeremove: function (el) { runExit(el, props, props.css || {}) } }
})

var enter = transitionComponent(function (props) {
    return { oncreate: function (el) { runEnter(el, props, props.css || {}) } }
})

var move = function (props, children) {
    return _move(props, _track(null, children))
}

var exit = function (props, children) {
    return _exit(props, _track(null, children))
}


export {enter, move, exit}
