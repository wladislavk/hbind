var hBind;
hBind = {
    /**
     * Hash of DOM objects, composed in the following manner. If data-hbind attribute is present on an
     * element, its value is the key of the hash, and the element itself is the value. If data-hgroup is
     * present, its value is the key of the hash, and the value contains an array with all the group's
     * elements
     * @var {Object} fields
     */
    fields: {},
    /**
     * Hash of DOM objects, composed in the following manner. If data-hgroup attribute is present on one or
     * more elements, its value is the key of the hash, and the value contains a hash whose keys are the
     * values of data-hindex attributes, and values are the corresponding DOM elements
     * @var {Object} groupFields
     */
    groupFields: {},
    /**
     * Array of DOM objects, composed in the following manner. If data-hbind attribute is present on an
     * element, the element is contained in this array. The sequence of elements depends on
     * document.querySelectorAll() and therefore unreliable
     * @var {Array} numberedFields
     */
    numberedFields: [],
    /**
     * Array of DOM objects, composed in the following manner. If data-hgroup attribute is present on an
     * element, the element is contained in this array, regardless of its group index. The sequence of elements
     * is arbitrary, elements are not actually grouped, therefore this field is not recommended for public
     * usage
     * @var {Array} numberedGroupFields
     */
    numberedGroupFields: [],
    /**
     * Collection of values set manually via setStaticField(). These values are passed from the server to be
     * used at a later point in model or functions. There is no restriction to what the values might be
     * @var {Object} staticFields
     */
    staticFields: {},
    /**
     * Hash of hashes, set in a model under the ajaxRequests key. Hash keys are arbitrary and can be used for
     * AJAX calls in the model. Each value is a hash that might have the following keys:
     * targetField:    key of the hBind.fields hash, corresponding to the container element where the AJAX
     *                 response will be loaded into. This key is mandatory
     * loadingMessage: simple HTML string with the message that will be shown during the loading process
     * errorMessage:   simple HTML string with the message that will be shown if the response has any other
     *                 header except 200
     * headers:        hash of name - value pairs of AJAX headers. Content-Type: text/html is the only header
     *                 set by default
     * This hash is considered private and should not be touched directly from the script
     * @var {Object} ajaxFields
     */
    ajaxFields: {},
    /**
     * The DOM element that was the caller of the event that fired an action. Should be referred from the model
     * only. In case of group elements this object contains the current caller only, not the whole group
     * @var {Object} currentElement
     */
    currentElement: {},
    /**
     * If the DOM element that called the current event belongs to a group, this hash contains all elements
     * of this group. For structure, refer to hBind.fields on grouped elements
     * @var {Object} currentGroup
     */
    currentGroup: {},
    /**
     * Can be used to determine if the current action was run as a part of autoloading sequence
     * @var {boolean} initiallyLoaded
     */
    initiallyLoaded: false,
    /**
     * The first method to be called. Sets all field values. Called outside of the model
     * @function public init()
     */
    init: function () {
        hBind.setFields();
        hBind.setGroupFields();
    },
    /**
     * Forms the fields and numberedFields hashes, except for grouped elements
     * @function private setFields()
     */
    setFields: function () {
        hBind.numberedFields = document.querySelectorAll('[data-hbind]');
        for (var i = 0; i < hBind.numberedFields.length; i++) {
            var boundElement = hBind.numberedFields[i];
            hBind.fields[boundElement.dataset.hbind] = boundElement;
        }
    },
    /**
     * Forms the groupFields and numberedGroupFields hashes. Also adds grouped elements to fields hash
     * @function private setGroupFields()
     */
    setGroupFields: function () {
        hBind.numberedGroupFields = document.querySelectorAll('[data-hgroup]');
        for (var i = 0; i < hBind.numberedGroupFields.length; i++) {
            var boundElement = hBind.numberedGroupFields[i];
            var groupName = boundElement.dataset.hgroup;
            if (typeof hBind.fields[groupName] === 'undefined') {
                hBind.fields[groupName] = [];
                hBind.groupFields[groupName] = {};
            }
            hBind.fields[groupName].push(boundElement);
            var boundElementIndex = boundElement.dataset.hindex;
            if (boundElementIndex) {
                hBind.groupFields[groupName][boundElementIndex] = boundElement;
            }
        }
    },
    /**
     * Called outside of the model after init() and before or after use(). Sets staticFields hash element
     * @function public setStaticField()
     * @param {string} fieldName
     * @param {string} fieldValue
     */
    setStaticField: function (fieldName, fieldValue) {
        hBind.staticFields[fieldName] = fieldValue;
    },
    /**
     * Called outside of the model after init(). Sets the current model object to be used, registers AJAX calls
     * and runs autoloading function of the model
     * @function public use()
     * @param {Object} model
     */
    use: function (model) {
        if (model.hasOwnProperty('ajaxRequests')) {
            hBind.registerAjaxCalls(model);
        }
        if (model.hasOwnProperty('autoloader')) {
            hBind.runAutoloader(model);
        }
        hBind.bindElements(model);
    },
    /**
     * Binds autoloader to load event
     * @function private runAutoloader()
     * @param {Object} model
     */
    runAutoloader: function (model) {
        window.dataset = {};
        hBind.runElementFunctions(window, model.autoloader, 'load');
    },
    /**
     * Populates ajaxFields hash based on model's ajaxRequests property
     * @function private registerAjaxCalls()
     * @param {Object} model
     */
    registerAjaxCalls: function (model) {
        var properties = Object.keys(model.ajaxRequests);
        for (var i = 0; i < properties.length; i++) {
            var ajaxRequest = model.ajaxRequests[properties[i]];
            if (typeof ajaxRequest === 'object' && ajaxRequest.hasOwnProperty('targetField')) {
                hBind.ajaxFields[properties[i]] = ajaxRequest;
            }
        }
    },
    /**
     * Assigns all elements with data-hbind or data-hgroup attributes to their listeners, if there are model
     * actions associated with them
     * @function private bindElements()
     * @param {Object} model
     */
    bindElements: function (model) {
        var bindNames = Object.keys(hBind.fields);
        for (var i = 0; i < bindNames.length; i++) {
            var bindName = bindNames[i];
            if (typeof model[bindName] !== 'object') {
                continue;
            }
            if (Array.isArray(hBind.fields[bindName])) {
                var boundGroup = hBind.fields[bindName];
                for (var j = 0; j < boundGroup.length; j++) {
                    hBind.runElementFunctions(boundGroup[j], model[bindName], '');
                }
                continue;
            }
            var boundElement = hBind.fields[bindName];
            hBind.runElementFunctions(boundElement, model[bindName], '');
        }
    },
    /**
     * Binds a method on the model to the event specified in HTML attributes or in forcedEventName
     * @function private runElementFunctions()
     * DOM object representing an element with data-hbind or data-hgroup attribute and a corresponding model
     * action
     * @param {Object} boundElement
     * Hash containing all model actions and properties associated with the bound element
     * @param {Object} modelMirror
     * Optional argument. Overrides either default onChange or an event set in data-hevent attribute of the
     * bound element
     * @param {string} forcedEventName
     */
    runElementFunctions: function (boundElement, modelMirror, forcedEventName) {
        var properties = Object.keys(modelMirror);
        for (var i = 0; i < properties.length; i++) {
            var currentPropertyName = properties[i];
            var currentProperty = modelMirror[currentPropertyName];
            if (!hBind.isValidMethod(currentProperty)) {
                continue;
            }
            if (!hBind.checkBoundFields(currentProperty)) {
                continue;
            }
            var eventName = hBind.setEventName(boundElement, forcedEventName);
            hBind.setEvent(currentProperty, boundElement, eventName, false);
            if (modelMirror.initialLoad === true) {
                hBind.setEvent(currentProperty, boundElement, 'load', true);
            }
        }
    },
    /**
     * Sets the actual event name to which the model listens
     * @function private setEventName()
     * See runElementFunctions()
     * @param boundElement
     * See runElementFunctions()
     * @param forcedEventName
     * The event name without leading 'on'
     * @returns {string}
     */
    setEventName: function (boundElement, forcedEventName) {
        if (forcedEventName) {
            return forcedEventName;
        }
        if (boundElement.dataset.hevent) {
            return boundElement.dataset.hevent;
        }
        return 'change';
    },
    /**
     * This function does the actual binding. It registers the listener of the event specified in eventName to
     * the bound element (or to window object), and adds the model method to that listener
     * @function private setEvent()
     * A property of the model mirror that contains the action() method to be fired on [eventName] event
     * @param {Object} property
     * DOM element that owns the event
     * @param {Object} element
     * Name returned by setEventName()
     * @param {string} eventName
     * True for load event, false otherwise. For load event, the owner element should be window, not the bound
     * element
     * @param {boolean} setToWindow
     */
    setEvent: function (property, element, eventName, setToWindow) {
        var eventowner = element;
        if (setToWindow === true) {
            eventowner = window;
        }
        eventowner.addEventListener(eventName, (function (property, element) {
            return function (event) {
                if (this === window && event.type === 'load') {
                    hBind.initiallyLoaded = true;
                }
                hBind.currentElement = element;
                hBind.currentGroup = hBind.fields[element.dataset.hgroup];
                property.action(event);
                hBind.initiallyLoaded = false;
            };
        })(property, element), false);
    },
    /**
     * Checks if the property of the model mirror contains a method called action()
     * @function private isValidMethod()
     * @param {Object} property
     * @returns {boolean}
     */
    isValidMethod: function (property) {
        if (typeof property === 'object') {
            var actionProperty = property.hasOwnProperty('action');
            if (actionProperty && typeof property.action === 'function') {
                return true;
            }
        }
        return false;
    },
    /**
     * Checks if the property of the model mirror has a property called boundFields. Returns false if such
     * property exists and has type Array, but at least one of the array's elements is absent from
     * hBind.fields, true otherwise
     * @function private checkBoundFields()
     * @param {Object} property
     * @returns {boolean}
     */
    checkBoundFields: function (property) {
        var boundFields = property.boundFields;
        if (typeof boundFields === 'undefined') {
            return true;
        }
        if (boundFields.constructor === Array) {
            for (var i = 0; i < boundFields.length; i++) {
                if (!hBind.fields.hasOwnProperty(boundFields[i])) {
                    return false;
                }
            }
            return true;
        }
        return false;
    },
    /**
     * Callable from the model. Makes AJAX request according to the rules set under ajaxRequests key in
     * the model
     * @function public makeAjaxCall()
     * Should correspond to one of the keys of ajaxRequests hash in the model
     * @param {string} ajaxFieldName
     * Absolute URL for AJAX request
     * @param {string} targetUrl
     */
    makeAjaxCall: function (ajaxFieldName, targetUrl) {
        if (!hBind.ajaxFields.hasOwnProperty(ajaxFieldName)) {
            console.log('Not a valid AJAX call');
            return;
        }
        var ajaxField = hBind.ajaxFields[ajaxFieldName];
        var ajaxDataTarget = hBind.fields[ajaxField.targetField];
        if (!ajaxDataTarget) {
            console.log('Target element for AJAX call is not set');
            return;
        }
        if (ajaxField.hasOwnProperty('loadingMessage')) {
            ajaxDataTarget.innerHTML = ajaxField.loadingMessage;
        }
        var xhr = new XMLHttpRequest();
        xhr.open('GET', targetUrl);
        hBind.setAjaxHeaders(xhr, ajaxField);
        xhr.onload = function () {
            if (xhr.status == 200) {
                hBind.setAjaxOnload(xhr, ajaxField, ajaxDataTarget);
            } else {
                if (ajaxField.hasOwnProperty('errorMessage')) {
                    ajaxDataTarget.innerHTML = ajaxField.errorMessage;
                }
            }
        };
        xhr.send();
    },
    /**
     * Sets headers of AJAX requests based on headers property from the model
     * @function private setAjaxHeaders()
     * XMLHttpRequest object
     * @param {XMLHttpRequest} xhr
     * A property inside ajaxRequests key on the model
     * @param {Object} ajaxField
     */
    setAjaxHeaders: function (xhr, ajaxField) {
        xhr.setRequestHeader('Content-Type', 'text/html');
        if (ajaxField.hasOwnProperty('headers') && typeof ajaxField.headers === 'object') {
            var headerNames = Object.keys(ajaxField.headers);
            for (var i = 0; i < headerNames.length; i++) {
                xhr.setRequestHeader(headerNames[i], ajaxField.headers[headerNames[i]]);
            }
        }
    },
    /**
     * Searches for onload() methods inside AJAX properties in the model and executes them
     * @function private setAjaxOnload()
     * XMLHttpRequest object
     * @param {XMLHttpRequest} xhr
     * See setAjaxHeaders()
     * @param {Object} ajaxField
     * DOM element that acts as a container into which AJAX response will be loaded
     * @param {Object} ajaxDataTarget
     */
    setAjaxOnload: function (xhr, ajaxField, ajaxDataTarget) {
        ajaxDataTarget.innerHTML = xhr.responseText;
        hBind.evalBoundScripts(ajaxDataTarget);
        if (ajaxField.hasOwnProperty('onload')) {
            ajaxField.onload();
        }
    },
    /**
     * By default, <script> tags inside AJAX HTML response are not parsed. If there is a need to include some
     * script into the response, the tag should have data-hscript attribute, in which case it will be eval'd
     * @function private evalBoundScripts()
     * See setAjaxOnload()
     * @param {Object} ajaxDataTarget
     */
    evalBoundScripts: function (ajaxDataTarget) {
        var boundScriptTags = ajaxDataTarget.querySelectorAll('[data-hscript]');
        for (var i = 0; i < boundScriptTags.length; i++) {
            eval(boundScriptTags[i].innerHTML);
        }
    }
};
