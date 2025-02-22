---
title: 08深入理解继承、Delegation和组合
date: 2025-02-22
categories: [JavaScript进阶实战课]
---
# 08 深入理解继承、Delegation和组合
                            你好，我是石川。

关于面向对象编程，最著名的一本书就数GoF（Gang of Four）写的《设计模式：可复用面向对象软件的基础》了。这本书里一共提供了23种不同的设计模式，不过今天我们不会去展开了解这些细节，而是会把重点放在其中一个面向对象的核心思想上，也就是组合优于继承。

在JS圈，有不少继承和组合的争论。其实无论是继承还是组合，我们都不能忘了要批判性地思考。批判性思考的核心不是批判，而是通过深度思考核心问题，让我们对事物能有自己的判断。

所以，无论是继承还是组合，都只是方式、方法，它们要解决的核心问题就是如何让代码更加容易复用。



那么接下来，我们就根据这个思路，看看JavaScript中是通过哪些方法来解决代码复用这个问题的，以及在使用不同的方法时它们各自解决了什么问题、又引起了什么问题。这样我们在实际的业务场景中，就知道如何判断和选择最适合的解决方式了。

继承

在传统的OOP里面，我们通常会提到继承（Inheritance）和多态（Polymorphism）。继承是用来在父类的基础上创建一个子类，来继承父类的属性和方法。多态则允许我们在子类里面调用父类的构建者，并且覆盖父类里的方法。

那么下面，我们就先来看下在JavaScript里，要如何通过构建函数来做继承。

如何通过继承多态重用？

```javascript
class Widget {
  appName = "核心微件";
  getName () {
    return this.appName;
  }
}

class Calendar extends Widget {}

var calendar = new Calendar();
console.log(calendar.hasOwnProperty("appName")); // 返回 true
console.log(calendar.getName()); // 返回 "核心微件"

calendar.appName = "日历应用"
console.log(typeof calendar.getName); // 返回 function
console.log(calendar.getName()); // 返回 “日历应用”
```

```javascript
class Widget {
  constructor() {
    this.appName = "核心微件";
  }

  getName () {
    return this.appName;
  }
}

class Calendar extends Widget {
  constructor(){
    super();
    this.appName = "日历应用";
  }
}

var calendar = new Calendar();
console.log(calendar.hasOwnProperty("appName")); // 返回 true
console.log(calendar.getName()); // 返回 "日历应用"
console.log(typeof calendar.getName); // 返回 function
console.log(calendar.getName()); // 返回 “日历应用”

```
```javascript
class WelcomeMessage extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}

```
授权

说完了继承，我们再来看授权这个方法。

什么是授权（Delegation）呢？我打个比方，这里的授权不是我们理解的作为领导（父类）给下属（子类）授权，而是作为个体对象可以授权给一个平台或者他人来一起做一件事。

就好像我和极客时间合作，我的个人精力和专业能力只允许我尽量做好内容，但是我没有精力和经验去做编辑、后期和推广等等，这时就授权给极客时间相关的老师来一起做，我在这件事、这个过程中只是专心把内容的部分做好。

如何通过授权做到重用？

在前面的例子中，结合我们在第1讲里提到的基于原型链的继承，我们会发现使用JavaScript无论是通过函数构建也好，还是加了语法糖的类也好，来模拟一般的面向对象语言，比如Java的类和继承，对于有些开发者来说是比较反直觉的。在使用的时候需要大量的思想转换，才能把JavaScript的底层逻辑转换成实际呈现出来的实现。

```javascript
var Widget = {
  setCity : function(City) {this.city = City; },
  outputCity : function() {return this.city;}
};

var Weather = Object.create(Widget);

Weather.setWeather = function (City, Tempreture) {
  this.setCity(City);
  this.tempreture = Tempreture;
};

Weather.outputWeather = function() {
  console.log(this.outputCity()+ ", " + this.tempreture);
}

var weatherApp1 = Object.create(Weather);
var weatherApp2 = Object.create(Weather);

weatherApp1.setWeather("北京","26度");
weatherApp2.setWeather("南京","28度");

weatherApp1.outputWeather(); // 北京, 26度
weatherApp2.outputWeather(); // 南京, 28度

```
可见，我们创建的Weather天气预报这个对象，授权给了Widget，让Widget在得到授权的情况下，帮助Weather来设定城市和返回城市。Widget对象在这里更像是一个平台，它在得到Weather的授权后为Weather赋能。而Weather对象可以在这个基础上，专注于实现自己的属性和方法，并且产出weatherApp1和weatherApp2的实例。

```javascript
class SetLikeMap {
    // 初始化字典
    constructor() { this.map = new Map(); }
    // 自定义集合接口
    count(key) { /*...*/ }
    add(key) { /*...*/ }
    delete(key) { /*...*/ }
    // 迭代返回字典中的键
    [Symbol.iterator]() { return this.map.keys(); }
    // 部分功能授权给字典
    keys() { return this.map.keys(); }
    values() { return this.map.values(); }
    entries() { return this.map.entries(); }
}
```

组合

说完了授权，我们再来看看组合。当然上面我们说的授权，广义上其实就是一种组合。但是这种组合更像是“个体和平台的合作”；而另一种组合更像是“团队内部的合作”，它也有很多的应用和实现方式，我们可以来了解一下。



如何通过借用做到重用？

在JavaScript中，函数有自带的apply和call功能。我们可以通过apply或call来“借用”一个功能。这种方式，也叫隐性混入（Implicit mixin）。比如在数组中，有一个原生的slice的方法，我们就可以通过call来借用这个原生方法。

```javascript
function argumentSlice() {
    var args = [].slice.call(arguments, 1, 3);
    return args;
}
// example
argumentSlice(1, 2, 3, 4, 5, 6); // returns [2,3]

```
如何通过拷贝赋予重用？

除了“借力”以外，我们还能通过什么组合方式来替代继承呢？这就要说到“拷贝”了。这个方法顾名思义，就是把别人的属性和方法拷贝到自己的身上。这种方式也叫显性混入（Explicit mixin）。

在ES6之前，人们通常要偷偷摸摸地“抄袭”。在ES6之后，JavaScript里才增加了“赋予”，也就是Object.assign()的功能，从而可以名正言顺地当做是某个对象“赋予”给另外一个对象它的“特质和能力”。

那么下面，我们就先看看在ES6之后，JavaScript是如何名正言顺地来做拷贝的。

```javascript
var widget = {
  appName : "核心微件"
}

var calendar = Object.assign({
  appVersion: "1.0.9"
}, widget);

console.log(calendar.hasOwnProperty("appName")); // 返回 true
console.log(calendar.appName); // 返回 “核心微件”
console.log(calendar.hasOwnProperty("appVersion")); // 返回 true
console.log(calendar.appVersion); // 返回 “1.0.9”
```

好，接着我们再来看看在ES6之前，人们是怎么通过“抄袭”来拷贝的。

这里实际上分为“浅度拷贝”和“深度拷贝”两个概念。“浅度拷贝”类似于上面提到的赋予assign这个方法，它所做的就是遍历父类里面的属性，然后拷贝到子类。我们可以通过JavaScript中专有的for in循环，来遍历对象中的属性。

```javascript
// 数组浅拷贝
var a = [ 1, 2 ];
var b = [ ...a ];
b.push( 3 );
a;  // [1,2]
b;  // [1,2,3]

// 对象浅拷贝
var o = {
    x: 1,
    y: 2
};
var p = { ...o };
p.y = 3; 
o.y;  // 2
p.y;  // 3

```
```javascript
function shallowCopy(parent, child) {
  var i;
  child = child || {};
  for (i in parent) {
    if (parent.hasOwnProperty(i)) {
      child[i] = parent[i];
    }
  }
  return child;
}
```

至于深度拷贝，是指当一个对象里面存在嵌入的对象就会深入遍历。但这样会引起一个问题：如果这个对象有多层嵌套的话，是每一层都要遍历吗？究竟多深算深？还有就是如果一个对象也引用了其它对象的属性，我们要不要也拷贝过来？

```javascript
function deepCopy(o) { return JSON.parse(JSON.stringify(o)); }
```

```javascript
function deepCopy(parent, child) {
  var i,
  toStr = Object.prototype.toString,
  astr = "[object Array]";
  child = child || {};
    for (i in parent) {
      if (parent.hasOwnProperty(i)) {
        if (typeof parent[i] === "object") {
          child[i] = (toStr.call(parent[i]) === astr) ? [] : {};
                deepCopy(parent[i], child[i]);
        } else {
          child[i] = parent[i];
        }
      }
  }
  return child;
}
```

如何通过组合做到重用？

```javascript
var touchScreen = {
  hasTouchScreen : () => true
};

var button = {
  hasButton: () => true
};
var speaker = {
  hasSpeaker: () => true
};

const Phone = Object.assign({}, touchScreen, button, speaker);

console.log(
  hasTouchScreen: ${ Phone.hasChocolate() }
  hasButton: ${ Phone.hasCaramelSwirl() }
  hasSpeaker: ${ Phone.hasPecans() }
 );

```
React中的组合优于继承

```javascript
function FancyBorder(props) {
  return (
    <div className={'FancyBorder FancyBorder-' + props.color}>
      {props.children}
    </div>
  );
}

function WelcomeDialog() {
  return (
    <FancyBorder color="blue">
      <h1 className="Dialog-title">
        Welcome
      </h1>
      <p className="Dialog-message">
        Thank you for visiting our spacecraft!
      </p>
    </FancyBorder>
  );
}
```

```javascript
function Dialog(props) {
  return (
    <FancyBorder color="blue">
      <h1 className="Dialog-title">
        {props.title}
      </h1>
      <p className="Dialog-message">
        {props.message}
      </p>
    </FancyBorder>
  );
}
function WelcomeDialog() {
  return (
    <Dialog
      title="Welcome"
      message="Thank you for visiting our spacecraft!" />
  );
}

```
总结

这节课，我们了解了通过JavaScript做到代码复用的几种核心思想和方法，从传统的继承，到JavaScript特色的授权以及组合等方式都有分析。虽然我说授权和组合优于继承，但实际上它们之间的关系不是非黑即白的。

我们看到在前端圈，有很多大佬比如道格拉斯·克罗克福德（Douglas Crockford）和凯尔·辛普森（Kyle Simpson），都是基于授权的对象创建的积极拥护者；而像阿克塞尔·劳施迈尔博士（Dr. Axel Rauschmayer）则是基于类的对象构建的捍卫者。

我们作为程序员，如果对对象和面向对象的理解不深入，可能很容易在不同的论战和观点面前左摇右摆。而实际的情况是，真理本来就不止一个。我们要的“真理”，只不过是通过一个观察角度，形成的一个观点。这样，才能分析哪种方式适合我们当下要解决的问题。这个方式，只有在当下，才是“真理”。而我们通过这个单元整理的方法，目的就是帮助我们做到这样的观测。



思考题

在前面一讲中，我们试着通过去掉对象私有属性的语法糖，来看如何用更底层的语言能力来实现类似的功能。那么，今天你能尝试着实现下JS中的类和继承中的super，以及原型和授权中的Object.create()吗？

欢迎在留言区分享你的答案、交流学习心得或者提出问题，如果觉得有收获，也欢迎你把今天的内容分享给更多的朋友。我们下节课见！


```text
​                        
​                            
```