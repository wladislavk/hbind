/*jshint -W117 */
var testModel = {
    autoloader: {
        autoloadText: {
            action: function() {
                hBind.fields.autoloadedDiv.innerHTML = 'autoloaded text';
            }
        }
    },
    ajaxRequests: {
        myRequest: {
            targetField: 'ajaxTargetDiv',
            errorMessage: 'this request generated an error',
            onload: function() {
                hBind.fields.boundDiv.innerHTML = 'this text was changed as well';
            }
        }
    },
    boundButton: {
        changeText: {
            boundFields: ['boundDiv'],
            action: function() {
                hBind.fields.boundDiv.innerHTML = 'changed text';
            }
        },
        willNeverFire: {
            boundFields: ['mockField'],
            action: function() {
                hBind.fields.boundDiv.innerHTML = 'mock text';
            }
        }
    },
    boundButton2: {
        //initialLoad: true,
        changeText: {
            action: function() {
                hBind.fields.autoloadedDiv2.innerHTML = 'autoloaded as well';
            }
        }
    },
    boundSelect: {
        changeText: {
            boundFields: ['boundDiv'],
            action: function() {
                hBind.fields.boundDiv.innerHTML = 'changed by selector';
            }
        }
    },
    checkboxGroup: {
        changeText: {
            action: function() {
                hBind.fields.boundDiv.innerHTML = 'checkbox ' + hBind.currentElement.value + ' pressed';
            }
        }
    },
    ajaxButton: {
        sendRequest: {
            action: function() {
                hBind.makeAjaxCall('myRequest', 'http://someurl.com');
            }
        }
    }
};
