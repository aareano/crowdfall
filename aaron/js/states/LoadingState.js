var CrowdFall = CrowdFall || {};

CrowdFall.LoadingState = function () {
    "use strict";
    Phaser.State.call(this);
};

CrowdFall.prototype = Object.create(Phaser.State.prototype);
CrowdFall.prototype.constructor = CrowdFall.LoadingState;

CrowdFall.LoadingState.prototype.init = function (level_data) {
    "use strict";
    // JSON data here
    this.level_data = level_data;
};

CrowdFall.LoadingState.prototype.preload = function () {
    "use strict";
    
    game.load.image('unit', 'assets/images/unit.png');
    game.load.image('arrow-up', 'assets/images/arrow-up.png');
    game.load.image('arrow-down', 'assets/images/arrow-down.png');
    game.load.image('btn-neg-3', 'assets/images/btn-neg-3.png');
    game.load.image('btn-neg-2', 'assets/images/btn-neg-2.png');
    game.load.image('btn-neg-1', 'assets/images/btn-neg-1.png');
    game.load.image('btn-pos-1', 'assets/images/btn-pos-1.png');
    game.load.image('btn-pos-2', 'assets/images/btn-pos-2.png');
    game.load.image('btn-pos-3', 'assets/images/btn-pos-3.png');

    /*var assets, asset_loader, asset_key, asset;
    assets = this.level_data.assets;
    for (asset_key in assets) { // load assets according to asset key
        if (assets.hasOwnProperty(asset_key)) {
            asset = assets[asset_key];
            switch (asset.type) {
            case "image":
                this.load.image(asset_key, asset.source);
                break;
            case "spritesheet":
                this.load.spritesheet(asset_key, asset.source, asset.frame_width, asset.frame_height, asset.frames, asset.margin, asset.spacing);
                break;
            }
        }
    }*/
};

CrowdFall.LoadingState.prototype.create = function () {
    "use strict";
    this.game.state.start("GameState", true, false, this.level_data);
};