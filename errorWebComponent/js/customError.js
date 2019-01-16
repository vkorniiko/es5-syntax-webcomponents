/**
* Author: Volodymyr Korniyko
* File: customError.js
* Date: 9 Jan 2019
*/

var CustomError = function CustomError(){
	var element = Reflect.construct(HTMLElement, [], CustomError);
	this.initialize(element);
	return element;
}

CustomError.prototype = Object.create(HTMLElement.prototype);
CustomError.prototype.constructor = CustomError;

Object.defineProperty(CustomError, 'observedAttributes', {
	get: function(){
		return ["value", "enabled", "target", "errorclass"];
	}
});

CustomError.prototype.initialize = function(element){
	this.createShadowRoot(element);

	element.onTemplateSlotChangedEventHandler = this.onTemplateSlotChangedEventHandler.bind(element);
	element.onStyleSlotChangedEventHandler = this.onStyleSlotChangedEventHandler.bind(element);
	element.onDisableEventHandler = this.onDisableEventHandler.bind(element);
	element.subscribe = this.subscribe.bind(element);
	
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

	Object.defineProperty(element, "target", {
		get: function(){
			return this._target;
		},
		set: function(value){
			this.setAttribute("target", value);
		}
	});

	Object.defineProperty(element, "errorClass", {
		get: function(){
			return this._errorClass;
		},
		set: function(value){
			this.setAttribute("errorclass", value);
		}
	});

	element._value = "";
	element._enabled = false;
	element._target = "";
	element._errorClass = "";
	element._isElementsInitialized = false;

	element.templateSlotElement = element.shadowRoot.querySelector('slot[name=template]');
	element.styleSlotElement = element.shadowRoot.querySelector('slot[name=style]');
	element.templateSlotElement.addEventListener('slotchange', element.onTemplateSlotChangedEventHandler);
	element.styleSlotElement.addEventListener('slotchange', element.onStyleSlotChangedEventHandler);
};

CustomError.prototype.initializeElements = function(element){
	element.valueElement = element.shadowRoot.querySelector('.value');
	element.errorHolderElement = element.shadowRoot.querySelector('.errorHolder');

	element._isElementsInitialized = true;
};

CustomError.prototype.createShadowRoot = function(element){
	var shadow = element.attachShadow({ mode: 'open' });
	shadow.appendChild(this.createTemplateSlot(element));
	shadow.appendChild(this.createStyleSlot(element));
	return shadow;
};

CustomError.prototype.createStyleSlot = function(element){
	var slot = document.createElement('slot');
	slot.name = "style";
	slot.innerHTML = `
	<style>
	:host{
		font-family: inherit;
		top:-100px;
		left: -100px;
		font-weight: bold;
		font-size: 12px;
		position: fixed;
		width: auto;
		--color: #555;
		--background-color: #ffcc00;
		z-index:99999;
		user-select: none;
	}

	.errorHolder{
		opacity: 0;
		outline: 0;
		position: relative;
	}
	
	.valueHolder{
		background-color: var(--background-color);
		margin-top: 10px;
		display: grid;
		text-align: center;
		border-radius: 3px;
		box-shadow: 0px 1px 3px 0px rgba(0,0,0,0.3);
		align-content: center;
	}

	.arrowShadow {
		left: 50%;
		transform: translate(-10px, -20px);
		border-width: 10px;
		position: absolute;
		width: 0px;
		border-color: transparent transparent rgba(0,0,0,0.3) transparent;
		border-style: solid;
		z-index: 0;
	}

	.arrow {
		left: 50%;
		transform: translate(-10px, -19px);
		border-width: 10px;
		position: absolute;
		width: 0px;
		border-color: transparent transparent var(--background-color) transparent;
		border-style: solid;
		z-index: 1;
	}
	
	.value {
		color: var(--color);
		padding: 5px 10px;
	}

	.visible {
		animation: visible 0.3s linear 0.3s 1 normal forwards;
	}

	@keyframes visible {
		0%{ 
			opacity: 0; 
		}
		100%{ 
			opacity: 1; 
		}
	}
	</style>
	`;

	return slot;
};

CustomError.prototype.createTemplateSlot = function(element){
	var slot = document.createElement('slot');
	slot.name = "template";
	slot.innerHTML = `
	<div class="errorHolder">
		<div class="arrow"></div>
		<div class="arrowShadow"></div>
		<div class="valueHolder">
			<span class="value"></span>
		</div>
	</div>
	`;

	return slot;
};

CustomError.prototype.attributeChangedCallback = function(name, oldValue, newValue){
	if(oldValue === newValue)
		return;
	
	switch(name){
		case "value":
			this.updateValue(oldValue, newValue);
		break;
		case "enabled":
			this.updateEnabled(oldValue, newValue);
		break;
		case "target":
			this.updateTarget(oldValue, newValue);
		break;
		case "target":
			this.updateErrorClass(oldValue, newValue);
		break;
	}
};

CustomError.prototype.updateValue = function(oldValue, newValue){
	this._value = newValue;
	this.updateRendering();
};

CustomError.prototype.updateEnabled = function(oldValue, newValue){
	this._enabled = JSON.parse(newValue);
	this.updateRendering();
};

CustomError.prototype.updateTarget = function(oldValue, newValue){
	this._target = newValue;
	this.updateRendering();
};

CustomError.prototype.updateErrorClass = function(oldValue, newValue){
	this._errorClass = newValue;
	this.updateRendering();
};

CustomError.prototype.updateRendering = function(){
	if(!this._isElementsInitialized)
		return;

	var targetElement, targetRect;

	if(this._target != "")
		targetElement = document.querySelector(`[data-error=${this._target}]`);
	
	if(targetElement == null)
		return;

	var ecx, left, top;
	var errorHolderElement = this.errorHolderElement;
	this.valueElement.textContent = this._value;

	if(this._enabled){
		this.unSubscribe();
		targetElement.setAttribute('tabindex', 1);
		targetElement.focus();

		targetRect = targetElement.getBoundingClientRect();
		ecx = targetRect.x + targetRect.width / 2;
		left = ecx - errorHolderElement.offsetWidth / 2;
		top = targetRect.y + targetRect.height;

		this.style.top = top + "px";
		this.style.left = left + "px";

		targetElement.classList.add(this._errorClass);

		this.errorHolderElement.classList.add("visible");
		
		this.errorHolderElement.setAttribute('tabindex', 2);
		this.errorHolderElement.focus();

		setTimeout(this.subscribe, 10);
	}
	else {
		this.style.top = -100 + "px";
		this.style.left = -100 + "px";
		this.errorHolderElement.classList.remove("visible");
		targetElement.classList.remove(this._errorClass);
	}
};

CustomError.prototype.parseAttribute = function(name){
	return JSON.parse(this.getAttribute(name));
};

CustomError.prototype.removeChildren = function(from){
	while(from.firstChild)
		from.removeChild(from.firstChild);
};

CustomError.prototype.onStyleSlotChangedEventHandler = function(eventArgs){
	var style = this.querySelector('[slot=style]');

	if(!style)
		return;

	this.removeChildren(this.styleSlotElement);
	this.removeChild(style);
	this.styleSlotElement.appendChild(style);
};

CustomError.prototype.onDisableEventHandler = function(){
	this.enabled = false;
};

CustomError.prototype.subscribe = function(eventArgs){
	if(!this._isElementsInitialized)
		return;

	window.addEventListener('scroll', this.onDisableEventHandler);
	window.addEventListener('resize', this.onDisableEventHandler);
	this.addEventListener('focusout', this.onDisableEventHandler);
	this.addEventListener('click', this.onDisableEventHandler);
};

CustomError.prototype.unSubscribe = function(eventArgs){
	if(!this._isElementsInitialized)
		return;

	window.removeEventListener('resize', this.onDisableEventHandler);
	window.removeEventListener('scroll', this.onDisableEventHandler);
	this.removeEventListener('focusout', this.onDisableEventHandler);
	this.removeEventListener('click', this.onDisableEventHandler);
};

CustomError.prototype.onTemplateSlotChangedEventHandler = function(eventArgs){
	var template = this.querySelector('[slot=template]');

	if(!template)
		return;

	this.unSubscribe();
	this.removeChildren(this.templateSlotElement);
	this.removeChild(template);
	this.templateSlotElement.appendChild(template);
	this.initializeElements(this);
	this.subscribe();
	
	this.updateTarget(null, this.getAttribute('target'));
	this.updateValue(null, this.getAttribute('value'));
	this.updateEnabled(null, this.getAttribute('enabled'));
	this.updateErrorClass(null, this.getAttribute('errorclass'));
};

CustomError.prototype.connectedCallback = function(){
	this.initializeElements(this);

	this.unSubscribe();
	this.updateTarget(null, this.getAttribute('target'));
	this.updateValue(null, this.getAttribute('value'));
	this.updateEnabled(null, this.getAttribute('enabled'));
	this.updateErrorClass(null, this.getAttribute('errorclass'));
	this.subscribe();
};

CustomError.prototype.disconnectedCallback = function(){
	this.unSubscribe();
	this._isElementsInitialized = false;
};

CustomError = window.customElements.define("custom-error", CustomError);