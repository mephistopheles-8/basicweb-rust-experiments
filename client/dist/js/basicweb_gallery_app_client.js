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

  /* src/PostThread.html generated by Svelte v3.20.1 */

  function get_each_context$3(ctx, list, i) {
  	var child_ctx = ctx.slice();
  	child_ctx[11] = list[i];
  	return child_ctx;
  }

  // (48:4) {#if post.title}
  function create_if_block_2$2(ctx) {
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

  // (51:4) {#if post.description}
  function create_if_block_1$2(ctx) {
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

  // (63:4) {:catch err}
  function create_catch_block$3(ctx) {
  	var p;
  	var t0;
  	var t1_value = /*err*/ ctx[15].message + "";
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
  			if (dirty & /*replyResponse*/ 8 && t1_value !== (t1_value = /*err*/ ctx[15].message + "")) { set_data(t1, t1_value); }
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(p); }
  		}
  	};
  }

  // (57:4) {:then _}
  function create_then_block$3(ctx) {
  	var if_block_anchor;

  	function select_block_type(ctx, dirty) {
  		if (/*replyId*/ ctx[0] === /*post*/ ctx[1].id) { return create_if_block$3; }
  		return create_else_block$2;
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
  		p: function p(ctx, dirty) {
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
  			if_block.d(detaching);
  			if (detaching) { detach(if_block_anchor); }
  		}
  	};
  }

  // (60:4) {:else}
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

  // (58:4) {#if replyId === post.id}
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
  				listen(textarea, "input", /*textarea_input_handler*/ ctx[8]),
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

  // (55:26)      <p>...</p>     {:then _}
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

  // (66:4) {#each post.replies as reply}
  function create_each_block$3(ctx) {
  	var updating_replyId;
  	var current;

  	function postthread_replyId_binding(value) {
  		/*postthread_replyId_binding*/ ctx[9].call(null, value);
  	}

  	var postthread_props = { post: /*reply*/ ctx[11] };

  	if (/*replyId*/ ctx[0] !== void 0) {
  		postthread_props.replyId = /*replyId*/ ctx[0];
  	}

  	var postthread = new PostThread({ props: postthread_props });
  	binding_callbacks.push(function () { return bind$1(postthread, "replyId", postthread_replyId_binding); });
  	postthread.$on("reply", /*reply_handler*/ ctx[10]);

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
  			if (dirty & /*post*/ 2) { postthread_changes.post = /*reply*/ ctx[11]; }

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
  	var p;
  	var t2_value = /*post*/ ctx[1].body + "";
  	var t2;
  	var t3;
  	var promise;
  	var t4;
  	var current;
  	var if_block0 = /*post*/ ctx[1].title && create_if_block_2$2(ctx);
  	var if_block1 = /*post*/ ctx[1].description && create_if_block_1$2(ctx);

  	var info = {
  		ctx: ctx,
  		current: null,
  		token: null,
  		pending: create_pending_block$3,
  		then: create_then_block$3,
  		catch: create_catch_block$3,
  		value: 14,
  		error: 15
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
  			p = element("p");
  			t2 = text(t2_value);
  			t3 = space();
  			info.block.c();
  			t4 = space();

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
  			append(div, p);
  			append(p, t2);
  			append(div, t3);
  			info.block.m(div, info.anchor = null);
  			info.mount = function () { return div; };
  			info.anchor = t4;
  			append(div, t4);

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
  					if_block0 = create_if_block_2$2(ctx);
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
  					if_block1 = create_if_block_1$2(ctx);
  					if_block1.c();
  					if_block1.m(div, t1);
  				}
  			} else if (if_block1) {
  				if_block1.d(1);
  				if_block1 = null;
  			}

  			if ((!current || dirty & /*post*/ 2) && t2_value !== (t2_value = /*post*/ ctx[1].body + "")) { set_data(t2, t2_value); }
  			info.ctx = ctx;

  			if (dirty & /*replyResponse*/ 8 && promise !== (promise = /*replyResponse*/ ctx[3]) && handle_promise(promise, info)) ; else {
  				var child_ctx = ctx.slice();
  				child_ctx[14] = info.resolved;
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
  			info.block.d();
  			info.token = null;
  			info = null;
  			destroy_each(each_blocks, detaching);
  		}
  	};
  }

  var uri = "http://localhost:8080/api/v1";

  function instance$3($$self, $$props, $$invalidate) {
  	var post = $$props.post;
  	var dispatch = createEventDispatcher();
  	var replyId = $$props.replyId;
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
  		dispatch,
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
      }
  };

  return main;

}());
