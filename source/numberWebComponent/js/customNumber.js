"use strict";

var CustomNumber = function CustomNumber(){
  var element = Reflect.construct(HTMLElement, [], CustomNumber);
  this.initialize(element);
  return element;
};

CustomNumber.prototype = Object.create(HTMLElement.prototype);
CustomNumber.prototype.constructor = CustomNumber;

Object.defineProperty(CustomNumber, "observedAttributes", {
  get: function(){
    return ["value", "step", "placeholder", "min", "max"];
  }
});

CustomNumber.prototype.bindHandlers = function(element){
  element.onTemplateSlotChangedEventHandler = 
    this.onTemplateSlotChangedEventHandler.bind(element);
  element.onStyleSlotChangedEventHandler = 
    this.onStyleSlotChangedEventHandler.bind(element);

  element.onAddMouseDownEventHandler = 
    this.onAddMouseDownEventHandler.bind(element);
  element.onSubtractMouseDownEventHandler = 
    this.onSubtractMouseDownEventHandler.bind(element);
  element.clearIntervals = this.clearIntervals.bind(element);

  element.onAddClickEventHandler = this.onAddClickEventHandler.bind(element);
  element.onSubtractClickEventHandler = 
    this.onSubtractClickEventHandler.bind(element);
  element.onValueChangeEventHandler = 
    this.onValueChangeEventHandler.bind(element);
};

CustomNumber.prototype.defineProperties = function(element){
  Object.defineProperty(element, "value", {
    get: function(){
      return this._value;
    },
    set: function(value){
      this.setAttribute("value", value);
    }
  });

  Object.defineProperty(element, "min", {
    get: function(){
      return this._min;
    },
    set: function(value){
      this.setAttribute("min", value);
    }
  });

  Object.defineProperty(element, "max", {
    get: function(){
      return this._max;
    },
    set: function(value){
      this.setAttribute("max", value);
    }
  });

  Object.defineProperty(element, "step", {
    get: function(){
      return this._step;
    },
    set: function(value){
      this.setAttribute("step", value);
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
};

CustomNumber.prototype.initEvents = function(element){
  element.templateSlotElement = 
    element.shadowRoot.querySelector("slot[name=template]");
  element.styleSlotElement = 
    element.shadowRoot.querySelector("slot[name=style]");
  element.templateSlotElement.addEventListener(
    "slotchange", element.onTemplateSlotChangedEventHandler);
  element.styleSlotElement.addEventListener(
    "slotchange", element.onStyleSlotChangedEventHandler);
};

CustomNumber.prototype.initialize = function(element){
  this.createShadowRoot(element);
  this.bindHandlers(element);
  this.defineProperties(element);
  this.initEvents(element);

  element._value = null;
  element._min = 0;
  element._max = 10;
  element._step = 1;
  element._placeholder = "";
  element._isElementsInitialized = false;
  element._addIntervalId = null;
  element._subtractIntervalId = null;

  this.initEvents(element);
};

CustomNumber.prototype.initializeElements = function(element){
  element.valueElement = element.shadowRoot.querySelector(".value");
  element.addButtonElement = element.shadowRoot.querySelector(".addButton");
  element.subtractButtonElement = 
    element.shadowRoot.querySelector(".subtractButton");

  element._isElementsInitialized = true;
};

CustomNumber.prototype.createShadowRoot = function(element){
  var shadow = element.attachShadow({ mode: "open" });
  shadow.appendChild(this.createTemplateSlot(element));
  shadow.appendChild(this.createStyleSlot(element));
  return shadow;
};

CustomNumber.prototype.createStyleSlot = function(element){
  var slot = document.createElement("slot");
  slot.name = "style";
  slot.innerHTML = `
  <style>
  :host {
    font-family: inherit;
    margin: 2px;
    display: block;
    width: 150px;
    font-size: 12px;
    border: 1px solid #ccc;
    outline: none;
    text-align: center;
    align-content: center;
    background-color: var(--background-color);
    position: relative;
  
    --background-color: #f0f5ff;
    --background-focus-color: #fff;
    --border-color: #ccc;
    --button-color: #000;
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
    background-color: transparent;
    border: 0;
    padding: 0;
    margin: 0;
    outline: none;
    text-align: center;
    vertical-align: middle;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }
  
  .valueHolder:focus-within {
    background-color: var(--background-focus-color);
  }
  
  td {
    padding: 0;
  }
  
  button {
    padding: 0;
    margin: 0;
    position: absolute;
    cursor: pointer;
    border: 0;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    outline: none;
    width: 100%;
    height: 100%;
    font-weight: bold;
    text-align: center;
    align-content: center;
    color: var(--button-color);
    background-color: var(--background-focus-color);
  }
  
  button:active {
    background-color: var(--border-color);
  }
  
  .addButtonHolder {
    width: 27px;
    position: relative;
  }
  
  .addButton {
    border-left: 1px solid var(--border-color);
  }
  
  .subtractButtonHolder {
    width: 27px;
    position: relative;
  }
  
  .subtractButton {
    border-right: 1px solid var(--border-color);
  }
  </style>
  `;

  return slot;
};

CustomNumber.prototype.createTemplateSlot = function(element){
  var slot = document.createElement("slot");
  slot.name = "template";
  slot.innerHTML = `
<table class="textHolder">
  <tbody>
    <tr>
      <td class="subtractButtonHolder">
        <button class="subtractButton">-</button>
      </td>
      <td class="valueHolder">
        <input type="text" class="value"/>
      </td>
      <td class="addButtonHolder">
        <button class="addButton">+</button>
      </td>
    </tr>
  </tbody>
</table>
  `;

  return slot;
};

CustomNumber.prototype.attributeChangedCallback = 
function(name, oldValue, newValue){
  if(oldValue === newValue)
    return;
  
  switch(name){
    case "value":
      this.updateValue(oldValue, newValue);
      break;
    case "min":
      this.updateMin(oldValue, newValue);
      break;
    case "max":
      this.updateMax(oldValue, newValue);
      break;
    case "step":
      this.updateStep(oldValue, newValue);
      break;
    case "placeholder":
      this.updatePlaceholder(oldValue, newValue);
      break;
  }
};

CustomNumber.prototype.updateValue = function(oldValue, newValue){
  this._value = newValue == "" || newValue == null ?
    null : parseFloat(newValue);

  this.updateRendering();
};

CustomNumber.prototype.updateMin = function(oldValue, newValue){
  const defaultMin = 0;
  this._min = newValue == null ? defaultMin : parseFloat(newValue);
};

CustomNumber.prototype.updateMax = function(oldValue, newValue){
  const defaultMax = 10;
  this._max = newValue == null ? defaultMax : parseFloat(newValue);
};

CustomNumber.prototype.updateStep = function(oldValue, newValue){
  const defaultStep = 1;
  this._step = newValue == null ? defaultStep : parseFloat(newValue);
};

CustomNumber.prototype.updatePlaceholder = function(oldValue, newValue){
  this._placeholder = newValue == null ? "" : newValue;
  this.updateRendering();
};

CustomNumber.prototype.updateRendering = function(){
  if(!this._isElementsInitialized)
    return;

  this.valueElement.placeholder = this._placeholder;
  this.valueElement.value = this._value;
};

CustomNumber.prototype.subscribe = function(){
  if(!this._isElementsInitialized)
    return;

  this.addButtonElement.addEventListener(
    "mousedown", this.onAddMouseDownEventHandler);
  this.subtractButtonElement.addEventListener(
    "mousedown", this.onSubtractMouseDownEventHandler);
  this.addButtonElement.addEventListener("mouseup", this.clearIntervals);
  this.addButtonElement.addEventListener("mouseout", this.clearIntervals);
  this.subtractButtonElement.addEventListener("mouseup", this.clearIntervals);
  this.subtractButtonElement.addEventListener("mouseout", this.clearIntervals);

  this.valueElement.addEventListener("change", this.onValueChangeEventHandler);
};

CustomNumber.prototype.unSubscribe = function(){
  if(!this._isElementsInitialized)
    return;

  this.addButtonElement.removeEventListener(
    "mousedown", this.onAddMouseDownEventHandler);
  this.subtractButtonElement.removeEventListener(
    "mousedown", this.onSubtractMouseDownEventHandler);
  this.addButtonElement.removeEventListener("mouseup", this.clearIntervals);
  this.addButtonElement.removeEventListener("mouseout", this.clearIntervals);
  this.subtractButtonElement.removeEventListener(
    "mouseup", this.clearIntervals);
  this.subtractButtonElement.removeEventListener(
    "mouseout", this.clearIntervals);

  this.valueElement.removeEventListener(
    "change", this.onValueChangeEventHandler);
};

CustomNumber.prototype.onValueChangeEventHandler = function(){
  var newValue = parseFloat(this.valueElement.value);

  if(isNaN(newValue)){
    newValue = "";
    this.valueElement.value = "";
  } else if(newValue > this._max)
    newValue = this._max;
  else if(newValue < this._min)
    newValue = this._min;

  if(this._value === newValue)
    return;

  this.value = newValue;

  var changeEvent = new Event("change");
  this.dispatchEvent(changeEvent);
};

CustomNumber.prototype.onAddMouseDownEventHandler = function(){
  this.onAddClickEventHandler();
  const updateInterval = 250;
  this._addIntervalId = window.setInterval(
    this.onAddClickEventHandler, updateInterval);
};

CustomNumber.prototype.onSubtractMouseDownEventHandler = function(){
  this.onSubtractClickEventHandler();
  const updateInterval = 250;
  this._subtractIntervalId = 
    window.setInterval(this.onSubtractClickEventHandler, updateInterval);
};

CustomNumber.prototype.clearIntervals = function(){
  window.clearInterval(this._addIntervalId);
  window.clearInterval(this._subtractIntervalId);
};

CustomNumber.prototype.onAddClickEventHandler = function(){
  var newValue = this._value + this._step; 

  if(newValue > this._max)
    newValue = this._max;
  else if(newValue < this._min)
    newValue = this._min;

  if(this._value === newValue || isNaN(newValue))
    return;

  this.value = newValue;

  var changeEvent = new Event("change");
  this.dispatchEvent(changeEvent);
};

CustomNumber.prototype.onSubtractClickEventHandler = function(){
  var newValue = this._value - this._step; 

  if(newValue > this._max)
    newValue = this._max;
  else if(newValue < this._min)
    newValue = this._min;

  if(this._value === newValue || isNaN(newValue))
    return;

  this.value = newValue;

  var changeEvent = new Event("change");
  this.dispatchEvent(changeEvent);
};

CustomNumber.prototype.parseAttribute = function(name){
  return JSON.parse(this.getAttribute(name));
};

CustomNumber.prototype.removeChildren = function(from){
  while(from.firstChild)
    from.removeChild(from.firstChild);
};

CustomNumber.prototype.onStyleSlotChangedEventHandler = function(eventArgs){
  var style = this.querySelector("[slot=style]");

  if(!style)
    return;

  this.removeChildren(this.styleSlotElement);
  this.removeChild(style);
  this.styleSlotElement.appendChild(style);
};

CustomNumber.prototype.onTemplateSlotChangedEventHandler = function(eventArgs){
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
  this.updateStep(null, this.getAttribute("step"));
  this.updateMin(null, this.getAttribute("min"));
  this.updateMax(null, this.getAttribute("max"));
  this.updatePlaceholder(null, this.getAttribute("placeholder"));
};

CustomNumber.prototype.connectedCallback = function(){
  this.unSubscribe();
  this.initializeElements(this);
  this.subscribe();

  this.updateValue(null, this.getAttribute("value"));
  this.updateStep(null, this.getAttribute("step"));
  this.updateMin(null, this.getAttribute("min"));
  this.updateMax(null, this.getAttribute("max"));
  this.updatePlaceholder(null, this.getAttribute("placeholder"));
};

CustomNumber.prototype.disconnectedCallback = function(){
  this.unSubscribe();
  this._isElementsInitialized = false;
};

window.customElements.define("custom-number", CustomNumber);
