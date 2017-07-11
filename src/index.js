

const DEFAULTS = {
  name: '',
  time: 0,
  delay: 0,
  ready: 0,
  easing: '',
  last: true,
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
    const handler = (...args) => f(propsFn(), ...args)
    return function (vnode) {
      const origHandler = vnode.data[name] || (_ => {})
      vnode.data[name] = (...args) => {
        origHandler(...args)
        handler(...args)
      }
      return vnode
    }
  }
}

function trackMoves (el) {
    const prevX = el.getAttribute('data-t-x')
    const prevY = el.getAttribute('data-t-y')
    const {left: newX, top: newY} = el.getBoundingClientRect()
    el.setAttribute('data-t-x', newX)
    el.setAttribute('data-t-y', newY)
    if (!prevX) return [null, null]
    return [prevX - newX, prevY - newY]
}

const _leaveOnRemove = txmethod('onremove', (props, el, remove) => {
    const [dx, dy] = trackMoves(el)
    el.style.transition = ''
    el.style.position = 'relative'
    el.style.top = dy + 'px'
    el.style.left = dx + 'px'
    setTimeout(_ => {
      el.classList.add(`${props.name}-leave`)
      setTransition(props, el)
      setTimeout(_ => {
        if (props.last) remove()
      }, props.time)
    }, props.delay)
})

const _leaveOnCreate = txmethod('oncreate', (props, el) => setTimeout(_ => trackMoves(el), props.ready))

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
    el.style.transition = `all ${props.easing} ${props.time}ms`
    el.style.transform = 'translate(0,0)'
    setTimeout(_ => {
      el.style.transform = ''
      el.style.transition = ''
    }, props.time)
  })        
})

const _moveOnCreate = txmethod('oncreate', (props, el) => setTimeout(_ => trackMoves(el), props.ready))

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
    enter,
    leave,
    change,
    move,
    combine,
    group
}