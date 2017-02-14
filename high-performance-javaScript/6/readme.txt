第六章 Responsive Interfaces 响应接口
第一节介绍了浏览器UI 线程概念。总的来说，大多数浏览器有一个单独的处理进程，它由两个任务所共享：JavaScript 任务和用户界面更新任务。每个时刻只有其中的一个操作得以执行，也就是说当JavaScript代码运行时用户界面不能对输入产生反应，反之亦然。或者说，当JavaScript 运行时，用户界面就被“锁定”了。管理好JavaScript 运行时间对网页应用的性能很重要。


The Browser UI Thread 浏览器UI 线程
JavaScript 和UI 更新共享的进程通常被称作浏览器UI 线程（虽然对所有浏览器来说“线程”一词不一定准确）。此UI 线程围绕着一个简单的队列系统工作，任务被保存到队列中直至进程空闲。一旦空闲，队列中的下一个任务将被检索和运行。这些任务不是运行JavaScript 代码，就是执行UI 更新，包括重绘和重排版（在第三章讨论过）。此进程中最令人感兴趣的部分是每次输入均导致一个或多个任务被加入队列。

考虑这样一个简单的接口：按下一个按钮，然后屏幕上显示出一个消息：
demo: handle-click.htm

当例子中的按钮被点击时，它触发UI 线程创建两个任务并添加到队列中。第一个任务是按钮的UI 更新，它需要改变外观以指示出它被按下了，第二个任务是JavaScript 运行任务，包含handleClick()的代码，被运行的唯一代码就是这个方法和所有被它调用的方法。假设UI 线程空闲，第一个任务被检查并运行以更新按钮外观，然后JavaScript 任务被检查和运行。在运行过程中，handleClick()创建了一个新的<div>元素，并追加在<body>元素上，其效果是引发另一次UI 改变。也就是说在JavaScript 运行过程中，一个新的UI更新任务被添加在队列中，当JavaScript 运行完之后，UI 还会再更新一次。
demo: handle-click.docx

当所有UI 线程任务执行之后，进程进入空闲状态，并等待更多任务被添加到队列中。空闲状态是理想的，因为所有用户操作立刻引发一次UI 更新。如果用户企图在任务运行时与页面交互，不仅没有即时的UI 更新，而且不会有新的UI 更新任务被创建和加入队列。事实上，大多数浏览器在JavaScript 运行时停止UI 线程队列中的任务，也就是说JavaScript 任务必须尽快结束，以免对用户体验造成不良影响。


Browser Limits 浏览器限制
浏览器在JavaScript 运行时间上采取了限制。这是一个有必要的限制，确保恶意代码编写者不能通过无尽的密集操作锁定用户浏览器或计算机。此类限制有两个：调用栈尺寸限制（第四章讨论过）和长时间脚本限制。长运行脚本限制有时被称作长运行脚本定时器或者失控脚本定时器，但其基本思想是浏览器记录一个脚本的运行时间，一旦到达一定限度时就终止它。当此限制到达时，浏览器会向用户显示一个对话框。

有两种方法测量脚本的运行时间。第一个方法是统计自脚本开始运行以来执行过多少语句。此方法意味着脚本在不同的机器上可能会运行不同的时间长度，可用内存和CPU 速度可以影响一条独立语句运行所花费的时间。第二种方法是统计脚本运行的总时间。在特定时间内可运行的脚本数量也因用户机器性能差异而不同，但脚本总是停在固定的时间上。毫不奇怪，每个浏览器对长运行脚本检查方法上略有不同：

Internet Explorer，在第4 版中，设置默认限制为5 百万条语句；此限制存放在Windows 注册表中，叫做 HKEY_CURRENT_USER\Software\Microsoft\InternetExplorer\Styles\MaxScriptStatements

Firefox 默认限制为10 秒钟，此限制存放在浏览器的配置设置中（在地址栏中输入about:config）键名为 dom.max_script_run_time。

Safari 默认限制为5 秒钟，此设置不能改变，但你可以关闭此定时，通过启动Develop 菜单并选择“禁止失控JavaScript 定时器”。

Chrome 没有独立的长运行脚本限制，替代以依赖它的通用崩溃检测系统来处理此类实例。

Opera 没有长运行脚本限制，将继续运行JavaScript 代码直至完成，由于Opera 的结构，当运行结束时它并不会导致系统不稳定。

当浏览器的长时间脚本限制被触发时，有一个对话框显示给用户，而不管页面上的任何其他错误处理代码。这是一个主要的可用性问题，因为大多数互联网用户并不精通技术，会被错误信息所迷惑，不知道应该选择哪个选项（停止脚本或允许它继续运行）。

如果你的脚本在浏览器上触发了此对话框，意味着脚本只是用太长的时间来完成任务。它还表明用户浏览器在JavaScript 代码继续运行状态下无法响应输入。从开发者观点看，没有办法改变长运行脚本对话框的外观，你不能检测到它，因此不能用它来提示可能出现的问题。显然，长运行脚本最好的处理办法首先是避免它们。


How Long Is Too Long? 多久才算“太久”？
浏览器允许脚本继续运行直至某个固定的时间，这并不意味着你可以允许它这样做。事实上，你的JavaScript 代码持续运行的总时间应当远小于浏览器实施的限制，以创建良好的用户体验。Brendan Eich，JavaScript 的创造者，引用他的话说，“[JavaScript]运行了整整几秒钟很可能是做错了什么……”

如果整整几秒钟对JavaScript 运行来说太长了，那么什么是适当的时间？事实证明，即使一秒钟对脚本运行来说也太长了。一个单一的JavaScript 操作应当使用的总时间（最大）是100 毫秒。这个数字根据RobertMiller 在1968 年的研究。有趣的是，可用性专家Jakob Nielsen 在他的著作《可用性工程》（Morgan Kaufmann，1944）上注释说这一数字并没有因时间的推移而改变，而且事实上在1991 年被Xerox-PARC（施乐公司的帕洛阿尔托研究中心）的研究中重申。

Nielsen 指出如果该接口在100 毫秒内响应用户输入，用户认为自己是“直接操作用户界面中的对象。”超过100 毫秒意味着用户认为自己与接口断开了。由于UI 在JavaScript 运行时无法更新，如果运行时间长于100 毫秒，用户就不能感受到对接口的控制。

更复杂的是有些浏览器在JavaScript 运行时不将UI 更新放入队列。例如，如果你在某些JavaScript 代码运行时点击按钮，浏览器可能不会将重绘按钮按下的UI 更新任务放入队列，也不会放入由这个按钮启动的JavaScript 任务。其结果是一个无响应的UI，表现为“挂起”或“冻结”。

每种浏览器的行为大致相同。当脚本执行时，UI 不随用户交互而更新。此时JavaScript 任务作为用户交互的结果被创建被放入队列，然后当原始JavaScript 任务完成时队列中的任务被执行。用户交互导致的UI更新被自动跳过，因为优先考虑的是页面上的动态部分。因此，当一个脚本运行时点击一个按钮，将看不到它被按下的样子，即使它的onclick 句柄被执行了。

尽管浏览器尝试在这些情况下做一些符合逻辑的事情，但所有这些行为导致了一个间断的用户体验。因此最好的方法是，通过限制任何JavaScript 任务在100 毫秒或更少时间内完成，避免此类情况出现。这种测量应当在你要支持的最慢的浏览器上执行（关于测量JavaScript 性能的工具，参见第十章）。


Yielding with Timers 用定时器让出时间片
尽管你尽了最大努力，还是有一些JavaScript 任务因为复杂性原因不能在100 毫秒或更少时间内完成。这种情况下，理想方法是让出对UI 线程的控制，使UI 更新可以进行。让出控制意味着停止JavaScript 运行，给UI 线程机会进行更新，然后再继续运行JavaScript。于是JavaScript 定时器进入了我们的视野。


Timer Basics 定时器基础
在JavaScript 中使用setTimeout()或setInterval()创建定时器，两个函数都接收一样的参数：一个要执行的函数，和一个运行它之前的等待时间（单位毫秒）。setTimeout()函数创建一个定时器只运行一次，而setInterval()函数创建一个周期性重复运行的定时器。

定时器与UI 线程交互的方式有助于分解长运行脚本成为较短的片断。调用setTimeout()或setInterval()告诉JavaScript 引擎等待一定时间然后将JavaScript 任务添加到UI 队列中。例如：
function greeting(){
alert("Hello world!");
}
setTimeout(greeting, 250);

此代码将在250 毫秒之后，向UI 队列插入一个JavaScript 任务运行greeting()函数。在那个点之前，所有其他UI 更新和JavaScript 任务都在运行。请记住，第二个参数指出什么时候应当将任务添加到UI 队列之中，并不是说那时代码将被执行。这个任务必须等到队列中的其他任务都执行之后才能被执行。考虑下面的例子：
var button = document.getElementById("my-button");
button.onclick = function(){
oneMethod();
setTimeout(function(){
document.getElementById("notice").style.color = "red";
}, 250);
};

在这个例子中当按钮被点击时，它调用一个方法然后设置一个定时器。用于修改notice 元素颜色的代码被包含在一个定时器设备中，将在250 毫秒之后添加到队列。250 毫秒从调用setTimeout()时开始计算，而不是从整个函数运行结束时开始计算。如果setTimeout()在时间点n 上被调用，那么运行定时器代码的JavaScript 任务将在n+250 的时刻加入UI 队列。
demo: button-click.htm

请记住，定时器代码只有等创建它的函数运行完成之后，才有可能被执行。例如，如果前面的代码中定时器延时变得更小，然后在创建定时器之后又调用了另一个函数，定时器代码有可能在onclick 事件处理完成之前加入队列：
var button = document.getElementById("my-button");
button.onclick = function(){
oneMethod();
setTimeout(function(){
document.getElementById("notice").style.color = "red";
}, 50);
anotherMethod();
};

如果anotherMethod()执行时间超过50 毫秒，那么定时器代码将在onclick 处理完成之前加入到队列中。其结果是等onclick 处理运行完毕，定时器代码立即执行，而察觉不出其间的延迟。

在任何一种情况下，创建一个定时器造成UI 线程暂停，如同它从一个任务切换到下一个任务。因此，定时器代码复位所有相关的浏览器限制，包括长运行脚本时间。此外，调用栈也在定时器代码中复位为零。这一特性使得定时器成为长运行JavaScript 代码理想的跨浏览器解决方案。
demo: button-click-method.htm


Timer Precision 定时器精度
JavaScript 定时器延时往往不准确，快慢大约几毫秒。仅仅因为你指定定时器延时250 毫秒，并不意味任务将在调用setTimeout()之后精确的250 毫秒后加入队列。所有浏览器试图尽可能准确，但通常会发生几毫秒滑移，或快或慢。正因为这个原因，定时器不可用于测量实际时间。

在Windows 系统上定时器分辨率为15 毫秒，也就是说一个值为15 的定时器延时将根据最后一次系统时间刷新而转换为0 或者15。设置定时器延时小于15 将在Internet Explorer 中导致浏览器锁定，所以最小值建议为25 毫秒（实际时间是15 或30）以确保至少15 毫秒延迟。

此最小定时器延时也有助于避免其他浏览器和其他操作系统上的定时器分辨率问题。大多数浏览器在定时器延时小于10 毫秒时表现出差异性。


Array Processing with Timers 在数组处理中使用定时器
一个常见的长运行脚本就是循环占用了太长的运行时间。如果你已经尝试了第四章介绍的循环优化技术，但还是不能缩减足够的运行时间，那么定时器就是你的下一个优化步骤。其基本方法是将循环工作分解到定时器序列中。

典型的循环模式如下：
for (var i=0, len=items.length; i < len; i++){
process(items[i]);
}
这样的循环结构运行时间过长的原因有二，process()的复杂度，items 的大小，或两者兼有。在我的藏书《Professional JavaScript for Web Developers》第二版（Wrox 2009）中，列举了是否可用定时器取代循环的两个决定性因素：
此处理过程必须是同步处理吗？
数据必须按顺序处理吗？

如果这两个回答都是“否”，那么代码将适于使用定时器分解工作。一种基本异步代码模式如下：
var todo = items.concat(); //create a clone of the original
setTimeout(function(){
//get next item in the array and process it
process(todo.shift());
//if there's more items to process, create another timer
if(todo.length > 0){
setTimeout(arguments.callee, 25);
} else {
callback(items);
}
}, 25);

这一模式的基本思想是创建一个原始数组的克隆，将它作为处理对象。第一次调用setTimeout()创建一个定时器处理队列中的第一个项。调用todo.shift()返回它的第一个项然后将它从数组中删除。此值作为参数传给process()。然后，检查是否还有更多项需要处理。如果todo 队列中还有内容，那么就再启动一个定时器。因为下个定时器需要运行相同的代码，所以第一个参数传入arguments.callee。此值指向当前正在运行的匿名函数。如果不再有内容需要处理，将调用callback()函数。
此模式与循环相比需要更多代码，可将此功能封装起来。例如：
function processArray(items, process, callback){
var todo = items.concat(); //create a clone of the original
setTimeout(function(){
process(todo.shift());
if (todo.length > 0){
setTimeout(arguments.callee, 25);
} else {
callback(items);
}
}, 25);
}

processArray()函数以一种可重用的方式实现了先前的模板，并接收三个参数：待处理数组，对每个项调用的处理函数，处理结束时执行的回调函数。该函数用法如下：
var items = [123, 789, 323, 778, 232, 654, 219, 543, 321, 160];
function outputValue(value){
console.log(value);
}
processArray(items, outputValue, function(){
console.log("Done!");
});
此代码使用processArray()方法将数组值输出到终端，当所有处理结束时再打印一条消息。通过将定时器代码封装在一个函数里，它可在多处重用而无需多次实现。


Splitting Up Tasks 分解任务
我们通常将一个任务分解成一系列子任务。如果一个函数运行时间太长，那么查看它是否可以分解成一系列能够短时间完成的较小的函数。可将一行代码简单地看作一个原子任务，多行代码组合在一起构成一个独立任务。某些函数可基于函数调用进行拆分。例如：
function saveDocument(id){
//save the document
openDocument(id)
writeText(id);
closeDocument(id);
//update the UI to indicate success
updateUI(id);
}

如果函数运行时间太长，它可以拆分成一系列更小的步骤，把独立方法放在定时器中调用。你可以将每个函数都放入一个数组，然后使用前一节中提到的数组处理模式：
function saveDocument(id){
var tasks = [openDocument, writeText, closeDocument, updateUI];
setTimeout(function(){
//execute the next task
var task = tasks.shift();
task(id);
//determine if there's more
if (tasks.length > 0){
setTimeout(arguments.callee, 25);
}
}, 25);
}

这个版本将每个方法放入任务数组，然后在每个定时器中调用一个方法。从根本上说，现在它成为数组处理模式，只有一点不同：处理函数就包含在数组项中。正如前面一节所讨论的，此模式也可封装重用：
function multistep(steps, args, callback){
var tasks = steps.concat(); //clone the array
setTimeout(function(){
//execute the next task
var task = tasks.shift();
task.apply(null, args || []);
//determine if there's more
if (tasks.length > 0){
setTimeout(arguments.callee, 25);
} else {
callback();}
}, 25);
}

multistep()函数接收三个参数：用于执行的函数数组，为每个函数提供参数的参数数组，当处理结束时调用的回调函数。函数用法如下：
function saveDocument(id){
var tasks = [openDocument, writeText, closeDocument, updateUI];
multistep(tasks, [id], function(){
alert("Save completed!");
});
}

注意传给multistep()的第二个参数必须是数组，它创建时只包含一个id。正如数组处理那样，使用此函数的前提条件是：任务可以异步处理而不影响用户体验或导致依赖代码出错。


Timed Code 限时运行代码
有时每次只执行一个任务效率不高。考虑这样一种情况：处理一个拥有1'000 个项的数组，每处理一个项需要1 毫秒。如果每个定时器中处理一个项，在两次处理之间间隔25 毫秒，那么处理此数组的总时间是(25 + 1) × 1'000 = 26'000 毫秒，也就是26 秒。如果每批处理50 个，每批之间间隔25 毫秒会怎么样呢？整个处理过程变成(1'000 / 50) × 25 + 1'000 = 1'500 毫秒，也就是1.5 秒，而且用户也不会察觉界面阻塞，因为最长的脚本运行只持续了50 毫秒。通常批量处理比每次处理一个更快。

如果你记住JavaScript 可连续运行的最大时间是100 毫秒，那么你可以优化先前的模式。我的建议是将这个数字削减一半，不要让任何JavaScript 代码持续运行超过50 毫秒，只是为了确保代码永远不会影响用户体验。

可通过原生的Date 对象跟踪代码的运行时间。这是大多数JavaScript 分析工具所采用的工作方式：
var start = +new Date(),
stop;
someLongProcess();
stop = +new Date();
if(stop-start < 50){
alert("Just about right.");
} else {
alert("Taking too long.");
}

由于每个新创建的Data 对象以当前系统时间初始化，你可以周期性地创建新Data 对象并比较它们的值，以获取代码运行时间。加号（+）将Data 对象转换为一个数字，在后续的数学运算中就不必再转换了。这一技术也可用于优化以前的定时器模板。

processArray()方法通过一个时间检测机制，可在每个定时器中执行多次处理：
function timedProcessArray(items, process, callback){
var todo = items.concat(); //create a clone of the original
setTimeout(function(){
var start = +new Date();
do {
process(todo.shift());
} while (todo.length > 0 && (+new Date() - start < 50));
if (todo.length > 0){
setTimeout(arguments.callee, 25);
} else {
callback(items);
}
},25);
}

此函数中添加了一个do-while 循环，它在每个数组项处理之后检测时间。定时器函数运行时数组中存放了至少一个项，所以后测试循环比前测试更合理。在Firefox 3 中，如果process()是一个空函数，处理一个1'000 个项的数组需要38 - 34 毫秒；原始的processArray()函数处理同一个数组需要超过25'000 毫秒。这就是定时任务的作用，避免将任务分解成过于碎小的片断。


Timers and Performance 定时器与性能
定时器使你的JavaScript 代码整体性能表现出巨大差异，但过度使用它们会对性能产生负面影响。本节中的代码使用定时器序列，同一时间只有一个定时器存在，只有当这个定时器结束时才创建一个新的定时器。以这种方式使用定时器不会带来性能问题。

当多个重复的定时器被同时创建会产生性能问题。因为只有一个UI 线程，所有定时器竞争运行时间。Google Mobile 的Neil Thomas 将此问题作为测量性能的方法进行研究，针对iPhone 和Android 上运行的移动Gmail 程序。

Thomas 发现低频率的重复定时器——间隔在1 秒或1 秒以上——几乎不影响整个网页应用的响应。这种情况下定时器延迟远超过使UI 线程产生瓶颈的值，因此可安全地重复使用。当多个重复定时器使用更高的频率（间隔在100 到200 毫秒之间），Thomas 发现移动Gmail 程序明显变慢，反应较差。

Thomas 研究的言外之意是，要在你的网页应用中限制高频率重复定时器的数量。同时，Thomas 建议创建一个单独的重复定时器，每次执行多个操作。


Web Workers 网页工人线程
自JavaScript 诞生以来，还没有办法在浏览器UI 线程之外运行代码。网页工人线程API 改变了这种状况，它引入一个接口，使代码运行而不占用浏览器UI 线程的时间。作为最初的HTML 5 的一部分，网页工人线程API 已经分离出去成为独立的规范（http://www.w3.org/TR/workers/）。网页工人线程已经被Firefox3.5，Chrome 3，和Safari 4 原生实现。

网页工人线程对网页应用来说是一个潜在的巨大性能提升，因为新的工人线程在自己的线程中运行JavaScript。这意味着，工人线程中的代码运行不仅不会影响浏览器UI，而且也不会影响其它工人线程中运行的代码。


Worker Environment 工人线程运行环境
由于网页工人线程不绑定UI 线程，这也意味着它们将不能访问许多浏览器资源。JavaScript 和UI 更新共享同一个进程的部分原因是它们之间互访频繁，如果这些任务失控将导致糟糕的用户体验。网页工人线程修改DOM 将导致用户界面出错，但每个网页工人线程都有自己的全局运行环境，只有JavaScript 特性的一个子集可用。工人线程的运行环境由下列部分组成：

一个浏览器对象，只包含四个属性：appName, appVersion, userAgent, 和platform

一个location 对象（和window 里的一样，只是所有属性都是只读的）

一个self 对象指向全局工人线程对象

一个importScripts()方法，使工人线程可以加载外部JavaScript 文件

所有ECMAScript 对象，诸如Object，Array，Data，等等。

XMLHttpRequest 构造器

setTimeout()和setInterval()方法

close()方法可立即停止工人线程

因为网页工人线程有不同的全局运行环境，你不能在JavaScript 代码中创建。事实上，你需要创建一个完全独立的JavaScript 文件，包含那些在工人线程中运行的代码。要创建网页工人线程，你必须传入这个JavaScript 文件的URL：
var worker = new Worker("code.js");

此代码一旦执行，将为指定文件创建一个新线程和一个新的工人线程运行环境。此文件被异步下载，直到下载并运行完之后才启动工人线程。


Worker Communication 工人线程交互
工人线程和网页代码通过事件接口进行交互。网页代码可通过postMessage()方法向工人线程传递数据，它接收单个参数，即传递给工人线程的数据。此外，在工人线程中还有onmessage 事件句柄用于接收信息。
例如：
var worker = new Worker("code.js");
worker.onmessage = function(event){
alert(event.data);
};
worker.postMessage("Nicholas");

工人线程从message 事件中接收数据。这里定义了一个onmessage 事件句柄，事件对象具有一个data 属性存放传入的数据。工人线程可通过它自己的postMessage()方法将信息返回给页面。

//inside code.js
self.onmessage = function(event){
self.postMessage("Hello, " + event.data + "!");
};

最终的字符串结束于工人线程的onmessage 事件句柄。消息系统是页面和工人线程之间唯一的交互途径。

只有某些类型的数据可以使用postMessage()传递。你可以传递原始值（string，number，boolean，null和undefined），也可以传递Object 和Array 的实例，其它类型就不允许了。有效数据被序列化，传入或传出工人线程，然后反序列化。即使看上去对象直接传了过去，实例其实是同一个数据完全独立的表述。试图传递一个不支持的数据类型将导致JavaScript 错误。


Loading External Files 加载外部文件
当工人线程通过importScripts()方法加载外部JavaScript 文件，它接收一个或多个URL 参数，指出要加载的JavaScript 文件网址。工人线程以阻塞方式调用importScripts()，直到所有文件加载完成并执行之后，脚本才继续运行。由于工人线程在UI 线程之外运行，这种阻塞不会影响UI 响应。例如：
//inside code.js
importScripts("file1.js", "file2.js");
self.onmessage = function(event){
self.postMessage("Hello, " + event.data + "!");
};

此代码第一行包含两个JavaScript 文件，它们将在工人线程中使用。


Practical Uses 实际用途
网页工人线程适合于那些纯数据的，或者与浏览器UI 没关系的长运行脚本。它看起来用处不大，而网页应用程序中通常有一些数据处理功能将受益于工人线程，而不是定时器。

考虑这样一个例子，解析一个很大的JSON 字符串（JSON 解析将在后面第七章讨论）。假设数据足够大，至少需要500 毫秒才能完成解析任务。很显然时间太长了以至于不能允许JavaScript 在客户端上运行它，因为它会干扰用户体验。此任务难以分解成用于定时器的小段任务，所以工人线程成为理想的解决方案。下面的代码说明了它在网页上的应用：
var worker = new Worker("jsonparser.js");
//when the data is available, this event handler is called
worker.onmessage = function(event){
//the JSON structure is passed back
var jsonData = event.data;
//the JSON structure is used
evaluateData(jsonData);
};
//pass in the large JSON string to parse
worker.postMessage(jsonText);

工人线程的代码负责JSON 解析，如下：
//inside of jsonparser.js
//this event handler is called when JSON data is available
self.onmessage = function(event){
//the JSON string comes in as event.data
var jsonText = event.data;
//parse the structure
var jsonData = JSON.parse(jsonText);
//send back to the results
self.postMessage(jsonData);
};

请注意，即使JSON.parse()可能需要500 毫秒或更多时间，也没有必要添加更多代码来分解处理过程。此处理过程发生在一个独立的线程中，所以你可以让它一直运行完解析过程而不会干扰用户体验。

页面使用postMessage()将一个JSON 字符串传给工人线程。工人线程在它的onmessage 事件句柄中收到这个字符串也就是event.data，然后开始解析它。完成时所产生的JSON 对象通过工人线程的postMessage()方法传回页面。然后此对象便成为页面onmessage 事件句柄的event.data。请记住，此工程只能在Firefox 3.5和更高版本中运行，而Safari 4 和Chrome 3 中，页面和工人线程之间只允许传递字符串。

解析一个大字符串只是许多受益于网页工人线程的任务之一。其它可能受益的任务如下：
编/解码一个大字符串
复杂数学运算（包括图像或视频处理）
给一个大数组排序

任何超过100 毫秒的处理，都应当考虑工人线程方案是不是比基于定时器的方案更合适。当然，还要基于浏览器是否支持工人线程。


Summary 总结
JavaScript 和用户界面更新在同一个进程内运行，同一时刻只有其中一个可以运行。这意味着当JavaScript代码正在运行时，用户界面不能响应输入，反之亦然。有效地管理UI 线程就是要确保JavaScript 不能运行太长时间，以免影响用户体验。最后，请牢记如下几点：

JavaScript 运行时间不应该超过100 毫秒。过长的运行时间导致UI 更新出现可察觉的延迟，从而对整体用户体验产生负面影响。

JavaScript 运行期间，浏览器响应用户交互的行为存在差异。无论如何，JavaScript 长时间运行将导致用户体验混乱和脱节。

定时器可用于安排代码推迟执行，它使得你可以将长运行脚本分解成一系列较小的任务。

网页工人线程是新式浏览器才支持的特性，它允许你在UI 线程之外运行JavaScript 代码而避免锁定UI。

网页应用程序越复杂，积极主动地管理UI 线程就越显得重要。没有什么JavaScript 代码可以重要到允许影响用户体验的程度。