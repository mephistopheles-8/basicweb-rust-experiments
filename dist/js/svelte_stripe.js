/**
  * svelte_stripe
  * (C) 2020 M. Bellaire
  * All rights Reserved
 */

var svelte_stripe = (function () {
  'use strict';

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob:
      'FileReader' in self &&
      'Blob' in self &&
      (function() {
        try {
          new Blob();
          return true
        } catch (e) {
          return false
        }
      })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  };

  function isDataView(obj) {
    return obj && DataView.prototype.isPrototypeOf(obj)
  }

  if (support.arrayBuffer) {
    var viewClasses = [
      '[object Int8Array]',
      '[object Uint8Array]',
      '[object Uint8ClampedArray]',
      '[object Int16Array]',
      '[object Uint16Array]',
      '[object Int32Array]',
      '[object Uint32Array]',
      '[object Float32Array]',
      '[object Float64Array]'
    ];

    var isArrayBufferView =
      ArrayBuffer.isView ||
      function(obj) {
        return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
      };
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name);
    }
    if (/[^a-z0-9\-#$%&'*+.^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value);
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift();
        return {done: value === undefined, value: value}
      }
    };

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      };
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {};

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value);
      }, this);
    } else if (Array.isArray(headers)) {
      headers.forEach(function(header) {
        this.append(header[0], header[1]);
      }, this);
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name]);
      }, this);
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name);
    value = normalizeValue(value);
    var oldValue = this.map[name];
    this.map[name] = oldValue ? oldValue + ', ' + value : value;
  };

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)];
  };

  Headers.prototype.get = function(name) {
    name = normalizeName(name);
    return this.has(name) ? this.map[name] : null
  };

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  };

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = normalizeValue(value);
  };

  Headers.prototype.forEach = function(callback, thisArg) {
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this);
      }
    }
  };

  Headers.prototype.keys = function() {
    var items = [];
    this.forEach(function(value, name) {
      items.push(name);
    });
    return iteratorFor(items)
  };

  Headers.prototype.values = function() {
    var items = [];
    this.forEach(function(value) {
      items.push(value);
    });
    return iteratorFor(items)
  };

  Headers.prototype.entries = function() {
    var items = [];
    this.forEach(function(value, name) {
      items.push([name, value]);
    });
    return iteratorFor(items)
  };

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true;
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result);
      };
      reader.onerror = function() {
        reject(reader.error);
      };
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsArrayBuffer(blob);
    return promise
  }

  function readBlobAsText(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsText(blob);
    return promise
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf);
    var chars = new Array(view.length);

    for (var i = 0; i < view.length; i++) {
      chars[i] = String.fromCharCode(view[i]);
    }
    return chars.join('')
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0)
    } else {
      var view = new Uint8Array(buf.byteLength);
      view.set(new Uint8Array(buf));
      return view.buffer
    }
  }

  function Body() {
    this.bodyUsed = false;

    this._initBody = function(body) {
      this._bodyInit = body;
      if (!body) {
        this._bodyText = '';
      } else if (typeof body === 'string') {
        this._bodyText = body;
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body;
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body;
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString();
      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer);
        // IE 10-11 can't handle a DataView body.
        this._bodyInit = new Blob([this._bodyArrayBuffer]);
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body);
      } else {
        this._bodyText = body = Object.prototype.toString.call(body);
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8');
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type);
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
        }
      }
    };

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this);
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      };

      this.arrayBuffer = function() {
        if (this._bodyArrayBuffer) {
          return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
        } else {
          return this.blob().then(readBlobAsArrayBuffer)
        }
      };
    }

    this.text = function() {
      var rejected = consumed(this);
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text')
      } else {
        return Promise.resolve(this._bodyText)
      }
    };

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      };
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    };

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

  function normalizeMethod(method) {
    var upcased = method.toUpperCase();
    return methods.indexOf(upcased) > -1 ? upcased : method
  }

  function Request(input, options) {
    options = options || {};
    var body = options.body;

    if (input instanceof Request) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url;
      this.credentials = input.credentials;
      if (!options.headers) {
        this.headers = new Headers(input.headers);
      }
      this.method = input.method;
      this.mode = input.mode;
      this.signal = input.signal;
      if (!body && input._bodyInit != null) {
        body = input._bodyInit;
        input.bodyUsed = true;
      }
    } else {
      this.url = String(input);
    }

    this.credentials = options.credentials || this.credentials || 'same-origin';
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers);
    }
    this.method = normalizeMethod(options.method || this.method || 'GET');
    this.mode = options.mode || this.mode || null;
    this.signal = options.signal || this.signal;
    this.referrer = null;

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body);
  }

  Request.prototype.clone = function() {
    return new Request(this, {body: this._bodyInit})
  };

  function decode(body) {
    var form = new FormData();
    body
      .trim()
      .split('&')
      .forEach(function(bytes) {
        if (bytes) {
          var split = bytes.split('=');
          var name = split.shift().replace(/\+/g, ' ');
          var value = split.join('=').replace(/\+/g, ' ');
          form.append(decodeURIComponent(name), decodeURIComponent(value));
        }
      });
    return form
  }

  function parseHeaders(rawHeaders) {
    var headers = new Headers();
    // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
    // https://tools.ietf.org/html/rfc7230#section-3.2
    var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
    preProcessedHeaders.split(/\r?\n/).forEach(function(line) {
      var parts = line.split(':');
      var key = parts.shift().trim();
      if (key) {
        var value = parts.join(':').trim();
        headers.append(key, value);
      }
    });
    return headers
  }

  Body.call(Request.prototype);

  function Response(bodyInit, options) {
    if (!options) {
      options = {};
    }

    this.type = 'default';
    this.status = options.status === undefined ? 200 : options.status;
    this.ok = this.status >= 200 && this.status < 300;
    this.statusText = 'statusText' in options ? options.statusText : 'OK';
    this.headers = new Headers(options.headers);
    this.url = options.url || '';
    this._initBody(bodyInit);
  }

  Body.call(Response.prototype);

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  };

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''});
    response.type = 'error';
    return response
  };

  var redirectStatuses = [301, 302, 303, 307, 308];

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  };

  var DOMException = self.DOMException;
  try {
    new DOMException();
  } catch (err) {
    DOMException = function(message, name) {
      this.message = message;
      this.name = name;
      var error = Error(message);
      this.stack = error.stack;
    };
    DOMException.prototype = Object.create(Error.prototype);
    DOMException.prototype.constructor = DOMException;
  }

  function fetch(input, init) {
    return new Promise(function(resolve, reject) {
      var request = new Request(input, init);

      if (request.signal && request.signal.aborted) {
        return reject(new DOMException('Aborted', 'AbortError'))
      }

      var xhr = new XMLHttpRequest();

      function abortXhr() {
        xhr.abort();
      }

      xhr.onload = function() {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        };
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        resolve(new Response(body, options));
      };

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'));
      };

      xhr.ontimeout = function() {
        reject(new TypeError('Network request failed'));
      };

      xhr.onabort = function() {
        reject(new DOMException('Aborted', 'AbortError'));
      };

      xhr.open(request.method, request.url, true);

      if (request.credentials === 'include') {
        xhr.withCredentials = true;
      } else if (request.credentials === 'omit') {
        xhr.withCredentials = false;
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob';
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value);
      });

      if (request.signal) {
        request.signal.addEventListener('abort', abortXhr);

        xhr.onreadystatechange = function() {
          // DONE (success or failure)
          if (xhr.readyState === 4) {
            request.signal.removeEventListener('abort', abortXhr);
          }
        };
      }

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
    })
  }

  fetch.polyfill = true;

  if (!self.fetch) {
    self.fetch = fetch;
    self.Headers = Headers;
    self.Request = Request;
    self.Response = Response;
  }

  /**
   * @this {Promise}
   */
  function finallyConstructor(callback) {
    var constructor = this.constructor;
    return this.then(
      function(value) {
        // @ts-ignore
        return constructor.resolve(callback()).then(function() {
          return value;
        });
      },
      function(reason) {
        // @ts-ignore
        return constructor.resolve(callback()).then(function() {
          // @ts-ignore
          return constructor.reject(reason);
        });
      }
    );
  }

  // Store setTimeout reference so promise-polyfill will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var setTimeoutFunc = setTimeout;

  function isArray(x) {
    return Boolean(x && typeof x.length !== 'undefined');
  }

  function noop() {}

  // Polyfill for Function.prototype.bind
  function bind(fn, thisArg) {
    return function() {
      fn.apply(thisArg, arguments);
    };
  }

  /**
   * @constructor
   * @param {Function} fn
   */
  function Promise$1(fn) {
    if (!(this instanceof Promise$1))
      { throw new TypeError('Promises must be constructed via new'); }
    if (typeof fn !== 'function') { throw new TypeError('not a function'); }
    /** @type {!number} */
    this._state = 0;
    /** @type {!boolean} */
    this._handled = false;
    /** @type {Promise|undefined} */
    this._value = undefined;
    /** @type {!Array<!Function>} */
    this._deferreds = [];

    doResolve(fn, this);
  }

  function handle(self, deferred) {
    while (self._state === 3) {
      self = self._value;
    }
    if (self._state === 0) {
      self._deferreds.push(deferred);
      return;
    }
    self._handled = true;
    Promise$1._immediateFn(function() {
      var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
      if (cb === null) {
        (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
        return;
      }
      var ret;
      try {
        ret = cb(self._value);
      } catch (e) {
        reject(deferred.promise, e);
        return;
      }
      resolve(deferred.promise, ret);
    });
  }

  function resolve(self, newValue) {
    try {
      // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
      if (newValue === self)
        { throw new TypeError('A promise cannot be resolved with itself.'); }
      if (
        newValue &&
        (typeof newValue === 'object' || typeof newValue === 'function')
      ) {
        var then = newValue.then;
        if (newValue instanceof Promise$1) {
          self._state = 3;
          self._value = newValue;
          finale(self);
          return;
        } else if (typeof then === 'function') {
          doResolve(bind(then, newValue), self);
          return;
        }
      }
      self._state = 1;
      self._value = newValue;
      finale(self);
    } catch (e) {
      reject(self, e);
    }
  }

  function reject(self, newValue) {
    self._state = 2;
    self._value = newValue;
    finale(self);
  }

  function finale(self) {
    if (self._state === 2 && self._deferreds.length === 0) {
      Promise$1._immediateFn(function() {
        if (!self._handled) {
          Promise$1._unhandledRejectionFn(self._value);
        }
      });
    }

    for (var i = 0, len = self._deferreds.length; i < len; i++) {
      handle(self, self._deferreds[i]);
    }
    self._deferreds = null;
  }

  /**
   * @constructor
   */
  function Handler(onFulfilled, onRejected, promise) {
    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
    this.promise = promise;
  }

  /**
   * Take a potentially misbehaving resolver function and make sure
   * onFulfilled and onRejected are only called once.
   *
   * Makes no guarantees about asynchrony.
   */
  function doResolve(fn, self) {
    var done = false;
    try {
      fn(
        function(value) {
          if (done) { return; }
          done = true;
          resolve(self, value);
        },
        function(reason) {
          if (done) { return; }
          done = true;
          reject(self, reason);
        }
      );
    } catch (ex) {
      if (done) { return; }
      done = true;
      reject(self, ex);
    }
  }

  Promise$1.prototype['catch'] = function(onRejected) {
    return this.then(null, onRejected);
  };

  Promise$1.prototype.then = function(onFulfilled, onRejected) {
    // @ts-ignore
    var prom = new this.constructor(noop);

    handle(this, new Handler(onFulfilled, onRejected, prom));
    return prom;
  };

  Promise$1.prototype['finally'] = finallyConstructor;

  Promise$1.all = function(arr) {
    return new Promise$1(function(resolve, reject) {
      if (!isArray(arr)) {
        return reject(new TypeError('Promise.all accepts an array'));
      }

      var args = Array.prototype.slice.call(arr);
      if (args.length === 0) { return resolve([]); }
      var remaining = args.length;

      function res(i, val) {
        try {
          if (val && (typeof val === 'object' || typeof val === 'function')) {
            var then = val.then;
            if (typeof then === 'function') {
              then.call(
                val,
                function(val) {
                  res(i, val);
                },
                reject
              );
              return;
            }
          }
          args[i] = val;
          if (--remaining === 0) {
            resolve(args);
          }
        } catch (ex) {
          reject(ex);
        }
      }

      for (var i = 0; i < args.length; i++) {
        res(i, args[i]);
      }
    });
  };

  Promise$1.resolve = function(value) {
    if (value && typeof value === 'object' && value.constructor === Promise$1) {
      return value;
    }

    return new Promise$1(function(resolve) {
      resolve(value);
    });
  };

  Promise$1.reject = function(value) {
    return new Promise$1(function(resolve, reject) {
      reject(value);
    });
  };

  Promise$1.race = function(arr) {
    return new Promise$1(function(resolve, reject) {
      if (!isArray(arr)) {
        return reject(new TypeError('Promise.race accepts an array'));
      }

      for (var i = 0, len = arr.length; i < len; i++) {
        Promise$1.resolve(arr[i]).then(resolve, reject);
      }
    });
  };

  // Use polyfill for setImmediate for performance gains
  Promise$1._immediateFn =
    // @ts-ignore
    (typeof setImmediate === 'function' &&
      function(fn) {
        // @ts-ignore
        setImmediate(fn);
      }) ||
    function(fn) {
      setTimeoutFunc(fn, 0);
    };

  Promise$1._unhandledRejectionFn = function _unhandledRejectionFn(err) {
    if (typeof console !== 'undefined' && console) {
      console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
    }
  };

  function noop$1() { }
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
      return function () { return node.removeEventListener(event, handler, options); };
  }
  function attr(node, attribute, value) {
      if (value == null)
          { node.removeAttribute(attribute); }
      else if (node.getAttribute(attribute) !== value)
          { node.setAttribute(attribute, value); }
  }
  function children(element) {
      return Array.from(element.childNodes);
  }
  function set_data(text, data) {
      data = '' + data;
      if (text.data !== data)
          { text.data = data; }
  }
  function custom_event(type, detail) {
      var e = document.createEvent('CustomEvent');
      e.initCustomEvent(type, false, false, detail);
      return e;
  }

  var current_component;
  function set_current_component(component) {
      current_component = component;
  }
  function get_current_component() {
      if (!current_component)
          { throw new Error("Function called outside component initialization"); }
      return current_component;
  }
  function onMount(fn) {
      get_current_component().$$.on_mount.push(fn);
  }
  function createEventDispatcher() {
      var component = get_current_component();
      return function (type, detail) {
          var callbacks = component.$$.callbacks[type];
          if (callbacks) {
              // TODO are there situations where events could be dispatched
              // in a server (non-DOM) environment?
              var event = custom_event(type, detail);
              callbacks.slice().forEach(function (fn) {
                  fn.call(component, event);
              });
          }
      };
  }
  // TODO figure out if we still want to support
  // shorthand events, or if we want to implement
  // a real bubbling mechanism
  function bubble(component, event) {
      var callbacks = component.$$.callbacks[event.type];
      if (callbacks) {
          callbacks.slice().forEach(function (fn) { return fn(event); });
      }
  }

  var dirty_components = [];
  var binding_callbacks = [];
  var render_callbacks = [];
  var flush_callbacks = [];
  var resolved_promise = Promise.resolve();
  var update_scheduled = false;
  function schedule_update() {
      if (!update_scheduled) {
          update_scheduled = true;
          resolved_promise.then(flush);
      }
  }
  function add_render_callback(fn) {
      render_callbacks.push(fn);
  }
  function add_flush_callback(fn) {
      flush_callbacks.push(fn);
  }
  var flushing = false;
  var seen_callbacks = new Set();
  function flush() {
      if (flushing)
          { return; }
      flushing = true;
      do {
          // first, call beforeUpdate functions
          // and update components
          for (var i = 0; i < dirty_components.length; i += 1) {
              var component = dirty_components[i];
              set_current_component(component);
              update(component.$$);
          }
          dirty_components.length = 0;
          while (binding_callbacks.length)
              { binding_callbacks.pop()(); }
          // then, once components are updated, call
          // afterUpdate functions. This may cause
          // subsequent updates...
          for (var i$1 = 0; i$1 < render_callbacks.length; i$1 += 1) {
              var callback = render_callbacks[i$1];
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
          var dirty = $$.dirty;
          $$.dirty = [-1];
          $$.fragment && $$.fragment.p($$.ctx, dirty);
          $$.after_update.forEach(add_render_callback);
      }
  }
  var outroing = new Set();
  var outros;
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
              { return; }
          outroing.add(block);
          outros.c.push(function () {
              outroing.delete(block);
              if (callback) {
                  if (detach)
                      { block.d(1); }
                  callback();
              }
          });
          block.o(local);
      }
  }

  function bind$1(component, name, callback) {
      var index = component.$$.props[name];
      if (index !== undefined) {
          component.$$.bound[index] = callback;
          callback(component.$$.ctx[index]);
      }
  }
  function create_component(block) {
      block && block.c();
  }
  function mount_component(component, target, anchor) {
      var ref = component.$$;
      var fragment = ref.fragment;
      var on_mount = ref.on_mount;
      var on_destroy = ref.on_destroy;
      var after_update = ref.after_update;
      fragment && fragment.m(target, anchor);
      // onMount happens before the initial afterUpdate
      add_render_callback(function () {
          var new_on_destroy = on_mount.map(run).filter(is_function);
          if (on_destroy) {
              on_destroy.push.apply(on_destroy, new_on_destroy);
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
      var $$ = component.$$;
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
  function init(component, options, instance, create_fragment, not_equal, props, dirty) {
      if ( dirty === void 0 ) dirty = [-1];

      var parent_component = current_component;
      set_current_component(component);
      var prop_values = options.props || {};
      var $$ = component.$$ = {
          fragment: null,
          ctx: null,
          // state
          props: props,
          update: noop$1,
          not_equal: not_equal,
          bound: blank_object(),
          // lifecycle
          on_mount: [],
          on_destroy: [],
          before_update: [],
          after_update: [],
          context: new Map(parent_component ? parent_component.$$.context : []),
          // everything else
          callbacks: blank_object(),
          dirty: dirty
      };
      var ready = false;
      $$.ctx = instance
          ? instance(component, prop_values, function (i, ret) {
              var rest = [], len = arguments.length - 2;
              while ( len-- > 0 ) rest[ len ] = arguments[ len + 2 ];

              var value = rest.length ? rest[0] : ret;
              if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                  if ($$.bound[i])
                      { $$.bound[i](value); }
                  if (ready)
                      { make_dirty(component, i); }
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
              var nodes = children(options.target);
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              $$.fragment && $$.fragment.l(nodes);
              nodes.forEach(detach);
          }
          else {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              $$.fragment && $$.fragment.c();
          }
          if (options.intro)
              { transition_in(component.$$.fragment); }
          mount_component(component, options.target, options.anchor);
          flush();
      }
      set_current_component(parent_component);
  }
  var SvelteComponent = function SvelteComponent () {};

  SvelteComponent.prototype.$destroy = function $destroy () {
      destroy_component(this, 1);
      this.$destroy = noop$1;
  };
  SvelteComponent.prototype.$on = function $on (type, callback) {
      var callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
      callbacks.push(callback);
      return function () {
          var index = callbacks.indexOf(callback);
          if (index !== -1)
              { callbacks.splice(index, 1); }
      };
  };
  SvelteComponent.prototype.$set = function $set () {
      // overridden by instance, if it has props
  };

  /* src/Stripe.html generated by Svelte v3.20.1 */

  function create_fragment(ctx) {
  	var script;
  	var script_src_value;
  	var dispose;

  	return {
  		c: function c() {
  			script = element("script");
  			if (script.src !== (script_src_value = "https://js.stripe.com/v3/")) { attr(script, "src", script_src_value); }
  		},
  		m: function m(target, anchor, remount) {
  			append(document.head, script);
  			if (remount) { dispose(); }
  			dispose = listen(script, "load", /*stripeLoaded*/ ctx[0]);
  		},
  		p: noop$1,
  		i: noop$1,
  		o: noop$1,
  		d: function d(detaching) {
  			detach(script);
  			dispose();
  		}
  	};
  }

  function instance($$self, $$props, $$invalidate) {
  	var clientKey = $$props.clientKey;
  	var stripeReady = false;
  	var mounted = false;
  	var stripe = $$props.stripe;
  	var elements = $$props.elements;

  	onMount(function () {
  		mounted = true;

  		if (stripeReady) {
  			stripeInit();
  		}
  	});

  	function stripeLoaded() {
  		stripeReady = true;

  		if (mounted) {
  			stripeInit();
  		}
  	}

  	function stripeInit() {
  		$$invalidate(1, stripe = Stripe(clientKey));
  		$$invalidate(2, elements = stripe.elements());
  	}

  	$$self.$set = function ($$props) {
  		if ("clientKey" in $$props) { $$invalidate(3, clientKey = $$props.clientKey); }
  		if ("stripe" in $$props) { $$invalidate(1, stripe = $$props.stripe); }
  		if ("elements" in $$props) { $$invalidate(2, elements = $$props.elements); }
  	};

  	return [stripeLoaded, stripe, elements, clientKey];
  }

  var Stripe_1 = /*@__PURE__*/(function (SvelteComponent) {
  	function Stripe_1(options) {
  		SvelteComponent.call(this);
  		init(this, options, instance, create_fragment, safe_not_equal, { clientKey: 3, stripe: 1, elements: 2 });
  	}

  	if ( SvelteComponent ) Stripe_1.__proto__ = SvelteComponent;
  	Stripe_1.prototype = Object.create( SvelteComponent && SvelteComponent.prototype );
  	Stripe_1.prototype.constructor = Stripe_1;

  	return Stripe_1;
  }(SvelteComponent));

  /* src/elements/Generic.html generated by Svelte v3.20.1 */

  function create_else_block(ctx) {
  	var div;

  	return {
  		c: function c() {
  			div = element("div");
  		},
  		m: function m(target, anchor) {
  			insert(target, div, anchor);
  			/*div_binding_1*/ ctx[9](div);
  		},
  		p: noop$1,
  		d: function d(detaching) {
  			if (detaching) { detach(div); }
  			/*div_binding_1*/ ctx[9](null);
  		}
  	};
  }

  // (27:0) {#if showLabel}
  function create_if_block(ctx) {
  	var label_1;
  	var t0;
  	var t1;
  	var div;

  	return {
  		c: function c() {
  			label_1 = element("label");
  			t0 = text(/*label*/ ctx[2]);
  			t1 = space();
  			div = element("div");
  		},
  		m: function m(target, anchor) {
  			insert(target, label_1, anchor);
  			append(label_1, t0);
  			append(label_1, t1);
  			append(label_1, div);
  			/*div_binding*/ ctx[8](div);
  		},
  		p: function p(ctx, dirty) {
  			if (dirty & /*label*/ 4) { set_data(t0, /*label*/ ctx[2]); }
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(label_1); }
  			/*div_binding*/ ctx[8](null);
  		}
  	};
  }

  function create_fragment$1(ctx) {
  	var if_block_anchor;

  	function select_block_type(ctx, dirty) {
  		if (/*showLabel*/ ctx[1]) { return create_if_block; }
  		return create_else_block;
  	}

  	var current_block_type = select_block_type(ctx);
  	var if_block = current_block_type(ctx);

  	return {
  		c: function c() {
  			if_block.c();
  			if_block_anchor = empty();
  		},
  		m: function m(target, anchor) {
  			if_block.m(target, anchor);
  			insert(target, if_block_anchor, anchor);
  		},
  		p: function p(ctx, ref) {
  			var dirty = ref[0];

  			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
  				if_block.p(ctx, dirty);
  			} else {
  				if_block.d(1);
  				if_block = current_block_type(ctx);

  				if (if_block) {
  					if_block.c();
  					if_block.m(if_block_anchor.parentNode, if_block_anchor);
  				}
  			}
  		},
  		i: noop$1,
  		o: noop$1,
  		d: function d(detaching) {
  			if_block.d(detaching);
  			if (detaching) { detach(if_block_anchor); }
  		}
  	};
  }

  function instance$1($$self, $$props, $$invalidate) {
  	var elements = $$props.elements;
  	var dispatch = createEventDispatcher();
  	var kind = $$props.kind;
  	var showLabel = $$props.showLabel; if ( showLabel === void 0 ) showLabel = true;
  	var label = $$props.label;
  	var options = $$props.options;
  	var element = $$props.element;
  	var domNode = $$props.domNode;

  	onMount(function () {
  		if (!elements) { throw "Stripe Elements is not set."; }
  		$$invalidate(3, element = elements.create(kind, options));
  		element.on("change", function (e) { return dispatch("change", e); });
  		element.on("ready", function (e) { return dispatch("ready", e); });
  		element.on("focus", function (e) { return dispatch("focus", e); });
  		element.on("blur", function (e) { return dispatch("blur", e); });
  		element.on("escape", function (e) { return dispatch("escape", e); });
  		element.on("click", function (e) { return dispatch("click", e); });
  		element.mount(domNode);
  	});

  	function div_binding($$value) {
  		binding_callbacks[$$value ? "unshift" : "push"](function () {
  			$$invalidate(0, domNode = $$value);
  		});
  	}

  	function div_binding_1($$value) {
  		binding_callbacks[$$value ? "unshift" : "push"](function () {
  			$$invalidate(0, domNode = $$value);
  		});
  	}

  	$$self.$set = function ($$props) {
  		if ("elements" in $$props) { $$invalidate(4, elements = $$props.elements); }
  		if ("kind" in $$props) { $$invalidate(5, kind = $$props.kind); }
  		if ("showLabel" in $$props) { $$invalidate(1, showLabel = $$props.showLabel); }
  		if ("label" in $$props) { $$invalidate(2, label = $$props.label); }
  		if ("options" in $$props) { $$invalidate(6, options = $$props.options); }
  		if ("element" in $$props) { $$invalidate(3, element = $$props.element); }
  		if ("domNode" in $$props) { $$invalidate(0, domNode = $$props.domNode); }
  	};

  	return [
  		domNode,
  		showLabel,
  		label,
  		element,
  		elements,
  		kind,
  		options,
  		dispatch,
  		div_binding,
  		div_binding_1
  	];
  }

  var Generic = /*@__PURE__*/(function (SvelteComponent) {
  	function Generic(options) {
  		SvelteComponent.call(this);

  		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
  			elements: 4,
  			kind: 5,
  			showLabel: 1,
  			label: 2,
  			options: 6,
  			element: 3,
  			domNode: 0
  		});
  	}

  	if ( SvelteComponent ) Generic.__proto__ = SvelteComponent;
  	Generic.prototype = Object.create( SvelteComponent && SvelteComponent.prototype );
  	Generic.prototype.constructor = Generic;

  	return Generic;
  }(SvelteComponent));

  /* src/elements/Card.html generated by Svelte v3.20.1 */

  function create_fragment$2(ctx) {
  	var updating_element;
  	var updating_domNode;
  	var current;

  	function generic_element_binding(value) {
  		/*generic_element_binding*/ ctx[5].call(null, value);
  	}

  	function generic_domNode_binding(value) {
  		/*generic_domNode_binding*/ ctx[6].call(null, value);
  	}

  	var generic_props = {
  		elements: /*elements*/ ctx[0],
  		label: /*label*/ ctx[1],
  		kind: kind,
  		options: /*options*/ ctx[2]
  	};

  	if (/*element*/ ctx[3] !== void 0) {
  		generic_props.element = /*element*/ ctx[3];
  	}

  	if (/*domNode*/ ctx[4] !== void 0) {
  		generic_props.domNode = /*domNode*/ ctx[4];
  	}

  	var generic = new Generic({ props: generic_props });
  	binding_callbacks.push(function () { return bind$1(generic, "element", generic_element_binding); });
  	binding_callbacks.push(function () { return bind$1(generic, "domNode", generic_domNode_binding); });
  	generic.$on("change", /*change_handler*/ ctx[7]);
  	generic.$on("ready", /*ready_handler*/ ctx[8]);
  	generic.$on("focus", /*focus_handler*/ ctx[9]);
  	generic.$on("blur", /*blur_handler*/ ctx[10]);
  	generic.$on("escape", /*escape_handler*/ ctx[11]);
  	generic.$on("click", /*click_handler*/ ctx[12]);

  	return {
  		c: function c() {
  			create_component(generic.$$.fragment);
  		},
  		m: function m(target, anchor) {
  			mount_component(generic, target, anchor);
  			current = true;
  		},
  		p: function p(ctx, ref) {
  			var dirty = ref[0];

  			var generic_changes = {};
  			if (dirty & /*elements*/ 1) { generic_changes.elements = /*elements*/ ctx[0]; }
  			if (dirty & /*label*/ 2) { generic_changes.label = /*label*/ ctx[1]; }
  			if (dirty & /*options*/ 4) { generic_changes.options = /*options*/ ctx[2]; }

  			if (!updating_element && dirty & /*element*/ 8) {
  				updating_element = true;
  				generic_changes.element = /*element*/ ctx[3];
  				add_flush_callback(function () { return updating_element = false; });
  			}

  			if (!updating_domNode && dirty & /*domNode*/ 16) {
  				updating_domNode = true;
  				generic_changes.domNode = /*domNode*/ ctx[4];
  				add_flush_callback(function () { return updating_domNode = false; });
  			}

  			generic.$set(generic_changes);
  		},
  		i: function i(local) {
  			if (current) { return; }
  			transition_in(generic.$$.fragment, local);
  			current = true;
  		},
  		o: function o(local) {
  			transition_out(generic.$$.fragment, local);
  			current = false;
  		},
  		d: function d(detaching) {
  			destroy_component(generic, detaching);
  		}
  	};
  }

  var kind = "card";

  function instance$2($$self, $$props, $$invalidate) {
  	var elements = $$props.elements;
  	var label = $$props.label; if ( label === void 0 ) label = "Card";
  	var options = $$props.options;
  	var element;
  	var domNode;

  	function generic_element_binding(value) {
  		element = value;
  		$$invalidate(3, element);
  	}

  	function generic_domNode_binding(value) {
  		domNode = value;
  		$$invalidate(4, domNode);
  	}

  	function change_handler(event) {
  		bubble($$self, event);
  	}

  	function ready_handler(event) {
  		bubble($$self, event);
  	}

  	function focus_handler(event) {
  		bubble($$self, event);
  	}

  	function blur_handler(event) {
  		bubble($$self, event);
  	}

  	function escape_handler(event) {
  		bubble($$self, event);
  	}

  	function click_handler(event) {
  		bubble($$self, event);
  	}

  	$$self.$set = function ($$props) {
  		if ("elements" in $$props) { $$invalidate(0, elements = $$props.elements); }
  		if ("label" in $$props) { $$invalidate(1, label = $$props.label); }
  		if ("options" in $$props) { $$invalidate(2, options = $$props.options); }
  	};

  	return [
  		elements,
  		label,
  		options,
  		element,
  		domNode,
  		generic_element_binding,
  		generic_domNode_binding,
  		change_handler,
  		ready_handler,
  		focus_handler,
  		blur_handler,
  		escape_handler,
  		click_handler
  	];
  }

  var Card = /*@__PURE__*/(function (SvelteComponent) {
  	function Card(options) {
  		SvelteComponent.call(this);
  		init(this, options, instance$2, create_fragment$2, safe_not_equal, { elements: 0, label: 1, options: 2 });
  	}

  	if ( SvelteComponent ) Card.__proto__ = SvelteComponent;
  	Card.prototype = Object.create( SvelteComponent && SvelteComponent.prototype );
  	Card.prototype.constructor = Card;

  	return Card;
  }(SvelteComponent));

  /* src/CreditCardForm.html generated by Svelte v3.20.1 */

  function create_if_block$1(ctx) {
  	var form;
  	var current;
  	var card = new Card({ props: { elements: /*elements*/ ctx[1] } });

  	return {
  		c: function c() {
  			form = element("form");
  			create_component(card.$$.fragment);
  		},
  		m: function m(target, anchor) {
  			insert(target, form, anchor);
  			mount_component(card, form, null);
  			current = true;
  		},
  		p: function p(ctx, dirty) {
  			var card_changes = {};
  			if (dirty & /*elements*/ 2) { card_changes.elements = /*elements*/ ctx[1]; }
  			card.$set(card_changes);
  		},
  		i: function i(local) {
  			if (current) { return; }
  			transition_in(card.$$.fragment, local);
  			current = true;
  		},
  		o: function o(local) {
  			transition_out(card.$$.fragment, local);
  			current = false;
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(form); }
  			destroy_component(card);
  		}
  	};
  }

  function create_fragment$3(ctx) {
  	var updating_stripe;
  	var updating_elements;
  	var t;
  	var if_block_anchor;
  	var current;

  	function stripe_1_stripe_binding(value) {
  		/*stripe_1_stripe_binding*/ ctx[3].call(null, value);
  	}

  	function stripe_1_elements_binding(value) {
  		/*stripe_1_elements_binding*/ ctx[4].call(null, value);
  	}

  	var stripe_1_props = { clientKey: /*clientKey*/ ctx[0] };

  	if (/*stripe*/ ctx[2] !== void 0) {
  		stripe_1_props.stripe = /*stripe*/ ctx[2];
  	}

  	if (/*elements*/ ctx[1] !== void 0) {
  		stripe_1_props.elements = /*elements*/ ctx[1];
  	}

  	var stripe_1 = new Stripe_1({ props: stripe_1_props });
  	binding_callbacks.push(function () { return bind$1(stripe_1, "stripe", stripe_1_stripe_binding); });
  	binding_callbacks.push(function () { return bind$1(stripe_1, "elements", stripe_1_elements_binding); });
  	var if_block = /*elements*/ ctx[1] && create_if_block$1(ctx);

  	return {
  		c: function c() {
  			create_component(stripe_1.$$.fragment);
  			t = space();
  			if (if_block) { if_block.c(); }
  			if_block_anchor = empty();
  		},
  		m: function m(target, anchor) {
  			mount_component(stripe_1, target, anchor);
  			insert(target, t, anchor);
  			if (if_block) { if_block.m(target, anchor); }
  			insert(target, if_block_anchor, anchor);
  			current = true;
  		},
  		p: function p(ctx, ref) {
  			var dirty = ref[0];

  			var stripe_1_changes = {};
  			if (dirty & /*clientKey*/ 1) { stripe_1_changes.clientKey = /*clientKey*/ ctx[0]; }

  			if (!updating_stripe && dirty & /*stripe*/ 4) {
  				updating_stripe = true;
  				stripe_1_changes.stripe = /*stripe*/ ctx[2];
  				add_flush_callback(function () { return updating_stripe = false; });
  			}

  			if (!updating_elements && dirty & /*elements*/ 2) {
  				updating_elements = true;
  				stripe_1_changes.elements = /*elements*/ ctx[1];
  				add_flush_callback(function () { return updating_elements = false; });
  			}

  			stripe_1.$set(stripe_1_changes);

  			if (/*elements*/ ctx[1]) {
  				if (if_block) {
  					if_block.p(ctx, dirty);
  					transition_in(if_block, 1);
  				} else {
  					if_block = create_if_block$1(ctx);
  					if_block.c();
  					transition_in(if_block, 1);
  					if_block.m(if_block_anchor.parentNode, if_block_anchor);
  				}
  			} else if (if_block) {
  				group_outros();

  				transition_out(if_block, 1, 1, function () {
  					if_block = null;
  				});

  				check_outros();
  			}
  		},
  		i: function i(local) {
  			if (current) { return; }
  			transition_in(stripe_1.$$.fragment, local);
  			transition_in(if_block);
  			current = true;
  		},
  		o: function o(local) {
  			transition_out(stripe_1.$$.fragment, local);
  			transition_out(if_block);
  			current = false;
  		},
  		d: function d(detaching) {
  			destroy_component(stripe_1, detaching);
  			if (detaching) { detach(t); }
  			if (if_block) { if_block.d(detaching); }
  			if (detaching) { detach(if_block_anchor); }
  		}
  	};
  }

  function instance$3($$self, $$props, $$invalidate) {
  	var clientKey = $$props.clientKey;
  	var elements;
  	var stripe;

  	function stripe_1_stripe_binding(value) {
  		stripe = value;
  		$$invalidate(2, stripe);
  	}

  	function stripe_1_elements_binding(value) {
  		elements = value;
  		$$invalidate(1, elements);
  	}

  	$$self.$set = function ($$props) {
  		if ("clientKey" in $$props) { $$invalidate(0, clientKey = $$props.clientKey); }
  	};

  	return [
  		clientKey,
  		elements,
  		stripe,
  		stripe_1_stripe_binding,
  		stripe_1_elements_binding
  	];
  }

  var CreditCardForm = /*@__PURE__*/(function (SvelteComponent) {
  	function CreditCardForm(options) {
  		SvelteComponent.call(this);
  		init(this, options, instance$3, create_fragment$3, safe_not_equal, { clientKey: 0 });
  	}

  	if ( SvelteComponent ) CreditCardForm.__proto__ = SvelteComponent;
  	CreditCardForm.prototype = Object.create( SvelteComponent && SvelteComponent.prototype );
  	CreditCardForm.prototype.constructor = CreditCardForm;

  	return CreditCardForm;
  }(SvelteComponent));

  var main = {
      creditCardForm: function creditCardForm( target, props ){ return  new CreditCardForm({target: target,props: props}); }
  };

  return main;

}());
