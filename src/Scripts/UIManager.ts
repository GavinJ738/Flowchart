document.addEventListener('DOMContentLoaded', function () {
    const menuButton = document.getElementsByClassName('MenuButton')[0];
    const menuContainer = document.getElementsByClassName('MenuContainer')[0];
    menuButton.addEventListener('mousedown', function (e: any) {
        console.log("Clicked");
        if ((menuContainer as HTMLElement).style.right == "0em") {
            (menuContainer as HTMLElement).style.right = "-25em";
        } else {
            (menuContainer as HTMLElement).style.right = "0em";
        }

    })
})