function roundNumber(num, exp) {
    const factor = Math.pow(10, exp);
    return Math.round(num * factor) / factor;
}

function sleep(time_ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, time_ms)
    });
}

const duration = 250;
async function fade_out_element(element) {
    element.style.opacity = '0';
    await sleep(duration);
    element.style.visibility = 'hidden';
}
async function fade_in_element(element) {
    element.style.opacity = '0';
    element.style.visibility = 'visible';
    await sleep(5);
    element.style.opacity = '1';
}

var scale = 0;
let needWidth = 1920;
let needHeight = 1080; 
let aspectRatio = 16 / 9;
let field = document.querySelector('#field');
function resize_window() {
    width = window.innerWidth;
    height = window.innerHeight;
    if (width / height > aspectRatio) {
        newHeight = height;
        newWidth = height * aspectRatio;
    } else {
        newWidth = width;
        newHeight = width / aspectRatio;
    }
    scale = Math.min(newWidth / needWidth, newHeight / needHeight);
    document.body.style.zoom = scale;

    if (global.current_menu == 'saves') {
        document.querySelector(`#main`).scrollIntoView({block: "center", inline: "center"});
    } else if (global.current_menu == 'chapter_info') {
        document.querySelector(`#map`).scrollIntoView({block: "center", inline: "center"});
    } else {
        document.querySelector(`#${global.current_menu}`).scrollIntoView({block: "center", inline: "center"});
    }
}

class Global {
    constructor () {
        this.save_name = null;
        this.save_key = null;
        this.chapter_number = null;
        this.current_menu = 'main';
        this.saves = [];
        this.menus = {
            main: null,
            settings: null,
            saves: null,
            map: null,
            chapter_info: null,
        }
    }
}


//

class Screen_to_set_propesties {
    constructor (elem) {
        this.elem = elem;
        this.width = parseFloat(window.getComputedStyle(this.elem).width);
        this.height = parseFloat(window.getComputedStyle(this.elem).height);
        this.pos_global = {
            x: parseFloat(window.getComputedStyle(this.elem).left) * this.width,
            y: parseFloat(window.getComputedStyle(this.elem).top) * this.height,
        }
        this.elem.style.left = this.pos_global.x + 'px';
        this.elem.style.top = this.pos_global.y + 'px';
    }
}



var background = document.querySelector('.background');
var background_img = background.querySelector('img#background');
background_img.setAttribute('src', window.electron.get_full_path('files/sprites/main-menu/main-menu-bg_day.png'))
var main = document.querySelector('.screen#main');
var saves_container = document.querySelector('.screen > #saves');
var settings = document.querySelector('.screen#settings');
var map = document.querySelector('.screen#map');
var chapter_info = document.querySelector('.screen#chapter_info');




function make_save_elem () {
    let parser = new DOMParser();
    let save_plain_html = `
        <div class="save">
            <div class="inner">
                <img src="D:\mountainNew\files\sprites\main-menu\saves-menu\ticket.png" alt="">
                <div class="cont" id="berries">
                    <img src="D:\mountainNew\files\sprites\main-menu\saves-menu\strawberry.png" alt="">
                    <p>0</p>
                </div>
                <div class="cont" id="deaths">
                    <img src="D:\mountainNew\files\sprites\main-menu\saves-menu\skullBlue.png" alt="">
                    <p>0</p>
                </div>
                <div class="trash">
                    <img src="" alt="">
                    <div class="window confirm">Удалить?</div>
                </div>
            </div>
            <div class="outer">
                <img src="D:\mountainNew\files\sprites\main-menu\saves-menu\card.png" alt="">
                <div class="avatar">
                    <img src="D:\mountainNew\files\sprites\madeline\stay\stay1-544.png" alt="">
                    <p class="count"></p>
                </div>
                <div class="name">
                    <input type="text" maxlength="12">
                    <div class="dashs">
                        <div class="dash"></div>
                        <div class="dash"></div>
                        <div class="dash"></div>
                        <div class="dash"></div>
                    </div>
                </div>
                <div class="button" id="to_map">
                    <img src="D:\mountainNew\files\sprites\main-menu\chevron-forward-outline.svg" alt="">
                </div>
            </div>
        </div>
    `;
    
    let save_elem = parser.parseFromString(save_plain_html, 'text/html');
    save_elem.querySelector('.trash > img').setAttribute('src', window.electron.get_full_path('files/sprites/gameplay/decals/trash.png'));
    global.save_elem = save_elem.querySelector('.save');
}

class Save_html {
    constructor (elem) {
        this.elem = elem;
        this.outer = {
            elem: this.elem.querySelector('.outer'),
            img: null
        }
        this.outer.img = this.outer.elem.querySelector('img');
        this.inner = {
            elem: this.elem.querySelector('.inner'),
            img: null
        }
        this.inner.img = this.inner.elem.querySelector('img');
        // 
        this.outer.img.setAttribute('src', window.electron.get_full_path('files/sprites/main-menu/saves/card.png'));
        this.inner.img.setAttribute('src', window.electron.get_full_path('files/sprites/main-menu/saves/ticket.png'));
        
        this.button_to_map = {
            elem: this.outer.elem.querySelector('.button'),
            img: null,
            is_active: false
        }
        this.button_to_map.img = this.button_to_map.elem.querySelector('img');
        this.button_to_map.img.setAttribute('src', window.electron.get_full_path('files/sprites/main-menu/chevron-forward-outline.svg'));
        // 
        this.avatar = {
            elem: this.outer.elem.querySelector('.avatar'),
            img: null
        }
        this.avatar.img = this.avatar.elem.querySelector('img');
        this.avatar.img.setAttribute('src', window.electron.get_full_path('files/sprites/madeline/stay/stay1-544.png'));
        // 
        this.name = {
            elem: this.outer.elem.querySelector('.name'),
            input: null,
            dashs_cont: null,
            dashs_array: []
        }
        this.name.input = this.name.elem.querySelector('input');
        this.name.dashs_cont = this.name.elem.querySelector('.dashs')
        this.name.dashs_array = Array.from(this.name.elem.querySelectorAll('.dash'));
        // 
        this.berries = {
            elem: this.inner.elem.querySelector('#berries'),
            img: null,
            p: null
        }
        this.berries.p = this.berries.elem.querySelector('p');
        this.berries.img = this.berries.elem.querySelector('img');
        this.berries.img.setAttribute('src', window.electron.get_full_path('files/sprites/main-menu/strawberry.png'));
        // 
        this.deaths = {
            elem: this.inner.elem.querySelector('#deaths'),
            img: null,
            p: null
        }
        this.deaths.p = this.deaths.elem.querySelector('p');
        this.deaths.img = this.deaths.elem.querySelector('img');
        this.deaths.img.setAttribute('src', window.electron.get_full_path('files/sprites/main-menu/skullBlue.png'));
    }
}

class Save extends Save_html {
    constructor (save_from_file, save_key, elem, is_new) {
        super(elem);
        this.is_new = is_new;
        this.berries_total = 0;
        this.deaths_total = 0;

        if (!is_new) {
            this.save_from_file = save_from_file;
            this.save_key = save_key;
            this.make_not_new();
        } else {
            this.pattern = /^[a-zA-Zа-яА-Я0-9\-.]{1,12}$/;
            this.handle_input_input = (e) => {
                if (this.name.input.value.length > 0 && this.pattern.test(this.name.input.value)) {
                    this.button_to_map.is_active = true;
                    fade_in_element(this.button_to_map.elem);
                } else {
                    this.button_to_map.is_active = false;
                    fade_out_element(this.button_to_map.elem);
                }
                console.log(this.name.input.value);
            }
            this.handle_button_to_map_click = () => {
                if (this.button_to_map.is_active) {
                    let temp_saves = JSON.parse(localStorage.getItem('saves'));
                    let number_of_new_save = 0;
                    for (let key in temp_saves) {
                        if (number_of_new_save < key.at(-1)) {
                            number_of_new_save = key.at(-1);
                        }
                    }
                    number_of_new_save++;
                    this.save_from_file = Object.assign({}, save_original)
                    this.save_from_file.name = this.name.input.value;
                    this.save_key = `save_${number_of_new_save}`;
                    temp_saves[this.save_key] = this.save_from_file;
                    localStorage.setItem('saves', JSON.stringify(temp_saves));
                    this.make_not_new();
                    main_to_map(this.save_key, this.save_name);
                }
            }
            this.name.input.addEventListener('input', this.handle_input_input);
            this.button_to_map.elem.addEventListener('click', this.handle_button_to_map_click);
        }
    }

    make_not_new () {
        this.is_new = false;
        this.save_name = this.save_from_file.name;
        
        let temp_chapters = JSON.parse(localStorage.getItem('saves'))[this.save_key].chapters;
        for (let key in temp_chapters) {
            let berries = temp_chapters[key].berries;
            berries.forEach(berry => {
                if (berry == 1) {
                    this.berries_total += 1;
                }
            });
            this.deaths_total += temp_chapters[key].deaths;
        }
        this.berries.p.innerHTML = this.berries_total;
        this.deaths.p.innerHTML = this.deaths_total;

        this.chapters = [];
        for (let key in this.save_from_file.chapters) {
            this.chapters.push(new Chapter(this.save_from_file.chapters[key]));
        }

        this.name.input.disabled = true;
        this.name.input.value = this.save_from_file.name;
        this.name.input.removeEventListener('input', this.handle_input_input);
        this.button_to_map.elem.removeEventListener('click', this.handle_button_to_map_click);

        this.elem.addEventListener('mouseover', () => {
            this.outer.elem.style.left = '-30%';
            this.inner.elem.style.left = '30%';
        });
        this.elem.addEventListener('mouseout', () => {
            this.outer.elem.style.left = '0';
            this.inner.elem.style.left = '0';
        });
        
        this.delete = {
            elem: this.inner.elem.querySelector('.trash'),
            trash: null,
            window_confirm: null,
            confirm: false,
        }
        this.delete.trash = this.delete.elem.querySelector('img');
        this.delete.window_confirm = this.delete.elem.querySelector('.window.confirm');
        fade_out_element(this.delete.window_confirm);
        this.delete.trash.addEventListener('click', () => {
            if (this.delete.confirm) {
                this.delete.confirm = false;
                fade_out_element(this.delete.window_confirm);
                this.delete.window_confirm.removeEventListener('click', this.delete_this_save);
            } else {
                this.delete.confirm = true;
                fade_in_element(this.delete.window_confirm);
                this.delete.window_confirm.addEventListener('click', this.delete_this_save);
            }
        });
        this.delete_this_save = async () => {
            if (this.delete.confirm) {
                let saves = JSON.parse(localStorage.getItem('saves'));
                delete saves[this.save_key];
                localStorage.setItem('saves', JSON.stringify(saves));

                global.menus.saves.make_inactive();
                await sleep(250);
                global.menus.saves.make_saves();
                await sleep(250);
                global.menus.saves.make_active();
            }
        }
    }
}

class Chapter {
    constructor (chapter_from_file) {
        this.berries_total = 0;
        this.deaths = chapter_from_file.deaths;
        this.berries = [];
        let temp_berries = chapter_from_file.berries;
        for (let i = 0; i < temp_berries.length; i++) {
            this.berries[i] = temp_berries[i];
        }
        this.checkpoints = {
            total: chapter_from_file.checkpoints.total,
            passed: chapter_from_file.checkpoints.passed
        }
        this.is_locked = chapter_from_file.is_locked;
        
    }
}

var save_original = {
    name: 'save_original',
        last_checkpoint: 'null',
        chapter_ended: 'null',
        chapters: {
            'chapter-1': {
                berries: [0],
                deaths: 0,
                    checkpoints: {
                        total: 5,
                        passed: 1,
                    },
                is_locked: false
            },
            'chapter-2': {
                berries: [0, 0, 0, 0],
                deaths: 0,
                    checkpoints: {
                        total: 7,
                        passed: 1,
                    },
                is_locked: true
            },
            'chapter-3': {
                berries: [0, 0, 0, 0, 0, 0],
                deaths: 0,
                    checkpoints: {
                        total: 7,
                        passed: 1,
                    },
                is_locked: true
            },
            'chapter-4': {
                berries: [0, 0, 0, 0, 0, 0, 0],
                deaths: 0,
                    checkpoints: {
                        total: 6,
                        passed: 1,
                    },
                is_locked: true
            }
        }
}
function set_to_localStorage () {
    let binds = {
        up: 'KeyW',
        left: 'KeyA',
        down: 'KeyS',
        right: 'KeyD',
        jump: 'KeyK',
        dash: 'KeyJ',
        grab: 'KeyL',
        action: 'KeyF',
    }
    let settings = {
        binds: binds,
        audio: '10%'
    }
    
    let saves = {
        // save_1: Object.assign({}, save_original),
        // save_2: Object.assign({}, save_original),
    }
    
    let go_to = {
        path: 'null'
    }
    
    localStorage.setItem('settings', JSON.stringify(settings));
    localStorage.setItem('saves', JSON.stringify(saves));
    localStorage.setItem('go_to', JSON.stringify(go_to));

    let storage_exist = 'true';
    localStorage.setItem('storage_exist', storage_exist);
}
 
// localStorage.clear();
// set_to_localStorage();

let storage = localStorage;
if (storage.storage_exist != 'true') {
    set_to_localStorage();
}





class Menu_main { 
    constructor () {
        this.elem = document.querySelector('#main');
        this.width = parseFloat(window.getComputedStyle(this.elem).width);
        this.height = parseFloat(window.getComputedStyle(this.elem).height);
        this.pos_global = {
            x: parseFloat(window.getComputedStyle(this.elem).left),
            y: parseFloat(window.getComputedStyle(this.elem).top),
        }
        this.left_menu = this.elem.querySelector('.cont')
        this.is_active = true;

        this.buttons = {
            to_saves: this.left_menu.querySelector('#to_saves'),
            to_settings: this.left_menu.querySelector('#to_settings'),
            to_exit: this.left_menu.querySelector('#to_exit')
        }

        this.buttons.to_saves.addEventListener('click', () => {
            if (this.is_active) {
                global.current_menu = 'saves';
                this.left_menu.style.opacity = '0';
                setTimeout(() => {
                    this.left_menu.style.visibility = 'hidden';
                }, duration);
                this.make_inactive();
                global.menus.saves = new Menu_saves();
                global.menus.saves.make_active();
            }
        });
        this.buttons.to_settings.addEventListener('click', () => {
            if (this.is_active) {
                // global.current_menu = 'settings';
                // this.make_inactive();
                // global.menus.settings = new Menu_settings();
                // global.menus.settings.make_active();
                // global.menus.settings.elem.scrollIntoView({block: "center", inline: "center", behavior: "smooth"});
                main_to_settings();
            }
        });
        this.buttons.to_exit.addEventListener('click', async () => {
            if (this.is_active) {
                this.is_active = false;
                fade_out_element(background);
                await sleep(1000);
                window.electron.closeWindow();
            }
        })
        this.make_active();
    }

    async make_active () {
        global.current_menu = 'main';
        this.is_active = true;
        this.left_menu.style.visibility = 'visible';
        this.left_menu.style.opacity = '1';
        for (let key in this.buttons) {
            await sleep(50);
            this.buttons[key].style.visibility = 'visible';
            await sleep(5);
            this.buttons[key].style.opacity = 1;
        }
    }
    async make_inactive () {
        this.is_active = false;
        await sleep(250);
        for (let key in this.buttons) {
            this.buttons[key].style.opacity = 0;
            this.buttons[key].style.visibility = 'hidden';
        }
    }
}

document.querySelector('#settings #for_strings #alert').setAttribute('src', window.electron.get_full_path('files/sprites/main-menu/skullBlue.png'));
class Menu_settings {
    constructor () {
        this.elem = document.querySelector('#settings');
        this.width = parseFloat(window.getComputedStyle(this.elem).width);
        this.height = parseFloat(window.getComputedStyle(this.elem).height);
        this.pos_global = {
            x: parseFloat(window.getComputedStyle(this.elem).left),
            y: parseFloat(window.getComputedStyle(this.elem).top),
        }
        this.is_active = false;

        this.buttons = {
            to_back: this.elem.querySelector('.left-menu > #to_main'),
            to_binds: this.elem.querySelector('.left-menu > #to_binds')
        }
        for (let key in this.buttons) {
            this.buttons[key].style.opacity = '0';
        }

        this.for_strings_container = this.elem.querySelector('#for_strings');
        this.setting_string_html = this.elem.querySelector('#for_strings > .string');
        this.for_strings_container.removeChild(this.setting_string_html);
        this.setting_string = {
            elem: null,
            name: null,
            action: null,
            bind: null,
            alert: null,
            is_listening: false
        }
        this.settings = JSON.parse(localStorage.getItem('settings'));
        this.binds = this.settings.binds;
        this.settings_strings = [];
        this.for_strings_container.innerHTML = '';
        
        for (let action in this.binds) {
            let new_string_html = this.setting_string_html.cloneNode(true);
            let new_string = JSON.parse(JSON.stringify(this.setting_string));
            new_string.elem = new_string_html;
            new_string.name = new_string.elem.querySelector('#name');
            new_string.bind = new_string.elem.querySelector('#bind');
            new_string.alert = new_string.elem.querySelector('#alert');
            new_string.key_code = this.binds[action];
            new_string.action = action;
            new_string.name.innerHTML = bind_name_map[action];
            new_string.bind.innerHTML = key_map[this.binds[action]];
            new_string.elem.style.visibility = 'hidden';
            new_string.elem.style.opacity = '0';
            this.for_strings_container.appendChild(new_string.elem);
            this.settings_strings.push(new_string);
            new_string.alert.style.opacity = '0';
            this.settings_strings.forEach(string => {
                if (new_string.action != string.action) {
                    if (new_string.key_code == string.key_code) {
                        new_string.alert.style.opacity = '1';
                        string.alert.style.opacity = '1';
                    }
                }
            });
        }

        this.settings_strings.forEach(string => {
            string.elem.addEventListener('click', () => {
                if (this.is_active) {
                    this.settings_strings.forEach(string_inner => {
                        if (string != string_inner) {
                            if (string_inner.is_listening) {
                                string_inner.is_listening = false;
                                string_inner.elem.style.animation = 'none';
                                document.removeEventListener('keydown', this.handle_keyboard);
                            }
                        }
                    });
                    if (string.is_listening) {
                        string.is_listening = false;
                        string.elem.style.animation = 'none';
                        document.removeEventListener('keydown', this.handle_keyboard);
                    } else {
                        string.is_listening = true;
                        string.elem.style.animation = 'animation_fade_in_out 1s infinite';
                        document.addEventListener('keydown', this.handle_keyboard);
                    }
                }
            });
        });

        this.handle_keyboard = (e) => {
            if (!this.is_active) {
                return;
            }
            let listening_string = null;
            this.settings_strings.forEach(string => {
                if (string.is_listening) {
                    listening_string = string;
                }
            });
            listening_string.is_listening = false;
            listening_string.elem.style.animation = 'none';
            document.removeEventListener('keydown', this.handle_keyboard);
            if (e.code == 'Escape') {
                return;
            }
            this.binds[listening_string.action] = e.code;
            localStorage.setItem('settings', JSON.stringify(this.settings));
            listening_string.bind.innerHTML = key_map[e.code];
            listening_string.key_code = e.code;
            this.settings_strings.forEach(string => {
                string.alert.style.opacity = '0';
                if (listening_string.action != string.action) {
                    if (listening_string.key_code == string.key_code) {
                        listening_string.alert.style.opacity = '1';
                        string.alert.style.opacity = '1';
                    }
                }
            });
        }
        

        // переходы
        this.buttons.to_back.addEventListener('click', () => {
            if (this.is_active) {
                // global.current_menu = 'main';
                // this.make_inactive();
                // global.menus.main.make_active();
                // global.menus.main.elem.scrollIntoView({block: "center", inline: "center", behavior: "smooth"});
                settings_to_main();
            }
        });
    }

    async make_active () {
        global.current_menu = 'settings';
        this.is_active = true;
        for (let key in this.buttons) {
            await sleep(50);
            this.buttons[key].style.visibility = 'visible';
            await sleep(5);
            this.buttons[key].style.opacity = 1;
        }
        for (let key in this.settings_strings) {
            await sleep(50);
            setTimeout(() => {
                this.settings_strings[key].elem.style.visibility = 'visible';
                this.settings_strings[key].elem.style.opacity = '1';
            }, duration);
        }
    }
    async make_inactive () {
        this.is_active = false;
        for (let key in this.buttons) {
            this.buttons[key].style.opacity = 0;
            setTimeout(() => {
                this.buttons[key].style.visibility = 'hidden';
            }, duration);
        }
        for (let key in this.settings_strings) {
            this.settings_strings[key].elem.style.opacity = '0';
            setTimeout(() => {
                this.settings_strings[key].elem.style.visibility = 'hidden';
            }, duration);
        }
    }
}

class Menu_saves {
    constructor () {
        this.elem = document.querySelector('#saves');
        this.is_active = true;

        this.buttons = {
            to_main: this.elem.querySelector('.button#to_main')
        }
        this.buttons.to_main.addEventListener('click', () => {
            if (this.is_active) {
                global.current_menu = 'main';
                this.make_inactive();
                global.menus.main.make_active();
            }
        });


        this.make_inactive();

        this.saves = global.saves;
    }
    
    make_active () {
        global.current_menu = 'saves';
        this.make_saves();
        this.is_active = true;
        this.elem.style.left = '25%';
        global.menus.main.elem.scrollIntoView({block: "center", inline: "center", behavior: "smooth"});
    }
    make_inactive () {
        this.is_active = false;
        this.elem.style.left = '-25%';
    }
    make_saves () {
        make_save_elem();
        let saves_counter = 1;
        global.saves.forEach(save => {
            this.elem.removeChild(save.elem);
        });
        global.saves = [];
        let saves_from_file = JSON.parse(localStorage.getItem('saves'));
        // console.log(saves_from_file);
        for (let key in saves_from_file) {
            global.saves.push(new Save(saves_from_file[key], key, global.save_elem.cloneNode(true), false));
            saves_counter++;
        }
        for (let i = saves_counter; i <= 3; i++) {
            global.saves.push(new Save(null, null, global.save_elem.cloneNode(true), true));
        }
        for (let key in global.saves) {
            this.elem.appendChild(global.saves[key].elem);
        }
        
        global.saves.forEach(save => {
            if (!save.is_new) {
                save.button_to_map.elem.addEventListener('click', async () => {
                    global.save_name = save.save_name;
                    global.save_key = save.save_key;
                    let temp_this_save = JSON.parse(localStorage.getItem('saves'))[global.save_key];

                    if (temp_this_save.last_checkpoint == 'null') {
                        main_to_map(save.save_key, save.save_name);
                    } else {
                        fade_out_element(background);
                        await sleep(duration);

                        global.chapter_number = temp_this_save.last_checkpoint.split(';')[0];
                        let checkpoint_number = temp_this_save.last_checkpoint.split(';')[1];

                        let hash = `save_key=${global.save_key};save_name=${global.save_name};chapter_number=${global.chapter_number};checkpoint_number=${checkpoint_number}`;
                        hash.split(';').forEach(prop => {
                            console.log(prop.split('='));
                        });
                        console.log(hash);
                        location.replace('level-container.html#' + hash);
                    }
                });
            }
        });
    }
}

document.querySelector('.screen#map > .cont.for_mountain img').setAttribute('src', window.electron.get_full_path('files/sprites/main-menu/mountain.png'));
document.querySelector('.screen#map > .cont.for_mountain img').style.visibility = 'visible';
document.querySelector('.screen#map > .cont.for_mountain img').style.opacity = '1';
document.querySelector('.screen#map > .button#to_back img').setAttribute('src', window.electron.get_full_path('files/sprites/main-menu/arrow-back-outline.svg'));
document.querySelector('.screen#map > .button#to_back').style.opacity = '0';

let map_marker = document.querySelector('#map > .cont.for_mountain > .cont.for_markers > .marker');
map_marker.querySelector('img#back').setAttribute('src', window.electron.get_full_path('files/sprites/main-menu/map/marker.png'));
map_marker.parentElement.innerHTML = '';

// class Menu_map extends Screen {
class Menu_map {
    constructor () {
        this.elem = document.querySelector('#map');
        this.width = parseFloat(window.getComputedStyle(this.elem).width);
        this.height = parseFloat(window.getComputedStyle(this.elem).height);
        this.pos_global = {
            x: parseFloat(window.getComputedStyle(this.elem).left),
            y: parseFloat(window.getComputedStyle(this.elem).top),
        }
        // console.log(this.pos_global)
        
        this.mountain = {
            elem: this.elem.querySelector('.cont.for_mountain'),
            img: null,
            markers_container: null
        }
        this.markers = [];
        this.mountain.markers_container = this.mountain.elem.querySelector('.cont.for_markers');
        this.mountain.markers_container.innerHTML = '';
        this.mountain.img = this.mountain.elem.querySelector('img#mountain');
        this.buttons = {
            to_back: this.elem.querySelector('.button#to_back')
        }

        this.buttons.to_back.addEventListener('click', () => {
            if (this.is_active) {
                if (global.menus.chapter_info != null) {
                    if (global.menus.chapter_info.is_active) {
                        this.close_chapter_info_block();
                        this.markers.forEach(marker => {
                            if (marker.is_active) {
                                this.close_marker(marker);
                            }
                        });
                    }
                } else {
                    // this.make_inactive();
                    // global.menus.saves.make_active();
                    map_to_main();
                }
            }
        });

        let curr_save = null;

        let temp_saves = JSON.parse(localStorage.getItem('saves'));
        curr_save = temp_saves[global.save_key];

        global.saves.forEach(save => {
            if (save.save_name == global.save_name) {
                curr_save = save;
            }
        });

        this.markers = [];

        for (let i in curr_save.chapters) {
            let chapter = curr_save.chapters[i];

            // console.log(chapter)

            let new_marker = {
                elem: map_marker.cloneNode(true),
                img_chapter_icon: null,
                count_elem: null,
                number: null,
                is_locked: true,
                is_active: false
            }
            new_marker.img_chapter_icon = new_marker.elem.querySelector('img#chapter_icon');
            // new_marker.img_chapter_icon.style.opacity = '0';
            new_marker.number = parseInt(i) + 1;

            new_marker.count_elem = new_marker.elem.querySelector('p.count');

            new_marker.count_elem.innerHTML = `${new_marker.number}`;
            
            new_marker.is_locked = chapter.is_locked;
            new_marker.elem.id = `marker${(new_marker.number)}`;
            this.mountain.markers_container.appendChild(new_marker.elem);
            this.markers.push(new_marker);
            
            new_marker.elem.addEventListener('click', async () => {
                if (this.is_active) {
                    if (new_marker.is_locked == false) {
                        this.markers.forEach(marker => {
                            if (marker != new_marker) {
                                if (marker.is_active) {
                                    this.close_marker(marker);
                                }
                            }
                        });
                        
                        if (new_marker.is_active) {
                            this.close_marker(new_marker);
                            this.close_chapter_info_block();
                        } else {
                            this.open_marker(new_marker);
                            this.open_chapter_info_block(new_marker.number);
                        }
                    }
                }
            });
        }
    }

    
    async make_active () {
        global.current_menu = 'map';
        this.is_active = true;
        this.elem.scrollIntoView({block: "center", inline: "center", behavior: "smooth"});

        for (let key in this.markers) {
            this.markers[key].elem.style.visibility = 'visible';
            await sleep(250);
            this.markers[key].elem.style.opacity = '1';
        }
        
        this.buttons.to_back.style.top = '50%';
        this.buttons.to_back.style.left = '-50%';
        setTimeout(() => {
            this.buttons.to_back.style.opacity = '1';
            this.buttons.to_back.style.left = '1%';
        }, duration);

    }
    make_inactive () {
        this.is_active = false;
        
        for (let key in this.markers) {
            this.markers[key].elem.style.opacity = '0';
            setTimeout(() => {
                this.markers[key].elem.style.visibility = 'hidden';
            }, duration);
        }
        
        this.buttons.to_back.style.top = '150%';
        this.buttons.to_back.style.opacity = '0';
        setTimeout(() => {
            this.buttons.to_back.style.top = '50%';
            this.buttons.to_back.style.left = '-50%';
        }, duration);
        
    }
    open_chapter_info_block (chapter_number) {
        global.chapter_number = chapter_number;
        global.menus.chapter_info = new Menu_chapter_info_block(global.chapter_number);
        global.menus.chapter_info.make_active();
    }
    close_chapter_info_block () {
        global.chapter_number = null;
        global.menus.chapter_info.make_inactive();
        global.menus.chapter_info = null;
    }
    async open_marker (marker) {
        marker.is_active = true;
        marker.elem.style.height = '150px';
        await sleep(duration);
        // marker.img_chapter_icon.style.opacity = '1';
    }
    async close_marker (marker) {
        marker.is_active = false;
        // marker.img_chapter_icon.style.opacity = '0';
        await sleep(duration);
        marker.elem.style.height = '100px';
    }
}

let slider_point = document.querySelector('#map #chapter_info .point');
let slider_slide = document.querySelector('#map #chapter_info .slider .slide#slide1');
document.querySelector('#map #chapter_info .cont.main .button#prev').setAttribute('src', window.electron.get_full_path('files/sprites/main-menu/chevron-back-outline.svg'));
document.querySelector('#map #chapter_info .cont.main .button#next').setAttribute('src', window.electron.get_full_path('files/sprites/main-menu/chevron-forward-outline.svg'));

document.querySelector('#map #chapter_info .cont.title .berries > img').setAttribute('src', window.electron.get_full_path('files/sprites/main-menu/strawberry.png')); 
document.querySelector('#map #chapter_info .cont.title .deaths > img').setAttribute('src', window.electron.get_full_path('files/sprites/main-menu/skullBlue.png')); 
class Menu_chapter_info_block {
    constructor (chapter_number) {
        this.elem = document.querySelector('#chapter_info');
        this.chapter_number = chapter_number;
        
        this.title = {
            elem: this.elem.querySelector('.cont.title'),
            img_back: null,
            img_chapter_icon: null,
            count_elem: null,
            berries: {
                elem: null,
                img: null,
                p: null
            },
            deaths: {
                elem: null,
                img: null,
                p: null
            }
        }
        this.title.img_back = this.title.elem.querySelector('img#back');
        this.title.img_chapter_icon = this.title.elem.querySelector('img#chapter_icon');
        this.title.count_elem = this.title.elem.querySelector('p.count');


        this.title.berries.elem = this.title.elem.querySelector('.berries');
        this.title.berries.img = this.title.berries.elem.querySelector('img');
        this.title.berries.p = this.title.berries.elem.querySelector('p');
        this.title.deaths.elem = this.title.elem.querySelector('.deaths');
        this.title.deaths.img = this.title.deaths.elem.querySelector('img');
        this.title.deaths.p = this.title.deaths.elem.querySelector('p');
        this.title.img_back.setAttribute('src', window.electron.get_full_path('files/sprites/main-menu/map/info-block/title.png'));
        
        this.main = {
            elem: this.elem.querySelector('.cont.main'),
            img_back: null,
            slider: {
                elem: null,
            },
            points: {
                elem: null,
            }
        }
        this.main.img_back = this.main.elem.querySelector('img#back');
        this.main.slider.elem = this.main.elem.querySelector('.slider');
        this.main.points.elem = this.main.elem.querySelector('.cont.points');
        this.main.img_back.setAttribute('src', window.electron.get_full_path('files/sprites/main-menu/map/info-block/card.png'));

        // this.slides = [];
        this.buttons = {
            slider_prev: this.main.elem.querySelector('.button#prev'),
            slider_next: this.main.elem.querySelector('.button#next'),
            start_play: this.main.elem.querySelector('.button#start')
        }

        this.chapter = JSON.parse(localStorage.getItem('saves'))[global.save_key].chapters[`chapter-${this.chapter_number}`];
        
        this.title.count_elem.innerHTML = `${this.chapter_number}`;

        let berries = this.chapter.berries;
        let berry_counter = 0;
        berries.forEach(berry => {
            if (berry == 1) {
                berry_counter++;
            }
        });
        this.title.berries.p.innerHTML = berry_counter;
        this.title.deaths.p.innerHTML = this.chapter.deaths;

        this.points = {
            elem: this.elem.querySelector('.cont.points'),
            points_container_elem: null,
            slides_container_elem: null,
            array: {
                points: [],
                slides: []
            },
            current_number: 1
        }

        this.points.points_container_elem = this.points.elem.querySelector('.cont');
        this.points.slides_container_elem = this.elem.querySelector('.slider');
        this.points.points_container_elem.innerHTML = '';
        this.points.slides_container_elem.innerHTML = '';

        this.points.current_number = 1;

        for (let i = 0; i < this.chapter.checkpoints.total; i++) {
            // points
            let new_point = slider_point.cloneNode(true);
            new_point.classList = 'point';
            if (i + 1 <= this.chapter.checkpoints.passed) {
                new_point.classList.add('passed');
            }
            this.points.points_container_elem.appendChild(new_point);
            this.points.array.points.push(new_point);

            // slides
            let new_slide = slider_slide.cloneNode(true);
            new_slide.id = `slide${i + 1}`;
            new_slide.querySelector('img.screenshot').setAttribute('src', window.electron.get_full_path(`files/sprites/main-menu/map/info-block/slides/c${global.chapter_number}/${global.chapter_number}.${i + 1}.png`));
            this.points.slides_container_elem.appendChild(new_slide);
            this.points.array.slides.push(new_slide);
        }
        this.points.array.points[0].style.animation = 'animation_fade_in_out 1s infinite';
        this.points.array.points[0].classList.add('passed');
        this.points.array.points[0].classList.add('active');
        this.points.array.slides[0].classList.add('active');

        this.buttons.slider_prev.addEventListener('click', () => {
            if (this.points.current_number - 1 >= 1) {
                if (this.points.array.points[this.points.current_number - 1 - 1].classList.contains('passed')) {
                    this.points.current_number--;
                    this.swap_slide(this.points.current_number - 1);
                }
            }
        });
        this.buttons.slider_next.addEventListener('click', () => {
            if (this.points.current_number + 1 <= this.chapter.checkpoints.total) {
                if (this.points.array.points[this.points.current_number - 1 + 1].classList.contains('passed')) {
                    this.points.current_number++;
                    this.swap_slide(this.points.current_number - 1);
                }
            }
        });

        this.buttons.start_play.addEventListener('click', async () => {
            fade_out_element(background);
            await sleep(duration);
            let hash = `save_key=${global.save_key};save_name=${global.save_name};chapter_number=${global.chapter_number};checkpoint_number=${this.points.current_number}`;
            hash.split(';').forEach(prop => {
                console.log(prop.split('='));
            });
            console.log(hash)
            location.replace('level-container.html#' + hash);
        })
    }

    make_active () {
        global.current_menu = 'chapter_info';
        this.is_active = true;
        this.elem.style.right = '0%';
    }
    make_inactive () {
        this.is_active = false;
        this.elem.style.right = '-50%';
    }
    swap_slide (slide_number) {
        this.points.array.slides.forEach((slide, i) => {
            slide.classList = 'slide';
            if (i <= slide_number) {
                slide.classList.add('active');
            }
        });
        this.points.array.points.forEach((point, i) => {
            point.style.animation = 'none';
            point.classList.remove('active')
            if (i == slide_number) {
                point.style.animation = 'animation_fade_in_out 1s infinite';
                point.classList.add('active');
            }
        });
    }
}


var global = new Global();
global.menus.main = new Menu_main();

window.addEventListener('resize', resize_window);
resize_window();

var screens = [];
screens.push(main);
screens.push(settings);
screens.push(map);
screens.forEach((screen, i) => {
    screens[i] = new Screen_to_set_propesties(screens[i]);
});





// async function test () {
//     await sleep(10);
//     global.menus.main.make_inactive();
//     global.menus.saves = new Menu_saves();
//     global.menus.saves.make_active();

//     global.menus.saves.make_saves();
//     let temp = JSON.parse(localStorage.getItem('saves'));
//     let temp_saves = [];
//     let temp_keys = [];
//     for (let key in temp) {
//         temp_saves.push(temp[key]);
//         temp_keys.push(key)
//     }
//     global.save_name = temp_saves[0].name;
//     global.save_key = temp_keys[0];
//     global.menus.map = new Menu_map();

//     global.menus.saves.make_inactive();
//     global.menus.map.make_active();
// }
// test();





// scroll disabler
document.addEventListener('wheel', (e) => {
    e.preventDefault();
}, {passive: false}); // passive обязателен
document.addEventListener('keydown', (e) => {
    if (
        e.key === "PageUp" || e.key === "PageDown" || e.key === "Home" || e.key === "End" || e.key.includes("Arrow") || e.keyCode == 32 ||
        (e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '0')
        || e.code == 'Tab'
    ) {
        e.preventDefault(); // Отменяем стандартное поведение
    }
});
window.addEventListener('resize', resizeWindow);
resizeWindow();

document.addEventListener('selectstart', function(e) {
    e.preventDefault();
});