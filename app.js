const mainState = {

  preload: function () {
    game.load.image('ship', 'assets/ship.png');
    game.load.image('enemy', 'assets/enemy.png');
    game.load.image('bullet', 'assets/bullet.png');
    game.load.image('backdrop', 'assets/backdrop.png');
    game.load.spritesheet('explode', 'assets/explosionFlipboard.png', 128, 128);
    game.load.audio('fire', 'assets/fire.mp3');
    game.load.audio('destroy','assets/explode.mp3');
    game.load.audio('musicGameplay','assets/musicGameplay.mp3');
    game.load.audio('musicOutro','assets/musicOutro.mp3')
  },

  create: function () {
    game.canvas.oncontextmenu = function (e) { e.preventDefault(); }

    game.stage.backgroundColor = '#2d2d2d';
    game.add.sprite(0,0,'backdrop');

    this.ship = game.add.sprite(400, 500, 'ship');

    game.physics.enable(this.ship, Phaser.Physics.ARCADE);
    this.ship.body.immovable = true;
    this.ship.body.setSize(40,60,45,45);
    this.ship.body.collideWorldBounds = true;


    this.aliens = game.add.group();
    game.physics.arcade.enable(this.aliens);
    this.aliens.enableBody = true;


    for (let i = 0; i < 1; i++) {
      let c = this.aliens.create(game.rnd.integerInRange(0, game.width), game.rnd.integerInRange(0, game.height), 'enemy');
      c.body.velocity.setTo(game.rnd.integerInRange(-200, 200),game.rnd.integerInRange(-200, 200));
      c.body.collideWorldBounds = true;
      c.body.bounce.set(1);
      c.body.sprite.scale.set(0.5,0.5);
      c.body.setSize(20,20,45,45);

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

    this.bulletTime = 5;

    this.explosions = game.add.group();
    for (let i = 0; i < 20; i++){
      let e = this.explosions.create(0, 0, 'explode');
      e.exists = false;
      e.visible = false;
      e.anchor.x = 0.5;
      e.anchor.y = 0.5;
      e.animations.add('boom');
      e.events.onAnimationComplete.add((explosion) => { explosion.kill(); });
    }

    this.fireSound = game.add.audio('fire');
    this.destroysound = game.add.audio('destroy');
    this.musicGameplaySound = game.add.audio('musicGameplay');
    this.musicGameplaySound.loop = true;
    //this.musicGameplaySound.play();
    this.musicOutroSound = game.add.audio('musicOutro');
    this.musicOutroSound.loop = true;

    this.musicHandler(true);


    this.cursors = game.input.keyboard.createCursorKeys();
    game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);
    let fire = true;

    game.input.mouse.capture = true;

  },

  update: function () {
    game.physics.arcade.overlap(this.bullets, this.aliens, this.hit, null, this);
    game.physics.arcade.collide(this.aliens, this.ship);


    this.ship.body.velocity.x = 0;
    this.aliens.forEach(
      (alien) => {
        alien.body.position.y = alien.body.position.y + -0.1;
      }
    );

    if (this.cursors.left.isDown) {
      this.ship.body.velocity.x = -300;
    } else if (this.cursors.right.isDown) {
      this.ship.body.velocity.x = 300;
    }
    if (game.input.activePointer.leftButton.isDown) {
      if (fire){
        this.fire();
      }
      fire = false;
    }
    else if (game.input.activePointer.rightButton.isDown){
      if (fire){
      this.spawn();
      }
      fire = false;
    }
    else {
      fire = true;
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

  spawn: function (){
    if (game.time.now > this.bulletTime){
      this.fireSound.play();

      let c = this.aliens.create(this.ship.x+25, this.ship.y,'enemy');
      c.body.velocity.setTo(game.rnd.integerInRange(-200, 200),game.rnd.integerInRange(-200, 200));
      c.body.collideWorldBounds = true;
      c.body.bounce.set(1);
      c.body.sprite.scale.set(0.5,0.5);
      c.body.setSize(20,20,45,45);
    }
    if (this.aliens.countLiving() === 1) {
      this.musicHandler(true);

      //this.musicOutroSound.fadeOut(6000);
      //this.musicOutroSound.onFadeComplete.add(stop);
    //  this.musicGameplaySound.resume();
    }
  },

  hit: function (bullet, enemy) {
    this.destroysound.play();
    //bullet.kill();
    enemy.kill();

    let explosion = this.explosions.getFirstExists(false);
    if (explosion) {
      explosion.reset(enemy.x + (enemy.width/2),enemy.y+(enemy.height/2));
      explosion.animations.play('boom');
    }

    if (this.aliens.countLiving() === 0) {
      this.musicHandler(false);
      //this.musicGameplaySound.fadeOut(6000);
      //this.musicGameplaySound.onFadeComplete.add(stop);
      //this.musicOutroSound.resume();
    }
  },

  musicHandler: function (HasAlien){
    if (HasAlien){
      //game.debug.text( this.musicGameplaySound.volume, 100, 380 );
      this.musicOutroSound.fadeOut(6000);
      if (this.musicGameplaySound.volume <1){
        this.musicGameplaySound.fadeIn(6000);
      }
      else{this.musicGameplaySound.play();}
    }
    else {
    //  game.debug.text( "No Alien", 100, 380 );
      this.musicGameplaySound.fadeOut(6000);
      if (this.musicOutroSound.volume <1){
        this.musicOutroSound.fadeIn(6000);
      }
      else{this.musicOutroSound.play();}
    }
  },

  render: function(){
    //game.debug.bodyInfo(this.ship,32,32);
    //game.debug.body(this.ship);
  },

};

const game = new Phaser.Game(800, 600);
game.state.add('main', mainState);
game.state.start('main');
