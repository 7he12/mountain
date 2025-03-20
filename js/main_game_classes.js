function round_number(num, exp = 2) {
    factor = Math.pow(10, exp);
    return Math.round(num * factor) / factor;
}
function random_number(min, max) {
    return Math.random() * (max - min) + min;
}

function sleep(time_ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, time_ms)
    });
}

async function go_to_main_menu (x, y) {
    close_effect(x, y);
    await sleep(global.duration * 2);
    location.replace(`main-menu.html?t=${new Date().getTime()}`);
}

class Replace_color {
    constructor () {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.image_data = null;
    }
    do (img, colors_from, colors_to, tolerance) {

        if (colors_from.length != colors_to.length) {
            console.error('колво цветов не совпадает', colors_from.length, colors_to.lenght)
            return;
        }

        this.canvas.width = img.width;
        this.canvas.height = img.height;
        this.ctx.drawImage(img, 0, 0);
        this.image_data = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.data = this.image_data.data;

        for (let j = 0; j < colors_from.length; j++) {
            let color_from = colors_from[j];
            let color_to = colors_to[j];
            for (let i = 0; i < this.data.length; i +=4) {
                let r = this.data[i];
                let g = this.data[i + 1];
                let b = this.data[i + 2];
                let a = this.data[i + 3];
                if (
                    Math.abs(r - color_from.r) <= tolerance
                    && Math.abs(g - color_from.g) <= tolerance
                    && Math.abs(b - color_from.b) <= tolerance
                ) {
                    this.data[i] = color_to.r;
                    this.data[i + 1] = color_to.g;
                    this.data[i + 2] = color_to.b;
                }
            }
        }
        this.ctx.putImageData(this.image_data, 0, 0);
        return this.canvas;




        // напиши функцию в которую закидываешь картинку, цвет который нудно поменять, цвет на который нужно поменять, 
        // tolerance и функция возвращает обновлённые картинку и канвас на js
    }
}

function draw (ctx, tile, x, y) {
    ctx.drawImage(tile, x, y);
}

let cont_for_all = document.querySelector('body > .cont');
async function open_effect (x = parseInt(window.getComputedStyle(view_port).width) / 2, y = parseInt(window.getComputedStyle(view_port).height) / 2) {
    cont_for_all.style.transition = `clip-path 0s`;
    cont_for_all.style.clipPath = `circle(0% at ${x}px ${y}px)`;
    await sleep(10);
    cont_for_all.style.transition = `clip-path 0.${duration}s`;
    await sleep(10);
    cont_for_all.style.clipPath = `circle(200% at ${x}px ${y}px)`;
    await sleep(global.duration);
    cont_for_all.style.transition = `clip-path 0s`;
    cont_for_all.style.clipPath = `none`;
}
async function close_effect (x = parseInt(window.getComputedStyle(view_port).width) / 2, y = parseInt(window.getComputedStyle(view_port).height) / 2) {
    cont_for_all.style.transition = `clip-path 0s`;
    cont_for_all.style.clipPath = `circle(200% at ${x}px ${y}px)`;
    await sleep(10);
    cont_for_all.style.transition = `clip-path 0.${duration}s`;
    await sleep(10);
    cont_for_all.style.clipPath = `circle(0% at ${x}px ${y}px)`;
    await sleep(global.duration);
    cont_for_all.style.transition = `clip-path 0s`;
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

function update_bind_elems () {
    for (let action in global.binds) {
        if (document.querySelector(`.${action}`) != null) {
            document.querySelector(`.${action}`).innerHTML = key_map[global.binds[action]]
        }
    }
}

class Global {
    constructor () {
        this.duration = 250;
        this.map = null;
        this.tileset = [];
        this.tileset_bgs = [];
        this.layers = {};
        this.only_animated = [];
        this.is_cutscene_active = false;
        
        this.binds = [];
        
        this.walls = [];
        this.spikes = [];
        this.trampolines = [];
        this.platform_can_go_throw = [];
        this.dashing_spheres = [];
        this.clouds = [];
        this.walls_touched_move = [];
        this.berries = [];
        this.recovery_crystalls = [];
        this.checkpoints = [];
        this.escapes = [];

        this.frames_to_recovery = 200;
        
        
        this.pause_screen_transition = false;

        this.field_step = 0.5
        this.inertia_step = 0.5;
        this.inertia_limit = 2;
        this.inertia_jump = 5;
        this.inertia_dash = 6;
        this.diagonal_inertia_multiplier = 0.9;

        this.update_bind_elems = [];

        this.foot_level = 5;

        this.update_fps(5);
    }

    update_fps (fps) {
        this.fps = fps;
        this.frame_time = round_number(1000 / this.fps, 2)
    }
}

class Screen_level {
    constructor (x, y, width, height, number) {
        this.number = number;
        this.x = x * global.tilewidth;
        this.y = y * global.tileheight;
        this.width = width * global.tilewidth;
        this.height = height * global.tileheight;

        this.center = {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        }
        this.center_point = {
            width: 5,
            height: 5
        }

        this.border_weight = 4;
        // отрисовка центра и краув скрина
        // global.layers['static'].ctx.fillStyle = 'red';
        // global.layers['static'].ctx.fillRect(
        //     this.center.x - this.center_point.width / 2, this.center.y - this.center_point.height / 2, 
        //     this.center_point.width, this.center_point.height
        // );
        // global.layers['static'].ctx.fillRect(this.x, this.y - this.border_weight / 2, this.width, this.border_weight);
        // global.layers['static'].ctx.fillRect(this.x, this.y + this.height - this.border_weight / 2, this.width, this.border_weight);
        // global.layers['static'].ctx.fillRect(this.x - this.border_weight / 2, this.y, this.border_weight, this.height);
        // global.layers['static'].ctx.fillRect(this.x + this.width - this.border_weight / 2, this.y, this.border_weight, this.height);
    }
}

class Obj {
    constructor (tile, cell_x, cell_y, x, y) {
        this.type = ['object'];
        this.tile = tile;
        this.width = this.tile.width;
        this.height = this.tile.height;
        this.cell_x = cell_x;
        this.cell_y = cell_y;
        this.x = x;
        this.y = y;
        this.inertia = { x: 0, y: 0 };
        this.stiked_objects = [];

        this.draw_origin = {
            x: x,
            y: y
        }

        if (typeof this.tile.src == '') {
            console.log('its object', this)
        }
    }

    update_tile_counter () {
    }
}

class Decals extends Obj {
    constructor (tile, cell_x, cell_y) {
        super(tile, cell_x, cell_y, cell_x, cell_y);
        this.x = cell_x * global.tilewidth;
        this.y = cell_y * global.tileheight;
    }
}

class Wall {
    constructor (cell_x, cell_y, x, y, width, height) {
        this.type = ['object', 'wall'];
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.cell_x = cell_x;
        this.cell_y = cell_y;
        this.stiked_objects = [];
        this.inertia = { x: 0, y: 0 };

        // global.layers['static'].ctx.fillStyle = 'red';
        // global.layers['static'].ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Moving_object extends Obj {
    constructor (tile, cell_x, cell_y, x, y) {
        super(tile, cell_x, cell_y, x, y);
        this.type = ['object', 'moving_object'];

        this.x_new = this.x;
        this.y_new = this.y;
        this.translation = { x: 0, y: 0 };

        this.pos = { start: {} };
        this.pos.start = { x: this.x, y: this.y };

        this.draw_origin = {
            x: x,
            y: y
        }
    }

    update_position () {
        this.translation.x = this.x_new - this.x;
        this.translation.y = this.y_new - this.y;
        this.x = this.x_new;
        this.y = this.y_new;

        this.draw_origin.x = this.x;
        this.draw_origin.y = this.y;
    }
    add_inertia (x, y) {
        this.inertia.x += x;
        this.inertia.y += y;
    }
    calc_new_position () {
        this.x_new = this.x + this.field_step * this.inertia.x;
        this.y_new = this.y + this.field_step * this.inertia.y;
    }
    reset_position () {
        this.x_new = this.pos.start.x;
        this.y_new = this.pos.start.y;
        this.update_position();
    }
    
}

class Wall_touched_move extends Moving_object {
    constructor (tile, obj) {
        super(tile, 0, 0, 0, 0);
        this.type.push('touched_move')

        this.stiked_objects = [];
        // console.log(obj);

        this.ids_stiked_objects = obj.properties.filter(v => v.name == "stiked_objects")[0];

        if (this.ids_stiked_objects != undefined) {
            this.ids_stiked_objects = this.ids_stiked_objects.value.split(';').map(parseInt);
            this.stiked_objects = global.spikes.filter(s => this.ids_stiked_objects.includes(s.ID_tiled));
            this.stiked_objects = this.stiked_objects.concat(global.trampolines.filter(t => this.ids_stiked_objects.includes(t.ID_tiled)));
        }



        this.width = obj.width;
        this.height = obj.height;
        this.x = obj.x;
        this.y = obj.y;
        this.draw_origin.x = this.x;
        this.draw_origin.y = this.y;

        // console.log(obj.properties[1]);
        this.properties = {}
        obj.properties.map(prop => this.properties[prop.name] = prop.value);
        this.properties['translate_x'] *= global.tilewidth;
        this.properties['translate_y'] *= global.tileheight;
        
        this.status = 'trigger';
        this.start = { 
            x: this.x,
            y: this.y,
        };
        this.finish = {
            x: this.x + this.properties['translate_x'],
            y: this.y + this.properties['translate_y'],
        }
        this.start_to_finish_diff = {
            x: this.finish.x - this.start.x,
            y: this.finish.y - this.start.y,
        }
        this.percentage_to_finish = 0;

        this.counters = {
            recovery: {
                frame: 0,
                frames_to_recovery: 175,
                frames_to_save_inertia: 25
            }
        }
        
        if (Math.abs(this.start_to_finish_diff.x) >= Math.abs(this.start_to_finish_diff.y)) {
            this.calc_from = 'x';
        } else {
            this.calc_from = 'y';
        }

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        // let scale = global.tileset[51].width / global.tilewidth;

        // this.ctx.drawImage(global.tileset[51], 
        //     0, 0,
        //     this.width * global.tileset[51].width / scale, this.height * global.tileset[51].height / scale,
        //     0, 0,
        //     this.width, this.height
        // );
        
        this.ctx.drawImage(global.tileset[55], 0, 0);
        this.ctx.drawImage(global.tileset[56], this.width - global.tilewidth, 0);
        this.ctx.drawImage(global.tileset[53], 0, this.height - global.tileheight);
        this.ctx.drawImage(global.tileset[54], this.width - global.tilewidth, this.height - global.tileheight);

        if (this.width > global.tilewidth * 2) {
            for (let cell_x = 1; cell_x < this.width / global.tilewidth - 1; cell_x++) {
                this.ctx.drawImage(global.tileset[52], cell_x * global.tilewidth, 0);
                this.ctx.drawImage(global.tileset[57], cell_x * global.tilewidth, this.height - global.tileheight);
            }
        }
        if (this.height > global.tileheight * 2) {
            for (let cell_y = 1; cell_y < this.height / global.tileheight - 1; cell_y++) {
                this.ctx.drawImage(global.tileset[58], 0, cell_y * global.tileheight);
                this.ctx.drawImage(global.tileset[59], this.width - global.tilewidth, cell_y * global.tileheight);
            }
        }
        this.tile = this.canvas;
    }

    reset_counters () {
        this.counters.recovery.frame = 0;
    }
    set_default () {
        this.x_new = this.start.x;
        this.y_new = this.start.y;
        this.reset_counters();
        this.update_position();
        this.stiked_objects.forEach(obj => {
            obj.reset_position();
        });
    }
    calc_new_inertia () {
        if (this.status == 'moving') {
            if (Math.abs(this.inertia[this.calc_from]) < global.inertia_limit * 2) {
                if (this.start_to_finish_diff[this.calc_from] < 0) {
                    this.inertia[this.calc_from] -= global.inertia_step;
                } else {
                    this.inertia[this.calc_from] += global.inertia_step;
                }
            }
        }

        if (this.status == 'recovery') {
            if (this.start_to_finish_diff[this.calc_from] < 0) {
                this.inertia[this.calc_from] = global.inertia_step;
            } else if (this.start_to_finish_diff[this.calc_from] > 0) {
                this.inertia[this.calc_from] = -global.inertia_step;
            }
        }
    }
    calc_new_position () {
        this.inertia.x = round_number(this.inertia.x, 2);
        this.inertia.y = round_number(this.inertia.y, 2);

        if (this.calc_from == 'x') {
            this.x_new = this.x + this.inertia.x * global.field_step;
            this.percentage_to_finish = 100 / this.start_to_finish_diff.x * (this.x_new - this.start.x);
            this.y_new = this.start.y + this.start_to_finish_diff.y / 100 * this.percentage_to_finish;

            this.inertia.y = (this.y_new - this.y) / global.field_step;
        } else if (this.calc_from == 'y') {
            this.y_new = this.y + this.inertia.y * global.field_step;
            this.percentage_to_finish = 100 / this.start_to_finish_diff.y * (this.y_new - this.start.y);
            this.x_new = this.start.x + this.start_to_finish_diff.x / 100 * this.percentage_to_finish;
            
            this.inertia.x = (this.x_new - this.x) / global.field_step;
        }
        
        if (this.status == 'moving') {
            if (this.percentage_to_finish >= 100) {
                this.x_new = this.finish.x;
                this.y_new = this.finish.y;
                this.status = 'on_recovery';
                this.reset_counters();
            }
        } 
        if (this.status == 'recovery') {
            if (this.percentage_to_finish <= 0) {
                this.x_new = this.start.x;
                this.y_new = this.start.y;
                this.status = 'trigger';
            }
        }
    }
    update_tile_counter () {
        if (this.status == 'on_recovery' || this.status == 'recovery') {
            this.counters.recovery.frame++;
            if (this.counters.recovery.frame == this.counters.recovery.frames_to_save_inertia) {
                this.inertia.x = 0;
                this.inertia.y = 0;
                console.log(1)
            }
            if (this.counters.recovery.frame == this.counters.recovery.frames_to_recovery) {
                this.counters.recovery.frame = 0;
                this.status = 'recovery';
            }
        }
        
        this.draw_origin.x = this.x;
        this.draw_origin.y = this.y;
    }
}

class Charachter extends Moving_object {
    constructor (tile, cell_x, cell_y, x, y) {
        super(tile, cell_x, cell_y, x, y);
        this.type.push('charachter')

        this.pressed_keys = [];
        this.last_move_vector = 'r';
        this.to = { up: false, down: false, left: false, right: false };
        this.grounded = false;
        this.is_dashed = false;
        this.is_gravity_active = true;
        this.is_trampoline_jumped = false;
        this.jumped_up_near_wall = false;
        this.frame_trampoline_jumped = 0;
        this.frames_trampoline_jumped = 10;

        this.is_in_dashing_sphere = false;
        
        this.jumps_limit = 1;
        this.jumps = 1;
        this.allow_jump_from_wall = { left: false, right: false };
        this.dashs_limit = 1;
        this.dashs = 1;
        this.unlimited_dashs = false;
        this.is_dashed = false;

        this.inertia_to_jump_add = { x: 0, y: 0 };

        // 20 уже много, управлене на это время забиреться, уажется, что игра не отзывчивая
        // stamina рассчитана по кадрам
        this.stamina_max = 200;
        this.stamina = this.stamina_max;
        this.stamina_step = 1;
        this.stamina_for_jump_while_grabing = this.stamina_max / 5;

        this.stiked_to = null;
        this.grabing_to = null;

        this.actions = [];

        this.counters = {
            stay: {
                frames: 50,
                frame: 0,
                counter: 0
            },
            run: {
                frames: 10,
                frame: 0,
                counter: 0
            },
            dashed: {
                frame: 0,
                frames: 15,
                dash_dont_restore: null
            },
            jump_up_near_wall: {
                frame: 0,
                max: 10
            },
            trampoline_jumped: {
                frame: 0,
                frames: 15
            }
        }
        this.counters.dashed.dash_dont_restore = this.counters.dashed.frames / 2;

        this.is_auto_sprite_active = true;

        this.draw_origin = {
            x: this.x - (this.tile.width - this.width) / 2,
            y: this.y - (this.tile.height - this.height) / 2,
        }
        this.animation_tiles = {
            stay: [],
        }
        this.animation_tiles.stay = global.tileset.filter((tile) => tile.classList.contains("madeline") && tile.classList.contains("stay"));
        this.animation_tiles.run = global.tileset.filter((tile) => tile.classList.contains("madeline") && tile.classList.contains("run"));
    }

    
    add_inertia_from_keyboard () {
        if (this.is_in_dashing_sphere) {
            return;
        }

        if (!this.is_dashed) {
            if (this.to.left) {
                if (this.inertia.x > -1.75) {
                    this.add_inertia(-global.inertia_step, 0);
                }
            }
            if (this.to.right) {
                if (this.inertia.x < 1.75) {
                    this.add_inertia(global.inertia_step, 0);
                }
            }
        }
        if (this.to.down) {
            if (Math.abs(this.inertia.y) < global.inertia_limit) {
                this.add_inertia(0, global.inertia_step);
            }
        }
    }
    calc_new_position () {
        if (this.is_in_dashing_sphere) {
            return;
        }

        this.inertia.x = round_number(this.inertia.x, 2);
        this.inertia.y = round_number(this.inertia.y, 2);

        if (Math.abs(this.inertia.x) < 0.25) {
            this.inertia.x = 0;
        }
        if (Math.abs(this.inertia.y) < 0.25) {
            this.inertia.y = 0;
        }
        
        if (this.grabing) {
            if (!this.is_dashed) {
                this.inertia.x = 0;
                this.inertia.y = 0;
            }
        }

        let field_step = 0.5;
        this.x_new = this.x + field_step * this.inertia.x;
        this.y_new = this.y + field_step * this.inertia.y;
    }
    minus_inertia () {
        if (this.is_in_dashing_sphere) {
            return;
        }

        if (!this.is_gravity_active || this.is_dashed || this.is_trampoline_jumped) {
            if (this.inertia.x < 0) {
                this.add_inertia(0.25, 0);
            }
            if (this.inertia.x > 0) {
                this.add_inertia(-0.25, 0);
            }

            if (this.inertia.y < 0) {
                this.add_inertia(0, 0.25);
            } 
            if (this.inertia.y > 0) {
                this.add_inertia(0, -0.25);
            }
        } else {
            if (this.inertia.x < 0) {
                this.add_inertia(0.25, 0);
            }
            if (this.inertia.x > 0) {
                this.add_inertia(-0.25, 0);
            }
            if (this.inertia.y < global.inertia_limit * 2) {
                this.add_inertia(0, 0.25);
            }
        }
    }
    reset_jumps_dashs_stamina () {
        if (this.is_dashed) {
            if (this.counters.dashed.frame > this.counters.dashed.dash_dont_restore) {
                this.dashs = this.dashs_limit;
            }
        } else {
            this.dashs = this.dashs_limit;
        }
        this.jumps = this.jumps_limit;
        this.stamina = this.stamina_max;
    }
    minus_stamina (stamina = 1) {
        this.stamina -= stamina;
    }
    default_jump () {
        if (this.grabing) {
            this.grabing = false;
            this.jumped_up_near_wall = true;
            this.minus_stamina(this.stamina_for_jump_while_grabing);
            this.inertia.y = -global.inertia_jump;
        } else {
            if (this.grounded) {
                if (this.jumps > 0) {
                    this.jumps--;
                    this.inertia.y = -global.inertia_jump;
                }
            } else {
                if (this.allow_jump_from_wall.left || this.allow_jump_from_wall.right) {
                    this.inertia.y = -global.inertia_jump;
                    if (this.allow_jump_from_wall.left) {
                        this.inertia.x = global.inertia_jump;
                        this.to.left = false;
                    } else if (this.allow_jump_from_wall.right) {
                        this.inertia.x = -global.inertia_jump;
                        this.to.right = false;
                    }
                }
            }
        }
    }
    do_jump () {
        // if (this.stiked_to == null) {
        //     this.default_jump();
        //     return;
        // }
        // if (!this.stiked_to.type.includes('moving_object')) {
        //     this.default_jump();
        // } else {
        //     // хочется прописать что если клавиша зажата по направлению инерции, то прибавляем, если нет, то нет
        //     // Здесь НУЖНО разделять инерцию по направлению, т.к. блок идёт влево, я зажал grab и to.right, и меня всё равно откинуло 
        //     // поэтому здесь нужно обязательно разделять на to.left to.right

        //     if (this.stiked_to.inertia.x != 0 || this.stiked_to.inertia.y != 0) {
        //         if (this.y + this.height == this.stiked_to.y) {
        //             this.inertia.y = -global.inertia_jump;
        //             this.add_inertia(this.stiked_to.inertia.x, 0);
        //             if (this.stiked_to.inertia.y < 0) {
        //                 this.add_inertia(0, this.stiked_to.inertia.y / 2);
        //             }
        //         } else {
        //             // проверка на конфликт направлений
        //             if (
        //                 this.to.up && this.stiked_to.inertia.y > 0 ||
        //                 this.to.down && this.stiked_to.inertia.y < 0 ||
        //                 this.to.left && this.stiked_to.inertia.x > 0 || 
        //                 this.to.right && this.stiked_to.inertia.x < 0 ||
        //                 !this.to.up && !this.to.down && !this.to.left && !this.to.right
        //             ) {
        //                 // здесь типо прсто дефолтный прыжок вверх по стене
        //                 this.default_jump();
        //             } else {
        //                 // если игрок приклеен, но не стоит на блоке значит он grabing
        //                 this.inertia.x = 0;
        //                 this.inertia.y = 0;
        //                 this.grabing = false;
        //                 this.jumped_up_near_wall = true;
        //                 this.minus_stamina(this.stamina_for_jump_while_grabing);

        //                 if (this.stiked_to.inertia.y < 0) {
        //                     // нужно чтобы если прыжок от стены, которая двиг вниз давало достаточно много инерции вниз
        //                     this.inertia.y = -global.inertia_jump;
        //                     console.log('---------------', this.inertia.y)
        //                 }
        //                 if (this.to.up) {
        //                     if (this.stiked_to.inertia.y < 0) {
        //                         this.add_inertia(this.stiked_to.inertia.x, 0);
        //                         this.add_inertia(0, this.stiked_to.inertia.y / 2);
        //                         return;
        //                     }
        //                 }
        //                 if (this.to.down) {
        //                     if (this.stiked_to.inertia.y > 0) {
        //                         this.add_inertia(this.stiked_to.inertia.x, 0);
        //                         this.add_inertia(0, this.stiked_to.inertia.y / 2);
        //                         return;
        //                     }
        //                 }
        //                 if (this.to.left) {
        //                     if (this.stiked_to.inertia.x < 0) {
        //                         this.add_inertia(this.stiked_to.inertia.x, 0);
        //                         this.add_inertia(0, this.stiked_to.inertia.y / 2);
        //                         console.log(this.stiked_to.inertia.y / 2, this.inertia.y)
        //                         return;
        //                     }
        //                 }
        //                 if (this.to.right) {
        //                     if (this.stiked_to.inertia.x > 0) {
        //                         this.add_inertia(this.stiked_to.inertia.x, 0);
        //                         this.add_inertia(0, this.stiked_to.inertia.y / 2);
        //                         return;
        //                     }
        //                 }

        //             }
        //         }
        //     } else {
        //         this.default_jump();
        //     }
        // }
        this.default_jump();

        if (this.add_inertia_to_jump_from_cloud) {
            this.add_inertia(0, -global.inertia_jump / 3);
        }

        if (this.stiked_to != null) {
            if (this.stiked_to.inertia.x != null) {
                this.add_inertia(this.stiked_to.inertia.x * 2, 0);
                if (!this.grabing) {
                    // this.add_inertia(0, this.stiked_to.inertia.y * 2);
                }
                
                if (this.stiked_to.inertia.y < 0) {
                    this.add_inertia(0, this.stiked_to.inertia.y * 0.5);
                }
            }
        }
    }
    do_last_action (action) {
        if (typeof this.actions.at(-1) === 'function') {
            this.actions.at(-1) (this);
        }
    }
    do_dash () {
        if (this.dashs > 0) {
            if (!this.unlimited_dashs) {
                this.dashs--;
            }

            if (this.is_in_dashing_sphere) {
                this.is_in_dashing_sphere = false;
                global.current_screen.Dashing_sphere.forEach(sphere => {
                    if (sphere.object_in == this) {
                        sphere.object_in == null;
                        sphere.blow_up();
                    }
                });
            }
            
            // grabing = false нужен потому, что при grabing == true inertia = 0, чтобы можно было выбрать направление пока grabing
            this.grabing = false;
            this.is_dashed = true;
            this.counters.dashed.frame = 0;
            this.inertia.x = 0;
            this.inertia.y = 0;

            // --- проверить как будет работать с таким порядком
            if (this.to.up && (this.to.left || this.to.right)) {
                this.inertia.y = -global.inertia_dash;
                if (this.to.left) {
                    this.inertia.x = -global.inertia_dash;
                }
                if (this.to.right) {
                    this.inertia.x = global.inertia_dash;
                }
                this.inertia.x *= global.diagonal_inertia_multiplier;
                this.inertia.y *= global.diagonal_inertia_multiplier;
            } 
            else
            if (this.to.down && (this.to.left || this.to.right)) {
                this.inertia.y = global.inertia_dash;
                if (this.to.left) {
                    this.inertia.x = -global.inertia_dash;
                }
                if (this.to.right) {
                    this.inertia.x = global.inertia_dash;
                }
                this.inertia.x *= global.diagonal_inertia_multiplier;
                this.inertia.y *= global.diagonal_inertia_multiplier;
            }
            else
            if (this.pressed_keys.length <= 1) {
                if (this.last_move_vector == 'u') {
                    this.inertia.y = -global.inertia_dash;
                }
                if (this.last_move_vector == 'd') {
                    this.inertia.y = global.inertia_dash;
                }
                if (this.last_move_vector == 'l') {
                    this.inertia.x = -global.inertia_dash;
                }
                if (this.last_move_vector == 'r') {
                    this.inertia.x = global.inertia_dash;
                }
            }
        }
    }
    check_flags () {
        if (this.is_in_dashing_sphere) {
            return;
        }

        this.grounded = false;
        this.grabing = false;
        this.allow_jump_from_wall.left = false;
        this.allow_jump_from_wall.right = false;
        this.stiked_to = null;
        this.grabing_to = null;
        this.add_inertia_to_jump_from_cloud = false;
        // this.inertia_to_jump_add = { x: 0, y: 0 };
        

        global.current_screen.Wall.forEach(wall => {
            if (wall.stiked_objects.includes(this)) {
                wall.stiked_objects.splice(wall.stiked_objects.indexOf(this), 1);
            }

            const is_coliding = this.x <= wall.x + wall.width &&
                                this.x + this.width >= wall.x &&
                                this.y <= wall.y + wall.height &&
                                this.y + this.height >= wall.y;
            // 
            if (is_coliding == false) {
                return;
            }
            let deltaX = (this.x + this.width / 2) - (wall.x + wall.width / 2);
            let deltaY = (this.y + this.height / 2) - (wall.y +  wall.height / 2);
            
            if (this.x + this.width == wall.x || this.x == wall.x + wall.width) {
                if (this.x + this.width == wall.x) {
                    this.allow_jump_from_wall.right = true;
                } else if (this.x == wall.x + wall.width) {
                    this.allow_jump_from_wall.left = true;
                }
                if (this.try_to_grab && this.stamina > 0 && !this.jumped_up_near_wall) {
                    this.minus_stamina();
                    this.grabing = true;
                    this.grabing_to = wall;
                    // console.log('grab')
                    if (!wall.stiked_objects.includes(this)) {
                        wall.stiked_objects.push(this);
                        this.stiked_to = wall;
                    }
                }
            }
        });
        global.current_screen.possible_elements_to_grounded.forEach(floor => {
            if (this.x + this.width > floor.x && this.x < floor.x + floor.width) {
                if (this.y + this.height == floor.y) {
                    this.grounded = true;
                    this.reset_jumps_dashs_stamina();
                    if (!floor.stiked_objects.includes(this)) {
                        floor.stiked_objects.push(this);
                    }
                    this.stiked_to = floor;
                }
            }
        });

        if (this.grabing_to != null) {
            this.stiked_to = this.grabing_to;
        }
        if (this.stiked_to != null) {
            if (this.stiked_to.type.includes('cloud')) {
                if (this.stiked_to.func_x >= 0.435 && this.stiked_to.func_y < 0.515) {
                    this.add_inertia_to_jump_from_cloud = true;
                }
            }
        }
    }
}

class Player extends Charachter {
    constructor (tile, cell_x, cell_y, x, y) {
        super(tile, cell_x, cell_y, x, y);
        this.type.push('player');
        this.tile_canvas = document.createElement('canvas');
        this.tile_ctx = this.tile_canvas.getContext('2d', { willReadFrequently: true });

        this.width = 8;
        this.height = 15;

        this.near_escape = null;
        this.handle_key_down = this.handle_key_down.bind(this);
        this.handle_key_up = this.handle_key_up.bind(this);
        
        this.is_input_active = true;
        this.make_input_active();

        this.current_checkpoint = null;
        
        this.hairs_color = {
            from: [
                { r: 171, g: 60, b: 61 },
                { r: 92, g: 37, b: 41 }
            ],
            to: [
                { r: 75, g: 188, b: 255 },
                { r: 40, g: 103, b: 145 }
            ]
        }

        this.look_at = 'right';
    }
    
    update_position () {
        this.translation.x = this.x_new - this.x;
        this.translation.y = this.y_new - this.y;
        this.x = this.x_new;
        this.y = this.y_new;

        // global.layers['animated'].ctx.fillStyle = 'red';
        // global.layers['animated'].ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    make_input_active () {
        this.is_input_active = true;
        document.addEventListener('keydown', this.handle_key_down);
        document.addEventListener('keyup', this.handle_key_up);
    }
    make_input_inactive () {
        this.is_input_active = false;
        document.removeEventListener('keydown', this.handle_key_down);
        document.removeEventListener('keyup', this.handle_key_up);
    }
    async die () {
        global.pause_screen_transition = true;
        close_effect(this.x + this.width / 2 - global.current_screen.screen.x, this.y + this.height / 2 - global.current_screen.screen.y);

        await sleep(global.duration);
        check_screen_transition(this)
        this.inertia.x = 0;
        this.inertia.y = 0;
        
        this.x = this.current_checkpoint.x;
        this.y = this.current_checkpoint.y;
        this.x_new = this.x;
        this.y_new = this.y;

        this.reset_jumps_dashs_stamina();
        this.dashs = this.dashs_limit;
        this.update_position();
        global.current_screen.update_objects(global.current_screen.screen.number);
        
        global.pause_screen_transition = false;
        await sleep(global.duration * 5);
        open_effect(this.x + this.width / 2 - global.current_screen.screen.x, this.y + this.height / 2 - global.current_screen.screen.y);

        global.save.chapters['chapter-' + global.chapter_number].deaths++;
        let temp_saves = JSON.parse(localStorage.getItem('saves'));
        temp_saves[global.save_key] = global.save;
        localStorage.setItem('saves', JSON.stringify(temp_saves));
    }
    handle_key_down (e) {
        if (global.is_cutscene_active == true) {
            return;
        }
        if (e.code == global.binds.up) {
            this.to.up = true;
            if (!this.pressed_keys.includes('u')) {
                this.pressed_keys.push('u');
            }
        }
        if (e.code == global.binds.down) {
            this.to.down = true;
            if (!this.pressed_keys.includes('d')) {
                this.pressed_keys.push('d');
            }
        }
        if (e.code == global.binds.left) {
            this.to.left = true;
            if (!this.pressed_keys.includes('l')) {
                this.pressed_keys.push('l');
            }
        }
        if (e.code == global.binds.right) {
            this.to.right = true;
            if (!this.pressed_keys.includes('r')) {
                this.pressed_keys.push('r');
            }
        }
        if (this.pressed_keys.length != 0) {
            this.last_move_vector = this.pressed_keys.at(-1);
        }
        if (e.code == global.binds.grab) {
            this.try_to_grab = true;
        }
        if (global.pause_screen_transition == false && pause_menu.is_active == false) {
            if (e.code == global.binds.jump) {
                this.do_jump();
            }
            if (e.code == global.binds.dash) {
                this.do_dash();
            }
            if (e.code == global.binds.action) {
                this.do_last_action();
            }
        }
    }
    handle_key_up (e) {
        if (e.code == global.binds.up) {
            this.to.up = false;
            this.pressed_keys = this.pressed_keys.filter((key_name) => key_name != 'u');
        }
        if (e.code == global.binds.down) {
            this.to.down = false;
            this.pressed_keys = this.pressed_keys.filter((key_name) => key_name != 'd');
        }
        if (e.code == global.binds.left) {
            this.to.left = false;
            this.pressed_keys = this.pressed_keys.filter((key_name) => key_name != 'l');
        }
        if (e.code == global.binds.right) {
            this.to.right = false;
            this.pressed_keys = this.pressed_keys.filter((key_name) => key_name != 'r');
        }
        if (e.code == global.binds.grab) {
            this.try_to_grab = false;
            this.grabing = false;
        }
        if (global.pause_screen_transition == false && pause_menu.pause == false) {
            if (e.code == global.binds.jump) {
                this.already_jumped = false;
            }
        }
    }
    
    reset_frame_counters () {
        // сброс кадров и sprite_counter
        this.counters.stay.frame = this.counters.stay.frames - 1;
        this.counters.stay.counter = 0;
        this.counters.run.frame = this.counters.run.frames - 1;
        this.counters.run.counter = 0;
    }
    update_tile_counter (tile_code) {
        // counters 
        if (this.jumped_up_near_wall) {
            this.counters.jump_up_near_wall.frame++;
            if (this.counters.jump_up_near_wall.frame == this.counters.jump_up_near_wall.max) {
                this.counters.jump_up_near_wall.frame = 0;
                this.jumped_up_near_wall = false;
            }
        }
        if (this.is_dashed) {
            this.counters.dashed.frame++;
            if (this.counters.dashed.frame == this.counters.dashed.frames) {
                this.counters.dashed.frame = 0;
                this.is_dashed = false;
            }
        }
        if (this.is_trampoline_jumped) {
            this.counters.trampoline_jumped.frame++;
            if (this.counters.trampoline_jumped.frame == this.counters.trampoline_jumped.frames) {
                this.counters.trampoline_jumped.frame = 0;
                this.is_trampoline_jumped = false;
            }
        }
        

        
        if (this.is_dashed) {
            this.tile = global.tileset.filter(tile => tile.classList.contains('madeline') && tile.classList.contains('dash')).at(-1);
            this.reset_frame_counters();
        } else {
            if (this.grabing) {
                this.tile = global.tileset.filter(tile => tile.classList.contains('madeline') && tile.classList.contains('grab'))[0];
                this.reset_frame_counters();
            } else {
                if (this.grounded) {
                    if (this.inertia.x == 0) {
                        // stay
                        this.counters.stay.frame++;
                        if (this.counters.stay.frame == this.counters.stay.frames) {
                            this.counters.stay.frame = 0;
                            this.counters.stay.counter++;
                            this.tile = this.animation_tiles.stay[this.counters.stay.counter % this.animation_tiles.stay.length];
                        }
                    } else if (this.inertia.x != 0) {
                        // run
                        this.counters.run.frame++;
                        if (this.counters.run.frame == this.counters.run.frames) {
                            this.counters.run.frame = 0;
                            this.counters.run.counter++;
                            this.tile = this.animation_tiles.run[this.counters.run.counter % this.animation_tiles.run.length];
                        }
                    }
                } else {
                    if (this.jumped_up_near_wall) {
                        this.tile = global.tileset.filter(tile => tile.classList.contains('madeline') && tile.classList.contains('jump_while_grab'))[0];
                    } else
                    if (this.allow_jump_from_wall.left || this.allow_jump_from_wall.right) {
                        this.tile = global.tileset.filter(tile => tile.classList.contains('madeline') && tile.classList.contains('grab'))[0];
                    } else
                    if (this.inertia.y > 0) {
                        this.tile = global.tileset.filter(tile => tile.classList.contains('madeline') && tile.classList.contains('fall')).at(-1);
                    } else {
                        this.tile = global.tileset.filter(tile => tile.classList.contains('madeline') && tile.classList.contains('fall')).at(0);
                    }
                }
            }
        }
        
        this.tile_canvas.width = this.tile.width;
        this.tile_canvas.height = this.tile.height;
        
        let player_sprite = this.tile;
        if (this.dashs == 0) {
            player_sprite = replace_color.do(
                this.tile,
                this.hairs_color.from,
                this.hairs_color.to,
                2
            );
        }
        
        this.tile_ctx.clearRect(0, 0, this.width, this.height);
        
        this.update_draw_origin();
        if (this.is_in_dashing_sphere) {
            return;
        }

        // if (!this.grabing) {
        //     if (this.inertia.x < 0 || this.last_move_vector == 'l') {
        //         this.tile_ctx.scale(-1, 1);
        //         this.tile_ctx.drawImage(player_sprite, -this.tile_canvas.width, 0);
        //     } else {
        //         this.tile_ctx.scale(1, 1);
        //         this.tile_ctx.drawImage(player_sprite, 0, 0);
        //     }
        // } else {
        //     if (this.allow_jump_from_wall.left) {
        //         this.tile_ctx.scale(-1, 1);
        //         this.tile_ctx.drawImage(player_sprite, -this.tile_canvas.width, 0);
        //     } else if (this.allow_jump_from_wall.right) {
        //         this.tile_ctx.scale(1, 1);
        //         this.tile_ctx.drawImage(player_sprite, 0, 0);
        //     }
        // }
        
        this.look_at = 'right';
        
        if (this.inertia.x < 0 || this.last_move_vector == 'l') {
            this.look_at = 'left';
        } else {
            this.look_at = 'right';
        }

        if (this.allow_jump_from_wall.left) {
            this.look_at = 'left';
        } else if (this.allow_jump_from_wall.right) {
            this.look_at = 'right';
        }
        
        if (this.grabing) {
            if (this.allow_jump_from_wall.left) {
                this.look_at = 'left';
            } else if (this.allow_jump_from_wall.right) {
                this.look_at = 'right';
            }
        }

        if (this.look_at == 'left') {
            this.tile_ctx.scale(-1, 1);
            this.tile_ctx.drawImage(player_sprite, -this.tile_canvas.width, 0);
        } else if (this.look_at == 'right') {
            this.tile_ctx.scale(1, 1);
            this.tile_ctx.drawImage(player_sprite, 0, 0);
        }
    }
    update_draw_origin () {
        this.draw_origin.y = this.y + this.height - this.tile.height;
        if (this.look_at == 'right') {
            this.draw_origin.x = this.x + (this.width - this.tile.width) / 2 - 0.5;
        } else if (this.look_at == 'left') {
            this.draw_origin.x = this.x + (this.width - this.tile.width) / 2 + 0.5;
        }
    }
}

class Berry extends Obj {
    constructor (tile, cell_x, cell_y, x, y, number) {
        super(tile, cell_x, cell_y, x, y);

        this.number = number;

        this.animation_tiles = global.tileset.filter((tile) => tile.classList.contains("berry"));
        this.tile_counter = {
            counter: 0,
            frames_to_update: 15,
            frame_to_update: 0
        }

        this.is_collected = false;
    }
    
    update_tile_counter () {
        if (this.is_collected) {
            return;
        }
        this.tile_counter.frame_to_update++;
        if (this.tile_counter.frame_to_update == this.tile_counter.frames_to_update) {
            this.tile_counter.frame_to_update = 0;
            this.tile_counter.counter++;
            this.tile = this.animation_tiles[this.tile_counter.counter % this.animation_tiles.length];
            if (this.tile.classList.contains('collected')) {
                this.tile_counter.counter++;
                this.tile = this.animation_tiles[this.tile_counter.counter % this.animation_tiles.length];
            }
        }
    }
    set_collected () {
        // console.log(global.save.chapters['chapter-' + global.chapter_number].berries);
        // console.log(global.save.chapters['chapter-' + global.chapter_number].berries[this.number - 1]);
        global.save.chapters['chapter-' + global.chapter_number].berries[this.number - 1] = 1;
        let temp_saves = JSON.parse(localStorage.getItem('saves'));
        temp_saves[global.save_key] = global.save;
        localStorage.setItem('saves', JSON.stringify(temp_saves));
    }
}

class Recovery_crystall extends Obj {
    constructor (tile, cell_x, cell_y, x, y) {
        super(tile, cell_x, cell_y, x, y);

        this.animation_tiles = global.tileset.filter((tile) => tile.classList.contains("recovery_crystall"));
        
        this.collected = false;

        this.counters = {
            update_tile: {
                counter: 0,
                frames_to_update: 15,
                frame_to_update: 0
            },
            collected: {
                frame: 0,
                frames_to_recovery: global.frames_to_recovery
            }
        }
    }

    reset_counters () {
        this.collected = false;
        this.counters.update_tile.frame = 0;
        this.counters.update_tile.counter = 0;
        this.counters.collected.frame = 0;
    }
    set_default () {
        this.reset_counters();
    }
    update_tile_counter () {
        if (this.collected) {
            this.tile = this.animation_tiles.filter(tile => tile.classList.contains('collected')).at(-1);
            this.counters.collected.frame++;
            if (this.counters.collected.frame == this.counters.collected.frames_to_recovery) {
                this.counters.collected.frame = 0;
                this.collected = false;
            }
            return;
        }
        this.counters.update_tile.frame_to_update++;
        if (this.counters.update_tile.frame_to_update == this.counters.update_tile.frames_to_update) {
            this.counters.update_tile.frame_to_update = 0;
            this.counters.update_tile.counter++;
            this.tile = this.animation_tiles[this.counters.update_tile.counter % this.animation_tiles.length];

            if (this.tile.classList.contains('collected')) {
                this.counters.update_tile.counter++;
                this.tile = this.animation_tiles[this.counters.update_tile.counter % this.animation_tiles.length];
            }
        }
    }
}

class Danger extends Moving_object {
    constructor (tile, obj) {
        super(tile, obj.x, obj.y, obj.x, obj.y);
        
        this.ID_tiled = obj.id;

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }
}

class Spike extends Danger {
    constructor (tile, obj, direction) {
        super(tile, obj);

        this.x = obj.x;
        this.y = obj.y;
        this.width = obj.width;
        this.height = obj.height;
        this.direction = direction;
        
        if (this.direction == 'up' || this.direction == 'down') {
            for (let x = 0; x < this.width; x += global.tilewidth) {
                this.ctx.drawImage(this.tile, x, 0)
            }
        }
        if (this.direction == 'left' || this.direction == 'right') {
            for (let y = 0; y < this.height; y += global.tileheight) {
                this.ctx.drawImage(this.tile, 0, y)
            }
        }
        this.tile = this.canvas;
    }
}

class Trampoline extends Moving_object {
    constructor (tile, obj, direction) {
        super(tile, obj.x, obj.y, obj.x, obj.y);
        
        this.ID_tiled = obj.id;

        this.x = obj.x;
        this.y = obj.y;
        this.width = obj.width;
        this.height = obj.height;
        this.direction = direction;
        this.is_triggered = false;

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = global.tilewidth;
        this.canvas.height = global.tileheight;

        this.temp_animation_tiles = global.tileset.filter((tile) => tile.classList.contains("trampoline"));
        let temp = [];
        temp.push(this.temp_animation_tiles[1]);
        temp.push(this.temp_animation_tiles[2]);
        temp.push(this.temp_animation_tiles[3]);
        temp.push(this.temp_animation_tiles[4]);
        temp.push(this.temp_animation_tiles[0]);
        this.animation_tiles = [];
        this.animation_tiles.push(temp[0]);
        this.animation_tiles.push(temp[2]);
        this.animation_tiles.push(temp[4]);
        this.animation_tiles.push(temp[2]);
        this.animation_tiles.push(temp[3]);
        this.animation_tiles.push(temp[2]);
        this.animation_tiles.push(temp[1]);
        this.counters = {
            update_tile: {
                counter: 0,
                frames: 7,
                frame: 0
            }
        }
        this.reset_counter();

        this.adding_inertia = {
            x: 0,
            y: 0
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        if (this.direction == 'up') {
            this.adding_inertia.y = -global.inertia_dash;
            this.draw_origin.y = this.y - this.canvas.height / 2;
            this.ctx.translate(0, 0);
            this.ctx.drawImage(this.tile, 0, 0);
        }
        if (this.direction == 'down') {
            this.adding_inertia.y = global.inertia_dash;
            this.ctx.translate(0, 0);
            this.ctx.scale(1, -1);
            this.ctx.drawImage(this.tile, 0, -this.canvas.height);
        }
        if (this.direction == 'right') {
            this.adding_inertia.x = global.inertia_dash;
            this.ctx.translate(this.canvas.width / 2, - this.height / 2);
            this.ctx.rotate(90 * Math.PI / 180);
            this.ctx.drawImage(this.tile, this.canvas.width / 2, -this.canvas.height / 2);
        }
        if (this.direction == 'left') {
            this.adding_inertia.x = -global.inertia_dash;
            this.draw_origin.x = this.x - this.canvas.width / 2;
            this.ctx.scale(-1, 1);
            this.ctx.translate(0, - this.height / 2);
            this.ctx.rotate(90 * Math.PI / 180);
            this.ctx.drawImage(this.tile, this.canvas.width / 2, 0);
        }
        this.ctx.restore();
        this.tile = this.canvas;
    }

    reset_counter () {
        this.is_triggered = false;
        this.counters.update_tile.frame = this.counters.update_tile.frames - 1;
        this.counters.update_tile.counter = 0;
    }
    update_tile_counter () {
        if (this.is_triggered) {
            this.counters.update_tile.frame++;
            if (this.counters.update_tile.frame == this.counters.update_tile.frames) {
                this.counters.update_tile.frame = 0;
                this.counters.update_tile.counter++;
                this.tile = this.animation_tiles[this.counters.update_tile.counter % this.animation_tiles.length];
    
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.save();
                if (this.direction == 'up') {
                    this.draw_origin.y = this.y - this.canvas.height / 2;
                    this.ctx.translate(0, 0);
                    this.ctx.drawImage(this.tile, 0, 0);
                }
                if (this.direction == 'down') {
                    this.ctx.translate(0, 0);
                    this.ctx.scale(1, -1);
                    this.ctx.drawImage(this.tile, 0, -this.canvas.height);
                }
                if (this.direction == 'right') {
                    this.ctx.translate(this.canvas.width / 2, - this.height / 2);
                    this.ctx.rotate(90 * Math.PI / 180);
                    this.ctx.drawImage(this.tile, this.canvas.width / 2, -this.canvas.height / 2);
                }
                if (this.direction == 'left') {
                    this.draw_origin.x = this.x - this.canvas.width / 2;
                    this.ctx.scale(-1, 1);
                    this.ctx.translate(0, - this.height / 2);
                    this.ctx.rotate(90 * Math.PI / 180);
                    this.ctx.drawImage(this.tile, this.canvas.width / 2, 0);
                }
                this.ctx.restore();
                this.tile = this.canvas;

            }
            if (this.counters.update_tile.counter == this.animation_tiles.length) {
                this.reset_counter();
            }
        }
    }
}

class Platform_can_go_throw extends Moving_object {
    constructor (tile, obj, direction) {
        super(tile, obj.x, obj.y, obj.x, obj.y);
        this.type.push('platform_can_go_throw');

        this.x = obj.x;
        this.y = obj.y;
        this.width = obj.width;
        this.height = obj.height;
        this.direction = direction;

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.angle = 0;

        this.temp_canvas = document.createElement('canvas');
        this.temp_ctx = this.temp_canvas.getContext('2d');
        this.temp_canvas.width = Math.max(this.canvas.width, this.canvas.height);
        this.temp_canvas.height = Math.min(this.canvas.width, this.canvas.height);

        if (this.width == global.tilewidth) {
            this.tile = global.tileset.filter(tile => tile.classList.contains('platform_can_go_throw'))[2];
        } else {
            this.temp_ctx.drawImage(this.tile, 0, 0);
            
            for (let w = 1; w < this.temp_canvas.width / global.tilewidth - 1; w++) {
                this.temp_ctx.drawImage(global.tileset.filter(tile => tile.classList.contains('platform_can_go_throw'))[2], w * global.tilewidth, 0);
            }
            this.temp_ctx.save();
            this.temp_ctx.scale(-1, 1);
            this.temp_ctx.drawImage(global.tileset.filter(tile => tile.classList.contains('platform_can_go_throw'))[1], -this.temp_canvas.width, 0);
            this.temp_ctx.restore();
        }
        
        this.ctx.save();
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        
        if (this.direction == 'up') {
            this.angle = 0;
        } else 
        if (this.direction == 'down') {
            this.angle = 180;
        } else 
        if (this.direction == 'right') {
            this.angle = 90; 
        } else 
        if (this.direction == 'left') {
            this.angle = -90; 
        }
        this.angle = this.angle * (Math.PI / 180);
        this.ctx.rotate(this.angle);

        if (this.direction == 'up' || this.direction == 'down') {
            this.ctx.drawImage(this.temp_canvas, -this.canvas.width / 2, -this.canvas.height / 2);

        }
        if (this.direction == 'left' || this.direction == 'right') {
            this.ctx.drawImage(this.temp_canvas, -this.canvas.height / 2, -this.canvas.width / 2);

        }
        this.ctx.restore();
        
        this.tile = this.canvas;
    }
}

class Cloud extends Moving_object {
    constructor (tile, obj) {
        super(tile, obj.x, obj.y, obj.x, obj.y);
        this.type.push('cloud')

        this.width = obj.width + global.tilewidth / 2;
        this.height = obj.height;
        this.x = Math.floor(obj.x + global.tilewidth / 2 - this.width / 2);
        this.y = obj.y;

        this.func_x = 0;
        this.inertia = { y: 0 };
        this.is_triggered = false;

        this.pos = {
            start: {
                x: obj.x,
                y: obj.y
            }
        }
        this.inertia = { x: 0, y: 0 };

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = this.tile.width * 2;
        this.canvas.height = this.tile.height * 2;
        
        this.draw_origin = { x: this.x - Math.ceil((this.canvas.width - this.width) / 2), y: this.y };

        this.tile_orig = new Image();
        this.tile_orig.src = this.tile.src;
    }

    update_position () {
        this.translation.x = this.x_new - this.x;
        this.translation.y = this.y_new - this.y;
        this.x = this.x_new;
        this.y = this.y_new;
    }
    update_tile_counter () {
        this.func_y = 0;
        let border_1 = 1 / 3;
        let border_2 = 2 / 3;
        
        let x = 0;
        let y = 0;
        
        if (this.is_triggered) {
            this.func_x += 0.01;
            this.func_x = round_number(this.func_x, 2);

            if (this.func_x <= 0.379) {
                x = this.func_x;

                let a = 9.9;
                let b = -3;
                let c = 0;

                y = a * x ** 2 + b * x + c;
            } else
            if (this.func_x > 0.379 && this.func_x <= 0.65) {
                x = this.func_x;

                let a = -20;
                let b = 21;
                let c = -4.8;

                y = a * x ** 2 + b * x + c;
            } else 
            if (this.func_x > 0.65 && this.func_x <= 1) {
                x = this.func_x;

                // y = (x + 0.494) ** (-10 * x) - 0.0175;
                // y = -1 * ( Math.sin((1.7 * (x - 0.41)) * Math.PI / 2) ) + 1;
                // y = -1.15 * (x - 1);

                let a = 1.8;
                let b = 1.058
                let c = -0.14

                y = (a * x - a * b) ** 2 + c;
            }
            y *= -1;

            this.func_y = round_number(y, 2) * 30;

            if (this.func_x == 0.85) {
                this.func_x = 0;
                this.y = this.pos.start.y;
                this.is_triggered = false;
            }
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // this.ctx.fillStyle = 'green';
        // this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();

        this.y_new = this.pos.start.y + this.func_y;

        let scale = 1;

        if (
            this.func_x > 0.15
            && this.func_x < 0.65
        ) {
            // console.log(this.func_x, this.func_y)
        }
        // scale = Math.abs(this.func_y);

        this.ctx.setTransform(scale, 0, 0, 1, this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.drawImage(this.tile_orig, -this.tile_orig.width / 2, -this.tile_orig.height / 2 + 0.5);

        this.ctx.restore();
        
        this.update_position();
        this.draw_origin.y = this.y - this.canvas.height / 2 + this.tile_orig.height / 6 + 0.25
        this.tile = this.canvas;
    }
}

class Dashing_sphere extends Moving_object {
    constructor (tile, obj) {
        super(tile, obj.x, obj.y, obj.x, obj.y);
        this.type.push('dashing_sphere');

        this.width = obj.width;
        this.height = obj.height;
        this.x = obj.x;
        this.y = obj.y;

        this.tile = tile;
        this.status = 'trigger';
        this.tile_on_recovery = global.tileset.filter(tile => tile.classList.contains('dashing_sphere') && tile.classList.contains('outline'))[0];

        this.tile_orig = new Image();
        this.tile_orig.src = this.tile.src;

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = this.width * 1.6;
        this.canvas.height = this.height * 1.6;

        this.pos = {
            start: {
                x: obj.x,
                y: obj.y
            }
        }
        this.distance_from_start_max = 45;
        this.distance_from_start = 0;

        this.counters = {
            trigger: {
                counter: 0,
                frame: 0,
                frames: 25
            },
            listen_to_direction: {
                frame: 0,
                frames: 50
            },
            moving: {
                counter: 0,
                frame: 0,
                frames: 8
            },
            recovery: {
                frame: 0,
                frames: global.frames_to_recovery
            },
        }

        this.direction = { x: 0, y: 0 };

        this.draw_origin.x = obj.x - (this.canvas.width - global.tilewidth) / 2;
        this.draw_origin.y = obj.y - (this.canvas.height - global.tileheight) / 2;

        this.object_in = null;

        this.check_collisia_with = [
            'Wall',
            'Spike',
        ]
    }

    reset_counters () {
        this.status = 'trigger'
        this.counters.trigger.frame = 0;
        this.counters.trigger.counter = 0;
        
        this.counters.listen_to_direction.frame = 0;
        
        this.counters.moving.frame = 0;
        this.counters.moving.counter = 0;
        
        this.counters.recovery.frame = 0;
    }
    set_default () {
        this.x_new = this.pos.start.x;
        this.y_new = this.pos.start.y;
        this.reset_counters();
        this.update_position();
    }
    blow_up () {
        this.status = 'recovery';
        if (this.object_in != null) {
            this.object_in.is_in_dashing_sphere = false;

            this.object_in.inertia.x = this.inertia.x * 1.8;
            this.object_in.inertia.y = this.inertia.y * 1.8;
            if (this.direction.x != 0 && this.direction.y != 0) {
                this.object_in.inertia.x *= global.diagonal_inertia_multiplier;
                this.object_in.inertia.y *= global.diagonal_inertia_multiplier;
            }
            this.object_in.reset_jumps_dashs_stamina();
            this.object_in.dashs = this.object_in.dashs_limit;
            this.object_in = null;
        }
        this.direction.x = 0;
        this.direction.y = 0;
        this.x_new = this.pos.start.x;
        this.y_new = this.pos.start.y;
        this.update_position();
    }
    update_tile_counter () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);

        if (this.status == 'trigger') {
            this.counters.trigger.frame++;
            if (this.counters.trigger.frame == this.counters.trigger.frames) {
                this.counters.trigger.frame = 0;
                this.counters.trigger.counter++;
            }
            this.angle = 15 * this.counters.trigger.counter;
        }

        if (this.status == 'listen_to_direction') {
            this.counters.listen_to_direction.frame++;
            if (this.counters.listen_to_direction.frame == this.counters.listen_to_direction.frames) {
                if (player.pressed_keys.length <= 1) {
                    if (player.last_move_vector == 'u') {
                        this.direction.y = -1;
                    }
                    if (player.last_move_vector == 'd') {
                        this.direction.y = 1;
                    }
                    if (player.last_move_vector == 'l') {
                        this.direction.x = -1;
                    }
                    if (player.last_move_vector == 'r') {
                        this.direction.x = 1;
                    }
                } else {
                    if (player.pressed_keys.includes('u') && player.pressed_keys.includes('d')) {
                        if (player.pressed_keys.indexOf('u') > player.pressed_keys.indexOf('d')) {
                            this.direction.y = -1;
                        } else {
                            this.direction.y = 1;
                        }
                    } else {
                        if (player.pressed_keys.includes('u')) {
                            this.direction.y = -1;
                        }
                        if (player.pressed_keys.includes('d')) {
                            this.direction.y = 1;
                        }
                    }
                    if (player.pressed_keys.includes('l') && player.pressed_keys.includes('r')) {
                        if (player.pressed_keys.indexOf('l') > player.pressed_keys.indexOf('r')) {
                            this.direction.x = -1;
                        } else {
                            this.direction.x = 1;
                        }
                    } else {
                        if (player.pressed_keys.includes('l')) {
                            this.direction.x = -1;
                        }
                        if (player.pressed_keys.includes('r')) {
                            this.direction.x = 1;
                        }
                    }
                }
                this.status = 'moving';
                this.inertia.x = 4 * this.direction.x;
                this.inertia.y = 4 * this.direction.y;
            }
            this.angle = 0;
        }

        if (this.status == 'moving') {
            this.counters.moving.frame++;
            if (this.counters.moving.frame == this.counters.moving.frames) {
                this.counters.moving.frame = 0;
                this.counters.moving.counter++;
            }
            this.angle = 15 * this.counters.moving.counter;
            this.x_new = this.x + this.inertia.x * global.field_step;
            this.y_new = this.y + this.inertia.y * global.field_step;
            this.distance_from_start = Math.sqrt((this.x_new - this.pos.start.x) ** 2 + (this.y_new - this.pos.start.y) ** 2);

            if (this.distance_from_start >= this.distance_from_start_max) {
                this.blow_up();
            }

            for (let object_name of this.check_collisia_with) {
                global.current_screen[object_name].forEach(wall => {
                    check_collisia_wall(this, wall, this.blow_up.bind(this));
                });
            }
            this.update_position();
        }
        
        if (this.status == 'recovery') {
            this.counters.recovery.frame++;
            if (this.counters.recovery.frame == this.counters.recovery.frames) {
                this.status = 'trigger';
                this.reset_counters();
            }
        }

        this.angle = (this.angle + 5) * (Math.PI / 180);
        
        if (this.status != 'recovery') {
            this.ctx.rotate(this.angle);
            this.ctx.drawImage(this.tile_orig, -this.tile_orig.width / 2, -this.tile_orig.height / 2);
        } else {
            this.ctx.drawImage(this.tile_on_recovery, -this.tile_orig.width / 2, -this.tile_orig.height / 2);
        }
        this.ctx.restore();

        this.draw_origin.x = this.x - (this.canvas.width - global.tilewidth) / 2;
        this.draw_origin.y = this.y - (this.canvas.height - global.tileheight) / 2;
        this.tile = this.canvas;

        if (this.object_in != null) {
            this.object_in.x_new = this.x + this.width / 2 - this.object_in.width / 2;
            this.object_in.y_new = this.y + this.height / 2 - this.object_in.height / 2
            this.object_in.update_position();
            this.object_in.update_draw_origin();
        }
    }
}

class Checkpoint extends Obj {
    constructor (tile, cell_x, cell_y, x, y, number) {
        super(tile, cell_x, cell_y, x, y);

        this.number = parseInt(number);
    }
}

class Escape extends Obj {
    constructor (tile, obj) {
        super(tile, obj.x, obj.y, obj.x, obj.y);
        this.x = obj.x;
        this.y = obj.y;
        this.width = obj.width;
        this.height = obj.height;
        
        this.is_active = false;
        this.is_hover = true;
        this.is_triggered = false;

        this.elem = document.createElement('div');
        this.elem.classList.add('escape_window');
        this.elem.style.left = this.x + this.width / 2 + 'px';
        this.elem.style.top = this.y + this.height / 2 + 'px';
        fade_out_element(this.elem);
        document.querySelector('.cont #for_canvases').appendChild(this.elem);

        this.bind_elem = document.createElement('div');
        this.bind_elem.classList.add('guide_bind');
        this.bind_elem.classList.add('action');
        this.bind_elem.style.top = 45 + 'px';
        this.bind_elem.style.left = '50%';
        this.bind_elem.innerHTML = 'F';
        this.elem.appendChild(this.bind_elem);

        global.update_bind_elems.push(this.bind_elem)

        update_bind_elems();
        
        this.pos = {
            start: {
                x: 0,
                y: 0
            },
            finish: {
                x: 0,
                y: -75
            }
        }

        this.action = this.go_sleep.bind(this);
        this.make_active.bind(this);
    }

    make_active () {
        this.is_active = true;
        this.is_hover = true;
        this.elem.style.top = (this.y + this.pos.finish.y) + 'px';
        fade_in_element(this.elem);
    }
    async go_sleep () {
        player.make_input_inactive();
        global.is_cutscene_active = true;
        
        this.is_triggered = false;
        this.elem.style.top = (this.y + this.pos.start.y) + 'px';
        fade_out_element(this.elem);

        this.tiles = [];
        this.tiles = global.tileset.filter(tile => tile.classList.contains('madeline') && tile.classList.contains('to_sleep'));

        await sleep(global.duration * 2);
        let player_sprite = this.tiles[0];
        player.draw_origin.y = player.y + (player.height - player_sprite.height);
        player.tile_ctx.setTransform(1, 0, 0, 1, 0, 0);
        
        for (let tile of this.tiles) {
            player_sprite = tile;
            player.tile_ctx.clearRect(0, 0, player.tile_canvas.width, player.tile_canvas.height);
            player.tile_ctx.drawImage(player_sprite, 0, 0);
            await sleep(global.duration * 3);
        }

        await sleep(global.duration * 2);
        global.save.chapter_ended = String(global.chapter_number)
        let temp_saves = JSON.parse(localStorage.getItem('saves'));
        temp_saves[global.save_key] = global.save;
        localStorage.setItem('saves', JSON.stringify(temp_saves));

        go_to_main_menu(this.x + this.width / 2 - global.current_screen.screen.x, this.y + this.height / 2 - global.current_screen.screen.y);


    }
    make_inactive () {
        this.is_active = false;
        this.is_hover = false;
        this.elem.style.top = (this.y + this.pos.start.y) + 'px';
        fade_out_element(this.elem);
    }
}

class Current_screen {
    constructor (screen_number) {
        this.number = screen_number;
        
        this.list_of_objects_need_to_update = [
            'Wall',
            'Spike',
            'Wall_touched_move',
            'Trampoline',
            'Dashing_sphere',
            'Platform_can_go_throw',
            'Cloud',
            'Recovery_crystall',
            'Berry',
            'Checkpoint',
            'Escape',
        ];
        for (let object of this.list_of_objects_need_to_update) {
            this[object] = [];
        }
        this.update_objects(global.screens[this.number]);
    }

    update_objects (screen) {
        this.screen = screen;

        // сброс объектов для нужных скринов
        for (let object of this.list_of_objects_need_to_update) {
            this[object] = [];
        }

        // добавляем текущий скрин
        this.need_screens = [];
        this.need_screens.push(this.screen);

        // проверяем если скрин соседний, то добавляем в нужные
        global.screens.forEach(s => {
            if (this.screen.y == s.y) {
                if (this.screen.x - this.screen.width == s.x) {
                    this.need_screens.push(s);
                }
                if (this.screen.x + this.screen.width == s.x) {
                    this.need_screens.push(s);
                }
            }
            if (this.screen.x == s.x) {
                if (this.screen.y - this.screen.height == s.y) {
                    this.need_screens.push(s);
                }
                if (this.screen.y + this.screen.height == s.y) {
                    this.need_screens.push(s);
                }
            }
        });

        // добавляем нужные предметы из списка обрабатываемх объектов
        this.list_of_objects_need_to_update.forEach(object => {
            this[object] = [];
        });
        this.need_screens.forEach(s => {
            // проверяем, если в скрине есть массив нужного объекта, то присоединяем в current_screen
            for (let object in s) {
                if (this.list_of_objects_need_to_update.includes(object)) {
                    this[object] = this[object].concat(s[object]);
                    // console.log(s[object]);
                }
            }
        });

        this.Wall = global.walls;
        this.Wall = this.Wall.concat(this.Wall_touched_move);
        this.Wall = this.Wall.concat(global.walls_border_of_map)

        this.possible_elements_to_grounded = [];
        this.possible_elements_to_grounded = this.possible_elements_to_grounded.concat(this.Wall);
        this.possible_elements_to_grounded = this.possible_elements_to_grounded.concat(this.Cloud);
        this.Platform_can_go_throw.forEach(platform => {
            if (platform.direction == 'up') {
                this.possible_elements_to_grounded.push(platform);
            }
        });

        this.Wall_touched_move.forEach(wall => {
            wall.set_default();
        });
        this.Recovery_crystall.forEach(crystall => {
            crystall.set_default();
        });
        this.Dashing_sphere.forEach(sphere => {
            sphere.set_default();
            // console.log(sphere.set_default)
        });

        view_port.scrollTo({
            left: this.screen.x,
            top: this.screen.y,
            behavior: "smooth"
        });
        
    }
}

class Guide {
    constructor (action, bind) {
        this.action = action;
        this.bind = bind;
        
        this.elem = document.createElement('div');
        this.elem.classList.add('guide_bind');
        this.elem.classList.add(this.action);
        this.elem.style.top = 45 + 'px';
        this.elem.style.left = '50%';
        this.elem.innerHTML = key_map[this.bind];
        document.querySelector('#for_canvases').appendChild(this.elem);

        global.update_bind_elems.push(this.elem);

        update_bind_elems();
    }
}

class Pause_menu {
    constructor () {
        this.elem = document.querySelector('#pause-menu');
        this.cont = this.elem.querySelector('.cont');
        this.cont_inner_array = [];
        this.menu_level = ['main'];
        this.setting_strings_array = [];

        this.buttons = {
            to_continue: this.cont.querySelector('.button#to_continue'),
            to_settings: this.cont.querySelector('.button#to_settings'),
            to_main_menu_without_save: this.cont.querySelector('.button#to_main_menu_without_save'),
            to_main_menu_with_save: this.cont.querySelector('.button#to_main_menu_with_save'),
            to_back: this.cont.querySelector('.button#to_back'),
        }

        for (let key in this.buttons) {
            this.add_to_cont(this.buttons[key]);
        }
        this.remove_from_cont(this.buttons.to_back);

        this.is_active = false;
        this.elem.style.display = 'none';
        
        document.addEventListener('keydown', (e) => {
            if (e.code == 'Escape') {
                if (this.is_active) {
                    // this.make_inactive();
                    this.to_back()
                } else {
                    this.make_active();
                }
            }
        });

        this.confirm_to_exit = false;
        this.buttons.to_main_menu_without_save.addEventListener('click', async () => {
            if (this.confirm_to_exit) {
                global.save.last_checkpoint = 'null';
                global.save.chapter_ended = 'null';
                let temp_saves = JSON.parse(localStorage.getItem('saves'));
                temp_saves[global.save_key] = global.save;
                localStorage.setItem('saves', JSON.stringify(temp_saves));

                this.make_inactive();
                await sleep(350);
                go_to_main_menu();
            } else {
                this.confirm_to_exit = true;
                this.buttons.to_main_menu_without_save.innerHTML = 'Прогресс не сохраниться. Выйти?';
            }
        });
        this.buttons.to_main_menu_with_save.addEventListener('click', async () => {
            global.save.last_checkpoint = `${global.chapter_number};${player.current_checkpoint.number}`;
            console.log(`${global.chapter_number};${player.current_checkpoint.number}`)
            global.save.chapter_ended = 'null';
            let temp_saves = JSON.parse(localStorage.getItem('saves'));
            temp_saves[global.save_key] = global.save;
            localStorage.setItem('saves', JSON.stringify(temp_saves));

            this.make_inactive();
            await sleep(305);
            go_to_main_menu();
        });

        
        this.buttons.to_continue.addEventListener('click', this.make_inactive.bind(this));
        this.buttons.to_back.addEventListener('click', this.to_back.bind(this));
        
        this.buttons.to_settings.addEventListener('click', this.to_settings.bind(this));

        this.setting_string_html = this.elem.querySelector('.string');
        this.remove_from_cont(this.setting_string_html);
        this.setting_string = {
            elem: null,
            name: null,
            action: null,
            bind: null,
            alert: null,
            is_listening: false
        }

        this.create_binds();
        // console.log(global.binds);
    }

    add_to_cont (elem) {
        this.cont_inner_array.push(elem);
        this.cont.appendChild(elem);
    }
    remove_from_cont (elem) {
        // this.cont_inner_array.splice(this.cont_inner_array.indexOf(elem), 1);
        delete this.cont_inner_array[this.cont_inner_array.indexOf(elem)]
        this.cont.removeChild(elem);
    }
    make_active () {
        this.is_active = true;
        this.elem.style.display = 'flex';
    }
    make_inactive () {
        this.confirm_to_exit = false;
        this.buttons.to_main_menu_without_save.innerHTML = 'Вернуться в главное меню';
        
        this.is_active = false;
        this.elem.style.display = 'none';
    }

    async to_back () {
        if (this.menu_level[this.menu_level.length - 1 - 1] == 'main') {
            fade_out_element(this.cont);
            this.menu_level = ['main'];
            await sleep(duration);
            this.cont_inner_array.forEach(button => {
                this.remove_from_cont(button);
            });
            this.cont.innerHTML = '';
            
            this.confirm_to_exit = false;
            this.buttons.to_main_menu_without_save.innerHTML = 'Вернуться в главное меню';

            this.add_to_cont(this.buttons.to_continue);
            this.add_to_cont(this.buttons.to_settings);
            this.add_to_cont(this.buttons.to_main_menu_without_save);
            this.add_to_cont(this.buttons.to_main_menu_with_save);
            
            fade_in_element(this.cont);
        } else {
            this.make_inactive();
        }
    }

    create_binds () {
        let binds_from_file = JSON.parse(localStorage.getItem('settings')).binds;
        for (let key in binds_from_file) {
            global.binds[key] = binds_from_file[key];
        }
        update_bind_elems();
    }
    async to_settings () {
        this.menu_level.push('settings');
        fade_out_element(this.cont);
        await sleep(duration);

        this.cont_inner_array.forEach(button => {
            this.remove_from_cont(button);
        });
        this.settings = JSON.parse(localStorage.getItem('settings'));
        this.binds = this.settings.binds;
        this.settings_strings = [];
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
            this.cont.appendChild(new_string.elem);
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
            this.create_binds();
        }
        this.add_to_cont(this.buttons.to_back);
        fade_in_element(this.cont);
    }
}



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