function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/**
  * basicweb_gallery_app_client
  * (C) 2020 M. Bellaire
  * All rights Reserved
 */
var basicweb_gallery_app_client = function () {
  'use strict';

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob: 'FileReader' in self && 'Blob' in self && function () {
      try {
        new Blob();
        return true;
      } catch (e) {
        return false;
      }
    }(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  };

  function isDataView(obj) {
    return obj && DataView.prototype.isPrototypeOf(obj);
  }

  if (support.arrayBuffer) {
    var viewClasses = ['[object Int8Array]', '[object Uint8Array]', '[object Uint8ClampedArray]', '[object Int16Array]', '[object Uint16Array]', '[object Int32Array]', '[object Uint32Array]', '[object Float32Array]', '[object Float64Array]'];

    var isArrayBufferView = ArrayBuffer.isView || function (obj) {
      return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1;
    };
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name);
    }

    if (/[^a-z0-9\-#$%&'*+.^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name');
    }

    return name.toLowerCase();
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value);
    }

    return value;
  } // Build a destructive iterator for the value list


  function iteratorFor(items) {
    var iterator = {
      next: function next() {
        var value = items.shift();
        return {
          done: value === undefined,
          value: value
        };
      }
    };

    if (support.iterable) {
      iterator[Symbol.iterator] = function () {
        return iterator;
      };
    }

    return iterator;
  }

  function Headers(headers) {
    this.map = {};

    if (headers instanceof Headers) {
      headers.forEach(function (value, name) {
        this.append(name, value);
      }, this);
    } else if (Array.isArray(headers)) {
      headers.forEach(function (header) {
        this.append(header[0], header[1]);
      }, this);
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function (name) {
        this.append(name, headers[name]);
      }, this);
    }
  }

  Headers.prototype.append = function (name, value) {
    name = normalizeName(name);
    value = normalizeValue(value);
    var oldValue = this.map[name];
    this.map[name] = oldValue ? oldValue + ', ' + value : value;
  };

  Headers.prototype['delete'] = function (name) {
    delete this.map[normalizeName(name)];
  };

  Headers.prototype.get = function (name) {
    name = normalizeName(name);
    return this.has(name) ? this.map[name] : null;
  };

  Headers.prototype.has = function (name) {
    return this.map.hasOwnProperty(normalizeName(name));
  };

  Headers.prototype.set = function (name, value) {
    this.map[normalizeName(name)] = normalizeValue(value);
  };

  Headers.prototype.forEach = function (callback, thisArg) {
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this);
      }
    }
  };

  Headers.prototype.keys = function () {
    var items = [];
    this.forEach(function (value, name) {
      items.push(name);
    });
    return iteratorFor(items);
  };

  Headers.prototype.values = function () {
    var items = [];
    this.forEach(function (value) {
      items.push(value);
    });
    return iteratorFor(items);
  };

  Headers.prototype.entries = function () {
    var items = [];
    this.forEach(function (value, name) {
      items.push([name, value]);
    });
    return iteratorFor(items);
  };

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'));
    }

    body.bodyUsed = true;
  }

  function fileReaderReady(reader) {
    return new Promise(function (resolve, reject) {
      reader.onload = function () {
        resolve(reader.result);
      };

      reader.onerror = function () {
        reject(reader.error);
      };
    });
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsArrayBuffer(blob);
    return promise;
  }

  function readBlobAsText(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsText(blob);
    return promise;
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf);
    var chars = new Array(view.length);

    for (var i = 0; i < view.length; i++) {
      chars[i] = String.fromCharCode(view[i]);
    }

    return chars.join('');
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0);
    } else {
      var view = new Uint8Array(buf.byteLength);
      view.set(new Uint8Array(buf));
      return view.buffer;
    }
  }

  function Body() {
    this.bodyUsed = false;

    this._initBody = function (body) {
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
        this._bodyArrayBuffer = bufferClone(body.buffer); // IE 10-11 can't handle a DataView body.

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
      this.blob = function () {
        var rejected = consumed(this);

        if (rejected) {
          return rejected;
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob);
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]));
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob');
        } else {
          return Promise.resolve(new Blob([this._bodyText]));
        }
      };

      this.arrayBuffer = function () {
        if (this._bodyArrayBuffer) {
          return consumed(this) || Promise.resolve(this._bodyArrayBuffer);
        } else {
          return this.blob().then(readBlobAsArrayBuffer);
        }
      };
    }

    this.text = function () {
      var rejected = consumed(this);

      if (rejected) {
        return rejected;
      }

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob);
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer));
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text');
      } else {
        return Promise.resolve(this._bodyText);
      }
    };

    if (support.formData) {
      this.formData = function () {
        return this.text().then(decode);
      };
    }

    this.json = function () {
      return this.text().then(JSON.parse);
    };

    return this;
  } // HTTP methods whose capitalization should be normalized


  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

  function normalizeMethod(method) {
    var upcased = method.toUpperCase();
    return methods.indexOf(upcased) > -1 ? upcased : method;
  }

  function Request(input, options) {
    options = options || {};
    var body = options.body;

    if (input instanceof Request) {
      if (input.bodyUsed) {
        throw new TypeError('Already read');
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
      throw new TypeError('Body not allowed for GET or HEAD requests');
    }

    this._initBody(body);
  }

  Request.prototype.clone = function () {
    return new Request(this, {
      body: this._bodyInit
    });
  };

  function decode(body) {
    var form = new FormData();
    body.trim().split('&').forEach(function (bytes) {
      if (bytes) {
        var split = bytes.split('=');
        var name = split.shift().replace(/\+/g, ' ');
        var value = split.join('=').replace(/\+/g, ' ');
        form.append(decodeURIComponent(name), decodeURIComponent(value));
      }
    });
    return form;
  }

  function parseHeaders(rawHeaders) {
    var headers = new Headers(); // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
    // https://tools.ietf.org/html/rfc7230#section-3.2

    var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
    preProcessedHeaders.split(/\r?\n/).forEach(function (line) {
      var parts = line.split(':');
      var key = parts.shift().trim();

      if (key) {
        var value = parts.join(':').trim();
        headers.append(key, value);
      }
    });
    return headers;
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

  Response.prototype.clone = function () {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    });
  };

  Response.error = function () {
    var response = new Response(null, {
      status: 0,
      statusText: ''
    });
    response.type = 'error';
    return response;
  };

  var redirectStatuses = [301, 302, 303, 307, 308];

  Response.redirect = function (url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code');
    }

    return new Response(null, {
      status: status,
      headers: {
        location: url
      }
    });
  };

  var DOMException = self.DOMException;

  try {
    new DOMException();
  } catch (err) {
    DOMException = function DOMException(message, name) {
      this.message = message;
      this.name = name;
      var error = Error(message);
      this.stack = error.stack;
    };

    DOMException.prototype = Object.create(Error.prototype);
    DOMException.prototype.constructor = DOMException;
  }

  function fetch$1(input, init) {
    return new Promise(function (resolve, reject) {
      var request = new Request(input, init);

      if (request.signal && request.signal.aborted) {
        return reject(new DOMException('Aborted', 'AbortError'));
      }

      var xhr = new XMLHttpRequest();

      function abortXhr() {
        xhr.abort();
      }

      xhr.onload = function () {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        };
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        resolve(new Response(body, options));
      };

      xhr.onerror = function () {
        reject(new TypeError('Network request failed'));
      };

      xhr.ontimeout = function () {
        reject(new TypeError('Network request failed'));
      };

      xhr.onabort = function () {
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

      request.headers.forEach(function (value, name) {
        xhr.setRequestHeader(name, value);
      });

      if (request.signal) {
        request.signal.addEventListener('abort', abortXhr);

        xhr.onreadystatechange = function () {
          // DONE (success or failure)
          if (xhr.readyState === 4) {
            request.signal.removeEventListener('abort', abortXhr);
          }
        };
      }

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
    });
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
    return this.then(function (value) {
      // @ts-ignore
      return constructor.resolve(callback()).then(function () {
        return value;
      });
    }, function (reason) {
      // @ts-ignore
      return constructor.resolve(callback()).then(function () {
        // @ts-ignore
        return constructor.reject(reason);
      });
    });
  } // Store setTimeout reference so promise-polyfill will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())


  var setTimeoutFunc = setTimeout;

  function isArray(x) {
    return Boolean(x && typeof x.length !== 'undefined');
  }

  function noop() {} // Polyfill for Function.prototype.bind


  function bind(fn, thisArg) {
    return function () {
      fn.apply(thisArg, arguments);
    };
  }
  /**
   * @constructor
   * @param {Function} fn
   */


  function Promise$1(fn) {
    if (!(this instanceof Promise$1)) throw new TypeError('Promises must be constructed via new');
    if (typeof fn !== 'function') throw new TypeError('not a function');
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

    Promise$1._immediateFn(function () {
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
      if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.');

      if (newValue && (_typeof(newValue) === 'object' || typeof newValue === 'function')) {
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
      Promise$1._immediateFn(function () {
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
      fn(function (value) {
        if (done) return;
        done = true;
        resolve(self, value);
      }, function (reason) {
        if (done) return;
        done = true;
        reject(self, reason);
      });
    } catch (ex) {
      if (done) return;
      done = true;
      reject(self, ex);
    }
  }

  Promise$1.prototype['catch'] = function (onRejected) {
    return this.then(null, onRejected);
  };

  Promise$1.prototype.then = function (onFulfilled, onRejected) {
    // @ts-ignore
    var prom = new this.constructor(noop);
    handle(this, new Handler(onFulfilled, onRejected, prom));
    return prom;
  };

  Promise$1.prototype['finally'] = finallyConstructor;

  Promise$1.all = function (arr) {
    return new Promise$1(function (resolve, reject) {
      if (!isArray(arr)) {
        return reject(new TypeError('Promise.all accepts an array'));
      }

      var args = Array.prototype.slice.call(arr);
      if (args.length === 0) return resolve([]);
      var remaining = args.length;

      function res(i, val) {
        try {
          if (val && (_typeof(val) === 'object' || typeof val === 'function')) {
            var then = val.then;

            if (typeof then === 'function') {
              then.call(val, function (val) {
                res(i, val);
              }, reject);
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

  Promise$1.resolve = function (value) {
    if (value && _typeof(value) === 'object' && value.constructor === Promise$1) {
      return value;
    }

    return new Promise$1(function (resolve) {
      resolve(value);
    });
  };

  Promise$1.reject = function (value) {
    return new Promise$1(function (resolve, reject) {
      reject(value);
    });
  };

  Promise$1.race = function (arr) {
    return new Promise$1(function (resolve, reject) {
      if (!isArray(arr)) {
        return reject(new TypeError('Promise.race accepts an array'));
      }

      for (var i = 0, len = arr.length; i < len; i++) {
        Promise$1.resolve(arr[i]).then(resolve, reject);
      }
    });
  }; // Use polyfill for setImmediate for performance gains


  Promise$1._immediateFn = // @ts-ignore
  typeof setImmediate === 'function' && function (fn) {
    // @ts-ignore
    setImmediate(fn);
  } || function (fn) {
    setTimeoutFunc(fn, 0);
  };

  Promise$1._unhandledRejectionFn = function _unhandledRejectionFn(err) {
    if (typeof console !== 'undefined' && console) {}
  };

  function noop$1() {}

  var identity = function identity(x) {
    return x;
  };

  function assign(tar, src) {
    // @ts-ignore
    for (var k in src) {
      tar[k] = src[k];
    }

    return tar;
  }

  function is_promise(value) {
    return value && _typeof(value) === 'object' && typeof value.then === 'function';
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
    return a != a ? b == b : a !== b || a && _typeof(a) === 'object' || typeof a === 'function';
  }

  function create_slot(definition, ctx, $$scope, fn) {
    if (definition) {
      var slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
      return definition[0](slot_ctx);
    }
  }

  function get_slot_context(definition, ctx, $$scope, fn) {
    return definition[1] && fn ? assign($$scope.ctx.slice(), definition[1](fn(ctx))) : $$scope.ctx;
  }

  function get_slot_changes(definition, $$scope, dirty, fn) {
    if (definition[2] && fn) {
      var lets = definition[2](fn(dirty));

      if ($$scope.dirty === undefined) {
        return lets;
      }

      if (_typeof(lets) === 'object') {
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

  function null_to_empty(value) {
    return value == null ? '' : value;
  }

  function action_destroyer(action_result) {
    return action_result && is_function(action_result.destroy) ? action_result.destroy : noop$1;
  }

  var is_client = typeof window !== 'undefined';
  var now = is_client ? function () {
    return window.performance.now();
  } : function () {
    return Date.now();
  };
  var raf = is_client ? function (cb) {
    return requestAnimationFrame(cb);
  } : noop$1;
  var tasks = new Set();

  function run_tasks(now) {
    tasks.forEach(function (task) {
      if (!task.c(now)) {
        tasks["delete"](task);
        task.f();
      }
    });
    if (tasks.size !== 0) raf(run_tasks);
  }
  /**
   * Creates a new task that runs on each raf frame
   * until it returns a falsy value or is aborted
   */


  function loop(callback) {
    var task;
    if (tasks.size === 0) raf(run_tasks);
    return {
      promise: new Promise(function (fulfill) {
        tasks.add(task = {
          c: callback,
          f: fulfill
        });
      }),
      abort: function abort() {
        tasks["delete"](task);
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
      if (iterations[i]) iterations[i].d(detaching);
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
    return function () {
      return node.removeEventListener(event, handler, options);
    };
  }

  function attr(node, attribute, value) {
    if (value == null) node.removeAttribute(attribute);else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
  }

  function children(element) {
    return Array.from(element.childNodes);
  }

  function set_data(text, data) {
    data = '' + data;
    if (text.data !== data) text.data = data;
  }

  function set_input_value(input, value) {
    if (value != null || input.value) {
      input.value = value;
    }
  }

  function select_option(select, value) {
    for (var i = 0; i < select.options.length; i += 1) {
      var option = select.options[i];

      if (option.__value === value) {
        option.selected = true;
        return;
      }
    }
  }

  function select_value(select) {
    var selected_option = select.querySelector(':checked') || select.options[0];
    return selected_option && selected_option.__value;
  }

  function toggle_class(element, name, toggle) {
    element.classList[toggle ? 'add' : 'remove'](name);
  }

  function custom_event(type, detail) {
    var e = document.createEvent('CustomEvent');
    e.initCustomEvent(type, false, false, detail);
    return e;
  }

  var HtmlTag = /*#__PURE__*/function () {
    function HtmlTag(html) {
      var anchor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      _classCallCheck(this, HtmlTag);

      this.e = element('div');
      this.a = anchor;
      this.u(html);
    }

    _createClass(HtmlTag, [{
      key: "m",
      value: function m(target) {
        var anchor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        for (var i = 0; i < this.n.length; i += 1) {
          insert(target, this.n[i], anchor);
        }

        this.t = target;
      }
    }, {
      key: "u",
      value: function u(html) {
        this.e.innerHTML = html;
        this.n = Array.from(this.e.childNodes);
      }
    }, {
      key: "p",
      value: function p(html) {
        this.d();
        this.u(html);
        this.m(this.t, this.a);
      }
    }, {
      key: "d",
      value: function d() {
        this.n.forEach(detach);
      }
    }]);

    return HtmlTag;
  }();

  var active_docs = new Set();
  var active = 0; // https://github.com/darkskyapp/string-hash/blob/master/index.js

  function hash(str) {
    var hash = 5381;
    var i = str.length;

    while (i--) {
      hash = (hash << 5) - hash ^ str.charCodeAt(i);
    }

    return hash >>> 0;
  }

  function create_rule(node, a, b, duration, delay, ease, fn) {
    var uid = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : 0;
    var step = 16.666 / duration;
    var keyframes = '{\n';

    for (var p = 0; p <= 1; p += step) {
      var t = a + (b - a) * ease(p);
      keyframes += p * 100 + "%{".concat(fn(t, 1 - t), "}\n");
    }

    var rule = keyframes + "100% {".concat(fn(b, 1 - b), "}\n}");
    var name = "__svelte_".concat(hash(rule), "_").concat(uid);
    var doc = node.ownerDocument;
    active_docs.add(doc);
    var stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
    var current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});

    if (!current_rules[name]) {
      current_rules[name] = true;
      stylesheet.insertRule("@keyframes ".concat(name, " ").concat(rule), stylesheet.cssRules.length);
    }

    var animation = node.style.animation || '';
    node.style.animation = "".concat(animation ? "".concat(animation, ", ") : "").concat(name, " ").concat(duration, "ms linear ").concat(delay, "ms 1 both");
    active += 1;
    return name;
  }

  function delete_rule(node, name) {
    var previous = (node.style.animation || '').split(', ');
    var next = previous.filter(name ? function (anim) {
      return anim.indexOf(name) < 0;
    } // remove specific animation
    : function (anim) {
      return anim.indexOf('__svelte') === -1;
    } // remove all Svelte animations
    );
    var deleted = previous.length - next.length;

    if (deleted) {
      node.style.animation = next.join(', ');
      active -= deleted;
      if (!active) clear_rules();
    }
  }

  function clear_rules() {
    raf(function () {
      if (active) return;
      active_docs.forEach(function (doc) {
        var stylesheet = doc.__svelte_stylesheet;
        var i = stylesheet.cssRules.length;

        while (i--) {
          stylesheet.deleteRule(i);
        }

        doc.__svelte_rules = {};
      });
      active_docs.clear();
    });
  }

  function create_animation(node, from, fn, params) {
    if (!from) return noop$1;
    var to = node.getBoundingClientRect();
    if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom) return noop$1;

    var _fn = fn(node, {
      from: from,
      to: to
    }, params),
        _fn$delay = _fn.delay,
        delay = _fn$delay === void 0 ? 0 : _fn$delay,
        _fn$duration = _fn.duration,
        duration = _fn$duration === void 0 ? 300 : _fn$duration,
        _fn$easing = _fn.easing,
        easing = _fn$easing === void 0 ? identity : _fn$easing,
        _fn$start = _fn.start,
        start_time = _fn$start === void 0 ? now() + delay : _fn$start,
        _fn$end = _fn.end,
        end = _fn$end === void 0 ? start_time + duration : _fn$end,
        _fn$tick = _fn.tick,
        tick = _fn$tick === void 0 ? noop$1 : _fn$tick,
        css = _fn.css;

    var running = true;
    var started = false;
    var name;

    function start() {
      if (css) {
        name = create_rule(node, 0, 1, duration, delay, easing, css);
      }

      if (!delay) {
        started = true;
      }
    }

    function stop() {
      if (css) delete_rule(node, name);
      running = false;
    }

    loop(function (now) {
      if (!started && now >= start_time) {
        started = true;
      }

      if (started && now >= end) {
        tick(1, 0);
        stop();
      }

      if (!running) {
        return false;
      }

      if (started) {
        var p = now - start_time;
        var t = 0 + 1 * easing(p / duration);
        tick(t, 1 - t);
      }

      return true;
    });
    start();
    tick(0, 1);
    return stop;
  }

  function fix_position(node) {
    var style = getComputedStyle(node);

    if (style.position !== 'absolute' && style.position !== 'fixed') {
      var width = style.width,
          height = style.height;
      var a = node.getBoundingClientRect();
      node.style.position = 'absolute';
      node.style.width = width;
      node.style.height = height;
      add_transform(node, a);
    }
  }

  function add_transform(node, a) {
    var b = node.getBoundingClientRect();

    if (a.left !== b.left || a.top !== b.top) {
      var style = getComputedStyle(node);
      var transform = style.transform === 'none' ? '' : style.transform;
      node.style.transform = "".concat(transform, " translate(").concat(a.left - b.left, "px, ").concat(a.top - b.top, "px)");
    }
  }

  var current_component;

  function set_current_component(component) {
    current_component = component;
  }

  function get_current_component() {
    if (!current_component) throw new Error("Function called outside component initialization");
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
  } // TODO figure out if we still want to support
  // shorthand events, or if we want to implement
  // a real bubbling mechanism


  function bubble(component, event) {
    var callbacks = component.$$.callbacks[event.type];

    if (callbacks) {
      callbacks.slice().forEach(function (fn) {
        return fn(event);
      });
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
    if (flushing) return;
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

      while (binding_callbacks.length) {
        binding_callbacks.pop()();
      } // then, once components are updated, call
      // afterUpdate functions. This may cause
      // subsequent updates...


      for (var _i = 0; _i < render_callbacks.length; _i += 1) {
        var callback = render_callbacks[_i];

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
    node.dispatchEvent(custom_event("".concat(direction ? 'intro' : 'outro').concat(kind)));
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
      outroing["delete"](block);
      block.i(local);
    }
  }

  function transition_out(block, local, detach, callback) {
    if (block && block.o) {
      if (outroing.has(block)) return;
      outroing.add(block);
      outros.c.push(function () {
        outroing["delete"](block);

        if (callback) {
          if (detach) block.d(1);
          callback();
        }
      });
      block.o(local);
    }
  }

  var null_transition = {
    duration: 0
  };

  function create_bidirectional_transition(node, fn, params, intro) {
    var config = fn(node, params);
    var t = intro ? 0 : 1;
    var running_program = null;
    var pending_program = null;
    var animation_name = null;

    function clear_animation() {
      if (animation_name) delete_rule(node, animation_name);
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
      var _ref = config || null_transition,
          _ref$delay = _ref.delay,
          delay = _ref$delay === void 0 ? 0 : _ref$delay,
          _ref$duration = _ref.duration,
          duration = _ref$duration === void 0 ? 300 : _ref$duration,
          _ref$easing = _ref.easing,
          easing = _ref$easing === void 0 ? identity : _ref$easing,
          _ref$tick = _ref.tick,
          tick = _ref$tick === void 0 ? noop$1 : _ref$tick,
          css = _ref.css;

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
      } else {
        // if this is an intro, and there's a delay, we need to do
        // an initial tick and/or apply CSS animation immediately
        if (css) {
          clear_animation();
          animation_name = create_rule(node, t, b, duration, delay, easing, css);
        }

        if (b) tick(0, 1);
        running_program = init(program, duration);
        add_render_callback(function () {
          return dispatch(node, b, 'start');
        });
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
                  // intro ??? we can tidy up immediately
                  clear_animation();
                } else {
                  // outro ??? needs to be coordinated
                  if (! --running_program.group.r) run_all(running_program.group.c);
                }
              }

              running_program = null;
            } else if (now >= running_program.start) {
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
        } else {
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
      if (info.token !== token) return;
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
        } else {
          info.block.d(1);
        }

        block.c();
        transition_in(block, 1);
        block.m(info.mount(), info.anchor);
        needs_flush = true;
      }

      info.block = block;
      if (info.blocks) info.blocks[index] = block;

      if (needs_flush) {
        flush();
      }
    }

    if (is_promise(promise)) {
      var _current_component = get_current_component();

      promise.then(function (value) {
        set_current_component(_current_component);
        update(info.then, 1, info.value, value);
        set_current_component(null);
      }, function (error) {
        set_current_component(_current_component);
        update(info["catch"], 2, info.error, error);
        set_current_component(null);
      }); // if we previously had a then/catch block, destroy it

      if (info.current !== info.pending) {
        update(info.pending, 0);
        return true;
      }
    } else {
      if (info.current !== info.then) {
        update(info.then, 1, info.value, promise);
        return true;
      }

      info.resolved = promise;
    }
  }

  function outro_and_destroy_block(block, lookup) {
    transition_out(block, 1, 1, function () {
      lookup["delete"](block.key);
    });
  }

  function fix_and_outro_and_destroy_block(block, lookup) {
    block.f();
    outro_and_destroy_block(block, lookup);
  }

  function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
    var o = old_blocks.length;
    var n = list.length;
    var i = o;
    var old_indexes = {};

    while (i--) {
      old_indexes[old_blocks[i].key] = i;
    }

    var new_blocks = [];
    var new_lookup = new Map();
    var deltas = new Map();
    i = n;

    while (i--) {
      var child_ctx = get_context(ctx, list, i);
      var key = get_key(child_ctx);

      var _block = lookup.get(key);

      if (!_block) {
        _block = create_each_block(key, child_ctx);

        _block.c();
      } else if (dynamic) {
        _block.p(child_ctx, dirty);
      }

      new_lookup.set(key, new_blocks[i] = _block);
      if (key in old_indexes) deltas.set(key, Math.abs(i - old_indexes[key]));
    }

    var will_move = new Set();
    var did_move = new Set();

    function insert(block) {
      transition_in(block, 1);
      block.m(node, next, lookup.has(block.key));
      lookup.set(block.key, block);
      next = block.first;
      n--;
    }

    while (o && n) {
      var new_block = new_blocks[n - 1];
      var old_block = old_blocks[o - 1];
      var new_key = new_block.key;
      var old_key = old_block.key;

      if (new_block === old_block) {
        // do nothing
        next = new_block.first;
        o--;
        n--;
      } else if (!new_lookup.has(old_key)) {
        // remove old block
        destroy(old_block, lookup);
        o--;
      } else if (!lookup.has(new_key) || will_move.has(new_key)) {
        insert(new_block);
      } else if (did_move.has(old_key)) {
        o--;
      } else if (deltas.get(new_key) > deltas.get(old_key)) {
        did_move.add(new_key);
        insert(new_block);
      } else {
        will_move.add(old_key);
        o--;
      }
    }

    while (o--) {
      var _old_block = old_blocks[o];
      if (!new_lookup.has(_old_block.key)) destroy(_old_block, lookup);
    }

    while (n) {
      insert(new_blocks[n - 1]);
    }

    return new_blocks;
  }

  function get_spread_update(levels, updates) {
    var update = {};
    var to_null_out = {};
    var accounted_for = {
      $$scope: 1
    };
    var i = levels.length;

    while (i--) {
      var o = levels[i];
      var n = updates[i];

      if (n) {
        for (var key in o) {
          if (!(key in n)) to_null_out[key] = 1;
        }

        for (var _key in n) {
          if (!accounted_for[_key]) {
            update[_key] = n[_key];
            accounted_for[_key] = 1;
          }
        }

        levels[i] = n;
      } else {
        for (var _key2 in o) {
          accounted_for[_key2] = 1;
        }
      }
    }

    for (var _key3 in to_null_out) {
      if (!(_key3 in update)) update[_key3] = undefined;
    }

    return update;
  }

  function get_spread_object(spread_props) {
    return _typeof(spread_props) === 'object' && spread_props !== null ? spread_props : {};
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
    var _component$$$ = component.$$,
        fragment = _component$$$.fragment,
        on_mount = _component$$$.on_mount,
        on_destroy = _component$$$.on_destroy,
        after_update = _component$$$.after_update;
    fragment && fragment.m(target, anchor); // onMount happens before the initial afterUpdate

    add_render_callback(function () {
      var new_on_destroy = on_mount.map(run).filter(is_function);

      if (on_destroy) {
        on_destroy.push.apply(on_destroy, _toConsumableArray(new_on_destroy));
      } else {
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
      $$.fragment && $$.fragment.d(detaching); // TODO null out other refs, including component.$$ (but need to
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

    component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
  }

  function init(component, options, instance, create_fragment, not_equal, props) {
    var dirty = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : [-1];
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
    $$.ctx = instance ? instance(component, prop_values, function (i, ret) {
      var value = (arguments.length <= 2 ? 0 : arguments.length - 2) ? arguments.length <= 2 ? undefined : arguments[2] : ret;

      if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
        if ($$.bound[i]) $$.bound[i](value);
        if (ready) make_dirty(component, i);
      }

      return ret;
    }) : [];
    $$.update();
    ready = true;
    run_all($$.before_update); // `false` as a special case of no DOM component

    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;

    if (options.target) {
      if (options.hydrate) {
        var nodes = children(options.target); // eslint-disable-next-line @typescript-eslint/no-non-null-assertion

        $$.fragment && $$.fragment.l(nodes);
        nodes.forEach(detach);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        $$.fragment && $$.fragment.c();
      }

      if (options.intro) transition_in(component.$$.fragment);
      mount_component(component, options.target, options.anchor);
      flush();
    }

    set_current_component(parent_component);
  }

  var SvelteComponent = /*#__PURE__*/function () {
    function SvelteComponent() {
      _classCallCheck(this, SvelteComponent);
    }

    _createClass(SvelteComponent, [{
      key: "$destroy",
      value: function $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop$1;
      }
    }, {
      key: "$on",
      value: function $on(type, callback) {
        var callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
        callbacks.push(callback);
        return function () {
          var index = callbacks.indexOf(callback);
          if (index !== -1) callbacks.splice(index, 1);
        };
      }
    }, {
      key: "$set",
      value: function $set() {// overridden by instance, if it has props
      }
    }]);

    return SvelteComponent;
  }();
  /* src/Unique.html generated by Svelte v3.20.1 */


  var get_default_slot_changes = function get_default_slot_changes(dirty) {
    return {};
  };

  var get_default_slot_context = function get_default_slot_context(ctx) {
    return {
      uniqueId:
      /*uniqueId*/
      ctx[0]
    };
  };

  function create_fragment(ctx) {
    var current;
    var default_slot_template =
    /*$$slots*/
    ctx[2]["default"];
    var default_slot = create_slot(default_slot_template, ctx,
    /*$$scope*/
    ctx[1], get_default_slot_context);
    return {
      c: function c() {
        if (default_slot) default_slot.c();
      },
      m: function m(target, anchor) {
        if (default_slot) {
          default_slot.m(target, anchor);
        }

        current = true;
      },
      p: function p(ctx, _ref2) {
        var _ref3 = _slicedToArray(_ref2, 1),
            dirty = _ref3[0];

        if (default_slot) {
          if (default_slot.p && dirty &
          /*$$scope*/
          2) {
            default_slot.p(get_slot_context(default_slot_template, ctx,
            /*$$scope*/
            ctx[1], get_default_slot_context), get_slot_changes(default_slot_template,
            /*$$scope*/
            ctx[1], dirty, get_default_slot_changes));
          }
        }
      },
      i: function i(local) {
        if (current) return;
        transition_in(default_slot, local);
        current = true;
      },
      o: function o(local) {
        transition_out(default_slot, local);
        current = false;
      },
      d: function d(detaching) {
        if (default_slot) default_slot.d(detaching);
      }
    };
  }

  function instance($$self, $$props, $$invalidate) {
    var uniqueId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(32);
    var _$$props$$$slots = $$props.$$slots,
        $$slots = _$$props$$$slots === void 0 ? {} : _$$props$$$slots,
        $$scope = $$props.$$scope;

    $$self.$set = function ($$props) {
      if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    };

    return [uniqueId, $$scope, $$slots];
  }

  var Unique = /*#__PURE__*/function (_SvelteComponent) {
    _inherits(Unique, _SvelteComponent);

    var _super = _createSuper(Unique);

    function Unique(options) {
      var _this2;

      _classCallCheck(this, Unique);

      _this2 = _super.call(this);
      init(_assertThisInitialized(_this2), options, instance, create_fragment, safe_not_equal, {});
      return _this2;
    }

    return Unique;
  }(SvelteComponent);
  /* src/GalleryCreate.html generated by Svelte v3.20.1 */


  function get_each_context(ctx, list, i) {
    var child_ctx = ctx.slice();
    child_ctx[15] = list[i];
    return child_ctx;
  } // (152:8) {:catch err}


  function create_catch_block(ctx) {
    var p;
    var t_value =
    /*err*/
    ctx[18].message + "";
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
        if (dirty &
        /*galleryResult*/
        4 && t_value !== (t_value =
        /*err*/
        ctx[18].message + "")) set_data(t, t_value);
      },
      d: function d(detaching) {
        if (detaching) detach(p);
      }
    };
  } // (138:8) {:then}


  function create_then_block(ctx) {
    var div0;
    var label0;
    var t0;
    var label0_for_value;
    var t1;
    var input0;
    var input0_id_value;
    var t2;
    var div1;
    var label1;
    var t3;
    var label1_for_value;
    var t4;
    var input1;
    var input1_id_value;
    var t5;
    var if_block_anchor;
    var dispose;

    function select_block_type(ctx, dirty) {
      if (
      /*galleryId*/
      ctx[0]) return create_if_block_5;
      return create_else_block_1;
    }

    var current_block_type = select_block_type(ctx);
    var if_block = current_block_type(ctx);
    return {
      c: function c() {
        div0 = element("div");
        label0 = element("label");
        t0 = text("Name");
        t1 = space();
        input0 = element("input");
        t2 = space();
        div1 = element("div");
        label1 = element("label");
        t3 = text("Description");
        t4 = space();
        input1 = element("input");
        t5 = space();
        if_block.c();
        if_block_anchor = empty();
        attr(label0, "for", label0_for_value = "gallery-name-" +
        /*uniqueId*/
        ctx[14]);
        attr(input0, "id", input0_id_value = "gallery-name-" +
        /*uniqueId*/
        ctx[14]);
        attr(input0, "type", "text");
        attr(label1, "for", label1_for_value = "gallery-description-" +
        /*uniqueId*/
        ctx[14]);
        attr(input1, "id", input1_id_value = "gallery-description-" +
        /*uniqueId*/
        ctx[14]);
        attr(input1, "type", "text");
      },
      m: function m(target, anchor, remount) {
        insert(target, div0, anchor);
        append(div0, label0);
        append(label0, t0);
        append(div0, t1);
        append(div0, input0);
        set_input_value(input0,
        /*galleryInfo*/
        ctx[3].name);
        insert(target, t2, anchor);
        insert(target, div1, anchor);
        append(div1, label1);
        append(label1, t3);
        append(div1, t4);
        append(div1, input1);
        set_input_value(input1,
        /*galleryInfo*/
        ctx[3].description);
        insert(target, t5, anchor);
        if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
        if (remount) run_all(dispose);
        dispose = [listen(input0, "input",
        /*input0_input_handler*/
        ctx[9]), listen(input1, "input",
        /*input1_input_handler*/
        ctx[10])];
      },
      p: function p(ctx, dirty) {
        if (dirty &
        /*uniqueId*/
        16384 && label0_for_value !== (label0_for_value = "gallery-name-" +
        /*uniqueId*/
        ctx[14])) {
          attr(label0, "for", label0_for_value);
        }

        if (dirty &
        /*uniqueId*/
        16384 && input0_id_value !== (input0_id_value = "gallery-name-" +
        /*uniqueId*/
        ctx[14])) {
          attr(input0, "id", input0_id_value);
        }

        if (dirty &
        /*galleryInfo*/
        8 && input0.value !==
        /*galleryInfo*/
        ctx[3].name) {
          set_input_value(input0,
          /*galleryInfo*/
          ctx[3].name);
        }

        if (dirty &
        /*uniqueId*/
        16384 && label1_for_value !== (label1_for_value = "gallery-description-" +
        /*uniqueId*/
        ctx[14])) {
          attr(label1, "for", label1_for_value);
        }

        if (dirty &
        /*uniqueId*/
        16384 && input1_id_value !== (input1_id_value = "gallery-description-" +
        /*uniqueId*/
        ctx[14])) {
          attr(input1, "id", input1_id_value);
        }

        if (dirty &
        /*galleryInfo*/
        8 && input1.value !==
        /*galleryInfo*/
        ctx[3].description) {
          set_input_value(input1,
          /*galleryInfo*/
          ctx[3].description);
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
        if (detaching) detach(div0);
        if (detaching) detach(t2);
        if (detaching) detach(div1);
        if (detaching) detach(t5);
        if_block.d(detaching);
        if (detaching) detach(if_block_anchor);
        run_all(dispose);
      }
    };
  } // (149:12) {:else}


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
        button.disabled = button_disabled_value = !galleryIsValid(
        /*galleryInfo*/
        ctx[3]);
      },
      m: function m(target, anchor, remount) {
        insert(target, button, anchor);
        append(button, t);
        if (remount) dispose();
        dispose = listen(button, "click",
        /*addGallery*/
        ctx[5]);
      },
      p: function p(ctx, dirty) {
        if (dirty &
        /*galleryInfo*/
        8 && button_disabled_value !== (button_disabled_value = !galleryIsValid(
        /*galleryInfo*/
        ctx[3]))) {
          button.disabled = button_disabled_value;
        }
      },
      d: function d(detaching) {
        if (detaching) detach(button);
        dispose();
      }
    };
  } // (147:12) {#if galleryId}


  function create_if_block_5(ctx) {
    var button;
    var t;
    var button_disabled_value;
    var dispose;
    return {
      c: function c() {
        button = element("button");
        t = text("Update Gallery");
        attr(button, "type", "button");
        button.disabled = button_disabled_value = !galleryIsValid(
        /*galleryInfo*/
        ctx[3]);
      },
      m: function m(target, anchor, remount) {
        insert(target, button, anchor);
        append(button, t);
        if (remount) dispose();
        dispose = listen(button, "click",
        /*updateGallery*/
        ctx[6]);
      },
      p: function p(ctx, dirty) {
        if (dirty &
        /*galleryInfo*/
        8 && button_disabled_value !== (button_disabled_value = !galleryIsValid(
        /*galleryInfo*/
        ctx[3]))) {
          button.disabled = button_disabled_value;
        }
      },
      d: function d(detaching) {
        if (detaching) detach(button);
        dispose();
      }
    };
  } // (136:30)          <p>Submitting...</p>         {:then}


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
        if (detaching) detach(p);
      }
    };
  } // (156:4) {#if galleryId}


  function create_if_block(ctx) {
    var t0;
    var fieldset;
    var legend;
    var t2;
    var div0;
    var label0;
    var t3;
    var label0_for_value;
    var t4;
    var input0;
    var input0_id_value;
    var t5;
    var div1;
    var label1;
    var t6;
    var label1_for_value;
    var t7;
    var input1;
    var input1_id_value;
    var t8;
    var div2;
    var label2;
    var t9;
    var label2_for_value;
    var t10;
    var input2;
    var input2_id_value;
    var t11;
    var button;
    var t12;
    var button_disabled_value;
    var dispose;
    var if_block =
    /*items*/
    ctx[1] &&
    /*items*/
    ctx[1].length > 0 && create_if_block_1(ctx);
    return {
      c: function c() {
        if (if_block) if_block.c();
        t0 = space();
        fieldset = element("fieldset");
        legend = element("legend");
        legend.textContent = "New Item";
        t2 = space();
        div0 = element("div");
        label0 = element("label");
        t3 = text("Name");
        t4 = space();
        input0 = element("input");
        t5 = space();
        div1 = element("div");
        label1 = element("label");
        t6 = text("Description");
        t7 = space();
        input1 = element("input");
        t8 = space();
        div2 = element("div");
        label2 = element("label");
        t9 = text("File");
        t10 = space();
        input2 = element("input");
        t11 = space();
        button = element("button");
        t12 = text("Add Item");
        attr(label0, "for", label0_for_value = "gallery-item-name-" +
        /*uniqueId*/
        ctx[14]);
        attr(input0, "id", input0_id_value = "gallery-item-name-" +
        /*uniqueId*/
        ctx[14]);
        attr(input0, "type", "text");
        attr(label1, "for", label1_for_value = "gallery-item-description-" +
        /*uniqueId*/
        ctx[14]);
        attr(input1, "id", input1_id_value = "gallery-item-description-" +
        /*uniqueId*/
        ctx[14]);
        attr(input1, "type", "text");
        attr(label2, "for", label2_for_value = "gallery-item-file-" +
        /*uniqueId*/
        ctx[14]);
        attr(input2, "id", input2_id_value = "gallery-item-file-" +
        /*uniqueId*/
        ctx[14]);
        attr(input2, "type", "file");
        attr(button, "type", "button");
        button.disabled = button_disabled_value = !
        /*itemIsValid*/
        ctx[7](
        /*itemInfo*/
        ctx[4]);
      },
      m: function m(target, anchor, remount) {
        if (if_block) if_block.m(target, anchor);
        insert(target, t0, anchor);
        insert(target, fieldset, anchor);
        append(fieldset, legend);
        append(fieldset, t2);
        append(fieldset, div0);
        append(div0, label0);
        append(label0, t3);
        append(div0, t4);
        append(div0, input0);
        set_input_value(input0,
        /*itemInfo*/
        ctx[4].name);
        append(fieldset, t5);
        append(fieldset, div1);
        append(div1, label1);
        append(label1, t6);
        append(div1, t7);
        append(div1, input1);
        set_input_value(input1,
        /*itemInfo*/
        ctx[4].description);
        append(fieldset, t8);
        append(fieldset, div2);
        append(div2, label2);
        append(label2, t9);
        append(div2, t10);
        append(div2, input2);
        append(fieldset, t11);
        append(fieldset, button);
        append(button, t12);
        if (remount) run_all(dispose);
        dispose = [listen(input0, "input",
        /*input0_input_handler_1*/
        ctx[11]), listen(input1, "input",
        /*input1_input_handler_1*/
        ctx[12]), listen(input2, "change",
        /*input2_change_handler*/
        ctx[13]), listen(button, "click",
        /*addItem*/
        ctx[8])];
      },
      p: function p(ctx, dirty) {
        if (
        /*items*/
        ctx[1] &&
        /*items*/
        ctx[1].length > 0) {
          if (if_block) {
            if_block.p(ctx, dirty);
          } else {
            if_block = create_if_block_1(ctx);
            if_block.c();
            if_block.m(t0.parentNode, t0);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }

        if (dirty &
        /*uniqueId*/
        16384 && label0_for_value !== (label0_for_value = "gallery-item-name-" +
        /*uniqueId*/
        ctx[14])) {
          attr(label0, "for", label0_for_value);
        }

        if (dirty &
        /*uniqueId*/
        16384 && input0_id_value !== (input0_id_value = "gallery-item-name-" +
        /*uniqueId*/
        ctx[14])) {
          attr(input0, "id", input0_id_value);
        }

        if (dirty &
        /*itemInfo*/
        16 && input0.value !==
        /*itemInfo*/
        ctx[4].name) {
          set_input_value(input0,
          /*itemInfo*/
          ctx[4].name);
        }

        if (dirty &
        /*uniqueId*/
        16384 && label1_for_value !== (label1_for_value = "gallery-item-description-" +
        /*uniqueId*/
        ctx[14])) {
          attr(label1, "for", label1_for_value);
        }

        if (dirty &
        /*uniqueId*/
        16384 && input1_id_value !== (input1_id_value = "gallery-item-description-" +
        /*uniqueId*/
        ctx[14])) {
          attr(input1, "id", input1_id_value);
        }

        if (dirty &
        /*itemInfo*/
        16 && input1.value !==
        /*itemInfo*/
        ctx[4].description) {
          set_input_value(input1,
          /*itemInfo*/
          ctx[4].description);
        }

        if (dirty &
        /*uniqueId*/
        16384 && label2_for_value !== (label2_for_value = "gallery-item-file-" +
        /*uniqueId*/
        ctx[14])) {
          attr(label2, "for", label2_for_value);
        }

        if (dirty &
        /*uniqueId*/
        16384 && input2_id_value !== (input2_id_value = "gallery-item-file-" +
        /*uniqueId*/
        ctx[14])) {
          attr(input2, "id", input2_id_value);
        }

        if (dirty &
        /*itemInfo*/
        16 && button_disabled_value !== (button_disabled_value = !
        /*itemIsValid*/
        ctx[7](
        /*itemInfo*/
        ctx[4]))) {
          button.disabled = button_disabled_value;
        }
      },
      d: function d(detaching) {
        if (if_block) if_block.d(detaching);
        if (detaching) detach(t0);
        if (detaching) detach(fieldset);
        run_all(dispose);
      }
    };
  } // (157:4) {#if items && items.length > 0}


  function create_if_block_1(ctx) {
    var fieldset;
    var legend;
    var t1;
    var ul;
    var each_value =
    /*items*/
    ctx[1];
    var each_blocks = [];

    for (var i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    }

    return {
      c: function c() {
        fieldset = element("fieldset");
        legend = element("legend");
        legend.textContent = "Gallery Items";
        t1 = space();
        ul = element("ul");

        for (var _i2 = 0; _i2 < each_blocks.length; _i2 += 1) {
          each_blocks[_i2].c();
        }
      },
      m: function m(target, anchor) {
        insert(target, fieldset, anchor);
        append(fieldset, legend);
        append(fieldset, t1);
        append(fieldset, ul);

        for (var _i3 = 0; _i3 < each_blocks.length; _i3 += 1) {
          each_blocks[_i3].m(ul, null);
        }
      },
      p: function p(ctx, dirty) {
        if (dirty &
        /*items, Success, Error*/
        2) {
          each_value =
          /*items*/
          ctx[1];

          var _i4;

          for (_i4 = 0; _i4 < each_value.length; _i4 += 1) {
            var child_ctx = get_each_context(ctx, each_value, _i4);

            if (each_blocks[_i4]) {
              each_blocks[_i4].p(child_ctx, dirty);
            } else {
              each_blocks[_i4] = create_each_block(child_ctx);

              each_blocks[_i4].c();

              each_blocks[_i4].m(ul, null);
            }
          }

          for (; _i4 < each_blocks.length; _i4 += 1) {
            each_blocks[_i4].d(1);
          }

          each_blocks.length = each_value.length;
        }
      },
      d: function d(detaching) {
        if (detaching) detach(fieldset);
        destroy_each(each_blocks, detaching);
      }
    };
  } // (170:16) {:else}


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
        if (detaching) detach(progress);
      }
    };
  } // (168:16) {#if item.file.total > 0}


  function create_if_block_4(ctx) {
    var progress;
    var progress_max_value;
    var progress_value_value;
    return {
      c: function c() {
        progress = element("progress");
        attr(progress, "max", progress_max_value =
        /*item*/
        ctx[15].file.total);
        progress.value = progress_value_value =
        /*item*/
        ctx[15].file.loaded;
      },
      m: function m(target, anchor) {
        insert(target, progress, anchor);
      },
      p: function p(ctx, dirty) {
        if (dirty &
        /*items*/
        2 && progress_max_value !== (progress_max_value =
        /*item*/
        ctx[15].file.total)) {
          attr(progress, "max", progress_max_value);
        }

        if (dirty &
        /*items*/
        2 && progress_value_value !== (progress_value_value =
        /*item*/
        ctx[15].file.loaded)) {
          progress.value = progress_value_value;
        }
      },
      d: function d(detaching) {
        if (detaching) detach(progress);
      }
    };
  } // (165:53) 


  function create_if_block_3(ctx) {
    var span;
    var t0;
    var t1_value =
    /*item*/
    ctx[15].file.response + "";
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
        if (dirty &
        /*items*/
        2 && t1_value !== (t1_value =
        /*item*/
        ctx[15].file.response + "")) set_data(t1, t1_value);
      },
      d: function d(detaching) {
        if (detaching) detach(span);
      }
    };
  } // (163:16) {#if item.file.status === Success}


  function create_if_block_2(ctx) {
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
        if (detaching) detach(span);
      }
    };
  } // (161:8) {#each items as item}


  function create_each_block(ctx) {
    var li;
    var t0_value =
    /*item*/
    ctx[15].name + "";
    var t0;
    var t1;
    var t2;

    function select_block_type_1(ctx, dirty) {
      if (
      /*item*/
      ctx[15].file.status === Success) return create_if_block_2;
      if (
      /*item*/
      ctx[15].file.status === Error$1) return create_if_block_3;
      if (
      /*item*/
      ctx[15].file.total > 0) return create_if_block_4;
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
        if (dirty &
        /*items*/
        2 && t0_value !== (t0_value =
        /*item*/
        ctx[15].name + "")) set_data(t0, t0_value);

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
        if (detaching) detach(li);
        if_block.d();
      }
    };
  } // (132:0) <Unique let:uniqueId={uniqueId}>


  function create_default_slot(ctx) {
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
      "catch": create_catch_block,
      error: 18
    };
    handle_promise(promise =
    /*galleryResult*/
    ctx[2], info);
    var if_block =
    /*galleryId*/
    ctx[0] && create_if_block(ctx);
    return {
      c: function c() {
        form = element("form");
        fieldset = element("fieldset");
        legend = element("legend");
        legend.textContent = "Gallery Information";
        t1 = space();
        info.block.c();
        t2 = space();
        if (if_block) if_block.c();
      },
      m: function m(target, anchor) {
        insert(target, form, anchor);
        append(form, fieldset);
        append(fieldset, legend);
        append(fieldset, t1);
        info.block.m(fieldset, info.anchor = null);

        info.mount = function () {
          return fieldset;
        };

        info.anchor = null;
        append(form, t2);
        if (if_block) if_block.m(form, null);
      },
      p: function p(new_ctx, dirty) {
        ctx = new_ctx;
        info.ctx = ctx;
        if (dirty &
        /*galleryResult*/
        4 && promise !== (promise =
        /*galleryResult*/
        ctx[2]) && handle_promise(promise, info)) ;else {
          var child_ctx = ctx.slice();
          info.block.p(child_ctx, dirty);
        }

        if (
        /*galleryId*/
        ctx[0]) {
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
      d: function d(detaching) {
        if (detaching) detach(form);
        info.block.d();
        info.token = null;
        info = null;
        if (if_block) if_block.d();
      }
    };
  }

  function create_fragment$1(ctx) {
    var current;
    var unique = new Unique({
      props: {
        $$slots: {
          "default": [create_default_slot, function (_ref4) {
            var uniqueId = _ref4.uniqueId;
            return {
              14: uniqueId
            };
          }, function (_ref5) {
            var uniqueId = _ref5.uniqueId;
            return uniqueId ? 16384 : 0;
          }]
        },
        $$scope: {
          ctx: ctx
        }
      }
    });
    return {
      c: function c() {
        create_component(unique.$$.fragment);
      },
      m: function m(target, anchor) {
        mount_component(unique, target, anchor);
        current = true;
      },
      p: function p(ctx, _ref6) {
        var _ref7 = _slicedToArray(_ref6, 1),
            dirty = _ref7[0];

        var unique_changes = {};

        if (dirty &
        /*$$scope, itemInfo, uniqueId, items, galleryId, galleryResult, galleryInfo*/
        540703) {
          unique_changes.$$scope = {
            dirty: dirty,
            ctx: ctx
          };
        }

        unique.$set(unique_changes);
      },
      i: function i(local) {
        if (current) return;
        transition_in(unique.$$.fragment, local);
        current = true;
      },
      o: function o(local) {
        transition_out(unique.$$.fragment, local);
        current = false;
      },
      d: function d(detaching) {
        destroy_component(unique, detaching);
      }
    };
  }

  var Loading = 0;
  var Success = 1;
  var Error$1 = 2;

  function galleryIsValid(galleryInfo) {
    return galleryInfo.name.length;
  }

  function instance$1($$self, $$props, $$invalidate) {
    var galleryId = $$props.galleryId;
    var items = [];
    var galleryResult = Promise.resolve(true);
    var galleryInfo = {
      kind: 0,
      name: "",
      description: ""
    };
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
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "same-origin",
          body: JSON.stringify(galleryInfo)
        }).then(function (res) {
          return res.json();
        }).then(function (id) {
          return $$invalidate(0, galleryId = id);
        }));
      }
    }

    function updateGallery() {
      if (galleryId && galleryIsValid(galleryInfo)) {
        $$invalidate(2, galleryResult = fetch("http://localhost:8080/galleries/".concat(galleryId), {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "same-origin",
          body: JSON.stringify(galleryInfo)
        }).then(function (res) {
          return res.json();
        }));
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
        request.open("POST", "http://localhost:8080/galleries/".concat(galleryId, "/items"));
        request.upload.addEventListener("progress", function (e) {
          var loaded = e.loaded,
              total = e.total;
          requestData.loaded = loaded;
          requestData.total = total; // Ensure refresh

          $$invalidate(1, items);
        });
        request.addEventListener("load", function (e) {
          if (request.status == 200 || request.status == 201) requestData.status = Success;else requestData.status = Error$1; // Ensure refresh

          $$invalidate(1, items);
        });
        request.addEventListener("readystatechange", function (e) {
          if (request.readyState === 4 && request.response.length) requestData.response = JSON.parse(request.response); // Ensure refresh

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
      if ("galleryId" in $$props) $$invalidate(0, galleryId = $$props.galleryId);
    };

    return [galleryId, items, galleryResult, galleryInfo, itemInfo, addGallery, updateGallery, itemIsValid, addItem, input0_input_handler, input1_input_handler, input0_input_handler_1, input1_input_handler_1, input2_change_handler];
  }

  var GalleryCreate = /*#__PURE__*/function (_SvelteComponent2) {
    _inherits(GalleryCreate, _SvelteComponent2);

    var _super2 = _createSuper(GalleryCreate);

    function GalleryCreate(options) {
      var _this3;

      _classCallCheck(this, GalleryCreate);

      _this3 = _super2.call(this);
      init(_assertThisInitialized(_this3), options, instance$1, create_fragment$1, safe_not_equal, {
        galleryId: 0
      });
      return _this3;
    }

    return GalleryCreate;
  }(SvelteComponent);
  /* node_modules/svelte-material-icons/Alert.svelte generated by Svelte v3.20.1 */


  function create_fragment$2(ctx) {
    var svg;
    var path;
    return {
      c: function c() {
        svg = svg_element("svg");
        path = svg_element("path");
        attr(path, "d", "M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z");
        attr(path, "fill",
        /*color*/
        ctx[2]);
        attr(svg, "width",
        /*width*/
        ctx[0]);
        attr(svg, "height",
        /*height*/
        ctx[1]);
        attr(svg, "viewBox",
        /*viewBox*/
        ctx[3]);
      },
      m: function m(target, anchor) {
        insert(target, svg, anchor);
        append(svg, path);
      },
      p: function p(ctx, _ref8) {
        var _ref9 = _slicedToArray(_ref8, 1),
            dirty = _ref9[0];

        if (dirty &
        /*color*/
        4) {
          attr(path, "fill",
          /*color*/
          ctx[2]);
        }

        if (dirty &
        /*width*/
        1) {
          attr(svg, "width",
          /*width*/
          ctx[0]);
        }

        if (dirty &
        /*height*/
        2) {
          attr(svg, "height",
          /*height*/
          ctx[1]);
        }

        if (dirty &
        /*viewBox*/
        8) {
          attr(svg, "viewBox",
          /*viewBox*/
          ctx[3]);
        }
      },
      i: noop$1,
      o: noop$1,
      d: function d(detaching) {
        if (detaching) detach(svg);
      }
    };
  }

  function instance$2($$self, $$props, $$invalidate) {
    var _$$props$size = $$props.size,
        size = _$$props$size === void 0 ? "1em" : _$$props$size;
    var _$$props$width = $$props.width,
        width = _$$props$width === void 0 ? size : _$$props$width;
    var _$$props$height = $$props.height,
        height = _$$props$height === void 0 ? size : _$$props$height;
    var _$$props$color = $$props.color,
        color = _$$props$color === void 0 ? "currentColor" : _$$props$color;
    var _$$props$viewBox = $$props.viewBox,
        viewBox = _$$props$viewBox === void 0 ? "0 0 24 24" : _$$props$viewBox;

    $$self.$set = function ($$props) {
      if ("size" in $$props) $$invalidate(4, size = $$props.size);
      if ("width" in $$props) $$invalidate(0, width = $$props.width);
      if ("height" in $$props) $$invalidate(1, height = $$props.height);
      if ("color" in $$props) $$invalidate(2, color = $$props.color);
      if ("viewBox" in $$props) $$invalidate(3, viewBox = $$props.viewBox);
    };

    return [width, height, color, viewBox, size];
  }

  var Alert = /*#__PURE__*/function (_SvelteComponent3) {
    _inherits(Alert, _SvelteComponent3);

    var _super3 = _createSuper(Alert);

    function Alert(options) {
      var _this4;

      _classCallCheck(this, Alert);

      _this4 = _super3.call(this);
      init(_assertThisInitialized(_this4), options, instance$2, create_fragment$2, safe_not_equal, {
        size: 4,
        width: 0,
        height: 1,
        color: 2,
        viewBox: 3
      });
      return _this4;
    }

    return Alert;
  }(SvelteComponent);
  /* node_modules/svelte-material-icons/CheckBold.svelte generated by Svelte v3.20.1 */


  function create_fragment$3(ctx) {
    var svg;
    var path;
    return {
      c: function c() {
        svg = svg_element("svg");
        path = svg_element("path");
        attr(path, "d", "M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z");
        attr(path, "fill",
        /*color*/
        ctx[2]);
        attr(svg, "width",
        /*width*/
        ctx[0]);
        attr(svg, "height",
        /*height*/
        ctx[1]);
        attr(svg, "viewBox",
        /*viewBox*/
        ctx[3]);
      },
      m: function m(target, anchor) {
        insert(target, svg, anchor);
        append(svg, path);
      },
      p: function p(ctx, _ref10) {
        var _ref11 = _slicedToArray(_ref10, 1),
            dirty = _ref11[0];

        if (dirty &
        /*color*/
        4) {
          attr(path, "fill",
          /*color*/
          ctx[2]);
        }

        if (dirty &
        /*width*/
        1) {
          attr(svg, "width",
          /*width*/
          ctx[0]);
        }

        if (dirty &
        /*height*/
        2) {
          attr(svg, "height",
          /*height*/
          ctx[1]);
        }

        if (dirty &
        /*viewBox*/
        8) {
          attr(svg, "viewBox",
          /*viewBox*/
          ctx[3]);
        }
      },
      i: noop$1,
      o: noop$1,
      d: function d(detaching) {
        if (detaching) detach(svg);
      }
    };
  }

  function instance$3($$self, $$props, $$invalidate) {
    var _$$props$size2 = $$props.size,
        size = _$$props$size2 === void 0 ? "1em" : _$$props$size2;
    var _$$props$width2 = $$props.width,
        width = _$$props$width2 === void 0 ? size : _$$props$width2;
    var _$$props$height2 = $$props.height,
        height = _$$props$height2 === void 0 ? size : _$$props$height2;
    var _$$props$color2 = $$props.color,
        color = _$$props$color2 === void 0 ? "currentColor" : _$$props$color2;
    var _$$props$viewBox2 = $$props.viewBox,
        viewBox = _$$props$viewBox2 === void 0 ? "0 0 24 24" : _$$props$viewBox2;

    $$self.$set = function ($$props) {
      if ("size" in $$props) $$invalidate(4, size = $$props.size);
      if ("width" in $$props) $$invalidate(0, width = $$props.width);
      if ("height" in $$props) $$invalidate(1, height = $$props.height);
      if ("color" in $$props) $$invalidate(2, color = $$props.color);
      if ("viewBox" in $$props) $$invalidate(3, viewBox = $$props.viewBox);
    };

    return [width, height, color, viewBox, size];
  }

  var CheckBold = /*#__PURE__*/function (_SvelteComponent4) {
    _inherits(CheckBold, _SvelteComponent4);

    var _super4 = _createSuper(CheckBold);

    function CheckBold(options) {
      var _this5;

      _classCallCheck(this, CheckBold);

      _this5 = _super4.call(this);
      init(_assertThisInitialized(_this5), options, instance$3, create_fragment$3, safe_not_equal, {
        size: 4,
        width: 0,
        height: 1,
        color: 2,
        viewBox: 3
      });
      return _this5;
    }

    return CheckBold;
  }(SvelteComponent);
  /* src/Tags.html generated by Svelte v3.20.1 */


  function get_each_context$1(ctx, list, i) {
    var child_ctx = ctx.slice();
    child_ctx[7] = list[i];
    child_ctx[9] = i;
    return child_ctx;
  } // (66:8) {#each tags as tag,i}


  function create_each_block$1(ctx) {
    var li;
    var t_value =
    /*tag*/
    ctx[7] + "";
    var t;
    var dispose;

    function click_handler() {
      var _ctx;

      for (var _len = arguments.length, args = new Array(_len), _key4 = 0; _key4 < _len; _key4++) {
        args[_key4] = arguments[_key4];
      }

      return (
        /*click_handler*/
        (_ctx = ctx)[5].apply(_ctx, [
        /*i*/
        ctx[9]].concat(args))
      );
    }

    return {
      c: function c() {
        li = element("li");
        t = text(t_value);
        attr(li, "class", "svelte-15h15fp");
      },
      m: function m(target, anchor, remount) {
        insert(target, li, anchor);
        append(li, t);
        if (remount) dispose();
        dispose = listen(li, "click", click_handler);
      },
      p: function p(new_ctx, dirty) {
        ctx = new_ctx;
        if (dirty &
        /*tags*/
        1 && t_value !== (t_value =
        /*tag*/
        ctx[7] + "")) set_data(t, t_value);
      },
      d: function d(detaching) {
        if (detaching) detach(li);
        dispose();
      }
    };
  }

  function create_fragment$4(ctx) {
    var div;
    var ul;
    var t;
    var input;
    var dispose;
    var each_value =
    /*tags*/
    ctx[0];
    var each_blocks = [];

    for (var i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    }

    return {
      c: function c() {
        div = element("div");
        ul = element("ul");

        for (var _i5 = 0; _i5 < each_blocks.length; _i5 += 1) {
          each_blocks[_i5].c();
        }

        t = space();
        input = element("input");
        attr(ul, "class", "tags-listing svelte-15h15fp");
        attr(input, "id",
        /*id*/
        ctx[1]);
        attr(input, "type", "text");
        attr(input, "class", "svelte-15h15fp");
        attr(div, "class", "tags-editor svelte-15h15fp");
      },
      m: function m(target, anchor, remount) {
        insert(target, div, anchor);
        append(div, ul);

        for (var _i6 = 0; _i6 < each_blocks.length; _i6 += 1) {
          each_blocks[_i6].m(ul, null);
        }

        append(div, t);
        append(div, input);
        set_input_value(input,
        /*value*/
        ctx[2]);
        if (remount) run_all(dispose);
        dispose = [listen(input, "input",
        /*input_input_handler*/
        ctx[6]), listen(input, "keydown",
        /*keyHandler*/
        ctx[4])];
      },
      p: function p(ctx, _ref12) {
        var _ref13 = _slicedToArray(_ref12, 1),
            dirty = _ref13[0];

        if (dirty &
        /*clearTag, tags*/
        9) {
          each_value =
          /*tags*/
          ctx[0];

          var _i7;

          for (_i7 = 0; _i7 < each_value.length; _i7 += 1) {
            var child_ctx = get_each_context$1(ctx, each_value, _i7);

            if (each_blocks[_i7]) {
              each_blocks[_i7].p(child_ctx, dirty);
            } else {
              each_blocks[_i7] = create_each_block$1(child_ctx);

              each_blocks[_i7].c();

              each_blocks[_i7].m(ul, null);
            }
          }

          for (; _i7 < each_blocks.length; _i7 += 1) {
            each_blocks[_i7].d(1);
          }

          each_blocks.length = each_value.length;
        }

        if (dirty &
        /*id*/
        2) {
          attr(input, "id",
          /*id*/
          ctx[1]);
        }

        if (dirty &
        /*value*/
        4 && input.value !==
        /*value*/
        ctx[2]) {
          set_input_value(input,
          /*value*/
          ctx[2]);
        }
      },
      i: noop$1,
      o: noop$1,
      d: function d(detaching) {
        if (detaching) detach(div);
        destroy_each(each_blocks, detaching);
        run_all(dispose);
      }
    };
  }

  function instance$4($$self, $$props, $$invalidate) {
    var id = $$props.id; // id for form elm

    var _$$props$tags = $$props.tags,
        tags = _$$props$tags === void 0 ? [] : _$$props$tags;
    var value = "";

    function clearTag(ind) {
      tags.splice(ind, 1);
      $$invalidate(0, tags);
    }

    function keyHandler(e) {
      var trimmed = value.trim(); // Confirm a tag on enter or comma

      if (trimmed.length > 0 && (e.keyCode === 13 || e.key === ",")) {
        tags.push(trimmed);
        $$invalidate(2, value = "");
        $$invalidate(0, tags);
        e.preventDefault();
      } else if (e.keyCode === 8 && value.length === 0) {
        tags.pop(); // Delete a tag with backspace

        $$invalidate(0, tags);
      } else if (e.key === ",") {
        e.preventDefault(); // Make commas invalid from within tags
      }
    }

    var click_handler = function click_handler(i, e) {
      return clearTag(i);
    };

    function input_input_handler() {
      value = this.value;
      $$invalidate(2, value);
    }

    $$self.$set = function ($$props) {
      if ("id" in $$props) $$invalidate(1, id = $$props.id);
      if ("tags" in $$props) $$invalidate(0, tags = $$props.tags);
    };

    return [tags, id, value, clearTag, keyHandler, click_handler, input_input_handler];
  }

  var Tags = /*#__PURE__*/function (_SvelteComponent5) {
    _inherits(Tags, _SvelteComponent5);

    var _super5 = _createSuper(Tags);

    function Tags(options) {
      var _this6;

      _classCallCheck(this, Tags);

      _this6 = _super5.call(this);
      init(_assertThisInitialized(_this6), options, instance$4, create_fragment$4, safe_not_equal, {
        id: 1,
        tags: 0
      });
      return _this6;
    }

    return Tags;
  }(SvelteComponent);
  /* src/Permissions.html generated by Svelte v3.20.1 */


  function create_fragment$5(ctx) {
    var select;
    var option0;
    var option1;
    var dispose;
    return {
      c: function c() {
        select = element("select");
        option0 = element("option");
        option0.textContent = "Only Me";
        option1 = element("option");
        option1.textContent = "Public";
        option0.__value = "0";
        option0.value = option0.__value;
        option1.__value = "1";
        option1.value = option1.__value;
        attr(select, "id",
        /*id*/
        ctx[0]);
        if (
        /*selectValue*/
        ctx[1] === void 0) add_render_callback(function () {
          return (
            /*select_change_handler*/
            ctx[4].call(select)
          );
        });
      },
      m: function m(target, anchor, remount) {
        insert(target, select, anchor);
        append(select, option0);
        append(select, option1);
        select_option(select,
        /*selectValue*/
        ctx[1]);
        if (remount) run_all(dispose);
        dispose = [listen(select, "change",
        /*select_change_handler*/
        ctx[4]), listen(select, "change",
        /*selectValueChanged*/
        ctx[2])];
      },
      p: function p(ctx, _ref14) {
        var _ref15 = _slicedToArray(_ref14, 1),
            dirty = _ref15[0];

        if (dirty &
        /*id*/
        1) {
          attr(select, "id",
          /*id*/
          ctx[0]);
        }

        if (dirty &
        /*selectValue*/
        2) {
          select_option(select,
          /*selectValue*/
          ctx[1]);
        }
      },
      i: noop$1,
      o: noop$1,
      d: function d(detaching) {
        if (detaching) detach(select);
        run_all(dispose);
      }
    };
  }

  function instance$5($$self, $$props, $$invalidate) {
    var value = $$props.value;
    var id = $$props.id;
    var selectValue = "0";

    function selectValueChanged() {
      $$invalidate(3, value = parseInt(selectValue));
    }

    function select_change_handler() {
      selectValue = select_value(this);
      $$invalidate(1, selectValue), $$invalidate(3, value);
    }

    $$self.$set = function ($$props) {
      if ("value" in $$props) $$invalidate(3, value = $$props.value);
      if ("id" in $$props) $$invalidate(0, id = $$props.id);
    };

    $$self.$$.update = function () {
      if ($$self.$$.dirty &
      /*value*/
      8) {
        if (value !== null && value !== undefined) {
          $$invalidate(1, selectValue = String(value));
        }
      }
    };

    return [id, selectValue, selectValueChanged, value, select_change_handler];
  }

  var Permissions = /*#__PURE__*/function (_SvelteComponent6) {
    _inherits(Permissions, _SvelteComponent6);

    var _super6 = _createSuper(Permissions);

    function Permissions(options) {
      var _this7;

      _classCallCheck(this, Permissions);

      _this7 = _super6.call(this);
      init(_assertThisInitialized(_this7), options, instance$5, create_fragment$5, safe_not_equal, {
        value: 3,
        id: 0
      });
      return _this7;
    }

    return Permissions;
  }(SvelteComponent);

  function noop$2() {}

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
    return a != a ? b == b : a !== b || a && _typeof(a) === 'object' || typeof a === 'function';
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

  function attr$1(node, attribute, value) {
    if (value == null) node.removeAttribute(attribute);else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
  }

  function children$1(element) {
    return Array.from(element.childNodes);
  }

  function set_style(node, key, value, important) {
    node.style.setProperty(key, value, important ? 'important' : '');
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
    if (flushing$1) return;
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

      while (binding_callbacks$1.length) {
        binding_callbacks$1.pop()();
      } // then, once components are updated, call
      // afterUpdate functions. This may cause
      // subsequent updates...


      for (var _i8 = 0; _i8 < render_callbacks$1.length; _i8 += 1) {
        var callback = render_callbacks$1[_i8];

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

  var outroing$1 = new Set();

  function transition_in$1(block, local) {
    if (block && block.i) {
      outroing$1["delete"](block);
      block.i(local);
    }
  }

  function mount_component$1(component, target, anchor) {
    var _component$$$2 = component.$$,
        fragment = _component$$$2.fragment,
        on_mount = _component$$$2.on_mount,
        on_destroy = _component$$$2.on_destroy,
        after_update = _component$$$2.after_update;
    fragment && fragment.m(target, anchor); // onMount happens before the initial afterUpdate

    add_render_callback$1(function () {
      var new_on_destroy = on_mount.map(run$1).filter(is_function$1);

      if (on_destroy) {
        on_destroy.push.apply(on_destroy, _toConsumableArray(new_on_destroy));
      } else {
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
      $$.fragment && $$.fragment.d(detaching); // TODO null out other refs, including component.$$ (but need to
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

    component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
  }

  function init$1(component, options, instance, create_fragment, not_equal, props) {
    var dirty = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : [-1];
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
      dirty: dirty
    };
    var ready = false;
    $$.ctx = instance ? instance(component, prop_values, function (i, ret) {
      var value = (arguments.length <= 2 ? 0 : arguments.length - 2) ? arguments.length <= 2 ? undefined : arguments[2] : ret;

      if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
        if ($$.bound[i]) $$.bound[i](value);
        if (ready) make_dirty$1(component, i);
      }

      return ret;
    }) : [];
    $$.update();
    ready = true;
    run_all$1($$.before_update); // `false` as a special case of no DOM component

    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;

    if (options.target) {
      if (options.hydrate) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        $$.fragment && $$.fragment.l(children$1(options.target));
      } else {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        $$.fragment && $$.fragment.c();
      }

      if (options.intro) transition_in$1(component.$$.fragment);
      mount_component$1(component, options.target, options.anchor);
      flush$1();
    }

    set_current_component$1(parent_component);
  }

  var SvelteComponent$1 = /*#__PURE__*/function () {
    function SvelteComponent$1() {
      _classCallCheck(this, SvelteComponent$1);
    }

    _createClass(SvelteComponent$1, [{
      key: "$destroy",
      value: function $destroy() {
        destroy_component$1(this, 1);
        this.$destroy = noop$2;
      }
    }, {
      key: "$on",
      value: function $on(type, callback) {
        var callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
        callbacks.push(callback);
        return function () {
          var index = callbacks.indexOf(callback);
          if (index !== -1) callbacks.splice(index, 1);
        };
      }
    }, {
      key: "$set",
      value: function $set() {// overridden by instance, if it has props
      }
    }]);

    return SvelteComponent$1;
  }();
  /* src\Circle.svelte generated by Svelte v3.19.2 */


  function add_css() {
    var style = element$1("style");
    style.id = "svelte-cm45hh-style";
    style.textContent = ".circle.svelte-cm45hh{height:var(--size);width:var(--size);border-color:var(--color) transparent var(--color) var(--color);border-width:calc(var(--size) / 15);border-style:solid;border-image:initial;border-radius:50%;animation:0.75s linear 0s infinite normal none running svelte-cm45hh-rotate}@keyframes svelte-cm45hh-rotate{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}";
    append$1(document.head, style);
  }

  function create_fragment$6(ctx) {
    var div;
    return {
      c: function c() {
        div = element$1("div");
        attr$1(div, "class", "circle svelte-cm45hh");
        set_style(div, "--size",
        /*size*/
        ctx[0] +
        /*unit*/
        ctx[2]);
        set_style(div, "--color",
        /*color*/
        ctx[1]);
      },
      m: function m(target, anchor) {
        insert$1(target, div, anchor);
      },
      p: function p(ctx, _ref16) {
        var _ref17 = _slicedToArray(_ref16, 1),
            dirty = _ref17[0];

        if (dirty &
        /*size, unit*/
        5) {
          set_style(div, "--size",
          /*size*/
          ctx[0] +
          /*unit*/
          ctx[2]);
        }

        if (dirty &
        /*color*/
        2) {
          set_style(div, "--color",
          /*color*/
          ctx[1]);
        }
      },
      i: noop$2,
      o: noop$2,
      d: function d(detaching) {
        if (detaching) detach$1(div);
      }
    };
  }

  function instance$6($$self, $$props, $$invalidate) {
    var _$$props$size3 = $$props.size,
        size = _$$props$size3 === void 0 ? 60 : _$$props$size3;
    var _$$props$color3 = $$props.color,
        color = _$$props$color3 === void 0 ? "#FF3E00" : _$$props$color3;
    var _$$props$unit = $$props.unit,
        unit = _$$props$unit === void 0 ? "px" : _$$props$unit;

    $$self.$set = function ($$props) {
      if ("size" in $$props) $$invalidate(0, size = $$props.size);
      if ("color" in $$props) $$invalidate(1, color = $$props.color);
      if ("unit" in $$props) $$invalidate(2, unit = $$props.unit);
    };

    return [size, color, unit];
  }

  var Circle = /*#__PURE__*/function (_SvelteComponent$) {
    _inherits(Circle, _SvelteComponent$);

    var _super7 = _createSuper(Circle);

    function Circle(options) {
      var _this8;

      _classCallCheck(this, Circle);

      _this8 = _super7.call(this);
      if (!document.getElementById("svelte-cm45hh-style")) add_css();
      init$1(_assertThisInitialized(_this8), options, instance$6, create_fragment$6, safe_not_equal$1, {
        size: 0,
        color: 1,
        unit: 2
      });
      return _this8;
    }

    return Circle;
  }(SvelteComponent$1);
  /* src/Handle.html generated by Svelte v3.20.1 */


  function create_if_block$1(ctx) {
    var await_block_anchor;
    var promise;
    var current;
    var info = {
      ctx: ctx,
      current: null,
      token: null,
      pending: create_pending_block$1,
      then: create_then_block$1,
      "catch": create_catch_block$1,
      value: 14,
      blocks: [,,,]
    };
    handle_promise(promise =
    /*exists*/
    ctx[5], info);
    return {
      c: function c() {
        await_block_anchor = empty();
        info.block.c();
      },
      m: function m(target, anchor) {
        insert(target, await_block_anchor, anchor);
        info.block.m(target, info.anchor = anchor);

        info.mount = function () {
          return await_block_anchor.parentNode;
        };

        info.anchor = await_block_anchor;
        current = true;
      },
      p: function p(new_ctx, dirty) {
        ctx = new_ctx;
        info.ctx = ctx;
        if (dirty &
        /*exists*/
        32 && promise !== (promise =
        /*exists*/
        ctx[5]) && handle_promise(promise, info)) ;else {
          var child_ctx = ctx.slice();
          child_ctx[14] = info.resolved;
          info.block.p(child_ctx, dirty);
        }
      },
      i: function i(local) {
        if (current) return;
        transition_in(info.block);
        current = true;
      },
      o: function o(local) {
        for (var i = 0; i < 3; i += 1) {
          var _block2 = info.blocks[i];
          transition_out(_block2);
        }

        current = false;
      },
      d: function d(detaching) {
        if (detaching) detach(await_block_anchor);
        info.block.d(detaching);
        info.token = null;
        info = null;
      }
    };
  } // (1:0) <script>     import Alert from "svelte-material-icons/Alert.svelte";     import CheckBold from "svelte-material-icons/CheckBold.svelte";     import { Circle }


  function create_catch_block$1(ctx) {
    return {
      c: noop$1,
      m: noop$1,
      p: noop$1,
      i: noop$1,
      o: noop$1,
      d: noop$1
    };
  } // (67:0) {:then does_exist}


  function create_then_block$1(ctx) {
    var current_block_type_index;
    var if_block;
    var if_block_anchor;
    var current;
    var if_block_creators = [create_if_block_1$1, create_else_block$1];
    var if_blocks = [];

    function select_block_type(ctx, dirty) {
      if (
      /*does_exist*/
      ctx[14]) return 0;
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
        if (current) return;
        transition_in(if_block);
        current = true;
      },
      o: function o(local) {
        transition_out(if_block);
        current = false;
      },
      d: function d(detaching) {
        if_blocks[current_block_type_index].d(detaching);
        if (detaching) detach(if_block_anchor);
      }
    };
  } // (72:0) {:else}


  function create_else_block$1(ctx) {
    var span;
    var current;
    var checkbold = new CheckBold({
      props: {
        size:
        /*iconSize*/
        ctx[2],
        color:
        /*checkColor*/
        ctx[4]
      }
    });
    return {
      c: function c() {
        span = element("span");
        create_component(checkbold.$$.fragment);
        attr(span, "title", "This handle is unique");
        attr(span, "class", "svelte-543zdb");
      },
      m: function m(target, anchor) {
        insert(target, span, anchor);
        mount_component(checkbold, span, null);
        current = true;
      },
      p: function p(ctx, dirty) {
        var checkbold_changes = {};
        if (dirty &
        /*iconSize*/
        4) checkbold_changes.size =
        /*iconSize*/
        ctx[2];
        if (dirty &
        /*checkColor*/
        16) checkbold_changes.color =
        /*checkColor*/
        ctx[4];
        checkbold.$set(checkbold_changes);
      },
      i: function i(local) {
        if (current) return;
        transition_in(checkbold.$$.fragment, local);
        current = true;
      },
      o: function o(local) {
        transition_out(checkbold.$$.fragment, local);
        current = false;
      },
      d: function d(detaching) {
        if (detaching) detach(span);
        destroy_component(checkbold);
      }
    };
  } // (68:0) {#if does_exist}


  function create_if_block_1$1(ctx) {
    var span;
    var current;
    var alert = new Alert({
      props: {
        size:
        /*iconSize*/
        ctx[2],
        color:
        /*alertColor*/
        ctx[3]
      }
    });
    return {
      c: function c() {
        span = element("span");
        create_component(alert.$$.fragment);
        attr(span, "title", "This handle already exists in the system");
        attr(span, "class", "svelte-543zdb");
      },
      m: function m(target, anchor) {
        insert(target, span, anchor);
        mount_component(alert, span, null);
        current = true;
      },
      p: function p(ctx, dirty) {
        var alert_changes = {};
        if (dirty &
        /*iconSize*/
        4) alert_changes.size =
        /*iconSize*/
        ctx[2];
        if (dirty &
        /*alertColor*/
        8) alert_changes.color =
        /*alertColor*/
        ctx[3];
        alert.$set(alert_changes);
      },
      i: function i(local) {
        if (current) return;
        transition_in(alert.$$.fragment, local);
        current = true;
      },
      o: function o(local) {
        transition_out(alert.$$.fragment, local);
        current = false;
      },
      d: function d(detaching) {
        if (detaching) detach(span);
        destroy_component(alert);
      }
    };
  } // (63:15)  <span title="Checking if handle is unique...">     <Circle color="var(--accent-color-1)" size={iconSize}


  function create_pending_block$1(ctx) {
    var span;
    var current;
    var circle = new Circle({
      props: {
        color: "var(--accent-color-1)",
        size:
        /*iconSize*/
        ctx[2]
      }
    });
    return {
      c: function c() {
        span = element("span");
        create_component(circle.$$.fragment);
        attr(span, "title", "Checking if handle is unique...");
        attr(span, "class", "svelte-543zdb");
      },
      m: function m(target, anchor) {
        insert(target, span, anchor);
        mount_component(circle, span, null);
        current = true;
      },
      p: function p(ctx, dirty) {
        var circle_changes = {};
        if (dirty &
        /*iconSize*/
        4) circle_changes.size =
        /*iconSize*/
        ctx[2];
        circle.$set(circle_changes);
      },
      i: function i(local) {
        if (current) return;
        transition_in(circle.$$.fragment, local);
        current = true;
      },
      o: function o(local) {
        transition_out(circle.$$.fragment, local);
        current = false;
      },
      d: function d(detaching) {
        if (detaching) detach(span);
        destroy_component(circle);
      }
    };
  }

  function create_fragment$7(ctx) {
    var input_1;
    var t;
    var if_block_anchor;
    var current;
    var dispose;
    var if_block =
    /*value*/
    ctx[0] &&
    /*value*/
    ctx[0].length > 0 &&
    /*value*/
    ctx[0] !==
    /*initialValue*/
    ctx[6] && create_if_block$1(ctx);
    return {
      c: function c() {
        input_1 = element("input");
        t = space();
        if (if_block) if_block.c();
        if_block_anchor = empty();
        attr(input_1, "id",
        /*id*/
        ctx[1]);
        attr(input_1, "type", "text");
        attr(input_1, "pattern", "[a-z0-9_-]+");
      },
      m: function m(target, anchor, remount) {
        insert(target, input_1, anchor);
        set_input_value(input_1,
        /*value*/
        ctx[0]);
        insert(target, t, anchor);
        if (if_block) if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
        current = true;
        if (remount) run_all(dispose);
        dispose = [listen(input_1, "input",
        /*input_1_input_handler*/
        ctx[13]), listen(input_1, "keyup",
        /*keyupHandler*/
        ctx[7])];
      },
      p: function p(ctx, _ref18) {
        var _ref19 = _slicedToArray(_ref18, 1),
            dirty = _ref19[0];

        if (!current || dirty &
        /*id*/
        2) {
          attr(input_1, "id",
          /*id*/
          ctx[1]);
        }

        if (dirty &
        /*value*/
        1 && input_1.value !==
        /*value*/
        ctx[0]) {
          set_input_value(input_1,
          /*value*/
          ctx[0]);
        }

        if (
        /*value*/
        ctx[0] &&
        /*value*/
        ctx[0].length > 0 &&
        /*value*/
        ctx[0] !==
        /*initialValue*/
        ctx[6]) {
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
        if (current) return;
        transition_in(if_block);
        current = true;
      },
      o: function o(local) {
        transition_out(if_block);
        current = false;
      },
      d: function d(detaching) {
        if (detaching) detach(input_1);
        if (detaching) detach(t);
        if (if_block) if_block.d(detaching);
        if (detaching) detach(if_block_anchor);
        run_all(dispose);
      }
    };
  }

  var api = "/api/v1";
  var maxInterval = 500;

  function instance$7($$self, $$props, $$invalidate) {
    var id = $$props.id;
    var itemUrl = $$props.itemUrl;
    var _$$props$input = $$props.input,
        input = _$$props$input === void 0 ? "" : _$$props$input;
    var _$$props$value = $$props.value,
        value = _$$props$value === void 0 ? "" : _$$props$value;
    var _$$props$iconSize = $$props.iconSize,
        iconSize = _$$props$iconSize === void 0 ? 12 : _$$props$iconSize;
    var _$$props$alertColor = $$props.alertColor,
        alertColor = _$$props$alertColor === void 0 ? "#f80" : _$$props$alertColor;
    var _$$props$checkColor = $$props.checkColor,
        checkColor = _$$props$checkColor === void 0 ? "#080" : _$$props$checkColor;
    var initialValue = value;
    var timer;
    var changed = value.length > 0;
    var exists = Promise.resolve(false);

    function processInput(txt) {
      var v0 = txt.toLowerCase().replace(/[^a-z0-9_-]/g, "-").replace(/[-]+/g, "-");

      if (v0 && v0.length > 0) {
        $$invalidate(5, exists = new Promise(function (resolve, reject) {
          if (timer) {
            clearTimeout(timer);
          }

          timer = setTimeout(function () {
            fetch("".concat(api, "/").concat(itemUrl, "/exists/").concat(v0)).then(function (res) {
              return resolve(res.ok);
            });
          }, maxInterval);
        }));
      }

      return v0;
    }

    function keyupHandler(e) {
      $$invalidate(11, changed = true);
      $$invalidate(0, value = processInput(value));
    }

    function input_1_input_handler() {
      value = this.value;
      ($$invalidate(0, value), $$invalidate(11, changed)), $$invalidate(9, input);
    }

    $$self.$set = function ($$props) {
      if ("id" in $$props) $$invalidate(1, id = $$props.id);
      if ("itemUrl" in $$props) $$invalidate(8, itemUrl = $$props.itemUrl);
      if ("input" in $$props) $$invalidate(9, input = $$props.input);
      if ("value" in $$props) $$invalidate(0, value = $$props.value);
      if ("iconSize" in $$props) $$invalidate(2, iconSize = $$props.iconSize);
      if ("alertColor" in $$props) $$invalidate(3, alertColor = $$props.alertColor);
      if ("checkColor" in $$props) $$invalidate(4, checkColor = $$props.checkColor);
    };

    $$self.$$.update = function () {
      if ($$self.$$.dirty &
      /*changed, input*/
      2560) {
        if (!changed) {
          $$invalidate(0, value = processInput(input).replace(/(^[-]+|[-]+$)/g, ""));
        }
      }
    };

    return [value, id, iconSize, alertColor, checkColor, exists, initialValue, keyupHandler, itemUrl, input, timer, changed, processInput, input_1_input_handler];
  }

  var Handle = /*#__PURE__*/function (_SvelteComponent7) {
    _inherits(Handle, _SvelteComponent7);

    var _super8 = _createSuper(Handle);

    function Handle(options) {
      var _this9;

      _classCallCheck(this, Handle);

      _this9 = _super8.call(this);
      init(_assertThisInitialized(_this9), options, instance$7, create_fragment$7, safe_not_equal, {
        id: 1,
        itemUrl: 8,
        input: 9,
        value: 0,
        iconSize: 2,
        alertColor: 3,
        checkColor: 4
      });
      return _this9;
    }

    return Handle;
  }(SvelteComponent);
  /* src/UserGalleryCreate.html generated by Svelte v3.20.1 */


  function get_each_context$2(ctx, list, i) {
    var child_ctx = ctx.slice();
    child_ctx[30] = list[i];
    return child_ctx;
  } // (226:8) {:catch err}


  function create_catch_block$2(ctx) {
    var p;
    var t_value =
    /*err*/
    ctx[33].message + "";
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
        if (dirty[0] &
        /*galleryResult*/
        32 && t_value !== (t_value =
        /*err*/
        ctx[33].message + "")) set_data(t, t_value);
      },
      i: noop$1,
      o: noop$1,
      d: function d(detaching) {
        if (detaching) detach(p);
      }
    };
  } // (200:8) {:then}


  function create_then_block$2(ctx) {
    var div0;
    var label0;
    var t0;
    var label0_for_value;
    var t1;
    var input0;
    var input0_id_value;
    var t2;
    var div1;
    var label1;
    var t3;
    var label1_for_value;
    var t4;
    var input1;
    var input1_id_value;
    var t5;
    var div2;
    var label2;
    var t6;
    var label2_for_value;
    var t7;
    var updating_input;
    var updating_value;
    var t8;
    var div3;
    var label3;
    var t9;
    var label3_for_value;
    var t10;
    var updating_tags;
    var t11;
    var div4;
    var label4;
    var t12;
    var label4_for_value;
    var t13;
    var updating_value_1;
    var t14;
    var if_block_anchor;
    var current;
    var dispose;

    function handle_input_binding(value) {
      /*handle_input_binding*/
      ctx[18].call(null, value);
    }

    function handle_value_binding(value) {
      /*handle_value_binding*/
      ctx[19].call(null, value);
    }

    var handle_props = {
      id: "gallery-url-" +
      /*uniqueId*/
      ctx[29],
      itemUrl: "galleries"
    };

    if (
    /*galleryInfo*/
    ctx[6].name !== void 0) {
      handle_props.input =
      /*galleryInfo*/
      ctx[6].name;
    }

    if (
    /*userGalleryInfo*/
    ctx[7].url !== void 0) {
      handle_props.value =
      /*userGalleryInfo*/
      ctx[7].url;
    }

    var handle = new Handle({
      props: handle_props
    });
    binding_callbacks.push(function () {
      return bind$1(handle, "input", handle_input_binding);
    });
    binding_callbacks.push(function () {
      return bind$1(handle, "value", handle_value_binding);
    });

    function tags_1_tags_binding(value) {
      /*tags_1_tags_binding*/
      ctx[20].call(null, value);
    }

    var tags_1_props = {
      id: "gallery-tags-" +
      /*uniqueId*/
      ctx[29]
    };

    if (
    /*tags*/
    ctx[10] !== void 0) {
      tags_1_props.tags =
      /*tags*/
      ctx[10];
    }

    var tags_1 = new Tags({
      props: tags_1_props
    });
    binding_callbacks.push(function () {
      return bind$1(tags_1, "tags", tags_1_tags_binding);
    });

    function permissions_value_binding(value) {
      /*permissions_value_binding*/
      ctx[21].call(null, value);
    }

    var permissions_props = {
      id: "gallery-permissions-" +
      /*uniqueId*/
      ctx[29]
    };

    if (
    /*userGalleryInfo*/
    ctx[7].permissions !== void 0) {
      permissions_props.value =
      /*userGalleryInfo*/
      ctx[7].permissions;
    }

    var permissions = new Permissions({
      props: permissions_props
    });
    binding_callbacks.push(function () {
      return bind$1(permissions, "value", permissions_value_binding);
    });

    function select_block_type(ctx, dirty) {
      if (
      /*galleryId*/
      ctx[0]) return create_if_block_5$1;
      return create_else_block_1$1;
    }

    var current_block_type = select_block_type(ctx);
    var if_block = current_block_type(ctx);
    return {
      c: function c() {
        div0 = element("div");
        label0 = element("label");
        t0 = text("Name");
        t1 = space();
        input0 = element("input");
        t2 = space();
        div1 = element("div");
        label1 = element("label");
        t3 = text("Description");
        t4 = space();
        input1 = element("input");
        t5 = space();
        div2 = element("div");
        label2 = element("label");
        t6 = text("Url");
        t7 = space();
        create_component(handle.$$.fragment);
        t8 = space();
        div3 = element("div");
        label3 = element("label");
        t9 = text("Tags");
        t10 = space();
        create_component(tags_1.$$.fragment);
        t11 = space();
        div4 = element("div");
        label4 = element("label");
        t12 = text("Permissions");
        t13 = space();
        create_component(permissions.$$.fragment);
        t14 = space();
        if_block.c();
        if_block_anchor = empty();
        attr(label0, "for", label0_for_value = "gallery-name-" +
        /*uniqueId*/
        ctx[29]);
        attr(input0, "id", input0_id_value = "gallery-name-" +
        /*uniqueId*/
        ctx[29]);
        attr(input0, "type", "text");
        attr(label1, "for", label1_for_value = "gallery-description-" +
        /*uniqueId*/
        ctx[29]);
        attr(input1, "id", input1_id_value = "gallery-description-" +
        /*uniqueId*/
        ctx[29]);
        attr(input1, "type", "text");
        attr(label2, "for", label2_for_value = "gallery-url-" +
        /*uniqueId*/
        ctx[29]);
        attr(label3, "for", label3_for_value = "gallery-tags-" +
        /*uniqueId*/
        ctx[29]);
        attr(label4, "for", label4_for_value = "gallery-permissions-" +
        /*uniqueId*/
        ctx[29]);
      },
      m: function m(target, anchor, remount) {
        insert(target, div0, anchor);
        append(div0, label0);
        append(label0, t0);
        append(div0, t1);
        append(div0, input0);
        set_input_value(input0,
        /*galleryInfo*/
        ctx[6].name);
        insert(target, t2, anchor);
        insert(target, div1, anchor);
        append(div1, label1);
        append(label1, t3);
        append(div1, t4);
        append(div1, input1);
        set_input_value(input1,
        /*galleryInfo*/
        ctx[6].description);
        insert(target, t5, anchor);
        insert(target, div2, anchor);
        append(div2, label2);
        append(label2, t6);
        append(div2, t7);
        mount_component(handle, div2, null);
        insert(target, t8, anchor);
        insert(target, div3, anchor);
        append(div3, label3);
        append(label3, t9);
        append(div3, t10);
        mount_component(tags_1, div3, null);
        insert(target, t11, anchor);
        insert(target, div4, anchor);
        append(div4, label4);
        append(label4, t12);
        append(div4, t13);
        mount_component(permissions, div4, null);
        insert(target, t14, anchor);
        if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
        current = true;
        if (remount) run_all(dispose);
        dispose = [listen(input0, "input",
        /*input0_input_handler*/
        ctx[16]), listen(input1, "input",
        /*input1_input_handler*/
        ctx[17])];
      },
      p: function p(ctx, dirty) {
        if (!current || dirty[0] &
        /*uniqueId*/
        536870912 && label0_for_value !== (label0_for_value = "gallery-name-" +
        /*uniqueId*/
        ctx[29])) {
          attr(label0, "for", label0_for_value);
        }

        if (!current || dirty[0] &
        /*uniqueId*/
        536870912 && input0_id_value !== (input0_id_value = "gallery-name-" +
        /*uniqueId*/
        ctx[29])) {
          attr(input0, "id", input0_id_value);
        }

        if (dirty[0] &
        /*galleryInfo*/
        64 && input0.value !==
        /*galleryInfo*/
        ctx[6].name) {
          set_input_value(input0,
          /*galleryInfo*/
          ctx[6].name);
        }

        if (!current || dirty[0] &
        /*uniqueId*/
        536870912 && label1_for_value !== (label1_for_value = "gallery-description-" +
        /*uniqueId*/
        ctx[29])) {
          attr(label1, "for", label1_for_value);
        }

        if (!current || dirty[0] &
        /*uniqueId*/
        536870912 && input1_id_value !== (input1_id_value = "gallery-description-" +
        /*uniqueId*/
        ctx[29])) {
          attr(input1, "id", input1_id_value);
        }

        if (dirty[0] &
        /*galleryInfo*/
        64 && input1.value !==
        /*galleryInfo*/
        ctx[6].description) {
          set_input_value(input1,
          /*galleryInfo*/
          ctx[6].description);
        }

        if (!current || dirty[0] &
        /*uniqueId*/
        536870912 && label2_for_value !== (label2_for_value = "gallery-url-" +
        /*uniqueId*/
        ctx[29])) {
          attr(label2, "for", label2_for_value);
        }

        var handle_changes = {};
        if (dirty[0] &
        /*uniqueId*/
        536870912) handle_changes.id = "gallery-url-" +
        /*uniqueId*/
        ctx[29];

        if (!updating_input && dirty[0] &
        /*galleryInfo*/
        64) {
          updating_input = true;
          handle_changes.input =
          /*galleryInfo*/
          ctx[6].name;
          add_flush_callback(function () {
            return updating_input = false;
          });
        }

        if (!updating_value && dirty[0] &
        /*userGalleryInfo*/
        128) {
          updating_value = true;
          handle_changes.value =
          /*userGalleryInfo*/
          ctx[7].url;
          add_flush_callback(function () {
            return updating_value = false;
          });
        }

        handle.$set(handle_changes);

        if (!current || dirty[0] &
        /*uniqueId*/
        536870912 && label3_for_value !== (label3_for_value = "gallery-tags-" +
        /*uniqueId*/
        ctx[29])) {
          attr(label3, "for", label3_for_value);
        }

        var tags_1_changes = {};
        if (dirty[0] &
        /*uniqueId*/
        536870912) tags_1_changes.id = "gallery-tags-" +
        /*uniqueId*/
        ctx[29];

        if (!updating_tags && dirty[0] &
        /*tags*/
        1024) {
          updating_tags = true;
          tags_1_changes.tags =
          /*tags*/
          ctx[10];
          add_flush_callback(function () {
            return updating_tags = false;
          });
        }

        tags_1.$set(tags_1_changes);

        if (!current || dirty[0] &
        /*uniqueId*/
        536870912 && label4_for_value !== (label4_for_value = "gallery-permissions-" +
        /*uniqueId*/
        ctx[29])) {
          attr(label4, "for", label4_for_value);
        }

        var permissions_changes = {};
        if (dirty[0] &
        /*uniqueId*/
        536870912) permissions_changes.id = "gallery-permissions-" +
        /*uniqueId*/
        ctx[29];

        if (!updating_value_1 && dirty[0] &
        /*userGalleryInfo*/
        128) {
          updating_value_1 = true;
          permissions_changes.value =
          /*userGalleryInfo*/
          ctx[7].permissions;
          add_flush_callback(function () {
            return updating_value_1 = false;
          });
        }

        permissions.$set(permissions_changes);

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
      i: function i(local) {
        if (current) return;
        transition_in(handle.$$.fragment, local);
        transition_in(tags_1.$$.fragment, local);
        transition_in(permissions.$$.fragment, local);
        current = true;
      },
      o: function o(local) {
        transition_out(handle.$$.fragment, local);
        transition_out(tags_1.$$.fragment, local);
        transition_out(permissions.$$.fragment, local);
        current = false;
      },
      d: function d(detaching) {
        if (detaching) detach(div0);
        if (detaching) detach(t2);
        if (detaching) detach(div1);
        if (detaching) detach(t5);
        if (detaching) detach(div2);
        destroy_component(handle);
        if (detaching) detach(t8);
        if (detaching) detach(div3);
        destroy_component(tags_1);
        if (detaching) detach(t11);
        if (detaching) detach(div4);
        destroy_component(permissions);
        if (detaching) detach(t14);
        if_block.d(detaching);
        if (detaching) detach(if_block_anchor);
        run_all(dispose);
      }
    };
  } // (223:8) {:else}


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
        button.disabled = button_disabled_value = !galleryIsValid$1(
        /*galleryInfo*/
        ctx[6]);
      },
      m: function m(target, anchor, remount) {
        insert(target, button, anchor);
        append(button, t);
        if (remount) dispose();
        dispose = listen(button, "click",
        /*addGallery*/
        ctx[12]);
      },
      p: function p(ctx, dirty) {
        if (dirty[0] &
        /*galleryInfo*/
        64 && button_disabled_value !== (button_disabled_value = !galleryIsValid$1(
        /*galleryInfo*/
        ctx[6]))) {
          button.disabled = button_disabled_value;
        }
      },
      d: function d(detaching) {
        if (detaching) detach(button);
        dispose();
      }
    };
  } // (221:8) {#if galleryId}


  function create_if_block_5$1(ctx) {
    var button;
    var t;
    var button_disabled_value;
    var dispose;
    return {
      c: function c() {
        button = element("button");
        t = text("Update Gallery");
        attr(button, "type", "button");
        button.disabled = button_disabled_value = !galleryIsValid$1(
        /*galleryInfo*/
        ctx[6]);
      },
      m: function m(target, anchor, remount) {
        insert(target, button, anchor);
        append(button, t);
        if (remount) dispose();
        dispose = listen(button, "click",
        /*updateGallery*/
        ctx[13]);
      },
      p: function p(ctx, dirty) {
        if (dirty[0] &
        /*galleryInfo*/
        64 && button_disabled_value !== (button_disabled_value = !galleryIsValid$1(
        /*galleryInfo*/
        ctx[6]))) {
          button.disabled = button_disabled_value;
        }
      },
      d: function d(detaching) {
        if (detaching) detach(button);
        dispose();
      }
    };
  } // (198:30)          <p>Submitting...</p>         {:then}


  function create_pending_block$2(ctx) {
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
      i: noop$1,
      o: noop$1,
      d: function d(detaching) {
        if (detaching) detach(p);
      }
    };
  } // (230:4) {#if galleryId}


  function create_if_block$2(ctx) {
    var t0;
    var fieldset;
    var legend;
    var t2;
    var div0;
    var label0;
    var t3;
    var label0_for_value;
    var t4;
    var input0;
    var input0_id_value;
    var t5;
    var div1;
    var label1;
    var t6;
    var label1_for_value;
    var t7;
    var input1;
    var input1_id_value;
    var t8;
    var div2;
    var label2;
    var t9;
    var label2_for_value;
    var t10;
    var updating_input;
    var updating_value;
    var t11;
    var div3;
    var label3;
    var t12;
    var label3_for_value;
    var t13;
    var updating_value_1;
    var t14;
    var div4;
    var label4;
    var t15;
    var label4_for_value;
    var t16;
    var input2;
    var input2_id_value;
    var t17;
    var button;
    var t18;
    var button_disabled_value;
    var current;
    var dispose;
    var if_block =
    /*items*/
    ctx[4] &&
    /*items*/
    ctx[4].length > 0 && create_if_block_1$2(ctx);

    function handle_input_binding_1(value) {
      /*handle_input_binding_1*/
      ctx[24].call(null, value);
    }

    function handle_value_binding_1(value) {
      /*handle_value_binding_1*/
      ctx[25].call(null, value);
    }

    var handle_props = {
      id: "gallery-item-url-" +
      /*uniqueId*/
      ctx[29],
      itemUrl: "galleries/items"
    };

    if (
    /*itemInfo*/
    ctx[8].name !== void 0) {
      handle_props.input =
      /*itemInfo*/
      ctx[8].name;
    }

    if (
    /*userItemInfo*/
    ctx[9].url !== void 0) {
      handle_props.value =
      /*userItemInfo*/
      ctx[9].url;
    }

    var handle = new Handle({
      props: handle_props
    });
    binding_callbacks.push(function () {
      return bind$1(handle, "input", handle_input_binding_1);
    });
    binding_callbacks.push(function () {
      return bind$1(handle, "value", handle_value_binding_1);
    });

    function permissions_value_binding_1(value) {
      /*permissions_value_binding_1*/
      ctx[26].call(null, value);
    }

    var permissions_props = {
      id: "gallery-item-permissions-" +
      /*uniqueId*/
      ctx[29]
    };

    if (
    /*userItemInfo*/
    ctx[9].permissions !== void 0) {
      permissions_props.value =
      /*userItemInfo*/
      ctx[9].permissions;
    }

    var permissions = new Permissions({
      props: permissions_props
    });
    binding_callbacks.push(function () {
      return bind$1(permissions, "value", permissions_value_binding_1);
    });
    return {
      c: function c() {
        if (if_block) if_block.c();
        t0 = space();
        fieldset = element("fieldset");
        legend = element("legend");
        legend.textContent = "New Item";
        t2 = space();
        div0 = element("div");
        label0 = element("label");
        t3 = text("Name");
        t4 = space();
        input0 = element("input");
        t5 = space();
        div1 = element("div");
        label1 = element("label");
        t6 = text("Description");
        t7 = space();
        input1 = element("input");
        t8 = space();
        div2 = element("div");
        label2 = element("label");
        t9 = text("URL");
        t10 = space();
        create_component(handle.$$.fragment);
        t11 = space();
        div3 = element("div");
        label3 = element("label");
        t12 = text("Permissions");
        t13 = space();
        create_component(permissions.$$.fragment);
        t14 = space();
        div4 = element("div");
        label4 = element("label");
        t15 = text("File");
        t16 = space();
        input2 = element("input");
        t17 = space();
        button = element("button");
        t18 = text("Add Item");
        attr(label0, "for", label0_for_value = "gallery-item-name-" +
        /*uniqueId*/
        ctx[29]);
        attr(input0, "id", input0_id_value = "gallery-item-name-" +
        /*uniqueId*/
        ctx[29]);
        attr(input0, "type", "text");
        attr(label1, "for", label1_for_value = "gallery-item-description-" +
        /*uniqueId*/
        ctx[29]);
        attr(input1, "id", input1_id_value = "gallery-item-description-" +
        /*uniqueId*/
        ctx[29]);
        attr(input1, "type", "text");
        attr(label2, "for", label2_for_value = "gallery-item-url-" +
        /*uniqueId*/
        ctx[29]);
        attr(label3, "for", label3_for_value = "gallery-item-permissions-" +
        /*uniqueId*/
        ctx[29]);
        attr(label4, "for", label4_for_value = "gallery-item-file-" +
        /*uniqueId*/
        ctx[29]);
        attr(input2, "id", input2_id_value = "gallery-item-file-" +
        /*uniqueId*/
        ctx[29]);
        attr(input2, "type", "file");
        attr(button, "type", "button");
        button.disabled = button_disabled_value = !
        /*itemIsValid*/
        ctx[14](
        /*itemInfo*/
        ctx[8]);
      },
      m: function m(target, anchor, remount) {
        if (if_block) if_block.m(target, anchor);
        insert(target, t0, anchor);
        insert(target, fieldset, anchor);
        append(fieldset, legend);
        append(fieldset, t2);
        append(fieldset, div0);
        append(div0, label0);
        append(label0, t3);
        append(div0, t4);
        append(div0, input0);
        set_input_value(input0,
        /*itemInfo*/
        ctx[8].name);
        append(fieldset, t5);
        append(fieldset, div1);
        append(div1, label1);
        append(label1, t6);
        append(div1, t7);
        append(div1, input1);
        set_input_value(input1,
        /*itemInfo*/
        ctx[8].description);
        append(fieldset, t8);
        append(fieldset, div2);
        append(div2, label2);
        append(label2, t9);
        append(div2, t10);
        mount_component(handle, div2, null);
        append(fieldset, t11);
        append(fieldset, div3);
        append(div3, label3);
        append(label3, t12);
        append(div3, t13);
        mount_component(permissions, div3, null);
        append(fieldset, t14);
        append(fieldset, div4);
        append(div4, label4);
        append(label4, t15);
        append(div4, t16);
        append(div4, input2);
        /*input2_binding*/

        ctx[27](input2);
        append(fieldset, t17);
        append(fieldset, button);
        append(button, t18);
        current = true;
        if (remount) run_all(dispose);
        dispose = [listen(input0, "input",
        /*input0_input_handler_1*/
        ctx[22]), listen(input1, "input",
        /*input1_input_handler_1*/
        ctx[23]), listen(input2, "change",
        /*input2_change_handler*/
        ctx[28]), listen(button, "click",
        /*addItem*/
        ctx[15])];
      },
      p: function p(ctx, dirty) {
        if (
        /*items*/
        ctx[4] &&
        /*items*/
        ctx[4].length > 0) {
          if (if_block) {
            if_block.p(ctx, dirty);
            transition_in(if_block, 1);
          } else {
            if_block = create_if_block_1$2(ctx);
            if_block.c();
            transition_in(if_block, 1);
            if_block.m(t0.parentNode, t0);
          }
        } else if (if_block) {
          group_outros();
          transition_out(if_block, 1, 1, function () {
            if_block = null;
          });
          check_outros();
        }

        if (!current || dirty[0] &
        /*uniqueId*/
        536870912 && label0_for_value !== (label0_for_value = "gallery-item-name-" +
        /*uniqueId*/
        ctx[29])) {
          attr(label0, "for", label0_for_value);
        }

        if (!current || dirty[0] &
        /*uniqueId*/
        536870912 && input0_id_value !== (input0_id_value = "gallery-item-name-" +
        /*uniqueId*/
        ctx[29])) {
          attr(input0, "id", input0_id_value);
        }

        if (dirty[0] &
        /*itemInfo*/
        256 && input0.value !==
        /*itemInfo*/
        ctx[8].name) {
          set_input_value(input0,
          /*itemInfo*/
          ctx[8].name);
        }

        if (!current || dirty[0] &
        /*uniqueId*/
        536870912 && label1_for_value !== (label1_for_value = "gallery-item-description-" +
        /*uniqueId*/
        ctx[29])) {
          attr(label1, "for", label1_for_value);
        }

        if (!current || dirty[0] &
        /*uniqueId*/
        536870912 && input1_id_value !== (input1_id_value = "gallery-item-description-" +
        /*uniqueId*/
        ctx[29])) {
          attr(input1, "id", input1_id_value);
        }

        if (dirty[0] &
        /*itemInfo*/
        256 && input1.value !==
        /*itemInfo*/
        ctx[8].description) {
          set_input_value(input1,
          /*itemInfo*/
          ctx[8].description);
        }

        if (!current || dirty[0] &
        /*uniqueId*/
        536870912 && label2_for_value !== (label2_for_value = "gallery-item-url-" +
        /*uniqueId*/
        ctx[29])) {
          attr(label2, "for", label2_for_value);
        }

        var handle_changes = {};
        if (dirty[0] &
        /*uniqueId*/
        536870912) handle_changes.id = "gallery-item-url-" +
        /*uniqueId*/
        ctx[29];

        if (!updating_input && dirty[0] &
        /*itemInfo*/
        256) {
          updating_input = true;
          handle_changes.input =
          /*itemInfo*/
          ctx[8].name;
          add_flush_callback(function () {
            return updating_input = false;
          });
        }

        if (!updating_value && dirty[0] &
        /*userItemInfo*/
        512) {
          updating_value = true;
          handle_changes.value =
          /*userItemInfo*/
          ctx[9].url;
          add_flush_callback(function () {
            return updating_value = false;
          });
        }

        handle.$set(handle_changes);

        if (!current || dirty[0] &
        /*uniqueId*/
        536870912 && label3_for_value !== (label3_for_value = "gallery-item-permissions-" +
        /*uniqueId*/
        ctx[29])) {
          attr(label3, "for", label3_for_value);
        }

        var permissions_changes = {};
        if (dirty[0] &
        /*uniqueId*/
        536870912) permissions_changes.id = "gallery-item-permissions-" +
        /*uniqueId*/
        ctx[29];

        if (!updating_value_1 && dirty[0] &
        /*userItemInfo*/
        512) {
          updating_value_1 = true;
          permissions_changes.value =
          /*userItemInfo*/
          ctx[9].permissions;
          add_flush_callback(function () {
            return updating_value_1 = false;
          });
        }

        permissions.$set(permissions_changes);

        if (!current || dirty[0] &
        /*uniqueId*/
        536870912 && label4_for_value !== (label4_for_value = "gallery-item-file-" +
        /*uniqueId*/
        ctx[29])) {
          attr(label4, "for", label4_for_value);
        }

        if (!current || dirty[0] &
        /*uniqueId*/
        536870912 && input2_id_value !== (input2_id_value = "gallery-item-file-" +
        /*uniqueId*/
        ctx[29])) {
          attr(input2, "id", input2_id_value);
        }

        if (!current || dirty[0] &
        /*itemInfo*/
        256 && button_disabled_value !== (button_disabled_value = !
        /*itemIsValid*/
        ctx[14](
        /*itemInfo*/
        ctx[8]))) {
          button.disabled = button_disabled_value;
        }
      },
      i: function i(local) {
        if (current) return;
        transition_in(if_block);
        transition_in(handle.$$.fragment, local);
        transition_in(permissions.$$.fragment, local);
        current = true;
      },
      o: function o(local) {
        transition_out(if_block);
        transition_out(handle.$$.fragment, local);
        transition_out(permissions.$$.fragment, local);
        current = false;
      },
      d: function d(detaching) {
        if (if_block) if_block.d(detaching);
        if (detaching) detach(t0);
        if (detaching) detach(fieldset);
        destroy_component(handle);
        destroy_component(permissions);
        /*input2_binding*/

        ctx[27](null);
        run_all(dispose);
      }
    };
  } // (231:4) {#if items && items.length > 0}


  function create_if_block_1$2(ctx) {
    var fieldset;
    var legend;
    var t1;
    var ul;
    var current;
    var each_value =
    /*items*/
    ctx[4];
    var each_blocks = [];

    for (var i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    }

    var out = function out(i) {
      return transition_out(each_blocks[i], 1, 1, function () {
        each_blocks[i] = null;
      });
    };

    return {
      c: function c() {
        fieldset = element("fieldset");
        legend = element("legend");
        legend.textContent = "Gallery Uploads";
        t1 = space();
        ul = element("ul");

        for (var _i9 = 0; _i9 < each_blocks.length; _i9 += 1) {
          each_blocks[_i9].c();
        }
      },
      m: function m(target, anchor) {
        insert(target, fieldset, anchor);
        append(fieldset, legend);
        append(fieldset, t1);
        append(fieldset, ul);

        for (var _i10 = 0; _i10 < each_blocks.length; _i10 += 1) {
          each_blocks[_i10].m(ul, null);
        }

        current = true;
      },
      p: function p(ctx, dirty) {
        if (dirty[0] &
        /*iconSize, checkColor, items, alertColor*/
        30) {
          each_value =
          /*items*/
          ctx[4];

          var _i11;

          for (_i11 = 0; _i11 < each_value.length; _i11 += 1) {
            var child_ctx = get_each_context$2(ctx, each_value, _i11);

            if (each_blocks[_i11]) {
              each_blocks[_i11].p(child_ctx, dirty);

              transition_in(each_blocks[_i11], 1);
            } else {
              each_blocks[_i11] = create_each_block$2(child_ctx);

              each_blocks[_i11].c();

              transition_in(each_blocks[_i11], 1);

              each_blocks[_i11].m(ul, null);
            }
          }

          group_outros();

          for (_i11 = each_value.length; _i11 < each_blocks.length; _i11 += 1) {
            out(_i11);
          }

          check_outros();
        }
      },
      i: function i(local) {
        if (current) return;

        for (var _i12 = 0; _i12 < each_value.length; _i12 += 1) {
          transition_in(each_blocks[_i12]);
        }

        current = true;
      },
      o: function o(local) {
        each_blocks = each_blocks.filter(Boolean);

        for (var _i13 = 0; _i13 < each_blocks.length; _i13 += 1) {
          transition_out(each_blocks[_i13]);
        }

        current = false;
      },
      d: function d(detaching) {
        if (detaching) detach(fieldset);
        destroy_each(each_blocks, detaching);
      }
    };
  } // (246:16) {:else}


  function create_else_block$2(ctx) {
    var progress;
    return {
      c: function c() {
        progress = element("progress");
      },
      m: function m(target, anchor) {
        insert(target, progress, anchor);
      },
      p: noop$1,
      i: noop$1,
      o: noop$1,
      d: function d(detaching) {
        if (detaching) detach(progress);
      }
    };
  } // (244:16) {#if item.file.total > 0}


  function create_if_block_4$1(ctx) {
    var progress;
    var progress_max_value;
    var progress_value_value;
    return {
      c: function c() {
        progress = element("progress");
        attr(progress, "max", progress_max_value =
        /*item*/
        ctx[30].file.total);
        progress.value = progress_value_value =
        /*item*/
        ctx[30].file.loaded;
      },
      m: function m(target, anchor) {
        insert(target, progress, anchor);
      },
      p: function p(ctx, dirty) {
        if (dirty[0] &
        /*items*/
        16 && progress_max_value !== (progress_max_value =
        /*item*/
        ctx[30].file.total)) {
          attr(progress, "max", progress_max_value);
        }

        if (dirty[0] &
        /*items*/
        16 && progress_value_value !== (progress_value_value =
        /*item*/
        ctx[30].file.loaded)) {
          progress.value = progress_value_value;
        }
      },
      i: noop$1,
      o: noop$1,
      d: function d(detaching) {
        if (detaching) detach(progress);
      }
    };
  } // (240:53) 


  function create_if_block_3$1(ctx) {
    var t0;
    var span;
    var t1;
    var t2_value =
    /*item*/
    ctx[30].file.response + "";
    var t2;
    var current;
    var alert = new Alert({
      props: {
        size:
        /*iconSize*/
        ctx[1],
        color:
        /*alertColor*/
        ctx[2]
      }
    });
    return {
      c: function c() {
        create_component(alert.$$.fragment);
        t0 = space();
        span = element("span");
        t1 = text("Upload Failed: ");
        t2 = text(t2_value);
        attr(span, "class", "error");
      },
      m: function m(target, anchor) {
        mount_component(alert, target, anchor);
        insert(target, t0, anchor);
        insert(target, span, anchor);
        append(span, t1);
        append(span, t2);
        current = true;
      },
      p: function p(ctx, dirty) {
        var alert_changes = {};
        if (dirty[0] &
        /*iconSize*/
        2) alert_changes.size =
        /*iconSize*/
        ctx[1];
        if (dirty[0] &
        /*alertColor*/
        4) alert_changes.color =
        /*alertColor*/
        ctx[2];
        alert.$set(alert_changes);
        if ((!current || dirty[0] &
        /*items*/
        16) && t2_value !== (t2_value =
        /*item*/
        ctx[30].file.response + "")) set_data(t2, t2_value);
      },
      i: function i(local) {
        if (current) return;
        transition_in(alert.$$.fragment, local);
        current = true;
      },
      o: function o(local) {
        transition_out(alert.$$.fragment, local);
        current = false;
      },
      d: function d(detaching) {
        destroy_component(alert, detaching);
        if (detaching) detach(t0);
        if (detaching) detach(span);
      }
    };
  } // (237:16) {#if item.file.status === Success}


  function create_if_block_2$1(ctx) {
    var progress;
    var t;
    var current;
    var checkbold = new CheckBold({
      props: {
        size:
        /*iconSize*/
        ctx[1],
        color:
        /*checkColor*/
        ctx[3]
      }
    });
    return {
      c: function c() {
        progress = element("progress");
        t = space();
        create_component(checkbold.$$.fragment);
        attr(progress, "max", "100");
        progress.value = "100";
      },
      m: function m(target, anchor) {
        insert(target, progress, anchor);
        insert(target, t, anchor);
        mount_component(checkbold, target, anchor);
        current = true;
      },
      p: function p(ctx, dirty) {
        var checkbold_changes = {};
        if (dirty[0] &
        /*iconSize*/
        2) checkbold_changes.size =
        /*iconSize*/
        ctx[1];
        if (dirty[0] &
        /*checkColor*/
        8) checkbold_changes.color =
        /*checkColor*/
        ctx[3];
        checkbold.$set(checkbold_changes);
      },
      i: function i(local) {
        if (current) return;
        transition_in(checkbold.$$.fragment, local);
        current = true;
      },
      o: function o(local) {
        transition_out(checkbold.$$.fragment, local);
        current = false;
      },
      d: function d(detaching) {
        if (detaching) detach(progress);
        if (detaching) detach(t);
        destroy_component(checkbold, detaching);
      }
    };
  } // (235:8) {#each items as item}


  function create_each_block$2(ctx) {
    var li;
    var t0_value =
    /*item*/
    ctx[30].name + "";
    var t0;
    var t1;
    var current_block_type_index;
    var if_block;
    var t2;
    var current;
    var if_block_creators = [create_if_block_2$1, create_if_block_3$1, create_if_block_4$1, create_else_block$2];
    var if_blocks = [];

    function select_block_type_1(ctx, dirty) {
      if (
      /*item*/
      ctx[30].file.status === Success$1) return 0;
      if (
      /*item*/
      ctx[30].file.status === Error$2) return 1;
      if (
      /*item*/
      ctx[30].file.total > 0) return 2;
      return 3;
    }

    current_block_type_index = select_block_type_1(ctx);
    if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
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
        if_blocks[current_block_type_index].m(li, null);
        append(li, t2);
        current = true;
      },
      p: function p(ctx, dirty) {
        if ((!current || dirty[0] &
        /*items*/
        16) && t0_value !== (t0_value =
        /*item*/
        ctx[30].name + "")) set_data(t0, t0_value);
        var previous_block_index = current_block_type_index;
        current_block_type_index = select_block_type_1(ctx);

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
          if_block.m(li, t2);
        }
      },
      i: function i(local) {
        if (current) return;
        transition_in(if_block);
        current = true;
      },
      o: function o(local) {
        transition_out(if_block);
        current = false;
      },
      d: function d(detaching) {
        if (detaching) detach(li);
        if_blocks[current_block_type_index].d();
      }
    };
  } // (194:0) <Unique let:uniqueId={uniqueId}>


  function create_default_slot$1(ctx) {
    var form;
    var fieldset;
    var legend;
    var t1;
    var promise;
    var t2;
    var current;
    var info = {
      ctx: ctx,
      current: null,
      token: null,
      pending: create_pending_block$2,
      then: create_then_block$2,
      "catch": create_catch_block$2,
      error: 33,
      blocks: [,,,]
    };
    handle_promise(promise =
    /*galleryResult*/
    ctx[5], info);
    var if_block =
    /*galleryId*/
    ctx[0] && create_if_block$2(ctx);
    return {
      c: function c() {
        form = element("form");
        fieldset = element("fieldset");
        legend = element("legend");
        legend.textContent = "Gallery Information";
        t1 = space();
        info.block.c();
        t2 = space();
        if (if_block) if_block.c();
      },
      m: function m(target, anchor) {
        insert(target, form, anchor);
        append(form, fieldset);
        append(fieldset, legend);
        append(fieldset, t1);
        info.block.m(fieldset, info.anchor = null);

        info.mount = function () {
          return fieldset;
        };

        info.anchor = null;
        append(form, t2);
        if (if_block) if_block.m(form, null);
        current = true;
      },
      p: function p(new_ctx, dirty) {
        ctx = new_ctx;
        info.ctx = ctx;
        if (dirty[0] &
        /*galleryResult*/
        32 && promise !== (promise =
        /*galleryResult*/
        ctx[5]) && handle_promise(promise, info)) ;else {
          var child_ctx = ctx.slice();
          info.block.p(child_ctx, dirty);
        }

        if (
        /*galleryId*/
        ctx[0]) {
          if (if_block) {
            if_block.p(ctx, dirty);
            transition_in(if_block, 1);
          } else {
            if_block = create_if_block$2(ctx);
            if_block.c();
            transition_in(if_block, 1);
            if_block.m(form, null);
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
        if (current) return;
        transition_in(info.block);
        transition_in(if_block);
        current = true;
      },
      o: function o(local) {
        for (var i = 0; i < 3; i += 1) {
          var _block3 = info.blocks[i];
          transition_out(_block3);
        }

        transition_out(if_block);
        current = false;
      },
      d: function d(detaching) {
        if (detaching) detach(form);
        info.block.d();
        info.token = null;
        info = null;
        if (if_block) if_block.d();
      }
    };
  }

  function create_fragment$8(ctx) {
    var current;
    var unique = new Unique({
      props: {
        $$slots: {
          "default": [create_default_slot$1, function (_ref20) {
            var uniqueId = _ref20.uniqueId;
            return {
              29: uniqueId
            };
          }, function (_ref21) {
            var uniqueId = _ref21.uniqueId;
            return [uniqueId ? 536870912 : 0];
          }]
        },
        $$scope: {
          ctx: ctx
        }
      }
    });
    return {
      c: function c() {
        create_component(unique.$$.fragment);
      },
      m: function m(target, anchor) {
        mount_component(unique, target, anchor);
        current = true;
      },
      p: function p(ctx, dirty) {
        var unique_changes = {};

        if (dirty[0] &
        /*itemInfo, uniqueId, fileInputElm, userItemInfo, items, iconSize, checkColor, alertColor, galleryId, galleryResult, galleryInfo, userGalleryInfo, tags*/
        536875007 | dirty[1] &
        /*$$scope*/
        8) {
          unique_changes.$$scope = {
            dirty: dirty,
            ctx: ctx
          };
        }

        unique.$set(unique_changes);
      },
      i: function i(local) {
        if (current) return;
        transition_in(unique.$$.fragment, local);
        current = true;
      },
      o: function o(local) {
        transition_out(unique.$$.fragment, local);
        current = false;
      },
      d: function d(detaching) {
        destroy_component(unique, detaching);
      }
    };
  }

  var api$1 = "/api/v1";
  var Loading$1 = 0;
  var Success$1 = 1;
  var Error$2 = 2;

  function galleryIsValid$1(galleryInfo) {
    return galleryInfo.name.length;
  }

  function instance$8($$self, $$props, $$invalidate) {
    var galleryId = $$props.galleryId;
    var _$$props$iconSize2 = $$props.iconSize,
        iconSize = _$$props$iconSize2 === void 0 ? 12 : _$$props$iconSize2;
    var _$$props$alertColor2 = $$props.alertColor,
        alertColor = _$$props$alertColor2 === void 0 ? "#f80" : _$$props$alertColor2;
    var _$$props$checkColor2 = $$props.checkColor,
        checkColor = _$$props$checkColor2 === void 0 ? "#080" : _$$props$checkColor2;
    var items = [];
    var galleryResult = Promise.resolve(true);
    var galleryInfo = {
      kind: 0,
      name: "",
      description: ""
    };
    var userGalleryInfo = {
      handle: "",
      permissions: 0,
      ord: 0
    };
    var itemInfo = {
      kind: 0,
      name: "",
      description: "",
      files: null
    };
    var userItemInfo = {
      handle: "",
      permissions: 0,
      ord: 0
    };
    var tags = [];
    var fileInputElm;

    function addGallery() {
      if (galleryIsValid$1(galleryInfo)) {
        $$invalidate(5, galleryResult = fetch("".concat(api$1, "/galleries"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "same-origin",
          body: JSON.stringify([galleryInfo, userGalleryInfo])
        }).then(function (res) {
          return res.json();
        }).then(function (id) {
          $$invalidate(0, galleryId = id); // Set a default permissions scheme once the gallery is added

          $$invalidate(9, userItemInfo.permissions = userGalleryInfo.permissions, userItemInfo);
          return fetch("".concat(api$1, "/galleries/").concat(id, "/tags"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "same-origin",
            body: JSON.stringify(tags)
          }).then(function (res) {
            return res.json();
          });
        }));
      }
    }

    function updateGallery() {
      if (galleryId && galleryIsValid$1(galleryInfo)) {
        $$invalidate(5, galleryResult = fetch("".concat(api$1, "/galleries/").concat(galleryId), {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "same-origin",
          body: JSON.stringify([galleryInfo, userGalleryInfo])
        }).then(function (res) {
          return res.json();
        }).then(function (_) {
          return fetch("".concat(api$1, "/galleries/").concat(galleryId, "/tags"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "same-origin",
            body: JSON.stringify(tags)
          }).then(function (res) {
            return res.json();
          });
        }));
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
        data.append("itemInfo", JSON.stringify([{
          name: itemInfo.name,
          description: itemInfo.description,
          kind: itemInfo.kind
        }, userItemInfo]));
        data.append("file", itemInfo.files[0]);
        request.open("POST", "".concat(api$1, "/galleries/").concat(galleryId, "/items"));
        request.upload.addEventListener("progress", function (e) {
          var loaded = e.loaded,
              total = e.total;
          requestData.loaded = loaded;
          requestData.total = total; // Ensure refresh

          $$invalidate(4, items);
        });
        request.addEventListener("load", function (e) {
          if (request.status == 200 || request.status == 201) requestData.status = Success$1;else requestData.status = Error$2; // Ensure refresh

          $$invalidate(4, items);
        });
        request.addEventListener("readystatechange", function (e) {
          if (request.readyState === 4 && request.response.length) requestData.response = JSON.parse(request.response); // Ensure refresh

          $$invalidate(4, items);
        });
        request.send(data);
        items.push({
          name: itemInfo.name,
          description: itemInfo.description,
          kind: itemInfo.kind,
          file: requestData
        });
        $$invalidate(8, itemInfo.name = "", itemInfo);
        $$invalidate(8, itemInfo.description = "", itemInfo);
        $$invalidate(9, userItemInfo.url = "", userItemInfo); /// If they change permissions, it will persist to other images.
        /// Uncomment this line to change this behaviour
        // userItemInfo.permissions = userGalleryInfo.permissions;

        $$invalidate(8, itemInfo.files = [], itemInfo);
        $$invalidate(11, fileInputElm.value = "", fileInputElm);
        $$invalidate(8, itemInfo.kind = 0, itemInfo);
        $$invalidate(4, items);
      }
    }

    function input0_input_handler() {
      galleryInfo.name = this.value;
      $$invalidate(6, galleryInfo);
    }

    function input1_input_handler() {
      galleryInfo.description = this.value;
      $$invalidate(6, galleryInfo);
    }

    function handle_input_binding(value) {
      galleryInfo.name = value;
      $$invalidate(6, galleryInfo);
    }

    function handle_value_binding(value) {
      userGalleryInfo.url = value;
      $$invalidate(7, userGalleryInfo);
    }

    function tags_1_tags_binding(value) {
      tags = value;
      $$invalidate(10, tags);
    }

    function permissions_value_binding(value) {
      userGalleryInfo.permissions = value;
      $$invalidate(7, userGalleryInfo);
    }

    function input0_input_handler_1() {
      itemInfo.name = this.value;
      $$invalidate(8, itemInfo);
    }

    function input1_input_handler_1() {
      itemInfo.description = this.value;
      $$invalidate(8, itemInfo);
    }

    function handle_input_binding_1(value) {
      itemInfo.name = value;
      $$invalidate(8, itemInfo);
    }

    function handle_value_binding_1(value) {
      userItemInfo.url = value;
      $$invalidate(9, userItemInfo);
    }

    function permissions_value_binding_1(value) {
      userItemInfo.permissions = value;
      $$invalidate(9, userItemInfo);
    }

    function input2_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](function () {
        $$invalidate(11, fileInputElm = $$value);
      });
    }

    function input2_change_handler() {
      itemInfo.files = this.files;
      $$invalidate(8, itemInfo);
    }

    $$self.$set = function ($$props) {
      if ("galleryId" in $$props) $$invalidate(0, galleryId = $$props.galleryId);
      if ("iconSize" in $$props) $$invalidate(1, iconSize = $$props.iconSize);
      if ("alertColor" in $$props) $$invalidate(2, alertColor = $$props.alertColor);
      if ("checkColor" in $$props) $$invalidate(3, checkColor = $$props.checkColor);
    };

    $$self.$$.update = function () {
      if ($$self.$$.dirty[0] &
      /*itemInfo*/
      256) {
        if (itemInfo.files && itemInfo.files.length > 0 && itemInfo.name.length === 0) {
          $$invalidate(8, itemInfo.name = itemInfo.files[0].name.replace(/\.[^.]+$/, ""), itemInfo);
        }
      }
    };

    return [galleryId, iconSize, alertColor, checkColor, items, galleryResult, galleryInfo, userGalleryInfo, itemInfo, userItemInfo, tags, fileInputElm, addGallery, updateGallery, itemIsValid, addItem, input0_input_handler, input1_input_handler, handle_input_binding, handle_value_binding, tags_1_tags_binding, permissions_value_binding, input0_input_handler_1, input1_input_handler_1, handle_input_binding_1, handle_value_binding_1, permissions_value_binding_1, input2_binding, input2_change_handler];
  }

  var UserGalleryCreate = /*#__PURE__*/function (_SvelteComponent8) {
    _inherits(UserGalleryCreate, _SvelteComponent8);

    var _super9 = _createSuper(UserGalleryCreate);

    function UserGalleryCreate(options) {
      var _this10;

      _classCallCheck(this, UserGalleryCreate);

      _this10 = _super9.call(this);
      init(_assertThisInitialized(_this10), options, instance$8, create_fragment$8, safe_not_equal, {
        galleryId: 0,
        iconSize: 1,
        alertColor: 2,
        checkColor: 3
      }, [-1, -1]);
      return _this10;
    }

    return UserGalleryCreate;
  }(SvelteComponent);

  function cubicOut(t) {
    var f = t - 1.0;
    return f * f * f + 1.0;
  }

  function fade(node, _ref22) {
    var _ref22$delay = _ref22.delay,
        delay = _ref22$delay === void 0 ? 0 : _ref22$delay,
        _ref22$duration = _ref22.duration,
        duration = _ref22$duration === void 0 ? 400 : _ref22$duration,
        _ref22$easing = _ref22.easing,
        easing = _ref22$easing === void 0 ? identity : _ref22$easing;
    var o = +getComputedStyle(node).opacity;
    return {
      delay: delay,
      duration: duration,
      easing: easing,
      css: function css(t) {
        return "opacity: ".concat(t * o);
      }
    };
  }

  function noop$3() {}

  var identity$1 = function identity$1(x) {
    return x;
  };

  function assign$1(tar, src) {
    // @ts-ignore
    for (var k in src) {
      tar[k] = src[k];
    }

    return tar;
  }

  function run$2(fn) {
    return fn();
  }

  function blank_object$2() {
    return Object.create(null);
  }

  function run_all$2(fns) {
    fns.forEach(run$2);
  }

  function is_function$2(thing) {
    return typeof thing === 'function';
  }

  function safe_not_equal$2(a, b) {
    return a != a ? b == b : a !== b || a && _typeof(a) === 'object' || typeof a === 'function';
  }

  function is_empty(obj) {
    return Object.keys(obj).length === 0;
  }

  function create_slot$1(definition, ctx, $$scope, fn) {
    if (definition) {
      var slot_ctx = get_slot_context$1(definition, ctx, $$scope, fn);
      return definition[0](slot_ctx);
    }
  }

  function get_slot_context$1(definition, ctx, $$scope, fn) {
    return definition[1] && fn ? assign$1($$scope.ctx.slice(), definition[1](fn(ctx))) : $$scope.ctx;
  }

  function get_slot_changes$1(definition, $$scope, dirty, fn) {
    if (definition[2] && fn) {
      var lets = definition[2](fn(dirty));

      if ($$scope.dirty === undefined) {
        return lets;
      }

      if (_typeof(lets) === 'object') {
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
    var slot_changes = get_slot_changes$1(slot_definition, $$scope, dirty, get_slot_changes_fn);

    if (slot_changes) {
      var slot_context = get_slot_context$1(slot_definition, ctx, $$scope, get_slot_context_fn);
      slot.p(slot_context, slot_changes);
    }
  }

  function action_destroyer$1(action_result) {
    return action_result && is_function$2(action_result.destroy) ? action_result.destroy : noop$3;
  }

  var is_client$1 = typeof window !== 'undefined';
  var now$1 = is_client$1 ? function () {
    return window.performance.now();
  } : function () {
    return Date.now();
  };
  var raf$1 = is_client$1 ? function (cb) {
    return requestAnimationFrame(cb);
  } : noop$3;
  var tasks$1 = new Set();

  function run_tasks$1(now) {
    tasks$1.forEach(function (task) {
      if (!task.c(now)) {
        tasks$1["delete"](task);
        task.f();
      }
    });
    if (tasks$1.size !== 0) raf$1(run_tasks$1);
  }
  /**
   * Creates a new task that runs on each raf frame
   * until it returns a falsy value or is aborted
   */


  function loop$1(callback) {
    var task;
    if (tasks$1.size === 0) raf$1(run_tasks$1);
    return {
      promise: new Promise(function (fulfill) {
        tasks$1.add(task = {
          c: callback,
          f: fulfill
        });
      }),
      abort: function abort() {
        tasks$1["delete"](task);
      }
    };
  }

  function append$2(target, node) {
    target.appendChild(node);
  }

  function insert$2(target, node, anchor) {
    target.insertBefore(node, anchor || null);
  }

  function detach$2(node) {
    node.parentNode.removeChild(node);
  }

  function element$2(name) {
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

  function attr$2(node, attribute, value) {
    if (value == null) node.removeAttribute(attribute);else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
  }

  function children$2(element) {
    return Array.from(element.childNodes);
  }

  function set_data$1(text, data) {
    data = '' + data;
    if (text.wholeText !== data) text.data = data;
  }

  function custom_event$1(type, detail) {
    var e = document.createEvent('CustomEvent');
    e.initCustomEvent(type, false, false, detail);
    return e;
  }

  var active_docs$1 = new Set();
  var active$1 = 0; // https://github.com/darkskyapp/string-hash/blob/master/index.js

  function hash$1(str) {
    var hash = 5381;
    var i = str.length;

    while (i--) {
      hash = (hash << 5) - hash ^ str.charCodeAt(i);
    }

    return hash >>> 0;
  }

  function create_rule$1(node, a, b, duration, delay, ease, fn) {
    var uid = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : 0;
    var step = 16.666 / duration;
    var keyframes = '{\n';

    for (var p = 0; p <= 1; p += step) {
      var t = a + (b - a) * ease(p);
      keyframes += p * 100 + "%{".concat(fn(t, 1 - t), "}\n");
    }

    var rule = keyframes + "100% {".concat(fn(b, 1 - b), "}\n}");
    var name = "__svelte_".concat(hash$1(rule), "_").concat(uid);
    var doc = node.ownerDocument;
    active_docs$1.add(doc);
    var stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element$2('style')).sheet);
    var current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});

    if (!current_rules[name]) {
      current_rules[name] = true;
      stylesheet.insertRule("@keyframes ".concat(name, " ").concat(rule), stylesheet.cssRules.length);
    }

    var animation = node.style.animation || '';
    node.style.animation = "".concat(animation ? "".concat(animation, ", ") : "").concat(name, " ").concat(duration, "ms linear ").concat(delay, "ms 1 both");
    active$1 += 1;
    return name;
  }

  function delete_rule$1(node, name) {
    var previous = (node.style.animation || '').split(', ');
    var next = previous.filter(name ? function (anim) {
      return anim.indexOf(name) < 0;
    } // remove specific animation
    : function (anim) {
      return anim.indexOf('__svelte') === -1;
    } // remove all Svelte animations
    );
    var deleted = previous.length - next.length;

    if (deleted) {
      node.style.animation = next.join(', ');
      active$1 -= deleted;
      if (!active$1) clear_rules$1();
    }
  }

  function clear_rules$1() {
    raf$1(function () {
      if (active$1) return;
      active_docs$1.forEach(function (doc) {
        var stylesheet = doc.__svelte_stylesheet;
        var i = stylesheet.cssRules.length;

        while (i--) {
          stylesheet.deleteRule(i);
        }

        doc.__svelte_rules = {};
      });
      active_docs$1.clear();
    });
  }

  var current_component$2;

  function set_current_component$2(component) {
    current_component$2 = component;
  }

  var dirty_components$2 = [];
  var binding_callbacks$2 = [];
  var render_callbacks$2 = [];
  var flush_callbacks$2 = [];
  var resolved_promise$2 = Promise.resolve();
  var update_scheduled$2 = false;

  function schedule_update$2() {
    if (!update_scheduled$2) {
      update_scheduled$2 = true;
      resolved_promise$2.then(flush$2);
    }
  }

  function add_render_callback$2(fn) {
    render_callbacks$2.push(fn);
  }

  var flushing$2 = false;
  var seen_callbacks$2 = new Set();

  function flush$2() {
    if (flushing$2) return;
    flushing$2 = true;

    do {
      // first, call beforeUpdate functions
      // and update components
      for (var i = 0; i < dirty_components$2.length; i += 1) {
        var component = dirty_components$2[i];
        set_current_component$2(component);
        update$2(component.$$);
      }

      dirty_components$2.length = 0;

      while (binding_callbacks$2.length) {
        binding_callbacks$2.pop()();
      } // then, once components are updated, call
      // afterUpdate functions. This may cause
      // subsequent updates...


      for (var _i14 = 0; _i14 < render_callbacks$2.length; _i14 += 1) {
        var callback = render_callbacks$2[_i14];

        if (!seen_callbacks$2.has(callback)) {
          // ...so guard against infinite loops
          seen_callbacks$2.add(callback);
          callback();
        }
      }

      render_callbacks$2.length = 0;
    } while (dirty_components$2.length);

    while (flush_callbacks$2.length) {
      flush_callbacks$2.pop()();
    }

    update_scheduled$2 = false;
    flushing$2 = false;
    seen_callbacks$2.clear();
  }

  function update$2($$) {
    if ($$.fragment !== null) {
      $$.update();
      run_all$2($$.before_update);
      var dirty = $$.dirty;
      $$.dirty = [-1];
      $$.fragment && $$.fragment.p($$.ctx, dirty);
      $$.after_update.forEach(add_render_callback$2);
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
    node.dispatchEvent(custom_event$1("".concat(direction ? 'intro' : 'outro').concat(kind)));
  }

  var outroing$2 = new Set();
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
      run_all$2(outros$1.c);
    }

    outros$1 = outros$1.p;
  }

  function transition_in$2(block, local) {
    if (block && block.i) {
      outroing$2["delete"](block);
      block.i(local);
    }
  }

  function transition_out$1(block, local, detach, callback) {
    if (block && block.o) {
      if (outroing$2.has(block)) return;
      outroing$2.add(block);
      outros$1.c.push(function () {
        outroing$2["delete"](block);

        if (callback) {
          if (detach) block.d(1);
          callback();
        }
      });
      block.o(local);
    }
  }

  var null_transition$1 = {
    duration: 0
  };

  function create_in_transition(node, fn, params) {
    var config = fn(node, params);
    var running = false;
    var animation_name;
    var task;
    var uid = 0;

    function cleanup() {
      if (animation_name) delete_rule$1(node, animation_name);
    }

    function go() {
      var _ref23 = config || null_transition$1,
          _ref23$delay = _ref23.delay,
          delay = _ref23$delay === void 0 ? 0 : _ref23$delay,
          _ref23$duration = _ref23.duration,
          duration = _ref23$duration === void 0 ? 300 : _ref23$duration,
          _ref23$easing = _ref23.easing,
          easing = _ref23$easing === void 0 ? identity$1 : _ref23$easing,
          _ref23$tick = _ref23.tick,
          tick = _ref23$tick === void 0 ? noop$3 : _ref23$tick,
          css = _ref23.css;

      if (css) animation_name = create_rule$1(node, 0, 1, duration, delay, easing, css, uid++);
      tick(0, 1);
      var start_time = now$1() + delay;
      var end_time = start_time + duration;
      if (task) task.abort();
      running = true;
      add_render_callback$2(function () {
        return dispatch$1(node, true, 'start');
      });
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
        if (started) return;
        delete_rule$1(node);

        if (is_function$2(config)) {
          config = config();
          wait$1().then(go);
        } else {
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

  function mount_component$2(component, target, anchor) {
    var _component$$$3 = component.$$,
        fragment = _component$$$3.fragment,
        on_mount = _component$$$3.on_mount,
        on_destroy = _component$$$3.on_destroy,
        after_update = _component$$$3.after_update;
    fragment && fragment.m(target, anchor); // onMount happens before the initial afterUpdate

    add_render_callback$2(function () {
      var new_on_destroy = on_mount.map(run$2).filter(is_function$2);

      if (on_destroy) {
        on_destroy.push.apply(on_destroy, _toConsumableArray(new_on_destroy));
      } else {
        // Edge case - component was destroyed immediately,
        // most likely as a result of a binding initialising
        run_all$2(new_on_destroy);
      }

      component.$$.on_mount = [];
    });
    after_update.forEach(add_render_callback$2);
  }

  function destroy_component$2(component, detaching) {
    var $$ = component.$$;

    if ($$.fragment !== null) {
      run_all$2($$.on_destroy);
      $$.fragment && $$.fragment.d(detaching); // TODO null out other refs, including component.$$ (but need to
      // preserve final state?)

      $$.on_destroy = $$.fragment = null;
      $$.ctx = [];
    }
  }

  function make_dirty$2(component, i) {
    if (component.$$.dirty[0] === -1) {
      dirty_components$2.push(component);
      schedule_update$2();
      component.$$.dirty.fill(0);
    }

    component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
  }

  function init$2(component, options, instance, create_fragment, not_equal, props) {
    var dirty = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : [-1];
    var parent_component = current_component$2;
    set_current_component$2(component);
    var prop_values = options.props || {};
    var $$ = component.$$ = {
      fragment: null,
      ctx: null,
      // state
      props: props,
      update: noop$3,
      not_equal: not_equal,
      bound: blank_object$2(),
      // lifecycle
      on_mount: [],
      on_destroy: [],
      before_update: [],
      after_update: [],
      context: new Map(parent_component ? parent_component.$$.context : []),
      // everything else
      callbacks: blank_object$2(),
      dirty: dirty,
      skip_bound: false
    };
    var ready = false;
    $$.ctx = instance ? instance(component, prop_values, function (i, ret) {
      var value = (arguments.length <= 2 ? 0 : arguments.length - 2) ? arguments.length <= 2 ? undefined : arguments[2] : ret;

      if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
        if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
        if (ready) make_dirty$2(component, i);
      }

      return ret;
    }) : [];
    $$.update();
    ready = true;
    run_all$2($$.before_update); // `false` as a special case of no DOM component

    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;

    if (options.target) {
      if (options.hydrate) {
        var nodes = children$2(options.target); // eslint-disable-next-line @typescript-eslint/no-non-null-assertion

        $$.fragment && $$.fragment.l(nodes);
        nodes.forEach(detach$2);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        $$.fragment && $$.fragment.c();
      }

      if (options.intro) transition_in$2(component.$$.fragment);
      mount_component$2(component, options.target, options.anchor);
      flush$2();
    }

    set_current_component$2(parent_component);
  }

  var SvelteComponent$2 = /*#__PURE__*/function () {
    function SvelteComponent$2() {
      _classCallCheck(this, SvelteComponent$2);
    }

    _createClass(SvelteComponent$2, [{
      key: "$destroy",
      value: function $destroy() {
        destroy_component$2(this, 1);
        this.$destroy = noop$3;
      }
    }, {
      key: "$on",
      value: function $on(type, callback) {
        var callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
        callbacks.push(callback);
        return function () {
          var index = callbacks.indexOf(callback);
          if (index !== -1) callbacks.splice(index, 1);
        };
      }
    }, {
      key: "$set",
      value: function $set($$props) {
        if (this.$$set && !is_empty($$props)) {
          this.$$.skip_bound = true;
          this.$$set($$props);
          this.$$.skip_bound = false;
        }
      }
    }]);

    return SvelteComponent$2;
  }();

  function fade$1(node, _ref24) {
    var _ref24$delay = _ref24.delay,
        delay = _ref24$delay === void 0 ? 0 : _ref24$delay,
        _ref24$duration = _ref24.duration,
        duration = _ref24$duration === void 0 ? 400 : _ref24$duration,
        _ref24$easing = _ref24.easing,
        easing = _ref24$easing === void 0 ? identity$1 : _ref24$easing;
    var o = +getComputedStyle(node).opacity;
    return {
      delay: delay,
      duration: duration,
      easing: easing,
      css: function css(t) {
        return "opacity: ".concat(t * o);
      }
    };
  }
  /* src/components/Placeholder.svelte generated by Svelte v3.24.1 */


  function create_if_block_1$3(ctx) {
    var switch_instance;
    var switch_instance_anchor;
    var current;
    var switch_value =
    /*placeholder*/
    ctx[0];

    function switch_props(ctx) {
      return {};
    }

    if (switch_value) {
      switch_instance = new switch_value(switch_props());
    }

    return {
      c: function c() {
        if (switch_instance) create_component$1(switch_instance.$$.fragment);
        switch_instance_anchor = empty$1();
      },
      m: function m(target, anchor) {
        if (switch_instance) {
          mount_component$2(switch_instance, target, anchor);
        }

        insert$2(target, switch_instance_anchor, anchor);
        current = true;
      },
      p: function p(ctx, dirty) {
        if (switch_value !== (switch_value =
        /*placeholder*/
        ctx[0])) {
          if (switch_instance) {
            group_outros$1();
            var old_component = switch_instance;
            transition_out$1(old_component.$$.fragment, 1, 0, function () {
              destroy_component$2(old_component, 1);
            });
            check_outros$1();
          }

          if (switch_value) {
            switch_instance = new switch_value(switch_props());
            create_component$1(switch_instance.$$.fragment);
            transition_in$2(switch_instance.$$.fragment, 1);
            mount_component$2(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
          } else {
            switch_instance = null;
          }
        }
      },
      i: function i(local) {
        if (current) return;
        if (switch_instance) transition_in$2(switch_instance.$$.fragment, local);
        current = true;
      },
      o: function o(local) {
        if (switch_instance) transition_out$1(switch_instance.$$.fragment, local);
        current = false;
      },
      d: function d(detaching) {
        if (detaching) detach$2(switch_instance_anchor);
        if (switch_instance) destroy_component$2(switch_instance, detaching);
      }
    };
  } // (2:2) {#if typeof placeholder === 'string'}


  function create_if_block$3(ctx) {
    var div;
    var t;
    return {
      c: function c() {
        div = element$2("div");
        t = text$1(
        /*placeholder*/
        ctx[0]);
      },
      m: function m(target, anchor) {
        insert$2(target, div, anchor);
        append$2(div, t);
      },
      p: function p(ctx, dirty) {
        if (dirty &
        /*placeholder*/
        1) set_data$1(t,
        /*placeholder*/
        ctx[0]);
      },
      i: noop$3,
      o: noop$3,
      d: function d(detaching) {
        if (detaching) detach$2(div);
      }
    };
  }

  function create_fragment$9(ctx) {
    var div;
    var current_block_type_index;
    var if_block;
    var current;
    var if_block_creators = [create_if_block$3, create_if_block_1$3];
    var if_blocks = [];

    function select_block_type(ctx, dirty) {
      if (typeof
      /*placeholder*/
      ctx[0] === "string") return 0;
      if (typeof
      /*placeholder*/
      ctx[0] === "function") return 1;
      return -1;
    }

    if (~(current_block_type_index = select_block_type(ctx))) {
      if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    }

    return {
      c: function c() {
        div = element$2("div");
        if (if_block) if_block.c();
        attr$2(div, "class", placeholderClass);
      },
      m: function m(target, anchor) {
        insert$2(target, div, anchor);

        if (~current_block_type_index) {
          if_blocks[current_block_type_index].m(div, null);
        }

        current = true;
      },
      p: function p(ctx, _ref25) {
        var _ref26 = _slicedToArray(_ref25, 1),
            dirty = _ref26[0];

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

            transition_in$2(if_block, 1);
            if_block.m(div, null);
          } else {
            if_block = null;
          }
        }
      },
      i: function i(local) {
        if (current) return;
        transition_in$2(if_block);
        current = true;
      },
      o: function o(local) {
        transition_out$1(if_block);
        current = false;
      },
      d: function d(detaching) {
        if (detaching) detach$2(div);

        if (~current_block_type_index) {
          if_blocks[current_block_type_index].d();
        }
      }
    };
  }

  var placeholderClass = "svelte-lazy-placeholder";

  function instance$9($$self, $$props, $$invalidate) {
    var _$$props$placeholder = $$props.placeholder,
        placeholder = _$$props$placeholder === void 0 ? null : _$$props$placeholder;

    $$self.$$set = function ($$props) {
      if ("placeholder" in $$props) $$invalidate(0, placeholder = $$props.placeholder);
    };

    return [placeholder];
  }

  var Placeholder = /*#__PURE__*/function (_SvelteComponent$2) {
    _inherits(Placeholder, _SvelteComponent$2);

    var _super10 = _createSuper(Placeholder);

    function Placeholder(options) {
      var _this11;

      _classCallCheck(this, Placeholder);

      _this11 = _super10.call(this);
      init$2(_assertThisInitialized(_this11), options, instance$9, create_fragment$9, safe_not_equal$2, {
        placeholder: 0
      });
      return _this11;
    }

    return Placeholder;
  }(SvelteComponent$2);
  /* src/index.svelte generated by Svelte v3.24.1 */


  function create_else_block$3(ctx) {
    var placeholder_1;
    var current;
    placeholder_1 = new Placeholder({
      props: {
        placeholder:
        /*placeholder*/
        ctx[1]
      }
    });
    return {
      c: function c() {
        create_component$1(placeholder_1.$$.fragment);
      },
      m: function m(target, anchor) {
        mount_component$2(placeholder_1, target, anchor);
        current = true;
      },
      p: function p(ctx, dirty) {
        var placeholder_1_changes = {};
        if (dirty &
        /*placeholder*/
        2) placeholder_1_changes.placeholder =
        /*placeholder*/
        ctx[1];
        placeholder_1.$set(placeholder_1_changes);
      },
      i: function i(local) {
        if (current) return;
        transition_in$2(placeholder_1.$$.fragment, local);
        current = true;
      },
      o: function o(local) {
        transition_out$1(placeholder_1.$$.fragment, local);
        current = false;
      },
      d: function d(detaching) {
        destroy_component$2(placeholder_1, detaching);
      }
    };
  } // (2:2) {#if loaded}


  function create_if_block$1$1(ctx) {
    var div;
    var div_intro;
    var t;
    var if_block_anchor;
    var current;
    var default_slot_template =
    /*$$slots*/
    ctx[13]["default"];
    var default_slot = create_slot$1(default_slot_template, ctx,
    /*$$scope*/
    ctx[12], null);
    var default_slot_or_fallback = default_slot || fallback_block();
    var if_block =
    /*contentDisplay*/
    ctx[3] === "hide" && create_if_block_1$1$1(ctx);
    return {
      c: function c() {
        div = element$2("div");
        if (default_slot_or_fallback) default_slot_or_fallback.c();
        t = space$1();
        if (if_block) if_block.c();
        if_block_anchor = empty$1();
        attr$2(div, "class", contentClass);
        attr$2(div, "style",
        /*contentStyle*/
        ctx[4]);
      },
      m: function m(target, anchor) {
        insert$2(target, div, anchor);

        if (default_slot_or_fallback) {
          default_slot_or_fallback.m(div, null);
        }

        insert$2(target, t, anchor);
        if (if_block) if_block.m(target, anchor);
        insert$2(target, if_block_anchor, anchor);
        current = true;
      },
      p: function p(ctx, dirty) {
        if (default_slot) {
          if (default_slot.p && dirty &
          /*$$scope*/
          4096) {
            update_slot(default_slot, default_slot_template, ctx,
            /*$$scope*/
            ctx[12], dirty, null, null);
          }
        }

        if (!current || dirty &
        /*contentStyle*/
        16) {
          attr$2(div, "style",
          /*contentStyle*/
          ctx[4]);
        }

        if (
        /*contentDisplay*/
        ctx[3] === "hide") {
          if (if_block) {
            if_block.p(ctx, dirty);

            if (dirty &
            /*contentDisplay*/
            8) {
              transition_in$2(if_block, 1);
            }
          } else {
            if_block = create_if_block_1$1$1(ctx);
            if_block.c();
            transition_in$2(if_block, 1);
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
        if (current) return;
        transition_in$2(default_slot_or_fallback, local);

        if (!div_intro) {
          add_render_callback$2(function () {
            div_intro = create_in_transition(div, fade$1,
            /*fadeOption*/
            ctx[0] || {});
            div_intro.start();
          });
        }

        transition_in$2(if_block);
        current = true;
      },
      o: function o(local) {
        transition_out$1(default_slot_or_fallback, local);
        transition_out$1(if_block);
        current = false;
      },
      d: function d(detaching) {
        if (detaching) detach$2(div);
        if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
        if (detaching) detach$2(t);
        if (if_block) if_block.d(detaching);
        if (detaching) detach$2(if_block_anchor);
      }
    };
  } // (8:12) Lazy load content


  function fallback_block(ctx) {
    var t;
    return {
      c: function c() {
        t = text$1("Lazy load content");
      },
      m: function m(target, anchor) {
        insert$2(target, t, anchor);
      },
      d: function d(detaching) {
        if (detaching) detach$2(t);
      }
    };
  } // (10:4) {#if contentDisplay === 'hide'}


  function create_if_block_1$1$1(ctx) {
    var placeholder_1;
    var current;
    placeholder_1 = new Placeholder({
      props: {
        placeholder:
        /*placeholder*/
        ctx[1]
      }
    });
    return {
      c: function c() {
        create_component$1(placeholder_1.$$.fragment);
      },
      m: function m(target, anchor) {
        mount_component$2(placeholder_1, target, anchor);
        current = true;
      },
      p: function p(ctx, dirty) {
        var placeholder_1_changes = {};
        if (dirty &
        /*placeholder*/
        2) placeholder_1_changes.placeholder =
        /*placeholder*/
        ctx[1];
        placeholder_1.$set(placeholder_1_changes);
      },
      i: function i(local) {
        if (current) return;
        transition_in$2(placeholder_1.$$.fragment, local);
        current = true;
      },
      o: function o(local) {
        transition_out$1(placeholder_1.$$.fragment, local);
        current = false;
      },
      d: function d(detaching) {
        destroy_component$2(placeholder_1, detaching);
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
    var if_block_creators = [create_if_block$1$1, create_else_block$3];
    var if_blocks = [];

    function select_block_type(ctx, dirty) {
      if (
      /*loaded*/
      ctx[2]) return 0;
      return 1;
    }

    current_block_type_index = select_block_type(ctx);
    if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    return {
      c: function c() {
        div = element$2("div");
        if_block.c();
        attr$2(div, "class",
        /*rootClass*/
        ctx[5]);
      },
      m: function m(target, anchor) {
        insert$2(target, div, anchor);
        if_blocks[current_block_type_index].m(div, null);
        current = true;

        if (!mounted) {
          dispose = action_destroyer$1(load_action =
          /*load*/
          ctx[6].call(null, div));
          mounted = true;
        }
      },
      p: function p(ctx, _ref27) {
        var _ref28 = _slicedToArray(_ref27, 1),
            dirty = _ref28[0];

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

          transition_in$2(if_block, 1);
          if_block.m(div, null);
        }
      },
      i: function i(local) {
        if (current) return;
        transition_in$2(if_block);
        current = true;
      },
      o: function o(local) {
        transition_out$1(if_block);
        current = false;
      },
      d: function d(detaching) {
        if (detaching) detach$2(div);
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
  } // From underscore souce code


  function throttle(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};

    var later = function later() {
      previous = options.leading === false ? 0 : new Date();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };

    return function (event) {
      var now = new Date();
      if (!previous && options.leading === false) previous = now;
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
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }

      return result;
    };
  }

  function instance$1$1($$self, $$props, $$invalidate) {
    var _$$props$height3 = $$props.height,
        height = _$$props$height3 === void 0 ? 0 : _$$props$height3;
    var _$$props$offset = $$props.offset,
        offset = _$$props$offset === void 0 ? 150 : _$$props$offset;
    var _$$props$fadeOption = $$props.fadeOption,
        fadeOption = _$$props$fadeOption === void 0 ? {
      delay: 0,
      duration: 400
    } : _$$props$fadeOption;
    var _$$props$resetHeightD = $$props.resetHeightDelay,
        resetHeightDelay = _$$props$resetHeightD === void 0 ? 0 : _$$props$resetHeightD;
    var _$$props$onload = $$props.onload,
        onload = _$$props$onload === void 0 ? null : _$$props$onload;
    var _$$props$placeholder2 = $$props.placeholder,
        placeholder = _$$props$placeholder2 === void 0 ? null : _$$props$placeholder2;
    var _$$props$class = $$props["class"],
        className = _$$props$class === void 0 ? "" : _$$props$class;
    var rootClass = "svelte-lazy" + (className ? " " + className : "");
    var loaded = false;
    var contentDisplay = "";

    function load(node) {
      setHeight(node);
      var loadHandler = throttle(function (e) {
        var nodeTop = node.getBoundingClientRect().top;
        var expectedTop = getContainerHeight(e) + offset;

        if (nodeTop <= expectedTop) {
          $$invalidate(2, loaded = true);
          resetHeight(node);
          onload && onload(node);
          removeListeners();
        }
      }, 200);
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
        destroy: function destroy() {
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
      setTimeout(function () {
        var handled = handleImgContent(node);

        if (!handled) {
          node.style.height = "auto";
        }
      }, resetHeightDelay);
    }

    function handleImgContent(node) {
      var img = node.querySelector("img");

      if (img) {
        if (!img.complete) {
          $$invalidate(3, contentDisplay = "hide");
          node.addEventListener("load", function () {
            $$invalidate(3, contentDisplay = "");
            node.style.height = "auto";
          }, {
            capture: true,
            once: true
          });
          node.addEventListener("error", function () {
            // Keep passed height if there is error
            $$invalidate(3, contentDisplay = "");
          }, {
            capture: true,
            once: true
          });
          return true;
        } else if (img.naturalHeight === 0) {
          // Keep passed height if img has zero height
          return true;
        }
      }
    }

    var _$$props$$$slots2 = $$props.$$slots,
        $$slots = _$$props$$$slots2 === void 0 ? {} : _$$props$$$slots2,
        $$scope = $$props.$$scope;

    $$self.$$set = function ($$props) {
      if ("height" in $$props) $$invalidate(7, height = $$props.height);
      if ("offset" in $$props) $$invalidate(8, offset = $$props.offset);
      if ("fadeOption" in $$props) $$invalidate(0, fadeOption = $$props.fadeOption);
      if ("resetHeightDelay" in $$props) $$invalidate(9, resetHeightDelay = $$props.resetHeightDelay);
      if ("onload" in $$props) $$invalidate(10, onload = $$props.onload);
      if ("placeholder" in $$props) $$invalidate(1, placeholder = $$props.placeholder);
      if ("class" in $$props) $$invalidate(11, className = $$props["class"]);
      if ("$$scope" in $$props) $$invalidate(12, $$scope = $$props.$$scope);
    };

    var contentStyle;

    $$self.$$.update = function () {
      if ($$self.$$.dirty &
      /*contentDisplay*/
      8) {
        $$invalidate(4, contentStyle = contentDisplay === "hide" ? "display: none" : "");
      }
    };

    return [fadeOption, placeholder, loaded, contentDisplay, contentStyle, rootClass, load, height, offset, resetHeightDelay, onload, className, $$scope, $$slots];
  }

  var Src = /*#__PURE__*/function (_SvelteComponent$3) {
    _inherits(Src, _SvelteComponent$3);

    var _super11 = _createSuper(Src);

    function Src(options) {
      var _this12;

      _classCallCheck(this, Src);

      _this12 = _super11.call(this);
      init$2(_assertThisInitialized(_this12), options, instance$1$1, create_fragment$1$1, safe_not_equal$2, {
        height: 7,
        offset: 8,
        fadeOption: 0,
        resetHeightDelay: 9,
        onload: 10,
        placeholder: 1,
        "class": 11
      });
      return _this12;
    }

    return Src;
  }(SvelteComponent$2);
  /* src/Gallery.html generated by Svelte v3.20.1 */


  function get_each_context$3(ctx, list, i) {
    var child_ctx = ctx.slice();
    child_ctx[8] = list[i];
    return child_ctx;
  } // (100:0) {:catch err}


  function create_catch_block$3(ctx) {
    var p;
    var t0;
    var t1_value =
    /*err*/
    ctx[7].message + "";
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
        if (dirty &
        /*galleryRequest*/
        1 && t1_value !== (t1_value =
        /*err*/
        ctx[7].message + "")) set_data(t1, t1_value);
      },
      i: noop$1,
      o: noop$1,
      d: function d(detaching) {
        if (detaching) detach(p);
      }
    };
  } // (78:0) {:then info}


  function create_then_block$3(ctx) {
    var h3;
    var t0_value =
    /*info*/
    ctx[6][0].name + "";
    var t0;
    var t1;
    var t2;
    var div;
    var current;
    var if_block =
    /*info*/
    ctx[6][0].description && create_if_block_1$4(ctx);
    var each_value =
    /*info*/
    ctx[6][1];
    var each_blocks = [];

    for (var i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    }

    var out = function out(i) {
      return transition_out(each_blocks[i], 1, 1, function () {
        each_blocks[i] = null;
      });
    };

    return {
      c: function c() {
        h3 = element("h3");
        t0 = text(t0_value);
        t1 = space();
        if (if_block) if_block.c();
        t2 = space();
        div = element("div");

        for (var _i15 = 0; _i15 < each_blocks.length; _i15 += 1) {
          each_blocks[_i15].c();
        }

        attr(div, "class", "gallery svelte-1t2rpfy");
      },
      m: function m(target, anchor) {
        insert(target, h3, anchor);
        append(h3, t0);
        insert(target, t1, anchor);
        if (if_block) if_block.m(target, anchor);
        insert(target, t2, anchor);
        insert(target, div, anchor);

        for (var _i16 = 0; _i16 < each_blocks.length; _i16 += 1) {
          each_blocks[_i16].m(div, null);
        }

        current = true;
      },
      p: function p(ctx, dirty) {
        if ((!current || dirty &
        /*galleryRequest*/
        1) && t0_value !== (t0_value =
        /*info*/
        ctx[6][0].name + "")) set_data(t0, t0_value);

        if (
        /*info*/
        ctx[6][0].description) {
          if (if_block) {
            if_block.p(ctx, dirty);
          } else {
            if_block = create_if_block_1$4(ctx);
            if_block.c();
            if_block.m(t2.parentNode, t2);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }

        if (dirty &
        /*showModal, galleryRequest*/
        5) {
          each_value =
          /*info*/
          ctx[6][1];

          var _i17;

          for (_i17 = 0; _i17 < each_value.length; _i17 += 1) {
            var child_ctx = get_each_context$3(ctx, each_value, _i17);

            if (each_blocks[_i17]) {
              each_blocks[_i17].p(child_ctx, dirty);

              transition_in(each_blocks[_i17], 1);
            } else {
              each_blocks[_i17] = create_each_block$3(child_ctx);

              each_blocks[_i17].c();

              transition_in(each_blocks[_i17], 1);

              each_blocks[_i17].m(div, null);
            }
          }

          group_outros();

          for (_i17 = each_value.length; _i17 < each_blocks.length; _i17 += 1) {
            out(_i17);
          }

          check_outros();
        }
      },
      i: function i(local) {
        if (current) return;

        for (var _i18 = 0; _i18 < each_value.length; _i18 += 1) {
          transition_in(each_blocks[_i18]);
        }

        current = true;
      },
      o: function o(local) {
        each_blocks = each_blocks.filter(Boolean);

        for (var _i19 = 0; _i19 < each_blocks.length; _i19 += 1) {
          transition_out(each_blocks[_i19]);
        }

        current = false;
      },
      d: function d(detaching) {
        if (detaching) detach(h3);
        if (detaching) detach(t1);
        if (if_block) if_block.d(detaching);
        if (detaching) detach(t2);
        if (detaching) detach(div);
        destroy_each(each_blocks, detaching);
      }
    };
  } // (80:0) {#if info[0].description}


  function create_if_block_1$4(ctx) {
    var p;
    var t_value =
    /*info*/
    ctx[6][0].description + "";
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
        if (dirty &
        /*galleryRequest*/
        1 && t_value !== (t_value =
        /*info*/
        ctx[6][0].description + "")) set_data(t, t_value);
      },
      d: function d(detaching) {
        if (detaching) detach(p);
      }
    };
  } // (86:12) <Lazy height={400}>


  function create_default_slot$2(ctx) {
    var img;
    var img_alt_value;
    var img_src_value;
    return {
      c: function c() {
        img = element("img");
        attr(img, "alt", img_alt_value =
        /*item*/
        ctx[8][2].description);
        if (img.src !== (img_src_value = "/assets/" +
        /*item*/
        ctx[8][2].uuid)) attr(img, "src", img_src_value);
        attr(img, "class", "svelte-1t2rpfy");
      },
      m: function m(target, anchor) {
        insert(target, img, anchor);
      },
      p: function p(ctx, dirty) {
        if (dirty &
        /*galleryRequest*/
        1 && img_alt_value !== (img_alt_value =
        /*item*/
        ctx[8][2].description)) {
          attr(img, "alt", img_alt_value);
        }

        if (dirty &
        /*galleryRequest*/
        1 && img.src !== (img_src_value = "/assets/" +
        /*item*/
        ctx[8][2].uuid)) {
          attr(img, "src", img_src_value);
        }
      },
      d: function d(detaching) {
        if (detaching) detach(img);
      }
    };
  } // (84:4) {#each info[1] as item}


  function create_each_block$3(ctx) {
    var figure;
    var t0;
    var figcaption;
    var t1_value =
    /*item*/
    ctx[8][2].name + "";
    var t1;
    var t2;
    var current;
    var dispose;
    var lazy = new Src({
      props: {
        height: 400,
        $$slots: {
          "default": [create_default_slot$2]
        },
        $$scope: {
          ctx: ctx
        }
      }
    });

    function click_handler() {
      var _ctx2;

      for (var _len2 = arguments.length, args = new Array(_len2), _key5 = 0; _key5 < _len2; _key5++) {
        args[_key5] = arguments[_key5];
      }

      return (
        /*click_handler*/
        (_ctx2 = ctx)[5].apply(_ctx2, [
        /*item*/
        ctx[8]].concat(args))
      );
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
        if (remount) dispose();
        dispose = listen(figure, "click", click_handler);
      },
      p: function p(new_ctx, dirty) {
        ctx = new_ctx;
        var lazy_changes = {};

        if (dirty &
        /*$$scope, galleryRequest*/
        2049) {
          lazy_changes.$$scope = {
            dirty: dirty,
            ctx: ctx
          };
        }

        lazy.$set(lazy_changes);
        if ((!current || dirty &
        /*galleryRequest*/
        1) && t1_value !== (t1_value =
        /*item*/
        ctx[8][2].name + "")) set_data(t1, t1_value);
      },
      i: function i(local) {
        if (current) return;
        transition_in(lazy.$$.fragment, local);
        current = true;
      },
      o: function o(local) {
        transition_out(lazy.$$.fragment, local);
        current = false;
      },
      d: function d(detaching) {
        if (detaching) detach(figure);
        destroy_component(lazy);
        if (detaching) detach(t2);
        dispose();
      }
    };
  } // (76:23)  <p>...</p> {:then info}


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
        if (detaching) detach(p);
      }
    };
  } // (104:0) {#if displayItem}


  function create_if_block$4(ctx) {
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
        if (img.src !== (img_src_value = "/assets/" +
        /*displayItem*/
        ctx[1].uuid)) attr(img, "src", img_src_value);
        attr(img, "alt", img_alt_value =
        /*displayItem*/
        ctx[1].description);
        attr(img, "class", "svelte-1t2rpfy");
        attr(div0, "class", "fullscreen-image svelte-1t2rpfy");
        attr(div1, "class", "shadow-box svelte-1t2rpfy");
      },
      m: function m(target, anchor, remount) {
        insert(target, div1, anchor);
        append(div1, div0);
        append(div0, img);
        current = true;
        if (remount) dispose();
        dispose = listen(div1, "click",
        /*hideModal*/
        ctx[3]);
      },
      p: function p(ctx, dirty) {
        if (!current || dirty &
        /*displayItem*/
        2 && img.src !== (img_src_value = "/assets/" +
        /*displayItem*/
        ctx[1].uuid)) {
          attr(img, "src", img_src_value);
        }

        if (!current || dirty &
        /*displayItem*/
        2 && img_alt_value !== (img_alt_value =
        /*displayItem*/
        ctx[1].description)) {
          attr(img, "alt", img_alt_value);
        }
      },
      i: function i(local) {
        if (current) return;
        add_render_callback(function () {
          if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fade, {
            duration: 200
          }, true);
          div1_transition.run(1);
        });
        current = true;
      },
      o: function o(local) {
        if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fade, {
          duration: 200
        }, false);
        div1_transition.run(0);
        current = false;
      },
      d: function d(detaching) {
        if (detaching) detach(div1);
        if (detaching && div1_transition) div1_transition.end();
        dispose();
      }
    };
  }

  function create_fragment$a(ctx) {
    var promise;
    var t;
    var if_block_anchor;
    var current;
    var info = {
      ctx: ctx,
      current: null,
      token: null,
      pending: create_pending_block$3,
      then: create_then_block$3,
      "catch": create_catch_block$3,
      value: 6,
      error: 7,
      blocks: [,,,]
    };
    handle_promise(promise =
    /*galleryRequest*/
    ctx[0], info);
    var if_block =
    /*displayItem*/
    ctx[1] && create_if_block$4(ctx);
    return {
      c: function c() {
        info.block.c();
        t = space();
        if (if_block) if_block.c();
        if_block_anchor = empty();
      },
      m: function m(target, anchor) {
        info.block.m(target, info.anchor = anchor);

        info.mount = function () {
          return t.parentNode;
        };

        info.anchor = t;
        insert(target, t, anchor);
        if (if_block) if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
        current = true;
      },
      p: function p(new_ctx, _ref29) {
        var _ref30 = _slicedToArray(_ref29, 1),
            dirty = _ref30[0];

        ctx = new_ctx;
        info.ctx = ctx;
        if (dirty &
        /*galleryRequest*/
        1 && promise !== (promise =
        /*galleryRequest*/
        ctx[0]) && handle_promise(promise, info)) ;else {
          var child_ctx = ctx.slice();
          child_ctx[6] = info.resolved;
          info.block.p(child_ctx, dirty);
        }

        if (
        /*displayItem*/
        ctx[1]) {
          if (if_block) {
            if_block.p(ctx, dirty);
            transition_in(if_block, 1);
          } else {
            if_block = create_if_block$4(ctx);
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
        if (current) return;
        transition_in(info.block);
        transition_in(if_block);
        current = true;
      },
      o: function o(local) {
        for (var i = 0; i < 3; i += 1) {
          var _block4 = info.blocks[i];
          transition_out(_block4);
        }

        transition_out(if_block);
        current = false;
      },
      d: function d(detaching) {
        info.block.d(detaching);
        info.token = null;
        info = null;
        if (detaching) detach(t);
        if (if_block) if_block.d(detaching);
        if (detaching) detach(if_block_anchor);
      }
    };
  }

  var api$2 = "/api/v1";

  function instance$a($$self, $$props, $$invalidate) {
    var galleryId = $$props.galleryId;
    var galleryRequest;
    var displayItem;

    function showModal(item) {
      $$invalidate(1, displayItem = item);
    }

    function hideModal() {
      $$invalidate(1, displayItem = null);
    }

    var click_handler = function click_handler(item, e) {
      return showModal(item[2]);
    };

    $$self.$set = function ($$props) {
      if ("galleryId" in $$props) $$invalidate(4, galleryId = $$props.galleryId);
    };

    $$self.$$.update = function () {
      if ($$self.$$.dirty &
      /*galleryId*/
      16) {
        if (galleryId) {
          $$invalidate(0, galleryRequest = Promise.all([fetch("".concat(api$2, "/galleries/").concat(galleryId)).then(function (res) {
            return res.json();
          }), fetch("".concat(api$2, "/galleries/").concat(galleryId, "/items")).then(function (res) {
            return res.json();
          })]));
        }
      }
    };

    return [galleryRequest, displayItem, showModal, hideModal, galleryId, click_handler];
  }

  var Gallery = /*#__PURE__*/function (_SvelteComponent9) {
    _inherits(Gallery, _SvelteComponent9);

    var _super12 = _createSuper(Gallery);

    function Gallery(options) {
      var _this13;

      _classCallCheck(this, Gallery);

      _this13 = _super12.call(this);
      init(_assertThisInitialized(_this13), options, instance$a, create_fragment$a, safe_not_equal, {
        galleryId: 4
      });
      return _this13;
    }

    return Gallery;
  }(SvelteComponent);
  /* node_modules/svelte-material-icons/Delete.svelte generated by Svelte v3.20.1 */


  function create_fragment$b(ctx) {
    var svg;
    var path;
    return {
      c: function c() {
        svg = svg_element("svg");
        path = svg_element("path");
        attr(path, "d", "M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z");
        attr(path, "fill",
        /*color*/
        ctx[2]);
        attr(svg, "width",
        /*width*/
        ctx[0]);
        attr(svg, "height",
        /*height*/
        ctx[1]);
        attr(svg, "viewBox",
        /*viewBox*/
        ctx[3]);
      },
      m: function m(target, anchor) {
        insert(target, svg, anchor);
        append(svg, path);
      },
      p: function p(ctx, _ref31) {
        var _ref32 = _slicedToArray(_ref31, 1),
            dirty = _ref32[0];

        if (dirty &
        /*color*/
        4) {
          attr(path, "fill",
          /*color*/
          ctx[2]);
        }

        if (dirty &
        /*width*/
        1) {
          attr(svg, "width",
          /*width*/
          ctx[0]);
        }

        if (dirty &
        /*height*/
        2) {
          attr(svg, "height",
          /*height*/
          ctx[1]);
        }

        if (dirty &
        /*viewBox*/
        8) {
          attr(svg, "viewBox",
          /*viewBox*/
          ctx[3]);
        }
      },
      i: noop$1,
      o: noop$1,
      d: function d(detaching) {
        if (detaching) detach(svg);
      }
    };
  }

  function instance$b($$self, $$props, $$invalidate) {
    var _$$props$size4 = $$props.size,
        size = _$$props$size4 === void 0 ? "1em" : _$$props$size4;
    var _$$props$width3 = $$props.width,
        width = _$$props$width3 === void 0 ? size : _$$props$width3;
    var _$$props$height4 = $$props.height,
        height = _$$props$height4 === void 0 ? size : _$$props$height4;
    var _$$props$color4 = $$props.color,
        color = _$$props$color4 === void 0 ? "currentColor" : _$$props$color4;
    var _$$props$viewBox3 = $$props.viewBox,
        viewBox = _$$props$viewBox3 === void 0 ? "0 0 24 24" : _$$props$viewBox3;

    $$self.$set = function ($$props) {
      if ("size" in $$props) $$invalidate(4, size = $$props.size);
      if ("width" in $$props) $$invalidate(0, width = $$props.width);
      if ("height" in $$props) $$invalidate(1, height = $$props.height);
      if ("color" in $$props) $$invalidate(2, color = $$props.color);
      if ("viewBox" in $$props) $$invalidate(3, viewBox = $$props.viewBox);
    };

    return [width, height, color, viewBox, size];
  }

  var Delete = /*#__PURE__*/function (_SvelteComponent10) {
    _inherits(Delete, _SvelteComponent10);

    var _super13 = _createSuper(Delete);

    function Delete(options) {
      var _this14;

      _classCallCheck(this, Delete);

      _this14 = _super13.call(this);
      init(_assertThisInitialized(_this14), options, instance$b, create_fragment$b, safe_not_equal, {
        size: 4,
        width: 0,
        height: 1,
        color: 2,
        viewBox: 3
      });
      return _this14;
    }

    return Delete;
  }(SvelteComponent);
  /* node_modules/svelte-material-icons/ReorderHorizontal.svelte generated by Svelte v3.20.1 */


  function create_fragment$c(ctx) {
    var svg;
    var path;
    return {
      c: function c() {
        svg = svg_element("svg");
        path = svg_element("path");
        attr(path, "d", "M3,15H21V13H3V15M3,19H21V17H3V19M3,11H21V9H3V11M3,5V7H21V5H3Z");
        attr(path, "fill",
        /*color*/
        ctx[2]);
        attr(svg, "width",
        /*width*/
        ctx[0]);
        attr(svg, "height",
        /*height*/
        ctx[1]);
        attr(svg, "viewBox",
        /*viewBox*/
        ctx[3]);
      },
      m: function m(target, anchor) {
        insert(target, svg, anchor);
        append(svg, path);
      },
      p: function p(ctx, _ref33) {
        var _ref34 = _slicedToArray(_ref33, 1),
            dirty = _ref34[0];

        if (dirty &
        /*color*/
        4) {
          attr(path, "fill",
          /*color*/
          ctx[2]);
        }

        if (dirty &
        /*width*/
        1) {
          attr(svg, "width",
          /*width*/
          ctx[0]);
        }

        if (dirty &
        /*height*/
        2) {
          attr(svg, "height",
          /*height*/
          ctx[1]);
        }

        if (dirty &
        /*viewBox*/
        8) {
          attr(svg, "viewBox",
          /*viewBox*/
          ctx[3]);
        }
      },
      i: noop$1,
      o: noop$1,
      d: function d(detaching) {
        if (detaching) detach(svg);
      }
    };
  }

  function instance$c($$self, $$props, $$invalidate) {
    var _$$props$size5 = $$props.size,
        size = _$$props$size5 === void 0 ? "1em" : _$$props$size5;
    var _$$props$width4 = $$props.width,
        width = _$$props$width4 === void 0 ? size : _$$props$width4;
    var _$$props$height5 = $$props.height,
        height = _$$props$height5 === void 0 ? size : _$$props$height5;
    var _$$props$color5 = $$props.color,
        color = _$$props$color5 === void 0 ? "currentColor" : _$$props$color5;
    var _$$props$viewBox4 = $$props.viewBox,
        viewBox = _$$props$viewBox4 === void 0 ? "0 0 24 24" : _$$props$viewBox4;

    $$self.$set = function ($$props) {
      if ("size" in $$props) $$invalidate(4, size = $$props.size);
      if ("width" in $$props) $$invalidate(0, width = $$props.width);
      if ("height" in $$props) $$invalidate(1, height = $$props.height);
      if ("color" in $$props) $$invalidate(2, color = $$props.color);
      if ("viewBox" in $$props) $$invalidate(3, viewBox = $$props.viewBox);
    };

    return [width, height, color, viewBox, size];
  }

  var ReorderHorizontal = /*#__PURE__*/function (_SvelteComponent11) {
    _inherits(ReorderHorizontal, _SvelteComponent11);

    var _super14 = _createSuper(ReorderHorizontal);

    function ReorderHorizontal(options) {
      var _this15;

      _classCallCheck(this, ReorderHorizontal);

      _this15 = _super14.call(this);
      init(_assertThisInitialized(_this15), options, instance$c, create_fragment$c, safe_not_equal, {
        size: 4,
        width: 0,
        height: 1,
        color: 2,
        viewBox: 3
      });
      return _this15;
    }

    return ReorderHorizontal;
  }(SvelteComponent);
  /* node_modules/svelte-material-icons/PencilOutline.svelte generated by Svelte v3.20.1 */


  function create_fragment$d(ctx) {
    var svg;
    var path;
    return {
      c: function c() {
        svg = svg_element("svg");
        path = svg_element("path");
        attr(path, "d", "M14.06,9L15,9.94L5.92,19H5V18.08L14.06,9M17.66,3C17.41,3 17.15,3.1 16.96,3.29L15.13,5.12L18.88,8.87L20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18.17,3.09 17.92,3 17.66,3M14.06,6.19L3,17.25V21H6.75L17.81,9.94L14.06,6.19Z");
        attr(path, "fill",
        /*color*/
        ctx[2]);
        attr(svg, "width",
        /*width*/
        ctx[0]);
        attr(svg, "height",
        /*height*/
        ctx[1]);
        attr(svg, "viewBox",
        /*viewBox*/
        ctx[3]);
      },
      m: function m(target, anchor) {
        insert(target, svg, anchor);
        append(svg, path);
      },
      p: function p(ctx, _ref35) {
        var _ref36 = _slicedToArray(_ref35, 1),
            dirty = _ref36[0];

        if (dirty &
        /*color*/
        4) {
          attr(path, "fill",
          /*color*/
          ctx[2]);
        }

        if (dirty &
        /*width*/
        1) {
          attr(svg, "width",
          /*width*/
          ctx[0]);
        }

        if (dirty &
        /*height*/
        2) {
          attr(svg, "height",
          /*height*/
          ctx[1]);
        }

        if (dirty &
        /*viewBox*/
        8) {
          attr(svg, "viewBox",
          /*viewBox*/
          ctx[3]);
        }
      },
      i: noop$1,
      o: noop$1,
      d: function d(detaching) {
        if (detaching) detach(svg);
      }
    };
  }

  function instance$d($$self, $$props, $$invalidate) {
    var _$$props$size6 = $$props.size,
        size = _$$props$size6 === void 0 ? "1em" : _$$props$size6;
    var _$$props$width5 = $$props.width,
        width = _$$props$width5 === void 0 ? size : _$$props$width5;
    var _$$props$height6 = $$props.height,
        height = _$$props$height6 === void 0 ? size : _$$props$height6;
    var _$$props$color6 = $$props.color,
        color = _$$props$color6 === void 0 ? "currentColor" : _$$props$color6;
    var _$$props$viewBox5 = $$props.viewBox,
        viewBox = _$$props$viewBox5 === void 0 ? "0 0 24 24" : _$$props$viewBox5;

    $$self.$set = function ($$props) {
      if ("size" in $$props) $$invalidate(4, size = $$props.size);
      if ("width" in $$props) $$invalidate(0, width = $$props.width);
      if ("height" in $$props) $$invalidate(1, height = $$props.height);
      if ("color" in $$props) $$invalidate(2, color = $$props.color);
      if ("viewBox" in $$props) $$invalidate(3, viewBox = $$props.viewBox);
    };

    return [width, height, color, viewBox, size];
  }

  var PencilOutline = /*#__PURE__*/function (_SvelteComponent12) {
    _inherits(PencilOutline, _SvelteComponent12);

    var _super15 = _createSuper(PencilOutline);

    function PencilOutline(options) {
      var _this16;

      _classCallCheck(this, PencilOutline);

      _this16 = _super15.call(this);
      init(_assertThisInitialized(_this16), options, instance$d, create_fragment$d, safe_not_equal, {
        size: 4,
        width: 0,
        height: 1,
        color: 2,
        viewBox: 3
      });
      return _this16;
    }

    return PencilOutline;
  }(SvelteComponent);
  /* src/UserItemForm.html generated by Svelte v3.20.1 */


  var get_default_slot_changes$1 = function get_default_slot_changes$1(dirty) {
    return {
      item: dirty &
      /*item*/
      16,
      uniqueId: dirty &
      /*uniqueId*/
      67108864
    };
  };

  var get_default_slot_context$1 = function get_default_slot_context$1(ctx) {
    return {
      item:
      /*item*/
      ctx[4],
      uniqueId:
      /*uniqueId*/
      ctx[26]
    };
  }; // (106:4) {#if itemRequest}


  function create_if_block$5(ctx) {
    var await_block_anchor;
    var promise;
    var current;
    var info = {
      ctx: ctx,
      current: null,
      token: null,
      pending: create_pending_block$4,
      then: create_then_block$4,
      "catch": create_catch_block$4,
      error: 25,
      blocks: [,,,]
    };
    handle_promise(promise =
    /*itemRequest*/
    ctx[0], info);
    return {
      c: function c() {
        await_block_anchor = empty();
        info.block.c();
      },
      m: function m(target, anchor) {
        insert(target, await_block_anchor, anchor);
        info.block.m(target, info.anchor = anchor);

        info.mount = function () {
          return await_block_anchor.parentNode;
        };

        info.anchor = await_block_anchor;
        current = true;
      },
      p: function p(new_ctx, dirty) {
        ctx = new_ctx;
        info.ctx = ctx;
        if (dirty &
        /*itemRequest*/
        1 && promise !== (promise =
        /*itemRequest*/
        ctx[0]) && handle_promise(promise, info)) ;else {
          var child_ctx = ctx.slice();
          info.block.p(child_ctx, dirty);
        }
      },
      i: function i(local) {
        if (current) return;
        transition_in(info.block);
        current = true;
      },
      o: function o(local) {
        for (var i = 0; i < 3; i += 1) {
          var _block5 = info.blocks[i];
          transition_out(_block5);
        }

        current = false;
      },
      d: function d(detaching) {
        if (detaching) detach(await_block_anchor);
        info.block.d(detaching);
        info.token = null;
        info = null;
      }
    };
  } // (141:4) {:catch err}


  function create_catch_block$4(ctx) {
    var p;
    var t0;
    var t1_value =
    /*err*/
    ctx[25].message + "";
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
        if (dirty &
        /*itemRequest*/
        1 && t1_value !== (t1_value =
        /*err*/
        ctx[25].message + "")) set_data(t1, t1_value);
      },
      i: noop$1,
      o: noop$1,
      d: function d(detaching) {
        if (detaching) detach(p);
      }
    };
  } // (109:4) {:then}


  function create_then_block$4(ctx) {
    var fieldset;
    var legend_1;
    var t0;
    var t1;
    var t2;
    var div;
    var button0;
    var t3;
    var t4;
    var button1;
    var t5;
    var current;
    var dispose;
    var unique = new Unique({
      props: {
        $$slots: {
          "default": [create_default_slot$3, function (_ref37) {
            var uniqueId = _ref37.uniqueId;
            return {
              26: uniqueId
            };
          }, function (_ref38) {
            var uniqueId = _ref38.uniqueId;
            return uniqueId ? 67108864 : 0;
          }]
        },
        $$scope: {
          ctx: ctx
        }
      }
    });
    return {
      c: function c() {
        fieldset = element("fieldset");
        legend_1 = element("legend");
        t0 = text(
        /*legend*/
        ctx[1]);
        t1 = space();
        create_component(unique.$$.fragment);
        t2 = space();
        div = element("div");
        button0 = element("button");
        t3 = text(
        /*submitText*/
        ctx[2]);
        t4 = space();
        button1 = element("button");
        t5 = text(
        /*cancelText*/
        ctx[3]);
        attr(button0, "type", "button");
        attr(button1, "type", "button");
        attr(div, "class", "form-controls svelte-15n3f23");
      },
      m: function m(target, anchor, remount) {
        insert(target, fieldset, anchor);
        append(fieldset, legend_1);
        append(legend_1, t0);
        append(fieldset, t1);
        mount_component(unique, fieldset, null);
        insert(target, t2, anchor);
        insert(target, div, anchor);
        append(div, button0);
        append(button0, t3);
        append(div, t4);
        append(div, button1);
        append(button1, t5);
        current = true;
        if (remount) run_all(dispose);
        dispose = [listen(button0, "click",
        /*submitChanges*/
        ctx[6]), listen(button1, "click",
        /*cancelChanges*/
        ctx[7])];
      },
      p: function p(ctx, dirty) {
        if (!current || dirty &
        /*legend*/
        2) set_data(t0,
        /*legend*/
        ctx[1]);
        var unique_changes = {};

        if (dirty &
        /*$$scope, uniqueId, item, tags*/
        83886128) {
          unique_changes.$$scope = {
            dirty: dirty,
            ctx: ctx
          };
        }

        unique.$set(unique_changes);
        if (!current || dirty &
        /*submitText*/
        4) set_data(t3,
        /*submitText*/
        ctx[2]);
        if (!current || dirty &
        /*cancelText*/
        8) set_data(t5,
        /*cancelText*/
        ctx[3]);
      },
      i: function i(local) {
        if (current) return;
        transition_in(unique.$$.fragment, local);
        current = true;
      },
      o: function o(local) {
        transition_out(unique.$$.fragment, local);
        current = false;
      },
      d: function d(detaching) {
        if (detaching) detach(fieldset);
        destroy_component(unique);
        if (detaching) detach(t2);
        if (detaching) detach(div);
        run_all(dispose);
      }
    };
  } // (113:36)                  


  function fallback_block$1(ctx) {
    var div0;
    var label0;
    var t0;
    var label0_for_value;
    var t1;
    var input0;
    var input0_id_value;
    var t2;
    var div1;
    var label1;
    var t3;
    var label1_for_value;
    var t4;
    var input1;
    var input1_id_value;
    var t5;
    var div2;
    var label2;
    var t6;
    var label2_for_value;
    var t7;
    var input2;
    var input2_id_value;
    var t8;
    var div3;
    var label3;
    var t9;
    var label3_for_value;
    var t10;
    var updating_tags;
    var t11;
    var div4;
    var label4;
    var t12;
    var label4_for_value;
    var t13;
    var updating_value;
    var current;
    var dispose;

    function tags_1_tags_binding(value) {
      /*tags_1_tags_binding*/
      ctx[22].call(null, value);
    }

    var tags_1_props = {
      id: "item-tags-" +
      /*uniqueId*/
      ctx[26]
    };

    if (
    /*tags*/
    ctx[5] !== void 0) {
      tags_1_props.tags =
      /*tags*/
      ctx[5];
    }

    var tags_1 = new Tags({
      props: tags_1_props
    });
    binding_callbacks.push(function () {
      return bind$1(tags_1, "tags", tags_1_tags_binding);
    });

    function permissions_value_binding(value) {
      /*permissions_value_binding*/
      ctx[23].call(null, value);
    }

    var permissions_props = {
      id: "item-permissions-" +
      /*uniqueId*/
      ctx[26]
    };

    if (
    /*item*/
    ctx[4][0].permissions !== void 0) {
      permissions_props.value =
      /*item*/
      ctx[4][0].permissions;
    }

    var permissions = new Permissions({
      props: permissions_props
    });
    binding_callbacks.push(function () {
      return bind$1(permissions, "value", permissions_value_binding);
    });
    return {
      c: function c() {
        div0 = element("div");
        label0 = element("label");
        t0 = text("Name");
        t1 = space();
        input0 = element("input");
        t2 = space();
        div1 = element("div");
        label1 = element("label");
        t3 = text("Description");
        t4 = space();
        input1 = element("input");
        t5 = space();
        div2 = element("div");
        label2 = element("label");
        t6 = text("Url");
        t7 = space();
        input2 = element("input");
        t8 = space();
        div3 = element("div");
        label3 = element("label");
        t9 = text("Tags");
        t10 = space();
        create_component(tags_1.$$.fragment);
        t11 = space();
        div4 = element("div");
        label4 = element("label");
        t12 = text("Permissions");
        t13 = space();
        create_component(permissions.$$.fragment);
        attr(label0, "for", label0_for_value = "item-name-" +
        /*uniqueId*/
        ctx[26]);
        attr(input0, "id", input0_id_value = "item-name-" +
        /*uniqueId*/
        ctx[26]);
        attr(input0, "type", "text");
        attr(label1, "for", label1_for_value = "item-description-" +
        /*uniqueId*/
        ctx[26]);
        attr(input1, "id", input1_id_value = "item-description-" +
        /*uniqueId*/
        ctx[26]);
        attr(input1, "type", "text");
        attr(label2, "for", label2_for_value = "item-url-" +
        /*uniqueId*/
        ctx[26]);
        attr(input2, "id", input2_id_value = "item-url-" +
        /*uniqueId*/
        ctx[26]);
        attr(input2, "type", "text");
        attr(label3, "for", label3_for_value = "item-tags-" +
        /*uniqueId*/
        ctx[26]);
        attr(label4, "for", label4_for_value = "item-permissions-" +
        /*uniqueId*/
        ctx[26]);
      },
      m: function m(target, anchor, remount) {
        insert(target, div0, anchor);
        append(div0, label0);
        append(label0, t0);
        append(div0, t1);
        append(div0, input0);
        set_input_value(input0,
        /*item*/
        ctx[4][1].name);
        insert(target, t2, anchor);
        insert(target, div1, anchor);
        append(div1, label1);
        append(label1, t3);
        append(div1, t4);
        append(div1, input1);
        set_input_value(input1,
        /*item*/
        ctx[4][1].description);
        insert(target, t5, anchor);
        insert(target, div2, anchor);
        append(div2, label2);
        append(label2, t6);
        append(div2, t7);
        append(div2, input2);
        set_input_value(input2,
        /*item*/
        ctx[4][0].url);
        insert(target, t8, anchor);
        insert(target, div3, anchor);
        append(div3, label3);
        append(label3, t9);
        append(div3, t10);
        mount_component(tags_1, div3, null);
        insert(target, t11, anchor);
        insert(target, div4, anchor);
        append(div4, label4);
        append(label4, t12);
        append(div4, t13);
        mount_component(permissions, div4, null);
        current = true;
        if (remount) run_all(dispose);
        dispose = [listen(input0, "input",
        /*input0_input_handler*/
        ctx[19]), listen(input1, "input",
        /*input1_input_handler*/
        ctx[20]), listen(input2, "input",
        /*input2_input_handler*/
        ctx[21])];
      },
      p: function p(ctx, dirty) {
        if (!current || dirty &
        /*uniqueId*/
        67108864 && label0_for_value !== (label0_for_value = "item-name-" +
        /*uniqueId*/
        ctx[26])) {
          attr(label0, "for", label0_for_value);
        }

        if (!current || dirty &
        /*uniqueId*/
        67108864 && input0_id_value !== (input0_id_value = "item-name-" +
        /*uniqueId*/
        ctx[26])) {
          attr(input0, "id", input0_id_value);
        }

        if (dirty &
        /*item*/
        16 && input0.value !==
        /*item*/
        ctx[4][1].name) {
          set_input_value(input0,
          /*item*/
          ctx[4][1].name);
        }

        if (!current || dirty &
        /*uniqueId*/
        67108864 && label1_for_value !== (label1_for_value = "item-description-" +
        /*uniqueId*/
        ctx[26])) {
          attr(label1, "for", label1_for_value);
        }

        if (!current || dirty &
        /*uniqueId*/
        67108864 && input1_id_value !== (input1_id_value = "item-description-" +
        /*uniqueId*/
        ctx[26])) {
          attr(input1, "id", input1_id_value);
        }

        if (dirty &
        /*item*/
        16 && input1.value !==
        /*item*/
        ctx[4][1].description) {
          set_input_value(input1,
          /*item*/
          ctx[4][1].description);
        }

        if (!current || dirty &
        /*uniqueId*/
        67108864 && label2_for_value !== (label2_for_value = "item-url-" +
        /*uniqueId*/
        ctx[26])) {
          attr(label2, "for", label2_for_value);
        }

        if (!current || dirty &
        /*uniqueId*/
        67108864 && input2_id_value !== (input2_id_value = "item-url-" +
        /*uniqueId*/
        ctx[26])) {
          attr(input2, "id", input2_id_value);
        }

        if (dirty &
        /*item*/
        16 && input2.value !==
        /*item*/
        ctx[4][0].url) {
          set_input_value(input2,
          /*item*/
          ctx[4][0].url);
        }

        if (!current || dirty &
        /*uniqueId*/
        67108864 && label3_for_value !== (label3_for_value = "item-tags-" +
        /*uniqueId*/
        ctx[26])) {
          attr(label3, "for", label3_for_value);
        }

        var tags_1_changes = {};
        if (dirty &
        /*uniqueId*/
        67108864) tags_1_changes.id = "item-tags-" +
        /*uniqueId*/
        ctx[26];

        if (!updating_tags && dirty &
        /*tags*/
        32) {
          updating_tags = true;
          tags_1_changes.tags =
          /*tags*/
          ctx[5];
          add_flush_callback(function () {
            return updating_tags = false;
          });
        }

        tags_1.$set(tags_1_changes);

        if (!current || dirty &
        /*uniqueId*/
        67108864 && label4_for_value !== (label4_for_value = "item-permissions-" +
        /*uniqueId*/
        ctx[26])) {
          attr(label4, "for", label4_for_value);
        }

        var permissions_changes = {};
        if (dirty &
        /*uniqueId*/
        67108864) permissions_changes.id = "item-permissions-" +
        /*uniqueId*/
        ctx[26];

        if (!updating_value && dirty &
        /*item*/
        16) {
          updating_value = true;
          permissions_changes.value =
          /*item*/
          ctx[4][0].permissions;
          add_flush_callback(function () {
            return updating_value = false;
          });
        }

        permissions.$set(permissions_changes);
      },
      i: function i(local) {
        if (current) return;
        transition_in(tags_1.$$.fragment, local);
        transition_in(permissions.$$.fragment, local);
        current = true;
      },
      o: function o(local) {
        transition_out(tags_1.$$.fragment, local);
        transition_out(permissions.$$.fragment, local);
        current = false;
      },
      d: function d(detaching) {
        if (detaching) detach(div0);
        if (detaching) detach(t2);
        if (detaching) detach(div1);
        if (detaching) detach(t5);
        if (detaching) detach(div2);
        if (detaching) detach(t8);
        if (detaching) detach(div3);
        destroy_component(tags_1);
        if (detaching) detach(t11);
        if (detaching) detach(div4);
        destroy_component(permissions);
        run_all(dispose);
      }
    };
  } // (112:8) <Unique let:uniqueId={uniqueId}>


  function create_default_slot$3(ctx) {
    var current;
    var default_slot_template =
    /*$$slots*/
    ctx[18]["default"];
    var default_slot = create_slot(default_slot_template, ctx,
    /*$$scope*/
    ctx[24], get_default_slot_context$1);
    var default_slot_or_fallback = default_slot || fallback_block$1(ctx);
    return {
      c: function c() {
        if (default_slot_or_fallback) default_slot_or_fallback.c();
      },
      m: function m(target, anchor) {
        if (default_slot_or_fallback) {
          default_slot_or_fallback.m(target, anchor);
        }

        current = true;
      },
      p: function p(ctx, dirty) {
        if (default_slot) {
          if (default_slot.p && dirty &
          /*$$scope, item, uniqueId*/
          83886096) {
            default_slot.p(get_slot_context(default_slot_template, ctx,
            /*$$scope*/
            ctx[24], get_default_slot_context$1), get_slot_changes(default_slot_template,
            /*$$scope*/
            ctx[24], dirty, get_default_slot_changes$1));
          }
        } else {
          if (default_slot_or_fallback && default_slot_or_fallback.p && dirty &
          /*uniqueId, item, tags*/
          67108912) {
            default_slot_or_fallback.p(ctx, dirty);
          }
        }
      },
      i: function i(local) {
        if (current) return;
        transition_in(default_slot_or_fallback, local);
        current = true;
      },
      o: function o(local) {
        transition_out(default_slot_or_fallback, local);
        current = false;
      },
      d: function d(detaching) {
        if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
      }
    };
  } // (107:24)      <p>...</p>     {:then}


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
        if (detaching) detach(p);
      }
    };
  }

  function create_fragment$e(ctx) {
    var form;
    var current;
    var if_block =
    /*itemRequest*/
    ctx[0] && create_if_block$5(ctx);
    return {
      c: function c() {
        form = element("form");
        if (if_block) if_block.c();
        attr(form, "class", "svelte-15n3f23");
      },
      m: function m(target, anchor) {
        insert(target, form, anchor);
        if (if_block) if_block.m(form, null);
        current = true;
      },
      p: function p(ctx, _ref39) {
        var _ref40 = _slicedToArray(_ref39, 1),
            dirty = _ref40[0];

        if (
        /*itemRequest*/
        ctx[0]) {
          if (if_block) {
            if_block.p(ctx, dirty);
            transition_in(if_block, 1);
          } else {
            if_block = create_if_block$5(ctx);
            if_block.c();
            transition_in(if_block, 1);
            if_block.m(form, null);
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
        if (current) return;
        transition_in(if_block);
        current = true;
      },
      o: function o(local) {
        transition_out(if_block);
        current = false;
      },
      d: function d(detaching) {
        if (detaching) detach(form);
        if (if_block) if_block.d();
      }
    };
  }

  var api$3 = "/api/v1";

  function instance$e($$self, $$props, $$invalidate) {
    var dispatch = createEventDispatcher();
    var itemId = $$props.itemId;
    var itemUrl = $$props.itemUrl;
    var itemNameSingular = $$props.itemNameSingular;
    var _$$props$legend = $$props.legend,
        legend = _$$props$legend === void 0 ? "Update ".concat(itemNameSingular) : _$$props$legend;
    var _$$props$submitText = $$props.submitText,
        submitText = _$$props$submitText === void 0 ? "Save" : _$$props$submitText;
    var _$$props$cancelText = $$props.cancelText,
        cancelText = _$$props$cancelText === void 0 ? "Cancel" : _$$props$cancelText;
    var itemRequest = $$props.itemRequest;
    var _$$props$submitHandle = $$props.submitHandler,
        submitHandler = _$$props$submitHandle === void 0 ? function (item, dispatch) {
      var _itemInfoExtract = itemInfoExtract(item),
          _itemInfoExtract2 = _slicedToArray(_itemInfoExtract, 2),
          itemInfo = _itemInfoExtract2[0],
          userItemInfo = _itemInfoExtract2[1];

      $$invalidate(0, itemRequest = fetch("".concat(api$3, "/").concat(itemUrl, "/").concat(itemId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "same-origin",
        body: JSON.stringify([itemInfo, userItemInfo])
      }).then(function (res) {
        return res.json();
      }).then(function (_) {
        return fetch("".concat(api$3, "/").concat(itemUrl, "/").concat(itemId, "/tags"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "same-origin",
          body: JSON.stringify(tags)
        }).then(function (res) {
          return res.json();
        });
      }));
    } : _$$props$submitHandle;
    var _$$props$itemIsValid = $$props.itemIsValid,
        itemIsValid = _$$props$itemIsValid === void 0 ? function (item) {
      return item[1].name.length > 0;
    } : _$$props$itemIsValid;
    var _$$props$processItemC = $$props.processItemCallback,
        processItemCallback = _$$props$processItemC === void 0 ? function (item) {
      return item;
    } : _$$props$processItemC;
    var _$$props$itemInfoExtr = $$props.itemInfoExtractCallback,
        itemInfoExtractCallback = _$$props$itemInfoExtr === void 0 ? function (item) {
      var itemInfo = {
        kind: item[1].kind,
        name: item[1].name,
        description: item[1].description
      };
      var userItemInfo = {
        permissions: item[0].permissions,
        ord: item[0].ord,
        url: item[0].url
      };
      return [itemInfo, userItemInfo];
    } : _$$props$itemInfoExtr;
    var item;
    var tags = [];

    function processItem(item) {
      return processItemCallback(item);
    }

    function itemInfoExtract(item) {
      return itemInfoExtractCallback(item);
    }

    function submitChanges() {
      if (itemIsValid(item)) {
        submitHandler(item, dispatch);
      }
    }

    function cancelChanges() {
      dispatch("cancel");
    }

    var _$$props$$$slots3 = $$props.$$slots,
        $$slots = _$$props$$$slots3 === void 0 ? {} : _$$props$$$slots3,
        $$scope = $$props.$$scope;

    function input0_input_handler() {
      item[1].name = this.value;
      ($$invalidate(4, item), $$invalidate(8, itemId)), $$invalidate(9, itemUrl);
    }

    function input1_input_handler() {
      item[1].description = this.value;
      ($$invalidate(4, item), $$invalidate(8, itemId)), $$invalidate(9, itemUrl);
    }

    function input2_input_handler() {
      item[0].url = this.value;
      ($$invalidate(4, item), $$invalidate(8, itemId)), $$invalidate(9, itemUrl);
    }

    function tags_1_tags_binding(value) {
      tags = value;
      ($$invalidate(5, tags), $$invalidate(8, itemId)), $$invalidate(9, itemUrl);
    }

    function permissions_value_binding(value) {
      item[0].permissions = value;
      ($$invalidate(4, item), $$invalidate(8, itemId)), $$invalidate(9, itemUrl);
    }

    $$self.$set = function ($$props) {
      if ("itemId" in $$props) $$invalidate(8, itemId = $$props.itemId);
      if ("itemUrl" in $$props) $$invalidate(9, itemUrl = $$props.itemUrl);
      if ("itemNameSingular" in $$props) $$invalidate(10, itemNameSingular = $$props.itemNameSingular);
      if ("legend" in $$props) $$invalidate(1, legend = $$props.legend);
      if ("submitText" in $$props) $$invalidate(2, submitText = $$props.submitText);
      if ("cancelText" in $$props) $$invalidate(3, cancelText = $$props.cancelText);
      if ("itemRequest" in $$props) $$invalidate(0, itemRequest = $$props.itemRequest);
      if ("submitHandler" in $$props) $$invalidate(11, submitHandler = $$props.submitHandler);
      if ("itemIsValid" in $$props) $$invalidate(12, itemIsValid = $$props.itemIsValid);
      if ("processItemCallback" in $$props) $$invalidate(13, processItemCallback = $$props.processItemCallback);
      if ("itemInfoExtractCallback" in $$props) $$invalidate(14, itemInfoExtractCallback = $$props.itemInfoExtractCallback);
      if ("$$scope" in $$props) $$invalidate(24, $$scope = $$props.$$scope);
    };

    $$self.$$.update = function () {
      if ($$self.$$.dirty &
      /*itemId, itemUrl*/
      768) {
        if (itemId) {
          $$invalidate(0, itemRequest = Promise.all([fetch("".concat(api$3, "/").concat(itemUrl, "/").concat(itemId)).then(function (res) {
            return res.json();
          }), fetch("".concat(api$3, "/").concat(itemUrl, "/").concat(itemId, "/tags")).then(function (res) {
            return res.json();
          })]).then(function (res) {
            var _res = _slicedToArray(res, 2),
                i0 = _res[0],
                t0 = _res[1];

            $$invalidate(4, item = processItem(i0));
            $$invalidate(5, tags = t0.map(function (tag) {
              return tag.name;
            }));
            return res;
          }));
        }
      }
    };

    return [itemRequest, legend, submitText, cancelText, item, tags, submitChanges, cancelChanges, itemId, itemUrl, itemNameSingular, submitHandler, itemIsValid, processItemCallback, itemInfoExtractCallback, dispatch, processItem, itemInfoExtract, $$slots, input0_input_handler, input1_input_handler, input2_input_handler, tags_1_tags_binding, permissions_value_binding, $$scope];
  }

  var UserItemForm = /*#__PURE__*/function (_SvelteComponent13) {
    _inherits(UserItemForm, _SvelteComponent13);

    var _super16 = _createSuper(UserItemForm);

    function UserItemForm(options) {
      var _this17;

      _classCallCheck(this, UserItemForm);

      _this17 = _super16.call(this);
      init(_assertThisInitialized(_this17), options, instance$e, create_fragment$e, safe_not_equal, {
        itemId: 8,
        itemUrl: 9,
        itemNameSingular: 10,
        legend: 1,
        submitText: 2,
        cancelText: 3,
        itemRequest: 0,
        submitHandler: 11,
        itemIsValid: 12,
        processItemCallback: 13,
        itemInfoExtractCallback: 14
      });
      return _this17;
    }

    return UserItemForm;
  }(SvelteComponent);
  /**
   * Gets the absolute bounding rect (accounts for the window's scroll position)
   * @param {HTMLElement }el
   * @return {{top: number, left: number, bottom: number, right: number}}
   */


  function getAbsoluteRect(el) {
    var rect = el.getBoundingClientRect();
    return {
      top: rect.top + window.scrollY,
      bottom: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      right: rect.right + window.scrollX
    };
  }
  /**
   * finds the center :)
   * @typedef {Object} Rect
   * @property {number} top
   * @property {number} bottom
   * @property {number} left
   * @property {number} right
   * @param {Rect} rect
   * @return {{x: number, y: number}}
   */


  function findCenter(rect) {
    return {
      x: (rect.left + rect.right) / 2,
      y: (rect.top + rect.bottom) / 2
    };
  }
  /**
   * @typedef {Object} Point
   * @property {number} x
   * @property {number} y
   * @param {Point} pointA
   * @param {Point} pointB
   * @return {number}
   */


  function calcDistance(pointA, pointB) {
    return Math.sqrt(Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2));
  }
  /**
   * @param {Point} point
   * @param {Rect} rect
   * @return {boolean|boolean}
   */


  function isPointInsideRect(point, rect) {
    return point.y <= rect.bottom && point.y >= rect.top && point.x >= rect.left && point.x <= rect.right;
  }
  /**
   * find the absolute coordinates of the center of a dom element
   * @param el {HTMLElement}
   * @returns {{x: number, y: number}}
   */


  function findCenterOfElement(el) {
    return findCenter(getAbsoluteRect(el));
  }
  /**
   * @param {HTMLElement} elA
   * @param {HTMLElement} elB
   * @return {boolean}
   */


  function isCenterOfAInsideB(elA, elB) {
    var centerOfA = findCenterOfElement(elA);
    var rectOfB = getAbsoluteRect(elB);
    return isPointInsideRect(centerOfA, rectOfB);
  }
  /**
   * @param {HTMLElement|ChildNode} elA
   * @param {HTMLElement|ChildNode} elB
   * @return {number}
   */


  function calcDistanceBetweenCenters(elA, elB) {
    var centerOfA = findCenterOfElement(elA);
    var centerOfB = findCenterOfElement(elB);
    return calcDistance(centerOfA, centerOfB);
  }
  /**
   * @param {HTMLElement} el - the element to check
   * @returns {boolean} - true if the element in its entirety is off screen including the scrollable area (the normal dom events look at the mouse rather than the element)
   */


  function isElementOffDocument(el) {
    var rect = getAbsoluteRect(el);
    return rect.right < 0 || rect.left > document.documentElement.scrollWidth || rect.bottom < 0 || rect.top > document.documentElement.scrollHeight;
  }
  /**
   * If the point is inside the element returns its distances from the sides, otherwise returns null
   * @param {Point} point
   * @param {HTMLElement} el
   * @return {null|{top: number, left: number, bottom: number, right: number}}
   */


  function calcInnerDistancesBetweenPointAndSidesOfElement(point, el) {
    var rect = getAbsoluteRect(el);

    if (!isPointInsideRect(point, rect)) {
      return null;
    }

    return {
      top: point.y - rect.top,
      bottom: rect.bottom - point.y,
      left: point.x - rect.left,
      // TODO - figure out what is so special about right (why the rect is too big)
      right: Math.min(rect.right, document.documentElement.clientWidth) - point.x
    };
  }
  /**
   * @typedef {Object} Index
   * @property {number} index - the would be index
   * @property {boolean} isProximityBased - false if the element is actually over the index, true if it is not over it but this index is the closest
   */

  /**
   * Find the index for the dragged element in the list it is dragged over
   * @param {HTMLElement} floatingAboveEl 
   * @param {HTMLElement} collectionBelowEl 
   * @returns {Index|null} -  if the element is over the container the Index object otherwise null
   */


  function findWouldBeIndex(floatingAboveEl, collectionBelowEl) {
    if (!isCenterOfAInsideB(floatingAboveEl, collectionBelowEl)) {
      return null;
    }

    var children = collectionBelowEl.children; // the container is empty, floating element should be the first 

    if (children.length === 0) {
      return {
        index: 0,
        isProximityBased: true
      };
    } // the search could be more efficient but keeping it simple for now
    // a possible improvement: pass in the lastIndex it was found in and check there first, then expand from there


    for (var i = 0; i < children.length; i++) {
      if (isCenterOfAInsideB(floatingAboveEl, children[i])) {
        return {
          index: i,
          isProximityBased: false
        };
      }
    } // this can happen if there is space around the children so the floating element has 
    //entered the container but not any of the children, in this case we will find the nearest child


    var minDistanceSoFar = Number.MAX_VALUE;
    var indexOfMin = undefined; // we are checking all of them because we don't know whether we are dealing with a horizontal or vertical container and where the floating element entered from

    for (var _i20 = 0; _i20 < children.length; _i20++) {
      var distance = calcDistanceBetweenCenters(floatingAboveEl, children[_i20]);

      if (distance < minDistanceSoFar) {
        minDistanceSoFar = distance;
        indexOfMin = _i20;
      }
    }

    return {
      index: indexOfMin,
      isProximityBased: true
    };
  } // external events


  var FINALIZE_EVENT_NAME = 'finalize';
  var CONSIDER_EVENT_NAME = 'consider';

  function dispatchFinalizeEvent(el, items) {
    el.dispatchEvent(new CustomEvent(FINALIZE_EVENT_NAME, {
      detail: {
        items: items
      }
    }));
  }

  function dispatchConsiderEvent(el, items) {
    el.dispatchEvent(new CustomEvent(CONSIDER_EVENT_NAME, {
      detail: {
        items: items
      }
    }));
  } // internal events


  var DRAGGED_ENTERED_EVENT_NAME = 'draggedentered';
  var DRAGGED_LEFT_EVENT_NAME = 'draggedleft';
  var DRAGGED_OVER_INDEX_EVENT_NAME = 'draggedoverindex';
  var DRAGGED_LEFT_DOCUMENT_EVENT_NAME = 'draggedleftdocument';

  function dispatchDraggedElementEnteredContainer(containerEl, indexObj, draggedEl) {
    containerEl.dispatchEvent(new CustomEvent(DRAGGED_ENTERED_EVENT_NAME, {
      detail: {
        indexObj: indexObj,
        draggedEl: draggedEl
      }
    }));
  }

  function dispatchDraggedElementLeftContainer(containerEl, draggedEl) {
    containerEl.dispatchEvent(new CustomEvent(DRAGGED_LEFT_EVENT_NAME, {
      detail: {
        draggedEl: draggedEl
      }
    }));
  }

  function dispatchDraggedElementIsOverIndex(containerEl, indexObj, draggedEl) {
    containerEl.dispatchEvent(new CustomEvent(DRAGGED_OVER_INDEX_EVENT_NAME, {
      detail: {
        indexObj: indexObj,
        draggedEl: draggedEl
      }
    }));
  }

  function dispatchDraggedLeftDocument(draggedEl) {
    window.dispatchEvent(new CustomEvent(DRAGGED_LEFT_DOCUMENT_EVENT_NAME, {
      detail: {
        draggedEl: draggedEl
      }
    }));
  }

  var SCROLL_ZONE_PX = 25;

  function makeScroller() {
    var scrollingInfo;

    function resetScrolling() {
      scrollingInfo = {
        directionObj: undefined,
        stepPx: 0
      };
    }

    resetScrolling(); // directionObj {x: 0|1|-1, y:0|1|-1} - 1 means down in y and right in x

    function scrollContainer(containerEl) {
      var _scrollingInfo = scrollingInfo,
          directionObj = _scrollingInfo.directionObj,
          stepPx = _scrollingInfo.stepPx;

      if (directionObj) {
        containerEl.scrollBy(directionObj.x * stepPx, directionObj.y * stepPx);
        window.requestAnimationFrame(function () {
          return scrollContainer(containerEl);
        });
      }
    }

    function calcScrollStepPx(distancePx) {
      return SCROLL_ZONE_PX - distancePx;
    }
    /**
     * If the pointer is next to the sides of the element to scroll, will trigger scrolling
     * Can be called repeatedly with updated pointer and elementToScroll values without issues
     * @return {boolean} - true if scrolling was needed
     */


    function scrollIfNeeded(pointer, elementToScroll) {
      if (!elementToScroll) {
        return false;
      }

      var distances = calcInnerDistancesBetweenPointAndSidesOfElement(pointer, elementToScroll);

      if (distances === null) {
        resetScrolling();
        return false;
      }

      var isAlreadyScrolling = !!scrollingInfo.directionObj;
      var scrollingVertically = false,
          scrollingHorizontally = false; // vertical

      if (elementToScroll.scrollHeight > elementToScroll.clientHeight) {
        if (distances.bottom < SCROLL_ZONE_PX) {
          scrollingVertically = true;
          scrollingInfo.directionObj = {
            x: 0,
            y: 1
          };
          scrollingInfo.stepPx = calcScrollStepPx(distances.bottom);
        } else if (distances.top < SCROLL_ZONE_PX) {
          scrollingVertically = true;
          scrollingInfo.directionObj = {
            x: 0,
            y: -1
          };
          scrollingInfo.stepPx = calcScrollStepPx(distances.top);
        }

        if (!isAlreadyScrolling && scrollingVertically) {
          scrollContainer(elementToScroll);
          return true;
        }
      } // horizontal


      if (elementToScroll.scrollWidth > elementToScroll.clientWidth) {
        if (distances.right < SCROLL_ZONE_PX) {
          scrollingHorizontally = true;
          scrollingInfo.directionObj = {
            x: 1,
            y: 0
          };
          scrollingInfo.stepPx = calcScrollStepPx(distances.right);
        } else if (distances.left < SCROLL_ZONE_PX) {
          scrollingHorizontally = true;
          scrollingInfo.directionObj = {
            x: -1,
            y: 0
          };
          scrollingInfo.stepPx = calcScrollStepPx(distances.left);
        }

        if (!isAlreadyScrolling && scrollingHorizontally) {
          scrollContainer(elementToScroll);
          return true;
        }
      }

      resetScrolling();
      return false;
    }

    return {
      scrollIfNeeded: scrollIfNeeded,
      resetScrolling: resetScrolling
    };
  }
  /**
   * @param {Object} object
   * @return {string}
   */


  function toString(object) {
    return JSON.stringify(object, null, 2);
  }
  /**
   * Finds the depth of the given node in the DOM tree
   * @param {HTMLElement} node
   * @return {number} - the depth of the node
   */


  function getDepth(node) {
    if (!node) {
      throw new Error("cannot get depth of a falsy node");
    }

    return _getDepth(node, 0);
  }

  function _getDepth(node) {
    var countSoFar = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    if (!node.parentElement) {
      return countSoFar - 1;
    }

    return _getDepth(node.parentElement, countSoFar + 1);
  }
  /**
   * A simple util to shallow compare objects quickly, it doesn't validate the arguments so pass objects in
   * @param {Object} objA
   * @param {Object} objB
   * @return {boolean} - true if objA and objB are shallow equal
   */


  function areObjectsShallowEqual(objA, objB) {
    if (Object.keys(objA).length !== Object.keys(objB).length) {
      return false;
    }

    for (var keyA in objA) {
      if (!objB.hasOwnProperty(keyA) || objB[keyA] !== objA[keyA]) {
        return false;
      }
    }

    return true;
  }

  var INTERVAL_MS = 200;
  var TOLERANCE_PX = 10;

  var _makeScroller = makeScroller(),
      scrollIfNeeded = _makeScroller.scrollIfNeeded,
      resetScrolling = _makeScroller.resetScrolling;

  var next;
  /**
   * Tracks the dragged elements and performs the side effects when it is dragged over a drop zone (basically dispatching custom-events scrolling)
   * @param {Set<HTMLElement>} dropZones 
   * @param {HTMLElement} draggedEl 
   * @param {number} [intervalMs = INTERVAL_MS]
   */

  function observe(draggedEl, dropZones) {
    var intervalMs = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : INTERVAL_MS;
    // initialization
    var lastDropZoneFound;
    var lastIndexFound;
    var lastIsDraggedInADropZone = false;
    var lastCentrePositionOfDragged; // We are sorting to make sure that in case of nested zones of the same type the one "on top" is considered first

    var dropZonesFromDeepToShallow = Array.from(dropZones).sort(function (dz1, dz2) {
      return getDepth(dz2) - getDepth(dz1);
    });
    /**
     * The main function in this module. Tracks where everything is/ should be a take the actions
     */

    function andNow() {
      var currentCenterOfDragged = findCenterOfElement(draggedEl);
      var scrolled = scrollIfNeeded(currentCenterOfDragged, lastDropZoneFound); // we only want to make a new decision after the element was moved a bit to prevent flickering

      if (!scrolled && lastCentrePositionOfDragged && Math.abs(lastCentrePositionOfDragged.x - currentCenterOfDragged.x) < TOLERANCE_PX && Math.abs(lastCentrePositionOfDragged.y - currentCenterOfDragged.y) < TOLERANCE_PX) {
        next = window.setTimeout(andNow, intervalMs);
        return;
      }

      if (isElementOffDocument(draggedEl)) {
        dispatchDraggedLeftDocument(draggedEl);
        return;
      }

      lastCentrePositionOfDragged = currentCenterOfDragged; // this is a simple algorithm, potential improvement: first look at lastDropZoneFound

      var isDraggedInADropZone = false;

      var _iterator = _createForOfIteratorHelper(dropZonesFromDeepToShallow),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var dz = _step.value;
          var indexObj = findWouldBeIndex(draggedEl, dz);

          if (indexObj === null) {
            // it is not inside
            continue;
          }

          var index = indexObj.index;
          isDraggedInADropZone = true; // the element is over a container

          if (dz !== lastDropZoneFound) {
            lastDropZoneFound && dispatchDraggedElementLeftContainer(lastDropZoneFound, draggedEl);
            dispatchDraggedElementEnteredContainer(dz, indexObj, draggedEl);
            lastDropZoneFound = dz;
            lastIndexFound = index;
          } else if (index !== lastIndexFound) {
            dispatchDraggedElementIsOverIndex(dz, indexObj, draggedEl);
            lastIndexFound = index;
          } // we handle looping with the 'continue' statement above


          break;
        } // the first time the dragged element is not in any dropzone we need to notify the last dropzone it was in

      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      if (!isDraggedInADropZone && lastIsDraggedInADropZone && lastDropZoneFound) {
        dispatchDraggedElementLeftContainer(lastDropZoneFound, draggedEl);
        lastDropZoneFound = undefined;
        lastIndexFound = undefined;
        lastIsDraggedInADropZone = false;
      } else {
        lastIsDraggedInADropZone = true;
      }

      next = window.setTimeout(andNow, intervalMs);
    }

    andNow();
  } // assumption - we can only observe one dragged element at a time, this could be changed in the future


  function unobserve() {
    clearTimeout(next);
    resetScrolling();
  }

  var INTERVAL_MS$1 = 300;
  var mousePosition;
  /**
   * Do not use this! it is visible for testing only until we get over the issue Cypress not triggering the mousemove listeners
   * // TODO - make private (remove export)
   * @param {{clientX: number, clientY: number}} e
   */

  function updateMousePosition(e) {
    var c = e.touches ? e.touches[0] : e;
    mousePosition = {
      x: c.clientX,
      y: c.clientY
    };
  }

  var _makeScroller2 = makeScroller(),
      scrollIfNeeded$1 = _makeScroller2.scrollIfNeeded,
      resetScrolling$1 = _makeScroller2.resetScrolling;

  var next$1;

  function loop$2() {
    if (mousePosition) {
      scrollIfNeeded$1(mousePosition, document.documentElement);
    }

    next$1 = window.setTimeout(loop$2, INTERVAL_MS$1);
  }
  /**
   * will start watching the mouse pointer and scroll the window if it goes next to the edges
   */


  function armWindowScroller() {
    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('touchmove', updateMousePosition);
    loop$2();
  }
  /**
   * will stop watching the mouse pointer and won't scroll the window anymore
   */


  function disarmWindowScroller() {
    window.removeEventListener('mousemove', updateMousePosition);
    window.removeEventListener('touchmove', updateMousePosition);
    mousePosition = undefined;
    window.clearTimeout(next$1);
    resetScrolling$1();
  }

  var TRANSITION_DURATION_SECONDS = 0.2;
  /**
   * private helper function - creates a transition string for a property
   * @param {string} property
   * @return {string} - the transition string
   */

  function trs(property) {
    return "".concat(property, " ").concat(TRANSITION_DURATION_SECONDS, "s ease");
  }
  /**
   * clones the given element and applies proper styles and transitions to the dragged element
   * @param {HTMLElement} originalElement
   * @return {Node} - the cloned, styled element
   */


  function createDraggedElementFrom(originalElement) {
    var rect = originalElement.getBoundingClientRect();
    var draggedEl = originalElement.cloneNode(true);
    draggedEl.id = "svelte-dnd-action-dragged-el";
    draggedEl.name = "svelte-dnd-action-dragged-el";
    draggedEl.style.position = "fixed";
    draggedEl.style.top = "".concat(rect.top, "px");
    draggedEl.style.left = "".concat(rect.left, "px");
    draggedEl.style.margin = '0'; // we can't have relative or automatic height and width or it will break the illusion

    draggedEl.style.boxSizing = 'border-box';
    draggedEl.style.height = "".concat(rect.height, "px");
    draggedEl.style.width = "".concat(rect.width, "px");
    draggedEl.style.transition = "".concat(trs('width'), ", ").concat(trs('height'), ", ").concat(trs('background-color'), ", ").concat(trs('opacity'), ", ").concat(trs('color'), " "); // this is a workaround for a strange browser bug that causes the right border to disappear when all the transitions are added at the same time

    window.setTimeout(function () {
      return draggedEl.style.transition += ", ".concat(trs('top'), ", ").concat(trs('left'));
    }, 0);
    draggedEl.style.zIndex = '9999';
    draggedEl.style.cursor = 'grabbing';
    return draggedEl;
  }
  /**
   * styles the dragged element to a 'dropped' state
   * @param {HTMLElement} draggedEl
   */


  function moveDraggedElementToWasDroppedState(draggedEl) {
    draggedEl.style.cursor = 'grab';
  }
  /**
   * Morphs the dragged element style, maintains the mouse pointer within the element
   * @param {HTMLElement} draggedEl
   * @param {HTMLElement} copyFromEl - the element the dragged element should look like, typically the shadow element
   * @param {number} currentMouseX
   * @param {number} currentMouseY
   * @param {function} transformDraggedElement - function to transform the dragged element, does nothing by default.
   */


  function morphDraggedElementToBeLike(draggedEl, copyFromEl, currentMouseX, currentMouseY, transformDraggedElement) {
    var newRect = copyFromEl.getBoundingClientRect();
    var draggedElRect = draggedEl.getBoundingClientRect();
    var widthChange = newRect.width - draggedElRect.width;
    var heightChange = newRect.height - draggedElRect.height;

    if (widthChange || heightChange) {
      var relativeDistanceOfMousePointerFromDraggedSides = {
        left: (currentMouseX - draggedElRect.left) / draggedElRect.width,
        top: (currentMouseY - draggedElRect.top) / draggedElRect.height
      };
      draggedEl.style.height = "".concat(newRect.height, "px");
      draggedEl.style.width = "".concat(newRect.width, "px");
      draggedEl.style.left = "".concat(parseFloat(draggedEl.style.left) - relativeDistanceOfMousePointerFromDraggedSides.left * widthChange, "px");
      draggedEl.style.top = "".concat(parseFloat(draggedEl.style.top) - relativeDistanceOfMousePointerFromDraggedSides.top * heightChange, "px");
    } /// other properties


    var computedStyle = window.getComputedStyle(copyFromEl);
    Array.from(computedStyle).filter(function (s) {
      return s.startsWith('background') || s.startsWith('padding') || s.startsWith('font') || s.startsWith('text') || s.startsWith('align') || s.startsWith('justify') || s.startsWith('display') || s.startsWith('flex') || s.startsWith('border') || s === 'opacity' || s === 'color';
    }).forEach(function (s) {
      return draggedEl.style.setProperty(s, computedStyle.getPropertyValue(s), computedStyle.getPropertyPriority(s));
    });
    transformDraggedElement();
  }
  /**
   * makes the element compatible with being draggable
   * @param {HTMLElement} draggableEl
   * @param {boolean} dragDisabled
   */


  function styleDraggable(draggableEl, dragDisabled) {
    draggableEl.draggable = false;

    draggableEl.ondragstart = function () {
      return false;
    };

    if (!dragDisabled) {
      draggableEl.style.userSelect = 'none';
      draggableEl.style.cursor = 'grab';
    } else {
      draggableEl.style.userSelect = '';
      draggableEl.style.cursor = '';
    }
  }
  /**
   * Hides the provided element so that it can stay in the dom without interrupting
   * @param {HTMLElement} dragTarget
   */


  function hideOriginalDragTarget(dragTarget) {
    dragTarget.style.display = 'none';
    dragTarget.style.position = 'fixed';
    dragTarget.style.zIndex = '-5';
  }
  /**
   * styles the shadow element
   * @param {HTMLElement} shadowEl
   */


  function styleShadowEl(shadowEl) {
    shadowEl.style.visibility = "hidden";
  }
  /**
   * will mark the given dropzones as visually active
   * @param {Array<HTMLElement>} dropZones
   * @param {Function} getStyles - maps a dropzone to a styles object (so the styles can be removed)
   */


  function styleActiveDropZones(dropZones) {
    var getStyles = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};
    dropZones.forEach(function (dz) {
      var styles = getStyles(dz);
      Object.keys(styles).forEach(function (style) {
        dz.style[style] = styles[style];
      });
    });
  }
  /**
   * will remove the 'active' styling from given dropzones
   * @param {Array<HTMLElement>} dropZones
   * @param {Function} getStyles - maps a dropzone to a styles object
   */


  function styleInactiveDropZones(dropZones) {
    var getStyles = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};
    dropZones.forEach(function (dz) {
      var styles = getStyles(dz);
      Object.keys(styles).forEach(function (style) {
        dz.style[style] = '';
      });
    });
  }

  var ITEM_ID_KEY = "id";
  var DEFAULT_DROP_ZONE_TYPE = '--any--';
  var MIN_OBSERVATION_INTERVAL_MS = 100;
  var MIN_MOVEMENT_BEFORE_DRAG_START_PX = 3;
  var DEFAULT_DROP_TARGET_STYLE = {
    outline: 'rgba(255, 255, 102, 0.7) solid 2px'
  };
  var originalDragTarget;
  var draggedEl;
  var draggedElData;
  var draggedElType;
  var originDropZone;
  var originIndex;
  var shadowElIdx;
  var shadowElData;
  var shadowElDropZone;
  var dragStartMousePosition;
  var currentMousePosition;
  var isWorkingOnPreviousDrag = false;
  var finalizingPreviousDrag = false; // a map from type to a set of drop-zones

  var typeToDropZones = new Map(); // important - this is needed because otherwise the config that would be used for everyone is the config of the element that created the event listeners

  var dzToConfig = new Map(); // this is needed in order to be able to cleanup old listeners and avoid stale closures issues (as the listener is defined within each zone)

  var elToMouseDownListener = new WeakMap();
  /* drop-zones registration management */

  function registerDropZone(dropZoneEl, type) {
    if (!typeToDropZones.has(type)) {
      typeToDropZones.set(type, new Set());
    }

    if (!typeToDropZones.get(type).has(dropZoneEl)) {
      typeToDropZones.get(type).add(dropZoneEl);
    }
  }

  function unregisterDropZone(dropZoneEl, type) {
    typeToDropZones.get(type)["delete"](dropZoneEl);

    if (typeToDropZones.get(type).size === 0) {
      typeToDropZones["delete"](type);
    }
  }
  /* functions to manage observing the dragged element and trigger custom drag-events */


  function watchDraggedElement() {
    armWindowScroller();
    var dropZones = typeToDropZones.get(draggedElType);

    var _iterator2 = _createForOfIteratorHelper(dropZones),
        _step2;

    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        var dz = _step2.value;
        dz.addEventListener(DRAGGED_ENTERED_EVENT_NAME, handleDraggedEntered);
        dz.addEventListener(DRAGGED_LEFT_EVENT_NAME, handleDraggedLeft);
        dz.addEventListener(DRAGGED_OVER_INDEX_EVENT_NAME, handleDraggedIsOverIndex);
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }

    window.addEventListener(DRAGGED_LEFT_DOCUMENT_EVENT_NAME, handleDrop); // it is important that we don't have an interval that is faster than the flip duration because it can cause elements to jump bach and forth

    var observationIntervalMs = Math.max.apply(Math, [MIN_OBSERVATION_INTERVAL_MS].concat(_toConsumableArray(Array.from(dropZones.keys()).map(function (dz) {
      return dzToConfig.get(dz).dropAnimationDurationMs;
    }))));
    observe(draggedEl, dropZones, observationIntervalMs * 1.07);
  }

  function unWatchDraggedElement() {
    disarmWindowScroller();
    var dropZones = typeToDropZones.get(draggedElType);

    var _iterator3 = _createForOfIteratorHelper(dropZones),
        _step3;

    try {
      for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
        var dz = _step3.value;
        dz.removeEventListener(DRAGGED_ENTERED_EVENT_NAME, handleDraggedEntered);
        dz.removeEventListener(DRAGGED_LEFT_EVENT_NAME, handleDraggedLeft);
        dz.removeEventListener(DRAGGED_OVER_INDEX_EVENT_NAME, handleDraggedIsOverIndex);
      }
    } catch (err) {
      _iterator3.e(err);
    } finally {
      _iterator3.f();
    }

    window.removeEventListener(DRAGGED_LEFT_DOCUMENT_EVENT_NAME, handleDrop);
    unobserve();
  }
  /* custom drag-events handlers */


  function handleDraggedEntered(e) {
    var _dzToConfig$get = dzToConfig.get(e.currentTarget),
        items = _dzToConfig$get.items,
        dropFromOthersDisabled = _dzToConfig$get.dropFromOthersDisabled;

    if (dropFromOthersDisabled && e.currentTarget !== originDropZone) {
      return;
    } // this deals with another svelte related race condition. in rare occasions (super rapid operations) the list hasn't updated yet


    items = items.filter(function (i) {
      return i.id !== shadowElData.id;
    });
    var _e$detail$indexObj = e.detail.indexObj,
        index = _e$detail$indexObj.index,
        isProximityBased = _e$detail$indexObj.isProximityBased;
    shadowElIdx = isProximityBased && index === e.currentTarget.children.length - 1 ? index + 1 : index;
    shadowElDropZone = e.currentTarget;
    items.splice(shadowElIdx, 0, shadowElData);
    dispatchConsiderEvent(e.currentTarget, items);
  }

  function handleDraggedLeft(e) {
    var _dzToConfig$get2 = dzToConfig.get(e.currentTarget),
        items = _dzToConfig$get2.items,
        dropFromOthersDisabled = _dzToConfig$get2.dropFromOthersDisabled;

    if (dropFromOthersDisabled && e.currentTarget !== originDropZone) {
      return;
    }

    items.splice(shadowElIdx, 1);
    shadowElIdx = undefined;
    shadowElDropZone = undefined;
    dispatchConsiderEvent(e.currentTarget, items);
  }

  function handleDraggedIsOverIndex(e) {
    var _dzToConfig$get3 = dzToConfig.get(e.currentTarget),
        items = _dzToConfig$get3.items,
        dropFromOthersDisabled = _dzToConfig$get3.dropFromOthersDisabled;

    if (dropFromOthersDisabled && e.currentTarget !== originDropZone) {
      return;
    }

    var index = e.detail.indexObj.index;
    items.splice(shadowElIdx, 1);
    items.splice(index, 0, shadowElData);
    shadowElIdx = index;
    dispatchConsiderEvent(e.currentTarget, items);
  }
  /* global mouse/touch-events handlers */


  function handleMouseMove(e) {
    e.preventDefault();
    var c = e.touches ? e.touches[0] : e;
    currentMousePosition = {
      x: c.clientX,
      y: c.clientY
    };
    draggedEl.style.transform = "translate3d(".concat(currentMousePosition.x - dragStartMousePosition.x, "px, ").concat(currentMousePosition.y - dragStartMousePosition.y, "px, 0)");
  }

  function handleDrop() {
    finalizingPreviousDrag = true; // cleanup

    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('touchmove', handleMouseMove);
    window.removeEventListener('mouseup', handleDrop);
    window.removeEventListener('touchend', handleDrop);
    unWatchDraggedElement();
    moveDraggedElementToWasDroppedState(draggedEl);

    if (!!shadowElDropZone) {
      var finalizeWithinZone = function finalizeWithinZone() {
        dispatchFinalizeEvent(shadowElDropZone, items);

        if (shadowElDropZone !== originDropZone) {
          // letting the origin drop zone know the element was permanently taken away
          dispatchFinalizeEvent(originDropZone, dzToConfig.get(originDropZone).items);
        }

        shadowElDropZone.children[shadowElIdx].style.visibility = '';
        cleanupPostDrop();
      };

      // it was dropped in a drop-zone
      var _dzToConfig$get4 = dzToConfig.get(shadowElDropZone),
          items = _dzToConfig$get4.items,
          type = _dzToConfig$get4.type;

      styleInactiveDropZones(typeToDropZones.get(type), function (dz) {
        return dzToConfig.get(dz).dropTargetStyle;
      });
      items = items.map(function (item) {
        return item.hasOwnProperty('isDndShadowItem') ? draggedElData : item;
      });
      animateDraggedToFinalPosition(finalizeWithinZone);
    } else {
      var finalizeBackToOrigin = function finalizeBackToOrigin() {
        _items.splice(originIndex, 1, draggedElData);

        dispatchFinalizeEvent(originDropZone, _items);
        shadowElDropZone.children[shadowElIdx].style.visibility = '';
        cleanupPostDrop();
      };

      // it needs to return to its place
      var _dzToConfig$get5 = dzToConfig.get(originDropZone),
          _items = _dzToConfig$get5.items,
          _type = _dzToConfig$get5.type;

      styleInactiveDropZones(typeToDropZones.get(_type), function (dz) {
        return dzToConfig.get(dz).dropTargetStyle;
      });

      _items.splice(originIndex, 0, shadowElData);

      shadowElDropZone = originDropZone;
      shadowElIdx = originIndex;
      dispatchConsiderEvent(originDropZone, _items);
      window.setTimeout(function () {
        return animateDraggedToFinalPosition(finalizeBackToOrigin);
      }, 0);
    }
  } // helper function for handleDrop


  function animateDraggedToFinalPosition(callback) {
    var shadowElRect = shadowElDropZone.children[shadowElIdx].getBoundingClientRect();
    var newTransform = {
      x: shadowElRect.left - parseFloat(draggedEl.style.left),
      y: shadowElRect.top - parseFloat(draggedEl.style.top)
    };

    var _dzToConfig$get6 = dzToConfig.get(shadowElDropZone),
        dropAnimationDurationMs = _dzToConfig$get6.dropAnimationDurationMs;

    var transition = "transform ".concat(dropAnimationDurationMs, "ms ease");
    draggedEl.style.transition = draggedEl.style.transition ? draggedEl.style.transition + "," + transition : transition;
    draggedEl.style.transform = "translate3d(".concat(newTransform.x, "px, ").concat(newTransform.y, "px, 0)");
    window.setTimeout(callback, dropAnimationDurationMs);
  }
  /* cleanup */


  function cleanupPostDrop() {
    draggedEl.remove();
    originalDragTarget.remove();
    draggedEl = undefined;
    originalDragTarget = undefined;
    draggedElData = undefined;
    draggedElType = undefined;
    originDropZone = undefined;
    originIndex = undefined;
    shadowElData = undefined;
    shadowElIdx = undefined;
    shadowElDropZone = undefined;
    dragStartMousePosition = undefined;
    currentMousePosition = undefined;
    isWorkingOnPreviousDrag = false;
    finalizingPreviousDrag = false;
  }
  /**
   * A Svelte custom action to turn any container to a dnd zone and all of its direct children to draggables
   * dispatches two events that the container is expected to react to by modifying its list of items,
   * which will then feed back in to this action via the update function
   *
   * @typedef {Object} Options
   * @property {Array} items - the list of items that was used to generate the children of the given node (the list used in the #each block
   * @property {string} [type] - the type of the dnd zone. children dragged from here can only be dropped in other zones of the same type, default to a base type
   * @property {number} [flipDurationMs] - if the list animated using flip (recommended), specifies the flip duration such that everything syncs with it without conflict, defaults to zero
   * @param {HTMLElement} node - the element to enhance
   * @param {Options} options
   * @return {{update: function, destroy: function}}
   */


  function dndzone(node, options) {
    var config = {
      items: [],
      type: undefined,
      flipDurationMs: 0,
      dragDisabled: false,
      dropFromOthersDisabled: false,
      dropTargetStyle: DEFAULT_DROP_TARGET_STYLE,
      transformDraggedElement: function transformDraggedElement() {}
    };
    var elToIdx = new Map();

    function addMaybeListeners() {
      window.addEventListener('mousemove', handleMouseMoveMaybeDragStart, {
        passive: false
      });
      window.addEventListener('touchmove', handleMouseMoveMaybeDragStart, {
        passive: false,
        capture: false
      });
      window.addEventListener('mouseup', handleFalseAlarm, {
        passive: false
      });
      window.addEventListener('touchend', handleFalseAlarm, {
        passive: false
      });
    }

    function removeMaybeListeners() {
      window.removeEventListener('mousemove', handleMouseMoveMaybeDragStart);
      window.removeEventListener('touchmove', handleMouseMoveMaybeDragStart);
      window.removeEventListener('mouseup', handleFalseAlarm);
      window.removeEventListener('touchend', handleFalseAlarm);
    }

    function handleFalseAlarm() {
      removeMaybeListeners();
      originalDragTarget = undefined;
      dragStartMousePosition = undefined;
      currentMousePosition = undefined;
    }

    function handleMouseMoveMaybeDragStart(e) {
      e.preventDefault();
      var c = e.touches ? e.touches[0] : e;
      currentMousePosition = {
        x: c.clientX,
        y: c.clientY
      };

      if (Math.abs(currentMousePosition.x - dragStartMousePosition.x) >= MIN_MOVEMENT_BEFORE_DRAG_START_PX || Math.abs(currentMousePosition.y - dragStartMousePosition.y) >= MIN_MOVEMENT_BEFORE_DRAG_START_PX) {
        removeMaybeListeners();
        handleDragStart();
      }
    }

    function handleMouseDown(e) {
      // prevents responding to any button but left click which equals 0 (which is falsy)
      if (e.button) {
        return;
      }

      if (isWorkingOnPreviousDrag) {
        return;
      }

      e.stopPropagation();
      var c = e.touches ? e.touches[0] : e;
      dragStartMousePosition = {
        x: c.clientX,
        y: c.clientY
      };
      currentMousePosition = _objectSpread({}, dragStartMousePosition);
      originalDragTarget = e.currentTarget;
      addMaybeListeners();
    }

    function handleDragStart() {
      isWorkingOnPreviousDrag = true; // initialising globals

      var currentIdx = elToIdx.get(originalDragTarget);
      originIndex = currentIdx;
      originDropZone = originalDragTarget.parentElement;
      var items = config.items,
          type = config.type;
      draggedElData = _objectSpread({}, items[currentIdx]);
      draggedElType = type;
      shadowElData = _objectSpread(_objectSpread({}, draggedElData), {}, {
        isDndShadowItem: true
      }); // creating the draggable element

      draggedEl = createDraggedElementFrom(originalDragTarget); // We will keep the original dom node in the dom because touch events keep firing on it, we want to re-add it after Svelte removes it

      function keepOriginalElementInDom() {
        var itemsNow = config.items;

        if (!draggedEl.parentElement && (!itemsNow[originIndex] || draggedElData[ITEM_ID_KEY] !== itemsNow[originIndex][ITEM_ID_KEY])) {
          document.body.appendChild(draggedEl);
          watchDraggedElement();
          hideOriginalDragTarget(originalDragTarget);
          document.body.appendChild(originalDragTarget);
        } else {
          window.requestAnimationFrame(keepOriginalElementInDom);
        }
      }

      window.requestAnimationFrame(keepOriginalElementInDom);
      styleActiveDropZones(Array.from(typeToDropZones.get(config.type)).filter(function (dz) {
        return dz === originDropZone || !dzToConfig.get(dz).dropFromOthersDisabled;
      }), function (dz) {
        return dzToConfig.get(dz).dropTargetStyle;
      }); // removing the original element by removing its data entry

      items.splice(currentIdx, 1);
      dispatchConsiderEvent(originDropZone, items); // handing over to global handlers - starting to watch the element

      window.addEventListener('mousemove', handleMouseMove, {
        passive: false
      });
      window.addEventListener('touchmove', handleMouseMove, {
        passive: false,
        capture: false
      });
      window.addEventListener('mouseup', handleDrop, {
        passive: false
      });
      window.addEventListener('touchend', handleDrop, {
        passive: false
      });
    }

    function configure(_ref41) {
      var _ref41$items = _ref41.items,
          items = _ref41$items === void 0 ? [] : _ref41$items,
          _ref41$flipDurationMs = _ref41.flipDurationMs,
          dropAnimationDurationMs = _ref41$flipDurationMs === void 0 ? 0 : _ref41$flipDurationMs,
          _ref41$type = _ref41.type,
          newType = _ref41$type === void 0 ? DEFAULT_DROP_ZONE_TYPE : _ref41$type,
          _ref41$dragDisabled = _ref41.dragDisabled,
          dragDisabled = _ref41$dragDisabled === void 0 ? false : _ref41$dragDisabled,
          _ref41$dropFromOthers = _ref41.dropFromOthersDisabled,
          dropFromOthersDisabled = _ref41$dropFromOthers === void 0 ? false : _ref41$dropFromOthers,
          _ref41$dropTargetStyl = _ref41.dropTargetStyle,
          dropTargetStyle = _ref41$dropTargetStyl === void 0 ? DEFAULT_DROP_TARGET_STYLE : _ref41$dropTargetStyl,
          _ref41$transformDragg = _ref41.transformDraggedElement,
          transformDraggedElement = _ref41$transformDragg === void 0 ? function () {} : _ref41$transformDragg,
          rest = _objectWithoutProperties(_ref41, ["items", "flipDurationMs", "type", "dragDisabled", "dropFromOthersDisabled", "dropTargetStyle", "transformDraggedElement"]);

      if (Object.keys(rest).length > 0) {}

      config.dropAnimationDurationMs = dropAnimationDurationMs;

      if (config.type && newType !== config.type) {
        unregisterDropZone(node, config.type);
      }

      config.type = newType;
      registerDropZone(node, newType);
      config.items = _toConsumableArray(items);
      config.dragDisabled = dragDisabled;
      config.transformDraggedElement = transformDraggedElement; // realtime update for dropTargetStyle

      if (isWorkingOnPreviousDrag && !finalizingPreviousDrag && !areObjectsShallowEqual(dropTargetStyle, config.dropTargetStyle)) {
        styleInactiveDropZones([node], function () {
          return config.dropTargetStyle;
        });
        styleActiveDropZones([node], function () {
          return dropTargetStyle;
        });
      }

      config.dropTargetStyle = dropTargetStyle; // realtime update for dropFromOthersDisabled

      if (isWorkingOnPreviousDrag && config.dropFromOthersDisabled !== dropFromOthersDisabled) {
        if (dropFromOthersDisabled) {
          styleInactiveDropZones([node], function (dz) {
            return dzToConfig.get(dz).dropTargetStyle;
          });
        } else {
          styleActiveDropZones([node], function (dz) {
            return dzToConfig.get(dz).dropTargetStyle;
          });
        }
      }

      config.dropFromOthersDisabled = dropFromOthersDisabled;
      dzToConfig.set(node, config);

      var _loop = function _loop(idx) {
        var draggableEl = node.children[idx];
        styleDraggable(draggableEl, dragDisabled);

        if (config.items[idx].hasOwnProperty('isDndShadowItem')) {
          morphDraggedElementToBeLike(draggedEl, draggableEl, currentMousePosition.x, currentMousePosition.y, function () {
            return config.transformDraggedElement(draggedEl, draggedElData, idx);
          });
          styleShadowEl(draggableEl);
          return "continue";
        }

        draggableEl.removeEventListener('mousedown', elToMouseDownListener.get(draggableEl));
        draggableEl.removeEventListener('touchstart', elToMouseDownListener.get(draggableEl));

        if (!dragDisabled) {
          draggableEl.addEventListener('mousedown', handleMouseDown);
          draggableEl.addEventListener('touchstart', handleMouseDown);
          elToMouseDownListener.set(draggableEl, handleMouseDown);
        } // updating the idx


        elToIdx.set(draggableEl, idx);
      };

      for (var idx = 0; idx < node.children.length; idx++) {
        var _ret = _loop(idx);

        if (_ret === "continue") continue;
      }
    }

    configure(options);
    return {
      update: function update(newOptions) {
        configure(newOptions);
      },
      destroy: function destroy() {
        unregisterDropZone(node, config.type);
        dzToConfig["delete"](node);
      }
    };
  }

  function flip(node, animation, params) {
    var style = getComputedStyle(node);
    var transform = style.transform === 'none' ? '' : style.transform;
    var scaleX = animation.from.width / node.clientWidth;
    var scaleY = animation.from.height / node.clientHeight;
    var dx = (animation.from.left - animation.to.left) / scaleX;
    var dy = (animation.from.top - animation.to.top) / scaleY;
    var d = Math.sqrt(dx * dx + dy * dy);
    var _params$delay = params.delay,
        delay = _params$delay === void 0 ? 0 : _params$delay,
        _params$duration = params.duration,
        duration = _params$duration === void 0 ? function (d) {
      return Math.sqrt(d) * 120;
    } : _params$duration,
        _params$easing = params.easing,
        easing = _params$easing === void 0 ? cubicOut : _params$easing;
    return {
      delay: delay,
      duration: is_function(duration) ? duration(d) : duration,
      easing: easing,
      css: function css(_t, u) {
        return "transform: ".concat(transform, " translate(").concat(u * dx, "px, ").concat(u * dy, "px);");
      }
    };
  }
  /* src/DndListSort.html generated by Svelte v3.20.1 */


  var get_default_slot_changes$2 = function get_default_slot_changes$2(dirty) {
    return {
      item: dirty &
      /*items*/
      1,
      id: dirty &
      /*items*/
      1
    };
  };

  var get_default_slot_context$2 = function get_default_slot_context$2(ctx) {
    return {
      item:
      /*item*/
      ctx[7],
      id:
      /*item*/
      ctx[7].id
    };
  };

  function get_each_context$4(ctx, list, i) {
    var child_ctx = ctx.slice();
    child_ctx[7] = list[i];
    return child_ctx;
  } // (18:4) {#each items as item(item.id)}


  function create_each_block$4(key_1, ctx) {
    var div;
    var t;
    var rect;
    var stop_animation = noop$1;
    var current;
    var default_slot_template =
    /*$$slots*/
    ctx[4]["default"];
    var default_slot = create_slot(default_slot_template, ctx,
    /*$$scope*/
    ctx[3], get_default_slot_context$2);
    return {
      key: key_1,
      first: null,
      c: function c() {
        div = element("div");
        if (default_slot) default_slot.c();
        t = space();
        this.first = div;
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);

        if (default_slot) {
          default_slot.m(div, null);
        }

        append(div, t);
        current = true;
      },
      p: function p(ctx, dirty) {
        if (default_slot) {
          if (default_slot.p && dirty &
          /*$$scope, items*/
          9) {
            default_slot.p(get_slot_context(default_slot_template, ctx,
            /*$$scope*/
            ctx[3], get_default_slot_context$2), get_slot_changes(default_slot_template,
            /*$$scope*/
            ctx[3], dirty, get_default_slot_changes$2));
          }
        }
      },
      r: function r() {
        rect = div.getBoundingClientRect();
      },
      f: function f() {
        fix_position(div);
        stop_animation();
      },
      a: function a() {
        stop_animation();
        stop_animation = create_animation(div, rect, flip, {
          duration: flipDurationMs
        });
      },
      i: function i(local) {
        if (current) return;
        transition_in(default_slot, local);
        current = true;
      },
      o: function o(local) {
        transition_out(default_slot, local);
        current = false;
      },
      d: function d(detaching) {
        if (detaching) detach(div);
        if (default_slot) default_slot.d(detaching);
      }
    };
  }

  function create_fragment$f(ctx) {
    var section;
    var each_blocks = [];
    var each_1_lookup = new Map();
    var dndzone_action;
    var current;
    var dispose;
    var each_value =
    /*items*/
    ctx[0];

    var get_key = function get_key(ctx) {
      return (
        /*item*/
        ctx[7].id
      );
    };

    for (var i = 0; i < each_value.length; i += 1) {
      var child_ctx = get_each_context$4(ctx, each_value, i);
      var key = get_key(child_ctx);
      each_1_lookup.set(key, each_blocks[i] = create_each_block$4(key, child_ctx));
    }

    return {
      c: function c() {
        section = element("section");

        for (var _i21 = 0; _i21 < each_blocks.length; _i21 += 1) {
          each_blocks[_i21].c();
        }
      },
      m: function m(target, anchor, remount) {
        insert(target, section, anchor);

        for (var _i22 = 0; _i22 < each_blocks.length; _i22 += 1) {
          each_blocks[_i22].m(section, null);
        }

        current = true;
        if (remount) run_all(dispose);
        dispose = [action_destroyer(dndzone_action = dndzone.call(null, section, {
          items:
          /*items*/
          ctx[0],
          flipDurationMs: flipDurationMs
        })), listen(section, "consider",
        /*handleSortFinalize*/
        ctx[1]), listen(section, "finalize",
        /*handleSortFinalize*/
        ctx[1]), listen(section, "consider",
        /*consider_handler*/
        ctx[5]), listen(section, "finalize",
        /*finalize_handler*/
        ctx[6])];
      },
      p: function p(ctx, _ref42) {
        var _ref43 = _slicedToArray(_ref42, 1),
            dirty = _ref43[0];

        if (dirty &
        /*$$scope, items*/
        9) {
          var _each_value =
          /*items*/
          ctx[0];
          group_outros();

          for (var _i23 = 0; _i23 < each_blocks.length; _i23 += 1) {
            each_blocks[_i23].r();
          }

          each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, _each_value, each_1_lookup, section, fix_and_outro_and_destroy_block, create_each_block$4, null, get_each_context$4);

          for (var _i24 = 0; _i24 < each_blocks.length; _i24 += 1) {
            each_blocks[_i24].a();
          }

          check_outros();
        }

        if (dndzone_action && is_function(dndzone_action.update) && dirty &
        /*items*/
        1) dndzone_action.update.call(null, {
          items:
          /*items*/
          ctx[0],
          flipDurationMs: flipDurationMs
        });
      },
      i: function i(local) {
        if (current) return;

        for (var _i25 = 0; _i25 < each_value.length; _i25 += 1) {
          transition_in(each_blocks[_i25]);
        }

        current = true;
      },
      o: function o(local) {
        for (var _i26 = 0; _i26 < each_blocks.length; _i26 += 1) {
          transition_out(each_blocks[_i26]);
        }

        current = false;
      },
      d: function d(detaching) {
        if (detaching) detach(section);

        for (var _i27 = 0; _i27 < each_blocks.length; _i27 += 1) {
          each_blocks[_i27].d();
        }

        run_all(dispose);
      }
    };
  }

  var flipDurationMs = 300;

  function instance$f($$self, $$props, $$invalidate) {
    var _$$props$items = $$props.items,
        items = _$$props$items === void 0 ? [] : _$$props$items;

    function handleSortConsider(e) {
      $$invalidate(0, items = e.detail.items);
    }

    function handleSortFinalize(e) {
      $$invalidate(0, items = e.detail.items);
    }

    var _$$props$$$slots4 = $$props.$$slots,
        $$slots = _$$props$$$slots4 === void 0 ? {} : _$$props$$$slots4,
        $$scope = $$props.$$scope;

    function consider_handler(event) {
      bubble($$self, event);
    }

    function finalize_handler(event) {
      bubble($$self, event);
    }

    $$self.$set = function ($$props) {
      if ("items" in $$props) $$invalidate(0, items = $$props.items);
      if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    };

    return [items, handleSortFinalize, handleSortConsider, $$scope, $$slots, consider_handler, finalize_handler];
  }

  var DndListSort = /*#__PURE__*/function (_SvelteComponent14) {
    _inherits(DndListSort, _SvelteComponent14);

    var _super17 = _createSuper(DndListSort);

    function DndListSort(options) {
      var _this18;

      _classCallCheck(this, DndListSort);

      _this18 = _super17.call(this);
      init(_assertThisInitialized(_this18), options, instance$f, create_fragment$f, safe_not_equal, {
        items: 0
      });
      return _this18;
    }

    return DndListSort;
  }(SvelteComponent);
  /* src/Modal.html generated by Svelte v3.20.1 */


  function create_if_block$6(ctx) {
    var div1;
    var div0;
    var div0_class_value;
    var div1_transition;
    var current;
    var default_slot_template =
    /*$$slots*/
    ctx[5]["default"];
    var default_slot = create_slot(default_slot_template, ctx,
    /*$$scope*/
    ctx[4], null);
    return {
      c: function c() {
        div1 = element("div");
        div0 = element("div");
        if (default_slot) default_slot.c();
        attr(div0, "class", div0_class_value = "" + (null_to_empty(
        /*modalClass*/
        ctx[1]) + " svelte-jf5047"));
        attr(div1, "class", "shadow-box svelte-jf5047");
      },
      m: function m(target, anchor) {
        insert(target, div1, anchor);
        append(div1, div0);

        if (default_slot) {
          default_slot.m(div0, null);
        }

        current = true;
      },
      p: function p(ctx, dirty) {
        if (default_slot) {
          if (default_slot.p && dirty &
          /*$$scope*/
          16) {
            default_slot.p(get_slot_context(default_slot_template, ctx,
            /*$$scope*/
            ctx[4], null), get_slot_changes(default_slot_template,
            /*$$scope*/
            ctx[4], dirty, null));
          }
        }

        if (!current || dirty &
        /*modalClass*/
        2 && div0_class_value !== (div0_class_value = "" + (null_to_empty(
        /*modalClass*/
        ctx[1]) + " svelte-jf5047"))) {
          attr(div0, "class", div0_class_value);
        }
      },
      i: function i(local) {
        if (current) return;
        transition_in(default_slot, local);
        add_render_callback(function () {
          if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fade, {
            duration: 200
          }, true);
          div1_transition.run(1);
        });
        current = true;
      },
      o: function o(local) {
        transition_out(default_slot, local);
        if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fade, {
          duration: 200
        }, false);
        div1_transition.run(0);
        current = false;
      },
      d: function d(detaching) {
        if (detaching) detach(div1);
        if (default_slot) default_slot.d(detaching);
        if (detaching && div1_transition) div1_transition.end();
      }
    };
  }

  function create_fragment$g(ctx) {
    var if_block_anchor;
    var current;
    var if_block =
    /*shown*/
    ctx[0] && create_if_block$6(ctx);
    return {
      c: function c() {
        if (if_block) if_block.c();
        if_block_anchor = empty();
      },
      m: function m(target, anchor) {
        if (if_block) if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
        current = true;
      },
      p: function p(ctx, _ref44) {
        var _ref45 = _slicedToArray(_ref44, 1),
            dirty = _ref45[0];

        if (
        /*shown*/
        ctx[0]) {
          if (if_block) {
            if_block.p(ctx, dirty);
            transition_in(if_block, 1);
          } else {
            if_block = create_if_block$6(ctx);
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
        if (current) return;
        transition_in(if_block);
        current = true;
      },
      o: function o(local) {
        transition_out(if_block);
        current = false;
      },
      d: function d(detaching) {
        if (if_block) if_block.d(detaching);
        if (detaching) detach(if_block_anchor);
      }
    };
  }

  function instance$g($$self, $$props, $$invalidate) {
    var _$$props$shown = $$props.shown,
        shown = _$$props$shown === void 0 ? false : _$$props$shown;
    var _$$props$modalClass = $$props.modalClass,
        modalClass = _$$props$modalClass === void 0 ? "modal-window" : _$$props$modalClass;

    function showModal() {
      $$invalidate(0, shown = true);
    }

    function hideModal() {
      $$invalidate(0, shown = false);
    }

    var _$$props$$$slots5 = $$props.$$slots,
        $$slots = _$$props$$$slots5 === void 0 ? {} : _$$props$$$slots5,
        $$scope = $$props.$$scope;

    $$self.$set = function ($$props) {
      if ("shown" in $$props) $$invalidate(0, shown = $$props.shown);
      if ("modalClass" in $$props) $$invalidate(1, modalClass = $$props.modalClass);
      if ("$$scope" in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    };

    return [shown, modalClass, showModal, hideModal, $$scope, $$slots];
  }

  var Modal = /*#__PURE__*/function (_SvelteComponent15) {
    _inherits(Modal, _SvelteComponent15);

    var _super18 = _createSuper(Modal);

    function Modal(options) {
      var _this19;

      _classCallCheck(this, Modal);

      _this19 = _super18.call(this);
      init(_assertThisInitialized(_this19), options, instance$g, create_fragment$g, safe_not_equal, {
        shown: 0,
        modalClass: 1
      });
      return _this19;
    }

    return Modal;
  }(SvelteComponent);
  /* src/AlertConfirm.html generated by Svelte v3.20.1 */


  function create_default_slot$4(ctx) {
    var div4;
    var div2;
    var div0;
    var t0;
    var div1;
    var t1;
    var t2;
    var div3;
    var button0;
    var t3;
    var t4;
    var button1;
    var t5;
    var current;
    var dispose;
    var switch_instance_spread_levels = [
    /*iconProps*/
    ctx[2]];
    var switch_value =
    /*iconComponent*/
    ctx[1];

    function switch_props(ctx) {
      var switch_instance_props = {};

      for (var i = 0; i < switch_instance_spread_levels.length; i += 1) {
        switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
      }

      return {
        props: switch_instance_props
      };
    }

    if (switch_value) {
      var switch_instance = new switch_value(switch_props());
    }

    return {
      c: function c() {
        div4 = element("div");
        div2 = element("div");
        div0 = element("div");
        if (switch_instance) create_component(switch_instance.$$.fragment);
        t0 = space();
        div1 = element("div");
        t1 = text(
        /*message*/
        ctx[4]);
        t2 = space();
        div3 = element("div");
        button0 = element("button");
        t3 = text(
        /*confirmLabel*/
        ctx[5]);
        t4 = space();
        button1 = element("button");
        t5 = text(
        /*cancelLabel*/
        ctx[6]);
        attr(div0, "class", "alert-confirm-icon svelte-mjdpy2");
        attr(div1, "class", "alert-confirm-message-text svelte-mjdpy2");
        attr(div2, "class", "alert-confirm-message svelte-mjdpy2");
        attr(button0, "type", "button");
        attr(button1, "type", "button");
        attr(div3, "class", "alert-confirm-controls svelte-mjdpy2");
        attr(div4, "class", "alert-confirm svelte-mjdpy2");
      },
      m: function m(target, anchor, remount) {
        insert(target, div4, anchor);
        append(div4, div2);
        append(div2, div0);

        if (switch_instance) {
          mount_component(switch_instance, div0, null);
        }

        append(div2, t0);
        append(div2, div1);
        append(div1, t1);
        append(div4, t2);
        append(div4, div3);
        append(div3, button0);
        append(button0, t3);
        append(div3, t4);
        append(div3, button1);
        append(button1, t5);
        current = true;
        if (remount) run_all(dispose);
        dispose = [listen(button0, "click",
        /*click_handler*/
        ctx[10]), listen(button1, "click",
        /*click_handler_1*/
        ctx[11])];
      },
      p: function p(ctx, dirty) {
        var switch_instance_changes = dirty &
        /*iconProps*/
        4 ? get_spread_update(switch_instance_spread_levels, [get_spread_object(
        /*iconProps*/
        ctx[2])]) : {};

        if (switch_value !== (switch_value =
        /*iconComponent*/
        ctx[1])) {
          if (switch_instance) {
            group_outros();
            var old_component = switch_instance;
            transition_out(old_component.$$.fragment, 1, 0, function () {
              destroy_component(old_component, 1);
            });
            check_outros();
          }

          if (switch_value) {
            switch_instance = new switch_value(switch_props());
            create_component(switch_instance.$$.fragment);
            transition_in(switch_instance.$$.fragment, 1);
            mount_component(switch_instance, div0, null);
          } else {
            switch_instance = null;
          }
        } else if (switch_value) {
          switch_instance.$set(switch_instance_changes);
        }

        if (!current || dirty &
        /*message*/
        16) set_data(t1,
        /*message*/
        ctx[4]);
        if (!current || dirty &
        /*confirmLabel*/
        32) set_data(t3,
        /*confirmLabel*/
        ctx[5]);
        if (!current || dirty &
        /*cancelLabel*/
        64) set_data(t5,
        /*cancelLabel*/
        ctx[6]);
      },
      i: function i(local) {
        if (current) return;
        if (switch_instance) transition_in(switch_instance.$$.fragment, local);
        current = true;
      },
      o: function o(local) {
        if (switch_instance) transition_out(switch_instance.$$.fragment, local);
        current = false;
      },
      d: function d(detaching) {
        if (detaching) detach(div4);
        if (switch_instance) destroy_component(switch_instance);
        run_all(dispose);
      }
    };
  }

  function create_fragment$h(ctx) {
    var updating_shown;
    var current;

    function modal_shown_binding(value) {
      /*modal_shown_binding*/
      ctx[12].call(null, value);
    }

    var modal_props = {
      modalClass:
      /*modalClass*/
      ctx[3],
      $$slots: {
        "default": [create_default_slot$4]
      },
      $$scope: {
        ctx: ctx
      }
    };

    if (
    /*shown*/
    ctx[0] !== void 0) {
      modal_props.shown =
      /*shown*/
      ctx[0];
    }

    var modal = new Modal({
      props: modal_props
    });
    binding_callbacks.push(function () {
      return bind$1(modal, "shown", modal_shown_binding);
    });
    return {
      c: function c() {
        create_component(modal.$$.fragment);
      },
      m: function m(target, anchor) {
        mount_component(modal, target, anchor);
        current = true;
      },
      p: function p(ctx, _ref46) {
        var _ref47 = _slicedToArray(_ref46, 1),
            dirty = _ref47[0];

        var modal_changes = {};
        if (dirty &
        /*modalClass*/
        8) modal_changes.modalClass =
        /*modalClass*/
        ctx[3];

        if (dirty &
        /*$$scope, cancelLabel, confirmLabel, message, iconComponent, iconProps*/
        8310) {
          modal_changes.$$scope = {
            dirty: dirty,
            ctx: ctx
          };
        }

        if (!updating_shown && dirty &
        /*shown*/
        1) {
          updating_shown = true;
          modal_changes.shown =
          /*shown*/
          ctx[0];
          add_flush_callback(function () {
            return updating_shown = false;
          });
        }

        modal.$set(modal_changes);
      },
      i: function i(local) {
        if (current) return;
        transition_in(modal.$$.fragment, local);
        current = true;
      },
      o: function o(local) {
        transition_out(modal.$$.fragment, local);
        current = false;
      },
      d: function d(detaching) {
        destroy_component(modal, detaching);
      }
    };
  }

  function instance$h($$self, $$props, $$invalidate) {
    var dispatch = createEventDispatcher();
    var _$$props$shown2 = $$props.shown,
        shown = _$$props$shown2 === void 0 ? false : _$$props$shown2;
    var _$$props$iconComponen = $$props.iconComponent,
        iconComponent = _$$props$iconComponen === void 0 ? Alert : _$$props$iconComponen;
    var _$$props$iconColor = $$props.iconColor,
        iconColor = _$$props$iconColor === void 0 ? "#f80" : _$$props$iconColor;
    var _$$props$iconSize3 = $$props.iconSize,
        iconSize = _$$props$iconSize3 === void 0 ? 24 : _$$props$iconSize3;
    var _$$props$iconProps = $$props.iconProps,
        iconProps = _$$props$iconProps === void 0 ? {
      color: iconColor,
      size: iconSize
    } : _$$props$iconProps;
    var _$$props$modalClass2 = $$props.modalClass,
        modalClass = _$$props$modalClass2 === void 0 ? "modal-window" : _$$props$modalClass2;
    var _$$props$message = $$props.message,
        message = _$$props$message === void 0 ? "Are you sure?" : _$$props$message;
    var _$$props$confirmLabel = $$props.confirmLabel,
        confirmLabel = _$$props$confirmLabel === void 0 ? "Confirm" : _$$props$confirmLabel;
    var _$$props$cancelLabel = $$props.cancelLabel,
        cancelLabel = _$$props$cancelLabel === void 0 ? "Cancel" : _$$props$cancelLabel;

    var click_handler = function click_handler(e) {
      return dispatch("confirm");
    };

    var click_handler_1 = function click_handler_1(e) {
      return dispatch("cancel");
    };

    function modal_shown_binding(value) {
      shown = value;
      $$invalidate(0, shown);
    }

    $$self.$set = function ($$props) {
      if ("shown" in $$props) $$invalidate(0, shown = $$props.shown);
      if ("iconComponent" in $$props) $$invalidate(1, iconComponent = $$props.iconComponent);
      if ("iconColor" in $$props) $$invalidate(8, iconColor = $$props.iconColor);
      if ("iconSize" in $$props) $$invalidate(9, iconSize = $$props.iconSize);
      if ("iconProps" in $$props) $$invalidate(2, iconProps = $$props.iconProps);
      if ("modalClass" in $$props) $$invalidate(3, modalClass = $$props.modalClass);
      if ("message" in $$props) $$invalidate(4, message = $$props.message);
      if ("confirmLabel" in $$props) $$invalidate(5, confirmLabel = $$props.confirmLabel);
      if ("cancelLabel" in $$props) $$invalidate(6, cancelLabel = $$props.cancelLabel);
    };

    return [shown, iconComponent, iconProps, modalClass, message, confirmLabel, cancelLabel, dispatch, iconColor, iconSize, click_handler, click_handler_1, modal_shown_binding];
  }

  var AlertConfirm = /*#__PURE__*/function (_SvelteComponent16) {
    _inherits(AlertConfirm, _SvelteComponent16);

    var _super19 = _createSuper(AlertConfirm);

    function AlertConfirm(options) {
      var _this20;

      _classCallCheck(this, AlertConfirm);

      _this20 = _super19.call(this);
      init(_assertThisInitialized(_this20), options, instance$h, create_fragment$h, safe_not_equal, {
        shown: 0,
        iconComponent: 1,
        iconColor: 8,
        iconSize: 9,
        iconProps: 2,
        modalClass: 3,
        message: 4,
        confirmLabel: 5,
        cancelLabel: 6
      });
      return _this20;
    }

    return AlertConfirm;
  }(SvelteComponent);
  /* src/UserItemList.html generated by Svelte v3.20.1 */


  var get_default_slot_changes$3 = function get_default_slot_changes$3(dirty) {
    return {
      item: dirty &
      /*item*/
      1073741824
    };
  };

  var get_default_slot_context$3 = function get_default_slot_context$3(ctx) {
    return {
      item:
      /*item*/
      ctx[30]
    };
  }; // (181:0) {:catch err}


  function create_catch_block$5(ctx) {
    var div;
    var t0;
    var p;
    var t1;
    var t2_value =
    /*err*/
    ctx[29].message + "";
    var t2;
    var current;
    var alert = new Alert({
      props: {
        color: "#F80",
        size:
        /*iconSize*/
        ctx[3]
      }
    });
    return {
      c: function c() {
        div = element("div");
        create_component(alert.$$.fragment);
        t0 = space();
        p = element("p");
        t1 = text("Error: ");
        t2 = text(t2_value);
        attr(div, "class", "error svelte-9hp4i1");
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
        mount_component(alert, div, null);
        append(div, t0);
        append(div, p);
        append(p, t1);
        append(p, t2);
        current = true;
      },
      p: function p(ctx, dirty) {
        var alert_changes = {};
        if (dirty &
        /*iconSize*/
        8) alert_changes.size =
        /*iconSize*/
        ctx[3];
        alert.$set(alert_changes);
        if ((!current || dirty &
        /*itemsReq*/
        128) && t2_value !== (t2_value =
        /*err*/
        ctx[29].message + "")) set_data(t2, t2_value);
      },
      i: function i(local) {
        if (current) return;
        transition_in(alert.$$.fragment, local);
        current = true;
      },
      o: function o(local) {
        transition_out(alert.$$.fragment, local);
        current = false;
      },
      d: function d(detaching) {
        if (detaching) detach(div);
        destroy_component(alert);
      }
    };
  } // (154:0) {:then _}


  function create_then_block$5(ctx) {
    var current_block_type_index;
    var if_block0;
    var t;
    var if_block1_anchor;
    var current;
    var if_block_creators = [create_if_block_1$5, create_else_block$4];
    var if_blocks = [];

    function select_block_type(ctx, dirty) {
      if (
      /*items*/
      ctx[6] &&
      /*items*/
      ctx[6].length) return 0;
      return 1;
    }

    current_block_type_index = select_block_type(ctx);
    if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    var if_block1 =
    /*orderHasChanged*/
    ctx[10] && create_if_block$7(ctx);
    return {
      c: function c() {
        if_block0.c();
        t = space();
        if (if_block1) if_block1.c();
        if_block1_anchor = empty();
      },
      m: function m(target, anchor) {
        if_blocks[current_block_type_index].m(target, anchor);
        insert(target, t, anchor);
        if (if_block1) if_block1.m(target, anchor);
        insert(target, if_block1_anchor, anchor);
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
          if_block0 = if_blocks[current_block_type_index];

          if (!if_block0) {
            if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
            if_block0.c();
          }

          transition_in(if_block0, 1);
          if_block0.m(t.parentNode, t);
        }

        if (
        /*orderHasChanged*/
        ctx[10]) {
          if (if_block1) {
            if_block1.p(ctx, dirty);
          } else {
            if_block1 = create_if_block$7(ctx);
            if_block1.c();
            if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
          }
        } else if (if_block1) {
          if_block1.d(1);
          if_block1 = null;
        }
      },
      i: function i(local) {
        if (current) return;
        transition_in(if_block0);
        current = true;
      },
      o: function o(local) {
        transition_out(if_block0);
        current = false;
      },
      d: function d(detaching) {
        if_blocks[current_block_type_index].d(detaching);
        if (detaching) detach(t);
        if (if_block1) if_block1.d(detaching);
        if (detaching) detach(if_block1_anchor);
      }
    };
  } // (173:0) {:else}


  function create_else_block$4(ctx) {
    var div;
    var p;
    var t0;
    var t1;
    var t2;
    return {
      c: function c() {
        div = element("div");
        p = element("p");
        t0 = text("No ");
        t1 = text(
        /*itemNamePlural*/
        ctx[1]);
        t2 = text(" found.");
        attr(div, "class", "empty svelte-9hp4i1");
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
        append(div, p);
        append(p, t0);
        append(p, t1);
        append(p, t2);
      },
      p: function p(ctx, dirty) {
        if (dirty &
        /*itemNamePlural*/
        2) set_data(t1,
        /*itemNamePlural*/
        ctx[1]);
      },
      i: noop$1,
      o: noop$1,
      d: function d(detaching) {
        if (detaching) detach(div);
      }
    };
  } // (155:0) {#if items && items.length}


  function create_if_block_1$5(ctx) {
    var updating_items;
    var current;

    function dndlistsort_items_binding(value) {
      /*dndlistsort_items_binding*/
      ctx[25].call(null, value);
    }

    var dndlistsort_props = {
      $$slots: {
        "default": [create_default_slot_1, function (_ref48) {
          var item = _ref48.item;
          return {
            30: item
          };
        }, function (_ref49) {
          var item = _ref49.item;
          return item ? 1073741824 : 0;
        }]
      },
      $$scope: {
        ctx: ctx
      }
    };

    if (
    /*items*/
    ctx[6] !== void 0) {
      dndlistsort_props.items =
      /*items*/
      ctx[6];
    }

    var dndlistsort = new DndListSort({
      props: dndlistsort_props
    });
    binding_callbacks.push(function () {
      return bind$1(dndlistsort, "items", dndlistsort_items_binding);
    });
    dndlistsort.$on("finalize",
    /*orderChanged*/
    ctx[11]);
    return {
      c: function c() {
        create_component(dndlistsort.$$.fragment);
      },
      m: function m(target, anchor) {
        mount_component(dndlistsort, target, anchor);
        current = true;
      },
      p: function p(ctx, dirty) {
        var dndlistsort_changes = {};

        if (dirty &
        /*$$scope, deleteItem, iconSize, editItem, itemUrl, item*/
        1207960329) {
          dndlistsort_changes.$$scope = {
            dirty: dirty,
            ctx: ctx
          };
        }

        if (!updating_items && dirty &
        /*items*/
        64) {
          updating_items = true;
          dndlistsort_changes.items =
          /*items*/
          ctx[6];
          add_flush_callback(function () {
            return updating_items = false;
          });
        }

        dndlistsort.$set(dndlistsort_changes);
      },
      i: function i(local) {
        if (current) return;
        transition_in(dndlistsort.$$.fragment, local);
        current = true;
      },
      o: function o(local) {
        transition_out(dndlistsort.$$.fragment, local);
        current = false;
      },
      d: function d(detaching) {
        destroy_component(dndlistsort, detaching);
      }
    };
  } // (161:21)              


  function fallback_block$2(ctx) {
    var a;
    var div;
    var h6;
    var t0_value =
    /*item*/
    ctx[30].name + "";
    var t0;
    var t1;
    var p;
    var t2_value =
    /*item*/
    ctx[30].description + "";
    var t2;
    var a_href_value;
    return {
      c: function c() {
        a = element("a");
        div = element("div");
        h6 = element("h6");
        t0 = text(t0_value);
        t1 = space();
        p = element("p");
        t2 = text(t2_value);
        attr(h6, "class", "svelte-9hp4i1");
        attr(p, "class", "svelte-9hp4i1");
        attr(div, "class", "item-list-info svelte-9hp4i1");
        attr(a, "href", a_href_value = "/user/" +
        /*itemUrl*/
        ctx[0] + "/" +
        /*item*/
        ctx[30].uuid);
        attr(a, "class", "svelte-9hp4i1");
      },
      m: function m(target, anchor) {
        insert(target, a, anchor);
        append(a, div);
        append(div, h6);
        append(h6, t0);
        append(div, t1);
        append(div, p);
        append(p, t2);
      },
      p: function p(ctx, dirty) {
        if (dirty &
        /*item*/
        1073741824 && t0_value !== (t0_value =
        /*item*/
        ctx[30].name + "")) set_data(t0, t0_value);
        if (dirty &
        /*item*/
        1073741824 && t2_value !== (t2_value =
        /*item*/
        ctx[30].description + "")) set_data(t2, t2_value);

        if (dirty &
        /*itemUrl, item*/
        1073741825 && a_href_value !== (a_href_value = "/user/" +
        /*itemUrl*/
        ctx[0] + "/" +
        /*item*/
        ctx[30].uuid)) {
          attr(a, "href", a_href_value);
        }
      },
      d: function d(detaching) {
        if (detaching) detach(a);
      }
    };
  } // (156:0) <DndListSort bind:items={items} let:item={item} on:finalize={orderChanged}>


  function create_default_slot_1(ctx) {
    var div;
    var button0;
    var t0;
    var t1;
    var button1;
    var t2;
    var button2;
    var current;
    var dispose;
    var reorderhorizontal = new ReorderHorizontal({
      props: {
        color: "var(--accent-color-1)",
        size:
        /*iconSize*/
        ctx[3]
      }
    });
    var default_slot_template =
    /*$$slots*/
    ctx[22]["default"];
    var default_slot = create_slot(default_slot_template, ctx,
    /*$$scope*/
    ctx[27], get_default_slot_context$3);
    var default_slot_or_fallback = default_slot || fallback_block$2(ctx);
    var penciloutline = new PencilOutline({
      props: {
        size:
        /*iconSize*/
        ctx[3]
      }
    });

    function click_handler() {
      var _ctx3;

      for (var _len3 = arguments.length, args = new Array(_len3), _key6 = 0; _key6 < _len3; _key6++) {
        args[_key6] = arguments[_key6];
      }

      return (
        /*click_handler*/
        (_ctx3 = ctx)[23].apply(_ctx3, [
        /*item*/
        ctx[30]].concat(args))
      );
    }

    var delete_1 = new Delete({
      props: {
        size:
        /*iconSize*/
        ctx[3]
      }
    });

    function click_handler_1() {
      var _ctx4;

      for (var _len4 = arguments.length, args = new Array(_len4), _key7 = 0; _key7 < _len4; _key7++) {
        args[_key7] = arguments[_key7];
      }

      return (
        /*click_handler_1*/
        (_ctx4 = ctx)[24].apply(_ctx4, [
        /*item*/
        ctx[30]].concat(args))
      );
    }

    return {
      c: function c() {
        div = element("div");
        button0 = element("button");
        create_component(reorderhorizontal.$$.fragment);
        t0 = space();
        if (default_slot_or_fallback) default_slot_or_fallback.c();
        t1 = space();
        button1 = element("button");
        create_component(penciloutline.$$.fragment);
        t2 = space();
        button2 = element("button");
        create_component(delete_1.$$.fragment);
        attr(button0, "class", "svelte-9hp4i1");
        attr(button1, "class", "edit-button svelte-9hp4i1");
        attr(button1, "type", "button");
        attr(button2, "class", "delete-button svelte-9hp4i1");
        attr(button2, "type", "button");
        attr(div, "class", "item-list-item svelte-9hp4i1");
      },
      m: function m(target, anchor, remount) {
        insert(target, div, anchor);
        append(div, button0);
        mount_component(reorderhorizontal, button0, null);
        append(div, t0);

        if (default_slot_or_fallback) {
          default_slot_or_fallback.m(div, null);
        }

        append(div, t1);
        append(div, button1);
        mount_component(penciloutline, button1, null);
        append(div, t2);
        append(div, button2);
        mount_component(delete_1, button2, null);
        current = true;
        if (remount) run_all(dispose);
        dispose = [listen(button1, "click", click_handler), listen(button2, "click", click_handler_1)];
      },
      p: function p(new_ctx, dirty) {
        ctx = new_ctx;
        var reorderhorizontal_changes = {};
        if (dirty &
        /*iconSize*/
        8) reorderhorizontal_changes.size =
        /*iconSize*/
        ctx[3];
        reorderhorizontal.$set(reorderhorizontal_changes);

        if (default_slot) {
          if (default_slot.p && dirty &
          /*$$scope, item*/
          1207959552) {
            default_slot.p(get_slot_context(default_slot_template, ctx,
            /*$$scope*/
            ctx[27], get_default_slot_context$3), get_slot_changes(default_slot_template,
            /*$$scope*/
            ctx[27], dirty, get_default_slot_changes$3));
          }
        } else {
          if (default_slot_or_fallback && default_slot_or_fallback.p && dirty &
          /*itemUrl, item*/
          1073741825) {
            default_slot_or_fallback.p(ctx, dirty);
          }
        }

        var penciloutline_changes = {};
        if (dirty &
        /*iconSize*/
        8) penciloutline_changes.size =
        /*iconSize*/
        ctx[3];
        penciloutline.$set(penciloutline_changes);
        var delete_1_changes = {};
        if (dirty &
        /*iconSize*/
        8) delete_1_changes.size =
        /*iconSize*/
        ctx[3];
        delete_1.$set(delete_1_changes);
      },
      i: function i(local) {
        if (current) return;
        transition_in(reorderhorizontal.$$.fragment, local);
        transition_in(default_slot_or_fallback, local);
        transition_in(penciloutline.$$.fragment, local);
        transition_in(delete_1.$$.fragment, local);
        current = true;
      },
      o: function o(local) {
        transition_out(reorderhorizontal.$$.fragment, local);
        transition_out(default_slot_or_fallback, local);
        transition_out(penciloutline.$$.fragment, local);
        transition_out(delete_1.$$.fragment, local);
        current = false;
      },
      d: function d(detaching) {
        if (detaching) detach(div);
        destroy_component(reorderhorizontal);
        if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
        destroy_component(penciloutline);
        destroy_component(delete_1);
        run_all(dispose);
      }
    };
  } // (178:0) {#if orderHasChanged}


  function create_if_block$7(ctx) {
    var button;
    var dispose;
    return {
      c: function c() {
        button = element("button");
        button.textContent = "Save Order";
        attr(button, "type", "button");
        attr(button, "class", "svelte-9hp4i1");
      },
      m: function m(target, anchor, remount) {
        insert(target, button, anchor);
        if (remount) dispose();
        dispose = listen(button, "click",
        /*submitOrder*/
        ctx[12]);
      },
      p: noop$1,
      d: function d(detaching) {
        if (detaching) detach(button);
        dispose();
      }
    };
  } // (152:17)  <Circle color="var(--accent-color-1)" size={iconSize}


  function create_pending_block$5(ctx) {
    var current;
    var circle = new Circle({
      props: {
        color: "var(--accent-color-1)",
        size:
        /*iconSize*/
        ctx[3]
      }
    });
    return {
      c: function c() {
        create_component(circle.$$.fragment);
      },
      m: function m(target, anchor) {
        mount_component(circle, target, anchor);
        current = true;
      },
      p: function p(ctx, dirty) {
        var circle_changes = {};
        if (dirty &
        /*iconSize*/
        8) circle_changes.size =
        /*iconSize*/
        ctx[3];
        circle.$set(circle_changes);
      },
      i: function i(local) {
        if (current) return;
        transition_in(circle.$$.fragment, local);
        current = true;
      },
      o: function o(local) {
        transition_out(circle.$$.fragment, local);
        current = false;
      },
      d: function d(detaching) {
        destroy_component(circle, detaching);
      }
    };
  } // (195:0) <Modal shown={editItem !== null} >


  function create_default_slot$5(ctx) {
    var current;
    var useritemform = new UserItemForm({
      props: {
        itemUrl:
        /*itemUrl*/
        ctx[0],
        itemNameSingular:
        /*itemNameSingular*/
        ctx[2],
        itemInfoExtractCallback:
        /*itemInfoExtractCallback*/
        ctx[5],
        processItemCallback:
        /*processItemCallback*/
        ctx[4],
        itemId:
        /*editItem*/
        ctx[9].uuid
      }
    });
    useritemform.$on("cancel",
    /*cancel_handler*/
    ctx[26]);
    return {
      c: function c() {
        create_component(useritemform.$$.fragment);
      },
      m: function m(target, anchor) {
        mount_component(useritemform, target, anchor);
        current = true;
      },
      p: function p(ctx, dirty) {
        var useritemform_changes = {};
        if (dirty &
        /*itemUrl*/
        1) useritemform_changes.itemUrl =
        /*itemUrl*/
        ctx[0];
        if (dirty &
        /*itemNameSingular*/
        4) useritemform_changes.itemNameSingular =
        /*itemNameSingular*/
        ctx[2];
        if (dirty &
        /*itemInfoExtractCallback*/
        32) useritemform_changes.itemInfoExtractCallback =
        /*itemInfoExtractCallback*/
        ctx[5];
        if (dirty &
        /*processItemCallback*/
        16) useritemform_changes.processItemCallback =
        /*processItemCallback*/
        ctx[4];
        if (dirty &
        /*editItem*/
        512) useritemform_changes.itemId =
        /*editItem*/
        ctx[9].uuid;
        useritemform.$set(useritemform_changes);
      },
      i: function i(local) {
        if (current) return;
        transition_in(useritemform.$$.fragment, local);
        current = true;
      },
      o: function o(local) {
        transition_out(useritemform.$$.fragment, local);
        current = false;
      },
      d: function d(detaching) {
        destroy_component(useritemform, detaching);
      }
    };
  }

  function create_fragment$i(ctx) {
    var promise;
    var t0;
    var t1;
    var current;
    var info = {
      ctx: ctx,
      current: null,
      token: null,
      pending: create_pending_block$5,
      then: create_then_block$5,
      "catch": create_catch_block$5,
      value: 28,
      error: 29,
      blocks: [,,,]
    };
    handle_promise(promise =
    /*itemsReq*/
    ctx[7], info);
    var alertconfirm = new AlertConfirm({
      props: {
        shown:
        /*deleteItem*/
        ctx[8] !== null,
        message: "Are you sure you want to delete this " +
        /*itemNameSingular*/
        ctx[2] + "? This action cannot be undone."
      }
    });
    alertconfirm.$on("confirm",
    /*deleteConfirm*/
    ctx[13]);
    alertconfirm.$on("cancel",
    /*deleteCancel*/
    ctx[14]);
    var modal = new Modal({
      props: {
        shown:
        /*editItem*/
        ctx[9] !== null,
        $$slots: {
          "default": [create_default_slot$5]
        },
        $$scope: {
          ctx: ctx
        }
      }
    });
    return {
      c: function c() {
        info.block.c();
        t0 = space();
        create_component(alertconfirm.$$.fragment);
        t1 = space();
        create_component(modal.$$.fragment);
      },
      m: function m(target, anchor) {
        info.block.m(target, info.anchor = anchor);

        info.mount = function () {
          return t0.parentNode;
        };

        info.anchor = t0;
        insert(target, t0, anchor);
        mount_component(alertconfirm, target, anchor);
        insert(target, t1, anchor);
        mount_component(modal, target, anchor);
        current = true;
      },
      p: function p(new_ctx, _ref50) {
        var _ref51 = _slicedToArray(_ref50, 1),
            dirty = _ref51[0];

        ctx = new_ctx;
        info.ctx = ctx;
        if (dirty &
        /*itemsReq*/
        128 && promise !== (promise =
        /*itemsReq*/
        ctx[7]) && handle_promise(promise, info)) ;else {
          var child_ctx = ctx.slice();
          child_ctx[28] = info.resolved;
          info.block.p(child_ctx, dirty);
        }
        var alertconfirm_changes = {};
        if (dirty &
        /*deleteItem*/
        256) alertconfirm_changes.shown =
        /*deleteItem*/
        ctx[8] !== null;
        if (dirty &
        /*itemNameSingular*/
        4) alertconfirm_changes.message = "Are you sure you want to delete this " +
        /*itemNameSingular*/
        ctx[2] + "? This action cannot be undone.";
        alertconfirm.$set(alertconfirm_changes);
        var modal_changes = {};
        if (dirty &
        /*editItem*/
        512) modal_changes.shown =
        /*editItem*/
        ctx[9] !== null;

        if (dirty &
        /*$$scope, itemUrl, itemNameSingular, itemInfoExtractCallback, processItemCallback, editItem*/
        134218293) {
          modal_changes.$$scope = {
            dirty: dirty,
            ctx: ctx
          };
        }

        modal.$set(modal_changes);
      },
      i: function i(local) {
        if (current) return;
        transition_in(info.block);
        transition_in(alertconfirm.$$.fragment, local);
        transition_in(modal.$$.fragment, local);
        current = true;
      },
      o: function o(local) {
        for (var i = 0; i < 3; i += 1) {
          var _block6 = info.blocks[i];
          transition_out(_block6);
        }

        transition_out(alertconfirm.$$.fragment, local);
        transition_out(modal.$$.fragment, local);
        current = false;
      },
      d: function d(detaching) {
        info.block.d(detaching);
        info.token = null;
        info = null;
        if (detaching) detach(t0);
        destroy_component(alertconfirm, detaching);
        if (detaching) detach(t1);
        destroy_component(modal, detaching);
      }
    };
  }

  var api$4 = "/api/v1";

  function instance$i($$self, $$props, $$invalidate) {
    var dispatch = createEventDispatcher();
    var itemUrl = $$props.itemUrl;
    var itemNamePlural = $$props.itemNamePlural;
    var itemNameSingular = $$props.itemNameSingular;
    var _$$props$listingEndpo = $$props.listingEndpoint,
        listingEndpoint = _$$props$listingEndpo === void 0 ? itemUrl : _$$props$listingEndpo;
    var _$$props$processItems = $$props.processItems,
        processItems = _$$props$processItems === void 0 ? function (g) {
      var g1 = g[1];
      g1.ord = g[0].ord;
      return g1;
    } : _$$props$processItems;
    var _$$props$iconSize4 = $$props.iconSize,
        iconSize = _$$props$iconSize4 === void 0 ? 24 : _$$props$iconSize4;
    var _$$props$deleteHandle = $$props.deleteHandler,
        deleteHandler = _$$props$deleteHandle === void 0 ? function (item) {
      $$invalidate(7, itemsReq = fetch("".concat(api$4, "/").concat(itemUrl, "/").concat(item.uuid), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "same-origin"
      }).then(function (res) {
        if (!res.ok) throw "Server responded with status ".concat(res.status);
        return fetchItems();
      }));
    } : _$$props$deleteHandle;
    var processItemCallback = $$props.processItemCallback;
    var itemInfoExtractCallback = $$props.itemInfoExtractCallback;
    var items = [];
    var itemsReq = fetchItems();
    var deleteItem = null;
    var editItem = null;
    var orderHasChanged = false;

    function orderChanged() {
      $$invalidate(10, orderHasChanged = true);
      dispatch("orderChanged");
    }

    function fetchItems() {
      return fetch("".concat(api$4, "/").concat(listingEndpoint)).then(function (res) {
        return res.json();
      }).then(function (g0s) {
        $$invalidate(6, items = g0s.map(processItems));
        return items;
      });
    }

    function handleSortConsider(e) {
      $$invalidate(6, items = e.detail.items);
    }

    function handleSortFinalize(e) {
      $$invalidate(6, items = e.detail.items);
    }

    function submitOrder(e) {
      var orders = items.reduce(function (g0s, g0, i) {
        if (g0.ord !== i) g0s.push({
          uuid: g0.uuid,
          ord: i
        });
        return g0s;
      }, []);
      $$invalidate(7, itemsReq = fetch("".concat(api$4, "/").concat(itemUrl, "/reorder"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "same-origin",
        body: JSON.stringify(orders)
      }).then(function (res) {
        if (!res.ok) throw "Server responded with status ".concat(res.status);
        var r0 = fetchItems();
        dispatch("orderSubmitted");
        return r0;
      }));
    }

    function deleteConfirm() {
      deleteHandler(deleteItem);
      $$invalidate(8, deleteItem = null);
    }

    function deleteCancel() {
      $$invalidate(8, deleteItem = null);
    }

    var _$$props$$$slots6 = $$props.$$slots,
        $$slots = _$$props$$$slots6 === void 0 ? {} : _$$props$$$slots6,
        $$scope = $$props.$$scope;

    var click_handler = function click_handler(item, e) {
      $$invalidate(9, editItem = item);
    };

    var click_handler_1 = function click_handler_1(item, e) {
      $$invalidate(8, deleteItem = item);
    };

    function dndlistsort_items_binding(value) {
      items = value;
      $$invalidate(6, items);
    }

    var cancel_handler = function cancel_handler(e) {
      $$invalidate(9, editItem = null);
    };

    $$self.$set = function ($$props) {
      if ("itemUrl" in $$props) $$invalidate(0, itemUrl = $$props.itemUrl);
      if ("itemNamePlural" in $$props) $$invalidate(1, itemNamePlural = $$props.itemNamePlural);
      if ("itemNameSingular" in $$props) $$invalidate(2, itemNameSingular = $$props.itemNameSingular);
      if ("listingEndpoint" in $$props) $$invalidate(15, listingEndpoint = $$props.listingEndpoint);
      if ("processItems" in $$props) $$invalidate(16, processItems = $$props.processItems);
      if ("iconSize" in $$props) $$invalidate(3, iconSize = $$props.iconSize);
      if ("deleteHandler" in $$props) $$invalidate(17, deleteHandler = $$props.deleteHandler);
      if ("processItemCallback" in $$props) $$invalidate(4, processItemCallback = $$props.processItemCallback);
      if ("itemInfoExtractCallback" in $$props) $$invalidate(5, itemInfoExtractCallback = $$props.itemInfoExtractCallback);
      if ("$$scope" in $$props) $$invalidate(27, $$scope = $$props.$$scope);
    };

    return [itemUrl, itemNamePlural, itemNameSingular, iconSize, processItemCallback, itemInfoExtractCallback, items, itemsReq, deleteItem, editItem, orderHasChanged, orderChanged, submitOrder, deleteConfirm, deleteCancel, listingEndpoint, processItems, deleteHandler, dispatch, fetchItems, handleSortConsider, handleSortFinalize, $$slots, click_handler, click_handler_1, dndlistsort_items_binding, cancel_handler, $$scope];
  }

  var UserItemList = /*#__PURE__*/function (_SvelteComponent17) {
    _inherits(UserItemList, _SvelteComponent17);

    var _super20 = _createSuper(UserItemList);

    function UserItemList(options) {
      var _this21;

      _classCallCheck(this, UserItemList);

      _this21 = _super20.call(this);
      init(_assertThisInitialized(_this21), options, instance$i, create_fragment$i, safe_not_equal, {
        itemUrl: 0,
        itemNamePlural: 1,
        itemNameSingular: 2,
        listingEndpoint: 15,
        processItems: 16,
        iconSize: 3,
        deleteHandler: 17,
        processItemCallback: 4,
        itemInfoExtractCallback: 5
      });
      return _this21;
    }

    return UserItemList;
  }(SvelteComponent);
  /* src/UserGalleryItemList.html generated by Svelte v3.20.1 */


  function create_fragment$j(ctx) {
    var current;
    var useritemlist = new UserItemList({
      props: {
        itemUrl: "galleries/items",
        itemNamePlural: "gallery items",
        itemNameSingular: "gallery item",
        listingEndpoint:
        /*listingEndpoint*/
        ctx[0],
        processItems: processItems,
        processItemCallback: processItemCallback
      }
    });
    useritemlist.$on("orderChanged",
    /*orderChanged_handler*/
    ctx[2]);
    useritemlist.$on("orderSubmitted",
    /*orderSubmitted_handler*/
    ctx[3]);
    return {
      c: function c() {
        create_component(useritemlist.$$.fragment);
      },
      m: function m(target, anchor) {
        mount_component(useritemlist, target, anchor);
        current = true;
      },
      p: noop$1,
      i: function i(local) {
        if (current) return;
        transition_in(useritemlist.$$.fragment, local);
        current = true;
      },
      o: function o(local) {
        transition_out(useritemlist.$$.fragment, local);
        current = false;
      },
      d: function d(detaching) {
        destroy_component(useritemlist, detaching);
      }
    };
  }

  function processItems(gi) {
    var g1 = gi[2];
    g1.ord = gi[3].ord;
    return g1;
  }

  function processItemCallback(gi) {
    return [gi[3], gi[2]];
  }

  function instance$j($$self, $$props, $$invalidate) {
    var galleryId = $$props.galleryId;
    var listingEndpoint = "galleries/".concat(galleryId, "/items");

    function orderChanged_handler(event) {
      bubble($$self, event);
    }

    function orderSubmitted_handler(event) {
      bubble($$self, event);
    }

    $$self.$set = function ($$props) {
      if ("galleryId" in $$props) $$invalidate(1, galleryId = $$props.galleryId);
    };

    return [listingEndpoint, galleryId, orderChanged_handler, orderSubmitted_handler];
  }

  var UserGalleryItemList = /*#__PURE__*/function (_SvelteComponent18) {
    _inherits(UserGalleryItemList, _SvelteComponent18);

    var _super21 = _createSuper(UserGalleryItemList);

    function UserGalleryItemList(options) {
      var _this22;

      _classCallCheck(this, UserGalleryItemList);

      _this22 = _super21.call(this);
      init(_assertThisInitialized(_this22), options, instance$j, create_fragment$j, safe_not_equal, {
        galleryId: 1
      });
      return _this22;
    }

    return UserGalleryItemList;
  }(SvelteComponent);
  /* src/UserGallery.html generated by Svelte v3.20.1 */


  function get_each_context$5(ctx, list, i) {
    var child_ctx = ctx.slice();
    child_ctx[9] = list[i];
    return child_ctx;
  } // (110:0) {:catch err}


  function create_catch_block$6(ctx) {
    var p;
    var t0;
    var t1_value =
    /*err*/
    ctx[8].message + "";
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
        if (dirty &
        /*galleryRequest*/
        2 && t1_value !== (t1_value =
        /*err*/
        ctx[8].message + "")) set_data(t1, t1_value);
      },
      i: noop$1,
      o: noop$1,
      d: function d(detaching) {
        if (detaching) detach(p);
      }
    };
  } // (89:0) {:then info}


  function create_then_block$6(ctx) {
    var h3;
    var t0_value =
    /*info*/
    ctx[7][0][1].name + "";
    var t0;
    var t1;
    var t2;
    var div3;
    var div0;
    var t3;
    var div2;
    var div1;
    var current;
    var if_block =
    /*info*/
    ctx[7][0][1].description && create_if_block_1$6(ctx);
    var usergalleryitemlist = new UserGalleryItemList({
      props: {
        galleryId:
        /*galleryId*/
        ctx[0]
      }
    });
    usergalleryitemlist.$on("orderSubmitted",
    /*refreshGallery*/
    ctx[3]);
    var each_value =
    /*info*/
    ctx[7][1];
    var each_blocks = [];

    for (var i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    }

    return {
      c: function c() {
        h3 = element("h3");
        t0 = text(t0_value);
        t1 = space();
        if (if_block) if_block.c();
        t2 = space();
        div3 = element("div");
        div0 = element("div");
        create_component(usergalleryitemlist.$$.fragment);
        t3 = space();
        div2 = element("div");
        div1 = element("div");

        for (var _i28 = 0; _i28 < each_blocks.length; _i28 += 1) {
          each_blocks[_i28].c();
        }

        attr(div1, "class", "gallery svelte-1ke1onu");
        attr(div3, "class", "gallery-panel svelte-1ke1onu");
      },
      m: function m(target, anchor) {
        insert(target, h3, anchor);
        append(h3, t0);
        insert(target, t1, anchor);
        if (if_block) if_block.m(target, anchor);
        insert(target, t2, anchor);
        insert(target, div3, anchor);
        append(div3, div0);
        mount_component(usergalleryitemlist, div0, null);
        append(div3, t3);
        append(div3, div2);
        append(div2, div1);

        for (var _i29 = 0; _i29 < each_blocks.length; _i29 += 1) {
          each_blocks[_i29].m(div1, null);
        }

        current = true;
      },
      p: function p(ctx, dirty) {
        if ((!current || dirty &
        /*galleryRequest*/
        2) && t0_value !== (t0_value =
        /*info*/
        ctx[7][0][1].name + "")) set_data(t0, t0_value);

        if (
        /*info*/
        ctx[7][0][1].description) {
          if (if_block) {
            if_block.p(ctx, dirty);
          } else {
            if_block = create_if_block_1$6(ctx);
            if_block.c();
            if_block.m(t2.parentNode, t2);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }

        var usergalleryitemlist_changes = {};
        if (dirty &
        /*galleryId*/
        1) usergalleryitemlist_changes.galleryId =
        /*galleryId*/
        ctx[0];
        usergalleryitemlist.$set(usergalleryitemlist_changes);

        if (dirty &
        /*showModal, galleryRequest*/
        18) {
          each_value =
          /*info*/
          ctx[7][1];

          var _i30;

          for (_i30 = 0; _i30 < each_value.length; _i30 += 1) {
            var child_ctx = get_each_context$5(ctx, each_value, _i30);

            if (each_blocks[_i30]) {
              each_blocks[_i30].p(child_ctx, dirty);
            } else {
              each_blocks[_i30] = create_each_block$5(child_ctx);

              each_blocks[_i30].c();

              each_blocks[_i30].m(div1, null);
            }
          }

          for (; _i30 < each_blocks.length; _i30 += 1) {
            each_blocks[_i30].d(1);
          }

          each_blocks.length = each_value.length;
        }
      },
      i: function i(local) {
        if (current) return;
        transition_in(usergalleryitemlist.$$.fragment, local);
        current = true;
      },
      o: function o(local) {
        transition_out(usergalleryitemlist.$$.fragment, local);
        current = false;
      },
      d: function d(detaching) {
        if (detaching) detach(h3);
        if (detaching) detach(t1);
        if (if_block) if_block.d(detaching);
        if (detaching) detach(t2);
        if (detaching) detach(div3);
        destroy_component(usergalleryitemlist);
        destroy_each(each_blocks, detaching);
      }
    };
  } // (91:0) {#if info[0][1].description}


  function create_if_block_1$6(ctx) {
    var p;
    var t_value =
    /*info*/
    ctx[7][0][1].description + "";
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
        if (dirty &
        /*galleryRequest*/
        2 && t_value !== (t_value =
        /*info*/
        ctx[7][0][1].description + "")) set_data(t, t_value);
      },
      d: function d(detaching) {
        if (detaching) detach(p);
      }
    };
  } // (100:12) {#each info[1] as item}


  function create_each_block$5(ctx) {
    var figure;
    var img;
    var img_alt_value;
    var img_src_value;
    var t0;
    var figcaption;
    var t1_value =
    /*item*/
    ctx[9][2].name + "";
    var t1;
    var t2;
    var dispose;

    function click_handler() {
      var _ctx5;

      for (var _len5 = arguments.length, args = new Array(_len5), _key8 = 0; _key8 < _len5; _key8++) {
        args[_key8] = arguments[_key8];
      }

      return (
        /*click_handler*/
        (_ctx5 = ctx)[6].apply(_ctx5, [
        /*item*/
        ctx[9]].concat(args))
      );
    }

    return {
      c: function c() {
        figure = element("figure");
        img = element("img");
        t0 = space();
        figcaption = element("figcaption");
        t1 = text(t1_value);
        t2 = space();
        attr(img, "alt", img_alt_value =
        /*item*/
        ctx[9][2].description);
        if (img.src !== (img_src_value = "/user/assets/" +
        /*item*/
        ctx[9][2].uuid)) attr(img, "src", img_src_value);
        attr(img, "class", "svelte-1ke1onu");
        attr(figure, "class", "card-image svelte-1ke1onu");
      },
      m: function m(target, anchor, remount) {
        insert(target, figure, anchor);
        append(figure, img);
        append(figure, t0);
        append(figure, figcaption);
        append(figcaption, t1);
        append(figure, t2);
        if (remount) dispose();
        dispose = listen(figure, "click", click_handler);
      },
      p: function p(new_ctx, dirty) {
        ctx = new_ctx;

        if (dirty &
        /*galleryRequest*/
        2 && img_alt_value !== (img_alt_value =
        /*item*/
        ctx[9][2].description)) {
          attr(img, "alt", img_alt_value);
        }

        if (dirty &
        /*galleryRequest*/
        2 && img.src !== (img_src_value = "/user/assets/" +
        /*item*/
        ctx[9][2].uuid)) {
          attr(img, "src", img_src_value);
        }

        if (dirty &
        /*galleryRequest*/
        2 && t1_value !== (t1_value =
        /*item*/
        ctx[9][2].name + "")) set_data(t1, t1_value);
      },
      d: function d(detaching) {
        if (detaching) detach(figure);
        dispose();
      }
    };
  } // (87:23)  <p>...</p> {:then info}


  function create_pending_block$6(ctx) {
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
        if (detaching) detach(p);
      }
    };
  } // (114:0) {#if displayItem}


  function create_if_block$8(ctx) {
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
        if (img.src !== (img_src_value = "/user/assets/" +
        /*displayItem*/
        ctx[2].uuid)) attr(img, "src", img_src_value);
        attr(img, "alt", img_alt_value =
        /*displayItem*/
        ctx[2].description);
        attr(img, "class", "svelte-1ke1onu");
        attr(div0, "class", "fullscreen-image svelte-1ke1onu");
        attr(div1, "class", "shadow-box svelte-1ke1onu");
      },
      m: function m(target, anchor, remount) {
        insert(target, div1, anchor);
        append(div1, div0);
        append(div0, img);
        current = true;
        if (remount) dispose();
        dispose = listen(div1, "click",
        /*hideModal*/
        ctx[5]);
      },
      p: function p(ctx, dirty) {
        if (!current || dirty &
        /*displayItem*/
        4 && img.src !== (img_src_value = "/user/assets/" +
        /*displayItem*/
        ctx[2].uuid)) {
          attr(img, "src", img_src_value);
        }

        if (!current || dirty &
        /*displayItem*/
        4 && img_alt_value !== (img_alt_value =
        /*displayItem*/
        ctx[2].description)) {
          attr(img, "alt", img_alt_value);
        }
      },
      i: function i(local) {
        if (current) return;
        add_render_callback(function () {
          if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fade, {
            duration: 200
          }, true);
          div1_transition.run(1);
        });
        current = true;
      },
      o: function o(local) {
        if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fade, {
          duration: 200
        }, false);
        div1_transition.run(0);
        current = false;
      },
      d: function d(detaching) {
        if (detaching) detach(div1);
        if (detaching && div1_transition) div1_transition.end();
        dispose();
      }
    };
  }

  function create_fragment$k(ctx) {
    var promise;
    var t;
    var if_block_anchor;
    var current;
    var info = {
      ctx: ctx,
      current: null,
      token: null,
      pending: create_pending_block$6,
      then: create_then_block$6,
      "catch": create_catch_block$6,
      value: 7,
      error: 8,
      blocks: [,,,]
    };
    handle_promise(promise =
    /*galleryRequest*/
    ctx[1], info);
    var if_block =
    /*displayItem*/
    ctx[2] && create_if_block$8(ctx);
    return {
      c: function c() {
        info.block.c();
        t = space();
        if (if_block) if_block.c();
        if_block_anchor = empty();
      },
      m: function m(target, anchor) {
        info.block.m(target, info.anchor = anchor);

        info.mount = function () {
          return t.parentNode;
        };

        info.anchor = t;
        insert(target, t, anchor);
        if (if_block) if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
        current = true;
      },
      p: function p(new_ctx, _ref52) {
        var _ref53 = _slicedToArray(_ref52, 1),
            dirty = _ref53[0];

        ctx = new_ctx;
        info.ctx = ctx;
        if (dirty &
        /*galleryRequest*/
        2 && promise !== (promise =
        /*galleryRequest*/
        ctx[1]) && handle_promise(promise, info)) ;else {
          var child_ctx = ctx.slice();
          child_ctx[7] = info.resolved;
          info.block.p(child_ctx, dirty);
        }

        if (
        /*displayItem*/
        ctx[2]) {
          if (if_block) {
            if_block.p(ctx, dirty);
            transition_in(if_block, 1);
          } else {
            if_block = create_if_block$8(ctx);
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
        if (current) return;
        transition_in(info.block);
        transition_in(if_block);
        current = true;
      },
      o: function o(local) {
        for (var i = 0; i < 3; i += 1) {
          var _block7 = info.blocks[i];
          transition_out(_block7);
        }

        transition_out(if_block);
        current = false;
      },
      d: function d(detaching) {
        info.block.d(detaching);
        info.token = null;
        info = null;
        if (detaching) detach(t);
        if (if_block) if_block.d(detaching);
        if (detaching) detach(if_block_anchor);
      }
    };
  }

  var api$5 = "/api/v1";

  function instance$k($$self, $$props, $$invalidate) {
    var galleryId = $$props.galleryId;
    var galleryRequest;
    var displayItem;

    function refreshGallery() {
      var gid = galleryId;
      $$invalidate(0, galleryId = null);
      $$invalidate(0, galleryId = gid);
    }

    function showModal(item) {
      $$invalidate(2, displayItem = item);
    }

    function hideModal() {
      $$invalidate(2, displayItem = null);
    }

    var click_handler = function click_handler(item, e) {
      return showModal(item[2]);
    };

    $$self.$set = function ($$props) {
      if ("galleryId" in $$props) $$invalidate(0, galleryId = $$props.galleryId);
    };

    $$self.$$.update = function () {
      if ($$self.$$.dirty &
      /*galleryId*/
      1) {
        if (galleryId) {
          $$invalidate(1, galleryRequest = Promise.all([fetch("".concat(api$5, "/galleries/").concat(galleryId)).then(function (res) {
            return res.json();
          }), fetch("".concat(api$5, "/galleries/").concat(galleryId, "/items")).then(function (res) {
            return res.json();
          })]));
        }
      }
    };

    return [galleryId, galleryRequest, displayItem, refreshGallery, showModal, hideModal, click_handler];
  }

  var UserGallery = /*#__PURE__*/function (_SvelteComponent19) {
    _inherits(UserGallery, _SvelteComponent19);

    var _super22 = _createSuper(UserGallery);

    function UserGallery(options) {
      var _this23;

      _classCallCheck(this, UserGallery);

      _this23 = _super22.call(this);
      init(_assertThisInitialized(_this23), options, instance$k, create_fragment$k, safe_not_equal, {
        galleryId: 0
      });
      return _this23;
    }

    return UserGallery;
  }(SvelteComponent);
  /* src/UserGalleryList.html generated by Svelte v3.20.1 */


  function create_fragment$l(ctx) {
    var current;
    var useritemlist = new UserItemList({
      props: {
        itemUrl: "galleries",
        itemNamePlural: "galleries",
        itemNameSingular: "gallery"
      }
    });
    useritemlist.$on("orderChanged",
    /*orderChanged_handler*/
    ctx[0]);
    useritemlist.$on("orderSubmitted",
    /*orderSubmitted_handler*/
    ctx[1]);
    return {
      c: function c() {
        create_component(useritemlist.$$.fragment);
      },
      m: function m(target, anchor) {
        mount_component(useritemlist, target, anchor);
        current = true;
      },
      p: noop$1,
      i: function i(local) {
        if (current) return;
        transition_in(useritemlist.$$.fragment, local);
        current = true;
      },
      o: function o(local) {
        transition_out(useritemlist.$$.fragment, local);
        current = false;
      },
      d: function d(detaching) {
        destroy_component(useritemlist, detaching);
      }
    };
  }

  function instance$l($$self) {
    function orderChanged_handler(event) {
      bubble($$self, event);
    }

    function orderSubmitted_handler(event) {
      bubble($$self, event);
    }

    return [orderChanged_handler, orderSubmitted_handler];
  }

  var UserGalleryList = /*#__PURE__*/function (_SvelteComponent20) {
    _inherits(UserGalleryList, _SvelteComponent20);

    var _super23 = _createSuper(UserGalleryList);

    function UserGalleryList(options) {
      var _this24;

      _classCallCheck(this, UserGalleryList);

      _this24 = _super23.call(this);
      init(_assertThisInitialized(_this24), options, instance$l, create_fragment$l, safe_not_equal, {});
      return _this24;
    }

    return UserGalleryList;
  }(SvelteComponent);

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

  var resumeAt = function resumeAt(node, entering) {
    this.current = node;
    this.entering = entering === true;
  };

  var next$2 = function next$2() {
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

    return {
      entering: entering,
      node: cur
    };
  };

  var NodeWalker = function NodeWalker(root) {
    return {
      current: root,
      root: root,
      entering: true,
      next: next$2,
      resumeAt: resumeAt
    };
  };

  var Node = function Node(nodeType, sourcepos) {
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
    get: function get() {
      return isContainer(this);
    }
  });
  Object.defineProperty(proto, 'type', {
    get: function get() {
      return this._type;
    }
  });
  Object.defineProperty(proto, 'firstChild', {
    get: function get() {
      return this._firstChild;
    }
  });
  Object.defineProperty(proto, 'lastChild', {
    get: function get() {
      return this._lastChild;
    }
  });
  Object.defineProperty(proto, 'next', {
    get: function get() {
      return this._next;
    }
  });
  Object.defineProperty(proto, 'prev', {
    get: function get() {
      return this._prev;
    }
  });
  Object.defineProperty(proto, 'parent', {
    get: function get() {
      return this._parent;
    }
  });
  Object.defineProperty(proto, 'sourcepos', {
    get: function get() {
      return this._sourcepos;
    }
  });
  Object.defineProperty(proto, 'literal', {
    get: function get() {
      return this._literal;
    },
    set: function set(s) {
      this._literal = s;
    }
  });
  Object.defineProperty(proto, 'destination', {
    get: function get() {
      return this._destination;
    },
    set: function set(s) {
      this._destination = s;
    }
  });
  Object.defineProperty(proto, 'title', {
    get: function get() {
      return this._title;
    },
    set: function set(s) {
      this._title = s;
    }
  });
  Object.defineProperty(proto, 'info', {
    get: function get() {
      return this._info;
    },
    set: function set(s) {
      this._info = s;
    }
  });
  Object.defineProperty(proto, 'level', {
    get: function get() {
      return this._level;
    },
    set: function set(s) {
      this._level = s;
    }
  });
  Object.defineProperty(proto, 'listType', {
    get: function get() {
      return this._listData.type;
    },
    set: function set(t) {
      this._listData.type = t;
    }
  });
  Object.defineProperty(proto, 'listTight', {
    get: function get() {
      return this._listData.tight;
    },
    set: function set(t) {
      this._listData.tight = t;
    }
  });
  Object.defineProperty(proto, 'listStart', {
    get: function get() {
      return this._listData.start;
    },
    set: function set(n) {
      this._listData.start = n;
    }
  });
  Object.defineProperty(proto, 'listDelimiter', {
    get: function get() {
      return this._listData.delimiter;
    },
    set: function set(delim) {
      this._listData.delimiter = delim;
    }
  });
  Object.defineProperty(proto, 'onEnter', {
    get: function get() {
      return this._onEnter;
    },
    set: function set(s) {
      this._onEnter = s;
    }
  });
  Object.defineProperty(proto, 'onExit', {
    get: function get() {
      return this._onExit;
    },
    set: function set(s) {
      this._onExit = s;
    }
  });

  Node.prototype.appendChild = function (child) {
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

  Node.prototype.prependChild = function (child) {
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

  Node.prototype.unlink = function () {
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

  Node.prototype.insertAfter = function (sibling) {
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

  Node.prototype.insertBefore = function (sibling) {
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

  Node.prototype.walker = function () {
    var walker = new NodeWalker(this);
    return walker;
  };

  var node = Node;
  var encodeCache = {}; // Create a lookup array where anything but characters in `chars` string
  // and alphanumeric chars is percent-encoded.
  //

  function getEncodeCache(exclude) {
    var i,
        ch,
        cache = encodeCache[exclude];

    if (cache) {
      return cache;
    }

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
  } // Encode unsafe characters with percent-encoding, skipping already
  // encoded sequences.
  //
  //  - string       - string to encode
  //  - exclude      - list of characters to ignore (in addition to a-zA-Z0-9)
  //  - keepEscaped  - don't encode '%' in a correct escape sequence (default: true)
  //


  function encode(string, exclude, keepEscaped) {
    var i,
        l,
        code,
        nextCode,
        cache,
        result = '';

    if (typeof exclude !== 'string') {
      // encode(string, keepEscaped)
      keepEscaped = exclude;
      exclude = encode.defaultChars;
    }

    if (typeof keepEscaped === 'undefined') {
      keepEscaped = true;
    }

    cache = getEncodeCache(exclude);

    for (i = 0, l = string.length; i < l; i++) {
      code = string.charCodeAt(i);

      if (keepEscaped && code === 0x25
      /* % */
      && i + 2 < l) {
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

  encode.defaultChars = ";/?:@&=+$,-_.!~*'()#";
  encode.componentChars = "-_.!~*'()";
  var encode_1 = encode;
  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule(fn, module) {
    return module = {
      exports: {}
    }, fn(module, module.exports), module.exports;
  }

  function getCjsExportFromNamespace(n) {
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
  var Aacute = "??";
  var aacute = "??";
  var Abreve = "??";
  var abreve = "??";
  var ac = "???";
  var acd = "???";
  var acE = "?????";
  var Acirc = "??";
  var acirc = "??";
  var acute = "??";
  var Acy = "??";
  var acy = "??";
  var AElig = "??";
  var aelig = "??";
  var af = "???";
  var Afr = "????";
  var afr = "????";
  var Agrave = "??";
  var agrave = "??";
  var alefsym = "???";
  var aleph = "???";
  var Alpha = "??";
  var alpha = "??";
  var Amacr = "??";
  var amacr = "??";
  var amalg = "???";
  var amp$1 = "&";
  var AMP = "&";
  var andand = "???";
  var And = "???";
  var and = "???";
  var andd = "???";
  var andslope = "???";
  var andv = "???";
  var ang = "???";
  var ange = "???";
  var angle = "???";
  var angmsdaa = "???";
  var angmsdab = "???";
  var angmsdac = "???";
  var angmsdad = "???";
  var angmsdae = "???";
  var angmsdaf = "???";
  var angmsdag = "???";
  var angmsdah = "???";
  var angmsd = "???";
  var angrt = "???";
  var angrtvb = "???";
  var angrtvbd = "???";
  var angsph = "???";
  var angst = "??";
  var angzarr = "???";
  var Aogon = "??";
  var aogon = "??";
  var Aopf = "????";
  var aopf = "????";
  var apacir = "???";
  var ap = "???";
  var apE = "???";
  var ape = "???";
  var apid = "???";
  var apos$1 = "'";
  var ApplyFunction = "???";
  var approx = "???";
  var approxeq = "???";
  var Aring = "??";
  var aring = "??";
  var Ascr = "????";
  var ascr = "????";
  var Assign = "???";
  var ast = "*";
  var asymp = "???";
  var asympeq = "???";
  var Atilde = "??";
  var atilde = "??";
  var Auml = "??";
  var auml = "??";
  var awconint = "???";
  var awint = "???";
  var backcong = "???";
  var backepsilon = "??";
  var backprime = "???";
  var backsim = "???";
  var backsimeq = "???";
  var Backslash = "???";
  var Barv = "???";
  var barvee = "???";
  var barwed = "???";
  var Barwed = "???";
  var barwedge = "???";
  var bbrk = "???";
  var bbrktbrk = "???";
  var bcong = "???";
  var Bcy = "??";
  var bcy = "??";
  var bdquo = "???";
  var becaus = "???";
  var because = "???";
  var Because = "???";
  var bemptyv = "???";
  var bepsi = "??";
  var bernou = "???";
  var Bernoullis = "???";
  var Beta = "??";
  var beta = "??";
  var beth = "???";
  var between = "???";
  var Bfr = "????";
  var bfr = "????";
  var bigcap = "???";
  var bigcirc = "???";
  var bigcup = "???";
  var bigodot = "???";
  var bigoplus = "???";
  var bigotimes = "???";
  var bigsqcup = "???";
  var bigstar = "???";
  var bigtriangledown = "???";
  var bigtriangleup = "???";
  var biguplus = "???";
  var bigvee = "???";
  var bigwedge = "???";
  var bkarow = "???";
  var blacklozenge = "???";
  var blacksquare = "???";
  var blacktriangle = "???";
  var blacktriangledown = "???";
  var blacktriangleleft = "???";
  var blacktriangleright = "???";
  var blank = "???";
  var blk12 = "???";
  var blk14 = "???";
  var blk34 = "???";
  var block = "???";
  var bne = "=???";
  var bnequiv = "??????";
  var bNot = "???";
  var bnot = "???";
  var Bopf = "????";
  var bopf = "????";
  var bot = "???";
  var bottom = "???";
  var bowtie = "???";
  var boxbox = "???";
  var boxdl = "???";
  var boxdL = "???";
  var boxDl = "???";
  var boxDL = "???";
  var boxdr = "???";
  var boxdR = "???";
  var boxDr = "???";
  var boxDR = "???";
  var boxh = "???";
  var boxH = "???";
  var boxhd = "???";
  var boxHd = "???";
  var boxhD = "???";
  var boxHD = "???";
  var boxhu = "???";
  var boxHu = "???";
  var boxhU = "???";
  var boxHU = "???";
  var boxminus = "???";
  var boxplus = "???";
  var boxtimes = "???";
  var boxul = "???";
  var boxuL = "???";
  var boxUl = "???";
  var boxUL = "???";
  var boxur = "???";
  var boxuR = "???";
  var boxUr = "???";
  var boxUR = "???";
  var boxv = "???";
  var boxV = "???";
  var boxvh = "???";
  var boxvH = "???";
  var boxVh = "???";
  var boxVH = "???";
  var boxvl = "???";
  var boxvL = "???";
  var boxVl = "???";
  var boxVL = "???";
  var boxvr = "???";
  var boxvR = "???";
  var boxVr = "???";
  var boxVR = "???";
  var bprime = "???";
  var breve = "??";
  var Breve = "??";
  var brvbar = "??";
  var bscr = "????";
  var Bscr = "???";
  var bsemi = "???";
  var bsim = "???";
  var bsime = "???";
  var bsolb = "???";
  var bsol = "\\";
  var bsolhsub = "???";
  var bull = "???";
  var bullet = "???";
  var bump = "???";
  var bumpE = "???";
  var bumpe = "???";
  var Bumpeq = "???";
  var bumpeq = "???";
  var Cacute = "??";
  var cacute = "??";
  var capand = "???";
  var capbrcup = "???";
  var capcap = "???";
  var cap = "???";
  var Cap = "???";
  var capcup = "???";
  var capdot = "???";
  var CapitalDifferentialD = "???";
  var caps = "??????";
  var caret = "???";
  var caron = "??";
  var Cayleys = "???";
  var ccaps = "???";
  var Ccaron = "??";
  var ccaron = "??";
  var Ccedil = "??";
  var ccedil = "??";
  var Ccirc = "??";
  var ccirc = "??";
  var Cconint = "???";
  var ccups = "???";
  var ccupssm = "???";
  var Cdot = "??";
  var cdot = "??";
  var cedil = "??";
  var Cedilla = "??";
  var cemptyv = "???";
  var cent = "??";
  var centerdot = "??";
  var CenterDot = "??";
  var cfr = "????";
  var Cfr = "???";
  var CHcy = "??";
  var chcy = "??";
  var check = "???";
  var checkmark = "???";
  var Chi = "??";
  var chi = "??";
  var circ = "??";
  var circeq = "???";
  var circlearrowleft = "???";
  var circlearrowright = "???";
  var circledast = "???";
  var circledcirc = "???";
  var circleddash = "???";
  var CircleDot = "???";
  var circledR = "??";
  var circledS = "???";
  var CircleMinus = "???";
  var CirclePlus = "???";
  var CircleTimes = "???";
  var cir = "???";
  var cirE = "???";
  var cire = "???";
  var cirfnint = "???";
  var cirmid = "???";
  var cirscir = "???";
  var ClockwiseContourIntegral = "???";
  var CloseCurlyDoubleQuote = "???";
  var CloseCurlyQuote = "???";
  var clubs = "???";
  var clubsuit = "???";
  var colon = ":";
  var Colon = "???";
  var Colone = "???";
  var colone = "???";
  var coloneq = "???";
  var comma = ",";
  var commat = "@";
  var comp = "???";
  var compfn = "???";
  var complement = "???";
  var complexes = "???";
  var cong = "???";
  var congdot = "???";
  var Congruent = "???";
  var conint = "???";
  var Conint = "???";
  var ContourIntegral = "???";
  var copf = "????";
  var Copf = "???";
  var coprod = "???";
  var Coproduct = "???";
  var copy = "??";
  var COPY = "??";
  var copysr = "???";
  var CounterClockwiseContourIntegral = "???";
  var crarr = "???";
  var cross = "???";
  var Cross = "???";
  var Cscr = "????";
  var cscr = "????";
  var csub = "???";
  var csube = "???";
  var csup = "???";
  var csupe = "???";
  var ctdot = "???";
  var cudarrl = "???";
  var cudarrr = "???";
  var cuepr = "???";
  var cuesc = "???";
  var cularr = "???";
  var cularrp = "???";
  var cupbrcap = "???";
  var cupcap = "???";
  var CupCap = "???";
  var cup = "???";
  var Cup = "???";
  var cupcup = "???";
  var cupdot = "???";
  var cupor = "???";
  var cups = "??????";
  var curarr = "???";
  var curarrm = "???";
  var curlyeqprec = "???";
  var curlyeqsucc = "???";
  var curlyvee = "???";
  var curlywedge = "???";
  var curren = "??";
  var curvearrowleft = "???";
  var curvearrowright = "???";
  var cuvee = "???";
  var cuwed = "???";
  var cwconint = "???";
  var cwint = "???";
  var cylcty = "???";
  var dagger = "???";
  var Dagger = "???";
  var daleth = "???";
  var darr = "???";
  var Darr = "???";
  var dArr = "???";
  var dash = "???";
  var Dashv = "???";
  var dashv = "???";
  var dbkarow = "???";
  var dblac = "??";
  var Dcaron = "??";
  var dcaron = "??";
  var Dcy = "??";
  var dcy = "??";
  var ddagger = "???";
  var ddarr = "???";
  var DD = "???";
  var dd = "???";
  var DDotrahd = "???";
  var ddotseq = "???";
  var deg = "??";
  var Del = "???";
  var Delta = "??";
  var delta = "??";
  var demptyv = "???";
  var dfisht = "???";
  var Dfr = "????";
  var dfr = "????";
  var dHar = "???";
  var dharl = "???";
  var dharr = "???";
  var DiacriticalAcute = "??";
  var DiacriticalDot = "??";
  var DiacriticalDoubleAcute = "??";
  var DiacriticalGrave = "`";
  var DiacriticalTilde = "??";
  var diam = "???";
  var diamond = "???";
  var Diamond = "???";
  var diamondsuit = "???";
  var diams = "???";
  var die = "??";
  var DifferentialD = "???";
  var digamma = "??";
  var disin = "???";
  var div = "??";
  var divide = "??";
  var divideontimes = "???";
  var divonx = "???";
  var DJcy = "??";
  var djcy = "??";
  var dlcorn = "???";
  var dlcrop = "???";
  var dollar = "$";
  var Dopf = "????";
  var dopf = "????";
  var Dot = "??";
  var dot = "??";
  var DotDot = "???";
  var doteq = "???";
  var doteqdot = "???";
  var DotEqual = "???";
  var dotminus = "???";
  var dotplus = "???";
  var dotsquare = "???";
  var doublebarwedge = "???";
  var DoubleContourIntegral = "???";
  var DoubleDot = "??";
  var DoubleDownArrow = "???";
  var DoubleLeftArrow = "???";
  var DoubleLeftRightArrow = "???";
  var DoubleLeftTee = "???";
  var DoubleLongLeftArrow = "???";
  var DoubleLongLeftRightArrow = "???";
  var DoubleLongRightArrow = "???";
  var DoubleRightArrow = "???";
  var DoubleRightTee = "???";
  var DoubleUpArrow = "???";
  var DoubleUpDownArrow = "???";
  var DoubleVerticalBar = "???";
  var DownArrowBar = "???";
  var downarrow = "???";
  var DownArrow = "???";
  var Downarrow = "???";
  var DownArrowUpArrow = "???";
  var DownBreve = "??";
  var downdownarrows = "???";
  var downharpoonleft = "???";
  var downharpoonright = "???";
  var DownLeftRightVector = "???";
  var DownLeftTeeVector = "???";
  var DownLeftVectorBar = "???";
  var DownLeftVector = "???";
  var DownRightTeeVector = "???";
  var DownRightVectorBar = "???";
  var DownRightVector = "???";
  var DownTeeArrow = "???";
  var DownTee = "???";
  var drbkarow = "???";
  var drcorn = "???";
  var drcrop = "???";
  var Dscr = "????";
  var dscr = "????";
  var DScy = "??";
  var dscy = "??";
  var dsol = "???";
  var Dstrok = "??";
  var dstrok = "??";
  var dtdot = "???";
  var dtri = "???";
  var dtrif = "???";
  var duarr = "???";
  var duhar = "???";
  var dwangle = "???";
  var DZcy = "??";
  var dzcy = "??";
  var dzigrarr = "???";
  var Eacute = "??";
  var eacute = "??";
  var easter = "???";
  var Ecaron = "??";
  var ecaron = "??";
  var Ecirc = "??";
  var ecirc = "??";
  var ecir = "???";
  var ecolon = "???";
  var Ecy = "??";
  var ecy = "??";
  var eDDot = "???";
  var Edot = "??";
  var edot = "??";
  var eDot = "???";
  var ee = "???";
  var efDot = "???";
  var Efr = "????";
  var efr = "????";
  var eg = "???";
  var Egrave = "??";
  var egrave = "??";
  var egs = "???";
  var egsdot = "???";
  var el = "???";
  var Element = "???";
  var elinters = "???";
  var ell = "???";
  var els = "???";
  var elsdot = "???";
  var Emacr = "??";
  var emacr = "??";
  var empty$2 = "???";
  var emptyset = "???";
  var EmptySmallSquare = "???";
  var emptyv = "???";
  var EmptyVerySmallSquare = "???";
  var emsp13 = "???";
  var emsp14 = "???";
  var emsp = "???";
  var ENG = "??";
  var eng = "??";
  var ensp = "???";
  var Eogon = "??";
  var eogon = "??";
  var Eopf = "????";
  var eopf = "????";
  var epar = "???";
  var eparsl = "???";
  var eplus = "???";
  var epsi = "??";
  var Epsilon = "??";
  var epsilon = "??";
  var epsiv = "??";
  var eqcirc = "???";
  var eqcolon = "???";
  var eqsim = "???";
  var eqslantgtr = "???";
  var eqslantless = "???";
  var Equal = "???";
  var equals = "=";
  var EqualTilde = "???";
  var equest = "???";
  var Equilibrium = "???";
  var equiv = "???";
  var equivDD = "???";
  var eqvparsl = "???";
  var erarr = "???";
  var erDot = "???";
  var escr = "???";
  var Escr = "???";
  var esdot = "???";
  var Esim = "???";
  var esim = "???";
  var Eta = "??";
  var eta = "??";
  var ETH = "??";
  var eth = "??";
  var Euml = "??";
  var euml = "??";
  var euro = "???";
  var excl = "!";
  var exist = "???";
  var Exists = "???";
  var expectation = "???";
  var exponentiale = "???";
  var ExponentialE = "???";
  var fallingdotseq = "???";
  var Fcy = "??";
  var fcy = "??";
  var female = "???";
  var ffilig = "???";
  var fflig = "???";
  var ffllig = "???";
  var Ffr = "????";
  var ffr = "????";
  var filig = "???";
  var FilledSmallSquare = "???";
  var FilledVerySmallSquare = "???";
  var fjlig = "fj";
  var flat = "???";
  var fllig = "???";
  var fltns = "???";
  var fnof = "??";
  var Fopf = "????";
  var fopf = "????";
  var forall = "???";
  var ForAll = "???";
  var fork = "???";
  var forkv = "???";
  var Fouriertrf = "???";
  var fpartint = "???";
  var frac12 = "??";
  var frac13 = "???";
  var frac14 = "??";
  var frac15 = "???";
  var frac16 = "???";
  var frac18 = "???";
  var frac23 = "???";
  var frac25 = "???";
  var frac34 = "??";
  var frac35 = "???";
  var frac38 = "???";
  var frac45 = "???";
  var frac56 = "???";
  var frac58 = "???";
  var frac78 = "???";
  var frasl = "???";
  var frown = "???";
  var fscr = "????";
  var Fscr = "???";
  var gacute = "??";
  var Gamma = "??";
  var gamma = "??";
  var Gammad = "??";
  var gammad = "??";
  var gap = "???";
  var Gbreve = "??";
  var gbreve = "??";
  var Gcedil = "??";
  var Gcirc = "??";
  var gcirc = "??";
  var Gcy = "??";
  var gcy = "??";
  var Gdot = "??";
  var gdot = "??";
  var ge = "???";
  var gE = "???";
  var gEl = "???";
  var gel = "???";
  var geq = "???";
  var geqq = "???";
  var geqslant = "???";
  var gescc = "???";
  var ges = "???";
  var gesdot = "???";
  var gesdoto = "???";
  var gesdotol = "???";
  var gesl = "??????";
  var gesles = "???";
  var Gfr = "????";
  var gfr = "????";
  var gg = "???";
  var Gg = "???";
  var ggg = "???";
  var gimel = "???";
  var GJcy = "??";
  var gjcy = "??";
  var gla = "???";
  var gl = "???";
  var glE = "???";
  var glj = "???";
  var gnap = "???";
  var gnapprox = "???";
  var gne = "???";
  var gnE = "???";
  var gneq = "???";
  var gneqq = "???";
  var gnsim = "???";
  var Gopf = "????";
  var gopf = "????";
  var grave = "`";
  var GreaterEqual = "???";
  var GreaterEqualLess = "???";
  var GreaterFullEqual = "???";
  var GreaterGreater = "???";
  var GreaterLess = "???";
  var GreaterSlantEqual = "???";
  var GreaterTilde = "???";
  var Gscr = "????";
  var gscr = "???";
  var gsim = "???";
  var gsime = "???";
  var gsiml = "???";
  var gtcc = "???";
  var gtcir = "???";
  var gt$1 = ">";
  var GT = ">";
  var Gt = "???";
  var gtdot = "???";
  var gtlPar = "???";
  var gtquest = "???";
  var gtrapprox = "???";
  var gtrarr = "???";
  var gtrdot = "???";
  var gtreqless = "???";
  var gtreqqless = "???";
  var gtrless = "???";
  var gtrsim = "???";
  var gvertneqq = "??????";
  var gvnE = "??????";
  var Hacek = "??";
  var hairsp = "???";
  var half = "??";
  var hamilt = "???";
  var HARDcy = "??";
  var hardcy = "??";
  var harrcir = "???";
  var harr = "???";
  var hArr = "???";
  var harrw = "???";
  var Hat = "^";
  var hbar = "???";
  var Hcirc = "??";
  var hcirc = "??";
  var hearts = "???";
  var heartsuit = "???";
  var hellip = "???";
  var hercon = "???";
  var hfr = "????";
  var Hfr = "???";
  var HilbertSpace = "???";
  var hksearow = "???";
  var hkswarow = "???";
  var hoarr = "???";
  var homtht = "???";
  var hookleftarrow = "???";
  var hookrightarrow = "???";
  var hopf = "????";
  var Hopf = "???";
  var horbar = "???";
  var HorizontalLine = "???";
  var hscr = "????";
  var Hscr = "???";
  var hslash = "???";
  var Hstrok = "??";
  var hstrok = "??";
  var HumpDownHump = "???";
  var HumpEqual = "???";
  var hybull = "???";
  var hyphen = "???";
  var Iacute = "??";
  var iacute = "??";
  var ic = "???";
  var Icirc = "??";
  var icirc = "??";
  var Icy = "??";
  var icy = "??";
  var Idot = "??";
  var IEcy = "??";
  var iecy = "??";
  var iexcl = "??";
  var iff = "???";
  var ifr = "????";
  var Ifr = "???";
  var Igrave = "??";
  var igrave = "??";
  var ii = "???";
  var iiiint = "???";
  var iiint = "???";
  var iinfin = "???";
  var iiota = "???";
  var IJlig = "??";
  var ijlig = "??";
  var Imacr = "??";
  var imacr = "??";
  var image = "???";
  var ImaginaryI = "???";
  var imagline = "???";
  var imagpart = "???";
  var imath = "??";
  var Im = "???";
  var imof = "???";
  var imped = "??";
  var Implies = "???";
  var incare = "???";
  var infin = "???";
  var infintie = "???";
  var inodot = "??";
  var intcal = "???";
  var _int = "???";
  var Int = "???";
  var integers = "???";
  var Integral = "???";
  var intercal = "???";
  var Intersection = "???";
  var intlarhk = "???";
  var intprod = "???";
  var InvisibleComma = "???";
  var InvisibleTimes = "???";
  var IOcy = "??";
  var iocy = "??";
  var Iogon = "??";
  var iogon = "??";
  var Iopf = "????";
  var iopf = "????";
  var Iota = "??";
  var iota = "??";
  var iprod = "???";
  var iquest = "??";
  var iscr = "????";
  var Iscr = "???";
  var isin = "???";
  var isindot = "???";
  var isinE = "???";
  var isins = "???";
  var isinsv = "???";
  var isinv = "???";
  var it = "???";
  var Itilde = "??";
  var itilde = "??";
  var Iukcy = "??";
  var iukcy = "??";
  var Iuml = "??";
  var iuml = "??";
  var Jcirc = "??";
  var jcirc = "??";
  var Jcy = "??";
  var jcy = "??";
  var Jfr = "????";
  var jfr = "????";
  var jmath = "??";
  var Jopf = "????";
  var jopf = "????";
  var Jscr = "????";
  var jscr = "????";
  var Jsercy = "??";
  var jsercy = "??";
  var Jukcy = "??";
  var jukcy = "??";
  var Kappa = "??";
  var kappa = "??";
  var kappav = "??";
  var Kcedil = "??";
  var kcedil = "??";
  var Kcy = "??";
  var kcy = "??";
  var Kfr = "????";
  var kfr = "????";
  var kgreen = "??";
  var KHcy = "??";
  var khcy = "??";
  var KJcy = "??";
  var kjcy = "??";
  var Kopf = "????";
  var kopf = "????";
  var Kscr = "????";
  var kscr = "????";
  var lAarr = "???";
  var Lacute = "??";
  var lacute = "??";
  var laemptyv = "???";
  var lagran = "???";
  var Lambda = "??";
  var lambda = "??";
  var lang = "???";
  var Lang = "???";
  var langd = "???";
  var langle = "???";
  var lap = "???";
  var Laplacetrf = "???";
  var laquo = "??";
  var larrb = "???";
  var larrbfs = "???";
  var larr = "???";
  var Larr = "???";
  var lArr = "???";
  var larrfs = "???";
  var larrhk = "???";
  var larrlp = "???";
  var larrpl = "???";
  var larrsim = "???";
  var larrtl = "???";
  var latail = "???";
  var lAtail = "???";
  var lat = "???";
  var late = "???";
  var lates = "??????";
  var lbarr = "???";
  var lBarr = "???";
  var lbbrk = "???";
  var lbrace = "{";
  var lbrack = "[";
  var lbrke = "???";
  var lbrksld = "???";
  var lbrkslu = "???";
  var Lcaron = "??";
  var lcaron = "??";
  var Lcedil = "??";
  var lcedil = "??";
  var lceil = "???";
  var lcub = "{";
  var Lcy = "??";
  var lcy = "??";
  var ldca = "???";
  var ldquo = "???";
  var ldquor = "???";
  var ldrdhar = "???";
  var ldrushar = "???";
  var ldsh = "???";
  var le = "???";
  var lE = "???";
  var LeftAngleBracket = "???";
  var LeftArrowBar = "???";
  var leftarrow = "???";
  var LeftArrow = "???";
  var Leftarrow = "???";
  var LeftArrowRightArrow = "???";
  var leftarrowtail = "???";
  var LeftCeiling = "???";
  var LeftDoubleBracket = "???";
  var LeftDownTeeVector = "???";
  var LeftDownVectorBar = "???";
  var LeftDownVector = "???";
  var LeftFloor = "???";
  var leftharpoondown = "???";
  var leftharpoonup = "???";
  var leftleftarrows = "???";
  var leftrightarrow = "???";
  var LeftRightArrow = "???";
  var Leftrightarrow = "???";
  var leftrightarrows = "???";
  var leftrightharpoons = "???";
  var leftrightsquigarrow = "???";
  var LeftRightVector = "???";
  var LeftTeeArrow = "???";
  var LeftTee = "???";
  var LeftTeeVector = "???";
  var leftthreetimes = "???";
  var LeftTriangleBar = "???";
  var LeftTriangle = "???";
  var LeftTriangleEqual = "???";
  var LeftUpDownVector = "???";
  var LeftUpTeeVector = "???";
  var LeftUpVectorBar = "???";
  var LeftUpVector = "???";
  var LeftVectorBar = "???";
  var LeftVector = "???";
  var lEg = "???";
  var leg = "???";
  var leq = "???";
  var leqq = "???";
  var leqslant = "???";
  var lescc = "???";
  var les = "???";
  var lesdot = "???";
  var lesdoto = "???";
  var lesdotor = "???";
  var lesg = "??????";
  var lesges = "???";
  var lessapprox = "???";
  var lessdot = "???";
  var lesseqgtr = "???";
  var lesseqqgtr = "???";
  var LessEqualGreater = "???";
  var LessFullEqual = "???";
  var LessGreater = "???";
  var lessgtr = "???";
  var LessLess = "???";
  var lesssim = "???";
  var LessSlantEqual = "???";
  var LessTilde = "???";
  var lfisht = "???";
  var lfloor = "???";
  var Lfr = "????";
  var lfr = "????";
  var lg = "???";
  var lgE = "???";
  var lHar = "???";
  var lhard = "???";
  var lharu = "???";
  var lharul = "???";
  var lhblk = "???";
  var LJcy = "??";
  var ljcy = "??";
  var llarr = "???";
  var ll = "???";
  var Ll = "???";
  var llcorner = "???";
  var Lleftarrow = "???";
  var llhard = "???";
  var lltri = "???";
  var Lmidot = "??";
  var lmidot = "??";
  var lmoustache = "???";
  var lmoust = "???";
  var lnap = "???";
  var lnapprox = "???";
  var lne = "???";
  var lnE = "???";
  var lneq = "???";
  var lneqq = "???";
  var lnsim = "???";
  var loang = "???";
  var loarr = "???";
  var lobrk = "???";
  var longleftarrow = "???";
  var LongLeftArrow = "???";
  var Longleftarrow = "???";
  var longleftrightarrow = "???";
  var LongLeftRightArrow = "???";
  var Longleftrightarrow = "???";
  var longmapsto = "???";
  var longrightarrow = "???";
  var LongRightArrow = "???";
  var Longrightarrow = "???";
  var looparrowleft = "???";
  var looparrowright = "???";
  var lopar = "???";
  var Lopf = "????";
  var lopf = "????";
  var loplus = "???";
  var lotimes = "???";
  var lowast = "???";
  var lowbar = "_";
  var LowerLeftArrow = "???";
  var LowerRightArrow = "???";
  var loz = "???";
  var lozenge = "???";
  var lozf = "???";
  var lpar = "(";
  var lparlt = "???";
  var lrarr = "???";
  var lrcorner = "???";
  var lrhar = "???";
  var lrhard = "???";
  var lrm = "???";
  var lrtri = "???";
  var lsaquo = "???";
  var lscr = "????";
  var Lscr = "???";
  var lsh = "???";
  var Lsh = "???";
  var lsim = "???";
  var lsime = "???";
  var lsimg = "???";
  var lsqb = "[";
  var lsquo = "???";
  var lsquor = "???";
  var Lstrok = "??";
  var lstrok = "??";
  var ltcc = "???";
  var ltcir = "???";
  var lt$1 = "<";
  var LT = "<";
  var Lt = "???";
  var ltdot = "???";
  var lthree = "???";
  var ltimes = "???";
  var ltlarr = "???";
  var ltquest = "???";
  var ltri = "???";
  var ltrie = "???";
  var ltrif = "???";
  var ltrPar = "???";
  var lurdshar = "???";
  var luruhar = "???";
  var lvertneqq = "??????";
  var lvnE = "??????";
  var macr = "??";
  var male = "???";
  var malt = "???";
  var maltese = "???";
  var map = "???";
  var mapsto = "???";
  var mapstodown = "???";
  var mapstoleft = "???";
  var mapstoup = "???";
  var marker = "???";
  var mcomma = "???";
  var Mcy = "??";
  var mcy = "??";
  var mdash = "???";
  var mDDot = "???";
  var measuredangle = "???";
  var MediumSpace = "???";
  var Mellintrf = "???";
  var Mfr = "????";
  var mfr = "????";
  var mho = "???";
  var micro = "??";
  var midast = "*";
  var midcir = "???";
  var mid = "???";
  var middot = "??";
  var minusb = "???";
  var minus = "???";
  var minusd = "???";
  var minusdu = "???";
  var MinusPlus = "???";
  var mlcp = "???";
  var mldr = "???";
  var mnplus = "???";
  var models = "???";
  var Mopf = "????";
  var mopf = "????";
  var mp = "???";
  var mscr = "????";
  var Mscr = "???";
  var mstpos = "???";
  var Mu = "??";
  var mu = "??";
  var multimap = "???";
  var mumap = "???";
  var nabla = "???";
  var Nacute = "??";
  var nacute = "??";
  var nang = "??????";
  var nap = "???";
  var napE = "?????";
  var napid = "?????";
  var napos = "??";
  var napprox = "???";
  var natural = "???";
  var naturals = "???";
  var natur = "???";
  var nbsp = "??";
  var nbump = "?????";
  var nbumpe = "?????";
  var ncap = "???";
  var Ncaron = "??";
  var ncaron = "??";
  var Ncedil = "??";
  var ncedil = "??";
  var ncong = "???";
  var ncongdot = "?????";
  var ncup = "???";
  var Ncy = "??";
  var ncy = "??";
  var ndash = "???";
  var nearhk = "???";
  var nearr = "???";
  var neArr = "???";
  var nearrow = "???";
  var ne = "???";
  var nedot = "?????";
  var NegativeMediumSpace = "???";
  var NegativeThickSpace = "???";
  var NegativeThinSpace = "???";
  var NegativeVeryThinSpace = "???";
  var nequiv = "???";
  var nesear = "???";
  var nesim = "?????";
  var NestedGreaterGreater = "???";
  var NestedLessLess = "???";
  var NewLine = "\n";
  var nexist = "???";
  var nexists = "???";
  var Nfr = "????";
  var nfr = "????";
  var ngE = "?????";
  var nge = "???";
  var ngeq = "???";
  var ngeqq = "?????";
  var ngeqslant = "?????";
  var nges = "?????";
  var nGg = "?????";
  var ngsim = "???";
  var nGt = "??????";
  var ngt = "???";
  var ngtr = "???";
  var nGtv = "?????";
  var nharr = "???";
  var nhArr = "???";
  var nhpar = "???";
  var ni = "???";
  var nis = "???";
  var nisd = "???";
  var niv = "???";
  var NJcy = "??";
  var njcy = "??";
  var nlarr = "???";
  var nlArr = "???";
  var nldr = "???";
  var nlE = "?????";
  var nle = "???";
  var nleftarrow = "???";
  var nLeftarrow = "???";
  var nleftrightarrow = "???";
  var nLeftrightarrow = "???";
  var nleq = "???";
  var nleqq = "?????";
  var nleqslant = "?????";
  var nles = "?????";
  var nless = "???";
  var nLl = "?????";
  var nlsim = "???";
  var nLt = "??????";
  var nlt = "???";
  var nltri = "???";
  var nltrie = "???";
  var nLtv = "?????";
  var nmid = "???";
  var NoBreak = "???";
  var NonBreakingSpace = "??";
  var nopf = "????";
  var Nopf = "???";
  var Not = "???";
  var not = "??";
  var NotCongruent = "???";
  var NotCupCap = "???";
  var NotDoubleVerticalBar = "???";
  var NotElement = "???";
  var NotEqual = "???";
  var NotEqualTilde = "?????";
  var NotExists = "???";
  var NotGreater = "???";
  var NotGreaterEqual = "???";
  var NotGreaterFullEqual = "?????";
  var NotGreaterGreater = "?????";
  var NotGreaterLess = "???";
  var NotGreaterSlantEqual = "?????";
  var NotGreaterTilde = "???";
  var NotHumpDownHump = "?????";
  var NotHumpEqual = "?????";
  var notin = "???";
  var notindot = "?????";
  var notinE = "?????";
  var notinva = "???";
  var notinvb = "???";
  var notinvc = "???";
  var NotLeftTriangleBar = "?????";
  var NotLeftTriangle = "???";
  var NotLeftTriangleEqual = "???";
  var NotLess = "???";
  var NotLessEqual = "???";
  var NotLessGreater = "???";
  var NotLessLess = "?????";
  var NotLessSlantEqual = "?????";
  var NotLessTilde = "???";
  var NotNestedGreaterGreater = "?????";
  var NotNestedLessLess = "?????";
  var notni = "???";
  var notniva = "???";
  var notnivb = "???";
  var notnivc = "???";
  var NotPrecedes = "???";
  var NotPrecedesEqual = "?????";
  var NotPrecedesSlantEqual = "???";
  var NotReverseElement = "???";
  var NotRightTriangleBar = "?????";
  var NotRightTriangle = "???";
  var NotRightTriangleEqual = "???";
  var NotSquareSubset = "?????";
  var NotSquareSubsetEqual = "???";
  var NotSquareSuperset = "?????";
  var NotSquareSupersetEqual = "???";
  var NotSubset = "??????";
  var NotSubsetEqual = "???";
  var NotSucceeds = "???";
  var NotSucceedsEqual = "?????";
  var NotSucceedsSlantEqual = "???";
  var NotSucceedsTilde = "?????";
  var NotSuperset = "??????";
  var NotSupersetEqual = "???";
  var NotTilde = "???";
  var NotTildeEqual = "???";
  var NotTildeFullEqual = "???";
  var NotTildeTilde = "???";
  var NotVerticalBar = "???";
  var nparallel = "???";
  var npar = "???";
  var nparsl = "??????";
  var npart = "?????";
  var npolint = "???";
  var npr = "???";
  var nprcue = "???";
  var nprec = "???";
  var npreceq = "?????";
  var npre = "?????";
  var nrarrc = "?????";
  var nrarr = "???";
  var nrArr = "???";
  var nrarrw = "?????";
  var nrightarrow = "???";
  var nRightarrow = "???";
  var nrtri = "???";
  var nrtrie = "???";
  var nsc = "???";
  var nsccue = "???";
  var nsce = "?????";
  var Nscr = "????";
  var nscr = "????";
  var nshortmid = "???";
  var nshortparallel = "???";
  var nsim = "???";
  var nsime = "???";
  var nsimeq = "???";
  var nsmid = "???";
  var nspar = "???";
  var nsqsube = "???";
  var nsqsupe = "???";
  var nsub = "???";
  var nsubE = "?????";
  var nsube = "???";
  var nsubset = "??????";
  var nsubseteq = "???";
  var nsubseteqq = "?????";
  var nsucc = "???";
  var nsucceq = "?????";
  var nsup = "???";
  var nsupE = "?????";
  var nsupe = "???";
  var nsupset = "??????";
  var nsupseteq = "???";
  var nsupseteqq = "?????";
  var ntgl = "???";
  var Ntilde = "??";
  var ntilde = "??";
  var ntlg = "???";
  var ntriangleleft = "???";
  var ntrianglelefteq = "???";
  var ntriangleright = "???";
  var ntrianglerighteq = "???";
  var Nu = "??";
  var nu = "??";
  var num = "#";
  var numero = "???";
  var numsp = "???";
  var nvap = "??????";
  var nvdash = "???";
  var nvDash = "???";
  var nVdash = "???";
  var nVDash = "???";
  var nvge = "??????";
  var nvgt = ">???";
  var nvHarr = "???";
  var nvinfin = "???";
  var nvlArr = "???";
  var nvle = "??????";
  var nvlt = "<???";
  var nvltrie = "??????";
  var nvrArr = "???";
  var nvrtrie = "??????";
  var nvsim = "??????";
  var nwarhk = "???";
  var nwarr = "???";
  var nwArr = "???";
  var nwarrow = "???";
  var nwnear = "???";
  var Oacute = "??";
  var oacute = "??";
  var oast = "???";
  var Ocirc = "??";
  var ocirc = "??";
  var ocir = "???";
  var Ocy = "??";
  var ocy = "??";
  var odash = "???";
  var Odblac = "??";
  var odblac = "??";
  var odiv = "???";
  var odot = "???";
  var odsold = "???";
  var OElig = "??";
  var oelig = "??";
  var ofcir = "???";
  var Ofr = "????";
  var ofr = "????";
  var ogon = "??";
  var Ograve = "??";
  var ograve = "??";
  var ogt = "???";
  var ohbar = "???";
  var ohm = "??";
  var oint = "???";
  var olarr = "???";
  var olcir = "???";
  var olcross = "???";
  var oline = "???";
  var olt = "???";
  var Omacr = "??";
  var omacr = "??";
  var Omega = "??";
  var omega = "??";
  var Omicron = "??";
  var omicron = "??";
  var omid = "???";
  var ominus = "???";
  var Oopf = "????";
  var oopf = "????";
  var opar = "???";
  var OpenCurlyDoubleQuote = "???";
  var OpenCurlyQuote = "???";
  var operp = "???";
  var oplus = "???";
  var orarr = "???";
  var Or = "???";
  var or = "???";
  var ord = "???";
  var order = "???";
  var orderof = "???";
  var ordf = "??";
  var ordm = "??";
  var origof = "???";
  var oror = "???";
  var orslope = "???";
  var orv = "???";
  var oS = "???";
  var Oscr = "????";
  var oscr = "???";
  var Oslash = "??";
  var oslash = "??";
  var osol = "???";
  var Otilde = "??";
  var otilde = "??";
  var otimesas = "???";
  var Otimes = "???";
  var otimes = "???";
  var Ouml = "??";
  var ouml = "??";
  var ovbar = "???";
  var OverBar = "???";
  var OverBrace = "???";
  var OverBracket = "???";
  var OverParenthesis = "???";
  var para = "??";
  var parallel = "???";
  var par = "???";
  var parsim = "???";
  var parsl = "???";
  var part = "???";
  var PartialD = "???";
  var Pcy = "??";
  var pcy = "??";
  var percnt = "%";
  var period = ".";
  var permil = "???";
  var perp = "???";
  var pertenk = "???";
  var Pfr = "????";
  var pfr = "????";
  var Phi = "??";
  var phi = "??";
  var phiv = "??";
  var phmmat = "???";
  var phone = "???";
  var Pi = "??";
  var pi = "??";
  var pitchfork = "???";
  var piv = "??";
  var planck = "???";
  var planckh = "???";
  var plankv = "???";
  var plusacir = "???";
  var plusb = "???";
  var pluscir = "???";
  var plus = "+";
  var plusdo = "???";
  var plusdu = "???";
  var pluse = "???";
  var PlusMinus = "??";
  var plusmn = "??";
  var plussim = "???";
  var plustwo = "???";
  var pm = "??";
  var Poincareplane = "???";
  var pointint = "???";
  var popf = "????";
  var Popf = "???";
  var pound = "??";
  var prap = "???";
  var Pr = "???";
  var pr = "???";
  var prcue = "???";
  var precapprox = "???";
  var prec = "???";
  var preccurlyeq = "???";
  var Precedes = "???";
  var PrecedesEqual = "???";
  var PrecedesSlantEqual = "???";
  var PrecedesTilde = "???";
  var preceq = "???";
  var precnapprox = "???";
  var precneqq = "???";
  var precnsim = "???";
  var pre = "???";
  var prE = "???";
  var precsim = "???";
  var prime = "???";
  var Prime = "???";
  var primes = "???";
  var prnap = "???";
  var prnE = "???";
  var prnsim = "???";
  var prod = "???";
  var Product = "???";
  var profalar = "???";
  var profline = "???";
  var profsurf = "???";
  var prop = "???";
  var Proportional = "???";
  var Proportion = "???";
  var propto = "???";
  var prsim = "???";
  var prurel = "???";
  var Pscr = "????";
  var pscr = "????";
  var Psi = "??";
  var psi = "??";
  var puncsp = "???";
  var Qfr = "????";
  var qfr = "????";
  var qint = "???";
  var qopf = "????";
  var Qopf = "???";
  var qprime = "???";
  var Qscr = "????";
  var qscr = "????";
  var quaternions = "???";
  var quatint = "???";
  var quest = "?";
  var questeq = "???";
  var quot$1 = "\"";
  var QUOT = "\"";
  var rAarr = "???";
  var race = "?????";
  var Racute = "??";
  var racute = "??";
  var radic = "???";
  var raemptyv = "???";
  var rang = "???";
  var Rang = "???";
  var rangd = "???";
  var range = "???";
  var rangle = "???";
  var raquo = "??";
  var rarrap = "???";
  var rarrb = "???";
  var rarrbfs = "???";
  var rarrc = "???";
  var rarr = "???";
  var Rarr = "???";
  var rArr = "???";
  var rarrfs = "???";
  var rarrhk = "???";
  var rarrlp = "???";
  var rarrpl = "???";
  var rarrsim = "???";
  var Rarrtl = "???";
  var rarrtl = "???";
  var rarrw = "???";
  var ratail = "???";
  var rAtail = "???";
  var ratio = "???";
  var rationals = "???";
  var rbarr = "???";
  var rBarr = "???";
  var RBarr = "???";
  var rbbrk = "???";
  var rbrace = "}";
  var rbrack = "]";
  var rbrke = "???";
  var rbrksld = "???";
  var rbrkslu = "???";
  var Rcaron = "??";
  var rcaron = "??";
  var Rcedil = "??";
  var rcedil = "??";
  var rceil = "???";
  var rcub = "}";
  var Rcy = "??";
  var rcy = "??";
  var rdca = "???";
  var rdldhar = "???";
  var rdquo = "???";
  var rdquor = "???";
  var rdsh = "???";
  var real = "???";
  var realine = "???";
  var realpart = "???";
  var reals = "???";
  var Re = "???";
  var rect = "???";
  var reg = "??";
  var REG = "??";
  var ReverseElement = "???";
  var ReverseEquilibrium = "???";
  var ReverseUpEquilibrium = "???";
  var rfisht = "???";
  var rfloor = "???";
  var rfr = "????";
  var Rfr = "???";
  var rHar = "???";
  var rhard = "???";
  var rharu = "???";
  var rharul = "???";
  var Rho = "??";
  var rho = "??";
  var rhov = "??";
  var RightAngleBracket = "???";
  var RightArrowBar = "???";
  var rightarrow = "???";
  var RightArrow = "???";
  var Rightarrow = "???";
  var RightArrowLeftArrow = "???";
  var rightarrowtail = "???";
  var RightCeiling = "???";
  var RightDoubleBracket = "???";
  var RightDownTeeVector = "???";
  var RightDownVectorBar = "???";
  var RightDownVector = "???";
  var RightFloor = "???";
  var rightharpoondown = "???";
  var rightharpoonup = "???";
  var rightleftarrows = "???";
  var rightleftharpoons = "???";
  var rightrightarrows = "???";
  var rightsquigarrow = "???";
  var RightTeeArrow = "???";
  var RightTee = "???";
  var RightTeeVector = "???";
  var rightthreetimes = "???";
  var RightTriangleBar = "???";
  var RightTriangle = "???";
  var RightTriangleEqual = "???";
  var RightUpDownVector = "???";
  var RightUpTeeVector = "???";
  var RightUpVectorBar = "???";
  var RightUpVector = "???";
  var RightVectorBar = "???";
  var RightVector = "???";
  var ring = "??";
  var risingdotseq = "???";
  var rlarr = "???";
  var rlhar = "???";
  var rlm = "???";
  var rmoustache = "???";
  var rmoust = "???";
  var rnmid = "???";
  var roang = "???";
  var roarr = "???";
  var robrk = "???";
  var ropar = "???";
  var ropf = "????";
  var Ropf = "???";
  var roplus = "???";
  var rotimes = "???";
  var RoundImplies = "???";
  var rpar = ")";
  var rpargt = "???";
  var rppolint = "???";
  var rrarr = "???";
  var Rrightarrow = "???";
  var rsaquo = "???";
  var rscr = "????";
  var Rscr = "???";
  var rsh = "???";
  var Rsh = "???";
  var rsqb = "]";
  var rsquo = "???";
  var rsquor = "???";
  var rthree = "???";
  var rtimes = "???";
  var rtri = "???";
  var rtrie = "???";
  var rtrif = "???";
  var rtriltri = "???";
  var RuleDelayed = "???";
  var ruluhar = "???";
  var rx = "???";
  var Sacute = "??";
  var sacute = "??";
  var sbquo = "???";
  var scap = "???";
  var Scaron = "??";
  var scaron = "??";
  var Sc = "???";
  var sc = "???";
  var sccue = "???";
  var sce = "???";
  var scE = "???";
  var Scedil = "??";
  var scedil = "??";
  var Scirc = "??";
  var scirc = "??";
  var scnap = "???";
  var scnE = "???";
  var scnsim = "???";
  var scpolint = "???";
  var scsim = "???";
  var Scy = "??";
  var scy = "??";
  var sdotb = "???";
  var sdot = "???";
  var sdote = "???";
  var searhk = "???";
  var searr = "???";
  var seArr = "???";
  var searrow = "???";
  var sect = "??";
  var semi = ";";
  var seswar = "???";
  var setminus = "???";
  var setmn = "???";
  var sext = "???";
  var Sfr = "????";
  var sfr = "????";
  var sfrown = "???";
  var sharp = "???";
  var SHCHcy = "??";
  var shchcy = "??";
  var SHcy = "??";
  var shcy = "??";
  var ShortDownArrow = "???";
  var ShortLeftArrow = "???";
  var shortmid = "???";
  var shortparallel = "???";
  var ShortRightArrow = "???";
  var ShortUpArrow = "???";
  var shy = "??";
  var Sigma = "??";
  var sigma = "??";
  var sigmaf = "??";
  var sigmav = "??";
  var sim = "???";
  var simdot = "???";
  var sime = "???";
  var simeq = "???";
  var simg = "???";
  var simgE = "???";
  var siml = "???";
  var simlE = "???";
  var simne = "???";
  var simplus = "???";
  var simrarr = "???";
  var slarr = "???";
  var SmallCircle = "???";
  var smallsetminus = "???";
  var smashp = "???";
  var smeparsl = "???";
  var smid = "???";
  var smile = "???";
  var smt = "???";
  var smte = "???";
  var smtes = "??????";
  var SOFTcy = "??";
  var softcy = "??";
  var solbar = "???";
  var solb = "???";
  var sol = "/";
  var Sopf = "????";
  var sopf = "????";
  var spades = "???";
  var spadesuit = "???";
  var spar = "???";
  var sqcap = "???";
  var sqcaps = "??????";
  var sqcup = "???";
  var sqcups = "??????";
  var Sqrt = "???";
  var sqsub = "???";
  var sqsube = "???";
  var sqsubset = "???";
  var sqsubseteq = "???";
  var sqsup = "???";
  var sqsupe = "???";
  var sqsupset = "???";
  var sqsupseteq = "???";
  var square = "???";
  var Square = "???";
  var SquareIntersection = "???";
  var SquareSubset = "???";
  var SquareSubsetEqual = "???";
  var SquareSuperset = "???";
  var SquareSupersetEqual = "???";
  var SquareUnion = "???";
  var squarf = "???";
  var squ = "???";
  var squf = "???";
  var srarr = "???";
  var Sscr = "????";
  var sscr = "????";
  var ssetmn = "???";
  var ssmile = "???";
  var sstarf = "???";
  var Star = "???";
  var star = "???";
  var starf = "???";
  var straightepsilon = "??";
  var straightphi = "??";
  var strns = "??";
  var sub = "???";
  var Sub = "???";
  var subdot = "???";
  var subE = "???";
  var sube = "???";
  var subedot = "???";
  var submult = "???";
  var subnE = "???";
  var subne = "???";
  var subplus = "???";
  var subrarr = "???";
  var subset = "???";
  var Subset = "???";
  var subseteq = "???";
  var subseteqq = "???";
  var SubsetEqual = "???";
  var subsetneq = "???";
  var subsetneqq = "???";
  var subsim = "???";
  var subsub = "???";
  var subsup = "???";
  var succapprox = "???";
  var succ = "???";
  var succcurlyeq = "???";
  var Succeeds = "???";
  var SucceedsEqual = "???";
  var SucceedsSlantEqual = "???";
  var SucceedsTilde = "???";
  var succeq = "???";
  var succnapprox = "???";
  var succneqq = "???";
  var succnsim = "???";
  var succsim = "???";
  var SuchThat = "???";
  var sum = "???";
  var Sum = "???";
  var sung = "???";
  var sup1 = "??";
  var sup2 = "??";
  var sup3 = "??";
  var sup = "???";
  var Sup = "???";
  var supdot = "???";
  var supdsub = "???";
  var supE = "???";
  var supe = "???";
  var supedot = "???";
  var Superset = "???";
  var SupersetEqual = "???";
  var suphsol = "???";
  var suphsub = "???";
  var suplarr = "???";
  var supmult = "???";
  var supnE = "???";
  var supne = "???";
  var supplus = "???";
  var supset = "???";
  var Supset = "???";
  var supseteq = "???";
  var supseteqq = "???";
  var supsetneq = "???";
  var supsetneqq = "???";
  var supsim = "???";
  var supsub = "???";
  var supsup = "???";
  var swarhk = "???";
  var swarr = "???";
  var swArr = "???";
  var swarrow = "???";
  var swnwar = "???";
  var szlig = "??";
  var Tab = "\t";
  var target = "???";
  var Tau = "??";
  var tau = "??";
  var tbrk = "???";
  var Tcaron = "??";
  var tcaron = "??";
  var Tcedil = "??";
  var tcedil = "??";
  var Tcy = "??";
  var tcy = "??";
  var tdot = "???";
  var telrec = "???";
  var Tfr = "????";
  var tfr = "????";
  var there4 = "???";
  var therefore = "???";
  var Therefore = "???";
  var Theta = "??";
  var theta = "??";
  var thetasym = "??";
  var thetav = "??";
  var thickapprox = "???";
  var thicksim = "???";
  var ThickSpace = "??????";
  var ThinSpace = "???";
  var thinsp = "???";
  var thkap = "???";
  var thksim = "???";
  var THORN = "??";
  var thorn = "??";
  var tilde = "??";
  var Tilde = "???";
  var TildeEqual = "???";
  var TildeFullEqual = "???";
  var TildeTilde = "???";
  var timesbar = "???";
  var timesb = "???";
  var times = "??";
  var timesd = "???";
  var tint = "???";
  var toea = "???";
  var topbot = "???";
  var topcir = "???";
  var top = "???";
  var Topf = "????";
  var topf = "????";
  var topfork = "???";
  var tosa = "???";
  var tprime = "???";
  var trade = "???";
  var TRADE = "???";
  var triangle = "???";
  var triangledown = "???";
  var triangleleft = "???";
  var trianglelefteq = "???";
  var triangleq = "???";
  var triangleright = "???";
  var trianglerighteq = "???";
  var tridot = "???";
  var trie = "???";
  var triminus = "???";
  var TripleDot = "???";
  var triplus = "???";
  var trisb = "???";
  var tritime = "???";
  var trpezium = "???";
  var Tscr = "????";
  var tscr = "????";
  var TScy = "??";
  var tscy = "??";
  var TSHcy = "??";
  var tshcy = "??";
  var Tstrok = "??";
  var tstrok = "??";
  var twixt = "???";
  var twoheadleftarrow = "???";
  var twoheadrightarrow = "???";
  var Uacute = "??";
  var uacute = "??";
  var uarr = "???";
  var Uarr = "???";
  var uArr = "???";
  var Uarrocir = "???";
  var Ubrcy = "??";
  var ubrcy = "??";
  var Ubreve = "??";
  var ubreve = "??";
  var Ucirc = "??";
  var ucirc = "??";
  var Ucy = "??";
  var ucy = "??";
  var udarr = "???";
  var Udblac = "??";
  var udblac = "??";
  var udhar = "???";
  var ufisht = "???";
  var Ufr = "????";
  var ufr = "????";
  var Ugrave = "??";
  var ugrave = "??";
  var uHar = "???";
  var uharl = "???";
  var uharr = "???";
  var uhblk = "???";
  var ulcorn = "???";
  var ulcorner = "???";
  var ulcrop = "???";
  var ultri = "???";
  var Umacr = "??";
  var umacr = "??";
  var uml = "??";
  var UnderBar = "_";
  var UnderBrace = "???";
  var UnderBracket = "???";
  var UnderParenthesis = "???";
  var Union = "???";
  var UnionPlus = "???";
  var Uogon = "??";
  var uogon = "??";
  var Uopf = "????";
  var uopf = "????";
  var UpArrowBar = "???";
  var uparrow = "???";
  var UpArrow = "???";
  var Uparrow = "???";
  var UpArrowDownArrow = "???";
  var updownarrow = "???";
  var UpDownArrow = "???";
  var Updownarrow = "???";
  var UpEquilibrium = "???";
  var upharpoonleft = "???";
  var upharpoonright = "???";
  var uplus = "???";
  var UpperLeftArrow = "???";
  var UpperRightArrow = "???";
  var upsi = "??";
  var Upsi = "??";
  var upsih = "??";
  var Upsilon = "??";
  var upsilon = "??";
  var UpTeeArrow = "???";
  var UpTee = "???";
  var upuparrows = "???";
  var urcorn = "???";
  var urcorner = "???";
  var urcrop = "???";
  var Uring = "??";
  var uring = "??";
  var urtri = "???";
  var Uscr = "????";
  var uscr = "????";
  var utdot = "???";
  var Utilde = "??";
  var utilde = "??";
  var utri = "???";
  var utrif = "???";
  var uuarr = "???";
  var Uuml = "??";
  var uuml = "??";
  var uwangle = "???";
  var vangrt = "???";
  var varepsilon = "??";
  var varkappa = "??";
  var varnothing = "???";
  var varphi = "??";
  var varpi = "??";
  var varpropto = "???";
  var varr = "???";
  var vArr = "???";
  var varrho = "??";
  var varsigma = "??";
  var varsubsetneq = "??????";
  var varsubsetneqq = "??????";
  var varsupsetneq = "??????";
  var varsupsetneqq = "??????";
  var vartheta = "??";
  var vartriangleleft = "???";
  var vartriangleright = "???";
  var vBar = "???";
  var Vbar = "???";
  var vBarv = "???";
  var Vcy = "??";
  var vcy = "??";
  var vdash = "???";
  var vDash = "???";
  var Vdash = "???";
  var VDash = "???";
  var Vdashl = "???";
  var veebar = "???";
  var vee = "???";
  var Vee = "???";
  var veeeq = "???";
  var vellip = "???";
  var verbar = "|";
  var Verbar = "???";
  var vert = "|";
  var Vert = "???";
  var VerticalBar = "???";
  var VerticalLine = "|";
  var VerticalSeparator = "???";
  var VerticalTilde = "???";
  var VeryThinSpace = "???";
  var Vfr = "????";
  var vfr = "????";
  var vltri = "???";
  var vnsub = "??????";
  var vnsup = "??????";
  var Vopf = "????";
  var vopf = "????";
  var vprop = "???";
  var vrtri = "???";
  var Vscr = "????";
  var vscr = "????";
  var vsubnE = "??????";
  var vsubne = "??????";
  var vsupnE = "??????";
  var vsupne = "??????";
  var Vvdash = "???";
  var vzigzag = "???";
  var Wcirc = "??";
  var wcirc = "??";
  var wedbar = "???";
  var wedge = "???";
  var Wedge = "???";
  var wedgeq = "???";
  var weierp = "???";
  var Wfr = "????";
  var wfr = "????";
  var Wopf = "????";
  var wopf = "????";
  var wp = "???";
  var wr = "???";
  var wreath = "???";
  var Wscr = "????";
  var wscr = "????";
  var xcap = "???";
  var xcirc = "???";
  var xcup = "???";
  var xdtri = "???";
  var Xfr = "????";
  var xfr = "????";
  var xharr = "???";
  var xhArr = "???";
  var Xi = "??";
  var xi = "??";
  var xlarr = "???";
  var xlArr = "???";
  var xmap = "???";
  var xnis = "???";
  var xodot = "???";
  var Xopf = "????";
  var xopf = "????";
  var xoplus = "???";
  var xotime = "???";
  var xrarr = "???";
  var xrArr = "???";
  var Xscr = "????";
  var xscr = "????";
  var xsqcup = "???";
  var xuplus = "???";
  var xutri = "???";
  var xvee = "???";
  var xwedge = "???";
  var Yacute = "??";
  var yacute = "??";
  var YAcy = "??";
  var yacy = "??";
  var Ycirc = "??";
  var ycirc = "??";
  var Ycy = "??";
  var ycy = "??";
  var yen = "??";
  var Yfr = "????";
  var yfr = "????";
  var YIcy = "??";
  var yicy = "??";
  var Yopf = "????";
  var yopf = "????";
  var Yscr = "????";
  var yscr = "????";
  var YUcy = "??";
  var yucy = "??";
  var yuml = "??";
  var Yuml = "??";
  var Zacute = "??";
  var zacute = "??";
  var Zcaron = "??";
  var zcaron = "??";
  var Zcy = "??";
  var zcy = "??";
  var Zdot = "??";
  var zdot = "??";
  var zeetrf = "???";
  var ZeroWidthSpace = "???";
  var Zeta = "??";
  var zeta = "??";
  var zfr = "????";
  var Zfr = "???";
  var ZHcy = "??";
  var zhcy = "??";
  var zigrarr = "???";
  var zopf = "????";
  var Zopf = "???";
  var Zscr = "????";
  var zscr = "????";
  var zwj = "???";
  var zwnj = "???";
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
    "in": "???",
    infin: infin,
    infintie: infintie,
    inodot: inodot,
    intcal: intcal,
    "int": _int,
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
    "Map": "???",
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
    "int": _int,
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
    return Object.keys(obj).sort().reduce(function (inverse, name) {
      inverse[obj[name]] = "&" + name + ";";
      return inverse;
    }, {});
  }

  function getInverseReplacer(inverse) {
    var single = [],
        multiple = [];
    Object.keys(inverse).forEach(function (k) {
      if (k.length === 1) {
        single.push("\\" + k);
      } else {
        multiple.push(k);
      }
    }); //TODO add ranges

    multiple.unshift("[" + single.join("") + "]");
    return new RegExp(multiple.join("|"), "g");
  }

  var re_nonASCII = /[^\0-\x7F]/g,
      re_astralSymbols = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;

  function singleCharReplacer(c) {
    return "&#x" + c.charCodeAt(0).toString(16).toUpperCase() + ";";
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

    return function (data) {
      return data.replace(re, func).replace(re_astralSymbols, astralReplacer).replace(re_nonASCII, singleCharReplacer);
    };
  }

  var re_xmlChars = getInverseReplacer(inverseXML);

  function escapeXML(data) {
    return data.replace(re_xmlChars, singleCharReplacer).replace(re_astralSymbols, astralReplacer).replace(re_nonASCII, singleCharReplacer);
  }

  var escape = escapeXML;
  var encode$1 = {
    XML: XML,
    HTML: HTML,
    escape: escape
  };
  var Aacute$1 = "??";
  var aacute$1 = "??";
  var Acirc$1 = "??";
  var acirc$1 = "??";
  var acute$1 = "??";
  var AElig$1 = "??";
  var aelig$1 = "??";
  var Agrave$1 = "??";
  var agrave$1 = "??";
  var amp$2 = "&";
  var AMP$1 = "&";
  var Aring$1 = "??";
  var aring$1 = "??";
  var Atilde$1 = "??";
  var atilde$1 = "??";
  var Auml$1 = "??";
  var auml$1 = "??";
  var brvbar$1 = "??";
  var Ccedil$1 = "??";
  var ccedil$1 = "??";
  var cedil$1 = "??";
  var cent$1 = "??";
  var copy$1 = "??";
  var COPY$1 = "??";
  var curren$1 = "??";
  var deg$1 = "??";
  var divide$1 = "??";
  var Eacute$1 = "??";
  var eacute$1 = "??";
  var Ecirc$1 = "??";
  var ecirc$1 = "??";
  var Egrave$1 = "??";
  var egrave$1 = "??";
  var ETH$1 = "??";
  var eth$1 = "??";
  var Euml$1 = "??";
  var euml$1 = "??";
  var frac12$1 = "??";
  var frac14$1 = "??";
  var frac34$1 = "??";
  var gt$2 = ">";
  var GT$1 = ">";
  var Iacute$1 = "??";
  var iacute$1 = "??";
  var Icirc$1 = "??";
  var icirc$1 = "??";
  var iexcl$1 = "??";
  var Igrave$1 = "??";
  var igrave$1 = "??";
  var iquest$1 = "??";
  var Iuml$1 = "??";
  var iuml$1 = "??";
  var laquo$1 = "??";
  var lt$2 = "<";
  var LT$1 = "<";
  var macr$1 = "??";
  var micro$1 = "??";
  var middot$1 = "??";
  var nbsp$1 = "??";
  var not$1 = "??";
  var Ntilde$1 = "??";
  var ntilde$1 = "??";
  var Oacute$1 = "??";
  var oacute$1 = "??";
  var Ocirc$1 = "??";
  var ocirc$1 = "??";
  var Ograve$1 = "??";
  var ograve$1 = "??";
  var ordf$1 = "??";
  var ordm$1 = "??";
  var Oslash$1 = "??";
  var oslash$1 = "??";
  var Otilde$1 = "??";
  var otilde$1 = "??";
  var Ouml$1 = "??";
  var ouml$1 = "??";
  var para$1 = "??";
  var plusmn$1 = "??";
  var pound$1 = "??";
  var quot$2 = "\"";
  var QUOT$1 = "\"";
  var raquo$1 = "??";
  var reg$1 = "??";
  var REG$1 = "??";
  var sect$1 = "??";
  var shy$1 = "??";
  var sup1$1 = "??";
  var sup2$1 = "??";
  var sup3$1 = "??";
  var szlig$1 = "??";
  var THORN$1 = "??";
  var thorn$1 = "??";
  var times$1 = "??";
  var Uacute$1 = "??";
  var uacute$1 = "??";
  var Ucirc$1 = "??";
  var ucirc$1 = "??";
  var Ugrave$1 = "??";
  var ugrave$1 = "??";
  var uml$1 = "??";
  var Uuml$1 = "??";
  var uuml$1 = "??";
  var Yacute$1 = "??";
  var yacute$1 = "??";
  var yen$1 = "??";
  var yuml$1 = "??";
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
  var decode_codepoint = decodeCodePoint; // modified version of https://github.com/mathiasbynens/he/blob/master/src/he.js#L94-L119

  function decodeCodePoint(codePoint) {
    if (codePoint >= 0xd800 && codePoint <= 0xdfff || codePoint > 0x10ffff) {
      return "\uFFFD";
    }

    if (codePoint in decodeMap) {
      codePoint = decodeMap[codePoint];
    }

    var output = "";

    if (codePoint > 0xffff) {
      codePoint -= 0x10000;
      output += String.fromCharCode(codePoint >>> 10 & 0x3ff | 0xd800);
      codePoint = 0xdc00 | codePoint & 0x3ff;
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
    return function (str) {
      return String(str).replace(re, replace);
    };
  }

  var decodeHTML = function () {
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
      if (str.substr(-1) !== ";") str += ";";
      return replace(str);
    } //TODO consider creating a merged map


    return function (str) {
      return String(str).replace(re, replacer);
    };
  }();

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
    exports.decode = function (data, level) {
      return (!level || level <= 0 ? decode$3.XML : decode$3.HTML)(data);
    };

    exports.decodeStrict = function (data, level) {
      return (!level || level <= 0 ? decode$3.XML : decode$3.HTMLStrict)(data);
    };

    exports.encode = function (data, level) {
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
  var HTMLTAG = "(?:" + OPENTAG + "|" + CLOSETAG + "|" + HTMLCOMMENT + "|" + PROCESSINGINSTRUCTION + "|" + DECLARATION + "|" + CDATA + ")";
  var reHtmlTag = new RegExp('^' + HTMLTAG, 'i');
  var reBackslashOrAmp = /[\\&]/;
  var ESCAPABLE = '[!"#$%&\'()*+,./:;<=>?@[\\\\\\]^_`{|}~-]';
  var reEntityOrEscapedChar = new RegExp('\\\\' + ESCAPABLE + '|' + ENTITY, 'gi');
  var XMLSPECIAL = '[&<>"]';
  var reXmlSpecial = new RegExp(XMLSPECIAL, 'g');

  var unescapeChar = function unescapeChar(s) {
    if (s.charCodeAt(0) === C_BACKSLASH) {
      return s.charAt(1);
    } else {
      return decodeHTML$1(s);
    }
  }; // Replace entities and backslash escapes with literal characters.


  var unescapeString = function unescapeString(s) {
    if (reBackslashOrAmp.test(s)) {
      return s.replace(reEntityOrEscapedChar, unescapeChar);
    } else {
      return s;
    }
  };

  var normalizeURI = function normalizeURI(uri) {
    try {
      return encode_1(uri);
    } catch (err) {
      return uri;
    }
  };

  var replaceUnsafeChar = function replaceUnsafeChar(s) {
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

  var escapeXml = function escapeXml(s) {
    if (reXmlSpecial.test(s)) {
      return s.replace(reXmlSpecial, replaceUnsafeChar);
    } else {
      return s;
    }
  };

  var common = {
    unescapeString: unescapeString,
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
  var map$1 = {
    'A': 'a',
    'B': 'b',
    'C': 'c',
    'D': 'd',
    'E': 'e',
    'F': 'f',
    'G': 'g',
    'H': 'h',
    'I': 'i',
    'J': 'j',
    'K': 'k',
    'L': 'l',
    'M': 'm',
    'N': 'n',
    'O': 'o',
    'P': 'p',
    'Q': 'q',
    'R': 'r',
    'S': 's',
    'T': 't',
    'U': 'u',
    'V': 'v',
    'W': 'w',
    'X': 'x',
    'Y': 'y',
    'Z': 'z',
    '\xB5': "\u03BC",
    '\xC0': '\xE0',
    '\xC1': '\xE1',
    '\xC2': '\xE2',
    '\xC3': '\xE3',
    '\xC4': '\xE4',
    '\xC5': '\xE5',
    '\xC6': '\xE6',
    '\xC7': '\xE7',
    '\xC8': '\xE8',
    '\xC9': '\xE9',
    '\xCA': '\xEA',
    '\xCB': '\xEB',
    '\xCC': '\xEC',
    '\xCD': '\xED',
    '\xCE': '\xEE',
    '\xCF': '\xEF',
    '\xD0': '\xF0',
    '\xD1': '\xF1',
    '\xD2': '\xF2',
    '\xD3': '\xF3',
    '\xD4': '\xF4',
    '\xD5': '\xF5',
    '\xD6': '\xF6',
    '\xD8': '\xF8',
    '\xD9': '\xF9',
    '\xDA': '\xFA',
    '\xDB': '\xFB',
    '\xDC': '\xFC',
    '\xDD': '\xFD',
    '\xDE': '\xFE',
    "\u0100": "\u0101",
    "\u0102": "\u0103",
    "\u0104": "\u0105",
    "\u0106": "\u0107",
    "\u0108": "\u0109",
    "\u010A": "\u010B",
    "\u010C": "\u010D",
    "\u010E": "\u010F",
    "\u0110": "\u0111",
    "\u0112": "\u0113",
    "\u0114": "\u0115",
    "\u0116": "\u0117",
    "\u0118": "\u0119",
    "\u011A": "\u011B",
    "\u011C": "\u011D",
    "\u011E": "\u011F",
    "\u0120": "\u0121",
    "\u0122": "\u0123",
    "\u0124": "\u0125",
    "\u0126": "\u0127",
    "\u0128": "\u0129",
    "\u012A": "\u012B",
    "\u012C": "\u012D",
    "\u012E": "\u012F",
    "\u0132": "\u0133",
    "\u0134": "\u0135",
    "\u0136": "\u0137",
    "\u0139": "\u013A",
    "\u013B": "\u013C",
    "\u013D": "\u013E",
    "\u013F": "\u0140",
    "\u0141": "\u0142",
    "\u0143": "\u0144",
    "\u0145": "\u0146",
    "\u0147": "\u0148",
    "\u014A": "\u014B",
    "\u014C": "\u014D",
    "\u014E": "\u014F",
    "\u0150": "\u0151",
    "\u0152": "\u0153",
    "\u0154": "\u0155",
    "\u0156": "\u0157",
    "\u0158": "\u0159",
    "\u015A": "\u015B",
    "\u015C": "\u015D",
    "\u015E": "\u015F",
    "\u0160": "\u0161",
    "\u0162": "\u0163",
    "\u0164": "\u0165",
    "\u0166": "\u0167",
    "\u0168": "\u0169",
    "\u016A": "\u016B",
    "\u016C": "\u016D",
    "\u016E": "\u016F",
    "\u0170": "\u0171",
    "\u0172": "\u0173",
    "\u0174": "\u0175",
    "\u0176": "\u0177",
    "\u0178": '\xFF',
    "\u0179": "\u017A",
    "\u017B": "\u017C",
    "\u017D": "\u017E",
    "\u017F": 's',
    "\u0181": "\u0253",
    "\u0182": "\u0183",
    "\u0184": "\u0185",
    "\u0186": "\u0254",
    "\u0187": "\u0188",
    "\u0189": "\u0256",
    "\u018A": "\u0257",
    "\u018B": "\u018C",
    "\u018E": "\u01DD",
    "\u018F": "\u0259",
    "\u0190": "\u025B",
    "\u0191": "\u0192",
    "\u0193": "\u0260",
    "\u0194": "\u0263",
    "\u0196": "\u0269",
    "\u0197": "\u0268",
    "\u0198": "\u0199",
    "\u019C": "\u026F",
    "\u019D": "\u0272",
    "\u019F": "\u0275",
    "\u01A0": "\u01A1",
    "\u01A2": "\u01A3",
    "\u01A4": "\u01A5",
    "\u01A6": "\u0280",
    "\u01A7": "\u01A8",
    "\u01A9": "\u0283",
    "\u01AC": "\u01AD",
    "\u01AE": "\u0288",
    "\u01AF": "\u01B0",
    "\u01B1": "\u028A",
    "\u01B2": "\u028B",
    "\u01B3": "\u01B4",
    "\u01B5": "\u01B6",
    "\u01B7": "\u0292",
    "\u01B8": "\u01B9",
    "\u01BC": "\u01BD",
    "\u01C4": "\u01C6",
    "\u01C5": "\u01C6",
    "\u01C7": "\u01C9",
    "\u01C8": "\u01C9",
    "\u01CA": "\u01CC",
    "\u01CB": "\u01CC",
    "\u01CD": "\u01CE",
    "\u01CF": "\u01D0",
    "\u01D1": "\u01D2",
    "\u01D3": "\u01D4",
    "\u01D5": "\u01D6",
    "\u01D7": "\u01D8",
    "\u01D9": "\u01DA",
    "\u01DB": "\u01DC",
    "\u01DE": "\u01DF",
    "\u01E0": "\u01E1",
    "\u01E2": "\u01E3",
    "\u01E4": "\u01E5",
    "\u01E6": "\u01E7",
    "\u01E8": "\u01E9",
    "\u01EA": "\u01EB",
    "\u01EC": "\u01ED",
    "\u01EE": "\u01EF",
    "\u01F1": "\u01F3",
    "\u01F2": "\u01F3",
    "\u01F4": "\u01F5",
    "\u01F6": "\u0195",
    "\u01F7": "\u01BF",
    "\u01F8": "\u01F9",
    "\u01FA": "\u01FB",
    "\u01FC": "\u01FD",
    "\u01FE": "\u01FF",
    "\u0200": "\u0201",
    "\u0202": "\u0203",
    "\u0204": "\u0205",
    "\u0206": "\u0207",
    "\u0208": "\u0209",
    "\u020A": "\u020B",
    "\u020C": "\u020D",
    "\u020E": "\u020F",
    "\u0210": "\u0211",
    "\u0212": "\u0213",
    "\u0214": "\u0215",
    "\u0216": "\u0217",
    "\u0218": "\u0219",
    "\u021A": "\u021B",
    "\u021C": "\u021D",
    "\u021E": "\u021F",
    "\u0220": "\u019E",
    "\u0222": "\u0223",
    "\u0224": "\u0225",
    "\u0226": "\u0227",
    "\u0228": "\u0229",
    "\u022A": "\u022B",
    "\u022C": "\u022D",
    "\u022E": "\u022F",
    "\u0230": "\u0231",
    "\u0232": "\u0233",
    "\u023A": "\u2C65",
    "\u023B": "\u023C",
    "\u023D": "\u019A",
    "\u023E": "\u2C66",
    "\u0241": "\u0242",
    "\u0243": "\u0180",
    "\u0244": "\u0289",
    "\u0245": "\u028C",
    "\u0246": "\u0247",
    "\u0248": "\u0249",
    "\u024A": "\u024B",
    "\u024C": "\u024D",
    "\u024E": "\u024F",
    "\u0345": "\u03B9",
    "\u0370": "\u0371",
    "\u0372": "\u0373",
    "\u0376": "\u0377",
    "\u037F": "\u03F3",
    "\u0386": "\u03AC",
    "\u0388": "\u03AD",
    "\u0389": "\u03AE",
    "\u038A": "\u03AF",
    "\u038C": "\u03CC",
    "\u038E": "\u03CD",
    "\u038F": "\u03CE",
    "\u0391": "\u03B1",
    "\u0392": "\u03B2",
    "\u0393": "\u03B3",
    "\u0394": "\u03B4",
    "\u0395": "\u03B5",
    "\u0396": "\u03B6",
    "\u0397": "\u03B7",
    "\u0398": "\u03B8",
    "\u0399": "\u03B9",
    "\u039A": "\u03BA",
    "\u039B": "\u03BB",
    "\u039C": "\u03BC",
    "\u039D": "\u03BD",
    "\u039E": "\u03BE",
    "\u039F": "\u03BF",
    "\u03A0": "\u03C0",
    "\u03A1": "\u03C1",
    "\u03A3": "\u03C3",
    "\u03A4": "\u03C4",
    "\u03A5": "\u03C5",
    "\u03A6": "\u03C6",
    "\u03A7": "\u03C7",
    "\u03A8": "\u03C8",
    "\u03A9": "\u03C9",
    "\u03AA": "\u03CA",
    "\u03AB": "\u03CB",
    "\u03C2": "\u03C3",
    "\u03CF": "\u03D7",
    "\u03D0": "\u03B2",
    "\u03D1": "\u03B8",
    "\u03D5": "\u03C6",
    "\u03D6": "\u03C0",
    "\u03D8": "\u03D9",
    "\u03DA": "\u03DB",
    "\u03DC": "\u03DD",
    "\u03DE": "\u03DF",
    "\u03E0": "\u03E1",
    "\u03E2": "\u03E3",
    "\u03E4": "\u03E5",
    "\u03E6": "\u03E7",
    "\u03E8": "\u03E9",
    "\u03EA": "\u03EB",
    "\u03EC": "\u03ED",
    "\u03EE": "\u03EF",
    "\u03F0": "\u03BA",
    "\u03F1": "\u03C1",
    "\u03F4": "\u03B8",
    "\u03F5": "\u03B5",
    "\u03F7": "\u03F8",
    "\u03F9": "\u03F2",
    "\u03FA": "\u03FB",
    "\u03FD": "\u037B",
    "\u03FE": "\u037C",
    "\u03FF": "\u037D",
    "\u0400": "\u0450",
    "\u0401": "\u0451",
    "\u0402": "\u0452",
    "\u0403": "\u0453",
    "\u0404": "\u0454",
    "\u0405": "\u0455",
    "\u0406": "\u0456",
    "\u0407": "\u0457",
    "\u0408": "\u0458",
    "\u0409": "\u0459",
    "\u040A": "\u045A",
    "\u040B": "\u045B",
    "\u040C": "\u045C",
    "\u040D": "\u045D",
    "\u040E": "\u045E",
    "\u040F": "\u045F",
    "\u0410": "\u0430",
    "\u0411": "\u0431",
    "\u0412": "\u0432",
    "\u0413": "\u0433",
    "\u0414": "\u0434",
    "\u0415": "\u0435",
    "\u0416": "\u0436",
    "\u0417": "\u0437",
    "\u0418": "\u0438",
    "\u0419": "\u0439",
    "\u041A": "\u043A",
    "\u041B": "\u043B",
    "\u041C": "\u043C",
    "\u041D": "\u043D",
    "\u041E": "\u043E",
    "\u041F": "\u043F",
    "\u0420": "\u0440",
    "\u0421": "\u0441",
    "\u0422": "\u0442",
    "\u0423": "\u0443",
    "\u0424": "\u0444",
    "\u0425": "\u0445",
    "\u0426": "\u0446",
    "\u0427": "\u0447",
    "\u0428": "\u0448",
    "\u0429": "\u0449",
    "\u042A": "\u044A",
    "\u042B": "\u044B",
    "\u042C": "\u044C",
    "\u042D": "\u044D",
    "\u042E": "\u044E",
    "\u042F": "\u044F",
    "\u0460": "\u0461",
    "\u0462": "\u0463",
    "\u0464": "\u0465",
    "\u0466": "\u0467",
    "\u0468": "\u0469",
    "\u046A": "\u046B",
    "\u046C": "\u046D",
    "\u046E": "\u046F",
    "\u0470": "\u0471",
    "\u0472": "\u0473",
    "\u0474": "\u0475",
    "\u0476": "\u0477",
    "\u0478": "\u0479",
    "\u047A": "\u047B",
    "\u047C": "\u047D",
    "\u047E": "\u047F",
    "\u0480": "\u0481",
    "\u048A": "\u048B",
    "\u048C": "\u048D",
    "\u048E": "\u048F",
    "\u0490": "\u0491",
    "\u0492": "\u0493",
    "\u0494": "\u0495",
    "\u0496": "\u0497",
    "\u0498": "\u0499",
    "\u049A": "\u049B",
    "\u049C": "\u049D",
    "\u049E": "\u049F",
    "\u04A0": "\u04A1",
    "\u04A2": "\u04A3",
    "\u04A4": "\u04A5",
    "\u04A6": "\u04A7",
    "\u04A8": "\u04A9",
    "\u04AA": "\u04AB",
    "\u04AC": "\u04AD",
    "\u04AE": "\u04AF",
    "\u04B0": "\u04B1",
    "\u04B2": "\u04B3",
    "\u04B4": "\u04B5",
    "\u04B6": "\u04B7",
    "\u04B8": "\u04B9",
    "\u04BA": "\u04BB",
    "\u04BC": "\u04BD",
    "\u04BE": "\u04BF",
    "\u04C0": "\u04CF",
    "\u04C1": "\u04C2",
    "\u04C3": "\u04C4",
    "\u04C5": "\u04C6",
    "\u04C7": "\u04C8",
    "\u04C9": "\u04CA",
    "\u04CB": "\u04CC",
    "\u04CD": "\u04CE",
    "\u04D0": "\u04D1",
    "\u04D2": "\u04D3",
    "\u04D4": "\u04D5",
    "\u04D6": "\u04D7",
    "\u04D8": "\u04D9",
    "\u04DA": "\u04DB",
    "\u04DC": "\u04DD",
    "\u04DE": "\u04DF",
    "\u04E0": "\u04E1",
    "\u04E2": "\u04E3",
    "\u04E4": "\u04E5",
    "\u04E6": "\u04E7",
    "\u04E8": "\u04E9",
    "\u04EA": "\u04EB",
    "\u04EC": "\u04ED",
    "\u04EE": "\u04EF",
    "\u04F0": "\u04F1",
    "\u04F2": "\u04F3",
    "\u04F4": "\u04F5",
    "\u04F6": "\u04F7",
    "\u04F8": "\u04F9",
    "\u04FA": "\u04FB",
    "\u04FC": "\u04FD",
    "\u04FE": "\u04FF",
    "\u0500": "\u0501",
    "\u0502": "\u0503",
    "\u0504": "\u0505",
    "\u0506": "\u0507",
    "\u0508": "\u0509",
    "\u050A": "\u050B",
    "\u050C": "\u050D",
    "\u050E": "\u050F",
    "\u0510": "\u0511",
    "\u0512": "\u0513",
    "\u0514": "\u0515",
    "\u0516": "\u0517",
    "\u0518": "\u0519",
    "\u051A": "\u051B",
    "\u051C": "\u051D",
    "\u051E": "\u051F",
    "\u0520": "\u0521",
    "\u0522": "\u0523",
    "\u0524": "\u0525",
    "\u0526": "\u0527",
    "\u0528": "\u0529",
    "\u052A": "\u052B",
    "\u052C": "\u052D",
    "\u052E": "\u052F",
    "\u0531": "\u0561",
    "\u0532": "\u0562",
    "\u0533": "\u0563",
    "\u0534": "\u0564",
    "\u0535": "\u0565",
    "\u0536": "\u0566",
    "\u0537": "\u0567",
    "\u0538": "\u0568",
    "\u0539": "\u0569",
    "\u053A": "\u056A",
    "\u053B": "\u056B",
    "\u053C": "\u056C",
    "\u053D": "\u056D",
    "\u053E": "\u056E",
    "\u053F": "\u056F",
    "\u0540": "\u0570",
    "\u0541": "\u0571",
    "\u0542": "\u0572",
    "\u0543": "\u0573",
    "\u0544": "\u0574",
    "\u0545": "\u0575",
    "\u0546": "\u0576",
    "\u0547": "\u0577",
    "\u0548": "\u0578",
    "\u0549": "\u0579",
    "\u054A": "\u057A",
    "\u054B": "\u057B",
    "\u054C": "\u057C",
    "\u054D": "\u057D",
    "\u054E": "\u057E",
    "\u054F": "\u057F",
    "\u0550": "\u0580",
    "\u0551": "\u0581",
    "\u0552": "\u0582",
    "\u0553": "\u0583",
    "\u0554": "\u0584",
    "\u0555": "\u0585",
    "\u0556": "\u0586",
    "\u10A0": "\u2D00",
    "\u10A1": "\u2D01",
    "\u10A2": "\u2D02",
    "\u10A3": "\u2D03",
    "\u10A4": "\u2D04",
    "\u10A5": "\u2D05",
    "\u10A6": "\u2D06",
    "\u10A7": "\u2D07",
    "\u10A8": "\u2D08",
    "\u10A9": "\u2D09",
    "\u10AA": "\u2D0A",
    "\u10AB": "\u2D0B",
    "\u10AC": "\u2D0C",
    "\u10AD": "\u2D0D",
    "\u10AE": "\u2D0E",
    "\u10AF": "\u2D0F",
    "\u10B0": "\u2D10",
    "\u10B1": "\u2D11",
    "\u10B2": "\u2D12",
    "\u10B3": "\u2D13",
    "\u10B4": "\u2D14",
    "\u10B5": "\u2D15",
    "\u10B6": "\u2D16",
    "\u10B7": "\u2D17",
    "\u10B8": "\u2D18",
    "\u10B9": "\u2D19",
    "\u10BA": "\u2D1A",
    "\u10BB": "\u2D1B",
    "\u10BC": "\u2D1C",
    "\u10BD": "\u2D1D",
    "\u10BE": "\u2D1E",
    "\u10BF": "\u2D1F",
    "\u10C0": "\u2D20",
    "\u10C1": "\u2D21",
    "\u10C2": "\u2D22",
    "\u10C3": "\u2D23",
    "\u10C4": "\u2D24",
    "\u10C5": "\u2D25",
    "\u10C7": "\u2D27",
    "\u10CD": "\u2D2D",
    "\u1E00": "\u1E01",
    "\u1E02": "\u1E03",
    "\u1E04": "\u1E05",
    "\u1E06": "\u1E07",
    "\u1E08": "\u1E09",
    "\u1E0A": "\u1E0B",
    "\u1E0C": "\u1E0D",
    "\u1E0E": "\u1E0F",
    "\u1E10": "\u1E11",
    "\u1E12": "\u1E13",
    "\u1E14": "\u1E15",
    "\u1E16": "\u1E17",
    "\u1E18": "\u1E19",
    "\u1E1A": "\u1E1B",
    "\u1E1C": "\u1E1D",
    "\u1E1E": "\u1E1F",
    "\u1E20": "\u1E21",
    "\u1E22": "\u1E23",
    "\u1E24": "\u1E25",
    "\u1E26": "\u1E27",
    "\u1E28": "\u1E29",
    "\u1E2A": "\u1E2B",
    "\u1E2C": "\u1E2D",
    "\u1E2E": "\u1E2F",
    "\u1E30": "\u1E31",
    "\u1E32": "\u1E33",
    "\u1E34": "\u1E35",
    "\u1E36": "\u1E37",
    "\u1E38": "\u1E39",
    "\u1E3A": "\u1E3B",
    "\u1E3C": "\u1E3D",
    "\u1E3E": "\u1E3F",
    "\u1E40": "\u1E41",
    "\u1E42": "\u1E43",
    "\u1E44": "\u1E45",
    "\u1E46": "\u1E47",
    "\u1E48": "\u1E49",
    "\u1E4A": "\u1E4B",
    "\u1E4C": "\u1E4D",
    "\u1E4E": "\u1E4F",
    "\u1E50": "\u1E51",
    "\u1E52": "\u1E53",
    "\u1E54": "\u1E55",
    "\u1E56": "\u1E57",
    "\u1E58": "\u1E59",
    "\u1E5A": "\u1E5B",
    "\u1E5C": "\u1E5D",
    "\u1E5E": "\u1E5F",
    "\u1E60": "\u1E61",
    "\u1E62": "\u1E63",
    "\u1E64": "\u1E65",
    "\u1E66": "\u1E67",
    "\u1E68": "\u1E69",
    "\u1E6A": "\u1E6B",
    "\u1E6C": "\u1E6D",
    "\u1E6E": "\u1E6F",
    "\u1E70": "\u1E71",
    "\u1E72": "\u1E73",
    "\u1E74": "\u1E75",
    "\u1E76": "\u1E77",
    "\u1E78": "\u1E79",
    "\u1E7A": "\u1E7B",
    "\u1E7C": "\u1E7D",
    "\u1E7E": "\u1E7F",
    "\u1E80": "\u1E81",
    "\u1E82": "\u1E83",
    "\u1E84": "\u1E85",
    "\u1E86": "\u1E87",
    "\u1E88": "\u1E89",
    "\u1E8A": "\u1E8B",
    "\u1E8C": "\u1E8D",
    "\u1E8E": "\u1E8F",
    "\u1E90": "\u1E91",
    "\u1E92": "\u1E93",
    "\u1E94": "\u1E95",
    "\u1E9B": "\u1E61",
    "\u1EA0": "\u1EA1",
    "\u1EA2": "\u1EA3",
    "\u1EA4": "\u1EA5",
    "\u1EA6": "\u1EA7",
    "\u1EA8": "\u1EA9",
    "\u1EAA": "\u1EAB",
    "\u1EAC": "\u1EAD",
    "\u1EAE": "\u1EAF",
    "\u1EB0": "\u1EB1",
    "\u1EB2": "\u1EB3",
    "\u1EB4": "\u1EB5",
    "\u1EB6": "\u1EB7",
    "\u1EB8": "\u1EB9",
    "\u1EBA": "\u1EBB",
    "\u1EBC": "\u1EBD",
    "\u1EBE": "\u1EBF",
    "\u1EC0": "\u1EC1",
    "\u1EC2": "\u1EC3",
    "\u1EC4": "\u1EC5",
    "\u1EC6": "\u1EC7",
    "\u1EC8": "\u1EC9",
    "\u1ECA": "\u1ECB",
    "\u1ECC": "\u1ECD",
    "\u1ECE": "\u1ECF",
    "\u1ED0": "\u1ED1",
    "\u1ED2": "\u1ED3",
    "\u1ED4": "\u1ED5",
    "\u1ED6": "\u1ED7",
    "\u1ED8": "\u1ED9",
    "\u1EDA": "\u1EDB",
    "\u1EDC": "\u1EDD",
    "\u1EDE": "\u1EDF",
    "\u1EE0": "\u1EE1",
    "\u1EE2": "\u1EE3",
    "\u1EE4": "\u1EE5",
    "\u1EE6": "\u1EE7",
    "\u1EE8": "\u1EE9",
    "\u1EEA": "\u1EEB",
    "\u1EEC": "\u1EED",
    "\u1EEE": "\u1EEF",
    "\u1EF0": "\u1EF1",
    "\u1EF2": "\u1EF3",
    "\u1EF4": "\u1EF5",
    "\u1EF6": "\u1EF7",
    "\u1EF8": "\u1EF9",
    "\u1EFA": "\u1EFB",
    "\u1EFC": "\u1EFD",
    "\u1EFE": "\u1EFF",
    "\u1F08": "\u1F00",
    "\u1F09": "\u1F01",
    "\u1F0A": "\u1F02",
    "\u1F0B": "\u1F03",
    "\u1F0C": "\u1F04",
    "\u1F0D": "\u1F05",
    "\u1F0E": "\u1F06",
    "\u1F0F": "\u1F07",
    "\u1F18": "\u1F10",
    "\u1F19": "\u1F11",
    "\u1F1A": "\u1F12",
    "\u1F1B": "\u1F13",
    "\u1F1C": "\u1F14",
    "\u1F1D": "\u1F15",
    "\u1F28": "\u1F20",
    "\u1F29": "\u1F21",
    "\u1F2A": "\u1F22",
    "\u1F2B": "\u1F23",
    "\u1F2C": "\u1F24",
    "\u1F2D": "\u1F25",
    "\u1F2E": "\u1F26",
    "\u1F2F": "\u1F27",
    "\u1F38": "\u1F30",
    "\u1F39": "\u1F31",
    "\u1F3A": "\u1F32",
    "\u1F3B": "\u1F33",
    "\u1F3C": "\u1F34",
    "\u1F3D": "\u1F35",
    "\u1F3E": "\u1F36",
    "\u1F3F": "\u1F37",
    "\u1F48": "\u1F40",
    "\u1F49": "\u1F41",
    "\u1F4A": "\u1F42",
    "\u1F4B": "\u1F43",
    "\u1F4C": "\u1F44",
    "\u1F4D": "\u1F45",
    "\u1F59": "\u1F51",
    "\u1F5B": "\u1F53",
    "\u1F5D": "\u1F55",
    "\u1F5F": "\u1F57",
    "\u1F68": "\u1F60",
    "\u1F69": "\u1F61",
    "\u1F6A": "\u1F62",
    "\u1F6B": "\u1F63",
    "\u1F6C": "\u1F64",
    "\u1F6D": "\u1F65",
    "\u1F6E": "\u1F66",
    "\u1F6F": "\u1F67",
    "\u1FB8": "\u1FB0",
    "\u1FB9": "\u1FB1",
    "\u1FBA": "\u1F70",
    "\u1FBB": "\u1F71",
    "\u1FBE": "\u03B9",
    "\u1FC8": "\u1F72",
    "\u1FC9": "\u1F73",
    "\u1FCA": "\u1F74",
    "\u1FCB": "\u1F75",
    "\u1FD8": "\u1FD0",
    "\u1FD9": "\u1FD1",
    "\u1FDA": "\u1F76",
    "\u1FDB": "\u1F77",
    "\u1FE8": "\u1FE0",
    "\u1FE9": "\u1FE1",
    "\u1FEA": "\u1F7A",
    "\u1FEB": "\u1F7B",
    "\u1FEC": "\u1FE5",
    "\u1FF8": "\u1F78",
    "\u1FF9": "\u1F79",
    "\u1FFA": "\u1F7C",
    "\u1FFB": "\u1F7D",
    "\u2126": "\u03C9",
    "\u212A": 'k',
    "\u212B": '\xE5',
    "\u2132": "\u214E",
    "\u2160": "\u2170",
    "\u2161": "\u2171",
    "\u2162": "\u2172",
    "\u2163": "\u2173",
    "\u2164": "\u2174",
    "\u2165": "\u2175",
    "\u2166": "\u2176",
    "\u2167": "\u2177",
    "\u2168": "\u2178",
    "\u2169": "\u2179",
    "\u216A": "\u217A",
    "\u216B": "\u217B",
    "\u216C": "\u217C",
    "\u216D": "\u217D",
    "\u216E": "\u217E",
    "\u216F": "\u217F",
    "\u2183": "\u2184",
    "\u24B6": "\u24D0",
    "\u24B7": "\u24D1",
    "\u24B8": "\u24D2",
    "\u24B9": "\u24D3",
    "\u24BA": "\u24D4",
    "\u24BB": "\u24D5",
    "\u24BC": "\u24D6",
    "\u24BD": "\u24D7",
    "\u24BE": "\u24D8",
    "\u24BF": "\u24D9",
    "\u24C0": "\u24DA",
    "\u24C1": "\u24DB",
    "\u24C2": "\u24DC",
    "\u24C3": "\u24DD",
    "\u24C4": "\u24DE",
    "\u24C5": "\u24DF",
    "\u24C6": "\u24E0",
    "\u24C7": "\u24E1",
    "\u24C8": "\u24E2",
    "\u24C9": "\u24E3",
    "\u24CA": "\u24E4",
    "\u24CB": "\u24E5",
    "\u24CC": "\u24E6",
    "\u24CD": "\u24E7",
    "\u24CE": "\u24E8",
    "\u24CF": "\u24E9",
    "\u2C00": "\u2C30",
    "\u2C01": "\u2C31",
    "\u2C02": "\u2C32",
    "\u2C03": "\u2C33",
    "\u2C04": "\u2C34",
    "\u2C05": "\u2C35",
    "\u2C06": "\u2C36",
    "\u2C07": "\u2C37",
    "\u2C08": "\u2C38",
    "\u2C09": "\u2C39",
    "\u2C0A": "\u2C3A",
    "\u2C0B": "\u2C3B",
    "\u2C0C": "\u2C3C",
    "\u2C0D": "\u2C3D",
    "\u2C0E": "\u2C3E",
    "\u2C0F": "\u2C3F",
    "\u2C10": "\u2C40",
    "\u2C11": "\u2C41",
    "\u2C12": "\u2C42",
    "\u2C13": "\u2C43",
    "\u2C14": "\u2C44",
    "\u2C15": "\u2C45",
    "\u2C16": "\u2C46",
    "\u2C17": "\u2C47",
    "\u2C18": "\u2C48",
    "\u2C19": "\u2C49",
    "\u2C1A": "\u2C4A",
    "\u2C1B": "\u2C4B",
    "\u2C1C": "\u2C4C",
    "\u2C1D": "\u2C4D",
    "\u2C1E": "\u2C4E",
    "\u2C1F": "\u2C4F",
    "\u2C20": "\u2C50",
    "\u2C21": "\u2C51",
    "\u2C22": "\u2C52",
    "\u2C23": "\u2C53",
    "\u2C24": "\u2C54",
    "\u2C25": "\u2C55",
    "\u2C26": "\u2C56",
    "\u2C27": "\u2C57",
    "\u2C28": "\u2C58",
    "\u2C29": "\u2C59",
    "\u2C2A": "\u2C5A",
    "\u2C2B": "\u2C5B",
    "\u2C2C": "\u2C5C",
    "\u2C2D": "\u2C5D",
    "\u2C2E": "\u2C5E",
    "\u2C60": "\u2C61",
    "\u2C62": "\u026B",
    "\u2C63": "\u1D7D",
    "\u2C64": "\u027D",
    "\u2C67": "\u2C68",
    "\u2C69": "\u2C6A",
    "\u2C6B": "\u2C6C",
    "\u2C6D": "\u0251",
    "\u2C6E": "\u0271",
    "\u2C6F": "\u0250",
    "\u2C70": "\u0252",
    "\u2C72": "\u2C73",
    "\u2C75": "\u2C76",
    "\u2C7E": "\u023F",
    "\u2C7F": "\u0240",
    "\u2C80": "\u2C81",
    "\u2C82": "\u2C83",
    "\u2C84": "\u2C85",
    "\u2C86": "\u2C87",
    "\u2C88": "\u2C89",
    "\u2C8A": "\u2C8B",
    "\u2C8C": "\u2C8D",
    "\u2C8E": "\u2C8F",
    "\u2C90": "\u2C91",
    "\u2C92": "\u2C93",
    "\u2C94": "\u2C95",
    "\u2C96": "\u2C97",
    "\u2C98": "\u2C99",
    "\u2C9A": "\u2C9B",
    "\u2C9C": "\u2C9D",
    "\u2C9E": "\u2C9F",
    "\u2CA0": "\u2CA1",
    "\u2CA2": "\u2CA3",
    "\u2CA4": "\u2CA5",
    "\u2CA6": "\u2CA7",
    "\u2CA8": "\u2CA9",
    "\u2CAA": "\u2CAB",
    "\u2CAC": "\u2CAD",
    "\u2CAE": "\u2CAF",
    "\u2CB0": "\u2CB1",
    "\u2CB2": "\u2CB3",
    "\u2CB4": "\u2CB5",
    "\u2CB6": "\u2CB7",
    "\u2CB8": "\u2CB9",
    "\u2CBA": "\u2CBB",
    "\u2CBC": "\u2CBD",
    "\u2CBE": "\u2CBF",
    "\u2CC0": "\u2CC1",
    "\u2CC2": "\u2CC3",
    "\u2CC4": "\u2CC5",
    "\u2CC6": "\u2CC7",
    "\u2CC8": "\u2CC9",
    "\u2CCA": "\u2CCB",
    "\u2CCC": "\u2CCD",
    "\u2CCE": "\u2CCF",
    "\u2CD0": "\u2CD1",
    "\u2CD2": "\u2CD3",
    "\u2CD4": "\u2CD5",
    "\u2CD6": "\u2CD7",
    "\u2CD8": "\u2CD9",
    "\u2CDA": "\u2CDB",
    "\u2CDC": "\u2CDD",
    "\u2CDE": "\u2CDF",
    "\u2CE0": "\u2CE1",
    "\u2CE2": "\u2CE3",
    "\u2CEB": "\u2CEC",
    "\u2CED": "\u2CEE",
    "\u2CF2": "\u2CF3",
    "\uA640": "\uA641",
    "\uA642": "\uA643",
    "\uA644": "\uA645",
    "\uA646": "\uA647",
    "\uA648": "\uA649",
    "\uA64A": "\uA64B",
    "\uA64C": "\uA64D",
    "\uA64E": "\uA64F",
    "\uA650": "\uA651",
    "\uA652": "\uA653",
    "\uA654": "\uA655",
    "\uA656": "\uA657",
    "\uA658": "\uA659",
    "\uA65A": "\uA65B",
    "\uA65C": "\uA65D",
    "\uA65E": "\uA65F",
    "\uA660": "\uA661",
    "\uA662": "\uA663",
    "\uA664": "\uA665",
    "\uA666": "\uA667",
    "\uA668": "\uA669",
    "\uA66A": "\uA66B",
    "\uA66C": "\uA66D",
    "\uA680": "\uA681",
    "\uA682": "\uA683",
    "\uA684": "\uA685",
    "\uA686": "\uA687",
    "\uA688": "\uA689",
    "\uA68A": "\uA68B",
    "\uA68C": "\uA68D",
    "\uA68E": "\uA68F",
    "\uA690": "\uA691",
    "\uA692": "\uA693",
    "\uA694": "\uA695",
    "\uA696": "\uA697",
    "\uA698": "\uA699",
    "\uA69A": "\uA69B",
    "\uA722": "\uA723",
    "\uA724": "\uA725",
    "\uA726": "\uA727",
    "\uA728": "\uA729",
    "\uA72A": "\uA72B",
    "\uA72C": "\uA72D",
    "\uA72E": "\uA72F",
    "\uA732": "\uA733",
    "\uA734": "\uA735",
    "\uA736": "\uA737",
    "\uA738": "\uA739",
    "\uA73A": "\uA73B",
    "\uA73C": "\uA73D",
    "\uA73E": "\uA73F",
    "\uA740": "\uA741",
    "\uA742": "\uA743",
    "\uA744": "\uA745",
    "\uA746": "\uA747",
    "\uA748": "\uA749",
    "\uA74A": "\uA74B",
    "\uA74C": "\uA74D",
    "\uA74E": "\uA74F",
    "\uA750": "\uA751",
    "\uA752": "\uA753",
    "\uA754": "\uA755",
    "\uA756": "\uA757",
    "\uA758": "\uA759",
    "\uA75A": "\uA75B",
    "\uA75C": "\uA75D",
    "\uA75E": "\uA75F",
    "\uA760": "\uA761",
    "\uA762": "\uA763",
    "\uA764": "\uA765",
    "\uA766": "\uA767",
    "\uA768": "\uA769",
    "\uA76A": "\uA76B",
    "\uA76C": "\uA76D",
    "\uA76E": "\uA76F",
    "\uA779": "\uA77A",
    "\uA77B": "\uA77C",
    "\uA77D": "\u1D79",
    "\uA77E": "\uA77F",
    "\uA780": "\uA781",
    "\uA782": "\uA783",
    "\uA784": "\uA785",
    "\uA786": "\uA787",
    "\uA78B": "\uA78C",
    "\uA78D": "\u0265",
    "\uA790": "\uA791",
    "\uA792": "\uA793",
    "\uA796": "\uA797",
    "\uA798": "\uA799",
    "\uA79A": "\uA79B",
    "\uA79C": "\uA79D",
    "\uA79E": "\uA79F",
    "\uA7A0": "\uA7A1",
    "\uA7A2": "\uA7A3",
    "\uA7A4": "\uA7A5",
    "\uA7A6": "\uA7A7",
    "\uA7A8": "\uA7A9",
    "\uA7AA": "\u0266",
    "\uA7AB": "\u025C",
    "\uA7AC": "\u0261",
    "\uA7AD": "\u026C",
    "\uA7B0": "\u029E",
    "\uA7B1": "\u0287",
    "\uFF21": "\uFF41",
    "\uFF22": "\uFF42",
    "\uFF23": "\uFF43",
    "\uFF24": "\uFF44",
    "\uFF25": "\uFF45",
    "\uFF26": "\uFF46",
    "\uFF27": "\uFF47",
    "\uFF28": "\uFF48",
    "\uFF29": "\uFF49",
    "\uFF2A": "\uFF4A",
    "\uFF2B": "\uFF4B",
    "\uFF2C": "\uFF4C",
    "\uFF2D": "\uFF4D",
    "\uFF2E": "\uFF4E",
    "\uFF2F": "\uFF4F",
    "\uFF30": "\uFF50",
    "\uFF31": "\uFF51",
    "\uFF32": "\uFF52",
    "\uFF33": "\uFF53",
    "\uFF34": "\uFF54",
    "\uFF35": "\uFF55",
    "\uFF36": "\uFF56",
    "\uFF37": "\uFF57",
    "\uFF38": "\uFF58",
    "\uFF39": "\uFF59",
    "\uFF3A": "\uFF5A",
    "\uD801\uDC00": "\uD801\uDC28",
    "\uD801\uDC01": "\uD801\uDC29",
    "\uD801\uDC02": "\uD801\uDC2A",
    "\uD801\uDC03": "\uD801\uDC2B",
    "\uD801\uDC04": "\uD801\uDC2C",
    "\uD801\uDC05": "\uD801\uDC2D",
    "\uD801\uDC06": "\uD801\uDC2E",
    "\uD801\uDC07": "\uD801\uDC2F",
    "\uD801\uDC08": "\uD801\uDC30",
    "\uD801\uDC09": "\uD801\uDC31",
    "\uD801\uDC0A": "\uD801\uDC32",
    "\uD801\uDC0B": "\uD801\uDC33",
    "\uD801\uDC0C": "\uD801\uDC34",
    "\uD801\uDC0D": "\uD801\uDC35",
    "\uD801\uDC0E": "\uD801\uDC36",
    "\uD801\uDC0F": "\uD801\uDC37",
    "\uD801\uDC10": "\uD801\uDC38",
    "\uD801\uDC11": "\uD801\uDC39",
    "\uD801\uDC12": "\uD801\uDC3A",
    "\uD801\uDC13": "\uD801\uDC3B",
    "\uD801\uDC14": "\uD801\uDC3C",
    "\uD801\uDC15": "\uD801\uDC3D",
    "\uD801\uDC16": "\uD801\uDC3E",
    "\uD801\uDC17": "\uD801\uDC3F",
    "\uD801\uDC18": "\uD801\uDC40",
    "\uD801\uDC19": "\uD801\uDC41",
    "\uD801\uDC1A": "\uD801\uDC42",
    "\uD801\uDC1B": "\uD801\uDC43",
    "\uD801\uDC1C": "\uD801\uDC44",
    "\uD801\uDC1D": "\uD801\uDC45",
    "\uD801\uDC1E": "\uD801\uDC46",
    "\uD801\uDC1F": "\uD801\uDC47",
    "\uD801\uDC20": "\uD801\uDC48",
    "\uD801\uDC21": "\uD801\uDC49",
    "\uD801\uDC22": "\uD801\uDC4A",
    "\uD801\uDC23": "\uD801\uDC4B",
    "\uD801\uDC24": "\uD801\uDC4C",
    "\uD801\uDC25": "\uD801\uDC4D",
    "\uD801\uDC26": "\uD801\uDC4E",
    "\uD801\uDC27": "\uD801\uDC4F",
    "\uD806\uDCA0": "\uD806\uDCC0",
    "\uD806\uDCA1": "\uD806\uDCC1",
    "\uD806\uDCA2": "\uD806\uDCC2",
    "\uD806\uDCA3": "\uD806\uDCC3",
    "\uD806\uDCA4": "\uD806\uDCC4",
    "\uD806\uDCA5": "\uD806\uDCC5",
    "\uD806\uDCA6": "\uD806\uDCC6",
    "\uD806\uDCA7": "\uD806\uDCC7",
    "\uD806\uDCA8": "\uD806\uDCC8",
    "\uD806\uDCA9": "\uD806\uDCC9",
    "\uD806\uDCAA": "\uD806\uDCCA",
    "\uD806\uDCAB": "\uD806\uDCCB",
    "\uD806\uDCAC": "\uD806\uDCCC",
    "\uD806\uDCAD": "\uD806\uDCCD",
    "\uD806\uDCAE": "\uD806\uDCCE",
    "\uD806\uDCAF": "\uD806\uDCCF",
    "\uD806\uDCB0": "\uD806\uDCD0",
    "\uD806\uDCB1": "\uD806\uDCD1",
    "\uD806\uDCB2": "\uD806\uDCD2",
    "\uD806\uDCB3": "\uD806\uDCD3",
    "\uD806\uDCB4": "\uD806\uDCD4",
    "\uD806\uDCB5": "\uD806\uDCD5",
    "\uD806\uDCB6": "\uD806\uDCD6",
    "\uD806\uDCB7": "\uD806\uDCD7",
    "\uD806\uDCB8": "\uD806\uDCD8",
    "\uD806\uDCB9": "\uD806\uDCD9",
    "\uD806\uDCBA": "\uD806\uDCDA",
    "\uD806\uDCBB": "\uD806\uDCDB",
    "\uD806\uDCBC": "\uD806\uDCDC",
    "\uD806\uDCBD": "\uD806\uDCDD",
    "\uD806\uDCBE": "\uD806\uDCDE",
    "\uD806\uDCBF": "\uD806\uDCDF",
    '\xDF': 'ss',
    "\u0130": "i\u0307",
    "\u0149": "\u02BCn",
    "\u01F0": "j\u030C",
    "\u0390": "\u03B9\u0308\u0301",
    "\u03B0": "\u03C5\u0308\u0301",
    "\u0587": "\u0565\u0582",
    "\u1E96": "h\u0331",
    "\u1E97": "t\u0308",
    "\u1E98": "w\u030A",
    "\u1E99": "y\u030A",
    "\u1E9A": "a\u02BE",
    "\u1E9E": 'ss',
    "\u1F50": "\u03C5\u0313",
    "\u1F52": "\u03C5\u0313\u0300",
    "\u1F54": "\u03C5\u0313\u0301",
    "\u1F56": "\u03C5\u0313\u0342",
    "\u1F80": "\u1F00\u03B9",
    "\u1F81": "\u1F01\u03B9",
    "\u1F82": "\u1F02\u03B9",
    "\u1F83": "\u1F03\u03B9",
    "\u1F84": "\u1F04\u03B9",
    "\u1F85": "\u1F05\u03B9",
    "\u1F86": "\u1F06\u03B9",
    "\u1F87": "\u1F07\u03B9",
    "\u1F88": "\u1F00\u03B9",
    "\u1F89": "\u1F01\u03B9",
    "\u1F8A": "\u1F02\u03B9",
    "\u1F8B": "\u1F03\u03B9",
    "\u1F8C": "\u1F04\u03B9",
    "\u1F8D": "\u1F05\u03B9",
    "\u1F8E": "\u1F06\u03B9",
    "\u1F8F": "\u1F07\u03B9",
    "\u1F90": "\u1F20\u03B9",
    "\u1F91": "\u1F21\u03B9",
    "\u1F92": "\u1F22\u03B9",
    "\u1F93": "\u1F23\u03B9",
    "\u1F94": "\u1F24\u03B9",
    "\u1F95": "\u1F25\u03B9",
    "\u1F96": "\u1F26\u03B9",
    "\u1F97": "\u1F27\u03B9",
    "\u1F98": "\u1F20\u03B9",
    "\u1F99": "\u1F21\u03B9",
    "\u1F9A": "\u1F22\u03B9",
    "\u1F9B": "\u1F23\u03B9",
    "\u1F9C": "\u1F24\u03B9",
    "\u1F9D": "\u1F25\u03B9",
    "\u1F9E": "\u1F26\u03B9",
    "\u1F9F": "\u1F27\u03B9",
    "\u1FA0": "\u1F60\u03B9",
    "\u1FA1": "\u1F61\u03B9",
    "\u1FA2": "\u1F62\u03B9",
    "\u1FA3": "\u1F63\u03B9",
    "\u1FA4": "\u1F64\u03B9",
    "\u1FA5": "\u1F65\u03B9",
    "\u1FA6": "\u1F66\u03B9",
    "\u1FA7": "\u1F67\u03B9",
    "\u1FA8": "\u1F60\u03B9",
    "\u1FA9": "\u1F61\u03B9",
    "\u1FAA": "\u1F62\u03B9",
    "\u1FAB": "\u1F63\u03B9",
    "\u1FAC": "\u1F64\u03B9",
    "\u1FAD": "\u1F65\u03B9",
    "\u1FAE": "\u1F66\u03B9",
    "\u1FAF": "\u1F67\u03B9",
    "\u1FB2": "\u1F70\u03B9",
    "\u1FB3": "\u03B1\u03B9",
    "\u1FB4": "\u03AC\u03B9",
    "\u1FB6": "\u03B1\u0342",
    "\u1FB7": "\u03B1\u0342\u03B9",
    "\u1FBC": "\u03B1\u03B9",
    "\u1FC2": "\u1F74\u03B9",
    "\u1FC3": "\u03B7\u03B9",
    "\u1FC4": "\u03AE\u03B9",
    "\u1FC6": "\u03B7\u0342",
    "\u1FC7": "\u03B7\u0342\u03B9",
    "\u1FCC": "\u03B7\u03B9",
    "\u1FD2": "\u03B9\u0308\u0300",
    "\u1FD3": "\u03B9\u0308\u0301",
    "\u1FD6": "\u03B9\u0342",
    "\u1FD7": "\u03B9\u0308\u0342",
    "\u1FE2": "\u03C5\u0308\u0300",
    "\u1FE3": "\u03C5\u0308\u0301",
    "\u1FE4": "\u03C1\u0313",
    "\u1FE6": "\u03C5\u0342",
    "\u1FE7": "\u03C5\u0308\u0342",
    "\u1FF2": "\u1F7C\u03B9",
    "\u1FF3": "\u03C9\u03B9",
    "\u1FF4": "\u03CE\u03B9",
    "\u1FF6": "\u03C9\u0342",
    "\u1FF7": "\u03C9\u0342\u03B9",
    "\u1FFC": "\u03C9\u03B9",
    "\uFB00": 'ff',
    "\uFB01": 'fi',
    "\uFB02": 'fl',
    "\uFB03": 'ffi',
    "\uFB04": 'ffl',
    "\uFB05": 'st',
    "\uFB06": 'st',
    "\uFB13": "\u0574\u0576",
    "\uFB14": "\u0574\u0565",
    "\uFB15": "\u0574\u056B",
    "\uFB16": "\u057E\u0576",
    "\uFB17": "\u0574\u056D"
  }; // Normalize reference label: collapse internal whitespace
  // to single space, remove leading/trailing whitespace, case fold.

  var normalizeReference = function normalizeReference(string) {
    return string.slice(1, string.length - 1).trim().replace(regex, function ($0) {
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

      var fromCodePoint = function fromCodePoint() {
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
          var codePoint = Number(arguments[index]);

          if (!isFinite(codePoint) || // `NaN`, `+Infinity`, or `-Infinity`
          codePoint < 0 || // not a valid Unicode code point
          codePoint > 0x10FFFF || // not a valid Unicode code point
          floor(codePoint) !== codePoint // not an integer
          ) {
              return String.fromCharCode(0xFFFD);
            }

          if (codePoint <= 0xFFFF) {
            // BMP code point
            codeUnits.push(codePoint);
          } else {
            // Astral code point; split in surrogate halves
            // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
            codePoint -= 0x10000;
            highSurrogate = (codePoint >> 10) + 0xD800;
            lowSurrogate = codePoint % 0x400 + 0xDC00;
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
    (function () {
      var defineProperty = function () {
        // IE 8 only supports `Object.defineProperty` on DOM elements
        try {
          var object = {};
          var $defineProperty = Object.defineProperty;
          var result = $defineProperty(object, object, object) && $defineProperty;
        } catch (error) {}

        return result;
      }();

      var repeat = function repeat(count) {
        if (this == null) {
          throw TypeError();
        }

        var string = String(this); // `ToInteger`

        var n = count ? Number(count) : 0;

        if (n != n) {
          // better `isNaN`
          n = 0;
        } // Account for out-of-bounds indices


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
    })();
  }

  var normalizeURI$1 = common.normalizeURI;
  var unescapeString$1 = common.unescapeString;
  var decodeHTML$2 = entities$2.decodeHTML; // Polyfill for String.prototype.repeat
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
  var C_DOUBLEQUOTE = 34; // Some regexps used in inline parser:

  var ESCAPABLE$1 = common.ESCAPABLE;
  var ESCAPED_CHAR = '\\\\' + ESCAPABLE$1;
  var ENTITY$1 = common.ENTITY;
  var reHtmlTag$1 = common.reHtmlTag;
  var rePunctuation = new RegExp(/[!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u0AF0\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166D\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E42\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC9\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9]|\uD805[\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDF3C-\uDF3E]|\uD809[\uDC70-\uDC74]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]/);
  var reLinkTitle = new RegExp('^(?:"(' + ESCAPED_CHAR + '|[^"\\x00])*"' + '|' + '\'(' + ESCAPED_CHAR + '|[^\'\\x00])*\'' + '|' + '\\((' + ESCAPED_CHAR + '|[^()\\x00])*\\))');
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
  var reLinkLabel = /^\[(?:[^\\\[\]]|\\.){0,1000}\]/; // Matches a string of non-special characters.

  var reMain = /^[^\n`\[\]\\!<&*_'"]+/m;

  var text$2 = function text$2(s) {
    var node$1 = new node('text');
    node$1._literal = s;
    return node$1;
  }; // INLINE PARSER
  // These are methods of an InlineParser object, defined below.
  // An InlineParser keeps track of a subject (a string to be
  // parsed) and a position in that subject.
  // If re matches at current position in the subject, advance
  // position in subject and return the match; otherwise return null.


  var match = function match(re) {
    var m = re.exec(this.subject.slice(this.pos));

    if (m === null) {
      return null;
    } else {
      this.pos += m.index + m[0].length;
      return m[0];
    }
  }; // Returns the code for the character at the current subject position, or -1
  // there are no more characters.


  var peek = function peek() {
    if (this.pos < this.subject.length) {
      return this.subject.charCodeAt(this.pos);
    } else {
      return -1;
    }
  }; // Parse zero or more space characters, including at most one newline


  var spnl = function spnl() {
    this.match(reSpnl);
    return true;
  }; // All of the parsers below try to match something at the current position
  // in the subject.  If they succeed in matching anything, they
  // return the inline matched, advancing the subject.
  // Attempt to parse backticks, adding either a backtick code span or a
  // literal sequence of backticks.


  var parseBackticks = function parseBackticks(block) {
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
        contents = this.subject.slice(afterOpenTicks, this.pos - ticks.length).replace(/\n/gm, ' ');

        if (contents.length > 0 && contents.match(/[^ ]/) !== null && contents[0] == ' ' && contents[contents.length - 1] == ' ') {
          node$1._literal = contents.slice(1, contents.length - 1);
        } else {
          node$1._literal = contents;
        }

        block.appendChild(node$1);
        return true;
      }
    } // If we got here, we didn't match a closing backtick sequence.


    this.pos = afterOpenTicks;
    block.appendChild(text$2(ticks));
    return true;
  }; // Parse a backslash-escaped special character, adding either the escaped
  // character, a hard line break (if the backslash is followed by a newline),
  // or a literal backslash to the block's children.  Assumes current character
  // is a backslash.


  var parseBackslash = function parseBackslash(block) {
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
  }; // Attempt to parse an autolink (URL or email in pointy brackets).


  var parseAutolink = function parseAutolink(block) {
    var m;
    var dest;
    var node$1;

    if (m = this.match(reEmailAutolink)) {
      dest = m.slice(1, m.length - 1);
      node$1 = new node('link');
      node$1._destination = normalizeURI$1('mailto:' + dest);
      node$1._title = '';
      node$1.appendChild(text$2(dest));
      block.appendChild(node$1);
      return true;
    } else if (m = this.match(reAutolink)) {
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
  }; // Attempt to parse a raw HTML tag.


  var parseHtmlTag = function parseHtmlTag(block) {
    var m = this.match(reHtmlTag$1);

    if (m === null) {
      return false;
    } else {
      var node$1 = new node('html_inline');
      node$1._literal = m;
      block.appendChild(node$1);
      return true;
    }
  }; // Scan a sequence of characters with code cc, and return information about
  // the number of delimiters and whether they are positioned such that
  // they can open and/or close emphasis or strong emphasis.  A utility
  // function for strong/emph parsing.


  var scanDelims = function scanDelims(cc) {
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
    left_flanking = !after_is_whitespace && (!after_is_punctuation || before_is_whitespace || before_is_punctuation);
    right_flanking = !before_is_whitespace && (!before_is_punctuation || after_is_whitespace || after_is_punctuation);

    if (cc === C_UNDERSCORE) {
      can_open = left_flanking && (!right_flanking || before_is_punctuation);
      can_close = right_flanking && (!left_flanking || after_is_punctuation);
    } else if (cc === C_SINGLEQUOTE || cc === C_DOUBLEQUOTE) {
      can_open = left_flanking && !right_flanking;
      can_close = right_flanking;
    } else {
      can_open = left_flanking;
      can_close = right_flanking;
    }

    this.pos = startpos;
    return {
      numdelims: numdelims,
      can_open: can_open,
      can_close: can_close
    };
  }; // Handle a delimiter marker for emphasis or a quote.


  var handleDelim = function handleDelim(cc, block) {
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
    block.appendChild(node); // Add entry to stack for this opener

    if ((res.can_open || res.can_close) && (this.options.smart || cc !== C_SINGLEQUOTE || cc !== C_DOUBLEQUOTE)) {
      this.delimiters = {
        cc: cc,
        numdelims: numdelims,
        origdelims: numdelims,
        node: node,
        previous: this.delimiters,
        next: null,
        can_open: res.can_open,
        can_close: res.can_close
      };

      if (this.delimiters.previous !== null) {
        this.delimiters.previous.next = this.delimiters;
      }
    }

    return true;
  };

  var removeDelimiter = function removeDelimiter(delim) {
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

  var removeDelimitersBetween = function removeDelimitersBetween(bottom, top) {
    if (bottom.next !== top) {
      bottom.next = top;
      top.previous = bottom;
    }
  };

  var processEmphasis = function processEmphasis(stack_bottom) {
    var opener, closer, old_closer;
    var opener_inl, closer_inl;
    var tempstack;
    var use_delims;
    var tmp, next;
    var opener_found;
    var openers_bottom = [[], [], []];
    var odd_match = false;

    for (var i = 0; i < 3; i++) {
      openers_bottom[i][C_UNDERSCORE] = stack_bottom;
      openers_bottom[i][C_ASTERISK] = stack_bottom;
      openers_bottom[i][C_SINGLEQUOTE] = stack_bottom;
      openers_bottom[i][C_DOUBLEQUOTE] = stack_bottom;
    } // find first closer above stack_bottom:


    closer = this.delimiters;

    while (closer !== null && closer.previous !== stack_bottom) {
      closer = closer.previous;
    } // move forward, looking for closers, and handling each


    while (closer !== null) {
      var closercc = closer.cc;

      if (!closer.can_close) {
        closer = closer.next;
      } else {
        // found emphasis closer. now look back for first matching opener:
        opener = closer.previous;
        opener_found = false;

        while (opener !== null && opener !== stack_bottom && opener !== openers_bottom[closer.origdelims % 3][closercc]) {
          odd_match = (closer.can_open || opener.can_close) && closer.origdelims % 3 !== 0 && (opener.origdelims + closer.origdelims) % 3 === 0;

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
            use_delims = closer.numdelims >= 2 && opener.numdelims >= 2 ? 2 : 1;
            opener_inl = opener.node;
            closer_inl = closer.node; // remove used delimiters from stack elts and inlines

            opener.numdelims -= use_delims;
            closer.numdelims -= use_delims;
            opener_inl._literal = opener_inl._literal.slice(0, opener_inl._literal.length - use_delims);
            closer_inl._literal = closer_inl._literal.slice(0, closer_inl._literal.length - use_delims); // build contents for new emph element

            var emph = new node(use_delims === 1 ? 'emph' : 'strong');
            tmp = opener_inl._next;

            while (tmp && tmp !== closer_inl) {
              next = tmp._next;
              tmp.unlink();
              emph.appendChild(tmp);
              tmp = next;
            }

            opener_inl.insertAfter(emph); // remove elts between opener and closer in delimiters stack

            removeDelimitersBetween(opener, closer); // if opener has 0 delims, remove it and the inline

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
    } // remove all delimiters


    while (this.delimiters !== null && this.delimiters !== stack_bottom) {
      this.removeDelimiter(this.delimiters);
    }
  }; // Attempt to parse link title (sans quotes), returning the string
  // or null if no match.


  var parseLinkTitle = function parseLinkTitle() {
    var title = this.match(reLinkTitle);

    if (title === null) {
      return null;
    } else {
      // chop off quotes from title and unescape:
      return unescapeString$1(title.substr(1, title.length - 2));
    }
  }; // Attempt to parse link destination, returning the string or
  // null if no match.


  var parseLinkDestination = function parseLinkDestination() {
    var res = this.match(reLinkDestinationBraces);

    if (res === null) {
      if (this.peek() === C_LESSTHAN) {
        return null;
      } // TODO handrolled parser; res should be null or the string


      var savepos = this.pos;
      var openparens = 0;
      var c;

      while ((c = this.peek()) !== -1) {
        if (c === C_BACKSLASH$1 && reEscapable.test(this.subject.charAt(this.pos + 1))) {
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
    } else {
      // chop off surrounding <..>:
      return normalizeURI$1(unescapeString$1(res.substr(1, res.length - 2)));
    }
  }; // Attempt to parse a link label, returning number of characters parsed.


  var parseLinkLabel = function parseLinkLabel() {
    var m = this.match(reLinkLabel);

    if (m === null || m.length > 1001) {
      return 0;
    } else {
      return m.length;
    }
  }; // Add open bracket to delimiter stack and add a text node to block's children.


  var parseOpenBracket = function parseOpenBracket(block) {
    var startpos = this.pos;
    this.pos += 1;
    var node = text$2('[');
    block.appendChild(node); // Add entry to stack for this opener

    this.addBracket(node, startpos, false);
    return true;
  }; // IF next character is [, and ! delimiter to delimiter stack and
  // add a text node to block's children.  Otherwise just add a text node.


  var parseBang = function parseBang(block) {
    var startpos = this.pos;
    this.pos += 1;

    if (this.peek() === C_OPEN_BRACKET) {
      this.pos += 1;
      var node = text$2('![');
      block.appendChild(node); // Add entry to stack for this opener

      this.addBracket(node, startpos + 1, true);
    } else {
      block.appendChild(text$2('!'));
    }

    return true;
  }; // Try to match close bracket against an opening in the delimiter
  // stack.  Add either a link or image, or a plain [ character,
  // to block's children.  If there is a matching delimiter,
  // remove it from the delimiter stack.


  var parseCloseBracket = function parseCloseBracket(block) {
    var startpos;
    var is_image;
    var dest;
    var title;
    var matched = false;
    var reflabel;
    var opener;
    this.pos += 1;
    startpos = this.pos; // get last [ or ![

    opener = this.brackets;

    if (opener === null) {
      // no matched opener, just return a literal
      block.appendChild(text$2(']'));
      return true;
    }

    if (!opener.active) {
      // no matched opener, just return a literal
      block.appendChild(text$2(']')); // take opener off brackets stack

      this.removeBracket();
      return true;
    } // If we got here, open is a potential opener


    is_image = opener.image; // Check to see if we have a link/image

    var savepos = this.pos; // Inline link?

    if (this.peek() === C_OPEN_PAREN) {
      this.pos++;

      if (this.spnl() && (dest = this.parseLinkDestination()) !== null && this.spnl() && ( // make sure there's a space before the title:
      reWhitespaceChar.test(this.subject.charAt(this.pos - 1)) && (title = this.parseLinkTitle()) || true) && this.spnl() && this.peek() === C_CLOSE_PAREN) {
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
      opener.node.unlink(); // We remove this bracket and processEmphasis will remove later delimiters.
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
    } else {
      // no match
      this.removeBracket(); // remove this opener from stack

      this.pos = startpos;
      block.appendChild(text$2(']'));
      return true;
    }
  };

  var addBracket = function addBracket(node, index, image) {
    if (this.brackets !== null) {
      this.brackets.bracketAfter = true;
    }

    this.brackets = {
      node: node,
      previous: this.brackets,
      previousDelimiter: this.delimiters,
      index: index,
      image: image,
      active: true
    };
  };

  var removeBracket = function removeBracket() {
    this.brackets = this.brackets.previous;
  }; // Attempt to parse an entity.


  var parseEntity = function parseEntity(block) {
    var m;

    if (m = this.match(reEntityHere)) {
      block.appendChild(text$2(decodeHTML$2(m)));
      return true;
    } else {
      return false;
    }
  }; // Parse a run of ordinary characters, or a single character with
  // a special meaning in markdown, as a plain string.


  var parseString = function parseString(block) {
    var m;

    if (m = this.match(reMain)) {
      if (this.options.smart) {
        block.appendChild(text$2(m.replace(reEllipses, "\u2026").replace(reDash, function (chars) {
          var enCount = 0;
          var emCount = 0;

          if (chars.length % 3 === 0) {
            // If divisible by 3, use all em dashes
            emCount = chars.length / 3;
          } else if (chars.length % 2 === 0) {
            // If divisible by 2, use all en dashes
            enCount = chars.length / 2;
          } else if (chars.length % 3 === 2) {
            // If 2 extra dashes, use en dash for last 2; em dashes for rest
            enCount = 1;
            emCount = (chars.length - 2) / 3;
          } else {
            // Use en dashes for last 4 hyphens; em dashes for rest
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
  }; // Parse a newline.  If it was preceded by two spaces, return a hard
  // line break; otherwise a soft line break.


  var parseNewline = function parseNewline(block) {
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
  }; // Attempt to parse a link reference, modifying refmap.


  var parseReference = function parseReference(s, refmap) {
    this.subject = s;
    this.pos = 0;
    var rawlabel;
    var dest;
    var title;
    var matchChars;
    var startpos = this.pos; // label:

    matchChars = this.parseLinkLabel();

    if (matchChars === 0) {
      return 0;
    } else {
      rawlabel = this.subject.substr(0, matchChars);
    } // colon:


    if (this.peek() === C_COLON) {
      this.pos++;
    } else {
      this.pos = startpos;
      return 0;
    } //  link url


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
      title = ''; // rewind before spaces

      this.pos = beforetitle;
    } // make sure we're at line end:


    var atLineEnd = true;

    if (this.match(reSpaceAtEndOfLine) === null) {
      if (title === '') {
        atLineEnd = false;
      } else {
        // the potential title we found is not at the line end,
        // but it could still be a legal link reference if we
        // discard the title
        title = ''; // rewind before spaces

        this.pos = beforetitle; // and instead check if the link URL is at the line end

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
      refmap[normlabel] = {
        destination: dest,
        title: title
      };
    }

    return this.pos - startpos;
  }; // Parse the next inline element in subject, advancing subject position.
  // On success, add the result to block's children and return true.
  // On failure, return false.


  var parseInline = function parseInline(block) {
    var res = false;
    var c = this.peek();

    if (c === -1) {
      return false;
    }

    switch (c) {
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
  }; // Parse string content in block into inline children,
  // using refmap to resolve references.


  var parseInlines = function parseInlines(block) {
    this.subject = block._string_content.trim();
    this.pos = 0;
    this.delimiters = null;
    this.brackets = null;

    while (this.parseInline(block)) {}

    block._string_content = null; // allow raw string to be garbage collected

    this.processEmphasis(null);
  }; // The InlineParser object.


  function InlineParser(options) {
    return {
      subject: '',
      delimiters: null,
      // used by handleDelim method
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
  var reHtmlBlockOpen = [/./, // dummy for 0
  /^<(?:script|pre|style)(?:\s|>|$)/i, /^<!--/, /^<[?]/, /^<![A-Z]/, /^<!\[CDATA\[/, /^<[/]?(?:address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[123456]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|nav|noframes|ol|optgroup|option|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul)(?:\s|[/]?[>]|$)/i, new RegExp('^(?:' + OPENTAG$1 + '|' + CLOSETAG$1 + ')\\s*$', 'i')];
  var reHtmlBlockClose = [/./, // dummy for 0
  /<\/(?:script|pre|style)>/i, /-->/, /\?>/, />/, /\]\]>/];
  var reThematicBreak = /^(?:(?:\*[ \t]*){3,}|(?:_[ \t]*){3,}|(?:-[ \t]*){3,})[ \t]*$/;
  var reMaybeSpecial = /^[#`~*+_=<>0-9-]/;
  var reNonSpace = /[^ \t\f\v\r\n]/;
  var reBulletListMarker = /^[*+-]/;
  var reOrderedListMarker = /^(\d{1,9})([.)])/;
  var reATXHeadingMarker = /^#{1,6}(?:[ \t]+|$)/;
  var reCodeFence = /^`{3,}(?!.*`)|^~{3,}/;
  var reClosingCodeFence = /^(?:`{3,}|~{3,})(?= *$)/;
  var reSetextHeadingLine = /^(?:=+|-+)[ \t]*$/;
  var reLineEnding = /\r\n|\n|\r/; // Returns true if string contains only space characters.

  var isBlank = function isBlank(s) {
    return !reNonSpace.test(s);
  };

  var isSpaceOrTab = function isSpaceOrTab(c) {
    return c === C_SPACE || c === C_TAB;
  };

  var peek$1 = function peek$1(ln, pos) {
    if (pos < ln.length) {
      return ln.charCodeAt(pos);
    } else {
      return -1;
    }
  }; // DOC PARSER
  // These are methods of a Parser object, defined below.
  // Returns true if block ends with a blank line, descending if needed
  // into lists and sublists.


  var endsWithBlankLine = function endsWithBlankLine(block) {
    while (block) {
      if (block._lastLineBlank) {
        return true;
      }

      var t = block.type;

      if (!block._lastLineChecked && (t === 'list' || t === 'item')) {
        block._lastLineChecked = true;
        block = block._lastChild;
      } else {
        block._lastLineChecked = true;
        break;
      }
    }

    return false;
  }; // Add a line to the block at the tip.  We assume the tip
  // can accept lines -- that check should be done before calling this.


  var addLine = function addLine() {
    if (this.partiallyConsumedTab) {
      this.offset += 1; // skip over tab
      // add space characters:

      var charsToTab = 4 - this.column % 4;
      this.tip._string_content += ' '.repeat(charsToTab);
    }

    this.tip._string_content += this.currentLine.slice(this.offset) + '\n';
  }; // Add block of type tag as a child of the tip.  If the tip can't
  // accept children, close and finalize it and try its parent,
  // and so on til we find a block that can accept children.


  var addChild = function addChild(tag, offset) {
    while (!this.blocks[this.tip.type].canContain(tag)) {
      this.finalize(this.tip, this.lineNumber - 1);
    }

    var column_number = offset + 1; // offset 0 = column 1

    var newBlock = new node(tag, [[this.lineNumber, column_number], [0, 0]]);
    newBlock._string_content = '';
    this.tip.appendChild(newBlock);
    this.tip = newBlock;
    return newBlock;
  }; // Parse a list marker and return data on the marker (type,
  // start, delimiter, bullet character, padding) or null.


  var parseListMarker = function parseListMarker(parser, container) {
    var rest = parser.currentLine.slice(parser.nextNonspace);
    var match;
    var nextc;
    var spacesStartCol;
    var spacesStartOffset;
    var data = {
      type: null,
      tight: true,
      // lists are tight by default
      bulletChar: null,
      start: null,
      delimiter: null,
      padding: null,
      markerOffset: parser.indent
    };

    if (parser.indent >= 4) {
      return null;
    }

    if (match = rest.match(reBulletListMarker)) {
      data.type = 'bullet';
      data.bulletChar = match[0][0];
    } else if ((match = rest.match(reOrderedListMarker)) && (container.type !== 'paragraph' || match[1] === '1')) {
      data.type = 'ordered';
      data.start = parseInt(match[1]);
      data.delimiter = match[2];
    } else {
      return null;
    } // make sure we have spaces after


    nextc = peek$1(parser.currentLine, parser.nextNonspace + match[0].length);

    if (!(nextc === -1 || nextc === C_TAB || nextc === C_SPACE)) {
      return null;
    } // if it interrupts paragraph, make sure first line isn't blank


    if (container.type === 'paragraph' && !parser.currentLine.slice(parser.nextNonspace + match[0].length).match(reNonSpace)) {
      return null;
    } // we've got a match! advance offset and calculate padding


    parser.advanceNextNonspace(); // to start of marker

    parser.advanceOffset(match[0].length, true); // to end of marker

    spacesStartCol = parser.column;
    spacesStartOffset = parser.offset;

    do {
      parser.advanceOffset(1, true);
      nextc = peek$1(parser.currentLine, parser.offset);
    } while (parser.column - spacesStartCol < 5 && isSpaceOrTab(nextc));

    var blank_item = peek$1(parser.currentLine, parser.offset) === -1;
    var spaces_after_marker = parser.column - spacesStartCol;

    if (spaces_after_marker >= 5 || spaces_after_marker < 1 || blank_item) {
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
  }; // Returns true if the two list items are of the same type,
  // with the same delimiter and bullet character.  This is used
  // in agglomerating list items into lists.


  var listsMatch = function listsMatch(list_data, item_data) {
    return list_data.type === item_data.type && list_data.delimiter === item_data.delimiter && list_data.bulletChar === item_data.bulletChar;
  }; // Finalize and close any unmatched blocks.


  var closeUnmatchedBlocks = function closeUnmatchedBlocks() {
    if (!this.allClosed) {
      // finalize any blocks not matched
      while (this.oldtip !== this.lastMatchedContainer) {
        var parent = this.oldtip._parent;
        this.finalize(this.oldtip, this.lineNumber - 1);
        this.oldtip = parent;
      }

      this.allClosed = true;
    }
  }; // 'finalize' is run when the block is closed.
  // 'continue' is run to check whether the block is continuing
  // at a certain line and offset (e.g. whether a block quote
  // contains a `>`.  It returns 0 for matched, 1 for not matched,
  // and 2 for "we've dealt with this line completely, go to next."


  var blocks = {
    document: {
      "continue": function _continue() {
        return 0;
      },
      finalize: function finalize() {
        return;
      },
      canContain: function canContain(t) {
        return t !== 'item';
      },
      acceptsLines: false
    },
    list: {
      "continue": function _continue() {
        return 0;
      },
      finalize: function finalize(parser, block) {
        var item = block._firstChild;

        while (item) {
          // check for non-final list item ending with blank line:
          if (endsWithBlankLine(item) && item._next) {
            block._listData.tight = false;
            break;
          } // recurse into children of list item, to see if there are
          // spaces between any of them:


          var subitem = item._firstChild;

          while (subitem) {
            if (endsWithBlankLine(subitem) && (item._next || subitem._next)) {
              block._listData.tight = false;
              break;
            }

            subitem = subitem._next;
          }

          item = item._next;
        }
      },
      canContain: function canContain(t) {
        return t === 'item';
      },
      acceptsLines: false
    },
    block_quote: {
      "continue": function _continue(parser) {
        var ln = parser.currentLine;

        if (!parser.indented && peek$1(ln, parser.nextNonspace) === C_GREATERTHAN) {
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
      finalize: function finalize() {
        return;
      },
      canContain: function canContain(t) {
        return t !== 'item';
      },
      acceptsLines: false
    },
    item: {
      "continue": function _continue(parser, container) {
        if (parser.blank) {
          if (container._firstChild == null) {
            // Blank line after empty list item
            return 1;
          } else {
            parser.advanceNextNonspace();
          }
        } else if (parser.indent >= container._listData.markerOffset + container._listData.padding) {
          parser.advanceOffset(container._listData.markerOffset + container._listData.padding, true);
        } else {
          return 1;
        }

        return 0;
      },
      finalize: function finalize() {
        return;
      },
      canContain: function canContain(t) {
        return t !== 'item';
      },
      acceptsLines: false
    },
    heading: {
      "continue": function _continue() {
        // a heading can never container > 1 line, so fail to match:
        return 1;
      },
      finalize: function finalize() {
        return;
      },
      canContain: function canContain() {
        return false;
      },
      acceptsLines: false
    },
    thematic_break: {
      "continue": function _continue() {
        // a thematic break can never container > 1 line, so fail to match:
        return 1;
      },
      finalize: function finalize() {
        return;
      },
      canContain: function canContain() {
        return false;
      },
      acceptsLines: false
    },
    code_block: {
      "continue": function _continue(parser, container) {
        var ln = parser.currentLine;
        var indent = parser.indent;

        if (container._isFenced) {
          // fenced
          var match = indent <= 3 && ln.charAt(parser.nextNonspace) === container._fenceChar && ln.slice(parser.nextNonspace).match(reClosingCodeFence);

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
        } else {
          // indented
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
      finalize: function finalize(parser, block) {
        if (block._isFenced) {
          // fenced
          // first line becomes info string
          var content = block._string_content;
          var newlinePos = content.indexOf('\n');
          var firstLine = content.slice(0, newlinePos);
          var rest = content.slice(newlinePos + 1);
          block.info = unescapeString$2(firstLine.trim());
          block._literal = rest;
        } else {
          // indented
          block._literal = block._string_content.replace(/(\n *)+$/, '\n');
        }

        block._string_content = null; // allow GC
      },
      canContain: function canContain() {
        return false;
      },
      acceptsLines: true
    },
    html_block: {
      "continue": function _continue(parser, container) {
        return parser.blank && (container._htmlBlockType === 6 || container._htmlBlockType === 7) ? 1 : 0;
      },
      finalize: function finalize(parser, block) {
        block._literal = block._string_content.replace(/(\n *)+$/, '');
        block._string_content = null; // allow GC
      },
      canContain: function canContain() {
        return false;
      },
      acceptsLines: true
    },
    paragraph: {
      "continue": function _continue(parser) {
        return parser.blank ? 1 : 0;
      },
      finalize: function finalize(parser, block) {
        var pos;
        var hasReferenceDefs = false; // try parsing the beginning as link reference definitions:

        while (peek$1(block._string_content, 0) === C_OPEN_BRACKET$1 && (pos = parser.inlineParser.parseReference(block._string_content, parser.refmap))) {
          block._string_content = block._string_content.slice(pos);
          hasReferenceDefs = true;
        }

        if (hasReferenceDefs && isBlank(block._string_content)) {
          block.unlink();
        }
      },
      canContain: function canContain() {
        return false;
      },
      acceptsLines: true
    }
  }; // block start functions.  Return values:
  // 0 = no match
  // 1 = matched container, keep going
  // 2 = matched leaf, no more block starts

  var blockStarts = [// block quote
  function (parser) {
    if (!parser.indented && peek$1(parser.currentLine, parser.nextNonspace) === C_GREATERTHAN) {
      parser.advanceNextNonspace();
      parser.advanceOffset(1, false); // optional following space

      if (isSpaceOrTab(peek$1(parser.currentLine, parser.offset))) {
        parser.advanceOffset(1, true);
      }

      parser.closeUnmatchedBlocks();
      parser.addChild('block_quote', parser.nextNonspace);
      return 1;
    } else {
      return 0;
    }
  }, // ATX heading
  function (parser) {
    var match;

    if (!parser.indented && (match = parser.currentLine.slice(parser.nextNonspace).match(reATXHeadingMarker))) {
      parser.advanceNextNonspace();
      parser.advanceOffset(match[0].length, false);
      parser.closeUnmatchedBlocks();
      var container = parser.addChild('heading', parser.nextNonspace);
      container.level = match[0].trim().length; // number of #s
      // remove trailing ###s:

      container._string_content = parser.currentLine.slice(parser.offset).replace(/^[ \t]*#+[ \t]*$/, '').replace(/[ \t]+#+[ \t]*$/, '');
      parser.advanceOffset(parser.currentLine.length - parser.offset);
      return 2;
    } else {
      return 0;
    }
  }, // Fenced code block
  function (parser) {
    var match;

    if (!parser.indented && (match = parser.currentLine.slice(parser.nextNonspace).match(reCodeFence))) {
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
  }, // HTML block
  function (parser, container) {
    if (!parser.indented && peek$1(parser.currentLine, parser.nextNonspace) === C_LESSTHAN$1) {
      var s = parser.currentLine.slice(parser.nextNonspace);
      var blockType;

      for (blockType = 1; blockType <= 7; blockType++) {
        if (reHtmlBlockOpen[blockType].test(s) && (blockType < 7 || container.type !== 'paragraph')) {
          parser.closeUnmatchedBlocks(); // We don't adjust parser.offset;
          // spaces are part of the HTML block:

          var b = parser.addChild('html_block', parser.offset);
          b._htmlBlockType = blockType;
          return 2;
        }
      }
    }

    return 0;
  }, // Setext heading
  function (parser, container) {
    var match;

    if (!parser.indented && container.type === 'paragraph' && (match = parser.currentLine.slice(parser.nextNonspace).match(reSetextHeadingLine))) {
      parser.closeUnmatchedBlocks(); // resolve reference link definitiosn

      var pos;

      while (peek$1(container._string_content, 0) === C_OPEN_BRACKET$1 && (pos = parser.inlineParser.parseReference(container._string_content, parser.refmap))) {
        container._string_content = container._string_content.slice(pos);
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
  }, // thematic break
  function (parser) {
    if (!parser.indented && reThematicBreak.test(parser.currentLine.slice(parser.nextNonspace))) {
      parser.closeUnmatchedBlocks();
      parser.addChild('thematic_break', parser.nextNonspace);
      parser.advanceOffset(parser.currentLine.length - parser.offset, false);
      return 2;
    } else {
      return 0;
    }
  }, // list item
  function (parser, container) {
    var data;

    if ((!parser.indented || container.type === 'list') && (data = parseListMarker(parser, container))) {
      parser.closeUnmatchedBlocks(); // add the list if needed

      if (parser.tip.type !== 'list' || !listsMatch(container._listData, data)) {
        container = parser.addChild('list', parser.nextNonspace);
        container._listData = data;
      } // add the list item


      container = parser.addChild('item', parser.nextNonspace);
      container._listData = data;
      return 1;
    } else {
      return 0;
    }
  }, // indented code block
  function (parser) {
    if (parser.indented && parser.tip.type !== 'paragraph' && !parser.blank) {
      // indented code
      parser.advanceOffset(CODE_INDENT, true);
      parser.closeUnmatchedBlocks();
      parser.addChild('code_block', parser.offset);
      return 2;
    } else {
      return 0;
    }
  }];

  var advanceOffset = function advanceOffset(count, columns) {
    var currentLine = this.currentLine;
    var charsToTab, charsToAdvance;
    var c;

    while (count > 0 && (c = currentLine[this.offset])) {
      if (c === '\t') {
        charsToTab = 4 - this.column % 4;

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

  var advanceNextNonspace = function advanceNextNonspace() {
    this.offset = this.nextNonspace;
    this.column = this.nextNonspaceColumn;
    this.partiallyConsumedTab = false;
  };

  var findNextNonspace = function findNextNonspace() {
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
        cols += 4 - cols % 4;
      } else {
        break;
      }
    }

    this.blank = c === '\n' || c === '\r' || c === '';
    this.nextNonspace = i;
    this.nextNonspaceColumn = cols;
    this.indent = this.nextNonspaceColumn - this.column;
    this.indented = this.indent >= CODE_INDENT;
  }; // Analyze a line of text and update the document appropriately.
  // We parse markdown text by calling this on each line of input,
  // then finalizing the document.


  var incorporateLine = function incorporateLine(ln) {
    var all_matched = true;
    var t;
    var container = this.doc;
    this.oldtip = this.tip;
    this.offset = 0;
    this.column = 0;
    this.blank = false;
    this.partiallyConsumedTab = false;
    this.lineNumber += 1; // replace NUL characters for security

    if (ln.indexOf("\0") !== -1) {
      ln = ln.replace(/\0/g, "\uFFFD");
    }

    this.currentLine = ln; // For each containing block, try to parse the associated line start.
    // Bail out on failure: container will point to the last matching block.
    // Set all_matched to false if not all containers match.

    var lastChild;

    while ((lastChild = container._lastChild) && lastChild._open) {
      container = lastChild;
      this.findNextNonspace();

      switch (this.blocks[container.type]["continue"](this, container)) {
        case 0:
          // we've matched, keep going
          break;

        case 1:
          // we've failed to match a block
          all_matched = false;
          break;

        case 2:
          // we've hit end of line for fenced code close and can return
          return;

        default:
          throw 'continue returned illegal value, must be 0, 1, or 2';
      }

      if (!all_matched) {
        container = container._parent; // back up to last matching block

        break;
      }
    }

    this.allClosed = container === this.oldtip;
    this.lastMatchedContainer = container;
    var matchedLeaf = container.type !== 'paragraph' && blocks[container.type].acceptsLines;
    var starts = this.blockStarts;
    var startsLen = starts.length; // Unless last matched container is a code block, try new container starts,
    // adding children to the last matched container:

    while (!matchedLeaf) {
      this.findNextNonspace(); // this is a little performance optimization:

      if (!this.indented && !reMaybeSpecial.test(ln.slice(this.nextNonspace))) {
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

      if (i === startsLen) {
        // nothing matched
        this.advanceNextNonspace();
        break;
      }
    } // What remains at the offset is a text line.  Add the text to the
    // appropriate container.
    // First check for a lazy paragraph continuation:


    if (!this.allClosed && !this.blank && this.tip.type === 'paragraph') {
      // lazy paragraph continuation
      this.addLine();
    } else {
      // not a lazy continuation
      // finalize any blocks not matched
      this.closeUnmatchedBlocks();

      if (this.blank && container.lastChild) {
        container.lastChild._lastLineBlank = true;
      }

      t = container.type; // Block quote lines are never blank as they start with >
      // and we don't count blanks in fenced code for purposes of tight/loose
      // lists or breaking out of lists.  We also don't set _lastLineBlank
      // on an empty list item, or if we just closed a fenced block.

      var lastLineBlank = this.blank && !(t === 'block_quote' || t === 'code_block' && container._isFenced || t === 'item' && !container._firstChild && container.sourcepos[0][0] === this.lineNumber); // propagate lastLineBlank up through parents:

      var cont = container;

      while (cont) {
        cont._lastLineBlank = lastLineBlank;
        cont = cont._parent;
      }

      if (this.blocks[t].acceptsLines) {
        this.addLine(); // if HtmlBlock, check for end condition

        if (t === 'html_block' && container._htmlBlockType >= 1 && container._htmlBlockType <= 5 && reHtmlBlockClose[container._htmlBlockType].test(this.currentLine.slice(this.offset))) {
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
  }; // Finalize a block.  Close it and do any necessary postprocessing,
  // e.g. creating string_content from strings, setting the 'tight'
  // or 'loose' status of a list, and parsing the beginnings
  // of paragraphs for reference definitions.  Reset the tip to the
  // parent of the closed block.


  var finalize = function finalize(block, lineNumber) {
    var above = block._parent;
    block._open = false;
    block.sourcepos[1] = [lineNumber, this.lastLineLength];
    this.blocks[block.type].finalize(this, block);
    this.tip = above;
  }; // Walk through a block & children recursively, parsing string content
  // into inline content where appropriate.


  var processInlines = function processInlines(block) {
    var node, event, t;
    var walker = block.walker();
    this.inlineParser.refmap = this.refmap;
    this.inlineParser.options = this.options;

    while (event = walker.next()) {
      node = event.node;
      t = node.type;

      if (!event.entering && (t === 'paragraph' || t === 'heading')) {
        this.inlineParser.parse(node);
      }
    }
  };

  var Document = function Document() {
    var doc = new node('document', [[1, 1], [0, 0]]);
    return doc;
  }; // The main parsing function.  Returns a parsed document AST.


  var parse = function parse(input) {
    this.doc = new Document();
    this.tip = this.doc;
    this.refmap = {};
    this.lineNumber = 0;
    this.lastLineLength = 0;
    this.offset = 0;
    this.column = 0;
    this.lastMatchedContainer = this.doc;
    this.currentLine = "";

    if (this.options.time) {}

    var lines = input.split(reLineEnding);
    var len = lines.length;

    if (input.charCodeAt(input.length - 1) === C_NEWLINE$1) {
      // ignore last blank line created by final newline
      len -= 1;
    }

    if (this.options.time) {}

    if (this.options.time) {}

    for (var i = 0; i < len; i++) {
      this.incorporateLine(lines[i]);
    }

    while (this.tip) {
      this.finalize(this.tip, len);
    }

    if (this.options.time) {}

    if (this.options.time) {}

    this.processInlines(this.doc);

    if (this.options.time) {}

    return this.doc;
  }; // The Parser object.


  function Parser(options) {
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
    var walker = ast.walker(),
        event,
        type;
    this.buffer = '';
    this.lastOut = '\n';

    while (event = walker.next()) {
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
  Renderer.prototype.cr = cr;
  Renderer.prototype.esc = esc;
  var renderer = Renderer;
  var reUnsafeProtocol = /^javascript:|vbscript:|file:|data:/i;
  var reSafeDataProtocol = /^data:image\/(?:png|gif|jpeg|webp)/i;

  var potentiallyUnsafe = function potentiallyUnsafe(url) {
    return reUnsafeProtocol.test(url) && !reSafeDataProtocol.test(url);
  }; // Helper function to produce an HTML tag.


  function tag(name, attrs, selfclosing) {
    if (this.disableTags > 0) {
      return;
    }

    this.buffer += '<' + name;

    if (attrs && attrs.length > 0) {
      var i = 0;
      var attrib;

      while ((attrib = attrs[i]) !== undefined) {
        this.buffer += ' ' + attrib[0] + '="' + attrib[1] + '"';
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
    options = options || {}; // by default, soft breaks are rendered as newlines in HTML

    options.softbreak = options.softbreak || '\n'; // set to "<br />" to make them hard breaks
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
          this.lit('<img src="' + this.esc(node.destination) + '" alt="');
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
    var grandparent = node.parent.parent,
        attrs = this.attrs(node);

    if (grandparent !== null && grandparent.type === 'list') {
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
    var tagname = 'h' + node.level,
        attrs = this.attrs(node);

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
    var info_words = node.info ? node.info.split(/\s+/) : [],
        attrs = this.attrs(node);

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
    var tagname = node.listType === 'bullet' ? 'ul' : 'ol',
        attrs = this.attrs(node);

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

  function attrs(node) {
    var att = [];

    if (this.options.sourcepos) {
      var pos = node.sourcepos;

      if (pos) {
        att.push(['data-sourcepos', String(pos[0][0]) + ':' + String(pos[0][1]) + '-' + String(pos[1][0]) + ':' + String(pos[1][1])]);
      }
    }

    return att;
  } // quick browser-compatible inheritance


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

    if (options.time) {}

    this.buffer += '<?xml version="1.0" encoding="UTF-8"?>\n';
    this.buffer += '<!DOCTYPE document SYSTEM "CommonMark.dtd">\n';

    while (event = walker.next()) {
      entering = event.entering;
      node = event.node;
      nodetype = node.type;
      container = node.isContainer;
      selfClosing = nodetype === 'thematic_break' || nodetype === 'linebreak' || nodetype === 'softbreak';
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
              attrs.push(['tight', node.listTight ? 'true' : 'false']);
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
            attrs.push(['sourcepos', String(pos[0][0]) + ':' + String(pos[0][1]) + '-' + String(pos[1][0]) + ':' + String(pos[1][1])]);
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

    if (options.time) {}

    this.buffer += '\n';
    return this.buffer;
  }

  function out$2(s) {
    if (this.disableTags > 0) {
      this.buffer += s.replace(reXMLTag, '');
    } else {
      this.buffer += s;
    }

    this.lastOut = s;
  }

  function cr$1() {
    if (this.lastOut !== '\n') {
      this.buffer += '\n';
      this.lastOut = '\n';

      for (var i = this.indentLevel; i > 0; i--) {
        this.buffer += this.indent;
      }
    }
  } // Helper function to produce an XML tag.


  function tag$1(name, attrs, selfclosing) {
    var result = '<' + name;

    if (attrs && attrs.length > 0) {
      var i = 0;
      var attrib;

      while ((attrib = attrs[i]) !== undefined) {
        result += ' ' + attrib[0] + '="' + this.esc(attrib[1]) + '"';
        i++;
      }
    }

    if (selfclosing) {
      result += ' /';
    }

    result += '>';
    return result;
  } // quick browser-compatible inheritance


  XmlRenderer.prototype = Object.create(renderer.prototype);
  XmlRenderer.prototype.render = render$1;
  XmlRenderer.prototype.out = out$2;
  XmlRenderer.prototype.cr = cr$1;
  XmlRenderer.prototype.tag = tag$1;
  XmlRenderer.prototype.esc = common.escapeXml;
  var xml$2 = XmlRenderer; // commonmark.js - CommomMark in JavaScript
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

  function get_each_context$6(ctx, list, i) {
    var child_ctx = ctx.slice();
    child_ctx[14] = list[i];
    return child_ctx;
  }

  function get_each_context_1(ctx, list, i) {
    var child_ctx = ctx.slice();
    child_ctx[19] = list[i];
    return child_ctx;
  } // (62:4) {#if post.title}


  function create_if_block_3$2(ctx) {
    var h2;
    var t_value =
    /*post*/
    ctx[1].title + "";
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
        if (dirty &
        /*post*/
        2 && t_value !== (t_value =
        /*post*/
        ctx[1].title + "")) set_data(t, t_value);
      },
      d: function d(detaching) {
        if (detaching) detach(h2);
      }
    };
  } // (65:4) {#if post.description}


  function create_if_block_2$2(ctx) {
    var p0;
    var t_value =
    /*post*/
    ctx[1].description + "";
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
        if (dirty &
        /*post*/
        2 && t_value !== (t_value =
        /*post*/
        ctx[1].description + "")) set_data(t, t_value);
      },
      d: function d(detaching) {
        if (detaching) detach(p0);
        if (detaching) detach(p1);
      }
    };
  } // (70:4) {:else}


  function create_else_block_1$2(ctx) {
    var each_1_anchor;
    var each_value_1 = splitLines(
    /*post*/
    ctx[1].body);
    var each_blocks = [];

    for (var i = 0; i < each_value_1.length; i += 1) {
      each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    }

    return {
      c: function c() {
        for (var _i31 = 0; _i31 < each_blocks.length; _i31 += 1) {
          each_blocks[_i31].c();
        }

        each_1_anchor = empty();
      },
      m: function m(target, anchor) {
        for (var _i32 = 0; _i32 < each_blocks.length; _i32 += 1) {
          each_blocks[_i32].m(target, anchor);
        }

        insert(target, each_1_anchor, anchor);
      },
      p: function p(ctx, dirty) {
        if (dirty &
        /*splitLines, post*/
        2) {
          each_value_1 = splitLines(
          /*post*/
          ctx[1].body);

          var _i33;

          for (_i33 = 0; _i33 < each_value_1.length; _i33 += 1) {
            var child_ctx = get_each_context_1(ctx, each_value_1, _i33);

            if (each_blocks[_i33]) {
              each_blocks[_i33].p(child_ctx, dirty);
            } else {
              each_blocks[_i33] = create_each_block_1(child_ctx);

              each_blocks[_i33].c();

              each_blocks[_i33].m(each_1_anchor.parentNode, each_1_anchor);
            }
          }

          for (; _i33 < each_blocks.length; _i33 += 1) {
            each_blocks[_i33].d(1);
          }

          each_blocks.length = each_value_1.length;
        }
      },
      d: function d(detaching) {
        destroy_each(each_blocks, detaching);
        if (detaching) detach(each_1_anchor);
      }
    };
  } // (68:4) {#if post.format === 1}


  function create_if_block_1$7(ctx) {
    var html_tag;
    var raw_value =
    /*renderMarkdown*/
    ctx[6](
    /*post*/
    ctx[1].body) + "";
    return {
      c: function c() {
        html_tag = new HtmlTag(raw_value, null);
      },
      m: function m(target, anchor) {
        html_tag.m(target, anchor);
      },
      p: function p(ctx, dirty) {
        if (dirty &
        /*post*/
        2 && raw_value !== (raw_value =
        /*renderMarkdown*/
        ctx[6](
        /*post*/
        ctx[1].body) + "")) html_tag.p(raw_value);
      },
      d: function d(detaching) {
        if (detaching) html_tag.d();
      }
    };
  } // (71:8) {#each splitLines(post.body) as line}


  function create_each_block_1(ctx) {
    var p;
    var t_value =
    /*line*/
    ctx[19] + "";
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
        if (dirty &
        /*post*/
        2 && t_value !== (t_value =
        /*line*/
        ctx[19] + "")) set_data(t, t_value);
      },
      d: function d(detaching) {
        if (detaching) detach(p);
      }
    };
  } // (83:4) {:catch err}


  function create_catch_block$7(ctx) {
    var p;
    var t0;
    var t1_value =
    /*err*/
    ctx[18].message + "";
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
        if (dirty &
        /*replyResponse*/
        8 && t1_value !== (t1_value =
        /*err*/
        ctx[18].message + "")) set_data(t1, t1_value);
      },
      d: function d(detaching) {
        if (detaching) detach(p);
      }
    };
  } // (77:4) {:then _}


  function create_then_block$7(ctx) {
    var if_block_anchor;

    function select_block_type_1(ctx, dirty) {
      if (
      /*replyId*/
      ctx[0] ===
      /*post*/
      ctx[1].id) return create_if_block$9;
      return create_else_block$5;
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
        if (detaching) detach(if_block_anchor);
      }
    };
  } // (80:4) {:else}


  function create_else_block$5(ctx) {
    var button;
    var dispose;
    return {
      c: function c() {
        button = element("button");
        button.textContent = "Reply";
      },
      m: function m(target, anchor, remount) {
        insert(target, button, anchor);
        if (remount) dispose();
        dispose = listen(button, "click",
        /*replyBegin*/
        ctx[4]);
      },
      p: noop$1,
      d: function d(detaching) {
        if (detaching) detach(button);
        dispose();
      }
    };
  } // (78:4) {#if replyId === post.id}


  function create_if_block$9(ctx) {
    var textarea;
    var dispose;
    return {
      c: function c() {
        textarea = element("textarea");
      },
      m: function m(target, anchor, remount) {
        insert(target, textarea, anchor);
        set_input_value(textarea,
        /*replyValue*/
        ctx[2]);
        if (remount) run_all(dispose);
        dispose = [listen(textarea, "input",
        /*textarea_input_handler*/
        ctx[11]), listen(textarea, "keydown",
        /*keyHandler*/
        ctx[5])];
      },
      p: function p(ctx, dirty) {
        if (dirty &
        /*replyValue*/
        4) {
          set_input_value(textarea,
          /*replyValue*/
          ctx[2]);
        }
      },
      d: function d(detaching) {
        if (detaching) detach(textarea);
        run_all(dispose);
      }
    };
  } // (75:26)      <p>...</p>     {:then _}


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
        if (detaching) detach(p);
      }
    };
  } // (86:4) {#each post.replies as reply}


  function create_each_block$6(ctx) {
    var updating_replyId;
    var current;

    function postthread_replyId_binding(value) {
      /*postthread_replyId_binding*/
      ctx[12].call(null, value);
    }

    var postthread_props = {
      post:
      /*reply*/
      ctx[14]
    };

    if (
    /*replyId*/
    ctx[0] !== void 0) {
      postthread_props.replyId =
      /*replyId*/
      ctx[0];
    }

    var postthread = new PostThread({
      props: postthread_props
    });
    binding_callbacks.push(function () {
      return bind$1(postthread, "replyId", postthread_replyId_binding);
    });
    postthread.$on("reply",
    /*reply_handler*/
    ctx[13]);
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
        if (dirty &
        /*post*/
        2) postthread_changes.post =
        /*reply*/
        ctx[14];

        if (!updating_replyId && dirty &
        /*replyId*/
        1) {
          updating_replyId = true;
          postthread_changes.replyId =
          /*replyId*/
          ctx[0];
          add_flush_callback(function () {
            return updating_replyId = false;
          });
        }

        postthread.$set(postthread_changes);
      },
      i: function i(local) {
        if (current) return;
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

  function create_fragment$m(ctx) {
    var div;
    var t0;
    var t1;
    var t2;
    var promise;
    var t3;
    var current;
    var if_block0 =
    /*post*/
    ctx[1].title && create_if_block_3$2(ctx);
    var if_block1 =
    /*post*/
    ctx[1].description && create_if_block_2$2(ctx);

    function select_block_type(ctx, dirty) {
      if (
      /*post*/
      ctx[1].format === 1) return create_if_block_1$7;
      return create_else_block_1$2;
    }

    var current_block_type = select_block_type(ctx);
    var if_block2 = current_block_type(ctx);
    var info = {
      ctx: ctx,
      current: null,
      token: null,
      pending: create_pending_block$7,
      then: create_then_block$7,
      "catch": create_catch_block$7,
      value: 17,
      error: 18
    };
    handle_promise(promise =
    /*replyResponse*/
    ctx[3], info);
    var each_value =
    /*post*/
    ctx[1].replies;
    var each_blocks = [];

    for (var i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    }

    var out = function out(i) {
      return transition_out(each_blocks[i], 1, 1, function () {
        each_blocks[i] = null;
      });
    };

    return {
      c: function c() {
        div = element("div");
        if (if_block0) if_block0.c();
        t0 = space();
        if (if_block1) if_block1.c();
        t1 = space();
        if_block2.c();
        t2 = space();
        info.block.c();
        t3 = space();

        for (var _i34 = 0; _i34 < each_blocks.length; _i34 += 1) {
          each_blocks[_i34].c();
        }

        attr(div, "class", "post");
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
        if (if_block0) if_block0.m(div, null);
        append(div, t0);
        if (if_block1) if_block1.m(div, null);
        append(div, t1);
        if_block2.m(div, null);
        append(div, t2);
        info.block.m(div, info.anchor = null);

        info.mount = function () {
          return div;
        };

        info.anchor = t3;
        append(div, t3);

        for (var _i35 = 0; _i35 < each_blocks.length; _i35 += 1) {
          each_blocks[_i35].m(div, null);
        }

        current = true;
      },
      p: function p(new_ctx, _ref54) {
        var _ref55 = _slicedToArray(_ref54, 1),
            dirty = _ref55[0];

        ctx = new_ctx;

        if (
        /*post*/
        ctx[1].title) {
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

        if (
        /*post*/
        ctx[1].description) {
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
        if (dirty &
        /*replyResponse*/
        8 && promise !== (promise =
        /*replyResponse*/
        ctx[3]) && handle_promise(promise, info)) ;else {
          var child_ctx = ctx.slice();
          child_ctx[17] = info.resolved;
          info.block.p(child_ctx, dirty);
        }

        if (dirty &
        /*post, replyId*/
        3) {
          each_value =
          /*post*/
          ctx[1].replies;

          var _i36;

          for (_i36 = 0; _i36 < each_value.length; _i36 += 1) {
            var _child_ctx = get_each_context$6(ctx, each_value, _i36);

            if (each_blocks[_i36]) {
              each_blocks[_i36].p(_child_ctx, dirty);

              transition_in(each_blocks[_i36], 1);
            } else {
              each_blocks[_i36] = create_each_block$6(_child_ctx);

              each_blocks[_i36].c();

              transition_in(each_blocks[_i36], 1);

              each_blocks[_i36].m(div, null);
            }
          }

          group_outros();

          for (_i36 = each_value.length; _i36 < each_blocks.length; _i36 += 1) {
            out(_i36);
          }

          check_outros();
        }
      },
      i: function i(local) {
        if (current) return;

        for (var _i37 = 0; _i37 < each_value.length; _i37 += 1) {
          transition_in(each_blocks[_i37]);
        }

        current = true;
      },
      o: function o(local) {
        each_blocks = each_blocks.filter(Boolean);

        for (var _i38 = 0; _i38 < each_blocks.length; _i38 += 1) {
          transition_out(each_blocks[_i38]);
        }

        current = false;
      },
      d: function d(detaching) {
        if (detaching) detach(div);
        if (if_block0) if_block0.d();
        if (if_block1) if_block1.d();
        if_block2.d();
        info.block.d();
        info.token = null;
        info = null;
        destroy_each(each_blocks, detaching);
      }
    };
  }

  var uri = "/api/v1";

  function splitLines(body) {
    return body.split(/\n+/);
  }

  function instance$m($$self, $$props, $$invalidate) {
    var post = $$props.post;
    var dispatch = createEventDispatcher();
    var replyId = $$props.replyId;
    var reader = new lib.Parser({
      smart: true
    });
    var writer = new lib.HtmlRenderer({
      safe: true
    });
    var replyValue;
    var replyResponse = Promise.resolve(true);

    function replySubmit() {
      if (replyValue && replyValue.length) {
        $$invalidate(3, replyResponse = fetch("".concat(uri, "/posts/").concat(post.id, "/replies"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "same-origin",
          body: JSON.stringify({
            body: replyValue
          })
        }).then(function (res) {
          return res.json();
        }).then(function (res) {
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
      if ("post" in $$props) $$invalidate(1, post = $$props.post);
      if ("replyId" in $$props) $$invalidate(0, replyId = $$props.replyId);
    };

    return [replyId, post, replyValue, replyResponse, replyBegin, keyHandler, renderMarkdown, dispatch, reader, writer, replySubmit, textarea_input_handler, postthread_replyId_binding, reply_handler];
  }

  var PostThread = /*#__PURE__*/function (_SvelteComponent21) {
    _inherits(PostThread, _SvelteComponent21);

    var _super24 = _createSuper(PostThread);

    function PostThread(options) {
      var _this25;

      _classCallCheck(this, PostThread);

      _this25 = _super24.call(this);
      init(_assertThisInitialized(_this25), options, instance$m, create_fragment$m, safe_not_equal, {
        post: 1,
        replyId: 0
      });
      return _this25;
    }

    return PostThread;
  }(SvelteComponent);
  /* src/Board.html generated by Svelte v3.20.1 */


  function get_each_context$7(ctx, list, i) {
    var child_ctx = ctx.slice();
    child_ctx[9] = list[i];
    return child_ctx;
  } // (41:0) {:catch err}


  function create_catch_block$8(ctx) {
    var p;
    var t0;
    var t1_value =
    /*err*/
    ctx[8].message + "";
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
        if (dirty &
        /*postsRequest*/
        2 && t1_value !== (t1_value =
        /*err*/
        ctx[8].message + "")) set_data(t1, t1_value);
      },
      i: noop$1,
      o: noop$1,
      d: function d(detaching) {
        if (detaching) detach(p);
      }
    };
  } // (31:0) {:then posts}


  function create_then_block$8(ctx) {
    var current_block_type_index;
    var if_block;
    var if_block_anchor;
    var current;
    var if_block_creators = [create_if_block$a, create_else_block$6];
    var if_blocks = [];

    function select_block_type(ctx, dirty) {
      if (
      /*postId*/
      ctx[0]) return 0;
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
        if (current) return;
        transition_in(if_block);
        current = true;
      },
      o: function o(local) {
        transition_out(if_block);
        current = false;
      },
      d: function d(detaching) {
        if_blocks[current_block_type_index].d(detaching);
        if (detaching) detach(if_block_anchor);
      }
    };
  } // (34:0) {:else}


  function create_else_block$6(ctx) {
    var ul;
    var each_value =
    /*posts*/
    ctx[7];
    var each_blocks = [];

    for (var i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block$7(get_each_context$7(ctx, each_value, i));
    }

    return {
      c: function c() {
        ul = element("ul");

        for (var _i39 = 0; _i39 < each_blocks.length; _i39 += 1) {
          each_blocks[_i39].c();
        }
      },
      m: function m(target, anchor) {
        insert(target, ul, anchor);

        for (var _i40 = 0; _i40 < each_blocks.length; _i40 += 1) {
          each_blocks[_i40].m(ul, null);
        }
      },
      p: function p(ctx, dirty) {
        if (dirty &
        /*selectPost, postsRequest*/
        10) {
          each_value =
          /*posts*/
          ctx[7];

          var _i41;

          for (_i41 = 0; _i41 < each_value.length; _i41 += 1) {
            var child_ctx = get_each_context$7(ctx, each_value, _i41);

            if (each_blocks[_i41]) {
              each_blocks[_i41].p(child_ctx, dirty);
            } else {
              each_blocks[_i41] = create_each_block$7(child_ctx);

              each_blocks[_i41].c();

              each_blocks[_i41].m(ul, null);
            }
          }

          for (; _i41 < each_blocks.length; _i41 += 1) {
            each_blocks[_i41].d(1);
          }

          each_blocks.length = each_value.length;
        }
      },
      i: noop$1,
      o: noop$1,
      d: function d(detaching) {
        if (detaching) detach(ul);
        destroy_each(each_blocks, detaching);
      }
    };
  } // (32:0) {#if postId}


  function create_if_block$a(ctx) {
    var updating_replyId;
    var current;

    function postthread_replyId_binding(value) {
      /*postthread_replyId_binding*/
      ctx[5].call(null, value);
    }

    var postthread_props = {
      post:
      /*posts*/
      ctx[7]
    };

    if (
    /*replyId*/
    ctx[2] !== void 0) {
      postthread_props.replyId =
      /*replyId*/
      ctx[2];
    }

    var postthread = new PostThread({
      props: postthread_props
    });
    binding_callbacks.push(function () {
      return bind$1(postthread, "replyId", postthread_replyId_binding);
    });
    postthread.$on("reply",
    /*refreshThread*/
    ctx[4]);
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
        if (dirty &
        /*postsRequest*/
        2) postthread_changes.post =
        /*posts*/
        ctx[7];

        if (!updating_replyId && dirty &
        /*replyId*/
        4) {
          updating_replyId = true;
          postthread_changes.replyId =
          /*replyId*/
          ctx[2];
          add_flush_callback(function () {
            return updating_replyId = false;
          });
        }

        postthread.$set(postthread_changes);
      },
      i: function i(local) {
        if (current) return;
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
  } // (36:4) {#each posts as post}


  function create_each_block$7(ctx) {
    var li;
    var t0_value =
    /*post*/
    ctx[9].title + "";
    var t0;
    var t1;
    var t2_value =
    /*post*/
    ctx[9].created + "";
    var t2;
    var dispose;

    function click_handler() {
      var _ctx6;

      for (var _len6 = arguments.length, args = new Array(_len6), _key9 = 0; _key9 < _len6; _key9++) {
        args[_key9] = arguments[_key9];
      }

      return (
        /*click_handler*/
        (_ctx6 = ctx)[6].apply(_ctx6, [
        /*post*/
        ctx[9]].concat(args))
      );
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
        if (remount) dispose();
        dispose = listen(li, "click", click_handler);
      },
      p: function p(new_ctx, dirty) {
        ctx = new_ctx;
        if (dirty &
        /*postsRequest*/
        2 && t0_value !== (t0_value =
        /*post*/
        ctx[9].title + "")) set_data(t0, t0_value);
        if (dirty &
        /*postsRequest*/
        2 && t2_value !== (t2_value =
        /*post*/
        ctx[9].created + "")) set_data(t2, t2_value);
      },
      d: function d(detaching) {
        if (detaching) detach(li);
        dispose();
      }
    };
  } // (29:21)  <p>...</p> {:then posts}


  function create_pending_block$8(ctx) {
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
        if (detaching) detach(p);
      }
    };
  }

  function create_fragment$n(ctx) {
    var await_block_anchor;
    var promise;
    var current;
    var info = {
      ctx: ctx,
      current: null,
      token: null,
      pending: create_pending_block$8,
      then: create_then_block$8,
      "catch": create_catch_block$8,
      value: 7,
      error: 8,
      blocks: [,,,]
    };
    handle_promise(promise =
    /*postsRequest*/
    ctx[1], info);
    return {
      c: function c() {
        await_block_anchor = empty();
        info.block.c();
      },
      m: function m(target, anchor) {
        insert(target, await_block_anchor, anchor);
        info.block.m(target, info.anchor = anchor);

        info.mount = function () {
          return await_block_anchor.parentNode;
        };

        info.anchor = await_block_anchor;
        current = true;
      },
      p: function p(new_ctx, _ref56) {
        var _ref57 = _slicedToArray(_ref56, 1),
            dirty = _ref57[0];

        ctx = new_ctx;
        info.ctx = ctx;
        if (dirty &
        /*postsRequest*/
        2 && promise !== (promise =
        /*postsRequest*/
        ctx[1]) && handle_promise(promise, info)) ;else {
          var child_ctx = ctx.slice();
          child_ctx[7] = info.resolved;
          info.block.p(child_ctx, dirty);
        }
      },
      i: function i(local) {
        if (current) return;
        transition_in(info.block);
        current = true;
      },
      o: function o(local) {
        for (var i = 0; i < 3; i += 1) {
          var _block8 = info.blocks[i];
          transition_out(_block8);
        }

        current = false;
      },
      d: function d(detaching) {
        if (detaching) detach(await_block_anchor);
        info.block.d(detaching);
        info.token = null;
        info = null;
      }
    };
  }

  var uri$1 = "/api/v1";

  function instance$n($$self, $$props, $$invalidate) {
    var postId = $$props.postId;
    var postsRequest = new Promise(function () {}); // sync posts to only allow one reply at a time.

    var replyId;

    function selectPost(id) {
      $$invalidate(0, postId = id);
    }

    function refreshThread() {
      $$invalidate(1, postsRequest = fetch("".concat(uri$1, "/posts/").concat(postId, "/thread")).then(function (res) {
        return res.json();
      }));
    }

    function postthread_replyId_binding(value) {
      replyId = value;
      $$invalidate(2, replyId);
    }

    var click_handler = function click_handler(post) {
      return selectPost(post.id);
    };

    $$self.$set = function ($$props) {
      if ("postId" in $$props) $$invalidate(0, postId = $$props.postId);
    };

    $$self.$$.update = function () {
      if ($$self.$$.dirty &
      /*postId*/
      1) {
        if (postId) {
          $$invalidate(1, postsRequest = fetch("".concat(uri$1, "/posts/").concat(postId, "/thread")).then(function (res) {
            return res.json();
          }));
        } else {
          $$invalidate(1, postsRequest = fetch("".concat(uri$1, "/posts")).then(function (res) {
            return res.json();
          }));
        }
      }
    };

    return [postId, postsRequest, replyId, selectPost, refreshThread, postthread_replyId_binding, click_handler];
  }

  var Board = /*#__PURE__*/function (_SvelteComponent22) {
    _inherits(Board, _SvelteComponent22);

    var _super25 = _createSuper(Board);

    function Board(options) {
      var _this26;

      _classCallCheck(this, Board);

      _this26 = _super25.call(this);
      init(_assertThisInitialized(_this26), options, instance$n, create_fragment$n, safe_not_equal, {
        postId: 0
      });
      return _this26;
    }

    return Board;
  }(SvelteComponent);
  /* src/PostMarkdown.html generated by Svelte v3.20.1 */


  function create_fragment$o(ctx) {
    var div1;
    var textarea;
    var t;
    var div0;
    var dispose;
    return {
      c: function c() {
        div1 = element("div");
        textarea = element("textarea");
        t = space();
        div0 = element("div");
        attr(textarea, "id",
        /*id*/
        ctx[1]);
        attr(textarea, "class", "svelte-ybt4qm");
        attr(div0, "class", "preview svelte-ybt4qm");
        attr(div1, "class", "editor svelte-ybt4qm");
      },
      m: function m(target, anchor, remount) {
        insert(target, div1, anchor);
        append(div1, textarea);
        set_input_value(textarea,
        /*body*/
        ctx[0]);
        append(div1, t);
        append(div1, div0);
        div0.innerHTML =
        /*rendered*/
        ctx[2];
        if (remount) dispose();
        dispose = listen(textarea, "input",
        /*textarea_input_handler*/
        ctx[6]);
      },
      p: function p(ctx, _ref58) {
        var _ref59 = _slicedToArray(_ref58, 1),
            dirty = _ref59[0];

        if (dirty &
        /*id*/
        2) {
          attr(textarea, "id",
          /*id*/
          ctx[1]);
        }

        if (dirty &
        /*body*/
        1) {
          set_input_value(textarea,
          /*body*/
          ctx[0]);
        }

        if (dirty &
        /*rendered*/
        4) div0.innerHTML =
        /*rendered*/
        ctx[2];
      },
      i: noop$1,
      o: noop$1,
      d: function d(detaching) {
        if (detaching) detach(div1);
        dispose();
      }
    };
  }

  function instance$o($$self, $$props, $$invalidate) {
    var id = $$props.id;
    var body = $$props.body;
    var rendered = "";
    var timer;
    var reader = new lib.Parser({
      smart: true
    });
    var writer = new lib.HtmlRenderer({
      safe: true
    });

    function textarea_input_handler() {
      body = this.value;
      $$invalidate(0, body);
    }

    $$self.$set = function ($$props) {
      if ("id" in $$props) $$invalidate(1, id = $$props.id);
      if ("body" in $$props) $$invalidate(0, body = $$props.body);
    };

    $$self.$$.update = function () {
      if ($$self.$$.dirty &
      /*timer, body*/
      9) {
        {
          if (timer) {
            clearTimeout(timer);
          }

          $$invalidate(3, timer = setTimeout(function () {
            var parsed = reader.parse(body);
            $$invalidate(2, rendered = writer.render(parsed));
          }, 250));
        }
      }
    };

    return [body, id, rendered, timer, reader, writer, textarea_input_handler];
  }

  var PostMarkdown = /*#__PURE__*/function (_SvelteComponent23) {
    _inherits(PostMarkdown, _SvelteComponent23);

    var _super26 = _createSuper(PostMarkdown);

    function PostMarkdown(options) {
      var _this27;

      _classCallCheck(this, PostMarkdown);

      _this27 = _super26.call(this);
      init(_assertThisInitialized(_this27), options, instance$o, create_fragment$o, safe_not_equal, {
        id: 1,
        body: 0
      });
      return _this27;
    }

    return PostMarkdown;
  }(SvelteComponent);
  /* src/UserPost.html generated by Svelte v3.20.1 */


  function create_catch_block_1(ctx) {
    var p;
    var t0;
    var t1_value =
    /*err*/
    ctx[18].message + "";
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
        if (dirty &
        /*postRequest*/
        64 && t1_value !== (t1_value =
        /*err*/
        ctx[18].message + "")) set_data(t1, t1_value);
      },
      i: noop$1,
      o: noop$1,
      d: function d(detaching) {
        if (detaching) detach(p);
      }
    };
  } // (84:0) {:then}


  function create_then_block$9(ctx) {
    var current;
    var unique = new Unique({
      props: {
        $$slots: {
          "default": [create_default_slot$6, function (_ref60) {
            var uniqueId = _ref60.uniqueId;
            return {
              19: uniqueId
            };
          }, function (_ref61) {
            var uniqueId = _ref61.uniqueId;
            return uniqueId ? 524288 : 0;
          }]
        },
        $$scope: {
          ctx: ctx
        }
      }
    });
    return {
      c: function c() {
        create_component(unique.$$.fragment);
      },
      m: function m(target, anchor) {
        mount_component(unique, target, anchor);
        current = true;
      },
      p: function p(ctx, dirty) {
        var unique_changes = {};

        if (dirty &
        /*$$scope, saveRequest, uniqueId, body, permissions, tags, title, url, description*/
        2621631) {
          unique_changes.$$scope = {
            dirty: dirty,
            ctx: ctx
          };
        }

        unique.$set(unique_changes);
      },
      i: function i(local) {
        if (current) return;
        transition_in(unique.$$.fragment, local);
        current = true;
      },
      o: function o(local) {
        transition_out(unique.$$.fragment, local);
        current = false;
      },
      d: function d(detaching) {
        destroy_component(unique, detaching);
      }
    };
  } // (114:8) {#if saveRequest}


  function create_if_block$b(ctx) {
    var await_block_anchor;
    var promise;
    var info = {
      ctx: ctx,
      current: null,
      token: null,
      pending: create_pending_block_1,
      then: create_then_block_1,
      "catch": create_catch_block$9,
      value: 20,
      error: 18
    };
    handle_promise(promise =
    /*saveRequest*/
    ctx[7], info);
    return {
      c: function c() {
        await_block_anchor = empty();
        info.block.c();
      },
      m: function m(target, anchor) {
        insert(target, await_block_anchor, anchor);
        info.block.m(target, info.anchor = anchor);

        info.mount = function () {
          return await_block_anchor.parentNode;
        };

        info.anchor = await_block_anchor;
      },
      p: function p(new_ctx, dirty) {
        ctx = new_ctx;
        info.ctx = ctx;
        if (dirty &
        /*saveRequest*/
        128 && promise !== (promise =
        /*saveRequest*/
        ctx[7]) && handle_promise(promise, info)) ;else {
          var child_ctx = ctx.slice();
          child_ctx[20] = info.resolved;
          info.block.p(child_ctx, dirty);
        }
      },
      d: function d(detaching) {
        if (detaching) detach(await_block_anchor);
        info.block.d(detaching);
        info.token = null;
        info = null;
      }
    };
  } // (119:8) {:catch err}


  function create_catch_block$9(ctx) {
    var p;
    var t0;
    var t1_value =
    /*err*/
    ctx[18].message + "";
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
        if (dirty &
        /*saveRequest*/
        128 && t1_value !== (t1_value =
        /*err*/
        ctx[18].message + "")) set_data(t1, t1_value);
      },
      d: function d(detaching) {
        if (detaching) detach(p);
      }
    };
  } // (117:8) {:then p}


  function create_then_block_1(ctx) {
    var p;
    var t0;
    var t1_value =
    /*p*/
    ctx[20].updated + "";
    var t1;
    return {
      c: function c() {
        p = element("p");
        t0 = text("Saved: ");
        t1 = text(t1_value);
      },
      m: function m(target, anchor) {
        insert(target, p, anchor);
        append(p, t0);
        append(p, t1);
      },
      p: function p(ctx, dirty) {
        if (dirty &
        /*saveRequest*/
        128 && t1_value !== (t1_value =
        /*p*/
        ctx[20].updated + "")) set_data(t1, t1_value);
      },
      d: function d(detaching) {
        if (detaching) detach(p);
      }
    };
  } // (115:28)          <p>Saving...</p>         {:then p}


  function create_pending_block_1(ctx) {
    var p;
    return {
      c: function c() {
        p = element("p");
        p.textContent = "Saving...";
      },
      m: function m(target, anchor) {
        insert(target, p, anchor);
      },
      p: noop$1,
      d: function d(detaching) {
        if (detaching) detach(p);
      }
    };
  } // (85:0) <Unique let:uniqueId={uniqueId}>


  function create_default_slot$6(ctx) {
    var form;
    var fieldset;
    var legend;
    var t1;
    var div0;
    var label0;
    var t2;
    var label0_for_value;
    var t3;
    var input0;
    var input0_id_value;
    var t4;
    var div1;
    var label1;
    var t5;
    var label1_for_value;
    var t6;
    var input1;
    var input1_id_value;
    var t7;
    var div2;
    var label2;
    var t8;
    var label2_for_value;
    var t9;
    var updating_input;
    var updating_value;
    var t10;
    var div3;
    var label3;
    var t11;
    var label3_for_value;
    var t12;
    var updating_tags;
    var t13;
    var div4;
    var label4;
    var t14;
    var label4_for_value;
    var t15;
    var updating_value_1;
    var t16;
    var div5;
    var label5;
    var t17;
    var label5_for_value;
    var t18;
    var updating_body;
    var t19;
    var button;
    var t21;
    var current;
    var dispose;

    function handle_input_binding(value) {
      /*handle_input_binding*/
      ctx[13].call(null, value);
    }

    function handle_value_binding(value) {
      /*handle_value_binding*/
      ctx[14].call(null, value);
    }

    var handle_props = {
      id: "post-url-" +
      /*uniqueId*/
      ctx[19],
      itemUrl: "posts"
    };

    if (
    /*title*/
    ctx[0] !== void 0) {
      handle_props.input =
      /*title*/
      ctx[0];
    }

    if (
    /*url*/
    ctx[3] !== void 0) {
      handle_props.value =
      /*url*/
      ctx[3];
    }

    var handle = new Handle({
      props: handle_props
    });
    binding_callbacks.push(function () {
      return bind$1(handle, "input", handle_input_binding);
    });
    binding_callbacks.push(function () {
      return bind$1(handle, "value", handle_value_binding);
    });

    function tags_1_tags_binding(value) {
      /*tags_1_tags_binding*/
      ctx[15].call(null, value);
    }

    var tags_1_props = {
      id: "post-tags-" +
      /*uniqueId*/
      ctx[19]
    };

    if (
    /*tags*/
    ctx[5] !== void 0) {
      tags_1_props.tags =
      /*tags*/
      ctx[5];
    }

    var tags_1 = new Tags({
      props: tags_1_props
    });
    binding_callbacks.push(function () {
      return bind$1(tags_1, "tags", tags_1_tags_binding);
    });

    function permissions_1_value_binding(value) {
      /*permissions_1_value_binding*/
      ctx[16].call(null, value);
    }

    var permissions_1_props = {
      id: "post-permissions-" +
      /*uniqueId*/
      ctx[19]
    };

    if (
    /*permissions*/
    ctx[4] !== void 0) {
      permissions_1_props.value =
      /*permissions*/
      ctx[4];
    }

    var permissions_1 = new Permissions({
      props: permissions_1_props
    });
    binding_callbacks.push(function () {
      return bind$1(permissions_1, "value", permissions_1_value_binding);
    });

    function postmarkdown_body_binding(value) {
      /*postmarkdown_body_binding*/
      ctx[17].call(null, value);
    }

    var postmarkdown_props = {
      id: "post-body-" +
      /*uniqueId*/
      ctx[19]
    };

    if (
    /*body*/
    ctx[2] !== void 0) {
      postmarkdown_props.body =
      /*body*/
      ctx[2];
    }

    var postmarkdown = new PostMarkdown({
      props: postmarkdown_props
    });
    binding_callbacks.push(function () {
      return bind$1(postmarkdown, "body", postmarkdown_body_binding);
    });
    var if_block =
    /*saveRequest*/
    ctx[7] && create_if_block$b(ctx);
    return {
      c: function c() {
        form = element("form");
        fieldset = element("fieldset");
        legend = element("legend");
        legend.textContent = "Post Information";
        t1 = space();
        div0 = element("div");
        label0 = element("label");
        t2 = text("Title");
        t3 = space();
        input0 = element("input");
        t4 = space();
        div1 = element("div");
        label1 = element("label");
        t5 = text("Description");
        t6 = space();
        input1 = element("input");
        t7 = space();
        div2 = element("div");
        label2 = element("label");
        t8 = text("URL");
        t9 = space();
        create_component(handle.$$.fragment);
        t10 = space();
        div3 = element("div");
        label3 = element("label");
        t11 = text("Tags");
        t12 = space();
        create_component(tags_1.$$.fragment);
        t13 = space();
        div4 = element("div");
        label4 = element("label");
        t14 = text("Permissions");
        t15 = space();
        create_component(permissions_1.$$.fragment);
        t16 = space();
        div5 = element("div");
        label5 = element("label");
        t17 = text("Body");
        t18 = space();
        create_component(postmarkdown.$$.fragment);
        t19 = space();
        button = element("button");
        button.textContent = "Save";
        t21 = space();
        if (if_block) if_block.c();
        attr(label0, "for", label0_for_value = "post-title-" +
        /*uniqueId*/
        ctx[19]);
        attr(input0, "id", input0_id_value = "post-title-" +
        /*uniqueId*/
        ctx[19]);
        attr(input0, "type", "text");
        attr(label1, "for", label1_for_value = "post-description-" +
        /*uniqueId*/
        ctx[19]);
        attr(input1, "id", input1_id_value = "post-description-" +
        /*uniqueId*/
        ctx[19]);
        attr(input1, "type", "text");
        attr(label2, "for", label2_for_value = "post-url-" +
        /*uniqueId*/
        ctx[19]);
        attr(label3, "for", label3_for_value = "post-tags-" +
        /*uniqueId*/
        ctx[19]);
        attr(label4, "for", label4_for_value = "post-permissions-" +
        /*uniqueId*/
        ctx[19]);
        attr(label5, "for", label5_for_value = "post-body-" +
        /*uniqueId*/
        ctx[19]);
        attr(button, "type", "button");
      },
      m: function m(target, anchor, remount) {
        insert(target, form, anchor);
        append(form, fieldset);
        append(fieldset, legend);
        append(fieldset, t1);
        append(fieldset, div0);
        append(div0, label0);
        append(label0, t2);
        append(div0, t3);
        append(div0, input0);
        set_input_value(input0,
        /*title*/
        ctx[0]);
        append(fieldset, t4);
        append(fieldset, div1);
        append(div1, label1);
        append(label1, t5);
        append(div1, t6);
        append(div1, input1);
        set_input_value(input1,
        /*description*/
        ctx[1]);
        append(fieldset, t7);
        append(fieldset, div2);
        append(div2, label2);
        append(label2, t8);
        append(div2, t9);
        mount_component(handle, div2, null);
        append(fieldset, t10);
        append(fieldset, div3);
        append(div3, label3);
        append(label3, t11);
        append(div3, t12);
        mount_component(tags_1, div3, null);
        append(fieldset, t13);
        append(fieldset, div4);
        append(div4, label4);
        append(label4, t14);
        append(div4, t15);
        mount_component(permissions_1, div4, null);
        append(fieldset, t16);
        append(fieldset, div5);
        append(div5, label5);
        append(label5, t17);
        append(div5, t18);
        mount_component(postmarkdown, div5, null);
        append(fieldset, t19);
        append(fieldset, button);
        append(fieldset, t21);
        if (if_block) if_block.m(fieldset, null);
        current = true;
        if (remount) run_all(dispose);
        dispose = [listen(input0, "input",
        /*input0_input_handler*/
        ctx[11]), listen(input1, "input",
        /*input1_input_handler*/
        ctx[12]), listen(button, "click",
        /*savePost*/
        ctx[8])];
      },
      p: function p(ctx, dirty) {
        if (!current || dirty &
        /*uniqueId*/
        524288 && label0_for_value !== (label0_for_value = "post-title-" +
        /*uniqueId*/
        ctx[19])) {
          attr(label0, "for", label0_for_value);
        }

        if (!current || dirty &
        /*uniqueId*/
        524288 && input0_id_value !== (input0_id_value = "post-title-" +
        /*uniqueId*/
        ctx[19])) {
          attr(input0, "id", input0_id_value);
        }

        if (dirty &
        /*title*/
        1 && input0.value !==
        /*title*/
        ctx[0]) {
          set_input_value(input0,
          /*title*/
          ctx[0]);
        }

        if (!current || dirty &
        /*uniqueId*/
        524288 && label1_for_value !== (label1_for_value = "post-description-" +
        /*uniqueId*/
        ctx[19])) {
          attr(label1, "for", label1_for_value);
        }

        if (!current || dirty &
        /*uniqueId*/
        524288 && input1_id_value !== (input1_id_value = "post-description-" +
        /*uniqueId*/
        ctx[19])) {
          attr(input1, "id", input1_id_value);
        }

        if (dirty &
        /*description*/
        2 && input1.value !==
        /*description*/
        ctx[1]) {
          set_input_value(input1,
          /*description*/
          ctx[1]);
        }

        if (!current || dirty &
        /*uniqueId*/
        524288 && label2_for_value !== (label2_for_value = "post-url-" +
        /*uniqueId*/
        ctx[19])) {
          attr(label2, "for", label2_for_value);
        }

        var handle_changes = {};
        if (dirty &
        /*uniqueId*/
        524288) handle_changes.id = "post-url-" +
        /*uniqueId*/
        ctx[19];

        if (!updating_input && dirty &
        /*title*/
        1) {
          updating_input = true;
          handle_changes.input =
          /*title*/
          ctx[0];
          add_flush_callback(function () {
            return updating_input = false;
          });
        }

        if (!updating_value && dirty &
        /*url*/
        8) {
          updating_value = true;
          handle_changes.value =
          /*url*/
          ctx[3];
          add_flush_callback(function () {
            return updating_value = false;
          });
        }

        handle.$set(handle_changes);

        if (!current || dirty &
        /*uniqueId*/
        524288 && label3_for_value !== (label3_for_value = "post-tags-" +
        /*uniqueId*/
        ctx[19])) {
          attr(label3, "for", label3_for_value);
        }

        var tags_1_changes = {};
        if (dirty &
        /*uniqueId*/
        524288) tags_1_changes.id = "post-tags-" +
        /*uniqueId*/
        ctx[19];

        if (!updating_tags && dirty &
        /*tags*/
        32) {
          updating_tags = true;
          tags_1_changes.tags =
          /*tags*/
          ctx[5];
          add_flush_callback(function () {
            return updating_tags = false;
          });
        }

        tags_1.$set(tags_1_changes);

        if (!current || dirty &
        /*uniqueId*/
        524288 && label4_for_value !== (label4_for_value = "post-permissions-" +
        /*uniqueId*/
        ctx[19])) {
          attr(label4, "for", label4_for_value);
        }

        var permissions_1_changes = {};
        if (dirty &
        /*uniqueId*/
        524288) permissions_1_changes.id = "post-permissions-" +
        /*uniqueId*/
        ctx[19];

        if (!updating_value_1 && dirty &
        /*permissions*/
        16) {
          updating_value_1 = true;
          permissions_1_changes.value =
          /*permissions*/
          ctx[4];
          add_flush_callback(function () {
            return updating_value_1 = false;
          });
        }

        permissions_1.$set(permissions_1_changes);

        if (!current || dirty &
        /*uniqueId*/
        524288 && label5_for_value !== (label5_for_value = "post-body-" +
        /*uniqueId*/
        ctx[19])) {
          attr(label5, "for", label5_for_value);
        }

        var postmarkdown_changes = {};
        if (dirty &
        /*uniqueId*/
        524288) postmarkdown_changes.id = "post-body-" +
        /*uniqueId*/
        ctx[19];

        if (!updating_body && dirty &
        /*body*/
        4) {
          updating_body = true;
          postmarkdown_changes.body =
          /*body*/
          ctx[2];
          add_flush_callback(function () {
            return updating_body = false;
          });
        }

        postmarkdown.$set(postmarkdown_changes);

        if (
        /*saveRequest*/
        ctx[7]) {
          if (if_block) {
            if_block.p(ctx, dirty);
          } else {
            if_block = create_if_block$b(ctx);
            if_block.c();
            if_block.m(fieldset, null);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }
      },
      i: function i(local) {
        if (current) return;
        transition_in(handle.$$.fragment, local);
        transition_in(tags_1.$$.fragment, local);
        transition_in(permissions_1.$$.fragment, local);
        transition_in(postmarkdown.$$.fragment, local);
        current = true;
      },
      o: function o(local) {
        transition_out(handle.$$.fragment, local);
        transition_out(tags_1.$$.fragment, local);
        transition_out(permissions_1.$$.fragment, local);
        transition_out(postmarkdown.$$.fragment, local);
        current = false;
      },
      d: function d(detaching) {
        if (detaching) detach(form);
        destroy_component(handle);
        destroy_component(tags_1);
        destroy_component(permissions_1);
        destroy_component(postmarkdown);
        if (if_block) if_block.d();
        run_all(dispose);
      }
    };
  } // (82:20)  <p>...</p> {:then}


  function create_pending_block$9(ctx) {
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
        if (detaching) detach(p);
      }
    };
  }

  function create_fragment$p(ctx) {
    var await_block_anchor;
    var promise;
    var current;
    var info = {
      ctx: ctx,
      current: null,
      token: null,
      pending: create_pending_block$9,
      then: create_then_block$9,
      "catch": create_catch_block_1,
      error: 18,
      blocks: [,,,]
    };
    handle_promise(promise =
    /*postRequest*/
    ctx[6], info);
    return {
      c: function c() {
        await_block_anchor = empty();
        info.block.c();
      },
      m: function m(target, anchor) {
        insert(target, await_block_anchor, anchor);
        info.block.m(target, info.anchor = anchor);

        info.mount = function () {
          return await_block_anchor.parentNode;
        };

        info.anchor = await_block_anchor;
        current = true;
      },
      p: function p(new_ctx, _ref62) {
        var _ref63 = _slicedToArray(_ref62, 1),
            dirty = _ref63[0];

        ctx = new_ctx;
        info.ctx = ctx;
        if (dirty &
        /*postRequest*/
        64 && promise !== (promise =
        /*postRequest*/
        ctx[6]) && handle_promise(promise, info)) ;else {
          var child_ctx = ctx.slice();
          info.block.p(child_ctx, dirty);
        }
      },
      i: function i(local) {
        if (current) return;
        transition_in(info.block);
        current = true;
      },
      o: function o(local) {
        for (var i = 0; i < 3; i += 1) {
          var _block9 = info.blocks[i];
          transition_out(_block9);
        }

        current = false;
      },
      d: function d(detaching) {
        if (detaching) detach(await_block_anchor);
        info.block.d(detaching);
        info.token = null;
        info = null;
      }
    };
  }

  var api$6 = "/api/v1";

  function instance$p($$self, $$props, $$invalidate) {
    var postId = $$props.postId;
    var _$$props$title = $$props.title,
        title = _$$props$title === void 0 ? "" : _$$props$title;
    var _$$props$description = $$props.description,
        description = _$$props$description === void 0 ? "" : _$$props$description;
    var _$$props$body = $$props.body,
        body = _$$props$body === void 0 ? "" : _$$props$body;
    var _$$props$url = $$props.url,
        url = _$$props$url === void 0 ? "" : _$$props$url;
    var _$$props$permissions = $$props.permissions,
        permissions = _$$props$permissions === void 0 ? 0 : _$$props$permissions;
    var _$$props$ord = $$props.ord,
        ord = _$$props$ord === void 0 ? 0 : _$$props$ord;
    var _$$props$tags2 = $$props.tags,
        tags = _$$props$tags2 === void 0 ? [] : _$$props$tags2;
    var postRequest = Promise.resolve(true);
    var saveRequest;

    function savePost() {
      if (title && description && body) {
        var endpoint = "".concat(api$6, "/posts") + (postId ? "/".concat(postId) : "");
        $$invalidate(7, saveRequest = fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "same-origin",
          body: JSON.stringify([{
            title: title,
            description: description,
            body: body,
            format: 1
          }, {
            permissions: permissions,
            ord: ord,
            url: url
          }])
        }).then(function (res) {
          return res.json();
        }).then(function (_ref64) {
          var _ref65 = _slicedToArray(_ref64, 2),
              usr = _ref65[0],
              post = _ref65[1];

          if (!postId) $$invalidate(9, postId = post.uuid);
          return fetch("".concat(api$6, "/posts/").concat(post.uuid, "/tags"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "same-origin",
            body: JSON.stringify(tags)
          }).then(function (res) {
            return res.json();
          }).then(function (_) {
            return post;
          });
        }));
      }
    }

    function input0_input_handler() {
      title = this.value;
      ($$invalidate(0, title), $$invalidate(9, postId)), $$invalidate(7, saveRequest);
    }

    function input1_input_handler() {
      description = this.value;
      ($$invalidate(1, description), $$invalidate(9, postId)), $$invalidate(7, saveRequest);
    }

    function handle_input_binding(value) {
      title = value;
      ($$invalidate(0, title), $$invalidate(9, postId)), $$invalidate(7, saveRequest);
    }

    function handle_value_binding(value) {
      url = value;
      ($$invalidate(3, url), $$invalidate(9, postId)), $$invalidate(7, saveRequest);
    }

    function tags_1_tags_binding(value) {
      tags = value;
      ($$invalidate(5, tags), $$invalidate(9, postId)), $$invalidate(7, saveRequest);
    }

    function permissions_1_value_binding(value) {
      permissions = value;
      ($$invalidate(4, permissions), $$invalidate(9, postId)), $$invalidate(7, saveRequest);
    }

    function postmarkdown_body_binding(value) {
      body = value;
      ($$invalidate(2, body), $$invalidate(9, postId)), $$invalidate(7, saveRequest);
    }

    $$self.$set = function ($$props) {
      if ("postId" in $$props) $$invalidate(9, postId = $$props.postId);
      if ("title" in $$props) $$invalidate(0, title = $$props.title);
      if ("description" in $$props) $$invalidate(1, description = $$props.description);
      if ("body" in $$props) $$invalidate(2, body = $$props.body);
      if ("url" in $$props) $$invalidate(3, url = $$props.url);
      if ("permissions" in $$props) $$invalidate(4, permissions = $$props.permissions);
      if ("ord" in $$props) $$invalidate(10, ord = $$props.ord);
      if ("tags" in $$props) $$invalidate(5, tags = $$props.tags);
    };

    $$self.$$.update = function () {
      if ($$self.$$.dirty &
      /*postId, saveRequest*/
      640) {
        if (postId && !saveRequest) {
          $$invalidate(6, postRequest = Promise.all([fetch("".concat(api$6, "/posts/").concat(postId)).then(function (res) {
            return res.json();
          }), fetch("".concat(api$6, "/posts/").concat(postId, "/tags")).then(function (res) {
            return res.json();
          })]).then(function (_ref66) {
            var _ref67 = _slicedToArray(_ref66, 2),
                post = _ref67[0],
                tags0 = _ref67[1];

            var _post = _slicedToArray(post, 2),
                usr = _post[0],
                res = _post[1];

            $$invalidate(0, title = res.title);
            $$invalidate(1, description = res.description);
            $$invalidate(2, body = res.body);
            $$invalidate(3, url = usr.url);
            $$invalidate(4, permissions = usr.permissions);
            $$invalidate(10, ord = usr.ord);
            $$invalidate(5, tags = tags0.map(function (tag) {
              return tag.name;
            }));
            $$invalidate(7, saveRequest = Promise.resolve(res));
            return res;
          }));
        }
      }
    };

    return [title, description, body, url, permissions, tags, postRequest, saveRequest, savePost, postId, ord, input0_input_handler, input1_input_handler, handle_input_binding, handle_value_binding, tags_1_tags_binding, permissions_1_value_binding, postmarkdown_body_binding];
  }

  var UserPost = /*#__PURE__*/function (_SvelteComponent24) {
    _inherits(UserPost, _SvelteComponent24);

    var _super27 = _createSuper(UserPost);

    function UserPost(options) {
      var _this28;

      _classCallCheck(this, UserPost);

      _this28 = _super27.call(this);
      init(_assertThisInitialized(_this28), options, instance$p, create_fragment$p, safe_not_equal, {
        postId: 9,
        title: 0,
        description: 1,
        body: 2,
        url: 3,
        permissions: 4,
        ord: 10,
        tags: 5
      });
      return _this28;
    }

    return UserPost;
  }(SvelteComponent);
  /* src/UserPostList.html generated by Svelte v3.20.1 */


  function create_fragment$q(ctx) {
    var current;
    var useritemlist = new UserItemList({
      props: {
        itemUrl: "posts",
        itemNamePlural: "posts",
        itemNameSingular: "post",
        processItems: processItems$1,
        processItemCallback: processItemCallback$1,
        itemInfoExtractCallback: itemInfoExtractCallback
      }
    });
    useritemlist.$on("orderChanged",
    /*orderChanged_handler*/
    ctx[0]);
    useritemlist.$on("orderSubmitted",
    /*orderSubmitted_handler*/
    ctx[1]);
    return {
      c: function c() {
        create_component(useritemlist.$$.fragment);
      },
      m: function m(target, anchor) {
        mount_component(useritemlist, target, anchor);
        current = true;
      },
      p: noop$1,
      i: function i(local) {
        if (current) return;
        transition_in(useritemlist.$$.fragment, local);
        current = true;
      },
      o: function o(local) {
        transition_out(useritemlist.$$.fragment, local);
        current = false;
      },
      d: function d(detaching) {
        destroy_component(useritemlist, detaching);
      }
    };
  }

  function processItems$1(pi) {
    var p1 = pi[1];
    p1.name = p1.title;
    p1.ord = pi[0].ord;
    return p1;
  }

  function processItemCallback$1(pi) {
    var p0 = pi[1];
    p0.name = p0.title;
    return [pi[0], p0];
  }

  function itemInfoExtractCallback(item) {
    var itemInfo = {
      title: item[1].name,
      description: item[1].description,
      body: item[1].body,
      format: item[1].format
    };
    var userItemInfo = {
      permissions: item[0].permissions,
      ord: item[0].ord,
      url: item[0].url
    };
    return [itemInfo, userItemInfo];
  }

  function instance$q($$self) {
    function orderChanged_handler(event) {
      bubble($$self, event);
    }

    function orderSubmitted_handler(event) {
      bubble($$self, event);
    }

    return [orderChanged_handler, orderSubmitted_handler];
  }

  var UserPostList = /*#__PURE__*/function (_SvelteComponent25) {
    _inherits(UserPostList, _SvelteComponent25);

    var _super28 = _createSuper(UserPostList);

    function UserPostList(options) {
      var _this29;

      _classCallCheck(this, UserPostList);

      _this29 = _super28.call(this);
      init(_assertThisInitialized(_this29), options, instance$q, create_fragment$q, safe_not_equal, {});
      return _this29;
    }

    return UserPostList;
  }(SvelteComponent);

  var evEmitter = createCommonjsModule(function (module) {
    /**
     * EvEmitter v1.1.0
     * Lil' event emitter
     * MIT License
     */

    /* jshint unused: true, undef: true, strict: true */
    (function (global, factory) {
      // universal module definition

      /* jshint strict: false */

      /* globals define, module, window */
      if (module.exports) {
        // CommonJS - Browserify, Webpack
        module.exports = factory();
      } else {
        // Browser globals
        global.EvEmitter = factory();
      }
    })(typeof window != 'undefined' ? window : commonjsGlobal, function () {
      function EvEmitter() {}

      var proto = EvEmitter.prototype;

      proto.on = function (eventName, listener) {
        if (!eventName || !listener) {
          return;
        } // set events hash


        var events = this._events = this._events || {}; // set listeners array

        var listeners = events[eventName] = events[eventName] || []; // only add once

        if (listeners.indexOf(listener) == -1) {
          listeners.push(listener);
        }

        return this;
      };

      proto.once = function (eventName, listener) {
        if (!eventName || !listener) {
          return;
        } // add event


        this.on(eventName, listener); // set once flag
        // set onceEvents hash

        var onceEvents = this._onceEvents = this._onceEvents || {}; // set onceListeners object

        var onceListeners = onceEvents[eventName] = onceEvents[eventName] || {}; // set flag

        onceListeners[listener] = true;
        return this;
      };

      proto.off = function (eventName, listener) {
        var listeners = this._events && this._events[eventName];

        if (!listeners || !listeners.length) {
          return;
        }

        var index = listeners.indexOf(listener);

        if (index != -1) {
          listeners.splice(index, 1);
        }

        return this;
      };

      proto.emitEvent = function (eventName, args) {
        var listeners = this._events && this._events[eventName];

        if (!listeners || !listeners.length) {
          return;
        } // copy over to avoid interference if .off() in listener


        listeners = listeners.slice(0);
        args = args || []; // once stuff

        var onceListeners = this._onceEvents && this._onceEvents[eventName];

        for (var i = 0; i < listeners.length; i++) {
          var listener = listeners[i];
          var isOnce = onceListeners && onceListeners[listener];

          if (isOnce) {
            // remove listener
            // remove before trigger to prevent recursion
            this.off(eventName, listener); // unset once flag

            delete onceListeners[listener];
          } // trigger listener


          listener.apply(this, args);
        }

        return this;
      };

      proto.allOff = function () {
        delete this._events;
        delete this._onceEvents;
      };

      return EvEmitter;
    });
  });
  var getSize = createCommonjsModule(function (module) {
    /*!
     * getSize v2.0.3
     * measure size of elements
     * MIT license
     */

    /* jshint browser: true, strict: true, undef: true, unused: true */

    /* globals console: false */
    (function (window, factory) {
      /* jshint strict: false */

      /* globals define, module */
      if (module.exports) {
        // CommonJS
        module.exports = factory();
      } else {
        // browser global
        window.getSize = factory();
      }
    })(window, function factory() {
      // -------------------------- helpers -------------------------- //
      // get a number from a string, not a percentage
      function getStyleSize(value) {
        var num = parseFloat(value); // not a percent like '100%', and a number

        var isValid = value.indexOf('%') == -1 && !isNaN(num);
        return isValid && num;
      }

      function noop() {}

      var logError = typeof console == 'undefined' ? noop : function (message) {}; // -------------------------- measurements -------------------------- //

      var measurements = ['paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom', 'marginLeft', 'marginRight', 'marginTop', 'marginBottom', 'borderLeftWidth', 'borderRightWidth', 'borderTopWidth', 'borderBottomWidth'];
      var measurementsLength = measurements.length;

      function getZeroSize() {
        var size = {
          width: 0,
          height: 0,
          innerWidth: 0,
          innerHeight: 0,
          outerWidth: 0,
          outerHeight: 0
        };

        for (var i = 0; i < measurementsLength; i++) {
          var measurement = measurements[i];
          size[measurement] = 0;
        }

        return size;
      } // -------------------------- getStyle -------------------------- //

      /**
       * getStyle, get style of element, check for Firefox bug
       * https://bugzilla.mozilla.org/show_bug.cgi?id=548397
       */


      function getStyle(elem) {
        var style = getComputedStyle(elem);

        if (!style) {
          logError('Style returned ' + style + '. Are you running this code in a hidden iframe on Firefox? ' + 'See https://bit.ly/getsizebug1');
        }

        return style;
      } // -------------------------- setup -------------------------- //


      var isSetup = false;
      var isBoxSizeOuter;
      /**
       * setup
       * check isBoxSizerOuter
       * do on first getSize() rather than on page load for Firefox bug
       */

      function setup() {
        // setup once
        if (isSetup) {
          return;
        }

        isSetup = true; // -------------------------- box sizing -------------------------- //

        /**
         * Chrome & Safari measure the outer-width on style.width on border-box elems
         * IE11 & Firefox<29 measures the inner-width
         */

        var div = document.createElement('div');
        div.style.width = '200px';
        div.style.padding = '1px 2px 3px 4px';
        div.style.borderStyle = 'solid';
        div.style.borderWidth = '1px 2px 3px 4px';
        div.style.boxSizing = 'border-box';
        var body = document.body || document.documentElement;
        body.appendChild(div);
        var style = getStyle(div); // round value for browser zoom. desandro/masonry#928

        isBoxSizeOuter = Math.round(getStyleSize(style.width)) == 200;
        getSize.isBoxSizeOuter = isBoxSizeOuter;
        body.removeChild(div);
      } // -------------------------- getSize -------------------------- //


      function getSize(elem) {
        setup(); // use querySeletor if elem is string

        if (typeof elem == 'string') {
          elem = document.querySelector(elem);
        } // do not proceed on non-objects


        if (!elem || _typeof(elem) != 'object' || !elem.nodeType) {
          return;
        }

        var style = getStyle(elem); // if hidden, everything is 0

        if (style.display == 'none') {
          return getZeroSize();
        }

        var size = {};
        size.width = elem.offsetWidth;
        size.height = elem.offsetHeight;
        var isBorderBox = size.isBorderBox = style.boxSizing == 'border-box'; // get all measurements

        for (var i = 0; i < measurementsLength; i++) {
          var measurement = measurements[i];
          var value = style[measurement];
          var num = parseFloat(value); // any 'auto', 'medium' value will be 0

          size[measurement] = !isNaN(num) ? num : 0;
        }

        var paddingWidth = size.paddingLeft + size.paddingRight;
        var paddingHeight = size.paddingTop + size.paddingBottom;
        var marginWidth = size.marginLeft + size.marginRight;
        var marginHeight = size.marginTop + size.marginBottom;
        var borderWidth = size.borderLeftWidth + size.borderRightWidth;
        var borderHeight = size.borderTopWidth + size.borderBottomWidth;
        var isBorderBoxSizeOuter = isBorderBox && isBoxSizeOuter; // overwrite width and height if we can get it from style

        var styleWidth = getStyleSize(style.width);

        if (styleWidth !== false) {
          size.width = styleWidth + ( // add padding and border unless it's already including it
          isBorderBoxSizeOuter ? 0 : paddingWidth + borderWidth);
        }

        var styleHeight = getStyleSize(style.height);

        if (styleHeight !== false) {
          size.height = styleHeight + ( // add padding and border unless it's already including it
          isBorderBoxSizeOuter ? 0 : paddingHeight + borderHeight);
        }

        size.innerWidth = size.width - (paddingWidth + borderWidth);
        size.innerHeight = size.height - (paddingHeight + borderHeight);
        size.outerWidth = size.width + marginWidth;
        size.outerHeight = size.height + marginHeight;
        return size;
      }

      return getSize;
    });
  });
  var matchesSelector = createCommonjsModule(function (module) {
    /**
     * matchesSelector v2.0.2
     * matchesSelector( element, '.selector' )
     * MIT license
     */

    /*jshint browser: true, strict: true, undef: true, unused: true */
    (function (window, factory) {
      // universal module definition
      if (module.exports) {
        // CommonJS
        module.exports = factory();
      } else {
        // browser global
        window.matchesSelector = factory();
      }
    })(window, function factory() {
      var matchesMethod = function () {
        var ElemProto = window.Element.prototype; // check for the standard method name first

        if (ElemProto.matches) {
          return 'matches';
        } // check un-prefixed


        if (ElemProto.matchesSelector) {
          return 'matchesSelector';
        } // check vendor prefixes


        var prefixes = ['webkit', 'moz', 'ms', 'o'];

        for (var i = 0; i < prefixes.length; i++) {
          var prefix = prefixes[i];
          var method = prefix + 'MatchesSelector';

          if (ElemProto[method]) {
            return method;
          }
        }
      }();

      return function matchesSelector(elem, selector) {
        return elem[matchesMethod](selector);
      };
    });
  });
  var utils = createCommonjsModule(function (module) {
    /**
     * Fizzy UI utils v2.0.7
     * MIT license
     */

    /*jshint browser: true, undef: true, unused: true, strict: true */
    (function (window, factory) {
      // universal module definition

      /*jshint strict: false */

      /*globals define, module, require */
      if (module.exports) {
        // CommonJS
        module.exports = factory(window, matchesSelector);
      } else {
        // browser global
        window.fizzyUIUtils = factory(window, window.matchesSelector);
      }
    })(window, function factory(window, matchesSelector) {
      var utils = {}; // ----- extend ----- //
      // extends objects

      utils.extend = function (a, b) {
        for (var prop in b) {
          a[prop] = b[prop];
        }

        return a;
      }; // ----- modulo ----- //


      utils.modulo = function (num, div) {
        return (num % div + div) % div;
      }; // ----- makeArray ----- //


      var arraySlice = Array.prototype.slice; // turn element or nodeList into an array

      utils.makeArray = function (obj) {
        if (Array.isArray(obj)) {
          // use object if already an array
          return obj;
        } // return empty array if undefined or null. #6


        if (obj === null || obj === undefined) {
          return [];
        }

        var isArrayLike = _typeof(obj) == 'object' && typeof obj.length == 'number';

        if (isArrayLike) {
          // convert nodeList to array
          return arraySlice.call(obj);
        } // array of single index


        return [obj];
      }; // ----- removeFrom ----- //


      utils.removeFrom = function (ary, obj) {
        var index = ary.indexOf(obj);

        if (index != -1) {
          ary.splice(index, 1);
        }
      }; // ----- getParent ----- //


      utils.getParent = function (elem, selector) {
        while (elem.parentNode && elem != document.body) {
          elem = elem.parentNode;

          if (matchesSelector(elem, selector)) {
            return elem;
          }
        }
      }; // ----- getQueryElement ----- //
      // use element as selector string


      utils.getQueryElement = function (elem) {
        if (typeof elem == 'string') {
          return document.querySelector(elem);
        }

        return elem;
      }; // ----- handleEvent ----- //
      // enable .ontype to trigger from .addEventListener( elem, 'type' )


      utils.handleEvent = function (event) {
        var method = 'on' + event.type;

        if (this[method]) {
          this[method](event);
        }
      }; // ----- filterFindElements ----- //


      utils.filterFindElements = function (elems, selector) {
        // make array of elems
        elems = utils.makeArray(elems);
        var ffElems = [];
        elems.forEach(function (elem) {
          // check that elem is an actual element
          if (!(elem instanceof HTMLElement)) {
            return;
          } // add elem if no selector


          if (!selector) {
            ffElems.push(elem);
            return;
          } // filter & find items if we have a selector
          // filter


          if (matchesSelector(elem, selector)) {
            ffElems.push(elem);
          } // find children


          var childElems = elem.querySelectorAll(selector); // concat childElems to filterFound array

          for (var i = 0; i < childElems.length; i++) {
            ffElems.push(childElems[i]);
          }
        });
        return ffElems;
      }; // ----- debounceMethod ----- //


      utils.debounceMethod = function (_class, methodName, threshold) {
        threshold = threshold || 100; // original method

        var method = _class.prototype[methodName];
        var timeoutName = methodName + 'Timeout';

        _class.prototype[methodName] = function () {
          var timeout = this[timeoutName];
          clearTimeout(timeout);
          var args = arguments;

          var _this = this;

          this[timeoutName] = setTimeout(function () {
            method.apply(_this, args);
            delete _this[timeoutName];
          }, threshold);
        };
      }; // ----- docReady ----- //


      utils.docReady = function (callback) {
        var readyState = document.readyState;

        if (readyState == 'complete' || readyState == 'interactive') {
          // do async to allow for other scripts to run. metafizzy/flickity#441
          setTimeout(callback);
        } else {
          document.addEventListener('DOMContentLoaded', callback);
        }
      }; // ----- htmlInit ----- //
      // http://jamesroberts.name/blog/2010/02/22/string-functions-for-javascript-trim-to-camel-case-to-dashed-and-to-underscore/


      utils.toDashed = function (str) {
        return str.replace(/(.)([A-Z])/g, function (match, $1, $2) {
          return $1 + '-' + $2;
        }).toLowerCase();
      };

      var console = window.console;
      /**
       * allow user to initialize classes via [data-namespace] or .js-namespace class
       * htmlInit( Widget, 'widgetName' )
       * options are parsed from data-namespace-options
       */

      utils.htmlInit = function (WidgetClass, namespace) {
        utils.docReady(function () {
          var dashedNamespace = utils.toDashed(namespace);
          var dataAttr = 'data-' + dashedNamespace;
          var dataAttrElems = document.querySelectorAll('[' + dataAttr + ']');
          var jsDashElems = document.querySelectorAll('.js-' + dashedNamespace);
          var elems = utils.makeArray(dataAttrElems).concat(utils.makeArray(jsDashElems));
          var dataOptionsAttr = dataAttr + '-options';
          var jQuery = window.jQuery;
          elems.forEach(function (elem) {
            var attr = elem.getAttribute(dataAttr) || elem.getAttribute(dataOptionsAttr);
            var options;

            try {
              options = attr && JSON.parse(attr);
            } catch (error) {
              // log error, do not initialize
              if (console) {
                console.error('Error parsing ' + dataAttr + ' on ' + elem.className + ': ' + error);
              }

              return;
            } // initialize


            var instance = new WidgetClass(elem, options); // make available via $().data('namespace')

            if (jQuery) {
              jQuery.data(elem, namespace, instance);
            }
          });
        });
      }; // -----  ----- //


      return utils;
    });
  });
  var item$1 = createCommonjsModule(function (module) {
    /**
     * Outlayer Item
     */
    (function (window, factory) {
      // universal module definition

      /* jshint strict: false */

      /* globals define, module, require */
      if (module.exports) {
        // CommonJS - Browserify, Webpack
        module.exports = factory(evEmitter, getSize);
      } else {
        // browser global
        window.Outlayer = {};
        window.Outlayer.Item = factory(window.EvEmitter, window.getSize);
      }
    })(window, function factory(EvEmitter, getSize) {
      // ----- helpers ----- //
      function isEmptyObj(obj) {
        for (var prop in obj) {
          return false;
        }

        prop = null;
        return true;
      } // -------------------------- CSS3 support -------------------------- //


      var docElemStyle = document.documentElement.style;
      var transitionProperty = typeof docElemStyle.transition == 'string' ? 'transition' : 'WebkitTransition';
      var transformProperty = typeof docElemStyle.transform == 'string' ? 'transform' : 'WebkitTransform';
      var transitionEndEvent = {
        WebkitTransition: 'webkitTransitionEnd',
        transition: 'transitionend'
      }[transitionProperty]; // cache all vendor properties that could have vendor prefix

      var vendorProperties = {
        transform: transformProperty,
        transition: transitionProperty,
        transitionDuration: transitionProperty + 'Duration',
        transitionProperty: transitionProperty + 'Property',
        transitionDelay: transitionProperty + 'Delay'
      }; // -------------------------- Item -------------------------- //

      function Item(element, layout) {
        if (!element) {
          return;
        }

        this.element = element; // parent layout class, i.e. Masonry, Isotope, or Packery

        this.layout = layout;
        this.position = {
          x: 0,
          y: 0
        };

        this._create();
      } // inherit EvEmitter


      var proto = Item.prototype = Object.create(EvEmitter.prototype);
      proto.constructor = Item;

      proto._create = function () {
        // transition objects
        this._transn = {
          ingProperties: {},
          clean: {},
          onEnd: {}
        };
        this.css({
          position: 'absolute'
        });
      }; // trigger specified handler for event type


      proto.handleEvent = function (event) {
        var method = 'on' + event.type;

        if (this[method]) {
          this[method](event);
        }
      };

      proto.getSize = function () {
        this.size = getSize(this.element);
      };
      /**
       * apply CSS styles to element
       * @param {Object} style
       */


      proto.css = function (style) {
        var elemStyle = this.element.style;

        for (var prop in style) {
          // use vendor property if available
          var supportedProp = vendorProperties[prop] || prop;
          elemStyle[supportedProp] = style[prop];
        }
      }; // measure position, and sets it


      proto.getPosition = function () {
        var style = getComputedStyle(this.element);

        var isOriginLeft = this.layout._getOption('originLeft');

        var isOriginTop = this.layout._getOption('originTop');

        var xValue = style[isOriginLeft ? 'left' : 'right'];
        var yValue = style[isOriginTop ? 'top' : 'bottom'];
        var x = parseFloat(xValue);
        var y = parseFloat(yValue); // convert percent to pixels

        var layoutSize = this.layout.size;

        if (xValue.indexOf('%') != -1) {
          x = x / 100 * layoutSize.width;
        }

        if (yValue.indexOf('%') != -1) {
          y = y / 100 * layoutSize.height;
        } // clean up 'auto' or other non-integer values


        x = isNaN(x) ? 0 : x;
        y = isNaN(y) ? 0 : y; // remove padding from measurement

        x -= isOriginLeft ? layoutSize.paddingLeft : layoutSize.paddingRight;
        y -= isOriginTop ? layoutSize.paddingTop : layoutSize.paddingBottom;
        this.position.x = x;
        this.position.y = y;
      }; // set settled position, apply padding


      proto.layoutPosition = function () {
        var layoutSize = this.layout.size;
        var style = {};

        var isOriginLeft = this.layout._getOption('originLeft');

        var isOriginTop = this.layout._getOption('originTop'); // x


        var xPadding = isOriginLeft ? 'paddingLeft' : 'paddingRight';
        var xProperty = isOriginLeft ? 'left' : 'right';
        var xResetProperty = isOriginLeft ? 'right' : 'left';
        var x = this.position.x + layoutSize[xPadding]; // set in percentage or pixels

        style[xProperty] = this.getXValue(x); // reset other property

        style[xResetProperty] = ''; // y

        var yPadding = isOriginTop ? 'paddingTop' : 'paddingBottom';
        var yProperty = isOriginTop ? 'top' : 'bottom';
        var yResetProperty = isOriginTop ? 'bottom' : 'top';
        var y = this.position.y + layoutSize[yPadding]; // set in percentage or pixels

        style[yProperty] = this.getYValue(y); // reset other property

        style[yResetProperty] = '';
        this.css(style);
        this.emitEvent('layout', [this]);
      };

      proto.getXValue = function (x) {
        var isHorizontal = this.layout._getOption('horizontal');

        return this.layout.options.percentPosition && !isHorizontal ? x / this.layout.size.width * 100 + '%' : x + 'px';
      };

      proto.getYValue = function (y) {
        var isHorizontal = this.layout._getOption('horizontal');

        return this.layout.options.percentPosition && isHorizontal ? y / this.layout.size.height * 100 + '%' : y + 'px';
      };

      proto._transitionTo = function (x, y) {
        this.getPosition(); // get current x & y from top/left

        var curX = this.position.x;
        var curY = this.position.y;
        var didNotMove = x == this.position.x && y == this.position.y; // save end position

        this.setPosition(x, y); // if did not move and not transitioning, just go to layout

        if (didNotMove && !this.isTransitioning) {
          this.layoutPosition();
          return;
        }

        var transX = x - curX;
        var transY = y - curY;
        var transitionStyle = {};
        transitionStyle.transform = this.getTranslate(transX, transY);
        this.transition({
          to: transitionStyle,
          onTransitionEnd: {
            transform: this.layoutPosition
          },
          isCleaning: true
        });
      };

      proto.getTranslate = function (x, y) {
        // flip cooridinates if origin on right or bottom
        var isOriginLeft = this.layout._getOption('originLeft');

        var isOriginTop = this.layout._getOption('originTop');

        x = isOriginLeft ? x : -x;
        y = isOriginTop ? y : -y;
        return 'translate3d(' + x + 'px, ' + y + 'px, 0)';
      }; // non transition + transform support


      proto.goTo = function (x, y) {
        this.setPosition(x, y);
        this.layoutPosition();
      };

      proto.moveTo = proto._transitionTo;

      proto.setPosition = function (x, y) {
        this.position.x = parseFloat(x);
        this.position.y = parseFloat(y);
      }; // ----- transition ----- //

      /**
       * @param {Object} style - CSS
       * @param {Function} onTransitionEnd
       */
      // non transition, just trigger callback


      proto._nonTransition = function (args) {
        this.css(args.to);

        if (args.isCleaning) {
          this._removeStyles(args.to);
        }

        for (var prop in args.onTransitionEnd) {
          args.onTransitionEnd[prop].call(this);
        }
      };
      /**
       * proper transition
       * @param {Object} args - arguments
       *   @param {Object} to - style to transition to
       *   @param {Object} from - style to start transition from
       *   @param {Boolean} isCleaning - removes transition styles after transition
       *   @param {Function} onTransitionEnd - callback
       */


      proto.transition = function (args) {
        // redirect to nonTransition if no transition duration
        if (!parseFloat(this.layout.options.transitionDuration)) {
          this._nonTransition(args);

          return;
        }

        var _transition = this._transn; // keep track of onTransitionEnd callback by css property

        for (var prop in args.onTransitionEnd) {
          _transition.onEnd[prop] = args.onTransitionEnd[prop];
        } // keep track of properties that are transitioning


        for (prop in args.to) {
          _transition.ingProperties[prop] = true; // keep track of properties to clean up when transition is done

          if (args.isCleaning) {
            _transition.clean[prop] = true;
          }
        } // set from styles


        if (args.from) {
          this.css(args.from); // force redraw. http://blog.alexmaccaw.com/css-transitions

          var h = this.element.offsetHeight; // hack for JSHint to hush about unused var

          h = null;
        } // enable transition


        this.enableTransition(args.to); // set styles that are transitioning

        this.css(args.to);
        this.isTransitioning = true;
      }; // dash before all cap letters, including first for
      // WebkitTransform => -webkit-transform


      function toDashedAll(str) {
        return str.replace(/([A-Z])/g, function ($1) {
          return '-' + $1.toLowerCase();
        });
      }

      var transitionProps = 'opacity,' + toDashedAll(transformProperty);

      proto.enableTransition = function ()
      /* style */
      {
        // HACK changing transitionProperty during a transition
        // will cause transition to jump
        if (this.isTransitioning) {
          return;
        } // make `transition: foo, bar, baz` from style object
        // HACK un-comment this when enableTransition can work
        // while a transition is happening
        // var transitionValues = [];
        // for ( var prop in style ) {
        //   // dash-ify camelCased properties like WebkitTransition
        //   prop = vendorProperties[ prop ] || prop;
        //   transitionValues.push( toDashedAll( prop ) );
        // }
        // munge number to millisecond, to match stagger


        var duration = this.layout.options.transitionDuration;
        duration = typeof duration == 'number' ? duration + 'ms' : duration; // enable transition styles

        this.css({
          transitionProperty: transitionProps,
          transitionDuration: duration,
          transitionDelay: this.staggerDelay || 0
        }); // listen for transition end event

        this.element.addEventListener(transitionEndEvent, this, false);
      }; // ----- events ----- //


      proto.onwebkitTransitionEnd = function (event) {
        this.ontransitionend(event);
      };

      proto.onotransitionend = function (event) {
        this.ontransitionend(event);
      }; // properties that I munge to make my life easier


      var dashedVendorProperties = {
        '-webkit-transform': 'transform'
      };

      proto.ontransitionend = function (event) {
        // disregard bubbled events from children
        if (event.target !== this.element) {
          return;
        }

        var _transition = this._transn; // get property name of transitioned property, convert to prefix-free

        var propertyName = dashedVendorProperties[event.propertyName] || event.propertyName; // remove property that has completed transitioning

        delete _transition.ingProperties[propertyName]; // check if any properties are still transitioning

        if (isEmptyObj(_transition.ingProperties)) {
          // all properties have completed transitioning
          this.disableTransition();
        } // clean style


        if (propertyName in _transition.clean) {
          // clean up style
          this.element.style[event.propertyName] = '';
          delete _transition.clean[propertyName];
        } // trigger onTransitionEnd callback


        if (propertyName in _transition.onEnd) {
          var onTransitionEnd = _transition.onEnd[propertyName];
          onTransitionEnd.call(this);
          delete _transition.onEnd[propertyName];
        }

        this.emitEvent('transitionEnd', [this]);
      };

      proto.disableTransition = function () {
        this.removeTransitionStyles();
        this.element.removeEventListener(transitionEndEvent, this, false);
        this.isTransitioning = false;
      };
      /**
       * removes style property from element
       * @param {Object} style
      **/


      proto._removeStyles = function (style) {
        // clean up transition styles
        var cleanStyle = {};

        for (var prop in style) {
          cleanStyle[prop] = '';
        }

        this.css(cleanStyle);
      };

      var cleanTransitionStyle = {
        transitionProperty: '',
        transitionDuration: '',
        transitionDelay: ''
      };

      proto.removeTransitionStyles = function () {
        // remove transition
        this.css(cleanTransitionStyle);
      }; // ----- stagger ----- //


      proto.stagger = function (delay) {
        delay = isNaN(delay) ? 0 : delay;
        this.staggerDelay = delay + 'ms';
      }; // ----- show/hide/remove ----- //
      // remove element from DOM


      proto.removeElem = function () {
        this.element.parentNode.removeChild(this.element); // remove display: none

        this.css({
          display: ''
        });
        this.emitEvent('remove', [this]);
      };

      proto.remove = function () {
        // just remove element if no transition support or no transition
        if (!transitionProperty || !parseFloat(this.layout.options.transitionDuration)) {
          this.removeElem();
          return;
        } // start transition


        this.once('transitionEnd', function () {
          this.removeElem();
        });
        this.hide();
      };

      proto.reveal = function () {
        delete this.isHidden; // remove display: none

        this.css({
          display: ''
        });
        var options = this.layout.options;
        var onTransitionEnd = {};
        var transitionEndProperty = this.getHideRevealTransitionEndProperty('visibleStyle');
        onTransitionEnd[transitionEndProperty] = this.onRevealTransitionEnd;
        this.transition({
          from: options.hiddenStyle,
          to: options.visibleStyle,
          isCleaning: true,
          onTransitionEnd: onTransitionEnd
        });
      };

      proto.onRevealTransitionEnd = function () {
        // check if still visible
        // during transition, item may have been hidden
        if (!this.isHidden) {
          this.emitEvent('reveal');
        }
      };
      /**
       * get style property use for hide/reveal transition end
       * @param {String} styleProperty - hiddenStyle/visibleStyle
       * @returns {String}
       */


      proto.getHideRevealTransitionEndProperty = function (styleProperty) {
        var optionStyle = this.layout.options[styleProperty]; // use opacity

        if (optionStyle.opacity) {
          return 'opacity';
        } // get first property


        for (var prop in optionStyle) {
          return prop;
        }
      };

      proto.hide = function () {
        // set flag
        this.isHidden = true; // remove display: none

        this.css({
          display: ''
        });
        var options = this.layout.options;
        var onTransitionEnd = {};
        var transitionEndProperty = this.getHideRevealTransitionEndProperty('hiddenStyle');
        onTransitionEnd[transitionEndProperty] = this.onHideTransitionEnd;
        this.transition({
          from: options.visibleStyle,
          to: options.hiddenStyle,
          // keep hidden stuff hidden
          isCleaning: true,
          onTransitionEnd: onTransitionEnd
        });
      };

      proto.onHideTransitionEnd = function () {
        // check if still hidden
        // during transition, item may have been un-hidden
        if (this.isHidden) {
          this.css({
            display: 'none'
          });
          this.emitEvent('hide');
        }
      };

      proto.destroy = function () {
        this.css({
          position: '',
          left: '',
          right: '',
          top: '',
          bottom: '',
          transition: '',
          transform: ''
        });
      };

      return Item;
    });
  });
  var outlayer = createCommonjsModule(function (module) {
    /*!
     * Outlayer v2.1.1
     * the brains and guts of a layout library
     * MIT license
     */
    (function (window, factory) {
      // universal module definition

      /* jshint strict: false */

      /* globals define, module, require */
      if (module.exports) {
        // CommonJS - Browserify, Webpack
        module.exports = factory(window, evEmitter, getSize, utils, item$1);
      } else {
        // browser global
        window.Outlayer = factory(window, window.EvEmitter, window.getSize, window.fizzyUIUtils, window.Outlayer.Item);
      }
    })(window, function factory(window, EvEmitter, getSize, utils, Item) {
      // ----- vars ----- //
      var console = window.console;
      var jQuery = window.jQuery;

      var noop = function noop() {}; // -------------------------- Outlayer -------------------------- //
      // globally unique identifiers


      var GUID = 0; // internal store of all Outlayer intances

      var instances = {};
      /**
       * @param {Element, String} element
       * @param {Object} options
       * @constructor
       */

      function Outlayer(element, options) {
        var queryElement = utils.getQueryElement(element);

        if (!queryElement) {
          if (console) {
            console.error('Bad element for ' + this.constructor.namespace + ': ' + (queryElement || element));
          }

          return;
        }

        this.element = queryElement; // add jQuery

        if (jQuery) {
          this.$element = jQuery(this.element);
        } // options


        this.options = utils.extend({}, this.constructor.defaults);
        this.option(options); // add id for Outlayer.getFromElement

        var id = ++GUID;
        this.element.outlayerGUID = id; // expando

        instances[id] = this; // associate via id
        // kick it off

        this._create();

        var isInitLayout = this._getOption('initLayout');

        if (isInitLayout) {
          this.layout();
        }
      } // settings are for internal use only


      Outlayer.namespace = 'outlayer';
      Outlayer.Item = Item; // default options

      Outlayer.defaults = {
        containerStyle: {
          position: 'relative'
        },
        initLayout: true,
        originLeft: true,
        originTop: true,
        resize: true,
        resizeContainer: true,
        // item options
        transitionDuration: '0.4s',
        hiddenStyle: {
          opacity: 0,
          transform: 'scale(0.001)'
        },
        visibleStyle: {
          opacity: 1,
          transform: 'scale(1)'
        }
      };
      var proto = Outlayer.prototype; // inherit EvEmitter

      utils.extend(proto, EvEmitter.prototype);
      /**
       * set options
       * @param {Object} opts
       */

      proto.option = function (opts) {
        utils.extend(this.options, opts);
      };
      /**
       * get backwards compatible option value, check old name
       */


      proto._getOption = function (option) {
        var oldOption = this.constructor.compatOptions[option];
        return oldOption && this.options[oldOption] !== undefined ? this.options[oldOption] : this.options[option];
      };

      Outlayer.compatOptions = {
        // currentName: oldName
        initLayout: 'isInitLayout',
        horizontal: 'isHorizontal',
        layoutInstant: 'isLayoutInstant',
        originLeft: 'isOriginLeft',
        originTop: 'isOriginTop',
        resize: 'isResizeBound',
        resizeContainer: 'isResizingContainer'
      };

      proto._create = function () {
        // get items from children
        this.reloadItems(); // elements that affect layout, but are not laid out

        this.stamps = [];
        this.stamp(this.options.stamp); // set container style

        utils.extend(this.element.style, this.options.containerStyle); // bind resize method

        var canBindResize = this._getOption('resize');

        if (canBindResize) {
          this.bindResize();
        }
      }; // goes through all children again and gets bricks in proper order


      proto.reloadItems = function () {
        // collection of item elements
        this.items = this._itemize(this.element.children);
      };
      /**
       * turn elements into Outlayer.Items to be used in layout
       * @param {Array or NodeList or HTMLElement} elems
       * @returns {Array} items - collection of new Outlayer Items
       */


      proto._itemize = function (elems) {
        var itemElems = this._filterFindItemElements(elems);

        var Item = this.constructor.Item; // create new Outlayer Items for collection

        var items = [];

        for (var i = 0; i < itemElems.length; i++) {
          var elem = itemElems[i];
          var item = new Item(elem, this);
          items.push(item);
        }

        return items;
      };
      /**
       * get item elements to be used in layout
       * @param {Array or NodeList or HTMLElement} elems
       * @returns {Array} items - item elements
       */


      proto._filterFindItemElements = function (elems) {
        return utils.filterFindElements(elems, this.options.itemSelector);
      };
      /**
       * getter method for getting item elements
       * @returns {Array} elems - collection of item elements
       */


      proto.getItemElements = function () {
        return this.items.map(function (item) {
          return item.element;
        });
      }; // ----- init & layout ----- //

      /**
       * lays out all items
       */


      proto.layout = function () {
        this._resetLayout();

        this._manageStamps(); // don't animate first layout


        var layoutInstant = this._getOption('layoutInstant');

        var isInstant = layoutInstant !== undefined ? layoutInstant : !this._isLayoutInited;
        this.layoutItems(this.items, isInstant); // flag for initalized

        this._isLayoutInited = true;
      }; // _init is alias for layout


      proto._init = proto.layout;
      /**
       * logic before any new layout
       */

      proto._resetLayout = function () {
        this.getSize();
      };

      proto.getSize = function () {
        this.size = getSize(this.element);
      };
      /**
       * get measurement from option, for columnWidth, rowHeight, gutter
       * if option is String -> get element from selector string, & get size of element
       * if option is Element -> get size of element
       * else use option as a number
       *
       * @param {String} measurement
       * @param {String} size - width or height
       * @private
       */


      proto._getMeasurement = function (measurement, size) {
        var option = this.options[measurement];
        var elem;

        if (!option) {
          // default to 0
          this[measurement] = 0;
        } else {
          // use option as an element
          if (typeof option == 'string') {
            elem = this.element.querySelector(option);
          } else if (option instanceof HTMLElement) {
            elem = option;
          } // use size of element, if element


          this[measurement] = elem ? getSize(elem)[size] : option;
        }
      };
      /**
       * layout a collection of item elements
       * @api public
       */


      proto.layoutItems = function (items, isInstant) {
        items = this._getItemsForLayout(items);

        this._layoutItems(items, isInstant);

        this._postLayout();
      };
      /**
       * get the items to be laid out
       * you may want to skip over some items
       * @param {Array} items
       * @returns {Array} items
       */


      proto._getItemsForLayout = function (items) {
        return items.filter(function (item) {
          return !item.isIgnored;
        });
      };
      /**
       * layout items
       * @param {Array} items
       * @param {Boolean} isInstant
       */


      proto._layoutItems = function (items, isInstant) {
        this._emitCompleteOnItems('layout', items);

        if (!items || !items.length) {
          // no items, emit event with empty array
          return;
        }

        var queue = [];
        items.forEach(function (item) {
          // get x/y object from method
          var position = this._getItemLayoutPosition(item); // enqueue


          position.item = item;
          position.isInstant = isInstant || item.isLayoutInstant;
          queue.push(position);
        }, this);

        this._processLayoutQueue(queue);
      };
      /**
       * get item layout position
       * @param {Outlayer.Item} item
       * @returns {Object} x and y position
       */


      proto._getItemLayoutPosition = function ()
      /* item */
      {
        return {
          x: 0,
          y: 0
        };
      };
      /**
       * iterate over array and position each item
       * Reason being - separating this logic prevents 'layout invalidation'
       * thx @paul_irish
       * @param {Array} queue
       */


      proto._processLayoutQueue = function (queue) {
        this.updateStagger();
        queue.forEach(function (obj, i) {
          this._positionItem(obj.item, obj.x, obj.y, obj.isInstant, i);
        }, this);
      }; // set stagger from option in milliseconds number


      proto.updateStagger = function () {
        var stagger = this.options.stagger;

        if (stagger === null || stagger === undefined) {
          this.stagger = 0;
          return;
        }

        this.stagger = getMilliseconds(stagger);
        return this.stagger;
      };
      /**
       * Sets position of item in DOM
       * @param {Outlayer.Item} item
       * @param {Number} x - horizontal position
       * @param {Number} y - vertical position
       * @param {Boolean} isInstant - disables transitions
       */


      proto._positionItem = function (item, x, y, isInstant, i) {
        if (isInstant) {
          // if not transition, just set CSS
          item.goTo(x, y);
        } else {
          item.stagger(i * this.stagger);
          item.moveTo(x, y);
        }
      };
      /**
       * Any logic you want to do after each layout,
       * i.e. size the container
       */


      proto._postLayout = function () {
        this.resizeContainer();
      };

      proto.resizeContainer = function () {
        var isResizingContainer = this._getOption('resizeContainer');

        if (!isResizingContainer) {
          return;
        }

        var size = this._getContainerSize();

        if (size) {
          this._setContainerMeasure(size.width, true);

          this._setContainerMeasure(size.height, false);
        }
      };
      /**
       * Sets width or height of container if returned
       * @returns {Object} size
       *   @param {Number} width
       *   @param {Number} height
       */


      proto._getContainerSize = noop;
      /**
       * @param {Number} measure - size of width or height
       * @param {Boolean} isWidth
       */

      proto._setContainerMeasure = function (measure, isWidth) {
        if (measure === undefined) {
          return;
        }

        var elemSize = this.size; // add padding and border width if border box

        if (elemSize.isBorderBox) {
          measure += isWidth ? elemSize.paddingLeft + elemSize.paddingRight + elemSize.borderLeftWidth + elemSize.borderRightWidth : elemSize.paddingBottom + elemSize.paddingTop + elemSize.borderTopWidth + elemSize.borderBottomWidth;
        }

        measure = Math.max(measure, 0);
        this.element.style[isWidth ? 'width' : 'height'] = measure + 'px';
      };
      /**
       * emit eventComplete on a collection of items events
       * @param {String} eventName
       * @param {Array} items - Outlayer.Items
       */


      proto._emitCompleteOnItems = function (eventName, items) {
        var _this = this;

        function onComplete() {
          _this.dispatchEvent(eventName + 'Complete', null, [items]);
        }

        var count = items.length;

        if (!items || !count) {
          onComplete();
          return;
        }

        var doneCount = 0;

        function tick() {
          doneCount++;

          if (doneCount == count) {
            onComplete();
          }
        } // bind callback


        items.forEach(function (item) {
          item.once(eventName, tick);
        });
      };
      /**
       * emits events via EvEmitter and jQuery events
       * @param {String} type - name of event
       * @param {Event} event - original event
       * @param {Array} args - extra arguments
       */


      proto.dispatchEvent = function (type, event, args) {
        // add original event to arguments
        var emitArgs = event ? [event].concat(args) : args;
        this.emitEvent(type, emitArgs);

        if (jQuery) {
          // set this.$element
          this.$element = this.$element || jQuery(this.element);

          if (event) {
            // create jQuery event
            var $event = jQuery.Event(event);
            $event.type = type;
            this.$element.trigger($event, args);
          } else {
            // just trigger with type if no event available
            this.$element.trigger(type, args);
          }
        }
      }; // -------------------------- ignore & stamps -------------------------- //

      /**
       * keep item in collection, but do not lay it out
       * ignored items do not get skipped in layout
       * @param {Element} elem
       */


      proto.ignore = function (elem) {
        var item = this.getItem(elem);

        if (item) {
          item.isIgnored = true;
        }
      };
      /**
       * return item to layout collection
       * @param {Element} elem
       */


      proto.unignore = function (elem) {
        var item = this.getItem(elem);

        if (item) {
          delete item.isIgnored;
        }
      };
      /**
       * adds elements to stamps
       * @param {NodeList, Array, Element, or String} elems
       */


      proto.stamp = function (elems) {
        elems = this._find(elems);

        if (!elems) {
          return;
        }

        this.stamps = this.stamps.concat(elems); // ignore

        elems.forEach(this.ignore, this);
      };
      /**
       * removes elements to stamps
       * @param {NodeList, Array, or Element} elems
       */


      proto.unstamp = function (elems) {
        elems = this._find(elems);

        if (!elems) {
          return;
        }

        elems.forEach(function (elem) {
          // filter out removed stamp elements
          utils.removeFrom(this.stamps, elem);
          this.unignore(elem);
        }, this);
      };
      /**
       * finds child elements
       * @param {NodeList, Array, Element, or String} elems
       * @returns {Array} elems
       */


      proto._find = function (elems) {
        if (!elems) {
          return;
        } // if string, use argument as selector string


        if (typeof elems == 'string') {
          elems = this.element.querySelectorAll(elems);
        }

        elems = utils.makeArray(elems);
        return elems;
      };

      proto._manageStamps = function () {
        if (!this.stamps || !this.stamps.length) {
          return;
        }

        this._getBoundingRect();

        this.stamps.forEach(this._manageStamp, this);
      }; // update boundingLeft / Top


      proto._getBoundingRect = function () {
        // get bounding rect for container element
        var boundingRect = this.element.getBoundingClientRect();
        var size = this.size;
        this._boundingRect = {
          left: boundingRect.left + size.paddingLeft + size.borderLeftWidth,
          top: boundingRect.top + size.paddingTop + size.borderTopWidth,
          right: boundingRect.right - (size.paddingRight + size.borderRightWidth),
          bottom: boundingRect.bottom - (size.paddingBottom + size.borderBottomWidth)
        };
      };
      /**
       * @param {Element} stamp
      **/


      proto._manageStamp = noop;
      /**
       * get x/y position of element relative to container element
       * @param {Element} elem
       * @returns {Object} offset - has left, top, right, bottom
       */

      proto._getElementOffset = function (elem) {
        var boundingRect = elem.getBoundingClientRect();
        var thisRect = this._boundingRect;
        var size = getSize(elem);
        var offset = {
          left: boundingRect.left - thisRect.left - size.marginLeft,
          top: boundingRect.top - thisRect.top - size.marginTop,
          right: thisRect.right - boundingRect.right - size.marginRight,
          bottom: thisRect.bottom - boundingRect.bottom - size.marginBottom
        };
        return offset;
      }; // -------------------------- resize -------------------------- //
      // enable event handlers for listeners
      // i.e. resize -> onresize


      proto.handleEvent = utils.handleEvent;
      /**
       * Bind layout to window resizing
       */

      proto.bindResize = function () {
        window.addEventListener('resize', this);
        this.isResizeBound = true;
      };
      /**
       * Unbind layout to window resizing
       */


      proto.unbindResize = function () {
        window.removeEventListener('resize', this);
        this.isResizeBound = false;
      };

      proto.onresize = function () {
        this.resize();
      };

      utils.debounceMethod(Outlayer, 'onresize', 100);

      proto.resize = function () {
        // don't trigger if size did not change
        // or if resize was unbound. See #9
        if (!this.isResizeBound || !this.needsResizeLayout()) {
          return;
        }

        this.layout();
      };
      /**
       * check if layout is needed post layout
       * @returns Boolean
       */


      proto.needsResizeLayout = function () {
        var size = getSize(this.element); // check that this.size and size are there
        // IE8 triggers resize on body size change, so they might not be

        var hasSizes = this.size && size;
        return hasSizes && size.innerWidth !== this.size.innerWidth;
      }; // -------------------------- methods -------------------------- //

      /**
       * add items to Outlayer instance
       * @param {Array or NodeList or Element} elems
       * @returns {Array} items - Outlayer.Items
      **/


      proto.addItems = function (elems) {
        var items = this._itemize(elems); // add items to collection


        if (items.length) {
          this.items = this.items.concat(items);
        }

        return items;
      };
      /**
       * Layout newly-appended item elements
       * @param {Array or NodeList or Element} elems
       */


      proto.appended = function (elems) {
        var items = this.addItems(elems);

        if (!items.length) {
          return;
        } // layout and reveal just the new items


        this.layoutItems(items, true);
        this.reveal(items);
      };
      /**
       * Layout prepended elements
       * @param {Array or NodeList or Element} elems
       */


      proto.prepended = function (elems) {
        var items = this._itemize(elems);

        if (!items.length) {
          return;
        } // add items to beginning of collection


        var previousItems = this.items.slice(0);
        this.items = items.concat(previousItems); // start new layout

        this._resetLayout();

        this._manageStamps(); // layout new stuff without transition


        this.layoutItems(items, true);
        this.reveal(items); // layout previous items

        this.layoutItems(previousItems);
      };
      /**
       * reveal a collection of items
       * @param {Array of Outlayer.Items} items
       */


      proto.reveal = function (items) {
        this._emitCompleteOnItems('reveal', items);

        if (!items || !items.length) {
          return;
        }

        var stagger = this.updateStagger();
        items.forEach(function (item, i) {
          item.stagger(i * stagger);
          item.reveal();
        });
      };
      /**
       * hide a collection of items
       * @param {Array of Outlayer.Items} items
       */


      proto.hide = function (items) {
        this._emitCompleteOnItems('hide', items);

        if (!items || !items.length) {
          return;
        }

        var stagger = this.updateStagger();
        items.forEach(function (item, i) {
          item.stagger(i * stagger);
          item.hide();
        });
      };
      /**
       * reveal item elements
       * @param {Array}, {Element}, {NodeList} items
       */


      proto.revealItemElements = function (elems) {
        var items = this.getItems(elems);
        this.reveal(items);
      };
      /**
       * hide item elements
       * @param {Array}, {Element}, {NodeList} items
       */


      proto.hideItemElements = function (elems) {
        var items = this.getItems(elems);
        this.hide(items);
      };
      /**
       * get Outlayer.Item, given an Element
       * @param {Element} elem
       * @param {Function} callback
       * @returns {Outlayer.Item} item
       */


      proto.getItem = function (elem) {
        // loop through items to get the one that matches
        for (var i = 0; i < this.items.length; i++) {
          var item = this.items[i];

          if (item.element == elem) {
            // return item
            return item;
          }
        }
      };
      /**
       * get collection of Outlayer.Items, given Elements
       * @param {Array} elems
       * @returns {Array} items - Outlayer.Items
       */


      proto.getItems = function (elems) {
        elems = utils.makeArray(elems);
        var items = [];
        elems.forEach(function (elem) {
          var item = this.getItem(elem);

          if (item) {
            items.push(item);
          }
        }, this);
        return items;
      };
      /**
       * remove element(s) from instance and DOM
       * @param {Array or NodeList or Element} elems
       */


      proto.remove = function (elems) {
        var removeItems = this.getItems(elems);

        this._emitCompleteOnItems('remove', removeItems); // bail if no items to remove


        if (!removeItems || !removeItems.length) {
          return;
        }

        removeItems.forEach(function (item) {
          item.remove(); // remove item from collection

          utils.removeFrom(this.items, item);
        }, this);
      }; // ----- destroy ----- //
      // remove and disable Outlayer instance


      proto.destroy = function () {
        // clean up dynamic styles
        var style = this.element.style;
        style.height = '';
        style.position = '';
        style.width = ''; // destroy items

        this.items.forEach(function (item) {
          item.destroy();
        });
        this.unbindResize();
        var id = this.element.outlayerGUID;
        delete instances[id]; // remove reference to instance by id

        delete this.element.outlayerGUID; // remove data for jQuery

        if (jQuery) {
          jQuery.removeData(this.element, this.constructor.namespace);
        }
      }; // -------------------------- data -------------------------- //

      /**
       * get Outlayer instance from element
       * @param {Element} elem
       * @returns {Outlayer}
       */


      Outlayer.data = function (elem) {
        elem = utils.getQueryElement(elem);
        var id = elem && elem.outlayerGUID;
        return id && instances[id];
      }; // -------------------------- create Outlayer class -------------------------- //

      /**
       * create a layout class
       * @param {String} namespace
       */


      Outlayer.create = function (namespace, options) {
        // sub-class Outlayer
        var Layout = subclass(Outlayer); // apply new options and compatOptions

        Layout.defaults = utils.extend({}, Outlayer.defaults);
        utils.extend(Layout.defaults, options);
        Layout.compatOptions = utils.extend({}, Outlayer.compatOptions);
        Layout.namespace = namespace;
        Layout.data = Outlayer.data; // sub-class Item

        Layout.Item = subclass(Item); // -------------------------- declarative -------------------------- //

        utils.htmlInit(Layout, namespace); // -------------------------- jQuery bridge -------------------------- //
        // make into jQuery plugin

        if (jQuery && jQuery.bridget) {
          jQuery.bridget(namespace, Layout);
        }

        return Layout;
      };

      function subclass(Parent) {
        function SubClass() {
          Parent.apply(this, arguments);
        }

        SubClass.prototype = Object.create(Parent.prototype);
        SubClass.prototype.constructor = SubClass;
        return SubClass;
      } // ----- helpers ----- //
      // how many milliseconds are in each unit


      var msUnits = {
        ms: 1,
        s: 1000
      }; // munge time-like parameter into millisecond number
      // '0.4s' -> 40

      function getMilliseconds(time) {
        if (typeof time == 'number') {
          return time;
        }

        var matches = time.match(/(^\d*\.?\d*)(\w*)/);
        var num = matches && matches[1];
        var unit = matches && matches[2];

        if (!num.length) {
          return 0;
        }

        num = parseFloat(num);
        var mult = msUnits[unit] || 1;
        return num * mult;
      } // ----- fin ----- //
      // back in global


      Outlayer.Item = Item;
      return Outlayer;
    });
  });
  var masonry = createCommonjsModule(function (module) {
    /*!
     * Masonry v4.2.2
     * Cascading grid layout library
     * https://masonry.desandro.com
     * MIT License
     * by David DeSandro
     */
    (function (window, factory) {
      // universal module definition

      /* jshint strict: false */

      /*globals define, module, require */
      if (module.exports) {
        // CommonJS
        module.exports = factory(outlayer, getSize);
      } else {
        // browser global
        window.Masonry = factory(window.Outlayer, window.getSize);
      }
    })(window, function factory(Outlayer, getSize) {
      // -------------------------- masonryDefinition -------------------------- //
      // create an Outlayer layout class
      var Masonry = Outlayer.create('masonry'); // isFitWidth -> fitWidth

      Masonry.compatOptions.fitWidth = 'isFitWidth';
      var proto = Masonry.prototype;

      proto._resetLayout = function () {
        this.getSize();

        this._getMeasurement('columnWidth', 'outerWidth');

        this._getMeasurement('gutter', 'outerWidth');

        this.measureColumns(); // reset column Y

        this.colYs = [];

        for (var i = 0; i < this.cols; i++) {
          this.colYs.push(0);
        }

        this.maxY = 0;
        this.horizontalColIndex = 0;
      };

      proto.measureColumns = function () {
        this.getContainerWidth(); // if columnWidth is 0, default to outerWidth of first item

        if (!this.columnWidth) {
          var firstItem = this.items[0];
          var firstItemElem = firstItem && firstItem.element; // columnWidth fall back to item of first element

          this.columnWidth = firstItemElem && getSize(firstItemElem).outerWidth || // if first elem has no width, default to size of container
          this.containerWidth;
        }

        var columnWidth = this.columnWidth += this.gutter; // calculate columns

        var containerWidth = this.containerWidth + this.gutter;
        var cols = containerWidth / columnWidth; // fix rounding errors, typically with gutters

        var excess = columnWidth - containerWidth % columnWidth; // if overshoot is less than a pixel, round up, otherwise floor it

        var mathMethod = excess && excess < 1 ? 'round' : 'floor';
        cols = Math[mathMethod](cols);
        this.cols = Math.max(cols, 1);
      };

      proto.getContainerWidth = function () {
        // container is parent if fit width
        var isFitWidth = this._getOption('fitWidth');

        var container = isFitWidth ? this.element.parentNode : this.element; // check that this.size and size are there
        // IE8 triggers resize on body size change, so they might not be

        var size = getSize(container);
        this.containerWidth = size && size.innerWidth;
      };

      proto._getItemLayoutPosition = function (item) {
        item.getSize(); // how many columns does this brick span

        var remainder = item.size.outerWidth % this.columnWidth;
        var mathMethod = remainder && remainder < 1 ? 'round' : 'ceil'; // round if off by 1 pixel, otherwise use ceil

        var colSpan = Math[mathMethod](item.size.outerWidth / this.columnWidth);
        colSpan = Math.min(colSpan, this.cols); // use horizontal or top column position

        var colPosMethod = this.options.horizontalOrder ? '_getHorizontalColPosition' : '_getTopColPosition';
        var colPosition = this[colPosMethod](colSpan, item); // position the brick

        var position = {
          x: this.columnWidth * colPosition.col,
          y: colPosition.y
        }; // apply setHeight to necessary columns

        var setHeight = colPosition.y + item.size.outerHeight;
        var setMax = colSpan + colPosition.col;

        for (var i = colPosition.col; i < setMax; i++) {
          this.colYs[i] = setHeight;
        }

        return position;
      };

      proto._getTopColPosition = function (colSpan) {
        var colGroup = this._getTopColGroup(colSpan); // get the minimum Y value from the columns


        var minimumY = Math.min.apply(Math, colGroup);
        return {
          col: colGroup.indexOf(minimumY),
          y: minimumY
        };
      };
      /**
       * @param {Number} colSpan - number of columns the element spans
       * @returns {Array} colGroup
       */


      proto._getTopColGroup = function (colSpan) {
        if (colSpan < 2) {
          // if brick spans only one column, use all the column Ys
          return this.colYs;
        }

        var colGroup = []; // how many different places could this brick fit horizontally

        var groupCount = this.cols + 1 - colSpan; // for each group potential horizontal position

        for (var i = 0; i < groupCount; i++) {
          colGroup[i] = this._getColGroupY(i, colSpan);
        }

        return colGroup;
      };

      proto._getColGroupY = function (col, colSpan) {
        if (colSpan < 2) {
          return this.colYs[col];
        } // make an array of colY values for that one group


        var groupColYs = this.colYs.slice(col, col + colSpan); // and get the max value of the array

        return Math.max.apply(Math, groupColYs);
      }; // get column position based on horizontal index. #873


      proto._getHorizontalColPosition = function (colSpan, item) {
        var col = this.horizontalColIndex % this.cols;
        var isOver = colSpan > 1 && col + colSpan > this.cols; // shift to next row if item can't fit on current row

        col = isOver ? 0 : col; // don't let zero-size items take up space

        var hasSize = item.size.outerWidth && item.size.outerHeight;
        this.horizontalColIndex = hasSize ? col + colSpan : this.horizontalColIndex;
        return {
          col: col,
          y: this._getColGroupY(col, colSpan)
        };
      };

      proto._manageStamp = function (stamp) {
        var stampSize = getSize(stamp);

        var offset = this._getElementOffset(stamp); // get the columns that this stamp affects


        var isOriginLeft = this._getOption('originLeft');

        var firstX = isOriginLeft ? offset.left : offset.right;
        var lastX = firstX + stampSize.outerWidth;
        var firstCol = Math.floor(firstX / this.columnWidth);
        firstCol = Math.max(0, firstCol);
        var lastCol = Math.floor(lastX / this.columnWidth); // lastCol should not go over if multiple of columnWidth #425

        lastCol -= lastX % this.columnWidth ? 0 : 1;
        lastCol = Math.min(this.cols - 1, lastCol); // set colYs to bottom of the stamp

        var isOriginTop = this._getOption('originTop');

        var stampMaxY = (isOriginTop ? offset.top : offset.bottom) + stampSize.outerHeight;

        for (var i = firstCol; i <= lastCol; i++) {
          this.colYs[i] = Math.max(stampMaxY, this.colYs[i]);
        }
      };

      proto._getContainerSize = function () {
        this.maxY = Math.max.apply(Math, this.colYs);
        var size = {
          height: this.maxY
        };

        if (this._getOption('fitWidth')) {
          size.width = this._getContainerFitWidth();
        }

        return size;
      };

      proto._getContainerFitWidth = function () {
        var unusedCols = 0; // count unused columns

        var i = this.cols;

        while (--i) {
          if (this.colYs[i] !== 0) {
            break;
          }

          unusedCols++;
        } // fit container to columns that have been used


        return (this.cols - unusedCols) * this.columnWidth - this.gutter;
      };

      proto.needsResizeLayout = function () {
        var previousWidth = this.containerWidth;
        this.getContainerWidth();
        return previousWidth != this.containerWidth;
      };

      return Masonry;
    });
  });
  /* src/Masonry.html generated by Svelte v3.20.1 */

  function get_each_context$8(ctx, list, i) {
    var child_ctx = ctx.slice();
    child_ctx[10] = list[i];
    return child_ctx;
  } // (49:0) {#if items && items.length}


  function create_if_block$c(ctx) {
    var div;
    var each_value =
    /*items*/
    ctx[0];
    var each_blocks = [];

    for (var i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block$8(get_each_context$8(ctx, each_value, i));
    }

    return {
      c: function c() {
        div = element("div");

        for (var _i42 = 0; _i42 < each_blocks.length; _i42 += 1) {
          each_blocks[_i42].c();
        }

        attr(div, "class", "svelte-lo0v8p");
        toggle_class(div, "hidden",
        /*loaded*/
        ctx[3] !==
        /*items*/
        ctx[0].length);
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);

        for (var _i43 = 0; _i43 < each_blocks.length; _i43 += 1) {
          each_blocks[_i43].m(div, null);
        }
        /*div_binding*/


        ctx[9](div);
      },
      p: function p(ctx, dirty) {
        if (dirty &
        /*items, captionsOn, loaded*/
        11) {
          each_value =
          /*items*/
          ctx[0];

          var _i44;

          for (_i44 = 0; _i44 < each_value.length; _i44 += 1) {
            var child_ctx = get_each_context$8(ctx, each_value, _i44);

            if (each_blocks[_i44]) {
              each_blocks[_i44].p(child_ctx, dirty);
            } else {
              each_blocks[_i44] = create_each_block$8(child_ctx);

              each_blocks[_i44].c();

              each_blocks[_i44].m(div, null);
            }
          }

          for (; _i44 < each_blocks.length; _i44 += 1) {
            each_blocks[_i44].d(1);
          }

          each_blocks.length = each_value.length;
        }

        if (dirty &
        /*loaded, items*/
        9) {
          toggle_class(div, "hidden",
          /*loaded*/
          ctx[3] !==
          /*items*/
          ctx[0].length);
        }
      },
      d: function d(detaching) {
        if (detaching) detach(div);
        destroy_each(each_blocks, detaching);
        /*div_binding*/

        ctx[9](null);
      }
    };
  } // (55:8) {#if captionsOn}


  function create_if_block_1$8(ctx) {
    var figcaption;
    var t_value =
    /*item*/
    ctx[10].name + "";
    var t;
    return {
      c: function c() {
        figcaption = element("figcaption");
        t = text(t_value);
      },
      m: function m(target, anchor) {
        insert(target, figcaption, anchor);
        append(figcaption, t);
      },
      p: function p(ctx, dirty) {
        if (dirty &
        /*items*/
        1 && t_value !== (t_value =
        /*item*/
        ctx[10].name + "")) set_data(t, t_value);
      },
      d: function d(detaching) {
        if (detaching) detach(figcaption);
      }
    };
  } // (51:4) {#each items as item}


  function create_each_block$8(ctx) {
    var figure;
    var img;
    var img_alt_value;
    var img_src_value;
    var t0;
    var t1;
    var dispose;
    var if_block =
    /*captionsOn*/
    ctx[1] && create_if_block_1$8(ctx);
    return {
      c: function c() {
        figure = element("figure");
        img = element("img");
        t0 = space();
        if (if_block) if_block.c();
        t1 = space();
        attr(img, "alt", img_alt_value =
        /*item*/
        ctx[10].description);
        if (img.src !== (img_src_value =
        /*item*/
        ctx[10].src)) attr(img, "src", img_src_value);
        attr(img, "class", "svelte-lo0v8p");
        attr(figure, "class", "card-image svelte-lo0v8p");
      },
      m: function m(target, anchor, remount) {
        insert(target, figure, anchor);
        append(figure, img);
        append(figure, t0);
        if (if_block) if_block.m(figure, null);
        append(figure, t1);
        if (remount) dispose();
        dispose = listen(img, "load",
        /*load_handler*/
        ctx[8]);
      },
      p: function p(ctx, dirty) {
        if (dirty &
        /*items*/
        1 && img_alt_value !== (img_alt_value =
        /*item*/
        ctx[10].description)) {
          attr(img, "alt", img_alt_value);
        }

        if (dirty &
        /*items*/
        1 && img.src !== (img_src_value =
        /*item*/
        ctx[10].src)) {
          attr(img, "src", img_src_value);
        }

        if (
        /*captionsOn*/
        ctx[1]) {
          if (if_block) {
            if_block.p(ctx, dirty);
          } else {
            if_block = create_if_block_1$8(ctx);
            if_block.c();
            if_block.m(figure, t1);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }
      },
      d: function d(detaching) {
        if (detaching) detach(figure);
        if (if_block) if_block.d();
        dispose();
      }
    };
  }

  function create_fragment$r(ctx) {
    var if_block_anchor;
    var if_block =
    /*items*/
    ctx[0] &&
    /*items*/
    ctx[0].length && create_if_block$c(ctx);
    return {
      c: function c() {
        if (if_block) if_block.c();
        if_block_anchor = empty();
      },
      m: function m(target, anchor) {
        if (if_block) if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
      },
      p: function p(ctx, _ref68) {
        var _ref69 = _slicedToArray(_ref68, 1),
            dirty = _ref69[0];

        if (
        /*items*/
        ctx[0] &&
        /*items*/
        ctx[0].length) {
          if (if_block) {
            if_block.p(ctx, dirty);
          } else {
            if_block = create_if_block$c(ctx);
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
        if (if_block) if_block.d(detaching);
        if (detaching) detach(if_block_anchor);
      }
    };
  }

  function instance$r($$self, $$props, $$invalidate) {
    var items = $$props.items;
    var _$$props$columnWidth = $$props.columnWidth,
        columnWidth = _$$props$columnWidth === void 0 ? 300 : _$$props$columnWidth;
    var _$$props$captionsOn = $$props.captionsOn,
        captionsOn = _$$props$captionsOn === void 0 ? false : _$$props$captionsOn;
    var masonry$1;
    var masonryElm;
    var mounted = false;
    var loaded = 0;

    function loadedInc() {
      $$invalidate(3, loaded++, loaded);
    }

    onMount(function () {
      $$invalidate(6, mounted = true);
    });

    var load_handler = function load_handler(e) {
      $$invalidate(3, loaded++, loaded);
    };

    function div_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](function () {
        $$invalidate(2, masonryElm = $$value);
      });
    }

    $$self.$set = function ($$props) {
      if ("items" in $$props) $$invalidate(0, items = $$props.items);
      if ("columnWidth" in $$props) $$invalidate(4, columnWidth = $$props.columnWidth);
      if ("captionsOn" in $$props) $$invalidate(1, captionsOn = $$props.captionsOn);
    };

    $$self.$$.update = function () {
      if ($$self.$$.dirty &
      /*masonryElm, mounted, items, loaded, columnWidth*/
      93) {
        if (masonryElm && mounted && items && loaded === items.length) {
          masonry$1 = new masonry(masonryElm, {
            itemSelector: ".card-image",
            columnWidth: columnWidth,
            fitWidth: true,
            resize: true
          });
        }
      }
    };

    return [items, captionsOn, masonryElm, loaded, columnWidth, masonry$1, mounted, loadedInc, load_handler, div_binding];
  }

  var Masonry_1 = /*#__PURE__*/function (_SvelteComponent26) {
    _inherits(Masonry_1, _SvelteComponent26);

    var _super29 = _createSuper(Masonry_1);

    function Masonry_1(options) {
      var _this30;

      _classCallCheck(this, Masonry_1);

      _this30 = _super29.call(this);
      init(_assertThisInitialized(_this30), options, instance$r, create_fragment$r, safe_not_equal, {
        items: 0,
        columnWidth: 4,
        captionsOn: 1
      });
      return _this30;
    }

    return Masonry_1;
  }(SvelteComponent);
  /* src/Profile.html generated by Svelte v3.20.1 */


  function get_each_context$9(ctx, list, i) {
    var child_ctx = ctx.slice();
    child_ctx[12] = list[i];
    return child_ctx;
  }

  function get_each_context_1$1(ctx, list, i) {
    var child_ctx = ctx.slice();
    child_ctx[15] = list[i];
    return child_ctx;
  } // (66:0) {#if requests}


  function create_if_block$d(ctx) {
    var await_block_anchor;
    var promise;
    var current;
    var info = {
      ctx: ctx,
      current: null,
      token: null,
      pending: create_pending_block$a,
      then: create_then_block$a,
      "catch": create_catch_block_1$1,
      value: 9,
      error: 10,
      blocks: [,,,]
    };
    handle_promise(promise =
    /*requests*/
    ctx[2], info);
    return {
      c: function c() {
        await_block_anchor = empty();
        info.block.c();
      },
      m: function m(target, anchor) {
        insert(target, await_block_anchor, anchor);
        info.block.m(target, info.anchor = anchor);

        info.mount = function () {
          return await_block_anchor.parentNode;
        };

        info.anchor = await_block_anchor;
        current = true;
      },
      p: function p(new_ctx, dirty) {
        ctx = new_ctx;
        info.ctx = ctx;
        if (dirty &
        /*requests*/
        4 && promise !== (promise =
        /*requests*/
        ctx[2]) && handle_promise(promise, info)) ;else {
          var child_ctx = ctx.slice();
          child_ctx[9] = info.resolved;
          info.block.p(child_ctx, dirty);
        }
      },
      i: function i(local) {
        if (current) return;
        transition_in(info.block);
        current = true;
      },
      o: function o(local) {
        for (var i = 0; i < 3; i += 1) {
          var _block10 = info.blocks[i];
          transition_out(_block10);
        }

        current = false;
      },
      d: function d(detaching) {
        if (detaching) detach(await_block_anchor);
        info.block.d(detaching);
        info.token = null;
        info = null;
      }
    };
  } // (105:0) {:catch err}


  function create_catch_block_1$1(ctx) {
    var div;
    var t0;
    var p;
    var t1;
    var t2_value =
    /*err*/
    ctx[10].message + "";
    var t2;
    var current;
    var alert = new Alert({
      props: {
        color: "#F80",
        size:
        /*iconSize*/
        ctx[1]
      }
    });
    return {
      c: function c() {
        div = element("div");
        create_component(alert.$$.fragment);
        t0 = space();
        p = element("p");
        t1 = text("Error: ");
        t2 = text(t2_value);
        attr(div, "class", "error svelte-14w7hiz");
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
        mount_component(alert, div, null);
        append(div, t0);
        append(div, p);
        append(p, t1);
        append(p, t2);
        current = true;
      },
      p: function p(ctx, dirty) {
        var alert_changes = {};
        if (dirty &
        /*iconSize*/
        2) alert_changes.size =
        /*iconSize*/
        ctx[1];
        alert.$set(alert_changes);
        if ((!current || dirty &
        /*requests*/
        4) && t2_value !== (t2_value =
        /*err*/
        ctx[10].message + "")) set_data(t2, t2_value);
      },
      i: function i(local) {
        if (current) return;
        transition_in(alert.$$.fragment, local);
        current = true;
      },
      o: function o(local) {
        transition_out(alert.$$.fragment, local);
        current = false;
      },
      d: function d(detaching) {
        if (detaching) detach(div);
        destroy_component(alert);
      }
    };
  } // (69:0) {:then [galleries,posts]}


  function create_then_block$a(ctx) {
    var _ctx$ = _slicedToArray(ctx[9], 2);

    ctx[7] = _ctx$[0];
    ctx[8] = _ctx$[1];
    var div1;
    var div0;
    var t0;
    var t1;
    var current;
    var if_block0 =
    /*galleries*/
    ctx[7].length > 0 && create_if_block_3$3(ctx);
    var if_block1 =
    /*posts*/
    ctx[8].length > 0 && create_if_block_2$3(ctx);
    var if_block2 =
    /*galleryRequest*/
    ctx[3] && create_if_block_1$9(ctx);
    return {
      c: function c() {
        div1 = element("div");
        div0 = element("div");
        if (if_block0) if_block0.c();
        t0 = space();
        if (if_block1) if_block1.c();
        t1 = space();
        if (if_block2) if_block2.c();
        attr(div0, "class", "left-sidebar svelte-14w7hiz");
        attr(div1, "class", "profile-main svelte-14w7hiz");
      },
      m: function m(target, anchor) {
        insert(target, div1, anchor);
        append(div1, div0);
        if (if_block0) if_block0.m(div0, null);
        append(div0, t0);
        if (if_block1) if_block1.m(div0, null);
        append(div1, t1);
        if (if_block2) if_block2.m(div1, null);
        current = true;
      },
      p: function p(ctx, dirty) {
        if (
        /*galleries*/
        ctx[7].length > 0) {
          if (if_block0) {
            if_block0.p(ctx, dirty);
          } else {
            if_block0 = create_if_block_3$3(ctx);
            if_block0.c();
            if_block0.m(div0, t0);
          }
        } else if (if_block0) {
          if_block0.d(1);
          if_block0 = null;
        }

        if (
        /*posts*/
        ctx[8].length > 0) {
          if (if_block1) {
            if_block1.p(ctx, dirty);
          } else {
            if_block1 = create_if_block_2$3(ctx);
            if_block1.c();
            if_block1.m(div0, null);
          }
        } else if (if_block1) {
          if_block1.d(1);
          if_block1 = null;
        }

        if (
        /*galleryRequest*/
        ctx[3]) {
          if (if_block2) {
            if_block2.p(ctx, dirty);
            transition_in(if_block2, 1);
          } else {
            if_block2 = create_if_block_1$9(ctx);
            if_block2.c();
            transition_in(if_block2, 1);
            if_block2.m(div1, null);
          }
        } else if (if_block2) {
          group_outros();
          transition_out(if_block2, 1, 1, function () {
            if_block2 = null;
          });
          check_outros();
        }

        var _ctx$2 = _slicedToArray(ctx[9], 2);

        ctx[7] = _ctx$2[0];
        ctx[8] = _ctx$2[1];
      },
      i: function i(local) {
        if (current) return;
        transition_in(if_block2);
        current = true;
      },
      o: function o(local) {
        transition_out(if_block2);
        current = false;
      },
      d: function d(detaching) {
        if (detaching) detach(div1);
        if (if_block0) if_block0.d();
        if (if_block1) if_block1.d();
        if (if_block2) if_block2.d();
      }
    };
  } // (72:8) {#if galleries.length > 0}


  function create_if_block_3$3(ctx) {
    var h3;
    var t1;
    var ul;
    var each_value_1 =
    /*galleries*/
    ctx[7];
    var each_blocks = [];

    for (var i = 0; i < each_value_1.length; i += 1) {
      each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    }

    return {
      c: function c() {
        h3 = element("h3");
        h3.textContent = "Galleries";
        t1 = space();
        ul = element("ul");

        for (var _i45 = 0; _i45 < each_blocks.length; _i45 += 1) {
          each_blocks[_i45].c();
        }
      },
      m: function m(target, anchor) {
        insert(target, h3, anchor);
        insert(target, t1, anchor);
        insert(target, ul, anchor);

        for (var _i46 = 0; _i46 < each_blocks.length; _i46 += 1) {
          each_blocks[_i46].m(ul, null);
        }
      },
      p: function p(ctx, dirty) {
        if (dirty &
        /*handle, requests*/
        5) {
          each_value_1 =
          /*galleries*/
          ctx[7];

          var _i47;

          for (_i47 = 0; _i47 < each_value_1.length; _i47 += 1) {
            var child_ctx = get_each_context_1$1(ctx, each_value_1, _i47);

            if (each_blocks[_i47]) {
              each_blocks[_i47].p(child_ctx, dirty);
            } else {
              each_blocks[_i47] = create_each_block_1$1(child_ctx);

              each_blocks[_i47].c();

              each_blocks[_i47].m(ul, null);
            }
          }

          for (; _i47 < each_blocks.length; _i47 += 1) {
            each_blocks[_i47].d(1);
          }

          each_blocks.length = each_value_1.length;
        }
      },
      d: function d(detaching) {
        if (detaching) detach(h3);
        if (detaching) detach(t1);
        if (detaching) detach(ul);
        destroy_each(each_blocks, detaching);
      }
    };
  } // (75:12) {#each galleries as gallery}


  function create_each_block_1$1(ctx) {
    var li;
    var a;
    var t_value =
    /*gallery*/
    ctx[15][1].name + "";
    var t;
    var a_href_value;
    return {
      c: function c() {
        li = element("li");
        a = element("a");
        t = text(t_value);
        attr(a, "href", a_href_value = "/u/" +
        /*handle*/
        ctx[0] + "/galleries/" +
        /*gallery*/
        ctx[15][0].url);
      },
      m: function m(target, anchor) {
        insert(target, li, anchor);
        append(li, a);
        append(a, t);
      },
      p: function p(ctx, dirty) {
        if (dirty &
        /*requests*/
        4 && t_value !== (t_value =
        /*gallery*/
        ctx[15][1].name + "")) set_data(t, t_value);

        if (dirty &
        /*handle, requests*/
        5 && a_href_value !== (a_href_value = "/u/" +
        /*handle*/
        ctx[0] + "/galleries/" +
        /*gallery*/
        ctx[15][0].url)) {
          attr(a, "href", a_href_value);
        }
      },
      d: function d(detaching) {
        if (detaching) detach(li);
      }
    };
  } // (80:8) {#if posts.length > 0}


  function create_if_block_2$3(ctx) {
    var h3;
    var t1;
    var ul;
    var each_value =
    /*posts*/
    ctx[8];
    var each_blocks = [];

    for (var i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block$9(get_each_context$9(ctx, each_value, i));
    }

    return {
      c: function c() {
        h3 = element("h3");
        h3.textContent = "Posts";
        t1 = space();
        ul = element("ul");

        for (var _i48 = 0; _i48 < each_blocks.length; _i48 += 1) {
          each_blocks[_i48].c();
        }
      },
      m: function m(target, anchor) {
        insert(target, h3, anchor);
        insert(target, t1, anchor);
        insert(target, ul, anchor);

        for (var _i49 = 0; _i49 < each_blocks.length; _i49 += 1) {
          each_blocks[_i49].m(ul, null);
        }
      },
      p: function p(ctx, dirty) {
        if (dirty &
        /*handle, requests*/
        5) {
          each_value =
          /*posts*/
          ctx[8];

          var _i50;

          for (_i50 = 0; _i50 < each_value.length; _i50 += 1) {
            var child_ctx = get_each_context$9(ctx, each_value, _i50);

            if (each_blocks[_i50]) {
              each_blocks[_i50].p(child_ctx, dirty);
            } else {
              each_blocks[_i50] = create_each_block$9(child_ctx);

              each_blocks[_i50].c();

              each_blocks[_i50].m(ul, null);
            }
          }

          for (; _i50 < each_blocks.length; _i50 += 1) {
            each_blocks[_i50].d(1);
          }

          each_blocks.length = each_value.length;
        }
      },
      d: function d(detaching) {
        if (detaching) detach(h3);
        if (detaching) detach(t1);
        if (detaching) detach(ul);
        destroy_each(each_blocks, detaching);
      }
    };
  } // (83:12) {#each posts as post}


  function create_each_block$9(ctx) {
    var li;
    var a;
    var t_value =
    /*post*/
    ctx[12][1].title + "";
    var t;
    var a_href_value;
    return {
      c: function c() {
        li = element("li");
        a = element("a");
        t = text(t_value);
        attr(a, "href", a_href_value = "/u/" +
        /*handle*/
        ctx[0] + "/posts/" +
        /*post*/
        ctx[12][0].url);
      },
      m: function m(target, anchor) {
        insert(target, li, anchor);
        append(li, a);
        append(a, t);
      },
      p: function p(ctx, dirty) {
        if (dirty &
        /*requests*/
        4 && t_value !== (t_value =
        /*post*/
        ctx[12][1].title + "")) set_data(t, t_value);

        if (dirty &
        /*handle, requests*/
        5 && a_href_value !== (a_href_value = "/u/" +
        /*handle*/
        ctx[0] + "/posts/" +
        /*post*/
        ctx[12][0].url)) {
          attr(a, "href", a_href_value);
        }
      },
      d: function d(detaching) {
        if (detaching) detach(li);
      }
    };
  } // (89:4) {#if galleryRequest}


  function create_if_block_1$9(ctx) {
    var div;
    var promise;
    var current;
    var info = {
      ctx: ctx,
      current: null,
      token: null,
      pending: create_pending_block_1$1,
      then: create_then_block_1$1,
      "catch": create_catch_block$a,
      value: 11,
      error: 10,
      blocks: [,,,]
    };
    handle_promise(promise =
    /*galleryRequest*/
    ctx[3], info);
    return {
      c: function c() {
        div = element("div");
        info.block.c();
        attr(div, "class", "first-gallery svelte-14w7hiz");
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
        info.block.m(div, info.anchor = null);

        info.mount = function () {
          return div;
        };

        info.anchor = null;
        current = true;
      },
      p: function p(new_ctx, dirty) {
        ctx = new_ctx;
        info.ctx = ctx;
        if (dirty &
        /*galleryRequest*/
        8 && promise !== (promise =
        /*galleryRequest*/
        ctx[3]) && handle_promise(promise, info)) ;else {
          var child_ctx = ctx.slice();
          child_ctx[11] = info.resolved;
          info.block.p(child_ctx, dirty);
        }
      },
      i: function i(local) {
        if (current) return;
        transition_in(info.block);
        current = true;
      },
      o: function o(local) {
        for (var i = 0; i < 3; i += 1) {
          var _block11 = info.blocks[i];
          transition_out(_block11);
        }

        current = false;
      },
      d: function d(detaching) {
        if (detaching) detach(div);
        info.block.d();
        info.token = null;
        info = null;
      }
    };
  } // (96:8) {:catch err}


  function create_catch_block$a(ctx) {
    var div;
    var t0;
    var p;
    var t1;
    var t2_value =
    /*err*/
    ctx[10].message + "";
    var t2;
    var current;
    var alert = new Alert({
      props: {
        color: "#F80",
        size:
        /*iconSize*/
        ctx[1]
      }
    });
    return {
      c: function c() {
        div = element("div");
        create_component(alert.$$.fragment);
        t0 = space();
        p = element("p");
        t1 = text("Error: ");
        t2 = text(t2_value);
        attr(div, "class", "error svelte-14w7hiz");
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
        mount_component(alert, div, null);
        append(div, t0);
        append(div, p);
        append(p, t1);
        append(p, t2);
        current = true;
      },
      p: function p(ctx, dirty) {
        var alert_changes = {};
        if (dirty &
        /*iconSize*/
        2) alert_changes.size =
        /*iconSize*/
        ctx[1];
        alert.$set(alert_changes);
        if ((!current || dirty &
        /*galleryRequest*/
        8) && t2_value !== (t2_value =
        /*err*/
        ctx[10].message + "")) set_data(t2, t2_value);
      },
      i: function i(local) {
        if (current) return;
        transition_in(alert.$$.fragment, local);
        current = true;
      },
      o: function o(local) {
        transition_out(alert.$$.fragment, local);
        current = false;
      },
      d: function d(detaching) {
        if (detaching) detach(div);
        destroy_component(alert);
      }
    };
  } // (93:8) {:then items}


  function create_then_block_1$1(ctx) {
    var h2;
    var t0_value =
    /*firstGallery*/
    ctx[4][1].name + "";
    var t0;
    var t1;
    var current;
    var masonry = new Masonry_1({
      props: {
        items:
        /*masonryItems*/
        ctx[5](
        /*items*/
        ctx[11])
      }
    });
    return {
      c: function c() {
        h2 = element("h2");
        t0 = text(t0_value);
        t1 = space();
        create_component(masonry.$$.fragment);
      },
      m: function m(target, anchor) {
        insert(target, h2, anchor);
        append(h2, t0);
        insert(target, t1, anchor);
        mount_component(masonry, target, anchor);
        current = true;
      },
      p: function p(ctx, dirty) {
        if ((!current || dirty &
        /*firstGallery*/
        16) && t0_value !== (t0_value =
        /*firstGallery*/
        ctx[4][1].name + "")) set_data(t0, t0_value);
        var masonry_changes = {};
        if (dirty &
        /*galleryRequest*/
        8) masonry_changes.items =
        /*masonryItems*/
        ctx[5](
        /*items*/
        ctx[11]);
        masonry.$set(masonry_changes);
      },
      i: function i(local) {
        if (current) return;
        transition_in(masonry.$$.fragment, local);
        current = true;
      },
      o: function o(local) {
        transition_out(masonry.$$.fragment, local);
        current = false;
      },
      d: function d(detaching) {
        if (detaching) detach(h2);
        if (detaching) detach(t1);
        destroy_component(masonry, detaching);
      }
    };
  } // (91:31)          <Circle color="var(--accent-color-1)" size={iconSize}


  function create_pending_block_1$1(ctx) {
    var current;
    var circle = new Circle({
      props: {
        color: "var(--accent-color-1)",
        size:
        /*iconSize*/
        ctx[1]
      }
    });
    return {
      c: function c() {
        create_component(circle.$$.fragment);
      },
      m: function m(target, anchor) {
        mount_component(circle, target, anchor);
        current = true;
      },
      p: function p(ctx, dirty) {
        var circle_changes = {};
        if (dirty &
        /*iconSize*/
        2) circle_changes.size =
        /*iconSize*/
        ctx[1];
        circle.$set(circle_changes);
      },
      i: function i(local) {
        if (current) return;
        transition_in(circle.$$.fragment, local);
        current = true;
      },
      o: function o(local) {
        transition_out(circle.$$.fragment, local);
        current = false;
      },
      d: function d(detaching) {
        destroy_component(circle, detaching);
      }
    };
  } // (67:17)  <Circle color="var(--accent-color-1)" size={iconSize}


  function create_pending_block$a(ctx) {
    var current;
    var circle = new Circle({
      props: {
        color: "var(--accent-color-1)",
        size:
        /*iconSize*/
        ctx[1]
      }
    });
    return {
      c: function c() {
        create_component(circle.$$.fragment);
      },
      m: function m(target, anchor) {
        mount_component(circle, target, anchor);
        current = true;
      },
      p: function p(ctx, dirty) {
        var circle_changes = {};
        if (dirty &
        /*iconSize*/
        2) circle_changes.size =
        /*iconSize*/
        ctx[1];
        circle.$set(circle_changes);
      },
      i: function i(local) {
        if (current) return;
        transition_in(circle.$$.fragment, local);
        current = true;
      },
      o: function o(local) {
        transition_out(circle.$$.fragment, local);
        current = false;
      },
      d: function d(detaching) {
        destroy_component(circle, detaching);
      }
    };
  }

  function create_fragment$s(ctx) {
    var if_block_anchor;
    var current;
    var if_block =
    /*requests*/
    ctx[2] && create_if_block$d(ctx);
    return {
      c: function c() {
        if (if_block) if_block.c();
        if_block_anchor = empty();
      },
      m: function m(target, anchor) {
        if (if_block) if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
        current = true;
      },
      p: function p(ctx, _ref70) {
        var _ref71 = _slicedToArray(_ref70, 1),
            dirty = _ref71[0];

        if (
        /*requests*/
        ctx[2]) {
          if (if_block) {
            if_block.p(ctx, dirty);
            transition_in(if_block, 1);
          } else {
            if_block = create_if_block$d(ctx);
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
        if (current) return;
        transition_in(if_block);
        current = true;
      },
      o: function o(local) {
        transition_out(if_block);
        current = false;
      },
      d: function d(detaching) {
        if (if_block) if_block.d(detaching);
        if (detaching) detach(if_block_anchor);
      }
    };
  }

  var api$7 = "/api/v1";

  function instance$s($$self, $$props, $$invalidate) {
    var handle = $$props.handle;
    var _$$props$iconSize5 = $$props.iconSize,
        iconSize = _$$props$iconSize5 === void 0 ? 24 : _$$props$iconSize5;
    var requests;
    var galleryRequest;
    var galleryUrl;
    var firstGallery;

    function masonryItems(items) {
      return items.map(function (item) {
        var name = item[2].name;
        var description = item[2].name;
        var src = "/u/".concat(handle, "/galleries/").concat(galleryUrl, "/items/").concat(item[3].url);
        return {
          name: name,
          description: description,
          src: src
        };
      });
    }

    $$self.$set = function ($$props) {
      if ("handle" in $$props) $$invalidate(0, handle = $$props.handle);
      if ("iconSize" in $$props) $$invalidate(1, iconSize = $$props.iconSize);
    };

    $$self.$$.update = function () {
      if ($$self.$$.dirty &
      /*handle, galleryUrl*/
      65) {
        if (handle) {
          $$invalidate(2, requests = Promise.all([fetch("".concat(api$7, "/u/").concat(handle, "/galleries")).then(function (res) {
            return res.json();
          }), fetch("".concat(api$7, "/u/").concat(handle, "/posts")).then(function (res) {
            return res.json();
          })]).then(function (_ref72) {
            var _ref73 = _slicedToArray(_ref72, 2),
                galleries = _ref73[0],
                posts = _ref73[1];

            var g0s = galleries.filter(function (g0) {
              return g0[0].url;
            });
            var p0s = posts.filter(function (g0) {
              return g0[0].url;
            });

            if (g0s.length > 0) {
              $$invalidate(6, galleryUrl = g0s[0][0].url);
              $$invalidate(4, firstGallery = g0s[0]);
              $$invalidate(3, galleryRequest = fetch("".concat(api$7, "/u/").concat(handle, "/galleries/").concat(galleryUrl, "/items")).then(function (res) {
                return res.json();
              }));
            }

            return [g0s, p0s];
          }));
        }
      }
    };

    return [handle, iconSize, requests, galleryRequest, firstGallery, masonryItems];
  }

  var Profile = /*#__PURE__*/function (_SvelteComponent27) {
    _inherits(Profile, _SvelteComponent27);

    var _super30 = _createSuper(Profile);

    function Profile(options) {
      var _this31;

      _classCallCheck(this, Profile);

      _this31 = _super30.call(this);
      init(_assertThisInitialized(_this31), options, instance$s, create_fragment$s, safe_not_equal, {
        handle: 0,
        iconSize: 1
      });
      return _this31;
    }

    return Profile;
  }(SvelteComponent);

  var main = {
    gallery: function gallery(target, props) {
      return new Gallery({
        target: target,
        props: props
      });
    },
    userGallery: function userGallery(target, props) {
      return new UserGallery({
        target: target,
        props: props
      });
    },
    galleryCreate: function galleryCreate(target, props) {
      return new GalleryCreate({
        target: target,
        props: props
      });
    },
    userGalleryCreate: function userGalleryCreate(target, props) {
      return new UserGalleryCreate({
        target: target,
        props: props
      });
    },
    userGalleryList: function userGalleryList(target, props) {
      return new UserGalleryList({
        target: target,
        props: props
      });
    },
    userGalleryItemList: function userGalleryItemList(target, props) {
      return new UserGalleryItemList({
        target: target,
        props: props
      });
    },
    board: function board(target, props) {
      return new Board({
        target: target,
        props: props
      });
    },
    postMarkdown: function postMarkdown(target, props) {
      return new PostMarkdown({
        target: target,
        props: props
      });
    },
    userPost: function userPost(target, props) {
      return new UserPost({
        target: target,
        props: props
      });
    },
    userPostList: function userPostList(target, props) {
      return new UserPostList({
        target: target,
        props: props
      });
    },
    tags: function tags(target, props) {
      return new Tags({
        target: target,
        props: props
      });
    },
    profile: function profile(target, props) {
      return new Profile({
        target: target,
        props: props
      });
    }
  };
  return main;
}();
