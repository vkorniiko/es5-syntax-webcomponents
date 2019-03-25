"use strict";

var CustomSelect = function CustomSelect(){
  var element = Reflect.construct(HTMLElement, [], CustomSelect);
  this.initialize(element);
  return element;
};

CustomSelect.prototype = Object.create(HTMLElement.prototype);
CustomSelect.prototype.constructor = CustomSelect;

Object.defineProperty(CustomSelect, "observedAttributes", {
  get: function(){
    return ["options", "value"];
  }
});

CustomSelect.prototype.bindHandlers = function(element){
  element.onItemsSlotChangedEventHandler = 
    this.onItemsSlotChangedEventHandler.bind(element);
  element.onTemplateSlotChangedEventHandler = 
    this.onTemplateSlotChangedEventHandler.bind(element);
  element.onStyleSlotChangedEventHandler = 
    this.onStyleSlotChangedEventHandler.bind(element);
  element.onDropdownClickEventHandler = 
    this.onDropdownClickEventHandler.bind(element);
  element.onDropdownFocusOutEventHandler = 
    this.onDropdownFocusOutEventHandler.bind(element);
  element.onOptionsClickEventHandler = 
    this.onOptionsClickEventHandler.bind(element);
  element.onOptionsMutatedEventHandler = 
    this.onOptionsMutatedEventHandler.bind(element);
};

CustomSelect.prototype.defineProperties = function(element){
  Object.defineProperty(element, "options", {
    get: function(){
      return this._options;
    },
    set: function(value){
      this.setAttribute("options", value);
    }
  });
  
  Object.defineProperty(element, "value", {
    get: function(){
      return this._value;
    },
    set: function(value){
      this.setAttribute("value", value);
    }
  });
};

CustomSelect.prototype.initEvents = function(element){
  element.itemsSlotElement.addEventListener(
    "slotchange", element.onItemsSlotChangedEventHandler);
  element.templateSlotElement.addEventListener(
    "slotchange", element.onTemplateSlotChangedEventHandler);
  element.styleSlotElement.addEventListener(
    "slotchange", element.onStyleSlotChangedEventHandler);
};

CustomSelect.prototype.initialize = function(element){
  this.createShadowRoot(element);
  this.bindHandlers(element);
  this.defineProperties(element);

  element._options = [];
  element._value = "";
  element._opened = false;
  element._isElementsInitialized = false;
  element._observer = 
    new MutationObserver(element.onOptionsMutatedEventHandler);
  
  element.itemsSlotElement = 
    element.shadowRoot.querySelector("slot[name=items]");
  element.templateSlotElement = 
    element.shadowRoot.querySelector("slot[name=template]");
  element.styleSlotElement = 
    element.shadowRoot.querySelector("slot[name=style]");

  this.initEvents(element);
};

CustomSelect.prototype.initializeElements = function(element){
  element.valueElement = element.shadowRoot.querySelector(".value");
  element.optionsElement = element.shadowRoot.querySelector(".options");
  element.dropdownElement = element.shadowRoot.querySelector(".dropdown");
  element.selectButtonElement = 
    element.shadowRoot.querySelector(".selectButton");

  element._isElementsInitialized = true;
};

CustomSelect.prototype.createShadowRoot = function(element){
  var shadow = element.attachShadow({ mode: "open" });
  shadow.appendChild(this.createStyleSlot(element));
  shadow.appendChild(this.createItemsSlot(element));
  shadow.appendChild(this.createTemplateSlot(element));
  return shadow;
};

CustomSelect.prototype.createStyleSlot = function(element){
  var slot = document.createElement("slot");
  slot.name = "style";
  slot.innerHTML = `
    <style>
    :host {
      font: inherit;
      margin: 2px;
    
      --select-button-color: #000;
      --background-color: #fff;
      --background-alternate-color: #f0f5ff;
      --background-color-focus: #fff;
      --hover-color: #fda;
      --border-color: #ccc;
      --background-color-active: #aee;
    }
    
    .dropdown {
      outline: 0;
      width: 100%;
      height: 100%;
      display: grid;
      text-align: left;
      align-content: center;
      position: relative;
      cursor: pointer;
      border: 1px solid var(--border-color);
      background-color: var(--background-color);
    }
    
    .dropdown:focus {
      background-color: var(--background-color-focus);
    }
    
    .select {
      padding: 5px;
    }
    
    .visible {
      max-height: 150px;
      box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.3);
      opacity: 1;
    }
    
    .invisible {
      max-height: 0;
      box-shadow: none;
      opacity: 0;
    }
    
    .options {
      border-width: 0 1px 1px 1px;
      border-color: var(--border-color);
      border-style: solid;
      position: absolute;
      width: 100%;
      left: 0;
      top: 100%;
      margin: 1px 0 0 -1px;
      overflow: hidden;
      overflow-y: auto;
      z-index: 1000;
      padding: 0;
      list-style: none;
      background-color: var(--background-color);
      transition: all 0.3s;
    }
    
    .options li {
      padding: 5px;
    }
    
    .options li:nth-child(even) {
      background-color: var(--background-alternate-color);
    }
    
    .options li:hover {
      background-color: var(--hover-color);
    }
    
    .options li:active {
      background-color: var(--background-color-active);
    }
    
    .flip {
      transform: rotateZ(180deg);
    }
    
    .selectButton {
      transform-origin: 50% 25%;
      top: 50%;
      right: 0;
      transform: translate(-2.5px, -2.5px);
      position: absolute;
      border-width: 5px;
      border-color:
        var(--select-button-color)
        transparent
        transparent
        transparent;
      border-style: solid;
      vertical-align: middle;
      transition: all 0.15s;
    }
    </style>
  `;

  return slot;
};

CustomSelect.prototype.createItemsSlot = function(element){
  var slot = document.createElement("slot");
  slot.name = "items";
  slot.style.display = "none";
  slot.innerHTML = "";
  return slot;
};

CustomSelect.prototype.createTemplateSlot = function(element){
  var slot = document.createElement("slot");
  slot.name = "template";
  slot.innerHTML = `
    <div class="dropdown">
      <div class="select">
        <span class="value"></span>
        <div class="selectButton"></div>
      </div>
      <ul class="options invisible"></ul>
    </div>
  `;

  return slot;
};

CustomSelect.prototype.attributeChangedCallback = 
function(name, oldValue, newValue){
  switch(name){
    case "value":
      this.updateValue(oldValue, newValue);
      break;
    case "options":
      this.updateOptions(oldValue, newValue);
      this.updateValue(this._value, this._value);
      break;
  }
};

CustomSelect.prototype.updateValueRendering = function(){
  if(!this._isElementsInitialized)
    return;

  this._value === undefined ? 
    this.valueElement.innerHTML = "&nbsp;" : 
    this.valueElement.textContent = this._value;
};

CustomSelect.prototype.updateOptionsRendering = function(){
  if(!this._isElementsInitialized)
    return;

  var ulOptionsElement = this.optionsElement;

  this.removeChildren(ulOptionsElement);

  this._options.forEach(function(option){
    var liElement = document.createElement("li");
    liElement.textContent = option;
    ulOptionsElement.appendChild(liElement);
  });
};

CustomSelect.prototype.updateValue = function(oldValue, newValue){
  var options = this._options;

  if(!options.includes(newValue))
    this._value = undefined;
  else
    this._value = newValue;

  this.updateValueRendering();

  var changeEvent = new Event("change");
  this.dispatchEvent(changeEvent);
};

CustomSelect.prototype.updateOptions = function(oldValue, newValue){
  if(newValue == null)
    return;

  this._options = newValue.split(",");

  this.updateOptionsRendering();
};

CustomSelect.prototype.subscribe = function(){
  if(!this._isElementsInitialized)
    return;

  var dropdownElement = this.dropdownElement;
  var optionsElement = this.optionsElement;

  dropdownElement.addEventListener("click", this.onDropdownClickEventHandler);
  dropdownElement.addEventListener(
    "focusout", this.onDropdownFocusOutEventHandler);
  optionsElement.addEventListener("click", this.onOptionsClickEventHandler);
};

CustomSelect.prototype.unSubscribe = function(){
  if(!this._isElementsInitialized)
    return;

  var dropdownElement = this.dropdownElement;
  var optionsElement = this.optionsElement;

  dropdownElement.removeEventListener(
    "click", this.onDropdownClickEventHandler);
  dropdownElement.removeEventListener(
    "focusout", this.onDropdownFocusOutEventHandler);
  optionsElement.removeEventListener("click", this.onOptionsClickEventHandler);
};

CustomSelect.prototype.onDropdownClickEventHandler = function(){
  var dropdownElement = this.dropdownElement;
  var optionsElement = this.optionsElement;
  var selectButtonElement = this.selectButtonElement;

  dropdownElement.setAttribute("tabindex", 1);
  dropdownElement.focus();

  this._opened = !this._opened;

  if(this._opened === true){
    optionsElement.classList.remove("invisible");
    optionsElement.classList.add("visible");
    selectButtonElement.classList.add("flip");
  }
  else {
    optionsElement.classList.add("invisible");
    optionsElement.classList.remove("visible");
    selectButtonElement.classList.remove("flip");
  }
};

CustomSelect.prototype.removeChildren = function(from){
  while(from.firstChild)
    from.removeChild(from.firstChild);
};

CustomSelect.prototype.moveChildren = function(from, to){
  var child;

  while(from.firstChild){
    child = from.firstChild;
    from.removeChild(child);
    to.appendChild(child);
  }
};

CustomSelect.prototype.onOptionsMutatedEventHandler = function(mutations){
  this.syncOptions();
};

CustomSelect.prototype.syncOptions = function(){
  var liElements = this.optionsElement.querySelectorAll("li");

  this._options = [].map.call(liElements, function(element){
    return element.textContent;
  });
};

CustomSelect.prototype.onOptionsClickEventHandler = function(eventArgs){
  var value = eventArgs.target.textContent;
  this.setAttribute("value", value);
};

CustomSelect.prototype.onDropdownFocusOutEventHandler = function(){
  var optionsElement = this.optionsElement;
  var selectButtonElement = this.selectButtonElement;

  optionsElement.classList.remove("visible");
  optionsElement.classList.add("invisible");
  selectButtonElement.classList.remove("flip");
  this._opened = false;
};

CustomSelect.prototype.onStyleSlotChangedEventHandler = function(eventArgs){
  var style = this.querySelector("[slot=style]");

  if(!style)
    return;

  this.removeChildren(this.styleSlotElement);
  this.removeChild(style);
  this.styleSlotElement.appendChild(style);
};

CustomSelect.prototype.onItemsSlotChangedEventHandler = function(eventArgs){
  var items = this.querySelectorAll("[slot=items]");
  var optionsElement = this.optionsElement;
  var self = this;

  if(items.length === 0)
    return;

  items.forEach(function(item){
    self.removeChild(item);
    optionsElement.appendChild(item);
  });
};

CustomSelect.prototype.onTemplateSlotChangedEventHandler = function(eventArgs){
  var template = this.querySelector("[slot=template]");

  if(!template)
    return;

  this.unSubscribe();
  this.removeChildren(this.templateSlotElement);
  this.removeChild(template);
  this.templateSlotElement.appendChild(template);
  this.initializeElements(this);
  this.subscribe();

  this.syncOptions();
  this.updateValue(null, this.getAttribute("value"));

  this._observer.disconnect();
  this._observer.observe(this.optionsElement, {
    childList: true
  });
};

CustomSelect.prototype.connectedCallback = function(){
  this.unSubscribe();
  this.initializeElements(this);
  this.subscribe();

  this.updateOptions(null, this.getAttribute("options"));
  this.updateValue(null, this.getAttribute("value"));

  this._observer.disconnect();
  this._observer.observe(this.optionsElement, {
    childList: true
  });
};

CustomSelect.prototype.disconnectedCallback = function(){
  this.unSubscribe();
  this._observer.disconnect();
  this._isElementsInitialized = false;
};

window.customElements.define("custom-select", CustomSelect);
