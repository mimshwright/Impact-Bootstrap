ig.module(
    'bootstrap.demos.demo-harness'
)
    .requires(
    'impact.game',
    'impact.font',
    'bootstrap.bootstrap' // Import the bootstrap
)

.defines(function () {

    // Setup some custom code for all ig.Game classes to include
    ig.Game.inject({
        tracking: null,
        // Default init function for all game classes
        init: function()
        {
            // Create a default tracking instance
            this.tracking = new Tracking(ig.config.system.trackingID);

            // Reset all input bindings
            ig.input.unbindAll();

            // Make sure we have keys to bind
            if(ig.config.system.input)
            {

                var key;
                var keys = ig.config.system.input[ig.ua.mobile ? "touch" : "keys"];
                var bindProperty = ig.ua.mobile ? "bindTouch" : "bind";

                // Bind keys
                for (key in keys)
                {
                    ig.input[bindProperty](ig.KEY[key], keys[key]);
                }
            }
            else
            {
                //TODO need to add some kind of error message if no config values are found
            }
        }
    })

    // This is going to be our default Game class
    MyGame = ig.Game.extend({
        gravity: ig.config.system.gravity, // Get gravity from config
        levelTimer:new ig.Timer(),
        stats:null,
        isGameOver:false,
        defaultCaption:'',
        lightMask: new ig.Image('media/bootstrap/images/lighting.png'), //TODO need to move this into the specific game
        /**
         * Main function
         */
        init:function ()
        {
            // Make sure we call parent init since I injected code into ig.Game
            this.parent();

            // Load the level
            this.loadLevelByFileName(ig.config.system.defaultLevel);

            // Create Background Music
            ig.music.add(ig.config.system.backgroundMusic);
            ig.music.volume = ig.config.system.backgroundMusicVolume;
            ig.music.play();

            // Set game volume
            ig.Sound.volume = ig.config.system.soundVolume;

            this.camera.lightMask = this.lightMask;
        },

        loadLevel:function (data)
        {

            // Reset Default Values
            this.defaultCaption = ig.config.text.defaultCaption;
            this.showHUD = true;
            var defaultWeapon = 1; //TODO need to think of a better way to handle this

            var cameraMinY = this.showHUD ? this.hudOffset : 0;

            this.stats = {time:0, deaths:0};
            this.parent(data);

            // Track Level
            this.tracking.trackPage("/game/load/level/" + this.currentLevelName);

            this.levelTimer.reset();

            if (this.defaultCaption != "none")
                this.displayCaption(this.defaultCaption, 7); //TODO need to may the delay configurable

        },
        update:function ()
        {

            this.parent();

            if (this.paused)
            {
                if (ig.input.state('quit'))
                {
                    ig.system.setGame(StartScreen);
                }
            }

            //TODO maybe this should be moved into the PauseMenu logic?
            if (ig.input.state('pause') && !this.isGameOver)
            {
                this.togglePause();
            }

            if (ig.input.state('continue') && this.isGameOver)
            {
                this.reloadLevel();
            }

        },
        onPause:function ()
        {
            this.parent();
            this.hideCaption();
        },
        onPlayerDeath:function ()
        {
            // Set the isGameOver and pause value to false
            this.isGameOver = this.paused = true;

            // Show the game over menu
            this.showMenu(new Menu("Game Over"));
        },
        reloadLevel:function ()
        {
            this.isGameOver = false;
            if (this.paused)
                this.togglePause();

            this.loadLevelByFileName(this.currentLevelName, true)
        }
    })

    // This is a simple template for the start screen. Replace the draw logic with your own artwork
    StartScreen = ig.Game.extend({
        instructText:new ig.Font('media/bootstrap/images/04b03.font.png'),
        init:function ()
        {
            // Call parent since I injected logic into the ig.Game class for key binding
            this.parent();

            // Create tracking
            if (this.tracking)
            {
                //Pull the tracking code from the config file
                this.tracking = new Tracking(ig.config.system.trackingID);

                // By default track the new gaem screen as a page
                this.tracking.trackPage("/game/new-game-screen");
            }
        },
        update:function ()
        {
            if (ig.input.pressed('continue'))
            {
                ig.system.setGame(MyGame);
            }
            this.parent();
        },
        draw:function ()
        {
            this.parent();

            //TODO this should be coming from the config
            var text = !ig.ua.mobile ? 'Press Spacebar To Start!' : 'Press Anywhere To Start!'

            this.instructText.draw(text, ig.system.width * .5, ig.system.height * .5, ig.Font.ALIGN.CENTER);
        }

    })

});