/**
  * basicweb_galleries_client
  * (C) 2020 M. Bellaire
  * All rights Reserved
 */

var basicweb_galleries_client = (function () {
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
  var identity = function (x) { return x; };
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

  var is_client = typeof window !== 'undefined';
  var now = is_client
      ? function () { return window.performance.now(); }
      : function () { return Date.now(); };
  var raf = is_client ? function (cb) { return requestAnimationFrame(cb); } : noop$1;

  var tasks = new Set();
  function run_tasks(now) {
      tasks.forEach(function (task) {
          if (!task.c(now)) {
              tasks.delete(task);
              task.f();
          }
      });
      if (tasks.size !== 0)
          { raf(run_tasks); }
  }
  /**
   * Creates a new task that runs on each raf frame
   * until it returns a falsy value or is aborted
   */
  function loop(callback) {
      var task;
      if (tasks.size === 0)
          { raf(run_tasks); }
      return {
          promise: new Promise(function (fulfill) {
              tasks.add(task = { c: callback, f: fulfill });
          }),
          abort: function abort() {
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

  var active_docs = new Set();
  var active = 0;
  // https://github.com/darkskyapp/string-hash/blob/master/index.js
  function hash(str) {
      var hash = 5381;
      var i = str.length;
      while (i--)
          { hash = ((hash << 5) - hash) ^ str.charCodeAt(i); }
      return hash >>> 0;
  }
  function create_rule(node, a, b, duration, delay, ease, fn, uid) {
      if ( uid === void 0 ) uid = 0;

      var step = 16.666 / duration;
      var keyframes = '{\n';
      for (var p = 0; p <= 1; p += step) {
          var t = a + (b - a) * ease(p);
          keyframes += p * 100 + "%{" + (fn(t, 1 - t)) + "}\n";
      }
      var rule = keyframes + "100% {" + (fn(b, 1 - b)) + "}\n}";
      var name = "__svelte_" + (hash(rule)) + "_" + uid;
      var doc = node.ownerDocument;
      active_docs.add(doc);
      var stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
      var current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
      if (!current_rules[name]) {
          current_rules[name] = true;
          stylesheet.insertRule(("@keyframes " + name + " " + rule), stylesheet.cssRules.length);
      }
      var animation = node.style.animation || '';
      node.style.animation = "" + (animation ? (animation + ", ") : "") + name + " " + duration + "ms linear " + delay + "ms 1 both";
      active += 1;
      return name;
  }
  function delete_rule(node, name) {
      var previous = (node.style.animation || '').split(', ');
      var next = previous.filter(name
          ? function (anim) { return anim.indexOf(name) < 0; } // remove specific animation
          : function (anim) { return anim.indexOf('__svelte') === -1; } // remove all Svelte animations
      );
      var deleted = previous.length - next.length;
      if (deleted) {
          node.style.animation = next.join(', ');
          active -= deleted;
          if (!active)
              { clear_rules(); }
      }
  }
  function clear_rules() {
      raf(function () {
          if (active)
              { return; }
          active_docs.forEach(function (doc) {
              var stylesheet = doc.__svelte_stylesheet;
              var i = stylesheet.cssRules.length;
              while (i--)
                  { stylesheet.deleteRule(i); }
              doc.__svelte_rules = {};
          });
          active_docs.clear();
      });
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

  var promise;
  function wait() {
      if (!promise) {
          promise = Promise.resolve();
          promise.then(function () {
              promise = null;
          });
      }
      return promise;
  }
  function dispatch(node, direction, kind) {
      node.dispatchEvent(custom_event(("" + (direction ? 'intro' : 'outro') + kind)));
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
  var null_transition = { duration: 0 };
  function create_bidirectional_transition(node, fn, params, intro) {
      var config = fn(node, params);
      var t = intro ? 0 : 1;
      var running_program = null;
      var pending_program = null;
      var animation_name = null;
      function clear_animation() {
          if (animation_name)
              { delete_rule(node, animation_name); }
      }
      function init(program, duration) {
          var d = program.b - t;
          duration *= Math.abs(d);
          return {
              a: t,
              b: program.b,
              d: d,
              duration: duration,
              start: program.start,
              end: program.start + duration,
              group: program.group
          };
      }
      function go(b) {
          var ref = config || null_transition;
          var delay = ref.delay; if ( delay === void 0 ) delay = 0;
          var duration = ref.duration; if ( duration === void 0 ) duration = 300;
          var easing = ref.easing; if ( easing === void 0 ) easing = identity;
          var tick = ref.tick; if ( tick === void 0 ) tick = noop$1;
          var css = ref.css;
          var program = {
              start: now() + delay,
              b: b
          };
          if (!b) {
              // @ts-ignore todo: improve typings
              program.group = outros;
              outros.r += 1;
          }
          if (running_program) {
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
                  { tick(0, 1); }
              running_program = init(program, duration);
              add_render_callback(function () { return dispatch(node, b, 'start'); });
              loop(function (now) {
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
                                      { run_all(running_program.group.c); }
                              }
                          }
                          running_program = null;
                      }
                      else if (now >= running_program.start) {
                          var p = now - running_program.start;
                          t = running_program.a + running_program.d * easing(p / running_program.duration);
                          tick(t, 1 - t);
                      }
                  }
                  return !!(running_program || pending_program);
              });
          }
      }
      return {
          run: function run(b) {
              if (is_function(config)) {
                  wait().then(function () {
                      // @ts-ignore
                      config = config();
                      go(b);
                  });
              }
              else {
                  go(b);
              }
          },
          end: function end() {
              clear_animation();
              running_program = pending_program = null;
          }
      };
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

  function fade(node, ref) {
      var delay = ref.delay; if ( delay === void 0 ) delay = 0;
      var duration = ref.duration; if ( duration === void 0 ) duration = 400;
      var easing = ref.easing; if ( easing === void 0 ) easing = identity;

      var o = +getComputedStyle(node).opacity;
      return {
          delay: delay,
          duration: duration,
          easing: easing,
          css: function (t) { return ("opacity: " + (t * o)); }
      };
  }

  function noop$2() { }
  var identity$1 = function (x) { return x; };
  function assign(tar, src) {
      // @ts-ignore
      for (var k in src)
          { tar[k] = src[k]; }
      return tar;
  }
  function run$1(fn) {
      return fn();
  }
  function blank_object$1() {
      return Object.create(null);
  }
  function run_all$1(fns) {
      fns.forEach(run$1);
  }
  function is_function$1(thing) {
      return typeof thing === 'function';
  }
  function safe_not_equal$1(a, b) {
      return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
  }
  function is_empty(obj) {
      return Object.keys(obj).length === 0;
  }
  function create_slot(definition, ctx, $$scope, fn) {
      if (definition) {
          var slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
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
          var lets = definition[2](fn(dirty));
          if ($$scope.dirty === undefined) {
              return lets;
          }
          if (typeof lets === 'object') {
              var merged = [];
              var len = Math.max($$scope.dirty.length, lets.length);
              for (var i = 0; i < len; i += 1) {
                  merged[i] = $$scope.dirty[i] | lets[i];
              }
              return merged;
          }
          return $$scope.dirty | lets;
      }
      return $$scope.dirty;
  }
  function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
      var slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
      if (slot_changes) {
          var slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
          slot.p(slot_context, slot_changes);
      }
  }
  function action_destroyer(action_result) {
      return action_result && is_function$1(action_result.destroy) ? action_result.destroy : noop$2;
  }

  var is_client$1 = typeof window !== 'undefined';
  var now$1 = is_client$1
      ? function () { return window.performance.now(); }
      : function () { return Date.now(); };
  var raf$1 = is_client$1 ? function (cb) { return requestAnimationFrame(cb); } : noop$2;

  var tasks$1 = new Set();
  function run_tasks$1(now) {
      tasks$1.forEach(function (task) {
          if (!task.c(now)) {
              tasks$1.delete(task);
              task.f();
          }
      });
      if (tasks$1.size !== 0)
          { raf$1(run_tasks$1); }
  }
  /**
   * Creates a new task that runs on each raf frame
   * until it returns a falsy value or is aborted
   */
  function loop$1(callback) {
      var task;
      if (tasks$1.size === 0)
          { raf$1(run_tasks$1); }
      return {
          promise: new Promise(function (fulfill) {
              tasks$1.add(task = { c: callback, f: fulfill });
          }),
          abort: function abort() {
              tasks$1.delete(task);
          }
      };
  }

  function append$1(target, node) {
      target.appendChild(node);
  }
  function insert$1(target, node, anchor) {
      target.insertBefore(node, anchor || null);
  }
  function detach$1(node) {
      node.parentNode.removeChild(node);
  }
  function element$1(name) {
      return document.createElement(name);
  }
  function text$1(data) {
      return document.createTextNode(data);
  }
  function space$1() {
      return text$1(' ');
  }
  function empty$1() {
      return text$1('');
  }
  function attr$1(node, attribute, value) {
      if (value == null)
          { node.removeAttribute(attribute); }
      else if (node.getAttribute(attribute) !== value)
          { node.setAttribute(attribute, value); }
  }
  function children$1(element) {
      return Array.from(element.childNodes);
  }
  function set_data$1(text, data) {
      data = '' + data;
      if (text.wholeText !== data)
          { text.data = data; }
  }
  function custom_event$1(type, detail) {
      var e = document.createEvent('CustomEvent');
      e.initCustomEvent(type, false, false, detail);
      return e;
  }

  var active_docs$1 = new Set();
  var active$1 = 0;
  // https://github.com/darkskyapp/string-hash/blob/master/index.js
  function hash$1(str) {
      var hash = 5381;
      var i = str.length;
      while (i--)
          { hash = ((hash << 5) - hash) ^ str.charCodeAt(i); }
      return hash >>> 0;
  }
  function create_rule$1(node, a, b, duration, delay, ease, fn, uid) {
      if ( uid === void 0 ) uid = 0;

      var step = 16.666 / duration;
      var keyframes = '{\n';
      for (var p = 0; p <= 1; p += step) {
          var t = a + (b - a) * ease(p);
          keyframes += p * 100 + "%{" + (fn(t, 1 - t)) + "}\n";
      }
      var rule = keyframes + "100% {" + (fn(b, 1 - b)) + "}\n}";
      var name = "__svelte_" + (hash$1(rule)) + "_" + uid;
      var doc = node.ownerDocument;
      active_docs$1.add(doc);
      var stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element$1('style')).sheet);
      var current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
      if (!current_rules[name]) {
          current_rules[name] = true;
          stylesheet.insertRule(("@keyframes " + name + " " + rule), stylesheet.cssRules.length);
      }
      var animation = node.style.animation || '';
      node.style.animation = "" + (animation ? (animation + ", ") : "") + name + " " + duration + "ms linear " + delay + "ms 1 both";
      active$1 += 1;
      return name;
  }
  function delete_rule$1(node, name) {
      var previous = (node.style.animation || '').split(', ');
      var next = previous.filter(name
          ? function (anim) { return anim.indexOf(name) < 0; } // remove specific animation
          : function (anim) { return anim.indexOf('__svelte') === -1; } // remove all Svelte animations
      );
      var deleted = previous.length - next.length;
      if (deleted) {
          node.style.animation = next.join(', ');
          active$1 -= deleted;
          if (!active$1)
              { clear_rules$1(); }
      }
  }
  function clear_rules$1() {
      raf$1(function () {
          if (active$1)
              { return; }
          active_docs$1.forEach(function (doc) {
              var stylesheet = doc.__svelte_stylesheet;
              var i = stylesheet.cssRules.length;
              while (i--)
                  { stylesheet.deleteRule(i); }
              doc.__svelte_rules = {};
          });
          active_docs$1.clear();
      });
  }

  var current_component$1;
  function set_current_component$1(component) {
      current_component$1 = component;
  }

  var dirty_components$1 = [];
  var binding_callbacks$1 = [];
  var render_callbacks$1 = [];
  var flush_callbacks$1 = [];
  var resolved_promise$1 = Promise.resolve();
  var update_scheduled$1 = false;
  function schedule_update$1() {
      if (!update_scheduled$1) {
          update_scheduled$1 = true;
          resolved_promise$1.then(flush$1);
      }
  }
  function add_render_callback$1(fn) {
      render_callbacks$1.push(fn);
  }
  var flushing$1 = false;
  var seen_callbacks$1 = new Set();
  function flush$1() {
      if (flushing$1)
          { return; }
      flushing$1 = true;
      do {
          // first, call beforeUpdate functions
          // and update components
          for (var i = 0; i < dirty_components$1.length; i += 1) {
              var component = dirty_components$1[i];
              set_current_component$1(component);
              update$1(component.$$);
          }
          dirty_components$1.length = 0;
          while (binding_callbacks$1.length)
              { binding_callbacks$1.pop()(); }
          // then, once components are updated, call
          // afterUpdate functions. This may cause
          // subsequent updates...
          for (var i$1 = 0; i$1 < render_callbacks$1.length; i$1 += 1) {
              var callback = render_callbacks$1[i$1];
              if (!seen_callbacks$1.has(callback)) {
                  // ...so guard against infinite loops
                  seen_callbacks$1.add(callback);
                  callback();
              }
          }
          render_callbacks$1.length = 0;
      } while (dirty_components$1.length);
      while (flush_callbacks$1.length) {
          flush_callbacks$1.pop()();
      }
      update_scheduled$1 = false;
      flushing$1 = false;
      seen_callbacks$1.clear();
  }
  function update$1($$) {
      if ($$.fragment !== null) {
          $$.update();
          run_all$1($$.before_update);
          var dirty = $$.dirty;
          $$.dirty = [-1];
          $$.fragment && $$.fragment.p($$.ctx, dirty);
          $$.after_update.forEach(add_render_callback$1);
      }
  }

  var promise$1;
  function wait$1() {
      if (!promise$1) {
          promise$1 = Promise.resolve();
          promise$1.then(function () {
              promise$1 = null;
          });
      }
      return promise$1;
  }
  function dispatch$1(node, direction, kind) {
      node.dispatchEvent(custom_event$1(("" + (direction ? 'intro' : 'outro') + kind)));
  }
  var outroing$1 = new Set();
  var outros$1;
  function group_outros$1() {
      outros$1 = {
          r: 0,
          c: [],
          p: outros$1 // parent group
      };
  }
  function check_outros$1() {
      if (!outros$1.r) {
          run_all$1(outros$1.c);
      }
      outros$1 = outros$1.p;
  }
  function transition_in$1(block, local) {
      if (block && block.i) {
          outroing$1.delete(block);
          block.i(local);
      }
  }
  function transition_out$1(block, local, detach, callback) {
      if (block && block.o) {
          if (outroing$1.has(block))
              { return; }
          outroing$1.add(block);
          outros$1.c.push(function () {
              outroing$1.delete(block);
              if (callback) {
                  if (detach)
                      { block.d(1); }
                  callback();
              }
          });
          block.o(local);
      }
  }
  var null_transition$1 = { duration: 0 };
  function create_in_transition(node, fn, params) {
      var config = fn(node, params);
      var running = false;
      var animation_name;
      var task;
      var uid = 0;
      function cleanup() {
          if (animation_name)
              { delete_rule$1(node, animation_name); }
      }
      function go() {
          var ref = config || null_transition$1;
          var delay = ref.delay; if ( delay === void 0 ) delay = 0;
          var duration = ref.duration; if ( duration === void 0 ) duration = 300;
          var easing = ref.easing; if ( easing === void 0 ) easing = identity$1;
          var tick = ref.tick; if ( tick === void 0 ) tick = noop$2;
          var css = ref.css;
          if (css)
              { animation_name = create_rule$1(node, 0, 1, duration, delay, easing, css, uid++); }
          tick(0, 1);
          var start_time = now$1() + delay;
          var end_time = start_time + duration;
          if (task)
              { task.abort(); }
          running = true;
          add_render_callback$1(function () { return dispatch$1(node, true, 'start'); });
          task = loop$1(function (now) {
              if (running) {
                  if (now >= end_time) {
                      tick(1, 0);
                      dispatch$1(node, true, 'end');
                      cleanup();
                      return running = false;
                  }
                  if (now >= start_time) {
                      var t = easing((now - start_time) / duration);
                      tick(t, 1 - t);
                  }
              }
              return running;
          });
      }
      var started = false;
      return {
          start: function start() {
              if (started)
                  { return; }
              delete_rule$1(node);
              if (is_function$1(config)) {
                  config = config();
                  wait$1().then(go);
              }
              else {
                  go();
              }
          },
          invalidate: function invalidate() {
              started = false;
          },
          end: function end() {
              if (running) {
                  cleanup();
                  running = false;
              }
          }
      };
  }
  function create_component$1(block) {
      block && block.c();
  }
  function mount_component$1(component, target, anchor) {
      var ref = component.$$;
      var fragment = ref.fragment;
      var on_mount = ref.on_mount;
      var on_destroy = ref.on_destroy;
      var after_update = ref.after_update;
      fragment && fragment.m(target, anchor);
      // onMount happens before the initial afterUpdate
      add_render_callback$1(function () {
          var new_on_destroy = on_mount.map(run$1).filter(is_function$1);
          if (on_destroy) {
              on_destroy.push.apply(on_destroy, new_on_destroy);
          }
          else {
              // Edge case - component was destroyed immediately,
              // most likely as a result of a binding initialising
              run_all$1(new_on_destroy);
          }
          component.$$.on_mount = [];
      });
      after_update.forEach(add_render_callback$1);
  }
  function destroy_component$1(component, detaching) {
      var $$ = component.$$;
      if ($$.fragment !== null) {
          run_all$1($$.on_destroy);
          $$.fragment && $$.fragment.d(detaching);
          // TODO null out other refs, including component.$$ (but need to
          // preserve final state?)
          $$.on_destroy = $$.fragment = null;
          $$.ctx = [];
      }
  }
  function make_dirty$1(component, i) {
      if (component.$$.dirty[0] === -1) {
          dirty_components$1.push(component);
          schedule_update$1();
          component.$$.dirty.fill(0);
      }
      component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
  }
  function init$1(component, options, instance, create_fragment, not_equal, props, dirty) {
      if ( dirty === void 0 ) dirty = [-1];

      var parent_component = current_component$1;
      set_current_component$1(component);
      var prop_values = options.props || {};
      var $$ = component.$$ = {
          fragment: null,
          ctx: null,
          // state
          props: props,
          update: noop$2,
          not_equal: not_equal,
          bound: blank_object$1(),
          // lifecycle
          on_mount: [],
          on_destroy: [],
          before_update: [],
          after_update: [],
          context: new Map(parent_component ? parent_component.$$.context : []),
          // everything else
          callbacks: blank_object$1(),
          dirty: dirty,
          skip_bound: false
      };
      var ready = false;
      $$.ctx = instance
          ? instance(component, prop_values, function (i, ret) {
              var rest = [], len = arguments.length - 2;
              while ( len-- > 0 ) rest[ len ] = arguments[ len + 2 ];

              var value = rest.length ? rest[0] : ret;
              if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                  if (!$$.skip_bound && $$.bound[i])
                      { $$.bound[i](value); }
                  if (ready)
                      { make_dirty$1(component, i); }
              }
              return ret;
          })
          : [];
      $$.update();
      ready = true;
      run_all$1($$.before_update);
      // `false` as a special case of no DOM component
      $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
      if (options.target) {
          if (options.hydrate) {
              var nodes = children$1(options.target);
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              $$.fragment && $$.fragment.l(nodes);
              nodes.forEach(detach$1);
          }
          else {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              $$.fragment && $$.fragment.c();
          }
          if (options.intro)
              { transition_in$1(component.$$.fragment); }
          mount_component$1(component, options.target, options.anchor);
          flush$1();
      }
      set_current_component$1(parent_component);
  }
  var SvelteComponent$1 = function SvelteComponent () {};

  SvelteComponent$1.prototype.$destroy = function $destroy () {
          destroy_component$1(this, 1);
          this.$destroy = noop$2;
      };
      SvelteComponent$1.prototype.$on = function $on (type, callback) {
          var callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
          callbacks.push(callback);
          return function () {
              var index = callbacks.indexOf(callback);
              if (index !== -1)
                  { callbacks.splice(index, 1); }
          };
      };
      SvelteComponent$1.prototype.$set = function $set ($$props) {
          if (this.$$set && !is_empty($$props)) {
              this.$$.skip_bound = true;
              this.$$set($$props);
              this.$$.skip_bound = false;
          }
      };

  function fade$1(node, ref) {
      var delay = ref.delay; if ( delay === void 0 ) delay = 0;
      var duration = ref.duration; if ( duration === void 0 ) duration = 400;
      var easing = ref.easing; if ( easing === void 0 ) easing = identity$1;

      var o = +getComputedStyle(node).opacity;
      return {
          delay: delay,
          duration: duration,
          easing: easing,
          css: function (t) { return ("opacity: " + (t * o)); }
      };
  }

  /* src/components/Placeholder.svelte generated by Svelte v3.24.1 */

  function create_if_block_1$1(ctx) {
  	var switch_instance;
  	var switch_instance_anchor;
  	var current;
  	var switch_value = /*placeholder*/ ctx[0];

  	function switch_props(ctx) {
  		return {};
  	}

  	if (switch_value) {
  		switch_instance = new switch_value(switch_props());
  	}

  	return {
  		c: function c() {
  			if (switch_instance) { create_component$1(switch_instance.$$.fragment); }
  			switch_instance_anchor = empty$1();
  		},
  		m: function m(target, anchor) {
  			if (switch_instance) {
  				mount_component$1(switch_instance, target, anchor);
  			}

  			insert$1(target, switch_instance_anchor, anchor);
  			current = true;
  		},
  		p: function p(ctx, dirty) {
  			if (switch_value !== (switch_value = /*placeholder*/ ctx[0])) {
  				if (switch_instance) {
  					group_outros$1();
  					var old_component = switch_instance;

  					transition_out$1(old_component.$$.fragment, 1, 0, function () {
  						destroy_component$1(old_component, 1);
  					});

  					check_outros$1();
  				}

  				if (switch_value) {
  					switch_instance = new switch_value(switch_props());
  					create_component$1(switch_instance.$$.fragment);
  					transition_in$1(switch_instance.$$.fragment, 1);
  					mount_component$1(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
  				} else {
  					switch_instance = null;
  				}
  			}
  		},
  		i: function i(local) {
  			if (current) { return; }
  			if (switch_instance) { transition_in$1(switch_instance.$$.fragment, local); }
  			current = true;
  		},
  		o: function o(local) {
  			if (switch_instance) { transition_out$1(switch_instance.$$.fragment, local); }
  			current = false;
  		},
  		d: function d(detaching) {
  			if (detaching) { detach$1(switch_instance_anchor); }
  			if (switch_instance) { destroy_component$1(switch_instance, detaching); }
  		}
  	};
  }

  // (2:2) {#if typeof placeholder === 'string'}
  function create_if_block$1(ctx) {
  	var div;
  	var t;

  	return {
  		c: function c() {
  			div = element$1("div");
  			t = text$1(/*placeholder*/ ctx[0]);
  		},
  		m: function m(target, anchor) {
  			insert$1(target, div, anchor);
  			append$1(div, t);
  		},
  		p: function p(ctx, dirty) {
  			if (dirty & /*placeholder*/ 1) { set_data$1(t, /*placeholder*/ ctx[0]); }
  		},
  		i: noop$2,
  		o: noop$2,
  		d: function d(detaching) {
  			if (detaching) { detach$1(div); }
  		}
  	};
  }

  function create_fragment$1(ctx) {
  	var div;
  	var current_block_type_index;
  	var if_block;
  	var current;
  	var if_block_creators = [create_if_block$1, create_if_block_1$1];
  	var if_blocks = [];

  	function select_block_type(ctx, dirty) {
  		if (typeof /*placeholder*/ ctx[0] === "string") { return 0; }
  		if (typeof /*placeholder*/ ctx[0] === "function") { return 1; }
  		return -1;
  	}

  	if (~(current_block_type_index = select_block_type(ctx))) {
  		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  	}

  	return {
  		c: function c() {
  			div = element$1("div");
  			if (if_block) { if_block.c(); }
  			attr$1(div, "class", placeholderClass);
  		},
  		m: function m(target, anchor) {
  			insert$1(target, div, anchor);

  			if (~current_block_type_index) {
  				if_blocks[current_block_type_index].m(div, null);
  			}

  			current = true;
  		},
  		p: function p(ctx, ref) {
  			var dirty = ref[0];

  			var previous_block_index = current_block_type_index;
  			current_block_type_index = select_block_type(ctx);

  			if (current_block_type_index === previous_block_index) {
  				if (~current_block_type_index) {
  					if_blocks[current_block_type_index].p(ctx, dirty);
  				}
  			} else {
  				if (if_block) {
  					group_outros$1();

  					transition_out$1(if_blocks[previous_block_index], 1, 1, function () {
  						if_blocks[previous_block_index] = null;
  					});

  					check_outros$1();
  				}

  				if (~current_block_type_index) {
  					if_block = if_blocks[current_block_type_index];

  					if (!if_block) {
  						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  						if_block.c();
  					}

  					transition_in$1(if_block, 1);
  					if_block.m(div, null);
  				} else {
  					if_block = null;
  				}
  			}
  		},
  		i: function i(local) {
  			if (current) { return; }
  			transition_in$1(if_block);
  			current = true;
  		},
  		o: function o(local) {
  			transition_out$1(if_block);
  			current = false;
  		},
  		d: function d(detaching) {
  			if (detaching) { detach$1(div); }

  			if (~current_block_type_index) {
  				if_blocks[current_block_type_index].d();
  			}
  		}
  	};
  }

  var placeholderClass = "svelte-lazy-placeholder";

  function instance$1($$self, $$props, $$invalidate) {
  	var placeholder = $$props.placeholder; if ( placeholder === void 0 ) placeholder = null;

  	$$self.$$set = function ($$props) {
  		if ("placeholder" in $$props) { $$invalidate(0, placeholder = $$props.placeholder); }
  	};

  	return [placeholder];
  }

  var Placeholder = /*@__PURE__*/(function (SvelteComponent) {
  	function Placeholder(options) {
  		SvelteComponent.call(this);
  		init$1(this, options, instance$1, create_fragment$1, safe_not_equal$1, { placeholder: 0 });
  	}

  	if ( SvelteComponent ) Placeholder.__proto__ = SvelteComponent;
  	Placeholder.prototype = Object.create( SvelteComponent && SvelteComponent.prototype );
  	Placeholder.prototype.constructor = Placeholder;

  	return Placeholder;
  }(SvelteComponent$1));

  /* src/index.svelte generated by Svelte v3.24.1 */

  function create_else_block$1(ctx) {
  	var placeholder_1;
  	var current;

  	placeholder_1 = new Placeholder({
  			props: { placeholder: /*placeholder*/ ctx[1] }
  		});

  	return {
  		c: function c() {
  			create_component$1(placeholder_1.$$.fragment);
  		},
  		m: function m(target, anchor) {
  			mount_component$1(placeholder_1, target, anchor);
  			current = true;
  		},
  		p: function p(ctx, dirty) {
  			var placeholder_1_changes = {};
  			if (dirty & /*placeholder*/ 2) { placeholder_1_changes.placeholder = /*placeholder*/ ctx[1]; }
  			placeholder_1.$set(placeholder_1_changes);
  		},
  		i: function i(local) {
  			if (current) { return; }
  			transition_in$1(placeholder_1.$$.fragment, local);
  			current = true;
  		},
  		o: function o(local) {
  			transition_out$1(placeholder_1.$$.fragment, local);
  			current = false;
  		},
  		d: function d(detaching) {
  			destroy_component$1(placeholder_1, detaching);
  		}
  	};
  }

  // (2:2) {#if loaded}
  function create_if_block$1$1(ctx) {
  	var div;
  	var div_intro;
  	var t;
  	var if_block_anchor;
  	var current;
  	var default_slot_template = /*$$slots*/ ctx[13].default;
  	var default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], null);
  	var default_slot_or_fallback = default_slot || fallback_block();
  	var if_block = /*contentDisplay*/ ctx[3] === "hide" && create_if_block_1$1$1(ctx);

  	return {
  		c: function c() {
  			div = element$1("div");
  			if (default_slot_or_fallback) { default_slot_or_fallback.c(); }
  			t = space$1();
  			if (if_block) { if_block.c(); }
  			if_block_anchor = empty$1();
  			attr$1(div, "class", contentClass);
  			attr$1(div, "style", /*contentStyle*/ ctx[4]);
  		},
  		m: function m(target, anchor) {
  			insert$1(target, div, anchor);

  			if (default_slot_or_fallback) {
  				default_slot_or_fallback.m(div, null);
  			}

  			insert$1(target, t, anchor);
  			if (if_block) { if_block.m(target, anchor); }
  			insert$1(target, if_block_anchor, anchor);
  			current = true;
  		},
  		p: function p(ctx, dirty) {
  			if (default_slot) {
  				if (default_slot.p && dirty & /*$$scope*/ 4096) {
  					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[12], dirty, null, null);
  				}
  			}

  			if (!current || dirty & /*contentStyle*/ 16) {
  				attr$1(div, "style", /*contentStyle*/ ctx[4]);
  			}

  			if (/*contentDisplay*/ ctx[3] === "hide") {
  				if (if_block) {
  					if_block.p(ctx, dirty);

  					if (dirty & /*contentDisplay*/ 8) {
  						transition_in$1(if_block, 1);
  					}
  				} else {
  					if_block = create_if_block_1$1$1(ctx);
  					if_block.c();
  					transition_in$1(if_block, 1);
  					if_block.m(if_block_anchor.parentNode, if_block_anchor);
  				}
  			} else if (if_block) {
  				group_outros$1();

  				transition_out$1(if_block, 1, 1, function () {
  					if_block = null;
  				});

  				check_outros$1();
  			}
  		},
  		i: function i(local) {
  			if (current) { return; }
  			transition_in$1(default_slot_or_fallback, local);

  			if (!div_intro) {
  				add_render_callback$1(function () {
  					div_intro = create_in_transition(div, fade$1, /*fadeOption*/ ctx[0] || {});
  					div_intro.start();
  				});
  			}

  			transition_in$1(if_block);
  			current = true;
  		},
  		o: function o(local) {
  			transition_out$1(default_slot_or_fallback, local);
  			transition_out$1(if_block);
  			current = false;
  		},
  		d: function d(detaching) {
  			if (detaching) { detach$1(div); }
  			if (default_slot_or_fallback) { default_slot_or_fallback.d(detaching); }
  			if (detaching) { detach$1(t); }
  			if (if_block) { if_block.d(detaching); }
  			if (detaching) { detach$1(if_block_anchor); }
  		}
  	};
  }

  // (8:12) Lazy load content
  function fallback_block(ctx) {
  	var t;

  	return {
  		c: function c() {
  			t = text$1("Lazy load content");
  		},
  		m: function m(target, anchor) {
  			insert$1(target, t, anchor);
  		},
  		d: function d(detaching) {
  			if (detaching) { detach$1(t); }
  		}
  	};
  }

  // (10:4) {#if contentDisplay === 'hide'}
  function create_if_block_1$1$1(ctx) {
  	var placeholder_1;
  	var current;

  	placeholder_1 = new Placeholder({
  			props: { placeholder: /*placeholder*/ ctx[1] }
  		});

  	return {
  		c: function c() {
  			create_component$1(placeholder_1.$$.fragment);
  		},
  		m: function m(target, anchor) {
  			mount_component$1(placeholder_1, target, anchor);
  			current = true;
  		},
  		p: function p(ctx, dirty) {
  			var placeholder_1_changes = {};
  			if (dirty & /*placeholder*/ 2) { placeholder_1_changes.placeholder = /*placeholder*/ ctx[1]; }
  			placeholder_1.$set(placeholder_1_changes);
  		},
  		i: function i(local) {
  			if (current) { return; }
  			transition_in$1(placeholder_1.$$.fragment, local);
  			current = true;
  		},
  		o: function o(local) {
  			transition_out$1(placeholder_1.$$.fragment, local);
  			current = false;
  		},
  		d: function d(detaching) {
  			destroy_component$1(placeholder_1, detaching);
  		}
  	};
  }

  function create_fragment$1$1(ctx) {
  	var div;
  	var current_block_type_index;
  	var if_block;
  	var load_action;
  	var current;
  	var mounted;
  	var dispose;
  	var if_block_creators = [create_if_block$1$1, create_else_block$1];
  	var if_blocks = [];

  	function select_block_type(ctx, dirty) {
  		if (/*loaded*/ ctx[2]) { return 0; }
  		return 1;
  	}

  	current_block_type_index = select_block_type(ctx);
  	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

  	return {
  		c: function c() {
  			div = element$1("div");
  			if_block.c();
  			attr$1(div, "class", /*rootClass*/ ctx[5]);
  		},
  		m: function m(target, anchor) {
  			insert$1(target, div, anchor);
  			if_blocks[current_block_type_index].m(div, null);
  			current = true;

  			if (!mounted) {
  				dispose = action_destroyer(load_action = /*load*/ ctx[6].call(null, div));
  				mounted = true;
  			}
  		},
  		p: function p(ctx, ref) {
  			var dirty = ref[0];

  			var previous_block_index = current_block_type_index;
  			current_block_type_index = select_block_type(ctx);

  			if (current_block_type_index === previous_block_index) {
  				if_blocks[current_block_type_index].p(ctx, dirty);
  			} else {
  				group_outros$1();

  				transition_out$1(if_blocks[previous_block_index], 1, 1, function () {
  					if_blocks[previous_block_index] = null;
  				});

  				check_outros$1();
  				if_block = if_blocks[current_block_type_index];

  				if (!if_block) {
  					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  					if_block.c();
  				}

  				transition_in$1(if_block, 1);
  				if_block.m(div, null);
  			}
  		},
  		i: function i(local) {
  			if (current) { return; }
  			transition_in$1(if_block);
  			current = true;
  		},
  		o: function o(local) {
  			transition_out$1(if_block);
  			current = false;
  		},
  		d: function d(detaching) {
  			if (detaching) { detach$1(div); }
  			if_blocks[current_block_type_index].d();
  			mounted = false;
  			dispose();
  		}
  	};
  }

  var contentClass = "svelte-lazy-content";

  function getContainerHeight(e) {
  	if (e && e.target && e.target.getBoundingClientRect) {
  		return e.target.getBoundingClientRect().bottom;
  	} else {
  		return window.innerHeight;
  	}
  }

  // From underscore souce code
  function throttle(func, wait, options) {
  	var context, args, result;
  	var timeout = null;
  	var previous = 0;
  	if (!options) { options = {}; }

  	var later = function () {
  		previous = options.leading === false ? 0 : new Date();
  		timeout = null;
  		result = func.apply(context, args);
  		if (!timeout) { context = args = null; }
  	};

  	return function (event) {
  		var now = new Date();
  		if (!previous && options.leading === false) { previous = now; }
  		var remaining = wait - (now - previous);
  		context = this;
  		args = arguments;

  		if (remaining <= 0 || remaining > wait) {
  			if (timeout) {
  				clearTimeout(timeout);
  				timeout = null;
  			}

  			previous = now;
  			result = func.apply(context, args);
  			if (!timeout) { context = args = null; }
  		} else if (!timeout && options.trailing !== false) {
  			timeout = setTimeout(later, remaining);
  		}

  		return result;
  	};
  }

  function instance$1$1($$self, $$props, $$invalidate) {
  	var height = $$props.height; if ( height === void 0 ) height = 0;
  	var offset = $$props.offset; if ( offset === void 0 ) offset = 150;
  	var fadeOption = $$props.fadeOption; if ( fadeOption === void 0 ) fadeOption = { delay: 0, duration: 400 };
  	var resetHeightDelay = $$props.resetHeightDelay; if ( resetHeightDelay === void 0 ) resetHeightDelay = 0;
  	var onload = $$props.onload; if ( onload === void 0 ) onload = null;
  	var placeholder = $$props.placeholder; if ( placeholder === void 0 ) placeholder = null;
  	var className = $$props.class; if ( className === void 0 ) className = "";
  	var rootClass = "svelte-lazy" + (className ? " " + className : "");
  	var loaded = false;
  	var contentDisplay = "";

  	function load(node) {
  		setHeight(node);

  		var loadHandler = throttle(
  			function (e) {
  				var nodeTop = node.getBoundingClientRect().top;
  				var expectedTop = getContainerHeight(e) + offset;

  				if (nodeTop <= expectedTop) {
  					$$invalidate(2, loaded = true);
  					resetHeight(node);
  					onload && onload(node);
  					removeListeners();
  				}
  			},
  			200
  		);

  		loadHandler();
  		addListeners();

  		function addListeners() {
  			document.addEventListener("scroll", loadHandler, true);
  			window.addEventListener("resize", loadHandler);
  		}

  		function removeListeners() {
  			document.removeEventListener("scroll", loadHandler, true);
  			window.removeEventListener("resize", loadHandler);
  		}

  		return {
  			destroy: function () {
  				removeListeners();
  			}
  		};
  	}

  	function setHeight(node) {
  		if (height) {
  			node.style.height = typeof height === "number" ? height + "px" : height;
  		}
  	}

  	function resetHeight(node) {
  		// Add delay for remote resources like images to load
  		setTimeout(
  			function () {
  				var handled = handleImgContent(node);

  				if (!handled) {
  					node.style.height = "auto";
  				}
  			},
  			resetHeightDelay
  		);
  	}

  	function handleImgContent(node) {
  		var img = node.querySelector("img");

  		if (img) {
  			if (!img.complete) {
  				$$invalidate(3, contentDisplay = "hide");

  				node.addEventListener(
  					"load",
  					function () {
  						$$invalidate(3, contentDisplay = "");
  						node.style.height = "auto";
  					},
  					{ capture: true, once: true }
  				);

  				node.addEventListener(
  					"error",
  					function () {
  						// Keep passed height if there is error
  						$$invalidate(3, contentDisplay = "");
  					},
  					{ capture: true, once: true }
  				);

  				return true;
  			} else if (img.naturalHeight === 0) {
  				// Keep passed height if img has zero height
  				return true;
  			}
  		}
  	}

  	var $$slots = $$props.$$slots; if ( $$slots === void 0 ) $$slots = {};
  	var $$scope = $$props.$$scope;

  	$$self.$$set = function ($$props) {
  		if ("height" in $$props) { $$invalidate(7, height = $$props.height); }
  		if ("offset" in $$props) { $$invalidate(8, offset = $$props.offset); }
  		if ("fadeOption" in $$props) { $$invalidate(0, fadeOption = $$props.fadeOption); }
  		if ("resetHeightDelay" in $$props) { $$invalidate(9, resetHeightDelay = $$props.resetHeightDelay); }
  		if ("onload" in $$props) { $$invalidate(10, onload = $$props.onload); }
  		if ("placeholder" in $$props) { $$invalidate(1, placeholder = $$props.placeholder); }
  		if ("class" in $$props) { $$invalidate(11, className = $$props.class); }
  		if ("$$scope" in $$props) { $$invalidate(12, $$scope = $$props.$$scope); }
  	};

  	var contentStyle;

  	$$self.$$.update = function () {
  		if ($$self.$$.dirty & /*contentDisplay*/ 8) {
  			 $$invalidate(4, contentStyle = contentDisplay === "hide" ? "display: none" : "");
  		}
  	};

  	return [
  		fadeOption,
  		placeholder,
  		loaded,
  		contentDisplay,
  		contentStyle,
  		rootClass,
  		load,
  		height,
  		offset,
  		resetHeightDelay,
  		onload,
  		className,
  		$$scope,
  		$$slots
  	];
  }

  var Src = /*@__PURE__*/(function (SvelteComponent) {
  	function Src(options) {
  		SvelteComponent.call(this);

  		init$1(this, options, instance$1$1, create_fragment$1$1, safe_not_equal$1, {
  			height: 7,
  			offset: 8,
  			fadeOption: 0,
  			resetHeightDelay: 9,
  			onload: 10,
  			placeholder: 1,
  			class: 11
  		});
  	}

  	if ( SvelteComponent ) Src.__proto__ = SvelteComponent;
  	Src.prototype = Object.create( SvelteComponent && SvelteComponent.prototype );
  	Src.prototype.constructor = Src;

  	return Src;
  }(SvelteComponent$1));

  /* src/Gallery.html generated by Svelte v3.20.1 */

  function get_each_context$1(ctx, list, i) {
  	var child_ctx = ctx.slice();
  	child_ctx[8] = list[i];
  	return child_ctx;
  }

  // (99:0) {:catch err}
  function create_catch_block$1(ctx) {
  	var p;
  	var t0;
  	var t1_value = /*err*/ ctx[7].message + "";
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
  			if (dirty & /*galleryRequest*/ 2 && t1_value !== (t1_value = /*err*/ ctx[7].message + "")) { set_data(t1, t1_value); }
  		},
  		i: noop$1,
  		o: noop$1,
  		d: function d(detaching) {
  			if (detaching) { detach(p); }
  		}
  	};
  }

  // (77:0) {:then info}
  function create_then_block$1(ctx) {
  	var h3;
  	var t0_value = /*info*/ ctx[6][0].name + "";
  	var t0;
  	var t1;
  	var t2;
  	var div;
  	var current;
  	var if_block = /*info*/ ctx[6][0].description && create_if_block_1$2(ctx);
  	var each_value = /*info*/ ctx[6][1];
  	var each_blocks = [];

  	for (var i = 0; i < each_value.length; i += 1) {
  		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
  	}

  	var out = function (i) { return transition_out(each_blocks[i], 1, 1, function () {
  		each_blocks[i] = null;
  	}); };

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

  			attr(div, "class", "gallery svelte-1t2rpfy");
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

  			current = true;
  		},
  		p: function p(ctx, dirty) {
  			if ((!current || dirty & /*galleryRequest*/ 2) && t0_value !== (t0_value = /*info*/ ctx[6][0].name + "")) { set_data(t0, t0_value); }

  			if (/*info*/ ctx[6][0].description) {
  				if (if_block) {
  					if_block.p(ctx, dirty);
  				} else {
  					if_block = create_if_block_1$2(ctx);
  					if_block.c();
  					if_block.m(t2.parentNode, t2);
  				}
  			} else if (if_block) {
  				if_block.d(1);
  				if_block = null;
  			}

  			if (dirty & /*showModal, galleryRequest*/ 6) {
  				each_value = /*info*/ ctx[6][1];
  				var i;

  				for (i = 0; i < each_value.length; i += 1) {
  					var child_ctx = get_each_context$1(ctx, each_value, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  						transition_in(each_blocks[i], 1);
  					} else {
  						each_blocks[i] = create_each_block$1(child_ctx);
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
  			if (detaching) { detach(h3); }
  			if (detaching) { detach(t1); }
  			if (if_block) { if_block.d(detaching); }
  			if (detaching) { detach(t2); }
  			if (detaching) { detach(div); }
  			destroy_each(each_blocks, detaching);
  		}
  	};
  }

  // (79:0) {#if info[0].description}
  function create_if_block_1$2(ctx) {
  	var p;
  	var t_value = /*info*/ ctx[6][0].description + "";
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
  			if (dirty & /*galleryRequest*/ 2 && t_value !== (t_value = /*info*/ ctx[6][0].description + "")) { set_data(t, t_value); }
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(p); }
  		}
  	};
  }

  // (85:12) <Lazy height={400}>
  function create_default_slot(ctx) {
  	var img;
  	var img_alt_value;
  	var img_src_value;

  	return {
  		c: function c() {
  			img = element("img");
  			attr(img, "alt", img_alt_value = /*item*/ ctx[8][2].description);
  			if (img.src !== (img_src_value = "/assets/" + /*item*/ ctx[8][2].uuid)) { attr(img, "src", img_src_value); }
  			attr(img, "class", "svelte-1t2rpfy");
  		},
  		m: function m(target, anchor) {
  			insert(target, img, anchor);
  		},
  		p: function p(ctx, dirty) {
  			if (dirty & /*galleryRequest*/ 2 && img_alt_value !== (img_alt_value = /*item*/ ctx[8][2].description)) {
  				attr(img, "alt", img_alt_value);
  			}

  			if (dirty & /*galleryRequest*/ 2 && img.src !== (img_src_value = "/assets/" + /*item*/ ctx[8][2].uuid)) {
  				attr(img, "src", img_src_value);
  			}
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(img); }
  		}
  	};
  }

  // (83:4) {#each info[1] as item}
  function create_each_block$1(ctx) {
  	var figure;
  	var t0;
  	var figcaption;
  	var t1_value = /*item*/ ctx[8][2].name + "";
  	var t1;
  	var t2;
  	var current;
  	var dispose;

  	var lazy = new Src({
  			props: {
  				height: 400,
  				$$slots: { default: [create_default_slot] },
  				$$scope: { ctx: ctx }
  			}
  		});

  	function click_handler() {
  		var args = [], len = arguments.length;
  		while ( len-- ) args[ len ] = arguments[ len ];

  		return /*click_handler*/ ctx[5].apply(/*item*/ ctx, [ ctx[8] ].concat( args ));
  	}

  	return {
  		c: function c() {
  			figure = element("figure");
  			create_component(lazy.$$.fragment);
  			t0 = space();
  			figcaption = element("figcaption");
  			t1 = text(t1_value);
  			t2 = space();
  			attr(figure, "class", "card-image svelte-1t2rpfy");
  		},
  		m: function m(target, anchor, remount) {
  			insert(target, figure, anchor);
  			mount_component(lazy, figure, null);
  			append(figure, t0);
  			append(figure, figcaption);
  			append(figcaption, t1);
  			insert(target, t2, anchor);
  			current = true;
  			if (remount) { dispose(); }
  			dispose = listen(figure, "click", click_handler);
  		},
  		p: function p(new_ctx, dirty) {
  			ctx = new_ctx;
  			var lazy_changes = {};

  			if (dirty & /*$$scope, galleryRequest*/ 2050) {
  				lazy_changes.$$scope = { dirty: dirty, ctx: ctx };
  			}

  			lazy.$set(lazy_changes);
  			if ((!current || dirty & /*galleryRequest*/ 2) && t1_value !== (t1_value = /*item*/ ctx[8][2].name + "")) { set_data(t1, t1_value); }
  		},
  		i: function i(local) {
  			if (current) { return; }
  			transition_in(lazy.$$.fragment, local);
  			current = true;
  		},
  		o: function o(local) {
  			transition_out(lazy.$$.fragment, local);
  			current = false;
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(figure); }
  			destroy_component(lazy);
  			if (detaching) { detach(t2); }
  			dispose();
  		}
  	};
  }

  // (75:23)  <p>...</p> {:then info}
  function create_pending_block$1(ctx) {
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

  // (103:0) {#if displayItem}
  function create_if_block$2(ctx) {
  	var div1;
  	var div0;
  	var img;
  	var img_src_value;
  	var img_alt_value;
  	var div1_transition;
  	var current;
  	var dispose;

  	return {
  		c: function c() {
  			div1 = element("div");
  			div0 = element("div");
  			img = element("img");
  			if (img.src !== (img_src_value = "/assets/" + /*displayItem*/ ctx[0].uuid)) { attr(img, "src", img_src_value); }
  			attr(img, "alt", img_alt_value = /*displayItem*/ ctx[0].description);
  			attr(img, "class", "svelte-1t2rpfy");
  			attr(div0, "class", "fullscreen-image svelte-1t2rpfy");
  			attr(div1, "class", "shadow-box svelte-1t2rpfy");
  		},
  		m: function m(target, anchor, remount) {
  			insert(target, div1, anchor);
  			append(div1, div0);
  			append(div0, img);
  			current = true;
  			if (remount) { dispose(); }
  			dispose = listen(div1, "click", /*hideModal*/ ctx[3]);
  		},
  		p: function p(ctx, dirty) {
  			if (!current || dirty & /*displayItem*/ 1 && img.src !== (img_src_value = "/assets/" + /*displayItem*/ ctx[0].uuid)) {
  				attr(img, "src", img_src_value);
  			}

  			if (!current || dirty & /*displayItem*/ 1 && img_alt_value !== (img_alt_value = /*displayItem*/ ctx[0].description)) {
  				attr(img, "alt", img_alt_value);
  			}
  		},
  		i: function i(local) {
  			if (current) { return; }

  			add_render_callback(function () {
  				if (!div1_transition) { div1_transition = create_bidirectional_transition(div1, fade, { duration: 200 }, true); }
  				div1_transition.run(1);
  			});

  			current = true;
  		},
  		o: function o(local) {
  			if (!div1_transition) { div1_transition = create_bidirectional_transition(div1, fade, { duration: 200 }, false); }
  			div1_transition.run(0);
  			current = false;
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(div1); }
  			if (detaching && div1_transition) { div1_transition.end(); }
  			dispose();
  		}
  	};
  }

  function create_fragment$2(ctx) {
  	var promise;
  	var t;
  	var if_block_anchor;
  	var current;

  	var info = {
  		ctx: ctx,
  		current: null,
  		token: null,
  		pending: create_pending_block$1,
  		then: create_then_block$1,
  		catch: create_catch_block$1,
  		value: 6,
  		error: 7,
  		blocks: [,,,]
  	};

  	handle_promise(promise = /*galleryRequest*/ ctx[1], info);
  	var if_block = /*displayItem*/ ctx[0] && create_if_block$2(ctx);

  	return {
  		c: function c() {
  			info.block.c();
  			t = space();
  			if (if_block) { if_block.c(); }
  			if_block_anchor = empty();
  		},
  		m: function m(target, anchor) {
  			info.block.m(target, info.anchor = anchor);
  			info.mount = function () { return t.parentNode; };
  			info.anchor = t;
  			insert(target, t, anchor);
  			if (if_block) { if_block.m(target, anchor); }
  			insert(target, if_block_anchor, anchor);
  			current = true;
  		},
  		p: function p(new_ctx, ref) {
  			var dirty = ref[0];

  			ctx = new_ctx;
  			info.ctx = ctx;

  			if (dirty & /*galleryRequest*/ 2 && promise !== (promise = /*galleryRequest*/ ctx[1]) && handle_promise(promise, info)) ; else {
  				var child_ctx = ctx.slice();
  				child_ctx[6] = info.resolved;
  				info.block.p(child_ctx, dirty);
  			}

  			if (/*displayItem*/ ctx[0]) {
  				if (if_block) {
  					if_block.p(ctx, dirty);
  					transition_in(if_block, 1);
  				} else {
  					if_block = create_if_block$2(ctx);
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
  			transition_in(info.block);
  			transition_in(if_block);
  			current = true;
  		},
  		o: function o(local) {
  			for (var i = 0; i < 3; i += 1) {
  				var block = info.blocks[i];
  				transition_out(block);
  			}

  			transition_out(if_block);
  			current = false;
  		},
  		d: function d(detaching) {
  			info.block.d(detaching);
  			info.token = null;
  			info = null;
  			if (detaching) { detach(t); }
  			if (if_block) { if_block.d(detaching); }
  			if (detaching) { detach(if_block_anchor); }
  		}
  	};
  }

  function instance$2($$self, $$props, $$invalidate) {
  	var galleryId = $$props.galleryId;
  	var displayItem;
  	var galleryRequest;

  	function showModal(item) {
  		$$invalidate(0, displayItem = item);
  	}

  	function hideModal() {
  		$$invalidate(0, displayItem = null);
  	}

  	var click_handler = function (item, e) { return showModal(item[2]); };

  	$$self.$set = function ($$props) {
  		if ("galleryId" in $$props) { $$invalidate(4, galleryId = $$props.galleryId); }
  	};

  	$$self.$$.update = function () {
  		if ($$self.$$.dirty & /*galleryId*/ 16) {
  			 if (galleryId) {
  				$$invalidate(1, galleryRequest = Promise.all([
  					fetch(("http://localhost:8080/galleries/" + galleryId)).then(function (res) { return res.json(); }),
  					fetch(("http://localhost:8080/galleries/" + galleryId + "/items")).then(function (res) { return res.json(); })
  				]));
  			}
  		}
  	};

  	return [displayItem, galleryRequest, showModal, hideModal, galleryId, click_handler];
  }

  var Gallery = /*@__PURE__*/(function (SvelteComponent) {
  	function Gallery(options) {
  		SvelteComponent.call(this);
  		init(this, options, instance$2, create_fragment$2, safe_not_equal, { galleryId: 4 });
  	}

  	if ( SvelteComponent ) Gallery.__proto__ = SvelteComponent;
  	Gallery.prototype = Object.create( SvelteComponent && SvelteComponent.prototype );
  	Gallery.prototype.constructor = Gallery;

  	return Gallery;
  }(SvelteComponent));

  var main = {
      gallery: function gallery( target, props ){ 
          return  new Gallery({target: target,props: props}); 
      },
      galleryCreate: function galleryCreate( target, props ){ 
          return  new GalleryCreate({target: target,props: props}); 
      }
  };

  return main;

}());
