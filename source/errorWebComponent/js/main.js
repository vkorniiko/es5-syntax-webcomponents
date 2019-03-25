"use strict";

function showError(){
  var el = document.getElementById("customError");
  el.target = "testInputError";
  el.value = "Custom error";
  el.enabled = true;
}

window.onresize = function(){
  console.log("changed");
};
