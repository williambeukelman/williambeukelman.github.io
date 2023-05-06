var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
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
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
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
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
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
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
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
    function set_data(text, data) {
        data = '' + data;
        if (text.wholeText !== data)
            text.data = data;
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
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
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
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
            managed_styles.forEach(info => {
                const { stylesheet } = info;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                info.rules = {};
            });
            managed_styles.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
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
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
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
        seen_callbacks.clear();
        set_current_component(saved_component);
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
            const d = (program.b - t);
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
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
        }
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
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
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
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
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
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
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

    /* src/components/Navigation.svelte generated by Svelte v3.47.0 */

    const { window: window_1 } = globals;

    function create_fragment$6(ctx) {
    	let scrolling = false;

    	let clear_scrolling = () => {
    		scrolling = false;
    	};

    	let scrolling_timeout;
    	let nav0;
    	let div0;
    	let a0;
    	let t1;
    	let nav1;
    	let div2;
    	let button;
    	let t2;
    	let div1;
    	let ul;
    	let li0;
    	let a1;
    	let t4;
    	let li1;
    	let a2;
    	let t6;
    	let li2;
    	let a3;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowscroll*/ ctx[1]);

    	return {
    		c() {
    			nav0 = element("nav");
    			div0 = element("div");
    			a0 = element("a");
    			a0.textContent = "Top";
    			t1 = space();
    			nav1 = element("nav");
    			div2 = element("div");
    			button = element("button");
    			button.innerHTML = `<span class="navbar-toggler-icon"></span>`;
    			t2 = space();
    			div1 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			a1 = element("a");
    			a1.textContent = "Skills";
    			t4 = space();
    			li1 = element("li");
    			a2 = element("a");
    			a2.textContent = "Projects";
    			t6 = space();
    			li2 = element("li");
    			a3 = element("a");
    			a3.textContent = "Education";
    			attr(a0, "class", "nav-link text-uppercase text-white svelte-z215l3");
    			attr(a0, "href", "#top");
    			attr(div0, "class", "container-fluid");
    			attr(nav0, "class", "navbar navbar-dark bg-transparent svelte-z215l3");
    			attr(nav0, "id", "scrollTop");
    			set_style(nav0, "opacity", 0 + /*y*/ ctx[0] / window.innerHeight);
    			attr(button, "class", "navbar-toggler");
    			attr(button, "type", "button");
    			attr(button, "data-bs-toggle", "collapse");
    			attr(button, "data-bs-target", "#navbarScroll");
    			attr(button, "aria-controls", "navbarScroll");
    			attr(button, "aria-expanded", "false");
    			attr(button, "aria-label", "Toggle navigation");
    			attr(a1, "class", "nav-link");
    			attr(a1, "aria-current", "page");
    			attr(a1, "href", "#skills");
    			attr(li0, "class", "nav-item");
    			attr(a2, "class", "nav-link");
    			attr(a2, "href", "#projects");
    			attr(li1, "class", "nav-item");
    			attr(a3, "class", "nav-link");
    			attr(a3, "href", "#education");
    			attr(li2, "class", "nav-item");
    			attr(ul, "class", "navbar-nav");
    			attr(div1, "class", "collapse navbar-collapse");
    			attr(div1, "id", "navbarScroll");
    			attr(div2, "class", "container justify-content-end");
    			attr(nav1, "class", "navbar navbar-expand-md navbar-dark svelte-z215l3");
    			attr(nav1, "id", "toggle");
    		},
    		m(target, anchor) {
    			insert(target, nav0, anchor);
    			append(nav0, div0);
    			append(div0, a0);
    			insert(target, t1, anchor);
    			insert(target, nav1, anchor);
    			append(nav1, div2);
    			append(div2, button);
    			append(div2, t2);
    			append(div2, div1);
    			append(div1, ul);
    			append(ul, li0);
    			append(li0, a1);
    			append(ul, t4);
    			append(ul, li1);
    			append(li1, a2);
    			append(ul, t6);
    			append(ul, li2);
    			append(li2, a3);

    			if (!mounted) {
    				dispose = [
    					listen(window_1, "scroll", () => {
    						scrolling = true;
    						clearTimeout(scrolling_timeout);
    						scrolling_timeout = setTimeout(clear_scrolling, 100);
    						/*onwindowscroll*/ ctx[1]();
    					}),
    					listen(a0, "click", prevent_default(scrollIntoView)),
    					listen(a1, "click", prevent_default(scrollIntoView)),
    					listen(a2, "click", prevent_default(scrollIntoView)),
    					listen(a3, "click", prevent_default(scrollIntoView))
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*y*/ 1 && !scrolling) {
    				scrolling = true;
    				clearTimeout(scrolling_timeout);
    				scrollTo(window_1.pageXOffset, /*y*/ ctx[0]);
    				scrolling_timeout = setTimeout(clear_scrolling, 100);
    			}

    			if (dirty & /*y*/ 1) {
    				set_style(nav0, "opacity", 0 + /*y*/ ctx[0] / window.innerHeight);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(nav0);
    			if (detaching) detach(t1);
    			if (detaching) detach(nav1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function scrollIntoView({ target }) {
    	const el = document.querySelector(target.getAttribute("href"));
    	if (!el) return;
    	el.scrollIntoView({ behavior: "smooth" });
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let y;

    	function onwindowscroll() {
    		$$invalidate(0, y = window_1.pageYOffset);
    	}

    	return [y, onwindowscroll];
    }

    class Navigation extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$4, create_fragment$6, safe_not_equal, {});
    	}
    }

    /* src/components/Header.svelte generated by Svelte v3.47.0 */

    function create_fragment$5(ctx) {
    	let div6;
    	let div5;
    	let div1;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let h1;
    	let t2;
    	let h50;
    	let t4;
    	let div3;
    	let t7;
    	let div4;

    	return {
    		c() {
    			div6 = element("div");
    			div5 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			img0 = element("img");
    			t0 = space();
    			h1 = element("h1");
    			h1.textContent = "William Beukelman";
    			t2 = space();
    			h50 = element("h5");
    			h50.textContent = "Aspiring Software Developer";
    			t4 = space();
    			div3 = element("div");

    			div3.innerHTML = `<div class="col"><a href="https://github.com/williambeukelman" target="_blank" class="btn btn-transparent" alt="github"><img class="img-fluid social-icon svelte-nqgljs" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" alt="github-logo"/></a> 
        <a href="https://www.linkedin.com/in/williambeuk/" target="_blank" class="btn btn-transparent" alt="linkedin"><img class="img-fluid social-icon svelte-nqgljs" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linkedin/linkedin-plain.svg" alt="linkedin-logo"/></a> 
        <a href="https://codesandbox.io/u/williambeukelman" target="_blank" class="btn btn-transparent" alt="codesandbox"><img class="img-fluid social-icon svelte-nqgljs" src="https://codesandbox.io/csb-ios.svg" alt="codesandbox-logo"/></a></div>`;

    			t7 = space();
    			div4 = element("div");

    			div4.innerHTML = `<h5 class="pb-3 svelte-nqgljs">About Me</h5> 
    <p class="border-left text-start mx-3 svelte-nqgljs">Lifelong interest in all things science, engineering, and computers.
      I am currently pursuing a degree in software development.</p>`;

    			if (!src_url_equal(img0.src, img0_src_value = profilePic)) attr(img0, "src", img0_src_value);
    			attr(img0, "class", "img img-fluid profile rounded-circle svelte-nqgljs");
    			attr(img0, "alt", "profile");
    			attr(h1, "class", "svelte-nqgljs");
    			attr(h50, "class", "svelte-nqgljs");
    			attr(div0, "class", "col");
    			attr(div1, "class", "row");
    			attr(div3, "class", "row py-2 pb-4");
    			attr(div4, "class", "row");
    			attr(div5, "class", "container py-3 svelte-nqgljs");
    			attr(div6, "class", "container-fluid section-header d-flex align-items-center svelte-nqgljs");
    			attr(div6, "id", "top");
    		},
    		m(target, anchor) {
    			insert(target, div6, anchor);
    			append(div6, div5);
    			append(div5, div1);
    			append(div1, div0);
    			append(div0, img0);
    			append(div0, t0);
    			append(div0, h1);
    			append(div0, t2);
    			append(div0, h50);
    			append(div5, t4);
    			append(div5, div3);
    			append(div5, t7);
    			append(div5, div4);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div6);
    		}
    	};
    }

    let profilePic = "/assets/avatar_sm.png";

    class Header extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, null, create_fragment$5, safe_not_equal, {});
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const skill = writable("");
    const projects = writable([
      {
        title: "Music Library Application",
        desc:
          "A simple mock music library and player coded in Vue3, HTML, CSS, and JS.",
        demo: "https://v62igf.csb.app/artist",
        code: "https://github.com/williambeukelman/Music-Library-App",
        image:
          "https://camo.githubusercontent.com/ad0810c98f921ee6571c2274ea4398eb022877d97642ea0b974dd482b16db718/68747470733a2f2f77696c6c69616d6265756b656c6d616e2e6769746875622e696f2f6d757369632d706c617965722d616c62756d732e706e67",
        badges: ["Vue", "Bootstrap"]
      },
      {
        title: "Recyclical Energy",
        desc:
          "A mock business website I designed and coded using Bootstrap in a parallax style.",
        demo: "https://owv4in.csb.app/",
        code: "https://github.com/williambeukelman/Recyclical-Energy-Website/",
        image: "https://williambeukelman.github.io/energy-home.png",
        badges: ["Bootstrap"]
      },
      {
        title: "Twenty Letter Wordle",
        desc:
          "A Svelte application intended to mimic the game of Wordle but with a much longer letter count",
        demo: "https://s9o1y6.csb.app/",
        code: "https://github.com/williambeukelman/Twenty-Letter-Wordle/",
        image:
          "https://williambeukelman.github.io/screenshot-twenty-letter-wordle.png",
        badges: ["Svelte"]
      },
      {
        title: "Sycamore Nursery Website",
        desc: "A fictional nursery website made in javascript and jquery.",
        demo: "https://rgx9lb.csb.app/",
        code: "https://codesandbox.io/s/rgx9lb",
        image: "https://williambeukelman.github.io/screenshot-nursery-website.png",
        badges: ["Javascript", "Jquery"]
      },
      {
        title: "Bike Shop App - Capstone Project",
        desc: "A multiplatform web app, storefront, and ecommerce adminstration tool built together with 9 other students as a capstone class.",
        demo: "https://thebikeshop.app",
        code: "https://github.com/CWI-SWDV-280-Bike-Shop/Bike-Shop",
        image: "",
        badges: ["React-Native", "Mongodb", "Javascript", "ExpressJS", "Docker", "NodeJS"]
      },
      {
        title: "Stellar Explorers Game",
        desc: "Final for game development class, a 3D real-time strategy space exploration game built entirely from stratch using Unity game engine.",
        demo: "https://play.unity.com/mg/other/build-km4",
        code: "",
        image: "",
        badges: ["Csharp", "Unity"]
      },
      {
        title: "Webscraping and Report Generation Project",
        desc: "As part of an internship I made a tool to do web scraping, and report generation for intial data collection efforts for my college.",
        demo: "",
        code: "https://github.com/williambeukelman/python-company-stack-analysis",
        image: "",
        badges: ["Python", "Flask", "Selenium"]
      },
      {
        title: "Data Collection Utility",
        desc: "Myself and another student created this small Flask app as an internal tool for my college's research efforts as part of an internship.",
        demo: "",
        code: "",
        image: "",
        badges: ["Python", "Flask", "Javascript"]
      }
    ]);
    const icons = writable({
      "Svelte":
        "public/svelte-original.svg",
      "Vue":
        "public/vuejs-original.svg",
      "Bootstrap":
        "public/bootstrap-original.svg",
      "Csharp":
        "public/csharp-original.svg",
      "Flask":
        "public/flask-original.svg",
      "Git":
        "public/git-original.svg",
      "Javascript":
        "public/javascript-original.svg",
      "Jquery":
        "public/jquery-original.svg",
      "Linux":
        "public/linux-plain.svg",
      "Python":
        "public/python-original.svg",
      "Arduino":
        "public/arduino-original.svg",
      "PHP":
        "public/php-original.svg",
      "SQL":
        "public/mysql-original.svg",
      "React-Native":
        "public/react-original.svg",
      "Docker":
        "public/docker-original.svg",
      "ASP.NET":
        "public/dot-net-original.svg",
      "ExpressJS":
        "public/express-original.svg",
      "Mongodb":
        "public/mongodb-original.svg",
      "NodeJS":
        "public/nodejs-original.svg",
      "Selenium":
        "public/selenium-original.svg",
      "Unity":
        "public/unity-original.svg",
    });

    /* src/components/Skills.svelte generated by Svelte v3.47.0 */

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (125:12) {#if $icons[skill.name]}
    function create_if_block$2(ctx) {
    	let img;
    	let img_src_value;

    	return {
    		c() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*$icons*/ ctx[0][/*skill*/ ctx[5].name])) attr(img, "src", img_src_value);
    			attr(img, "alt", "" + (/*skill*/ ctx[5].name + "-logo"));
    			attr(img, "class", "svelte-occ32y");
    		},
    		m(target, anchor) {
    			insert(target, img, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$icons*/ 1 && !src_url_equal(img.src, img_src_value = /*$icons*/ ctx[0][/*skill*/ ctx[5].name])) {
    				attr(img, "src", img_src_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(img);
    		}
    	};
    }

    // (114:6) {#each skills as skill}
    function create_each_block$2(ctx) {
    	let button;
    	let div;
    	let t0;
    	let span;
    	let t1_value = /*skill*/ ctx[5].name + "";
    	let t1;
    	let mounted;
    	let dispose;
    	let if_block = /*$icons*/ ctx[0][/*skill*/ ctx[5].name] && create_if_block$2(ctx);

    	function click_handler() {
    		return /*click_handler*/ ctx[3](/*skill*/ ctx[5]);
    	}

    	return {
    		c() {
    			button = element("button");
    			div = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			span = element("span");
    			t1 = text(t1_value);
    			attr(span, "class", "badge bg-dark");
    			attr(div, "class", "skill-card svelte-occ32y");
    			attr(button, "type", "button");
    			button.disabled = !/*skill*/ ctx[5].btn;
    			attr(button, "class", "btn btn-outline-dark svelte-occ32y");
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);
    			append(button, div);
    			if (if_block) if_block.m(div, null);
    			append(div, t0);
    			append(div, span);
    			append(span, t1);

    			if (!mounted) {
    				dispose = listen(button, "click", click_handler);
    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*$icons*/ ctx[0][/*skill*/ ctx[5].name]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(div, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(button);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function create_fragment$4(ctx) {
    	let div5;
    	let div1;
    	let t3;
    	let div4;
    	let div3;
    	let t4;
    	let button;
    	let mounted;
    	let dispose;
    	let each_value = /*skills*/ ctx[1];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	return {
    		c() {
    			div5 = element("div");
    			div1 = element("div");

    			div1.innerHTML = `<div class="col"><h1 class="svelte-occ32y">Skills &amp; Technologies</h1> 
      <p>Tap an icon below to filter for projects matching a skill or technology.</p></div>`;

    			t3 = space();
    			div4 = element("div");
    			div3 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			button = element("button");
    			button.innerHTML = `<div class="skill-card svelte-occ32y">All Projects</div>`;
    			attr(div1, "class", "row py-3");
    			attr(button, "type", "button");
    			attr(button, "class", "btn btn-dark mx-3 svelte-occ32y");
    			attr(div3, "class", "d-flex gap-3 flex-wrap justify-content-center");
    			attr(div4, "class", "row skill-icons svelte-occ32y");
    			attr(div5, "class", "container section-skills svelte-occ32y");
    			attr(div5, "id", "skills");
    		},
    		m(target, anchor) {
    			insert(target, div5, anchor);
    			append(div5, div1);
    			append(div5, t3);
    			append(div5, div4);
    			append(div4, div3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div3, null);
    			}

    			append(div3, t4);
    			append(div3, button);

    			if (!mounted) {
    				dispose = listen(button, "click", /*click_handler_1*/ ctx[4]);
    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*skills, updateSkill, scroll, $icons*/ 7) {
    				each_value = /*skills*/ ctx[1];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div3, t4);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div5);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function scroll() {
    	const el = document.querySelector("#projects");
    	if (!el) return;
    	el.scrollIntoView({ behavior: "smooth" });
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $icons;
    	component_subscribe($$self, icons, $$value => $$invalidate(0, $icons = $$value));

    	let skills = [
    		{ name: "Svelte", btn: true },
    		{ name: "Vue", btn: true },
    		{ name: "Bootstrap", btn: true },
    		{ name: "Csharp", btn: false },
    		{ name: "Flask", btn: false },
    		{ name: "Git", btn: false },
    		{ name: "Javascript", btn: true },
    		{ name: "Jquery", btn: true },
    		{ name: "Linux", btn: false },
    		{ name: "Python", btn: false },
    		{ name: "Arduino", btn: false },
    		{ name: "PHP", btn: false },
    		{ name: "SQL", btn: false },
    		{ name: "React-Native", btn: false },
    		{ name: "Docker", btn: false },
    		{ name: "ASP.NET", btn: false },
    		{ name: "ExpressJS", btn: false },
    		{ name: "Mongodb", btn: false },
    		{ name: "NodeJS", btn: false },
    		{ name: "Selenium", btn: false },
    		{ name: "Unity", btn: false }
    	];

    	function updateSkill(value) {
    		skill.set(value);
    	}

    	const click_handler = skill => {
    		updateSkill(skill.name);
    		scroll();
    	};

    	const click_handler_1 = () => updateSkill("");
    	return [$icons, skills, updateSkill, click_handler, click_handler_1];
    }

    class Skills extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$3, create_fragment$4, safe_not_equal, {});
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const sd = 1 - start;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `
			transform: ${transform} scale(${1 - (sd * u)});
			opacity: ${target_opacity - (od * u)}
		`
        };
    }

    /* src/components/Projects.svelte generated by Svelte v3.47.0 */

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (106:8) {#if project.badges}
    function create_if_block_2$1(ctx) {
    	let each_1_anchor;
    	let each_value_1 = /*project*/ ctx[4].badges;
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	return {
    		c() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$icons, filterProjects*/ 6) {
    				each_value_1 = /*project*/ ctx[4].badges;
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach(each_1_anchor);
    		}
    	};
    }

    // (106:28) {#each project.badges as badge}
    function create_each_block_1(ctx) {
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t;

    	return {
    		c() {
    			img = element("img");
    			t = space();
    			attr(img, "class", "language-badge svelte-1r52gt4");
    			if (!src_url_equal(img.src, img_src_value = /*$icons*/ ctx[2][/*badge*/ ctx[7]])) attr(img, "src", img_src_value);
    			attr(img, "alt", img_alt_value = "" + (/*badge*/ ctx[7] + "-logo"));
    		},
    		m(target, anchor) {
    			insert(target, img, anchor);
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$icons, filterProjects*/ 6 && !src_url_equal(img.src, img_src_value = /*$icons*/ ctx[2][/*badge*/ ctx[7]])) {
    				attr(img, "src", img_src_value);
    			}

    			if (dirty & /*filterProjects*/ 2 && img_alt_value !== (img_alt_value = "" + (/*badge*/ ctx[7] + "-logo"))) {
    				attr(img, "alt", img_alt_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(img);
    			if (detaching) detach(t);
    		}
    	};
    }

    // (114:10) {#if project.demo}
    function create_if_block_1$1(ctx) {
    	let a;
    	let t;
    	let a_href_value;

    	return {
    		c() {
    			a = element("a");
    			t = text("Demo");
    			attr(a, "href", a_href_value = /*project*/ ctx[4].demo);
    			attr(a, "target", "_blank");
    			attr(a, "class", "btn btn-outline-danger");
    		},
    		m(target, anchor) {
    			insert(target, a, anchor);
    			append(a, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*filterProjects*/ 2 && a_href_value !== (a_href_value = /*project*/ ctx[4].demo)) {
    				attr(a, "href", a_href_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(a);
    		}
    	};
    }

    // (115:10) {#if project.code}
    function create_if_block$1(ctx) {
    	let a;
    	let t;
    	let a_href_value;

    	return {
    		c() {
    			a = element("a");
    			t = text("Code");
    			attr(a, "href", a_href_value = /*project*/ ctx[4].code);
    			attr(a, "target", "_blank");
    			attr(a, "class", "btn btn-outline-light");
    		},
    		m(target, anchor) {
    			insert(target, a, anchor);
    			append(a, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*filterProjects*/ 2 && a_href_value !== (a_href_value = /*project*/ ctx[4].code)) {
    				attr(a, "href", a_href_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(a);
    		}
    	};
    }

    // (103:4) {#each filterProjects as project}
    function create_each_block$1(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let img;
    	let img_src_value;
    	let t1;
    	let div1;
    	let h5;
    	let t2_value = /*project*/ ctx[4].title + "";
    	let t2;
    	let t3;
    	let p;
    	let t4_value = /*project*/ ctx[4].desc + "";
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let div2_transition;
    	let current;
    	let if_block0 = /*project*/ ctx[4].badges && create_if_block_2$1(ctx);
    	let if_block1 = /*project*/ ctx[4].demo && create_if_block_1$1(ctx);
    	let if_block2 = /*project*/ ctx[4].code && create_if_block$1(ctx);

    	return {
    		c() {
    			div2 = element("div");
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			img = element("img");
    			t1 = space();
    			div1 = element("div");
    			h5 = element("h5");
    			t2 = text(t2_value);
    			t3 = space();
    			p = element("p");
    			t4 = text(t4_value);
    			t5 = space();
    			if (if_block1) if_block1.c();
    			t6 = space();
    			if (if_block2) if_block2.c();
    			t7 = space();
    			attr(div0, "class", "langs svelte-1r52gt4");
    			attr(img, "class", "card-img-top svelte-1r52gt4");
    			if (!src_url_equal(img.src, img_src_value = /*project*/ ctx[4].image)) attr(img, "src", img_src_value);
    			attr(img, "alt", "project");
    			attr(h5, "class", "card-title svelte-1r52gt4");
    			attr(p, "class", "card-text");
    			attr(div1, "class", "card-body svelte-1r52gt4");
    			attr(div2, "class", "card mb-4 svelte-1r52gt4");
    		},
    		m(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, div0);
    			if (if_block0) if_block0.m(div0, null);
    			append(div2, t0);
    			append(div2, img);
    			append(div2, t1);
    			append(div2, div1);
    			append(div1, h5);
    			append(h5, t2);
    			append(div1, t3);
    			append(div1, p);
    			append(p, t4);
    			append(div1, t5);
    			if (if_block1) if_block1.m(div1, null);
    			append(div1, t6);
    			if (if_block2) if_block2.m(div1, null);
    			append(div2, t7);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (/*project*/ ctx[4].badges) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2$1(ctx);
    					if_block0.c();
    					if_block0.m(div0, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (!current || dirty & /*filterProjects*/ 2 && !src_url_equal(img.src, img_src_value = /*project*/ ctx[4].image)) {
    				attr(img, "src", img_src_value);
    			}

    			if ((!current || dirty & /*filterProjects*/ 2) && t2_value !== (t2_value = /*project*/ ctx[4].title + "")) set_data(t2, t2_value);
    			if ((!current || dirty & /*filterProjects*/ 2) && t4_value !== (t4_value = /*project*/ ctx[4].desc + "")) set_data(t4, t4_value);

    			if (/*project*/ ctx[4].demo) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$1(ctx);
    					if_block1.c();
    					if_block1.m(div1, t6);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*project*/ ctx[4].code) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block$1(ctx);
    					if_block2.c();
    					if_block2.m(div1, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		i(local) {
    			if (current) return;

    			if (local) {
    				add_render_callback(() => {
    					if (!div2_transition) div2_transition = create_bidirectional_transition(div2, scale, {}, true);
    					div2_transition.run(1);
    				});
    			}

    			current = true;
    		},
    		o(local) {
    			if (local) {
    				if (!div2_transition) div2_transition = create_bidirectional_transition(div2, scale, {}, false);
    				div2_transition.run(0);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div2);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (detaching && div2_transition) div2_transition.end();
    		}
    	};
    }

    function create_fragment$3(ctx) {
    	let div1;
    	let h1;
    	let t0;
    	let t1;
    	let t2;
    	let div0;
    	let current;
    	let each_value = /*filterProjects*/ ctx[1];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c() {
    			div1 = element("div");
    			h1 = element("h1");
    			t0 = text(/*$skill*/ ctx[0]);
    			t1 = text(" Projects");
    			t2 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(h1, "class", "mb-4 svelte-1r52gt4");
    			attr(div0, "class", "projectBox d-flex gap-2 flex-row justify-content-start svelte-1r52gt4");
    			attr(div1, "class", "container-fluid my-3 p-2 svelte-1r52gt4");
    			attr(div1, "id", "projects");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, h1);
    			append(h1, t0);
    			append(h1, t1);
    			append(div1, t2);
    			append(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (!current || dirty & /*$skill*/ 1) set_data(t0, /*$skill*/ ctx[0]);

    			if (dirty & /*filterProjects, $icons*/ 6) {
    				each_value = /*filterProjects*/ ctx[1];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let filterProjects;
    	let $skill;
    	let $projects;
    	let $icons;
    	component_subscribe($$self, skill, $$value => $$invalidate(0, $skill = $$value));
    	component_subscribe($$self, projects, $$value => $$invalidate(3, $projects = $$value));
    	component_subscribe($$self, icons, $$value => $$invalidate(2, $icons = $$value));

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$skill, $projects*/ 9) {
    			$$invalidate(1, filterProjects = $skill === ""
    			? $projects
    			: $projects.filter(item => {
    					return item.badges.includes($skill);
    				})); /*.some(badge => {
                return badge === $skill;
              });*/
    		}
    	};

    	return [$skill, filterProjects, $icons, $projects];
    }

    class Projects extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$2, create_fragment$3, safe_not_equal, {});
    	}
    }

    /* src/components/Education.svelte generated by Svelte v3.47.0 */

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (77:51) 
    function create_if_block_2(ctx) {
    	let div;

    	return {
    		c() {
    			div = element("div");
    			attr(div, "class", "icon svelte-ep14h");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			div.innerHTML = /*degree*/ ctx[3];
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    // (75:12) {#if certificate.type == 'award'}
    function create_if_block_1(ctx) {
    	let div;

    	return {
    		c() {
    			div = element("div");
    			attr(div, "class", "icon svelte-ep14h");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			div.innerHTML = /*award*/ ctx[2];
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    // (82:10) {:else}
    function create_else_block(ctx) {
    	let t_value = /*certificate*/ ctx[5].short + "";
    	let t;

    	return {
    		c() {
    			t = text(t_value);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (80:10) {#if windowWidth > 640}
    function create_if_block(ctx) {
    	let t_value = /*certificate*/ ctx[5].title + "";
    	let t;

    	return {
    		c() {
    			t = text(t_value);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (71:4) {#each certificates as certificate}
    function create_each_block(ctx) {
    	let div1;
    	let div0;
    	let h5;
    	let t0;
    	let t1;
    	let h60;
    	let t2_value = /*certificate*/ ctx[5].institution + "";
    	let t2;
    	let t3;
    	let h61;
    	let t4_value = /*certificate*/ ctx[5].subtitle + "";
    	let t4;
    	let t5;
    	let p;
    	let t6_value = /*certificate*/ ctx[5].desc + "";
    	let t6;
    	let t7;

    	function select_block_type(ctx, dirty) {
    		if (/*certificate*/ ctx[5].type == 'award') return create_if_block_1;
    		if (/*certificate*/ ctx[5].type == 'degree') return create_if_block_2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type && current_block_type(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*windowWidth*/ ctx[0] > 640) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block1 = current_block_type_1(ctx);

    	return {
    		c() {
    			div1 = element("div");
    			div0 = element("div");
    			h5 = element("h5");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if_block1.c();
    			t1 = space();
    			h60 = element("h6");
    			t2 = text(t2_value);
    			t3 = space();
    			h61 = element("h6");
    			t4 = text(t4_value);
    			t5 = space();
    			p = element("p");
    			t6 = text(t6_value);
    			t7 = space();
    			attr(h5, "class", "card-title svelte-ep14h");
    			attr(h60, "class", "card-subtitle mb-2");
    			attr(h61, "class", "card-subtitle mb-2 text-muted");
    			attr(p, "class", "card-text");
    			attr(div0, "class", "card-body svelte-ep14h");
    			attr(div1, "class", "col-sm card svelte-ep14h");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			append(div0, h5);
    			if (if_block0) if_block0.m(h5, null);
    			append(h5, t0);
    			if_block1.m(h5, null);
    			append(div0, t1);
    			append(div0, h60);
    			append(h60, t2);
    			append(div0, t3);
    			append(div0, h61);
    			append(h61, t4);
    			append(div0, t5);
    			append(div0, p);
    			append(p, t6);
    			append(div1, t7);
    		},
    		p(ctx, dirty) {
    			if (if_block0) if_block0.p(ctx, dirty);

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type_1(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(h5, null);
    				}
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div1);

    			if (if_block0) {
    				if_block0.d();
    			}

    			if_block1.d();
    		}
    	};
    }

    function create_fragment$2(ctx) {
    	let div1;
    	let h1;
    	let t1;
    	let div0;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowresize*/ ctx[4]);
    	let each_value = /*certificates*/ ctx[1];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	return {
    		c() {
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Education & Certificates";
    			t1 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(h1, "class", "mb-4 svelte-ep14h");
    			attr(div0, "class", "row gap-2 justify-content-center");
    			attr(div1, "class", "container pb-5");
    			attr(div1, "id", "education");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, h1);
    			append(div1, t1);
    			append(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			if (!mounted) {
    				dispose = listen(window, "resize", /*onwindowresize*/ ctx[4]);
    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*certificates, windowWidth, award, degree*/ 15) {
    				each_value = /*certificates*/ ctx[1];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div1);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let windowWidth;

    	let certificates = [
    		{
    			type: "degree",
    			title: "Associate of Applied Science  (Software Development)",
    			short: "A.A.S",
    			institution: "College of Western Idaho",
    			subtitle: "Boise, Idaho, 2021 - 2023",
    			desc: "I earned an A.S in software development which covered a wide range of technologies such as C# and .NET, ASP.NET, PHP, SQL, React-Native, Javascript, HTML/CSS, and more. With a large portion of the program focusing on full-stack development and the integration of the aforementioned technologies in project based courses."
    		},
    		{
    			type: "degree",
    			title: "Associate of Science",
    			short: "A.S",
    			institution: "Boise State University",
    			subtitle: "Boise, Idaho, 2014 - 2018",
    			desc: "I began pursuing a Bachelor's in Biology at BSU before pivoting and receiving an Associate of Applied Science."
    		}
    	];

    	let award = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-award" viewBox="0 0 16 16">
                          <path d="M9.669.864 8 0 6.331.864l-1.858.282-.842 1.68-1.337 1.32L2.6 6l-.306 1.854 1.337 1.32.842 1.68 1.858.282L8 12l1.669-.864 1.858-.282.842-1.68 1.337-1.32L13.4 6l.306-1.854-1.337-1.32-.842-1.68L9.669.864zm1.196 1.193.684 1.365 1.086 1.072L12.387 6l.248 1.506-1.086 1.072-.684 1.365-1.51.229L8 10.874l-1.355-.702-1.51-.229-.684-1.365-1.086-1.072L3.614 6l-.25-1.506 1.087-1.072.684-1.365 1.51-.229L8 1.126l1.356.702 1.509.229z"/>
                          <path d="M4 11.794V16l4-1 4 1v-4.206l-2.018.306L8 13.126 6.018 12.1 4 11.794z"/>
                        </svg> `;

    	let degree = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-mortarboard" viewBox="0 0 16 16">
                          <path d="M8.211 2.047a.5.5 0 0 0-.422 0l-7.5 3.5a.5.5 0 0 0 .025.917l7.5 3a.5.5 0 0 0 .372 0L14 7.14V13a1 1 0 0 0-1 1v2h3v-2a1 1 0 0 0-1-1V6.739l.686-.275a.5.5 0 0 0 .025-.917l-7.5-3.5ZM8 8.46 1.758 5.965 8 3.052l6.242 2.913L8 8.46Z"/>
                          <path d="M4.176 9.032a.5.5 0 0 0-.656.327l-.5 1.7a.5.5 0 0 0 .294.605l4.5 1.8a.5.5 0 0 0 .372 0l4.5-1.8a.5.5 0 0 0 .294-.605l-.5-1.7a.5.5 0 0 0-.656-.327L8 10.466 4.176 9.032Zm-.068 1.873.22-.748 3.496 1.311a.5.5 0 0 0 .352 0l3.496-1.311.22.748L8 12.46l-3.892-1.556Z"/>
                        </svg>`;

    	function onwindowresize() {
    		$$invalidate(0, windowWidth = window.innerWidth);
    	}

    	return [windowWidth, certificates, award, degree, onwindowresize];
    }

    class Education extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$1, create_fragment$2, safe_not_equal, {});
    	}
    }

    /* src/components/Footer.svelte generated by Svelte v3.47.0 */

    function create_fragment$1(ctx) {
    	let div7;
    	let div6;
    	let div5;
    	let div0;
    	let t2;
    	let div4;
    	let form;
    	let div1;
    	let input0;
    	let t3;
    	let label0;
    	let t5;
    	let div2;
    	let input1;
    	let t6;
    	let label1;
    	let t8;
    	let div3;
    	let textarea;
    	let t9;
    	let label2;
    	let t11;
    	let button1;
    	let t12;
    	let button1_disabled_value;
    	let button1_class_value;
    	let t13;
    	let div10;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div7 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			div0 = element("div");

    			div0.innerHTML = `<h2 class="fw-bold mb-0">Send a message</h2> 
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>`;

    			t2 = space();
    			div4 = element("div");
    			form = element("form");
    			div1 = element("div");
    			input0 = element("input");
    			t3 = space();
    			label0 = element("label");
    			label0.textContent = "Your email";
    			t5 = space();
    			div2 = element("div");
    			input1 = element("input");
    			t6 = space();
    			label1 = element("label");
    			label1.textContent = "Subject";
    			t8 = space();
    			div3 = element("div");
    			textarea = element("textarea");
    			t9 = space();
    			label2 = element("label");
    			label2.textContent = "Message";
    			t11 = space();
    			button1 = element("button");
    			t12 = text(/*SubmitText*/ ctx[5]);
    			t13 = space();
    			div10 = element("div");
    			div10.innerHTML = `<div class="row"><div class="col"><p>Website &amp; Design by William Beukelman</p></div></div>`;
    			attr(div0, "class", "modal-header p-5 pb-4 border-bottom-0");
    			attr(input0, "type", "email");
    			attr(input0, "class", "form-control rounded-4");
    			attr(input0, "id", "inputEmail");
    			attr(input0, "placeholder", "name@example.com");
    			attr(label0, "for", "inputEmail");
    			attr(div1, "class", "form-floating mb-3");
    			attr(input1, "type", "text");
    			attr(input1, "class", "form-control rounded-4");
    			attr(input1, "id", "inputSubject");
    			attr(input1, "placeholder", "Subject line");
    			attr(label1, "for", "inputSubject");
    			attr(div2, "class", "form-floating mb-3");
    			attr(textarea, "class", "form-control rounded-4");
    			attr(textarea, "id", "inputMessage");
    			attr(label2, "for", "inputMessage");
    			attr(div3, "class", "form-floating mb-3");
    			button1.disabled = button1_disabled_value = !/*ValidForm*/ ctx[3];
    			attr(button1, "type", "button");
    			attr(button1, "class", button1_class_value = "w-100 mb-2 btn btn-lg rounded-4 " + /*SubmitStyle*/ ctx[4]);
    			attr(button1, "data-bs-dismiss", "modal");
    			attr(form, "class", "");
    			attr(div4, "class", "modal-body p-5 pt-0");
    			attr(div5, "class", "modal-content rounded-5 shadow");
    			attr(div6, "class", "modal-dialog");
    			attr(div6, "role", "document");
    			attr(div7, "class", "modal fade py-5");
    			attr(div7, "tabindex", "-1");
    			attr(div7, "role", "dialog");
    			attr(div7, "id", "modalMessage");
    			attr(div7, "aria-hidden", "true");
    			attr(div10, "class", "container-fluid d-flex justify-content-center bg-dark text-white py-3");
    		},
    		m(target, anchor) {
    			insert(target, div7, anchor);
    			append(div7, div6);
    			append(div6, div5);
    			append(div5, div0);
    			append(div5, t2);
    			append(div5, div4);
    			append(div4, form);
    			append(form, div1);
    			append(div1, input0);
    			set_input_value(input0, /*formEmail*/ ctx[0]);
    			append(div1, t3);
    			append(div1, label0);
    			append(form, t5);
    			append(form, div2);
    			append(div2, input1);
    			set_input_value(input1, /*formSubject*/ ctx[1]);
    			append(div2, t6);
    			append(div2, label1);
    			append(form, t8);
    			append(form, div3);
    			append(div3, textarea);
    			set_input_value(textarea, /*formMsg*/ ctx[2]);
    			append(div3, t9);
    			append(div3, label2);
    			append(form, t11);
    			append(form, button1);
    			append(button1, t12);
    			insert(target, t13, anchor);
    			insert(target, div10, anchor);

    			if (!mounted) {
    				dispose = [
    					listen(input0, "input", /*input0_input_handler*/ ctx[9]),
    					listen(input1, "input", /*input1_input_handler*/ ctx[10]),
    					listen(textarea, "input", /*textarea_input_handler*/ ctx[11]),
    					listen(button1, "click", /*handleFormSubmit*/ ctx[6])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*formEmail*/ 1 && input0.value !== /*formEmail*/ ctx[0]) {
    				set_input_value(input0, /*formEmail*/ ctx[0]);
    			}

    			if (dirty & /*formSubject*/ 2 && input1.value !== /*formSubject*/ ctx[1]) {
    				set_input_value(input1, /*formSubject*/ ctx[1]);
    			}

    			if (dirty & /*formMsg*/ 4) {
    				set_input_value(textarea, /*formMsg*/ ctx[2]);
    			}

    			if (dirty & /*SubmitText*/ 32) set_data(t12, /*SubmitText*/ ctx[5]);

    			if (dirty & /*ValidForm*/ 8 && button1_disabled_value !== (button1_disabled_value = !/*ValidForm*/ ctx[3])) {
    				button1.disabled = button1_disabled_value;
    			}

    			if (dirty & /*SubmitStyle*/ 16 && button1_class_value !== (button1_class_value = "w-100 mb-2 btn btn-lg rounded-4 " + /*SubmitStyle*/ ctx[4])) {
    				attr(button1, "class", button1_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div7);
    			if (detaching) detach(t13);
    			if (detaching) detach(div10);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let formFilled;
    	let validEmail;
    	let SubmitText;
    	let SubmitStyle;
    	let ValidForm;
    	let formEmail = "";
    	let formSubject = "";
    	let formMsg = "";

    	function handleFormSubmit() {
    		//Clear form
    		$$invalidate(0, formEmail = "");

    		$$invalidate(1, formSubject = "");
    		$$invalidate(2, formMsg = "");
    	}

    	function input0_input_handler() {
    		formEmail = this.value;
    		$$invalidate(0, formEmail);
    	}

    	function input1_input_handler() {
    		formSubject = this.value;
    		$$invalidate(1, formSubject);
    	}

    	function textarea_input_handler() {
    		formMsg = this.value;
    		$$invalidate(2, formMsg);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*formEmail, formSubject, formMsg*/ 7) {
    			$$invalidate(8, formFilled = formEmail.length > 1 && formSubject.length > 1 && formMsg.length > 1);
    		}

    		if ($$self.$$.dirty & /*formEmail*/ 1) {
    			$$invalidate(7, validEmail = (/\S+@\S+\.\S+/).test(formEmail));
    		}

    		if ($$self.$$.dirty & /*formFilled, validEmail*/ 384) {
    			$$invalidate(3, ValidForm = formFilled && validEmail);
    		}

    		if ($$self.$$.dirty & /*ValidForm, formFilled*/ 264) {
    			$$invalidate(5, SubmitText = ValidForm
    			? "Send"
    			: !formFilled ? "Fill Out Form" : "Invalid Email Format");
    		}

    		if ($$self.$$.dirty & /*ValidForm, formFilled*/ 264) {
    			$$invalidate(4, SubmitStyle = ValidForm
    			? "btn-primary"
    			: !formFilled ? "btn-secondary" : "btn-danger");
    		}
    	};

    	return [
    		formEmail,
    		formSubject,
    		formMsg,
    		ValidForm,
    		SubmitStyle,
    		SubmitText,
    		handleFormSubmit,
    		validEmail,
    		formFilled,
    		input0_input_handler,
    		input1_input_handler,
    		textarea_input_handler
    	];
    }

    class Footer extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance, create_fragment$1, safe_not_equal, {});
    	}
    }

    /* src/App.svelte generated by Svelte v3.47.0 */

    function create_fragment(ctx) {
    	let main;
    	let navigation;
    	let t0;
    	let header;
    	let t1;
    	let skills;
    	let t2;
    	let projects;
    	let t3;
    	let education;
    	let t4;
    	let footer;
    	let current;
    	navigation = new Navigation({});
    	header = new Header({});
    	skills = new Skills({});
    	projects = new Projects({});
    	education = new Education({});
    	footer = new Footer({});

    	return {
    		c() {
    			main = element("main");
    			create_component(navigation.$$.fragment);
    			t0 = space();
    			create_component(header.$$.fragment);
    			t1 = space();
    			create_component(skills.$$.fragment);
    			t2 = space();
    			create_component(projects.$$.fragment);
    			t3 = space();
    			create_component(education.$$.fragment);
    			t4 = space();
    			create_component(footer.$$.fragment);
    			attr(main, "class", "svelte-mfyxg1");
    		},
    		m(target, anchor) {
    			insert(target, main, anchor);
    			mount_component(navigation, main, null);
    			append(main, t0);
    			mount_component(header, main, null);
    			append(main, t1);
    			mount_component(skills, main, null);
    			append(main, t2);
    			mount_component(projects, main, null);
    			append(main, t3);
    			mount_component(education, main, null);
    			append(main, t4);
    			mount_component(footer, main, null);
    			current = true;
    		},
    		p: noop,
    		i(local) {
    			if (current) return;
    			transition_in(navigation.$$.fragment, local);
    			transition_in(header.$$.fragment, local);
    			transition_in(skills.$$.fragment, local);
    			transition_in(projects.$$.fragment, local);
    			transition_in(education.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(navigation.$$.fragment, local);
    			transition_out(header.$$.fragment, local);
    			transition_out(skills.$$.fragment, local);
    			transition_out(projects.$$.fragment, local);
    			transition_out(education.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(main);
    			destroy_component(navigation);
    			destroy_component(header);
    			destroy_component(skills);
    			destroy_component(projects);
    			destroy_component(education);
    			destroy_component(footer);
    		}
    	};
    }

    class App extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, null, create_fragment, safe_not_equal, {});
    	}
    }

    const app = new App({
      target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
