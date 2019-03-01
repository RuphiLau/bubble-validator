/**
 * 通过Mixin暴露校验结果与校验方法
 * Created by hzliurufei on 2018-11-28 16:07:01 
 * @Last Modified by: hzliurufei
 * @Last Modified time: 2019-03-01 11:56:27
 */

import { INITIAL_STATUS } from './const'
import { deriveStatus } from './core'
import getDirectives from './directives'

export default function BubbleValidator(options = {}) {
    options = Object.assign({
        accessor: 'v'
    }, options)
    return {
        data() {
            const validation = Object.assign({}, INITIAL_STATUS)
            return { validation }
        },
        created() {
            this.validation && (this.validation.$fields = [])
        },
        methods: {
            [options.accessor](name, key = 'invalid') {
                const validation = this.validation || {}
                return validation[name] && validation[name][key]
            },
            resetValidation() {
            },
            checkValidity(name, disableSync = false) {
                if (!name) {
                    const fields = this.validation.$fields || []
                    for (const field of fields) {
                        this.checkValidity(field, true)
                    }
                } else {
                    const field = this.validation[name]
                    const value = field.$value
                    const handlers = field.$handlers || []
                    field.invalid = false
                    for (const item of handlers) {
                        if (field.invalid) {
                            field[item.$directive] = false
                        }
                        const isValid = item.$handler(value, item.$directiveVal)
                        // 对于 v-custom，记录 code 便于使用
                        if (item.$directive === 'custom') {
                            this.$set(field, 'customCode', item.$directiveVal)
                            field[item.$directive] = item.$directiveVal !== true
                        } else {
                            field[item.$directive] = !isValid
                        }
                        if (!isValid) {
                            field.invalid = true
                        }
                    }
                    field.valid = !field.invalid
                }
                !disableSync && deriveStatus.call(this)
            }
        },
        directives: getDirectives()
    }
}