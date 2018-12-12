/**
 * 内建校验规则
 * Created by hzliurufei on 2018-11-29 13:54:29 
 * @Last Modified by: hzliurufei
 * @Last Modified time: 2018-12-12 14:43:26
 */

import { warn, getType } from './util'

/**
 * @const 类型验证规则
 */
const _typeRegExps = {
    ISO_DATE: /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/,
    URL: /^[a-z]+:\/\/(?:[\w-]+\.)+[a-z]{2,6}.*$/i,
    EMAIL: /^[\w-\.]+@(?:[\w-]+\.)+[a-z]{2,6}$/i,
    NUMBER: /^[\d]+$/i,
    DATE: /^(\d{4})-(\d{2})-(\d{2})$/,
    TIME: /^(\d\d):(\d\d)(?::(\d\d)(\.\d{1,3})?)?$/
}

export const validationRules = {
    /**
     * 必填验证
     * @param {any} value       输入值
     * @param {any} isRequired  是否必填
     * @return {boolean}
     */
    required(value, isRequired) {
        if (isRequired === 'false' || !isRequired) {
            return true
        }
        if (getType(value) === 'array') {
            return value.length > 0
        } else if (getType(value) === 'object') {
            return Object.keys(value).length > 0
        } else if (value === 0) {
            return true
        }
        return !!value
    },
    /**
     * 类型验证
     * @param {any} value   输入值
     * @param {string} type 类型 
     * @return {boolean}
     */
    type(value, type = '') {
        const rule = _typeRegExps[type.toUpperCase()]
        if (!rule) {
            warn(`v-type="${type}" does not match any rules so it will be ignored`)
            return true
        }
        return rule.test(value)
    },
    /**
     * 字符串长度验证
     * @param {string} value  输入值
     * @param {number} length 长度
     * @return {boolean}
     */
    length(value, length) {
        return String(value).length === parseInt(length)
    },
    /**
     * 字符串最小长度验证
     * @param {string} value  输入值
     * @param {number} minlen 最小长度
     * @return {boolean}
     */
    minLength(value, minlen) {
        return String(value).length >= parseInt(minlen)
    },
    /**
     * 字符串最大长度验证
     * @param {string} value  输入值
     * @param {number} maxlen 最大长度
     * @return {boolean}
     */
    maxLength(value, maxlen) {
        return String(value).length <= parseInt(maxlen)
    },
    /**
     * 最小值验证
     * @param {any} value       输入值
     * @param {number} minValue 最小值
     * @return {boolean} 如果最小值不是个数值，则视为验证规则无效，验证返回合法
     */
    min(value, minValue) {
        minValue = parseFloat(minValue)
        if (isNaN(minValue)) {
            return true
        }
        if (value === null || value === undefined || value === '') {
            return true
        }
        return +value >= minValue
    },
    /**
     * 最大值验证
     * @param {any} value       输入值
     * @param {number} minValue 最大值
     * @return {boolean} 如果最大值不是个数值，则视为验证规则无效，验证返回合法
     */
    max(value, maxValue) {
        maxValue = parseFloat(maxValue)
        if (isNaN(maxValue)) {
            return true
        }
        if (value === null || value === undefined || value === '') {
            return true
        }
        return +value <= maxValue
    },
    /**
     * 正则验证
     * @param {string} value       输入值
     * @param {string|RegExp} rule 正则
     * @return {boolean}
     */
    pattern(value, rule) {
        if (typeof rule === 'string') {
            rule = new RegExp(rule)
        }
        return rule.test(value || '')
    },
    /**
     * 自定义验证
     * @param {any} value                   输入值
     * @param {boolean} customCheckResult   自定义验证结果
     * @return {boolean}
     */
    custom(value, customCheckResult) {
        return customCheckResult
    }
}

/**
 * 规则验证优先级表
 * @const
 */
export const priorityMap = {
    required: 1,
    type: 2,
    length: 3,
    minLength: 4,
    maxLength: 5,
    min: 6,
    max: 7,
    pattern: 100,
    custom: 200
}