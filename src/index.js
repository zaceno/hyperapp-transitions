    
addEventListener('resize', updateAllTracked)
addEventListener('scroll', updateAllTracked)

var trackingRegistry = []

function removeElement (el) {
    el.parentNode.removeChild(el)
}

function setStyle (el, attr) {
    Object.keys(attr)
    .forEach(function (name) {
        el.style[name] = attr[name]
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

function runTransition (el, attr, before, after, ondone) {
    var easing = attr.easing || 'linear'
    var time = attr.time || 300
    var delay = attr.delay || 0
    setStyle(el, before)
    setTimeout(function () {
        requestAnimationFrame(function () {
            setStyle(el, after)
            el.style.transition = 'all ' + easing + ' ' + time + 'ms'
            setTimeout(function () {
                el.style.transition = null
                ondone && ondone()
            }, time)
        })
    }, delay)
}

function runEnter (el, attr, css) {
    if (typeof css === 'function') css = css()
    runTransition(
        el, attr,
        css,
        Object.keys(css).reduce(function (o, n) {
            o[n] = null
            return o
        }, {}),
        function () { updateTracking(el) }
    )
}

function runMove (el, attr) {
    runTransition(
        el, attr,
        {transform: invertLastMove(el)},
        {transform: null}
    )
}

function runExit (el, attr, css, done) {
    if (typeof css === 'function') css = css()
    unregisterTracking(el)
    var translation = invertLastMove(el)
    css.transform = translation + (css.transform ? (' ' + css.transform) : '')
    runTransition(
        el, attr,
        {transform: translation},
        css,
        done
    )
}
    
function noop () {}
    
function composeHandlers (f1, f2) {
    if (!f1) return f2
    if (!f2) return f1
    return function (el, done) {
        f1 && f1(el, done)
        f2 && f2(el, done)
        return noop
    }
}

function transitionComponent (handlersFn) {
    return function (attr, children) {
        var handlers = handlersFn(attr || {})
        return children
        .filter(function (child) { return !!child.attributes})
        .map(function (child) {
            ['oncreate', 'onupdate', 'onremove'].forEach(function (n) {
                child.attributes[n] = composeHandlers(child.attributes[n], handlers[n])
            })  
            return child
        })
    }
}

var _track = transitionComponent(function (attr) { 
    return {oncreate: function (el) { registerTracking(el)} }
})

var _move = transitionComponent(function (attr) { 
    return { onupdate: function (el) { runMove(el, attr) } }
})

var _exit = transitionComponent(function (attr) {
    return {
        onremove: function (el, done) {
            done = done || function () { removeElement(el) }
            runExit(el, attr, attr.css || {}, !attr.keep && done)
        }
    }
})

var Enter = transitionComponent(function (attr) {
    return { oncreate: function (el) { runEnter(el, attr, attr.css || {}) } }
})

var Move = function (attr, children) {
    return _move(attr, _track(null, children))
}

var Exit = function (attr, children) {
    return _exit(attr, _track(null, children))
}

export {Enter, Move, Exit}
