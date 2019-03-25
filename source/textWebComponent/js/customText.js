"use strict";

var CustomText = function CustomText(){
  var element = Reflect.construct(HTMLElement, [], CustomText);
  this.initialize(element);
  return element;
};

CustomText.prototype = Object.create(HTMLElement.prototype);
CustomText.prototype.constructor = CustomText;

Object.defineProperty(CustomText, "observedAttributes", {
  get: function(){
    return ["value", "placeholder"];
  }
});

CustomText.prototype.initialize = function(element){
  this.createShadowRoot(element);

  element.onTemplateSlotChangedEventHandler = 
    this.onTemplateSlotChangedEventHandler.bind(element);
  element.onStyleSlotChangedEventHandler = 
    this.onStyleSlotChangedEventHandler.bind(element);
  element.onClearClickEventHandler = 
    this.onClearClickEventHandler.bind(element);
  element.onValueChangeEventHandler = 
    this.onValueChangeEventHandler.bind(element);
  element.onValueKeyUpEventHandler = 
    this.onValueKeyUpEventHandler.bind(element);

  Object.defineProperty(element, "onclear", {
    get: function(){
      return this._onclear;
    },
    set: function(value){
      this._onclear = value;
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

  Object.defineProperty(element, "placeholder", {
    get: function(){
      return this._placeholder;
    },
    set: function(value){
      this.setAttribute("placeholder", value);
    }
  });

  element._onclear = undefined;
  element._value = "";
  element._placeholder = "";
  element._isElementsInitialized = false;

  element.templateSlotElement = 
    element.shadowRoot.querySelector("slot[name=template]");
  element.styleSlotElement = 
    element.shadowRoot.querySelector("slot[name=style]");
  element.templateSlotElement.addEventListener(
    "slotchange", element.onTemplateSlotChangedEventHandler);
  element.styleSlotElement.addEventListener(
    "slotchange", element.onStyleSlotChangedEventHandler);
};

CustomText.prototype.initializeElements = function(element){
  element.valueElement = element.shadowRoot.querySelector(".value");
  element.clearButtonElement = element.shadowRoot.querySelector(".clearButton");

  element._isElementsInitialized = true;
};

CustomText.prototype.createShadowRoot = function(element){
  var shadow = element.attachShadow({ mode: "open" });
  shadow.appendChild(this.createTemplateSlot(element));
  shadow.appendChild(this.createStyleSlot(element));
  return shadow;
};

CustomText.prototype.createStyleSlot = function(element){
  var slot = document.createElement("slot");
  slot.name = "style";
  slot.innerHTML = `
  <style>
  :host {
    font: inherit;
    margin: 2px;
    border: 1px solid var(--border-color);
    background: var(--background-color);
    position: relative;
    display: block;
  
    --background-color: #f0f5ff;
    --background-button-color: #c0c5cf;
    --border-color: #ccc;
    --background-focus-color: #fff;
    --clear-button-color: #000;
    --padding: 5px;
  }
  
  td {
    padding: 0;
  }
  
  .textHolder {
    border-spacing: 0;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  
  .value {
    outline: none;
    font: inherit;
    background-color: transparent;
    border: 0;
    height: 100%;
    width: 100%;
    padding: 0;
  }
  
  .valueHolder {
    padding: var(--padding);
  }
  
  .valueHolder:focus-within {
    background-color: var(--background-focus-color);
  }
  
  .buttonHolder {
    position: relative;
    width: 25px;
  }
  
  .clearButton {
    color: var(--clear-button-color);
    font-weight: bold;
    cursor: pointer;
    width: 100%;
    height: 100%;
    border: 0;
    outline: 0;
    border-left: 1px solid var(--border-color);
    top: 0;
    position: absolute;
    right: 0;
    left: 0;
    bottom: 0;
  }
  
  .clearButton:hover {
    background-color: var(--background-button-color);
  }
  </style>
  `;

  return slot;
};

CustomText.prototype.createTemplateSlot = function(element){
  var slot = document.createElement("slot");
  slot.name = "template";
  slot.innerHTML = `
    <table class="textHolder">
      <tr>
        <td class="valueHolder">
          <input type="text" class="value"/>
        </td>
        <td class="buttonHolder">
          <button class="clearButton">x</button>
        </td>
      </tr>
    </table>
  `;

  return slot;
};

CustomText.prototype.attributeChangedCallback = 
function(name, oldValue, newValue){
  if(oldValue === newValue)
    return;
  
  switch(name){
    case "value":
      this.updateValue(oldValue, newValue);
      break;
    case "placeholder":
      this.updatePlaceholder(oldValue, newValue);
      break;
  }
};

CustomText.prototype.updateValue = function(oldValue, newValue){
  this._value = newValue == null ? "" : newValue;
  this.updateRendering();
};

CustomText.prototype.updatePlaceholder = function(oldValue, newValue){
  this._placeholder = newValue == null ? "" : newValue;
  this.updateRendering();
};

CustomText.prototype.updateRendering = function(){
  if(!this._isElementsInitialized)
    return;

  this.valueElement.placeholder = this._placeholder;
  this.valueElement.value = this._value;
};

CustomText.prototype.subscribe = function(){
  if(!this._isElementsInitialized)
    return;

  this.clearButtonElement.addEventListener(
    "click", this.onClearClickEventHandler);
  this.valueElement.addEventListener("change", this.onValueChangeEventHandler);
  this.valueElement.addEventListener("keyup", this.onValueKeyUpEventHandler);
};

CustomText.prototype.unSubscribe = function(){
  if(!this._isElementsInitialized)
    return;

  this.clearButtonElement.removeEventListener(
    "click", this.onClearClickEventHandler);
  this.valueElement.removeEventListener(
    "change", this.onValueChangeEventHandler);
  this.valueElement.removeEventListener("keyup", this.onValueKeyUpEventHandler);
};

CustomText.prototype.onValueKeyUpEventHandler = function(){
  this.value = this.valueElement.value;

  var keyupEvent = new Event("keyup");
  this.dispatchEvent(keyupEvent);
};

CustomText.prototype.onValueChangeEventHandler = function(){
  this.value = this.valueElement.value;

  var changeEvent = new Event("change");
  this.dispatchEvent(changeEvent);
};

CustomText.prototype.onClearClickEventHandler = function(){
  this.updateValue(this._value, "");

  if(this._onclear)
    this._onclear();

  var clearEvent = new Event("clear");
  this.dispatchEvent(clearEvent);
};

CustomText.prototype.removeChildren = function(from){
  while(from.firstChild)
    from.removeChild(from.firstChild);
};

CustomText.prototype.onStyleSlotChangedEventHandler = function(eventArgs){
  var style = this.querySelector("[slot=style]");

  if(!style)
    return;

  this.removeChildren(this.styleSlotElement);
  this.removeChild(style);
  this.styleSlotElement.appendChild(style);
};

CustomText.prototype.onTemplateSlotChangedEventHandler = function(eventArgs){
  var template = this.querySelector("[slot=template]");

  if(!template)
    return;

  this.unSubscribe();
  this.removeChildren(this.templateSlotElement);
  this.removeChild(template);
  this.templateSlotElement.appendChild(template);
  this.initializeElements(this);
  this.subscribe();

  this.updateValue(null, this.getAttribute("value"));
  this.updatePlaceholder(null, this.getAttribute("placeholder"));
};

CustomText.prototype.connectedCallback = function(){
  this.unSubscribe();
  this.initializeElements(this);
  this.subscribe();

  this.updateValue(null, this.getAttribute("value"));
  this.updatePlaceholder(null, this.getAttribute("placeholder"));
};

CustomText.prototype.disconnectedCallback = function(){
  this.unSubscribe();
  this._isElementsInitialized = false;
};

window.customElements.define("custom-text", CustomText);
