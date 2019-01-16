/**
* Author: Volodymyr Korniyko
* File: customButton.js
* Date: 5 Jan 2019
*/

/**
* Author: Volodymyr Korniyko
* File: customButton.js
* Date: 5 Jan 2019
*/

var CustomButton = function CustomButton(){
	var element = Reflect.construct(HTMLElement, [], CustomButton);
	this.initialize(element);
	return element;
}

CustomButton.prototype = Object.create(HTMLElement.prototype);
CustomButton.prototype.constructor = CustomButton;

Object.defineProperty(CustomButton, 'observedAttributes', {
	get: function(){
		return ["value", "disabled"];
	}
});

CustomButton.prototype.initialize = function(element){
	this.createShadowRoot(element);

	element.onTemplateSlotChangedEventHandler = this.onTemplateSlotChangedEventHandler.bind(element);
	element.onStyleSlotChangedEventHandler = this.onStyleSlotChangedEventHandler.bind(element);
	element.onButtonClickEventHandler = this.onButtonClickEventHandler.bind(element);
	
	Object.defineProperty(element, "value", {
		get: function(){
			return this._value;
		},
		set: function(value){
			this.setAttribute("value", value);
		}
	});

	Object.defineProperty(element, "disabled", {
		get: function(){
			return this._disabled;
		},
		set: function(value){
			this.setAttribute("disabled", value);
		}
	});

	element._value = "";
	element._disabled = false;
	element._isElementsInitialized = false;

	element.templateSlotElement = element.shadowRoot.querySelector('slot[name=template]');
	element.styleSlotElement = element.shadowRoot.querySelector('slot[name=style]');
	element.templateSlotElement.addEventListener('slotchange', element.onTemplateSlotChangedEventHandler);
	element.styleSlotElement.addEventListener('slotchange', element.onStyleSlotChangedEventHandler);
};

CustomButton.prototype.initializeElements = function(element){
	element.valueElement = element.shadowRoot.querySelector('.value');
	element.buttonElement = element.shadowRoot.querySelector('.button');
	element.overlayElement = element.shadowRoot.querySelector('.overlay');

	element._isElementsInitialized = true;
};

CustomButton.prototype.createShadowRoot = function(element){
	var shadow = element.attachShadow({ mode: 'open' });
	shadow.appendChild(this.createTemplateSlot(element));
	shadow.appendChild(this.createStyleSlot(element));
	return shadow;
};

CustomButton.prototype.createStyleSlot = function(element){
	var slot = document.createElement('slot');
	slot.name = "style";
	slot.innerHTML = `
	<style>
	:host {
		font-family: inherit;
		margin: 2px;
		vertical-align:middle;
		border: 1px solid transparent;
		display: block;
		outline: none;
		--background-color: #f5772a;
		--border-color: #e16523;
		--hover-color: #e16523;
	}
	
	.buttonHolder{
		display: grid;
		width: 100%;
		height: 100%;
		text-align: center;
		align-content: center;
		position: relative;
	}
	
	.button{
		width: 100%;
		height: 100%;
		display: grid;
		text-align: center;
		align-content: center;
		cursor: pointer;
		color: #fff;
		background-color: var(--background-color);
		font-weight: normal;
		user-select: none;
		border: 1px solid var(--border-color);
		position: absolute;
		top:-1px;
		left:-1px;
		border-radius: 3px;
	}
	
	.button:hover{
		background-color: var(--hover-color);
	}

	.button:active{
		transform: translate(1px, 1px);
	}

	.overlay{
		width: 100%;
		height: 100%;
		display: grid;
		text-align: center;
		align-content: center;
		cursor: pointer;
		position: absolute;
		background-image: repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.5) 0px, rgba(255, 255, 255, 0.5) 6.95px, rgba(0, 0, 0, 0) 6.95px, rgba(0, 0, 0, 0) 13.9px);
		animation: move 3s infinite linear;
		cursor: not-allowed;
		top:-1px;
		left:-1px;
		border: 1px solid var(--border-color);
		border-radius: 3px;
	}

	.value{

	}

	.invisible{
		display:none;
	}

	@keyframes move {
		0%{
			background-position: 0px;
		}
		100%{
			background-position: 40px;
		}
	}

	</style>
	`;

	return slot;
};

CustomButton.prototype.createTemplateSlot = function(element){
	var slot = document.createElement('slot');
	slot.name = "template";
	slot.innerHTML = `
		<div class="buttonHolder">
			<div class="button">
				<span class="value"></span>
			</div>
			<div class="overlay invisible"></div>
		</div>
	`;

	return slot;
};

CustomButton.prototype.attributeChangedCallback = function(name, oldValue, newValue){
	if(oldValue === newValue)
		return;
	
	switch(name){
		case "value":
			this.updateValue(oldValue, newValue);
		break;
		case "disabled":
			this.updateDisabled(oldValue, newValue);
		break;
	}
};

CustomButton.prototype.updateValue = function(oldValue, newValue){
	this._value = newValue;
	this.updateRendering();
};

CustomButton.prototype.updateDisabled = function(oldValue, newValue){
	this._disabled = JSON.parse(newValue);
	this.updateRendering();
};

CustomButton.prototype.updateRendering = function(){
	if(!this._isElementsInitialized)
		return;

	this.valueElement.textContent = this._value;

	if(this._disabled)
		this.overlayElement.classList.remove("invisible");
	else
		this.overlayElement.classList.add("invisible");
};

CustomButton.prototype.subscribe = function(){
	if(!this._isElementsInitialized)
		return;

	this.buttonElement.addEventListener('click', this.onButtonClickEventHandler);
};

CustomButton.prototype.unSubscribe = function(){
	if(!this._isElementsInitialized)
		return;

	this.buttonElement.removeEventListener('click', this.onButtonClickEventHandler);
};

CustomButton.prototype.onButtonClickEventHandler = function(e){
	e.preventDefault(true);
	e.cancelBubble = true;
	var clickEvent = new Event("click");
	this.dispatchEvent(clickEvent);
};

CustomButton.prototype.parseAttribute = function(name){
	return JSON.parse(this.getAttribute(name));
};

CustomButton.prototype.removeChildren = function(from){
	while(from.firstChild)
		from.removeChild(from.firstChild);
};

CustomButton.prototype.onStyleSlotChangedEventHandler = function(eventArgs){
	var style = this.querySelector('[slot=style]');

	if(!style)
		return;

	this.removeChildren(this.styleSlotElement);
	this.removeChild(style);
	this.styleSlotElement.appendChild(style);
};

CustomButton.prototype.onTemplateSlotChangedEventHandler = function(eventArgs){
	var template = this.querySelector('[slot=template]');

	if(!template)
		return;

	this.unSubscribe();
	this.removeChildren(this.templateSlotElement);
	this.removeChild(template);
	this.templateSlotElement.appendChild(template);
	this.initializeElements(this);
	this.subscribe();

	this.updateValue(null, this.getAttribute('value'));
	this.updateDisabled(null, this.getAttribute('disabled'));
};

CustomButton.prototype.connectedCallback = function(){
	this.unSubscribe();
	this.initializeElements(this);
	this.subscribe();

	this.updateValue(null, this.getAttribute('value'));
	this.updateDisabled(null, this.getAttribute('disabled'));
};

CustomButton.prototype.disconnectedCallback = function(){
	this.unSubscribe();
	this._isElementsInitialized = false;
};

CustomButton = window.customElements.define("custom-button", CustomButton);