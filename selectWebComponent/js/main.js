/**
* Author: Volodymyr Korniyko
* File: main.js
* Date: Sun, 30 Dec 2018 18:45:24 GMT
*/

function changeAttribute(){
	var el = document.getElementById("mySelect");
	el.setAttribute("options", [1,2,3]);
}

function addOption(){
	var el = document.querySelector("#mySelect");
	var li = document.createElement("li");
	li.textContent = 123;
	li.slot = "items";
	el.appendChild(li);
}