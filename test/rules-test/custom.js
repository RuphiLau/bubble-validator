const assert = require('assert')
const { validationRules } = require('../../dist/rules')

describe('custom (v-custom="fn")', () => {
    it('should return true when fn() returns true', () => {
        const fn = () => true
        assert.strictEqual(
            validationRules.custom(null, fn()),
            true
        )
    })
    it('should return false when fn() returns false', () => {
        const fn = () => false
        assert.strictEqual(
            validationRules.custom(null, fn()),
            false
        )
    })
})