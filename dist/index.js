(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.BubbleValidator = factory());
}(this, (function () { 'use strict';

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  /**
   * 常量表
   * Created by hzliurufei on 2018-12-06 22:04:14 
   * @Last Modified by: hzliurufei
   * @Last Modified time: 2018-12-12 16:24:43
   */
  // 表单元素标签表
  var FORM_TAGS = ['INPUT', 'TEXTAREA', 'SELECT']; // 内建指令

  var BUILT_IN_DIRECTIVES = ['required', 'length', 'min', 'max', 'pattern', 'custom']; // 保留字校验（防止冲突）

  var PRESERVED_WORDS = ['$fields', 'invalid', 'valid', 'untouched', 'touched', 'pristine', 'dirty', 'modified']; // 布尔值型指令

  var BOOLEAN_DIRECTIVES = ['required']; // 初始验证状态

  var INITIAL_STATUS = {
    invalid: false,
    valid: true,
    untouched: true,
    touched: false,
    pristine: true,
    dirty: false,
    modified: false // 元素类型

  };
  var ELEMENT_TYPE = {
    COMMONFORM: Symbol('COMMONFORM'),
    // 普通表单类型（非radio/checkbox的input、select、textarea）
    CHECKRADIO: Symbol('CHECKRADIO'),
    NONFORM: Symbol('NONFORM') // 非表单类型

  };

  /**
   * Created by hzliurufei on 2018-11-28 16:23:40 
   * @Last Modified by: hzliurufei
   * @Last Modified time: 2019-01-10 16:09:57
   */
  /**
   * 获取数据的实际类型
   * @param {any} anyData 输入数据
   * @return {string}
   */

  function getType(anyData) {
    var rawType = Object.prototype.toString.call(anyData);
    var rawMatch = rawType.match(/\[object\s([^]+)\]/);
    return rawMatch[1].toLowerCase();
  }
  /**
   * 判断数组中是否有相应元素
   * @param {Array<any>} arr 数组
   * @param {any} valToTest  元素
   * @return {boolean}
   */

  function has(arr, valToTest) {
    return arr.indexOf(valToTest) >= 0;
  }
  /**
   * 错误输出
   * @param {string} message 
   * @return {never}
   */

  function error(message) {
    throw Error("[BubbleValidator] Error: ".concat(message));
  }
  /**
   * 警告输出
   * @param {string} message 
   * @return {void}
   */

  function warn(message) {
    console.warn("[BubbleValidator] Warning: ".concat(message));
  }
  /**
   * 转化为驼峰
   * @param {string} str
   * @return {string} 
   */

  function toCamelCase() {
    var str = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    return String(str).replace(/\-([A-Za-z])/g, function (a, b) {
      return b.toUpperCase();
    });
  }
  /**
   * 判断是否是表单元素
   * @param {string} tagName 元素标签名称
   * @return {boolean}
   */

  function isFormElement() {
    var tagName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    tagName = tagName.toUpperCase();
    return has(FORM_TAGS, tagName);
  }
  /**
   * 判断是否是input[type=checkbox]或input[type=radio]
   * @param {HTMLElement} el 节点元素对象
   * @return {boolean}
   */

  function isCheckOrRadioElement(el) {
    var tagName = el.tagName.toUpperCase();
    return tagName === 'INPUT' && ['checkbox', 'radio'].includes(el.type);
  }
  /**
   * 获取元素类型
   * @param {HTMLElement} el 节点元素对象
   * @return {symbol} 
   */

  function getElementType(el) {
    if (isFormElement(el.tagName)) {
      if (isCheckOrRadioElement(el)) {
        return ELEMENT_TYPE.CHECKRADIO;
      }

      return ELEMENT_TYPE.COMMONFORM;
    }

    return ELEMENT_TYPE.NONFORM;
  }
  /**
   * 获得字段name
   * @param {VNode} vnode    节点VNode对象
   * @param {boolean} report 找不到name时是否抛出错误
   * @return {string}
   */

  function getFieldName(vnode) {
    var report = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    var el = vnode.elm;
    var attrs = vnode.data.attrs || {};
    var name = attrs.name || attrs['data-name'] || el.getAttribute('name') || el.dataset.name;

    if (report && !name) {
      error('You must specify a "name" attribute for the validation field');
    }

    return name;
  }
  /**
   * 校验字段name是否合法（目前仅作保留字校验）
   * @param {string} name 字段name
   * @return {boolean} 
   */

  function isValidFieldName(name) {
    return !has(PRESERVED_WORDS, name);
  }
  /**
   * 查找目标指令
   * @param {VNode} vnode                  上下文vnode
   * @param {string} directiveName         要查找的指令名称
   * @param {string|boolean} matchModifier 是否应匹配指定修饰符时才查找成功
   * @return {object|null}
   */

  function getDirective(vnode, directiveName) {
    var matchModifier = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var target = null;
    var directives = vnode.data.directives;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = directives[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var directive = _step.value;

        if (directive.name === directiveName) {
          target = directive;
          break;
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return != null) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    if (target && matchModifier) {
      return target.modifiers[matchModifier] ? target : null;
    }

    return target;
  }
  /**
   * 获取绑定字段值的指令
   * @param {VNode} vnode 上下文vnode
   * @return {object}
   */

  function getValidatorDirective(vnode) {
    var directive = getDirective(vnode, 'model', 'validator');

    if (!directive) {
      directive = getDirective(vnode, 'validator');
    }

    return directive;
  }
  /**
   * 获取指定的规则处理器对象
   * @param {array} handlers        规则处理器对象集合
   * @param {string} directiveName  指令名称（等同于规则名称）
   * @return {object}
   */

  function getHandler(handlers, directiveName) {
    var target = null;
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = handlers[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var handler = _step2.value;

        if (handler.$directive === directiveName) {
          target = handler;
          break;
        }
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    return target;
  }
  /**
   * 获取校验规则配置（如v-min="10"，获得10）
   * @param {string} ruleName 规则名称
   * @param {any} ruleConfig  规则原始配置值
   * @return {any}
   */

  function getRuleConfig(ruleName, ruleConfig) {
    // 对于布尔型指令，在缺省情况下，默认为true
    //（即：<input v-required ... /> 相当于 <input v-required="true" />
    if (ruleConfig === undefined && has(BOOLEAN_DIRECTIVES, ruleName)) {
      return true;
    }

    return ruleConfig;
  }

  /**
   * 核心处理方法集合
   * Created by hzliurufei on 2018-11-28 17:15:35 
   * @Last Modified by: hzliurufei
   * @Last Modified time: 2019-01-10 17:05:01
   */
  /**
   * DOM/组件事件解绑处理器
   * @type {object}
   */

  var _EventOffHandlers = {};
  /**
   * 处理表单聚焦
   * @this {VueComponent}
   * @param {object} field 字段对象
   * @return {void}
   */

  function _handleFocus(field) {
    Object.assign(field, INITIAL_STATUS); // 重置状态

    deriveStatus.call(this);
    field.$handlers.forEach(function (item) {
      var directive = item.$directive;
      field[directive] = false;
    });
  }
  /**
   * 处理表单字段失焦
   * @this {VueComponent}
   * @param {object} field 字段对象
   * @return {void}
   */


  function _handleBlur(field) {
    var name = field.$name;

    if (field.untouched) {
      field.untouched = false;
      field.touched = true;
    }

    this.checkValidity(name);
  }
  /**
   * 处理观测字段
   * @this {VueComponent}
   * @param {object} field 字段对象
   * @return {void}
   */


  function _handleWatch(field) {
    var name = field.$name;

    if (field.$value === field.$origin) {
      field.pristine = true;
      field.modified = false;
    } else {
      field.pristine = false;
      field.modified = true;
      field.dirty = true;
    }

    this.checkValidity(name);
  }
  /**
   * 处理非焦点元素Watch
   * @this {VueComponent}
   * @param {object} field 
   * @return {void}
   */


  function _handleUnfocus(field) {
    if (field.untouched) {
      field.untouched = false;
      field.touched = true;
    }

    _handleWatch.call(this, field);
  }
  /**
   * 添加监听器
   * @this {VueComponent}
   * @param {VNode} vnode  VNode对象
   * @param {object} field 字段对象
   * @return {void}
   */


  function addListener(vnode, field) {
    var el = field.$element;
    var type = getElementType(el);

    switch (type) {
      case ELEMENT_TYPE.CHECKRADIO:
        field.$watcher = this.$watch(field.$expression, _handleUnfocus.bind(this, field));
        break;

      case ELEMENT_TYPE.COMMONFORM:
        field.$watcher = this.$watch(field.$expression, _handleWatch.bind(this, field));
        break;

      case ELEMENT_TYPE.NONFORM:
        field.$watcher = this.$watch(field.$expression, _handleUnfocus.bind(this, field));
    } // 对于有blur事件的DOM节点，或者组件，绑定失焦时处理


    var componentInstance = vnode.componentInstance;
    var isComponent = componentInstance !== undefined;

    if (type === ELEMENT_TYPE.COMMONFORM || isComponent) {
      var blurHandler = _handleBlur.bind(this, field);

      var focusHandler = _handleFocus.bind(this, field);

      var handlers = _EventOffHandlers[field.$name] = _EventOffHandlers[field.$name] || [];

      if (type === ELEMENT_TYPE.COMMONFORM) {
        el.addEventListener('blur', blurHandler);
        el.addEventListener('focus', focusHandler);
        handlers.push(function () {
          return el.removeEventListener('blur', blurHandler);
        });
        handlers.push(function () {
          return el.removeEventListener('focus', focusHandler);
        });
      } else if (isComponent) {
        componentInstance.$on('blur', blurHandler);
        componentInstance.$on('focus', focusHandler);
        handlers.push(function () {
          return componentInstance.$off('blur', blurHandler);
        });
        handlers.push(function () {
          return componentInstance.$off('focus', focusHandler);
        });
      }
    }
  }
  /**
   * 添加验证字段
   * @this {VueComponent}
   * @param {string} name         字段name
   * @param {VNode} vnode         节点VNode对象
   * @param {any} originValue     字段初始值
   * @param {any} expression      字段表达式
   * @return {void}
   */

  function addField(name, vnode, originValue, expression) {
    var element = vnode.elm; // 初始化验证数据结构

    if (!this.validation[name]) {
      this.$set(this.validation, name, Object.assign({}, INITIAL_STATUS));
      Object.assign(this.validation[name], {
        $name: name,
        $handlers: [],
        $element: element,
        $expression: expression,
        $origin: originValue,
        $value: originValue,
        $oldVal: originValue
      });
    }

    var field = this.validation[name]; // 添加事件监听处理器

    addListener.call(this, vnode, field); // 加入域表，方便做统一检查

    if (!has(this.validation.$fields, name)) {
      this.validation.$fields.push(name);
    }
  }
  /**
   * 删除验证字段
   * @this {VueComponent}
   * @param {string} name 字段name
   * @return {void}
   */

  function removeField(name) {
    var validation = this.validation;
    var pos = validation.$fields.indexOf(name);

    if (pos < 0) {
      return;
    }

    validation.$fields.splice(pos, 1);
    var field = validation[name];
    var el = field.$element; // 取消表达式监听

    var unwatcher = field.$watcher;
    var relatedUnwatcher = field.$related;
    typeof unwatcher === 'function' && unwatcher();
    typeof relatedUnwatcher === 'function' && relatedUnwatcher(); // 移除DOM/组件事件监听

    var type = getElementType(el);
    var eventOffHandlers = _EventOffHandlers[field.$name];

    if (type === ELEMENT_TYPE.COMMONFORM && getType(eventOffHandlers) === 'array') {
      while (eventOffHandlers.length) {
        var offHandler = eventOffHandlers.shift();
        offHandler();
      }

      _EventOffHandlers[field.$name] = null;
    }

    this.$delete(validation, name);
    deriveStatus.call(this);
  }
  /**
   * 添加被关联项（被关联项一旦更新，会同步更新关联项）
   * @this {VueComponent}
   * @param {object} field             字段对象
   * @param {string} relatedExpression 被关联项表达式
   * @return {void}
   */

  function addRelated(field, relatedExpression) {
    var _this = this;

    field.$related = this.$watch(relatedExpression, function () {
      _this.checkValidity(field.$name);
    });
  }
  /**
   * 添加验证规则处理器
   * @this {VueComponent}
   * @param {string} name     字段name
   * @param {object} handler  规则校验处理器
   * @return {void}
   */

  function addRuleHandler(name, handler) {
    var field = this.validation[name];
    var handlers = field.$handlers;
    var rules = handlers.map(function (item) {
      return item.$directive;
    });
    var directive = handler.$directive;

    if (!has(rules, directive)) {
      this.$set(field, directive, false);
      handlers.push(handler); // 根据优先级进行排序

      handlers.sort(function (handlerA, handlerB) {
        return handlerA.$priority - handlerB.$priority;
      });
    }
  }
  /**
   * 根据字段状态导出全局状态
   * @return {void}
   */

  function deriveStatus() {
    Object.assign(this.validation, {
      untouched: true,
      touched: true,
      modified: false,
      dirty: false,
      pristine: true,
      invalid: false,
      valid: true
    });
    var validation = this.validation;
    var fields = validation.$fields;
    fields.forEach(function (fieldName) {
      var field = validation[fieldName];

      if (field.untouched === false) {
        validation.untouched = false;
      }

      if (field.untouched === true) {
        validation.touched = false;
      }

      if (field.modified === true) {
        validation.modified = true;
      }

      if (field.dirty === true) {
        validation.dirty = true;
      }

      if (field.pristine === false) {
        validation.pristine = false;
      }

      if (field.invalid === true) {
        validation.invalid = true;
      }

      if (field.valid === false) {
        validation.valid = false;
      }
    });
  }

  /**
   * 内建校验规则
   * Created by hzliurufei on 2018-11-29 13:54:29 
   * @Last Modified by: hzliurufei
   * @Last Modified time: 2018-12-12 14:43:26
   */
  /**
   * @const 类型验证规则
   */

  var _typeRegExps = {
    ISO_DATE: /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/,
    URL: /^[a-z]+:\/\/(?:[\w-]+\.)+[a-z]{2,6}.*$/i,
    EMAIL: /^[\w-\.]+@(?:[\w-]+\.)+[a-z]{2,6}$/i,
    NUMBER: /^[\d]+$/i,
    DATE: /^(\d{4})-(\d{2})-(\d{2})$/,
    TIME: /^(\d\d):(\d\d)(?::(\d\d)(\.\d{1,3})?)?$/
  };
  var validationRules = {
    /**
     * 必填验证
     * @param {any} value       输入值
     * @param {any} isRequired  是否必填
     * @return {boolean}
     */
    required: function required(value, isRequired) {
      if (isRequired === 'false' || !isRequired) {
        return true;
      }

      if (getType(value) === 'array') {
        return value.length > 0;
      } else if (getType(value) === 'object') {
        return Object.keys(value).length > 0;
      } else if (value === 0) {
        return true;
      }

      return !!value;
    },

    /**
     * 类型验证
     * @param {any} value   输入值
     * @param {string} type 类型 
     * @return {boolean}
     */
    type: function type(value) {
      var _type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

      var rule = _typeRegExps[_type.toUpperCase()];

      if (!rule) {
        warn("v-type=\"".concat(_type, "\" does not match any rules so it will be ignored"));
        return true;
      }

      return rule.test(value);
    },

    /**
     * 字符串长度验证
     * @param {string} value  输入值
     * @param {number} length 长度
     * @return {boolean}
     */
    length: function length(value, _length) {
      return String(value).length === parseInt(_length);
    },

    /**
     * 字符串最小长度验证
     * @param {string} value  输入值
     * @param {number} minlen 最小长度
     * @return {boolean}
     */
    minLength: function minLength(value, minlen) {
      return String(value).length >= parseInt(minlen);
    },

    /**
     * 字符串最大长度验证
     * @param {string} value  输入值
     * @param {number} maxlen 最大长度
     * @return {boolean}
     */
    maxLength: function maxLength(value, maxlen) {
      return String(value).length <= parseInt(maxlen);
    },

    /**
     * 最小值验证
     * @param {any} value       输入值
     * @param {number} minValue 最小值
     * @return {boolean} 如果最小值不是个数值，则视为验证规则无效，验证返回合法
     */
    min: function min(value, minValue) {
      minValue = parseFloat(minValue);

      if (isNaN(minValue)) {
        return true;
      }

      if (value === null || value === undefined || value === '') {
        return true;
      }

      return +value >= minValue;
    },

    /**
     * 最大值验证
     * @param {any} value       输入值
     * @param {number} minValue 最大值
     * @return {boolean} 如果最大值不是个数值，则视为验证规则无效，验证返回合法
     */
    max: function max(value, maxValue) {
      maxValue = parseFloat(maxValue);

      if (isNaN(maxValue)) {
        return true;
      }

      if (value === null || value === undefined || value === '') {
        return true;
      }

      return +value <= maxValue;
    },

    /**
     * 正则验证
     * @param {string} value       输入值
     * @param {string|RegExp} rule 正则
     * @return {boolean}
     */
    pattern: function pattern(value, rule) {
      if (typeof rule === 'string') {
        rule = new RegExp(rule);
      }

      return rule.test(value || '');
    },

    /**
     * 自定义验证
     * @param {any} value                   输入值
     * @param {boolean} customCheckResult   自定义验证结果
     * @return {boolean}
     */
    custom: function custom(value, customCheckResult) {
      return customCheckResult;
    }
  };
  /**
   * 规则验证优先级表
   * @const
   */

  var priorityMap = {
    required: 1,
    type: 2,
    length: 3,
    minLength: 4,
    maxLength: 5,
    min: 6,
    max: 7,
    pattern: 100,
    custom: 200
  };

  /**
   * 指令定义处理
   * Created by hzliurufei on 2018-12-06 22:03:21 
   * @Last Modified by: hzliurufei
   * @Last Modified time: 2019-03-01 12:55:36
   */
  /**
   * 非法校验元素警告处理
   * @param {string} name 字段name
   * @return {boolean}
   */

  function _invalidElementWarn(name) {
    warn("Field \"".concat(name, "\" lacks of '.validator' modifier for form elements or 'v-validator' directive\n") + "for non-form elements, all validation rules will be ignore.");
    return false;
  }
  /**
   * 检测字段name
   * @param {string} name 字段name
   * @return {never}
   */


  function _checkFieldName(name) {
    if (!isValidFieldName(name)) {
      error("Name \"".concat(name, "\" is a preserved word, please use other field names instead."));
    }
  }
  /**
   * 初始化指令绑定
   * @param {HTMLElement} el     节点元素对象
   * @param {object} directive   指令对象
   * @param {VNode} vnode        VNode对象
   * @return {string} 初始化成功后，返回字段name
   */


  function _initialBind(el, directive, vnode) {
    var name = getFieldName(vnode);

    if (!!el.dataset.bubbleBound) {
      return name;
    }

    _checkFieldName(name); // 取得校验指令


    var directiveName = toCamelCase(directive.name);
    var validatorDirective = directiveName === 'model' && directive.modifiers.validator || directiveName === 'validator' ? directive : getValidatorDirective(vnode);

    if (!validatorDirective) {
      has(BUILT_IN_DIRECTIVES, directiveName) && _invalidElementWarn(name);
      return;
    }

    var ctx = vnode.context;
    var field = ctx.validation[name];

    if (directiveName === 'model' && field && field.$name && el !== field.$element) {
      error("Duplicated validation field name: ".concat(name));
    }

    if (!field) {
      addField.call(ctx, name, vnode, validatorDirective.value, validatorDirective.expression);
    }

    el.dataset.bubbleBound = true;
    return name;
  }
  /**
   * 处理观测值更新
   * @param {HTMLElement} el 节点元素对象
   * @param {object} binding 指令对象
   * @param {object} vnode   VNode对象
   * @return {void}
   */


  function _handleValidatorValueUpdate(el, binding, vnode) {
    var ctx = vnode.context;
    var name = getFieldName(vnode, false);

    if (!name) {
      return;
    }

    var field = ctx.validation[name];

    if (field.$inited && binding.value === binding.oldValue) {
      return;
    }

    field.$oldVal = binding.oldValue;
    field.$value = binding.value;

    if (!field.$inited) {
      field.$inited = true;
    }
  }
  /**
   * 处理指令解绑
   * @param {HTMLElement} el 节点元素对象
   * @param {object} binding 指令对象
   * @param {object} vnode   VNode对象
   * @return {void}
   */


  function _handleUnbild(el, binding, vnode) {
    var name = getFieldName(vnode, false);

    if (!name) {
      return;
    }

    var ctx = vnode.context;
    removeField.call(ctx, name);
  }
  /**
   * 规则指令定义
   * @return {object}
   */


  function _ruleDirectiveDefinition() {
    return {
      bind: function bind(el, directive, vnode, oldVNode) {
        var name = _initialBind(el, directive, vnode);

        if (!name) {
          return;
        }

        var ctx = vnode.context;
        var directiveName = toCamelCase(directive.name);
        var directiveValue = getRuleConfig(directiveName, directive.value);
        addRuleHandler.call(ctx, name, {
          $priority: priorityMap[directiveName],
          $directive: directiveName,
          $directiveVal: directiveValue,
          $handler: validationRules[directiveName]
        });
      },
      update: function update(el, directive, vnode) {
        var ctx = vnode.context;
        var directiveName = toCamelCase(directive.name);
        var name = getFieldName(vnode, false);

        if (!name || !ctx.validation[name]) {
          return;
        }

        var handler = getHandler(ctx.validation[name].$handlers, directiveName);

        if (handler) {
          handler.$directiveVal = getRuleConfig(directiveName, directive.value);
        }
      }
    };
  }
  /**
   * 处理数据关联指令绑定
   * @return {object}
   */


  function _handleRelated() {
    return {
      bind: function bind(el, directive, vnode, oldVNode) {
        var name = _initialBind(el, directive, vnode);

        if (!name) {
          return;
        }

        var ctx = vnode.context;
        addRelated.call(ctx, ctx.validation[name], directive.expression);
      }
    };
  }
  /**
   * 装载验证指令
   * @param {Vue} Vue 
   * @return {void}
   */


  function getDirectives() {
    var directives = {}; // 注册表单元素绑定指令

    directives.model = {
      bind: _initialBind,
      componentUpdated: _handleValidatorValueUpdate,
      unbind: _handleUnbild // 注册非表单元素字段绑定指令

    };
    directives.validator = {
      bind: _initialBind,
      componentUpdated: _handleValidatorValueUpdate,
      unbind: _handleUnbild // 注册数据关联指令

    };
    directives.related = _handleRelated(); // 注册各类验证指令

    var _arr = Object.keys(validationRules);

    for (var _i = 0; _i < _arr.length; _i++) {
      var ruleName = _arr[_i];
      directives[ruleName] = _ruleDirectiveDefinition();
    }

    return directives;
  }

  function BubbleValidator() {
    var _methods;

    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    options = Object.assign({
      accessor: 'v'
    }, options);
    return {
      data: function data() {
        var validation = Object.assign({}, INITIAL_STATUS);
        return {
          validation: validation
        };
      },
      created: function created() {
        this.validation && (this.validation.$fields = []);
      },
      methods: (_methods = {}, _defineProperty(_methods, options.accessor, function (name) {
        var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'invalid';
        var validation = this.validation || {};
        return validation[name] && validation[name][key];
      }), _defineProperty(_methods, "resetValidation", function resetValidation() {}), _defineProperty(_methods, "checkValidity", function checkValidity(name) {
        var disableSync = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        if (!name) {
          var fields = this.validation.$fields || [];
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = fields[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var field = _step.value;
              this.checkValidity(field, true);
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return != null) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }
        } else {
          var _field = this.validation[name];
          var value = _field.$value;
          var handlers = _field.$handlers || [];
          _field.invalid = false;
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = handlers[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var item = _step2.value;

              if (_field.invalid) {
                _field[item.$directive] = false;
              }

              var isValid = item.$handler(value, item.$directiveVal);

              if (item.$directive === 'custom') {
                this.$set(_field, 'customCode', item.$directiveVal);
                isValid = item.$directiveVal === true;
              }

              _field[item.$directive] = !isValid;

              if (!isValid) {
                _field.invalid = true;
              }
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
                _iterator2.return();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }

          _field.valid = !_field.invalid;
        }

        !disableSync && deriveStatus.call(this);
      }), _methods),
      directives: getDirectives()
    };
  }

  return BubbleValidator;

})));
