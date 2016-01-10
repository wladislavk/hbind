/*jshint -W061 */
eval(require('fs').readFileSync('./hbind.js', 'utf8'));
var mocks = require('./dom_mocks');
for (var key in mocks) {
    if (mocks.hasOwnProperty(key)) {
        global[key] = mocks[key];
    }
}
eval(require('fs').readFileSync('./test/model.js', 'utf8'));
var assert = require('assert');
/*jshint -W117 */
suite('Basic', function() {
    setup(function() {
        this.div = new Element('div', {
            'hbind': 'boundDiv'
        }, {
            'innerHTML': 'some text'
        });
        this.button = new Element('button', {
            'hbind': 'boundButton',
            'hevent': 'click'
        });
        this.button2 = new Element('button', {
            'hbind': 'boundButton2',
            'hevent': 'click'
        });
        this.selector = new Element('select', {
            'hbind': 'boundSelect'
        });
        this.checkboxGroup1 = new Element('checkbox', {
            'hgroup': 'checkboxGroup',
            'hindex': '1',
            'hevent': 'click'
        }, {
            'value': '1'
        });
        this.checkboxGroup2 = new Element('checkbox', {
            'hgroup': 'checkboxGroup',
            'hindex': '2',
            'hevent': 'click'
        }, {
            'value': '2'
        });
        this.autoloadedDiv = new Element('div', {
            'hbind': 'autoloadedDiv'
        }, {
            'innerHTML': 'this text will never be seen'
        });
        this.autoloadedDiv2 = new Element('div', {
            'hbind': 'autoloadedDiv2'
        }, {
            'innerHTML': 'this text will never be seen'
        });
        this.ajaxTargetDiv = new Element('div', {
            'hbind': 'ajaxTargetDiv'
        }, {
            'innerHTML': 'this text will be overwritten'
        });
        this.ajaxButton = new Element('button', {
            'hbind': 'ajaxButton',
            'hevent': 'click'
        });
        this.ajaxScriptTag = new Element('script', {
            'hscript': 'myScript'
        }, {
            'innerHTML': 'var testVar = 1;'
        });
        hBind.init();
        hBind.use(testModel);
        window.load();
    });
    test('fields init', function() {
        assert.equal(hBind.fields.boundDiv.tagName, 'div');
        assert.equal(hBind.fields.boundButton.dataset.hevent, 'click');
    });
    test('event added', function() {
        assert.equal(hBind.fields.boundDiv.innerHTML, 'some text');
        hBind.fields.boundButton.listeners.click();
        assert.equal(hBind.fields.boundDiv.innerHTML, 'changed text');
        hBind.fields.boundSelect.listeners.change();
        assert.equal(hBind.fields.boundDiv.innerHTML, 'changed by selector');
    });
    test('group binding', function() {
        hBind.groupFields.checkboxGroup[1].listeners.click();
        assert.equal(hBind.fields.boundDiv.innerHTML, 'checkbox 1 pressed');
        hBind.groupFields.checkboxGroup[2].listeners.click();
        assert.equal(hBind.fields.boundDiv.innerHTML, 'checkbox 2 pressed');
    });
    test('autoloader property', function () {
        assert.equal(hBind.fields.autoloadedDiv.innerHTML, 'autoloaded text');
    });
    //TODO: enable autoloading when both autoloader and initialLoad are turned on
    /*test('autoload through initially loaded', function () {
        assert.equal(hBind.fields.autoloadedDiv2.innerHTML, 'autoloaded as well');
    });*/
    test('ajax request', function () {
        ajaxVars.setResponse({
            'status': 200,
            'text': 'text loaded through AJAX'
        });
        hBind.fields.ajaxButton.listeners.click();
        assert.equal(hBind.fields.ajaxTargetDiv.innerHTML, 'text loaded through AJAX');
        assert.equal(hBind.fields.boundDiv.innerHTML, 'this text was changed as well');
        //TODO: enable testing for script loaded through AJAX
        //assert.equal(testVar, 1);
    });
    test('ajax request with error', function () {
        ajaxVars.setResponse({
            'status': 400,
            'text': 'text loaded through AJAX'
        });
        hBind.fields.ajaxButton.listeners.click();
        assert.equal(hBind.fields.ajaxTargetDiv.innerHTML, 'this request generated an error');
    });
});
