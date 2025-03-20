// const set_item_original = localStorage.setItem;
// localStorage.setItem = function(k, v) {
//     try {
//         console.log("%cset", "color: yellow; background: blue;", k, JSON.parse(v))
//     } catch(e) {
//         console.log("%cset", "color: yellow; background: blue;", k, v )
//     }
//     console.trace();

//     return set_item_original.call(localStorage, k, v)
// }

// const get_item_original = localStorage.getItem;
// localStorage.getItem = function(k) {
//     const v = get_item_original.call(localStorage, k);
//     try {
//         console.log("%cget", "color: red; background: blue;", k, JSON.parse(v));
//     } catch {
//         console.log("%cget", "color: red; background: blue;", k, v);
//     }
//     console.trace();

//     return v;
// }


const key_map = {
    "Backquote": "`",        // `
    "Digit0": "0",           // 0
    "Digit1": "1",           // 1
    "Digit2": "2",           // 2
    "Digit3": "3",           // 3
    "Digit4": "4",           // 4
    "Digit5": "5",           // 5
    "Digit6": "6",           // 6
    "Digit7": "7",           // 7
    "Digit8": "8",           // 8
    "Digit9": "9",           // 9
    "KeyA": "A",             // A
    "KeyB": "B",             // B
    "KeyC": "C",             // C
    "KeyD": "D",             // D
    "KeyE": "E",             // E
    "KeyF": "F",             // F
    "KeyG": "G",             // G
    "KeyH": "H",             // H
    "KeyI": "I",             // I
    "KeyJ": "J",             // J
    "KeyK": "K",             // K
    "KeyL": "L",             // L
    "KeyM": "M",             // M
    "KeyN": "N",             // N
    "KeyO": "O",             // O
    "KeyP": "P",             // P
    "KeyQ": "Q",             // Q
    "KeyR": "R",             // R
    "KeyS": "S",             // S
    "KeyT": "T",             // T
    "KeyU": "U",             // U
    "KeyV": "V",             // V
    "KeyW": "W",             // W
    "KeyX": "X",             // X
    "KeyY": "Y",             // Y
    "KeyZ": "Z",
    "Enter": "Enter",           // Enter
    "Space": "Space",            // Space
    "Tab": "Tab",             // Tab
    "Backspace": "Backspace",         // Backspace (можно оставить пустым)
    "Delete": "Delete",            // Delete (можно оставить пустым)
    "Escape": "Escape",      // Escape
    "ArrowUp": "↑",          // Вверх
    "ArrowDown": "↓",        // Вниз
    "ArrowLeft": "←",        // Влево
    "ArrowRight": "→",       // Вправо
    "Semicolon": ";",        // ;
    "Comma": "<",            // ,
    "Period": ">",           // .
    "Slash": "/",            // /
    "Backslash": "\\",       // \
    "Quote": "'",            // '
    "BracketLeft": "[",      // [
    "BracketRight": "]",     // ]
    "Minus": "-",            // -
    "Equal": "=",            // =
    "IntlBackslash": "\\",   // ¦ (правый обратный слэш)
    "Numpad0": "Numpad 0",          // Номеральная клавиатура 0
    "Numpad1": "Numpad 1",          // Номеральная клавиатура 1
    "Numpad2": "Numpad 2",          // Номеральная клавиатура 2
    "Numpad3": "Numpad 3",          // Номеральная клавиатура 3
    "Numpad4": "Numpad 4",          // Номеральная клавиатура 4
    "Numpad5": "Numpad 5",          // Номеральная клавиатура 5
    "Numpad6": "Numpad 6",          // Номеральная клавиатура 6
    "Numpad7": "Numpad 7",          // Номеральная клавиатура 7
    "Numpad8": "Numpad 8",          // Номеральная клавиатура 8
    "Numpad9": "Numpad 9",          // Номеральная клавиатура 9
    "NumpadAdd": "Numpad +",        // +
    "NumpadSubtract": "Numpad -",   // -
    "NumpadMultiply": "Numpad *",   // *
    "NumpadDivide": "Numpad /",     // /
    "NumpadEnter": "Numpad Enter",     // Номеральная клавиатура Enter
    "F1": "F1",              // F1
    "F2": "F2",              // F2
    "F3": "F3",              // F3
    "F4": "F4",              // F4
    "F5": "F5",              // F5
    "F6": "F6",              // F6
    "F7": "F7",              // F7
    "F8": "F8",              // F8
    "F9": "F9",              // F9
    "F10": "F10",            // F10
    "F11": "F11",            // F11
    "F12": "F12",            // F12
    "Insert": "Insert",      // Insert
    "Home": "Home",          // Home
    "End": "End",            // End
    "PageUp": "Page Up",     // Page Up
    "PageDown": "Page Down", // Page Down
    "ContextMenu": "Context Menu", // Menu (обычно это клавиша с 3 линиями)
    "CapsLock": "Caps Lock", // Caps Lock
    "ScrollLock": "Scroll Lock", // Scroll Lock
    // "NumLock": "Num Lock",   // Num Lock
    // "PrintScreen": "Print Screen", // Print Screen
    "ControlLeft": "Ctrl слева",   // Левый Control
    "ControlRight": "Ctrl справа",  // Правый Control
    "ShiftLeft": "Shift слева",     // Левый Shift
    "ShiftRight": "Shift справа",    // Правый Shift
    "AltLeft": "Alt слева",         // Левый Alt
    "AltRight": "Alt справа",        // Правый Alt
    // "MetaLeft": "Meta",       // Левый Meta (обычно клавиша Windows)
    // "MetaRight": "Meta" 
};
const bind_name_map = {
    'up': 'Вверх',
    'down': 'Вниз',
    'left': 'Влево',
    'right': 'Вправо',
    'jump': 'Прыжок',
    'dash': 'Рывок',
    'grab': 'Ухватиться',
    'action': 'Взаимодействовать',
}