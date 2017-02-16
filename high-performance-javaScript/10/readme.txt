第十章 Tools 工具
本章关注于这些免费工具：


Profiling 性能分析
在脚本运行期定时执行不同函数和操作，找出需要优化的部分


Network analysis 网络分析
检查图片，样式表，和脚本的加载过程，汇报它们对整个页面加载和渲染的影响

当一个特定的脚本或应用程序没有达到最优状态时，一个性能分析器有助于安排优化工作的先后次序。不过，因为浏览器支持的范围不同，这可能变得很麻烦，但许多厂商在他们的调试工具中提供了性能分析器。有些情况下，性能问题可能与特定浏览器有关，其他情况下，这些症状可能出现在多个浏览器。请记住，在一个浏览器上所进行的优化可能适用于其他浏览器，也可能产生相反的效果。性能分析工具确保优化工作花费在系统中最慢，影响大多数浏览器的地方，而不是去判定那些函数或操作缓慢。

虽然本章大多数内容关注于性能分析工具，其实网络分析工具可以极大提高分析效率，以确保脚本和页面尽可能快地加载运行。在调整代码之前，您应该确保脚本和其他资源的加载过程已经优化过了。图片和样式表加载会影响脚本加载，这取决于浏览器允许多少并发请求，有多少资源需要加载。


JavaScript Profiling JavaScript 性能分析
此工具与所有JavaScript 实例与生俱来，正是语言自身。使用Date 对象可以测量脚本的任何部分。在其它工具出现之前，测试脚本运行时间是一种常用手段，现在仍然会不时用到。通常使用Date 返回当前时间，然后减去另一个Date 值以得到以毫秒为单位的时间差。考虑下面的例子，它比较创建新元素和克隆已有元素所用的时间（参见第三章，DOM 编程）：
demo: date.htm

此类性能分析十分繁琐，它需要手动添加定时器代码。可定义一个Timer 对象处理时间计算并存放那些下一步会用到的时间值。
demo: date.js

正如你看到的，这样做仍需要手工添加代码，但提供了一个建立纯JavaScript 性能分析的模式。通过扩展Timer 对象的概念，一个性能分析工具可以在构造时注册函数并在计时代码中调用它们。


YUI Profiler YUI 分析器
YUI 分析器（http://developer.yahoo.com/yui/profiler/），由Nicholas Zakas 提供，是用JavaScript 编写的JavaScript 分析器。除了计时功能，它还提供了用于函数、对象、和构造器的性能分析接口，还包括性能分析数据的详细报告。它可以跨浏览器工作，其输出数据可提供更强大的报告和分析。

YUI 分析器提供一个通用定时器用于收集性能数据。Profiler 提供一些静态函数，用于启动和停止命名定时器，以及获取性能数据。
var count = 10000, i, element;
Y.Profiler.start('createElement');
for (i = 0; i < count; i++) {
element = document.createElement ('div');
}
Y.Profiler.stop('createElement');
alert('created ' + count + ' in ' + Y.Profiler.getAverage('createElement') + 'ms');

很明显，它改进了内联Date 和Timer 方法，提供额外的性能数据包括调用次数，平均时间，最小时间，最大时间等。这些数据收集起来可以与其他测试结果综合分析。

函数分析只需要注册一下。注册的函数被收集性能数据的代码调用。例如，要分析第二章提到的全局initUI 方法，仅仅需要传入它的名字：
Y.Profiler.registerFunction("initUI");

许多函数是与对象绑定的，以防止污染全局命名空间。对象方法也可以通过reguisterFunction 注册，只要将对象作为第二个参数传入。例如，假设一个称作uiTest 的对象实现了两个方法，分别为uiTest.test1 和uiTest.test2，每个方法都可以独立注册：
Y.Profiler.registerFunction("test1", uiTest);
Y.Profiler.registerFunction("test2", uiTest);

一切正常，但还是不能真正测量多个函数或整个应用程序。registerObject 方法自动注册绑定到对象的每一个方法：
Y.Profiler.registerObject("uiTest", uiTest);

第一个参数是对象的名字（用于报告），第二个参数是对象本身。它将分析uiTest 的所有方法。

那些从原形继承的对象需要特殊处理。YUI 分析工具允许注册构造器函数，它可以调用对象的所有实例中的所有方法：
Y.Profiler.registerConstructor("MyWidget", myNameSpace);

现在，所有myNameSpace.MyWidget 实例的每个函数都将被测量并记入报告。一个独立的报告可像获取对象那样获取：
var initUIReport = Y.Profiler.getReport("initUI");

这样得到一个包含分析数据的对象，它包含一个由时间点构成的数组，它们按照调用顺序排列。这些时间点可用于绘图或者用其他感兴趣的方法进行分析，以检查时间上的变化。这个对象具有如下字段：
{
min: 100,
max: 250,
calls: 5,
avg: 120,
points: [100, 200, 250, 110, 100]
};

有时您只关心其中的某些字段。静态Profiler 方法提供每个函数或方法的离散数据：
var uiTest1Report = {
calls: Y.Profiler.getCalls("uiTest.test1"),
avg: Y.Profiler.getAvg("uiTest.test1")
};

一个视图高亮显示出代码中最慢的部分，那也是真正需要分析脚本性能的地方。另外一个功能可报告出对象或构造器所调用的所有已注册的函数：
var uiTestReport = Y.Profiler.getReport("uiTest");

它返回的对象包含如下数据：
{
test1: {
min: 100,
max: 250,
calls: 10,
avg: 120
},
test2:
min: 80,
max: 210,
calls: 10,
avg: 90
}
};

还可以排序以及采用更有意义的方法察看数据，使代码中速度慢的部分得到更密切的检查。获得所有分析数据的完整报告会包含许多无用信息，诸如那些调用次数为零的函数，或者那些性能已经达到预期指标的函数。为降低这些干扰，可传入一个选择函数来过滤这些数据：
var fullReport = Y.Profiler.getFullReport(function(data) {
return (data.calls > 0 && data.avg > 5);
};

其返回的布尔值用于指出该函数是否应当加入到报告之中，让不感兴趣的数据被抑制掉。

当分析完成后，函数，对象，还有构造器应当分别注销，清理分析数据：
Y.Profiler.unregisterFunction("initUI");
Y.Profiler.unregisterObject("uiTests");
Y.Profiler.unregisterConstructor("MyWidget");

clear()方法保留当前分析目标的注册状态，但清除相关数据。此函数可在每个函数或计时中单独调用：
Y.Profiler.clear("initUI");

如果不传参数，那么所有数据都会被一次性清理：
Y.Profiler.clear();

因为它使用JSON 格式，所以分析报告有多种察看方法。最简单的办法就是在网页上输出为HTML。还可以将它发送到服务器，存入数据库，以实现更强大的报告功能。特别当比较不同的跨浏览器优化技术时特别有用。

没有什么比匿名函数更难以分析了，因为它们没有名字。YUI 分析器提供了一种调用匿名函数的机制，使得它们可以被分析。注册一个匿名函数会返回一个封装函数，可以调用它而不是调用匿名函数：
var instrumentedFunction =
Y.Profiler.instrument("anonymous1", function(num1, num2){
return num1 + num2;
});
instrumentedFunction(3, 5);

它将匿名函数的数据添加到Profiler 的返回集中，获取它的方式与其他分析数据相同：
var report = Y.Profiler.getReport("anonymous1");


Anonymous Functions 匿名函数
使用匿名函数或函数分配会造成分析器的数据模糊。由于这是JavaScript 的通用模式，许多被分析的函数可能是匿名的，对它们测量和分析很困难或根本无法进行。分析匿名函数的最佳办法是给它们取个名字。使用指针指向对象方法而不是闭包，可以实现最广泛的分析覆盖。

比较两种方法，其中一个使用内联函数：
myNode.onclick = function() {
myApp.loadData();
};

另一个使用方法调用：
myApp._onClick = function() {
myApp.loadData();
};
myNode.onclick = myApp._onClick;

使用函数调用可使回顾式分析器自动调用onclick 句柄。这不总是一种实用的方法，因为它可能需要对代码进行大量重构：

为了让分析器能够自动调用匿名函数，添加一个内联名称使报告更加可读：
myNode.onclick = function myNodeClickHandler() {
myApp.loadData();
};

当函数被定义为变量时也可使用这种方法，有些分析器在拾取名称时会遇到麻烦：
var onClick = function myNodeClickHandler() {
myApp.loadData();
};

此匿名函数现在被命名了，使大多数分析器的分析结果显示出有意义的内容。这些命名工作几乎不需要什么工作量，而且可以用开发调试工具自动插入。


Firebug
对开发人员来说，Firefox 是一个时髦的浏览器，部分原因是Firebug 插件（http://www.getfirebug.com/）由Joe Hewitt 首创现在由Mozilla 基金会维护。此工具具有前所未有的代码洞察力，提高了全世界网页开发者的生产力。

Firebug 提供了一个控制台日志输出，当前页面的DOM 树显示，样式信息，能够反观DOM 和JavaScript对象，以及更多功能。它还包括一个性能和网络分析器，这是本节的重点。Firebug 易于扩展，可添加自定义面板。


Console Panel Profiler 控制台面板分析器
Firebug 分析器是控制台面板的一部分。它测量并报告页面中运行的JavaScript。当分析器运行时，报告深入到每个被调用函数的细节，提供高精确的性能数据和变量察看功能，（有助于）找出可能导致脚本运行变慢的原因。

点击Profile 按钮可启动分析过程，触发脚本，再次点击Profile 按钮可停止分析。它包括Calls：函数被调用的次数；Own Time：函数自身运行花费的时间；Time：函数花费的总时间，包括被它调用的函数所花费的时间总和。性能分析过程在浏览器底层调用，所以从控制台面板启动分析时性能开销很小。
demo: firebug-profiler.docx


Console API 终端API
Firebug 还提供了JavaScript 接口用于启动和停止分析器。这可精确控制测量某部分代码。它还提供选项以命名报告，在比较不同的优化技术时特别有价值。
console.profile("regexTest");
regexTest('foobar', 'foo');
console.profileEnd();
console.profile("indexOfTest");
indexOfTest('foobar', 'foo');
console.profileEnd();

在兴趣点上启动和停止分析器，可减少副作用和其他运行脚本造成的干扰。有一点要记住，以这种方法调用分析器会增加脚本的开销。主要是因为调用profileEnd()需要花费时间来生成报告，它阻塞后续执行直到报告生成完毕。较大报告需要更长时间来生成，更好的做法是将profileEnd()调用封装在setTimeout 中，使报告生成过程可以异步进行而不阻塞脚本运行。

分析完成之后，生成了一份新的报告，显示出每个函数占用了多长时间，被调用的次数，占总开销的百分比，还有其它感兴趣的数据。这些数据为功夫应当花在优化函数速度上，还是减少调用次数上提供了依据。

正如YUI 分析器，Firebug 的console.time()函数有助于测量循环和其他分析器不能监视的操作。例如，下面对一小段包含循环的代码进行计时：
console.time("cache node");
for (var box = document.getElementById("box"),
i = 0;
i < 100; i++) {
value = parseFloat(box.style.left) + 10;
box.style.left = value + "px";
}
console.timeEnd("cache node");

在定时器结束之后，时间被输出到控制带上。这可用于比较各种优化方法。控制台可以捕获并记录额外的计时结果，因此很容易并排（显示）分析结果。例如，比较缓存节点引用和缓存节点样式的引用，都需要在计时程序中添加实现代码：
console.time("cache style");
for (var style = document.getElementById("box").style,
i = 0;
i < 100; i++) {
value = parseFloat(style.left) + 10;
style.left = value + "px";
}
console.timeEnd("cache style");

控制台API 使程序员能够灵活地调用不同层次的分析代码，并将结果汇总在报告中，可以用许多感兴趣的方法进行分析。


Net Panel 网络面板
通常，当遇到性能问题时，最好从代码中退出来，看看更大的图景。Firebug 在网络面板中提供了一个网络资源视图（如图10-3）。此面板提供了脚本和其他资源的静态视图，可深入探查脚本对其它文件加载造成的影响和对页面造成的一般影响。
demo： firebug-net-panel.docx

每个资源后面的彩条将加载过程分解为组件阶段（DNS 察看，等待响应，等等）。第一条垂直线（显示为蓝色）指出页面的DOMContentLoaded 事件发出的时间。此事件表明页面的DOM 树已经解析并准备好了。第二条垂直线（红色）指出window 的load 事件发出的时间，它表示DOM 已准备好并且所有外部资源已完成加载。这样就给出了一个场景，关于解析和运行以及页面渲染所花费的时间。

正如你在图中看到的，下载了很多脚本。在时间线上，每个脚本看上去要等待前面的脚本首先启动下一个请求。提高加载性能的最简单的优化办法是减少请求数量，特别是脚本和样式表请求，它们会阻塞其它资源和页面渲染。如果可能的话，将所有脚本合并为一个文件，以减少总的请求数量。这种方法对样式表和图片同样有用。


Internet Explorer Developer Tools IE 开发人员工具
Internet Explorer 8 提供了一个开发工具包，它包含一个分析器。此工具包内建于IE 8，所以不需要额外的下载和安装。像Firebug 一样，IE 分析器包括函数分析和细节报告，可以指出调用次数，花费时间，还有其它数据点。它能够以调用树形式察看报告，分析原生函数，并导出分析数据。虽然它没有网络分析器，但是此分析器可以增补一个通用工具注入Fiddler，它将在本章稍后部分介绍。更多详细信息参见http://msdn.microsoft.com/en-us/library/dd565628(VS.85).aspx

IE 8 的性能分析器（译者注：简体中文版称作“探查器”）可以在开发人员工具中找到（工具菜单 → 开发人员工具）。在按下Start Profiling 按钮（译者注：简体中文版称作“开始配置文件”）之后，所有后续的JavaScript 活动都会被监视并分析。点击Stop Profiling（同一个按钮，只是上面的文字标签变了）（译者注：简体中文版称作“停止配置文件”）将停止分析器并生成一个新的报告。默认快捷键是F5 启动分析器，Shift-F5 停止它。

报告显示了一个平面函数视图，包含每次调用的时间和持续时间。还有一个树状视图，显示了函数调用栈。树形视图使你可以遍历察看调用栈并定位出缓慢代码的路径（参见图10-4）。IE 分析器将使用函数的变量名来显示匿名函数。
demo: ie.docx

IE 分析器还可以观察原生JavaScript 对象方法。你可以添加调用代码来分析原生对象，那么就能够比较String::indexOf 和RegExp::test，用于确定一个HTML 元素的className 属性是否具有特定值。
var count = 10000,
element = document.createElement('div'),
result, i, time;
element.className = 'foobar';
for (i = 0; i < count; i++) {
result = /^foo/.test(element.className);
}
for (i = 0; i < count; i++) {
result = element.className.search(/^foo/);
}
for (i = 0; i < count; i++) {
result = (element.className.indexOf('foo') === 0);
}

这些不同方法所用的时间差异很大。注意，每次调用的平均时间是零。原生函数通常是最后寻找优化的地方，但这是一个有趣的比较实验。同时请注意，由于这个数字很小，可能由于舍入误差和系统内存波动而无法得出确切结论。

虽然IE 分析器目前不提供JavaScript 的API，但它有一个具有日志功能的控制台API。可以将console.time()和console.timeEnd()函数从Firebug 上移植过来，从而在IE 上进行同样的测试。
if (console && !console.time) {
console._timers = {};
console.time = function(name) {
console._timers[name] = new Date();
};
console.timeEnd = function(name) {
var time = new Date() - console._timers[name];
console.info(name + ': ' + time + 'ms');
};
}


Safari Web Inspector Safari 网页监察器
Safari 4 提供了分析器等工具，包括网络分析器，它作为网页检查器的一部分。正如Internet Explorer 开发人员工具那样，网页检查器可以分析原生函数并提供一个可以展开的调用树（视图）。它还包括一个类似Firebug 具有分析功能的控制台API，网络分析器还具有一个资源面板。

要访问网页检查器，首先确定Develop 菜单是否可用。可通过Preferences → Advanced 菜单命令，选中“在菜单栏上显示开发菜单”。然后可以用Develop → Show Web Inspector 打开网页检查器（键盘快捷命令是Option-Command-I）。


Profiles Panel 分析面板
点击Profile 按钮打开分析面板（如图10-6）。点击Enable Profiling 按钮启用分析面板。点击Start Profiling按钮开始分析（右下方的暗色圆圈）。点击Stop Profiling（同一个按钮，现在是公司）停止分析并便是报告。
demo: safari.docx

Safari 模仿了Firebug 的JavaScript API（console.profile()，console.time()，等等），可以用程序启动和停止分析功能。此功能与Firebug 的完全相同，允许你对报告和计时进行命名以提供更好的分析管理。

Safari 提供了一个重视图（由下而上）用于函数分析，和一个树视图（由上而下）用于显示调用栈。默认的重视图将最慢的函数排在前面，并允许遍历调用栈，而树视图可从上至下地从最外层调用进入代码的运行路径。分析调用树有助于揭露与函数调用方法相关的性能问题。

Safari 还增加了一个名为displayName 的属性专用于分析目的。它提供了一种为匿名函数在输出报告中添加名称的方法。考虑下面这个赋值给变量foo 的函数：
var foo = function() {
return 'foo!';
};
console.profile('Anonymous Function');
foo();
console.profileEnd();

添加一个displayName 属性将使报告变得可读。可添加更具有描述意义的名字而不仅限于函数名。
var foo = function() {
return 'foo!';
};
foo.displayName = 'I am foo';

正如前面所讨论过的，添加内联名称是命名匿名函数最简单的方法，而且可以在其他分析器上工作。
var foo = function foo() {
return 'foo!';
};


Resources Panel 资源面板
资源面板可帮助您更好地理解Safari 加载和解析脚本以及其他外部资源的方式。就像Firebug 的网络面板，它提供了一个资源视图，显示出一个发起的请求以及它持续了多长时间。资源以不同颜色显示以方便察看。网页检查器的资源面板将尺寸表与时间表分开，缩小了视觉上的干扰。

请注意，不像某些浏览器那样，Safari 4 能够并行加载脚本而不会互相阻塞。Safari 绕过被阻塞的请求，还要确保脚本按照正确的顺序执行。请记住，这仅适用于HTML 加载时嵌入的那些初始脚本，动态添加的脚本块不会被加载，也不会被运行（参见第一章）。


Chrome Developer Tools Chrome 开发人员工具
Google 也为它的Chrome 浏览器提供了一套开发工具集，有一些基于WebKit/Safari 网页检查器。除了监视网络流量的资源面板之外，Chrome 为所有页面和网络事件添加了一个时间线视图。Chrome 包含网页检查器的分析面板，增加了对当前“堆内存”的快照功能。正如Safari 那样，Chrome 能够分析原生函数并实现了Firebug 的控制台API，包括console.profile 和console.time。

时间线面板提供了所有活动的概况，按类别分为“加载”，“脚本”，或“渲染”。这使得开发人员可以快速定位系统中速度最慢的部分。某些事件包含其他事件行的子树，在报告视图中可以展开或隐藏以显示更多或更少的细节。

点击Chrome 分析面板上的眼睛图标，可获得当前JavaScript 堆内存的快照（图10-11）。其结果按照构造器分组，可以展开察看每个实例。快照可使用性能面板底部的“比较快照”选项来进行比较。带+/-号的Count 列和Size 列显示出快照之间的差异。
demo: chrome.docx


Script Blocking 脚本阻塞
传统上，浏览器每次只能发出一个脚本请求。这样做是为了管理文件之间的以来关系。只要一个文件依赖于另一个在源码中靠后的文件，它所依赖的文件将保证在它运行之前被准备好。脚本之间的差距表明脚本被阻塞了。新式浏览器诸如Safari 4，IE 8，Firefox 3.5，和Chrome 解决这个问题的办法是允许并行下载，但阻塞式运行，以保证依赖体已经准备好了。虽然这使得资源下载更快，页面渲染仍旧会阻塞，直至所有脚本都被执行。

脚本阻塞将因为一个或多个文件初始化缓慢而变得更加严重，值得对它做某些类型的分析，并有可能优化或重构。脚本加载会减慢或停止页面渲染，造成用户等待。网络分析工具有助于找出并优化加载资源之间差距。以图形显示出传送脚本时的差异，可找出那些运行较慢的脚本。这些脚本也许应该推迟到页面渲染之后再加载，或者尽可能优化或重构以减少运行时间。


Page Speed
Page Speed 最初是Google 内部开发所使用的一个工具，后来作为Firebug 插件发布，像Firebug 的网络面板一样提供了关于页面资源加载的信息。然而，除了加载时间和HTTP 状态，它还显示JavaScript 解析和运行所花费的时间，指出造成延迟的脚本，并报告那些没有被使用的函数。这些有价值的信息可帮助确定进一步调查的方向，优化，以及可能的重构。访问http://code.google.com/speed/page-speed/关于安装及其他产品细节。

Page Speed 面板上的分析延迟JavaScript 选项，指出哪些文件可造成延迟或者可以拆分为一个较小的初始化载荷。通常，页面上运行的脚本极少需要渲染初始视图。在图10-12 中您可以看到，大部分代码加载之后，不会在window 发出load 事件之前被用到。延迟（加载）这些不会被立刻用到的代码可使得初始化页面加载过程更快。如果需要的话，脚本和其它资源可以有选择地稍后加载。

Page Speed 还为Firebug 增加了一个页面速度活动面板。此面板类似于Firebug 自己的网络面板，不过它为每个请求提供了更加精细的数据。其中包括每个脚本生命周期的统计分析——解析和运行阶段，给出了脚本之间时间差异的详细报告。这有助于分析特定区域并在需要的情况下重构这些文件。正如传说中的图10-13 显示出红色的脚本解析时间和蓝色的运行时间。运行时间太长的脚本更需要我们用分析器深入研究。

可能有大量时间花费在解析和初始化脚本上，而这些脚本在页面渲染之后还没有用到。页面速度动作面板还提供报告指出哪些函数从来没有被调用过，哪些函数可以延迟使用，基于它们的解析时间以及它们第一次被调用的时间（如图10-14）。

此报告显示了那些从未被调用过或者以后才会被调用的函数初始化所用的总时间。考虑重构代码删除那些未被调用的函数，并且延迟加载那些在初始渲染和设置阶段用不到的代码。


Fiddler
Fiddler 是一个HTTP 调试代理，检查资源在线传输情况，以定位加载瓶颈。它由Eric Lawrence 创建，是一个Windows 下通用的网络分析工具，可为任何浏览器或网页请求给出详细报告。其安装和其它信息参见http://www.fiddler2.com/fiddler2/。

在安装过程中，Fiddler 与IE 和Firefox 自动集成。IE 工具栏上将添加一个按钮，Firefox 的工具菜单中将增加一个菜单项。Fiddler 还可以手工启动。任何浏览器或应用程序发起的网页请求都能够分析。它运行时，所有WinINET 通信都通过Fiddler 进行路由，允许它监视并分析资源下载的性能。某些浏览器（例如Opera 和Safari）不使用WinINET，但它们会自动检测Fiddler 代理，倘若它在浏览器启动之前正在运行的话。任何能够设置代理的程序都可以手工设置指定它使用Fiddler 代理（127.0.0.1，端口：8888）。

像Firebug，网页检查器，Page Speed 一样，Fiddler 提供一个瀑布图，可深入察看哪些资源占用了较长加载时间，哪些资源可能影响了其它资源加载（图10-15）。

在主视窗的左侧面板中选择一个或多个资源。点击时间线标签可以看到通过网络的资源。此视图提供了每个相关联资源之间的计时信息，使你可以研究不同加载策略的效果，以及使阻塞的原因更加明显。

统计标签显示了所有选择资源实际性能的细节视图——包括DNS解析和TCP/IP 连接的时间——以及所请求的各种资源的大小、类型等详细信息（图10-16）。

这些数据帮助你决策哪些地方应当进行更深入的调查。例如，DNS 解析和TCP/IP 连接时间过长可能意味着网络问题。资源图表中可以明显地看出哪种类型的资源在页面加载中比例较大，找出哪些可能需要延迟加载，或者需要进一步分析（如果是脚本类型）。


YSlow
YSlow 工具能够深入视察初始页面视图整体加载和运行过程的性能。它最初由Yahoo!内部的SteveSouders 开发，作为Firefox 插件（通过GreaseMonkey）。它已经发布为一个Firebug 插件，由Yahoo!开发人员维护并定期更新。安装及其他产品细节参见http://developer.yahoo.com/yslow/。

YSlow 为页面加载的外部资源评分，为页面性能提供报告，并给出提高加载速度的建议。它提供的评分基于性能专家们广泛的研究。运用这些反馈信息，并阅读评分背后更多的细节，有助于以最小的资源数量确保最快的页面加载体验。

它将提供关于优化下载和页面渲染速度的建议。每一个评分都包含一个细节视图提供附加信息，以及对规则理由的解释。

一般情况下，提高整体评分将意味着更快的加载和脚本运行。图10-18 显示出由JAVASCRIPT 选项过滤后的结果，还有一些建议，关于如何优化脚本的传输和运行。

在分析结果时，请记住要考虑到一些意外情况。包括决定是否将多个脚本请求合并成一个单独请求，以及哪些脚本或函数应当在页面渲染之后延迟加载。


dynaTrace Ajax Edition Ajax 版的dynaTrace
dynaTrace 是一个强大的Java/.NET 性能诊断工具，它的开发人员已经发布了一个“Ajax 版”用于测量Internet Explorer 的性能（Firefox 版很快就会出现）。这个免费工具提供了一个“终端到终端”性能分析器，从网络和页面渲染，到脚本运行时间和CPU 占用率都能分析。报告显示将所有信息汇总在一起，所以你可以容易地发现瓶颈之所在。结果可导出用于进一步剖析。它可在这里下载：http://ajax.dynatrace.com/pages/。

总结报告如图10-19 所示，提供了一个图形化的概貌，使您马上知道哪些区域需要更多关注。从这里您可以深入到各种具体的报告中，察看某一方面性能的更多细节。

网络视图如图10-20 所示，提供了关于网络生命周期每个阶段花费时间的非常详细的报告，包括DNS解析，连接，和服务器响应时间。它指引你进入网络中可能需要调整的特定区域。下面面板中的报告显示了请求和响应报文头（左侧）和实际请求的响应（右侧）。

选择JavaScript 触发器视图将看到跟踪过程中所发出的每个事件的详细报告（如图10-21）。从这里你可以深入到每个特定的事件中（“load”，“click”，“mouseover”等等）去发现运行时性能问题的根本原因。

此视图包括一个事件可能触发的任意动态（Ajax）请求，以及作为请求结果而运行的任意脚本“回调”。这使您更好地理解用户所体会到的整体性能，由于Ajax 的异步特性，在一个脚本分析报告中可能不怎么明显。


Summary 总结
当网页或应用程序变慢时，分析网上传来的资源，分析脚本的运行性能，使你能够集中精力在那些需要努力优化的地方。

传统的智慧告诉我们应尽量减少HTTP 请求的数量，尽量延迟加载脚本以使页面渲染速度更快，向用户提供更好的整体体验。

使用性能分析器找出脚本运行时速度慢的部分，检查每个函数所花费的时间，以及函数被调用的次数，通过调用栈自身提供的一些线索来找出哪些地方应当努力优化。

虽然花费时间和调用次数通常是数据中最有价值的点，还是应当仔细察看函数的调用过程，可能发现其它优化方法。

这些工具在那些现代代码所要运行的编程环境中不再神秘。在开始优化工作之前使用它们，确保开发时间用在解决问题的刀刃上。