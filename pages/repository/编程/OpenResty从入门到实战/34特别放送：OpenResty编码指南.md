---
title: 34特别放送：OpenResty编码指南
date: 2025-02-22
categories: [OpenResty从入门到实战]
---
```text
                            34 特别放送：OpenResty编码指南
                            你好，我是温铭。
```

很多开发语言都有自己的编码规范，来告诉开发者这个领域内一些约定俗成的东西，让大家写的代码风格保持一致，并且避免一些常见的陷阱。这对于新手来说是非常友好的，可以让初学者快速准确地上手。比如 Python 的 PEP 80，就是其中的典范，几乎所有的 Python 开发者都阅读过这份 Python 作者执笔的编码规范。

让开发者统一思想，按照规范来写代码，是一件非常重要的事情。OpenResty 还没有自己的编码规范，有些开发者在提交 PR 后，会在代码风格上被反复 review 和要求修改，消耗了大量本可避免的时间和精力。

其实，在 OpenResty 中，也有两个可以帮你自动化检测代码风格的工具：luacheck 和 lj-releng。前者是 Lua 和 OpenResty 世界通用的检测工具，后者则是 OpenResty 自己用 perl 写的代码检测工具。

对我自己来说，我会在 VS Code 编辑器中安装 luacheck 的插件，这样在我写代码的时候就有工具来自动提示；而在项目的 CI 中，则是会把这两个工具都运行一遍，比如：

luacheck -q lua

./utils/lj-releng lua/*.lua lua/apisix/*.lua 


毕竟，多一个工具的检测总不是坏事。

但是，这两个工具更多的是检测全局变量、每行长度等这些最基础的代码风格，离 Python PEP 80 的详细程度还有遥远的距离，并且也没有文档给你参考。

所以今天，我就根据自己在OpenResty 相关开源项目中的经验，总结了一下 OpenResty 的编码风格文档，这个规范也和一些常见的 API 网关比如 Kong、APISIX 的代码风格是一致的。

缩进

在 OpenResty 中，我们使用 4 个空格作为缩进的标记，虽然 Lua 并没有这样的语法要求。下面是错误和正确的两段代码示例：

```text
--No
if a then
ngx.say("hello")
end
```


```text
--yes
if a then
    ngx.say("hello")
end
```


为了方便，你可以在使用的编辑器中，把 tab 改为 4 个空格，来简化操作。

空格

在操作符的两边，都需要用一个空格来做分隔。下面是错误和正确的两段代码示例：

```text
--No
local i=1
local s    =    "apisix"
```


```text
--Yes
local i = 1
local s = "apisix"
```


空行

不少开发者会把其他语言的开发习惯带到 OpenResty 中来，比如在行尾增加一个分号：

```text
--No
if a then
    ngx.say("hello");
end;
```


但事实上，增加分号会让 Lua 代码显得非常丑陋，也是没有必要的。同时，你也不要为了节省代码的行数，追求所谓的“简洁”，而把多行代码变为一行。这样做会让你在定位错误的时候，不知道到底是哪一段代码出了问题：

```text
--No
if a then ngx.say("hello") end
```


```text
--yes
if a then
    ngx.say("hello")
end
```


另外，函数之间需要用两个空行来做分隔：

```javascript
--No
local function foo()
end
 local function bar()
end
```


```javascript
--Yes
local function foo()
end
```


```javascript
 local function bar()
end
```


如果有多个 if elseif 的分支，它们之间也需要一个空行来做分隔：

```text
--No
if a == 1 then
    foo()    
elseif a== 2 then
    bar()    
elseif a == 3 then
    run()    
else
    error()
end
```


```text
--Yes
if a == 1 then
    foo()
```

```text
elseif a== 2 then
    bar()
```

```text
elseif a == 3 then
    run()
```

```text
else
    error()
end
```


每行最大长度

每行不能超过 80 个字符，如果超过的话，需要你换行并对齐。并且，在换行对齐的时候，我们要体现出上下两行的对应关系。就下面的示例而言，第二行函数的参数，要在第一行左括号的右边。

```text
--No 
return limit_conn_new("plugin-limit-conn", conf.conn, conf.burst, conf.default_conn_delay)
```


```text
--Yes
return limit_conn_new("plugin-limit-conn", conf.conn, conf.burst,
                    conf.default_conn_delay)
```


如果是字符串拼接问题的对齐，则需要把 .. 放到下一行中：

```text
--No 
return limit_conn_new("plugin-limit-conn" ..  "plugin-limit-conn" ..
                    "plugin-limit-conn")
```


```text
--Yes
return limit_conn_new("plugin-limit-conn" .. "plugin-limit-conn"
                    .. "plugin-limit-conn")
```


变量

这一点我前面也多次强调过，我们应该永远使用局部变量，不要使用全局变量：

```text
--No
i = 1
s = "apisix"
```


```text
--Yes
local i = 1
local s = "apisix"
```


至于变量的命名，应该使用 snake_case 风格：

```text
--No
local IndexArr = 1
local str_Name = "apisix"
```


```text
--Yes
local index_arr = 1
local str_name = "apisix"
```


而对于常量，则是要使用全部大写的形式：

```text
--No
local max_int = 65535
local server_name = "apisix"
```


```text
--Yes
local MAX_INT = 65535
local SERVER_NAME = "apisix"
```


数组

在OpenResty中，我们使用table.new 来预先分配数组：

```text
--No
local t = {}
for i = 1, 100 do
   t[i] = i
 end
```


```text
--Yes 
local new_tab = require "table.new"
 local t = new_tab(100, 0)
 for i = 1, 100 do
   t[i] = i
 end
```


另外注意，一定不要在数组中使用 nil：

```text
--No
local t = {1, 2, nil, 3}
```


如果一定要使用空值，请用 ngx.null 来表示：

```text
--Yes
local t = {1, 2, ngx.null, 3}
```


字符串

千万不要在热代码路径上拼接字符串：

```text
--No
local s = ""
for i = 1, 100000 do
    s = s .. "a"
end
```


```text
--Yes
local t = {}
for i = 1, 100000 do
    t[i] = "a"
end
local s =  table.concat(t, "")
```


函数

函数的命名也同样遵循 snake_case：

```javascript
--No
local function testNginx()
end
```


```javascript
--Yes
local function test_nginx()
end
```


并且，函数应该尽可能早地返回：

```javascript
--No
local function check(age, name)
    local ret = true
    if age < 20 then
        ret = false
    end
```

```text
    if name == "a" then
        ret = false
    end
    -- do something else 
    return ret 
```


```javascript
--Yes
local function check(age, name)
    if age < 20 then
        return false
    end
```

```text
    if name == "a" then
        return false
    end
    -- do something else 
    return true 
```


模块

所有 require 的库都要 local 化：

```javascript
--No
local function foo()
    local ok, err = ngx.timer.at(delay, handler)
end
```


```text
--Yes
local timer_at = ngx.timer.at
```

```javascript
local function foo()
    local ok, err = timer_at(delay, handler)
end
```


为了风格的统一，require 和 ngx 也需要 local 化：

```text
--No
local core = require("apisix.core")
local timer_at = ngx.timer.at
```

```javascript
local function foo()
    local ok, err = timer_at(delay, handler)
end
```


```text
--Yes
local ngx = ngx
local require = require
local core = require("apisix.core")
local timer_at = ngx.timer.at
```

```javascript
local function foo()
    local ok, err = timer_at(delay, handler)
end
```


错误处理

对于有错误信息返回的函数，我们必须对错误信息进行判断和处理：

```text
--No
local sock = ngx.socket.tcp()
 local ok = sock:connect("www.google.com", 80)
 ngx.say("successfully connected to google!")
```


```text
--Yes
local sock = ngx.socket.tcp()
 local ok, err = sock:connect("www.google.com", 80)
 if not ok then
     ngx.say("failed to connect to google: ", err)
     return
 end
 ngx.say("successfully connected to google!")
```


而如果是自己编写的函数，错误信息要作为第二个参数，用字符串的格式返回：

```javascript
--No
local function foo()
    local ok, err = func()
    if not ok then
        return false
    end
    return true
end
```


```javascript
--No
local function foo()
    local ok, err = func()
    if not ok then
        return false, {msg = err}
    end
    return true
end
```


```javascript
--Yes
local function foo()
    local ok, err = func()
    if not ok then
        return false, "failed to call func(): " .. err
    end
    return true
end
```


写在最后

这个编程规范算是一个最初版本，我会公开到 GitHub 中来持续更新和维护。如果文中没有包含到你想知道的规范，非常欢迎你留言提问，我来给你解答。也欢迎你把这篇规范分享出去，让更多的OpenResty使用者参与进来。

                        
                        
                            