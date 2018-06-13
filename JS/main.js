var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    audio: {
        disableWebAudio: true
    }
};

var game = new Phaser.Game(config);
var player;
var recoil = 300;
var bulletSpeed = 1000;
var enemySpeed = 100;
var bullets;
var enemies;
var playergroup;

var score = 0;
var health = 100;

var scoretext;
var healthtext;

var canPlay = true;

function preload ()
{
    this.load.setBaseURL('http://labs.phaser.io');

    this.load.image('ship', 'assets/games/asteroids/ship.png');
    this.load.image('rock', 'assets/games/asteroids/asteroid1.png');
    this.load.image('logo', 'assets/sprites/phaser3-logo.png');
    this.load.image('background', 'assets/skies/starfield.png');
    this.load.image('bullet', 'assets/games/asteroids/bullets.png');

    this.load.audio('shoot', 'assets/audio/SoundEffects/blaster.mp3');
    this.load.audio('explode', 'assets/audio/SoundEffects/explode1.wav');
    this.load.audio('hit', 'assets/audio/SoundEffects/lazer.wav');
    this.load.audio('music', 'assets/audio/tommy_in_goa.mp3');
}

function create ()
{
    let bg = this.add.image(400, 300, 'background');

    bg.setDisplaySize(800,600);

    bullets = this.physics.add.group();
    enemies = this.physics.add.group();
    playergroup = this.physics.add.group();

    player = playergroup.create(400, 300, 'ship');

    scoretext = this.add.text(16, 16, 'SCORE: 0', { fontSize: '32px', fill: '#FFF' });
    healthtext = this.add.text(16, 16, 'HEALTH: 100', { fontSize: '32px', fill: '#FFF'});

    scoretext.x = 200;
    healthtext.x = 430;

    let music = this.sound.add('music', { loop: true });
    music.play();
}

function shoot (context) {
    let velx = game.input.activePointer.x - player.x;
    let vely = game.input.activePointer.y - player.y;

    let length = Math.sqrt(Math.pow(velx,2) + Math.pow(vely,2))

    velx /= length;
    vely /= length;

    player.body.velocity.x -= velx * recoil;
    player.body.velocity.y -= vely * recoil;

    let bullet = bullets.create(player.x, player.y, 'bullet');

    bullet.setVelocity(velx * bulletSpeed,vely * bulletSpeed);

    context.sound.add('shoot').play();
  
}

function spawnEnemy (context) {
    let test = {x: Math.random() * 800, y: Math.random() * 600}
    let length = Math.sqrt(Math.pow(test.x - player.x,2) + Math.pow(test.y - player.y,2));

    while (length < 200) {
        test = {x: Math.random() * 800, y: Math.random() * 600}
        length = Math.sqrt(Math.pow(test.x - player.x,2) + Math.pow(test.y - player.y,2));
    }

    let enemy = enemies.create(test.x, test.y, 'rock');
}

function bulletEnemyCollisionCallback (obj1, obj2, context) {
    score += 10;
    scoretext.setText('SCORE: ' + score);

    obj1.destroy();
    obj2.destroy();

    context.sound.add('explode').play();
}


function playerEnemyCollisionCallback (obj1, obj2, context) {
    //obj1.destroy();
    obj2.destroy();

    health -= 10;
    healthtext.setText('HEALTH: ' + health);

    context.sound.add('hit').play();

    if (health <= 0) {
        let text = context.add.text(32, 32, 'GAME OVER', { fontSize: '32px', fill: '#FFF' });

        text.x = 400 - text.width / 2;
        text.y = 300 + text.height / 2;    
        
        canPlay = 0;

        for (enemy of enemies.children.entries) {
            enemy.destroy();
        }

        for (bullet of bullets.children.entries) {
            bullet.destroy();
        }  
        
        player.destroy();

        setTimeout("location.reload(true);",3000);
    }

}

function angleToPointer (position) {
    let diffX = position.x - game.input.activePointer.x;
    let diffY = position.y - game.input.activePointer.y;

    let Length = Math.sqrt(Math.pow(diffX,2) + Math.pow(diffY,2));
    let normX = diffX / Length;
    let normY = diffY / Length;

    let angle = Math.atan2(normX,normY) * -180 / Math.PI - 90;

    
    return angle;
}

function update () {

    if (!canPlay) {
        return;
    }

    if (game.input.activePointer.justDown) {
        shoot(this);
        spawnEnemy(this);
    } 

    player.body.velocity.x *= 0.99;
    player.body.velocity.y *= 0.99;

    player.body.rotation = angleToPointer(player.body.position)

    this.physics.collide(enemies,enemies);
    this.physics.collide(bullets,enemies,(obj1,obj2,context=this) => {bulletEnemyCollisionCallback(obj1,obj2,context)});
    this.physics.collide(playergroup,enemies,(obj1,obj2,context=this) => {playerEnemyCollisionCallback(obj1,obj2,context)});

    for (enemy of enemies.children.entries) {
        let velx = player.x - enemy.x;
        let vely = player.y - enemy.y;
    
        let length = Math.sqrt(Math.pow(velx,2) + Math.pow(vely,2))
    
        velx /= length;
        vely /= length;
    
        enemy.setVelocity(velx * enemySpeed,vely * enemySpeed);
    }

    if (player.x > 800) {
        player.x = 0
        //player.body.velocity.y *= -1
    } else if (player.x < 0) {
        player.x = 800
        //player.body.velocity.y *= -1
    }

    
    if (player.y > 600) {
        player.y = 0
        //player.body.velocity.x *= -1
    } else if (player.y < 0) {
        player.y = 600
        //player.body.velocity.x *= -1
    }
}