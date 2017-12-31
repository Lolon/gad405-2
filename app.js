const mainState = {

  preload: function () {
    game.load.image('ship', 'assets/ship.png');
    game.load.image('enemy', 'assets/enemy.png');
    game.load.image('bullet', 'assets/bullet.png');
    game.load.image('backdrop', 'assets/backdrop.png');
    game.load.spritesheet('explode', 'assets/explode.png', 128, 128);
    game.load.audio('fire', 'assets/fire.mp3');
    game.load.audio('destroy','assets/explode.mp3');
    game.load.audio('musicGameplay','assets/musicGameplay.mp3');
    game.load.audio('musicOutro','assets/musicOutro.mp3')
  },

  create: function () {
    game.stage.backgroundColor = '#2d2d2d';
    game.add.sprite(0,0,'backdrop');


    this.ship = game.add.sprite(400, 500, 'ship');
    //this.ship.body.sprite.scale.set(0.5,0.5);
    //game.physics.enable(this.ship, Phaser.Physics.ARCADE);
    game.physics.arcade.enable(this.ship);

    this.aliens = game.add.group();
    game.physics.arcade.enable(this.aliens);
    this.aliens.enableBody = true;
    //this.aliens.physicsBodyType = Phaser.Physics.ARCADE;


    for (let i = 0; i < 48; i++) {
      let c = this.aliens.create(game.rnd.integerInRange(0, game.width), game.rnd.integerInRange(0, game.height), 'enemy');
      //c.body.immovable = true;
      c.body.velocity.setTo(game.rnd.integerInRange(-200, 200),game.rnd.integerInRange(-200, 200));
      c.body.collideWorldBounds = true;
      c.body.bounce.set(1);
      c.body.sprite.scale.set(0.5,0.5);

    }

    this.bullets = game.add.group();
    this.bullets.enableBody = true;
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;

    for (let i = 0; i < 20; i++) {
      let b = this.bullets.create(0, 0, 'bullet');
      b.exists = false;
      b.visible = false;
      b.checkWorldBounds = true;
      b.events.onOutOfBounds.add((bullet) => { bullet.kill(); });
    }

    this.bulletTime = 0;

    this.explosion = this.game.add.sprite(0, 0, 'explode');
    this.explosion.exists = false;
    this.explosion.visible = false;
    // this.explosion.frame = 6; // show one frame of the spritesheet
    this.explosion.anchor.x = 0.5;
    this.explosion.anchor.y = 0.5;
    this.explosion.animations.add('boom');

    //this.highScore = localStorage.getItem('invadershighscore');
    //if (this.highScore === null) {
    //    localStorage.setItem('invadershighscore', 0);
    //  this.highScore = 0;
    //}

    //this.score = 0;
    //this.scoreDisplay = game.add.text(200, 20, `Score: ${this.score} \nHighScore: ${this.highScore}`, { font: '30px Arial', fill: '#ffffff' });

    this.fireSound = game.add.audio('fire');
    this.destroysound = game.add.audio('destroy');
    this.musicGameplaySound = game.add.audio('musicGameplay');
    this.musicGameplaySound.loop = true;
    this.musicGameplaySound.play();

    this.cursors = game.input.keyboard.createCursorKeys();
    game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);
  },

  update: function () {
    game.physics.arcade.overlap(this.bullets, this.aliens, this.hit, null, this);
    //game.physics.arcade.overlap(this.aliens, this.ship, this.shipGotHit, null, this);

    this.ship.body.velocity.x = 0;
    this.aliens.forEach(
      (alien) => {
        alien.body.position.y = alien.body.position.y + -0.1;
        //if (alien.y + alien.height > game.height) { this.gameOver(); }
      }
    );

    if (this.cursors.left.isDown) {
      this.ship.body.velocity.x = -300;
    } else if (this.cursors.right.isDown) {
      this.ship.body.velocity.x = 300;
    }
    if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
      this.fire();
    }
  },

  fire: function () {
    if (game.time.now > this.bulletTime) {
      this.fireSound.play();
      let bullet = this.bullets.getFirstExists(false);
      if (bullet) {
        bullet.reset(this.ship.x + (this.ship.width / 2)-30, this.ship.y);
        bullet.body.velocity.y = -300;
        this.bulletTime = game.time.now + 150;
      }
    }
  },

  gameOver: function () {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('invadershighscore', this.highScore);
    }
    game.state.start('gameover');
  },

  hit: function (bullet, enemy) {
    //this.score = this.score + 10;
    this.destroysound.play();
    bullet.kill();
    enemy.kill();
    if (this.aliens.countLiving() === 0) {
      //this.score = this.score + 100;
      //this.gameOver();
      this.musicGameplaySound.fadeOut(6000);
      musicOutroSound = game.add.audio('musicOutro');
      musicOutroSound.play();
    }
    //this.scoreDisplay.text = `Score: ${this.score} \nHighScore: ${this.highScore}`;
  },

  shipGotHit: function (alien, ship) {
    this.explosion.reset(this.ship.x + (this.ship.width / 2), this.ship.y + (this.ship.height / 2));
    this.ship.kill();
    this.explosion.animations.play('boom');
  },

  };

const gameoverState = {
  preload: function () {
    game.load.image('gameover', 'assets/gameover.jpg');
  },
  create: function () {
    const gameOverImg = game.cache.getImage('gameover');
    game.add.sprite(
      game.world.centerX - gameOverImg.width / 2,
      game.world.centerY - gameOverImg.height / 2,
      'gameover');
    game.input.onDown.add(() => { game.state.start('main'); });
  }
};

const game = new Phaser.Game(800, 600);
game.state.add('main', mainState);
game.state.add('gameover', gameoverState);
game.state.start('main');
