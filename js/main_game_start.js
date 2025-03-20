let checkpoint_number = 0;

async function generate_map_and_object () {
    // достаём tileset
    tileset_data_walls = await fetch('tiled-export/tiles.tsj');
    tileset_data_walls = await tileset_data_walls.json();

    await new Promise((resolve) => {
        let loaded_tiles = 0;
        for (let tile_info of tileset_data_walls.tiles) {
            let new_image = new Image();
            new_image.addEventListener("load", () => {
                global.tileset[tile_info.id] = new_image;
                if ((++loaded_tiles) == tileset_data_walls.tilecount) {
                    resolve();
                }
            });
            new_image.src = `project/${tile_info.image}`;
            new_image.classList = tile_info.type;
        }
    });

    let hash = location.hash.split('#').at(-1);
    global.save_name = '';
    global.save_key = '';
    global.chapter_number = 0;

    console.log(hash);
    hash.split(';').forEach(prop => {
        let property = prop.split('=');
        if (property[0] == 'save_key') {
            global.save_key = property[1];
        }
        if (property[0] == 'save_name') {
            global.save_name = property[1];
        }
        if (property[0] == 'chapter_number') {
            global.chapter_number = property[1];
        }
        if (property[0] == 'checkpoint_number') {
            global.checkpoint_number = parseInt(property[1]);
        }
    });

    let temp_saves = JSON.parse(localStorage.getItem('saves'));
    for (let key in temp_saves) {
        if (temp_saves[key].name == global.save_name) {
            global.save = temp_saves[key];
        }
    }

    // достаём карту
    let map_json = await fetch(`tiled-export/level-${global.chapter_number}.tmj`);
    map_json = await map_json.json();

    // проверка что все слои есть
    let is_static_exists = false;
    let is_animated_exists = false;
    let is_service_exists = false;
    let is_objects_exists = false
    for (let layer of map_json.layers) {
        if (layer.name == 'static') {
            is_static_exists = true;
        }
        if (layer.name == 'service') {
            is_service_exists = true;
        }
        if (layer.name == 'animated') {
            is_animated_exists = true;
        }
        if (layer.name == 'objects') {
            is_objects_exists = true;
        }
    }
    if (!is_static_exists || !is_static_exists || !is_animated_exists || !is_objects_exists) {
        console.error('не хватает слоя', is_static_exists, is_static_exists, is_animated_exists, is_objects_exists)
    }


    global.tilewidth = map_json.tilewidth;
    global.tileheight = map_json.tileheight;
    view_port.parentElement.style.width = 44 * global.tilewidth + 'px';
    view_port.parentElement.style.height = 22 * global.tileheight + 'px';
    
    global.map = {
        elems: [],
        cols: map_json.width,
        rows: map_json.height
    };

    // рисуем bgs
    if (parseInt(global.chapter_number) == 1 || parseInt(global.chapter_number) == 2) {
        let img_2 = document.createElement('img');
        img_2.classList.add('bg');
        img_2.src = 'sprites/bgs/chapter1-2-front.png';
        view_port.parentElement.prepend(img_2);

        let img = document.createElement('img');
        img.classList.add('bg');
        img.src = 'sprites/bgs/chapter1-3.png';
        view_port.parentElement.prepend(img);
    } else
    if (parseInt(global.chapter_number) == 3) {
        let img_2 = document.createElement('img');
        img_2.classList.add('bg');
        img_2.src = 'sprites/bgs/chapter3-front.png';
        view_port.parentElement.prepend(img_2);

        let img = document.createElement('img');
        img.classList.add('bg');
        img.src = 'sprites/bgs/chapter1-3.png';
        view_port.parentElement.prepend(img);
    } else
    if (parseInt(global.chapter_number) == 4) {
        let img_2 = document.createElement('img');
        img_2.classList.add('bg');
        img_2.src = 'sprites/bgs/chapter4.png';
        view_port.parentElement.prepend(img_2);
    }

    for (let layer of map_json.layers) {
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        global.layers[layer.name] = {
            tiles: [],
            canvas: canvas,
            ctx: ctx
        };
        canvas.width = global.map.cols * global.tilewidth;
        canvas.height = global.map.rows * global.tileheight;
        container_for_canvases.appendChild(canvas);
        
        // деелаем карту - перегоняем одномерный массив экспортированный из Tiled в двумерный
        global.map.elems = [];
        global.layers[layer.name].tiles = [];
        
        if (layer.name == 'service' || layer.name == 'animated' || layer.name == 'objects') {
            continue;
        }

        await new Promise((resolve) => {
            let result = [];
            for (let i = 0; i < map_json.layers[0].data.length; i += global.map.cols) {
                result.push(map_json.layers[map_json.layers.indexOf(layer)].data.slice(i, i + global.map.cols));
            }
            global.layers[layer.name].tiles = result;
            resolve();
        });
    }

    global.layers['static'].canvas.style.zIndex = '1';
    global.layers['animated'].canvas.style.zIndex = '10';

    // let colors = ['red', 'orange', 'yellow', 'green', 'skyblue', 'blue', 'violet'];
    let colors = Array.from({ length: 140 }, (_, i) => `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 1)`);
    let colors_temp = [];
    colors_temp = colors_temp.concat(colors);

    // рисуем static
    let static_tiles = global.layers['static'].tiles;
    let visited_tiles = [];
    visited_tiles = static_tiles.map(row => row.map(() => false));
    for (let y = 0; y < static_tiles.length; y++) {
        for (let x = 0; x < static_tiles[y].length; x++) {
            let tile = static_tiles[y][x];
            if (tile != undefined && tile != 0) {
                tile = global.tileset[tile - 1];

                // добавить проверку что тайл именно class = wall
                if (tile != undefined) {
                    let tile_centered_x = Math.floor((x * global.tilewidth) - (tile.width - global.tilewidth) / 2);
                    let tile_centered_y = Math.floor((y * global.tileheight) - (tile.height - global.tileheight) / 2);
                    
                    if (!visited_tiles[y][x]) {
                        let temp_x = x;
                        let temp_y = y;
                        let width = 1;
                        let height = 1;
                            
                        is_break = false;
                        while (
                            x + width < global.map.cols
                            && global.tileset[static_tiles[temp_y][temp_x + width] - 1] != undefined
                            && visited_tiles[temp_y][temp_x + width] == false
                            && global.tileset[static_tiles[temp_y][temp_x + width] - 1].classList.contains('wall')
                        ) {
                            width++;
                        }

                        while (temp_y + height < global.map.rows) {
                            for (temp_x = x; temp_x < x + width; temp_x++) {
                                if (global.tileset[static_tiles[temp_y + height][temp_x] - 1] == undefined) {
                                    is_break = true;
                                    break;
                                }
                                if (visited_tiles[temp_y + height][temp_x] == true) {
                                    is_break = true;
                                    break;
                                }
                                if (!global.tileset[static_tiles[temp_y + height][temp_x] - 1].classList.contains('wall')) {
                                    is_break = true;
                                    break;
                                }
                            }
                            if (is_break) {
                                break;
                            }
                            height++;
                        }

                        for (temp_y = y; temp_y < y + height; temp_y++) {
                            for (temp_x = x; temp_x < x + width; temp_x++) {
                                visited_tiles[temp_y][temp_x] = true;
                            }
                        }

                        temp_x = x * global.tilewidth;
                        width = width * global.tilewidth;
                        temp_y = y * global.tileheight;
                        height = height * global.tileheight;

                        let new_wall = new Wall (x, y, temp_x, temp_y, width, height);
                        global.walls.push(new_wall);



                        global.layers['static'].ctx.fillStyle = colors_temp.pop();
                        if (colors_temp.length == 0) {
                            colors_temp = [];
                            colors_temp = colors_temp.concat(colors);
                        }
                        // global.layers['static'].ctx.fillRect(new_wall.x, new_wall.y, new_wall.width, new_wall.height);
                    }
                    draw(global.layers['static'].ctx, tile, tile_centered_x, tile_centered_y);
                }
            }
        }
    }
    
    let decals_tiles = global.layers['decals'].tiles;
    for (let y = 0; y < decals_tiles.length; y++) {
        for (let x = 0; x < decals_tiles[y].length; x++) {
            if (decals_tiles[y][x] != 0) {
                let tile = global.tileset[decals_tiles[y][x] - 1];
                let tile_x = x * global.tilewidth;
                let tile_y = y * global.tileheight - (parseInt(tile.height) - global.tileheight);
                
                draw(global.layers['decals'].ctx, tile, tile_x, tile_y);
            }
        }
    }


    // рисуем слой objects
    let objects_tiles = map_json.layers.find(layer => layer.name === "objects");
    if (objects_tiles) {
        objects_tiles.objects.forEach(obj => {
            if (obj.type == 'berry') {
                let tile = global.tileset.filter((tile) => tile.classList.contains("berry")).at(-1);
                let tile_centered_x = Math.floor(obj.x - (tile.width - global.tilewidth) / 2);
                let tile_centered_y = Math.floor(obj.y - (tile.height - global.tileheight) / 2);
                let number = obj.properties.filter((i) => i.name == 'number').at(-1).value;

                let berry = new Berry (tile, tile_centered_x, tile_centered_y, tile_centered_x, tile_centered_y, number);
                if (global.save.chapters['chapter-' + global.chapter_number].berries[number - 1]) {
                    berry.is_collected = true;
                }
                global.berries.push(berry);
            }
            if (obj.type == 'recovery_crystall') {
                let tile = global.tileset.filter((tile) => tile.classList.contains("recovery_crystall")).at(-1);
                let recovery_crystall = new Recovery_crystall (tile, obj.x, obj.y, obj.x, obj.y);
                global.recovery_crystalls.push(recovery_crystall);
            }
            if (obj.type == 'trampoline') {
                let tile = global.tileset.filter((tile) => tile.classList.contains("trampoline"))[1];
                let direction = obj.properties[0].value;
                let trampoline = new Trampoline (tile, obj, direction);
                global.trampolines.push(trampoline);
            }
            if (obj.type == 'platform_can_go_throw') {
                let tile = global.tileset.filter((tile) => tile.classList.contains("platform_can_go_throw"))[1];
                let direction = obj.properties[0].value;
                let platform = new Platform_can_go_throw (tile, obj, direction);
                global.platform_can_go_throw.push(platform);
            }
            if (obj.type == 'dashing_sphere') {
                let tile = global.tileset.filter((tile) => tile.classList.contains("dashing_sphere")).at(-1);
                let dashing_sphere = new Dashing_sphere (tile, obj);
                global.dashing_spheres.push(dashing_sphere);
            }
            if (obj.type == 'checkpoint') {
                let tile = global.tileset.filter((tile) => tile.classList.contains("checkpoint")).at(-1);
                let number = obj.properties.filter((i) => i.name == 'number').at(-1).value;
                let checkpoint = new Checkpoint (tile, obj.x, obj.y, obj.x, obj.y, number);
                global.checkpoints.push(checkpoint);
            }
            if (obj.type == 'escape') {
                let tile = global.tileset.filter((tile) => tile.classList.contains("checkpoint")).at(-1);
                let escape = new Escape (tile, obj);
                global.escapes.push(escape);
            }

            if (obj.type.includes('danger')) {
                if (obj.type.includes('spike')) {
                    let direction = obj.properties[0].value;
                    let tile = global.tileset.filter((tile) => tile.classList.contains("spike") && tile.classList.contains(direction)).at(-1);
                    let spike = new Spike (tile, obj, direction);
                    global.spikes.push(spike);
                }
            }
            if (obj.type == 'cloud') {
                let tile = global.tileset.filter((tile) => tile.classList.contains("cloud")).at(-1);
                let cloud = new Cloud (tile, obj);
                global.clouds.push(cloud);
            }

            if (obj.type.includes('wall')) {
                if (obj.type.split(' ').includes('touched_move')) {
                    let tile = global.tileset[1];
                    let wall = new Wall_touched_move (tile, obj);
                    global.walls_touched_move.push(wall);
                }
            }
        });
    }
    global.berries.forEach(berry => {
        global.only_animated.push(berry);
    });
    global.spikes.forEach(spike => {
        global.only_animated.push(spike);
    });
    global.recovery_crystalls.forEach(crystall => {
        global.only_animated.push(crystall);
    });
    global.walls_touched_move.forEach(wall => {
        global.only_animated.push(wall);
    });
    global.trampolines.forEach(trampoline => {
        global.only_animated.push(trampoline);
    });
    global.dashing_spheres.forEach(sphere => {
        global.only_animated.push(sphere);
    });
    global.platform_can_go_throw.forEach(platform => {
        global.only_animated.push(platform);
    });
    global.clouds.forEach(cloud => {
        global.only_animated.push(cloud);
    });
    // убрать, чтобы его не отрисовывать
    // global.checkpoints.forEach(checkpoint => {
    //     global.only_animated.push(checkpoint);
    // });
    // global.escapes.forEach(escape => {
    //     global.only_animated.push(escape);
    // });

    global.walls_touched_move.forEach((wall) => {
        if (wall.ids_stiked_objects) {
            wall.stiked_objects = global.spikes.filter(s => wall.ids_stiked_objects.includes(s.ID_tiled));
            wall.stiked_objects = wall.stiked_objects.concat(global.trampolines.filter(t => wall.ids_stiked_objects.includes(t.ID_tiled)));
        }
    });

    console.log('global.checkpoints.length', global.checkpoints.length);
    console.log('global.berries.length', global.berries.length);
}


var global = new Global ();
var pause_menu = new Pause_menu ();
var view_port = document.querySelector('.view-port')
var container_for_canvases = view_port.querySelector('#for_canvases');
var player = null;
var replace_color = new Replace_color ();
(async () => {
    await generate_map_and_object();

    if (global.chapter_number == 1) {
        
        for (let action in global.binds) {
            console.log(action, global.binds[action]);
            let guide = new Guide (action, global.binds[action]);

            guide.elem.style.up = '0';
            guide.elem.style.bottom = '0';
            guide.elem.style.right = '0';
            guide.elem.style.left = '0';

            // 
            if (guide.action == 'up') {
                guide.elem.style.left = '75px';
                guide.elem.style.top = '500px';
            }
            if (guide.action == 'down') {
                guide.elem.style.left = '75px';
                guide.elem.style.top = '530px';
            }
            if (guide.action == 'left') {
                guide.elem.style.left = '45px';
                guide.elem.style.top = '530px';
            }
            if (guide.action == 'right') {
                guide.elem.style.left = '105px';
                guide.elem.style.top = '530px';
            }

            // 
            if (guide.action == 'jump') {
                guide.elem.style.left = '175px';
                guide.elem.style.top = '550px';
            }
            if (guide.action == 'grab') {
                guide.elem.style.left = '680px';
                guide.elem.style.top = '500px';
            }
            if (guide.action == 'dash') {
                guide.elem.style.left = '975px';
                guide.elem.style.top = '575px';
            }

        }
    }

    // создниу скринов
    global.screens = [];
    for (let screen_y = 0; screen_y < Math.floor(global.map.rows / 22); screen_y++) {
        for (let screen_x = 0; screen_x < Math.floor(global.map.cols / 44); screen_x++) {
            global.screens.push(new Screen_level (1 + screen_x * 44, 1 + screen_y * 22, 44, 22, global.screens.length));
        }
    }
    
    global.all_objects = [];
    global.all_objects = global.all_objects.concat(global.walls);
    global.all_objects = global.all_objects.concat(global.spikes);
    global.all_objects = global.all_objects.concat(global.berries);
    global.all_objects = global.all_objects.concat(global.recovery_crystalls);
    global.all_objects = global.all_objects.concat(global.checkpoints);
    global.all_objects = global.all_objects.concat(global.walls_touched_move);
    global.all_objects = global.all_objects.concat(global.trampolines);
    global.all_objects = global.all_objects.concat(global.escapes);
    global.all_objects = global.all_objects.concat(global.clouds);
    global.all_objects = global.all_objects.concat(global.platform_can_go_throw);
    global.all_objects = global.all_objects.concat(global.dashing_spheres);
    global.all_objects.forEach(object => {
        global.screens.forEach(s => {
            if (
                object.x + object.width / 2 > s.x
                && object.x + object.width / 2 < s.x + s.width
                && object.y + object.height / 2 > s.y 
                && object.y + object.height / 2 < s.y + s.height
            ) {
                let array_name = object.constructor.name;
                if (s[array_name] == undefined) {
                    s[array_name] = [];
                }
                s[array_name].push(object);
            }
        });
    });
    
    
    // выташить сейв
    player_tile = global.tileset[47];
    player_cell_x = 8;
    player_cell_y = 30;

    // стены, которые границы карты, их надо добавлять в обработку коллизий, чтобы не выпасть за карту
    global.walls_border_of_map = [];
    global.walls.forEach(wall => {
        if (wall.cell_y == 0 || wall.cell_y == global.map.rows - 1) {
            if (!global.walls_border_of_map.includes(wall)) {
                global.walls_border_of_map.push(wall);
            }
        }
        if (wall.cell_x == 0 || wall.cell_x == global.map.cols - 1) {
            if (!global.walls_border_of_map.includes(wall)) {
                global.walls_border_of_map.push(wall);
            }
        }
    });


    // scale работает нормально
    let need_width = parseInt(window.getComputedStyle(view_port).width);
    let need_height = parseInt(window.getComputedStyle(view_port).height);
    let scale_x = window.innerWidth / need_width;
    let scale_y = window.innerHeight / need_height;
    const scale = Math.min(scale_x, scale_y);
    document.body.style.zoom = scale;
    view_port.scrollIntoView({ block: "center", inline: "center", behavior: "instant"});


    // здесь номер скрина просто для примера, так то нужно:
    // 1) из сейва достать номер чекпоинта, 
    // 2) найти нужный чекпоинт на карте и номер скрина где он находится
    global.current_screen = new Current_screen (3);
    
    view_port.scrollTo({
        left: global.current_screen.screen.x,
        top: global.current_screen.screen.y,
        // behavior: "smooth"
    });

    // создать игрока
    player = new Player (player_tile, player_cell_x, player_cell_y, player_cell_x * global.tilewidth, player_cell_y * global.tileheight);
    player.current_checkpoint = global.checkpoints.filter(checkpoint => checkpoint.number == global.checkpoint_number)[0];
    player.x_new = player.current_checkpoint.x;
    player.y_new = player.current_checkpoint.y;
    player.update_position();

    main_cycle();

    setTimeout(() => {
        open_effect(player.x + player.width / 2 - global.current_screen.screen.x, player.y + player.height / 2 - global.current_screen.screen.y);
    }, 1000);

    global.frames = 0;
    global.frames_old = global.frame;
    // let frames = setInterval(() => {
    //     console.log(global.frames - global.frames_old);
    //     global.frames_old = global.frames;
    // }, 1000);

    // document.addEventListener('keydown',  e => {
    //     if (e.code == 'KeyY') {
    //         if (player.current_checkpoint.number == global.checkpoints.length) {
    //             player.current_checkpoint = global.checkpoints.filter(point => point.number == 1)[0];
    //             player.x_new = player.current_checkpoint.x;
    //             player.y_new = player.current_checkpoint.y;
    //             player.update_position();
    //             return;
    //         } else {
    //             player.current_checkpoint = global.checkpoints.filter(point => point.number == player.current_checkpoint.number + 1)[0];
    //             player.x_new = player.current_checkpoint.x;
    //             player.y_new = player.current_checkpoint.y;
    //             player.update_position();
    //             return;
    //         }
    //     }

    //     if (e.code == 'KeyT') {
    //         player.x = 10 + (10 * 44 * 4) + (10 * 19);
    //         player.y = 10 + (10 * 22 * 1) + (10 * 5);
    //     }

    //     if (e.code == 'KeyP') {
    //         console.log(global.escapes[0]);
    //         player.x_new = global.escapes[0].x;
    //         player.y_new = global.escapes[0].y - global.tileheight / 2;
    //         player.update_position();
    //     }
    // });
    
}) ();



// http://127.0.0.1:5500/index.html