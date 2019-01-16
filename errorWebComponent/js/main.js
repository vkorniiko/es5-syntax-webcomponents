/**
* Author: Volodymyr Korniyko
* File: main.js
* Date: 9 Jan 2019
*/

function showError(){
	var el = document.getElementById('customError');
	el.target = "testInputError";
	el.value = "Custom error";
	el.enabled = true;
}

window.onresize = function(){
	console.log("changed");
}