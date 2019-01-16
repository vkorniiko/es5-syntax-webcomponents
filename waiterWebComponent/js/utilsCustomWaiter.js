/**
* Author: Volodymyr Korniyko
* File: utilsCustomWaiter.js
* Date: 7 Jan 2019
*/

var MyComponent = inherit(HTMLElement, IInitializable, {
	_attributes: [
		nativeBaseCall(HTMLElement),
		type("test.Type")],

	_static: {
		observedAttributes: property(
			defaultValue(["value", "enabled"]))
	},

	isInitialized: property(
		validation(Boolean),
		defaultValue(false)),

	_value: property(
		defaultValue("")),

	value: property(
		get(function(){ return this._value; }),
		set(function(value){ this.setAttribute("value", value); })
	),

	_enabled: property(
		defaultValue(true)),

	enabled: property(
		get(function(){ return this._enabled; }),
		set(function(value){ this.setAttribute("enabled", value); })
	),

	_constructor: function(){
		this.createShadowRoot(this);

		this.onTemplateSlotChangedEventHandler = this.onTemplateSlotChangedEventHandler.bind(this);
		this.onStyleSlotChangedEventHandler = this.onStyleSlotChangedEventHandler.bind(this);
		
		this.templateSlotElement = this.shadowRoot.querySelector('slot[name=template]');
		this.styleSlotElement = this.shadowRoot.querySelector('slot[name=style]');
		this.templateSlotElement.addEventListener('slotchange', this.onTemplateSlotChangedEventHandler);
		this.styleSlotElement.addEventListener('slotchange', this.onStyleSlotChangedEventHandler);
	},

	initialize: method(
	argument(validation(_.nullable())),
	function(settings){
		if(this.isInitialized)
			return;

		this.valueElement = this.shadowRoot.querySelector('.value');
		this.waiterHolderElement = this.shadowRoot.querySelector('.waiterHolder');

		this.isInitialized = true;
	}),

	createShadowRoot: function(){
		var shadowRoot = this.attachShadow({ mode: 'open' });
		shadowRoot.appendChild(this.createTemplateSlot());
		shadowRoot.appendChild(this.createStyleSlot());
	},

	createStyleSlot: function(){
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
	},

	createTemplateSlot: function(){
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
	},

	attributeChangedCallback: function(name, oldValue, newValue){
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
	},
	
	updateValue: function(oldValue, newValue){
		this._value = newValue;
		this.updateRendering();
	},
	
	updateEnabled: function(oldValue, newValue){
		this._enabled = JSON.parse(newValue);
		this.updateRendering();
	},
	
	updateRendering: function(){
		if(!this.isInitialized)
			return;
	
		this.valueElement.textContent = this._value;
	
		if(this._enabled){
			this.waiterHolderElement.classList.remove("invisible");
		}
		else {
			this.waiterHolderElement.classList.add("invisible");
		}
	},
	
	parseAttribute: function(name){
		return JSON.parse(this.getAttribute(name));
	},
	
	removeChildren: function(from){
		while(from.firstChild)
			from.removeChild(from.firstChild);
	},
	
	onStyleSlotChangedEventHandler: function(eventArgs){
		var style = this.querySelector('[slot=style]');
	
		if(!style)
			return;
	
		this.removeChildren(this.styleSlotElement);
		this.removeChild(style);
		this.styleSlotElement.appendChild(style);
	},
	
	onTemplateSlotChangedEventHandler: function(eventArgs){
		var template = this.querySelector('[slot=template]');
	
		if(!template)
			return;
	
		this.removeChildren(this.templateSlotElement);
		this.removeChild(template);
		this.templateSlotElement.appendChild(template);
		this.initialize(null);
	
		this.updateValue(null, this.getAttribute('value'));
		this.updateEnabled(null, this.getAttribute('enabled'));
	},
	
	connectedCallback: function(){
		this.initialize(null);
	
		this.updateValue(null, this.getAttribute('value'));
		this.updateEnabled(null, this.getAttribute('enabled'));

		this.addEventListener('click', this.onClick);

	},

	onClick: method(
	bindContext(),
	function(){
		this.enabled = false;
	}),
	
	disconnectedCallback: function(){
		this.unSubscribe();
		this.isInitialized = false;
	}
});

window.customElements.define("custom-waiter", MyComponent);