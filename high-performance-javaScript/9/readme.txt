第九章 Building and Deploying High-Performance JavaScript Applications
创建并部署高性能JavaScript 应用程序

根据Yahoo!卓越性能团队在2007 年进行的研究，40%-60%的Yahoo!用户没有使用缓存的经验，大约20%页面视图不使用缓存（http://yuiblog.com/blog/2007/01/04/performance-research-part-2/）。另外，由Yahoo!研究小组发现，并由Google 的Steve Souders 所证实的一项最新研究表明，大约15%的美国大型网站所提供的内容没有压缩。


Apache Ant
Apache Ant（http://ant.apache.org/）是一个自动构建软件的工具。它类似于make，但在Java 中实现，并使用XML 来描述生成过程，而make 使用它自己的Makefile 文件格式。Ant 是Apache 软件基金会的一个项目：（http://www.apache.org/licenses/）。

Ant 与make 等其他工具相比，优势在于它的可移植性。Ant 本身可用在许多不同平台上，Ant 开发文件的格式与平台无关。

默认的Ant 开发文件为XMl 格式的build.xml。每个开发文件只包含一个项目和至少一个目标体。一个Ant 目标体可依赖于其他目标体。

目标体包含任务元素是一些自动运行的动作。Ant 配有大量内置任务，如果需要还可以添加可选任务。此外，Ant 创建文件中用到的自定义任务可用Java 开发。

一个项目可有一个属性或变量的集合。一个属性有一个名字和一个值。它可以在开发文件中使用property任务设置，或者在Ant 之外设置。引用属性的方法是：将属性名放在${和}之间。

下面是一个开发文件的例子。运行默认目标（dist）编译源码目录中的Java 代码并封装为一个JAR 文档。
demo: project.xml

虽然这里使用Apache Ant 来说明本章的核心概念，还是有很多其它工具可用于开发网页应用程序。其中，值得一提的是Rake（http://rake.rubyforge.org/）已在最近几年获得普及。最值得注意的是，Rakefile（Rake版的Makefile）使用标准Ruby 语法书写，因此具有平台无关性。


Combining JavaScript Files 合并JavaScript 文件
根据Yahoo!卓越性能团队的研究，第一个也是最重要的提高网站速度的准则，特别针对那些第一次访问网站的用户，是减少渲染页面所需的HTTP 请求的数量（http://yuiblog.com/blog/2006/11/28/performance-research-part-1/）。这是你优化工作的入手点，因为合并资源通常能够以相当少的工作为用户赢得最大的潜在利益。

大多数现代网站使用多个JavaScript 文件：通常包括一个小型库，它是一个工具和控件集合以简化跨浏览器富交互网页应用程序开发，还有一些网站相关的代码，被分割成几个逻辑单元使开发者保持清晰。例如CNN（http://www.cnn.com/），使用Prototype 和Script.aculo.us 库。它的首页显示了12 个外部脚本和超过20 个内联脚本块。一个简单的优化是将某些脚本合并成一个外部JavaScript 文件，而不是全部，从而大大降低渲染页面所需HTTP 请求的数量。

Apache Ant 通过concat 任务提供合并几个文件的能力。这很重要，但是要记住JavaScript 文件通常需要按照依赖关系的特定顺序进行连接。一旦创建了依赖关系，使用filelist 或组合使用fileset 元素可将这些文件次序保存下来。Ant 目标体的样子如下：
demo: concat.xml

此目标体在开发目录下创建concatenated.js 文件，它首先连接a.js，然后是b.js，然后是源目录下按字母顺序排列的其它文件。

注意所有源文件中（可能除了最后一个）如果不是以分号或行终止符结束的，那么合并文件的结果可能不成为有效的JavaScript 代码。可这样修正：指示Ant 检查每个源文件是否以新行结束，使用fixlastline 属性：
<concat destfile="${build.dir}/concatenated.js" fixlastline="yes">
...
</concat>


Preprocessing JavaScript Files 预处理JavaScript 文件
在计算机科学中，预处理器的任务是将输入数据处理成另一种编程语言所使用的数据。它输出的就是我们所说的经过预处理的输入数据，它通常被一些后续程序所使用，例如编译器。预处理的数量和类型与预处理器的性质有关，有些预处理器只能处理简单文本替换和宏扩展，而另一些则成为完全成熟的编程语言。（维基百科）—http://en.wikipedia.org/wiki/Preprocessor

预处理您的JavaScript 源文件并不会使你的程序更快，但它允许你在代码中加入其它语言才有的一些特性，例如用条件体插入一些测试代码，来衡量你应用程序的性能。

由于没有专门为JavaScript 设计的预处理器，有必要使用一个词法预处理器，它足够灵活，可定制其词法分析规则，或者使用一个为某种语言设计的工具，其词法语法与JavaScript 自己的词法语法足够接近。由于C 语言语法接近JavaScript，C 预处理器（cpp）就是一个很好的选择。Ant 目标体如下：
<target name="js.preprocess" depends="js.concatenate">
<apply executable="cpp" dest="${build.dir}">
<fileset dir="${build.dir}"
includes="concatenated.js"/>
<arg line="-P -C -DDEBUG"/>
<srcfile/>
<targetfile/>
<mapper type="glob"
from="concatenated.js"
to="preprocessed.js"/>
</apply>
</target>

这一目标体依赖于js.concatenate 目标，它在前面的连接文件中运行cpp，其结果是在开发目录下创建preprocessed.js 文件。注意cpp 使用标准-P（抑制线标记生成）和-c（不删除注释）选项。在这个例子中还定义了DEBUG 宏。

有了这个目标体，你现在可以直接在JavaScript 文件中使用宏定义（#define, #undef）和条件编译（#if,#ifdef, #ifndef, #else, #elif, #endif）指令。例如，你可以使用条件体嵌入（或删除）测试代码：
#ifdef DEBUG
(new YAHOO.util.YUILoader({
require: ['profiler'],
onSuccess: function(o) {
YAHOO.tool.Profiler.registerFunction('foo', window);
}
})).insert();
#endif

如果你打算使用多行宏，请确保你使用了Unix 的行结束符（LF）。你可用Ant 任务fixcrlf 自动修复它们。


另一个例子，不太严格，但说明了JavaScript 预编译可以多么强大，它使用了“传参数的宏”（宏接收可变数据的参数）和文件包含，以实现JavaScript 断言。考虑下面这个include.js 文件：
#ifndef _INCLUDE_JS_
#define _INCLUDE_JS_
#ifdef DEBUG
function assert(condition, message) {
// Handle the assertion by displaying an alert message
// possibly containing a stack trace for example.
}
#define ASSERT(x, ...) assert(x, ## __VA_ARGS__)
#else
#define ASSERT(x, ...)
#endif
#endif

现在你可以像下面这样书写JavaScript 代码：
#include "include.js"
function myFunction(arg) {
ASSERT(YAHOO.lang.isString(argvar), "arg should be a string");
...
#ifdef DEBUG
YAHOO.log("Log this in debug mode only");
#endif
...
}

断言和额外的日志代码只出现在开发过程设置的DEBUG 宏块中。这些声明不会出现在最终产品中。


JavaScript Minification JavaScript 紧凑
JavaScript 紧凑指的是剔除一个JavaScript 文件中一切运行无关内容的过程。包括注释和不必要的空格。该处理通常可将文件尺寸缩减到一半，其结果是下载速度更快，并鼓励程序员写出更好，更详细的内联文档。

JSMin（http://www.crockford.com/javascript/jsmin.html），由Douglas Crockford 开发，它保持了JavaScript紧凑标准很长一段时间。然而随着网络应用程序在规模和复杂性上不断增长，许多人认为JavaScript 紧凑应当再向前推进一步。这是开发YUI 压缩器的主要原因（http://developer.yahoo.com/yui/compressor/）它提供了所有类型的智能操作，为了提供比其它工具更高级的紧凑操作并且以完全安全的方法实现。除了剔除注释和不必要的空格，YUI 压缩器还提供以下功能：

将局部变量名替换以更短的形式（1 个，2 个，或3 个字符），以优化后续的gzip 压缩工作

尽可能将中括号操作符替换为点操作符（例如foo:["bar"]变成foo.bar）

尽可能替换引号直接量属性名（例如{"foo":"bar"}变成{foo:"bar"}）

替换字符串中的转义引号（例如'aaa\'bbb'变成"aaa'bbb"）

常量折叠（例如"foo"+"bar"变成"foobar"）


与JSMin 相比，通过YUI 压缩器极大节省了您的JavaScript 代码而无需更多操作。下面的数字是YUI库的核心代码（2.7.0 版，下载地址：http://developer.yahoo.com/yui/）：
Raw yahoo.js, dom.js and event.js 192,164 bytes
yahoo.js, dom.js and event.js + JSMin 47,316 bytes
yahoo.js, dom.js and event.js + YUI Compressor 35,896 bytes

在这个例子中，YUI 压缩器与JSMin 相比节省了24%空间。然而，你还可以进一步节省空间。将局部引用存储在对象/值中，用闭包封装代码，使用常量替代重复值，避免eval（以及相似的Function 构造器，setTimeout 和setInterval 使用字符串直接量作为第一个参数），with 关键字，JScript 条件注释，都有助于进一步精缩文件。考虑下面的函数，用来转换特定DOM 元素的selected 类（220 字节）：
function toggle (element) {
if (YAHOO.util.Dom.hasClass(element, "selected")){
YAHOO.util.Dom.removeClass(element, "selected");
} else {
YAHOO.util.Dom.addClass(element, "selected");
}
}


YUI 压缩器将此代码转换如下（147 字节）：
function
toggle(a){if(YAHOO.util.Dom.hasClass(a,"selected")){YAHOO.util.Dom.removeClass(a,"selected")}else{YAH
OO.util.Dom.addClass(a,"selected")}};

如果你重构原始代码，将YAHOO.util.Dom 存入一个局部引用，并使用常量存放"select"值，代码将变成如下的样子（232 字节）：
function toggle (element) {
var YUD = YAHOO.util.Dom, className = "selected";
if (YUD.hasClass(element, className)){
YUD.removeClass(element, className);
} else {
YUD.addClass(element, className);
}
}

此版本在经过YUI 压缩器紧凑处理之后将变得更小（115 字节）：
function toggle(a){var
c=YAHOO.util.Dom,b="selected";if(c.hasClass(a,b)){c.removeClass(a,b)}else{c.addClass(a,b)}};

压缩率从33%变为48%，只需要少量工作就得到惊人的结果。然而，要注意后续的gzip 压缩，可能会产生相反的结果。换句话说，最小的紧凑文件并不总是给出最小的gzip 压缩文件。这种奇怪的结果是降低原文件的冗余量造成的。此外，这类微观优化还导致了一个很小的运行期负担，因为变量替代了直接量，所以需要额外的查找。因此，通常建议不要滥用这些技术，虽然从服务内容到用户代理不支持（或声称支持）gzip 压缩时，它们还是值得考虑的。

2009 年11 月，Google 发布了一个更先进的紧凑工具闭包编译器http://code.google.com/closure/compiler/这种工具比YUI 压缩器更进一步，当使用其先进优化选项时。在这种模式下，闭包编译器以极端霸道的方式转换代码并修改符号名。虽然它产生了难以置信的压缩率，但它要求开发者必须非常小心以确保输出代码与输入代码等价。它还使得调试更为困难，因为几乎所有符号都被改名了。此闭包库以一个Firebug 扩展的形式发布，命名为闭包察看器（Closure Inspector）(http://code.google.com/closure/compiler/docs/inspector.html)，并提供了一个转换后符号名和原始符号名之间的对照表。不过，这个扩展不能用于Firefox 之外的浏览器，所以对那些浏览器相关的代码来说是个问题，而且和那些不这么霸道的紧凑工具相比，调试工作更困难。


Buildtime Versus Runtime Build Processes 开发过程中的编译时和运行时
连接，预处理，和紧凑既可以在编译时发生，也可以在运行时发生。在开发过程中，运行时创建过程非常有用，但由于扩展性原因一般不建议在产品环境中使用。开发高性能应用程序的一个普遍规则是，只要能够在编译时完成的工作，就不要在运行时去做。

Apache Ant 无疑是一种脱机开发程序，而本章末尾出现的灵巧开发工具代表了中间路线，同样的工具即可用于开发期创建最终断言，也可用于产品环境。


JavaScript Compression JavaScript 压缩
当网页浏览器请求一个资源时，它通常发送一个Accept-Encoding 的HTTP 头（以HTTP/1.1 开始）让网页服务器知道传输所支持的编码类型。此信息主要用于允许文档压缩以获得更快下载速度，从而改善用户体验。Accept-Encoding 的取值范围是：gzip，compress，deflate，和identity（这些值已经在以太网地址分配机构（即IANA）注册）。

如果网页服务器在请求报文中看到这些信息头，它将选择适当的编码方法，并通过Content-Encoding 的HTTP 头通知浏览器。

gzip 大概是目前最流行的编码格式。它通常可将有效载荷减少到70%，成为提高网页应用性能的有力武器。注意gzip 压缩器主要用于文本报文，包括JavaScript 文件。其他文件类型，如图片和PDF 文件，不应该使用gzip 压缩，因为它们已经压缩，如果试图再次压缩只会浪费服务器资源。

如果您使用Apache 网页服务器（目前最流行的），启用gzip 压缩功能需要安装并配置mod_gzip 模块（针对Apache 1.3，位于http://www.schroepl.net/projekte/mod_gzip/）或者mod_deflate 模块（针对Apache 2）。

由Yahoo!搜索和Google 独立完成的最新研究表明，美国大型网站提供的内容中有大约15%未经过压缩。大多数因为在请求报文中缺少Accept-Encoding 的HTTP 头，它被一些公司代理、防火墙、甚至PC 安全软件剔除了。虽然gzip 压缩是一个惊人的网页开发工具，但还是要注意到这个事实，尽量书写简洁的代码。另一种技术是提供替代的JavaScript 内容，使那些不能受益于gzip 压缩的用户，可以使用更简单的用户体验（用户可以选择切换回完整版本）。

为此，值得提到Packer (http://dean.edwards.name/packer/)，由Dean Edwards 开发的一个JavaScript 紧凑工具。Packer 对JavaScript 压缩能够超过YUI 压缩器的水平。考虑下面对jQuery 库的压缩结果（版本1.3.2，下载地址http://www.jquery.com/）：
jQuery 120,180 bytes
jQuery + YUI Compressor 56,814 bytes
jQuery + Packer 39,351 bytes
Raw jQuery + gzip 34,987 bytes
jQuery + YUI Compressor + gzip 19,457 bytes
jQuery + Packer + gzip 19,228 bytes

经过gzip 压缩之后，jQuery 库经过Packer 或YUI 压缩器产生的结果非常相近。然而，使用Packer 压缩文件导致一个固定的运行时代价（在我的不落后的笔记本电脑上大约是200 至300 毫秒）。因此，使用YUI 压缩器和gzip 结合总能给出最佳结果。然而，Packer 可用于网速不高或者不支持gzip 压缩的情况，解压缩的代价与下载大量代码的代价相比微不足道。为不同用户提供不同JavaScript 的唯一缺点是质量保证成本的增加。


Caching JavaScript Files 缓存JavaScript 文件
使HTTP 组件可缓存将大大提高用户再次访问网站时的用户体验。一个具体的例子是，加载Yahoo!主页时（http://www.yahoo.com/），和不使用缓存相比，使用缓存将减少90%的HTTP 请求和83%的下载字节。往返时间（从请求页面开始到第一次onload 事件）从2.4 秒下降到0.9 秒(http://yuiblog.com/blog/2007/01/04/performance-research-part-2/)。虽然图片经常使用缓存，但它应当被使用在所有静态内容上，包括JavaScript 文件。

网页服务器使用Expires 响应报文HTTP 头让客户端知道缓存资源的时间。它是一个RFC 1123 格式的绝对时间戳。例如：Expires: Thu, 01 Dec 1994 16:00:00 GMT。要将响应报文标记为“永不过期”，网页服务器可以发送一个时间为请求时间之后一年的Expires 数据。根据HTTP 1.1 RFC（RFC 2616，14.21 节）的要求，网页服务器发送的Expires 时间不应超过一年。

如果你使用Apache 网页服务器，ExpiresDefault 指令允许你根据当前时间设置过期时间。下面的例子将此指令用于图片，JavaScript 文件，和CSS 样式表：
<FilesMatch "\.(jpg|jpeg|png|gif|js|css|htm|html)$">
ExpiresActive on
ExpiresDefault "access plus 1 year"
</FilesMatch>

某些网页浏览器，特别是那些移动设备上的浏览器，可能有缓存限制。例如，iPhone 的Safari 浏览器不能缓存解压后大于25K 的组件（见http://yuiblog.com/blog/2008/02/06/iphone-cacheability/），在iPhone 3.0操作系统上不能大于15K。在这种情况下，应衡量HTTP 组件数量和它们的可缓存性，考虑将它们分解成更小的块。

如果可能的话，你还可以考虑客户端存储机制，让JavaScript 代码自己来处理过期。

最后，另一种技术是使用HTML 5 离线应用程序缓存，它已经在如下浏览器中实现：Firefox 3.5，Safari4.0，从iPhone OS 2.1 开始以后的版本。此技术依赖于一个配置文件，列出应当被缓存的资源。此配置文件通过<html>标签的manifest 属性（注意要使用HTML 5 的DOCTYPE）：
<!DOCTYPE html>
<html manifest="demo.manifest">

此配置文件使用特殊语法列出离线资源，必须使用text/cache-manifest 指出它的媒体类型。更多关于离线网页应用缓存的信息参见W3C 的网站http://www.w3.org/TR/html5/offline.html。


Working Around Caching Issues 关于缓存问题
充分利用缓存控制可真正提高用户体验，但它有一个缺点：当应用程序更新之后，你希望确保用户得到静态内容的最新版本。这通过对改动的静态资源进行重命名实现。

大多情况下，开发者向文件名中添加一个版本号或开发编号。有人喜欢追加一个校验和。个人而言，我更喜欢时间戳。此任务可用Ant 自动完成。下面的目标体通过附加一个yyyyMMddhhmm 格式的时间戳重名名JavaScript 文件：
<target name="js.copy">
<!-- Create the time stamp -->
<tstamp/>
<!-- Rename JavaScript files by appending a time stamp -->
<copy todir="${build.dir}">
<fileset dir="${src.dir}" includes="*.js"/>
<globmapper from="*.js" to="*-${DSTAMP}${TSTAMP}.js"/>
</copy>
</target>


Using a Content Delivery Network 使用内容传递网
内容传递网络（CDN）是按照地理分布的计算机网络，通过以太网负责向最终用户分发内容。使用CDN的主要原因是可靠性，可扩展性，但更主要的是性能。事实上，通过地理位置上最近的位置向用户提供服务，CDN 可以极大地减少网络延迟。

些大公司维护它们自己的CDN，但通常使用第三方CDN 更经济一些，如Akamai 科技（http://www.akamai.com）或Limelight 网络（http://www.limelightnetworkds.com）。

切换到CDN 通常只需改变少量代码，并可能极大地提高最终用户响应速度。

值得注意的是，最流行的JavaScript 库都可以通过CDN 访问。例如，YUI 直接从Yahoo!网络获得（服务器名是yui.yahooapis.com，http://developer.yahoo.com/yui/articles/hosting/）。jQuery，Dojo，Prototype，Script.aculo.us，MooTools，YUI，还有其他库都可以直接通过Google 的CDN 获得（服务器名是ajax.googleapis.com，http://code.google.com/apis/ajaxlibs/）。


Deploying JavaScript Resources 部署JavaScript 资源
部署JavaScript 资源通常需要拷贝文件到一个或多个远程主机，有时在那些主机上运行一个shell 命令集，特别当使用CDN 时，通过传递网络分发最新添加的文件。

Apache Ant 提供给你几个选项用于将文件复制到远程服务器上。你可以使用copy 任务将文件复制到一个本地挂载的文件系统，或者使用FTP 或SCP 任务。我个人喜欢直接使用scp 工具，因为所有主流平台都支持它。这是一个非常简单的例子：
<apply executable="scp" fail parallel="true">
<fileset dir="${build.dir}" includes="*.js"/>
<srcfile/>
<arg line="${live.server}:/var/www/html/"/>
</apply>

最终，为了在远程主机上运行shell 命令启动SSH 服务，你可以使用SSHEXEC 任务选项或简单地直接调用ssh 工具，正如下面的例子中那样，在Unix 主机上重启Apache 网页服务：
<exec executable="ssh" fail>
<arg line="${live.server}"/>
<arg line="sudo service httpd restart"/>
</exec>


Agile JavaScript Build Process 灵巧的JavaScript 开发过程
传统开发工具很强大，但大多数网页开发人员嫌它们太麻烦，因为在每次修改之后都需要手工编译解决方案。开发人员更喜欢另一种方法，跳过整个编译步骤，直接刷新浏览器窗口。因此，几乎没有网页开发者使用本章之外的技术而导致应用程序或网站表现不佳。幸运的是，写一个综合上述优点的工具十分简单，它允许网页开发者在应用程序之外获得最佳性能。

smasher 是一个PHP5 应用程序，基于Yahoo!搜索所使用的一个内部工具。它合并多个JavaScript 文件，预处理它们，根据选项对它们内容进行紧凑处理。它可以从命令行运行，或者在开发过程中处理网页请求自动合并资源。源码可在http://github.com/jlecomte/smasher 下载，包含以下文件：

smasher.php
Core file 核心文件

smasher.xml
Configuration file 配置文件

smasher
Command-line wrapper 命令行封装

smasher_web.php
Web server entry point 网页服务入口

smasher 需要一个XML 配置文件包含要合并的文件组的定义，以及一些有关系统的信息。下面是这个文件的一个例子：
demo: smasher.xml

每一个group 元素包含一个JavaScript 或CSS 文件集合。该root_dir 顶层元素包含查找这些文件的路径。group 元素还可通过选项来包含一个预处理宏定义列表。

一旦这个配置文件保存下来，你就可以在命令行运行smasher。如果你不加任何参数运行它，它将在退出之前显示一些有用的信息。下面的例子演示了如何合并，预处理，和紧凑处理YUI 核心JavaScript 文件：
$ ./smasher -c smasher.xml -g yui-core -t js

如果一切正常，可以在工作目录找到输出文件，它的名字以组名开头（这个例子中为yui-core）后面跟着一个时间戳和适当的文件扩展名（例如，yui-core-200907191539.js）。

同样，你可以使用smasher 在开发过程中处理网页请求，将文件smasher_web.php 放在你的网页服务根文档中，使用类似这样的URL：
http://<host>/smasher_web.php?conf=smasher.xml&group=yui-core&type=css&nominify

在开发和产品中，为你的JavaScript 和CSS 资源使用不同的URL，现在它可以在开发过程之外获得最佳性能。


Summary 总结
开发和部署过程对基于JavaScript 的应用程序可以产生巨大影响，最重要的几个步骤如下：

合并JavaScript 文件，减少HTTP 请求的数量

使用YUI 压缩器紧凑处理JavaScript 文件

以压缩形式提供JavaScript 文件（gzip 编码）

通过设置HTTP 响应报文头使JavaScript 文件可缓存，通过向文件名附加时间戳解决缓存问题

使用内容传递网络（CDN）提供JavaScript 文件，CDN 不仅可以提高性能，它还可以为你管理压缩和缓存

所有这些步骤应当自动完成，不论是使用公开的开发工具诸如Apache Ant，还是使用自定义的开发工具以实现特定需求。如果你使这些开发工具为你服务，你可以极大改善那些大量使用JavaScript 代码的网页应用或网站的性能。