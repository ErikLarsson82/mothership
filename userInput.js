define('userInput', [], function() {

    var DEBUG_USE_CONTROLLER = false;
    var keyboardData = [
        {
            //Player 1
            buttons: [
                { pressed: false },
                { pressed: false },
                { pressed: false },
                { pressed: false },
                { pressed: false },
                { pressed: false },
                { pressed: false },
                { pressed: false },
                { pressed: false }
            ],
            axes: [
                0,
                0,
                0,
                0
            ]
        },
        {
            //Player 2
            buttons: [
                { pressed: false },
                { pressed: false },
                { pressed: false },
                { pressed: false },
                { pressed: false },
                { pressed: false },
                { pressed: false },
                { pressed: false },
                { pressed: false }
            ],
            axes: [
                0,
                0,
                0,
                0
            ]
        },
        {
            //Player 3
            buttons: [
                { pressed: false },
                { pressed: false },
                { pressed: false },
                { pressed: false },
                { pressed: false },
                { pressed: false },
                { pressed: false },
                { pressed: false },
                { pressed: false }
            ],
            axes: [
                0,
                0,
                0,
                0
            ]
        }
    ]
    var currentIdx = 0;

    if (DEBUG_USE_CONTROLLER) {
        window.addEventListener("gamepadconnected", function(e) {
            console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
            e.gamepad.index, e.gamepad.id,
            e.gamepad.buttons.length, e.gamepad.axes.length);
        });
    } else {
        window.addEventListener("keydown", function(e) {
            switch(e.keyCode) {
                case 89:
                    currentIdx++;
                    if (currentIdx > keyboardData.length-1) {
                        currentIdx = 0;
                    }
                    console.log('Switching to player ' + (currentIdx + 1));
                break;
                case 37:
                    keyboardData[currentIdx].axes[0] = -1;
                    keyboardData[currentIdx].axes[2] = -1;
                break;
                case 38:
                    keyboardData[currentIdx].axes[1] = -1;
                    keyboardData[currentIdx].axes[3] = -1;
                break;
                case 39:
                    keyboardData[currentIdx].axes[0] = 1;
                    keyboardData[currentIdx].axes[2] = 1;
                break;
                case 40:
                    keyboardData[currentIdx].axes[1] = 1;
                    keyboardData[currentIdx].axes[3] = 1;
                break;
                case 65:
                    keyboardData[currentIdx].buttons[4].pressed = true;
                break;
                case 83:
                    keyboardData[currentIdx].buttons[5].pressed = true;
                break;
                case 68:
                    keyboardData[currentIdx].buttons[6].pressed = true;
                break;
                case 70:
                    keyboardData[currentIdx].buttons[7].pressed = true;
                break;
            }
        });
        window.addEventListener("keyup", function(e) {
            switch(e.keyCode) {
                case 37:
                    keyboardData[currentIdx].axes[0] = 0;
                    keyboardData[currentIdx].axes[2] = 0;
                break;
                case 38:
                    keyboardData[currentIdx].axes[1] = 0;
                    keyboardData[currentIdx].axes[3] = 0;
                break;
                case 39:
                    keyboardData[currentIdx].axes[0] = 0;
                    keyboardData[currentIdx].axes[2] = 0;
                break;
                case 40:
                    keyboardData[currentIdx].axes[1] = 0;
                    keyboardData[currentIdx].axes[3] = 0;
                break;
                case 65:
                    keyboardData[currentIdx].buttons[4].pressed = false;
                break;
                case 83:
                    keyboardData[currentIdx].buttons[5].pressed = false;
                break;
                case 68:
                    keyboardData[currentIdx].buttons[6].pressed = false;
                break;
                case 70:
                    keyboardData[currentIdx].buttons[7].pressed = false;
                break;
            }
        });
    }

    return {
        readInput: function() {
            if (DEBUG_USE_CONTROLLER) {
                return navigator.getGamepads();
            } else {
                return keyboardData;
            }
        }
    }
});