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

    this.load.image('box32', 'assets/sprites/32x32.png');
    this.load.image('logo', 'assets/sprites/phaser3-logo.png');
    this.load.image('red', 'assets/particles/red.png');
}

function create ()
{
    bullets = this.physics.add.group();
    enemies = this.physics.add.group();
    playergroup = this.physics.add.group();

    player = playergroup.create(400, 300, 'box32');
    //player.setBounce(0.5, 0.5);
    //player.setCollideWorldBounds(true); 

    scoretext = this.add.text(16, 16, 'SCORE: 0', { fontSize: '32px', fill: '#FFF' });
    healthtext = this.add.text(16, 16, 'HEALTH: 100', { fontSize: '32px', fill: '#FFF'});

    scoretext.x = 200;
    healthtext.x = 430;
}

function shoot (context) {
    let velx = game.input.activePointer.x - player.x;
    let vely = game.input.activePointer.y - player.y;

    let length = Math.sqrt(Math.pow(velx,2) + Math.pow(vely,2))

    velx /= length;
    vely /= length;

    player.body.velocity.x -= velx * recoil;
    player.body.velocity.y -= vely * recoil;

    let bullet = bullets.create(player.x, player.y, 'red');

    bullet.setVelocity(velx * bulletSpeed,vely * bulletSpeed);
  
}

function spawnEnemy (context) {
    let test = {x: Math.random() * 800, y: Math.random() * 600}
    let length = Math.sqrt(Math.pow(test.x - player.x,2) + Math.pow(test.y - player.y,2));

    while (length < 200) {
        test = {x: Math.random() * 800, y: Math.random() * 600}
        length = Math.sqrt(Math.pow(test.x - player.x,2) + Math.pow(test.y - player.y,2));
    }

    let enemy = enemies.create(test.x, test.y, 'box32');
}

function bulletEnemyCollisionCallback (obj1, obj2, context) {
    score += 10;
    scoretext.setText('SCORE: ' + score);

    obj1.destroy();
    obj2.destroy();
}


function playerEnemyCollisionCallback (obj1, obj2, context) {
    //obj1.destroy();
    obj2.destroy();

    health -= 10;
    healthtext.setText('HEALTH: ' + health);

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

        window.setTimeout(context.scene.restart, 2000);
    }

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