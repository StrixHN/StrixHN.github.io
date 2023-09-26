
function init() {}

function run() {
  requestAnimationFrame(run);
}


window.addEventListener('DOMContentLoaded', () => {
  let button = document.createElement('button');
  button.innerHTML = 'Play';
  document.body.appendChild(button);
  button.addEventListener('click', () => {
    document.body.removeChild(button);
    init();
    setTimeout(run, 1000);
  });
});
