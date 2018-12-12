import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import { uglify } from 'rollup-plugin-uglify'

const inProd = process.env.NODE_ENV === 'production'
const extraPlugins = []

if (inProd) {
    extraPlugins.push(uglify())
}

export default {
    input: './index.js',
    output: {
        file: inProd ? './dist/index.min.js' : './dist/index.js',
        format: 'umd',
        name: 'BubbleValidator'
    },
    plugins: [
        resolve(),
        babel({
            exclude: 'node_modules/**'
        }),
        ...extraPlugins
    ]
}
