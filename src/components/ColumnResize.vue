<template>
  <span @mousedown='resizeColumn' @touchstart='resizeColumn' class="column-resize"></span>
</template>

<script lang="ts">
export default { name: 'ColumnResize' }
</script>
<script setup lang="ts">
import throttle from 'lodash-es/throttle';


function getEventX (event: any) {
  let evt;
  if (event.changedTouches && event.changedTouches.length > 0) {
    evt = event.changedTouches[0];
  } else if (event.touches && event.touches.length > 0) {
    evt = event.touches[0];
  } else {
    evt = event;
  }
  return evt.clientX || evt.x;
}

function resizeColumn (event: MouseEvent) {
  let offsetX = 0;
  const startX = getEventX(event); // event.clientX || event.x;
  const $handler = event.target || event.srcElement;
  const $cell = $handler?.parentNode?.parentNode;
  const $table = $cell.parentNode.parentNode.parentNode;
  const $middle = $table.parentNode;
  const $ruler = document.createElement('div');
  const startWidth = $cell.offsetWidth;
  const tableLeft = $middle.getBoundingClientRect().left;

  $ruler.classList.add('fw-table-resize-ruler');
  $middle.appendChild($ruler);
  document.body.classList.add('fw-table-resizing-overlay');

  const onMouseMove = throttle((e: any) => {
    const endX = getEventX(e);
    const cellLeft = ($cell.getBoundingClientRect().left - tableLeft) + 70;

    $ruler.style.left = Math.max(cellLeft, endX - tableLeft) + $middle.scrollLeft + 'px';
    // $ruler.style.left = Math.max(cellLeft, endX - tableLeft) + 'px';
  }, 200);

  const onMouseUp = (e: any) => {
    const endX = getEventX(e);

    offsetX = startX - endX;

    $cell.style.width = Math.max(70, startWidth - offsetX) + 'px';
    $middle.removeChild($ruler);
    document.body.classList.remove('fw-table-resizing-overlay');
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    document.removeEventListener('touchmove', onMouseMove);
    document.removeEventListener('touchend', onMouseUp);
  };

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
  document.addEventListener('touchmove', onMouseMove);
  document.addEventListener('touchend', onMouseUp);

  onMouseMove(event);
}
</script>

<style lang="scss">
.column-resize {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  width: 6px;
  cursor: col-resize;
  transition: 0.5s;
  background-color: rgba(0, 0, 0, 0);
}
</style>
