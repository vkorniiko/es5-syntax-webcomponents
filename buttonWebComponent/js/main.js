/**
* Author: Volodymyr Korniyko
* File: main.js
* Date: 5 Jan 2019
*/

window.onload = function(){
	var el = document.getElementById("myButton");
	
	el.addEventListener('click', function(){
		alert('clicked');
	});
}