/**
 * 常量表
 * Created by hzliurufei on 2018-12-06 22:04:14 
 * @Last Modified by: hzliurufei
 * @Last Modified time: 2018-12-12 16:24:43
 */

// 表单元素标签表
export const FORM_TAGS = ['INPUT', 'TEXTAREA', 'SELECT']

// 内建指令
export const BUILT_IN_DIRECTIVES = ['required', 'length', 'min', 'max', 'pattern', 'custom']

// 保留字校验（防止冲突）
export const PRESERVED_WORDS = ['$fields', 'invalid', 'valid', 'untouched', 'touched', 'pristine', 'dirty', 'modified']

// 布尔值型指令
export const BOOLEAN_DIRECTIVES = ['required']

// 初始验证状态
export const INITIAL_STATUS = {
    invalid: false,
    valid: true,
    untouched: true,
    touched: false,
    pristine: true,
    dirty: false,
    modified: false
}

// 元素类型
export const ELEMENT_TYPE = {
    COMMONFORM: Symbol('COMMONFORM'), // 普通表单类型（非radio/checkbox的input、select、textarea）
    CHECKRADIO: Symbol('CHECKRADIO'),
    NONFORM: Symbol('NONFORM')  // 非表单类型
}
