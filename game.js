//Створюємо сцену
var config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 170 },
            debug: false,
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

//змінні
var game = new Phaser.Game(config);
var keyboard;
var score = 0;
var scoreText;
var worldWidth = 9600;
var yStep;
var yStart;
var life = 5;
var stars
var screenCount = 2
var enemyCount = screenCount


function preload() {
    //Додаємо клавіші керування
    cursors = this.input.keyboard.createCursorKeys();
    //Завантажуємо спрайти
    this.load.image('sky', 'assets/sky.png');
    this.load.image('platform1', 'assets/10.png');
    this.load.image('platform2', 'assets/11.png');
    this.load.image('platform3', 'assets/12.png');
    this.load.image('ground', 'assets/1.png');
   
    this.load.image('bomb', 'assets/bomb.png');
    this.load.image('tree', 'assets/3.png');
    this.load.image('ts', 'assets/5.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('enemy', 'assets/enemy.png',); 
    this.load.spritesheet('dude', 'assets/2.png', { frameWidth: 32, frameHeight: 48 });
}
//Додаємо спрайти до сцени
function create() {
    this.add.tileSprite(0, 0, worldWidth, 1080, "sky")
        .setOrigin(0, 0)
        .setScale(1)
        .setDepth(0);



    //додаємо генепвцію платформ
    platforms = this.physics.add.staticGroup();

    for (var x = 0; x < worldWidth; x = x + 128) {
        platforms
            .create(x, 1050, "ground")
            .setOrigin(0, 0)
            .refreshBody(1);
    }



    //летючі платформи

    for (var x = 0; x < worldWidth; x = x + Phaser.Math.FloatBetween(3000, 800)) {
       var yStep = Phaser.Math.Between(1, 3);
       var y = yStart * yStep;

        platforms.create(x, 850, 'platform1');

        var i
        for (var i = 1; i < Phaser.Math.Between(0, 5); i++) {
            platforms.create(x + 128 * i, 850, 'platform2');
        }

        platforms.create(x + 128 * i, 850, 'platform3');
   }

   
    for (var x = 0; x < worldWidth; x = x + Phaser.Math.FloatBetween(1000, 800)) {
        var yStep = Phaser.Math.Between(1, 3);
        var y = yStart * yStep;

        platforms.create(x, 650, 'platform1');

        var i
        for (var i = 1; i < Phaser.Math.Between(0, 5); i++) {
            platforms.create(x + 128 * i, 650, 'platform2');
        }

        platforms.create(x + 128 * i, 650, 'platform3');
    }



    //додаємо кущі


    for (var x = 0; x < worldWidth; x = x + Phaser.Math.FloatBetween(1700, 100)) {
        ts = this.physics.add.staticGroup()
        ts
            .create(x, 1080 - 25, 'ts')
            .setOrigin(0, 1)
            .setScale(Phaser.Math.FloatBetween(1, 1, 5))
            .setDepth(Phaser.Math.Between(9, 10));

        console.log(ts.X, ts.Y)


    }

    //додаємо дерево
    tree = this.physics.add.staticGroup();

    for (var x = 0; x < worldWidth; x = x + Phaser.Math.FloatBetween(2000, 500)) {


        tree
            .create(x, 1080 - 25, 'tree')
            .setOrigin(0, 1)
            .setScale(Phaser.Math.FloatBetween(1.5, 1.7))
            .setDepth(Phaser.Math.Between(1, 2));

        console.log(tree.X, tree.Y)

    }


    //Гравець
    player = this.physics.add.sprite(100, 700, 'dude');

    player
        .setBounce(0.2)
        .setDepth(Phaser.Math.Between(4, 5))
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
    //камера
    this.cameras.main.setBounds(0, 0, worldWidth, 1080);
    this.physics.world.setBounds(0, 0, worldWidth, 1080);

    this.cameras.main.startFollow(player);




   
   
   
    //кількість ворогів
  
   scoreText = this.add.text(1500, 150, 'enemy:', { fontSize: '40px', fill: '#FFF' })
        .setOrigin(0, 0)
        .setScrollFactor(0)







    //додаємо очки рахунку
    cursors = this.input.keyboard.createCursorKeys();

   

    stars = this.physics.add.group({
        key: 'star',

        repeat: 50,
        setXY: { x: 12, y: 0, stepX: 500 }

    });

       stars.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });



    this.physics.add.collider(stars, platforms);
    this.physics.add.overlap(player, stars, collectStar, null, this);
    function collectStar(player, star) {
        star.disableBody(true, true);
        score += 10;
        scoreText.setText('Score: ' + score);
    

    }

    //Додаємо рахунок

    function showLife() {
        var lifeLine = 'Life: '

        for (var i = 0; i < life; i++) {
            lifeLine += '❤️'

        }
        return lifeLine
    }






    scoreText = this.add.text(100, 100, 'score: 0', { fontSize: '40px', fill: '#FFF' })
        .setOrigin(0, 0)
        .setScrollFactor(0)


    lifeText = this.add.text(1500, 100, showLife(), { fontSize: '40px', fill: '#FFF' })
        .setOrigin(0, 0)
        .setScrollFactor(0)



//функція рестарт
function refereshBody(){
    console.log('Game Over')
    lacation.reload()   
}
  var resetButton = this.add.text(938, 70, '♻️', { fontSize: '60px', fill: '#FFF' })

    .setInteractive()
     .setScrollFactor(0);

    resetButton.on('pointerdown', function () {
        console.log('restart')
    refereshBody ()
    });


    //життя
    livesText = this.add.text(1700, 16, "lives = 3", { fontSize: "32px", fill: "#000" }
    )
        .setScrollFactor(0);


};

function update() {
    //Додаємо керування гравцем
    if (cursors.left.isDown) {
        player.setVelocityX(-500);

        player.anims.play('left', true);
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(500);

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

function collectStar(player, star) {
    star.disableBody(true, true);

    score += 10;
    scoreText.setText("Score:" + score);
}



function collectSkelet(player, skelet) {
    skelet.disableBody(true, true)

    lives += 1;
    livesTextText.setText("lives: " - lives)
}


function hitBomb(player, bomb) {
    this.physics.pause();

    player.setTint(0xff0000)
    player.anims.play('turn');

    gameOver = true;
}

  //додаємо ворогів випадковим чином
//   function create() {
//     enemy = this.physics.add.group ({
//      key: 'enemy',
//      repeat: enemyCount,
//      setXY: {x: 1000, y: 1080 - 150, stepY: 400 }
//     }) ;

//     enemy.children.iterate(function (child) {
//      child
//      .setCollideWorldBounds(true)
//      .setVelocityX(Phaser.Math.FloatBetween(-200, 200))
//     });
//  };
