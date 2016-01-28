QUnit.test('Event added', function (assert) {
    assert.equal(document.getElementById('bound-div').innerHTML, 'Some text', 'Initial div value');
    document.getElementById('bound-button').click();
    assert.equal(document.getElementById('bound-div').innerHTML, 'changed text', 'Div value after button click');
    document.getElementById('selector').value = '2';
    var evt = document.createEvent("HTMLEvents");
    evt.initEvent("change", false, true);
    document.getElementById('selector').dispatchEvent(evt);
    assert.equal(document.getElementById('bound-div').innerHTML, 'option 2 selected', 'Div value after selector change');
});
QUnit.test('Group binding', function (assert) {
    document.getElementById('first-checkbox').click();
    assert.equal(document.getElementById('bound-div').innerHTML, 'checkbox 1 pressed', 'Div value after checkbox 1 pressed');
    document.getElementById('second-checkbox').click();
    assert.equal(document.getElementById('bound-div').innerHTML, 'checkbox 2 pressed', 'Div value after checkbox 2 pressed');
});
QUnit.test('autoloader property', function (assert) {
    assert.equal(document.getElementById('autoloaded-div').innerHTML, 'autoloaded text', 'Autoloader property fired on window.load');
});
    //TODO: enable autoloading when both autoloader and initialLoad are turned on
/*QUnit.test('autoload through initially loaded', function (assert) {
    assert.equal(hBind.fields.autoloadedDiv2.innerHTML, 'autoloaded as well', 'Autoloader through initiallyLoaded attribute');
});*/

/*
suite('Ajax', function() {
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
});*/
