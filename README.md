About
=====

hBind is a minimalistic binding library for Javascript, created with one purpose, one goal, one desire: to 
provide easy and uncomplicated syntax for binding DOM elements to events in unobtrusive way. 

Most existing binding frameworks and libraries were written with single-page applications in mind, and this 
approach creates problems when working with full-stack server-side frameworks, where sometimes you do not have
full control over your HTML. hBind is extremely light-weight, contains zero dependencies, and relies only on 
HTML5 data attributes in Angular-like way. hBind also contains syntactic sugar for dealing with AJAX requests.

You should note though that this is a very minimalistic library with a set of limitations:

- hBind is *not* a two-way binding library in the classic sense, because its models do not replicate data from
  the DOM. Elements are bound to each other, not to some underlying data.
- hBind is *not* a way to increase Javascript performance. Every time you refer to a field, the actual DOM is
  queried.
- hBind is *not* designed for compatibility with older browsers. For example, it uses 
```document.querySelectorAll()```.

Installation
============

To be added

Usage
=====

Simple example
--------------

The simplest use case of hBind looks like this:
```
<body>
  <div data-hbind="boundDiv">Some text</div>
  <div><button data-hbind="boundButton" data-hevent="click">Click me to change text</button></div>
  <script src="hbind.js"></script>
  <script>
    var myModel = {
      boundButton: {
        changeText: {
          action: function() {
            hBind.fields.boundDiv.innerHTML = 'Changed text';
          }
        }
      }
    };
    hBind.init();
    hBind.use(myModel);
  </script>
</body>
```

When you press the button, the div text will change.

Here we have two bound elements with ```data-hbind``` attribute: the active element (button) and the passive 
element (div), the model which is a variable in object-literal notation, and calls to init() and use() methods. 
Note that ```boundButton``` is used twice: first as a value of ```data-hbind```, second as a model property. 
```boundDiv``` is also used twice: first as a value of ```data-hbind```, second as an element in 
```hBind.fields``` hash in the model's ```action()``` method.

In this example, all the code is located in one place. In real life, though, it is likely that you will have 
three different files: one JS file for your models, and two HTML files: one for the actual HTML, another for 
inline script calls to ```hBind.init()``` and ```hBind.use()```.

Basic syntax
------------

Basic usage of hBind involves two HTML attributes: ```data-hbind``` and ```data-hevent```. Every element that 
uses binding in any way (except for group elements) must have a **data-hbind** attribute that acts as virtual 
replacement for ```id``` attribute. You might still need ids for markup, styles or third-party libraries, but 
if you are using ids for binding purposes, i.e. ```getElementById()``` then you are not using hBind correctly.

**data-hevent** attribute should be placed if the element should trigger an event. If this attribute is missing, 
hBind will listen to the ```change``` event, so it's not needed to write ```data-hevent="change"```.

The **model** is a special object that holds all DOM-related actions. The best practice is to create a file 
called something like ```models.js``` and put your model or models there. Methods that are not related to DOM 
manipulation should not be located in that file.

Every model should have **model mirrors**. A mirror is a property whose name is identical with the value of 
```data-hbind``` or ```data-hgroup``` attribute of at least one loaded element. 

A mirror contains one or more **action properties**, whose names are chosen arbitrarily. The best practice is 
to name action properties as verbs corresponding to what the action should do. If a model mirror contains more 
than one action property, all action methods are fired when the event happens.

Action properties must have one **action method** that is fired on event specified in ```data-hevent``` (or on 
```change``` by default). This method takes one optional argument that contains the ```event``` object from the 
BOM. If you want to call action method directly, you can add more arguments after the event argument.

Action properties might also contain **boundFields** property that should contain an array of ```data-hbind``` 
values. If such a property is present, the action method fires only if all elements with corresponding values 
exist in the document. ```boundFields``` is convenient when there is more than one action property on the model 
mirror, and you need to determine which action method should fire based on which elements were loaded into the 
document.

Inside the model, you can refer to any bound field by ```hBind.fields[fieldName]```. This reference contains 
the actual DOM element, so you can change any of its attributes dynamically. There is also a shortcut:
```hBind.currentElement```, that always refers to the bound element that fired the current event.

If your action method becomes too bloated, or if you need to reuse your code across several action methods, 
you can declare additional methods on your model outside model mirrors. Those are just usual Javascript 
functions that do not affect the work of the library. The best practice is not to use ```this``` keyword when 
referring to such methods, and explicitly use the model name instead.

To initialize the library and populate ```hBind.fields```, you need to call ```hBind.init()``` before any other 
library method or property is called. To use the model, you must declare it via ```hBind.use(model)```. You can 
use several models on single page by declaring ```hBind.use()``` several times. In case of conflicts between 
models, the last one takes precedence.

Static fields
-------------

hBind was made for use with server-side frameworks, and that sometimes raises an issue: if a variable is passed
from the server, how to use it in a static Javascript file, such as model file? To pass a server-side variable
to your model (or models), you can declare it as a static field:
```
hBind.init();
hBind.setStaticField('fieldName', 'fieldValue');
```

Then you can refer to that field from the model:
```
hBind.currentElement.innerHTML = hBind.staticFields.fieldName;
```

Binding groups
--------------

If you have a group of similar HTML elements, such as checkboxes or radio buttons, it will be better to place 
them in a group. Groups are declared via **data-hgroup** and **data-hindex** attributes:
```
<input type="checkbox" value="1" data-hevent="click" data-hgroup="weekdays" data-hindex="1" />Monday<br />
<input type="checkbox" value="1" data-hevent="click" data-hgroup="weekdays" data-hindex="2" />Tuesday<br />
```
The value of ```data-hindex``` can be either a number or a string.

In the model, a group is represented by a single model mirror:
```
var myModel = {
  weekdays: {
  }
};
```
All the action events of the group's model mirror will be called if any of the group's elements fires its 
event.

To refer to the group's elements from the model, you can use ```hBind.groupFields``` in the following manner:
```
hBind.groupFields.groupName.elementIndex
```

You can also use ```hBind.fields``` on a group, but it will not preserve elements' indices and create arbitrary 
numerical indices instead.

Note that if you call ```hBind.currentElement``` from the group's model mirror, it will refer not to the group 
as a whole, but only to the element that actually fired the current event.

Autoloading
-----------

If you want model mirror's action methods to fire when the page is loaded, you can place this property on your 
model mirror:
```
initialLoad: true
```

If you want the action method to fire only on page load, without any other events attached to it, you can name 
your model mirror so that it does not correspond to any bound element:
```
var myModel = {
  fakeElement: {
    initialLoad: true,
    doSomethingOnLoadOnly: {
      action: function() {
      }
    }
  }
};
```
One model can contain any number of autoloadable mirrors.

The second way to use autoloader is to place a property called **autoloader** on the model. This property 
acts like a mirror:
```
var myModel = {
  autoloader: {
    doSomethingOnLoadOnly: {
      boundFields: ['field1', 'field2'],
      action: function() {
      }
    }
  }
};
```

The usage of autoloader property is deprecated because it is less flexible than creating the actual mirror.

AJAX calls
----------

There are two types of AJAX calls: first one loads XML or JSON data that is then used by Javascript to display 
some content. The second type contains the actual HTML that is directly loaded into some part of web page. If 
you are loading HTML directly, hBind can help you both to make a call and to create dynamical bindings for 
newly loaded elements.

To use AJAX capabilities of hBind, you need to declare a property called **ajaxRequests** on your model. It 
acts somewhat similar to model mirrors: it has one or more action properties, but their main method is called 
```onload()```. Besides, every action property must have a property called **targetField**. It contains the 
value of ```data-hbind``` attribute of a container element into which the response HTML will be loaded. To 
trigger the request from your model, call ```hBind.makeAjaxCall(actionPropertyName, URL)```. Here is a simple 
example:
```
<div data-hbind="ajaxContainer"></div>
<div><button data-hbind="boundButton" data-hevent="click">Click me to make request</button></div>
<script src="hbind.js"></script>
<script>
  var myModel = {
    ajaxRequests: {
      myRequest: {
        targetField: 'ajaxContainer',
        onload: function() {
        }
      }
    },
    boundButton: {
      loadAjax: {
        action: function() {
          hBind.makeAjaxCall('myRequest', 'http://someURL.com');
        }
      }
    }
  };
  hBind.init();
  hBind.use(myModel);
</script>
```
Note that if you just need to load some static content, your ```onload()``` method can be empty. In fact, it is 
just an event handler for the native XmlHttpRequest load event. 

Also note that you cannot use other methods than *GET* for the request.

AJAX property action can have three optional properties:
- ```loadingMessage```: simple HTML string to be shown while the request is loading
- ```errorMessage```: simple HTML string to be shown if the response code is different from 200
- ```headers```: hash of name-value pairs of request headers. ```Content-type: text/html``` is set by default 
  but can be overridden

AJAX Response
-------------

If you need to bind some elements located inside the AJAX response, you can do so using the same syntax as 
for usual bindings. However, you would want to place mirrors for newly bound elements on a new model, and do 
```hBind.use()``` on that model. For this, you need an additional ```<script>``` tag inside your response, and 
that will not parse as Javascript by default.

To parse a script tag inside an AJAX response, you can use one more attribute called **data-hscript**. The 
value of this attribute can be arbitrary. Since the code will be eval'd, it is recommended to place the 
contents into an anonymous function:
```
<script data-hscript="myScript">
  (function () {
    var myAjaxModel = {
    };
    hBind.init();
    hBind.use(myAjaxModel);
  })();
</script>
```

It should be noted that your second ```init()``` call will create fields for all bound properties on the main
page content as well, not only on the newly loaded content. Therefore, main content fields will be reachable 
from the new model. However, the reverse is not true, so you cannot reference newly added fields from your 
main model.

To do
=====

1. Allow installation through Bower.
2. Test embedded Javascript in AJAX responses.
3. Allow proper testing of both autoloader methods in a single suite.
