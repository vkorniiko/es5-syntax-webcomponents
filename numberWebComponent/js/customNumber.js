/**
* Author: Volodymyr Korniyko
* File: customNumber.js
* Date: 4 Jan 2019
*/

var CustomNumber = function CustomNumber(){
	var element = Reflect.construct(HTMLElement, [], CustomNumber);
	this.initialize(element);
	return element;
}

CustomNumber.prototype = Object.create(HTMLElement.prototype);
CustomNumber.prototype.constructor = CustomNumber;

Object.defineProperty(CustomNumber, 'observedAttributes', {
	get: function(){
		return ["value", "step", "placeholder", "min", "max"];
	}
});

CustomNumber.prototype.initialize = function(element){
	this.createShadowRoot(element);

	element.onTemplateSlotChangedEventHandler = this.onTemplateSlotChangedEventHandler.bind(element);
	element.onStyleSlotChangedEventHandler = this.onStyleSlotChangedEventHandler.bind(element);

	element.onAddMouseDownEventHandler = this.onAddMouseDownEventHandler.bind(element);
	element.onSubtractMouseDownEventHandler = this.onSubtractMouseDownEventHandler.bind(element);
	element.clearIntervals = this.clearIntervals.bind(element);

	element.onAddClickEventHandler = this.onAddClickEventHandler.bind(element);
	element.onSubtractClickEventHandler = this.onSubtractClickEventHandler.bind(element);
	element.onValueChangeEventHandler = this.onValueChangeEventHandler.bind(element);
	
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

	element._value = null;
	element._min = 0;
	element._max = 10;
	element._step = 1;
	element._placeholder = "";
	element._isElementsInitialized = false;
	element._addIntervalId = null;
	element._subtractIntervalId = null;

	element.templateSlotElement = element.shadowRoot.querySelector('slot[name=template]');
	element.styleSlotElement = element.shadowRoot.querySelector('slot[name=style]');
	element.templateSlotElement.addEventListener('slotchange', element.onTemplateSlotChangedEventHandler);
	element.styleSlotElement.addEventListener('slotchange', element.onStyleSlotChangedEventHandler);
};

CustomNumber.prototype.initializeElements = function(element){
	element.valueElement = element.shadowRoot.querySelector('.value');
	element.addButtonElement = element.shadowRoot.querySelector('.addButton');
	element.subtractButtonElement = element.shadowRoot.querySelector('.subtractButton');

	element._isElementsInitialized = true;
};

CustomNumber.prototype.createShadowRoot = function(element){
	var shadow = element.attachShadow({ mode: 'open' });
	shadow.appendChild(this.createTemplateSlot(element));
	shadow.appendChild(this.createStyleSlot(element));
	return shadow;
};

CustomNumber.prototype.createStyleSlot = function(element){
	var slot = document.createElement('slot');
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

	.textHolder{
		border-spacing:0px;
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0px;
		left: 0px;
		right: 0px;
		bottom: 0px;
	}
	
	.value {
		background-color: transparent;
		border: 0px;
		padding: 0px;
		margin: 0px;
		outline: none;
		text-align: center;
		vertical-align: middle;
		width: 100%;
		height: 100%;
		top: 0px;
		left: 0px;
	}

	td {
		padding:0px;
	}

	button {
		padding: 0px;
		margin: 0px;
		position: absolute;
		cursor: pointer;
		border: 0px;
		top: 0px;
		right: 0px;
		left: 0px;
		bottom: 0px;
		outline: none;
		width: 100%;
		height: 100%;
		font-weight: bold;
		text-align: center;
		align-content: center;
		color: var(--button-color);
		background-color: var(--background-focus-color);
	}

	button:active{
		background-color: var(--border-color);
	}

	.valueHolder:focus-within{
		background-color: var(--background-focus-color);
	}

	.addButtonHolder{
		width: 27px;
		position: relative;
	}

	.addButton {
		border-left: 1px solid var(--border-color);
	}

	.subtractButtonHolder{
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
	var slot = document.createElement('slot');
	slot.name = "template";
	slot.innerHTML = `
		<table class="textHolder">
			<tbody>
				<tr>
					<td class="subtractButtonHolder"><button class="subtractButton">-</button></td>
					<td class="valueHolder"><input type="text" class="value"/></td>
					<td class="addButtonHolder"><button class="addButton">+</button></td>
				</tr>
			</tbody>
		</table>
	`;

	return slot;
};

CustomNumber.prototype.attributeChangedCallback = function(name, oldValue, newValue){
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
	this._value = newValue == "" || newValue == null ? null : parseFloat(newValue);
	this.updateRendering();
};

CustomNumber.prototype.updateMin = function(oldValue, newValue){
	this._min = newValue == null ? 0 : parseFloat(newValue);
};

CustomNumber.prototype.updateMax = function(oldValue, newValue){
	this._max = newValue == null ? 10 : parseFloat(newValue);
};

CustomNumber.prototype.updateStep = function(oldValue, newValue){
	this._step = newValue == null ? 1 : parseFloat(newValue);
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

	this.addButtonElement.addEventListener('mousedown', this.onAddMouseDownEventHandler);
	this.subtractButtonElement.addEventListener('mousedown', this.onSubtractMouseDownEventHandler);
	this.addButtonElement.addEventListener('mouseup', this.clearIntervals);
	this.addButtonElement.addEventListener('mouseout', this.clearIntervals);
	this.subtractButtonElement.addEventListener('mouseup', this.clearIntervals);
	this.subtractButtonElement.addEventListener('mouseout', this.clearIntervals);

	this.valueElement.addEventListener('change', this.onValueChangeEventHandler);
};

CustomNumber.prototype.unSubscribe = function(){
	if(!this._isElementsInitialized)
		return;

	this.addButtonElement.removeEventListener('mousedown', this.onAddMouseDownEventHandler);
	this.subtractButtonElement.removeEventListener('mousedown', this.onSubtractMouseDownEventHandler);
	this.addButtonElement.removeEventListener('mouseup', this.clearIntervals);
	this.addButtonElement.removeEventListener('mouseout', this.clearIntervals);
	this.subtractButtonElement.removeEventListener('mouseup', this.clearIntervals);
	this.subtractButtonElement.removeEventListener('mouseout', this.clearIntervals);

	this.valueElement.removeEventListener('change', this.onValueChangeEventHandler);
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
	this._addIntervalId = window.setInterval(this.onAddClickEventHandler, 250);
};

CustomNumber.prototype.onSubtractMouseDownEventHandler = function(){
	this.onSubtractClickEventHandler();
	this._subtractIntervalId = window.setInterval(this.onSubtractClickEventHandler, 250);
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
	var style = this.querySelector('[slot=style]');

	if(!style)
		return;

	this.removeChildren(this.styleSlotElement);
	this.removeChild(style);
	this.styleSlotElement.appendChild(style);
};

CustomNumber.prototype.onTemplateSlotChangedEventHandler = function(eventArgs){
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
	this.updateStep(null, this.getAttribute('step'));
	this.updateMin(null, this.getAttribute('min'));
	this.updateMax(null, this.getAttribute('max'));
	this.updatePlaceholder(null, this.getAttribute('placeholder'));
};

CustomNumber.prototype.connectedCallback = function(){
	this.unSubscribe();
	this.initializeElements(this);
	this.subscribe();

	this.updateValue(null, this.getAttribute('value'));
	this.updateStep(null, this.getAttribute('step'));
	this.updateMin(null, this.getAttribute('min'));
	this.updateMax(null, this.getAttribute('max'));
	this.updatePlaceholder(null, this.getAttribute('placeholder'));
};

CustomNumber.prototype.disconnectedCallback = function(){
	this.unSubscribe();
	this._isElementsInitialized = false;
};

CustomNumber = window.customElements.define("custom-number", CustomNumber);