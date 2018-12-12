/**
 * 核心处理方法集合
 * Created by hzliurufei on 2018-11-28 17:15:35 
 * @Last Modified by: hzliurufei
 * @Last Modified time: 2018-12-12 14:41:28
 */

import { INITIAL_STATUS, ELEMENT_TYPE } from './const'
import { has, getElementType } from './util'

/**
 * DOM事件处理器引用表（回收阶段释放用）
 * @type {object}
 */
const _DOMEventHandlers = {}

/**
 * 处理表单字段失焦
 * @this {VueComponent}
 * @param {object} field 字段对象
 * @return {void}
 */
function _handleBlur(field) {
    const name = field.$name
    if (field.untouched) {
        field.untouched = false
        field.touched = true
    }
    this.checkValidity(name)
}

/**
 * 处理观测字段
 * @this {VueComponent}
 * @param {object} field 字段对象
 * @return {void}
 */
function _handleWatch(field) {
    const name = field.$name
    if (field.$value === field.$origin) {
        field.pristine = true
        field.modified = false
    } else {
        field.pristine = false
        field.modified = true
        field.dirty = true
    }
    this.checkValidity(name)
}

/**
 * 处理非焦点元素Watch
 * @this {VueComponent}
 * @param {object} field 
 * @return {void}
 */
function _handleUnfocusedatch(field) {
    if (field.untouched) {
        field.untouched = false
        field.touched = true
    }
    _handleWatch.call(this, field)
}

/**
 * 添加监听器
 * @this {VueComponent}
 * @param {object} field 字段对象
 * @return {void}
 */
export function addListener(field) {
    const el = field.$element
    const type = getElementType(el)
    switch (type) {
        case ELEMENT_TYPE.CHECKRADIO:
            field.$watcher = this.$watch(field.$expression, _handleUnfocusedatch.bind(this, field))
            break
        case ELEMENT_TYPE.COMMONFORM:
            if (!_DOMEventHandlers[field.$name]) {
                _DOMEventHandlers[field.$name] = []
            }
            const blurHandler = _handleBlur.bind(this, field)
            el.addEventListener('blur', blurHandler)
            _DOMEventHandlers[field.$name].push(blurHandler)
            field.$watcher = this.$watch(field.$expression, _handleWatch.bind(this, field))
            break
        case ELEMENT_TYPE.NONFORM:
            field.$watcher = this.$watch(field.$expression, _handleUnfocusedatch.bind(this, field))    
    }
}

/**
 * 添加验证字段
 * @this {VueComponent}
 * @param {string} name         字段name
 * @param {HTMLElement} element 节点元素对象
 * @param {any} originValue     字段初始值
 * @param {any} expression      字段表达式
 * @return {void}
 */
export function addField(name, element, originValue, expression) {
    // 初始化验证数据结构
    if (!this.validation[name]) {
        this.$set(this.validation, name, Object.assign({}, INITIAL_STATUS))
        Object.assign(this.validation[name], {
            $name: name,
            $element: element,
            $expression: expression,
            $origin: originValue,
            $value: originValue,
            $oldVal: originValue
        })
    }
    const field = this.validation[name]
    // 添加事件监听处理器
    addListener.call(this, field)
    // 加入域表，方便做统一检查
    if (!has(this.validation.$fields, name)) {
        this.validation.$fields.push(name)
    }
}

/**
 * 删除验证字段
 * @this {VueComponent}
 * @param {string} name 字段name
 * @return {void}
 */
export function removeField(name) {
    const validation = this.validation
    const pos = validation.$fields.indexOf(name)
    if (pos < 0) {
        return
    }
    validation.$fields.splice(pos, 1)
    const field = validation[name]
    const el = field.$element
    // 取消表达式监听
    const unwatcher = field.$watcher
    const relatedUnwatcher = field.$related
    typeof unwatcher === 'function' && unwatcher()
    typeof relatedUnwatcher === 'function' && relatedUnwatcher()
    // 移除DOM监听
    const type = getElementType(el)
    if (type === ELEMENT_TYPE.COMMONFORM) {
        _DOMEventHandlers[field.$name].forEach(handler => {
            el.removeEventListener('blur', handler)
        })
        _DOMEventHandlers[field.$name] = null
    }
    this.$delete(validation, name)
    deriveStatus.call(this)
}

/**
 * 添加被关联项（被关联项一旦更新，会同步更新关联项）
 * @this {VueComponent}
 * @param {object} field             字段对象
 * @param {string} relatedExpression 被关联项表达式
 * @return {void}
 */
export function addRelated(field, relatedExpression) {
    field.$related = this.$watch(relatedExpression, () => {
        this.checkValidity(field.$name)
    })
}

/**
 * 添加验证规则处理器
 * @this {VueComponent}
 * @param {string} name     字段name
 * @param {object} handler  规则校验处理器
 * @return {void}
 */
export function addRuleHandler(name, handler) {
    const field = this.validation[name]
    const handlers = field.$handlers = field.$handlers || []
    const rules = handlers.map(item => item.$directive)
    const directive = handler.$directive
    if (!has(rules, directive)) {
        this.$set(field, directive, false)
        handlers.push(handler)
        // 根据优先级进行排序
        handlers.sort((handlerA, handlerB) => handlerA.$priority - handlerB.$priority)
    }
}

/**
 * 根据字段状态导出全局状态
 * @return {void}
 */
export function deriveStatus() {
    Object.assign(this.validation, {
        untouched: true,
        touched: true,
        modified: false,
        dirty: false,
        pristine: true,
        invalid: false,
        valid: true
    })
    const validation = this.validation
    const fields = validation.$fields
    fields.forEach(fieldName => {
        const field = validation[fieldName]
        if (field.untouched === false) {
            validation.untouched = false
        }
        if (field.untouched === true) {
            validation.touched = false
        }
        if (field.modified === true) {
            validation.modified = true
        }
        if (field.dirty === true) {
            validation.dirty = true
        }
        if (field.pristine === false) {
            validation.pristine = false
        }
        if (field.invalid === true) {
            validation.invalid = true
        }
        if (field.valid === false) {
            validation.valid = false
        }
    })
}