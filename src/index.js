

addEventListener('resize', _ => updateAllTracked())
addEventListener('scroll', _ => updateAllTracked())

const trackingRegistry = []

function removeElement (el) {
    el.parentNode.removeChild(el)
}

function setStyle (el, props) {
    Object.keys(props).forEach(name => {
        el.style[name] = props[name]
    })
}

function registerTracking (el) {
    if (trackingRegistry.indexOf(el) > -1 ) return
    updateTracking(el)
    trackingRegistry.push(el)
}

function unregisterTracking(el) {
    const i = trackingRegistry.indexOf(el)
    if (i === -1) return
    trackingRegistry.splice(i, 1)
}

function updateAllTracked () {
    trackingRegistry.forEach(updateTracking)  
} 

function invertLastMove (el) {
    const ox = el._x
    const oy = el._y
    if (!ox) return `translate(0, 0)`
    const {x, y} = updateTracking(el)   
    return `translate(${Math.floor(ox-x)}px, ${Math.floor(oy-y)}px)`
}

function updateTracking (el) {
    const {top: y, left: x} = el.getBoundingClientRect()
    el._x = x
    el._y = y
    return {x, y}
}

function runTransition (el, props, before, after, ondone) {
    const easing = props.easing || 'linear'
    const time = props.time || 300
        setStyle(el, before)
        //two nested rAF required for it to work in Chrome
        requestAnimationFrame(_ => {
            requestAnimationFrame(_ => {
                setStyle(el, after)
                el.style.transition = `all ${easing} ${time}ms`
                setTimeout(_ => {
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
        Object.keys(css).reduce((o, n) => {
            o[n] = null
            return o
        }, {}),
        _ => updateTracking(el)
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
    const translation = invertLastMove(el)
    css.transform = `${translation}${css.transform && (' ' + css.transform)}`
    runTransition(
        el, props,
        {transform: translation},
        css,
        _ => removeElement(el)
    )
}

function composeHandlers (f1, f2) {
    return function (el) {
        f1 && f1(el)
        f2 && f2(el)
    }
}

function transitionComponent (handlersFn) {
    return function (props, children) {
        const handlers = handlersFn(props || {})
        return children.filter(child => !!child.props).map(child => {
            ['oncreate', 'onupdate', 'onremove'].forEach(n => {
                child.props[n] = composeHandlers(child.props[n], handlers[n])
            })  
            return child
        })
    }
}

const _track = transitionComponent(props => ({
    oncreate: el => registerTracking(el)
}))

const _move = transitionComponent(props => ({
    onupdate: el => runMove(el, props)
}))
const _exit = transitionComponent(props => {
    return {onremove: el => runExit(el, props, props.css || {})}
})

const enter = transitionComponent(props => {
    return {oncreate: el => runEnter(el, props, props.css || {})}
})

const move = (props, children) => _move(props, _track(null, children))

const exit = (props, children) => _exit(props, _track(null, children))

module.exports = {enter, move, exit}
