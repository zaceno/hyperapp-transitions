var DEFAULTS = {
    name: '',
    time: 0,
    delay: 0,
    ready: 0,
    easing: '',
    last: true,
}

function noop () {}

function removeElement (el) {
    if (!el.parentNode) return
    el.parentNode.removeChild(el)
}

function setTransition (props, el) {
    el.style.transition = 'all ' + props.easing + ' ' + props.time + 'ms'
}

function props2Fn(props) {
    return function () {
        var props2 = (typeof props === 'function') ? props() : props
        return Object.assign({}, DEFAULTS, props2)
    }
}

function txmethod (name, f) {
    return function (props) {
        var propsFn = props2Fn(props)
        var handler = function (el) { return f(propsFn(), el) }
        return function (vnode) {
            if (!vnode || !vnode.props) return
            var origHandler = vnode.props[name] || (noop)
            vnode.props[name] = function (el) {
                origHandler(el)
                handler(el)
                return noop //hack to make onremove let me remove elements myself
            }
            return vnode
        }
    }
}

function trackMoves (el) {
    var prevX = +el.getAttribute('data-t-x')
    var prevY = +el.getAttribute('data-t-y')
    var rect = el.getBoundingClientRect()
    var newX = rect.left
    var newY = rect.top
    el.setAttribute('data-t-x', newX)
    el.setAttribute('data-t-y', newY)
    if (!prevX) return [null, null]
    return [prevX - newX, prevY - newY]
}

var _leaveOnRemove = txmethod('onremove', function (props, el) {
    var cls = props.name + '-leave'

    //first we need to capture any transforms the
    //leave class will apply
    el.style.transition = ''
    el.style.transform = ''
    el.classList.add(cls)
    var willTransform = getComputedStyle(el).getPropertyValue('transform')
    willTransform = (willTransform === 'none')
        ? [1, 0, 0, 1, 0, 0]
        : willTransform.match(/^matrix\(([^\)]*)\)$/)[1].split(', ').map(function (s) { return +s })
    var sx = willTransform[0],
        wx = willTransform[1],
        wy = willTransform[2],
        sy = willTransform[3],
        tx = willTransform[4],
        ty = willTransform[5];
    el.classList.remove(cls)

    //and set the plain translation:
    var trackDelta = trackMoves(el)
    var dx = trackDelta[0]
    var dy = trackDelta[1]
    el.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)'
    
    //after the specified delay, apply the transition
    setTimeout(function () {
        el.classList.add(cls)
        //override the transition props
        el.style.transform = 'matrix(' + [sx, wx, wy, sy, tx + dx, ty + dy].join(',') + ')'
        setTransition(props, el)
        //after the delay, if last, remove:
        if (props.last) setTimeout(function () {removeElement(el)}, props.time)
    }, props.delay)
})

var _leaveOnCreate = txmethod('oncreate', function (props, el) {
    return setTimeout(function () {
        return trackMoves(el)
    }, props.ready)
})

var leave = function (props) {
    return combine(
        _leaveOnCreate(props),
        _leaveOnRemove(props)
    )
}

var enter = txmethod('oncreate', function (props, el) {
    var clsEnter = props.name + '-enter'
    el.classList.add(clsEnter)
    setTimeout(function () {
        setTransition(props, el)
        el.classList.remove(clsEnter)
    }, props.delay)
})

var change = txmethod('oncreate', function (props, el) {
    return setTransition(props, el)
})

var _moveOnUpdate = txmethod('onupdate', function (props, el) {
    var move = trackMoves(el)
    var dx = move[0]
    var dy = move[1]
    el.style.transition = ''
    el.style.transform = 'translate(' + dx + ', ' + dy + 'px)'
    setTimeout(function () {
        setTransition(props, el)
        el.style.transform = 'translate(0,0)'
        setTimeout(function () {
            el.style.transform = ''
            el.style.transition = ''
        }, props.time)
    }, 0)        
})

var _moveOnCreate = txmethod('oncreate', function (props, el) {
    setTimeout(function () {
        trackMoves(el)
    }, props.ready)
})

var move = function (props) {
    return combine(
        _moveOnCreate(props),
        _moveOnUpdate(props)
    )
} 

function combine() {
    var a, b
    var ts = Array.prototype.slice.call(arguments)
    var l = ts.length
    var a = ts[0]
    if (l === 1) return a
    var b
    if (l > 2) b = combine.apply(null, ts.slice(1))
    else b = ts[1]
    return function (v) { return a(b(v)) }
}

function group(f) {
    return function (vnode) {
        vnode.children.forEach(f)
        return vnode
    }
}


module.exports = {
    change: change,
    enter: enter,
    leave: leave,
    move: move,
    group: group,
    combine: combine,
}