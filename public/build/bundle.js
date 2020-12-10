
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.4' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

    function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

    /*!
     * GSAP 3.5.1
     * https://greensock.com
     *
     * @license Copyright 2008-2020, GreenSock. All rights reserved.
     * Subject to the terms at https://greensock.com/standard-license or for
     * Club GreenSock members, the agreement issued with that membership.
     * @author: Jack Doyle, jack@greensock.com
    */

    /* eslint-disable */
    var _config = {
      autoSleep: 120,
      force3D: "auto",
      nullTargetWarn: 1,
      units: {
        lineHeight: ""
      }
    },
        _defaults = {
      duration: .5,
      overwrite: false,
      delay: 0
    },
        _bigNum = 1e8,
        _tinyNum = 1 / _bigNum,
        _2PI = Math.PI * 2,
        _HALF_PI = _2PI / 4,
        _gsID = 0,
        _sqrt = Math.sqrt,
        _cos = Math.cos,
        _sin = Math.sin,
        _isString = function _isString(value) {
      return typeof value === "string";
    },
        _isFunction = function _isFunction(value) {
      return typeof value === "function";
    },
        _isNumber = function _isNumber(value) {
      return typeof value === "number";
    },
        _isUndefined = function _isUndefined(value) {
      return typeof value === "undefined";
    },
        _isObject = function _isObject(value) {
      return typeof value === "object";
    },
        _isNotFalse = function _isNotFalse(value) {
      return value !== false;
    },
        _windowExists = function _windowExists() {
      return typeof window !== "undefined";
    },
        _isFuncOrString = function _isFuncOrString(value) {
      return _isFunction(value) || _isString(value);
    },
        _isTypedArray = typeof ArrayBuffer === "function" && ArrayBuffer.isView || function () {},
        // note: IE10 has ArrayBuffer, but NOT ArrayBuffer.isView().
    _isArray = Array.isArray,
        _strictNumExp = /(?:-?\.?\d|\.)+/gi,
        //only numbers (including negatives and decimals) but NOT relative values.
    _numExp = /[-+=.]*\d+[.e\-+]*\d*[e\-\+]*\d*/g,
        //finds any numbers, including ones that start with += or -=, negative numbers, and ones in scientific notation like 1e-8.
    _numWithUnitExp = /[-+=.]*\d+[.e-]*\d*[a-z%]*/g,
        _complexStringNumExp = /[-+=.]*\d+(?:\.|e-|e)*\d*/gi,
        //duplicate so that while we're looping through matches from exec(), it doesn't contaminate the lastIndex of _numExp which we use to search for colors too.
    _relExp = /[+-]=-?[\.\d]+/,
        _delimitedValueExp = /[#\-+.]*\b[a-z\d-=+%.]+/gi,
        _globalTimeline,
        _win,
        _coreInitted,
        _doc,
        _globals = {},
        _installScope = {},
        _coreReady,
        _install = function _install(scope) {
      return (_installScope = _merge(scope, _globals)) && gsap;
    },
        _missingPlugin = function _missingPlugin(property, value) {
      return console.warn("Invalid property", property, "set to", value, "Missing plugin? gsap.registerPlugin()");
    },
        _warn = function _warn(message, suppress) {
      return !suppress && console.warn(message);
    },
        _addGlobal = function _addGlobal(name, obj) {
      return name && (_globals[name] = obj) && _installScope && (_installScope[name] = obj) || _globals;
    },
        _emptyFunc = function _emptyFunc() {
      return 0;
    },
        _reservedProps = {},
        _lazyTweens = [],
        _lazyLookup = {},
        _lastRenderedFrame,
        _plugins = {},
        _effects = {},
        _nextGCFrame = 30,
        _harnessPlugins = [],
        _callbackNames = "",
        _harness = function _harness(targets) {
      var target = targets[0],
          harnessPlugin,
          i;
      _isObject(target) || _isFunction(target) || (targets = [targets]);

      if (!(harnessPlugin = (target._gsap || {}).harness)) {
        i = _harnessPlugins.length;

        while (i-- && !_harnessPlugins[i].targetTest(target)) {}

        harnessPlugin = _harnessPlugins[i];
      }

      i = targets.length;

      while (i--) {
        targets[i] && (targets[i]._gsap || (targets[i]._gsap = new GSCache(targets[i], harnessPlugin))) || targets.splice(i, 1);
      }

      return targets;
    },
        _getCache = function _getCache(target) {
      return target._gsap || _harness(toArray(target))[0]._gsap;
    },
        _getProperty = function _getProperty(target, property, v) {
      return (v = target[property]) && _isFunction(v) ? target[property]() : _isUndefined(v) && target.getAttribute && target.getAttribute(property) || v;
    },
        _forEachName = function _forEachName(names, func) {
      return (names = names.split(",")).forEach(func) || names;
    },
        //split a comma-delimited list of names into an array, then run a forEach() function and return the split array (this is just a way to consolidate/shorten some code).
    _round = function _round(value) {
      return Math.round(value * 100000) / 100000 || 0;
    },
        _arrayContainsAny = function _arrayContainsAny(toSearch, toFind) {
      //searches one array to find matches for any of the items in the toFind array. As soon as one is found, it returns true. It does NOT return all the matches; it's simply a boolean search.
      var l = toFind.length,
          i = 0;

      for (; toSearch.indexOf(toFind[i]) < 0 && ++i < l;) {}

      return i < l;
    },
        _parseVars = function _parseVars(params, type, parent) {
      //reads the arguments passed to one of the key methods and figures out if the user is defining things with the OLD/legacy syntax where the duration is the 2nd parameter, and then it adjusts things accordingly and spits back the corrected vars object (with the duration added if necessary, as well as runBackwards or startAt or immediateRender). type 0 = to()/staggerTo(), 1 = from()/staggerFrom(), 2 = fromTo()/staggerFromTo()
      var isLegacy = _isNumber(params[1]),
          varsIndex = (isLegacy ? 2 : 1) + (type < 2 ? 0 : 1),
          vars = params[varsIndex],
          irVars;

      isLegacy && (vars.duration = params[1]);
      vars.parent = parent;

      if (type) {
        irVars = vars;

        while (parent && !("immediateRender" in irVars)) {
          // inheritance hasn't happened yet, but someone may have set a default in an ancestor timeline. We could do vars.immediateRender = _isNotFalse(_inheritDefaults(vars).immediateRender) but that'd exact a slight performance penalty because _inheritDefaults() also runs in the Tween constructor. We're paying a small kb price here to gain speed.
          irVars = parent.vars.defaults || {};
          parent = _isNotFalse(parent.vars.inherit) && parent.parent;
        }

        vars.immediateRender = _isNotFalse(irVars.immediateRender);
        type < 2 ? vars.runBackwards = 1 : vars.startAt = params[varsIndex - 1]; // "from" vars
      }

      return vars;
    },
        _lazyRender = function _lazyRender() {
      var l = _lazyTweens.length,
          a = _lazyTweens.slice(0),
          i,
          tween;

      _lazyLookup = {};
      _lazyTweens.length = 0;

      for (i = 0; i < l; i++) {
        tween = a[i];
        tween && tween._lazy && (tween.render(tween._lazy[0], tween._lazy[1], true)._lazy = 0);
      }
    },
        _lazySafeRender = function _lazySafeRender(animation, time, suppressEvents, force) {
      _lazyTweens.length && _lazyRender();
      animation.render(time, suppressEvents, force);
      _lazyTweens.length && _lazyRender(); //in case rendering caused any tweens to lazy-init, we should render them because typically when someone calls seek() or time() or progress(), they expect an immediate render.
    },
        _numericIfPossible = function _numericIfPossible(value) {
      var n = parseFloat(value);
      return (n || n === 0) && (value + "").match(_delimitedValueExp).length < 2 ? n : _isString(value) ? value.trim() : value;
    },
        _passThrough = function _passThrough(p) {
      return p;
    },
        _setDefaults = function _setDefaults(obj, defaults) {
      for (var p in defaults) {
        p in obj || (obj[p] = defaults[p]);
      }

      return obj;
    },
        _setKeyframeDefaults = function _setKeyframeDefaults(obj, defaults) {
      for (var p in defaults) {
        p in obj || p === "duration" || p === "ease" || (obj[p] = defaults[p]);
      }
    },
        _merge = function _merge(base, toMerge) {
      for (var p in toMerge) {
        base[p] = toMerge[p];
      }

      return base;
    },
        _mergeDeep = function _mergeDeep(base, toMerge) {
      for (var p in toMerge) {
        base[p] = _isObject(toMerge[p]) ? _mergeDeep(base[p] || (base[p] = {}), toMerge[p]) : toMerge[p];
      }

      return base;
    },
        _copyExcluding = function _copyExcluding(obj, excluding) {
      var copy = {},
          p;

      for (p in obj) {
        p in excluding || (copy[p] = obj[p]);
      }

      return copy;
    },
        _inheritDefaults = function _inheritDefaults(vars) {
      var parent = vars.parent || _globalTimeline,
          func = vars.keyframes ? _setKeyframeDefaults : _setDefaults;

      if (_isNotFalse(vars.inherit)) {
        while (parent) {
          func(vars, parent.vars.defaults);
          parent = parent.parent || parent._dp;
        }
      }

      return vars;
    },
        _arraysMatch = function _arraysMatch(a1, a2) {
      var i = a1.length,
          match = i === a2.length;

      while (match && i-- && a1[i] === a2[i]) {}

      return i < 0;
    },
        _addLinkedListItem = function _addLinkedListItem(parent, child, firstProp, lastProp, sortBy) {
      if (firstProp === void 0) {
        firstProp = "_first";
      }

      if (lastProp === void 0) {
        lastProp = "_last";
      }

      var prev = parent[lastProp],
          t;

      if (sortBy) {
        t = child[sortBy];

        while (prev && prev[sortBy] > t) {
          prev = prev._prev;
        }
      }

      if (prev) {
        child._next = prev._next;
        prev._next = child;
      } else {
        child._next = parent[firstProp];
        parent[firstProp] = child;
      }

      if (child._next) {
        child._next._prev = child;
      } else {
        parent[lastProp] = child;
      }

      child._prev = prev;
      child.parent = child._dp = parent;
      return child;
    },
        _removeLinkedListItem = function _removeLinkedListItem(parent, child, firstProp, lastProp) {
      if (firstProp === void 0) {
        firstProp = "_first";
      }

      if (lastProp === void 0) {
        lastProp = "_last";
      }

      var prev = child._prev,
          next = child._next;

      if (prev) {
        prev._next = next;
      } else if (parent[firstProp] === child) {
        parent[firstProp] = next;
      }

      if (next) {
        next._prev = prev;
      } else if (parent[lastProp] === child) {
        parent[lastProp] = prev;
      }

      child._next = child._prev = child.parent = null; // don't delete the _dp just so we can revert if necessary. But parent should be null to indicate the item isn't in a linked list.
    },
        _removeFromParent = function _removeFromParent(child, onlyIfParentHasAutoRemove) {
      child.parent && (!onlyIfParentHasAutoRemove || child.parent.autoRemoveChildren) && child.parent.remove(child);
      child._act = 0;
    },
        _uncache = function _uncache(animation, child) {
      if (animation && (!child || child._end > animation._dur || child._start < 0)) {
        // performance optimization: if a child animation is passed in we should only uncache if that child EXTENDS the animation (its end time is beyond the end)
        var a = animation;

        while (a) {
          a._dirty = 1;
          a = a.parent;
        }
      }

      return animation;
    },
        _recacheAncestors = function _recacheAncestors(animation) {
      var parent = animation.parent;

      while (parent && parent.parent) {
        //sometimes we must force a re-sort of all children and update the duration/totalDuration of all ancestor timelines immediately in case, for example, in the middle of a render loop, one tween alters another tween's timeScale which shoves its startTime before 0, forcing the parent timeline to shift around and shiftChildren() which could affect that next tween's render (startTime). Doesn't matter for the root timeline though.
        parent._dirty = 1;
        parent.totalDuration();
        parent = parent.parent;
      }

      return animation;
    },
        _hasNoPausedAncestors = function _hasNoPausedAncestors(animation) {
      return !animation || animation._ts && _hasNoPausedAncestors(animation.parent);
    },
        _elapsedCycleDuration = function _elapsedCycleDuration(animation) {
      return animation._repeat ? _animationCycle(animation._tTime, animation = animation.duration() + animation._rDelay) * animation : 0;
    },
        // feed in the totalTime and cycleDuration and it'll return the cycle (iteration minus 1) and if the playhead is exactly at the very END, it will NOT bump up to the next cycle.
    _animationCycle = function _animationCycle(tTime, cycleDuration) {
      return (tTime /= cycleDuration) && ~~tTime === tTime ? ~~tTime - 1 : ~~tTime;
    },
        _parentToChildTotalTime = function _parentToChildTotalTime(parentTime, child) {
      return (parentTime - child._start) * child._ts + (child._ts >= 0 ? 0 : child._dirty ? child.totalDuration() : child._tDur);
    },
        _setEnd = function _setEnd(animation) {
      return animation._end = _round(animation._start + (animation._tDur / Math.abs(animation._ts || animation._rts || _tinyNum) || 0));
    },
        _alignPlayhead = function _alignPlayhead(animation, totalTime) {
      // adjusts the animation's _start and _end according to the provided totalTime (only if the parent's smoothChildTiming is true and the animation isn't paused). It doesn't do any rendering or forcing things back into parent timelines, etc. - that's what totalTime() is for.
      var parent = animation._dp;

      if (parent && parent.smoothChildTiming && animation._ts) {
        animation._start = _round(animation._dp._time - (animation._ts > 0 ? totalTime / animation._ts : ((animation._dirty ? animation.totalDuration() : animation._tDur) - totalTime) / -animation._ts));

        _setEnd(animation);

        parent._dirty || _uncache(parent, animation); //for performance improvement. If the parent's cache is already dirty, it already took care of marking the ancestors as dirty too, so skip the function call here.
      }

      return animation;
    },

    /*
    _totalTimeToTime = (clampedTotalTime, duration, repeat, repeatDelay, yoyo) => {
    	let cycleDuration = duration + repeatDelay,
    		time = _round(clampedTotalTime % cycleDuration);
    	if (time > duration) {
    		time = duration;
    	}
    	return (yoyo && (~~(clampedTotalTime / cycleDuration) & 1)) ? duration - time : time;
    },
    */
    _postAddChecks = function _postAddChecks(timeline, child) {
      var t;

      if (child._time || child._initted && !child._dur) {
        //in case, for example, the _start is moved on a tween that has already rendered. Imagine it's at its end state, then the startTime is moved WAY later (after the end of this timeline), it should render at its beginning.
        t = _parentToChildTotalTime(timeline.rawTime(), child);

        if (!child._dur || _clamp(0, child.totalDuration(), t) - child._tTime > _tinyNum) {
          child.render(t, true);
        }
      } //if the timeline has already ended but the inserted tween/timeline extends the duration, we should enable this timeline again so that it renders properly. We should also align the playhead with the parent timeline's when appropriate.


      if (_uncache(timeline, child)._dp && timeline._initted && timeline._time >= timeline._dur && timeline._ts) {
        //in case any of the ancestors had completed but should now be enabled...
        if (timeline._dur < timeline.duration()) {
          t = timeline;

          while (t._dp) {
            t.rawTime() >= 0 && t.totalTime(t._tTime); //moves the timeline (shifts its startTime) if necessary, and also enables it. If it's currently zero, though, it may not be scheduled to render until later so there's no need to force it to align with the current playhead position. Only move to catch up with the playhead.

            t = t._dp;
          }
        }

        timeline._zTime = -_tinyNum; // helps ensure that the next render() will be forced (crossingStart = true in render()), even if the duration hasn't changed (we're adding a child which would need to get rendered). Definitely an edge case. Note: we MUST do this AFTER the loop above where the totalTime() might trigger a render() because this _addToTimeline() method gets called from the Animation constructor, BEFORE tweens even record their targets, etc. so we wouldn't want things to get triggered in the wrong order.
      }
    },
        _addToTimeline = function _addToTimeline(timeline, child, position, skipChecks) {
      child.parent && _removeFromParent(child);
      child._start = _round(position + child._delay);
      child._end = _round(child._start + (child.totalDuration() / Math.abs(child.timeScale()) || 0));

      _addLinkedListItem(timeline, child, "_first", "_last", timeline._sort ? "_start" : 0);

      timeline._recent = child;
      skipChecks || _postAddChecks(timeline, child);
      return timeline;
    },
        _scrollTrigger = function _scrollTrigger(animation, trigger) {
      return (_globals.ScrollTrigger || _missingPlugin("scrollTrigger", trigger)) && _globals.ScrollTrigger.create(trigger, animation);
    },
        _attemptInitTween = function _attemptInitTween(tween, totalTime, force, suppressEvents) {
      _initTween(tween, totalTime);

      if (!tween._initted) {
        return 1;
      }

      if (!force && tween._pt && (tween._dur && tween.vars.lazy !== false || !tween._dur && tween.vars.lazy) && _lastRenderedFrame !== _ticker.frame) {
        _lazyTweens.push(tween);

        tween._lazy = [totalTime, suppressEvents];
        return 1;
      }
    },
        _renderZeroDurationTween = function _renderZeroDurationTween(tween, totalTime, suppressEvents, force) {
      var prevRatio = tween.ratio,
          ratio = totalTime < 0 || !totalTime && prevRatio && !tween._start && tween._zTime > _tinyNum && !tween._dp._lock || (tween._ts < 0 || tween._dp._ts < 0) && tween.data !== "isFromStart" && tween.data !== "isStart" ? 0 : 1,
          // check parent's _lock because when a timeline repeats/yoyos and does its artificial wrapping, we shouldn't force the ratio back to 0. Also, if the tween or its parent is reversed and the totalTime is 0, we should go to a ratio of 0.
      repeatDelay = tween._rDelay,
          tTime = 0,
          pt,
          iteration,
          prevIteration;

      if (repeatDelay && tween._repeat) {
        // in case there's a zero-duration tween that has a repeat with a repeatDelay
        tTime = _clamp(0, tween._tDur, totalTime);
        iteration = _animationCycle(tTime, repeatDelay);
        prevIteration = _animationCycle(tween._tTime, repeatDelay);

        if (iteration !== prevIteration) {
          prevRatio = 1 - ratio;
          tween.vars.repeatRefresh && tween._initted && tween.invalidate();
        }
      }

      if (ratio !== prevRatio || force || tween._zTime === _tinyNum || !totalTime && tween._zTime) {
        if (!tween._initted && _attemptInitTween(tween, totalTime, force, suppressEvents)) {
          // if we render the very beginning (time == 0) of a fromTo(), we must force the render (normal tweens wouldn't need to render at a time of 0 when the prevTime was also 0). This is also mandatory to make sure overwriting kicks in immediately.
          return;
        }

        prevIteration = tween._zTime;
        tween._zTime = totalTime || (suppressEvents ? _tinyNum : 0); // when the playhead arrives at EXACTLY time 0 (right on top) of a zero-duration tween, we need to discern if events are suppressed so that when the playhead moves again (next time), it'll trigger the callback. If events are NOT suppressed, obviously the callback would be triggered in this render. Basically, the callback should fire either when the playhead ARRIVES or LEAVES this exact spot, not both. Imagine doing a timeline.seek(0) and there's a callback that sits at 0. Since events are suppressed on that seek() by default, nothing will fire, but when the playhead moves off of that position, the callback should fire. This behavior is what people intuitively expect.

        suppressEvents || (suppressEvents = totalTime && !prevIteration); // if it was rendered previously at exactly 0 (_zTime) and now the playhead is moving away, DON'T fire callbacks otherwise they'll seem like duplicates.

        tween.ratio = ratio;
        tween._from && (ratio = 1 - ratio);
        tween._time = 0;
        tween._tTime = tTime;
        suppressEvents || _callback(tween, "onStart");
        pt = tween._pt;

        while (pt) {
          pt.r(ratio, pt.d);
          pt = pt._next;
        }

        tween._startAt && totalTime < 0 && tween._startAt.render(totalTime, true, true);
        tween._onUpdate && !suppressEvents && _callback(tween, "onUpdate");
        tTime && tween._repeat && !suppressEvents && tween.parent && _callback(tween, "onRepeat");

        if ((totalTime >= tween._tDur || totalTime < 0) && tween.ratio === ratio) {
          ratio && _removeFromParent(tween, 1);

          if (!suppressEvents) {
            _callback(tween, ratio ? "onComplete" : "onReverseComplete", true);

            tween._prom && tween._prom();
          }
        }
      } else if (!tween._zTime) {
        tween._zTime = totalTime;
      }
    },
        _findNextPauseTween = function _findNextPauseTween(animation, prevTime, time) {
      var child;

      if (time > prevTime) {
        child = animation._first;

        while (child && child._start <= time) {
          if (!child._dur && child.data === "isPause" && child._start > prevTime) {
            return child;
          }

          child = child._next;
        }
      } else {
        child = animation._last;

        while (child && child._start >= time) {
          if (!child._dur && child.data === "isPause" && child._start < prevTime) {
            return child;
          }

          child = child._prev;
        }
      }
    },
        _setDuration = function _setDuration(animation, duration, skipUncache, leavePlayhead) {
      var repeat = animation._repeat,
          dur = _round(duration) || 0,
          totalProgress = animation._tTime / animation._tDur;
      totalProgress && !leavePlayhead && (animation._time *= dur / animation._dur);
      animation._dur = dur;
      animation._tDur = !repeat ? dur : repeat < 0 ? 1e10 : _round(dur * (repeat + 1) + animation._rDelay * repeat);
      totalProgress && !leavePlayhead ? _alignPlayhead(animation, animation._tTime = animation._tDur * totalProgress) : animation.parent && _setEnd(animation);
      skipUncache || _uncache(animation.parent, animation);
      return animation;
    },
        _onUpdateTotalDuration = function _onUpdateTotalDuration(animation) {
      return animation instanceof Timeline ? _uncache(animation) : _setDuration(animation, animation._dur);
    },
        _zeroPosition = {
      _start: 0,
      endTime: _emptyFunc
    },
        _parsePosition = function _parsePosition(animation, position) {
      var labels = animation.labels,
          recent = animation._recent || _zeroPosition,
          clippedDuration = animation.duration() >= _bigNum ? recent.endTime(false) : animation._dur,
          //in case there's a child that infinitely repeats, users almost never intend for the insertion point of a new child to be based on a SUPER long value like that so we clip it and assume the most recently-added child's endTime should be used instead.
      i,
          offset;

      if (_isString(position) && (isNaN(position) || position in labels)) {
        //if the string is a number like "1", check to see if there's a label with that name, otherwise interpret it as a number (absolute value).
        i = position.charAt(0);

        if (i === "<" || i === ">") {
          return (i === "<" ? recent._start : recent.endTime(recent._repeat >= 0)) + (parseFloat(position.substr(1)) || 0);
        }

        i = position.indexOf("=");

        if (i < 0) {
          position in labels || (labels[position] = clippedDuration);
          return labels[position];
        }

        offset = +(position.charAt(i - 1) + position.substr(i + 1));
        return i > 1 ? _parsePosition(animation, position.substr(0, i - 1)) + offset : clippedDuration + offset;
      }

      return position == null ? clippedDuration : +position;
    },
        _conditionalReturn = function _conditionalReturn(value, func) {
      return value || value === 0 ? func(value) : func;
    },
        _clamp = function _clamp(min, max, value) {
      return value < min ? min : value > max ? max : value;
    },
        getUnit = function getUnit(value) {
      return (value = (value + "").substr((parseFloat(value) + "").length)) && isNaN(value) ? value : "";
    },
        // note: protect against padded numbers as strings, like "100.100". That shouldn't return "00" as the unit. If it's numeric, return no unit.
    clamp = function clamp(min, max, value) {
      return _conditionalReturn(value, function (v) {
        return _clamp(min, max, v);
      });
    },
        _slice = [].slice,
        _isArrayLike = function _isArrayLike(value, nonEmpty) {
      return value && _isObject(value) && "length" in value && (!nonEmpty && !value.length || value.length - 1 in value && _isObject(value[0])) && !value.nodeType && value !== _win;
    },
        _flatten = function _flatten(ar, leaveStrings, accumulator) {
      if (accumulator === void 0) {
        accumulator = [];
      }

      return ar.forEach(function (value) {
        var _accumulator;

        return _isString(value) && !leaveStrings || _isArrayLike(value, 1) ? (_accumulator = accumulator).push.apply(_accumulator, toArray(value)) : accumulator.push(value);
      }) || accumulator;
    },
        //takes any value and returns an array. If it's a string (and leaveStrings isn't true), it'll use document.querySelectorAll() and convert that to an array. It'll also accept iterables like jQuery objects.
    toArray = function toArray(value, leaveStrings) {
      return _isString(value) && !leaveStrings && (_coreInitted || !_wake()) ? _slice.call(_doc.querySelectorAll(value), 0) : _isArray(value) ? _flatten(value, leaveStrings) : _isArrayLike(value) ? _slice.call(value, 0) : value ? [value] : [];
    },
        shuffle = function shuffle(a) {
      return a.sort(function () {
        return .5 - Math.random();
      });
    },
        // alternative that's a bit faster and more reliably diverse but bigger:   for (let j, v, i = a.length; i; j = Math.floor(Math.random() * i), v = a[--i], a[i] = a[j], a[j] = v); return a;
    //for distributing values across an array. Can accept a number, a function or (most commonly) a function which can contain the following properties: {base, amount, from, ease, grid, axis, length, each}. Returns a function that expects the following parameters: index, target, array. Recognizes the following
    distribute = function distribute(v) {
      if (_isFunction(v)) {
        return v;
      }

      var vars = _isObject(v) ? v : {
        each: v
      },
          //n:1 is just to indicate v was a number; we leverage that later to set v according to the length we get. If a number is passed in, we treat it like the old stagger value where 0.1, for example, would mean that things would be distributed with 0.1 between each element in the array rather than a total "amount" that's chunked out among them all.
      ease = _parseEase(vars.ease),
          from = vars.from || 0,
          base = parseFloat(vars.base) || 0,
          cache = {},
          isDecimal = from > 0 && from < 1,
          ratios = isNaN(from) || isDecimal,
          axis = vars.axis,
          ratioX = from,
          ratioY = from;

      if (_isString(from)) {
        ratioX = ratioY = {
          center: .5,
          edges: .5,
          end: 1
        }[from] || 0;
      } else if (!isDecimal && ratios) {
        ratioX = from[0];
        ratioY = from[1];
      }

      return function (i, target, a) {
        var l = (a || vars).length,
            distances = cache[l],
            originX,
            originY,
            x,
            y,
            d,
            j,
            max,
            min,
            wrapAt;

        if (!distances) {
          wrapAt = vars.grid === "auto" ? 0 : (vars.grid || [1, _bigNum])[1];

          if (!wrapAt) {
            max = -_bigNum;

            while (max < (max = a[wrapAt++].getBoundingClientRect().left) && wrapAt < l) {}

            wrapAt--;
          }

          distances = cache[l] = [];
          originX = ratios ? Math.min(wrapAt, l) * ratioX - .5 : from % wrapAt;
          originY = ratios ? l * ratioY / wrapAt - .5 : from / wrapAt | 0;
          max = 0;
          min = _bigNum;

          for (j = 0; j < l; j++) {
            x = j % wrapAt - originX;
            y = originY - (j / wrapAt | 0);
            distances[j] = d = !axis ? _sqrt(x * x + y * y) : Math.abs(axis === "y" ? y : x);
            d > max && (max = d);
            d < min && (min = d);
          }

          from === "random" && shuffle(distances);
          distances.max = max - min;
          distances.min = min;
          distances.v = l = (parseFloat(vars.amount) || parseFloat(vars.each) * (wrapAt > l ? l - 1 : !axis ? Math.max(wrapAt, l / wrapAt) : axis === "y" ? l / wrapAt : wrapAt) || 0) * (from === "edges" ? -1 : 1);
          distances.b = l < 0 ? base - l : base;
          distances.u = getUnit(vars.amount || vars.each) || 0; //unit

          ease = ease && l < 0 ? _invertEase(ease) : ease;
        }

        l = (distances[i] - distances.min) / distances.max || 0;
        return _round(distances.b + (ease ? ease(l) : l) * distances.v) + distances.u; //round in order to work around floating point errors
      };
    },
        _roundModifier = function _roundModifier(v) {
      //pass in 0.1 get a function that'll round to the nearest tenth, or 5 to round to the closest 5, or 0.001 to the closest 1000th, etc.
      var p = v < 1 ? Math.pow(10, (v + "").length - 2) : 1; //to avoid floating point math errors (like 24 * 0.1 == 2.4000000000000004), we chop off at a specific number of decimal places (much faster than toFixed()

      return function (raw) {
        return Math.floor(Math.round(parseFloat(raw) / v) * v * p) / p + (_isNumber(raw) ? 0 : getUnit(raw));
      };
    },
        snap = function snap(snapTo, value) {
      var isArray = _isArray(snapTo),
          radius,
          is2D;

      if (!isArray && _isObject(snapTo)) {
        radius = isArray = snapTo.radius || _bigNum;

        if (snapTo.values) {
          snapTo = toArray(snapTo.values);

          if (is2D = !_isNumber(snapTo[0])) {
            radius *= radius; //performance optimization so we don't have to Math.sqrt() in the loop.
          }
        } else {
          snapTo = _roundModifier(snapTo.increment);
        }
      }

      return _conditionalReturn(value, !isArray ? _roundModifier(snapTo) : _isFunction(snapTo) ? function (raw) {
        is2D = snapTo(raw);
        return Math.abs(is2D - raw) <= radius ? is2D : raw;
      } : function (raw) {
        var x = parseFloat(is2D ? raw.x : raw),
            y = parseFloat(is2D ? raw.y : 0),
            min = _bigNum,
            closest = 0,
            i = snapTo.length,
            dx,
            dy;

        while (i--) {
          if (is2D) {
            dx = snapTo[i].x - x;
            dy = snapTo[i].y - y;
            dx = dx * dx + dy * dy;
          } else {
            dx = Math.abs(snapTo[i] - x);
          }

          if (dx < min) {
            min = dx;
            closest = i;
          }
        }

        closest = !radius || min <= radius ? snapTo[closest] : raw;
        return is2D || closest === raw || _isNumber(raw) ? closest : closest + getUnit(raw);
      });
    },
        random = function random(min, max, roundingIncrement, returnFunction) {
      return _conditionalReturn(_isArray(min) ? !max : roundingIncrement === true ? !!(roundingIncrement = 0) : !returnFunction, function () {
        return _isArray(min) ? min[~~(Math.random() * min.length)] : (roundingIncrement = roundingIncrement || 1e-5) && (returnFunction = roundingIncrement < 1 ? Math.pow(10, (roundingIncrement + "").length - 2) : 1) && Math.floor(Math.round((min + Math.random() * (max - min)) / roundingIncrement) * roundingIncrement * returnFunction) / returnFunction;
      });
    },
        pipe = function pipe() {
      for (var _len = arguments.length, functions = new Array(_len), _key = 0; _key < _len; _key++) {
        functions[_key] = arguments[_key];
      }

      return function (value) {
        return functions.reduce(function (v, f) {
          return f(v);
        }, value);
      };
    },
        unitize = function unitize(func, unit) {
      return function (value) {
        return func(parseFloat(value)) + (unit || getUnit(value));
      };
    },
        normalize = function normalize(min, max, value) {
      return mapRange(min, max, 0, 1, value);
    },
        _wrapArray = function _wrapArray(a, wrapper, value) {
      return _conditionalReturn(value, function (index) {
        return a[~~wrapper(index)];
      });
    },
        wrap = function wrap(min, max, value) {
      // NOTE: wrap() CANNOT be an arrow function! A very odd compiling bug causes problems (unrelated to GSAP).
      var range = max - min;
      return _isArray(min) ? _wrapArray(min, wrap(0, min.length), max) : _conditionalReturn(value, function (value) {
        return (range + (value - min) % range) % range + min;
      });
    },
        wrapYoyo = function wrapYoyo(min, max, value) {
      var range = max - min,
          total = range * 2;
      return _isArray(min) ? _wrapArray(min, wrapYoyo(0, min.length - 1), max) : _conditionalReturn(value, function (value) {
        value = (total + (value - min) % total) % total || 0;
        return min + (value > range ? total - value : value);
      });
    },
        _replaceRandom = function _replaceRandom(value) {
      //replaces all occurrences of random(...) in a string with the calculated random value. can be a range like random(-100, 100, 5) or an array like random([0, 100, 500])
      var prev = 0,
          s = "",
          i,
          nums,
          end,
          isArray;

      while (~(i = value.indexOf("random(", prev))) {
        end = value.indexOf(")", i);
        isArray = value.charAt(i + 7) === "[";
        nums = value.substr(i + 7, end - i - 7).match(isArray ? _delimitedValueExp : _strictNumExp);
        s += value.substr(prev, i - prev) + random(isArray ? nums : +nums[0], isArray ? 0 : +nums[1], +nums[2] || 1e-5);
        prev = end + 1;
      }

      return s + value.substr(prev, value.length - prev);
    },
        mapRange = function mapRange(inMin, inMax, outMin, outMax, value) {
      var inRange = inMax - inMin,
          outRange = outMax - outMin;
      return _conditionalReturn(value, function (value) {
        return outMin + ((value - inMin) / inRange * outRange || 0);
      });
    },
        interpolate = function interpolate(start, end, progress, mutate) {
      var func = isNaN(start + end) ? 0 : function (p) {
        return (1 - p) * start + p * end;
      };

      if (!func) {
        var isString = _isString(start),
            master = {},
            p,
            i,
            interpolators,
            l,
            il;

        progress === true && (mutate = 1) && (progress = null);

        if (isString) {
          start = {
            p: start
          };
          end = {
            p: end
          };
        } else if (_isArray(start) && !_isArray(end)) {
          interpolators = [];
          l = start.length;
          il = l - 2;

          for (i = 1; i < l; i++) {
            interpolators.push(interpolate(start[i - 1], start[i])); //build the interpolators up front as a performance optimization so that when the function is called many times, it can just reuse them.
          }

          l--;

          func = function func(p) {
            p *= l;
            var i = Math.min(il, ~~p);
            return interpolators[i](p - i);
          };

          progress = end;
        } else if (!mutate) {
          start = _merge(_isArray(start) ? [] : {}, start);
        }

        if (!interpolators) {
          for (p in end) {
            _addPropTween.call(master, start, p, "get", end[p]);
          }

          func = function func(p) {
            return _renderPropTweens(p, master) || (isString ? start.p : start);
          };
        }
      }

      return _conditionalReturn(progress, func);
    },
        _getLabelInDirection = function _getLabelInDirection(timeline, fromTime, backward) {
      //used for nextLabel() and previousLabel()
      var labels = timeline.labels,
          min = _bigNum,
          p,
          distance,
          label;

      for (p in labels) {
        distance = labels[p] - fromTime;

        if (distance < 0 === !!backward && distance && min > (distance = Math.abs(distance))) {
          label = p;
          min = distance;
        }
      }

      return label;
    },
        _callback = function _callback(animation, type, executeLazyFirst) {
      var v = animation.vars,
          callback = v[type],
          params,
          scope;

      if (!callback) {
        return;
      }

      params = v[type + "Params"];
      scope = v.callbackScope || animation;
      executeLazyFirst && _lazyTweens.length && _lazyRender(); //in case rendering caused any tweens to lazy-init, we should render them because typically when a timeline finishes, users expect things to have rendered fully. Imagine an onUpdate on a timeline that reports/checks tweened values.

      return params ? callback.apply(scope, params) : callback.call(scope);
    },
        _interrupt = function _interrupt(animation) {
      _removeFromParent(animation);

      animation.progress() < 1 && _callback(animation, "onInterrupt");
      return animation;
    },
        _quickTween,
        _createPlugin = function _createPlugin(config) {
      config = !config.name && config["default"] || config; //UMD packaging wraps things oddly, so for example MotionPathHelper becomes {MotionPathHelper:MotionPathHelper, default:MotionPathHelper}.

      var name = config.name,
          isFunc = _isFunction(config),
          Plugin = name && !isFunc && config.init ? function () {
        this._props = [];
      } : config,
          //in case someone passes in an object that's not a plugin, like CustomEase
      instanceDefaults = {
        init: _emptyFunc,
        render: _renderPropTweens,
        add: _addPropTween,
        kill: _killPropTweensOf,
        modifier: _addPluginModifier,
        rawVars: 0
      },
          statics = {
        targetTest: 0,
        get: 0,
        getSetter: _getSetter,
        aliases: {},
        register: 0
      };

      _wake();

      if (config !== Plugin) {
        if (_plugins[name]) {
          return;
        }

        _setDefaults(Plugin, _setDefaults(_copyExcluding(config, instanceDefaults), statics)); //static methods


        _merge(Plugin.prototype, _merge(instanceDefaults, _copyExcluding(config, statics))); //instance methods


        _plugins[Plugin.prop = name] = Plugin;

        if (config.targetTest) {
          _harnessPlugins.push(Plugin);

          _reservedProps[name] = 1;
        }

        name = (name === "css" ? "CSS" : name.charAt(0).toUpperCase() + name.substr(1)) + "Plugin"; //for the global name. "motionPath" should become MotionPathPlugin
      }

      _addGlobal(name, Plugin);

      config.register && config.register(gsap, Plugin, PropTween);
    },

    /*
     * --------------------------------------------------------------------------------------
     * COLORS
     * --------------------------------------------------------------------------------------
     */
    _255 = 255,
        _colorLookup = {
      aqua: [0, _255, _255],
      lime: [0, _255, 0],
      silver: [192, 192, 192],
      black: [0, 0, 0],
      maroon: [128, 0, 0],
      teal: [0, 128, 128],
      blue: [0, 0, _255],
      navy: [0, 0, 128],
      white: [_255, _255, _255],
      olive: [128, 128, 0],
      yellow: [_255, _255, 0],
      orange: [_255, 165, 0],
      gray: [128, 128, 128],
      purple: [128, 0, 128],
      green: [0, 128, 0],
      red: [_255, 0, 0],
      pink: [_255, 192, 203],
      cyan: [0, _255, _255],
      transparent: [_255, _255, _255, 0]
    },
        _hue = function _hue(h, m1, m2) {
      h = h < 0 ? h + 1 : h > 1 ? h - 1 : h;
      return (h * 6 < 1 ? m1 + (m2 - m1) * h * 6 : h < .5 ? m2 : h * 3 < 2 ? m1 + (m2 - m1) * (2 / 3 - h) * 6 : m1) * _255 + .5 | 0;
    },
        splitColor = function splitColor(v, toHSL, forceAlpha) {
      var a = !v ? _colorLookup.black : _isNumber(v) ? [v >> 16, v >> 8 & _255, v & _255] : 0,
          r,
          g,
          b,
          h,
          s,
          l,
          max,
          min,
          d,
          wasHSL;

      if (!a) {
        if (v.substr(-1) === ",") {
          //sometimes a trailing comma is included and we should chop it off (typically from a comma-delimited list of values like a textShadow:"2px 2px 2px blue, 5px 5px 5px rgb(255,0,0)" - in this example "blue," has a trailing comma. We could strip it out inside parseComplex() but we'd need to do it to the beginning and ending values plus it wouldn't provide protection from other potential scenarios like if the user passes in a similar value.
          v = v.substr(0, v.length - 1);
        }

        if (_colorLookup[v]) {
          a = _colorLookup[v];
        } else if (v.charAt(0) === "#") {
          if (v.length === 4) {
            //for shorthand like #9F0
            r = v.charAt(1);
            g = v.charAt(2);
            b = v.charAt(3);
            v = "#" + r + r + g + g + b + b;
          }

          v = parseInt(v.substr(1), 16);
          a = [v >> 16, v >> 8 & _255, v & _255];
        } else if (v.substr(0, 3) === "hsl") {
          a = wasHSL = v.match(_strictNumExp);

          if (!toHSL) {
            h = +a[0] % 360 / 360;
            s = +a[1] / 100;
            l = +a[2] / 100;
            g = l <= .5 ? l * (s + 1) : l + s - l * s;
            r = l * 2 - g;
            a.length > 3 && (a[3] *= 1); //cast as number

            a[0] = _hue(h + 1 / 3, r, g);
            a[1] = _hue(h, r, g);
            a[2] = _hue(h - 1 / 3, r, g);
          } else if (~v.indexOf("=")) {
            //if relative values are found, just return the raw strings with the relative prefixes in place.
            a = v.match(_numExp);
            forceAlpha && a.length < 4 && (a[3] = 1);
            return a;
          }
        } else {
          a = v.match(_strictNumExp) || _colorLookup.transparent;
        }

        a = a.map(Number);
      }

      if (toHSL && !wasHSL) {
        r = a[0] / _255;
        g = a[1] / _255;
        b = a[2] / _255;
        max = Math.max(r, g, b);
        min = Math.min(r, g, b);
        l = (max + min) / 2;

        if (max === min) {
          h = s = 0;
        } else {
          d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
          h *= 60;
        }

        a[0] = ~~(h + .5);
        a[1] = ~~(s * 100 + .5);
        a[2] = ~~(l * 100 + .5);
      }

      forceAlpha && a.length < 4 && (a[3] = 1);
      return a;
    },
        _colorOrderData = function _colorOrderData(v) {
      // strips out the colors from the string, finds all the numeric slots (with units) and returns an array of those. The Array also has a "c" property which is an Array of the index values where the colors belong. This is to help work around issues where there's a mis-matched order of color/numeric data like drop-shadow(#f00 0px 1px 2px) and drop-shadow(0x 1px 2px #f00). This is basically a helper function used in _formatColors()
      var values = [],
          c = [],
          i = -1;
      v.split(_colorExp).forEach(function (v) {
        var a = v.match(_numWithUnitExp) || [];
        values.push.apply(values, a);
        c.push(i += a.length + 1);
      });
      values.c = c;
      return values;
    },
        _formatColors = function _formatColors(s, toHSL, orderMatchData) {
      var result = "",
          colors = (s + result).match(_colorExp),
          type = toHSL ? "hsla(" : "rgba(",
          i = 0,
          c,
          shell,
          d,
          l;

      if (!colors) {
        return s;
      }

      colors = colors.map(function (color) {
        return (color = splitColor(color, toHSL, 1)) && type + (toHSL ? color[0] + "," + color[1] + "%," + color[2] + "%," + color[3] : color.join(",")) + ")";
      });

      if (orderMatchData) {
        d = _colorOrderData(s);
        c = orderMatchData.c;

        if (c.join(result) !== d.c.join(result)) {
          shell = s.replace(_colorExp, "1").split(_numWithUnitExp);
          l = shell.length - 1;

          for (; i < l; i++) {
            result += shell[i] + (~c.indexOf(i) ? colors.shift() || type + "0,0,0,0)" : (d.length ? d : colors.length ? colors : orderMatchData).shift());
          }
        }
      }

      if (!shell) {
        shell = s.split(_colorExp);
        l = shell.length - 1;

        for (; i < l; i++) {
          result += shell[i] + colors[i];
        }
      }

      return result + shell[l];
    },
        _colorExp = function () {
      var s = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3}){1,2}\\b",
          //we'll dynamically build this Regular Expression to conserve file size. After building it, it will be able to find rgb(), rgba(), # (hexadecimal), and named color values like red, blue, purple, etc.,
      p;

      for (p in _colorLookup) {
        s += "|" + p + "\\b";
      }

      return new RegExp(s + ")", "gi");
    }(),
        _hslExp = /hsl[a]?\(/,
        _colorStringFilter = function _colorStringFilter(a) {
      var combined = a.join(" "),
          toHSL;
      _colorExp.lastIndex = 0;

      if (_colorExp.test(combined)) {
        toHSL = _hslExp.test(combined);
        a[1] = _formatColors(a[1], toHSL);
        a[0] = _formatColors(a[0], toHSL, _colorOrderData(a[1])); // make sure the order of numbers/colors match with the END value.

        return true;
      }
    },

    /*
     * --------------------------------------------------------------------------------------
     * TICKER
     * --------------------------------------------------------------------------------------
     */
    _tickerActive,
        _ticker = function () {
      var _getTime = Date.now,
          _lagThreshold = 500,
          _adjustedLag = 33,
          _startTime = _getTime(),
          _lastUpdate = _startTime,
          _gap = 1000 / 240,
          _nextTime = _gap,
          _listeners = [],
          _id,
          _req,
          _raf,
          _self,
          _delta,
          _i,
          _tick = function _tick(v) {
        var elapsed = _getTime() - _lastUpdate,
            manual = v === true,
            overlap,
            dispatch,
            time,
            frame;

        elapsed > _lagThreshold && (_startTime += elapsed - _adjustedLag);
        _lastUpdate += elapsed;
        time = _lastUpdate - _startTime;
        overlap = time - _nextTime;

        if (overlap > 0 || manual) {
          frame = ++_self.frame;
          _delta = time - _self.time * 1000;
          _self.time = time = time / 1000;
          _nextTime += overlap + (overlap >= _gap ? 4 : _gap - overlap);
          dispatch = 1;
        }

        manual || (_id = _req(_tick)); //make sure the request is made before we dispatch the "tick" event so that timing is maintained. Otherwise, if processing the "tick" requires a bunch of time (like 15ms) and we're using a setTimeout() that's based on 16.7ms, it'd technically take 31.7ms between frames otherwise.

        if (dispatch) {
          for (_i = 0; _i < _listeners.length; _i++) {
            // use _i and check _listeners.length instead of a variable because a listener could get removed during the loop, and if that happens to an element less than the current index, it'd throw things off in the loop.
            _listeners[_i](time, _delta, frame, v);
          }
        }
      };

      _self = {
        time: 0,
        frame: 0,
        tick: function tick() {
          _tick(true);
        },
        deltaRatio: function deltaRatio(fps) {
          return _delta / (1000 / (fps || 60));
        },
        wake: function wake() {
          if (_coreReady) {
            if (!_coreInitted && _windowExists()) {
              _win = _coreInitted = window;
              _doc = _win.document || {};
              _globals.gsap = gsap;
              (_win.gsapVersions || (_win.gsapVersions = [])).push(gsap.version);

              _install(_installScope || _win.GreenSockGlobals || !_win.gsap && _win || {});

              _raf = _win.requestAnimationFrame;
            }

            _id && _self.sleep();

            _req = _raf || function (f) {
              return setTimeout(f, _nextTime - _self.time * 1000 + 1 | 0);
            };

            _tickerActive = 1;

            _tick(2);
          }
        },
        sleep: function sleep() {
          (_raf ? _win.cancelAnimationFrame : clearTimeout)(_id);
          _tickerActive = 0;
          _req = _emptyFunc;
        },
        lagSmoothing: function lagSmoothing(threshold, adjustedLag) {
          _lagThreshold = threshold || 1 / _tinyNum; //zero should be interpreted as basically unlimited

          _adjustedLag = Math.min(adjustedLag, _lagThreshold, 0);
        },
        fps: function fps(_fps) {
          _gap = 1000 / (_fps || 240);
          _nextTime = _self.time * 1000 + _gap;
        },
        add: function add(callback) {
          _listeners.indexOf(callback) < 0 && _listeners.push(callback);

          _wake();
        },
        remove: function remove(callback) {
          var i;
          ~(i = _listeners.indexOf(callback)) && _listeners.splice(i, 1) && _i >= i && _i--;
        },
        _listeners: _listeners
      };
      return _self;
    }(),
        _wake = function _wake() {
      return !_tickerActive && _ticker.wake();
    },
        //also ensures the core classes are initialized.

    /*
    * -------------------------------------------------
    * EASING
    * -------------------------------------------------
    */
    _easeMap = {},
        _customEaseExp = /^[\d.\-M][\d.\-,\s]/,
        _quotesExp = /["']/g,
        _parseObjectInString = function _parseObjectInString(value) {
      //takes a string like "{wiggles:10, type:anticipate})" and turns it into a real object. Notice it ends in ")" and includes the {} wrappers. This is because we only use this function for parsing ease configs and prioritized optimization rather than reusability.
      var obj = {},
          split = value.substr(1, value.length - 3).split(":"),
          key = split[0],
          i = 1,
          l = split.length,
          index,
          val,
          parsedVal;

      for (; i < l; i++) {
        val = split[i];
        index = i !== l - 1 ? val.lastIndexOf(",") : val.length;
        parsedVal = val.substr(0, index);
        obj[key] = isNaN(parsedVal) ? parsedVal.replace(_quotesExp, "").trim() : +parsedVal;
        key = val.substr(index + 1).trim();
      }

      return obj;
    },
        _valueInParentheses = function _valueInParentheses(value) {
      var open = value.indexOf("(") + 1,
          close = value.indexOf(")"),
          nested = value.indexOf("(", open);
      return value.substring(open, ~nested && nested < close ? value.indexOf(")", close + 1) : close);
    },
        _configEaseFromString = function _configEaseFromString(name) {
      //name can be a string like "elastic.out(1,0.5)", and pass in _easeMap as obj and it'll parse it out and call the actual function like _easeMap.Elastic.easeOut.config(1,0.5). It will also parse custom ease strings as long as CustomEase is loaded and registered (internally as _easeMap._CE).
      var split = (name + "").split("("),
          ease = _easeMap[split[0]];
      return ease && split.length > 1 && ease.config ? ease.config.apply(null, ~name.indexOf("{") ? [_parseObjectInString(split[1])] : _valueInParentheses(name).split(",").map(_numericIfPossible)) : _easeMap._CE && _customEaseExp.test(name) ? _easeMap._CE("", name) : ease;
    },
        _invertEase = function _invertEase(ease) {
      return function (p) {
        return 1 - ease(1 - p);
      };
    },
        // allow yoyoEase to be set in children and have those affected when the parent/ancestor timeline yoyos.
    _propagateYoyoEase = function _propagateYoyoEase(timeline, isYoyo) {
      var child = timeline._first,
          ease;

      while (child) {
        if (child instanceof Timeline) {
          _propagateYoyoEase(child, isYoyo);
        } else if (child.vars.yoyoEase && (!child._yoyo || !child._repeat) && child._yoyo !== isYoyo) {
          if (child.timeline) {
            _propagateYoyoEase(child.timeline, isYoyo);
          } else {
            ease = child._ease;
            child._ease = child._yEase;
            child._yEase = ease;
            child._yoyo = isYoyo;
          }
        }

        child = child._next;
      }
    },
        _parseEase = function _parseEase(ease, defaultEase) {
      return !ease ? defaultEase : (_isFunction(ease) ? ease : _easeMap[ease] || _configEaseFromString(ease)) || defaultEase;
    },
        _insertEase = function _insertEase(names, easeIn, easeOut, easeInOut) {
      if (easeOut === void 0) {
        easeOut = function easeOut(p) {
          return 1 - easeIn(1 - p);
        };
      }

      if (easeInOut === void 0) {
        easeInOut = function easeInOut(p) {
          return p < .5 ? easeIn(p * 2) / 2 : 1 - easeIn((1 - p) * 2) / 2;
        };
      }

      var ease = {
        easeIn: easeIn,
        easeOut: easeOut,
        easeInOut: easeInOut
      },
          lowercaseName;

      _forEachName(names, function (name) {
        _easeMap[name] = _globals[name] = ease;
        _easeMap[lowercaseName = name.toLowerCase()] = easeOut;

        for (var p in ease) {
          _easeMap[lowercaseName + (p === "easeIn" ? ".in" : p === "easeOut" ? ".out" : ".inOut")] = _easeMap[name + "." + p] = ease[p];
        }
      });

      return ease;
    },
        _easeInOutFromOut = function _easeInOutFromOut(easeOut) {
      return function (p) {
        return p < .5 ? (1 - easeOut(1 - p * 2)) / 2 : .5 + easeOut((p - .5) * 2) / 2;
      };
    },
        _configElastic = function _configElastic(type, amplitude, period) {
      var p1 = amplitude >= 1 ? amplitude : 1,
          //note: if amplitude is < 1, we simply adjust the period for a more natural feel. Otherwise the math doesn't work right and the curve starts at 1.
      p2 = (period || (type ? .3 : .45)) / (amplitude < 1 ? amplitude : 1),
          p3 = p2 / _2PI * (Math.asin(1 / p1) || 0),
          easeOut = function easeOut(p) {
        return p === 1 ? 1 : p1 * Math.pow(2, -10 * p) * _sin((p - p3) * p2) + 1;
      },
          ease = type === "out" ? easeOut : type === "in" ? function (p) {
        return 1 - easeOut(1 - p);
      } : _easeInOutFromOut(easeOut);

      p2 = _2PI / p2; //precalculate to optimize

      ease.config = function (amplitude, period) {
        return _configElastic(type, amplitude, period);
      };

      return ease;
    },
        _configBack = function _configBack(type, overshoot) {
      if (overshoot === void 0) {
        overshoot = 1.70158;
      }

      var easeOut = function easeOut(p) {
        return p ? --p * p * ((overshoot + 1) * p + overshoot) + 1 : 0;
      },
          ease = type === "out" ? easeOut : type === "in" ? function (p) {
        return 1 - easeOut(1 - p);
      } : _easeInOutFromOut(easeOut);

      ease.config = function (overshoot) {
        return _configBack(type, overshoot);
      };

      return ease;
    }; // a cheaper (kb and cpu) but more mild way to get a parameterized weighted ease by feeding in a value between -1 (easeIn) and 1 (easeOut) where 0 is linear.
    // _weightedEase = ratio => {
    // 	let y = 0.5 + ratio / 2;
    // 	return p => (2 * (1 - p) * p * y + p * p);
    // },
    // a stronger (but more expensive kb/cpu) parameterized weighted ease that lets you feed in a value between -1 (easeIn) and 1 (easeOut) where 0 is linear.
    // _weightedEaseStrong = ratio => {
    // 	ratio = .5 + ratio / 2;
    // 	let o = 1 / 3 * (ratio < .5 ? ratio : 1 - ratio),
    // 		b = ratio - o,
    // 		c = ratio + o;
    // 	return p => p === 1 ? p : 3 * b * (1 - p) * (1 - p) * p + 3 * c * (1 - p) * p * p + p * p * p;
    // };


    _forEachName("Linear,Quad,Cubic,Quart,Quint,Strong", function (name, i) {
      var power = i < 5 ? i + 1 : i;

      _insertEase(name + ",Power" + (power - 1), i ? function (p) {
        return Math.pow(p, power);
      } : function (p) {
        return p;
      }, function (p) {
        return 1 - Math.pow(1 - p, power);
      }, function (p) {
        return p < .5 ? Math.pow(p * 2, power) / 2 : 1 - Math.pow((1 - p) * 2, power) / 2;
      });
    });

    _easeMap.Linear.easeNone = _easeMap.none = _easeMap.Linear.easeIn;

    _insertEase("Elastic", _configElastic("in"), _configElastic("out"), _configElastic());

    (function (n, c) {
      var n1 = 1 / c,
          n2 = 2 * n1,
          n3 = 2.5 * n1,
          easeOut = function easeOut(p) {
        return p < n1 ? n * p * p : p < n2 ? n * Math.pow(p - 1.5 / c, 2) + .75 : p < n3 ? n * (p -= 2.25 / c) * p + .9375 : n * Math.pow(p - 2.625 / c, 2) + .984375;
      };

      _insertEase("Bounce", function (p) {
        return 1 - easeOut(1 - p);
      }, easeOut);
    })(7.5625, 2.75);

    _insertEase("Expo", function (p) {
      return p ? Math.pow(2, 10 * (p - 1)) : 0;
    });

    _insertEase("Circ", function (p) {
      return -(_sqrt(1 - p * p) - 1);
    });

    _insertEase("Sine", function (p) {
      return p === 1 ? 1 : -_cos(p * _HALF_PI) + 1;
    });

    _insertEase("Back", _configBack("in"), _configBack("out"), _configBack());

    _easeMap.SteppedEase = _easeMap.steps = _globals.SteppedEase = {
      config: function config(steps, immediateStart) {
        if (steps === void 0) {
          steps = 1;
        }

        var p1 = 1 / steps,
            p2 = steps + (immediateStart ? 0 : 1),
            p3 = immediateStart ? 1 : 0,
            max = 1 - _tinyNum;
        return function (p) {
          return ((p2 * _clamp(0, max, p) | 0) + p3) * p1;
        };
      }
    };
    _defaults.ease = _easeMap["quad.out"];

    _forEachName("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt", function (name) {
      return _callbackNames += name + "," + name + "Params,";
    });
    /*
     * --------------------------------------------------------------------------------------
     * CACHE
     * --------------------------------------------------------------------------------------
     */


    var GSCache = function GSCache(target, harness) {
      this.id = _gsID++;
      target._gsap = this;
      this.target = target;
      this.harness = harness;
      this.get = harness ? harness.get : _getProperty;
      this.set = harness ? harness.getSetter : _getSetter;
    };
    /*
     * --------------------------------------------------------------------------------------
     * ANIMATION
     * --------------------------------------------------------------------------------------
     */

    var Animation = /*#__PURE__*/function () {
      function Animation(vars, time) {
        var parent = vars.parent || _globalTimeline;
        this.vars = vars;
        this._delay = +vars.delay || 0;

        if (this._repeat = vars.repeat || 0) {
          this._rDelay = vars.repeatDelay || 0;
          this._yoyo = !!vars.yoyo || !!vars.yoyoEase;
        }

        this._ts = 1;

        _setDuration(this, +vars.duration, 1, 1);

        this.data = vars.data;
        _tickerActive || _ticker.wake();
        parent && _addToTimeline(parent, this, time || time === 0 ? time : parent._time, 1);
        vars.reversed && this.reverse();
        vars.paused && this.paused(true);
      }

      var _proto = Animation.prototype;

      _proto.delay = function delay(value) {
        if (value || value === 0) {
          this.parent && this.parent.smoothChildTiming && this.startTime(this._start + value - this._delay);
          this._delay = value;
          return this;
        }

        return this._delay;
      };

      _proto.duration = function duration(value) {
        return arguments.length ? this.totalDuration(this._repeat > 0 ? value + (value + this._rDelay) * this._repeat : value) : this.totalDuration() && this._dur;
      };

      _proto.totalDuration = function totalDuration(value) {
        if (!arguments.length) {
          return this._tDur;
        }

        this._dirty = 0;
        return _setDuration(this, this._repeat < 0 ? value : (value - this._repeat * this._rDelay) / (this._repeat + 1));
      };

      _proto.totalTime = function totalTime(_totalTime, suppressEvents) {
        _wake();

        if (!arguments.length) {
          return this._tTime;
        }

        var parent = this._dp;

        if (parent && parent.smoothChildTiming && this._ts) {
          _alignPlayhead(this, _totalTime); //in case any of the ancestor timelines had completed but should now be enabled, we should reset their totalTime() which will also ensure that they're lined up properly and enabled. Skip for animations that are on the root (wasteful). Example: a TimelineLite.exportRoot() is performed when there's a paused tween on the root, the export will not complete until that tween is unpaused, but imagine a child gets restarted later, after all [unpaused] tweens have completed. The start of that child would get pushed out, but one of the ancestors may have completed.


          while (parent.parent) {
            if (parent.parent._time !== parent._start + (parent._ts >= 0 ? parent._tTime / parent._ts : (parent.totalDuration() - parent._tTime) / -parent._ts)) {
              parent.totalTime(parent._tTime, true);
            }

            parent = parent.parent;
          }

          if (!this.parent && this._dp.autoRemoveChildren && (this._ts > 0 && _totalTime < this._tDur || this._ts < 0 && _totalTime > 0 || !this._tDur && !_totalTime)) {
            //if the animation doesn't have a parent, put it back into its last parent (recorded as _dp for exactly cases like this). Limit to parents with autoRemoveChildren (like globalTimeline) so that if the user manually removes an animation from a timeline and then alters its playhead, it doesn't get added back in.
            _addToTimeline(this._dp, this, this._start - this._delay);
          }
        }

        if (this._tTime !== _totalTime || !this._dur && !suppressEvents || this._initted && Math.abs(this._zTime) === _tinyNum || !_totalTime && !this._initted && (this.add || this._ptLookup)) {
          // check for _ptLookup on a Tween instance to ensure it has actually finished being instantiated, otherwise if this.reverse() gets called in the Animation constructor, it could trigger a render() here even though the _targets weren't populated, thus when _init() is called there won't be any PropTweens (it'll act like the tween is non-functional)
          this._ts || (this._pTime = _totalTime); // otherwise, if an animation is paused, then the playhead is moved back to zero, then resumed, it'd revert back to the original time at the pause

          _lazySafeRender(this, _totalTime, suppressEvents);
        }

        return this;
      };

      _proto.time = function time(value, suppressEvents) {
        return arguments.length ? this.totalTime(Math.min(this.totalDuration(), value + _elapsedCycleDuration(this)) % this._dur || (value ? this._dur : 0), suppressEvents) : this._time; // note: if the modulus results in 0, the playhead could be exactly at the end or the beginning, and we always defer to the END with a non-zero value, otherwise if you set the time() to the very end (duration()), it would render at the START!
      };

      _proto.totalProgress = function totalProgress(value, suppressEvents) {
        return arguments.length ? this.totalTime(this.totalDuration() * value, suppressEvents) : this.totalDuration() ? Math.min(1, this._tTime / this._tDur) : this.ratio;
      };

      _proto.progress = function progress(value, suppressEvents) {
        return arguments.length ? this.totalTime(this.duration() * (this._yoyo && !(this.iteration() & 1) ? 1 - value : value) + _elapsedCycleDuration(this), suppressEvents) : this.duration() ? Math.min(1, this._time / this._dur) : this.ratio;
      };

      _proto.iteration = function iteration(value, suppressEvents) {
        var cycleDuration = this.duration() + this._rDelay;

        return arguments.length ? this.totalTime(this._time + (value - 1) * cycleDuration, suppressEvents) : this._repeat ? _animationCycle(this._tTime, cycleDuration) + 1 : 1;
      } // potential future addition:
      // isPlayingBackwards() {
      // 	let animation = this,
      // 		orientation = 1; // 1 = forward, -1 = backward
      // 	while (animation) {
      // 		orientation *= animation.reversed() || (animation.repeat() && !(animation.iteration() & 1)) ? -1 : 1;
      // 		animation = animation.parent;
      // 	}
      // 	return orientation < 0;
      // }
      ;

      _proto.timeScale = function timeScale(value) {
        if (!arguments.length) {
          return this._rts === -_tinyNum ? 0 : this._rts; // recorded timeScale. Special case: if someone calls reverse() on an animation with timeScale of 0, we assign it -_tinyNum to remember it's reversed.
        }

        if (this._rts === value) {
          return this;
        }

        var tTime = this.parent && this._ts ? _parentToChildTotalTime(this.parent._time, this) : this._tTime; // make sure to do the parentToChildTotalTime() BEFORE setting the new _ts because the old one must be used in that calculation.
        // prioritize rendering where the parent's playhead lines up instead of this._tTime because there could be a tween that's animating another tween's timeScale in the same rendering loop (same parent), thus if the timeScale tween renders first, it would alter _start BEFORE _tTime was set on that tick (in the rendering loop), effectively freezing it until the timeScale tween finishes.

        this._rts = +value || 0;
        this._ts = this._ps || value === -_tinyNum ? 0 : this._rts; // _ts is the functional timeScale which would be 0 if the animation is paused.

        return _recacheAncestors(this.totalTime(_clamp(-this._delay, this._tDur, tTime), true));
      };

      _proto.paused = function paused(value) {
        if (!arguments.length) {
          return this._ps;
        }

        if (this._ps !== value) {
          this._ps = value;

          if (value) {
            this._pTime = this._tTime || Math.max(-this._delay, this.rawTime()); // if the pause occurs during the delay phase, make sure that's factored in when resuming.

            this._ts = this._act = 0; // _ts is the functional timeScale, so a paused tween would effectively have a timeScale of 0. We record the "real" timeScale as _rts (recorded time scale)
          } else {
            _wake();

            this._ts = this._rts; //only defer to _pTime (pauseTime) if tTime is zero. Remember, someone could pause() an animation, then scrub the playhead and resume(). If the parent doesn't have smoothChildTiming, we render at the rawTime() because the startTime won't get updated.

            this.totalTime(this.parent && !this.parent.smoothChildTiming ? this.rawTime() : this._tTime || this._pTime, this.progress() === 1 && (this._tTime -= _tinyNum) && Math.abs(this._zTime) !== _tinyNum); // edge case: animation.progress(1).pause().play() wouldn't render again because the playhead is already at the end, but the call to totalTime() below will add it back to its parent...and not remove it again (since removing only happens upon rendering at a new time). Offsetting the _tTime slightly is done simply to cause the final render in totalTime() that'll pop it off its timeline (if autoRemoveChildren is true, of course). Check to make sure _zTime isn't -_tinyNum to avoid an edge case where the playhead is pushed to the end but INSIDE a tween/callback, the timeline itself is paused thus halting rendering and leaving a few unrendered. When resuming, it wouldn't render those otherwise.
          }
        }

        return this;
      };

      _proto.startTime = function startTime(value) {
        if (arguments.length) {
          this._start = value;
          var parent = this.parent || this._dp;
          parent && (parent._sort || !this.parent) && _addToTimeline(parent, this, value - this._delay);
          return this;
        }

        return this._start;
      };

      _proto.endTime = function endTime(includeRepeats) {
        return this._start + (_isNotFalse(includeRepeats) ? this.totalDuration() : this.duration()) / Math.abs(this._ts);
      };

      _proto.rawTime = function rawTime(wrapRepeats) {
        var parent = this.parent || this._dp; // _dp = detatched parent

        return !parent ? this._tTime : wrapRepeats && (!this._ts || this._repeat && this._time && this.totalProgress() < 1) ? this._tTime % (this._dur + this._rDelay) : !this._ts ? this._tTime : _parentToChildTotalTime(parent.rawTime(wrapRepeats), this);
      };

      _proto.globalTime = function globalTime(rawTime) {
        var animation = this,
            time = arguments.length ? rawTime : animation.rawTime();

        while (animation) {
          time = animation._start + time / (animation._ts || 1);
          animation = animation._dp;
        }

        return time;
      };

      _proto.repeat = function repeat(value) {
        if (arguments.length) {
          this._repeat = value;
          return _onUpdateTotalDuration(this);
        }

        return this._repeat;
      };

      _proto.repeatDelay = function repeatDelay(value) {
        if (arguments.length) {
          this._rDelay = value;
          return _onUpdateTotalDuration(this);
        }

        return this._rDelay;
      };

      _proto.yoyo = function yoyo(value) {
        if (arguments.length) {
          this._yoyo = value;
          return this;
        }

        return this._yoyo;
      };

      _proto.seek = function seek(position, suppressEvents) {
        return this.totalTime(_parsePosition(this, position), _isNotFalse(suppressEvents));
      };

      _proto.restart = function restart(includeDelay, suppressEvents) {
        return this.play().totalTime(includeDelay ? -this._delay : 0, _isNotFalse(suppressEvents));
      };

      _proto.play = function play(from, suppressEvents) {
        from != null && this.seek(from, suppressEvents);
        return this.reversed(false).paused(false);
      };

      _proto.reverse = function reverse(from, suppressEvents) {
        from != null && this.seek(from || this.totalDuration(), suppressEvents);
        return this.reversed(true).paused(false);
      };

      _proto.pause = function pause(atTime, suppressEvents) {
        atTime != null && this.seek(atTime, suppressEvents);
        return this.paused(true);
      };

      _proto.resume = function resume() {
        return this.paused(false);
      };

      _proto.reversed = function reversed(value) {
        if (arguments.length) {
          !!value !== this.reversed() && this.timeScale(-this._rts || (value ? -_tinyNum : 0)); // in case timeScale is zero, reversing would have no effect so we use _tinyNum.

          return this;
        }

        return this._rts < 0;
      };

      _proto.invalidate = function invalidate() {
        this._initted = 0;
        this._zTime = -_tinyNum;
        return this;
      };

      _proto.isActive = function isActive() {
        var parent = this.parent || this._dp,
            start = this._start,
            rawTime;
        return !!(!parent || this._ts && this._initted && parent.isActive() && (rawTime = parent.rawTime(true)) >= start && rawTime < this.endTime(true) - _tinyNum);
      };

      _proto.eventCallback = function eventCallback(type, callback, params) {
        var vars = this.vars;

        if (arguments.length > 1) {
          if (!callback) {
            delete vars[type];
          } else {
            vars[type] = callback;
            params && (vars[type + "Params"] = params);
            type === "onUpdate" && (this._onUpdate = callback);
          }

          return this;
        }

        return vars[type];
      };

      _proto.then = function then(onFulfilled) {
        var self = this;
        return new Promise(function (resolve) {
          var f = _isFunction(onFulfilled) ? onFulfilled : _passThrough,
              _resolve = function _resolve() {
            var _then = self.then;
            self.then = null; // temporarily null the then() method to avoid an infinite loop (see https://github.com/greensock/GSAP/issues/322)

            _isFunction(f) && (f = f(self)) && (f.then || f === self) && (self.then = _then);
            resolve(f);
            self.then = _then;
          };

          if (self._initted && self.totalProgress() === 1 && self._ts >= 0 || !self._tTime && self._ts < 0) {
            _resolve();
          } else {
            self._prom = _resolve;
          }
        });
      };

      _proto.kill = function kill() {
        _interrupt(this);
      };

      return Animation;
    }();

    _setDefaults(Animation.prototype, {
      _time: 0,
      _start: 0,
      _end: 0,
      _tTime: 0,
      _tDur: 0,
      _dirty: 0,
      _repeat: 0,
      _yoyo: false,
      parent: null,
      _initted: false,
      _rDelay: 0,
      _ts: 1,
      _dp: 0,
      ratio: 0,
      _zTime: -_tinyNum,
      _prom: 0,
      _ps: false,
      _rts: 1
    });
    /*
     * -------------------------------------------------
     * TIMELINE
     * -------------------------------------------------
     */


    var Timeline = /*#__PURE__*/function (_Animation) {
      _inheritsLoose(Timeline, _Animation);

      function Timeline(vars, time) {
        var _this;

        if (vars === void 0) {
          vars = {};
        }

        _this = _Animation.call(this, vars, time) || this;
        _this.labels = {};
        _this.smoothChildTiming = !!vars.smoothChildTiming;
        _this.autoRemoveChildren = !!vars.autoRemoveChildren;
        _this._sort = _isNotFalse(vars.sortChildren);
        _this.parent && _postAddChecks(_this.parent, _assertThisInitialized(_this));
        vars.scrollTrigger && _scrollTrigger(_assertThisInitialized(_this), vars.scrollTrigger);
        return _this;
      }

      var _proto2 = Timeline.prototype;

      _proto2.to = function to(targets, vars, position) {
        new Tween(targets, _parseVars(arguments, 0, this), _parsePosition(this, _isNumber(vars) ? arguments[3] : position));
        return this;
      };

      _proto2.from = function from(targets, vars, position) {
        new Tween(targets, _parseVars(arguments, 1, this), _parsePosition(this, _isNumber(vars) ? arguments[3] : position));
        return this;
      };

      _proto2.fromTo = function fromTo(targets, fromVars, toVars, position) {
        new Tween(targets, _parseVars(arguments, 2, this), _parsePosition(this, _isNumber(fromVars) ? arguments[4] : position));
        return this;
      };

      _proto2.set = function set(targets, vars, position) {
        vars.duration = 0;
        vars.parent = this;
        _inheritDefaults(vars).repeatDelay || (vars.repeat = 0);
        vars.immediateRender = !!vars.immediateRender;
        new Tween(targets, vars, _parsePosition(this, position), 1);
        return this;
      };

      _proto2.call = function call(callback, params, position) {
        return _addToTimeline(this, Tween.delayedCall(0, callback, params), _parsePosition(this, position));
      } //ONLY for backward compatibility! Maybe delete?
      ;

      _proto2.staggerTo = function staggerTo(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams) {
        vars.duration = duration;
        vars.stagger = vars.stagger || stagger;
        vars.onComplete = onCompleteAll;
        vars.onCompleteParams = onCompleteAllParams;
        vars.parent = this;
        new Tween(targets, vars, _parsePosition(this, position));
        return this;
      };

      _proto2.staggerFrom = function staggerFrom(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams) {
        vars.runBackwards = 1;
        _inheritDefaults(vars).immediateRender = _isNotFalse(vars.immediateRender);
        return this.staggerTo(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams);
      };

      _proto2.staggerFromTo = function staggerFromTo(targets, duration, fromVars, toVars, stagger, position, onCompleteAll, onCompleteAllParams) {
        toVars.startAt = fromVars;
        _inheritDefaults(toVars).immediateRender = _isNotFalse(toVars.immediateRender);
        return this.staggerTo(targets, duration, toVars, stagger, position, onCompleteAll, onCompleteAllParams);
      };

      _proto2.render = function render(totalTime, suppressEvents, force) {
        var prevTime = this._time,
            tDur = this._dirty ? this.totalDuration() : this._tDur,
            dur = this._dur,
            tTime = this !== _globalTimeline && totalTime > tDur - _tinyNum && totalTime >= 0 ? tDur : totalTime < _tinyNum ? 0 : totalTime,
            crossingStart = this._zTime < 0 !== totalTime < 0 && (this._initted || !dur),
            time,
            child,
            next,
            iteration,
            cycleDuration,
            prevPaused,
            pauseTween,
            timeScale,
            prevStart,
            prevIteration,
            yoyo,
            isYoyo;

        if (tTime !== this._tTime || force || crossingStart) {
          if (prevTime !== this._time && dur) {
            //if totalDuration() finds a child with a negative startTime and smoothChildTiming is true, things get shifted around internally so we need to adjust the time accordingly. For example, if a tween starts at -30 we must shift EVERYTHING forward 30 seconds and move this timeline's startTime backward by 30 seconds so that things align with the playhead (no jump).
            tTime += this._time - prevTime;
            totalTime += this._time - prevTime;
          }

          time = tTime;
          prevStart = this._start;
          timeScale = this._ts;
          prevPaused = !timeScale;

          if (crossingStart) {
            dur || (prevTime = this._zTime); //when the playhead arrives at EXACTLY time 0 (right on top) of a zero-duration timeline, we need to discern if events are suppressed so that when the playhead moves again (next time), it'll trigger the callback. If events are NOT suppressed, obviously the callback would be triggered in this render. Basically, the callback should fire either when the playhead ARRIVES or LEAVES this exact spot, not both. Imagine doing a timeline.seek(0) and there's a callback that sits at 0. Since events are suppressed on that seek() by default, nothing will fire, but when the playhead moves off of that position, the callback should fire. This behavior is what people intuitively expect.

            (totalTime || !suppressEvents) && (this._zTime = totalTime);
          }

          if (this._repeat) {
            //adjust the time for repeats and yoyos
            yoyo = this._yoyo;
            cycleDuration = dur + this._rDelay;
            time = _round(tTime % cycleDuration); //round to avoid floating point errors. (4 % 0.8 should be 0 but some browsers report it as 0.79999999!)

            if (tTime === tDur) {
              // the tDur === tTime is for edge cases where there's a lengthy decimal on the duration and it may reach the very end but the time is rendered as not-quite-there (remember, tDur is rounded to 4 decimals whereas dur isn't)
              iteration = this._repeat;
              time = dur;
            } else {
              iteration = ~~(tTime / cycleDuration);

              if (iteration && iteration === tTime / cycleDuration) {
                time = dur;
                iteration--;
              }

              time > dur && (time = dur);
            }

            prevIteration = _animationCycle(this._tTime, cycleDuration);
            !prevTime && this._tTime && prevIteration !== iteration && (prevIteration = iteration); // edge case - if someone does addPause() at the very beginning of a repeating timeline, that pause is technically at the same spot as the end which causes this._time to get set to 0 when the totalTime would normally place the playhead at the end. See https://greensock.com/forums/topic/23823-closing-nav-animation-not-working-on-ie-and-iphone-6-maybe-other-older-browser/?tab=comments#comment-113005

            if (yoyo && iteration & 1) {
              time = dur - time;
              isYoyo = 1;
            }
            /*
            make sure children at the end/beginning of the timeline are rendered properly. If, for example,
            a 3-second long timeline rendered at 2.9 seconds previously, and now renders at 3.2 seconds (which
            would get translated to 2.8 seconds if the timeline yoyos or 0.2 seconds if it just repeats), there
            could be a callback or a short tween that's at 2.95 or 3 seconds in which wouldn't render. So
            we need to push the timeline to the end (and/or beginning depending on its yoyo value). Also we must
            ensure that zero-duration tweens at the very beginning or end of the Timeline work.
            */


            if (iteration !== prevIteration && !this._lock) {
              var rewinding = yoyo && prevIteration & 1,
                  doesWrap = rewinding === (yoyo && iteration & 1);
              iteration < prevIteration && (rewinding = !rewinding);
              prevTime = rewinding ? 0 : dur;
              this._lock = 1;
              this.render(prevTime || (isYoyo ? 0 : _round(iteration * cycleDuration)), suppressEvents, !dur)._lock = 0;
              !suppressEvents && this.parent && _callback(this, "onRepeat");
              this.vars.repeatRefresh && !isYoyo && (this.invalidate()._lock = 1);

              if (prevTime !== this._time || prevPaused !== !this._ts) {
                return this;
              }

              dur = this._dur; // in case the duration changed in the onRepeat

              tDur = this._tDur;

              if (doesWrap) {
                this._lock = 2;
                prevTime = rewinding ? dur : -0.0001;
                this.render(prevTime, true);
                this.vars.repeatRefresh && !isYoyo && this.invalidate();
              }

              this._lock = 0;

              if (!this._ts && !prevPaused) {
                return this;
              } //in order for yoyoEase to work properly when there's a stagger, we must swap out the ease in each sub-tween.


              _propagateYoyoEase(this, isYoyo);
            }
          }

          if (this._hasPause && !this._forcing && this._lock < 2) {
            pauseTween = _findNextPauseTween(this, _round(prevTime), _round(time));

            if (pauseTween) {
              tTime -= time - (time = pauseTween._start);
            }
          }

          this._tTime = tTime;
          this._time = time;
          this._act = !timeScale; //as long as it's not paused, force it to be active so that if the user renders independent of the parent timeline, it'll be forced to re-render on the next tick.

          if (!this._initted) {
            this._onUpdate = this.vars.onUpdate;
            this._initted = 1;
            this._zTime = totalTime;
          }

          !prevTime && time && !suppressEvents && _callback(this, "onStart");

          if (time >= prevTime && totalTime >= 0) {
            child = this._first;

            while (child) {
              next = child._next;

              if ((child._act || time >= child._start) && child._ts && pauseTween !== child) {
                if (child.parent !== this) {
                  // an extreme edge case - the child's render could do something like kill() the "next" one in the linked list, or reparent it. In that case we must re-initiate the whole render to be safe.
                  return this.render(totalTime, suppressEvents, force);
                }

                child.render(child._ts > 0 ? (time - child._start) * child._ts : (child._dirty ? child.totalDuration() : child._tDur) + (time - child._start) * child._ts, suppressEvents, force);

                if (time !== this._time || !this._ts && !prevPaused) {
                  //in case a tween pauses or seeks the timeline when rendering, like inside of an onUpdate/onComplete
                  pauseTween = 0;
                  next && (tTime += this._zTime = -_tinyNum); // it didn't finish rendering, so flag zTime as negative so that so that the next time render() is called it'll be forced (to render any remaining children)

                  break;
                }
              }

              child = next;
            }
          } else {
            child = this._last;
            var adjustedTime = totalTime < 0 ? totalTime : time; //when the playhead goes backward beyond the start of this timeline, we must pass that information down to the child animations so that zero-duration tweens know whether to render their starting or ending values.

            while (child) {
              next = child._prev;

              if ((child._act || adjustedTime <= child._end) && child._ts && pauseTween !== child) {
                if (child.parent !== this) {
                  // an extreme edge case - the child's render could do something like kill() the "next" one in the linked list, or reparent it. In that case we must re-initiate the whole render to be safe.
                  return this.render(totalTime, suppressEvents, force);
                }

                child.render(child._ts > 0 ? (adjustedTime - child._start) * child._ts : (child._dirty ? child.totalDuration() : child._tDur) + (adjustedTime - child._start) * child._ts, suppressEvents, force);

                if (time !== this._time || !this._ts && !prevPaused) {
                  //in case a tween pauses or seeks the timeline when rendering, like inside of an onUpdate/onComplete
                  pauseTween = 0;
                  next && (tTime += this._zTime = adjustedTime ? -_tinyNum : _tinyNum); // it didn't finish rendering, so adjust zTime so that so that the next time render() is called it'll be forced (to render any remaining children)

                  break;
                }
              }

              child = next;
            }
          }

          if (pauseTween && !suppressEvents) {
            this.pause();
            pauseTween.render(time >= prevTime ? 0 : -_tinyNum)._zTime = time >= prevTime ? 1 : -1;

            if (this._ts) {
              //the callback resumed playback! So since we may have held back the playhead due to where the pause is positioned, go ahead and jump to where it's SUPPOSED to be (if no pause happened).
              this._start = prevStart; //if the pause was at an earlier time and the user resumed in the callback, it could reposition the timeline (changing its startTime), throwing things off slightly, so we make sure the _start doesn't shift.

              _setEnd(this);

              return this.render(totalTime, suppressEvents, force);
            }
          }

          this._onUpdate && !suppressEvents && _callback(this, "onUpdate", true);
          if (tTime === tDur && tDur >= this.totalDuration() || !tTime && prevTime) if (prevStart === this._start || Math.abs(timeScale) !== Math.abs(this._ts)) if (!this._lock) {
            (totalTime || !dur) && (tTime === tDur && this._ts > 0 || !tTime && this._ts < 0) && _removeFromParent(this, 1); // don't remove if the timeline is reversed and the playhead isn't at 0, otherwise tl.progress(1).reverse() won't work. Only remove if the playhead is at the end and timeScale is positive, or if the playhead is at 0 and the timeScale is negative.

            if (!suppressEvents && !(totalTime < 0 && !prevTime) && (tTime || prevTime)) {
              _callback(this, tTime === tDur ? "onComplete" : "onReverseComplete", true);

              this._prom && !(tTime < tDur && this.timeScale() > 0) && this._prom();
            }
          }
        }

        return this;
      };

      _proto2.add = function add(child, position) {
        var _this2 = this;

        if (!_isNumber(position)) {
          position = _parsePosition(this, position);
        }

        if (!(child instanceof Animation)) {
          if (_isArray(child)) {
            child.forEach(function (obj) {
              return _this2.add(obj, position);
            });
            return this;
          }

          if (_isString(child)) {
            return this.addLabel(child, position);
          }

          if (_isFunction(child)) {
            child = Tween.delayedCall(0, child);
          } else {
            return this;
          }
        }

        return this !== child ? _addToTimeline(this, child, position) : this; //don't allow a timeline to be added to itself as a child!
      };

      _proto2.getChildren = function getChildren(nested, tweens, timelines, ignoreBeforeTime) {
        if (nested === void 0) {
          nested = true;
        }

        if (tweens === void 0) {
          tweens = true;
        }

        if (timelines === void 0) {
          timelines = true;
        }

        if (ignoreBeforeTime === void 0) {
          ignoreBeforeTime = -_bigNum;
        }

        var a = [],
            child = this._first;

        while (child) {
          if (child._start >= ignoreBeforeTime) {
            if (child instanceof Tween) {
              tweens && a.push(child);
            } else {
              timelines && a.push(child);
              nested && a.push.apply(a, child.getChildren(true, tweens, timelines));
            }
          }

          child = child._next;
        }

        return a;
      };

      _proto2.getById = function getById(id) {
        var animations = this.getChildren(1, 1, 1),
            i = animations.length;

        while (i--) {
          if (animations[i].vars.id === id) {
            return animations[i];
          }
        }
      };

      _proto2.remove = function remove(child) {
        if (_isString(child)) {
          return this.removeLabel(child);
        }

        if (_isFunction(child)) {
          return this.killTweensOf(child);
        }

        _removeLinkedListItem(this, child);

        if (child === this._recent) {
          this._recent = this._last;
        }

        return _uncache(this);
      };

      _proto2.totalTime = function totalTime(_totalTime2, suppressEvents) {
        if (!arguments.length) {
          return this._tTime;
        }

        this._forcing = 1;

        if (!this._dp && this._ts) {
          //special case for the global timeline (or any other that has no parent or detached parent).
          this._start = _round(_ticker.time - (this._ts > 0 ? _totalTime2 / this._ts : (this.totalDuration() - _totalTime2) / -this._ts));
        }

        _Animation.prototype.totalTime.call(this, _totalTime2, suppressEvents);

        this._forcing = 0;
        return this;
      };

      _proto2.addLabel = function addLabel(label, position) {
        this.labels[label] = _parsePosition(this, position);
        return this;
      };

      _proto2.removeLabel = function removeLabel(label) {
        delete this.labels[label];
        return this;
      };

      _proto2.addPause = function addPause(position, callback, params) {
        var t = Tween.delayedCall(0, callback || _emptyFunc, params);
        t.data = "isPause";
        this._hasPause = 1;
        return _addToTimeline(this, t, _parsePosition(this, position));
      };

      _proto2.removePause = function removePause(position) {
        var child = this._first;
        position = _parsePosition(this, position);

        while (child) {
          if (child._start === position && child.data === "isPause") {
            _removeFromParent(child);
          }

          child = child._next;
        }
      };

      _proto2.killTweensOf = function killTweensOf(targets, props, onlyActive) {
        var tweens = this.getTweensOf(targets, onlyActive),
            i = tweens.length;

        while (i--) {
          _overwritingTween !== tweens[i] && tweens[i].kill(targets, props);
        }

        return this;
      };

      _proto2.getTweensOf = function getTweensOf(targets, onlyActive) {
        var a = [],
            parsedTargets = toArray(targets),
            child = this._first,
            isGlobalTime = _isNumber(onlyActive),
            // a number is interpreted as a global time. If the animation spans
        children;

        while (child) {
          if (child instanceof Tween) {
            if (_arrayContainsAny(child._targets, parsedTargets) && (isGlobalTime ? (!_overwritingTween || child._initted && child._ts) && child.globalTime(0) <= onlyActive && child.globalTime(child.totalDuration()) > onlyActive : !onlyActive || child.isActive())) {
              // note: if this is for overwriting, it should only be for tweens that aren't paused and are initted.
              a.push(child);
            }
          } else if ((children = child.getTweensOf(parsedTargets, onlyActive)).length) {
            a.push.apply(a, children);
          }

          child = child._next;
        }

        return a;
      };

      _proto2.tweenTo = function tweenTo(position, vars) {
        vars = vars || {};

        var tl = this,
            endTime = _parsePosition(tl, position),
            _vars = vars,
            startAt = _vars.startAt,
            _onStart = _vars.onStart,
            onStartParams = _vars.onStartParams,
            tween = Tween.to(tl, _setDefaults(vars, {
          ease: "none",
          lazy: false,
          time: endTime,
          overwrite: "auto",
          duration: vars.duration || Math.abs((endTime - (startAt && "time" in startAt ? startAt.time : tl._time)) / tl.timeScale()) || _tinyNum,
          onStart: function onStart() {
            tl.pause();
            var duration = vars.duration || Math.abs((endTime - tl._time) / tl.timeScale());
            tween._dur !== duration && _setDuration(tween, duration, 0, 1).render(tween._time, true, true);
            _onStart && _onStart.apply(tween, onStartParams || []); //in case the user had an onStart in the vars - we don't want to overwrite it.
          }
        }));

        return tween;
      };

      _proto2.tweenFromTo = function tweenFromTo(fromPosition, toPosition, vars) {
        return this.tweenTo(toPosition, _setDefaults({
          startAt: {
            time: _parsePosition(this, fromPosition)
          }
        }, vars));
      };

      _proto2.recent = function recent() {
        return this._recent;
      };

      _proto2.nextLabel = function nextLabel(afterTime) {
        if (afterTime === void 0) {
          afterTime = this._time;
        }

        return _getLabelInDirection(this, _parsePosition(this, afterTime));
      };

      _proto2.previousLabel = function previousLabel(beforeTime) {
        if (beforeTime === void 0) {
          beforeTime = this._time;
        }

        return _getLabelInDirection(this, _parsePosition(this, beforeTime), 1);
      };

      _proto2.currentLabel = function currentLabel(value) {
        return arguments.length ? this.seek(value, true) : this.previousLabel(this._time + _tinyNum);
      };

      _proto2.shiftChildren = function shiftChildren(amount, adjustLabels, ignoreBeforeTime) {
        if (ignoreBeforeTime === void 0) {
          ignoreBeforeTime = 0;
        }

        var child = this._first,
            labels = this.labels,
            p;

        while (child) {
          if (child._start >= ignoreBeforeTime) {
            child._start += amount;
            child._end += amount;
          }

          child = child._next;
        }

        if (adjustLabels) {
          for (p in labels) {
            if (labels[p] >= ignoreBeforeTime) {
              labels[p] += amount;
            }
          }
        }

        return _uncache(this);
      };

      _proto2.invalidate = function invalidate() {
        var child = this._first;
        this._lock = 0;

        while (child) {
          child.invalidate();
          child = child._next;
        }

        return _Animation.prototype.invalidate.call(this);
      };

      _proto2.clear = function clear(includeLabels) {
        if (includeLabels === void 0) {
          includeLabels = true;
        }

        var child = this._first,
            next;

        while (child) {
          next = child._next;
          this.remove(child);
          child = next;
        }

        this._time = this._tTime = this._pTime = 0;
        includeLabels && (this.labels = {});
        return _uncache(this);
      };

      _proto2.totalDuration = function totalDuration(value) {
        var max = 0,
            self = this,
            child = self._last,
            prevStart = _bigNum,
            prev,
            start,
            parent;

        if (arguments.length) {
          return self.timeScale((self._repeat < 0 ? self.duration() : self.totalDuration()) / (self.reversed() ? -value : value));
        }

        if (self._dirty) {
          parent = self.parent;

          while (child) {
            prev = child._prev; //record it here in case the tween changes position in the sequence...

            child._dirty && child.totalDuration(); //could change the tween._startTime, so make sure the animation's cache is clean before analyzing it.

            start = child._start;

            if (start > prevStart && self._sort && child._ts && !self._lock) {
              //in case one of the tweens shifted out of order, it needs to be re-inserted into the correct position in the sequence
              self._lock = 1; //prevent endless recursive calls - there are methods that get triggered that check duration/totalDuration when we add().

              _addToTimeline(self, child, start - child._delay, 1)._lock = 0;
            } else {
              prevStart = start;
            }

            if (start < 0 && child._ts) {
              //children aren't allowed to have negative startTimes unless smoothChildTiming is true, so adjust here if one is found.
              max -= start;

              if (!parent && !self._dp || parent && parent.smoothChildTiming) {
                self._start += start / self._ts;
                self._time -= start;
                self._tTime -= start;
              }

              self.shiftChildren(-start, false, -1e999);
              prevStart = 0;
            }

            child._end > max && child._ts && (max = child._end);
            child = prev;
          }

          _setDuration(self, self === _globalTimeline && self._time > max ? self._time : max, 1, 1);

          self._dirty = 0;
        }

        return self._tDur;
      };

      Timeline.updateRoot = function updateRoot(time) {
        if (_globalTimeline._ts) {
          _lazySafeRender(_globalTimeline, _parentToChildTotalTime(time, _globalTimeline));

          _lastRenderedFrame = _ticker.frame;
        }

        if (_ticker.frame >= _nextGCFrame) {
          _nextGCFrame += _config.autoSleep || 120;
          var child = _globalTimeline._first;
          if (!child || !child._ts) if (_config.autoSleep && _ticker._listeners.length < 2) {
            while (child && !child._ts) {
              child = child._next;
            }

            child || _ticker.sleep();
          }
        }
      };

      return Timeline;
    }(Animation);

    _setDefaults(Timeline.prototype, {
      _lock: 0,
      _hasPause: 0,
      _forcing: 0
    });

    var _addComplexStringPropTween = function _addComplexStringPropTween(target, prop, start, end, setter, stringFilter, funcParam) {
      //note: we call _addComplexStringPropTween.call(tweenInstance...) to ensure that it's scoped properly. We may call it from within a plugin too, thus "this" would refer to the plugin.
      var pt = new PropTween(this._pt, target, prop, 0, 1, _renderComplexString, null, setter),
          index = 0,
          matchIndex = 0,
          result,
          startNums,
          color,
          endNum,
          chunk,
          startNum,
          hasRandom,
          a;
      pt.b = start;
      pt.e = end;
      start += ""; //ensure values are strings

      end += "";

      if (hasRandom = ~end.indexOf("random(")) {
        end = _replaceRandom(end);
      }

      if (stringFilter) {
        a = [start, end];
        stringFilter(a, target, prop); //pass an array with the starting and ending values and let the filter do whatever it needs to the values.

        start = a[0];
        end = a[1];
      }

      startNums = start.match(_complexStringNumExp) || [];

      while (result = _complexStringNumExp.exec(end)) {
        endNum = result[0];
        chunk = end.substring(index, result.index);

        if (color) {
          color = (color + 1) % 5;
        } else if (chunk.substr(-5) === "rgba(") {
          color = 1;
        }

        if (endNum !== startNums[matchIndex++]) {
          startNum = parseFloat(startNums[matchIndex - 1]) || 0; //these nested PropTweens are handled in a special way - we'll never actually call a render or setter method on them. We'll just loop through them in the parent complex string PropTween's render method.

          pt._pt = {
            _next: pt._pt,
            p: chunk || matchIndex === 1 ? chunk : ",",
            //note: SVG spec allows omission of comma/space when a negative sign is wedged between two numbers, like 2.5-5.3 instead of 2.5,-5.3 but when tweening, the negative value may switch to positive, so we insert the comma just in case.
            s: startNum,
            c: endNum.charAt(1) === "=" ? parseFloat(endNum.substr(2)) * (endNum.charAt(0) === "-" ? -1 : 1) : parseFloat(endNum) - startNum,
            m: color && color < 4 ? Math.round : 0
          };
          index = _complexStringNumExp.lastIndex;
        }
      }

      pt.c = index < end.length ? end.substring(index, end.length) : ""; //we use the "c" of the PropTween to store the final part of the string (after the last number)

      pt.fp = funcParam;

      if (_relExp.test(end) || hasRandom) {
        pt.e = 0; //if the end string contains relative values or dynamic random(...) values, delete the end it so that on the final render we don't actually set it to the string with += or -= characters (forces it to use the calculated value).
      }

      this._pt = pt; //start the linked list with this new PropTween. Remember, we call _addComplexStringPropTween.call(tweenInstance...) to ensure that it's scoped properly. We may call it from within a plugin too, thus "this" would refer to the plugin.

      return pt;
    },
        _addPropTween = function _addPropTween(target, prop, start, end, index, targets, modifier, stringFilter, funcParam) {
      _isFunction(end) && (end = end(index || 0, target, targets));
      var currentValue = target[prop],
          parsedStart = start !== "get" ? start : !_isFunction(currentValue) ? currentValue : funcParam ? target[prop.indexOf("set") || !_isFunction(target["get" + prop.substr(3)]) ? prop : "get" + prop.substr(3)](funcParam) : target[prop](),
          setter = !_isFunction(currentValue) ? _setterPlain : funcParam ? _setterFuncWithParam : _setterFunc,
          pt;

      if (_isString(end)) {
        if (~end.indexOf("random(")) {
          end = _replaceRandom(end);
        }

        if (end.charAt(1) === "=") {
          end = parseFloat(parsedStart) + parseFloat(end.substr(2)) * (end.charAt(0) === "-" ? -1 : 1) + (getUnit(parsedStart) || 0);
        }
      }

      if (parsedStart !== end) {
        if (!isNaN(parsedStart * end)) {
          pt = new PropTween(this._pt, target, prop, +parsedStart || 0, end - (parsedStart || 0), typeof currentValue === "boolean" ? _renderBoolean : _renderPlain, 0, setter);
          funcParam && (pt.fp = funcParam);
          modifier && pt.modifier(modifier, this, target);
          return this._pt = pt;
        }

        !currentValue && !(prop in target) && _missingPlugin(prop, end);
        return _addComplexStringPropTween.call(this, target, prop, parsedStart, end, setter, stringFilter || _config.stringFilter, funcParam);
      }
    },
        //creates a copy of the vars object and processes any function-based values (putting the resulting values directly into the copy) as well as strings with "random()" in them. It does NOT process relative values.
    _processVars = function _processVars(vars, index, target, targets, tween) {
      _isFunction(vars) && (vars = _parseFuncOrString(vars, tween, index, target, targets));

      if (!_isObject(vars) || vars.style && vars.nodeType || _isArray(vars) || _isTypedArray(vars)) {
        return _isString(vars) ? _parseFuncOrString(vars, tween, index, target, targets) : vars;
      }

      var copy = {},
          p;

      for (p in vars) {
        copy[p] = _parseFuncOrString(vars[p], tween, index, target, targets);
      }

      return copy;
    },
        _checkPlugin = function _checkPlugin(property, vars, tween, index, target, targets) {
      var plugin, pt, ptLookup, i;

      if (_plugins[property] && (plugin = new _plugins[property]()).init(target, plugin.rawVars ? vars[property] : _processVars(vars[property], index, target, targets, tween), tween, index, targets) !== false) {
        tween._pt = pt = new PropTween(tween._pt, target, property, 0, 1, plugin.render, plugin, 0, plugin.priority);

        if (tween !== _quickTween) {
          ptLookup = tween._ptLookup[tween._targets.indexOf(target)]; //note: we can't use tween._ptLookup[index] because for staggered tweens, the index from the fullTargets array won't match what it is in each individual tween that spawns from the stagger.

          i = plugin._props.length;

          while (i--) {
            ptLookup[plugin._props[i]] = pt;
          }
        }
      }

      return plugin;
    },
        _overwritingTween,
        //store a reference temporarily so we can avoid overwriting itself.
    _initTween = function _initTween(tween, time) {
      var vars = tween.vars,
          ease = vars.ease,
          startAt = vars.startAt,
          immediateRender = vars.immediateRender,
          lazy = vars.lazy,
          onUpdate = vars.onUpdate,
          onUpdateParams = vars.onUpdateParams,
          callbackScope = vars.callbackScope,
          runBackwards = vars.runBackwards,
          yoyoEase = vars.yoyoEase,
          keyframes = vars.keyframes,
          autoRevert = vars.autoRevert,
          dur = tween._dur,
          prevStartAt = tween._startAt,
          targets = tween._targets,
          parent = tween.parent,
          fullTargets = parent && parent.data === "nested" ? parent.parent._targets : targets,
          autoOverwrite = tween._overwrite === "auto",
          tl = tween.timeline,
          cleanVars,
          i,
          p,
          pt,
          target,
          hasPriority,
          gsData,
          harness,
          plugin,
          ptLookup,
          index,
          harnessVars,
          overwritten;
      tl && (!keyframes || !ease) && (ease = "none");
      tween._ease = _parseEase(ease, _defaults.ease);
      tween._yEase = yoyoEase ? _invertEase(_parseEase(yoyoEase === true ? ease : yoyoEase, _defaults.ease)) : 0;

      if (yoyoEase && tween._yoyo && !tween._repeat) {
        //there must have been a parent timeline with yoyo:true that is currently in its yoyo phase, so flip the eases.
        yoyoEase = tween._yEase;
        tween._yEase = tween._ease;
        tween._ease = yoyoEase;
      }

      if (!tl) {
        //if there's an internal timeline, skip all the parsing because we passed that task down the chain.
        harness = targets[0] ? _getCache(targets[0]).harness : 0;
        harnessVars = harness && vars[harness.prop]; //someone may need to specify CSS-specific values AND non-CSS values, like if the element has an "x" property plus it's a standard DOM element. We allow people to distinguish by wrapping plugin-specific stuff in a css:{} object for example.

        cleanVars = _copyExcluding(vars, _reservedProps);
        prevStartAt && prevStartAt.render(-1, true).kill();

        if (startAt) {
          _removeFromParent(tween._startAt = Tween.set(targets, _setDefaults({
            data: "isStart",
            overwrite: false,
            parent: parent,
            immediateRender: true,
            lazy: _isNotFalse(lazy),
            startAt: null,
            delay: 0,
            onUpdate: onUpdate,
            onUpdateParams: onUpdateParams,
            callbackScope: callbackScope,
            stagger: 0
          }, startAt))); //copy the properties/values into a new object to avoid collisions, like var to = {x:0}, from = {x:500}; timeline.fromTo(e, from, to).fromTo(e, to, from);


          if (immediateRender) {
            if (time > 0) {
              autoRevert || (tween._startAt = 0); //tweens that render immediately (like most from() and fromTo() tweens) shouldn't revert when their parent timeline's playhead goes backward past the startTime because the initial render could have happened anytime and it shouldn't be directly correlated to this tween's startTime. Imagine setting up a complex animation where the beginning states of various objects are rendered immediately but the tween doesn't happen for quite some time - if we revert to the starting values as soon as the playhead goes backward past the tween's startTime, it will throw things off visually. Reversion should only happen in Timeline instances where immediateRender was false or when autoRevert is explicitly set to true.
            } else if (dur && !(time < 0 && prevStartAt)) {
              time && (tween._zTime = time);
              return; //we skip initialization here so that overwriting doesn't occur until the tween actually begins. Otherwise, if you create several immediateRender:true tweens of the same target/properties to drop into a Timeline, the last one created would overwrite the first ones because they didn't get placed into the timeline yet before the first render occurs and kicks in overwriting.
            }
          }
        } else if (runBackwards && dur) {
          //from() tweens must be handled uniquely: their beginning values must be rendered but we don't want overwriting to occur yet (when time is still 0). Wait until the tween actually begins before doing all the routines like overwriting. At that time, we should render at the END of the tween to ensure that things initialize correctly (remember, from() tweens go backwards)
          if (prevStartAt) {
            !autoRevert && (tween._startAt = 0);
          } else {
            time && (immediateRender = false); //in rare cases (like if a from() tween runs and then is invalidate()-ed), immediateRender could be true but the initial forced-render gets skipped, so there's no need to force the render in this context when the _time is greater than 0

            p = _setDefaults({
              overwrite: false,
              data: "isFromStart",
              //we tag the tween with as "isFromStart" so that if [inside a plugin] we need to only do something at the very END of a tween, we have a way of identifying this tween as merely the one that's setting the beginning values for a "from()" tween. For example, clearProps in CSSPlugin should only get applied at the very END of a tween and without this tag, from(...{height:100, clearProps:"height", delay:1}) would wipe the height at the beginning of the tween and after 1 second, it'd kick back in.
              lazy: immediateRender && _isNotFalse(lazy),
              immediateRender: immediateRender,
              //zero-duration tweens render immediately by default, but if we're not specifically instructed to render this tween immediately, we should skip this and merely _init() to record the starting values (rendering them immediately would push them to completion which is wasteful in that case - we'd have to render(-1) immediately after)
              stagger: 0,
              parent: parent //ensures that nested tweens that had a stagger are handled properly, like gsap.from(".class", {y:gsap.utils.wrap([-100,100])})

            }, cleanVars);
            harnessVars && (p[harness.prop] = harnessVars); // in case someone does something like .from(..., {css:{}})

            _removeFromParent(tween._startAt = Tween.set(targets, p));

            if (!immediateRender) {
              _initTween(tween._startAt, _tinyNum); //ensures that the initial values are recorded

            } else if (!time) {
              return;
            }
          }
        }

        tween._pt = 0;
        lazy = dur && _isNotFalse(lazy) || lazy && !dur;

        for (i = 0; i < targets.length; i++) {
          target = targets[i];
          gsData = target._gsap || _harness(targets)[i]._gsap;
          tween._ptLookup[i] = ptLookup = {};
          _lazyLookup[gsData.id] && _lazyTweens.length && _lazyRender(); //if other tweens of the same target have recently initted but haven't rendered yet, we've got to force the render so that the starting values are correct (imagine populating a timeline with a bunch of sequential tweens and then jumping to the end)

          index = fullTargets === targets ? i : fullTargets.indexOf(target);

          if (harness && (plugin = new harness()).init(target, harnessVars || cleanVars, tween, index, fullTargets) !== false) {
            tween._pt = pt = new PropTween(tween._pt, target, plugin.name, 0, 1, plugin.render, plugin, 0, plugin.priority);

            plugin._props.forEach(function (name) {
              ptLookup[name] = pt;
            });

            plugin.priority && (hasPriority = 1);
          }

          if (!harness || harnessVars) {
            for (p in cleanVars) {
              if (_plugins[p] && (plugin = _checkPlugin(p, cleanVars, tween, index, target, fullTargets))) {
                plugin.priority && (hasPriority = 1);
              } else {
                ptLookup[p] = pt = _addPropTween.call(tween, target, p, "get", cleanVars[p], index, fullTargets, 0, vars.stringFilter);
              }
            }
          }

          tween._op && tween._op[i] && tween.kill(target, tween._op[i]);

          if (autoOverwrite && tween._pt) {
            _overwritingTween = tween;

            _globalTimeline.killTweensOf(target, ptLookup, tween.globalTime(0)); //Also make sure the overwriting doesn't overwrite THIS tween!!!


            overwritten = !tween.parent;
            _overwritingTween = 0;
          }

          tween._pt && lazy && (_lazyLookup[gsData.id] = 1);
        }

        hasPriority && _sortPropTweensByPriority(tween);
        tween._onInit && tween._onInit(tween); //plugins like RoundProps must wait until ALL of the PropTweens are instantiated. In the plugin's init() function, it sets the _onInit on the tween instance. May not be pretty/intuitive, but it's fast and keeps file size down.
      }

      tween._from = !tl && !!vars.runBackwards; //nested timelines should never run backwards - the backwards-ness is in the child tweens.

      tween._onUpdate = onUpdate;
      tween._initted = (!tween._op || tween._pt) && !overwritten; // if overwrittenProps resulted in the entire tween being killed, do NOT flag it as initted or else it may render for one tick.
    },
        _addAliasesToVars = function _addAliasesToVars(targets, vars) {
      var harness = targets[0] ? _getCache(targets[0]).harness : 0,
          propertyAliases = harness && harness.aliases,
          copy,
          p,
          i,
          aliases;

      if (!propertyAliases) {
        return vars;
      }

      copy = _merge({}, vars);

      for (p in propertyAliases) {
        if (p in copy) {
          aliases = propertyAliases[p].split(",");
          i = aliases.length;

          while (i--) {
            copy[aliases[i]] = copy[p];
          }
        }
      }

      return copy;
    },
        _parseFuncOrString = function _parseFuncOrString(value, tween, i, target, targets) {
      return _isFunction(value) ? value.call(tween, i, target, targets) : _isString(value) && ~value.indexOf("random(") ? _replaceRandom(value) : value;
    },
        _staggerTweenProps = _callbackNames + "repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase",
        _staggerPropsToSkip = (_staggerTweenProps + ",id,stagger,delay,duration,paused,scrollTrigger").split(",");
    /*
     * --------------------------------------------------------------------------------------
     * TWEEN
     * --------------------------------------------------------------------------------------
     */


    var Tween = /*#__PURE__*/function (_Animation2) {
      _inheritsLoose(Tween, _Animation2);

      function Tween(targets, vars, time, skipInherit) {
        var _this3;

        if (typeof vars === "number") {
          time.duration = vars;
          vars = time;
          time = null;
        }

        _this3 = _Animation2.call(this, skipInherit ? vars : _inheritDefaults(vars), time) || this;
        var _this3$vars = _this3.vars,
            duration = _this3$vars.duration,
            delay = _this3$vars.delay,
            immediateRender = _this3$vars.immediateRender,
            stagger = _this3$vars.stagger,
            overwrite = _this3$vars.overwrite,
            keyframes = _this3$vars.keyframes,
            defaults = _this3$vars.defaults,
            scrollTrigger = _this3$vars.scrollTrigger,
            yoyoEase = _this3$vars.yoyoEase,
            parent = _this3.parent,
            parsedTargets = (_isArray(targets) || _isTypedArray(targets) ? _isNumber(targets[0]) : "length" in vars) ? [targets] : toArray(targets),
            tl,
            i,
            copy,
            l,
            p,
            curTarget,
            staggerFunc,
            staggerVarsToMerge;
        _this3._targets = parsedTargets.length ? _harness(parsedTargets) : _warn("GSAP target " + targets + " not found. https://greensock.com", !_config.nullTargetWarn) || [];
        _this3._ptLookup = []; //PropTween lookup. An array containing an object for each target, having keys for each tweening property

        _this3._overwrite = overwrite;

        if (keyframes || stagger || _isFuncOrString(duration) || _isFuncOrString(delay)) {
          vars = _this3.vars;
          tl = _this3.timeline = new Timeline({
            data: "nested",
            defaults: defaults || {}
          });
          tl.kill();
          tl.parent = _assertThisInitialized(_this3);

          if (keyframes) {
            _setDefaults(tl.vars.defaults, {
              ease: "none"
            });

            keyframes.forEach(function (frame) {
              return tl.to(parsedTargets, frame, ">");
            });
          } else {
            l = parsedTargets.length;
            staggerFunc = stagger ? distribute(stagger) : _emptyFunc;

            if (_isObject(stagger)) {
              //users can pass in callbacks like onStart/onComplete in the stagger object. These should fire with each individual tween.
              for (p in stagger) {
                if (~_staggerTweenProps.indexOf(p)) {
                  staggerVarsToMerge || (staggerVarsToMerge = {});
                  staggerVarsToMerge[p] = stagger[p];
                }
              }
            }

            for (i = 0; i < l; i++) {
              copy = {};

              for (p in vars) {
                if (_staggerPropsToSkip.indexOf(p) < 0) {
                  copy[p] = vars[p];
                }
              }

              copy.stagger = 0;
              yoyoEase && (copy.yoyoEase = yoyoEase);
              staggerVarsToMerge && _merge(copy, staggerVarsToMerge);
              curTarget = parsedTargets[i]; //don't just copy duration or delay because if they're a string or function, we'd end up in an infinite loop because _isFuncOrString() would evaluate as true in the child tweens, entering this loop, etc. So we parse the value straight from vars and default to 0.

              copy.duration = +_parseFuncOrString(duration, _assertThisInitialized(_this3), i, curTarget, parsedTargets);
              copy.delay = (+_parseFuncOrString(delay, _assertThisInitialized(_this3), i, curTarget, parsedTargets) || 0) - _this3._delay;

              if (!stagger && l === 1 && copy.delay) {
                // if someone does delay:"random(1, 5)", repeat:-1, for example, the delay shouldn't be inside the repeat.
                _this3._delay = delay = copy.delay;
                _this3._start += delay;
                copy.delay = 0;
              }

              tl.to(curTarget, copy, staggerFunc(i, curTarget, parsedTargets));
            }

            tl.duration() ? duration = delay = 0 : _this3.timeline = 0; // if the timeline's duration is 0, we don't need a timeline internally!
          }

          duration || _this3.duration(duration = tl.duration());
        } else {
          _this3.timeline = 0; //speed optimization, faster lookups (no going up the prototype chain)
        }

        if (overwrite === true) {
          _overwritingTween = _assertThisInitialized(_this3);

          _globalTimeline.killTweensOf(parsedTargets);

          _overwritingTween = 0;
        }

        parent && _postAddChecks(parent, _assertThisInitialized(_this3));

        if (immediateRender || !duration && !keyframes && _this3._start === _round(parent._time) && _isNotFalse(immediateRender) && _hasNoPausedAncestors(_assertThisInitialized(_this3)) && parent.data !== "nested") {
          _this3._tTime = -_tinyNum; //forces a render without having to set the render() "force" parameter to true because we want to allow lazying by default (using the "force" parameter always forces an immediate full render)

          _this3.render(Math.max(0, -delay)); //in case delay is negative

        }

        scrollTrigger && _scrollTrigger(_assertThisInitialized(_this3), scrollTrigger);
        return _this3;
      }

      var _proto3 = Tween.prototype;

      _proto3.render = function render(totalTime, suppressEvents, force) {
        var prevTime = this._time,
            tDur = this._tDur,
            dur = this._dur,
            tTime = totalTime > tDur - _tinyNum && totalTime >= 0 ? tDur : totalTime < _tinyNum ? 0 : totalTime,
            time,
            pt,
            iteration,
            cycleDuration,
            prevIteration,
            isYoyo,
            ratio,
            timeline,
            yoyoEase;

        if (!dur) {
          _renderZeroDurationTween(this, totalTime, suppressEvents, force);
        } else if (tTime !== this._tTime || !totalTime || force || this._startAt && this._zTime < 0 !== totalTime < 0) {
          //this senses if we're crossing over the start time, in which case we must record _zTime and force the render, but we do it in this lengthy conditional way for performance reasons (usually we can skip the calculations): this._initted && (this._zTime < 0) !== (totalTime < 0)
          time = tTime;
          timeline = this.timeline;

          if (this._repeat) {
            //adjust the time for repeats and yoyos
            cycleDuration = dur + this._rDelay;
            time = _round(tTime % cycleDuration); //round to avoid floating point errors. (4 % 0.8 should be 0 but some browsers report it as 0.79999999!)

            if (tTime === tDur) {
              // the tDur === tTime is for edge cases where there's a lengthy decimal on the duration and it may reach the very end but the time is rendered as not-quite-there (remember, tDur is rounded to 4 decimals whereas dur isn't)
              iteration = this._repeat;
              time = dur;
            } else {
              iteration = ~~(tTime / cycleDuration);

              if (iteration && iteration === tTime / cycleDuration) {
                time = dur;
                iteration--;
              }

              time > dur && (time = dur);
            }

            isYoyo = this._yoyo && iteration & 1;

            if (isYoyo) {
              yoyoEase = this._yEase;
              time = dur - time;
            }

            prevIteration = _animationCycle(this._tTime, cycleDuration);

            if (time === prevTime && !force && this._initted) {
              //could be during the repeatDelay part. No need to render and fire callbacks.
              return this;
            }

            if (iteration !== prevIteration) {
              timeline && this._yEase && _propagateYoyoEase(timeline, isYoyo); //repeatRefresh functionality

              if (this.vars.repeatRefresh && !isYoyo && !this._lock) {
                this._lock = force = 1; //force, otherwise if lazy is true, the _attemptInitTween() will return and we'll jump out and get caught bouncing on each tick.

                this.render(_round(cycleDuration * iteration), true).invalidate()._lock = 0;
              }
            }
          }

          if (!this._initted) {
            if (_attemptInitTween(this, totalTime < 0 ? totalTime : time, force, suppressEvents)) {
              this._tTime = 0; // in constructor if immediateRender is true, we set _tTime to -_tinyNum to have the playhead cross the starting point but we can't leave _tTime as a negative number.

              return this;
            }

            if (dur !== this._dur) {
              // while initting, a plugin like InertiaPlugin might alter the duration, so rerun from the start to ensure everything renders as it should.
              return this.render(totalTime, suppressEvents, force);
            }
          }

          this._tTime = tTime;
          this._time = time;

          if (!this._act && this._ts) {
            this._act = 1; //as long as it's not paused, force it to be active so that if the user renders independent of the parent timeline, it'll be forced to re-render on the next tick.

            this._lazy = 0;
          }

          this.ratio = ratio = (yoyoEase || this._ease)(time / dur);

          if (this._from) {
            this.ratio = ratio = 1 - ratio;
          }

          time && !prevTime && !suppressEvents && _callback(this, "onStart");
          pt = this._pt;

          while (pt) {
            pt.r(ratio, pt.d);
            pt = pt._next;
          }

          timeline && timeline.render(totalTime < 0 ? totalTime : !time && isYoyo ? -_tinyNum : timeline._dur * ratio, suppressEvents, force) || this._startAt && (this._zTime = totalTime);

          if (this._onUpdate && !suppressEvents) {
            totalTime < 0 && this._startAt && this._startAt.render(totalTime, true, force); //note: for performance reasons, we tuck this conditional logic inside less traveled areas (most tweens don't have an onUpdate). We'd just have it at the end before the onComplete, but the values should be updated before any onUpdate is called, so we ALSO put it here and then if it's not called, we do so later near the onComplete.

            _callback(this, "onUpdate");
          }

          this._repeat && iteration !== prevIteration && this.vars.onRepeat && !suppressEvents && this.parent && _callback(this, "onRepeat");

          if ((tTime === this._tDur || !tTime) && this._tTime === tTime) {
            totalTime < 0 && this._startAt && !this._onUpdate && this._startAt.render(totalTime, true, true);
            (totalTime || !dur) && (tTime === this._tDur && this._ts > 0 || !tTime && this._ts < 0) && _removeFromParent(this, 1); // don't remove if we're rendering at exactly a time of 0, as there could be autoRevert values that should get set on the next tick (if the playhead goes backward beyond the startTime, negative totalTime). Don't remove if the timeline is reversed and the playhead isn't at 0, otherwise tl.progress(1).reverse() won't work. Only remove if the playhead is at the end and timeScale is positive, or if the playhead is at 0 and the timeScale is negative.

            if (!suppressEvents && !(totalTime < 0 && !prevTime) && (tTime || prevTime)) {
              // if prevTime and tTime are zero, we shouldn't fire the onReverseComplete. This could happen if you gsap.to(... {paused:true}).play();
              _callback(this, tTime === tDur ? "onComplete" : "onReverseComplete", true);

              this._prom && !(tTime < tDur && this.timeScale() > 0) && this._prom();
            }
          }
        }

        return this;
      };

      _proto3.targets = function targets() {
        return this._targets;
      };

      _proto3.invalidate = function invalidate() {
        this._pt = this._op = this._startAt = this._onUpdate = this._act = this._lazy = 0;
        this._ptLookup = [];
        this.timeline && this.timeline.invalidate();
        return _Animation2.prototype.invalidate.call(this);
      };

      _proto3.kill = function kill(targets, vars) {
        if (vars === void 0) {
          vars = "all";
        }

        if (!targets && (!vars || vars === "all")) {
          this._lazy = 0;

          if (this.parent) {
            return _interrupt(this);
          }
        }

        if (this.timeline) {
          var tDur = this.timeline.totalDuration();
          this.timeline.killTweensOf(targets, vars, _overwritingTween && _overwritingTween.vars.overwrite !== true)._first || _interrupt(this); // if nothing is left tweenng, interrupt.

          this.parent && tDur !== this.timeline.totalDuration() && _setDuration(this, this._dur * this.timeline._tDur / tDur, 0, 1); // if a nested tween is killed that changes the duration, it should affect this tween's duration. We must use the ratio, though, because sometimes the internal timeline is stretched like for keyframes where they don't all add up to whatever the parent tween's duration was set to.

          return this;
        }

        var parsedTargets = this._targets,
            killingTargets = targets ? toArray(targets) : parsedTargets,
            propTweenLookup = this._ptLookup,
            firstPT = this._pt,
            overwrittenProps,
            curLookup,
            curOverwriteProps,
            props,
            p,
            pt,
            i;

        if ((!vars || vars === "all") && _arraysMatch(parsedTargets, killingTargets)) {
          vars === "all" && (this._pt = 0);
          return _interrupt(this);
        }

        overwrittenProps = this._op = this._op || [];

        if (vars !== "all") {
          //so people can pass in a comma-delimited list of property names
          if (_isString(vars)) {
            p = {};

            _forEachName(vars, function (name) {
              return p[name] = 1;
            });

            vars = p;
          }

          vars = _addAliasesToVars(parsedTargets, vars);
        }

        i = parsedTargets.length;

        while (i--) {
          if (~killingTargets.indexOf(parsedTargets[i])) {
            curLookup = propTweenLookup[i];

            if (vars === "all") {
              overwrittenProps[i] = vars;
              props = curLookup;
              curOverwriteProps = {};
            } else {
              curOverwriteProps = overwrittenProps[i] = overwrittenProps[i] || {};
              props = vars;
            }

            for (p in props) {
              pt = curLookup && curLookup[p];

              if (pt) {
                if (!("kill" in pt.d) || pt.d.kill(p) === true) {
                  _removeLinkedListItem(this, pt, "_pt");
                }

                delete curLookup[p];
              }

              if (curOverwriteProps !== "all") {
                curOverwriteProps[p] = 1;
              }
            }
          }
        }

        this._initted && !this._pt && firstPT && _interrupt(this); //if all tweening properties are killed, kill the tween. Without this line, if there's a tween with multiple targets and then you killTweensOf() each target individually, the tween would technically still remain active and fire its onComplete even though there aren't any more properties tweening.

        return this;
      };

      Tween.to = function to(targets, vars) {
        return new Tween(targets, vars, arguments[2]);
      };

      Tween.from = function from(targets, vars) {
        return new Tween(targets, _parseVars(arguments, 1));
      };

      Tween.delayedCall = function delayedCall(delay, callback, params, scope) {
        return new Tween(callback, 0, {
          immediateRender: false,
          lazy: false,
          overwrite: false,
          delay: delay,
          onComplete: callback,
          onReverseComplete: callback,
          onCompleteParams: params,
          onReverseCompleteParams: params,
          callbackScope: scope
        });
      };

      Tween.fromTo = function fromTo(targets, fromVars, toVars) {
        return new Tween(targets, _parseVars(arguments, 2));
      };

      Tween.set = function set(targets, vars) {
        vars.duration = 0;
        vars.repeatDelay || (vars.repeat = 0);
        return new Tween(targets, vars);
      };

      Tween.killTweensOf = function killTweensOf(targets, props, onlyActive) {
        return _globalTimeline.killTweensOf(targets, props, onlyActive);
      };

      return Tween;
    }(Animation);

    _setDefaults(Tween.prototype, {
      _targets: [],
      _lazy: 0,
      _startAt: 0,
      _op: 0,
      _onInit: 0
    }); //add the pertinent timeline methods to Tween instances so that users can chain conveniently and create a timeline automatically. (removed due to concerns that it'd ultimately add to more confusion especially for beginners)
    // _forEachName("to,from,fromTo,set,call,add,addLabel,addPause", name => {
    // 	Tween.prototype[name] = function() {
    // 		let tl = new Timeline();
    // 		return _addToTimeline(tl, this)[name].apply(tl, toArray(arguments));
    // 	}
    // });
    //for backward compatibility. Leverage the timeline calls.


    _forEachName("staggerTo,staggerFrom,staggerFromTo", function (name) {
      Tween[name] = function () {
        var tl = new Timeline(),
            params = _slice.call(arguments, 0);

        params.splice(name === "staggerFromTo" ? 5 : 4, 0, 0);
        return tl[name].apply(tl, params);
      };
    });
    /*
     * --------------------------------------------------------------------------------------
     * PROPTWEEN
     * --------------------------------------------------------------------------------------
     */


    var _setterPlain = function _setterPlain(target, property, value) {
      return target[property] = value;
    },
        _setterFunc = function _setterFunc(target, property, value) {
      return target[property](value);
    },
        _setterFuncWithParam = function _setterFuncWithParam(target, property, value, data) {
      return target[property](data.fp, value);
    },
        _setterAttribute = function _setterAttribute(target, property, value) {
      return target.setAttribute(property, value);
    },
        _getSetter = function _getSetter(target, property) {
      return _isFunction(target[property]) ? _setterFunc : _isUndefined(target[property]) && target.setAttribute ? _setterAttribute : _setterPlain;
    },
        _renderPlain = function _renderPlain(ratio, data) {
      return data.set(data.t, data.p, Math.round((data.s + data.c * ratio) * 10000) / 10000, data);
    },
        _renderBoolean = function _renderBoolean(ratio, data) {
      return data.set(data.t, data.p, !!(data.s + data.c * ratio), data);
    },
        _renderComplexString = function _renderComplexString(ratio, data) {
      var pt = data._pt,
          s = "";

      if (!ratio && data.b) {
        //b = beginning string
        s = data.b;
      } else if (ratio === 1 && data.e) {
        //e = ending string
        s = data.e;
      } else {
        while (pt) {
          s = pt.p + (pt.m ? pt.m(pt.s + pt.c * ratio) : Math.round((pt.s + pt.c * ratio) * 10000) / 10000) + s; //we use the "p" property for the text inbetween (like a suffix). And in the context of a complex string, the modifier (m) is typically just Math.round(), like for RGB colors.

          pt = pt._next;
        }

        s += data.c; //we use the "c" of the PropTween to store the final chunk of non-numeric text.
      }

      data.set(data.t, data.p, s, data);
    },
        _renderPropTweens = function _renderPropTweens(ratio, data) {
      var pt = data._pt;

      while (pt) {
        pt.r(ratio, pt.d);
        pt = pt._next;
      }
    },
        _addPluginModifier = function _addPluginModifier(modifier, tween, target, property) {
      var pt = this._pt,
          next;

      while (pt) {
        next = pt._next;
        pt.p === property && pt.modifier(modifier, tween, target);
        pt = next;
      }
    },
        _killPropTweensOf = function _killPropTweensOf(property) {
      var pt = this._pt,
          hasNonDependentRemaining,
          next;

      while (pt) {
        next = pt._next;

        if (pt.p === property && !pt.op || pt.op === property) {
          _removeLinkedListItem(this, pt, "_pt");
        } else if (!pt.dep) {
          hasNonDependentRemaining = 1;
        }

        pt = next;
      }

      return !hasNonDependentRemaining;
    },
        _setterWithModifier = function _setterWithModifier(target, property, value, data) {
      data.mSet(target, property, data.m.call(data.tween, value, data.mt), data);
    },
        _sortPropTweensByPriority = function _sortPropTweensByPriority(parent) {
      var pt = parent._pt,
          next,
          pt2,
          first,
          last; //sorts the PropTween linked list in order of priority because some plugins need to do their work after ALL of the PropTweens were created (like RoundPropsPlugin and ModifiersPlugin)

      while (pt) {
        next = pt._next;
        pt2 = first;

        while (pt2 && pt2.pr > pt.pr) {
          pt2 = pt2._next;
        }

        if (pt._prev = pt2 ? pt2._prev : last) {
          pt._prev._next = pt;
        } else {
          first = pt;
        }

        if (pt._next = pt2) {
          pt2._prev = pt;
        } else {
          last = pt;
        }

        pt = next;
      }

      parent._pt = first;
    }; //PropTween key: t = target, p = prop, r = renderer, d = data, s = start, c = change, op = overwriteProperty (ONLY populated when it's different than p), pr = priority, _next/_prev for the linked list siblings, set = setter, m = modifier, mSet = modifierSetter (the original setter, before a modifier was added)


    var PropTween = /*#__PURE__*/function () {
      function PropTween(next, target, prop, start, change, renderer, data, setter, priority) {
        this.t = target;
        this.s = start;
        this.c = change;
        this.p = prop;
        this.r = renderer || _renderPlain;
        this.d = data || this;
        this.set = setter || _setterPlain;
        this.pr = priority || 0;
        this._next = next;

        if (next) {
          next._prev = this;
        }
      }

      var _proto4 = PropTween.prototype;

      _proto4.modifier = function modifier(func, tween, target) {
        this.mSet = this.mSet || this.set; //in case it was already set (a PropTween can only have one modifier)

        this.set = _setterWithModifier;
        this.m = func;
        this.mt = target; //modifier target

        this.tween = tween;
      };

      return PropTween;
    }(); //Initialization tasks

    _forEachName(_callbackNames + "parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger", function (name) {
      return _reservedProps[name] = 1;
    });

    _globals.TweenMax = _globals.TweenLite = Tween;
    _globals.TimelineLite = _globals.TimelineMax = Timeline;
    _globalTimeline = new Timeline({
      sortChildren: false,
      defaults: _defaults,
      autoRemoveChildren: true,
      id: "root",
      smoothChildTiming: true
    });
    _config.stringFilter = _colorStringFilter;
    /*
     * --------------------------------------------------------------------------------------
     * GSAP
     * --------------------------------------------------------------------------------------
     */

    var _gsap = {
      registerPlugin: function registerPlugin() {
        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        args.forEach(function (config) {
          return _createPlugin(config);
        });
      },
      timeline: function timeline(vars) {
        return new Timeline(vars);
      },
      getTweensOf: function getTweensOf(targets, onlyActive) {
        return _globalTimeline.getTweensOf(targets, onlyActive);
      },
      getProperty: function getProperty(target, property, unit, uncache) {
        _isString(target) && (target = toArray(target)[0]); //in case selector text or an array is passed in

        var getter = _getCache(target || {}).get,
            format = unit ? _passThrough : _numericIfPossible;

        unit === "native" && (unit = "");
        return !target ? target : !property ? function (property, unit, uncache) {
          return format((_plugins[property] && _plugins[property].get || getter)(target, property, unit, uncache));
        } : format((_plugins[property] && _plugins[property].get || getter)(target, property, unit, uncache));
      },
      quickSetter: function quickSetter(target, property, unit) {
        target = toArray(target);

        if (target.length > 1) {
          var setters = target.map(function (t) {
            return gsap.quickSetter(t, property, unit);
          }),
              l = setters.length;
          return function (value) {
            var i = l;

            while (i--) {
              setters[i](value);
            }
          };
        }

        target = target[0] || {};

        var Plugin = _plugins[property],
            cache = _getCache(target),
            p = cache.harness && (cache.harness.aliases || {})[property] || property,
            // in case it's an alias, like "rotate" for "rotation".
        setter = Plugin ? function (value) {
          var p = new Plugin();
          _quickTween._pt = 0;
          p.init(target, unit ? value + unit : value, _quickTween, 0, [target]);
          p.render(1, p);
          _quickTween._pt && _renderPropTweens(1, _quickTween);
        } : cache.set(target, p);

        return Plugin ? setter : function (value) {
          return setter(target, p, unit ? value + unit : value, cache, 1);
        };
      },
      isTweening: function isTweening(targets) {
        return _globalTimeline.getTweensOf(targets, true).length > 0;
      },
      defaults: function defaults(value) {
        value && value.ease && (value.ease = _parseEase(value.ease, _defaults.ease));
        return _mergeDeep(_defaults, value || {});
      },
      config: function config(value) {
        return _mergeDeep(_config, value || {});
      },
      registerEffect: function registerEffect(_ref) {
        var name = _ref.name,
            effect = _ref.effect,
            plugins = _ref.plugins,
            defaults = _ref.defaults,
            extendTimeline = _ref.extendTimeline;
        (plugins || "").split(",").forEach(function (pluginName) {
          return pluginName && !_plugins[pluginName] && !_globals[pluginName] && _warn(name + " effect requires " + pluginName + " plugin.");
        });

        _effects[name] = function (targets, vars, tl) {
          return effect(toArray(targets), _setDefaults(vars || {}, defaults), tl);
        };

        if (extendTimeline) {
          Timeline.prototype[name] = function (targets, vars, position) {
            return this.add(_effects[name](targets, _isObject(vars) ? vars : (position = vars) && {}, this), position);
          };
        }
      },
      registerEase: function registerEase(name, ease) {
        _easeMap[name] = _parseEase(ease);
      },
      parseEase: function parseEase(ease, defaultEase) {
        return arguments.length ? _parseEase(ease, defaultEase) : _easeMap;
      },
      getById: function getById(id) {
        return _globalTimeline.getById(id);
      },
      exportRoot: function exportRoot(vars, includeDelayedCalls) {
        if (vars === void 0) {
          vars = {};
        }

        var tl = new Timeline(vars),
            child,
            next;
        tl.smoothChildTiming = _isNotFalse(vars.smoothChildTiming);

        _globalTimeline.remove(tl);

        tl._dp = 0; //otherwise it'll get re-activated when adding children and be re-introduced into _globalTimeline's linked list (then added to itself).

        tl._time = tl._tTime = _globalTimeline._time;
        child = _globalTimeline._first;

        while (child) {
          next = child._next;

          if (includeDelayedCalls || !(!child._dur && child instanceof Tween && child.vars.onComplete === child._targets[0])) {
            _addToTimeline(tl, child, child._start - child._delay);
          }

          child = next;
        }

        _addToTimeline(_globalTimeline, tl, 0);

        return tl;
      },
      utils: {
        wrap: wrap,
        wrapYoyo: wrapYoyo,
        distribute: distribute,
        random: random,
        snap: snap,
        normalize: normalize,
        getUnit: getUnit,
        clamp: clamp,
        splitColor: splitColor,
        toArray: toArray,
        mapRange: mapRange,
        pipe: pipe,
        unitize: unitize,
        interpolate: interpolate,
        shuffle: shuffle
      },
      install: _install,
      effects: _effects,
      ticker: _ticker,
      updateRoot: Timeline.updateRoot,
      plugins: _plugins,
      globalTimeline: _globalTimeline,
      core: {
        PropTween: PropTween,
        globals: _addGlobal,
        Tween: Tween,
        Timeline: Timeline,
        Animation: Animation,
        getCache: _getCache,
        _removeLinkedListItem: _removeLinkedListItem
      }
    };

    _forEachName("to,from,fromTo,delayedCall,set,killTweensOf", function (name) {
      return _gsap[name] = Tween[name];
    });

    _ticker.add(Timeline.updateRoot);

    _quickTween = _gsap.to({}, {
      duration: 0
    }); // ---- EXTRA PLUGINS --------------------------------------------------------

    var _getPluginPropTween = function _getPluginPropTween(plugin, prop) {
      var pt = plugin._pt;

      while (pt && pt.p !== prop && pt.op !== prop && pt.fp !== prop) {
        pt = pt._next;
      }

      return pt;
    },
        _addModifiers = function _addModifiers(tween, modifiers) {
      var targets = tween._targets,
          p,
          i,
          pt;

      for (p in modifiers) {
        i = targets.length;

        while (i--) {
          pt = tween._ptLookup[i][p];

          if (pt && (pt = pt.d)) {
            if (pt._pt) {
              // is a plugin
              pt = _getPluginPropTween(pt, p);
            }

            pt && pt.modifier && pt.modifier(modifiers[p], tween, targets[i], p);
          }
        }
      }
    },
        _buildModifierPlugin = function _buildModifierPlugin(name, modifier) {
      return {
        name: name,
        rawVars: 1,
        //don't pre-process function-based values or "random()" strings.
        init: function init(target, vars, tween) {
          tween._onInit = function (tween) {
            var temp, p;

            if (_isString(vars)) {
              temp = {};

              _forEachName(vars, function (name) {
                return temp[name] = 1;
              }); //if the user passes in a comma-delimited list of property names to roundProps, like "x,y", we round to whole numbers.


              vars = temp;
            }

            if (modifier) {
              temp = {};

              for (p in vars) {
                temp[p] = modifier(vars[p]);
              }

              vars = temp;
            }

            _addModifiers(tween, vars);
          };
        }
      };
    }; //register core plugins


    var gsap = _gsap.registerPlugin({
      name: "attr",
      init: function init(target, vars, tween, index, targets) {
        var p, pt;

        for (p in vars) {
          pt = this.add(target, "setAttribute", (target.getAttribute(p) || 0) + "", vars[p], index, targets, 0, 0, p);
          pt && (pt.op = p);

          this._props.push(p);
        }
      }
    }, {
      name: "endArray",
      init: function init(target, value) {
        var i = value.length;

        while (i--) {
          this.add(target, i, target[i] || 0, value[i]);
        }
      }
    }, _buildModifierPlugin("roundProps", _roundModifier), _buildModifierPlugin("modifiers"), _buildModifierPlugin("snap", snap)) || _gsap; //to prevent the core plugins from being dropped via aggressive tree shaking, we must include them in the variable declaration in this way.

    Tween.version = Timeline.version = gsap.version = "3.5.1";
    _coreReady = 1;

    if (_windowExists()) {
      _wake();
    }

    /*!
     * CSSPlugin 3.5.1
     * https://greensock.com
     *
     * Copyright 2008-2020, GreenSock. All rights reserved.
     * Subject to the terms at https://greensock.com/standard-license or for
     * Club GreenSock members, the agreement issued with that membership.
     * @author: Jack Doyle, jack@greensock.com
    */

    var _win$1,
        _doc$1,
        _docElement,
        _pluginInitted,
        _tempDiv,
        _tempDivStyler,
        _recentSetterPlugin,
        _windowExists$1 = function _windowExists() {
      return typeof window !== "undefined";
    },
        _transformProps = {},
        _RAD2DEG = 180 / Math.PI,
        _DEG2RAD = Math.PI / 180,
        _atan2 = Math.atan2,
        _bigNum$1 = 1e8,
        _capsExp = /([A-Z])/g,
        _horizontalExp = /(?:left|right|width|margin|padding|x)/i,
        _complexExp = /[\s,\(]\S/,
        _propertyAliases = {
      autoAlpha: "opacity,visibility",
      scale: "scaleX,scaleY",
      alpha: "opacity"
    },
        _renderCSSProp = function _renderCSSProp(ratio, data) {
      return data.set(data.t, data.p, Math.round((data.s + data.c * ratio) * 10000) / 10000 + data.u, data);
    },
        _renderPropWithEnd = function _renderPropWithEnd(ratio, data) {
      return data.set(data.t, data.p, ratio === 1 ? data.e : Math.round((data.s + data.c * ratio) * 10000) / 10000 + data.u, data);
    },
        _renderCSSPropWithBeginning = function _renderCSSPropWithBeginning(ratio, data) {
      return data.set(data.t, data.p, ratio ? Math.round((data.s + data.c * ratio) * 10000) / 10000 + data.u : data.b, data);
    },
        //if units change, we need a way to render the original unit/value when the tween goes all the way back to the beginning (ratio:0)
    _renderRoundedCSSProp = function _renderRoundedCSSProp(ratio, data) {
      var value = data.s + data.c * ratio;
      data.set(data.t, data.p, ~~(value + (value < 0 ? -.5 : .5)) + data.u, data);
    },
        _renderNonTweeningValue = function _renderNonTweeningValue(ratio, data) {
      return data.set(data.t, data.p, ratio ? data.e : data.b, data);
    },
        _renderNonTweeningValueOnlyAtEnd = function _renderNonTweeningValueOnlyAtEnd(ratio, data) {
      return data.set(data.t, data.p, ratio !== 1 ? data.b : data.e, data);
    },
        _setterCSSStyle = function _setterCSSStyle(target, property, value) {
      return target.style[property] = value;
    },
        _setterCSSProp = function _setterCSSProp(target, property, value) {
      return target.style.setProperty(property, value);
    },
        _setterTransform = function _setterTransform(target, property, value) {
      return target._gsap[property] = value;
    },
        _setterScale = function _setterScale(target, property, value) {
      return target._gsap.scaleX = target._gsap.scaleY = value;
    },
        _setterScaleWithRender = function _setterScaleWithRender(target, property, value, data, ratio) {
      var cache = target._gsap;
      cache.scaleX = cache.scaleY = value;
      cache.renderTransform(ratio, cache);
    },
        _setterTransformWithRender = function _setterTransformWithRender(target, property, value, data, ratio) {
      var cache = target._gsap;
      cache[property] = value;
      cache.renderTransform(ratio, cache);
    },
        _transformProp = "transform",
        _transformOriginProp = _transformProp + "Origin",
        _supports3D,
        _createElement = function _createElement(type, ns) {
      var e = _doc$1.createElementNS ? _doc$1.createElementNS((ns || "http://www.w3.org/1999/xhtml").replace(/^https/, "http"), type) : _doc$1.createElement(type); //some servers swap in https for http in the namespace which can break things, making "style" inaccessible.

      return e.style ? e : _doc$1.createElement(type); //some environments won't allow access to the element's style when created with a namespace in which case we default to the standard createElement() to work around the issue. Also note that when GSAP is embedded directly inside an SVG file, createElement() won't allow access to the style object in Firefox (see https://greensock.com/forums/topic/20215-problem-using-tweenmax-in-standalone-self-containing-svg-file-err-cannot-set-property-csstext-of-undefined/).
    },
        _getComputedProperty = function _getComputedProperty(target, property, skipPrefixFallback) {
      var cs = getComputedStyle(target);
      return cs[property] || cs.getPropertyValue(property.replace(_capsExp, "-$1").toLowerCase()) || cs.getPropertyValue(property) || !skipPrefixFallback && _getComputedProperty(target, _checkPropPrefix(property) || property, 1) || ""; //css variables may not need caps swapped out for dashes and lowercase.
    },
        _prefixes = "O,Moz,ms,Ms,Webkit".split(","),
        _checkPropPrefix = function _checkPropPrefix(property, element, preferPrefix) {
      var e = element || _tempDiv,
          s = e.style,
          i = 5;

      if (property in s && !preferPrefix) {
        return property;
      }

      property = property.charAt(0).toUpperCase() + property.substr(1);

      while (i-- && !(_prefixes[i] + property in s)) {}

      return i < 0 ? null : (i === 3 ? "ms" : i >= 0 ? _prefixes[i] : "") + property;
    },
        _initCore = function _initCore() {
      if (_windowExists$1() && window.document) {
        _win$1 = window;
        _doc$1 = _win$1.document;
        _docElement = _doc$1.documentElement;
        _tempDiv = _createElement("div") || {
          style: {}
        };
        _tempDivStyler = _createElement("div");
        _transformProp = _checkPropPrefix(_transformProp);
        _transformOriginProp = _transformProp + "Origin";
        _tempDiv.style.cssText = "border-width:0;line-height:0;position:absolute;padding:0"; //make sure to override certain properties that may contaminate measurements, in case the user has overreaching style sheets.

        _supports3D = !!_checkPropPrefix("perspective");
        _pluginInitted = 1;
      }
    },
        _getBBoxHack = function _getBBoxHack(swapIfPossible) {
      //works around issues in some browsers (like Firefox) that don't correctly report getBBox() on SVG elements inside a <defs> element and/or <mask>. We try creating an SVG, adding it to the documentElement and toss the element in there so that it's definitely part of the rendering tree, then grab the bbox and if it works, we actually swap out the original getBBox() method for our own that does these extra steps whenever getBBox is needed. This helps ensure that performance is optimal (only do all these extra steps when absolutely necessary...most elements don't need it).
      var svg = _createElement("svg", this.ownerSVGElement && this.ownerSVGElement.getAttribute("xmlns") || "http://www.w3.org/2000/svg"),
          oldParent = this.parentNode,
          oldSibling = this.nextSibling,
          oldCSS = this.style.cssText,
          bbox;

      _docElement.appendChild(svg);

      svg.appendChild(this);
      this.style.display = "block";

      if (swapIfPossible) {
        try {
          bbox = this.getBBox();
          this._gsapBBox = this.getBBox; //store the original

          this.getBBox = _getBBoxHack;
        } catch (e) {}
      } else if (this._gsapBBox) {
        bbox = this._gsapBBox();
      }

      if (oldParent) {
        if (oldSibling) {
          oldParent.insertBefore(this, oldSibling);
        } else {
          oldParent.appendChild(this);
        }
      }

      _docElement.removeChild(svg);

      this.style.cssText = oldCSS;
      return bbox;
    },
        _getAttributeFallbacks = function _getAttributeFallbacks(target, attributesArray) {
      var i = attributesArray.length;

      while (i--) {
        if (target.hasAttribute(attributesArray[i])) {
          return target.getAttribute(attributesArray[i]);
        }
      }
    },
        _getBBox = function _getBBox(target) {
      var bounds;

      try {
        bounds = target.getBBox(); //Firefox throws errors if you try calling getBBox() on an SVG element that's not rendered (like in a <symbol> or <defs>). https://bugzilla.mozilla.org/show_bug.cgi?id=612118
      } catch (error) {
        bounds = _getBBoxHack.call(target, true);
      }

      bounds && (bounds.width || bounds.height) || target.getBBox === _getBBoxHack || (bounds = _getBBoxHack.call(target, true)); //some browsers (like Firefox) misreport the bounds if the element has zero width and height (it just assumes it's at x:0, y:0), thus we need to manually grab the position in that case.

      return bounds && !bounds.width && !bounds.x && !bounds.y ? {
        x: +_getAttributeFallbacks(target, ["x", "cx", "x1"]) || 0,
        y: +_getAttributeFallbacks(target, ["y", "cy", "y1"]) || 0,
        width: 0,
        height: 0
      } : bounds;
    },
        _isSVG = function _isSVG(e) {
      return !!(e.getCTM && (!e.parentNode || e.ownerSVGElement) && _getBBox(e));
    },
        //reports if the element is an SVG on which getBBox() actually works
    _removeProperty = function _removeProperty(target, property) {
      if (property) {
        var style = target.style;

        if (property in _transformProps && property !== _transformOriginProp) {
          property = _transformProp;
        }

        if (style.removeProperty) {
          if (property.substr(0, 2) === "ms" || property.substr(0, 6) === "webkit") {
            //Microsoft and some Webkit browsers don't conform to the standard of capitalizing the first prefix character, so we adjust so that when we prefix the caps with a dash, it's correct (otherwise it'd be "ms-transform" instead of "-ms-transform" for IE9, for example)
            property = "-" + property;
          }

          style.removeProperty(property.replace(_capsExp, "-$1").toLowerCase());
        } else {
          //note: old versions of IE use "removeAttribute()" instead of "removeProperty()"
          style.removeAttribute(property);
        }
      }
    },
        _addNonTweeningPT = function _addNonTweeningPT(plugin, target, property, beginning, end, onlySetAtEnd) {
      var pt = new PropTween(plugin._pt, target, property, 0, 1, onlySetAtEnd ? _renderNonTweeningValueOnlyAtEnd : _renderNonTweeningValue);
      plugin._pt = pt;
      pt.b = beginning;
      pt.e = end;

      plugin._props.push(property);

      return pt;
    },
        _nonConvertibleUnits = {
      deg: 1,
      rad: 1,
      turn: 1
    },
        //takes a single value like 20px and converts it to the unit specified, like "%", returning only the numeric amount.
    _convertToUnit = function _convertToUnit(target, property, value, unit) {
      var curValue = parseFloat(value) || 0,
          curUnit = (value + "").trim().substr((curValue + "").length) || "px",
          // some browsers leave extra whitespace at the beginning of CSS variables, hence the need to trim()
      style = _tempDiv.style,
          horizontal = _horizontalExp.test(property),
          isRootSVG = target.tagName.toLowerCase() === "svg",
          measureProperty = (isRootSVG ? "client" : "offset") + (horizontal ? "Width" : "Height"),
          amount = 100,
          toPixels = unit === "px",
          toPercent = unit === "%",
          px,
          parent,
          cache,
          isSVG;

      if (unit === curUnit || !curValue || _nonConvertibleUnits[unit] || _nonConvertibleUnits[curUnit]) {
        return curValue;
      }

      curUnit !== "px" && !toPixels && (curValue = _convertToUnit(target, property, value, "px"));
      isSVG = target.getCTM && _isSVG(target);

      if (toPercent && (_transformProps[property] || ~property.indexOf("adius"))) {
        //transforms and borderRadius are relative to the size of the element itself!
        return _round(curValue / (isSVG ? target.getBBox()[horizontal ? "width" : "height"] : target[measureProperty]) * amount);
      }

      style[horizontal ? "width" : "height"] = amount + (toPixels ? curUnit : unit);
      parent = ~property.indexOf("adius") || unit === "em" && target.appendChild && !isRootSVG ? target : target.parentNode;

      if (isSVG) {
        parent = (target.ownerSVGElement || {}).parentNode;
      }

      if (!parent || parent === _doc$1 || !parent.appendChild) {
        parent = _doc$1.body;
      }

      cache = parent._gsap;

      if (cache && toPercent && cache.width && horizontal && cache.time === _ticker.time) {
        return _round(curValue / cache.width * amount);
      } else {
        (toPercent || curUnit === "%") && (style.position = _getComputedProperty(target, "position"));
        parent === target && (style.position = "static"); // like for borderRadius, if it's a % we must have it relative to the target itself but that may not have position: relative or position: absolute in which case it'd go up the chain until it finds its offsetParent (bad). position: static protects against that.

        parent.appendChild(_tempDiv);
        px = _tempDiv[measureProperty];
        parent.removeChild(_tempDiv);
        style.position = "absolute";

        if (horizontal && toPercent) {
          cache = _getCache(parent);
          cache.time = _ticker.time;
          cache.width = parent[measureProperty];
        }
      }

      return _round(toPixels ? px * curValue / amount : px && curValue ? amount / px * curValue : 0);
    },
        _get = function _get(target, property, unit, uncache) {
      var value;
      _pluginInitted || _initCore();

      if (property in _propertyAliases && property !== "transform") {
        property = _propertyAliases[property];

        if (~property.indexOf(",")) {
          property = property.split(",")[0];
        }
      }

      if (_transformProps[property] && property !== "transform") {
        value = _parseTransform(target, uncache);
        value = property !== "transformOrigin" ? value[property] : _firstTwoOnly(_getComputedProperty(target, _transformOriginProp)) + " " + value.zOrigin + "px";
      } else {
        value = target.style[property];

        if (!value || value === "auto" || uncache || ~(value + "").indexOf("calc(")) {
          value = _specialProps[property] && _specialProps[property](target, property, unit) || _getComputedProperty(target, property) || _getProperty(target, property) || (property === "opacity" ? 1 : 0); // note: some browsers, like Firefox, don't report borderRadius correctly! Instead, it only reports every corner like  borderTopLeftRadius
        }
      }

      return unit && !~(value + "").indexOf(" ") ? _convertToUnit(target, property, value, unit) + unit : value;
    },
        _tweenComplexCSSString = function _tweenComplexCSSString(target, prop, start, end) {
      //note: we call _tweenComplexCSSString.call(pluginInstance...) to ensure that it's scoped properly. We may call it from within a plugin too, thus "this" would refer to the plugin.
      if (!start || start === "none") {
        // some browsers like Safari actually PREFER the prefixed property and mis-report the unprefixed value like clipPath (BUG). In other words, even though clipPath exists in the style ("clipPath" in target.style) and it's set in the CSS properly (along with -webkit-clip-path), Safari reports clipPath as "none" whereas WebkitClipPath reports accurately like "ellipse(100% 0% at 50% 0%)", so in this case we must SWITCH to using the prefixed property instead. See https://greensock.com/forums/topic/18310-clippath-doesnt-work-on-ios/
        var p = _checkPropPrefix(prop, target, 1),
            s = p && _getComputedProperty(target, p, 1);

        if (s && s !== start) {
          prop = p;
          start = s;
        } else if (prop === "borderColor") {
          start = _getComputedProperty(target, "borderTopColor"); // Firefox bug: always reports "borderColor" as "", so we must fall back to borderTopColor. See https://greensock.com/forums/topic/24583-how-to-return-colors-that-i-had-after-reverse/
        }
      }

      var pt = new PropTween(this._pt, target.style, prop, 0, 1, _renderComplexString),
          index = 0,
          matchIndex = 0,
          a,
          result,
          startValues,
          startNum,
          color,
          startValue,
          endValue,
          endNum,
          chunk,
          endUnit,
          startUnit,
          relative,
          endValues;
      pt.b = start;
      pt.e = end;
      start += ""; //ensure values are strings

      end += "";

      if (end === "auto") {
        target.style[prop] = end;
        end = _getComputedProperty(target, prop) || end;
        target.style[prop] = start;
      }

      a = [start, end];

      _colorStringFilter(a); //pass an array with the starting and ending values and let the filter do whatever it needs to the values. If colors are found, it returns true and then we must match where the color shows up order-wise because for things like boxShadow, sometimes the browser provides the computed values with the color FIRST, but the user provides it with the color LAST, so flip them if necessary. Same for drop-shadow().


      start = a[0];
      end = a[1];
      startValues = start.match(_numWithUnitExp) || [];
      endValues = end.match(_numWithUnitExp) || [];

      if (endValues.length) {
        while (result = _numWithUnitExp.exec(end)) {
          endValue = result[0];
          chunk = end.substring(index, result.index);

          if (color) {
            color = (color + 1) % 5;
          } else if (chunk.substr(-5) === "rgba(" || chunk.substr(-5) === "hsla(") {
            color = 1;
          }

          if (endValue !== (startValue = startValues[matchIndex++] || "")) {
            startNum = parseFloat(startValue) || 0;
            startUnit = startValue.substr((startNum + "").length);
            relative = endValue.charAt(1) === "=" ? +(endValue.charAt(0) + "1") : 0;

            if (relative) {
              endValue = endValue.substr(2);
            }

            endNum = parseFloat(endValue);
            endUnit = endValue.substr((endNum + "").length);
            index = _numWithUnitExp.lastIndex - endUnit.length;

            if (!endUnit) {
              //if something like "perspective:300" is passed in and we must add a unit to the end
              endUnit = endUnit || _config.units[prop] || startUnit;

              if (index === end.length) {
                end += endUnit;
                pt.e += endUnit;
              }
            }

            if (startUnit !== endUnit) {
              startNum = _convertToUnit(target, prop, startValue, endUnit) || 0;
            } //these nested PropTweens are handled in a special way - we'll never actually call a render or setter method on them. We'll just loop through them in the parent complex string PropTween's render method.


            pt._pt = {
              _next: pt._pt,
              p: chunk || matchIndex === 1 ? chunk : ",",
              //note: SVG spec allows omission of comma/space when a negative sign is wedged between two numbers, like 2.5-5.3 instead of 2.5,-5.3 but when tweening, the negative value may switch to positive, so we insert the comma just in case.
              s: startNum,
              c: relative ? relative * endNum : endNum - startNum,
              m: color && color < 4 ? Math.round : 0
            };
          }
        }

        pt.c = index < end.length ? end.substring(index, end.length) : ""; //we use the "c" of the PropTween to store the final part of the string (after the last number)
      } else {
        pt.r = prop === "display" && end === "none" ? _renderNonTweeningValueOnlyAtEnd : _renderNonTweeningValue;
      }

      if (_relExp.test(end)) {
        pt.e = 0; //if the end string contains relative values or dynamic random(...) values, delete the end it so that on the final render we don't actually set it to the string with += or -= characters (forces it to use the calculated value).
      }

      this._pt = pt; //start the linked list with this new PropTween. Remember, we call _tweenComplexCSSString.call(pluginInstance...) to ensure that it's scoped properly. We may call it from within another plugin too, thus "this" would refer to the plugin.

      return pt;
    },
        _keywordToPercent = {
      top: "0%",
      bottom: "100%",
      left: "0%",
      right: "100%",
      center: "50%"
    },
        _convertKeywordsToPercentages = function _convertKeywordsToPercentages(value) {
      var split = value.split(" "),
          x = split[0],
          y = split[1] || "50%";

      if (x === "top" || x === "bottom" || y === "left" || y === "right") {
        //the user provided them in the wrong order, so flip them
        value = x;
        x = y;
        y = value;
      }

      split[0] = _keywordToPercent[x] || x;
      split[1] = _keywordToPercent[y] || y;
      return split.join(" ");
    },
        _renderClearProps = function _renderClearProps(ratio, data) {
      if (data.tween && data.tween._time === data.tween._dur) {
        var target = data.t,
            style = target.style,
            props = data.u,
            cache = target._gsap,
            prop,
            clearTransforms,
            i;

        if (props === "all" || props === true) {
          style.cssText = "";
          clearTransforms = 1;
        } else {
          props = props.split(",");
          i = props.length;

          while (--i > -1) {
            prop = props[i];

            if (_transformProps[prop]) {
              clearTransforms = 1;
              prop = prop === "transformOrigin" ? _transformOriginProp : _transformProp;
            }

            _removeProperty(target, prop);
          }
        }

        if (clearTransforms) {
          _removeProperty(target, _transformProp);

          if (cache) {
            cache.svg && target.removeAttribute("transform");

            _parseTransform(target, 1); // force all the cached values back to "normal"/identity, otherwise if there's another tween that's already set to render transforms on this element, it could display the wrong values.


            cache.uncache = 1;
          }
        }
      }
    },
        // note: specialProps should return 1 if (and only if) they have a non-zero priority. It indicates we need to sort the linked list.
    _specialProps = {
      clearProps: function clearProps(plugin, target, property, endValue, tween) {
        if (tween.data !== "isFromStart") {
          var pt = plugin._pt = new PropTween(plugin._pt, target, property, 0, 0, _renderClearProps);
          pt.u = endValue;
          pt.pr = -10;
          pt.tween = tween;

          plugin._props.push(property);

          return 1;
        }
      }
      /* className feature (about 0.4kb gzipped).
      , className(plugin, target, property, endValue, tween) {
      	let _renderClassName = (ratio, data) => {
      			data.css.render(ratio, data.css);
      			if (!ratio || ratio === 1) {
      				let inline = data.rmv,
      					target = data.t,
      					p;
      				target.setAttribute("class", ratio ? data.e : data.b);
      				for (p in inline) {
      					_removeProperty(target, p);
      				}
      			}
      		},
      		_getAllStyles = (target) => {
      			let styles = {},
      				computed = getComputedStyle(target),
      				p;
      			for (p in computed) {
      				if (isNaN(p) && p !== "cssText" && p !== "length") {
      					styles[p] = computed[p];
      				}
      			}
      			_setDefaults(styles, _parseTransform(target, 1));
      			return styles;
      		},
      		startClassList = target.getAttribute("class"),
      		style = target.style,
      		cssText = style.cssText,
      		cache = target._gsap,
      		classPT = cache.classPT,
      		inlineToRemoveAtEnd = {},
      		data = {t:target, plugin:plugin, rmv:inlineToRemoveAtEnd, b:startClassList, e:(endValue.charAt(1) !== "=") ? endValue : startClassList.replace(new RegExp("(?:\\s|^)" + endValue.substr(2) + "(?![\\w-])"), "") + ((endValue.charAt(0) === "+") ? " " + endValue.substr(2) : "")},
      		changingVars = {},
      		startVars = _getAllStyles(target),
      		transformRelated = /(transform|perspective)/i,
      		endVars, p;
      	if (classPT) {
      		classPT.r(1, classPT.d);
      		_removeLinkedListItem(classPT.d.plugin, classPT, "_pt");
      	}
      	target.setAttribute("class", data.e);
      	endVars = _getAllStyles(target, true);
      	target.setAttribute("class", startClassList);
      	for (p in endVars) {
      		if (endVars[p] !== startVars[p] && !transformRelated.test(p)) {
      			changingVars[p] = endVars[p];
      			if (!style[p] && style[p] !== "0") {
      				inlineToRemoveAtEnd[p] = 1;
      			}
      		}
      	}
      	cache.classPT = plugin._pt = new PropTween(plugin._pt, target, "className", 0, 0, _renderClassName, data, 0, -11);
      	if (style.cssText !== cssText) { //only apply if things change. Otherwise, in cases like a background-image that's pulled dynamically, it could cause a refresh. See https://greensock.com/forums/topic/20368-possible-gsap-bug-switching-classnames-in-chrome/.
      		style.cssText = cssText; //we recorded cssText before we swapped classes and ran _getAllStyles() because in cases when a className tween is overwritten, we remove all the related tweening properties from that class change (otherwise class-specific stuff can't override properties we've directly set on the target's style object due to specificity).
      	}
      	_parseTransform(target, true); //to clear the caching of transforms
      	data.css = new gsap.plugins.css();
      	data.css.init(target, changingVars, tween);
      	plugin._props.push(...data.css._props);
      	return 1;
      }
      */

    },

    /*
     * --------------------------------------------------------------------------------------
     * TRANSFORMS
     * --------------------------------------------------------------------------------------
     */
    _identity2DMatrix = [1, 0, 0, 1, 0, 0],
        _rotationalProperties = {},
        _isNullTransform = function _isNullTransform(value) {
      return value === "matrix(1, 0, 0, 1, 0, 0)" || value === "none" || !value;
    },
        _getComputedTransformMatrixAsArray = function _getComputedTransformMatrixAsArray(target) {
      var matrixString = _getComputedProperty(target, _transformProp);

      return _isNullTransform(matrixString) ? _identity2DMatrix : matrixString.substr(7).match(_numExp).map(_round);
    },
        _getMatrix = function _getMatrix(target, force2D) {
      var cache = target._gsap || _getCache(target),
          style = target.style,
          matrix = _getComputedTransformMatrixAsArray(target),
          parent,
          nextSibling,
          temp,
          addedToDOM;

      if (cache.svg && target.getAttribute("transform")) {
        temp = target.transform.baseVal.consolidate().matrix; //ensures that even complex values like "translate(50,60) rotate(135,0,0)" are parsed because it mashes it into a matrix.

        matrix = [temp.a, temp.b, temp.c, temp.d, temp.e, temp.f];
        return matrix.join(",") === "1,0,0,1,0,0" ? _identity2DMatrix : matrix;
      } else if (matrix === _identity2DMatrix && !target.offsetParent && target !== _docElement && !cache.svg) {
        //note: if offsetParent is null, that means the element isn't in the normal document flow, like if it has display:none or one of its ancestors has display:none). Firefox returns null for getComputedStyle() if the element is in an iframe that has display:none. https://bugzilla.mozilla.org/show_bug.cgi?id=548397
        //browsers don't report transforms accurately unless the element is in the DOM and has a display value that's not "none". Firefox and Microsoft browsers have a partial bug where they'll report transforms even if display:none BUT not any percentage-based values like translate(-50%, 8px) will be reported as if it's translate(0, 8px).
        temp = style.display;
        style.display = "block";
        parent = target.parentNode;

        if (!parent || !target.offsetParent) {
          // note: in 3.3.0 we switched target.offsetParent to _doc.body.contains(target) to avoid [sometimes unnecessary] MutationObserver calls but that wasn't adequate because there are edge cases where nested position: fixed elements need to get reparented to accurately sense transforms. See https://github.com/greensock/GSAP/issues/388 and https://github.com/greensock/GSAP/issues/375
          addedToDOM = 1; //flag

          nextSibling = target.nextSibling;

          _docElement.appendChild(target); //we must add it to the DOM in order to get values properly

        }

        matrix = _getComputedTransformMatrixAsArray(target);
        temp ? style.display = temp : _removeProperty(target, "display");

        if (addedToDOM) {
          nextSibling ? parent.insertBefore(target, nextSibling) : parent ? parent.appendChild(target) : _docElement.removeChild(target);
        }
      }

      return force2D && matrix.length > 6 ? [matrix[0], matrix[1], matrix[4], matrix[5], matrix[12], matrix[13]] : matrix;
    },
        _applySVGOrigin = function _applySVGOrigin(target, origin, originIsAbsolute, smooth, matrixArray, pluginToAddPropTweensTo) {
      var cache = target._gsap,
          matrix = matrixArray || _getMatrix(target, true),
          xOriginOld = cache.xOrigin || 0,
          yOriginOld = cache.yOrigin || 0,
          xOffsetOld = cache.xOffset || 0,
          yOffsetOld = cache.yOffset || 0,
          a = matrix[0],
          b = matrix[1],
          c = matrix[2],
          d = matrix[3],
          tx = matrix[4],
          ty = matrix[5],
          originSplit = origin.split(" "),
          xOrigin = parseFloat(originSplit[0]) || 0,
          yOrigin = parseFloat(originSplit[1]) || 0,
          bounds,
          determinant,
          x,
          y;

      if (!originIsAbsolute) {
        bounds = _getBBox(target);
        xOrigin = bounds.x + (~originSplit[0].indexOf("%") ? xOrigin / 100 * bounds.width : xOrigin);
        yOrigin = bounds.y + (~(originSplit[1] || originSplit[0]).indexOf("%") ? yOrigin / 100 * bounds.height : yOrigin);
      } else if (matrix !== _identity2DMatrix && (determinant = a * d - b * c)) {
        //if it's zero (like if scaleX and scaleY are zero), skip it to avoid errors with dividing by zero.
        x = xOrigin * (d / determinant) + yOrigin * (-c / determinant) + (c * ty - d * tx) / determinant;
        y = xOrigin * (-b / determinant) + yOrigin * (a / determinant) - (a * ty - b * tx) / determinant;
        xOrigin = x;
        yOrigin = y;
      }

      if (smooth || smooth !== false && cache.smooth) {
        tx = xOrigin - xOriginOld;
        ty = yOrigin - yOriginOld;
        cache.xOffset = xOffsetOld + (tx * a + ty * c) - tx;
        cache.yOffset = yOffsetOld + (tx * b + ty * d) - ty;
      } else {
        cache.xOffset = cache.yOffset = 0;
      }

      cache.xOrigin = xOrigin;
      cache.yOrigin = yOrigin;
      cache.smooth = !!smooth;
      cache.origin = origin;
      cache.originIsAbsolute = !!originIsAbsolute;
      target.style[_transformOriginProp] = "0px 0px"; //otherwise, if someone sets  an origin via CSS, it will likely interfere with the SVG transform attribute ones (because remember, we're baking the origin into the matrix() value).

      if (pluginToAddPropTweensTo) {
        _addNonTweeningPT(pluginToAddPropTweensTo, cache, "xOrigin", xOriginOld, xOrigin);

        _addNonTweeningPT(pluginToAddPropTweensTo, cache, "yOrigin", yOriginOld, yOrigin);

        _addNonTweeningPT(pluginToAddPropTweensTo, cache, "xOffset", xOffsetOld, cache.xOffset);

        _addNonTweeningPT(pluginToAddPropTweensTo, cache, "yOffset", yOffsetOld, cache.yOffset);
      }

      target.setAttribute("data-svg-origin", xOrigin + " " + yOrigin);
    },
        _parseTransform = function _parseTransform(target, uncache) {
      var cache = target._gsap || new GSCache(target);

      if ("x" in cache && !uncache && !cache.uncache) {
        return cache;
      }

      var style = target.style,
          invertedScaleX = cache.scaleX < 0,
          px = "px",
          deg = "deg",
          origin = _getComputedProperty(target, _transformOriginProp) || "0",
          x,
          y,
          z,
          scaleX,
          scaleY,
          rotation,
          rotationX,
          rotationY,
          skewX,
          skewY,
          perspective,
          xOrigin,
          yOrigin,
          matrix,
          angle,
          cos,
          sin,
          a,
          b,
          c,
          d,
          a12,
          a22,
          t1,
          t2,
          t3,
          a13,
          a23,
          a33,
          a42,
          a43,
          a32;
      x = y = z = rotation = rotationX = rotationY = skewX = skewY = perspective = 0;
      scaleX = scaleY = 1;
      cache.svg = !!(target.getCTM && _isSVG(target));
      matrix = _getMatrix(target, cache.svg);

      if (cache.svg) {
        t1 = !cache.uncache && target.getAttribute("data-svg-origin");

        _applySVGOrigin(target, t1 || origin, !!t1 || cache.originIsAbsolute, cache.smooth !== false, matrix);
      }

      xOrigin = cache.xOrigin || 0;
      yOrigin = cache.yOrigin || 0;

      if (matrix !== _identity2DMatrix) {
        a = matrix[0]; //a11

        b = matrix[1]; //a21

        c = matrix[2]; //a31

        d = matrix[3]; //a41

        x = a12 = matrix[4];
        y = a22 = matrix[5]; //2D matrix

        if (matrix.length === 6) {
          scaleX = Math.sqrt(a * a + b * b);
          scaleY = Math.sqrt(d * d + c * c);
          rotation = a || b ? _atan2(b, a) * _RAD2DEG : 0; //note: if scaleX is 0, we cannot accurately measure rotation. Same for skewX with a scaleY of 0. Therefore, we default to the previously recorded value (or zero if that doesn't exist).

          skewX = c || d ? _atan2(c, d) * _RAD2DEG + rotation : 0;
          skewX && (scaleY *= Math.cos(skewX * _DEG2RAD));

          if (cache.svg) {
            x -= xOrigin - (xOrigin * a + yOrigin * c);
            y -= yOrigin - (xOrigin * b + yOrigin * d);
          } //3D matrix

        } else {
          a32 = matrix[6];
          a42 = matrix[7];
          a13 = matrix[8];
          a23 = matrix[9];
          a33 = matrix[10];
          a43 = matrix[11];
          x = matrix[12];
          y = matrix[13];
          z = matrix[14];
          angle = _atan2(a32, a33);
          rotationX = angle * _RAD2DEG; //rotationX

          if (angle) {
            cos = Math.cos(-angle);
            sin = Math.sin(-angle);
            t1 = a12 * cos + a13 * sin;
            t2 = a22 * cos + a23 * sin;
            t3 = a32 * cos + a33 * sin;
            a13 = a12 * -sin + a13 * cos;
            a23 = a22 * -sin + a23 * cos;
            a33 = a32 * -sin + a33 * cos;
            a43 = a42 * -sin + a43 * cos;
            a12 = t1;
            a22 = t2;
            a32 = t3;
          } //rotationY


          angle = _atan2(-c, a33);
          rotationY = angle * _RAD2DEG;

          if (angle) {
            cos = Math.cos(-angle);
            sin = Math.sin(-angle);
            t1 = a * cos - a13 * sin;
            t2 = b * cos - a23 * sin;
            t3 = c * cos - a33 * sin;
            a43 = d * sin + a43 * cos;
            a = t1;
            b = t2;
            c = t3;
          } //rotationZ


          angle = _atan2(b, a);
          rotation = angle * _RAD2DEG;

          if (angle) {
            cos = Math.cos(angle);
            sin = Math.sin(angle);
            t1 = a * cos + b * sin;
            t2 = a12 * cos + a22 * sin;
            b = b * cos - a * sin;
            a22 = a22 * cos - a12 * sin;
            a = t1;
            a12 = t2;
          }

          if (rotationX && Math.abs(rotationX) + Math.abs(rotation) > 359.9) {
            //when rotationY is set, it will often be parsed as 180 degrees different than it should be, and rotationX and rotation both being 180 (it looks the same), so we adjust for that here.
            rotationX = rotation = 0;
            rotationY = 180 - rotationY;
          }

          scaleX = _round(Math.sqrt(a * a + b * b + c * c));
          scaleY = _round(Math.sqrt(a22 * a22 + a32 * a32));
          angle = _atan2(a12, a22);
          skewX = Math.abs(angle) > 0.0002 ? angle * _RAD2DEG : 0;
          perspective = a43 ? 1 / (a43 < 0 ? -a43 : a43) : 0;
        }

        if (cache.svg) {
          //sense if there are CSS transforms applied on an SVG element in which case we must overwrite them when rendering. The transform attribute is more reliable cross-browser, but we can't just remove the CSS ones because they may be applied in a CSS rule somewhere (not just inline).
          t1 = target.getAttribute("transform");
          cache.forceCSS = target.setAttribute("transform", "") || !_isNullTransform(_getComputedProperty(target, _transformProp));
          t1 && target.setAttribute("transform", t1);
        }
      }

      if (Math.abs(skewX) > 90 && Math.abs(skewX) < 270) {
        if (invertedScaleX) {
          scaleX *= -1;
          skewX += rotation <= 0 ? 180 : -180;
          rotation += rotation <= 0 ? 180 : -180;
        } else {
          scaleY *= -1;
          skewX += skewX <= 0 ? 180 : -180;
        }
      }

      cache.x = ((cache.xPercent = x && Math.round(target.offsetWidth / 2) === Math.round(-x) ? -50 : 0) ? 0 : x) + px;
      cache.y = ((cache.yPercent = y && Math.round(target.offsetHeight / 2) === Math.round(-y) ? -50 : 0) ? 0 : y) + px;
      cache.z = z + px;
      cache.scaleX = _round(scaleX);
      cache.scaleY = _round(scaleY);
      cache.rotation = _round(rotation) + deg;
      cache.rotationX = _round(rotationX) + deg;
      cache.rotationY = _round(rotationY) + deg;
      cache.skewX = skewX + deg;
      cache.skewY = skewY + deg;
      cache.transformPerspective = perspective + px;

      if (cache.zOrigin = parseFloat(origin.split(" ")[2]) || 0) {
        style[_transformOriginProp] = _firstTwoOnly(origin);
      }

      cache.xOffset = cache.yOffset = 0;
      cache.force3D = _config.force3D;
      cache.renderTransform = cache.svg ? _renderSVGTransforms : _supports3D ? _renderCSSTransforms : _renderNon3DTransforms;
      cache.uncache = 0;
      return cache;
    },
        _firstTwoOnly = function _firstTwoOnly(value) {
      return (value = value.split(" "))[0] + " " + value[1];
    },
        //for handling transformOrigin values, stripping out the 3rd dimension
    _addPxTranslate = function _addPxTranslate(target, start, value) {
      var unit = getUnit(start);
      return _round(parseFloat(start) + parseFloat(_convertToUnit(target, "x", value + "px", unit))) + unit;
    },
        _renderNon3DTransforms = function _renderNon3DTransforms(ratio, cache) {
      cache.z = "0px";
      cache.rotationY = cache.rotationX = "0deg";
      cache.force3D = 0;

      _renderCSSTransforms(ratio, cache);
    },
        _zeroDeg = "0deg",
        _zeroPx = "0px",
        _endParenthesis = ") ",
        _renderCSSTransforms = function _renderCSSTransforms(ratio, cache) {
      var _ref = cache || this,
          xPercent = _ref.xPercent,
          yPercent = _ref.yPercent,
          x = _ref.x,
          y = _ref.y,
          z = _ref.z,
          rotation = _ref.rotation,
          rotationY = _ref.rotationY,
          rotationX = _ref.rotationX,
          skewX = _ref.skewX,
          skewY = _ref.skewY,
          scaleX = _ref.scaleX,
          scaleY = _ref.scaleY,
          transformPerspective = _ref.transformPerspective,
          force3D = _ref.force3D,
          target = _ref.target,
          zOrigin = _ref.zOrigin,
          transforms = "",
          use3D = force3D === "auto" && ratio && ratio !== 1 || force3D === true; // Safari has a bug that causes it not to render 3D transform-origin values properly, so we force the z origin to 0, record it in the cache, and then do the math here to offset the translate values accordingly (basically do the 3D transform-origin part manually)


      if (zOrigin && (rotationX !== _zeroDeg || rotationY !== _zeroDeg)) {
        var angle = parseFloat(rotationY) * _DEG2RAD,
            a13 = Math.sin(angle),
            a33 = Math.cos(angle),
            cos;

        angle = parseFloat(rotationX) * _DEG2RAD;
        cos = Math.cos(angle);
        x = _addPxTranslate(target, x, a13 * cos * -zOrigin);
        y = _addPxTranslate(target, y, -Math.sin(angle) * -zOrigin);
        z = _addPxTranslate(target, z, a33 * cos * -zOrigin + zOrigin);
      }

      if (transformPerspective !== _zeroPx) {
        transforms += "perspective(" + transformPerspective + _endParenthesis;
      }

      if (xPercent || yPercent) {
        transforms += "translate(" + xPercent + "%, " + yPercent + "%) ";
      }

      if (use3D || x !== _zeroPx || y !== _zeroPx || z !== _zeroPx) {
        transforms += z !== _zeroPx || use3D ? "translate3d(" + x + ", " + y + ", " + z + ") " : "translate(" + x + ", " + y + _endParenthesis;
      }

      if (rotation !== _zeroDeg) {
        transforms += "rotate(" + rotation + _endParenthesis;
      }

      if (rotationY !== _zeroDeg) {
        transforms += "rotateY(" + rotationY + _endParenthesis;
      }

      if (rotationX !== _zeroDeg) {
        transforms += "rotateX(" + rotationX + _endParenthesis;
      }

      if (skewX !== _zeroDeg || skewY !== _zeroDeg) {
        transforms += "skew(" + skewX + ", " + skewY + _endParenthesis;
      }

      if (scaleX !== 1 || scaleY !== 1) {
        transforms += "scale(" + scaleX + ", " + scaleY + _endParenthesis;
      }

      target.style[_transformProp] = transforms || "translate(0, 0)";
    },
        _renderSVGTransforms = function _renderSVGTransforms(ratio, cache) {
      var _ref2 = cache || this,
          xPercent = _ref2.xPercent,
          yPercent = _ref2.yPercent,
          x = _ref2.x,
          y = _ref2.y,
          rotation = _ref2.rotation,
          skewX = _ref2.skewX,
          skewY = _ref2.skewY,
          scaleX = _ref2.scaleX,
          scaleY = _ref2.scaleY,
          target = _ref2.target,
          xOrigin = _ref2.xOrigin,
          yOrigin = _ref2.yOrigin,
          xOffset = _ref2.xOffset,
          yOffset = _ref2.yOffset,
          forceCSS = _ref2.forceCSS,
          tx = parseFloat(x),
          ty = parseFloat(y),
          a11,
          a21,
          a12,
          a22,
          temp;

      rotation = parseFloat(rotation);
      skewX = parseFloat(skewX);
      skewY = parseFloat(skewY);

      if (skewY) {
        //for performance reasons, we combine all skewing into the skewX and rotation values. Remember, a skewY of 10 degrees looks the same as a rotation of 10 degrees plus a skewX of 10 degrees.
        skewY = parseFloat(skewY);
        skewX += skewY;
        rotation += skewY;
      }

      if (rotation || skewX) {
        rotation *= _DEG2RAD;
        skewX *= _DEG2RAD;
        a11 = Math.cos(rotation) * scaleX;
        a21 = Math.sin(rotation) * scaleX;
        a12 = Math.sin(rotation - skewX) * -scaleY;
        a22 = Math.cos(rotation - skewX) * scaleY;

        if (skewX) {
          skewY *= _DEG2RAD;
          temp = Math.tan(skewX - skewY);
          temp = Math.sqrt(1 + temp * temp);
          a12 *= temp;
          a22 *= temp;

          if (skewY) {
            temp = Math.tan(skewY);
            temp = Math.sqrt(1 + temp * temp);
            a11 *= temp;
            a21 *= temp;
          }
        }

        a11 = _round(a11);
        a21 = _round(a21);
        a12 = _round(a12);
        a22 = _round(a22);
      } else {
        a11 = scaleX;
        a22 = scaleY;
        a21 = a12 = 0;
      }

      if (tx && !~(x + "").indexOf("px") || ty && !~(y + "").indexOf("px")) {
        tx = _convertToUnit(target, "x", x, "px");
        ty = _convertToUnit(target, "y", y, "px");
      }

      if (xOrigin || yOrigin || xOffset || yOffset) {
        tx = _round(tx + xOrigin - (xOrigin * a11 + yOrigin * a12) + xOffset);
        ty = _round(ty + yOrigin - (xOrigin * a21 + yOrigin * a22) + yOffset);
      }

      if (xPercent || yPercent) {
        //The SVG spec doesn't support percentage-based translation in the "transform" attribute, so we merge it into the translation to simulate it.
        temp = target.getBBox();
        tx = _round(tx + xPercent / 100 * temp.width);
        ty = _round(ty + yPercent / 100 * temp.height);
      }

      temp = "matrix(" + a11 + "," + a21 + "," + a12 + "," + a22 + "," + tx + "," + ty + ")";
      target.setAttribute("transform", temp);

      if (forceCSS) {
        //some browsers prioritize CSS transforms over the transform attribute. When we sense that the user has CSS transforms applied, we must overwrite them this way (otherwise some browser simply won't render the  transform attribute changes!)
        target.style[_transformProp] = temp;
      }
    },
        _addRotationalPropTween = function _addRotationalPropTween(plugin, target, property, startNum, endValue, relative) {
      var cap = 360,
          isString = _isString(endValue),
          endNum = parseFloat(endValue) * (isString && ~endValue.indexOf("rad") ? _RAD2DEG : 1),
          change = relative ? endNum * relative : endNum - startNum,
          finalValue = startNum + change + "deg",
          direction,
          pt;

      if (isString) {
        direction = endValue.split("_")[1];

        if (direction === "short") {
          change %= cap;

          if (change !== change % (cap / 2)) {
            change += change < 0 ? cap : -cap;
          }
        }

        if (direction === "cw" && change < 0) {
          change = (change + cap * _bigNum$1) % cap - ~~(change / cap) * cap;
        } else if (direction === "ccw" && change > 0) {
          change = (change - cap * _bigNum$1) % cap - ~~(change / cap) * cap;
        }
      }

      plugin._pt = pt = new PropTween(plugin._pt, target, property, startNum, change, _renderPropWithEnd);
      pt.e = finalValue;
      pt.u = "deg";

      plugin._props.push(property);

      return pt;
    },
        _addRawTransformPTs = function _addRawTransformPTs(plugin, transforms, target) {
      //for handling cases where someone passes in a whole transform string, like transform: "scale(2, 3) rotate(20deg) translateY(30em)"
      var style = _tempDivStyler.style,
          startCache = target._gsap,
          exclude = "perspective,force3D,transformOrigin,svgOrigin",
          endCache,
          p,
          startValue,
          endValue,
          startNum,
          endNum,
          startUnit,
          endUnit;
      style.cssText = getComputedStyle(target).cssText + ";position:absolute;display:block;"; //%-based translations will fail unless we set the width/height to match the original target (and padding/borders can affect it)

      style[_transformProp] = transforms;

      _doc$1.body.appendChild(_tempDivStyler);

      endCache = _parseTransform(_tempDivStyler, 1);

      for (p in _transformProps) {
        startValue = startCache[p];
        endValue = endCache[p];

        if (startValue !== endValue && exclude.indexOf(p) < 0) {
          //tweening to no perspective gives very unintuitive results - just keep the same perspective in that case.
          startUnit = getUnit(startValue);
          endUnit = getUnit(endValue);
          startNum = startUnit !== endUnit ? _convertToUnit(target, p, startValue, endUnit) : parseFloat(startValue);
          endNum = parseFloat(endValue);
          plugin._pt = new PropTween(plugin._pt, startCache, p, startNum, endNum - startNum, _renderCSSProp);
          plugin._pt.u = endUnit || 0;

          plugin._props.push(p);
        }
      }

      _doc$1.body.removeChild(_tempDivStyler);
    }; // handle splitting apart padding, margin, borderWidth, and borderRadius into their 4 components. Firefox, for example, won't report borderRadius correctly - it will only do borderTopLeftRadius and the other corners. We also want to handle paddingTop, marginLeft, borderRightWidth, etc.


    _forEachName("padding,margin,Width,Radius", function (name, index) {
      var t = "Top",
          r = "Right",
          b = "Bottom",
          l = "Left",
          props = (index < 3 ? [t, r, b, l] : [t + l, t + r, b + r, b + l]).map(function (side) {
        return index < 2 ? name + side : "border" + side + name;
      });

      _specialProps[index > 1 ? "border" + name : name] = function (plugin, target, property, endValue, tween) {
        var a, vars;

        if (arguments.length < 4) {
          // getter, passed target, property, and unit (from _get())
          a = props.map(function (prop) {
            return _get(plugin, prop, property);
          });
          vars = a.join(" ");
          return vars.split(a[0]).length === 5 ? a[0] : vars;
        }

        a = (endValue + "").split(" ");
        vars = {};
        props.forEach(function (prop, i) {
          return vars[prop] = a[i] = a[i] || a[(i - 1) / 2 | 0];
        });
        plugin.init(target, vars, tween);
      };
    });

    var CSSPlugin = {
      name: "css",
      register: _initCore,
      targetTest: function targetTest(target) {
        return target.style && target.nodeType;
      },
      init: function init(target, vars, tween, index, targets) {
        var props = this._props,
            style = target.style,
            startValue,
            endValue,
            endNum,
            startNum,
            type,
            specialProp,
            p,
            startUnit,
            endUnit,
            relative,
            isTransformRelated,
            transformPropTween,
            cache,
            smooth,
            hasPriority;
        _pluginInitted || _initCore();

        for (p in vars) {
          if (p === "autoRound") {
            continue;
          }

          endValue = vars[p];

          if (_plugins[p] && _checkPlugin(p, vars, tween, index, target, targets)) {
            //plugins
            continue;
          }

          type = typeof endValue;
          specialProp = _specialProps[p];

          if (type === "function") {
            endValue = endValue.call(tween, index, target, targets);
            type = typeof endValue;
          }

          if (type === "string" && ~endValue.indexOf("random(")) {
            endValue = _replaceRandom(endValue);
          }

          if (specialProp) {
            if (specialProp(this, target, p, endValue, tween)) {
              hasPriority = 1;
            }
          } else if (p.substr(0, 2) === "--") {
            //CSS variable
            this.add(style, "setProperty", getComputedStyle(target).getPropertyValue(p) + "", endValue + "", index, targets, 0, 0, p);
          } else if (type !== "undefined") {
            startValue = _get(target, p);
            startNum = parseFloat(startValue);
            relative = type === "string" && endValue.charAt(1) === "=" ? +(endValue.charAt(0) + "1") : 0;

            if (relative) {
              endValue = endValue.substr(2);
            }

            endNum = parseFloat(endValue);

            if (p in _propertyAliases) {
              if (p === "autoAlpha") {
                //special case where we control the visibility along with opacity. We still allow the opacity value to pass through and get tweened.
                if (startNum === 1 && _get(target, "visibility") === "hidden" && endNum) {
                  //if visibility is initially set to "hidden", we should interpret that as intent to make opacity 0 (a convenience)
                  startNum = 0;
                }

                _addNonTweeningPT(this, style, "visibility", startNum ? "inherit" : "hidden", endNum ? "inherit" : "hidden", !endNum);
              }

              if (p !== "scale" && p !== "transform") {
                p = _propertyAliases[p];
                ~p.indexOf(",") && (p = p.split(",")[0]);
              }
            }

            isTransformRelated = p in _transformProps; //--- TRANSFORM-RELATED ---

            if (isTransformRelated) {
              if (!transformPropTween) {
                cache = target._gsap;
                cache.renderTransform || _parseTransform(target); // if, for example, gsap.set(... {transform:"translateX(50vw)"}), the _get() call doesn't parse the transform, thus cache.renderTransform won't be set yet so force the parsing of the transform here.

                smooth = vars.smoothOrigin !== false && cache.smooth;
                transformPropTween = this._pt = new PropTween(this._pt, style, _transformProp, 0, 1, cache.renderTransform, cache, 0, -1); //the first time through, create the rendering PropTween so that it runs LAST (in the linked list, we keep adding to the beginning)

                transformPropTween.dep = 1; //flag it as dependent so that if things get killed/overwritten and this is the only PropTween left, we can safely kill the whole tween.
              }

              if (p === "scale") {
                this._pt = new PropTween(this._pt, cache, "scaleY", cache.scaleY, relative ? relative * endNum : endNum - cache.scaleY);
                props.push("scaleY", p);
                p += "X";
              } else if (p === "transformOrigin") {
                endValue = _convertKeywordsToPercentages(endValue); //in case something like "left top" or "bottom right" is passed in. Convert to percentages.

                if (cache.svg) {
                  _applySVGOrigin(target, endValue, 0, smooth, 0, this);
                } else {
                  endUnit = parseFloat(endValue.split(" ")[2]) || 0; //handle the zOrigin separately!

                  endUnit !== cache.zOrigin && _addNonTweeningPT(this, cache, "zOrigin", cache.zOrigin, endUnit);

                  _addNonTweeningPT(this, style, p, _firstTwoOnly(startValue), _firstTwoOnly(endValue));
                }

                continue;
              } else if (p === "svgOrigin") {
                _applySVGOrigin(target, endValue, 1, smooth, 0, this);

                continue;
              } else if (p in _rotationalProperties) {
                _addRotationalPropTween(this, cache, p, startNum, endValue, relative);

                continue;
              } else if (p === "smoothOrigin") {
                _addNonTweeningPT(this, cache, "smooth", cache.smooth, endValue);

                continue;
              } else if (p === "force3D") {
                cache[p] = endValue;
                continue;
              } else if (p === "transform") {
                _addRawTransformPTs(this, endValue, target);

                continue;
              }
            } else if (!(p in style)) {
              p = _checkPropPrefix(p) || p;
            }

            if (isTransformRelated || (endNum || endNum === 0) && (startNum || startNum === 0) && !_complexExp.test(endValue) && p in style) {
              startUnit = (startValue + "").substr((startNum + "").length);
              endNum || (endNum = 0); // protect against NaN

              endUnit = getUnit(endValue) || (p in _config.units ? _config.units[p] : startUnit);
              startUnit !== endUnit && (startNum = _convertToUnit(target, p, startValue, endUnit));
              this._pt = new PropTween(this._pt, isTransformRelated ? cache : style, p, startNum, relative ? relative * endNum : endNum - startNum, endUnit === "px" && vars.autoRound !== false && !isTransformRelated ? _renderRoundedCSSProp : _renderCSSProp);
              this._pt.u = endUnit || 0;

              if (startUnit !== endUnit) {
                //when the tween goes all the way back to the beginning, we need to revert it to the OLD/ORIGINAL value (with those units). We record that as a "b" (beginning) property and point to a render method that handles that. (performance optimization)
                this._pt.b = startValue;
                this._pt.r = _renderCSSPropWithBeginning;
              }
            } else if (!(p in style)) {
              if (p in target) {
                //maybe it's not a style - it could be a property added directly to an element in which case we'll try to animate that.
                this.add(target, p, target[p], endValue, index, targets);
              } else {
                _missingPlugin(p, endValue);

                continue;
              }
            } else {
              _tweenComplexCSSString.call(this, target, p, startValue, endValue);
            }

            props.push(p);
          }
        }

        hasPriority && _sortPropTweensByPriority(this);
      },
      get: _get,
      aliases: _propertyAliases,
      getSetter: function getSetter(target, property, plugin) {
        //returns a setter function that accepts target, property, value and applies it accordingly. Remember, properties like "x" aren't as simple as target.style.property = value because they've got to be applied to a proxy object and then merged into a transform string in a renderer.
        var p = _propertyAliases[property];
        p && p.indexOf(",") < 0 && (property = p);
        return property in _transformProps && property !== _transformOriginProp && (target._gsap.x || _get(target, "x")) ? plugin && _recentSetterPlugin === plugin ? property === "scale" ? _setterScale : _setterTransform : (_recentSetterPlugin = plugin || {}) && (property === "scale" ? _setterScaleWithRender : _setterTransformWithRender) : target.style && !_isUndefined(target.style[property]) ? _setterCSSStyle : ~property.indexOf("-") ? _setterCSSProp : _getSetter(target, property);
      },
      core: {
        _removeProperty: _removeProperty,
        _getMatrix: _getMatrix
      }
    };
    gsap.utils.checkPrefix = _checkPropPrefix;

    (function (positionAndScale, rotation, others, aliases) {
      var all = _forEachName(positionAndScale + "," + rotation + "," + others, function (name) {
        _transformProps[name] = 1;
      });

      _forEachName(rotation, function (name) {
        _config.units[name] = "deg";
        _rotationalProperties[name] = 1;
      });

      _propertyAliases[all[13]] = positionAndScale + "," + rotation;

      _forEachName(aliases, function (name) {
        var split = name.split(":");
        _propertyAliases[split[1]] = all[split[0]];
      });
    })("x,y,z,scale,scaleX,scaleY,xPercent,yPercent", "rotation,rotationX,rotationY,skewX,skewY", "transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective", "0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY");

    _forEachName("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective", function (name) {
      _config.units[name] = "px";
    });

    gsap.registerPlugin(CSSPlugin);

    var gsapWithCSS = gsap.registerPlugin(CSSPlugin) || gsap,
        // to protect from tree shaking
    TweenMaxWithCSS = gsapWithCSS.core.Tween;

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    /* src/componenets/clickOutside.svelte generated by Svelte v3.29.4 */
    const file = "src/componenets/clickOutside.svelte";

    function create_fragment(ctx) {
    	let t;
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			t = space();
    			div = element("div");
    			if (default_slot) default_slot.c();
    			add_location(div, file, 31, 0, 549);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[5](div);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(document.body, "click", /*onClickOutside*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[5](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ClickOutside", slots, ['default']);
    	let { exclude = [] } = $$props;
    	let child;
    	const dispatch = createEventDispatcher();

    	function isExcluded(target) {
    		var parent = target;

    		while (parent) {
    			if (exclude.indexOf(parent) >= 0 || parent === child) {
    				return true;
    			}

    			parent = parent.parentNode;
    		}

    		return false;
    	}

    	function onClickOutside(event) {
    		if (!isExcluded(event.target)) {
    			dispatch("clickoutside");
    		}
    	}

    	const writable_props = ["exclude"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ClickOutside> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			child = $$value;
    			$$invalidate(0, child);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("exclude" in $$props) $$invalidate(2, exclude = $$props.exclude);
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		exclude,
    		child,
    		dispatch,
    		isExcluded,
    		onClickOutside
    	});

    	$$self.$inject_state = $$props => {
    		if ("exclude" in $$props) $$invalidate(2, exclude = $$props.exclude);
    		if ("child" in $$props) $$invalidate(0, child = $$props.child);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [child, onClickOutside, exclude, $$scope, slots, div_binding];
    }

    class ClickOutside extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { exclude: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ClickOutside",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get exclude() {
    		throw new Error("<ClickOutside>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set exclude(value) {
    		throw new Error("<ClickOutside>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/componenets/menu.svelte generated by Svelte v3.29.4 */
    const file$1 = "src/componenets/menu.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i].txt;
    	child_ctx[8] = list[i].href;
    	child_ctx[10] = i;
    	return child_ctx;
    }

    // (81:2) {#if open}
    function create_if_block(ctx) {
    	let clickoutside;
    	let current;

    	clickoutside = new ClickOutside({
    			props: {
    				exclude: [/*hamburglar*/ ctx[1]],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	clickoutside.$on("clickoutside", /*handleClick*/ ctx[4]);

    	const block = {
    		c: function create() {
    			create_component(clickoutside.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(clickoutside, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const clickoutside_changes = {};
    			if (dirty & /*hamburglar*/ 2) clickoutside_changes.exclude = [/*hamburglar*/ ctx[1]];

    			if (dirty & /*$$scope, open*/ 2049) {
    				clickoutside_changes.$$scope = { dirty, ctx };
    			}

    			clickoutside.$set(clickoutside_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(clickoutside.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(clickoutside.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(clickoutside, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(81:2) {#if open}",
    		ctx
    	});

    	return block;
    }

    // (86:12) {#if open}
    function create_if_block_1(ctx) {
    	let li;
    	let button;
    	let t0_value = /*txt*/ ctx[7] + "";
    	let t0;
    	let t1;
    	let li_intro;
    	let mounted;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[5](/*href*/ ctx[8], ...args);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			button = element("button");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(button, "class", "svelte-36p38v");
    			add_location(button, file$1, 87, 16, 1669);
    			attr_dev(li, "class", "svelte-36p38v");
    			add_location(li, file$1, 86, 14, 1598);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, button);
    			append_dev(button, t0);
    			append_dev(li, t1);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (!li_intro) {
    				add_render_callback(() => {
    					li_intro = create_in_transition(li, fly, {
    						y: -35,
    						duration: 120,
    						delay: /*i*/ ctx[10] * 50 + 100
    					});

    					li_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(86:12) {#if open}",
    		ctx
    	});

    	return block;
    }

    // (85:10) {#each menu as {txt,href}
    function create_each_block(ctx) {
    	let if_block_anchor;
    	let if_block = /*open*/ ctx[0] && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*open*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*open*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			transition_in(if_block);
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(85:10) {#each menu as {txt,href}",
    		ctx
    	});

    	return block;
    }

    // (82:4) <ClickOutside on:clickoutside={handleClick} exclude={[hamburglar]}>
    function create_default_slot(ctx) {
    	let nav;
    	let ul;
    	let nav_transition;
    	let current;
    	let each_value = /*menu*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(ul, file$1, 83, 8, 1517);
    			attr_dev(nav, "class", "menu svelte-36p38v");
    			add_location(nav, file$1, 82, 6, 1446);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*menuAct, menu, open*/ 13) {
    				each_value = /*menu*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			add_render_callback(() => {
    				if (!nav_transition) nav_transition = create_bidirectional_transition(nav, fly, { y: 50, duration: 140 }, true);
    				nav_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!nav_transition) nav_transition = create_bidirectional_transition(nav, fly, { y: 50, duration: 140 }, false);
    			nav_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			destroy_each(each_blocks, detaching);
    			if (detaching && nav_transition) nav_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(82:4) <ClickOutside on:clickoutside={handleClick} exclude={[hamburglar]}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let t0;
    	let button;
    	let svg;
    	let g;
    	let line0;
    	let line1;
    	let line2;
    	let t1;
    	let span0;
    	let t2;
    	let span1;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*open*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			button = element("button");
    			svg = svg_element("svg");
    			g = svg_element("g");
    			line0 = svg_element("line");
    			line1 = svg_element("line");
    			line2 = svg_element("line");
    			t1 = space();
    			span0 = element("span");
    			t2 = space();
    			span1 = element("span");
    			attr_dev(line0, "id", "line3");
    			attr_dev(line0, "x1", "10");
    			attr_dev(line0, "y1", "41.5");
    			attr_dev(line0, "x2", "50");
    			attr_dev(line0, "y2", "41.5");
    			attr_dev(line0, "stroke", "#454545");
    			add_location(line0, file$1, 103, 8, 2083);
    			attr_dev(line1, "id", "line2");
    			attr_dev(line1, "x1", "10");
    			attr_dev(line1, "y1", "29.5");
    			attr_dev(line1, "x2", "50");
    			attr_dev(line1, "y2", "29.5");
    			attr_dev(line1, "stroke", "#454545");
    			add_location(line1, file$1, 104, 8, 2163);
    			attr_dev(line2, "id", "line1");
    			attr_dev(line2, "x1", "10");
    			attr_dev(line2, "y1", "17.5");
    			attr_dev(line2, "x2", "50");
    			attr_dev(line2, "y2", "17.5");
    			attr_dev(line2, "stroke", "#454545");
    			add_location(line2, file$1, 105, 8, 2243);
    			add_location(g, file$1, 102, 6, 2071);
    			attr_dev(svg, "width", "60");
    			attr_dev(svg, "height", "60");
    			attr_dev(svg, "viewBox", "0 0 60 60");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$1, 100, 4, 1963);
    			attr_dev(span0, "class", "circle circle-burst");
    			add_location(span0, file$1, 108, 4, 2341);
    			attr_dev(span1, "class", "circle circle-crawl");
    			add_location(span1, file$1, 109, 4, 2387);
    			attr_dev(button, "class", "hamburguesa svelte-36p38v");
    			add_location(button, file$1, 95, 2, 1836);
    			attr_dev(div, "class", "container svelte-36p38v");
    			add_location(div, file$1, 79, 0, 1331);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t0);
    			append_dev(div, button);
    			append_dev(button, svg);
    			append_dev(svg, g);
    			append_dev(g, line0);
    			append_dev(g, line1);
    			append_dev(g, line2);
    			append_dev(button, t1);
    			append_dev(button, span0);
    			append_dev(button, t2);
    			append_dev(button, span1);
    			/*button_binding*/ ctx[6](button);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*handleClick*/ ctx[4], false, false, false),
    					listen_dev(button, "mouseenter", playWiggle, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*open*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*open*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, t0);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			/*button_binding*/ ctx[6](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function playWiggle() {
    	
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Menu", slots, []);
    	let open = false;
    	let hamburglar;

    	const menu = [
    		{ txt: "Home", href: "main" },
    		{ txt: "Projects", href: "projects" },
    		{ txt: "Contact", href: "contact" }
    	];

    	function menuAct(t) {
    		handleClick();
    		let e = document.getElementById(t);

    		e.scrollIntoView({
    			block: "start",
    			behavior: "smooth",
    			inline: "start"
    		});
    	}

    	function handleClick() {
    		$$invalidate(0, open = !open);

    		if (open) {
    			const tl = gsapWithCSS.timeline();
    			tl.to("#line1", { rotate: 225, y: 12 }).to("#line3", { rotate: -225, y: -12 }, "<").to("#line2", { opacity: 0 }, "<");
    		} else {
    			const tl = gsapWithCSS.timeline();
    			tl.to("#line1", { rotate: 0, y: 0 }).to("#line3", { rotate: 0, y: 0 }, "<").to("#line2", { opacity: 1 }, "<");
    		}
    	}

    	onMount(() => {
    		gsapWithCSS.set("#line1", { transformOrigin: "50% 50%" });
    		gsapWithCSS.set("#line3", { transformOrigin: "50% 50%" });
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Menu> was created with unknown prop '${key}'`);
    	});

    	const click_handler = href => menuAct(href);

    	function button_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			hamburglar = $$value;
    			$$invalidate(1, hamburglar);
    		});
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		gsap: gsapWithCSS,
    		fly,
    		ClickOutside,
    		open,
    		hamburglar,
    		menu,
    		menuAct,
    		handleClick,
    		playWiggle
    	});

    	$$self.$inject_state = $$props => {
    		if ("open" in $$props) $$invalidate(0, open = $$props.open);
    		if ("hamburglar" in $$props) $$invalidate(1, hamburglar = $$props.hamburglar);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [open, hamburglar, menu, menuAct, handleClick, click_handler, button_binding];
    }

    class Menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menu",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /*!
     * ScrollTrigger 3.5.1
     * https://greensock.com
     *
     * @license Copyright 2008-2020, GreenSock. All rights reserved.
     * Subject to the terms at https://greensock.com/standard-license or for
     * Club GreenSock members, the agreement issued with that membership.
     * @author: Jack Doyle, jack@greensock.com
    */

    /* eslint-disable */
    var gsap$1,
        _coreInitted$1,
        _win$2,
        _doc$2,
        _docEl,
        _body,
        _root,
        _resizeDelay,
        _raf,
        _request,
        _toArray,
        _clamp$1,
        _time2,
        _syncInterval,
        _refreshing,
        _pointerIsDown,
        _transformProp$1,
        _i,
        _prevWidth,
        _prevHeight,
        _autoRefresh,
        _sort,
        _limitCallbacks,
        // if true, we'll only trigger callbacks if the active state toggles, so if you scroll immediately past both the start and end positions of a ScrollTrigger (thus inactive to inactive), neither its onEnter nor onLeave will be called. This is useful during startup.
    _startup = 1,
        _proxies = [],
        _scrollers = [],
        _getTime = Date.now,
        _time1 = _getTime(),
        _lastScrollTime = 0,
        _enabled = 1,
        _passThrough$1 = function _passThrough(v) {
      return v;
    },
        _windowExists$2 = function _windowExists() {
      return typeof window !== "undefined";
    },
        _getGSAP = function _getGSAP() {
      return gsap$1 || _windowExists$2() && (gsap$1 = window.gsap) && gsap$1.registerPlugin && gsap$1;
    },
        _isViewport = function _isViewport(e) {
      return !!~_root.indexOf(e);
    },
        _getProxyProp = function _getProxyProp(element, property) {
      return ~_proxies.indexOf(element) && _proxies[_proxies.indexOf(element) + 1][property];
    },
        _getScrollFunc = function _getScrollFunc(element, _ref) {
      var s = _ref.s,
          sc = _ref.sc;

      var i = _scrollers.indexOf(element),
          offset = sc === _vertical.sc ? 1 : 2;

      !~i && (i = _scrollers.push(element) - 1);
      return _scrollers[i + offset] || (_scrollers[i + offset] = _getProxyProp(element, s) || (_isViewport(element) ? sc : function (value) {
        return arguments.length ? element[s] = value : element[s];
      }));
    },
        _getBoundsFunc = function _getBoundsFunc(element) {
      return _getProxyProp(element, "getBoundingClientRect") || (_isViewport(element) ? function () {
        _winOffsets.width = _win$2.innerWidth;
        _winOffsets.height = _win$2.innerHeight;
        return _winOffsets;
      } : function () {
        return _getBounds(element);
      });
    },
        _getSizeFunc = function _getSizeFunc(scroller, isViewport, _ref2) {
      var d = _ref2.d,
          d2 = _ref2.d2,
          a = _ref2.a;
      return (a = _getProxyProp(scroller, "getBoundingClientRect")) ? function () {
        return a()[d];
      } : function () {
        return (isViewport ? _win$2["inner" + d2] : scroller["client" + d2]) || 0;
      };
    },
        _getOffsetsFunc = function _getOffsetsFunc(element, isViewport) {
      return !isViewport || ~_proxies.indexOf(element) ? _getBoundsFunc(element) : function () {
        return _winOffsets;
      };
    },
        _maxScroll = function _maxScroll(element, _ref3) {
      var s = _ref3.s,
          d2 = _ref3.d2,
          d = _ref3.d,
          a = _ref3.a;
      return (s = "scroll" + d2) && (a = _getProxyProp(element, s)) ? a() - _getBoundsFunc(element)()[d] : _isViewport(element) ? Math.max(_docEl[s], _body[s]) - (_win$2["inner" + d2] || _docEl["client" + d2] || _body["client" + d2]) : element[s] - element["offset" + d2];
    },
        _iterateAutoRefresh = function _iterateAutoRefresh(func, events) {
      for (var i = 0; i < _autoRefresh.length; i += 3) {
        (!events || ~events.indexOf(_autoRefresh[i + 1])) && func(_autoRefresh[i], _autoRefresh[i + 1], _autoRefresh[i + 2]);
      }
    },
        _isString$1 = function _isString(value) {
      return typeof value === "string";
    },
        _isFunction$1 = function _isFunction(value) {
      return typeof value === "function";
    },
        _isNumber$1 = function _isNumber(value) {
      return typeof value === "number";
    },
        _isObject$1 = function _isObject(value) {
      return typeof value === "object";
    },
        _callIfFunc = function _callIfFunc(value) {
      return _isFunction$1(value) && value();
    },
        _combineFunc = function _combineFunc(f1, f2) {
      return function () {
        var result1 = _callIfFunc(f1),
            result2 = _callIfFunc(f2);

        return function () {
          _callIfFunc(result1);

          _callIfFunc(result2);
        };
      };
    },
        _abs = Math.abs,
        _scrollLeft = "scrollLeft",
        _scrollTop = "scrollTop",
        _left = "left",
        _top = "top",
        _right = "right",
        _bottom = "bottom",
        _width = "width",
        _height = "height",
        _Right = "Right",
        _Left = "Left",
        _Top = "Top",
        _Bottom = "Bottom",
        _padding = "padding",
        _margin = "margin",
        _Width = "Width",
        _Height = "Height",
        _px = "px",
        _horizontal = {
      s: _scrollLeft,
      p: _left,
      p2: _Left,
      os: _right,
      os2: _Right,
      d: _width,
      d2: _Width,
      a: "x",
      sc: function sc(value) {
        return arguments.length ? _win$2.scrollTo(value, _vertical.sc()) : _win$2.pageXOffset || _doc$2[_scrollLeft] || _docEl[_scrollLeft] || _body[_scrollLeft] || 0;
      }
    },
        _vertical = {
      s: _scrollTop,
      p: _top,
      p2: _Top,
      os: _bottom,
      os2: _Bottom,
      d: _height,
      d2: _Height,
      a: "y",
      op: _horizontal,
      sc: function sc(value) {
        return arguments.length ? _win$2.scrollTo(_horizontal.sc(), value) : _win$2.pageYOffset || _doc$2[_scrollTop] || _docEl[_scrollTop] || _body[_scrollTop] || 0;
      }
    },
        _getComputedStyle = function _getComputedStyle(element) {
      return _win$2.getComputedStyle(element);
    },
        _makePositionable = function _makePositionable(element) {
      return element.style.position = _getComputedStyle(element).position === "absolute" ? "absolute" : "relative";
    },
        // if the element already has position: absolute, leave that, otherwise make it position: relative
    _setDefaults$1 = function _setDefaults(obj, defaults) {
      for (var p in defaults) {
        p in obj || (obj[p] = defaults[p]);
      }

      return obj;
    },
        //_isInViewport = element => (element = _getBounds(element)) && !(element.top > (_win.innerHeight || _docEl.clientHeight) || element.bottom < 0 || element.left > (_win.innerWidth || _docEl.clientWidth) || element.right < 0) && element,
    _getBounds = function _getBounds(element, withoutTransforms) {
      var tween = withoutTransforms && _getComputedStyle(element)[_transformProp$1] !== "matrix(1, 0, 0, 1, 0, 0)" && gsap$1.to(element, {
        x: 0,
        y: 0,
        xPercent: 0,
        yPercent: 0,
        rotation: 0,
        rotationX: 0,
        rotationY: 0,
        scale: 1,
        skewX: 0,
        skewY: 0
      }).progress(1),
          bounds = element.getBoundingClientRect();
      tween && tween.progress(0).kill();
      return bounds;
    },
        _getSize = function _getSize(element, _ref4) {
      var d2 = _ref4.d2;
      return element["offset" + d2] || element["client" + d2] || 0;
    },
        _getLabels = function _getLabels(animation) {
      return function (value) {
        var a = [],
            labels = animation.labels,
            duration = animation.duration(),
            p;

        for (p in labels) {
          a.push(labels[p] / duration);
        }

        return gsap$1.utils.snap(a, value);
      };
    },
        _multiListener = function _multiListener(func, element, types, callback) {
      return types.split(",").forEach(function (type) {
        return func(element, type, callback);
      });
    },
        _addListener = function _addListener(element, type, func) {
      return element.addEventListener(type, func, {
        passive: true
      });
    },
        _removeListener = function _removeListener(element, type, func) {
      return element.removeEventListener(type, func);
    },
        _markerDefaults = {
      startColor: "green",
      endColor: "red",
      indent: 0,
      fontSize: "16px",
      fontWeight: "normal"
    },
        _defaults$1 = {
      toggleActions: "play",
      anticipatePin: 0
    },
        _keywords = {
      top: 0,
      left: 0,
      center: 0.5,
      bottom: 1,
      right: 1
    },
        _offsetToPx = function _offsetToPx(value, size) {
      if (_isString$1(value)) {
        var eqIndex = value.indexOf("="),
            relative = ~eqIndex ? +(value.charAt(eqIndex - 1) + 1) * parseFloat(value.substr(eqIndex + 1)) : 0;

        if (relative) {
          value.indexOf("%") > eqIndex && (relative *= size / 100);
          value = value.substr(0, eqIndex - 1);
        }

        value = relative + (value in _keywords ? _keywords[value] * size : ~value.indexOf("%") ? parseFloat(value) * size / 100 : parseFloat(value) || 0);
      }

      return value;
    },
        _createMarker = function _createMarker(type, name, container, direction, _ref5, offset, matchWidthEl) {
      var startColor = _ref5.startColor,
          endColor = _ref5.endColor,
          fontSize = _ref5.fontSize,
          indent = _ref5.indent,
          fontWeight = _ref5.fontWeight;

      var e = _doc$2.createElement("div"),
          useFixedPosition = _isViewport(container) || _getProxyProp(container, "pinType") === "fixed",
          isScroller = type.indexOf("scroller") !== -1,
          parent = useFixedPosition ? _body : container,
          isStart = type.indexOf("start") !== -1,
          color = isStart ? startColor : endColor,
          css = "border-color:" + color + ";font-size:" + fontSize + ";color:" + color + ";font-weight:" + fontWeight + ";pointer-events:none;white-space:nowrap;font-family:sans-serif,Arial;z-index:1000;padding:4px 8px;border-width:0;border-style:solid;";

      css += "position:" + (isScroller && useFixedPosition ? "fixed;" : "absolute;");
      (isScroller || !useFixedPosition) && (css += (direction === _vertical ? _right : _bottom) + ":" + (offset + parseFloat(indent)) + "px;");
      matchWidthEl && (css += "box-sizing:border-box;text-align:left;width:" + matchWidthEl.offsetWidth + "px;");
      e._isStart = isStart;
      e.setAttribute("class", "gsap-marker-" + type);
      e.style.cssText = css;
      e.innerText = name || name === 0 ? type + "-" + name : type;
      parent.insertBefore(e, parent.children[0]);
      e._offset = e["offset" + direction.op.d2];

      _positionMarker(e, 0, direction, isStart);

      return e;
    },
        _positionMarker = function _positionMarker(marker, start, direction, flipped) {
      var vars = {
        display: "block"
      },
          side = direction[flipped ? "os2" : "p2"],
          oppositeSide = direction[flipped ? "p2" : "os2"];
      marker._isFlipped = flipped;
      vars[direction.a + "Percent"] = flipped ? -100 : 0;
      vars[direction.a] = flipped ? 1 : 0;
      vars["border" + side + _Width] = 1;
      vars["border" + oppositeSide + _Width] = 0;
      vars[direction.p] = start;
      gsap$1.set(marker, vars);
    },
        _triggers = [],
        _ids = {},
        _sync = function _sync() {
      return _request || (_request = _raf(_updateAll));
    },
        _onScroll = function _onScroll() {
      if (!_request) {
        _request = _raf(_updateAll);
        _lastScrollTime || _dispatch("scrollStart");
        _lastScrollTime = _getTime();
      }
    },
        _onResize = function _onResize() {
      return !_refreshing && _resizeDelay.restart(true);
    },
        // ignore resizes triggered by refresh()
    _listeners = {},
        _emptyArray = [],
        _media = [],
        _creatingMedia,
        // when ScrollTrigger.matchMedia() is called, we record the current media key here (like "(min-width: 800px)") so that we can assign it to everything that's created during that call. Then we can revert just those when necessary. In the ScrollTrigger's init() call, the _creatingMedia is recorded as a "media" property on the instance.
    _lastMediaTick,
        _onMediaChange = function _onMediaChange(e) {
      var tick = gsap$1.ticker.frame,
          matches = [],
          i = 0,
          index;

      if (_lastMediaTick !== tick || _startup) {
        _revertAll();

        for (; i < _media.length; i += 4) {
          index = _win$2.matchMedia(_media[i]).matches;

          if (index !== _media[i + 3]) {
            // note: some browsers fire the matchMedia event multiple times, like when going full screen, so we shouldn't call the function multiple times. Check to see if it's already matched.
            _media[i + 3] = index;
            index ? matches.push(i) : _revertAll(1, _media[i]) || _isFunction$1(_media[i + 2]) && _media[i + 2](); // Firefox doesn't update the "matches" property of the MediaQueryList object correctly - it only does so as it calls its change handler - so we must re-create a media query here to ensure it's accurate.
          }
        }

        _revertRecorded(); // in case killing/reverting any of the animations actually added inline styles back.


        for (i = 0; i < matches.length; i++) {
          index = matches[i];
          _creatingMedia = _media[index];
          _media[index + 2] = _media[index + 1](e);
        }

        _creatingMedia = 0;

        _refreshAll(0, 1);

        _lastMediaTick = tick;

        _dispatch("matchMedia");
      }
    },
        _softRefresh = function _softRefresh() {
      return _removeListener(ScrollTrigger, "scrollEnd", _softRefresh) || _refreshAll(true);
    },
        _dispatch = function _dispatch(type) {
      return _listeners[type] && _listeners[type].map(function (f) {
        return f();
      }) || _emptyArray;
    },
        _savedStyles = [],
        // when ScrollTrigger.saveStyles() is called, the inline styles are recorded in this Array in a sequential format like [element, cssText, gsCache, media]. This keeps it very memory-efficient and fast to iterate through.
    _revertRecorded = function _revertRecorded(media) {
      for (var i = 0; i < _savedStyles.length; i += 4) {
        if (!media || _savedStyles[i + 3] === media) {
          _savedStyles[i].style.cssText = _savedStyles[i + 1];
          _savedStyles[i + 2].uncache = 1;
        }
      }
    },
        _revertAll = function _revertAll(kill, media) {
      var trigger;

      for (_i = 0; _i < _triggers.length; _i++) {
        trigger = _triggers[_i];

        if (!media || trigger.media === media) {
          if (kill) {
            trigger.kill(1);
          } else {
            trigger.scroll.rec || (trigger.scroll.rec = trigger.scroll()); // record the scroll positions so that in each refresh() we can ensure that it doesn't shift. Remember, pinning can make things change around, especially if the same element is pinned multiple times. If one was already recorded, don't re-record because unpinning may have occurred and made it shorter.

            trigger.revert();
          }
        }
      }

      _revertRecorded(media);

      media || _dispatch("revert");
    },
        _refreshAll = function _refreshAll(force, skipRevert) {
      if (_lastScrollTime && !force) {
        _addListener(ScrollTrigger, "scrollEnd", _softRefresh);

        return;
      }

      var refreshInits = _dispatch("refreshInit");

      _sort && ScrollTrigger.sort();
      skipRevert || _revertAll();

      for (_i = 0; _i < _triggers.length; _i++) {
        _triggers[_i].refresh();
      }

      refreshInits.forEach(function (result) {
        return result && result.render && result.render(-1);
      }); // if the onRefreshInit() returns an animation (typically a gsap.set()), revert it. This makes it easy to put things in a certain spot before refreshing for measurement purposes, and then put things back.

      _i = _triggers.length;

      while (_i--) {
        _triggers[_i].scroll.rec = 0;
      }

      _resizeDelay.pause();

      _dispatch("refresh");
    },
        _lastScroll = 0,
        _direction = 1,
        _updateAll = function _updateAll() {
      var l = _triggers.length,
          time = _getTime(),
          recordVelocity = time - _time1 >= 50,
          scroll = l && _triggers[0].scroll();

      _direction = _lastScroll > scroll ? -1 : 1;
      _lastScroll = scroll;

      if (recordVelocity) {
        if (_lastScrollTime && !_pointerIsDown && time - _lastScrollTime > 200) {
          _lastScrollTime = 0;

          _dispatch("scrollEnd");
        }

        _time2 = _time1;
        _time1 = time;
      }

      if (_direction < 0) {
        _i = l;

        while (_i--) {
          _triggers[_i] && _triggers[_i].update(0, recordVelocity);
        }

        _direction = 1;
      } else {
        for (_i = 0; _i < l; _i++) {
          _triggers[_i] && _triggers[_i].update(0, recordVelocity);
        }
      }

      _request = 0;
    },
        _propNamesToCopy = [_left, _top, _bottom, _right, _margin + _Bottom, _margin + _Right, _margin + _Top, _margin + _Left, "display", "flexShrink", "float"],
        _stateProps = _propNamesToCopy.concat([_width, _height, "boxSizing", "max" + _Width, "max" + _Height, "position", _margin, _padding, _padding + _Top, _padding + _Right, _padding + _Bottom, _padding + _Left]),
        _swapPinOut = function _swapPinOut(pin, spacer, state) {
      _setState(state);

      if (pin.parentNode === spacer) {
        var parent = spacer.parentNode;

        if (parent) {
          parent.insertBefore(pin, spacer);
          parent.removeChild(spacer);
        }
      }
    },
        _swapPinIn = function _swapPinIn(pin, spacer, cs, spacerState) {
      if (pin.parentNode !== spacer) {
        var i = _propNamesToCopy.length,
            spacerStyle = spacer.style,
            pinStyle = pin.style,
            p;

        while (i--) {
          p = _propNamesToCopy[i];
          spacerStyle[p] = cs[p];
        }

        spacerStyle.position = cs.position === "absolute" ? "absolute" : "relative";
        cs.display === "inline" && (spacerStyle.display = "inline-block");
        pinStyle[_bottom] = pinStyle[_right] = "auto";
        spacerStyle.overflow = "visible";
        spacerStyle.boxSizing = "border-box";
        spacerStyle[_width] = _getSize(pin, _horizontal) + _px;
        spacerStyle[_height] = _getSize(pin, _vertical) + _px;
        spacerStyle[_padding] = pinStyle[_margin] = pinStyle[_top] = pinStyle[_left] = "0";

        _setState(spacerState);

        pinStyle[_width] = pinStyle["max" + _Width] = cs[_width];
        pinStyle[_height] = pinStyle["max" + _Height] = cs[_height];
        pinStyle[_padding] = cs[_padding];
        pin.parentNode.insertBefore(spacer, pin);
        spacer.appendChild(pin);
      }
    },
        _capsExp$1 = /([A-Z])/g,
        _setState = function _setState(state) {
      if (state) {
        var style = state.t.style,
            l = state.length,
            i = 0,
            p,
            value;

        for (; i < l; i += 2) {
          value = state[i + 1];
          p = state[i];

          if (value) {
            style[p] = value;
          } else if (style[p]) {
            style.removeProperty(p.replace(_capsExp$1, "-$1").toLowerCase());
          }
        }
      }
    },
        _getState = function _getState(element) {
      // returns an array with alternating values like [property, value, property, value] and a "t" property pointing to the target (element). Makes it fast and cheap.
      var l = _stateProps.length,
          style = element.style,
          state = [],
          i = 0;

      for (; i < l; i++) {
        state.push(_stateProps[i], style[_stateProps[i]]);
      }

      state.t = element;
      return state;
    },
        _copyState = function _copyState(state, override, omitOffsets) {
      var result = [],
          l = state.length,
          i = omitOffsets ? 8 : 0,
          // skip top, left, right, bottom if omitOffsets is true
      p;

      for (; i < l; i += 2) {
        p = state[i];
        result.push(p, p in override ? override[p] : state[i + 1]);
      }

      result.t = state.t;
      return result;
    },
        _winOffsets = {
      left: 0,
      top: 0
    },
        _parsePosition$1 = function _parsePosition(value, trigger, scrollerSize, direction, scroll, marker, markerScroller, self, scrollerBounds, borderWidth, useFixedPosition, scrollerMax) {
      _isFunction$1(value) && (value = value(self));

      if (_isString$1(value) && value.substr(0, 3) === "max") {
        value = scrollerMax + (value.charAt(4) === "=" ? _offsetToPx("0" + value.substr(3), scrollerSize) : 0);
      }

      if (!_isNumber$1(value)) {
        _isFunction$1(trigger) && (trigger = trigger(self));

        var element = _toArray(trigger)[0] || _body,
            bounds = _getBounds(element) || {},
            offsets = value.split(" "),
            localOffset,
            globalOffset,
            display;

        if ((!bounds || !bounds.left && !bounds.top) && _getComputedStyle(element).display === "none") {
          // if display is "none", it won't report getBoundingClientRect() properly
          display = element.style.display;
          element.style.display = "block";
          bounds = _getBounds(element);
          display ? element.style.display = display : element.style.removeProperty("display");
        }

        localOffset = _offsetToPx(offsets[0], bounds[direction.d]);
        globalOffset = _offsetToPx(offsets[1] || "0", scrollerSize);
        value = bounds[direction.p] - scrollerBounds[direction.p] - borderWidth + localOffset + scroll - globalOffset;
        markerScroller && _positionMarker(markerScroller, globalOffset, direction, scrollerSize - globalOffset < 20 || markerScroller._isStart && globalOffset > 20);
        scrollerSize -= scrollerSize - globalOffset; // adjust for the marker
      } else if (markerScroller) {
        _positionMarker(markerScroller, scrollerSize, direction, true);
      }

      if (marker) {
        var position = value + scrollerSize,
            isStart = marker._isStart;
        scrollerMax = "scroll" + direction.d2;

        _positionMarker(marker, position, direction, isStart && position > 20 || !isStart && (useFixedPosition ? Math.max(_body[scrollerMax], _docEl[scrollerMax]) : marker.parentNode[scrollerMax]) <= position + 1);

        if (useFixedPosition) {
          scrollerBounds = _getBounds(markerScroller);
          useFixedPosition && (marker.style[direction.op.p] = scrollerBounds[direction.op.p] - direction.op.m - marker._offset + _px);
        }
      }

      return Math.round(value);
    },
        _prefixExp = /(?:webkit|moz|length|cssText)/i,
        _reparent = function _reparent(element, parent, top, left) {
      if (element.parentNode !== parent) {
        var style = element.style,
            p,
            cs;

        if (parent === _body) {
          element._stOrig = style.cssText; // record original inline styles so we can revert them later

          cs = _getComputedStyle(element);

          for (p in cs) {
            // must copy all relevant styles to ensure that nothing changes visually when we reparent to the <body>. Skip the vendor prefixed ones.
            if (!+p && !_prefixExp.test(p) && cs[p] && typeof style[p] === "string" && p !== "0") {
              style[p] = cs[p];
            }
          }

          style.top = top;
          style.left = left;
        } else {
          style.cssText = element._stOrig;
        }

        gsap$1.core.getCache(element).uncache = 1;
        parent.appendChild(element);
      }
    },
        // returns a function that can be used to tween the scroll position in the direction provided, and when doing so it'll add a .tween property to the FUNCTION itself, and remove it when the tween completes or gets killed. This gives us a way to have multiple ScrollTriggers use a central function for any given scroller and see if there's a scroll tween running (which would affect if/how things get updated)
    _getTweenCreator = function _getTweenCreator(scroller, direction) {
      var getScroll = _getScrollFunc(scroller, direction),
          prop = "_scroll" + direction.p2,
          // add a tweenable property to the scroller that's a getter/setter function, like _scrollTop or _scrollLeft. This way, if someone does gsap.killTweensOf(scroller) it'll kill the scroll tween.
      lastScroll1,
          lastScroll2,
          getTween = function getTween(scrollTo, vars, initialValue, change1, change2) {
        var tween = getTween.tween,
            onComplete = vars.onComplete,
            modifiers = {};
        tween && tween.kill();
        lastScroll1 = Math.round(initialValue);
        vars[prop] = scrollTo;
        vars.modifiers = modifiers;

        modifiers[prop] = function (value) {
          value = Math.round(getScroll()); // round because in some [very uncommon] Windows environments, it can get reported with decimals even though it was set without.

          if (value !== lastScroll1 && value !== lastScroll2) {
            // if the user scrolls, kill the tween. iOS Safari intermittently misreports the scroll position, it may be the most recently-set one or the one before that!
            tween.kill();
            getTween.tween = 0;
          } else {
            value = initialValue + change1 * tween.ratio + change2 * tween.ratio * tween.ratio;
          }

          lastScroll2 = lastScroll1;
          return lastScroll1 = Math.round(value);
        };

        vars.onComplete = function () {
          getTween.tween = 0;
          onComplete && onComplete.call(tween);
        };

        tween = getTween.tween = gsap$1.to(scroller, vars);
        return tween;
      };

      scroller[prop] = getScroll;
      return getTween;
    };

    _horizontal.op = _vertical;
    var ScrollTrigger = /*#__PURE__*/function () {
      function ScrollTrigger(vars, animation) {
        _coreInitted$1 || ScrollTrigger.register(gsap$1) || console.warn("Please gsap.registerPlugin(ScrollTrigger)");
        this.init(vars, animation);
      }

      var _proto = ScrollTrigger.prototype;

      _proto.init = function init(vars, animation) {
        this.progress = 0;
        this.vars && this.kill(1); // in case it's being initted again

        if (!_enabled) {
          this.update = this.refresh = this.kill = _passThrough$1;
          return;
        }

        vars = _setDefaults$1(_isString$1(vars) || _isNumber$1(vars) || vars.nodeType ? {
          trigger: vars
        } : vars, _defaults$1);

        var direction = vars.horizontal ? _horizontal : _vertical,
            _vars = vars,
            onUpdate = _vars.onUpdate,
            toggleClass = _vars.toggleClass,
            id = _vars.id,
            onToggle = _vars.onToggle,
            onRefresh = _vars.onRefresh,
            scrub = _vars.scrub,
            trigger = _vars.trigger,
            pin = _vars.pin,
            pinSpacing = _vars.pinSpacing,
            invalidateOnRefresh = _vars.invalidateOnRefresh,
            anticipatePin = _vars.anticipatePin,
            onScrubComplete = _vars.onScrubComplete,
            onSnapComplete = _vars.onSnapComplete,
            once = _vars.once,
            snap = _vars.snap,
            pinReparent = _vars.pinReparent,
            isToggle = !scrub && scrub !== 0,
            scroller = _toArray(vars.scroller || _win$2)[0],
            scrollerCache = gsap$1.core.getCache(scroller),
            isViewport = _isViewport(scroller),
            useFixedPosition = "pinType" in vars ? vars.pinType === "fixed" : isViewport || _getProxyProp(scroller, "pinType") === "fixed",
            callbacks = [vars.onEnter, vars.onLeave, vars.onEnterBack, vars.onLeaveBack],
            toggleActions = isToggle && vars.toggleActions.split(" "),
            markers = "markers" in vars ? vars.markers : _defaults$1.markers,
            borderWidth = isViewport ? 0 : parseFloat(_getComputedStyle(scroller)["border" + direction.p2 + _Width]) || 0,
            self = this,
            onRefreshInit = vars.onRefreshInit && function () {
          return vars.onRefreshInit(self);
        },
            getScrollerSize = _getSizeFunc(scroller, isViewport, direction),
            getScrollerOffsets = _getOffsetsFunc(scroller, isViewport),
            tweenTo,
            pinCache,
            snapFunc,
            isReverted,
            scroll1,
            scroll2,
            start,
            end,
            markerStart,
            markerEnd,
            markerStartTrigger,
            markerEndTrigger,
            markerVars,
            change,
            pinOriginalState,
            pinActiveState,
            pinState,
            spacer,
            offset,
            pinGetter,
            pinSetter,
            pinStart,
            pinChange,
            spacingStart,
            spacerState,
            markerStartSetter,
            markerEndSetter,
            cs,
            snap1,
            snap2,
            scrubTween,
            scrubSmooth,
            snapDurClamp,
            snapDelayedCall,
            prevProgress,
            prevScroll,
            prevAnimProgress;

        self.media = _creatingMedia;
        anticipatePin *= 45;

        _triggers.push(self);

        self.scroller = scroller;
        self.scroll = _getScrollFunc(scroller, direction);
        scroll1 = self.scroll();
        self.vars = vars;
        animation = animation || vars.animation;
        "refreshPriority" in vars && (_sort = 1);
        scrollerCache.tweenScroll = scrollerCache.tweenScroll || {
          top: _getTweenCreator(scroller, _vertical),
          left: _getTweenCreator(scroller, _horizontal)
        };
        self.tweenTo = tweenTo = scrollerCache.tweenScroll[direction.p];

        if (animation) {
          animation.vars.lazy = false;
          animation._initted || animation.vars.immediateRender !== false && vars.immediateRender !== false && animation.render(0, true, true);
          self.animation = animation.pause();
          animation.scrollTrigger = self;
          scrubSmooth = _isNumber$1(scrub) && scrub;
          scrubSmooth && (scrubTween = gsap$1.to(animation, {
            ease: "power3",
            duration: scrubSmooth,
            onComplete: function onComplete() {
              return onScrubComplete && onScrubComplete(self);
            }
          }));
          snap1 = 0;
          id || (id = animation.vars.id);
        }

        if (snap) {
          _isObject$1(snap) || (snap = {
            snapTo: snap
          });
          gsap$1.set(isViewport ? [_body, _docEl] : scroller, {
            scrollBehavior: "auto"
          }); // smooth scrolling doesn't work with snap.

          snapFunc = _isFunction$1(snap.snapTo) ? snap.snapTo : snap.snapTo === "labels" ? _getLabels(animation) : gsap$1.utils.snap(snap.snapTo);
          snapDurClamp = snap.duration || {
            min: 0.1,
            max: 2
          };
          snapDurClamp = _isObject$1(snapDurClamp) ? _clamp$1(snapDurClamp.min, snapDurClamp.max) : _clamp$1(snapDurClamp, snapDurClamp);
          snapDelayedCall = gsap$1.delayedCall(snap.delay || scrubSmooth / 2 || 0.1, function () {
            if (Math.abs(self.getVelocity()) < 10 && !_pointerIsDown) {
              var totalProgress = animation && !isToggle ? animation.totalProgress() : self.progress,
                  velocity = (totalProgress - snap2) / (_getTime() - _time2) * 1000 || 0,
                  change1 = _abs(velocity / 2) * velocity / 0.185,
                  naturalEnd = totalProgress + change1,
                  endValue = _clamp$1(0, 1, snapFunc(naturalEnd, self)),
                  scroll = self.scroll(),
                  endScroll = Math.round(start + endValue * change),
                  tween = tweenTo.tween;

              if (scroll <= end && scroll >= start && endScroll !== scroll) {
                if (tween && !tween._initted && tween.data <= Math.abs(endScroll - scroll)) {
                  // there's an overlapping snap! So we must figure out which one is closer and let that tween live.
                  return;
                }

                tweenTo(endScroll, {
                  duration: snapDurClamp(_abs(Math.max(_abs(naturalEnd - totalProgress), _abs(endValue - totalProgress)) * 0.185 / velocity / 0.05 || 0)),
                  ease: snap.ease || "power3",
                  data: Math.abs(endScroll - scroll),
                  // record the distance so that if another snap tween occurs (conflict) we can prioritize the closest snap.
                  onComplete: function onComplete() {
                    snap1 = snap2 = animation && !isToggle ? animation.totalProgress() : self.progress;
                    onSnapComplete && onSnapComplete(self);
                  }
                }, scroll, change1 * change, endScroll - scroll - change1 * change);
              }
            } else if (self.isActive) {
              snapDelayedCall.restart(true);
            }
          }).pause();
        }

        id && (_ids[id] = self);
        trigger = self.trigger = _toArray(trigger || pin)[0];
        pin = pin === true ? trigger : _toArray(pin)[0];
        _isString$1(toggleClass) && (toggleClass = {
          targets: trigger,
          className: toggleClass
        });

        if (pin) {
          pinSpacing === false || pinSpacing === _margin || (pinSpacing = !pinSpacing && _getComputedStyle(pin.parentNode).display === "flex" ? false : _padding); // if the parent is display: flex, don't apply pinSpacing by default.

          self.pin = pin;
          vars.force3D !== false && gsap$1.set(pin, {
            force3D: true
          });
          pinCache = gsap$1.core.getCache(pin);

          if (!pinCache.spacer) {
            // record the spacer and pinOriginalState on the cache in case someone tries pinning the same element with MULTIPLE ScrollTriggers - we don't want to have multiple spacers or record the "original" pin state after it has already been affected by another ScrollTrigger.
            pinCache.spacer = spacer = _doc$2.createElement("div");
            spacer.setAttribute("class", "pin-spacer" + (id ? " pin-spacer-" + id : ""));
            pinCache.pinState = pinOriginalState = _getState(pin);
          } else {
            pinOriginalState = pinCache.pinState;
          }

          self.spacer = spacer = pinCache.spacer;
          cs = _getComputedStyle(pin);
          spacingStart = cs[pinSpacing + direction.os2];
          pinGetter = gsap$1.getProperty(pin);
          pinSetter = gsap$1.quickSetter(pin, direction.a, _px); // pin.firstChild && !_maxScroll(pin, direction) && (pin.style.overflow = "hidden"); // protects from collapsing margins, but can have unintended consequences as demonstrated here: https://codepen.io/GreenSock/pen/1e42c7a73bfa409d2cf1e184e7a4248d so it was removed in favor of just telling people to set up their CSS to avoid the collapsing margins (overflow: hidden | auto is just one option. Another is border-top: 1px solid transparent).

          _swapPinIn(pin, spacer, cs);

          pinState = _getState(pin);
        }

        if (markers) {
          markerVars = _isObject$1(markers) ? _setDefaults$1(markers, _markerDefaults) : _markerDefaults;
          markerStartTrigger = _createMarker("scroller-start", id, scroller, direction, markerVars, 0);
          markerEndTrigger = _createMarker("scroller-end", id, scroller, direction, markerVars, 0, markerStartTrigger);
          offset = markerStartTrigger["offset" + direction.op.d2];
          markerStart = _createMarker("start", id, scroller, direction, markerVars, offset);
          markerEnd = _createMarker("end", id, scroller, direction, markerVars, offset);

          if (!useFixedPosition) {
            _makePositionable(scroller);

            gsap$1.set([markerStartTrigger, markerEndTrigger], {
              force3D: true
            });
            markerStartSetter = gsap$1.quickSetter(markerStartTrigger, direction.a, _px);
            markerEndSetter = gsap$1.quickSetter(markerEndTrigger, direction.a, _px);
          }
        }

        self.revert = function (revert) {
          var r = revert !== false || !self.enabled,
              prevRefreshing = _refreshing;

          if (r !== isReverted) {
            if (r) {
              prevScroll = Math.max(self.scroll(), self.scroll.rec || 0); // record the scroll so we can revert later (repositioning/pinning things can affect scroll position). In the static refresh() method, we first record all the scroll positions as a reference.

              prevProgress = self.progress;
              prevAnimProgress = animation && animation.progress();
            }

            markerStart && [markerStart, markerEnd, markerStartTrigger, markerEndTrigger].forEach(function (m) {
              return m.style.display = r ? "none" : "block";
            });
            r && (_refreshing = 1);
            self.update(r); // make sure the pin is back in its original position so that all the measurements are correct.

            _refreshing = prevRefreshing;
            pin && (r ? _swapPinOut(pin, spacer, pinOriginalState) : (!pinReparent || !self.isActive) && _swapPinIn(pin, spacer, _getComputedStyle(pin), spacerState));
            isReverted = r;
          }
        };

        self.refresh = function (soft) {
          if (_refreshing || !self.enabled) {
            return;
          }

          if (pin && soft && _lastScrollTime) {
            _addListener(ScrollTrigger, "scrollEnd", _softRefresh);

            return;
          }

          _refreshing = 1;
          scrubTween && scrubTween.kill();
          invalidateOnRefresh && animation && animation.progress(0).invalidate();
          isReverted || self.revert();

          var size = getScrollerSize(),
              scrollerBounds = getScrollerOffsets(),
              max = _maxScroll(scroller, direction),
              offset = 0,
              otherPinOffset = 0,
              parsedEnd = vars.end,
              parsedEndTrigger = vars.endTrigger || trigger,
              parsedStart = vars.start || (vars.start === 0 ? 0 : pin || !trigger ? "0 0" : "0 100%"),
              triggerIndex = trigger && Math.max(0, _triggers.indexOf(self)) || 0,
              i = triggerIndex,
              cs,
              bounds,
              scroll,
              isVertical,
              override,
              curTrigger,
              curPin,
              oppositeScroll;

          while (i--) {
            // user might try to pin the same element more than once, so we must find any prior triggers with the same pin, revert them, and determine how long they're pinning so that we can offset things appropriately. Make sure we revert from last to first so that things "rewind" properly.
            curPin = _triggers[i].pin;
            curPin && (curPin === trigger || curPin === pin) && _triggers[i].revert();
          }

          start = _parsePosition$1(parsedStart, trigger, size, direction, self.scroll(), markerStart, markerStartTrigger, self, scrollerBounds, borderWidth, useFixedPosition, max) || (pin ? -0.001 : 0);
          _isFunction$1(parsedEnd) && (parsedEnd = parsedEnd(self));

          if (_isString$1(parsedEnd) && !parsedEnd.indexOf("+=")) {
            if (~parsedEnd.indexOf(" ")) {
              parsedEnd = (_isString$1(parsedStart) ? parsedStart.split(" ")[0] : "") + parsedEnd;
            } else {
              offset = _offsetToPx(parsedEnd.substr(2), size);
              parsedEnd = _isString$1(parsedStart) ? parsedStart : start + offset; // _parsePosition won't factor in the offset if the start is a number, so do it here.

              parsedEndTrigger = trigger;
            }
          }

          end = Math.max(start, _parsePosition$1(parsedEnd || (parsedEndTrigger ? "100% 0" : max), parsedEndTrigger, size, direction, self.scroll() + offset, markerEnd, markerEndTrigger, self, scrollerBounds, borderWidth, useFixedPosition, max)) || -0.001;
          change = end - start || (start -= 0.01) && 0.001;
          offset = 0;
          i = triggerIndex;

          while (i--) {
            curTrigger = _triggers[i];
            curPin = curTrigger.pin;

            if (curPin && curTrigger.start - curTrigger._pinPush < start) {
              cs = curTrigger.end - curTrigger.start;
              curPin === trigger && (offset += cs);
              curPin === pin && (otherPinOffset += cs);
            }
          }

          start += offset;
          end += offset;
          self._pinPush = otherPinOffset;

          if (markerStart && offset) {
            // offset the markers if necessary
            cs = {};
            cs[direction.a] = "+=" + offset;
            gsap$1.set([markerStart, markerEnd], cs);
          }

          if (pin) {
            cs = _getComputedStyle(pin);
            isVertical = direction === _vertical;
            scroll = self.scroll(); // recalculate because the triggers can affect the scroll

            pinStart = parseFloat(pinGetter(direction.a)) + otherPinOffset;
            !max && end > 1 && ((isViewport ? _body : scroller).style["overflow-" + direction.a] = "scroll"); // makes sure the scroller has a scrollbar, otherwise if something has width: 100%, for example, it would be too big (exclude the scrollbar). See https://greensock.com/forums/topic/25182-scrolltrigger-width-of-page-increase-where-markers-are-set-to-false/

            _swapPinIn(pin, spacer, cs);

            pinState = _getState(pin); // transforms will interfere with the top/left/right/bottom placement, so remove them temporarily. getBoundingClientRect() factors in transforms.

            bounds = _getBounds(pin, true);
            oppositeScroll = useFixedPosition && _getScrollFunc(scroller, isVertical ? _horizontal : _vertical)();

            if (pinSpacing) {
              spacerState = [pinSpacing + direction.os2, change + otherPinOffset + _px];
              spacerState.t = spacer;
              i = pinSpacing === _padding ? _getSize(pin, direction) + change + otherPinOffset : 0;
              i && spacerState.push(direction.d, i + _px); // for box-sizing: border-box (must include padding).

              _setState(spacerState);

              useFixedPosition && self.scroll(prevScroll);
            }

            if (useFixedPosition) {
              override = {
                top: bounds.top + (isVertical ? scroll - start : oppositeScroll) + _px,
                left: bounds.left + (isVertical ? oppositeScroll : scroll - start) + _px,
                boxSizing: "border-box",
                position: "fixed"
              };
              override[_width] = override["max" + _Width] = Math.ceil(bounds.width) + _px;
              override[_height] = override["max" + _Height] = Math.ceil(bounds.height) + _px;
              override[_margin] = override[_margin + _Top] = override[_margin + _Right] = override[_margin + _Bottom] = override[_margin + _Left] = "0";
              override[_padding] = cs[_padding];
              override[_padding + _Top] = cs[_padding + _Top];
              override[_padding + _Right] = cs[_padding + _Right];
              override[_padding + _Bottom] = cs[_padding + _Bottom];
              override[_padding + _Left] = cs[_padding + _Left];
              pinActiveState = _copyState(pinOriginalState, override, pinReparent);
            }

            if (animation) {
              // the animation might be affecting the transform, so we must jump to the end, check the value, and compensate accordingly. Otherwise, when it becomes unpinned, the pinSetter() will get set to a value that doesn't include whatever the animation did.
              animation.progress(1, true);
              pinChange = pinGetter(direction.a) - pinStart + change + otherPinOffset;
              change !== pinChange && pinActiveState.splice(pinActiveState.length - 2, 2); // transform is the last property/value set in the state Array. Since the animation is controlling that, we should omit it.

              animation.progress(0, true);
            } else {
              pinChange = change;
            }
          } else if (trigger && self.scroll()) {
            // it may be INSIDE a pinned element, so walk up the tree and look for any elements with _pinOffset to compensate because anything with pinSpacing that's already scrolled would throw off the measurements in getBoundingClientRect()
            bounds = trigger.parentNode;

            while (bounds && bounds !== _body) {
              if (bounds._pinOffset) {
                start -= bounds._pinOffset;
                end -= bounds._pinOffset;
              }

              bounds = bounds.parentNode;
            }
          }

          for (i = 0; i < triggerIndex; i++) {
            // make sure we revert from first to last to make sure things reach their end state properly
            curTrigger = _triggers[i].pin;
            curTrigger && (curTrigger === trigger || curTrigger === pin) && _triggers[i].revert(false);
          }

          self.start = start;
          self.end = end;
          scroll1 = scroll2 = self.scroll(); // reset velocity

          scroll1 < prevScroll && self.scroll(prevScroll);
          self.revert(false);
          _refreshing = 0;
          prevAnimProgress && isToggle && animation.progress(prevAnimProgress, true);

          if (prevProgress !== self.progress) {
            // ensures that the direction is set properly (when refreshing, progress is set back to 0 initially, then back again to wherever it needs to be) and that callbacks are triggered.
            scrubTween && animation.totalProgress(prevProgress, true); // to avoid issues where animation callbacks like onStart aren't triggered.

            self.progress = prevProgress;
            self.update();
          }

          pin && pinSpacing && (spacer._pinOffset = Math.round(self.progress * pinChange));
          onRefresh && onRefresh(self);
        };

        self.getVelocity = function () {
          return (self.scroll() - scroll2) / (_getTime() - _time2) * 1000 || 0;
        };

        self.update = function (reset, recordVelocity) {
          var scroll = self.scroll(),
              p = reset ? 0 : (scroll - start) / change,
              clipped = p < 0 ? 0 : p > 1 ? 1 : p || 0,
              prevProgress = self.progress,
              isActive,
              wasActive,
              toggleState,
              action,
              stateChanged,
              toggled;

          if (recordVelocity) {
            scroll2 = scroll1;
            scroll1 = scroll;

            if (snap) {
              snap2 = snap1;
              snap1 = animation && !isToggle ? animation.totalProgress() : clipped;
            }
          } // anticipate the pinning a few ticks ahead of time based on velocity to avoid a visual glitch due to the fact that most browsers do scrolling on a separate thread (not synced with requestAnimationFrame).


          anticipatePin && !clipped && pin && !_refreshing && !_startup && _lastScrollTime && start < scroll + (scroll - scroll2) / (_getTime() - _time2) * anticipatePin && (clipped = 0.0001);

          if (clipped !== prevProgress && self.enabled) {
            isActive = self.isActive = !!clipped && clipped < 1;
            wasActive = !!prevProgress && prevProgress < 1;
            toggled = isActive !== wasActive;
            stateChanged = toggled || !!clipped !== !!prevProgress; // could go from start all the way to end, thus it didn't toggle but it did change state in a sense (may need to fire a callback)

            self.direction = clipped > prevProgress ? 1 : -1;
            self.progress = clipped;

            if (!isToggle) {
              if (scrubTween && !_refreshing && !_startup) {
                scrubTween.vars.totalProgress = clipped;
                scrubTween.invalidate().restart();
              } else if (animation) {
                animation.totalProgress(clipped, !!_refreshing);
              }
            }

            if (pin) {
              reset && pinSpacing && (spacer.style[pinSpacing + direction.os2] = spacingStart);

              if (!useFixedPosition) {
                pinSetter(pinStart + pinChange * clipped);
              } else if (stateChanged) {
                action = !reset && clipped > prevProgress && end + 1 > scroll && scroll + 1 >= _maxScroll(scroller, direction); // if it's at the VERY end of the page, don't switch away from position: fixed because it's pointless and it could cause a brief flash when the user scrolls back up (when it gets pinned again)

                if (pinReparent) {
                  if (!reset && (isActive || action)) {
                    var bounds = _getBounds(pin, true),
                        _offset = scroll - start;

                    _reparent(pin, _body, bounds.top + (direction === _vertical ? _offset : 0) + _px, bounds.left + (direction === _vertical ? 0 : _offset) + _px);
                  } else {
                    _reparent(pin, spacer);
                  }
                }

                _setState(isActive || action ? pinActiveState : pinState);

                pinChange !== change && clipped < 1 && isActive || pinSetter(pinStart + (clipped === 1 && !action ? pinChange : 0));
              }
            }

            snap && !tweenTo.tween && !_refreshing && !_startup && snapDelayedCall.restart(true);
            toggleClass && (toggled || once && clipped && (clipped < 1 || !_limitCallbacks)) && _toArray(toggleClass.targets).forEach(function (el) {
              return el.classList[isActive || once ? "add" : "remove"](toggleClass.className);
            }); // classes could affect positioning, so do it even if reset or refreshing is true.

            onUpdate && !isToggle && !reset && onUpdate(self);

            if (stateChanged && !_refreshing) {
              toggleState = clipped && !prevProgress ? 0 : clipped === 1 ? 1 : prevProgress === 1 ? 2 : 3; // 0 = enter, 1 = leave, 2 = enterBack, 3 = leaveBack (we prioritize the FIRST encounter, thus if you scroll really fast past the onEnter and onLeave in one tick, it'd prioritize onEnter.

              if (isToggle) {
                action = !toggled && toggleActions[toggleState + 1] !== "none" && toggleActions[toggleState + 1] || toggleActions[toggleState]; // if it didn't toggle, that means it shot right past and since we prioritize the "enter" action, we should switch to the "leave" in this case (but only if one is defined)

                if (animation && (action === "complete" || action === "reset" || action in animation)) {
                  if (action === "complete") {
                    animation.pause().totalProgress(1);
                  } else if (action === "reset") {
                    animation.restart(true).pause();
                  } else {
                    animation[action]();
                  }
                }

                onUpdate && onUpdate(self);
              }

              if (toggled || !_limitCallbacks) {
                // on startup, the page could be scrolled and we don't want to fire callbacks that didn't toggle. For example onEnter shouldn't fire if the ScrollTrigger isn't actually entered.
                onToggle && toggled && onToggle(self);
                callbacks[toggleState] && callbacks[toggleState](self);
                once && (clipped === 1 ? self.kill(false, 1) : callbacks[toggleState] = 0); // a callback shouldn't be called again if once is true.

                if (!toggled) {
                  // it's possible to go completely past, like from before the start to after the end (or vice-versa) in which case BOTH callbacks should be fired in that order
                  toggleState = clipped === 1 ? 1 : 3;
                  callbacks[toggleState] && callbacks[toggleState](self);
                }
              }
            } else if (isToggle && onUpdate && !_refreshing) {
              onUpdate(self);
            }
          } // update absolutely-positioned markers (only if the scroller isn't the viewport)


          if (markerEndSetter) {
            markerStartSetter(scroll + (markerStartTrigger._isFlipped ? 1 : 0));
            markerEndSetter(scroll);
          }
        };

        self.enable = function () {
          if (!self.enabled) {
            self.enabled = true;

            _addListener(scroller, "resize", _onResize);

            _addListener(scroller, "scroll", _onScroll);

            onRefreshInit && _addListener(ScrollTrigger, "refreshInit", onRefreshInit);
            !animation || !animation.add ? self.refresh() : gsap$1.delayedCall(0.01, function () {
              return start || end || self.refresh();
            }) && (change = 0.01) && (start = end = 0); // if the animation is a timeline, it may not have been populated yet, so it wouldn't render at the proper place on the first refresh(), thus we should schedule one for the next tick.
          }
        };

        self.disable = function (reset, allowAnimation) {
          if (self.enabled) {
            reset !== false && self.revert();
            self.enabled = self.isActive = false;
            allowAnimation || scrubTween && scrubTween.pause();
            prevScroll = 0;
            pinCache && (pinCache.uncache = 1);
            onRefreshInit && _removeListener(ScrollTrigger, "refreshInit", onRefreshInit);

            if (snapDelayedCall) {
              snapDelayedCall.pause();
              tweenTo.tween && tweenTo.tween.kill() && (tweenTo.tween = 0);
            }

            if (!isViewport) {
              var i = _triggers.length;

              while (i--) {
                if (_triggers[i].scroller === scroller && _triggers[i] !== self) {
                  return; //don't remove the listeners if there are still other triggers referencing it.
                }
              }

              _removeListener(scroller, "resize", _onResize);

              _removeListener(scroller, "scroll", _onScroll);
            }
          }
        };

        self.kill = function (revert, allowAnimation) {
          self.disable(revert, allowAnimation);
          id && delete _ids[id];

          var i = _triggers.indexOf(self);

          _triggers.splice(i, 1);

          i === _i && _direction > 0 && _i--; // if we're in the middle of a refresh() or update(), splicing would cause skips in the index, so adjust...

          if (animation) {
            animation.scrollTrigger = null;
            revert && animation.render(-1);
            allowAnimation || animation.kill();
          }

          markerStart && [markerStart, markerEnd, markerStartTrigger, markerEndTrigger].forEach(function (m) {
            return m.parentNode.removeChild(m);
          });
          pinCache && (pinCache.uncache = 1);
        };

        self.enable();
      };

      ScrollTrigger.register = function register(core) {
        if (!_coreInitted$1) {
          gsap$1 = core || _getGSAP();

          if (_windowExists$2() && window.document) {
            _win$2 = window;
            _doc$2 = document;
            _docEl = _doc$2.documentElement;
            _body = _doc$2.body;
          }

          if (gsap$1) {
            _toArray = gsap$1.utils.toArray;
            _clamp$1 = gsap$1.utils.clamp;
            gsap$1.core.globals("ScrollTrigger", ScrollTrigger); // must register the global manually because in Internet Explorer, functions (classes) don't have a "name" property.

            if (_body) {
              _raf = _win$2.requestAnimationFrame || function (f) {
                return setTimeout(f, 16);
              };

              _addListener(_win$2, "mousewheel", _onScroll);

              _root = [_win$2, _doc$2, _docEl, _body];

              _addListener(_doc$2, "scroll", _onScroll); // some browsers (like Chrome), the window stops dispatching scroll events on the window if you scroll really fast, but it's consistent on the document!


              var bodyStyle = _body.style,
                  border = bodyStyle.borderTop,
                  bounds;
              bodyStyle.borderTop = "1px solid #000"; // works around an issue where a margin of a child element could throw off the bounds of the _body, making it seem like there's a margin when there actually isn't. The border ensures that the bounds are accurate.

              bounds = _getBounds(_body);
              _vertical.m = Math.round(bounds.top + _vertical.sc()) || 0; // accommodate the offset of the <body> caused by margins and/or padding

              _horizontal.m = Math.round(bounds.left + _horizontal.sc()) || 0;
              border ? bodyStyle.borderTop = border : bodyStyle.removeProperty("border-top");
              _syncInterval = setInterval(_sync, 200);
              gsap$1.delayedCall(0.5, function () {
                return _startup = 0;
              });

              _addListener(_doc$2, "touchcancel", _passThrough$1); // some older Android devices intermittently stop dispatching "touchmove" events if we don't listen for "touchcancel" on the document.


              _addListener(_body, "touchstart", _passThrough$1); //works around Safari bug: https://greensock.com/forums/topic/21450-draggable-in-iframe-on-mobile-is-buggy/


              _multiListener(_addListener, _doc$2, "pointerdown,touchstart,mousedown", function () {
                return _pointerIsDown = 1;
              });

              _multiListener(_addListener, _doc$2, "pointerup,touchend,mouseup", function () {
                return _pointerIsDown = 0;
              });

              _transformProp$1 = gsap$1.utils.checkPrefix("transform");

              _stateProps.push(_transformProp$1);

              _coreInitted$1 = _getTime();
              _resizeDelay = gsap$1.delayedCall(0.2, _refreshAll).pause();
              _autoRefresh = [_doc$2, "visibilitychange", function () {
                var w = _win$2.innerWidth,
                    h = _win$2.innerHeight;

                if (_doc$2.hidden) {
                  _prevWidth = w;
                  _prevHeight = h;
                } else if (_prevWidth !== w || _prevHeight !== h) {
                  _onResize();
                }
              }, _doc$2, "DOMContentLoaded", _refreshAll, _win$2, "load", function () {
                return _lastScrollTime || _refreshAll();
              }, _win$2, "resize", _onResize];

              _iterateAutoRefresh(_addListener);
            }
          }
        }

        return _coreInitted$1;
      };

      ScrollTrigger.defaults = function defaults(config) {
        for (var p in config) {
          _defaults$1[p] = config[p];
        }
      };

      ScrollTrigger.kill = function kill() {
        _enabled = 0;

        _triggers.slice(0).forEach(function (trigger) {
          return trigger.kill(1);
        });
      };

      ScrollTrigger.config = function config(vars) {
        "limitCallbacks" in vars && (_limitCallbacks = !!vars.limitCallbacks);
        var ms = vars.syncInterval;
        ms && clearInterval(_syncInterval) || (_syncInterval = ms) && setInterval(_sync, ms);
        "autoRefreshEvents" in vars && (_iterateAutoRefresh(_removeListener) || _iterateAutoRefresh(_addListener, vars.autoRefreshEvents || "none"));
      };

      ScrollTrigger.scrollerProxy = function scrollerProxy(target, vars) {
        var t = _toArray(target)[0];

        _isViewport(t) ? _proxies.unshift(_win$2, vars, _body, vars, _docEl, vars) : _proxies.unshift(t, vars);
      };

      ScrollTrigger.matchMedia = function matchMedia(vars) {
        // _media is populated in the following order: mediaQueryString, onMatch, onUnmatch, isMatched. So if there are two media queries, the Array would have a length of 8
        var mq, p, i, func, result;

        for (p in vars) {
          i = _media.indexOf(p);
          func = vars[p];
          _creatingMedia = p;

          if (p === "all") {
            func();
          } else {
            mq = _win$2.matchMedia(p);

            if (mq) {
              mq.matches && (result = func());

              if (~i) {
                _media[i + 1] = _combineFunc(_media[i + 1], func);
                _media[i + 2] = _combineFunc(_media[i + 2], result);
              } else {
                i = _media.length;

                _media.push(p, func, result);

                mq.addListener ? mq.addListener(_onMediaChange) : mq.addEventListener("change", _onMediaChange);
              }

              _media[i + 3] = mq.matches;
            }
          }

          _creatingMedia = 0;
        }

        return _media;
      };

      ScrollTrigger.clearMatchMedia = function clearMatchMedia(query) {
        query || (_media.length = 0);
        query = _media.indexOf(query);
        query >= 0 && _media.splice(query, 4);
      };

      return ScrollTrigger;
    }();
    ScrollTrigger.version = "3.5.1";

    ScrollTrigger.saveStyles = function (targets) {
      return targets ? _toArray(targets).forEach(function (target) {
        var i = _savedStyles.indexOf(target);

        i >= 0 && _savedStyles.splice(i, 4);

        _savedStyles.push(target, target.style.cssText, gsap$1.core.getCache(target), _creatingMedia);
      }) : _savedStyles;
    };

    ScrollTrigger.revert = function (soft, media) {
      return _revertAll(!soft, media);
    };

    ScrollTrigger.create = function (vars, animation) {
      return new ScrollTrigger(vars, animation);
    };

    ScrollTrigger.refresh = function (safe) {
      return safe ? _onResize() : _refreshAll(true);
    };

    ScrollTrigger.update = _updateAll;

    ScrollTrigger.maxScroll = function (element, horizontal) {
      return _maxScroll(element, horizontal ? _horizontal : _vertical);
    };

    ScrollTrigger.getScrollFunc = function (element, horizontal) {
      return _getScrollFunc(_toArray(element)[0], horizontal ? _horizontal : _vertical);
    };

    ScrollTrigger.getById = function (id) {
      return _ids[id];
    };

    ScrollTrigger.getAll = function () {
      return _triggers.slice(0);
    };

    ScrollTrigger.isScrolling = function () {
      return !!_lastScrollTime;
    };

    ScrollTrigger.addEventListener = function (type, callback) {
      var a = _listeners[type] || (_listeners[type] = []);
      ~a.indexOf(callback) || a.push(callback);
    };

    ScrollTrigger.removeEventListener = function (type, callback) {
      var a = _listeners[type],
          i = a && a.indexOf(callback);
      i >= 0 && a.splice(i, 1);
    };

    ScrollTrigger.batch = function (targets, vars) {
      var result = [],
          varsCopy = {},
          interval = vars.interval || 0.016,
          batchMax = vars.batchMax || 1e9,
          proxyCallback = function proxyCallback(type, callback) {
        var elements = [],
            triggers = [],
            delay = gsap$1.delayedCall(interval, function () {
          callback(elements, triggers);
          elements = [];
          triggers = [];
        }).pause();
        return function (self) {
          elements.length || delay.restart(true);
          elements.push(self.trigger);
          triggers.push(self);
          batchMax <= elements.length && delay.progress(1);
        };
      },
          p;

      for (p in vars) {
        varsCopy[p] = p.substr(0, 2) === "on" && _isFunction$1(vars[p]) && p !== "onRefreshInit" ? proxyCallback(p, vars[p]) : vars[p];
      }

      if (_isFunction$1(batchMax)) {
        batchMax = batchMax();

        _addListener(ScrollTrigger, "refresh", function () {
          return batchMax = vars.batchMax();
        });
      }

      _toArray(targets).forEach(function (target) {
        var config = {};

        for (p in varsCopy) {
          config[p] = varsCopy[p];
        }

        config.trigger = target;
        result.push(ScrollTrigger.create(config));
      });

      return result;
    };

    ScrollTrigger.sort = function (func) {
      return _triggers.sort(func || function (a, b) {
        return (a.vars.refreshPriority || 0) * -1e6 + a.start - (b.start + (b.vars.refreshPriority || 0) * -1e6);
      });
    };

    _getGSAP() && gsap$1.registerPlugin(ScrollTrigger);

    /* src/componenets/header.svelte generated by Svelte v3.29.4 */
    const file$2 = "src/componenets/header.svelte";

    function create_fragment$2(ctx) {
    	let header;
    	let div1;
    	let button;
    	let svg;
    	let g0;
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let g1;
    	let polygon0;
    	let polygon1;
    	let path4;
    	let polygon2;
    	let t0;
    	let menu;
    	let t1;
    	let div0;
    	let current;
    	menu = new Menu({ $$inline: true });

    	const block = {
    		c: function create() {
    			header = element("header");
    			div1 = element("div");
    			button = element("button");
    			svg = svg_element("svg");
    			g0 = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			g1 = svg_element("g");
    			polygon0 = svg_element("polygon");
    			polygon1 = svg_element("polygon");
    			path4 = svg_element("path");
    			polygon2 = svg_element("polygon");
    			t0 = space();
    			create_component(menu.$$.fragment);
    			t1 = space();
    			div0 = element("div");
    			attr_dev(path0, "vector-effect", "non-scaling-stroke");
    			attr_dev(path0, "d", "M56.06,23.46,34.81,47.1H56.06V72.68H0V49.22L20.34,25.58H0V0H56.06ZM54,1.84H1.69v21.9h22v.92l-22,25.2v21H54V48.94H31.37V48L54,22.82Z");
    			attr_dev(path0, "stroke-width", "1");
    			add_location(path0, file$2, 25, 9, 618);
    			attr_dev(path1, "vector-effect", "non-scaling-stroke");
    			attr_dev(path1, "d", "M111.75,72.68H54.18V0h57.57ZM109.82,1.84H83.93V25.3H82V1.84H56.11v69H82v-24h1.93v24h25.89Z");
    			attr_dev(path1, "stroke-width", "1");
    			add_location(path1, file$2, 26, 9, 824);
    			attr_dev(path2, "vector-effect", "non-scaling-stroke");
    			attr_dev(path2, "d", "M0,71H31.6c14.3,0,24,7.64,24,23v1.47c0,9.39-4.26,15.27-10.38,18.77,2.84,2.11,4.88,5.06,6.39,11.22l4.62,18.22H27.88l-.54-4.79-.8-10.58.36,10.58v4.79H0Zm25.12,70.84V120H27l2.39,21.81H53.89l-4-15.92c-2-7.63-5-9.57-7.54-11.31v-.92c2.39-1.2,11.45-6.81,11.45-18.22V94c0-14.26-9.06-21.16-22.2-21.16H1.78v69ZM22,94.74H32.67v1.84H22Z");
    			attr_dev(path2, "stroke-width", "1");
    			add_location(path2, file$2, 27, 9, 989);
    			attr_dev(path3, "vector-effect", "non-scaling-stroke");
    			attr_dev(path3, "d", "M54.13,71H81.08l3,11.32-.74-6.9V71h28.34v72.68h-27L81.91,133l.55,6.07v4.6H54.13Zm26.49,70.84V128L77,114.51l1.74-.46,7.36,27.79h23.74v-69H85.22v13.8l3.59,13.52-1.75.46L79.7,72.84H56v69Z");
    			attr_dev(path3, "stroke-width", "1");
    			add_location(path3, file$2, 28, 9, 1388);
    			attr_dev(g0, "id", "lines");
    			add_location(g0, file$2, 24, 7, 594);
    			attr_dev(polygon0, "class", "cls-1");
    			attr_dev(polygon0, "points", "1.69 1.84 1.69 23.73 23.68 23.73 1.69 49.86 1.69 70.84 54.13 71 54.04 48.94 31.37 48.94 31.37 48.02 54.04 22.82 54.04 1.84 1.69 1.84");
    			add_location(polygon0, file$2, 31, 9, 1682);
    			attr_dev(polygon1, "class", "cls-1");
    			attr_dev(polygon1, "points", "56.11 1.84 56.11 70.84 82 70.84 82 46.83 83.93 46.83 83.38 71 109.82 70.84 109.82 1.84 83.93 1.84 83.93 25.3 82 25.3 82 1.84 56.11 1.84");
    			add_location(polygon1, file$2, 32, 9, 1858);
    			attr_dev(path4, "class", "cls-1");
    			attr_dev(path4, "d", "M49.89,125.92c-2-7.63-5-9.57-7.54-11.31v-.92c2.39-1.2,11.45-6.81,11.45-18.22V94c0-14.26-9.06-21.16-22.2-21.16H1.78v69H25.12V120H27l2.39,21.81H53.89ZM32.67,96.58H22V94.74H32.67Z");
    			add_location(path4, file$2, 33, 9, 2037);
    			attr_dev(polygon2, "class", "cls-1");
    			attr_dev(polygon2, "points", "80.62 141.84 80.62 128.04 77.04 114.51 78.78 114.06 86.14 141.84 109.88 141.84 109.88 72.84 85.22 72.84 85.22 86.64 88.81 100.16 87.06 100.62 79.7 72.84 55.97 72.84 55.97 141.84 80.62 141.84");
    			add_location(polygon2, file$2, 34, 9, 2249);
    			attr_dev(g1, "id", "inside");
    			attr_dev(g1, "class", "svelte-ghkswv");
    			add_location(g1, file$2, 30, 7, 1657);
    			attr_dev(svg, "class", "header-logo svelte-ghkswv");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 111.75 143.68");
    			add_location(svg, file$2, 23, 5, 498);
    			attr_dev(button, "aria-label", "”Home”");
    			attr_dev(button, "href", "/");
    			add_location(button, file$2, 22, 4, 457);
    			attr_dev(div0, "class", "header-bg svelte-ghkswv");
    			add_location(div0, file$2, 39, 4, 2529);
    			attr_dev(div1, "class", "header-container svelte-ghkswv");
    			add_location(div1, file$2, 21, 2, 422);
    			attr_dev(header, "class", "svelte-ghkswv");
    			add_location(header, file$2, 20, 0, 411);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div1);
    			append_dev(div1, button);
    			append_dev(button, svg);
    			append_dev(svg, g0);
    			append_dev(g0, path0);
    			append_dev(g0, path1);
    			append_dev(g0, path2);
    			append_dev(g0, path3);
    			append_dev(svg, g1);
    			append_dev(g1, polygon0);
    			append_dev(g1, polygon1);
    			append_dev(g1, path4);
    			append_dev(g1, polygon2);
    			append_dev(div1, t0);
    			mount_component(menu, div1, null);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menu.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menu.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			destroy_component(menu);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Header", slots, []);

    	onMount(() => {
    		const tl = gsapWithCSS.timeline({
    			scrollTrigger: {
    				scrub: true,
    				trigger: ".speech",
    				start: "10% top"
    			}
    		});

    		tl.to(".header-bg", { autoAlpha: 1 });
    	});

    	let scrolled = false;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Menu,
    		onMount,
    		gsap: gsapWithCSS,
    		ScrollTrigger,
    		scrolled
    	});

    	$$self.$inject_state = $$props => {
    		if ("scrolled" in $$props) scrolled = $$props.scrolled;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /*!
     * strings: 3.5.1
     * https://greensock.com
     *
     * Copyright 2008-2020, GreenSock. All rights reserved.
     * Subject to the terms at https://greensock.com/standard-license or for
     * Club GreenSock members, the agreement issued with that membership.
     * @author: Jack Doyle, jack@greensock.com
    */

    /* eslint-disable */
    var _trimExp = /(^\s+|\s+$)/g;
    var emojiExp = /([\uD800-\uDBFF][\uDC00-\uDFFF](?:[\u200D\uFE0F][\uD800-\uDBFF][\uDC00-\uDFFF]){2,}|\uD83D\uDC69(?:\u200D(?:(?:\uD83D\uDC69\u200D)?\uD83D\uDC67|(?:\uD83D\uDC69\u200D)?\uD83D\uDC66)|\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC69\u200D(?:\uD83D\uDC69\u200D)?\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D(?:\uD83D\uDC69\u200D)?\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]\uFE0F|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92])|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC6F\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3C-\uDD3E\uDDD6-\uDDDF])\u200D[\u2640\u2642]\uFE0F|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF6\uD83C\uDDE6|\uD83C\uDDF4\uD83C\uDDF2|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uFE0F\u200D[\u2640\u2642]|(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642])\uFE0F|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2695\u2696\u2708]|\uD83D\uDC69\u200D[\u2695\u2696\u2708]|\uD83D\uDC68(?:(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708]))\uFE0F|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83D\uDC69\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69]))|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|[#\*0-9]\uFE0F\u20E3|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67)\uDB40\uDC7F|\uD83D\uDC68(?:\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:(?:\uD83D[\uDC68\uDC69])\u200D)?\uD83D\uDC66\u200D\uD83D\uDC66|(?:(?:\uD83D[\uDC68\uDC69])\u200D)?\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92])|(?:\uD83C[\uDFFB-\uDFFF])\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]))|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270A-\u270D]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC70\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDCAA\uDD74\uDD7A\uDD90\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD36\uDDD1-\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC68(?:\u200D(?:(?:(?:\uD83D[\uDC68\uDC69])\u200D)?\uD83D\uDC67|(?:(?:\uD83D[\uDC68\uDC69])\u200D)?\uD83D\uDC66)|\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC69\uDC6E\uDC70-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD18-\uDD1C\uDD1E\uDD1F\uDD26\uDD30-\uDD39\uDD3D\uDD3E\uDDD1-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])?|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDEEB\uDEEC\uDEF4-\uDEF8]|\uD83E[\uDD10-\uDD3A\uDD3C-\uDD3E\uDD40-\uDD45\uDD47-\uDD4C\uDD50-\uDD6B\uDD80-\uDD97\uDDC0\uDDD0-\uDDE6])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u2660\u2663\u2665\u2666\u2668\u267B\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEF8]|\uD83E[\uDD10-\uDD3A\uDD3C-\uDD3E\uDD40-\uDD45\uDD47-\uDD4C\uDD50-\uDD6B\uDD80-\uDD97\uDDC0\uDDD0-\uDDE6])\uFE0F)/;
    function getText(e) {
      var type = e.nodeType,
          result = "";

      if (type === 1 || type === 9 || type === 11) {
        if (typeof e.textContent === "string") {
          return e.textContent;
        } else {
          for (e = e.firstChild; e; e = e.nextSibling) {
            result += getText(e);
          }
        }
      } else if (type === 3 || type === 4) {
        return e.nodeValue;
      }

      return result;
    }
    function splitInnerHTML(element, delimiter, trim) {
      var node = element.firstChild,
          result = [];

      while (node) {
        if (node.nodeType === 3) {
          result.push.apply(result, emojiSafeSplit((node.nodeValue + "").replace(/^\n+/g, "").replace(/\s+/g, " "), delimiter, trim));
        } else if ((node.nodeName + "").toLowerCase() === "br") {
          result[result.length - 1] += "<br>";
        } else {
          result.push(node.outerHTML);
        }

        node = node.nextSibling;
      }

      return result;
    }
    /*
    //smaller kb version that only handles the simpler emoji's, which is often perfectly adequate.

    let _emoji = "[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2694-\u2697]|\uD83E[\uDD10-\uDD5D]|[\uD800-\uDBFF][\uDC00-\uDFFF]",
    	_emojiExp = new RegExp(_emoji),
    	_emojiAndCharsExp = new RegExp(_emoji + "|.", "g"),
    	_emojiSafeSplit = (text, delimiter, trim) => {
    		if (trim) {
    			text = text.replace(_trimExp, "");
    		}
    		return ((delimiter === "" || !delimiter) && _emojiExp.test(text)) ? text.match(_emojiAndCharsExp) : text.split(delimiter || "");
    	};
     */

    function emojiSafeSplit(text, delimiter, trim) {
      text += ""; // make sure it's cast as a string. Someone may pass in a number.

      if (trim) {
        text = text.replace(_trimExp, "");
      }

      if (delimiter && delimiter !== "") {
        return text.replace(/>/g, "&gt;").replace(/</g, "&lt;").split(delimiter);
      }

      var result = [],
          l = text.length,
          i = 0,
          j,
          character;

      for (; i < l; i++) {
        character = text.charAt(i);

        if (character.charCodeAt(0) >= 0xD800 && character.charCodeAt(0) <= 0xDBFF || text.charCodeAt(i + 1) >= 0xFE00 && text.charCodeAt(i + 1) <= 0xFE0F) {
          //special emoji characters use 2 or 4 unicode characters that we must keep together.
          j = ((text.substr(i, 12).split(emojiExp) || [])[1] || "").length || 2;
          character = text.substr(i, j);
          result.emoji = 1;
          i += j - 1;
        }

        result.push(character === ">" ? "&gt;" : character === "<" ? "&lt;" : character);
      }

      return result;
    }

    /*!
     * TextPlugin 3.5.1
     * https://greensock.com
     *
     * @license Copyright 2008-2020, GreenSock. All rights reserved.
     * Subject to the terms at https://greensock.com/standard-license or for
     * Club GreenSock members, the agreement issued with that membership.
     * @author: Jack Doyle, jack@greensock.com
    */

    var gsap$2,
        _tempDiv$1,
        _getGSAP$1 = function _getGSAP() {
      return gsap$2 || typeof window !== "undefined" && (gsap$2 = window.gsap) && gsap$2.registerPlugin && gsap$2;
    };

    var TextPlugin = {
      version: "3.5.1",
      name: "text",
      init: function init(target, value, tween) {
        var i = target.nodeName.toUpperCase(),
            data = this,
            _short,
            text,
            original,
            j,
            condensedText,
            condensedOriginal,
            aggregate,
            s;

        data.svg = target.getBBox && (i === "TEXT" || i === "TSPAN");

        if (!("innerHTML" in target) && !data.svg) {
          return false;
        }

        data.target = target;

        if (typeof value !== "object") {
          value = {
            value: value
          };
        }

        if (!("value" in value)) {
          data.text = data.original = [""];
          return;
        }

        data.delimiter = value.delimiter || "";
        original = splitInnerHTML(target, data.delimiter);

        if (!_tempDiv$1) {
          _tempDiv$1 = document.createElement("div");
        }

        _tempDiv$1.innerHTML = value.value;
        text = splitInnerHTML(_tempDiv$1, data.delimiter);
        data.from = tween._from;

        if (data.from) {
          i = original;
          original = text;
          text = i;
        }

        data.hasClass = !!(value.newClass || value.oldClass);
        data.newClass = value.newClass;
        data.oldClass = value.oldClass;
        i = original.length - text.length;
        _short = i < 0 ? original : text;
        data.fillChar = value.fillChar || (value.padSpace ? "&nbsp;" : "");

        if (i < 0) {
          i = -i;
        }

        while (--i > -1) {
          _short.push(data.fillChar);
        }

        if (value.type === "diff") {
          j = 0;
          condensedText = [];
          condensedOriginal = [];
          aggregate = "";

          for (i = 0; i < text.length; i++) {
            s = text[i];

            if (s === original[i]) {
              aggregate += s;
            } else {
              condensedText[j] = aggregate + s;
              condensedOriginal[j++] = aggregate + original[i];
              aggregate = "";
            }
          }

          text = condensedText;
          original = condensedOriginal;

          if (aggregate) {
            text.push(aggregate);
            original.push(aggregate);
          }
        }

        if (value.speed) {
          tween.duration(Math.min(0.05 / value.speed * _short.length, value.maxDuration || 9999));
        }

        this.original = original;
        this.text = text;

        this._props.push("text");
      },
      render: function render(ratio, data) {
        if (ratio > 1) {
          ratio = 1;
        } else if (ratio < 0) {
          ratio = 0;
        }

        if (data.from) {
          ratio = 1 - ratio;
        }

        var text = data.text,
            hasClass = data.hasClass,
            newClass = data.newClass,
            oldClass = data.oldClass,
            delimiter = data.delimiter,
            target = data.target,
            fillChar = data.fillChar,
            original = data.original,
            l = text.length,
            i = ratio * l + 0.5 | 0,
            applyNew,
            applyOld,
            str;

        if (hasClass) {
          applyNew = newClass && i;
          applyOld = oldClass && i !== l;
          str = (applyNew ? "<span class='" + newClass + "'>" : "") + text.slice(0, i).join(delimiter) + (applyNew ? "</span>" : "") + (applyOld ? "<span class='" + oldClass + "'>" : "") + delimiter + original.slice(i).join(delimiter) + (applyOld ? "</span>" : "");
        } else {
          str = text.slice(0, i).join(delimiter) + delimiter + original.slice(i).join(delimiter);
        }

        if (data.svg) {
          //SVG text elements don't have an "innerHTML" in Microsoft browsers.
          target.textContent = str;
        } else {
          target.innerHTML = fillChar === "&nbsp;" && ~str.indexOf("  ") ? str.split("  ").join("&nbsp;&nbsp;") : str;
        }
      }
    };
    TextPlugin.splitInnerHTML = splitInnerHTML;
    TextPlugin.emojiSafeSplit = emojiSafeSplit;
    TextPlugin.getText = getText;
    _getGSAP$1() && gsap$2.registerPlugin(TextPlugin);

    /* src/componenets/hero.svelte generated by Svelte v3.29.4 */
    const file$3 = "src/componenets/hero.svelte";

    function create_fragment$3(ctx) {
    	let section;
    	let div0;
    	let svg;
    	let path0;
    	let path1;
    	let g;
    	let text0;
    	let t0;
    	let text1;
    	let t1;
    	let text2;
    	let t2;
    	let h1;
    	let t3;
    	let span1;
    	let span0;
    	let t5;
    	let div3;
    	let div2;
    	let div1;
    	let t6;
    	let div6;
    	let div5;
    	let div4;
    	let t7;
    	let span2;
    	let t9;
    	let span6;
    	let span3;
    	let t10;
    	let span4;
    	let t12;
    	let span5;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div0 = element("div");
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			g = svg_element("g");
    			text0 = svg_element("text");
    			t0 = text("Hi\n        ");
    			text1 = svg_element("text");
    			t1 = text("!\n        ");
    			text2 = svg_element("text");
    			t2 = space();
    			h1 = element("h1");
    			t3 = text("My name is Zach. I’m an integrative \n      ");
    			span1 = element("span");
    			span0 = element("span");
    			span0.textContent = "designer,";
    			t5 = space();
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			t6 = space();
    			div6 = element("div");
    			div5 = element("div");
    			div4 = element("div");
    			t7 = space();
    			span2 = element("span");
    			span2.textContent = "animator";
    			t9 = text(" and\n      ");
    			span6 = element("span");
    			span3 = element("span");
    			t10 = space();
    			span4 = element("span");
    			span4.textContent = "front-end dev.";
    			t12 = space();
    			span5 = element("span");
    			attr_dev(path0, "vector-effect", "non-scaling-stroke");
    			attr_dev(path0, "class", "speech-outer");
    			attr_dev(path0, "d", "M107.5 282L30.4 274.7C13.4 273.1 0.5 259 0.5 241.8V33.5C0.5 15.3 15.3 0.5 33.4 0.5C35.2 0.5 37 0.6 38.8 0.9L283.8 41.2C299.8 43.8 311.4 57.5 311.4 73.8V265.1C311.4 274 307.9 282.3 301.7 288.5C295.5 294.7 287.2 298.1 278.5 298.1C277.5 298.1 276.4 298 275.3 297.9L166.8 287.6L143.1 349.3L107.5 282Z");
    			attr_dev(path0, "stroke-linecap", "round");
    			attr_dev(path0, "stroke-linejoin", "round");
    			attr_dev(path0, "stroke-dasharray", "10 10");
    			attr_dev(path0, "stroke-dashoffset", "14px");
    			attr_dev(path0, "stroke-width", "2");
    			add_location(path0, file$3, 254, 6, 5292);
    			attr_dev(path1, "vector-effect", "non-scaling-stroke");
    			attr_dev(path1, "class", "speech-inner svelte-w8vwbn");
    			attr_dev(path1, "d", "M37.6 8.8C22.3 6.3 8.5 18.1 8.5 33.5V241.8C8.5 254.7 18.3 265.5 31.1 266.7L112.5 274.4L142 330L161.6 279L276.1 290C290.8 291.4 303.5 279.9 303.5 265.1V73.8C303.5 61.6 294.6 51.1 282.6 49.1L37.6 8.8Z");
    			attr_dev(path1, "fill", "white");
    			attr_dev(path1, "stroke-width", "1");
    			add_location(path1, file$3, 262, 6, 5834);
    			attr_dev(text0, "x", "50");
    			attr_dev(text0, "y", "210");
    			attr_dev(text0, "class", "hi");
    			add_location(text0, file$3, 270, 8, 6221);
    			attr_dev(text1, "x", "205");
    			attr_dev(text1, "y", "210");
    			attr_dev(text1, "class", "bang");
    			add_location(text1, file$3, 273, 8, 6291);
    			attr_dev(g, "class", "speech-exclaim svelte-w8vwbn");
    			add_location(g, file$3, 269, 6, 6186);
    			add_location(text2, file$3, 278, 6, 6379);
    			attr_dev(svg, "class", "bubble");
    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "viewBox", "0 0 312 351");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$3, 247, 4, 5143);
    			attr_dev(div0, "class", "speech svelte-w8vwbn");
    			add_location(div0, file$3, 246, 2, 5118);
    			attr_dev(span0, "class", "word designer svelte-w8vwbn");
    			add_location(span0, file$3, 285, 8, 6508);
    			attr_dev(div1, "class", "guide-y-line svelte-w8vwbn");
    			add_location(div1, file$3, 290, 12, 6725);
    			attr_dev(div2, "class", "guide-y-ends svelte-w8vwbn");
    			add_location(div2, file$3, 289, 10, 6686);
    			attr_dev(div3, "class", "guide-wrap svelte-w8vwbn");
    			set_style(div3, "right", "70%");
    			set_style(div3, "bottom", ".3em");
    			add_location(div3, file$3, 288, 8, 6618);
    			attr_dev(div4, "class", "guide-x-line svelte-w8vwbn");
    			add_location(div4, file$3, 295, 12, 6905);
    			attr_dev(div5, "class", "guide-x-ends svelte-w8vwbn");
    			add_location(div5, file$3, 294, 10, 6866);
    			attr_dev(div6, "class", "guide-wrap svelte-w8vwbn");
    			set_style(div6, "right", ".1em");
    			set_style(div6, "bottom", "80%");
    			add_location(div6, file$3, 293, 8, 6798);
    			attr_dev(span1, "class", "designer-contain svelte-w8vwbn");
    			add_location(span1, file$3, 284, 6, 6468);
    			attr_dev(span2, "class", "word animator svelte-w8vwbn");
    			add_location(span2, file$3, 298, 6, 6974);
    			attr_dev(span3, "class", "code-tag code-open svelte-w8vwbn");
    			add_location(span3, file$3, 302, 8, 7153);
    			attr_dev(span4, "class", "code-em svelte-w8vwbn");
    			add_location(span4, file$3, 303, 8, 7202);
    			attr_dev(span5, "class", "code-tag code-close svelte-w8vwbn");
    			add_location(span5, file$3, 304, 8, 7254);
    			attr_dev(span6, "class", "word code svelte-w8vwbn");
    			add_location(span6, file$3, 301, 6, 7082);
    			attr_dev(h1, "class", "svelte-w8vwbn");
    			add_location(h1, file$3, 282, 2, 6416);
    			attr_dev(section, "class", "svelte-w8vwbn");
    			add_location(section, file$3, 245, 0, 5106);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div0);
    			append_dev(div0, svg);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, g);
    			append_dev(g, text0);
    			append_dev(text0, t0);
    			append_dev(g, text1);
    			append_dev(text1, t1);
    			append_dev(svg, text2);
    			append_dev(section, t2);
    			append_dev(section, h1);
    			append_dev(h1, t3);
    			append_dev(h1, span1);
    			append_dev(span1, span0);
    			append_dev(span1, t5);
    			append_dev(span1, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(span1, t6);
    			append_dev(span1, div6);
    			append_dev(div6, div5);
    			append_dev(div5, div4);
    			append_dev(h1, t7);
    			append_dev(h1, span2);
    			append_dev(h1, t9);
    			append_dev(h1, span6);
    			append_dev(span6, span3);
    			append_dev(span6, t10);
    			append_dev(span6, span4);
    			append_dev(span6, t12);
    			append_dev(span6, span5);

    			if (!mounted) {
    				dispose = [
    					listen_dev(span0, "mouseenter", /*mouseenter_handler*/ ctx[3], false, false, false),
    					listen_dev(span2, "mouseenter", /*mouseenter_handler_1*/ ctx[4], false, false, false),
    					listen_dev(span6, "mouseenter", /*mouseenter_handler_2*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Hero", slots, []);
    	gsapWithCSS.registerPlugin(TextPlugin);

    	//reset tl function
    	const resetTL = function () {
    		this.restart().pause();
    	};

    	//text animation TLs
    	const desTL = gsapWithCSS.timeline({
    			onComplete: resetTL,
    			repeat: 1,
    			repeatDelay: 1,
    			yoyo: true,
    			paused: true
    		}),
    		animTL = gsapWithCSS.timeline({ onComplete: resetTL, paused: true }),
    		codeTL = gsapWithCSS.timeline({ onComplete: resetTL, paused: true });

    	//speech bubble TL
    	const speechTL = gsapWithCSS.timeline({ delay: 1 });

    	const delay = 0.02,
    		duration = 0.01,
    		// define nudge size for 'designer'
    		nudgeAmount = 7,
    		nudges = { x: 0, y: 0 };

    	onMount(() => {
    		// animate speech bubble
    		speechTL.from(".speech", { opacity: 0, duration: 0.2 }).from(
    			".speech",
    			{
    				transformOrigin: "center bottom",
    				scale: 0.3,
    				duration: 0.8,
    				ease: "elastic.out(1, 0.3)"
    			},
    			"<"
    		).from(
    			".speech",
    			{
    				duration: 3,
    				transformOrigin: "center bottom",
    				rotate: 40,
    				ease: "elastic.out(1, 0.12)"
    			},
    			"<"
    		).from(
    			".hi",
    			{
    				opacity: 0,
    				duration: 0.5,
    				scale: 0.2,
    				ease: "power4.out",
    				transformOrigin: "50%, 50%"
    			},
    			"-=2.6"
    		).fromTo(
    			".bang",
    			{
    				opacity: 0,
    				scale: 0.8,
    				rotate: 45,
    				transformOrigin: "50%, 50%"
    			},
    			{
    				duration: 0.5,
    				opacity: 1,
    				rotate: 15,
    				scale: 1.3,
    				x: 10,
    				y: 0,
    				ease: "power4.out",
    				transformOrigin: "50%, 50%"
    			},
    			"-=2.2"
    		);

    		// track nudge count by dimension
    		const nudge = function (dim) {
    			nudges[dim]++;
    		};

    		// word 'designer' nudges up and left, guides show up, color picker appear, color changed, yoyo
    		const desSel = " .designer";

    		desTL.set(".guide-y-ends", { autoAlpha: 0 }).set(".guide-x-ends", { autoAlpha: 0 }).to(desSel, { top: 0 }).add(nudge("y")).to(desSel, {
    			duration,
    			top: nudges.y * nudgeAmount * -1
    		}).to(".guide-y-line", { duration, height: nudges.y * nudgeAmount }).to(".guide-y-ends", { autoAlpha: 1 }).add(nudge("y")).to(desSel, {
    			delay,
    			duration,
    			top: nudges.y * nudgeAmount * -1
    		}).to(".guide-y-line", { duration, height: nudges.y * nudgeAmount }).add(nudge("x")).to(desSel, {
    			delay,
    			duration,
    			left: nudges.x * nudgeAmount * -1
    		}).to(".guide-x-line", { duration, width: nudges.x * nudgeAmount }).to(".guide-x-ends", { autoAlpha: 1 }).add(nudge("x")).to(desSel, {
    			delay,
    			duration,
    			left: nudges.x * nudgeAmount * -1
    		}).to(".guide-x-line", { duration, width: nudges.x * nudgeAmount }).add(nudge("x")).to(desSel, {
    			delay: 0.5,
    			duration,
    			left: nudges.x * nudgeAmount * -1
    		}).to(".guide-x-line", { duration, width: nudges.x * nudgeAmount }).add(nudge("y")).to(desSel, {
    			delay: 0.5,
    			duration,
    			top: nudges.y * nudgeAmount * -1
    		}).to(".guide-y-line", { duration, height: nudges.y * nudgeAmount }).timeScale(2.1);

    		animTL.to(".animator", {
    			delay: 0.3,
    			duration: 0.2,
    			scaleY: 1.2,
    			ease: "ease-out"
    		}).to(".animator", {
    			delay: 0.1,
    			duration: 1,
    			scaleY: 0.5,
    			ease: "elastic.out(1, 0.3)"
    		}).to(".animator", {
    			delay: 0.1,
    			duration: 0.2,
    			scaleX: 1.2,
    			ease: "ease-out"
    		}).to(".animator", {
    			delay: 0.1,
    			duration: 1,
    			scaleX: 0.5,
    			ease: "elastic.out(1, 0.3)"
    		}).to(".animator", {
    			delay: 0.2,
    			duration: 1,
    			scale: 1,
    			rotate: 360,
    			ease: "elastic.out(1, 0.3)"
    		}).timeScale(1.7);

    		codeTL.set(".code-tag", { margin: ".4rem", autoAlpha: 1 }).to(".code-open", {
    			duration: 0.4,
    			text: "&lt;i",
    			ease: "none"
    		}).to(
    			".code-close",
    			{
    				duration: 0.5,
    				text: "&lt;/i",
    				ease: "none"
    			},
    			"<"
    		).to(".code-open", {
    			delay: 0.4,
    			duration: 0.1,
    			text: "&lt;",
    			ease: "none"
    		}).to(
    			".code-close",
    			{
    				duration: 0.1,
    				text: "&lt;/",
    				ease: "none"
    			},
    			"<"
    		).to(".code-open", {
    			duration: 0.4,
    			text: "&lt;em&gt;",
    			ease: "none"
    		}).to(
    			".code-close",
    			{
    				duration: 0.4,
    				text: "&lt;/em&gt;",
    				ease: "none"
    			},
    			"<"
    		).to(".code-em", {
    			delay: 0.1,
    			duration: 0.1,
    			skewX: -20,
    			ease: "ease-out"
    		}).to(".code-open", {
    			delay: 1,
    			duration: 0.4,
    			text: "",
    			ease: "none"
    		}).to(".code-close", { duration: 0.4, text: "", ease: "none" }, "<").to(".code-em", {
    			duration: 0.2,
    			skewX: 0,
    			ease: "ease-out"
    		}).set(".code-tag", { margin: "0", autoAlpha: 0 }).timeScale(1.5);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Hero> was created with unknown prop '${key}'`);
    	});

    	const mouseenter_handler = () => {
    		desTL.play();
    	};

    	const mouseenter_handler_1 = () => {
    		animTL.play();
    	};

    	const mouseenter_handler_2 = () => {
    		codeTL.play();
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		gsap: gsapWithCSS,
    		TextPlugin,
    		resetTL,
    		desTL,
    		animTL,
    		codeTL,
    		speechTL,
    		delay,
    		duration,
    		nudgeAmount,
    		nudges
    	});

    	return [
    		desTL,
    		animTL,
    		codeTL,
    		mouseenter_handler,
    		mouseenter_handler_1,
    		mouseenter_handler_2
    	];
    }

    class Hero extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Hero",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /*!
     * matrix 3.5.1
     * https://greensock.com
     *
     * Copyright 2008-2020, GreenSock. All rights reserved.
     * Subject to the terms at https://greensock.com/standard-license or for
     * Club GreenSock members, the agreement issued with that membership.
     * @author: Jack Doyle, jack@greensock.com
    */

    /* eslint-disable */
    var _doc$3,
        _win$3,
        _docElement$1,
        _body$1,
        _divContainer,
        _svgContainer,
        _identityMatrix,
        _transformProp$2 = "transform",
        _transformOriginProp$1 = _transformProp$2 + "Origin",
        _hasOffsetBug,
        _setDoc = function _setDoc(element) {
      var doc = element.ownerDocument || element;

      if (!(_transformProp$2 in element.style) && "msTransform" in element.style) {
        //to improve compatibility with old Microsoft browsers
        _transformProp$2 = "msTransform";
        _transformOriginProp$1 = _transformProp$2 + "Origin";
      }

      while (doc.parentNode && (doc = doc.parentNode)) {}

      _win$3 = window;
      _identityMatrix = new Matrix2D();

      if (doc) {
        _doc$3 = doc;
        _docElement$1 = doc.documentElement;
        _body$1 = doc.body; // now test for the offset reporting bug. Use feature detection instead of browser sniffing to make things more bulletproof and future-proof. Hopefully Safari will fix their bug soon but it's 2020 and it's still not fixed.

        var d1 = doc.createElement("div"),
            d2 = doc.createElement("div");

        _body$1.appendChild(d1);

        d1.appendChild(d2);
        d1.style.position = "static";
        d1.style[_transformProp$2] = "translate3d(0,0,1px)";
        _hasOffsetBug = d2.offsetParent !== d1;

        _body$1.removeChild(d1);
      }

      return doc;
    },
        _forceNonZeroScale = function _forceNonZeroScale(e) {
      // walks up the element's ancestors and finds any that had their scale set to 0 via GSAP, and changes them to 0.0001 to ensure that measurements work
      var a, cache;

      while (e && e !== _body$1) {
        cache = e._gsap;

        if (cache && !cache.scaleX && !cache.scaleY && cache.renderTransform) {
          cache.scaleX = cache.scaleY = 1e-4;
          cache.renderTransform(1, cache);
          a ? a.push(cache) : a = [cache];
        }

        e = e.parentNode;
      }

      return a;
    },
        // possible future addition: pass an element to _forceDisplay() and it'll walk up all its ancestors and make sure anything with display: none is set to display: block, and if there's no parentNode, it'll add it to the body. It returns an Array that you can then feed to _revertDisplay() to have it revert all the changes it made.
    // _forceDisplay = e => {
    // 	let a = [],
    // 		parent;
    // 	while (e && e !== _body) {
    // 		parent = e.parentNode;
    // 		(_win.getComputedStyle(e).display === "none" || !parent) && a.push(e, e.style.display, parent) && (e.style.display = "block");
    // 		parent || _body.appendChild(e);
    // 		e = parent;
    // 	}
    // 	return a;
    // },
    // _revertDisplay = a => {
    // 	for (let i = 0; i < a.length; i+=3) {
    // 		a[i+1] ? (a[i].style.display = a[i+1]) : a[i].style.removeProperty("display");
    // 		a[i+2] || a[i].parentNode.removeChild(a[i]);
    // 	}
    // },
    _svgTemps = [],
        //we create 3 elements for SVG, and 3 for other DOM elements and cache them for performance reasons. They get nested in _divContainer and _svgContainer so that just one element is added to the DOM on each successive attempt. Again, performance is key.
    _divTemps = [],
        _getDocScrollTop = function _getDocScrollTop() {
      return _win$3.pageYOffset || _doc$3.scrollTop || _docElement$1.scrollTop || _body$1.scrollTop || 0;
    },
        _getDocScrollLeft = function _getDocScrollLeft() {
      return _win$3.pageXOffset || _doc$3.scrollLeft || _docElement$1.scrollLeft || _body$1.scrollLeft || 0;
    },
        _svgOwner = function _svgOwner(element) {
      return element.ownerSVGElement || ((element.tagName + "").toLowerCase() === "svg" ? element : null);
    },
        _isFixed = function _isFixed(element) {
      if (_win$3.getComputedStyle(element).position === "fixed") {
        return true;
      }

      element = element.parentNode;

      if (element && element.nodeType === 1) {
        // avoid document fragments which will throw an error.
        return _isFixed(element);
      }
    },
        _createSibling = function _createSibling(element, i) {
      if (element.parentNode && (_doc$3 || _setDoc(element))) {
        var svg = _svgOwner(element),
            ns = svg ? svg.getAttribute("xmlns") || "http://www.w3.org/2000/svg" : "http://www.w3.org/1999/xhtml",
            type = svg ? i ? "rect" : "g" : "div",
            x = i !== 2 ? 0 : 100,
            y = i === 3 ? 100 : 0,
            css = "position:absolute;display:block;pointer-events:none;",
            e = _doc$3.createElementNS ? _doc$3.createElementNS(ns.replace(/^https/, "http"), type) : _doc$3.createElement(type);

        if (i) {
          if (!svg) {
            if (!_divContainer) {
              _divContainer = _createSibling(element);
              _divContainer.style.cssText = css;
            }

            e.style.cssText = css + "width:0.1px;height:0.1px;top:" + y + "px;left:" + x + "px";

            _divContainer.appendChild(e);
          } else {
            if (!_svgContainer) {
              _svgContainer = _createSibling(element);
            }

            e.setAttribute("width", 0.01);
            e.setAttribute("height", 0.01);
            e.setAttribute("transform", "translate(" + x + "," + y + ")");

            _svgContainer.appendChild(e);
          }
        }

        return e;
      }

      throw "Need document and parent.";
    },
        _consolidate = function _consolidate(m) {
      // replaces SVGTransformList.consolidate() because a bug in Firefox causes it to break pointer events. See https://greensock.com/forums/topic/23248-touch-is-not-working-on-draggable-in-firefox-windows-v324/?tab=comments#comment-109800
      var c = new Matrix2D(),
          i = 0;

      for (; i < m.numberOfItems; i++) {
        c.multiply(m.getItem(i).matrix);
      }

      return c;
    },
        _placeSiblings = function _placeSiblings(element, adjustGOffset) {
      var svg = _svgOwner(element),
          isRootSVG = element === svg,
          siblings = svg ? _svgTemps : _divTemps,
          container,
          m,
          b,
          x,
          y;

      if (element === _win$3) {
        return element;
      }

      if (!siblings.length) {
        siblings.push(_createSibling(element, 1), _createSibling(element, 2), _createSibling(element, 3));
      }

      container = svg ? _svgContainer : _divContainer;

      if (svg) {
        b = isRootSVG ? {
          x: 0,
          y: 0
        } : element.getBBox();
        m = element.transform ? element.transform.baseVal : {}; // IE11 doesn't follow the spec.

        if (m.numberOfItems) {
          m = m.numberOfItems > 1 ? _consolidate(m) : m.getItem(0).matrix; // don't call m.consolidate().matrix because a bug in Firefox makes pointer events not work when consolidate() is called on the same tick as getBoundingClientRect()! See https://greensock.com/forums/topic/23248-touch-is-not-working-on-draggable-in-firefox-windows-v324/?tab=comments#comment-109800

          x = m.a * b.x + m.c * b.y;
          y = m.b * b.x + m.d * b.y;
        } else {
          m = _identityMatrix;
          x = b.x;
          y = b.y;
        }

        if (adjustGOffset && element.tagName.toLowerCase() === "g") {
          x = y = 0;
        }

        container.setAttribute("transform", "matrix(" + m.a + "," + m.b + "," + m.c + "," + m.d + "," + (m.e + x) + "," + (m.f + y) + ")");
        (isRootSVG ? svg : element.parentNode).appendChild(container);
      } else {
        x = y = 0;

        if (_hasOffsetBug) {
          // some browsers (like Safari) have a bug that causes them to misreport offset values. When an ancestor element has a transform applied, it's supposed to treat it as if it's position: relative (new context). Safari botches this, so we need to find the closest ancestor (between the element and its offsetParent) that has a transform applied and if one is found, grab its offsetTop/Left and subtract them to compensate.
          m = element.offsetParent;
          b = element;

          while (b && (b = b.parentNode) && b !== m && b.parentNode) {
            if ((_win$3.getComputedStyle(b)[_transformProp$2] + "").length > 4) {
              x = b.offsetLeft;
              y = b.offsetTop;
              b = 0;
            }
          }
        }

        b = container.style;
        b.top = element.offsetTop - y + "px";
        b.left = element.offsetLeft - x + "px";
        m = _win$3.getComputedStyle(element);
        b[_transformProp$2] = m[_transformProp$2];
        b[_transformOriginProp$1] = m[_transformOriginProp$1];
        b.border = m.border;
        b.borderLeftStyle = m.borderLeftStyle;
        b.borderTopStyle = m.borderTopStyle;
        b.borderLeftWidth = m.borderLeftWidth;
        b.borderTopWidth = m.borderTopWidth;
        b.position = m.position === "fixed" ? "fixed" : "absolute";
        element.parentNode.appendChild(container);
      }

      return container;
    },
        _setMatrix = function _setMatrix(m, a, b, c, d, e, f) {
      m.a = a;
      m.b = b;
      m.c = c;
      m.d = d;
      m.e = e;
      m.f = f;
      return m;
    };

    var Matrix2D = /*#__PURE__*/function () {
      function Matrix2D(a, b, c, d, e, f) {
        if (a === void 0) {
          a = 1;
        }

        if (b === void 0) {
          b = 0;
        }

        if (c === void 0) {
          c = 0;
        }

        if (d === void 0) {
          d = 1;
        }

        if (e === void 0) {
          e = 0;
        }

        if (f === void 0) {
          f = 0;
        }

        _setMatrix(this, a, b, c, d, e, f);
      }

      var _proto = Matrix2D.prototype;

      _proto.inverse = function inverse() {
        var a = this.a,
            b = this.b,
            c = this.c,
            d = this.d,
            e = this.e,
            f = this.f,
            determinant = a * d - b * c || 1e-10;
        return _setMatrix(this, d / determinant, -b / determinant, -c / determinant, a / determinant, (c * f - d * e) / determinant, -(a * f - b * e) / determinant);
      };

      _proto.multiply = function multiply(matrix) {
        var a = this.a,
            b = this.b,
            c = this.c,
            d = this.d,
            e = this.e,
            f = this.f,
            a2 = matrix.a,
            b2 = matrix.c,
            c2 = matrix.b,
            d2 = matrix.d,
            e2 = matrix.e,
            f2 = matrix.f;
        return _setMatrix(this, a2 * a + c2 * c, a2 * b + c2 * d, b2 * a + d2 * c, b2 * b + d2 * d, e + e2 * a + f2 * c, f + e2 * b + f2 * d);
      };

      _proto.clone = function clone() {
        return new Matrix2D(this.a, this.b, this.c, this.d, this.e, this.f);
      };

      _proto.equals = function equals(matrix) {
        var a = this.a,
            b = this.b,
            c = this.c,
            d = this.d,
            e = this.e,
            f = this.f;
        return a === matrix.a && b === matrix.b && c === matrix.c && d === matrix.d && e === matrix.e && f === matrix.f;
      };

      _proto.apply = function apply(point, decoratee) {
        if (decoratee === void 0) {
          decoratee = {};
        }

        var x = point.x,
            y = point.y,
            a = this.a,
            b = this.b,
            c = this.c,
            d = this.d,
            e = this.e,
            f = this.f;
        decoratee.x = x * a + y * c + e || 0;
        decoratee.y = x * b + y * d + f || 0;
        return decoratee;
      };

      return Matrix2D;
    }(); //feed in an element and it'll return a 2D matrix (optionally inverted) so that you can translate between coordinate spaces.
    // Inverting lets you translate a global point into a local coordinate space. No inverting lets you go the other way.
    // We needed this to work around various browser bugs, like Firefox doesn't accurately report getScreenCTM() when there
    // are transforms applied to ancestor elements.
    // The matrix math to convert any x/y coordinate is as follows, which is wrapped in a convenient apply() method of Matrix2D above:
    //     tx = m.a * x + m.c * y + m.e
    //     ty = m.b * x + m.d * y + m.f

    function getGlobalMatrix(element, inverse, adjustGOffset) {
      // adjustGOffset is typically used only when grabbing an element's PARENT's global matrix, and it ignores the x/y offset of any SVG <g> elements because they behave in a special way.
      if (!element || !element.parentNode || (_doc$3 || _setDoc(element)).documentElement === element) {
        return new Matrix2D();
      }

      var zeroScales = _forceNonZeroScale(element.parentNode),
          svg = _svgOwner(element),
          temps = svg ? _svgTemps : _divTemps,
          container = _placeSiblings(element, adjustGOffset),
          b1 = temps[0].getBoundingClientRect(),
          b2 = temps[1].getBoundingClientRect(),
          b3 = temps[2].getBoundingClientRect(),
          parent = container.parentNode,
          isFixed = _isFixed(element),
          m = new Matrix2D((b2.left - b1.left) / 100, (b2.top - b1.top) / 100, (b3.left - b1.left) / 100, (b3.top - b1.top) / 100, b1.left + (isFixed ? 0 : _getDocScrollLeft()), b1.top + (isFixed ? 0 : _getDocScrollTop()));

      parent.removeChild(container);

      if (zeroScales) {
        b1 = zeroScales.length;

        while (b1--) {
          b2 = zeroScales[b1];
          b2.scaleX = b2.scaleY = 0;
          b2.renderTransform(1, b2);
        }
      }

      return inverse ? m.inverse() : m;
    } // export function getMatrix(element) {
    // 	_doc || _setDoc(element);
    // 	let m = (_win.getComputedStyle(element)[_transformProp] + "").substr(7).match(/[-.]*\d+[.e\-+]*\d*[e\-\+]*\d*/g),
    // 		is2D = m && m.length === 6;
    // 	return !m || m.length < 6 ? new Matrix2D() : new Matrix2D(+m[0], +m[1], +m[is2D ? 2 : 4], +m[is2D ? 3 : 5], +m[is2D ? 4 : 12], +m[is2D ? 5 : 13]);
    // }

    function _assertThisInitialized$1(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

    function _inheritsLoose$1(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

    var gsap$3,
        _win$4,
        _doc$4,
        _docElement$2,
        _body$2,
        _tempDiv$2,
        _placeholderDiv,
        _coreInitted$2,
        _checkPrefix,
        _toArray$1,
        _supportsPassive,
        _isTouchDevice,
        _touchEventLookup,
        _dragCount,
        _isMultiTouching,
        _isAndroid,
        InertiaPlugin,
        _defaultCursor,
        _supportsPointer,
        _windowExists$3 = function _windowExists() {
      return typeof window !== "undefined";
    },
        _getGSAP$2 = function _getGSAP() {
      return gsap$3 || _windowExists$3() && (gsap$3 = window.gsap) && gsap$3.registerPlugin && gsap$3;
    },
        _isFunction$2 = function _isFunction(value) {
      return typeof value === "function";
    },
        _isObject$2 = function _isObject(value) {
      return typeof value === "object";
    },
        _isUndefined$1 = function _isUndefined(value) {
      return typeof value === "undefined";
    },
        _emptyFunc$1 = function _emptyFunc() {
      return false;
    },
        _transformProp$3 = "transform",
        _transformOriginProp$2 = "transformOrigin",
        _round$1 = function _round(value) {
      return Math.round(value * 10000) / 10000;
    },
        _isArray$1 = Array.isArray,
        _createElement$1 = function _createElement(type, ns) {
      var e = _doc$4.createElementNS ? _doc$4.createElementNS((ns || "http://www.w3.org/1999/xhtml").replace(/^https/, "http"), type) : _doc$4.createElement(type); //some servers swap in https for http in the namespace which can break things, making "style" inaccessible.

      return e.style ? e : _doc$4.createElement(type); //some environments won't allow access to the element's style when created with a namespace in which case we default to the standard createElement() to work around the issue. Also note that when GSAP is embedded directly inside an SVG file, createElement() won't allow access to the style object in Firefox (see https://greensock.com/forums/topic/20215-problem-using-tweenmax-in-standalone-self-containing-svg-file-err-cannot-set-property-csstext-of-undefined/).
    },
        _RAD2DEG$1 = 180 / Math.PI,
        _bigNum$2 = 1e20,
        _identityMatrix$1 = new Matrix2D(),
        _getTime$1 = Date.now || function () {
      return new Date().getTime();
    },
        _renderQueue = [],
        _lookup = {},
        //when a Draggable is created, the target gets a unique _gsDragID property that allows gets associated with the Draggable instance for quick lookups in Draggable.get(). This avoids circular references that could cause gc problems.
    _lookupCount = 0,
        _clickableTagExp = /^(?:a|input|textarea|button|select)$/i,
        _lastDragTime = 0,
        _temp1 = {},
        // a simple object we reuse and populate (usually x/y properties) to conserve memory and improve performance.
    _windowProxy = {},
        //memory/performance optimization - we reuse this object during autoScroll to store window-related bounds/offsets.
    _copy = function _copy(obj, factor) {
      var copy = {},
          p;

      for (p in obj) {
        copy[p] = factor ? obj[p] * factor : obj[p];
      }

      return copy;
    },
        _extend = function _extend(obj, defaults) {
      for (var p in defaults) {
        if (!(p in obj)) {
          obj[p] = defaults[p];
        }
      }

      return obj;
    },
        _renderQueueTick = function _renderQueueTick() {
      return _renderQueue.forEach(function (func) {
        return func();
      });
    },
        _addToRenderQueue = function _addToRenderQueue(func) {
      _renderQueue.push(func);

      if (_renderQueue.length === 1) {
        gsap$3.ticker.add(_renderQueueTick);
      }
    },
        _renderQueueTimeout = function _renderQueueTimeout() {
      return !_renderQueue.length && gsap$3.ticker.remove(_renderQueueTick);
    },
        _removeFromRenderQueue = function _removeFromRenderQueue(func) {
      var i = _renderQueue.length;

      while (i--) {
        if (_renderQueue[i] === func) {
          _renderQueue.splice(i, 1);
        }
      }

      gsap$3.to(_renderQueueTimeout, {
        overwrite: true,
        delay: 15,
        duration: 0,
        onComplete: _renderQueueTimeout,
        data: "_draggable"
      }); //remove the "tick" listener only after the render queue is empty for 15 seconds (to improve performance). Adding/removing it constantly for every click/touch wouldn't deliver optimal speed, and we also don't want the ticker to keep calling the render method when things are idle for long periods of time (we want to improve battery life on mobile devices).
    },
        _setDefaults$2 = function _setDefaults(obj, defaults) {
      for (var p in defaults) {
        if (!(p in obj)) {
          obj[p] = defaults[p];
        }
      }

      return obj;
    },
        _addListener$1 = function _addListener(element, type, func, capture) {
      if (element.addEventListener) {
        var touchType = _touchEventLookup[type];
        capture = capture || (_supportsPassive ? {
          passive: false
        } : null);
        element.addEventListener(touchType || type, func, capture);
        touchType && type !== touchType && element.addEventListener(type, func, capture); //some browsers actually support both, so must we. But pointer events cover all.
      }
    },
        _removeListener$1 = function _removeListener(element, type, func) {
      if (element.removeEventListener) {
        var touchType = _touchEventLookup[type];
        element.removeEventListener(touchType || type, func);
        touchType && type !== touchType && element.removeEventListener(type, func);
      }
    },
        _preventDefault = function _preventDefault(event) {
      event.preventDefault && event.preventDefault();
      event.preventManipulation && event.preventManipulation(); //for some Microsoft browsers
    },
        _hasTouchID = function _hasTouchID(list, ID) {
      var i = list.length;

      while (i--) {
        if (list[i].identifier === ID) {
          return true;
        }
      }
    },
        _onMultiTouchDocumentEnd = function _onMultiTouchDocumentEnd(event) {
      _isMultiTouching = event.touches && _dragCount < event.touches.length;

      _removeListener$1(event.target, "touchend", _onMultiTouchDocumentEnd);
    },
        _onMultiTouchDocument = function _onMultiTouchDocument(event) {
      _isMultiTouching = event.touches && _dragCount < event.touches.length;

      _addListener$1(event.target, "touchend", _onMultiTouchDocumentEnd);
    },
        _getDocScrollTop$1 = function _getDocScrollTop(doc) {
      return _win$4.pageYOffset || doc.scrollTop || doc.documentElement.scrollTop || doc.body.scrollTop || 0;
    },
        _getDocScrollLeft$1 = function _getDocScrollLeft(doc) {
      return _win$4.pageXOffset || doc.scrollLeft || doc.documentElement.scrollLeft || doc.body.scrollLeft || 0;
    },
        _addScrollListener = function _addScrollListener(e, callback) {
      _addListener$1(e, "scroll", callback);

      if (!_isRoot(e.parentNode)) {
        _addScrollListener(e.parentNode, callback);
      }
    },
        _removeScrollListener = function _removeScrollListener(e, callback) {
      _removeListener$1(e, "scroll", callback);

      if (!_isRoot(e.parentNode)) {
        _removeScrollListener(e.parentNode, callback);
      }
    },
        _isRoot = function _isRoot(e) {
      return !!(!e || e === _docElement$2 || e.nodeType === 9 || e === _doc$4.body || e === _win$4 || !e.nodeType || !e.parentNode);
    },
        _getMaxScroll = function _getMaxScroll(element, axis) {
      var dim = axis === "x" ? "Width" : "Height",
          scroll = "scroll" + dim,
          client = "client" + dim;
      return Math.max(0, _isRoot(element) ? Math.max(_docElement$2[scroll], _body$2[scroll]) - (_win$4["inner" + dim] || _docElement$2[client] || _body$2[client]) : element[scroll] - element[client]);
    },
        _recordMaxScrolls = function _recordMaxScrolls(e, skipCurrent) {
      //records _gsMaxScrollX and _gsMaxScrollY properties for the element and all ancestors up the chain so that we can cap it, otherwise dragging beyond the edges with autoScroll on can endlessly scroll.
      var x = _getMaxScroll(e, "x"),
          y = _getMaxScroll(e, "y");

      if (_isRoot(e)) {
        e = _windowProxy;
      } else {
        _recordMaxScrolls(e.parentNode, skipCurrent);
      }

      e._gsMaxScrollX = x;
      e._gsMaxScrollY = y;

      if (!skipCurrent) {
        e._gsScrollX = e.scrollLeft || 0;
        e._gsScrollY = e.scrollTop || 0;
      }
    },
        _setStyle = function _setStyle(element, property, value) {
      var style = element.style;

      if (!style) {
        return;
      }

      if (_isUndefined$1(style[property])) {
        property = _checkPrefix(property, element) || property;
      }

      if (value == null) {
        style.removeProperty && style.removeProperty(property.replace(/([A-Z])/g, "-$1").toLowerCase());
      } else {
        style[property] = value;
      }
    },
        _getComputedStyle$1 = function _getComputedStyle(element) {
      return _win$4.getComputedStyle(element instanceof Element ? element : element.host || (element.parentNode || {}).host || element);
    },
        //the "host" stuff helps to accommodate ShadowDom objects.
    _tempRect = {},
        //reuse to reduce garbage collection tasks
    _parseRect = function _parseRect(e) {
      //accepts a DOM element, a mouse event, or a rectangle object and returns the corresponding rectangle with left, right, width, height, top, and bottom properties
      if (e === _win$4) {
        _tempRect.left = _tempRect.top = 0;
        _tempRect.width = _tempRect.right = _docElement$2.clientWidth || e.innerWidth || _body$2.clientWidth || 0;
        _tempRect.height = _tempRect.bottom = (e.innerHeight || 0) - 20 < _docElement$2.clientHeight ? _docElement$2.clientHeight : e.innerHeight || _body$2.clientHeight || 0;
        return _tempRect;
      }

      var doc = e.ownerDocument || _doc$4,
          r = !_isUndefined$1(e.pageX) ? {
        left: e.pageX - _getDocScrollLeft$1(doc),
        top: e.pageY - _getDocScrollTop$1(doc),
        right: e.pageX - _getDocScrollLeft$1(doc) + 1,
        bottom: e.pageY - _getDocScrollTop$1(doc) + 1
      } : !e.nodeType && !_isUndefined$1(e.left) && !_isUndefined$1(e.top) ? e : _toArray$1(e)[0].getBoundingClientRect();

      if (_isUndefined$1(r.right) && !_isUndefined$1(r.width)) {
        r.right = r.left + r.width;
        r.bottom = r.top + r.height;
      } else if (_isUndefined$1(r.width)) {
        //some browsers don't include width and height properties. We can't just set them directly on r because some browsers throw errors, so create a new generic object.
        r = {
          width: r.right - r.left,
          height: r.bottom - r.top,
          right: r.right,
          left: r.left,
          bottom: r.bottom,
          top: r.top
        };
      }

      return r;
    },
        _dispatchEvent = function _dispatchEvent(target, type, callbackName) {
      var vars = target.vars,
          callback = vars[callbackName],
          listeners = target._listeners[type],
          result;

      if (_isFunction$2(callback)) {
        result = callback.apply(vars.callbackScope || target, vars[callbackName + "Params"] || [target.pointerEvent]);
      }

      if (listeners && target.dispatchEvent(type) === false) {
        result = false;
      }

      return result;
    },
        _getBounds$1 = function _getBounds(target, context) {
      //accepts any of the following: a DOM element, jQuery object, selector text, or an object defining bounds as {top, left, width, height} or {minX, maxX, minY, maxY}. Returns an object with left, top, width, and height properties.
      var e = _toArray$1(target)[0],
          top,
          left,
          offset;

      if (!e.nodeType && e !== _win$4) {
        if (!_isUndefined$1(target.left)) {
          offset = {
            x: 0,
            y: 0
          }; //_getOffsetTransformOrigin(context); //the bounds should be relative to the origin

          return {
            left: target.left - offset.x,
            top: target.top - offset.y,
            width: target.width,
            height: target.height
          };
        }

        left = target.min || target.minX || target.minRotation || 0;
        top = target.min || target.minY || 0;
        return {
          left: left,
          top: top,
          width: (target.max || target.maxX || target.maxRotation || 0) - left,
          height: (target.max || target.maxY || 0) - top
        };
      }

      return _getElementBounds(e, context);
    },
        _point1 = {},
        //we reuse to minimize garbage collection tasks.
    _getElementBounds = function _getElementBounds(element, context) {
      context = _toArray$1(context)[0];
      var isSVG = element.getBBox && element.ownerSVGElement,
          doc = element.ownerDocument || _doc$4,
          left,
          right,
          top,
          bottom,
          matrix,
          p1,
          p2,
          p3,
          p4,
          bbox,
          width,
          height,
          cs,
          contextParent;

      if (element === _win$4) {
        top = _getDocScrollTop$1(doc);
        left = _getDocScrollLeft$1(doc);
        right = left + (doc.documentElement.clientWidth || element.innerWidth || doc.body.clientWidth || 0);
        bottom = top + ((element.innerHeight || 0) - 20 < doc.documentElement.clientHeight ? doc.documentElement.clientHeight : element.innerHeight || doc.body.clientHeight || 0); //some browsers (like Firefox) ignore absolutely positioned elements, and collapse the height of the documentElement, so it could be 8px, for example, if you have just an absolutely positioned div. In that case, we use the innerHeight to resolve this.
      } else if (context === _win$4 || _isUndefined$1(context)) {
        return element.getBoundingClientRect();
      } else {
        left = top = 0;

        if (isSVG) {
          bbox = element.getBBox();
          width = bbox.width;
          height = bbox.height;
        } else {
          if (element.viewBox && (bbox = element.viewBox.baseVal)) {
            left = bbox.x || 0;
            top = bbox.y || 0;
            width = bbox.width;
            height = bbox.height;
          }

          if (!width) {
            cs = _getComputedStyle$1(element);
            bbox = cs.boxSizing === "border-box";
            width = (parseFloat(cs.width) || element.clientWidth || 0) + (bbox ? 0 : parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth));
            height = (parseFloat(cs.height) || element.clientHeight || 0) + (bbox ? 0 : parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth));
          }
        }

        right = width;
        bottom = height;
      }

      if (element === context) {
        return {
          left: left,
          top: top,
          width: right - left,
          height: bottom - top
        };
      }

      matrix = getGlobalMatrix(context, true).multiply(getGlobalMatrix(element));
      p1 = matrix.apply({
        x: left,
        y: top
      });
      p2 = matrix.apply({
        x: right,
        y: top
      });
      p3 = matrix.apply({
        x: right,
        y: bottom
      });
      p4 = matrix.apply({
        x: left,
        y: bottom
      });
      left = Math.min(p1.x, p2.x, p3.x, p4.x);
      top = Math.min(p1.y, p2.y, p3.y, p4.y);
      contextParent = context.parentNode || {};
      return {
        left: left + (contextParent.scrollLeft || 0),
        top: top + (contextParent.scrollTop || 0),
        width: Math.max(p1.x, p2.x, p3.x, p4.x) - left,
        height: Math.max(p1.y, p2.y, p3.y, p4.y) - top
      };
    },
        _parseInertia = function _parseInertia(draggable, snap, max, min, factor, forceZeroVelocity) {
      var vars = {},
          a,
          i,
          l;

      if (snap) {
        if (factor !== 1 && snap instanceof Array) {
          //some data must be altered to make sense, like if the user passes in an array of rotational values in degrees, we must convert it to radians. Or for scrollLeft and scrollTop, we invert the values.
          vars.end = a = [];
          l = snap.length;

          if (_isObject$2(snap[0])) {
            //if the array is populated with objects, like points ({x:100, y:200}), make copies before multiplying by the factor, otherwise we'll mess up the originals and the user may reuse it elsewhere.
            for (i = 0; i < l; i++) {
              a[i] = _copy(snap[i], factor);
            }
          } else {
            for (i = 0; i < l; i++) {
              a[i] = snap[i] * factor;
            }
          }

          max += 1.1; //allow 1.1 pixels of wiggle room when snapping in order to work around some browser inconsistencies in the way bounds are reported which can make them roughly a pixel off. For example, if "snap:[-$('#menu').width(), 0]" was defined and #menu had a wrapper that was used as the bounds, some browsers would be one pixel off, making the minimum -752 for example when snap was [-753,0], thus instead of snapping to -753, it would snap to 0 since -753 was below the minimum.

          min -= 1.1;
        } else if (_isFunction$2(snap)) {
          vars.end = function (value) {
            var result = snap.call(draggable, value),
                copy,
                p;

            if (factor !== 1) {
              if (_isObject$2(result)) {
                copy = {};

                for (p in result) {
                  copy[p] = result[p] * factor;
                }

                result = copy;
              } else {
                result *= factor;
              }
            }

            return result; //we need to ensure that we can scope the function call to the Draggable instance itself so that users can access important values like maxX, minX, maxY, minY, x, and y from within that function.
          };
        } else {
          vars.end = snap;
        }
      }

      if (max || max === 0) {
        vars.max = max;
      }

      if (min || min === 0) {
        vars.min = min;
      }

      if (forceZeroVelocity) {
        vars.velocity = 0;
      }

      return vars;
    },
        _isClickable = function _isClickable(element) {
      //sometimes it's convenient to mark an element as clickable by adding a data-clickable="true" attribute (in which case we won't preventDefault() the mouse/touch event). This method checks if the element is an <a>, <input>, or <button> or has an onclick or has the data-clickable or contentEditable attribute set to true (or any of its parent elements).
      var data;
      return !element || !element.getAttribute || element === _body$2 ? false : (data = element.getAttribute("data-clickable")) === "true" || data !== "false" && (element.onclick || _clickableTagExp.test(element.nodeName + "") || element.getAttribute("contentEditable") === "true") ? true : _isClickable(element.parentNode);
    },
        _setSelectable = function _setSelectable(elements, selectable) {
      var i = elements.length,
          e;

      while (i--) {
        e = elements[i];
        e.ondragstart = e.onselectstart = selectable ? null : _emptyFunc$1; //setStyle(e, "userSelect", (selectable ? "text" : "none"));

        gsap$3.set(e, {
          lazy: true,
          userSelect: selectable ? "text" : "none"
        });
      }
    },
        _isFixed$1 = function _isFixed(element) {
      if (_getComputedStyle$1(element).position === "fixed") {
        return true;
      }

      element = element.parentNode;

      if (element && element.nodeType === 1) {
        // avoid document fragments which will throw an error.
        return _isFixed(element);
      }
    },
        _supports3D$1,
        _addPaddingBR,
        //The ScrollProxy class wraps an element's contents into another div (we call it "content") that we either add padding when necessary or apply a translate3d() transform in order to overscroll (scroll past the boundaries). This allows us to simply set the scrollTop/scrollLeft (or top/left for easier reverse-axis orientation, which is what we do in Draggable) and it'll do all the work for us. For example, if we tried setting scrollTop to -100 on a normal DOM element, it wouldn't work - it'd look the same as setting it to 0, but if we set scrollTop of a ScrollProxy to -100, it'll give the correct appearance by either setting paddingTop of the wrapper to 100 or applying a 100-pixel translateY.
    ScrollProxy = function ScrollProxy(element, vars) {
      element = gsap$3.utils.toArray(element)[0];
      vars = vars || {};
      var content = document.createElement("div"),
          style = content.style,
          node = element.firstChild,
          offsetTop = 0,
          offsetLeft = 0,
          prevTop = element.scrollTop,
          prevLeft = element.scrollLeft,
          scrollWidth = element.scrollWidth,
          scrollHeight = element.scrollHeight,
          extraPadRight = 0,
          maxLeft = 0,
          maxTop = 0,
          elementWidth,
          elementHeight,
          contentHeight,
          nextNode,
          transformStart,
          transformEnd;

      if (_supports3D$1 && vars.force3D !== false) {
        transformStart = "translate3d(";
        transformEnd = "px,0px)";
      } else if (_transformProp$3) {
        transformStart = "translate(";
        transformEnd = "px)";
      }

      this.scrollTop = function (value, force) {
        if (!arguments.length) {
          return -this.top();
        }

        this.top(-value, force);
      };

      this.scrollLeft = function (value, force) {
        if (!arguments.length) {
          return -this.left();
        }

        this.left(-value, force);
      };

      this.left = function (value, force) {
        if (!arguments.length) {
          return -(element.scrollLeft + offsetLeft);
        }

        var dif = element.scrollLeft - prevLeft,
            oldOffset = offsetLeft;

        if ((dif > 2 || dif < -2) && !force) {
          //if the user interacts with the scrollbar (or something else scrolls it, like the mouse wheel), we should kill any tweens of the ScrollProxy.
          prevLeft = element.scrollLeft;
          gsap$3.killTweensOf(this, {
            left: 1,
            scrollLeft: 1
          });
          this.left(-prevLeft);

          if (vars.onKill) {
            vars.onKill();
          }

          return;
        }

        value = -value; //invert because scrolling works in the opposite direction

        if (value < 0) {
          offsetLeft = value - 0.5 | 0;
          value = 0;
        } else if (value > maxLeft) {
          offsetLeft = value - maxLeft | 0;
          value = maxLeft;
        } else {
          offsetLeft = 0;
        }

        if (offsetLeft || oldOffset) {
          if (!this._skip) {
            style[_transformProp$3] = transformStart + -offsetLeft + "px," + -offsetTop + transformEnd;
          }

          if (offsetLeft + extraPadRight >= 0) {
            style.paddingRight = offsetLeft + extraPadRight + "px";
          }
        }

        element.scrollLeft = value | 0;
        prevLeft = element.scrollLeft; //don't merge this with the line above because some browsers adjust the scrollLeft after it's set, so in order to be 100% accurate in tracking it, we need to ask the browser to report it.
      };

      this.top = function (value, force) {
        if (!arguments.length) {
          return -(element.scrollTop + offsetTop);
        }

        var dif = element.scrollTop - prevTop,
            oldOffset = offsetTop;

        if ((dif > 2 || dif < -2) && !force) {
          //if the user interacts with the scrollbar (or something else scrolls it, like the mouse wheel), we should kill any tweens of the ScrollProxy.
          prevTop = element.scrollTop;
          gsap$3.killTweensOf(this, {
            top: 1,
            scrollTop: 1
          });
          this.top(-prevTop);

          if (vars.onKill) {
            vars.onKill();
          }

          return;
        }

        value = -value; //invert because scrolling works in the opposite direction

        if (value < 0) {
          offsetTop = value - 0.5 | 0;
          value = 0;
        } else if (value > maxTop) {
          offsetTop = value - maxTop | 0;
          value = maxTop;
        } else {
          offsetTop = 0;
        }

        if (offsetTop || oldOffset) {
          if (!this._skip) {
            style[_transformProp$3] = transformStart + -offsetLeft + "px," + -offsetTop + transformEnd;
          }
        }

        element.scrollTop = value | 0;
        prevTop = element.scrollTop;
      };

      this.maxScrollTop = function () {
        return maxTop;
      };

      this.maxScrollLeft = function () {
        return maxLeft;
      };

      this.disable = function () {
        node = content.firstChild;

        while (node) {
          nextNode = node.nextSibling;
          element.appendChild(node);
          node = nextNode;
        }

        if (element === content.parentNode) {
          //in case disable() is called when it's already disabled.
          element.removeChild(content);
        }
      };

      this.enable = function () {
        node = element.firstChild;

        if (node === content) {
          return;
        }

        while (node) {
          nextNode = node.nextSibling;
          content.appendChild(node);
          node = nextNode;
        }

        element.appendChild(content);
        this.calibrate();
      };

      this.calibrate = function (force) {
        var widthMatches = element.clientWidth === elementWidth,
            cs,
            x,
            y;
        prevTop = element.scrollTop;
        prevLeft = element.scrollLeft;

        if (widthMatches && element.clientHeight === elementHeight && content.offsetHeight === contentHeight && scrollWidth === element.scrollWidth && scrollHeight === element.scrollHeight && !force) {
          return; //no need to recalculate things if the width and height haven't changed.
        }

        if (offsetTop || offsetLeft) {
          x = this.left();
          y = this.top();
          this.left(-element.scrollLeft);
          this.top(-element.scrollTop);
        }

        cs = _getComputedStyle$1(element); //first, we need to remove any width constraints to see how the content naturally flows so that we can see if it's wider than the containing element. If so, we've got to record the amount of overage so that we can apply that as padding in order for browsers to correctly handle things. Then we switch back to a width of 100% (without that, some browsers don't flow the content correctly)

        if (!widthMatches || force) {
          style.display = "block";
          style.width = "auto";
          style.paddingRight = "0px";
          extraPadRight = Math.max(0, element.scrollWidth - element.clientWidth); //if the content is wider than the container, we need to add the paddingLeft and paddingRight in order for things to behave correctly.

          if (extraPadRight) {
            extraPadRight += parseFloat(cs.paddingLeft) + (_addPaddingBR ? parseFloat(cs.paddingRight) : 0);
          }
        }

        style.display = "inline-block";
        style.position = "relative";
        style.overflow = "visible";
        style.verticalAlign = "top";
        style.boxSizing = "content-box";
        style.width = "100%";
        style.paddingRight = extraPadRight + "px"; //some browsers neglect to factor in the bottom padding when calculating the scrollHeight, so we need to add that padding to the content when that happens. Allow a 2px margin for error

        if (_addPaddingBR) {
          style.paddingBottom = cs.paddingBottom;
        }

        elementWidth = element.clientWidth;
        elementHeight = element.clientHeight;
        scrollWidth = element.scrollWidth;
        scrollHeight = element.scrollHeight;
        maxLeft = element.scrollWidth - elementWidth;
        maxTop = element.scrollHeight - elementHeight;
        contentHeight = content.offsetHeight;
        style.display = "block";

        if (x || y) {
          this.left(x);
          this.top(y);
        }
      };

      this.content = content;
      this.element = element;
      this._skip = false;
      this.enable();
    },
        _initCore$1 = function _initCore(required) {
      if (_windowExists$3() && document.body) {
        var nav = window && window.navigator;
        _win$4 = window;
        _doc$4 = document;
        _docElement$2 = _doc$4.documentElement;
        _body$2 = _doc$4.body;
        _tempDiv$2 = _createElement$1("div");
        _supportsPointer = !!window.PointerEvent;
        _placeholderDiv = _createElement$1("div");
        _placeholderDiv.style.cssText = "visibility:hidden;height:1px;top:-1px;pointer-events:none;position:relative;clear:both;cursor:grab";
        _defaultCursor = _placeholderDiv.style.cursor === "grab" ? "grab" : "move";
        _isAndroid = nav && nav.userAgent.toLowerCase().indexOf("android") !== -1; //Android handles touch events in an odd way and it's virtually impossible to "feature test" so we resort to UA sniffing

        _isTouchDevice = "ontouchstart" in _docElement$2 && "orientation" in _win$4 || nav && (nav.MaxTouchPoints > 0 || nav.msMaxTouchPoints > 0);

        _addPaddingBR = function () {
          //this function is in charge of analyzing browser behavior related to padding. It sets the _addPaddingBR to true if the browser doesn't normally factor in the bottom or right padding on the element inside the scrolling area, and it sets _addPaddingLeft to true if it's a browser that requires the extra offset (offsetLeft) to be added to the paddingRight (like Opera).
          var div = _createElement$1("div"),
              child = _createElement$1("div"),
              childStyle = child.style,
              parent = _body$2,
              val;

          childStyle.display = "inline-block";
          childStyle.position = "relative";
          div.style.cssText = child.innerHTML = "width:90px;height:40px;padding:10px;overflow:auto;visibility:hidden";
          div.appendChild(child);
          parent.appendChild(div);
          val = child.offsetHeight + 18 > div.scrollHeight; //div.scrollHeight should be child.offsetHeight + 20 because of the 10px of padding on each side, but some browsers ignore one side. We allow a 2px margin of error.

          parent.removeChild(div);
          return val;
        }();

        _touchEventLookup = function (types) {
          //we create an object that makes it easy to translate touch event types into their "pointer" counterparts if we're in a browser that uses those instead. Like IE10 uses "MSPointerDown" instead of "touchstart", for example.
          var standard = types.split(","),
              converted = ("onpointerdown" in _tempDiv$2 ? "pointerdown,pointermove,pointerup,pointercancel" : "onmspointerdown" in _tempDiv$2 ? "MSPointerDown,MSPointerMove,MSPointerUp,MSPointerCancel" : types).split(","),
              obj = {},
              i = 4;

          while (--i > -1) {
            obj[standard[i]] = converted[i];
            obj[converted[i]] = standard[i];
          } //to avoid problems in iOS 9, test to see if the browser supports the "passive" option on addEventListener().


          try {
            _docElement$2.addEventListener("test", null, Object.defineProperty({}, "passive", {
              get: function get() {
                _supportsPassive = 1;
              }
            }));
          } catch (e) {}

          return obj;
        }("touchstart,touchmove,touchend,touchcancel");

        _addListener$1(_doc$4, "touchcancel", _emptyFunc$1); //some older Android devices intermittently stop dispatching "touchmove" events if we don't listen for "touchcancel" on the document. Very strange indeed.


        _addListener$1(_win$4, "touchmove", _emptyFunc$1); //works around Safari bugs that still allow the page to scroll even when we preventDefault() on the touchmove event.


        _body$2 && _body$2.addEventListener("touchstart", _emptyFunc$1); //works around Safari bug: https://greensock.com/forums/topic/21450-draggable-in-iframe-on-mobile-is-buggy/

        _addListener$1(_doc$4, "contextmenu", function () {
          for (var p in _lookup) {
            if (_lookup[p].isPressed) {
              _lookup[p].endDrag();
            }
          }
        });

        gsap$3 = _coreInitted$2 = _getGSAP$2();
      }

      if (gsap$3) {
        InertiaPlugin = gsap$3.plugins.inertia;
        _checkPrefix = gsap$3.utils.checkPrefix;
        _transformProp$3 = _checkPrefix(_transformProp$3);
        _transformOriginProp$2 = _checkPrefix(_transformOriginProp$2);
        _toArray$1 = gsap$3.utils.toArray;
        _supports3D$1 = !!_checkPrefix("perspective");
      } else if (required) {
        console.warn("Please gsap.registerPlugin(Draggable)");
      }
    };

    var EventDispatcher = /*#__PURE__*/function () {
      function EventDispatcher(target) {
        this._listeners = {};
        this.target = target || this;
      }

      var _proto = EventDispatcher.prototype;

      _proto.addEventListener = function addEventListener(type, callback) {
        var list = this._listeners[type] || (this._listeners[type] = []);

        if (!~list.indexOf(callback)) {
          list.push(callback);
        }
      };

      _proto.removeEventListener = function removeEventListener(type, callback) {
        var list = this._listeners[type],
            i = list && list.indexOf(callback) || -1;
        i > -1 && list.splice(i, 1);
      };

      _proto.dispatchEvent = function dispatchEvent(type) {
        var _this = this;

        var result;
        (this._listeners[type] || []).forEach(function (callback) {
          return callback.call(_this, {
            type: type,
            target: _this.target
          }) === false && (result = false);
        });
        return result; //if any of the callbacks return false, pass that along.
      };

      return EventDispatcher;
    }();

    var Draggable = /*#__PURE__*/function (_EventDispatcher) {
      _inheritsLoose$1(Draggable, _EventDispatcher);

      function Draggable(target, vars) {
        var _this2;

        _this2 = _EventDispatcher.call(this) || this;

        if (!gsap$3) {
          _initCore$1(1);
        }

        target = _toArray$1(target)[0]; //in case the target is a selector object or selector text

        if (!InertiaPlugin) {
          InertiaPlugin = gsap$3.plugins.inertia;
        }

        _this2.vars = vars = _copy(vars || {});
        _this2.target = target;
        _this2.x = _this2.y = _this2.rotation = 0;
        _this2.dragResistance = parseFloat(vars.dragResistance) || 0;
        _this2.edgeResistance = isNaN(vars.edgeResistance) ? 1 : parseFloat(vars.edgeResistance) || 0;
        _this2.lockAxis = vars.lockAxis;
        _this2.autoScroll = vars.autoScroll || 0;
        _this2.lockedAxis = null;
        _this2.allowEventDefault = !!vars.allowEventDefault;
        gsap$3.getProperty(target, "x"); // to ensure that transforms are instantiated.

        var type = (vars.type || "x,y").toLowerCase(),
            xyMode = ~type.indexOf("x") || ~type.indexOf("y"),
            rotationMode = type.indexOf("rotation") !== -1,
            xProp = rotationMode ? "rotation" : xyMode ? "x" : "left",
            yProp = xyMode ? "y" : "top",
            allowX = !!(~type.indexOf("x") || ~type.indexOf("left") || type === "scroll"),
            allowY = !!(~type.indexOf("y") || ~type.indexOf("top") || type === "scroll"),
            minimumMovement = vars.minimumMovement || 2,
            self = _assertThisInitialized$1(_this2),
            triggers = _toArray$1(vars.trigger || vars.handle || target),
            killProps = {},
            dragEndTime = 0,
            checkAutoScrollBounds = false,
            autoScrollMarginTop = vars.autoScrollMarginTop || 40,
            autoScrollMarginRight = vars.autoScrollMarginRight || 40,
            autoScrollMarginBottom = vars.autoScrollMarginBottom || 40,
            autoScrollMarginLeft = vars.autoScrollMarginLeft || 40,
            isClickable = vars.clickableTest || _isClickable,
            clickTime = 0,
            gsCache = target._gsap || gsap$3.core.getCache(target),
            isFixed = _isFixed$1(target),
            getPropAsNum = function getPropAsNum(property, unit) {
          return parseFloat(gsCache.get(target, property, unit));
        },
            ownerDoc = target.ownerDocument || _doc$4,
            enabled,
            scrollProxy,
            startPointerX,
            startPointerY,
            startElementX,
            startElementY,
            hasBounds,
            hasDragCallback,
            hasMoveCallback,
            maxX,
            minX,
            maxY,
            minY,
            touch,
            touchID,
            rotationOrigin,
            dirty,
            old,
            snapX,
            snapY,
            snapXY,
            isClicking,
            touchEventTarget,
            matrix,
            interrupted,
            allowNativeTouchScrolling,
            touchDragAxis,
            isDispatching,
            clickDispatch,
            trustedClickDispatch,
            isPreventingDefault,
            onContextMenu = function onContextMenu(e) {
          //used to prevent long-touch from triggering a context menu.
          // (self.isPressed && e.which < 2) && self.endDrag() // previously ended drag when context menu was triggered, but instead we should just stop propagation and prevent the default event behavior.
          _preventDefault(e);

          e.stopImmediatePropagation && e.stopImmediatePropagation();
          return false;
        },
            //this method gets called on every tick of TweenLite.ticker which allows us to synchronize the renders to the core engine (which is typically synchronized with the display refresh via requestAnimationFrame). This is an optimization - it's better than applying the values inside the "mousemove" or "touchmove" event handler which may get called many times inbetween refreshes.
        render = function render(suppressEvents) {
          if (self.autoScroll && self.isDragging && (checkAutoScrollBounds || dirty)) {
            var e = target,
                autoScrollFactor = self.autoScroll * 15,
                //multiplying by 15 just gives us a better "feel" speed-wise.
            parent,
                isRoot,
                rect,
                pointerX,
                pointerY,
                changeX,
                changeY,
                gap;
            checkAutoScrollBounds = false;
            _windowProxy.scrollTop = _win$4.pageYOffset != null ? _win$4.pageYOffset : ownerDoc.documentElement.scrollTop != null ? ownerDoc.documentElement.scrollTop : ownerDoc.body.scrollTop;
            _windowProxy.scrollLeft = _win$4.pageXOffset != null ? _win$4.pageXOffset : ownerDoc.documentElement.scrollLeft != null ? ownerDoc.documentElement.scrollLeft : ownerDoc.body.scrollLeft;
            pointerX = self.pointerX - _windowProxy.scrollLeft;
            pointerY = self.pointerY - _windowProxy.scrollTop;

            while (e && !isRoot) {
              //walk up the chain and sense wherever the pointer is within 40px of an edge that's scrollable.
              isRoot = _isRoot(e.parentNode);
              parent = isRoot ? _windowProxy : e.parentNode;
              rect = isRoot ? {
                bottom: Math.max(_docElement$2.clientHeight, _win$4.innerHeight || 0),
                right: Math.max(_docElement$2.clientWidth, _win$4.innerWidth || 0),
                left: 0,
                top: 0
              } : parent.getBoundingClientRect();
              changeX = changeY = 0;

              if (allowY) {
                gap = parent._gsMaxScrollY - parent.scrollTop;

                if (gap < 0) {
                  changeY = gap;
                } else if (pointerY > rect.bottom - autoScrollMarginBottom && gap) {
                  checkAutoScrollBounds = true;
                  changeY = Math.min(gap, autoScrollFactor * (1 - Math.max(0, rect.bottom - pointerY) / autoScrollMarginBottom) | 0);
                } else if (pointerY < rect.top + autoScrollMarginTop && parent.scrollTop) {
                  checkAutoScrollBounds = true;
                  changeY = -Math.min(parent.scrollTop, autoScrollFactor * (1 - Math.max(0, pointerY - rect.top) / autoScrollMarginTop) | 0);
                }

                if (changeY) {
                  parent.scrollTop += changeY;
                }
              }

              if (allowX) {
                gap = parent._gsMaxScrollX - parent.scrollLeft;

                if (gap < 0) {
                  changeX = gap;
                } else if (pointerX > rect.right - autoScrollMarginRight && gap) {
                  checkAutoScrollBounds = true;
                  changeX = Math.min(gap, autoScrollFactor * (1 - Math.max(0, rect.right - pointerX) / autoScrollMarginRight) | 0);
                } else if (pointerX < rect.left + autoScrollMarginLeft && parent.scrollLeft) {
                  checkAutoScrollBounds = true;
                  changeX = -Math.min(parent.scrollLeft, autoScrollFactor * (1 - Math.max(0, pointerX - rect.left) / autoScrollMarginLeft) | 0);
                }

                if (changeX) {
                  parent.scrollLeft += changeX;
                }
              }

              if (isRoot && (changeX || changeY)) {
                _win$4.scrollTo(parent.scrollLeft, parent.scrollTop);

                setPointerPosition(self.pointerX + changeX, self.pointerY + changeY);
              }

              e = parent;
            }
          }

          if (dirty) {
            var x = self.x,
                y = self.y;

            if (rotationMode) {
              self.deltaX = x - parseFloat(gsCache.rotation);
              self.rotation = x;
              gsCache.rotation = x + "deg";
              gsCache.renderTransform(1, gsCache);
            } else {
              if (scrollProxy) {
                if (allowY) {
                  self.deltaY = y - scrollProxy.top();
                  scrollProxy.top(y);
                }

                if (allowX) {
                  self.deltaX = x - scrollProxy.left();
                  scrollProxy.left(x);
                }
              } else if (xyMode) {
                if (allowY) {
                  self.deltaY = y - parseFloat(gsCache.y);
                  gsCache.y = y + "px";
                }

                if (allowX) {
                  self.deltaX = x - parseFloat(gsCache.x);
                  gsCache.x = x + "px";
                }

                gsCache.renderTransform(1, gsCache);
              } else {
                if (allowY) {
                  self.deltaY = y - parseFloat(target.style.top || 0);
                  target.style.top = y + "px";
                }

                if (allowX) {
                  self.deltaY = x - parseFloat(target.style.left || 0);
                  target.style.left = x + "px";
                }
              }
            }

            if (hasDragCallback && !suppressEvents && !isDispatching) {
              isDispatching = true; //in case onDrag has an update() call (avoid endless loop)

              if (_dispatchEvent(self, "drag", "onDrag") === false) {
                if (allowX) {
                  self.x -= self.deltaX;
                }

                if (allowY) {
                  self.y -= self.deltaY;
                }

                render(true);
              }

              isDispatching = false;
            }
          }

          dirty = false;
        },
            //copies the x/y from the element (whether that be transforms, top/left, or ScrollProxy's top/left) to the Draggable's x and y (and rotation if necessary) properties so that they reflect reality and it also (optionally) applies any snapping necessary. This is used by the InertiaPlugin tween in an onUpdate to ensure things are synced and snapped.
        syncXY = function syncXY(skipOnUpdate, skipSnap) {
          var x = self.x,
              y = self.y,
              snappedValue,
              cs;

          if (!target._gsap) {
            //just in case the _gsap cache got wiped, like if the user called clearProps on the transform or something (very rare).
            gsCache = gsap$3.core.getCache(target);
          }

          if (xyMode) {
            self.x = parseFloat(gsCache.x);
            self.y = parseFloat(gsCache.y);
          } else if (rotationMode) {
            self.x = self.rotation = parseFloat(gsCache.rotation);
          } else if (scrollProxy) {
            self.y = scrollProxy.top();
            self.x = scrollProxy.left();
          } else {
            self.y = parseInt(target.style.top || (cs = _getComputedStyle$1(target)) && cs.top, 10) || 0;
            self.x = parseInt(target.style.left || (cs || {}).left, 10) || 0;
          }

          if ((snapX || snapY || snapXY) && !skipSnap && (self.isDragging || self.isThrowing)) {
            if (snapXY) {
              _temp1.x = self.x;
              _temp1.y = self.y;
              snappedValue = snapXY(_temp1);

              if (snappedValue.x !== self.x) {
                self.x = snappedValue.x;
                dirty = true;
              }

              if (snappedValue.y !== self.y) {
                self.y = snappedValue.y;
                dirty = true;
              }
            }

            if (snapX) {
              snappedValue = snapX(self.x);

              if (snappedValue !== self.x) {
                self.x = snappedValue;

                if (rotationMode) {
                  self.rotation = snappedValue;
                }

                dirty = true;
              }
            }

            if (snapY) {
              snappedValue = snapY(self.y);

              if (snappedValue !== self.y) {
                self.y = snappedValue;
              }

              dirty = true;
            }
          }

          if (dirty) {
            render(true);
          }

          if (!skipOnUpdate) {
            self.deltaX = self.x - x;
            self.deltaY = self.y - y;

            _dispatchEvent(self, "throwupdate", "onThrowUpdate");
          }
        },
            buildSnapFunc = function buildSnapFunc(snap, min, max, factor) {
          if (min == null) {
            min = -_bigNum$2;
          }

          if (max == null) {
            max = _bigNum$2;
          }

          if (_isFunction$2(snap)) {
            return function (n) {
              var edgeTolerance = !self.isPressed ? 1 : 1 - self.edgeResistance; //if we're tweening, disable the edgeTolerance because it's already factored into the tweening values (we don't want to apply it multiple times)

              return snap.call(self, n > max ? max + (n - max) * edgeTolerance : n < min ? min + (n - min) * edgeTolerance : n) * factor;
            };
          }

          if (_isArray$1(snap)) {
            return function (n) {
              var i = snap.length,
                  closest = 0,
                  absDif = _bigNum$2,
                  val,
                  dif;

              while (--i > -1) {
                val = snap[i];
                dif = val - n;

                if (dif < 0) {
                  dif = -dif;
                }

                if (dif < absDif && val >= min && val <= max) {
                  closest = i;
                  absDif = dif;
                }
              }

              return snap[closest];
            };
          }

          return isNaN(snap) ? function (n) {
            return n;
          } : function () {
            return snap * factor;
          };
        },
            buildPointSnapFunc = function buildPointSnapFunc(snap, minX, maxX, minY, maxY, radius, factor) {
          radius = radius && radius < _bigNum$2 ? radius * radius : _bigNum$2; //so we don't have to Math.sqrt() in the functions. Performance optimization.

          if (_isFunction$2(snap)) {
            return function (point) {
              var edgeTolerance = !self.isPressed ? 1 : 1 - self.edgeResistance,
                  x = point.x,
                  y = point.y,
                  result,
                  dx,
                  dy; //if we're tweening, disable the edgeTolerance because it's already factored into the tweening values (we don't want to apply it multiple times)

              point.x = x = x > maxX ? maxX + (x - maxX) * edgeTolerance : x < minX ? minX + (x - minX) * edgeTolerance : x;
              point.y = y = y > maxY ? maxY + (y - maxY) * edgeTolerance : y < minY ? minY + (y - minY) * edgeTolerance : y;
              result = snap.call(self, point);

              if (result !== point) {
                point.x = result.x;
                point.y = result.y;
              }

              if (factor !== 1) {
                point.x *= factor;
                point.y *= factor;
              }

              if (radius < _bigNum$2) {
                dx = point.x - x;
                dy = point.y - y;

                if (dx * dx + dy * dy > radius) {
                  point.x = x;
                  point.y = y;
                }
              }

              return point;
            };
          }

          if (_isArray$1(snap)) {
            return function (p) {
              var i = snap.length,
                  closest = 0,
                  minDist = _bigNum$2,
                  x,
                  y,
                  point,
                  dist;

              while (--i > -1) {
                point = snap[i];
                x = point.x - p.x;
                y = point.y - p.y;
                dist = x * x + y * y;

                if (dist < minDist) {
                  closest = i;
                  minDist = dist;
                }
              }

              return minDist <= radius ? snap[closest] : p;
            };
          }

          return function (n) {
            return n;
          };
        },
            calculateBounds = function calculateBounds() {
          var bounds, targetBounds, snap, snapIsRaw;
          hasBounds = false;

          if (scrollProxy) {
            scrollProxy.calibrate();
            self.minX = minX = -scrollProxy.maxScrollLeft();
            self.minY = minY = -scrollProxy.maxScrollTop();
            self.maxX = maxX = self.maxY = maxY = 0;
            hasBounds = true;
          } else if (!!vars.bounds) {
            bounds = _getBounds$1(vars.bounds, target.parentNode); //could be a selector/jQuery object or a DOM element or a generic object like {top:0, left:100, width:1000, height:800} or {minX:100, maxX:1100, minY:0, maxY:800}

            if (rotationMode) {
              self.minX = minX = bounds.left;
              self.maxX = maxX = bounds.left + bounds.width;
              self.minY = minY = self.maxY = maxY = 0;
            } else if (!_isUndefined$1(vars.bounds.maxX) || !_isUndefined$1(vars.bounds.maxY)) {
              bounds = vars.bounds;
              self.minX = minX = bounds.minX;
              self.minY = minY = bounds.minY;
              self.maxX = maxX = bounds.maxX;
              self.maxY = maxY = bounds.maxY;
            } else {
              targetBounds = _getBounds$1(target, target.parentNode);
              self.minX = minX = Math.round(getPropAsNum(xProp, "px") + bounds.left - targetBounds.left - 0.5);
              self.minY = minY = Math.round(getPropAsNum(yProp, "px") + bounds.top - targetBounds.top - 0.5);
              self.maxX = maxX = Math.round(minX + (bounds.width - targetBounds.width));
              self.maxY = maxY = Math.round(minY + (bounds.height - targetBounds.height));
            }

            if (minX > maxX) {
              self.minX = maxX;
              self.maxX = maxX = minX;
              minX = self.minX;
            }

            if (minY > maxY) {
              self.minY = maxY;
              self.maxY = maxY = minY;
              minY = self.minY;
            }

            if (rotationMode) {
              self.minRotation = minX;
              self.maxRotation = maxX;
            }

            hasBounds = true;
          }

          if (vars.liveSnap) {
            snap = vars.liveSnap === true ? vars.snap || {} : vars.liveSnap;
            snapIsRaw = _isArray$1(snap) || _isFunction$2(snap);

            if (rotationMode) {
              snapX = buildSnapFunc(snapIsRaw ? snap : snap.rotation, minX, maxX, 1);
              snapY = null;
            } else {
              if (snap.points) {
                snapXY = buildPointSnapFunc(snapIsRaw ? snap : snap.points, minX, maxX, minY, maxY, snap.radius, scrollProxy ? -1 : 1);
              } else {
                if (allowX) {
                  snapX = buildSnapFunc(snapIsRaw ? snap : snap.x || snap.left || snap.scrollLeft, minX, maxX, scrollProxy ? -1 : 1);
                }

                if (allowY) {
                  snapY = buildSnapFunc(snapIsRaw ? snap : snap.y || snap.top || snap.scrollTop, minY, maxY, scrollProxy ? -1 : 1);
                }
              }
            }
          }
        },
            onThrowComplete = function onThrowComplete() {
          self.isThrowing = false;

          _dispatchEvent(self, "throwcomplete", "onThrowComplete");
        },
            onThrowInterrupt = function onThrowInterrupt() {
          self.isThrowing = false;
        },
            animate = function animate(inertia, forceZeroVelocity) {
          var snap, snapIsRaw, tween, overshootTolerance;

          if (inertia && InertiaPlugin) {
            if (inertia === true) {
              snap = vars.snap || vars.liveSnap || {};
              snapIsRaw = _isArray$1(snap) || _isFunction$2(snap);
              inertia = {
                resistance: (vars.throwResistance || vars.resistance || 1000) / (rotationMode ? 10 : 1)
              };

              if (rotationMode) {
                inertia.rotation = _parseInertia(self, snapIsRaw ? snap : snap.rotation, maxX, minX, 1, forceZeroVelocity);
              } else {
                if (allowX) {
                  inertia[xProp] = _parseInertia(self, snapIsRaw ? snap : snap.points || snap.x || snap.left, maxX, minX, scrollProxy ? -1 : 1, forceZeroVelocity || self.lockedAxis === "x");
                }

                if (allowY) {
                  inertia[yProp] = _parseInertia(self, snapIsRaw ? snap : snap.points || snap.y || snap.top, maxY, minY, scrollProxy ? -1 : 1, forceZeroVelocity || self.lockedAxis === "y");
                }

                if (snap.points || _isArray$1(snap) && _isObject$2(snap[0])) {
                  inertia.linkedProps = xProp + "," + yProp;
                  inertia.radius = snap.radius; //note: we also disable liveSnapping while throwing if there's a "radius" defined, otherwise it looks weird to have the item thrown past a snapping point but live-snapping mid-tween. We do this by altering the onUpdateParams so that "skipSnap" parameter is true for syncXY.
                }
              }
            }

            self.isThrowing = true;
            overshootTolerance = !isNaN(vars.overshootTolerance) ? vars.overshootTolerance : vars.edgeResistance === 1 ? 0 : 1 - self.edgeResistance + 0.2;

            if (!inertia.duration) {
              inertia.duration = {
                max: Math.max(vars.minDuration || 0, "maxDuration" in vars ? vars.maxDuration : 2),
                min: !isNaN(vars.minDuration) ? vars.minDuration : overshootTolerance === 0 || _isObject$2(inertia) && inertia.resistance > 1000 ? 0 : 0.5,
                overshoot: overshootTolerance
              };
            }

            self.tween = tween = gsap$3.to(scrollProxy || target, {
              inertia: inertia,
              data: "_draggable",
              onComplete: onThrowComplete,
              onInterrupt: onThrowInterrupt,
              onUpdate: vars.fastMode ? _dispatchEvent : syncXY,
              onUpdateParams: vars.fastMode ? [self, "onthrowupdate", "onThrowUpdate"] : snap && snap.radius ? [false, true] : []
            });

            if (!vars.fastMode) {
              if (scrollProxy) {
                scrollProxy._skip = true; // Microsoft browsers have a bug that causes them to briefly render the position incorrectly (it flashes to the end state when we seek() the tween even though we jump right back to the current position, and this only seems to happen when we're affecting both top and left), so we set a _suspendTransforms flag to prevent it from actually applying the values in the ScrollProxy.
              }

              tween.render(1e9, true, true); // force to the end. Remember, the duration will likely change upon initting because that's when InertiaPlugin calculates it.

              syncXY(true, true);
              self.endX = self.x;
              self.endY = self.y;

              if (rotationMode) {
                self.endRotation = self.x;
              }

              tween.play(0);
              syncXY(true, true);

              if (scrollProxy) {
                scrollProxy._skip = false; //Microsoft browsers have a bug that causes them to briefly render the position incorrectly (it flashes to the end state when we seek() the tween even though we jump right back to the current position, and this only seems to happen when we're affecting both top and left), so we set a _suspendTransforms flag to prevent it from actually applying the values in the ScrollProxy.
              }
            }
          } else if (hasBounds) {
            self.applyBounds();
          }
        },
            updateMatrix = function updateMatrix(shiftStart) {
          var start = matrix,
              p;
          matrix = getGlobalMatrix(target.parentNode, true);

          if (shiftStart && self.isPressed && !matrix.equals(start || new Matrix2D())) {
            //if the matrix changes WHILE the element is pressed, we must adjust the startPointerX and startPointerY accordingly, so we invert the original matrix and figure out where the pointerX and pointerY were in the global space, then apply the new matrix to get the updated coordinates.
            p = start.inverse().apply({
              x: startPointerX,
              y: startPointerY
            });
            matrix.apply(p, p);
            startPointerX = p.x;
            startPointerY = p.y;
          }

          if (matrix.equals(_identityMatrix$1)) {
            //if there are no transforms, we can optimize performance by not factoring in the matrix
            matrix = null;
          }
        },
            recordStartPositions = function recordStartPositions() {
          var edgeTolerance = 1 - self.edgeResistance,
              offsetX = isFixed ? _getDocScrollLeft$1(ownerDoc) : 0,
              offsetY = isFixed ? _getDocScrollTop$1(ownerDoc) : 0,
              parsedOrigin,
              x,
              y;
          updateMatrix(false);

          if (matrix) {
            _point1.x = self.pointerX - offsetX;
            _point1.y = self.pointerY - offsetY;
            matrix.apply(_point1, _point1);
            startPointerX = _point1.x; //translate to local coordinate system

            startPointerY = _point1.y;
          }

          if (dirty) {
            setPointerPosition(self.pointerX, self.pointerY);
            render(true);
          }

          if (scrollProxy) {
            calculateBounds();
            startElementY = scrollProxy.top();
            startElementX = scrollProxy.left();
          } else {
            //if the element is in the process of tweening, don't force snapping to occur because it could make it jump. Imagine the user throwing, then before it's done, clicking on the element in its inbetween state.
            if (isTweening()) {
              syncXY(true, true);
              calculateBounds();
            } else {
              self.applyBounds();
            }

            if (rotationMode) {
              parsedOrigin = target.ownerSVGElement ? [gsCache.xOrigin - target.getBBox().x, gsCache.yOrigin - target.getBBox().y] : (_getComputedStyle$1(target)[_transformOriginProp$2] || "0 0").split(" ");
              rotationOrigin = self.rotationOrigin = getGlobalMatrix(target).apply({
                x: parseFloat(parsedOrigin[0]) || 0,
                y: parseFloat(parsedOrigin[1]) || 0
              });
              syncXY(true, true);
              x = self.pointerX - rotationOrigin.x - offsetX;
              y = rotationOrigin.y - self.pointerY + offsetY;
              startElementX = self.x; //starting rotation (x always refers to rotation in type:"rotation", measured in degrees)

              startElementY = self.y = Math.atan2(y, x) * _RAD2DEG$1;
            } else {
              //parent = !isFixed && target.parentNode;
              //startScrollTop = parent ? parent.scrollTop || 0 : 0;
              //startScrollLeft = parent ? parent.scrollLeft || 0 : 0;
              startElementY = getPropAsNum(yProp, "px"); //record the starting top and left values so that we can just add the mouse's movement to them later.

              startElementX = getPropAsNum(xProp, "px");
            }
          }

          if (hasBounds && edgeTolerance) {
            if (startElementX > maxX) {
              startElementX = maxX + (startElementX - maxX) / edgeTolerance;
            } else if (startElementX < minX) {
              startElementX = minX - (minX - startElementX) / edgeTolerance;
            }

            if (!rotationMode) {
              if (startElementY > maxY) {
                startElementY = maxY + (startElementY - maxY) / edgeTolerance;
              } else if (startElementY < minY) {
                startElementY = minY - (minY - startElementY) / edgeTolerance;
              }
            }
          }

          self.startX = startElementX;
          self.startY = startElementY;
        },
            isTweening = function isTweening() {
          return self.tween && self.tween.isActive();
        },
            removePlaceholder = function removePlaceholder() {
          if (_placeholderDiv.parentNode && !isTweening() && !self.isDragging) {
            //_placeholderDiv just props open auto-scrolling containers so they don't collapse as the user drags left/up. We remove it after dragging (and throwing, if necessary) finishes.
            _placeholderDiv.parentNode.removeChild(_placeholderDiv);
          }
        },
            //called when the mouse is pressed (or touch starts)
        onPress = function onPress(e, force) {
          var i;

          if (!enabled || self.isPressed || !e || (e.type === "mousedown" || e.type === "pointerdown") && !force && _getTime$1() - clickTime < 30 && _touchEventLookup[self.pointerEvent.type]) {
            //when we DON'T preventDefault() in order to accommodate touch-scrolling and the user just taps, many browsers also fire a mousedown/mouseup sequence AFTER the touchstart/touchend sequence, thus it'd result in two quick "click" events being dispatched. This line senses that condition and halts it on the subsequent mousedown.
            isPreventingDefault && e && enabled && _preventDefault(e); // in some browsers, we must listen for multiple event types like touchstart, pointerdown, mousedown. The first time this function is called, we record whether or not we _preventDefault() so that on duplicate calls, we can do the same if necessary.

            return;
          }

          interrupted = isTweening();
          self.pointerEvent = e;

          if (_touchEventLookup[e.type]) {
            //note: on iOS, BOTH touchmove and mousemove are dispatched, but the mousemove has pageY and pageX of 0 which would mess up the calculations and needlessly hurt performance.
            touchEventTarget = ~e.type.indexOf("touch") ? e.currentTarget || e.target : ownerDoc; //pointer-based touches (for Microsoft browsers) don't remain locked to the original target like other browsers, so we must use the document instead. The event type would be "MSPointerDown" or "pointerdown".

            _addListener$1(touchEventTarget, "touchend", onRelease);

            _addListener$1(touchEventTarget, "touchmove", onMove);

            _addListener$1(touchEventTarget, "touchcancel", onRelease);

            _addListener$1(ownerDoc, "touchstart", _onMultiTouchDocument);
          } else {
            touchEventTarget = null;

            _addListener$1(ownerDoc, "mousemove", onMove); //attach these to the document instead of the box itself so that if the user's mouse moves too quickly (and off of the box), things still work.

          }

          touchDragAxis = null;

          if (!_supportsPointer || !touchEventTarget) {
            _addListener$1(ownerDoc, "mouseup", onRelease);

            if (e && e.target) {
              _addListener$1(e.target, "mouseup", onRelease); //we also have to listen directly on the element because some browsers don't bubble up the event to the _doc on elements with contentEditable="true"

            }
          }

          isClicking = isClickable.call(self, e.target) && vars.dragClickables === false && !force;

          if (isClicking) {
            _addListener$1(e.target, "change", onRelease); //in some browsers, when you mousedown on a <select> element, no mouseup gets dispatched! So we listen for a "change" event instead.


            _dispatchEvent(self, "pressInit", "onPressInit");

            _dispatchEvent(self, "press", "onPress");

            _setSelectable(triggers, true); //accommodates things like inputs and elements with contentEditable="true" (otherwise user couldn't drag to select text)


            return;
          }

          allowNativeTouchScrolling = !touchEventTarget || allowX === allowY || self.vars.allowNativeTouchScrolling === false || self.vars.allowContextMenu && e && (e.ctrlKey || e.which > 2) ? false : allowX ? "y" : "x"; //note: in Chrome, right-clicking (for a context menu) fires onPress and it doesn't have the event.which set properly, so we must look for event.ctrlKey. If the user wants to allow context menus we should of course sense it here and not allow native touch scrolling.

          isPreventingDefault = !allowNativeTouchScrolling && !self.allowEventDefault;

          if (isPreventingDefault) {
            _preventDefault(e);

            _addListener$1(_win$4, "touchforcechange", _preventDefault); //works around safari bug: https://greensock.com/forums/topic/21450-draggable-in-iframe-on-mobile-is-buggy/

          }

          if (e.changedTouches) {
            //touch events store the data slightly differently
            e = touch = e.changedTouches[0];
            touchID = e.identifier;
          } else if (e.pointerId) {
            touchID = e.pointerId; //for some Microsoft browsers
          } else {
            touch = touchID = null;
          }

          _dragCount++;

          _addToRenderQueue(render); //causes the Draggable to render on each "tick" of TweenLite.ticker (performance optimization - updating values in a mousemove can cause them to happen too frequently, like multiple times between frame redraws which is wasteful, and it also prevents values from updating properly in IE8)


          startPointerY = self.pointerY = e.pageY; //record the starting x and y so that we can calculate the movement from the original in _onMouseMove

          startPointerX = self.pointerX = e.pageX;

          _dispatchEvent(self, "pressInit", "onPressInit");

          if (allowNativeTouchScrolling || self.autoScroll) {
            _recordMaxScrolls(target.parentNode);
          }

          if (target.parentNode && self.autoScroll && !scrollProxy && !rotationMode && target.parentNode._gsMaxScrollX && !_placeholderDiv.parentNode && !target.getBBox) {
            //add a placeholder div to prevent the parent container from collapsing when the user drags the element left.
            _placeholderDiv.style.width = target.parentNode.scrollWidth + "px";
            target.parentNode.appendChild(_placeholderDiv);
          }

          recordStartPositions();
          self.tween && self.tween.kill();
          self.isThrowing = false;
          gsap$3.killTweensOf(scrollProxy || target, killProps, true); //in case the user tries to drag it before the last tween is done.

          scrollProxy && gsap$3.killTweensOf(target, {
            scrollTo: 1
          }, true); //just in case the original target's scroll position is being tweened somewhere else.

          self.tween = self.lockedAxis = null;

          if (vars.zIndexBoost || !rotationMode && !scrollProxy && vars.zIndexBoost !== false) {
            target.style.zIndex = Draggable.zIndex++;
          }

          self.isPressed = true;
          hasDragCallback = !!(vars.onDrag || self._listeners.drag);
          hasMoveCallback = !!(vars.onMove || self._listeners.move);

          if (!rotationMode && (vars.cursor !== false || vars.activeCursor)) {
            i = triggers.length;

            while (--i > -1) {
              //_setStyle(triggers[i], "cursor", vars.activeCursor || vars.cursor || (_defaultCursor === "grab" ? "grabbing" : _defaultCursor));
              gsap$3.set(triggers[i], {
                cursor: vars.activeCursor || vars.cursor || (_defaultCursor === "grab" ? "grabbing" : _defaultCursor)
              });
            }
          }

          _dispatchEvent(self, "press", "onPress");
        },
            //called every time the mouse/touch moves
        onMove = function onMove(e) {
          var originalEvent = e,
              touches,
              pointerX,
              pointerY,
              i,
              dx,
              dy;

          if (!enabled || _isMultiTouching || !self.isPressed || !e) {
            isPreventingDefault && e && enabled && _preventDefault(e); // in some browsers, we must listen for multiple event types like touchmove, pointermove, mousemove. The first time this function is called, we record whether or not we _preventDefault() so that on duplicate calls, we can do the same if necessary.

            return;
          }

          self.pointerEvent = e;
          touches = e.changedTouches;

          if (touches) {
            //touch events store the data slightly differently
            e = touches[0];

            if (e !== touch && e.identifier !== touchID) {
              //Usually changedTouches[0] will be what we're looking for, but in case it's not, look through the rest of the array...(and Android browsers don't reuse the event like iOS)
              i = touches.length;

              while (--i > -1 && (e = touches[i]).identifier !== touchID) {}

              if (i < 0) {
                return;
              }
            }
          } else if (e.pointerId && touchID && e.pointerId !== touchID) {
            //for some Microsoft browsers, we must attach the listener to the doc rather than the trigger so that when the finger moves outside the bounds of the trigger, things still work. So if the event we're receiving has a pointerId that doesn't match the touchID, ignore it (for multi-touch)
            return;
          }

          if (touchEventTarget && allowNativeTouchScrolling && !touchDragAxis) {
            //Android browsers force us to decide on the first "touchmove" event if we should allow the default (scrolling) behavior or preventDefault(). Otherwise, a "touchcancel" will be fired and then no "touchmove" or "touchend" will fire during the scrolling (no good).
            _point1.x = e.pageX;
            _point1.y = e.pageY;
            matrix && matrix.apply(_point1, _point1);
            pointerX = _point1.x;
            pointerY = _point1.y;
            dx = Math.abs(pointerX - startPointerX);
            dy = Math.abs(pointerY - startPointerY);

            if (dx !== dy && (dx > minimumMovement || dy > minimumMovement) || _isAndroid && allowNativeTouchScrolling === touchDragAxis) {
              touchDragAxis = dx > dy && allowX ? "x" : "y";

              if (allowNativeTouchScrolling && touchDragAxis !== allowNativeTouchScrolling) {
                _addListener$1(_win$4, "touchforcechange", _preventDefault); // prevents native touch scrolling from taking over if the user started dragging in the other direction in iOS Safari

              }

              if (self.vars.lockAxisOnTouchScroll !== false && allowX && allowY) {
                self.lockedAxis = touchDragAxis === "x" ? "y" : "x";
                _isFunction$2(self.vars.onLockAxis) && self.vars.onLockAxis.call(self, originalEvent);
              }

              if (_isAndroid && allowNativeTouchScrolling === touchDragAxis) {
                onRelease(originalEvent);
                return;
              }
            }
          }

          if (!self.allowEventDefault && (!allowNativeTouchScrolling || touchDragAxis && allowNativeTouchScrolling !== touchDragAxis) && originalEvent.cancelable !== false) {
            _preventDefault(originalEvent);

            isPreventingDefault = true;
          } else if (isPreventingDefault) {
            isPreventingDefault = false;
          }

          if (self.autoScroll) {
            checkAutoScrollBounds = true;
          }

          setPointerPosition(e.pageX, e.pageY, hasMoveCallback);
        },
            setPointerPosition = function setPointerPosition(pointerX, pointerY, invokeOnMove) {
          var dragTolerance = 1 - self.dragResistance,
              edgeTolerance = 1 - self.edgeResistance,
              prevPointerX = self.pointerX,
              prevPointerY = self.pointerY,
              prevStartElementY = startElementY,
              prevX = self.x,
              prevY = self.y,
              prevEndX = self.endX,
              prevEndY = self.endY,
              prevEndRotation = self.endRotation,
              prevDirty = dirty,
              xChange,
              yChange,
              x,
              y,
              dif,
              temp;
          self.pointerX = pointerX;
          self.pointerY = pointerY;

          if (isFixed) {
            pointerX -= _getDocScrollLeft$1(ownerDoc);
            pointerY -= _getDocScrollTop$1(ownerDoc);
          }

          if (rotationMode) {
            y = Math.atan2(rotationOrigin.y - pointerY, pointerX - rotationOrigin.x) * _RAD2DEG$1;
            dif = self.y - y;

            if (dif > 180) {
              startElementY -= 360;
              self.y = y;
            } else if (dif < -180) {
              startElementY += 360;
              self.y = y;
            }

            if (self.x !== startElementX || Math.abs(startElementY - y) > minimumMovement) {
              self.y = y;
              x = startElementX + (startElementY - y) * dragTolerance;
            } else {
              x = startElementX;
            }
          } else {
            if (matrix) {
              temp = pointerX * matrix.a + pointerY * matrix.c + matrix.e;
              pointerY = pointerX * matrix.b + pointerY * matrix.d + matrix.f;
              pointerX = temp;
            }

            yChange = pointerY - startPointerY;
            xChange = pointerX - startPointerX;

            if (yChange < minimumMovement && yChange > -minimumMovement) {
              yChange = 0;
            }

            if (xChange < minimumMovement && xChange > -minimumMovement) {
              xChange = 0;
            }

            if ((self.lockAxis || self.lockedAxis) && (xChange || yChange)) {
              temp = self.lockedAxis;

              if (!temp) {
                self.lockedAxis = temp = allowX && Math.abs(xChange) > Math.abs(yChange) ? "y" : allowY ? "x" : null;

                if (temp && _isFunction$2(self.vars.onLockAxis)) {
                  self.vars.onLockAxis.call(self, self.pointerEvent);
                }
              }

              if (temp === "y") {
                yChange = 0;
              } else if (temp === "x") {
                xChange = 0;
              }
            }

            x = _round$1(startElementX + xChange * dragTolerance);
            y = _round$1(startElementY + yChange * dragTolerance);
          }

          if ((snapX || snapY || snapXY) && (self.x !== x || self.y !== y && !rotationMode)) {
            if (snapXY) {
              _temp1.x = x;
              _temp1.y = y;
              temp = snapXY(_temp1);
              x = _round$1(temp.x);
              y = _round$1(temp.y);
            }

            if (snapX) {
              x = _round$1(snapX(x));
            }

            if (snapY) {
              y = _round$1(snapY(y));
            }
          } else if (hasBounds) {
            if (x > maxX) {
              x = maxX + Math.round((x - maxX) * edgeTolerance);
            } else if (x < minX) {
              x = minX + Math.round((x - minX) * edgeTolerance);
            }

            if (!rotationMode) {
              if (y > maxY) {
                y = Math.round(maxY + (y - maxY) * edgeTolerance);
              } else if (y < minY) {
                y = Math.round(minY + (y - minY) * edgeTolerance);
              }
            }
          }

          if (self.x !== x || self.y !== y && !rotationMode) {
            if (rotationMode) {
              self.endRotation = self.x = self.endX = x;
              dirty = true;
            } else {
              if (allowY) {
                self.y = self.endY = y;
                dirty = true; //a flag that indicates we need to render the target next time the TweenLite.ticker dispatches a "tick" event (typically on a requestAnimationFrame) - this is a performance optimization (we shouldn't render on every move because sometimes many move events can get dispatched between screen refreshes, and that'd be wasteful to render every time)
              }

              if (allowX) {
                self.x = self.endX = x;
                dirty = true;
              }
            }

            if (!invokeOnMove || _dispatchEvent(self, "move", "onMove") !== false) {
              if (!self.isDragging && self.isPressed) {
                self.isDragging = true;

                _dispatchEvent(self, "dragstart", "onDragStart");
              }
            } else {
              //revert because the onMove returned false!
              self.pointerX = prevPointerX;
              self.pointerY = prevPointerY;
              startElementY = prevStartElementY;
              self.x = prevX;
              self.y = prevY;
              self.endX = prevEndX;
              self.endY = prevEndY;
              self.endRotation = prevEndRotation;
              dirty = prevDirty;
            }
          }
        },
            //called when the mouse/touch is released
        onRelease = function onRelease(e, force) {
          if (!enabled || !self.isPressed || e && touchID != null && !force && (e.pointerId && e.pointerId !== touchID || e.changedTouches && !_hasTouchID(e.changedTouches, touchID))) {
            //for some Microsoft browsers, we must attach the listener to the doc rather than the trigger so that when the finger moves outside the bounds of the trigger, things still work. So if the event we're receiving has a pointerId that doesn't match the touchID, ignore it (for multi-touch)
            isPreventingDefault && e && enabled && _preventDefault(e); // in some browsers, we must listen for multiple event types like touchend, pointerup, mouseup. The first time this function is called, we record whether or not we _preventDefault() so that on duplicate calls, we can do the same if necessary.

            return;
          }

          self.isPressed = false;
          var originalEvent = e,
              wasDragging = self.isDragging,
              isContextMenuRelease = self.vars.allowContextMenu && e && (e.ctrlKey || e.which > 2),
              placeholderDelayedCall = gsap$3.delayedCall(0.001, removePlaceholder),
              touches,
              i,
              syntheticEvent,
              eventTarget,
              syntheticClick;

          if (touchEventTarget) {
            _removeListener$1(touchEventTarget, "touchend", onRelease);

            _removeListener$1(touchEventTarget, "touchmove", onMove);

            _removeListener$1(touchEventTarget, "touchcancel", onRelease);

            _removeListener$1(ownerDoc, "touchstart", _onMultiTouchDocument);
          } else {
            _removeListener$1(ownerDoc, "mousemove", onMove);
          }

          _removeListener$1(_win$4, "touchforcechange", _preventDefault);

          if (!_supportsPointer || !touchEventTarget) {
            _removeListener$1(ownerDoc, "mouseup", onRelease);

            if (e && e.target) {
              _removeListener$1(e.target, "mouseup", onRelease);
            }
          }

          dirty = false;

          if (isClicking && !isContextMenuRelease) {
            if (e) {
              _removeListener$1(e.target, "change", onRelease);

              self.pointerEvent = originalEvent;
            }

            _setSelectable(triggers, false);

            _dispatchEvent(self, "release", "onRelease");

            _dispatchEvent(self, "click", "onClick");

            isClicking = false;
            return;
          }

          _removeFromRenderQueue(render);

          if (!rotationMode) {
            i = triggers.length;

            while (--i > -1) {
              _setStyle(triggers[i], "cursor", vars.cursor || (vars.cursor !== false ? _defaultCursor : null));
            }
          }

          if (wasDragging) {
            dragEndTime = _lastDragTime = _getTime$1();
            self.isDragging = false;
          }

          _dragCount--;

          if (e) {
            touches = e.changedTouches;

            if (touches) {
              //touch events store the data slightly differently
              e = touches[0];

              if (e !== touch && e.identifier !== touchID) {
                //Usually changedTouches[0] will be what we're looking for, but in case it's not, look through the rest of the array...(and Android browsers don't reuse the event like iOS)
                i = touches.length;

                while (--i > -1 && (e = touches[i]).identifier !== touchID) {}

                if (i < 0) {
                  return;
                }
              }
            }

            self.pointerEvent = originalEvent;
            self.pointerX = e.pageX;
            self.pointerY = e.pageY;
          }

          if (isContextMenuRelease && originalEvent) {
            _preventDefault(originalEvent);

            isPreventingDefault = true;

            _dispatchEvent(self, "release", "onRelease");
          } else if (originalEvent && !wasDragging) {
            isPreventingDefault = false;

            if (interrupted && (vars.snap || vars.bounds)) {
              //otherwise, if the user clicks on the object while it's animating to a snapped position, and then releases without moving 3 pixels, it will just stay there (it should animate/snap)
              animate(vars.inertia || vars.throwProps);
            }

            _dispatchEvent(self, "release", "onRelease");

            if ((!_isAndroid || originalEvent.type !== "touchmove") && originalEvent.type.indexOf("cancel") === -1) {
              //to accommodate native scrolling on Android devices, we have to immediately call onRelease() on the first touchmove event, but that shouldn't trigger a "click".
              _dispatchEvent(self, "click", "onClick");

              if (_getTime$1() - clickTime < 300) {
                _dispatchEvent(self, "doubleclick", "onDoubleClick");
              }

              eventTarget = originalEvent.target || target; //old IE uses srcElement

              clickTime = _getTime$1();

              syntheticClick = function syntheticClick() {
                // some browsers (like Firefox) won't trust script-generated clicks, so if the user tries to click on a video to play it, for example, it simply won't work. Since a regular "click" event will most likely be generated anyway (one that has its isTrusted flag set to true), we must slightly delay our script-generated click so that the "real"/trusted one is prioritized. Remember, when there are duplicate events in quick succession, we suppress all but the first one. Some browsers don't even trigger the "real" one at all, so our synthetic one is a safety valve that ensures that no matter what, a click event does get dispatched.
                if (clickTime !== clickDispatch && self.enabled() && !self.isPressed && !originalEvent.defaultPrevented) {
                  if (eventTarget.click) {
                    //some browsers (like mobile Safari) don't properly trigger the click event
                    eventTarget.click();
                  } else if (ownerDoc.createEvent) {
                    syntheticEvent = ownerDoc.createEvent("MouseEvents");
                    syntheticEvent.initMouseEvent("click", true, true, _win$4, 1, self.pointerEvent.screenX, self.pointerEvent.screenY, self.pointerX, self.pointerY, false, false, false, false, 0, null);
                    eventTarget.dispatchEvent(syntheticEvent);
                  }
                }
              };

              if (!_isAndroid && !originalEvent.defaultPrevented) {
                //iOS Safari requires the synthetic click to happen immediately or else it simply won't work, but Android doesn't play nice.
                gsap$3.delayedCall(0.05, syntheticClick); //in addition to the iOS bug workaround, there's a Firefox issue with clicking on things like a video to play, so we must fake a click event in a slightly delayed fashion. Previously, we listened for the "click" event with "capture" false which solved the video-click-to-play issue, but it would allow the "click" event to be dispatched twice like if you were using a jQuery.click() because that was handled in the capture phase, thus we had to switch to the capture phase to avoid the double-dispatching, but do the delayed synthetic click. Don't fire it too fast (like 0.00001) because we want to give the native event a chance to fire first as it's "trusted".
              }
            }
          } else {
            animate(vars.inertia || vars.throwProps); //will skip if inertia/throwProps isn't defined or IntertiaPlugin isn't loaded.

            if (!self.allowEventDefault && originalEvent && (vars.dragClickables !== false || !isClickable.call(self, originalEvent.target)) && wasDragging && (!allowNativeTouchScrolling || touchDragAxis && allowNativeTouchScrolling === touchDragAxis) && originalEvent.cancelable !== false) {
              isPreventingDefault = true;

              _preventDefault(originalEvent);
            } else {
              isPreventingDefault = false;
            }

            _dispatchEvent(self, "release", "onRelease");
          }

          isTweening() && placeholderDelayedCall.duration(self.tween.duration()); //sync the timing so that the placeholder DIV gets

          wasDragging && _dispatchEvent(self, "dragend", "onDragEnd");
          return true;
        },
            updateScroll = function updateScroll(e) {
          if (e && self.isDragging && !scrollProxy) {
            var parent = e.target || target.parentNode,
                deltaX = parent.scrollLeft - parent._gsScrollX,
                deltaY = parent.scrollTop - parent._gsScrollY;

            if (deltaX || deltaY) {
              if (matrix) {
                startPointerX -= deltaX * matrix.a + deltaY * matrix.c;
                startPointerY -= deltaY * matrix.d + deltaX * matrix.b;
              } else {
                startPointerX -= deltaX;
                startPointerY -= deltaY;
              }

              parent._gsScrollX += deltaX;
              parent._gsScrollY += deltaY;
              setPointerPosition(self.pointerX, self.pointerY);
            }
          }
        },
            onClick = function onClick(e) {
          //this was a huge pain in the neck to align all the various browsers and their behaviors. Chrome, Firefox, Safari, Opera, Android, and Microsoft Edge all handle events differently! Some will only trigger native behavior (like checkbox toggling) from trusted events. Others don't even support isTrusted, but require 2 events to flow through before triggering native behavior. Edge treats everything as trusted but also mandates that 2 flow through to trigger the correct native behavior.
          var time = _getTime$1(),
              recentlyClicked = time - clickTime < 40,
              recentlyDragged = time - dragEndTime < 40,
              alreadyDispatched = recentlyClicked && clickDispatch === clickTime,
              defaultPrevented = self.pointerEvent && self.pointerEvent.defaultPrevented,
              alreadyDispatchedTrusted = recentlyClicked && trustedClickDispatch === clickTime,
              trusted = e.isTrusted || e.isTrusted == null && recentlyClicked && alreadyDispatched; //note: Safari doesn't support isTrusted, and it won't properly execute native behavior (like toggling checkboxes) on the first synthetic "click" event - we must wait for the 2nd and treat it as trusted (but stop propagation at that point). Confusing, I know. Don't you love cross-browser compatibility challenges?


          if ((alreadyDispatched || recentlyDragged && self.vars.suppressClickOnDrag !== false) && e.stopImmediatePropagation) {
            e.stopImmediatePropagation();
          }

          if (recentlyClicked && !(self.pointerEvent && self.pointerEvent.defaultPrevented) && (!alreadyDispatched || trusted && !alreadyDispatchedTrusted)) {
            //let the first click pass through unhindered. Let the next one only if it's trusted, then no more (stop quick-succession ones)
            if (trusted && alreadyDispatched) {
              trustedClickDispatch = clickTime;
            }

            clickDispatch = clickTime;
            return;
          }

          if (self.isPressed || recentlyDragged || recentlyClicked) {
            if (!trusted || !e.detail || !recentlyClicked || defaultPrevented) {
              _preventDefault(e);
            }
          }
        },
            localizePoint = function localizePoint(p) {
          return matrix ? {
            x: p.x * matrix.a + p.y * matrix.c + matrix.e,
            y: p.x * matrix.b + p.y * matrix.d + matrix.f
          } : {
            x: p.x,
            y: p.y
          };
        };

        old = Draggable.get(target);
        old && old.kill(); // avoids duplicates (an element can only be controlled by one Draggable)
        //give the user access to start/stop dragging...

        _this2.startDrag = function (event, align) {
          var r1, r2, p1, p2;
          onPress(event || self.pointerEvent, true); //if the pointer isn't on top of the element, adjust things accordingly

          if (align && !self.hitTest(event || self.pointerEvent)) {
            r1 = _parseRect(event || self.pointerEvent);
            r2 = _parseRect(target);
            p1 = localizePoint({
              x: r1.left + r1.width / 2,
              y: r1.top + r1.height / 2
            });
            p2 = localizePoint({
              x: r2.left + r2.width / 2,
              y: r2.top + r2.height / 2
            });
            startPointerX -= p1.x - p2.x;
            startPointerY -= p1.y - p2.y;
          }

          if (!self.isDragging) {
            self.isDragging = true;

            _dispatchEvent(self, "dragstart", "onDragStart");
          }
        };

        _this2.drag = onMove;

        _this2.endDrag = function (e) {
          return onRelease(e || self.pointerEvent, true);
        };

        _this2.timeSinceDrag = function () {
          return self.isDragging ? 0 : (_getTime$1() - dragEndTime) / 1000;
        };

        _this2.timeSinceClick = function () {
          return (_getTime$1() - clickTime) / 1000;
        };

        _this2.hitTest = function (target, threshold) {
          return Draggable.hitTest(self.target, target, threshold);
        };

        _this2.getDirection = function (from, diagonalThreshold) {
          //from can be "start" (default), "velocity", or an element
          var mode = from === "velocity" && InertiaPlugin ? from : _isObject$2(from) && !rotationMode ? "element" : "start",
              xChange,
              yChange,
              ratio,
              direction,
              r1,
              r2;

          if (mode === "element") {
            r1 = _parseRect(self.target);
            r2 = _parseRect(from);
          }

          xChange = mode === "start" ? self.x - startElementX : mode === "velocity" ? InertiaPlugin.getVelocity(target, xProp) : r1.left + r1.width / 2 - (r2.left + r2.width / 2);

          if (rotationMode) {
            return xChange < 0 ? "counter-clockwise" : "clockwise";
          } else {
            diagonalThreshold = diagonalThreshold || 2;
            yChange = mode === "start" ? self.y - startElementY : mode === "velocity" ? InertiaPlugin.getVelocity(target, yProp) : r1.top + r1.height / 2 - (r2.top + r2.height / 2);
            ratio = Math.abs(xChange / yChange);
            direction = ratio < 1 / diagonalThreshold ? "" : xChange < 0 ? "left" : "right";

            if (ratio < diagonalThreshold) {
              if (direction !== "") {
                direction += "-";
              }

              direction += yChange < 0 ? "up" : "down";
            }
          }

          return direction;
        };

        _this2.applyBounds = function (newBounds, sticky) {
          var x, y, forceZeroVelocity, e, parent, isRoot;

          if (newBounds && vars.bounds !== newBounds) {
            vars.bounds = newBounds;
            return self.update(true, sticky);
          }

          syncXY(true);
          calculateBounds();

          if (hasBounds && !isTweening()) {
            x = self.x;
            y = self.y;

            if (x > maxX) {
              x = maxX;
            } else if (x < minX) {
              x = minX;
            }

            if (y > maxY) {
              y = maxY;
            } else if (y < minY) {
              y = minY;
            }

            if (self.x !== x || self.y !== y) {
              forceZeroVelocity = true;
              self.x = self.endX = x;

              if (rotationMode) {
                self.endRotation = x;
              } else {
                self.y = self.endY = y;
              }

              dirty = true;
              render(true);

              if (self.autoScroll && !self.isDragging) {
                _recordMaxScrolls(target.parentNode);

                e = target;
                _windowProxy.scrollTop = _win$4.pageYOffset != null ? _win$4.pageYOffset : ownerDoc.documentElement.scrollTop != null ? ownerDoc.documentElement.scrollTop : ownerDoc.body.scrollTop;
                _windowProxy.scrollLeft = _win$4.pageXOffset != null ? _win$4.pageXOffset : ownerDoc.documentElement.scrollLeft != null ? ownerDoc.documentElement.scrollLeft : ownerDoc.body.scrollLeft;

                while (e && !isRoot) {
                  //walk up the chain and sense wherever the scrollTop/scrollLeft exceeds the maximum.
                  isRoot = _isRoot(e.parentNode);
                  parent = isRoot ? _windowProxy : e.parentNode;

                  if (allowY && parent.scrollTop > parent._gsMaxScrollY) {
                    parent.scrollTop = parent._gsMaxScrollY;
                  }

                  if (allowX && parent.scrollLeft > parent._gsMaxScrollX) {
                    parent.scrollLeft = parent._gsMaxScrollX;
                  }

                  e = parent;
                }
              }
            }

            if (self.isThrowing && (forceZeroVelocity || self.endX > maxX || self.endX < minX || self.endY > maxY || self.endY < minY)) {
              animate(vars.inertia || vars.throwProps, forceZeroVelocity);
            }
          }

          return self;
        };

        _this2.update = function (applyBounds, sticky, ignoreExternalChanges) {
          var x = self.x,
              y = self.y;
          updateMatrix(!sticky);

          if (applyBounds) {
            self.applyBounds();
          } else {
            if (dirty && ignoreExternalChanges) {
              render(true);
            }

            syncXY(true);
          }

          if (sticky) {
            setPointerPosition(self.pointerX, self.pointerY);
            dirty && render(true);
          }

          if (self.isPressed && !sticky && (allowX && Math.abs(x - self.x) > 0.01 || allowY && Math.abs(y - self.y) > 0.01 && !rotationMode)) {
            recordStartPositions();
          }

          if (self.autoScroll) {
            _recordMaxScrolls(target.parentNode, self.isDragging);

            checkAutoScrollBounds = self.isDragging;
            render(true); //in case reparenting occurred.

            _removeScrollListener(target, updateScroll);

            _addScrollListener(target, updateScroll);
          }

          return self;
        };

        _this2.enable = function (type) {
          var setVars = {
            lazy: true
          },
              id,
              i,
              trigger;

          if (!rotationMode && vars.cursor !== false) {
            setVars.cursor = vars.cursor || _defaultCursor;
          }

          if (gsap$3.utils.checkPrefix("touchCallout")) {
            setVars.touchCallout = "none";
          }

          setVars.touchAction = allowX === allowY ? "none" : vars.allowNativeTouchScrolling || vars.allowEventDefault ? "manipulation" : allowX ? "pan-y" : "pan-x";

          if (type !== "soft") {
            i = triggers.length;

            while (--i > -1) {
              trigger = triggers[i];
              _supportsPointer || _addListener$1(trigger, "mousedown", onPress);

              _addListener$1(trigger, "touchstart", onPress);

              _addListener$1(trigger, "click", onClick, true); //note: used to pass true for capture but it prevented click-to-play-video functionality in Firefox.


              gsap$3.set(trigger, setVars);

              if (trigger.getBBox && trigger.ownerSVGElement) {
                // a bug in chrome doesn't respect touch-action on SVG elements - it only works if we set it on the parent SVG.
                gsap$3.set(trigger.ownerSVGElement, {
                  touchAction: allowX === allowY ? "none" : vars.allowNativeTouchScrolling || vars.allowEventDefault ? "manipulation" : allowX ? "pan-y" : "pan-x"
                });
              }

              vars.allowContextMenu || _addListener$1(trigger, "contextmenu", onContextMenu);
            }

            _setSelectable(triggers, false);
          }

          _addScrollListener(target, updateScroll);

          enabled = true;

          if (InertiaPlugin && type !== "soft") {
            InertiaPlugin.track(scrollProxy || target, xyMode ? "x,y" : rotationMode ? "rotation" : "top,left");
          }

          target._gsDragID = id = "d" + _lookupCount++;
          _lookup[id] = self;

          if (scrollProxy) {
            scrollProxy.enable();
            scrollProxy.element._gsDragID = id;
          }

          (vars.bounds || rotationMode) && recordStartPositions();
          vars.bounds && self.applyBounds();
          return self;
        };

        _this2.disable = function (type) {
          var dragging = self.isDragging,
              i,
              trigger;

          if (!rotationMode) {
            i = triggers.length;

            while (--i > -1) {
              _setStyle(triggers[i], "cursor", null);
            }
          }

          if (type !== "soft") {
            i = triggers.length;

            while (--i > -1) {
              trigger = triggers[i];

              _setStyle(trigger, "touchCallout", null);

              _setStyle(trigger, "touchAction", null);

              _removeListener$1(trigger, "mousedown", onPress);

              _removeListener$1(trigger, "touchstart", onPress);

              _removeListener$1(trigger, "click", onClick);

              _removeListener$1(trigger, "contextmenu", onContextMenu);
            }

            _setSelectable(triggers, true);

            if (touchEventTarget) {
              _removeListener$1(touchEventTarget, "touchcancel", onRelease);

              _removeListener$1(touchEventTarget, "touchend", onRelease);

              _removeListener$1(touchEventTarget, "touchmove", onMove);
            }

            _removeListener$1(ownerDoc, "mouseup", onRelease);

            _removeListener$1(ownerDoc, "mousemove", onMove);
          }

          _removeScrollListener(target, updateScroll);

          enabled = false;

          if (InertiaPlugin && type !== "soft") {
            InertiaPlugin.untrack(scrollProxy || target, xyMode ? "x,y" : rotationMode ? "rotation" : "top,left");
          }

          if (scrollProxy) {
            scrollProxy.disable();
          }

          _removeFromRenderQueue(render);

          self.isDragging = self.isPressed = isClicking = false;

          if (dragging) {
            _dispatchEvent(self, "dragend", "onDragEnd");
          }

          return self;
        };

        _this2.enabled = function (value, type) {
          return arguments.length ? value ? self.enable(type) : self.disable(type) : enabled;
        };

        _this2.kill = function () {
          self.isThrowing = false;

          if (self.tween) {
            self.tween.kill();
          }

          self.disable();
          gsap$3.set(triggers, {
            clearProps: "userSelect"
          });
          delete _lookup[target._gsDragID];
          return self;
        };

        if (~type.indexOf("scroll")) {
          scrollProxy = _this2.scrollProxy = new ScrollProxy(target, _extend({
            onKill: function onKill() {
              //ScrollProxy's onKill() gets called if/when the ScrollProxy senses that the user interacted with the scroll position manually (like using the scrollbar). IE9 doesn't fire the "mouseup" properly when users drag the scrollbar of an element, so this works around that issue.
              if (self.isPressed) {
                onRelease(null);
              }
            }
          }, vars)); //a bug in many Android devices' stock browser causes scrollTop to get forced back to 0 after it is altered via JS, so we set overflow to "hidden" on mobile/touch devices (they hide the scroll bar anyway). That works around the bug. (This bug is discussed at https://code.google.com/p/android/issues/detail?id=19625)

          target.style.overflowY = allowY && !_isTouchDevice ? "auto" : "hidden";
          target.style.overflowX = allowX && !_isTouchDevice ? "auto" : "hidden";
          target = scrollProxy.content;
        }

        if (rotationMode) {
          killProps.rotation = 1;
        } else {
          if (allowX) {
            killProps[xProp] = 1;
          }

          if (allowY) {
            killProps[yProp] = 1;
          }
        }

        gsCache.force3D = "force3D" in vars ? vars.force3D : true; //otherwise, normal dragging would be in 2D and then as soon as it's released and there's an inertia tween, it'd jump to 3D which can create an initial jump due to the work the browser must to do layerize it.

        _this2.enable();

        return _this2;
      }

      Draggable.register = function register(core) {
        gsap$3 = core;

        _initCore$1();
      };

      Draggable.create = function create(targets, vars) {
        if (!_coreInitted$2) {
          _initCore$1(true);
        }

        return _toArray$1(targets).map(function (target) {
          return new Draggable(target, vars);
        });
      };

      Draggable.get = function get(target) {
        return _lookup[(_toArray$1(target)[0] || {})._gsDragID];
      };

      Draggable.timeSinceDrag = function timeSinceDrag() {
        return (_getTime$1() - _lastDragTime) / 1000;
      };

      Draggable.hitTest = function hitTest(obj1, obj2, threshold) {
        if (obj1 === obj2) {
          return false;
        }

        var r1 = _parseRect(obj1),
            r2 = _parseRect(obj2),
            top = r1.top,
            left = r1.left,
            right = r1.right,
            bottom = r1.bottom,
            width = r1.width,
            height = r1.height,
            isOutside = r2.left > right || r2.right < left || r2.top > bottom || r2.bottom < top,
            overlap,
            area,
            isRatio;

        if (isOutside || !threshold) {
          return !isOutside;
        }

        isRatio = (threshold + "").indexOf("%") !== -1;
        threshold = parseFloat(threshold) || 0;
        overlap = {
          left: Math.max(left, r2.left),
          top: Math.max(top, r2.top)
        };
        overlap.width = Math.min(right, r2.right) - overlap.left;
        overlap.height = Math.min(bottom, r2.bottom) - overlap.top;

        if (overlap.width < 0 || overlap.height < 0) {
          return false;
        }

        if (isRatio) {
          threshold *= 0.01;
          area = overlap.width * overlap.height;
          return area >= width * height * threshold || area >= r2.width * r2.height * threshold;
        }

        return overlap.width > threshold && overlap.height > threshold;
      };

      return Draggable;
    }(EventDispatcher);

    _setDefaults$2(Draggable.prototype, {
      pointerX: 0,
      pointerY: 0,
      startX: 0,
      startY: 0,
      deltaX: 0,
      deltaY: 0,
      isDragging: false,
      isPressed: false
    });

    Draggable.zIndex = 1000;
    Draggable.version = "3.5.1";
    _getGSAP$2() && gsap$3.registerPlugin(Draggable);

    /*!
     * DrawSVGPlugin 3.5.1
     * https://greensock.com
     *
     * @license Copyright 2008-2020, GreenSock. All rights reserved.
     * Subject to the terms at https://greensock.com/standard-license or for
     * Club GreenSock members, the agreement issued with that membership.
     * @author: Jack Doyle, jack@greensock.com
    */

    /* eslint-disable */
    var gsap$4,
        _toArray$2,
        _win$5,
        _isEdge,
        _coreInitted$3,
        _windowExists$4 = function _windowExists() {
      return typeof window !== "undefined";
    },
        _getGSAP$3 = function _getGSAP() {
      return gsap$4 || _windowExists$4() && (gsap$4 = window.gsap) && gsap$4.registerPlugin && gsap$4;
    },
        _numExp$1 = /[-+=\.]*\d+[\.e\-\+]*\d*[e\-\+]*\d*/gi,
        //finds any numbers, including ones that start with += or -=, negative numbers, and ones in scientific notation like 1e-8.
    _types = {
      rect: ["width", "height"],
      circle: ["r", "r"],
      ellipse: ["rx", "ry"],
      line: ["x2", "y2"]
    },
        _round$2 = function _round(value) {
      return Math.round(value * 10000) / 10000;
    },
        _parseNum = function _parseNum(value) {
      return parseFloat(value || 0);
    },
        _getAttributeAsNumber = function _getAttributeAsNumber(target, attr) {
      return _parseNum(target.getAttribute(attr));
    },
        _sqrt$1 = Math.sqrt,
        _getDistance = function _getDistance(x1, y1, x2, y2, scaleX, scaleY) {
      return _sqrt$1(Math.pow((_parseNum(x2) - _parseNum(x1)) * scaleX, 2) + Math.pow((_parseNum(y2) - _parseNum(y1)) * scaleY, 2));
    },
        _warn$1 = function _warn(message) {
      return console.warn(message);
    },
        _hasNonScalingStroke = function _hasNonScalingStroke(target) {
      return target.getAttribute("vector-effect") === "non-scaling-stroke";
    },
        _bonusValidated = 1,
        //<name>DrawSVGPlugin</name>
    //accepts values like "100%" or "20% 80%" or "20 50" and parses it into an absolute start and end position on the line/stroke based on its length. Returns an an array with the start and end values, like [0, 243]
    _parse = function _parse(value, length, defaultStart) {
      var i = value.indexOf(" "),
          s,
          e;

      if (i < 0) {
        s = defaultStart !== undefined ? defaultStart + "" : value;
        e = value;
      } else {
        s = value.substr(0, i);
        e = value.substr(i + 1);
      }

      s = ~s.indexOf("%") ? _parseNum(s) / 100 * length : _parseNum(s);
      e = ~e.indexOf("%") ? _parseNum(e) / 100 * length : _parseNum(e);
      return s > e ? [e, s] : [s, e];
    },
        _getLength = function _getLength(target) {
      target = _toArray$2(target)[0];

      if (!target) {
        return 0;
      }

      var type = target.tagName.toLowerCase(),
          style = target.style,
          scaleX = 1,
          scaleY = 1,
          length,
          bbox,
          points,
          prevPoint,
          i,
          rx,
          ry;

      if (_hasNonScalingStroke(target)) {
        //non-scaling-stroke basically scales the shape and then strokes it at the screen-level (after transforms), thus we need to adjust the length accordingly.
        scaleY = target.getScreenCTM();
        scaleX = _sqrt$1(scaleY.a * scaleY.a + scaleY.b * scaleY.b);
        scaleY = _sqrt$1(scaleY.d * scaleY.d + scaleY.c * scaleY.c);
      }

      try {
        //IE bug: calling <path>.getTotalLength() locks the repaint area of the stroke to whatever its current dimensions are on that frame/tick. To work around that, we must call getBBox() to force IE to recalculate things.
        bbox = target.getBBox(); //solely for fixing bug in IE - we don't actually use the bbox.
      } catch (e) {
        //firefox has a bug that throws an error if the element isn't visible.
        _warn$1("Some browsers won't measure invisible elements (like display:none or masks inside defs).");
      }

      var _ref = bbox || {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      },
          x = _ref.x,
          y = _ref.y,
          width = _ref.width,
          height = _ref.height;

      if ((!bbox || !width && !height) && _types[type]) {
        //if the element isn't visible, try to discern width/height using its attributes.
        width = _getAttributeAsNumber(target, _types[type][0]);
        height = _getAttributeAsNumber(target, _types[type][1]);

        if (type !== "rect" && type !== "line") {
          //double the radius for circles and ellipses
          width *= 2;
          height *= 2;
        }

        if (type === "line") {
          x = _getAttributeAsNumber(target, "x1");
          y = _getAttributeAsNumber(target, "y1");
          width = Math.abs(width - x);
          height = Math.abs(height - y);
        }
      }

      if (type === "path") {
        prevPoint = style.strokeDasharray;
        style.strokeDasharray = "none";
        length = target.getTotalLength() || 0;

        if (scaleX !== scaleY) {
          _warn$1("Warning: <path> length cannot be measured when vector-effect is non-scaling-stroke and the element isn't proportionally scaled.");
        }

        length *= (scaleX + scaleY) / 2;
        style.strokeDasharray = prevPoint;
      } else if (type === "rect") {
        length = width * 2 * scaleX + height * 2 * scaleY;
      } else if (type === "line") {
        length = _getDistance(x, y, x + width, y + height, scaleX, scaleY);
      } else if (type === "polyline" || type === "polygon") {
        points = target.getAttribute("points").match(_numExp$1) || [];

        if (type === "polygon") {
          points.push(points[0], points[1]);
        }

        length = 0;

        for (i = 2; i < points.length; i += 2) {
          length += _getDistance(points[i - 2], points[i - 1], points[i], points[i + 1], scaleX, scaleY) || 0;
        }
      } else if (type === "circle" || type === "ellipse") {
        rx = width / 2 * scaleX;
        ry = height / 2 * scaleY;
        length = Math.PI * (3 * (rx + ry) - _sqrt$1((3 * rx + ry) * (rx + 3 * ry)));
      }

      return length || 0;
    },
        _getPosition = function _getPosition(target, length) {
      target = _toArray$2(target)[0];

      if (!target) {
        return [0, 0];
      }

      if (!length) {
        length = _getLength(target) + 1;
      }

      var cs = _win$5.getComputedStyle(target),
          dash = cs.strokeDasharray || "",
          offset = _parseNum(cs.strokeDashoffset),
          i = dash.indexOf(",");

      if (i < 0) {
        i = dash.indexOf(" ");
      }

      dash = i < 0 ? length : _parseNum(dash.substr(0, i)) || 1e-5;

      if (dash > length) {
        dash = length;
      }

      return [Math.max(0, -offset), Math.max(0, dash - offset)];
    },
        _initCore$2 = function _initCore() {
      if (_windowExists$4()) {
        _win$5 = window;
        _coreInitted$3 = gsap$4 = _getGSAP$3();
        _toArray$2 = gsap$4.utils.toArray;
        _isEdge = ((_win$5.navigator || {}).userAgent || "").indexOf("Edge") !== -1; //Microsoft Edge has a bug that causes it not to redraw the path correctly if the stroke-linecap is anything other than "butt" (like "round") and it doesn't match the stroke-linejoin. A way to trigger it is to change the stroke-miterlimit, so we'll only do that if/when we have to (to maximize performance)
      }
    };

    var DrawSVGPlugin = {
      version: "3.5.1",
      name: "drawSVG",
      register: function register(core) {
        gsap$4 = core;

        _initCore$2();
      },
      init: function init(target, value, tween, index, targets) {
        if (!target.getBBox) {
          return false;
        }

        _coreInitted$3 || _initCore$2();
        var length = _getLength(target) + 1,
            start,
            end,
            overage,
            cs;
        this._style = target.style;
        this._target = target;

        if (value + "" === "true") {
          value = "0 100%";
        } else if (!value) {
          value = "0 0";
        } else if ((value + "").indexOf(" ") === -1) {
          value = "0 " + value;
        }

        start = _getPosition(target, length);
        end = _parse(value, length, start[0]);
        this._length = _round$2(length + 10);

        if (start[0] === 0 && end[0] === 0) {
          overage = Math.max(0.00001, end[1] - length); //allow people to go past the end, like values of 105% because for some paths, Firefox doesn't return an accurate getTotalLength(), so it could end up coming up short.

          this._dash = _round$2(length + overage);
          this._offset = _round$2(length - start[1] + overage);
          this._offsetPT = this.add(this, "_offset", this._offset, _round$2(length - end[1] + overage));
        } else {
          this._dash = _round$2(start[1] - start[0]) || 0.000001; //some browsers render artifacts if dash is 0, so we use a very small number in that case.

          this._offset = _round$2(-start[0]);
          this._dashPT = this.add(this, "_dash", this._dash, _round$2(end[1] - end[0]) || 0.00001);
          this._offsetPT = this.add(this, "_offset", this._offset, _round$2(-end[0]));
        }

        if (_isEdge) {
          //to work around a bug in Microsoft Edge, animate the stroke-miterlimit by 0.0001 just to trigger the repaint (unnecessary if it's "round" and stroke-linejoin is also "round"). Imperceptible, relatively high-performance, and effective. Another option was to set the "d" <path> attribute to its current value on every tick, but that seems like it'd be much less performant.
          cs = _win$5.getComputedStyle(target);

          if (cs.strokeLinecap !== cs.strokeLinejoin) {
            end = _parseNum(cs.strokeMiterlimit);
            this.add(target.style, "strokeMiterlimit", end, end + 0.01);
          }
        }

        this._live = _hasNonScalingStroke(target) || ~(value + "").indexOf("live");

        this._props.push("drawSVG");

        return _bonusValidated;
      },
      render: function render(ratio, data) {
        var pt = data._pt,
            style = data._style,
            length,
            lengthRatio,
            dash,
            offset;

        if (pt) {
          //when the element has vector-effect="non-scaling-stroke" and the SVG is resized (like on a window resize), it actually changes the length of the stroke! So we must sense that and make the proper adjustments.
          if (data._live) {
            length = _getLength(data._target) + 11;

            if (length !== data._length) {
              lengthRatio = length / data._length;
              data._length = length;
              data._offsetPT.s *= lengthRatio;
              data._offsetPT.c *= lengthRatio;

              if (data._dashPT) {
                data._dashPT.s *= lengthRatio;
                data._dashPT.c *= lengthRatio;
              } else {
                data._dash *= lengthRatio;
              }
            }
          }

          while (pt) {
            pt.r(ratio, pt.d);
            pt = pt._next;
          }

          dash = data._dash;
          offset = data._offset;
          length = data._length;
          style.strokeDashoffset = data._offset;

          if (ratio === 1 || !ratio) {
            if (dash - offset < 0.001 && length - dash <= 10) {
              //works around a bug in Safari that caused strokes with rounded ends to still show initially when they shouldn't.
              style.strokeDashoffset = offset + 1;
            }

            style.strokeDasharray = offset < 0.001 && length - dash <= 10 ? "none" : offset === dash ? "0px, 999999px" : dash + "px," + length + "px";
          } else {
            style.strokeDasharray = dash + "px," + length + "px";
          }
        }
      },
      getLength: _getLength,
      getPosition: _getPosition
    };
    _getGSAP$3() && gsap$4.registerPlugin(DrawSVGPlugin);

    /*!
     * Physics2DPlugin 3.5.1
     * https://greensock.com
     *
     * @license Copyright 2008-2020, GreenSock. All rights reserved.
     * Subject to the terms at https://greensock.com/standard-license or for
     * Club GreenSock members, the agreement issued with that membership.
     * @author: Jack Doyle, jack@greensock.com
    */

    /* eslint-disable */
    var gsap$5,
        _coreInitted$4,
        _getUnit,
        _DEG2RAD$1 = Math.PI / 180,
        _getGSAP$4 = function _getGSAP() {
      return gsap$5 || typeof window !== "undefined" && (gsap$5 = window.gsap) && gsap$5.registerPlugin && gsap$5;
    },
        _round$3 = function _round(value) {
      return Math.round(value * 10000) / 10000;
    },
        //<name>Physics2DPlugin</name>
    _initCore$3 = function _initCore(core) {
      gsap$5 = core || _getGSAP$4();

      if (!_coreInitted$4) {
        _getUnit = gsap$5.utils.getUnit;
        _coreInitted$4 = 1;
      }
    };

    var PhysicsProp = function PhysicsProp(target, p, velocity, acceleration, stepsPerTimeUnit) {
      var cache = target._gsap,
          curVal = cache.get(target, p);
      this.p = p;
      this.set = cache.set(target, p); //setter

      this.s = this.val = parseFloat(curVal);
      this.u = _getUnit(curVal) || 0;
      this.vel = velocity || 0;
      this.v = this.vel / stepsPerTimeUnit;

      if (acceleration || acceleration === 0) {
        this.acc = acceleration;
        this.a = this.acc / (stepsPerTimeUnit * stepsPerTimeUnit);
      } else {
        this.acc = this.a = 0;
      }
    };

    var Physics2DPlugin = {
      version: "3.5.1",
      name: "physics2D",
      register: _initCore$3,
      init: function init(target, value, tween) {
        _coreInitted$4 || _initCore$3();
        var data = this,
            angle = +value.angle || 0,
            velocity = +value.velocity || 0,
            acceleration = +value.acceleration || 0,
            xProp = value.xProp || "x",
            yProp = value.yProp || "y",
            aAngle = value.accelerationAngle || value.accelerationAngle === 0 ? +value.accelerationAngle : angle;
        data.target = target;
        data.tween = tween;
        data.step = 0;
        data.sps = 30; //steps per second

        if (value.gravity) {
          acceleration = +value.gravity;
          aAngle = 90;
        }

        angle *= _DEG2RAD$1;
        aAngle *= _DEG2RAD$1;
        data.fr = 1 - (+value.friction || 0);

        data._props.push(xProp, yProp);

        data.xp = new PhysicsProp(target, xProp, Math.cos(angle) * velocity, Math.cos(aAngle) * acceleration, data.sps);
        data.yp = new PhysicsProp(target, yProp, Math.sin(angle) * velocity, Math.sin(aAngle) * acceleration, data.sps);
        data.skipX = data.skipY = 0;
      },
      render: function render(ratio, data) {
        var xp = data.xp,
            yp = data.yp,
            tween = data.tween,
            target = data.target,
            step = data.step,
            sps = data.sps,
            fr = data.fr,
            skipX = data.skipX,
            skipY = data.skipY,
            time = tween._from ? tween._dur - tween._time : tween._time,
            x,
            y,
            tt,
            steps,
            remainder,
            i;

        if (fr === 1) {
          tt = time * time * 0.5;
          x = xp.s + xp.vel * time + xp.acc * tt;
          y = yp.s + yp.vel * time + yp.acc * tt;
        } else {
          time *= sps;
          steps = i = (time | 0) - step;
          /*
          Note: rounding errors build up if we walk the calculations backward which we used to do like this to maximize performance:
          	i = -i;
          	while (i--) {
          		xp.val -= xp.v;
          		yp.val -= yp.v;
          		xp.v /= fr;
          		yp.v /= fr;
          		xp.v -= xp.a;
          		yp.v -= yp.a;
          	}
          but now for the sake of accuracy (to ensure rewinding always goes back to EXACTLY the same spot), we force the calculations to go forward every time. So if the tween is going backward, we just start from the beginning and iterate. This is only necessary with friction.
           */

          if (i < 0) {
            xp.v = xp.vel / sps;
            yp.v = yp.vel / sps;
            xp.val = xp.s;
            yp.val = yp.s;
            data.step = 0;
            steps = i = time | 0;
          }

          remainder = time % 1 * fr;

          while (i--) {
            xp.v += xp.a;
            yp.v += yp.a;
            xp.v *= fr;
            yp.v *= fr;
            xp.val += xp.v;
            yp.val += yp.v;
          }

          x = xp.val + xp.v * remainder;
          y = yp.val + yp.v * remainder;
          data.step += steps;
        }

        skipX || xp.set(target, xp.p, _round$3(x) + xp.u);
        skipY || yp.set(target, yp.p, _round$3(y) + yp.u);
      },
      kill: function kill(property) {
        if (this.xp.p === property) {
          this.skipX = 1;
        }

        if (this.yp.p === property) {
          this.skipY = 1;
        }
      }
    };
    _getGSAP$4() && gsap$5.registerPlugin(Physics2DPlugin);

    /*!
     * GSDevTools 3.5.1
     * https://greensock.com
     *
     * @license Copyright 2008-2020, GreenSock. All rights reserved.
     * Subject to the terms at https://greensock.com/standard-license or for
     * Club GreenSock members, the agreement issued with that membership.
     * @author: Jack Doyle, jack@greensock.com
    */

    var gsap$6,
        _coreInitted$5,
        _doc$5,
        _docEl$1,
        _win$6,
        _recordedRoot,
        Animation$1,
        _rootTween,
        _rootInstance,
        _keyboardInstance,
        _globalTimeline$1,
        _independentRoot,
        _delayedCall,
        _startupPhase = true,
        //for the first 2 seconds, we don't record any zero-duration tweens because they're typically just setup stuff and/or the "from" or "startAt" tweens. In version 1.20.3 we started flagging those with data:"isStart"|"isFromStart" but this logic helps GSDevTools work with older versions too.
    _globalStartTime = 0,
        _windowExists$5 = function _windowExists() {
      return typeof window !== "undefined";
    },
        _getGSAP$5 = function _getGSAP() {
      return gsap$6 || _windowExists$5() && (gsap$6 = window.gsap) && gsap$6.registerPlugin && gsap$6;
    },
        _isString$2 = function _isString(value) {
      return typeof value === "string";
    },
        _isFunction$3 = function _isFunction(value) {
      return typeof value === "function";
    },
        _isObject$3 = function _isObject(value) {
      return typeof value === "object";
    },
        _isUndefined$2 = function _isUndefined(value) {
      return typeof value === "undefined";
    },
        //<name>GSDevTools</name>
    _svgNS = "http://www.w3.org/2000/svg",
        _domNS = "http://www.w3.org/1999/xhtml",
        _idSeed = 0,
        //we assign an ID to each GSDevTools instance so that we can segregate the sessionStorage data accordingly.
    _lookup$1 = {},
        _supportsStorage = function () {
      try {
        sessionStorage.setItem("gsTest", "1");
        sessionStorage.removeItem("gsTest");
        return true;
      } catch (e) {
        return false;
      }
    }(),
        _parseAnimation = function _parseAnimation(animationOrId) {
      return animationOrId instanceof Animation$1 ? animationOrId : animationOrId ? gsap$6.getById(animationOrId) : null;
    },
        _createElement$2 = function _createElement(type, container, cssText) {
      var element = _doc$5.createElementNS ? _doc$5.createElementNS(type === "svg" ? _svgNS : _domNS, type) : _doc$5.createElement(type);

      if (container) {
        if (_isString$2(container)) {
          container = _doc$5.querySelector(container);
        }

        container.appendChild(element);
      }

      if (type === "svg") {
        element.setAttribute("xmlns", _svgNS);
        element.setAttribute("xmlns:xlink", _domNS);
      }

      if (cssText) {
        element.style.cssText = cssText;
      }

      return element;
    },
        _clearSelection = function _clearSelection() {
      if (_doc$5.selection) {
        _doc$5.selection.empty();
      } else if (_win$6.getSelection) {
        _win$6.getSelection().removeAllRanges();
      }
    },
        _getChildrenOf = function _getChildrenOf(timeline, includeTimelines) {
      var a = [],
          cnt = 0,
          Tween = gsap$6.core.Tween,
          tween = timeline._first;

      while (tween) {
        if (tween instanceof Tween) {
          if (tween.vars.id) {
            a[cnt++] = tween;
          }
        } else {
          if (includeTimelines && tween.vars.id) {
            a[cnt++] = tween;
          }

          a = a.concat(_getChildrenOf(tween, includeTimelines));
          cnt = a.length;
        }

        tween = tween._next;
      }

      return a;
    },
        _getClippedDuration = function _getClippedDuration(animation, excludeRootRepeats) {
      var max = 0,
          repeat = Math.max(0, animation._repeat),
          t = animation._first;

      if (!t) {
        max = animation.duration();
      }

      while (t) {
        max = Math.max(max, t.totalDuration() > 999 ? t.endTime(false) : t._start + t._tDur / t._ts);
        t = t._next;
      }

      return !excludeRootRepeats && repeat ? max * (repeat + 1) + animation._rDelay * repeat : max;
    },
        _globalizeTime = function _globalizeTime(animation, rawTime) {
      var a = animation,
          time = arguments.length > 1 ? +rawTime : a.rawTime();

      while (a) {
        time = a._start + time / (a._ts || 1);
        a = a.parent;
      }

      return time;
    },
        _timeToProgress = function _timeToProgress(time, animation, defaultValue, relativeProgress) {
      var add, i, a;

      if (_isString$2(time)) {
        if (time.charAt(1) === "=") {
          add = parseInt(time.charAt(0) + "1", 10) * parseFloat(time.substr(2));

          if (add < 0 && relativeProgress === 0) {
            //if something like inTime:"-=2", we measure it from the END, not the beginning
            relativeProgress = 100;
          }

          time = relativeProgress / 100 * animation.duration() + add;
        } else if (isNaN(time) && animation.labels && animation.labels[time] !== -1) {
          time = animation.labels[time];
        } else if (animation === _recordedRoot) {
          //perhaps they defined an id of an animation, like "myAnimation+=2"
          i = time.indexOf("=");

          if (i > 0) {
            add = parseInt(time.charAt(i - 1) + "1", 10) * parseFloat(time.substr(i + 1));
            time = time.substr(0, i - 1);
          } else {
            add = 0;
          }

          a = gsap$6.getById(time);

          if (a) {
            time = _globalizeTime(a, defaultValue / 100 * a.duration()) + add;
          }
        }
      }

      time = isNaN(time) ? defaultValue : parseFloat(time);
      return Math.min(100, Math.max(0, time / animation.duration() * 100));
    },
        _addedCSS,
        _createRootElement = function _createRootElement(element, minimal, css) {
      if (!_addedCSS) {
        _createElement$2("style", _docEl$1).innerHTML = '.gs-dev-tools{height:51px;bottom:0;left:0;right:0;display:block;position:fixed;overflow:visible;padding:0}.gs-dev-tools *{box-sizing:content-box;visibility:visible}.gs-dev-tools .gs-top{position:relative;z-index:499}.gs-dev-tools .gs-bottom{display:flex;align-items:center;justify-content:space-between;background-color:rgba(0,0,0,.6);height:42px;border-top:1px solid #999;position:relative}.gs-dev-tools .timeline{position:relative;height:8px;margin-left:15px;margin-right:15px;overflow:visible}.gs-dev-tools .progress-bar,.gs-dev-tools .timeline-track{height:8px;width:100%;position:absolute;top:0;left:0}.gs-dev-tools .timeline-track{background-color:#999;opacity:.6}.gs-dev-tools .progress-bar{background-color:#91e600;height:8px;top:0;width:0;pointer-events:none}.gs-dev-tools .seek-bar{width:100%;position:absolute;height:24px;top:-12px;left:0;background-color:transparent}.gs-dev-tools .in-point,.gs-dev-tools .out-point{width:15px;height:26px;position:absolute;top:-18px}.gs-dev-tools .in-point-shape{fill:#6d9900;stroke:rgba(0,0,0,.5);stroke-width:1}.gs-dev-tools .out-point-shape{fill:#994242;stroke:rgba(0,0,0,.5);stroke-width:1}.gs-dev-tools .in-point{transform:translateX(-100%)}.gs-dev-tools .out-point{left:100%}.gs-dev-tools .grab{stroke:rgba(255,255,255,.3);stroke-width:1}.gs-dev-tools .playhead{position:absolute;top:-5px;transform:translate(-50%,0);left:0;border-radius:50%;width:16px;height:16px;border:1px solid #6d9900;background-color:#91e600}.gs-dev-tools .gs-btn-white{fill:#fff}.gs-dev-tools .pause{opacity:0}.gs-dev-tools .select-animation{vertical-align:middle;position:relative;padding:6px 10px}.gs-dev-tools .select-animation-container{flex-grow:4;width:40%}.gs-dev-tools .select-arrow{display:inline-block;width:12px;height:7px;margin:0 7px;transform:translate(0,-2px)}.gs-dev-tools .select-arrow-shape{stroke:rgba(255,255,255,.6);stroke-width:2px;fill:none}.gs-dev-tools .rewind{height:16px;width:19px;padding:10px 4px;min-width:24px}.gs-dev-tools .rewind-path{opacity:.6}.gs-dev-tools .play-pause{width:24px;height:24px;padding:6px 10px;min-width:24px}.gs-dev-tools .ease{width:30px;height:30px;padding:10px;min-width:30px;display:none}.gs-dev-tools .ease-path{fill:none;stroke:rgba(255,255,255,.6);stroke-width:2px}.gs-dev-tools .ease-border{fill:rgba(255,255,255,.25)}.gs-dev-tools .time-scale{font-family:monospace;font-size:18px;text-align:center;color:rgba(255,255,255,.6);padding:4px 4px 4px 0;min-width:30px;margin-left:7px}.gs-dev-tools .loop{width:20px;padding:5px;min-width:20px}.gs-dev-tools .loop-path{fill:rgba(255,255,255,.6)}.gs-dev-tools label span{color:#fff;font-family:monospace;text-decoration:none;font-size:16px;line-height:18px}.gs-dev-tools .time-scale span{color:rgba(255,255,255,.6)}.gs-dev-tools button:focus,.gs-dev-tools select:focus{outline:0}.gs-dev-tools label{position:relative;cursor:pointer}.gs-dev-tools label.locked{text-decoration:none;cursor:auto}.gs-dev-tools label input,.gs-dev-tools label select{position:absolute;left:0;top:0;z-index:1;font:inherit;font-size:inherit;line-height:inherit;height:100%;width:100%;color:#000!important;opacity:0;background:0 0;border:none;padding:0;margin:0;-webkit-appearance:none;-moz-appearance:none;appearance:none;cursor:pointer}.gs-dev-tools label input+.display{position:relative;z-index:2}.gs-dev-tools .gs-bottom-right{vertical-align:middle;display:flex;align-items:center;flex-grow:4;width:40%;justify-content:flex-end}.gs-dev-tools .time-container{font-size:18px;font-family:monospace;color:rgba(255,255,255,.6);margin:0 5px}.gs-dev-tools .logo{width:32px;height:32px;position:relative;top:2px;margin:0 12px}.gs-dev-tools .gs-hit-area{background-color:transparent;width:100%;height:100%;top:0;position:absolute}.gs-dev-tools.minimal{height:auto;display:flex;align-items:stretch}.gs-dev-tools.minimal .gs-top{order:2;flex-grow:4;background-color:rgba(0,0,0,1)}.gs-dev-tools.minimal .gs-bottom{background-color:rgba(0,0,0,1);border-top:none}.gs-dev-tools.minimal .timeline{top:50%;transform:translate(0,-50%)}.gs-dev-tools.minimal .in-point,.gs-dev-tools.minimal .out-point{display:none}.gs-dev-tools.minimal .select-animation-container{display:none}.gs-dev-tools.minimal .rewind{display:none}.gs-dev-tools.minimal .play-pause{width:20px;height:20px;padding:4px 6px;margin-left:14px}.gs-dev-tools.minimal .time-scale{min-width:26px}.gs-dev-tools.minimal .loop{width:18px;min-width:18px;display:none}.gs-dev-tools.minimal .gs-bottom-right{display:none}@media only screen and (max-width:600px){.gs-dev-tools{height:auto;display:flex;align-items:stretch}.gs-dev-tools .gs-top{order:2;flex-grow:4;background-color:rgba(0,0,0,1);height:42px}.gs-dev-tools .gs-bottom{background-color:rgba(0,0,0,1);border-top:none}.gs-dev-tools .timeline{top:50%;transform:translate(0,-50%)}.gs-dev-tools .in-point,.gs-dev-tools .out-point{display:none}.gs-dev-tools .select-animation-container{display:none}.gs-dev-tools .rewind{display:none}.gs-dev-tools .play-pause{width:20px;height:20px;padding:4px 6px;margin-left:14px}.gs-dev-tools .time-scale{min-width:26px}.gs-dev-tools .loop{width:18px;min-width:18px;display:none}.gs-dev-tools .gs-bottom-right{display:none}}';
        _addedCSS = true;
      }

      if (_isString$2(element)) {
        element = _doc$5.querySelector(element);
      }

      var root = _createElement$2("div", element || _docEl$1.getElementsByTagName("body")[0] || _docEl$1);

      root.setAttribute("class", "gs-dev-tools" + (minimal ? " minimal" : ""));
      root.innerHTML = '<div class=gs-hit-area></div><div class=gs-top><div class=timeline><div class=timeline-track></div><div class=progress-bar></div><div class=seek-bar></div><svg class=in-point viewBox="0 0 15 26"xmlns=http://www.w3.org/2000/svg><polygon class=in-point-shape points=".5 .5 14.5 .5 14.5 25.5 .5 17.5"/><polyline class=grab points="5.5 4 5.5 15"/><polyline class=grab points="9.5 4 9.5 17"/></svg> <svg class=out-point viewBox="0 0 15 26"xmlns=http://www.w3.org/2000/svg><polygon class=out-point-shape points=".5 .5 14.5 .5 14.5 17.5 .5 25.5"/><polyline class=grab points="5.5 4 5.5 17"/><polyline class=grab points="9.5 4 9.5 15"/></svg><div class=playhead></div></div></div><div class=gs-bottom><div class=select-animation-container><label class=select-animation><select class=animation-list><option>Global Timeline<option>myTimeline</select><nobr><span class="display animation-label">Global Timeline</span> <svg class=select-arrow viewBox="0 0 12.05 6.73"xmlns=http://www.w3.org/2000/svg><polyline class=select-arrow-shape points="0.35 0.35 6.03 6.03 11.7 0.35"/></svg></nobr></label></div><svg class=rewind viewBox="0 0 12 15.38"xmlns=http://www.w3.org/2000/svg><path d=M0,.38H2v15H0Zm2,7,10,7.36V0Z class="gs-btn-white rewind-path"/></svg> <svg class=play-pause viewBox="0 0 20.97 25.67"xmlns=http://www.w3.org/2000/svg><g class=play><path d="M8,4.88 C8,10.18 8,15.48 8,20.79 5.33,22.41 2.66,24.04 0,25.67 0,17.11 0,8.55 0,0 2.66,1.62 5.33,3.25 8,4.88"class="gs-btn-white play-1"style=stroke:#fff;stroke-width:.6px /><path d="M14.485,8.855 C16.64,10.18 18.8,11.5 20.97,12.83 16.64,15.48 12.32,18.13 8,20.79 8,15.48 8,10.18 8,4.88 10.16,6.2 12.32,7.53 14.48,8.85"class="gs-btn-white play-2"style=stroke:#fff;stroke-width:.6px /></g></svg> <svg class=loop viewBox="0 0 29 25.38"xmlns=http://www.w3.org/2000/svg><path d=M27.44,5.44,20.19,0V3.06H9.06A9.31,9.31,0,0,0,0,12.41,9.74,9.74,0,0,0,.69,16l3.06-2.23a6,6,0,0,1-.12-1.22,5.49,5.49,0,0,1,5.43-5.5H20.19v3.81Z class=loop-path /><path d=M25.25,11.54a5.18,5.18,0,0,1,.12,1.12,5.41,5.41,0,0,1-5.43,5.41H9.19V14.5L1.94,19.94l7.25,5.44V22.06H19.94A9.2,9.2,0,0,0,29,12.84a9.42,9.42,0,0,0-.68-3.53Z class=loop-path /></svg> <svg class=ease viewBox="0 0 25.67 25.67"xmlns=http://www.w3.org/2000/svg><path d=M.48,25.12c1.74-3.57,4.28-12.6,8.8-10.7s4.75,1.43,6.5-1.11S19.89,1.19,25.2.55 class=ease-path /><path d=M24.67,1V24.67H1V1H24.67m1-1H0V25.67H25.67V0Z class=ease-border /></svg><label class=time-scale><select><option value=10>10x<option value=5>5x<option value=2>2x<option value=1 selected>1x<option value=0.5>0.5x<option value=0.25>0.25x<option value=0.1>0.1x</select><span class="display time-scale-label">1x</span></label><div class=gs-bottom-right><div class=time-container><span class=time>0.00</span> / <span class=duration>0.00</span></div><a href="https://greensock.com/docs/v3/Plugins/GSDevTools?source=GSDevTools"target=_blank title=Docs><svg class=logo viewBox="0 0 100 100"xmlns=http://www.w3.org/2000/svg><path d="M60 15.4c-.3-.4-.5-.6-.5-.7.1-.6.2-1 .2-1.7v-.4c.6.6 1.3 1.3 1.8 1.7.2.2.5.3.8.3.2 0 .3 0 .5.1h1.6c.8 0 1.6.1 2 0 .1 0 .2 0 .3-.1.6-.3 1.4-1 2.1-1.6 0 .6.1 1.2.1 1.7v1.5c0 .3 0 .5.1.7-.1.1-.2.1-.4.2-.7.4-1.7 1-2.3.9-.5-.1-1.5-.3-2.6-.7-1.2-.3-2.4-.8-3.2-1.2 0 0-.1 0-.1-.1s-.2-.4-.4-.6zm24.6 21.9c-.5-1.7-1.9-2-4.2-.7.9-1.5 2.1-1.5 2.3-2.1.9-2.5-.6-4.6-1.2-5.3.7-1.8 1.4-4.5-1-6.8-1-1-2.4-1.2-3.6-1.1 1.8 1.7 3.4 4.4 2.5 7.2-.1.3-.9.7-1.7 1 0 0 .4 2-.3 3.5-.3.6-.8 1.5-1.3 2.6 1 .9 1.6 1 3 1.3-.9.1-1.2.4-1.2.5-.7 3 1 3.4 1.4 4.8 0 .1 0 .2.1.3v.4c-.3.3-1.4.5-2.5.5s-1.8 1-1.8 1c-.2.1-.3.3-.4.4v1c0 .1 0 .4.1.6.1.5.3 1.3.4 1.8.9.6 1.4.9 2.2 1.1.5.1 1 .2 1.5.1.3-.1.7-.3 1-.7 1.5-1.7 1.9-3.2 2.2-4.1 0-.1 0-.2.1-.2 0 .1.1.1.1.2 0 0 .1-.1.1-.2l.1-.1c1.3-1.6 2.9-4.5 2.1-7zM74.3 49.9c-.1-.3-.1-.7-.2-1.1v-.2c-.1-.2-.1-.4-.2-.6 0-.1-.1-.3-.1-.5s-.1-.5-.1-.7v-.1c0-.2-.1-.5-.1-.7-.1-.3-.1-.7-.2-1.1v-.1c0-.2 0-.3-.1-.5v-.9c0-.1 0-.2.1-.3V43h-.3c-1.1.1-3.8.4-6.7.2-1.2-.1-2.4-.3-3.6-.6-1-.3-1.8-.5-2.3-.7-1.2-.4-1.6-.6-1.8-.7 0 .2-.1.4-.1.7 0 .3-.1.5-.1.8-.1.2-.1.4-.2.6l.1.1c.5.5 1.5 1.3 1.5 2.1v.2c-.1.4-.4.5-.8.9-.1.1-.6.7-1.1 1.1l-.6.6c-.1 0-.1.1-.2.1-.1.1-.3.2-.4.3-.2.1-.7.5-.8.6-.1.1-.2.1-.3.1-2.8 8.8-2.2 13.5-1.5 16.1.1.5.3 1 .4 1.3-.4.5-.8 1-1.2 1.4-1.2 1.5-2 2.6-2.6 4.2 0 .1 0 .1-.1.2 0 .1 0 .2-.1.2-.2.5-.3 1-.4 1.5-.6 2.3-.8 4.5-.9 6.6-.1 2.4-.2 4.6-.5 6.9.7.3 3.1.9 4.7.6.2-.1 0-3.9.6-5.7l.6-1.5c.4-.9.9-1.9 1.3-3.1.3-.7.5-1.5.7-2.4.1-.5.2-1 .3-1.6V74v-.1c.1-.6.1-1.3.1-2 0-.2-.7.3-1.1.9.3-1.8 1.3-2.1 2-3.2.3-.5.6-1.1.6-2 2.5-1.7 4-3.7 5-5.7.2-.4.4-.9.6-1.4.3-.8.5-1.6.7-2.4.3-1.4.8-3.2 1.2-4.8v-.1c.4-1.2.8-2.2 1.2-2.6-.2.9-.4 1.7-.6 2.5v.2c-.6 3.5-.7 6.2-2 9.2 1 2.6 1.9 3.9 2 7.6-2 0-3.2 1.6-3.7 3.2 1.2.3 3.9.7 8.3.1h.3c.1-.5.3-1.1.5-1.5.3-.8.5-1.5.6-2.2.2-1.3.1-2.4 0-3.2 3.9-3.7 2.6-11 1.6-16.6zm.3-15.1c.1-.3.2-.6.4-.8.2-.3.3-.7.5-1 .1-.3.3-.6.4-.9.5-1.5.4-2.8.3-3.5-.1 0-.1-.1-.2-.1-.5-.2-.9-.4-1.4-.6-.1 0-.2-.1-.3-.1-3.8-1.2-7.9-.9-11.9.1-1 .2-1.9.5-2.9.1-2.3-.8-3.9-1.9-4.6-2.8l-.2-.2c-.1.2-.2.4-.4.6.2 2.3-.5 3.9-1.4 5.1.9 1.2 2.6 2.8 3.6 3.4 1.1.6 1.7.7 3.4.4-.6.7-1.1 1-1.9 1.4.1.7.2 2 .5 3.4.3.3 1.2.8 2.3 1.3.5.3 1.1.5 1.7.7.8.3 1.7.6 2.4.8.1 0 .2.1.3.1.5.1 1.1.2 1.8.2h.9c2.1 0 4.5-.2 5.4-.3h.1c-.1-2.7.2-4.6.7-6.2.2-.3.4-.7.5-1.1zm-23.2 9.3v.2c-.3 1.7.5 2.4 1.9 3.4.6.5 0 .5.5.8.3.2.7.3 1 .3.3 0 .5 0 .8-.1.2-.1.4-.3.6-.5.1-.1.3-.2.5-.4.3-.2.6-.5.7-.6.1-.1.2-.1.3-.2.2-.2.5-.5.6-.7.2-.2.4-.5.5-.7 0-.1.1-.1.1-.1v-.1c.1-.4-.3-.8-.8-1.3-.2-.2-.4-.3-.5-.5-.3-.3-.6-.5-1-.7-.9-.5-1.9-.7-3-.7l-.3-.3c-2.2-2.5-3.2-4.8-3.9-6.5-.9-2.1-1.9-3.3-3.9-4.9 1 .4 1.8.8 2.3 1.1.5.4 1.3.4 1.9.2.2-.1.5-.2.7-.3.2-.1.4-.2.6-.4 1.6-1.3 2.5-3.8 2.6-5.6v-.1c.2-.3.6-1.1.8-1.4l.1.1c.1.1.3.2.6.5.1 0 .1.1.2.1.1.1.2.1.2.2.8.6 1.9 1.3 2.6 1.7 1.4.7 2.3.7 5.3-.1 2.2-.6 4.8-.8 6.8-.8 1.4 0 2.7.3 4 .7.2.1.4.1.5.2.3.1.6.2.9.4 0 0 .1 0 .1.1.8.4 2.1 1.2 2.5-.3.1-2-.6-3.9-1.6-5.3 0 0-.1 0-.1-.1-.1-.1-.2-.2-.4-.3-.1-.1-.2-.1-.3-.2-.1-.1-.2-.2-.4-.2-.6-.4-1.2-.8-1.6-.9-.1-.1-.3-.1-.4-.2h-.1-.1c-.1 0-.3-.1-.4-.1-.1 0-.1 0-.2-.1h-.1l-.2-.4c-.2-.1-.4-.2-.5-.2h-.6c-.3 0-.5.1-.7.1-.7.1-1.2.3-1.7.4-.2 0-.3.1-.5.1-.5.1-1 .2-1.6.2-.4 0-.9-.1-1.5-.2-.4-.1-.8-.2-1.1-.3-.2-.1-.4-.1-.6-.2-.6-.2-1.1-.3-1.7-.4h-.2-1.8c-.3 0-.6.1-1 .1H57.9c-.8 0-1.5 0-2.3-.1-.2 0-.5-.1-.7-.1-.5-.1-.9-.2-1.3-.4-.2-.1-.3-.1-.4-.2-.1 0-.2 0-.2-.1-.3-.1-.6-.1-.9-.1H51h-.1c-.4 0-.9.1-1.4.2-1.1.2-2.1.6-3 1.3-.3.2-.6.5-.8.8-.1.1-.2.2-.2.3-.4.6-.8 1.2-.9 2 0 .2-.1.4-.1.6 0 .2 1.7.7 2.3 2.8-.8-1.2-2.3-2.5-4.1-1.4-1.5 1-1.1 3.1-2.4 5.4-.3.5-.6.9-1 1.4-.8 1-.7 2.1.2 4.4 1.4 3.4 7.6 5.3 11.5 8.3l.4.4zm8.7-36.3c0 .6.1 1 .2 1.6v.1c0 .3.1.6.1.9.1 1.2.4 2 1 2.9 0 .1.1.1.1.2.3.2.5.3.8.4 1.1.2 3.1.3 4.2 0 .2-.1.5-.3.7-.5.4-.4.7-1.1.9-1.7.1-.7.3-1.3.4-1.8 0-.2.1-.4.1-.5v-.1c0-.2 0-.3.1-.5.2-.7.2-2.4.3-2.8.1-.7 0-1.8-.1-2.5 0-.2-.1-.4-.1-.5v-.1c-.2-.5-1.4-1.4-4.3-1.4-3.1 0-4 1-4.1 1.5v.1c0 .1 0 .3-.1.5-.1.4-.2 1.4-.2 1.9v2.3zm-6 88.6c0-.1-.1-.2-.1-.3-.7-1.5-1.1-3.5-1.3-4.6.4.1.7.6.8.3.2-.5-.4-1.5-.5-2.2v-.1c-.5-.5-4-.5-3.7-.3-.4.8-1 .6-1.3 2.1-.1.7.8.1 1.7.1-1.4.9-3 2.1-3.4 3.2-.1.1-.1.2-.1.3 0 .2-.1.4-.1.5-.1 1.2.5 1.6 2 2.4H48.4c1.4.3 3 .3 4.3.3 1.2-.2 1.6-.7 1.6-1.4-.2-.1-.2-.2-.2-.3z"style=fill:#efefef /><path d="M56.1 36.5c.3 1.4.5 2.4.8 4.2h-.2c-.1.5-.1.9-.1 1.3-1-.4-2.2-.5-2.6-.5-3.7-4.4-2.9-6.1-4.4-8.3.4-.2 1-.4 1.5-.8 1.6 1.9 3.3 3 5 4.1zm-1.7 13.2s-1.4 0-2.3-1c0 0-.1-.5.1-.7 0 0-1.2-1-1.5-1.7-.2-.5-.3-1.1-.2-1.6-4.4-3.7-10.9-4.2-12.9-9.1-.5-1.2-1.3-2.9-.9-3.9-.3.1-.5.2-.8.3-2.9.9-11.7 5.3-17.9 8.8 1.6 1.7 2.6 4.3 3.2 7.2l.3 1.5c.1.5.1 1 .2 1.5.1 1.4.4 2.7.8 3.9.2.8.6 1.5.9 2.2.6 1 1.2 1.9 2.1 2.6.6.5 1.2.9 1.9 1.3 2.1 1.1 5 1.6 8.6 1.5H37.9c.5 0 1 .1 1.5.1h.1c.4.1.9.1 1.3.2h.2c.4.1.9.2 1.3.4h.1c.4.1.8.3 1.1.5h.1c.4.2.7.4 1.1.6h.1c.7.4 1.3.9 1.9 1.5l.1.1c.6.5 1.1 1.1 1.5 1.8 0 .1.1.1.1.2s.1.1.1.2c.4.6 1.2 1.1 1.9 1.3.7-.9 1.5-1.8 2.2-2.8-1.6-6 0-11.7 1.8-16.9zm-26-15.9c5-2.4 9-4.1 9.9-4.5.3-.6.6-1.4.9-2.6.1-.3.2-.5.3-.8 1-2.7 2.7-2.8 3.5-3v-.2c.1-1.1.5-2 1-2.8-8.8 2.5-18 5.5-28 11.7-.1.1-.2.2-.4.2C11.3 34.5 3 40.3 1.3 51c2.4-2.7 6-5.6 10.5-8.5.1-.1.3-.2.5-.3.2-.1.5-.3.7-.4 1.2-.7 2.4-1.4 3.6-2.2 2.2-1.2 4.5-2.4 6.7-3.5 1.8-.8 3.5-1.6 5.1-2.3zm54.9 61.3l-.3-.3c-.8-.6-4.1-1.2-5.5-2.3-.4-.3-1.1-.7-1.7-1.1-1.6-.9-3.5-1.8-3.5-2.1v-.1c-.2-1.7-.2-7 .1-8.8.3-1.8.7-4.4.8-5.1.1-.6.5-1.2.1-1.2h-.4c-.2 0-.4.1-.8.1-1.5.3-4.3.6-6.6.4-.9-.1-1.6-.2-2-.3-.5-.1-.7-.2-.9-.3H62.3c-.4.5 0 2.7.6 4.8.3 1.1.8 2 1.2 3 .3.8.6 1.8.8 3.1 0 .2.1.4.1.7.2 2.8.3 3.6-.2 4.9-.1.3-.3.6-.4 1-.4.9-.7 1.7-.6 2.3 0 .2.1.4.1.5.2.4.6.7 1.2.8.2 0 .3.1.5.1.3 0 .6.1.9.1 3.4 0 5.2 0 8.6.4 2.5.4 3.9.6 5.1.5.4 0 .9-.1 1.4-.1 1.2-.2 1.8-.5 1.9-.9-.1.2-.1.1-.2-.1zM60.2 16.4zm-.5 1.7zm3.8.5c.1 0 .3.1.5.1.4.1.7.2 1.2.3.3.1.6.1.9.1h1.3c.3-.1.7-.1 1-.2.7-.2 1.5-.4 2.7-.6h.3c.3 0 .6.1.9.3.1.1.2.1.4.2.3.2.8.2 1.2.4h.1c.1 0 .1.1.2.1.6.3 1.3.7 1.9 1.1l.3.3c.9-.1 1.6-.2 2.1-.2h.1c-.2-.4-.3-1.3-1.8-.6-.6-.7-.8-1.3-2.1-.9-.1-.2-.2-.3-.3-.4l-.1-.1c-.1-.1-.2-.3-.3-.4 0-.1-.1-.1-.1-.2-.2-.3-.5-.5-.9-.7-.7-.4-1.5-.6-2.3-.5-.2 0-.4.1-.6.2-.1 0-.2.1-.2.1-.1 0-.2.1-.3.2-.5.3-1.3.8-2.1 1-.1 0-.1 0-.2.1-.2 0-.4.1-.5.1H66.5h-.1c-.4-.1-1.1-.2-2-.5-.1 0-.2-.1-.3-.1-.9-.2-1.8-.5-2.7-.8-.3-.1-.7-.2-1-.3-.1 0-.1 0-.2-.1h-.1s-.1 0-.1-.1c-.3-.3-.7-.6-1.3-.8-.5-.2-1.2-.4-2.1-.5-.2 0-.5 0-.7.1-.4.2-.8.6-1.2.9.1.1.3.3.4.5.1.2.2.4.3.7l-.6-.6c-.5-.4-1.1-.8-1.7-.9-.8-.2-1.4.4-2.3.9 1 0 1.8.1 2.5.4.1 0 .1 0 .2.1h.1c.1 0 .2.1.3.1.9.4 1.8.6 2.7.6h1.3c.5 0 .8-.1 1.1-.1.1 0 .4 0 .7-.1h2.2c.4.4.9.6 1.6.8z"style=fill:#88ce02 /><path d="M100 51.8c0-19.5-12.5-36.1-30-42.1.1-1.2.2-2.4.3-3.1.1-1.5.2-3.9-.5-4.9-1.6-2.3-9.1-2.1-10.5-.1-.4.6-.7 3.6-.6 5.9-1.1-.1-2.2-.1-3.3-.1-16.5 0-30.9 9-38.6 22.3-2.4 1.4-4.7 2.8-6.1 4C5.4 38 2.2 43.2 1 47c-1.6 4.7-1.1 7.6.4 5.8 1.2-1.5 6.6-5.9 10.1-8.2-.4 2.3-.6 4.8-.6 7.2 0 21 14.5 38.5 34 43.3-.1 1.1.1 2 .7 2.6.9.8 3.2 2 6.4 1.6 2.9-.3 3.5-.5 3.2-2.9h.2c2.7 0 5.3-.2 7.8-.7.1.1.2.2.4.3 1.5 1 7.1.8 9.6.7s6.2.9 8.6.5c2.9-.5 3.4-2.3 1.6-3.2-1.5-.8-3.8-1.3-6.7-3.1C90.6 83.4 100 68.7 100 51.8zM60.1 5.5c0-.5.1-1.5.2-2.1 0-.2 0-.4.1-.5v-.1c.1-.5 1-1.5 4.1-1.5 2.9 0 4.2.9 4.3 1.4v.1c0 .1 0 .3.1.5.1.8.2 1.9.1 2.7 0 .5-.1 2.1-.2 2.9 0 .1 0 .3-.1.5v.1c0 .2-.1.3-.1.5-.1.5-.2 1.1-.4 1.8-.1.6-.5 1.2-.9 1.7-.2.3-.5.5-.7.5-1.1.3-3.1.3-4.2 0-.3-.1-.5-.2-.8-.4 0-.1-.1-.1-.1-.2-.6-.9-.9-1.7-1-2.9 0-.4-.1-.6-.1-.9v-.1c-.1-.6-.2-1-.2-1.6v-.3c-.1-1.3-.1-2.1-.1-2.1zm-.4 7.5v-.4c.6.6 1.3 1.3 1.8 1.7.2.2.5.3.8.3.2 0 .3 0 .5.1h1.6c.8 0 1.6.1 2 0 .1 0 .2 0 .3-.1.6-.3 1.4-1 2.1-1.6 0 .6.1 1.2.1 1.7v1.5c0 .3 0 .5.1.7-.1.1-.2.1-.4.2-.7.4-1.7 1-2.3.9-.5-.1-1.5-.3-2.6-.7-1.2-.3-2.4-.8-3.2-1.2 0 0-.1 0-.1-.1-.2-.3-.4-.5-.6-.7-.3-.4-.5-.6-.5-.7.3-.4.4-.9.4-1.6zm.5 3.4zm-7.3-.3c.6.1 1.2.5 1.7.9.2.2.5.4.6.6-.1-.2-.2-.5-.3-.7-.1-.2-.3-.4-.4-.5.4-.3.8-.7 1.2-.9.2-.1.4-.1.7-.1.9.1 1.6.2 2.1.5.6.2 1 .5 1.3.8 0 0 .1 0 .1.1h.1c.1 0 .1 0 .2.1.3.1.6.2 1 .3.9.3 1.9.6 2.7.8.1 0 .2.1.3.1.9.2 1.6.4 2 .5h.4c.2 0 .4 0 .5-.1.1 0 .1 0 .2-.1.7-.2 1.5-.7 2.1-1 .1-.1.2-.1.3-.2.1 0 .2-.1.2-.1.2-.1.4-.2.6-.2.8-.2 1.7.1 2.3.5.3.2.6.4.9.7 0 .1.1.1.1.2.1.2.2.3.3.4l.1.1c.1.1.2.2.3.4 1.3-.4 1.5.2 2.1.9 1.6-.7 1.7.2 1.8.6h-.1c-.5 0-1.2 0-2.1.2l-.3-.3c-.5-.4-1.2-.8-1.9-1.1-.1 0-.1-.1-.2-.1h-.1c-.4-.2-.8-.2-1.2-.4-.1-.1-.2-.1-.4-.2-.3-.1-.6-.3-.9-.3h-.3c-1.2.1-2 .4-2.7.6-.3.1-.7.2-1 .2-.4.1-.8.1-1.3 0-.3 0-.6-.1-.9-.1-.5-.1-.8-.2-1.2-.3-.2 0-.3-.1-.5-.1h-.1c-.6-.2-1.2-.3-1.8-.4h-.1-2.1c-.4.1-.6.1-.7.1-.3 0-.7.1-1.1.1h-1.3c-.9 0-1.9-.2-2.7-.6-.1 0-.2-.1-.3-.1H53c-.1 0-.1 0-.2-.1-.7-.3-1.6-.4-2.5-.4 1.2-.8 1.8-1.4 2.6-1.3zm6.8 2zm-15.2 4.1c.1-.7.4-1.4.9-2 .1-.1.2-.2.2-.3l.8-.8c.9-.6 1.9-1.1 3-1.3.5-.1 1-.2 1.4-.2H52c.3 0 .6.1.9.1.1 0 .2 0 .2.1.1.1.2.1.4.2.4.2.8.3 1.3.4.2 0 .5.1.7.1.7.1 1.5.1 2.3.1H58.7c.4 0 .7-.1 1-.1H61.7c.6.1 1.1.2 1.7.4.2 0 .4.1.6.2.3.1.7.2 1.1.3.6.1 1.1.2 1.5.2.6 0 1.1-.1 1.6-.2.2 0 .3-.1.5-.1.5-.1 1-.3 1.7-.4.2 0 .5-.1.7-.1h.6c.2 0 .4.1.5.2l.1.1h.1c.1 0 .1 0 .2.1.2.1.3.1.4.1h.2c.1.1.3.1.4.2.4.2 1 .6 1.6.9.1.1.2.2.4.2.1.1.2.1.3.2.2.1.3.3.4.3l.1.1c1.1 1.4 1.8 3.3 1.6 5.3-.3 1.5-1.6.7-2.5.3 0 0-.1 0-.1-.1-.3-.1-.6-.2-.9-.4-.2-.1-.4-.1-.5-.2-1.2-.4-2.5-.7-4-.7-2 0-4.6.1-6.8.8-3 .8-4 .8-5.3.1-.8-.4-1.8-1.1-2.6-1.7-.1-.1-.2-.1-.2-.2-.1-.1-.1-.1-.2-.1-.3-.2-.6-.4-.6-.5l-.1-.1c-.2.3-.6 1-.8 1.4v.1c-.1 1.7-1 4.2-2.6 5.6-.2.1-.4.3-.6.4-.2.1-.5.2-.7.3-.7.2-1.4.2-1.9-.2-.5-.3-1.3-.7-2.3-1.1 2 1.6 3 2.8 3.9 4.9.7 1.7 1.7 4 3.9 6.5l.3.3c1.1 0 2.1.2 3 .7.4.2.7.4 1 .7.2.2.4.3.5.5.5.4.9.8.8 1.3v.1s0 .1-.1.1c-.1.2-.3.5-.5.7-.1.1-.4.4-.6.7-.1.1-.2.2-.3.2-.1.1-.4.3-.7.6-.2.2-.4.3-.5.4-.2.1-.4.4-.6.5-.3.1-.5.2-.8.1-.3 0-.7-.2-1-.3-.5-.3.1-.3-.5-.8-1.4-1-2.2-1.7-1.9-3.4v-.2c-.2-.1-.3-.3-.5-.4-3.9-3-10.1-4.9-11.5-8.3-.9-2.3-1-3.4-.2-4.4.4-.5.8-1 1-1.4 1.3-2.3.9-4.4 2.4-5.4 1.8-1.2 3.3.2 4.1 1.4-.5-2.1-2.3-2.6-2.3-2.8.3.1.3-.1.3-.3zm29 20s-.1 0 0 0c-.1 0-.1 0 0 0-.9.1-3.3.3-5.4.3h-.9c-.7 0-1.3-.1-1.8-.2-.1 0-.2 0-.3-.1-.7-.2-1.6-.5-2.4-.8-.6-.2-1.2-.5-1.7-.7-1.1-.5-2.1-1.1-2.3-1.3-.5-1.4-.7-2.7-.7-3.4.8-.4 1.3-.7 1.9-1.4-1.7.3-2.4.2-3.4-.4-1-.5-2.6-2.2-3.6-3.4 1-1.2 1.7-2.9 1.4-5.1.1-.2.3-.4.4-.6 0 .1.1.1.2.2.7.9 2.4 2 4.6 2.8 1.1.4 2 .1 2.9-.1 4-1 8.1-1.3 11.9-.1.1 0 .2.1.3.1.5.2.9.4 1.4.6.1 0 .1.1.2.1.1.7.2 2-.3 3.5-.1.3-.2.6-.4.9-.2.3-.3.6-.5 1-.1.3-.2.5-.4.8-.2.4-.3.8-.5 1.3-.4 1.4-.7 3.4-.6 6zm-23.9-9c.4-.2 1-.4 1.5-.8 1.6 1.8 3.3 3 5 4.1.3 1.4.5 2.4.8 4.2h-.2c-.1.5-.1.9-.1 1.3-1-.4-2.2-.5-2.6-.5-3.7-4.3-3-6-4.4-8.3zm-32.9 6.5c-1.3.7-2.5 1.4-3.6 2.2-.2.1-.5.3-.7.4-.1.1-.3.2-.5.3-4.5 2.9-8.1 5.8-10.5 8.5 1.7-10.8 10-16.5 14.3-19.2.1-.1.2-.2.4-.2 10-6.2 19.2-9.2 28-11.7-.5.8-.9 1.7-1 2.8v.2c-.8.1-2.5.2-3.5 3-.1.2-.2.5-.3.8-.3 1.2-.6 2-.9 2.6-.9.4-5 2.2-9.9 4.5-1.6.8-3.3 1.6-5 2.4-2.3 1-4.6 2.2-6.8 3.4zm28 24.8s0-.1 0 0c-.4-.3-.8-.5-1.2-.7h-.1c-.4-.2-.7-.3-1.1-.5h-.1c-.4-.1-.8-.3-1.3-.4h-.2c-.4-.1-.8-.2-1.3-.2h-.1c-.5-.1-1-.1-1.5-.1H35.9c-3.7.1-6.5-.4-8.6-1.5-.7-.4-1.4-.8-1.9-1.3-.9-.7-1.5-1.6-2.1-2.6-.4-.7-.7-1.4-.9-2.2-.4-1.2-.6-2.5-.8-3.9 0-.5-.1-1-.2-1.5l-.3-1.5c-.6-2.9-1.6-5.5-3.2-7.2 6.3-3.5 15-7.9 17.8-8.8.3-.1.6-.2.8-.3-.3 1.1.4 2.7.9 3.9 2.1 4.9 8.6 5.4 12.9 9.1 0 .5 0 1.1.2 1.6.5.6 1.7 1.6 1.7 1.6-.2.2-.1.7-.1.7.9 1 2.3 1 2.3 1-1.8 5.2-3.4 10.9-1.9 16.9-.7 1-1.5 1.8-2.2 2.8-.7-.2-1.4-.6-1.9-1.3 0-.1-.1-.1-.1-.2s-.1-.1-.1-.2l-1.5-1.8-.1-.1c-.5-.4-1.2-.9-1.9-1.3zm7.9 33.6c-1.3.1-2.9 0-4.3-.3h-.2-.1c-1.5-.8-2.1-1.2-2-2.4 0-.2 0-.3.1-.5 0-.1.1-.2.1-.3.5-1.1 2.1-2.2 3.4-3.2-.8 0-1.8.7-1.7-.1.2-1.5.9-1.3 1.3-2.1-.2-.3 3.3-.2 3.8.3v.1c0 .7.7 1.7.5 2.2-.1.3-.4-.2-.8-.3.2 1.1.6 3.1 1.3 4.6.1.1.1.2.1.3 0 .1.1.2.1.3 0 .7-.4 1.2-1.6 1.4zM59 67.7c0 .9-.3 1.6-.6 2-.7 1.1-1.7 1.4-2 3.2.4-.6 1.1-1.1 1.1-.9 0 .8-.1 1.4-.1 2v.2c-.1.6-.2 1.1-.3 1.6-.2.9-.5 1.7-.7 2.4-.4 1.2-.9 2.1-1.3 3.1l-.6 1.5c-.6 1.7-.4 5.6-.6 5.7-1.6.3-4.1-.3-4.7-.6.3-2.2.4-4.5.5-6.9.1-2.1.3-4.3.9-6.6.1-.5.3-1 .4-1.5 0-.1 0-.2.1-.2 0-.1 0-.1.1-.2.5-1.6 1.4-2.7 2.6-4.2.4-.4.7-.9 1.2-1.4-.1-.4-.2-.8-.4-1.3-.7-2.6-1.3-7.3 1.5-16.1.1 0 .2-.1.3-.1.2-.1.7-.5.8-.6.1-.1.3-.2.4-.3.1 0 .1-.1.2-.1l.6-.6 1.1-1.1c.4-.4.7-.5.8-.9v-.2c0-.8-1.1-1.5-1.5-2.1l-.1-.1c.1-.2.1-.4.2-.6 0-.2.1-.5.1-.8 0-.2.1-.5.1-.7.1.1.6.4 1.8.7.6.2 1.3.4 2.3.7 1.1.3 2.4.5 3.6.6 2.9.2 5.6 0 6.7-.2h.3v.1c0 .1 0 .2-.1.3v.9c0 .2 0 .3.1.5v.1c0 .4.1.7.2 1.1 0 .3.1.5.1.7v.1c0 .3.1.5.1.7 0 .2.1.3.1.5.1.2.1.4.2.6v.2c.1.4.2.8.2 1.1 1 5.7 2.3 12.9-1.1 16.7.2.8.3 1.9 0 3.2-.1.7-.3 1.4-.6 2.2-.2.5-.3 1-.5 1.5h-.3c-4.5.6-7.1.2-8.3-.1.5-1.6 1.7-3.3 3.7-3.2-.1-3.7-1.1-5-2-7.6 1.3-3 1.3-5.7 2-9.2v-.2c.2-.8.3-1.6.6-2.5-.4.5-.8 1.5-1.2 2.6v.1c-.5 1.5-.9 3.4-1.2 4.8-.2.8-.4 1.6-.7 2.4-.2.5-.4.9-.6 1.4-1.5 1.9-3 3.9-5.5 5.6zm18.5 24.9c1.5 1.1 4.7 1.8 5.5 2.3l.3.3c.1.1.1.2.1.3-.1.4-.7.7-1.9.9-.5.1-.9.1-1.4.1-1.3 0-2.6-.2-5.1-.5-3.4-.5-5.2-.4-8.6-.4-.3 0-.6 0-.9-.1-.2 0-.4-.1-.5-.1-.6-.2-1-.5-1.2-.8-.1-.2-.1-.3-.1-.5-.1-.7.2-1.5.6-2.3.2-.4.3-.7.4-1 .5-1.3.4-2.1.2-4.9 0-.2-.1-.4-.1-.7-.2-1.3-.5-2.3-.8-3.1-.4-1.1-.9-1.9-1.2-3-.6-2.1-1-4.3-.6-4.8H62.5c.2.1.5.2.9.3.5.1 1.1.2 2 .3 2.2.2 5.1-.2 6.6-.4.3-.1.6-.1.8-.1h.4c.4 0 .1.6-.1 1.2-.1.7-.5 3.3-.8 5.1-.3 1.8-.2 7.1-.1 8.8v.1c0 .3 1.9 1.2 3.5 2.1.7.2 1.4.5 1.8.9zm4.8-48.2c0 .1 0 .1 0 0-.1.1-.2.2-.2.3 0-.1-.1-.1-.1-.2 0 .1 0 .2-.1.2-.2.9-.6 2.4-2.2 4.1-.4.4-.7.6-1 .7-.5.1-.9 0-1.5-.1-.9-.2-1.3-.6-2.2-1.1-.1-.6-.3-1.3-.4-1.8 0-.3-.1-.5-.1-.6v-1l.4-.4s.7-1 1.8-1 2.2-.2 2.5-.5v-.1-.3c0-.1 0-.2-.1-.3-.4-1.4-2.1-1.8-1.4-4.8 0-.2.3-.5 1.2-.5-1.4-.3-2-.4-3-1.3.5-1.1 1-1.9 1.3-2.6.8-1.5.3-3.5.3-3.5.8-.3 1.6-.7 1.7-1 .9-2.8-.7-5.5-2.5-7.2 1.2-.1 2.6.1 3.6 1.1 2.4 2.4 1.8 5 1 6.8.6.7 2.1 2.9 1.2 5.3-.2.6-1.4.6-2.3 2.1 2.3-1.3 3.7-1 4.2.7 1 2.4-.6 5.3-2.1 7z"/><path d="M22 53.4v-.2c0-.2-.1-.5-.2-.9s-.1-.8-.2-1.3c-.5-4.7-1.9-9.4-4.9-11.3 3.7-2 16.8-8.5 21.9-10.5 2.9-1.2.8-.4-.2 1.4-.8 1.4-.3 2.9-.5 3.2-.6.8-12.6 10.5-15.9 19.6zm32.2-2.3c-3.4 3.8-12 11-18.2 11.4 8.7-.2 12.2 4.1 14.7 9.7 2.6-5.2 2.7-10.3 2.6-16.1 0-2.6 1.8-6 .9-5zm5.3-23L54.3 24s-1.1 3.1-1 4.6c.1 1.6-1.8 2.7-.9 3.6.9.9 3.2 2.5 4 3.4.7.9 1.1 7.1 1.1 7.1l2.2 2.7s1-1.8 1.1-6.3c.2-5.4-2.9-7.1-3.3-8.6-.4-1.4.6-2.9 2-2.4zm3.1 45.6l3.9.3s1.2-2.2 2.1-3.5c.9-1.4.4-1.6 0-4.6-.4-3-1.4-9.3-1.2-13.6l-3.1 10.2s1.8 5.6 1.6 6.4c-.1.8-3.3 4.8-3.3 4.8zm5 18.8c-1.1 0-2.5-.4-3.5-.8l-1 .3.2 4s5.2.7 4.6-.4c-.6-1.2-.3-3.1-.3-3.1zm12 .6c-1 0-.3.2.4 1.2.8 1 .1 2-.8 2.3l3.2.5 1.9-1.7c.1 0-3.7-2.3-4.7-2.3zM73 76c-1.6.5-4.2.8-5.9.8-1.7.1-3.7-.1-5-.5v1.4s1.2.5 5.4.5c3.5.1 5.7-.8 5.7-.8l.9-.8c-.1.1.5-1.1-1.1-.6zm-.2 3.1c-1.6.6-3.9.6-5.6.7-1.7.1-3.7-.1-5-.5l.1 1.4s.7.3 4.9.4c3.5.1 5.7-.7 5.7-.7l.3-.5c-.1-.1.3-1-.4-.8zm5.9-42.7c-.9-.8-1.4-2.4-1.5-3.3l-1.9 2.5.7 1.2s2.5.1 2.8.1c.4 0 .3-.1-.1-.5zM69 14.7c.6-.7.2-2.7.2-2.7L66 14.6l-4.4-.8-.5-1.3-1.3-.1c.8 1.8 1.8 2.5 3.3 3.1.9.4 4.5.9 5.9-.8z"style=opacity:.4;fill-rule:evenodd;clip-rule:evenodd /></svg></a></div></div>';

      if (element) {
        root.style.position = "absolute";
        root.style.top = minimal ? "calc(100% - 42px)" : "calc(100% - 51px)";
      }

      if (css) {
        if (_isString$2(css)) {
          root.style.cssText = css;
        } else if (_isObject$3(css)) {
          css.data = "root";
          gsap$6.set(root, css).kill();
        }

        if (root.style.top) {
          root.style.bottom = "auto";
        }

        if (root.style.width) {
          gsap$6.set(root, {
            xPercent: -50,
            left: "50%",
            right: "auto",
            data: "root"
          }).kill();
        }
      }

      if (!minimal && root.offsetWidth < 600) {
        root.setAttribute("class", "gs-dev-tools minimal");

        if (element) {
          root.style.top = "calc(100% - 42px)";
        }
      }

      return root;
    },
        _clickedOnce = true,
        //perhaps we shouldn't preventDefault() on the first mousedown/touchstart/pointerdown so that iframes get focus properly. Did that previously, but now it seems to prevent interaction on the first click (annoying).
    _addListener$2 = function _addListener(e, type, callback, capture) {
      var handler, altType;

      if (type === "mousedown" || type === "mouseup") {
        e.style.cursor = "pointer";
      }

      if (type === "mousedown") {
        //some browsers call BOTH mousedown AND touchstart, for example, on a single interaction so we need to skip one of them if both are called within 100ms.
        altType = !_isUndefined$2(e.onpointerdown) ? "pointerdown" : !_isUndefined$2(e.ontouchstart) ? "touchstart" : null;

        if (altType) {
          handler = function handler(event) {
            if (event.target.nodeName.toLowerCase() !== "select" && event.type === altType) {
              //don't preventDefault() on a <select> or else it won't open!
              event.stopPropagation();

              if (_clickedOnce) {
                //otherwise, both touchstart and mousedown will get called.
                event.preventDefault();
                callback.call(e, event);
              }
            } else if (event.type !== altType) {
              callback.call(e, event);
            }

            _clickedOnce = true;
          };

          e.addEventListener(altType, handler, capture);

          if (altType !== "pointerdown") {
            e.addEventListener(type, handler, capture);
          }

          return;
        }
      }

      e.addEventListener(type, callback, capture);
    },
        _removeListener$2 = function _removeListener(e, type, callback) {
      e.removeEventListener(type, callback);
      type = type !== "mousedown" ? null : !_isUndefined$2(e.onpointerdown) ? "pointerdown" : !_isUndefined$2(e.ontouchstart) ? "touchstart" : null;

      if (type) {
        e.removeEventListener(type, callback);
      }
    },
        _selectValue = function _selectValue(element, value, label, insertIfAbsent) {
      var options = element.options,
          i = options.length,
          option;
      value += "";

      while (--i > -1) {
        if (options[i].innerHTML === value || options[i].value === value) {
          element.selectedIndex = i;
          label.innerHTML = options[i].innerHTML;
          return options[i];
        }
      }

      if (insertIfAbsent) {
        option = _createElement$2("option", element);
        option.setAttribute("value", value);
        option.innerHTML = label.innerHTML = _isString$2(insertIfAbsent) ? insertIfAbsent : value;
        element.selectedIndex = options.length - 1;
      }
    },
        //increments the selected value of a <select> up or down by a certain amount.
    _shiftSelectedValue = function _shiftSelectedValue(element, amount, label) {
      var options = element.options,
          i = Math.min(options.length - 1, Math.max(0, element.selectedIndex + amount));
      element.selectedIndex = i;

      if (label) {
        label.innerHTML = options[i].innerHTML;
      }

      return options[i].value;
    },
        //moves everything from _globalTimeline into _recordedRoot and updates the _rootTween if it is currently controlling the Global timeline (_recordedRoot). _recordedTemp is just a temporary recording area for anything that happens while _recordedRoot is paused. Returns true if the _recordedRoot's duration changed due to the merge.
    _merge$1 = function _merge() {
      var t = _globalTimeline$1._first,
          duration,
          next,
          target;

      if (_rootInstance) {
        duration = _recordedRoot._dur;

        while (t) {
          next = t._next;
          target = t._targets && t._targets[0];

          if (!(_isFunction$3(target) && target === t.vars.onComplete && !t._dur) && !(target && target._gsIgnore)) {
            //typically, delayedCalls aren't included in the _recordedTemp, but since the hijacked add() below fires BEFORE TweenLite's constructor sets the target, we couldn't check that target === vars.onComplete there. And Draggable creates a tween with just an onComplete (no onReverseComplete), thus it fails that test. Therefore, we test again here to avoid merging that in.
            _recordedRoot.add(t, t._start - t._delay);
          }

          t = next;
        }

        return duration !== _recordedRoot.duration();
      }
    },
        _buildPlayPauseMorph = function _buildPlayPauseMorph(svg) {
      var tl = gsap$6.timeline({
        data: "root",
        parent: _independentRoot,
        onComplete: function onComplete() {
          return tl.kill();
        }
      });
      tl.to(svg.querySelector(".play-1"), {
        duration: 0.4,
        attr: {
          d: "M5.75,3.13 C5.75,9.79 5.75,16.46 5.75,23.13 4.08,23.13 2.41,23.13 0.75,23.13 0.75,16.46 0.75,9.79 0.75,3.12 2.41,3.12 4.08,3.12 5.75,3.12"
        },
        ease: "power2.inOut",
        rotation: 360,
        transformOrigin: "50% 50%"
      }).to(svg.querySelector(".play-2"), {
        duration: 0.4,
        attr: {
          d: "M16.38,3.13 C16.38,9.79 16.38,16.46 16.38,23.13 14.71,23.13 13.04,23.13 11.38,23.13 11.38,16.46 11.38,9.79 11.38,3.12 13.04,3.12 14.71,3.12 16.38,3.12"
        },
        ease: "power2.inOut",
        rotation: 360,
        transformOrigin: "50% 50%"
      }, 0.05);
      return tl;
    },
        _buildLoopAnimation = function _buildLoopAnimation(svg) {
      var tl = gsap$6.timeline({
        data: "root",
        id: "loop",
        parent: _independentRoot,
        paused: true,
        onComplete: function onComplete() {
          return tl.kill();
        }
      });
      tl.to(svg, {
        duration: 0.5,
        rotation: 360,
        ease: "power3.inOut",
        transformOrigin: "50% 50%"
      }).to(svg.querySelectorAll(".loop-path"), {
        duration: 0.5,
        fill: "#91e600",
        ease: "none"
      }, 0);
      return tl;
    },
        _getAnimationById = function _getAnimationById(id) {
      return gsap$6.getById(id) || _independentRoot.getById(id) || id === _recordedRoot.vars.id && _recordedRoot;
    },
        _initCore$4 = function _initCore(core) {
      gsap$6 = core || _getGSAP$5();

      if (!_coreInitted$5) {
        if (gsap$6 && _windowExists$5()) {
          _doc$5 = document;
          _docEl$1 = _doc$5.documentElement;
          _win$6 = window;
          gsap$6.registerPlugin(Draggable);
          _globalTimeline$1 = gsap$6.globalTimeline;
          _globalTimeline$1._sort = true;
          _globalTimeline$1.autoRemoveChildren = false;
          Animation$1 = gsap$6.core.Animation;
          _independentRoot = gsap$6.timeline({
            data: "indy",
            autoRemoveChildren: true,
            smoothChildTiming: true
          });

          _independentRoot.kill();

          _independentRoot._dp = 0; //don't let it revert to the global timeline as its parent.

          _independentRoot.to({}, {
            duration: 1e12
          });

          _recordedRoot = gsap$6.timeline({
            data: "root",
            id: "Global Timeline",
            autoRemoveChildren: false,
            smoothChildTiming: true,
            parent: _independentRoot
          });
          _rootTween = gsap$6.to(_recordedRoot, {
            duration: 1,
            time: 1,
            ease: "none",
            data: "root",
            id: "_rootTween",
            paused: true,
            immediateRender: false,
            parent: _independentRoot
          }); // so that auto-overwriting works. Initially we transferred the tweens to the _recordedRoot.

          _globalTimeline$1.killTweensOf = function (targets, props, onlyActive) {
            _recordedRoot.killTweensOf(targets, props, onlyActive);

            _recordedRoot.killTweensOf.call(_globalTimeline$1, targets, props, onlyActive);
          };

          _independentRoot._start = gsap$6.ticker.time;
          gsap$6.ticker.add(function (time) {
            return _independentRoot.render(time - _independentRoot._start);
          }); //align the all of the playheads so they're starting at 0 now.

          _globalTimeline$1._start += _globalTimeline$1._time;
          _recordedRoot._start = _globalTimeline$1._time = _globalTimeline$1._tTime = 0;

          _delayedCall = function _delayedCall(delay, callback, params, scope) {
            return gsap$6.to(callback, {
              delay: delay,
              duration: 0,
              onComplete: callback,
              onReverseComplete: callback,
              onCompleteParams: params,
              onReverseCompleteParams: params,
              callbackScope: scope,
              parent: _independentRoot
            });
          }; //in case GSDevTools.create() is called before anything is actually on the global timeline, we've gotta update it or else the duration will be 0 and it'll be stuck.


          _delayedCall(0.01, function () {
            return _rootInstance ? _rootInstance.update() : _merge$1();
          }); //initially we record everything into the _recordedRoot Timeline because developers might call GSDevTools.create() AFTER some of their code executes, but after 2 seconds if there aren't any GSDevTool instances that have globalSync enabled, we should dump all the stuff from _recordedRoot into the global timeline to improve performance and avoid issues where _recordedRoot is paused and reaches its end and wants to stop the playhead.


          _delayedCall(2, function () {
            var t, next, offset;

            if (!_rootInstance) {
              _merge$1();

              t = _recordedRoot._first;
              offset = _recordedRoot._start;

              while (t) {
                next = t._next; //any animations that aren't finished should be dumped into the root timeline. If they're done, just kill them.

                if (t._tDur !== t._tTime || !t._dur && t.progress() !== 1) {
                  _globalTimeline$1.add(t, t._start - t._delay + offset);
                } else {
                  t.kill();
                }

                t = next;
              }
            }

            if (GSDevTools.globalRecordingTime > 2) {
              _delayedCall(GSDevTools.globalRecordingTime - 2, function () {
                _rootInstance && _rootInstance.update();
                _globalTimeline$1.autoRemoveChildren = true;
              });
            } else {
              _globalTimeline$1.autoRemoveChildren = true;
            }

            _startupPhase = false;
          });

          _coreInitted$5 = 1;
        }
      }
    },
        _checkIndependence = function _checkIndependence(animation, vars) {
      if (!vars.globalSync && animation.parent !== _globalTimeline$1) {
        //in case it's nested in a timeline (playing it won't help if the parent timeline isn't playing).
        _globalTimeline$1.add(animation, _globalTimeline$1.time());
      }
    },
        GSDevTools = function GSDevTools(vars) {
      if (!_coreInitted$5) {
        _initCore$4();

        gsap$6 || console.warn("Please gsap.registerPlugin(GSDevTools)");
      }

      this.vars = vars = vars || {};

      if (vars.animation) {
        (GSDevTools.getByAnimation(vars.animation) || {
          kill: function kill() {
            return 0;
          }
        }).kill();
      }

      vars.id = vars.id || (_isString$2(vars.animation) ? vars.animation : _idSeed++); //try to find a unique ID so that sessionStorage can be mapped to it (otherwise, for example, all the embedded codepens on a page would share the same settings). So if no id is defined, see if there's a string-based "animation" defined. Last of all, we default to a numeric counter that we increment.

      _lookup$1[vars.id + ""] = this;
      "globalSync" in vars || (vars.globalSync = !vars.animation); //if the user calls create() and passes in an animation AFTER the initial recording time has elapsed, there's a good chance the animation won't be in the recordedRoot, so we change the default globalSync to false because that's the most intuitive behavior.
      //GENERAL/UTILITY

      var _self = this,
          root = _createRootElement(vars.container, vars.minimal, vars.css),
          find = function find(s) {
        return root.querySelector(s);
      },
          record = function record(key, value) {
        if (vars.persist !== false && _supportsStorage) {
          sessionStorage.setItem("gs-dev-" + key + vars.id, value);
        }

        return value;
      },
          recall = function recall(key) {
        var value;

        if (vars.persist !== false && _supportsStorage) {
          value = sessionStorage.getItem("gs-dev-" + key + vars.id);
          return key === "animation" ? value : key === "loop" ? value === "true" : parseFloat(value); // handle data typing too.
        }
      },
          //SCRUBBER/PROGRESS
      playhead = find(".playhead"),
          timelineTrack = find(".timeline-track"),
          progressBar = find(".progress-bar"),
          timeLabel = find(".time"),
          durationLabel = find(".duration"),
          pixelToTimeRatio,
          timeAtDragStart,
          dragged,
          skipDragUpdates,
          progress = 0,
          inPoint = find(".in-point"),
          outPoint = find(".out-point"),
          inProgress = 0,
          outProgress = 100,
          pausedWhenDragStarted,
          list = find(".animation-list"),
          animationLabel = find(".animation-label"),
          selectedAnimation,
          //the currently selected animation
      linkedAnimation,
          //the animation that's linked to all the controls and scrubber. This is always _rootTween if globalSync is true, so it can be different than the selectedAnimation!
      declaredAnimation,
          //whatever the user defines in the config object initially (often this will be null). If the user defines a string, it'll be resolved to a real Animation instance for this variable.
      startTime,
          endTime,
          _fullyInitialized,
          //we call initialize() initially, and then again on the very next tick just in case someone called GSDevTools.create() BEFORE they create their animations. This variable tracks that state. Note: we don't record sessionStorage.setItem() until we're fully initialized, otherwise we may inadvertently set in/out points to the defaults just because the animation couldn't be found (yet).
      keyboardHandler,
          playPauseButton = find(".play-pause"),
          playPauseMorph = _buildPlayPauseMorph(playPauseButton),
          paused = false,
          loopButton = find(".loop"),
          loopAnimation = _buildLoopAnimation(loopButton),
          loopEnabled,
          timeScale = find(".time-scale select"),
          timeScaleLabel = find(".time-scale-label"),
          //spits back a common onPress function for anything that's dragged along the timeline (playhead, inPoint, outPoint). The originRatio is a value from 0-1 indicating how far along the x-axis the origin is located (0.5 is in the center, 0 is left, 1 is on right side). limitElement is optional, and sets the bounds such that the element can't be dragged past the limitElement.
      onPressTimeline = function onPressTimeline(element, originRatio, limitToInOut) {
        return function (e) {
          var trackBounds = timelineTrack.getBoundingClientRect(),
              elementBounds = element.getBoundingClientRect(),
              left = elementBounds.width * originRatio,
              x = gsap$6.getProperty(element, "x"),
              minX = trackBounds.left - elementBounds.left - left + x,
              maxX = trackBounds.right - elementBounds.right + (elementBounds.width - left) + x,
              unlimitedMinX = minX,
              limitBounds;

          if (limitToInOut) {
            if (element !== inPoint) {
              limitBounds = inPoint.getBoundingClientRect();

              if (limitBounds.left) {
                //if inPoint is hidden (like display:none), ignore.
                minX += limitBounds.left + limitBounds.width - trackBounds.left;
              }
            }

            if (element !== outPoint) {
              limitBounds = outPoint.getBoundingClientRect();

              if (limitBounds.left) {
                //if outPoint is hidden (like display:none), ignore.
                maxX -= trackBounds.left + trackBounds.width - limitBounds.left;
              }
            }
          }

          pausedWhenDragStarted = paused;
          this.applyBounds({
            minX: minX,
            maxX: maxX
          });
          pixelToTimeRatio = linkedAnimation.duration() / trackBounds.width;
          timeAtDragStart = -unlimitedMinX * pixelToTimeRatio;

          if (!skipDragUpdates) {
            linkedAnimation.pause(timeAtDragStart + pixelToTimeRatio * this.x);
          } else {
            linkedAnimation.pause();
          }

          if (this.target === playhead) {
            if (this.activated) {
              this.allowEventDefault = false;
            }

            this.activated = true;
          }

          dragged = true;
        };
      },
          progressDrag = Draggable.create(playhead, {
        type: "x",
        cursor: "ew-resize",
        allowNativeTouchScrolling: false,
        allowEventDefault: true,
        //otherwise, when dragged outside an iframe, the mouseup doesn't bubble up so it could seem "stuck" to the mouse.
        onPress: onPressTimeline(playhead, 0.5, true),
        onDrag: function onDrag() {
          var time = timeAtDragStart + pixelToTimeRatio * this.x;

          if (time < 0) {
            time = 0;
          } else if (time > linkedAnimation._dur) {
            time = linkedAnimation._dur;
          }

          if (!skipDragUpdates) {
            linkedAnimation.time(time);
          }

          progressBar.style.width = Math.min(outProgress - inProgress, Math.max(0, time / linkedAnimation._dur * 100 - inProgress)) + "%";
          timeLabel.innerHTML = time.toFixed(2);
        },
        onRelease: function onRelease() {
          if (!paused) {
            linkedAnimation.resume();
          }
        }
      })[0],
          resetInOut = function resetInOut() {
        inProgress = 0;
        outProgress = 100;
        inPoint.style.left = "0%";
        outPoint.style.left = "100%";
        record("in", inProgress);
        record("out", outProgress);
        updateProgress(true);
      },
          inDrag = Draggable.create(inPoint, {
        type: "x",
        cursor: "ew-resize",
        zIndexBoost: false,
        allowNativeTouchScrolling: false,
        allowEventDefault: true,
        //otherwise, when dragged outside an iframe, the mouseup doesn't bubble up so it could seem "stuck" to the mouse.
        onPress: onPressTimeline(inPoint, 1, true),
        onDoubleClick: resetInOut,
        onDrag: function onDrag() {
          inProgress = (timeAtDragStart + pixelToTimeRatio * this.x) / linkedAnimation.duration() * 100;
          linkedAnimation.progress(inProgress / 100);
          updateProgress(true);
        },
        onRelease: function onRelease() {
          if (inProgress < 0) {
            inProgress = 0;
          }

          _clearSelection(); //for responsiveness, convert the px-based transform into %-based left position.


          inPoint.style.left = inProgress + "%";
          record("in", inProgress);
          gsap$6.set(inPoint, {
            x: 0,
            data: "root",
            display: "block"
          }); //set display:block so that it remains visible even when the minimal skin is enabled.

          if (!paused) {
            linkedAnimation.resume();
          }
        }
      })[0],
          outDrag = Draggable.create(outPoint, {
        type: "x",
        cursor: "ew-resize",
        allowNativeTouchScrolling: false,
        allowEventDefault: true,
        //otherwise, when dragged outside an iframe, the mouseup doesn't bubble up so it could seem "stuck" to the mouse.
        zIndexBoost: false,
        onPress: onPressTimeline(outPoint, 0, true),
        onDoubleClick: resetInOut,
        onDrag: function onDrag() {
          outProgress = (timeAtDragStart + pixelToTimeRatio * this.x) / linkedAnimation.duration() * 100;
          linkedAnimation.progress(outProgress / 100);
          updateProgress(true);
        },
        onRelease: function onRelease() {
          if (outProgress > 100) {
            outProgress = 100;
          }

          _clearSelection(); //for responsiveness, convert the px-based transform into %-based left position.


          outPoint.style.left = outProgress + "%";
          record("out", outProgress);
          gsap$6.set(outPoint, {
            x: 0,
            data: "root",
            display: "block"
          }); //set display:block so that it remains visible even when the minimal skin is enabled.

          if (!pausedWhenDragStarted) {
            play();
            linkedAnimation.resume();
          }
        }
      })[0],
          updateProgress = function updateProgress(force) {
        // NOTE: "force" is actually the "time" when this method gets called by the gsap.ticker!
        if (progressDrag.isPressed && force !== true) {
          return;
        }

        var p = !loopEnabled && selectedAnimation._repeat === -1 ? selectedAnimation.totalTime() / selectedAnimation.duration() * 100 : linkedAnimation.progress() * 100 || 0,
            repeatDelayPhase = selectedAnimation._repeat && selectedAnimation._rDelay && selectedAnimation.totalTime() % (selectedAnimation.duration() + selectedAnimation._rDelay) > selectedAnimation.duration(),
            target;

        if (p > 100) {
          p = 100;
        }

        if (p >= outProgress) {
          if (loopEnabled && !linkedAnimation.paused() && !progressDrag.isDragging) {
            if (!repeatDelayPhase) {
              p = inProgress;
              target = linkedAnimation._targets && linkedAnimation._targets[0];

              if (target === selectedAnimation) {
                //in case there are callbacks on the timeline, when we jump back to the start we should seek() so that the playhead doesn't drag [backward] past those and trigger them.
                target.seek(startTime + (endTime - startTime) * inProgress / 100);
              }

              if (selectedAnimation._repeat > 0 && !inProgress && outProgress === 100) {
                if (selectedAnimation.totalProgress() === 1) {
                  linkedAnimation.totalProgress(0, true).resume();
                }
              } else {
                linkedAnimation.progress(p / 100, true).resume();
              }
            }
          } else {
            if (p !== outProgress || selectedAnimation._repeat === -1) {
              p = outProgress;
              linkedAnimation.progress(p / 100);
            }

            if (!paused && (outProgress < 100 || selectedAnimation.totalProgress() === 1 || selectedAnimation._repeat === -1)) {
              pause();
            }
          }
        } else if (p < inProgress) {
          p = inProgress;
          linkedAnimation.progress(p / 100, true);
        }

        if (p !== progress || force === true) {
          progressBar.style.left = inProgress + "%";
          progressBar.style.width = Math.max(0, p - inProgress) + "%";
          playhead.style.left = p + "%";
          timeLabel.innerHTML = linkedAnimation._time.toFixed(2);
          durationLabel.innerHTML = linkedAnimation._dur.toFixed(2);

          if (dragged) {
            playhead.style.transform = "translate(-50%,0)";
            playhead._gsap.x = "0px";
            playhead._gsap.xPercent = -50;
            dragged = false;
          }

          progress = p;
        } else if (linkedAnimation.paused() !== paused) {
          //like if the user has an addPause() in the middle of the animation.
          togglePlayPause();
        }
      },
          onPressSeekBar = function onPressSeekBar(e) {
        if (progressDrag.isPressed) {
          return;
        }

        var bounds = e.target.getBoundingClientRect(),
            x = (e.changedTouches ? e.changedTouches[0] : e).clientX,
            p = (x - bounds.left) / bounds.width * 100;

        if (p < inProgress) {
          inProgress = p = Math.max(0, p);
          inPoint.style.left = inProgress + "%";
          inDrag.startDrag(e);
          return;
        } else if (p > outProgress) {
          outProgress = p = Math.min(100, p);
          outPoint.style.left = outProgress + "%";
          outDrag.startDrag(e);
          return;
        }

        linkedAnimation.progress(p / 100).pause();
        updateProgress(true);
        progressDrag.startDrag(e);
      },
          //PLAY/PAUSE button
      play = function play() {
        if (linkedAnimation.progress() >= outProgress / 100) {
          _checkIndependence(linkedAnimation, vars);

          var target = linkedAnimation._targets && linkedAnimation._targets[0];

          if (target === selectedAnimation) {
            //in case there are callbacks on the timeline, when we jump back to the start we should seek() so that the playhead doesn't drag [backward] past those and trigger them.
            target.seek(startTime + (endTime - startTime) * inProgress / 100);
          }

          if (linkedAnimation._repeat && !inProgress) {
            linkedAnimation.totalProgress(0, true); //for repeating animations, don't get stuck in the last iteration - jump all the way back to the start.
          } else if (!linkedAnimation.reversed()) {
            linkedAnimation.progress(inProgress / 100, true);
          }
        }

        playPauseMorph.play();
        linkedAnimation.resume();

        if (paused) {
          _self.update();
        }

        paused = false;
      },
          pause = function pause() {
        playPauseMorph.reverse();

        if (linkedAnimation) {
          linkedAnimation.pause();
        }

        paused = true;
      },
          togglePlayPause = function togglePlayPause() {
        if (paused) {
          play();
        } else {
          pause();
        }
      },
          //REWIND button
      onPressRewind = function onPressRewind(e) {
        if (progressDrag.isPressed) {
          return;
        } //_self.update();


        _checkIndependence(linkedAnimation, vars);

        var target = linkedAnimation._targets && linkedAnimation._targets[0];

        if (target === selectedAnimation) {
          //in case there are callbacks on the timeline, when we jump back to the start we should seek() so that the playhead doesn't drag [backward] past those and trigger them.
          target.seek(startTime + (endTime - startTime) * inProgress / 100);
        }

        linkedAnimation.progress(inProgress / 100, true);

        if (!paused) {
          linkedAnimation.resume();
        }
      },
          //LOOP button
      loop = function loop(value) {
        loopEnabled = value;
        record("loop", loopEnabled);

        if (loopEnabled) {
          loopAnimation.play();

          if (linkedAnimation.progress() >= outProgress / 100) {
            var target = linkedAnimation._targets && linkedAnimation._targets[0];

            if (target === selectedAnimation) {
              //in case there are callbacks on the timeline, when we jump back to the start we should seek() so that the playhead doesn't drag [backward] past those and trigger them.
              target.seek(startTime + (endTime - startTime) * inProgress / 100);
            }

            if (selectedAnimation._repeat && !inProgress && outProgress === 100) {
              linkedAnimation.totalProgress(0, true);
            } else {
              linkedAnimation.progress(inProgress / 100, true);
            }

            play();
          }
        } else {
          loopAnimation.reverse();
        }
      },
          toggleLoop = function toggleLoop() {
        return loop(!loopEnabled);
      },
          //ANIMATIONS list
      updateList = function updateList() {
        var animations = _getChildrenOf(declaredAnimation && !vars.globalSync ? declaredAnimation : _recordedRoot, true),
            options = list.children,
            matches = 0,
            option,
            i;

        if (declaredAnimation && !vars.globalSync) {
          animations.unshift(declaredAnimation);
        } else if (!vars.hideGlobalTimeline) {
          animations.unshift(_recordedRoot);
        }

        for (i = 0; i < animations.length; i++) {
          option = options[i] || _createElement$2("option", list);
          option.animation = animations[i];
          matches = i && animations[i].vars.id === animations[i - 1].vars.id ? matches + 1 : 0;
          option.setAttribute("value", option.innerHTML = animations[i].vars.id + (matches ? " [" + matches + "]" : animations[i + 1] && animations[i + 1].vars.id === animations[i].vars.id ? " [0]" : ""));
        }

        for (; i < options.length; i++) {
          list.removeChild(options[i]);
        }
      },
          animation = function animation(anim) {
        var ts = parseFloat(timeScale.options[timeScale.selectedIndex].value) || 1,
            tl,
            maxDuration;

        if (!arguments.length) {
          return selectedAnimation;
        }

        if (_isString$2(anim)) {
          anim = _getAnimationById(anim);
        } //console.log("animation() ", anim.vars.id);


        if (!(anim instanceof Animation$1)) {
          console.warn("GSDevTools error: invalid animation.");
        }

        if (anim === selectedAnimation) {
          return;
        }

        if (selectedAnimation) {
          selectedAnimation._inProgress = inProgress;
          selectedAnimation._outProgress = outProgress;
        }

        selectedAnimation = anim;

        if (linkedAnimation) {
          ts = linkedAnimation.timeScale();

          if (linkedAnimation._targets && linkedAnimation._targets[0] === declaredAnimation) {
            declaredAnimation.resume();
            linkedAnimation.kill();
          }
        }

        inProgress = selectedAnimation._inProgress || 0;
        outProgress = selectedAnimation._outProgress || 100;
        inPoint.style.left = inProgress + "%";
        outPoint.style.left = outProgress + "%";

        if (_fullyInitialized) {
          //don't record inProgress/outProgress unless we're fully instantiated because people may call GSDevTools.create() before creating/defining their animations, thus the inTime/outTime may not exist yet.
          record("animation", selectedAnimation.vars.id);
          record("in", inProgress);
          record("out", outProgress);
        }

        startTime = 0;
        maxDuration = vars.maxDuration || Math.min(1000, _getClippedDuration(selectedAnimation));

        if (selectedAnimation === _recordedRoot || vars.globalSync) {
          _merge$1();

          linkedAnimation = _rootTween;
          _rootInstance && _rootInstance !== _self && console.warn("Error: GSDevTools can only have one instance that's globally synchronized.");
          _rootInstance = _self; //_recording = true;

          if (selectedAnimation !== _recordedRoot) {
            tl = selectedAnimation;
            endTime = tl.totalDuration();

            if (endTime > 99999999) {
              //in the case of an infinitely repeating animation, just use a single iteration's duration instead.
              endTime = tl.duration();
            }

            while (tl.parent.parent) {
              startTime = startTime / tl._ts + tl._start;
              endTime = endTime / tl._ts + tl._start;
              tl = tl.parent;
            }
          } else {
            endTime = _recordedRoot.duration();
          }

          if (endTime - startTime > maxDuration) {
            //cap end time at 1000 because it doesn't seem reasonable to accommodate super long stuff.
            endTime = startTime + maxDuration;
          }

          _recordedRoot.pause(startTime);

          _rootTween.vars.time = endTime;

          _rootTween.invalidate();

          _rootTween.duration(endTime - startTime).timeScale(ts); //wait for a tick before starting because some browsers freeze things immediately following a <select> selection, like on MacOS it flashes a few times before disappearing, so this prevents a "jump".


          if (paused) {
            //jump forward and then back in order to make sure the start/end values are recorded internally right away and don't drift outside this tween.
            _rootTween.progress(1).pause(0);
          } else {
            _delayedCall(0.01, function () {
              _rootTween.resume().progress(inProgress / 100);

              if (paused) {
                play();
              }
            });
          }
        } else {
          if (_rootInstance === _self) {
            _rootInstance = null;
          }

          if (selectedAnimation === declaredAnimation || !declaredAnimation) {
            linkedAnimation = selectedAnimation;

            if (!loopEnabled && linkedAnimation._repeat) {
              loop(true);
            }
          } else {
            //if an animation is declared in the config object, and the user chooses a sub-animation (nested), we tween the playhead of the declaredAnimation to keep everything synchronized even though globalSync isn't true.
            tl = selectedAnimation;
            endTime = tl.totalDuration();

            if (endTime > 99999999) {
              //in the case of an infinitely repeating animation, just use a single iteration's duration instead.
              endTime = tl.duration();
            }

            while (tl.parent.parent && tl !== declaredAnimation) {
              startTime = startTime / (tl._ts || tl._pauseTS) + tl._start;
              endTime = endTime / (tl._ts || tl._pauseTS) + tl._start;
              tl = tl.parent;
            }

            if (endTime - startTime > maxDuration) {
              //cap end time at 1000 because it doesn't seem reasonable to accommodate super long stuff.
              endTime = startTime + maxDuration;
            }

            declaredAnimation.pause(startTime);
            linkedAnimation = gsap$6.to(declaredAnimation, {
              duration: endTime - startTime,
              time: endTime,
              ease: "none",
              data: "root",
              parent: _independentRoot
            });
          }

          linkedAnimation.timeScale(ts);

          _rootTween.pause();

          _recordedRoot.resume();

          linkedAnimation.seek(0);
        }

        durationLabel.innerHTML = linkedAnimation.duration().toFixed(2);

        _selectValue(list, selectedAnimation.vars.id, animationLabel);
      },
          updateRootDuration = function updateRootDuration() {
        var time, ratio, duration;

        if (selectedAnimation === _recordedRoot) {
          time = _recordedRoot._time;

          _recordedRoot.progress(1, true).time(time, true); //jump to the end and back again because sometimes a tween that hasn't rendered yet will affect duration, like a TimelineMax.tweenTo() where the duration gets set in the onStart.


          time = (_rootTween._dp._time - _rootTween._start) * _rootTween._ts;
          duration = Math.min(1000, _recordedRoot.duration());

          if (duration === 1000) {
            duration = Math.min(1000, _getClippedDuration(_recordedRoot));
          }

          ratio = _rootTween.duration() / duration;

          if (ratio !== 1 && duration) {
            inProgress *= ratio;

            if (outProgress < 100) {
              outProgress *= ratio;
            }

            _rootTween.seek(0);

            _rootTween.vars.time = duration;

            _rootTween.invalidate();

            _rootTween.duration(duration);

            _rootTween.time(time);

            durationLabel.innerHTML = duration.toFixed(2);
            inPoint.style.left = inProgress + "%";
            outPoint.style.left = outProgress + "%";
            updateProgress(true);
          }
        }
      },
          onChangeAnimation = function onChangeAnimation(e) {
        animation(list.options[list.selectedIndex].animation);

        if (e.target && e.target.blur) {
          //so that if an option is selected, and then the user tries to hit the up/down arrow, it doesn't just try selecting something else in the <select>.
          e.target.blur();
        }

        paused && play();
      },
          //TIMESCALE button
      onChangeTimeScale = function onChangeTimeScale(e) {
        var ts = parseFloat(timeScale.options[timeScale.selectedIndex].value) || 1,
            target;
        linkedAnimation.timeScale(ts);
        record("timeScale", ts);

        if (!paused) {
          if (linkedAnimation.progress() >= outProgress / 100) {
            target = linkedAnimation._targets && linkedAnimation._targets[0];

            if (target === selectedAnimation) {
              //in case there are callbacks on the timeline, when we jump back to the start we should seek() so that the playhead doesn't drag [backward] past those and trigger them.
              target.seek(startTime + (endTime - startTime) * inProgress / 100);
            }

            linkedAnimation.progress(inProgress / 100, true).pause();
          } else {
            linkedAnimation.pause();
          }

          _delayedCall(0.01, function () {
            return linkedAnimation.resume();
          });
        }

        timeScaleLabel.innerHTML = ts + "x";

        if (timeScale.blur) {
          //so that if an option is selected, and then the user tries to hit the up/down arrow, it doesn't just try selecting something else in the <select>.
          timeScale.blur();
        }
      },
          //AUTOHIDE
      autoHideTween = gsap$6.to([find(".gs-bottom"), find(".gs-top")], {
        duration: 0.3,
        autoAlpha: 0,
        y: 50,
        ease: "power2.in",
        data: "root",
        paused: true,
        parent: _independentRoot
      }),
          hidden = false,
          onMouseOut = function onMouseOut(e) {
        if (!Draggable.hitTest(e, root) && !progressDrag.isDragging && !inDrag.isDragging && !outDrag.isDragging) {
          autoHideDelayedCall.restart(true);
        }
      },
          hide = function hide() {
        if (!hidden) {
          autoHideTween.play();
          autoHideDelayedCall.pause();
          hidden = true;
        }
      },
          show = function show() {
        autoHideDelayedCall.pause();

        if (hidden) {
          autoHideTween.reverse();
          hidden = false;
        }
      },
          toggleHide = function toggleHide() {
        if (hidden) {
          show();
        } else {
          hide();
        }
      },
          autoHideDelayedCall = _delayedCall(1.3, hide).pause(),
          initialize = function initialize(preliminary) {
        //if on startup, someone does a timeline.seek(), we must honor it, so when initialize() is called, we record _recordedRoot._start so that we can use that as an offset. Remember, however, that we call initialize() twice on startup, once after a tick has elapsed just in case someone called GSDevTools.create() before their animation code, so we must record the value (once).
        if (_startupPhase && !_globalStartTime) {
          _globalStartTime = _recordedRoot._start;
        }

        _fullyInitialized = !preliminary;
        declaredAnimation = _parseAnimation(vars.animation);

        if (declaredAnimation && !declaredAnimation.vars.id) {
          declaredAnimation.vars.id = "[no id]";
        }

        _merge$1();

        updateList();

        var savedAnimation = _getAnimationById(recall("animation"));

        if (savedAnimation) {
          savedAnimation._inProgress = recall("in") || 0;
          savedAnimation._outProgress = recall("out") || 100;
        }

        vars.paused && pause();
        selectedAnimation = null;
        animation(declaredAnimation || savedAnimation || _recordedRoot);
        var ts = vars.timeScale || recall("timeScale"),
            savedInOut = savedAnimation === selectedAnimation;

        if (ts) {
          _selectValue(timeScale, ts, timeScaleLabel, ts + "x");

          linkedAnimation.timeScale(ts);
        }

        inProgress = ("inTime" in vars ? _timeToProgress(vars.inTime, selectedAnimation, 0, 0) : savedInOut ? savedAnimation._inProgress : 0) || 0;

        if (inProgress === 100 && !vars.animation && savedAnimation) {
          //in case there's a recorded animation (sessionStorage) and then the user defines an inTime that exceeds that animation's duration, just default back to the Global Timeline. Otherwise the in/out point will be at the very end and it'd be weird.
          animation(_recordedRoot);
          inProgress = _timeToProgress(vars.inTime, selectedAnimation, 0, 0) || 0;
        }

        if (inProgress) {
          inPoint.style.left = inProgress + "%";
          inPoint.style.display = outPoint.style.display = "block"; //set display:block so that it remains visible even when the minimal skin is enabled.
        }

        outProgress = ("outTime" in vars ? _timeToProgress(vars.outTime, selectedAnimation, 100, inProgress) : savedInOut ? savedAnimation._outProgress : 0) || 100;

        if (outProgress < inProgress) {
          outProgress = 100;
        }

        if (outProgress !== 100) {
          outPoint.style.left = outProgress + "%";
          inPoint.style.display = outPoint.style.display = "block"; //set display:block so that it remains visible even when the minimal skin is enabled.
        }

        loopEnabled = "loop" in vars ? vars.loop : recall("loop");
        loopEnabled && loop(true);
        vars.paused && linkedAnimation.progress(inProgress / 100, true).pause();

        if (_startupPhase && selectedAnimation === _recordedRoot && _globalStartTime && vars.globalSync && !paused) {
          linkedAnimation.time(-_globalStartTime, true);
        }

        updateProgress(true);
      }; //INITIALIZATION TASKS


      _addListener$2(list, "change", onChangeAnimation);

      _addListener$2(list, "mousedown", updateList);

      _addListener$2(playPauseButton, "mousedown", togglePlayPause);

      _addListener$2(find(".seek-bar"), "mousedown", onPressSeekBar);

      _addListener$2(find(".rewind"), "mousedown", onPressRewind);

      _addListener$2(loopButton, "mousedown", toggleLoop);

      _addListener$2(timeScale, "change", onChangeTimeScale);

      if (vars.visibility === "auto") {
        _addListener$2(root, "mouseout", onMouseOut); //_addListener(find(".gs-hit-area"), "mouseover", show);


        _addListener$2(root, "mouseover", show);
      } else if (vars.visibility === "hidden") {
        hidden = true;
        autoHideTween.progress(1);
      }

      if (vars.keyboard !== false) {
        if (_keyboardInstance && vars.keyboard) {
          console.warn("[GSDevTools warning] only one instance can be affected by keyboard shortcuts. There is already one active.");
        } else {
          _keyboardInstance = _self; //we can't have multiple instances all affected by the keyboard.

          keyboardHandler = function keyboardHandler(e) {
            //window.parent allows things to work inside of an iframe, like on codepen.
            var key = e.keyCode ? e.keyCode : e.which,
                ts;

            if (key === 32) {
              //spacebar
              togglePlayPause();
            } else if (key === 38) {
              //up arrow
              ts = parseFloat(_shiftSelectedValue(timeScale, -1, timeScaleLabel));
              linkedAnimation.timeScale(ts);
              record("timeScale", ts);
            } else if (key === 40) {
              //down arrow
              ts = parseFloat(_shiftSelectedValue(timeScale, 1, timeScaleLabel));
              linkedAnimation.timeScale(ts);
              record("timeScale", ts);
            } else if (key === 37) {
              //left arrow
              onPressRewind();
            } else if (key === 39) {
              //right arrow
              linkedAnimation.progress(outProgress / 100);
            } else if (key === 76) {
              //"L" key
              toggleLoop();
            } else if (key === 72) {
              //"H" key
              toggleHide();
            } else if (key === 73) {
              //"I" key
              inProgress = linkedAnimation.progress() * 100;
              record("in", inProgress);
              inPoint.style.left = inProgress + "%";
              updateProgress(true);
            } else if (key === 79) {
              //"O" key
              outProgress = linkedAnimation.progress() * 100;
              record("out", outProgress);
              outPoint.style.left = outProgress + "%";
              updateProgress(true);
            }
          };

          _addListener$2(_docEl$1, "keydown", keyboardHandler);
        }
      }

      gsap$6.set(playhead, {
        xPercent: -50,
        x: 0,
        data: "root"
      }); //so that when we drag, x is properly discerned (browsers report in pure pixels rather than percents)

      gsap$6.set(inPoint, {
        xPercent: -100,
        x: 0,
        data: "root"
      });
      inPoint._gsIgnore = outPoint._gsIgnore = playhead._gsIgnore = playPauseButton._gsIgnore = loopButton._gsIgnore = true; //Draggable fires off a TweenLite.set() that affects the transforms, and we don't want them to get into the _recordedRoot, so kill those tweens.

      gsap$6.killTweensOf([inPoint, outPoint, playhead]);
      initialize(_startupPhase);

      if (_startupPhase) {
        //developers may call GSDevTools.create() before they even create some of their animations, so the inTime/outTime or animation values may not exist, thus we wait for 1 tick and initialize again, just in case.
        _delayedCall(0.0001, initialize, [false], this);
      }

      gsap$6.ticker.add(updateProgress);

      this.update = function (forceMerge) {
        if (_rootInstance === _self) {
          if (!_rootTween.paused() || forceMerge) {
            _merge$1();
          }

          updateRootDuration();
        }
      };

      this.kill = function () {
        _removeListener$2(list, "change", onChangeAnimation);

        _removeListener$2(list, "mousedown", updateList);

        _removeListener$2(playPauseButton, "mousedown", togglePlayPause);

        _removeListener$2(find(".seek-bar"), "mousedown", onPressSeekBar);

        _removeListener$2(find(".rewind"), "mousedown", onPressRewind);

        _removeListener$2(loopButton, "mousedown", toggleLoop);

        _removeListener$2(timeScale, "change", onChangeTimeScale);

        progressDrag.disable();
        inDrag.disable();
        outDrag.disable();
        gsap$6.ticker.remove(updateProgress);

        _removeListener$2(root, "mouseout", onMouseOut);

        _removeListener$2(root, "mouseover", show);

        _removeListener$2(_docEl$1, "keydown", keyboardHandler);

        root.parentNode.removeChild(root);

        if (_rootInstance === _self) {
          _rootInstance = null;
        }

        delete _lookup$1[vars.id + ""];
      };

      this.minimal = function (value) {
        var isMinimal = root.classList.contains("minimal"),
            p;

        if (!arguments.length || isMinimal === value) {
          return isMinimal;
        }

        if (value) {
          root.classList.add("minimal");
        } else {
          root.classList.remove("minimal");
        }

        if (vars.container) {
          root.style.top = value ? "calc(100% - 42px)" : "calc(100% - 51px)";
        }

        if (progressDrag.isPressed) {
          skipDragUpdates = true; //just in case there's actually a tween/timeline in the linkedAnimation that is altering this GSDevTool instance's "minimal()" value, it could trigger a recursive loop in the drag handlers, like if they update linkedAnimation's time/progress which in turn triggers this minimal() function which in turn dues the same, and so on.

          progressDrag.endDrag(progressDrag.pointerEvent);
          skipDragUpdates = false;
          p = linkedAnimation.progress() * 100;
          progressBar.style.width = Math.max(0, p - inProgress) + "%";
          playhead.style.left = p + "%";
          playhead.style.transform = "translate(-50%,0)";
          playhead._gsap.x = "0px";
          playhead._gsap.xPercent = -50;
          progressDrag.startDrag(progressDrag.pointerEvent, true);
        }
      }; //expose methods:


      this.animation = animation;
      this.updateList = updateList;
    }; //if on startup, someone does a timeline.seek(), we need to honor it, so when initialize() is called, it'll check the _recordedRoot._start so that we can use that as an offset. Remember, however, that we call initialize() twice on startup, once after a tick has elapsed just in case someone called GSDevTools.create() before their animation code, so we must record the value (once).


    GSDevTools.version = "3.5.1";
    GSDevTools.globalRecordingTime = 2;

    GSDevTools.getById = function (id) {
      return id ? _lookup$1[id] : _rootInstance;
    };

    GSDevTools.getByAnimation = function (animation) {
      if (_isString$2(animation)) {
        animation = gsap$6.getById(animation);
      }

      for (var p in _lookup$1) {
        if (_lookup$1[p].animation() === animation) {
          return _lookup$1[p];
        }
      }
    };

    GSDevTools.create = function (vars) {
      return new GSDevTools(vars);
    };

    GSDevTools.register = _initCore$4;
    _getGSAP$5() && gsap$6.registerPlugin(GSDevTools);

    /* src/componenets/vennAnimation.svelte generated by Svelte v3.29.4 */
    const file$4 = "src/componenets/vennAnimation.svelte";

    function create_fragment$4(ctx) {
    	let section;
    	let svg;
    	let rect0;
    	let g22;
    	let circle0;
    	let circle1;
    	let circle2;
    	let circle3;
    	let circle4;
    	let circle5;
    	let g4;
    	let g2;
    	let g0;
    	let path0;
    	let line0;
    	let line1;
    	let line2;
    	let line3;
    	let line4;
    	let line5;
    	let line6;
    	let line7;
    	let line8;
    	let line9;
    	let line10;
    	let line11;
    	let line12;
    	let line13;
    	let line14;
    	let g1;
    	let path1;
    	let path2;
    	let path3;
    	let g3;
    	let path4;
    	let g14;
    	let g12;
    	let g5;
    	let rect1;
    	let rect2;
    	let path5;
    	let path6;
    	let path7;
    	let g6;
    	let path8;
    	let path9;
    	let path10;
    	let path11;
    	let path12;
    	let path13;
    	let path14;
    	let path15;
    	let path16;
    	let path17;
    	let path18;
    	let path19;
    	let g7;
    	let path20;
    	let path21;
    	let path22;
    	let path23;
    	let path24;
    	let path25;
    	let path26;
    	let g8;
    	let path27;
    	let path28;
    	let path29;
    	let path30;
    	let path31;
    	let path32;
    	let path33;
    	let path34;
    	let path35;
    	let path36;
    	let path37;
    	let path38;
    	let g9;
    	let path39;
    	let path40;
    	let path41;
    	let path42;
    	let path43;
    	let path44;
    	let path45;
    	let g10;
    	let path46;
    	let path47;
    	let path48;
    	let path49;
    	let path50;
    	let path51;
    	let path52;
    	let path53;
    	let path54;
    	let path55;
    	let path56;
    	let path57;
    	let g11;
    	let path58;
    	let path59;
    	let path60;
    	let path61;
    	let path62;
    	let path63;
    	let path64;
    	let g13;
    	let path65;
    	let g17;
    	let g15;
    	let path66;
    	let rect3;
    	let line15;
    	let circle6;
    	let circle7;
    	let circle8;
    	let path67;
    	let path68;
    	let g16;
    	let path69;
    	let g21;
    	let g19;
    	let path70;
    	let path71;
    	let path72;
    	let g18;
    	let path73;
    	let path74;
    	let path75;
    	let g20;
    	let path76;

    	const block = {
    		c: function create() {
    			section = element("section");
    			svg = svg_element("svg");
    			rect0 = svg_element("rect");
    			g22 = svg_element("g");
    			circle0 = svg_element("circle");
    			circle1 = svg_element("circle");
    			circle2 = svg_element("circle");
    			circle3 = svg_element("circle");
    			circle4 = svg_element("circle");
    			circle5 = svg_element("circle");
    			g4 = svg_element("g");
    			g2 = svg_element("g");
    			g0 = svg_element("g");
    			path0 = svg_element("path");
    			line0 = svg_element("line");
    			line1 = svg_element("line");
    			line2 = svg_element("line");
    			line3 = svg_element("line");
    			line4 = svg_element("line");
    			line5 = svg_element("line");
    			line6 = svg_element("line");
    			line7 = svg_element("line");
    			line8 = svg_element("line");
    			line9 = svg_element("line");
    			line10 = svg_element("line");
    			line11 = svg_element("line");
    			line12 = svg_element("line");
    			line13 = svg_element("line");
    			line14 = svg_element("line");
    			g1 = svg_element("g");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			g3 = svg_element("g");
    			path4 = svg_element("path");
    			g14 = svg_element("g");
    			g12 = svg_element("g");
    			g5 = svg_element("g");
    			rect1 = svg_element("rect");
    			rect2 = svg_element("rect");
    			path5 = svg_element("path");
    			path6 = svg_element("path");
    			path7 = svg_element("path");
    			g6 = svg_element("g");
    			path8 = svg_element("path");
    			path9 = svg_element("path");
    			path10 = svg_element("path");
    			path11 = svg_element("path");
    			path12 = svg_element("path");
    			path13 = svg_element("path");
    			path14 = svg_element("path");
    			path15 = svg_element("path");
    			path16 = svg_element("path");
    			path17 = svg_element("path");
    			path18 = svg_element("path");
    			path19 = svg_element("path");
    			g7 = svg_element("g");
    			path20 = svg_element("path");
    			path21 = svg_element("path");
    			path22 = svg_element("path");
    			path23 = svg_element("path");
    			path24 = svg_element("path");
    			path25 = svg_element("path");
    			path26 = svg_element("path");
    			g8 = svg_element("g");
    			path27 = svg_element("path");
    			path28 = svg_element("path");
    			path29 = svg_element("path");
    			path30 = svg_element("path");
    			path31 = svg_element("path");
    			path32 = svg_element("path");
    			path33 = svg_element("path");
    			path34 = svg_element("path");
    			path35 = svg_element("path");
    			path36 = svg_element("path");
    			path37 = svg_element("path");
    			path38 = svg_element("path");
    			g9 = svg_element("g");
    			path39 = svg_element("path");
    			path40 = svg_element("path");
    			path41 = svg_element("path");
    			path42 = svg_element("path");
    			path43 = svg_element("path");
    			path44 = svg_element("path");
    			path45 = svg_element("path");
    			g10 = svg_element("g");
    			path46 = svg_element("path");
    			path47 = svg_element("path");
    			path48 = svg_element("path");
    			path49 = svg_element("path");
    			path50 = svg_element("path");
    			path51 = svg_element("path");
    			path52 = svg_element("path");
    			path53 = svg_element("path");
    			path54 = svg_element("path");
    			path55 = svg_element("path");
    			path56 = svg_element("path");
    			path57 = svg_element("path");
    			g11 = svg_element("g");
    			path58 = svg_element("path");
    			path59 = svg_element("path");
    			path60 = svg_element("path");
    			path61 = svg_element("path");
    			path62 = svg_element("path");
    			path63 = svg_element("path");
    			path64 = svg_element("path");
    			g13 = svg_element("g");
    			path65 = svg_element("path");
    			g17 = svg_element("g");
    			g15 = svg_element("g");
    			path66 = svg_element("path");
    			rect3 = svg_element("rect");
    			line15 = svg_element("line");
    			circle6 = svg_element("circle");
    			circle7 = svg_element("circle");
    			circle8 = svg_element("circle");
    			path67 = svg_element("path");
    			path68 = svg_element("path");
    			g16 = svg_element("g");
    			path69 = svg_element("path");
    			g21 = svg_element("g");
    			g19 = svg_element("g");
    			path70 = svg_element("path");
    			path71 = svg_element("path");
    			path72 = svg_element("path");
    			g18 = svg_element("g");
    			path73 = svg_element("path");
    			path74 = svg_element("path");
    			path75 = svg_element("path");
    			g20 = svg_element("g");
    			path76 = svg_element("path");
    			attr_dev(rect0, "width", "836");
    			attr_dev(rect0, "height", "761");
    			add_location(rect0, file$4, 312, 4, 7807);
    			attr_dev(circle0, "class", "circle-design circle-design-w crawlTrigger");
    			attr_dev(circle0, "id", "fill-1");
    			attr_dev(circle0, "cx", "418");
    			attr_dev(circle0, "cy", "208");
    			attr_dev(circle0, "vector-effect", "non-scaling-stroke");
    			attr_dev(circle0, "r", "200");
    			attr_dev(circle0, "fill", "white");
    			attr_dev(circle0, "data-key", "1");
    			add_location(circle0, file$4, 316, 6, 7902);
    			attr_dev(circle1, "class", "circle-animate circle-animate-w crawlTrigger");
    			attr_dev(circle1, "id", "fill-2");
    			attr_dev(circle1, "cx", "208");
    			attr_dev(circle1, "vector-effect", "non-scaling-stroke");
    			attr_dev(circle1, "cy", "553");
    			attr_dev(circle1, "r", "200");
    			attr_dev(circle1, "fill", "white");
    			attr_dev(circle1, "data-key", "2");
    			add_location(circle1, file$4, 317, 6, 8068);
    			attr_dev(circle2, "class", "circle-develop circle-develop-w crawlTrigger");
    			attr_dev(circle2, "id", "fill-3");
    			attr_dev(circle2, "cx", "628");
    			attr_dev(circle2, "vector-effect", "non-scaling-stroke");
    			attr_dev(circle2, "cy", "553");
    			attr_dev(circle2, "r", "200");
    			attr_dev(circle2, "fill", "white");
    			attr_dev(circle2, "data-key", "3");
    			add_location(circle2, file$4, 318, 6, 8236);
    			attr_dev(circle3, "class", "circle-design circle-design-w");
    			attr_dev(circle3, "id", "line-1");
    			attr_dev(circle3, "cx", "418");
    			attr_dev(circle3, "cy", "208");
    			attr_dev(circle3, "vector-effect", "non-scaling-stroke");
    			attr_dev(circle3, "r", "199.5");
    			attr_dev(circle3, "stroke", "#454545");
    			add_location(circle3, file$4, 319, 6, 8404);
    			attr_dev(circle4, "class", "circle-animate circle-animate-w");
    			attr_dev(circle4, "id", "line-2");
    			attr_dev(circle4, "cx", "208");
    			attr_dev(circle4, "vector-effect", "non-scaling-stroke");
    			attr_dev(circle4, "cy", "553");
    			attr_dev(circle4, "r", "199.5");
    			attr_dev(circle4, "stroke", "#454545");
    			add_location(circle4, file$4, 320, 6, 8550);
    			attr_dev(circle5, "class", "circle-develop circle-develop-w");
    			attr_dev(circle5, "id", "line-3");
    			attr_dev(circle5, "cx", "628");
    			attr_dev(circle5, "vector-effect", "non-scaling-stroke");
    			attr_dev(circle5, "cy", "553");
    			attr_dev(circle5, "r", "199.5");
    			attr_dev(circle5, "stroke", "#454545");
    			add_location(circle5, file$4, 321, 6, 8698);
    			attr_dev(path0, "id", "Rectangle 6");
    			attr_dev(path0, "d", "M386.414 193.276L442.276 137.414L451.468 146.607L395.607 202.468L386.414 193.276Z");
    			attr_dev(path0, "fill", "white");
    			attr_dev(path0, "stroke", "#454545");
    			attr_dev(path0, "stroke-width", "2");
    			add_location(path0, file$4, 346, 12, 10633);
    			attr_dev(line0, "id", "Line 6");
    			attr_dev(line0, "x1", "394.192");
    			attr_dev(line0, "y1", "193.983");
    			attr_dev(line0, "x2", "399.142");
    			attr_dev(line0, "y2", "198.932");
    			attr_dev(line0, "stroke", "#454545");
    			attr_dev(line0, "stroke-width", "2");
    			add_location(line0, file$4, 347, 12, 10803);
    			attr_dev(line1, "id", "Line 10");
    			attr_dev(line1, "x1", "408.335");
    			attr_dev(line1, "y1", "179.841");
    			attr_dev(line1, "x2", "413.284");
    			attr_dev(line1, "y2", "184.79");
    			attr_dev(line1, "stroke", "#454545");
    			attr_dev(line1, "stroke-width", "2");
    			add_location(line1, file$4, 348, 12, 10921);
    			attr_dev(line2, "id", "Line 14");
    			attr_dev(line2, "x1", "422.477");
    			attr_dev(line2, "y1", "165.698");
    			attr_dev(line2, "x2", "427.426");
    			attr_dev(line2, "y2", "170.648");
    			attr_dev(line2, "stroke", "#454545");
    			attr_dev(line2, "stroke-width", "2");
    			add_location(line2, file$4, 349, 12, 11039);
    			attr_dev(line3, "id", "Line 18");
    			attr_dev(line3, "x1", "436.619");
    			attr_dev(line3, "y1", "151.556");
    			attr_dev(line3, "x2", "441.568");
    			attr_dev(line3, "y2", "156.506");
    			attr_dev(line3, "stroke", "#454545");
    			attr_dev(line3, "stroke-width", "2");
    			add_location(line3, file$4, 350, 12, 11158);
    			attr_dev(line4, "id", "Line 8");
    			attr_dev(line4, "x1", "401.263");
    			attr_dev(line4, "y1", "186.912");
    			attr_dev(line4, "x2", "406.213");
    			attr_dev(line4, "y2", "191.861");
    			attr_dev(line4, "stroke", "#454545");
    			attr_dev(line4, "stroke-width", "2");
    			add_location(line4, file$4, 351, 12, 11277);
    			attr_dev(line5, "id", "Line 11");
    			attr_dev(line5, "x1", "415.405");
    			attr_dev(line5, "y1", "172.77");
    			attr_dev(line5, "x2", "420.355");
    			attr_dev(line5, "y2", "177.719");
    			attr_dev(line5, "stroke", "#454545");
    			attr_dev(line5, "stroke-width", "2");
    			add_location(line5, file$4, 352, 12, 11395);
    			attr_dev(line6, "id", "Line 15");
    			attr_dev(line6, "x1", "429.548");
    			attr_dev(line6, "y1", "158.627");
    			attr_dev(line6, "x2", "434.498");
    			attr_dev(line6, "y2", "163.577");
    			attr_dev(line6, "stroke", "#454545");
    			attr_dev(line6, "stroke-width", "2");
    			add_location(line6, file$4, 353, 12, 11513);
    			attr_dev(line7, "id", "Line 19");
    			attr_dev(line7, "x1", "443.69");
    			attr_dev(line7, "y1", "144.485");
    			attr_dev(line7, "x2", "448.64");
    			attr_dev(line7, "y2", "149.435");
    			attr_dev(line7, "stroke", "#454545");
    			attr_dev(line7, "stroke-width", "2");
    			add_location(line7, file$4, 354, 12, 11632);
    			attr_dev(line8, "id", "Line 7");
    			attr_dev(line8, "x1", "399.849");
    			attr_dev(line8, "y1", "192.569");
    			attr_dev(line8, "x2", "402.678");
    			attr_dev(line8, "y2", "195.397");
    			attr_dev(line8, "stroke", "#454545");
    			attr_dev(line8, "stroke-width", "2");
    			add_location(line8, file$4, 355, 12, 11749);
    			attr_dev(line9, "id", "Line 12");
    			attr_dev(line9, "x1", "413.991");
    			attr_dev(line9, "y1", "178.426");
    			attr_dev(line9, "x2", "416.82");
    			attr_dev(line9, "y2", "181.255");
    			attr_dev(line9, "stroke", "#454545");
    			attr_dev(line9, "stroke-width", "2");
    			add_location(line9, file$4, 356, 12, 11867);
    			attr_dev(line10, "id", "Line 16");
    			attr_dev(line10, "x1", "428.133");
    			attr_dev(line10, "y1", "164.284");
    			attr_dev(line10, "x2", "430.962");
    			attr_dev(line10, "y2", "167.113");
    			attr_dev(line10, "stroke", "#454545");
    			attr_dev(line10, "stroke-width", "2");
    			add_location(line10, file$4, 357, 12, 11985);
    			attr_dev(line11, "id", "Line 20");
    			attr_dev(line11, "x1", "442.275");
    			attr_dev(line11, "y1", "150.142");
    			attr_dev(line11, "x2", "445.104");
    			attr_dev(line11, "y2", "152.971");
    			attr_dev(line11, "stroke", "#454545");
    			attr_dev(line11, "stroke-width", "2");
    			add_location(line11, file$4, 358, 12, 12104);
    			attr_dev(line12, "id", "Line 9");
    			attr_dev(line12, "x1", "406.92");
    			attr_dev(line12, "y1", "185.497");
    			attr_dev(line12, "x2", "409.749");
    			attr_dev(line12, "y2", "188.326");
    			attr_dev(line12, "stroke", "#454545");
    			attr_dev(line12, "stroke-width", "2");
    			add_location(line12, file$4, 359, 12, 12223);
    			attr_dev(line13, "id", "Line 13");
    			attr_dev(line13, "x1", "421.063");
    			attr_dev(line13, "y1", "171.355");
    			attr_dev(line13, "x2", "423.891");
    			attr_dev(line13, "y2", "174.184");
    			attr_dev(line13, "stroke", "#454545");
    			attr_dev(line13, "stroke-width", "2");
    			add_location(line13, file$4, 360, 12, 12340);
    			attr_dev(line14, "id", "Line 17");
    			attr_dev(line14, "x1", "435.205");
    			attr_dev(line14, "y1", "157.213");
    			attr_dev(line14, "x2", "438.033");
    			attr_dev(line14, "y2", "160.042");
    			attr_dev(line14, "stroke", "#454545");
    			attr_dev(line14, "stroke-width", "2");
    			add_location(line14, file$4, 361, 12, 12459);
    			attr_dev(g0, "id", "design-icon-ruler");
    			add_location(g0, file$4, 345, 10, 10594);
    			attr_dev(path1, "id", "Rectangle 7");
    			attr_dev(path1, "d", "M390.098 141.098L405.419 147.227L449.468 191.276C451.03 192.838 451.03 195.37 449.468 196.933L445.932 200.468C444.37 202.03 441.838 202.03 440.275 200.468L396.226 156.419L390.098 141.098Z");
    			attr_dev(path1, "fill", "white");
    			attr_dev(path1, "stroke", "#454545");
    			attr_dev(path1, "stroke-width", "2");
    			add_location(path1, file$4, 364, 12, 12631);
    			attr_dev(path2, "id", "Line 4");
    			attr_dev(path2, "d", "M405.273 147.082L396.081 156.274");
    			attr_dev(path2, "stroke", "#454545");
    			attr_dev(path2, "stroke-width", "2");
    			add_location(path2, file$4, 365, 12, 12907);
    			attr_dev(path3, "id", "Line 5");
    			attr_dev(path3, "d", "M447.346 189.154L438.154 198.347");
    			attr_dev(path3, "stroke", "#454545");
    			attr_dev(path3, "stroke-width", "2");
    			add_location(path3, file$4, 366, 12, 13010);
    			attr_dev(g1, "id", "design-icon-pencil");
    			add_location(g1, file$4, 363, 10, 12591);
    			attr_dev(g2, "id", "icon design-icon");
    			add_location(g2, file$4, 344, 8, 10558);
    			attr_dev(path4, "d", "M356 238c0-.7 0-1.2.2-1.5l1.3-.3c.4-.2.6-.4.7-.8l.2-1.8v-9.4c0-.7 0-1.2-.2-1.6-.1-.4-.3-.6-.7-.8l-1.3-.3a7 7 0 01-.1-1.6 131.8 131.8 0 006.4 0h2c3.4 0 6.3.6 8.5 1.9 2.2 1.2 3.4 3.4 3.4 6.7 0 3.8-1.3 6.3-3.8 7.6a18 18 0 01-8.2 1.9H356zm8.5-1.6c1.8 0 3.2-.2 4.4-.6a5.3 5.3 0 002.8-2.2c.7-1.1 1.1-2.6 1.1-4.6 0-2.7-.8-4.6-2.5-5.8a10.7 10.7 0 00-6.4-1.7c-1 0-1.7 0-2.2.2v11.9c0 .7 0 1.3.2 1.7.2.4.4.7.8.9l1.8.2zM395.8 232.9a3 3 0 011.6.8c-.5 1.1-.8 2.6-1 4.3h-15.3c0-.7 0-1.2.2-1.5l1.3-.3c.3-.2.5-.4.7-.8l.1-1.8v-9.4c0-.7 0-1.2-.2-1.6-.1-.4-.3-.6-.6-.8l-1.3-.3-.2-1.6a204.6 204.6 0 0014.5 0l.7 4.5a3 3 0 01-1.6.4c-.1-1-.5-1.8-1.3-2.4-.7-.6-2-.9-3.8-.9h-2.9v6.7h1.8c1.3 0 2.2-.2 2.7-.5.5-.2.7-.8.8-1.5.5-.2 1-.3 1.6-.3a43.4 43.4 0 000 6.2c-.6 0-1.2-.1-1.6-.3 0-.7-.3-1.3-.8-1.6-.5-.3-1.4-.4-2.7-.4h-1.8v3.8c0 .7.1 1.3.3 1.7.1.4.4.7.8.9l1.8.2h.2a11 11 0 003.2-.4c.8-.2 1.3-.6 1.7-1 .4-.5.7-1.2 1-2.1zM409.8 238.3a15.2 15.2 0 01-7-1.6c.2-1.6.3-3 .2-4.2.5-.2 1.2-.3 2-.3 0 1.5.5 2.6 1.4 3.3.9.7 2.1 1 3.8 1 1.4 0 2.5-.2 3.3-.7.8-.4 1.2-1 1.2-1.7 0-.5-.2-1-.6-1.3-.4-.4-.9-.7-1.5-1l-2.4-.9-3.6-1.4c-1-.5-1.7-1-2.4-1.8-.6-.8-1-1.8-1-3 0-1.6.7-2.8 1.9-3.7a8.7 8.7 0 015-1.2c1.1 0 2.2 0 3.3.3 1.1.2 2 .5 2.6.8a15 15 0 00.2 3.8c-.5.3-1.1.4-2 .4-.3-1.4-.8-2.3-1.6-2.8-.8-.6-1.7-.9-2.8-.9-1 0-1.9.2-2.6.6-.6.3-1 .9-1 1.6 0 .8.4 1.4 1.2 1.9.8.5 2 1 3.6 1.6 1.4.4 2.5.9 3.4 1.3 1 .5 1.7 1 2.3 1.8a4 4 0 011 2.7c0 1.6-.7 2.9-2 3.9s-3.3 1.5-6 1.5zM423 238c0-.7 0-1.2.2-1.5l1.3-.3c.3-.2.5-.4.7-.8l.1-1.6v-9.6l-.1-1.6c-.2-.4-.4-.6-.7-.8l-1.3-.3-.2-1.6a131.1 131.1 0 008 0l-.1 1.6c-1 .1-1.5.3-1.8.6-.3.4-.4 1-.4 2v9.7c0 1 .1 1.7.4 2 .3.4.9.6 1.8.7v1.6a140.7 140.7 0 00-7.9 0zM446.2 238.3c-2 0-3.9-.4-5.5-1.2a9 9 0 01-3.7-3.3c-.9-1.5-1.3-3.1-1.3-5s.5-3.5 1.6-4.9c1-1.3 2.3-2.4 4-3a14 14 0 015.4-1.1 23.3 23.3 0 017.6 1.3c-.2.9-.3 2.3-.3 4.1-.5.2-1 .3-1.9.3 0-1.5-.5-2.6-1.4-3.2-1-.6-2.2-1-3.8-1-1.6 0-3 .4-4.2 1a6 6 0 00-2.5 2.5 7 7 0 00-.8 3.4 9 9 0 001.9 6 6.8 6.8 0 005.5 2.3 31.5 31.5 0 003-.3c.4 0 .6-.2.8-.5.2-.3.3-.8.3-1.4v-1.1c0-.7 0-1.2-.2-1.5a1 1 0 00-.7-.6l-1.8-.2-.2-1.7a62.2 62.2 0 007.7 0c0 .7 0 1.2-.2 1.7-.4 0-.8 0-1 .2-.2 0-.3.3-.4.6v3.5c0 .3.2.6.4 1-1 .6-2.2 1.1-3.6 1.5-1.4.4-3 .6-4.7.6zM479 220h3c0 .6 0 1.2-.2 1.5-.5.1-.9.2-1.1.4-.3.3-.5.6-.6 1.2l-.1 2.2V238c-.3.2-.8.3-1.5.3l-13-14.3v8.6l.2 2.3c.2.6.4 1 .7 1.2.3.2.8.3 1.4.4l.2 1.6a89.7 89.7 0 00-6.5 0c0-.7 0-1.3.2-1.6.6-.1 1-.2 1.3-.4.3-.3.5-.6.7-1.2l.2-2.3v-10.5l-.7-.4a9 9 0 00-1.5-.2l-.2-1.6a45.5 45.5 0 004.8 0l12 13.5v-8l-.2-2.3c-.2-.6-.4-1-.7-1.2-.3-.2-.8-.3-1.4-.4l-.1-1.6 3 .1z");
    			add_location(path4, file$4, 370, 10, 13183);
    			attr_dev(g3, "id", "design-word");
    			attr_dev(g3, "fill", "#454545");
    			add_location(g3, file$4, 369, 8, 13137);
    			attr_dev(g4, "id", "design-set");
    			add_location(g4, file$4, 343, 6, 10530);
    			attr_dev(rect1, "id", "Rectangle 12");
    			attr_dev(rect1, "x", "423.142");
    			attr_dev(rect1, "y", "283.363");
    			attr_dev(rect1, "width", "7.48801");
    			attr_dev(rect1, "height", "65.827");
    			attr_dev(rect1, "rx", "1");
    			attr_dev(rect1, "transform", "rotate(39.6594 423.142 283.363)");
    			attr_dev(rect1, "fill", "#454545");
    			attr_dev(rect1, "stroke", "#454545");
    			attr_dev(rect1, "stroke-width", "2");
    			add_location(rect1, file$4, 379, 12, 15907);
    			attr_dev(rect2, "id", "Rectangle 13");
    			attr_dev(rect2, "x", "423.26");
    			attr_dev(rect2, "y", "284.627");
    			attr_dev(rect2, "width", "5.69281");
    			attr_dev(rect2, "height", "4.744");
    			attr_dev(rect2, "transform", "rotate(39.6594 423.26 284.627)");
    			attr_dev(rect2, "fill", "white");
    			add_location(rect2, file$4, 380, 12, 16101);
    			attr_dev(g5, "id", "magic-icon-wand");
    			add_location(g5, file$4, 378, 10, 15870);
    			attr_dev(path5, "class", "magic-icon-stems");
    			attr_dev(path5, "d", "M424.079 284C425.845 280.22 427.698 272.5 427.698 268.3C427.698 264.1 426.991 259.48 425.579 257.5");
    			attr_dev(path5, "stroke", "#454545");
    			attr_dev(path5, "stroke-width", "2");
    			add_location(path5, file$4, 382, 10, 16262);
    			attr_dev(path6, "class", "magic-icon-stems");
    			attr_dev(path6, "d", "M428.366 287.411C431.096 285.176 438.421 282.315 442.624 282.315C447.078 282.315 448.579 282.5 452.079 283");
    			attr_dev(path6, "stroke", "#454545");
    			attr_dev(path6, "stroke-width", "2");
    			add_location(path6, file$4, 383, 10, 16442);
    			attr_dev(path7, "class", "magic-icon-stems");
    			attr_dev(path7, "d", "M426 286L453.5 253");
    			attr_dev(path7, "stroke", "#454545");
    			attr_dev(path7, "stroke-width", "2");
    			add_location(path7, file$4, 384, 10, 16630);
    			attr_dev(path8, "d", "M440.4 289.665C444.604 296.947 449.801 290.132 451.874 285.814L449.472 281.653C444.696 281.289 436.196 282.382 440.4 289.665Z");
    			attr_dev(path8, "class", "petal svelte-1jxgps3");
    			add_location(path8, file$4, 387, 12, 16790);
    			attr_dev(path9, "d", "M440.4 273.523C436.196 280.805 444.696 281.898 449.472 281.535L451.875 277.373C449.802 273.056 444.605 266.241 440.4 273.523Z");
    			attr_dev(path9, "class", "petal svelte-1jxgps3");
    			add_location(path9, file$4, 388, 12, 16954);
    			attr_dev(path10, "d", "M454.362 265.565C445.956 265.565 449.259 273.572 451.961 277.575H456.764C459.466 273.572 462.768 265.565 454.362 265.565Z");
    			attr_dev(path10, "class", "petal svelte-1jxgps3");
    			add_location(path10, file$4, 389, 12, 17118);
    			attr_dev(path11, "d", "M454.362 298.435C462.768 298.435 459.465 290.007 456.763 285.793H451.96C449.258 290.007 445.956 298.435 454.362 298.435Z");
    			attr_dev(path11, "class", "petal svelte-1jxgps3");
    			add_location(path11, file$4, 390, 12, 17278);
    			attr_dev(path12, "d", "M468.391 289.665C472.596 282.383 464.095 281.289 459.319 281.653L456.917 285.814C458.99 290.132 464.187 296.947 468.391 289.665Z");
    			attr_dev(path12, "class", "petal svelte-1jxgps3");
    			add_location(path12, file$4, 391, 12, 17437);
    			attr_dev(path13, "d", "M468.392 273.523C464.187 266.241 458.99 273.056 456.917 277.373L459.32 281.535C464.095 281.898 472.596 280.805 468.392 273.523Z");
    			attr_dev(path13, "class", "petal svelte-1jxgps3");
    			add_location(path13, file$4, 392, 12, 17604);
    			attr_dev(path14, "d", "M440.4 289.665C444.604 296.947 449.801 290.132 451.874 285.814L449.472 281.653C444.696 281.289 436.196 282.382 440.4 289.665Z");
    			attr_dev(path14, "class", "petal svelte-1jxgps3");
    			add_location(path14, file$4, 393, 12, 17770);
    			attr_dev(path15, "d", "M440.4 273.523C436.196 280.805 444.696 281.898 449.472 281.535L451.875 277.373C449.802 273.056 444.605 266.241 440.4 273.523Z");
    			attr_dev(path15, "class", "petal svelte-1jxgps3");
    			add_location(path15, file$4, 394, 12, 17934);
    			attr_dev(path16, "d", "M454.362 265.565C445.956 265.565 449.259 273.572 451.961 277.575H456.764C459.466 273.572 462.768 265.565 454.362 265.565Z");
    			attr_dev(path16, "class", "petal svelte-1jxgps3");
    			add_location(path16, file$4, 395, 12, 18098);
    			attr_dev(path17, "d", "M454.362 298.435C462.768 298.435 459.465 290.007 456.763 285.793H451.96C449.258 290.007 445.956 298.435 454.362 298.435Z");
    			attr_dev(path17, "class", "petal svelte-1jxgps3");
    			add_location(path17, file$4, 396, 12, 18258);
    			attr_dev(path18, "d", "M468.391 289.665C472.596 282.383 464.095 281.289 459.319 281.653L456.917 285.814C458.99 290.132 464.187 296.947 468.391 289.665Z");
    			attr_dev(path18, "class", "petal svelte-1jxgps3");
    			add_location(path18, file$4, 397, 12, 18417);
    			attr_dev(path19, "d", "M468.392 273.523C464.187 266.241 458.99 273.056 456.917 277.373L459.32 281.535C464.095 281.898 472.596 280.805 468.392 273.523Z");
    			attr_dev(path19, "class", "petal svelte-1jxgps3");
    			add_location(path19, file$4, 398, 12, 18584);
    			attr_dev(g6, "id", "burst1");
    			attr_dev(g6, "class", "magic-icon-petalbursts");
    			add_location(g6, file$4, 386, 10, 16731);
    			attr_dev(path20, "d", "M440.4 289.665C444.604 296.947 449.801 290.132 451.874 285.814L449.472 281.653C444.696 281.289 436.196 282.382 440.4 289.665Z");
    			attr_dev(path20, "class", "petal svelte-1jxgps3");
    			add_location(path20, file$4, 402, 12, 18807);
    			attr_dev(path21, "d", "M440.4 273.523C436.196 280.805 444.696 281.898 449.472 281.535L451.875 277.373C449.802 273.056 444.605 266.241 440.4 273.523Z");
    			attr_dev(path21, "class", "petal svelte-1jxgps3");
    			add_location(path21, file$4, 403, 12, 18971);
    			attr_dev(path22, "d", "M454.362 265.565C445.956 265.565 449.259 273.572 451.961 277.575H456.764C459.466 273.572 462.768 265.565 454.362 265.565Z");
    			attr_dev(path22, "class", "petal svelte-1jxgps3");
    			add_location(path22, file$4, 404, 12, 19135);
    			attr_dev(path23, "d", "M454.362 298.435C462.768 298.435 459.465 290.007 456.763 285.793H451.96C449.258 290.007 445.956 298.435 454.362 298.435Z");
    			attr_dev(path23, "class", "petal svelte-1jxgps3");
    			add_location(path23, file$4, 405, 12, 19295);
    			attr_dev(path24, "d", "M468.391 289.665C472.596 282.383 464.095 281.289 459.319 281.653L456.917 285.814C458.99 290.132 464.187 296.947 468.391 289.665Z");
    			attr_dev(path24, "class", "petal svelte-1jxgps3");
    			add_location(path24, file$4, 406, 12, 19454);
    			attr_dev(path25, "d", "M468.392 273.523C464.187 266.241 458.99 273.056 456.917 277.373L459.32 281.535C464.095 281.898 472.596 280.805 468.392 273.523Z");
    			attr_dev(path25, "class", "petal svelte-1jxgps3");
    			add_location(path25, file$4, 407, 12, 19621);
    			attr_dev(path26, "d", "M459.867 282C459.867 284.841 457.428 287.189 454.362 287.189C451.296 287.189 448.857 284.841 448.857 282C448.857 279.159 451.296 276.811 454.362 276.811C457.428 276.811 459.867 279.159 459.867 282Z");
    			attr_dev(path26, "fill", "white");
    			attr_dev(path26, "stroke", "#454545");
    			attr_dev(path26, "stroke-width", "2");
    			add_location(path26, file$4, 408, 12, 19787);
    			attr_dev(g7, "class", "magic-icon-flowers");
    			add_location(g7, file$4, 401, 10, 18764);
    			attr_dev(path27, "d", "M405.919 258.928C410.268 266.46 415.643 259.411 417.788 254.945L415.303 250.641C410.363 250.265 401.57 251.396 405.919 258.928Z");
    			attr_dev(path27, "class", "petal svelte-1jxgps3");
    			add_location(path27, file$4, 412, 12, 20129);
    			attr_dev(path28, "d", "M405.919 242.231C401.571 249.764 410.363 250.895 415.303 250.519L417.788 246.214C415.644 241.748 410.268 234.699 405.919 242.231Z");
    			attr_dev(path28, "class", "petal svelte-1jxgps3");
    			add_location(path28, file$4, 413, 12, 20295);
    			attr_dev(path29, "d", "M420.361 234C411.666 234 415.082 242.282 417.877 246.423H422.845C425.64 242.282 429.056 234 420.361 234Z");
    			attr_dev(path29, "class", "petal svelte-1jxgps3");
    			add_location(path29, file$4, 414, 12, 20463);
    			attr_dev(path30, "d", "M420.361 268C429.056 268 425.64 259.282 422.845 254.923H417.877C415.082 259.282 411.666 268 420.361 268Z");
    			attr_dev(path30, "class", "petal svelte-1jxgps3");
    			add_location(path30, file$4, 415, 12, 20606);
    			attr_dev(path31, "d", "M434.872 258.928C439.221 251.396 430.428 250.265 425.489 250.641L423.003 254.945C425.148 259.411 430.523 266.46 434.872 258.928Z");
    			attr_dev(path31, "class", "petal svelte-1jxgps3");
    			add_location(path31, file$4, 416, 12, 20749);
    			attr_dev(path32, "d", "M434.873 242.232C430.524 234.699 425.148 241.748 423.004 246.215L425.489 250.519C430.429 250.895 439.221 249.764 434.873 242.232Z");
    			attr_dev(path32, "class", "petal svelte-1jxgps3");
    			add_location(path32, file$4, 417, 12, 20916);
    			attr_dev(path33, "d", "M405.919 258.928C410.268 266.46 415.643 259.411 417.788 254.945L415.303 250.641C410.363 250.265 401.57 251.396 405.919 258.928Z");
    			attr_dev(path33, "class", "petal svelte-1jxgps3");
    			add_location(path33, file$4, 418, 12, 21084);
    			attr_dev(path34, "d", "M405.919 242.231C401.571 249.764 410.363 250.895 415.303 250.519L417.788 246.214C415.644 241.748 410.268 234.699 405.919 242.231Z");
    			attr_dev(path34, "class", "petal svelte-1jxgps3");
    			add_location(path34, file$4, 419, 12, 21250);
    			attr_dev(path35, "d", "M420.361 234C411.666 234 415.082 242.282 417.877 246.423H422.845C425.64 242.282 429.056 234 420.361 234Z");
    			attr_dev(path35, "class", "petal svelte-1jxgps3");
    			add_location(path35, file$4, 420, 12, 21418);
    			attr_dev(path36, "d", "M420.361 268C429.056 268 425.64 259.282 422.845 254.923H417.877C415.082 259.282 411.666 268 420.361 268Z");
    			attr_dev(path36, "class", "petal svelte-1jxgps3");
    			add_location(path36, file$4, 421, 12, 21561);
    			attr_dev(path37, "d", "M434.872 258.928C439.221 251.396 430.428 250.265 425.489 250.641L423.003 254.945C425.148 259.411 430.523 266.46 434.872 258.928Z");
    			attr_dev(path37, "class", "petal svelte-1jxgps3");
    			add_location(path37, file$4, 422, 12, 21704);
    			attr_dev(path38, "d", "M434.873 242.232C430.524 234.699 425.148 241.748 423.004 246.215L425.489 250.519C430.429 250.895 439.221 249.764 434.873 242.232Z");
    			attr_dev(path38, "class", "petal svelte-1jxgps3");
    			add_location(path38, file$4, 423, 12, 21871);
    			attr_dev(g8, "id", "burst2");
    			attr_dev(g8, "class", "magic-icon-petalbursts");
    			add_location(g8, file$4, 411, 10, 20070);
    			attr_dev(path39, "d", "M405.919 258.928C410.268 266.46 415.643 259.411 417.788 254.945L415.303 250.641C410.363 250.265 401.57 251.396 405.919 258.928Z");
    			attr_dev(path39, "class", "petal svelte-1jxgps3");
    			add_location(path39, file$4, 427, 12, 22096);
    			attr_dev(path40, "d", "M405.919 242.231C401.571 249.764 410.363 250.895 415.303 250.519L417.788 246.214C415.644 241.748 410.268 234.699 405.919 242.231Z");
    			attr_dev(path40, "class", "petal svelte-1jxgps3");
    			add_location(path40, file$4, 428, 12, 22262);
    			attr_dev(path41, "d", "M420.361 234C411.666 234 415.082 242.282 417.877 246.423H422.845C425.64 242.282 429.056 234 420.361 234Z");
    			attr_dev(path41, "class", "petal svelte-1jxgps3");
    			add_location(path41, file$4, 429, 12, 22430);
    			attr_dev(path42, "d", "M420.361 268C429.056 268 425.64 259.282 422.845 254.923H417.877C415.082 259.282 411.666 268 420.361 268Z");
    			attr_dev(path42, "class", "petal svelte-1jxgps3");
    			add_location(path42, file$4, 430, 12, 22573);
    			attr_dev(path43, "d", "M434.872 258.928C439.221 251.396 430.428 250.265 425.489 250.641L423.003 254.945C425.148 259.411 430.523 266.46 434.872 258.928Z");
    			attr_dev(path43, "class", "petal svelte-1jxgps3");
    			add_location(path43, file$4, 431, 12, 22716);
    			attr_dev(path44, "d", "M434.873 242.232C430.524 234.699 425.148 241.748 423.004 246.215L425.489 250.519C430.429 250.895 439.221 249.764 434.873 242.232Z");
    			attr_dev(path44, "class", "petal svelte-1jxgps3");
    			add_location(path44, file$4, 432, 12, 22883);
    			attr_dev(path45, "d", "M426.072 251C426.072 253.949 423.541 256.384 420.361 256.384C417.181 256.384 414.649 253.949 414.649 251C414.649 248.051 417.181 245.615 420.361 245.615C423.541 245.615 426.072 248.051 426.072 251Z");
    			attr_dev(path45, "fill", "white");
    			attr_dev(path45, "stroke", "#454545");
    			attr_dev(path45, "stroke-width", "2");
    			add_location(path45, file$4, 433, 12, 23051);
    			attr_dev(g9, "class", "magic-icon-flowers");
    			add_location(g9, file$4, 426, 10, 22053);
    			attr_dev(path46, "d", "M434.512 260.793C439.885 270.098 446.525 261.39 449.174 255.873L446.104 250.556C440.002 250.092 429.14 251.489 434.512 260.793Z");
    			attr_dev(path46, "class", "petal svelte-1jxgps3");
    			add_location(path46, file$4, 437, 12, 23393);
    			attr_dev(path47, "d", "M434.513 240.168C429.141 249.473 440.002 250.87 446.104 250.405L449.174 245.088C446.525 239.571 439.885 230.864 434.513 240.168Z");
    			attr_dev(path47, "class", "petal svelte-1jxgps3");
    			add_location(path47, file$4, 438, 12, 23559);
    			attr_dev(path48, "d", "M452.353 230C441.612 230 445.832 240.231 449.284 245.346H455.421C458.874 240.231 463.093 230 452.353 230Z");
    			attr_dev(path48, "class", "petal svelte-1jxgps3");
    			add_location(path48, file$4, 439, 12, 23726);
    			attr_dev(path49, "d", "M452.352 272C463.093 272 458.874 261.231 455.421 255.846H449.284C445.831 261.231 441.612 272 452.352 272Z");
    			attr_dev(path49, "class", "petal svelte-1jxgps3");
    			add_location(path49, file$4, 440, 12, 23870);
    			attr_dev(path50, "d", "M470.278 260.793C475.65 251.489 464.789 250.092 458.687 250.557L455.617 255.873C458.266 261.39 464.906 270.098 470.278 260.793Z");
    			attr_dev(path50, "class", "petal svelte-1jxgps3");
    			add_location(path50, file$4, 441, 12, 24014);
    			attr_dev(path51, "d", "M470.279 240.168C464.906 230.864 458.266 239.572 455.617 245.088L458.687 250.405C464.789 250.87 475.651 249.473 470.279 240.168Z");
    			attr_dev(path51, "class", "petal svelte-1jxgps3");
    			add_location(path51, file$4, 442, 12, 24180);
    			attr_dev(path52, "d", "M434.512 260.793C439.885 270.098 446.525 261.39 449.174 255.873L446.104 250.556C440.002 250.092 429.14 251.489 434.512 260.793Z");
    			attr_dev(path52, "class", "petal svelte-1jxgps3");
    			add_location(path52, file$4, 443, 12, 24347);
    			attr_dev(path53, "d", "M434.513 240.168C429.141 249.473 440.002 250.87 446.104 250.405L449.174 245.088C446.525 239.571 439.885 230.864 434.513 240.168Z");
    			attr_dev(path53, "class", "petal svelte-1jxgps3");
    			add_location(path53, file$4, 444, 12, 24513);
    			attr_dev(path54, "d", "M452.353 230C441.612 230 445.832 240.231 449.284 245.346H455.421C458.874 240.231 463.093 230 452.353 230Z");
    			attr_dev(path54, "class", "petal svelte-1jxgps3");
    			add_location(path54, file$4, 445, 12, 24680);
    			attr_dev(path55, "d", "M452.352 272C463.093 272 458.874 261.231 455.421 255.846H449.284C445.831 261.231 441.612 272 452.352 272Z");
    			attr_dev(path55, "class", "petal svelte-1jxgps3");
    			add_location(path55, file$4, 446, 12, 24824);
    			attr_dev(path56, "d", "M470.278 260.793C475.65 251.489 464.789 250.092 458.687 250.557L455.617 255.873C458.266 261.39 464.906 270.098 470.278 260.793Z");
    			attr_dev(path56, "class", "petal svelte-1jxgps3");
    			add_location(path56, file$4, 447, 12, 24968);
    			attr_dev(path57, "d", "M470.279 240.168C464.906 230.864 458.266 239.572 455.617 245.088L458.687 250.405C464.789 250.87 475.651 249.473 470.279 240.168Z");
    			attr_dev(path57, "class", "petal svelte-1jxgps3");
    			add_location(path57, file$4, 448, 12, 25134);
    			attr_dev(g10, "id", "burst3");
    			attr_dev(g10, "class", "magic-icon-petalbursts");
    			add_location(g10, file$4, 436, 10, 23334);
    			attr_dev(path58, "d", "M434.512 260.793C439.885 270.098 446.525 261.39 449.174 255.873L446.104 250.556C440.002 250.092 429.14 251.489 434.512 260.793Z");
    			attr_dev(path58, "class", "petal svelte-1jxgps3");
    			add_location(path58, file$4, 452, 12, 25358);
    			attr_dev(path59, "d", "M434.513 240.168C429.141 249.473 440.002 250.87 446.104 250.405L449.174 245.088C446.525 239.571 439.885 230.864 434.513 240.168Z");
    			attr_dev(path59, "class", "petal svelte-1jxgps3");
    			add_location(path59, file$4, 453, 12, 25524);
    			attr_dev(path60, "d", "M452.353 230C441.612 230 445.832 240.231 449.284 245.346H455.421C458.874 240.231 463.093 230 452.353 230Z");
    			attr_dev(path60, "class", "petal svelte-1jxgps3");
    			add_location(path60, file$4, 454, 12, 25691);
    			attr_dev(path61, "d", "M452.352 272C463.093 272 458.874 261.231 455.421 255.846H449.284C445.831 261.231 441.612 272 452.352 272Z");
    			attr_dev(path61, "class", "petal svelte-1jxgps3");
    			add_location(path61, file$4, 455, 12, 25835);
    			attr_dev(path62, "d", "M470.278 260.793C475.65 251.489 464.789 250.092 458.687 250.557L455.617 255.873C458.266 261.39 464.906 270.098 470.278 260.793Z");
    			attr_dev(path62, "class", "petal svelte-1jxgps3");
    			add_location(path62, file$4, 456, 12, 25979);
    			attr_dev(path63, "d", "M470.279 240.168C464.906 230.864 458.266 239.572 455.617 245.088L458.687 250.405C464.789 250.87 475.651 249.473 470.279 240.168Z");
    			attr_dev(path63, "class", "petal svelte-1jxgps3");
    			add_location(path63, file$4, 457, 12, 26145);
    			attr_dev(path64, "d", "M459.526 251C459.526 254.713 456.34 257.769 452.353 257.769C448.365 257.769 445.18 254.713 445.18 251C445.18 247.287 448.365 244.231 452.353 244.231C456.34 244.231 459.526 247.287 459.526 251Z");
    			attr_dev(path64, "fill", "white");
    			attr_dev(path64, "stroke", "#454545");
    			attr_dev(path64, "stroke-width", "2");
    			add_location(path64, file$4, 458, 12, 26312);
    			attr_dev(g11, "class", "magic-icon-flowers");
    			add_location(g11, file$4, 451, 10, 25315);
    			attr_dev(g12, "id", "icon magic-icon");
    			add_location(g12, file$4, 377, 8, 15835);
    			attr_dev(path65, "d", "M389.75 372.46c.12.39.18.89.18 1.51a109.03 109.03 0 00-8 0c0-.48.07-.98.19-1.5a3.4 3.4 0 001.62-.44c.28-.24.43-.68.43-1.33 0-.17-.05-.69-.15-1.55l-1.11-8.57-6.41 12.85c-.38.15-.85.22-1.4.22l-6.66-13-1.01 7.6c-.07.65-.11 1.2-.11 1.65 0 .94.16 1.59.47 1.95.33.36.9.56 1.69.61.12.39.18.89.18 1.51a74.61 74.61 0 00-6.66 0c0-.62.06-1.12.18-1.5a2.5 2.5 0 001.33-.44c.34-.24.59-.65.76-1.22.19-.6.35-1.48.47-2.63l1-7.92c.03-.17.04-.41.04-.72 0-.82-.17-1.37-.5-1.66-.32-.29-.87-.43-1.66-.43a6.16 6.16 0 01-.18-1.62 50.06 50.06 0 005.22 0l7.02 13.5 6.66-13.5c1.06.05 1.96.07 2.7.07.58 0 1.44-.02 2.6-.07 0 .7-.07 1.24-.19 1.62-.72 0-1.26.17-1.62.5-.36.31-.54.86-.54 1.62 0 .31.01.57.04.76l1.11 8.5c.15 1.03.3 1.78.44 2.26.16.48.38.82.64 1.01.3.2.7.31 1.23.36zM413.02 372.35c.12.36.18.9.18 1.62-.96-.05-2.2-.07-3.71-.07-1.58 0-2.86.03-3.82.07 0-.74.08-1.28.22-1.62.55-.07.94-.17 1.15-.29a.68.68 0 00.36-.6c0-.22-.12-.6-.36-1.12l-.72-1.55c-3.45 0-6.18.06-8.17.18l-.4.93c-.24.56-.36.99-.36 1.3 0 .67.5 1.06 1.48 1.15.14.44.22.97.22 1.62a57.14 57.14 0 00-5.55 0c0-.57.07-1.11.22-1.62.53-.1.93-.3 1.22-.65.29-.35.67-1.06 1.15-2.12l6.2-13.71c.45-.1.93-.15 1.44-.15l6.62 13.75c.53 1.1.97 1.85 1.33 2.23.39.39.82.6 1.3.65zm-7.42-5.04l-2.16-4.53a24.4 24.4 0 01-1.3-3.03c-.19.6-.43 1.2-.71 1.8l-.5 1.08-2.06 4.68h6.73zM426.56 374.15c-2.06 0-3.89-.4-5.47-1.19a9.04 9.04 0 01-3.7-3.3 9.4 9.4 0 01-1.3-4.94 7.8 7.8 0 011.54-4.9 9.57 9.57 0 014.07-3.1c1.68-.69 3.48-1.04 5.4-1.04 1.47 0 2.86.13 4.18.37 1.34.21 2.47.52 3.38.93-.21.91-.32 2.3-.32 4.14-.43.2-1.05.29-1.84.29-.07-1.51-.56-2.58-1.47-3.2a6.47 6.47 0 00-3.71-.94c-1.66 0-3.06.31-4.21.94a6.07 6.07 0 00-2.52 2.52 7.06 7.06 0 00-.83 3.38c0 2.45.63 4.44 1.9 5.97 1.3 1.54 3.14 2.3 5.51 2.3.75 0 1.32 0 1.73-.03.41-.02.83-.1 1.26-.21.39-.1.66-.28.83-.54.17-.3.25-.76.25-1.4v-1.12c0-.7-.06-1.2-.18-1.48a.99.99 0 00-.72-.61c-.36-.12-.95-.2-1.76-.22a5.33 5.33 0 01-.22-1.65c.55.05 1.86.07 3.93.07 2.04 0 3.3-.02 3.78-.07 0 .67-.06 1.22-.18 1.65-.46.03-.78.1-.98.22-.19.1-.32.29-.4.57-.06.27-.1.7-.1 1.3v.9c0 .55.02 1 .07 1.33.07.31.2.65.36 1.01a12.5 12.5 0 01-3.6 1.51c-1.41.36-2.97.54-4.68.54zM441.87 373.97c0-.74.06-1.28.18-1.62.6-.05 1.05-.14 1.33-.29.32-.14.53-.4.65-.75.12-.36.18-.9.18-1.62v-9.61c0-.7-.06-1.23-.18-1.59a1.2 1.2 0 00-.64-.75 3.81 3.81 0 00-1.34-.3c-.12-.35-.18-.9-.18-1.61a131.1 131.1 0 008 0 6.5 6.5 0 01-.15 1.62c-.86.05-1.45.24-1.76.57-.3.34-.44 1.03-.44 2.06v9.6c0 1.04.15 1.74.44 2.1.3.33.9.53 1.76.57.1.36.14.9.14 1.62a126.15 126.15 0 00-8 0zM472.22 357.05c-.24.91-.36 2.28-.36 4.1-.45.22-1.05.33-1.8.33-.07-1.56-.5-2.65-1.3-3.28-.76-.64-1.88-.97-3.34-.97-2.4 0-4.2.66-5.4 1.98a6.96 6.96 0 00-1.8 4.86c0 1.51.31 2.88.93 4.1a7.25 7.25 0 002.74 2.85c1.2.7 2.62 1.05 4.25 1.05a12.84 12.84 0 005.87-1.33c.14.11.27.3.4.53.11.22.18.42.2.62a20.14 20.14 0 01-3.8 1.72c-1.2.36-2.56.54-4.08.54-1.96 0-3.72-.4-5.25-1.19a8.9 8.9 0 01-4.9-8.17c0-1.94.5-3.6 1.48-4.97a9.08 9.08 0 013.89-3.13c1.63-.7 3.38-1.04 5.25-1.04a19.33 19.33 0 017.02 1.4z");
    			add_location(path65, file$4, 462, 10, 26645);
    			attr_dev(g13, "id", "magic-word");
    			attr_dev(g13, "fill", "#454545");
    			add_location(g13, file$4, 461, 8, 26600);
    			attr_dev(g14, "id", "magic-set");
    			add_location(g14, file$4, 376, 6, 15808);
    			attr_dev(path66, "id", "develop-icon-slash");
    			attr_dev(path66, "d", "M639.477 513.119L625.597 545.97");
    			attr_dev(path66, "stroke", "#454545");
    			attr_dev(path66, "stroke-width", "2");
    			add_location(path66, file$4, 470, 10, 29784);
    			attr_dev(rect3, "id", "develop-icon-screenbox");
    			attr_dev(rect3, "x", "596.06");
    			attr_dev(rect3, "y", "497");
    			attr_dev(rect3, "width", "73.8806");
    			attr_dev(rect3, "height", "60");
    			attr_dev(rect3, "rx", "4");
    			attr_dev(rect3, "stroke", "#454545");
    			attr_dev(rect3, "stroke-width", "2");
    			add_location(rect3, file$4, 471, 10, 29896);
    			attr_dev(line15, "id", "develop-icon-menuline");
    			attr_dev(line15, "x1", "595.06");
    			attr_dev(line15, "y1", "505.179");
    			attr_dev(line15, "x2", "670.94");
    			attr_dev(line15, "y2", "505.179");
    			attr_dev(line15, "stroke", "#454545");
    			attr_dev(line15, "stroke-width", "2");
    			add_location(line15, file$4, 472, 10, 30030);
    			attr_dev(circle6, "id", "develop-icon-dot1");
    			attr_dev(circle6, "cx", "601.075");
    			attr_dev(circle6, "cy", "501.089");
    			attr_dev(circle6, "r", "1.38806");
    			attr_dev(circle6, "fill", "#454545");
    			add_location(circle6, file$4, 473, 10, 30159);
    			attr_dev(circle7, "id", "develop-icon-dot2");
    			attr_dev(circle7, "cx", "606.627");
    			attr_dev(circle7, "cy", "501.089");
    			attr_dev(circle7, "r", "1.38806");
    			attr_dev(circle7, "fill", "#454545");
    			add_location(circle7, file$4, 474, 10, 30255);
    			attr_dev(circle8, "id", "develop-icon-dot3");
    			attr_dev(circle8, "cx", "612.179");
    			attr_dev(circle8, "cy", "501.089");
    			attr_dev(circle8, "r", "1.38806");
    			attr_dev(circle8, "fill", "#454545");
    			add_location(circle8, file$4, 475, 10, 30351);
    			attr_dev(path67, "id", "develop-icon-open-bracket");
    			attr_dev(path67, "d", "M617.731 517.746L606.164 529.314L617.731 540.881");
    			attr_dev(path67, "stroke", "#454545");
    			attr_dev(path67, "stroke-width", "2");
    			add_location(path67, file$4, 476, 10, 30447);
    			attr_dev(path68, "id", "develop-icon-close-bracket");
    			attr_dev(path68, "d", "M645.955 540.881L657.522 529.313L645.955 517.746");
    			attr_dev(path68, "stroke", "#454545");
    			attr_dev(path68, "stroke-width", "2");
    			add_location(path68, file$4, 477, 10, 30583);
    			attr_dev(g15, "id", "develop-icon");
    			add_location(g15, file$4, 469, 8, 29752);
    			attr_dev(path69, "d", "M557.5 602c0-.7 0-1.2.2-1.5l1.3-.3c.3-.2.5-.4.6-.8.2-.4.3-1 .3-1.8v-9.4c0-.7-.1-1.2-.3-1.6 0-.4-.3-.6-.6-.8l-1.3-.3a7 7 0 01-.2-1.6 131.8 131.8 0 006.5 0h1.9c3.4 0 6.3.6 8.5 1.9 2.3 1.2 3.4 3.4 3.4 6.7 0 3.8-1.3 6.3-3.8 7.6a18 18 0 01-8.2 1.9h-8.3zm8.5-1.6c1.7 0 3.2-.2 4.3-.6a5.3 5.3 0 002.9-2.2c.7-1.1 1-2.6 1-4.6 0-2.7-.8-4.6-2.5-5.8a10.7 10.7 0 00-6.3-1.7c-1 0-1.7 0-2.2.2v11.9c0 .7 0 1.3.2 1.7.1.4.4.7.8.9l1.8.2zM597.2 596.9a3 3 0 011.6.8c-.4 1.1-.7 2.6-1 4.3h-15.3l.2-1.5 1.4-.3c.3-.2.5-.4.6-.8l.2-1.8v-9.4c0-.7 0-1.2-.2-1.6-.2-.4-.4-.6-.7-.8l-1.3-.3-.2-1.6a204.6 204.6 0 0014.6 0c.2 2.3.4 3.8.6 4.5a3 3 0 01-1.6.4c0-1-.5-1.8-1.2-2.4-.8-.6-2-.9-3.9-.9h-2.8v6.7h1.8c1.3 0 2.1-.2 2.6-.5.5-.2.8-.8.8-1.5.5-.2 1.1-.3 1.7-.3a43.4 43.4 0 000 6.2c-.7 0-1.2-.1-1.6-.3 0-.7-.4-1.3-.9-1.6-.5-.3-1.3-.4-2.6-.4h-1.8v3.8c0 .7 0 1.3.2 1.7.2.4.5.7.8.9l1.8.2h.3a11 11 0 003.2-.4c.7-.2 1.3-.6 1.7-1 .3-.5.7-1.2 1-2.1zM619.7 584h3.2l-.1 1.5c-1 .1-1.9 1.1-2.7 3a297 297 0 01-6.6 13.5c-.4.2-.8.2-1.4.2a326.4 326.4 0 00-7.7-15.6c-.2-.4-.5-.6-.7-.8-.2-.2-.5-.3-.9-.3a5 5 0 01-.2-1.6 96.3 96.3 0 008 0c0 .6 0 1.1-.2 1.6-.6 0-1 .1-1.4.3-.3.1-.4.3-.4.7 0 .4.2 1 .7 1.9 1.6 3 3.1 6.1 4.5 9.2 2-3.9 3.4-6.9 4.4-9.1.3-.6.4-1.2.4-1.7 0-.8-.5-1.2-1.5-1.3a5 5 0 01-.2-1.6l2.8.1zM642 596.9a3 3 0 011.6.8c-.5 1.1-.8 2.6-1 4.3h-15.3c0-.7 0-1.2.2-1.5l1.3-.3c.3-.2.5-.4.7-.8l.1-1.8v-9.4c0-.7 0-1.2-.2-1.6-.1-.4-.3-.6-.6-.8l-1.3-.3-.2-1.6a204.6 204.6 0 0014.5 0l.7 4.5a3 3 0 01-1.6.4c-.1-1-.5-1.8-1.3-2.4-.7-.6-2-.9-3.8-.9H633v6.7h1.8c1.2 0 2.1-.2 2.6-.5.5-.2.7-.8.8-1.5.5-.2 1-.3 1.6-.3a43.4 43.4 0 000 6.2c-.6 0-1.1-.1-1.6-.3 0-.7-.3-1.3-.8-1.6-.5-.3-1.4-.4-2.6-.4H633v3.8c0 .7 0 1.3.2 1.7.1.4.4.7.8.9l1.8.2h.2a11 11 0 003.2-.4c.8-.2 1.3-.6 1.7-1 .4-.5.8-1.2 1-2.1zM657.2 600.4c1.1 0 2-.1 2.7-.3.6-.3 1.2-.6 1.6-1.1.4-.5.8-1.2 1.1-2.1a3 3 0 011.6.8c-.4 1.1-.8 2.6-1 4.3H648.5c0-.7 0-1.2.2-1.5l1.3-.3c.3-.2.5-.4.7-.8l.2-1.8v-9.4l-.2-1.6c-.2-.4-.4-.6-.7-.8l-1.3-.3a7 7 0 01-.2-1.6 154.4 154.4 0 008 0c0 .7 0 1.3-.2 1.6-.8.1-1.4.3-1.7.7-.3.3-.4 1-.4 2v9.4c0 .7 0 1.3.2 1.7.1.4.4.7.8.9l1.8.2h.2zM678 602.3c-2 0-3.8-.4-5.4-1.1a8.9 8.9 0 01-3.7-3.3 9 9 0 01-1.3-4.8c0-1.9.4-3.5 1.3-4.9a8.8 8.8 0 013.7-3.3c1.6-.8 3.5-1.2 5.6-1.2 2 0 3.8.4 5.4 1.2a8.8 8.8 0 015 8.1 8.8 8.8 0 01-5 8.2c-1.6.7-3.4 1.1-5.5 1.1zm.6-1.6c2 0 3.5-.7 4.6-2 1.1-1.3 1.7-3 1.7-5.2a9 9 0 00-1-4.1 7 7 0 00-6.3-4c-2 0-3.5.7-4.6 2a7.6 7.6 0 00-1.7 5.1c0 1.6.3 3 1 4.3a7 7 0 006.3 3.9zM701.5 594c1.2 0 2.3-.2 3-.9.9-.6 1.3-1.6 1.3-3s-.5-2.5-1.3-3.3c-.9-.8-2.2-1.2-4-1.2-.4 0-.9 0-1.5.2v11.6c0 1.1.2 1.9.7 2.3.4.5 1.1.7 2.2.8l.2 1.6a117 117 0 00-8.7 0l.1-1.6c.9-.1 1.4-.3 1.7-.6.3-.4.5-1 .5-2.1v-9.6c0-.7 0-1.2-.2-1.6-.1-.4-.3-.6-.6-.8l-1.4-.3-.1-1.6 4.4.1h4.3c2.5 0 4.3.4 5.4 1.5a5 5 0 011.8 4c0 1-.3 2.1-.9 3.1a6 6 0 01-2.4 2.3c-1.1.6-2.4.9-4 .9-.9 0-1.6-.1-2.2-.3v-.7-.8h1.7z");
    			add_location(path69, file$4, 480, 10, 30778);
    			attr_dev(g16, "id", "develop-word");
    			attr_dev(g16, "fill", "#454545");
    			add_location(g16, file$4, 479, 8, 30731);
    			attr_dev(g17, "id", "develop-set");
    			add_location(g17, file$4, 468, 6, 29723);
    			attr_dev(path70, "id", "animate-icon-ghost1");
    			attr_dev(path70, "d", "M203 512C195.374 515.139 190 522.688 190 531.5C190 540.312 195.374 547.861 203 551");
    			attr_dev(path70, "stroke", "#454545");
    			attr_dev(path70, "stroke-width", "2");
    			attr_dev(path70, "stroke-linecap", "round");
    			add_location(path70, file$4, 487, 10, 33725);
    			attr_dev(path71, "id", "animate-icon-ghost2");
    			attr_dev(path71, "d", "M197 512C189.374 515.139 184 522.688 184 531.5C184 540.312 189.374 547.861 197 551");
    			attr_dev(path71, "stroke", "#454545");
    			attr_dev(path71, "stroke-width", "2");
    			attr_dev(path71, "stroke-linecap", "round");
    			add_location(path71, file$4, 488, 10, 33912);
    			attr_dev(path72, "id", "animate-icon-circle");
    			attr_dev(path72, "d", "M240 531C240 543.171 230.354 553 218.5 553C206.646 553 197 543.171 197 531C197 518.829 206.646 509 218.5 509C230.354 509 240 518.829 240 531Z");
    			attr_dev(path72, "fill", "white");
    			attr_dev(path72, "stroke", "#454545");
    			attr_dev(path72, "stroke-width", "2");
    			add_location(path72, file$4, 489, 10, 34099);
    			attr_dev(path73, "class", "animate-icon-line");
    			attr_dev(path73, "d", "M180 532L161 532");
    			attr_dev(path73, "stroke", "#454545");
    			attr_dev(path73, "stroke-width", "2");
    			attr_dev(path73, "stroke-linecap", "round");
    			add_location(path73, file$4, 491, 12, 34352);
    			attr_dev(path74, "class", "animate-icon-line");
    			attr_dev(path74, "d", "M181 525L168 525");
    			attr_dev(path74, "stroke", "#454545");
    			attr_dev(path74, "stroke-width", "2");
    			attr_dev(path74, "stroke-linecap", "round");
    			add_location(path74, file$4, 492, 12, 34476);
    			attr_dev(path75, "class", "animate-icon-line");
    			attr_dev(path75, "d", "M181 540L171 540");
    			attr_dev(path75, "stroke", "#454545");
    			attr_dev(path75, "stroke-width", "2");
    			attr_dev(path75, "stroke-linecap", "round");
    			add_location(path75, file$4, 493, 12, 34600);
    			add_location(g18, file$4, 490, 10, 34336);
    			attr_dev(g19, "id", "icon animate-icon");
    			add_location(g19, file$4, 486, 8, 33688);
    			attr_dev(path76, "d", "M145.7 599.5l.2 1.6a77.1 77.1 0 00-7.6 0c0-.8.1-1.3.3-1.6l1.1-.3c.2-.2.4-.4.4-.6l-.4-1.2-.7-1.5c-3.5 0-6.2 0-8.2.2l-.4.9-.3 1.3c0 .7.4 1 1.4 1.2.2.4.2 1 .2 1.6a57.1 57.1 0 00-5.5 0c0-.6 0-1.1.2-1.6a2 2 0 001.2-.7c.3-.4.7-1 1.2-2.1L135 583a7 7 0 011.4-.2l6.7 13.8 1.3 2.2c.4.4.8.6 1.3.7zm-7.4-5l-2.2-4.6-1.3-3a14 14 0 01-1.2 2.8l-2 4.7h6.7zM167.7 583h3c0 .6 0 1.2-.2 1.5l-1.1.4c-.3.3-.5.6-.6 1.2l-.1 2.2V601c-.3.2-.8.3-1.5.3l-13-14.3v8.6c0 1 .1 1.8.3 2.3.1.6.3 1 .6 1.2l1.4.4.2 1.6a89.7 89.7 0 00-6.5 0c0-.7 0-1.3.2-1.6.6-.1 1-.2 1.3-.4.3-.3.5-.6.7-1.2l.2-2.3v-10.5l-.7-.4a9 9 0 00-1.5-.2l-.2-1.6a45.5 45.5 0 004.8 0l12 13.5v-8c0-1 0-1.8-.2-2.3-.2-.6-.4-1-.7-1.2-.3-.2-.8-.3-1.4-.4l-.1-1.6 3 .1zM176.2 601l.1-1.5 1.4-.3c.3-.2.5-.4.6-.8l.2-1.6v-9.6c0-.7 0-1.2-.2-1.6-.1-.4-.3-.6-.6-.8l-1.4-.3-.1-1.6a131.1 131.1 0 008 0l-.2 1.6c-.9.1-1.5.3-1.8.6-.3.4-.4 1-.4 2v9.7c0 1 .1 1.7.4 2 .3.4 1 .6 1.8.7l.1 1.6a140.7 140.7 0 00-8 0zM215.6 599.6l.2 1.5a109 109 0 00-8 0c0-.5 0-1 .2-1.5.8-.1 1.3-.3 1.6-.5.3-.2.4-.7.4-1.3l-.1-1.6-1.1-8.5-6.4 12.8a4 4 0 01-1.4.2l-6.7-13-1 7.6-.1 1.7c0 1 .1 1.6.4 2 .4.3 1 .5 1.7.6.2.3.2.8.2 1.5a93.7 93.7 0 00-6.6 0l.1-1.5a2.2 2.2 0 002-1.7c.3-.6.5-1.5.6-2.6l1-8v-.7c0-.8-.1-1.3-.5-1.6-.3-.3-.8-.5-1.6-.5l-.2-1.6a50 50 0 005.2 0l7 13.5 6.7-13.5a60.8 60.8 0 005.3 0c0 .7 0 1.3-.2 1.6-.7 0-1.2.2-1.6.6-.4.3-.5.8-.5 1.6v.7l1.1 8.5.4 2.3c.2.5.4.8.7 1l1.2.4zM238.9 599.5l.2 1.6a77.1 77.1 0 00-7.6 0c0-.8.1-1.3.3-1.6l1.1-.3c.2-.2.4-.4.4-.6l-.4-1.2-.7-1.5c-3.5 0-6.2 0-8.2.2l-.4.9-.3 1.3c0 .7.4 1 1.4 1.2.2.4.2 1 .2 1.6a57.1 57.1 0 00-5.5 0c0-.6 0-1.1.2-1.6a2 2 0 001.2-.7c.3-.4.7-1 1.2-2.1l6.2-13.7a7 7 0 011.4-.2l6.7 13.8 1.3 2.2c.4.4.8.6 1.3.7zm-7.4-5l-2.2-4.6-1.3-3a14 14 0 01-1.2 2.8l-2 4.7h6.7zM258.3 583c0 1.2 0 2.8.3 4.6-.6.2-1.1.3-1.8.3 0-1.1-.4-2-1-2.5-.5-.6-1.4-.9-2.6-.9h-1.6V597l.2 1.7.7.7 1.7.3.1 1.5a167.6 167.6 0 00-8.8 0c0-.7 0-1.3.2-1.5.7 0 1.3-.2 1.6-.3.4-.2.7-.4.8-.8.2-.3.2-.9.2-1.6v-12.4H247a5 5 0 00-2.3.4c-.5.3-.9.6-1.1 1l-.6 2c-.8 0-1.3 0-1.7-.3.4-1.6.5-3.2.5-4.7a282.6 282.6 0 0016.6 0zM277.6 595.9a3 3 0 011.6.8c-.4 1.1-.7 2.6-1 4.3H263l.1-1.5 1.4-.3c.3-.2.5-.4.6-.8l.2-1.8v-9.4c0-.7 0-1.2-.2-1.6-.1-.4-.4-.6-.7-.8l-1.3-.3-.1-1.6a204.6 204.6 0 0014.5 0c.2 2.3.5 3.8.6 4.5a3 3 0 01-1.6.4c0-1-.5-1.8-1.2-2.4-.8-.6-2-.9-3.9-.9h-2.8v6.7h1.8c1.3 0 2.2-.2 2.6-.5.5-.2.8-.8.8-1.5.6-.2 1.1-.3 1.7-.3a43.4 43.4 0 000 6.2c-.7 0-1.2-.1-1.6-.3 0-.7-.4-1.3-.9-1.6-.4-.3-1.3-.4-2.6-.4h-1.8v3.8c0 .7 0 1.3.2 1.7.2.4.5.7.8.9l1.8.2h.3a11 11 0 003.2-.4c.7-.2 1.3-.6 1.7-1 .3-.5.7-1.2 1-2.1z");
    			add_location(path76, file$4, 497, 12, 34799);
    			attr_dev(g20, "id", "animate-word");
    			attr_dev(g20, "fill", "#454545");
    			add_location(g20, file$4, 496, 10, 34750);
    			attr_dev(g21, "id", "animate-set");
    			add_location(g21, file$4, 485, 6, 33659);
    			attr_dev(g22, "id", "venn-total");
    			add_location(g22, file$4, 315, 4, 7875);
    			attr_dev(svg, "width", "836");
    			attr_dev(svg, "height", "761");
    			attr_dev(svg, "viewBox", "-50 -50 936 861");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "svelte-1jxgps3");
    			add_location(svg, file$4, 311, 2, 7699);
    			attr_dev(section, "class", "venn svelte-1jxgps3");
    			add_location(section, file$4, 310, 0, 7674);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, svg);
    			append_dev(svg, rect0);
    			append_dev(svg, g22);
    			append_dev(g22, circle0);
    			append_dev(g22, circle1);
    			append_dev(g22, circle2);
    			append_dev(g22, circle3);
    			append_dev(g22, circle4);
    			append_dev(g22, circle5);
    			append_dev(g22, g4);
    			append_dev(g4, g2);
    			append_dev(g2, g0);
    			append_dev(g0, path0);
    			append_dev(g0, line0);
    			append_dev(g0, line1);
    			append_dev(g0, line2);
    			append_dev(g0, line3);
    			append_dev(g0, line4);
    			append_dev(g0, line5);
    			append_dev(g0, line6);
    			append_dev(g0, line7);
    			append_dev(g0, line8);
    			append_dev(g0, line9);
    			append_dev(g0, line10);
    			append_dev(g0, line11);
    			append_dev(g0, line12);
    			append_dev(g0, line13);
    			append_dev(g0, line14);
    			append_dev(g2, g1);
    			append_dev(g1, path1);
    			append_dev(g1, path2);
    			append_dev(g1, path3);
    			append_dev(g4, g3);
    			append_dev(g3, path4);
    			append_dev(g22, g14);
    			append_dev(g14, g12);
    			append_dev(g12, g5);
    			append_dev(g5, rect1);
    			append_dev(g5, rect2);
    			append_dev(g12, path5);
    			append_dev(g12, path6);
    			append_dev(g12, path7);
    			append_dev(g12, g6);
    			append_dev(g6, path8);
    			append_dev(g6, path9);
    			append_dev(g6, path10);
    			append_dev(g6, path11);
    			append_dev(g6, path12);
    			append_dev(g6, path13);
    			append_dev(g6, path14);
    			append_dev(g6, path15);
    			append_dev(g6, path16);
    			append_dev(g6, path17);
    			append_dev(g6, path18);
    			append_dev(g6, path19);
    			append_dev(g12, g7);
    			append_dev(g7, path20);
    			append_dev(g7, path21);
    			append_dev(g7, path22);
    			append_dev(g7, path23);
    			append_dev(g7, path24);
    			append_dev(g7, path25);
    			append_dev(g7, path26);
    			append_dev(g12, g8);
    			append_dev(g8, path27);
    			append_dev(g8, path28);
    			append_dev(g8, path29);
    			append_dev(g8, path30);
    			append_dev(g8, path31);
    			append_dev(g8, path32);
    			append_dev(g8, path33);
    			append_dev(g8, path34);
    			append_dev(g8, path35);
    			append_dev(g8, path36);
    			append_dev(g8, path37);
    			append_dev(g8, path38);
    			append_dev(g12, g9);
    			append_dev(g9, path39);
    			append_dev(g9, path40);
    			append_dev(g9, path41);
    			append_dev(g9, path42);
    			append_dev(g9, path43);
    			append_dev(g9, path44);
    			append_dev(g9, path45);
    			append_dev(g12, g10);
    			append_dev(g10, path46);
    			append_dev(g10, path47);
    			append_dev(g10, path48);
    			append_dev(g10, path49);
    			append_dev(g10, path50);
    			append_dev(g10, path51);
    			append_dev(g10, path52);
    			append_dev(g10, path53);
    			append_dev(g10, path54);
    			append_dev(g10, path55);
    			append_dev(g10, path56);
    			append_dev(g10, path57);
    			append_dev(g12, g11);
    			append_dev(g11, path58);
    			append_dev(g11, path59);
    			append_dev(g11, path60);
    			append_dev(g11, path61);
    			append_dev(g11, path62);
    			append_dev(g11, path63);
    			append_dev(g11, path64);
    			append_dev(g14, g13);
    			append_dev(g13, path65);
    			append_dev(g22, g17);
    			append_dev(g17, g15);
    			append_dev(g15, path66);
    			append_dev(g15, rect3);
    			append_dev(g15, line15);
    			append_dev(g15, circle6);
    			append_dev(g15, circle7);
    			append_dev(g15, circle8);
    			append_dev(g15, path67);
    			append_dev(g15, path68);
    			append_dev(g17, g16);
    			append_dev(g16, path69);
    			append_dev(g22, g21);
    			append_dev(g21, g19);
    			append_dev(g19, path70);
    			append_dev(g19, path71);
    			append_dev(g19, path72);
    			append_dev(g19, g18);
    			append_dev(g18, path73);
    			append_dev(g18, path74);
    			append_dev(g18, path75);
    			append_dev(g21, g20);
    			append_dev(g20, path76);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("VennAnimation", slots, []);
    	gsapWithCSS.registerPlugin(ScrollTrigger, DrawSVGPlugin, GSDevTools, Physics2DPlugin);

    	onMount(() => {
    		const tl = gsapWithCSS.timeline({
    			scrollTrigger: { trigger: ".venn", start: "-40% top" }
    		});

    		const designIconTL = gsapWithCSS.timeline();
    		const animateIconTL = gsapWithCSS.timeline();
    		const developIconTL = gsapWithCSS.timeline();
    		const magicIconTL = gsapWithCSS.timeline();
    		const transformOrigin = "50% 50%";
    		const iconEase = "power4.out", iconDur = 0.4, iconOverlap = "-=.2";

    		const iconWord = {
    			autoAlpha: 0,
    			duration: 0.2,
    			transformOrigin,
    			scale: 5,
    			ease: "power1.out"
    		};

    		// pop-in animation for magic icon
    		const show = { autoAlpha: 1 };

    		const petalFlyer = {
    			autoAlpha: 0,
    			ease: "power4.out",
    			duration: 6,
    			rotate: "random(200, 600)",
    			physics2D: {
    				velocity: "random(340, 500)",
    				gravity: 350,
    				angle: "random(-160, 50)"
    			}
    		};

    		gsapWithCSS.set(".magic-icon-petalbursts", { autoAlpha: 0 });

    		magicIconTL.set("#magic-set", { y: 90 }).from("#magic-icon-wand", {
    			x: -20,
    			y: 20,
    			autoAlpha: 0,
    			duration: iconDur,
    			ease: iconEase
    		}).fromTo(
    			".magic-icon-stems",
    			{ drawSVG: "0% 0%", autoAlpha: 0 },
    			{
    				drawSVG: "0% 100%",
    				autoAlpha: 1,
    				duration: iconDur,
    				ease: iconEase
    			},
    			"flowers"
    		).from(
    			".magic-icon-flowers",
    			{
    				transformOrigin,
    				scale: 0.1,
    				autoAlpha: 0,
    				stagger: 0.2,
    				duration: iconDur,
    				ease: "elastic.out(1, 0.3)"
    			},
    			"-=.1"
    		).set("#burst1", show, "flowers+=.35").to("#burst1 > *", petalFlyer, "flowers+=.35").set("#burst2", show, "flowers+=.55").to("#burst2 > *", petalFlyer, "flowers+=.55").set("#burst3", show, "flowers+=.75").to("#burst3 > *", petalFlyer, "flowers+=.75").from("#magic-word", iconWord, "flowers+=1");

    		// mirp1 mirp3 <.3 milp5 milp1 <.9 micp4 micp2 <1.5
    		// pop-in animation for develop icon
    		developIconTL.set("#develop-icon", { transformOrigin, x: 37, y: 30 }).from("#develop-icon", {
    			autoAlpha: 0,
    			scaleX: 0,
    			duration: iconDur,
    			ease: iconEase
    		}).from("#develop-icon", {
    			scaleY: 0.1,
    			duration: iconDur / 2,
    			ease: iconEase
    		}).from("#develop-icon-open-bracket", { autoAlpha: 0, duration: 0.01, delay: 0.1 }).from("#develop-icon-slash", { autoAlpha: 0, duration: 0.01, delay: 0.2 }).from("#develop-icon-close-bracket", { autoAlpha: 0, duration: 0.01, delay: 0.1 }).from("#develop-word", iconWord);

    		// pop-in animation for Design icon
    		designIconTL.from("#design-icon-ruler", {
    			x: -40,
    			y: 40,
    			autoAlpha: 0,
    			duration: iconDur,
    			ease: iconEase
    		}).from(
    			"#design-icon-pencil",
    			{
    				x: 40,
    				y: 40,
    				autoAlpha: 0,
    				duration: iconDur,
    				ease: iconEase
    			},
    			iconOverlap
    		).from("#design-word", iconWord);

    		// pop-in animation for Animate icon
    		animateIconTL.set(".animate-icon-line", { drawSVG: "0", autoAlpha: 0 }, "0").set("#animate-icon-circle", { x: -40 }).from("#animate-icon-circle", {
    			autoAlpha: 0,
    			duration: iconDur,
    			ease: iconEase
    		}).to(
    			"#animate-icon-circle",
    			{
    				x: -50,
    				delay: 0.1,
    				scaleX: 0.8,
    				duration: iconDur,
    				ease: iconEase
    			},
    			"<"
    		).from(".animate-icon-line", { autoAlpha: 0, duration: 0.1 }, "circleStart").to("#animate-icon-circle", {
    			x: 0,
    			duration: iconDur * 2,
    			ease: iconEase
    		}).to(
    			".animate-icon-line",
    			{
    				drawSVG: "0 100%",
    				stagger: 0.1,
    				duration: 0.3
    			},
    			"circleStart+=.2"
    		).to(
    			"#animate-icon-circle",
    			{
    				scaleX: 1.2,
    				duration: iconDur / 2,
    				ease: "none"
    			},
    			"circleStart"
    		).to(
    			"#animate-icon-circle",
    			{
    				scaleX: 1,
    				duration: iconDur / 2,
    				ease: "none"
    			},
    			"circleStart+=.2"
    		).from("#animate-icon-ghost2", { autoAlpha: 0, duration: 0.1 }, `circleStart+=${iconDur / 3}`).from("#animate-icon-ghost1", { autoAlpha: 0, duration: 0.1 }, `circleStart+=${iconDur / 3 * 2}`).from("#animate-word", iconWord).timeScale(1.4);

    		// whole venn circles animation
    		const duration = 0.6,
    			innerCircles = {
    				autoAlpha: 0,
    				duration,
    				scale: 0.5,
    				transformOrigin,
    				delay: 0.2,
    				ease: "power2.out"
    			},
    			innerCircleOffset = "-=.6",
    			iconOffset = "-=.2",
    			moveOffset = "+=.2";

    		// // bursts version
    		// const           burstFrom = {
    		//   autoAlpha: 0,
    		//   scale: 0.1,
    		//   transformOrigin,
    		// },
    		// burstTo = {
    		//   duration: 1.2,
    		//   autoAlpha: 0,
    		//   scale: 1.4,
    		//   rotate: 180,
    		//   transformOrigin,
    		//   ease: "power3.inOut",
    		// },
    		// oranges = {
    		//   duration,
    		//   autoAlpha: 0,
    		//   scale: .4,
    		//   transformOrigin,
    		//   ease: "power2.inOut",
    		// },
    		// outerCircleOffset = "-=.7",
    		// popOffset = "-=.4",
    		// tl.fromTo('#orange-b-1', burstFrom, burstTo)
    		// .from('#orange-1', oranges, outerCircleOffset)
    		// .from('.circle-design', innerCircles, innerCircleOffset)
    		// .add(designIconTL, iconOffset)
    		// .fromTo('#orange-b-2', burstFrom, burstTo, popOffset)
    		// .from('#orange-2', oranges, outerCircleOffset)
    		// .from('.circle-animate', innerCircles, innerCircleOffset)
    		// .add(animateIconTL, iconOffset)
    		// .fromTo('#orange-b-3', burstFrom, burstTo, popOffset)
    		// .from('#orange-3', oranges, outerCircleOffset)
    		// .from('.circle-develop', innerCircles, innerCircleOffset)
    		// .add(developIconTL, iconOffset)
    		tl.from(".circle-design", innerCircles).add(designIconTL, iconOffset).from(".circle-animate", innerCircles, innerCircleOffset).add(animateIconTL, iconOffset).from(".circle-develop", innerCircles, innerCircleOffset).add(developIconTL, iconOffset).to(".circle-design-w", { duration, delay: 0.4, y: 80 }).to("#design-set", { duration, y: -8 }, "<").to(".circle-animate-w", { duration, y: -80, x: 95 }, moveOffset).to("#animate-set", { duration, y: -20, x: 40 }, "<").to(".circle-develop-w", { duration, y: -80, x: -95 }, moveOffset).to("#develop-set", { duration, y: -20, x: -40 }, "<").add(magicIconTL);
    	}); //slight parallax to delay scroll?
    	// gsap.to(".venn", {
    	//   yPercent: 30,
    	//   ease: "none",

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<VennAnimation> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		gsap: gsapWithCSS,
    		ScrollTrigger,
    		DrawSVGPlugin,
    		GSDevTools,
    		Physics2DPlugin
    	});

    	return [];
    }

    class VennAnimation extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "VennAnimation",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/componenets/button.svelte generated by Svelte v3.29.4 */

    const file$5 = "src/componenets/button.svelte";

    function create_fragment$5(ctx) {
    	let a;
    	let t;
    	let span;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(/*txt*/ ctx[1]);
    			span = element("span");
    			attr_dev(span, "class", "svelte-1hrrdt9");
    			add_location(span, file$5, 5, 20, 118);
    			attr_dev(a, "href", /*href*/ ctx[0]);
    			attr_dev(a, "class", "svelte-1hrrdt9");
    			add_location(a, file$5, 5, 0, 98);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    			append_dev(a, span);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*txt*/ 2) set_data_dev(t, /*txt*/ ctx[1]);

    			if (dirty & /*href*/ 1) {
    				attr_dev(a, "href", /*href*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Button", slots, []);
    	let { href = "http://www.beep.com" } = $$props;
    	let { txt = "Let's do it!" } = $$props;
    	const writable_props = ["href", "txt"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("href" in $$props) $$invalidate(0, href = $$props.href);
    		if ("txt" in $$props) $$invalidate(1, txt = $$props.txt);
    	};

    	$$self.$capture_state = () => ({ href, txt });

    	$$self.$inject_state = $$props => {
    		if ("href" in $$props) $$invalidate(0, href = $$props.href);
    		if ("txt" in $$props) $$invalidate(1, txt = $$props.txt);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [href, txt];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { href: 0, txt: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get href() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get txt() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set txt(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/componenets/projectCard.svelte generated by Svelte v3.29.4 */
    const file$6 = "src/componenets/projectCard.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	child_ctx[11] = i;
    	return child_ctx;
    }

    // (39:21) {#if i < tags.length - 1}
    function create_if_block$1(ctx) {
    	let t0;
    	let em;
    	let t2;

    	const block = {
    		c: function create() {
    			t0 = text("  ");
    			em = element("em");
    			em.textContent = "//";
    			t2 = text("  ");
    			add_location(em, file$6, 38, 58, 1022);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, em, anchor);
    			insert_dev(target, t2, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(em);
    			if (detaching) detach_dev(t2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(39:21) {#if i < tags.length - 1}",
    		ctx
    	});

    	return block;
    }

    // (38:8) {#each tags as tag, i}
    function create_each_block$1(ctx) {
    	let span;
    	let t_value = /*tag*/ ctx[9] + "";
    	let t;
    	let if_block = /*i*/ ctx[11] < /*tags*/ ctx[2].length - 1 && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			if (if_block) if_block.c();
    			attr_dev(span, "class", "svelte-a9vfnx");
    			add_location(span, file$6, 38, 10, 974);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    			if (if_block) if_block.m(span, null);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*tags*/ 4 && t_value !== (t_value = /*tag*/ ctx[9] + "")) set_data_dev(t, t_value);

    			if (/*i*/ ctx[11] < /*tags*/ ctx[2].length - 1) {
    				if (if_block) ; else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(span, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(38:8) {#each tags as tag, i}",
    		ctx
    	});

    	return block;
    }

    // (27:0) <ClickOutside on:clickoutside={hideOn}>
    function create_default_slot$1(ctx) {
    	let article;
    	let img_1;
    	let img_1_src_value;
    	let img_1_class_value;
    	let t0;
    	let div3;
    	let div0;
    	let t1;
    	let div1;
    	let h2;
    	let t2;
    	let t3;
    	let p;
    	let t4;
    	let t5;
    	let div2;
    	let button_1;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*tags*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const button_1_spread_levels = [/*button*/ ctx[5]];
    	let button_1_props = {};

    	for (let i = 0; i < button_1_spread_levels.length; i += 1) {
    		button_1_props = assign(button_1_props, button_1_spread_levels[i]);
    	}

    	button_1 = new Button({ props: button_1_props, $$inline: true });

    	const block = {
    		c: function create() {
    			article = element("article");
    			img_1 = element("img");
    			t0 = space();
    			div3 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			div1 = element("div");
    			h2 = element("h2");
    			t2 = text(/*title*/ ctx[3]);
    			t3 = space();
    			p = element("p");
    			t4 = text(/*body*/ ctx[4]);
    			t5 = space();
    			div2 = element("div");
    			create_component(button_1.$$.fragment);
    			if (img_1.src !== (img_1_src_value = /*img*/ ctx[0])) attr_dev(img_1, "src", img_1_src_value);
    			attr_dev(img_1, "alt", /*alt*/ ctx[1]);
    			attr_dev(img_1, "class", img_1_class_value = "background " + (/*hide*/ ctx[6] === false ? "blur" : "") + " svelte-a9vfnx");
    			attr_dev(img_1, "loading", "lazy");
    			add_location(img_1, file$6, 32, 4, 758);
    			attr_dev(div0, "class", "tags svelte-a9vfnx");
    			add_location(div0, file$6, 36, 6, 914);
    			attr_dev(h2, "class", "title svelte-a9vfnx");
    			add_location(h2, file$6, 42, 8, 1121);
    			attr_dev(p, "class", "body svelte-a9vfnx");
    			add_location(p, file$6, 43, 8, 1160);
    			attr_dev(div1, "class", "beats svelte-a9vfnx");
    			add_location(div1, file$6, 41, 6, 1093);
    			attr_dev(div2, "class", "bottom svelte-a9vfnx");
    			toggle_class(div2, "hide", /*hide*/ ctx[6]);
    			add_location(div2, file$6, 45, 6, 1206);
    			attr_dev(div3, "class", "infotainer svelte-a9vfnx");
    			toggle_class(div3, "hide", /*hide*/ ctx[6]);
    			add_location(div3, file$6, 33, 4, 859);
    			attr_dev(article, "class", "svelte-a9vfnx");
    			add_location(article, file$6, 27, 2, 670);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, img_1);
    			append_dev(article, t0);
    			append_dev(article, div3);
    			append_dev(div3, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			append_dev(div1, h2);
    			append_dev(h2, t2);
    			append_dev(div1, t3);
    			append_dev(div1, p);
    			append_dev(p, t4);
    			append_dev(div3, t5);
    			append_dev(div3, div2);
    			mount_component(button_1, div2, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(article, "mouseover", /*hideOff*/ ctx[7], false, false, false),
    					listen_dev(article, "mouseleave", /*hideOn*/ ctx[8], false, false, false),
    					listen_dev(article, "click", /*hideOff*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*img*/ 1 && img_1.src !== (img_1_src_value = /*img*/ ctx[0])) {
    				attr_dev(img_1, "src", img_1_src_value);
    			}

    			if (!current || dirty & /*alt*/ 2) {
    				attr_dev(img_1, "alt", /*alt*/ ctx[1]);
    			}

    			if (!current || dirty & /*hide*/ 64 && img_1_class_value !== (img_1_class_value = "background " + (/*hide*/ ctx[6] === false ? "blur" : "") + " svelte-a9vfnx")) {
    				attr_dev(img_1, "class", img_1_class_value);
    			}

    			if (dirty & /*tags*/ 4) {
    				each_value = /*tags*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (!current || dirty & /*title*/ 8) set_data_dev(t2, /*title*/ ctx[3]);
    			if (!current || dirty & /*body*/ 16) set_data_dev(t4, /*body*/ ctx[4]);

    			const button_1_changes = (dirty & /*button*/ 32)
    			? get_spread_update(button_1_spread_levels, [get_spread_object(/*button*/ ctx[5])])
    			: {};

    			button_1.$set(button_1_changes);

    			if (dirty & /*hide*/ 64) {
    				toggle_class(div2, "hide", /*hide*/ ctx[6]);
    			}

    			if (dirty & /*hide*/ 64) {
    				toggle_class(div3, "hide", /*hide*/ ctx[6]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    			destroy_each(each_blocks, detaching);
    			destroy_component(button_1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(27:0) <ClickOutside on:clickoutside={hideOn}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let clickoutside;
    	let current;

    	clickoutside = new ClickOutside({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	clickoutside.$on("clickoutside", /*hideOn*/ ctx[8]);

    	const block = {
    		c: function create() {
    			create_component(clickoutside.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(clickoutside, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const clickoutside_changes = {};

    			if (dirty & /*$$scope, hide, button, body, title, tags, img, alt*/ 4223) {
    				clickoutside_changes.$$scope = { dirty, ctx };
    			}

    			clickoutside.$set(clickoutside_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(clickoutside.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(clickoutside.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(clickoutside, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ProjectCard", slots, []);
    	let { img = "./assets/Enterprise_HD.jpg" } = $$props;
    	let { alt = "The Starship Enterprise" } = $$props;
    	let { tags = ["these", "are", "voyages"] } = $$props;
    	let { title } = $$props;
    	let { body = "Communication is not possible. The shuttle has no power. Using the gravitational pull of a star to slingshot back in time?" } = $$props;

    	let { button = {
    		txt: "Make it so",
    		href: "http://www.startrek.com"
    	} } = $$props;

    	let hide = true;

    	function hideOff() {
    		$$invalidate(6, hide = false);
    	}

    	function hideOn() {
    		$$invalidate(6, hide = true);
    	}

    	const writable_props = ["img", "alt", "tags", "title", "body", "button"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ProjectCard> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("img" in $$props) $$invalidate(0, img = $$props.img);
    		if ("alt" in $$props) $$invalidate(1, alt = $$props.alt);
    		if ("tags" in $$props) $$invalidate(2, tags = $$props.tags);
    		if ("title" in $$props) $$invalidate(3, title = $$props.title);
    		if ("body" in $$props) $$invalidate(4, body = $$props.body);
    		if ("button" in $$props) $$invalidate(5, button = $$props.button);
    	};

    	$$self.$capture_state = () => ({
    		Button,
    		ClickOutside,
    		img,
    		alt,
    		tags,
    		title,
    		body,
    		button,
    		hide,
    		hideOff,
    		hideOn
    	});

    	$$self.$inject_state = $$props => {
    		if ("img" in $$props) $$invalidate(0, img = $$props.img);
    		if ("alt" in $$props) $$invalidate(1, alt = $$props.alt);
    		if ("tags" in $$props) $$invalidate(2, tags = $$props.tags);
    		if ("title" in $$props) $$invalidate(3, title = $$props.title);
    		if ("body" in $$props) $$invalidate(4, body = $$props.body);
    		if ("button" in $$props) $$invalidate(5, button = $$props.button);
    		if ("hide" in $$props) $$invalidate(6, hide = $$props.hide);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [img, alt, tags, title, body, button, hide, hideOff, hideOn];
    }

    class ProjectCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			img: 0,
    			alt: 1,
    			tags: 2,
    			title: 3,
    			body: 4,
    			button: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ProjectCard",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*title*/ ctx[3] === undefined && !("title" in props)) {
    			console.warn("<ProjectCard> was created without expected prop 'title'");
    		}
    	}

    	get img() {
    		throw new Error("<ProjectCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set img(value) {
    		throw new Error("<ProjectCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get alt() {
    		throw new Error("<ProjectCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set alt(value) {
    		throw new Error("<ProjectCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tags() {
    		throw new Error("<ProjectCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tags(value) {
    		throw new Error("<ProjectCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<ProjectCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<ProjectCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get body() {
    		throw new Error("<ProjectCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set body(value) {
    		throw new Error("<ProjectCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get button() {
    		throw new Error("<ProjectCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set button(value) {
    		throw new Error("<ProjectCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    // img: "./assets/Enterprise_HD.jpg", dimensions: 
    // tags: ["an array", "like", "this"], text ends up allcaps
    // title: "A string", keep under 30ch
    // body: "A string", keep under 130ch
    // button: 
    //   txt: "check it out", no caps
    //   href: "http://www.startrek.com"
        

    var contentStream = [
      {
        img: "./assets/" + "RAC_STYLE.png",
        tags: ["branding", "illustration", "joy"],
        title: "Rent-A-Christmas Style Guide",
        body: "Communication is not possible. The shuttle has no power. Using the gravitational pull of a star to slingshot back in time? Using the gravitational pull of a star to slingshot back in time?",
        button: {
          txt: "check it out",
          href: "http://www.startrek.com"
        }
      },
      {
        img: "./assets/Enterprise_HD.jpg",
        tags: ["landing pages", "email", "branding"],
        title: "PEX Card Digital Marketing",
        body: "Communication is not possible. The shuttle has no power. Using the gravitational pull of a star to slingshot back in time?",
        button: {
          txt: "let's see it",
          href: "http://www.startrek.com"
        }
      },
      {
        img: "./assets/Enterprise_HD.jpg",
        tags: ["illustration", "animation"],
        title: "Rent-A-Christmas Illustrations",
        body: "Thee gravitational pull of a star to slingshot back in time?",
        button: {
          txt: "check it out",
          href: "http://www.startrek.com"
        }
      },
      {
        img: "./assets/Enterprise_HD.jpg",
        tags: ["print", "video", "copywriting"],
        title: "PEX Card Instructionals",
        body: "Thee gravitational pull of a star to slingshot back in time?",
        button: {
          txt: "check it out",
          href: "http://www.startrek.com"
        }
      },
      {
        img: "./assets/Enterprise_HD.jpg",
        tags: ["print", "video", "copywriting"],
        title: "PEX Card Instructionals",
        body: "Thee gravitational pull of a star to slingshot back in time?",
        button: {
          txt: "check it out",
          href: "http://www.startrek.com"
        }
      },
      {
        img: "./assets/Enterprise_HD.jpg",
        tags: ["print", "video", "copywriting"],
        title: "PEX Card Instructionals",
        body: "Thee gravitational pull of a star to slingshot back in time?",
        button: {
          txt: "check it out",
          href: "http://www.startrek.com"
        }
      },
      {
        img: "./assets/Enterprise_HD.jpg",
        tags: ["print", "video", "copywriting"],
        title: "LSF Magazine",
        body: "Telling the story of biotechnology in a quarterly print magazine.",
        button: {
          txt: "check it out",
          href: "https://www.behance.net/gallery/40207321/LSF-Magazine"
        }
      },
      {
        img: "./assets/Enterprise_HD.jpg",
        tags: ["print", "video", "copywriting"],
        title: "Biotech Hall of Fame",
        body: "A 220-page coffee-table book created for the 25th Annual Biotech Meeting in Laguna Beach.",
        button: {
          txt: "check it out",
          href: "http://www.startrek.com"
        }
      }
    ];

    /* src/componenets/projectSection.svelte generated by Svelte v3.29.4 */
    const file$7 = "src/componenets/projectSection.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	child_ctx[3] = i;
    	return child_ctx;
    }

    // (38:4) {#each projects as project, i}
    function create_each_block$2(ctx) {
    	let projectcard;
    	let current;
    	const projectcard_spread_levels = [/*project*/ ctx[1]];
    	let projectcard_props = {};

    	for (let i = 0; i < projectcard_spread_levels.length; i += 1) {
    		projectcard_props = assign(projectcard_props, projectcard_spread_levels[i]);
    	}

    	projectcard = new ProjectCard({ props: projectcard_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(projectcard.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(projectcard, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const projectcard_changes = (dirty & /*projects*/ 1)
    			? get_spread_update(projectcard_spread_levels, [get_spread_object(/*project*/ ctx[1])])
    			: {};

    			projectcard.$set(projectcard_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(projectcard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(projectcard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(projectcard, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(38:4) {#each projects as project, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let section;
    	let h1;
    	let t1;
    	let div;
    	let current;
    	let each_value = /*projects*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			section = element("section");
    			h1 = element("h1");
    			h1.textContent = "Projects";
    			t1 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h1, file$7, 33, 2, 879);
    			attr_dev(div, "class", "gallery svelte-17627ng");
    			add_location(div, file$7, 36, 2, 905);
    			attr_dev(section, "id", "projects");
    			add_location(section, file$7, 32, 0, 853);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, h1);
    			append_dev(section, t1);
    			append_dev(section, div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*projects*/ 1) {
    				each_value = /*projects*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ProjectSection", slots, []);

    	let { projects = [
    		{
    			img: "./assets/Enterprise_HD.jpg",
    			tags: ["these", "are", "voyages"],
    			title: "Shakar, when the walls fell",
    			body: "Communication is not possible. The shuttle has no power. Using the gravitational pull of a star to slingshot back in time?",
    			button: {
    				txt: "Make it so",
    				href: "http://www.startrek.com"
    			}
    		},
    		{
    			img: "./assets/Enterprise_HD.jpg",
    			tags: ["these", "are"],
    			title: "Shakar",
    			body: "Thee gravitational pull of a star to slingshot back in time?",
    			button: {
    				txt: "Make it so",
    				href: "http://www.startrek.com"
    			}
    		}
    	] } = $$props;

    	if (contentStream) {
    		projects = contentStream;
    	}

    	const writable_props = ["projects"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ProjectSection> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("projects" in $$props) $$invalidate(0, projects = $$props.projects);
    	};

    	$$self.$capture_state = () => ({ ProjectCard, contentStream, projects });

    	$$self.$inject_state = $$props => {
    		if ("projects" in $$props) $$invalidate(0, projects = $$props.projects);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [projects];
    }

    class ProjectSection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { projects: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ProjectSection",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get projects() {
    		throw new Error("<ProjectSection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set projects(value) {
    		throw new Error("<ProjectSection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/componenets/footer.svelte generated by Svelte v3.29.4 */

    const file$8 = "src/componenets/footer.svelte";

    function create_fragment$8(ctx) {
    	let footer;
    	let svg;
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let path4;
    	let path5;
    	let path6;
    	let path7;
    	let path8;
    	let path9;
    	let path10;
    	let t0;
    	let div;
    	let h3;
    	let t2;
    	let ul;
    	let li0;
    	let button0;
    	let t4;
    	let li1;
    	let button1;
    	let t6;
    	let small;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			path6 = svg_element("path");
    			path7 = svg_element("path");
    			path8 = svg_element("path");
    			path9 = svg_element("path");
    			path10 = svg_element("path");
    			t0 = space();
    			div = element("div");
    			h3 = element("h3");
    			h3.textContent = "more of my work";
    			t2 = space();
    			ul = element("ul");
    			li0 = element("li");
    			button0 = element("button");
    			button0.textContent = "Behance";
    			t4 = space();
    			li1 = element("li");
    			button1 = element("button");
    			button1.textContent = "Dribbble";
    			t6 = space();
    			small = element("small");
    			small.textContent = "Designed and built by Zachary Hamias Rais-Norman – Copyright© 2020 ZACME LLC. It's official.";
    			attr_dev(path0, "d", "M13.167 26.746c5.674 3.738 11.6 0 14.664-3.14.552-.599.502-1.546-.201-1.995l-2.01-1.345c-.25-.15-.552-.25-.853-.2-6.73.499-17.828 2.493-11.6 6.68zm125.597-14.007l-1.557.15a2.141 2.141 0 00-1.808 2.84c1.657 4.537 5.524 10.319 12.505 9.571 8.135-.897-1.457-8.274-7.784-12.262a2.18 2.18 0 00-1.356-.3zm-41.28 17.795c8.286 2.543 12.856-5.832 14.112-10.368l-4.721-1.446c-6.629 2.891-17.727 9.272-9.39 11.814z");
    			attr_dev(path0, "fill", "#FFAF66");
    			attr_dev(path0, "stroke", "#454545");
    			attr_dev(path0, "stroke-width", "2");
    			add_location(path0, file$8, 5, 4, 112);
    			attr_dev(path1, "d", "M128.971 30.335c7.584-.897 9.09-8.375 8.839-13.31-.05-.997-.954-1.794-1.959-1.645l-2.46.3c-.402.05-.804.249-1.105.548-4.821 5.433-11.651 15.104-3.315 14.107zM6.387 26.846c5.775 2.442 9.893-2.293 11.751-5.883.352-.697.05-1.595-.703-1.894l-1.958-.847a1.269 1.269 0 00-.954-.05C8.848 20.066.059 24.154 6.387 26.846zm28.957-1.122c5.825 4.187 12.157 1.125 15.953-2.176 1.255-1.06 1.188-3.064-.19-3.997l-1.005-.778a2.814 2.814 0 00-1.57-.49c-7.762.468-20.15 2.386-13.188 7.44zm171.589 2.436c10.139-.781 3.401-7.363-1.669-10.881-.385-.261-.834-.391-1.283-.326l-3.979.326c-.834.065-1.604.651-1.797 1.498-1.219 4.04-.706 10.1 8.728 9.384zm-50.793-2.461c10.294-1.795 2.31-6.53-3.616-8.973a2.928 2.928 0 00-1.607-.15l-3.264.599c-1.407.25-2.411 1.445-2.361 2.841.101 3.34 2.31 7.178 10.848 5.683zm67.795-.449c6.93-2.343.854-5.234-3.415-6.48a1.913 1.913 0 00-.753 0l-2.812.947c-.603.2-.955.798-.955 1.496.101 2.741 1.758 6.13 7.935 4.037zm-137.8 4.038c8.085 3.09 13.257-4.935 14.814-9.322l-4.62-1.794c-6.73 2.393-18.28 7.976-10.194 11.116z");
    			attr_dev(path1, "fill", "#FFAF66");
    			attr_dev(path1, "stroke", "#454545");
    			attr_dev(path1, "stroke-width", "2");
    			add_location(path1, file$8, 6, 4, 581);
    			attr_dev(path2, "d", "M119.932 27.543c10.797-1.595 1.707-6.928-4.168-9.42l-6.177.896c-1.004 3.54-.402 10.12 10.345 8.524zm68.221-1.302c5.904 2.485 10.284-1.925 12.443-5.652.635-1.056.127-2.484-1.016-2.981l-1.206-.497c-.508-.186-1.016-.248-1.524-.062-6.221 2.05-15.49 6.335-8.697 9.192zm-126.776.455c6.026 3.788 12.303 0 15.618-3.29.703-.698.602-1.745-.251-2.293l-1.909-1.196c-.351-.2-.803-.35-1.255-.3-7.232.698-18.832 2.892-12.203 7.079z");
    			attr_dev(path2, "fill", "#FFAF66");
    			attr_dev(path2, "stroke", "#454545");
    			attr_dev(path2, "stroke-width", "2");
    			add_location(path2, file$8, 7, 4, 1673);
    			attr_dev(path3, "d", "M121.489 18.92c-7.182 1.595-1.206 5.583 2.661 7.377l4.118-.897c.703-2.841.402-8.075-6.779-6.48z");
    			attr_dev(path3, "fill", "#FFAF66");
    			attr_dev(path3, "stroke", "#454545");
    			attr_dev(path3, "stroke-width", "2");
    			add_location(path3, file$8, 8, 4, 2155);
    			attr_dev(path4, "d", "M125.205 13.935l-.753.249c-1.105.349-1.607 1.595-1.105 2.642 1.557 3.09 4.72 6.63 9.441 5.035 5.574-1.895-1.456-5.882-6.227-7.876-.452-.2-.904-.25-1.356-.05zm51.776 13.26c7.331-2.343 1.657-5.883-2.813-7.627a2.652 2.652 0 00-1.858-.05l-1.757.548c-1.206.399-2.009 1.496-1.909 2.742.201 3.09 2.059 6.38 8.337 4.387zm-84.569-6.78c7.08 4.586 14.513-1.346 17.325-4.835l-4.067-2.642c-7.383.598-20.339 2.89-13.258 7.477z");
    			attr_dev(path4, "fill", "#FFAF66");
    			attr_dev(path4, "stroke", "#454545");
    			attr_dev(path4, "stroke-width", "2");
    			add_location(path4, file$8, 9, 4, 2316);
    			attr_dev(path5, "d", "M107.578 20.864c7.081 4.586 14.513-1.346 17.326-4.836l-4.068-2.641c-7.332.598-20.339 2.89-13.258 7.477z");
    			attr_dev(path5, "fill", "#FFAF66");
    			attr_dev(path5, "stroke", "#454545");
    			attr_dev(path5, "stroke-width", "2");
    			add_location(path5, file$8, 10, 4, 2794);
    			attr_dev(path6, "d", "M120.133 18.222c7.081 4.586 14.513-1.346 17.325-4.835l-4.067-2.642c-7.383.548-20.389 2.841-13.258 7.477z");
    			attr_dev(path6, "fill", "#FFAF66");
    			attr_dev(path6, "stroke", "#454545");
    			attr_dev(path6, "stroke-width", "2");
    			add_location(path6, file$8, 11, 4, 2963);
    			attr_dev(path7, "d", "M107.176 15.082c7.081 4.585 14.513-1.346 17.326-4.836l-4.068-2.642c-7.382.598-20.389 2.891-13.258 7.478z");
    			attr_dev(path7, "fill", "#FFAF66");
    			attr_dev(path7, "stroke", "#454545");
    			attr_dev(path7, "stroke-width", "2");
    			add_location(path7, file$8, 12, 4, 3133);
    			attr_dev(path8, "d", "M118.174 3.616l-1.356.997c-1.105.748-1.155 2.343-.15 3.19 3.666 3.19 9.943 6.43 15.718 2.343 6.629-4.735-5.424-6.53-12.906-6.879-.452-.05-.904.1-1.306.35z");
    			attr_dev(path8, "fill", "#FFAF66");
    			attr_dev(path8, "stroke", "#454545");
    			attr_dev(path8, "stroke-width", "2");
    			add_location(path8, file$8, 13, 4, 3303);
    			attr_dev(path9, "d", "M124.552 8.9l-1.557 1.097c-1.004.698-1.105 2.193-.15 2.99 3.615 3.191 9.993 6.58 15.818 2.443 6.68-4.735-5.423-6.53-12.906-6.879-.402-.05-.854.1-1.205.35zm-24.105 4.885c7.081 4.586 14.513-1.346 17.325-4.835l-4.067-2.642c-7.332.548-20.34 2.891-13.258 7.477z");
    			attr_dev(path9, "fill", "#FFAF66");
    			attr_dev(path9, "stroke", "#454545");
    			attr_dev(path9, "stroke-width", "2");
    			add_location(path9, file$8, 14, 4, 3523);
    			attr_dev(path10, "d", "M118.174 12.09c8.738-2.143 2.21-6.729-2.812-9.072a2.659 2.659 0 00-1.758-.15l-2.661.649a2.722 2.722 0 00-2.009 2.392c-.151 3.64 1.506 8.076 9.24 6.181zm-3.013 16.4c6.026-8.075-3.967-10.518-9.743-10.767l-3.465 4.586c1.909 5.434 7.182 14.257 13.208 6.181zm14.463-3.39c5.424 8.475 11.35.1 13.609-5.183l-3.113-4.836c-5.775-.199-15.919 1.546-10.496 10.02z");
    			attr_dev(path10, "fill", "#FFAF66");
    			attr_dev(path10, "stroke", "#454545");
    			attr_dev(path10, "stroke-width", "2");
    			add_location(path10, file$8, 15, 4, 3845);
    			attr_dev(svg, "width", "232");
    			attr_dev(svg, "height", "34");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "svelte-jzxiae");
    			add_location(svg, file$8, 4, 2, 31);
    			attr_dev(h3, "class", "sc svelte-jzxiae");
    			add_location(h3, file$8, 19, 4, 4282);
    			attr_dev(button0, "class", "svelte-jzxiae");
    			add_location(button0, file$8, 21, 10, 4337);
    			attr_dev(li0, "class", "svelte-jzxiae");
    			add_location(li0, file$8, 21, 6, 4333);
    			attr_dev(button1, "class", "svelte-jzxiae");
    			add_location(button1, file$8, 22, 10, 4377);
    			attr_dev(li1, "class", "svelte-jzxiae");
    			add_location(li1, file$8, 22, 6, 4373);
    			add_location(ul, file$8, 20, 4, 4322);
    			add_location(div, file$8, 18, 2, 4272);
    			attr_dev(small, "class", "sc svelte-jzxiae");
    			add_location(small, file$8, 25, 2, 4429);
    			attr_dev(footer, "class", "svelte-jzxiae");
    			add_location(footer, file$8, 3, 0, 20);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, svg);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    			append_dev(svg, path3);
    			append_dev(svg, path4);
    			append_dev(svg, path5);
    			append_dev(svg, path6);
    			append_dev(svg, path7);
    			append_dev(svg, path8);
    			append_dev(svg, path9);
    			append_dev(svg, path10);
    			append_dev(footer, t0);
    			append_dev(footer, div);
    			append_dev(div, h3);
    			append_dev(div, t2);
    			append_dev(div, ul);
    			append_dev(ul, li0);
    			append_dev(li0, button0);
    			append_dev(ul, t4);
    			append_dev(ul, li1);
    			append_dev(li1, button1);
    			append_dev(footer, t6);
    			append_dev(footer, small);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Footer", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.29.4 */
    const file$9 = "src/App.svelte";

    function create_fragment$9(ctx) {
    	let link0;
    	let link1;
    	let t0;
    	let header;
    	let t1;
    	let main;
    	let hero;
    	let t2;
    	let vennanimation;
    	let t3;
    	let section0;
    	let h20;
    	let t5;
    	let h21;
    	let t7;
    	let projectsection;
    	let t8;
    	let section1;
    	let h1;
    	let t10;
    	let h22;
    	let t12;
    	let div;
    	let button;
    	let t13;
    	let footer;
    	let current;
    	header = new Header({ $$inline: true });
    	hero = new Hero({ $$inline: true });
    	vennanimation = new VennAnimation({ $$inline: true });
    	projectsection = new ProjectSection({ $$inline: true });

    	button = new Button({
    			props: {
    				txt: "get in touch!",
    				href: "mailto:z@zaharano.com"
    			},
    			$$inline: true
    		});

    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			link0 = element("link");
    			link1 = element("link");
    			t0 = space();
    			create_component(header.$$.fragment);
    			t1 = space();
    			main = element("main");
    			create_component(hero.$$.fragment);
    			t2 = space();
    			create_component(vennanimation.$$.fragment);
    			t3 = space();
    			section0 = element("section");
    			h20 = element("h2");
    			h20.textContent = "I have a very versatile toolbox collected from a decade of varied experiences and a love of side projects. I enjoy playing with the intersections of these tools to find delightful new ways to communicate.";
    			t5 = space();
    			h21 = element("h2");
    			h21.textContent = "Here's a bunch of words I know things about:";
    			t7 = space();
    			create_component(projectsection.$$.fragment);
    			t8 = space();
    			section1 = element("section");
    			h1 = element("h1");
    			h1.textContent = "Contact Me";
    			t10 = space();
    			h22 = element("h2");
    			h22.textContent = "I'm always interested in hearing about new work!";
    			t12 = space();
    			div = element("div");
    			create_component(button.$$.fragment);
    			t13 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(link0, "href", "https://fonts.googleapis.com/css2?family=Vollkorn+SC:wght@600&family=Vollkorn:wght@400;600&display=swap");
    			attr_dev(link0, "rel", "stylesheet");
    			add_location(link0, file$9, 15, 1, 575);
    			attr_dev(link1, "rel", "stylesheet");
    			attr_dev(link1, "href", "https://use.typekit.net/plt5xkx.css");
    			add_location(link1, file$9, 16, 1, 711);
    			add_location(h20, file$9, 25, 2, 875);
    			add_location(h21, file$9, 28, 2, 1098);
    			attr_dev(section0, "id", "bio");
    			add_location(section0, file$9, 24, 1, 854);
    			add_location(h1, file$9, 32, 2, 1210);
    			add_location(h22, file$9, 33, 2, 1232);
    			attr_dev(div, "class", "buttonContainer svelte-kdpnyg");
    			add_location(div, file$9, 36, 2, 1299);
    			attr_dev(section1, "id", "contact");
    			attr_dev(section1, "class", "svelte-kdpnyg");
    			add_location(section1, file$9, 31, 1, 1185);
    			attr_dev(main, "id", "main");
    			attr_dev(main, "class", "svelte-kdpnyg");
    			add_location(main, file$9, 21, 0, 807);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, link0);
    			append_dev(document.head, link1);
    			insert_dev(target, t0, anchor);
    			mount_component(header, target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, main, anchor);
    			mount_component(hero, main, null);
    			append_dev(main, t2);
    			mount_component(vennanimation, main, null);
    			append_dev(main, t3);
    			append_dev(main, section0);
    			append_dev(section0, h20);
    			append_dev(section0, t5);
    			append_dev(section0, h21);
    			append_dev(main, t7);
    			mount_component(projectsection, main, null);
    			append_dev(main, t8);
    			append_dev(main, section1);
    			append_dev(section1, h1);
    			append_dev(section1, t10);
    			append_dev(section1, h22);
    			append_dev(section1, t12);
    			append_dev(section1, div);
    			mount_component(button, div, null);
    			insert_dev(target, t13, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(hero.$$.fragment, local);
    			transition_in(vennanimation.$$.fragment, local);
    			transition_in(projectsection.$$.fragment, local);
    			transition_in(button.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(hero.$$.fragment, local);
    			transition_out(vennanimation.$$.fragment, local);
    			transition_out(projectsection.$$.fragment, local);
    			transition_out(button.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(link0);
    			detach_dev(link1);
    			if (detaching) detach_dev(t0);
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(main);
    			destroy_component(hero);
    			destroy_component(vennanimation);
    			destroy_component(projectsection);
    			destroy_component(button);
    			if (detaching) detach_dev(t13);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Header,
    		Hero,
    		VennAnimation,
    		ProjectSection,
    		Footer,
    		Button,
    		reduceMotion
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    // import content from './myContent';

    const app = new App({
    	target: document.body,
    	// props: {
    	// 	content
    	// }
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
