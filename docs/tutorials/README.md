## 可验证节点
为了进行验证工作，您需要将待验证的节点声明为`可验证节点`，将一个节点声明为`可验证节点`的步骤为：
- **第一步，指定唯一标识符**。对于原生表单控件，添加`name`属性指定；对于普通组件、非原生表单组件（如`ElementUI`里的表单组件`<el-input>`等），则添加`data-name`属性指定
- **第二步，绑定验证数据**，即验证是基于所绑定值进行验证的：
    1. 对于原生表单控件，为`v-model`加入`.validator`修饰符，即：`v-model.validator`
    2. 对于普通组件、非原生表单组件，不能使用`v-model.validator`，应使用`v-validator`
    3. 如果您偏向于一种统一的写法，那么事实上都可以只使用`v-validator`进行绑定
示例：
```html
<el-input
    data-name="foo"
    v-model="foo"
    v-required
    v-validator="foo" />
<span v-if="v('foo')">请输入FOO！</span>
```
JS部分：
```js
export default {
    data() {
        return {
            foo: ''
        }
    }
}
```

## 结果集
`bubble-validator`会将验证结果维护在`validation`这一对象里，暴露部分结果集为响应式数据，您可以拿到这个数据使用做一些展示逻辑上的处理。

假设一个验证指令为`v-[ruleName]`，那么其验证结果维护在`validation[name][ruleName]`中，您可以通过`v(name, ruleName)`访问。当验证非法时，`v(name, ruleName)`返回`true`

除了与指令相关的结果集，还维护了如下一些辅助结果集：
- `invalid`，通过`v(name)`或者`v(name, 'invalid')`访问，表示的是绑定在当前`可验证节点`上的所有验证指令验证综合起来的验证结果，返回`true`时表示`可验证节点`当前验证非法
- `valid`，与`invalid`语义相反，可以使用`v(name, 'valid')`访问，返回`true`时表示`可验证节点`验证合法
- `untouched`，通过`v(name, 'untouched')`访问，返回`true`时表示`可验证节点`未被用户操作过
- `touched`，通过`v(name, 'touched')`访问，返回`true`时表示`可验证节点`被用户操作过
- `pristine`，通过`v(name, 'pristine`)访问，返回`true`时表示`可验证节点`数据是干净的（与初始数据一致）
- `dirty`，通过`v(name, 'dirty')`访问，返回`true`时表示`可验证节点`的数据修改过
- `modified`，通过`v(name, 'modified')`访问，返回`true`时表示`可验证节点`的数据修改过（与原始数据不一致）

> **说明：** `dirty`和`modified`的区别在于，只要用户修改过数据，那么`dirty`就为`true`，即使经过多次修改，最后的数据和原始数据一致，`dirty`也仍然为`true`；而`modified`则不管是否修改过数据，只要后来的数据和初始数据不一致，就为`true`。

## 配合 ElementUI 使用
`bubble-validator`已经添加了对非原生表单控件的支持，只要自定义表单组件上实现了`focus`事件和`blur`事件，那么`bubble-validator`都能够获得处理时机从而进行数据验证，以下是配合`ElementUI`进行使用的示例：
```html
<el-form label-width="200px">
    <el-form-item
        label="姓名"
        :error="v('name') && '请输入姓名！'">
        <el-input
            data-name="name"
            v-required
            v-validator="name"
            v-model="name" />
    </el-form-item>
</el-form>
```

## v-required
您可以添加`v-required`指令来验证必填，当`v-required="true"`时开启验证，它的验证逻辑为：
- 对于原始数据类型，除了`number`类型的`0`之外，如果是`falsy`数据则验证非法
- 对于数组，当`array.length === 0`时，验证非法
- 对于对象，当`Object.keys(obj).length === 0`时，验证非法

## v-type
可以添加`v-type`指令来验证数据是否符合某一类型，支持的验证类型为：
- `v-type="'iso_date'"`，判断是否符合ISO日期格式
- `v-type="'url'"`，判断是否符合URL格式
- `v-type="'email'"`，判断是否符合邮件格式
- `v-type="'number'"`，判断是否符合整数格式
- `v-type="'date'"`，判断是否符合`YYYY-MM-DD`格式
- `v-type="'time'"`，判断是否符合`HH:MM`格式或者`HH:MM:SS`格式

## v-length
可以添加`v-length`指令来验证字符串的长度是否符合要求，如：`v-length="100"`，当字符串长度不为`100`时，则验证非法

您还可以使用`v-min-length`和`v-max-length`来验证`最小字符串长度`和`最大字符串长度`

## v-min
添加`v-min`指令来验证数值的最大值，如：`v-min="100"`，则当数值大于100时验证非法

## v-max
添加`v-max`指令来验证数值的最小值，如：`v-max="100"`，则当数值小于100时验证非法

## v-pattern
添加`v-pattern`指令来验证数据是否匹配制定正则，示例：
```html
<input name="mobile" v-modle.validator="mobile" v-pattern="/^1[0-9]{10}$/" /> 
<span v-if="v('mobile', 'pattern')">手机号码格式有误！</span>
```

## v-custom
这是`bubble-validator`中最为灵活的验证指令，您可以指定灵活的验证逻辑，可为该指令绑定一个函数，则函数的返回结果即为验证结果：
- 当函数返回`true`时，表示验证合法，`v(name, 'custom')`返回`false`
- 当函数返回`false`时，表示验证非法，`v(name, 'custom')`返回`true`

示例：
```html
<input name="age" v-model.validator="age" v-custom="checkAge()" />
<span v-if="v('age', 'custom')">未成年人不得入内</span>
```
JS：
```js
export default {
    data() {
        return {
            age: 0
        }
    },
    methods: {
        checkAge() {
            return this.age >= 18
        }
    }
}
```
此外，您还可以通过`v(name, 'customCode')`拿到验证结果，从而实现更灵活的验证，示例如下：
```html
<input name="age" v-model.validator="age" v-custom="checkAge()" />
<div class="error" v-if="v('age', 'custom')">
    <span v-if="v('age', 'customCode') === 'NEARLY'">别急，明年你就成年了</span>
    <span v-else-if="v('age', 'customCode') === 'FLOWER'">祖国的花朵啊~</span>
    <span v-else>未成年不得入内</span>
</div>
```
JS：
```js
export default {
    data() {
        return {
            age: 0
        }
    },
    methods: {
        checkAge() {
            if (this.age >= 6 && this.age <= 12) {
                return 'FLOWER'
            }
            if (this.age === 17) {
                return 'NEARLY'
            }
            return this.age >= 18
        }
    }
}
```
