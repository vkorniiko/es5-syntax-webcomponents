/**
* Author: Volodymyr Korniyko
* File: CustomBadge.js
* Date: 3 Jan 2019
*/

var CustomBadge = function CustomBadge(){
	var element = Reflect.construct(HTMLElement, [], CustomBadge);
	this.initialize(element);
	return element;
}

CustomBadge.prototype = Object.create(HTMLElement.prototype);
CustomBadge.prototype.constructor = CustomBadge;

Object.defineProperty(CustomBadge, 'observedAttributes', {
	get: function(){
		return ["count", "value"];
	}
});

CustomBadge.prototype.initialize = function(element){
	this.createShadowRoot(element);

	element.onTemplateSlotChangedEventHandler = this.onTemplateSlotChangedEventHandler.bind(element);
	element.onStyleSlotChangedEventHandler = this.onStyleSlotChangedEventHandler.bind(element);

	Object.defineProperty(element, "count", {
		get: function(){
			return element._count;
		},
		set: function(value){
			element.setAttribute("count", value);
		}
	});

	Object.defineProperty(element, "value", {
		get: function(){
			return element._value;
		},
		set: function(value){
			element.setAttribute("value", value);
		}
	});

	element._value = "";
	element._count = 0;
	element._isElementsInitialized = false;

	element.templateSlotElement = element.shadowRoot.querySelector('slot[name=template]');
	element.styleSlotElement = element.shadowRoot.querySelector('slot[name=style]');
	element.templateSlotElement.addEventListener('slotchange', element.onTemplateSlotChangedEventHandler);
	element.styleSlotElement.addEventListener('slotchange', element.onStyleSlotChangedEventHandler);
};

CustomBadge.prototype.initializeElements = function(element){
	element.valueElement = element.shadowRoot.querySelector('.value');
	element.counterElement = element.shadowRoot.querySelector('.counter');

	element._isElementsInitialized = true;
};

CustomBadge.prototype.createShadowRoot = function(element){
	var shadow = element.attachShadow({ mode: 'open' });
	shadow.appendChild(this.createTemplateSlot(element));
	shadow.appendChild(this.createStyleSlot(element));
	return shadow;
};

CustomBadge.prototype.createStyleSlot = function(element){
	var slot = document.createElement('slot');
	slot.name = "style";
	slot.innerHTML = `
		<style>
		:host {
			font-family: inherit;
			border-radius: 3px;
			display: block;
			margin: 5px;

			background-color: #000;
			--color: #fff;
			--counter-color: #fff;
			--background-counter-color: #f00;
			--background-counter-border-color: #fff;
		}

		.badgeHolder{
			position: relative;
			display: grid;
			width: 100%;
			height: 100%;
			text-align: center;
			align-content: center;
		}

		.value {
			color: var(--color);
			padding: 3px 8px;
			font-weight: normal;
			font-size: 12px;
		}

		.counter{
			position: absolute;
			top: -10px;
			right: -10px;
			color: var(--counter-color);
			font-size: 12px;
			font-weight: normal;
			border-radius: 20px;
			background-color: var(--background-counter-color);
			border: 2px solid var(--background-counter-border-color);
			text-align: center;
			align-content: center;
			display: grid;
			padding: 2px;
			min-width: 15px;
			min-height: 10px;
			box-shadow: 0 1px 1px 1px rgba(0,0,0,0.3);
		}

		.invisible {
			opacity: 0;
		}

		.bump {
			animation: bump 0.15s ease-in-out 0s 1;
		}

		@keyframes bump {
			50% {
				top: -12px;
				right: -12px;
				padding: 4px;
				font-size: 14px;
			}
		}
		</style>
	`;

	return slot;
};

CustomBadge.prototype.createTemplateSlot = function(element){
	var slot = document.createElement('slot');
	slot.name = "template";
	slot.innerHTML = `
		<div class="badgeHolder">
			<div class="value"></div>
			<div class="counter"></div>
		</div>
	`;

	return slot;
};

CustomBadge.prototype.attributeChangedCallback = function(name, oldValue, newValue){
	if(oldValue === newValue)
		return;
	
	switch(name){
		case "value":
			this.updateValue(this._value, newValue);
			break;
		case "count":
			this.updateCounter(this._count, JSON.parse(newValue));
			break;
	}
};

CustomBadge.prototype.parseAttribute = function(name){
	return JSON.parse(this.getAttribute(name));
};

CustomBadge.prototype.updateValue = function(oldValue, newValue){
	this._value = newValue;
	this.updateRendering();
};

CustomBadge.prototype.updateCounter = function(oldValue, newValue){
	if(newValue < 0)
		return;

	this._count = newValue;
	this.updateRendering();
};

CustomBadge.prototype.updateRendering = function(){
	if(!this._isElementsInitialized)
		return;

	var counterElement = this.counterElement;
	var valueElement = this.valueElement;
	var counterValue = this._count  > 99 ? '...' : this._count;

	counterElement.textContent = counterValue;
	
	valueElement.textContent = this._value;

	if(this._count <= 0)
		counterElement.classList.add("invisible");
	else {
		counterElement.classList.remove("invisible");
		counterElement.classList.remove("bump");
		void counterElement.offsetWidth;
		counterElement.classList.add("bump");
	}
};

CustomBadge.prototype.removeChildren = function(from){
	while(from.firstChild)
		from.removeChild(from.firstChild);
};

CustomBadge.prototype.moveChildren = function(from, to){
	var child;

	while(from.firstChild){
		child = from.firstChild;
		from.removeChild(child);
		to.appendChild(child);
	}
};

CustomBadge.prototype.onStyleSlotChangedEventHandler = function(eventArgs){
	var style = this.querySelector('[slot=style]');

	if(!style)
		return;

	this.removeChildren(this.styleSlotElement);
	this.removeChild(style);
	this.styleSlotElement.appendChild(style);
};

CustomBadge.prototype.onTemplateSlotChangedEventHandler = function(eventArgs){
	var template = this.querySelector('[slot=template]');

	if(!template)
		return;

	this.removeChildren(this.templateSlotElement);
	this.removeChild(template);
	this.templateSlotElement.appendChild(template);
	this.initializeElements(this);

	this.updateCounter(null, this.parseAttribute('count') || 0);
	this.updateValue(null, this.getAttribute('value') || "");
};

CustomBadge.prototype.connectedCallback = function(){
	this.initializeElements(this);

	this.updateCounter(null, this.parseAttribute('count') || 0);
	this.updateValue(null, this.getAttribute('value') || "");
};

CustomBadge.prototype.disconnectedCallback = function(){
	this._isElementsInitialized = false;
};

CustomBadge = window.customElements.define("custom-badge", CustomBadge);