## 安装
### NPM
```sh
npm i bubble-validator -S
```
安装完成后，请引入并且通过`mixin`使用它：
```js
import BubbleValidator from 'bubble-validator'
const validator = BubbleValidator()

export default {
    mixins: [validator],
    // ...
}
```

## 快速上手
在您的 Vue 模板标签上使用 BubbleValidator，您需要：
- 为`v-model`指令添加`.validator`修饰符：
- 添加`name`指定验证唯一标识符
- 添加所需的验证指令，如校验必填（`v-required`）
```html
<div>
    <input
        name="text"
        type="text"
        class="form-control"
        v-required
        v-model.validator="myText" />
</div>
```
这样子做之后，这一表单项就变为可验证的了，之后当数据非法时，我们就能够采取一系列措施，如增加错误提示：
```html
<div>
    <input
        name="myName"
        type="text"
        class="form-control"
        v-required
        v-model.validator="myText" />
    <span v-if="v('myName')">
        请输入必填项！
    </span>
</div>
```
如此一来，当表单失焦或者用户输入非法时，就会出现错误提示。

此外，您还可以在提交表单的时候做一次兜底验证，做法也很简单，如：
```js
export default {
    // ...
    methods: {
        handleSubmit() {
            this.checkValidity()
            if (this.validation.invalid) {
                this.$notify('请检查您的输入！')
                return
            }
            // ...
        }
        // ...
    }
}
```
可能您会有疑问，为什么是`this.checkValidity()`后判断`this.validation.invalid`，而非直接给`this.checkValidity()`一个返回值来表示验证结果呢？
这是因为：
> `checkValidity()` 的作用是用于更新验证结果集，大部分场景下，我们希望在验证失败时阻止这次提交。但是有一些场景下，导致验证失败可能有多个原因，而我们希望获得对多个原因的一个处理时机时，采取先更新结果集，后判断结果标志集的这种方式会更方便