高性能JavaScript编程

第一章 加载和运行
javaScript在浏览器中的性能，可认为是开发者所要面对的最重要的可用性问题。

大多数浏览器使用单进程处理UI更新和javaScript运行等多个任务,而同一时间只能有一个任务被执行。javaScript运行了多长时间，那么在浏览器空闲下来响应用户输入之前的等待时间就有多长。

<script>标签的出现使整个页面因脚本解析、运行而出现等待。
当浏览器遇到一个<script>标签时，浏览器停下来，运行javaScript代码，然后再继续解析、翻译页面。同样的事情发生在使用src属性加载javaScript的过程中。浏览器必须首先下载外部文件的代码，这要占用一些时间，然后解析并运行此代码。此过程中，页面解析和用交互是被完全阻塞的。


Script Positioning 脚本位置
最好把风格和行为所依赖的部分放在一起，首先加载他们，使得页面可以得到正确的外观和行为。
请记住浏览器在遇到<body>标签之前，不会渲染页面的任何部分。

ie8，firefox3.5，safari4和chrome2允许并行下载javaScript文件。当一个<script>标签正在下载外部资源时，不必阻塞其他<script>标签。javaScript的下载仍然要阻塞其他资源的下载过程（将所有<script>标签放在尽可能接近<body>标签底部的位置，尽量减少对整个页面下载的影响），例如图片。即使脚本之间的下载过程互不阻塞，页面仍旧要等待所有javaScript代码下载并执行完成之后才能继续。浏览器通过允许并行下载提高性能，但脚本阻塞仍旧是个问题。


Grouping Scripts 成组脚本
由于每个<script>标签下载时阻塞页面解析过程，所以限制页面的<script>总数也可以改善性能。这个规则对内联脚本和外部脚本同样适用。每当页面解析碰到一个<script>标签时，紧接着有一段时间用于代码执行。最小化这些延迟时间可以改善页面的整体性能。

每个HTTP请求都会产生额外的性能负担。下载一个100KB的文件比下载四个25KB的文件要快。总之，减少引用外部脚本文件的数量。


Nonblocking Scripts 非阻塞脚本
javaScript倾向于阻塞浏览器某些处理过程，如HTTP请求和界面刷新。保持javaScript文件短小，并限制HTTP请求的数量，只是创建反应迅速的网页应用的第一步。尽管下载一个大javaScript文件只产生一次HTTP请求，却会锁定浏览器一大段时间。为避开这种情况，你需要向页面中逐步增加javaScript，某种程度上说不会阻塞浏览器。

非阻塞脚本的秘密在于，等页面完成加载之后，再加载javaScript源码。从技术角度讲，这意味着在window的load事件发出之后开始下载代码。


Deferred Scripts 延期脚本
HTML 4 为<script>标签定义了一个扩展属性：defer。这个defer 属性指明元素中所包含的脚本不打算修
改DOM，因此代码可以稍后执行。defer 属性只被Internet Explorer 4 和Firefox 3.5 更高版本的浏览器所支
持，它不是一个理想的跨浏览器解决方案。在其他浏览器上，defer 属性被忽略，<script>标签按照默认方
式被处理（造成阻塞）。如果浏览器支持的话，这种方法仍是一种有用的解决方案。示例如下：

<script type="text/javascript" src="file1.js" defer></script>

一个带有defer 属性的<script>标签可以放置在文档的任何位置。对应的JavaScript 文件将在<script>被解析
时启动下载，但代码不会被执行，直到DOM 加载完成（在onload 事件句柄被调用之前）。当一个defer
的JavaScript 文件被下载时，它不会阻塞浏览器的其他处理过程，所以这些文件可以与页面的其他资源一
起并行下载。
demo: defer.htm
如果浏览器不支持defer 属性，那么弹出对话框的顺序是“defer”，“script”和“load”。如果浏览器支持defer 属性，那么弹出对话框的顺序是“script”，“defer”和“load”。
注意，标记为defer 的<script>元素不是跟在第二个后面运行，而是在onload 事件句柄处理之前被调用。


Dynamic Script Elements 动态脚本元素
文档对象模型（DOM）允许你使用JavaScript 动态创建HTML 的几乎全部文档内容。其根本在于，<script>
元素与页面其他元素没有什么不同：引用变量可以通过DOM 进行检索，可以从文档中移动、删除，也可以被创建。一个新的<script>元素可以非常容易地通过标准DOM 函数创建：
demo: create-script.htm
新的<script>元素加载file1.js 源文件。此文件当元素添加到页面之后立刻开始下载。此技术的重点在于：无论在何处启动下载，文件的下载和运行都不会阻塞其他页面处理过程。你甚至可以将这些代码放在<head>部分而不会对其余部分的页面代码造成影响（除了用于下载文件的HTTP 连接）。

当文件使用动态脚本节点下载时，返回的代码通常立即执行（除了Firefox 和Opera，他们将等待此前的所有动态脚本节点执行完毕）。当脚本是“自运行”类型时这一机制运行正常，但是如果脚本只包含供页面
其他脚本调用的接口，则会带来问题。这种情况下，你需要跟踪脚本下载完成并准备妥善的情况。可以使用动态<script>节点发出事件得到相关信息。

Firefox, Opera, Chorme 和Safari 3+会在<script>节点接收完成之后发出一个load 事件。你可以监听这一
事件，以得到脚本准备好的通知：
demo: create-script-loaded.htm

Internet Explorer 支持另一种实现方式，它发出一个readystatechange 事件。<script>元素有一个readyState
属性，它的值随着下载外部文件的过程而改变。readyState 有五种取值：
"uninitialized" The default state
“uninitialized”默认状态
"loading" Download has begun
“loading”下载开始
"loaded" Download has completed
“loaded”下载完成
"interactive" Data is completely downloaded but isn't fully available
“interactive”下载完成但尚不可用
"complete" All data is ready to be used
“complete”所有数据已经准备好

微软文档上说，在<script>元素的生命周期中，readyState 的这些取值不一定全部出现，但并没有指出哪
些取值总会被用到。实践中，我们最感兴趣的是“loaded”和“complete”状态。Internet Explorer 对这两个
readyState 值所表示的最终状态并不一致，有时<script>元素会得到“loader”却从不出现“complete”，但另外
一些情况下出现“complete”而用不到“loaded”。最安全的办法就是在readystatechange 事件中检查这两种状
态，并且当其中一种状态出现时，删除readystatechange 事件句柄（保证事件不会被处理两次）：
demo: create-script-loaded-ie.htm

大多数情况下，你希望调用一个函数就可以实现JavaScript 文件的动态加载。下面的函数封装了标准实
现和IE 实现所需的功能：
demo: create-script-loaded-full.htm

此函数接收两个参数：JavaScript 文件的URL，和一个当JavaScript 接收完成时触发的回调函数。属性检查用于决定监视哪种事件。最后一步，设置src 属性，并将<script>元素添加至页面。此loadScript()函数使用方法如下：
loadScript("file1.js", function(){
    alert("File is loaded!");
});

你可以在页面中动态加载很多JavaScript 文件，但要注意，浏览器不保证文件加载的顺序。所有主流浏览器之中，只有Firefox 和Opera 保证脚本按照你指定的顺序执行。其他浏览器将按照服务器返回它们的次序下载并运行不同的代码文件。你可以将下载操作串联在一起以保证他们的次序，如下：
loadScript("file1.js", function(){
    loadScript("file2.js", function(){
        loadScript("file3.js", function(){
            alert("All files are loaded!");
        });
    });
});
此代码等待file1.js 可用之后才开始加载file2.js，等file2.js 可用之后才开始加载file3.js。虽然此方法可行，但如果要下载和执行的文件很多，还是有些麻烦。如果多个文件的次序十分重要，更好的办法是将这些文件按照正确的次序连接成一个文件。独立文件可以一次性下载所有代码（由于这是异步进行的，使用一个大文件并没有什么损失）。


XMLHttpRequest Script Injection XHR 脚本注入
另一个以非阻塞方式获得脚本的方法是使用XMLHttpRequest(XHR)对象将脚本注入到页面中。此技术首先创建一个XHR 对象，然后下载JavaScript 文件，接着用一个动态<script>元素将JavaScript 代码注入页面。下面是一个简单的例子：
demo: xhr.htm
此代码向服务器发送一个获取file1.js 文件的GET 请求。onreadystatechange 事件处理函数检查readyState是不是4，然后检查HTTP 状态码是不是有效（2XX 表示有效的回应，304 表示一个缓存响应）。如果收到了一个有效的响应，那么就创建一个新的<script>元素，将它的文本属性设置为从服务器接收到的
responseText 字符串。这样做实际上会创建一个带有内联代码的<script>元素。一旦新<script>元素被添加到文档，代码将被执行，并准备使用。

这种方法的主要优点是，你可以下载不立即执行的JavaScript 代码。由于代码返回在<script>标签之外（换句话说不受<script>标签约束），它下载后不会自动执行，这使得你可以推迟执行，直到一切都准备好了。另一个优点是，同样的代码在所有现代浏览器中都不会引发异常。

此方法最主要的限制是：JavaScript 文件必须与页面放置在同一个域内，不能从CDNs 下载（CDN 指“内容投递网络（Content Delivery Network）”，前面002 篇《成组脚本》一节提到）。正因为这个原因，大型网页通常不采用XHR 脚本注入技术。


Recommended Nonblocking Pattern 推荐的非阻塞模式
推荐的向页面加载大量JavaScript 的方法分为两个步骤：第一步，包含动态加载JavaScript 所需的代码，然后加载页面初始化所需的除JavaScript 之外的部分。这部分代码尽量小，可能只包含loadScript()函数，它下载和运行非常迅速，不会对页面造成很大干扰。当初始代码准备好之后，用它来加载其余的JavaScript。
demo： 1-recommend.htm
将此代码放置在body 的关闭标签</body>之前。这样做有几点好处：首先，像前面讨论过的那样，这样做确保JavaScript 运行不会影响页面其他部分显示。其次，当第二部分JavaScript 文件完成下载，所有应用程序所必须的DOM 已经创建好了，并做好被访问的准备，避免使用额外的事件处理（例如window.onload）来得知页面是否已经准备好了。

另一个选择是直接将loadScript()函数嵌入在页面中，这可以避免另一次HTTP 请求
demo： 1-other-recommend.htm
如果你决定使用这种方法，建议你使用“YUI Compressor”(参见第9 章)或者类似的工具将初始化脚本缩
小到最小字节尺寸。

一旦页面初始化代码下载完成，你还可以使用loadScript()函数加载页面所需的额外功能函数。


The YUI 3 approach
YUI 3 的核心设计理念为：用一个很小的初始代码，下载其余的功能代码。


The LazyLoad library
作为一个更通用的工具，Yahoo! Search 的Ryan Grove 创建了LazyLoad 库（参见http://github.com/rgrove/lazyload/）。LazyLoad 是一个更强大的loadScript()函数。LazyLoad 精缩之后只有大约1.5KB（精缩，而不是用gzip 压缩的）
demo: lazyload.htm

LazyLoad 还可以下载多个JavaScript 文件，并保证它们在所有浏览器上都能够按照正确的顺序执行。要
加载多个JavaScript 文件，只要调用LazyLoad.js()函数并传递一个URL 队列给它：
demo: lazyload-more.htm

即使这些文件是在一个非阻塞的方式下使用动态脚本加载，它建议应尽可能减少文件数量。每次下载仍
然是一个单独的HTTP 请求，回调函数直到所有文件下载并执行完之后才会运行。


The LABjs library
另一个非阻塞JavaScript 加载库是LABjs（http://labjs.com/），Kyle Simpson 写的一个开源库，由Steve Souders 赞助。此库对加载过程进行更精细的控制，并尝试并行下载尽可能多的代码。LABjs 也相当小，只有4.50KB（精缩，而不是用gzip 压缩的），所以具有最小的页面代码尺寸。
demo: lab.htm

$LAB.script()函数用于下载一个JavaScript 文件，$LAB.wait()函数用于指出一个函数，该函数等待文件
下载完成并运行之后才会被调用。LABjs 鼓励链操作，每个函数返回一个指向$LAB 对象的引用。要下载
多个JavaScript 文件，那么就链入另一个$LAB.script()调用
demo: lab-more.htm

LABjs 的独特之处在于它能够管理依赖关系。一般来说<script>标签意味着每个文件下载（或按顺序，或并行，如前所述），然后按顺序执行。在某些情况下这非常必要，但有时未必。

LABjs 通过wait()函数允许你指定哪些文件应该等待其他文件。在前面的例子中，first-file.js 的代码不保证在the-rest.js 之前运行。为保证这一点，你必须在第一个script()函数之后添加一个wait()调用
demo: lab-more-orderby.htm

现在，first-file.js 的代码保证会在the-rest.js 之前执行，虽然两个文件的内容是并行下载的。


Summary 总结
管理浏览器中的JavaScript 代码是个棘手的问题，因为代码执行阻塞了其他浏览器处理过程，诸如用户界面绘制。每次遇到<script>标签，页面必须停下来等待代码下载（如果是外部的）并执行，然后再继续处理页面其他部分。但是，有几种方法可以减少JavaScript 对性能的影响：

将所有<script>标签放置在页面的底部，紧靠body 关闭标签</body>的上方。此法可以保证页面在脚本运行之前完成解析。

将脚本成组打包。页面的<script>标签越少，页面的加载速度就越快，响应也更加迅速。不论外部脚本文件还是内联代码都是如此。

有几种方法可以使用非阻塞方式下载JavaScript：
——为<script>标签添加defer 属性（只适用于Internet Explorer 和Firefox 3.5 以上版本）
——动态创建<script>元素，用它下载并执行代码
——用XHR 对象下载代码，并注入到页面中