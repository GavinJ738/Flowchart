"use strict";
document.addEventListener('DOMContentLoaded', function () {
    const menuButton = document.getElementsByClassName('MenuButton')[0];
    const menuContainer = document.getElementsByClassName('MenuContainer')[0];
    menuButton.addEventListener('mousedown', function (e) {
        console.log("Clicked");
        if (menuContainer.style.right == "0em") {
            menuContainer.style.right = "-25em";
        }
        else {
            menuContainer.style.right = "0em";
        }
    });
});
