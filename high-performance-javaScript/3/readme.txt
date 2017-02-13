第三章 DOM Scripting DOM 编程
对DOM 操作代价昂贵，在富网页应用中通常是一个性能瓶颈。本章讨论可能对程序响应造成负面影响的DOM 编程，并给出提高响应速度的建议。本章讨论三类问题：
访问和修改DOM 元素
修改DOM 元素的样式，造成重绘和重新排版
通过DOM 事件处理用户响应


DOM in the Browser World 浏览器世界中的DOM
文档对象模型（DOM）是一个独立于语言的，使用XML 和HTML 文档操作的应用程序接口（API）。在浏览器中，主要与HTML 文档打交道，在网页应用中检索XML 文档也很常见。DOM APIs 主要用于访问这些文档中的数据。

尽管DOM 是与语言无关的API，在浏览器中的接口却是以JavaScript 实现的。客户端大多数脚本程序与文档打交道，DOM 就成为JavaScript 代码日常行为中重要的组成部分。

浏览器通常要求DOM 实现和JavaScript 实现保持相互独立。例如，在Internet Explorer 中，被称为JScript的JavaScript 实现位于库文件jscript.dll 中，而DOM 实现位于另一个库mshtml.dll（内部代号Trident）。这种分离技术允许其他技术和语言，如VBScript，受益于Trident 所提供的DOM 功能和渲染功能。Safari
使用WebKit 的WebCore 处理DOM 和渲染，具有一个分离的JavaScriptCore 引擎（最新版本中的绰号是SquirrelFish）。Google Chrome 也使用WebKit 的WebCore 库渲染页面，但实现了自己的JavaScript 引擎V8。在Firefox 中，JavaScript 实现采用Spider-Monkey（最新版中称作TraceMonkey），与其Gecko 渲染引擎相分离。


Inherently Slow 天生就慢
这对性能意味着什么呢？简单说来，两个独立的部分以功能接口连接就会带来性能损耗。一个很形象的比喻是把DOM 看成一个岛屿，把JavaScript（ECMAScript）看成另一个岛屿，两者之间以一座收费桥连接（参见John Hrvatin，微软，MIX09，http://videos.visitmix.com/MIX09/T53F）。每次ECMAScript 需要访问DOM 时，你需要过桥，交一次“过桥费”。你操作DOM 次数越多，费用就越高。一般的建议是尽量减少过桥次数，努力停留在ECMAScript 岛上。本章将对此问题给出详细解答，告诉你应该关注什么地方，以提高用户交互速度。


DOM Access and Modification DOM 访问和修改
简单来说，正如前面所讨论的那样，访问一个DOM 元素的代价就是交一次“过桥费”。修改元素的费用可能更贵，因为它经常导致浏览器重新计算页面的几何变化。

当然，访问或修改元素最坏的情况是使用循环执行此操作，特别是在HTML 集合中使用循环。

为了给你一个关于DOM 操作问题的量化印象
demo: dom-loop.htm

此函数在循环中更新页面内容。这段代码的问题是，在每次循环单元中都对DOM 元素访问两次：一次读取innerHTML 属性能容，另一次写入它。

一个更有效率的版本将使用局部变量存储更新后的内容，在循环结束时一次性写入：
demo: dom-loop-modify.htm

在所有浏览器中，新版本运行速度都要快得多

这些结果清楚地表明，你访问DOM 越多，代码的执行速度就越慢。因此，一般经验法则是：轻轻地触摸DOM，并尽量保持在ECMAScript 范围内。


innerHTML Versus DOM methods innerHTML 与DOM 方法比较
更新页面时，使用虽不标准却被良好支持的innerHTML 属性更好呢，还是使用纯DOM 方法，如document.createElement ()更好呢？如果不考虑标准问题，它们的性能如何？答案是：性能差别不大，但是，在所有浏览器中，innerHTML 速度更快一些，除了最新的基于WebKit 的浏览器（Chrome 和Safari）。
demo: innerHtml.htm和createElement.htm

使用innerHTML 和纯DOM 方法创建HTML 表的比较结果参见图3-3。innerHTML 的好处在老式浏览器上显而易见（在IE6 中innerHTML 比对手快3.6 倍），但在新版本浏览器上就不那么明显了。而在最新的基于WebKit 的浏览器上其结果正好相反：使用DOM 方法更快。因此，决定采用哪种方法将取决于用户经常使用的浏览器，以及你的编码偏好。

如果在一个性能苛刻的操作中更新一大块HTML 页面，innerHTML 在大多数浏览器中执行更快。但对于大多数日常操作而言，其差异并不大，所以你应当根据代码可读性，可维护性，团队习惯，代码风格来综合决定采用哪种方法。


Cloning Nodes 节点克隆
使用DOM 方法更新页面内容的另一个途径是克隆已有DOM 元素，而不是创建新的——即使用element.cloneNode()（element 是一个已存在的节点）代替document.createElement();

在大多数浏览器上，克隆节点更有效率，但提高不太多。用克隆节点的办法重新生成前面例子中的表，单元只创建一次，然后重复执行复制操作，这样做只是稍微快了一点：
在IE8 中快2%，但在IE6 和IE7 中无变化
在Firefox 3.5 和Safari 4 中快了5.5%
在Opera 中快了6%（但是在Opera 10 中无变化）
在Chrome 2 中快了10%，在Chrome 3 中快了3%

一个示例，这里是使用element.cloneNode()创建表的部分代码：
demo: cloneNode.htm


HTML Collections HTML 集合
HTML 集合是用于存放DOM 节点引用的类数组对象。下列函数的返回值就是一个集合：
• document.getElementsByName()
• document.getElementsByClassName()
• document.getElementsByTagName()

下列属性也属于HTML 集合：
document.images
页面中所有的<img>元素

document.links
所有的<a>元素

document.forms
所有表单

document.forms[0].elements
页面中第一个表单的所有字段

这些方法和属性返回HTMLCollection 对象，是一种类似数组的列表。它们不是数组（因为它们没有诸如push()或slice()之类的方法），但是提供了一个length 属性，和数组一样你可以使用索引访问列表中的元素。例如，document.images[1]返回集合中的第二个元素。正如DOM 标准中所定义的那样，HTML 集合是一个“虚拟存在，意味着当底层文档更新时，它们将自动更新”（参见http://www.w3.org/TR/DOM-Level-2-HTML/html.html#ID-75708506）。

HTML 集合实际上在查询文档，当你更新信息时，每次都要重复执行这种查询操作。例如读取集合中元素的数目（也就是集合的length）。这正是低效率的来源。


Expensive collections 昂贵的集合
为演示集合的存在性，考虑下列代码段：
// an accidentally infinite loop
var alldivs = document.getElementsByTagName('div');
for (var i = 0; i < alldivs.length; i++) {
document.body.appendChild(document.createElement('div'))
}
这段代码看上去只是简单地倍增了页面中div 元素的数量。它遍历现有div，每次创建一个新的div 并附加到body 上面。但实际上这是个死循环，因为循环终止条件alldivs.length 在每次迭代中都会增加，它反映出底层文档的当前状态。

像这样遍历HTML 集合会导致逻辑错误，而且也很慢，因为每次迭代都进行查询。

正如在第四章中将要讨论的，不建议用数组的length 属性做循环判断条件。访问集合的length 比数组的length 还要慢，因为它意味着每次都要重新运行查询过程。在下面的例子中，将一个集合coll 拷贝到数组arr 中，然后比较每次迭代所用的时间。
demo: coll-array.htm

当每次迭代过程访问集合的length 属性时，它导致集合器更新，在所有浏览器上都会产生明显的性能损失。优化的办法很简单，只要将集合的length 属性缓存到一个变量中，然后在循环判断条件中使用这个变量

许多用例需要对一个相关的小集合进行遍历，只要将length 缓存一下就足够好了。但是遍历数组比遍历集合快，如果先将集合元素拷贝到数组，访问它们的属性将更快。请记住这需要一个额外的步骤，要遍历集合，所以应当评估在特定条件下使用这样一个数组副本是否有益。

前面提到的toArray()函数可认为是一个通用的集合转数组函数。


Local variables when accessing collection elements 访问集合元素时使用局部变量
一般来说，对于任何类型的DOM 访问，如果同一个DOM 属性或方法被访问一次以上，最好使用一个局部变量缓存此DOM 成员。当遍历一个集合时，第一个优化是将集合引用存储于局部变量，并在循环之外缓存length 属性。然后，如果在循环体中多次访问同一个集合元素，那么使用局部变量缓存它。

在下面的例子中，在循环中访问每个元素的三个属性。最慢的版本每次都要访问全局的document，优化后的版本缓存了一个指向集合的引用，最快的版本将集合的当前元素存入局部变量。所有三个版本都缓存了集合的length 属性。
demo: slow-fast.htm
通过局部引用访问集合带来的速度提升;显示出多次访问时缓冲集合项带来的速度提升。


Walking the DOM DOM 漫谈
DOM API 提供了多种途径访问整个文档结构的特定部分。当你在多种可行方法之间进行选择时，最好针对特定操作选择最有效的API。


Crawling the DOM 抓取DOM
你经常需要从一个DOM 元素开始，操作周围的元素，或者递归迭代所有的子节点。你可以使用childNode集合或者使用nextSibling 获得每个元素的兄弟节点。

考虑这两个同样功能的例子，采用非递归方式遍历一个元素的子节点：
demo: nextSibling-childNode.htm

记住，childNodes 是一个集合，要小心处理，在循环中缓存length 属性所以不会在每次迭代中更新。

在不同浏览器上，这两种方法的运行时间基本相等。但是在IE 中，nextSibling 表现得比childNode 好。在IE6 中，nextSibling 比对手快16 倍，而在IE7 中快乐105 倍。鉴于这些结果，在老的IE 中性能严苛的使用条件下，用nextSibling 抓取DOM 是首选方法。在其他情况下，主要看个人和团队偏好。


Element nodes 元素节点
DOM 属性诸如childNode，firstChild，和nextSibling 不区分元素节点和其他类型节点，如注释节点和文本节点（这两个标签之间往往只是一些空格）。在许多情况下，只有元素节点需要被访问，所以在循环中，似乎应当对节点返回类型进行检查，过滤出非元素节点。这些检查和过滤都是不必要的DOM 操作。

许多现代浏览器提供了API 函数只返回元素节点。如果可用最好利用起来，因为它们比你自己在JavaScript 中写的过滤方法要快。

遍历children 比childNodes 更快，因为集合项更少。HTML 源码中的空格实际上是文本节点，它们不包括在children 集合中。在所有浏览器中children 比childNodes 更快，虽然差别不是太大，通常快1.5 到3倍。特别值得注意的是IE，遍历children 明显快于遍历childNodes——在IE6 中快24 倍，在IE7 中快124倍。


The Selectors API 选择器API
识别DOM 中的元素时，开发者经常需要更精细的控制，而不仅是getElementById()和getElementsByTagName()之类的函数。有时你结合这些函数调用并迭代操作它们返回的节点，以获取所需要的元素，这一精细的过程可能造成效率低下。

另一方面，使用CSS 选择器是一个便捷的确定节点的方法，因为开发者已经对CSS 很熟悉了。许多JavaScript 库为此提供了API，而且最新的浏览器提供了一个名为querySelectorAll()的原生浏览器DOM 函数。显然这种方法比使用JavaScript 和DOM 迭代并缩小元素列表的方法要快。

var elements = document.querySelectorAll('#menu a');
elements 的值将包含一个引用列表，指向那些具有id="menu"属性的元素。函数querySelectorAll()接收一个CSS 选择器字符串参数并返回一个NodeList——由符合条件的节点构成的类数组对象。此函数不返回HTML 集合，所以返回的节点不呈现文档的“存在性结构”。这就避免了本章前面提到的HTML 集合所固有的性能问题（以及潜在的逻辑问题）。

如果不使用querySelectorAll()，达到同样的目标的代码会冗长一些：
var elements = document.getElementById('menu').getElementsByTagName('a');

这种情况下elements 将是一个HTML 集合，所以你还需要将它拷贝到一个数组中，如果你想得到与querySelectorAll()同样的返回值类型的话

当你需要联合查询时，使用querySelectorAll()更加便利。例如，如果页面中有些div 元素的class 名称是"warning"，另一些class 名是"notice"，你可以用querySelectorAll()一次性获得这两类节点。
demo: queryselector.htm

比较这两段代码，使用选择器API 比对手快了2~6倍

你还可以从另一个函数querySelector()获益，这个便利的函数只返回符合查询条件的第一个节点。

这两个函数都是DOM 节点的属性，所以你可以使用document.querySelector('.myclass')来查询整个文档中的节点，或者使用elref.querySelector('.myclass')在子树中进行查询，其中elref 是一个DOM 元素的引用。


Repaints and Reflows 重绘和重排版
当浏览器下载完所有页面HTML 标记，JavaScript，CSS，图片之后，它解析文件并创建两个内部数据结构：
一棵DOM 树
表示页面结构

一棵渲染树
表示DOM 节点如何显示

渲染树中为每个需要显示的DOM 树节点存放至少一个节点（隐藏DOM 元素在渲染树中没有对应节点）。渲染树上的节点称为“框”或者“盒”，符合CSS 模型的定义，将页面元素看作一个具有填充、边距、边框和位置的盒。一旦DOM 树和渲染树构造完毕，浏览器就可以显示（绘制）页面上的元素了。

当DOM 改变影响到元素的几何属性（宽和高）——例如改变了边框宽度或在段落中添加文字，将发生一系列后续动作——浏览器需要重新计算元素的几何属性，而且其他元素的几何属性和位置也会因此改变受到影响。浏览器使渲染树上受到影响的部分失效，然后重构渲染树。这个过程被称作重排版。重排版完成时，浏览器在一个重绘进程中重新绘制屏幕上受影响的部分。

不是所有的DOM 改变都会影响几何属性。例如，改变一个元素的背景颜色不会影响它的宽度或高度。在这种情况下，只需要重绘（不需要重排版），因为元素的布局没有改变。

重绘和重排版是负担很重的操作，可能导致网页应用的用户界面失去相应。所以，十分有必要尽可能减少这类事情的发生。

When Does a Reflow Happen? 重排版时会发生什么？
在下述情况中会发生重排版：
添加或删除可见的DOM 元素
元素位置改变
元素尺寸改变（因为边距，填充，边框宽度，宽度，高度等属性改变）
内容改变，例如，文本改变或图片被另一个不同尺寸的所替代
最初的页面渲染
浏览器窗口改变尺寸

根据改变的性质，渲染树上或大或小的一部分需要重新计算。某些改变可导致重排版整个页面：例如，当一个滚动条出现时。


Queuing and Flushing Render Tree Changes 查询并刷新渲染树改变
因为计算量与每次重排版有关，大多数浏览器通过队列化修改和批量显示优化重排版过程。然而，你可能（经常不由自主地）强迫队列刷新并要求所有计划改变的部分立刻应用。获取布局信息的操作将导致刷新队列动作，这意味着使用了下面这些方法：
• offsetTop, offsetLeft, offsetWidth, offsetHeight
• scrollTop, scrollLeft, scrollWidth, scrollHeight
• clientTop, clientLeft, clientWidth, clientHeight
• getComputedStyle() (currentStyle in IE)（在IE 中此函数称为currentStyle）

布局信息由这些属性和方法返回最新的数据，所以浏览器不得不运行渲染队列中待改变的项目并重新排版以返回正确的值。

在改变风格的过程中，最好不要使用前面列出的那些属性。任何一个访问都将刷新渲染队列，即使你正在获取那些最近未发生改变的或者与最新的改变无关的布局信息。

考虑下面这个例子，它改变同一个风格属性三次（这也许不是你在真正的代码中所见到的，不过它孤立地展示出一个重要话题）：
demo: setting.htm

在这个例子中，body 元素的前景色被改变了三次，每次改变之后，都导入computed 的风格。导入的属性backgroundColor, backgroundImage, 和backgroundAttachment 与颜色改变无关。然而，浏览器需要刷新渲染队列并重排版，因为computed 的风格被查询而引发。

比这个不讲效率的例子更好的方法是不要在布局信息改变时查询它。如果将查询computed 风格的代码搬到末尾，代码看起来将是这个样子：
demo: setting-modify.htm


Minimizing Repaints and Reflows 最小化重绘和重排版
重排版和重绘代价昂贵，所以，提高程序响应速度一个好策略是减少此类操作发生的机会。为减少发生次数，你应该将多个DOM 和风格改变合并到一个批次中一次性执行。

Style changes 改变风格
var el = document.getElementById('mydiv');
el.style.borderLeft = '1px';
el.style.borderRight = '2px';
el.style.padding = '5px';
这里改变了三个风格属性，每次改变都影响到元素的几何属性。在这个糟糕的例子中，它导致浏览器重排版了三次。大多数现代浏览器优化了这种情况只进行一次重排版，但是在老式浏览器中，或者同时有一个分离的同步进程（例如使用了一个定时器），效率将十分低下。如果其他代码在这段代码运行时查询布局信息，将导致三次重布局发生。而且，此代码访问DOM 四次，可以被优化。

一个达到同样效果而效率更高的方法是：将所有改变合并在一起执行，只修改DOM 一次。可通过使用cssText 属性实现：
var el = document.getElementById('mydiv');
el.style.cssText = 'border-left: 1px; border-right: 2px; padding: 5px;';

这个例子中的代码修改cssText 属性，覆盖已存在的风格信息。如果你打算保持当前的风格，你可以将它附加在cssText 字符串的后面。
el.style.cssText += '; border-left: 1px;';

另一个一次性改变风格的办法是修改CSS 的类名称，而不是修改内联风格代码。这种方法适用于那些风格不依赖于运行逻辑，不需要计算的情况。改变CSS 类名称更清晰，更易于维护；它有助于保持脚本免除显示代码，虽然它可能带来轻微的性能冲击，因为改变类时需要检查级联表。


Batching DOM changes 批量修改DOM
当你需要对DOM 元素进行多次修改时，你可以通过以下步骤减少重绘和重排版的次数：
从文档流中摘除该元素
对其应用多重改变
将元素带回文档中
    此过程引发两次重排版——第一步引发一次，第三步引发一次。如果你忽略了这两个步骤，那么第二步中每次改变都将引发一次重排版。
    有三种基本方法可以将DOM 从文档中摘除：
    隐藏元素，进行修改，然后再显示它。
    使用一个文档片断在已存DOM 之外创建一个子树，然后将它拷贝到文档中。
    将原始元素拷贝到一个脱离文档的节点中，修改副本，然后覆盖原始元素。

    demo: modify-dom.htm
    使用这个方法，然而，data 队列上的每个新条目追加到DOM 树都会导致重排版。如前面所讨论过的，减少重排版的一个方法是通过改变display 属性，临时从文档上移除<ul>元素然后再恢复它。
    var ul = document.getElementById('mylist');
    ul.style.display = 'none';
    appendDataToElement(ul, data);
    ul.style.display = 'block';

    另一种减少重排版次数的方法是：在文档之外创建并更新一个文档片断，然后将它附加在原始列表上。文档片断是一个轻量级的document 对象，它被设计专用于更新、移动节点之类的任务。文档片断一个便利的语法特性是当你向节点附加一个片断时，实际添加的是文档片断的子节点群，而不是片断自己。下面的例子减少一行代码，只引发一次重排版，只触发“存在DOM”一次。
    var fragment = document.createDocumentFragment();
    appendDataToElement(fragment, data);
    document.getElementById('mylist').appendChild(fragment);

    第三种解决方法首先创建要更新节点的副本，然后在副本上操作，最后用新节点覆盖老节点：
    var old = document.getElementById('mylist');
    var clone = old.cloneNode(true);
    appendDataToElement(clone, data);
    old.parentNode.replaceChild(clone, old);

    推荐尽可能使用文档片断（第二种解决方案）因为它涉及最少数量的DOM 操作和重排版。唯一潜在的缺点是，当前文档片断还没有得到充分利用，开发者可能不熟悉此技术。


Caching Layout Information 缓冲布局信息
浏览器通过队列化修改和批量运行的方法，尽量减少重排版次数。当你查询布局信息如偏移量、滚动条位置，或风格属性时，浏览器刷队列并执行所有修改操作，以返回最新的数值。最好是尽量减少对布局信息的查询次数，查询时将它赋给局部变量，并用局部变量参与计算。

考虑一个例子，将元素myElement 向右下方向平移，每次一个像素，起始于100x100 位置，结束于500x500位置，在timeout 循环体中你可以使用：
// inefficient
myElement.style.left = 1 + myElement.offsetLeft + 'px';
myElement.style.top = 1 + myElement.offsetTop + 'px';
if (myElement.offsetLeft >= 500) {
stopAnimation();
}

这样做很没效率，因为每次元素移动，代码查询偏移量，导致浏览器刷新渲染队列，并没有从优化中获益。另一个办法只需要获得起始位置值一次，将它存入局部变量中var current = myElement.offsetLeft;。然后，在动画循环中，使用current 变量而不再查询偏移量：
current++
myElement.style.left = current + 'px';
myElement.style.top = current + 'px';
if (current >= 500) {
stopAnimation();
}


Take Elements Out of the Flow for Animations 将元素提出动画流
显示和隐藏部分页面构成展开/折叠动画是一种常见的交互模式。它通常包括区域扩大的几何动画，将页面其他部分推向下方。

重排版有时只影响渲染树的一小部分，但也可以影响很大的一部分，甚至整个渲染树。浏览器需要重排版的部分越小，应用程序的响应速度就越快。所以当一个页面顶部的动画推移了差不多整个页面时，将引发巨大的重排版动作，使用户感到动画卡顿。渲染树的大多数节点需要被重新计算，它变得更糟糕。

使用以下步骤可以避免对大部分页面进行重排版：
1.使用绝对坐标定位页面动画的元素，使它位于页面布局流之外。
2.启动元素动画。当它扩大时，它临时覆盖部分页面。这是一个重绘过程，但只影响页面的一小部分，避免重排版并重绘一大块页面。
3.当动画结束时，重新定位，从而只一次下移文档其他元素的位置。

译者注：文字描述比较简单概要，我对这三步的理解如下：
1、页面顶部可以“折叠/展开”的元素称作“动画元素”，用绝对坐标对它进行定位，当它的尺寸改变时，就不会推移页面中其他元素的位置，而只是覆盖其他元素。
2、展开动作只在“动画元素”上进行。这时其他元素的坐标并没有改变，换句话说，其他元素并没有因为“动画元素”的扩大而随之下移，而是任由动画元素覆盖。
3、“动画元素”的动画结束时，将其他元素的位置下移到动画元素下方，界面“跳”了一下。

IE and :hover IE 和:hover
如果大量的元素使用了:hover 那么会降低反应速度。此问题在IE8 中更显著。
例如，如果你创建了一个由500-1000 行5 列构成的表，并使用tr:hover 改变背景颜色，高亮显示鼠标光标所在的行，当鼠标光标在表上移动时，性能会降低。使用高亮是个慢速过程，CPU 使用率会提高到80%-90%。所以当元素数量很多时避免使用这种效果，诸如很大的表或很长的列表。


Event Delegation 事件托管
当页面中存在大量元素，而且每个元素有一个或多个事件句柄与之挂接（例如onclick）时，可能会影响性能。连接每个句柄都是有代价的，无论其形式是加重了页面负担（更多的页面标记和JavaScript 代码）还是表现在运行期的运行时间上。你需要访问和修改更多的DOM 节点，程序就会更慢，特别是因为事件挂接过程都发生在onload（或DOMContentReady）事件中，对任何一个富交互网页来说那都是一个繁忙的时间段。挂接事件占用了处理时间，另外，浏览器需要保存每个句柄的记录，占用更多内存。当这些工作结束时，这些事件句柄中的相当一部分根本不需要（因为并不是100%的按钮或者链接都会被用户点到），所以很多工作都是不必要的。

一个简单而优雅的处理DOM 事件的技术是事件托管。它基于这样一个事实：事件逐层冒泡总能被父元素捕获。采用事件托管技术之后，你只需要在一个包装元素上挂接一个句柄，用于处理子元素发生的所有事件。

根据DOM 标准，每个事件有三个阶段：
捕获
到达目标
冒泡

IE 不支持捕获，但实现托管技术使用冒泡就足够了。

<ul id="menu">
<li>
<a href="menu1.html">menu #1</a>
</li>
<li>
<a href="menu2.html">menu #2</a>
</li>
</ul>
当用户点击了“menu #1”链接，点击事件首先被<a>元素收到。然后它沿着DOM 树冒泡，被<li>元素收到，然后是<ul>，接着是<div>，等等，一直到达文档的顶层，甚至window。这使得你可以只在父元素上挂接一个事件句柄，来接收所有子元素产生的事件通知。

假设你要为图中所显示的文档提供一个逐步增强的Ajax 体验。如果用户关闭了JavaScript，菜单中的链接仍然可以正常地重载页面。但是如果JavaScript 打开而且用户代理有足够能力，你希望截获所有点击，阻止默认行为（转入链接），发送一个Ajax 请求获取内容，然后不刷新页面就能够更新部分页面。使用
事件托管实现此功能，你可以在UL"menu"单元挂接一个点击监听器，它封装所有链接并监听所有click 事件，看看他们是否发自一个链接。
demo: click.htm

跨浏览器部分包括：
访问事件对象，并判断事件源（目标）
结束文档树上的冒泡（可选）
阻止默认动作（可选，但此例中是必须的，因为任务是捕获链接而不转入这些链接）


Summary 总结
DOM 访问和操作是现代网页应用中很重要的一部分。但每次你通过桥梁从ECMAScript 岛到达DOM 岛时，都会被收取“过桥费”。为减少DOM 编程中的性能损失，请牢记以下几点：

最小化DOM 访问，在JavaScript 端做尽可能多的事情。

在反复访问的地方使用局部变量存放DOM 引用。

小心地处理HTML 集合，因为他们表现出“存在性”，总是对底层文档重新查询。将集合的length 属性缓存到一个变量中，在迭代中使用这个变量。如果经常操作这个集合，可以将集合拷贝到数组中。

如果可能的话，使用速度更快的API，诸如querySelectorAll()和firstElementChild。

注意重绘和重排版；批量修改风格，离线操作DOM 树，缓存并减少对布局信息的访问。

动画中使用绝对坐标，使用拖放代理。

使用事件托管技术最小化事件句柄数量。