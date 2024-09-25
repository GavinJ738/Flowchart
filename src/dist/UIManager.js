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
    //Hooking up save/load buttons
    const saveButton = document.getElementById("SaveButton");
    const loadButton = document.getElementById("LoadButton");
    saveButton === null || saveButton === void 0 ? void 0 : saveButton.addEventListener('mousedown', function () {
        Saving.save();
    });
    loadButton === null || loadButton === void 0 ? void 0 : loadButton.addEventListener('mousedown', function () {
        Saving.load(CanvasManager.instance);
    });
});
