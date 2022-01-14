"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DEFAULT_THRESHOLD_MS = exports.DEFAULT_SET_TIMEOUT = exports.DEFAULT_NOW_FN = exports.DEFAULT_CLEAR_TIMEOUT = exports.DEFAULT_AGGRESSION = void 0;
exports.clearAllDriftless = clearAllDriftless;
exports.clearDriftless = clearDriftless;
exports.debugTimers = debugTimers;
exports.setDriftless = setDriftless;
exports.setDriftlessInterval = setDriftlessInterval;
exports.setDriftlessTimeout = setDriftlessTimeout;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _present = _interopRequireDefault(require("present"));

var DEFAULT_THRESHOLD_MS = 1;
exports.DEFAULT_THRESHOLD_MS = DEFAULT_THRESHOLD_MS;
var DEFAULT_AGGRESSION = 1.1;
exports.DEFAULT_AGGRESSION = DEFAULT_AGGRESSION;

var DEFAULT_NOW_FN = function DEFAULT_NOW_FN() {
  return _present.default.apply(void 0, arguments);
};

exports.DEFAULT_NOW_FN = DEFAULT_NOW_FN;

var DEFAULT_SET_TIMEOUT = function DEFAULT_SET_TIMEOUT() {
  return setTimeout.apply(void 0, arguments);
};

exports.DEFAULT_SET_TIMEOUT = DEFAULT_SET_TIMEOUT;

var DEFAULT_CLEAR_TIMEOUT = function DEFAULT_CLEAR_TIMEOUT() {
  return clearTimeout.apply(void 0, arguments);
};

exports.DEFAULT_CLEAR_TIMEOUT = DEFAULT_CLEAR_TIMEOUT;
var timerHandles = {};
var nextId = 0;

function debugTimers() {
  console.log(timerHandles, Object.keys(timerHandles).length);
}

function tryDriftless(id, opts) {
  var _arguments = arguments,
      _this = this;

  var atMs = opts.atMs,
      fn = opts.fn,
      _opts$thresholdMs = opts.thresholdMs,
      thresholdMs = _opts$thresholdMs === void 0 ? DEFAULT_THRESHOLD_MS : _opts$thresholdMs,
      _opts$aggression = opts.aggression,
      aggression = _opts$aggression === void 0 ? DEFAULT_AGGRESSION : _opts$aggression,
      _opts$customNow = opts.customNow,
      customNow = _opts$customNow === void 0 ? DEFAULT_NOW_FN : _opts$customNow,
      _opts$customSetTimeou = opts.customSetTimeout,
      customSetTimeout = _opts$customSetTimeou === void 0 ? DEFAULT_SET_TIMEOUT : _opts$customSetTimeou;
  var delayMs = atMs - customNow();
  var handle = delayMs > thresholdMs ? customSetTimeout(function () {
    tryDriftless.apply(_this, _arguments); // eslint-disable-line prefer-rest-params
  }, delayMs / aggression) : customSetTimeout(function () {
    // Call the function using setTimeout to ensure asynchrony
    delete timerHandles[id];
    fn();
  }, 0);
  timerHandles[id] = handle;
}

function setDriftless() {
  return setDriftless.setDriftlessSpyable.apply(setDriftless, arguments);
} // Separate function for testing


setDriftless.setDriftlessSpyable = function (opts) {
  var id = nextId;
  nextId += 1;
  tryDriftless(id, opts);
  return id;
};

function clearDriftless(id) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _opts$customClearTime = opts.customClearTimeout,
      customClearTimeout = _opts$customClearTime === void 0 ? DEFAULT_CLEAR_TIMEOUT : _opts$customClearTime;
  customClearTimeout(timerHandles[id]);
  delete timerHandles[id];
}

function clearAllDriftless() {
  Object.entries(timerHandles).forEach(function (_ref) {
    var _ref2 = (0, _slicedToArray2.default)(_ref, 1),
        id = _ref2[0];

    clearDriftless(id);
  });
}

function castToFn(fn) {
  return typeof fn === 'function' ? fn : new Function(fn); // eslint-disable-line no-new-func
}

function setDriftlessTimeout(fn, delayMs) {
  for (var _len = arguments.length, params = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    params[_key - 2] = arguments[_key];
  }

  var callFn = castToFn(fn);
  return setDriftless({
    atMs: DEFAULT_NOW_FN() + delayMs,
    fn: function fn() {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return callFn.call.apply(callFn, [this].concat(args, params));
    }
  });
}

function setDriftlessInterval(fn, delayMs) {
  for (var _len3 = arguments.length, params = new Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
    params[_key3 - 2] = arguments[_key3];
  }

  var callFn = castToFn(fn);
  var id;
  var opts = {
    atMs: DEFAULT_NOW_FN() + delayMs,
    fn: function fn() {
      opts.atMs += delayMs;
      tryDriftless(id, opts);

      for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }

      return callFn.call.apply(callFn, [this].concat(args, params));
    }
  };
  id = setDriftless(opts);
  return id;
}