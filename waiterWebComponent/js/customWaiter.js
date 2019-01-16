/**
* Author: Volodymyr Korniyko
* File: customWaiter.js
* Date: 6 Jan 2019
*/

var CustomWaiter = function CustomWaiter(){
	var element = Reflect.construct(HTMLElement, [], CustomWaiter);
	this.initialize(element);
	return element;
}

CustomWaiter.prototype = Object.create(HTMLElement.prototype);
CustomWaiter.prototype.constructor = CustomWaiter;

Object.defineProperty(CustomWaiter, 'observedAttributes', {
	get: function(){
		return ["value", "enabled"];
	}
});

CustomWaiter.prototype.initialize = function(element){
	this.createShadowRoot(element);

	element.onTemplateSlotChangedEventHandler = this.onTemplateSlotChangedEventHandler.bind(element);
	element.onStyleSlotChangedEventHandler = this.onStyleSlotChangedEventHandler.bind(element);
	
	Object.defineProperty(element, "value", {
		get: function(){
			return this._value;
		},
		set: function(value){
			this.setAttribute("value", value);
		}
	});

	Object.defineProperty(element, "enabled", {
		get: function(){
			return this._enabled;
		},
		set: function(value){
			this.setAttribute("enabled", value);
		}
	});

	element._value = "";
	element._enabled = false;
	element._isElementsInitialized = false;

	element.templateSlotElement = element.shadowRoot.querySelector('slot[name=template]');
	element.styleSlotElement = element.shadowRoot.querySelector('slot[name=style]');
	element.templateSlotElement.addEventListener('slotchange', element.onTemplateSlotChangedEventHandler);
	element.styleSlotElement.addEventListener('slotchange', element.onStyleSlotChangedEventHandler);
};

CustomWaiter.prototype.initializeElements = function(element){
	element.valueElement = element.shadowRoot.querySelector('.value');
	element.waiterHolderElement = element.shadowRoot.querySelector('.waiterHolder');

	element._isElementsInitialized = true;
};

CustomWaiter.prototype.createShadowRoot = function(element){
	var shadow = element.attachShadow({ mode: 'open' });
	shadow.appendChild(this.createTemplateSlot(element));
	shadow.appendChild(this.createStyleSlot(element));
	return shadow;
};

CustomWaiter.prototype.createStyleSlot = function(element){
	var slot = document.createElement('slot');
	slot.name = "style";
	slot.innerHTML = `
	<style>
	:host{
		position: absolute;
		width: inherit;
		height: inherit;
		font-family: inherit;
		font-weight: bold;
		font-size: 10px;
		--background-color: #2b333ecc;
		--color: #fff;
		--top-color: #57ee00; 
		--bottom-color: #fbff00; 
	}

	.waiterHolder {
		position: relative;
		width: 100%;
		height: 100%;
		background-color: var(--background-color);
	}

	.valueHolder{
		display: grid;
		text-align: center;
		align-content: center;
		width: 100%;
		height: 100%;
		position: absolute;
	}
	
	.value { 
		color: var(--color);
	}
	
	.wheel {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 30px;
		height: 30px;
		margin: -25px 0px 0px -25px;
		border: 10px solid;
		border-radius: 50%;
		border-top-color: var(--top-color);
		border-bottom-color: var(--bottom-color);
		border-left-color: transparent;
		border-right-color: transparent;
		animation: spin 3s infinite ease-in-out;
	}
	
	@keyframes spin {
		0%{ transform: rotate(-720deg); }
		50%{ transform: rotate(720deg); }
		100%{ transform: rotate(-720deg); }
	}
	</style>
	`;

	return slot;
};

CustomWaiter.prototype.createTemplateSlot = function(element){
	var slot = document.createElement('slot');
	slot.name = "template";
	slot.innerHTML = `
	<div class="waiterHolder">
		<div class="wheel"></div>
		<div class="valueHolder">
			<span class="value"></span>
		</div>
	</div>
	`;

	return slot;
};

CustomWaiter.prototype.attributeChangedCallback = function(name, oldValue, newValue){
	if(oldValue === newValue)
		return;
	
	switch(name){
		case "value":
			this.updateValue(oldValue, newValue);
		break;
		case "enabled":
			this.updateEnabled(oldValue, newValue);
		break;
	}
};

CustomWaiter.prototype.updateValue = function(oldValue, newValue){
	this._value = newValue;
	this.updateRendering();
};

CustomWaiter.prototype.updateEnabled = function(oldValue, newValue){
	this._enabled = JSON.parse(newValue);
	this.updateRendering();
};

CustomWaiter.prototype.updateRendering = function(){
	if(!this._isElementsInitialized)
		return;

	this.valueElement.textContent = this._value;

	if(this._enabled){
		this.style.display = "block";
	}
	else {
		this.style.display = "none";
	}
};

CustomWaiter.prototype.parseAttribute = function(name){
	return JSON.parse(this.getAttribute(name));
};

CustomWaiter.prototype.removeChildren = function(from){
	while(from.firstChild)
		from.removeChild(from.firstChild);
};

CustomWaiter.prototype.onStyleSlotChangedEventHandler = function(eventArgs){
	var style = this.querySelector('[slot=style]');

	if(!style)
		return;

	this.removeChildren(this.styleSlotElement);
	this.removeChild(style);
	this.styleSlotElement.appendChild(style);
};

CustomWaiter.prototype.onTemplateSlotChangedEventHandler = function(eventArgs){
	var template = this.querySelector('[slot=template]');

	if(!template)
		return;

	this.removeChildren(this.templateSlotElement);
	this.removeChild(template);
	this.templateSlotElement.appendChild(template);
	this.initializeElements(this);

	this.updateValue(null, this.getAttribute('value'));
	this.updateEnabled(null, this.getAttribute('enabled'));
};

CustomWaiter.prototype.connectedCallback = function(){
	this.initializeElements(this);

	this.updateValue(null, this.getAttribute('value'));
	this.updateEnabled(null, this.getAttribute('enabled'));
};

CustomWaiter.prototype.disconnectedCallback = function(){
	this._isElementsInitialized = false;
};

CustomWaiter = window.customElements.define("custom-waiter", CustomWaiter);