function handler(prop, fn) {
    return function (view) {
        const orig = view.data[prop]
        view.data[prop] = function (el, remove) {
            orig && orig(el)
            fn(el, remove)
        }
        return view
    }
}

function enter(fn, time, delay) {
    if (time) return enter(_ => ({name: fn, time, delay}))
    if (typeof fn !== 'function') return enter(_=>fn)
    return handler('oncreate', function (el) {
        const {name, time, delay} = fn()
        const enterClass = name + '-enter'
        const runClass = name + '-run'
        el.classList.add(enterClass)
        setTimeout(_ => {
            el.classList.add(runClass)
            el.classList.remove(enterClass)
            setTimeout(_ => {
                el.classList.remove(runClass)
            }, time)
        }, delay || 0)
    })
}

function leave(fn, time, delay) {
    if (time) return leave(_ => ({name: fn, time, delay}))
    if (typeof fn !== 'function') return leave(_=>fn)
    return handler('onremove', function (el, remove) {
        const {name, time, delay} = fn()
        const leaveClass = name + '-leave'
        const runClass = name + '-run'
        setTimeout(_ => {
            el.classList.add(runClass)
            el.classList.add(leaveClass)
            setTimeout(function () {
                el.classList.remove(runClass)
                remove()
            }, time)
        }, delay || 0)
    })
}

function change(fn) {
    if (typeof fn !== 'function') return change(_=>fn)
    return function (view) {
        const name = fn()
        view.data.class += ' ' + name + '-run'
        return view
    }
}

function both (name, time, delay) {
    const a = enter(name, time, delay)
    const b = leave(name, time, delay)
    return v => a(b(v))
}

function moves (fn, time) {
    if (!fn)  return moves(_ => ({easing: '', time: 300}))
    if (time) return moves(_ => ({easing: fn, time}))
    if (typeof fn !== 'function') return moves(_ => fn)
    return handler('onupdate', function (el) {
        const {easing, time} = fn()
        Array.from(el.childNodes).forEach(child => {
            const {left: aX, top: aY} = child.getBoundingClientRect()
            requestAnimationFrame(_ => {
                const {left: bX, top: bY} = child.getBoundingClientRect()
                child.style.transform = `translate(${aX-bX}px, ${aY-bY}px)`
                setTimeout(_ => {
                    child.style.transition = `all ${easing} ${time}ms`
                    child.style.transform = ''
                    setTimeout(_ => {
                        child.style.transition = ''
                    }, time)
                }, 0)
            }, 0)
        })
    })
}

module.exports = {
    enter,
    leave,
    both,
    change,
    moves,
}