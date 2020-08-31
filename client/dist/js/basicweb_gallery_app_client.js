/**
  * basicweb_gallery_app_client
  * (C) 2020 M. Bellaire
  * All rights Reserved
 */

var basicweb_gallery_app_client = (function () {
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

  function fetch$1(input, init) {
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

  fetch$1.polyfill = true;

  if (!self.fetch) {
    self.fetch = fetch$1;
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
  function is_promise(value) {
      return value && typeof value === 'object' && typeof value.then === 'function';
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
      for (var i = 0; i < iterations.length; i += 1) {
          if (iterations[i])
              { iterations[i].d(detaching); }
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
  function set_input_value(input, value) {
      if (value != null || input.value) {
          input.value = value;
      }
  }
  function custom_event(type, detail) {
      var e = document.createEvent('CustomEvent');
      e.initCustomEvent(type, false, false, detail);
      return e;
  }
  var HtmlTag = function HtmlTag(html, anchor) {
      if ( anchor === void 0 ) anchor = null;

      this.e = element('div');
      this.a = anchor;
      this.u(html);
  };
  HtmlTag.prototype.m = function m (target, anchor) {
          if ( anchor === void 0 ) anchor = null;

      for (var i = 0; i < this.n.length; i += 1) {
          insert(target, this.n[i], anchor);
      }
      this.t = target;
  };
  HtmlTag.prototype.u = function u (html) {
      this.e.innerHTML = html;
      this.n = Array.from(this.e.childNodes);
  };
  HtmlTag.prototype.p = function p (html) {
      this.d();
      this.u(html);
      this.m(this.t, this.a);
  };
  HtmlTag.prototype.d = function d () {
      this.n.forEach(detach);
  };

  var current_component;
  function set_current_component(component) {
      current_component = component;
  }
  function get_current_component() {
      if (!current_component)
          { throw new Error("Function called outside component initialization"); }
      return current_component;
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

  function handle_promise(promise, info) {
      var token = info.token = {};
      function update(type, index, key, value) {
          if (info.token !== token)
              { return; }
          info.resolved = value;
          var child_ctx = info.ctx;
          if (key !== undefined) {
              child_ctx = child_ctx.slice();
              child_ctx[key] = value;
          }
          var block = type && (info.current = type)(child_ctx);
          var needs_flush = false;
          if (info.block) {
              if (info.blocks) {
                  info.blocks.forEach(function (block, i) {
                      if (i !== index && block) {
                          group_outros();
                          transition_out(block, 1, 1, function () {
                              info.blocks[i] = null;
                          });
                          check_outros();
                      }
                  });
              }
              else {
                  info.block.d(1);
              }
              block.c();
              transition_in(block, 1);
              block.m(info.mount(), info.anchor);
              needs_flush = true;
          }
          info.block = block;
          if (info.blocks)
              { info.blocks[index] = block; }
          if (needs_flush) {
              flush();
          }
      }
      if (is_promise(promise)) {
          var current_component = get_current_component();
          promise.then(function (value) {
              set_current_component(current_component);
              update(info.then, 1, info.value, value);
              set_current_component(null);
          }, function (error) {
              set_current_component(current_component);
              update(info.catch, 2, info.error, error);
              set_current_component(null);
          });
          // if we previously had a then/catch block, destroy it
          if (info.current !== info.pending) {
              update(info.pending, 0);
              return true;
          }
      }
      else {
          if (info.current !== info.then) {
              update(info.then, 1, info.value, promise);
              return true;
          }
          info.resolved = promise;
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

  /* src/GalleryCreate.html generated by Svelte v3.20.1 */

  function get_each_context(ctx, list, i) {
  	var child_ctx = ctx.slice();
  	child_ctx[14] = list[i];
  	return child_ctx;
  }

  // (144:8) {:catch err}
  function create_catch_block(ctx) {
  	var p;
  	var t_value = /*err*/ ctx[17].message + "";
  	var t;

  	return {
  		c: function c() {
  			p = element("p");
  			t = text(t_value);
  		},
  		m: function m(target, anchor) {
  			insert(target, p, anchor);
  			append(p, t);
  		},
  		p: function p(ctx, dirty) {
  			if (dirty & /*galleryResult*/ 4 && t_value !== (t_value = /*err*/ ctx[17].message + "")) { set_data(t, t_value); }
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(p); }
  		}
  	};
  }

  // (136:8) {:then}
  function create_then_block(ctx) {
  	var label0;
  	var t0;
  	var input0;
  	var t1;
  	var label1;
  	var t2;
  	var input1;
  	var t3;
  	var if_block_anchor;
  	var dispose;

  	function select_block_type(ctx, dirty) {
  		if (/*galleryId*/ ctx[0]) { return create_if_block_4; }
  		return create_else_block_1;
  	}

  	var current_block_type = select_block_type(ctx);
  	var if_block = current_block_type(ctx);

  	return {
  		c: function c() {
  			label0 = element("label");
  			t0 = text("Name: ");
  			input0 = element("input");
  			t1 = space();
  			label1 = element("label");
  			t2 = text("Description: ");
  			input1 = element("input");
  			t3 = space();
  			if_block.c();
  			if_block_anchor = empty();
  			attr(input0, "type", "text");
  			attr(input1, "type", "text");
  		},
  		m: function m(target, anchor, remount) {
  			insert(target, label0, anchor);
  			append(label0, t0);
  			append(label0, input0);
  			set_input_value(input0, /*galleryInfo*/ ctx[3].name);
  			insert(target, t1, anchor);
  			insert(target, label1, anchor);
  			append(label1, t2);
  			append(label1, input1);
  			set_input_value(input1, /*galleryInfo*/ ctx[3].description);
  			insert(target, t3, anchor);
  			if_block.m(target, anchor);
  			insert(target, if_block_anchor, anchor);
  			if (remount) { run_all(dispose); }

  			dispose = [
  				listen(input0, "input", /*input0_input_handler*/ ctx[9]),
  				listen(input1, "input", /*input1_input_handler*/ ctx[10])
  			];
  		},
  		p: function p(ctx, dirty) {
  			if (dirty & /*galleryInfo*/ 8 && input0.value !== /*galleryInfo*/ ctx[3].name) {
  				set_input_value(input0, /*galleryInfo*/ ctx[3].name);
  			}

  			if (dirty & /*galleryInfo*/ 8 && input1.value !== /*galleryInfo*/ ctx[3].description) {
  				set_input_value(input1, /*galleryInfo*/ ctx[3].description);
  			}

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
  		d: function d(detaching) {
  			if (detaching) { detach(label0); }
  			if (detaching) { detach(t1); }
  			if (detaching) { detach(label1); }
  			if (detaching) { detach(t3); }
  			if_block.d(detaching);
  			if (detaching) { detach(if_block_anchor); }
  			run_all(dispose);
  		}
  	};
  }

  // (141:8) {:else}
  function create_else_block_1(ctx) {
  	var button;
  	var t;
  	var button_disabled_value;
  	var dispose;

  	return {
  		c: function c() {
  			button = element("button");
  			t = text("Add Gallery");
  			attr(button, "type", "button");
  			button.disabled = button_disabled_value = !galleryIsValid(/*galleryInfo*/ ctx[3]);
  		},
  		m: function m(target, anchor, remount) {
  			insert(target, button, anchor);
  			append(button, t);
  			if (remount) { dispose(); }
  			dispose = listen(button, "click", /*addGallery*/ ctx[5]);
  		},
  		p: function p(ctx, dirty) {
  			if (dirty & /*galleryInfo*/ 8 && button_disabled_value !== (button_disabled_value = !galleryIsValid(/*galleryInfo*/ ctx[3]))) {
  				button.disabled = button_disabled_value;
  			}
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(button); }
  			dispose();
  		}
  	};
  }

  // (139:8) {#if galleryId}
  function create_if_block_4(ctx) {
  	var button;
  	var t;
  	var button_disabled_value;
  	var dispose;

  	return {
  		c: function c() {
  			button = element("button");
  			t = text("Update Gallery");
  			attr(button, "type", "button");
  			button.disabled = button_disabled_value = !galleryIsValid(/*galleryInfo*/ ctx[3]);
  		},
  		m: function m(target, anchor, remount) {
  			insert(target, button, anchor);
  			append(button, t);
  			if (remount) { dispose(); }
  			dispose = listen(button, "click", /*updateGallery*/ ctx[6]);
  		},
  		p: function p(ctx, dirty) {
  			if (dirty & /*galleryInfo*/ 8 && button_disabled_value !== (button_disabled_value = !galleryIsValid(/*galleryInfo*/ ctx[3]))) {
  				button.disabled = button_disabled_value;
  			}
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(button); }
  			dispose();
  		}
  	};
  }

  // (134:30)          <p>Submitting...</p>         {:then}
  function create_pending_block(ctx) {
  	var p;

  	return {
  		c: function c() {
  			p = element("p");
  			p.textContent = "Submitting...";
  		},
  		m: function m(target, anchor) {
  			insert(target, p, anchor);
  		},
  		p: noop$1,
  		d: function d(detaching) {
  			if (detaching) { detach(p); }
  		}
  	};
  }

  // (148:4) {#if galleryId}
  function create_if_block(ctx) {
  	var fieldset1;
  	var legend0;
  	var t1;
  	var ul;
  	var t2;
  	var fieldset0;
  	var legend1;
  	var t4;
  	var label0;
  	var t5;
  	var input0;
  	var t6;
  	var label1;
  	var t7;
  	var input1;
  	var t8;
  	var label2;
  	var t9;
  	var input2;
  	var t10;
  	var button;
  	var t11;
  	var button_disabled_value;
  	var dispose;
  	var each_value = /*items*/ ctx[1];
  	var each_blocks = [];

  	for (var i = 0; i < each_value.length; i += 1) {
  		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
  	}

  	return {
  		c: function c() {
  			fieldset1 = element("fieldset");
  			legend0 = element("legend");
  			legend0.textContent = "Gallery Items";
  			t1 = space();
  			ul = element("ul");

  			for (var i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			t2 = space();
  			fieldset0 = element("fieldset");
  			legend1 = element("legend");
  			legend1.textContent = "New Item";
  			t4 = space();
  			label0 = element("label");
  			t5 = text("Name: ");
  			input0 = element("input");
  			t6 = space();
  			label1 = element("label");
  			t7 = text("Description: ");
  			input1 = element("input");
  			t8 = space();
  			label2 = element("label");
  			t9 = text("File: ");
  			input2 = element("input");
  			t10 = space();
  			button = element("button");
  			t11 = text("Add Item");
  			attr(input0, "type", "text");
  			attr(input1, "type", "text");
  			attr(input2, "type", "file");
  			attr(button, "type", "button");
  			button.disabled = button_disabled_value = !/*itemIsValid*/ ctx[7](/*itemInfo*/ ctx[4]);
  		},
  		m: function m(target, anchor, remount) {
  			insert(target, fieldset1, anchor);
  			append(fieldset1, legend0);
  			append(fieldset1, t1);
  			append(fieldset1, ul);

  			for (var i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(ul, null);
  			}

  			append(fieldset1, t2);
  			append(fieldset1, fieldset0);
  			append(fieldset0, legend1);
  			append(fieldset0, t4);
  			append(fieldset0, label0);
  			append(label0, t5);
  			append(label0, input0);
  			set_input_value(input0, /*itemInfo*/ ctx[4].name);
  			append(fieldset0, t6);
  			append(fieldset0, label1);
  			append(label1, t7);
  			append(label1, input1);
  			set_input_value(input1, /*itemInfo*/ ctx[4].description);
  			append(fieldset0, t8);
  			append(fieldset0, label2);
  			append(label2, t9);
  			append(label2, input2);
  			append(fieldset0, t10);
  			append(fieldset0, button);
  			append(button, t11);
  			if (remount) { run_all(dispose); }

  			dispose = [
  				listen(input0, "input", /*input0_input_handler_1*/ ctx[11]),
  				listen(input1, "input", /*input1_input_handler_1*/ ctx[12]),
  				listen(input2, "change", /*input2_change_handler*/ ctx[13]),
  				listen(button, "click", /*addItem*/ ctx[8])
  			];
  		},
  		p: function p(ctx, dirty) {
  			if (dirty & /*items, Success, Error*/ 2) {
  				each_value = /*items*/ ctx[1];
  				var i;

  				for (i = 0; i < each_value.length; i += 1) {
  					var child_ctx = get_each_context(ctx, each_value, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(ul, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value.length;
  			}

  			if (dirty & /*itemInfo*/ 16 && input0.value !== /*itemInfo*/ ctx[4].name) {
  				set_input_value(input0, /*itemInfo*/ ctx[4].name);
  			}

  			if (dirty & /*itemInfo*/ 16 && input1.value !== /*itemInfo*/ ctx[4].description) {
  				set_input_value(input1, /*itemInfo*/ ctx[4].description);
  			}

  			if (dirty & /*itemInfo*/ 16 && button_disabled_value !== (button_disabled_value = !/*itemIsValid*/ ctx[7](/*itemInfo*/ ctx[4]))) {
  				button.disabled = button_disabled_value;
  			}
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(fieldset1); }
  			destroy_each(each_blocks, detaching);
  			run_all(dispose);
  		}
  	};
  }

  // (161:16) {:else}
  function create_else_block(ctx) {
  	var progress;

  	return {
  		c: function c() {
  			progress = element("progress");
  		},
  		m: function m(target, anchor) {
  			insert(target, progress, anchor);
  		},
  		p: noop$1,
  		d: function d(detaching) {
  			if (detaching) { detach(progress); }
  		}
  	};
  }

  // (159:16) {#if item.file.total > 0}
  function create_if_block_3(ctx) {
  	var progress;
  	var progress_max_value;
  	var progress_value_value;

  	return {
  		c: function c() {
  			progress = element("progress");
  			attr(progress, "max", progress_max_value = /*item*/ ctx[14].file.total);
  			progress.value = progress_value_value = /*item*/ ctx[14].file.loaded;
  		},
  		m: function m(target, anchor) {
  			insert(target, progress, anchor);
  		},
  		p: function p(ctx, dirty) {
  			if (dirty & /*items*/ 2 && progress_max_value !== (progress_max_value = /*item*/ ctx[14].file.total)) {
  				attr(progress, "max", progress_max_value);
  			}

  			if (dirty & /*items*/ 2 && progress_value_value !== (progress_value_value = /*item*/ ctx[14].file.loaded)) {
  				progress.value = progress_value_value;
  			}
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(progress); }
  		}
  	};
  }

  // (156:53) 
  function create_if_block_2(ctx) {
  	var span;
  	var t0;
  	var t1_value = /*item*/ ctx[14].file.response + "";
  	var t1;

  	return {
  		c: function c() {
  			span = element("span");
  			t0 = text("Upload Failed: ");
  			t1 = text(t1_value);
  			attr(span, "class", "error");
  		},
  		m: function m(target, anchor) {
  			insert(target, span, anchor);
  			append(span, t0);
  			append(span, t1);
  		},
  		p: function p(ctx, dirty) {
  			if (dirty & /*items*/ 2 && t1_value !== (t1_value = /*item*/ ctx[14].file.response + "")) { set_data(t1, t1_value); }
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(span); }
  		}
  	};
  }

  // (154:16) {#if item.file.status === Success}
  function create_if_block_1(ctx) {
  	var span;

  	return {
  		c: function c() {
  			span = element("span");
  			span.textContent = "Success";
  			attr(span, "class", "success");
  		},
  		m: function m(target, anchor) {
  			insert(target, span, anchor);
  		},
  		p: noop$1,
  		d: function d(detaching) {
  			if (detaching) { detach(span); }
  		}
  	};
  }

  // (152:8) {#each items as item}
  function create_each_block(ctx) {
  	var li;
  	var t0_value = /*item*/ ctx[14].name + "";
  	var t0;
  	var t1;
  	var t2;

  	function select_block_type_1(ctx, dirty) {
  		if (/*item*/ ctx[14].file.status === Success) { return create_if_block_1; }
  		if (/*item*/ ctx[14].file.status === Error$1) { return create_if_block_2; }
  		if (/*item*/ ctx[14].file.total > 0) { return create_if_block_3; }
  		return create_else_block;
  	}

  	var current_block_type = select_block_type_1(ctx);
  	var if_block = current_block_type(ctx);

  	return {
  		c: function c() {
  			li = element("li");
  			t0 = text(t0_value);
  			t1 = space();
  			if_block.c();
  			t2 = space();
  		},
  		m: function m(target, anchor) {
  			insert(target, li, anchor);
  			append(li, t0);
  			append(li, t1);
  			if_block.m(li, null);
  			append(li, t2);
  		},
  		p: function p(ctx, dirty) {
  			if (dirty & /*items*/ 2 && t0_value !== (t0_value = /*item*/ ctx[14].name + "")) { set_data(t0, t0_value); }

  			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
  				if_block.p(ctx, dirty);
  			} else {
  				if_block.d(1);
  				if_block = current_block_type(ctx);

  				if (if_block) {
  					if_block.c();
  					if_block.m(li, t2);
  				}
  			}
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(li); }
  			if_block.d();
  		}
  	};
  }

  function create_fragment(ctx) {
  	var form;
  	var fieldset;
  	var legend;
  	var t1;
  	var promise;
  	var t2;

  	var info = {
  		ctx: ctx,
  		current: null,
  		token: null,
  		pending: create_pending_block,
  		then: create_then_block,
  		catch: create_catch_block,
  		error: 17
  	};

  	handle_promise(promise = /*galleryResult*/ ctx[2], info);
  	var if_block = /*galleryId*/ ctx[0] && create_if_block(ctx);

  	return {
  		c: function c() {
  			form = element("form");
  			fieldset = element("fieldset");
  			legend = element("legend");
  			legend.textContent = "Gallery Information";
  			t1 = space();
  			info.block.c();
  			t2 = space();
  			if (if_block) { if_block.c(); }
  		},
  		m: function m(target, anchor) {
  			insert(target, form, anchor);
  			append(form, fieldset);
  			append(fieldset, legend);
  			append(fieldset, t1);
  			info.block.m(fieldset, info.anchor = null);
  			info.mount = function () { return fieldset; };
  			info.anchor = null;
  			append(form, t2);
  			if (if_block) { if_block.m(form, null); }
  		},
  		p: function p(new_ctx, ref) {
  			var dirty = ref[0];

  			ctx = new_ctx;
  			info.ctx = ctx;

  			if (dirty & /*galleryResult*/ 4 && promise !== (promise = /*galleryResult*/ ctx[2]) && handle_promise(promise, info)) ; else {
  				var child_ctx = ctx.slice();
  				info.block.p(child_ctx, dirty);
  			}

  			if (/*galleryId*/ ctx[0]) {
  				if (if_block) {
  					if_block.p(ctx, dirty);
  				} else {
  					if_block = create_if_block(ctx);
  					if_block.c();
  					if_block.m(form, null);
  				}
  			} else if (if_block) {
  				if_block.d(1);
  				if_block = null;
  			}
  		},
  		i: noop$1,
  		o: noop$1,
  		d: function d(detaching) {
  			if (detaching) { detach(form); }
  			info.block.d();
  			info.token = null;
  			info = null;
  			if (if_block) { if_block.d(); }
  		}
  	};
  }

  var Loading = 0;
  var Success = 1;
  var Error$1 = 2;

  function galleryIsValid(galleryInfo) {
  	return galleryInfo.name.length;
  }

  function instance($$self, $$props, $$invalidate) {
  	var galleryId = $$props.galleryId;
  	var items = [];
  	var galleryResult = Promise.resolve(true);
  	var galleryInfo = { kind: 0, name: "", description: "" };

  	var itemInfo = {
  		kind: 0,
  		name: "",
  		description: "",
  		files: null
  	};

  	function addGallery() {
  		if (galleryIsValid(galleryInfo)) {
  			$$invalidate(2, galleryResult = fetch("http://localhost:8080/galleries", {
  				method: "POST",
  				headers: { "Content-Type": "application/json" },
  				credentials: "same-origin",
  				body: JSON.stringify(galleryInfo)
  			}).then(function (res) { return res.json(); }).then(function (id) { return $$invalidate(0, galleryId = id); }));
  		}
  	}

  	function updateGallery() {
  		if (galleryId && galleryIsValid(galleryInfo)) {
  			$$invalidate(2, galleryResult = fetch(("http://localhost:8080/galleries/" + galleryId), {
  				method: "POST",
  				headers: { "Content-Type": "application/json" },
  				credentials: "same-origin",
  				body: JSON.stringify(galleryInfo)
  			}).then(function (res) { return res.json(); }));
  		}
  	}

  	function itemIsValid(itemInfo) {
  		return galleryId && itemInfo.files && itemInfo.files[0] && itemInfo.name.length;
  	}

  	function addItem() {
  		if (itemIsValid(itemInfo)) {
  			var requestData = {
  				status: Loading,
  				loaded: 0,
  				total: 0,
  				response: ""
  			};

  			var data = new FormData();
  			var request = new XMLHttpRequest();

  			data.append("itemInfo", JSON.stringify({
  				name: itemInfo.name,
  				description: itemInfo.description,
  				kind: itemInfo.kind
  			}));

  			data.append("file", itemInfo.files[0]);
  			request.open("POST", ("http://localhost:8080/galleries/" + galleryId + "/items"));

  			request.upload.addEventListener("progress", function (e) {
  				var loaded = e.loaded;
  				var total = e.total;
  				requestData.loaded = loaded;
  				requestData.total = total;

  				// Ensure refresh
  				$$invalidate(1, items);
  			});

  			request.addEventListener("load", function (e) {
  				if (request.status == 200 || request.status == 201) { requestData.status = Success; } else { requestData.status = Error$1; }

  				// Ensure refresh
  				$$invalidate(1, items);
  			});

  			request.addEventListener("readystatechange", function (e) {
  				if (request.readyState === 4 && request.response.length) { requestData.response = JSON.parse(request.response); }

  				// Ensure refresh
  				$$invalidate(1, items);
  			});

  			request.send(data);

  			items.push({
  				name: itemInfo.name,
  				description: itemInfo.description,
  				kind: itemInfo.kind,
  				file: requestData
  			});

  			$$invalidate(4, itemInfo.name = "", itemInfo);
  			$$invalidate(4, itemInfo.description = "", itemInfo);
  			$$invalidate(4, itemInfo.kind = 0, itemInfo);
  			$$invalidate(1, items);
  		}
  	}

  	function input0_input_handler() {
  		galleryInfo.name = this.value;
  		$$invalidate(3, galleryInfo);
  	}

  	function input1_input_handler() {
  		galleryInfo.description = this.value;
  		$$invalidate(3, galleryInfo);
  	}

  	function input0_input_handler_1() {
  		itemInfo.name = this.value;
  		$$invalidate(4, itemInfo);
  	}

  	function input1_input_handler_1() {
  		itemInfo.description = this.value;
  		$$invalidate(4, itemInfo);
  	}

  	function input2_change_handler() {
  		itemInfo.files = this.files;
  		$$invalidate(4, itemInfo);
  	}

  	$$self.$set = function ($$props) {
  		if ("galleryId" in $$props) { $$invalidate(0, galleryId = $$props.galleryId); }
  	};

  	return [
  		galleryId,
  		items,
  		galleryResult,
  		galleryInfo,
  		itemInfo,
  		addGallery,
  		updateGallery,
  		itemIsValid,
  		addItem,
  		input0_input_handler,
  		input1_input_handler,
  		input0_input_handler_1,
  		input1_input_handler_1,
  		input2_change_handler
  	];
  }

  var GalleryCreate = /*@__PURE__*/(function (SvelteComponent) {
  	function GalleryCreate(options) {
  		SvelteComponent.call(this);
  		init(this, options, instance, create_fragment, safe_not_equal, { galleryId: 0 });
  	}

  	if ( SvelteComponent ) GalleryCreate.__proto__ = SvelteComponent;
  	GalleryCreate.prototype = Object.create( SvelteComponent && SvelteComponent.prototype );
  	GalleryCreate.prototype.constructor = GalleryCreate;

  	return GalleryCreate;
  }(SvelteComponent));

  /* src/UserGalleryCreate.html generated by Svelte v3.20.1 */

  function get_each_context$1(ctx, list, i) {
  	var child_ctx = ctx.slice();
  	child_ctx[18] = list[i];
  	return child_ctx;
  }

  // (159:8) {:catch err}
  function create_catch_block$1(ctx) {
  	var p;
  	var t_value = /*err*/ ctx[21].message + "";
  	var t;

  	return {
  		c: function c() {
  			p = element("p");
  			t = text(t_value);
  		},
  		m: function m(target, anchor) {
  			insert(target, p, anchor);
  			append(p, t);
  		},
  		p: function p(ctx, dirty) {
  			if (dirty & /*galleryResult*/ 4 && t_value !== (t_value = /*err*/ ctx[21].message + "")) { set_data(t, t_value); }
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(p); }
  		}
  	};
  }

  // (150:8) {:then}
  function create_then_block$1(ctx) {
  	var label0;
  	var t0;
  	var input0;
  	var t1;
  	var label1;
  	var t2;
  	var input1;
  	var t3;
  	var label2;
  	var t4;
  	var input2;
  	var t5;
  	var if_block_anchor;
  	var dispose;

  	function select_block_type(ctx, dirty) {
  		if (/*galleryId*/ ctx[0]) { return create_if_block_4$1; }
  		return create_else_block_1$1;
  	}

  	var current_block_type = select_block_type(ctx);
  	var if_block = current_block_type(ctx);

  	return {
  		c: function c() {
  			label0 = element("label");
  			t0 = text("Name: ");
  			input0 = element("input");
  			t1 = space();
  			label1 = element("label");
  			t2 = text("Description: ");
  			input1 = element("input");
  			t3 = space();
  			label2 = element("label");
  			t4 = text("Url: ");
  			input2 = element("input");
  			t5 = space();
  			if_block.c();
  			if_block_anchor = empty();
  			attr(input0, "type", "text");
  			attr(input1, "type", "text");
  			attr(input2, "type", "text");
  		},
  		m: function m(target, anchor, remount) {
  			insert(target, label0, anchor);
  			append(label0, t0);
  			append(label0, input0);
  			set_input_value(input0, /*galleryInfo*/ ctx[3].name);
  			insert(target, t1, anchor);
  			insert(target, label1, anchor);
  			append(label1, t2);
  			append(label1, input1);
  			set_input_value(input1, /*galleryInfo*/ ctx[3].description);
  			insert(target, t3, anchor);
  			insert(target, label2, anchor);
  			append(label2, t4);
  			append(label2, input2);
  			set_input_value(input2, /*userGalleryInfo*/ ctx[4].url);
  			insert(target, t5, anchor);
  			if_block.m(target, anchor);
  			insert(target, if_block_anchor, anchor);
  			if (remount) { run_all(dispose); }

  			dispose = [
  				listen(input0, "input", /*input0_input_handler*/ ctx[11]),
  				listen(input1, "input", /*input1_input_handler*/ ctx[12]),
  				listen(input2, "input", /*input2_input_handler*/ ctx[13])
  			];
  		},
  		p: function p(ctx, dirty) {
  			if (dirty & /*galleryInfo*/ 8 && input0.value !== /*galleryInfo*/ ctx[3].name) {
  				set_input_value(input0, /*galleryInfo*/ ctx[3].name);
  			}

  			if (dirty & /*galleryInfo*/ 8 && input1.value !== /*galleryInfo*/ ctx[3].description) {
  				set_input_value(input1, /*galleryInfo*/ ctx[3].description);
  			}

  			if (dirty & /*userGalleryInfo*/ 16 && input2.value !== /*userGalleryInfo*/ ctx[4].url) {
  				set_input_value(input2, /*userGalleryInfo*/ ctx[4].url);
  			}

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
  		d: function d(detaching) {
  			if (detaching) { detach(label0); }
  			if (detaching) { detach(t1); }
  			if (detaching) { detach(label1); }
  			if (detaching) { detach(t3); }
  			if (detaching) { detach(label2); }
  			if (detaching) { detach(t5); }
  			if_block.d(detaching);
  			if (detaching) { detach(if_block_anchor); }
  			run_all(dispose);
  		}
  	};
  }

  // (156:8) {:else}
  function create_else_block_1$1(ctx) {
  	var button;
  	var t;
  	var button_disabled_value;
  	var dispose;

  	return {
  		c: function c() {
  			button = element("button");
  			t = text("Add Gallery");
  			attr(button, "type", "button");
  			button.disabled = button_disabled_value = !galleryIsValid$1(/*galleryInfo*/ ctx[3]);
  		},
  		m: function m(target, anchor, remount) {
  			insert(target, button, anchor);
  			append(button, t);
  			if (remount) { dispose(); }
  			dispose = listen(button, "click", /*addGallery*/ ctx[7]);
  		},
  		p: function p(ctx, dirty) {
  			if (dirty & /*galleryInfo*/ 8 && button_disabled_value !== (button_disabled_value = !galleryIsValid$1(/*galleryInfo*/ ctx[3]))) {
  				button.disabled = button_disabled_value;
  			}
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(button); }
  			dispose();
  		}
  	};
  }

  // (154:8) {#if galleryId}
  function create_if_block_4$1(ctx) {
  	var button;
  	var t;
  	var button_disabled_value;
  	var dispose;

  	return {
  		c: function c() {
  			button = element("button");
  			t = text("Update Gallery");
  			attr(button, "type", "button");
  			button.disabled = button_disabled_value = !galleryIsValid$1(/*galleryInfo*/ ctx[3]);
  		},
  		m: function m(target, anchor, remount) {
  			insert(target, button, anchor);
  			append(button, t);
  			if (remount) { dispose(); }
  			dispose = listen(button, "click", /*updateGallery*/ ctx[8]);
  		},
  		p: function p(ctx, dirty) {
  			if (dirty & /*galleryInfo*/ 8 && button_disabled_value !== (button_disabled_value = !galleryIsValid$1(/*galleryInfo*/ ctx[3]))) {
  				button.disabled = button_disabled_value;
  			}
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(button); }
  			dispose();
  		}
  	};
  }

  // (148:30)          <p>Submitting...</p>         {:then}
  function create_pending_block$1(ctx) {
  	var p;

  	return {
  		c: function c() {
  			p = element("p");
  			p.textContent = "Submitting...";
  		},
  		m: function m(target, anchor) {
  			insert(target, p, anchor);
  		},
  		p: noop$1,
  		d: function d(detaching) {
  			if (detaching) { detach(p); }
  		}
  	};
  }

  // (163:4) {#if galleryId}
  function create_if_block$1(ctx) {
  	var fieldset1;
  	var legend0;
  	var t1;
  	var ul;
  	var t2;
  	var fieldset0;
  	var legend1;
  	var t4;
  	var label0;
  	var t5;
  	var input0;
  	var t6;
  	var label1;
  	var t7;
  	var input1;
  	var t8;
  	var label2;
  	var t9;
  	var input2;
  	var t10;
  	var label3;
  	var t11;
  	var input3;
  	var t12;
  	var button;
  	var t13;
  	var button_disabled_value;
  	var dispose;
  	var each_value = /*items*/ ctx[1];
  	var each_blocks = [];

  	for (var i = 0; i < each_value.length; i += 1) {
  		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
  	}

  	return {
  		c: function c() {
  			fieldset1 = element("fieldset");
  			legend0 = element("legend");
  			legend0.textContent = "Gallery Items";
  			t1 = space();
  			ul = element("ul");

  			for (var i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			t2 = space();
  			fieldset0 = element("fieldset");
  			legend1 = element("legend");
  			legend1.textContent = "New Item";
  			t4 = space();
  			label0 = element("label");
  			t5 = text("Name: ");
  			input0 = element("input");
  			t6 = space();
  			label1 = element("label");
  			t7 = text("Description: ");
  			input1 = element("input");
  			t8 = space();
  			label2 = element("label");
  			t9 = text("Url: ");
  			input2 = element("input");
  			t10 = space();
  			label3 = element("label");
  			t11 = text("File: ");
  			input3 = element("input");
  			t12 = space();
  			button = element("button");
  			t13 = text("Add Item");
  			attr(input0, "type", "text");
  			attr(input1, "type", "text");
  			attr(input2, "type", "text");
  			attr(input3, "type", "file");
  			attr(button, "type", "button");
  			button.disabled = button_disabled_value = !/*itemIsValid*/ ctx[9](/*itemInfo*/ ctx[5]);
  		},
  		m: function m(target, anchor, remount) {
  			insert(target, fieldset1, anchor);
  			append(fieldset1, legend0);
  			append(fieldset1, t1);
  			append(fieldset1, ul);

  			for (var i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(ul, null);
  			}

  			append(fieldset1, t2);
  			append(fieldset1, fieldset0);
  			append(fieldset0, legend1);
  			append(fieldset0, t4);
  			append(fieldset0, label0);
  			append(label0, t5);
  			append(label0, input0);
  			set_input_value(input0, /*itemInfo*/ ctx[5].name);
  			append(fieldset0, t6);
  			append(fieldset0, label1);
  			append(label1, t7);
  			append(label1, input1);
  			set_input_value(input1, /*itemInfo*/ ctx[5].description);
  			append(fieldset0, t8);
  			append(fieldset0, label2);
  			append(label2, t9);
  			append(label2, input2);
  			set_input_value(input2, /*userItemInfo*/ ctx[6].url);
  			append(fieldset0, t10);
  			append(fieldset0, label3);
  			append(label3, t11);
  			append(label3, input3);
  			append(fieldset0, t12);
  			append(fieldset0, button);
  			append(button, t13);
  			if (remount) { run_all(dispose); }

  			dispose = [
  				listen(input0, "input", /*input0_input_handler_1*/ ctx[14]),
  				listen(input1, "input", /*input1_input_handler_1*/ ctx[15]),
  				listen(input2, "input", /*input2_input_handler_1*/ ctx[16]),
  				listen(input3, "change", /*input3_change_handler*/ ctx[17]),
  				listen(button, "click", /*addItem*/ ctx[10])
  			];
  		},
  		p: function p(ctx, dirty) {
  			if (dirty & /*items, Success, Error*/ 2) {
  				each_value = /*items*/ ctx[1];
  				var i;

  				for (i = 0; i < each_value.length; i += 1) {
  					var child_ctx = get_each_context$1(ctx, each_value, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block$1(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(ul, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value.length;
  			}

  			if (dirty & /*itemInfo*/ 32 && input0.value !== /*itemInfo*/ ctx[5].name) {
  				set_input_value(input0, /*itemInfo*/ ctx[5].name);
  			}

  			if (dirty & /*itemInfo*/ 32 && input1.value !== /*itemInfo*/ ctx[5].description) {
  				set_input_value(input1, /*itemInfo*/ ctx[5].description);
  			}

  			if (dirty & /*userItemInfo*/ 64 && input2.value !== /*userItemInfo*/ ctx[6].url) {
  				set_input_value(input2, /*userItemInfo*/ ctx[6].url);
  			}

  			if (dirty & /*itemInfo*/ 32 && button_disabled_value !== (button_disabled_value = !/*itemIsValid*/ ctx[9](/*itemInfo*/ ctx[5]))) {
  				button.disabled = button_disabled_value;
  			}
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(fieldset1); }
  			destroy_each(each_blocks, detaching);
  			run_all(dispose);
  		}
  	};
  }

  // (176:16) {:else}
  function create_else_block$1(ctx) {
  	var progress;

  	return {
  		c: function c() {
  			progress = element("progress");
  		},
  		m: function m(target, anchor) {
  			insert(target, progress, anchor);
  		},
  		p: noop$1,
  		d: function d(detaching) {
  			if (detaching) { detach(progress); }
  		}
  	};
  }

  // (174:16) {#if item.file.total > 0}
  function create_if_block_3$1(ctx) {
  	var progress;
  	var progress_max_value;
  	var progress_value_value;

  	return {
  		c: function c() {
  			progress = element("progress");
  			attr(progress, "max", progress_max_value = /*item*/ ctx[18].file.total);
  			progress.value = progress_value_value = /*item*/ ctx[18].file.loaded;
  		},
  		m: function m(target, anchor) {
  			insert(target, progress, anchor);
  		},
  		p: function p(ctx, dirty) {
  			if (dirty & /*items*/ 2 && progress_max_value !== (progress_max_value = /*item*/ ctx[18].file.total)) {
  				attr(progress, "max", progress_max_value);
  			}

  			if (dirty & /*items*/ 2 && progress_value_value !== (progress_value_value = /*item*/ ctx[18].file.loaded)) {
  				progress.value = progress_value_value;
  			}
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(progress); }
  		}
  	};
  }

  // (171:53) 
  function create_if_block_2$1(ctx) {
  	var span;
  	var t0;
  	var t1_value = /*item*/ ctx[18].file.response + "";
  	var t1;

  	return {
  		c: function c() {
  			span = element("span");
  			t0 = text("Upload Failed: ");
  			t1 = text(t1_value);
  			attr(span, "class", "error");
  		},
  		m: function m(target, anchor) {
  			insert(target, span, anchor);
  			append(span, t0);
  			append(span, t1);
  		},
  		p: function p(ctx, dirty) {
  			if (dirty & /*items*/ 2 && t1_value !== (t1_value = /*item*/ ctx[18].file.response + "")) { set_data(t1, t1_value); }
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(span); }
  		}
  	};
  }

  // (169:16) {#if item.file.status === Success}
  function create_if_block_1$1(ctx) {
  	var span;

  	return {
  		c: function c() {
  			span = element("span");
  			span.textContent = "Success";
  			attr(span, "class", "success");
  		},
  		m: function m(target, anchor) {
  			insert(target, span, anchor);
  		},
  		p: noop$1,
  		d: function d(detaching) {
  			if (detaching) { detach(span); }
  		}
  	};
  }

  // (167:8) {#each items as item}
  function create_each_block$1(ctx) {
  	var li;
  	var t0_value = /*item*/ ctx[18].name + "";
  	var t0;
  	var t1;
  	var t2;

  	function select_block_type_1(ctx, dirty) {
  		if (/*item*/ ctx[18].file.status === Success$1) { return create_if_block_1$1; }
  		if (/*item*/ ctx[18].file.status === Error$2) { return create_if_block_2$1; }
  		if (/*item*/ ctx[18].file.total > 0) { return create_if_block_3$1; }
  		return create_else_block$1;
  	}

  	var current_block_type = select_block_type_1(ctx);
  	var if_block = current_block_type(ctx);

  	return {
  		c: function c() {
  			li = element("li");
  			t0 = text(t0_value);
  			t1 = space();
  			if_block.c();
  			t2 = space();
  		},
  		m: function m(target, anchor) {
  			insert(target, li, anchor);
  			append(li, t0);
  			append(li, t1);
  			if_block.m(li, null);
  			append(li, t2);
  		},
  		p: function p(ctx, dirty) {
  			if (dirty & /*items*/ 2 && t0_value !== (t0_value = /*item*/ ctx[18].name + "")) { set_data(t0, t0_value); }

  			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
  				if_block.p(ctx, dirty);
  			} else {
  				if_block.d(1);
  				if_block = current_block_type(ctx);

  				if (if_block) {
  					if_block.c();
  					if_block.m(li, t2);
  				}
  			}
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(li); }
  			if_block.d();
  		}
  	};
  }

  function create_fragment$1(ctx) {
  	var form;
  	var fieldset;
  	var legend;
  	var t1;
  	var promise;
  	var t2;

  	var info = {
  		ctx: ctx,
  		current: null,
  		token: null,
  		pending: create_pending_block$1,
  		then: create_then_block$1,
  		catch: create_catch_block$1,
  		error: 21
  	};

  	handle_promise(promise = /*galleryResult*/ ctx[2], info);
  	var if_block = /*galleryId*/ ctx[0] && create_if_block$1(ctx);

  	return {
  		c: function c() {
  			form = element("form");
  			fieldset = element("fieldset");
  			legend = element("legend");
  			legend.textContent = "Gallery Information";
  			t1 = space();
  			info.block.c();
  			t2 = space();
  			if (if_block) { if_block.c(); }
  		},
  		m: function m(target, anchor) {
  			insert(target, form, anchor);
  			append(form, fieldset);
  			append(fieldset, legend);
  			append(fieldset, t1);
  			info.block.m(fieldset, info.anchor = null);
  			info.mount = function () { return fieldset; };
  			info.anchor = null;
  			append(form, t2);
  			if (if_block) { if_block.m(form, null); }
  		},
  		p: function p(new_ctx, ref) {
  			var dirty = ref[0];

  			ctx = new_ctx;
  			info.ctx = ctx;

  			if (dirty & /*galleryResult*/ 4 && promise !== (promise = /*galleryResult*/ ctx[2]) && handle_promise(promise, info)) ; else {
  				var child_ctx = ctx.slice();
  				info.block.p(child_ctx, dirty);
  			}

  			if (/*galleryId*/ ctx[0]) {
  				if (if_block) {
  					if_block.p(ctx, dirty);
  				} else {
  					if_block = create_if_block$1(ctx);
  					if_block.c();
  					if_block.m(form, null);
  				}
  			} else if (if_block) {
  				if_block.d(1);
  				if_block = null;
  			}
  		},
  		i: noop$1,
  		o: noop$1,
  		d: function d(detaching) {
  			if (detaching) { detach(form); }
  			info.block.d();
  			info.token = null;
  			info = null;
  			if (if_block) { if_block.d(); }
  		}
  	};
  }

  var api = "http://localhost:8080/api/v1";
  var Loading$1 = 0;
  var Success$1 = 1;
  var Error$2 = 2;

  function galleryIsValid$1(galleryInfo) {
  	return galleryInfo.name.length;
  }

  function instance$1($$self, $$props, $$invalidate) {
  	var galleryId = $$props.galleryId;
  	var items = [];
  	var galleryResult = Promise.resolve(true);
  	var galleryInfo = { kind: 0, name: "", description: "" };
  	var userGalleryInfo = { handle: "", permissions: 0, ord: 0 };

  	var itemInfo = {
  		kind: 0,
  		name: "",
  		description: "",
  		files: null
  	};

  	var userItemInfo = { handle: "", permissions: 0, ord: 0 };

  	function addGallery() {
  		if (galleryIsValid$1(galleryInfo)) {
  			$$invalidate(2, galleryResult = fetch((api + "/galleries"), {
  				method: "POST",
  				headers: { "Content-Type": "application/json" },
  				credentials: "same-origin",
  				body: JSON.stringify([galleryInfo, userGalleryInfo])
  			}).then(function (res) { return res.json(); }).then(function (id) { return $$invalidate(0, galleryId = id); }));
  		}
  	}

  	function updateGallery() {
  		if (galleryId && galleryIsValid$1(galleryInfo)) {
  			$$invalidate(2, galleryResult = fetch((api + "/galleries/" + galleryId), {
  				method: "POST",
  				headers: { "Content-Type": "application/json" },
  				credentials: "same-origin",
  				body: JSON.stringify([galleryInfo, userGalleryInfo])
  			}).then(function (res) { return res.json(); }));
  		}
  	}

  	function itemIsValid(itemInfo) {
  		return galleryId && itemInfo.files && itemInfo.files[0] && itemInfo.name.length;
  	}

  	function addItem() {
  		if (itemIsValid(itemInfo)) {
  			var requestData = {
  				status: Loading$1,
  				loaded: 0,
  				total: 0,
  				response: ""
  			};

  			var data = new FormData();
  			var request = new XMLHttpRequest();

  			data.append("itemInfo", JSON.stringify([
  				{
  					name: itemInfo.name,
  					description: itemInfo.description,
  					kind: itemInfo.kind
  				},
  				userItemInfo
  			]));

  			data.append("file", itemInfo.files[0]);
  			request.open("POST", (api + "/galleries/" + galleryId + "/items"));

  			request.upload.addEventListener("progress", function (e) {
  				var loaded = e.loaded;
  				var total = e.total;
  				requestData.loaded = loaded;
  				requestData.total = total;

  				// Ensure refresh
  				$$invalidate(1, items);
  			});

  			request.addEventListener("load", function (e) {
  				if (request.status == 200 || request.status == 201) { requestData.status = Success$1; } else { requestData.status = Error$2; }

  				// Ensure refresh
  				$$invalidate(1, items);
  			});

  			request.addEventListener("readystatechange", function (e) {
  				if (request.readyState === 4 && request.response.length) { requestData.response = JSON.parse(request.response); }

  				// Ensure refresh
  				$$invalidate(1, items);
  			});

  			request.send(data);

  			items.push({
  				name: itemInfo.name,
  				description: itemInfo.description,
  				kind: itemInfo.kind,
  				file: requestData
  			});

  			$$invalidate(5, itemInfo.name = "", itemInfo);
  			$$invalidate(5, itemInfo.description = "", itemInfo);
  			$$invalidate(5, itemInfo.kind = 0, itemInfo);
  			$$invalidate(1, items);
  		}
  	}

  	function input0_input_handler() {
  		galleryInfo.name = this.value;
  		$$invalidate(3, galleryInfo);
  	}

  	function input1_input_handler() {
  		galleryInfo.description = this.value;
  		$$invalidate(3, galleryInfo);
  	}

  	function input2_input_handler() {
  		userGalleryInfo.url = this.value;
  		$$invalidate(4, userGalleryInfo);
  	}

  	function input0_input_handler_1() {
  		itemInfo.name = this.value;
  		$$invalidate(5, itemInfo);
  	}

  	function input1_input_handler_1() {
  		itemInfo.description = this.value;
  		$$invalidate(5, itemInfo);
  	}

  	function input2_input_handler_1() {
  		userItemInfo.url = this.value;
  		$$invalidate(6, userItemInfo);
  	}

  	function input3_change_handler() {
  		itemInfo.files = this.files;
  		$$invalidate(5, itemInfo);
  	}

  	$$self.$set = function ($$props) {
  		if ("galleryId" in $$props) { $$invalidate(0, galleryId = $$props.galleryId); }
  	};

  	return [
  		galleryId,
  		items,
  		galleryResult,
  		galleryInfo,
  		userGalleryInfo,
  		itemInfo,
  		userItemInfo,
  		addGallery,
  		updateGallery,
  		itemIsValid,
  		addItem,
  		input0_input_handler,
  		input1_input_handler,
  		input2_input_handler,
  		input0_input_handler_1,
  		input1_input_handler_1,
  		input2_input_handler_1,
  		input3_change_handler
  	];
  }

  var UserGalleryCreate = /*@__PURE__*/(function (SvelteComponent) {
  	function UserGalleryCreate(options) {
  		SvelteComponent.call(this);
  		init(this, options, instance$1, create_fragment$1, safe_not_equal, { galleryId: 0 });
  	}

  	if ( SvelteComponent ) UserGalleryCreate.__proto__ = SvelteComponent;
  	UserGalleryCreate.prototype = Object.create( SvelteComponent && SvelteComponent.prototype );
  	UserGalleryCreate.prototype.constructor = UserGalleryCreate;

  	return UserGalleryCreate;
  }(SvelteComponent));

  /* src/Gallery.html generated by Svelte v3.20.1 */

  function get_each_context$2(ctx, list, i) {
  	var child_ctx = ctx.slice();
  	child_ctx[6] = list[i];
  	return child_ctx;
  }

  // (47:0) {:catch err}
  function create_catch_block$2(ctx) {
  	var p;
  	var t0;
  	var t1_value = /*err*/ ctx[5].message + "";
  	var t1;

  	return {
  		c: function c() {
  			p = element("p");
  			t0 = text("Error: ");
  			t1 = text(t1_value);
  		},
  		m: function m(target, anchor) {
  			insert(target, p, anchor);
  			append(p, t0);
  			append(p, t1);
  		},
  		p: function p(ctx, dirty) {
  			if (dirty & /*galleryRequest*/ 1 && t1_value !== (t1_value = /*err*/ ctx[5].message + "")) { set_data(t1, t1_value); }
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(p); }
  		}
  	};
  }

  // (34:0) {:then [gallery,items]}
  function create_then_block$2(ctx) {
  	var assign;

  	(assign = ctx[4], ctx[2] = assign[0], ctx[3] = assign[1]);
  	var h3;
  	var t0_value = /*gallery*/ ctx[2].name + "";
  	var t0;
  	var t1;
  	var t2;
  	var div;
  	var if_block = /*gallery*/ ctx[2].description && create_if_block$2(ctx);
  	var each_value = /*items*/ ctx[3];
  	var each_blocks = [];

  	for (var i = 0; i < each_value.length; i += 1) {
  		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
  	}

  	return {
  		c: function c() {
  			h3 = element("h3");
  			t0 = text(t0_value);
  			t1 = space();
  			if (if_block) { if_block.c(); }
  			t2 = space();
  			div = element("div");

  			for (var i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			attr(div, "class", "gallery svelte-bdzgnj");
  		},
  		m: function m(target, anchor) {
  			insert(target, h3, anchor);
  			append(h3, t0);
  			insert(target, t1, anchor);
  			if (if_block) { if_block.m(target, anchor); }
  			insert(target, t2, anchor);
  			insert(target, div, anchor);

  			for (var i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(div, null);
  			}
  		},
  		p: function p(ctx, dirty) {
  			var assign;

  			if (dirty & /*galleryRequest*/ 1 && t0_value !== (t0_value = /*gallery*/ ctx[2].name + "")) { set_data(t0, t0_value); }

  			if (/*gallery*/ ctx[2].description) {
  				if (if_block) {
  					if_block.p(ctx, dirty);
  				} else {
  					if_block = create_if_block$2(ctx);
  					if_block.c();
  					if_block.m(t2.parentNode, t2);
  				}
  			} else if (if_block) {
  				if_block.d(1);
  				if_block = null;
  			}

  			if (dirty & /*galleryRequest*/ 1) {
  				each_value = /*items*/ ctx[3];
  				var i;

  				for (i = 0; i < each_value.length; i += 1) {
  					var child_ctx = get_each_context$2(ctx, each_value, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block$2(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(div, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value.length;
  			}

  			(assign = ctx[4], ctx[2] = assign[0], ctx[3] = assign[1]);
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(h3); }
  			if (detaching) { detach(t1); }
  			if (if_block) { if_block.d(detaching); }
  			if (detaching) { detach(t2); }
  			if (detaching) { detach(div); }
  			destroy_each(each_blocks, detaching);
  		}
  	};
  }

  // (36:0) {#if gallery.description}
  function create_if_block$2(ctx) {
  	var p;
  	var t_value = /*gallery*/ ctx[2].description + "";
  	var t;

  	return {
  		c: function c() {
  			p = element("p");
  			t = text(t_value);
  		},
  		m: function m(target, anchor) {
  			insert(target, p, anchor);
  			append(p, t);
  		},
  		p: function p(ctx, dirty) {
  			if (dirty & /*galleryRequest*/ 1 && t_value !== (t_value = /*gallery*/ ctx[2].description + "")) { set_data(t, t_value); }
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(p); }
  		}
  	};
  }

  // (40:4) {#each items as item}
  function create_each_block$2(ctx) {
  	var figure;
  	var figcaption;
  	var t0_value = /*item*/ ctx[6][2].name + "";
  	var t0;
  	var t1;
  	var img;
  	var img_src_value;
  	var t2;

  	return {
  		c: function c() {
  			figure = element("figure");
  			figcaption = element("figcaption");
  			t0 = text(t0_value);
  			t1 = space();
  			img = element("img");
  			t2 = space();
  			if (img.src !== (img_src_value = "/assets/" + /*item*/ ctx[6][2].uuid)) { attr(img, "src", img_src_value); }
  			attr(img, "class", "svelte-bdzgnj");
  			attr(figure, "class", "svelte-bdzgnj");
  		},
  		m: function m(target, anchor) {
  			insert(target, figure, anchor);
  			append(figure, figcaption);
  			append(figcaption, t0);
  			append(figure, t1);
  			append(figure, img);
  			append(figure, t2);
  		},
  		p: function p(ctx, dirty) {
  			if (dirty & /*galleryRequest*/ 1 && t0_value !== (t0_value = /*item*/ ctx[6][2].name + "")) { set_data(t0, t0_value); }

  			if (dirty & /*galleryRequest*/ 1 && img.src !== (img_src_value = "/assets/" + /*item*/ ctx[6][2].uuid)) {
  				attr(img, "src", img_src_value);
  			}
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(figure); }
  		}
  	};
  }

  // (32:23)  <p>...</p> {:then [gallery,items]}
  function create_pending_block$2(ctx) {
  	var p;

  	return {
  		c: function c() {
  			p = element("p");
  			p.textContent = "...";
  		},
  		m: function m(target, anchor) {
  			insert(target, p, anchor);
  		},
  		p: noop$1,
  		d: function d(detaching) {
  			if (detaching) { detach(p); }
  		}
  	};
  }

  function create_fragment$2(ctx) {
  	var await_block_anchor;
  	var promise;

  	var info = {
  		ctx: ctx,
  		current: null,
  		token: null,
  		pending: create_pending_block$2,
  		then: create_then_block$2,
  		catch: create_catch_block$2,
  		value: 4,
  		error: 5
  	};

  	handle_promise(promise = /*galleryRequest*/ ctx[0], info);

  	return {
  		c: function c() {
  			await_block_anchor = empty();
  			info.block.c();
  		},
  		m: function m(target, anchor) {
  			insert(target, await_block_anchor, anchor);
  			info.block.m(target, info.anchor = anchor);
  			info.mount = function () { return await_block_anchor.parentNode; };
  			info.anchor = await_block_anchor;
  		},
  		p: function p(new_ctx, ref) {
  			var dirty = ref[0];

  			ctx = new_ctx;
  			info.ctx = ctx;

  			if (dirty & /*galleryRequest*/ 1 && promise !== (promise = /*galleryRequest*/ ctx[0]) && handle_promise(promise, info)) ; else {
  				var child_ctx = ctx.slice();
  				child_ctx[4] = info.resolved;
  				info.block.p(child_ctx, dirty);
  			}
  		},
  		i: noop$1,
  		o: noop$1,
  		d: function d(detaching) {
  			if (detaching) { detach(await_block_anchor); }
  			info.block.d(detaching);
  			info.token = null;
  			info = null;
  		}
  	};
  }

  function instance$2($$self, $$props, $$invalidate) {
  	var galleryId = $$props.galleryId;
  	var galleryRequest;

  	$$self.$set = function ($$props) {
  		if ("galleryId" in $$props) { $$invalidate(1, galleryId = $$props.galleryId); }
  	};

  	$$self.$$.update = function () {
  		if ($$self.$$.dirty & /*galleryId*/ 2) {
  			 if (galleryId) {
  				$$invalidate(0, galleryRequest = Promise.all([
  					fetch(("http://localhost:8080/galleries/" + galleryId)).then(function (res) { return res.json(); }),
  					fetch(("http://localhost:8080/galleries/" + galleryId + "/items")).then(function (res) { return res.json(); })
  				]));
  			}
  		}
  	};

  	return [galleryRequest, galleryId];
  }

  var Gallery = /*@__PURE__*/(function (SvelteComponent) {
  	function Gallery(options) {
  		SvelteComponent.call(this);
  		init(this, options, instance$2, create_fragment$2, safe_not_equal, { galleryId: 1 });
  	}

  	if ( SvelteComponent ) Gallery.__proto__ = SvelteComponent;
  	Gallery.prototype = Object.create( SvelteComponent && SvelteComponent.prototype );
  	Gallery.prototype.constructor = Gallery;

  	return Gallery;
  }(SvelteComponent));

  function isContainer(node) {
      switch (node._type) {
      case 'document':
      case 'block_quote':
      case 'list':
      case 'item':
      case 'paragraph':
      case 'heading':
      case 'emph':
      case 'strong':
      case 'link':
      case 'image':
      case 'custom_inline':
      case 'custom_block':
          return true;
      default:
          return false;
      }
  }

  var resumeAt = function(node, entering) {
      this.current = node;
      this.entering = (entering === true);
  };

  var next = function(){
      var cur = this.current;
      var entering = this.entering;

      if (cur === null) {
          return null;
      }

      var container = isContainer(cur);

      if (entering && container) {
          if (cur._firstChild) {
              this.current = cur._firstChild;
              this.entering = true;
          } else {
              // stay on node but exit
              this.entering = false;
          }

      } else if (cur === this.root) {
          this.current = null;

      } else if (cur._next === null) {
          this.current = cur._parent;
          this.entering = false;

      } else {
          this.current = cur._next;
          this.entering = true;
      }

      return {entering: entering, node: cur};
  };

  var NodeWalker = function(root) {
      return { current: root,
               root: root,
               entering: true,
               next: next,
               resumeAt: resumeAt };
  };

  var Node = function(nodeType, sourcepos) {
      this._type = nodeType;
      this._parent = null;
      this._firstChild = null;
      this._lastChild = null;
      this._prev = null;
      this._next = null;
      this._sourcepos = sourcepos;
      this._lastLineBlank = false;
      this._lastLineChecked = false;
      this._open = true;
      this._string_content = null;
      this._literal = null;
      this._listData = {};
      this._info = null;
      this._destination = null;
      this._title = null;
      this._isFenced = false;
      this._fenceChar = null;
      this._fenceLength = 0;
      this._fenceOffset = null;
      this._level = null;
      this._onEnter = null;
      this._onExit = null;
  };

  var proto = Node.prototype;

  Object.defineProperty(proto, 'isContainer', {
      get: function () { return isContainer(this); }
  });

  Object.defineProperty(proto, 'type', {
      get: function() { return this._type; }
  });

  Object.defineProperty(proto, 'firstChild', {
      get: function() { return this._firstChild; }
  });

  Object.defineProperty(proto, 'lastChild', {
      get: function() { return this._lastChild; }
  });

  Object.defineProperty(proto, 'next', {
      get: function() { return this._next; }
  });

  Object.defineProperty(proto, 'prev', {
      get: function() { return this._prev; }
  });

  Object.defineProperty(proto, 'parent', {
      get: function() { return this._parent; }
  });

  Object.defineProperty(proto, 'sourcepos', {
      get: function() { return this._sourcepos; }
  });

  Object.defineProperty(proto, 'literal', {
      get: function() { return this._literal; },
      set: function(s) { this._literal = s; }
  });

  Object.defineProperty(proto, 'destination', {
      get: function() { return this._destination; },
      set: function(s) { this._destination = s; }
  });

  Object.defineProperty(proto, 'title', {
      get: function() { return this._title; },
      set: function(s) { this._title = s; }
  });

  Object.defineProperty(proto, 'info', {
      get: function() { return this._info; },
      set: function(s) { this._info = s; }
  });

  Object.defineProperty(proto, 'level', {
      get: function() { return this._level; },
      set: function(s) { this._level = s; }
  });

  Object.defineProperty(proto, 'listType', {
      get: function() { return this._listData.type; },
      set: function(t) { this._listData.type = t; }
  });

  Object.defineProperty(proto, 'listTight', {
      get: function() { return this._listData.tight; },
      set: function(t) { this._listData.tight = t; }
  });

  Object.defineProperty(proto, 'listStart', {
      get: function() { return this._listData.start; },
      set: function(n) { this._listData.start = n; }
  });

  Object.defineProperty(proto, 'listDelimiter', {
      get: function() { return this._listData.delimiter; },
      set: function(delim) { this._listData.delimiter = delim; }
  });

  Object.defineProperty(proto, 'onEnter', {
      get: function() { return this._onEnter; },
      set: function(s) { this._onEnter = s; }
  });

  Object.defineProperty(proto, 'onExit', {
      get: function() { return this._onExit; },
      set: function(s) { this._onExit = s; }
  });

  Node.prototype.appendChild = function(child) {
      child.unlink();
      child._parent = this;
      if (this._lastChild) {
          this._lastChild._next = child;
          child._prev = this._lastChild;
          this._lastChild = child;
      } else {
          this._firstChild = child;
          this._lastChild = child;
      }
  };

  Node.prototype.prependChild = function(child) {
      child.unlink();
      child._parent = this;
      if (this._firstChild) {
          this._firstChild._prev = child;
          child._next = this._firstChild;
          this._firstChild = child;
      } else {
          this._firstChild = child;
          this._lastChild = child;
      }
  };

  Node.prototype.unlink = function() {
      if (this._prev) {
          this._prev._next = this._next;
      } else if (this._parent) {
          this._parent._firstChild = this._next;
      }
      if (this._next) {
          this._next._prev = this._prev;
      } else if (this._parent) {
          this._parent._lastChild = this._prev;
      }
      this._parent = null;
      this._next = null;
      this._prev = null;
  };

  Node.prototype.insertAfter = function(sibling) {
      sibling.unlink();
      sibling._next = this._next;
      if (sibling._next) {
          sibling._next._prev = sibling;
      }
      sibling._prev = this;
      this._next = sibling;
      sibling._parent = this._parent;
      if (!sibling._next) {
          sibling._parent._lastChild = sibling;
      }
  };

  Node.prototype.insertBefore = function(sibling) {
      sibling.unlink();
      sibling._prev = this._prev;
      if (sibling._prev) {
          sibling._prev._next = sibling;
      }
      sibling._next = this;
      this._prev = sibling;
      sibling._parent = this._parent;
      if (!sibling._prev) {
          sibling._parent._firstChild = sibling;
      }
  };

  Node.prototype.walker = function() {
      var walker = new NodeWalker(this);
      return walker;
  };

  var node = Node;

  var encodeCache = {};


  // Create a lookup array where anything but characters in `chars` string
  // and alphanumeric chars is percent-encoded.
  //
  function getEncodeCache(exclude) {
    var i, ch, cache = encodeCache[exclude];
    if (cache) { return cache; }

    cache = encodeCache[exclude] = [];

    for (i = 0; i < 128; i++) {
      ch = String.fromCharCode(i);

      if (/^[0-9a-z]$/i.test(ch)) {
        // always allow unencoded alphanumeric characters
        cache.push(ch);
      } else {
        cache.push('%' + ('0' + i.toString(16).toUpperCase()).slice(-2));
      }
    }

    for (i = 0; i < exclude.length; i++) {
      cache[exclude.charCodeAt(i)] = exclude[i];
    }

    return cache;
  }


  // Encode unsafe characters with percent-encoding, skipping already
  // encoded sequences.
  //
  //  - string       - string to encode
  //  - exclude      - list of characters to ignore (in addition to a-zA-Z0-9)
  //  - keepEscaped  - don't encode '%' in a correct escape sequence (default: true)
  //
  function encode(string, exclude, keepEscaped) {
    var i, l, code, nextCode, cache,
        result = '';

    if (typeof exclude !== 'string') {
      // encode(string, keepEscaped)
      keepEscaped  = exclude;
      exclude = encode.defaultChars;
    }

    if (typeof keepEscaped === 'undefined') {
      keepEscaped = true;
    }

    cache = getEncodeCache(exclude);

    for (i = 0, l = string.length; i < l; i++) {
      code = string.charCodeAt(i);

      if (keepEscaped && code === 0x25 /* % */ && i + 2 < l) {
        if (/^[0-9a-f]{2}$/i.test(string.slice(i + 1, i + 3))) {
          result += string.slice(i, i + 3);
          i += 2;
          continue;
        }
      }

      if (code < 128) {
        result += cache[code];
        continue;
      }

      if (code >= 0xD800 && code <= 0xDFFF) {
        if (code >= 0xD800 && code <= 0xDBFF && i + 1 < l) {
          nextCode = string.charCodeAt(i + 1);
          if (nextCode >= 0xDC00 && nextCode <= 0xDFFF) {
            result += encodeURIComponent(string[i] + string[i + 1]);
            i++;
            continue;
          }
        }
        result += '%EF%BF%BD';
        continue;
      }

      result += encodeURIComponent(string[i]);
    }

    return result;
  }

  encode.defaultChars   = ";/?:@&=+$,-_.!~*'()#";
  encode.componentChars = "-_.!~*'()";


  var encode_1 = encode;

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  function getCjsExportFromNamespace (n) {
  	return n && n['default'] || n;
  }

  var amp = "&";
  var apos = "'";
  var gt = ">";
  var lt = "<";
  var quot = "\"";
  var xml = {
  	amp: amp,
  	apos: apos,
  	gt: gt,
  	lt: lt,
  	quot: quot
  };

  var xml$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    amp: amp,
    apos: apos,
    gt: gt,
    lt: lt,
    quot: quot,
    'default': xml
  });

  var Aacute = "Á";
  var aacute = "á";
  var Abreve = "Ă";
  var abreve = "ă";
  var ac = "∾";
  var acd = "∿";
  var acE = "∾̳";
  var Acirc = "Â";
  var acirc = "â";
  var acute = "´";
  var Acy = "А";
  var acy = "а";
  var AElig = "Æ";
  var aelig = "æ";
  var af = "⁡";
  var Afr = "𝔄";
  var afr = "𝔞";
  var Agrave = "À";
  var agrave = "à";
  var alefsym = "ℵ";
  var aleph = "ℵ";
  var Alpha = "Α";
  var alpha = "α";
  var Amacr = "Ā";
  var amacr = "ā";
  var amalg = "⨿";
  var amp$1 = "&";
  var AMP = "&";
  var andand = "⩕";
  var And = "⩓";
  var and = "∧";
  var andd = "⩜";
  var andslope = "⩘";
  var andv = "⩚";
  var ang = "∠";
  var ange = "⦤";
  var angle = "∠";
  var angmsdaa = "⦨";
  var angmsdab = "⦩";
  var angmsdac = "⦪";
  var angmsdad = "⦫";
  var angmsdae = "⦬";
  var angmsdaf = "⦭";
  var angmsdag = "⦮";
  var angmsdah = "⦯";
  var angmsd = "∡";
  var angrt = "∟";
  var angrtvb = "⊾";
  var angrtvbd = "⦝";
  var angsph = "∢";
  var angst = "Å";
  var angzarr = "⍼";
  var Aogon = "Ą";
  var aogon = "ą";
  var Aopf = "𝔸";
  var aopf = "𝕒";
  var apacir = "⩯";
  var ap = "≈";
  var apE = "⩰";
  var ape = "≊";
  var apid = "≋";
  var apos$1 = "'";
  var ApplyFunction = "⁡";
  var approx = "≈";
  var approxeq = "≊";
  var Aring = "Å";
  var aring = "å";
  var Ascr = "𝒜";
  var ascr = "𝒶";
  var Assign = "≔";
  var ast = "*";
  var asymp = "≈";
  var asympeq = "≍";
  var Atilde = "Ã";
  var atilde = "ã";
  var Auml = "Ä";
  var auml = "ä";
  var awconint = "∳";
  var awint = "⨑";
  var backcong = "≌";
  var backepsilon = "϶";
  var backprime = "‵";
  var backsim = "∽";
  var backsimeq = "⋍";
  var Backslash = "∖";
  var Barv = "⫧";
  var barvee = "⊽";
  var barwed = "⌅";
  var Barwed = "⌆";
  var barwedge = "⌅";
  var bbrk = "⎵";
  var bbrktbrk = "⎶";
  var bcong = "≌";
  var Bcy = "Б";
  var bcy = "б";
  var bdquo = "„";
  var becaus = "∵";
  var because = "∵";
  var Because = "∵";
  var bemptyv = "⦰";
  var bepsi = "϶";
  var bernou = "ℬ";
  var Bernoullis = "ℬ";
  var Beta = "Β";
  var beta = "β";
  var beth = "ℶ";
  var between = "≬";
  var Bfr = "𝔅";
  var bfr = "𝔟";
  var bigcap = "⋂";
  var bigcirc = "◯";
  var bigcup = "⋃";
  var bigodot = "⨀";
  var bigoplus = "⨁";
  var bigotimes = "⨂";
  var bigsqcup = "⨆";
  var bigstar = "★";
  var bigtriangledown = "▽";
  var bigtriangleup = "△";
  var biguplus = "⨄";
  var bigvee = "⋁";
  var bigwedge = "⋀";
  var bkarow = "⤍";
  var blacklozenge = "⧫";
  var blacksquare = "▪";
  var blacktriangle = "▴";
  var blacktriangledown = "▾";
  var blacktriangleleft = "◂";
  var blacktriangleright = "▸";
  var blank = "␣";
  var blk12 = "▒";
  var blk14 = "░";
  var blk34 = "▓";
  var block = "█";
  var bne = "=⃥";
  var bnequiv = "≡⃥";
  var bNot = "⫭";
  var bnot = "⌐";
  var Bopf = "𝔹";
  var bopf = "𝕓";
  var bot = "⊥";
  var bottom = "⊥";
  var bowtie = "⋈";
  var boxbox = "⧉";
  var boxdl = "┐";
  var boxdL = "╕";
  var boxDl = "╖";
  var boxDL = "╗";
  var boxdr = "┌";
  var boxdR = "╒";
  var boxDr = "╓";
  var boxDR = "╔";
  var boxh = "─";
  var boxH = "═";
  var boxhd = "┬";
  var boxHd = "╤";
  var boxhD = "╥";
  var boxHD = "╦";
  var boxhu = "┴";
  var boxHu = "╧";
  var boxhU = "╨";
  var boxHU = "╩";
  var boxminus = "⊟";
  var boxplus = "⊞";
  var boxtimes = "⊠";
  var boxul = "┘";
  var boxuL = "╛";
  var boxUl = "╜";
  var boxUL = "╝";
  var boxur = "└";
  var boxuR = "╘";
  var boxUr = "╙";
  var boxUR = "╚";
  var boxv = "│";
  var boxV = "║";
  var boxvh = "┼";
  var boxvH = "╪";
  var boxVh = "╫";
  var boxVH = "╬";
  var boxvl = "┤";
  var boxvL = "╡";
  var boxVl = "╢";
  var boxVL = "╣";
  var boxvr = "├";
  var boxvR = "╞";
  var boxVr = "╟";
  var boxVR = "╠";
  var bprime = "‵";
  var breve = "˘";
  var Breve = "˘";
  var brvbar = "¦";
  var bscr = "𝒷";
  var Bscr = "ℬ";
  var bsemi = "⁏";
  var bsim = "∽";
  var bsime = "⋍";
  var bsolb = "⧅";
  var bsol = "\\";
  var bsolhsub = "⟈";
  var bull = "•";
  var bullet = "•";
  var bump = "≎";
  var bumpE = "⪮";
  var bumpe = "≏";
  var Bumpeq = "≎";
  var bumpeq = "≏";
  var Cacute = "Ć";
  var cacute = "ć";
  var capand = "⩄";
  var capbrcup = "⩉";
  var capcap = "⩋";
  var cap = "∩";
  var Cap = "⋒";
  var capcup = "⩇";
  var capdot = "⩀";
  var CapitalDifferentialD = "ⅅ";
  var caps = "∩︀";
  var caret = "⁁";
  var caron = "ˇ";
  var Cayleys = "ℭ";
  var ccaps = "⩍";
  var Ccaron = "Č";
  var ccaron = "č";
  var Ccedil = "Ç";
  var ccedil = "ç";
  var Ccirc = "Ĉ";
  var ccirc = "ĉ";
  var Cconint = "∰";
  var ccups = "⩌";
  var ccupssm = "⩐";
  var Cdot = "Ċ";
  var cdot = "ċ";
  var cedil = "¸";
  var Cedilla = "¸";
  var cemptyv = "⦲";
  var cent = "¢";
  var centerdot = "·";
  var CenterDot = "·";
  var cfr = "𝔠";
  var Cfr = "ℭ";
  var CHcy = "Ч";
  var chcy = "ч";
  var check = "✓";
  var checkmark = "✓";
  var Chi = "Χ";
  var chi = "χ";
  var circ = "ˆ";
  var circeq = "≗";
  var circlearrowleft = "↺";
  var circlearrowright = "↻";
  var circledast = "⊛";
  var circledcirc = "⊚";
  var circleddash = "⊝";
  var CircleDot = "⊙";
  var circledR = "®";
  var circledS = "Ⓢ";
  var CircleMinus = "⊖";
  var CirclePlus = "⊕";
  var CircleTimes = "⊗";
  var cir = "○";
  var cirE = "⧃";
  var cire = "≗";
  var cirfnint = "⨐";
  var cirmid = "⫯";
  var cirscir = "⧂";
  var ClockwiseContourIntegral = "∲";
  var CloseCurlyDoubleQuote = "”";
  var CloseCurlyQuote = "’";
  var clubs = "♣";
  var clubsuit = "♣";
  var colon = ":";
  var Colon = "∷";
  var Colone = "⩴";
  var colone = "≔";
  var coloneq = "≔";
  var comma = ",";
  var commat = "@";
  var comp = "∁";
  var compfn = "∘";
  var complement = "∁";
  var complexes = "ℂ";
  var cong = "≅";
  var congdot = "⩭";
  var Congruent = "≡";
  var conint = "∮";
  var Conint = "∯";
  var ContourIntegral = "∮";
  var copf = "𝕔";
  var Copf = "ℂ";
  var coprod = "∐";
  var Coproduct = "∐";
  var copy = "©";
  var COPY = "©";
  var copysr = "℗";
  var CounterClockwiseContourIntegral = "∳";
  var crarr = "↵";
  var cross = "✗";
  var Cross = "⨯";
  var Cscr = "𝒞";
  var cscr = "𝒸";
  var csub = "⫏";
  var csube = "⫑";
  var csup = "⫐";
  var csupe = "⫒";
  var ctdot = "⋯";
  var cudarrl = "⤸";
  var cudarrr = "⤵";
  var cuepr = "⋞";
  var cuesc = "⋟";
  var cularr = "↶";
  var cularrp = "⤽";
  var cupbrcap = "⩈";
  var cupcap = "⩆";
  var CupCap = "≍";
  var cup = "∪";
  var Cup = "⋓";
  var cupcup = "⩊";
  var cupdot = "⊍";
  var cupor = "⩅";
  var cups = "∪︀";
  var curarr = "↷";
  var curarrm = "⤼";
  var curlyeqprec = "⋞";
  var curlyeqsucc = "⋟";
  var curlyvee = "⋎";
  var curlywedge = "⋏";
  var curren = "¤";
  var curvearrowleft = "↶";
  var curvearrowright = "↷";
  var cuvee = "⋎";
  var cuwed = "⋏";
  var cwconint = "∲";
  var cwint = "∱";
  var cylcty = "⌭";
  var dagger = "†";
  var Dagger = "‡";
  var daleth = "ℸ";
  var darr = "↓";
  var Darr = "↡";
  var dArr = "⇓";
  var dash = "‐";
  var Dashv = "⫤";
  var dashv = "⊣";
  var dbkarow = "⤏";
  var dblac = "˝";
  var Dcaron = "Ď";
  var dcaron = "ď";
  var Dcy = "Д";
  var dcy = "д";
  var ddagger = "‡";
  var ddarr = "⇊";
  var DD = "ⅅ";
  var dd = "ⅆ";
  var DDotrahd = "⤑";
  var ddotseq = "⩷";
  var deg = "°";
  var Del = "∇";
  var Delta = "Δ";
  var delta = "δ";
  var demptyv = "⦱";
  var dfisht = "⥿";
  var Dfr = "𝔇";
  var dfr = "𝔡";
  var dHar = "⥥";
  var dharl = "⇃";
  var dharr = "⇂";
  var DiacriticalAcute = "´";
  var DiacriticalDot = "˙";
  var DiacriticalDoubleAcute = "˝";
  var DiacriticalGrave = "`";
  var DiacriticalTilde = "˜";
  var diam = "⋄";
  var diamond = "⋄";
  var Diamond = "⋄";
  var diamondsuit = "♦";
  var diams = "♦";
  var die = "¨";
  var DifferentialD = "ⅆ";
  var digamma = "ϝ";
  var disin = "⋲";
  var div = "÷";
  var divide = "÷";
  var divideontimes = "⋇";
  var divonx = "⋇";
  var DJcy = "Ђ";
  var djcy = "ђ";
  var dlcorn = "⌞";
  var dlcrop = "⌍";
  var dollar = "$";
  var Dopf = "𝔻";
  var dopf = "𝕕";
  var Dot = "¨";
  var dot = "˙";
  var DotDot = "⃜";
  var doteq = "≐";
  var doteqdot = "≑";
  var DotEqual = "≐";
  var dotminus = "∸";
  var dotplus = "∔";
  var dotsquare = "⊡";
  var doublebarwedge = "⌆";
  var DoubleContourIntegral = "∯";
  var DoubleDot = "¨";
  var DoubleDownArrow = "⇓";
  var DoubleLeftArrow = "⇐";
  var DoubleLeftRightArrow = "⇔";
  var DoubleLeftTee = "⫤";
  var DoubleLongLeftArrow = "⟸";
  var DoubleLongLeftRightArrow = "⟺";
  var DoubleLongRightArrow = "⟹";
  var DoubleRightArrow = "⇒";
  var DoubleRightTee = "⊨";
  var DoubleUpArrow = "⇑";
  var DoubleUpDownArrow = "⇕";
  var DoubleVerticalBar = "∥";
  var DownArrowBar = "⤓";
  var downarrow = "↓";
  var DownArrow = "↓";
  var Downarrow = "⇓";
  var DownArrowUpArrow = "⇵";
  var DownBreve = "̑";
  var downdownarrows = "⇊";
  var downharpoonleft = "⇃";
  var downharpoonright = "⇂";
  var DownLeftRightVector = "⥐";
  var DownLeftTeeVector = "⥞";
  var DownLeftVectorBar = "⥖";
  var DownLeftVector = "↽";
  var DownRightTeeVector = "⥟";
  var DownRightVectorBar = "⥗";
  var DownRightVector = "⇁";
  var DownTeeArrow = "↧";
  var DownTee = "⊤";
  var drbkarow = "⤐";
  var drcorn = "⌟";
  var drcrop = "⌌";
  var Dscr = "𝒟";
  var dscr = "𝒹";
  var DScy = "Ѕ";
  var dscy = "ѕ";
  var dsol = "⧶";
  var Dstrok = "Đ";
  var dstrok = "đ";
  var dtdot = "⋱";
  var dtri = "▿";
  var dtrif = "▾";
  var duarr = "⇵";
  var duhar = "⥯";
  var dwangle = "⦦";
  var DZcy = "Џ";
  var dzcy = "џ";
  var dzigrarr = "⟿";
  var Eacute = "É";
  var eacute = "é";
  var easter = "⩮";
  var Ecaron = "Ě";
  var ecaron = "ě";
  var Ecirc = "Ê";
  var ecirc = "ê";
  var ecir = "≖";
  var ecolon = "≕";
  var Ecy = "Э";
  var ecy = "э";
  var eDDot = "⩷";
  var Edot = "Ė";
  var edot = "ė";
  var eDot = "≑";
  var ee = "ⅇ";
  var efDot = "≒";
  var Efr = "𝔈";
  var efr = "𝔢";
  var eg = "⪚";
  var Egrave = "È";
  var egrave = "è";
  var egs = "⪖";
  var egsdot = "⪘";
  var el = "⪙";
  var Element = "∈";
  var elinters = "⏧";
  var ell = "ℓ";
  var els = "⪕";
  var elsdot = "⪗";
  var Emacr = "Ē";
  var emacr = "ē";
  var empty$1 = "∅";
  var emptyset = "∅";
  var EmptySmallSquare = "◻";
  var emptyv = "∅";
  var EmptyVerySmallSquare = "▫";
  var emsp13 = " ";
  var emsp14 = " ";
  var emsp = " ";
  var ENG = "Ŋ";
  var eng = "ŋ";
  var ensp = " ";
  var Eogon = "Ę";
  var eogon = "ę";
  var Eopf = "𝔼";
  var eopf = "𝕖";
  var epar = "⋕";
  var eparsl = "⧣";
  var eplus = "⩱";
  var epsi = "ε";
  var Epsilon = "Ε";
  var epsilon = "ε";
  var epsiv = "ϵ";
  var eqcirc = "≖";
  var eqcolon = "≕";
  var eqsim = "≂";
  var eqslantgtr = "⪖";
  var eqslantless = "⪕";
  var Equal = "⩵";
  var equals = "=";
  var EqualTilde = "≂";
  var equest = "≟";
  var Equilibrium = "⇌";
  var equiv = "≡";
  var equivDD = "⩸";
  var eqvparsl = "⧥";
  var erarr = "⥱";
  var erDot = "≓";
  var escr = "ℯ";
  var Escr = "ℰ";
  var esdot = "≐";
  var Esim = "⩳";
  var esim = "≂";
  var Eta = "Η";
  var eta = "η";
  var ETH = "Ð";
  var eth = "ð";
  var Euml = "Ë";
  var euml = "ë";
  var euro = "€";
  var excl = "!";
  var exist = "∃";
  var Exists = "∃";
  var expectation = "ℰ";
  var exponentiale = "ⅇ";
  var ExponentialE = "ⅇ";
  var fallingdotseq = "≒";
  var Fcy = "Ф";
  var fcy = "ф";
  var female = "♀";
  var ffilig = "ﬃ";
  var fflig = "ﬀ";
  var ffllig = "ﬄ";
  var Ffr = "𝔉";
  var ffr = "𝔣";
  var filig = "ﬁ";
  var FilledSmallSquare = "◼";
  var FilledVerySmallSquare = "▪";
  var fjlig = "fj";
  var flat = "♭";
  var fllig = "ﬂ";
  var fltns = "▱";
  var fnof = "ƒ";
  var Fopf = "𝔽";
  var fopf = "𝕗";
  var forall = "∀";
  var ForAll = "∀";
  var fork = "⋔";
  var forkv = "⫙";
  var Fouriertrf = "ℱ";
  var fpartint = "⨍";
  var frac12 = "½";
  var frac13 = "⅓";
  var frac14 = "¼";
  var frac15 = "⅕";
  var frac16 = "⅙";
  var frac18 = "⅛";
  var frac23 = "⅔";
  var frac25 = "⅖";
  var frac34 = "¾";
  var frac35 = "⅗";
  var frac38 = "⅜";
  var frac45 = "⅘";
  var frac56 = "⅚";
  var frac58 = "⅝";
  var frac78 = "⅞";
  var frasl = "⁄";
  var frown = "⌢";
  var fscr = "𝒻";
  var Fscr = "ℱ";
  var gacute = "ǵ";
  var Gamma = "Γ";
  var gamma = "γ";
  var Gammad = "Ϝ";
  var gammad = "ϝ";
  var gap = "⪆";
  var Gbreve = "Ğ";
  var gbreve = "ğ";
  var Gcedil = "Ģ";
  var Gcirc = "Ĝ";
  var gcirc = "ĝ";
  var Gcy = "Г";
  var gcy = "г";
  var Gdot = "Ġ";
  var gdot = "ġ";
  var ge = "≥";
  var gE = "≧";
  var gEl = "⪌";
  var gel = "⋛";
  var geq = "≥";
  var geqq = "≧";
  var geqslant = "⩾";
  var gescc = "⪩";
  var ges = "⩾";
  var gesdot = "⪀";
  var gesdoto = "⪂";
  var gesdotol = "⪄";
  var gesl = "⋛︀";
  var gesles = "⪔";
  var Gfr = "𝔊";
  var gfr = "𝔤";
  var gg = "≫";
  var Gg = "⋙";
  var ggg = "⋙";
  var gimel = "ℷ";
  var GJcy = "Ѓ";
  var gjcy = "ѓ";
  var gla = "⪥";
  var gl = "≷";
  var glE = "⪒";
  var glj = "⪤";
  var gnap = "⪊";
  var gnapprox = "⪊";
  var gne = "⪈";
  var gnE = "≩";
  var gneq = "⪈";
  var gneqq = "≩";
  var gnsim = "⋧";
  var Gopf = "𝔾";
  var gopf = "𝕘";
  var grave = "`";
  var GreaterEqual = "≥";
  var GreaterEqualLess = "⋛";
  var GreaterFullEqual = "≧";
  var GreaterGreater = "⪢";
  var GreaterLess = "≷";
  var GreaterSlantEqual = "⩾";
  var GreaterTilde = "≳";
  var Gscr = "𝒢";
  var gscr = "ℊ";
  var gsim = "≳";
  var gsime = "⪎";
  var gsiml = "⪐";
  var gtcc = "⪧";
  var gtcir = "⩺";
  var gt$1 = ">";
  var GT = ">";
  var Gt = "≫";
  var gtdot = "⋗";
  var gtlPar = "⦕";
  var gtquest = "⩼";
  var gtrapprox = "⪆";
  var gtrarr = "⥸";
  var gtrdot = "⋗";
  var gtreqless = "⋛";
  var gtreqqless = "⪌";
  var gtrless = "≷";
  var gtrsim = "≳";
  var gvertneqq = "≩︀";
  var gvnE = "≩︀";
  var Hacek = "ˇ";
  var hairsp = " ";
  var half = "½";
  var hamilt = "ℋ";
  var HARDcy = "Ъ";
  var hardcy = "ъ";
  var harrcir = "⥈";
  var harr = "↔";
  var hArr = "⇔";
  var harrw = "↭";
  var Hat = "^";
  var hbar = "ℏ";
  var Hcirc = "Ĥ";
  var hcirc = "ĥ";
  var hearts = "♥";
  var heartsuit = "♥";
  var hellip = "…";
  var hercon = "⊹";
  var hfr = "𝔥";
  var Hfr = "ℌ";
  var HilbertSpace = "ℋ";
  var hksearow = "⤥";
  var hkswarow = "⤦";
  var hoarr = "⇿";
  var homtht = "∻";
  var hookleftarrow = "↩";
  var hookrightarrow = "↪";
  var hopf = "𝕙";
  var Hopf = "ℍ";
  var horbar = "―";
  var HorizontalLine = "─";
  var hscr = "𝒽";
  var Hscr = "ℋ";
  var hslash = "ℏ";
  var Hstrok = "Ħ";
  var hstrok = "ħ";
  var HumpDownHump = "≎";
  var HumpEqual = "≏";
  var hybull = "⁃";
  var hyphen = "‐";
  var Iacute = "Í";
  var iacute = "í";
  var ic = "⁣";
  var Icirc = "Î";
  var icirc = "î";
  var Icy = "И";
  var icy = "и";
  var Idot = "İ";
  var IEcy = "Е";
  var iecy = "е";
  var iexcl = "¡";
  var iff = "⇔";
  var ifr = "𝔦";
  var Ifr = "ℑ";
  var Igrave = "Ì";
  var igrave = "ì";
  var ii = "ⅈ";
  var iiiint = "⨌";
  var iiint = "∭";
  var iinfin = "⧜";
  var iiota = "℩";
  var IJlig = "Ĳ";
  var ijlig = "ĳ";
  var Imacr = "Ī";
  var imacr = "ī";
  var image = "ℑ";
  var ImaginaryI = "ⅈ";
  var imagline = "ℐ";
  var imagpart = "ℑ";
  var imath = "ı";
  var Im = "ℑ";
  var imof = "⊷";
  var imped = "Ƶ";
  var Implies = "⇒";
  var incare = "℅";
  var infin = "∞";
  var infintie = "⧝";
  var inodot = "ı";
  var intcal = "⊺";
  var int = "∫";
  var Int = "∬";
  var integers = "ℤ";
  var Integral = "∫";
  var intercal = "⊺";
  var Intersection = "⋂";
  var intlarhk = "⨗";
  var intprod = "⨼";
  var InvisibleComma = "⁣";
  var InvisibleTimes = "⁢";
  var IOcy = "Ё";
  var iocy = "ё";
  var Iogon = "Į";
  var iogon = "į";
  var Iopf = "𝕀";
  var iopf = "𝕚";
  var Iota = "Ι";
  var iota = "ι";
  var iprod = "⨼";
  var iquest = "¿";
  var iscr = "𝒾";
  var Iscr = "ℐ";
  var isin = "∈";
  var isindot = "⋵";
  var isinE = "⋹";
  var isins = "⋴";
  var isinsv = "⋳";
  var isinv = "∈";
  var it = "⁢";
  var Itilde = "Ĩ";
  var itilde = "ĩ";
  var Iukcy = "І";
  var iukcy = "і";
  var Iuml = "Ï";
  var iuml = "ï";
  var Jcirc = "Ĵ";
  var jcirc = "ĵ";
  var Jcy = "Й";
  var jcy = "й";
  var Jfr = "𝔍";
  var jfr = "𝔧";
  var jmath = "ȷ";
  var Jopf = "𝕁";
  var jopf = "𝕛";
  var Jscr = "𝒥";
  var jscr = "𝒿";
  var Jsercy = "Ј";
  var jsercy = "ј";
  var Jukcy = "Є";
  var jukcy = "є";
  var Kappa = "Κ";
  var kappa = "κ";
  var kappav = "ϰ";
  var Kcedil = "Ķ";
  var kcedil = "ķ";
  var Kcy = "К";
  var kcy = "к";
  var Kfr = "𝔎";
  var kfr = "𝔨";
  var kgreen = "ĸ";
  var KHcy = "Х";
  var khcy = "х";
  var KJcy = "Ќ";
  var kjcy = "ќ";
  var Kopf = "𝕂";
  var kopf = "𝕜";
  var Kscr = "𝒦";
  var kscr = "𝓀";
  var lAarr = "⇚";
  var Lacute = "Ĺ";
  var lacute = "ĺ";
  var laemptyv = "⦴";
  var lagran = "ℒ";
  var Lambda = "Λ";
  var lambda = "λ";
  var lang = "⟨";
  var Lang = "⟪";
  var langd = "⦑";
  var langle = "⟨";
  var lap = "⪅";
  var Laplacetrf = "ℒ";
  var laquo = "«";
  var larrb = "⇤";
  var larrbfs = "⤟";
  var larr = "←";
  var Larr = "↞";
  var lArr = "⇐";
  var larrfs = "⤝";
  var larrhk = "↩";
  var larrlp = "↫";
  var larrpl = "⤹";
  var larrsim = "⥳";
  var larrtl = "↢";
  var latail = "⤙";
  var lAtail = "⤛";
  var lat = "⪫";
  var late = "⪭";
  var lates = "⪭︀";
  var lbarr = "⤌";
  var lBarr = "⤎";
  var lbbrk = "❲";
  var lbrace = "{";
  var lbrack = "[";
  var lbrke = "⦋";
  var lbrksld = "⦏";
  var lbrkslu = "⦍";
  var Lcaron = "Ľ";
  var lcaron = "ľ";
  var Lcedil = "Ļ";
  var lcedil = "ļ";
  var lceil = "⌈";
  var lcub = "{";
  var Lcy = "Л";
  var lcy = "л";
  var ldca = "⤶";
  var ldquo = "“";
  var ldquor = "„";
  var ldrdhar = "⥧";
  var ldrushar = "⥋";
  var ldsh = "↲";
  var le = "≤";
  var lE = "≦";
  var LeftAngleBracket = "⟨";
  var LeftArrowBar = "⇤";
  var leftarrow = "←";
  var LeftArrow = "←";
  var Leftarrow = "⇐";
  var LeftArrowRightArrow = "⇆";
  var leftarrowtail = "↢";
  var LeftCeiling = "⌈";
  var LeftDoubleBracket = "⟦";
  var LeftDownTeeVector = "⥡";
  var LeftDownVectorBar = "⥙";
  var LeftDownVector = "⇃";
  var LeftFloor = "⌊";
  var leftharpoondown = "↽";
  var leftharpoonup = "↼";
  var leftleftarrows = "⇇";
  var leftrightarrow = "↔";
  var LeftRightArrow = "↔";
  var Leftrightarrow = "⇔";
  var leftrightarrows = "⇆";
  var leftrightharpoons = "⇋";
  var leftrightsquigarrow = "↭";
  var LeftRightVector = "⥎";
  var LeftTeeArrow = "↤";
  var LeftTee = "⊣";
  var LeftTeeVector = "⥚";
  var leftthreetimes = "⋋";
  var LeftTriangleBar = "⧏";
  var LeftTriangle = "⊲";
  var LeftTriangleEqual = "⊴";
  var LeftUpDownVector = "⥑";
  var LeftUpTeeVector = "⥠";
  var LeftUpVectorBar = "⥘";
  var LeftUpVector = "↿";
  var LeftVectorBar = "⥒";
  var LeftVector = "↼";
  var lEg = "⪋";
  var leg = "⋚";
  var leq = "≤";
  var leqq = "≦";
  var leqslant = "⩽";
  var lescc = "⪨";
  var les = "⩽";
  var lesdot = "⩿";
  var lesdoto = "⪁";
  var lesdotor = "⪃";
  var lesg = "⋚︀";
  var lesges = "⪓";
  var lessapprox = "⪅";
  var lessdot = "⋖";
  var lesseqgtr = "⋚";
  var lesseqqgtr = "⪋";
  var LessEqualGreater = "⋚";
  var LessFullEqual = "≦";
  var LessGreater = "≶";
  var lessgtr = "≶";
  var LessLess = "⪡";
  var lesssim = "≲";
  var LessSlantEqual = "⩽";
  var LessTilde = "≲";
  var lfisht = "⥼";
  var lfloor = "⌊";
  var Lfr = "𝔏";
  var lfr = "𝔩";
  var lg = "≶";
  var lgE = "⪑";
  var lHar = "⥢";
  var lhard = "↽";
  var lharu = "↼";
  var lharul = "⥪";
  var lhblk = "▄";
  var LJcy = "Љ";
  var ljcy = "љ";
  var llarr = "⇇";
  var ll = "≪";
  var Ll = "⋘";
  var llcorner = "⌞";
  var Lleftarrow = "⇚";
  var llhard = "⥫";
  var lltri = "◺";
  var Lmidot = "Ŀ";
  var lmidot = "ŀ";
  var lmoustache = "⎰";
  var lmoust = "⎰";
  var lnap = "⪉";
  var lnapprox = "⪉";
  var lne = "⪇";
  var lnE = "≨";
  var lneq = "⪇";
  var lneqq = "≨";
  var lnsim = "⋦";
  var loang = "⟬";
  var loarr = "⇽";
  var lobrk = "⟦";
  var longleftarrow = "⟵";
  var LongLeftArrow = "⟵";
  var Longleftarrow = "⟸";
  var longleftrightarrow = "⟷";
  var LongLeftRightArrow = "⟷";
  var Longleftrightarrow = "⟺";
  var longmapsto = "⟼";
  var longrightarrow = "⟶";
  var LongRightArrow = "⟶";
  var Longrightarrow = "⟹";
  var looparrowleft = "↫";
  var looparrowright = "↬";
  var lopar = "⦅";
  var Lopf = "𝕃";
  var lopf = "𝕝";
  var loplus = "⨭";
  var lotimes = "⨴";
  var lowast = "∗";
  var lowbar = "_";
  var LowerLeftArrow = "↙";
  var LowerRightArrow = "↘";
  var loz = "◊";
  var lozenge = "◊";
  var lozf = "⧫";
  var lpar = "(";
  var lparlt = "⦓";
  var lrarr = "⇆";
  var lrcorner = "⌟";
  var lrhar = "⇋";
  var lrhard = "⥭";
  var lrm = "‎";
  var lrtri = "⊿";
  var lsaquo = "‹";
  var lscr = "𝓁";
  var Lscr = "ℒ";
  var lsh = "↰";
  var Lsh = "↰";
  var lsim = "≲";
  var lsime = "⪍";
  var lsimg = "⪏";
  var lsqb = "[";
  var lsquo = "‘";
  var lsquor = "‚";
  var Lstrok = "Ł";
  var lstrok = "ł";
  var ltcc = "⪦";
  var ltcir = "⩹";
  var lt$1 = "<";
  var LT = "<";
  var Lt = "≪";
  var ltdot = "⋖";
  var lthree = "⋋";
  var ltimes = "⋉";
  var ltlarr = "⥶";
  var ltquest = "⩻";
  var ltri = "◃";
  var ltrie = "⊴";
  var ltrif = "◂";
  var ltrPar = "⦖";
  var lurdshar = "⥊";
  var luruhar = "⥦";
  var lvertneqq = "≨︀";
  var lvnE = "≨︀";
  var macr = "¯";
  var male = "♂";
  var malt = "✠";
  var maltese = "✠";
  var map = "↦";
  var mapsto = "↦";
  var mapstodown = "↧";
  var mapstoleft = "↤";
  var mapstoup = "↥";
  var marker = "▮";
  var mcomma = "⨩";
  var Mcy = "М";
  var mcy = "м";
  var mdash = "—";
  var mDDot = "∺";
  var measuredangle = "∡";
  var MediumSpace = " ";
  var Mellintrf = "ℳ";
  var Mfr = "𝔐";
  var mfr = "𝔪";
  var mho = "℧";
  var micro = "µ";
  var midast = "*";
  var midcir = "⫰";
  var mid = "∣";
  var middot = "·";
  var minusb = "⊟";
  var minus = "−";
  var minusd = "∸";
  var minusdu = "⨪";
  var MinusPlus = "∓";
  var mlcp = "⫛";
  var mldr = "…";
  var mnplus = "∓";
  var models = "⊧";
  var Mopf = "𝕄";
  var mopf = "𝕞";
  var mp = "∓";
  var mscr = "𝓂";
  var Mscr = "ℳ";
  var mstpos = "∾";
  var Mu = "Μ";
  var mu = "μ";
  var multimap = "⊸";
  var mumap = "⊸";
  var nabla = "∇";
  var Nacute = "Ń";
  var nacute = "ń";
  var nang = "∠⃒";
  var nap = "≉";
  var napE = "⩰̸";
  var napid = "≋̸";
  var napos = "ŉ";
  var napprox = "≉";
  var natural = "♮";
  var naturals = "ℕ";
  var natur = "♮";
  var nbsp = " ";
  var nbump = "≎̸";
  var nbumpe = "≏̸";
  var ncap = "⩃";
  var Ncaron = "Ň";
  var ncaron = "ň";
  var Ncedil = "Ņ";
  var ncedil = "ņ";
  var ncong = "≇";
  var ncongdot = "⩭̸";
  var ncup = "⩂";
  var Ncy = "Н";
  var ncy = "н";
  var ndash = "–";
  var nearhk = "⤤";
  var nearr = "↗";
  var neArr = "⇗";
  var nearrow = "↗";
  var ne = "≠";
  var nedot = "≐̸";
  var NegativeMediumSpace = "​";
  var NegativeThickSpace = "​";
  var NegativeThinSpace = "​";
  var NegativeVeryThinSpace = "​";
  var nequiv = "≢";
  var nesear = "⤨";
  var nesim = "≂̸";
  var NestedGreaterGreater = "≫";
  var NestedLessLess = "≪";
  var NewLine = "\n";
  var nexist = "∄";
  var nexists = "∄";
  var Nfr = "𝔑";
  var nfr = "𝔫";
  var ngE = "≧̸";
  var nge = "≱";
  var ngeq = "≱";
  var ngeqq = "≧̸";
  var ngeqslant = "⩾̸";
  var nges = "⩾̸";
  var nGg = "⋙̸";
  var ngsim = "≵";
  var nGt = "≫⃒";
  var ngt = "≯";
  var ngtr = "≯";
  var nGtv = "≫̸";
  var nharr = "↮";
  var nhArr = "⇎";
  var nhpar = "⫲";
  var ni = "∋";
  var nis = "⋼";
  var nisd = "⋺";
  var niv = "∋";
  var NJcy = "Њ";
  var njcy = "њ";
  var nlarr = "↚";
  var nlArr = "⇍";
  var nldr = "‥";
  var nlE = "≦̸";
  var nle = "≰";
  var nleftarrow = "↚";
  var nLeftarrow = "⇍";
  var nleftrightarrow = "↮";
  var nLeftrightarrow = "⇎";
  var nleq = "≰";
  var nleqq = "≦̸";
  var nleqslant = "⩽̸";
  var nles = "⩽̸";
  var nless = "≮";
  var nLl = "⋘̸";
  var nlsim = "≴";
  var nLt = "≪⃒";
  var nlt = "≮";
  var nltri = "⋪";
  var nltrie = "⋬";
  var nLtv = "≪̸";
  var nmid = "∤";
  var NoBreak = "⁠";
  var NonBreakingSpace = " ";
  var nopf = "𝕟";
  var Nopf = "ℕ";
  var Not = "⫬";
  var not = "¬";
  var NotCongruent = "≢";
  var NotCupCap = "≭";
  var NotDoubleVerticalBar = "∦";
  var NotElement = "∉";
  var NotEqual = "≠";
  var NotEqualTilde = "≂̸";
  var NotExists = "∄";
  var NotGreater = "≯";
  var NotGreaterEqual = "≱";
  var NotGreaterFullEqual = "≧̸";
  var NotGreaterGreater = "≫̸";
  var NotGreaterLess = "≹";
  var NotGreaterSlantEqual = "⩾̸";
  var NotGreaterTilde = "≵";
  var NotHumpDownHump = "≎̸";
  var NotHumpEqual = "≏̸";
  var notin = "∉";
  var notindot = "⋵̸";
  var notinE = "⋹̸";
  var notinva = "∉";
  var notinvb = "⋷";
  var notinvc = "⋶";
  var NotLeftTriangleBar = "⧏̸";
  var NotLeftTriangle = "⋪";
  var NotLeftTriangleEqual = "⋬";
  var NotLess = "≮";
  var NotLessEqual = "≰";
  var NotLessGreater = "≸";
  var NotLessLess = "≪̸";
  var NotLessSlantEqual = "⩽̸";
  var NotLessTilde = "≴";
  var NotNestedGreaterGreater = "⪢̸";
  var NotNestedLessLess = "⪡̸";
  var notni = "∌";
  var notniva = "∌";
  var notnivb = "⋾";
  var notnivc = "⋽";
  var NotPrecedes = "⊀";
  var NotPrecedesEqual = "⪯̸";
  var NotPrecedesSlantEqual = "⋠";
  var NotReverseElement = "∌";
  var NotRightTriangleBar = "⧐̸";
  var NotRightTriangle = "⋫";
  var NotRightTriangleEqual = "⋭";
  var NotSquareSubset = "⊏̸";
  var NotSquareSubsetEqual = "⋢";
  var NotSquareSuperset = "⊐̸";
  var NotSquareSupersetEqual = "⋣";
  var NotSubset = "⊂⃒";
  var NotSubsetEqual = "⊈";
  var NotSucceeds = "⊁";
  var NotSucceedsEqual = "⪰̸";
  var NotSucceedsSlantEqual = "⋡";
  var NotSucceedsTilde = "≿̸";
  var NotSuperset = "⊃⃒";
  var NotSupersetEqual = "⊉";
  var NotTilde = "≁";
  var NotTildeEqual = "≄";
  var NotTildeFullEqual = "≇";
  var NotTildeTilde = "≉";
  var NotVerticalBar = "∤";
  var nparallel = "∦";
  var npar = "∦";
  var nparsl = "⫽⃥";
  var npart = "∂̸";
  var npolint = "⨔";
  var npr = "⊀";
  var nprcue = "⋠";
  var nprec = "⊀";
  var npreceq = "⪯̸";
  var npre = "⪯̸";
  var nrarrc = "⤳̸";
  var nrarr = "↛";
  var nrArr = "⇏";
  var nrarrw = "↝̸";
  var nrightarrow = "↛";
  var nRightarrow = "⇏";
  var nrtri = "⋫";
  var nrtrie = "⋭";
  var nsc = "⊁";
  var nsccue = "⋡";
  var nsce = "⪰̸";
  var Nscr = "𝒩";
  var nscr = "𝓃";
  var nshortmid = "∤";
  var nshortparallel = "∦";
  var nsim = "≁";
  var nsime = "≄";
  var nsimeq = "≄";
  var nsmid = "∤";
  var nspar = "∦";
  var nsqsube = "⋢";
  var nsqsupe = "⋣";
  var nsub = "⊄";
  var nsubE = "⫅̸";
  var nsube = "⊈";
  var nsubset = "⊂⃒";
  var nsubseteq = "⊈";
  var nsubseteqq = "⫅̸";
  var nsucc = "⊁";
  var nsucceq = "⪰̸";
  var nsup = "⊅";
  var nsupE = "⫆̸";
  var nsupe = "⊉";
  var nsupset = "⊃⃒";
  var nsupseteq = "⊉";
  var nsupseteqq = "⫆̸";
  var ntgl = "≹";
  var Ntilde = "Ñ";
  var ntilde = "ñ";
  var ntlg = "≸";
  var ntriangleleft = "⋪";
  var ntrianglelefteq = "⋬";
  var ntriangleright = "⋫";
  var ntrianglerighteq = "⋭";
  var Nu = "Ν";
  var nu = "ν";
  var num = "#";
  var numero = "№";
  var numsp = " ";
  var nvap = "≍⃒";
  var nvdash = "⊬";
  var nvDash = "⊭";
  var nVdash = "⊮";
  var nVDash = "⊯";
  var nvge = "≥⃒";
  var nvgt = ">⃒";
  var nvHarr = "⤄";
  var nvinfin = "⧞";
  var nvlArr = "⤂";
  var nvle = "≤⃒";
  var nvlt = "<⃒";
  var nvltrie = "⊴⃒";
  var nvrArr = "⤃";
  var nvrtrie = "⊵⃒";
  var nvsim = "∼⃒";
  var nwarhk = "⤣";
  var nwarr = "↖";
  var nwArr = "⇖";
  var nwarrow = "↖";
  var nwnear = "⤧";
  var Oacute = "Ó";
  var oacute = "ó";
  var oast = "⊛";
  var Ocirc = "Ô";
  var ocirc = "ô";
  var ocir = "⊚";
  var Ocy = "О";
  var ocy = "о";
  var odash = "⊝";
  var Odblac = "Ő";
  var odblac = "ő";
  var odiv = "⨸";
  var odot = "⊙";
  var odsold = "⦼";
  var OElig = "Œ";
  var oelig = "œ";
  var ofcir = "⦿";
  var Ofr = "𝔒";
  var ofr = "𝔬";
  var ogon = "˛";
  var Ograve = "Ò";
  var ograve = "ò";
  var ogt = "⧁";
  var ohbar = "⦵";
  var ohm = "Ω";
  var oint = "∮";
  var olarr = "↺";
  var olcir = "⦾";
  var olcross = "⦻";
  var oline = "‾";
  var olt = "⧀";
  var Omacr = "Ō";
  var omacr = "ō";
  var Omega = "Ω";
  var omega = "ω";
  var Omicron = "Ο";
  var omicron = "ο";
  var omid = "⦶";
  var ominus = "⊖";
  var Oopf = "𝕆";
  var oopf = "𝕠";
  var opar = "⦷";
  var OpenCurlyDoubleQuote = "“";
  var OpenCurlyQuote = "‘";
  var operp = "⦹";
  var oplus = "⊕";
  var orarr = "↻";
  var Or = "⩔";
  var or = "∨";
  var ord = "⩝";
  var order = "ℴ";
  var orderof = "ℴ";
  var ordf = "ª";
  var ordm = "º";
  var origof = "⊶";
  var oror = "⩖";
  var orslope = "⩗";
  var orv = "⩛";
  var oS = "Ⓢ";
  var Oscr = "𝒪";
  var oscr = "ℴ";
  var Oslash = "Ø";
  var oslash = "ø";
  var osol = "⊘";
  var Otilde = "Õ";
  var otilde = "õ";
  var otimesas = "⨶";
  var Otimes = "⨷";
  var otimes = "⊗";
  var Ouml = "Ö";
  var ouml = "ö";
  var ovbar = "⌽";
  var OverBar = "‾";
  var OverBrace = "⏞";
  var OverBracket = "⎴";
  var OverParenthesis = "⏜";
  var para = "¶";
  var parallel = "∥";
  var par = "∥";
  var parsim = "⫳";
  var parsl = "⫽";
  var part = "∂";
  var PartialD = "∂";
  var Pcy = "П";
  var pcy = "п";
  var percnt = "%";
  var period = ".";
  var permil = "‰";
  var perp = "⊥";
  var pertenk = "‱";
  var Pfr = "𝔓";
  var pfr = "𝔭";
  var Phi = "Φ";
  var phi = "φ";
  var phiv = "ϕ";
  var phmmat = "ℳ";
  var phone = "☎";
  var Pi = "Π";
  var pi = "π";
  var pitchfork = "⋔";
  var piv = "ϖ";
  var planck = "ℏ";
  var planckh = "ℎ";
  var plankv = "ℏ";
  var plusacir = "⨣";
  var plusb = "⊞";
  var pluscir = "⨢";
  var plus = "+";
  var plusdo = "∔";
  var plusdu = "⨥";
  var pluse = "⩲";
  var PlusMinus = "±";
  var plusmn = "±";
  var plussim = "⨦";
  var plustwo = "⨧";
  var pm = "±";
  var Poincareplane = "ℌ";
  var pointint = "⨕";
  var popf = "𝕡";
  var Popf = "ℙ";
  var pound = "£";
  var prap = "⪷";
  var Pr = "⪻";
  var pr = "≺";
  var prcue = "≼";
  var precapprox = "⪷";
  var prec = "≺";
  var preccurlyeq = "≼";
  var Precedes = "≺";
  var PrecedesEqual = "⪯";
  var PrecedesSlantEqual = "≼";
  var PrecedesTilde = "≾";
  var preceq = "⪯";
  var precnapprox = "⪹";
  var precneqq = "⪵";
  var precnsim = "⋨";
  var pre = "⪯";
  var prE = "⪳";
  var precsim = "≾";
  var prime = "′";
  var Prime = "″";
  var primes = "ℙ";
  var prnap = "⪹";
  var prnE = "⪵";
  var prnsim = "⋨";
  var prod = "∏";
  var Product = "∏";
  var profalar = "⌮";
  var profline = "⌒";
  var profsurf = "⌓";
  var prop = "∝";
  var Proportional = "∝";
  var Proportion = "∷";
  var propto = "∝";
  var prsim = "≾";
  var prurel = "⊰";
  var Pscr = "𝒫";
  var pscr = "𝓅";
  var Psi = "Ψ";
  var psi = "ψ";
  var puncsp = " ";
  var Qfr = "𝔔";
  var qfr = "𝔮";
  var qint = "⨌";
  var qopf = "𝕢";
  var Qopf = "ℚ";
  var qprime = "⁗";
  var Qscr = "𝒬";
  var qscr = "𝓆";
  var quaternions = "ℍ";
  var quatint = "⨖";
  var quest = "?";
  var questeq = "≟";
  var quot$1 = "\"";
  var QUOT = "\"";
  var rAarr = "⇛";
  var race = "∽̱";
  var Racute = "Ŕ";
  var racute = "ŕ";
  var radic = "√";
  var raemptyv = "⦳";
  var rang = "⟩";
  var Rang = "⟫";
  var rangd = "⦒";
  var range = "⦥";
  var rangle = "⟩";
  var raquo = "»";
  var rarrap = "⥵";
  var rarrb = "⇥";
  var rarrbfs = "⤠";
  var rarrc = "⤳";
  var rarr = "→";
  var Rarr = "↠";
  var rArr = "⇒";
  var rarrfs = "⤞";
  var rarrhk = "↪";
  var rarrlp = "↬";
  var rarrpl = "⥅";
  var rarrsim = "⥴";
  var Rarrtl = "⤖";
  var rarrtl = "↣";
  var rarrw = "↝";
  var ratail = "⤚";
  var rAtail = "⤜";
  var ratio = "∶";
  var rationals = "ℚ";
  var rbarr = "⤍";
  var rBarr = "⤏";
  var RBarr = "⤐";
  var rbbrk = "❳";
  var rbrace = "}";
  var rbrack = "]";
  var rbrke = "⦌";
  var rbrksld = "⦎";
  var rbrkslu = "⦐";
  var Rcaron = "Ř";
  var rcaron = "ř";
  var Rcedil = "Ŗ";
  var rcedil = "ŗ";
  var rceil = "⌉";
  var rcub = "}";
  var Rcy = "Р";
  var rcy = "р";
  var rdca = "⤷";
  var rdldhar = "⥩";
  var rdquo = "”";
  var rdquor = "”";
  var rdsh = "↳";
  var real = "ℜ";
  var realine = "ℛ";
  var realpart = "ℜ";
  var reals = "ℝ";
  var Re = "ℜ";
  var rect = "▭";
  var reg = "®";
  var REG = "®";
  var ReverseElement = "∋";
  var ReverseEquilibrium = "⇋";
  var ReverseUpEquilibrium = "⥯";
  var rfisht = "⥽";
  var rfloor = "⌋";
  var rfr = "𝔯";
  var Rfr = "ℜ";
  var rHar = "⥤";
  var rhard = "⇁";
  var rharu = "⇀";
  var rharul = "⥬";
  var Rho = "Ρ";
  var rho = "ρ";
  var rhov = "ϱ";
  var RightAngleBracket = "⟩";
  var RightArrowBar = "⇥";
  var rightarrow = "→";
  var RightArrow = "→";
  var Rightarrow = "⇒";
  var RightArrowLeftArrow = "⇄";
  var rightarrowtail = "↣";
  var RightCeiling = "⌉";
  var RightDoubleBracket = "⟧";
  var RightDownTeeVector = "⥝";
  var RightDownVectorBar = "⥕";
  var RightDownVector = "⇂";
  var RightFloor = "⌋";
  var rightharpoondown = "⇁";
  var rightharpoonup = "⇀";
  var rightleftarrows = "⇄";
  var rightleftharpoons = "⇌";
  var rightrightarrows = "⇉";
  var rightsquigarrow = "↝";
  var RightTeeArrow = "↦";
  var RightTee = "⊢";
  var RightTeeVector = "⥛";
  var rightthreetimes = "⋌";
  var RightTriangleBar = "⧐";
  var RightTriangle = "⊳";
  var RightTriangleEqual = "⊵";
  var RightUpDownVector = "⥏";
  var RightUpTeeVector = "⥜";
  var RightUpVectorBar = "⥔";
  var RightUpVector = "↾";
  var RightVectorBar = "⥓";
  var RightVector = "⇀";
  var ring = "˚";
  var risingdotseq = "≓";
  var rlarr = "⇄";
  var rlhar = "⇌";
  var rlm = "‏";
  var rmoustache = "⎱";
  var rmoust = "⎱";
  var rnmid = "⫮";
  var roang = "⟭";
  var roarr = "⇾";
  var robrk = "⟧";
  var ropar = "⦆";
  var ropf = "𝕣";
  var Ropf = "ℝ";
  var roplus = "⨮";
  var rotimes = "⨵";
  var RoundImplies = "⥰";
  var rpar = ")";
  var rpargt = "⦔";
  var rppolint = "⨒";
  var rrarr = "⇉";
  var Rrightarrow = "⇛";
  var rsaquo = "›";
  var rscr = "𝓇";
  var Rscr = "ℛ";
  var rsh = "↱";
  var Rsh = "↱";
  var rsqb = "]";
  var rsquo = "’";
  var rsquor = "’";
  var rthree = "⋌";
  var rtimes = "⋊";
  var rtri = "▹";
  var rtrie = "⊵";
  var rtrif = "▸";
  var rtriltri = "⧎";
  var RuleDelayed = "⧴";
  var ruluhar = "⥨";
  var rx = "℞";
  var Sacute = "Ś";
  var sacute = "ś";
  var sbquo = "‚";
  var scap = "⪸";
  var Scaron = "Š";
  var scaron = "š";
  var Sc = "⪼";
  var sc = "≻";
  var sccue = "≽";
  var sce = "⪰";
  var scE = "⪴";
  var Scedil = "Ş";
  var scedil = "ş";
  var Scirc = "Ŝ";
  var scirc = "ŝ";
  var scnap = "⪺";
  var scnE = "⪶";
  var scnsim = "⋩";
  var scpolint = "⨓";
  var scsim = "≿";
  var Scy = "С";
  var scy = "с";
  var sdotb = "⊡";
  var sdot = "⋅";
  var sdote = "⩦";
  var searhk = "⤥";
  var searr = "↘";
  var seArr = "⇘";
  var searrow = "↘";
  var sect = "§";
  var semi = ";";
  var seswar = "⤩";
  var setminus = "∖";
  var setmn = "∖";
  var sext = "✶";
  var Sfr = "𝔖";
  var sfr = "𝔰";
  var sfrown = "⌢";
  var sharp = "♯";
  var SHCHcy = "Щ";
  var shchcy = "щ";
  var SHcy = "Ш";
  var shcy = "ш";
  var ShortDownArrow = "↓";
  var ShortLeftArrow = "←";
  var shortmid = "∣";
  var shortparallel = "∥";
  var ShortRightArrow = "→";
  var ShortUpArrow = "↑";
  var shy = "­";
  var Sigma = "Σ";
  var sigma = "σ";
  var sigmaf = "ς";
  var sigmav = "ς";
  var sim = "∼";
  var simdot = "⩪";
  var sime = "≃";
  var simeq = "≃";
  var simg = "⪞";
  var simgE = "⪠";
  var siml = "⪝";
  var simlE = "⪟";
  var simne = "≆";
  var simplus = "⨤";
  var simrarr = "⥲";
  var slarr = "←";
  var SmallCircle = "∘";
  var smallsetminus = "∖";
  var smashp = "⨳";
  var smeparsl = "⧤";
  var smid = "∣";
  var smile = "⌣";
  var smt = "⪪";
  var smte = "⪬";
  var smtes = "⪬︀";
  var SOFTcy = "Ь";
  var softcy = "ь";
  var solbar = "⌿";
  var solb = "⧄";
  var sol = "/";
  var Sopf = "𝕊";
  var sopf = "𝕤";
  var spades = "♠";
  var spadesuit = "♠";
  var spar = "∥";
  var sqcap = "⊓";
  var sqcaps = "⊓︀";
  var sqcup = "⊔";
  var sqcups = "⊔︀";
  var Sqrt = "√";
  var sqsub = "⊏";
  var sqsube = "⊑";
  var sqsubset = "⊏";
  var sqsubseteq = "⊑";
  var sqsup = "⊐";
  var sqsupe = "⊒";
  var sqsupset = "⊐";
  var sqsupseteq = "⊒";
  var square = "□";
  var Square = "□";
  var SquareIntersection = "⊓";
  var SquareSubset = "⊏";
  var SquareSubsetEqual = "⊑";
  var SquareSuperset = "⊐";
  var SquareSupersetEqual = "⊒";
  var SquareUnion = "⊔";
  var squarf = "▪";
  var squ = "□";
  var squf = "▪";
  var srarr = "→";
  var Sscr = "𝒮";
  var sscr = "𝓈";
  var ssetmn = "∖";
  var ssmile = "⌣";
  var sstarf = "⋆";
  var Star = "⋆";
  var star = "☆";
  var starf = "★";
  var straightepsilon = "ϵ";
  var straightphi = "ϕ";
  var strns = "¯";
  var sub = "⊂";
  var Sub = "⋐";
  var subdot = "⪽";
  var subE = "⫅";
  var sube = "⊆";
  var subedot = "⫃";
  var submult = "⫁";
  var subnE = "⫋";
  var subne = "⊊";
  var subplus = "⪿";
  var subrarr = "⥹";
  var subset = "⊂";
  var Subset = "⋐";
  var subseteq = "⊆";
  var subseteqq = "⫅";
  var SubsetEqual = "⊆";
  var subsetneq = "⊊";
  var subsetneqq = "⫋";
  var subsim = "⫇";
  var subsub = "⫕";
  var subsup = "⫓";
  var succapprox = "⪸";
  var succ = "≻";
  var succcurlyeq = "≽";
  var Succeeds = "≻";
  var SucceedsEqual = "⪰";
  var SucceedsSlantEqual = "≽";
  var SucceedsTilde = "≿";
  var succeq = "⪰";
  var succnapprox = "⪺";
  var succneqq = "⪶";
  var succnsim = "⋩";
  var succsim = "≿";
  var SuchThat = "∋";
  var sum = "∑";
  var Sum = "∑";
  var sung = "♪";
  var sup1 = "¹";
  var sup2 = "²";
  var sup3 = "³";
  var sup = "⊃";
  var Sup = "⋑";
  var supdot = "⪾";
  var supdsub = "⫘";
  var supE = "⫆";
  var supe = "⊇";
  var supedot = "⫄";
  var Superset = "⊃";
  var SupersetEqual = "⊇";
  var suphsol = "⟉";
  var suphsub = "⫗";
  var suplarr = "⥻";
  var supmult = "⫂";
  var supnE = "⫌";
  var supne = "⊋";
  var supplus = "⫀";
  var supset = "⊃";
  var Supset = "⋑";
  var supseteq = "⊇";
  var supseteqq = "⫆";
  var supsetneq = "⊋";
  var supsetneqq = "⫌";
  var supsim = "⫈";
  var supsub = "⫔";
  var supsup = "⫖";
  var swarhk = "⤦";
  var swarr = "↙";
  var swArr = "⇙";
  var swarrow = "↙";
  var swnwar = "⤪";
  var szlig = "ß";
  var Tab = "\t";
  var target = "⌖";
  var Tau = "Τ";
  var tau = "τ";
  var tbrk = "⎴";
  var Tcaron = "Ť";
  var tcaron = "ť";
  var Tcedil = "Ţ";
  var tcedil = "ţ";
  var Tcy = "Т";
  var tcy = "т";
  var tdot = "⃛";
  var telrec = "⌕";
  var Tfr = "𝔗";
  var tfr = "𝔱";
  var there4 = "∴";
  var therefore = "∴";
  var Therefore = "∴";
  var Theta = "Θ";
  var theta = "θ";
  var thetasym = "ϑ";
  var thetav = "ϑ";
  var thickapprox = "≈";
  var thicksim = "∼";
  var ThickSpace = "  ";
  var ThinSpace = " ";
  var thinsp = " ";
  var thkap = "≈";
  var thksim = "∼";
  var THORN = "Þ";
  var thorn = "þ";
  var tilde = "˜";
  var Tilde = "∼";
  var TildeEqual = "≃";
  var TildeFullEqual = "≅";
  var TildeTilde = "≈";
  var timesbar = "⨱";
  var timesb = "⊠";
  var times = "×";
  var timesd = "⨰";
  var tint = "∭";
  var toea = "⤨";
  var topbot = "⌶";
  var topcir = "⫱";
  var top = "⊤";
  var Topf = "𝕋";
  var topf = "𝕥";
  var topfork = "⫚";
  var tosa = "⤩";
  var tprime = "‴";
  var trade = "™";
  var TRADE = "™";
  var triangle = "▵";
  var triangledown = "▿";
  var triangleleft = "◃";
  var trianglelefteq = "⊴";
  var triangleq = "≜";
  var triangleright = "▹";
  var trianglerighteq = "⊵";
  var tridot = "◬";
  var trie = "≜";
  var triminus = "⨺";
  var TripleDot = "⃛";
  var triplus = "⨹";
  var trisb = "⧍";
  var tritime = "⨻";
  var trpezium = "⏢";
  var Tscr = "𝒯";
  var tscr = "𝓉";
  var TScy = "Ц";
  var tscy = "ц";
  var TSHcy = "Ћ";
  var tshcy = "ћ";
  var Tstrok = "Ŧ";
  var tstrok = "ŧ";
  var twixt = "≬";
  var twoheadleftarrow = "↞";
  var twoheadrightarrow = "↠";
  var Uacute = "Ú";
  var uacute = "ú";
  var uarr = "↑";
  var Uarr = "↟";
  var uArr = "⇑";
  var Uarrocir = "⥉";
  var Ubrcy = "Ў";
  var ubrcy = "ў";
  var Ubreve = "Ŭ";
  var ubreve = "ŭ";
  var Ucirc = "Û";
  var ucirc = "û";
  var Ucy = "У";
  var ucy = "у";
  var udarr = "⇅";
  var Udblac = "Ű";
  var udblac = "ű";
  var udhar = "⥮";
  var ufisht = "⥾";
  var Ufr = "𝔘";
  var ufr = "𝔲";
  var Ugrave = "Ù";
  var ugrave = "ù";
  var uHar = "⥣";
  var uharl = "↿";
  var uharr = "↾";
  var uhblk = "▀";
  var ulcorn = "⌜";
  var ulcorner = "⌜";
  var ulcrop = "⌏";
  var ultri = "◸";
  var Umacr = "Ū";
  var umacr = "ū";
  var uml = "¨";
  var UnderBar = "_";
  var UnderBrace = "⏟";
  var UnderBracket = "⎵";
  var UnderParenthesis = "⏝";
  var Union = "⋃";
  var UnionPlus = "⊎";
  var Uogon = "Ų";
  var uogon = "ų";
  var Uopf = "𝕌";
  var uopf = "𝕦";
  var UpArrowBar = "⤒";
  var uparrow = "↑";
  var UpArrow = "↑";
  var Uparrow = "⇑";
  var UpArrowDownArrow = "⇅";
  var updownarrow = "↕";
  var UpDownArrow = "↕";
  var Updownarrow = "⇕";
  var UpEquilibrium = "⥮";
  var upharpoonleft = "↿";
  var upharpoonright = "↾";
  var uplus = "⊎";
  var UpperLeftArrow = "↖";
  var UpperRightArrow = "↗";
  var upsi = "υ";
  var Upsi = "ϒ";
  var upsih = "ϒ";
  var Upsilon = "Υ";
  var upsilon = "υ";
  var UpTeeArrow = "↥";
  var UpTee = "⊥";
  var upuparrows = "⇈";
  var urcorn = "⌝";
  var urcorner = "⌝";
  var urcrop = "⌎";
  var Uring = "Ů";
  var uring = "ů";
  var urtri = "◹";
  var Uscr = "𝒰";
  var uscr = "𝓊";
  var utdot = "⋰";
  var Utilde = "Ũ";
  var utilde = "ũ";
  var utri = "▵";
  var utrif = "▴";
  var uuarr = "⇈";
  var Uuml = "Ü";
  var uuml = "ü";
  var uwangle = "⦧";
  var vangrt = "⦜";
  var varepsilon = "ϵ";
  var varkappa = "ϰ";
  var varnothing = "∅";
  var varphi = "ϕ";
  var varpi = "ϖ";
  var varpropto = "∝";
  var varr = "↕";
  var vArr = "⇕";
  var varrho = "ϱ";
  var varsigma = "ς";
  var varsubsetneq = "⊊︀";
  var varsubsetneqq = "⫋︀";
  var varsupsetneq = "⊋︀";
  var varsupsetneqq = "⫌︀";
  var vartheta = "ϑ";
  var vartriangleleft = "⊲";
  var vartriangleright = "⊳";
  var vBar = "⫨";
  var Vbar = "⫫";
  var vBarv = "⫩";
  var Vcy = "В";
  var vcy = "в";
  var vdash = "⊢";
  var vDash = "⊨";
  var Vdash = "⊩";
  var VDash = "⊫";
  var Vdashl = "⫦";
  var veebar = "⊻";
  var vee = "∨";
  var Vee = "⋁";
  var veeeq = "≚";
  var vellip = "⋮";
  var verbar = "|";
  var Verbar = "‖";
  var vert = "|";
  var Vert = "‖";
  var VerticalBar = "∣";
  var VerticalLine = "|";
  var VerticalSeparator = "❘";
  var VerticalTilde = "≀";
  var VeryThinSpace = " ";
  var Vfr = "𝔙";
  var vfr = "𝔳";
  var vltri = "⊲";
  var vnsub = "⊂⃒";
  var vnsup = "⊃⃒";
  var Vopf = "𝕍";
  var vopf = "𝕧";
  var vprop = "∝";
  var vrtri = "⊳";
  var Vscr = "𝒱";
  var vscr = "𝓋";
  var vsubnE = "⫋︀";
  var vsubne = "⊊︀";
  var vsupnE = "⫌︀";
  var vsupne = "⊋︀";
  var Vvdash = "⊪";
  var vzigzag = "⦚";
  var Wcirc = "Ŵ";
  var wcirc = "ŵ";
  var wedbar = "⩟";
  var wedge = "∧";
  var Wedge = "⋀";
  var wedgeq = "≙";
  var weierp = "℘";
  var Wfr = "𝔚";
  var wfr = "𝔴";
  var Wopf = "𝕎";
  var wopf = "𝕨";
  var wp = "℘";
  var wr = "≀";
  var wreath = "≀";
  var Wscr = "𝒲";
  var wscr = "𝓌";
  var xcap = "⋂";
  var xcirc = "◯";
  var xcup = "⋃";
  var xdtri = "▽";
  var Xfr = "𝔛";
  var xfr = "𝔵";
  var xharr = "⟷";
  var xhArr = "⟺";
  var Xi = "Ξ";
  var xi = "ξ";
  var xlarr = "⟵";
  var xlArr = "⟸";
  var xmap = "⟼";
  var xnis = "⋻";
  var xodot = "⨀";
  var Xopf = "𝕏";
  var xopf = "𝕩";
  var xoplus = "⨁";
  var xotime = "⨂";
  var xrarr = "⟶";
  var xrArr = "⟹";
  var Xscr = "𝒳";
  var xscr = "𝓍";
  var xsqcup = "⨆";
  var xuplus = "⨄";
  var xutri = "△";
  var xvee = "⋁";
  var xwedge = "⋀";
  var Yacute = "Ý";
  var yacute = "ý";
  var YAcy = "Я";
  var yacy = "я";
  var Ycirc = "Ŷ";
  var ycirc = "ŷ";
  var Ycy = "Ы";
  var ycy = "ы";
  var yen = "¥";
  var Yfr = "𝔜";
  var yfr = "𝔶";
  var YIcy = "Ї";
  var yicy = "ї";
  var Yopf = "𝕐";
  var yopf = "𝕪";
  var Yscr = "𝒴";
  var yscr = "𝓎";
  var YUcy = "Ю";
  var yucy = "ю";
  var yuml = "ÿ";
  var Yuml = "Ÿ";
  var Zacute = "Ź";
  var zacute = "ź";
  var Zcaron = "Ž";
  var zcaron = "ž";
  var Zcy = "З";
  var zcy = "з";
  var Zdot = "Ż";
  var zdot = "ż";
  var zeetrf = "ℨ";
  var ZeroWidthSpace = "​";
  var Zeta = "Ζ";
  var zeta = "ζ";
  var zfr = "𝔷";
  var Zfr = "ℨ";
  var ZHcy = "Ж";
  var zhcy = "ж";
  var zigrarr = "⇝";
  var zopf = "𝕫";
  var Zopf = "ℤ";
  var Zscr = "𝒵";
  var zscr = "𝓏";
  var zwj = "‍";
  var zwnj = "‌";
  var entities = {
  	Aacute: Aacute,
  	aacute: aacute,
  	Abreve: Abreve,
  	abreve: abreve,
  	ac: ac,
  	acd: acd,
  	acE: acE,
  	Acirc: Acirc,
  	acirc: acirc,
  	acute: acute,
  	Acy: Acy,
  	acy: acy,
  	AElig: AElig,
  	aelig: aelig,
  	af: af,
  	Afr: Afr,
  	afr: afr,
  	Agrave: Agrave,
  	agrave: agrave,
  	alefsym: alefsym,
  	aleph: aleph,
  	Alpha: Alpha,
  	alpha: alpha,
  	Amacr: Amacr,
  	amacr: amacr,
  	amalg: amalg,
  	amp: amp$1,
  	AMP: AMP,
  	andand: andand,
  	And: And,
  	and: and,
  	andd: andd,
  	andslope: andslope,
  	andv: andv,
  	ang: ang,
  	ange: ange,
  	angle: angle,
  	angmsdaa: angmsdaa,
  	angmsdab: angmsdab,
  	angmsdac: angmsdac,
  	angmsdad: angmsdad,
  	angmsdae: angmsdae,
  	angmsdaf: angmsdaf,
  	angmsdag: angmsdag,
  	angmsdah: angmsdah,
  	angmsd: angmsd,
  	angrt: angrt,
  	angrtvb: angrtvb,
  	angrtvbd: angrtvbd,
  	angsph: angsph,
  	angst: angst,
  	angzarr: angzarr,
  	Aogon: Aogon,
  	aogon: aogon,
  	Aopf: Aopf,
  	aopf: aopf,
  	apacir: apacir,
  	ap: ap,
  	apE: apE,
  	ape: ape,
  	apid: apid,
  	apos: apos$1,
  	ApplyFunction: ApplyFunction,
  	approx: approx,
  	approxeq: approxeq,
  	Aring: Aring,
  	aring: aring,
  	Ascr: Ascr,
  	ascr: ascr,
  	Assign: Assign,
  	ast: ast,
  	asymp: asymp,
  	asympeq: asympeq,
  	Atilde: Atilde,
  	atilde: atilde,
  	Auml: Auml,
  	auml: auml,
  	awconint: awconint,
  	awint: awint,
  	backcong: backcong,
  	backepsilon: backepsilon,
  	backprime: backprime,
  	backsim: backsim,
  	backsimeq: backsimeq,
  	Backslash: Backslash,
  	Barv: Barv,
  	barvee: barvee,
  	barwed: barwed,
  	Barwed: Barwed,
  	barwedge: barwedge,
  	bbrk: bbrk,
  	bbrktbrk: bbrktbrk,
  	bcong: bcong,
  	Bcy: Bcy,
  	bcy: bcy,
  	bdquo: bdquo,
  	becaus: becaus,
  	because: because,
  	Because: Because,
  	bemptyv: bemptyv,
  	bepsi: bepsi,
  	bernou: bernou,
  	Bernoullis: Bernoullis,
  	Beta: Beta,
  	beta: beta,
  	beth: beth,
  	between: between,
  	Bfr: Bfr,
  	bfr: bfr,
  	bigcap: bigcap,
  	bigcirc: bigcirc,
  	bigcup: bigcup,
  	bigodot: bigodot,
  	bigoplus: bigoplus,
  	bigotimes: bigotimes,
  	bigsqcup: bigsqcup,
  	bigstar: bigstar,
  	bigtriangledown: bigtriangledown,
  	bigtriangleup: bigtriangleup,
  	biguplus: biguplus,
  	bigvee: bigvee,
  	bigwedge: bigwedge,
  	bkarow: bkarow,
  	blacklozenge: blacklozenge,
  	blacksquare: blacksquare,
  	blacktriangle: blacktriangle,
  	blacktriangledown: blacktriangledown,
  	blacktriangleleft: blacktriangleleft,
  	blacktriangleright: blacktriangleright,
  	blank: blank,
  	blk12: blk12,
  	blk14: blk14,
  	blk34: blk34,
  	block: block,
  	bne: bne,
  	bnequiv: bnequiv,
  	bNot: bNot,
  	bnot: bnot,
  	Bopf: Bopf,
  	bopf: bopf,
  	bot: bot,
  	bottom: bottom,
  	bowtie: bowtie,
  	boxbox: boxbox,
  	boxdl: boxdl,
  	boxdL: boxdL,
  	boxDl: boxDl,
  	boxDL: boxDL,
  	boxdr: boxdr,
  	boxdR: boxdR,
  	boxDr: boxDr,
  	boxDR: boxDR,
  	boxh: boxh,
  	boxH: boxH,
  	boxhd: boxhd,
  	boxHd: boxHd,
  	boxhD: boxhD,
  	boxHD: boxHD,
  	boxhu: boxhu,
  	boxHu: boxHu,
  	boxhU: boxhU,
  	boxHU: boxHU,
  	boxminus: boxminus,
  	boxplus: boxplus,
  	boxtimes: boxtimes,
  	boxul: boxul,
  	boxuL: boxuL,
  	boxUl: boxUl,
  	boxUL: boxUL,
  	boxur: boxur,
  	boxuR: boxuR,
  	boxUr: boxUr,
  	boxUR: boxUR,
  	boxv: boxv,
  	boxV: boxV,
  	boxvh: boxvh,
  	boxvH: boxvH,
  	boxVh: boxVh,
  	boxVH: boxVH,
  	boxvl: boxvl,
  	boxvL: boxvL,
  	boxVl: boxVl,
  	boxVL: boxVL,
  	boxvr: boxvr,
  	boxvR: boxvR,
  	boxVr: boxVr,
  	boxVR: boxVR,
  	bprime: bprime,
  	breve: breve,
  	Breve: Breve,
  	brvbar: brvbar,
  	bscr: bscr,
  	Bscr: Bscr,
  	bsemi: bsemi,
  	bsim: bsim,
  	bsime: bsime,
  	bsolb: bsolb,
  	bsol: bsol,
  	bsolhsub: bsolhsub,
  	bull: bull,
  	bullet: bullet,
  	bump: bump,
  	bumpE: bumpE,
  	bumpe: bumpe,
  	Bumpeq: Bumpeq,
  	bumpeq: bumpeq,
  	Cacute: Cacute,
  	cacute: cacute,
  	capand: capand,
  	capbrcup: capbrcup,
  	capcap: capcap,
  	cap: cap,
  	Cap: Cap,
  	capcup: capcup,
  	capdot: capdot,
  	CapitalDifferentialD: CapitalDifferentialD,
  	caps: caps,
  	caret: caret,
  	caron: caron,
  	Cayleys: Cayleys,
  	ccaps: ccaps,
  	Ccaron: Ccaron,
  	ccaron: ccaron,
  	Ccedil: Ccedil,
  	ccedil: ccedil,
  	Ccirc: Ccirc,
  	ccirc: ccirc,
  	Cconint: Cconint,
  	ccups: ccups,
  	ccupssm: ccupssm,
  	Cdot: Cdot,
  	cdot: cdot,
  	cedil: cedil,
  	Cedilla: Cedilla,
  	cemptyv: cemptyv,
  	cent: cent,
  	centerdot: centerdot,
  	CenterDot: CenterDot,
  	cfr: cfr,
  	Cfr: Cfr,
  	CHcy: CHcy,
  	chcy: chcy,
  	check: check,
  	checkmark: checkmark,
  	Chi: Chi,
  	chi: chi,
  	circ: circ,
  	circeq: circeq,
  	circlearrowleft: circlearrowleft,
  	circlearrowright: circlearrowright,
  	circledast: circledast,
  	circledcirc: circledcirc,
  	circleddash: circleddash,
  	CircleDot: CircleDot,
  	circledR: circledR,
  	circledS: circledS,
  	CircleMinus: CircleMinus,
  	CirclePlus: CirclePlus,
  	CircleTimes: CircleTimes,
  	cir: cir,
  	cirE: cirE,
  	cire: cire,
  	cirfnint: cirfnint,
  	cirmid: cirmid,
  	cirscir: cirscir,
  	ClockwiseContourIntegral: ClockwiseContourIntegral,
  	CloseCurlyDoubleQuote: CloseCurlyDoubleQuote,
  	CloseCurlyQuote: CloseCurlyQuote,
  	clubs: clubs,
  	clubsuit: clubsuit,
  	colon: colon,
  	Colon: Colon,
  	Colone: Colone,
  	colone: colone,
  	coloneq: coloneq,
  	comma: comma,
  	commat: commat,
  	comp: comp,
  	compfn: compfn,
  	complement: complement,
  	complexes: complexes,
  	cong: cong,
  	congdot: congdot,
  	Congruent: Congruent,
  	conint: conint,
  	Conint: Conint,
  	ContourIntegral: ContourIntegral,
  	copf: copf,
  	Copf: Copf,
  	coprod: coprod,
  	Coproduct: Coproduct,
  	copy: copy,
  	COPY: COPY,
  	copysr: copysr,
  	CounterClockwiseContourIntegral: CounterClockwiseContourIntegral,
  	crarr: crarr,
  	cross: cross,
  	Cross: Cross,
  	Cscr: Cscr,
  	cscr: cscr,
  	csub: csub,
  	csube: csube,
  	csup: csup,
  	csupe: csupe,
  	ctdot: ctdot,
  	cudarrl: cudarrl,
  	cudarrr: cudarrr,
  	cuepr: cuepr,
  	cuesc: cuesc,
  	cularr: cularr,
  	cularrp: cularrp,
  	cupbrcap: cupbrcap,
  	cupcap: cupcap,
  	CupCap: CupCap,
  	cup: cup,
  	Cup: Cup,
  	cupcup: cupcup,
  	cupdot: cupdot,
  	cupor: cupor,
  	cups: cups,
  	curarr: curarr,
  	curarrm: curarrm,
  	curlyeqprec: curlyeqprec,
  	curlyeqsucc: curlyeqsucc,
  	curlyvee: curlyvee,
  	curlywedge: curlywedge,
  	curren: curren,
  	curvearrowleft: curvearrowleft,
  	curvearrowright: curvearrowright,
  	cuvee: cuvee,
  	cuwed: cuwed,
  	cwconint: cwconint,
  	cwint: cwint,
  	cylcty: cylcty,
  	dagger: dagger,
  	Dagger: Dagger,
  	daleth: daleth,
  	darr: darr,
  	Darr: Darr,
  	dArr: dArr,
  	dash: dash,
  	Dashv: Dashv,
  	dashv: dashv,
  	dbkarow: dbkarow,
  	dblac: dblac,
  	Dcaron: Dcaron,
  	dcaron: dcaron,
  	Dcy: Dcy,
  	dcy: dcy,
  	ddagger: ddagger,
  	ddarr: ddarr,
  	DD: DD,
  	dd: dd,
  	DDotrahd: DDotrahd,
  	ddotseq: ddotseq,
  	deg: deg,
  	Del: Del,
  	Delta: Delta,
  	delta: delta,
  	demptyv: demptyv,
  	dfisht: dfisht,
  	Dfr: Dfr,
  	dfr: dfr,
  	dHar: dHar,
  	dharl: dharl,
  	dharr: dharr,
  	DiacriticalAcute: DiacriticalAcute,
  	DiacriticalDot: DiacriticalDot,
  	DiacriticalDoubleAcute: DiacriticalDoubleAcute,
  	DiacriticalGrave: DiacriticalGrave,
  	DiacriticalTilde: DiacriticalTilde,
  	diam: diam,
  	diamond: diamond,
  	Diamond: Diamond,
  	diamondsuit: diamondsuit,
  	diams: diams,
  	die: die,
  	DifferentialD: DifferentialD,
  	digamma: digamma,
  	disin: disin,
  	div: div,
  	divide: divide,
  	divideontimes: divideontimes,
  	divonx: divonx,
  	DJcy: DJcy,
  	djcy: djcy,
  	dlcorn: dlcorn,
  	dlcrop: dlcrop,
  	dollar: dollar,
  	Dopf: Dopf,
  	dopf: dopf,
  	Dot: Dot,
  	dot: dot,
  	DotDot: DotDot,
  	doteq: doteq,
  	doteqdot: doteqdot,
  	DotEqual: DotEqual,
  	dotminus: dotminus,
  	dotplus: dotplus,
  	dotsquare: dotsquare,
  	doublebarwedge: doublebarwedge,
  	DoubleContourIntegral: DoubleContourIntegral,
  	DoubleDot: DoubleDot,
  	DoubleDownArrow: DoubleDownArrow,
  	DoubleLeftArrow: DoubleLeftArrow,
  	DoubleLeftRightArrow: DoubleLeftRightArrow,
  	DoubleLeftTee: DoubleLeftTee,
  	DoubleLongLeftArrow: DoubleLongLeftArrow,
  	DoubleLongLeftRightArrow: DoubleLongLeftRightArrow,
  	DoubleLongRightArrow: DoubleLongRightArrow,
  	DoubleRightArrow: DoubleRightArrow,
  	DoubleRightTee: DoubleRightTee,
  	DoubleUpArrow: DoubleUpArrow,
  	DoubleUpDownArrow: DoubleUpDownArrow,
  	DoubleVerticalBar: DoubleVerticalBar,
  	DownArrowBar: DownArrowBar,
  	downarrow: downarrow,
  	DownArrow: DownArrow,
  	Downarrow: Downarrow,
  	DownArrowUpArrow: DownArrowUpArrow,
  	DownBreve: DownBreve,
  	downdownarrows: downdownarrows,
  	downharpoonleft: downharpoonleft,
  	downharpoonright: downharpoonright,
  	DownLeftRightVector: DownLeftRightVector,
  	DownLeftTeeVector: DownLeftTeeVector,
  	DownLeftVectorBar: DownLeftVectorBar,
  	DownLeftVector: DownLeftVector,
  	DownRightTeeVector: DownRightTeeVector,
  	DownRightVectorBar: DownRightVectorBar,
  	DownRightVector: DownRightVector,
  	DownTeeArrow: DownTeeArrow,
  	DownTee: DownTee,
  	drbkarow: drbkarow,
  	drcorn: drcorn,
  	drcrop: drcrop,
  	Dscr: Dscr,
  	dscr: dscr,
  	DScy: DScy,
  	dscy: dscy,
  	dsol: dsol,
  	Dstrok: Dstrok,
  	dstrok: dstrok,
  	dtdot: dtdot,
  	dtri: dtri,
  	dtrif: dtrif,
  	duarr: duarr,
  	duhar: duhar,
  	dwangle: dwangle,
  	DZcy: DZcy,
  	dzcy: dzcy,
  	dzigrarr: dzigrarr,
  	Eacute: Eacute,
  	eacute: eacute,
  	easter: easter,
  	Ecaron: Ecaron,
  	ecaron: ecaron,
  	Ecirc: Ecirc,
  	ecirc: ecirc,
  	ecir: ecir,
  	ecolon: ecolon,
  	Ecy: Ecy,
  	ecy: ecy,
  	eDDot: eDDot,
  	Edot: Edot,
  	edot: edot,
  	eDot: eDot,
  	ee: ee,
  	efDot: efDot,
  	Efr: Efr,
  	efr: efr,
  	eg: eg,
  	Egrave: Egrave,
  	egrave: egrave,
  	egs: egs,
  	egsdot: egsdot,
  	el: el,
  	Element: Element,
  	elinters: elinters,
  	ell: ell,
  	els: els,
  	elsdot: elsdot,
  	Emacr: Emacr,
  	emacr: emacr,
  	empty: empty$1,
  	emptyset: emptyset,
  	EmptySmallSquare: EmptySmallSquare,
  	emptyv: emptyv,
  	EmptyVerySmallSquare: EmptyVerySmallSquare,
  	emsp13: emsp13,
  	emsp14: emsp14,
  	emsp: emsp,
  	ENG: ENG,
  	eng: eng,
  	ensp: ensp,
  	Eogon: Eogon,
  	eogon: eogon,
  	Eopf: Eopf,
  	eopf: eopf,
  	epar: epar,
  	eparsl: eparsl,
  	eplus: eplus,
  	epsi: epsi,
  	Epsilon: Epsilon,
  	epsilon: epsilon,
  	epsiv: epsiv,
  	eqcirc: eqcirc,
  	eqcolon: eqcolon,
  	eqsim: eqsim,
  	eqslantgtr: eqslantgtr,
  	eqslantless: eqslantless,
  	Equal: Equal,
  	equals: equals,
  	EqualTilde: EqualTilde,
  	equest: equest,
  	Equilibrium: Equilibrium,
  	equiv: equiv,
  	equivDD: equivDD,
  	eqvparsl: eqvparsl,
  	erarr: erarr,
  	erDot: erDot,
  	escr: escr,
  	Escr: Escr,
  	esdot: esdot,
  	Esim: Esim,
  	esim: esim,
  	Eta: Eta,
  	eta: eta,
  	ETH: ETH,
  	eth: eth,
  	Euml: Euml,
  	euml: euml,
  	euro: euro,
  	excl: excl,
  	exist: exist,
  	Exists: Exists,
  	expectation: expectation,
  	exponentiale: exponentiale,
  	ExponentialE: ExponentialE,
  	fallingdotseq: fallingdotseq,
  	Fcy: Fcy,
  	fcy: fcy,
  	female: female,
  	ffilig: ffilig,
  	fflig: fflig,
  	ffllig: ffllig,
  	Ffr: Ffr,
  	ffr: ffr,
  	filig: filig,
  	FilledSmallSquare: FilledSmallSquare,
  	FilledVerySmallSquare: FilledVerySmallSquare,
  	fjlig: fjlig,
  	flat: flat,
  	fllig: fllig,
  	fltns: fltns,
  	fnof: fnof,
  	Fopf: Fopf,
  	fopf: fopf,
  	forall: forall,
  	ForAll: ForAll,
  	fork: fork,
  	forkv: forkv,
  	Fouriertrf: Fouriertrf,
  	fpartint: fpartint,
  	frac12: frac12,
  	frac13: frac13,
  	frac14: frac14,
  	frac15: frac15,
  	frac16: frac16,
  	frac18: frac18,
  	frac23: frac23,
  	frac25: frac25,
  	frac34: frac34,
  	frac35: frac35,
  	frac38: frac38,
  	frac45: frac45,
  	frac56: frac56,
  	frac58: frac58,
  	frac78: frac78,
  	frasl: frasl,
  	frown: frown,
  	fscr: fscr,
  	Fscr: Fscr,
  	gacute: gacute,
  	Gamma: Gamma,
  	gamma: gamma,
  	Gammad: Gammad,
  	gammad: gammad,
  	gap: gap,
  	Gbreve: Gbreve,
  	gbreve: gbreve,
  	Gcedil: Gcedil,
  	Gcirc: Gcirc,
  	gcirc: gcirc,
  	Gcy: Gcy,
  	gcy: gcy,
  	Gdot: Gdot,
  	gdot: gdot,
  	ge: ge,
  	gE: gE,
  	gEl: gEl,
  	gel: gel,
  	geq: geq,
  	geqq: geqq,
  	geqslant: geqslant,
  	gescc: gescc,
  	ges: ges,
  	gesdot: gesdot,
  	gesdoto: gesdoto,
  	gesdotol: gesdotol,
  	gesl: gesl,
  	gesles: gesles,
  	Gfr: Gfr,
  	gfr: gfr,
  	gg: gg,
  	Gg: Gg,
  	ggg: ggg,
  	gimel: gimel,
  	GJcy: GJcy,
  	gjcy: gjcy,
  	gla: gla,
  	gl: gl,
  	glE: glE,
  	glj: glj,
  	gnap: gnap,
  	gnapprox: gnapprox,
  	gne: gne,
  	gnE: gnE,
  	gneq: gneq,
  	gneqq: gneqq,
  	gnsim: gnsim,
  	Gopf: Gopf,
  	gopf: gopf,
  	grave: grave,
  	GreaterEqual: GreaterEqual,
  	GreaterEqualLess: GreaterEqualLess,
  	GreaterFullEqual: GreaterFullEqual,
  	GreaterGreater: GreaterGreater,
  	GreaterLess: GreaterLess,
  	GreaterSlantEqual: GreaterSlantEqual,
  	GreaterTilde: GreaterTilde,
  	Gscr: Gscr,
  	gscr: gscr,
  	gsim: gsim,
  	gsime: gsime,
  	gsiml: gsiml,
  	gtcc: gtcc,
  	gtcir: gtcir,
  	gt: gt$1,
  	GT: GT,
  	Gt: Gt,
  	gtdot: gtdot,
  	gtlPar: gtlPar,
  	gtquest: gtquest,
  	gtrapprox: gtrapprox,
  	gtrarr: gtrarr,
  	gtrdot: gtrdot,
  	gtreqless: gtreqless,
  	gtreqqless: gtreqqless,
  	gtrless: gtrless,
  	gtrsim: gtrsim,
  	gvertneqq: gvertneqq,
  	gvnE: gvnE,
  	Hacek: Hacek,
  	hairsp: hairsp,
  	half: half,
  	hamilt: hamilt,
  	HARDcy: HARDcy,
  	hardcy: hardcy,
  	harrcir: harrcir,
  	harr: harr,
  	hArr: hArr,
  	harrw: harrw,
  	Hat: Hat,
  	hbar: hbar,
  	Hcirc: Hcirc,
  	hcirc: hcirc,
  	hearts: hearts,
  	heartsuit: heartsuit,
  	hellip: hellip,
  	hercon: hercon,
  	hfr: hfr,
  	Hfr: Hfr,
  	HilbertSpace: HilbertSpace,
  	hksearow: hksearow,
  	hkswarow: hkswarow,
  	hoarr: hoarr,
  	homtht: homtht,
  	hookleftarrow: hookleftarrow,
  	hookrightarrow: hookrightarrow,
  	hopf: hopf,
  	Hopf: Hopf,
  	horbar: horbar,
  	HorizontalLine: HorizontalLine,
  	hscr: hscr,
  	Hscr: Hscr,
  	hslash: hslash,
  	Hstrok: Hstrok,
  	hstrok: hstrok,
  	HumpDownHump: HumpDownHump,
  	HumpEqual: HumpEqual,
  	hybull: hybull,
  	hyphen: hyphen,
  	Iacute: Iacute,
  	iacute: iacute,
  	ic: ic,
  	Icirc: Icirc,
  	icirc: icirc,
  	Icy: Icy,
  	icy: icy,
  	Idot: Idot,
  	IEcy: IEcy,
  	iecy: iecy,
  	iexcl: iexcl,
  	iff: iff,
  	ifr: ifr,
  	Ifr: Ifr,
  	Igrave: Igrave,
  	igrave: igrave,
  	ii: ii,
  	iiiint: iiiint,
  	iiint: iiint,
  	iinfin: iinfin,
  	iiota: iiota,
  	IJlig: IJlig,
  	ijlig: ijlig,
  	Imacr: Imacr,
  	imacr: imacr,
  	image: image,
  	ImaginaryI: ImaginaryI,
  	imagline: imagline,
  	imagpart: imagpart,
  	imath: imath,
  	Im: Im,
  	imof: imof,
  	imped: imped,
  	Implies: Implies,
  	incare: incare,
  	"in": "∈",
  	infin: infin,
  	infintie: infintie,
  	inodot: inodot,
  	intcal: intcal,
  	int: int,
  	Int: Int,
  	integers: integers,
  	Integral: Integral,
  	intercal: intercal,
  	Intersection: Intersection,
  	intlarhk: intlarhk,
  	intprod: intprod,
  	InvisibleComma: InvisibleComma,
  	InvisibleTimes: InvisibleTimes,
  	IOcy: IOcy,
  	iocy: iocy,
  	Iogon: Iogon,
  	iogon: iogon,
  	Iopf: Iopf,
  	iopf: iopf,
  	Iota: Iota,
  	iota: iota,
  	iprod: iprod,
  	iquest: iquest,
  	iscr: iscr,
  	Iscr: Iscr,
  	isin: isin,
  	isindot: isindot,
  	isinE: isinE,
  	isins: isins,
  	isinsv: isinsv,
  	isinv: isinv,
  	it: it,
  	Itilde: Itilde,
  	itilde: itilde,
  	Iukcy: Iukcy,
  	iukcy: iukcy,
  	Iuml: Iuml,
  	iuml: iuml,
  	Jcirc: Jcirc,
  	jcirc: jcirc,
  	Jcy: Jcy,
  	jcy: jcy,
  	Jfr: Jfr,
  	jfr: jfr,
  	jmath: jmath,
  	Jopf: Jopf,
  	jopf: jopf,
  	Jscr: Jscr,
  	jscr: jscr,
  	Jsercy: Jsercy,
  	jsercy: jsercy,
  	Jukcy: Jukcy,
  	jukcy: jukcy,
  	Kappa: Kappa,
  	kappa: kappa,
  	kappav: kappav,
  	Kcedil: Kcedil,
  	kcedil: kcedil,
  	Kcy: Kcy,
  	kcy: kcy,
  	Kfr: Kfr,
  	kfr: kfr,
  	kgreen: kgreen,
  	KHcy: KHcy,
  	khcy: khcy,
  	KJcy: KJcy,
  	kjcy: kjcy,
  	Kopf: Kopf,
  	kopf: kopf,
  	Kscr: Kscr,
  	kscr: kscr,
  	lAarr: lAarr,
  	Lacute: Lacute,
  	lacute: lacute,
  	laemptyv: laemptyv,
  	lagran: lagran,
  	Lambda: Lambda,
  	lambda: lambda,
  	lang: lang,
  	Lang: Lang,
  	langd: langd,
  	langle: langle,
  	lap: lap,
  	Laplacetrf: Laplacetrf,
  	laquo: laquo,
  	larrb: larrb,
  	larrbfs: larrbfs,
  	larr: larr,
  	Larr: Larr,
  	lArr: lArr,
  	larrfs: larrfs,
  	larrhk: larrhk,
  	larrlp: larrlp,
  	larrpl: larrpl,
  	larrsim: larrsim,
  	larrtl: larrtl,
  	latail: latail,
  	lAtail: lAtail,
  	lat: lat,
  	late: late,
  	lates: lates,
  	lbarr: lbarr,
  	lBarr: lBarr,
  	lbbrk: lbbrk,
  	lbrace: lbrace,
  	lbrack: lbrack,
  	lbrke: lbrke,
  	lbrksld: lbrksld,
  	lbrkslu: lbrkslu,
  	Lcaron: Lcaron,
  	lcaron: lcaron,
  	Lcedil: Lcedil,
  	lcedil: lcedil,
  	lceil: lceil,
  	lcub: lcub,
  	Lcy: Lcy,
  	lcy: lcy,
  	ldca: ldca,
  	ldquo: ldquo,
  	ldquor: ldquor,
  	ldrdhar: ldrdhar,
  	ldrushar: ldrushar,
  	ldsh: ldsh,
  	le: le,
  	lE: lE,
  	LeftAngleBracket: LeftAngleBracket,
  	LeftArrowBar: LeftArrowBar,
  	leftarrow: leftarrow,
  	LeftArrow: LeftArrow,
  	Leftarrow: Leftarrow,
  	LeftArrowRightArrow: LeftArrowRightArrow,
  	leftarrowtail: leftarrowtail,
  	LeftCeiling: LeftCeiling,
  	LeftDoubleBracket: LeftDoubleBracket,
  	LeftDownTeeVector: LeftDownTeeVector,
  	LeftDownVectorBar: LeftDownVectorBar,
  	LeftDownVector: LeftDownVector,
  	LeftFloor: LeftFloor,
  	leftharpoondown: leftharpoondown,
  	leftharpoonup: leftharpoonup,
  	leftleftarrows: leftleftarrows,
  	leftrightarrow: leftrightarrow,
  	LeftRightArrow: LeftRightArrow,
  	Leftrightarrow: Leftrightarrow,
  	leftrightarrows: leftrightarrows,
  	leftrightharpoons: leftrightharpoons,
  	leftrightsquigarrow: leftrightsquigarrow,
  	LeftRightVector: LeftRightVector,
  	LeftTeeArrow: LeftTeeArrow,
  	LeftTee: LeftTee,
  	LeftTeeVector: LeftTeeVector,
  	leftthreetimes: leftthreetimes,
  	LeftTriangleBar: LeftTriangleBar,
  	LeftTriangle: LeftTriangle,
  	LeftTriangleEqual: LeftTriangleEqual,
  	LeftUpDownVector: LeftUpDownVector,
  	LeftUpTeeVector: LeftUpTeeVector,
  	LeftUpVectorBar: LeftUpVectorBar,
  	LeftUpVector: LeftUpVector,
  	LeftVectorBar: LeftVectorBar,
  	LeftVector: LeftVector,
  	lEg: lEg,
  	leg: leg,
  	leq: leq,
  	leqq: leqq,
  	leqslant: leqslant,
  	lescc: lescc,
  	les: les,
  	lesdot: lesdot,
  	lesdoto: lesdoto,
  	lesdotor: lesdotor,
  	lesg: lesg,
  	lesges: lesges,
  	lessapprox: lessapprox,
  	lessdot: lessdot,
  	lesseqgtr: lesseqgtr,
  	lesseqqgtr: lesseqqgtr,
  	LessEqualGreater: LessEqualGreater,
  	LessFullEqual: LessFullEqual,
  	LessGreater: LessGreater,
  	lessgtr: lessgtr,
  	LessLess: LessLess,
  	lesssim: lesssim,
  	LessSlantEqual: LessSlantEqual,
  	LessTilde: LessTilde,
  	lfisht: lfisht,
  	lfloor: lfloor,
  	Lfr: Lfr,
  	lfr: lfr,
  	lg: lg,
  	lgE: lgE,
  	lHar: lHar,
  	lhard: lhard,
  	lharu: lharu,
  	lharul: lharul,
  	lhblk: lhblk,
  	LJcy: LJcy,
  	ljcy: ljcy,
  	llarr: llarr,
  	ll: ll,
  	Ll: Ll,
  	llcorner: llcorner,
  	Lleftarrow: Lleftarrow,
  	llhard: llhard,
  	lltri: lltri,
  	Lmidot: Lmidot,
  	lmidot: lmidot,
  	lmoustache: lmoustache,
  	lmoust: lmoust,
  	lnap: lnap,
  	lnapprox: lnapprox,
  	lne: lne,
  	lnE: lnE,
  	lneq: lneq,
  	lneqq: lneqq,
  	lnsim: lnsim,
  	loang: loang,
  	loarr: loarr,
  	lobrk: lobrk,
  	longleftarrow: longleftarrow,
  	LongLeftArrow: LongLeftArrow,
  	Longleftarrow: Longleftarrow,
  	longleftrightarrow: longleftrightarrow,
  	LongLeftRightArrow: LongLeftRightArrow,
  	Longleftrightarrow: Longleftrightarrow,
  	longmapsto: longmapsto,
  	longrightarrow: longrightarrow,
  	LongRightArrow: LongRightArrow,
  	Longrightarrow: Longrightarrow,
  	looparrowleft: looparrowleft,
  	looparrowright: looparrowright,
  	lopar: lopar,
  	Lopf: Lopf,
  	lopf: lopf,
  	loplus: loplus,
  	lotimes: lotimes,
  	lowast: lowast,
  	lowbar: lowbar,
  	LowerLeftArrow: LowerLeftArrow,
  	LowerRightArrow: LowerRightArrow,
  	loz: loz,
  	lozenge: lozenge,
  	lozf: lozf,
  	lpar: lpar,
  	lparlt: lparlt,
  	lrarr: lrarr,
  	lrcorner: lrcorner,
  	lrhar: lrhar,
  	lrhard: lrhard,
  	lrm: lrm,
  	lrtri: lrtri,
  	lsaquo: lsaquo,
  	lscr: lscr,
  	Lscr: Lscr,
  	lsh: lsh,
  	Lsh: Lsh,
  	lsim: lsim,
  	lsime: lsime,
  	lsimg: lsimg,
  	lsqb: lsqb,
  	lsquo: lsquo,
  	lsquor: lsquor,
  	Lstrok: Lstrok,
  	lstrok: lstrok,
  	ltcc: ltcc,
  	ltcir: ltcir,
  	lt: lt$1,
  	LT: LT,
  	Lt: Lt,
  	ltdot: ltdot,
  	lthree: lthree,
  	ltimes: ltimes,
  	ltlarr: ltlarr,
  	ltquest: ltquest,
  	ltri: ltri,
  	ltrie: ltrie,
  	ltrif: ltrif,
  	ltrPar: ltrPar,
  	lurdshar: lurdshar,
  	luruhar: luruhar,
  	lvertneqq: lvertneqq,
  	lvnE: lvnE,
  	macr: macr,
  	male: male,
  	malt: malt,
  	maltese: maltese,
  	"Map": "⤅",
  	map: map,
  	mapsto: mapsto,
  	mapstodown: mapstodown,
  	mapstoleft: mapstoleft,
  	mapstoup: mapstoup,
  	marker: marker,
  	mcomma: mcomma,
  	Mcy: Mcy,
  	mcy: mcy,
  	mdash: mdash,
  	mDDot: mDDot,
  	measuredangle: measuredangle,
  	MediumSpace: MediumSpace,
  	Mellintrf: Mellintrf,
  	Mfr: Mfr,
  	mfr: mfr,
  	mho: mho,
  	micro: micro,
  	midast: midast,
  	midcir: midcir,
  	mid: mid,
  	middot: middot,
  	minusb: minusb,
  	minus: minus,
  	minusd: minusd,
  	minusdu: minusdu,
  	MinusPlus: MinusPlus,
  	mlcp: mlcp,
  	mldr: mldr,
  	mnplus: mnplus,
  	models: models,
  	Mopf: Mopf,
  	mopf: mopf,
  	mp: mp,
  	mscr: mscr,
  	Mscr: Mscr,
  	mstpos: mstpos,
  	Mu: Mu,
  	mu: mu,
  	multimap: multimap,
  	mumap: mumap,
  	nabla: nabla,
  	Nacute: Nacute,
  	nacute: nacute,
  	nang: nang,
  	nap: nap,
  	napE: napE,
  	napid: napid,
  	napos: napos,
  	napprox: napprox,
  	natural: natural,
  	naturals: naturals,
  	natur: natur,
  	nbsp: nbsp,
  	nbump: nbump,
  	nbumpe: nbumpe,
  	ncap: ncap,
  	Ncaron: Ncaron,
  	ncaron: ncaron,
  	Ncedil: Ncedil,
  	ncedil: ncedil,
  	ncong: ncong,
  	ncongdot: ncongdot,
  	ncup: ncup,
  	Ncy: Ncy,
  	ncy: ncy,
  	ndash: ndash,
  	nearhk: nearhk,
  	nearr: nearr,
  	neArr: neArr,
  	nearrow: nearrow,
  	ne: ne,
  	nedot: nedot,
  	NegativeMediumSpace: NegativeMediumSpace,
  	NegativeThickSpace: NegativeThickSpace,
  	NegativeThinSpace: NegativeThinSpace,
  	NegativeVeryThinSpace: NegativeVeryThinSpace,
  	nequiv: nequiv,
  	nesear: nesear,
  	nesim: nesim,
  	NestedGreaterGreater: NestedGreaterGreater,
  	NestedLessLess: NestedLessLess,
  	NewLine: NewLine,
  	nexist: nexist,
  	nexists: nexists,
  	Nfr: Nfr,
  	nfr: nfr,
  	ngE: ngE,
  	nge: nge,
  	ngeq: ngeq,
  	ngeqq: ngeqq,
  	ngeqslant: ngeqslant,
  	nges: nges,
  	nGg: nGg,
  	ngsim: ngsim,
  	nGt: nGt,
  	ngt: ngt,
  	ngtr: ngtr,
  	nGtv: nGtv,
  	nharr: nharr,
  	nhArr: nhArr,
  	nhpar: nhpar,
  	ni: ni,
  	nis: nis,
  	nisd: nisd,
  	niv: niv,
  	NJcy: NJcy,
  	njcy: njcy,
  	nlarr: nlarr,
  	nlArr: nlArr,
  	nldr: nldr,
  	nlE: nlE,
  	nle: nle,
  	nleftarrow: nleftarrow,
  	nLeftarrow: nLeftarrow,
  	nleftrightarrow: nleftrightarrow,
  	nLeftrightarrow: nLeftrightarrow,
  	nleq: nleq,
  	nleqq: nleqq,
  	nleqslant: nleqslant,
  	nles: nles,
  	nless: nless,
  	nLl: nLl,
  	nlsim: nlsim,
  	nLt: nLt,
  	nlt: nlt,
  	nltri: nltri,
  	nltrie: nltrie,
  	nLtv: nLtv,
  	nmid: nmid,
  	NoBreak: NoBreak,
  	NonBreakingSpace: NonBreakingSpace,
  	nopf: nopf,
  	Nopf: Nopf,
  	Not: Not,
  	not: not,
  	NotCongruent: NotCongruent,
  	NotCupCap: NotCupCap,
  	NotDoubleVerticalBar: NotDoubleVerticalBar,
  	NotElement: NotElement,
  	NotEqual: NotEqual,
  	NotEqualTilde: NotEqualTilde,
  	NotExists: NotExists,
  	NotGreater: NotGreater,
  	NotGreaterEqual: NotGreaterEqual,
  	NotGreaterFullEqual: NotGreaterFullEqual,
  	NotGreaterGreater: NotGreaterGreater,
  	NotGreaterLess: NotGreaterLess,
  	NotGreaterSlantEqual: NotGreaterSlantEqual,
  	NotGreaterTilde: NotGreaterTilde,
  	NotHumpDownHump: NotHumpDownHump,
  	NotHumpEqual: NotHumpEqual,
  	notin: notin,
  	notindot: notindot,
  	notinE: notinE,
  	notinva: notinva,
  	notinvb: notinvb,
  	notinvc: notinvc,
  	NotLeftTriangleBar: NotLeftTriangleBar,
  	NotLeftTriangle: NotLeftTriangle,
  	NotLeftTriangleEqual: NotLeftTriangleEqual,
  	NotLess: NotLess,
  	NotLessEqual: NotLessEqual,
  	NotLessGreater: NotLessGreater,
  	NotLessLess: NotLessLess,
  	NotLessSlantEqual: NotLessSlantEqual,
  	NotLessTilde: NotLessTilde,
  	NotNestedGreaterGreater: NotNestedGreaterGreater,
  	NotNestedLessLess: NotNestedLessLess,
  	notni: notni,
  	notniva: notniva,
  	notnivb: notnivb,
  	notnivc: notnivc,
  	NotPrecedes: NotPrecedes,
  	NotPrecedesEqual: NotPrecedesEqual,
  	NotPrecedesSlantEqual: NotPrecedesSlantEqual,
  	NotReverseElement: NotReverseElement,
  	NotRightTriangleBar: NotRightTriangleBar,
  	NotRightTriangle: NotRightTriangle,
  	NotRightTriangleEqual: NotRightTriangleEqual,
  	NotSquareSubset: NotSquareSubset,
  	NotSquareSubsetEqual: NotSquareSubsetEqual,
  	NotSquareSuperset: NotSquareSuperset,
  	NotSquareSupersetEqual: NotSquareSupersetEqual,
  	NotSubset: NotSubset,
  	NotSubsetEqual: NotSubsetEqual,
  	NotSucceeds: NotSucceeds,
  	NotSucceedsEqual: NotSucceedsEqual,
  	NotSucceedsSlantEqual: NotSucceedsSlantEqual,
  	NotSucceedsTilde: NotSucceedsTilde,
  	NotSuperset: NotSuperset,
  	NotSupersetEqual: NotSupersetEqual,
  	NotTilde: NotTilde,
  	NotTildeEqual: NotTildeEqual,
  	NotTildeFullEqual: NotTildeFullEqual,
  	NotTildeTilde: NotTildeTilde,
  	NotVerticalBar: NotVerticalBar,
  	nparallel: nparallel,
  	npar: npar,
  	nparsl: nparsl,
  	npart: npart,
  	npolint: npolint,
  	npr: npr,
  	nprcue: nprcue,
  	nprec: nprec,
  	npreceq: npreceq,
  	npre: npre,
  	nrarrc: nrarrc,
  	nrarr: nrarr,
  	nrArr: nrArr,
  	nrarrw: nrarrw,
  	nrightarrow: nrightarrow,
  	nRightarrow: nRightarrow,
  	nrtri: nrtri,
  	nrtrie: nrtrie,
  	nsc: nsc,
  	nsccue: nsccue,
  	nsce: nsce,
  	Nscr: Nscr,
  	nscr: nscr,
  	nshortmid: nshortmid,
  	nshortparallel: nshortparallel,
  	nsim: nsim,
  	nsime: nsime,
  	nsimeq: nsimeq,
  	nsmid: nsmid,
  	nspar: nspar,
  	nsqsube: nsqsube,
  	nsqsupe: nsqsupe,
  	nsub: nsub,
  	nsubE: nsubE,
  	nsube: nsube,
  	nsubset: nsubset,
  	nsubseteq: nsubseteq,
  	nsubseteqq: nsubseteqq,
  	nsucc: nsucc,
  	nsucceq: nsucceq,
  	nsup: nsup,
  	nsupE: nsupE,
  	nsupe: nsupe,
  	nsupset: nsupset,
  	nsupseteq: nsupseteq,
  	nsupseteqq: nsupseteqq,
  	ntgl: ntgl,
  	Ntilde: Ntilde,
  	ntilde: ntilde,
  	ntlg: ntlg,
  	ntriangleleft: ntriangleleft,
  	ntrianglelefteq: ntrianglelefteq,
  	ntriangleright: ntriangleright,
  	ntrianglerighteq: ntrianglerighteq,
  	Nu: Nu,
  	nu: nu,
  	num: num,
  	numero: numero,
  	numsp: numsp,
  	nvap: nvap,
  	nvdash: nvdash,
  	nvDash: nvDash,
  	nVdash: nVdash,
  	nVDash: nVDash,
  	nvge: nvge,
  	nvgt: nvgt,
  	nvHarr: nvHarr,
  	nvinfin: nvinfin,
  	nvlArr: nvlArr,
  	nvle: nvle,
  	nvlt: nvlt,
  	nvltrie: nvltrie,
  	nvrArr: nvrArr,
  	nvrtrie: nvrtrie,
  	nvsim: nvsim,
  	nwarhk: nwarhk,
  	nwarr: nwarr,
  	nwArr: nwArr,
  	nwarrow: nwarrow,
  	nwnear: nwnear,
  	Oacute: Oacute,
  	oacute: oacute,
  	oast: oast,
  	Ocirc: Ocirc,
  	ocirc: ocirc,
  	ocir: ocir,
  	Ocy: Ocy,
  	ocy: ocy,
  	odash: odash,
  	Odblac: Odblac,
  	odblac: odblac,
  	odiv: odiv,
  	odot: odot,
  	odsold: odsold,
  	OElig: OElig,
  	oelig: oelig,
  	ofcir: ofcir,
  	Ofr: Ofr,
  	ofr: ofr,
  	ogon: ogon,
  	Ograve: Ograve,
  	ograve: ograve,
  	ogt: ogt,
  	ohbar: ohbar,
  	ohm: ohm,
  	oint: oint,
  	olarr: olarr,
  	olcir: olcir,
  	olcross: olcross,
  	oline: oline,
  	olt: olt,
  	Omacr: Omacr,
  	omacr: omacr,
  	Omega: Omega,
  	omega: omega,
  	Omicron: Omicron,
  	omicron: omicron,
  	omid: omid,
  	ominus: ominus,
  	Oopf: Oopf,
  	oopf: oopf,
  	opar: opar,
  	OpenCurlyDoubleQuote: OpenCurlyDoubleQuote,
  	OpenCurlyQuote: OpenCurlyQuote,
  	operp: operp,
  	oplus: oplus,
  	orarr: orarr,
  	Or: Or,
  	or: or,
  	ord: ord,
  	order: order,
  	orderof: orderof,
  	ordf: ordf,
  	ordm: ordm,
  	origof: origof,
  	oror: oror,
  	orslope: orslope,
  	orv: orv,
  	oS: oS,
  	Oscr: Oscr,
  	oscr: oscr,
  	Oslash: Oslash,
  	oslash: oslash,
  	osol: osol,
  	Otilde: Otilde,
  	otilde: otilde,
  	otimesas: otimesas,
  	Otimes: Otimes,
  	otimes: otimes,
  	Ouml: Ouml,
  	ouml: ouml,
  	ovbar: ovbar,
  	OverBar: OverBar,
  	OverBrace: OverBrace,
  	OverBracket: OverBracket,
  	OverParenthesis: OverParenthesis,
  	para: para,
  	parallel: parallel,
  	par: par,
  	parsim: parsim,
  	parsl: parsl,
  	part: part,
  	PartialD: PartialD,
  	Pcy: Pcy,
  	pcy: pcy,
  	percnt: percnt,
  	period: period,
  	permil: permil,
  	perp: perp,
  	pertenk: pertenk,
  	Pfr: Pfr,
  	pfr: pfr,
  	Phi: Phi,
  	phi: phi,
  	phiv: phiv,
  	phmmat: phmmat,
  	phone: phone,
  	Pi: Pi,
  	pi: pi,
  	pitchfork: pitchfork,
  	piv: piv,
  	planck: planck,
  	planckh: planckh,
  	plankv: plankv,
  	plusacir: plusacir,
  	plusb: plusb,
  	pluscir: pluscir,
  	plus: plus,
  	plusdo: plusdo,
  	plusdu: plusdu,
  	pluse: pluse,
  	PlusMinus: PlusMinus,
  	plusmn: plusmn,
  	plussim: plussim,
  	plustwo: plustwo,
  	pm: pm,
  	Poincareplane: Poincareplane,
  	pointint: pointint,
  	popf: popf,
  	Popf: Popf,
  	pound: pound,
  	prap: prap,
  	Pr: Pr,
  	pr: pr,
  	prcue: prcue,
  	precapprox: precapprox,
  	prec: prec,
  	preccurlyeq: preccurlyeq,
  	Precedes: Precedes,
  	PrecedesEqual: PrecedesEqual,
  	PrecedesSlantEqual: PrecedesSlantEqual,
  	PrecedesTilde: PrecedesTilde,
  	preceq: preceq,
  	precnapprox: precnapprox,
  	precneqq: precneqq,
  	precnsim: precnsim,
  	pre: pre,
  	prE: prE,
  	precsim: precsim,
  	prime: prime,
  	Prime: Prime,
  	primes: primes,
  	prnap: prnap,
  	prnE: prnE,
  	prnsim: prnsim,
  	prod: prod,
  	Product: Product,
  	profalar: profalar,
  	profline: profline,
  	profsurf: profsurf,
  	prop: prop,
  	Proportional: Proportional,
  	Proportion: Proportion,
  	propto: propto,
  	prsim: prsim,
  	prurel: prurel,
  	Pscr: Pscr,
  	pscr: pscr,
  	Psi: Psi,
  	psi: psi,
  	puncsp: puncsp,
  	Qfr: Qfr,
  	qfr: qfr,
  	qint: qint,
  	qopf: qopf,
  	Qopf: Qopf,
  	qprime: qprime,
  	Qscr: Qscr,
  	qscr: qscr,
  	quaternions: quaternions,
  	quatint: quatint,
  	quest: quest,
  	questeq: questeq,
  	quot: quot$1,
  	QUOT: QUOT,
  	rAarr: rAarr,
  	race: race,
  	Racute: Racute,
  	racute: racute,
  	radic: radic,
  	raemptyv: raemptyv,
  	rang: rang,
  	Rang: Rang,
  	rangd: rangd,
  	range: range,
  	rangle: rangle,
  	raquo: raquo,
  	rarrap: rarrap,
  	rarrb: rarrb,
  	rarrbfs: rarrbfs,
  	rarrc: rarrc,
  	rarr: rarr,
  	Rarr: Rarr,
  	rArr: rArr,
  	rarrfs: rarrfs,
  	rarrhk: rarrhk,
  	rarrlp: rarrlp,
  	rarrpl: rarrpl,
  	rarrsim: rarrsim,
  	Rarrtl: Rarrtl,
  	rarrtl: rarrtl,
  	rarrw: rarrw,
  	ratail: ratail,
  	rAtail: rAtail,
  	ratio: ratio,
  	rationals: rationals,
  	rbarr: rbarr,
  	rBarr: rBarr,
  	RBarr: RBarr,
  	rbbrk: rbbrk,
  	rbrace: rbrace,
  	rbrack: rbrack,
  	rbrke: rbrke,
  	rbrksld: rbrksld,
  	rbrkslu: rbrkslu,
  	Rcaron: Rcaron,
  	rcaron: rcaron,
  	Rcedil: Rcedil,
  	rcedil: rcedil,
  	rceil: rceil,
  	rcub: rcub,
  	Rcy: Rcy,
  	rcy: rcy,
  	rdca: rdca,
  	rdldhar: rdldhar,
  	rdquo: rdquo,
  	rdquor: rdquor,
  	rdsh: rdsh,
  	real: real,
  	realine: realine,
  	realpart: realpart,
  	reals: reals,
  	Re: Re,
  	rect: rect,
  	reg: reg,
  	REG: REG,
  	ReverseElement: ReverseElement,
  	ReverseEquilibrium: ReverseEquilibrium,
  	ReverseUpEquilibrium: ReverseUpEquilibrium,
  	rfisht: rfisht,
  	rfloor: rfloor,
  	rfr: rfr,
  	Rfr: Rfr,
  	rHar: rHar,
  	rhard: rhard,
  	rharu: rharu,
  	rharul: rharul,
  	Rho: Rho,
  	rho: rho,
  	rhov: rhov,
  	RightAngleBracket: RightAngleBracket,
  	RightArrowBar: RightArrowBar,
  	rightarrow: rightarrow,
  	RightArrow: RightArrow,
  	Rightarrow: Rightarrow,
  	RightArrowLeftArrow: RightArrowLeftArrow,
  	rightarrowtail: rightarrowtail,
  	RightCeiling: RightCeiling,
  	RightDoubleBracket: RightDoubleBracket,
  	RightDownTeeVector: RightDownTeeVector,
  	RightDownVectorBar: RightDownVectorBar,
  	RightDownVector: RightDownVector,
  	RightFloor: RightFloor,
  	rightharpoondown: rightharpoondown,
  	rightharpoonup: rightharpoonup,
  	rightleftarrows: rightleftarrows,
  	rightleftharpoons: rightleftharpoons,
  	rightrightarrows: rightrightarrows,
  	rightsquigarrow: rightsquigarrow,
  	RightTeeArrow: RightTeeArrow,
  	RightTee: RightTee,
  	RightTeeVector: RightTeeVector,
  	rightthreetimes: rightthreetimes,
  	RightTriangleBar: RightTriangleBar,
  	RightTriangle: RightTriangle,
  	RightTriangleEqual: RightTriangleEqual,
  	RightUpDownVector: RightUpDownVector,
  	RightUpTeeVector: RightUpTeeVector,
  	RightUpVectorBar: RightUpVectorBar,
  	RightUpVector: RightUpVector,
  	RightVectorBar: RightVectorBar,
  	RightVector: RightVector,
  	ring: ring,
  	risingdotseq: risingdotseq,
  	rlarr: rlarr,
  	rlhar: rlhar,
  	rlm: rlm,
  	rmoustache: rmoustache,
  	rmoust: rmoust,
  	rnmid: rnmid,
  	roang: roang,
  	roarr: roarr,
  	robrk: robrk,
  	ropar: ropar,
  	ropf: ropf,
  	Ropf: Ropf,
  	roplus: roplus,
  	rotimes: rotimes,
  	RoundImplies: RoundImplies,
  	rpar: rpar,
  	rpargt: rpargt,
  	rppolint: rppolint,
  	rrarr: rrarr,
  	Rrightarrow: Rrightarrow,
  	rsaquo: rsaquo,
  	rscr: rscr,
  	Rscr: Rscr,
  	rsh: rsh,
  	Rsh: Rsh,
  	rsqb: rsqb,
  	rsquo: rsquo,
  	rsquor: rsquor,
  	rthree: rthree,
  	rtimes: rtimes,
  	rtri: rtri,
  	rtrie: rtrie,
  	rtrif: rtrif,
  	rtriltri: rtriltri,
  	RuleDelayed: RuleDelayed,
  	ruluhar: ruluhar,
  	rx: rx,
  	Sacute: Sacute,
  	sacute: sacute,
  	sbquo: sbquo,
  	scap: scap,
  	Scaron: Scaron,
  	scaron: scaron,
  	Sc: Sc,
  	sc: sc,
  	sccue: sccue,
  	sce: sce,
  	scE: scE,
  	Scedil: Scedil,
  	scedil: scedil,
  	Scirc: Scirc,
  	scirc: scirc,
  	scnap: scnap,
  	scnE: scnE,
  	scnsim: scnsim,
  	scpolint: scpolint,
  	scsim: scsim,
  	Scy: Scy,
  	scy: scy,
  	sdotb: sdotb,
  	sdot: sdot,
  	sdote: sdote,
  	searhk: searhk,
  	searr: searr,
  	seArr: seArr,
  	searrow: searrow,
  	sect: sect,
  	semi: semi,
  	seswar: seswar,
  	setminus: setminus,
  	setmn: setmn,
  	sext: sext,
  	Sfr: Sfr,
  	sfr: sfr,
  	sfrown: sfrown,
  	sharp: sharp,
  	SHCHcy: SHCHcy,
  	shchcy: shchcy,
  	SHcy: SHcy,
  	shcy: shcy,
  	ShortDownArrow: ShortDownArrow,
  	ShortLeftArrow: ShortLeftArrow,
  	shortmid: shortmid,
  	shortparallel: shortparallel,
  	ShortRightArrow: ShortRightArrow,
  	ShortUpArrow: ShortUpArrow,
  	shy: shy,
  	Sigma: Sigma,
  	sigma: sigma,
  	sigmaf: sigmaf,
  	sigmav: sigmav,
  	sim: sim,
  	simdot: simdot,
  	sime: sime,
  	simeq: simeq,
  	simg: simg,
  	simgE: simgE,
  	siml: siml,
  	simlE: simlE,
  	simne: simne,
  	simplus: simplus,
  	simrarr: simrarr,
  	slarr: slarr,
  	SmallCircle: SmallCircle,
  	smallsetminus: smallsetminus,
  	smashp: smashp,
  	smeparsl: smeparsl,
  	smid: smid,
  	smile: smile,
  	smt: smt,
  	smte: smte,
  	smtes: smtes,
  	SOFTcy: SOFTcy,
  	softcy: softcy,
  	solbar: solbar,
  	solb: solb,
  	sol: sol,
  	Sopf: Sopf,
  	sopf: sopf,
  	spades: spades,
  	spadesuit: spadesuit,
  	spar: spar,
  	sqcap: sqcap,
  	sqcaps: sqcaps,
  	sqcup: sqcup,
  	sqcups: sqcups,
  	Sqrt: Sqrt,
  	sqsub: sqsub,
  	sqsube: sqsube,
  	sqsubset: sqsubset,
  	sqsubseteq: sqsubseteq,
  	sqsup: sqsup,
  	sqsupe: sqsupe,
  	sqsupset: sqsupset,
  	sqsupseteq: sqsupseteq,
  	square: square,
  	Square: Square,
  	SquareIntersection: SquareIntersection,
  	SquareSubset: SquareSubset,
  	SquareSubsetEqual: SquareSubsetEqual,
  	SquareSuperset: SquareSuperset,
  	SquareSupersetEqual: SquareSupersetEqual,
  	SquareUnion: SquareUnion,
  	squarf: squarf,
  	squ: squ,
  	squf: squf,
  	srarr: srarr,
  	Sscr: Sscr,
  	sscr: sscr,
  	ssetmn: ssetmn,
  	ssmile: ssmile,
  	sstarf: sstarf,
  	Star: Star,
  	star: star,
  	starf: starf,
  	straightepsilon: straightepsilon,
  	straightphi: straightphi,
  	strns: strns,
  	sub: sub,
  	Sub: Sub,
  	subdot: subdot,
  	subE: subE,
  	sube: sube,
  	subedot: subedot,
  	submult: submult,
  	subnE: subnE,
  	subne: subne,
  	subplus: subplus,
  	subrarr: subrarr,
  	subset: subset,
  	Subset: Subset,
  	subseteq: subseteq,
  	subseteqq: subseteqq,
  	SubsetEqual: SubsetEqual,
  	subsetneq: subsetneq,
  	subsetneqq: subsetneqq,
  	subsim: subsim,
  	subsub: subsub,
  	subsup: subsup,
  	succapprox: succapprox,
  	succ: succ,
  	succcurlyeq: succcurlyeq,
  	Succeeds: Succeeds,
  	SucceedsEqual: SucceedsEqual,
  	SucceedsSlantEqual: SucceedsSlantEqual,
  	SucceedsTilde: SucceedsTilde,
  	succeq: succeq,
  	succnapprox: succnapprox,
  	succneqq: succneqq,
  	succnsim: succnsim,
  	succsim: succsim,
  	SuchThat: SuchThat,
  	sum: sum,
  	Sum: Sum,
  	sung: sung,
  	sup1: sup1,
  	sup2: sup2,
  	sup3: sup3,
  	sup: sup,
  	Sup: Sup,
  	supdot: supdot,
  	supdsub: supdsub,
  	supE: supE,
  	supe: supe,
  	supedot: supedot,
  	Superset: Superset,
  	SupersetEqual: SupersetEqual,
  	suphsol: suphsol,
  	suphsub: suphsub,
  	suplarr: suplarr,
  	supmult: supmult,
  	supnE: supnE,
  	supne: supne,
  	supplus: supplus,
  	supset: supset,
  	Supset: Supset,
  	supseteq: supseteq,
  	supseteqq: supseteqq,
  	supsetneq: supsetneq,
  	supsetneqq: supsetneqq,
  	supsim: supsim,
  	supsub: supsub,
  	supsup: supsup,
  	swarhk: swarhk,
  	swarr: swarr,
  	swArr: swArr,
  	swarrow: swarrow,
  	swnwar: swnwar,
  	szlig: szlig,
  	Tab: Tab,
  	target: target,
  	Tau: Tau,
  	tau: tau,
  	tbrk: tbrk,
  	Tcaron: Tcaron,
  	tcaron: tcaron,
  	Tcedil: Tcedil,
  	tcedil: tcedil,
  	Tcy: Tcy,
  	tcy: tcy,
  	tdot: tdot,
  	telrec: telrec,
  	Tfr: Tfr,
  	tfr: tfr,
  	there4: there4,
  	therefore: therefore,
  	Therefore: Therefore,
  	Theta: Theta,
  	theta: theta,
  	thetasym: thetasym,
  	thetav: thetav,
  	thickapprox: thickapprox,
  	thicksim: thicksim,
  	ThickSpace: ThickSpace,
  	ThinSpace: ThinSpace,
  	thinsp: thinsp,
  	thkap: thkap,
  	thksim: thksim,
  	THORN: THORN,
  	thorn: thorn,
  	tilde: tilde,
  	Tilde: Tilde,
  	TildeEqual: TildeEqual,
  	TildeFullEqual: TildeFullEqual,
  	TildeTilde: TildeTilde,
  	timesbar: timesbar,
  	timesb: timesb,
  	times: times,
  	timesd: timesd,
  	tint: tint,
  	toea: toea,
  	topbot: topbot,
  	topcir: topcir,
  	top: top,
  	Topf: Topf,
  	topf: topf,
  	topfork: topfork,
  	tosa: tosa,
  	tprime: tprime,
  	trade: trade,
  	TRADE: TRADE,
  	triangle: triangle,
  	triangledown: triangledown,
  	triangleleft: triangleleft,
  	trianglelefteq: trianglelefteq,
  	triangleq: triangleq,
  	triangleright: triangleright,
  	trianglerighteq: trianglerighteq,
  	tridot: tridot,
  	trie: trie,
  	triminus: triminus,
  	TripleDot: TripleDot,
  	triplus: triplus,
  	trisb: trisb,
  	tritime: tritime,
  	trpezium: trpezium,
  	Tscr: Tscr,
  	tscr: tscr,
  	TScy: TScy,
  	tscy: tscy,
  	TSHcy: TSHcy,
  	tshcy: tshcy,
  	Tstrok: Tstrok,
  	tstrok: tstrok,
  	twixt: twixt,
  	twoheadleftarrow: twoheadleftarrow,
  	twoheadrightarrow: twoheadrightarrow,
  	Uacute: Uacute,
  	uacute: uacute,
  	uarr: uarr,
  	Uarr: Uarr,
  	uArr: uArr,
  	Uarrocir: Uarrocir,
  	Ubrcy: Ubrcy,
  	ubrcy: ubrcy,
  	Ubreve: Ubreve,
  	ubreve: ubreve,
  	Ucirc: Ucirc,
  	ucirc: ucirc,
  	Ucy: Ucy,
  	ucy: ucy,
  	udarr: udarr,
  	Udblac: Udblac,
  	udblac: udblac,
  	udhar: udhar,
  	ufisht: ufisht,
  	Ufr: Ufr,
  	ufr: ufr,
  	Ugrave: Ugrave,
  	ugrave: ugrave,
  	uHar: uHar,
  	uharl: uharl,
  	uharr: uharr,
  	uhblk: uhblk,
  	ulcorn: ulcorn,
  	ulcorner: ulcorner,
  	ulcrop: ulcrop,
  	ultri: ultri,
  	Umacr: Umacr,
  	umacr: umacr,
  	uml: uml,
  	UnderBar: UnderBar,
  	UnderBrace: UnderBrace,
  	UnderBracket: UnderBracket,
  	UnderParenthesis: UnderParenthesis,
  	Union: Union,
  	UnionPlus: UnionPlus,
  	Uogon: Uogon,
  	uogon: uogon,
  	Uopf: Uopf,
  	uopf: uopf,
  	UpArrowBar: UpArrowBar,
  	uparrow: uparrow,
  	UpArrow: UpArrow,
  	Uparrow: Uparrow,
  	UpArrowDownArrow: UpArrowDownArrow,
  	updownarrow: updownarrow,
  	UpDownArrow: UpDownArrow,
  	Updownarrow: Updownarrow,
  	UpEquilibrium: UpEquilibrium,
  	upharpoonleft: upharpoonleft,
  	upharpoonright: upharpoonright,
  	uplus: uplus,
  	UpperLeftArrow: UpperLeftArrow,
  	UpperRightArrow: UpperRightArrow,
  	upsi: upsi,
  	Upsi: Upsi,
  	upsih: upsih,
  	Upsilon: Upsilon,
  	upsilon: upsilon,
  	UpTeeArrow: UpTeeArrow,
  	UpTee: UpTee,
  	upuparrows: upuparrows,
  	urcorn: urcorn,
  	urcorner: urcorner,
  	urcrop: urcrop,
  	Uring: Uring,
  	uring: uring,
  	urtri: urtri,
  	Uscr: Uscr,
  	uscr: uscr,
  	utdot: utdot,
  	Utilde: Utilde,
  	utilde: utilde,
  	utri: utri,
  	utrif: utrif,
  	uuarr: uuarr,
  	Uuml: Uuml,
  	uuml: uuml,
  	uwangle: uwangle,
  	vangrt: vangrt,
  	varepsilon: varepsilon,
  	varkappa: varkappa,
  	varnothing: varnothing,
  	varphi: varphi,
  	varpi: varpi,
  	varpropto: varpropto,
  	varr: varr,
  	vArr: vArr,
  	varrho: varrho,
  	varsigma: varsigma,
  	varsubsetneq: varsubsetneq,
  	varsubsetneqq: varsubsetneqq,
  	varsupsetneq: varsupsetneq,
  	varsupsetneqq: varsupsetneqq,
  	vartheta: vartheta,
  	vartriangleleft: vartriangleleft,
  	vartriangleright: vartriangleright,
  	vBar: vBar,
  	Vbar: Vbar,
  	vBarv: vBarv,
  	Vcy: Vcy,
  	vcy: vcy,
  	vdash: vdash,
  	vDash: vDash,
  	Vdash: Vdash,
  	VDash: VDash,
  	Vdashl: Vdashl,
  	veebar: veebar,
  	vee: vee,
  	Vee: Vee,
  	veeeq: veeeq,
  	vellip: vellip,
  	verbar: verbar,
  	Verbar: Verbar,
  	vert: vert,
  	Vert: Vert,
  	VerticalBar: VerticalBar,
  	VerticalLine: VerticalLine,
  	VerticalSeparator: VerticalSeparator,
  	VerticalTilde: VerticalTilde,
  	VeryThinSpace: VeryThinSpace,
  	Vfr: Vfr,
  	vfr: vfr,
  	vltri: vltri,
  	vnsub: vnsub,
  	vnsup: vnsup,
  	Vopf: Vopf,
  	vopf: vopf,
  	vprop: vprop,
  	vrtri: vrtri,
  	Vscr: Vscr,
  	vscr: vscr,
  	vsubnE: vsubnE,
  	vsubne: vsubne,
  	vsupnE: vsupnE,
  	vsupne: vsupne,
  	Vvdash: Vvdash,
  	vzigzag: vzigzag,
  	Wcirc: Wcirc,
  	wcirc: wcirc,
  	wedbar: wedbar,
  	wedge: wedge,
  	Wedge: Wedge,
  	wedgeq: wedgeq,
  	weierp: weierp,
  	Wfr: Wfr,
  	wfr: wfr,
  	Wopf: Wopf,
  	wopf: wopf,
  	wp: wp,
  	wr: wr,
  	wreath: wreath,
  	Wscr: Wscr,
  	wscr: wscr,
  	xcap: xcap,
  	xcirc: xcirc,
  	xcup: xcup,
  	xdtri: xdtri,
  	Xfr: Xfr,
  	xfr: xfr,
  	xharr: xharr,
  	xhArr: xhArr,
  	Xi: Xi,
  	xi: xi,
  	xlarr: xlarr,
  	xlArr: xlArr,
  	xmap: xmap,
  	xnis: xnis,
  	xodot: xodot,
  	Xopf: Xopf,
  	xopf: xopf,
  	xoplus: xoplus,
  	xotime: xotime,
  	xrarr: xrarr,
  	xrArr: xrArr,
  	Xscr: Xscr,
  	xscr: xscr,
  	xsqcup: xsqcup,
  	xuplus: xuplus,
  	xutri: xutri,
  	xvee: xvee,
  	xwedge: xwedge,
  	Yacute: Yacute,
  	yacute: yacute,
  	YAcy: YAcy,
  	yacy: yacy,
  	Ycirc: Ycirc,
  	ycirc: ycirc,
  	Ycy: Ycy,
  	ycy: ycy,
  	yen: yen,
  	Yfr: Yfr,
  	yfr: yfr,
  	YIcy: YIcy,
  	yicy: yicy,
  	Yopf: Yopf,
  	yopf: yopf,
  	Yscr: Yscr,
  	yscr: yscr,
  	YUcy: YUcy,
  	yucy: yucy,
  	yuml: yuml,
  	Yuml: Yuml,
  	Zacute: Zacute,
  	zacute: zacute,
  	Zcaron: Zcaron,
  	zcaron: zcaron,
  	Zcy: Zcy,
  	zcy: zcy,
  	Zdot: Zdot,
  	zdot: zdot,
  	zeetrf: zeetrf,
  	ZeroWidthSpace: ZeroWidthSpace,
  	Zeta: Zeta,
  	zeta: zeta,
  	zfr: zfr,
  	Zfr: Zfr,
  	ZHcy: ZHcy,
  	zhcy: zhcy,
  	zigrarr: zigrarr,
  	zopf: zopf,
  	Zopf: Zopf,
  	Zscr: Zscr,
  	zscr: zscr,
  	zwj: zwj,
  	zwnj: zwnj
  };

  var entities$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Aacute: Aacute,
    aacute: aacute,
    Abreve: Abreve,
    abreve: abreve,
    ac: ac,
    acd: acd,
    acE: acE,
    Acirc: Acirc,
    acirc: acirc,
    acute: acute,
    Acy: Acy,
    acy: acy,
    AElig: AElig,
    aelig: aelig,
    af: af,
    Afr: Afr,
    afr: afr,
    Agrave: Agrave,
    agrave: agrave,
    alefsym: alefsym,
    aleph: aleph,
    Alpha: Alpha,
    alpha: alpha,
    Amacr: Amacr,
    amacr: amacr,
    amalg: amalg,
    amp: amp$1,
    AMP: AMP,
    andand: andand,
    And: And,
    and: and,
    andd: andd,
    andslope: andslope,
    andv: andv,
    ang: ang,
    ange: ange,
    angle: angle,
    angmsdaa: angmsdaa,
    angmsdab: angmsdab,
    angmsdac: angmsdac,
    angmsdad: angmsdad,
    angmsdae: angmsdae,
    angmsdaf: angmsdaf,
    angmsdag: angmsdag,
    angmsdah: angmsdah,
    angmsd: angmsd,
    angrt: angrt,
    angrtvb: angrtvb,
    angrtvbd: angrtvbd,
    angsph: angsph,
    angst: angst,
    angzarr: angzarr,
    Aogon: Aogon,
    aogon: aogon,
    Aopf: Aopf,
    aopf: aopf,
    apacir: apacir,
    ap: ap,
    apE: apE,
    ape: ape,
    apid: apid,
    apos: apos$1,
    ApplyFunction: ApplyFunction,
    approx: approx,
    approxeq: approxeq,
    Aring: Aring,
    aring: aring,
    Ascr: Ascr,
    ascr: ascr,
    Assign: Assign,
    ast: ast,
    asymp: asymp,
    asympeq: asympeq,
    Atilde: Atilde,
    atilde: atilde,
    Auml: Auml,
    auml: auml,
    awconint: awconint,
    awint: awint,
    backcong: backcong,
    backepsilon: backepsilon,
    backprime: backprime,
    backsim: backsim,
    backsimeq: backsimeq,
    Backslash: Backslash,
    Barv: Barv,
    barvee: barvee,
    barwed: barwed,
    Barwed: Barwed,
    barwedge: barwedge,
    bbrk: bbrk,
    bbrktbrk: bbrktbrk,
    bcong: bcong,
    Bcy: Bcy,
    bcy: bcy,
    bdquo: bdquo,
    becaus: becaus,
    because: because,
    Because: Because,
    bemptyv: bemptyv,
    bepsi: bepsi,
    bernou: bernou,
    Bernoullis: Bernoullis,
    Beta: Beta,
    beta: beta,
    beth: beth,
    between: between,
    Bfr: Bfr,
    bfr: bfr,
    bigcap: bigcap,
    bigcirc: bigcirc,
    bigcup: bigcup,
    bigodot: bigodot,
    bigoplus: bigoplus,
    bigotimes: bigotimes,
    bigsqcup: bigsqcup,
    bigstar: bigstar,
    bigtriangledown: bigtriangledown,
    bigtriangleup: bigtriangleup,
    biguplus: biguplus,
    bigvee: bigvee,
    bigwedge: bigwedge,
    bkarow: bkarow,
    blacklozenge: blacklozenge,
    blacksquare: blacksquare,
    blacktriangle: blacktriangle,
    blacktriangledown: blacktriangledown,
    blacktriangleleft: blacktriangleleft,
    blacktriangleright: blacktriangleright,
    blank: blank,
    blk12: blk12,
    blk14: blk14,
    blk34: blk34,
    block: block,
    bne: bne,
    bnequiv: bnequiv,
    bNot: bNot,
    bnot: bnot,
    Bopf: Bopf,
    bopf: bopf,
    bot: bot,
    bottom: bottom,
    bowtie: bowtie,
    boxbox: boxbox,
    boxdl: boxdl,
    boxdL: boxdL,
    boxDl: boxDl,
    boxDL: boxDL,
    boxdr: boxdr,
    boxdR: boxdR,
    boxDr: boxDr,
    boxDR: boxDR,
    boxh: boxh,
    boxH: boxH,
    boxhd: boxhd,
    boxHd: boxHd,
    boxhD: boxhD,
    boxHD: boxHD,
    boxhu: boxhu,
    boxHu: boxHu,
    boxhU: boxhU,
    boxHU: boxHU,
    boxminus: boxminus,
    boxplus: boxplus,
    boxtimes: boxtimes,
    boxul: boxul,
    boxuL: boxuL,
    boxUl: boxUl,
    boxUL: boxUL,
    boxur: boxur,
    boxuR: boxuR,
    boxUr: boxUr,
    boxUR: boxUR,
    boxv: boxv,
    boxV: boxV,
    boxvh: boxvh,
    boxvH: boxvH,
    boxVh: boxVh,
    boxVH: boxVH,
    boxvl: boxvl,
    boxvL: boxvL,
    boxVl: boxVl,
    boxVL: boxVL,
    boxvr: boxvr,
    boxvR: boxvR,
    boxVr: boxVr,
    boxVR: boxVR,
    bprime: bprime,
    breve: breve,
    Breve: Breve,
    brvbar: brvbar,
    bscr: bscr,
    Bscr: Bscr,
    bsemi: bsemi,
    bsim: bsim,
    bsime: bsime,
    bsolb: bsolb,
    bsol: bsol,
    bsolhsub: bsolhsub,
    bull: bull,
    bullet: bullet,
    bump: bump,
    bumpE: bumpE,
    bumpe: bumpe,
    Bumpeq: Bumpeq,
    bumpeq: bumpeq,
    Cacute: Cacute,
    cacute: cacute,
    capand: capand,
    capbrcup: capbrcup,
    capcap: capcap,
    cap: cap,
    Cap: Cap,
    capcup: capcup,
    capdot: capdot,
    CapitalDifferentialD: CapitalDifferentialD,
    caps: caps,
    caret: caret,
    caron: caron,
    Cayleys: Cayleys,
    ccaps: ccaps,
    Ccaron: Ccaron,
    ccaron: ccaron,
    Ccedil: Ccedil,
    ccedil: ccedil,
    Ccirc: Ccirc,
    ccirc: ccirc,
    Cconint: Cconint,
    ccups: ccups,
    ccupssm: ccupssm,
    Cdot: Cdot,
    cdot: cdot,
    cedil: cedil,
    Cedilla: Cedilla,
    cemptyv: cemptyv,
    cent: cent,
    centerdot: centerdot,
    CenterDot: CenterDot,
    cfr: cfr,
    Cfr: Cfr,
    CHcy: CHcy,
    chcy: chcy,
    check: check,
    checkmark: checkmark,
    Chi: Chi,
    chi: chi,
    circ: circ,
    circeq: circeq,
    circlearrowleft: circlearrowleft,
    circlearrowright: circlearrowright,
    circledast: circledast,
    circledcirc: circledcirc,
    circleddash: circleddash,
    CircleDot: CircleDot,
    circledR: circledR,
    circledS: circledS,
    CircleMinus: CircleMinus,
    CirclePlus: CirclePlus,
    CircleTimes: CircleTimes,
    cir: cir,
    cirE: cirE,
    cire: cire,
    cirfnint: cirfnint,
    cirmid: cirmid,
    cirscir: cirscir,
    ClockwiseContourIntegral: ClockwiseContourIntegral,
    CloseCurlyDoubleQuote: CloseCurlyDoubleQuote,
    CloseCurlyQuote: CloseCurlyQuote,
    clubs: clubs,
    clubsuit: clubsuit,
    colon: colon,
    Colon: Colon,
    Colone: Colone,
    colone: colone,
    coloneq: coloneq,
    comma: comma,
    commat: commat,
    comp: comp,
    compfn: compfn,
    complement: complement,
    complexes: complexes,
    cong: cong,
    congdot: congdot,
    Congruent: Congruent,
    conint: conint,
    Conint: Conint,
    ContourIntegral: ContourIntegral,
    copf: copf,
    Copf: Copf,
    coprod: coprod,
    Coproduct: Coproduct,
    copy: copy,
    COPY: COPY,
    copysr: copysr,
    CounterClockwiseContourIntegral: CounterClockwiseContourIntegral,
    crarr: crarr,
    cross: cross,
    Cross: Cross,
    Cscr: Cscr,
    cscr: cscr,
    csub: csub,
    csube: csube,
    csup: csup,
    csupe: csupe,
    ctdot: ctdot,
    cudarrl: cudarrl,
    cudarrr: cudarrr,
    cuepr: cuepr,
    cuesc: cuesc,
    cularr: cularr,
    cularrp: cularrp,
    cupbrcap: cupbrcap,
    cupcap: cupcap,
    CupCap: CupCap,
    cup: cup,
    Cup: Cup,
    cupcup: cupcup,
    cupdot: cupdot,
    cupor: cupor,
    cups: cups,
    curarr: curarr,
    curarrm: curarrm,
    curlyeqprec: curlyeqprec,
    curlyeqsucc: curlyeqsucc,
    curlyvee: curlyvee,
    curlywedge: curlywedge,
    curren: curren,
    curvearrowleft: curvearrowleft,
    curvearrowright: curvearrowright,
    cuvee: cuvee,
    cuwed: cuwed,
    cwconint: cwconint,
    cwint: cwint,
    cylcty: cylcty,
    dagger: dagger,
    Dagger: Dagger,
    daleth: daleth,
    darr: darr,
    Darr: Darr,
    dArr: dArr,
    dash: dash,
    Dashv: Dashv,
    dashv: dashv,
    dbkarow: dbkarow,
    dblac: dblac,
    Dcaron: Dcaron,
    dcaron: dcaron,
    Dcy: Dcy,
    dcy: dcy,
    ddagger: ddagger,
    ddarr: ddarr,
    DD: DD,
    dd: dd,
    DDotrahd: DDotrahd,
    ddotseq: ddotseq,
    deg: deg,
    Del: Del,
    Delta: Delta,
    delta: delta,
    demptyv: demptyv,
    dfisht: dfisht,
    Dfr: Dfr,
    dfr: dfr,
    dHar: dHar,
    dharl: dharl,
    dharr: dharr,
    DiacriticalAcute: DiacriticalAcute,
    DiacriticalDot: DiacriticalDot,
    DiacriticalDoubleAcute: DiacriticalDoubleAcute,
    DiacriticalGrave: DiacriticalGrave,
    DiacriticalTilde: DiacriticalTilde,
    diam: diam,
    diamond: diamond,
    Diamond: Diamond,
    diamondsuit: diamondsuit,
    diams: diams,
    die: die,
    DifferentialD: DifferentialD,
    digamma: digamma,
    disin: disin,
    div: div,
    divide: divide,
    divideontimes: divideontimes,
    divonx: divonx,
    DJcy: DJcy,
    djcy: djcy,
    dlcorn: dlcorn,
    dlcrop: dlcrop,
    dollar: dollar,
    Dopf: Dopf,
    dopf: dopf,
    Dot: Dot,
    dot: dot,
    DotDot: DotDot,
    doteq: doteq,
    doteqdot: doteqdot,
    DotEqual: DotEqual,
    dotminus: dotminus,
    dotplus: dotplus,
    dotsquare: dotsquare,
    doublebarwedge: doublebarwedge,
    DoubleContourIntegral: DoubleContourIntegral,
    DoubleDot: DoubleDot,
    DoubleDownArrow: DoubleDownArrow,
    DoubleLeftArrow: DoubleLeftArrow,
    DoubleLeftRightArrow: DoubleLeftRightArrow,
    DoubleLeftTee: DoubleLeftTee,
    DoubleLongLeftArrow: DoubleLongLeftArrow,
    DoubleLongLeftRightArrow: DoubleLongLeftRightArrow,
    DoubleLongRightArrow: DoubleLongRightArrow,
    DoubleRightArrow: DoubleRightArrow,
    DoubleRightTee: DoubleRightTee,
    DoubleUpArrow: DoubleUpArrow,
    DoubleUpDownArrow: DoubleUpDownArrow,
    DoubleVerticalBar: DoubleVerticalBar,
    DownArrowBar: DownArrowBar,
    downarrow: downarrow,
    DownArrow: DownArrow,
    Downarrow: Downarrow,
    DownArrowUpArrow: DownArrowUpArrow,
    DownBreve: DownBreve,
    downdownarrows: downdownarrows,
    downharpoonleft: downharpoonleft,
    downharpoonright: downharpoonright,
    DownLeftRightVector: DownLeftRightVector,
    DownLeftTeeVector: DownLeftTeeVector,
    DownLeftVectorBar: DownLeftVectorBar,
    DownLeftVector: DownLeftVector,
    DownRightTeeVector: DownRightTeeVector,
    DownRightVectorBar: DownRightVectorBar,
    DownRightVector: DownRightVector,
    DownTeeArrow: DownTeeArrow,
    DownTee: DownTee,
    drbkarow: drbkarow,
    drcorn: drcorn,
    drcrop: drcrop,
    Dscr: Dscr,
    dscr: dscr,
    DScy: DScy,
    dscy: dscy,
    dsol: dsol,
    Dstrok: Dstrok,
    dstrok: dstrok,
    dtdot: dtdot,
    dtri: dtri,
    dtrif: dtrif,
    duarr: duarr,
    duhar: duhar,
    dwangle: dwangle,
    DZcy: DZcy,
    dzcy: dzcy,
    dzigrarr: dzigrarr,
    Eacute: Eacute,
    eacute: eacute,
    easter: easter,
    Ecaron: Ecaron,
    ecaron: ecaron,
    Ecirc: Ecirc,
    ecirc: ecirc,
    ecir: ecir,
    ecolon: ecolon,
    Ecy: Ecy,
    ecy: ecy,
    eDDot: eDDot,
    Edot: Edot,
    edot: edot,
    eDot: eDot,
    ee: ee,
    efDot: efDot,
    Efr: Efr,
    efr: efr,
    eg: eg,
    Egrave: Egrave,
    egrave: egrave,
    egs: egs,
    egsdot: egsdot,
    el: el,
    Element: Element,
    elinters: elinters,
    ell: ell,
    els: els,
    elsdot: elsdot,
    Emacr: Emacr,
    emacr: emacr,
    empty: empty$1,
    emptyset: emptyset,
    EmptySmallSquare: EmptySmallSquare,
    emptyv: emptyv,
    EmptyVerySmallSquare: EmptyVerySmallSquare,
    emsp13: emsp13,
    emsp14: emsp14,
    emsp: emsp,
    ENG: ENG,
    eng: eng,
    ensp: ensp,
    Eogon: Eogon,
    eogon: eogon,
    Eopf: Eopf,
    eopf: eopf,
    epar: epar,
    eparsl: eparsl,
    eplus: eplus,
    epsi: epsi,
    Epsilon: Epsilon,
    epsilon: epsilon,
    epsiv: epsiv,
    eqcirc: eqcirc,
    eqcolon: eqcolon,
    eqsim: eqsim,
    eqslantgtr: eqslantgtr,
    eqslantless: eqslantless,
    Equal: Equal,
    equals: equals,
    EqualTilde: EqualTilde,
    equest: equest,
    Equilibrium: Equilibrium,
    equiv: equiv,
    equivDD: equivDD,
    eqvparsl: eqvparsl,
    erarr: erarr,
    erDot: erDot,
    escr: escr,
    Escr: Escr,
    esdot: esdot,
    Esim: Esim,
    esim: esim,
    Eta: Eta,
    eta: eta,
    ETH: ETH,
    eth: eth,
    Euml: Euml,
    euml: euml,
    euro: euro,
    excl: excl,
    exist: exist,
    Exists: Exists,
    expectation: expectation,
    exponentiale: exponentiale,
    ExponentialE: ExponentialE,
    fallingdotseq: fallingdotseq,
    Fcy: Fcy,
    fcy: fcy,
    female: female,
    ffilig: ffilig,
    fflig: fflig,
    ffllig: ffllig,
    Ffr: Ffr,
    ffr: ffr,
    filig: filig,
    FilledSmallSquare: FilledSmallSquare,
    FilledVerySmallSquare: FilledVerySmallSquare,
    fjlig: fjlig,
    flat: flat,
    fllig: fllig,
    fltns: fltns,
    fnof: fnof,
    Fopf: Fopf,
    fopf: fopf,
    forall: forall,
    ForAll: ForAll,
    fork: fork,
    forkv: forkv,
    Fouriertrf: Fouriertrf,
    fpartint: fpartint,
    frac12: frac12,
    frac13: frac13,
    frac14: frac14,
    frac15: frac15,
    frac16: frac16,
    frac18: frac18,
    frac23: frac23,
    frac25: frac25,
    frac34: frac34,
    frac35: frac35,
    frac38: frac38,
    frac45: frac45,
    frac56: frac56,
    frac58: frac58,
    frac78: frac78,
    frasl: frasl,
    frown: frown,
    fscr: fscr,
    Fscr: Fscr,
    gacute: gacute,
    Gamma: Gamma,
    gamma: gamma,
    Gammad: Gammad,
    gammad: gammad,
    gap: gap,
    Gbreve: Gbreve,
    gbreve: gbreve,
    Gcedil: Gcedil,
    Gcirc: Gcirc,
    gcirc: gcirc,
    Gcy: Gcy,
    gcy: gcy,
    Gdot: Gdot,
    gdot: gdot,
    ge: ge,
    gE: gE,
    gEl: gEl,
    gel: gel,
    geq: geq,
    geqq: geqq,
    geqslant: geqslant,
    gescc: gescc,
    ges: ges,
    gesdot: gesdot,
    gesdoto: gesdoto,
    gesdotol: gesdotol,
    gesl: gesl,
    gesles: gesles,
    Gfr: Gfr,
    gfr: gfr,
    gg: gg,
    Gg: Gg,
    ggg: ggg,
    gimel: gimel,
    GJcy: GJcy,
    gjcy: gjcy,
    gla: gla,
    gl: gl,
    glE: glE,
    glj: glj,
    gnap: gnap,
    gnapprox: gnapprox,
    gne: gne,
    gnE: gnE,
    gneq: gneq,
    gneqq: gneqq,
    gnsim: gnsim,
    Gopf: Gopf,
    gopf: gopf,
    grave: grave,
    GreaterEqual: GreaterEqual,
    GreaterEqualLess: GreaterEqualLess,
    GreaterFullEqual: GreaterFullEqual,
    GreaterGreater: GreaterGreater,
    GreaterLess: GreaterLess,
    GreaterSlantEqual: GreaterSlantEqual,
    GreaterTilde: GreaterTilde,
    Gscr: Gscr,
    gscr: gscr,
    gsim: gsim,
    gsime: gsime,
    gsiml: gsiml,
    gtcc: gtcc,
    gtcir: gtcir,
    gt: gt$1,
    GT: GT,
    Gt: Gt,
    gtdot: gtdot,
    gtlPar: gtlPar,
    gtquest: gtquest,
    gtrapprox: gtrapprox,
    gtrarr: gtrarr,
    gtrdot: gtrdot,
    gtreqless: gtreqless,
    gtreqqless: gtreqqless,
    gtrless: gtrless,
    gtrsim: gtrsim,
    gvertneqq: gvertneqq,
    gvnE: gvnE,
    Hacek: Hacek,
    hairsp: hairsp,
    half: half,
    hamilt: hamilt,
    HARDcy: HARDcy,
    hardcy: hardcy,
    harrcir: harrcir,
    harr: harr,
    hArr: hArr,
    harrw: harrw,
    Hat: Hat,
    hbar: hbar,
    Hcirc: Hcirc,
    hcirc: hcirc,
    hearts: hearts,
    heartsuit: heartsuit,
    hellip: hellip,
    hercon: hercon,
    hfr: hfr,
    Hfr: Hfr,
    HilbertSpace: HilbertSpace,
    hksearow: hksearow,
    hkswarow: hkswarow,
    hoarr: hoarr,
    homtht: homtht,
    hookleftarrow: hookleftarrow,
    hookrightarrow: hookrightarrow,
    hopf: hopf,
    Hopf: Hopf,
    horbar: horbar,
    HorizontalLine: HorizontalLine,
    hscr: hscr,
    Hscr: Hscr,
    hslash: hslash,
    Hstrok: Hstrok,
    hstrok: hstrok,
    HumpDownHump: HumpDownHump,
    HumpEqual: HumpEqual,
    hybull: hybull,
    hyphen: hyphen,
    Iacute: Iacute,
    iacute: iacute,
    ic: ic,
    Icirc: Icirc,
    icirc: icirc,
    Icy: Icy,
    icy: icy,
    Idot: Idot,
    IEcy: IEcy,
    iecy: iecy,
    iexcl: iexcl,
    iff: iff,
    ifr: ifr,
    Ifr: Ifr,
    Igrave: Igrave,
    igrave: igrave,
    ii: ii,
    iiiint: iiiint,
    iiint: iiint,
    iinfin: iinfin,
    iiota: iiota,
    IJlig: IJlig,
    ijlig: ijlig,
    Imacr: Imacr,
    imacr: imacr,
    image: image,
    ImaginaryI: ImaginaryI,
    imagline: imagline,
    imagpart: imagpart,
    imath: imath,
    Im: Im,
    imof: imof,
    imped: imped,
    Implies: Implies,
    incare: incare,
    infin: infin,
    infintie: infintie,
    inodot: inodot,
    intcal: intcal,
    int: int,
    Int: Int,
    integers: integers,
    Integral: Integral,
    intercal: intercal,
    Intersection: Intersection,
    intlarhk: intlarhk,
    intprod: intprod,
    InvisibleComma: InvisibleComma,
    InvisibleTimes: InvisibleTimes,
    IOcy: IOcy,
    iocy: iocy,
    Iogon: Iogon,
    iogon: iogon,
    Iopf: Iopf,
    iopf: iopf,
    Iota: Iota,
    iota: iota,
    iprod: iprod,
    iquest: iquest,
    iscr: iscr,
    Iscr: Iscr,
    isin: isin,
    isindot: isindot,
    isinE: isinE,
    isins: isins,
    isinsv: isinsv,
    isinv: isinv,
    it: it,
    Itilde: Itilde,
    itilde: itilde,
    Iukcy: Iukcy,
    iukcy: iukcy,
    Iuml: Iuml,
    iuml: iuml,
    Jcirc: Jcirc,
    jcirc: jcirc,
    Jcy: Jcy,
    jcy: jcy,
    Jfr: Jfr,
    jfr: jfr,
    jmath: jmath,
    Jopf: Jopf,
    jopf: jopf,
    Jscr: Jscr,
    jscr: jscr,
    Jsercy: Jsercy,
    jsercy: jsercy,
    Jukcy: Jukcy,
    jukcy: jukcy,
    Kappa: Kappa,
    kappa: kappa,
    kappav: kappav,
    Kcedil: Kcedil,
    kcedil: kcedil,
    Kcy: Kcy,
    kcy: kcy,
    Kfr: Kfr,
    kfr: kfr,
    kgreen: kgreen,
    KHcy: KHcy,
    khcy: khcy,
    KJcy: KJcy,
    kjcy: kjcy,
    Kopf: Kopf,
    kopf: kopf,
    Kscr: Kscr,
    kscr: kscr,
    lAarr: lAarr,
    Lacute: Lacute,
    lacute: lacute,
    laemptyv: laemptyv,
    lagran: lagran,
    Lambda: Lambda,
    lambda: lambda,
    lang: lang,
    Lang: Lang,
    langd: langd,
    langle: langle,
    lap: lap,
    Laplacetrf: Laplacetrf,
    laquo: laquo,
    larrb: larrb,
    larrbfs: larrbfs,
    larr: larr,
    Larr: Larr,
    lArr: lArr,
    larrfs: larrfs,
    larrhk: larrhk,
    larrlp: larrlp,
    larrpl: larrpl,
    larrsim: larrsim,
    larrtl: larrtl,
    latail: latail,
    lAtail: lAtail,
    lat: lat,
    late: late,
    lates: lates,
    lbarr: lbarr,
    lBarr: lBarr,
    lbbrk: lbbrk,
    lbrace: lbrace,
    lbrack: lbrack,
    lbrke: lbrke,
    lbrksld: lbrksld,
    lbrkslu: lbrkslu,
    Lcaron: Lcaron,
    lcaron: lcaron,
    Lcedil: Lcedil,
    lcedil: lcedil,
    lceil: lceil,
    lcub: lcub,
    Lcy: Lcy,
    lcy: lcy,
    ldca: ldca,
    ldquo: ldquo,
    ldquor: ldquor,
    ldrdhar: ldrdhar,
    ldrushar: ldrushar,
    ldsh: ldsh,
    le: le,
    lE: lE,
    LeftAngleBracket: LeftAngleBracket,
    LeftArrowBar: LeftArrowBar,
    leftarrow: leftarrow,
    LeftArrow: LeftArrow,
    Leftarrow: Leftarrow,
    LeftArrowRightArrow: LeftArrowRightArrow,
    leftarrowtail: leftarrowtail,
    LeftCeiling: LeftCeiling,
    LeftDoubleBracket: LeftDoubleBracket,
    LeftDownTeeVector: LeftDownTeeVector,
    LeftDownVectorBar: LeftDownVectorBar,
    LeftDownVector: LeftDownVector,
    LeftFloor: LeftFloor,
    leftharpoondown: leftharpoondown,
    leftharpoonup: leftharpoonup,
    leftleftarrows: leftleftarrows,
    leftrightarrow: leftrightarrow,
    LeftRightArrow: LeftRightArrow,
    Leftrightarrow: Leftrightarrow,
    leftrightarrows: leftrightarrows,
    leftrightharpoons: leftrightharpoons,
    leftrightsquigarrow: leftrightsquigarrow,
    LeftRightVector: LeftRightVector,
    LeftTeeArrow: LeftTeeArrow,
    LeftTee: LeftTee,
    LeftTeeVector: LeftTeeVector,
    leftthreetimes: leftthreetimes,
    LeftTriangleBar: LeftTriangleBar,
    LeftTriangle: LeftTriangle,
    LeftTriangleEqual: LeftTriangleEqual,
    LeftUpDownVector: LeftUpDownVector,
    LeftUpTeeVector: LeftUpTeeVector,
    LeftUpVectorBar: LeftUpVectorBar,
    LeftUpVector: LeftUpVector,
    LeftVectorBar: LeftVectorBar,
    LeftVector: LeftVector,
    lEg: lEg,
    leg: leg,
    leq: leq,
    leqq: leqq,
    leqslant: leqslant,
    lescc: lescc,
    les: les,
    lesdot: lesdot,
    lesdoto: lesdoto,
    lesdotor: lesdotor,
    lesg: lesg,
    lesges: lesges,
    lessapprox: lessapprox,
    lessdot: lessdot,
    lesseqgtr: lesseqgtr,
    lesseqqgtr: lesseqqgtr,
    LessEqualGreater: LessEqualGreater,
    LessFullEqual: LessFullEqual,
    LessGreater: LessGreater,
    lessgtr: lessgtr,
    LessLess: LessLess,
    lesssim: lesssim,
    LessSlantEqual: LessSlantEqual,
    LessTilde: LessTilde,
    lfisht: lfisht,
    lfloor: lfloor,
    Lfr: Lfr,
    lfr: lfr,
    lg: lg,
    lgE: lgE,
    lHar: lHar,
    lhard: lhard,
    lharu: lharu,
    lharul: lharul,
    lhblk: lhblk,
    LJcy: LJcy,
    ljcy: ljcy,
    llarr: llarr,
    ll: ll,
    Ll: Ll,
    llcorner: llcorner,
    Lleftarrow: Lleftarrow,
    llhard: llhard,
    lltri: lltri,
    Lmidot: Lmidot,
    lmidot: lmidot,
    lmoustache: lmoustache,
    lmoust: lmoust,
    lnap: lnap,
    lnapprox: lnapprox,
    lne: lne,
    lnE: lnE,
    lneq: lneq,
    lneqq: lneqq,
    lnsim: lnsim,
    loang: loang,
    loarr: loarr,
    lobrk: lobrk,
    longleftarrow: longleftarrow,
    LongLeftArrow: LongLeftArrow,
    Longleftarrow: Longleftarrow,
    longleftrightarrow: longleftrightarrow,
    LongLeftRightArrow: LongLeftRightArrow,
    Longleftrightarrow: Longleftrightarrow,
    longmapsto: longmapsto,
    longrightarrow: longrightarrow,
    LongRightArrow: LongRightArrow,
    Longrightarrow: Longrightarrow,
    looparrowleft: looparrowleft,
    looparrowright: looparrowright,
    lopar: lopar,
    Lopf: Lopf,
    lopf: lopf,
    loplus: loplus,
    lotimes: lotimes,
    lowast: lowast,
    lowbar: lowbar,
    LowerLeftArrow: LowerLeftArrow,
    LowerRightArrow: LowerRightArrow,
    loz: loz,
    lozenge: lozenge,
    lozf: lozf,
    lpar: lpar,
    lparlt: lparlt,
    lrarr: lrarr,
    lrcorner: lrcorner,
    lrhar: lrhar,
    lrhard: lrhard,
    lrm: lrm,
    lrtri: lrtri,
    lsaquo: lsaquo,
    lscr: lscr,
    Lscr: Lscr,
    lsh: lsh,
    Lsh: Lsh,
    lsim: lsim,
    lsime: lsime,
    lsimg: lsimg,
    lsqb: lsqb,
    lsquo: lsquo,
    lsquor: lsquor,
    Lstrok: Lstrok,
    lstrok: lstrok,
    ltcc: ltcc,
    ltcir: ltcir,
    lt: lt$1,
    LT: LT,
    Lt: Lt,
    ltdot: ltdot,
    lthree: lthree,
    ltimes: ltimes,
    ltlarr: ltlarr,
    ltquest: ltquest,
    ltri: ltri,
    ltrie: ltrie,
    ltrif: ltrif,
    ltrPar: ltrPar,
    lurdshar: lurdshar,
    luruhar: luruhar,
    lvertneqq: lvertneqq,
    lvnE: lvnE,
    macr: macr,
    male: male,
    malt: malt,
    maltese: maltese,
    map: map,
    mapsto: mapsto,
    mapstodown: mapstodown,
    mapstoleft: mapstoleft,
    mapstoup: mapstoup,
    marker: marker,
    mcomma: mcomma,
    Mcy: Mcy,
    mcy: mcy,
    mdash: mdash,
    mDDot: mDDot,
    measuredangle: measuredangle,
    MediumSpace: MediumSpace,
    Mellintrf: Mellintrf,
    Mfr: Mfr,
    mfr: mfr,
    mho: mho,
    micro: micro,
    midast: midast,
    midcir: midcir,
    mid: mid,
    middot: middot,
    minusb: minusb,
    minus: minus,
    minusd: minusd,
    minusdu: minusdu,
    MinusPlus: MinusPlus,
    mlcp: mlcp,
    mldr: mldr,
    mnplus: mnplus,
    models: models,
    Mopf: Mopf,
    mopf: mopf,
    mp: mp,
    mscr: mscr,
    Mscr: Mscr,
    mstpos: mstpos,
    Mu: Mu,
    mu: mu,
    multimap: multimap,
    mumap: mumap,
    nabla: nabla,
    Nacute: Nacute,
    nacute: nacute,
    nang: nang,
    nap: nap,
    napE: napE,
    napid: napid,
    napos: napos,
    napprox: napprox,
    natural: natural,
    naturals: naturals,
    natur: natur,
    nbsp: nbsp,
    nbump: nbump,
    nbumpe: nbumpe,
    ncap: ncap,
    Ncaron: Ncaron,
    ncaron: ncaron,
    Ncedil: Ncedil,
    ncedil: ncedil,
    ncong: ncong,
    ncongdot: ncongdot,
    ncup: ncup,
    Ncy: Ncy,
    ncy: ncy,
    ndash: ndash,
    nearhk: nearhk,
    nearr: nearr,
    neArr: neArr,
    nearrow: nearrow,
    ne: ne,
    nedot: nedot,
    NegativeMediumSpace: NegativeMediumSpace,
    NegativeThickSpace: NegativeThickSpace,
    NegativeThinSpace: NegativeThinSpace,
    NegativeVeryThinSpace: NegativeVeryThinSpace,
    nequiv: nequiv,
    nesear: nesear,
    nesim: nesim,
    NestedGreaterGreater: NestedGreaterGreater,
    NestedLessLess: NestedLessLess,
    NewLine: NewLine,
    nexist: nexist,
    nexists: nexists,
    Nfr: Nfr,
    nfr: nfr,
    ngE: ngE,
    nge: nge,
    ngeq: ngeq,
    ngeqq: ngeqq,
    ngeqslant: ngeqslant,
    nges: nges,
    nGg: nGg,
    ngsim: ngsim,
    nGt: nGt,
    ngt: ngt,
    ngtr: ngtr,
    nGtv: nGtv,
    nharr: nharr,
    nhArr: nhArr,
    nhpar: nhpar,
    ni: ni,
    nis: nis,
    nisd: nisd,
    niv: niv,
    NJcy: NJcy,
    njcy: njcy,
    nlarr: nlarr,
    nlArr: nlArr,
    nldr: nldr,
    nlE: nlE,
    nle: nle,
    nleftarrow: nleftarrow,
    nLeftarrow: nLeftarrow,
    nleftrightarrow: nleftrightarrow,
    nLeftrightarrow: nLeftrightarrow,
    nleq: nleq,
    nleqq: nleqq,
    nleqslant: nleqslant,
    nles: nles,
    nless: nless,
    nLl: nLl,
    nlsim: nlsim,
    nLt: nLt,
    nlt: nlt,
    nltri: nltri,
    nltrie: nltrie,
    nLtv: nLtv,
    nmid: nmid,
    NoBreak: NoBreak,
    NonBreakingSpace: NonBreakingSpace,
    nopf: nopf,
    Nopf: Nopf,
    Not: Not,
    not: not,
    NotCongruent: NotCongruent,
    NotCupCap: NotCupCap,
    NotDoubleVerticalBar: NotDoubleVerticalBar,
    NotElement: NotElement,
    NotEqual: NotEqual,
    NotEqualTilde: NotEqualTilde,
    NotExists: NotExists,
    NotGreater: NotGreater,
    NotGreaterEqual: NotGreaterEqual,
    NotGreaterFullEqual: NotGreaterFullEqual,
    NotGreaterGreater: NotGreaterGreater,
    NotGreaterLess: NotGreaterLess,
    NotGreaterSlantEqual: NotGreaterSlantEqual,
    NotGreaterTilde: NotGreaterTilde,
    NotHumpDownHump: NotHumpDownHump,
    NotHumpEqual: NotHumpEqual,
    notin: notin,
    notindot: notindot,
    notinE: notinE,
    notinva: notinva,
    notinvb: notinvb,
    notinvc: notinvc,
    NotLeftTriangleBar: NotLeftTriangleBar,
    NotLeftTriangle: NotLeftTriangle,
    NotLeftTriangleEqual: NotLeftTriangleEqual,
    NotLess: NotLess,
    NotLessEqual: NotLessEqual,
    NotLessGreater: NotLessGreater,
    NotLessLess: NotLessLess,
    NotLessSlantEqual: NotLessSlantEqual,
    NotLessTilde: NotLessTilde,
    NotNestedGreaterGreater: NotNestedGreaterGreater,
    NotNestedLessLess: NotNestedLessLess,
    notni: notni,
    notniva: notniva,
    notnivb: notnivb,
    notnivc: notnivc,
    NotPrecedes: NotPrecedes,
    NotPrecedesEqual: NotPrecedesEqual,
    NotPrecedesSlantEqual: NotPrecedesSlantEqual,
    NotReverseElement: NotReverseElement,
    NotRightTriangleBar: NotRightTriangleBar,
    NotRightTriangle: NotRightTriangle,
    NotRightTriangleEqual: NotRightTriangleEqual,
    NotSquareSubset: NotSquareSubset,
    NotSquareSubsetEqual: NotSquareSubsetEqual,
    NotSquareSuperset: NotSquareSuperset,
    NotSquareSupersetEqual: NotSquareSupersetEqual,
    NotSubset: NotSubset,
    NotSubsetEqual: NotSubsetEqual,
    NotSucceeds: NotSucceeds,
    NotSucceedsEqual: NotSucceedsEqual,
    NotSucceedsSlantEqual: NotSucceedsSlantEqual,
    NotSucceedsTilde: NotSucceedsTilde,
    NotSuperset: NotSuperset,
    NotSupersetEqual: NotSupersetEqual,
    NotTilde: NotTilde,
    NotTildeEqual: NotTildeEqual,
    NotTildeFullEqual: NotTildeFullEqual,
    NotTildeTilde: NotTildeTilde,
    NotVerticalBar: NotVerticalBar,
    nparallel: nparallel,
    npar: npar,
    nparsl: nparsl,
    npart: npart,
    npolint: npolint,
    npr: npr,
    nprcue: nprcue,
    nprec: nprec,
    npreceq: npreceq,
    npre: npre,
    nrarrc: nrarrc,
    nrarr: nrarr,
    nrArr: nrArr,
    nrarrw: nrarrw,
    nrightarrow: nrightarrow,
    nRightarrow: nRightarrow,
    nrtri: nrtri,
    nrtrie: nrtrie,
    nsc: nsc,
    nsccue: nsccue,
    nsce: nsce,
    Nscr: Nscr,
    nscr: nscr,
    nshortmid: nshortmid,
    nshortparallel: nshortparallel,
    nsim: nsim,
    nsime: nsime,
    nsimeq: nsimeq,
    nsmid: nsmid,
    nspar: nspar,
    nsqsube: nsqsube,
    nsqsupe: nsqsupe,
    nsub: nsub,
    nsubE: nsubE,
    nsube: nsube,
    nsubset: nsubset,
    nsubseteq: nsubseteq,
    nsubseteqq: nsubseteqq,
    nsucc: nsucc,
    nsucceq: nsucceq,
    nsup: nsup,
    nsupE: nsupE,
    nsupe: nsupe,
    nsupset: nsupset,
    nsupseteq: nsupseteq,
    nsupseteqq: nsupseteqq,
    ntgl: ntgl,
    Ntilde: Ntilde,
    ntilde: ntilde,
    ntlg: ntlg,
    ntriangleleft: ntriangleleft,
    ntrianglelefteq: ntrianglelefteq,
    ntriangleright: ntriangleright,
    ntrianglerighteq: ntrianglerighteq,
    Nu: Nu,
    nu: nu,
    num: num,
    numero: numero,
    numsp: numsp,
    nvap: nvap,
    nvdash: nvdash,
    nvDash: nvDash,
    nVdash: nVdash,
    nVDash: nVDash,
    nvge: nvge,
    nvgt: nvgt,
    nvHarr: nvHarr,
    nvinfin: nvinfin,
    nvlArr: nvlArr,
    nvle: nvle,
    nvlt: nvlt,
    nvltrie: nvltrie,
    nvrArr: nvrArr,
    nvrtrie: nvrtrie,
    nvsim: nvsim,
    nwarhk: nwarhk,
    nwarr: nwarr,
    nwArr: nwArr,
    nwarrow: nwarrow,
    nwnear: nwnear,
    Oacute: Oacute,
    oacute: oacute,
    oast: oast,
    Ocirc: Ocirc,
    ocirc: ocirc,
    ocir: ocir,
    Ocy: Ocy,
    ocy: ocy,
    odash: odash,
    Odblac: Odblac,
    odblac: odblac,
    odiv: odiv,
    odot: odot,
    odsold: odsold,
    OElig: OElig,
    oelig: oelig,
    ofcir: ofcir,
    Ofr: Ofr,
    ofr: ofr,
    ogon: ogon,
    Ograve: Ograve,
    ograve: ograve,
    ogt: ogt,
    ohbar: ohbar,
    ohm: ohm,
    oint: oint,
    olarr: olarr,
    olcir: olcir,
    olcross: olcross,
    oline: oline,
    olt: olt,
    Omacr: Omacr,
    omacr: omacr,
    Omega: Omega,
    omega: omega,
    Omicron: Omicron,
    omicron: omicron,
    omid: omid,
    ominus: ominus,
    Oopf: Oopf,
    oopf: oopf,
    opar: opar,
    OpenCurlyDoubleQuote: OpenCurlyDoubleQuote,
    OpenCurlyQuote: OpenCurlyQuote,
    operp: operp,
    oplus: oplus,
    orarr: orarr,
    Or: Or,
    or: or,
    ord: ord,
    order: order,
    orderof: orderof,
    ordf: ordf,
    ordm: ordm,
    origof: origof,
    oror: oror,
    orslope: orslope,
    orv: orv,
    oS: oS,
    Oscr: Oscr,
    oscr: oscr,
    Oslash: Oslash,
    oslash: oslash,
    osol: osol,
    Otilde: Otilde,
    otilde: otilde,
    otimesas: otimesas,
    Otimes: Otimes,
    otimes: otimes,
    Ouml: Ouml,
    ouml: ouml,
    ovbar: ovbar,
    OverBar: OverBar,
    OverBrace: OverBrace,
    OverBracket: OverBracket,
    OverParenthesis: OverParenthesis,
    para: para,
    parallel: parallel,
    par: par,
    parsim: parsim,
    parsl: parsl,
    part: part,
    PartialD: PartialD,
    Pcy: Pcy,
    pcy: pcy,
    percnt: percnt,
    period: period,
    permil: permil,
    perp: perp,
    pertenk: pertenk,
    Pfr: Pfr,
    pfr: pfr,
    Phi: Phi,
    phi: phi,
    phiv: phiv,
    phmmat: phmmat,
    phone: phone,
    Pi: Pi,
    pi: pi,
    pitchfork: pitchfork,
    piv: piv,
    planck: planck,
    planckh: planckh,
    plankv: plankv,
    plusacir: plusacir,
    plusb: plusb,
    pluscir: pluscir,
    plus: plus,
    plusdo: plusdo,
    plusdu: plusdu,
    pluse: pluse,
    PlusMinus: PlusMinus,
    plusmn: plusmn,
    plussim: plussim,
    plustwo: plustwo,
    pm: pm,
    Poincareplane: Poincareplane,
    pointint: pointint,
    popf: popf,
    Popf: Popf,
    pound: pound,
    prap: prap,
    Pr: Pr,
    pr: pr,
    prcue: prcue,
    precapprox: precapprox,
    prec: prec,
    preccurlyeq: preccurlyeq,
    Precedes: Precedes,
    PrecedesEqual: PrecedesEqual,
    PrecedesSlantEqual: PrecedesSlantEqual,
    PrecedesTilde: PrecedesTilde,
    preceq: preceq,
    precnapprox: precnapprox,
    precneqq: precneqq,
    precnsim: precnsim,
    pre: pre,
    prE: prE,
    precsim: precsim,
    prime: prime,
    Prime: Prime,
    primes: primes,
    prnap: prnap,
    prnE: prnE,
    prnsim: prnsim,
    prod: prod,
    Product: Product,
    profalar: profalar,
    profline: profline,
    profsurf: profsurf,
    prop: prop,
    Proportional: Proportional,
    Proportion: Proportion,
    propto: propto,
    prsim: prsim,
    prurel: prurel,
    Pscr: Pscr,
    pscr: pscr,
    Psi: Psi,
    psi: psi,
    puncsp: puncsp,
    Qfr: Qfr,
    qfr: qfr,
    qint: qint,
    qopf: qopf,
    Qopf: Qopf,
    qprime: qprime,
    Qscr: Qscr,
    qscr: qscr,
    quaternions: quaternions,
    quatint: quatint,
    quest: quest,
    questeq: questeq,
    quot: quot$1,
    QUOT: QUOT,
    rAarr: rAarr,
    race: race,
    Racute: Racute,
    racute: racute,
    radic: radic,
    raemptyv: raemptyv,
    rang: rang,
    Rang: Rang,
    rangd: rangd,
    range: range,
    rangle: rangle,
    raquo: raquo,
    rarrap: rarrap,
    rarrb: rarrb,
    rarrbfs: rarrbfs,
    rarrc: rarrc,
    rarr: rarr,
    Rarr: Rarr,
    rArr: rArr,
    rarrfs: rarrfs,
    rarrhk: rarrhk,
    rarrlp: rarrlp,
    rarrpl: rarrpl,
    rarrsim: rarrsim,
    Rarrtl: Rarrtl,
    rarrtl: rarrtl,
    rarrw: rarrw,
    ratail: ratail,
    rAtail: rAtail,
    ratio: ratio,
    rationals: rationals,
    rbarr: rbarr,
    rBarr: rBarr,
    RBarr: RBarr,
    rbbrk: rbbrk,
    rbrace: rbrace,
    rbrack: rbrack,
    rbrke: rbrke,
    rbrksld: rbrksld,
    rbrkslu: rbrkslu,
    Rcaron: Rcaron,
    rcaron: rcaron,
    Rcedil: Rcedil,
    rcedil: rcedil,
    rceil: rceil,
    rcub: rcub,
    Rcy: Rcy,
    rcy: rcy,
    rdca: rdca,
    rdldhar: rdldhar,
    rdquo: rdquo,
    rdquor: rdquor,
    rdsh: rdsh,
    real: real,
    realine: realine,
    realpart: realpart,
    reals: reals,
    Re: Re,
    rect: rect,
    reg: reg,
    REG: REG,
    ReverseElement: ReverseElement,
    ReverseEquilibrium: ReverseEquilibrium,
    ReverseUpEquilibrium: ReverseUpEquilibrium,
    rfisht: rfisht,
    rfloor: rfloor,
    rfr: rfr,
    Rfr: Rfr,
    rHar: rHar,
    rhard: rhard,
    rharu: rharu,
    rharul: rharul,
    Rho: Rho,
    rho: rho,
    rhov: rhov,
    RightAngleBracket: RightAngleBracket,
    RightArrowBar: RightArrowBar,
    rightarrow: rightarrow,
    RightArrow: RightArrow,
    Rightarrow: Rightarrow,
    RightArrowLeftArrow: RightArrowLeftArrow,
    rightarrowtail: rightarrowtail,
    RightCeiling: RightCeiling,
    RightDoubleBracket: RightDoubleBracket,
    RightDownTeeVector: RightDownTeeVector,
    RightDownVectorBar: RightDownVectorBar,
    RightDownVector: RightDownVector,
    RightFloor: RightFloor,
    rightharpoondown: rightharpoondown,
    rightharpoonup: rightharpoonup,
    rightleftarrows: rightleftarrows,
    rightleftharpoons: rightleftharpoons,
    rightrightarrows: rightrightarrows,
    rightsquigarrow: rightsquigarrow,
    RightTeeArrow: RightTeeArrow,
    RightTee: RightTee,
    RightTeeVector: RightTeeVector,
    rightthreetimes: rightthreetimes,
    RightTriangleBar: RightTriangleBar,
    RightTriangle: RightTriangle,
    RightTriangleEqual: RightTriangleEqual,
    RightUpDownVector: RightUpDownVector,
    RightUpTeeVector: RightUpTeeVector,
    RightUpVectorBar: RightUpVectorBar,
    RightUpVector: RightUpVector,
    RightVectorBar: RightVectorBar,
    RightVector: RightVector,
    ring: ring,
    risingdotseq: risingdotseq,
    rlarr: rlarr,
    rlhar: rlhar,
    rlm: rlm,
    rmoustache: rmoustache,
    rmoust: rmoust,
    rnmid: rnmid,
    roang: roang,
    roarr: roarr,
    robrk: robrk,
    ropar: ropar,
    ropf: ropf,
    Ropf: Ropf,
    roplus: roplus,
    rotimes: rotimes,
    RoundImplies: RoundImplies,
    rpar: rpar,
    rpargt: rpargt,
    rppolint: rppolint,
    rrarr: rrarr,
    Rrightarrow: Rrightarrow,
    rsaquo: rsaquo,
    rscr: rscr,
    Rscr: Rscr,
    rsh: rsh,
    Rsh: Rsh,
    rsqb: rsqb,
    rsquo: rsquo,
    rsquor: rsquor,
    rthree: rthree,
    rtimes: rtimes,
    rtri: rtri,
    rtrie: rtrie,
    rtrif: rtrif,
    rtriltri: rtriltri,
    RuleDelayed: RuleDelayed,
    ruluhar: ruluhar,
    rx: rx,
    Sacute: Sacute,
    sacute: sacute,
    sbquo: sbquo,
    scap: scap,
    Scaron: Scaron,
    scaron: scaron,
    Sc: Sc,
    sc: sc,
    sccue: sccue,
    sce: sce,
    scE: scE,
    Scedil: Scedil,
    scedil: scedil,
    Scirc: Scirc,
    scirc: scirc,
    scnap: scnap,
    scnE: scnE,
    scnsim: scnsim,
    scpolint: scpolint,
    scsim: scsim,
    Scy: Scy,
    scy: scy,
    sdotb: sdotb,
    sdot: sdot,
    sdote: sdote,
    searhk: searhk,
    searr: searr,
    seArr: seArr,
    searrow: searrow,
    sect: sect,
    semi: semi,
    seswar: seswar,
    setminus: setminus,
    setmn: setmn,
    sext: sext,
    Sfr: Sfr,
    sfr: sfr,
    sfrown: sfrown,
    sharp: sharp,
    SHCHcy: SHCHcy,
    shchcy: shchcy,
    SHcy: SHcy,
    shcy: shcy,
    ShortDownArrow: ShortDownArrow,
    ShortLeftArrow: ShortLeftArrow,
    shortmid: shortmid,
    shortparallel: shortparallel,
    ShortRightArrow: ShortRightArrow,
    ShortUpArrow: ShortUpArrow,
    shy: shy,
    Sigma: Sigma,
    sigma: sigma,
    sigmaf: sigmaf,
    sigmav: sigmav,
    sim: sim,
    simdot: simdot,
    sime: sime,
    simeq: simeq,
    simg: simg,
    simgE: simgE,
    siml: siml,
    simlE: simlE,
    simne: simne,
    simplus: simplus,
    simrarr: simrarr,
    slarr: slarr,
    SmallCircle: SmallCircle,
    smallsetminus: smallsetminus,
    smashp: smashp,
    smeparsl: smeparsl,
    smid: smid,
    smile: smile,
    smt: smt,
    smte: smte,
    smtes: smtes,
    SOFTcy: SOFTcy,
    softcy: softcy,
    solbar: solbar,
    solb: solb,
    sol: sol,
    Sopf: Sopf,
    sopf: sopf,
    spades: spades,
    spadesuit: spadesuit,
    spar: spar,
    sqcap: sqcap,
    sqcaps: sqcaps,
    sqcup: sqcup,
    sqcups: sqcups,
    Sqrt: Sqrt,
    sqsub: sqsub,
    sqsube: sqsube,
    sqsubset: sqsubset,
    sqsubseteq: sqsubseteq,
    sqsup: sqsup,
    sqsupe: sqsupe,
    sqsupset: sqsupset,
    sqsupseteq: sqsupseteq,
    square: square,
    Square: Square,
    SquareIntersection: SquareIntersection,
    SquareSubset: SquareSubset,
    SquareSubsetEqual: SquareSubsetEqual,
    SquareSuperset: SquareSuperset,
    SquareSupersetEqual: SquareSupersetEqual,
    SquareUnion: SquareUnion,
    squarf: squarf,
    squ: squ,
    squf: squf,
    srarr: srarr,
    Sscr: Sscr,
    sscr: sscr,
    ssetmn: ssetmn,
    ssmile: ssmile,
    sstarf: sstarf,
    Star: Star,
    star: star,
    starf: starf,
    straightepsilon: straightepsilon,
    straightphi: straightphi,
    strns: strns,
    sub: sub,
    Sub: Sub,
    subdot: subdot,
    subE: subE,
    sube: sube,
    subedot: subedot,
    submult: submult,
    subnE: subnE,
    subne: subne,
    subplus: subplus,
    subrarr: subrarr,
    subset: subset,
    Subset: Subset,
    subseteq: subseteq,
    subseteqq: subseteqq,
    SubsetEqual: SubsetEqual,
    subsetneq: subsetneq,
    subsetneqq: subsetneqq,
    subsim: subsim,
    subsub: subsub,
    subsup: subsup,
    succapprox: succapprox,
    succ: succ,
    succcurlyeq: succcurlyeq,
    Succeeds: Succeeds,
    SucceedsEqual: SucceedsEqual,
    SucceedsSlantEqual: SucceedsSlantEqual,
    SucceedsTilde: SucceedsTilde,
    succeq: succeq,
    succnapprox: succnapprox,
    succneqq: succneqq,
    succnsim: succnsim,
    succsim: succsim,
    SuchThat: SuchThat,
    sum: sum,
    Sum: Sum,
    sung: sung,
    sup1: sup1,
    sup2: sup2,
    sup3: sup3,
    sup: sup,
    Sup: Sup,
    supdot: supdot,
    supdsub: supdsub,
    supE: supE,
    supe: supe,
    supedot: supedot,
    Superset: Superset,
    SupersetEqual: SupersetEqual,
    suphsol: suphsol,
    suphsub: suphsub,
    suplarr: suplarr,
    supmult: supmult,
    supnE: supnE,
    supne: supne,
    supplus: supplus,
    supset: supset,
    Supset: Supset,
    supseteq: supseteq,
    supseteqq: supseteqq,
    supsetneq: supsetneq,
    supsetneqq: supsetneqq,
    supsim: supsim,
    supsub: supsub,
    supsup: supsup,
    swarhk: swarhk,
    swarr: swarr,
    swArr: swArr,
    swarrow: swarrow,
    swnwar: swnwar,
    szlig: szlig,
    Tab: Tab,
    target: target,
    Tau: Tau,
    tau: tau,
    tbrk: tbrk,
    Tcaron: Tcaron,
    tcaron: tcaron,
    Tcedil: Tcedil,
    tcedil: tcedil,
    Tcy: Tcy,
    tcy: tcy,
    tdot: tdot,
    telrec: telrec,
    Tfr: Tfr,
    tfr: tfr,
    there4: there4,
    therefore: therefore,
    Therefore: Therefore,
    Theta: Theta,
    theta: theta,
    thetasym: thetasym,
    thetav: thetav,
    thickapprox: thickapprox,
    thicksim: thicksim,
    ThickSpace: ThickSpace,
    ThinSpace: ThinSpace,
    thinsp: thinsp,
    thkap: thkap,
    thksim: thksim,
    THORN: THORN,
    thorn: thorn,
    tilde: tilde,
    Tilde: Tilde,
    TildeEqual: TildeEqual,
    TildeFullEqual: TildeFullEqual,
    TildeTilde: TildeTilde,
    timesbar: timesbar,
    timesb: timesb,
    times: times,
    timesd: timesd,
    tint: tint,
    toea: toea,
    topbot: topbot,
    topcir: topcir,
    top: top,
    Topf: Topf,
    topf: topf,
    topfork: topfork,
    tosa: tosa,
    tprime: tprime,
    trade: trade,
    TRADE: TRADE,
    triangle: triangle,
    triangledown: triangledown,
    triangleleft: triangleleft,
    trianglelefteq: trianglelefteq,
    triangleq: triangleq,
    triangleright: triangleright,
    trianglerighteq: trianglerighteq,
    tridot: tridot,
    trie: trie,
    triminus: triminus,
    TripleDot: TripleDot,
    triplus: triplus,
    trisb: trisb,
    tritime: tritime,
    trpezium: trpezium,
    Tscr: Tscr,
    tscr: tscr,
    TScy: TScy,
    tscy: tscy,
    TSHcy: TSHcy,
    tshcy: tshcy,
    Tstrok: Tstrok,
    tstrok: tstrok,
    twixt: twixt,
    twoheadleftarrow: twoheadleftarrow,
    twoheadrightarrow: twoheadrightarrow,
    Uacute: Uacute,
    uacute: uacute,
    uarr: uarr,
    Uarr: Uarr,
    uArr: uArr,
    Uarrocir: Uarrocir,
    Ubrcy: Ubrcy,
    ubrcy: ubrcy,
    Ubreve: Ubreve,
    ubreve: ubreve,
    Ucirc: Ucirc,
    ucirc: ucirc,
    Ucy: Ucy,
    ucy: ucy,
    udarr: udarr,
    Udblac: Udblac,
    udblac: udblac,
    udhar: udhar,
    ufisht: ufisht,
    Ufr: Ufr,
    ufr: ufr,
    Ugrave: Ugrave,
    ugrave: ugrave,
    uHar: uHar,
    uharl: uharl,
    uharr: uharr,
    uhblk: uhblk,
    ulcorn: ulcorn,
    ulcorner: ulcorner,
    ulcrop: ulcrop,
    ultri: ultri,
    Umacr: Umacr,
    umacr: umacr,
    uml: uml,
    UnderBar: UnderBar,
    UnderBrace: UnderBrace,
    UnderBracket: UnderBracket,
    UnderParenthesis: UnderParenthesis,
    Union: Union,
    UnionPlus: UnionPlus,
    Uogon: Uogon,
    uogon: uogon,
    Uopf: Uopf,
    uopf: uopf,
    UpArrowBar: UpArrowBar,
    uparrow: uparrow,
    UpArrow: UpArrow,
    Uparrow: Uparrow,
    UpArrowDownArrow: UpArrowDownArrow,
    updownarrow: updownarrow,
    UpDownArrow: UpDownArrow,
    Updownarrow: Updownarrow,
    UpEquilibrium: UpEquilibrium,
    upharpoonleft: upharpoonleft,
    upharpoonright: upharpoonright,
    uplus: uplus,
    UpperLeftArrow: UpperLeftArrow,
    UpperRightArrow: UpperRightArrow,
    upsi: upsi,
    Upsi: Upsi,
    upsih: upsih,
    Upsilon: Upsilon,
    upsilon: upsilon,
    UpTeeArrow: UpTeeArrow,
    UpTee: UpTee,
    upuparrows: upuparrows,
    urcorn: urcorn,
    urcorner: urcorner,
    urcrop: urcrop,
    Uring: Uring,
    uring: uring,
    urtri: urtri,
    Uscr: Uscr,
    uscr: uscr,
    utdot: utdot,
    Utilde: Utilde,
    utilde: utilde,
    utri: utri,
    utrif: utrif,
    uuarr: uuarr,
    Uuml: Uuml,
    uuml: uuml,
    uwangle: uwangle,
    vangrt: vangrt,
    varepsilon: varepsilon,
    varkappa: varkappa,
    varnothing: varnothing,
    varphi: varphi,
    varpi: varpi,
    varpropto: varpropto,
    varr: varr,
    vArr: vArr,
    varrho: varrho,
    varsigma: varsigma,
    varsubsetneq: varsubsetneq,
    varsubsetneqq: varsubsetneqq,
    varsupsetneq: varsupsetneq,
    varsupsetneqq: varsupsetneqq,
    vartheta: vartheta,
    vartriangleleft: vartriangleleft,
    vartriangleright: vartriangleright,
    vBar: vBar,
    Vbar: Vbar,
    vBarv: vBarv,
    Vcy: Vcy,
    vcy: vcy,
    vdash: vdash,
    vDash: vDash,
    Vdash: Vdash,
    VDash: VDash,
    Vdashl: Vdashl,
    veebar: veebar,
    vee: vee,
    Vee: Vee,
    veeeq: veeeq,
    vellip: vellip,
    verbar: verbar,
    Verbar: Verbar,
    vert: vert,
    Vert: Vert,
    VerticalBar: VerticalBar,
    VerticalLine: VerticalLine,
    VerticalSeparator: VerticalSeparator,
    VerticalTilde: VerticalTilde,
    VeryThinSpace: VeryThinSpace,
    Vfr: Vfr,
    vfr: vfr,
    vltri: vltri,
    vnsub: vnsub,
    vnsup: vnsup,
    Vopf: Vopf,
    vopf: vopf,
    vprop: vprop,
    vrtri: vrtri,
    Vscr: Vscr,
    vscr: vscr,
    vsubnE: vsubnE,
    vsubne: vsubne,
    vsupnE: vsupnE,
    vsupne: vsupne,
    Vvdash: Vvdash,
    vzigzag: vzigzag,
    Wcirc: Wcirc,
    wcirc: wcirc,
    wedbar: wedbar,
    wedge: wedge,
    Wedge: Wedge,
    wedgeq: wedgeq,
    weierp: weierp,
    Wfr: Wfr,
    wfr: wfr,
    Wopf: Wopf,
    wopf: wopf,
    wp: wp,
    wr: wr,
    wreath: wreath,
    Wscr: Wscr,
    wscr: wscr,
    xcap: xcap,
    xcirc: xcirc,
    xcup: xcup,
    xdtri: xdtri,
    Xfr: Xfr,
    xfr: xfr,
    xharr: xharr,
    xhArr: xhArr,
    Xi: Xi,
    xi: xi,
    xlarr: xlarr,
    xlArr: xlArr,
    xmap: xmap,
    xnis: xnis,
    xodot: xodot,
    Xopf: Xopf,
    xopf: xopf,
    xoplus: xoplus,
    xotime: xotime,
    xrarr: xrarr,
    xrArr: xrArr,
    Xscr: Xscr,
    xscr: xscr,
    xsqcup: xsqcup,
    xuplus: xuplus,
    xutri: xutri,
    xvee: xvee,
    xwedge: xwedge,
    Yacute: Yacute,
    yacute: yacute,
    YAcy: YAcy,
    yacy: yacy,
    Ycirc: Ycirc,
    ycirc: ycirc,
    Ycy: Ycy,
    ycy: ycy,
    yen: yen,
    Yfr: Yfr,
    yfr: yfr,
    YIcy: YIcy,
    yicy: yicy,
    Yopf: Yopf,
    yopf: yopf,
    Yscr: Yscr,
    yscr: yscr,
    YUcy: YUcy,
    yucy: yucy,
    yuml: yuml,
    Yuml: Yuml,
    Zacute: Zacute,
    zacute: zacute,
    Zcaron: Zcaron,
    zcaron: zcaron,
    Zcy: Zcy,
    zcy: zcy,
    Zdot: Zdot,
    zdot: zdot,
    zeetrf: zeetrf,
    ZeroWidthSpace: ZeroWidthSpace,
    Zeta: Zeta,
    zeta: zeta,
    zfr: zfr,
    Zfr: Zfr,
    ZHcy: ZHcy,
    zhcy: zhcy,
    zigrarr: zigrarr,
    zopf: zopf,
    Zopf: Zopf,
    Zscr: Zscr,
    zscr: zscr,
    zwj: zwj,
    zwnj: zwnj,
    'default': entities
  });

  var xmlMap = getCjsExportFromNamespace(xml$1);

  var entityMap = getCjsExportFromNamespace(entities$1);

  var inverseXML = getInverseObj(xmlMap),
      xmlReplacer = getInverseReplacer(inverseXML);

  var XML = getInverse(inverseXML, xmlReplacer);

  var inverseHTML = getInverseObj(entityMap),
      htmlReplacer = getInverseReplacer(inverseHTML);

  var HTML = getInverse(inverseHTML, htmlReplacer);

  function getInverseObj(obj) {
      return Object.keys(obj)
          .sort()
          .reduce(function(inverse, name) {
              inverse[obj[name]] = "&" + name + ";";
              return inverse;
          }, {});
  }

  function getInverseReplacer(inverse) {
      var single = [],
          multiple = [];

      Object.keys(inverse).forEach(function(k) {
          if (k.length === 1) {
              single.push("\\" + k);
          } else {
              multiple.push(k);
          }
      });

      //TODO add ranges
      multiple.unshift("[" + single.join("") + "]");

      return new RegExp(multiple.join("|"), "g");
  }

  var re_nonASCII = /[^\0-\x7F]/g,
      re_astralSymbols = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;

  function singleCharReplacer(c) {
      return (
          "&#x" +
          c
              .charCodeAt(0)
              .toString(16)
              .toUpperCase() +
          ";"
      );
  }

  function astralReplacer(c) {
      // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
      var high = c.charCodeAt(0);
      var low = c.charCodeAt(1);
      var codePoint = (high - 0xd800) * 0x400 + low - 0xdc00 + 0x10000;
      return "&#x" + codePoint.toString(16).toUpperCase() + ";";
  }

  function getInverse(inverse, re) {
      function func(name) {
          return inverse[name];
      }

      return function(data) {
          return data
              .replace(re, func)
              .replace(re_astralSymbols, astralReplacer)
              .replace(re_nonASCII, singleCharReplacer);
      };
  }

  var re_xmlChars = getInverseReplacer(inverseXML);

  function escapeXML(data) {
      return data
          .replace(re_xmlChars, singleCharReplacer)
          .replace(re_astralSymbols, astralReplacer)
          .replace(re_nonASCII, singleCharReplacer);
  }

  var escape = escapeXML;

  var encode$1 = {
  	XML: XML,
  	HTML: HTML,
  	escape: escape
  };

  var Aacute$1 = "Á";
  var aacute$1 = "á";
  var Acirc$1 = "Â";
  var acirc$1 = "â";
  var acute$1 = "´";
  var AElig$1 = "Æ";
  var aelig$1 = "æ";
  var Agrave$1 = "À";
  var agrave$1 = "à";
  var amp$2 = "&";
  var AMP$1 = "&";
  var Aring$1 = "Å";
  var aring$1 = "å";
  var Atilde$1 = "Ã";
  var atilde$1 = "ã";
  var Auml$1 = "Ä";
  var auml$1 = "ä";
  var brvbar$1 = "¦";
  var Ccedil$1 = "Ç";
  var ccedil$1 = "ç";
  var cedil$1 = "¸";
  var cent$1 = "¢";
  var copy$1 = "©";
  var COPY$1 = "©";
  var curren$1 = "¤";
  var deg$1 = "°";
  var divide$1 = "÷";
  var Eacute$1 = "É";
  var eacute$1 = "é";
  var Ecirc$1 = "Ê";
  var ecirc$1 = "ê";
  var Egrave$1 = "È";
  var egrave$1 = "è";
  var ETH$1 = "Ð";
  var eth$1 = "ð";
  var Euml$1 = "Ë";
  var euml$1 = "ë";
  var frac12$1 = "½";
  var frac14$1 = "¼";
  var frac34$1 = "¾";
  var gt$2 = ">";
  var GT$1 = ">";
  var Iacute$1 = "Í";
  var iacute$1 = "í";
  var Icirc$1 = "Î";
  var icirc$1 = "î";
  var iexcl$1 = "¡";
  var Igrave$1 = "Ì";
  var igrave$1 = "ì";
  var iquest$1 = "¿";
  var Iuml$1 = "Ï";
  var iuml$1 = "ï";
  var laquo$1 = "«";
  var lt$2 = "<";
  var LT$1 = "<";
  var macr$1 = "¯";
  var micro$1 = "µ";
  var middot$1 = "·";
  var nbsp$1 = " ";
  var not$1 = "¬";
  var Ntilde$1 = "Ñ";
  var ntilde$1 = "ñ";
  var Oacute$1 = "Ó";
  var oacute$1 = "ó";
  var Ocirc$1 = "Ô";
  var ocirc$1 = "ô";
  var Ograve$1 = "Ò";
  var ograve$1 = "ò";
  var ordf$1 = "ª";
  var ordm$1 = "º";
  var Oslash$1 = "Ø";
  var oslash$1 = "ø";
  var Otilde$1 = "Õ";
  var otilde$1 = "õ";
  var Ouml$1 = "Ö";
  var ouml$1 = "ö";
  var para$1 = "¶";
  var plusmn$1 = "±";
  var pound$1 = "£";
  var quot$2 = "\"";
  var QUOT$1 = "\"";
  var raquo$1 = "»";
  var reg$1 = "®";
  var REG$1 = "®";
  var sect$1 = "§";
  var shy$1 = "­";
  var sup1$1 = "¹";
  var sup2$1 = "²";
  var sup3$1 = "³";
  var szlig$1 = "ß";
  var THORN$1 = "Þ";
  var thorn$1 = "þ";
  var times$1 = "×";
  var Uacute$1 = "Ú";
  var uacute$1 = "ú";
  var Ucirc$1 = "Û";
  var ucirc$1 = "û";
  var Ugrave$1 = "Ù";
  var ugrave$1 = "ù";
  var uml$1 = "¨";
  var Uuml$1 = "Ü";
  var uuml$1 = "ü";
  var Yacute$1 = "Ý";
  var yacute$1 = "ý";
  var yen$1 = "¥";
  var yuml$1 = "ÿ";
  var legacy = {
  	Aacute: Aacute$1,
  	aacute: aacute$1,
  	Acirc: Acirc$1,
  	acirc: acirc$1,
  	acute: acute$1,
  	AElig: AElig$1,
  	aelig: aelig$1,
  	Agrave: Agrave$1,
  	agrave: agrave$1,
  	amp: amp$2,
  	AMP: AMP$1,
  	Aring: Aring$1,
  	aring: aring$1,
  	Atilde: Atilde$1,
  	atilde: atilde$1,
  	Auml: Auml$1,
  	auml: auml$1,
  	brvbar: brvbar$1,
  	Ccedil: Ccedil$1,
  	ccedil: ccedil$1,
  	cedil: cedil$1,
  	cent: cent$1,
  	copy: copy$1,
  	COPY: COPY$1,
  	curren: curren$1,
  	deg: deg$1,
  	divide: divide$1,
  	Eacute: Eacute$1,
  	eacute: eacute$1,
  	Ecirc: Ecirc$1,
  	ecirc: ecirc$1,
  	Egrave: Egrave$1,
  	egrave: egrave$1,
  	ETH: ETH$1,
  	eth: eth$1,
  	Euml: Euml$1,
  	euml: euml$1,
  	frac12: frac12$1,
  	frac14: frac14$1,
  	frac34: frac34$1,
  	gt: gt$2,
  	GT: GT$1,
  	Iacute: Iacute$1,
  	iacute: iacute$1,
  	Icirc: Icirc$1,
  	icirc: icirc$1,
  	iexcl: iexcl$1,
  	Igrave: Igrave$1,
  	igrave: igrave$1,
  	iquest: iquest$1,
  	Iuml: Iuml$1,
  	iuml: iuml$1,
  	laquo: laquo$1,
  	lt: lt$2,
  	LT: LT$1,
  	macr: macr$1,
  	micro: micro$1,
  	middot: middot$1,
  	nbsp: nbsp$1,
  	not: not$1,
  	Ntilde: Ntilde$1,
  	ntilde: ntilde$1,
  	Oacute: Oacute$1,
  	oacute: oacute$1,
  	Ocirc: Ocirc$1,
  	ocirc: ocirc$1,
  	Ograve: Ograve$1,
  	ograve: ograve$1,
  	ordf: ordf$1,
  	ordm: ordm$1,
  	Oslash: Oslash$1,
  	oslash: oslash$1,
  	Otilde: Otilde$1,
  	otilde: otilde$1,
  	Ouml: Ouml$1,
  	ouml: ouml$1,
  	para: para$1,
  	plusmn: plusmn$1,
  	pound: pound$1,
  	quot: quot$2,
  	QUOT: QUOT$1,
  	raquo: raquo$1,
  	reg: reg$1,
  	REG: REG$1,
  	sect: sect$1,
  	shy: shy$1,
  	sup1: sup1$1,
  	sup2: sup2$1,
  	sup3: sup3$1,
  	szlig: szlig$1,
  	THORN: THORN$1,
  	thorn: thorn$1,
  	times: times$1,
  	Uacute: Uacute$1,
  	uacute: uacute$1,
  	Ucirc: Ucirc$1,
  	ucirc: ucirc$1,
  	Ugrave: Ugrave$1,
  	ugrave: ugrave$1,
  	uml: uml$1,
  	Uuml: Uuml$1,
  	uuml: uuml$1,
  	Yacute: Yacute$1,
  	yacute: yacute$1,
  	yen: yen$1,
  	yuml: yuml$1
  };

  var legacy$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Aacute: Aacute$1,
    aacute: aacute$1,
    Acirc: Acirc$1,
    acirc: acirc$1,
    acute: acute$1,
    AElig: AElig$1,
    aelig: aelig$1,
    Agrave: Agrave$1,
    agrave: agrave$1,
    amp: amp$2,
    AMP: AMP$1,
    Aring: Aring$1,
    aring: aring$1,
    Atilde: Atilde$1,
    atilde: atilde$1,
    Auml: Auml$1,
    auml: auml$1,
    brvbar: brvbar$1,
    Ccedil: Ccedil$1,
    ccedil: ccedil$1,
    cedil: cedil$1,
    cent: cent$1,
    copy: copy$1,
    COPY: COPY$1,
    curren: curren$1,
    deg: deg$1,
    divide: divide$1,
    Eacute: Eacute$1,
    eacute: eacute$1,
    Ecirc: Ecirc$1,
    ecirc: ecirc$1,
    Egrave: Egrave$1,
    egrave: egrave$1,
    ETH: ETH$1,
    eth: eth$1,
    Euml: Euml$1,
    euml: euml$1,
    frac12: frac12$1,
    frac14: frac14$1,
    frac34: frac34$1,
    gt: gt$2,
    GT: GT$1,
    Iacute: Iacute$1,
    iacute: iacute$1,
    Icirc: Icirc$1,
    icirc: icirc$1,
    iexcl: iexcl$1,
    Igrave: Igrave$1,
    igrave: igrave$1,
    iquest: iquest$1,
    Iuml: Iuml$1,
    iuml: iuml$1,
    laquo: laquo$1,
    lt: lt$2,
    LT: LT$1,
    macr: macr$1,
    micro: micro$1,
    middot: middot$1,
    nbsp: nbsp$1,
    not: not$1,
    Ntilde: Ntilde$1,
    ntilde: ntilde$1,
    Oacute: Oacute$1,
    oacute: oacute$1,
    Ocirc: Ocirc$1,
    ocirc: ocirc$1,
    Ograve: Ograve$1,
    ograve: ograve$1,
    ordf: ordf$1,
    ordm: ordm$1,
    Oslash: Oslash$1,
    oslash: oslash$1,
    Otilde: Otilde$1,
    otilde: otilde$1,
    Ouml: Ouml$1,
    ouml: ouml$1,
    para: para$1,
    plusmn: plusmn$1,
    pound: pound$1,
    quot: quot$2,
    QUOT: QUOT$1,
    raquo: raquo$1,
    reg: reg$1,
    REG: REG$1,
    sect: sect$1,
    shy: shy$1,
    sup1: sup1$1,
    sup2: sup2$1,
    sup3: sup3$1,
    szlig: szlig$1,
    THORN: THORN$1,
    thorn: thorn$1,
    times: times$1,
    Uacute: Uacute$1,
    uacute: uacute$1,
    Ucirc: Ucirc$1,
    ucirc: ucirc$1,
    Ugrave: Ugrave$1,
    ugrave: ugrave$1,
    uml: uml$1,
    Uuml: Uuml$1,
    uuml: uuml$1,
    Yacute: Yacute$1,
    yacute: yacute$1,
    yen: yen$1,
    yuml: yuml$1,
    'default': legacy
  });

  var decode$1 = {
  	"0": 65533,
  	"128": 8364,
  	"130": 8218,
  	"131": 402,
  	"132": 8222,
  	"133": 8230,
  	"134": 8224,
  	"135": 8225,
  	"136": 710,
  	"137": 8240,
  	"138": 352,
  	"139": 8249,
  	"140": 338,
  	"142": 381,
  	"145": 8216,
  	"146": 8217,
  	"147": 8220,
  	"148": 8221,
  	"149": 8226,
  	"150": 8211,
  	"151": 8212,
  	"152": 732,
  	"153": 8482,
  	"154": 353,
  	"155": 8250,
  	"156": 339,
  	"158": 382,
  	"159": 376
  };

  var decode$2 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': decode$1
  });

  var decodeMap = getCjsExportFromNamespace(decode$2);

  var decode_codepoint = decodeCodePoint;

  // modified version of https://github.com/mathiasbynens/he/blob/master/src/he.js#L94-L119
  function decodeCodePoint(codePoint) {
      if ((codePoint >= 0xd800 && codePoint <= 0xdfff) || codePoint > 0x10ffff) {
          return "\uFFFD";
      }

      if (codePoint in decodeMap) {
          codePoint = decodeMap[codePoint];
      }

      var output = "";

      if (codePoint > 0xffff) {
          codePoint -= 0x10000;
          output += String.fromCharCode(((codePoint >>> 10) & 0x3ff) | 0xd800);
          codePoint = 0xdc00 | (codePoint & 0x3ff);
      }

      output += String.fromCharCode(codePoint);
      return output;
  }

  var legacyMap = getCjsExportFromNamespace(legacy$1);

  var decodeXMLStrict = getStrictDecoder(xmlMap),
      decodeHTMLStrict = getStrictDecoder(entityMap);

  function getStrictDecoder(map) {
      var keys = Object.keys(map).join("|"),
          replace = getReplacer(map);

      keys += "|#[xX][\\da-fA-F]+|#\\d+";

      var re = new RegExp("&(?:" + keys + ");", "g");

      return function(str) {
          return String(str).replace(re, replace);
      };
  }

  var decodeHTML = (function() {
      var legacy = Object.keys(legacyMap).sort(sorter);

      var keys = Object.keys(entityMap).sort(sorter);

      for (var i = 0, j = 0; i < keys.length; i++) {
          if (legacy[j] === keys[i]) {
              keys[i] += ";?";
              j++;
          } else {
              keys[i] += ";";
          }
      }

      var re = new RegExp("&(?:" + keys.join("|") + "|#[xX][\\da-fA-F]+;?|#\\d+;?)", "g"),
          replace = getReplacer(entityMap);

      function replacer(str) {
          if (str.substr(-1) !== ";") { str += ";"; }
          return replace(str);
      }

      //TODO consider creating a merged map
      return function(str) {
          return String(str).replace(re, replacer);
      };
  })();

  function sorter(a, b) {
      return a < b ? 1 : -1;
  }

  function getReplacer(map) {
      return function replace(str) {
          if (str.charAt(1) === "#") {
              if (str.charAt(2) === "X" || str.charAt(2) === "x") {
                  return decode_codepoint(parseInt(str.substr(3), 16));
              }
              return decode_codepoint(parseInt(str.substr(2), 10));
          }
          return map[str.slice(1, -1)];
      };
  }

  var decode$3 = {
      XML: decodeXMLStrict,
      HTML: decodeHTML,
      HTMLStrict: decodeHTMLStrict
  };

  var entities$2 = createCommonjsModule(function (module, exports) {
  exports.decode = function(data, level) {
      return (!level || level <= 0 ? decode$3.XML : decode$3.HTML)(data);
  };

  exports.decodeStrict = function(data, level) {
      return (!level || level <= 0 ? decode$3.XML : decode$3.HTMLStrict)(data);
  };

  exports.encode = function(data, level) {
      return (!level || level <= 0 ? encode$1.XML : encode$1.HTML)(data);
  };

  exports.encodeXML = encode$1.XML;

  exports.encodeHTML4 = exports.encodeHTML5 = exports.encodeHTML = encode$1.HTML;

  exports.decodeXML = exports.decodeXMLStrict = decode$3.XML;

  exports.decodeHTML4 = exports.decodeHTML5 = exports.decodeHTML = decode$3.HTML;

  exports.decodeHTML4Strict = exports.decodeHTML5Strict = exports.decodeHTMLStrict = decode$3.HTMLStrict;

  exports.escape = encode$1.escape;
  });
  var entities_1 = entities$2.decode;
  var entities_2 = entities$2.decodeStrict;
  var entities_3 = entities$2.encode;
  var entities_4 = entities$2.encodeXML;
  var entities_5 = entities$2.encodeHTML4;
  var entities_6 = entities$2.encodeHTML5;
  var entities_7 = entities$2.encodeHTML;
  var entities_8 = entities$2.decodeXML;
  var entities_9 = entities$2.decodeXMLStrict;
  var entities_10 = entities$2.decodeHTML4;
  var entities_11 = entities$2.decodeHTML5;
  var entities_12 = entities$2.decodeHTML;
  var entities_13 = entities$2.decodeHTML4Strict;
  var entities_14 = entities$2.decodeHTML5Strict;
  var entities_15 = entities$2.decodeHTMLStrict;
  var entities_16 = entities$2.escape;

  var C_BACKSLASH = 92;

  var decodeHTML$1 = entities$2.decodeHTML;

  var ENTITY = "&(?:#x[a-f0-9]{1,6}|#[0-9]{1,7}|[a-z][a-z0-9]{1,31});";

  var TAGNAME = '[A-Za-z][A-Za-z0-9-]*';
  var ATTRIBUTENAME = '[a-zA-Z_:][a-zA-Z0-9:._-]*';
  var UNQUOTEDVALUE = "[^\"'=<>`\\x00-\\x20]+";
  var SINGLEQUOTEDVALUE = "'[^']*'";
  var DOUBLEQUOTEDVALUE = '"[^"]*"';
  var ATTRIBUTEVALUE = "(?:" + UNQUOTEDVALUE + "|" + SINGLEQUOTEDVALUE + "|" + DOUBLEQUOTEDVALUE + ")";
  var ATTRIBUTEVALUESPEC = "(?:" + "\\s*=" + "\\s*" + ATTRIBUTEVALUE + ")";
  var ATTRIBUTE = "(?:" + "\\s+" + ATTRIBUTENAME + ATTRIBUTEVALUESPEC + "?)";
  var OPENTAG = "<" + TAGNAME + ATTRIBUTE + "*" + "\\s*/?>";
  var CLOSETAG = "</" + TAGNAME + "\\s*[>]";
  var HTMLCOMMENT = "<!---->|<!--(?:-?[^>-])(?:-?[^-])*-->";
  var PROCESSINGINSTRUCTION = "[<][?].*?[?][>]";
  var DECLARATION = "<![A-Z]+" + "\\s+[^>]*>";
  var CDATA = "<!\\[CDATA\\[[\\s\\S]*?\\]\\]>";
  var HTMLTAG = "(?:" + OPENTAG + "|" + CLOSETAG + "|" + HTMLCOMMENT + "|" +
          PROCESSINGINSTRUCTION + "|" + DECLARATION + "|" + CDATA + ")";
  var reHtmlTag = new RegExp('^' + HTMLTAG, 'i');

  var reBackslashOrAmp = /[\\&]/;

  var ESCAPABLE = '[!"#$%&\'()*+,./:;<=>?@[\\\\\\]^_`{|}~-]';

  var reEntityOrEscapedChar = new RegExp('\\\\' + ESCAPABLE + '|' + ENTITY, 'gi');

  var XMLSPECIAL = '[&<>"]';

  var reXmlSpecial = new RegExp(XMLSPECIAL, 'g');

  var unescapeChar = function(s) {
      if (s.charCodeAt(0) === C_BACKSLASH) {
          return s.charAt(1);
      } else {
          return decodeHTML$1(s);
      }
  };

  // Replace entities and backslash escapes with literal characters.
  var unescapeString = function(s) {
      if (reBackslashOrAmp.test(s)) {
          return s.replace(reEntityOrEscapedChar, unescapeChar);
      } else {
          return s;
      }
  };

  var normalizeURI = function(uri) {
      try {
          return encode_1(uri);
      }
      catch(err) {
          return uri;
      }
  };

  var replaceUnsafeChar = function(s) {
      switch (s) {
      case '&':
          return '&amp;';
      case '<':
          return '&lt;';
      case '>':
          return '&gt;';
      case '"':
          return '&quot;';
      default:
          return s;
      }
  };

  var escapeXml = function(s) {
      if (reXmlSpecial.test(s)) {
          return s.replace(reXmlSpecial, replaceUnsafeChar);
      } else {
          return s;
      }
  };

  var common = { unescapeString: unescapeString,
                     normalizeURI: normalizeURI,
                     escapeXml: escapeXml,
                     reHtmlTag: reHtmlTag,
                     OPENTAG: OPENTAG,
                     CLOSETAG: CLOSETAG,
                     ENTITY: ENTITY,
                     ESCAPABLE: ESCAPABLE
                   };

  /* The bulk of this code derives from https://github.com/dmoscrop/fold-case
  But in addition to case-folding, we also normalize whitespace.

  fold-case is Copyright Mathias Bynens <https://mathiasbynens.be/>

  Permission is hereby granted, free of charge, to any person obtaining
  a copy of this software and associated documentation files (the
  "Software"), to deal in the Software without restriction, including
  without limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the Software, and to
  permit persons to whom the Software is furnished to do so, subject to
  the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
  LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
  OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
  WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
  */

  /*eslint-disable  key-spacing, comma-spacing */

  var regex = /[ \t\r\n]+|[A-Z\xB5\xC0-\xD6\xD8-\xDF\u0100\u0102\u0104\u0106\u0108\u010A\u010C\u010E\u0110\u0112\u0114\u0116\u0118\u011A\u011C\u011E\u0120\u0122\u0124\u0126\u0128\u012A\u012C\u012E\u0130\u0132\u0134\u0136\u0139\u013B\u013D\u013F\u0141\u0143\u0145\u0147\u0149\u014A\u014C\u014E\u0150\u0152\u0154\u0156\u0158\u015A\u015C\u015E\u0160\u0162\u0164\u0166\u0168\u016A\u016C\u016E\u0170\u0172\u0174\u0176\u0178\u0179\u017B\u017D\u017F\u0181\u0182\u0184\u0186\u0187\u0189-\u018B\u018E-\u0191\u0193\u0194\u0196-\u0198\u019C\u019D\u019F\u01A0\u01A2\u01A4\u01A6\u01A7\u01A9\u01AC\u01AE\u01AF\u01B1-\u01B3\u01B5\u01B7\u01B8\u01BC\u01C4\u01C5\u01C7\u01C8\u01CA\u01CB\u01CD\u01CF\u01D1\u01D3\u01D5\u01D7\u01D9\u01DB\u01DE\u01E0\u01E2\u01E4\u01E6\u01E8\u01EA\u01EC\u01EE\u01F0-\u01F2\u01F4\u01F6-\u01F8\u01FA\u01FC\u01FE\u0200\u0202\u0204\u0206\u0208\u020A\u020C\u020E\u0210\u0212\u0214\u0216\u0218\u021A\u021C\u021E\u0220\u0222\u0224\u0226\u0228\u022A\u022C\u022E\u0230\u0232\u023A\u023B\u023D\u023E\u0241\u0243-\u0246\u0248\u024A\u024C\u024E\u0345\u0370\u0372\u0376\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03AB\u03B0\u03C2\u03CF-\u03D1\u03D5\u03D6\u03D8\u03DA\u03DC\u03DE\u03E0\u03E2\u03E4\u03E6\u03E8\u03EA\u03EC\u03EE\u03F0\u03F1\u03F4\u03F5\u03F7\u03F9\u03FA\u03FD-\u042F\u0460\u0462\u0464\u0466\u0468\u046A\u046C\u046E\u0470\u0472\u0474\u0476\u0478\u047A\u047C\u047E\u0480\u048A\u048C\u048E\u0490\u0492\u0494\u0496\u0498\u049A\u049C\u049E\u04A0\u04A2\u04A4\u04A6\u04A8\u04AA\u04AC\u04AE\u04B0\u04B2\u04B4\u04B6\u04B8\u04BA\u04BC\u04BE\u04C0\u04C1\u04C3\u04C5\u04C7\u04C9\u04CB\u04CD\u04D0\u04D2\u04D4\u04D6\u04D8\u04DA\u04DC\u04DE\u04E0\u04E2\u04E4\u04E6\u04E8\u04EA\u04EC\u04EE\u04F0\u04F2\u04F4\u04F6\u04F8\u04FA\u04FC\u04FE\u0500\u0502\u0504\u0506\u0508\u050A\u050C\u050E\u0510\u0512\u0514\u0516\u0518\u051A\u051C\u051E\u0520\u0522\u0524\u0526\u0528\u052A\u052C\u052E\u0531-\u0556\u0587\u10A0-\u10C5\u10C7\u10CD\u1E00\u1E02\u1E04\u1E06\u1E08\u1E0A\u1E0C\u1E0E\u1E10\u1E12\u1E14\u1E16\u1E18\u1E1A\u1E1C\u1E1E\u1E20\u1E22\u1E24\u1E26\u1E28\u1E2A\u1E2C\u1E2E\u1E30\u1E32\u1E34\u1E36\u1E38\u1E3A\u1E3C\u1E3E\u1E40\u1E42\u1E44\u1E46\u1E48\u1E4A\u1E4C\u1E4E\u1E50\u1E52\u1E54\u1E56\u1E58\u1E5A\u1E5C\u1E5E\u1E60\u1E62\u1E64\u1E66\u1E68\u1E6A\u1E6C\u1E6E\u1E70\u1E72\u1E74\u1E76\u1E78\u1E7A\u1E7C\u1E7E\u1E80\u1E82\u1E84\u1E86\u1E88\u1E8A\u1E8C\u1E8E\u1E90\u1E92\u1E94\u1E96-\u1E9B\u1E9E\u1EA0\u1EA2\u1EA4\u1EA6\u1EA8\u1EAA\u1EAC\u1EAE\u1EB0\u1EB2\u1EB4\u1EB6\u1EB8\u1EBA\u1EBC\u1EBE\u1EC0\u1EC2\u1EC4\u1EC6\u1EC8\u1ECA\u1ECC\u1ECE\u1ED0\u1ED2\u1ED4\u1ED6\u1ED8\u1EDA\u1EDC\u1EDE\u1EE0\u1EE2\u1EE4\u1EE6\u1EE8\u1EEA\u1EEC\u1EEE\u1EF0\u1EF2\u1EF4\u1EF6\u1EF8\u1EFA\u1EFC\u1EFE\u1F08-\u1F0F\u1F18-\u1F1D\u1F28-\u1F2F\u1F38-\u1F3F\u1F48-\u1F4D\u1F50\u1F52\u1F54\u1F56\u1F59\u1F5B\u1F5D\u1F5F\u1F68-\u1F6F\u1F80-\u1FAF\u1FB2-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD2\u1FD3\u1FD6-\u1FDB\u1FE2-\u1FE4\u1FE6-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2126\u212A\u212B\u2132\u2160-\u216F\u2183\u24B6-\u24CF\u2C00-\u2C2E\u2C60\u2C62-\u2C64\u2C67\u2C69\u2C6B\u2C6D-\u2C70\u2C72\u2C75\u2C7E-\u2C80\u2C82\u2C84\u2C86\u2C88\u2C8A\u2C8C\u2C8E\u2C90\u2C92\u2C94\u2C96\u2C98\u2C9A\u2C9C\u2C9E\u2CA0\u2CA2\u2CA4\u2CA6\u2CA8\u2CAA\u2CAC\u2CAE\u2CB0\u2CB2\u2CB4\u2CB6\u2CB8\u2CBA\u2CBC\u2CBE\u2CC0\u2CC2\u2CC4\u2CC6\u2CC8\u2CCA\u2CCC\u2CCE\u2CD0\u2CD2\u2CD4\u2CD6\u2CD8\u2CDA\u2CDC\u2CDE\u2CE0\u2CE2\u2CEB\u2CED\u2CF2\uA640\uA642\uA644\uA646\uA648\uA64A\uA64C\uA64E\uA650\uA652\uA654\uA656\uA658\uA65A\uA65C\uA65E\uA660\uA662\uA664\uA666\uA668\uA66A\uA66C\uA680\uA682\uA684\uA686\uA688\uA68A\uA68C\uA68E\uA690\uA692\uA694\uA696\uA698\uA69A\uA722\uA724\uA726\uA728\uA72A\uA72C\uA72E\uA732\uA734\uA736\uA738\uA73A\uA73C\uA73E\uA740\uA742\uA744\uA746\uA748\uA74A\uA74C\uA74E\uA750\uA752\uA754\uA756\uA758\uA75A\uA75C\uA75E\uA760\uA762\uA764\uA766\uA768\uA76A\uA76C\uA76E\uA779\uA77B\uA77D\uA77E\uA780\uA782\uA784\uA786\uA78B\uA78D\uA790\uA792\uA796\uA798\uA79A\uA79C\uA79E\uA7A0\uA7A2\uA7A4\uA7A6\uA7A8\uA7AA-\uA7AD\uA7B0\uA7B1\uFB00-\uFB06\uFB13-\uFB17\uFF21-\uFF3A]|\uD801[\uDC00-\uDC27]|\uD806[\uDCA0-\uDCBF]/g;

  var map$1 = {'A':'a','B':'b','C':'c','D':'d','E':'e','F':'f','G':'g','H':'h','I':'i','J':'j','K':'k','L':'l','M':'m','N':'n','O':'o','P':'p','Q':'q','R':'r','S':'s','T':'t','U':'u','V':'v','W':'w','X':'x','Y':'y','Z':'z','\xB5':'\u03BC','\xC0':'\xE0','\xC1':'\xE1','\xC2':'\xE2','\xC3':'\xE3','\xC4':'\xE4','\xC5':'\xE5','\xC6':'\xE6','\xC7':'\xE7','\xC8':'\xE8','\xC9':'\xE9','\xCA':'\xEA','\xCB':'\xEB','\xCC':'\xEC','\xCD':'\xED','\xCE':'\xEE','\xCF':'\xEF','\xD0':'\xF0','\xD1':'\xF1','\xD2':'\xF2','\xD3':'\xF3','\xD4':'\xF4','\xD5':'\xF5','\xD6':'\xF6','\xD8':'\xF8','\xD9':'\xF9','\xDA':'\xFA','\xDB':'\xFB','\xDC':'\xFC','\xDD':'\xFD','\xDE':'\xFE','\u0100':'\u0101','\u0102':'\u0103','\u0104':'\u0105','\u0106':'\u0107','\u0108':'\u0109','\u010A':'\u010B','\u010C':'\u010D','\u010E':'\u010F','\u0110':'\u0111','\u0112':'\u0113','\u0114':'\u0115','\u0116':'\u0117','\u0118':'\u0119','\u011A':'\u011B','\u011C':'\u011D','\u011E':'\u011F','\u0120':'\u0121','\u0122':'\u0123','\u0124':'\u0125','\u0126':'\u0127','\u0128':'\u0129','\u012A':'\u012B','\u012C':'\u012D','\u012E':'\u012F','\u0132':'\u0133','\u0134':'\u0135','\u0136':'\u0137','\u0139':'\u013A','\u013B':'\u013C','\u013D':'\u013E','\u013F':'\u0140','\u0141':'\u0142','\u0143':'\u0144','\u0145':'\u0146','\u0147':'\u0148','\u014A':'\u014B','\u014C':'\u014D','\u014E':'\u014F','\u0150':'\u0151','\u0152':'\u0153','\u0154':'\u0155','\u0156':'\u0157','\u0158':'\u0159','\u015A':'\u015B','\u015C':'\u015D','\u015E':'\u015F','\u0160':'\u0161','\u0162':'\u0163','\u0164':'\u0165','\u0166':'\u0167','\u0168':'\u0169','\u016A':'\u016B','\u016C':'\u016D','\u016E':'\u016F','\u0170':'\u0171','\u0172':'\u0173','\u0174':'\u0175','\u0176':'\u0177','\u0178':'\xFF','\u0179':'\u017A','\u017B':'\u017C','\u017D':'\u017E','\u017F':'s','\u0181':'\u0253','\u0182':'\u0183','\u0184':'\u0185','\u0186':'\u0254','\u0187':'\u0188','\u0189':'\u0256','\u018A':'\u0257','\u018B':'\u018C','\u018E':'\u01DD','\u018F':'\u0259','\u0190':'\u025B','\u0191':'\u0192','\u0193':'\u0260','\u0194':'\u0263','\u0196':'\u0269','\u0197':'\u0268','\u0198':'\u0199','\u019C':'\u026F','\u019D':'\u0272','\u019F':'\u0275','\u01A0':'\u01A1','\u01A2':'\u01A3','\u01A4':'\u01A5','\u01A6':'\u0280','\u01A7':'\u01A8','\u01A9':'\u0283','\u01AC':'\u01AD','\u01AE':'\u0288','\u01AF':'\u01B0','\u01B1':'\u028A','\u01B2':'\u028B','\u01B3':'\u01B4','\u01B5':'\u01B6','\u01B7':'\u0292','\u01B8':'\u01B9','\u01BC':'\u01BD','\u01C4':'\u01C6','\u01C5':'\u01C6','\u01C7':'\u01C9','\u01C8':'\u01C9','\u01CA':'\u01CC','\u01CB':'\u01CC','\u01CD':'\u01CE','\u01CF':'\u01D0','\u01D1':'\u01D2','\u01D3':'\u01D4','\u01D5':'\u01D6','\u01D7':'\u01D8','\u01D9':'\u01DA','\u01DB':'\u01DC','\u01DE':'\u01DF','\u01E0':'\u01E1','\u01E2':'\u01E3','\u01E4':'\u01E5','\u01E6':'\u01E7','\u01E8':'\u01E9','\u01EA':'\u01EB','\u01EC':'\u01ED','\u01EE':'\u01EF','\u01F1':'\u01F3','\u01F2':'\u01F3','\u01F4':'\u01F5','\u01F6':'\u0195','\u01F7':'\u01BF','\u01F8':'\u01F9','\u01FA':'\u01FB','\u01FC':'\u01FD','\u01FE':'\u01FF','\u0200':'\u0201','\u0202':'\u0203','\u0204':'\u0205','\u0206':'\u0207','\u0208':'\u0209','\u020A':'\u020B','\u020C':'\u020D','\u020E':'\u020F','\u0210':'\u0211','\u0212':'\u0213','\u0214':'\u0215','\u0216':'\u0217','\u0218':'\u0219','\u021A':'\u021B','\u021C':'\u021D','\u021E':'\u021F','\u0220':'\u019E','\u0222':'\u0223','\u0224':'\u0225','\u0226':'\u0227','\u0228':'\u0229','\u022A':'\u022B','\u022C':'\u022D','\u022E':'\u022F','\u0230':'\u0231','\u0232':'\u0233','\u023A':'\u2C65','\u023B':'\u023C','\u023D':'\u019A','\u023E':'\u2C66','\u0241':'\u0242','\u0243':'\u0180','\u0244':'\u0289','\u0245':'\u028C','\u0246':'\u0247','\u0248':'\u0249','\u024A':'\u024B','\u024C':'\u024D','\u024E':'\u024F','\u0345':'\u03B9','\u0370':'\u0371','\u0372':'\u0373','\u0376':'\u0377','\u037F':'\u03F3','\u0386':'\u03AC','\u0388':'\u03AD','\u0389':'\u03AE','\u038A':'\u03AF','\u038C':'\u03CC','\u038E':'\u03CD','\u038F':'\u03CE','\u0391':'\u03B1','\u0392':'\u03B2','\u0393':'\u03B3','\u0394':'\u03B4','\u0395':'\u03B5','\u0396':'\u03B6','\u0397':'\u03B7','\u0398':'\u03B8','\u0399':'\u03B9','\u039A':'\u03BA','\u039B':'\u03BB','\u039C':'\u03BC','\u039D':'\u03BD','\u039E':'\u03BE','\u039F':'\u03BF','\u03A0':'\u03C0','\u03A1':'\u03C1','\u03A3':'\u03C3','\u03A4':'\u03C4','\u03A5':'\u03C5','\u03A6':'\u03C6','\u03A7':'\u03C7','\u03A8':'\u03C8','\u03A9':'\u03C9','\u03AA':'\u03CA','\u03AB':'\u03CB','\u03C2':'\u03C3','\u03CF':'\u03D7','\u03D0':'\u03B2','\u03D1':'\u03B8','\u03D5':'\u03C6','\u03D6':'\u03C0','\u03D8':'\u03D9','\u03DA':'\u03DB','\u03DC':'\u03DD','\u03DE':'\u03DF','\u03E0':'\u03E1','\u03E2':'\u03E3','\u03E4':'\u03E5','\u03E6':'\u03E7','\u03E8':'\u03E9','\u03EA':'\u03EB','\u03EC':'\u03ED','\u03EE':'\u03EF','\u03F0':'\u03BA','\u03F1':'\u03C1','\u03F4':'\u03B8','\u03F5':'\u03B5','\u03F7':'\u03F8','\u03F9':'\u03F2','\u03FA':'\u03FB','\u03FD':'\u037B','\u03FE':'\u037C','\u03FF':'\u037D','\u0400':'\u0450','\u0401':'\u0451','\u0402':'\u0452','\u0403':'\u0453','\u0404':'\u0454','\u0405':'\u0455','\u0406':'\u0456','\u0407':'\u0457','\u0408':'\u0458','\u0409':'\u0459','\u040A':'\u045A','\u040B':'\u045B','\u040C':'\u045C','\u040D':'\u045D','\u040E':'\u045E','\u040F':'\u045F','\u0410':'\u0430','\u0411':'\u0431','\u0412':'\u0432','\u0413':'\u0433','\u0414':'\u0434','\u0415':'\u0435','\u0416':'\u0436','\u0417':'\u0437','\u0418':'\u0438','\u0419':'\u0439','\u041A':'\u043A','\u041B':'\u043B','\u041C':'\u043C','\u041D':'\u043D','\u041E':'\u043E','\u041F':'\u043F','\u0420':'\u0440','\u0421':'\u0441','\u0422':'\u0442','\u0423':'\u0443','\u0424':'\u0444','\u0425':'\u0445','\u0426':'\u0446','\u0427':'\u0447','\u0428':'\u0448','\u0429':'\u0449','\u042A':'\u044A','\u042B':'\u044B','\u042C':'\u044C','\u042D':'\u044D','\u042E':'\u044E','\u042F':'\u044F','\u0460':'\u0461','\u0462':'\u0463','\u0464':'\u0465','\u0466':'\u0467','\u0468':'\u0469','\u046A':'\u046B','\u046C':'\u046D','\u046E':'\u046F','\u0470':'\u0471','\u0472':'\u0473','\u0474':'\u0475','\u0476':'\u0477','\u0478':'\u0479','\u047A':'\u047B','\u047C':'\u047D','\u047E':'\u047F','\u0480':'\u0481','\u048A':'\u048B','\u048C':'\u048D','\u048E':'\u048F','\u0490':'\u0491','\u0492':'\u0493','\u0494':'\u0495','\u0496':'\u0497','\u0498':'\u0499','\u049A':'\u049B','\u049C':'\u049D','\u049E':'\u049F','\u04A0':'\u04A1','\u04A2':'\u04A3','\u04A4':'\u04A5','\u04A6':'\u04A7','\u04A8':'\u04A9','\u04AA':'\u04AB','\u04AC':'\u04AD','\u04AE':'\u04AF','\u04B0':'\u04B1','\u04B2':'\u04B3','\u04B4':'\u04B5','\u04B6':'\u04B7','\u04B8':'\u04B9','\u04BA':'\u04BB','\u04BC':'\u04BD','\u04BE':'\u04BF','\u04C0':'\u04CF','\u04C1':'\u04C2','\u04C3':'\u04C4','\u04C5':'\u04C6','\u04C7':'\u04C8','\u04C9':'\u04CA','\u04CB':'\u04CC','\u04CD':'\u04CE','\u04D0':'\u04D1','\u04D2':'\u04D3','\u04D4':'\u04D5','\u04D6':'\u04D7','\u04D8':'\u04D9','\u04DA':'\u04DB','\u04DC':'\u04DD','\u04DE':'\u04DF','\u04E0':'\u04E1','\u04E2':'\u04E3','\u04E4':'\u04E5','\u04E6':'\u04E7','\u04E8':'\u04E9','\u04EA':'\u04EB','\u04EC':'\u04ED','\u04EE':'\u04EF','\u04F0':'\u04F1','\u04F2':'\u04F3','\u04F4':'\u04F5','\u04F6':'\u04F7','\u04F8':'\u04F9','\u04FA':'\u04FB','\u04FC':'\u04FD','\u04FE':'\u04FF','\u0500':'\u0501','\u0502':'\u0503','\u0504':'\u0505','\u0506':'\u0507','\u0508':'\u0509','\u050A':'\u050B','\u050C':'\u050D','\u050E':'\u050F','\u0510':'\u0511','\u0512':'\u0513','\u0514':'\u0515','\u0516':'\u0517','\u0518':'\u0519','\u051A':'\u051B','\u051C':'\u051D','\u051E':'\u051F','\u0520':'\u0521','\u0522':'\u0523','\u0524':'\u0525','\u0526':'\u0527','\u0528':'\u0529','\u052A':'\u052B','\u052C':'\u052D','\u052E':'\u052F','\u0531':'\u0561','\u0532':'\u0562','\u0533':'\u0563','\u0534':'\u0564','\u0535':'\u0565','\u0536':'\u0566','\u0537':'\u0567','\u0538':'\u0568','\u0539':'\u0569','\u053A':'\u056A','\u053B':'\u056B','\u053C':'\u056C','\u053D':'\u056D','\u053E':'\u056E','\u053F':'\u056F','\u0540':'\u0570','\u0541':'\u0571','\u0542':'\u0572','\u0543':'\u0573','\u0544':'\u0574','\u0545':'\u0575','\u0546':'\u0576','\u0547':'\u0577','\u0548':'\u0578','\u0549':'\u0579','\u054A':'\u057A','\u054B':'\u057B','\u054C':'\u057C','\u054D':'\u057D','\u054E':'\u057E','\u054F':'\u057F','\u0550':'\u0580','\u0551':'\u0581','\u0552':'\u0582','\u0553':'\u0583','\u0554':'\u0584','\u0555':'\u0585','\u0556':'\u0586','\u10A0':'\u2D00','\u10A1':'\u2D01','\u10A2':'\u2D02','\u10A3':'\u2D03','\u10A4':'\u2D04','\u10A5':'\u2D05','\u10A6':'\u2D06','\u10A7':'\u2D07','\u10A8':'\u2D08','\u10A9':'\u2D09','\u10AA':'\u2D0A','\u10AB':'\u2D0B','\u10AC':'\u2D0C','\u10AD':'\u2D0D','\u10AE':'\u2D0E','\u10AF':'\u2D0F','\u10B0':'\u2D10','\u10B1':'\u2D11','\u10B2':'\u2D12','\u10B3':'\u2D13','\u10B4':'\u2D14','\u10B5':'\u2D15','\u10B6':'\u2D16','\u10B7':'\u2D17','\u10B8':'\u2D18','\u10B9':'\u2D19','\u10BA':'\u2D1A','\u10BB':'\u2D1B','\u10BC':'\u2D1C','\u10BD':'\u2D1D','\u10BE':'\u2D1E','\u10BF':'\u2D1F','\u10C0':'\u2D20','\u10C1':'\u2D21','\u10C2':'\u2D22','\u10C3':'\u2D23','\u10C4':'\u2D24','\u10C5':'\u2D25','\u10C7':'\u2D27','\u10CD':'\u2D2D','\u1E00':'\u1E01','\u1E02':'\u1E03','\u1E04':'\u1E05','\u1E06':'\u1E07','\u1E08':'\u1E09','\u1E0A':'\u1E0B','\u1E0C':'\u1E0D','\u1E0E':'\u1E0F','\u1E10':'\u1E11','\u1E12':'\u1E13','\u1E14':'\u1E15','\u1E16':'\u1E17','\u1E18':'\u1E19','\u1E1A':'\u1E1B','\u1E1C':'\u1E1D','\u1E1E':'\u1E1F','\u1E20':'\u1E21','\u1E22':'\u1E23','\u1E24':'\u1E25','\u1E26':'\u1E27','\u1E28':'\u1E29','\u1E2A':'\u1E2B','\u1E2C':'\u1E2D','\u1E2E':'\u1E2F','\u1E30':'\u1E31','\u1E32':'\u1E33','\u1E34':'\u1E35','\u1E36':'\u1E37','\u1E38':'\u1E39','\u1E3A':'\u1E3B','\u1E3C':'\u1E3D','\u1E3E':'\u1E3F','\u1E40':'\u1E41','\u1E42':'\u1E43','\u1E44':'\u1E45','\u1E46':'\u1E47','\u1E48':'\u1E49','\u1E4A':'\u1E4B','\u1E4C':'\u1E4D','\u1E4E':'\u1E4F','\u1E50':'\u1E51','\u1E52':'\u1E53','\u1E54':'\u1E55','\u1E56':'\u1E57','\u1E58':'\u1E59','\u1E5A':'\u1E5B','\u1E5C':'\u1E5D','\u1E5E':'\u1E5F','\u1E60':'\u1E61','\u1E62':'\u1E63','\u1E64':'\u1E65','\u1E66':'\u1E67','\u1E68':'\u1E69','\u1E6A':'\u1E6B','\u1E6C':'\u1E6D','\u1E6E':'\u1E6F','\u1E70':'\u1E71','\u1E72':'\u1E73','\u1E74':'\u1E75','\u1E76':'\u1E77','\u1E78':'\u1E79','\u1E7A':'\u1E7B','\u1E7C':'\u1E7D','\u1E7E':'\u1E7F','\u1E80':'\u1E81','\u1E82':'\u1E83','\u1E84':'\u1E85','\u1E86':'\u1E87','\u1E88':'\u1E89','\u1E8A':'\u1E8B','\u1E8C':'\u1E8D','\u1E8E':'\u1E8F','\u1E90':'\u1E91','\u1E92':'\u1E93','\u1E94':'\u1E95','\u1E9B':'\u1E61','\u1EA0':'\u1EA1','\u1EA2':'\u1EA3','\u1EA4':'\u1EA5','\u1EA6':'\u1EA7','\u1EA8':'\u1EA9','\u1EAA':'\u1EAB','\u1EAC':'\u1EAD','\u1EAE':'\u1EAF','\u1EB0':'\u1EB1','\u1EB2':'\u1EB3','\u1EB4':'\u1EB5','\u1EB6':'\u1EB7','\u1EB8':'\u1EB9','\u1EBA':'\u1EBB','\u1EBC':'\u1EBD','\u1EBE':'\u1EBF','\u1EC0':'\u1EC1','\u1EC2':'\u1EC3','\u1EC4':'\u1EC5','\u1EC6':'\u1EC7','\u1EC8':'\u1EC9','\u1ECA':'\u1ECB','\u1ECC':'\u1ECD','\u1ECE':'\u1ECF','\u1ED0':'\u1ED1','\u1ED2':'\u1ED3','\u1ED4':'\u1ED5','\u1ED6':'\u1ED7','\u1ED8':'\u1ED9','\u1EDA':'\u1EDB','\u1EDC':'\u1EDD','\u1EDE':'\u1EDF','\u1EE0':'\u1EE1','\u1EE2':'\u1EE3','\u1EE4':'\u1EE5','\u1EE6':'\u1EE7','\u1EE8':'\u1EE9','\u1EEA':'\u1EEB','\u1EEC':'\u1EED','\u1EEE':'\u1EEF','\u1EF0':'\u1EF1','\u1EF2':'\u1EF3','\u1EF4':'\u1EF5','\u1EF6':'\u1EF7','\u1EF8':'\u1EF9','\u1EFA':'\u1EFB','\u1EFC':'\u1EFD','\u1EFE':'\u1EFF','\u1F08':'\u1F00','\u1F09':'\u1F01','\u1F0A':'\u1F02','\u1F0B':'\u1F03','\u1F0C':'\u1F04','\u1F0D':'\u1F05','\u1F0E':'\u1F06','\u1F0F':'\u1F07','\u1F18':'\u1F10','\u1F19':'\u1F11','\u1F1A':'\u1F12','\u1F1B':'\u1F13','\u1F1C':'\u1F14','\u1F1D':'\u1F15','\u1F28':'\u1F20','\u1F29':'\u1F21','\u1F2A':'\u1F22','\u1F2B':'\u1F23','\u1F2C':'\u1F24','\u1F2D':'\u1F25','\u1F2E':'\u1F26','\u1F2F':'\u1F27','\u1F38':'\u1F30','\u1F39':'\u1F31','\u1F3A':'\u1F32','\u1F3B':'\u1F33','\u1F3C':'\u1F34','\u1F3D':'\u1F35','\u1F3E':'\u1F36','\u1F3F':'\u1F37','\u1F48':'\u1F40','\u1F49':'\u1F41','\u1F4A':'\u1F42','\u1F4B':'\u1F43','\u1F4C':'\u1F44','\u1F4D':'\u1F45','\u1F59':'\u1F51','\u1F5B':'\u1F53','\u1F5D':'\u1F55','\u1F5F':'\u1F57','\u1F68':'\u1F60','\u1F69':'\u1F61','\u1F6A':'\u1F62','\u1F6B':'\u1F63','\u1F6C':'\u1F64','\u1F6D':'\u1F65','\u1F6E':'\u1F66','\u1F6F':'\u1F67','\u1FB8':'\u1FB0','\u1FB9':'\u1FB1','\u1FBA':'\u1F70','\u1FBB':'\u1F71','\u1FBE':'\u03B9','\u1FC8':'\u1F72','\u1FC9':'\u1F73','\u1FCA':'\u1F74','\u1FCB':'\u1F75','\u1FD8':'\u1FD0','\u1FD9':'\u1FD1','\u1FDA':'\u1F76','\u1FDB':'\u1F77','\u1FE8':'\u1FE0','\u1FE9':'\u1FE1','\u1FEA':'\u1F7A','\u1FEB':'\u1F7B','\u1FEC':'\u1FE5','\u1FF8':'\u1F78','\u1FF9':'\u1F79','\u1FFA':'\u1F7C','\u1FFB':'\u1F7D','\u2126':'\u03C9','\u212A':'k','\u212B':'\xE5','\u2132':'\u214E','\u2160':'\u2170','\u2161':'\u2171','\u2162':'\u2172','\u2163':'\u2173','\u2164':'\u2174','\u2165':'\u2175','\u2166':'\u2176','\u2167':'\u2177','\u2168':'\u2178','\u2169':'\u2179','\u216A':'\u217A','\u216B':'\u217B','\u216C':'\u217C','\u216D':'\u217D','\u216E':'\u217E','\u216F':'\u217F','\u2183':'\u2184','\u24B6':'\u24D0','\u24B7':'\u24D1','\u24B8':'\u24D2','\u24B9':'\u24D3','\u24BA':'\u24D4','\u24BB':'\u24D5','\u24BC':'\u24D6','\u24BD':'\u24D7','\u24BE':'\u24D8','\u24BF':'\u24D9','\u24C0':'\u24DA','\u24C1':'\u24DB','\u24C2':'\u24DC','\u24C3':'\u24DD','\u24C4':'\u24DE','\u24C5':'\u24DF','\u24C6':'\u24E0','\u24C7':'\u24E1','\u24C8':'\u24E2','\u24C9':'\u24E3','\u24CA':'\u24E4','\u24CB':'\u24E5','\u24CC':'\u24E6','\u24CD':'\u24E7','\u24CE':'\u24E8','\u24CF':'\u24E9','\u2C00':'\u2C30','\u2C01':'\u2C31','\u2C02':'\u2C32','\u2C03':'\u2C33','\u2C04':'\u2C34','\u2C05':'\u2C35','\u2C06':'\u2C36','\u2C07':'\u2C37','\u2C08':'\u2C38','\u2C09':'\u2C39','\u2C0A':'\u2C3A','\u2C0B':'\u2C3B','\u2C0C':'\u2C3C','\u2C0D':'\u2C3D','\u2C0E':'\u2C3E','\u2C0F':'\u2C3F','\u2C10':'\u2C40','\u2C11':'\u2C41','\u2C12':'\u2C42','\u2C13':'\u2C43','\u2C14':'\u2C44','\u2C15':'\u2C45','\u2C16':'\u2C46','\u2C17':'\u2C47','\u2C18':'\u2C48','\u2C19':'\u2C49','\u2C1A':'\u2C4A','\u2C1B':'\u2C4B','\u2C1C':'\u2C4C','\u2C1D':'\u2C4D','\u2C1E':'\u2C4E','\u2C1F':'\u2C4F','\u2C20':'\u2C50','\u2C21':'\u2C51','\u2C22':'\u2C52','\u2C23':'\u2C53','\u2C24':'\u2C54','\u2C25':'\u2C55','\u2C26':'\u2C56','\u2C27':'\u2C57','\u2C28':'\u2C58','\u2C29':'\u2C59','\u2C2A':'\u2C5A','\u2C2B':'\u2C5B','\u2C2C':'\u2C5C','\u2C2D':'\u2C5D','\u2C2E':'\u2C5E','\u2C60':'\u2C61','\u2C62':'\u026B','\u2C63':'\u1D7D','\u2C64':'\u027D','\u2C67':'\u2C68','\u2C69':'\u2C6A','\u2C6B':'\u2C6C','\u2C6D':'\u0251','\u2C6E':'\u0271','\u2C6F':'\u0250','\u2C70':'\u0252','\u2C72':'\u2C73','\u2C75':'\u2C76','\u2C7E':'\u023F','\u2C7F':'\u0240','\u2C80':'\u2C81','\u2C82':'\u2C83','\u2C84':'\u2C85','\u2C86':'\u2C87','\u2C88':'\u2C89','\u2C8A':'\u2C8B','\u2C8C':'\u2C8D','\u2C8E':'\u2C8F','\u2C90':'\u2C91','\u2C92':'\u2C93','\u2C94':'\u2C95','\u2C96':'\u2C97','\u2C98':'\u2C99','\u2C9A':'\u2C9B','\u2C9C':'\u2C9D','\u2C9E':'\u2C9F','\u2CA0':'\u2CA1','\u2CA2':'\u2CA3','\u2CA4':'\u2CA5','\u2CA6':'\u2CA7','\u2CA8':'\u2CA9','\u2CAA':'\u2CAB','\u2CAC':'\u2CAD','\u2CAE':'\u2CAF','\u2CB0':'\u2CB1','\u2CB2':'\u2CB3','\u2CB4':'\u2CB5','\u2CB6':'\u2CB7','\u2CB8':'\u2CB9','\u2CBA':'\u2CBB','\u2CBC':'\u2CBD','\u2CBE':'\u2CBF','\u2CC0':'\u2CC1','\u2CC2':'\u2CC3','\u2CC4':'\u2CC5','\u2CC6':'\u2CC7','\u2CC8':'\u2CC9','\u2CCA':'\u2CCB','\u2CCC':'\u2CCD','\u2CCE':'\u2CCF','\u2CD0':'\u2CD1','\u2CD2':'\u2CD3','\u2CD4':'\u2CD5','\u2CD6':'\u2CD7','\u2CD8':'\u2CD9','\u2CDA':'\u2CDB','\u2CDC':'\u2CDD','\u2CDE':'\u2CDF','\u2CE0':'\u2CE1','\u2CE2':'\u2CE3','\u2CEB':'\u2CEC','\u2CED':'\u2CEE','\u2CF2':'\u2CF3','\uA640':'\uA641','\uA642':'\uA643','\uA644':'\uA645','\uA646':'\uA647','\uA648':'\uA649','\uA64A':'\uA64B','\uA64C':'\uA64D','\uA64E':'\uA64F','\uA650':'\uA651','\uA652':'\uA653','\uA654':'\uA655','\uA656':'\uA657','\uA658':'\uA659','\uA65A':'\uA65B','\uA65C':'\uA65D','\uA65E':'\uA65F','\uA660':'\uA661','\uA662':'\uA663','\uA664':'\uA665','\uA666':'\uA667','\uA668':'\uA669','\uA66A':'\uA66B','\uA66C':'\uA66D','\uA680':'\uA681','\uA682':'\uA683','\uA684':'\uA685','\uA686':'\uA687','\uA688':'\uA689','\uA68A':'\uA68B','\uA68C':'\uA68D','\uA68E':'\uA68F','\uA690':'\uA691','\uA692':'\uA693','\uA694':'\uA695','\uA696':'\uA697','\uA698':'\uA699','\uA69A':'\uA69B','\uA722':'\uA723','\uA724':'\uA725','\uA726':'\uA727','\uA728':'\uA729','\uA72A':'\uA72B','\uA72C':'\uA72D','\uA72E':'\uA72F','\uA732':'\uA733','\uA734':'\uA735','\uA736':'\uA737','\uA738':'\uA739','\uA73A':'\uA73B','\uA73C':'\uA73D','\uA73E':'\uA73F','\uA740':'\uA741','\uA742':'\uA743','\uA744':'\uA745','\uA746':'\uA747','\uA748':'\uA749','\uA74A':'\uA74B','\uA74C':'\uA74D','\uA74E':'\uA74F','\uA750':'\uA751','\uA752':'\uA753','\uA754':'\uA755','\uA756':'\uA757','\uA758':'\uA759','\uA75A':'\uA75B','\uA75C':'\uA75D','\uA75E':'\uA75F','\uA760':'\uA761','\uA762':'\uA763','\uA764':'\uA765','\uA766':'\uA767','\uA768':'\uA769','\uA76A':'\uA76B','\uA76C':'\uA76D','\uA76E':'\uA76F','\uA779':'\uA77A','\uA77B':'\uA77C','\uA77D':'\u1D79','\uA77E':'\uA77F','\uA780':'\uA781','\uA782':'\uA783','\uA784':'\uA785','\uA786':'\uA787','\uA78B':'\uA78C','\uA78D':'\u0265','\uA790':'\uA791','\uA792':'\uA793','\uA796':'\uA797','\uA798':'\uA799','\uA79A':'\uA79B','\uA79C':'\uA79D','\uA79E':'\uA79F','\uA7A0':'\uA7A1','\uA7A2':'\uA7A3','\uA7A4':'\uA7A5','\uA7A6':'\uA7A7','\uA7A8':'\uA7A9','\uA7AA':'\u0266','\uA7AB':'\u025C','\uA7AC':'\u0261','\uA7AD':'\u026C','\uA7B0':'\u029E','\uA7B1':'\u0287','\uFF21':'\uFF41','\uFF22':'\uFF42','\uFF23':'\uFF43','\uFF24':'\uFF44','\uFF25':'\uFF45','\uFF26':'\uFF46','\uFF27':'\uFF47','\uFF28':'\uFF48','\uFF29':'\uFF49','\uFF2A':'\uFF4A','\uFF2B':'\uFF4B','\uFF2C':'\uFF4C','\uFF2D':'\uFF4D','\uFF2E':'\uFF4E','\uFF2F':'\uFF4F','\uFF30':'\uFF50','\uFF31':'\uFF51','\uFF32':'\uFF52','\uFF33':'\uFF53','\uFF34':'\uFF54','\uFF35':'\uFF55','\uFF36':'\uFF56','\uFF37':'\uFF57','\uFF38':'\uFF58','\uFF39':'\uFF59','\uFF3A':'\uFF5A','\uD801\uDC00':'\uD801\uDC28','\uD801\uDC01':'\uD801\uDC29','\uD801\uDC02':'\uD801\uDC2A','\uD801\uDC03':'\uD801\uDC2B','\uD801\uDC04':'\uD801\uDC2C','\uD801\uDC05':'\uD801\uDC2D','\uD801\uDC06':'\uD801\uDC2E','\uD801\uDC07':'\uD801\uDC2F','\uD801\uDC08':'\uD801\uDC30','\uD801\uDC09':'\uD801\uDC31','\uD801\uDC0A':'\uD801\uDC32','\uD801\uDC0B':'\uD801\uDC33','\uD801\uDC0C':'\uD801\uDC34','\uD801\uDC0D':'\uD801\uDC35','\uD801\uDC0E':'\uD801\uDC36','\uD801\uDC0F':'\uD801\uDC37','\uD801\uDC10':'\uD801\uDC38','\uD801\uDC11':'\uD801\uDC39','\uD801\uDC12':'\uD801\uDC3A','\uD801\uDC13':'\uD801\uDC3B','\uD801\uDC14':'\uD801\uDC3C','\uD801\uDC15':'\uD801\uDC3D','\uD801\uDC16':'\uD801\uDC3E','\uD801\uDC17':'\uD801\uDC3F','\uD801\uDC18':'\uD801\uDC40','\uD801\uDC19':'\uD801\uDC41','\uD801\uDC1A':'\uD801\uDC42','\uD801\uDC1B':'\uD801\uDC43','\uD801\uDC1C':'\uD801\uDC44','\uD801\uDC1D':'\uD801\uDC45','\uD801\uDC1E':'\uD801\uDC46','\uD801\uDC1F':'\uD801\uDC47','\uD801\uDC20':'\uD801\uDC48','\uD801\uDC21':'\uD801\uDC49','\uD801\uDC22':'\uD801\uDC4A','\uD801\uDC23':'\uD801\uDC4B','\uD801\uDC24':'\uD801\uDC4C','\uD801\uDC25':'\uD801\uDC4D','\uD801\uDC26':'\uD801\uDC4E','\uD801\uDC27':'\uD801\uDC4F','\uD806\uDCA0':'\uD806\uDCC0','\uD806\uDCA1':'\uD806\uDCC1','\uD806\uDCA2':'\uD806\uDCC2','\uD806\uDCA3':'\uD806\uDCC3','\uD806\uDCA4':'\uD806\uDCC4','\uD806\uDCA5':'\uD806\uDCC5','\uD806\uDCA6':'\uD806\uDCC6','\uD806\uDCA7':'\uD806\uDCC7','\uD806\uDCA8':'\uD806\uDCC8','\uD806\uDCA9':'\uD806\uDCC9','\uD806\uDCAA':'\uD806\uDCCA','\uD806\uDCAB':'\uD806\uDCCB','\uD806\uDCAC':'\uD806\uDCCC','\uD806\uDCAD':'\uD806\uDCCD','\uD806\uDCAE':'\uD806\uDCCE','\uD806\uDCAF':'\uD806\uDCCF','\uD806\uDCB0':'\uD806\uDCD0','\uD806\uDCB1':'\uD806\uDCD1','\uD806\uDCB2':'\uD806\uDCD2','\uD806\uDCB3':'\uD806\uDCD3','\uD806\uDCB4':'\uD806\uDCD4','\uD806\uDCB5':'\uD806\uDCD5','\uD806\uDCB6':'\uD806\uDCD6','\uD806\uDCB7':'\uD806\uDCD7','\uD806\uDCB8':'\uD806\uDCD8','\uD806\uDCB9':'\uD806\uDCD9','\uD806\uDCBA':'\uD806\uDCDA','\uD806\uDCBB':'\uD806\uDCDB','\uD806\uDCBC':'\uD806\uDCDC','\uD806\uDCBD':'\uD806\uDCDD','\uD806\uDCBE':'\uD806\uDCDE','\uD806\uDCBF':'\uD806\uDCDF','\xDF':'ss','\u0130':'i\u0307','\u0149':'\u02BCn','\u01F0':'j\u030C','\u0390':'\u03B9\u0308\u0301','\u03B0':'\u03C5\u0308\u0301','\u0587':'\u0565\u0582','\u1E96':'h\u0331','\u1E97':'t\u0308','\u1E98':'w\u030A','\u1E99':'y\u030A','\u1E9A':'a\u02BE','\u1E9E':'ss','\u1F50':'\u03C5\u0313','\u1F52':'\u03C5\u0313\u0300','\u1F54':'\u03C5\u0313\u0301','\u1F56':'\u03C5\u0313\u0342','\u1F80':'\u1F00\u03B9','\u1F81':'\u1F01\u03B9','\u1F82':'\u1F02\u03B9','\u1F83':'\u1F03\u03B9','\u1F84':'\u1F04\u03B9','\u1F85':'\u1F05\u03B9','\u1F86':'\u1F06\u03B9','\u1F87':'\u1F07\u03B9','\u1F88':'\u1F00\u03B9','\u1F89':'\u1F01\u03B9','\u1F8A':'\u1F02\u03B9','\u1F8B':'\u1F03\u03B9','\u1F8C':'\u1F04\u03B9','\u1F8D':'\u1F05\u03B9','\u1F8E':'\u1F06\u03B9','\u1F8F':'\u1F07\u03B9','\u1F90':'\u1F20\u03B9','\u1F91':'\u1F21\u03B9','\u1F92':'\u1F22\u03B9','\u1F93':'\u1F23\u03B9','\u1F94':'\u1F24\u03B9','\u1F95':'\u1F25\u03B9','\u1F96':'\u1F26\u03B9','\u1F97':'\u1F27\u03B9','\u1F98':'\u1F20\u03B9','\u1F99':'\u1F21\u03B9','\u1F9A':'\u1F22\u03B9','\u1F9B':'\u1F23\u03B9','\u1F9C':'\u1F24\u03B9','\u1F9D':'\u1F25\u03B9','\u1F9E':'\u1F26\u03B9','\u1F9F':'\u1F27\u03B9','\u1FA0':'\u1F60\u03B9','\u1FA1':'\u1F61\u03B9','\u1FA2':'\u1F62\u03B9','\u1FA3':'\u1F63\u03B9','\u1FA4':'\u1F64\u03B9','\u1FA5':'\u1F65\u03B9','\u1FA6':'\u1F66\u03B9','\u1FA7':'\u1F67\u03B9','\u1FA8':'\u1F60\u03B9','\u1FA9':'\u1F61\u03B9','\u1FAA':'\u1F62\u03B9','\u1FAB':'\u1F63\u03B9','\u1FAC':'\u1F64\u03B9','\u1FAD':'\u1F65\u03B9','\u1FAE':'\u1F66\u03B9','\u1FAF':'\u1F67\u03B9','\u1FB2':'\u1F70\u03B9','\u1FB3':'\u03B1\u03B9','\u1FB4':'\u03AC\u03B9','\u1FB6':'\u03B1\u0342','\u1FB7':'\u03B1\u0342\u03B9','\u1FBC':'\u03B1\u03B9','\u1FC2':'\u1F74\u03B9','\u1FC3':'\u03B7\u03B9','\u1FC4':'\u03AE\u03B9','\u1FC6':'\u03B7\u0342','\u1FC7':'\u03B7\u0342\u03B9','\u1FCC':'\u03B7\u03B9','\u1FD2':'\u03B9\u0308\u0300','\u1FD3':'\u03B9\u0308\u0301','\u1FD6':'\u03B9\u0342','\u1FD7':'\u03B9\u0308\u0342','\u1FE2':'\u03C5\u0308\u0300','\u1FE3':'\u03C5\u0308\u0301','\u1FE4':'\u03C1\u0313','\u1FE6':'\u03C5\u0342','\u1FE7':'\u03C5\u0308\u0342','\u1FF2':'\u1F7C\u03B9','\u1FF3':'\u03C9\u03B9','\u1FF4':'\u03CE\u03B9','\u1FF6':'\u03C9\u0342','\u1FF7':'\u03C9\u0342\u03B9','\u1FFC':'\u03C9\u03B9','\uFB00':'ff','\uFB01':'fi','\uFB02':'fl','\uFB03':'ffi','\uFB04':'ffl','\uFB05':'st','\uFB06':'st','\uFB13':'\u0574\u0576','\uFB14':'\u0574\u0565','\uFB15':'\u0574\u056B','\uFB16':'\u057E\u0576','\uFB17':'\u0574\u056D'};

  // Normalize reference label: collapse internal whitespace
  // to single space, remove leading/trailing whitespace, case fold.
  var normalizeReference = function(string) {
      return string.slice(1, string.length - 1).trim().replace(regex, function($0) {
          // Note: there is no need to check `hasOwnProperty($0)` here.
          // If character not found in lookup table, it must be whitespace.
          return map$1[$0] || ' ';
      });
  };

  var fromCodePoint_1 = createCommonjsModule(function (module) {

  // derived from https://github.com/mathiasbynens/String.fromCodePoint
  /*! http://mths.be/fromcodepoint v0.2.1 by @mathias */
  if (String.fromCodePoint) {
      module.exports = function (_) {
          try {
              return String.fromCodePoint(_);
          } catch (e) {
              if (e instanceof RangeError) {
                  return String.fromCharCode(0xFFFD);
              }
              throw e;
          }
      };

  } else {

    var stringFromCharCode = String.fromCharCode;
    var floor = Math.floor;
    var fromCodePoint = function() {
        var arguments$1 = arguments;

        var MAX_SIZE = 0x4000;
        var codeUnits = [];
        var highSurrogate;
        var lowSurrogate;
        var index = -1;
        var length = arguments.length;
        if (!length) {
            return '';
        }
        var result = '';
        while (++index < length) {
            var codePoint = Number(arguments$1[index]);
            if (
                !isFinite(codePoint) || // `NaN`, `+Infinity`, or `-Infinity`
                    codePoint < 0 || // not a valid Unicode code point
                    codePoint > 0x10FFFF || // not a valid Unicode code point
                    floor(codePoint) !== codePoint // not an integer
            ) {
                return String.fromCharCode(0xFFFD);
            }
            if (codePoint <= 0xFFFF) { // BMP code point
                codeUnits.push(codePoint);
            } else { // Astral code point; split in surrogate halves
                // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
                codePoint -= 0x10000;
                highSurrogate = (codePoint >> 10) + 0xD800;
                lowSurrogate = (codePoint % 0x400) + 0xDC00;
                codeUnits.push(highSurrogate, lowSurrogate);
            }
            if (index + 1 === length || codeUnits.length > MAX_SIZE) {
                result += stringFromCharCode.apply(null, codeUnits);
                codeUnits.length = 0;
            }
        }
        return result;
    };
    module.exports = fromCodePoint;
  }
  });

  /*! http://mths.be/repeat v0.2.0 by @mathias */
  if (!String.prototype.repeat) {
  	(function() {
  		var defineProperty = (function() {
  			// IE 8 only supports `Object.defineProperty` on DOM elements
  			try {
  				var object = {};
  				var $defineProperty = Object.defineProperty;
  				var result = $defineProperty(object, object, object) && $defineProperty;
  			} catch(error) {}
  			return result;
  		}());
  		var repeat = function(count) {
  			if (this == null) {
  				throw TypeError();
  			}
  			var string = String(this);
  			// `ToInteger`
  			var n = count ? Number(count) : 0;
  			if (n != n) { // better `isNaN`
  				n = 0;
  			}
  			// Account for out-of-bounds indices
  			if (n < 0 || n == Infinity) {
  				throw RangeError();
  			}
  			var result = '';
  			while (n) {
  				if (n % 2 == 1) {
  					result += string;
  				}
  				if (n > 1) {
  					string += string;
  				}
  				n >>= 1;
  			}
  			return result;
  		};
  		if (defineProperty) {
  			defineProperty(String.prototype, 'repeat', {
  				'value': repeat,
  				'configurable': true,
  				'writable': true
  			});
  		} else {
  			String.prototype.repeat = repeat;
  		}
  	}());
  }

  var normalizeURI$1 = common.normalizeURI;
  var unescapeString$1 = common.unescapeString;

  var decodeHTML$2 = entities$2.decodeHTML;
   // Polyfill for String.prototype.repeat

  // Constants for character codes:

  var C_NEWLINE = 10;
  var C_ASTERISK = 42;
  var C_UNDERSCORE = 95;
  var C_BACKTICK = 96;
  var C_OPEN_BRACKET = 91;
  var C_CLOSE_BRACKET = 93;
  var C_LESSTHAN = 60;
  var C_BANG = 33;
  var C_BACKSLASH$1 = 92;
  var C_AMPERSAND = 38;
  var C_OPEN_PAREN = 40;
  var C_CLOSE_PAREN = 41;
  var C_COLON = 58;
  var C_SINGLEQUOTE = 39;
  var C_DOUBLEQUOTE = 34;

  // Some regexps used in inline parser:

  var ESCAPABLE$1 = common.ESCAPABLE;
  var ESCAPED_CHAR = '\\\\' + ESCAPABLE$1;

  var ENTITY$1 = common.ENTITY;
  var reHtmlTag$1 = common.reHtmlTag;

  var rePunctuation = new RegExp(/[!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u0AF0\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166D\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E42\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC9\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9]|\uD805[\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDF3C-\uDF3E]|\uD809[\uDC70-\uDC74]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]/);

  var reLinkTitle = new RegExp(
      '^(?:"(' + ESCAPED_CHAR + '|[^"\\x00])*"' +
          '|' +
          '\'(' + ESCAPED_CHAR + '|[^\'\\x00])*\'' +
          '|' +
          '\\((' + ESCAPED_CHAR + '|[^()\\x00])*\\))');

  var reLinkDestinationBraces = /^(?:<(?:[^<>\n\\\x00]|\\.)*>)/;

  var reEscapable = new RegExp('^' + ESCAPABLE$1);

  var reEntityHere = new RegExp('^' + ENTITY$1, 'i');

  var reTicks = /`+/;

  var reTicksHere = /^`+/;

  var reEllipses = /\.\.\./g;

  var reDash = /--+/g;

  var reEmailAutolink = /^<([a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)>/;

  var reAutolink = /^<[A-Za-z][A-Za-z0-9.+-]{1,31}:[^<>\x00-\x20]*>/i;

  var reSpnl = /^ *(?:\n *)?/;

  var reWhitespaceChar = /^[ \t\n\x0b\x0c\x0d]/;

  var reUnicodeWhitespaceChar = /^\s/;

  var reFinalSpace = / *$/;

  var reInitialSpace = /^ */;

  var reSpaceAtEndOfLine = /^ *(?:\n|$)/;

  var reLinkLabel = /^\[(?:[^\\\[\]]|\\.){0,1000}\]/;

  // Matches a string of non-special characters.
  var reMain = /^[^\n`\[\]\\!<&*_'"]+/m;

  var text$1 = function(s) {
      var node$1 = new node('text');
      node$1._literal = s;
      return node$1;
  };

  // INLINE PARSER

  // These are methods of an InlineParser object, defined below.
  // An InlineParser keeps track of a subject (a string to be
  // parsed) and a position in that subject.

  // If re matches at current position in the subject, advance
  // position in subject and return the match; otherwise return null.
  var match = function(re) {
      var m = re.exec(this.subject.slice(this.pos));
      if (m === null) {
          return null;
      } else {
          this.pos += m.index + m[0].length;
          return m[0];
      }
  };

  // Returns the code for the character at the current subject position, or -1
  // there are no more characters.
  var peek = function() {
      if (this.pos < this.subject.length) {
          return this.subject.charCodeAt(this.pos);
      } else {
          return -1;
      }
  };

  // Parse zero or more space characters, including at most one newline
  var spnl = function() {
      this.match(reSpnl);
      return true;
  };

  // All of the parsers below try to match something at the current position
  // in the subject.  If they succeed in matching anything, they
  // return the inline matched, advancing the subject.

  // Attempt to parse backticks, adding either a backtick code span or a
  // literal sequence of backticks.
  var parseBackticks = function(block) {
      var ticks = this.match(reTicksHere);
      if (ticks === null) {
          return false;
      }
      var afterOpenTicks = this.pos;
      var matched;
      var node$1;
      var contents;
      while ((matched = this.match(reTicks)) !== null) {
          if (matched === ticks) {
              node$1 = new node('code');
              contents = this.subject.slice(afterOpenTicks,
                                          this.pos - ticks.length)
                            .replace(/\n/gm, ' ');
              if (contents.length > 0 &&
                  contents.match(/[^ ]/) !== null &&
                  contents[0] == ' ' &&
                  contents[contents.length - 1] == ' ') {
                  node$1._literal = contents.slice(1, contents.length - 1);
              } else {
                  node$1._literal = contents;
              }
              block.appendChild(node$1);
              return true;
          }
      }
      // If we got here, we didn't match a closing backtick sequence.
      this.pos = afterOpenTicks;
      block.appendChild(text$1(ticks));
      return true;
  };

  // Parse a backslash-escaped special character, adding either the escaped
  // character, a hard line break (if the backslash is followed by a newline),
  // or a literal backslash to the block's children.  Assumes current character
  // is a backslash.
  var parseBackslash = function(block) {
      var subj = this.subject;
      var node$1;
      this.pos += 1;
      if (this.peek() === C_NEWLINE) {
          this.pos += 1;
          node$1 = new node('linebreak');
          block.appendChild(node$1);
      } else if (reEscapable.test(subj.charAt(this.pos))) {
          block.appendChild(text$1(subj.charAt(this.pos)));
          this.pos += 1;
      } else {
          block.appendChild(text$1('\\'));
      }
      return true;
  };

  // Attempt to parse an autolink (URL or email in pointy brackets).
  var parseAutolink = function(block) {
      var m;
      var dest;
      var node$1;
      if ((m = this.match(reEmailAutolink))) {
          dest = m.slice(1, m.length - 1);
          node$1 = new node('link');
          node$1._destination = normalizeURI$1('mailto:' + dest);
          node$1._title = '';
          node$1.appendChild(text$1(dest));
          block.appendChild(node$1);
          return true;
      } else if ((m = this.match(reAutolink))) {
          dest = m.slice(1, m.length - 1);
          node$1 = new node('link');
          node$1._destination = normalizeURI$1(dest);
          node$1._title = '';
          node$1.appendChild(text$1(dest));
          block.appendChild(node$1);
          return true;
      } else {
          return false;
      }
  };

  // Attempt to parse a raw HTML tag.
  var parseHtmlTag = function(block) {
      var m = this.match(reHtmlTag$1);
      if (m === null) {
          return false;
      } else {
          var node$1 = new node('html_inline');
          node$1._literal = m;
          block.appendChild(node$1);
          return true;
      }
  };

  // Scan a sequence of characters with code cc, and return information about
  // the number of delimiters and whether they are positioned such that
  // they can open and/or close emphasis or strong emphasis.  A utility
  // function for strong/emph parsing.
  var scanDelims = function(cc) {
      var numdelims = 0;
      var char_before, char_after, cc_after;
      var startpos = this.pos;
      var left_flanking, right_flanking, can_open, can_close;
      var after_is_whitespace, after_is_punctuation, before_is_whitespace, before_is_punctuation;

      if (cc === C_SINGLEQUOTE || cc === C_DOUBLEQUOTE) {
          numdelims++;
          this.pos++;
      } else {
          while (this.peek() === cc) {
              numdelims++;
              this.pos++;
          }
      }

      if (numdelims === 0) {
          return null;
      }

      char_before = startpos === 0 ? '\n' : this.subject.charAt(startpos - 1);

      cc_after = this.peek();
      if (cc_after === -1) {
          char_after = '\n';
      } else {
          char_after = fromCodePoint_1(cc_after);
      }

      after_is_whitespace = reUnicodeWhitespaceChar.test(char_after);
      after_is_punctuation = rePunctuation.test(char_after);
      before_is_whitespace = reUnicodeWhitespaceChar.test(char_before);
      before_is_punctuation = rePunctuation.test(char_before);

      left_flanking = !after_is_whitespace &&
              (!after_is_punctuation || before_is_whitespace || before_is_punctuation);
      right_flanking = !before_is_whitespace &&
              (!before_is_punctuation || after_is_whitespace || after_is_punctuation);
      if (cc === C_UNDERSCORE) {
          can_open = left_flanking &&
              (!right_flanking || before_is_punctuation);
          can_close = right_flanking &&
              (!left_flanking || after_is_punctuation);
      } else if (cc === C_SINGLEQUOTE || cc === C_DOUBLEQUOTE) {
          can_open = left_flanking && !right_flanking;
          can_close = right_flanking;
      } else {
          can_open = left_flanking;
          can_close = right_flanking;
      }
      this.pos = startpos;
      return { numdelims: numdelims,
               can_open: can_open,
               can_close: can_close };
  };

  // Handle a delimiter marker for emphasis or a quote.
  var handleDelim = function(cc, block) {
      var res = this.scanDelims(cc);
      if (!res) {
          return false;
      }
      var numdelims = res.numdelims;
      var startpos = this.pos;
      var contents;

      this.pos += numdelims;
      if (cc === C_SINGLEQUOTE) {
          contents = "\u2019";
      } else if (cc === C_DOUBLEQUOTE) {
          contents = "\u201C";
      } else {
          contents = this.subject.slice(startpos, this.pos);
      }
      var node = text$1(contents);
      block.appendChild(node);

      // Add entry to stack for this opener
      if ((res.can_open || res.can_close) &&
          (this.options.smart || cc !== C_SINGLEQUOTE || cc !== C_DOUBLEQUOTE)){
        this.delimiters = { cc: cc,
                            numdelims: numdelims,
                            origdelims: numdelims,
                            node: node,
                            previous: this.delimiters,
                            next: null,
                            can_open: res.can_open,
                            can_close: res.can_close };
        if (this.delimiters.previous !== null) {
          this.delimiters.previous.next = this.delimiters;
        }
      }

      return true;

  };

  var removeDelimiter = function(delim) {
      if (delim.previous !== null) {
          delim.previous.next = delim.next;
      }
      if (delim.next === null) {
          // top of stack
          this.delimiters = delim.previous;
      } else {
          delim.next.previous = delim.previous;
      }
  };

  var removeDelimitersBetween = function(bottom, top) {
      if (bottom.next !== top) {
          bottom.next = top;
          top.previous = bottom;
      }
  };

  var processEmphasis = function(stack_bottom) {
      var opener, closer, old_closer;
      var opener_inl, closer_inl;
      var tempstack;
      var use_delims;
      var tmp, next;
      var opener_found;
      var openers_bottom = [[],[],[]];
      var odd_match = false;

      for (var i=0; i < 3; i++) {
          openers_bottom[i][C_UNDERSCORE] = stack_bottom;
          openers_bottom[i][C_ASTERISK] = stack_bottom;
          openers_bottom[i][C_SINGLEQUOTE] = stack_bottom;
          openers_bottom[i][C_DOUBLEQUOTE] = stack_bottom;
      }
      // find first closer above stack_bottom:
      closer = this.delimiters;
      while (closer !== null && closer.previous !== stack_bottom) {
          closer = closer.previous;
      }
      // move forward, looking for closers, and handling each
      while (closer !== null) {
          var closercc = closer.cc;
          if (!closer.can_close) {
              closer = closer.next;
          } else {
              // found emphasis closer. now look back for first matching opener:
              opener = closer.previous;
              opener_found = false;
              while (opener !== null && opener !== stack_bottom &&
                     opener !== openers_bottom[closer.origdelims % 3][closercc]) {
                  odd_match = (closer.can_open || opener.can_close) &&
                       closer.origdelims % 3 !== 0 &&
                       (opener.origdelims + closer.origdelims) % 3 === 0;
                  if (opener.cc === closer.cc && opener.can_open && !odd_match) {
                      opener_found = true;
                      break;
                  }
                  opener = opener.previous;
              }
              old_closer = closer;

              if (closercc === C_ASTERISK || closercc === C_UNDERSCORE) {
                  if (!opener_found) {
                      closer = closer.next;
                  } else {
                      // calculate actual number of delimiters used from closer
                      use_delims =
                        (closer.numdelims >= 2 && opener.numdelims >= 2) ? 2 : 1;

                      opener_inl = opener.node;
                      closer_inl = closer.node;

                      // remove used delimiters from stack elts and inlines
                      opener.numdelims -= use_delims;
                      closer.numdelims -= use_delims;
                      opener_inl._literal =
                          opener_inl._literal.slice(0,
                                                    opener_inl._literal.length - use_delims);
                      closer_inl._literal =
                          closer_inl._literal.slice(0,
                                                    closer_inl._literal.length - use_delims);

                      // build contents for new emph element
                      var emph = new node(use_delims === 1 ? 'emph' : 'strong');

                      tmp = opener_inl._next;
                      while (tmp && tmp !== closer_inl) {
                          next = tmp._next;
                          tmp.unlink();
                          emph.appendChild(tmp);
                          tmp = next;
                      }

                      opener_inl.insertAfter(emph);

                      // remove elts between opener and closer in delimiters stack
                      removeDelimitersBetween(opener, closer);

                      // if opener has 0 delims, remove it and the inline
                      if (opener.numdelims === 0) {
                          opener_inl.unlink();
                          this.removeDelimiter(opener);
                      }

                      if (closer.numdelims === 0) {
                          closer_inl.unlink();
                          tempstack = closer.next;
                          this.removeDelimiter(closer);
                          closer = tempstack;
                      }

                  }

              } else if (closercc === C_SINGLEQUOTE) {
                  closer.node._literal = "\u2019";
                  if (opener_found) {
                      opener.node._literal = "\u2018";
                  }
                  closer = closer.next;

              } else if (closercc === C_DOUBLEQUOTE) {
                  closer.node._literal = "\u201D";
                  if (opener_found) {
                      opener.node.literal = "\u201C";
                  }
                  closer = closer.next;

              }
              if (!opener_found) {
                  // Set lower bound for future searches for openers:
                  openers_bottom[old_closer.origdelims % 3][closercc] = old_closer.previous;
                  if (!old_closer.can_open) {
                      // We can remove a closer that can't be an opener,
                      // once we've seen there's no matching opener:
                      this.removeDelimiter(old_closer);
                  }
              }
          }

      }

      // remove all delimiters
      while (this.delimiters !== null && this.delimiters !== stack_bottom) {
          this.removeDelimiter(this.delimiters);
      }
  };

  // Attempt to parse link title (sans quotes), returning the string
  // or null if no match.
  var parseLinkTitle = function() {
      var title = this.match(reLinkTitle);
      if (title === null) {
          return null;
      } else {
          // chop off quotes from title and unescape:
          return unescapeString$1(title.substr(1, title.length - 2));
      }
  };

  // Attempt to parse link destination, returning the string or
  // null if no match.
  var parseLinkDestination = function() {
      var res = this.match(reLinkDestinationBraces);
      if (res === null) {
          if (this.peek() === C_LESSTHAN) {
              return null;
          }
          // TODO handrolled parser; res should be null or the string
          var savepos = this.pos;
          var openparens = 0;
          var c;
          while ((c = this.peek()) !== -1) {
              if (c === C_BACKSLASH$1
                  && reEscapable.test(this.subject.charAt(this.pos + 1))) {
                  this.pos += 1;
                  if (this.peek() !== -1) {
                      this.pos += 1;
                  }
              } else if (c === C_OPEN_PAREN) {
                  this.pos += 1;
                  openparens += 1;
              } else if (c === C_CLOSE_PAREN) {
                  if (openparens < 1) {
                      break;
                  } else {
                      this.pos += 1;
                      openparens -= 1;
                  }
              } else if (reWhitespaceChar.exec(fromCodePoint_1(c)) !== null) {
                  break;
              } else {
                  this.pos += 1;
              }
          }
          if (this.pos === savepos && c !== C_CLOSE_PAREN) {
            return null;
          }
          if (openparens !== 0) {
            return null;
          }
          res = this.subject.substr(savepos, this.pos - savepos);
          return normalizeURI$1(unescapeString$1(res));
      } else {  // chop off surrounding <..>:
          return normalizeURI$1(unescapeString$1(res.substr(1, res.length - 2)));
      }
  };

  // Attempt to parse a link label, returning number of characters parsed.
  var parseLinkLabel = function() {
      var m = this.match(reLinkLabel);
      if (m === null || m.length > 1001) {
          return 0;
      } else {
          return m.length;
      }
  };

  // Add open bracket to delimiter stack and add a text node to block's children.
  var parseOpenBracket = function(block) {
      var startpos = this.pos;
      this.pos += 1;

      var node = text$1('[');
      block.appendChild(node);

      // Add entry to stack for this opener
      this.addBracket(node, startpos, false);
      return true;
  };

  // IF next character is [, and ! delimiter to delimiter stack and
  // add a text node to block's children.  Otherwise just add a text node.
  var parseBang = function(block) {
      var startpos = this.pos;
      this.pos += 1;
      if (this.peek() === C_OPEN_BRACKET) {
          this.pos += 1;

          var node = text$1('![');
          block.appendChild(node);

          // Add entry to stack for this opener
          this.addBracket(node, startpos + 1, true);
      } else {
          block.appendChild(text$1('!'));
      }
      return true;
  };

  // Try to match close bracket against an opening in the delimiter
  // stack.  Add either a link or image, or a plain [ character,
  // to block's children.  If there is a matching delimiter,
  // remove it from the delimiter stack.
  var parseCloseBracket = function(block) {
      var startpos;
      var is_image;
      var dest;
      var title;
      var matched = false;
      var reflabel;
      var opener;

      this.pos += 1;
      startpos = this.pos;

      // get last [ or ![
      opener = this.brackets;

      if (opener === null) {
          // no matched opener, just return a literal
          block.appendChild(text$1(']'));
          return true;
      }

      if (!opener.active) {
          // no matched opener, just return a literal
          block.appendChild(text$1(']'));
          // take opener off brackets stack
          this.removeBracket();
          return true;
      }

      // If we got here, open is a potential opener
      is_image = opener.image;

      // Check to see if we have a link/image

      var savepos = this.pos;

      // Inline link?
      if (this.peek() === C_OPEN_PAREN) {
          this.pos++;
          if (this.spnl() &&
              ((dest = this.parseLinkDestination()) !== null) &&
              this.spnl() &&
              // make sure there's a space before the title:
              (reWhitespaceChar.test(this.subject.charAt(this.pos - 1)) &&
               (title = this.parseLinkTitle()) || true) &&
              this.spnl() &&
              this.peek() === C_CLOSE_PAREN) {
              this.pos += 1;
              matched = true;
          } else {
              this.pos = savepos;
          }
      }

      if (!matched) {

          // Next, see if there's a link label
          var beforelabel = this.pos;
          var n = this.parseLinkLabel();
          if (n > 2) {
              reflabel = this.subject.slice(beforelabel, beforelabel + n);
          } else if (!opener.bracketAfter) {
              // Empty or missing second label means to use the first label as the reference.
              // The reference must not contain a bracket. If we know there's a bracket, we don't even bother checking it.
              reflabel = this.subject.slice(opener.index, startpos);
          }
          if (n === 0) {
              // If shortcut reference link, rewind before spaces we skipped.
              this.pos = savepos;
          }

          if (reflabel) {
              // lookup rawlabel in refmap
              var link = this.refmap[normalizeReference(reflabel)];
              if (link) {
                  dest = link.destination;
                  title = link.title;
                  matched = true;
              }
          }
      }

      if (matched) {
          var node$1 = new node(is_image ? 'image' : 'link');
          node$1._destination = dest;
          node$1._title = title || '';

          var tmp, next;
          tmp = opener.node._next;
          while (tmp) {
              next = tmp._next;
              tmp.unlink();
              node$1.appendChild(tmp);
              tmp = next;
          }
          block.appendChild(node$1);
          this.processEmphasis(opener.previousDelimiter);
          this.removeBracket();
          opener.node.unlink();

          // We remove this bracket and processEmphasis will remove later delimiters.
          // Now, for a link, we also deactivate earlier link openers.
          // (no links in links)
          if (!is_image) {
            opener = this.brackets;
            while (opener !== null) {
              if (!opener.image) {
                  opener.active = false; // deactivate this opener
              }
              opener = opener.previous;
            }
          }

          return true;

      } else { // no match

          this.removeBracket();  // remove this opener from stack
          this.pos = startpos;
          block.appendChild(text$1(']'));
          return true;
      }

  };

  var addBracket = function(node, index, image) {
      if (this.brackets !== null) {
          this.brackets.bracketAfter = true;
      }
      this.brackets = { node: node,
                        previous: this.brackets,
                        previousDelimiter: this.delimiters,
                        index: index,
                        image: image,
                        active: true };
  };

  var removeBracket = function() {
      this.brackets = this.brackets.previous;
  };

  // Attempt to parse an entity.
  var parseEntity = function(block) {
      var m;
      if ((m = this.match(reEntityHere))) {
          block.appendChild(text$1(decodeHTML$2(m)));
          return true;
      } else {
          return false;
      }
  };

  // Parse a run of ordinary characters, or a single character with
  // a special meaning in markdown, as a plain string.
  var parseString = function(block) {
      var m;
      if ((m = this.match(reMain))) {
          if (this.options.smart) {
              block.appendChild(text$1(
                  m.replace(reEllipses, "\u2026")
                      .replace(reDash, function(chars) {
                          var enCount = 0;
                          var emCount = 0;
                          if (chars.length % 3 === 0) { // If divisible by 3, use all em dashes
                              emCount = chars.length / 3;
                          } else if (chars.length % 2 === 0) { // If divisible by 2, use all en dashes
                              enCount = chars.length / 2;
                          } else if (chars.length % 3 === 2) { // If 2 extra dashes, use en dash for last 2; em dashes for rest
                              enCount = 1;
                              emCount = (chars.length - 2) / 3;
                          } else { // Use en dashes for last 4 hyphens; em dashes for rest
                              enCount = 2;
                              emCount = (chars.length - 4) / 3;
                          }
                          return "\u2014".repeat(emCount) + "\u2013".repeat(enCount);
                      })));
          } else {
              block.appendChild(text$1(m));
          }
          return true;
      } else {
          return false;
      }
  };

  // Parse a newline.  If it was preceded by two spaces, return a hard
  // line break; otherwise a soft line break.
  var parseNewline = function(block) {
      this.pos += 1; // assume we're at a \n
      // check previous node for trailing spaces
      var lastc = block._lastChild;
      if (lastc && lastc.type === 'text' && lastc._literal[lastc._literal.length - 1] === ' ') {
          var hardbreak = lastc._literal[lastc._literal.length - 2] === ' ';
          lastc._literal = lastc._literal.replace(reFinalSpace, '');
          block.appendChild(new node(hardbreak ? 'linebreak' : 'softbreak'));
      } else {
          block.appendChild(new node('softbreak'));
      }
      this.match(reInitialSpace); // gobble leading spaces in next line
      return true;
  };

  // Attempt to parse a link reference, modifying refmap.
  var parseReference = function(s, refmap) {
      this.subject = s;
      this.pos = 0;
      var rawlabel;
      var dest;
      var title;
      var matchChars;
      var startpos = this.pos;

      // label:
      matchChars = this.parseLinkLabel();
      if (matchChars === 0) {
          return 0;
      } else {
          rawlabel = this.subject.substr(0, matchChars);
      }

      // colon:
      if (this.peek() === C_COLON) {
          this.pos++;
      } else {
          this.pos = startpos;
          return 0;
      }

      //  link url
      this.spnl();

      dest = this.parseLinkDestination();
      if (dest === null) {
          this.pos = startpos;
          return 0;
      }

      var beforetitle = this.pos;
      this.spnl();
      if (this.pos !== beforetitle) {
          title = this.parseLinkTitle();
      }
      if (title === null) {
          title = '';
          // rewind before spaces
          this.pos = beforetitle;
      }

      // make sure we're at line end:
      var atLineEnd = true;
      if (this.match(reSpaceAtEndOfLine) === null) {
          if (title === '') {
              atLineEnd = false;
          } else {
              // the potential title we found is not at the line end,
              // but it could still be a legal link reference if we
              // discard the title
              title = '';
              // rewind before spaces
              this.pos = beforetitle;
              // and instead check if the link URL is at the line end
              atLineEnd = this.match(reSpaceAtEndOfLine) !== null;
          }
      }

      if (!atLineEnd) {
          this.pos = startpos;
          return 0;
      }

      var normlabel = normalizeReference(rawlabel);
      if (normlabel === '') {
          // label must contain non-whitespace characters
          this.pos = startpos;
          return 0;
      }

      if (!refmap[normlabel]) {
          refmap[normlabel] = { destination: dest, title: title };
      }
      return this.pos - startpos;
  };

  // Parse the next inline element in subject, advancing subject position.
  // On success, add the result to block's children and return true.
  // On failure, return false.
  var parseInline = function(block) {
      var res = false;
      var c = this.peek();
      if (c === -1) {
          return false;
      }
      switch(c) {
      case C_NEWLINE:
          res = this.parseNewline(block);
          break;
      case C_BACKSLASH$1:
          res = this.parseBackslash(block);
          break;
      case C_BACKTICK:
          res = this.parseBackticks(block);
          break;
      case C_ASTERISK:
      case C_UNDERSCORE:
          res = this.handleDelim(c, block);
          break;
      case C_SINGLEQUOTE:
      case C_DOUBLEQUOTE:
          res = this.options.smart && this.handleDelim(c, block);
          break;
      case C_OPEN_BRACKET:
          res = this.parseOpenBracket(block);
          break;
      case C_BANG:
          res = this.parseBang(block);
          break;
      case C_CLOSE_BRACKET:
          res = this.parseCloseBracket(block);
          break;
      case C_LESSTHAN:
          res = this.parseAutolink(block) || this.parseHtmlTag(block);
          break;
      case C_AMPERSAND:
          res = this.parseEntity(block);
          break;
      default:
          res = this.parseString(block);
          break;
      }
      if (!res) {
          this.pos += 1;
          block.appendChild(text$1(fromCodePoint_1(c)));
      }

      return true;
  };

  // Parse string content in block into inline children,
  // using refmap to resolve references.
  var parseInlines = function(block) {
      this.subject = block._string_content.trim();
      this.pos = 0;
      this.delimiters = null;
      this.brackets = null;
      while (this.parseInline(block)) {
      }
      block._string_content = null; // allow raw string to be garbage collected
      this.processEmphasis(null);
  };

  // The InlineParser object.
  function InlineParser(options){
      return {
          subject: '',
          delimiters: null,  // used by handleDelim method
          brackets: null,
          pos: 0,
          refmap: {},
          match: match,
          peek: peek,
          spnl: spnl,
          parseBackticks: parseBackticks,
          parseBackslash: parseBackslash,
          parseAutolink: parseAutolink,
          parseHtmlTag: parseHtmlTag,
          scanDelims: scanDelims,
          handleDelim: handleDelim,
          parseLinkTitle: parseLinkTitle,
          parseLinkDestination: parseLinkDestination,
          parseLinkLabel: parseLinkLabel,
          parseOpenBracket: parseOpenBracket,
          parseBang: parseBang,
          parseCloseBracket: parseCloseBracket,
          addBracket: addBracket,
          removeBracket: removeBracket,
          parseEntity: parseEntity,
          parseString: parseString,
          parseNewline: parseNewline,
          parseReference: parseReference,
          parseInline: parseInline,
          processEmphasis: processEmphasis,
          removeDelimiter: removeDelimiter,
          options: options || {},
          parse: parseInlines
      };
  }

  var inlines = InlineParser;

  var unescapeString$2 = common.unescapeString;
  var OPENTAG$1 = common.OPENTAG;
  var CLOSETAG$1 = common.CLOSETAG;

  var CODE_INDENT = 4;

  var C_TAB = 9;
  var C_NEWLINE$1 = 10;
  var C_GREATERTHAN = 62;
  var C_LESSTHAN$1 = 60;
  var C_SPACE = 32;
  var C_OPEN_BRACKET$1 = 91;



  var reHtmlBlockOpen = [
     /./, // dummy for 0
     /^<(?:script|pre|style)(?:\s|>|$)/i,
     /^<!--/,
     /^<[?]/,
     /^<![A-Z]/,
     /^<!\[CDATA\[/,
     /^<[/]?(?:address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[123456]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|nav|noframes|ol|optgroup|option|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul)(?:\s|[/]?[>]|$)/i,
      new RegExp('^(?:' + OPENTAG$1 + '|' + CLOSETAG$1 + ')\\s*$', 'i')
  ];

  var reHtmlBlockClose = [
     /./, // dummy for 0
     /<\/(?:script|pre|style)>/i,
     /-->/,
     /\?>/,
     />/,
     /\]\]>/
  ];

  var reThematicBreak = /^(?:(?:\*[ \t]*){3,}|(?:_[ \t]*){3,}|(?:-[ \t]*){3,})[ \t]*$/;

  var reMaybeSpecial = /^[#`~*+_=<>0-9-]/;

  var reNonSpace = /[^ \t\f\v\r\n]/;

  var reBulletListMarker = /^[*+-]/;

  var reOrderedListMarker = /^(\d{1,9})([.)])/;

  var reATXHeadingMarker = /^#{1,6}(?:[ \t]+|$)/;

  var reCodeFence = /^`{3,}(?!.*`)|^~{3,}/;

  var reClosingCodeFence = /^(?:`{3,}|~{3,})(?= *$)/;

  var reSetextHeadingLine = /^(?:=+|-+)[ \t]*$/;

  var reLineEnding = /\r\n|\n|\r/;

  // Returns true if string contains only space characters.
  var isBlank = function(s) {
      return !(reNonSpace.test(s));
  };

  var isSpaceOrTab = function(c) {
      return c === C_SPACE || c === C_TAB;
  };

  var peek$1 = function(ln, pos) {
      if (pos < ln.length) {
          return ln.charCodeAt(pos);
      } else {
          return -1;
      }
  };

  // DOC PARSER

  // These are methods of a Parser object, defined below.

  // Returns true if block ends with a blank line, descending if needed
  // into lists and sublists.
  var endsWithBlankLine = function(block) {
      while (block) {
          if (block._lastLineBlank) {
              return true;
          }
          var t = block.type;
          if (!block._lastLineChecked &&
              (t === 'list' || t === 'item')) {
              block._lastLineChecked = true;
              block = block._lastChild;
          } else {
              block._lastLineChecked = true;
              break;
          }
      }
      return false;
  };

  // Add a line to the block at the tip.  We assume the tip
  // can accept lines -- that check should be done before calling this.
  var addLine = function() {
      if (this.partiallyConsumedTab) {
        this.offset += 1; // skip over tab
        // add space characters:
        var charsToTab = 4 - (this.column % 4);
        this.tip._string_content += (' '.repeat(charsToTab));
      }
      this.tip._string_content += this.currentLine.slice(this.offset) + '\n';
  };

  // Add block of type tag as a child of the tip.  If the tip can't
  // accept children, close and finalize it and try its parent,
  // and so on til we find a block that can accept children.
  var addChild = function(tag, offset) {
      while (!this.blocks[this.tip.type].canContain(tag)) {
          this.finalize(this.tip, this.lineNumber - 1);
      }

      var column_number = offset + 1; // offset 0 = column 1
      var newBlock = new node(tag, [[this.lineNumber, column_number], [0, 0]]);
      newBlock._string_content = '';
      this.tip.appendChild(newBlock);
      this.tip = newBlock;
      return newBlock;
  };

  // Parse a list marker and return data on the marker (type,
  // start, delimiter, bullet character, padding) or null.
  var parseListMarker = function(parser, container) {
      var rest = parser.currentLine.slice(parser.nextNonspace);
      var match;
      var nextc;
      var spacesStartCol;
      var spacesStartOffset;
      var data = { type: null,
                   tight: true,  // lists are tight by default
                   bulletChar: null,
                   start: null,
                   delimiter: null,
                   padding: null,
                   markerOffset: parser.indent };
      if (parser.indent >= 4) {
          return null;
      }
      if ((match = rest.match(reBulletListMarker))) {
          data.type = 'bullet';
          data.bulletChar = match[0][0];

      } else if ((match = rest.match(reOrderedListMarker)) &&
                  (container.type !== 'paragraph' ||
                   match[1] === '1')) {
          data.type = 'ordered';
          data.start = parseInt(match[1]);
          data.delimiter = match[2];
      } else {
          return null;
      }
      // make sure we have spaces after
      nextc = peek$1(parser.currentLine, parser.nextNonspace + match[0].length);
      if (!(nextc === -1 || nextc === C_TAB || nextc === C_SPACE)) {
          return null;
      }

      // if it interrupts paragraph, make sure first line isn't blank
      if (container.type === 'paragraph' && !parser.currentLine.slice(parser.nextNonspace + match[0].length).match(reNonSpace)) {
          return null;
      }

      // we've got a match! advance offset and calculate padding
      parser.advanceNextNonspace(); // to start of marker
      parser.advanceOffset(match[0].length, true); // to end of marker
      spacesStartCol = parser.column;
      spacesStartOffset = parser.offset;
      do {
          parser.advanceOffset(1, true);
          nextc = peek$1(parser.currentLine, parser.offset);
      } while (parser.column - spacesStartCol < 5 &&
             isSpaceOrTab(nextc));
      var blank_item = peek$1(parser.currentLine, parser.offset) === -1;
      var spaces_after_marker = parser.column - spacesStartCol;
      if (spaces_after_marker >= 5 ||
          spaces_after_marker < 1 ||
          blank_item) {
          data.padding = match[0].length + 1;
          parser.column = spacesStartCol;
          parser.offset = spacesStartOffset;
          if (isSpaceOrTab(peek$1(parser.currentLine, parser.offset))) {
              parser.advanceOffset(1, true);
          }
      } else {
          data.padding = match[0].length + spaces_after_marker;
      }
      return data;
  };

  // Returns true if the two list items are of the same type,
  // with the same delimiter and bullet character.  This is used
  // in agglomerating list items into lists.
  var listsMatch = function(list_data, item_data) {
      return (list_data.type === item_data.type &&
              list_data.delimiter === item_data.delimiter &&
              list_data.bulletChar === item_data.bulletChar);
  };

  // Finalize and close any unmatched blocks.
  var closeUnmatchedBlocks = function() {
      if (!this.allClosed) {
          // finalize any blocks not matched
          while (this.oldtip !== this.lastMatchedContainer) {
              var parent = this.oldtip._parent;
              this.finalize(this.oldtip, this.lineNumber - 1);
              this.oldtip = parent;
          }
          this.allClosed = true;
      }
  };

  // 'finalize' is run when the block is closed.
  // 'continue' is run to check whether the block is continuing
  // at a certain line and offset (e.g. whether a block quote
  // contains a `>`.  It returns 0 for matched, 1 for not matched,
  // and 2 for "we've dealt with this line completely, go to next."
  var blocks = {
      document: {
          continue: function() { return 0; },
          finalize: function() { return; },
          canContain: function(t) { return (t !== 'item'); },
          acceptsLines: false
      },
      list: {
          continue: function() { return 0; },
          finalize: function(parser, block) {
              var item = block._firstChild;
              while (item) {
                  // check for non-final list item ending with blank line:
                  if (endsWithBlankLine(item) && item._next) {
                      block._listData.tight = false;
                      break;
                  }
                  // recurse into children of list item, to see if there are
                  // spaces between any of them:
                  var subitem = item._firstChild;
                  while (subitem) {
                      if (endsWithBlankLine(subitem) &&
                          (item._next || subitem._next)) {
                          block._listData.tight = false;
                          break;
                      }
                      subitem = subitem._next;
                  }
                  item = item._next;
              }
          },
          canContain: function(t) { return (t === 'item'); },
          acceptsLines: false
      },
      block_quote: {
          continue: function(parser) {
              var ln = parser.currentLine;
              if (!parser.indented &&
                  peek$1(ln, parser.nextNonspace) === C_GREATERTHAN) {
                  parser.advanceNextNonspace();
                  parser.advanceOffset(1, false);
                  if (isSpaceOrTab(peek$1(ln, parser.offset))) {
                      parser.advanceOffset(1, true);
                  }
              } else {
                  return 1;
              }
              return 0;
          },
          finalize: function() { return; },
          canContain: function(t) { return (t !== 'item'); },
          acceptsLines: false
      },
      item: {
          continue: function(parser, container) {
              if (parser.blank) {
                  if (container._firstChild == null) {
                      // Blank line after empty list item
                      return 1;
                  } else {
                      parser.advanceNextNonspace();
                  }
              } else if (parser.indent >=
                         container._listData.markerOffset +
                         container._listData.padding) {
                  parser.advanceOffset(container._listData.markerOffset +
                      container._listData.padding, true);
              } else {
                  return 1;
              }
              return 0;
          },
          finalize: function() { return; },
          canContain: function(t) { return (t !== 'item'); },
          acceptsLines: false
      },
      heading: {
          continue: function() {
              // a heading can never container > 1 line, so fail to match:
              return 1;
          },
          finalize: function() { return; },
          canContain: function() { return false; },
          acceptsLines: false
      },
      thematic_break: {
          continue: function() {
              // a thematic break can never container > 1 line, so fail to match:
              return 1;
          },
          finalize: function() { return; },
          canContain: function() { return false; },
          acceptsLines: false
      },
      code_block: {
          continue: function(parser, container) {
              var ln = parser.currentLine;
              var indent = parser.indent;
              if (container._isFenced) { // fenced
                  var match = (indent <= 3 &&
                      ln.charAt(parser.nextNonspace) === container._fenceChar &&
                      ln.slice(parser.nextNonspace).match(reClosingCodeFence));
                  if (match && match[0].length >= container._fenceLength) {
                      // closing fence - we're at end of line, so we can return
                      parser.lastLineLength = match[0].length;
                      parser.finalize(container, parser.lineNumber);
                      return 2;
                  } else {
                      // skip optional spaces of fence offset
                      var i = container._fenceOffset;
                      while (i > 0 && isSpaceOrTab(peek$1(ln, parser.offset))) {
                          parser.advanceOffset(1, true);
                          i--;
                      }
                  }
              } else { // indented
                  if (indent >= CODE_INDENT) {
                      parser.advanceOffset(CODE_INDENT, true);
                  } else if (parser.blank) {
                      parser.advanceNextNonspace();
                  } else {
                      return 1;
                  }
              }
              return 0;
          },
          finalize: function(parser, block) {
              if (block._isFenced) { // fenced
                  // first line becomes info string
                  var content = block._string_content;
                  var newlinePos = content.indexOf('\n');
                  var firstLine = content.slice(0, newlinePos);
                  var rest = content.slice(newlinePos + 1);
                  block.info = unescapeString$2(firstLine.trim());
                  block._literal = rest;
              } else { // indented
                  block._literal = block._string_content.replace(/(\n *)+$/, '\n');
              }
              block._string_content = null; // allow GC
          },
          canContain: function() { return false; },
          acceptsLines: true
      },
      html_block: {
          continue: function(parser, container) {
              return ((parser.blank &&
                       (container._htmlBlockType === 6 ||
                        container._htmlBlockType === 7)) ? 1 : 0);
          },
          finalize: function(parser, block) {
              block._literal = block._string_content.replace(/(\n *)+$/, '');
              block._string_content = null; // allow GC
          },
          canContain: function() { return false; },
          acceptsLines: true
      },
      paragraph: {
          continue: function(parser) {
              return (parser.blank ? 1 : 0);
          },
          finalize: function(parser, block) {
              var pos;
              var hasReferenceDefs = false;

              // try parsing the beginning as link reference definitions:
              while (peek$1(block._string_content, 0) === C_OPEN_BRACKET$1 &&
                     (pos =
                      parser.inlineParser.parseReference(block._string_content,
                                                         parser.refmap))) {
                  block._string_content = block._string_content.slice(pos);
                  hasReferenceDefs = true;
              }
              if (hasReferenceDefs && isBlank(block._string_content)) {
                  block.unlink();
              }
          },
          canContain: function() { return false; },
          acceptsLines: true
      }
  };

  // block start functions.  Return values:
  // 0 = no match
  // 1 = matched container, keep going
  // 2 = matched leaf, no more block starts
  var blockStarts = [
      // block quote
      function(parser) {
          if (!parser.indented &&
              peek$1(parser.currentLine, parser.nextNonspace) === C_GREATERTHAN) {
              parser.advanceNextNonspace();
              parser.advanceOffset(1, false);
              // optional following space
              if (isSpaceOrTab(peek$1(parser.currentLine, parser.offset))) {
                  parser.advanceOffset(1, true);
              }
              parser.closeUnmatchedBlocks();
              parser.addChild('block_quote', parser.nextNonspace);
              return 1;
          } else {
              return 0;
          }
      },

      // ATX heading
      function(parser) {
          var match;
          if (!parser.indented &&
              (match = parser.currentLine.slice(parser.nextNonspace).match(reATXHeadingMarker))) {
              parser.advanceNextNonspace();
              parser.advanceOffset(match[0].length, false);
              parser.closeUnmatchedBlocks();
              var container = parser.addChild('heading', parser.nextNonspace);
              container.level = match[0].trim().length; // number of #s
              // remove trailing ###s:
              container._string_content =
                  parser.currentLine.slice(parser.offset).replace(/^[ \t]*#+[ \t]*$/, '').replace(/[ \t]+#+[ \t]*$/, '');
              parser.advanceOffset(parser.currentLine.length - parser.offset);
              return 2;
          } else {
              return 0;
          }
      },

      // Fenced code block
      function(parser) {
          var match;
          if (!parser.indented &&
              (match = parser.currentLine.slice(parser.nextNonspace).match(reCodeFence))) {
              var fenceLength = match[0].length;
              parser.closeUnmatchedBlocks();
              var container = parser.addChild('code_block', parser.nextNonspace);
              container._isFenced = true;
              container._fenceLength = fenceLength;
              container._fenceChar = match[0][0];
              container._fenceOffset = parser.indent;
              parser.advanceNextNonspace();
              parser.advanceOffset(fenceLength, false);
              return 2;
          } else {
              return 0;
          }
      },

      // HTML block
      function(parser, container) {
          if (!parser.indented &&
              peek$1(parser.currentLine, parser.nextNonspace) === C_LESSTHAN$1) {
              var s = parser.currentLine.slice(parser.nextNonspace);
              var blockType;

              for (blockType = 1; blockType <= 7; blockType++) {
                  if (reHtmlBlockOpen[blockType].test(s) &&
                      (blockType < 7 ||
                       container.type !== 'paragraph')) {
                      parser.closeUnmatchedBlocks();
                      // We don't adjust parser.offset;
                      // spaces are part of the HTML block:
                      var b = parser.addChild('html_block',
                                              parser.offset);
                      b._htmlBlockType = blockType;
                      return 2;
                  }
              }
          }

          return 0;

      },

      // Setext heading
      function(parser, container) {
          var match;
          if (!parser.indented &&
              container.type === 'paragraph' &&
                     ((match = parser.currentLine.slice(parser.nextNonspace).match(reSetextHeadingLine)))) {
              parser.closeUnmatchedBlocks();
              // resolve reference link definitiosn
              var pos;
              while (peek$1(container._string_content, 0) === C_OPEN_BRACKET$1 &&
                     (pos =
                      parser.inlineParser.parseReference(
                          container._string_content, parser.refmap))) {
                  container._string_content =
                      container._string_content.slice(pos);
              }
              if (container._string_content.length > 0) {
                var heading = new node('heading', container.sourcepos);
                heading.level = match[0][0] === '=' ? 1 : 2;
                heading._string_content = container._string_content;
                container.insertAfter(heading);
                container.unlink();
                parser.tip = heading;
                parser.advanceOffset(parser.currentLine.length - parser.offset, false);
                return 2;
              } else {
                return 0;
              }
          } else {
              return 0;
          }
      },

      // thematic break
      function(parser) {
          if (!parser.indented &&
              reThematicBreak.test(parser.currentLine.slice(parser.nextNonspace))) {
              parser.closeUnmatchedBlocks();
              parser.addChild('thematic_break', parser.nextNonspace);
              parser.advanceOffset(parser.currentLine.length - parser.offset, false);
              return 2;
          } else {
              return 0;
          }
      },

      // list item
      function(parser, container) {
          var data;

          if ((!parser.indented || container.type === 'list')
                  && (data = parseListMarker(parser, container))) {
              parser.closeUnmatchedBlocks();

              // add the list if needed
              if (parser.tip.type !== 'list' ||
                  !(listsMatch(container._listData, data))) {
                  container = parser.addChild('list', parser.nextNonspace);
                  container._listData = data;
              }

              // add the list item
              container = parser.addChild('item', parser.nextNonspace);
              container._listData = data;
              return 1;
          } else {
              return 0;
          }
      },

      // indented code block
      function(parser) {
          if (parser.indented &&
              parser.tip.type !== 'paragraph' &&
              !parser.blank) {
              // indented code
              parser.advanceOffset(CODE_INDENT, true);
              parser.closeUnmatchedBlocks();
              parser.addChild('code_block', parser.offset);
              return 2;
          } else {
              return 0;
          }
       }

  ];

  var advanceOffset = function(count, columns) {
      var currentLine = this.currentLine;
      var charsToTab, charsToAdvance;
      var c;
      while (count > 0 && (c = currentLine[this.offset])) {
          if (c === '\t') {
              charsToTab = 4 - (this.column % 4);
              if (columns) {
                  this.partiallyConsumedTab = charsToTab > count;
                  charsToAdvance = charsToTab > count ? count : charsToTab;
                  this.column += charsToAdvance;
                  this.offset += this.partiallyConsumedTab ? 0 : 1;
                  count -= charsToAdvance;
              } else {
                  this.partiallyConsumedTab = false;
                  this.column += charsToTab;
                  this.offset += 1;
                  count -= 1;
              }
          } else {
              this.partiallyConsumedTab = false;
              this.offset += 1;
              this.column += 1; // assume ascii; block starts are ascii
              count -= 1;
          }
      }
  };

  var advanceNextNonspace = function() {
      this.offset = this.nextNonspace;
      this.column = this.nextNonspaceColumn;
      this.partiallyConsumedTab = false;
  };

  var findNextNonspace = function() {
      var currentLine = this.currentLine;
      var i = this.offset;
      var cols = this.column;
      var c;

      while ((c = currentLine.charAt(i)) !== '') {
          if (c === ' ') {
              i++;
              cols++;
          } else if (c === '\t') {
              i++;
              cols += (4 - (cols % 4));
          } else {
              break;
          }
      }
      this.blank = (c === '\n' || c === '\r' || c === '');
      this.nextNonspace = i;
      this.nextNonspaceColumn = cols;
      this.indent = this.nextNonspaceColumn - this.column;
      this.indented = this.indent >= CODE_INDENT;
  };

  // Analyze a line of text and update the document appropriately.
  // We parse markdown text by calling this on each line of input,
  // then finalizing the document.
  var incorporateLine = function(ln) {
      var all_matched = true;
      var t;

      var container = this.doc;
      this.oldtip = this.tip;
      this.offset = 0;
      this.column = 0;
      this.blank = false;
      this.partiallyConsumedTab = false;
      this.lineNumber += 1;

      // replace NUL characters for security
      if (ln.indexOf('\u0000') !== -1) {
          ln = ln.replace(/\0/g, '\uFFFD');
      }

      this.currentLine = ln;

      // For each containing block, try to parse the associated line start.
      // Bail out on failure: container will point to the last matching block.
      // Set all_matched to false if not all containers match.
      var lastChild;
      while ((lastChild = container._lastChild) && lastChild._open) {
          container = lastChild;

          this.findNextNonspace();

          switch (this.blocks[container.type].continue(this, container)) {
          case 0: // we've matched, keep going
              break;
          case 1: // we've failed to match a block
              all_matched = false;
              break;
          case 2: // we've hit end of line for fenced code close and can return
              return;
          default:
              throw 'continue returned illegal value, must be 0, 1, or 2';
          }
          if (!all_matched) {
              container = container._parent; // back up to last matching block
              break;
          }
      }

      this.allClosed = (container === this.oldtip);
      this.lastMatchedContainer = container;

      var matchedLeaf = container.type !== 'paragraph' &&
              blocks[container.type].acceptsLines;
      var starts = this.blockStarts;
      var startsLen = starts.length;
      // Unless last matched container is a code block, try new container starts,
      // adding children to the last matched container:
      while (!matchedLeaf) {

          this.findNextNonspace();

          // this is a little performance optimization:
          if (!this.indented &&
              !reMaybeSpecial.test(ln.slice(this.nextNonspace))) {
              this.advanceNextNonspace();
              break;
          }

          var i = 0;
          while (i < startsLen) {
              var res = starts[i](this, container);
              if (res === 1) {
                  container = this.tip;
                  break;
              } else if (res === 2) {
                  container = this.tip;
                  matchedLeaf = true;
                  break;
              } else {
                  i++;
              }
          }

          if (i === startsLen) { // nothing matched
              this.advanceNextNonspace();
              break;
          }
      }

      // What remains at the offset is a text line.  Add the text to the
      // appropriate container.

     // First check for a lazy paragraph continuation:
      if (!this.allClosed && !this.blank &&
          this.tip.type === 'paragraph') {
          // lazy paragraph continuation
          this.addLine();

      } else { // not a lazy continuation

          // finalize any blocks not matched
          this.closeUnmatchedBlocks();
          if (this.blank && container.lastChild) {
              container.lastChild._lastLineBlank = true;
          }

          t = container.type;

          // Block quote lines are never blank as they start with >
          // and we don't count blanks in fenced code for purposes of tight/loose
          // lists or breaking out of lists.  We also don't set _lastLineBlank
          // on an empty list item, or if we just closed a fenced block.
          var lastLineBlank = this.blank &&
              !(t === 'block_quote' ||
                (t === 'code_block' && container._isFenced) ||
                (t === 'item' &&
                 !container._firstChild &&
                 container.sourcepos[0][0] === this.lineNumber));

          // propagate lastLineBlank up through parents:
          var cont = container;
          while (cont) {
              cont._lastLineBlank = lastLineBlank;
              cont = cont._parent;
          }

          if (this.blocks[t].acceptsLines) {
              this.addLine();
              // if HtmlBlock, check for end condition
              if (t === 'html_block' &&
                  container._htmlBlockType >= 1 &&
                  container._htmlBlockType <= 5 &&
                  reHtmlBlockClose[container._htmlBlockType].test(this.currentLine.slice(this.offset))) {
                  this.lastLineLength = ln.length;
                  this.finalize(container, this.lineNumber);
              }

          } else if (this.offset < ln.length && !this.blank) {
              // create paragraph container for line
              container = this.addChild('paragraph', this.offset);
              this.advanceNextNonspace();
              this.addLine();
          }
      }
      this.lastLineLength = ln.length;
  };

  // Finalize a block.  Close it and do any necessary postprocessing,
  // e.g. creating string_content from strings, setting the 'tight'
  // or 'loose' status of a list, and parsing the beginnings
  // of paragraphs for reference definitions.  Reset the tip to the
  // parent of the closed block.
  var finalize = function(block, lineNumber) {
      var above = block._parent;
      block._open = false;
      block.sourcepos[1] = [lineNumber, this.lastLineLength];

      this.blocks[block.type].finalize(this, block);

      this.tip = above;
  };

  // Walk through a block & children recursively, parsing string content
  // into inline content where appropriate.
  var processInlines = function(block) {
      var node, event, t;
      var walker = block.walker();
      this.inlineParser.refmap = this.refmap;
      this.inlineParser.options = this.options;
      while ((event = walker.next())) {
          node = event.node;
          t = node.type;
          if (!event.entering && (t === 'paragraph' || t === 'heading')) {
              this.inlineParser.parse(node);
          }
      }
  };

  var Document = function() {
      var doc = new node('document', [[1, 1], [0, 0]]);
      return doc;
  };

  // The main parsing function.  Returns a parsed document AST.
  var parse = function(input) {
      this.doc = new Document();
      this.tip = this.doc;
      this.refmap = {};
      this.lineNumber = 0;
      this.lastLineLength = 0;
      this.offset = 0;
      this.column = 0;
      this.lastMatchedContainer = this.doc;
      this.currentLine = "";
      if (this.options.time) { console.time("preparing input"); }
      var lines = input.split(reLineEnding);
      var len = lines.length;
      if (input.charCodeAt(input.length - 1) === C_NEWLINE$1) {
          // ignore last blank line created by final newline
          len -= 1;
      }
      if (this.options.time) { console.timeEnd("preparing input"); }
      if (this.options.time) { console.time("block parsing"); }
      for (var i = 0; i < len; i++) {
          this.incorporateLine(lines[i]);
      }
      while (this.tip) {
          this.finalize(this.tip, len);
      }
      if (this.options.time) { console.timeEnd("block parsing"); }
      if (this.options.time) { console.time("inline parsing"); }
      this.processInlines(this.doc);
      if (this.options.time) { console.timeEnd("inline parsing"); }
      return this.doc;
  };


  // The Parser object.
  function Parser(options){
      return {
          doc: new Document(),
          blocks: blocks,
          blockStarts: blockStarts,
          tip: this.doc,
          oldtip: this.doc,
          currentLine: "",
          lineNumber: 0,
          offset: 0,
          column: 0,
          nextNonspace: 0,
          nextNonspaceColumn: 0,
          indent: 0,
          indented: false,
          blank: false,
          partiallyConsumedTab: false,
          allClosed: true,
          lastMatchedContainer: this.doc,
          refmap: {},
          lastLineLength: 0,
          inlineParser: new inlines(options),
          findNextNonspace: findNextNonspace,
          advanceOffset: advanceOffset,
          advanceNextNonspace: advanceNextNonspace,
          addLine: addLine,
          addChild: addChild,
          incorporateLine: incorporateLine,
          finalize: finalize,
          processInlines: processInlines,
          closeUnmatchedBlocks: closeUnmatchedBlocks,
          parse: parse,
          options: options || {}
      };
  }

  var blocks_1 = Parser;

  function Renderer() {}

  /**
   *  Walks the AST and calls member methods for each Node type.
   *
   *  @param ast {Node} The root of the abstract syntax tree.
   */
  function render(ast) {
    var walker = ast.walker()
      , event
      , type;

    this.buffer = '';
    this.lastOut = '\n';

    while((event = walker.next())) {
      type = event.node.type;
      if (this[type]) {
        this[type](event.node, event.entering);
      }
    }
    return this.buffer;
  }

  /**
   *  Concatenate a literal string to the buffer.
   *
   *  @param str {String} The string to concatenate.
   */
  function lit(str) {
    this.buffer += str;
    this.lastOut = str;
  }

  /**
   *  Output a newline to the buffer.
   */
  function cr() {
    if (this.lastOut !== '\n') {
      this.lit('\n');
    }
  }

  /**
   *  Concatenate a string to the buffer possibly escaping the content.
   *
   *  Concrete renderer implementations should override this method.
   *
   *  @param str {String} The string to concatenate.
   */
  function out(str) {
    this.lit(str);
  }

  /**
   *  Escape a string for the target renderer.
   *
   *  Abstract function that should be implemented by concrete 
   *  renderer implementations.
   *
   *  @param str {String} The string to escape.
   */
  function esc(str) {
    return str;
  }

  Renderer.prototype.render = render;
  Renderer.prototype.out = out;
  Renderer.prototype.lit = lit;
  Renderer.prototype.cr  = cr;
  Renderer.prototype.esc  = esc;

  var renderer = Renderer;

  var reUnsafeProtocol = /^javascript:|vbscript:|file:|data:/i;
  var reSafeDataProtocol = /^data:image\/(?:png|gif|jpeg|webp)/i;

  var potentiallyUnsafe = function(url) {
    return reUnsafeProtocol.test(url) &&
        !reSafeDataProtocol.test(url);
  };

  // Helper function to produce an HTML tag.
  function tag(name, attrs, selfclosing) {
    if (this.disableTags > 0) {
      return;
    }
    this.buffer += ('<' + name);
    if (attrs && attrs.length > 0) {
      var i = 0;
      var attrib;
      while ((attrib = attrs[i]) !== undefined) {
        this.buffer += (' ' + attrib[0] + '="' + attrib[1] + '"');
        i++;
      }
    }
    if (selfclosing) {
      this.buffer += ' /';
    }
    this.buffer += '>';
    this.lastOut = '>';
  }

  function HtmlRenderer(options) {
    options = options || {};
    // by default, soft breaks are rendered as newlines in HTML
    options.softbreak = options.softbreak || '\n';
    // set to "<br />" to make them hard breaks
    // set to " " if you want to ignore line wrapping in source

    this.disableTags = 0;
    this.lastOut = "\n";
    this.options = options;
  }

  /* Node methods */

  function text$2(node) {
    this.out(node.literal);
  }

  function softbreak() {
    this.lit(this.options.softbreak);
  }

  function linebreak() {
    this.tag('br', [], true);
    this.cr();
  }

  function link(node, entering) {
    var attrs = this.attrs(node);
    if (entering) {
      if (!(this.options.safe && potentiallyUnsafe(node.destination))) {
        attrs.push(['href', this.esc(node.destination)]);
      }
      if (node.title) {
        attrs.push(['title', this.esc(node.title)]);
      }
      this.tag('a', attrs);
    } else {
      this.tag('/a');
    }
  }

  function image$1(node, entering) {
    if (entering) {
      if (this.disableTags === 0) {
        if (this.options.safe && potentiallyUnsafe(node.destination)) {
          this.lit('<img src="" alt="');
        } else {
          this.lit('<img src="' + this.esc(node.destination) +
              '" alt="');
        }
      }
      this.disableTags += 1;
    } else {
      this.disableTags -= 1;
      if (this.disableTags === 0) {
        if (node.title) {
          this.lit('" title="' + this.esc(node.title));
        }
        this.lit('" />');
      }
    }
  }

  function emph(node, entering) {
    this.tag(entering ? 'em' : '/em');
  }

  function strong(node, entering) {
    this.tag(entering ? 'strong' : '/strong');
  }

  function paragraph(node, entering) {
    var grandparent = node.parent.parent
      , attrs = this.attrs(node);
    if (grandparent !== null &&
      grandparent.type === 'list') {
      if (grandparent.listTight) {
        return;
      }
    }
    if (entering) {
      this.cr();
      this.tag('p', attrs);
    } else {
      this.tag('/p');
      this.cr();
    }
  }

  function heading(node, entering) {
    var tagname = 'h' + node.level
      , attrs = this.attrs(node);
    if (entering) {
      this.cr();
      this.tag(tagname, attrs);
    } else {
      this.tag('/' + tagname);
      this.cr();
    }
  }

  function code(node) {
    this.tag('code');
    this.out(node.literal);
    this.tag('/code');
  }

  function code_block(node) {
    var info_words = node.info ? node.info.split(/\s+/) : []
      , attrs = this.attrs(node);
    if (info_words.length > 0 && info_words[0].length > 0) {
      attrs.push(['class', 'language-' + this.esc(info_words[0])]);
    }
    this.cr();
    this.tag('pre');
    this.tag('code', attrs);
    this.out(node.literal);
    this.tag('/code');
    this.tag('/pre');
    this.cr();
  }

  function thematic_break(node) {
    var attrs = this.attrs(node);
    this.cr();
    this.tag('hr', attrs, true);
    this.cr();
  }

  function block_quote(node, entering) {
    var attrs = this.attrs(node);
    if (entering) {
      this.cr();
      this.tag('blockquote', attrs);
      this.cr();
    } else {
      this.cr();
      this.tag('/blockquote');
      this.cr();
    }
  }

  function list(node, entering) {
    var tagname = node.listType === 'bullet' ? 'ul' : 'ol'
      , attrs = this.attrs(node);

    if (entering) {
      var start = node.listStart;
      if (start !== null && start !== 1) {
        attrs.push(['start', start.toString()]);
      }
      this.cr();
      this.tag(tagname, attrs);
      this.cr();
    } else {
      this.cr();
      this.tag('/' + tagname);
      this.cr();
    }
  }

  function item(node, entering) {
    var attrs = this.attrs(node);
    if (entering) {
      this.tag('li', attrs);
    } else {
      this.tag('/li');
      this.cr();
    }
  }

  function html_inline(node) {
    if (this.options.safe) {
      this.lit('<!-- raw HTML omitted -->');
    } else {
      this.lit(node.literal);
    }
  }

  function html_block(node) {
    this.cr();
    if (this.options.safe) {
      this.lit('<!-- raw HTML omitted -->');
    } else {
      this.lit(node.literal);
    }
    this.cr();
  }

  function custom_inline(node, entering) {
    if (entering && node.onEnter) {
      this.lit(node.onEnter);
    } else if (!entering && node.onExit) {
      this.lit(node.onExit);
    }
  }

  function custom_block(node, entering) {
    this.cr();
    if (entering && node.onEnter) {
      this.lit(node.onEnter);
    } else if (!entering && node.onExit) {
      this.lit(node.onExit);
    }
    this.cr();
  }

  /* Helper methods */

  function out$1(s) {
    this.lit(this.esc(s));
  }

  function attrs (node) {
    var att = [];
    if (this.options.sourcepos) {
      var pos = node.sourcepos;
      if (pos) {
        att.push(['data-sourcepos', String(pos[0][0]) + ':' +
          String(pos[0][1]) + '-' + String(pos[1][0]) + ':' +
          String(pos[1][1])]);
      }
    }
    return att;
  }

  // quick browser-compatible inheritance
  HtmlRenderer.prototype = Object.create(renderer.prototype);

  HtmlRenderer.prototype.text = text$2;
  HtmlRenderer.prototype.html_inline = html_inline;
  HtmlRenderer.prototype.html_block = html_block;
  HtmlRenderer.prototype.softbreak = softbreak;
  HtmlRenderer.prototype.linebreak = linebreak;
  HtmlRenderer.prototype.link = link;
  HtmlRenderer.prototype.image = image$1;
  HtmlRenderer.prototype.emph = emph;
  HtmlRenderer.prototype.strong = strong;
  HtmlRenderer.prototype.paragraph = paragraph;
  HtmlRenderer.prototype.heading = heading;
  HtmlRenderer.prototype.code = code;
  HtmlRenderer.prototype.code_block = code_block;
  HtmlRenderer.prototype.thematic_break = thematic_break;
  HtmlRenderer.prototype.block_quote = block_quote;
  HtmlRenderer.prototype.list = list;
  HtmlRenderer.prototype.item = item;
  HtmlRenderer.prototype.custom_inline = custom_inline;
  HtmlRenderer.prototype.custom_block = custom_block;

  HtmlRenderer.prototype.esc = common.escapeXml;

  HtmlRenderer.prototype.out = out$1;
  HtmlRenderer.prototype.tag = tag;
  HtmlRenderer.prototype.attrs = attrs;

  var html = HtmlRenderer;

  var reXMLTag = /\<[^>]*\>/;

  function toTagName(s) {
    return s.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
  }

  function XmlRenderer(options) {
    options = options || {};

    this.disableTags = 0;
    this.lastOut = "\n";

    this.indentLevel = 0;
    this.indent = '  ';

    this.options = options;
  }

  function render$1(ast) {

    this.buffer = '';

    var attrs;
    var tagname;
    var walker = ast.walker();
    var event, node, entering;
    var container;
    var selfClosing;
    var nodetype;

    var options = this.options;

    if (options.time) { console.time("rendering"); }

    this.buffer += '<?xml version="1.0" encoding="UTF-8"?>\n';
    this.buffer += '<!DOCTYPE document SYSTEM "CommonMark.dtd">\n';

    while ((event = walker.next())) {
      entering = event.entering;
      node = event.node;
      nodetype = node.type;

      container = node.isContainer;

      selfClosing = nodetype === 'thematic_break'
        || nodetype === 'linebreak'
        || nodetype === 'softbreak';

      tagname = toTagName(nodetype);

      if (entering) {

          attrs = [];

          switch (nodetype) {
            case 'document':
              attrs.push(['xmlns', 'http://commonmark.org/xml/1.0']);
              break;
            case 'list':
              if (node.listType !== null) {
                attrs.push(['type', node.listType.toLowerCase()]);
              }
              if (node.listStart !== null) {
                attrs.push(['start', String(node.listStart)]);
              }
              if (node.listTight !== null) {
                attrs.push(['tight', (node.listTight ? 'true' : 'false')]);
              }
              var delim = node.listDelimiter;
              if (delim !== null) {
                var delimword = '';
                if (delim === '.') {
                  delimword = 'period';
                } else {
                  delimword = 'paren';
                }
                attrs.push(['delimiter', delimword]);
              }
              break;
            case 'code_block':
              if (node.info) {
                attrs.push(['info', node.info]);
              }
              break;
            case 'heading':
              attrs.push(['level', String(node.level)]);
              break;
            case 'link':
            case 'image':
              attrs.push(['destination', node.destination]);
              attrs.push(['title', node.title]);
              break;
            case 'custom_inline':
            case 'custom_block':
              attrs.push(['on_enter', node.onEnter]);
              attrs.push(['on_exit', node.onExit]);
              break;
          }
          if (options.sourcepos) {
            var pos = node.sourcepos;
            if (pos) {
              attrs.push(['sourcepos', String(pos[0][0]) + ':' +
                String(pos[0][1]) + '-' + String(pos[1][0]) + ':' +
                String(pos[1][1])]);
            }
          }

          this.cr();
          this.out(this.tag(tagname, attrs, selfClosing));
          if (container) {
            this.indentLevel += 1;
          } else if (!container && !selfClosing) {
            var lit = node.literal;
            if (lit) {
              this.out(this.esc(lit));
            }
            this.out(this.tag('/' + tagname));
          }
      } else {
        this.indentLevel -= 1;
        this.cr();
        this.out(this.tag('/' + tagname));
      }
    }
    if (options.time) { console.timeEnd("rendering"); }
    this.buffer += '\n';
    return this.buffer;
  }

  function out$2(s) {
    if(this.disableTags > 0) {
      this.buffer += s.replace(reXMLTag, '');
    }else {
      this.buffer += s;
    }
    this.lastOut = s;
  }

  function cr$1() {
    if(this.lastOut !== '\n') {
      this.buffer += '\n';
      this.lastOut = '\n';
      for(var i = this.indentLevel; i > 0; i--) {
        this.buffer += this.indent;
      }
    }
  }

  // Helper function to produce an XML tag.
  function tag$1(name, attrs, selfclosing) {
    var result = '<' + name;
    if(attrs && attrs.length > 0) {
      var i = 0;
      var attrib;
      while ((attrib = attrs[i]) !== undefined) {
        result += ' ' + attrib[0] + '="' + this.esc(attrib[1]) + '"';
        i++;
      }
    }
    if(selfclosing) {
      result += ' /';
    }
    result += '>';
    return result;
  }

  // quick browser-compatible inheritance
  XmlRenderer.prototype = Object.create(renderer.prototype);

  XmlRenderer.prototype.render = render$1;
  XmlRenderer.prototype.out = out$2;
  XmlRenderer.prototype.cr = cr$1;
  XmlRenderer.prototype.tag = tag$1;
  XmlRenderer.prototype.esc = common.escapeXml;

  var xml$2 = XmlRenderer;

  // commonmark.js - CommomMark in JavaScript
  // Copyright (C) 2014 John MacFarlane
  // License: BSD3.

  // Basic usage:
  //
  // var commonmark = require('commonmark');
  // var parser = new commonmark.Parser();
  // var renderer = new commonmark.HtmlRenderer();
  // console.log(renderer.render(parser.parse('Hello *world*')));

  var Node$1 = node;
  var Parser$1 = blocks_1;
  var Renderer$1 = renderer;
  var HtmlRenderer$1 = html;
  var XmlRenderer$1 = xml$2;

  var lib = {
  	Node: Node$1,
  	Parser: Parser$1,
  	Renderer: Renderer$1,
  	HtmlRenderer: HtmlRenderer$1,
  	XmlRenderer: XmlRenderer$1
  };

  /* src/PostThread.html generated by Svelte v3.20.1 */

  function get_each_context$3(ctx, list, i) {
  	var child_ctx = ctx.slice();
  	child_ctx[14] = list[i];
  	return child_ctx;
  }

  function get_each_context_1(ctx, list, i) {
  	var child_ctx = ctx.slice();
  	child_ctx[19] = list[i];
  	return child_ctx;
  }

  // (62:4) {#if post.title}
  function create_if_block_3$2(ctx) {
  	var h2;
  	var t_value = /*post*/ ctx[1].title + "";
  	var t;

  	return {
  		c: function c() {
  			h2 = element("h2");
  			t = text(t_value);
  		},
  		m: function m(target, anchor) {
  			insert(target, h2, anchor);
  			append(h2, t);
  		},
  		p: function p(ctx, dirty) {
  			if (dirty & /*post*/ 2 && t_value !== (t_value = /*post*/ ctx[1].title + "")) { set_data(t, t_value); }
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(h2); }
  		}
  	};
  }

  // (65:4) {#if post.description}
  function create_if_block_2$2(ctx) {
  	var p0;
  	var t_value = /*post*/ ctx[1].description + "";
  	var t;
  	var p1;

  	return {
  		c: function c() {
  			p0 = element("p");
  			t = text(t_value);
  			p1 = element("p");
  		},
  		m: function m(target, anchor) {
  			insert(target, p0, anchor);
  			append(p0, t);
  			insert(target, p1, anchor);
  		},
  		p: function p(ctx, dirty) {
  			if (dirty & /*post*/ 2 && t_value !== (t_value = /*post*/ ctx[1].description + "")) { set_data(t, t_value); }
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(p0); }
  			if (detaching) { detach(p1); }
  		}
  	};
  }

  // (70:4) {:else}
  function create_else_block_1$2(ctx) {
  	var each_1_anchor;
  	var each_value_1 = splitLines(/*post*/ ctx[1].body);
  	var each_blocks = [];

  	for (var i = 0; i < each_value_1.length; i += 1) {
  		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
  	}

  	return {
  		c: function c() {
  			for (var i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			each_1_anchor = empty();
  		},
  		m: function m(target, anchor) {
  			for (var i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(target, anchor);
  			}

  			insert(target, each_1_anchor, anchor);
  		},
  		p: function p(ctx, dirty) {
  			if (dirty & /*splitLines, post*/ 2) {
  				each_value_1 = splitLines(/*post*/ ctx[1].body);
  				var i;

  				for (i = 0; i < each_value_1.length; i += 1) {
  					var child_ctx = get_each_context_1(ctx, each_value_1, i);

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
  		d: function d(detaching) {
  			destroy_each(each_blocks, detaching);
  			if (detaching) { detach(each_1_anchor); }
  		}
  	};
  }

  // (68:4) {#if post.format === 1}
  function create_if_block_1$2(ctx) {
  	var html_tag;
  	var raw_value = /*renderMarkdown*/ ctx[6](/*post*/ ctx[1].body) + "";

  	return {
  		c: function c() {
  			html_tag = new HtmlTag(raw_value, null);
  		},
  		m: function m(target, anchor) {
  			html_tag.m(target, anchor);
  		},
  		p: function p(ctx, dirty) {
  			if (dirty & /*post*/ 2 && raw_value !== (raw_value = /*renderMarkdown*/ ctx[6](/*post*/ ctx[1].body) + "")) { html_tag.p(raw_value); }
  		},
  		d: function d(detaching) {
  			if (detaching) { html_tag.d(); }
  		}
  	};
  }

  // (71:8) {#each splitLines(post.body) as line}
  function create_each_block_1(ctx) {
  	var p;
  	var t_value = /*line*/ ctx[19] + "";
  	var t;

  	return {
  		c: function c() {
  			p = element("p");
  			t = text(t_value);
  		},
  		m: function m(target, anchor) {
  			insert(target, p, anchor);
  			append(p, t);
  		},
  		p: function p(ctx, dirty) {
  			if (dirty & /*post*/ 2 && t_value !== (t_value = /*line*/ ctx[19] + "")) { set_data(t, t_value); }
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(p); }
  		}
  	};
  }

  // (83:4) {:catch err}
  function create_catch_block$3(ctx) {
  	var p;
  	var t0;
  	var t1_value = /*err*/ ctx[18].message + "";
  	var t1;

  	return {
  		c: function c() {
  			p = element("p");
  			t0 = text("Error: ");
  			t1 = text(t1_value);
  		},
  		m: function m(target, anchor) {
  			insert(target, p, anchor);
  			append(p, t0);
  			append(p, t1);
  		},
  		p: function p(ctx, dirty) {
  			if (dirty & /*replyResponse*/ 8 && t1_value !== (t1_value = /*err*/ ctx[18].message + "")) { set_data(t1, t1_value); }
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(p); }
  		}
  	};
  }

  // (77:4) {:then _}
  function create_then_block$3(ctx) {
  	var if_block_anchor;

  	function select_block_type_1(ctx, dirty) {
  		if (/*replyId*/ ctx[0] === /*post*/ ctx[1].id) { return create_if_block$3; }
  		return create_else_block$2;
  	}

  	var current_block_type = select_block_type_1(ctx);
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
  		p: function p(ctx, dirty) {
  			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
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
  		d: function d(detaching) {
  			if_block.d(detaching);
  			if (detaching) { detach(if_block_anchor); }
  		}
  	};
  }

  // (80:4) {:else}
  function create_else_block$2(ctx) {
  	var button;
  	var dispose;

  	return {
  		c: function c() {
  			button = element("button");
  			button.textContent = "Reply";
  		},
  		m: function m(target, anchor, remount) {
  			insert(target, button, anchor);
  			if (remount) { dispose(); }
  			dispose = listen(button, "click", /*replyBegin*/ ctx[4]);
  		},
  		p: noop$1,
  		d: function d(detaching) {
  			if (detaching) { detach(button); }
  			dispose();
  		}
  	};
  }

  // (78:4) {#if replyId === post.id}
  function create_if_block$3(ctx) {
  	var textarea;
  	var dispose;

  	return {
  		c: function c() {
  			textarea = element("textarea");
  		},
  		m: function m(target, anchor, remount) {
  			insert(target, textarea, anchor);
  			set_input_value(textarea, /*replyValue*/ ctx[2]);
  			if (remount) { run_all(dispose); }

  			dispose = [
  				listen(textarea, "input", /*textarea_input_handler*/ ctx[11]),
  				listen(textarea, "keydown", /*keyHandler*/ ctx[5])
  			];
  		},
  		p: function p(ctx, dirty) {
  			if (dirty & /*replyValue*/ 4) {
  				set_input_value(textarea, /*replyValue*/ ctx[2]);
  			}
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(textarea); }
  			run_all(dispose);
  		}
  	};
  }

  // (75:26)      <p>...</p>     {:then _}
  function create_pending_block$3(ctx) {
  	var p;

  	return {
  		c: function c() {
  			p = element("p");
  			p.textContent = "...";
  		},
  		m: function m(target, anchor) {
  			insert(target, p, anchor);
  		},
  		p: noop$1,
  		d: function d(detaching) {
  			if (detaching) { detach(p); }
  		}
  	};
  }

  // (86:4) {#each post.replies as reply}
  function create_each_block$3(ctx) {
  	var updating_replyId;
  	var current;

  	function postthread_replyId_binding(value) {
  		/*postthread_replyId_binding*/ ctx[12].call(null, value);
  	}

  	var postthread_props = { post: /*reply*/ ctx[14] };

  	if (/*replyId*/ ctx[0] !== void 0) {
  		postthread_props.replyId = /*replyId*/ ctx[0];
  	}

  	var postthread = new PostThread({ props: postthread_props });
  	binding_callbacks.push(function () { return bind$1(postthread, "replyId", postthread_replyId_binding); });
  	postthread.$on("reply", /*reply_handler*/ ctx[13]);

  	return {
  		c: function c() {
  			create_component(postthread.$$.fragment);
  		},
  		m: function m(target, anchor) {
  			mount_component(postthread, target, anchor);
  			current = true;
  		},
  		p: function p(ctx, dirty) {
  			var postthread_changes = {};
  			if (dirty & /*post*/ 2) { postthread_changes.post = /*reply*/ ctx[14]; }

  			if (!updating_replyId && dirty & /*replyId*/ 1) {
  				updating_replyId = true;
  				postthread_changes.replyId = /*replyId*/ ctx[0];
  				add_flush_callback(function () { return updating_replyId = false; });
  			}

  			postthread.$set(postthread_changes);
  		},
  		i: function i(local) {
  			if (current) { return; }
  			transition_in(postthread.$$.fragment, local);
  			current = true;
  		},
  		o: function o(local) {
  			transition_out(postthread.$$.fragment, local);
  			current = false;
  		},
  		d: function d(detaching) {
  			destroy_component(postthread, detaching);
  		}
  	};
  }

  function create_fragment$3(ctx) {
  	var div;
  	var t0;
  	var t1;
  	var t2;
  	var promise;
  	var t3;
  	var current;
  	var if_block0 = /*post*/ ctx[1].title && create_if_block_3$2(ctx);
  	var if_block1 = /*post*/ ctx[1].description && create_if_block_2$2(ctx);

  	function select_block_type(ctx, dirty) {
  		if (/*post*/ ctx[1].format === 1) { return create_if_block_1$2; }
  		return create_else_block_1$2;
  	}

  	var current_block_type = select_block_type(ctx);
  	var if_block2 = current_block_type(ctx);

  	var info = {
  		ctx: ctx,
  		current: null,
  		token: null,
  		pending: create_pending_block$3,
  		then: create_then_block$3,
  		catch: create_catch_block$3,
  		value: 17,
  		error: 18
  	};

  	handle_promise(promise = /*replyResponse*/ ctx[3], info);
  	var each_value = /*post*/ ctx[1].replies;
  	var each_blocks = [];

  	for (var i = 0; i < each_value.length; i += 1) {
  		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
  	}

  	var out = function (i) { return transition_out(each_blocks[i], 1, 1, function () {
  		each_blocks[i] = null;
  	}); };

  	return {
  		c: function c() {
  			div = element("div");
  			if (if_block0) { if_block0.c(); }
  			t0 = space();
  			if (if_block1) { if_block1.c(); }
  			t1 = space();
  			if_block2.c();
  			t2 = space();
  			info.block.c();
  			t3 = space();

  			for (var i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			attr(div, "class", "post");
  		},
  		m: function m(target, anchor) {
  			insert(target, div, anchor);
  			if (if_block0) { if_block0.m(div, null); }
  			append(div, t0);
  			if (if_block1) { if_block1.m(div, null); }
  			append(div, t1);
  			if_block2.m(div, null);
  			append(div, t2);
  			info.block.m(div, info.anchor = null);
  			info.mount = function () { return div; };
  			info.anchor = t3;
  			append(div, t3);

  			for (var i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(div, null);
  			}

  			current = true;
  		},
  		p: function p(new_ctx, ref) {
  			var dirty = ref[0];

  			ctx = new_ctx;

  			if (/*post*/ ctx[1].title) {
  				if (if_block0) {
  					if_block0.p(ctx, dirty);
  				} else {
  					if_block0 = create_if_block_3$2(ctx);
  					if_block0.c();
  					if_block0.m(div, t0);
  				}
  			} else if (if_block0) {
  				if_block0.d(1);
  				if_block0 = null;
  			}

  			if (/*post*/ ctx[1].description) {
  				if (if_block1) {
  					if_block1.p(ctx, dirty);
  				} else {
  					if_block1 = create_if_block_2$2(ctx);
  					if_block1.c();
  					if_block1.m(div, t1);
  				}
  			} else if (if_block1) {
  				if_block1.d(1);
  				if_block1 = null;
  			}

  			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block2) {
  				if_block2.p(ctx, dirty);
  			} else {
  				if_block2.d(1);
  				if_block2 = current_block_type(ctx);

  				if (if_block2) {
  					if_block2.c();
  					if_block2.m(div, t2);
  				}
  			}

  			info.ctx = ctx;

  			if (dirty & /*replyResponse*/ 8 && promise !== (promise = /*replyResponse*/ ctx[3]) && handle_promise(promise, info)) ; else {
  				var child_ctx = ctx.slice();
  				child_ctx[17] = info.resolved;
  				info.block.p(child_ctx, dirty);
  			}

  			if (dirty & /*post, replyId*/ 3) {
  				each_value = /*post*/ ctx[1].replies;
  				var i;

  				for (i = 0; i < each_value.length; i += 1) {
  					var child_ctx$1 = get_each_context$3(ctx, each_value, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx$1, dirty);
  						transition_in(each_blocks[i], 1);
  					} else {
  						each_blocks[i] = create_each_block$3(child_ctx$1);
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
  		i: function i(local) {
  			if (current) { return; }

  			for (var i = 0; i < each_value.length; i += 1) {
  				transition_in(each_blocks[i]);
  			}

  			current = true;
  		},
  		o: function o(local) {
  			each_blocks = each_blocks.filter(Boolean);

  			for (var i = 0; i < each_blocks.length; i += 1) {
  				transition_out(each_blocks[i]);
  			}

  			current = false;
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(div); }
  			if (if_block0) { if_block0.d(); }
  			if (if_block1) { if_block1.d(); }
  			if_block2.d();
  			info.block.d();
  			info.token = null;
  			info = null;
  			destroy_each(each_blocks, detaching);
  		}
  	};
  }

  var uri = "http://localhost:8080/api/v1";

  function splitLines(body) {
  	return body.split(/\n+/);
  }

  function instance$3($$self, $$props, $$invalidate) {
  	var post = $$props.post;
  	var dispatch = createEventDispatcher();
  	var replyId = $$props.replyId;
  	var reader = new lib.Parser({ smart: true });
  	var writer = new lib.HtmlRenderer({ safe: true });
  	var replyValue;
  	var replyResponse = Promise.resolve(true);

  	function replySubmit() {
  		if (replyValue && replyValue.length) {
  			$$invalidate(3, replyResponse = fetch((uri + "/posts/" + (post.id) + "/replies"), {
  				method: "POST",
  				headers: { "Content-Type": "application/json" },
  				credentials: "same-origin",
  				body: JSON.stringify({ body: replyValue })
  			}).then(function (res) { return res.json(); }).then(function (res) {
  				console.log(res);
  				$$invalidate(2, replyValue = "");
  				dispatch("reply", post);
  				$$invalidate(0, replyId = false);
  			}));
  		} // end [if]
  	} // end [replySubmit]

  	function replyBegin() {
  		$$invalidate(0, replyId = post.id);
  	}

  	function keyHandler(e) {
  		if (e.keyCode === 13 && !e.shiftKey) {
  			replySubmit();
  		} // end [if]
  	} // end [keyHandler]

  	// TODO: check security
  	function renderMarkdown(body) {
  		var parsed = reader.parse(body);
  		return writer.render(parsed);
  	}

  	function textarea_input_handler() {
  		replyValue = this.value;
  		$$invalidate(2, replyValue);
  	}

  	function postthread_replyId_binding(value) {
  		replyId = value;
  		$$invalidate(0, replyId);
  	}

  	function reply_handler(event) {
  		bubble($$self, event);
  	}

  	$$self.$set = function ($$props) {
  		if ("post" in $$props) { $$invalidate(1, post = $$props.post); }
  		if ("replyId" in $$props) { $$invalidate(0, replyId = $$props.replyId); }
  	};

  	return [
  		replyId,
  		post,
  		replyValue,
  		replyResponse,
  		replyBegin,
  		keyHandler,
  		renderMarkdown,
  		dispatch,
  		reader,
  		writer,
  		replySubmit,
  		textarea_input_handler,
  		postthread_replyId_binding,
  		reply_handler
  	];
  }

  var PostThread = /*@__PURE__*/(function (SvelteComponent) {
  	function PostThread(options) {
  		SvelteComponent.call(this);
  		init(this, options, instance$3, create_fragment$3, safe_not_equal, { post: 1, replyId: 0 });
  	}

  	if ( SvelteComponent ) PostThread.__proto__ = SvelteComponent;
  	PostThread.prototype = Object.create( SvelteComponent && SvelteComponent.prototype );
  	PostThread.prototype.constructor = PostThread;

  	return PostThread;
  }(SvelteComponent));

  /* src/Board.html generated by Svelte v3.20.1 */

  function get_each_context$4(ctx, list, i) {
  	var child_ctx = ctx.slice();
  	child_ctx[9] = list[i];
  	return child_ctx;
  }

  // (41:0) {:catch err}
  function create_catch_block$4(ctx) {
  	var p;
  	var t0;
  	var t1_value = /*err*/ ctx[8].message + "";
  	var t1;

  	return {
  		c: function c() {
  			p = element("p");
  			t0 = text("Error: ");
  			t1 = text(t1_value);
  		},
  		m: function m(target, anchor) {
  			insert(target, p, anchor);
  			append(p, t0);
  			append(p, t1);
  		},
  		p: function p(ctx, dirty) {
  			if (dirty & /*postsRequest*/ 2 && t1_value !== (t1_value = /*err*/ ctx[8].message + "")) { set_data(t1, t1_value); }
  		},
  		i: noop$1,
  		o: noop$1,
  		d: function d(detaching) {
  			if (detaching) { detach(p); }
  		}
  	};
  }

  // (31:0) {:then posts}
  function create_then_block$4(ctx) {
  	var current_block_type_index;
  	var if_block;
  	var if_block_anchor;
  	var current;
  	var if_block_creators = [create_if_block$4, create_else_block$3];
  	var if_blocks = [];

  	function select_block_type(ctx, dirty) {
  		if (/*postId*/ ctx[0]) { return 0; }
  		return 1;
  	}

  	current_block_type_index = select_block_type(ctx);
  	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

  	return {
  		c: function c() {
  			if_block.c();
  			if_block_anchor = empty();
  		},
  		m: function m(target, anchor) {
  			if_blocks[current_block_type_index].m(target, anchor);
  			insert(target, if_block_anchor, anchor);
  			current = true;
  		},
  		p: function p(ctx, dirty) {
  			var previous_block_index = current_block_type_index;
  			current_block_type_index = select_block_type(ctx);

  			if (current_block_type_index === previous_block_index) {
  				if_blocks[current_block_type_index].p(ctx, dirty);
  			} else {
  				group_outros();

  				transition_out(if_blocks[previous_block_index], 1, 1, function () {
  					if_blocks[previous_block_index] = null;
  				});

  				check_outros();
  				if_block = if_blocks[current_block_type_index];

  				if (!if_block) {
  					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  					if_block.c();
  				}

  				transition_in(if_block, 1);
  				if_block.m(if_block_anchor.parentNode, if_block_anchor);
  			}
  		},
  		i: function i(local) {
  			if (current) { return; }
  			transition_in(if_block);
  			current = true;
  		},
  		o: function o(local) {
  			transition_out(if_block);
  			current = false;
  		},
  		d: function d(detaching) {
  			if_blocks[current_block_type_index].d(detaching);
  			if (detaching) { detach(if_block_anchor); }
  		}
  	};
  }

  // (34:0) {:else}
  function create_else_block$3(ctx) {
  	var ul;
  	var each_value = /*posts*/ ctx[7];
  	var each_blocks = [];

  	for (var i = 0; i < each_value.length; i += 1) {
  		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
  	}

  	return {
  		c: function c() {
  			ul = element("ul");

  			for (var i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}
  		},
  		m: function m(target, anchor) {
  			insert(target, ul, anchor);

  			for (var i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(ul, null);
  			}
  		},
  		p: function p(ctx, dirty) {
  			if (dirty & /*selectPost, postsRequest*/ 10) {
  				each_value = /*posts*/ ctx[7];
  				var i;

  				for (i = 0; i < each_value.length; i += 1) {
  					var child_ctx = get_each_context$4(ctx, each_value, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block$4(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(ul, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value.length;
  			}
  		},
  		i: noop$1,
  		o: noop$1,
  		d: function d(detaching) {
  			if (detaching) { detach(ul); }
  			destroy_each(each_blocks, detaching);
  		}
  	};
  }

  // (32:0) {#if postId}
  function create_if_block$4(ctx) {
  	var updating_replyId;
  	var current;

  	function postthread_replyId_binding(value) {
  		/*postthread_replyId_binding*/ ctx[5].call(null, value);
  	}

  	var postthread_props = { post: /*posts*/ ctx[7] };

  	if (/*replyId*/ ctx[2] !== void 0) {
  		postthread_props.replyId = /*replyId*/ ctx[2];
  	}

  	var postthread = new PostThread({ props: postthread_props });
  	binding_callbacks.push(function () { return bind$1(postthread, "replyId", postthread_replyId_binding); });
  	postthread.$on("reply", /*refreshThread*/ ctx[4]);

  	return {
  		c: function c() {
  			create_component(postthread.$$.fragment);
  		},
  		m: function m(target, anchor) {
  			mount_component(postthread, target, anchor);
  			current = true;
  		},
  		p: function p(ctx, dirty) {
  			var postthread_changes = {};
  			if (dirty & /*postsRequest*/ 2) { postthread_changes.post = /*posts*/ ctx[7]; }

  			if (!updating_replyId && dirty & /*replyId*/ 4) {
  				updating_replyId = true;
  				postthread_changes.replyId = /*replyId*/ ctx[2];
  				add_flush_callback(function () { return updating_replyId = false; });
  			}

  			postthread.$set(postthread_changes);
  		},
  		i: function i(local) {
  			if (current) { return; }
  			transition_in(postthread.$$.fragment, local);
  			current = true;
  		},
  		o: function o(local) {
  			transition_out(postthread.$$.fragment, local);
  			current = false;
  		},
  		d: function d(detaching) {
  			destroy_component(postthread, detaching);
  		}
  	};
  }

  // (36:4) {#each posts as post}
  function create_each_block$4(ctx) {
  	var li;
  	var t0_value = /*post*/ ctx[9].title + "";
  	var t0;
  	var t1;
  	var t2_value = /*post*/ ctx[9].created + "";
  	var t2;
  	var dispose;

  	function click_handler() {
  		var args = [], len = arguments.length;
  		while ( len-- ) args[ len ] = arguments[ len ];

  		return /*click_handler*/ ctx[6].apply(/*post*/ ctx, [ ctx[9] ].concat( args ));
  	}

  	return {
  		c: function c() {
  			li = element("li");
  			t0 = text(t0_value);
  			t1 = space();
  			t2 = text(t2_value);
  		},
  		m: function m(target, anchor, remount) {
  			insert(target, li, anchor);
  			append(li, t0);
  			append(li, t1);
  			append(li, t2);
  			if (remount) { dispose(); }
  			dispose = listen(li, "click", click_handler);
  		},
  		p: function p(new_ctx, dirty) {
  			ctx = new_ctx;
  			if (dirty & /*postsRequest*/ 2 && t0_value !== (t0_value = /*post*/ ctx[9].title + "")) { set_data(t0, t0_value); }
  			if (dirty & /*postsRequest*/ 2 && t2_value !== (t2_value = /*post*/ ctx[9].created + "")) { set_data(t2, t2_value); }
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(li); }
  			dispose();
  		}
  	};
  }

  // (29:21)  <p>...</p> {:then posts}
  function create_pending_block$4(ctx) {
  	var p;

  	return {
  		c: function c() {
  			p = element("p");
  			p.textContent = "...";
  		},
  		m: function m(target, anchor) {
  			insert(target, p, anchor);
  		},
  		p: noop$1,
  		i: noop$1,
  		o: noop$1,
  		d: function d(detaching) {
  			if (detaching) { detach(p); }
  		}
  	};
  }

  function create_fragment$4(ctx) {
  	var await_block_anchor;
  	var promise;
  	var current;

  	var info = {
  		ctx: ctx,
  		current: null,
  		token: null,
  		pending: create_pending_block$4,
  		then: create_then_block$4,
  		catch: create_catch_block$4,
  		value: 7,
  		error: 8,
  		blocks: [,,,]
  	};

  	handle_promise(promise = /*postsRequest*/ ctx[1], info);

  	return {
  		c: function c() {
  			await_block_anchor = empty();
  			info.block.c();
  		},
  		m: function m(target, anchor) {
  			insert(target, await_block_anchor, anchor);
  			info.block.m(target, info.anchor = anchor);
  			info.mount = function () { return await_block_anchor.parentNode; };
  			info.anchor = await_block_anchor;
  			current = true;
  		},
  		p: function p(new_ctx, ref) {
  			var dirty = ref[0];

  			ctx = new_ctx;
  			info.ctx = ctx;

  			if (dirty & /*postsRequest*/ 2 && promise !== (promise = /*postsRequest*/ ctx[1]) && handle_promise(promise, info)) ; else {
  				var child_ctx = ctx.slice();
  				child_ctx[7] = info.resolved;
  				info.block.p(child_ctx, dirty);
  			}
  		},
  		i: function i(local) {
  			if (current) { return; }
  			transition_in(info.block);
  			current = true;
  		},
  		o: function o(local) {
  			for (var i = 0; i < 3; i += 1) {
  				var block = info.blocks[i];
  				transition_out(block);
  			}

  			current = false;
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(await_block_anchor); }
  			info.block.d(detaching);
  			info.token = null;
  			info = null;
  		}
  	};
  }

  var uri$1 = "http://localhost:8080/api/v1";

  function instance$4($$self, $$props, $$invalidate) {
  	var postId = $$props.postId;

  	var postsRequest = new Promise(function () {
  			
  		});

  	// sync posts to only allow one reply at a time.
  	var replyId;

  	function selectPost(id) {
  		$$invalidate(0, postId = id);
  	}

  	function refreshThread() {
  		$$invalidate(1, postsRequest = fetch((uri$1 + "/posts/" + postId + "/thread")).then(function (res) { return res.json(); }));
  	}

  	function postthread_replyId_binding(value) {
  		replyId = value;
  		$$invalidate(2, replyId);
  	}

  	var click_handler = function (post) { return selectPost(post.id); };

  	$$self.$set = function ($$props) {
  		if ("postId" in $$props) { $$invalidate(0, postId = $$props.postId); }
  	};

  	$$self.$$.update = function () {
  		if ($$self.$$.dirty & /*postId*/ 1) {
  			 if (postId) {
  				$$invalidate(1, postsRequest = fetch((uri$1 + "/posts/" + postId + "/thread")).then(function (res) { return res.json(); }));
  			} else {
  				$$invalidate(1, postsRequest = fetch((uri$1 + "/posts")).then(function (res) { return res.json(); }));
  			}
  		}
  	};

  	return [
  		postId,
  		postsRequest,
  		replyId,
  		selectPost,
  		refreshThread,
  		postthread_replyId_binding,
  		click_handler
  	];
  }

  var Board = /*@__PURE__*/(function (SvelteComponent) {
  	function Board(options) {
  		SvelteComponent.call(this);
  		init(this, options, instance$4, create_fragment$4, safe_not_equal, { postId: 0 });
  	}

  	if ( SvelteComponent ) Board.__proto__ = SvelteComponent;
  	Board.prototype = Object.create( SvelteComponent && SvelteComponent.prototype );
  	Board.prototype.constructor = Board;

  	return Board;
  }(SvelteComponent));

  /* src/PostMarkdown.html generated by Svelte v3.20.1 */

  function create_catch_block_1(ctx) {
  	var p;
  	var t0;
  	var t1_value = /*err*/ ctx[14].message + "";
  	var t1;

  	return {
  		c: function c() {
  			p = element("p");
  			t0 = text("Error: ");
  			t1 = text(t1_value);
  			attr(p, "class", "svelte-irwgai");
  		},
  		m: function m(target, anchor) {
  			insert(target, p, anchor);
  			append(p, t0);
  			append(p, t1);
  		},
  		p: function p(ctx, dirty) {
  			if (dirty & /*postRequest*/ 8 && t1_value !== (t1_value = /*err*/ ctx[14].message + "")) { set_data(t1, t1_value); }
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(p); }
  		}
  	};
  }

  // (95:0) {:then}
  function create_then_block$5(ctx) {
  	var label0;
  	var t0;
  	var input0;
  	var t1;
  	var label1;
  	var t2;
  	var input1;
  	var t3;
  	var label2;
  	var t5;
  	var div1;
  	var textarea;
  	var t6;
  	var div0;
  	var t7;
  	var button;
  	var t9;
  	var if_block_anchor;
  	var dispose;
  	var if_block = /*saveRequest*/ ctx[4] && create_if_block$5(ctx);

  	return {
  		c: function c() {
  			label0 = element("label");
  			t0 = text("Title ");
  			input0 = element("input");
  			t1 = space();
  			label1 = element("label");
  			t2 = text("Description ");
  			input1 = element("input");
  			t3 = space();
  			label2 = element("label");
  			label2.textContent = "Body";
  			t5 = space();
  			div1 = element("div");
  			textarea = element("textarea");
  			t6 = space();
  			div0 = element("div");
  			t7 = space();
  			button = element("button");
  			button.textContent = "Save";
  			t9 = space();
  			if (if_block) { if_block.c(); }
  			if_block_anchor = empty();
  			attr(input0, "type", "text");
  			attr(label0, "class", "svelte-irwgai");
  			attr(input1, "type", "text");
  			attr(label1, "class", "svelte-irwgai");
  			attr(label2, "class", "svelte-irwgai");
  			attr(textarea, "class", "svelte-irwgai");
  			attr(div0, "class", "preview svelte-irwgai");
  			attr(div1, "class", "editor svelte-irwgai");
  			attr(button, "class", "svelte-irwgai");
  		},
  		m: function m(target, anchor, remount) {
  			insert(target, label0, anchor);
  			append(label0, t0);
  			append(label0, input0);
  			set_input_value(input0, /*title*/ ctx[0]);
  			insert(target, t1, anchor);
  			insert(target, label1, anchor);
  			append(label1, t2);
  			append(label1, input1);
  			set_input_value(input1, /*description*/ ctx[1]);
  			insert(target, t3, anchor);
  			insert(target, label2, anchor);
  			insert(target, t5, anchor);
  			insert(target, div1, anchor);
  			append(div1, textarea);
  			set_input_value(textarea, /*body*/ ctx[2]);
  			append(div1, t6);
  			append(div1, div0);
  			div0.innerHTML = /*rendered*/ ctx[5];
  			insert(target, t7, anchor);
  			insert(target, button, anchor);
  			insert(target, t9, anchor);
  			if (if_block) { if_block.m(target, anchor); }
  			insert(target, if_block_anchor, anchor);
  			if (remount) { run_all(dispose); }

  			dispose = [
  				listen(input0, "input", /*input0_input_handler*/ ctx[11]),
  				listen(input1, "input", /*input1_input_handler*/ ctx[12]),
  				listen(textarea, "input", /*textarea_input_handler*/ ctx[13]),
  				listen(button, "click", /*savePost*/ ctx[6])
  			];
  		},
  		p: function p(ctx, dirty) {
  			if (dirty & /*title*/ 1 && input0.value !== /*title*/ ctx[0]) {
  				set_input_value(input0, /*title*/ ctx[0]);
  			}

  			if (dirty & /*description*/ 2 && input1.value !== /*description*/ ctx[1]) {
  				set_input_value(input1, /*description*/ ctx[1]);
  			}

  			if (dirty & /*body*/ 4) {
  				set_input_value(textarea, /*body*/ ctx[2]);
  			}

  			if (dirty & /*rendered*/ 32) { div0.innerHTML = /*rendered*/ ctx[5]; }
  			if (/*saveRequest*/ ctx[4]) {
  				if (if_block) {
  					if_block.p(ctx, dirty);
  				} else {
  					if_block = create_if_block$5(ctx);
  					if_block.c();
  					if_block.m(if_block_anchor.parentNode, if_block_anchor);
  				}
  			} else if (if_block) {
  				if_block.d(1);
  				if_block = null;
  			}
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(label0); }
  			if (detaching) { detach(t1); }
  			if (detaching) { detach(label1); }
  			if (detaching) { detach(t3); }
  			if (detaching) { detach(label2); }
  			if (detaching) { detach(t5); }
  			if (detaching) { detach(div1); }
  			if (detaching) { detach(t7); }
  			if (detaching) { detach(button); }
  			if (detaching) { detach(t9); }
  			if (if_block) { if_block.d(detaching); }
  			if (detaching) { detach(if_block_anchor); }
  			run_all(dispose);
  		}
  	};
  }

  // (104:0) {#if saveRequest}
  function create_if_block$5(ctx) {
  	var await_block_anchor;
  	var promise;

  	var info = {
  		ctx: ctx,
  		current: null,
  		token: null,
  		pending: create_pending_block_1,
  		then: create_then_block_1,
  		catch: create_catch_block$5,
  		value: 15,
  		error: 14
  	};

  	handle_promise(promise = /*saveRequest*/ ctx[4], info);

  	return {
  		c: function c() {
  			await_block_anchor = empty();
  			info.block.c();
  		},
  		m: function m(target, anchor) {
  			insert(target, await_block_anchor, anchor);
  			info.block.m(target, info.anchor = anchor);
  			info.mount = function () { return await_block_anchor.parentNode; };
  			info.anchor = await_block_anchor;
  		},
  		p: function p(new_ctx, dirty) {
  			ctx = new_ctx;
  			info.ctx = ctx;

  			if (dirty & /*saveRequest*/ 16 && promise !== (promise = /*saveRequest*/ ctx[4]) && handle_promise(promise, info)) ; else {
  				var child_ctx = ctx.slice();
  				child_ctx[15] = info.resolved;
  				info.block.p(child_ctx, dirty);
  			}
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(await_block_anchor); }
  			info.block.d(detaching);
  			info.token = null;
  			info = null;
  		}
  	};
  }

  // (109:0) {:catch err}
  function create_catch_block$5(ctx) {
  	var p;
  	var t0;
  	var t1_value = /*err*/ ctx[14].message + "";
  	var t1;

  	return {
  		c: function c() {
  			p = element("p");
  			t0 = text("Error: ");
  			t1 = text(t1_value);
  			attr(p, "class", "svelte-irwgai");
  		},
  		m: function m(target, anchor) {
  			insert(target, p, anchor);
  			append(p, t0);
  			append(p, t1);
  		},
  		p: function p(ctx, dirty) {
  			if (dirty & /*saveRequest*/ 16 && t1_value !== (t1_value = /*err*/ ctx[14].message + "")) { set_data(t1, t1_value); }
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(p); }
  		}
  	};
  }

  // (107:0) {:then p}
  function create_then_block_1(ctx) {
  	var p;
  	var t0;
  	var t1_value = /*p*/ ctx[15].updated + "";
  	var t1;

  	return {
  		c: function c() {
  			p = element("p");
  			t0 = text("Saved: ");
  			t1 = text(t1_value);
  			attr(p, "class", "svelte-irwgai");
  		},
  		m: function m(target, anchor) {
  			insert(target, p, anchor);
  			append(p, t0);
  			append(p, t1);
  		},
  		p: function p(ctx, dirty) {
  			if (dirty & /*saveRequest*/ 16 && t1_value !== (t1_value = /*p*/ ctx[15].updated + "")) { set_data(t1, t1_value); }
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(p); }
  		}
  	};
  }

  // (105:20)  <p>Saving...</p> {:then p}
  function create_pending_block_1(ctx) {
  	var p;

  	return {
  		c: function c() {
  			p = element("p");
  			p.textContent = "Saving...";
  			attr(p, "class", "svelte-irwgai");
  		},
  		m: function m(target, anchor) {
  			insert(target, p, anchor);
  		},
  		p: noop$1,
  		d: function d(detaching) {
  			if (detaching) { detach(p); }
  		}
  	};
  }

  // (93:20)  <p>...</p> {:then}
  function create_pending_block$5(ctx) {
  	var p;

  	return {
  		c: function c() {
  			p = element("p");
  			p.textContent = "...";
  			attr(p, "class", "svelte-irwgai");
  		},
  		m: function m(target, anchor) {
  			insert(target, p, anchor);
  		},
  		p: noop$1,
  		d: function d(detaching) {
  			if (detaching) { detach(p); }
  		}
  	};
  }

  function create_fragment$5(ctx) {
  	var await_block_anchor;
  	var promise;

  	var info = {
  		ctx: ctx,
  		current: null,
  		token: null,
  		pending: create_pending_block$5,
  		then: create_then_block$5,
  		catch: create_catch_block_1,
  		error: 14
  	};

  	handle_promise(promise = /*postRequest*/ ctx[3], info);

  	return {
  		c: function c() {
  			await_block_anchor = empty();
  			info.block.c();
  		},
  		m: function m(target, anchor) {
  			insert(target, await_block_anchor, anchor);
  			info.block.m(target, info.anchor = anchor);
  			info.mount = function () { return await_block_anchor.parentNode; };
  			info.anchor = await_block_anchor;
  		},
  		p: function p(new_ctx, ref) {
  			var dirty = ref[0];

  			ctx = new_ctx;
  			info.ctx = ctx;

  			if (dirty & /*postRequest*/ 8 && promise !== (promise = /*postRequest*/ ctx[3]) && handle_promise(promise, info)) ; else {
  				var child_ctx = ctx.slice();
  				info.block.p(child_ctx, dirty);
  			}
  		},
  		i: noop$1,
  		o: noop$1,
  		d: function d(detaching) {
  			if (detaching) { detach(await_block_anchor); }
  			info.block.d(detaching);
  			info.token = null;
  			info = null;
  		}
  	};
  }

  var api$1 = "http://localhost:8080/api/v1";

  function instance$5($$self, $$props, $$invalidate) {
  	var postId = $$props.postId;
  	var title = $$props.title; if ( title === void 0 ) title = "";
  	var description = $$props.description; if ( description === void 0 ) description = "";
  	var body = $$props.body; if ( body === void 0 ) body = "";
  	var postRequest = Promise.resolve(true);
  	var saveRequest;
  	var rendered = "";
  	var timer;
  	var reader = new lib.Parser({ smart: true });
  	var writer = new lib.HtmlRenderer({ safe: true });

  	function savePost() {
  		if (title && description && body) {
  			var endpoint = api$1 + "/posts" + (postId ? ("/" + postId) : "");

  			$$invalidate(4, saveRequest = fetch(endpoint, {
  				method: "POST",
  				headers: { "Content-Type": "application/json" },
  				credentials: "same-origin",
  				body: JSON.stringify({ title: title, description: description, body: body, format: 1 })
  			}).then(function (res) { return res.json(); }).then(function (res) {
  				if (!postId) { $$invalidate(7, postId = res.id); }
  				return res;
  			}));
  		}
  	}

  	function input0_input_handler() {
  		title = this.value;
  		(($$invalidate(0, title), $$invalidate(7, postId)), $$invalidate(4, saveRequest));
  	}

  	function input1_input_handler() {
  		description = this.value;
  		(($$invalidate(1, description), $$invalidate(7, postId)), $$invalidate(4, saveRequest));
  	}

  	function textarea_input_handler() {
  		body = this.value;
  		(($$invalidate(2, body), $$invalidate(7, postId)), $$invalidate(4, saveRequest));
  	}

  	$$self.$set = function ($$props) {
  		if ("postId" in $$props) { $$invalidate(7, postId = $$props.postId); }
  		if ("title" in $$props) { $$invalidate(0, title = $$props.title); }
  		if ("description" in $$props) { $$invalidate(1, description = $$props.description); }
  		if ("body" in $$props) { $$invalidate(2, body = $$props.body); }
  	};

  	$$self.$$.update = function () {
  		if ($$self.$$.dirty & /*postId, saveRequest*/ 144) {
  			 if (postId && !saveRequest) {
  				$$invalidate(3, postRequest = fetch((api$1 + "/posts/" + postId)).then(function (res) { return res.json(); }).then(function (res) {
  					$$invalidate(0, title = res.title);
  					$$invalidate(1, description = res.description);
  					$$invalidate(2, body = res.body);
  					$$invalidate(4, saveRequest = Promise.resolve(res));
  					return res;
  				}));
  			}
  		}

  		if ($$self.$$.dirty & /*timer, body*/ 260) {
  			 {
  				if (timer) {
  					clearTimeout(timer);
  				}

  				$$invalidate(8, timer = setTimeout(
  					function () {
  						var parsed = reader.parse(body);
  						$$invalidate(5, rendered = writer.render(parsed));
  					},
  					250
  				));
  			}
  		}
  	};

  	return [
  		title,
  		description,
  		body,
  		postRequest,
  		saveRequest,
  		rendered,
  		savePost,
  		postId,
  		timer,
  		reader,
  		writer,
  		input0_input_handler,
  		input1_input_handler,
  		textarea_input_handler
  	];
  }

  var PostMarkdown = /*@__PURE__*/(function (SvelteComponent) {
  	function PostMarkdown(options) {
  		SvelteComponent.call(this);

  		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
  			postId: 7,
  			title: 0,
  			description: 1,
  			body: 2
  		});
  	}

  	if ( SvelteComponent ) PostMarkdown.__proto__ = SvelteComponent;
  	PostMarkdown.prototype = Object.create( SvelteComponent && SvelteComponent.prototype );
  	PostMarkdown.prototype.constructor = PostMarkdown;

  	return PostMarkdown;
  }(SvelteComponent));

  var main = {
      gallery: function gallery( target, props ){ 
          return  new Gallery({target: target,props: props}); 
      },
      galleryCreate: function galleryCreate( target, props ){ 
          return  new GalleryCreate({target: target,props: props});
      },
      userGalleryCreate: function userGalleryCreate( target, props ){ 
          return  new UserGalleryCreate({target: target,props: props});
      },
      board: function board( target, props ){ 
          return  new Board({target: target,props: props});
      },
      postMarkdown: function postMarkdown( target, props ){ 
          return  new PostMarkdown({target: target,props: props}); 
      }
  };

  return main;

}());
