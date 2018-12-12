const assert = require('assert')
const { validationRules } = require('../../dist/rules')

describe('required', () => {
    const getExecRes = (value, required) => validationRules.required(value, required)
    const useCases = [
        { desc: '<number>0', data: 0, trueExpect: true },
        { desc: '<number>123', data: 123, trueExpect: true },
        { desc: '<string>"Hello"', data: 'Hello', trueExpect: true },
        { desc: '<string>""', data: '', trueExpect: false },
        { desc: '<boolean>true', data: true, trueExpect: true },
        { desc: '<boolean>false', data: false, trueExpect: false },
        { desc: 'undefined', data: undefined, trueExpect: false },
        { desc: 'null', data: null, trueExpect: false },
        { desc: '<array>[]', data: [], trueExpect: false },
        { desc: '<array>[1]', data: [1], trueExpect: true },
        { desc: '<object>{}', data: {}, trueExpect: false },
        { desc: '<object>{ a: 123 }', data: { a: 123 }, trueExpect: true }
    ]
    describe('#v-required="true"', () => {
        for (const useCase of useCases) {
            it(`should return ${useCase.trueExpect} when value is ${useCase.desc}`, () => {
                assert.strictEqual(
                    getExecRes(useCase.data, true),
                    useCase.trueExpect
                )
            })
        }
    })
    describe('#v-required="false"', () => {
        for (const useCase of useCases) {
            it(`should return true when value is ${useCase.desc}`, () => {
                assert.strictEqual(
                    getExecRes(useCase.data, false),
                    true
                )
            })
        }
    })
})