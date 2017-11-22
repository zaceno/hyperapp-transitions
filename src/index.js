const DEFAULTS = {
    name: '',
    time: 0,
    delay: 0,
    ready: 0,
    easing: '',
    last: true,
}

addEventListener('scroll', _ => autoTracking.update())
addEventListener('resize', _ => autoTracking.update())
const autoTracking = {
    elems: [],
    track: el => autoTracking.elems.push(el),
    untrack: el => {
        const i = autoTracking.elems.indexOf(el)
        if (i === -1) return
        autoTracking.elems.splice(i, 1)
    },
    update: _ => autoTracking.elems.forEach(trackMoves)
}


function trackMoves (el) {
    const prevX = +el.getAttribute('data-t-x')
    const prevY = +el.getAttribute('data-t-y')
    const {left: newX, top: newY} = el.getBoundingClientRect()
    el.setAttribute('data-t-x', newX)
    el.setAttribute('data-t-y', newY)
    if (!prevX) return [null, null]
    return [prevX - newX, prevY - newY]
}



function removeElement (el) {
    autoTracking.untrack(el)
    if (!el.parentNode) return
    el.parentNode.removeChild(el)
}

function setTransition (props, el) {
    el.style.transition = `all ${props.easing} ${props.time}ms`
}

function props2Fn(props) {
    return _ => {
        var props2 = (typeof props === 'function') ? props() : props
        return Object.assign({}, DEFAULTS, props2)
    }
}

function txmethod (name, f) {
    return function (props) {
        const propsFn = props2Fn(props)
        const handler = el => f(propsFn(), el)
        return function (vnode) {
            if (!vnode || !vnode.props) return
            const origHandler = vnode.props[name] || (_ => {})
            vnode.props[name] = (...args) => {
                origHandler(...args)
                handler(...args)
                return () => {} //hack to make onremove let me remove elements myself
            }
            return vnode
        }
    }
}

const _leaveOnRemove = txmethod('onremove', (props, el) => {
    const cls = `${props.name}-leave`

    //first we need to capture any transforms the
    //leave class will apply
    el.style.transition = ''
    el.style.transform = ''
    el.classList.add(cls)
    const willTransform = getComputedStyle(el).getPropertyValue('transform')
    const [sx, wx, wy, sy, tx, ty] = (willTransform === 'none')
        ? [1, 0, 0, 1, 0, 0]
        : willTransform.match(/^matrix\(([^\)]*)\)$/)[1].split(', ').map(s => +s);
    el.classList.remove(cls)

    //and set the plain translation:
    const [dx, dy] = trackMoves(el)
    el.style.transform = `translate(${dx}px, ${dy}px)`
    
    //after the specified delay, apply the transition
    setTimeout(_ => {
        el.classList.add(cls)
        //override the transition props
        el.style.transform = `matrix(${sx}, ${wx}, ${wy}, ${sy}, ${tx + dx}, ${ty + dy})`
        setTransition(props, el)
        //after the delay, if last, remove:
        if (props.last) setTimeout(_ => removeElement(el), props.time)
    }, props.delay)
})

const _leaveOnCreate = txmethod('oncreate', (props, el) => {
  autoTracking.track(el)
  setTimeout(_ => trackMoves(el), props.ready)
})

const leave = props => combine(
    _leaveOnCreate(props),
    _leaveOnRemove(props)
)

const enter = txmethod('oncreate', (props, el) => {
    const clsEnter = `${props.name}-enter`
    el.classList.add(clsEnter)
    setTimeout(_ => {
        setTransition(props, el)
        el.classList.remove(clsEnter)
    }, props.delay)
})

const change = txmethod('oncreate', (props, el) => setTransition(props, el))

const _moveOnUpdate = txmethod('onupdate', (props, el) => {
    const [dx, dy] = trackMoves(el)
    el.style.transition = ''
    el.style.transform = `translate(${dx}px, ${dy}px)`
    setTimeout(_ => {
        setTransition(props, el)
        el.style.transform = 'translate(0,0)'
        setTimeout(_ => {
            el.style.transform = ''
            el.style.transition = ''
        }, props.time)
    })        
})

const _moveOnCreate = txmethod('oncreate', (props, el) => {
  autoTracking.track(el)
  setTimeout(_ => trackMoves(el), props.ready)
})

const move = props => combine(
    _moveOnCreate(props),
    _moveOnUpdate(props)
)

function combine(...args) {
    var a, b
    const ts = [...args]
    const l = ts.length
    var a = ts[0]
    if (l === 1) return a
    var b
    if (l > 2) b = combine(...ts.slice(1))
    else b = ts[1]
    return v => a(b(v))
}

function group(f) {
    return vnode => {
        vnode.children.forEach(f)
        return vnode
    }
}



module.exports = {
    change,
    enter,
    leave,
    move,
    group,
    combine
}