/**
 * 指令定义处理
 * Created by hzliurufei on 2018-12-06 22:03:21 
 * @Last Modified by: hzliurufei
 * @Last Modified time: 2018-12-20 14:21:10
 */

import { addField, removeField, addRelated, addRuleHandler } from './core'
import { has, error, warn, toCamelCase, getFieldName, getValidatorDirective, getHandler, getRuleConfig, isValidFieldName } from './util'
import { validationRules, priorityMap } from './rules'
import { BUILT_IN_DIRECTIVES } from './const'

/**
 * 非法校验元素警告处理
 * @param {string} name 字段name
 * @return {boolean}
 */
function _invalidElementWarn(name) {
    warn(
        `Field "${name}" lacks of '.validator' modifier for form elements or 'v-validator' directive\n`+
        `for non-form elements, all validation rules will be ignore.`
    )
    return false
}

/**
 * 检测字段name
 * @param {string} name 字段name
 * @return {never}
 */
function _checkFieldName(name) {
    if (!isValidFieldName(name)) {
        error(`Name "${name}" is a preserved word, please use other field names instead.`)
    }
}

/**
 * 初始化指令绑定
 * @param {HTMLElement} el     节点元素对象
 * @param {object} directive   指令对象
 * @param {VNode} vnode        VNode对象
 * @return {boolean}
 */
function _initialBind(el, directive, vnode) {
    let name = null
    // 取得校验指令
    const directiveName = toCamelCase(directive.name)
    const validatorDirective = (directiveName === 'model' && directive.modifiers.validator) || (directiveName === 'validator')
        ? directive
        : getValidatorDirective(vnode)
    if (!validatorDirective) {
        if (has(BUILT_IN_DIRECTIVES, directiveName)) {
            name = getFieldName(vnode)
            _invalidElementWarn(name)
        }
        return false
    }
    name = name || getFieldName(vnode)
    _checkFieldName(name)
    const ctx = vnode.context
    const field = ctx.validation[name]
    if (directiveName === 'model' && field && field.$name && el !== field.$element) {
        error(`Duplicated validation field name: ${name}`)
    }
    if (!field) {
        addField.call(ctx, name, vnode, validatorDirective.value, validatorDirective.expression)
    }
    return true
}

/**
 * 处理观测值更新
 * @param {HTMLElement} el 节点元素对象
 * @param {object} binding 指令对象
 * @param {object} vnode   VNode对象
 * @return {void}
 */
function _handleValidatorValueUpdate(el, binding, vnode) {
    const ctx = vnode.context
    const name = getFieldName(vnode, false)
    if (!name) {
        return
    }
    _checkFieldName(name)
    const field = ctx.validation[name]
    if (field.$inited && binding.value === binding.oldValue) {
        return
    }
    field.$oldVal = binding.oldValue
    field.$value = binding.value
    if (!field.$inited) {
        field.$inited = true
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
    const name = getFieldName(vnode, false)
    if (!name) {
        return
    }
    const ctx = vnode.context
    removeField.call(ctx, name)
}

/**
 * 规则指令定义
 * @return {object}
 */
function _ruleDirectiveDefinition() {
    return {
        bind(el, directive, vnode, oldVNode) {
            if (!_initialBind(el, directive, vnode)) {
                return
            }
            const ctx = vnode.context
            const directiveName = toCamelCase(directive.name)
            const name = getFieldName(vnode)
            const directiveValue = getRuleConfig(directiveName, directive.value)
            addRuleHandler.call(ctx, name, {
                $priority: priorityMap[directiveName],
                $directive: directiveName,
                $directiveVal: directiveValue,
                $handler: validationRules[directiveName]
            })
        },
        update(el, directive, vnode) {
            const ctx = vnode.context
            const directiveName = toCamelCase(directive.name)
            const name = getFieldName(vnode)
            const handler = getHandler(ctx.validation[name].$handlers, directiveName)
            if (handler) {
                handler.$directiveVal = getRuleConfig(directiveName, directive.value)
            }
        }
    }
}

/**
 * 处理数据关联指令绑定
 * @return {object}
 */
function _handleRelated() {
    return {
        bind(el, directive, vnode, oldVNode) {
            if (!_initialBind(el, directive, vnode)) {
                return
            }
            const ctx = vnode.context
            const name = getFieldName(vnode)
            addRelated.call(ctx, ctx.validation[name], directive.expression)
        }
    }
}

/**
 * 装载验证指令
 * @param {Vue} Vue 
 * @return {void}
 */
export default function installDirectives(Vue) {
    const vModel = Vue.directive('model')
    // 注册表单元素绑定指令
    Vue.directive('model', {
        ...vModel,
        bind: _initialBind,
        componentUpdated: _handleValidatorValueUpdate,
        unbind: _handleUnbild
    })
    // 注册非表单元素字段绑定指令
    Vue.directive('validator', {
        bind: _initialBind,
        componentUpdated: _handleValidatorValueUpdate,
        unbind: _handleUnbild
    })
    // 注册数据关联指令
    Vue.directive('related', _handleRelated())
    // 注册各类验证指令
    for (const ruleName of Object.keys(validationRules)) {
        Vue.directive(ruleName, _ruleDirectiveDefinition())
    }
}