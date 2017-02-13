第四章 Algorithms and Flow Control 算法和流程控制
代码整体结构是执行速度的决定因素之一。代码量少不一定运行速度快，代码量多也不一定运行速度慢。性能损失与代码组织方式和具体问题解决办法直接相关。

本章技术不仅适用于JavaScript 也适用于其他语言的性能优化。还有一些为其他语言提供的建议，还要处理多种JavaScript 引擎并考虑它们的差异，但这些技术都以当前计算机科学知识为基础。


Loops 循环
在大多数编程语言中，代码执行时间多数在循环中度过。


Types of Loops 循环的类型

ECMA-263 标准第三版规定了JavaScript 的基本语法和行为，定义了四种类型的循环。第一个是标准的for 循环，与类C 语言使用同样的语法：
for (var i=0; i < 10; i++){
//loop body
}

for 循环大概是最常用的JavaScript 循环结构。它由四部分组成：初始化体，前测条件，后执行体，循环体。当遇到一个for 循环时，初始化体首先执行，然后进入前测条件。如果前测条件的计算结果为true，则执行循环体。然后运行后执行体。for 循环封装上的直接性是开发者喜欢的原因。

第二种循环是while 循环。while 循环是一个简单的预测试循环，由一个预测试条件和一个循环体构成：
var i = 0;
while(i < 10){
//loop body
i++;
}
在循环体执行之前，首先对前测条件进行计算。如果计算结果为true，那么就执行循环体；否则循环体将被跳过。任何for 循环都可以写成while 循环，反之亦然。

第三种循环类型是do-while 循环。do-while 循环是JavaScript 中唯一一种后测试的循环，它包括两部分：循环体和后测试条件体：
var i = 0;
do {
//loop body
} while (i++ < 10);

在一个do-while 循环中，循环体至少运行一次，后测试条件决定循环体是否应再次执行。

第四种也是最后一种循环称为for-in 循环。此循环有一个非常特殊的用途：它可以枚举任何对象的命名属性。其基本格式如下：
for (var prop in object){
//loop body
}

每次循环执行，属性变量被填充以对象属性的名字（一个字符串），直到所有的对象属性遍历完成才返回。返回的属性包括对象的实例属性和它从原型链继承而来的属性。


Loop Performance 循环性能
循环性能争论的源头是应当选用哪种循环。在JavaScript 提供的四种循环类型中，只有一种循环比其他循环明显要慢：for-in 循环。

由于每次迭代操作要搜索实例或原形的属性，for-in 循环每次迭代都要付出更多开销，所以比其他类型循环慢一些。在同样的循环迭代操作中，for-in 循环比其他类型的循环慢7 倍之多。因此推荐的做法如下：除非你需要对数目不详的对象属性进行操作，否则避免使用for-in 循环。如果你迭代遍历一个有限的，已知的属性列表，使用其他循环类型更快，可使用如下模式：
var props = ["prop1", "prop2"],
i = 0;
while (i < props.length){
process(object[props[i]]);
}

此代码创建一个由成员和属性名构成的队列。while 循环用于遍历这几个属性并处理所对应的对象成员，而不是遍历对象的每个属性。此代码只关注感兴趣的属性，节约了循环时间。

除for-in 循环外，其他循环类型性能相当，难以确定哪种循环更快。选择循环类型应基于需求而不是性能。

如果循环类型与性能无关，那么如何选择？其实只有两个因素：
每次迭代干什么
迭代的次数
通过减少这两者中一个或者全部（的执行时间），你可以积极地影响循环的整体性能。


Decreasing the work per iteration 减少迭代的工作量
不言而喻，如果一次循环迭代需要较长时间来执行，那么多次循环将需要更长时间。限制在循环体内进行耗时操作的数量是一个加快循环的好方法。

一个典型的数组处理循环，可使用三种循环的任何一种。最常用的代码写法如下：
//original loops
for (var i=0; i < items.length; i++){
process(items[i]);
}

var j=0;
while (j < items.length){
process(items[j++]]);
}

var k=0;
do {
process(items[k++]);
} while (k < items.length);

在每个循环中，每次运行循环体都要发生如下几个操作：
1.在控制条件中读一次属性（items.length）
2.在控制条件中执行一次比较（i < items.length）
3.比较操作，察看条件控制体的运算结果是不是true（i < items.length == true）
4.一次自加操作（i++）
5.一次数组查找（items[i]）
6.一次函数调用（process(items[i])）

减少每次迭代中操作的总数可以大幅度提高循环整体性能。

优化循环工作量的第一步是减少对象成员和数组项查找的次数。正如第2 章讨论的，在大多数浏览器上，这些操作比访问局部变量或直接量需要更长时间。前面的例子中每次循环都查找items.length。这是一种浪费，因为该值在循环体执行过程中不会改变，因此产生了不必要的性能损失。你可以简单地将此值存入一个局部变量中，在控制条件中使用这个局部变量，从而提高了循环性能：
//minimizing property lookups
for (var i=0, len=items.length; i < len; i++){
process(items[i]);
}

var j=0,
count = items.length;
while (j < count){
process(items[j++]]);
}

var k=0,
num = items.length;
do {
process(items[k++]);
} while (k < num);

这些重写后的循环只在循环执行之前对数组长度进行一次属性查询。这使得控制条件只有局部变量参与运算，所以速度更快。根据数组的长度，在大多数浏览器上你可以节省大约25%的总循环时间（在Internet Explorer 可节省50%）。

你还可以通过改变他们的顺序提高循环性能。通常，数组元素的处理顺序与任务无关，你可以从最后一个开始，直到处理完第一个元素。倒序循环是编程语言中常用的性能优化方法，但一般来说不太容易理解。在JavaScript 中，倒序循环可以略微提高循环性能，只要你消除因此而产生的额外操作：
//minimizing property lookups and reversing
for (var i=items.length; i--; ){
process(items[i]);
}

var j = items.length;
while (j--){
process(items[j]]);
}

var k = items.length-1;
do {
process(items[k]);
} while (k--);

例子中使用了倒序循环，并在控制条件中使用了减法。每个控制条件只是简单地与零进行比较。控制条件与true 值进行比较，任何非零数字自动强制转换为true，而零等同于false。实际上，控制条件已经从两次比较（迭代少于总数吗？它等于true 吗？）减少到一次比较（它等于true 吗？）。将每个迭代中两次比较减少到一次可以大幅度提高循环速度。通过倒序循环和最小化属性查询，你可以看到执行速度比原始版本快了50%-60%。

与原始版本相比，每次迭代中只进行如下操作：
1.在控制条件中进行一次比较（i == true）
2.一次减法操作（i--）
3.一次数组查询（items[i]）
4.一次函数调用（process(items[i])）
新循环代码每次迭代中减少两个操作，随着迭代次数的增长，性能将显著提升。


Decreasing the number of iterations 减少迭代次数
即使循环体中最快的代码，累计迭代上千次（也将是不小的负担）。此外，每次运行循环体时都会产生一个很小的性能开销，也会增加总的运行时间。减少循环的迭代次数可获得显著的性能提升。最广为人知的限制循环迭代次数的模式称作“达夫设备”。

达夫设备是一个循环体展开技术，在一次迭代中实际上执行了多次迭代操作。Jeff Greenberg 被认为是将达夫循环从原始的C 实现移植到JavaScript 中的第一人。一个典型的实现如下：
//credit: Jeff Greenberg
var iterations = Math.floor(items.length / 8),
startAt = items.length % 8,
i = 0;
do {
    switch(startAt){
        case 0: process(items[i++]);
        case 7: process(items[i++]);
        case 6: process(items[i++]);
        case 5: process(items[i++]);
        case 4: process(items[i++]);
        case 3: process(items[i++]);
        case 2: process(items[i++]);
        case 1: process(items[i++]);
    }
    startAt = 0;
} while (--iterations);

达夫设备背后的基本理念是：每次循环中最多可8 次调用process()函数。循环迭代次数为元素总数除以8。因为总数不一定是8 的整数倍，所以startAt 变量存放余数，指出第一次循环中应当执行多少次process()。比方说现在有12 个元素，那么第一次循环将调用process()4 次，第二次循环调用process()8 次，用2 次循环代替了12 次循环。

此算法一个稍快的版本取消了switch 表达式，将余数处理与主循环分开：
//credit: Jeff Greenberg
var i = items.length % 8;
while(i){
    process(items[i--]);
}
i = Math.floor(items.length / 8);
while(i){
    process(items[i--]);
    process(items[i--]);
    process(items[i--]);
    process(items[i--]);
    process(items[i--]);
    process(items[i--]);
    process(items[i--]);
    process(items[i--]);
}

虽然此代码中使用两个循环替代了先前的一个，但它去掉了循环体中的switch 表达式，速度更快。

是否值得使用达夫设备，无论是原始的版本还是修改后的版本，很大程度上依赖于迭代的次数。如果循环迭代次数少于1'000 次，你可能只看到它与普通循环相比只有微不足道的性能提升。如果迭代次数超过1'000 次，达夫设备的效率将明显提升。例如500'000 次迭代中，运行时间比普通循环减少到70%。


Function-Based Iteration 基于函数的迭代
ECMA-262 标准第四版介绍了本地数组对象的一个新方法forEach()。此方法遍历一个数组的所有成员，并在每个成员上执行一个函数。在每个元素上执行的函数作为forEach()的参数传进去，并在调用时接收三个参数，它们是：数组项的值，数组项的索引，和数组自身。下面是用法举例：
items.forEach(function(value, index, array){
    process(value);
});

forEach()函数在Firefox，Chrome，和Safari 中为原生函数。另外，大多数JavaScript 库都有等价实现。

尽管基于函数的迭代显得更加便利，它还是比基于循环的迭代要慢一些。每个数组项要关联额外的函数调用是造成速度慢的原因。在所有情况下，基于函数的迭代占用时间是基于循环的迭代的八倍，因此在关注执行时间的情况下它并不是一个合适的办法。


Conditionals 条件表达式
与循环相似，条件表达式决定JavaScript 运行流的走向。其他语言使用if-else 或者switch 表达式的传统观点也适用于JavaScript。由于不同的浏览器针对流程控制进行了不同的优化，使用哪种技术并不总是很清楚。

if-else Versus switch if-else 与switch 比较
使用if-else 或者switch 的流行理论是基于测试条件的数量：条件数量较大，倾向于使用switch 而不是if-else。这通常归结到代码的易读性。这种观点认为，如果条件较少时，if-else 容易阅读，而条件较多时switch更容易阅读。考虑下面几点：
if (found){
//do something
} else {
//do something else
}

switch(found){
case true:
//do something
break;
default:
//do something else
}

虽然两个代码块实现同样任务，很多人会认为if-else 表达式比witch 表达式更容易阅读。如果增加条件体的数量，通常会扭转这种观点：
if (color == "red"){
//do something
} else if (color == "blue"){
//do something
} else if (color == "brown"){
//do something
} else if (color == "black"){
//do something
} else {
//do something
}

switch (color){
case "red":
//do something
break;
case "blue":
//do something
break;
case "brown":
//do something
break;
case "black":
//do something
break;
default:
//do something
}
大多数人会认为这段代码中的switch 表达式比if-else 表达式可读性更好。

事实证明，大多数情况下switch 表达式比if-else 更快，但只有当条件体数量很大时才明显更快。两者间的主要性能区别在于：当条件体增加时，if-else 性能负担增加的程度比switch 更多。因此，我们的自然倾向认为条件体较少时应使用if-else 而条件体较多时应使用switch 表达式，如果从性能方面考虑也是正确的。

一般来说，if-else 适用于判断两个离散的值或者判断几个不同的值域。如果判断多于两个离散值，switch表达式将是更理想的选择。

Optimizing if-else 优化if-else
优化if-else 的目标总是最小化找到正确分支之前所判断条件体的数量。最简单的优化方法是将最常见的条件体放在首位。考虑下面的例子：
if (value < 5) {
//do something
} else if (value > 5 && value < 10) {
//do something
} else {
//do something
}
这段代码只有当value 值经常小于5 时才是最优的。如果value 经常大于等于10，那么在进入正确分支之前，必须两次运算条件体，导致表达式的平均时间提高。if-else 中的条件体应当总是按照从最大概率到最小概率的顺序排列，以保证理论运行速度最快。

另外一种减少条件判断数量的方法是将if-else 组织成一系列嵌套的if-else 表达式。使用一个单独的一长串的if-else 通常导致运行缓慢，因为每个条件体都要被计算。例如：
demo: if-else.htm

在这个if-else 表达式中，所计算条件体的最大数目是10。如果假设value 的值在0 到10 之间均匀分布，那么会增加平均运行时间。为了减少条件判断的数量，此代码可重写为一系列嵌套的if-else 表达式，例如：
demo: if-else-2.htm

在重写的if-else 表达式中，每次抵达正确分支时最多通过四个条件判断。它使用二分搜索法将值域分成了一系列区间，然后逐步缩小范围。当数值范围分布在0 到10 时，此代码的平均运行时间大约是前面那个版本的一半。此方法适用于需要测试大量数值的情况（相对离散值来说switch 更合适）。


Lookup Tables 查表法
有些情况下要避免使用if-else 或switch。当有大量离散值需要测试时，if-else 和switch 都比使用查表法要慢得多。在JavaScript 中查表法可使用数组或者普通对象实现，查表法访问数据比if-else 或者switch 更快，特别当条件体的数目很大时。

与if-else 和switch 相比，查表法不仅非常快，而且当需要测试的离散值数量非常大时，也有助于保持代码的可读性。例如，当switch 表达式很大时就变得很笨重，诸如：
demo: switch.htm

switch 表达式代码所占的空间可能与它的重要性不成比例。整个结构可以用一个数组查表替代：
//define the array of results
var results = [result0, result1, result2, result3, result4, result5, result6, result7, result8, result9, result10]
//return the correct result
return results[value];

当使用查表法时，必须完全消除所有条件判断。操作转换成一个数组项查询或者一个对象成员查询。使用查表法的一个主要优点是：由于没有条件判断，当候选值数量增加时，很少，甚至没有增加额外的性能开销。

查表法最常用于一个键和一个值形成逻辑映射的领域（如前面的例子）。一个switch 表达式更适合于每个键需要一个独特的动作，或者一系列动作的场合。


Recursion 递归
复杂算法通常比较容易使用递归实现。事实上，有些传统算法正是以递归实现的，诸如阶乘函数：
function factorial(n){
if (n == 0){
return 1;
} else {
return n * factorial(n-1);
}
}

递归函数的问题是，一个错误定义，或者缺少终结条件可导致长时间运行，冻结用户界面。此外，递归函数还会遇到浏览器调用栈大小的限制。


Call Stack Limits 调用栈限制
JavaScript 引擎所支持的递归数量与JavaScript 调用栈大小直接相关。只有Internet Explorer 例外，它的调用栈与可用系统内存相关，其他浏览器有固定的调用栈限制。大多数现代浏览器的调用栈尺寸比老式浏览器要大。

当你使用了太多的递归，超过最大调用栈尺寸时，浏览器会出错并弹出以下信息：
Internet Explorer: “Stack overflow at line x”
Firefox: “Too much recursion”
Safari: “Maximum call stack size exceeded”
Opera: “Abort (control stack overflow)”
Chrome 是唯一不显示调用栈溢出错误的浏览器。

关于调用栈溢出错误，最令人感兴趣的部分大概是：在某些浏览器中，他们的确是JavaScript 错误，可以用一个try-catch 表达式捕获。异常类型因浏览器而不同。在Firefox 中，它是一个InternalError；在Safari和Chrome 中，它是一个RangeError；在Internet Explorer 中抛出一个一般性的Error 类型。（Opera 不抛出错误；它终止JavaScript 引擎）。这使得我们能够在JavaScript 中正确处理这些错误：
try {
recurse();
} catch (ex){
alert("Too much recursion!");
}

如果不管它，那么这些错误将像其他错误一样冒泡上传（在Firefox 中，它结束于Firebug 和错误终端；在Safari/Chrome 中它显示在JavaScript 终端上），只有Internet Explorer 例外。IE 不会显示一个JavaScript错误，但是会弹出一个提示堆栈溢出信息的对话框。


Recursion Patterns 递归模式
当你陷入调用栈尺寸限制时，第一步应该定位在代码中的递归实例上。为此，有两个递归模式值得注意。首先是直接递归模式为代表的前面提到的factorial()函数，即一个函数调用自身。其一般模式如下：
function recurse(){
recurse();
}
recurse();

当发生错误时，这种模式比较容易定位。另外一种模式称为精巧模式，它包含两个函数：
function first(){
second();
}
function second(){
first();
}
first();

在这种递归模式中，两个函数互相调用对方，形成一个无限循环。这是一个令人不安的模式，在大型代码库中定位错误很困难。

大多数调用栈错误与这两种模式之一有关。常见的栈溢出原因是一个不正确的终止条件，所以定位模式错误的第一步是验证终止条件。如果终止条件是正确的，那么算法包含了太多层递归，为了能够安全地在浏览器中运行，应当改用迭代，制表，或两者兼而有之。

简而言之，就是用一个数组栈记录每次递归的结果，如果某值曾经计算过，那么直接从数组栈中以查表法获得结果，而不必重复计算。


Iteration 迭代
任何可以用递归实现的算法都可以用迭代实现。迭代算法通常包括几个不同的循环，分别对应算法过程的不同方面，也会导致自己的性能为题。但是，使用优化的循环替代长时间运行的递归函数可以提高性能，因为运行一个循环比反复调用一个函数的开销要低。

例如，合并排序算法是最常用的以递归实现的算法。一个简单的JavaScript 实现的合并排序算法如下：

function merge(left, right){
    var result = [];
    while (left.length > 0 && right.length > 0){
        if (left[0] < right[0]){
            result.push(left.shift());
        } else {
            result.push(right.shift());
        }
    }
    return result.concat(left).concat(right);
}

function mergeSort(items){
    if (items.length == 1) {
        return items;
    }
    var middle = Math.floor(items.length / 2),
    left = items.slice(0, middle),
    right = items.slice(middle);
    return merge(mergeSort(left), mergeSort(right));
}

这个合并排序代码相当简单直接，但是mergeSort()函数被调用非常频繁。一个具有n 个项的数组总共调用mergeSort()达2 * n - 1 次，也就是说，对一个超过1500 个项的数组操作，就可能在Firefox 上导致栈溢出。

程序陷入栈溢出错误并不一定要修改整个算法；它只是意味着递归不是最好的实现方法。合并排序算法还可以用迭代实现，如下：
//uses the same mergeSort() function from previous example
function mergeSort(items){
    if (items.length == 1) {
        return items;
    }
    var work = [];
    for (var i=0, len=items.length; i < len; i++){
        work.push([items[i]]);
    }
    work.push([]); //in case of odd number of items
    for (var lim=len; lim > 1; lim = (lim+1)/2){
        for (var j=0,k=0; k < lim; j++, k+=2){
            work[j] = merge(work[k], work[k+1]);
        }
        work[j] = []; //in case of odd number of items
    }
    return work[0];
}

此mergeSort()实现与前面的函数实现同样功能而没有使用递归。虽然迭代版本的合并排序可能比递归版本的慢一些，但它不会像递归版本那样影响调用栈。将递归算法切换为迭代只是避免栈溢出错误的方法之一。


Memoization 制表
制表，通过缓存先前计算结果为后续计算所重复使用，避免了重复工作。这使得制表成为递归算法中有用的技术。

当递归函数多次被调用时，重复工作很多。在factorial()函数中（在前面介绍过的阶乘函数），是一个递归函数重复多次的典型例子。考虑下面的代码：
var fact6 = factorial(6);
var fact5 = factorial(5);
var fact4 = factorial(4);

此代码生成三个阶乘结果，factorial()函数总共被调用了18 次。此代码中最糟糕的部分是，所有必要的计算已经在第一行代码中执行过了。因为6 的阶乘等于6 乘以5 的阶乘，所以5 的阶乘被计算了两次。更糟糕的是，4 的阶乘被计算了三次。更为明智的方法是保存并重利用它们的计算结果，而不是每次都重新计算整个函数。

你可以使用制表技术来重写factorial()函数，如下：
function memfactorial(n){
    if (!memfactorial.cache){
        memfactorial.cache = {
        "0": 1,
        "1": 1
        };
    }
    if (!memfactorial.cache.hasOwnProperty(n)){
        memfactorial.cache[n] = n * memfactorial (n-1);
    }
    return memfactorial.cache[n];
}

这个使用制表技术的阶乘函数的关键是建立一个缓存对象。此对象位于函数内部，并预置了两个最简单的阶乘：0 和1。在计算阶乘之前，首先检查缓存中是否已经存在相应的计算结果。没有对应的缓冲值说明这是第一次进行此数值的计算，计算完成之后结果被存入缓存之中，以备今后使用。此函数与原始版本的factorial()函数用法相同。
var fact6 = memfactorial(6);
var fact5 = memfactorial(5);
var fact4 = memfactorial(4);

此代码返回三个不同的阶乘值，但总共只调用memfactorial()函数八次。既然所有必要的计算都在第一行代码中完成了，那么后两行代码不会产生递归运算，因为直接返回缓存中的数值。

制表过程因每种递归函数而略有不同，但总体上具有相同的模式。为了使一个函数的制表过程更加容易，你可以定义一个memoize()函数封装基本功能。例如：
function memoize(fundamental, cache){
    cache = cache || {};
    var shell = function(arg){
        if (!cache.hasOwnProperty(arg)){
            cache[arg] = fundamental(arg);
        }
        return cache[arg];
    };
    return shell;
}

此memoize()函数接收两个参数：一个用来制表的函数和一个可选的缓存对象。如果你打算预设一些值，那么就传入一个预定义的缓存对象；否则它将创建一个新的缓存对象。然后创建一个外壳函数，将原始函数（fundamential）包装起来，确保只有当一个此前从未被计算过的值传入时才真正进行计算。计算结果由此外壳函数返回，你可以直接调用它，例如：
//memoize the factorial function
var memfactorial = memoize(factorial, { "0": 1, "1": 1 });
//call the new function
var fact6 = memfactorial(6);
var fact5 = memfactorial(5);
var fact4 = memfactorial(4);

这种通用制表函数与人工更新算法相比优化较少，因为memoize()函数缓存特定参数的函数调用结果。当代码以同一个参数多次调用外壳函数时才能节约时间（译者注：如果外壳函数内部还存在递归，那么内部的递归就不能享用这些中间运算结果了）。因此，当一个通用制表函数存在显著性能问题时，最好在这些函数中人工实现制表法。


Summary 总结
正如其他编程语言，代码的写法和算法选用影响JavaScript 的运行时间。与其他编程语言不同的是，JavaScript 可用资源有限，所以优化技术更为重要。

for，while，do-while 循环的性能特性相似，谁也不比谁更快或更慢。

除非你要迭代遍历一个属性未知的对象，否则不要使用for-in 循环。

改善循环性能的最好办法是减少每次迭代中的运算量，并减少循环迭代次数。

一般来说，switch 总是比if-else 更快，但并不总是最好的解决方法。

当判断条件较多时，查表法比if-else 或者switch 更快。

浏览器的调用栈尺寸限制了递归算法在JavaScript 中的应用；栈溢出错误导致其他代码也不能正常执行。

如果你遇到一个栈溢出错误，将方法修改为一个迭代算法或者使用制表法可以避免重复工作。

运行的代码总量越大，使用这些策略所带来的性能提升就越明显。
