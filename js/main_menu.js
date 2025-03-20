let time_to_clip_path = 550;
async function main_to_settings () {
    global.current_menu = 'settings';
    global.menus.main.make_inactive();
    global.menus.settings = new Menu_settings();
    global.menus.settings.make_active();
    global.menus.settings.elem.scrollIntoView({block: "center", inline: "center", behavior: "smooth"});
    
    background.style.clipPath = `rect(
        ${global.menus.main.pos_global.y}px 
        ${global.menus.main.pos_global.x + global.menus.main.width}px 
        ${global.menus.main.pos_global.y + global.menus.main.height + global.menus.settings.pos_global.y + global.menus.settings.height}px 
        ${global.menus.main.pos_global.x}px
    )`;
    await sleep(time_to_clip_path);
    background.style.clipPath = `rect(
        ${global.menus.settings.pos_global.y}px 
        ${global.menus.settings.pos_global.x + global.menus.settings.width}px 
        ${global.menus.settings.pos_global.y + global.menus.settings.height}px 
        ${global.menus.settings.pos_global.x}px
    )`;
}
async function settings_to_main () {
    global.current_menu = 'main';
    global.menus.settings.make_inactive();
    global.menus.main.make_active();
    global.menus.main.elem.scrollIntoView({block: "center", inline: "center", behavior: "smooth"});

    background.style.clipPath = `rect(
        ${global.menus.main.pos_global.y}px 
        ${global.menus.main.pos_global.x + global.menus.main.width}px 
        ${global.menus.main.pos_global.y + global.menus.main.height + global.menus.settings.pos_global.y + global.menus.settings.height}px 
        ${global.menus.main.pos_global.x}px
    )`;
    await sleep(time_to_clip_path);
    background.style.clipPath = `rect(
        ${global.menus.main.pos_global.y}px 
        ${global.menus.main.pos_global.x + global.menus.main.width}px 
        ${global.menus.main.pos_global.y + global.menus.main.height}px 
        ${global.menus.main.pos_global.x}px
    )`;
}

async function main_to_map (save_key, save_name) {
    global.save_name = save_name;
    global.save_key = save_key;
    global.menus.saves.make_inactive();
    global.menus.map = new Menu_map();
    global.menus.map.make_active();
    
    background.style.clipPath = `rect(
        ${global.menus.main.pos_global.y}px 
        ${global.menus.main.pos_global.x + global.menus.main.width + global.menus.map.pos_global.x + global.menus.map.width}px 
        ${global.menus.main.pos_global.y + global.menus.main.height}px 
        ${global.menus.main.pos_global.x}px
    )`;
    await sleep(time_to_clip_path);
    background.style.clipPath = `rect(
        ${global.menus.map.pos_global.y}px 
        ${global.menus.map.pos_global.x + global.menus.map.width}px 
        ${global.menus.map.pos_global.y + global.menus.map.height}px 
        ${global.menus.map.pos_global.x}px
    )`;
}

async function map_to_main () {
    global.menus.map.make_inactive();
    global.menus.saves.make_active();
    
    background.style.clipPath = `rect(
        ${global.menus.main.pos_global.y}px 
        ${global.menus.main.pos_global.x + global.menus.main.width + global.menus.map.pos_global.x + global.menus.map.width}px 
        ${global.menus.main.pos_global.y + global.menus.main.height}px 
        ${global.menus.main.pos_global.x}px
    )`;
    await sleep(time_to_clip_path);
    background.style.clipPath = `rect(
        ${global.menus.main.pos_global.y}px 
        ${global.menus.main.pos_global.x + global.menus.main.width}px 
        ${global.menus.main.pos_global.y + global.menus.main.height}px 
        ${global.menus.main.pos_global.x}px
    )`;
}


async function check_chapter_ended() {
    let temp_saves = JSON.parse(localStorage.getItem('saves'));

    for (let key in temp_saves) {
        if (temp_saves[key].chapter_ended != null && temp_saves[key].chapter_ended != 'null') {
            global.is_chapter_ended = true;
            global.save_key = key;
            global.save_name = temp_saves[key].name;
            global.chapter_number = temp_saves[key].chapter_ended;

            global.menus.saves = new Menu_saves();
            global.menus.main.left_menu.style.opacity = '0';
            setTimeout(() => {
                global.menus.main.left_menu.style.visibility = 'hidden';
            }, duration);

            global.menus.main.make_inactive();
            global.menus.saves.make_active();


            if (temp_saves[key].chapters['chapter-' + (parseInt(global.chapter_number) + 1)] != undefined) {
                temp_saves[key].chapters['chapter-' + (parseInt(global.chapter_number) + 1)].is_locked = false;
                let save = temp_saves[key];

                console.log(
                    'chapter', save.chapters['chapter-' + (parseInt(global.chapter_number) + 1)], 
                    'is', save.chapters['chapter-' + (parseInt(global.chapter_number) + 1)].is_locked
                );
            }        

            global.is_chapter_ended = true;
            global.save_key = key;
            global.save_name = temp_saves[key].name;
            global.chapter_number = temp_saves[key].chapter_ended;

            if (temp_saves[key].chapters['chapter-' + (parseInt(global.chapter_number) + 1)] != undefined) {
                temp_saves[key].chapters['chapter-' + (parseInt(global.chapter_number) + 1)].is_locked = false;
            }
            temp_saves[key].chapter_ended = 'null';
            localStorage.setItem('saves', JSON.stringify(temp_saves));

            global.menus.saves = new Menu_saves();
            
            global.menus.main.left_menu.style.opacity = '0';
            setTimeout(() => {
                global.menus.main.left_menu.style.visibility = 'hidden';
            }, duration);

            global.menus.main.make_inactive();
            global.menus.saves.make_active();
            
            await sleep(500);
            main_to_map(global.save_key, global.save_name);
            global.menus.map.open_marker(global.menus.map.markers[global.chapter_number - 1]);
            global.menus.map.open_chapter_info_block(global.chapter_number);
            console.log(global.chapter_number)
        
        }
    }
}

global.is_chapter_ended = false;
(async () => {
    check_chapter_ended();
    
    background.style.clipPath = `rect(
                                        ${global.menus.main.pos_global.y}px 
                                        ${global.menus.main.pos_global.x + global.menus.main.width}px 
                                        ${global.menus.main.pos_global.y + global.menus.main.height}px 
                                        ${global.menus.main.pos_global.x}px
                                    )`;
    // 

    await sleep(2000);
    fade_in_element(background);
}) ();


