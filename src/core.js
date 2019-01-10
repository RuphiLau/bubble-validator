/**
 * 核心处理方法集合
 * Created by hzliurufei on 2018-11-28 17:15:35 
 * @Last Modified by: hzliurufei
 * @Last Modified time: 2019-01-10 17:05:01
 */

import { INITIAL_STATUS, ELEMENT_TYPE } from './const'
import { has, getType, getElementType } from './util'

/**
 * DOM/组件事件解绑处理器
 * @type {object}
 */
const _EventOffHandlers = {}

/**
 * 处理表单聚焦
 * @this {VueComponent}
 * @param {object} field 字段对象
 * @return {void}
 */
function _handleFocus(field) {
    Object.assign(field, INITIAL_STATUS)
    // 重置状态
    deriveStatus.call(this)
    field.$handlers.forEach((item) => {
        const directive = item.$directive
        field[directive] = false
    })
}

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
function _handleUnfocus(field) {
    if (field.untouched) {
        field.untouched = false
        field.touched = true
    }
    _handleWatch.call(this, field)
}

/**
 * 添加监听器
 * @this {VueComponent}
 * @param {VNode} vnode  VNode对象
 * @param {object} field 字段对象
 * @return {void}
 */
export function addListener(vnode, field) {
    const el = field.$element
    const type = getElementType(el)
    switch (type) {
        case ELEMENT_TYPE.CHECKRADIO:
            field.$watcher = this.$watch(field.$expression, _handleUnfocus.bind(this, field))
            break
        case ELEMENT_TYPE.COMMONFORM:
            field.$watcher = this.$watch(field.$expression, _handleWatch.bind(this, field))
            break
        case ELEMENT_TYPE.NONFORM:
            field.$watcher = this.$watch(field.$expression, _handleUnfocus.bind(this, field))    
    }
    // 对于有blur事件的DOM节点，或者组件，绑定失焦时处理
    const componentInstance = vnode.componentInstance
    const isComponent = componentInstance !== undefined
    if (type === ELEMENT_TYPE.COMMONFORM || isComponent) {
        const blurHandler = _handleBlur.bind(this, field)
        const focusHandler = _handleFocus.bind(this, field)
        const handlers = _EventOffHandlers[field.$name] = _EventOffHandlers[field.$name] || []
        if (type === ELEMENT_TYPE.COMMONFORM) {
            el.addEventListener('blur', blurHandler)
            el.addEventListener('focus', focusHandler)
            handlers.push(() => el.removeEventListener('blur', blurHandler))
            handlers.push(() => el.removeEventListener('focus', focusHandler))
        } else if (isComponent) {
            componentInstance.$on('blur', blurHandler)
            componentInstance.$on('focus', focusHandler)
            handlers.push(() => componentInstance.$off('blur', blurHandler))
            handlers.push(() => componentInstance.$off('focus', focusHandler))
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
export function addField(name, vnode, originValue, expression) {
    const element = vnode.elm
    // 初始化验证数据结构
    if (!this.validation[name]) {
        this.$set(this.validation, name, Object.assign({}, INITIAL_STATUS))
        Object.assign(this.validation[name], {
            $name: name,
            $handlers: [],
            $element: element,
            $expression: expression,
            $origin: originValue,
            $value: originValue,
            $oldVal: originValue
        })
    }
    const field = this.validation[name]
    // 添加事件监听处理器
    addListener.call(this, vnode, field)
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
    // 移除DOM/组件事件监听
    const type = getElementType(el)
    const eventOffHandlers = _EventOffHandlers[field.$name]
    if (type === ELEMENT_TYPE.COMMONFORM && getType(eventOffHandlers) === 'array') {
        while (eventOffHandlers.length) {
            const offHandler = eventOffHandlers.shift()
            offHandler()
        }
        _EventOffHandlers[field.$name] = null
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
    const handlers = field.$handlers
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