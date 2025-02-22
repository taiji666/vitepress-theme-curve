---
title: 39语法扩展：通过JSX来做语法扩展
date: 2025-02-22
categories: [JavaScript进阶实战课]
---
```text
                            39 语法扩展：通过JSX来做语法扩展
                            你好，我是石川。
```

在前面一讲中，我们提到了 React 也有一个 JavaScript 的语法扩展，叫做 JSX。它的全称是 JavaScript XML，顾名思义，它是以 XML 为格式设计的。它最主要的目的是与 React 框架结合，用于应用中 Web UI 相关的开发。在React中，DOM 树是通过 JSX 来定义的，最终会在浏览器中渲染成 HTML。基于 React 的普及率，即使你没有用过 React，估计对 JSX 也有所耳闻。

今天，我们就来看看 JSX 是如何用在 Web UI 开发中的。即使你不使用 React，这样的模版模式也有很大的借鉴意义。

类HTML的元素

首先，我们来看下 JSX 的基本使用，它是如何创建元素、相关的属性和子元素的。

```javascript
var title = <h1 className="title">页面标题</h1>;

```
```javascript
var title = React.createElement("h1", {className: 'title'}, "页面标题");
```

```javascript
// 转译前
var image = <img src="logo.png" alt="company logo" />;

// 转译后
var image = React.createElement("img", {
              src: "logo.png",
              alt: "company logo"
            });

```
```javascript
// 转译前
var sidebar = (
  <div className="sidebar">
    <h2 className="menu">菜单</h2>
    <p className="text">菜单内容</p>
  </div>
);

// 转译后
var sidebar = React.createElement(
    "div", { className: "sidebar"},  
    React.createElement("h1", className: "menu"},  
                        "菜单"),    
    React.createElement("p", className: "text"},   
                        "菜单内容"));

```
```javascript
// 转译前
var element = <h1 class"title">页面标题</h1>;

// 转译后
var element = React.createElement(
  'h1',
  {className: 'title'},
  '页面标题'
);

// createElement 返回的对象
var element = {
  type: 'h1',
  props: {
    className: 'title',
    children: '页面标题'
  }
};

// createElement 返回对象的渲染
var root = ReactDOM.createRoot(
  document.getElementById('root')
);
root.render(element);

```
因为今天我们主要讲的是 JSX 的语法扩展，而不是 React 本身，所以我们就不对返回的 element 对象和渲染过程的细节做赘述了。不过，有一点值得注意的是，你可以用 Babel 配置对 React 中 createElement() 以外的创建元素的函数做转译。这样做，就可以在 React 以外的地方来使用类似的 JSX 表达了。

JS和CSS的表达

上面，我们学习了 JSX 语法扩展的核心概念，下面，我们再来看看它是如何与 JavaScript 以及 CSS 的表达来结合使用的。

```javascript
function article(className, title, content, linebreak=true) {
  return (
    <div className={className}>
      <h1>{title}</h1>
      { linebreak && <br /> }
      <p>{content}</p>
    </div>
  );
}

function article(className, title, content, subtitle=true) {
  return React.createElement("div", { className: className },
                             React.createElement("h1", null, title),
                             subtitle && React.createElement("br", null),
                             React.createElement("p", null, content));
}
```

在这个例子中，article() 函数的作用是返回一个 JSX 元素，它有四个参数。Babel 会将例子中的代码翻译为以下内容。

这段代码很容易阅读和理解：转译后，大括号消失了，生成的代码将 article() 函数传入的参数传递给 React.createElement()。请注意我们在这里对 linebreak 参数和 && 运算符的使用。在实际的调用中，如果只有三个实参传入 article()，则  默认为 true，外部 createElement() 调用的第四个参数是  元素。但是，如果我们将 false 作为第四个参数传递给 article()，那么外部 createElement() 调用的第四个自变量的值将为 false，就不会创建  元素。使用 && 运算符是 JSX 中常见的习惯用法，它可以根据其它表达式的值有条件地包含或排除子元素。这个习惯用法适用于 React，因为 React 会忽略 false 或 null 的子级，而不会为它们生成任何输出。

```javascript
function list(items, callback) {
  return (
    <ul style={ {padding:10, border:"solid red 4px"} }>
      {items.map((item,index) => {
        <li onClick={() => callback(index)} key={index}>{item}</li>
      })}
    </ul>
  );
}
```

这里，函数使用对象字面量作为 ＜ul＞ 元素上 CSS 样式（style）的属性的值。注意，这里需要用到的是双大括号。＜ul＞元素有一个子元素，但该子元素的值是一个数组。输出的数组是通过在输入的数组上使用 map() 的映射方法来创建 ＜li＞ 子元素的。并且在这里，每个嵌套的 ＜li＞ 子元素都有一个 onClick 事件处理程序属性，其值是一个箭头函数。

```javascript
function list(items, callback) {
  return React.createElement(
    "ul",
    { style: { padding: 5, border: "dotted green 3px" } },
    items.map((item, index) =>
      React.createElement(
        "li",
        { onClick: () => callback(index), key: index },
        item
      )
    )
  );
}
```

React元素类型

另外，JSX 还有一个更重要的特性，就是定义 React 元素的类型。

所有 JSX 元素都以一个标识符开头，紧跟在开口角括号之后。如果该标识符的第一个字母是小写的，那么该标识符将作为字符串传递给 createElement()。但是，如果标识符的第一个字母是大写的，那么它将被视为实际标识符，并且该标识符的 JavaScript 值将作为第一个参数传递给 createElement()。

这意味着 JSX 表达式 ＜CustomButton/＞ 编译为 JavaScript 代码，将全局 CustomButton 对象传递给 React.createElement()。对于 React 来说，这种将非字符串值作为第一个参数传递给 createElement() 的能力可以用来创建组件。

```javascript
function Article(props) {
  return (
    <div>
      <h1>{props.title}</h1>
      { props.linebreak && <br /> }
      <p>{props.content}</p>
    </div>
  );
}

function article(className, title, content, linebreak=true) {
  return (
    <div className={className}>
      <h1>{title}</h1>
      { linebreak && <br /> }
      <p>{content}</p>
    </div>
  );
}
```

```javascript
var article = <Article title="文章标题" content="文章内容"/>;


这个 ＜Article/＞ 元素在转译后如下：

var article = React.createElement(Article, {
  title: "文章标题",
  content: "文章内容"
});
```

这是一个简单的 JSX 表达式，但当 React 渲染它时，它会将第二个参数，也就是 props 对象，传递给第一个参数，也就是 Article() 函数，并将使用该函数返回的 JSX 函数代替  表达式。

```javascript
import React from 'react';
var MyComponents = {
  Calendar: function Calendar(props) {
    return <div>一个{props.color}颜色的日历.</div>;
  }
}
function GreenCalendar() {
  return <MyComponents.DatePicker color="绿" />;
}

```

```javascript
var greeting = <div firstName="三" lastName="张" />;

var props = {firstName: '三', lastName: '张'};
var greeting = <div className = "greeting" {...props} />;


Babel 会将其编译为一个使用 _extends() 的函数，该函数将 className 属性与 props 对象中包含的属性相结合。

var greeting = React.createElement("div",
                                 _extends({className: "greeting"}, props)
                                );
```
总结

今天，我们看到了在JavaScript中，如何通过JavaScript的扩展 JSX，在 JavaScript 中表达 DOM 元素。这样做有几点好处：


```text
它可以更好地赋能以UI和事件驱动的开发，并且通过我们在上节讲到的 Babel 编译器，将相关的表达转译成 createElement() 的函数表达。再利用 createElement() 的函数调用，创建并返回包含相关元素属性定义的对象。最后再通过 render() 的方式将元素对象在浏览器中做渲染。同时，它可以和 JavaScript 和 CSS 的表达交叉使用，我们可以在 JSX 的表达中参入 JS 和 CSS 的表达。并且，除了基础类型的值，我们也可以使用数组、函数等对象的数据类型。
通过对 JSX 的使用，也有助于模块化和组件化的开发。
最后，从安全性上来看，JSX 的好处是所有的内容在渲染前都被转换成了字符串，这样也可以有效地防止我们在安全的一讲中提到的跨站脚本攻击（XSS），让我们的应用更安全。
```


思考题

最后，留给你一道思考题，其实在 JSX 之前，基于 JavaScript 就有很多的模版引擎，例如jQuery Template 和 Mustache.js 等。你觉得 JSX 和传统的 JavaScript 模版引擎有什么区别吗？各自的优劣势是怎样的？

欢迎在留言区分享你的经验、交流学习心得或者提出问题，如果觉得有收获，也欢迎你把今天的内容分享给更多的朋友。我们下节课再见！
