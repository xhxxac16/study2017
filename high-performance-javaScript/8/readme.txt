第八章 Programming Practices 编程实践
每种编程语言都有痛点，而且低效模式随着时间的推移不断发展。自2005 年以来，当术语“Ajax”出现时，网页开发者对JavaScript 和浏览器的推动作用远超过以往。其结果是出现了一些非常具体的模式，即有优秀的做法也有糟糕的做法。这些模式的出现，是因为网络上JavaScript 的性质决定的。


Avoid Double Evaluation 避免二次评估
JavaScript 与许多脚本语言一样，允许你在程序中获取一个包含代码的字符串然后运行它。有四种标准方法可以实现：eval()，Function()构造器，setTimeout()和setInterval()。每个函数允许你传入一串JavaScript代码，然后运行它。例如：
demo: str.htm

当你在JavaScript 代码中执行（另一段）JavaScript 代码时，你付出二次评估的代价。此代码首先被评估为正常代码，然后在执行过程中，运行字符串中的代码时发生另一次评估。二次评估是一项昂贵的操作，与直接包含相应代码相比将占用更长时间。

作为一个比较点，不同浏览器上访问一个数组项所占用的时间各有不同，但如果使用eval()访问其结果将大相径庭。例如：
//faster
var item = array[0];
//slower
var item = eval("array[0]");

如果使用eval()代替直接代码访问10'000 个数组项，在不同浏览器上的差异非常巨大。
demo: eval.docx

访问数组项时间上的巨大差异，是因为每次调用eval()时要创建一个新的解释/编译实例。同样的过程也发生在Function()，setTimeout()和setInterval()上，自动使代码执行速度变慢。

大多数情况下，没必要使用eval()或Function()，如果可能的话，尽量避免使用它们。至于另外两个函数，setTimeout()和setInterval()，建议第一个参数传入一个函数而不是一个字符串。例如：
setTimeout(function(){
sum = num1 + num2;
}, 100);
setInterval(function(){
sum = num1 + num2;
}, 100);

避免二次评估是实现最优化的JavaScript 运行时性能的关键。


Use Object/Array Literals 使用对象/数组直接量
在JavaScript 中有多种方法创建对象和数组，但没有什么比创建对象和数组直接量更快了。如果不使用直接量，典型的对象创建和赋值是这样的：
//create an object
var myObject = new Object();
myObject.name = "Nicholas";
myObject.count = 50;
myObject.flag = true;
myObject.pointer = null;
//create an array
var myArray = new Array();
myArray[0] = "Nicholas";
myArray[1] = 50;
myArray[2] = true;
myArray[3] = null;

虽然在技术上这种做法没有什么不对，直接量赋值很快。作为一个额外的好处，直接量在你的代码中占用较少空间，所以整个文件尺寸可以更小。上面的代码可用直接量重写为下面的样式：
//create an object
var myObject = {
name: "Nicholas",
count: 50,
flag: true,
pointer: null
};
//create an array
var myArray = ["Nicholas", 50, true, null];

此代码的效果与前面的版本相同，但在几乎所有浏览器上运行更快（在Firefox 3.5 上几乎没区别）。随着对象属性和数组项数的增加，使用直接量的好处也随之增加。


Don't Repeat Work 不要重复工作
避免工作的概念实际上意味着两件事：不要做不必要的工作，不要重复做已经完成的工作。第一部分通常认为代码应当重构。第二部分——不要重复工作——通常难以确定，因为工作可能因为各种原因而在很多地方被重复。

也许最常见的重复工作类型是浏览器检测。大量代码依赖于浏览器的功能。以事件句柄的添加和删除为例，典型的跨浏览器代码如下：
demo:　event.htm

此代码通过测试addEventListener()和removeEventListener()检查DOM 级别2 的事件支持情况，它能够被除Internet Explorer 之外的所有现代浏览器所支持。如果这些方法不存在于target 中，那么就认为当前浏览器是IE，并使用IE 特有的方法。

乍一看，这些函数为实现它们的目的已经足够优化。隐藏的性能问题在于每次函数调用时都执行重复工作。每一次，都进行同样的检查，看看某种方法是否存在。如果你假设target 唯一的值就是DOM 对象，而且用户不可能在页面加载时魔术般地改变浏览器，那么这种判断就是重复的。如果addHandler()一上来就调用addEventListener()那么每个后续调用都要出现这句代码。在每次调用中重复同样的工作是一种浪费，有多种办法避免这一点。


Lazy Loading 延迟加载
第一种消除函数中重复工作的方法称作延迟加载。延迟加载意味着在信息被使用之前不做任何工作。在前面的例子中，不需要判断使用哪种方法附加或分离事件句柄，直到有人调用此函数。使用延迟加载的函数如下：
demo:　event-modify.htm

这两个函数依照延迟加载模式实现。这两个方法第一次被调用时，检查一次并决定使用哪种方法附加或分离事件句柄。然后，原始函数就被包含适当操作的新函数覆盖了。最后调用新函数并将原始参数传给它。以后再调用addHandler()或者removeHandler()时不会再次检测，因为检测代码已经被新函数覆盖了。

调用一个延迟加载函数总是在第一次使用较长时间，因为它必须运行检测然后调用另一个函数以完成任务。但是，后续调用同一函数将快很多，因为不再执行检测逻辑了。延迟加载适用于函数不会在页面上立即被用到的场合。


Conditional Advance Loading 条件预加载
除延迟加载之外的另一种方法称为条件预加载，它在脚本加载之前提前进行检查，而不等待函数调用。这样做检测仍只是一次，但在此过程中来的更早。例如：
demo: event-modify-modify.htm

这个例子检查addEventListener()和removeEventListener()是否存在，然后根据此信息指定最合适的函数。三元操作符返回DOM 级别2 的函数，如果它们存在的话，否则返回IE 特有的函数。然后，调用addHandler()和removeHandler()同样很快，虽然检测功能提前了。

条件预加载确保所有函数调用时间相同。其代价是在脚本加载时进行检测。预加载适用于一个函数马上就会被用到，而且在整个页面生命周期中经常使用的场合。


Use the Fast Parts 使用速度快的部分

Bitwise Operators 位操作运算符
位操作运算符是JavaScript 中经常被误解的内容之一。一般的看法是，开发者不知道如何使用这些操作符，经常在布尔表达式中误用。结果导致JavaScript 开发中不常用位操作运算符，尽管它们具有优势。

JavaScript 中的数字按照IEEE-754 标准64 位格式存储。在位运算中，数字被转换为有符号32 位格式。每种操作均直接操作在这个32 位数上实现结果。尽管需要转换，这个过程与JavaScript 中其他数学和布尔运算相比还是非常快。

如果你对数字的二进制表示法不熟悉，JavaScript 可以很容易地将数字转换为字符串形式的二进制表达式，通过使用toString()方法并传入数字2（做参数）。例如：
var num1 = 25,
num2 = 3;
alert(num1.toString(2)); //"11001"
alert(num2.toString(2)); // "11"

请注意，该表达式消隐了数字高位的零。

JavaScript 中有四种位逻辑操作符：
Bitwise AND 位与
两个操作数的位都是1，结果才是1
Bitwise OR 位或
有一个操作数的位是1，结果就是1
Bitwise XOR 位异或
两个位中只有一个1，结果才是1
Bitwise NOT 位非
遇0 返回1，反之亦然

这些操作符用法如下：
//bitwise AND
var result1 = 25 & 3; //1
alert(result1.toString(2)); //"1"
//bitwise OR
var result2 = 25 | 3; //27
alert(resul2.toString(2)); //"11011"
//bitwise XOR
var result3 = 25 ^ 3; //26
alert(resul3.toString(2)); //"11000"
//bitwise NOT
var result = ~25; //-26
alert(resul2.toString(2)); //"-11010"

有许多方法可以使用位运算符提高JavaScript 的速度。首先可以用位运算符替代纯数学操作。例如，通常采用对2 取模运算实现表行颜色交替显示，例如：
for (var i=0, len=rows.length; i < len; i++){
if (i % 2) {
className = "even";
} else {
className = "odd";
}
//apply class
}

计算对2 取模，需要用这个数除以2 然后查看余数。如果你看到32 位数字的底层（二进制）表示法，你会发现偶数的最低位是0，奇数的最低位是1。如果此数为偶数，那么它和1 进行位与操作的结果就是0；如果此数为奇数，那么它和1 进行位与操作的结果就是1。也就是说上面的代码可以重写如下：
for (var i=0, len=rows.length; i < len; i++){
if (i & 1) {
className = "odd";
} else {
className = "even";
}
//apply class
}

虽然代码改动不大，但位与版本比原始版本快了50%（取决于浏览器）。

第二种使用位操作的技术称作位掩码。位掩码在计算机科学中是一种常用的技术，可同时判断多个布尔选项，快速地将数字转换为布尔标志数组。掩码中每个选项的值都等于2 的幂。例如：
var OPTION_A = 1;
var OPTION_B = 2;
var OPTION_C = 4;
var OPTION_D = 8;
var OPTION_E = 16;
通过定义这些选项，你可以用位或操作创建一个数字来包含多个选项：
var options = OPTION_A | OPTION_C | OPTION_D;

你可以使用位与操作检查一个给定的选项是否可用。如果该选项未设置则运算结果为0，如果设置了那么运算结果为1：
//is option A in the list?
if (options & OPTION_A){
//do something
}
//is option B in the list?
if (options & OPTION_B){
//do something
}

像这样的位掩码操作非常快，正因为前面提到的原因，操作发生在系统底层。如果许多选项保存在一起并经常检查，位掩码有助于加快整体性能。


Native Methods 原生方法
无论你怎样优化JavaScript 代码，它永远不会比JavaScript 引擎提供的原生方法更快。其原因十分简单：JavaScript 的原生部分——在你写代码之前它们已经存在于浏览器之中了——都是用低级语言写的，诸如C++。这意味着这些方法被编译成机器码，作为浏览器的一部分，不像你的JavaScript 代码那样有那么多限制。

经验不足的JavaScript 开发者经常犯的一个错误是在代码中进行复杂的数学运算，而没有使用内置Math对象中那些性能更好的版本。Math 对象包含专门设计的属性和方法，使数学运算更容易。这里是一些数学常数：
demo: math.docx

这里的每个数值都是预计算好的，所以你不需要自己来计算它们。还有一些处理数学运算的方法：
demo: math.docx

使用这些函数比同样功能的JavaScript 代码更快。当你需要进行复杂数学计算时，首先查看Math 对象。

另一个例子是选择器API，可以像使用CSS 选择器那样查询DOM 文档。CSS 查询被JavaScript 原生实现并通过jQuery 这个JavaScript 库推广开来。jQuery 引擎被认为是最快的CSS 查询引擎，但是它仍比原生方法慢。原生的querySelector()和querySelectorAll()方法完成它们的任务时，平均只需要基于JavaScript 的CSS 查询10%的时间。大多数JavaScript 库已经使用了原生函数以提高它们的整体性能。

当原生方法可用时，尽量使用它们，尤其是数学运算和DOM 操作。用编译后的代码做越多的事情，你的代码就会越快。


Summary 总结
JavaScript 提出了一些独特的性能挑战，关系到你组织代码的方法。网页应用变得越来越高级，包含的JavaScript 代码越来越多，出现了一些模式和反模式。请牢记以下编程经验：

通过避免使用eval()和Function()构造器避免二次评估。此外，给setTimeout()和setInterval()传递函数参数而不是字符串参数。

创建新对象和数组时使用对象直接量和数组直接量。它们比非直接量形式创建和初始化更快。

避免重复进行相同工作。当需要检测浏览器时，使用延迟加载或条件预加载。

当执行数学远算时，考虑使用位操作，它直接在数字底层进行操作。

原生方法总是比JavaScript 写的东西要快。尽量使用原生方法。
