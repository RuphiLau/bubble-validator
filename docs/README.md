## 介绍
BubbleValidator 是一个多指令的，面向 Vue 的验证器插件，旨在解决业务开发中的一系列验证场景。它支持表单验证，也支持非表单元素验证。插件内置了多种多样的验证规则，您也可以根据具体的业务需求定制您的特定验证规则。

## 动机
BubbleValidator 的开发启发自在网易考拉内部实践已久的验证器插件 [RegularValidator](https://github.com/maggiehe/regular-validator)，不同的是，它是基于网易自研 MVVM 框架 RegularJS的。数据验证这一需求在电商中后台开发中十分常见，而 RegularValidator 则使得编写验证代码变得更加容易，承接了网易考拉基于 RegularJS 开发的系统中大量的验证工作。

但是随着近些年来前端技术的发展与沉淀，网易考拉的前端系统在技术栈上也逐渐向 Vue 迁移，为了能够继续在 Vue 上使用我们熟悉的 RegularValidator，BubbleValidator 出现了。它是借鉴了 RegularValidator 的核心设计思想，并且在此基础上深度结合 Vue 本身的特点与其自定义指令机制所开发而成的。除了具有几乎与 RegularValidator 相近的 API 外，它还将更为灵活。