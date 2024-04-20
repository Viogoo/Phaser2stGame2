var config = {
    // Задаємо тип фреймворку Phaser, щоб він автоматично визначав найкращий тип (WEBGL або CANVAS).
    type: Phaser.AUTO,
    // Задаємо розміри гри (ширина та висота).
    width: 1920,
    height: 1080,
    // Налаштовуємо фізичний движок гри.
    physics: {
        // Встановлюємо фізичний движок за замовчуванням на Arcade Physics.
        default: 'arcade',
        arcade: {
            // Задаємо гравітацію у напрямку осі Y.
            gravity: { y: 170 },
            // Вмикаємо/вимикаємо режим налагодження (debug mode) для Arcade Physics.
            debug: false,
        }
    },
    // Задаємо об'єкт, який містить всі методи сцен (preload, create, update).
    scene: {
        // Метод, який завантажує усі ресурси перед створенням сцени.
        preload: preload,
        // Метод, який ініціалізує елементи гри та обробляє їх створення.
        create: create,
        // Метод, який оновлює стан гри кожен кадр (60 разів на секунду за замовчуванням).
        update: update
    }
};

// Створюємо ігровий об'єкт з використанням заданої конфігурації.
var game = new Phaser.Game(config);

// Об'являємо глобальні змінні, які будуть використовуватися в усіх методах сцен.
var cursors;
var platforms;
var player;
var bombs;
var stars;
var score = 0;
var scoreText;
var life = 5;
var lifeText;
var worldWidth = 9600;
var enemy;
var enemyLives = 5;
var enemyText;
var bullets;

// Метод preload, який завантажує всі ресурси, необхідні для гри.
function preload() {
    // Створюємо об'єкт cursors, щоб слідкувати за натисканням клавіш курсору.
    cursors = this.input.keyboard.createCursorKeys();
    
    // Завантажуємо всі зображення та анімації, які будуть використовуватися в грі.
    this.load.image('sky', 'assets/sky.png');
    this.load.image('platform1', 'assets/10.png');
    this.load.image('platform2', 'assets/11.png');
    this.load.image('platform3', 'assets/12.png');
    this.load.image('ground', 'assets/1.png');
    this.load.image('bullet', 'assets/bullet.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.image('tree', 'assets/3.png');
    this.load.image('ts', 'assets/5.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('enemy', 'assets/enemy.png');
    this.load.spritesheet('dude', 'assets/2.png', { frameWidth: 32, frameHeight: 48 });
}

// Метод create, який ініціалізує елементи гри та обробляє їх створення.
function create() {
    // Додаємо тайлований спрайт для фону гри.
    this.add.tileSprite(0, 0, worldWidth, 1080, "sky")
        .setOrigin(0, 0)
        .setScale(1)
        .setDepth(0);

    // Створюємо платформи, де гравець зможе стояти.
    platforms = this.physics.add.staticGroup();

    // Створюємо землю.
    for (var x = 0; x < worldWidth; x = x + 128) {
        platforms
            .create(x, 1050, "ground")
            .setOrigin(0, 0)
            .refreshBody(1);
    }

    // Створюємо різні типи платформ.
    for (var x = 0; x < worldWidth; x = x + Phaser.Math.FloatBetween(3000, 800)) {
        platforms.create(x, 850, 'platform1');

        var i;
        for (i = 1; i < Phaser.Math.Between(0, 5); i++) {
            platforms.create(x + 128 * i, 850, 'platform2');
        }

        platforms.create(x + 128 * i, 850, 'platform3');
    }

    // Створюємо дерева.
    for (var x = 0; x < worldWidth; x = x + Phaser.Math.FloatBetween(2000, 500)) {
        var tree = this.physics.add.staticGroup();
        tree.create(x, 1080 - 25, 'tree')
            .setOrigin(0, 1)
            .setScale(Phaser.Math.FloatBetween(1.5, 1.7))
            .setDepth(Phaser.Math.Between(1, 2));
    }

    // Створюємо гравця.
    player = this.physics.add.sprite(100, 700, 'dude');
    player.setBounce(0.2)
        .setDepth(Phaser.Math.Between(4, 5))
        .setCollideWorldBounds(true);
    player.body.setGravityY(300);

    // Створюємо анімації для гравця.
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

    // Додаємо колізію між гравцем та платформами.
    this.physics.add.collider(player, platforms);

    // Створюємо групу для бомб та додаємо колізію між бомбами та платформами.
    bombs = this.physics.add.group();
    this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(player, bombs, hitBomb, null, this);

    // Встановлюємо текст для показу кількості очок, життів гравця та життів ворога.
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
    enemyText = this.add.text(50, 150, 'Enemy Lives: ' + enemyLives, { fontSize: '40px', fill: '#FFF' })
        .setOrigin(0, 0)
        .setScrollFactor(0);

    // Створюємо зірки та додаємо колізію між гравцем та зірками.
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

    // Встановлюємо текст для показу кількості очок та життів гравця.
    scoreText = this.add.text(100, 100, 'Score: 0', { fontSize: '40px', fill: '#FFF' })
        .setOrigin(0, 0)
        .setScrollFactor(0);
    lifeText = this.add.text(1500, 100, showLife(), { fontSize: '40px', fill: '#FFF' })
        .setOrigin(0, 0)
        .setScrollFactor(0);

    // Додаємо кнопку для перезапуску гри.
    var resetButton = this.add.text(938, 70, '♻️', { fontSize: '60px', fill: '#FFF' })
        .setInteractive()
        .setScrollFactor(0);
    resetButton.on('pointerdown', function () {
        console.log('restart');
        location.reload();
    });

    // Створюємо ворога та додаємо колізію між гравцем та ворогом.
    enemy = this.physics.add.sprite(1000, 1080 - 150, 'enemy');
    enemy.dead = false; // Додаємо цю стрічку
    this.physics.add.collider(enemy, platforms);
    this.physics.add.collider(player, enemy, hitEnemy, null, this);

    // Додаємо обробник події натискання пробілу для стрільби з гравця.
    this.input.keyboard.on('keydown-SPACE', shootBullet);
    // Створюємо групу для куль та додаємо колізію між кулями та ворогом.
    bullets = this.physics.add.group();
    this.physics.add.collider(bullets, enemy, hitEnemyWithBullet, null, this);
}

// Метод update, який оновлює стан гри кожен кадр.
function update() {
    // Обробляємо натискання клавіш курсору для переміщення гравця.
    if (cursors.left.isDown) {
        player.setVelocityX(-500);
        player.anims.play('left', true);
    } else if (cursors.right.isDown) {
        player.setVelocityX(500);
        player.anims.play('right', true);
    } else {
        player.setVelocityX(0);
        player.anims.play('turn');
    }

    // Обробляємо натискання клавіші "вверх" для стрибка гравця.
    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-520);
    }

    // Обчислюємо відстань між гравцем та ворогом та змінюємо швидкість ворога відповідно до цієї відстані.
    var distance = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);
    if (distance < 500) {
        if (player.x < enemy.x) {
            enemy.setVelocityX(-200);
        } else {
            enemy.setVelocityX(200);
        }
    } else {
        enemy.setVelocityX(0);
    }

    // Перевіряємо, чи стикаються гравець та ворог, та зупиняємо гравця у разі стикання.
    if (Phaser.Geom.Intersects.RectangleToRectangle(player.getBounds(), enemy.getBounds())) {
        player.setVelocityX(0);
    }
}


// Метод, який обробляє зіткнення гравця з ворогом.
function hitEnemy(player, enemy) {
    // Зменшуємо кількість життів гравця.
    life--;
    // Оновлюємо текст, що відображає кількість життів гравця.
    lifeText.setText(showLife());

    // Перевіряємо, з якого боку зіткнувся гравець з ворогом та змінюємо його швидкість.
    if (player.x < enemy.x) {
        player.setVelocityX(200);
    } else {
        player.setVelocityX(-200);
    }
    player.setVelocityY(-400);

    // Якщо кількість життів стає менше або дорівнює нулю, гру призупиняємо та відображаємо гравця як пошкодженого.
    if (life <= 0) {
        this.physics.pause();
        player.setTint(0xff0000);
        player.anims.play('turn');
    }
}

// Метод, який обробляє зіткнення кулі з ворогом.
function hitEnemyWithBullet(enemy, bullet) {
    // Зменшуємо кількість життів ворога.
    enemyLives--;
    // Оновлюємо текст, що відображає кількість життів ворога.
    let enemyLifeIcons = '';
    for (let i = 0; i < enemyLives; i++) {
        enemyLifeIcons += '👾';
    }
    enemyText.setText('Enemy Lives: ' + enemyLifeIcons);
    
    // Знищуємо кулю.
    bullet.destroy();

    // Змінюємо швидкість ворога після зіткнення з кулею.
    if (player.x < enemy.x) {
        enemy.setVelocityX(10);
    } else {
        enemy.setVelocityX(-10);
    }
    enemy.setVelocityY(-100);

    // Якщо кількість життів ворога стає менше або дорівнює нулю і ворог ще не мертвий, знищуємо ворога.
    if (enemyLives <= 0 && !enemy.dead) {
        enemy.dead = true;
        enemy.destroy();
    }
}

// Метод, який обробляє зіткнення гравця зі зіркою.
function collectStar(player, star) {
    // Вимикаємо фізику для зірки та приховуємо її.
    star.disableBody(true, true);
    // Збільшуємо кількість очок та оновлюємо текст, що відображає кількість очок.
    score += 10;
    scoreText.setText('Score: ' + score);
}

// Метод, який повертає рядок, що відображає кількість життів гравця.
function showLife() {
    var lifeLine = 'Life: ';
    for (var i = 0; i < life; i++) {
        lifeLine += '❤️';
    }
    return lifeLine;
}

// Метод, який обробляє зіткнення гравця з бомбою.
function hitBomb(player, bomb) {
    // Призупиняємо гру та відображаємо гравця як пошкодженого.
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
}

// Метод, який стріляє кулею.
function shootBullet() {
    // Створюємо кулю та задаємо їй початкову позицію та швидкість залежно від напрямку руху гравця.
    var bullet = bullets.create(player.x, player.y, 'bullet');
    if (player.body.velocity.x < 0) {
        bullet.setVelocityX(-2000);
    } else {
        bullet.setVelocityX(2000);
    }
}
