import installDirectives from './src/directives'
import installMixin from './src/mixin'

const PopValidator = {
    install(Vue, options) {
        installDirectives(Vue)
        installMixin(Vue, options)
    }
}

export default PopValidator