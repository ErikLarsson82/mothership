requirejs.config({
    waitSeconds: '60'
});

requirejs([
  'game'
], function (game) {

    let running = true;

    window.addEventListener('keydown', function (e) {
        if (e.keyCode === 80) {
            running = !running;
        }
    });

    game.init();

    function gameLoop() {
        window.requestAnimationFrame(gameLoop);
        if (!running) return;
        game.tick();
    }
    gameLoop();
})