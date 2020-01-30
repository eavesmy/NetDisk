
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
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
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function beforeUpdate(fn) {
        get_current_component().$$.before_update.push(fn);
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
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
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
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
    const outroing = new Set();
    let outros;
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
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
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
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
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
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.17.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src/Modal.svelte generated by Svelte v3.17.1 */

    const file = "src/Modal.svelte";

    function create_fragment(ctx) {
    	let div5;
    	let div4;
    	let div0;
    	let t0;
    	let div3;
    	let div2;
    	let header;
    	let t1;
    	let t2;
    	let div1;
    	let t3;
    	let button;
    	let current;
    	let dispose;

    	const component = new /*Component*/ ctx[1]({
    			props: { FilePath: /*FilePath*/ ctx[2] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div4 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div3 = element("div");
    			div2 = element("div");
    			header = element("header");
    			t1 = text(/*FileName*/ ctx[0]);
    			t2 = space();
    			div1 = element("div");
    			create_component(component.$$.fragment);
    			t3 = space();
    			button = element("button");
    			attr_dev(div0, "class", "modal-background");
    			add_location(div0, file, 16, 2, 283);
    			attr_dev(header, "class", "card-header subtitle is-5");
    			add_location(header, file, 19, 4, 402);
    			attr_dev(div1, "class", "card-content");
    			add_location(div1, file, 22, 4, 479);
    			attr_dev(div2, "class", "card box");
    			add_location(div2, file, 18, 3, 375);
    			attr_dev(div3, "class", "modal-content");
    			add_location(div3, file, 17, 2, 344);
    			attr_dev(button, "class", "modal-close is-large");
    			attr_dev(button, "aria-label", "close");
    			add_location(button, file, 27, 2, 567);
    			attr_dev(div4, "id", "modal");
    			attr_dev(div4, "class", "modal");
    			add_location(div4, file, 15, 1, 250);
    			add_location(div5, file, 14, 0, 243);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    			append_dev(div4, div0);
    			append_dev(div4, t0);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, header);
    			append_dev(header, t1);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			mount_component(component, div1, null);
    			append_dev(div4, t3);
    			append_dev(div4, button);
    			current = true;

    			dispose = [
    				listen_dev(div0, "click", closeModal, false, false, false),
    				listen_dev(button, "click", closeModal, false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*FileName*/ 1) set_data_dev(t1, /*FileName*/ ctx[0]);
    			const component_changes = {};
    			if (dirty & /*FilePath*/ 4) component_changes.FilePath = /*FilePath*/ ctx[2];
    			component.$set(component_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(component.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(component.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_component(component);
    			run_all(dispose);
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

    function closeModal() {

    	document.querySelectorAll(".modal").forEach(it => {
    		it.className = "modal";
    	});
    }

    function instance($$self, $$props, $$invalidate) {
    	let { FileName } = $$props;
    	let { Type } = $$props;
    	let { Component } = $$props;
    	let { FilePath } = $$props;
    	const writable_props = ["FileName", "Type", "Component", "FilePath"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("FileName" in $$props) $$invalidate(0, FileName = $$props.FileName);
    		if ("Type" in $$props) $$invalidate(3, Type = $$props.Type);
    		if ("Component" in $$props) $$invalidate(1, Component = $$props.Component);
    		if ("FilePath" in $$props) $$invalidate(2, FilePath = $$props.FilePath);
    	};

    	$$self.$capture_state = () => {
    		return { FileName, Type, Component, FilePath };
    	};

    	$$self.$inject_state = $$props => {
    		if ("FileName" in $$props) $$invalidate(0, FileName = $$props.FileName);
    		if ("Type" in $$props) $$invalidate(3, Type = $$props.Type);
    		if ("Component" in $$props) $$invalidate(1, Component = $$props.Component);
    		if ("FilePath" in $$props) $$invalidate(2, FilePath = $$props.FilePath);
    	};

    	return [FileName, Component, FilePath, Type];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			FileName: 0,
    			Type: 3,
    			Component: 1,
    			FilePath: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*FileName*/ ctx[0] === undefined && !("FileName" in props)) {
    			console.warn("<Modal> was created without expected prop 'FileName'");
    		}

    		if (/*Type*/ ctx[3] === undefined && !("Type" in props)) {
    			console.warn("<Modal> was created without expected prop 'Type'");
    		}

    		if (/*Component*/ ctx[1] === undefined && !("Component" in props)) {
    			console.warn("<Modal> was created without expected prop 'Component'");
    		}

    		if (/*FilePath*/ ctx[2] === undefined && !("FilePath" in props)) {
    			console.warn("<Modal> was created without expected prop 'FilePath'");
    		}
    	}

    	get FileName() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set FileName(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get Type() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Type(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get Component() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Component(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get FilePath() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set FilePath(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function Post(url,data) {
    	return fetch(url,{
    		method: "POST",
    		headers: {
    			"Content-Type": "application/json",
    			"x-access-token": "123"
    		},
    		body: JSON.stringify(data)
    	}).then(res => res.json());
    }

    const Title = "个人网盘";
    const Host = "http://45.249.245.98:8080";
    const Path_Index = "/api/assets";
    const Path_Info = "/api/info";
    const Path_Get = "/api/get";

    /* src/lib/Img.svelte generated by Svelte v3.17.1 */
    const file$1 = "src/lib/Img.svelte";

    function create_fragment$1(ctx) {
    	let c_img;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			c_img = element("c_img");
    			img = element("img");
    			if (img.src !== (img_src_value = /*src*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$1, 25, 1, 356);
    			add_location(c_img, file$1, 24, 0, 347);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, c_img, anchor);
    			append_dev(c_img, img);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(c_img);
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

    function instance$1($$self, $$props, $$invalidate) {
    	let { FilePath } = $$props;
    	let src = "";

    	beforeUpdate(async function () {
    		if (!FilePath) return;
    		let src = "";
    		let res = await Post(Host + Path_Get, { Src: FilePath });
    		src = res.Data;
    	});

    	const writable_props = ["FilePath"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Img> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("FilePath" in $$props) $$invalidate(1, FilePath = $$props.FilePath);
    	};

    	$$self.$capture_state = () => {
    		return { FilePath, src };
    	};

    	$$self.$inject_state = $$props => {
    		if ("FilePath" in $$props) $$invalidate(1, FilePath = $$props.FilePath);
    		if ("src" in $$props) $$invalidate(0, src = $$props.src);
    	};

    	return [src, FilePath];
    }

    class Img extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { FilePath: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Img",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*FilePath*/ ctx[1] === undefined && !("FilePath" in props)) {
    			console.warn("<Img> was created without expected prop 'FilePath'");
    		}
    	}

    	get FilePath() {
    		throw new Error("<Img>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set FilePath(value) {
    		throw new Error("<Img>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.17.1 */
    const file$2 = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (99:6) {#each _data as item}
    function create_each_block(ctx) {
    	let tr;
    	let td0;
    	let input;
    	let t0;
    	let td1;
    	let img;
    	let img_src_value;
    	let t1;
    	let td2;
    	let a;
    	let t2_value = /*item*/ ctx[8].FileName + "";
    	let t2;
    	let a_data_filename_value;
    	let a_data_isdir_value;
    	let a_data_value;
    	let t3;
    	let td3;
    	let div;
    	let button0;
    	let t5;
    	let button1;
    	let t7;
    	let button2;
    	let t9;
    	let td4;
    	let t10_value = /*item*/ ctx[8].LastModify + "";
    	let t10;
    	let t11;
    	let dispose;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			input = element("input");
    			t0 = space();
    			td1 = element("td");
    			img = element("img");
    			t1 = space();
    			td2 = element("td");
    			a = element("a");
    			t2 = text(t2_value);
    			t3 = space();
    			td3 = element("td");
    			div = element("div");
    			button0 = element("button");
    			button0.textContent = "重命名";
    			t5 = space();
    			button1 = element("button");
    			button1.textContent = "删除";
    			t7 = space();
    			button2 = element("button");
    			button2.textContent = "移动到";
    			t9 = space();
    			td4 = element("td");
    			t10 = text(t10_value);
    			t11 = space();
    			attr_dev(input, "class", "checkbox");
    			attr_dev(input, "type", "checkbox");
    			add_location(input, file$2, 100, 12, 2000);
    			add_location(td0, file$2, 100, 8, 1996);
    			if (img.src !== (img_src_value = "")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$2, 101, 13, 2059);
    			add_location(td1, file$2, 101, 8, 2054);
    			attr_dev(a, "href", "javascript:void(0)");
    			attr_dev(a, "data-filename", a_data_filename_value = /*item*/ ctx[8].FileName);
    			attr_dev(a, "data-isdir", a_data_isdir_value = /*item*/ ctx[8].IsDir);
    			attr_dev(a, "data", a_data_value = JSON.stringify(/*item*/ ctx[8]));
    			add_location(a, file$2, 103, 9, 2110);
    			add_location(td2, file$2, 102, 11, 2096);
    			attr_dev(button0, "class", "button is-primary");
    			add_location(button0, file$2, 107, 10, 2327);
    			attr_dev(button1, "class", "button is-primary");
    			add_location(button1, file$2, 108, 10, 2384);
    			attr_dev(button2, "class", "button is-primary");
    			add_location(button2, file$2, 109, 10, 2440);
    			attr_dev(div, "class", "control");
    			add_location(div, file$2, 106, 9, 2295);
    			add_location(td3, file$2, 105, 8, 2281);
    			add_location(td4, file$2, 112, 8, 2525);
    			add_location(tr, file$2, 99, 7, 1983);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, input);
    			append_dev(tr, t0);
    			append_dev(tr, td1);
    			append_dev(td1, img);
    			append_dev(tr, t1);
    			append_dev(tr, td2);
    			append_dev(td2, a);
    			append_dev(a, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td3);
    			append_dev(td3, div);
    			append_dev(div, button0);
    			append_dev(div, t5);
    			append_dev(div, button1);
    			append_dev(div, t7);
    			append_dev(div, button2);
    			append_dev(tr, t9);
    			append_dev(tr, td4);
    			append_dev(td4, t10);
    			append_dev(tr, t11);
    			dispose = listen_dev(a, "click", /*Jump*/ ctx[5], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*_data*/ 8 && t2_value !== (t2_value = /*item*/ ctx[8].FileName + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*_data*/ 8 && a_data_filename_value !== (a_data_filename_value = /*item*/ ctx[8].FileName)) {
    				attr_dev(a, "data-filename", a_data_filename_value);
    			}

    			if (dirty & /*_data*/ 8 && a_data_isdir_value !== (a_data_isdir_value = /*item*/ ctx[8].IsDir)) {
    				attr_dev(a, "data-isdir", a_data_isdir_value);
    			}

    			if (dirty & /*_data*/ 8 && a_data_value !== (a_data_value = JSON.stringify(/*item*/ ctx[8]))) {
    				attr_dev(a, "data", a_data_value);
    			}

    			if (dirty & /*_data*/ 8 && t10_value !== (t10_value = /*item*/ ctx[8].LastModify + "")) set_data_dev(t10, t10_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(99:6) {#each _data as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let main;
    	let div3;
    	let header;
    	let p0;
    	let t0;
    	let t1;
    	let div2;
    	let div0;
    	let p1;
    	let t2;
    	let t3;
    	let t4;
    	let p2;
    	let t5;
    	let t6;
    	let t7;
    	let t8;
    	let p3;
    	let button;
    	let t10;
    	let div1;
    	let table;
    	let thead;
    	let th0;
    	let t11;
    	let th1;
    	let t13;
    	let th2;
    	let t15;
    	let th3;
    	let t17;
    	let th4;
    	let t19;
    	let tbody;
    	let t20;
    	let current;
    	let dispose;
    	let each_value = /*_data*/ ctx[3];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const modal_spread_levels = [/*Select*/ ctx[4]];
    	let modal_props = {};

    	for (let i = 0; i < modal_spread_levels.length; i += 1) {
    		modal_props = assign(modal_props, modal_spread_levels[i]);
    	}

    	const modal = new Modal({ props: modal_props, $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			div3 = element("div");
    			header = element("header");
    			p0 = element("p");
    			t0 = text(/*Title*/ ctx[0]);
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			p1 = element("p");
    			t2 = text("根目录: ");
    			t3 = text(/*_root*/ ctx[1]);
    			t4 = space();
    			p2 = element("p");
    			t5 = text("共 ");
    			t6 = text(/*_total*/ ctx[2]);
    			t7 = text(" 个文件");
    			t8 = space();
    			p3 = element("p");
    			button = element("button");
    			button.textContent = "全选/反选";
    			t10 = space();
    			div1 = element("div");
    			table = element("table");
    			thead = element("thead");
    			th0 = element("th");
    			t11 = space();
    			th1 = element("th");
    			th1.textContent = "预览";
    			t13 = space();
    			th2 = element("th");
    			th2.textContent = "文件名";
    			t15 = space();
    			th3 = element("th");
    			th3.textContent = "操作";
    			t17 = space();
    			th4 = element("th");
    			th4.textContent = "修改日期";
    			t19 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t20 = space();
    			create_component(modal.$$.fragment);
    			attr_dev(p0, "class", "title");
    			add_location(p0, file$2, 74, 3, 1488);
    			attr_dev(header, "class", "card-header svelte-kadreq");
    			add_location(header, file$2, 73, 2, 1456);
    			add_location(p1, file$2, 78, 4, 1585);
    			add_location(p2, file$2, 81, 4, 1620);
    			attr_dev(button, "class", "button is-success");
    			add_location(button, file$2, 85, 5, 1666);
    			add_location(p3, file$2, 84, 4, 1657);
    			attr_dev(div0, "class", "field");
    			add_location(div0, file$2, 77, 3, 1561);
    			add_location(th0, file$2, 91, 6, 1836);
    			add_location(th1, file$2, 92, 6, 1852);
    			add_location(th2, file$2, 93, 6, 1870);
    			add_location(th3, file$2, 94, 6, 1889);
    			add_location(th4, file$2, 95, 6, 1907);
    			add_location(thead, file$2, 90, 5, 1822);
    			add_location(tbody, file$2, 97, 5, 1940);
    			attr_dev(table, "class", "table is-fullwidth");
    			add_location(table, file$2, 89, 4, 1782);
    			attr_dev(div1, "class", "field");
    			add_location(div1, file$2, 88, 3, 1758);
    			attr_dev(div2, "class", "card-content");
    			add_location(div2, file$2, 76, 2, 1531);
    			attr_dev(div3, "class", "card");
    			add_location(div3, file$2, 72, 1, 1435);
    			add_location(main, file$2, 71, 0, 1427);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div3);
    			append_dev(div3, header);
    			append_dev(header, p0);
    			append_dev(p0, t0);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, p1);
    			append_dev(p1, t2);
    			append_dev(p1, t3);
    			append_dev(div0, t4);
    			append_dev(div0, p2);
    			append_dev(p2, t5);
    			append_dev(p2, t6);
    			append_dev(p2, t7);
    			append_dev(div0, t8);
    			append_dev(div0, p3);
    			append_dev(p3, button);
    			append_dev(div2, t10);
    			append_dev(div2, div1);
    			append_dev(div1, table);
    			append_dev(table, thead);
    			append_dev(thead, th0);
    			append_dev(thead, t11);
    			append_dev(thead, th1);
    			append_dev(thead, t13);
    			append_dev(thead, th2);
    			append_dev(thead, t15);
    			append_dev(thead, th3);
    			append_dev(thead, t17);
    			append_dev(thead, th4);
    			append_dev(table, t19);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			append_dev(main, t20);
    			mount_component(modal, main, null);
    			current = true;
    			dispose = listen_dev(button, "click", SelectAll, false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*Title*/ 1) set_data_dev(t0, /*Title*/ ctx[0]);
    			if (!current || dirty & /*_root*/ 2) set_data_dev(t3, /*_root*/ ctx[1]);
    			if (!current || dirty & /*_total*/ 4) set_data_dev(t6, /*_total*/ ctx[2]);

    			if (dirty & /*_data, JSON, Jump*/ 40) {
    				each_value = /*_data*/ ctx[3];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			const modal_changes = (dirty & /*Select*/ 16)
    			? get_spread_update(modal_spread_levels, [get_spread_object(/*Select*/ ctx[4])])
    			: {};

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    			destroy_component(modal);
    			dispose();
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

    function SelectAll() {
    	let boxs = document.querySelectorAll(".checkbox");

    	for (let box of boxs) {
    		box.checked = !box.checked;
    	}
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { Title } = $$props;
    	let _root = "";
    	let _total = 0;
    	let _data = [];
    	let C_Default = Img;

    	let Select = {
    		FileName: "",
    		Type: "",
    		Component: C_Default,
    		FilePath: ""
    	};

    	onMount(async function () {
    		await GetIndex();
    	});

    	async function GetIndex(subPath = "") {
    		let res = await Post(Host + Path_Info);
    		$$invalidate(1, _root = res.Data.Root);
    		$$invalidate(2, _total = res.Data.Total);
    		res = await Post(Host + Path_Index, { Path: _root + subPath });
    		$$invalidate(3, _data = res.Data);
    	}

    	GetIndex();

    	function Jump() {
    		const $this = this;
    		let isDir = $this.getAttribute("data-isDir");
    		let fileName = $this.getAttribute("data-fileName");

    		if (isDir && isDir !== "false") {
    			GetIndex("/" + fileName);
    		} else {
    			$$invalidate(4, Select = JSON.parse($this.getAttribute("data")));
    			$$invalidate(4, Select.Type = fileName.split(".").reverse()[0], Select);
    			$$invalidate(4, Select.FilePath = Select.Path + "/" + fileName, Select);

    			if (["jpg", "png", "jpge"].indexOf(Select.Type)) {
    				$$invalidate(4, Select.Component = Img, Select);
    			}

    			document.querySelector("#modal").className += " is-active";
    		}
    	}

    	const writable_props = ["Title"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("Title" in $$props) $$invalidate(0, Title = $$props.Title);
    	};

    	$$self.$capture_state = () => {
    		return {
    			Title,
    			_root,
    			_total,
    			_data,
    			C_Default,
    			Select
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("Title" in $$props) $$invalidate(0, Title = $$props.Title);
    		if ("_root" in $$props) $$invalidate(1, _root = $$props._root);
    		if ("_total" in $$props) $$invalidate(2, _total = $$props._total);
    		if ("_data" in $$props) $$invalidate(3, _data = $$props._data);
    		if ("C_Default" in $$props) C_Default = $$props.C_Default;
    		if ("Select" in $$props) $$invalidate(4, Select = $$props.Select);
    	};

    	return [Title, _root, _total, _data, Select, Jump];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { Title: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*Title*/ ctx[0] === undefined && !("Title" in props)) {
    			console.warn("<App> was created without expected prop 'Title'");
    		}
    	}

    	get Title() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Title(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		Title
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
