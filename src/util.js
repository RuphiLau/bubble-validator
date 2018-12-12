/**
 * Created by hzliurufei on 2018-11-28 16:23:40 
 * @Last Modified by: hzliurufei
 * @Last Modified time: 2018-12-12 14:40:27
 */

import { FORM_TAGS, ELEMENT_TYPE, PRESERVED_WORDS, BOOLEAN_DIRECTIVES } from './const'

/**
 * 获取数据的实际类型
 * @param {any} anyData 输入数据
 * @return {string}
 */
export function getType(anyData) {
    const rawType = Object.prototype.toString.call(anyData)
    const rawMatch = rawType.match(/\[object\s([^]+)\]/)
    return rawMatch[1].toLowerCase()
}

/**
 * 判断数组中是否有相应元素
 * @param {Array<any>} arr 数组
 * @param {any} valToTest  元素
 * @return {boolean}
 */
export function has(arr, valToTest) {
    return arr.indexOf(valToTest) >= 0
}

/**
 * 错误输出
 * @param {string} message 
 * @return {never}
 */
export function error(message) {
    throw Error(`[BubbleValidator] Error: ${message}`)
}

/**
 * 警告输出
 * @param {string} message 
 * @return {void}
 */
export function warn(message) {
    console.warn(`[BubbleValidator] Warning: ${message}`)
}

/**
 * 转化为驼峰
 * @param {string} str
 * @return {string} 
 */
export function toCamelCase(str = '') {
    return String(str).replace(/\-([A-Za-z])/g, (a, b) => b.toUpperCase())
}

/**
 * 判断是否是表单元素
 * @param {string} tagName 元素标签名称
 * @return {boolean}
 */
export function isFormElement(tagName = '') {
    tagName = tagName.toUpperCase()
    return has(FORM_TAGS, tagName)
}

/**
 * 判断是否是input[type=checkbox]或input[type=radio]
 * @param {HTMLElement} el 节点元素对象
 * @return {boolean}
 */
export function isCheckOrRadioElement(el) {
    const tagName = el.tagName.toUpperCase()
    return tagName === 'INPUT' && ['checkbox', 'radio'].includes(el.type)
}

/**
 * 获取元素类型
 * @param {HTMLElement} el 节点元素对象
 * @return {symbol} 
 */
export function getElementType(el) {
    if (isFormElement(el.tagName)) {
        if (isCheckOrRadioElement(el)) {
            return ELEMENT_TYPE.CHECKRADIO
        }
        return ELEMENT_TYPE.COMMONFORM
    }
    return ELEMENT_TYPE.NONFORM
}

/**
 * 获得字段name
 * @param {HTMLElement} el 节点元素对象
 * @param {boolean} check  是否检查获取结果
 * @return {string}
 */
export function getFieldName(el, check = true) {
    const name = el.getAttribute('name') || el.getAttribute('data-name')
    if (check && !name) {
        error('You must specify a "name" attribute for the validation field')
    }
    return name
}

/**
 * 校验字段name是否合法（目前仅作保留字校验）
 * @param {string} name 字段name
 * @return {boolean} 
 */
export function isValidFieldName(name) {
    return !has(PRESERVED_WORDS, name)
}

/**
 * 查找目标指令
 * @param {VNode} vnode                  上下文vnode
 * @param {string} directiveName         要查找的指令名称
 * @param {string|boolean} matchModifier 是否应匹配指定修饰符时才查找成功
 * @return {object|null}
 */
export function getDirective(vnode, directiveName, matchModifier = false) {
    let target = null
    const directives = vnode.data.directives
    for (const directive of directives) {
        if (directive.name === directiveName) {
            target = directive
            break
        }
    }
    if (target && matchModifier) {
        return target.modifiers[matchModifier] ? target : null
    }
    return target
}

/**
 * 获取绑定字段值的指令
 * @param {VNode} vnode 上下文vnode
 * @return {object}
 */
export function getValidatorDirective(vnode) {
    let directive = getDirective(vnode, 'model', 'validator')
    if (!directive) {
        directive = getDirective(vnode, 'validator')
    }
    return directive
}

/**
 * 获取指定的规则处理器对象
 * @param {array} handlers        规则处理器对象集合
 * @param {string} directiveName  指令名称（等同于规则名称）
 * @return {object}
 */
export function getHandler(handlers, directiveName) {
    let target = null
    for (const handler of handlers) {
        if (handler.$directive === directiveName) {
            target = handler
            break
        }
    }
    return target
}

/**
 * 获取校验规则配置（如v-min="10"，获得10）
 * @param {string} ruleName 规则名称
 * @param {any} ruleConfig  规则原始配置值
 * @return {any}
 */
export function getRuleConfig(ruleName, ruleConfig) {
    // 对于布尔型指令，在缺省情况下，默认为true
    //（即：<input v-required ... /> 相当于 <input v-required="true" />
    if (ruleConfig === undefined && has(BOOLEAN_DIRECTIVES, ruleName)) {
        return true
    }
    return ruleConfig
}
