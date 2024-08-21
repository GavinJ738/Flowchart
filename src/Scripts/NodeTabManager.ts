function hasParentWithId(element: Element | null, id: string) {
    if (!element) {
        return false;
    }

    if (element.id === id) {
        return true;
    }

    return hasParentWithId(element.parentElement, id);
}
document.addEventListener('DOMContentLoaded', function () {
    console.log(1);

    const draggables = document.getElementsByClassName('draggable');
    let copy: any = null;

    for (const draggable of draggables) {

        draggable?.addEventListener('mousedown', function (e: any) {
            console.log("Mouse down");
            // Create a copy of the element
            copy = draggable.cloneNode(true);
            copy.classList.add('draggable-copy');
            document.body.appendChild(copy);

            // Position the copy initially
            moveAt(e.pageX, e.pageY);

            // Move the copy when the mouse moves
            function onMouseMove(event: any) {
                moveAt(event.pageX, event.pageY);
            }

            document.addEventListener('mousemove', onMouseMove);

            // Drop the copy and remove event listeners when mouse is released
            document.addEventListener('mouseup', function (event: any) {
                document.removeEventListener('mousemove', onMouseMove);
                var id = copy.id;
                copy.remove();
                copy = null;

                const elementUnderCursor: Element | null = document.elementFromPoint(event.clientX, event.clientY);
                console.log(elementUnderCursor);
                if (hasParentWithId(elementUnderCursor, "mainCanvas")) {
                    canvasManager.AddNode({
                        x: event.pageX,
                        y: event.pageY
                    }, id);
                }


            }, { once: true });

            // Position the copy at the cursor
            function moveAt(pageX: number, pageY: number) {
                copy.style.left = pageX - copy.offsetWidth / 2 + 'px';
                copy.style.top = pageY - copy.offsetHeight / 2 + 'px';
            }
        });
    }
});
