/**
* Author: Volodymyr Korniyko
* File: customSwitch.js
* Date: 1 Jan 2019
*/

var CustomSwitch = function CustomSwitch(){
	var element = Reflect.construct(HTMLElement, [], CustomSwitch);
	this.initialize(element);
	return element;
}

CustomSwitch.prototype = Object.create(HTMLElement.prototype);
CustomSwitch.prototype.constructor = CustomSwitch;

Object.defineProperty(CustomSwitch, 'observedAttributes', {
	get: function(){
		return ["checked"];
	}
});

CustomSwitch.prototype.initialize = function(element){
	this.createShadowRoot(element);

	element.onTemplateSlotChangedEventHandler = this.onTemplateSlotChangedEventHandler.bind(element);
	element.onStyleSlotChangedEventHandler = this.onStyleSlotChangedEventHandler.bind(element);
	element.onSwitchClickEventHandler = this.onSwitchClickEventHandler.bind(element);
	
	Object.defineProperty(element, "checked", {
		get: function(){
			return this._checked;
		},
		set: function(value){
			this.setAttribute("checked", value);
		}
	});

	element._checked = "";
	element._isElementsInitialized = false;

	element.templateSlotElement = element.shadowRoot.querySelector('slot[name=template]');
	element.styleSlotElement = element.shadowRoot.querySelector('slot[name=style]');
	element.templateSlotElement.addEventListener('slotchange', element.onTemplateSlotChangedEventHandler);
	element.styleSlotElement.addEventListener('slotchange', element.onStyleSlotChangedEventHandler);
};

CustomSwitch.prototype.initializeElements = function(element){
	element.switchElement = element.shadowRoot.querySelector('.switch');
	element.tumblerElement = element.shadowRoot.querySelector('.tumbler');
	
	element._isElementsInitialized = true;
};

CustomSwitch.prototype.createShadowRoot = function(element){
	var shadow = element.attachShadow({ mode: 'open' });
	shadow.appendChild(this.createTemplateSlot(element));
	shadow.appendChild(this.createStyleSlot(element));
	return shadow;
};

CustomSwitch.prototype.createStyleSlot = function(element){
	var slot = document.createElement('slot');
	slot.name = "style";
	slot.innerHTML = `
		<style>
			:host{
				--border-color: #ccc;
				--background-color: #ccc;
				--background-color-switched: #77b55a;
				--thumbler-background-color: #fff;
			}

			.switch {
				position: relative;
				display: inline-block;
				width: 40px;
				height: 20px;
				background-color: var(--background-color);
				border-radius: 20px;
				transition: all 0.15s;
				cursor: pointer;
				border: 1px solid var(--border-color);
			}
			
			.tumbler{
				position: absolute;
				width: 18px;
				height: 18px;
				border-radius: 18px;
				background-color: var(--thumbler-background-color);
				top: 1px;
				left: 1px;
				transition: all 0.15s;
			}
			
			.tumblerChecked {
				left: 21px;
			}
			
			.switchChecked {
				background-color: var(--background-color-switched);
			}
		</style>
	`;

	return slot;
};

CustomSwitch.prototype.createTemplateSlot = function(element){
	var slot = document.createElement('slot');
	slot.name = "template";
	slot.innerHTML = `
		<div class="switchHolder">
			<div class="switch">
				<div class="tumbler"></div>
			</div>
		</div>
	`;

	return slot;
};

CustomSwitch.prototype.attributeChangedCallback = function(name, oldValue, newValue){
	if(oldValue === newValue)
		return;
	
	switch(name){
		case "checked":
		this.updateChecked(this._checked, JSON.parse(newValue));
		break;
	}
};

CustomSwitch.prototype.parseAttribute = function(name){
	return JSON.parse(this.getAttribute(name));
};

CustomSwitch.prototype.updateChecked = function(oldValue, newValue){
	this._checked = newValue;
	this.updateRendering();
};

CustomSwitch.prototype.subscribe = function(){
	if(!this._isElementsInitialized)
		return;

	this.switchElement.addEventListener('click', this.onSwitchClickEventHandler);
};

CustomSwitch.prototype.unSubscribe = function(){
	if(!this._isElementsInitialized)
		return;

	this.switchElement.removeEventListener('click', this.onSwitchClickEventHandler);
};

CustomSwitch.prototype.updateRendering = function(){
	if(!this._isElementsInitialized)
		return;

	var switchElement = this.switchElement;
	var tumblerElement = this.tumblerElement;

	if(this._checked === true){
		tumblerElement.classList.add("tumblerChecked");
		switchElement.classList.add("switchChecked");
	}
	else {
		tumblerElement.classList.remove("tumblerChecked");
		switchElement.classList.remove("switchChecked");
	}
};

CustomSwitch.prototype.onSwitchClickEventHandler = function(){
	var event = new Event("click");

	this.updateChecked(this._checked, !this._checked);
	this.updateRendering();
	this.dispatchEvent(event);
};

CustomSwitch.prototype.removeChildren = function(from){
	while(from.firstChild)
		from.removeChild(from.firstChild);
};

CustomSwitch.prototype.moveChildren = function(from, to){
	var child;

	while(from.firstChild){
		child = from.firstChild;
		from.removeChild(child);
		to.appendChild(child);
	}
};

CustomSwitch.prototype.onStyleSlotChangedEventHandler = function(eventArgs){
	var style = this.querySelector('[slot=style]');

	if(!style)
		return;

	this.removeChildren(this.styleSlotElement);
	this.removeChild(style);
	this.styleSlotElement.appendChild(style);
};

CustomSwitch.prototype.onTemplateSlotChangedEventHandler = function(eventArgs){
	var template = this.querySelector('[slot=template]');

	if(!template)
		return;

	this.unSubscribe();
	this.removeChildren(this.templateSlotElement);
	this.removeChild(template);
	this.templateSlotElement.appendChild(template);
	this.initializeElements(this);
	this.subscribe();

	this.updateChecked(null, this.parseAttribute('checked'));
};

CustomSwitch.prototype.connectedCallback = function(){
	this.unSubscribe();
	this.initializeElements(this);
	this.subscribe();

	this.updateChecked(null, this.parseAttribute('checked'));
};

CustomSwitch.prototype.disconnectedCallback = function(){
	this.unSubscribe();
	this._isElementsInitialized = false;
};

CustomSwitch = window.customElements.define("custom-switch", CustomSwitch);