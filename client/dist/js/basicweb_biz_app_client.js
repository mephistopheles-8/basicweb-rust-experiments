/**
  * basicweb_biz_app_client
  * (C) 2020 M. Bellaire
  * All rights Reserved
 */

var basicweb_biz_app_client = (function () {
  'use strict';

  var global$1 =
    (typeof globalThis !== 'undefined' && globalThis) ||
    (typeof self !== 'undefined' && self) ||
    (typeof global$1 !== 'undefined' && global$1);

  var support = {
    searchParams: 'URLSearchParams' in global$1,
    iterable: 'Symbol' in global$1 && 'iterator' in Symbol,
    blob:
      'FileReader' in global$1 &&
      'Blob' in global$1 &&
      (function() {
        try {
          new Blob();
          return true
        } catch (e) {
          return false
        }
      })(),
    formData: 'FormData' in global$1,
    arrayBuffer: 'ArrayBuffer' in global$1
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
    if (/[^a-z0-9\-#$%&'*+.^_`|~!]/i.test(name) || name === '') {
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
      /*
        fetch-mock wraps the Response object in an ES6 Proxy to
        provide useful test harness features such as flush. However, on
        ES5 browsers without fetch or Proxy support pollyfills must be used;
        the proxy-pollyfill is unable to proxy an attribute unless it exists
        on the object before the Proxy is created. This change ensures
        Response.bodyUsed exists on the instance, while maintaining the
        semantic of setting Request.bodyUsed in the constructor before
        _initBody is called.
      */
      this.bodyUsed = this.bodyUsed;
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
          var isConsumed = consumed(this);
          if (isConsumed) {
            return isConsumed
          }
          if (ArrayBuffer.isView(this._bodyArrayBuffer)) {
            return Promise.resolve(
              this._bodyArrayBuffer.buffer.slice(
                this._bodyArrayBuffer.byteOffset,
                this._bodyArrayBuffer.byteOffset + this._bodyArrayBuffer.byteLength
              )
            )
          } else {
            return Promise.resolve(this._bodyArrayBuffer)
          }
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
    if (!(this instanceof Request)) {
      throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.')
    }

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

    if (this.method === 'GET' || this.method === 'HEAD') {
      if (options.cache === 'no-store' || options.cache === 'no-cache') {
        // Search for a '_' parameter in the query string
        var reParamSearch = /([?&])_=[^&]*/;
        if (reParamSearch.test(this.url)) {
          // If it already exists then set the value with the current time
          this.url = this.url.replace(reParamSearch, '$1_=' + new Date().getTime());
        } else {
          // Otherwise add a new '_' parameter to the end with the current time
          var reQueryString = /\?/;
          this.url += (reQueryString.test(this.url) ? '&' : '?') + '_=' + new Date().getTime();
        }
      }
    }
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
    if (!(this instanceof Response)) {
      throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.')
    }
    if (!options) {
      options = {};
    }

    this.type = 'default';
    this.status = options.status === undefined ? 200 : options.status;
    this.ok = this.status >= 200 && this.status < 300;
    this.statusText = 'statusText' in options ? options.statusText : '';
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

  var DOMException = global$1.DOMException;
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
        setTimeout(function() {
          resolve(new Response(body, options));
        }, 0);
      };

      xhr.onerror = function() {
        setTimeout(function() {
          reject(new TypeError('Network request failed'));
        }, 0);
      };

      xhr.ontimeout = function() {
        setTimeout(function() {
          reject(new TypeError('Network request failed'));
        }, 0);
      };

      xhr.onabort = function() {
        setTimeout(function() {
          reject(new DOMException('Aborted', 'AbortError'));
        }, 0);
      };

      function fixUrl(url) {
        try {
          return url === '' && global$1.location.href ? global$1.location.href : url
        } catch (e) {
          return url
        }
      }

      xhr.open(request.method, fixUrl(request.url), true);

      if (request.credentials === 'include') {
        xhr.withCredentials = true;
      } else if (request.credentials === 'omit') {
        xhr.withCredentials = false;
      }

      if ('responseType' in xhr) {
        if (support.blob) {
          xhr.responseType = 'blob';
        } else if (
          support.arrayBuffer &&
          request.headers.get('Content-Type') &&
          request.headers.get('Content-Type').indexOf('application/octet-stream') !== -1
        ) {
          xhr.responseType = 'arraybuffer';
        }
      }

      if (init && typeof init.headers === 'object' && !(init.headers instanceof Headers)) {
        Object.getOwnPropertyNames(init.headers).forEach(function(name) {
          xhr.setRequestHeader(name, normalizeValue(init.headers[name]));
        });
      } else {
        request.headers.forEach(function(value, name) {
          xhr.setRequestHeader(name, value);
        });
      }

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

  if (!global$1.fetch) {
    global$1.fetch = fetch$1;
    global$1.Headers = Headers;
    global$1.Request = Request;
    global$1.Response = Response;
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
  function is_empty(obj) {
      return Object.keys(obj).length === 0;
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
  function to_number(value) {
      return value === '' ? undefined : +value;
  }
  function children(element) {
      return Array.from(element.childNodes);
  }
  function set_data(text, data) {
      data = '' + data;
      if (text.wholeText !== data)
          { text.data = data; }
  }
  function set_input_value(input, value) {
      input.value = value == null ? '' : value;
  }
  function custom_event(type, detail) {
      var e = document.createEvent('CustomEvent');
      e.initCustomEvent(type, false, false, detail);
      return e;
  }
  var HtmlTag = function HtmlTag(anchor) {
      if ( anchor === void 0 ) anchor = null;

      this.a = anchor;
      this.e = this.n = null;
  };
  HtmlTag.prototype.m = function m (html, target, anchor) {
          if ( anchor === void 0 ) anchor = null;

      if (!this.e) {
          this.e = element(target.nodeName);
          this.t = target;
          this.h(html);
      }
      this.i(anchor);
  };
  HtmlTag.prototype.h = function h (html) {
      this.e.innerHTML = html;
      this.n = Array.from(this.e.childNodes);
  };
  HtmlTag.prototype.i = function i (anchor) {
      for (var i = 0; i < this.n.length; i += 1) {
          insert(this.t, this.n[i], anchor);
      }
  };
  HtmlTag.prototype.p = function p (html) {
      this.d();
      this.h(html);
      this.i(this.a);
  };
  HtmlTag.prototype.d = function d () {
      this.n.forEach(detach);
  };

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
  SvelteComponent.prototype.$set = function $set ($$props) {
      if (this.$$set && !is_empty($$props)) {
          this.$$.skip_bound = true;
          this.$$set($$props);
          this.$$.skip_bound = false;
      }
  };

  /* src/GalleryCreate.html generated by Svelte v3.24.1 */

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
  	var mounted;
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
  		m: function m(target, anchor) {
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

  			if (!mounted) {
  				dispose = [
  					listen(input0, "input", /*input0_input_handler*/ ctx[9]),
  					listen(input1, "input", /*input1_input_handler*/ ctx[10])
  				];

  				mounted = true;
  			}
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
  			mounted = false;
  			run_all(dispose);
  		}
  	};
  }

  // (141:8) {:else}
  function create_else_block_1(ctx) {
  	var button;
  	var t;
  	var button_disabled_value;
  	var mounted;
  	var dispose;

  	return {
  		c: function c() {
  			button = element("button");
  			t = text("Add Gallery");
  			attr(button, "type", "button");
  			button.disabled = button_disabled_value = !galleryIsValid(/*galleryInfo*/ ctx[3]);
  		},
  		m: function m(target, anchor) {
  			insert(target, button, anchor);
  			append(button, t);

  			if (!mounted) {
  				dispose = listen(button, "click", /*addGallery*/ ctx[5]);
  				mounted = true;
  			}
  		},
  		p: function p(ctx, dirty) {
  			if (dirty & /*galleryInfo*/ 8 && button_disabled_value !== (button_disabled_value = !galleryIsValid(/*galleryInfo*/ ctx[3]))) {
  				button.disabled = button_disabled_value;
  			}
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(button); }
  			mounted = false;
  			dispose();
  		}
  	};
  }

  // (139:8) {#if galleryId}
  function create_if_block_4(ctx) {
  	var button;
  	var t;
  	var button_disabled_value;
  	var mounted;
  	var dispose;

  	return {
  		c: function c() {
  			button = element("button");
  			t = text("Update Gallery");
  			attr(button, "type", "button");
  			button.disabled = button_disabled_value = !galleryIsValid(/*galleryInfo*/ ctx[3]);
  		},
  		m: function m(target, anchor) {
  			insert(target, button, anchor);
  			append(button, t);

  			if (!mounted) {
  				dispose = listen(button, "click", /*updateGallery*/ ctx[6]);
  				mounted = true;
  			}
  		},
  		p: function p(ctx, dirty) {
  			if (dirty & /*galleryInfo*/ 8 && button_disabled_value !== (button_disabled_value = !galleryIsValid(/*galleryInfo*/ ctx[3]))) {
  				button.disabled = button_disabled_value;
  			}
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(button); }
  			mounted = false;
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
  	var mounted;
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
  		m: function m(target, anchor) {
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

  			if (!mounted) {
  				dispose = [
  					listen(input0, "input", /*input0_input_handler_1*/ ctx[11]),
  					listen(input1, "input", /*input1_input_handler_1*/ ctx[12]),
  					listen(input2, "change", /*input2_change_handler*/ ctx[13]),
  					listen(button, "click", /*addItem*/ ctx[8])
  				];

  				mounted = true;
  			}
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
  			mounted = false;
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

  	$$self.$$set = function ($$props) {
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
  function is_empty$1(obj) {
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
          if (this.$$set && !is_empty$1($$props)) {
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

  /* src/Gallery.html generated by Svelte v3.24.1 */

  function get_each_context$1(ctx, list, i) {
  	var child_ctx = ctx.slice();
  	child_ctx[7] = list[i];
  	return child_ctx;
  }

  // (99:0) {:catch err}
  function create_catch_block$1(ctx) {
  	var p;
  	var t0;
  	var t1_value = /*err*/ ctx[10].message + "";
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
  			if (dirty & /*galleryRequest*/ 2 && t1_value !== (t1_value = /*err*/ ctx[10].message + "")) { set_data(t1, t1_value); }
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
  			attr(img, "alt", img_alt_value = /*item*/ ctx[7][2].description);
  			if (img.src !== (img_src_value = "/assets/" + /*item*/ ctx[7][2].uuid)) { attr(img, "src", img_src_value); }
  			attr(img, "class", "svelte-1t2rpfy");
  		},
  		m: function m(target, anchor) {
  			insert(target, img, anchor);
  		},
  		p: function p(ctx, dirty) {
  			if (dirty & /*galleryRequest*/ 2 && img_alt_value !== (img_alt_value = /*item*/ ctx[7][2].description)) {
  				attr(img, "alt", img_alt_value);
  			}

  			if (dirty & /*galleryRequest*/ 2 && img.src !== (img_src_value = "/assets/" + /*item*/ ctx[7][2].uuid)) {
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
  	var lazy;
  	var t0;
  	var figcaption;
  	var t1_value = /*item*/ ctx[7][2].name + "";
  	var t1;
  	var t2;
  	var current;
  	var mounted;
  	var dispose;

  	lazy = new Src({
  			props: {
  				height: 400,
  				$$slots: { default: [create_default_slot] },
  				$$scope: { ctx: ctx }
  			}
  		});

  	function click_handler() {
  		var args = [], len = arguments.length;
  		while ( len-- ) args[ len ] = arguments[ len ];

  		return /*click_handler*/ ctx[5].apply(/*item*/ ctx, [ ctx[7] ].concat( args ));
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
  		m: function m(target, anchor) {
  			insert(target, figure, anchor);
  			mount_component(lazy, figure, null);
  			append(figure, t0);
  			append(figure, figcaption);
  			append(figcaption, t1);
  			insert(target, t2, anchor);
  			current = true;

  			if (!mounted) {
  				dispose = listen(figure, "click", click_handler);
  				mounted = true;
  			}
  		},
  		p: function p(new_ctx, dirty) {
  			ctx = new_ctx;
  			var lazy_changes = {};

  			if (dirty & /*$$scope, galleryRequest*/ 2050) {
  				lazy_changes.$$scope = { dirty: dirty, ctx: ctx };
  			}

  			lazy.$set(lazy_changes);
  			if ((!current || dirty & /*galleryRequest*/ 2) && t1_value !== (t1_value = /*item*/ ctx[7][2].name + "")) { set_data(t1, t1_value); }
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
  			mounted = false;
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
  	var mounted;
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
  		m: function m(target, anchor) {
  			insert(target, div1, anchor);
  			append(div1, div0);
  			append(div0, img);
  			current = true;

  			if (!mounted) {
  				dispose = listen(div1, "click", /*hideModal*/ ctx[3]);
  				mounted = true;
  			}
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
  			mounted = false;
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
  		error: 10,
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

  					if (dirty & /*displayItem*/ 1) {
  						transition_in(if_block, 1);
  					}
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

  	$$self.$$set = function ($$props) {
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

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

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
  var Element$1 = "∈";
  var elinters = "⏧";
  var ell = "ℓ";
  var els = "⪕";
  var elsdot = "⪗";
  var Emacr = "Ē";
  var emacr = "ē";
  var empty$2 = "∅";
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
  	Element: Element$1,
  	elinters: elinters,
  	ell: ell,
  	els: els,
  	elsdot: elsdot,
  	Emacr: Emacr,
  	emacr: emacr,
  	empty: empty$2,
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
    Element: Element$1,
    elinters: elinters,
    ell: ell,
    els: els,
    elsdot: elsdot,
    Emacr: Emacr,
    emacr: emacr,
    empty: empty$2,
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

  var _escape = escapeXML;

  var encode$1 = {
  	XML: XML,
  	HTML: HTML,
  	escape: _escape
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

  var text$2 = function(s) {
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
      block.appendChild(text$2(ticks));
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
          block.appendChild(text$2(subj.charAt(this.pos)));
          this.pos += 1;
      } else {
          block.appendChild(text$2('\\'));
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
          node$1.appendChild(text$2(dest));
          block.appendChild(node$1);
          return true;
      } else if ((m = this.match(reAutolink))) {
          dest = m.slice(1, m.length - 1);
          node$1 = new node('link');
          node$1._destination = normalizeURI$1(dest);
          node$1._title = '';
          node$1.appendChild(text$2(dest));
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
      var node = text$2(contents);
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

      var node = text$2('[');
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

          var node = text$2('![');
          block.appendChild(node);

          // Add entry to stack for this opener
          this.addBracket(node, startpos + 1, true);
      } else {
          block.appendChild(text$2('!'));
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
          block.appendChild(text$2(']'));
          return true;
      }

      if (!opener.active) {
          // no matched opener, just return a literal
          block.appendChild(text$2(']'));
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
          block.appendChild(text$2(']'));
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
          block.appendChild(text$2(decodeHTML$2(m)));
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
              block.appendChild(text$2(
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
              block.appendChild(text$2(m));
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
          block.appendChild(text$2(fromCodePoint_1(c)));
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

  function text$3(node) {
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

  HtmlRenderer.prototype.text = text$3;
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

  /* src/PostThread.html generated by Svelte v3.24.1 */

  function get_each_context$2(ctx, list, i) {
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
  function create_if_block_3$1(ctx) {
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
  function create_if_block_2$1(ctx) {
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
  function create_else_block_1$1(ctx) {
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
  function create_if_block_1$3(ctx) {
  	var html_tag;
  	var raw_value = /*renderMarkdown*/ ctx[6](/*post*/ ctx[1].body) + "";
  	var html_anchor;

  	return {
  		c: function c() {
  			html_anchor = empty();
  			html_tag = new HtmlTag(html_anchor);
  		},
  		m: function m(target, anchor) {
  			html_tag.m(raw_value, target, anchor);
  			insert(target, html_anchor, anchor);
  		},
  		p: function p(ctx, dirty) {
  			if (dirty & /*post*/ 2 && raw_value !== (raw_value = /*renderMarkdown*/ ctx[6](/*post*/ ctx[1].body) + "")) { html_tag.p(raw_value); }
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(html_anchor); }
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
  function create_catch_block$2(ctx) {
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
  function create_then_block$2(ctx) {
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
  	var mounted;
  	var dispose;

  	return {
  		c: function c() {
  			button = element("button");
  			button.textContent = "Reply";
  		},
  		m: function m(target, anchor) {
  			insert(target, button, anchor);

  			if (!mounted) {
  				dispose = listen(button, "click", /*replyBegin*/ ctx[4]);
  				mounted = true;
  			}
  		},
  		p: noop$1,
  		d: function d(detaching) {
  			if (detaching) { detach(button); }
  			mounted = false;
  			dispose();
  		}
  	};
  }

  // (78:4) {#if replyId === post.id}
  function create_if_block$3(ctx) {
  	var textarea;
  	var mounted;
  	var dispose;

  	return {
  		c: function c() {
  			textarea = element("textarea");
  		},
  		m: function m(target, anchor) {
  			insert(target, textarea, anchor);
  			set_input_value(textarea, /*replyValue*/ ctx[2]);

  			if (!mounted) {
  				dispose = [
  					listen(textarea, "input", /*textarea_input_handler*/ ctx[7]),
  					listen(textarea, "keydown", /*keyHandler*/ ctx[5])
  				];

  				mounted = true;
  			}
  		},
  		p: function p(ctx, dirty) {
  			if (dirty & /*replyValue*/ 4) {
  				set_input_value(textarea, /*replyValue*/ ctx[2]);
  			}
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(textarea); }
  			mounted = false;
  			run_all(dispose);
  		}
  	};
  }

  // (75:26)      <p>...</p>     {:then _}
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

  // (86:4) {#each post.replies as reply}
  function create_each_block$2(ctx) {
  	var postthread;
  	var updating_replyId;
  	var current;

  	function postthread_replyId_binding(value) {
  		/*postthread_replyId_binding*/ ctx[8].call(null, value);
  	}

  	var postthread_props = { post: /*reply*/ ctx[14] };

  	if (/*replyId*/ ctx[0] !== void 0) {
  		postthread_props.replyId = /*replyId*/ ctx[0];
  	}

  	postthread = new PostThread({ props: postthread_props });
  	binding_callbacks.push(function () { return bind$1(postthread, "replyId", postthread_replyId_binding); });
  	postthread.$on("reply", /*reply_handler*/ ctx[9]);

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
  	var if_block0 = /*post*/ ctx[1].title && create_if_block_3$1(ctx);
  	var if_block1 = /*post*/ ctx[1].description && create_if_block_2$1(ctx);

  	function select_block_type(ctx, dirty) {
  		if (/*post*/ ctx[1].format === 1) { return create_if_block_1$3; }
  		return create_else_block_1$1;
  	}

  	var current_block_type = select_block_type(ctx);
  	var if_block2 = current_block_type(ctx);

  	var info = {
  		ctx: ctx,
  		current: null,
  		token: null,
  		pending: create_pending_block$2,
  		then: create_then_block$2,
  		catch: create_catch_block$2,
  		value: 17,
  		error: 18
  	};

  	handle_promise(promise = /*replyResponse*/ ctx[3], info);
  	var each_value = /*post*/ ctx[1].replies;
  	var each_blocks = [];

  	for (var i = 0; i < each_value.length; i += 1) {
  		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
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
  					if_block0 = create_if_block_3$1(ctx);
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
  					if_block1 = create_if_block_2$1(ctx);
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
  					var child_ctx$1 = get_each_context$2(ctx, each_value, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx$1, dirty);
  						transition_in(each_blocks[i], 1);
  					} else {
  						each_blocks[i] = create_each_block$2(child_ctx$1);
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

  	$$self.$$set = function ($$props) {
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

  /* src/Board.html generated by Svelte v3.24.1 */

  function get_each_context$3(ctx, list, i) {
  	var child_ctx = ctx.slice();
  	child_ctx[8] = list[i];
  	return child_ctx;
  }

  // (41:0) {:catch err}
  function create_catch_block$3(ctx) {
  	var p;
  	var t0;
  	var t1_value = /*err*/ ctx[11].message + "";
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
  			if (dirty & /*postsRequest*/ 2 && t1_value !== (t1_value = /*err*/ ctx[11].message + "")) { set_data(t1, t1_value); }
  		},
  		i: noop$1,
  		o: noop$1,
  		d: function d(detaching) {
  			if (detaching) { detach(p); }
  		}
  	};
  }

  // (31:0) {:then posts}
  function create_then_block$3(ctx) {
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
  		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
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
  					var child_ctx = get_each_context$3(ctx, each_value, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block$3(child_ctx);
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
  	var postthread;
  	var updating_replyId;
  	var current;

  	function postthread_replyId_binding(value) {
  		/*postthread_replyId_binding*/ ctx[5].call(null, value);
  	}

  	var postthread_props = { post: /*posts*/ ctx[7] };

  	if (/*replyId*/ ctx[2] !== void 0) {
  		postthread_props.replyId = /*replyId*/ ctx[2];
  	}

  	postthread = new PostThread({ props: postthread_props });
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
  function create_each_block$3(ctx) {
  	var li;
  	var t0_value = /*post*/ ctx[8].title + "";
  	var t0;
  	var t1;
  	var t2_value = /*post*/ ctx[8].created + "";
  	var t2;
  	var mounted;
  	var dispose;

  	function click_handler() {
  		var args = [], len = arguments.length;
  		while ( len-- ) args[ len ] = arguments[ len ];

  		return /*click_handler*/ ctx[6].apply(/*post*/ ctx, [ ctx[8] ].concat( args ));
  	}

  	return {
  		c: function c() {
  			li = element("li");
  			t0 = text(t0_value);
  			t1 = space();
  			t2 = text(t2_value);
  		},
  		m: function m(target, anchor) {
  			insert(target, li, anchor);
  			append(li, t0);
  			append(li, t1);
  			append(li, t2);

  			if (!mounted) {
  				dispose = listen(li, "click", click_handler);
  				mounted = true;
  			}
  		},
  		p: function p(new_ctx, dirty) {
  			ctx = new_ctx;
  			if (dirty & /*postsRequest*/ 2 && t0_value !== (t0_value = /*post*/ ctx[8].title + "")) { set_data(t0, t0_value); }
  			if (dirty & /*postsRequest*/ 2 && t2_value !== (t2_value = /*post*/ ctx[8].created + "")) { set_data(t2, t2_value); }
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(li); }
  			mounted = false;
  			dispose();
  		}
  	};
  }

  // (29:21)  <p>...</p> {:then posts}
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
  		pending: create_pending_block$3,
  		then: create_then_block$3,
  		catch: create_catch_block$3,
  		value: 7,
  		error: 11,
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

  	$$self.$$set = function ($$props) {
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

  /* src/PostMarkdown.html generated by Svelte v3.24.1 */

  function create_catch_block_1(ctx) {
  	var p;
  	var t0;
  	var t1_value = /*err*/ ctx[15].message + "";
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
  			if (dirty & /*postRequest*/ 8 && t1_value !== (t1_value = /*err*/ ctx[15].message + "")) { set_data(t1, t1_value); }
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(p); }
  		}
  	};
  }

  // (95:0) {:then}
  function create_then_block$4(ctx) {
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
  	var mounted;
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
  		m: function m(target, anchor) {
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

  			if (!mounted) {
  				dispose = [
  					listen(input0, "input", /*input0_input_handler*/ ctx[8]),
  					listen(input1, "input", /*input1_input_handler*/ ctx[9]),
  					listen(textarea, "input", /*textarea_input_handler*/ ctx[10]),
  					listen(button, "click", /*savePost*/ ctx[6])
  				];

  				mounted = true;
  			}
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
  			mounted = false;
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
  		catch: create_catch_block$4,
  		value: 14,
  		error: 15
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
  				child_ctx[14] = info.resolved;
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
  function create_catch_block$4(ctx) {
  	var p;
  	var t0;
  	var t1_value = /*err*/ ctx[15].message + "";
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
  			if (dirty & /*saveRequest*/ 16 && t1_value !== (t1_value = /*err*/ ctx[15].message + "")) { set_data(t1, t1_value); }
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
  	var t1_value = /*p*/ ctx[14].updated + "";
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
  			if (dirty & /*saveRequest*/ 16 && t1_value !== (t1_value = /*p*/ ctx[14].updated + "")) { set_data(t1, t1_value); }
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
  function create_pending_block$4(ctx) {
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
  		pending: create_pending_block$4,
  		then: create_then_block$4,
  		catch: create_catch_block_1,
  		error: 15
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

  var api = "http://localhost:8080/api/v1";

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
  			var endpoint = api + "/posts" + (postId ? ("/" + postId) : "");

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

  	$$self.$$set = function ($$props) {
  		if ("postId" in $$props) { $$invalidate(7, postId = $$props.postId); }
  		if ("title" in $$props) { $$invalidate(0, title = $$props.title); }
  		if ("description" in $$props) { $$invalidate(1, description = $$props.description); }
  		if ("body" in $$props) { $$invalidate(2, body = $$props.body); }
  	};

  	$$self.$$.update = function () {
  		if ($$self.$$.dirty & /*postId, saveRequest*/ 144) {
  			 if (postId && !saveRequest) {
  				$$invalidate(3, postRequest = fetch((api + "/posts/" + postId)).then(function (res) { return res.json(); }).then(function (res) {
  					$$invalidate(0, title = res.title);
  					$$invalidate(1, description = res.description);
  					$$invalidate(2, body = res.body);
  					$$invalidate(4, saveRequest = Promise.resolve(res));
  					return res;
  				}));
  			}
  		}

  		if ($$self.$$.dirty & /*timer, body*/ 2052) {
  			 {
  				if (timer) {
  					clearTimeout(timer);
  				}

  				$$invalidate(11, timer = setTimeout(
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

  var host = "https://nominatim.openstreetmap.org";

  function paramEncode( params ) {
      var keys = [];
      for( var key in params ) {
          if( params.hasOwnProperty(key) ) 
             { keys.push(encodeURIComponent(key) + "=" + encodeURIComponent(params[key])); } 
      }
      return keys.join("&");
  } // end [paramEncode]

  function search( params ) {
      var paramUri = paramEncode( params );
      return fetch( (host + "/search?" + paramUri) );
  } // end [search]

  /* src/NominatimSearch.html generated by Svelte v3.24.1 */

  function get_each_context$4(ctx, list, i) {
  	var child_ctx = ctx.slice();
  	child_ctx[11] = list[i];
  	return child_ctx;
  }

  // (36:0) {#if queryResult}
  function create_if_block$6(ctx) {
  	var await_block_anchor;
  	var promise;

  	var info = {
  		ctx: ctx,
  		current: null,
  		token: null,
  		pending: create_pending_block$5,
  		then: create_then_block$5,
  		catch: create_catch_block$5,
  		value: 10,
  		error: 14
  	};

  	handle_promise(promise = /*queryResult*/ ctx[1], info);

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

  			if (dirty & /*queryResult*/ 2 && promise !== (promise = /*queryResult*/ ctx[1]) && handle_promise(promise, info)) ; else {
  				var child_ctx = ctx.slice();
  				child_ctx[10] = info.resolved;
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

  // (47:0) {:catch err}
  function create_catch_block$5(ctx) {
  	var p;
  	var t0;
  	var t1_value = /*err*/ ctx[14].message + "";
  	var t1;

  	return {
  		c: function c() {
  			p = element("p");
  			t0 = text("Query failed: ");
  			t1 = text(t1_value);
  		},
  		m: function m(target, anchor) {
  			insert(target, p, anchor);
  			append(p, t0);
  			append(p, t1);
  		},
  		p: function p(ctx, dirty) {
  			if (dirty & /*queryResult*/ 2 && t1_value !== (t1_value = /*err*/ ctx[14].message + "")) { set_data(t1, t1_value); }
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(p); }
  		}
  	};
  }

  // (39:0) {:then results}
  function create_then_block$5(ctx) {
  	var ul;
  	var each_value = /*results*/ ctx[10];
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
  			if (dirty & /*selectItem, queryResult*/ 18) {
  				each_value = /*results*/ ctx[10];
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
  		d: function d(detaching) {
  			if (detaching) { detach(ul); }
  			destroy_each(each_blocks, detaching);
  		}
  	};
  }

  // (41:4) {#each results as res}
  function create_each_block$4(ctx) {
  	var li;
  	var t0_value = /*res*/ ctx[11].display_name + "";
  	var t0;
  	var t1;
  	var mounted;
  	var dispose;

  	function click_handler() {
  		var args = [], len = arguments.length;
  		while ( len-- ) args[ len ] = arguments[ len ];

  		return /*click_handler*/ ctx[8].apply(/*res*/ ctx, [ ctx[11] ].concat( args ));
  	}

  	return {
  		c: function c() {
  			li = element("li");
  			t0 = text(t0_value);
  			t1 = space();
  		},
  		m: function m(target, anchor) {
  			insert(target, li, anchor);
  			append(li, t0);
  			append(li, t1);

  			if (!mounted) {
  				dispose = listen(li, "click", click_handler);
  				mounted = true;
  			}
  		},
  		p: function p(new_ctx, dirty) {
  			ctx = new_ctx;
  			if (dirty & /*queryResult*/ 2 && t0_value !== (t0_value = /*res*/ ctx[11].display_name + "")) { set_data(t0, t0_value); }
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(li); }
  			mounted = false;
  			dispose();
  		}
  	};
  }

  // (37:20)  <p>...</p> {:then results}
  function create_pending_block$5(ctx) {
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

  function create_fragment$6(ctx) {
  	var input;
  	var button;
  	var t1;
  	var if_block_anchor;
  	var mounted;
  	var dispose;
  	var if_block = /*queryResult*/ ctx[1] && create_if_block$6(ctx);

  	return {
  		c: function c() {
  			input = element("input");
  			button = element("button");
  			button.textContent = "GO";
  			t1 = space();
  			if (if_block) { if_block.c(); }
  			if_block_anchor = empty();
  			attr(input, "type", "text");
  		},
  		m: function m(target, anchor) {
  			insert(target, input, anchor);
  			/*input_binding*/ ctx[7](input);
  			insert(target, button, anchor);
  			insert(target, t1, anchor);
  			if (if_block) { if_block.m(target, anchor); }
  			insert(target, if_block_anchor, anchor);

  			if (!mounted) {
  				dispose = [
  					listen(input, "change", /*clearResult*/ ctx[3]),
  					listen(input, "change", /*change_handler*/ ctx[6]),
  					listen(button, "click", /*handleQuery*/ ctx[2])
  				];

  				mounted = true;
  			}
  		},
  		p: function p(ctx, ref) {
  			var dirty = ref[0];

  			if (/*queryResult*/ ctx[1]) {
  				if (if_block) {
  					if_block.p(ctx, dirty);
  				} else {
  					if_block = create_if_block$6(ctx);
  					if_block.c();
  					if_block.m(if_block_anchor.parentNode, if_block_anchor);
  				}
  			} else if (if_block) {
  				if_block.d(1);
  				if_block = null;
  			}
  		},
  		i: noop$1,
  		o: noop$1,
  		d: function d(detaching) {
  			if (detaching) { detach(input); }
  			/*input_binding*/ ctx[7](null);
  			if (detaching) { detach(button); }
  			if (detaching) { detach(t1); }
  			if (if_block) { if_block.d(detaching); }
  			if (detaching) { detach(if_block_anchor); }
  			mounted = false;
  			run_all(dispose);
  		}
  	};
  }

  function instance$6($$self, $$props, $$invalidate) {
  	var dispatch = createEventDispatcher();
  	var textElm;
  	var queryResult;
  	var selected = $$props.selected;

  	function handleQuery() {
  		var q = textElm.value;

  		$$invalidate(1, queryResult = search({
  			q: q,
  			format: "json",
  			addressdetails: "1",
  			namedetails: "1"
  		}).then(function (res) { return res.json(); }));
  	}

  	function clearResult() {
  		$$invalidate(1, queryResult = null);
  	}

  	function selectItem(res) {
  		$$invalidate(5, selected = res);
  		$$invalidate(0, textElm.value = res.display_name, textElm);
  		dispatch("selected", res);
  		clearResult();
  	}

  	function change_handler(event) {
  		bubble($$self, event);
  	}

  	function input_binding($$value) {
  		binding_callbacks[$$value ? "unshift" : "push"](function () {
  			textElm = $$value;
  			$$invalidate(0, textElm);
  		});
  	}

  	var click_handler = function (res) { return selectItem(res); };

  	$$self.$$set = function ($$props) {
  		if ("selected" in $$props) { $$invalidate(5, selected = $$props.selected); }
  	};

  	return [
  		textElm,
  		queryResult,
  		handleQuery,
  		clearResult,
  		selectItem,
  		selected,
  		change_handler,
  		input_binding,
  		click_handler
  	];
  }

  var NominatimSearch = /*@__PURE__*/(function (SvelteComponent) {
  	function NominatimSearch(options) {
  		SvelteComponent.call(this);
  		init(this, options, instance$6, create_fragment$6, safe_not_equal, { selected: 5 });
  	}

  	if ( SvelteComponent ) NominatimSearch.__proto__ = SvelteComponent;
  	NominatimSearch.prototype = Object.create( SvelteComponent && SvelteComponent.prototype );
  	NominatimSearch.prototype.constructor = NominatimSearch;

  	return NominatimSearch;
  }(SvelteComponent));

  var leafletSrc = createCommonjsModule(function (module, exports) {
  /* @preserve
   * Leaflet 1.6.0, a JS library for interactive maps. http://leafletjs.com
   * (c) 2010-2019 Vladimir Agafonkin, (c) 2010-2011 CloudMade
   */

  (function (global, factory) {
  	 factory(exports) ;
  }(commonjsGlobal, (function (exports) {
  var version = "1.6.0";

  /*
   * @namespace Util
   *
   * Various utility functions, used by Leaflet internally.
   */

  var freeze = Object.freeze;
  Object.freeze = function (obj) { return obj; };

  // @function extend(dest: Object, src?: Object): Object
  // Merges the properties of the `src` object (or multiple objects) into `dest` object and returns the latter. Has an `L.extend` shortcut.
  function extend(dest) {
  	var arguments$1 = arguments;

  	var i, j, len, src;

  	for (j = 1, len = arguments.length; j < len; j++) {
  		src = arguments$1[j];
  		for (i in src) {
  			dest[i] = src[i];
  		}
  	}
  	return dest;
  }

  // @function create(proto: Object, properties?: Object): Object
  // Compatibility polyfill for [Object.create](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/create)
  var create = Object.create || (function () {
  	function F() {}
  	return function (proto) {
  		F.prototype = proto;
  		return new F();
  	};
  })();

  // @function bind(fn: Function, …): Function
  // Returns a new function bound to the arguments passed, like [Function.prototype.bind](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function/bind).
  // Has a `L.bind()` shortcut.
  function bind(fn, obj) {
  	var slice = Array.prototype.slice;

  	if (fn.bind) {
  		return fn.bind.apply(fn, slice.call(arguments, 1));
  	}

  	var args = slice.call(arguments, 2);

  	return function () {
  		return fn.apply(obj, args.length ? args.concat(slice.call(arguments)) : arguments);
  	};
  }

  // @property lastId: Number
  // Last unique ID used by [`stamp()`](#util-stamp)
  var lastId = 0;

  // @function stamp(obj: Object): Number
  // Returns the unique ID of an object, assigning it one if it doesn't have it.
  function stamp(obj) {
  	/*eslint-disable */
  	obj._leaflet_id = obj._leaflet_id || ++lastId;
  	return obj._leaflet_id;
  	/* eslint-enable */
  }

  // @function throttle(fn: Function, time: Number, context: Object): Function
  // Returns a function which executes function `fn` with the given scope `context`
  // (so that the `this` keyword refers to `context` inside `fn`'s code). The function
  // `fn` will be called no more than one time per given amount of `time`. The arguments
  // received by the bound function will be any arguments passed when binding the
  // function, followed by any arguments passed when invoking the bound function.
  // Has an `L.throttle` shortcut.
  function throttle(fn, time, context) {
  	var lock, args, wrapperFn, later;

  	later = function () {
  		// reset lock and call if queued
  		lock = false;
  		if (args) {
  			wrapperFn.apply(context, args);
  			args = false;
  		}
  	};

  	wrapperFn = function () {
  		if (lock) {
  			// called too soon, queue to call later
  			args = arguments;

  		} else {
  			// call and lock until later
  			fn.apply(context, arguments);
  			setTimeout(later, time);
  			lock = true;
  		}
  	};

  	return wrapperFn;
  }

  // @function wrapNum(num: Number, range: Number[], includeMax?: Boolean): Number
  // Returns the number `num` modulo `range` in such a way so it lies within
  // `range[0]` and `range[1]`. The returned value will be always smaller than
  // `range[1]` unless `includeMax` is set to `true`.
  function wrapNum(x, range, includeMax) {
  	var max = range[1],
  	    min = range[0],
  	    d = max - min;
  	return x === max && includeMax ? x : ((x - min) % d + d) % d + min;
  }

  // @function falseFn(): Function
  // Returns a function which always returns `false`.
  function falseFn() { return false; }

  // @function formatNum(num: Number, digits?: Number): Number
  // Returns the number `num` rounded to `digits` decimals, or to 6 decimals by default.
  function formatNum(num, digits) {
  	var pow = Math.pow(10, (digits === undefined ? 6 : digits));
  	return Math.round(num * pow) / pow;
  }

  // @function trim(str: String): String
  // Compatibility polyfill for [String.prototype.trim](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String/Trim)
  function trim(str) {
  	return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
  }

  // @function splitWords(str: String): String[]
  // Trims and splits the string on whitespace and returns the array of parts.
  function splitWords(str) {
  	return trim(str).split(/\s+/);
  }

  // @function setOptions(obj: Object, options: Object): Object
  // Merges the given properties to the `options` of the `obj` object, returning the resulting options. See `Class options`. Has an `L.setOptions` shortcut.
  function setOptions(obj, options) {
  	if (!obj.hasOwnProperty('options')) {
  		obj.options = obj.options ? create(obj.options) : {};
  	}
  	for (var i in options) {
  		obj.options[i] = options[i];
  	}
  	return obj.options;
  }

  // @function getParamString(obj: Object, existingUrl?: String, uppercase?: Boolean): String
  // Converts an object into a parameter URL string, e.g. `{a: "foo", b: "bar"}`
  // translates to `'?a=foo&b=bar'`. If `existingUrl` is set, the parameters will
  // be appended at the end. If `uppercase` is `true`, the parameter names will
  // be uppercased (e.g. `'?A=foo&B=bar'`)
  function getParamString(obj, existingUrl, uppercase) {
  	var params = [];
  	for (var i in obj) {
  		params.push(encodeURIComponent(uppercase ? i.toUpperCase() : i) + '=' + encodeURIComponent(obj[i]));
  	}
  	return ((!existingUrl || existingUrl.indexOf('?') === -1) ? '?' : '&') + params.join('&');
  }

  var templateRe = /\{ *([\w_-]+) *\}/g;

  // @function template(str: String, data: Object): String
  // Simple templating facility, accepts a template string of the form `'Hello {a}, {b}'`
  // and a data object like `{a: 'foo', b: 'bar'}`, returns evaluated string
  // `('Hello foo, bar')`. You can also specify functions instead of strings for
  // data values — they will be evaluated passing `data` as an argument.
  function template(str, data) {
  	return str.replace(templateRe, function (str, key) {
  		var value = data[key];

  		if (value === undefined) {
  			throw new Error('No value provided for variable ' + str);

  		} else if (typeof value === 'function') {
  			value = value(data);
  		}
  		return value;
  	});
  }

  // @function isArray(obj): Boolean
  // Compatibility polyfill for [Array.isArray](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray)
  var isArray = Array.isArray || function (obj) {
  	return (Object.prototype.toString.call(obj) === '[object Array]');
  };

  // @function indexOf(array: Array, el: Object): Number
  // Compatibility polyfill for [Array.prototype.indexOf](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf)
  function indexOf(array, el) {
  	for (var i = 0; i < array.length; i++) {
  		if (array[i] === el) { return i; }
  	}
  	return -1;
  }

  // @property emptyImageUrl: String
  // Data URI string containing a base64-encoded empty GIF image.
  // Used as a hack to free memory from unused images on WebKit-powered
  // mobile devices (by setting image `src` to this string).
  var emptyImageUrl = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

  // inspired by http://paulirish.com/2011/requestanimationframe-for-smart-animating/

  function getPrefixed(name) {
  	return window['webkit' + name] || window['moz' + name] || window['ms' + name];
  }

  var lastTime = 0;

  // fallback for IE 7-8
  function timeoutDefer(fn) {
  	var time = +new Date(),
  	    timeToCall = Math.max(0, 16 - (time - lastTime));

  	lastTime = time + timeToCall;
  	return window.setTimeout(fn, timeToCall);
  }

  var requestFn = window.requestAnimationFrame || getPrefixed('RequestAnimationFrame') || timeoutDefer;
  var cancelFn = window.cancelAnimationFrame || getPrefixed('CancelAnimationFrame') ||
  		getPrefixed('CancelRequestAnimationFrame') || function (id) { window.clearTimeout(id); };

  // @function requestAnimFrame(fn: Function, context?: Object, immediate?: Boolean): Number
  // Schedules `fn` to be executed when the browser repaints. `fn` is bound to
  // `context` if given. When `immediate` is set, `fn` is called immediately if
  // the browser doesn't have native support for
  // [`window.requestAnimationFrame`](https://developer.mozilla.org/docs/Web/API/window/requestAnimationFrame),
  // otherwise it's delayed. Returns a request ID that can be used to cancel the request.
  function requestAnimFrame(fn, context, immediate) {
  	if (immediate && requestFn === timeoutDefer) {
  		fn.call(context);
  	} else {
  		return requestFn.call(window, bind(fn, context));
  	}
  }

  // @function cancelAnimFrame(id: Number): undefined
  // Cancels a previous `requestAnimFrame`. See also [window.cancelAnimationFrame](https://developer.mozilla.org/docs/Web/API/window/cancelAnimationFrame).
  function cancelAnimFrame(id) {
  	if (id) {
  		cancelFn.call(window, id);
  	}
  }


  var Util = (Object.freeze || Object)({
  	freeze: freeze,
  	extend: extend,
  	create: create,
  	bind: bind,
  	lastId: lastId,
  	stamp: stamp,
  	throttle: throttle,
  	wrapNum: wrapNum,
  	falseFn: falseFn,
  	formatNum: formatNum,
  	trim: trim,
  	splitWords: splitWords,
  	setOptions: setOptions,
  	getParamString: getParamString,
  	template: template,
  	isArray: isArray,
  	indexOf: indexOf,
  	emptyImageUrl: emptyImageUrl,
  	requestFn: requestFn,
  	cancelFn: cancelFn,
  	requestAnimFrame: requestAnimFrame,
  	cancelAnimFrame: cancelAnimFrame
  });

  // @class Class
  // @aka L.Class

  // @section
  // @uninheritable

  // Thanks to John Resig and Dean Edwards for inspiration!

  function Class() {}

  Class.extend = function (props) {

  	// @function extend(props: Object): Function
  	// [Extends the current class](#class-inheritance) given the properties to be included.
  	// Returns a Javascript function that is a class constructor (to be called with `new`).
  	var NewClass = function () {

  		// call the constructor
  		if (this.initialize) {
  			this.initialize.apply(this, arguments);
  		}

  		// call all constructor hooks
  		this.callInitHooks();
  	};

  	var parentProto = NewClass.__super__ = this.prototype;

  	var proto = create(parentProto);
  	proto.constructor = NewClass;

  	NewClass.prototype = proto;

  	// inherit parent's statics
  	for (var i in this) {
  		if (this.hasOwnProperty(i) && i !== 'prototype' && i !== '__super__') {
  			NewClass[i] = this[i];
  		}
  	}

  	// mix static properties into the class
  	if (props.statics) {
  		extend(NewClass, props.statics);
  		delete props.statics;
  	}

  	// mix includes into the prototype
  	if (props.includes) {
  		checkDeprecatedMixinEvents(props.includes);
  		extend.apply(null, [proto].concat(props.includes));
  		delete props.includes;
  	}

  	// merge options
  	if (proto.options) {
  		props.options = extend(create(proto.options), props.options);
  	}

  	// mix given properties into the prototype
  	extend(proto, props);

  	proto._initHooks = [];

  	// add method for calling all hooks
  	proto.callInitHooks = function () {

  		if (this._initHooksCalled) { return; }

  		if (parentProto.callInitHooks) {
  			parentProto.callInitHooks.call(this);
  		}

  		this._initHooksCalled = true;

  		for (var i = 0, len = proto._initHooks.length; i < len; i++) {
  			proto._initHooks[i].call(this);
  		}
  	};

  	return NewClass;
  };


  // @function include(properties: Object): this
  // [Includes a mixin](#class-includes) into the current class.
  Class.include = function (props) {
  	extend(this.prototype, props);
  	return this;
  };

  // @function mergeOptions(options: Object): this
  // [Merges `options`](#class-options) into the defaults of the class.
  Class.mergeOptions = function (options) {
  	extend(this.prototype.options, options);
  	return this;
  };

  // @function addInitHook(fn: Function): this
  // Adds a [constructor hook](#class-constructor-hooks) to the class.
  Class.addInitHook = function (fn) { // (Function) || (String, args...)
  	var args = Array.prototype.slice.call(arguments, 1);

  	var init = typeof fn === 'function' ? fn : function () {
  		this[fn].apply(this, args);
  	};

  	this.prototype._initHooks = this.prototype._initHooks || [];
  	this.prototype._initHooks.push(init);
  	return this;
  };

  function checkDeprecatedMixinEvents(includes) {
  	if (typeof L === 'undefined' || !L || !L.Mixin) { return; }

  	includes = isArray(includes) ? includes : [includes];

  	for (var i = 0; i < includes.length; i++) {
  		if (includes[i] === L.Mixin.Events) {
  			console.warn('Deprecated include of L.Mixin.Events: ' +
  				'this property will be removed in future releases, ' +
  				'please inherit from L.Evented instead.', new Error().stack);
  		}
  	}
  }

  /*
   * @class Evented
   * @aka L.Evented
   * @inherits Class
   *
   * A set of methods shared between event-powered classes (like `Map` and `Marker`). Generally, events allow you to execute some function when something happens with an object (e.g. the user clicks on the map, causing the map to fire `'click'` event).
   *
   * @example
   *
   * ```js
   * map.on('click', function(e) {
   * 	alert(e.latlng);
   * } );
   * ```
   *
   * Leaflet deals with event listeners by reference, so if you want to add a listener and then remove it, define it as a function:
   *
   * ```js
   * function onClick(e) { ... }
   *
   * map.on('click', onClick);
   * map.off('click', onClick);
   * ```
   */

  var Events = {
  	/* @method on(type: String, fn: Function, context?: Object): this
  	 * Adds a listener function (`fn`) to a particular event type of the object. You can optionally specify the context of the listener (object the this keyword will point to). You can also pass several space-separated types (e.g. `'click dblclick'`).
  	 *
  	 * @alternative
  	 * @method on(eventMap: Object): this
  	 * Adds a set of type/listener pairs, e.g. `{click: onClick, mousemove: onMouseMove}`
  	 */
  	on: function (types, fn, context) {

  		// types can be a map of types/handlers
  		if (typeof types === 'object') {
  			for (var type in types) {
  				// we don't process space-separated events here for performance;
  				// it's a hot path since Layer uses the on(obj) syntax
  				this._on(type, types[type], fn);
  			}

  		} else {
  			// types can be a string of space-separated words
  			types = splitWords(types);

  			for (var i = 0, len = types.length; i < len; i++) {
  				this._on(types[i], fn, context);
  			}
  		}

  		return this;
  	},

  	/* @method off(type: String, fn?: Function, context?: Object): this
  	 * Removes a previously added listener function. If no function is specified, it will remove all the listeners of that particular event from the object. Note that if you passed a custom context to `on`, you must pass the same context to `off` in order to remove the listener.
  	 *
  	 * @alternative
  	 * @method off(eventMap: Object): this
  	 * Removes a set of type/listener pairs.
  	 *
  	 * @alternative
  	 * @method off: this
  	 * Removes all listeners to all events on the object. This includes implicitly attached events.
  	 */
  	off: function (types, fn, context) {

  		if (!types) {
  			// clear all listeners if called without arguments
  			delete this._events;

  		} else if (typeof types === 'object') {
  			for (var type in types) {
  				this._off(type, types[type], fn);
  			}

  		} else {
  			types = splitWords(types);

  			for (var i = 0, len = types.length; i < len; i++) {
  				this._off(types[i], fn, context);
  			}
  		}

  		return this;
  	},

  	// attach listener (without syntactic sugar now)
  	_on: function (type, fn, context) {
  		this._events = this._events || {};

  		/* get/init listeners for type */
  		var typeListeners = this._events[type];
  		if (!typeListeners) {
  			typeListeners = [];
  			this._events[type] = typeListeners;
  		}

  		if (context === this) {
  			// Less memory footprint.
  			context = undefined;
  		}
  		var newListener = {fn: fn, ctx: context},
  		    listeners = typeListeners;

  		// check if fn already there
  		for (var i = 0, len = listeners.length; i < len; i++) {
  			if (listeners[i].fn === fn && listeners[i].ctx === context) {
  				return;
  			}
  		}

  		listeners.push(newListener);
  	},

  	_off: function (type, fn, context) {
  		var listeners,
  		    i,
  		    len;

  		if (!this._events) { return; }

  		listeners = this._events[type];

  		if (!listeners) {
  			return;
  		}

  		if (!fn) {
  			// Set all removed listeners to noop so they are not called if remove happens in fire
  			for (i = 0, len = listeners.length; i < len; i++) {
  				listeners[i].fn = falseFn;
  			}
  			// clear all listeners for a type if function isn't specified
  			delete this._events[type];
  			return;
  		}

  		if (context === this) {
  			context = undefined;
  		}

  		if (listeners) {

  			// find fn and remove it
  			for (i = 0, len = listeners.length; i < len; i++) {
  				var l = listeners[i];
  				if (l.ctx !== context) { continue; }
  				if (l.fn === fn) {

  					// set the removed listener to noop so that's not called if remove happens in fire
  					l.fn = falseFn;

  					if (this._firingCount) {
  						/* copy array in case events are being fired */
  						this._events[type] = listeners = listeners.slice();
  					}
  					listeners.splice(i, 1);

  					return;
  				}
  			}
  		}
  	},

  	// @method fire(type: String, data?: Object, propagate?: Boolean): this
  	// Fires an event of the specified type. You can optionally provide an data
  	// object — the first argument of the listener function will contain its
  	// properties. The event can optionally be propagated to event parents.
  	fire: function (type, data, propagate) {
  		if (!this.listens(type, propagate)) { return this; }

  		var event = extend({}, data, {
  			type: type,
  			target: this,
  			sourceTarget: data && data.sourceTarget || this
  		});

  		if (this._events) {
  			var listeners = this._events[type];

  			if (listeners) {
  				this._firingCount = (this._firingCount + 1) || 1;
  				for (var i = 0, len = listeners.length; i < len; i++) {
  					var l = listeners[i];
  					l.fn.call(l.ctx || this, event);
  				}

  				this._firingCount--;
  			}
  		}

  		if (propagate) {
  			// propagate the event to parents (set with addEventParent)
  			this._propagateEvent(event);
  		}

  		return this;
  	},

  	// @method listens(type: String): Boolean
  	// Returns `true` if a particular event type has any listeners attached to it.
  	listens: function (type, propagate) {
  		var listeners = this._events && this._events[type];
  		if (listeners && listeners.length) { return true; }

  		if (propagate) {
  			// also check parents for listeners if event propagates
  			for (var id in this._eventParents) {
  				if (this._eventParents[id].listens(type, propagate)) { return true; }
  			}
  		}
  		return false;
  	},

  	// @method once(…): this
  	// Behaves as [`on(…)`](#evented-on), except the listener will only get fired once and then removed.
  	once: function (types, fn, context) {

  		if (typeof types === 'object') {
  			for (var type in types) {
  				this.once(type, types[type], fn);
  			}
  			return this;
  		}

  		var handler = bind(function () {
  			this
  			    .off(types, fn, context)
  			    .off(types, handler, context);
  		}, this);

  		// add a listener that's executed once and removed after that
  		return this
  		    .on(types, fn, context)
  		    .on(types, handler, context);
  	},

  	// @method addEventParent(obj: Evented): this
  	// Adds an event parent - an `Evented` that will receive propagated events
  	addEventParent: function (obj) {
  		this._eventParents = this._eventParents || {};
  		this._eventParents[stamp(obj)] = obj;
  		return this;
  	},

  	// @method removeEventParent(obj: Evented): this
  	// Removes an event parent, so it will stop receiving propagated events
  	removeEventParent: function (obj) {
  		if (this._eventParents) {
  			delete this._eventParents[stamp(obj)];
  		}
  		return this;
  	},

  	_propagateEvent: function (e) {
  		for (var id in this._eventParents) {
  			this._eventParents[id].fire(e.type, extend({
  				layer: e.target,
  				propagatedFrom: e.target
  			}, e), true);
  		}
  	}
  };

  // aliases; we should ditch those eventually

  // @method addEventListener(…): this
  // Alias to [`on(…)`](#evented-on)
  Events.addEventListener = Events.on;

  // @method removeEventListener(…): this
  // Alias to [`off(…)`](#evented-off)

  // @method clearAllEventListeners(…): this
  // Alias to [`off()`](#evented-off)
  Events.removeEventListener = Events.clearAllEventListeners = Events.off;

  // @method addOneTimeEventListener(…): this
  // Alias to [`once(…)`](#evented-once)
  Events.addOneTimeEventListener = Events.once;

  // @method fireEvent(…): this
  // Alias to [`fire(…)`](#evented-fire)
  Events.fireEvent = Events.fire;

  // @method hasEventListeners(…): Boolean
  // Alias to [`listens(…)`](#evented-listens)
  Events.hasEventListeners = Events.listens;

  var Evented = Class.extend(Events);

  /*
   * @class Point
   * @aka L.Point
   *
   * Represents a point with `x` and `y` coordinates in pixels.
   *
   * @example
   *
   * ```js
   * var point = L.point(200, 300);
   * ```
   *
   * All Leaflet methods and options that accept `Point` objects also accept them in a simple Array form (unless noted otherwise), so these lines are equivalent:
   *
   * ```js
   * map.panBy([200, 300]);
   * map.panBy(L.point(200, 300));
   * ```
   *
   * Note that `Point` does not inherit from Leafet's `Class` object,
   * which means new classes can't inherit from it, and new methods
   * can't be added to it with the `include` function.
   */

  function Point(x, y, round) {
  	// @property x: Number; The `x` coordinate of the point
  	this.x = (round ? Math.round(x) : x);
  	// @property y: Number; The `y` coordinate of the point
  	this.y = (round ? Math.round(y) : y);
  }

  var trunc = Math.trunc || function (v) {
  	return v > 0 ? Math.floor(v) : Math.ceil(v);
  };

  Point.prototype = {

  	// @method clone(): Point
  	// Returns a copy of the current point.
  	clone: function () {
  		return new Point(this.x, this.y);
  	},

  	// @method add(otherPoint: Point): Point
  	// Returns the result of addition of the current and the given points.
  	add: function (point) {
  		// non-destructive, returns a new point
  		return this.clone()._add(toPoint(point));
  	},

  	_add: function (point) {
  		// destructive, used directly for performance in situations where it's safe to modify existing point
  		this.x += point.x;
  		this.y += point.y;
  		return this;
  	},

  	// @method subtract(otherPoint: Point): Point
  	// Returns the result of subtraction of the given point from the current.
  	subtract: function (point) {
  		return this.clone()._subtract(toPoint(point));
  	},

  	_subtract: function (point) {
  		this.x -= point.x;
  		this.y -= point.y;
  		return this;
  	},

  	// @method divideBy(num: Number): Point
  	// Returns the result of division of the current point by the given number.
  	divideBy: function (num) {
  		return this.clone()._divideBy(num);
  	},

  	_divideBy: function (num) {
  		this.x /= num;
  		this.y /= num;
  		return this;
  	},

  	// @method multiplyBy(num: Number): Point
  	// Returns the result of multiplication of the current point by the given number.
  	multiplyBy: function (num) {
  		return this.clone()._multiplyBy(num);
  	},

  	_multiplyBy: function (num) {
  		this.x *= num;
  		this.y *= num;
  		return this;
  	},

  	// @method scaleBy(scale: Point): Point
  	// Multiply each coordinate of the current point by each coordinate of
  	// `scale`. In linear algebra terms, multiply the point by the
  	// [scaling matrix](https://en.wikipedia.org/wiki/Scaling_%28geometry%29#Matrix_representation)
  	// defined by `scale`.
  	scaleBy: function (point) {
  		return new Point(this.x * point.x, this.y * point.y);
  	},

  	// @method unscaleBy(scale: Point): Point
  	// Inverse of `scaleBy`. Divide each coordinate of the current point by
  	// each coordinate of `scale`.
  	unscaleBy: function (point) {
  		return new Point(this.x / point.x, this.y / point.y);
  	},

  	// @method round(): Point
  	// Returns a copy of the current point with rounded coordinates.
  	round: function () {
  		return this.clone()._round();
  	},

  	_round: function () {
  		this.x = Math.round(this.x);
  		this.y = Math.round(this.y);
  		return this;
  	},

  	// @method floor(): Point
  	// Returns a copy of the current point with floored coordinates (rounded down).
  	floor: function () {
  		return this.clone()._floor();
  	},

  	_floor: function () {
  		this.x = Math.floor(this.x);
  		this.y = Math.floor(this.y);
  		return this;
  	},

  	// @method ceil(): Point
  	// Returns a copy of the current point with ceiled coordinates (rounded up).
  	ceil: function () {
  		return this.clone()._ceil();
  	},

  	_ceil: function () {
  		this.x = Math.ceil(this.x);
  		this.y = Math.ceil(this.y);
  		return this;
  	},

  	// @method trunc(): Point
  	// Returns a copy of the current point with truncated coordinates (rounded towards zero).
  	trunc: function () {
  		return this.clone()._trunc();
  	},

  	_trunc: function () {
  		this.x = trunc(this.x);
  		this.y = trunc(this.y);
  		return this;
  	},

  	// @method distanceTo(otherPoint: Point): Number
  	// Returns the cartesian distance between the current and the given points.
  	distanceTo: function (point) {
  		point = toPoint(point);

  		var x = point.x - this.x,
  		    y = point.y - this.y;

  		return Math.sqrt(x * x + y * y);
  	},

  	// @method equals(otherPoint: Point): Boolean
  	// Returns `true` if the given point has the same coordinates.
  	equals: function (point) {
  		point = toPoint(point);

  		return point.x === this.x &&
  		       point.y === this.y;
  	},

  	// @method contains(otherPoint: Point): Boolean
  	// Returns `true` if both coordinates of the given point are less than the corresponding current point coordinates (in absolute values).
  	contains: function (point) {
  		point = toPoint(point);

  		return Math.abs(point.x) <= Math.abs(this.x) &&
  		       Math.abs(point.y) <= Math.abs(this.y);
  	},

  	// @method toString(): String
  	// Returns a string representation of the point for debugging purposes.
  	toString: function () {
  		return 'Point(' +
  		        formatNum(this.x) + ', ' +
  		        formatNum(this.y) + ')';
  	}
  };

  // @factory L.point(x: Number, y: Number, round?: Boolean)
  // Creates a Point object with the given `x` and `y` coordinates. If optional `round` is set to true, rounds the `x` and `y` values.

  // @alternative
  // @factory L.point(coords: Number[])
  // Expects an array of the form `[x, y]` instead.

  // @alternative
  // @factory L.point(coords: Object)
  // Expects a plain object of the form `{x: Number, y: Number}` instead.
  function toPoint(x, y, round) {
  	if (x instanceof Point) {
  		return x;
  	}
  	if (isArray(x)) {
  		return new Point(x[0], x[1]);
  	}
  	if (x === undefined || x === null) {
  		return x;
  	}
  	if (typeof x === 'object' && 'x' in x && 'y' in x) {
  		return new Point(x.x, x.y);
  	}
  	return new Point(x, y, round);
  }

  /*
   * @class Bounds
   * @aka L.Bounds
   *
   * Represents a rectangular area in pixel coordinates.
   *
   * @example
   *
   * ```js
   * var p1 = L.point(10, 10),
   * p2 = L.point(40, 60),
   * bounds = L.bounds(p1, p2);
   * ```
   *
   * All Leaflet methods that accept `Bounds` objects also accept them in a simple Array form (unless noted otherwise), so the bounds example above can be passed like this:
   *
   * ```js
   * otherBounds.intersects([[10, 10], [40, 60]]);
   * ```
   *
   * Note that `Bounds` does not inherit from Leafet's `Class` object,
   * which means new classes can't inherit from it, and new methods
   * can't be added to it with the `include` function.
   */

  function Bounds(a, b) {
  	if (!a) { return; }

  	var points = b ? [a, b] : a;

  	for (var i = 0, len = points.length; i < len; i++) {
  		this.extend(points[i]);
  	}
  }

  Bounds.prototype = {
  	// @method extend(point: Point): this
  	// Extends the bounds to contain the given point.
  	extend: function (point) { // (Point)
  		point = toPoint(point);

  		// @property min: Point
  		// The top left corner of the rectangle.
  		// @property max: Point
  		// The bottom right corner of the rectangle.
  		if (!this.min && !this.max) {
  			this.min = point.clone();
  			this.max = point.clone();
  		} else {
  			this.min.x = Math.min(point.x, this.min.x);
  			this.max.x = Math.max(point.x, this.max.x);
  			this.min.y = Math.min(point.y, this.min.y);
  			this.max.y = Math.max(point.y, this.max.y);
  		}
  		return this;
  	},

  	// @method getCenter(round?: Boolean): Point
  	// Returns the center point of the bounds.
  	getCenter: function (round) {
  		return new Point(
  		        (this.min.x + this.max.x) / 2,
  		        (this.min.y + this.max.y) / 2, round);
  	},

  	// @method getBottomLeft(): Point
  	// Returns the bottom-left point of the bounds.
  	getBottomLeft: function () {
  		return new Point(this.min.x, this.max.y);
  	},

  	// @method getTopRight(): Point
  	// Returns the top-right point of the bounds.
  	getTopRight: function () { // -> Point
  		return new Point(this.max.x, this.min.y);
  	},

  	// @method getTopLeft(): Point
  	// Returns the top-left point of the bounds (i.e. [`this.min`](#bounds-min)).
  	getTopLeft: function () {
  		return this.min; // left, top
  	},

  	// @method getBottomRight(): Point
  	// Returns the bottom-right point of the bounds (i.e. [`this.max`](#bounds-max)).
  	getBottomRight: function () {
  		return this.max; // right, bottom
  	},

  	// @method getSize(): Point
  	// Returns the size of the given bounds
  	getSize: function () {
  		return this.max.subtract(this.min);
  	},

  	// @method contains(otherBounds: Bounds): Boolean
  	// Returns `true` if the rectangle contains the given one.
  	// @alternative
  	// @method contains(point: Point): Boolean
  	// Returns `true` if the rectangle contains the given point.
  	contains: function (obj) {
  		var min, max;

  		if (typeof obj[0] === 'number' || obj instanceof Point) {
  			obj = toPoint(obj);
  		} else {
  			obj = toBounds(obj);
  		}

  		if (obj instanceof Bounds) {
  			min = obj.min;
  			max = obj.max;
  		} else {
  			min = max = obj;
  		}

  		return (min.x >= this.min.x) &&
  		       (max.x <= this.max.x) &&
  		       (min.y >= this.min.y) &&
  		       (max.y <= this.max.y);
  	},

  	// @method intersects(otherBounds: Bounds): Boolean
  	// Returns `true` if the rectangle intersects the given bounds. Two bounds
  	// intersect if they have at least one point in common.
  	intersects: function (bounds) { // (Bounds) -> Boolean
  		bounds = toBounds(bounds);

  		var min = this.min,
  		    max = this.max,
  		    min2 = bounds.min,
  		    max2 = bounds.max,
  		    xIntersects = (max2.x >= min.x) && (min2.x <= max.x),
  		    yIntersects = (max2.y >= min.y) && (min2.y <= max.y);

  		return xIntersects && yIntersects;
  	},

  	// @method overlaps(otherBounds: Bounds): Boolean
  	// Returns `true` if the rectangle overlaps the given bounds. Two bounds
  	// overlap if their intersection is an area.
  	overlaps: function (bounds) { // (Bounds) -> Boolean
  		bounds = toBounds(bounds);

  		var min = this.min,
  		    max = this.max,
  		    min2 = bounds.min,
  		    max2 = bounds.max,
  		    xOverlaps = (max2.x > min.x) && (min2.x < max.x),
  		    yOverlaps = (max2.y > min.y) && (min2.y < max.y);

  		return xOverlaps && yOverlaps;
  	},

  	isValid: function () {
  		return !!(this.min && this.max);
  	}
  };


  // @factory L.bounds(corner1: Point, corner2: Point)
  // Creates a Bounds object from two corners coordinate pairs.
  // @alternative
  // @factory L.bounds(points: Point[])
  // Creates a Bounds object from the given array of points.
  function toBounds(a, b) {
  	if (!a || a instanceof Bounds) {
  		return a;
  	}
  	return new Bounds(a, b);
  }

  /*
   * @class LatLngBounds
   * @aka L.LatLngBounds
   *
   * Represents a rectangular geographical area on a map.
   *
   * @example
   *
   * ```js
   * var corner1 = L.latLng(40.712, -74.227),
   * corner2 = L.latLng(40.774, -74.125),
   * bounds = L.latLngBounds(corner1, corner2);
   * ```
   *
   * All Leaflet methods that accept LatLngBounds objects also accept them in a simple Array form (unless noted otherwise), so the bounds example above can be passed like this:
   *
   * ```js
   * map.fitBounds([
   * 	[40.712, -74.227],
   * 	[40.774, -74.125]
   * ]);
   * ```
   *
   * Caution: if the area crosses the antimeridian (often confused with the International Date Line), you must specify corners _outside_ the [-180, 180] degrees longitude range.
   *
   * Note that `LatLngBounds` does not inherit from Leafet's `Class` object,
   * which means new classes can't inherit from it, and new methods
   * can't be added to it with the `include` function.
   */

  function LatLngBounds(corner1, corner2) { // (LatLng, LatLng) or (LatLng[])
  	if (!corner1) { return; }

  	var latlngs = corner2 ? [corner1, corner2] : corner1;

  	for (var i = 0, len = latlngs.length; i < len; i++) {
  		this.extend(latlngs[i]);
  	}
  }

  LatLngBounds.prototype = {

  	// @method extend(latlng: LatLng): this
  	// Extend the bounds to contain the given point

  	// @alternative
  	// @method extend(otherBounds: LatLngBounds): this
  	// Extend the bounds to contain the given bounds
  	extend: function (obj) {
  		var sw = this._southWest,
  		    ne = this._northEast,
  		    sw2, ne2;

  		if (obj instanceof LatLng) {
  			sw2 = obj;
  			ne2 = obj;

  		} else if (obj instanceof LatLngBounds) {
  			sw2 = obj._southWest;
  			ne2 = obj._northEast;

  			if (!sw2 || !ne2) { return this; }

  		} else {
  			return obj ? this.extend(toLatLng(obj) || toLatLngBounds(obj)) : this;
  		}

  		if (!sw && !ne) {
  			this._southWest = new LatLng(sw2.lat, sw2.lng);
  			this._northEast = new LatLng(ne2.lat, ne2.lng);
  		} else {
  			sw.lat = Math.min(sw2.lat, sw.lat);
  			sw.lng = Math.min(sw2.lng, sw.lng);
  			ne.lat = Math.max(ne2.lat, ne.lat);
  			ne.lng = Math.max(ne2.lng, ne.lng);
  		}

  		return this;
  	},

  	// @method pad(bufferRatio: Number): LatLngBounds
  	// Returns bounds created by extending or retracting the current bounds by a given ratio in each direction.
  	// For example, a ratio of 0.5 extends the bounds by 50% in each direction.
  	// Negative values will retract the bounds.
  	pad: function (bufferRatio) {
  		var sw = this._southWest,
  		    ne = this._northEast,
  		    heightBuffer = Math.abs(sw.lat - ne.lat) * bufferRatio,
  		    widthBuffer = Math.abs(sw.lng - ne.lng) * bufferRatio;

  		return new LatLngBounds(
  		        new LatLng(sw.lat - heightBuffer, sw.lng - widthBuffer),
  		        new LatLng(ne.lat + heightBuffer, ne.lng + widthBuffer));
  	},

  	// @method getCenter(): LatLng
  	// Returns the center point of the bounds.
  	getCenter: function () {
  		return new LatLng(
  		        (this._southWest.lat + this._northEast.lat) / 2,
  		        (this._southWest.lng + this._northEast.lng) / 2);
  	},

  	// @method getSouthWest(): LatLng
  	// Returns the south-west point of the bounds.
  	getSouthWest: function () {
  		return this._southWest;
  	},

  	// @method getNorthEast(): LatLng
  	// Returns the north-east point of the bounds.
  	getNorthEast: function () {
  		return this._northEast;
  	},

  	// @method getNorthWest(): LatLng
  	// Returns the north-west point of the bounds.
  	getNorthWest: function () {
  		return new LatLng(this.getNorth(), this.getWest());
  	},

  	// @method getSouthEast(): LatLng
  	// Returns the south-east point of the bounds.
  	getSouthEast: function () {
  		return new LatLng(this.getSouth(), this.getEast());
  	},

  	// @method getWest(): Number
  	// Returns the west longitude of the bounds
  	getWest: function () {
  		return this._southWest.lng;
  	},

  	// @method getSouth(): Number
  	// Returns the south latitude of the bounds
  	getSouth: function () {
  		return this._southWest.lat;
  	},

  	// @method getEast(): Number
  	// Returns the east longitude of the bounds
  	getEast: function () {
  		return this._northEast.lng;
  	},

  	// @method getNorth(): Number
  	// Returns the north latitude of the bounds
  	getNorth: function () {
  		return this._northEast.lat;
  	},

  	// @method contains(otherBounds: LatLngBounds): Boolean
  	// Returns `true` if the rectangle contains the given one.

  	// @alternative
  	// @method contains (latlng: LatLng): Boolean
  	// Returns `true` if the rectangle contains the given point.
  	contains: function (obj) { // (LatLngBounds) or (LatLng) -> Boolean
  		if (typeof obj[0] === 'number' || obj instanceof LatLng || 'lat' in obj) {
  			obj = toLatLng(obj);
  		} else {
  			obj = toLatLngBounds(obj);
  		}

  		var sw = this._southWest,
  		    ne = this._northEast,
  		    sw2, ne2;

  		if (obj instanceof LatLngBounds) {
  			sw2 = obj.getSouthWest();
  			ne2 = obj.getNorthEast();
  		} else {
  			sw2 = ne2 = obj;
  		}

  		return (sw2.lat >= sw.lat) && (ne2.lat <= ne.lat) &&
  		       (sw2.lng >= sw.lng) && (ne2.lng <= ne.lng);
  	},

  	// @method intersects(otherBounds: LatLngBounds): Boolean
  	// Returns `true` if the rectangle intersects the given bounds. Two bounds intersect if they have at least one point in common.
  	intersects: function (bounds) {
  		bounds = toLatLngBounds(bounds);

  		var sw = this._southWest,
  		    ne = this._northEast,
  		    sw2 = bounds.getSouthWest(),
  		    ne2 = bounds.getNorthEast(),

  		    latIntersects = (ne2.lat >= sw.lat) && (sw2.lat <= ne.lat),
  		    lngIntersects = (ne2.lng >= sw.lng) && (sw2.lng <= ne.lng);

  		return latIntersects && lngIntersects;
  	},

  	// @method overlaps(otherBounds: Bounds): Boolean
  	// Returns `true` if the rectangle overlaps the given bounds. Two bounds overlap if their intersection is an area.
  	overlaps: function (bounds) {
  		bounds = toLatLngBounds(bounds);

  		var sw = this._southWest,
  		    ne = this._northEast,
  		    sw2 = bounds.getSouthWest(),
  		    ne2 = bounds.getNorthEast(),

  		    latOverlaps = (ne2.lat > sw.lat) && (sw2.lat < ne.lat),
  		    lngOverlaps = (ne2.lng > sw.lng) && (sw2.lng < ne.lng);

  		return latOverlaps && lngOverlaps;
  	},

  	// @method toBBoxString(): String
  	// Returns a string with bounding box coordinates in a 'southwest_lng,southwest_lat,northeast_lng,northeast_lat' format. Useful for sending requests to web services that return geo data.
  	toBBoxString: function () {
  		return [this.getWest(), this.getSouth(), this.getEast(), this.getNorth()].join(',');
  	},

  	// @method equals(otherBounds: LatLngBounds, maxMargin?: Number): Boolean
  	// Returns `true` if the rectangle is equivalent (within a small margin of error) to the given bounds. The margin of error can be overridden by setting `maxMargin` to a small number.
  	equals: function (bounds, maxMargin) {
  		if (!bounds) { return false; }

  		bounds = toLatLngBounds(bounds);

  		return this._southWest.equals(bounds.getSouthWest(), maxMargin) &&
  		       this._northEast.equals(bounds.getNorthEast(), maxMargin);
  	},

  	// @method isValid(): Boolean
  	// Returns `true` if the bounds are properly initialized.
  	isValid: function () {
  		return !!(this._southWest && this._northEast);
  	}
  };

  // TODO International date line?

  // @factory L.latLngBounds(corner1: LatLng, corner2: LatLng)
  // Creates a `LatLngBounds` object by defining two diagonally opposite corners of the rectangle.

  // @alternative
  // @factory L.latLngBounds(latlngs: LatLng[])
  // Creates a `LatLngBounds` object defined by the geographical points it contains. Very useful for zooming the map to fit a particular set of locations with [`fitBounds`](#map-fitbounds).
  function toLatLngBounds(a, b) {
  	if (a instanceof LatLngBounds) {
  		return a;
  	}
  	return new LatLngBounds(a, b);
  }

  /* @class LatLng
   * @aka L.LatLng
   *
   * Represents a geographical point with a certain latitude and longitude.
   *
   * @example
   *
   * ```
   * var latlng = L.latLng(50.5, 30.5);
   * ```
   *
   * All Leaflet methods that accept LatLng objects also accept them in a simple Array form and simple object form (unless noted otherwise), so these lines are equivalent:
   *
   * ```
   * map.panTo([50, 30]);
   * map.panTo({lon: 30, lat: 50});
   * map.panTo({lat: 50, lng: 30});
   * map.panTo(L.latLng(50, 30));
   * ```
   *
   * Note that `LatLng` does not inherit from Leaflet's `Class` object,
   * which means new classes can't inherit from it, and new methods
   * can't be added to it with the `include` function.
   */

  function LatLng(lat, lng, alt) {
  	if (isNaN(lat) || isNaN(lng)) {
  		throw new Error('Invalid LatLng object: (' + lat + ', ' + lng + ')');
  	}

  	// @property lat: Number
  	// Latitude in degrees
  	this.lat = +lat;

  	// @property lng: Number
  	// Longitude in degrees
  	this.lng = +lng;

  	// @property alt: Number
  	// Altitude in meters (optional)
  	if (alt !== undefined) {
  		this.alt = +alt;
  	}
  }

  LatLng.prototype = {
  	// @method equals(otherLatLng: LatLng, maxMargin?: Number): Boolean
  	// Returns `true` if the given `LatLng` point is at the same position (within a small margin of error). The margin of error can be overridden by setting `maxMargin` to a small number.
  	equals: function (obj, maxMargin) {
  		if (!obj) { return false; }

  		obj = toLatLng(obj);

  		var margin = Math.max(
  		        Math.abs(this.lat - obj.lat),
  		        Math.abs(this.lng - obj.lng));

  		return margin <= (maxMargin === undefined ? 1.0E-9 : maxMargin);
  	},

  	// @method toString(): String
  	// Returns a string representation of the point (for debugging purposes).
  	toString: function (precision) {
  		return 'LatLng(' +
  		        formatNum(this.lat, precision) + ', ' +
  		        formatNum(this.lng, precision) + ')';
  	},

  	// @method distanceTo(otherLatLng: LatLng): Number
  	// Returns the distance (in meters) to the given `LatLng` calculated using the [Spherical Law of Cosines](https://en.wikipedia.org/wiki/Spherical_law_of_cosines).
  	distanceTo: function (other) {
  		return Earth.distance(this, toLatLng(other));
  	},

  	// @method wrap(): LatLng
  	// Returns a new `LatLng` object with the longitude wrapped so it's always between -180 and +180 degrees.
  	wrap: function () {
  		return Earth.wrapLatLng(this);
  	},

  	// @method toBounds(sizeInMeters: Number): LatLngBounds
  	// Returns a new `LatLngBounds` object in which each boundary is `sizeInMeters/2` meters apart from the `LatLng`.
  	toBounds: function (sizeInMeters) {
  		var latAccuracy = 180 * sizeInMeters / 40075017,
  		    lngAccuracy = latAccuracy / Math.cos((Math.PI / 180) * this.lat);

  		return toLatLngBounds(
  		        [this.lat - latAccuracy, this.lng - lngAccuracy],
  		        [this.lat + latAccuracy, this.lng + lngAccuracy]);
  	},

  	clone: function () {
  		return new LatLng(this.lat, this.lng, this.alt);
  	}
  };



  // @factory L.latLng(latitude: Number, longitude: Number, altitude?: Number): LatLng
  // Creates an object representing a geographical point with the given latitude and longitude (and optionally altitude).

  // @alternative
  // @factory L.latLng(coords: Array): LatLng
  // Expects an array of the form `[Number, Number]` or `[Number, Number, Number]` instead.

  // @alternative
  // @factory L.latLng(coords: Object): LatLng
  // Expects an plain object of the form `{lat: Number, lng: Number}` or `{lat: Number, lng: Number, alt: Number}` instead.

  function toLatLng(a, b, c) {
  	if (a instanceof LatLng) {
  		return a;
  	}
  	if (isArray(a) && typeof a[0] !== 'object') {
  		if (a.length === 3) {
  			return new LatLng(a[0], a[1], a[2]);
  		}
  		if (a.length === 2) {
  			return new LatLng(a[0], a[1]);
  		}
  		return null;
  	}
  	if (a === undefined || a === null) {
  		return a;
  	}
  	if (typeof a === 'object' && 'lat' in a) {
  		return new LatLng(a.lat, 'lng' in a ? a.lng : a.lon, a.alt);
  	}
  	if (b === undefined) {
  		return null;
  	}
  	return new LatLng(a, b, c);
  }

  /*
   * @namespace CRS
   * @crs L.CRS.Base
   * Object that defines coordinate reference systems for projecting
   * geographical points into pixel (screen) coordinates and back (and to
   * coordinates in other units for [WMS](https://en.wikipedia.org/wiki/Web_Map_Service) services). See
   * [spatial reference system](http://en.wikipedia.org/wiki/Coordinate_reference_system).
   *
   * Leaflet defines the most usual CRSs by default. If you want to use a
   * CRS not defined by default, take a look at the
   * [Proj4Leaflet](https://github.com/kartena/Proj4Leaflet) plugin.
   *
   * Note that the CRS instances do not inherit from Leafet's `Class` object,
   * and can't be instantiated. Also, new classes can't inherit from them,
   * and methods can't be added to them with the `include` function.
   */

  var CRS = {
  	// @method latLngToPoint(latlng: LatLng, zoom: Number): Point
  	// Projects geographical coordinates into pixel coordinates for a given zoom.
  	latLngToPoint: function (latlng, zoom) {
  		var projectedPoint = this.projection.project(latlng),
  		    scale = this.scale(zoom);

  		return this.transformation._transform(projectedPoint, scale);
  	},

  	// @method pointToLatLng(point: Point, zoom: Number): LatLng
  	// The inverse of `latLngToPoint`. Projects pixel coordinates on a given
  	// zoom into geographical coordinates.
  	pointToLatLng: function (point, zoom) {
  		var scale = this.scale(zoom),
  		    untransformedPoint = this.transformation.untransform(point, scale);

  		return this.projection.unproject(untransformedPoint);
  	},

  	// @method project(latlng: LatLng): Point
  	// Projects geographical coordinates into coordinates in units accepted for
  	// this CRS (e.g. meters for EPSG:3857, for passing it to WMS services).
  	project: function (latlng) {
  		return this.projection.project(latlng);
  	},

  	// @method unproject(point: Point): LatLng
  	// Given a projected coordinate returns the corresponding LatLng.
  	// The inverse of `project`.
  	unproject: function (point) {
  		return this.projection.unproject(point);
  	},

  	// @method scale(zoom: Number): Number
  	// Returns the scale used when transforming projected coordinates into
  	// pixel coordinates for a particular zoom. For example, it returns
  	// `256 * 2^zoom` for Mercator-based CRS.
  	scale: function (zoom) {
  		return 256 * Math.pow(2, zoom);
  	},

  	// @method zoom(scale: Number): Number
  	// Inverse of `scale()`, returns the zoom level corresponding to a scale
  	// factor of `scale`.
  	zoom: function (scale) {
  		return Math.log(scale / 256) / Math.LN2;
  	},

  	// @method getProjectedBounds(zoom: Number): Bounds
  	// Returns the projection's bounds scaled and transformed for the provided `zoom`.
  	getProjectedBounds: function (zoom) {
  		if (this.infinite) { return null; }

  		var b = this.projection.bounds,
  		    s = this.scale(zoom),
  		    min = this.transformation.transform(b.min, s),
  		    max = this.transformation.transform(b.max, s);

  		return new Bounds(min, max);
  	},

  	// @method distance(latlng1: LatLng, latlng2: LatLng): Number
  	// Returns the distance between two geographical coordinates.

  	// @property code: String
  	// Standard code name of the CRS passed into WMS services (e.g. `'EPSG:3857'`)
  	//
  	// @property wrapLng: Number[]
  	// An array of two numbers defining whether the longitude (horizontal) coordinate
  	// axis wraps around a given range and how. Defaults to `[-180, 180]` in most
  	// geographical CRSs. If `undefined`, the longitude axis does not wrap around.
  	//
  	// @property wrapLat: Number[]
  	// Like `wrapLng`, but for the latitude (vertical) axis.

  	// wrapLng: [min, max],
  	// wrapLat: [min, max],

  	// @property infinite: Boolean
  	// If true, the coordinate space will be unbounded (infinite in both axes)
  	infinite: false,

  	// @method wrapLatLng(latlng: LatLng): LatLng
  	// Returns a `LatLng` where lat and lng has been wrapped according to the
  	// CRS's `wrapLat` and `wrapLng` properties, if they are outside the CRS's bounds.
  	wrapLatLng: function (latlng) {
  		var lng = this.wrapLng ? wrapNum(latlng.lng, this.wrapLng, true) : latlng.lng,
  		    lat = this.wrapLat ? wrapNum(latlng.lat, this.wrapLat, true) : latlng.lat,
  		    alt = latlng.alt;

  		return new LatLng(lat, lng, alt);
  	},

  	// @method wrapLatLngBounds(bounds: LatLngBounds): LatLngBounds
  	// Returns a `LatLngBounds` with the same size as the given one, ensuring
  	// that its center is within the CRS's bounds.
  	// Only accepts actual `L.LatLngBounds` instances, not arrays.
  	wrapLatLngBounds: function (bounds) {
  		var center = bounds.getCenter(),
  		    newCenter = this.wrapLatLng(center),
  		    latShift = center.lat - newCenter.lat,
  		    lngShift = center.lng - newCenter.lng;

  		if (latShift === 0 && lngShift === 0) {
  			return bounds;
  		}

  		var sw = bounds.getSouthWest(),
  		    ne = bounds.getNorthEast(),
  		    newSw = new LatLng(sw.lat - latShift, sw.lng - lngShift),
  		    newNe = new LatLng(ne.lat - latShift, ne.lng - lngShift);

  		return new LatLngBounds(newSw, newNe);
  	}
  };

  /*
   * @namespace CRS
   * @crs L.CRS.Earth
   *
   * Serves as the base for CRS that are global such that they cover the earth.
   * Can only be used as the base for other CRS and cannot be used directly,
   * since it does not have a `code`, `projection` or `transformation`. `distance()` returns
   * meters.
   */

  var Earth = extend({}, CRS, {
  	wrapLng: [-180, 180],

  	// Mean Earth Radius, as recommended for use by
  	// the International Union of Geodesy and Geophysics,
  	// see http://rosettacode.org/wiki/Haversine_formula
  	R: 6371000,

  	// distance between two geographical points using spherical law of cosines approximation
  	distance: function (latlng1, latlng2) {
  		var rad = Math.PI / 180,
  		    lat1 = latlng1.lat * rad,
  		    lat2 = latlng2.lat * rad,
  		    sinDLat = Math.sin((latlng2.lat - latlng1.lat) * rad / 2),
  		    sinDLon = Math.sin((latlng2.lng - latlng1.lng) * rad / 2),
  		    a = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon,
  		    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  		return this.R * c;
  	}
  });

  /*
   * @namespace Projection
   * @projection L.Projection.SphericalMercator
   *
   * Spherical Mercator projection — the most common projection for online maps,
   * used by almost all free and commercial tile providers. Assumes that Earth is
   * a sphere. Used by the `EPSG:3857` CRS.
   */

  var earthRadius = 6378137;

  var SphericalMercator = {

  	R: earthRadius,
  	MAX_LATITUDE: 85.0511287798,

  	project: function (latlng) {
  		var d = Math.PI / 180,
  		    max = this.MAX_LATITUDE,
  		    lat = Math.max(Math.min(max, latlng.lat), -max),
  		    sin = Math.sin(lat * d);

  		return new Point(
  			this.R * latlng.lng * d,
  			this.R * Math.log((1 + sin) / (1 - sin)) / 2);
  	},

  	unproject: function (point) {
  		var d = 180 / Math.PI;

  		return new LatLng(
  			(2 * Math.atan(Math.exp(point.y / this.R)) - (Math.PI / 2)) * d,
  			point.x * d / this.R);
  	},

  	bounds: (function () {
  		var d = earthRadius * Math.PI;
  		return new Bounds([-d, -d], [d, d]);
  	})()
  };

  /*
   * @class Transformation
   * @aka L.Transformation
   *
   * Represents an affine transformation: a set of coefficients `a`, `b`, `c`, `d`
   * for transforming a point of a form `(x, y)` into `(a*x + b, c*y + d)` and doing
   * the reverse. Used by Leaflet in its projections code.
   *
   * @example
   *
   * ```js
   * var transformation = L.transformation(2, 5, -1, 10),
   * 	p = L.point(1, 2),
   * 	p2 = transformation.transform(p), //  L.point(7, 8)
   * 	p3 = transformation.untransform(p2); //  L.point(1, 2)
   * ```
   */


  // factory new L.Transformation(a: Number, b: Number, c: Number, d: Number)
  // Creates a `Transformation` object with the given coefficients.
  function Transformation(a, b, c, d) {
  	if (isArray(a)) {
  		// use array properties
  		this._a = a[0];
  		this._b = a[1];
  		this._c = a[2];
  		this._d = a[3];
  		return;
  	}
  	this._a = a;
  	this._b = b;
  	this._c = c;
  	this._d = d;
  }

  Transformation.prototype = {
  	// @method transform(point: Point, scale?: Number): Point
  	// Returns a transformed point, optionally multiplied by the given scale.
  	// Only accepts actual `L.Point` instances, not arrays.
  	transform: function (point, scale) { // (Point, Number) -> Point
  		return this._transform(point.clone(), scale);
  	},

  	// destructive transform (faster)
  	_transform: function (point, scale) {
  		scale = scale || 1;
  		point.x = scale * (this._a * point.x + this._b);
  		point.y = scale * (this._c * point.y + this._d);
  		return point;
  	},

  	// @method untransform(point: Point, scale?: Number): Point
  	// Returns the reverse transformation of the given point, optionally divided
  	// by the given scale. Only accepts actual `L.Point` instances, not arrays.
  	untransform: function (point, scale) {
  		scale = scale || 1;
  		return new Point(
  		        (point.x / scale - this._b) / this._a,
  		        (point.y / scale - this._d) / this._c);
  	}
  };

  // factory L.transformation(a: Number, b: Number, c: Number, d: Number)

  // @factory L.transformation(a: Number, b: Number, c: Number, d: Number)
  // Instantiates a Transformation object with the given coefficients.

  // @alternative
  // @factory L.transformation(coefficients: Array): Transformation
  // Expects an coefficients array of the form
  // `[a: Number, b: Number, c: Number, d: Number]`.

  function toTransformation(a, b, c, d) {
  	return new Transformation(a, b, c, d);
  }

  /*
   * @namespace CRS
   * @crs L.CRS.EPSG3857
   *
   * The most common CRS for online maps, used by almost all free and commercial
   * tile providers. Uses Spherical Mercator projection. Set in by default in
   * Map's `crs` option.
   */

  var EPSG3857 = extend({}, Earth, {
  	code: 'EPSG:3857',
  	projection: SphericalMercator,

  	transformation: (function () {
  		var scale = 0.5 / (Math.PI * SphericalMercator.R);
  		return toTransformation(scale, 0.5, -scale, 0.5);
  	}())
  });

  var EPSG900913 = extend({}, EPSG3857, {
  	code: 'EPSG:900913'
  });

  // @namespace SVG; @section
  // There are several static functions which can be called without instantiating L.SVG:

  // @function create(name: String): SVGElement
  // Returns a instance of [SVGElement](https://developer.mozilla.org/docs/Web/API/SVGElement),
  // corresponding to the class name passed. For example, using 'line' will return
  // an instance of [SVGLineElement](https://developer.mozilla.org/docs/Web/API/SVGLineElement).
  function svgCreate(name) {
  	return document.createElementNS('http://www.w3.org/2000/svg', name);
  }

  // @function pointsToPath(rings: Point[], closed: Boolean): String
  // Generates a SVG path string for multiple rings, with each ring turning
  // into "M..L..L.." instructions
  function pointsToPath(rings, closed) {
  	var str = '',
  	i, j, len, len2, points, p;

  	for (i = 0, len = rings.length; i < len; i++) {
  		points = rings[i];

  		for (j = 0, len2 = points.length; j < len2; j++) {
  			p = points[j];
  			str += (j ? 'L' : 'M') + p.x + ' ' + p.y;
  		}

  		// closes the ring for polygons; "x" is VML syntax
  		str += closed ? (svg ? 'z' : 'x') : '';
  	}

  	// SVG complains about empty path strings
  	return str || 'M0 0';
  }

  /*
   * @namespace Browser
   * @aka L.Browser
   *
   * A namespace with static properties for browser/feature detection used by Leaflet internally.
   *
   * @example
   *
   * ```js
   * if (L.Browser.ielt9) {
   *   alert('Upgrade your browser, dude!');
   * }
   * ```
   */

  var style$1 = document.documentElement.style;

  // @property ie: Boolean; `true` for all Internet Explorer versions (not Edge).
  var ie = 'ActiveXObject' in window;

  // @property ielt9: Boolean; `true` for Internet Explorer versions less than 9.
  var ielt9 = ie && !document.addEventListener;

  // @property edge: Boolean; `true` for the Edge web browser.
  var edge = 'msLaunchUri' in navigator && !('documentMode' in document);

  // @property webkit: Boolean;
  // `true` for webkit-based browsers like Chrome and Safari (including mobile versions).
  var webkit = userAgentContains('webkit');

  // @property android: Boolean
  // `true` for any browser running on an Android platform.
  var android = userAgentContains('android');

  // @property android23: Boolean; `true` for browsers running on Android 2 or Android 3.
  var android23 = userAgentContains('android 2') || userAgentContains('android 3');

  /* See https://stackoverflow.com/a/17961266 for details on detecting stock Android */
  var webkitVer = parseInt(/WebKit\/([0-9]+)|$/.exec(navigator.userAgent)[1], 10); // also matches AppleWebKit
  // @property androidStock: Boolean; `true` for the Android stock browser (i.e. not Chrome)
  var androidStock = android && userAgentContains('Google') && webkitVer < 537 && !('AudioNode' in window);

  // @property opera: Boolean; `true` for the Opera browser
  var opera = !!window.opera;

  // @property chrome: Boolean; `true` for the Chrome browser.
  var chrome = userAgentContains('chrome');

  // @property gecko: Boolean; `true` for gecko-based browsers like Firefox.
  var gecko = userAgentContains('gecko') && !webkit && !opera && !ie;

  // @property safari: Boolean; `true` for the Safari browser.
  var safari = !chrome && userAgentContains('safari');

  var phantom = userAgentContains('phantom');

  // @property opera12: Boolean
  // `true` for the Opera browser supporting CSS transforms (version 12 or later).
  var opera12 = 'OTransition' in style$1;

  // @property win: Boolean; `true` when the browser is running in a Windows platform
  var win = navigator.platform.indexOf('Win') === 0;

  // @property ie3d: Boolean; `true` for all Internet Explorer versions supporting CSS transforms.
  var ie3d = ie && ('transition' in style$1);

  // @property webkit3d: Boolean; `true` for webkit-based browsers supporting CSS transforms.
  var webkit3d = ('WebKitCSSMatrix' in window) && ('m11' in new window.WebKitCSSMatrix()) && !android23;

  // @property gecko3d: Boolean; `true` for gecko-based browsers supporting CSS transforms.
  var gecko3d = 'MozPerspective' in style$1;

  // @property any3d: Boolean
  // `true` for all browsers supporting CSS transforms.
  var any3d = !window.L_DISABLE_3D && (ie3d || webkit3d || gecko3d) && !opera12 && !phantom;

  // @property mobile: Boolean; `true` for all browsers running in a mobile device.
  var mobile = typeof orientation !== 'undefined' || userAgentContains('mobile');

  // @property mobileWebkit: Boolean; `true` for all webkit-based browsers in a mobile device.
  var mobileWebkit = mobile && webkit;

  // @property mobileWebkit3d: Boolean
  // `true` for all webkit-based browsers in a mobile device supporting CSS transforms.
  var mobileWebkit3d = mobile && webkit3d;

  // @property msPointer: Boolean
  // `true` for browsers implementing the Microsoft touch events model (notably IE10).
  var msPointer = !window.PointerEvent && window.MSPointerEvent;

  // @property pointer: Boolean
  // `true` for all browsers supporting [pointer events](https://msdn.microsoft.com/en-us/library/dn433244%28v=vs.85%29.aspx).
  var pointer = !webkit && !!(window.PointerEvent || msPointer);

  // @property touch: Boolean
  // `true` for all browsers supporting [touch events](https://developer.mozilla.org/docs/Web/API/Touch_events).
  // This does not necessarily mean that the browser is running in a computer with
  // a touchscreen, it only means that the browser is capable of understanding
  // touch events.
  var touch = !window.L_NO_TOUCH && (pointer || 'ontouchstart' in window ||
  		(window.DocumentTouch && document instanceof window.DocumentTouch));

  // @property mobileOpera: Boolean; `true` for the Opera browser in a mobile device.
  var mobileOpera = mobile && opera;

  // @property mobileGecko: Boolean
  // `true` for gecko-based browsers running in a mobile device.
  var mobileGecko = mobile && gecko;

  // @property retina: Boolean
  // `true` for browsers on a high-resolution "retina" screen or on any screen when browser's display zoom is more than 100%.
  var retina = (window.devicePixelRatio || (window.screen.deviceXDPI / window.screen.logicalXDPI)) > 1;

  // @property passiveEvents: Boolean
  // `true` for browsers that support passive events.
  var passiveEvents = (function () {
  	var supportsPassiveOption = false;
  	try {
  		var opts = Object.defineProperty({}, 'passive', {
  			get: function () {
  				supportsPassiveOption = true;
  			}
  		});
  		window.addEventListener('testPassiveEventSupport', falseFn, opts);
  		window.removeEventListener('testPassiveEventSupport', falseFn, opts);
  	} catch (e) {
  		// Errors can safely be ignored since this is only a browser support test.
  	}
  	return supportsPassiveOption;
  });

  // @property canvas: Boolean
  // `true` when the browser supports [`<canvas>`](https://developer.mozilla.org/docs/Web/API/Canvas_API).
  var canvas = (function () {
  	return !!document.createElement('canvas').getContext;
  }());

  // @property svg: Boolean
  // `true` when the browser supports [SVG](https://developer.mozilla.org/docs/Web/SVG).
  var svg = !!(document.createElementNS && svgCreate('svg').createSVGRect);

  // @property vml: Boolean
  // `true` if the browser supports [VML](https://en.wikipedia.org/wiki/Vector_Markup_Language).
  var vml = !svg && (function () {
  	try {
  		var div = document.createElement('div');
  		div.innerHTML = '<v:shape adj="1"/>';

  		var shape = div.firstChild;
  		shape.style.behavior = 'url(#default#VML)';

  		return shape && (typeof shape.adj === 'object');

  	} catch (e) {
  		return false;
  	}
  }());


  function userAgentContains(str) {
  	return navigator.userAgent.toLowerCase().indexOf(str) >= 0;
  }


  var Browser = (Object.freeze || Object)({
  	ie: ie,
  	ielt9: ielt9,
  	edge: edge,
  	webkit: webkit,
  	android: android,
  	android23: android23,
  	androidStock: androidStock,
  	opera: opera,
  	chrome: chrome,
  	gecko: gecko,
  	safari: safari,
  	phantom: phantom,
  	opera12: opera12,
  	win: win,
  	ie3d: ie3d,
  	webkit3d: webkit3d,
  	gecko3d: gecko3d,
  	any3d: any3d,
  	mobile: mobile,
  	mobileWebkit: mobileWebkit,
  	mobileWebkit3d: mobileWebkit3d,
  	msPointer: msPointer,
  	pointer: pointer,
  	touch: touch,
  	mobileOpera: mobileOpera,
  	mobileGecko: mobileGecko,
  	retina: retina,
  	passiveEvents: passiveEvents,
  	canvas: canvas,
  	svg: svg,
  	vml: vml
  });

  /*
   * Extends L.DomEvent to provide touch support for Internet Explorer and Windows-based devices.
   */


  var POINTER_DOWN =   msPointer ? 'MSPointerDown'   : 'pointerdown';
  var POINTER_MOVE =   msPointer ? 'MSPointerMove'   : 'pointermove';
  var POINTER_UP =     msPointer ? 'MSPointerUp'     : 'pointerup';
  var POINTER_CANCEL = msPointer ? 'MSPointerCancel' : 'pointercancel';
  var TAG_WHITE_LIST = ['INPUT', 'SELECT', 'OPTION'];

  var _pointers = {};
  var _pointerDocListener = false;

  // DomEvent.DoubleTap needs to know about this
  var _pointersCount = 0;

  // Provides a touch events wrapper for (ms)pointer events.
  // ref http://www.w3.org/TR/pointerevents/ https://www.w3.org/Bugs/Public/show_bug.cgi?id=22890

  function addPointerListener(obj, type, handler, id) {
  	if (type === 'touchstart') {
  		_addPointerStart(obj, handler, id);

  	} else if (type === 'touchmove') {
  		_addPointerMove(obj, handler, id);

  	} else if (type === 'touchend') {
  		_addPointerEnd(obj, handler, id);
  	}

  	return this;
  }

  function removePointerListener(obj, type, id) {
  	var handler = obj['_leaflet_' + type + id];

  	if (type === 'touchstart') {
  		obj.removeEventListener(POINTER_DOWN, handler, false);

  	} else if (type === 'touchmove') {
  		obj.removeEventListener(POINTER_MOVE, handler, false);

  	} else if (type === 'touchend') {
  		obj.removeEventListener(POINTER_UP, handler, false);
  		obj.removeEventListener(POINTER_CANCEL, handler, false);
  	}

  	return this;
  }

  function _addPointerStart(obj, handler, id) {
  	var onDown = bind(function (e) {
  		if (e.pointerType !== 'mouse' && e.MSPOINTER_TYPE_MOUSE && e.pointerType !== e.MSPOINTER_TYPE_MOUSE) {
  			// In IE11, some touch events needs to fire for form controls, or
  			// the controls will stop working. We keep a whitelist of tag names that
  			// need these events. For other target tags, we prevent default on the event.
  			if (TAG_WHITE_LIST.indexOf(e.target.tagName) < 0) {
  				preventDefault(e);
  			} else {
  				return;
  			}
  		}

  		_handlePointer(e, handler);
  	});

  	obj['_leaflet_touchstart' + id] = onDown;
  	obj.addEventListener(POINTER_DOWN, onDown, false);

  	// need to keep track of what pointers and how many are active to provide e.touches emulation
  	if (!_pointerDocListener) {
  		// we listen documentElement as any drags that end by moving the touch off the screen get fired there
  		document.documentElement.addEventListener(POINTER_DOWN, _globalPointerDown, true);
  		document.documentElement.addEventListener(POINTER_MOVE, _globalPointerMove, true);
  		document.documentElement.addEventListener(POINTER_UP, _globalPointerUp, true);
  		document.documentElement.addEventListener(POINTER_CANCEL, _globalPointerUp, true);

  		_pointerDocListener = true;
  	}
  }

  function _globalPointerDown(e) {
  	_pointers[e.pointerId] = e;
  	_pointersCount++;
  }

  function _globalPointerMove(e) {
  	if (_pointers[e.pointerId]) {
  		_pointers[e.pointerId] = e;
  	}
  }

  function _globalPointerUp(e) {
  	delete _pointers[e.pointerId];
  	_pointersCount--;
  }

  function _handlePointer(e, handler) {
  	e.touches = [];
  	for (var i in _pointers) {
  		e.touches.push(_pointers[i]);
  	}
  	e.changedTouches = [e];

  	handler(e);
  }

  function _addPointerMove(obj, handler, id) {
  	var onMove = function (e) {
  		// don't fire touch moves when mouse isn't down
  		if ((e.pointerType === e.MSPOINTER_TYPE_MOUSE || e.pointerType === 'mouse') && e.buttons === 0) { return; }

  		_handlePointer(e, handler);
  	};

  	obj['_leaflet_touchmove' + id] = onMove;
  	obj.addEventListener(POINTER_MOVE, onMove, false);
  }

  function _addPointerEnd(obj, handler, id) {
  	var onUp = function (e) {
  		_handlePointer(e, handler);
  	};

  	obj['_leaflet_touchend' + id] = onUp;
  	obj.addEventListener(POINTER_UP, onUp, false);
  	obj.addEventListener(POINTER_CANCEL, onUp, false);
  }

  /*
   * Extends the event handling code with double tap support for mobile browsers.
   */

  var _touchstart = msPointer ? 'MSPointerDown' : pointer ? 'pointerdown' : 'touchstart';
  var _touchend = msPointer ? 'MSPointerUp' : pointer ? 'pointerup' : 'touchend';
  var _pre = '_leaflet_';

  // inspired by Zepto touch code by Thomas Fuchs
  function addDoubleTapListener(obj, handler, id) {
  	var last, touch$$1,
  	    doubleTap = false,
  	    delay = 250;

  	function onTouchStart(e) {
  		var count;

  		if (pointer) {
  			if ((!edge) || e.pointerType === 'mouse') { return; }
  			count = _pointersCount;
  		} else {
  			count = e.touches.length;
  		}

  		if (count > 1) { return; }

  		var now = Date.now(),
  		    delta = now - (last || now);

  		touch$$1 = e.touches ? e.touches[0] : e;
  		doubleTap = (delta > 0 && delta <= delay);
  		last = now;
  	}

  	function onTouchEnd(e) {
  		if (doubleTap && !touch$$1.cancelBubble) {
  			if (pointer) {
  				if ((!edge) || e.pointerType === 'mouse') { return; }
  				// work around .type being readonly with MSPointer* events
  				var newTouch = {},
  				    prop, i;

  				for (i in touch$$1) {
  					prop = touch$$1[i];
  					newTouch[i] = prop && prop.bind ? prop.bind(touch$$1) : prop;
  				}
  				touch$$1 = newTouch;
  			}
  			touch$$1.type = 'dblclick';
  			touch$$1.button = 0;
  			handler(touch$$1);
  			last = null;
  		}
  	}

  	obj[_pre + _touchstart + id] = onTouchStart;
  	obj[_pre + _touchend + id] = onTouchEnd;
  	obj[_pre + 'dblclick' + id] = handler;

  	obj.addEventListener(_touchstart, onTouchStart, passiveEvents ? {passive: false} : false);
  	obj.addEventListener(_touchend, onTouchEnd, passiveEvents ? {passive: false} : false);

  	// On some platforms (notably, chrome<55 on win10 + touchscreen + mouse),
  	// the browser doesn't fire touchend/pointerup events but does fire
  	// native dblclicks. See #4127.
  	// Edge 14 also fires native dblclicks, but only for pointerType mouse, see #5180.
  	obj.addEventListener('dblclick', handler, false);

  	return this;
  }

  function removeDoubleTapListener(obj, id) {
  	var touchstart = obj[_pre + _touchstart + id],
  	    touchend = obj[_pre + _touchend + id],
  	    dblclick = obj[_pre + 'dblclick' + id];

  	obj.removeEventListener(_touchstart, touchstart, passiveEvents ? {passive: false} : false);
  	obj.removeEventListener(_touchend, touchend, passiveEvents ? {passive: false} : false);
  	if (!edge) {
  		obj.removeEventListener('dblclick', dblclick, false);
  	}

  	return this;
  }

  /*
   * @namespace DomUtil
   *
   * Utility functions to work with the [DOM](https://developer.mozilla.org/docs/Web/API/Document_Object_Model)
   * tree, used by Leaflet internally.
   *
   * Most functions expecting or returning a `HTMLElement` also work for
   * SVG elements. The only difference is that classes refer to CSS classes
   * in HTML and SVG classes in SVG.
   */


  // @property TRANSFORM: String
  // Vendor-prefixed transform style name (e.g. `'webkitTransform'` for WebKit).
  var TRANSFORM = testProp(
  	['transform', 'webkitTransform', 'OTransform', 'MozTransform', 'msTransform']);

  // webkitTransition comes first because some browser versions that drop vendor prefix don't do
  // the same for the transitionend event, in particular the Android 4.1 stock browser

  // @property TRANSITION: String
  // Vendor-prefixed transition style name.
  var TRANSITION = testProp(
  	['webkitTransition', 'transition', 'OTransition', 'MozTransition', 'msTransition']);

  // @property TRANSITION_END: String
  // Vendor-prefixed transitionend event name.
  var TRANSITION_END =
  	TRANSITION === 'webkitTransition' || TRANSITION === 'OTransition' ? TRANSITION + 'End' : 'transitionend';


  // @function get(id: String|HTMLElement): HTMLElement
  // Returns an element given its DOM id, or returns the element itself
  // if it was passed directly.
  function get(id) {
  	return typeof id === 'string' ? document.getElementById(id) : id;
  }

  // @function getStyle(el: HTMLElement, styleAttrib: String): String
  // Returns the value for a certain style attribute on an element,
  // including computed values or values set through CSS.
  function getStyle(el, style) {
  	var value = el.style[style] || (el.currentStyle && el.currentStyle[style]);

  	if ((!value || value === 'auto') && document.defaultView) {
  		var css = document.defaultView.getComputedStyle(el, null);
  		value = css ? css[style] : null;
  	}
  	return value === 'auto' ? null : value;
  }

  // @function create(tagName: String, className?: String, container?: HTMLElement): HTMLElement
  // Creates an HTML element with `tagName`, sets its class to `className`, and optionally appends it to `container` element.
  function create$1(tagName, className, container) {
  	var el = document.createElement(tagName);
  	el.className = className || '';

  	if (container) {
  		container.appendChild(el);
  	}
  	return el;
  }

  // @function remove(el: HTMLElement)
  // Removes `el` from its parent element
  function remove(el) {
  	var parent = el.parentNode;
  	if (parent) {
  		parent.removeChild(el);
  	}
  }

  // @function empty(el: HTMLElement)
  // Removes all of `el`'s children elements from `el`
  function empty(el) {
  	while (el.firstChild) {
  		el.removeChild(el.firstChild);
  	}
  }

  // @function toFront(el: HTMLElement)
  // Makes `el` the last child of its parent, so it renders in front of the other children.
  function toFront(el) {
  	var parent = el.parentNode;
  	if (parent && parent.lastChild !== el) {
  		parent.appendChild(el);
  	}
  }

  // @function toBack(el: HTMLElement)
  // Makes `el` the first child of its parent, so it renders behind the other children.
  function toBack(el) {
  	var parent = el.parentNode;
  	if (parent && parent.firstChild !== el) {
  		parent.insertBefore(el, parent.firstChild);
  	}
  }

  // @function hasClass(el: HTMLElement, name: String): Boolean
  // Returns `true` if the element's class attribute contains `name`.
  function hasClass(el, name) {
  	if (el.classList !== undefined) {
  		return el.classList.contains(name);
  	}
  	var className = getClass(el);
  	return className.length > 0 && new RegExp('(^|\\s)' + name + '(\\s|$)').test(className);
  }

  // @function addClass(el: HTMLElement, name: String)
  // Adds `name` to the element's class attribute.
  function addClass(el, name) {
  	if (el.classList !== undefined) {
  		var classes = splitWords(name);
  		for (var i = 0, len = classes.length; i < len; i++) {
  			el.classList.add(classes[i]);
  		}
  	} else if (!hasClass(el, name)) {
  		var className = getClass(el);
  		setClass(el, (className ? className + ' ' : '') + name);
  	}
  }

  // @function removeClass(el: HTMLElement, name: String)
  // Removes `name` from the element's class attribute.
  function removeClass(el, name) {
  	if (el.classList !== undefined) {
  		el.classList.remove(name);
  	} else {
  		setClass(el, trim((' ' + getClass(el) + ' ').replace(' ' + name + ' ', ' ')));
  	}
  }

  // @function setClass(el: HTMLElement, name: String)
  // Sets the element's class.
  function setClass(el, name) {
  	if (el.className.baseVal === undefined) {
  		el.className = name;
  	} else {
  		// in case of SVG element
  		el.className.baseVal = name;
  	}
  }

  // @function getClass(el: HTMLElement): String
  // Returns the element's class.
  function getClass(el) {
  	// Check if the element is an SVGElementInstance and use the correspondingElement instead
  	// (Required for linked SVG elements in IE11.)
  	if (el.correspondingElement) {
  		el = el.correspondingElement;
  	}
  	return el.className.baseVal === undefined ? el.className : el.className.baseVal;
  }

  // @function setOpacity(el: HTMLElement, opacity: Number)
  // Set the opacity of an element (including old IE support).
  // `opacity` must be a number from `0` to `1`.
  function setOpacity(el, value) {
  	if ('opacity' in el.style) {
  		el.style.opacity = value;
  	} else if ('filter' in el.style) {
  		_setOpacityIE(el, value);
  	}
  }

  function _setOpacityIE(el, value) {
  	var filter = false,
  	    filterName = 'DXImageTransform.Microsoft.Alpha';

  	// filters collection throws an error if we try to retrieve a filter that doesn't exist
  	try {
  		filter = el.filters.item(filterName);
  	} catch (e) {
  		// don't set opacity to 1 if we haven't already set an opacity,
  		// it isn't needed and breaks transparent pngs.
  		if (value === 1) { return; }
  	}

  	value = Math.round(value * 100);

  	if (filter) {
  		filter.Enabled = (value !== 100);
  		filter.Opacity = value;
  	} else {
  		el.style.filter += ' progid:' + filterName + '(opacity=' + value + ')';
  	}
  }

  // @function testProp(props: String[]): String|false
  // Goes through the array of style names and returns the first name
  // that is a valid style name for an element. If no such name is found,
  // it returns false. Useful for vendor-prefixed styles like `transform`.
  function testProp(props) {
  	var style = document.documentElement.style;

  	for (var i = 0; i < props.length; i++) {
  		if (props[i] in style) {
  			return props[i];
  		}
  	}
  	return false;
  }

  // @function setTransform(el: HTMLElement, offset: Point, scale?: Number)
  // Resets the 3D CSS transform of `el` so it is translated by `offset` pixels
  // and optionally scaled by `scale`. Does not have an effect if the
  // browser doesn't support 3D CSS transforms.
  function setTransform(el, offset, scale) {
  	var pos = offset || new Point(0, 0);

  	el.style[TRANSFORM] =
  		(ie3d ?
  			'translate(' + pos.x + 'px,' + pos.y + 'px)' :
  			'translate3d(' + pos.x + 'px,' + pos.y + 'px,0)') +
  		(scale ? ' scale(' + scale + ')' : '');
  }

  // @function setPosition(el: HTMLElement, position: Point)
  // Sets the position of `el` to coordinates specified by `position`,
  // using CSS translate or top/left positioning depending on the browser
  // (used by Leaflet internally to position its layers).
  function setPosition(el, point) {

  	/*eslint-disable */
  	el._leaflet_pos = point;
  	/* eslint-enable */

  	if (any3d) {
  		setTransform(el, point);
  	} else {
  		el.style.left = point.x + 'px';
  		el.style.top = point.y + 'px';
  	}
  }

  // @function getPosition(el: HTMLElement): Point
  // Returns the coordinates of an element previously positioned with setPosition.
  function getPosition(el) {
  	// this method is only used for elements previously positioned using setPosition,
  	// so it's safe to cache the position for performance

  	return el._leaflet_pos || new Point(0, 0);
  }

  // @function disableTextSelection()
  // Prevents the user from generating `selectstart` DOM events, usually generated
  // when the user drags the mouse through a page with text. Used internally
  // by Leaflet to override the behaviour of any click-and-drag interaction on
  // the map. Affects drag interactions on the whole document.

  // @function enableTextSelection()
  // Cancels the effects of a previous [`L.DomUtil.disableTextSelection`](#domutil-disabletextselection).
  var disableTextSelection;
  var enableTextSelection;
  var _userSelect;
  if ('onselectstart' in document) {
  	disableTextSelection = function () {
  		on(window, 'selectstart', preventDefault);
  	};
  	enableTextSelection = function () {
  		off(window, 'selectstart', preventDefault);
  	};
  } else {
  	var userSelectProperty = testProp(
  		['userSelect', 'WebkitUserSelect', 'OUserSelect', 'MozUserSelect', 'msUserSelect']);

  	disableTextSelection = function () {
  		if (userSelectProperty) {
  			var style = document.documentElement.style;
  			_userSelect = style[userSelectProperty];
  			style[userSelectProperty] = 'none';
  		}
  	};
  	enableTextSelection = function () {
  		if (userSelectProperty) {
  			document.documentElement.style[userSelectProperty] = _userSelect;
  			_userSelect = undefined;
  		}
  	};
  }

  // @function disableImageDrag()
  // As [`L.DomUtil.disableTextSelection`](#domutil-disabletextselection), but
  // for `dragstart` DOM events, usually generated when the user drags an image.
  function disableImageDrag() {
  	on(window, 'dragstart', preventDefault);
  }

  // @function enableImageDrag()
  // Cancels the effects of a previous [`L.DomUtil.disableImageDrag`](#domutil-disabletextselection).
  function enableImageDrag() {
  	off(window, 'dragstart', preventDefault);
  }

  var _outlineElement;
  var _outlineStyle;
  // @function preventOutline(el: HTMLElement)
  // Makes the [outline](https://developer.mozilla.org/docs/Web/CSS/outline)
  // of the element `el` invisible. Used internally by Leaflet to prevent
  // focusable elements from displaying an outline when the user performs a
  // drag interaction on them.
  function preventOutline(element) {
  	while (element.tabIndex === -1) {
  		element = element.parentNode;
  	}
  	if (!element.style) { return; }
  	restoreOutline();
  	_outlineElement = element;
  	_outlineStyle = element.style.outline;
  	element.style.outline = 'none';
  	on(window, 'keydown', restoreOutline);
  }

  // @function restoreOutline()
  // Cancels the effects of a previous [`L.DomUtil.preventOutline`]().
  function restoreOutline() {
  	if (!_outlineElement) { return; }
  	_outlineElement.style.outline = _outlineStyle;
  	_outlineElement = undefined;
  	_outlineStyle = undefined;
  	off(window, 'keydown', restoreOutline);
  }

  // @function getSizedParentNode(el: HTMLElement): HTMLElement
  // Finds the closest parent node which size (width and height) is not null.
  function getSizedParentNode(element) {
  	do {
  		element = element.parentNode;
  	} while ((!element.offsetWidth || !element.offsetHeight) && element !== document.body);
  	return element;
  }

  // @function getScale(el: HTMLElement): Object
  // Computes the CSS scale currently applied on the element.
  // Returns an object with `x` and `y` members as horizontal and vertical scales respectively,
  // and `boundingClientRect` as the result of [`getBoundingClientRect()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect).
  function getScale(element) {
  	var rect = element.getBoundingClientRect(); // Read-only in old browsers.

  	return {
  		x: rect.width / element.offsetWidth || 1,
  		y: rect.height / element.offsetHeight || 1,
  		boundingClientRect: rect
  	};
  }


  var DomUtil = (Object.freeze || Object)({
  	TRANSFORM: TRANSFORM,
  	TRANSITION: TRANSITION,
  	TRANSITION_END: TRANSITION_END,
  	get: get,
  	getStyle: getStyle,
  	create: create$1,
  	remove: remove,
  	empty: empty,
  	toFront: toFront,
  	toBack: toBack,
  	hasClass: hasClass,
  	addClass: addClass,
  	removeClass: removeClass,
  	setClass: setClass,
  	getClass: getClass,
  	setOpacity: setOpacity,
  	testProp: testProp,
  	setTransform: setTransform,
  	setPosition: setPosition,
  	getPosition: getPosition,
  	disableTextSelection: disableTextSelection,
  	enableTextSelection: enableTextSelection,
  	disableImageDrag: disableImageDrag,
  	enableImageDrag: enableImageDrag,
  	preventOutline: preventOutline,
  	restoreOutline: restoreOutline,
  	getSizedParentNode: getSizedParentNode,
  	getScale: getScale
  });

  /*
   * @namespace DomEvent
   * Utility functions to work with the [DOM events](https://developer.mozilla.org/docs/Web/API/Event), used by Leaflet internally.
   */

  // Inspired by John Resig, Dean Edwards and YUI addEvent implementations.

  // @function on(el: HTMLElement, types: String, fn: Function, context?: Object): this
  // Adds a listener function (`fn`) to a particular DOM event type of the
  // element `el`. You can optionally specify the context of the listener
  // (object the `this` keyword will point to). You can also pass several
  // space-separated types (e.g. `'click dblclick'`).

  // @alternative
  // @function on(el: HTMLElement, eventMap: Object, context?: Object): this
  // Adds a set of type/listener pairs, e.g. `{click: onClick, mousemove: onMouseMove}`
  function on(obj, types, fn, context) {

  	if (typeof types === 'object') {
  		for (var type in types) {
  			addOne(obj, type, types[type], fn);
  		}
  	} else {
  		types = splitWords(types);

  		for (var i = 0, len = types.length; i < len; i++) {
  			addOne(obj, types[i], fn, context);
  		}
  	}

  	return this;
  }

  var eventsKey = '_leaflet_events';

  // @function off(el: HTMLElement, types: String, fn: Function, context?: Object): this
  // Removes a previously added listener function.
  // Note that if you passed a custom context to on, you must pass the same
  // context to `off` in order to remove the listener.

  // @alternative
  // @function off(el: HTMLElement, eventMap: Object, context?: Object): this
  // Removes a set of type/listener pairs, e.g. `{click: onClick, mousemove: onMouseMove}`
  function off(obj, types, fn, context) {

  	if (typeof types === 'object') {
  		for (var type in types) {
  			removeOne(obj, type, types[type], fn);
  		}
  	} else if (types) {
  		types = splitWords(types);

  		for (var i = 0, len = types.length; i < len; i++) {
  			removeOne(obj, types[i], fn, context);
  		}
  	} else {
  		for (var j in obj[eventsKey]) {
  			removeOne(obj, j, obj[eventsKey][j]);
  		}
  		delete obj[eventsKey];
  	}

  	return this;
  }

  function addOne(obj, type, fn, context) {
  	var id = type + stamp(fn) + (context ? '_' + stamp(context) : '');

  	if (obj[eventsKey] && obj[eventsKey][id]) { return this; }

  	var handler = function (e) {
  		return fn.call(context || obj, e || window.event);
  	};

  	var originalHandler = handler;

  	if (pointer && type.indexOf('touch') === 0) {
  		// Needs DomEvent.Pointer.js
  		addPointerListener(obj, type, handler, id);

  	} else if (touch && (type === 'dblclick') && addDoubleTapListener &&
  	           !(pointer && chrome)) {
  		// Chrome >55 does not need the synthetic dblclicks from addDoubleTapListener
  		// See #5180
  		addDoubleTapListener(obj, handler, id);

  	} else if ('addEventListener' in obj) {

  		if (type === 'mousewheel') {
  			obj.addEventListener('onwheel' in obj ? 'wheel' : 'mousewheel', handler, passiveEvents ? {passive: false} : false);

  		} else if ((type === 'mouseenter') || (type === 'mouseleave')) {
  			handler = function (e) {
  				e = e || window.event;
  				if (isExternalTarget(obj, e)) {
  					originalHandler(e);
  				}
  			};
  			obj.addEventListener(type === 'mouseenter' ? 'mouseover' : 'mouseout', handler, false);

  		} else {
  			if (type === 'click' && android) {
  				handler = function (e) {
  					filterClick(e, originalHandler);
  				};
  			}
  			obj.addEventListener(type, handler, false);
  		}

  	} else if ('attachEvent' in obj) {
  		obj.attachEvent('on' + type, handler);
  	}

  	obj[eventsKey] = obj[eventsKey] || {};
  	obj[eventsKey][id] = handler;
  }

  function removeOne(obj, type, fn, context) {

  	var id = type + stamp(fn) + (context ? '_' + stamp(context) : ''),
  	    handler = obj[eventsKey] && obj[eventsKey][id];

  	if (!handler) { return this; }

  	if (pointer && type.indexOf('touch') === 0) {
  		removePointerListener(obj, type, id);

  	} else if (touch && (type === 'dblclick') && removeDoubleTapListener &&
  	           !(pointer && chrome)) {
  		removeDoubleTapListener(obj, id);

  	} else if ('removeEventListener' in obj) {

  		if (type === 'mousewheel') {
  			obj.removeEventListener('onwheel' in obj ? 'wheel' : 'mousewheel', handler, passiveEvents ? {passive: false} : false);

  		} else {
  			obj.removeEventListener(
  				type === 'mouseenter' ? 'mouseover' :
  				type === 'mouseleave' ? 'mouseout' : type, handler, false);
  		}

  	} else if ('detachEvent' in obj) {
  		obj.detachEvent('on' + type, handler);
  	}

  	obj[eventsKey][id] = null;
  }

  // @function stopPropagation(ev: DOMEvent): this
  // Stop the given event from propagation to parent elements. Used inside the listener functions:
  // ```js
  // L.DomEvent.on(div, 'click', function (ev) {
  // 	L.DomEvent.stopPropagation(ev);
  // });
  // ```
  function stopPropagation(e) {

  	if (e.stopPropagation) {
  		e.stopPropagation();
  	} else if (e.originalEvent) {  // In case of Leaflet event.
  		e.originalEvent._stopped = true;
  	} else {
  		e.cancelBubble = true;
  	}
  	skipped(e);

  	return this;
  }

  // @function disableScrollPropagation(el: HTMLElement): this
  // Adds `stopPropagation` to the element's `'mousewheel'` events (plus browser variants).
  function disableScrollPropagation(el) {
  	addOne(el, 'mousewheel', stopPropagation);
  	return this;
  }

  // @function disableClickPropagation(el: HTMLElement): this
  // Adds `stopPropagation` to the element's `'click'`, `'doubleclick'`,
  // `'mousedown'` and `'touchstart'` events (plus browser variants).
  function disableClickPropagation(el) {
  	on(el, 'mousedown touchstart dblclick', stopPropagation);
  	addOne(el, 'click', fakeStop);
  	return this;
  }

  // @function preventDefault(ev: DOMEvent): this
  // Prevents the default action of the DOM Event `ev` from happening (such as
  // following a link in the href of the a element, or doing a POST request
  // with page reload when a `<form>` is submitted).
  // Use it inside listener functions.
  function preventDefault(e) {
  	if (e.preventDefault) {
  		e.preventDefault();
  	} else {
  		e.returnValue = false;
  	}
  	return this;
  }

  // @function stop(ev: DOMEvent): this
  // Does `stopPropagation` and `preventDefault` at the same time.
  function stop(e) {
  	preventDefault(e);
  	stopPropagation(e);
  	return this;
  }

  // @function getMousePosition(ev: DOMEvent, container?: HTMLElement): Point
  // Gets normalized mouse position from a DOM event relative to the
  // `container` (border excluded) or to the whole page if not specified.
  function getMousePosition(e, container) {
  	if (!container) {
  		return new Point(e.clientX, e.clientY);
  	}

  	var scale = getScale(container),
  	    offset = scale.boundingClientRect; // left and top  values are in page scale (like the event clientX/Y)

  	return new Point(
  		// offset.left/top values are in page scale (like clientX/Y),
  		// whereas clientLeft/Top (border width) values are the original values (before CSS scale applies).
  		(e.clientX - offset.left) / scale.x - container.clientLeft,
  		(e.clientY - offset.top) / scale.y - container.clientTop
  	);
  }

  // Chrome on Win scrolls double the pixels as in other platforms (see #4538),
  // and Firefox scrolls device pixels, not CSS pixels
  var wheelPxFactor =
  	(win && chrome) ? 2 * window.devicePixelRatio :
  	gecko ? window.devicePixelRatio : 1;

  // @function getWheelDelta(ev: DOMEvent): Number
  // Gets normalized wheel delta from a mousewheel DOM event, in vertical
  // pixels scrolled (negative if scrolling down).
  // Events from pointing devices without precise scrolling are mapped to
  // a best guess of 60 pixels.
  function getWheelDelta(e) {
  	return (edge) ? e.wheelDeltaY / 2 : // Don't trust window-geometry-based delta
  	       (e.deltaY && e.deltaMode === 0) ? -e.deltaY / wheelPxFactor : // Pixels
  	       (e.deltaY && e.deltaMode === 1) ? -e.deltaY * 20 : // Lines
  	       (e.deltaY && e.deltaMode === 2) ? -e.deltaY * 60 : // Pages
  	       (e.deltaX || e.deltaZ) ? 0 :	// Skip horizontal/depth wheel events
  	       e.wheelDelta ? (e.wheelDeltaY || e.wheelDelta) / 2 : // Legacy IE pixels
  	       (e.detail && Math.abs(e.detail) < 32765) ? -e.detail * 20 : // Legacy Moz lines
  	       e.detail ? e.detail / -32765 * 60 : // Legacy Moz pages
  	       0;
  }

  var skipEvents = {};

  function fakeStop(e) {
  	// fakes stopPropagation by setting a special event flag, checked/reset with skipped(e)
  	skipEvents[e.type] = true;
  }

  function skipped(e) {
  	var events = skipEvents[e.type];
  	// reset when checking, as it's only used in map container and propagates outside of the map
  	skipEvents[e.type] = false;
  	return events;
  }

  // check if element really left/entered the event target (for mouseenter/mouseleave)
  function isExternalTarget(el, e) {

  	var related = e.relatedTarget;

  	if (!related) { return true; }

  	try {
  		while (related && (related !== el)) {
  			related = related.parentNode;
  		}
  	} catch (err) {
  		return false;
  	}
  	return (related !== el);
  }

  var lastClick;

  // this is a horrible workaround for a bug in Android where a single touch triggers two click events
  function filterClick(e, handler) {
  	var timeStamp = (e.timeStamp || (e.originalEvent && e.originalEvent.timeStamp)),
  	    elapsed = lastClick && (timeStamp - lastClick);

  	// are they closer together than 500ms yet more than 100ms?
  	// Android typically triggers them ~300ms apart while multiple listeners
  	// on the same event should be triggered far faster;
  	// or check if click is simulated on the element, and if it is, reject any non-simulated events

  	if ((elapsed && elapsed > 100 && elapsed < 500) || (e.target._simulatedClick && !e._simulated)) {
  		stop(e);
  		return;
  	}
  	lastClick = timeStamp;

  	handler(e);
  }




  var DomEvent = (Object.freeze || Object)({
  	on: on,
  	off: off,
  	stopPropagation: stopPropagation,
  	disableScrollPropagation: disableScrollPropagation,
  	disableClickPropagation: disableClickPropagation,
  	preventDefault: preventDefault,
  	stop: stop,
  	getMousePosition: getMousePosition,
  	getWheelDelta: getWheelDelta,
  	fakeStop: fakeStop,
  	skipped: skipped,
  	isExternalTarget: isExternalTarget,
  	addListener: on,
  	removeListener: off
  });

  /*
   * @class PosAnimation
   * @aka L.PosAnimation
   * @inherits Evented
   * Used internally for panning animations, utilizing CSS3 Transitions for modern browsers and a timer fallback for IE6-9.
   *
   * @example
   * ```js
   * var fx = new L.PosAnimation();
   * fx.run(el, [300, 500], 0.5);
   * ```
   *
   * @constructor L.PosAnimation()
   * Creates a `PosAnimation` object.
   *
   */

  var PosAnimation = Evented.extend({

  	// @method run(el: HTMLElement, newPos: Point, duration?: Number, easeLinearity?: Number)
  	// Run an animation of a given element to a new position, optionally setting
  	// duration in seconds (`0.25` by default) and easing linearity factor (3rd
  	// argument of the [cubic bezier curve](http://cubic-bezier.com/#0,0,.5,1),
  	// `0.5` by default).
  	run: function (el, newPos, duration, easeLinearity) {
  		this.stop();

  		this._el = el;
  		this._inProgress = true;
  		this._duration = duration || 0.25;
  		this._easeOutPower = 1 / Math.max(easeLinearity || 0.5, 0.2);

  		this._startPos = getPosition(el);
  		this._offset = newPos.subtract(this._startPos);
  		this._startTime = +new Date();

  		// @event start: Event
  		// Fired when the animation starts
  		this.fire('start');

  		this._animate();
  	},

  	// @method stop()
  	// Stops the animation (if currently running).
  	stop: function () {
  		if (!this._inProgress) { return; }

  		this._step(true);
  		this._complete();
  	},

  	_animate: function () {
  		// animation loop
  		this._animId = requestAnimFrame(this._animate, this);
  		this._step();
  	},

  	_step: function (round) {
  		var elapsed = (+new Date()) - this._startTime,
  		    duration = this._duration * 1000;

  		if (elapsed < duration) {
  			this._runFrame(this._easeOut(elapsed / duration), round);
  		} else {
  			this._runFrame(1);
  			this._complete();
  		}
  	},

  	_runFrame: function (progress, round) {
  		var pos = this._startPos.add(this._offset.multiplyBy(progress));
  		if (round) {
  			pos._round();
  		}
  		setPosition(this._el, pos);

  		// @event step: Event
  		// Fired continuously during the animation.
  		this.fire('step');
  	},

  	_complete: function () {
  		cancelAnimFrame(this._animId);

  		this._inProgress = false;
  		// @event end: Event
  		// Fired when the animation ends.
  		this.fire('end');
  	},

  	_easeOut: function (t) {
  		return 1 - Math.pow(1 - t, this._easeOutPower);
  	}
  });

  /*
   * @class Map
   * @aka L.Map
   * @inherits Evented
   *
   * The central class of the API — it is used to create a map on a page and manipulate it.
   *
   * @example
   *
   * ```js
   * // initialize the map on the "map" div with a given center and zoom
   * var map = L.map('map', {
   * 	center: [51.505, -0.09],
   * 	zoom: 13
   * });
   * ```
   *
   */

  var Map = Evented.extend({

  	options: {
  		// @section Map State Options
  		// @option crs: CRS = L.CRS.EPSG3857
  		// The [Coordinate Reference System](#crs) to use. Don't change this if you're not
  		// sure what it means.
  		crs: EPSG3857,

  		// @option center: LatLng = undefined
  		// Initial geographic center of the map
  		center: undefined,

  		// @option zoom: Number = undefined
  		// Initial map zoom level
  		zoom: undefined,

  		// @option minZoom: Number = *
  		// Minimum zoom level of the map.
  		// If not specified and at least one `GridLayer` or `TileLayer` is in the map,
  		// the lowest of their `minZoom` options will be used instead.
  		minZoom: undefined,

  		// @option maxZoom: Number = *
  		// Maximum zoom level of the map.
  		// If not specified and at least one `GridLayer` or `TileLayer` is in the map,
  		// the highest of their `maxZoom` options will be used instead.
  		maxZoom: undefined,

  		// @option layers: Layer[] = []
  		// Array of layers that will be added to the map initially
  		layers: [],

  		// @option maxBounds: LatLngBounds = null
  		// When this option is set, the map restricts the view to the given
  		// geographical bounds, bouncing the user back if the user tries to pan
  		// outside the view. To set the restriction dynamically, use
  		// [`setMaxBounds`](#map-setmaxbounds) method.
  		maxBounds: undefined,

  		// @option renderer: Renderer = *
  		// The default method for drawing vector layers on the map. `L.SVG`
  		// or `L.Canvas` by default depending on browser support.
  		renderer: undefined,


  		// @section Animation Options
  		// @option zoomAnimation: Boolean = true
  		// Whether the map zoom animation is enabled. By default it's enabled
  		// in all browsers that support CSS3 Transitions except Android.
  		zoomAnimation: true,

  		// @option zoomAnimationThreshold: Number = 4
  		// Won't animate zoom if the zoom difference exceeds this value.
  		zoomAnimationThreshold: 4,

  		// @option fadeAnimation: Boolean = true
  		// Whether the tile fade animation is enabled. By default it's enabled
  		// in all browsers that support CSS3 Transitions except Android.
  		fadeAnimation: true,

  		// @option markerZoomAnimation: Boolean = true
  		// Whether markers animate their zoom with the zoom animation, if disabled
  		// they will disappear for the length of the animation. By default it's
  		// enabled in all browsers that support CSS3 Transitions except Android.
  		markerZoomAnimation: true,

  		// @option transform3DLimit: Number = 2^23
  		// Defines the maximum size of a CSS translation transform. The default
  		// value should not be changed unless a web browser positions layers in
  		// the wrong place after doing a large `panBy`.
  		transform3DLimit: 8388608, // Precision limit of a 32-bit float

  		// @section Interaction Options
  		// @option zoomSnap: Number = 1
  		// Forces the map's zoom level to always be a multiple of this, particularly
  		// right after a [`fitBounds()`](#map-fitbounds) or a pinch-zoom.
  		// By default, the zoom level snaps to the nearest integer; lower values
  		// (e.g. `0.5` or `0.1`) allow for greater granularity. A value of `0`
  		// means the zoom level will not be snapped after `fitBounds` or a pinch-zoom.
  		zoomSnap: 1,

  		// @option zoomDelta: Number = 1
  		// Controls how much the map's zoom level will change after a
  		// [`zoomIn()`](#map-zoomin), [`zoomOut()`](#map-zoomout), pressing `+`
  		// or `-` on the keyboard, or using the [zoom controls](#control-zoom).
  		// Values smaller than `1` (e.g. `0.5`) allow for greater granularity.
  		zoomDelta: 1,

  		// @option trackResize: Boolean = true
  		// Whether the map automatically handles browser window resize to update itself.
  		trackResize: true
  	},

  	initialize: function (id, options) { // (HTMLElement or String, Object)
  		options = setOptions(this, options);

  		// Make sure to assign internal flags at the beginning,
  		// to avoid inconsistent state in some edge cases.
  		this._handlers = [];
  		this._layers = {};
  		this._zoomBoundLayers = {};
  		this._sizeChanged = true;

  		this._initContainer(id);
  		this._initLayout();

  		// hack for https://github.com/Leaflet/Leaflet/issues/1980
  		this._onResize = bind(this._onResize, this);

  		this._initEvents();

  		if (options.maxBounds) {
  			this.setMaxBounds(options.maxBounds);
  		}

  		if (options.zoom !== undefined) {
  			this._zoom = this._limitZoom(options.zoom);
  		}

  		if (options.center && options.zoom !== undefined) {
  			this.setView(toLatLng(options.center), options.zoom, {reset: true});
  		}

  		this.callInitHooks();

  		// don't animate on browsers without hardware-accelerated transitions or old Android/Opera
  		this._zoomAnimated = TRANSITION && any3d && !mobileOpera &&
  				this.options.zoomAnimation;

  		// zoom transitions run with the same duration for all layers, so if one of transitionend events
  		// happens after starting zoom animation (propagating to the map pane), we know that it ended globally
  		if (this._zoomAnimated) {
  			this._createAnimProxy();
  			on(this._proxy, TRANSITION_END, this._catchTransitionEnd, this);
  		}

  		this._addLayers(this.options.layers);
  	},


  	// @section Methods for modifying map state

  	// @method setView(center: LatLng, zoom: Number, options?: Zoom/pan options): this
  	// Sets the view of the map (geographical center and zoom) with the given
  	// animation options.
  	setView: function (center, zoom, options) {

  		zoom = zoom === undefined ? this._zoom : this._limitZoom(zoom);
  		center = this._limitCenter(toLatLng(center), zoom, this.options.maxBounds);
  		options = options || {};

  		this._stop();

  		if (this._loaded && !options.reset && options !== true) {

  			if (options.animate !== undefined) {
  				options.zoom = extend({animate: options.animate}, options.zoom);
  				options.pan = extend({animate: options.animate, duration: options.duration}, options.pan);
  			}

  			// try animating pan or zoom
  			var moved = (this._zoom !== zoom) ?
  				this._tryAnimatedZoom && this._tryAnimatedZoom(center, zoom, options.zoom) :
  				this._tryAnimatedPan(center, options.pan);

  			if (moved) {
  				// prevent resize handler call, the view will refresh after animation anyway
  				clearTimeout(this._sizeTimer);
  				return this;
  			}
  		}

  		// animation didn't start, just reset the map view
  		this._resetView(center, zoom);

  		return this;
  	},

  	// @method setZoom(zoom: Number, options?: Zoom/pan options): this
  	// Sets the zoom of the map.
  	setZoom: function (zoom, options) {
  		if (!this._loaded) {
  			this._zoom = zoom;
  			return this;
  		}
  		return this.setView(this.getCenter(), zoom, {zoom: options});
  	},

  	// @method zoomIn(delta?: Number, options?: Zoom options): this
  	// Increases the zoom of the map by `delta` ([`zoomDelta`](#map-zoomdelta) by default).
  	zoomIn: function (delta, options) {
  		delta = delta || (any3d ? this.options.zoomDelta : 1);
  		return this.setZoom(this._zoom + delta, options);
  	},

  	// @method zoomOut(delta?: Number, options?: Zoom options): this
  	// Decreases the zoom of the map by `delta` ([`zoomDelta`](#map-zoomdelta) by default).
  	zoomOut: function (delta, options) {
  		delta = delta || (any3d ? this.options.zoomDelta : 1);
  		return this.setZoom(this._zoom - delta, options);
  	},

  	// @method setZoomAround(latlng: LatLng, zoom: Number, options: Zoom options): this
  	// Zooms the map while keeping a specified geographical point on the map
  	// stationary (e.g. used internally for scroll zoom and double-click zoom).
  	// @alternative
  	// @method setZoomAround(offset: Point, zoom: Number, options: Zoom options): this
  	// Zooms the map while keeping a specified pixel on the map (relative to the top-left corner) stationary.
  	setZoomAround: function (latlng, zoom, options) {
  		var scale = this.getZoomScale(zoom),
  		    viewHalf = this.getSize().divideBy(2),
  		    containerPoint = latlng instanceof Point ? latlng : this.latLngToContainerPoint(latlng),

  		    centerOffset = containerPoint.subtract(viewHalf).multiplyBy(1 - 1 / scale),
  		    newCenter = this.containerPointToLatLng(viewHalf.add(centerOffset));

  		return this.setView(newCenter, zoom, {zoom: options});
  	},

  	_getBoundsCenterZoom: function (bounds, options) {

  		options = options || {};
  		bounds = bounds.getBounds ? bounds.getBounds() : toLatLngBounds(bounds);

  		var paddingTL = toPoint(options.paddingTopLeft || options.padding || [0, 0]),
  		    paddingBR = toPoint(options.paddingBottomRight || options.padding || [0, 0]),

  		    zoom = this.getBoundsZoom(bounds, false, paddingTL.add(paddingBR));

  		zoom = (typeof options.maxZoom === 'number') ? Math.min(options.maxZoom, zoom) : zoom;

  		if (zoom === Infinity) {
  			return {
  				center: bounds.getCenter(),
  				zoom: zoom
  			};
  		}

  		var paddingOffset = paddingBR.subtract(paddingTL).divideBy(2),

  		    swPoint = this.project(bounds.getSouthWest(), zoom),
  		    nePoint = this.project(bounds.getNorthEast(), zoom),
  		    center = this.unproject(swPoint.add(nePoint).divideBy(2).add(paddingOffset), zoom);

  		return {
  			center: center,
  			zoom: zoom
  		};
  	},

  	// @method fitBounds(bounds: LatLngBounds, options?: fitBounds options): this
  	// Sets a map view that contains the given geographical bounds with the
  	// maximum zoom level possible.
  	fitBounds: function (bounds, options) {

  		bounds = toLatLngBounds(bounds);

  		if (!bounds.isValid()) {
  			throw new Error('Bounds are not valid.');
  		}

  		var target = this._getBoundsCenterZoom(bounds, options);
  		return this.setView(target.center, target.zoom, options);
  	},

  	// @method fitWorld(options?: fitBounds options): this
  	// Sets a map view that mostly contains the whole world with the maximum
  	// zoom level possible.
  	fitWorld: function (options) {
  		return this.fitBounds([[-90, -180], [90, 180]], options);
  	},

  	// @method panTo(latlng: LatLng, options?: Pan options): this
  	// Pans the map to a given center.
  	panTo: function (center, options) { // (LatLng)
  		return this.setView(center, this._zoom, {pan: options});
  	},

  	// @method panBy(offset: Point, options?: Pan options): this
  	// Pans the map by a given number of pixels (animated).
  	panBy: function (offset, options) {
  		offset = toPoint(offset).round();
  		options = options || {};

  		if (!offset.x && !offset.y) {
  			return this.fire('moveend');
  		}
  		// If we pan too far, Chrome gets issues with tiles
  		// and makes them disappear or appear in the wrong place (slightly offset) #2602
  		if (options.animate !== true && !this.getSize().contains(offset)) {
  			this._resetView(this.unproject(this.project(this.getCenter()).add(offset)), this.getZoom());
  			return this;
  		}

  		if (!this._panAnim) {
  			this._panAnim = new PosAnimation();

  			this._panAnim.on({
  				'step': this._onPanTransitionStep,
  				'end': this._onPanTransitionEnd
  			}, this);
  		}

  		// don't fire movestart if animating inertia
  		if (!options.noMoveStart) {
  			this.fire('movestart');
  		}

  		// animate pan unless animate: false specified
  		if (options.animate !== false) {
  			addClass(this._mapPane, 'leaflet-pan-anim');

  			var newPos = this._getMapPanePos().subtract(offset).round();
  			this._panAnim.run(this._mapPane, newPos, options.duration || 0.25, options.easeLinearity);
  		} else {
  			this._rawPanBy(offset);
  			this.fire('move').fire('moveend');
  		}

  		return this;
  	},

  	// @method flyTo(latlng: LatLng, zoom?: Number, options?: Zoom/pan options): this
  	// Sets the view of the map (geographical center and zoom) performing a smooth
  	// pan-zoom animation.
  	flyTo: function (targetCenter, targetZoom, options) {

  		options = options || {};
  		if (options.animate === false || !any3d) {
  			return this.setView(targetCenter, targetZoom, options);
  		}

  		this._stop();

  		var from = this.project(this.getCenter()),
  		    to = this.project(targetCenter),
  		    size = this.getSize(),
  		    startZoom = this._zoom;

  		targetCenter = toLatLng(targetCenter);
  		targetZoom = targetZoom === undefined ? startZoom : targetZoom;

  		var w0 = Math.max(size.x, size.y),
  		    w1 = w0 * this.getZoomScale(startZoom, targetZoom),
  		    u1 = (to.distanceTo(from)) || 1,
  		    rho = 1.42,
  		    rho2 = rho * rho;

  		function r(i) {
  			var s1 = i ? -1 : 1,
  			    s2 = i ? w1 : w0,
  			    t1 = w1 * w1 - w0 * w0 + s1 * rho2 * rho2 * u1 * u1,
  			    b1 = 2 * s2 * rho2 * u1,
  			    b = t1 / b1,
  			    sq = Math.sqrt(b * b + 1) - b;

  			    // workaround for floating point precision bug when sq = 0, log = -Infinite,
  			    // thus triggering an infinite loop in flyTo
  			    var log = sq < 0.000000001 ? -18 : Math.log(sq);

  			return log;
  		}

  		function sinh(n) { return (Math.exp(n) - Math.exp(-n)) / 2; }
  		function cosh(n) { return (Math.exp(n) + Math.exp(-n)) / 2; }
  		function tanh(n) { return sinh(n) / cosh(n); }

  		var r0 = r(0);

  		function w(s) { return w0 * (cosh(r0) / cosh(r0 + rho * s)); }
  		function u(s) { return w0 * (cosh(r0) * tanh(r0 + rho * s) - sinh(r0)) / rho2; }

  		function easeOut(t) { return 1 - Math.pow(1 - t, 1.5); }

  		var start = Date.now(),
  		    S = (r(1) - r0) / rho,
  		    duration = options.duration ? 1000 * options.duration : 1000 * S * 0.8;

  		function frame() {
  			var t = (Date.now() - start) / duration,
  			    s = easeOut(t) * S;

  			if (t <= 1) {
  				this._flyToFrame = requestAnimFrame(frame, this);

  				this._move(
  					this.unproject(from.add(to.subtract(from).multiplyBy(u(s) / u1)), startZoom),
  					this.getScaleZoom(w0 / w(s), startZoom),
  					{flyTo: true});

  			} else {
  				this
  					._move(targetCenter, targetZoom)
  					._moveEnd(true);
  			}
  		}

  		this._moveStart(true, options.noMoveStart);

  		frame.call(this);
  		return this;
  	},

  	// @method flyToBounds(bounds: LatLngBounds, options?: fitBounds options): this
  	// Sets the view of the map with a smooth animation like [`flyTo`](#map-flyto),
  	// but takes a bounds parameter like [`fitBounds`](#map-fitbounds).
  	flyToBounds: function (bounds, options) {
  		var target = this._getBoundsCenterZoom(bounds, options);
  		return this.flyTo(target.center, target.zoom, options);
  	},

  	// @method setMaxBounds(bounds: Bounds): this
  	// Restricts the map view to the given bounds (see the [maxBounds](#map-maxbounds) option).
  	setMaxBounds: function (bounds) {
  		bounds = toLatLngBounds(bounds);

  		if (!bounds.isValid()) {
  			this.options.maxBounds = null;
  			return this.off('moveend', this._panInsideMaxBounds);
  		} else if (this.options.maxBounds) {
  			this.off('moveend', this._panInsideMaxBounds);
  		}

  		this.options.maxBounds = bounds;

  		if (this._loaded) {
  			this._panInsideMaxBounds();
  		}

  		return this.on('moveend', this._panInsideMaxBounds);
  	},

  	// @method setMinZoom(zoom: Number): this
  	// Sets the lower limit for the available zoom levels (see the [minZoom](#map-minzoom) option).
  	setMinZoom: function (zoom) {
  		var oldZoom = this.options.minZoom;
  		this.options.minZoom = zoom;

  		if (this._loaded && oldZoom !== zoom) {
  			this.fire('zoomlevelschange');

  			if (this.getZoom() < this.options.minZoom) {
  				return this.setZoom(zoom);
  			}
  		}

  		return this;
  	},

  	// @method setMaxZoom(zoom: Number): this
  	// Sets the upper limit for the available zoom levels (see the [maxZoom](#map-maxzoom) option).
  	setMaxZoom: function (zoom) {
  		var oldZoom = this.options.maxZoom;
  		this.options.maxZoom = zoom;

  		if (this._loaded && oldZoom !== zoom) {
  			this.fire('zoomlevelschange');

  			if (this.getZoom() > this.options.maxZoom) {
  				return this.setZoom(zoom);
  			}
  		}

  		return this;
  	},

  	// @method panInsideBounds(bounds: LatLngBounds, options?: Pan options): this
  	// Pans the map to the closest view that would lie inside the given bounds (if it's not already), controlling the animation using the options specific, if any.
  	panInsideBounds: function (bounds, options) {
  		this._enforcingBounds = true;
  		var center = this.getCenter(),
  		    newCenter = this._limitCenter(center, this._zoom, toLatLngBounds(bounds));

  		if (!center.equals(newCenter)) {
  			this.panTo(newCenter, options);
  		}

  		this._enforcingBounds = false;
  		return this;
  	},

  	// @method panInside(latlng: LatLng, options?: options): this
  	// Pans the map the minimum amount to make the `latlng` visible. Use
  	// `padding`, `paddingTopLeft` and `paddingTopRight` options to fit
  	// the display to more restricted bounds, like [`fitBounds`](#map-fitbounds).
  	// If `latlng` is already within the (optionally padded) display bounds,
  	// the map will not be panned.
  	panInside: function (latlng, options) {
  		options = options || {};

  		var paddingTL = toPoint(options.paddingTopLeft || options.padding || [0, 0]),
  		    paddingBR = toPoint(options.paddingBottomRight || options.padding || [0, 0]),
  		    center = this.getCenter(),
  		    pixelCenter = this.project(center),
  		    pixelPoint = this.project(latlng),
  		    pixelBounds = this.getPixelBounds(),
  		    halfPixelBounds = pixelBounds.getSize().divideBy(2),
  		    paddedBounds = toBounds([pixelBounds.min.add(paddingTL), pixelBounds.max.subtract(paddingBR)]);

  		if (!paddedBounds.contains(pixelPoint)) {
  			this._enforcingBounds = true;
  			var diff = pixelCenter.subtract(pixelPoint),
  			    newCenter = toPoint(pixelPoint.x + diff.x, pixelPoint.y + diff.y);

  			if (pixelPoint.x < paddedBounds.min.x || pixelPoint.x > paddedBounds.max.x) {
  				newCenter.x = pixelCenter.x - diff.x;
  				if (diff.x > 0) {
  					newCenter.x += halfPixelBounds.x - paddingTL.x;
  				} else {
  					newCenter.x -= halfPixelBounds.x - paddingBR.x;
  				}
  			}
  			if (pixelPoint.y < paddedBounds.min.y || pixelPoint.y > paddedBounds.max.y) {
  				newCenter.y = pixelCenter.y - diff.y;
  				if (diff.y > 0) {
  					newCenter.y += halfPixelBounds.y - paddingTL.y;
  				} else {
  					newCenter.y -= halfPixelBounds.y - paddingBR.y;
  				}
  			}
  			this.panTo(this.unproject(newCenter), options);
  			this._enforcingBounds = false;
  		}
  		return this;
  	},

  	// @method invalidateSize(options: Zoom/pan options): this
  	// Checks if the map container size changed and updates the map if so —
  	// call it after you've changed the map size dynamically, also animating
  	// pan by default. If `options.pan` is `false`, panning will not occur.
  	// If `options.debounceMoveend` is `true`, it will delay `moveend` event so
  	// that it doesn't happen often even if the method is called many
  	// times in a row.

  	// @alternative
  	// @method invalidateSize(animate: Boolean): this
  	// Checks if the map container size changed and updates the map if so —
  	// call it after you've changed the map size dynamically, also animating
  	// pan by default.
  	invalidateSize: function (options) {
  		if (!this._loaded) { return this; }

  		options = extend({
  			animate: false,
  			pan: true
  		}, options === true ? {animate: true} : options);

  		var oldSize = this.getSize();
  		this._sizeChanged = true;
  		this._lastCenter = null;

  		var newSize = this.getSize(),
  		    oldCenter = oldSize.divideBy(2).round(),
  		    newCenter = newSize.divideBy(2).round(),
  		    offset = oldCenter.subtract(newCenter);

  		if (!offset.x && !offset.y) { return this; }

  		if (options.animate && options.pan) {
  			this.panBy(offset);

  		} else {
  			if (options.pan) {
  				this._rawPanBy(offset);
  			}

  			this.fire('move');

  			if (options.debounceMoveend) {
  				clearTimeout(this._sizeTimer);
  				this._sizeTimer = setTimeout(bind(this.fire, this, 'moveend'), 200);
  			} else {
  				this.fire('moveend');
  			}
  		}

  		// @section Map state change events
  		// @event resize: ResizeEvent
  		// Fired when the map is resized.
  		return this.fire('resize', {
  			oldSize: oldSize,
  			newSize: newSize
  		});
  	},

  	// @section Methods for modifying map state
  	// @method stop(): this
  	// Stops the currently running `panTo` or `flyTo` animation, if any.
  	stop: function () {
  		this.setZoom(this._limitZoom(this._zoom));
  		if (!this.options.zoomSnap) {
  			this.fire('viewreset');
  		}
  		return this._stop();
  	},

  	// @section Geolocation methods
  	// @method locate(options?: Locate options): this
  	// Tries to locate the user using the Geolocation API, firing a [`locationfound`](#map-locationfound)
  	// event with location data on success or a [`locationerror`](#map-locationerror) event on failure,
  	// and optionally sets the map view to the user's location with respect to
  	// detection accuracy (or to the world view if geolocation failed).
  	// Note that, if your page doesn't use HTTPS, this method will fail in
  	// modern browsers ([Chrome 50 and newer](https://sites.google.com/a/chromium.org/dev/Home/chromium-security/deprecating-powerful-features-on-insecure-origins))
  	// See `Locate options` for more details.
  	locate: function (options) {

  		options = this._locateOptions = extend({
  			timeout: 10000,
  			watch: false
  			// setView: false
  			// maxZoom: <Number>
  			// maximumAge: 0
  			// enableHighAccuracy: false
  		}, options);

  		if (!('geolocation' in navigator)) {
  			this._handleGeolocationError({
  				code: 0,
  				message: 'Geolocation not supported.'
  			});
  			return this;
  		}

  		var onResponse = bind(this._handleGeolocationResponse, this),
  		    onError = bind(this._handleGeolocationError, this);

  		if (options.watch) {
  			this._locationWatchId =
  			        navigator.geolocation.watchPosition(onResponse, onError, options);
  		} else {
  			navigator.geolocation.getCurrentPosition(onResponse, onError, options);
  		}
  		return this;
  	},

  	// @method stopLocate(): this
  	// Stops watching location previously initiated by `map.locate({watch: true})`
  	// and aborts resetting the map view if map.locate was called with
  	// `{setView: true}`.
  	stopLocate: function () {
  		if (navigator.geolocation && navigator.geolocation.clearWatch) {
  			navigator.geolocation.clearWatch(this._locationWatchId);
  		}
  		if (this._locateOptions) {
  			this._locateOptions.setView = false;
  		}
  		return this;
  	},

  	_handleGeolocationError: function (error) {
  		var c = error.code,
  		    message = error.message ||
  		            (c === 1 ? 'permission denied' :
  		            (c === 2 ? 'position unavailable' : 'timeout'));

  		if (this._locateOptions.setView && !this._loaded) {
  			this.fitWorld();
  		}

  		// @section Location events
  		// @event locationerror: ErrorEvent
  		// Fired when geolocation (using the [`locate`](#map-locate) method) failed.
  		this.fire('locationerror', {
  			code: c,
  			message: 'Geolocation error: ' + message + '.'
  		});
  	},

  	_handleGeolocationResponse: function (pos) {
  		var lat = pos.coords.latitude,
  		    lng = pos.coords.longitude,
  		    latlng = new LatLng(lat, lng),
  		    bounds = latlng.toBounds(pos.coords.accuracy * 2),
  		    options = this._locateOptions;

  		if (options.setView) {
  			var zoom = this.getBoundsZoom(bounds);
  			this.setView(latlng, options.maxZoom ? Math.min(zoom, options.maxZoom) : zoom);
  		}

  		var data = {
  			latlng: latlng,
  			bounds: bounds,
  			timestamp: pos.timestamp
  		};

  		for (var i in pos.coords) {
  			if (typeof pos.coords[i] === 'number') {
  				data[i] = pos.coords[i];
  			}
  		}

  		// @event locationfound: LocationEvent
  		// Fired when geolocation (using the [`locate`](#map-locate) method)
  		// went successfully.
  		this.fire('locationfound', data);
  	},

  	// TODO Appropriate docs section?
  	// @section Other Methods
  	// @method addHandler(name: String, HandlerClass: Function): this
  	// Adds a new `Handler` to the map, given its name and constructor function.
  	addHandler: function (name, HandlerClass) {
  		if (!HandlerClass) { return this; }

  		var handler = this[name] = new HandlerClass(this);

  		this._handlers.push(handler);

  		if (this.options[name]) {
  			handler.enable();
  		}

  		return this;
  	},

  	// @method remove(): this
  	// Destroys the map and clears all related event listeners.
  	remove: function () {

  		this._initEvents(true);

  		if (this._containerId !== this._container._leaflet_id) {
  			throw new Error('Map container is being reused by another instance');
  		}

  		try {
  			// throws error in IE6-8
  			delete this._container._leaflet_id;
  			delete this._containerId;
  		} catch (e) {
  			/*eslint-disable */
  			this._container._leaflet_id = undefined;
  			/* eslint-enable */
  			this._containerId = undefined;
  		}

  		if (this._locationWatchId !== undefined) {
  			this.stopLocate();
  		}

  		this._stop();

  		remove(this._mapPane);

  		if (this._clearControlPos) {
  			this._clearControlPos();
  		}
  		if (this._resizeRequest) {
  			cancelAnimFrame(this._resizeRequest);
  			this._resizeRequest = null;
  		}

  		this._clearHandlers();

  		if (this._loaded) {
  			// @section Map state change events
  			// @event unload: Event
  			// Fired when the map is destroyed with [remove](#map-remove) method.
  			this.fire('unload');
  		}

  		var i;
  		for (i in this._layers) {
  			this._layers[i].remove();
  		}
  		for (i in this._panes) {
  			remove(this._panes[i]);
  		}

  		this._layers = [];
  		this._panes = [];
  		delete this._mapPane;
  		delete this._renderer;

  		return this;
  	},

  	// @section Other Methods
  	// @method createPane(name: String, container?: HTMLElement): HTMLElement
  	// Creates a new [map pane](#map-pane) with the given name if it doesn't exist already,
  	// then returns it. The pane is created as a child of `container`, or
  	// as a child of the main map pane if not set.
  	createPane: function (name, container) {
  		var className = 'leaflet-pane' + (name ? ' leaflet-' + name.replace('Pane', '') + '-pane' : ''),
  		    pane = create$1('div', className, container || this._mapPane);

  		if (name) {
  			this._panes[name] = pane;
  		}
  		return pane;
  	},

  	// @section Methods for Getting Map State

  	// @method getCenter(): LatLng
  	// Returns the geographical center of the map view
  	getCenter: function () {
  		this._checkIfLoaded();

  		if (this._lastCenter && !this._moved()) {
  			return this._lastCenter;
  		}
  		return this.layerPointToLatLng(this._getCenterLayerPoint());
  	},

  	// @method getZoom(): Number
  	// Returns the current zoom level of the map view
  	getZoom: function () {
  		return this._zoom;
  	},

  	// @method getBounds(): LatLngBounds
  	// Returns the geographical bounds visible in the current map view
  	getBounds: function () {
  		var bounds = this.getPixelBounds(),
  		    sw = this.unproject(bounds.getBottomLeft()),
  		    ne = this.unproject(bounds.getTopRight());

  		return new LatLngBounds(sw, ne);
  	},

  	// @method getMinZoom(): Number
  	// Returns the minimum zoom level of the map (if set in the `minZoom` option of the map or of any layers), or `0` by default.
  	getMinZoom: function () {
  		return this.options.minZoom === undefined ? this._layersMinZoom || 0 : this.options.minZoom;
  	},

  	// @method getMaxZoom(): Number
  	// Returns the maximum zoom level of the map (if set in the `maxZoom` option of the map or of any layers).
  	getMaxZoom: function () {
  		return this.options.maxZoom === undefined ?
  			(this._layersMaxZoom === undefined ? Infinity : this._layersMaxZoom) :
  			this.options.maxZoom;
  	},

  	// @method getBoundsZoom(bounds: LatLngBounds, inside?: Boolean, padding?: Point): Number
  	// Returns the maximum zoom level on which the given bounds fit to the map
  	// view in its entirety. If `inside` (optional) is set to `true`, the method
  	// instead returns the minimum zoom level on which the map view fits into
  	// the given bounds in its entirety.
  	getBoundsZoom: function (bounds, inside, padding) { // (LatLngBounds[, Boolean, Point]) -> Number
  		bounds = toLatLngBounds(bounds);
  		padding = toPoint(padding || [0, 0]);

  		var zoom = this.getZoom() || 0,
  		    min = this.getMinZoom(),
  		    max = this.getMaxZoom(),
  		    nw = bounds.getNorthWest(),
  		    se = bounds.getSouthEast(),
  		    size = this.getSize().subtract(padding),
  		    boundsSize = toBounds(this.project(se, zoom), this.project(nw, zoom)).getSize(),
  		    snap = any3d ? this.options.zoomSnap : 1,
  		    scalex = size.x / boundsSize.x,
  		    scaley = size.y / boundsSize.y,
  		    scale = inside ? Math.max(scalex, scaley) : Math.min(scalex, scaley);

  		zoom = this.getScaleZoom(scale, zoom);

  		if (snap) {
  			zoom = Math.round(zoom / (snap / 100)) * (snap / 100); // don't jump if within 1% of a snap level
  			zoom = inside ? Math.ceil(zoom / snap) * snap : Math.floor(zoom / snap) * snap;
  		}

  		return Math.max(min, Math.min(max, zoom));
  	},

  	// @method getSize(): Point
  	// Returns the current size of the map container (in pixels).
  	getSize: function () {
  		if (!this._size || this._sizeChanged) {
  			this._size = new Point(
  				this._container.clientWidth || 0,
  				this._container.clientHeight || 0);

  			this._sizeChanged = false;
  		}
  		return this._size.clone();
  	},

  	// @method getPixelBounds(): Bounds
  	// Returns the bounds of the current map view in projected pixel
  	// coordinates (sometimes useful in layer and overlay implementations).
  	getPixelBounds: function (center, zoom) {
  		var topLeftPoint = this._getTopLeftPoint(center, zoom);
  		return new Bounds(topLeftPoint, topLeftPoint.add(this.getSize()));
  	},

  	// TODO: Check semantics - isn't the pixel origin the 0,0 coord relative to
  	// the map pane? "left point of the map layer" can be confusing, specially
  	// since there can be negative offsets.
  	// @method getPixelOrigin(): Point
  	// Returns the projected pixel coordinates of the top left point of
  	// the map layer (useful in custom layer and overlay implementations).
  	getPixelOrigin: function () {
  		this._checkIfLoaded();
  		return this._pixelOrigin;
  	},

  	// @method getPixelWorldBounds(zoom?: Number): Bounds
  	// Returns the world's bounds in pixel coordinates for zoom level `zoom`.
  	// If `zoom` is omitted, the map's current zoom level is used.
  	getPixelWorldBounds: function (zoom) {
  		return this.options.crs.getProjectedBounds(zoom === undefined ? this.getZoom() : zoom);
  	},

  	// @section Other Methods

  	// @method getPane(pane: String|HTMLElement): HTMLElement
  	// Returns a [map pane](#map-pane), given its name or its HTML element (its identity).
  	getPane: function (pane) {
  		return typeof pane === 'string' ? this._panes[pane] : pane;
  	},

  	// @method getPanes(): Object
  	// Returns a plain object containing the names of all [panes](#map-pane) as keys and
  	// the panes as values.
  	getPanes: function () {
  		return this._panes;
  	},

  	// @method getContainer: HTMLElement
  	// Returns the HTML element that contains the map.
  	getContainer: function () {
  		return this._container;
  	},


  	// @section Conversion Methods

  	// @method getZoomScale(toZoom: Number, fromZoom: Number): Number
  	// Returns the scale factor to be applied to a map transition from zoom level
  	// `fromZoom` to `toZoom`. Used internally to help with zoom animations.
  	getZoomScale: function (toZoom, fromZoom) {
  		// TODO replace with universal implementation after refactoring projections
  		var crs = this.options.crs;
  		fromZoom = fromZoom === undefined ? this._zoom : fromZoom;
  		return crs.scale(toZoom) / crs.scale(fromZoom);
  	},

  	// @method getScaleZoom(scale: Number, fromZoom: Number): Number
  	// Returns the zoom level that the map would end up at, if it is at `fromZoom`
  	// level and everything is scaled by a factor of `scale`. Inverse of
  	// [`getZoomScale`](#map-getZoomScale).
  	getScaleZoom: function (scale, fromZoom) {
  		var crs = this.options.crs;
  		fromZoom = fromZoom === undefined ? this._zoom : fromZoom;
  		var zoom = crs.zoom(scale * crs.scale(fromZoom));
  		return isNaN(zoom) ? Infinity : zoom;
  	},

  	// @method project(latlng: LatLng, zoom: Number): Point
  	// Projects a geographical coordinate `LatLng` according to the projection
  	// of the map's CRS, then scales it according to `zoom` and the CRS's
  	// `Transformation`. The result is pixel coordinate relative to
  	// the CRS origin.
  	project: function (latlng, zoom) {
  		zoom = zoom === undefined ? this._zoom : zoom;
  		return this.options.crs.latLngToPoint(toLatLng(latlng), zoom);
  	},

  	// @method unproject(point: Point, zoom: Number): LatLng
  	// Inverse of [`project`](#map-project).
  	unproject: function (point, zoom) {
  		zoom = zoom === undefined ? this._zoom : zoom;
  		return this.options.crs.pointToLatLng(toPoint(point), zoom);
  	},

  	// @method layerPointToLatLng(point: Point): LatLng
  	// Given a pixel coordinate relative to the [origin pixel](#map-getpixelorigin),
  	// returns the corresponding geographical coordinate (for the current zoom level).
  	layerPointToLatLng: function (point) {
  		var projectedPoint = toPoint(point).add(this.getPixelOrigin());
  		return this.unproject(projectedPoint);
  	},

  	// @method latLngToLayerPoint(latlng: LatLng): Point
  	// Given a geographical coordinate, returns the corresponding pixel coordinate
  	// relative to the [origin pixel](#map-getpixelorigin).
  	latLngToLayerPoint: function (latlng) {
  		var projectedPoint = this.project(toLatLng(latlng))._round();
  		return projectedPoint._subtract(this.getPixelOrigin());
  	},

  	// @method wrapLatLng(latlng: LatLng): LatLng
  	// Returns a `LatLng` where `lat` and `lng` has been wrapped according to the
  	// map's CRS's `wrapLat` and `wrapLng` properties, if they are outside the
  	// CRS's bounds.
  	// By default this means longitude is wrapped around the dateline so its
  	// value is between -180 and +180 degrees.
  	wrapLatLng: function (latlng) {
  		return this.options.crs.wrapLatLng(toLatLng(latlng));
  	},

  	// @method wrapLatLngBounds(bounds: LatLngBounds): LatLngBounds
  	// Returns a `LatLngBounds` with the same size as the given one, ensuring that
  	// its center is within the CRS's bounds.
  	// By default this means the center longitude is wrapped around the dateline so its
  	// value is between -180 and +180 degrees, and the majority of the bounds
  	// overlaps the CRS's bounds.
  	wrapLatLngBounds: function (latlng) {
  		return this.options.crs.wrapLatLngBounds(toLatLngBounds(latlng));
  	},

  	// @method distance(latlng1: LatLng, latlng2: LatLng): Number
  	// Returns the distance between two geographical coordinates according to
  	// the map's CRS. By default this measures distance in meters.
  	distance: function (latlng1, latlng2) {
  		return this.options.crs.distance(toLatLng(latlng1), toLatLng(latlng2));
  	},

  	// @method containerPointToLayerPoint(point: Point): Point
  	// Given a pixel coordinate relative to the map container, returns the corresponding
  	// pixel coordinate relative to the [origin pixel](#map-getpixelorigin).
  	containerPointToLayerPoint: function (point) { // (Point)
  		return toPoint(point).subtract(this._getMapPanePos());
  	},

  	// @method layerPointToContainerPoint(point: Point): Point
  	// Given a pixel coordinate relative to the [origin pixel](#map-getpixelorigin),
  	// returns the corresponding pixel coordinate relative to the map container.
  	layerPointToContainerPoint: function (point) { // (Point)
  		return toPoint(point).add(this._getMapPanePos());
  	},

  	// @method containerPointToLatLng(point: Point): LatLng
  	// Given a pixel coordinate relative to the map container, returns
  	// the corresponding geographical coordinate (for the current zoom level).
  	containerPointToLatLng: function (point) {
  		var layerPoint = this.containerPointToLayerPoint(toPoint(point));
  		return this.layerPointToLatLng(layerPoint);
  	},

  	// @method latLngToContainerPoint(latlng: LatLng): Point
  	// Given a geographical coordinate, returns the corresponding pixel coordinate
  	// relative to the map container.
  	latLngToContainerPoint: function (latlng) {
  		return this.layerPointToContainerPoint(this.latLngToLayerPoint(toLatLng(latlng)));
  	},

  	// @method mouseEventToContainerPoint(ev: MouseEvent): Point
  	// Given a MouseEvent object, returns the pixel coordinate relative to the
  	// map container where the event took place.
  	mouseEventToContainerPoint: function (e) {
  		return getMousePosition(e, this._container);
  	},

  	// @method mouseEventToLayerPoint(ev: MouseEvent): Point
  	// Given a MouseEvent object, returns the pixel coordinate relative to
  	// the [origin pixel](#map-getpixelorigin) where the event took place.
  	mouseEventToLayerPoint: function (e) {
  		return this.containerPointToLayerPoint(this.mouseEventToContainerPoint(e));
  	},

  	// @method mouseEventToLatLng(ev: MouseEvent): LatLng
  	// Given a MouseEvent object, returns geographical coordinate where the
  	// event took place.
  	mouseEventToLatLng: function (e) { // (MouseEvent)
  		return this.layerPointToLatLng(this.mouseEventToLayerPoint(e));
  	},


  	// map initialization methods

  	_initContainer: function (id) {
  		var container = this._container = get(id);

  		if (!container) {
  			throw new Error('Map container not found.');
  		} else if (container._leaflet_id) {
  			throw new Error('Map container is already initialized.');
  		}

  		on(container, 'scroll', this._onScroll, this);
  		this._containerId = stamp(container);
  	},

  	_initLayout: function () {
  		var container = this._container;

  		this._fadeAnimated = this.options.fadeAnimation && any3d;

  		addClass(container, 'leaflet-container' +
  			(touch ? ' leaflet-touch' : '') +
  			(retina ? ' leaflet-retina' : '') +
  			(ielt9 ? ' leaflet-oldie' : '') +
  			(safari ? ' leaflet-safari' : '') +
  			(this._fadeAnimated ? ' leaflet-fade-anim' : ''));

  		var position = getStyle(container, 'position');

  		if (position !== 'absolute' && position !== 'relative' && position !== 'fixed') {
  			container.style.position = 'relative';
  		}

  		this._initPanes();

  		if (this._initControlPos) {
  			this._initControlPos();
  		}
  	},

  	_initPanes: function () {
  		var panes = this._panes = {};
  		this._paneRenderers = {};

  		// @section
  		//
  		// Panes are DOM elements used to control the ordering of layers on the map. You
  		// can access panes with [`map.getPane`](#map-getpane) or
  		// [`map.getPanes`](#map-getpanes) methods. New panes can be created with the
  		// [`map.createPane`](#map-createpane) method.
  		//
  		// Every map has the following default panes that differ only in zIndex.
  		//
  		// @pane mapPane: HTMLElement = 'auto'
  		// Pane that contains all other map panes

  		this._mapPane = this.createPane('mapPane', this._container);
  		setPosition(this._mapPane, new Point(0, 0));

  		// @pane tilePane: HTMLElement = 200
  		// Pane for `GridLayer`s and `TileLayer`s
  		this.createPane('tilePane');
  		// @pane overlayPane: HTMLElement = 400
  		// Pane for vectors (`Path`s, like `Polyline`s and `Polygon`s), `ImageOverlay`s and `VideoOverlay`s
  		this.createPane('shadowPane');
  		// @pane shadowPane: HTMLElement = 500
  		// Pane for overlay shadows (e.g. `Marker` shadows)
  		this.createPane('overlayPane');
  		// @pane markerPane: HTMLElement = 600
  		// Pane for `Icon`s of `Marker`s
  		this.createPane('markerPane');
  		// @pane tooltipPane: HTMLElement = 650
  		// Pane for `Tooltip`s.
  		this.createPane('tooltipPane');
  		// @pane popupPane: HTMLElement = 700
  		// Pane for `Popup`s.
  		this.createPane('popupPane');

  		if (!this.options.markerZoomAnimation) {
  			addClass(panes.markerPane, 'leaflet-zoom-hide');
  			addClass(panes.shadowPane, 'leaflet-zoom-hide');
  		}
  	},


  	// private methods that modify map state

  	// @section Map state change events
  	_resetView: function (center, zoom) {
  		setPosition(this._mapPane, new Point(0, 0));

  		var loading = !this._loaded;
  		this._loaded = true;
  		zoom = this._limitZoom(zoom);

  		this.fire('viewprereset');

  		var zoomChanged = this._zoom !== zoom;
  		this
  			._moveStart(zoomChanged, false)
  			._move(center, zoom)
  			._moveEnd(zoomChanged);

  		// @event viewreset: Event
  		// Fired when the map needs to redraw its content (this usually happens
  		// on map zoom or load). Very useful for creating custom overlays.
  		this.fire('viewreset');

  		// @event load: Event
  		// Fired when the map is initialized (when its center and zoom are set
  		// for the first time).
  		if (loading) {
  			this.fire('load');
  		}
  	},

  	_moveStart: function (zoomChanged, noMoveStart) {
  		// @event zoomstart: Event
  		// Fired when the map zoom is about to change (e.g. before zoom animation).
  		// @event movestart: Event
  		// Fired when the view of the map starts changing (e.g. user starts dragging the map).
  		if (zoomChanged) {
  			this.fire('zoomstart');
  		}
  		if (!noMoveStart) {
  			this.fire('movestart');
  		}
  		return this;
  	},

  	_move: function (center, zoom, data) {
  		if (zoom === undefined) {
  			zoom = this._zoom;
  		}
  		var zoomChanged = this._zoom !== zoom;

  		this._zoom = zoom;
  		this._lastCenter = center;
  		this._pixelOrigin = this._getNewPixelOrigin(center);

  		// @event zoom: Event
  		// Fired repeatedly during any change in zoom level, including zoom
  		// and fly animations.
  		if (zoomChanged || (data && data.pinch)) {	// Always fire 'zoom' if pinching because #3530
  			this.fire('zoom', data);
  		}

  		// @event move: Event
  		// Fired repeatedly during any movement of the map, including pan and
  		// fly animations.
  		return this.fire('move', data);
  	},

  	_moveEnd: function (zoomChanged) {
  		// @event zoomend: Event
  		// Fired when the map has changed, after any animations.
  		if (zoomChanged) {
  			this.fire('zoomend');
  		}

  		// @event moveend: Event
  		// Fired when the center of the map stops changing (e.g. user stopped
  		// dragging the map).
  		return this.fire('moveend');
  	},

  	_stop: function () {
  		cancelAnimFrame(this._flyToFrame);
  		if (this._panAnim) {
  			this._panAnim.stop();
  		}
  		return this;
  	},

  	_rawPanBy: function (offset) {
  		setPosition(this._mapPane, this._getMapPanePos().subtract(offset));
  	},

  	_getZoomSpan: function () {
  		return this.getMaxZoom() - this.getMinZoom();
  	},

  	_panInsideMaxBounds: function () {
  		if (!this._enforcingBounds) {
  			this.panInsideBounds(this.options.maxBounds);
  		}
  	},

  	_checkIfLoaded: function () {
  		if (!this._loaded) {
  			throw new Error('Set map center and zoom first.');
  		}
  	},

  	// DOM event handling

  	// @section Interaction events
  	_initEvents: function (remove$$1) {
  		this._targets = {};
  		this._targets[stamp(this._container)] = this;

  		var onOff = remove$$1 ? off : on;

  		// @event click: MouseEvent
  		// Fired when the user clicks (or taps) the map.
  		// @event dblclick: MouseEvent
  		// Fired when the user double-clicks (or double-taps) the map.
  		// @event mousedown: MouseEvent
  		// Fired when the user pushes the mouse button on the map.
  		// @event mouseup: MouseEvent
  		// Fired when the user releases the mouse button on the map.
  		// @event mouseover: MouseEvent
  		// Fired when the mouse enters the map.
  		// @event mouseout: MouseEvent
  		// Fired when the mouse leaves the map.
  		// @event mousemove: MouseEvent
  		// Fired while the mouse moves over the map.
  		// @event contextmenu: MouseEvent
  		// Fired when the user pushes the right mouse button on the map, prevents
  		// default browser context menu from showing if there are listeners on
  		// this event. Also fired on mobile when the user holds a single touch
  		// for a second (also called long press).
  		// @event keypress: KeyboardEvent
  		// Fired when the user presses a key from the keyboard that produces a character value while the map is focused.
  		// @event keydown: KeyboardEvent
  		// Fired when the user presses a key from the keyboard while the map is focused. Unlike the `keypress` event,
  		// the `keydown` event is fired for keys that produce a character value and for keys
  		// that do not produce a character value.
  		// @event keyup: KeyboardEvent
  		// Fired when the user releases a key from the keyboard while the map is focused.
  		onOff(this._container, 'click dblclick mousedown mouseup ' +
  			'mouseover mouseout mousemove contextmenu keypress keydown keyup', this._handleDOMEvent, this);

  		if (this.options.trackResize) {
  			onOff(window, 'resize', this._onResize, this);
  		}

  		if (any3d && this.options.transform3DLimit) {
  			(remove$$1 ? this.off : this.on).call(this, 'moveend', this._onMoveEnd);
  		}
  	},

  	_onResize: function () {
  		cancelAnimFrame(this._resizeRequest);
  		this._resizeRequest = requestAnimFrame(
  		        function () { this.invalidateSize({debounceMoveend: true}); }, this);
  	},

  	_onScroll: function () {
  		this._container.scrollTop  = 0;
  		this._container.scrollLeft = 0;
  	},

  	_onMoveEnd: function () {
  		var pos = this._getMapPanePos();
  		if (Math.max(Math.abs(pos.x), Math.abs(pos.y)) >= this.options.transform3DLimit) {
  			// https://bugzilla.mozilla.org/show_bug.cgi?id=1203873 but Webkit also have
  			// a pixel offset on very high values, see: http://jsfiddle.net/dg6r5hhb/
  			this._resetView(this.getCenter(), this.getZoom());
  		}
  	},

  	_findEventTargets: function (e, type) {
  		var targets = [],
  		    target,
  		    isHover = type === 'mouseout' || type === 'mouseover',
  		    src = e.target || e.srcElement,
  		    dragging = false;

  		while (src) {
  			target = this._targets[stamp(src)];
  			if (target && (type === 'click' || type === 'preclick') && !e._simulated && this._draggableMoved(target)) {
  				// Prevent firing click after you just dragged an object.
  				dragging = true;
  				break;
  			}
  			if (target && target.listens(type, true)) {
  				if (isHover && !isExternalTarget(src, e)) { break; }
  				targets.push(target);
  				if (isHover) { break; }
  			}
  			if (src === this._container) { break; }
  			src = src.parentNode;
  		}
  		if (!targets.length && !dragging && !isHover && isExternalTarget(src, e)) {
  			targets = [this];
  		}
  		return targets;
  	},

  	_handleDOMEvent: function (e) {
  		if (!this._loaded || skipped(e)) { return; }

  		var type = e.type;

  		if (type === 'mousedown' || type === 'keypress' || type === 'keyup' || type === 'keydown') {
  			// prevents outline when clicking on keyboard-focusable element
  			preventOutline(e.target || e.srcElement);
  		}

  		this._fireDOMEvent(e, type);
  	},

  	_mouseEvents: ['click', 'dblclick', 'mouseover', 'mouseout', 'contextmenu'],

  	_fireDOMEvent: function (e, type, targets) {

  		if (e.type === 'click') {
  			// Fire a synthetic 'preclick' event which propagates up (mainly for closing popups).
  			// @event preclick: MouseEvent
  			// Fired before mouse click on the map (sometimes useful when you
  			// want something to happen on click before any existing click
  			// handlers start running).
  			var synth = extend({}, e);
  			synth.type = 'preclick';
  			this._fireDOMEvent(synth, synth.type, targets);
  		}

  		if (e._stopped) { return; }

  		// Find the layer the event is propagating from and its parents.
  		targets = (targets || []).concat(this._findEventTargets(e, type));

  		if (!targets.length) { return; }

  		var target = targets[0];
  		if (type === 'contextmenu' && target.listens(type, true)) {
  			preventDefault(e);
  		}

  		var data = {
  			originalEvent: e
  		};

  		if (e.type !== 'keypress' && e.type !== 'keydown' && e.type !== 'keyup') {
  			var isMarker = target.getLatLng && (!target._radius || target._radius <= 10);
  			data.containerPoint = isMarker ?
  				this.latLngToContainerPoint(target.getLatLng()) : this.mouseEventToContainerPoint(e);
  			data.layerPoint = this.containerPointToLayerPoint(data.containerPoint);
  			data.latlng = isMarker ? target.getLatLng() : this.layerPointToLatLng(data.layerPoint);
  		}

  		for (var i = 0; i < targets.length; i++) {
  			targets[i].fire(type, data, true);
  			if (data.originalEvent._stopped ||
  				(targets[i].options.bubblingMouseEvents === false && indexOf(this._mouseEvents, type) !== -1)) { return; }
  		}
  	},

  	_draggableMoved: function (obj) {
  		obj = obj.dragging && obj.dragging.enabled() ? obj : this;
  		return (obj.dragging && obj.dragging.moved()) || (this.boxZoom && this.boxZoom.moved());
  	},

  	_clearHandlers: function () {
  		for (var i = 0, len = this._handlers.length; i < len; i++) {
  			this._handlers[i].disable();
  		}
  	},

  	// @section Other Methods

  	// @method whenReady(fn: Function, context?: Object): this
  	// Runs the given function `fn` when the map gets initialized with
  	// a view (center and zoom) and at least one layer, or immediately
  	// if it's already initialized, optionally passing a function context.
  	whenReady: function (callback, context) {
  		if (this._loaded) {
  			callback.call(context || this, {target: this});
  		} else {
  			this.on('load', callback, context);
  		}
  		return this;
  	},


  	// private methods for getting map state

  	_getMapPanePos: function () {
  		return getPosition(this._mapPane) || new Point(0, 0);
  	},

  	_moved: function () {
  		var pos = this._getMapPanePos();
  		return pos && !pos.equals([0, 0]);
  	},

  	_getTopLeftPoint: function (center, zoom) {
  		var pixelOrigin = center && zoom !== undefined ?
  			this._getNewPixelOrigin(center, zoom) :
  			this.getPixelOrigin();
  		return pixelOrigin.subtract(this._getMapPanePos());
  	},

  	_getNewPixelOrigin: function (center, zoom) {
  		var viewHalf = this.getSize()._divideBy(2);
  		return this.project(center, zoom)._subtract(viewHalf)._add(this._getMapPanePos())._round();
  	},

  	_latLngToNewLayerPoint: function (latlng, zoom, center) {
  		var topLeft = this._getNewPixelOrigin(center, zoom);
  		return this.project(latlng, zoom)._subtract(topLeft);
  	},

  	_latLngBoundsToNewLayerBounds: function (latLngBounds, zoom, center) {
  		var topLeft = this._getNewPixelOrigin(center, zoom);
  		return toBounds([
  			this.project(latLngBounds.getSouthWest(), zoom)._subtract(topLeft),
  			this.project(latLngBounds.getNorthWest(), zoom)._subtract(topLeft),
  			this.project(latLngBounds.getSouthEast(), zoom)._subtract(topLeft),
  			this.project(latLngBounds.getNorthEast(), zoom)._subtract(topLeft)
  		]);
  	},

  	// layer point of the current center
  	_getCenterLayerPoint: function () {
  		return this.containerPointToLayerPoint(this.getSize()._divideBy(2));
  	},

  	// offset of the specified place to the current center in pixels
  	_getCenterOffset: function (latlng) {
  		return this.latLngToLayerPoint(latlng).subtract(this._getCenterLayerPoint());
  	},

  	// adjust center for view to get inside bounds
  	_limitCenter: function (center, zoom, bounds) {

  		if (!bounds) { return center; }

  		var centerPoint = this.project(center, zoom),
  		    viewHalf = this.getSize().divideBy(2),
  		    viewBounds = new Bounds(centerPoint.subtract(viewHalf), centerPoint.add(viewHalf)),
  		    offset = this._getBoundsOffset(viewBounds, bounds, zoom);

  		// If offset is less than a pixel, ignore.
  		// This prevents unstable projections from getting into
  		// an infinite loop of tiny offsets.
  		if (offset.round().equals([0, 0])) {
  			return center;
  		}

  		return this.unproject(centerPoint.add(offset), zoom);
  	},

  	// adjust offset for view to get inside bounds
  	_limitOffset: function (offset, bounds) {
  		if (!bounds) { return offset; }

  		var viewBounds = this.getPixelBounds(),
  		    newBounds = new Bounds(viewBounds.min.add(offset), viewBounds.max.add(offset));

  		return offset.add(this._getBoundsOffset(newBounds, bounds));
  	},

  	// returns offset needed for pxBounds to get inside maxBounds at a specified zoom
  	_getBoundsOffset: function (pxBounds, maxBounds, zoom) {
  		var projectedMaxBounds = toBounds(
  		        this.project(maxBounds.getNorthEast(), zoom),
  		        this.project(maxBounds.getSouthWest(), zoom)
  		    ),
  		    minOffset = projectedMaxBounds.min.subtract(pxBounds.min),
  		    maxOffset = projectedMaxBounds.max.subtract(pxBounds.max),

  		    dx = this._rebound(minOffset.x, -maxOffset.x),
  		    dy = this._rebound(minOffset.y, -maxOffset.y);

  		return new Point(dx, dy);
  	},

  	_rebound: function (left, right) {
  		return left + right > 0 ?
  			Math.round(left - right) / 2 :
  			Math.max(0, Math.ceil(left)) - Math.max(0, Math.floor(right));
  	},

  	_limitZoom: function (zoom) {
  		var min = this.getMinZoom(),
  		    max = this.getMaxZoom(),
  		    snap = any3d ? this.options.zoomSnap : 1;
  		if (snap) {
  			zoom = Math.round(zoom / snap) * snap;
  		}
  		return Math.max(min, Math.min(max, zoom));
  	},

  	_onPanTransitionStep: function () {
  		this.fire('move');
  	},

  	_onPanTransitionEnd: function () {
  		removeClass(this._mapPane, 'leaflet-pan-anim');
  		this.fire('moveend');
  	},

  	_tryAnimatedPan: function (center, options) {
  		// difference between the new and current centers in pixels
  		var offset = this._getCenterOffset(center)._trunc();

  		// don't animate too far unless animate: true specified in options
  		if ((options && options.animate) !== true && !this.getSize().contains(offset)) { return false; }

  		this.panBy(offset, options);

  		return true;
  	},

  	_createAnimProxy: function () {

  		var proxy = this._proxy = create$1('div', 'leaflet-proxy leaflet-zoom-animated');
  		this._panes.mapPane.appendChild(proxy);

  		this.on('zoomanim', function (e) {
  			var prop = TRANSFORM,
  			    transform = this._proxy.style[prop];

  			setTransform(this._proxy, this.project(e.center, e.zoom), this.getZoomScale(e.zoom, 1));

  			// workaround for case when transform is the same and so transitionend event is not fired
  			if (transform === this._proxy.style[prop] && this._animatingZoom) {
  				this._onZoomTransitionEnd();
  			}
  		}, this);

  		this.on('load moveend', this._animMoveEnd, this);

  		this._on('unload', this._destroyAnimProxy, this);
  	},

  	_destroyAnimProxy: function () {
  		remove(this._proxy);
  		this.off('load moveend', this._animMoveEnd, this);
  		delete this._proxy;
  	},

  	_animMoveEnd: function () {
  		var c = this.getCenter(),
  		    z = this.getZoom();
  		setTransform(this._proxy, this.project(c, z), this.getZoomScale(z, 1));
  	},

  	_catchTransitionEnd: function (e) {
  		if (this._animatingZoom && e.propertyName.indexOf('transform') >= 0) {
  			this._onZoomTransitionEnd();
  		}
  	},

  	_nothingToAnimate: function () {
  		return !this._container.getElementsByClassName('leaflet-zoom-animated').length;
  	},

  	_tryAnimatedZoom: function (center, zoom, options) {

  		if (this._animatingZoom) { return true; }

  		options = options || {};

  		// don't animate if disabled, not supported or zoom difference is too large
  		if (!this._zoomAnimated || options.animate === false || this._nothingToAnimate() ||
  		        Math.abs(zoom - this._zoom) > this.options.zoomAnimationThreshold) { return false; }

  		// offset is the pixel coords of the zoom origin relative to the current center
  		var scale = this.getZoomScale(zoom),
  		    offset = this._getCenterOffset(center)._divideBy(1 - 1 / scale);

  		// don't animate if the zoom origin isn't within one screen from the current center, unless forced
  		if (options.animate !== true && !this.getSize().contains(offset)) { return false; }

  		requestAnimFrame(function () {
  			this
  			    ._moveStart(true, false)
  			    ._animateZoom(center, zoom, true);
  		}, this);

  		return true;
  	},

  	_animateZoom: function (center, zoom, startAnim, noUpdate) {
  		if (!this._mapPane) { return; }

  		if (startAnim) {
  			this._animatingZoom = true;

  			// remember what center/zoom to set after animation
  			this._animateToCenter = center;
  			this._animateToZoom = zoom;

  			addClass(this._mapPane, 'leaflet-zoom-anim');
  		}

  		// @section Other Events
  		// @event zoomanim: ZoomAnimEvent
  		// Fired at least once per zoom animation. For continuous zoom, like pinch zooming, fired once per frame during zoom.
  		this.fire('zoomanim', {
  			center: center,
  			zoom: zoom,
  			noUpdate: noUpdate
  		});

  		// Work around webkit not firing 'transitionend', see https://github.com/Leaflet/Leaflet/issues/3689, 2693
  		setTimeout(bind(this._onZoomTransitionEnd, this), 250);
  	},

  	_onZoomTransitionEnd: function () {
  		if (!this._animatingZoom) { return; }

  		if (this._mapPane) {
  			removeClass(this._mapPane, 'leaflet-zoom-anim');
  		}

  		this._animatingZoom = false;

  		this._move(this._animateToCenter, this._animateToZoom);

  		// This anim frame should prevent an obscure iOS webkit tile loading race condition.
  		requestAnimFrame(function () {
  			this._moveEnd(true);
  		}, this);
  	}
  });

  // @section

  // @factory L.map(id: String, options?: Map options)
  // Instantiates a map object given the DOM ID of a `<div>` element
  // and optionally an object literal with `Map options`.
  //
  // @alternative
  // @factory L.map(el: HTMLElement, options?: Map options)
  // Instantiates a map object given an instance of a `<div>` HTML element
  // and optionally an object literal with `Map options`.
  function createMap(id, options) {
  	return new Map(id, options);
  }

  /*
   * @class Control
   * @aka L.Control
   * @inherits Class
   *
   * L.Control is a base class for implementing map controls. Handles positioning.
   * All other controls extend from this class.
   */

  var Control = Class.extend({
  	// @section
  	// @aka Control options
  	options: {
  		// @option position: String = 'topright'
  		// The position of the control (one of the map corners). Possible values are `'topleft'`,
  		// `'topright'`, `'bottomleft'` or `'bottomright'`
  		position: 'topright'
  	},

  	initialize: function (options) {
  		setOptions(this, options);
  	},

  	/* @section
  	 * Classes extending L.Control will inherit the following methods:
  	 *
  	 * @method getPosition: string
  	 * Returns the position of the control.
  	 */
  	getPosition: function () {
  		return this.options.position;
  	},

  	// @method setPosition(position: string): this
  	// Sets the position of the control.
  	setPosition: function (position) {
  		var map = this._map;

  		if (map) {
  			map.removeControl(this);
  		}

  		this.options.position = position;

  		if (map) {
  			map.addControl(this);
  		}

  		return this;
  	},

  	// @method getContainer: HTMLElement
  	// Returns the HTMLElement that contains the control.
  	getContainer: function () {
  		return this._container;
  	},

  	// @method addTo(map: Map): this
  	// Adds the control to the given map.
  	addTo: function (map) {
  		this.remove();
  		this._map = map;

  		var container = this._container = this.onAdd(map),
  		    pos = this.getPosition(),
  		    corner = map._controlCorners[pos];

  		addClass(container, 'leaflet-control');

  		if (pos.indexOf('bottom') !== -1) {
  			corner.insertBefore(container, corner.firstChild);
  		} else {
  			corner.appendChild(container);
  		}

  		this._map.on('unload', this.remove, this);

  		return this;
  	},

  	// @method remove: this
  	// Removes the control from the map it is currently active on.
  	remove: function () {
  		if (!this._map) {
  			return this;
  		}

  		remove(this._container);

  		if (this.onRemove) {
  			this.onRemove(this._map);
  		}

  		this._map.off('unload', this.remove, this);
  		this._map = null;

  		return this;
  	},

  	_refocusOnMap: function (e) {
  		// if map exists and event is not a keyboard event
  		if (this._map && e && e.screenX > 0 && e.screenY > 0) {
  			this._map.getContainer().focus();
  		}
  	}
  });

  var control = function (options) {
  	return new Control(options);
  };

  /* @section Extension methods
   * @uninheritable
   *
   * Every control should extend from `L.Control` and (re-)implement the following methods.
   *
   * @method onAdd(map: Map): HTMLElement
   * Should return the container DOM element for the control and add listeners on relevant map events. Called on [`control.addTo(map)`](#control-addTo).
   *
   * @method onRemove(map: Map)
   * Optional method. Should contain all clean up code that removes the listeners previously added in [`onAdd`](#control-onadd). Called on [`control.remove()`](#control-remove).
   */

  /* @namespace Map
   * @section Methods for Layers and Controls
   */
  Map.include({
  	// @method addControl(control: Control): this
  	// Adds the given control to the map
  	addControl: function (control) {
  		control.addTo(this);
  		return this;
  	},

  	// @method removeControl(control: Control): this
  	// Removes the given control from the map
  	removeControl: function (control) {
  		control.remove();
  		return this;
  	},

  	_initControlPos: function () {
  		var corners = this._controlCorners = {},
  		    l = 'leaflet-',
  		    container = this._controlContainer =
  		            create$1('div', l + 'control-container', this._container);

  		function createCorner(vSide, hSide) {
  			var className = l + vSide + ' ' + l + hSide;

  			corners[vSide + hSide] = create$1('div', className, container);
  		}

  		createCorner('top', 'left');
  		createCorner('top', 'right');
  		createCorner('bottom', 'left');
  		createCorner('bottom', 'right');
  	},

  	_clearControlPos: function () {
  		for (var i in this._controlCorners) {
  			remove(this._controlCorners[i]);
  		}
  		remove(this._controlContainer);
  		delete this._controlCorners;
  		delete this._controlContainer;
  	}
  });

  /*
   * @class Control.Layers
   * @aka L.Control.Layers
   * @inherits Control
   *
   * The layers control gives users the ability to switch between different base layers and switch overlays on/off (check out the [detailed example](http://leafletjs.com/examples/layers-control/)). Extends `Control`.
   *
   * @example
   *
   * ```js
   * var baseLayers = {
   * 	"Mapbox": mapbox,
   * 	"OpenStreetMap": osm
   * };
   *
   * var overlays = {
   * 	"Marker": marker,
   * 	"Roads": roadsLayer
   * };
   *
   * L.control.layers(baseLayers, overlays).addTo(map);
   * ```
   *
   * The `baseLayers` and `overlays` parameters are object literals with layer names as keys and `Layer` objects as values:
   *
   * ```js
   * {
   *     "<someName1>": layer1,
   *     "<someName2>": layer2
   * }
   * ```
   *
   * The layer names can contain HTML, which allows you to add additional styling to the items:
   *
   * ```js
   * {"<img src='my-layer-icon' /> <span class='my-layer-item'>My Layer</span>": myLayer}
   * ```
   */

  var Layers = Control.extend({
  	// @section
  	// @aka Control.Layers options
  	options: {
  		// @option collapsed: Boolean = true
  		// If `true`, the control will be collapsed into an icon and expanded on mouse hover or touch.
  		collapsed: true,
  		position: 'topright',

  		// @option autoZIndex: Boolean = true
  		// If `true`, the control will assign zIndexes in increasing order to all of its layers so that the order is preserved when switching them on/off.
  		autoZIndex: true,

  		// @option hideSingleBase: Boolean = false
  		// If `true`, the base layers in the control will be hidden when there is only one.
  		hideSingleBase: false,

  		// @option sortLayers: Boolean = false
  		// Whether to sort the layers. When `false`, layers will keep the order
  		// in which they were added to the control.
  		sortLayers: false,

  		// @option sortFunction: Function = *
  		// A [compare function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
  		// that will be used for sorting the layers, when `sortLayers` is `true`.
  		// The function receives both the `L.Layer` instances and their names, as in
  		// `sortFunction(layerA, layerB, nameA, nameB)`.
  		// By default, it sorts layers alphabetically by their name.
  		sortFunction: function (layerA, layerB, nameA, nameB) {
  			return nameA < nameB ? -1 : (nameB < nameA ? 1 : 0);
  		}
  	},

  	initialize: function (baseLayers, overlays, options) {
  		setOptions(this, options);

  		this._layerControlInputs = [];
  		this._layers = [];
  		this._lastZIndex = 0;
  		this._handlingClick = false;

  		for (var i in baseLayers) {
  			this._addLayer(baseLayers[i], i);
  		}

  		for (i in overlays) {
  			this._addLayer(overlays[i], i, true);
  		}
  	},

  	onAdd: function (map) {
  		this._initLayout();
  		this._update();

  		this._map = map;
  		map.on('zoomend', this._checkDisabledLayers, this);

  		for (var i = 0; i < this._layers.length; i++) {
  			this._layers[i].layer.on('add remove', this._onLayerChange, this);
  		}

  		return this._container;
  	},

  	addTo: function (map) {
  		Control.prototype.addTo.call(this, map);
  		// Trigger expand after Layers Control has been inserted into DOM so that is now has an actual height.
  		return this._expandIfNotCollapsed();
  	},

  	onRemove: function () {
  		this._map.off('zoomend', this._checkDisabledLayers, this);

  		for (var i = 0; i < this._layers.length; i++) {
  			this._layers[i].layer.off('add remove', this._onLayerChange, this);
  		}
  	},

  	// @method addBaseLayer(layer: Layer, name: String): this
  	// Adds a base layer (radio button entry) with the given name to the control.
  	addBaseLayer: function (layer, name) {
  		this._addLayer(layer, name);
  		return (this._map) ? this._update() : this;
  	},

  	// @method addOverlay(layer: Layer, name: String): this
  	// Adds an overlay (checkbox entry) with the given name to the control.
  	addOverlay: function (layer, name) {
  		this._addLayer(layer, name, true);
  		return (this._map) ? this._update() : this;
  	},

  	// @method removeLayer(layer: Layer): this
  	// Remove the given layer from the control.
  	removeLayer: function (layer) {
  		layer.off('add remove', this._onLayerChange, this);

  		var obj = this._getLayer(stamp(layer));
  		if (obj) {
  			this._layers.splice(this._layers.indexOf(obj), 1);
  		}
  		return (this._map) ? this._update() : this;
  	},

  	// @method expand(): this
  	// Expand the control container if collapsed.
  	expand: function () {
  		addClass(this._container, 'leaflet-control-layers-expanded');
  		this._section.style.height = null;
  		var acceptableHeight = this._map.getSize().y - (this._container.offsetTop + 50);
  		if (acceptableHeight < this._section.clientHeight) {
  			addClass(this._section, 'leaflet-control-layers-scrollbar');
  			this._section.style.height = acceptableHeight + 'px';
  		} else {
  			removeClass(this._section, 'leaflet-control-layers-scrollbar');
  		}
  		this._checkDisabledLayers();
  		return this;
  	},

  	// @method collapse(): this
  	// Collapse the control container if expanded.
  	collapse: function () {
  		removeClass(this._container, 'leaflet-control-layers-expanded');
  		return this;
  	},

  	_initLayout: function () {
  		var className = 'leaflet-control-layers',
  		    container = this._container = create$1('div', className),
  		    collapsed = this.options.collapsed;

  		// makes this work on IE touch devices by stopping it from firing a mouseout event when the touch is released
  		container.setAttribute('aria-haspopup', true);

  		disableClickPropagation(container);
  		disableScrollPropagation(container);

  		var section = this._section = create$1('section', className + '-list');

  		if (collapsed) {
  			this._map.on('click', this.collapse, this);

  			if (!android) {
  				on(container, {
  					mouseenter: this.expand,
  					mouseleave: this.collapse
  				}, this);
  			}
  		}

  		var link = this._layersLink = create$1('a', className + '-toggle', container);
  		link.href = '#';
  		link.title = 'Layers';

  		if (touch) {
  			on(link, 'click', stop);
  			on(link, 'click', this.expand, this);
  		} else {
  			on(link, 'focus', this.expand, this);
  		}

  		if (!collapsed) {
  			this.expand();
  		}

  		this._baseLayersList = create$1('div', className + '-base', section);
  		this._separator = create$1('div', className + '-separator', section);
  		this._overlaysList = create$1('div', className + '-overlays', section);

  		container.appendChild(section);
  	},

  	_getLayer: function (id) {
  		for (var i = 0; i < this._layers.length; i++) {

  			if (this._layers[i] && stamp(this._layers[i].layer) === id) {
  				return this._layers[i];
  			}
  		}
  	},

  	_addLayer: function (layer, name, overlay) {
  		if (this._map) {
  			layer.on('add remove', this._onLayerChange, this);
  		}

  		this._layers.push({
  			layer: layer,
  			name: name,
  			overlay: overlay
  		});

  		if (this.options.sortLayers) {
  			this._layers.sort(bind(function (a, b) {
  				return this.options.sortFunction(a.layer, b.layer, a.name, b.name);
  			}, this));
  		}

  		if (this.options.autoZIndex && layer.setZIndex) {
  			this._lastZIndex++;
  			layer.setZIndex(this._lastZIndex);
  		}

  		this._expandIfNotCollapsed();
  	},

  	_update: function () {
  		if (!this._container) { return this; }

  		empty(this._baseLayersList);
  		empty(this._overlaysList);

  		this._layerControlInputs = [];
  		var baseLayersPresent, overlaysPresent, i, obj, baseLayersCount = 0;

  		for (i = 0; i < this._layers.length; i++) {
  			obj = this._layers[i];
  			this._addItem(obj);
  			overlaysPresent = overlaysPresent || obj.overlay;
  			baseLayersPresent = baseLayersPresent || !obj.overlay;
  			baseLayersCount += !obj.overlay ? 1 : 0;
  		}

  		// Hide base layers section if there's only one layer.
  		if (this.options.hideSingleBase) {
  			baseLayersPresent = baseLayersPresent && baseLayersCount > 1;
  			this._baseLayersList.style.display = baseLayersPresent ? '' : 'none';
  		}

  		this._separator.style.display = overlaysPresent && baseLayersPresent ? '' : 'none';

  		return this;
  	},

  	_onLayerChange: function (e) {
  		if (!this._handlingClick) {
  			this._update();
  		}

  		var obj = this._getLayer(stamp(e.target));

  		// @namespace Map
  		// @section Layer events
  		// @event baselayerchange: LayersControlEvent
  		// Fired when the base layer is changed through the [layer control](#control-layers).
  		// @event overlayadd: LayersControlEvent
  		// Fired when an overlay is selected through the [layer control](#control-layers).
  		// @event overlayremove: LayersControlEvent
  		// Fired when an overlay is deselected through the [layer control](#control-layers).
  		// @namespace Control.Layers
  		var type = obj.overlay ?
  			(e.type === 'add' ? 'overlayadd' : 'overlayremove') :
  			(e.type === 'add' ? 'baselayerchange' : null);

  		if (type) {
  			this._map.fire(type, obj);
  		}
  	},

  	// IE7 bugs out if you create a radio dynamically, so you have to do it this hacky way (see http://bit.ly/PqYLBe)
  	_createRadioElement: function (name, checked) {

  		var radioHtml = '<input type="radio" class="leaflet-control-layers-selector" name="' +
  				name + '"' + (checked ? ' checked="checked"' : '') + '/>';

  		var radioFragment = document.createElement('div');
  		radioFragment.innerHTML = radioHtml;

  		return radioFragment.firstChild;
  	},

  	_addItem: function (obj) {
  		var label = document.createElement('label'),
  		    checked = this._map.hasLayer(obj.layer),
  		    input;

  		if (obj.overlay) {
  			input = document.createElement('input');
  			input.type = 'checkbox';
  			input.className = 'leaflet-control-layers-selector';
  			input.defaultChecked = checked;
  		} else {
  			input = this._createRadioElement('leaflet-base-layers_' + stamp(this), checked);
  		}

  		this._layerControlInputs.push(input);
  		input.layerId = stamp(obj.layer);

  		on(input, 'click', this._onInputClick, this);

  		var name = document.createElement('span');
  		name.innerHTML = ' ' + obj.name;

  		// Helps from preventing layer control flicker when checkboxes are disabled
  		// https://github.com/Leaflet/Leaflet/issues/2771
  		var holder = document.createElement('div');

  		label.appendChild(holder);
  		holder.appendChild(input);
  		holder.appendChild(name);

  		var container = obj.overlay ? this._overlaysList : this._baseLayersList;
  		container.appendChild(label);

  		this._checkDisabledLayers();
  		return label;
  	},

  	_onInputClick: function () {
  		var inputs = this._layerControlInputs,
  		    input, layer;
  		var addedLayers = [],
  		    removedLayers = [];

  		this._handlingClick = true;

  		for (var i = inputs.length - 1; i >= 0; i--) {
  			input = inputs[i];
  			layer = this._getLayer(input.layerId).layer;

  			if (input.checked) {
  				addedLayers.push(layer);
  			} else if (!input.checked) {
  				removedLayers.push(layer);
  			}
  		}

  		// Bugfix issue 2318: Should remove all old layers before readding new ones
  		for (i = 0; i < removedLayers.length; i++) {
  			if (this._map.hasLayer(removedLayers[i])) {
  				this._map.removeLayer(removedLayers[i]);
  			}
  		}
  		for (i = 0; i < addedLayers.length; i++) {
  			if (!this._map.hasLayer(addedLayers[i])) {
  				this._map.addLayer(addedLayers[i]);
  			}
  		}

  		this._handlingClick = false;

  		this._refocusOnMap();
  	},

  	_checkDisabledLayers: function () {
  		var inputs = this._layerControlInputs,
  		    input,
  		    layer,
  		    zoom = this._map.getZoom();

  		for (var i = inputs.length - 1; i >= 0; i--) {
  			input = inputs[i];
  			layer = this._getLayer(input.layerId).layer;
  			input.disabled = (layer.options.minZoom !== undefined && zoom < layer.options.minZoom) ||
  			                 (layer.options.maxZoom !== undefined && zoom > layer.options.maxZoom);

  		}
  	},

  	_expandIfNotCollapsed: function () {
  		if (this._map && !this.options.collapsed) {
  			this.expand();
  		}
  		return this;
  	},

  	_expand: function () {
  		// Backward compatibility, remove me in 1.1.
  		return this.expand();
  	},

  	_collapse: function () {
  		// Backward compatibility, remove me in 1.1.
  		return this.collapse();
  	}

  });


  // @factory L.control.layers(baselayers?: Object, overlays?: Object, options?: Control.Layers options)
  // Creates a layers control with the given layers. Base layers will be switched with radio buttons, while overlays will be switched with checkboxes. Note that all base layers should be passed in the base layers object, but only one should be added to the map during map instantiation.
  var layers = function (baseLayers, overlays, options) {
  	return new Layers(baseLayers, overlays, options);
  };

  /*
   * @class Control.Zoom
   * @aka L.Control.Zoom
   * @inherits Control
   *
   * A basic zoom control with two buttons (zoom in and zoom out). It is put on the map by default unless you set its [`zoomControl` option](#map-zoomcontrol) to `false`. Extends `Control`.
   */

  var Zoom = Control.extend({
  	// @section
  	// @aka Control.Zoom options
  	options: {
  		position: 'topleft',

  		// @option zoomInText: String = '+'
  		// The text set on the 'zoom in' button.
  		zoomInText: '+',

  		// @option zoomInTitle: String = 'Zoom in'
  		// The title set on the 'zoom in' button.
  		zoomInTitle: 'Zoom in',

  		// @option zoomOutText: String = '&#x2212;'
  		// The text set on the 'zoom out' button.
  		zoomOutText: '&#x2212;',

  		// @option zoomOutTitle: String = 'Zoom out'
  		// The title set on the 'zoom out' button.
  		zoomOutTitle: 'Zoom out'
  	},

  	onAdd: function (map) {
  		var zoomName = 'leaflet-control-zoom',
  		    container = create$1('div', zoomName + ' leaflet-bar'),
  		    options = this.options;

  		this._zoomInButton  = this._createButton(options.zoomInText, options.zoomInTitle,
  		        zoomName + '-in',  container, this._zoomIn);
  		this._zoomOutButton = this._createButton(options.zoomOutText, options.zoomOutTitle,
  		        zoomName + '-out', container, this._zoomOut);

  		this._updateDisabled();
  		map.on('zoomend zoomlevelschange', this._updateDisabled, this);

  		return container;
  	},

  	onRemove: function (map) {
  		map.off('zoomend zoomlevelschange', this._updateDisabled, this);
  	},

  	disable: function () {
  		this._disabled = true;
  		this._updateDisabled();
  		return this;
  	},

  	enable: function () {
  		this._disabled = false;
  		this._updateDisabled();
  		return this;
  	},

  	_zoomIn: function (e) {
  		if (!this._disabled && this._map._zoom < this._map.getMaxZoom()) {
  			this._map.zoomIn(this._map.options.zoomDelta * (e.shiftKey ? 3 : 1));
  		}
  	},

  	_zoomOut: function (e) {
  		if (!this._disabled && this._map._zoom > this._map.getMinZoom()) {
  			this._map.zoomOut(this._map.options.zoomDelta * (e.shiftKey ? 3 : 1));
  		}
  	},

  	_createButton: function (html, title, className, container, fn) {
  		var link = create$1('a', className, container);
  		link.innerHTML = html;
  		link.href = '#';
  		link.title = title;

  		/*
  		 * Will force screen readers like VoiceOver to read this as "Zoom in - button"
  		 */
  		link.setAttribute('role', 'button');
  		link.setAttribute('aria-label', title);

  		disableClickPropagation(link);
  		on(link, 'click', stop);
  		on(link, 'click', fn, this);
  		on(link, 'click', this._refocusOnMap, this);

  		return link;
  	},

  	_updateDisabled: function () {
  		var map = this._map,
  		    className = 'leaflet-disabled';

  		removeClass(this._zoomInButton, className);
  		removeClass(this._zoomOutButton, className);

  		if (this._disabled || map._zoom === map.getMinZoom()) {
  			addClass(this._zoomOutButton, className);
  		}
  		if (this._disabled || map._zoom === map.getMaxZoom()) {
  			addClass(this._zoomInButton, className);
  		}
  	}
  });

  // @namespace Map
  // @section Control options
  // @option zoomControl: Boolean = true
  // Whether a [zoom control](#control-zoom) is added to the map by default.
  Map.mergeOptions({
  	zoomControl: true
  });

  Map.addInitHook(function () {
  	if (this.options.zoomControl) {
  		// @section Controls
  		// @property zoomControl: Control.Zoom
  		// The default zoom control (only available if the
  		// [`zoomControl` option](#map-zoomcontrol) was `true` when creating the map).
  		this.zoomControl = new Zoom();
  		this.addControl(this.zoomControl);
  	}
  });

  // @namespace Control.Zoom
  // @factory L.control.zoom(options: Control.Zoom options)
  // Creates a zoom control
  var zoom = function (options) {
  	return new Zoom(options);
  };

  /*
   * @class Control.Scale
   * @aka L.Control.Scale
   * @inherits Control
   *
   * A simple scale control that shows the scale of the current center of screen in metric (m/km) and imperial (mi/ft) systems. Extends `Control`.
   *
   * @example
   *
   * ```js
   * L.control.scale().addTo(map);
   * ```
   */

  var Scale = Control.extend({
  	// @section
  	// @aka Control.Scale options
  	options: {
  		position: 'bottomleft',

  		// @option maxWidth: Number = 100
  		// Maximum width of the control in pixels. The width is set dynamically to show round values (e.g. 100, 200, 500).
  		maxWidth: 100,

  		// @option metric: Boolean = True
  		// Whether to show the metric scale line (m/km).
  		metric: true,

  		// @option imperial: Boolean = True
  		// Whether to show the imperial scale line (mi/ft).
  		imperial: true

  		// @option updateWhenIdle: Boolean = false
  		// If `true`, the control is updated on [`moveend`](#map-moveend), otherwise it's always up-to-date (updated on [`move`](#map-move)).
  	},

  	onAdd: function (map) {
  		var className = 'leaflet-control-scale',
  		    container = create$1('div', className),
  		    options = this.options;

  		this._addScales(options, className + '-line', container);

  		map.on(options.updateWhenIdle ? 'moveend' : 'move', this._update, this);
  		map.whenReady(this._update, this);

  		return container;
  	},

  	onRemove: function (map) {
  		map.off(this.options.updateWhenIdle ? 'moveend' : 'move', this._update, this);
  	},

  	_addScales: function (options, className, container) {
  		if (options.metric) {
  			this._mScale = create$1('div', className, container);
  		}
  		if (options.imperial) {
  			this._iScale = create$1('div', className, container);
  		}
  	},

  	_update: function () {
  		var map = this._map,
  		    y = map.getSize().y / 2;

  		var maxMeters = map.distance(
  			map.containerPointToLatLng([0, y]),
  			map.containerPointToLatLng([this.options.maxWidth, y]));

  		this._updateScales(maxMeters);
  	},

  	_updateScales: function (maxMeters) {
  		if (this.options.metric && maxMeters) {
  			this._updateMetric(maxMeters);
  		}
  		if (this.options.imperial && maxMeters) {
  			this._updateImperial(maxMeters);
  		}
  	},

  	_updateMetric: function (maxMeters) {
  		var meters = this._getRoundNum(maxMeters),
  		    label = meters < 1000 ? meters + ' m' : (meters / 1000) + ' km';

  		this._updateScale(this._mScale, label, meters / maxMeters);
  	},

  	_updateImperial: function (maxMeters) {
  		var maxFeet = maxMeters * 3.2808399,
  		    maxMiles, miles, feet;

  		if (maxFeet > 5280) {
  			maxMiles = maxFeet / 5280;
  			miles = this._getRoundNum(maxMiles);
  			this._updateScale(this._iScale, miles + ' mi', miles / maxMiles);

  		} else {
  			feet = this._getRoundNum(maxFeet);
  			this._updateScale(this._iScale, feet + ' ft', feet / maxFeet);
  		}
  	},

  	_updateScale: function (scale, text, ratio) {
  		scale.style.width = Math.round(this.options.maxWidth * ratio) + 'px';
  		scale.innerHTML = text;
  	},

  	_getRoundNum: function (num) {
  		var pow10 = Math.pow(10, (Math.floor(num) + '').length - 1),
  		    d = num / pow10;

  		d = d >= 10 ? 10 :
  		    d >= 5 ? 5 :
  		    d >= 3 ? 3 :
  		    d >= 2 ? 2 : 1;

  		return pow10 * d;
  	}
  });


  // @factory L.control.scale(options?: Control.Scale options)
  // Creates an scale control with the given options.
  var scale = function (options) {
  	return new Scale(options);
  };

  /*
   * @class Control.Attribution
   * @aka L.Control.Attribution
   * @inherits Control
   *
   * The attribution control allows you to display attribution data in a small text box on a map. It is put on the map by default unless you set its [`attributionControl` option](#map-attributioncontrol) to `false`, and it fetches attribution texts from layers with the [`getAttribution` method](#layer-getattribution) automatically. Extends Control.
   */

  var Attribution = Control.extend({
  	// @section
  	// @aka Control.Attribution options
  	options: {
  		position: 'bottomright',

  		// @option prefix: String = 'Leaflet'
  		// The HTML text shown before the attributions. Pass `false` to disable.
  		prefix: '<a href="https://leafletjs.com" title="A JS library for interactive maps">Leaflet</a>'
  	},

  	initialize: function (options) {
  		setOptions(this, options);

  		this._attributions = {};
  	},

  	onAdd: function (map) {
  		map.attributionControl = this;
  		this._container = create$1('div', 'leaflet-control-attribution');
  		disableClickPropagation(this._container);

  		// TODO ugly, refactor
  		for (var i in map._layers) {
  			if (map._layers[i].getAttribution) {
  				this.addAttribution(map._layers[i].getAttribution());
  			}
  		}

  		this._update();

  		return this._container;
  	},

  	// @method setPrefix(prefix: String): this
  	// Sets the text before the attributions.
  	setPrefix: function (prefix) {
  		this.options.prefix = prefix;
  		this._update();
  		return this;
  	},

  	// @method addAttribution(text: String): this
  	// Adds an attribution text (e.g. `'Vector data &copy; Mapbox'`).
  	addAttribution: function (text) {
  		if (!text) { return this; }

  		if (!this._attributions[text]) {
  			this._attributions[text] = 0;
  		}
  		this._attributions[text]++;

  		this._update();

  		return this;
  	},

  	// @method removeAttribution(text: String): this
  	// Removes an attribution text.
  	removeAttribution: function (text) {
  		if (!text) { return this; }

  		if (this._attributions[text]) {
  			this._attributions[text]--;
  			this._update();
  		}

  		return this;
  	},

  	_update: function () {
  		if (!this._map) { return; }

  		var attribs = [];

  		for (var i in this._attributions) {
  			if (this._attributions[i]) {
  				attribs.push(i);
  			}
  		}

  		var prefixAndAttribs = [];

  		if (this.options.prefix) {
  			prefixAndAttribs.push(this.options.prefix);
  		}
  		if (attribs.length) {
  			prefixAndAttribs.push(attribs.join(', '));
  		}

  		this._container.innerHTML = prefixAndAttribs.join(' | ');
  	}
  });

  // @namespace Map
  // @section Control options
  // @option attributionControl: Boolean = true
  // Whether a [attribution control](#control-attribution) is added to the map by default.
  Map.mergeOptions({
  	attributionControl: true
  });

  Map.addInitHook(function () {
  	if (this.options.attributionControl) {
  		new Attribution().addTo(this);
  	}
  });

  // @namespace Control.Attribution
  // @factory L.control.attribution(options: Control.Attribution options)
  // Creates an attribution control.
  var attribution = function (options) {
  	return new Attribution(options);
  };

  Control.Layers = Layers;
  Control.Zoom = Zoom;
  Control.Scale = Scale;
  Control.Attribution = Attribution;

  control.layers = layers;
  control.zoom = zoom;
  control.scale = scale;
  control.attribution = attribution;

  /*
  	L.Handler is a base class for handler classes that are used internally to inject
  	interaction features like dragging to classes like Map and Marker.
  */

  // @class Handler
  // @aka L.Handler
  // Abstract class for map interaction handlers

  var Handler = Class.extend({
  	initialize: function (map) {
  		this._map = map;
  	},

  	// @method enable(): this
  	// Enables the handler
  	enable: function () {
  		if (this._enabled) { return this; }

  		this._enabled = true;
  		this.addHooks();
  		return this;
  	},

  	// @method disable(): this
  	// Disables the handler
  	disable: function () {
  		if (!this._enabled) { return this; }

  		this._enabled = false;
  		this.removeHooks();
  		return this;
  	},

  	// @method enabled(): Boolean
  	// Returns `true` if the handler is enabled
  	enabled: function () {
  		return !!this._enabled;
  	}

  	// @section Extension methods
  	// Classes inheriting from `Handler` must implement the two following methods:
  	// @method addHooks()
  	// Called when the handler is enabled, should add event hooks.
  	// @method removeHooks()
  	// Called when the handler is disabled, should remove the event hooks added previously.
  });

  // @section There is static function which can be called without instantiating L.Handler:
  // @function addTo(map: Map, name: String): this
  // Adds a new Handler to the given map with the given name.
  Handler.addTo = function (map, name) {
  	map.addHandler(name, this);
  	return this;
  };

  var Mixin = {Events: Events};

  /*
   * @class Draggable
   * @aka L.Draggable
   * @inherits Evented
   *
   * A class for making DOM elements draggable (including touch support).
   * Used internally for map and marker dragging. Only works for elements
   * that were positioned with [`L.DomUtil.setPosition`](#domutil-setposition).
   *
   * @example
   * ```js
   * var draggable = new L.Draggable(elementToDrag);
   * draggable.enable();
   * ```
   */

  var START = touch ? 'touchstart mousedown' : 'mousedown';
  var END = {
  	mousedown: 'mouseup',
  	touchstart: 'touchend',
  	pointerdown: 'touchend',
  	MSPointerDown: 'touchend'
  };
  var MOVE = {
  	mousedown: 'mousemove',
  	touchstart: 'touchmove',
  	pointerdown: 'touchmove',
  	MSPointerDown: 'touchmove'
  };


  var Draggable = Evented.extend({

  	options: {
  		// @section
  		// @aka Draggable options
  		// @option clickTolerance: Number = 3
  		// The max number of pixels a user can shift the mouse pointer during a click
  		// for it to be considered a valid click (as opposed to a mouse drag).
  		clickTolerance: 3
  	},

  	// @constructor L.Draggable(el: HTMLElement, dragHandle?: HTMLElement, preventOutline?: Boolean, options?: Draggable options)
  	// Creates a `Draggable` object for moving `el` when you start dragging the `dragHandle` element (equals `el` itself by default).
  	initialize: function (element, dragStartTarget, preventOutline$$1, options) {
  		setOptions(this, options);

  		this._element = element;
  		this._dragStartTarget = dragStartTarget || element;
  		this._preventOutline = preventOutline$$1;
  	},

  	// @method enable()
  	// Enables the dragging ability
  	enable: function () {
  		if (this._enabled) { return; }

  		on(this._dragStartTarget, START, this._onDown, this);

  		this._enabled = true;
  	},

  	// @method disable()
  	// Disables the dragging ability
  	disable: function () {
  		if (!this._enabled) { return; }

  		// If we're currently dragging this draggable,
  		// disabling it counts as first ending the drag.
  		if (Draggable._dragging === this) {
  			this.finishDrag();
  		}

  		off(this._dragStartTarget, START, this._onDown, this);

  		this._enabled = false;
  		this._moved = false;
  	},

  	_onDown: function (e) {
  		// Ignore simulated events, since we handle both touch and
  		// mouse explicitly; otherwise we risk getting duplicates of
  		// touch events, see #4315.
  		// Also ignore the event if disabled; this happens in IE11
  		// under some circumstances, see #3666.
  		if (e._simulated || !this._enabled) { return; }

  		this._moved = false;

  		if (hasClass(this._element, 'leaflet-zoom-anim')) { return; }

  		if (Draggable._dragging || e.shiftKey || ((e.which !== 1) && (e.button !== 1) && !e.touches)) { return; }
  		Draggable._dragging = this;  // Prevent dragging multiple objects at once.

  		if (this._preventOutline) {
  			preventOutline(this._element);
  		}

  		disableImageDrag();
  		disableTextSelection();

  		if (this._moving) { return; }

  		// @event down: Event
  		// Fired when a drag is about to start.
  		this.fire('down');

  		var first = e.touches ? e.touches[0] : e,
  		    sizedParent = getSizedParentNode(this._element);

  		this._startPoint = new Point(first.clientX, first.clientY);

  		// Cache the scale, so that we can continuously compensate for it during drag (_onMove).
  		this._parentScale = getScale(sizedParent);

  		on(document, MOVE[e.type], this._onMove, this);
  		on(document, END[e.type], this._onUp, this);
  	},

  	_onMove: function (e) {
  		// Ignore simulated events, since we handle both touch and
  		// mouse explicitly; otherwise we risk getting duplicates of
  		// touch events, see #4315.
  		// Also ignore the event if disabled; this happens in IE11
  		// under some circumstances, see #3666.
  		if (e._simulated || !this._enabled) { return; }

  		if (e.touches && e.touches.length > 1) {
  			this._moved = true;
  			return;
  		}

  		var first = (e.touches && e.touches.length === 1 ? e.touches[0] : e),
  		    offset = new Point(first.clientX, first.clientY)._subtract(this._startPoint);

  		if (!offset.x && !offset.y) { return; }
  		if (Math.abs(offset.x) + Math.abs(offset.y) < this.options.clickTolerance) { return; }

  		// We assume that the parent container's position, border and scale do not change for the duration of the drag.
  		// Therefore there is no need to account for the position and border (they are eliminated by the subtraction)
  		// and we can use the cached value for the scale.
  		offset.x /= this._parentScale.x;
  		offset.y /= this._parentScale.y;

  		preventDefault(e);

  		if (!this._moved) {
  			// @event dragstart: Event
  			// Fired when a drag starts
  			this.fire('dragstart');

  			this._moved = true;
  			this._startPos = getPosition(this._element).subtract(offset);

  			addClass(document.body, 'leaflet-dragging');

  			this._lastTarget = e.target || e.srcElement;
  			// IE and Edge do not give the <use> element, so fetch it
  			// if necessary
  			if ((window.SVGElementInstance) && (this._lastTarget instanceof SVGElementInstance)) {
  				this._lastTarget = this._lastTarget.correspondingUseElement;
  			}
  			addClass(this._lastTarget, 'leaflet-drag-target');
  		}

  		this._newPos = this._startPos.add(offset);
  		this._moving = true;

  		cancelAnimFrame(this._animRequest);
  		this._lastEvent = e;
  		this._animRequest = requestAnimFrame(this._updatePosition, this, true);
  	},

  	_updatePosition: function () {
  		var e = {originalEvent: this._lastEvent};

  		// @event predrag: Event
  		// Fired continuously during dragging *before* each corresponding
  		// update of the element's position.
  		this.fire('predrag', e);
  		setPosition(this._element, this._newPos);

  		// @event drag: Event
  		// Fired continuously during dragging.
  		this.fire('drag', e);
  	},

  	_onUp: function (e) {
  		// Ignore simulated events, since we handle both touch and
  		// mouse explicitly; otherwise we risk getting duplicates of
  		// touch events, see #4315.
  		// Also ignore the event if disabled; this happens in IE11
  		// under some circumstances, see #3666.
  		if (e._simulated || !this._enabled) { return; }
  		this.finishDrag();
  	},

  	finishDrag: function () {
  		removeClass(document.body, 'leaflet-dragging');

  		if (this._lastTarget) {
  			removeClass(this._lastTarget, 'leaflet-drag-target');
  			this._lastTarget = null;
  		}

  		for (var i in MOVE) {
  			off(document, MOVE[i], this._onMove, this);
  			off(document, END[i], this._onUp, this);
  		}

  		enableImageDrag();
  		enableTextSelection();

  		if (this._moved && this._moving) {
  			// ensure drag is not fired after dragend
  			cancelAnimFrame(this._animRequest);

  			// @event dragend: DragEndEvent
  			// Fired when the drag ends.
  			this.fire('dragend', {
  				distance: this._newPos.distanceTo(this._startPos)
  			});
  		}

  		this._moving = false;
  		Draggable._dragging = false;
  	}

  });

  /*
   * @namespace LineUtil
   *
   * Various utility functions for polyline points processing, used by Leaflet internally to make polylines lightning-fast.
   */

  // Simplify polyline with vertex reduction and Douglas-Peucker simplification.
  // Improves rendering performance dramatically by lessening the number of points to draw.

  // @function simplify(points: Point[], tolerance: Number): Point[]
  // Dramatically reduces the number of points in a polyline while retaining
  // its shape and returns a new array of simplified points, using the
  // [Douglas-Peucker algorithm](http://en.wikipedia.org/wiki/Douglas-Peucker_algorithm).
  // Used for a huge performance boost when processing/displaying Leaflet polylines for
  // each zoom level and also reducing visual noise. tolerance affects the amount of
  // simplification (lesser value means higher quality but slower and with more points).
  // Also released as a separated micro-library [Simplify.js](http://mourner.github.com/simplify-js/).
  function simplify(points, tolerance) {
  	if (!tolerance || !points.length) {
  		return points.slice();
  	}

  	var sqTolerance = tolerance * tolerance;

  	    // stage 1: vertex reduction
  	    points = _reducePoints(points, sqTolerance);

  	    // stage 2: Douglas-Peucker simplification
  	    points = _simplifyDP(points, sqTolerance);

  	return points;
  }

  // @function pointToSegmentDistance(p: Point, p1: Point, p2: Point): Number
  // Returns the distance between point `p` and segment `p1` to `p2`.
  function pointToSegmentDistance(p, p1, p2) {
  	return Math.sqrt(_sqClosestPointOnSegment(p, p1, p2, true));
  }

  // @function closestPointOnSegment(p: Point, p1: Point, p2: Point): Number
  // Returns the closest point from a point `p` on a segment `p1` to `p2`.
  function closestPointOnSegment(p, p1, p2) {
  	return _sqClosestPointOnSegment(p, p1, p2);
  }

  // Douglas-Peucker simplification, see http://en.wikipedia.org/wiki/Douglas-Peucker_algorithm
  function _simplifyDP(points, sqTolerance) {

  	var len = points.length,
  	    ArrayConstructor = typeof Uint8Array !== undefined + '' ? Uint8Array : Array,
  	    markers = new ArrayConstructor(len);

  	    markers[0] = markers[len - 1] = 1;

  	_simplifyDPStep(points, markers, sqTolerance, 0, len - 1);

  	var i,
  	    newPoints = [];

  	for (i = 0; i < len; i++) {
  		if (markers[i]) {
  			newPoints.push(points[i]);
  		}
  	}

  	return newPoints;
  }

  function _simplifyDPStep(points, markers, sqTolerance, first, last) {

  	var maxSqDist = 0,
  	index, i, sqDist;

  	for (i = first + 1; i <= last - 1; i++) {
  		sqDist = _sqClosestPointOnSegment(points[i], points[first], points[last], true);

  		if (sqDist > maxSqDist) {
  			index = i;
  			maxSqDist = sqDist;
  		}
  	}

  	if (maxSqDist > sqTolerance) {
  		markers[index] = 1;

  		_simplifyDPStep(points, markers, sqTolerance, first, index);
  		_simplifyDPStep(points, markers, sqTolerance, index, last);
  	}
  }

  // reduce points that are too close to each other to a single point
  function _reducePoints(points, sqTolerance) {
  	var reducedPoints = [points[0]];

  	for (var i = 1, prev = 0, len = points.length; i < len; i++) {
  		if (_sqDist(points[i], points[prev]) > sqTolerance) {
  			reducedPoints.push(points[i]);
  			prev = i;
  		}
  	}
  	if (prev < len - 1) {
  		reducedPoints.push(points[len - 1]);
  	}
  	return reducedPoints;
  }

  var _lastCode;

  // @function clipSegment(a: Point, b: Point, bounds: Bounds, useLastCode?: Boolean, round?: Boolean): Point[]|Boolean
  // Clips the segment a to b by rectangular bounds with the
  // [Cohen-Sutherland algorithm](https://en.wikipedia.org/wiki/Cohen%E2%80%93Sutherland_algorithm)
  // (modifying the segment points directly!). Used by Leaflet to only show polyline
  // points that are on the screen or near, increasing performance.
  function clipSegment(a, b, bounds, useLastCode, round) {
  	var codeA = useLastCode ? _lastCode : _getBitCode(a, bounds),
  	    codeB = _getBitCode(b, bounds),

  	    codeOut, p, newCode;

  	    // save 2nd code to avoid calculating it on the next segment
  	    _lastCode = codeB;

  	while (true) {
  		// if a,b is inside the clip window (trivial accept)
  		if (!(codeA | codeB)) {
  			return [a, b];
  		}

  		// if a,b is outside the clip window (trivial reject)
  		if (codeA & codeB) {
  			return false;
  		}

  		// other cases
  		codeOut = codeA || codeB;
  		p = _getEdgeIntersection(a, b, codeOut, bounds, round);
  		newCode = _getBitCode(p, bounds);

  		if (codeOut === codeA) {
  			a = p;
  			codeA = newCode;
  		} else {
  			b = p;
  			codeB = newCode;
  		}
  	}
  }

  function _getEdgeIntersection(a, b, code, bounds, round) {
  	var dx = b.x - a.x,
  	    dy = b.y - a.y,
  	    min = bounds.min,
  	    max = bounds.max,
  	    x, y;

  	if (code & 8) { // top
  		x = a.x + dx * (max.y - a.y) / dy;
  		y = max.y;

  	} else if (code & 4) { // bottom
  		x = a.x + dx * (min.y - a.y) / dy;
  		y = min.y;

  	} else if (code & 2) { // right
  		x = max.x;
  		y = a.y + dy * (max.x - a.x) / dx;

  	} else if (code & 1) { // left
  		x = min.x;
  		y = a.y + dy * (min.x - a.x) / dx;
  	}

  	return new Point(x, y, round);
  }

  function _getBitCode(p, bounds) {
  	var code = 0;

  	if (p.x < bounds.min.x) { // left
  		code |= 1;
  	} else if (p.x > bounds.max.x) { // right
  		code |= 2;
  	}

  	if (p.y < bounds.min.y) { // bottom
  		code |= 4;
  	} else if (p.y > bounds.max.y) { // top
  		code |= 8;
  	}

  	return code;
  }

  // square distance (to avoid unnecessary Math.sqrt calls)
  function _sqDist(p1, p2) {
  	var dx = p2.x - p1.x,
  	    dy = p2.y - p1.y;
  	return dx * dx + dy * dy;
  }

  // return closest point on segment or distance to that point
  function _sqClosestPointOnSegment(p, p1, p2, sqDist) {
  	var x = p1.x,
  	    y = p1.y,
  	    dx = p2.x - x,
  	    dy = p2.y - y,
  	    dot = dx * dx + dy * dy,
  	    t;

  	if (dot > 0) {
  		t = ((p.x - x) * dx + (p.y - y) * dy) / dot;

  		if (t > 1) {
  			x = p2.x;
  			y = p2.y;
  		} else if (t > 0) {
  			x += dx * t;
  			y += dy * t;
  		}
  	}

  	dx = p.x - x;
  	dy = p.y - y;

  	return sqDist ? dx * dx + dy * dy : new Point(x, y);
  }


  // @function isFlat(latlngs: LatLng[]): Boolean
  // Returns true if `latlngs` is a flat array, false is nested.
  function isFlat(latlngs) {
  	return !isArray(latlngs[0]) || (typeof latlngs[0][0] !== 'object' && typeof latlngs[0][0] !== 'undefined');
  }

  function _flat(latlngs) {
  	console.warn('Deprecated use of _flat, please use L.LineUtil.isFlat instead.');
  	return isFlat(latlngs);
  }


  var LineUtil = (Object.freeze || Object)({
  	simplify: simplify,
  	pointToSegmentDistance: pointToSegmentDistance,
  	closestPointOnSegment: closestPointOnSegment,
  	clipSegment: clipSegment,
  	_getEdgeIntersection: _getEdgeIntersection,
  	_getBitCode: _getBitCode,
  	_sqClosestPointOnSegment: _sqClosestPointOnSegment,
  	isFlat: isFlat,
  	_flat: _flat
  });

  /*
   * @namespace PolyUtil
   * Various utility functions for polygon geometries.
   */

  /* @function clipPolygon(points: Point[], bounds: Bounds, round?: Boolean): Point[]
   * Clips the polygon geometry defined by the given `points` by the given bounds (using the [Sutherland-Hodgman algorithm](https://en.wikipedia.org/wiki/Sutherland%E2%80%93Hodgman_algorithm)).
   * Used by Leaflet to only show polygon points that are on the screen or near, increasing
   * performance. Note that polygon points needs different algorithm for clipping
   * than polyline, so there's a separate method for it.
   */
  function clipPolygon(points, bounds, round) {
  	var clippedPoints,
  	    edges = [1, 4, 2, 8],
  	    i, j, k,
  	    a, b,
  	    len, edge, p;

  	for (i = 0, len = points.length; i < len; i++) {
  		points[i]._code = _getBitCode(points[i], bounds);
  	}

  	// for each edge (left, bottom, right, top)
  	for (k = 0; k < 4; k++) {
  		edge = edges[k];
  		clippedPoints = [];

  		for (i = 0, len = points.length, j = len - 1; i < len; j = i++) {
  			a = points[i];
  			b = points[j];

  			// if a is inside the clip window
  			if (!(a._code & edge)) {
  				// if b is outside the clip window (a->b goes out of screen)
  				if (b._code & edge) {
  					p = _getEdgeIntersection(b, a, edge, bounds, round);
  					p._code = _getBitCode(p, bounds);
  					clippedPoints.push(p);
  				}
  				clippedPoints.push(a);

  			// else if b is inside the clip window (a->b enters the screen)
  			} else if (!(b._code & edge)) {
  				p = _getEdgeIntersection(b, a, edge, bounds, round);
  				p._code = _getBitCode(p, bounds);
  				clippedPoints.push(p);
  			}
  		}
  		points = clippedPoints;
  	}

  	return points;
  }


  var PolyUtil = (Object.freeze || Object)({
  	clipPolygon: clipPolygon
  });

  /*
   * @namespace Projection
   * @section
   * Leaflet comes with a set of already defined Projections out of the box:
   *
   * @projection L.Projection.LonLat
   *
   * Equirectangular, or Plate Carree projection — the most simple projection,
   * mostly used by GIS enthusiasts. Directly maps `x` as longitude, and `y` as
   * latitude. Also suitable for flat worlds, e.g. game maps. Used by the
   * `EPSG:4326` and `Simple` CRS.
   */

  var LonLat = {
  	project: function (latlng) {
  		return new Point(latlng.lng, latlng.lat);
  	},

  	unproject: function (point) {
  		return new LatLng(point.y, point.x);
  	},

  	bounds: new Bounds([-180, -90], [180, 90])
  };

  /*
   * @namespace Projection
   * @projection L.Projection.Mercator
   *
   * Elliptical Mercator projection — more complex than Spherical Mercator. Assumes that Earth is an ellipsoid. Used by the EPSG:3395 CRS.
   */

  var Mercator = {
  	R: 6378137,
  	R_MINOR: 6356752.314245179,

  	bounds: new Bounds([-20037508.34279, -15496570.73972], [20037508.34279, 18764656.23138]),

  	project: function (latlng) {
  		var d = Math.PI / 180,
  		    r = this.R,
  		    y = latlng.lat * d,
  		    tmp = this.R_MINOR / r,
  		    e = Math.sqrt(1 - tmp * tmp),
  		    con = e * Math.sin(y);

  		var ts = Math.tan(Math.PI / 4 - y / 2) / Math.pow((1 - con) / (1 + con), e / 2);
  		y = -r * Math.log(Math.max(ts, 1E-10));

  		return new Point(latlng.lng * d * r, y);
  	},

  	unproject: function (point) {
  		var d = 180 / Math.PI,
  		    r = this.R,
  		    tmp = this.R_MINOR / r,
  		    e = Math.sqrt(1 - tmp * tmp),
  		    ts = Math.exp(-point.y / r),
  		    phi = Math.PI / 2 - 2 * Math.atan(ts);

  		for (var i = 0, dphi = 0.1, con; i < 15 && Math.abs(dphi) > 1e-7; i++) {
  			con = e * Math.sin(phi);
  			con = Math.pow((1 - con) / (1 + con), e / 2);
  			dphi = Math.PI / 2 - 2 * Math.atan(ts * con) - phi;
  			phi += dphi;
  		}

  		return new LatLng(phi * d, point.x * d / r);
  	}
  };

  /*
   * @class Projection

   * An object with methods for projecting geographical coordinates of the world onto
   * a flat surface (and back). See [Map projection](http://en.wikipedia.org/wiki/Map_projection).

   * @property bounds: Bounds
   * The bounds (specified in CRS units) where the projection is valid

   * @method project(latlng: LatLng): Point
   * Projects geographical coordinates into a 2D point.
   * Only accepts actual `L.LatLng` instances, not arrays.

   * @method unproject(point: Point): LatLng
   * The inverse of `project`. Projects a 2D point into a geographical location.
   * Only accepts actual `L.Point` instances, not arrays.

   * Note that the projection instances do not inherit from Leafet's `Class` object,
   * and can't be instantiated. Also, new classes can't inherit from them,
   * and methods can't be added to them with the `include` function.

   */




  var index = (Object.freeze || Object)({
  	LonLat: LonLat,
  	Mercator: Mercator,
  	SphericalMercator: SphericalMercator
  });

  /*
   * @namespace CRS
   * @crs L.CRS.EPSG3395
   *
   * Rarely used by some commercial tile providers. Uses Elliptical Mercator projection.
   */
  var EPSG3395 = extend({}, Earth, {
  	code: 'EPSG:3395',
  	projection: Mercator,

  	transformation: (function () {
  		var scale = 0.5 / (Math.PI * Mercator.R);
  		return toTransformation(scale, 0.5, -scale, 0.5);
  	}())
  });

  /*
   * @namespace CRS
   * @crs L.CRS.EPSG4326
   *
   * A common CRS among GIS enthusiasts. Uses simple Equirectangular projection.
   *
   * Leaflet 1.0.x complies with the [TMS coordinate scheme for EPSG:4326](https://wiki.osgeo.org/wiki/Tile_Map_Service_Specification#global-geodetic),
   * which is a breaking change from 0.7.x behaviour.  If you are using a `TileLayer`
   * with this CRS, ensure that there are two 256x256 pixel tiles covering the
   * whole earth at zoom level zero, and that the tile coordinate origin is (-180,+90),
   * or (-180,-90) for `TileLayer`s with [the `tms` option](#tilelayer-tms) set.
   */

  var EPSG4326 = extend({}, Earth, {
  	code: 'EPSG:4326',
  	projection: LonLat,
  	transformation: toTransformation(1 / 180, 1, -1 / 180, 0.5)
  });

  /*
   * @namespace CRS
   * @crs L.CRS.Simple
   *
   * A simple CRS that maps longitude and latitude into `x` and `y` directly.
   * May be used for maps of flat surfaces (e.g. game maps). Note that the `y`
   * axis should still be inverted (going from bottom to top). `distance()` returns
   * simple euclidean distance.
   */

  var Simple = extend({}, CRS, {
  	projection: LonLat,
  	transformation: toTransformation(1, 0, -1, 0),

  	scale: function (zoom) {
  		return Math.pow(2, zoom);
  	},

  	zoom: function (scale) {
  		return Math.log(scale) / Math.LN2;
  	},

  	distance: function (latlng1, latlng2) {
  		var dx = latlng2.lng - latlng1.lng,
  		    dy = latlng2.lat - latlng1.lat;

  		return Math.sqrt(dx * dx + dy * dy);
  	},

  	infinite: true
  });

  CRS.Earth = Earth;
  CRS.EPSG3395 = EPSG3395;
  CRS.EPSG3857 = EPSG3857;
  CRS.EPSG900913 = EPSG900913;
  CRS.EPSG4326 = EPSG4326;
  CRS.Simple = Simple;

  /*
   * @class Layer
   * @inherits Evented
   * @aka L.Layer
   * @aka ILayer
   *
   * A set of methods from the Layer base class that all Leaflet layers use.
   * Inherits all methods, options and events from `L.Evented`.
   *
   * @example
   *
   * ```js
   * var layer = L.marker(latlng).addTo(map);
   * layer.addTo(map);
   * layer.remove();
   * ```
   *
   * @event add: Event
   * Fired after the layer is added to a map
   *
   * @event remove: Event
   * Fired after the layer is removed from a map
   */


  var Layer = Evented.extend({

  	// Classes extending `L.Layer` will inherit the following options:
  	options: {
  		// @option pane: String = 'overlayPane'
  		// By default the layer will be added to the map's [overlay pane](#map-overlaypane). Overriding this option will cause the layer to be placed on another pane by default.
  		pane: 'overlayPane',

  		// @option attribution: String = null
  		// String to be shown in the attribution control, e.g. "© OpenStreetMap contributors". It describes the layer data and is often a legal obligation towards copyright holders and tile providers.
  		attribution: null,

  		bubblingMouseEvents: true
  	},

  	/* @section
  	 * Classes extending `L.Layer` will inherit the following methods:
  	 *
  	 * @method addTo(map: Map|LayerGroup): this
  	 * Adds the layer to the given map or layer group.
  	 */
  	addTo: function (map) {
  		map.addLayer(this);
  		return this;
  	},

  	// @method remove: this
  	// Removes the layer from the map it is currently active on.
  	remove: function () {
  		return this.removeFrom(this._map || this._mapToAdd);
  	},

  	// @method removeFrom(map: Map): this
  	// Removes the layer from the given map
  	removeFrom: function (obj) {
  		if (obj) {
  			obj.removeLayer(this);
  		}
  		return this;
  	},

  	// @method getPane(name? : String): HTMLElement
  	// Returns the `HTMLElement` representing the named pane on the map. If `name` is omitted, returns the pane for this layer.
  	getPane: function (name) {
  		return this._map.getPane(name ? (this.options[name] || name) : this.options.pane);
  	},

  	addInteractiveTarget: function (targetEl) {
  		this._map._targets[stamp(targetEl)] = this;
  		return this;
  	},

  	removeInteractiveTarget: function (targetEl) {
  		delete this._map._targets[stamp(targetEl)];
  		return this;
  	},

  	// @method getAttribution: String
  	// Used by the `attribution control`, returns the [attribution option](#gridlayer-attribution).
  	getAttribution: function () {
  		return this.options.attribution;
  	},

  	_layerAdd: function (e) {
  		var map = e.target;

  		// check in case layer gets added and then removed before the map is ready
  		if (!map.hasLayer(this)) { return; }

  		this._map = map;
  		this._zoomAnimated = map._zoomAnimated;

  		if (this.getEvents) {
  			var events = this.getEvents();
  			map.on(events, this);
  			this.once('remove', function () {
  				map.off(events, this);
  			}, this);
  		}

  		this.onAdd(map);

  		if (this.getAttribution && map.attributionControl) {
  			map.attributionControl.addAttribution(this.getAttribution());
  		}

  		this.fire('add');
  		map.fire('layeradd', {layer: this});
  	}
  });

  /* @section Extension methods
   * @uninheritable
   *
   * Every layer should extend from `L.Layer` and (re-)implement the following methods.
   *
   * @method onAdd(map: Map): this
   * Should contain code that creates DOM elements for the layer, adds them to `map panes` where they should belong and puts listeners on relevant map events. Called on [`map.addLayer(layer)`](#map-addlayer).
   *
   * @method onRemove(map: Map): this
   * Should contain all clean up code that removes the layer's elements from the DOM and removes listeners previously added in [`onAdd`](#layer-onadd). Called on [`map.removeLayer(layer)`](#map-removelayer).
   *
   * @method getEvents(): Object
   * This optional method should return an object like `{ viewreset: this._reset }` for [`addEventListener`](#evented-addeventlistener). The event handlers in this object will be automatically added and removed from the map with your layer.
   *
   * @method getAttribution(): String
   * This optional method should return a string containing HTML to be shown on the `Attribution control` whenever the layer is visible.
   *
   * @method beforeAdd(map: Map): this
   * Optional method. Called on [`map.addLayer(layer)`](#map-addlayer), before the layer is added to the map, before events are initialized, without waiting until the map is in a usable state. Use for early initialization only.
   */


  /* @namespace Map
   * @section Layer events
   *
   * @event layeradd: LayerEvent
   * Fired when a new layer is added to the map.
   *
   * @event layerremove: LayerEvent
   * Fired when some layer is removed from the map
   *
   * @section Methods for Layers and Controls
   */
  Map.include({
  	// @method addLayer(layer: Layer): this
  	// Adds the given layer to the map
  	addLayer: function (layer) {
  		if (!layer._layerAdd) {
  			throw new Error('The provided object is not a Layer.');
  		}

  		var id = stamp(layer);
  		if (this._layers[id]) { return this; }
  		this._layers[id] = layer;

  		layer._mapToAdd = this;

  		if (layer.beforeAdd) {
  			layer.beforeAdd(this);
  		}

  		this.whenReady(layer._layerAdd, layer);

  		return this;
  	},

  	// @method removeLayer(layer: Layer): this
  	// Removes the given layer from the map.
  	removeLayer: function (layer) {
  		var id = stamp(layer);

  		if (!this._layers[id]) { return this; }

  		if (this._loaded) {
  			layer.onRemove(this);
  		}

  		if (layer.getAttribution && this.attributionControl) {
  			this.attributionControl.removeAttribution(layer.getAttribution());
  		}

  		delete this._layers[id];

  		if (this._loaded) {
  			this.fire('layerremove', {layer: layer});
  			layer.fire('remove');
  		}

  		layer._map = layer._mapToAdd = null;

  		return this;
  	},

  	// @method hasLayer(layer: Layer): Boolean
  	// Returns `true` if the given layer is currently added to the map
  	hasLayer: function (layer) {
  		return !!layer && (stamp(layer) in this._layers);
  	},

  	/* @method eachLayer(fn: Function, context?: Object): this
  	 * Iterates over the layers of the map, optionally specifying context of the iterator function.
  	 * ```
  	 * map.eachLayer(function(layer){
  	 *     layer.bindPopup('Hello');
  	 * });
  	 * ```
  	 */
  	eachLayer: function (method, context) {
  		for (var i in this._layers) {
  			method.call(context, this._layers[i]);
  		}
  		return this;
  	},

  	_addLayers: function (layers) {
  		layers = layers ? (isArray(layers) ? layers : [layers]) : [];

  		for (var i = 0, len = layers.length; i < len; i++) {
  			this.addLayer(layers[i]);
  		}
  	},

  	_addZoomLimit: function (layer) {
  		if (isNaN(layer.options.maxZoom) || !isNaN(layer.options.minZoom)) {
  			this._zoomBoundLayers[stamp(layer)] = layer;
  			this._updateZoomLevels();
  		}
  	},

  	_removeZoomLimit: function (layer) {
  		var id = stamp(layer);

  		if (this._zoomBoundLayers[id]) {
  			delete this._zoomBoundLayers[id];
  			this._updateZoomLevels();
  		}
  	},

  	_updateZoomLevels: function () {
  		var minZoom = Infinity,
  		    maxZoom = -Infinity,
  		    oldZoomSpan = this._getZoomSpan();

  		for (var i in this._zoomBoundLayers) {
  			var options = this._zoomBoundLayers[i].options;

  			minZoom = options.minZoom === undefined ? minZoom : Math.min(minZoom, options.minZoom);
  			maxZoom = options.maxZoom === undefined ? maxZoom : Math.max(maxZoom, options.maxZoom);
  		}

  		this._layersMaxZoom = maxZoom === -Infinity ? undefined : maxZoom;
  		this._layersMinZoom = minZoom === Infinity ? undefined : minZoom;

  		// @section Map state change events
  		// @event zoomlevelschange: Event
  		// Fired when the number of zoomlevels on the map is changed due
  		// to adding or removing a layer.
  		if (oldZoomSpan !== this._getZoomSpan()) {
  			this.fire('zoomlevelschange');
  		}

  		if (this.options.maxZoom === undefined && this._layersMaxZoom && this.getZoom() > this._layersMaxZoom) {
  			this.setZoom(this._layersMaxZoom);
  		}
  		if (this.options.minZoom === undefined && this._layersMinZoom && this.getZoom() < this._layersMinZoom) {
  			this.setZoom(this._layersMinZoom);
  		}
  	}
  });

  /*
   * @class LayerGroup
   * @aka L.LayerGroup
   * @inherits Layer
   *
   * Used to group several layers and handle them as one. If you add it to the map,
   * any layers added or removed from the group will be added/removed on the map as
   * well. Extends `Layer`.
   *
   * @example
   *
   * ```js
   * L.layerGroup([marker1, marker2])
   * 	.addLayer(polyline)
   * 	.addTo(map);
   * ```
   */

  var LayerGroup = Layer.extend({

  	initialize: function (layers, options) {
  		setOptions(this, options);

  		this._layers = {};

  		var i, len;

  		if (layers) {
  			for (i = 0, len = layers.length; i < len; i++) {
  				this.addLayer(layers[i]);
  			}
  		}
  	},

  	// @method addLayer(layer: Layer): this
  	// Adds the given layer to the group.
  	addLayer: function (layer) {
  		var id = this.getLayerId(layer);

  		this._layers[id] = layer;

  		if (this._map) {
  			this._map.addLayer(layer);
  		}

  		return this;
  	},

  	// @method removeLayer(layer: Layer): this
  	// Removes the given layer from the group.
  	// @alternative
  	// @method removeLayer(id: Number): this
  	// Removes the layer with the given internal ID from the group.
  	removeLayer: function (layer) {
  		var id = layer in this._layers ? layer : this.getLayerId(layer);

  		if (this._map && this._layers[id]) {
  			this._map.removeLayer(this._layers[id]);
  		}

  		delete this._layers[id];

  		return this;
  	},

  	// @method hasLayer(layer: Layer): Boolean
  	// Returns `true` if the given layer is currently added to the group.
  	// @alternative
  	// @method hasLayer(id: Number): Boolean
  	// Returns `true` if the given internal ID is currently added to the group.
  	hasLayer: function (layer) {
  		return !!layer && (layer in this._layers || this.getLayerId(layer) in this._layers);
  	},

  	// @method clearLayers(): this
  	// Removes all the layers from the group.
  	clearLayers: function () {
  		return this.eachLayer(this.removeLayer, this);
  	},

  	// @method invoke(methodName: String, …): this
  	// Calls `methodName` on every layer contained in this group, passing any
  	// additional parameters. Has no effect if the layers contained do not
  	// implement `methodName`.
  	invoke: function (methodName) {
  		var args = Array.prototype.slice.call(arguments, 1),
  		    i, layer;

  		for (i in this._layers) {
  			layer = this._layers[i];

  			if (layer[methodName]) {
  				layer[methodName].apply(layer, args);
  			}
  		}

  		return this;
  	},

  	onAdd: function (map) {
  		this.eachLayer(map.addLayer, map);
  	},

  	onRemove: function (map) {
  		this.eachLayer(map.removeLayer, map);
  	},

  	// @method eachLayer(fn: Function, context?: Object): this
  	// Iterates over the layers of the group, optionally specifying context of the iterator function.
  	// ```js
  	// group.eachLayer(function (layer) {
  	// 	layer.bindPopup('Hello');
  	// });
  	// ```
  	eachLayer: function (method, context) {
  		for (var i in this._layers) {
  			method.call(context, this._layers[i]);
  		}
  		return this;
  	},

  	// @method getLayer(id: Number): Layer
  	// Returns the layer with the given internal ID.
  	getLayer: function (id) {
  		return this._layers[id];
  	},

  	// @method getLayers(): Layer[]
  	// Returns an array of all the layers added to the group.
  	getLayers: function () {
  		var layers = [];
  		this.eachLayer(layers.push, layers);
  		return layers;
  	},

  	// @method setZIndex(zIndex: Number): this
  	// Calls `setZIndex` on every layer contained in this group, passing the z-index.
  	setZIndex: function (zIndex) {
  		return this.invoke('setZIndex', zIndex);
  	},

  	// @method getLayerId(layer: Layer): Number
  	// Returns the internal ID for a layer
  	getLayerId: function (layer) {
  		return stamp(layer);
  	}
  });


  // @factory L.layerGroup(layers?: Layer[], options?: Object)
  // Create a layer group, optionally given an initial set of layers and an `options` object.
  var layerGroup = function (layers, options) {
  	return new LayerGroup(layers, options);
  };

  /*
   * @class FeatureGroup
   * @aka L.FeatureGroup
   * @inherits LayerGroup
   *
   * Extended `LayerGroup` that makes it easier to do the same thing to all its member layers:
   *  * [`bindPopup`](#layer-bindpopup) binds a popup to all of the layers at once (likewise with [`bindTooltip`](#layer-bindtooltip))
   *  * Events are propagated to the `FeatureGroup`, so if the group has an event
   * handler, it will handle events from any of the layers. This includes mouse events
   * and custom events.
   *  * Has `layeradd` and `layerremove` events
   *
   * @example
   *
   * ```js
   * L.featureGroup([marker1, marker2, polyline])
   * 	.bindPopup('Hello world!')
   * 	.on('click', function() { alert('Clicked on a member of the group!'); })
   * 	.addTo(map);
   * ```
   */

  var FeatureGroup = LayerGroup.extend({

  	addLayer: function (layer) {
  		if (this.hasLayer(layer)) {
  			return this;
  		}

  		layer.addEventParent(this);

  		LayerGroup.prototype.addLayer.call(this, layer);

  		// @event layeradd: LayerEvent
  		// Fired when a layer is added to this `FeatureGroup`
  		return this.fire('layeradd', {layer: layer});
  	},

  	removeLayer: function (layer) {
  		if (!this.hasLayer(layer)) {
  			return this;
  		}
  		if (layer in this._layers) {
  			layer = this._layers[layer];
  		}

  		layer.removeEventParent(this);

  		LayerGroup.prototype.removeLayer.call(this, layer);

  		// @event layerremove: LayerEvent
  		// Fired when a layer is removed from this `FeatureGroup`
  		return this.fire('layerremove', {layer: layer});
  	},

  	// @method setStyle(style: Path options): this
  	// Sets the given path options to each layer of the group that has a `setStyle` method.
  	setStyle: function (style) {
  		return this.invoke('setStyle', style);
  	},

  	// @method bringToFront(): this
  	// Brings the layer group to the top of all other layers
  	bringToFront: function () {
  		return this.invoke('bringToFront');
  	},

  	// @method bringToBack(): this
  	// Brings the layer group to the back of all other layers
  	bringToBack: function () {
  		return this.invoke('bringToBack');
  	},

  	// @method getBounds(): LatLngBounds
  	// Returns the LatLngBounds of the Feature Group (created from bounds and coordinates of its children).
  	getBounds: function () {
  		var bounds = new LatLngBounds();

  		for (var id in this._layers) {
  			var layer = this._layers[id];
  			bounds.extend(layer.getBounds ? layer.getBounds() : layer.getLatLng());
  		}
  		return bounds;
  	}
  });

  // @factory L.featureGroup(layers: Layer[])
  // Create a feature group, optionally given an initial set of layers.
  var featureGroup = function (layers) {
  	return new FeatureGroup(layers);
  };

  /*
   * @class Icon
   * @aka L.Icon
   *
   * Represents an icon to provide when creating a marker.
   *
   * @example
   *
   * ```js
   * var myIcon = L.icon({
   *     iconUrl: 'my-icon.png',
   *     iconRetinaUrl: 'my-icon@2x.png',
   *     iconSize: [38, 95],
   *     iconAnchor: [22, 94],
   *     popupAnchor: [-3, -76],
   *     shadowUrl: 'my-icon-shadow.png',
   *     shadowRetinaUrl: 'my-icon-shadow@2x.png',
   *     shadowSize: [68, 95],
   *     shadowAnchor: [22, 94]
   * });
   *
   * L.marker([50.505, 30.57], {icon: myIcon}).addTo(map);
   * ```
   *
   * `L.Icon.Default` extends `L.Icon` and is the blue icon Leaflet uses for markers by default.
   *
   */

  var Icon = Class.extend({

  	/* @section
  	 * @aka Icon options
  	 *
  	 * @option iconUrl: String = null
  	 * **(required)** The URL to the icon image (absolute or relative to your script path).
  	 *
  	 * @option iconRetinaUrl: String = null
  	 * The URL to a retina sized version of the icon image (absolute or relative to your
  	 * script path). Used for Retina screen devices.
  	 *
  	 * @option iconSize: Point = null
  	 * Size of the icon image in pixels.
  	 *
  	 * @option iconAnchor: Point = null
  	 * The coordinates of the "tip" of the icon (relative to its top left corner). The icon
  	 * will be aligned so that this point is at the marker's geographical location. Centered
  	 * by default if size is specified, also can be set in CSS with negative margins.
  	 *
  	 * @option popupAnchor: Point = [0, 0]
  	 * The coordinates of the point from which popups will "open", relative to the icon anchor.
  	 *
  	 * @option tooltipAnchor: Point = [0, 0]
  	 * The coordinates of the point from which tooltips will "open", relative to the icon anchor.
  	 *
  	 * @option shadowUrl: String = null
  	 * The URL to the icon shadow image. If not specified, no shadow image will be created.
  	 *
  	 * @option shadowRetinaUrl: String = null
  	 *
  	 * @option shadowSize: Point = null
  	 * Size of the shadow image in pixels.
  	 *
  	 * @option shadowAnchor: Point = null
  	 * The coordinates of the "tip" of the shadow (relative to its top left corner) (the same
  	 * as iconAnchor if not specified).
  	 *
  	 * @option className: String = ''
  	 * A custom class name to assign to both icon and shadow images. Empty by default.
  	 */

  	options: {
  		popupAnchor: [0, 0],
  		tooltipAnchor: [0, 0]
  	},

  	initialize: function (options) {
  		setOptions(this, options);
  	},

  	// @method createIcon(oldIcon?: HTMLElement): HTMLElement
  	// Called internally when the icon has to be shown, returns a `<img>` HTML element
  	// styled according to the options.
  	createIcon: function (oldIcon) {
  		return this._createIcon('icon', oldIcon);
  	},

  	// @method createShadow(oldIcon?: HTMLElement): HTMLElement
  	// As `createIcon`, but for the shadow beneath it.
  	createShadow: function (oldIcon) {
  		return this._createIcon('shadow', oldIcon);
  	},

  	_createIcon: function (name, oldIcon) {
  		var src = this._getIconUrl(name);

  		if (!src) {
  			if (name === 'icon') {
  				throw new Error('iconUrl not set in Icon options (see the docs).');
  			}
  			return null;
  		}

  		var img = this._createImg(src, oldIcon && oldIcon.tagName === 'IMG' ? oldIcon : null);
  		this._setIconStyles(img, name);

  		return img;
  	},

  	_setIconStyles: function (img, name) {
  		var options = this.options;
  		var sizeOption = options[name + 'Size'];

  		if (typeof sizeOption === 'number') {
  			sizeOption = [sizeOption, sizeOption];
  		}

  		var size = toPoint(sizeOption),
  		    anchor = toPoint(name === 'shadow' && options.shadowAnchor || options.iconAnchor ||
  		            size && size.divideBy(2, true));

  		img.className = 'leaflet-marker-' + name + ' ' + (options.className || '');

  		if (anchor) {
  			img.style.marginLeft = (-anchor.x) + 'px';
  			img.style.marginTop  = (-anchor.y) + 'px';
  		}

  		if (size) {
  			img.style.width  = size.x + 'px';
  			img.style.height = size.y + 'px';
  		}
  	},

  	_createImg: function (src, el) {
  		el = el || document.createElement('img');
  		el.src = src;
  		return el;
  	},

  	_getIconUrl: function (name) {
  		return retina && this.options[name + 'RetinaUrl'] || this.options[name + 'Url'];
  	}
  });


  // @factory L.icon(options: Icon options)
  // Creates an icon instance with the given options.
  function icon(options) {
  	return new Icon(options);
  }

  /*
   * @miniclass Icon.Default (Icon)
   * @aka L.Icon.Default
   * @section
   *
   * A trivial subclass of `Icon`, represents the icon to use in `Marker`s when
   * no icon is specified. Points to the blue marker image distributed with Leaflet
   * releases.
   *
   * In order to customize the default icon, just change the properties of `L.Icon.Default.prototype.options`
   * (which is a set of `Icon options`).
   *
   * If you want to _completely_ replace the default icon, override the
   * `L.Marker.prototype.options.icon` with your own icon instead.
   */

  var IconDefault = Icon.extend({

  	options: {
  		iconUrl:       'marker-icon.png',
  		iconRetinaUrl: 'marker-icon-2x.png',
  		shadowUrl:     'marker-shadow.png',
  		iconSize:    [25, 41],
  		iconAnchor:  [12, 41],
  		popupAnchor: [1, -34],
  		tooltipAnchor: [16, -28],
  		shadowSize:  [41, 41]
  	},

  	_getIconUrl: function (name) {
  		if (!IconDefault.imagePath) {	// Deprecated, backwards-compatibility only
  			IconDefault.imagePath = this._detectIconPath();
  		}

  		// @option imagePath: String
  		// `Icon.Default` will try to auto-detect the location of the
  		// blue icon images. If you are placing these images in a non-standard
  		// way, set this option to point to the right path.
  		return (this.options.imagePath || IconDefault.imagePath) + Icon.prototype._getIconUrl.call(this, name);
  	},

  	_detectIconPath: function () {
  		var el = create$1('div',  'leaflet-default-icon-path', document.body);
  		var path = getStyle(el, 'background-image') ||
  		           getStyle(el, 'backgroundImage');	// IE8

  		document.body.removeChild(el);

  		if (path === null || path.indexOf('url') !== 0) {
  			path = '';
  		} else {
  			path = path.replace(/^url\(["']?/, '').replace(/marker-icon\.png["']?\)$/, '');
  		}

  		return path;
  	}
  });

  /*
   * L.Handler.MarkerDrag is used internally by L.Marker to make the markers draggable.
   */


  /* @namespace Marker
   * @section Interaction handlers
   *
   * Interaction handlers are properties of a marker instance that allow you to control interaction behavior in runtime, enabling or disabling certain features such as dragging (see `Handler` methods). Example:
   *
   * ```js
   * marker.dragging.disable();
   * ```
   *
   * @property dragging: Handler
   * Marker dragging handler (by both mouse and touch). Only valid when the marker is on the map (Otherwise set [`marker.options.draggable`](#marker-draggable)).
   */

  var MarkerDrag = Handler.extend({
  	initialize: function (marker) {
  		this._marker = marker;
  	},

  	addHooks: function () {
  		var icon = this._marker._icon;

  		if (!this._draggable) {
  			this._draggable = new Draggable(icon, icon, true);
  		}

  		this._draggable.on({
  			dragstart: this._onDragStart,
  			predrag: this._onPreDrag,
  			drag: this._onDrag,
  			dragend: this._onDragEnd
  		}, this).enable();

  		addClass(icon, 'leaflet-marker-draggable');
  	},

  	removeHooks: function () {
  		this._draggable.off({
  			dragstart: this._onDragStart,
  			predrag: this._onPreDrag,
  			drag: this._onDrag,
  			dragend: this._onDragEnd
  		}, this).disable();

  		if (this._marker._icon) {
  			removeClass(this._marker._icon, 'leaflet-marker-draggable');
  		}
  	},

  	moved: function () {
  		return this._draggable && this._draggable._moved;
  	},

  	_adjustPan: function (e) {
  		var marker = this._marker,
  		    map = marker._map,
  		    speed = this._marker.options.autoPanSpeed,
  		    padding = this._marker.options.autoPanPadding,
  		    iconPos = getPosition(marker._icon),
  		    bounds = map.getPixelBounds(),
  		    origin = map.getPixelOrigin();

  		var panBounds = toBounds(
  			bounds.min._subtract(origin).add(padding),
  			bounds.max._subtract(origin).subtract(padding)
  		);

  		if (!panBounds.contains(iconPos)) {
  			// Compute incremental movement
  			var movement = toPoint(
  				(Math.max(panBounds.max.x, iconPos.x) - panBounds.max.x) / (bounds.max.x - panBounds.max.x) -
  				(Math.min(panBounds.min.x, iconPos.x) - panBounds.min.x) / (bounds.min.x - panBounds.min.x),

  				(Math.max(panBounds.max.y, iconPos.y) - panBounds.max.y) / (bounds.max.y - panBounds.max.y) -
  				(Math.min(panBounds.min.y, iconPos.y) - panBounds.min.y) / (bounds.min.y - panBounds.min.y)
  			).multiplyBy(speed);

  			map.panBy(movement, {animate: false});

  			this._draggable._newPos._add(movement);
  			this._draggable._startPos._add(movement);

  			setPosition(marker._icon, this._draggable._newPos);
  			this._onDrag(e);

  			this._panRequest = requestAnimFrame(this._adjustPan.bind(this, e));
  		}
  	},

  	_onDragStart: function () {
  		// @section Dragging events
  		// @event dragstart: Event
  		// Fired when the user starts dragging the marker.

  		// @event movestart: Event
  		// Fired when the marker starts moving (because of dragging).

  		this._oldLatLng = this._marker.getLatLng();
  		this._marker
  		    .closePopup()
  		    .fire('movestart')
  		    .fire('dragstart');
  	},

  	_onPreDrag: function (e) {
  		if (this._marker.options.autoPan) {
  			cancelAnimFrame(this._panRequest);
  			this._panRequest = requestAnimFrame(this._adjustPan.bind(this, e));
  		}
  	},

  	_onDrag: function (e) {
  		var marker = this._marker,
  		    shadow = marker._shadow,
  		    iconPos = getPosition(marker._icon),
  		    latlng = marker._map.layerPointToLatLng(iconPos);

  		// update shadow position
  		if (shadow) {
  			setPosition(shadow, iconPos);
  		}

  		marker._latlng = latlng;
  		e.latlng = latlng;
  		e.oldLatLng = this._oldLatLng;

  		// @event drag: Event
  		// Fired repeatedly while the user drags the marker.
  		marker
  		    .fire('move', e)
  		    .fire('drag', e);
  	},

  	_onDragEnd: function (e) {
  		// @event dragend: DragEndEvent
  		// Fired when the user stops dragging the marker.

  		 cancelAnimFrame(this._panRequest);

  		// @event moveend: Event
  		// Fired when the marker stops moving (because of dragging).
  		delete this._oldLatLng;
  		this._marker
  		    .fire('moveend')
  		    .fire('dragend', e);
  	}
  });

  /*
   * @class Marker
   * @inherits Interactive layer
   * @aka L.Marker
   * L.Marker is used to display clickable/draggable icons on the map. Extends `Layer`.
   *
   * @example
   *
   * ```js
   * L.marker([50.5, 30.5]).addTo(map);
   * ```
   */

  var Marker = Layer.extend({

  	// @section
  	// @aka Marker options
  	options: {
  		// @option icon: Icon = *
  		// Icon instance to use for rendering the marker.
  		// See [Icon documentation](#L.Icon) for details on how to customize the marker icon.
  		// If not specified, a common instance of `L.Icon.Default` is used.
  		icon: new IconDefault(),

  		// Option inherited from "Interactive layer" abstract class
  		interactive: true,

  		// @option keyboard: Boolean = true
  		// Whether the marker can be tabbed to with a keyboard and clicked by pressing enter.
  		keyboard: true,

  		// @option title: String = ''
  		// Text for the browser tooltip that appear on marker hover (no tooltip by default).
  		title: '',

  		// @option alt: String = ''
  		// Text for the `alt` attribute of the icon image (useful for accessibility).
  		alt: '',

  		// @option zIndexOffset: Number = 0
  		// By default, marker images zIndex is set automatically based on its latitude. Use this option if you want to put the marker on top of all others (or below), specifying a high value like `1000` (or high negative value, respectively).
  		zIndexOffset: 0,

  		// @option opacity: Number = 1.0
  		// The opacity of the marker.
  		opacity: 1,

  		// @option riseOnHover: Boolean = false
  		// If `true`, the marker will get on top of others when you hover the mouse over it.
  		riseOnHover: false,

  		// @option riseOffset: Number = 250
  		// The z-index offset used for the `riseOnHover` feature.
  		riseOffset: 250,

  		// @option pane: String = 'markerPane'
  		// `Map pane` where the markers icon will be added.
  		pane: 'markerPane',

  		// @option pane: String = 'shadowPane'
  		// `Map pane` where the markers shadow will be added.
  		shadowPane: 'shadowPane',

  		// @option bubblingMouseEvents: Boolean = false
  		// When `true`, a mouse event on this marker will trigger the same event on the map
  		// (unless [`L.DomEvent.stopPropagation`](#domevent-stoppropagation) is used).
  		bubblingMouseEvents: false,

  		// @section Draggable marker options
  		// @option draggable: Boolean = false
  		// Whether the marker is draggable with mouse/touch or not.
  		draggable: false,

  		// @option autoPan: Boolean = false
  		// Whether to pan the map when dragging this marker near its edge or not.
  		autoPan: false,

  		// @option autoPanPadding: Point = Point(50, 50)
  		// Distance (in pixels to the left/right and to the top/bottom) of the
  		// map edge to start panning the map.
  		autoPanPadding: [50, 50],

  		// @option autoPanSpeed: Number = 10
  		// Number of pixels the map should pan by.
  		autoPanSpeed: 10
  	},

  	/* @section
  	 *
  	 * In addition to [shared layer methods](#Layer) like `addTo()` and `remove()` and [popup methods](#Popup) like bindPopup() you can also use the following methods:
  	 */

  	initialize: function (latlng, options) {
  		setOptions(this, options);
  		this._latlng = toLatLng(latlng);
  	},

  	onAdd: function (map) {
  		this._zoomAnimated = this._zoomAnimated && map.options.markerZoomAnimation;

  		if (this._zoomAnimated) {
  			map.on('zoomanim', this._animateZoom, this);
  		}

  		this._initIcon();
  		this.update();
  	},

  	onRemove: function (map) {
  		if (this.dragging && this.dragging.enabled()) {
  			this.options.draggable = true;
  			this.dragging.removeHooks();
  		}
  		delete this.dragging;

  		if (this._zoomAnimated) {
  			map.off('zoomanim', this._animateZoom, this);
  		}

  		this._removeIcon();
  		this._removeShadow();
  	},

  	getEvents: function () {
  		return {
  			zoom: this.update,
  			viewreset: this.update
  		};
  	},

  	// @method getLatLng: LatLng
  	// Returns the current geographical position of the marker.
  	getLatLng: function () {
  		return this._latlng;
  	},

  	// @method setLatLng(latlng: LatLng): this
  	// Changes the marker position to the given point.
  	setLatLng: function (latlng) {
  		var oldLatLng = this._latlng;
  		this._latlng = toLatLng(latlng);
  		this.update();

  		// @event move: Event
  		// Fired when the marker is moved via [`setLatLng`](#marker-setlatlng) or by [dragging](#marker-dragging). Old and new coordinates are included in event arguments as `oldLatLng`, `latlng`.
  		return this.fire('move', {oldLatLng: oldLatLng, latlng: this._latlng});
  	},

  	// @method setZIndexOffset(offset: Number): this
  	// Changes the [zIndex offset](#marker-zindexoffset) of the marker.
  	setZIndexOffset: function (offset) {
  		this.options.zIndexOffset = offset;
  		return this.update();
  	},

  	// @method getIcon: Icon
  	// Returns the current icon used by the marker
  	getIcon: function () {
  		return this.options.icon;
  	},

  	// @method setIcon(icon: Icon): this
  	// Changes the marker icon.
  	setIcon: function (icon) {

  		this.options.icon = icon;

  		if (this._map) {
  			this._initIcon();
  			this.update();
  		}

  		if (this._popup) {
  			this.bindPopup(this._popup, this._popup.options);
  		}

  		return this;
  	},

  	getElement: function () {
  		return this._icon;
  	},

  	update: function () {

  		if (this._icon && this._map) {
  			var pos = this._map.latLngToLayerPoint(this._latlng).round();
  			this._setPos(pos);
  		}

  		return this;
  	},

  	_initIcon: function () {
  		var options = this.options,
  		    classToAdd = 'leaflet-zoom-' + (this._zoomAnimated ? 'animated' : 'hide');

  		var icon = options.icon.createIcon(this._icon),
  		    addIcon = false;

  		// if we're not reusing the icon, remove the old one and init new one
  		if (icon !== this._icon) {
  			if (this._icon) {
  				this._removeIcon();
  			}
  			addIcon = true;

  			if (options.title) {
  				icon.title = options.title;
  			}

  			if (icon.tagName === 'IMG') {
  				icon.alt = options.alt || '';
  			}
  		}

  		addClass(icon, classToAdd);

  		if (options.keyboard) {
  			icon.tabIndex = '0';
  		}

  		this._icon = icon;

  		if (options.riseOnHover) {
  			this.on({
  				mouseover: this._bringToFront,
  				mouseout: this._resetZIndex
  			});
  		}

  		var newShadow = options.icon.createShadow(this._shadow),
  		    addShadow = false;

  		if (newShadow !== this._shadow) {
  			this._removeShadow();
  			addShadow = true;
  		}

  		if (newShadow) {
  			addClass(newShadow, classToAdd);
  			newShadow.alt = '';
  		}
  		this._shadow = newShadow;


  		if (options.opacity < 1) {
  			this._updateOpacity();
  		}


  		if (addIcon) {
  			this.getPane().appendChild(this._icon);
  		}
  		this._initInteraction();
  		if (newShadow && addShadow) {
  			this.getPane(options.shadowPane).appendChild(this._shadow);
  		}
  	},

  	_removeIcon: function () {
  		if (this.options.riseOnHover) {
  			this.off({
  				mouseover: this._bringToFront,
  				mouseout: this._resetZIndex
  			});
  		}

  		remove(this._icon);
  		this.removeInteractiveTarget(this._icon);

  		this._icon = null;
  	},

  	_removeShadow: function () {
  		if (this._shadow) {
  			remove(this._shadow);
  		}
  		this._shadow = null;
  	},

  	_setPos: function (pos) {

  		if (this._icon) {
  			setPosition(this._icon, pos);
  		}

  		if (this._shadow) {
  			setPosition(this._shadow, pos);
  		}

  		this._zIndex = pos.y + this.options.zIndexOffset;

  		this._resetZIndex();
  	},

  	_updateZIndex: function (offset) {
  		if (this._icon) {
  			this._icon.style.zIndex = this._zIndex + offset;
  		}
  	},

  	_animateZoom: function (opt) {
  		var pos = this._map._latLngToNewLayerPoint(this._latlng, opt.zoom, opt.center).round();

  		this._setPos(pos);
  	},

  	_initInteraction: function () {

  		if (!this.options.interactive) { return; }

  		addClass(this._icon, 'leaflet-interactive');

  		this.addInteractiveTarget(this._icon);

  		if (MarkerDrag) {
  			var draggable = this.options.draggable;
  			if (this.dragging) {
  				draggable = this.dragging.enabled();
  				this.dragging.disable();
  			}

  			this.dragging = new MarkerDrag(this);

  			if (draggable) {
  				this.dragging.enable();
  			}
  		}
  	},

  	// @method setOpacity(opacity: Number): this
  	// Changes the opacity of the marker.
  	setOpacity: function (opacity) {
  		this.options.opacity = opacity;
  		if (this._map) {
  			this._updateOpacity();
  		}

  		return this;
  	},

  	_updateOpacity: function () {
  		var opacity = this.options.opacity;

  		if (this._icon) {
  			setOpacity(this._icon, opacity);
  		}

  		if (this._shadow) {
  			setOpacity(this._shadow, opacity);
  		}
  	},

  	_bringToFront: function () {
  		this._updateZIndex(this.options.riseOffset);
  	},

  	_resetZIndex: function () {
  		this._updateZIndex(0);
  	},

  	_getPopupAnchor: function () {
  		return this.options.icon.options.popupAnchor;
  	},

  	_getTooltipAnchor: function () {
  		return this.options.icon.options.tooltipAnchor;
  	}
  });


  // factory L.marker(latlng: LatLng, options? : Marker options)

  // @factory L.marker(latlng: LatLng, options? : Marker options)
  // Instantiates a Marker object given a geographical point and optionally an options object.
  function marker(latlng, options) {
  	return new Marker(latlng, options);
  }

  /*
   * @class Path
   * @aka L.Path
   * @inherits Interactive layer
   *
   * An abstract class that contains options and constants shared between vector
   * overlays (Polygon, Polyline, Circle). Do not use it directly. Extends `Layer`.
   */

  var Path = Layer.extend({

  	// @section
  	// @aka Path options
  	options: {
  		// @option stroke: Boolean = true
  		// Whether to draw stroke along the path. Set it to `false` to disable borders on polygons or circles.
  		stroke: true,

  		// @option color: String = '#3388ff'
  		// Stroke color
  		color: '#3388ff',

  		// @option weight: Number = 3
  		// Stroke width in pixels
  		weight: 3,

  		// @option opacity: Number = 1.0
  		// Stroke opacity
  		opacity: 1,

  		// @option lineCap: String= 'round'
  		// A string that defines [shape to be used at the end](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-linecap) of the stroke.
  		lineCap: 'round',

  		// @option lineJoin: String = 'round'
  		// A string that defines [shape to be used at the corners](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-linejoin) of the stroke.
  		lineJoin: 'round',

  		// @option dashArray: String = null
  		// A string that defines the stroke [dash pattern](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-dasharray). Doesn't work on `Canvas`-powered layers in [some old browsers](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/setLineDash#Browser_compatibility).
  		dashArray: null,

  		// @option dashOffset: String = null
  		// A string that defines the [distance into the dash pattern to start the dash](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-dashoffset). Doesn't work on `Canvas`-powered layers in [some old browsers](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/setLineDash#Browser_compatibility).
  		dashOffset: null,

  		// @option fill: Boolean = depends
  		// Whether to fill the path with color. Set it to `false` to disable filling on polygons or circles.
  		fill: false,

  		// @option fillColor: String = *
  		// Fill color. Defaults to the value of the [`color`](#path-color) option
  		fillColor: null,

  		// @option fillOpacity: Number = 0.2
  		// Fill opacity.
  		fillOpacity: 0.2,

  		// @option fillRule: String = 'evenodd'
  		// A string that defines [how the inside of a shape](https://developer.mozilla.org/docs/Web/SVG/Attribute/fill-rule) is determined.
  		fillRule: 'evenodd',

  		// className: '',

  		// Option inherited from "Interactive layer" abstract class
  		interactive: true,

  		// @option bubblingMouseEvents: Boolean = true
  		// When `true`, a mouse event on this path will trigger the same event on the map
  		// (unless [`L.DomEvent.stopPropagation`](#domevent-stoppropagation) is used).
  		bubblingMouseEvents: true
  	},

  	beforeAdd: function (map) {
  		// Renderer is set here because we need to call renderer.getEvents
  		// before this.getEvents.
  		this._renderer = map.getRenderer(this);
  	},

  	onAdd: function () {
  		this._renderer._initPath(this);
  		this._reset();
  		this._renderer._addPath(this);
  	},

  	onRemove: function () {
  		this._renderer._removePath(this);
  	},

  	// @method redraw(): this
  	// Redraws the layer. Sometimes useful after you changed the coordinates that the path uses.
  	redraw: function () {
  		if (this._map) {
  			this._renderer._updatePath(this);
  		}
  		return this;
  	},

  	// @method setStyle(style: Path options): this
  	// Changes the appearance of a Path based on the options in the `Path options` object.
  	setStyle: function (style) {
  		setOptions(this, style);
  		if (this._renderer) {
  			this._renderer._updateStyle(this);
  			if (this.options.stroke && style && style.hasOwnProperty('weight')) {
  				this._updateBounds();
  			}
  		}
  		return this;
  	},

  	// @method bringToFront(): this
  	// Brings the layer to the top of all path layers.
  	bringToFront: function () {
  		if (this._renderer) {
  			this._renderer._bringToFront(this);
  		}
  		return this;
  	},

  	// @method bringToBack(): this
  	// Brings the layer to the bottom of all path layers.
  	bringToBack: function () {
  		if (this._renderer) {
  			this._renderer._bringToBack(this);
  		}
  		return this;
  	},

  	getElement: function () {
  		return this._path;
  	},

  	_reset: function () {
  		// defined in child classes
  		this._project();
  		this._update();
  	},

  	_clickTolerance: function () {
  		// used when doing hit detection for Canvas layers
  		return (this.options.stroke ? this.options.weight / 2 : 0) + this._renderer.options.tolerance;
  	}
  });

  /*
   * @class CircleMarker
   * @aka L.CircleMarker
   * @inherits Path
   *
   * A circle of a fixed size with radius specified in pixels. Extends `Path`.
   */

  var CircleMarker = Path.extend({

  	// @section
  	// @aka CircleMarker options
  	options: {
  		fill: true,

  		// @option radius: Number = 10
  		// Radius of the circle marker, in pixels
  		radius: 10
  	},

  	initialize: function (latlng, options) {
  		setOptions(this, options);
  		this._latlng = toLatLng(latlng);
  		this._radius = this.options.radius;
  	},

  	// @method setLatLng(latLng: LatLng): this
  	// Sets the position of a circle marker to a new location.
  	setLatLng: function (latlng) {
  		var oldLatLng = this._latlng;
  		this._latlng = toLatLng(latlng);
  		this.redraw();

  		// @event move: Event
  		// Fired when the marker is moved via [`setLatLng`](#circlemarker-setlatlng). Old and new coordinates are included in event arguments as `oldLatLng`, `latlng`.
  		return this.fire('move', {oldLatLng: oldLatLng, latlng: this._latlng});
  	},

  	// @method getLatLng(): LatLng
  	// Returns the current geographical position of the circle marker
  	getLatLng: function () {
  		return this._latlng;
  	},

  	// @method setRadius(radius: Number): this
  	// Sets the radius of a circle marker. Units are in pixels.
  	setRadius: function (radius) {
  		this.options.radius = this._radius = radius;
  		return this.redraw();
  	},

  	// @method getRadius(): Number
  	// Returns the current radius of the circle
  	getRadius: function () {
  		return this._radius;
  	},

  	setStyle : function (options) {
  		var radius = options && options.radius || this._radius;
  		Path.prototype.setStyle.call(this, options);
  		this.setRadius(radius);
  		return this;
  	},

  	_project: function () {
  		this._point = this._map.latLngToLayerPoint(this._latlng);
  		this._updateBounds();
  	},

  	_updateBounds: function () {
  		var r = this._radius,
  		    r2 = this._radiusY || r,
  		    w = this._clickTolerance(),
  		    p = [r + w, r2 + w];
  		this._pxBounds = new Bounds(this._point.subtract(p), this._point.add(p));
  	},

  	_update: function () {
  		if (this._map) {
  			this._updatePath();
  		}
  	},

  	_updatePath: function () {
  		this._renderer._updateCircle(this);
  	},

  	_empty: function () {
  		return this._radius && !this._renderer._bounds.intersects(this._pxBounds);
  	},

  	// Needed by the `Canvas` renderer for interactivity
  	_containsPoint: function (p) {
  		return p.distanceTo(this._point) <= this._radius + this._clickTolerance();
  	}
  });


  // @factory L.circleMarker(latlng: LatLng, options?: CircleMarker options)
  // Instantiates a circle marker object given a geographical point, and an optional options object.
  function circleMarker(latlng, options) {
  	return new CircleMarker(latlng, options);
  }

  /*
   * @class Circle
   * @aka L.Circle
   * @inherits CircleMarker
   *
   * A class for drawing circle overlays on a map. Extends `CircleMarker`.
   *
   * It's an approximation and starts to diverge from a real circle closer to poles (due to projection distortion).
   *
   * @example
   *
   * ```js
   * L.circle([50.5, 30.5], {radius: 200}).addTo(map);
   * ```
   */

  var Circle = CircleMarker.extend({

  	initialize: function (latlng, options, legacyOptions) {
  		if (typeof options === 'number') {
  			// Backwards compatibility with 0.7.x factory (latlng, radius, options?)
  			options = extend({}, legacyOptions, {radius: options});
  		}
  		setOptions(this, options);
  		this._latlng = toLatLng(latlng);

  		if (isNaN(this.options.radius)) { throw new Error('Circle radius cannot be NaN'); }

  		// @section
  		// @aka Circle options
  		// @option radius: Number; Radius of the circle, in meters.
  		this._mRadius = this.options.radius;
  	},

  	// @method setRadius(radius: Number): this
  	// Sets the radius of a circle. Units are in meters.
  	setRadius: function (radius) {
  		this._mRadius = radius;
  		return this.redraw();
  	},

  	// @method getRadius(): Number
  	// Returns the current radius of a circle. Units are in meters.
  	getRadius: function () {
  		return this._mRadius;
  	},

  	// @method getBounds(): LatLngBounds
  	// Returns the `LatLngBounds` of the path.
  	getBounds: function () {
  		var half = [this._radius, this._radiusY || this._radius];

  		return new LatLngBounds(
  			this._map.layerPointToLatLng(this._point.subtract(half)),
  			this._map.layerPointToLatLng(this._point.add(half)));
  	},

  	setStyle: Path.prototype.setStyle,

  	_project: function () {

  		var lng = this._latlng.lng,
  		    lat = this._latlng.lat,
  		    map = this._map,
  		    crs = map.options.crs;

  		if (crs.distance === Earth.distance) {
  			var d = Math.PI / 180,
  			    latR = (this._mRadius / Earth.R) / d,
  			    top = map.project([lat + latR, lng]),
  			    bottom = map.project([lat - latR, lng]),
  			    p = top.add(bottom).divideBy(2),
  			    lat2 = map.unproject(p).lat,
  			    lngR = Math.acos((Math.cos(latR * d) - Math.sin(lat * d) * Math.sin(lat2 * d)) /
  			            (Math.cos(lat * d) * Math.cos(lat2 * d))) / d;

  			if (isNaN(lngR) || lngR === 0) {
  				lngR = latR / Math.cos(Math.PI / 180 * lat); // Fallback for edge case, #2425
  			}

  			this._point = p.subtract(map.getPixelOrigin());
  			this._radius = isNaN(lngR) ? 0 : p.x - map.project([lat2, lng - lngR]).x;
  			this._radiusY = p.y - top.y;

  		} else {
  			var latlng2 = crs.unproject(crs.project(this._latlng).subtract([this._mRadius, 0]));

  			this._point = map.latLngToLayerPoint(this._latlng);
  			this._radius = this._point.x - map.latLngToLayerPoint(latlng2).x;
  		}

  		this._updateBounds();
  	}
  });

  // @factory L.circle(latlng: LatLng, options?: Circle options)
  // Instantiates a circle object given a geographical point, and an options object
  // which contains the circle radius.
  // @alternative
  // @factory L.circle(latlng: LatLng, radius: Number, options?: Circle options)
  // Obsolete way of instantiating a circle, for compatibility with 0.7.x code.
  // Do not use in new applications or plugins.
  function circle(latlng, options, legacyOptions) {
  	return new Circle(latlng, options, legacyOptions);
  }

  /*
   * @class Polyline
   * @aka L.Polyline
   * @inherits Path
   *
   * A class for drawing polyline overlays on a map. Extends `Path`.
   *
   * @example
   *
   * ```js
   * // create a red polyline from an array of LatLng points
   * var latlngs = [
   * 	[45.51, -122.68],
   * 	[37.77, -122.43],
   * 	[34.04, -118.2]
   * ];
   *
   * var polyline = L.polyline(latlngs, {color: 'red'}).addTo(map);
   *
   * // zoom the map to the polyline
   * map.fitBounds(polyline.getBounds());
   * ```
   *
   * You can also pass a multi-dimensional array to represent a `MultiPolyline` shape:
   *
   * ```js
   * // create a red polyline from an array of arrays of LatLng points
   * var latlngs = [
   * 	[[45.51, -122.68],
   * 	 [37.77, -122.43],
   * 	 [34.04, -118.2]],
   * 	[[40.78, -73.91],
   * 	 [41.83, -87.62],
   * 	 [32.76, -96.72]]
   * ];
   * ```
   */


  var Polyline = Path.extend({

  	// @section
  	// @aka Polyline options
  	options: {
  		// @option smoothFactor: Number = 1.0
  		// How much to simplify the polyline on each zoom level. More means
  		// better performance and smoother look, and less means more accurate representation.
  		smoothFactor: 1.0,

  		// @option noClip: Boolean = false
  		// Disable polyline clipping.
  		noClip: false
  	},

  	initialize: function (latlngs, options) {
  		setOptions(this, options);
  		this._setLatLngs(latlngs);
  	},

  	// @method getLatLngs(): LatLng[]
  	// Returns an array of the points in the path, or nested arrays of points in case of multi-polyline.
  	getLatLngs: function () {
  		return this._latlngs;
  	},

  	// @method setLatLngs(latlngs: LatLng[]): this
  	// Replaces all the points in the polyline with the given array of geographical points.
  	setLatLngs: function (latlngs) {
  		this._setLatLngs(latlngs);
  		return this.redraw();
  	},

  	// @method isEmpty(): Boolean
  	// Returns `true` if the Polyline has no LatLngs.
  	isEmpty: function () {
  		return !this._latlngs.length;
  	},

  	// @method closestLayerPoint(p: Point): Point
  	// Returns the point closest to `p` on the Polyline.
  	closestLayerPoint: function (p) {
  		var minDistance = Infinity,
  		    minPoint = null,
  		    closest = _sqClosestPointOnSegment,
  		    p1, p2;

  		for (var j = 0, jLen = this._parts.length; j < jLen; j++) {
  			var points = this._parts[j];

  			for (var i = 1, len = points.length; i < len; i++) {
  				p1 = points[i - 1];
  				p2 = points[i];

  				var sqDist = closest(p, p1, p2, true);

  				if (sqDist < minDistance) {
  					minDistance = sqDist;
  					minPoint = closest(p, p1, p2);
  				}
  			}
  		}
  		if (minPoint) {
  			minPoint.distance = Math.sqrt(minDistance);
  		}
  		return minPoint;
  	},

  	// @method getCenter(): LatLng
  	// Returns the center ([centroid](http://en.wikipedia.org/wiki/Centroid)) of the polyline.
  	getCenter: function () {
  		// throws error when not yet added to map as this center calculation requires projected coordinates
  		if (!this._map) {
  			throw new Error('Must add layer to map before using getCenter()');
  		}

  		var i, halfDist, segDist, dist, p1, p2, ratio,
  		    points = this._rings[0],
  		    len = points.length;

  		if (!len) { return null; }

  		// polyline centroid algorithm; only uses the first ring if there are multiple

  		for (i = 0, halfDist = 0; i < len - 1; i++) {
  			halfDist += points[i].distanceTo(points[i + 1]) / 2;
  		}

  		// The line is so small in the current view that all points are on the same pixel.
  		if (halfDist === 0) {
  			return this._map.layerPointToLatLng(points[0]);
  		}

  		for (i = 0, dist = 0; i < len - 1; i++) {
  			p1 = points[i];
  			p2 = points[i + 1];
  			segDist = p1.distanceTo(p2);
  			dist += segDist;

  			if (dist > halfDist) {
  				ratio = (dist - halfDist) / segDist;
  				return this._map.layerPointToLatLng([
  					p2.x - ratio * (p2.x - p1.x),
  					p2.y - ratio * (p2.y - p1.y)
  				]);
  			}
  		}
  	},

  	// @method getBounds(): LatLngBounds
  	// Returns the `LatLngBounds` of the path.
  	getBounds: function () {
  		return this._bounds;
  	},

  	// @method addLatLng(latlng: LatLng, latlngs? LatLng[]): this
  	// Adds a given point to the polyline. By default, adds to the first ring of
  	// the polyline in case of a multi-polyline, but can be overridden by passing
  	// a specific ring as a LatLng array (that you can earlier access with [`getLatLngs`](#polyline-getlatlngs)).
  	addLatLng: function (latlng, latlngs) {
  		latlngs = latlngs || this._defaultShape();
  		latlng = toLatLng(latlng);
  		latlngs.push(latlng);
  		this._bounds.extend(latlng);
  		return this.redraw();
  	},

  	_setLatLngs: function (latlngs) {
  		this._bounds = new LatLngBounds();
  		this._latlngs = this._convertLatLngs(latlngs);
  	},

  	_defaultShape: function () {
  		return isFlat(this._latlngs) ? this._latlngs : this._latlngs[0];
  	},

  	// recursively convert latlngs input into actual LatLng instances; calculate bounds along the way
  	_convertLatLngs: function (latlngs) {
  		var result = [],
  		    flat = isFlat(latlngs);

  		for (var i = 0, len = latlngs.length; i < len; i++) {
  			if (flat) {
  				result[i] = toLatLng(latlngs[i]);
  				this._bounds.extend(result[i]);
  			} else {
  				result[i] = this._convertLatLngs(latlngs[i]);
  			}
  		}

  		return result;
  	},

  	_project: function () {
  		var pxBounds = new Bounds();
  		this._rings = [];
  		this._projectLatlngs(this._latlngs, this._rings, pxBounds);

  		if (this._bounds.isValid() && pxBounds.isValid()) {
  			this._rawPxBounds = pxBounds;
  			this._updateBounds();
  		}
  	},

  	_updateBounds: function () {
  		var w = this._clickTolerance(),
  		    p = new Point(w, w);
  		this._pxBounds = new Bounds([
  			this._rawPxBounds.min.subtract(p),
  			this._rawPxBounds.max.add(p)
  		]);
  	},

  	// recursively turns latlngs into a set of rings with projected coordinates
  	_projectLatlngs: function (latlngs, result, projectedBounds) {
  		var flat = latlngs[0] instanceof LatLng,
  		    len = latlngs.length,
  		    i, ring;

  		if (flat) {
  			ring = [];
  			for (i = 0; i < len; i++) {
  				ring[i] = this._map.latLngToLayerPoint(latlngs[i]);
  				projectedBounds.extend(ring[i]);
  			}
  			result.push(ring);
  		} else {
  			for (i = 0; i < len; i++) {
  				this._projectLatlngs(latlngs[i], result, projectedBounds);
  			}
  		}
  	},

  	// clip polyline by renderer bounds so that we have less to render for performance
  	_clipPoints: function () {
  		var bounds = this._renderer._bounds;

  		this._parts = [];
  		if (!this._pxBounds || !this._pxBounds.intersects(bounds)) {
  			return;
  		}

  		if (this.options.noClip) {
  			this._parts = this._rings;
  			return;
  		}

  		var parts = this._parts,
  		    i, j, k, len, len2, segment, points;

  		for (i = 0, k = 0, len = this._rings.length; i < len; i++) {
  			points = this._rings[i];

  			for (j = 0, len2 = points.length; j < len2 - 1; j++) {
  				segment = clipSegment(points[j], points[j + 1], bounds, j, true);

  				if (!segment) { continue; }

  				parts[k] = parts[k] || [];
  				parts[k].push(segment[0]);

  				// if segment goes out of screen, or it's the last one, it's the end of the line part
  				if ((segment[1] !== points[j + 1]) || (j === len2 - 2)) {
  					parts[k].push(segment[1]);
  					k++;
  				}
  			}
  		}
  	},

  	// simplify each clipped part of the polyline for performance
  	_simplifyPoints: function () {
  		var parts = this._parts,
  		    tolerance = this.options.smoothFactor;

  		for (var i = 0, len = parts.length; i < len; i++) {
  			parts[i] = simplify(parts[i], tolerance);
  		}
  	},

  	_update: function () {
  		if (!this._map) { return; }

  		this._clipPoints();
  		this._simplifyPoints();
  		this._updatePath();
  	},

  	_updatePath: function () {
  		this._renderer._updatePoly(this);
  	},

  	// Needed by the `Canvas` renderer for interactivity
  	_containsPoint: function (p, closed) {
  		var i, j, k, len, len2, part,
  		    w = this._clickTolerance();

  		if (!this._pxBounds || !this._pxBounds.contains(p)) { return false; }

  		// hit detection for polylines
  		for (i = 0, len = this._parts.length; i < len; i++) {
  			part = this._parts[i];

  			for (j = 0, len2 = part.length, k = len2 - 1; j < len2; k = j++) {
  				if (!closed && (j === 0)) { continue; }

  				if (pointToSegmentDistance(p, part[k], part[j]) <= w) {
  					return true;
  				}
  			}
  		}
  		return false;
  	}
  });

  // @factory L.polyline(latlngs: LatLng[], options?: Polyline options)
  // Instantiates a polyline object given an array of geographical points and
  // optionally an options object. You can create a `Polyline` object with
  // multiple separate lines (`MultiPolyline`) by passing an array of arrays
  // of geographic points.
  function polyline(latlngs, options) {
  	return new Polyline(latlngs, options);
  }

  // Retrocompat. Allow plugins to support Leaflet versions before and after 1.1.
  Polyline._flat = _flat;

  /*
   * @class Polygon
   * @aka L.Polygon
   * @inherits Polyline
   *
   * A class for drawing polygon overlays on a map. Extends `Polyline`.
   *
   * Note that points you pass when creating a polygon shouldn't have an additional last point equal to the first one — it's better to filter out such points.
   *
   *
   * @example
   *
   * ```js
   * // create a red polygon from an array of LatLng points
   * var latlngs = [[37, -109.05],[41, -109.03],[41, -102.05],[37, -102.04]];
   *
   * var polygon = L.polygon(latlngs, {color: 'red'}).addTo(map);
   *
   * // zoom the map to the polygon
   * map.fitBounds(polygon.getBounds());
   * ```
   *
   * You can also pass an array of arrays of latlngs, with the first array representing the outer shape and the other arrays representing holes in the outer shape:
   *
   * ```js
   * var latlngs = [
   *   [[37, -109.05],[41, -109.03],[41, -102.05],[37, -102.04]], // outer ring
   *   [[37.29, -108.58],[40.71, -108.58],[40.71, -102.50],[37.29, -102.50]] // hole
   * ];
   * ```
   *
   * Additionally, you can pass a multi-dimensional array to represent a MultiPolygon shape.
   *
   * ```js
   * var latlngs = [
   *   [ // first polygon
   *     [[37, -109.05],[41, -109.03],[41, -102.05],[37, -102.04]], // outer ring
   *     [[37.29, -108.58],[40.71, -108.58],[40.71, -102.50],[37.29, -102.50]] // hole
   *   ],
   *   [ // second polygon
   *     [[41, -111.03],[45, -111.04],[45, -104.05],[41, -104.05]]
   *   ]
   * ];
   * ```
   */

  var Polygon = Polyline.extend({

  	options: {
  		fill: true
  	},

  	isEmpty: function () {
  		return !this._latlngs.length || !this._latlngs[0].length;
  	},

  	getCenter: function () {
  		// throws error when not yet added to map as this center calculation requires projected coordinates
  		if (!this._map) {
  			throw new Error('Must add layer to map before using getCenter()');
  		}

  		var i, j, p1, p2, f, area, x, y, center,
  		    points = this._rings[0],
  		    len = points.length;

  		if (!len) { return null; }

  		// polygon centroid algorithm; only uses the first ring if there are multiple

  		area = x = y = 0;

  		for (i = 0, j = len - 1; i < len; j = i++) {
  			p1 = points[i];
  			p2 = points[j];

  			f = p1.y * p2.x - p2.y * p1.x;
  			x += (p1.x + p2.x) * f;
  			y += (p1.y + p2.y) * f;
  			area += f * 3;
  		}

  		if (area === 0) {
  			// Polygon is so small that all points are on same pixel.
  			center = points[0];
  		} else {
  			center = [x / area, y / area];
  		}
  		return this._map.layerPointToLatLng(center);
  	},

  	_convertLatLngs: function (latlngs) {
  		var result = Polyline.prototype._convertLatLngs.call(this, latlngs),
  		    len = result.length;

  		// remove last point if it equals first one
  		if (len >= 2 && result[0] instanceof LatLng && result[0].equals(result[len - 1])) {
  			result.pop();
  		}
  		return result;
  	},

  	_setLatLngs: function (latlngs) {
  		Polyline.prototype._setLatLngs.call(this, latlngs);
  		if (isFlat(this._latlngs)) {
  			this._latlngs = [this._latlngs];
  		}
  	},

  	_defaultShape: function () {
  		return isFlat(this._latlngs[0]) ? this._latlngs[0] : this._latlngs[0][0];
  	},

  	_clipPoints: function () {
  		// polygons need a different clipping algorithm so we redefine that

  		var bounds = this._renderer._bounds,
  		    w = this.options.weight,
  		    p = new Point(w, w);

  		// increase clip padding by stroke width to avoid stroke on clip edges
  		bounds = new Bounds(bounds.min.subtract(p), bounds.max.add(p));

  		this._parts = [];
  		if (!this._pxBounds || !this._pxBounds.intersects(bounds)) {
  			return;
  		}

  		if (this.options.noClip) {
  			this._parts = this._rings;
  			return;
  		}

  		for (var i = 0, len = this._rings.length, clipped; i < len; i++) {
  			clipped = clipPolygon(this._rings[i], bounds, true);
  			if (clipped.length) {
  				this._parts.push(clipped);
  			}
  		}
  	},

  	_updatePath: function () {
  		this._renderer._updatePoly(this, true);
  	},

  	// Needed by the `Canvas` renderer for interactivity
  	_containsPoint: function (p) {
  		var inside = false,
  		    part, p1, p2, i, j, k, len, len2;

  		if (!this._pxBounds || !this._pxBounds.contains(p)) { return false; }

  		// ray casting algorithm for detecting if point is in polygon
  		for (i = 0, len = this._parts.length; i < len; i++) {
  			part = this._parts[i];

  			for (j = 0, len2 = part.length, k = len2 - 1; j < len2; k = j++) {
  				p1 = part[j];
  				p2 = part[k];

  				if (((p1.y > p.y) !== (p2.y > p.y)) && (p.x < (p2.x - p1.x) * (p.y - p1.y) / (p2.y - p1.y) + p1.x)) {
  					inside = !inside;
  				}
  			}
  		}

  		// also check if it's on polygon stroke
  		return inside || Polyline.prototype._containsPoint.call(this, p, true);
  	}

  });


  // @factory L.polygon(latlngs: LatLng[], options?: Polyline options)
  function polygon(latlngs, options) {
  	return new Polygon(latlngs, options);
  }

  /*
   * @class GeoJSON
   * @aka L.GeoJSON
   * @inherits FeatureGroup
   *
   * Represents a GeoJSON object or an array of GeoJSON objects. Allows you to parse
   * GeoJSON data and display it on the map. Extends `FeatureGroup`.
   *
   * @example
   *
   * ```js
   * L.geoJSON(data, {
   * 	style: function (feature) {
   * 		return {color: feature.properties.color};
   * 	}
   * }).bindPopup(function (layer) {
   * 	return layer.feature.properties.description;
   * }).addTo(map);
   * ```
   */

  var GeoJSON = FeatureGroup.extend({

  	/* @section
  	 * @aka GeoJSON options
  	 *
  	 * @option pointToLayer: Function = *
  	 * A `Function` defining how GeoJSON points spawn Leaflet layers. It is internally
  	 * called when data is added, passing the GeoJSON point feature and its `LatLng`.
  	 * The default is to spawn a default `Marker`:
  	 * ```js
  	 * function(geoJsonPoint, latlng) {
  	 * 	return L.marker(latlng);
  	 * }
  	 * ```
  	 *
  	 * @option style: Function = *
  	 * A `Function` defining the `Path options` for styling GeoJSON lines and polygons,
  	 * called internally when data is added.
  	 * The default value is to not override any defaults:
  	 * ```js
  	 * function (geoJsonFeature) {
  	 * 	return {}
  	 * }
  	 * ```
  	 *
  	 * @option onEachFeature: Function = *
  	 * A `Function` that will be called once for each created `Feature`, after it has
  	 * been created and styled. Useful for attaching events and popups to features.
  	 * The default is to do nothing with the newly created layers:
  	 * ```js
  	 * function (feature, layer) {}
  	 * ```
  	 *
  	 * @option filter: Function = *
  	 * A `Function` that will be used to decide whether to include a feature or not.
  	 * The default is to include all features:
  	 * ```js
  	 * function (geoJsonFeature) {
  	 * 	return true;
  	 * }
  	 * ```
  	 * Note: dynamically changing the `filter` option will have effect only on newly
  	 * added data. It will _not_ re-evaluate already included features.
  	 *
  	 * @option coordsToLatLng: Function = *
  	 * A `Function` that will be used for converting GeoJSON coordinates to `LatLng`s.
  	 * The default is the `coordsToLatLng` static method.
  	 *
  	 * @option markersInheritOptions: Boolean = false
  	 * Whether default Markers for "Point" type Features inherit from group options.
  	 */

  	initialize: function (geojson, options) {
  		setOptions(this, options);

  		this._layers = {};

  		if (geojson) {
  			this.addData(geojson);
  		}
  	},

  	// @method addData( <GeoJSON> data ): this
  	// Adds a GeoJSON object to the layer.
  	addData: function (geojson) {
  		var features = isArray(geojson) ? geojson : geojson.features,
  		    i, len, feature;

  		if (features) {
  			for (i = 0, len = features.length; i < len; i++) {
  				// only add this if geometry or geometries are set and not null
  				feature = features[i];
  				if (feature.geometries || feature.geometry || feature.features || feature.coordinates) {
  					this.addData(feature);
  				}
  			}
  			return this;
  		}

  		var options = this.options;

  		if (options.filter && !options.filter(geojson)) { return this; }

  		var layer = geometryToLayer(geojson, options);
  		if (!layer) {
  			return this;
  		}
  		layer.feature = asFeature(geojson);

  		layer.defaultOptions = layer.options;
  		this.resetStyle(layer);

  		if (options.onEachFeature) {
  			options.onEachFeature(geojson, layer);
  		}

  		return this.addLayer(layer);
  	},

  	// @method resetStyle( <Path> layer? ): this
  	// Resets the given vector layer's style to the original GeoJSON style, useful for resetting style after hover events.
  	// If `layer` is omitted, the style of all features in the current layer is reset.
  	resetStyle: function (layer) {
  		if (layer === undefined) {
  			return this.eachLayer(this.resetStyle, this);
  		}
  		// reset any custom styles
  		layer.options = extend({}, layer.defaultOptions);
  		this._setLayerStyle(layer, this.options.style);
  		return this;
  	},

  	// @method setStyle( <Function> style ): this
  	// Changes styles of GeoJSON vector layers with the given style function.
  	setStyle: function (style) {
  		return this.eachLayer(function (layer) {
  			this._setLayerStyle(layer, style);
  		}, this);
  	},

  	_setLayerStyle: function (layer, style) {
  		if (layer.setStyle) {
  			if (typeof style === 'function') {
  				style = style(layer.feature);
  			}
  			layer.setStyle(style);
  		}
  	}
  });

  // @section
  // There are several static functions which can be called without instantiating L.GeoJSON:

  // @function geometryToLayer(featureData: Object, options?: GeoJSON options): Layer
  // Creates a `Layer` from a given GeoJSON feature. Can use a custom
  // [`pointToLayer`](#geojson-pointtolayer) and/or [`coordsToLatLng`](#geojson-coordstolatlng)
  // functions if provided as options.
  function geometryToLayer(geojson, options) {

  	var geometry = geojson.type === 'Feature' ? geojson.geometry : geojson,
  	    coords = geometry ? geometry.coordinates : null,
  	    layers = [],
  	    pointToLayer = options && options.pointToLayer,
  	    _coordsToLatLng = options && options.coordsToLatLng || coordsToLatLng,
  	    latlng, latlngs, i, len;

  	if (!coords && !geometry) {
  		return null;
  	}

  	switch (geometry.type) {
  	case 'Point':
  		latlng = _coordsToLatLng(coords);
  		return _pointToLayer(pointToLayer, geojson, latlng, options);

  	case 'MultiPoint':
  		for (i = 0, len = coords.length; i < len; i++) {
  			latlng = _coordsToLatLng(coords[i]);
  			layers.push(_pointToLayer(pointToLayer, geojson, latlng, options));
  		}
  		return new FeatureGroup(layers);

  	case 'LineString':
  	case 'MultiLineString':
  		latlngs = coordsToLatLngs(coords, geometry.type === 'LineString' ? 0 : 1, _coordsToLatLng);
  		return new Polyline(latlngs, options);

  	case 'Polygon':
  	case 'MultiPolygon':
  		latlngs = coordsToLatLngs(coords, geometry.type === 'Polygon' ? 1 : 2, _coordsToLatLng);
  		return new Polygon(latlngs, options);

  	case 'GeometryCollection':
  		for (i = 0, len = geometry.geometries.length; i < len; i++) {
  			var layer = geometryToLayer({
  				geometry: geometry.geometries[i],
  				type: 'Feature',
  				properties: geojson.properties
  			}, options);

  			if (layer) {
  				layers.push(layer);
  			}
  		}
  		return new FeatureGroup(layers);

  	default:
  		throw new Error('Invalid GeoJSON object.');
  	}
  }

  function _pointToLayer(pointToLayerFn, geojson, latlng, options) {
  	return pointToLayerFn ?
  		pointToLayerFn(geojson, latlng) :
  		new Marker(latlng, options && options.markersInheritOptions && options);
  }

  // @function coordsToLatLng(coords: Array): LatLng
  // Creates a `LatLng` object from an array of 2 numbers (longitude, latitude)
  // or 3 numbers (longitude, latitude, altitude) used in GeoJSON for points.
  function coordsToLatLng(coords) {
  	return new LatLng(coords[1], coords[0], coords[2]);
  }

  // @function coordsToLatLngs(coords: Array, levelsDeep?: Number, coordsToLatLng?: Function): Array
  // Creates a multidimensional array of `LatLng`s from a GeoJSON coordinates array.
  // `levelsDeep` specifies the nesting level (0 is for an array of points, 1 for an array of arrays of points, etc., 0 by default).
  // Can use a custom [`coordsToLatLng`](#geojson-coordstolatlng) function.
  function coordsToLatLngs(coords, levelsDeep, _coordsToLatLng) {
  	var latlngs = [];

  	for (var i = 0, len = coords.length, latlng; i < len; i++) {
  		latlng = levelsDeep ?
  			coordsToLatLngs(coords[i], levelsDeep - 1, _coordsToLatLng) :
  			(_coordsToLatLng || coordsToLatLng)(coords[i]);

  		latlngs.push(latlng);
  	}

  	return latlngs;
  }

  // @function latLngToCoords(latlng: LatLng, precision?: Number): Array
  // Reverse of [`coordsToLatLng`](#geojson-coordstolatlng)
  function latLngToCoords(latlng, precision) {
  	precision = typeof precision === 'number' ? precision : 6;
  	return latlng.alt !== undefined ?
  		[formatNum(latlng.lng, precision), formatNum(latlng.lat, precision), formatNum(latlng.alt, precision)] :
  		[formatNum(latlng.lng, precision), formatNum(latlng.lat, precision)];
  }

  // @function latLngsToCoords(latlngs: Array, levelsDeep?: Number, closed?: Boolean): Array
  // Reverse of [`coordsToLatLngs`](#geojson-coordstolatlngs)
  // `closed` determines whether the first point should be appended to the end of the array to close the feature, only used when `levelsDeep` is 0. False by default.
  function latLngsToCoords(latlngs, levelsDeep, closed, precision) {
  	var coords = [];

  	for (var i = 0, len = latlngs.length; i < len; i++) {
  		coords.push(levelsDeep ?
  			latLngsToCoords(latlngs[i], levelsDeep - 1, closed, precision) :
  			latLngToCoords(latlngs[i], precision));
  	}

  	if (!levelsDeep && closed) {
  		coords.push(coords[0]);
  	}

  	return coords;
  }

  function getFeature(layer, newGeometry) {
  	return layer.feature ?
  		extend({}, layer.feature, {geometry: newGeometry}) :
  		asFeature(newGeometry);
  }

  // @function asFeature(geojson: Object): Object
  // Normalize GeoJSON geometries/features into GeoJSON features.
  function asFeature(geojson) {
  	if (geojson.type === 'Feature' || geojson.type === 'FeatureCollection') {
  		return geojson;
  	}

  	return {
  		type: 'Feature',
  		properties: {},
  		geometry: geojson
  	};
  }

  var PointToGeoJSON = {
  	toGeoJSON: function (precision) {
  		return getFeature(this, {
  			type: 'Point',
  			coordinates: latLngToCoords(this.getLatLng(), precision)
  		});
  	}
  };

  // @namespace Marker
  // @section Other methods
  // @method toGeoJSON(precision?: Number): Object
  // `precision` is the number of decimal places for coordinates.
  // The default value is 6 places.
  // Returns a [`GeoJSON`](http://en.wikipedia.org/wiki/GeoJSON) representation of the marker (as a GeoJSON `Point` Feature).
  Marker.include(PointToGeoJSON);

  // @namespace CircleMarker
  // @method toGeoJSON(precision?: Number): Object
  // `precision` is the number of decimal places for coordinates.
  // The default value is 6 places.
  // Returns a [`GeoJSON`](http://en.wikipedia.org/wiki/GeoJSON) representation of the circle marker (as a GeoJSON `Point` Feature).
  Circle.include(PointToGeoJSON);
  CircleMarker.include(PointToGeoJSON);


  // @namespace Polyline
  // @method toGeoJSON(precision?: Number): Object
  // `precision` is the number of decimal places for coordinates.
  // The default value is 6 places.
  // Returns a [`GeoJSON`](http://en.wikipedia.org/wiki/GeoJSON) representation of the polyline (as a GeoJSON `LineString` or `MultiLineString` Feature).
  Polyline.include({
  	toGeoJSON: function (precision) {
  		var multi = !isFlat(this._latlngs);

  		var coords = latLngsToCoords(this._latlngs, multi ? 1 : 0, false, precision);

  		return getFeature(this, {
  			type: (multi ? 'Multi' : '') + 'LineString',
  			coordinates: coords
  		});
  	}
  });

  // @namespace Polygon
  // @method toGeoJSON(precision?: Number): Object
  // `precision` is the number of decimal places for coordinates.
  // The default value is 6 places.
  // Returns a [`GeoJSON`](http://en.wikipedia.org/wiki/GeoJSON) representation of the polygon (as a GeoJSON `Polygon` or `MultiPolygon` Feature).
  Polygon.include({
  	toGeoJSON: function (precision) {
  		var holes = !isFlat(this._latlngs),
  		    multi = holes && !isFlat(this._latlngs[0]);

  		var coords = latLngsToCoords(this._latlngs, multi ? 2 : holes ? 1 : 0, true, precision);

  		if (!holes) {
  			coords = [coords];
  		}

  		return getFeature(this, {
  			type: (multi ? 'Multi' : '') + 'Polygon',
  			coordinates: coords
  		});
  	}
  });


  // @namespace LayerGroup
  LayerGroup.include({
  	toMultiPoint: function (precision) {
  		var coords = [];

  		this.eachLayer(function (layer) {
  			coords.push(layer.toGeoJSON(precision).geometry.coordinates);
  		});

  		return getFeature(this, {
  			type: 'MultiPoint',
  			coordinates: coords
  		});
  	},

  	// @method toGeoJSON(precision?: Number): Object
  	// `precision` is the number of decimal places for coordinates.
  	// The default value is 6 places.
  	// Returns a [`GeoJSON`](http://en.wikipedia.org/wiki/GeoJSON) representation of the layer group (as a GeoJSON `FeatureCollection`, `GeometryCollection`, or `MultiPoint`).
  	toGeoJSON: function (precision) {

  		var type = this.feature && this.feature.geometry && this.feature.geometry.type;

  		if (type === 'MultiPoint') {
  			return this.toMultiPoint(precision);
  		}

  		var isGeometryCollection = type === 'GeometryCollection',
  		    jsons = [];

  		this.eachLayer(function (layer) {
  			if (layer.toGeoJSON) {
  				var json = layer.toGeoJSON(precision);
  				if (isGeometryCollection) {
  					jsons.push(json.geometry);
  				} else {
  					var feature = asFeature(json);
  					// Squash nested feature collections
  					if (feature.type === 'FeatureCollection') {
  						jsons.push.apply(jsons, feature.features);
  					} else {
  						jsons.push(feature);
  					}
  				}
  			}
  		});

  		if (isGeometryCollection) {
  			return getFeature(this, {
  				geometries: jsons,
  				type: 'GeometryCollection'
  			});
  		}

  		return {
  			type: 'FeatureCollection',
  			features: jsons
  		};
  	}
  });

  // @namespace GeoJSON
  // @factory L.geoJSON(geojson?: Object, options?: GeoJSON options)
  // Creates a GeoJSON layer. Optionally accepts an object in
  // [GeoJSON format](https://tools.ietf.org/html/rfc7946) to display on the map
  // (you can alternatively add it later with `addData` method) and an `options` object.
  function geoJSON(geojson, options) {
  	return new GeoJSON(geojson, options);
  }

  // Backward compatibility.
  var geoJson = geoJSON;

  /*
   * @class ImageOverlay
   * @aka L.ImageOverlay
   * @inherits Interactive layer
   *
   * Used to load and display a single image over specific bounds of the map. Extends `Layer`.
   *
   * @example
   *
   * ```js
   * var imageUrl = 'http://www.lib.utexas.edu/maps/historical/newark_nj_1922.jpg',
   * 	imageBounds = [[40.712216, -74.22655], [40.773941, -74.12544]];
   * L.imageOverlay(imageUrl, imageBounds).addTo(map);
   * ```
   */

  var ImageOverlay = Layer.extend({

  	// @section
  	// @aka ImageOverlay options
  	options: {
  		// @option opacity: Number = 1.0
  		// The opacity of the image overlay.
  		opacity: 1,

  		// @option alt: String = ''
  		// Text for the `alt` attribute of the image (useful for accessibility).
  		alt: '',

  		// @option interactive: Boolean = false
  		// If `true`, the image overlay will emit [mouse events](#interactive-layer) when clicked or hovered.
  		interactive: false,

  		// @option crossOrigin: Boolean|String = false
  		// Whether the crossOrigin attribute will be added to the image.
  		// If a String is provided, the image will have its crossOrigin attribute set to the String provided. This is needed if you want to access image pixel data.
  		// Refer to [CORS Settings](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes) for valid String values.
  		crossOrigin: false,

  		// @option errorOverlayUrl: String = ''
  		// URL to the overlay image to show in place of the overlay that failed to load.
  		errorOverlayUrl: '',

  		// @option zIndex: Number = 1
  		// The explicit [zIndex](https://developer.mozilla.org/docs/Web/CSS/CSS_Positioning/Understanding_z_index) of the overlay layer.
  		zIndex: 1,

  		// @option className: String = ''
  		// A custom class name to assign to the image. Empty by default.
  		className: ''
  	},

  	initialize: function (url, bounds, options) { // (String, LatLngBounds, Object)
  		this._url = url;
  		this._bounds = toLatLngBounds(bounds);

  		setOptions(this, options);
  	},

  	onAdd: function () {
  		if (!this._image) {
  			this._initImage();

  			if (this.options.opacity < 1) {
  				this._updateOpacity();
  			}
  		}

  		if (this.options.interactive) {
  			addClass(this._image, 'leaflet-interactive');
  			this.addInteractiveTarget(this._image);
  		}

  		this.getPane().appendChild(this._image);
  		this._reset();
  	},

  	onRemove: function () {
  		remove(this._image);
  		if (this.options.interactive) {
  			this.removeInteractiveTarget(this._image);
  		}
  	},

  	// @method setOpacity(opacity: Number): this
  	// Sets the opacity of the overlay.
  	setOpacity: function (opacity) {
  		this.options.opacity = opacity;

  		if (this._image) {
  			this._updateOpacity();
  		}
  		return this;
  	},

  	setStyle: function (styleOpts) {
  		if (styleOpts.opacity) {
  			this.setOpacity(styleOpts.opacity);
  		}
  		return this;
  	},

  	// @method bringToFront(): this
  	// Brings the layer to the top of all overlays.
  	bringToFront: function () {
  		if (this._map) {
  			toFront(this._image);
  		}
  		return this;
  	},

  	// @method bringToBack(): this
  	// Brings the layer to the bottom of all overlays.
  	bringToBack: function () {
  		if (this._map) {
  			toBack(this._image);
  		}
  		return this;
  	},

  	// @method setUrl(url: String): this
  	// Changes the URL of the image.
  	setUrl: function (url) {
  		this._url = url;

  		if (this._image) {
  			this._image.src = url;
  		}
  		return this;
  	},

  	// @method setBounds(bounds: LatLngBounds): this
  	// Update the bounds that this ImageOverlay covers
  	setBounds: function (bounds) {
  		this._bounds = toLatLngBounds(bounds);

  		if (this._map) {
  			this._reset();
  		}
  		return this;
  	},

  	getEvents: function () {
  		var events = {
  			zoom: this._reset,
  			viewreset: this._reset
  		};

  		if (this._zoomAnimated) {
  			events.zoomanim = this._animateZoom;
  		}

  		return events;
  	},

  	// @method setZIndex(value: Number): this
  	// Changes the [zIndex](#imageoverlay-zindex) of the image overlay.
  	setZIndex: function (value) {
  		this.options.zIndex = value;
  		this._updateZIndex();
  		return this;
  	},

  	// @method getBounds(): LatLngBounds
  	// Get the bounds that this ImageOverlay covers
  	getBounds: function () {
  		return this._bounds;
  	},

  	// @method getElement(): HTMLElement
  	// Returns the instance of [`HTMLImageElement`](https://developer.mozilla.org/docs/Web/API/HTMLImageElement)
  	// used by this overlay.
  	getElement: function () {
  		return this._image;
  	},

  	_initImage: function () {
  		var wasElementSupplied = this._url.tagName === 'IMG';
  		var img = this._image = wasElementSupplied ? this._url : create$1('img');

  		addClass(img, 'leaflet-image-layer');
  		if (this._zoomAnimated) { addClass(img, 'leaflet-zoom-animated'); }
  		if (this.options.className) { addClass(img, this.options.className); }

  		img.onselectstart = falseFn;
  		img.onmousemove = falseFn;

  		// @event load: Event
  		// Fired when the ImageOverlay layer has loaded its image
  		img.onload = bind(this.fire, this, 'load');
  		img.onerror = bind(this._overlayOnError, this, 'error');

  		if (this.options.crossOrigin || this.options.crossOrigin === '') {
  			img.crossOrigin = this.options.crossOrigin === true ? '' : this.options.crossOrigin;
  		}

  		if (this.options.zIndex) {
  			this._updateZIndex();
  		}

  		if (wasElementSupplied) {
  			this._url = img.src;
  			return;
  		}

  		img.src = this._url;
  		img.alt = this.options.alt;
  	},

  	_animateZoom: function (e) {
  		var scale = this._map.getZoomScale(e.zoom),
  		    offset = this._map._latLngBoundsToNewLayerBounds(this._bounds, e.zoom, e.center).min;

  		setTransform(this._image, offset, scale);
  	},

  	_reset: function () {
  		var image = this._image,
  		    bounds = new Bounds(
  		        this._map.latLngToLayerPoint(this._bounds.getNorthWest()),
  		        this._map.latLngToLayerPoint(this._bounds.getSouthEast())),
  		    size = bounds.getSize();

  		setPosition(image, bounds.min);

  		image.style.width  = size.x + 'px';
  		image.style.height = size.y + 'px';
  	},

  	_updateOpacity: function () {
  		setOpacity(this._image, this.options.opacity);
  	},

  	_updateZIndex: function () {
  		if (this._image && this.options.zIndex !== undefined && this.options.zIndex !== null) {
  			this._image.style.zIndex = this.options.zIndex;
  		}
  	},

  	_overlayOnError: function () {
  		// @event error: Event
  		// Fired when the ImageOverlay layer fails to load its image
  		this.fire('error');

  		var errorUrl = this.options.errorOverlayUrl;
  		if (errorUrl && this._url !== errorUrl) {
  			this._url = errorUrl;
  			this._image.src = errorUrl;
  		}
  	}
  });

  // @factory L.imageOverlay(imageUrl: String, bounds: LatLngBounds, options?: ImageOverlay options)
  // Instantiates an image overlay object given the URL of the image and the
  // geographical bounds it is tied to.
  var imageOverlay = function (url, bounds, options) {
  	return new ImageOverlay(url, bounds, options);
  };

  /*
   * @class VideoOverlay
   * @aka L.VideoOverlay
   * @inherits ImageOverlay
   *
   * Used to load and display a video player over specific bounds of the map. Extends `ImageOverlay`.
   *
   * A video overlay uses the [`<video>`](https://developer.mozilla.org/docs/Web/HTML/Element/video)
   * HTML5 element.
   *
   * @example
   *
   * ```js
   * var videoUrl = 'https://www.mapbox.com/bites/00188/patricia_nasa.webm',
   * 	videoBounds = [[ 32, -130], [ 13, -100]];
   * L.videoOverlay(videoUrl, videoBounds ).addTo(map);
   * ```
   */

  var VideoOverlay = ImageOverlay.extend({

  	// @section
  	// @aka VideoOverlay options
  	options: {
  		// @option autoplay: Boolean = true
  		// Whether the video starts playing automatically when loaded.
  		autoplay: true,

  		// @option loop: Boolean = true
  		// Whether the video will loop back to the beginning when played.
  		loop: true,

  		// @option keepAspectRatio: Boolean = true
  		// Whether the video will save aspect ratio after the projection.
  		// Relevant for supported browsers. Browser compatibility- https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit
  		keepAspectRatio: true
  	},

  	_initImage: function () {
  		var wasElementSupplied = this._url.tagName === 'VIDEO';
  		var vid = this._image = wasElementSupplied ? this._url : create$1('video');

  		addClass(vid, 'leaflet-image-layer');
  		if (this._zoomAnimated) { addClass(vid, 'leaflet-zoom-animated'); }
  		if (this.options.className) { addClass(vid, this.options.className); }

  		vid.onselectstart = falseFn;
  		vid.onmousemove = falseFn;

  		// @event load: Event
  		// Fired when the video has finished loading the first frame
  		vid.onloadeddata = bind(this.fire, this, 'load');

  		if (wasElementSupplied) {
  			var sourceElements = vid.getElementsByTagName('source');
  			var sources = [];
  			for (var j = 0; j < sourceElements.length; j++) {
  				sources.push(sourceElements[j].src);
  			}

  			this._url = (sourceElements.length > 0) ? sources : [vid.src];
  			return;
  		}

  		if (!isArray(this._url)) { this._url = [this._url]; }

  		if (!this.options.keepAspectRatio && vid.style.hasOwnProperty('objectFit')) { vid.style['objectFit'] = 'fill'; }
  		vid.autoplay = !!this.options.autoplay;
  		vid.loop = !!this.options.loop;
  		for (var i = 0; i < this._url.length; i++) {
  			var source = create$1('source');
  			source.src = this._url[i];
  			vid.appendChild(source);
  		}
  	}

  	// @method getElement(): HTMLVideoElement
  	// Returns the instance of [`HTMLVideoElement`](https://developer.mozilla.org/docs/Web/API/HTMLVideoElement)
  	// used by this overlay.
  });


  // @factory L.videoOverlay(video: String|Array|HTMLVideoElement, bounds: LatLngBounds, options?: VideoOverlay options)
  // Instantiates an image overlay object given the URL of the video (or array of URLs, or even a video element) and the
  // geographical bounds it is tied to.

  function videoOverlay(video, bounds, options) {
  	return new VideoOverlay(video, bounds, options);
  }

  /*
   * @class SVGOverlay
   * @aka L.SVGOverlay
   * @inherits ImageOverlay
   *
   * Used to load, display and provide DOM access to an SVG file over specific bounds of the map. Extends `ImageOverlay`.
   *
   * An SVG overlay uses the [`<svg>`](https://developer.mozilla.org/docs/Web/SVG/Element/svg) element.
   *
   * @example
   *
   * ```js
   * var svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
   * svgElement.setAttribute('xmlns', "http://www.w3.org/2000/svg");
   * svgElement.setAttribute('viewBox', "0 0 200 200");
   * svgElement.innerHTML = '<rect width="200" height="200"/><rect x="75" y="23" width="50" height="50" style="fill:red"/><rect x="75" y="123" width="50" height="50" style="fill:#0013ff"/>';
   * var svgElementBounds = [ [ 32, -130 ], [ 13, -100 ] ];
   * L.svgOverlay(svgElement, svgElementBounds).addTo(map);
   * ```
   */

  var SVGOverlay = ImageOverlay.extend({
  	_initImage: function () {
  		var el = this._image = this._url;

  		addClass(el, 'leaflet-image-layer');
  		if (this._zoomAnimated) { addClass(el, 'leaflet-zoom-animated'); }
  		if (this.options.className) { addClass(el, this.options.className); }

  		el.onselectstart = falseFn;
  		el.onmousemove = falseFn;
  	}

  	// @method getElement(): SVGElement
  	// Returns the instance of [`SVGElement`](https://developer.mozilla.org/docs/Web/API/SVGElement)
  	// used by this overlay.
  });


  // @factory L.svgOverlay(svg: String|SVGElement, bounds: LatLngBounds, options?: SVGOverlay options)
  // Instantiates an image overlay object given an SVG element and the geographical bounds it is tied to.
  // A viewBox attribute is required on the SVG element to zoom in and out properly.

  function svgOverlay(el, bounds, options) {
  	return new SVGOverlay(el, bounds, options);
  }

  /*
   * @class DivOverlay
   * @inherits Layer
   * @aka L.DivOverlay
   * Base model for L.Popup and L.Tooltip. Inherit from it for custom popup like plugins.
   */

  // @namespace DivOverlay
  var DivOverlay = Layer.extend({

  	// @section
  	// @aka DivOverlay options
  	options: {
  		// @option offset: Point = Point(0, 7)
  		// The offset of the popup position. Useful to control the anchor
  		// of the popup when opening it on some overlays.
  		offset: [0, 7],

  		// @option className: String = ''
  		// A custom CSS class name to assign to the popup.
  		className: '',

  		// @option pane: String = 'popupPane'
  		// `Map pane` where the popup will be added.
  		pane: 'popupPane'
  	},

  	initialize: function (options, source) {
  		setOptions(this, options);

  		this._source = source;
  	},

  	onAdd: function (map) {
  		this._zoomAnimated = map._zoomAnimated;

  		if (!this._container) {
  			this._initLayout();
  		}

  		if (map._fadeAnimated) {
  			setOpacity(this._container, 0);
  		}

  		clearTimeout(this._removeTimeout);
  		this.getPane().appendChild(this._container);
  		this.update();

  		if (map._fadeAnimated) {
  			setOpacity(this._container, 1);
  		}

  		this.bringToFront();
  	},

  	onRemove: function (map) {
  		if (map._fadeAnimated) {
  			setOpacity(this._container, 0);
  			this._removeTimeout = setTimeout(bind(remove, undefined, this._container), 200);
  		} else {
  			remove(this._container);
  		}
  	},

  	// @namespace Popup
  	// @method getLatLng: LatLng
  	// Returns the geographical point of popup.
  	getLatLng: function () {
  		return this._latlng;
  	},

  	// @method setLatLng(latlng: LatLng): this
  	// Sets the geographical point where the popup will open.
  	setLatLng: function (latlng) {
  		this._latlng = toLatLng(latlng);
  		if (this._map) {
  			this._updatePosition();
  			this._adjustPan();
  		}
  		return this;
  	},

  	// @method getContent: String|HTMLElement
  	// Returns the content of the popup.
  	getContent: function () {
  		return this._content;
  	},

  	// @method setContent(htmlContent: String|HTMLElement|Function): this
  	// Sets the HTML content of the popup. If a function is passed the source layer will be passed to the function. The function should return a `String` or `HTMLElement` to be used in the popup.
  	setContent: function (content) {
  		this._content = content;
  		this.update();
  		return this;
  	},

  	// @method getElement: String|HTMLElement
  	// Alias for [getContent()](#popup-getcontent)
  	getElement: function () {
  		return this._container;
  	},

  	// @method update: null
  	// Updates the popup content, layout and position. Useful for updating the popup after something inside changed, e.g. image loaded.
  	update: function () {
  		if (!this._map) { return; }

  		this._container.style.visibility = 'hidden';

  		this._updateContent();
  		this._updateLayout();
  		this._updatePosition();

  		this._container.style.visibility = '';

  		this._adjustPan();
  	},

  	getEvents: function () {
  		var events = {
  			zoom: this._updatePosition,
  			viewreset: this._updatePosition
  		};

  		if (this._zoomAnimated) {
  			events.zoomanim = this._animateZoom;
  		}
  		return events;
  	},

  	// @method isOpen: Boolean
  	// Returns `true` when the popup is visible on the map.
  	isOpen: function () {
  		return !!this._map && this._map.hasLayer(this);
  	},

  	// @method bringToFront: this
  	// Brings this popup in front of other popups (in the same map pane).
  	bringToFront: function () {
  		if (this._map) {
  			toFront(this._container);
  		}
  		return this;
  	},

  	// @method bringToBack: this
  	// Brings this popup to the back of other popups (in the same map pane).
  	bringToBack: function () {
  		if (this._map) {
  			toBack(this._container);
  		}
  		return this;
  	},

  	_prepareOpen: function (parent, layer, latlng) {
  		if (!(layer instanceof Layer)) {
  			latlng = layer;
  			layer = parent;
  		}

  		if (layer instanceof FeatureGroup) {
  			for (var id in parent._layers) {
  				layer = parent._layers[id];
  				break;
  			}
  		}

  		if (!latlng) {
  			if (layer.getCenter) {
  				latlng = layer.getCenter();
  			} else if (layer.getLatLng) {
  				latlng = layer.getLatLng();
  			} else {
  				throw new Error('Unable to get source layer LatLng.');
  			}
  		}

  		// set overlay source to this layer
  		this._source = layer;

  		// update the overlay (content, layout, ect...)
  		this.update();

  		return latlng;
  	},

  	_updateContent: function () {
  		if (!this._content) { return; }

  		var node = this._contentNode;
  		var content = (typeof this._content === 'function') ? this._content(this._source || this) : this._content;

  		if (typeof content === 'string') {
  			node.innerHTML = content;
  		} else {
  			while (node.hasChildNodes()) {
  				node.removeChild(node.firstChild);
  			}
  			node.appendChild(content);
  		}
  		this.fire('contentupdate');
  	},

  	_updatePosition: function () {
  		if (!this._map) { return; }

  		var pos = this._map.latLngToLayerPoint(this._latlng),
  		    offset = toPoint(this.options.offset),
  		    anchor = this._getAnchor();

  		if (this._zoomAnimated) {
  			setPosition(this._container, pos.add(anchor));
  		} else {
  			offset = offset.add(pos).add(anchor);
  		}

  		var bottom = this._containerBottom = -offset.y,
  		    left = this._containerLeft = -Math.round(this._containerWidth / 2) + offset.x;

  		// bottom position the popup in case the height of the popup changes (images loading etc)
  		this._container.style.bottom = bottom + 'px';
  		this._container.style.left = left + 'px';
  	},

  	_getAnchor: function () {
  		return [0, 0];
  	}

  });

  /*
   * @class Popup
   * @inherits DivOverlay
   * @aka L.Popup
   * Used to open popups in certain places of the map. Use [Map.openPopup](#map-openpopup) to
   * open popups while making sure that only one popup is open at one time
   * (recommended for usability), or use [Map.addLayer](#map-addlayer) to open as many as you want.
   *
   * @example
   *
   * If you want to just bind a popup to marker click and then open it, it's really easy:
   *
   * ```js
   * marker.bindPopup(popupContent).openPopup();
   * ```
   * Path overlays like polylines also have a `bindPopup` method.
   * Here's a more complicated way to open a popup on a map:
   *
   * ```js
   * var popup = L.popup()
   * 	.setLatLng(latlng)
   * 	.setContent('<p>Hello world!<br />This is a nice popup.</p>')
   * 	.openOn(map);
   * ```
   */


  // @namespace Popup
  var Popup = DivOverlay.extend({

  	// @section
  	// @aka Popup options
  	options: {
  		// @option maxWidth: Number = 300
  		// Max width of the popup, in pixels.
  		maxWidth: 300,

  		// @option minWidth: Number = 50
  		// Min width of the popup, in pixels.
  		minWidth: 50,

  		// @option maxHeight: Number = null
  		// If set, creates a scrollable container of the given height
  		// inside a popup if its content exceeds it.
  		maxHeight: null,

  		// @option autoPan: Boolean = true
  		// Set it to `false` if you don't want the map to do panning animation
  		// to fit the opened popup.
  		autoPan: true,

  		// @option autoPanPaddingTopLeft: Point = null
  		// The margin between the popup and the top left corner of the map
  		// view after autopanning was performed.
  		autoPanPaddingTopLeft: null,

  		// @option autoPanPaddingBottomRight: Point = null
  		// The margin between the popup and the bottom right corner of the map
  		// view after autopanning was performed.
  		autoPanPaddingBottomRight: null,

  		// @option autoPanPadding: Point = Point(5, 5)
  		// Equivalent of setting both top left and bottom right autopan padding to the same value.
  		autoPanPadding: [5, 5],

  		// @option keepInView: Boolean = false
  		// Set it to `true` if you want to prevent users from panning the popup
  		// off of the screen while it is open.
  		keepInView: false,

  		// @option closeButton: Boolean = true
  		// Controls the presence of a close button in the popup.
  		closeButton: true,

  		// @option autoClose: Boolean = true
  		// Set it to `false` if you want to override the default behavior of
  		// the popup closing when another popup is opened.
  		autoClose: true,

  		// @option closeOnEscapeKey: Boolean = true
  		// Set it to `false` if you want to override the default behavior of
  		// the ESC key for closing of the popup.
  		closeOnEscapeKey: true,

  		// @option closeOnClick: Boolean = *
  		// Set it if you want to override the default behavior of the popup closing when user clicks
  		// on the map. Defaults to the map's [`closePopupOnClick`](#map-closepopuponclick) option.

  		// @option className: String = ''
  		// A custom CSS class name to assign to the popup.
  		className: ''
  	},

  	// @namespace Popup
  	// @method openOn(map: Map): this
  	// Adds the popup to the map and closes the previous one. The same as `map.openPopup(popup)`.
  	openOn: function (map) {
  		map.openPopup(this);
  		return this;
  	},

  	onAdd: function (map) {
  		DivOverlay.prototype.onAdd.call(this, map);

  		// @namespace Map
  		// @section Popup events
  		// @event popupopen: PopupEvent
  		// Fired when a popup is opened in the map
  		map.fire('popupopen', {popup: this});

  		if (this._source) {
  			// @namespace Layer
  			// @section Popup events
  			// @event popupopen: PopupEvent
  			// Fired when a popup bound to this layer is opened
  			this._source.fire('popupopen', {popup: this}, true);
  			// For non-path layers, we toggle the popup when clicking
  			// again the layer, so prevent the map to reopen it.
  			if (!(this._source instanceof Path)) {
  				this._source.on('preclick', stopPropagation);
  			}
  		}
  	},

  	onRemove: function (map) {
  		DivOverlay.prototype.onRemove.call(this, map);

  		// @namespace Map
  		// @section Popup events
  		// @event popupclose: PopupEvent
  		// Fired when a popup in the map is closed
  		map.fire('popupclose', {popup: this});

  		if (this._source) {
  			// @namespace Layer
  			// @section Popup events
  			// @event popupclose: PopupEvent
  			// Fired when a popup bound to this layer is closed
  			this._source.fire('popupclose', {popup: this}, true);
  			if (!(this._source instanceof Path)) {
  				this._source.off('preclick', stopPropagation);
  			}
  		}
  	},

  	getEvents: function () {
  		var events = DivOverlay.prototype.getEvents.call(this);

  		if (this.options.closeOnClick !== undefined ? this.options.closeOnClick : this._map.options.closePopupOnClick) {
  			events.preclick = this._close;
  		}

  		if (this.options.keepInView) {
  			events.moveend = this._adjustPan;
  		}

  		return events;
  	},

  	_close: function () {
  		if (this._map) {
  			this._map.closePopup(this);
  		}
  	},

  	_initLayout: function () {
  		var prefix = 'leaflet-popup',
  		    container = this._container = create$1('div',
  			prefix + ' ' + (this.options.className || '') +
  			' leaflet-zoom-animated');

  		var wrapper = this._wrapper = create$1('div', prefix + '-content-wrapper', container);
  		this._contentNode = create$1('div', prefix + '-content', wrapper);

  		disableClickPropagation(wrapper);
  		disableScrollPropagation(this._contentNode);
  		on(wrapper, 'contextmenu', stopPropagation);

  		this._tipContainer = create$1('div', prefix + '-tip-container', container);
  		this._tip = create$1('div', prefix + '-tip', this._tipContainer);

  		if (this.options.closeButton) {
  			var closeButton = this._closeButton = create$1('a', prefix + '-close-button', container);
  			closeButton.href = '#close';
  			closeButton.innerHTML = '&#215;';

  			on(closeButton, 'click', this._onCloseButtonClick, this);
  		}
  	},

  	_updateLayout: function () {
  		var container = this._contentNode,
  		    style = container.style;

  		style.width = '';
  		style.whiteSpace = 'nowrap';

  		var width = container.offsetWidth;
  		width = Math.min(width, this.options.maxWidth);
  		width = Math.max(width, this.options.minWidth);

  		style.width = (width + 1) + 'px';
  		style.whiteSpace = '';

  		style.height = '';

  		var height = container.offsetHeight,
  		    maxHeight = this.options.maxHeight,
  		    scrolledClass = 'leaflet-popup-scrolled';

  		if (maxHeight && height > maxHeight) {
  			style.height = maxHeight + 'px';
  			addClass(container, scrolledClass);
  		} else {
  			removeClass(container, scrolledClass);
  		}

  		this._containerWidth = this._container.offsetWidth;
  	},

  	_animateZoom: function (e) {
  		var pos = this._map._latLngToNewLayerPoint(this._latlng, e.zoom, e.center),
  		    anchor = this._getAnchor();
  		setPosition(this._container, pos.add(anchor));
  	},

  	_adjustPan: function () {
  		if (!this.options.autoPan) { return; }
  		if (this._map._panAnim) { this._map._panAnim.stop(); }

  		var map = this._map,
  		    marginBottom = parseInt(getStyle(this._container, 'marginBottom'), 10) || 0,
  		    containerHeight = this._container.offsetHeight + marginBottom,
  		    containerWidth = this._containerWidth,
  		    layerPos = new Point(this._containerLeft, -containerHeight - this._containerBottom);

  		layerPos._add(getPosition(this._container));

  		var containerPos = map.layerPointToContainerPoint(layerPos),
  		    padding = toPoint(this.options.autoPanPadding),
  		    paddingTL = toPoint(this.options.autoPanPaddingTopLeft || padding),
  		    paddingBR = toPoint(this.options.autoPanPaddingBottomRight || padding),
  		    size = map.getSize(),
  		    dx = 0,
  		    dy = 0;

  		if (containerPos.x + containerWidth + paddingBR.x > size.x) { // right
  			dx = containerPos.x + containerWidth - size.x + paddingBR.x;
  		}
  		if (containerPos.x - dx - paddingTL.x < 0) { // left
  			dx = containerPos.x - paddingTL.x;
  		}
  		if (containerPos.y + containerHeight + paddingBR.y > size.y) { // bottom
  			dy = containerPos.y + containerHeight - size.y + paddingBR.y;
  		}
  		if (containerPos.y - dy - paddingTL.y < 0) { // top
  			dy = containerPos.y - paddingTL.y;
  		}

  		// @namespace Map
  		// @section Popup events
  		// @event autopanstart: Event
  		// Fired when the map starts autopanning when opening a popup.
  		if (dx || dy) {
  			map
  			    .fire('autopanstart')
  			    .panBy([dx, dy]);
  		}
  	},

  	_onCloseButtonClick: function (e) {
  		this._close();
  		stop(e);
  	},

  	_getAnchor: function () {
  		// Where should we anchor the popup on the source layer?
  		return toPoint(this._source && this._source._getPopupAnchor ? this._source._getPopupAnchor() : [0, 0]);
  	}

  });

  // @namespace Popup
  // @factory L.popup(options?: Popup options, source?: Layer)
  // Instantiates a `Popup` object given an optional `options` object that describes its appearance and location and an optional `source` object that is used to tag the popup with a reference to the Layer to which it refers.
  var popup = function (options, source) {
  	return new Popup(options, source);
  };


  /* @namespace Map
   * @section Interaction Options
   * @option closePopupOnClick: Boolean = true
   * Set it to `false` if you don't want popups to close when user clicks the map.
   */
  Map.mergeOptions({
  	closePopupOnClick: true
  });


  // @namespace Map
  // @section Methods for Layers and Controls
  Map.include({
  	// @method openPopup(popup: Popup): this
  	// Opens the specified popup while closing the previously opened (to make sure only one is opened at one time for usability).
  	// @alternative
  	// @method openPopup(content: String|HTMLElement, latlng: LatLng, options?: Popup options): this
  	// Creates a popup with the specified content and options and opens it in the given point on a map.
  	openPopup: function (popup, latlng, options) {
  		if (!(popup instanceof Popup)) {
  			popup = new Popup(options).setContent(popup);
  		}

  		if (latlng) {
  			popup.setLatLng(latlng);
  		}

  		if (this.hasLayer(popup)) {
  			return this;
  		}

  		if (this._popup && this._popup.options.autoClose) {
  			this.closePopup();
  		}

  		this._popup = popup;
  		return this.addLayer(popup);
  	},

  	// @method closePopup(popup?: Popup): this
  	// Closes the popup previously opened with [openPopup](#map-openpopup) (or the given one).
  	closePopup: function (popup) {
  		if (!popup || popup === this._popup) {
  			popup = this._popup;
  			this._popup = null;
  		}
  		if (popup) {
  			this.removeLayer(popup);
  		}
  		return this;
  	}
  });

  /*
   * @namespace Layer
   * @section Popup methods example
   *
   * All layers share a set of methods convenient for binding popups to it.
   *
   * ```js
   * var layer = L.Polygon(latlngs).bindPopup('Hi There!').addTo(map);
   * layer.openPopup();
   * layer.closePopup();
   * ```
   *
   * Popups will also be automatically opened when the layer is clicked on and closed when the layer is removed from the map or another popup is opened.
   */

  // @section Popup methods
  Layer.include({

  	// @method bindPopup(content: String|HTMLElement|Function|Popup, options?: Popup options): this
  	// Binds a popup to the layer with the passed `content` and sets up the
  	// necessary event listeners. If a `Function` is passed it will receive
  	// the layer as the first argument and should return a `String` or `HTMLElement`.
  	bindPopup: function (content, options) {

  		if (content instanceof Popup) {
  			setOptions(content, options);
  			this._popup = content;
  			content._source = this;
  		} else {
  			if (!this._popup || options) {
  				this._popup = new Popup(options, this);
  			}
  			this._popup.setContent(content);
  		}

  		if (!this._popupHandlersAdded) {
  			this.on({
  				click: this._openPopup,
  				keypress: this._onKeyPress,
  				remove: this.closePopup,
  				move: this._movePopup
  			});
  			this._popupHandlersAdded = true;
  		}

  		return this;
  	},

  	// @method unbindPopup(): this
  	// Removes the popup previously bound with `bindPopup`.
  	unbindPopup: function () {
  		if (this._popup) {
  			this.off({
  				click: this._openPopup,
  				keypress: this._onKeyPress,
  				remove: this.closePopup,
  				move: this._movePopup
  			});
  			this._popupHandlersAdded = false;
  			this._popup = null;
  		}
  		return this;
  	},

  	// @method openPopup(latlng?: LatLng): this
  	// Opens the bound popup at the specified `latlng` or at the default popup anchor if no `latlng` is passed.
  	openPopup: function (layer, latlng) {
  		if (this._popup && this._map) {
  			latlng = this._popup._prepareOpen(this, layer, latlng);

  			// open the popup on the map
  			this._map.openPopup(this._popup, latlng);
  		}

  		return this;
  	},

  	// @method closePopup(): this
  	// Closes the popup bound to this layer if it is open.
  	closePopup: function () {
  		if (this._popup) {
  			this._popup._close();
  		}
  		return this;
  	},

  	// @method togglePopup(): this
  	// Opens or closes the popup bound to this layer depending on its current state.
  	togglePopup: function (target) {
  		if (this._popup) {
  			if (this._popup._map) {
  				this.closePopup();
  			} else {
  				this.openPopup(target);
  			}
  		}
  		return this;
  	},

  	// @method isPopupOpen(): boolean
  	// Returns `true` if the popup bound to this layer is currently open.
  	isPopupOpen: function () {
  		return (this._popup ? this._popup.isOpen() : false);
  	},

  	// @method setPopupContent(content: String|HTMLElement|Popup): this
  	// Sets the content of the popup bound to this layer.
  	setPopupContent: function (content) {
  		if (this._popup) {
  			this._popup.setContent(content);
  		}
  		return this;
  	},

  	// @method getPopup(): Popup
  	// Returns the popup bound to this layer.
  	getPopup: function () {
  		return this._popup;
  	},

  	_openPopup: function (e) {
  		var layer = e.layer || e.target;

  		if (!this._popup) {
  			return;
  		}

  		if (!this._map) {
  			return;
  		}

  		// prevent map click
  		stop(e);

  		// if this inherits from Path its a vector and we can just
  		// open the popup at the new location
  		if (layer instanceof Path) {
  			this.openPopup(e.layer || e.target, e.latlng);
  			return;
  		}

  		// otherwise treat it like a marker and figure out
  		// if we should toggle it open/closed
  		if (this._map.hasLayer(this._popup) && this._popup._source === layer) {
  			this.closePopup();
  		} else {
  			this.openPopup(layer, e.latlng);
  		}
  	},

  	_movePopup: function (e) {
  		this._popup.setLatLng(e.latlng);
  	},

  	_onKeyPress: function (e) {
  		if (e.originalEvent.keyCode === 13) {
  			this._openPopup(e);
  		}
  	}
  });

  /*
   * @class Tooltip
   * @inherits DivOverlay
   * @aka L.Tooltip
   * Used to display small texts on top of map layers.
   *
   * @example
   *
   * ```js
   * marker.bindTooltip("my tooltip text").openTooltip();
   * ```
   * Note about tooltip offset. Leaflet takes two options in consideration
   * for computing tooltip offsetting:
   * - the `offset` Tooltip option: it defaults to [0, 0], and it's specific to one tooltip.
   *   Add a positive x offset to move the tooltip to the right, and a positive y offset to
   *   move it to the bottom. Negatives will move to the left and top.
   * - the `tooltipAnchor` Icon option: this will only be considered for Marker. You
   *   should adapt this value if you use a custom icon.
   */


  // @namespace Tooltip
  var Tooltip = DivOverlay.extend({

  	// @section
  	// @aka Tooltip options
  	options: {
  		// @option pane: String = 'tooltipPane'
  		// `Map pane` where the tooltip will be added.
  		pane: 'tooltipPane',

  		// @option offset: Point = Point(0, 0)
  		// Optional offset of the tooltip position.
  		offset: [0, 0],

  		// @option direction: String = 'auto'
  		// Direction where to open the tooltip. Possible values are: `right`, `left`,
  		// `top`, `bottom`, `center`, `auto`.
  		// `auto` will dynamically switch between `right` and `left` according to the tooltip
  		// position on the map.
  		direction: 'auto',

  		// @option permanent: Boolean = false
  		// Whether to open the tooltip permanently or only on mouseover.
  		permanent: false,

  		// @option sticky: Boolean = false
  		// If true, the tooltip will follow the mouse instead of being fixed at the feature center.
  		sticky: false,

  		// @option interactive: Boolean = false
  		// If true, the tooltip will listen to the feature events.
  		interactive: false,

  		// @option opacity: Number = 0.9
  		// Tooltip container opacity.
  		opacity: 0.9
  	},

  	onAdd: function (map) {
  		DivOverlay.prototype.onAdd.call(this, map);
  		this.setOpacity(this.options.opacity);

  		// @namespace Map
  		// @section Tooltip events
  		// @event tooltipopen: TooltipEvent
  		// Fired when a tooltip is opened in the map.
  		map.fire('tooltipopen', {tooltip: this});

  		if (this._source) {
  			// @namespace Layer
  			// @section Tooltip events
  			// @event tooltipopen: TooltipEvent
  			// Fired when a tooltip bound to this layer is opened.
  			this._source.fire('tooltipopen', {tooltip: this}, true);
  		}
  	},

  	onRemove: function (map) {
  		DivOverlay.prototype.onRemove.call(this, map);

  		// @namespace Map
  		// @section Tooltip events
  		// @event tooltipclose: TooltipEvent
  		// Fired when a tooltip in the map is closed.
  		map.fire('tooltipclose', {tooltip: this});

  		if (this._source) {
  			// @namespace Layer
  			// @section Tooltip events
  			// @event tooltipclose: TooltipEvent
  			// Fired when a tooltip bound to this layer is closed.
  			this._source.fire('tooltipclose', {tooltip: this}, true);
  		}
  	},

  	getEvents: function () {
  		var events = DivOverlay.prototype.getEvents.call(this);

  		if (touch && !this.options.permanent) {
  			events.preclick = this._close;
  		}

  		return events;
  	},

  	_close: function () {
  		if (this._map) {
  			this._map.closeTooltip(this);
  		}
  	},

  	_initLayout: function () {
  		var prefix = 'leaflet-tooltip',
  		    className = prefix + ' ' + (this.options.className || '') + ' leaflet-zoom-' + (this._zoomAnimated ? 'animated' : 'hide');

  		this._contentNode = this._container = create$1('div', className);
  	},

  	_updateLayout: function () {},

  	_adjustPan: function () {},

  	_setPosition: function (pos) {
  		var map = this._map,
  		    container = this._container,
  		    centerPoint = map.latLngToContainerPoint(map.getCenter()),
  		    tooltipPoint = map.layerPointToContainerPoint(pos),
  		    direction = this.options.direction,
  		    tooltipWidth = container.offsetWidth,
  		    tooltipHeight = container.offsetHeight,
  		    offset = toPoint(this.options.offset),
  		    anchor = this._getAnchor();

  		if (direction === 'top') {
  			pos = pos.add(toPoint(-tooltipWidth / 2 + offset.x, -tooltipHeight + offset.y + anchor.y, true));
  		} else if (direction === 'bottom') {
  			pos = pos.subtract(toPoint(tooltipWidth / 2 - offset.x, -offset.y, true));
  		} else if (direction === 'center') {
  			pos = pos.subtract(toPoint(tooltipWidth / 2 + offset.x, tooltipHeight / 2 - anchor.y + offset.y, true));
  		} else if (direction === 'right' || direction === 'auto' && tooltipPoint.x < centerPoint.x) {
  			direction = 'right';
  			pos = pos.add(toPoint(offset.x + anchor.x, anchor.y - tooltipHeight / 2 + offset.y, true));
  		} else {
  			direction = 'left';
  			pos = pos.subtract(toPoint(tooltipWidth + anchor.x - offset.x, tooltipHeight / 2 - anchor.y - offset.y, true));
  		}

  		removeClass(container, 'leaflet-tooltip-right');
  		removeClass(container, 'leaflet-tooltip-left');
  		removeClass(container, 'leaflet-tooltip-top');
  		removeClass(container, 'leaflet-tooltip-bottom');
  		addClass(container, 'leaflet-tooltip-' + direction);
  		setPosition(container, pos);
  	},

  	_updatePosition: function () {
  		var pos = this._map.latLngToLayerPoint(this._latlng);
  		this._setPosition(pos);
  	},

  	setOpacity: function (opacity) {
  		this.options.opacity = opacity;

  		if (this._container) {
  			setOpacity(this._container, opacity);
  		}
  	},

  	_animateZoom: function (e) {
  		var pos = this._map._latLngToNewLayerPoint(this._latlng, e.zoom, e.center);
  		this._setPosition(pos);
  	},

  	_getAnchor: function () {
  		// Where should we anchor the tooltip on the source layer?
  		return toPoint(this._source && this._source._getTooltipAnchor && !this.options.sticky ? this._source._getTooltipAnchor() : [0, 0]);
  	}

  });

  // @namespace Tooltip
  // @factory L.tooltip(options?: Tooltip options, source?: Layer)
  // Instantiates a Tooltip object given an optional `options` object that describes its appearance and location and an optional `source` object that is used to tag the tooltip with a reference to the Layer to which it refers.
  var tooltip = function (options, source) {
  	return new Tooltip(options, source);
  };

  // @namespace Map
  // @section Methods for Layers and Controls
  Map.include({

  	// @method openTooltip(tooltip: Tooltip): this
  	// Opens the specified tooltip.
  	// @alternative
  	// @method openTooltip(content: String|HTMLElement, latlng: LatLng, options?: Tooltip options): this
  	// Creates a tooltip with the specified content and options and open it.
  	openTooltip: function (tooltip, latlng, options) {
  		if (!(tooltip instanceof Tooltip)) {
  			tooltip = new Tooltip(options).setContent(tooltip);
  		}

  		if (latlng) {
  			tooltip.setLatLng(latlng);
  		}

  		if (this.hasLayer(tooltip)) {
  			return this;
  		}

  		return this.addLayer(tooltip);
  	},

  	// @method closeTooltip(tooltip?: Tooltip): this
  	// Closes the tooltip given as parameter.
  	closeTooltip: function (tooltip) {
  		if (tooltip) {
  			this.removeLayer(tooltip);
  		}
  		return this;
  	}

  });

  /*
   * @namespace Layer
   * @section Tooltip methods example
   *
   * All layers share a set of methods convenient for binding tooltips to it.
   *
   * ```js
   * var layer = L.Polygon(latlngs).bindTooltip('Hi There!').addTo(map);
   * layer.openTooltip();
   * layer.closeTooltip();
   * ```
   */

  // @section Tooltip methods
  Layer.include({

  	// @method bindTooltip(content: String|HTMLElement|Function|Tooltip, options?: Tooltip options): this
  	// Binds a tooltip to the layer with the passed `content` and sets up the
  	// necessary event listeners. If a `Function` is passed it will receive
  	// the layer as the first argument and should return a `String` or `HTMLElement`.
  	bindTooltip: function (content, options) {

  		if (content instanceof Tooltip) {
  			setOptions(content, options);
  			this._tooltip = content;
  			content._source = this;
  		} else {
  			if (!this._tooltip || options) {
  				this._tooltip = new Tooltip(options, this);
  			}
  			this._tooltip.setContent(content);

  		}

  		this._initTooltipInteractions();

  		if (this._tooltip.options.permanent && this._map && this._map.hasLayer(this)) {
  			this.openTooltip();
  		}

  		return this;
  	},

  	// @method unbindTooltip(): this
  	// Removes the tooltip previously bound with `bindTooltip`.
  	unbindTooltip: function () {
  		if (this._tooltip) {
  			this._initTooltipInteractions(true);
  			this.closeTooltip();
  			this._tooltip = null;
  		}
  		return this;
  	},

  	_initTooltipInteractions: function (remove$$1) {
  		if (!remove$$1 && this._tooltipHandlersAdded) { return; }
  		var onOff = remove$$1 ? 'off' : 'on',
  		    events = {
  			remove: this.closeTooltip,
  			move: this._moveTooltip
  		    };
  		if (!this._tooltip.options.permanent) {
  			events.mouseover = this._openTooltip;
  			events.mouseout = this.closeTooltip;
  			if (this._tooltip.options.sticky) {
  				events.mousemove = this._moveTooltip;
  			}
  			if (touch) {
  				events.click = this._openTooltip;
  			}
  		} else {
  			events.add = this._openTooltip;
  		}
  		this[onOff](events);
  		this._tooltipHandlersAdded = !remove$$1;
  	},

  	// @method openTooltip(latlng?: LatLng): this
  	// Opens the bound tooltip at the specified `latlng` or at the default tooltip anchor if no `latlng` is passed.
  	openTooltip: function (layer, latlng) {
  		if (this._tooltip && this._map) {
  			latlng = this._tooltip._prepareOpen(this, layer, latlng);

  			// open the tooltip on the map
  			this._map.openTooltip(this._tooltip, latlng);

  			// Tooltip container may not be defined if not permanent and never
  			// opened.
  			if (this._tooltip.options.interactive && this._tooltip._container) {
  				addClass(this._tooltip._container, 'leaflet-clickable');
  				this.addInteractiveTarget(this._tooltip._container);
  			}
  		}

  		return this;
  	},

  	// @method closeTooltip(): this
  	// Closes the tooltip bound to this layer if it is open.
  	closeTooltip: function () {
  		if (this._tooltip) {
  			this._tooltip._close();
  			if (this._tooltip.options.interactive && this._tooltip._container) {
  				removeClass(this._tooltip._container, 'leaflet-clickable');
  				this.removeInteractiveTarget(this._tooltip._container);
  			}
  		}
  		return this;
  	},

  	// @method toggleTooltip(): this
  	// Opens or closes the tooltip bound to this layer depending on its current state.
  	toggleTooltip: function (target) {
  		if (this._tooltip) {
  			if (this._tooltip._map) {
  				this.closeTooltip();
  			} else {
  				this.openTooltip(target);
  			}
  		}
  		return this;
  	},

  	// @method isTooltipOpen(): boolean
  	// Returns `true` if the tooltip bound to this layer is currently open.
  	isTooltipOpen: function () {
  		return this._tooltip.isOpen();
  	},

  	// @method setTooltipContent(content: String|HTMLElement|Tooltip): this
  	// Sets the content of the tooltip bound to this layer.
  	setTooltipContent: function (content) {
  		if (this._tooltip) {
  			this._tooltip.setContent(content);
  		}
  		return this;
  	},

  	// @method getTooltip(): Tooltip
  	// Returns the tooltip bound to this layer.
  	getTooltip: function () {
  		return this._tooltip;
  	},

  	_openTooltip: function (e) {
  		var layer = e.layer || e.target;

  		if (!this._tooltip || !this._map) {
  			return;
  		}
  		this.openTooltip(layer, this._tooltip.options.sticky ? e.latlng : undefined);
  	},

  	_moveTooltip: function (e) {
  		var latlng = e.latlng, containerPoint, layerPoint;
  		if (this._tooltip.options.sticky && e.originalEvent) {
  			containerPoint = this._map.mouseEventToContainerPoint(e.originalEvent);
  			layerPoint = this._map.containerPointToLayerPoint(containerPoint);
  			latlng = this._map.layerPointToLatLng(layerPoint);
  		}
  		this._tooltip.setLatLng(latlng);
  	}
  });

  /*
   * @class DivIcon
   * @aka L.DivIcon
   * @inherits Icon
   *
   * Represents a lightweight icon for markers that uses a simple `<div>`
   * element instead of an image. Inherits from `Icon` but ignores the `iconUrl` and shadow options.
   *
   * @example
   * ```js
   * var myIcon = L.divIcon({className: 'my-div-icon'});
   * // you can set .my-div-icon styles in CSS
   *
   * L.marker([50.505, 30.57], {icon: myIcon}).addTo(map);
   * ```
   *
   * By default, it has a 'leaflet-div-icon' CSS class and is styled as a little white square with a shadow.
   */

  var DivIcon = Icon.extend({
  	options: {
  		// @section
  		// @aka DivIcon options
  		iconSize: [12, 12], // also can be set through CSS

  		// iconAnchor: (Point),
  		// popupAnchor: (Point),

  		// @option html: String|HTMLElement = ''
  		// Custom HTML code to put inside the div element, empty by default. Alternatively,
  		// an instance of `HTMLElement`.
  		html: false,

  		// @option bgPos: Point = [0, 0]
  		// Optional relative position of the background, in pixels
  		bgPos: null,

  		className: 'leaflet-div-icon'
  	},

  	createIcon: function (oldIcon) {
  		var div = (oldIcon && oldIcon.tagName === 'DIV') ? oldIcon : document.createElement('div'),
  		    options = this.options;

  		if (options.html instanceof Element) {
  			empty(div);
  			div.appendChild(options.html);
  		} else {
  			div.innerHTML = options.html !== false ? options.html : '';
  		}

  		if (options.bgPos) {
  			var bgPos = toPoint(options.bgPos);
  			div.style.backgroundPosition = (-bgPos.x) + 'px ' + (-bgPos.y) + 'px';
  		}
  		this._setIconStyles(div, 'icon');

  		return div;
  	},

  	createShadow: function () {
  		return null;
  	}
  });

  // @factory L.divIcon(options: DivIcon options)
  // Creates a `DivIcon` instance with the given options.
  function divIcon(options) {
  	return new DivIcon(options);
  }

  Icon.Default = IconDefault;

  /*
   * @class GridLayer
   * @inherits Layer
   * @aka L.GridLayer
   *
   * Generic class for handling a tiled grid of HTML elements. This is the base class for all tile layers and replaces `TileLayer.Canvas`.
   * GridLayer can be extended to create a tiled grid of HTML elements like `<canvas>`, `<img>` or `<div>`. GridLayer will handle creating and animating these DOM elements for you.
   *
   *
   * @section Synchronous usage
   * @example
   *
   * To create a custom layer, extend GridLayer and implement the `createTile()` method, which will be passed a `Point` object with the `x`, `y`, and `z` (zoom level) coordinates to draw your tile.
   *
   * ```js
   * var CanvasLayer = L.GridLayer.extend({
   *     createTile: function(coords){
   *         // create a <canvas> element for drawing
   *         var tile = L.DomUtil.create('canvas', 'leaflet-tile');
   *
   *         // setup tile width and height according to the options
   *         var size = this.getTileSize();
   *         tile.width = size.x;
   *         tile.height = size.y;
   *
   *         // get a canvas context and draw something on it using coords.x, coords.y and coords.z
   *         var ctx = tile.getContext('2d');
   *
   *         // return the tile so it can be rendered on screen
   *         return tile;
   *     }
   * });
   * ```
   *
   * @section Asynchronous usage
   * @example
   *
   * Tile creation can also be asynchronous, this is useful when using a third-party drawing library. Once the tile is finished drawing it can be passed to the `done()` callback.
   *
   * ```js
   * var CanvasLayer = L.GridLayer.extend({
   *     createTile: function(coords, done){
   *         var error;
   *
   *         // create a <canvas> element for drawing
   *         var tile = L.DomUtil.create('canvas', 'leaflet-tile');
   *
   *         // setup tile width and height according to the options
   *         var size = this.getTileSize();
   *         tile.width = size.x;
   *         tile.height = size.y;
   *
   *         // draw something asynchronously and pass the tile to the done() callback
   *         setTimeout(function() {
   *             done(error, tile);
   *         }, 1000);
   *
   *         return tile;
   *     }
   * });
   * ```
   *
   * @section
   */


  var GridLayer = Layer.extend({

  	// @section
  	// @aka GridLayer options
  	options: {
  		// @option tileSize: Number|Point = 256
  		// Width and height of tiles in the grid. Use a number if width and height are equal, or `L.point(width, height)` otherwise.
  		tileSize: 256,

  		// @option opacity: Number = 1.0
  		// Opacity of the tiles. Can be used in the `createTile()` function.
  		opacity: 1,

  		// @option updateWhenIdle: Boolean = (depends)
  		// Load new tiles only when panning ends.
  		// `true` by default on mobile browsers, in order to avoid too many requests and keep smooth navigation.
  		// `false` otherwise in order to display new tiles _during_ panning, since it is easy to pan outside the
  		// [`keepBuffer`](#gridlayer-keepbuffer) option in desktop browsers.
  		updateWhenIdle: mobile,

  		// @option updateWhenZooming: Boolean = true
  		// By default, a smooth zoom animation (during a [touch zoom](#map-touchzoom) or a [`flyTo()`](#map-flyto)) will update grid layers every integer zoom level. Setting this option to `false` will update the grid layer only when the smooth animation ends.
  		updateWhenZooming: true,

  		// @option updateInterval: Number = 200
  		// Tiles will not update more than once every `updateInterval` milliseconds when panning.
  		updateInterval: 200,

  		// @option zIndex: Number = 1
  		// The explicit zIndex of the tile layer.
  		zIndex: 1,

  		// @option bounds: LatLngBounds = undefined
  		// If set, tiles will only be loaded inside the set `LatLngBounds`.
  		bounds: null,

  		// @option minZoom: Number = 0
  		// The minimum zoom level down to which this layer will be displayed (inclusive).
  		minZoom: 0,

  		// @option maxZoom: Number = undefined
  		// The maximum zoom level up to which this layer will be displayed (inclusive).
  		maxZoom: undefined,

  		// @option maxNativeZoom: Number = undefined
  		// Maximum zoom number the tile source has available. If it is specified,
  		// the tiles on all zoom levels higher than `maxNativeZoom` will be loaded
  		// from `maxNativeZoom` level and auto-scaled.
  		maxNativeZoom: undefined,

  		// @option minNativeZoom: Number = undefined
  		// Minimum zoom number the tile source has available. If it is specified,
  		// the tiles on all zoom levels lower than `minNativeZoom` will be loaded
  		// from `minNativeZoom` level and auto-scaled.
  		minNativeZoom: undefined,

  		// @option noWrap: Boolean = false
  		// Whether the layer is wrapped around the antimeridian. If `true`, the
  		// GridLayer will only be displayed once at low zoom levels. Has no
  		// effect when the [map CRS](#map-crs) doesn't wrap around. Can be used
  		// in combination with [`bounds`](#gridlayer-bounds) to prevent requesting
  		// tiles outside the CRS limits.
  		noWrap: false,

  		// @option pane: String = 'tilePane'
  		// `Map pane` where the grid layer will be added.
  		pane: 'tilePane',

  		// @option className: String = ''
  		// A custom class name to assign to the tile layer. Empty by default.
  		className: '',

  		// @option keepBuffer: Number = 2
  		// When panning the map, keep this many rows and columns of tiles before unloading them.
  		keepBuffer: 2
  	},

  	initialize: function (options) {
  		setOptions(this, options);
  	},

  	onAdd: function () {
  		this._initContainer();

  		this._levels = {};
  		this._tiles = {};

  		this._resetView();
  		this._update();
  	},

  	beforeAdd: function (map) {
  		map._addZoomLimit(this);
  	},

  	onRemove: function (map) {
  		this._removeAllTiles();
  		remove(this._container);
  		map._removeZoomLimit(this);
  		this._container = null;
  		this._tileZoom = undefined;
  	},

  	// @method bringToFront: this
  	// Brings the tile layer to the top of all tile layers.
  	bringToFront: function () {
  		if (this._map) {
  			toFront(this._container);
  			this._setAutoZIndex(Math.max);
  		}
  		return this;
  	},

  	// @method bringToBack: this
  	// Brings the tile layer to the bottom of all tile layers.
  	bringToBack: function () {
  		if (this._map) {
  			toBack(this._container);
  			this._setAutoZIndex(Math.min);
  		}
  		return this;
  	},

  	// @method getContainer: HTMLElement
  	// Returns the HTML element that contains the tiles for this layer.
  	getContainer: function () {
  		return this._container;
  	},

  	// @method setOpacity(opacity: Number): this
  	// Changes the [opacity](#gridlayer-opacity) of the grid layer.
  	setOpacity: function (opacity) {
  		this.options.opacity = opacity;
  		this._updateOpacity();
  		return this;
  	},

  	// @method setZIndex(zIndex: Number): this
  	// Changes the [zIndex](#gridlayer-zindex) of the grid layer.
  	setZIndex: function (zIndex) {
  		this.options.zIndex = zIndex;
  		this._updateZIndex();

  		return this;
  	},

  	// @method isLoading: Boolean
  	// Returns `true` if any tile in the grid layer has not finished loading.
  	isLoading: function () {
  		return this._loading;
  	},

  	// @method redraw: this
  	// Causes the layer to clear all the tiles and request them again.
  	redraw: function () {
  		if (this._map) {
  			this._removeAllTiles();
  			this._update();
  		}
  		return this;
  	},

  	getEvents: function () {
  		var events = {
  			viewprereset: this._invalidateAll,
  			viewreset: this._resetView,
  			zoom: this._resetView,
  			moveend: this._onMoveEnd
  		};

  		if (!this.options.updateWhenIdle) {
  			// update tiles on move, but not more often than once per given interval
  			if (!this._onMove) {
  				this._onMove = throttle(this._onMoveEnd, this.options.updateInterval, this);
  			}

  			events.move = this._onMove;
  		}

  		if (this._zoomAnimated) {
  			events.zoomanim = this._animateZoom;
  		}

  		return events;
  	},

  	// @section Extension methods
  	// Layers extending `GridLayer` shall reimplement the following method.
  	// @method createTile(coords: Object, done?: Function): HTMLElement
  	// Called only internally, must be overridden by classes extending `GridLayer`.
  	// Returns the `HTMLElement` corresponding to the given `coords`. If the `done` callback
  	// is specified, it must be called when the tile has finished loading and drawing.
  	createTile: function () {
  		return document.createElement('div');
  	},

  	// @section
  	// @method getTileSize: Point
  	// Normalizes the [tileSize option](#gridlayer-tilesize) into a point. Used by the `createTile()` method.
  	getTileSize: function () {
  		var s = this.options.tileSize;
  		return s instanceof Point ? s : new Point(s, s);
  	},

  	_updateZIndex: function () {
  		if (this._container && this.options.zIndex !== undefined && this.options.zIndex !== null) {
  			this._container.style.zIndex = this.options.zIndex;
  		}
  	},

  	_setAutoZIndex: function (compare) {
  		// go through all other layers of the same pane, set zIndex to max + 1 (front) or min - 1 (back)

  		var layers = this.getPane().children,
  		    edgeZIndex = -compare(-Infinity, Infinity); // -Infinity for max, Infinity for min

  		for (var i = 0, len = layers.length, zIndex; i < len; i++) {

  			zIndex = layers[i].style.zIndex;

  			if (layers[i] !== this._container && zIndex) {
  				edgeZIndex = compare(edgeZIndex, +zIndex);
  			}
  		}

  		if (isFinite(edgeZIndex)) {
  			this.options.zIndex = edgeZIndex + compare(-1, 1);
  			this._updateZIndex();
  		}
  	},

  	_updateOpacity: function () {
  		if (!this._map) { return; }

  		// IE doesn't inherit filter opacity properly, so we're forced to set it on tiles
  		if (ielt9) { return; }

  		setOpacity(this._container, this.options.opacity);

  		var now = +new Date(),
  		    nextFrame = false,
  		    willPrune = false;

  		for (var key in this._tiles) {
  			var tile = this._tiles[key];
  			if (!tile.current || !tile.loaded) { continue; }

  			var fade = Math.min(1, (now - tile.loaded) / 200);

  			setOpacity(tile.el, fade);
  			if (fade < 1) {
  				nextFrame = true;
  			} else {
  				if (tile.active) {
  					willPrune = true;
  				} else {
  					this._onOpaqueTile(tile);
  				}
  				tile.active = true;
  			}
  		}

  		if (willPrune && !this._noPrune) { this._pruneTiles(); }

  		if (nextFrame) {
  			cancelAnimFrame(this._fadeFrame);
  			this._fadeFrame = requestAnimFrame(this._updateOpacity, this);
  		}
  	},

  	_onOpaqueTile: falseFn,

  	_initContainer: function () {
  		if (this._container) { return; }

  		this._container = create$1('div', 'leaflet-layer ' + (this.options.className || ''));
  		this._updateZIndex();

  		if (this.options.opacity < 1) {
  			this._updateOpacity();
  		}

  		this.getPane().appendChild(this._container);
  	},

  	_updateLevels: function () {

  		var zoom = this._tileZoom,
  		    maxZoom = this.options.maxZoom;

  		if (zoom === undefined) { return undefined; }

  		for (var z in this._levels) {
  			if (this._levels[z].el.children.length || z === zoom) {
  				this._levels[z].el.style.zIndex = maxZoom - Math.abs(zoom - z);
  				this._onUpdateLevel(z);
  			} else {
  				remove(this._levels[z].el);
  				this._removeTilesAtZoom(z);
  				this._onRemoveLevel(z);
  				delete this._levels[z];
  			}
  		}

  		var level = this._levels[zoom],
  		    map = this._map;

  		if (!level) {
  			level = this._levels[zoom] = {};

  			level.el = create$1('div', 'leaflet-tile-container leaflet-zoom-animated', this._container);
  			level.el.style.zIndex = maxZoom;

  			level.origin = map.project(map.unproject(map.getPixelOrigin()), zoom).round();
  			level.zoom = zoom;

  			this._setZoomTransform(level, map.getCenter(), map.getZoom());

  			// force the browser to consider the newly added element for transition
  			falseFn(level.el.offsetWidth);

  			this._onCreateLevel(level);
  		}

  		this._level = level;

  		return level;
  	},

  	_onUpdateLevel: falseFn,

  	_onRemoveLevel: falseFn,

  	_onCreateLevel: falseFn,

  	_pruneTiles: function () {
  		if (!this._map) {
  			return;
  		}

  		var key, tile;

  		var zoom = this._map.getZoom();
  		if (zoom > this.options.maxZoom ||
  			zoom < this.options.minZoom) {
  			this._removeAllTiles();
  			return;
  		}

  		for (key in this._tiles) {
  			tile = this._tiles[key];
  			tile.retain = tile.current;
  		}

  		for (key in this._tiles) {
  			tile = this._tiles[key];
  			if (tile.current && !tile.active) {
  				var coords = tile.coords;
  				if (!this._retainParent(coords.x, coords.y, coords.z, coords.z - 5)) {
  					this._retainChildren(coords.x, coords.y, coords.z, coords.z + 2);
  				}
  			}
  		}

  		for (key in this._tiles) {
  			if (!this._tiles[key].retain) {
  				this._removeTile(key);
  			}
  		}
  	},

  	_removeTilesAtZoom: function (zoom) {
  		for (var key in this._tiles) {
  			if (this._tiles[key].coords.z !== zoom) {
  				continue;
  			}
  			this._removeTile(key);
  		}
  	},

  	_removeAllTiles: function () {
  		for (var key in this._tiles) {
  			this._removeTile(key);
  		}
  	},

  	_invalidateAll: function () {
  		for (var z in this._levels) {
  			remove(this._levels[z].el);
  			this._onRemoveLevel(z);
  			delete this._levels[z];
  		}
  		this._removeAllTiles();

  		this._tileZoom = undefined;
  	},

  	_retainParent: function (x, y, z, minZoom) {
  		var x2 = Math.floor(x / 2),
  		    y2 = Math.floor(y / 2),
  		    z2 = z - 1,
  		    coords2 = new Point(+x2, +y2);
  		coords2.z = +z2;

  		var key = this._tileCoordsToKey(coords2),
  		    tile = this._tiles[key];

  		if (tile && tile.active) {
  			tile.retain = true;
  			return true;

  		} else if (tile && tile.loaded) {
  			tile.retain = true;
  		}

  		if (z2 > minZoom) {
  			return this._retainParent(x2, y2, z2, minZoom);
  		}

  		return false;
  	},

  	_retainChildren: function (x, y, z, maxZoom) {

  		for (var i = 2 * x; i < 2 * x + 2; i++) {
  			for (var j = 2 * y; j < 2 * y + 2; j++) {

  				var coords = new Point(i, j);
  				coords.z = z + 1;

  				var key = this._tileCoordsToKey(coords),
  				    tile = this._tiles[key];

  				if (tile && tile.active) {
  					tile.retain = true;
  					continue;

  				} else if (tile && tile.loaded) {
  					tile.retain = true;
  				}

  				if (z + 1 < maxZoom) {
  					this._retainChildren(i, j, z + 1, maxZoom);
  				}
  			}
  		}
  	},

  	_resetView: function (e) {
  		var animating = e && (e.pinch || e.flyTo);
  		this._setView(this._map.getCenter(), this._map.getZoom(), animating, animating);
  	},

  	_animateZoom: function (e) {
  		this._setView(e.center, e.zoom, true, e.noUpdate);
  	},

  	_clampZoom: function (zoom) {
  		var options = this.options;

  		if (undefined !== options.minNativeZoom && zoom < options.minNativeZoom) {
  			return options.minNativeZoom;
  		}

  		if (undefined !== options.maxNativeZoom && options.maxNativeZoom < zoom) {
  			return options.maxNativeZoom;
  		}

  		return zoom;
  	},

  	_setView: function (center, zoom, noPrune, noUpdate) {
  		var tileZoom = this._clampZoom(Math.round(zoom));
  		if ((this.options.maxZoom !== undefined && tileZoom > this.options.maxZoom) ||
  		    (this.options.minZoom !== undefined && tileZoom < this.options.minZoom)) {
  			tileZoom = undefined;
  		}

  		var tileZoomChanged = this.options.updateWhenZooming && (tileZoom !== this._tileZoom);

  		if (!noUpdate || tileZoomChanged) {

  			this._tileZoom = tileZoom;

  			if (this._abortLoading) {
  				this._abortLoading();
  			}

  			this._updateLevels();
  			this._resetGrid();

  			if (tileZoom !== undefined) {
  				this._update(center);
  			}

  			if (!noPrune) {
  				this._pruneTiles();
  			}

  			// Flag to prevent _updateOpacity from pruning tiles during
  			// a zoom anim or a pinch gesture
  			this._noPrune = !!noPrune;
  		}

  		this._setZoomTransforms(center, zoom);
  	},

  	_setZoomTransforms: function (center, zoom) {
  		for (var i in this._levels) {
  			this._setZoomTransform(this._levels[i], center, zoom);
  		}
  	},

  	_setZoomTransform: function (level, center, zoom) {
  		var scale = this._map.getZoomScale(zoom, level.zoom),
  		    translate = level.origin.multiplyBy(scale)
  		        .subtract(this._map._getNewPixelOrigin(center, zoom)).round();

  		if (any3d) {
  			setTransform(level.el, translate, scale);
  		} else {
  			setPosition(level.el, translate);
  		}
  	},

  	_resetGrid: function () {
  		var map = this._map,
  		    crs = map.options.crs,
  		    tileSize = this._tileSize = this.getTileSize(),
  		    tileZoom = this._tileZoom;

  		var bounds = this._map.getPixelWorldBounds(this._tileZoom);
  		if (bounds) {
  			this._globalTileRange = this._pxBoundsToTileRange(bounds);
  		}

  		this._wrapX = crs.wrapLng && !this.options.noWrap && [
  			Math.floor(map.project([0, crs.wrapLng[0]], tileZoom).x / tileSize.x),
  			Math.ceil(map.project([0, crs.wrapLng[1]], tileZoom).x / tileSize.y)
  		];
  		this._wrapY = crs.wrapLat && !this.options.noWrap && [
  			Math.floor(map.project([crs.wrapLat[0], 0], tileZoom).y / tileSize.x),
  			Math.ceil(map.project([crs.wrapLat[1], 0], tileZoom).y / tileSize.y)
  		];
  	},

  	_onMoveEnd: function () {
  		if (!this._map || this._map._animatingZoom) { return; }

  		this._update();
  	},

  	_getTiledPixelBounds: function (center) {
  		var map = this._map,
  		    mapZoom = map._animatingZoom ? Math.max(map._animateToZoom, map.getZoom()) : map.getZoom(),
  		    scale = map.getZoomScale(mapZoom, this._tileZoom),
  		    pixelCenter = map.project(center, this._tileZoom).floor(),
  		    halfSize = map.getSize().divideBy(scale * 2);

  		return new Bounds(pixelCenter.subtract(halfSize), pixelCenter.add(halfSize));
  	},

  	// Private method to load tiles in the grid's active zoom level according to map bounds
  	_update: function (center) {
  		var map = this._map;
  		if (!map) { return; }
  		var zoom = this._clampZoom(map.getZoom());

  		if (center === undefined) { center = map.getCenter(); }
  		if (this._tileZoom === undefined) { return; }	// if out of minzoom/maxzoom

  		var pixelBounds = this._getTiledPixelBounds(center),
  		    tileRange = this._pxBoundsToTileRange(pixelBounds),
  		    tileCenter = tileRange.getCenter(),
  		    queue = [],
  		    margin = this.options.keepBuffer,
  		    noPruneRange = new Bounds(tileRange.getBottomLeft().subtract([margin, -margin]),
  		                              tileRange.getTopRight().add([margin, -margin]));

  		// Sanity check: panic if the tile range contains Infinity somewhere.
  		if (!(isFinite(tileRange.min.x) &&
  		      isFinite(tileRange.min.y) &&
  		      isFinite(tileRange.max.x) &&
  		      isFinite(tileRange.max.y))) { throw new Error('Attempted to load an infinite number of tiles'); }

  		for (var key in this._tiles) {
  			var c = this._tiles[key].coords;
  			if (c.z !== this._tileZoom || !noPruneRange.contains(new Point(c.x, c.y))) {
  				this._tiles[key].current = false;
  			}
  		}

  		// _update just loads more tiles. If the tile zoom level differs too much
  		// from the map's, let _setView reset levels and prune old tiles.
  		if (Math.abs(zoom - this._tileZoom) > 1) { this._setView(center, zoom); return; }

  		// create a queue of coordinates to load tiles from
  		for (var j = tileRange.min.y; j <= tileRange.max.y; j++) {
  			for (var i = tileRange.min.x; i <= tileRange.max.x; i++) {
  				var coords = new Point(i, j);
  				coords.z = this._tileZoom;

  				if (!this._isValidTile(coords)) { continue; }

  				var tile = this._tiles[this._tileCoordsToKey(coords)];
  				if (tile) {
  					tile.current = true;
  				} else {
  					queue.push(coords);
  				}
  			}
  		}

  		// sort tile queue to load tiles in order of their distance to center
  		queue.sort(function (a, b) {
  			return a.distanceTo(tileCenter) - b.distanceTo(tileCenter);
  		});

  		if (queue.length !== 0) {
  			// if it's the first batch of tiles to load
  			if (!this._loading) {
  				this._loading = true;
  				// @event loading: Event
  				// Fired when the grid layer starts loading tiles.
  				this.fire('loading');
  			}

  			// create DOM fragment to append tiles in one batch
  			var fragment = document.createDocumentFragment();

  			for (i = 0; i < queue.length; i++) {
  				this._addTile(queue[i], fragment);
  			}

  			this._level.el.appendChild(fragment);
  		}
  	},

  	_isValidTile: function (coords) {
  		var crs = this._map.options.crs;

  		if (!crs.infinite) {
  			// don't load tile if it's out of bounds and not wrapped
  			var bounds = this._globalTileRange;
  			if ((!crs.wrapLng && (coords.x < bounds.min.x || coords.x > bounds.max.x)) ||
  			    (!crs.wrapLat && (coords.y < bounds.min.y || coords.y > bounds.max.y))) { return false; }
  		}

  		if (!this.options.bounds) { return true; }

  		// don't load tile if it doesn't intersect the bounds in options
  		var tileBounds = this._tileCoordsToBounds(coords);
  		return toLatLngBounds(this.options.bounds).overlaps(tileBounds);
  	},

  	_keyToBounds: function (key) {
  		return this._tileCoordsToBounds(this._keyToTileCoords(key));
  	},

  	_tileCoordsToNwSe: function (coords) {
  		var map = this._map,
  		    tileSize = this.getTileSize(),
  		    nwPoint = coords.scaleBy(tileSize),
  		    sePoint = nwPoint.add(tileSize),
  		    nw = map.unproject(nwPoint, coords.z),
  		    se = map.unproject(sePoint, coords.z);
  		return [nw, se];
  	},

  	// converts tile coordinates to its geographical bounds
  	_tileCoordsToBounds: function (coords) {
  		var bp = this._tileCoordsToNwSe(coords),
  		    bounds = new LatLngBounds(bp[0], bp[1]);

  		if (!this.options.noWrap) {
  			bounds = this._map.wrapLatLngBounds(bounds);
  		}
  		return bounds;
  	},
  	// converts tile coordinates to key for the tile cache
  	_tileCoordsToKey: function (coords) {
  		return coords.x + ':' + coords.y + ':' + coords.z;
  	},

  	// converts tile cache key to coordinates
  	_keyToTileCoords: function (key) {
  		var k = key.split(':'),
  		    coords = new Point(+k[0], +k[1]);
  		coords.z = +k[2];
  		return coords;
  	},

  	_removeTile: function (key) {
  		var tile = this._tiles[key];
  		if (!tile) { return; }

  		remove(tile.el);

  		delete this._tiles[key];

  		// @event tileunload: TileEvent
  		// Fired when a tile is removed (e.g. when a tile goes off the screen).
  		this.fire('tileunload', {
  			tile: tile.el,
  			coords: this._keyToTileCoords(key)
  		});
  	},

  	_initTile: function (tile) {
  		addClass(tile, 'leaflet-tile');

  		var tileSize = this.getTileSize();
  		tile.style.width = tileSize.x + 'px';
  		tile.style.height = tileSize.y + 'px';

  		tile.onselectstart = falseFn;
  		tile.onmousemove = falseFn;

  		// update opacity on tiles in IE7-8 because of filter inheritance problems
  		if (ielt9 && this.options.opacity < 1) {
  			setOpacity(tile, this.options.opacity);
  		}

  		// without this hack, tiles disappear after zoom on Chrome for Android
  		// https://github.com/Leaflet/Leaflet/issues/2078
  		if (android && !android23) {
  			tile.style.WebkitBackfaceVisibility = 'hidden';
  		}
  	},

  	_addTile: function (coords, container) {
  		var tilePos = this._getTilePos(coords),
  		    key = this._tileCoordsToKey(coords);

  		var tile = this.createTile(this._wrapCoords(coords), bind(this._tileReady, this, coords));

  		this._initTile(tile);

  		// if createTile is defined with a second argument ("done" callback),
  		// we know that tile is async and will be ready later; otherwise
  		if (this.createTile.length < 2) {
  			// mark tile as ready, but delay one frame for opacity animation to happen
  			requestAnimFrame(bind(this._tileReady, this, coords, null, tile));
  		}

  		setPosition(tile, tilePos);

  		// save tile in cache
  		this._tiles[key] = {
  			el: tile,
  			coords: coords,
  			current: true
  		};

  		container.appendChild(tile);
  		// @event tileloadstart: TileEvent
  		// Fired when a tile is requested and starts loading.
  		this.fire('tileloadstart', {
  			tile: tile,
  			coords: coords
  		});
  	},

  	_tileReady: function (coords, err, tile) {
  		if (err) {
  			// @event tileerror: TileErrorEvent
  			// Fired when there is an error loading a tile.
  			this.fire('tileerror', {
  				error: err,
  				tile: tile,
  				coords: coords
  			});
  		}

  		var key = this._tileCoordsToKey(coords);

  		tile = this._tiles[key];
  		if (!tile) { return; }

  		tile.loaded = +new Date();
  		if (this._map._fadeAnimated) {
  			setOpacity(tile.el, 0);
  			cancelAnimFrame(this._fadeFrame);
  			this._fadeFrame = requestAnimFrame(this._updateOpacity, this);
  		} else {
  			tile.active = true;
  			this._pruneTiles();
  		}

  		if (!err) {
  			addClass(tile.el, 'leaflet-tile-loaded');

  			// @event tileload: TileEvent
  			// Fired when a tile loads.
  			this.fire('tileload', {
  				tile: tile.el,
  				coords: coords
  			});
  		}

  		if (this._noTilesToLoad()) {
  			this._loading = false;
  			// @event load: Event
  			// Fired when the grid layer loaded all visible tiles.
  			this.fire('load');

  			if (ielt9 || !this._map._fadeAnimated) {
  				requestAnimFrame(this._pruneTiles, this);
  			} else {
  				// Wait a bit more than 0.2 secs (the duration of the tile fade-in)
  				// to trigger a pruning.
  				setTimeout(bind(this._pruneTiles, this), 250);
  			}
  		}
  	},

  	_getTilePos: function (coords) {
  		return coords.scaleBy(this.getTileSize()).subtract(this._level.origin);
  	},

  	_wrapCoords: function (coords) {
  		var newCoords = new Point(
  			this._wrapX ? wrapNum(coords.x, this._wrapX) : coords.x,
  			this._wrapY ? wrapNum(coords.y, this._wrapY) : coords.y);
  		newCoords.z = coords.z;
  		return newCoords;
  	},

  	_pxBoundsToTileRange: function (bounds) {
  		var tileSize = this.getTileSize();
  		return new Bounds(
  			bounds.min.unscaleBy(tileSize).floor(),
  			bounds.max.unscaleBy(tileSize).ceil().subtract([1, 1]));
  	},

  	_noTilesToLoad: function () {
  		for (var key in this._tiles) {
  			if (!this._tiles[key].loaded) { return false; }
  		}
  		return true;
  	}
  });

  // @factory L.gridLayer(options?: GridLayer options)
  // Creates a new instance of GridLayer with the supplied options.
  function gridLayer(options) {
  	return new GridLayer(options);
  }

  /*
   * @class TileLayer
   * @inherits GridLayer
   * @aka L.TileLayer
   * Used to load and display tile layers on the map. Note that most tile servers require attribution, which you can set under `Layer`. Extends `GridLayer`.
   *
   * @example
   *
   * ```js
   * L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}', {foo: 'bar', attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'}).addTo(map);
   * ```
   *
   * @section URL template
   * @example
   *
   * A string of the following form:
   *
   * ```
   * 'http://{s}.somedomain.com/blabla/{z}/{x}/{y}{r}.png'
   * ```
   *
   * `{s}` means one of the available subdomains (used sequentially to help with browser parallel requests per domain limitation; subdomain values are specified in options; `a`, `b` or `c` by default, can be omitted), `{z}` — zoom level, `{x}` and `{y}` — tile coordinates. `{r}` can be used to add "&commat;2x" to the URL to load retina tiles.
   *
   * You can use custom keys in the template, which will be [evaluated](#util-template) from TileLayer options, like this:
   *
   * ```
   * L.tileLayer('http://{s}.somedomain.com/{foo}/{z}/{x}/{y}.png', {foo: 'bar'});
   * ```
   */


  var TileLayer = GridLayer.extend({

  	// @section
  	// @aka TileLayer options
  	options: {
  		// @option minZoom: Number = 0
  		// The minimum zoom level down to which this layer will be displayed (inclusive).
  		minZoom: 0,

  		// @option maxZoom: Number = 18
  		// The maximum zoom level up to which this layer will be displayed (inclusive).
  		maxZoom: 18,

  		// @option subdomains: String|String[] = 'abc'
  		// Subdomains of the tile service. Can be passed in the form of one string (where each letter is a subdomain name) or an array of strings.
  		subdomains: 'abc',

  		// @option errorTileUrl: String = ''
  		// URL to the tile image to show in place of the tile that failed to load.
  		errorTileUrl: '',

  		// @option zoomOffset: Number = 0
  		// The zoom number used in tile URLs will be offset with this value.
  		zoomOffset: 0,

  		// @option tms: Boolean = false
  		// If `true`, inverses Y axis numbering for tiles (turn this on for [TMS](https://en.wikipedia.org/wiki/Tile_Map_Service) services).
  		tms: false,

  		// @option zoomReverse: Boolean = false
  		// If set to true, the zoom number used in tile URLs will be reversed (`maxZoom - zoom` instead of `zoom`)
  		zoomReverse: false,

  		// @option detectRetina: Boolean = false
  		// If `true` and user is on a retina display, it will request four tiles of half the specified size and a bigger zoom level in place of one to utilize the high resolution.
  		detectRetina: false,

  		// @option crossOrigin: Boolean|String = false
  		// Whether the crossOrigin attribute will be added to the tiles.
  		// If a String is provided, all tiles will have their crossOrigin attribute set to the String provided. This is needed if you want to access tile pixel data.
  		// Refer to [CORS Settings](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes) for valid String values.
  		crossOrigin: false
  	},

  	initialize: function (url, options) {

  		this._url = url;

  		options = setOptions(this, options);

  		// detecting retina displays, adjusting tileSize and zoom levels
  		if (options.detectRetina && retina && options.maxZoom > 0) {

  			options.tileSize = Math.floor(options.tileSize / 2);

  			if (!options.zoomReverse) {
  				options.zoomOffset++;
  				options.maxZoom--;
  			} else {
  				options.zoomOffset--;
  				options.minZoom++;
  			}

  			options.minZoom = Math.max(0, options.minZoom);
  		}

  		if (typeof options.subdomains === 'string') {
  			options.subdomains = options.subdomains.split('');
  		}

  		// for https://github.com/Leaflet/Leaflet/issues/137
  		if (!android) {
  			this.on('tileunload', this._onTileRemove);
  		}
  	},

  	// @method setUrl(url: String, noRedraw?: Boolean): this
  	// Updates the layer's URL template and redraws it (unless `noRedraw` is set to `true`).
  	// If the URL does not change, the layer will not be redrawn unless
  	// the noRedraw parameter is set to false.
  	setUrl: function (url, noRedraw) {
  		if (this._url === url && noRedraw === undefined) {
  			noRedraw = true;
  		}

  		this._url = url;

  		if (!noRedraw) {
  			this.redraw();
  		}
  		return this;
  	},

  	// @method createTile(coords: Object, done?: Function): HTMLElement
  	// Called only internally, overrides GridLayer's [`createTile()`](#gridlayer-createtile)
  	// to return an `<img>` HTML element with the appropriate image URL given `coords`. The `done`
  	// callback is called when the tile has been loaded.
  	createTile: function (coords, done) {
  		var tile = document.createElement('img');

  		on(tile, 'load', bind(this._tileOnLoad, this, done, tile));
  		on(tile, 'error', bind(this._tileOnError, this, done, tile));

  		if (this.options.crossOrigin || this.options.crossOrigin === '') {
  			tile.crossOrigin = this.options.crossOrigin === true ? '' : this.options.crossOrigin;
  		}

  		/*
  		 Alt tag is set to empty string to keep screen readers from reading URL and for compliance reasons
  		 http://www.w3.org/TR/WCAG20-TECHS/H67
  		*/
  		tile.alt = '';

  		/*
  		 Set role="presentation" to force screen readers to ignore this
  		 https://www.w3.org/TR/wai-aria/roles#textalternativecomputation
  		*/
  		tile.setAttribute('role', 'presentation');

  		tile.src = this.getTileUrl(coords);

  		return tile;
  	},

  	// @section Extension methods
  	// @uninheritable
  	// Layers extending `TileLayer` might reimplement the following method.
  	// @method getTileUrl(coords: Object): String
  	// Called only internally, returns the URL for a tile given its coordinates.
  	// Classes extending `TileLayer` can override this function to provide custom tile URL naming schemes.
  	getTileUrl: function (coords) {
  		var data = {
  			r: retina ? '@2x' : '',
  			s: this._getSubdomain(coords),
  			x: coords.x,
  			y: coords.y,
  			z: this._getZoomForUrl()
  		};
  		if (this._map && !this._map.options.crs.infinite) {
  			var invertedY = this._globalTileRange.max.y - coords.y;
  			if (this.options.tms) {
  				data['y'] = invertedY;
  			}
  			data['-y'] = invertedY;
  		}

  		return template(this._url, extend(data, this.options));
  	},

  	_tileOnLoad: function (done, tile) {
  		// For https://github.com/Leaflet/Leaflet/issues/3332
  		if (ielt9) {
  			setTimeout(bind(done, this, null, tile), 0);
  		} else {
  			done(null, tile);
  		}
  	},

  	_tileOnError: function (done, tile, e) {
  		var errorUrl = this.options.errorTileUrl;
  		if (errorUrl && tile.getAttribute('src') !== errorUrl) {
  			tile.src = errorUrl;
  		}
  		done(e, tile);
  	},

  	_onTileRemove: function (e) {
  		e.tile.onload = null;
  	},

  	_getZoomForUrl: function () {
  		var zoom = this._tileZoom,
  		maxZoom = this.options.maxZoom,
  		zoomReverse = this.options.zoomReverse,
  		zoomOffset = this.options.zoomOffset;

  		if (zoomReverse) {
  			zoom = maxZoom - zoom;
  		}

  		return zoom + zoomOffset;
  	},

  	_getSubdomain: function (tilePoint) {
  		var index = Math.abs(tilePoint.x + tilePoint.y) % this.options.subdomains.length;
  		return this.options.subdomains[index];
  	},

  	// stops loading all tiles in the background layer
  	_abortLoading: function () {
  		var i, tile;
  		for (i in this._tiles) {
  			if (this._tiles[i].coords.z !== this._tileZoom) {
  				tile = this._tiles[i].el;

  				tile.onload = falseFn;
  				tile.onerror = falseFn;

  				if (!tile.complete) {
  					tile.src = emptyImageUrl;
  					remove(tile);
  					delete this._tiles[i];
  				}
  			}
  		}
  	},

  	_removeTile: function (key) {
  		var tile = this._tiles[key];
  		if (!tile) { return; }

  		// Cancels any pending http requests associated with the tile
  		// unless we're on Android's stock browser,
  		// see https://github.com/Leaflet/Leaflet/issues/137
  		if (!androidStock) {
  			tile.el.setAttribute('src', emptyImageUrl);
  		}

  		return GridLayer.prototype._removeTile.call(this, key);
  	},

  	_tileReady: function (coords, err, tile) {
  		if (!this._map || (tile && tile.getAttribute('src') === emptyImageUrl)) {
  			return;
  		}

  		return GridLayer.prototype._tileReady.call(this, coords, err, tile);
  	}
  });


  // @factory L.tilelayer(urlTemplate: String, options?: TileLayer options)
  // Instantiates a tile layer object given a `URL template` and optionally an options object.

  function tileLayer(url, options) {
  	return new TileLayer(url, options);
  }

  /*
   * @class TileLayer.WMS
   * @inherits TileLayer
   * @aka L.TileLayer.WMS
   * Used to display [WMS](https://en.wikipedia.org/wiki/Web_Map_Service) services as tile layers on the map. Extends `TileLayer`.
   *
   * @example
   *
   * ```js
   * var nexrad = L.tileLayer.wms("http://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi", {
   * 	layers: 'nexrad-n0r-900913',
   * 	format: 'image/png',
   * 	transparent: true,
   * 	attribution: "Weather data © 2012 IEM Nexrad"
   * });
   * ```
   */

  var TileLayerWMS = TileLayer.extend({

  	// @section
  	// @aka TileLayer.WMS options
  	// If any custom options not documented here are used, they will be sent to the
  	// WMS server as extra parameters in each request URL. This can be useful for
  	// [non-standard vendor WMS parameters](http://docs.geoserver.org/stable/en/user/services/wms/vendor.html).
  	defaultWmsParams: {
  		service: 'WMS',
  		request: 'GetMap',

  		// @option layers: String = ''
  		// **(required)** Comma-separated list of WMS layers to show.
  		layers: '',

  		// @option styles: String = ''
  		// Comma-separated list of WMS styles.
  		styles: '',

  		// @option format: String = 'image/jpeg'
  		// WMS image format (use `'image/png'` for layers with transparency).
  		format: 'image/jpeg',

  		// @option transparent: Boolean = false
  		// If `true`, the WMS service will return images with transparency.
  		transparent: false,

  		// @option version: String = '1.1.1'
  		// Version of the WMS service to use
  		version: '1.1.1'
  	},

  	options: {
  		// @option crs: CRS = null
  		// Coordinate Reference System to use for the WMS requests, defaults to
  		// map CRS. Don't change this if you're not sure what it means.
  		crs: null,

  		// @option uppercase: Boolean = false
  		// If `true`, WMS request parameter keys will be uppercase.
  		uppercase: false
  	},

  	initialize: function (url, options) {

  		this._url = url;

  		var wmsParams = extend({}, this.defaultWmsParams);

  		// all keys that are not TileLayer options go to WMS params
  		for (var i in options) {
  			if (!(i in this.options)) {
  				wmsParams[i] = options[i];
  			}
  		}

  		options = setOptions(this, options);

  		var realRetina = options.detectRetina && retina ? 2 : 1;
  		var tileSize = this.getTileSize();
  		wmsParams.width = tileSize.x * realRetina;
  		wmsParams.height = tileSize.y * realRetina;

  		this.wmsParams = wmsParams;
  	},

  	onAdd: function (map) {

  		this._crs = this.options.crs || map.options.crs;
  		this._wmsVersion = parseFloat(this.wmsParams.version);

  		var projectionKey = this._wmsVersion >= 1.3 ? 'crs' : 'srs';
  		this.wmsParams[projectionKey] = this._crs.code;

  		TileLayer.prototype.onAdd.call(this, map);
  	},

  	getTileUrl: function (coords) {

  		var tileBounds = this._tileCoordsToNwSe(coords),
  		    crs = this._crs,
  		    bounds = toBounds(crs.project(tileBounds[0]), crs.project(tileBounds[1])),
  		    min = bounds.min,
  		    max = bounds.max,
  		    bbox = (this._wmsVersion >= 1.3 && this._crs === EPSG4326 ?
  		    [min.y, min.x, max.y, max.x] :
  		    [min.x, min.y, max.x, max.y]).join(','),
  		    url = TileLayer.prototype.getTileUrl.call(this, coords);
  		return url +
  			getParamString(this.wmsParams, url, this.options.uppercase) +
  			(this.options.uppercase ? '&BBOX=' : '&bbox=') + bbox;
  	},

  	// @method setParams(params: Object, noRedraw?: Boolean): this
  	// Merges an object with the new parameters and re-requests tiles on the current screen (unless `noRedraw` was set to true).
  	setParams: function (params, noRedraw) {

  		extend(this.wmsParams, params);

  		if (!noRedraw) {
  			this.redraw();
  		}

  		return this;
  	}
  });


  // @factory L.tileLayer.wms(baseUrl: String, options: TileLayer.WMS options)
  // Instantiates a WMS tile layer object given a base URL of the WMS service and a WMS parameters/options object.
  function tileLayerWMS(url, options) {
  	return new TileLayerWMS(url, options);
  }

  TileLayer.WMS = TileLayerWMS;
  tileLayer.wms = tileLayerWMS;

  /*
   * @class Renderer
   * @inherits Layer
   * @aka L.Renderer
   *
   * Base class for vector renderer implementations (`SVG`, `Canvas`). Handles the
   * DOM container of the renderer, its bounds, and its zoom animation.
   *
   * A `Renderer` works as an implicit layer group for all `Path`s - the renderer
   * itself can be added or removed to the map. All paths use a renderer, which can
   * be implicit (the map will decide the type of renderer and use it automatically)
   * or explicit (using the [`renderer`](#path-renderer) option of the path).
   *
   * Do not use this class directly, use `SVG` and `Canvas` instead.
   *
   * @event update: Event
   * Fired when the renderer updates its bounds, center and zoom, for example when
   * its map has moved
   */

  var Renderer = Layer.extend({

  	// @section
  	// @aka Renderer options
  	options: {
  		// @option padding: Number = 0.1
  		// How much to extend the clip area around the map view (relative to its size)
  		// e.g. 0.1 would be 10% of map view in each direction
  		padding: 0.1,

  		// @option tolerance: Number = 0
  		// How much to extend click tolerance round a path/object on the map
  		tolerance : 0
  	},

  	initialize: function (options) {
  		setOptions(this, options);
  		stamp(this);
  		this._layers = this._layers || {};
  	},

  	onAdd: function () {
  		if (!this._container) {
  			this._initContainer(); // defined by renderer implementations

  			if (this._zoomAnimated) {
  				addClass(this._container, 'leaflet-zoom-animated');
  			}
  		}

  		this.getPane().appendChild(this._container);
  		this._update();
  		this.on('update', this._updatePaths, this);
  	},

  	onRemove: function () {
  		this.off('update', this._updatePaths, this);
  		this._destroyContainer();
  	},

  	getEvents: function () {
  		var events = {
  			viewreset: this._reset,
  			zoom: this._onZoom,
  			moveend: this._update,
  			zoomend: this._onZoomEnd
  		};
  		if (this._zoomAnimated) {
  			events.zoomanim = this._onAnimZoom;
  		}
  		return events;
  	},

  	_onAnimZoom: function (ev) {
  		this._updateTransform(ev.center, ev.zoom);
  	},

  	_onZoom: function () {
  		this._updateTransform(this._map.getCenter(), this._map.getZoom());
  	},

  	_updateTransform: function (center, zoom) {
  		var scale = this._map.getZoomScale(zoom, this._zoom),
  		    position = getPosition(this._container),
  		    viewHalf = this._map.getSize().multiplyBy(0.5 + this.options.padding),
  		    currentCenterPoint = this._map.project(this._center, zoom),
  		    destCenterPoint = this._map.project(center, zoom),
  		    centerOffset = destCenterPoint.subtract(currentCenterPoint),

  		    topLeftOffset = viewHalf.multiplyBy(-scale).add(position).add(viewHalf).subtract(centerOffset);

  		if (any3d) {
  			setTransform(this._container, topLeftOffset, scale);
  		} else {
  			setPosition(this._container, topLeftOffset);
  		}
  	},

  	_reset: function () {
  		this._update();
  		this._updateTransform(this._center, this._zoom);

  		for (var id in this._layers) {
  			this._layers[id]._reset();
  		}
  	},

  	_onZoomEnd: function () {
  		for (var id in this._layers) {
  			this._layers[id]._project();
  		}
  	},

  	_updatePaths: function () {
  		for (var id in this._layers) {
  			this._layers[id]._update();
  		}
  	},

  	_update: function () {
  		// Update pixel bounds of renderer container (for positioning/sizing/clipping later)
  		// Subclasses are responsible of firing the 'update' event.
  		var p = this.options.padding,
  		    size = this._map.getSize(),
  		    min = this._map.containerPointToLayerPoint(size.multiplyBy(-p)).round();

  		this._bounds = new Bounds(min, min.add(size.multiplyBy(1 + p * 2)).round());

  		this._center = this._map.getCenter();
  		this._zoom = this._map.getZoom();
  	}
  });

  /*
   * @class Canvas
   * @inherits Renderer
   * @aka L.Canvas
   *
   * Allows vector layers to be displayed with [`<canvas>`](https://developer.mozilla.org/docs/Web/API/Canvas_API).
   * Inherits `Renderer`.
   *
   * Due to [technical limitations](http://caniuse.com/#search=canvas), Canvas is not
   * available in all web browsers, notably IE8, and overlapping geometries might
   * not display properly in some edge cases.
   *
   * @example
   *
   * Use Canvas by default for all paths in the map:
   *
   * ```js
   * var map = L.map('map', {
   * 	renderer: L.canvas()
   * });
   * ```
   *
   * Use a Canvas renderer with extra padding for specific vector geometries:
   *
   * ```js
   * var map = L.map('map');
   * var myRenderer = L.canvas({ padding: 0.5 });
   * var line = L.polyline( coordinates, { renderer: myRenderer } );
   * var circle = L.circle( center, { renderer: myRenderer } );
   * ```
   */

  var Canvas = Renderer.extend({
  	getEvents: function () {
  		var events = Renderer.prototype.getEvents.call(this);
  		events.viewprereset = this._onViewPreReset;
  		return events;
  	},

  	_onViewPreReset: function () {
  		// Set a flag so that a viewprereset+moveend+viewreset only updates&redraws once
  		this._postponeUpdatePaths = true;
  	},

  	onAdd: function () {
  		Renderer.prototype.onAdd.call(this);

  		// Redraw vectors since canvas is cleared upon removal,
  		// in case of removing the renderer itself from the map.
  		this._draw();
  	},

  	_initContainer: function () {
  		var container = this._container = document.createElement('canvas');

  		on(container, 'mousemove', this._onMouseMove, this);
  		on(container, 'click dblclick mousedown mouseup contextmenu', this._onClick, this);
  		on(container, 'mouseout', this._handleMouseOut, this);

  		this._ctx = container.getContext('2d');
  	},

  	_destroyContainer: function () {
  		cancelAnimFrame(this._redrawRequest);
  		delete this._ctx;
  		remove(this._container);
  		off(this._container);
  		delete this._container;
  	},

  	_updatePaths: function () {
  		if (this._postponeUpdatePaths) { return; }

  		var layer;
  		this._redrawBounds = null;
  		for (var id in this._layers) {
  			layer = this._layers[id];
  			layer._update();
  		}
  		this._redraw();
  	},

  	_update: function () {
  		if (this._map._animatingZoom && this._bounds) { return; }

  		Renderer.prototype._update.call(this);

  		var b = this._bounds,
  		    container = this._container,
  		    size = b.getSize(),
  		    m = retina ? 2 : 1;

  		setPosition(container, b.min);

  		// set canvas size (also clearing it); use double size on retina
  		container.width = m * size.x;
  		container.height = m * size.y;
  		container.style.width = size.x + 'px';
  		container.style.height = size.y + 'px';

  		if (retina) {
  			this._ctx.scale(2, 2);
  		}

  		// translate so we use the same path coordinates after canvas element moves
  		this._ctx.translate(-b.min.x, -b.min.y);

  		// Tell paths to redraw themselves
  		this.fire('update');
  	},

  	_reset: function () {
  		Renderer.prototype._reset.call(this);

  		if (this._postponeUpdatePaths) {
  			this._postponeUpdatePaths = false;
  			this._updatePaths();
  		}
  	},

  	_initPath: function (layer) {
  		this._updateDashArray(layer);
  		this._layers[stamp(layer)] = layer;

  		var order = layer._order = {
  			layer: layer,
  			prev: this._drawLast,
  			next: null
  		};
  		if (this._drawLast) { this._drawLast.next = order; }
  		this._drawLast = order;
  		this._drawFirst = this._drawFirst || this._drawLast;
  	},

  	_addPath: function (layer) {
  		this._requestRedraw(layer);
  	},

  	_removePath: function (layer) {
  		var order = layer._order;
  		var next = order.next;
  		var prev = order.prev;

  		if (next) {
  			next.prev = prev;
  		} else {
  			this._drawLast = prev;
  		}
  		if (prev) {
  			prev.next = next;
  		} else {
  			this._drawFirst = next;
  		}

  		delete layer._order;

  		delete this._layers[stamp(layer)];

  		this._requestRedraw(layer);
  	},

  	_updatePath: function (layer) {
  		// Redraw the union of the layer's old pixel
  		// bounds and the new pixel bounds.
  		this._extendRedrawBounds(layer);
  		layer._project();
  		layer._update();
  		// The redraw will extend the redraw bounds
  		// with the new pixel bounds.
  		this._requestRedraw(layer);
  	},

  	_updateStyle: function (layer) {
  		this._updateDashArray(layer);
  		this._requestRedraw(layer);
  	},

  	_updateDashArray: function (layer) {
  		if (typeof layer.options.dashArray === 'string') {
  			var parts = layer.options.dashArray.split(/[, ]+/),
  			    dashArray = [],
  			    dashValue,
  			    i;
  			for (i = 0; i < parts.length; i++) {
  				dashValue = Number(parts[i]);
  				// Ignore dash array containing invalid lengths
  				if (isNaN(dashValue)) { return; }
  				dashArray.push(dashValue);
  			}
  			layer.options._dashArray = dashArray;
  		} else {
  			layer.options._dashArray = layer.options.dashArray;
  		}
  	},

  	_requestRedraw: function (layer) {
  		if (!this._map) { return; }

  		this._extendRedrawBounds(layer);
  		this._redrawRequest = this._redrawRequest || requestAnimFrame(this._redraw, this);
  	},

  	_extendRedrawBounds: function (layer) {
  		if (layer._pxBounds) {
  			var padding = (layer.options.weight || 0) + 1;
  			this._redrawBounds = this._redrawBounds || new Bounds();
  			this._redrawBounds.extend(layer._pxBounds.min.subtract([padding, padding]));
  			this._redrawBounds.extend(layer._pxBounds.max.add([padding, padding]));
  		}
  	},

  	_redraw: function () {
  		this._redrawRequest = null;

  		if (this._redrawBounds) {
  			this._redrawBounds.min._floor();
  			this._redrawBounds.max._ceil();
  		}

  		this._clear(); // clear layers in redraw bounds
  		this._draw(); // draw layers

  		this._redrawBounds = null;
  	},

  	_clear: function () {
  		var bounds = this._redrawBounds;
  		if (bounds) {
  			var size = bounds.getSize();
  			this._ctx.clearRect(bounds.min.x, bounds.min.y, size.x, size.y);
  		} else {
  			this._ctx.clearRect(0, 0, this._container.width, this._container.height);
  		}
  	},

  	_draw: function () {
  		var layer, bounds = this._redrawBounds;
  		this._ctx.save();
  		if (bounds) {
  			var size = bounds.getSize();
  			this._ctx.beginPath();
  			this._ctx.rect(bounds.min.x, bounds.min.y, size.x, size.y);
  			this._ctx.clip();
  		}

  		this._drawing = true;

  		for (var order = this._drawFirst; order; order = order.next) {
  			layer = order.layer;
  			if (!bounds || (layer._pxBounds && layer._pxBounds.intersects(bounds))) {
  				layer._updatePath();
  			}
  		}

  		this._drawing = false;

  		this._ctx.restore();  // Restore state before clipping.
  	},

  	_updatePoly: function (layer, closed) {
  		if (!this._drawing) { return; }

  		var i, j, len2, p,
  		    parts = layer._parts,
  		    len = parts.length,
  		    ctx = this._ctx;

  		if (!len) { return; }

  		ctx.beginPath();

  		for (i = 0; i < len; i++) {
  			for (j = 0, len2 = parts[i].length; j < len2; j++) {
  				p = parts[i][j];
  				ctx[j ? 'lineTo' : 'moveTo'](p.x, p.y);
  			}
  			if (closed) {
  				ctx.closePath();
  			}
  		}

  		this._fillStroke(ctx, layer);

  		// TODO optimization: 1 fill/stroke for all features with equal style instead of 1 for each feature
  	},

  	_updateCircle: function (layer) {

  		if (!this._drawing || layer._empty()) { return; }

  		var p = layer._point,
  		    ctx = this._ctx,
  		    r = Math.max(Math.round(layer._radius), 1),
  		    s = (Math.max(Math.round(layer._radiusY), 1) || r) / r;

  		if (s !== 1) {
  			ctx.save();
  			ctx.scale(1, s);
  		}

  		ctx.beginPath();
  		ctx.arc(p.x, p.y / s, r, 0, Math.PI * 2, false);

  		if (s !== 1) {
  			ctx.restore();
  		}

  		this._fillStroke(ctx, layer);
  	},

  	_fillStroke: function (ctx, layer) {
  		var options = layer.options;

  		if (options.fill) {
  			ctx.globalAlpha = options.fillOpacity;
  			ctx.fillStyle = options.fillColor || options.color;
  			ctx.fill(options.fillRule || 'evenodd');
  		}

  		if (options.stroke && options.weight !== 0) {
  			if (ctx.setLineDash) {
  				ctx.setLineDash(layer.options && layer.options._dashArray || []);
  			}
  			ctx.globalAlpha = options.opacity;
  			ctx.lineWidth = options.weight;
  			ctx.strokeStyle = options.color;
  			ctx.lineCap = options.lineCap;
  			ctx.lineJoin = options.lineJoin;
  			ctx.stroke();
  		}
  	},

  	// Canvas obviously doesn't have mouse events for individual drawn objects,
  	// so we emulate that by calculating what's under the mouse on mousemove/click manually

  	_onClick: function (e) {
  		var point = this._map.mouseEventToLayerPoint(e), layer, clickedLayer;

  		for (var order = this._drawFirst; order; order = order.next) {
  			layer = order.layer;
  			if (layer.options.interactive && layer._containsPoint(point) && !this._map._draggableMoved(layer)) {
  				clickedLayer = layer;
  			}
  		}
  		if (clickedLayer)  {
  			fakeStop(e);
  			this._fireEvent([clickedLayer], e);
  		}
  	},

  	_onMouseMove: function (e) {
  		if (!this._map || this._map.dragging.moving() || this._map._animatingZoom) { return; }

  		var point = this._map.mouseEventToLayerPoint(e);
  		this._handleMouseHover(e, point);
  	},


  	_handleMouseOut: function (e) {
  		var layer = this._hoveredLayer;
  		if (layer) {
  			// if we're leaving the layer, fire mouseout
  			removeClass(this._container, 'leaflet-interactive');
  			this._fireEvent([layer], e, 'mouseout');
  			this._hoveredLayer = null;
  			this._mouseHoverThrottled = false;
  		}
  	},

  	_handleMouseHover: function (e, point) {
  		if (this._mouseHoverThrottled) {
  			return;
  		}

  		var layer, candidateHoveredLayer;

  		for (var order = this._drawFirst; order; order = order.next) {
  			layer = order.layer;
  			if (layer.options.interactive && layer._containsPoint(point)) {
  				candidateHoveredLayer = layer;
  			}
  		}

  		if (candidateHoveredLayer !== this._hoveredLayer) {
  			this._handleMouseOut(e);

  			if (candidateHoveredLayer) {
  				addClass(this._container, 'leaflet-interactive'); // change cursor
  				this._fireEvent([candidateHoveredLayer], e, 'mouseover');
  				this._hoveredLayer = candidateHoveredLayer;
  			}
  		}

  		if (this._hoveredLayer) {
  			this._fireEvent([this._hoveredLayer], e);
  		}

  		this._mouseHoverThrottled = true;
  		setTimeout(L.bind(function () {
  			this._mouseHoverThrottled = false;
  		}, this), 32);
  	},

  	_fireEvent: function (layers, e, type) {
  		this._map._fireDOMEvent(e, type || e.type, layers);
  	},

  	_bringToFront: function (layer) {
  		var order = layer._order;

  		if (!order) { return; }

  		var next = order.next;
  		var prev = order.prev;

  		if (next) {
  			next.prev = prev;
  		} else {
  			// Already last
  			return;
  		}
  		if (prev) {
  			prev.next = next;
  		} else if (next) {
  			// Update first entry unless this is the
  			// single entry
  			this._drawFirst = next;
  		}

  		order.prev = this._drawLast;
  		this._drawLast.next = order;

  		order.next = null;
  		this._drawLast = order;

  		this._requestRedraw(layer);
  	},

  	_bringToBack: function (layer) {
  		var order = layer._order;

  		if (!order) { return; }

  		var next = order.next;
  		var prev = order.prev;

  		if (prev) {
  			prev.next = next;
  		} else {
  			// Already first
  			return;
  		}
  		if (next) {
  			next.prev = prev;
  		} else if (prev) {
  			// Update last entry unless this is the
  			// single entry
  			this._drawLast = prev;
  		}

  		order.prev = null;

  		order.next = this._drawFirst;
  		this._drawFirst.prev = order;
  		this._drawFirst = order;

  		this._requestRedraw(layer);
  	}
  });

  // @factory L.canvas(options?: Renderer options)
  // Creates a Canvas renderer with the given options.
  function canvas$1(options) {
  	return canvas ? new Canvas(options) : null;
  }

  /*
   * Thanks to Dmitry Baranovsky and his Raphael library for inspiration!
   */


  var vmlCreate = (function () {
  	try {
  		document.namespaces.add('lvml', 'urn:schemas-microsoft-com:vml');
  		return function (name) {
  			return document.createElement('<lvml:' + name + ' class="lvml">');
  		};
  	} catch (e) {
  		return function (name) {
  			return document.createElement('<' + name + ' xmlns="urn:schemas-microsoft.com:vml" class="lvml">');
  		};
  	}
  })();


  /*
   * @class SVG
   *
   *
   * VML was deprecated in 2012, which means VML functionality exists only for backwards compatibility
   * with old versions of Internet Explorer.
   */

  // mixin to redefine some SVG methods to handle VML syntax which is similar but with some differences
  var vmlMixin = {

  	_initContainer: function () {
  		this._container = create$1('div', 'leaflet-vml-container');
  	},

  	_update: function () {
  		if (this._map._animatingZoom) { return; }
  		Renderer.prototype._update.call(this);
  		this.fire('update');
  	},

  	_initPath: function (layer) {
  		var container = layer._container = vmlCreate('shape');

  		addClass(container, 'leaflet-vml-shape ' + (this.options.className || ''));

  		container.coordsize = '1 1';

  		layer._path = vmlCreate('path');
  		container.appendChild(layer._path);

  		this._updateStyle(layer);
  		this._layers[stamp(layer)] = layer;
  	},

  	_addPath: function (layer) {
  		var container = layer._container;
  		this._container.appendChild(container);

  		if (layer.options.interactive) {
  			layer.addInteractiveTarget(container);
  		}
  	},

  	_removePath: function (layer) {
  		var container = layer._container;
  		remove(container);
  		layer.removeInteractiveTarget(container);
  		delete this._layers[stamp(layer)];
  	},

  	_updateStyle: function (layer) {
  		var stroke = layer._stroke,
  		    fill = layer._fill,
  		    options = layer.options,
  		    container = layer._container;

  		container.stroked = !!options.stroke;
  		container.filled = !!options.fill;

  		if (options.stroke) {
  			if (!stroke) {
  				stroke = layer._stroke = vmlCreate('stroke');
  			}
  			container.appendChild(stroke);
  			stroke.weight = options.weight + 'px';
  			stroke.color = options.color;
  			stroke.opacity = options.opacity;

  			if (options.dashArray) {
  				stroke.dashStyle = isArray(options.dashArray) ?
  				    options.dashArray.join(' ') :
  				    options.dashArray.replace(/( *, *)/g, ' ');
  			} else {
  				stroke.dashStyle = '';
  			}
  			stroke.endcap = options.lineCap.replace('butt', 'flat');
  			stroke.joinstyle = options.lineJoin;

  		} else if (stroke) {
  			container.removeChild(stroke);
  			layer._stroke = null;
  		}

  		if (options.fill) {
  			if (!fill) {
  				fill = layer._fill = vmlCreate('fill');
  			}
  			container.appendChild(fill);
  			fill.color = options.fillColor || options.color;
  			fill.opacity = options.fillOpacity;

  		} else if (fill) {
  			container.removeChild(fill);
  			layer._fill = null;
  		}
  	},

  	_updateCircle: function (layer) {
  		var p = layer._point.round(),
  		    r = Math.round(layer._radius),
  		    r2 = Math.round(layer._radiusY || r);

  		this._setPath(layer, layer._empty() ? 'M0 0' :
  			'AL ' + p.x + ',' + p.y + ' ' + r + ',' + r2 + ' 0,' + (65535 * 360));
  	},

  	_setPath: function (layer, path) {
  		layer._path.v = path;
  	},

  	_bringToFront: function (layer) {
  		toFront(layer._container);
  	},

  	_bringToBack: function (layer) {
  		toBack(layer._container);
  	}
  };

  var create$2 = vml ? vmlCreate : svgCreate;

  /*
   * @class SVG
   * @inherits Renderer
   * @aka L.SVG
   *
   * Allows vector layers to be displayed with [SVG](https://developer.mozilla.org/docs/Web/SVG).
   * Inherits `Renderer`.
   *
   * Due to [technical limitations](http://caniuse.com/#search=svg), SVG is not
   * available in all web browsers, notably Android 2.x and 3.x.
   *
   * Although SVG is not available on IE7 and IE8, these browsers support
   * [VML](https://en.wikipedia.org/wiki/Vector_Markup_Language)
   * (a now deprecated technology), and the SVG renderer will fall back to VML in
   * this case.
   *
   * @example
   *
   * Use SVG by default for all paths in the map:
   *
   * ```js
   * var map = L.map('map', {
   * 	renderer: L.svg()
   * });
   * ```
   *
   * Use a SVG renderer with extra padding for specific vector geometries:
   *
   * ```js
   * var map = L.map('map');
   * var myRenderer = L.svg({ padding: 0.5 });
   * var line = L.polyline( coordinates, { renderer: myRenderer } );
   * var circle = L.circle( center, { renderer: myRenderer } );
   * ```
   */

  var SVG = Renderer.extend({

  	getEvents: function () {
  		var events = Renderer.prototype.getEvents.call(this);
  		events.zoomstart = this._onZoomStart;
  		return events;
  	},

  	_initContainer: function () {
  		this._container = create$2('svg');

  		// makes it possible to click through svg root; we'll reset it back in individual paths
  		this._container.setAttribute('pointer-events', 'none');

  		this._rootGroup = create$2('g');
  		this._container.appendChild(this._rootGroup);
  	},

  	_destroyContainer: function () {
  		remove(this._container);
  		off(this._container);
  		delete this._container;
  		delete this._rootGroup;
  		delete this._svgSize;
  	},

  	_onZoomStart: function () {
  		// Drag-then-pinch interactions might mess up the center and zoom.
  		// In this case, the easiest way to prevent this is re-do the renderer
  		//   bounds and padding when the zooming starts.
  		this._update();
  	},

  	_update: function () {
  		if (this._map._animatingZoom && this._bounds) { return; }

  		Renderer.prototype._update.call(this);

  		var b = this._bounds,
  		    size = b.getSize(),
  		    container = this._container;

  		// set size of svg-container if changed
  		if (!this._svgSize || !this._svgSize.equals(size)) {
  			this._svgSize = size;
  			container.setAttribute('width', size.x);
  			container.setAttribute('height', size.y);
  		}

  		// movement: update container viewBox so that we don't have to change coordinates of individual layers
  		setPosition(container, b.min);
  		container.setAttribute('viewBox', [b.min.x, b.min.y, size.x, size.y].join(' '));

  		this.fire('update');
  	},

  	// methods below are called by vector layers implementations

  	_initPath: function (layer) {
  		var path = layer._path = create$2('path');

  		// @namespace Path
  		// @option className: String = null
  		// Custom class name set on an element. Only for SVG renderer.
  		if (layer.options.className) {
  			addClass(path, layer.options.className);
  		}

  		if (layer.options.interactive) {
  			addClass(path, 'leaflet-interactive');
  		}

  		this._updateStyle(layer);
  		this._layers[stamp(layer)] = layer;
  	},

  	_addPath: function (layer) {
  		if (!this._rootGroup) { this._initContainer(); }
  		this._rootGroup.appendChild(layer._path);
  		layer.addInteractiveTarget(layer._path);
  	},

  	_removePath: function (layer) {
  		remove(layer._path);
  		layer.removeInteractiveTarget(layer._path);
  		delete this._layers[stamp(layer)];
  	},

  	_updatePath: function (layer) {
  		layer._project();
  		layer._update();
  	},

  	_updateStyle: function (layer) {
  		var path = layer._path,
  		    options = layer.options;

  		if (!path) { return; }

  		if (options.stroke) {
  			path.setAttribute('stroke', options.color);
  			path.setAttribute('stroke-opacity', options.opacity);
  			path.setAttribute('stroke-width', options.weight);
  			path.setAttribute('stroke-linecap', options.lineCap);
  			path.setAttribute('stroke-linejoin', options.lineJoin);

  			if (options.dashArray) {
  				path.setAttribute('stroke-dasharray', options.dashArray);
  			} else {
  				path.removeAttribute('stroke-dasharray');
  			}

  			if (options.dashOffset) {
  				path.setAttribute('stroke-dashoffset', options.dashOffset);
  			} else {
  				path.removeAttribute('stroke-dashoffset');
  			}
  		} else {
  			path.setAttribute('stroke', 'none');
  		}

  		if (options.fill) {
  			path.setAttribute('fill', options.fillColor || options.color);
  			path.setAttribute('fill-opacity', options.fillOpacity);
  			path.setAttribute('fill-rule', options.fillRule || 'evenodd');
  		} else {
  			path.setAttribute('fill', 'none');
  		}
  	},

  	_updatePoly: function (layer, closed) {
  		this._setPath(layer, pointsToPath(layer._parts, closed));
  	},

  	_updateCircle: function (layer) {
  		var p = layer._point,
  		    r = Math.max(Math.round(layer._radius), 1),
  		    r2 = Math.max(Math.round(layer._radiusY), 1) || r,
  		    arc = 'a' + r + ',' + r2 + ' 0 1,0 ';

  		// drawing a circle with two half-arcs
  		var d = layer._empty() ? 'M0 0' :
  			'M' + (p.x - r) + ',' + p.y +
  			arc + (r * 2) + ',0 ' +
  			arc + (-r * 2) + ',0 ';

  		this._setPath(layer, d);
  	},

  	_setPath: function (layer, path) {
  		layer._path.setAttribute('d', path);
  	},

  	// SVG does not have the concept of zIndex so we resort to changing the DOM order of elements
  	_bringToFront: function (layer) {
  		toFront(layer._path);
  	},

  	_bringToBack: function (layer) {
  		toBack(layer._path);
  	}
  });

  if (vml) {
  	SVG.include(vmlMixin);
  }

  // @namespace SVG
  // @factory L.svg(options?: Renderer options)
  // Creates a SVG renderer with the given options.
  function svg$1(options) {
  	return svg || vml ? new SVG(options) : null;
  }

  Map.include({
  	// @namespace Map; @method getRenderer(layer: Path): Renderer
  	// Returns the instance of `Renderer` that should be used to render the given
  	// `Path`. It will ensure that the `renderer` options of the map and paths
  	// are respected, and that the renderers do exist on the map.
  	getRenderer: function (layer) {
  		// @namespace Path; @option renderer: Renderer
  		// Use this specific instance of `Renderer` for this path. Takes
  		// precedence over the map's [default renderer](#map-renderer).
  		var renderer = layer.options.renderer || this._getPaneRenderer(layer.options.pane) || this.options.renderer || this._renderer;

  		if (!renderer) {
  			renderer = this._renderer = this._createRenderer();
  		}

  		if (!this.hasLayer(renderer)) {
  			this.addLayer(renderer);
  		}
  		return renderer;
  	},

  	_getPaneRenderer: function (name) {
  		if (name === 'overlayPane' || name === undefined) {
  			return false;
  		}

  		var renderer = this._paneRenderers[name];
  		if (renderer === undefined) {
  			renderer = this._createRenderer({pane: name});
  			this._paneRenderers[name] = renderer;
  		}
  		return renderer;
  	},

  	_createRenderer: function (options) {
  		// @namespace Map; @option preferCanvas: Boolean = false
  		// Whether `Path`s should be rendered on a `Canvas` renderer.
  		// By default, all `Path`s are rendered in a `SVG` renderer.
  		return (this.options.preferCanvas && canvas$1(options)) || svg$1(options);
  	}
  });

  /*
   * L.Rectangle extends Polygon and creates a rectangle when passed a LatLngBounds object.
   */

  /*
   * @class Rectangle
   * @aka L.Rectangle
   * @inherits Polygon
   *
   * A class for drawing rectangle overlays on a map. Extends `Polygon`.
   *
   * @example
   *
   * ```js
   * // define rectangle geographical bounds
   * var bounds = [[54.559322, -5.767822], [56.1210604, -3.021240]];
   *
   * // create an orange rectangle
   * L.rectangle(bounds, {color: "#ff7800", weight: 1}).addTo(map);
   *
   * // zoom the map to the rectangle bounds
   * map.fitBounds(bounds);
   * ```
   *
   */


  var Rectangle = Polygon.extend({
  	initialize: function (latLngBounds, options) {
  		Polygon.prototype.initialize.call(this, this._boundsToLatLngs(latLngBounds), options);
  	},

  	// @method setBounds(latLngBounds: LatLngBounds): this
  	// Redraws the rectangle with the passed bounds.
  	setBounds: function (latLngBounds) {
  		return this.setLatLngs(this._boundsToLatLngs(latLngBounds));
  	},

  	_boundsToLatLngs: function (latLngBounds) {
  		latLngBounds = toLatLngBounds(latLngBounds);
  		return [
  			latLngBounds.getSouthWest(),
  			latLngBounds.getNorthWest(),
  			latLngBounds.getNorthEast(),
  			latLngBounds.getSouthEast()
  		];
  	}
  });


  // @factory L.rectangle(latLngBounds: LatLngBounds, options?: Polyline options)
  function rectangle(latLngBounds, options) {
  	return new Rectangle(latLngBounds, options);
  }

  SVG.create = create$2;
  SVG.pointsToPath = pointsToPath;

  GeoJSON.geometryToLayer = geometryToLayer;
  GeoJSON.coordsToLatLng = coordsToLatLng;
  GeoJSON.coordsToLatLngs = coordsToLatLngs;
  GeoJSON.latLngToCoords = latLngToCoords;
  GeoJSON.latLngsToCoords = latLngsToCoords;
  GeoJSON.getFeature = getFeature;
  GeoJSON.asFeature = asFeature;

  /*
   * L.Handler.BoxZoom is used to add shift-drag zoom interaction to the map
   * (zoom to a selected bounding box), enabled by default.
   */

  // @namespace Map
  // @section Interaction Options
  Map.mergeOptions({
  	// @option boxZoom: Boolean = true
  	// Whether the map can be zoomed to a rectangular area specified by
  	// dragging the mouse while pressing the shift key.
  	boxZoom: true
  });

  var BoxZoom = Handler.extend({
  	initialize: function (map) {
  		this._map = map;
  		this._container = map._container;
  		this._pane = map._panes.overlayPane;
  		this._resetStateTimeout = 0;
  		map.on('unload', this._destroy, this);
  	},

  	addHooks: function () {
  		on(this._container, 'mousedown', this._onMouseDown, this);
  	},

  	removeHooks: function () {
  		off(this._container, 'mousedown', this._onMouseDown, this);
  	},

  	moved: function () {
  		return this._moved;
  	},

  	_destroy: function () {
  		remove(this._pane);
  		delete this._pane;
  	},

  	_resetState: function () {
  		this._resetStateTimeout = 0;
  		this._moved = false;
  	},

  	_clearDeferredResetState: function () {
  		if (this._resetStateTimeout !== 0) {
  			clearTimeout(this._resetStateTimeout);
  			this._resetStateTimeout = 0;
  		}
  	},

  	_onMouseDown: function (e) {
  		if (!e.shiftKey || ((e.which !== 1) && (e.button !== 1))) { return false; }

  		// Clear the deferred resetState if it hasn't executed yet, otherwise it
  		// will interrupt the interaction and orphan a box element in the container.
  		this._clearDeferredResetState();
  		this._resetState();

  		disableTextSelection();
  		disableImageDrag();

  		this._startPoint = this._map.mouseEventToContainerPoint(e);

  		on(document, {
  			contextmenu: stop,
  			mousemove: this._onMouseMove,
  			mouseup: this._onMouseUp,
  			keydown: this._onKeyDown
  		}, this);
  	},

  	_onMouseMove: function (e) {
  		if (!this._moved) {
  			this._moved = true;

  			this._box = create$1('div', 'leaflet-zoom-box', this._container);
  			addClass(this._container, 'leaflet-crosshair');

  			this._map.fire('boxzoomstart');
  		}

  		this._point = this._map.mouseEventToContainerPoint(e);

  		var bounds = new Bounds(this._point, this._startPoint),
  		    size = bounds.getSize();

  		setPosition(this._box, bounds.min);

  		this._box.style.width  = size.x + 'px';
  		this._box.style.height = size.y + 'px';
  	},

  	_finish: function () {
  		if (this._moved) {
  			remove(this._box);
  			removeClass(this._container, 'leaflet-crosshair');
  		}

  		enableTextSelection();
  		enableImageDrag();

  		off(document, {
  			contextmenu: stop,
  			mousemove: this._onMouseMove,
  			mouseup: this._onMouseUp,
  			keydown: this._onKeyDown
  		}, this);
  	},

  	_onMouseUp: function (e) {
  		if ((e.which !== 1) && (e.button !== 1)) { return; }

  		this._finish();

  		if (!this._moved) { return; }
  		// Postpone to next JS tick so internal click event handling
  		// still see it as "moved".
  		this._clearDeferredResetState();
  		this._resetStateTimeout = setTimeout(bind(this._resetState, this), 0);

  		var bounds = new LatLngBounds(
  		        this._map.containerPointToLatLng(this._startPoint),
  		        this._map.containerPointToLatLng(this._point));

  		this._map
  			.fitBounds(bounds)
  			.fire('boxzoomend', {boxZoomBounds: bounds});
  	},

  	_onKeyDown: function (e) {
  		if (e.keyCode === 27) {
  			this._finish();
  		}
  	}
  });

  // @section Handlers
  // @property boxZoom: Handler
  // Box (shift-drag with mouse) zoom handler.
  Map.addInitHook('addHandler', 'boxZoom', BoxZoom);

  /*
   * L.Handler.DoubleClickZoom is used to handle double-click zoom on the map, enabled by default.
   */

  // @namespace Map
  // @section Interaction Options

  Map.mergeOptions({
  	// @option doubleClickZoom: Boolean|String = true
  	// Whether the map can be zoomed in by double clicking on it and
  	// zoomed out by double clicking while holding shift. If passed
  	// `'center'`, double-click zoom will zoom to the center of the
  	//  view regardless of where the mouse was.
  	doubleClickZoom: true
  });

  var DoubleClickZoom = Handler.extend({
  	addHooks: function () {
  		this._map.on('dblclick', this._onDoubleClick, this);
  	},

  	removeHooks: function () {
  		this._map.off('dblclick', this._onDoubleClick, this);
  	},

  	_onDoubleClick: function (e) {
  		var map = this._map,
  		    oldZoom = map.getZoom(),
  		    delta = map.options.zoomDelta,
  		    zoom = e.originalEvent.shiftKey ? oldZoom - delta : oldZoom + delta;

  		if (map.options.doubleClickZoom === 'center') {
  			map.setZoom(zoom);
  		} else {
  			map.setZoomAround(e.containerPoint, zoom);
  		}
  	}
  });

  // @section Handlers
  //
  // Map properties include interaction handlers that allow you to control
  // interaction behavior in runtime, enabling or disabling certain features such
  // as dragging or touch zoom (see `Handler` methods). For example:
  //
  // ```js
  // map.doubleClickZoom.disable();
  // ```
  //
  // @property doubleClickZoom: Handler
  // Double click zoom handler.
  Map.addInitHook('addHandler', 'doubleClickZoom', DoubleClickZoom);

  /*
   * L.Handler.MapDrag is used to make the map draggable (with panning inertia), enabled by default.
   */

  // @namespace Map
  // @section Interaction Options
  Map.mergeOptions({
  	// @option dragging: Boolean = true
  	// Whether the map be draggable with mouse/touch or not.
  	dragging: true,

  	// @section Panning Inertia Options
  	// @option inertia: Boolean = *
  	// If enabled, panning of the map will have an inertia effect where
  	// the map builds momentum while dragging and continues moving in
  	// the same direction for some time. Feels especially nice on touch
  	// devices. Enabled by default unless running on old Android devices.
  	inertia: !android23,

  	// @option inertiaDeceleration: Number = 3000
  	// The rate with which the inertial movement slows down, in pixels/second².
  	inertiaDeceleration: 3400, // px/s^2

  	// @option inertiaMaxSpeed: Number = Infinity
  	// Max speed of the inertial movement, in pixels/second.
  	inertiaMaxSpeed: Infinity, // px/s

  	// @option easeLinearity: Number = 0.2
  	easeLinearity: 0.2,

  	// TODO refactor, move to CRS
  	// @option worldCopyJump: Boolean = false
  	// With this option enabled, the map tracks when you pan to another "copy"
  	// of the world and seamlessly jumps to the original one so that all overlays
  	// like markers and vector layers are still visible.
  	worldCopyJump: false,

  	// @option maxBoundsViscosity: Number = 0.0
  	// If `maxBounds` is set, this option will control how solid the bounds
  	// are when dragging the map around. The default value of `0.0` allows the
  	// user to drag outside the bounds at normal speed, higher values will
  	// slow down map dragging outside bounds, and `1.0` makes the bounds fully
  	// solid, preventing the user from dragging outside the bounds.
  	maxBoundsViscosity: 0.0
  });

  var Drag = Handler.extend({
  	addHooks: function () {
  		if (!this._draggable) {
  			var map = this._map;

  			this._draggable = new Draggable(map._mapPane, map._container);

  			this._draggable.on({
  				dragstart: this._onDragStart,
  				drag: this._onDrag,
  				dragend: this._onDragEnd
  			}, this);

  			this._draggable.on('predrag', this._onPreDragLimit, this);
  			if (map.options.worldCopyJump) {
  				this._draggable.on('predrag', this._onPreDragWrap, this);
  				map.on('zoomend', this._onZoomEnd, this);

  				map.whenReady(this._onZoomEnd, this);
  			}
  		}
  		addClass(this._map._container, 'leaflet-grab leaflet-touch-drag');
  		this._draggable.enable();
  		this._positions = [];
  		this._times = [];
  	},

  	removeHooks: function () {
  		removeClass(this._map._container, 'leaflet-grab');
  		removeClass(this._map._container, 'leaflet-touch-drag');
  		this._draggable.disable();
  	},

  	moved: function () {
  		return this._draggable && this._draggable._moved;
  	},

  	moving: function () {
  		return this._draggable && this._draggable._moving;
  	},

  	_onDragStart: function () {
  		var map = this._map;

  		map._stop();
  		if (this._map.options.maxBounds && this._map.options.maxBoundsViscosity) {
  			var bounds = toLatLngBounds(this._map.options.maxBounds);

  			this._offsetLimit = toBounds(
  				this._map.latLngToContainerPoint(bounds.getNorthWest()).multiplyBy(-1),
  				this._map.latLngToContainerPoint(bounds.getSouthEast()).multiplyBy(-1)
  					.add(this._map.getSize()));

  			this._viscosity = Math.min(1.0, Math.max(0.0, this._map.options.maxBoundsViscosity));
  		} else {
  			this._offsetLimit = null;
  		}

  		map
  		    .fire('movestart')
  		    .fire('dragstart');

  		if (map.options.inertia) {
  			this._positions = [];
  			this._times = [];
  		}
  	},

  	_onDrag: function (e) {
  		if (this._map.options.inertia) {
  			var time = this._lastTime = +new Date(),
  			    pos = this._lastPos = this._draggable._absPos || this._draggable._newPos;

  			this._positions.push(pos);
  			this._times.push(time);

  			this._prunePositions(time);
  		}

  		this._map
  		    .fire('move', e)
  		    .fire('drag', e);
  	},

  	_prunePositions: function (time) {
  		while (this._positions.length > 1 && time - this._times[0] > 50) {
  			this._positions.shift();
  			this._times.shift();
  		}
  	},

  	_onZoomEnd: function () {
  		var pxCenter = this._map.getSize().divideBy(2),
  		    pxWorldCenter = this._map.latLngToLayerPoint([0, 0]);

  		this._initialWorldOffset = pxWorldCenter.subtract(pxCenter).x;
  		this._worldWidth = this._map.getPixelWorldBounds().getSize().x;
  	},

  	_viscousLimit: function (value, threshold) {
  		return value - (value - threshold) * this._viscosity;
  	},

  	_onPreDragLimit: function () {
  		if (!this._viscosity || !this._offsetLimit) { return; }

  		var offset = this._draggable._newPos.subtract(this._draggable._startPos);

  		var limit = this._offsetLimit;
  		if (offset.x < limit.min.x) { offset.x = this._viscousLimit(offset.x, limit.min.x); }
  		if (offset.y < limit.min.y) { offset.y = this._viscousLimit(offset.y, limit.min.y); }
  		if (offset.x > limit.max.x) { offset.x = this._viscousLimit(offset.x, limit.max.x); }
  		if (offset.y > limit.max.y) { offset.y = this._viscousLimit(offset.y, limit.max.y); }

  		this._draggable._newPos = this._draggable._startPos.add(offset);
  	},

  	_onPreDragWrap: function () {
  		// TODO refactor to be able to adjust map pane position after zoom
  		var worldWidth = this._worldWidth,
  		    halfWidth = Math.round(worldWidth / 2),
  		    dx = this._initialWorldOffset,
  		    x = this._draggable._newPos.x,
  		    newX1 = (x - halfWidth + dx) % worldWidth + halfWidth - dx,
  		    newX2 = (x + halfWidth + dx) % worldWidth - halfWidth - dx,
  		    newX = Math.abs(newX1 + dx) < Math.abs(newX2 + dx) ? newX1 : newX2;

  		this._draggable._absPos = this._draggable._newPos.clone();
  		this._draggable._newPos.x = newX;
  	},

  	_onDragEnd: function (e) {
  		var map = this._map,
  		    options = map.options,

  		    noInertia = !options.inertia || this._times.length < 2;

  		map.fire('dragend', e);

  		if (noInertia) {
  			map.fire('moveend');

  		} else {
  			this._prunePositions(+new Date());

  			var direction = this._lastPos.subtract(this._positions[0]),
  			    duration = (this._lastTime - this._times[0]) / 1000,
  			    ease = options.easeLinearity,

  			    speedVector = direction.multiplyBy(ease / duration),
  			    speed = speedVector.distanceTo([0, 0]),

  			    limitedSpeed = Math.min(options.inertiaMaxSpeed, speed),
  			    limitedSpeedVector = speedVector.multiplyBy(limitedSpeed / speed),

  			    decelerationDuration = limitedSpeed / (options.inertiaDeceleration * ease),
  			    offset = limitedSpeedVector.multiplyBy(-decelerationDuration / 2).round();

  			if (!offset.x && !offset.y) {
  				map.fire('moveend');

  			} else {
  				offset = map._limitOffset(offset, map.options.maxBounds);

  				requestAnimFrame(function () {
  					map.panBy(offset, {
  						duration: decelerationDuration,
  						easeLinearity: ease,
  						noMoveStart: true,
  						animate: true
  					});
  				});
  			}
  		}
  	}
  });

  // @section Handlers
  // @property dragging: Handler
  // Map dragging handler (by both mouse and touch).
  Map.addInitHook('addHandler', 'dragging', Drag);

  /*
   * L.Map.Keyboard is handling keyboard interaction with the map, enabled by default.
   */

  // @namespace Map
  // @section Keyboard Navigation Options
  Map.mergeOptions({
  	// @option keyboard: Boolean = true
  	// Makes the map focusable and allows users to navigate the map with keyboard
  	// arrows and `+`/`-` keys.
  	keyboard: true,

  	// @option keyboardPanDelta: Number = 80
  	// Amount of pixels to pan when pressing an arrow key.
  	keyboardPanDelta: 80
  });

  var Keyboard = Handler.extend({

  	keyCodes: {
  		left:    [37],
  		right:   [39],
  		down:    [40],
  		up:      [38],
  		zoomIn:  [187, 107, 61, 171],
  		zoomOut: [189, 109, 54, 173]
  	},

  	initialize: function (map) {
  		this._map = map;

  		this._setPanDelta(map.options.keyboardPanDelta);
  		this._setZoomDelta(map.options.zoomDelta);
  	},

  	addHooks: function () {
  		var container = this._map._container;

  		// make the container focusable by tabbing
  		if (container.tabIndex <= 0) {
  			container.tabIndex = '0';
  		}

  		on(container, {
  			focus: this._onFocus,
  			blur: this._onBlur,
  			mousedown: this._onMouseDown
  		}, this);

  		this._map.on({
  			focus: this._addHooks,
  			blur: this._removeHooks
  		}, this);
  	},

  	removeHooks: function () {
  		this._removeHooks();

  		off(this._map._container, {
  			focus: this._onFocus,
  			blur: this._onBlur,
  			mousedown: this._onMouseDown
  		}, this);

  		this._map.off({
  			focus: this._addHooks,
  			blur: this._removeHooks
  		}, this);
  	},

  	_onMouseDown: function () {
  		if (this._focused) { return; }

  		var body = document.body,
  		    docEl = document.documentElement,
  		    top = body.scrollTop || docEl.scrollTop,
  		    left = body.scrollLeft || docEl.scrollLeft;

  		this._map._container.focus();

  		window.scrollTo(left, top);
  	},

  	_onFocus: function () {
  		this._focused = true;
  		this._map.fire('focus');
  	},

  	_onBlur: function () {
  		this._focused = false;
  		this._map.fire('blur');
  	},

  	_setPanDelta: function (panDelta) {
  		var keys = this._panKeys = {},
  		    codes = this.keyCodes,
  		    i, len;

  		for (i = 0, len = codes.left.length; i < len; i++) {
  			keys[codes.left[i]] = [-1 * panDelta, 0];
  		}
  		for (i = 0, len = codes.right.length; i < len; i++) {
  			keys[codes.right[i]] = [panDelta, 0];
  		}
  		for (i = 0, len = codes.down.length; i < len; i++) {
  			keys[codes.down[i]] = [0, panDelta];
  		}
  		for (i = 0, len = codes.up.length; i < len; i++) {
  			keys[codes.up[i]] = [0, -1 * panDelta];
  		}
  	},

  	_setZoomDelta: function (zoomDelta) {
  		var keys = this._zoomKeys = {},
  		    codes = this.keyCodes,
  		    i, len;

  		for (i = 0, len = codes.zoomIn.length; i < len; i++) {
  			keys[codes.zoomIn[i]] = zoomDelta;
  		}
  		for (i = 0, len = codes.zoomOut.length; i < len; i++) {
  			keys[codes.zoomOut[i]] = -zoomDelta;
  		}
  	},

  	_addHooks: function () {
  		on(document, 'keydown', this._onKeyDown, this);
  	},

  	_removeHooks: function () {
  		off(document, 'keydown', this._onKeyDown, this);
  	},

  	_onKeyDown: function (e) {
  		if (e.altKey || e.ctrlKey || e.metaKey) { return; }

  		var key = e.keyCode,
  		    map = this._map,
  		    offset;

  		if (key in this._panKeys) {
  			if (!map._panAnim || !map._panAnim._inProgress) {
  				offset = this._panKeys[key];
  				if (e.shiftKey) {
  					offset = toPoint(offset).multiplyBy(3);
  				}

  				map.panBy(offset);

  				if (map.options.maxBounds) {
  					map.panInsideBounds(map.options.maxBounds);
  				}
  			}
  		} else if (key in this._zoomKeys) {
  			map.setZoom(map.getZoom() + (e.shiftKey ? 3 : 1) * this._zoomKeys[key]);

  		} else if (key === 27 && map._popup && map._popup.options.closeOnEscapeKey) {
  			map.closePopup();

  		} else {
  			return;
  		}

  		stop(e);
  	}
  });

  // @section Handlers
  // @section Handlers
  // @property keyboard: Handler
  // Keyboard navigation handler.
  Map.addInitHook('addHandler', 'keyboard', Keyboard);

  /*
   * L.Handler.ScrollWheelZoom is used by L.Map to enable mouse scroll wheel zoom on the map.
   */

  // @namespace Map
  // @section Interaction Options
  Map.mergeOptions({
  	// @section Mousewheel options
  	// @option scrollWheelZoom: Boolean|String = true
  	// Whether the map can be zoomed by using the mouse wheel. If passed `'center'`,
  	// it will zoom to the center of the view regardless of where the mouse was.
  	scrollWheelZoom: true,

  	// @option wheelDebounceTime: Number = 40
  	// Limits the rate at which a wheel can fire (in milliseconds). By default
  	// user can't zoom via wheel more often than once per 40 ms.
  	wheelDebounceTime: 40,

  	// @option wheelPxPerZoomLevel: Number = 60
  	// How many scroll pixels (as reported by [L.DomEvent.getWheelDelta](#domevent-getwheeldelta))
  	// mean a change of one full zoom level. Smaller values will make wheel-zooming
  	// faster (and vice versa).
  	wheelPxPerZoomLevel: 60
  });

  var ScrollWheelZoom = Handler.extend({
  	addHooks: function () {
  		on(this._map._container, 'mousewheel', this._onWheelScroll, this);

  		this._delta = 0;
  	},

  	removeHooks: function () {
  		off(this._map._container, 'mousewheel', this._onWheelScroll, this);
  	},

  	_onWheelScroll: function (e) {
  		var delta = getWheelDelta(e);

  		var debounce = this._map.options.wheelDebounceTime;

  		this._delta += delta;
  		this._lastMousePos = this._map.mouseEventToContainerPoint(e);

  		if (!this._startTime) {
  			this._startTime = +new Date();
  		}

  		var left = Math.max(debounce - (+new Date() - this._startTime), 0);

  		clearTimeout(this._timer);
  		this._timer = setTimeout(bind(this._performZoom, this), left);

  		stop(e);
  	},

  	_performZoom: function () {
  		var map = this._map,
  		    zoom = map.getZoom(),
  		    snap = this._map.options.zoomSnap || 0;

  		map._stop(); // stop panning and fly animations if any

  		// map the delta with a sigmoid function to -4..4 range leaning on -1..1
  		var d2 = this._delta / (this._map.options.wheelPxPerZoomLevel * 4),
  		    d3 = 4 * Math.log(2 / (1 + Math.exp(-Math.abs(d2)))) / Math.LN2,
  		    d4 = snap ? Math.ceil(d3 / snap) * snap : d3,
  		    delta = map._limitZoom(zoom + (this._delta > 0 ? d4 : -d4)) - zoom;

  		this._delta = 0;
  		this._startTime = null;

  		if (!delta) { return; }

  		if (map.options.scrollWheelZoom === 'center') {
  			map.setZoom(zoom + delta);
  		} else {
  			map.setZoomAround(this._lastMousePos, zoom + delta);
  		}
  	}
  });

  // @section Handlers
  // @property scrollWheelZoom: Handler
  // Scroll wheel zoom handler.
  Map.addInitHook('addHandler', 'scrollWheelZoom', ScrollWheelZoom);

  /*
   * L.Map.Tap is used to enable mobile hacks like quick taps and long hold.
   */

  // @namespace Map
  // @section Interaction Options
  Map.mergeOptions({
  	// @section Touch interaction options
  	// @option tap: Boolean = true
  	// Enables mobile hacks for supporting instant taps (fixing 200ms click
  	// delay on iOS/Android) and touch holds (fired as `contextmenu` events).
  	tap: true,

  	// @option tapTolerance: Number = 15
  	// The max number of pixels a user can shift his finger during touch
  	// for it to be considered a valid tap.
  	tapTolerance: 15
  });

  var Tap = Handler.extend({
  	addHooks: function () {
  		on(this._map._container, 'touchstart', this._onDown, this);
  	},

  	removeHooks: function () {
  		off(this._map._container, 'touchstart', this._onDown, this);
  	},

  	_onDown: function (e) {
  		if (!e.touches) { return; }

  		preventDefault(e);

  		this._fireClick = true;

  		// don't simulate click or track longpress if more than 1 touch
  		if (e.touches.length > 1) {
  			this._fireClick = false;
  			clearTimeout(this._holdTimeout);
  			return;
  		}

  		var first = e.touches[0],
  		    el = first.target;

  		this._startPos = this._newPos = new Point(first.clientX, first.clientY);

  		// if touching a link, highlight it
  		if (el.tagName && el.tagName.toLowerCase() === 'a') {
  			addClass(el, 'leaflet-active');
  		}

  		// simulate long hold but setting a timeout
  		this._holdTimeout = setTimeout(bind(function () {
  			if (this._isTapValid()) {
  				this._fireClick = false;
  				this._onUp();
  				this._simulateEvent('contextmenu', first);
  			}
  		}, this), 1000);

  		this._simulateEvent('mousedown', first);

  		on(document, {
  			touchmove: this._onMove,
  			touchend: this._onUp
  		}, this);
  	},

  	_onUp: function (e) {
  		clearTimeout(this._holdTimeout);

  		off(document, {
  			touchmove: this._onMove,
  			touchend: this._onUp
  		}, this);

  		if (this._fireClick && e && e.changedTouches) {

  			var first = e.changedTouches[0],
  			    el = first.target;

  			if (el && el.tagName && el.tagName.toLowerCase() === 'a') {
  				removeClass(el, 'leaflet-active');
  			}

  			this._simulateEvent('mouseup', first);

  			// simulate click if the touch didn't move too much
  			if (this._isTapValid()) {
  				this._simulateEvent('click', first);
  			}
  		}
  	},

  	_isTapValid: function () {
  		return this._newPos.distanceTo(this._startPos) <= this._map.options.tapTolerance;
  	},

  	_onMove: function (e) {
  		var first = e.touches[0];
  		this._newPos = new Point(first.clientX, first.clientY);
  		this._simulateEvent('mousemove', first);
  	},

  	_simulateEvent: function (type, e) {
  		var simulatedEvent = document.createEvent('MouseEvents');

  		simulatedEvent._simulated = true;
  		e.target._simulatedClick = true;

  		simulatedEvent.initMouseEvent(
  		        type, true, true, window, 1,
  		        e.screenX, e.screenY,
  		        e.clientX, e.clientY,
  		        false, false, false, false, 0, null);

  		e.target.dispatchEvent(simulatedEvent);
  	}
  });

  // @section Handlers
  // @property tap: Handler
  // Mobile touch hacks (quick tap and touch hold) handler.
  if (touch && !pointer) {
  	Map.addInitHook('addHandler', 'tap', Tap);
  }

  /*
   * L.Handler.TouchZoom is used by L.Map to add pinch zoom on supported mobile browsers.
   */

  // @namespace Map
  // @section Interaction Options
  Map.mergeOptions({
  	// @section Touch interaction options
  	// @option touchZoom: Boolean|String = *
  	// Whether the map can be zoomed by touch-dragging with two fingers. If
  	// passed `'center'`, it will zoom to the center of the view regardless of
  	// where the touch events (fingers) were. Enabled for touch-capable web
  	// browsers except for old Androids.
  	touchZoom: touch && !android23,

  	// @option bounceAtZoomLimits: Boolean = true
  	// Set it to false if you don't want the map to zoom beyond min/max zoom
  	// and then bounce back when pinch-zooming.
  	bounceAtZoomLimits: true
  });

  var TouchZoom = Handler.extend({
  	addHooks: function () {
  		addClass(this._map._container, 'leaflet-touch-zoom');
  		on(this._map._container, 'touchstart', this._onTouchStart, this);
  	},

  	removeHooks: function () {
  		removeClass(this._map._container, 'leaflet-touch-zoom');
  		off(this._map._container, 'touchstart', this._onTouchStart, this);
  	},

  	_onTouchStart: function (e) {
  		var map = this._map;
  		if (!e.touches || e.touches.length !== 2 || map._animatingZoom || this._zooming) { return; }

  		var p1 = map.mouseEventToContainerPoint(e.touches[0]),
  		    p2 = map.mouseEventToContainerPoint(e.touches[1]);

  		this._centerPoint = map.getSize()._divideBy(2);
  		this._startLatLng = map.containerPointToLatLng(this._centerPoint);
  		if (map.options.touchZoom !== 'center') {
  			this._pinchStartLatLng = map.containerPointToLatLng(p1.add(p2)._divideBy(2));
  		}

  		this._startDist = p1.distanceTo(p2);
  		this._startZoom = map.getZoom();

  		this._moved = false;
  		this._zooming = true;

  		map._stop();

  		on(document, 'touchmove', this._onTouchMove, this);
  		on(document, 'touchend', this._onTouchEnd, this);

  		preventDefault(e);
  	},

  	_onTouchMove: function (e) {
  		if (!e.touches || e.touches.length !== 2 || !this._zooming) { return; }

  		var map = this._map,
  		    p1 = map.mouseEventToContainerPoint(e.touches[0]),
  		    p2 = map.mouseEventToContainerPoint(e.touches[1]),
  		    scale = p1.distanceTo(p2) / this._startDist;

  		this._zoom = map.getScaleZoom(scale, this._startZoom);

  		if (!map.options.bounceAtZoomLimits && (
  			(this._zoom < map.getMinZoom() && scale < 1) ||
  			(this._zoom > map.getMaxZoom() && scale > 1))) {
  			this._zoom = map._limitZoom(this._zoom);
  		}

  		if (map.options.touchZoom === 'center') {
  			this._center = this._startLatLng;
  			if (scale === 1) { return; }
  		} else {
  			// Get delta from pinch to center, so centerLatLng is delta applied to initial pinchLatLng
  			var delta = p1._add(p2)._divideBy(2)._subtract(this._centerPoint);
  			if (scale === 1 && delta.x === 0 && delta.y === 0) { return; }
  			this._center = map.unproject(map.project(this._pinchStartLatLng, this._zoom).subtract(delta), this._zoom);
  		}

  		if (!this._moved) {
  			map._moveStart(true, false);
  			this._moved = true;
  		}

  		cancelAnimFrame(this._animRequest);

  		var moveFn = bind(map._move, map, this._center, this._zoom, {pinch: true, round: false});
  		this._animRequest = requestAnimFrame(moveFn, this, true);

  		preventDefault(e);
  	},

  	_onTouchEnd: function () {
  		if (!this._moved || !this._zooming) {
  			this._zooming = false;
  			return;
  		}

  		this._zooming = false;
  		cancelAnimFrame(this._animRequest);

  		off(document, 'touchmove', this._onTouchMove);
  		off(document, 'touchend', this._onTouchEnd);

  		// Pinch updates GridLayers' levels only when zoomSnap is off, so zoomSnap becomes noUpdate.
  		if (this._map.options.zoomAnimation) {
  			this._map._animateZoom(this._center, this._map._limitZoom(this._zoom), true, this._map.options.zoomSnap);
  		} else {
  			this._map._resetView(this._center, this._map._limitZoom(this._zoom));
  		}
  	}
  });

  // @section Handlers
  // @property touchZoom: Handler
  // Touch zoom handler.
  Map.addInitHook('addHandler', 'touchZoom', TouchZoom);

  Map.BoxZoom = BoxZoom;
  Map.DoubleClickZoom = DoubleClickZoom;
  Map.Drag = Drag;
  Map.Keyboard = Keyboard;
  Map.ScrollWheelZoom = ScrollWheelZoom;
  Map.Tap = Tap;
  Map.TouchZoom = TouchZoom;

  Object.freeze = freeze;

  exports.version = version;
  exports.Control = Control;
  exports.control = control;
  exports.Browser = Browser;
  exports.Evented = Evented;
  exports.Mixin = Mixin;
  exports.Util = Util;
  exports.Class = Class;
  exports.Handler = Handler;
  exports.extend = extend;
  exports.bind = bind;
  exports.stamp = stamp;
  exports.setOptions = setOptions;
  exports.DomEvent = DomEvent;
  exports.DomUtil = DomUtil;
  exports.PosAnimation = PosAnimation;
  exports.Draggable = Draggable;
  exports.LineUtil = LineUtil;
  exports.PolyUtil = PolyUtil;
  exports.Point = Point;
  exports.point = toPoint;
  exports.Bounds = Bounds;
  exports.bounds = toBounds;
  exports.Transformation = Transformation;
  exports.transformation = toTransformation;
  exports.Projection = index;
  exports.LatLng = LatLng;
  exports.latLng = toLatLng;
  exports.LatLngBounds = LatLngBounds;
  exports.latLngBounds = toLatLngBounds;
  exports.CRS = CRS;
  exports.GeoJSON = GeoJSON;
  exports.geoJSON = geoJSON;
  exports.geoJson = geoJson;
  exports.Layer = Layer;
  exports.LayerGroup = LayerGroup;
  exports.layerGroup = layerGroup;
  exports.FeatureGroup = FeatureGroup;
  exports.featureGroup = featureGroup;
  exports.ImageOverlay = ImageOverlay;
  exports.imageOverlay = imageOverlay;
  exports.VideoOverlay = VideoOverlay;
  exports.videoOverlay = videoOverlay;
  exports.SVGOverlay = SVGOverlay;
  exports.svgOverlay = svgOverlay;
  exports.DivOverlay = DivOverlay;
  exports.Popup = Popup;
  exports.popup = popup;
  exports.Tooltip = Tooltip;
  exports.tooltip = tooltip;
  exports.Icon = Icon;
  exports.icon = icon;
  exports.DivIcon = DivIcon;
  exports.divIcon = divIcon;
  exports.Marker = Marker;
  exports.marker = marker;
  exports.TileLayer = TileLayer;
  exports.tileLayer = tileLayer;
  exports.GridLayer = GridLayer;
  exports.gridLayer = gridLayer;
  exports.SVG = SVG;
  exports.svg = svg$1;
  exports.Renderer = Renderer;
  exports.Canvas = Canvas;
  exports.canvas = canvas$1;
  exports.Path = Path;
  exports.CircleMarker = CircleMarker;
  exports.circleMarker = circleMarker;
  exports.Circle = Circle;
  exports.circle = circle;
  exports.Polyline = Polyline;
  exports.polyline = polyline;
  exports.Polygon = Polygon;
  exports.polygon = polygon;
  exports.Rectangle = Rectangle;
  exports.rectangle = rectangle;
  exports.Map = Map;
  exports.map = createMap;

  var oldL = window.L;
  exports.noConflict = function() {
  	window.L = oldL;
  	return this;
  };

  // Always export us to window global (see #2364)
  window.L = exports;

  })));

  });

  /* src/Leaflet.html generated by Svelte v3.24.1 */

  function create_fragment$7(ctx) {
  	var div;

  	return {
  		c: function c() {
  			div = element("div");
  			attr(div, "class", "map-container svelte-3nvfxm");
  		},
  		m: function m(target, anchor) {
  			insert(target, div, anchor);
  			/*div_binding*/ ctx[15](div);
  		},
  		p: noop$1,
  		i: noop$1,
  		o: noop$1,
  		d: function d(detaching) {
  			if (detaching) { detach(div); }
  			/*div_binding*/ ctx[15](null);
  		}
  	};
  }

  function instance$7($$self, $$props, $$invalidate) {
  	var OpenStreetMap = "OpenStreetMap";
  	var StamenToner = "StamenToner";
  	var NationalMap = "NationalMap";
  	var L = leafletSrc;
  	var mapType = $$props.mapType; if ( mapType === void 0 ) mapType = OpenStreetMap;
  	var map = $$props.map;
  	var mapElement;
  	var markers = [];

  	function openStreetMapSetup(map) {
  		L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  			attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors"
  		}).addTo(map);
  	}

  	function stamenTonerSetup(map) {
  		var attribution = "Map tiles by <a href=\"http://stamen.com\">Stamen Design</a>, " + "under <a href=\"http://creativecommons.org/licenses/by/3.0\">CC BY 3.0</a>. " + "Data by <a href=\"http://openstreetmap.org\">OpenStreetMap</a>, " + "under <a href=\"http://www.openstreetmap.org/copyright\">ODbL</a>.";
  		var tnmBasemapViewer = L.tileLayer("http://tile.stamen.com/toner/{z}/{x}/{y}.png", { attribution: attribution }).addTo(map);
  	}

  	function nationalMapSetup(map) {
  		// Define the TNM Layers
  		var attribution = "<a href=\"https://www.doi.gov\">U.S. Department of the Interior</a>" + "| <a href=\"https://www.usgs.gov\">U.S. Geological Survey</a>" + "| <a href=\"https://www.usgs.gov/laws/policies_notices.html\">Policies</a>";

  		var tnmBasemapViewer = L.tileLayer("https://basemap.nationalmap.gov/ArcGIS/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}", { maxZoom: 14, attribution: attribution });
  		var tnmBasemapNavigator = L.tileLayer("https://navigator.er.usgs.gov/tiles/tcr.cgi/{z}/{x}/{y}.png", { maxZoom: 20, attribution: attribution });

  		// Add overlays
  		var highways = L.tileLayer.wms("https://services.nationalmap.gov/ArcGIS/services/transportation/MapServer/WMSServer?", {
  			layers: "6",
  			format: "image/png",
  			transparent: true
  		});

  		// Add baselayers and overlays to groups
  		var baseLayers = {
  			"The National Map (Viewer)": tnmBasemapViewer,
  			"The National Map (Navigator)": tnmBasemapNavigator
  		};

  		var overlays = { "Highways": highways };
  		var controlLayers = L.control.layers(baseLayers, overlays);

  		// Add the main baselayer to the map as a default (so it loads when the map
  		// is loaded
  		tnmBasemapViewer.addTo(map);

  		// Add the layer selector control to the map
  		controlLayers.addTo(map);
  	} // end [nationalMapSetup]

  	function getMap() {
  		return map;
  	}

  	function leaflet() {
  		return L;
  	}

  	function icon(opts) {
  		return L.icon(opts);
  	}

  	function divIcon(opts) {
  		return L.divIcon(opts);
  	}

  	function getBounds() {
  		return map.getBounds();
  	}

  	function fitBounds(bounds, opts) {
  		return map.fitBounds(bounds, opts);
  	}

  	function zoomToLocation(latlng, zoom) {
  		if ( zoom === void 0 ) zoom = 14;

  		map.setView(latlng, zoom);
  	}

  	function addMarker(latlng, opts) {
  		var marker = L.marker(latlng, opts).addTo(map);
  		markers.push(marker);
  	}

  	function clearMarkers() {
  		markers.forEach(function (m) { return map.removeLayer(m); });
  	}

  	onMount(function () {
  		$$invalidate(1, map = L.map(mapElement).setView([35.513151077520035, -96.416015625], 3));

  		switch (mapType) {
  			case OpenStreetMap:
  				openStreetMapSetup(map);
  				break;
  			case StamenToner:
  				stamenTonerSetup(map);
  				break;
  			case NationalMap:
  				nationalMapSetup(map);
  				break;
  			default:
  				throw "[Leaflet.onMount] Unknown map type";
  		}
  	});

  	function div_binding($$value) {
  		binding_callbacks[$$value ? "unshift" : "push"](function () {
  			mapElement = $$value;
  			$$invalidate(0, mapElement);
  		});
  	}

  	$$self.$$set = function ($$props) {
  		if ("mapType" in $$props) { $$invalidate(5, mapType = $$props.mapType); }
  		if ("map" in $$props) { $$invalidate(1, map = $$props.map); }
  	};

  	return [
  		mapElement,
  		map,
  		OpenStreetMap,
  		StamenToner,
  		NationalMap,
  		mapType,
  		getMap,
  		leaflet,
  		icon,
  		divIcon,
  		getBounds,
  		fitBounds,
  		zoomToLocation,
  		addMarker,
  		clearMarkers,
  		div_binding
  	];
  }

  var Leaflet_1 = /*@__PURE__*/(function (SvelteComponent) {
  	function Leaflet_1(options) {
  		SvelteComponent.call(this);

  		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
  			OpenStreetMap: 2,
  			StamenToner: 3,
  			NationalMap: 4,
  			mapType: 5,
  			map: 1,
  			getMap: 6,
  			leaflet: 7,
  			icon: 8,
  			divIcon: 9,
  			getBounds: 10,
  			fitBounds: 11,
  			zoomToLocation: 12,
  			addMarker: 13,
  			clearMarkers: 14
  		});
  	}

  	if ( SvelteComponent ) Leaflet_1.__proto__ = SvelteComponent;
  	Leaflet_1.prototype = Object.create( SvelteComponent && SvelteComponent.prototype );
  	Leaflet_1.prototype.constructor = Leaflet_1;

  	var prototypeAccessors = { OpenStreetMap: { configurable: true },StamenToner: { configurable: true },NationalMap: { configurable: true },getMap: { configurable: true },leaflet: { configurable: true },icon: { configurable: true },divIcon: { configurable: true },getBounds: { configurable: true },fitBounds: { configurable: true },zoomToLocation: { configurable: true },addMarker: { configurable: true },clearMarkers: { configurable: true } };

  	prototypeAccessors.OpenStreetMap.get = function () {
  		return this.$$.ctx[2];
  	};

  	prototypeAccessors.StamenToner.get = function () {
  		return this.$$.ctx[3];
  	};

  	prototypeAccessors.NationalMap.get = function () {
  		return this.$$.ctx[4];
  	};

  	prototypeAccessors.getMap.get = function () {
  		return this.$$.ctx[6];
  	};

  	prototypeAccessors.leaflet.get = function () {
  		return this.$$.ctx[7];
  	};

  	prototypeAccessors.icon.get = function () {
  		return this.$$.ctx[8];
  	};

  	prototypeAccessors.divIcon.get = function () {
  		return this.$$.ctx[9];
  	};

  	prototypeAccessors.getBounds.get = function () {
  		return this.$$.ctx[10];
  	};

  	prototypeAccessors.fitBounds.get = function () {
  		return this.$$.ctx[11];
  	};

  	prototypeAccessors.zoomToLocation.get = function () {
  		return this.$$.ctx[12];
  	};

  	prototypeAccessors.addMarker.get = function () {
  		return this.$$.ctx[13];
  	};

  	prototypeAccessors.clearMarkers.get = function () {
  		return this.$$.ctx[14];
  	};

  	Object.defineProperties( Leaflet_1.prototype, prototypeAccessors );

  	return Leaflet_1;
  }(SvelteComponent));

  /* src/MapListing.html generated by Svelte v3.24.1 */

  function create_fragment$8(ctx) {
  	var leaflet_1;
  	var updating_map;
  	var current;

  	function leaflet_1_map_binding(value) {
  		/*leaflet_1_map_binding*/ ctx[8].call(null, value);
  	}

  	var leaflet_1_props = { mapType: /*mapType*/ ctx[1] };

  	if (/*map*/ ctx[0] !== void 0) {
  		leaflet_1_props.map = /*map*/ ctx[0];
  	}

  	leaflet_1 = new Leaflet_1({ props: leaflet_1_props });
  	binding_callbacks.push(function () { return bind$1(leaflet_1, "map", leaflet_1_map_binding); });
  	/*leaflet_1_binding*/ ctx[9](leaflet_1);

  	return {
  		c: function c() {
  			create_component(leaflet_1.$$.fragment);
  		},
  		m: function m(target, anchor) {
  			mount_component(leaflet_1, target, anchor);
  			current = true;
  		},
  		p: function p(ctx, ref) {
  			var dirty = ref[0];

  			var leaflet_1_changes = {};
  			if (dirty & /*mapType*/ 2) { leaflet_1_changes.mapType = /*mapType*/ ctx[1]; }

  			if (!updating_map && dirty & /*map*/ 1) {
  				updating_map = true;
  				leaflet_1_changes.map = /*map*/ ctx[0];
  				add_flush_callback(function () { return updating_map = false; });
  			}

  			leaflet_1.$set(leaflet_1_changes);
  		},
  		i: function i(local) {
  			if (current) { return; }
  			transition_in(leaflet_1.$$.fragment, local);
  			current = true;
  		},
  		o: function o(local) {
  			transition_out(leaflet_1.$$.fragment, local);
  			current = false;
  		},
  		d: function d(detaching) {
  			/*leaflet_1_binding*/ ctx[9](null);
  			destroy_component(leaflet_1, detaching);
  		}
  	};
  }

  function instance$8($$self, $$props, $$invalidate) {
  	var locations = $$props.locations; if ( locations === void 0 ) locations = [];
  	var mapType = $$props.mapType; if ( mapType === void 0 ) mapType = "OpenStreetMap";
  	var fitBounds = $$props.fitBounds; if ( fitBounds === void 0 ) fitBounds = true;
  	var map = $$props.map;
  	var leaflet;
  	

  	function getMap() {
  		return leaflet.getMap();
  	}

  	function setLocations(locs) {
  		$$invalidate(3, locations = locs);
  	}

  	function addLocation(loc) {
  		var bounds = leaflet.getBounds();
  		var latlng = [loc.lat, loc.lng];
  		bounds.extend(latlng);
  		leaflet.addMarker(latlng);
  		if (fitBounds) { leaflet.fitBounds(bounds); }
  	}

  	function leaflet_1_map_binding(value) {
  		map = value;
  		$$invalidate(0, map);
  	}

  	function leaflet_1_binding($$value) {
  		binding_callbacks[$$value ? "unshift" : "push"](function () {
  			leaflet = $$value;
  			$$invalidate(2, leaflet);
  		});
  	}

  	$$self.$$set = function ($$props) {
  		if ("locations" in $$props) { $$invalidate(3, locations = $$props.locations); }
  		if ("mapType" in $$props) { $$invalidate(1, mapType = $$props.mapType); }
  		if ("fitBounds" in $$props) { $$invalidate(4, fitBounds = $$props.fitBounds); }
  		if ("map" in $$props) { $$invalidate(0, map = $$props.map); }
  	};

  	$$self.$$.update = function () {
  		if ($$self.$$.dirty & /*leaflet, locations, fitBounds*/ 28) {
  			 {
  				if (leaflet) {
  					leaflet.clearMarkers();

  					var bounds = locations.map(function (loc) {
  						var latlng = [loc.lat, loc.lng];
  						leaflet.addMarker(latlng, loc.marker);
  						return latlng;
  					});

  					if (bounds.length && fitBounds) { leaflet.fitBounds(bounds, { padding: [50, 50] }); }
  				}
  			}
  		}
  	};

  	return [
  		map,
  		mapType,
  		leaflet,
  		locations,
  		fitBounds,
  		getMap,
  		setLocations,
  		addLocation,
  		leaflet_1_map_binding,
  		leaflet_1_binding
  	];
  }

  var MapListing = /*@__PURE__*/(function (SvelteComponent) {
  	function MapListing(options) {
  		SvelteComponent.call(this);

  		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
  			locations: 3,
  			mapType: 1,
  			fitBounds: 4,
  			map: 0,
  			getMap: 5,
  			setLocations: 6,
  			addLocation: 7
  		});
  	}

  	if ( SvelteComponent ) MapListing.__proto__ = SvelteComponent;
  	MapListing.prototype = Object.create( SvelteComponent && SvelteComponent.prototype );
  	MapListing.prototype.constructor = MapListing;

  	var prototypeAccessors = { getMap: { configurable: true },setLocations: { configurable: true },addLocation: { configurable: true } };

  	prototypeAccessors.getMap.get = function () {
  		return this.$$.ctx[5];
  	};

  	prototypeAccessors.setLocations.get = function () {
  		return this.$$.ctx[6];
  	};

  	prototypeAccessors.addLocation.get = function () {
  		return this.$$.ctx[7];
  	};

  	Object.defineProperties( MapListing.prototype, prototypeAccessors );

  	return MapListing;
  }(SvelteComponent));

  /* src/MapSearch.html generated by Svelte v3.24.1 */

  function create_if_block$7(ctx) {
  	var maplisting;
  	var updating_map;
  	var current;

  	function maplisting_map_binding(value) {
  		/*maplisting_map_binding*/ ctx[13].call(null, value);
  	}

  	var maplisting_props = {
  		fitBounds: /*fitBounds*/ ctx[4],
  		mapType: /*mapType*/ ctx[3],
  		locations: [/*selectedLocation*/ ctx[0] ].concat( ctx[1])
  	};

  	if (/*map*/ ctx[2] !== void 0) {
  		maplisting_props.map = /*map*/ ctx[2];
  	}

  	maplisting = new MapListing({ props: maplisting_props });
  	/*maplisting_binding*/ ctx[12](maplisting);
  	binding_callbacks.push(function () { return bind$1(maplisting, "map", maplisting_map_binding); });

  	return {
  		c: function c() {
  			create_component(maplisting.$$.fragment);
  		},
  		m: function m(target, anchor) {
  			mount_component(maplisting, target, anchor);
  			current = true;
  		},
  		p: function p(ctx, dirty) {
  			var maplisting_changes = {};
  			if (dirty & /*fitBounds*/ 16) { maplisting_changes.fitBounds = /*fitBounds*/ ctx[4]; }
  			if (dirty & /*mapType*/ 8) { maplisting_changes.mapType = /*mapType*/ ctx[3]; }
  			if (dirty & /*selectedLocation, locations*/ 3) { maplisting_changes.locations = [/*selectedLocation*/ ctx[0] ].concat( ctx[1]); }

  			if (!updating_map && dirty & /*map*/ 4) {
  				updating_map = true;
  				maplisting_changes.map = /*map*/ ctx[2];
  				add_flush_callback(function () { return updating_map = false; });
  			}

  			maplisting.$set(maplisting_changes);
  		},
  		i: function i(local) {
  			if (current) { return; }
  			transition_in(maplisting.$$.fragment, local);
  			current = true;
  		},
  		o: function o(local) {
  			transition_out(maplisting.$$.fragment, local);
  			current = false;
  		},
  		d: function d(detaching) {
  			/*maplisting_binding*/ ctx[12](null);
  			destroy_component(maplisting, detaching);
  		}
  	};
  }

  function create_fragment$9(ctx) {
  	var nominatimsearch;
  	var t;
  	var if_block_anchor;
  	var current;
  	nominatimsearch = new NominatimSearch({});
  	nominatimsearch.$on("selected", /*mapSelected*/ ctx[6]);
  	nominatimsearch.$on("selected", /*selected_handler*/ ctx[10]);
  	nominatimsearch.$on("change", /*change_handler*/ ctx[11]);
  	var if_block = /*selectedLocation*/ ctx[0] && create_if_block$7(ctx);

  	return {
  		c: function c() {
  			create_component(nominatimsearch.$$.fragment);
  			t = space();
  			if (if_block) { if_block.c(); }
  			if_block_anchor = empty();
  		},
  		m: function m(target, anchor) {
  			mount_component(nominatimsearch, target, anchor);
  			insert(target, t, anchor);
  			if (if_block) { if_block.m(target, anchor); }
  			insert(target, if_block_anchor, anchor);
  			current = true;
  		},
  		p: function p(ctx, ref) {
  			var dirty = ref[0];

  			if (/*selectedLocation*/ ctx[0]) {
  				if (if_block) {
  					if_block.p(ctx, dirty);

  					if (dirty & /*selectedLocation*/ 1) {
  						transition_in(if_block, 1);
  					}
  				} else {
  					if_block = create_if_block$7(ctx);
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
  			transition_in(nominatimsearch.$$.fragment, local);
  			transition_in(if_block);
  			current = true;
  		},
  		o: function o(local) {
  			transition_out(nominatimsearch.$$.fragment, local);
  			transition_out(if_block);
  			current = false;
  		},
  		d: function d(detaching) {
  			destroy_component(nominatimsearch, detaching);
  			if (detaching) { detach(t); }
  			if (if_block) { if_block.d(detaching); }
  			if (detaching) { detach(if_block_anchor); }
  		}
  	};
  }

  function instance$9($$self, $$props, $$invalidate) {
  	var mapType = $$props.mapType; if ( mapType === void 0 ) mapType = "OpenStreetMap";
  	var selectedLocation = $$props.selectedLocation;
  	var locations = $$props.locations; if ( locations === void 0 ) locations = [];
  	var marker = $$props.marker;
  	var fitBounds = $$props.fitBounds; if ( fitBounds === void 0 ) fitBounds = true;
  	var map = $$props.map;
  	var mapListing;

  	function mapSelected(evt) {
  		var ref = evt.detail;
  		var lat = ref.lat;
  		var lon = ref.lon;
  		$$invalidate(0, selectedLocation = { lat: lat, lng: lon, marker: marker });
  	}

  	function getMap() {
  		return mapListing.getMap();
  	}

  	function setLocations(locs) {
  		$$invalidate(1, locations = locs);
  	}

  	function selected_handler(event) {
  		bubble($$self, event);
  	}

  	function change_handler(event) {
  		bubble($$self, event);
  	}

  	function maplisting_binding($$value) {
  		binding_callbacks[$$value ? "unshift" : "push"](function () {
  			mapListing = $$value;
  			$$invalidate(5, mapListing);
  		});
  	}

  	function maplisting_map_binding(value) {
  		map = value;
  		$$invalidate(2, map);
  	}

  	$$self.$$set = function ($$props) {
  		if ("mapType" in $$props) { $$invalidate(3, mapType = $$props.mapType); }
  		if ("selectedLocation" in $$props) { $$invalidate(0, selectedLocation = $$props.selectedLocation); }
  		if ("locations" in $$props) { $$invalidate(1, locations = $$props.locations); }
  		if ("marker" in $$props) { $$invalidate(7, marker = $$props.marker); }
  		if ("fitBounds" in $$props) { $$invalidate(4, fitBounds = $$props.fitBounds); }
  		if ("map" in $$props) { $$invalidate(2, map = $$props.map); }
  	};

  	return [
  		selectedLocation,
  		locations,
  		map,
  		mapType,
  		fitBounds,
  		mapListing,
  		mapSelected,
  		marker,
  		getMap,
  		setLocations,
  		selected_handler,
  		change_handler,
  		maplisting_binding,
  		maplisting_map_binding
  	];
  }

  var MapSearch = /*@__PURE__*/(function (SvelteComponent) {
  	function MapSearch(options) {
  		SvelteComponent.call(this);

  		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
  			mapType: 3,
  			selectedLocation: 0,
  			locations: 1,
  			marker: 7,
  			fitBounds: 4,
  			map: 2,
  			getMap: 8,
  			setLocations: 9
  		});
  	}

  	if ( SvelteComponent ) MapSearch.__proto__ = SvelteComponent;
  	MapSearch.prototype = Object.create( SvelteComponent && SvelteComponent.prototype );
  	MapSearch.prototype.constructor = MapSearch;

  	var prototypeAccessors = { getMap: { configurable: true },setLocations: { configurable: true } };

  	prototypeAccessors.getMap.get = function () {
  		return this.$$.ctx[8];
  	};

  	prototypeAccessors.setLocations.get = function () {
  		return this.$$.ctx[9];
  	};

  	Object.defineProperties( MapSearch.prototype, prototypeAccessors );

  	return MapSearch;
  }(SvelteComponent));

  /* src/LocationCreate.html generated by Svelte v3.24.1 */

  function create_else_block$4(ctx) {
  	var await_block_anchor;
  	var promise;

  	var info = {
  		ctx: ctx,
  		current: null,
  		token: null,
  		pending: create_pending_block$6,
  		then: create_then_block$6,
  		catch: create_catch_block$6,
  		value: 6,
  		error: 7
  	};

  	handle_promise(promise = /*result*/ ctx[2], info);

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

  			if (dirty & /*result*/ 4 && promise !== (promise = /*result*/ ctx[2]) && handle_promise(promise, info)) ; else {
  				var child_ctx = ctx.slice();
  				child_ctx[6] = info.resolved;
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

  // (76:0) {#if !submitted}
  function create_if_block$8(ctx) {
  	var mapsearch;
  	var t0;
  	var button;
  	var t1;
  	var button_disabled_value;
  	var current;
  	var mounted;
  	var dispose;
  	mapsearch = new MapSearch({});
  	mapsearch.$on("selected", /*mapSelected*/ ctx[3]);
  	mapsearch.$on("change", /*reset*/ ctx[5]);

  	return {
  		c: function c() {
  			create_component(mapsearch.$$.fragment);
  			t0 = space();
  			button = element("button");
  			t1 = text("Add Location");
  			button.disabled = button_disabled_value = !/*selectedLocation*/ ctx[1];
  		},
  		m: function m(target, anchor) {
  			mount_component(mapsearch, target, anchor);
  			insert(target, t0, anchor);
  			insert(target, button, anchor);
  			append(button, t1);
  			current = true;

  			if (!mounted) {
  				dispose = listen(button, "click", /*submitLocation*/ ctx[4]);
  				mounted = true;
  			}
  		},
  		p: function p(ctx, dirty) {
  			if (!current || dirty & /*selectedLocation*/ 2 && button_disabled_value !== (button_disabled_value = !/*selectedLocation*/ ctx[1])) {
  				button.disabled = button_disabled_value;
  			}
  		},
  		i: function i(local) {
  			if (current) { return; }
  			transition_in(mapsearch.$$.fragment, local);
  			current = true;
  		},
  		o: function o(local) {
  			transition_out(mapsearch.$$.fragment, local);
  			current = false;
  		},
  		d: function d(detaching) {
  			destroy_component(mapsearch, detaching);
  			if (detaching) { detach(t0); }
  			if (detaching) { detach(button); }
  			mounted = false;
  			dispose();
  		}
  	};
  }

  // (85:0) {:catch err}
  function create_catch_block$6(ctx) {
  	var p;
  	var t0;
  	var t1_value = /*err*/ ctx[7].message + "";
  	var t1;

  	return {
  		c: function c() {
  			p = element("p");
  			t0 = text("An error occured: ");
  			t1 = text(t1_value);
  		},
  		m: function m(target, anchor) {
  			insert(target, p, anchor);
  			append(p, t0);
  			append(p, t1);
  		},
  		p: function p(ctx, dirty) {
  			if (dirty & /*result*/ 4 && t1_value !== (t1_value = /*err*/ ctx[7].message + "")) { set_data(t1, t1_value); }
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(p); }
  		}
  	};
  }

  // (82:0) {:then res}
  function create_then_block$6(ctx) {
  	var p;
  	var t1;
  	var button;
  	var mounted;
  	var dispose;

  	return {
  		c: function c() {
  			p = element("p");
  			p.textContent = "The location has been added!";
  			t1 = space();
  			button = element("button");
  			button.textContent = "Add Another Location";
  		},
  		m: function m(target, anchor) {
  			insert(target, p, anchor);
  			insert(target, t1, anchor);
  			insert(target, button, anchor);

  			if (!mounted) {
  				dispose = listen(button, "click", /*reset*/ ctx[5]);
  				mounted = true;
  			}
  		},
  		p: noop$1,
  		d: function d(detaching) {
  			if (detaching) { detach(p); }
  			if (detaching) { detach(t1); }
  			if (detaching) { detach(button); }
  			mounted = false;
  			dispose();
  		}
  	};
  }

  // (80:15)  <p>Submitting request..</p> {:then res}
  function create_pending_block$6(ctx) {
  	var p;

  	return {
  		c: function c() {
  			p = element("p");
  			p.textContent = "Submitting request..";
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

  function create_fragment$a(ctx) {
  	var current_block_type_index;
  	var if_block;
  	var if_block_anchor;
  	var current;
  	var if_block_creators = [create_if_block$8, create_else_block$4];
  	var if_blocks = [];

  	function select_block_type(ctx, dirty) {
  		if (!/*submitted*/ ctx[0]) { return 0; }
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
  		p: function p(ctx, ref) {
  			var dirty = ref[0];

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

  function instance$a($$self, $$props, $$invalidate) {
  	var submitted = false;
  	var selectedLocation;
  	var result;

  	function mapSelected(evt) {
  		$$invalidate(1, selectedLocation = evt.detail);
  	}

  	function submitLocation() {
  		var loc = selectedLocation;
  		var lat = parseFloat(loc.lat);
  		var lng = parseFloat(loc.lon);

  		var name = loc.namedetails && loc.namedetails.name
  		? loc.namedetails.name
  		: loc.display_name;

  		var address = loc.address && loc.address.house_number && loc.address.road
  		? ((loc.address.house_number) + " " + (loc.address.road))
  		: null;

  		var city = loc.address && loc.address.city
  		? loc.address.city
  		: null;

  		var region = loc.address && loc.address.state
  		? loc.address.state
  		: null;

  		var postal = loc.address && loc.address.postcode
  		? loc.address.postcode
  		: null;

  		var country = loc.address && loc.address.country
  		? loc.address.country
  		: null;

  		$$invalidate(2, result = fetch("http://localhost:8080/locations/create", {
  			method: "POST",
  			headers: { "Content-Type": "application/json" },
  			credentials: "same-origin",
  			body: JSON.stringify({
  				name: name,
  				address: address,
  				city: city,
  				region: region,
  				postal: postal,
  				country: country,
  				lat: lat,
  				lng: lng
  			})
  		}).then(function (res) { return res.json(); }));

  		$$invalidate(0, submitted = true);
  	}

  	function reset() {
  		$$invalidate(1, selectedLocation = null);
  		$$invalidate(2, result = null);
  		$$invalidate(0, submitted = false);
  	}

  	return [submitted, selectedLocation, result, mapSelected, submitLocation, reset];
  }

  var LocationCreate = /*@__PURE__*/(function (SvelteComponent) {
  	function LocationCreate(options) {
  		SvelteComponent.call(this);
  		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});
  	}

  	if ( SvelteComponent ) LocationCreate.__proto__ = SvelteComponent;
  	LocationCreate.prototype = Object.create( SvelteComponent && SvelteComponent.prototype );
  	LocationCreate.prototype.constructor = LocationCreate;

  	return LocationCreate;
  }(SvelteComponent));

  /* src/LocationByDistance.html generated by Svelte v3.24.1 */

  function create_if_block_1$4(ctx) {
  	var label;
  	var t0;
  	var input;
  	var t1;
  	var if_block_anchor;
  	var mounted;
  	var dispose;
  	var if_block = /*sliderDistance*/ ctx[3] && create_if_block_2$2(ctx);

  	return {
  		c: function c() {
  			label = element("label");
  			t0 = text("Distance: \n    ");
  			input = element("input");
  			t1 = space();
  			if (if_block) { if_block.c(); }
  			if_block_anchor = empty();
  			attr(input, "type", "range");
  			attr(input, "min", "0.1");
  			attr(input, "max", "10");
  			attr(input, "step", "0.001");
  		},
  		m: function m(target, anchor) {
  			insert(target, label, anchor);
  			append(label, t0);
  			append(label, input);
  			set_input_value(input, /*sliderDistance*/ ctx[3]);
  			insert(target, t1, anchor);
  			if (if_block) { if_block.m(target, anchor); }
  			insert(target, if_block_anchor, anchor);

  			if (!mounted) {
  				dispose = [
  					listen(input, "change", /*input_change_input_handler*/ ctx[12]),
  					listen(input, "input", /*input_change_input_handler*/ ctx[12]),
  					listen(input, "change", /*setDistance*/ ctx[9])
  				];

  				mounted = true;
  			}
  		},
  		p: function p(ctx, dirty) {
  			if (dirty & /*sliderDistance*/ 8) {
  				set_input_value(input, /*sliderDistance*/ ctx[3]);
  			}

  			if (/*sliderDistance*/ ctx[3]) {
  				if (if_block) {
  					if_block.p(ctx, dirty);
  				} else {
  					if_block = create_if_block_2$2(ctx);
  					if_block.c();
  					if_block.m(if_block_anchor.parentNode, if_block_anchor);
  				}
  			} else if (if_block) {
  				if_block.d(1);
  				if_block = null;
  			}
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(label); }
  			if (detaching) { detach(t1); }
  			if (if_block) { if_block.d(detaching); }
  			if (detaching) { detach(if_block_anchor); }
  			mounted = false;
  			run_all(dispose);
  		}
  	};
  }

  // (87:0) {#if sliderDistance}
  function create_if_block_2$2(ctx) {
  	var t0;
  	var t1;

  	return {
  		c: function c() {
  			t0 = text(/*sliderDistance*/ ctx[3]);
  			t1 = text(" km");
  		},
  		m: function m(target, anchor) {
  			insert(target, t0, anchor);
  			insert(target, t1, anchor);
  		},
  		p: function p(ctx, dirty) {
  			if (dirty & /*sliderDistance*/ 8) { set_data(t0, /*sliderDistance*/ ctx[3]); }
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(t0); }
  			if (detaching) { detach(t1); }
  		}
  	};
  }

  // (97:0) {:catch err}
  function create_catch_block$7(ctx) {
  	var p;
  	var t0;
  	var t1_value = /*err*/ ctx[16].message + "";
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
  			if (dirty & /*locationSearch*/ 16 && t1_value !== (t1_value = /*err*/ ctx[16].message + "")) { set_data(t1, t1_value); }
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(p); }
  		}
  	};
  }

  // (93:0) {:then locations}
  function create_then_block$7(ctx) {
  	var if_block_anchor;
  	var if_block = /*selectedLocation*/ ctx[5] && create_if_block$9(ctx);

  	return {
  		c: function c() {
  			if (if_block) { if_block.c(); }
  			if_block_anchor = empty();
  		},
  		m: function m(target, anchor) {
  			if (if_block) { if_block.m(target, anchor); }
  			insert(target, if_block_anchor, anchor);
  		},
  		p: function p(ctx, dirty) {
  			if (/*selectedLocation*/ ctx[5]) {
  				if (if_block) {
  					if_block.p(ctx, dirty);
  				} else {
  					if_block = create_if_block$9(ctx);
  					if_block.c();
  					if_block.m(if_block_anchor.parentNode, if_block_anchor);
  				}
  			} else if (if_block) {
  				if_block.d(1);
  				if_block = null;
  			}
  		},
  		d: function d(detaching) {
  			if (if_block) { if_block.d(detaching); }
  			if (detaching) { detach(if_block_anchor); }
  		}
  	};
  }

  // (94:0) {#if selectedLocation}
  function create_if_block$9(ctx) {
  	var p;
  	var t0;
  	var t1_value = /*selectedLocation*/ ctx[5].lat + "";
  	var t1;
  	var t2;
  	var t3_value = /*selectedLocation*/ ctx[5].lon + "";
  	var t3;
  	var t4;
  	var t5;
  	var t6;

  	return {
  		c: function c() {
  			p = element("p");
  			t0 = text("(");
  			t1 = text(t1_value);
  			t2 = text(",");
  			t3 = text(t3_value);
  			t4 = text(") ");
  			t5 = text(/*distance*/ ctx[2]);
  			t6 = text(" km");
  		},
  		m: function m(target, anchor) {
  			insert(target, p, anchor);
  			append(p, t0);
  			append(p, t1);
  			append(p, t2);
  			append(p, t3);
  			append(p, t4);
  			append(p, t5);
  			append(p, t6);
  		},
  		p: function p(ctx, dirty) {
  			if (dirty & /*selectedLocation*/ 32 && t1_value !== (t1_value = /*selectedLocation*/ ctx[5].lat + "")) { set_data(t1, t1_value); }
  			if (dirty & /*selectedLocation*/ 32 && t3_value !== (t3_value = /*selectedLocation*/ ctx[5].lon + "")) { set_data(t3, t3_value); }
  			if (dirty & /*distance*/ 4) { set_data(t5, /*distance*/ ctx[2]); }
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(p); }
  		}
  	};
  }

  // (91:23)  <p>...</p> {:then locations}
  function create_pending_block$7(ctx) {
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

  function create_fragment$b(ctx) {
  	var mapsearch;
  	var updating_map;
  	var t0;
  	var t1;
  	var await_block_anchor;
  	var promise;
  	var current;

  	function mapsearch_map_binding(value) {
  		/*mapsearch_map_binding*/ ctx[11].call(null, value);
  	}

  	var mapsearch_props = {
  		mapType: /*mapType*/ ctx[0],
  		marker: /*marker*/ ctx[1],
  		fitBounds: false
  	};

  	if (/*map*/ ctx[7] !== void 0) {
  		mapsearch_props.map = /*map*/ ctx[7];
  	}

  	mapsearch = new MapSearch({ props: mapsearch_props });
  	/*mapsearch_binding*/ ctx[10](mapsearch);
  	binding_callbacks.push(function () { return bind$1(mapsearch, "map", mapsearch_map_binding); });
  	mapsearch.$on("selected", /*mapSelected*/ ctx[8]);
  	var if_block = /*selectedLocation*/ ctx[5] && create_if_block_1$4(ctx);

  	var info = {
  		ctx: ctx,
  		current: null,
  		token: null,
  		pending: create_pending_block$7,
  		then: create_then_block$7,
  		catch: create_catch_block$7,
  		value: 15,
  		error: 16
  	};

  	handle_promise(promise = /*locationSearch*/ ctx[4], info);

  	return {
  		c: function c() {
  			create_component(mapsearch.$$.fragment);
  			t0 = space();
  			if (if_block) { if_block.c(); }
  			t1 = space();
  			await_block_anchor = empty();
  			info.block.c();
  		},
  		m: function m(target, anchor) {
  			mount_component(mapsearch, target, anchor);
  			insert(target, t0, anchor);
  			if (if_block) { if_block.m(target, anchor); }
  			insert(target, t1, anchor);
  			insert(target, await_block_anchor, anchor);
  			info.block.m(target, info.anchor = anchor);
  			info.mount = function () { return await_block_anchor.parentNode; };
  			info.anchor = await_block_anchor;
  			current = true;
  		},
  		p: function p(new_ctx, ref) {
  			var dirty = ref[0];

  			ctx = new_ctx;
  			var mapsearch_changes = {};
  			if (dirty & /*mapType*/ 1) { mapsearch_changes.mapType = /*mapType*/ ctx[0]; }
  			if (dirty & /*marker*/ 2) { mapsearch_changes.marker = /*marker*/ ctx[1]; }

  			if (!updating_map && dirty & /*map*/ 128) {
  				updating_map = true;
  				mapsearch_changes.map = /*map*/ ctx[7];
  				add_flush_callback(function () { return updating_map = false; });
  			}

  			mapsearch.$set(mapsearch_changes);

  			if (/*selectedLocation*/ ctx[5]) {
  				if (if_block) {
  					if_block.p(ctx, dirty);
  				} else {
  					if_block = create_if_block_1$4(ctx);
  					if_block.c();
  					if_block.m(t1.parentNode, t1);
  				}
  			} else if (if_block) {
  				if_block.d(1);
  				if_block = null;
  			}

  			info.ctx = ctx;

  			if (dirty & /*locationSearch*/ 16 && promise !== (promise = /*locationSearch*/ ctx[4]) && handle_promise(promise, info)) ; else {
  				var child_ctx = ctx.slice();
  				child_ctx[15] = info.resolved;
  				info.block.p(child_ctx, dirty);
  			}
  		},
  		i: function i(local) {
  			if (current) { return; }
  			transition_in(mapsearch.$$.fragment, local);
  			current = true;
  		},
  		o: function o(local) {
  			transition_out(mapsearch.$$.fragment, local);
  			current = false;
  		},
  		d: function d(detaching) {
  			/*mapsearch_binding*/ ctx[10](null);
  			destroy_component(mapsearch, detaching);
  			if (detaching) { detach(t0); }
  			if (if_block) { if_block.d(detaching); }
  			if (detaching) { detach(t1); }
  			if (detaching) { detach(await_block_anchor); }
  			info.block.d(detaching);
  			info.token = null;
  			info = null;
  		}
  	};
  }

  var api$1 = "http://localhost:8080";

  function instance$b($$self, $$props, $$invalidate) {
  	var mapType = $$props.mapType; if ( mapType === void 0 ) mapType = "OpenStreetMap";
  	var marker = $$props.marker;
  	var distance = 1; //km
  	var sliderDistance = 1;
  	var locationSearch = Promise.resolve([]);
  	var selectedLocation;
  	var mapSearch;
  	var map;
  	var circle;

  	function mapSelected(evt) {
  		$$invalidate(5, selectedLocation = evt.detail);
  	}

  	function setDistance(e) {

  		setTimeout(
  			function () {
  				$$invalidate(2, distance = sliderDistance);
  			},
  			250
  		);
  	}

  	function mapsearch_binding($$value) {
  		binding_callbacks[$$value ? "unshift" : "push"](function () {
  			mapSearch = $$value;
  			$$invalidate(6, mapSearch);
  		});
  	}

  	function mapsearch_map_binding(value) {
  		map = value;
  		$$invalidate(7, map);
  	}

  	function input_change_input_handler() {
  		sliderDistance = to_number(this.value);
  		$$invalidate(3, sliderDistance);
  	}

  	$$self.$$set = function ($$props) {
  		if ("mapType" in $$props) { $$invalidate(0, mapType = $$props.mapType); }
  		if ("marker" in $$props) { $$invalidate(1, marker = $$props.marker); }
  	};

  	$$self.$$.update = function () {
  		if ($$self.$$.dirty & /*map*/ 128) {
  			 if (map) {
  				// Disable various features
  				map.touchZoom.disable();

  				map.doubleClickZoom.disable();
  				map.scrollWheelZoom.disable();
  				map.boxZoom.disable();
  				map.keyboard.disable();
  				map.dragging.disable();
  				map.zoomControl.remove();
  			}
  		}

  		if ($$self.$$.dirty & /*selectedLocation, distance, mapSearch, map, circle*/ 8420) {
  			 if (selectedLocation) {
  				$$invalidate(4, locationSearch = fetch((api$1 + "/locations/by_distance/" + (selectedLocation.lat) + "/" + (selectedLocation.lon) + "/" + distance)).then(function (res) { return res.json(); }).then(function (locations) {
  					mapSearch.setLocations(locations.map(function (x) { return x[1]; }));
  				}));

  				if (map) {
  					if (circle) { circle.removeFrom(map); }

  					$$invalidate(13, circle = leafletSrc.circle([selectedLocation.lat, selectedLocation.lon], {
  						radius: distance * 1000,
  						color: "#55f",
  						weight: 1,
  						fillColor: "#55f",
  						fillOpacity: 0.3
  					}));

  					circle.addTo(map);
  					map.fitBounds(circle.getBounds());
  				}
  			}
  		}
  	};

  	return [
  		mapType,
  		marker,
  		distance,
  		sliderDistance,
  		locationSearch,
  		selectedLocation,
  		mapSearch,
  		map,
  		mapSelected,
  		setDistance,
  		mapsearch_binding,
  		mapsearch_map_binding,
  		input_change_input_handler
  	];
  }

  var LocationByDistance = /*@__PURE__*/(function (SvelteComponent) {
  	function LocationByDistance(options) {
  		SvelteComponent.call(this);
  		init(this, options, instance$b, create_fragment$b, safe_not_equal, { mapType: 0, marker: 1 });
  	}

  	if ( SvelteComponent ) LocationByDistance.__proto__ = SvelteComponent;
  	LocationByDistance.prototype = Object.create( SvelteComponent && SvelteComponent.prototype );
  	LocationByDistance.prototype.constructor = LocationByDistance;

  	return LocationByDistance;
  }(SvelteComponent));

  /* src/Stripe.html generated by Svelte v3.24.1 */

  function create_fragment$c(ctx) {
  	var script;
  	var script_src_value;
  	var mounted;
  	var dispose;

  	return {
  		c: function c() {
  			script = element("script");
  			if (script.src !== (script_src_value = "https://js.stripe.com/v3/")) { attr(script, "src", script_src_value); }
  		},
  		m: function m(target, anchor) {
  			append(document.head, script);

  			if (!mounted) {
  				dispose = listen(script, "load", /*stripeLoaded*/ ctx[0]);
  				mounted = true;
  			}
  		},
  		p: noop$1,
  		i: noop$1,
  		o: noop$1,
  		d: function d(detaching) {
  			detach(script);
  			mounted = false;
  			dispose();
  		}
  	};
  }

  function instance$c($$self, $$props, $$invalidate) {
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

  	$$self.$$set = function ($$props) {
  		if ("clientKey" in $$props) { $$invalidate(3, clientKey = $$props.clientKey); }
  		if ("stripe" in $$props) { $$invalidate(1, stripe = $$props.stripe); }
  		if ("elements" in $$props) { $$invalidate(2, elements = $$props.elements); }
  	};

  	return [stripeLoaded, stripe, elements, clientKey];
  }

  var Stripe_1 = /*@__PURE__*/(function (SvelteComponent) {
  	function Stripe_1(options) {
  		SvelteComponent.call(this);
  		init(this, options, instance$c, create_fragment$c, safe_not_equal, { clientKey: 3, stripe: 1, elements: 2 });
  	}

  	if ( SvelteComponent ) Stripe_1.__proto__ = SvelteComponent;
  	Stripe_1.prototype = Object.create( SvelteComponent && SvelteComponent.prototype );
  	Stripe_1.prototype.constructor = Stripe_1;

  	return Stripe_1;
  }(SvelteComponent));

  /* src/elements/Generic.html generated by Svelte v3.24.1 */

  function create_else_block$5(ctx) {
  	var div;

  	return {
  		c: function c() {
  			div = element("div");
  		},
  		m: function m(target, anchor) {
  			insert(target, div, anchor);
  			/*div_binding_1*/ ctx[8](div);
  		},
  		p: noop$1,
  		d: function d(detaching) {
  			if (detaching) { detach(div); }
  			/*div_binding_1*/ ctx[8](null);
  		}
  	};
  }

  // (27:0) {#if showLabel}
  function create_if_block$a(ctx) {
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
  			/*div_binding*/ ctx[7](div);
  		},
  		p: function p(ctx, dirty) {
  			if (dirty & /*label*/ 4) { set_data(t0, /*label*/ ctx[2]); }
  		},
  		d: function d(detaching) {
  			if (detaching) { detach(label_1); }
  			/*div_binding*/ ctx[7](null);
  		}
  	};
  }

  function create_fragment$d(ctx) {
  	var if_block_anchor;

  	function select_block_type(ctx, dirty) {
  		if (/*showLabel*/ ctx[1]) { return create_if_block$a; }
  		return create_else_block$5;
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

  function instance$d($$self, $$props, $$invalidate) {
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
  			domNode = $$value;
  			$$invalidate(0, domNode);
  		});
  	}

  	function div_binding_1($$value) {
  		binding_callbacks[$$value ? "unshift" : "push"](function () {
  			domNode = $$value;
  			$$invalidate(0, domNode);
  		});
  	}

  	$$self.$$set = function ($$props) {
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
  		div_binding,
  		div_binding_1
  	];
  }

  var Generic = /*@__PURE__*/(function (SvelteComponent) {
  	function Generic(options) {
  		SvelteComponent.call(this);

  		init(this, options, instance$d, create_fragment$d, safe_not_equal, {
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

  /* src/elements/Card.html generated by Svelte v3.24.1 */

  function create_fragment$e(ctx) {
  	var generic;
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

  	generic = new Generic({ props: generic_props });
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

  function instance$e($$self, $$props, $$invalidate) {
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

  	$$self.$$set = function ($$props) {
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
  		init(this, options, instance$e, create_fragment$e, safe_not_equal, { elements: 0, label: 1, options: 2 });
  	}

  	if ( SvelteComponent ) Card.__proto__ = SvelteComponent;
  	Card.prototype = Object.create( SvelteComponent && SvelteComponent.prototype );
  	Card.prototype.constructor = Card;

  	return Card;
  }(SvelteComponent));

  /* src/CreditCardForm.html generated by Svelte v3.24.1 */

  function create_if_block$b(ctx) {
  	var form;
  	var card;
  	var current;
  	card = new Card({ props: { elements: /*elements*/ ctx[1] } });

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

  function create_fragment$f(ctx) {
  	var stripe_1;
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

  	stripe_1 = new Stripe_1({ props: stripe_1_props });
  	binding_callbacks.push(function () { return bind$1(stripe_1, "stripe", stripe_1_stripe_binding); });
  	binding_callbacks.push(function () { return bind$1(stripe_1, "elements", stripe_1_elements_binding); });
  	var if_block = /*elements*/ ctx[1] && create_if_block$b(ctx);

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

  					if (dirty & /*elements*/ 2) {
  						transition_in(if_block, 1);
  					}
  				} else {
  					if_block = create_if_block$b(ctx);
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

  function instance$f($$self, $$props, $$invalidate) {
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

  	$$self.$$set = function ($$props) {
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
  		init(this, options, instance$f, create_fragment$f, safe_not_equal, { clientKey: 0 });
  	}

  	if ( SvelteComponent ) CreditCardForm.__proto__ = SvelteComponent;
  	CreditCardForm.prototype = Object.create( SvelteComponent && SvelteComponent.prototype );
  	CreditCardForm.prototype.constructor = CreditCardForm;

  	return CreditCardForm;
  }(SvelteComponent));

  var L$1 = leafletSrc;

  var main = {
      L: L$1,
      icon: function icon( opts ) {
          return L$1.icon( opts );
      },
      iconDefaultImagePath: function iconDefaultImagePath( str ) {
          return L$1.Icon.Default.prototype.options.imagePath = str;
      },
      mapSearch: function mapSearch( target, props ){ 
          return  new MapSearch({target: target,props: props}); 
      },
      mapListing: function mapListing( target, props ){ 
          return  new MapListing({target: target,props: props}); 
      },
      locationCreate: function locationCreate( target, props ){ 
          return  new LocationCreate({target: target,props: props}); 
      },
      locationByDistance: function locationByDistance( target, props ){ 
          return  new LocationByDistance({target: target,props: props}); 
      },
      gallery: function gallery( target, props ){ 
          return  new Gallery({target: target,props: props}); 
      },
      galleryCreate: function galleryCreate( target, props ){ 
          return  new GalleryCreate({target: target,props: props});
      },
      board: function board( target, props ){ 
          return  new Board({target: target,props: props});
      },
      postMarkdown: function postMarkdown( target, props ){ 
          return  new PostMarkdown({target: target,props: props}); 
      },
      creditCardForm: function creditCardForm( target, props ){ 
          return  new CreditCardForm({target: target,props: props}); 
      }
  };

  return main;

}());
