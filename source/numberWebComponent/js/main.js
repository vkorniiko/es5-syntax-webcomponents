"use strict";

window.onload = function onValuechanged(){
  var el = document.getElementById("myNumber");
  el.addEventListener("change", function(){
    console.log(el.value);
  });
};
