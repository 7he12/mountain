async function check_screen_transition (obj) {
    let screen = global.current_screen.screen;

    const is_colide =   
        obj.x + obj.width / 2 <= screen.x + screen.width && 
        obj.x + obj.width / 2 >= screen.x &&
        obj.y + obj.height / 2 <= screen.y + screen.height &&
        obj.y + obj.height / 2 >= screen.y;
    // 
    if (!is_colide) {
        global.pause_screen_transition = true;

        global.screens.forEach(s => {
            let bool = check_collisia_center_of_object(obj, s, () => { return true; });
            if (bool) {
                global.current_screen.update_objects(s);
            }
        });
        
        obj.reset_jumps_dashs_stamina();
        obj.dashs = obj.dashs_limit;

        screen = global.current_screen.screen;
        if (screen.Checkpoint != undefined) {
            player.current_checkpoint = screen.Checkpoint[0];
            
            let temp_saves = JSON.parse(localStorage.getItem('saves'));

            if (player.current_checkpoint.number > temp_saves[global.save_key].chapters['chapter-' + global.chapter_number].checkpoints.passed) {
                global.save.chapters['chapter-' + global.chapter_number].checkpoints.passed = Number(player.current_checkpoint.number);

                temp_saves[global.save_key].chapters['chapter-' + global.chapter_number].checkpoints.passed = global.save.chapters['chapter-' + global.chapter_number].checkpoints.passed;
                localStorage.setItem('saves', JSON.stringify(temp_saves));

            }
        }

        await sleep(700);
        global.pause_screen_transition = false;
    }
}



function collisia_wall_x (object, wall) {
    object.inertia.x = 0;
    if (deltaX > 0) {
        object.x_new = wall.x + wall.width;
    } else if (deltaX < 0) {
        object.x_new = wall.x - object.width;
    }
}
function collisia_wall_y (object, wall) {
    object.inertia.y = 0;
    if (deltaY > 0) {
        object.y_new = wall.y + wall.height;
    } else if (deltaY < 0) {
        object.y_new = wall.y - object.height;
        object.grounded = true;
        object.reset_jumps_dashs_stamina();
    }
}
function collisia_wall (object, wall) {
    deltaX = (object.x_new + object.width / 2) - (wall.x + wall.width / 2);
    deltaY = (object.y_new + object.height / 2) - (wall.y + wall.height / 2);

    let intersect = {
        x: 0,
        y: 0
    }
    if (object.x_new + object.width / 2 < wall.x + wall.width) {
        intersect.x = object.x + object.width - wall.x;
    } else if (object.x_new + object.width / 2 > wall.x + wall.width) {
        intersect.x = object.x - (wall.x + wall.width);
    }

    if (object.y_new + object.height / 2 < wall.y + wall.height) {
        intersect.y = object.y + object.height - wall.y;
    } else if (object.y_new + object.height / 2 > wall.y + wall.height) {
        intersect.y = object.y - (wall.y + wall.height);
    }

    if (Math.abs(intersect.x) < Math.abs(intersect.y)) {
        // if (object.y + object.height <= wall.y || object.y >= wall.y + wall.height) {
        //     collisia_wall_y(object, wall);
        // } else {
        //     collisia_wall_x(object, wall);
        // }
        collisia_wall_x(object, wall);
    } else if (Math.abs(intersect.x) > Math.abs(intersect.y)) {
        // if (object.x + object.width <= wall.x || object.x >= wall.x + wall.width) {
        //     collisia_wall_x(object, wall);
        // } else {
        //     collisia_wall_y(object, wall);
        // }
        collisia_wall_y(object, wall);
    }
}
function collisia_wall_touched_move (object, wall) {
    if (wall.status == 'trigger') {
        if (object.y + object.height == wall.y) {
            wall.status = 'moving';
            return;
        }
        
        if (object.x + object.width == wall.x || object.x == wall.x + wall.width) {
            if (object.grabing) {
                if (object.grabing_to == wall) {
                    wall.status = 'moving';
                    return;
                }
            }
        }
    }
}
function check_collisia_wall (object, wall, callback) {
    const is_colide =   
        object.x_new < wall.x + wall.width && 
        object.x_new + object.width > wall.x &&
        object.y_new < wall.y + wall.height &&
        object.y_new + object.height > wall.y;
    // 
    if (is_colide && typeof callback === 'function') {
        callback(object, wall);
    }
}

function collisia_recovery_crystall (charachter, crystall) {
    if (!crystall.collected) {
        crystall.collected = true;
        charachter.dashs = charachter.dashs_limit;
        charachter.reset_jumps_dashs_stamina();
    }
}

function collisia_berry (obj, berry) {
    if (!berry.is_collected) {
        berry.is_collected = true;
        berry.tile = global.tileset.filter(tile => tile.classList.contains("berry") && tile.classList.contains("collected")).at(-1);
        berry.set_collected();
    }
}
function collisia_trampoline (obj, trampoline) {
    trampoline.reset_counter();
    trampoline.is_triggered = true;
    if (trampoline.direction == 'up') {
        obj.y = trampoline.y - obj.height;
    }
    if (trampoline.direction == 'down') {
        obj.y = trampoline.y + trampoline.height;
    }
    if (trampoline.direction == 'left') {
        obj.x = trampoline.x - obj.width;
    }
    if (trampoline.direction == 'right') {
        obj.x = trampoline.x + trampoline.width;
    }
    obj.inertia.x = trampoline.adding_inertia.x;
    obj.inertia.y = trampoline.adding_inertia.y;
    if (obj.type.includes('charachter')) {
        obj.reset_jumps_dashs_stamina();
        obj.dashs = obj.dashs_limit;
    }
}

function collisia_dashing_sphere (obj, sphere) {
    if (sphere.status == 'trigger') {
        sphere.status = 'listen_to_direction';
        obj.is_in_dashing_sphere = true;
        sphere.object_in = obj;
    }
}

function collisia_platform_can_go_throw (obj, platform) {
    if (platform.direction == 'up') {
        if (obj.y < obj.y_new) {
            if (obj.y_new + obj.height - global.foot_level < platform.y) {
                obj.y_new = platform.y - obj.height;
            }
        }
    }
    
    if (platform.direction == 'down') {
        if (obj.y > obj.y_new) {
            if (obj.y_new + global.foot_level > platform.y + platform.height) {
                obj.y_new = platform.y + platform.height;
            }
        }
    }

    if (platform.direction == 'left') {
        if (obj.x < obj.x_new) {
            if (obj.x_new + obj.width - global.foot_level < platform.x) {
                obj.x_new = platform.x - obj.width;
            }
        }
    }
    
    if (platform.direction == 'right') {
        if (obj.x > obj.x_new) {
            if (obj.x_new + global.foot_level > platform.x) {
                obj.x_new = platform.x + platform.width;
            }
        }
    }
}



function collisia_cloud (obj, cloud) {
    const is_colide =   
        obj.x_new < cloud.x + cloud.width && 
        obj.x_new + obj.width > cloud.x &&
        obj.y_new < cloud.y + cloud.height &&
        obj.y_new + obj.height > cloud.y;
    // 
    if (!is_colide) {
        return;
    }

    deltaX = (obj.x_new + obj.width / 2) - (cloud.x + cloud.width / 2);
    deltaY = (obj.y_new + obj.height / 2) - (cloud.y + cloud.height / 2);
    let intersect = {
        x: 0,
        y: 0
    }
    if (obj.x_new + obj.width / 2 < cloud.x + cloud.width) {
        intersect.x = obj.x + obj.width - cloud.x;
    } else if (obj.x_new + obj.width / 2 > cloud.x + cloud.width) {
        intersect.x = obj.x - (cloud.x + cloud.width);
    }
    if (obj.y_new + obj.height / 2 < cloud.y + cloud.height) {
        intersect.y = obj.y + obj.height - cloud.y;
    } else if (obj.y_new + obj.height / 2 > cloud.y + cloud.height) {
        intersect.y = obj.y - (cloud.y + cloud.height);
    }

    if (Math.abs(intersect.x) < Math.abs(intersect.y)) {
        if (obj.y + obj.height <= cloud.y || obj.y >= cloud.y + cloud.height) {
            if (deltaY < 0) {
                obj.y_new = cloud.y - obj.height;
                obj.grounded = true;
                obj.reset_jumps_dashs_stamina();
            }
        }
    } else if (Math.abs(intersect.x) > Math.abs(intersect.y)) {
        if (deltaY < 0) {
            obj.y_new = cloud.y - obj.height;
            obj.grounded = true;
            obj.reset_jumps_dashs_stamina();
        }
    }

    if (obj.y_new + obj.height == cloud.y) {
        cloud.is_triggered = true;
        if (cloud.func_x == 0.48) {
            obj.inertia.y = -global.inertia_jump / 1.5;
        }
    }
}



function collisia_escape (player, escape) {
    escape.is_hover = true;
    if (!player.actions.includes(escape.action)) {
        player.actions.push(escape.action);
    }
}

function check_collisia (object, wall, callback) {
    const is_colide =   
        object.x < wall.x + wall.width && 
        object.x + object.width > wall.x &&
        object.y < wall.y + wall.height &&
        object.y + object.height > wall.y;
    // 
    if (is_colide && typeof callback === 'function') {
        callback(object, wall);
    }
}
function check_collisia_with_ravno (object, wall, callback) {
    const is_colide =   
        object.x <= wall.x + wall.width && 
        object.x + object.width >= wall.x &&
        object.y <= wall.y + wall.height &&
        object.y + object.height >= wall.y;
    // 
    if (is_colide && typeof callback === 'function') {
        callback(object, wall);
    }
}
function check_collisia_center_of_object (object, wall, callback) {
    const is_colide =   
        object.x + object.width / 2 <= wall.x + wall.width && 
        object.x + object.width / 2 >= wall.x &&
        object.y + object.height / 2 <= wall.y + wall.height &&
        object.y + object.height / 2 >= wall.y;
    // 
    if (is_colide && typeof callback === 'function') {
        return callback(object, wall);
    }
}

function main_cycle () {
    if (global.pause_screen_transition || pause_menu.is_active) {

    } else {
        // обновление позиций объектов карты
        global.current_screen.Wall_touched_move.forEach(wall => {
            if (wall.status == 'moving' || wall.status == 'recovery') {
                // wall.update_tile_counter();
                wall.calc_new_inertia();
                wall.calc_new_position();
                wall.update_position();
                
                wall.stiked_objects.forEach(object => {
                    object.x_new = object.x;
                    object.y_new = object.y;

                    object.x_new += wall.translation.x;
                    object.y_new += wall.translation.y;
                    object.update_position();
                });
            }
        });
        global.current_screen.Cloud.forEach(cloud => {
            if (cloud.is_triggered) {
                cloud.stiked_objects.forEach(object => {
                    // console.log(cloud.stiked_objects)
                    // console.log('-------------------')
                    // console.log(object.y)

                    // object.x_new = object.x;
                    // object.y_new = object.y;
                    // object.x_new += cloud.translation.x;
                    // object.y_new += cloud.translation.y;
                    // object.update_position();

                    // console.log(cloud.update_position)

                    // console.log(object.y)
                });
            }
        })

        // обновление игрока
        player.add_inertia_from_keyboard();
        player.calc_new_position();
    
        global.current_screen.Wall.forEach(wall => {
            check_collisia_wall(player, wall, collisia_wall);
        });




        // 
        global.current_screen.Platform_can_go_throw.forEach(platrorm => {
            check_collisia_wall(player, platrorm, collisia_platform_can_go_throw);
        });

        global.current_screen.Cloud.forEach(cloud => {
            collisia_cloud(player, cloud);
        });

        global.current_screen.Wall_touched_move.forEach(wall => {
            check_collisia_with_ravno(player, wall, collisia_wall_touched_move);
        });

        
        player.minus_inertia();
        player.update_position();
        player.check_flags();


        check_screen_transition (player);


        global.current_screen.Spike.forEach(spike => {
            // check_collisia(player, spike, player.die.bind(player))
        });

        global.current_screen.Recovery_crystall.forEach(crystall => {
            check_collisia(player, crystall, collisia_recovery_crystall);
        });
        global.current_screen.Berry.forEach(berry => {
            check_collisia(player, berry, collisia_berry);
        });
        global.current_screen.Trampoline.forEach(trampoline => {
            check_collisia(player, trampoline, collisia_trampoline);
        });
        global.current_screen.Dashing_sphere.forEach(dashing_sphere => {
            check_collisia(player, dashing_sphere, collisia_dashing_sphere);
        });
        
        global.current_screen.Escape.forEach(escape => {
            if (!escape.is_triggered) {
                escape.is_hover = false;
                check_collisia(player, escape, collisia_escape);
                if (escape.is_hover) {
                    if (!escape.is_active) {
                        escape.make_active();
                        if (!player.actions.includes(escape.action)) {
                            player.actions.push(escape.action);
                        }
                    }
                } else {
                    if (escape.is_active) {
                        escape.make_inactive();
                        if (player.actions.includes(escape.action)) {
                            player.actions.splice(player.actions.indexOf(escape.action), 1);
                        }
                    }
                }
            }
        });
    
    
    
    
        let canvas_animated = global.layers['animated'].canvas;
        let ctx_animated = global.layers['animated'].ctx;
        
        ctx_animated.clearRect(0, 0, canvas_animated.width, canvas_animated.height);

        global.only_animated.forEach(object => {
            object.update_tile_counter();
            ctx_animated.drawImage(object.tile, object.draw_origin.x, object.draw_origin.y);
        });

        player.update_tile_counter();
        if (!player.is_in_dashing_sphere) {
        }
        // ctx_animated.fillStyle = 'red';
        // ctx_animated.fillRect(player.x, player.y, player.width, player.height)
        ctx_animated.drawImage(player.tile_canvas, player.draw_origin.x, player.draw_origin.y);

    }
    
    global.frames++;

    requestAnimationFrame(main_cycle);

    // setTimeout(() => {
    //     main_cycle();
    // }, global.frame_time);
    
    // setTimeout(() => {
    //     global.frames++;
    //     main_cycle();
    // }, 0);
}

// допроверить player.die b сделать анимацию не на центр экрана а на player

// wall_touched_move паттерн сделать 10 на 10 и просто повторять его

// кривая коллизия - тот самый прикол с порядком обработки стен - пока что решил включением сглаживания углов

// прыжок от стены справа при зажатом to.right перс может прыгать вврех по стене - 
    // пока что просто делаю to.right = false без counter - очень просто прыгать вверх по стене

// главу обучения и вручную поправить сохранения - подогнать по клубничкам и чекпоинтам

// cloud - както сократить и структурировать код. Сейчас облака обрабатываются в блоке с стенами, это нужно исправить.
    // переделать функции чтобы было поплавнее
