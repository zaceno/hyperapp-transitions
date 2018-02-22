import {JSDOM} from 'jsdom'
const dom = new JSDOM('<html><head></head><body></body></html>')
global.window = dom.window
global.document = dom.window.document
global.addEventListener = dom.window.addEventListener
global.requestAnimationFrame = fn => setTimeout(fn, 0)

import test from 'ava'
import {h, app} from 'hyperapp'
const {Enter, Exit, Move} = require('../dist/transitions.js')

function createContainer () {
    const el = document.createElement('div')
    document.body.appendChild(el)
    return el
}

test.cb('Enter', t => {
    const el = createContainer()
    app({}, {}, _ => h('main', {}, [
        Enter({css:{prop:'foo'}, time: 100, easing: 'bar', delay: 100}, [
            h('div', {id: 'target'}, ['foo'])
        ])
    ]), el)
    setTimeout(_ => {
        setTimeout(_ => {
            t.is(el.querySelector('#target').style.prop, 'foo')
            t.falsy(el.querySelector('#target').style.transition)
            setTimeout(_ => {
                t.falsy(el.querySelector('#target').style.prop)
                t.is(el.querySelector('#target').style.transition, 'all bar 100ms')
                setTimeout(_ => {
                    t.falsy(el.querySelector('#target').style.transition)
                    t.falsy(el.querySelector('#target').style.prop)
                    t.end()
                }, 100)    
            }, 100)    
        }, 50)    
    }, 0)
})

test.cb('Enter - deferred css', t => {
    const el = createContainer()
    app({}, {}, _ => h('main', {}, [
        Enter({css:_ => ({prop: 'foo'})}, [
            h('div', {id: 'target'}, ['foo'])
        ])
    ]), el)
    setTimeout(_ => {
        setTimeout(_ => {
            t.is(el.querySelector('#target').style.prop, 'foo')
            t.end()
        }, 0)    
    }, 0)
})



test.cb('Exit', t => {
    const el = createContainer()
    const {toggle} = app(
        {show: true},
        {toggle: _ => ({show: false})},
        (state, actions) => h('main', {}, [
            state.show && Exit({
                css: {prop: 'foo'},
                easing: 'bar',
                time: 100,
                delay: 100
            }, [
                h('div', {id: 'target'}, ['foo'])
            ])
        ]),
        el
    )
    //render once
    setTimeout(_ => {
        toggle() //make element go away
        //render again
        setTimeout(_ => {
            t.falsy(el.querySelector('#target').style.prop)
            t.falsy(el.querySelector('#target').style.transition)
            setTimeout(_ => {
                t.is(el.querySelector('#target').style.prop, 'foo')
                t.is(el.querySelector('#target').style.transition, 'all bar 100ms')
                setTimeout(_ => {
                    t.falsy(el.querySelector('#target'))
                    t.end()
                }, 150)
            }, 100)
        }, 50)
    }, 0)
})



test.cb('Exit - deferred css', t => {
    const el = createContainer()
    const {toggle} = app(
        {show: true},
        {toggle: _ => ({show: false})},
        (state, actions) => h('main', {}, [
            state.show && Exit({
                css: _ => ({prop: 'foo'}),
                easing: 'bar',
                time: 100,
                delay: 100
            }, [
                h('div', {id: 'target'}, ['foo'])
            ])
        ]),
        el
    )
    //render once
    setTimeout(_ => {
        toggle() //make element go away
        setTimeout(_ => {
            t.is(el.querySelector('#target').style.prop, 'foo')
            t.end()
        }, 200)
    }, 0)
})


test.cb('Exit - keep: true', t => {
    const el = createContainer()
    const {toggle} = app(
        {show: true},
        {toggle: _ => ({show: false})},
        (state, actions) => h('main', {}, [
            state.show && Exit({
                css: {prop: 'foo'},
                time: 100,
                keep: true,
            }, [
                h('div', {id: 'target'}, ['foo'])
            ])
        ]),
        el
    )
    //render once
    setTimeout(_ => {
        toggle() //make element go away
        //render again
        setTimeout(_ => {
            t.truthy(el.querySelector('#target'))
            t.end()
        }, 150)
    }, 0)
})

test.cb('Move', t => {
    const el = createContainer()
    const {toggle} = app(
        {order: true},
        {toggle: _ => ({order: false})},
        (state, actions) => h('main', {}, Move({
            time: 200,
            easing: 'bar'
        }, (state.order
            ? [
                h('p', {key: 'first', id: 'first'}, []),
                h('p', {key: 'second', id: 'second'}, []),
            ]
            : [
                h('p', {key: 'second', id: 'second'}, []),
                h('p', {key: 'first', id: 'first'}, []),
            ]
        ))),
        el
    )
    setTimeout(_ => {
        toggle()
        setTimeout(_ => {
            t.is(el.querySelector('#first').style.transition, 'all bar 200ms')
            t.is(el.querySelector('#second').style.transition, 'all bar 200ms')
            setTimeout(_ => {
                t.falsy(el.querySelector('#first').style.transition)
                t.falsy(el.querySelector('#second').style.transition)
                t.end()
            }, 150)
        }, 100)
    }, 0)
})