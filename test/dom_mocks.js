/*jshint -W079 */
var document = {
    elements: [],
    querySelectorAll: function(selector) {
        var pureSelector = selector.replace(/\[(.*?)]/, '$1');
        pureSelector = pureSelector.replace(/data\-/, '');
        var foundSelectors = [];
        for (var i = 0; i < document.elements.length; i++) {
            var currentElement = document.elements[i];
            if (currentElement.dataset.hasOwnProperty(pureSelector) && currentElement.dataset[pureSelector] !== '') {
                foundSelectors.push(currentElement);
            }
        }
        return foundSelectors;
    }
};

var window = {
    listeners: {},
    addEventListener: function(event, callback) {
        this.listeners[event] = callback;
    },
    load: function() {
        if (this.listeners.hasOwnProperty('load')) {
            this.listeners.load();
        }
    }
};

function Element(tagName, dataset, attributes) {
    this.listeners = {};
    this.dataset = {
        hbind: '',
        hgroup: '',
        hindex: '',
        hevent: '',
        hscript: ''
    };
    this.innerHTML = '';
    this.value = '';
    this.addEventListener = function(event, callback) {
        this.listeners[event] = callback;
    };
    this.querySelectorAll = function(selector) {
        var pureSelector = selector.replace(/\[(.*?)]/, '$1');
        pureSelector = pureSelector.replace(/data\-/, '');
        var foundSelectors = [];
        if (this.dataset.hasOwnProperty(pureSelector) && this.dataset[pureSelector] !== '') {
            foundSelectors.push(this);
        }
        return foundSelectors;
    };
    this.tagName = tagName;
    if (dataset) {
        for (var currentKey in dataset) {
            if (dataset.hasOwnProperty(currentKey)) {
                this.dataset[currentKey] = dataset[currentKey];
            }
        }
    }
    if (attributes) {
        if (attributes.hasOwnProperty('innerHTML')) {
            this.innerHTML = attributes.innerHTML;
        }
        if (attributes.hasOwnProperty('value')) {
            this.value = attributes.value;
        }
    }
    document.elements.push(this);
}

var ajaxVars = {
    response: {},
    setResponse: function(response) {
        this.response = response;
    }
};

function XMLHttpRequest() {
    this.status = 0;
    this.headers = {};
    this.responseText = '';
    this.plannedResponse = ajaxVars.response;
    this.open = function(method, url) {
        // this method should be empty
    };
    this.setRequestHeader = function(name, value) {
        this.headers[name] = value;
    };
    this.send = function() {
        this.responseText = this.plannedResponse.text;
        this.status = this.plannedResponse.status;
        this.onload();
    };
}

module.exports = {
    window: window,
    document: document,
    Element: Element,
    mock: 'hello',
    ajaxVars: ajaxVars,
    XMLHttpRequest: XMLHttpRequest
};
