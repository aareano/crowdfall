var CrowdFall = CrowdFall || {};

var game = new Phaser.Game("98%", "96%", Phaser.CANVAS);
game.state.add("BootState", new CrowdFall.BootState());
game.state.add("LoadingState", new CrowdFall.LoadingState());
game.state.add("GameState", new CrowdFall.LevelState());
game.state.start("BootState", true, false, "/assets/levels/level1.json");
