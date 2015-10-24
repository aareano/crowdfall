var CrowdFall = CrowdFall || {};

CrowdFall.LevelState = function () {
    "use strict";
    Phaser.State.call(this);
};

CrowdFall.LevelState.prototype = Object.create(Phaser.State.prototype);
CrowdFall.LevelState.prototype.constructor = CrowdFall.LevelState;

CrowdFall.LevelState.prototype.init = function (level_data) {
    "use strict";
    this.level_data = level_data;
    
    // this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    // this.scale.pageAlignHorizontally = true;
    // this.scale.pageAlignVertically = true;
};

CrowdFall.LevelState.prototype.create = function () {
    "use strict";
    
    draw_map();
    draw_buttons();
    
    
    // add events to button clicks
    // TODO
};

function draw_map() {

    var block_width = 64;
    var block_height = 8;
    var arrow_height = 79;
    var x_spacing = 16;
    var y_spacing = 80;


    var vertical_shift = 100;
    var horizontal_shift = 300
;
    var index = 0;

    // draw blocks
    for (var y = 0; y < 7; y++) {
        for (var x = 0; x < 15; x++) {
            game.add.sprite((block_width + x_spacing) * x + horizontal_shift, (block_height + y_spacing) * y + vertical_shift, 'unit');
            if (index % 9 == 0) {
                game.add.sprite((block_width + x_spacing) * x + horizontal_shift, (block_height + y_spacing) * y + vertical_shift - arrow_height, 'arrow-up');
            } else if (index % 13 == 0 && (index + 15) % 9 != 0) {
                game.add.sprite((block_width + x_spacing) * x + horizontal_shift, (block_height + y_spacing) * y + vertical_shift - arrow_height, 'arrow-down');
            }
            index++;
        }
    }
}

function draw_buttons() {
    game.add.sprite(game.world.centerX - 300, game.world.height - 100, 'btn-neg-3');
    game.add.sprite(game.world.centerX - 200, game.world.height - 100, 'btn-neg-2');
    game.add.sprite(game.world.centerX - 100, game.world.height - 100, 'btn-neg-1');
    game.add.sprite(game.world.centerX + 100, game.world.height - 100, 'btn-pos-1');
    game.add.sprite(game.world.centerX + 200, game.world.height - 100, 'btn-pos-2');
    game.add.sprite(game.world.centerX + 300, game.world.height - 100, 'btn-pos-3');
}
