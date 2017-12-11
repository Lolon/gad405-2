const mainState = {

addPipe: function () {
    const pipeHolePosition = 200;
    const upperPipe = game.add.sprite(320, pipeHolePosition-480, 'pipe', 0, this.pipes);
    game.physics.arcade.enable(upperPipe);
    upperPipe.body.velocity.x = -this.birdSpeed;
    upperPipe.events.onOutOfBounds.add(function(pipe){pipe.destroy(); });

    const lowerPipe = game.add.sprite(320, pipeHolePosition+ this.pipeHole, 'pipe', 0, this.pipes);
    game.physics.arcade.enable(lowerPipe);
    lowerPipe.body.velocity.x = -this.birdSpeed;
    lowerPipe.events.onOutOfBounds.add(function(pipe){pipe.destroy(); });
  },

create: function (){
    this.bird = game.add.sprite(80,240, 'bird');
    this.bird.anchor.set(0.5); //rotation origin at center
    this.birdSpeed = 125;
    this.birdFlapPower = 300;

    game.physics.arcade.enable(this.bird);
    this.bird.body.gravity.y = 800;

    this.pipes = game.add.group();
    this.pipeHole = 120;

    this.flapSound = game.add.audio('flap');
    this.addPipe();

    game.input.onDown.add(this.flap, this);
    game.time.events.loop(2000,this.addPipe,this);
  },

die: function(){
  game.state.start('main');
},

flap: function (){
  this.flapSound.play();
  this.bird.body.velocity.y = -this.birdFlapPower;

},

preload: function (){
    game.load.image('bird', 'assets/bird.png');
    game.load.image('pipe','assets/pipe.png');
    game.load.audio('flap','assets/jump.mp3');
  },

update: function (){
  game.physics.arcade.collide(this.bird, this.pipes, this.die, null, this);
    if (this.bird.y > game.height){this.die();}
}

};


const game = new Phaser.Game(350, 490);
game.state.add('main', mainState);
game.state.start('main');
