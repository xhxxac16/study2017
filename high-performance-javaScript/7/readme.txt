第七章 Ajax 异步JavaScript 和XML
Ajax 是高性能JavaScript 的基石。它可以通过延迟下载大量资源使页面加载更快。它通过在客户端和服务器之间异步传送数据，避免页面集体加载。它还用于在一次HTTP 请求中获取整个页面的资源。通过选择正确的传输技术和最有效的数据格式，你可以显著改善用户与网站之间的互动。

本章考察从服务器收发数据最快的技术，以及最有效的数据编码格式。


Data Transmission 数据传输
Ajax，在它最基本的层面，是一种与服务器通讯而不重载当前页面的方法，数据可从服务器获得或发送给服务器。有多种不同的方法构造这种通讯通道，每种方法都有自己的优势和限制。本节简要地介绍这些不同方法，并讨论各自对性能的影响。


Requesting Data 请求数据
有五种常用技术用于向服务器请求数据：
XMLHttpRequest (XHR)
Dynamic script tag insertion 动态脚本标签插入
iframes
Comet
Multipart XHR 多部分的XHR

在现代高性能JavaScript 中使用的三种技术是XHR，动态脚本标签插入和多部分的XHR。使用Comet和iframe（作为数据传输技术）往往是极限情况，不在这里讨论。


XMLHttpRequest
目前最常用的方法中，XMLHttpRequest（XHR）用来异步收发数据。所有现代浏览器都能够很好地支持它，而且能够精细地控制发送请求和数据接收。你可以向请求报文中添加任意的头信息和参数（包括GET 和POST），并读取从服务器返回的头信息，以及响应文本自身。以下是使用示例：
demo: xhr.htm

此例显示了如何从URL 请求数据，使用参数，以及如何读取响应报文和头信息。readyState 等于4 表示整个响应报文已经收并完可用于操作。

readyState 等于3 则表示此时在与服务器交互，响应报文还在传输之中。这就是所谓的“流”，它是提高数据请求性能的强大工具：

由于XHR 提供了高级别的控制，浏览器在上面增加了一些限制。你不能使用XHR 从当前运行的代码域之外请求数据，而且老版本的IE 也不提供readyState 3，它不支持流。从请求返回的数据像一个字符串或者一个XML 对象那样对待，这意味着处理大量数据将相当缓慢。

尽管有这些缺点，XHR 仍旧是最常用的请求数据技术，也是最强大的。它应当成为你的首选。


POST versus GET when using XHR. 使用XHR 时，应使用POST 还是GET
当使用XHR 请求数据时，你可以选择POST 或GET。如果请求不改变服务器状态只是取回数据（又称作幂等动作）则使用GET。GET 请求被缓冲起来，如果你多次提取相同的数据可提高性能。

只有当URL 和参数的长度超过了2048 个字符时才使用POST 提取数据。因为Internet Explorer 限制URL的长度，过长将导致请求（参数）被截断。


Dynamic script tag insertion 动态脚本标签插入
该技术克服了XHR 的最大限制：它可以从不同域的服务器上获取数据。这是一种黑客技术，而不是实例化一个专用对象，你用JavaScript 创建了一个新脚本标签，并将它的源属性设置为一个指向不同域的URL。
var scriptElement = document.createElement('script');
scriptElement.src = 'http://any-domain.com/javascript/lib.js';
document.getElementsByTagName('head')[0].appendChild(scriptElement);

但是动态脚本标签插入与XHR 相比只提供更少的控制。你不能通过请求发送信息头。参数只能通过GET方法传递，不能用POST。你不能设置请求的超时或重试，实际上，你不需要知道它是否失败了。你必须等待所有数据返回之后才可以访问它们。你不能访问响应信息头或者像访问字符串那样访问整个响应报
文。

最后一点非常重要。因为响应报文被用作脚本标签的源码，它必须是可执行的JavaScript。你不能使用裸XML，或者裸JSON，任何数据，无论什么格式，必须在一个回调函数之中被组装起来。
var scriptElement = document.createElement('script');
scriptElement.src = 'http://any-domain.com/javascript/lib.js';
document.getElementsByTagName('head')[0].appendChild(scriptElement);

function jsonCallback(jsonString) {
var data = ('(' + jsonString + ')');
// Process the data here...
}

在这个例子中，lib.js 文件将调用jsonCallback 函数组装数据：
jsonCallback({ "status": 1, "colors": [ "#fff", "#000", "#ff0000" ] });

尽管有这些限制，此技术仍然非常迅速。其响应结果是运行JavaScript，而不是作为字符串必须被进一步处理。正因为如此，它可能是客户端上获取并解析数据最快的方法。我们比较了动态脚本标签插入和XHR 的性能，在本章后面JSON 一节中。

请小心使用这种技术从你不能直接控制的服务器上请求数据。JavaScript 没有权限或访问控制的概念，所以你的页面上任何使用动态脚本标签插入的代码都可以完全控制整个页面。包括修改任何内容、将用户重定向到另一个站点，或跟踪他们在页面上的操作并将数据发送给第三方。使用外部来源的代码时务必非常小心。


Multipart XHR 多部分XHR
这里介绍最新的技术，多部分XHR（MXHR）允许你只用一个HTTP 请求就可以从服务器端获取多个资源。它通过将资源（可以是CSS 文件，HTML 片段，JavaScript 代码，或base64 编码的图片）打包成一个由特定分隔符界定的大字符串，从服务器端发送到客户端。JavaScript 代码处理此长字符串，根据它的媒体类型和其他“信息头”解析出每个资源。

让我们从头到尾跟随这个过程。首先，发送一个请求向服务器索取几个图像资源：
var req = new XMLHttpRequest();
req.open('GET', 'rollup_images.php', true);
req.onreadystatechange = function() {
if (req.readyState == 4) {
splitImages(req.responseText);
}
};
req.send(null);

这是一个非常简单的请求。你向rollup_images.php 要求数据，一旦你收到返回结果，就将它交给函数splitImages 处理。

下一步，服务器读取图片并将它们转换为字符串：
// Read the images and convert them into base64 encoded strings.
$images = array('kitten.jpg', 'sunset.jpg', 'baby.jpg');
foreach ($images as $image) {
$image_fh = fopen($image, 'r');
$image_data = fread($image_fh, filesize($image));
fclose($image_fh);
$payloads[] = base64_encode($image_data);
}（译者注：疑原文有误，此括号多余）
}
// Roll up those strings into one long string and output it.
$newline = chr(1); // This character won't appear naturally in any base64 string.
echo implode($newline, $payloads);

这段PHP 代码读取三个图片，并将它们转换成base64 字符串。它们之间用一个简单的字符，UNICODE的1，连接起来，然后返回给客户端。

然后回到客户端，此数据由splitImage 函数处理：
function splitImages(imageString) {
var imageData = imageString.split("\u0001");
var imageElement;
for (var i = 0, len = imageData.length; i < len; i++) {
imageElement = document.createElement('img');
imageElement.src = 'data:image/jpeg;base64,' + imageData[i];
document.getElementById('container').appendChild(imageElement);
}
}

此函数将拼接而成的字符串分解为三段。每段用于创建一个图像元素，然后将图像元素插入页面中。图像不是从base64 转换成二进制，而是使用data:URL 并指定image/jpeg 媒体类型。

最终结果是：在一次HTTP 请求中向浏览器传入了三张图片。也可以传入20 张或100 张，响应报文会更大，但也只是一次HTTP 请求。它也可以扩展至其他类型的资源。JavaScript 文件，CSS 文件，HTML片段，许多类型的图片都可以合并成一次响应。任何数据类型都可作为一个JavaScript 处理的字符串被发送。下面的函数用于将JavaScript 代码、CSS 样式表和图片转换为浏览器可用的资源：
function handleImageData(data, mimeType) {
    var img = document.createElement('img');
    img.src = 'data:' + mimeType + ';base64,' + data;
    return img;
}
function handleCss(data) {
    var style = document.createElement('style');
    style.type = 'text/css';
    var node = document.createTextNode(data);
    style.appendChild(node);
    document.getElementsByTagName('head')[0].appendChild(style);
}
function handleJavaScript(data) {
    (data);
}

由于MXHR 响应报文越来越大，有必要在每个资源收到时立刻处理，而不是等待整个响应报文接收完成。这可以通过监听readyState 3 实现：
demo: mxhr.htm

当readyState 3 第一次发出时，启动了一个定时器。每隔15 毫秒检查一次响应报文中的新数据。数据片段被收集起来直到发现一个分隔符，然后一切都作为一个完整的资源处理。

以健壮的方式使用MXHR 的代码很复杂但值得进一步研究。完整的库可参见
http://techfoolery.com/mxhr/。

使用此技术有一些缺点，其中最大的缺点是以此方法获得的资源不能被浏览器缓存。如果你使用MXHR获取一个特定的CSS 文件然后在下一个页面中正常加载它，它不在缓存中。因为整批资源是作为一个长字符串传输的，然后由JavaScript 代码分割。由于没有办法用程序将文件放入浏览器缓存中，所以用这种方法获取的资源也无法存放在那里。

另一个缺点是：老版本的Internet Explorer 不支持readyState 3 或data: URL。Internet Explorer 8 两个都支持，但在Internet Explorer 6 和7 中必须设法变通。

尽管有这些缺点，但某些情况下MXHR 仍然显著提高了整体页面的性能：

网页包含许多其他地方不会用到的资源（所以不需要缓存），尤其是图片

网站为每个页面使用了独一无二的打包的JavaScript 或CSS 文件以减少HTTP 请求，因为它们对每个页面来说是独一的，所以不需要从缓存中读取，除非重新载入特定页面

由于HTTP 请求是Ajax 中最极端的瓶颈之一，减少其需求数量对整个页面性能有很大影响。尤其是当你将100 个图片请求转化为一个MXHR 请求时。Ad hoc 在现代浏览器上测试了大量图片，其结果显示出此技术比逐个请求快了4 到10 倍。你可以自己运行这个测试：http://techfoolery.com/mxhr/。


Sending Data 发送数据
有时你不关心接收数据，而只要将数据发送给服务器。你可以发送用户的非私有信息以备日后分析，或者捕获所有脚本错误然后将有关细节发送给服务器进行记录和提示。当数据只需发送给服务器时，有两种广泛应用的技术：XHR 和灯标。

XMLHttpRequest
虽然XHR 主要用于从服务器获取数据，它也可以用来将数据发回。数据可以用GET 或POST 方式发回，以及任意数量的HTTP 信息头。这给你很大灵活性。当你向服务器发回的数据量超过浏览器的最大URL长度时XHR 特别有用。这种情况下，你可以用POST 方式发回数据：
demo: xhr-post.htm

正如你在这个例子中看到的，如果失败了我们什么也不做。当我们用XHR 捕获登陆用户统计信息时这么做通常没什么问题，但是，如果发送到服务器的是至关重要的数据，你可以添加代码在失败时重试：
demo: xhr-post-error.htm

当使用XHR 将数据发回服务器时，它比使用GET 要快。这是因为对少量数据而言，向服务器发送一个GET 请求要占用一个单独的数据包。另一方面，一个POST 至少发送两个数据包，一个用于信息头。另一个用于POST 体。POST 更适合于向服务器发送大量数据，即因为它不关心额外数据包的数量，又因为Internet Explorer 的URL 长度限制，它不可能使用过长的GET 请求。


Beacons 灯标
此技术与动态脚本标签插入非常类似。JavaScript 用于创建一个新的Image 对象，将src 设置为服务器上一个脚本文件的URL。此URL 包含我们打算通过GET 格式传回的键值对数据。注意并没有创建img 元素或者将它们插入到DOM 中。
var url = '/status_tracker.php';
var params = [
'step=2',
'time=1248027314'
];
(new Image()).src = url + '?' + params.join('&');

服务器取得此数据并保存下来，而不必向客户端返回什么，因此没有实际的图像显示。这是将信息发回服务器的最有效方法。其开销很小，而且任何服务器端错误都不会影响客户端。

简单的图像灯标意味着你所能做的受到限制。你不能发送POST 数据，所以你被URL 长度限制在一个相当小的字符数量上。你可以用非常有限的方法接收返回数据。可以监听Image 对象的load 事件，它可以告诉你服务器端是否成功接收了数据。你还可以检查服务器返回图片的宽度和高度（如果返回了一张图片）并用这些数字通知你服务器的状态。例如，宽度为1 表示“成功”，2 表示“重试”。

如果你不需要为此响应返回数据，那么你应当发送一个204 No Content 响应代码，无消息正文。它将阻止客户端继续等待永远不会到来的消息体：
demo: beacon.htm

灯标是向服务器回送数据最快和最有效的方法。服务器根本不需要发回任何响应正文，所以你不必担心客户端下载数据。唯一的缺点是接收到的响应类型是受限的。如果你需要向客户端返回大量数据，那么使用XHR。如果你只关心将数据发送到服务器端（可能需要极少的回复），那么使用图像灯标。


Data Formats 数据格式
在考虑数据传输技术时，你必须考虑这些因素：功能集，兼容性，性能，和方向（发给服务器或者从服务器接收）。在考虑数据格式时，唯一需要比较的尺度的就是速度。

没有哪种数据格式会始终比其他格式更好。根据传送什么数据、用于页面上什么目的，某种格式可能下载更快，另一种格式可能解析更快。在本节中，我们创建了一个窗口小部件用于搜索用户信息并用四种主流的数据格式实现它。这要求我们在服务器端格式化一个用户列表，将它返回给浏览器，将列表解析成JavaScript 数据格式，并搜索特定的字符串。每种数据格式将比较列表的文件大小，解析速度，和服务器上构造它们的难易程度。


XML
当Ajax 开始变得流行起来它选择了XML 数据格式。有很多事情是围绕着它做的：极端的互通性（服务器端和客户端都能够良好支持），格式严格，易于验证。（那时）JSON 还没有正式作为交换格式，几乎所有的服务器端语言都有操作XML 的库。

这里是用XML 编码的用户列表的例子：
demo: xml.xml

与其他格式相比，XML 极其冗长。每个离散的数据片断需要大量结构，所以有效数据的比例非常低。而且XML 语法有些轻微模糊。当数据结构编码为XML 之后，你将对象参数放在对象元素的属性中，还是放在独立的子元素中？标签名使用长命名或者短小高效却难以辨认的名字？语法解析同样含混，你必须先知道XML 响应报文的布局，然后才能搞清楚它的含义。

一般情况下，解析XML 要占用JavaScript 程序员相当一部分精力。除了要提前知道详细结构之外，你还必须确切地知道如何解开这个结构然后精心地将它们写入JavaScript 对象中。这远非易事且不能自动完成，不像其他三种数据格式那样。

下面是如何将特定XML 报文解析到对象的例子：
demo: xml.htm

正如你所看到的，在读值之前，它需要检查每个标签以保证它存在。这在很大程度上依赖于XML 的结构。

一个更有效的方式是将每个值都存储为<user>标签的属性。数据相同而文件尺寸却更小。这个例子中的用户列表，将值放置在标签属性中：
demo: xml-modify.xml

解析此简化版XML 响应报文要容易得多：
demo: xml-modify.htm


XPath
虽然它超出了本章内容的范围，但XPath 在解析XML 文档时比getElementsByTagName 快得多。需要注意的是，它并未得到广泛支持，所以你必须使用古老风格的DOM 遍历方法编写备用代码。现在，DOM级别3 的XPath 已经被如下浏览器实现：Firefox，Safari，Chrome，和Opera。Internet Explorer 8 有一个类似的但略微先进的接口。


Response sizes and parse times 响应报文大小和解析时间
让我们来看一看下表中的XML 性能数据：
demo: xml性能数据.docx

正如你所看到的，与使用子标签相比，使用属性时文件尺寸更小，特别是解析时间更快。其原因很大程度上基于这样的事实：你不需要在XML 结构上访问DOM 那么多次，而只是简单地读取属性。

你是否考虑使用XML？鉴于开发API 如此流行使，你经常别无选择。如果数据只有XML 格式可用，那么你卷起袖子写代码解析它吧。但是如果有其他格式可用，那么宁愿取代它。你在这里看到的标准XML的性能数据与更先进的技术相比，显得太慢了。如果浏览器支持的话，XPath 可改善解析时间，但代价是编写并维护三个代码分支（为支持DOM 级别3 的XPath 的浏览器写一个，为Internet Explorer 8 写一个，为其他浏览器写一个）。简化XML 格式更有利，但比那些最快的格式还是慢一个数量级。在高性能Ajax中没有XML 的地位。


JSON
通过Douglas Crockford 的发明与推广，JSON 是一个轻量级并易于解析的数据格式，它按照JavaScript对象和数组字面语法所编写。下例是用JSON 书写的用户列表：
demo: user.json

用户表示为一个对象，用户列表成为一个数组，与JavaScript 中其他数组或对象的写法相同。这意味着如果它被包装在一个回调函数中，JSON 数据可称为能够运行的JavaScript 代码。在JavaScript 中解析JSON可简单地使用()：
function parseJSON(responseText) {
    return ('(' + responseText + ')');
}

正如XML 那样，它也可以提炼成一个更简单的版本。这种情况下，我们可将名字缩短（尽管可读性变差）：
demo: user-modify.json

它将相同的数据以更少的结构和更小的字节尺寸传送给浏览器。更进一步，我们干脆完全去掉属性名。与其他两种格式相比，这种格式可读性更差，但也更利索，文件尺寸非常小：大约只有标准JSON 格式的一半。
demo: user-modify-modify.json

解析过程需要保持数据的顺序。也就是说，它在进行格式转换时必须保持和第一个JSON 格式一样的属性名：
function parseJSON(responseText) {
var users = [];
var usersArray = ('(' + responseText + ')');
for (var i = 0, len = usersArray.length; i < len; i++) {
users[i] = {
id: usersArray[i][0],
username: usersArray[i][1],
realname: usersArray[i][2],
email: usersArray[i][3]
};
}
return users;
}

在这个例子中，我们使用()将字符串转换为一个本地JavaScript 数组。然后再将它转换到一个对象数组，本质上讲，你用一个更复杂的解析函数换取了较小的文件尺寸和更快的()时间。下表列出这三种JSON 格式的性能数据，以XHR 传输。
demo: json性能数据.docx

数组形式的JSON 在每一项中均获胜，它文件尺寸最小，下载最快，平均解析时间最短。尽管解析函数不得不遍历列表中所有5'000 个单元，它还是快出了30%。


JSON-P
事实上JSON 可被本地执行有几个重要的性能影响。当使用XHR 时JSON 数据作为一个字符串返回。该字符串使用()转换为一个本地对象。然而，当使用动态脚本标签插入时，JSON 数据被视为另一个JavaScript 文件并作为本地码执行。为做到这一点，数据必须被包装在回调函数之中。这就是所谓的“JSON填充”或JSON-P。下面是我们用JSON-P 格式书写的用户列表：
parseJSON([
{"id":1, "username":"alice", "realname":"Alice Smith", "email":"alice@alicesmith.com"},
{"id":2, "username":"bob", "realname":"Bob Jones", "email":"bob@bobjones.com"},
{"id":3, "username":"carol", "realname":"Carol Williams", "email":"carol@carolwilliams.com"},
{"id":4, "username":"dave", "realname":"Dave Johnson", "email":"dave@davejohnson.com"}
]);

JSON-P 因为回调包装的原因略微增加了文件尺寸，但与其解析性能的改进相比这点增加微不足道。由于数据作为本地JavaScript 处理，它的解析速度像本地JavaScript 一样快。下面是JSON-P 传输三种JSON数据的时间：
demo: jsonp性能数据.docx

文件大小和下载时间与XHR 测试基本相同，而解析时间几乎快了10 倍。标准JSON-P 的解析时间为0，因为根本用不着解析，它已经是本地格式了。简化版JSON-P 和数组JSON-P 也是如此，只是每种都需要转换成标准JSON-P 直接给你的那种格式。

最快的JSON 格式是使用数组的JSON-P 格式。虽然这只比使用XHR 的JSON 略快，但是这种差异随着列表尺寸的增大而增大。如果你所从事的项目需要一个10'000 或100'000 个单元构成的列表，那么JSON-P比JSON 好很多。

还有一个与性能无关的原因要避免使用JSON-P：因为JSON-P 必须是可执行的JavaScript，它使用动态脚本标签注入技术可在任何网站中被任何人调用。从另一个角度说，JSON 在运行之前并不是有效的JavaScript，使用XHR 时只是被当作字符串获取。不要将任何敏感的数据编码为JSON-P，因为你无法确定它是否包含私密信息，或者包含随机的URL 或cookie。


Should you use JSON? 你应该使用JSON 吗？
与XML 相比JSON 有许多优点。这种格式小得多，在总响应报文中，结构占用的空间更小，数据占用的更多。特别是数据包含数组而不是对象时。JSON 与大多数服务器端语言的编解码库之间有着很好的互操作性。它在客户端的解析工作微不足道，使你可以将更多写代码的时间放在其他数据处理上。对网页开发者来说最重要的是，它是表现最好的格式之一，即因为在线传输相对较小，也因为解析十分之快。JSON是高性能Ajax 的基石，特别是使用动态脚本标签插入时。


HTML
通常你所请求的数据以HTML 返回并显示在页面上。JavaScript 能够比较快地将一个大数据结构转化为简单的HTML，但是服务器完成同样工作更快。一种技术考虑是在服务器端构建整个HTML 然后传递给客户端，JavaScript 只是简单地下载它然后放入innerHTML。下面是用HTML 编码用户列表的例子：
demo: html.htm

此技术的问题在于，HTML 是一种详细的数据格式，比XML 更加冗长。在数据本身的最外层，可有嵌套的HTML 标签，每个都具有ID，类，和其他属性。HTML 格式可能比实际数据占用更多的空间，尽管可通过尽量少用标签和属性缓解这一问题。正因为这个原因，你只有当客户端CPU 比带宽更受限时才使用此技术。

此技术的问题在于，HTML 是一种详细的数据格式，比XML 更加冗长。在数据本身的最外层，可有嵌套的HTML 标签，每个都具有ID，类，和其他属性。HTML 格式可能比实际数据占用更多的空间，尽管可通过尽量少用标签和属性缓解这一问题。正因为这个原因，你只有当客户端CPU 比带宽更受限时才使用此技术。

一种极端情况是，你有一种格式包含最少数量的结构，需要在客户端解析数据，例如JSON。这种格式下载到客户机非常快，然而它需要很多CPU 时间转化成HTML 以显示在页面上。这需要很多字符串操作，而字符串操作也是JavaScript 最慢的操作之一。

另一种极端情况是，你在服务器上创建HTML。这种格式在线传输数据量大，下载时间长，但一旦下载完，只需一个操作就可以显示在页面上：
document.getElementById('data-container').innerHTML = req.responseText;

下表显示了使用HTML 编码用户列表时的性能数据。请记住这种格式与其他几种格式的差别：“解析”在这种情况下指的是将HTML 插入DOM 的操作。此外，HTML 不能像本地JavaScript 数组那样轻易迅速地进行迭代操作。
demo: html性能数据.docx

正如你所看到的，HTML 传输数据量明显偏大，也需要长时间来解析。因为将HTML 插入到DOM 的单一操作看似简单，尽管它只有一行代码，却仍需要时间向页面加载很多数据。与其他测试相比这些性能数据确实有轻微的偏差，最终结果不是数据数组，而是显示在页面上的HTML 元素。无论如何，它们仍显示出HTML 的一个事实：作为数据格式，它缓慢而且臃肿。


Custom Formatting 自定义格式
最理想的数据格式只包含必要的结构，使你能够分解出每个字段。你可以自定义一种格式只是简单地用一个分隔符将数据连结起来：
Jacob;Michael;Joshua;Matthew;Andrew;Christopher;Joseph;Daniel;Nicholas;Ethan;William;Anthony;Ryan;Davi
d;Tyler;John

这些分隔符基本上创建了一个数据数组，类似于一个逗号分隔的列表。通过使用不同的分隔符，你可以创建多维数组。这里是用自定义的字符分隔方式构造的用户列表：
1:alice:Alice Smith:alice@alicesmith.com;
2:bob:Bob Jones:bob@bobjones.com;
3:carol:Carol Williams:carol@carolwilliams.com;
4:dave:Dave Johnson:dave@davejohnson.com

这种格式非常简洁，与其他格式相比（不包括纯文本），其数据/结构比例明显提高。自定义格式下载迅速，易于解析，只需调用字符串的split()将分隔符作为参数传入即可。更复杂的自定义格式具有多种分隔符，需要在循环中分解所有数据（但是请记住，在JavaScript 中这些循环是非常快的）。split()是最快的字符串操作之一，通常可以在数毫秒内处理具有超过10'000 个元素的“分隔符分割”列表。下面的例子给出解析上述格式的方法：
function parseCustomFormat(responseText) {
var users = [];
var usersEncoded = responseText.split(';');
var userArray;
for (var i = 0, len = usersEncoded.length; i < len; i++) {
userArray = usersEncoded[i].split(':');
users[i] = {
id: userArray[0],
username: userArray[1],
realname: userArray[2],
email: userArray[3]
};
}
return users;
}

当创建你的自定义格式时，最重要的决定是采用何种分隔符。理想情况下，它应当是一个单字符，而且不能存在于你的数据之中。ASCII 字符表中前面的几个字符在大多数服务器端语言中能够正常工作而且容易书写。例如，下面讲述如何在PHP 中使用ASCII 码：
demo: php.php

这些控制字符在JavaScript 中使用Unicode 标注（例如，\u0001）表示。split()函数可以用字符串或者正则表达式作参数。如果你希望数据中存在空字段，那么就使用字符串；如果分隔符是一个正则表达式，IE中的split()将跳过相邻两个分隔符中的第二个分隔符。这两种参数类型在其他浏览器上等价。
// Regular expression delimiter.
var rows = req.responseText.split(/\u0001/);
// String delimiter (safer).
var rows = req.responseText.split("\u0001");

这里是字符分隔的自定义格式的性能数据，使用XHR 和动态脚本标签注入：
demo: formate性能数据.docx

XHR 和动态脚本标签注入都可以使用这种格式。两种情况下都要解析字符串，在性能上没有实质上的差异。对于非常大的数据集，它是最快的传输格式，甚至可以在解析速度和下载时间上击败本机执行的JSON。用此格式向客户端传送大量数据只用很少的时间。


Data Format Conclusions 数据格式总结
总的来说越轻量级的格式越好，最好是JSON 和字符分隔的自定义格式。如果数据集很大或者解析时间成问题，那么就使用这两种格式之一：

JSON-P 数据，用动态脚本标签插入法获取。它将数据视为可运行的JavaScript 而不是字符串，解析速度极快。它能够跨域使用，但不应涉及敏感数据。

字符分隔的自定义格式，使用XHR 或动态脚本标签插入技术提取，使用split()解析。此技术在解析非常大数据集时比JSON-P 技术略快，而且通常文件尺寸更小。

下表和图7-1 再次显示了所有方法的性能数据（按照从慢到快的顺序），你可以在此比较每种格式的优劣。HTML 未包括，因为它与其他格式不能直接比较。
demo: 数据格式性能.docx

请注意，这些数据只是在一个浏览器上进行一次测试获得的。此结果可用作大概的性能指标，而不是确切的数字。你可以自己运行这些测试，位于：http://techfoolery.com/formats/。


Ajax Performance Guidelines Ajax 性能向导
一旦你选择了最合适的数据传输技术和数据格式，那么就开始考虑其他的优化技术吧。这些技术要根据具体情况使用，在考虑它们之前首先应确认你的应用程序是否能够适合这些概念。


Cache Data 缓存数据
最快的Ajax 请求就是你不要用它。有两种主要方法避免发出一个不必要的请求：

在服务器端，设置HTTP 头，确保返回报文将被缓存在浏览器中。

在客户端，于本地缓存已获取的数据，不要多次请求同一个数据。

第一种技术最容易设置和维护，而第二个给你最大程度的控制。


Setting HTTP headers 设置HTTP 头
如果你希望Ajax 响应报文能够被浏览器所缓存，你必须在发起请求时使用GET 方法。但这还不充分，你必须在响应报文中发送正确的HTTP 头。Expires 头告诉浏览器应当缓存响应报文多长时间。其值是一个日期，当过期之后任何对该URL 发起的请求都不再从缓存中获得，而要重新访问服务器。一个Expires 头如下：
Expires: Mon, 28 Jul 2014 23:30:00 GMT

这种特殊的Expires 头告诉浏览器缓存此响应报文直到2014 年7 月。这就是所谓的遥远未来Expires 头，用于那些永不改变的内容，例如图片和静态数据集。

Expires 头中的日期是GMT 日期。它在PHP 中使用如下代码设置：
$lifetime = 7 * 24 * 60 * 60; // 7 days, in seconds.
header('Expires: ' . gmdate('D, d M Y H:i:s', time() + $lifetime) . ' GMT');

这将告诉浏览器缓存此数据7 天。要设置一个遥远未来Expires 头，将它的生命期设得更长，下面的例子告诉浏览器缓存文件10 年：
$lifetime = 10 * 365 * 24 * 60 * 60; // 10 years, in seconds.
header('Expires: ' . gmdate('D, d M Y H:i:s', time() + $lifetime) . ' GMT');

一个Expires 头是确保浏览器缓存Ajax 响应报文最简单的方法。你不需要改变客户端的任何代码，可继续正常地使用Ajax 请求，确信浏览器只当文件不在缓存之中时才将请求发送给服务器。这在服务器端也很容易实现，所有的语言都允许你通过某种方法设置信息头。这是保证你的数据被缓存的最简单方法。


Storing data locally 本地存储数据
除了依赖浏览器处理缓存之外，你还可以用手工方法实现它，直接存储那些从服务器收到的响应报文。可将响应报文存放在一个对象中，以URL 为键值索引它。这是一个XHR 封装，它首先检查一个URL 此前是否被取用过：
demo: cache.htm

总的来说，设置一个Expires 头是更好的解决方案。这比较容易，而且其缓存内容可以跨页面或者跨对话。而一个手工缓存可以用程序废止缓存内容并获取新的数据。设想一种情况，你为每个请求缓存数据，用户可能触发某些动作导致一个或多个响应报文作废。这种情况下从缓存中删除报文十分简单：
delete localCache['/user/friendlist/'];
delete localCache['/user/contactlist/'];

本地缓存也可很好地工作于移动设备上。此类设备上的浏览器缓存小或者根本不存在，手工缓存成为避免不必要请求的最佳选择。


Know the Limitations of Your Ajax Library 了解Ajax 库的限制
所有JavaScript 库允许你访问一个Ajax 对象，它屏蔽浏览器之间的差异，给你一个一致的接口。大多数情况下这非常好，因为它使你可以关注你的项目，而不是那些古怪的浏览器上XHR 的工作细节。然而，为了给你一个统一的接口，这些库必须简化接口，因为不是所有浏览器都实现了每个功能。这使得你不能访问XMLHttpRequest 的完整功能。

本章中介绍的一些技术只能通过直接访问XHR 对象实现。值得注意的是在多部分XHR 技术中要用到流功能。通过监听readyState 3，我们在一个大的响应报文没有完全接收之前就开始解析它。这使我们可以实时处理报文片断，这也是MXHR 能够大幅度提高性能的原因之一。不过大多数JavaScript 库不允许你直接访问readystatechange 事件。这意味着你必须等待整个响应报文接收完（可能是一个相当长的时间）然后你才能使用它。

直接使用XMLHttpRequest 对象并非像它看起来那么恐怖。除一些个别行为之外，所有主流浏览器的最新版本均以同样方式支持XMLHttpRequest 对象，均可访问不同的readyStates。如果你要支持老版本的IE，只需要多加几行代码。下面例子中的函数返回一个XHR 对象，你可以直接调用（这是YUI 2 连接管理器中修改后的版本）：
demo: xhr.js

它首先尝试支持readyState 3 的XMLHttpRequest，然后回落到那些不支持此状态的版本中。

直接操作XHR 对象减少了函数开销，进一步提高了性能。只是放弃使用Ajax 库，你可能会在古怪的浏览器上遇到一些问题。


Summary 总结
高性能Ajax 包括：知道你项目的具体需求，选择正确的数据格式和与之相配的传输技术。

作为数据格式，纯文本和HTML 是高度限制的，但它们可节省客户端的CPU 周期。XML 被广泛应用普遍支持，但它非常冗长且解析缓慢。JSON 是轻量级的，解析迅速（作为本地代码而不是字符串），交互性与XML 相当。字符分隔的自定义格式非常轻量，在大量数据集解析时速度最快，但需要编写额外的程序在服务器端构造格式，并在客户端解析。

当从页面域请求数据时，XHR 提供最完善的控制和灵活性，尽管它将所有传入数据视为一个字符串，这有可能降低解析速度。另一方面，动态脚本标签插入技术允许跨域请求和本地运行JavaScript 和JSON，虽然它的接口不够安全，而且不能读取信息头或响应报文代码。多部分XHR 可减少请求的数量，可在一次响应中处理不同的文件类型，尽管它不能缓存收到的响应报文。当发送数据时，图像灯标是最简单和最有效的方法。XHR 也可用POST 方法发送大量数据。

除这些格式和传输技术之外，还有一些准则有助于进一步提高Ajax 的速度：

减少请求数量，可通过JavaScript 和CSS 文件打包，或者使用MXHR。

缩短页面的加载时间，在页面其它内容加载之后，使用Ajax 获取少量重要文件。

确保代码错误不要直接显示给用户，并在服务器端处理错误。

学会何时使用一个健壮的Ajax 库，何时编写自己的底层Ajax 代码。

Ajax 是提升你网站潜在性能之最大的改进区域之一，因为很多网站大量使用异步请求，又因为它提供了许多不相关问题的解决方案，这些问题诸如，需要加载太多资源。对XHR 的创造性应用是如此的与众不同，它不是呆滞不友好的界面，而是响应迅速且高效的代名词；它不会引起用户的憎恨，谁见了它都会爱上它。