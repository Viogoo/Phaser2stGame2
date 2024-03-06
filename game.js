//Створюємо сцену
var config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false,
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};


var game = new Phaser.Game(config);
var score = 0;
var scoreText;
var worldWidth = 9600;
function hitBomb(player, bomb) {
    this.physics.pause();

    player.setTint(0xff0000)
    player.anims.play('turn');

    gameOver = true;
}

    score += 10;




function preload() {
    //Додаємо клавіші керування
    cursors = this.input.keyboard.createCursorKeys();
    //Завантажуємо спрайти
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/1.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude','assets/2.png',{ frameWidth: 32, frameHeight: 48 } );
}
//Додаємо спрайти до сцени
    function create() {
    //Платформи
  //this.add.image(900, 400, 'sky');
    //platforms = this.physics.add.staticGroup();
    //platforms.create(100, 920, 'ground').setScale(2).refreshBody();
    //platforms.create(900, 920, 'ground').setScale(2).refreshBody();
   //platforms.create(1700, 920, 'ground').setScale(2).refreshBody();
 
  
    this.add.tileSprite(0, 0, worldWidth, 1080, "sky")
    .setOrigin (0, 0)
    .setScale (1)
    .setDepth (0);

  
 

  platforms = this.physics.add.staticGroup();

  for (var x = 0; x < worldWidth; x = x + 128){
    platforms
    .create (x, 1050, "ground")
    .setOrigin (0, 0)
    .refreshBody ();
    
  }





    //Гравець
    player = this.physics.add.sprite(100, 700, 'dude');

    player
        .setBounce(0.2)
        .setCollideWorldBounds(true);
    player.body.setGravityY(300)

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });
    this.physics.add.collider(player, platforms);
    bombs = this.physics.add.group();

    this.physics.add.collider(bombs, platforms);

    this.physics.add.collider(player, bombs, hitBomb, null, this);

    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    this.cameras.main.setBounds(0, 0, worldWidth, 1080);
    this.physics.world.setBounds(0, 0, worldWidth, 1080);
    
    this.cameras.main.startFollow(player);
    

};

    
    //stars.children.iterate(function (child) {
        //child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        //child.setScale(2,2)


    //});




function update() {
    //Додаємо керування гравцем
    if (cursors.left.isDown) {
        player.setVelocityX(-400);

        player.anims.play('left', true);
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(400);

        player.anims.play('right', true);
    }
    else {
        player.setVelocityX(0);

        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-520);
    }
}














