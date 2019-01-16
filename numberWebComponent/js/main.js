/**
* Author: Volodymyr Korniyko
* File: main.js
* Date: 4 Jan 2019
*/

window.onload = function onValuechanged(){
	var el = document.getElementById('myNumber');
	el.addEventListener('change', function(){
		console.log(el.value);
	});
};