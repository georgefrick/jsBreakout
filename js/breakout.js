
sprite.prototype = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    boundLeft: 0,
    boundRight: 400,
    boundTop: 0,
    boundDown: 300,
    width: 0,
    height: 0,
    hit: false,
    alive: true,
    resetSprite: function() {
        this.alive = true;
        this.x = this.start_x;
        this.y = this.start_y;
        this.vx = 0;
        this.vy = 0;
    },
    collide: function( that ) {
        if(    this.x+this.width+this.vx < that.x || this.x+this.vx > that.x+that.width
            || this.y+this.height+this.vy < that.y || this.y > that.y+that.height+that.vy ) {
            return false;
        }
        return true;
    },
    calcChange: function( that ) {

        // this is the block, that is the ball.
        // or this is the paddle, that is the ball
        var distx = 0;
        var disty = 0;
        if( that.vx > 0 ) {
            // check left
            var ax = this.x + this.vx; // left side of block/paddle
            var bx = that.x + (that.width) + that.vx; // right side of ball
            distx = bx - ax;
        } else {
            // check right
            var ax = this.x + (this.width) + this.vx; // right side of block/paddle
            var bx = that.x + that.vx; // left side of ball
            distx = ax - bx;
        }

        // vy < 0 means ball is moving UP.
        if( that.vy < 0 ) {
            var ay = this.y + (this.height) + this.vy; // bottom of block/paddle
            var by = that.y + that.vy; // top of ball
            disty = ay - by;
        } else {
            // check top
            var ay = this.y + this.vy; // top of block/paddle
            var by = that.y + (that.height) + that.vy; // bottom of ball
            disty = by - ay;
        }

        disty = Math.abs(disty);
        distx = Math.abs(distx);

//      alert("distx: " + distx + " / disty: " + disty );

        var k = 0.075; // elasticity
        if( distx == disty ) {
            that.vx = that.vx * -1;
            that.vy = that.vy * -1;
        } else if( distx > disty ) {
            that.vy = that.vy * -1;
            that.vx += (this.vx * k);
        } else if( disty > distx ) {
            that.vx = that.vx * -1;
            that.vy += (this.vy * k);
        }
        return;
    },
    hide: function() {
        (this.domItem).hide();
    },
    show: function() {
        (this.domItem).show(500);
    },
    setHtml: function(html) {
        (this.domItem).html(html);
    },
    update: function() {
        if( !this.alive ) { return; }
        this.x += this.vx; this.y += this.vy;
    },
    draw: function() {
        if( !this.alive ) { return; }
        (this.domItem).css("left",  this.x + "px");
        (this.domItem).css("top",  this.y + "px");
    },
    die: function() {
        (this.domItem).hide(100);
        this.alive = false;
    }
};

function sprite(id, color, start_width, start_height, start_x, start_y, border) {
    this.id = id;
    this.width = start_width;
    this.height = start_height;
    this.color = color;
    this.start_x = start_x;
    this.start_y = start_y;
    $("#game").append("<div id=" + id + " class='sprite'></div>");
    this.domItem = $("#" + id);
    (this.domItem).css("position",  'absolute' );
    (this.domItem).css("width",  this.width );
    (this.domItem).css("height",  this.height );
    (this.domItem).css("background",  this.color );
    if( border ) {
        (this.domItem).css("border",  "1px solid black" );
    }
    if( start_x ) { this.x = start_x; }
    if( start_y ) { this.y = start_y; }
}

var STATE_TITLE = 1;
var STATE_PLAY = 2;
var STATE_PAUSE = 3;
var STATE_GAMEOVER = 4;
function jsgame() {
}

jsgame.prototype = {
    gameName: "JQuery Breakout",
    author: "George Frick (george.frick@gmail.com)",
    lives: 0,
    state: STATE_PLAY,
    score: 0,
    actors: [], // In this game, Paddle, Ball, Walls.
    paddle_id: 0,
    ball_id: 1,
    top_id: 2,
    left_id: 3,
    right_id: 4,
    bottom_id: 5,
    blocks: [], // the blocks...
    maxBlocks: 40,
    proto: this,
    timeToReset: 5000,
    keyDownHandler: function(e) {
        switch( this.state ) {
            case STATE_TITLE:
                switch( e.which)  {
                    case 32: this.killTitle(); this.initGame();  break;
                }
                break;
            case STATE_PAUSE: {
                switch( e.which ) {
                    case 80: {
                        this.unPause();
                        break;
                    }
                }
                break;
            }
            case STATE_PLAY:
                switch( e.which )  {
                    case 32:
                        if( this.actors[this.ball_id].vx == 0 && this.actors[this.ball_id].vy == 0 ) {
                            this.actors[this.ball_id].vx = 2;
                            this.actors[this.ball_id].vy = -2;
                        }
                        break;
                    // case 38: this.actors[this.ball_id].vx++; this.actors[this.ball_id].vy++; break;
                    // case 40: this.actors[this.ball_id].vx--; this.actors[this.ball_id].vy--; break;
                    case 37: {
                        this.actors[this.paddle_id].vx = -3;
                        if( this.actors[this.ball_id].vy === 0 ) {
                            this.actors[this.ball_id].vx = -3;
                        }
                        break;
                    }
                    case 39: {
                        this.actors[this.paddle_id].vx = 3;
                        if( this.actors[this.ball_id].vy === 0 ) {
                            this.actors[this.ball_id].vx = 3;
                        }
                        break;
                    }
                    case 80: {
                        this.doPause();
                        break;
                    }
                }
                break;
            case STATE_GAMEOVER: break; // No Keys.
        }
        return this.proto;
    },
    keyUpHandler: function(e) {
        switch( this.state ) {
            case STATE_TITLE: break;
            case STATE_PLAY:
                var val = this.actors[this.paddle_id].vx;
                switch( e.which)  {
                    case 37: {
                        if( val <= 0 ) {
                            this.actors[this.paddle_id].vx = 0;
                            if( this.actors[this.ball_id].vy === 0 ) {
                                this.actors[this.ball_id].vx = 0;
                            }
                        }
                        break;
                    }
                    case 39: {
                        if( val >= 0 ) {
                            this.actors[this.paddle_id].vx = 0;
                            if( this.actors[this.ball_id].vy === 0 ) {
                                this.actors[this.ball_id].vx = 0;
                            }
                        }
                        break;
                    }
                }
                break;
            case STATE_GAMEOVER: break;
        }
        return this.proto;
    },
    loseLife: function() {
        if( this.state != STATE_PLAY ) {
            return;
        }
        if( this.lives == 0 ) {
            this.killGame();
            this.initGameOver();
            // Game Over.
        } else {
            this.lives -= 1;
            this.actors[this.ball_id].resetSprite();
            this.actors[this.paddle_id].resetSprite();
        }
    },
    doPause: function() {
        this.state = STATE_PAUSE;
        this.pausePage.show();
        return this.proto;
    },
    unPause: function() {
        this.state = STATE_PLAY;
        this.pausePage.hide();
        return this.proto;
    },
    initTitle: function() {
        this.state = STATE_TITLE;
        this.titlePage.show();
        return this.proto;
    },
    killTitle: function() {
        this.titlePage.hide();
        return this.proto;
    },
    setup: function() {
        // Create everything.
        this.livesPage = new sprite("livespage","white",200,25,10,0);
        this.livesPage.setHtml(" Lives: " + this.lives);

        this.scoresPage = new sprite("scorespage","white",200,25, 225,0);
        this.scoresPage.setHtml(" Score: " + this.score);

        this.actors[this.paddle_id] = new sprite("paddle","blue",64,16,100,250);
        this.actors[this.ball_id]   = new sprite("ball","red",16,16,124,233);
        this.actors[this.top_id]    = new sprite("tBorder","black",402,1,0,0);
        this.actors[this.left_id]   = new sprite("lBorder","black",1,300,0,0);
        this.actors[this.right_id]  = new sprite("rBorder","black",1,300,402,0);
        this.actors[this.bottom_id] = new sprite("bBorder","black",402,1,0,300);

        this.proto.actors = this.actors;

        var blockCnt = 0;
        var bx = 2;
        var by = 25;
        for( blockCnt = 0; blockCnt < this.maxBlocks ; ++blockCnt ) {
            this.blocks[blockCnt] = new sprite("block" + blockCnt, "orange", 47,20, bx, by, true);
            bx += 50;
            if( blockCnt % 8 == 7 ) {
                by += 28;
                bx = 2;
            }
        }

        this.proto.blocks = this.blocks;

        // Create game over page
        this.goPage = new sprite("gopage","white",300,40,50,160);
        this.goPage.setHtml("<center><h2>Game Over!</h2></center>");
        this.proto.goPage = this.goPage;

        // Create pause page
        this.pausePage = new sprite("pausepage","#EFEFEF",300,40,50,160,true);
        this.pausePage.setHtml("<center><h2>-Pause-</h2></center>");
        this.proto.pausePage = this.pausePage;

        // Create title page.
        this.titlePage = new sprite("titlepage","white",300,100,50,50,true);
        this.titlePage.setHtml("<center><h2>jsBreakout!</h2><hr/>By George Frick<p/>Press -SPACE- to play.</center>");
        this.proto.titlePage = this.titlePage;

        this.resetGame();
        return this.proto;
    },
    initGame: function() {
        this.state = STATE_PLAY;
        this.lives = 3;
        this.score = 0;
        this.resetLevel();
        var sx;
        for( sx in this.actors ) {
            this.actors[sx].show();
        }
        this.livesPage.show();
        this.scoresPage.show();
        return this.proto;
    },
    resetLevel: function() {
        var blockCnt = 0;
        for( blockCnt = 0; blockCnt < this.maxBlocks ; ++blockCnt ) {
            this.blocks[blockCnt].alive = true;
            this.blocks[blockCnt].show();
        }
        this.actors[this.ball_id].resetSprite();
        this.actors[this.paddle_id].resetSprite();
        return this.proto;
    },
    resetGame: function() {
        // Hide everything.
        this.livesPage.hide();
        this.scoresPage.hide();
        this.goPage.hide();
        this.pausePage.hide();
        this.titlePage.hide();

        var sx;
        for( sx in this.actors ) {
            this.actors[sx].hide();
        }
        var blockCnt = 0;
        for( blockCnt = 0; blockCnt < this.maxBlocks ; ++blockCnt ) {
            this.blocks[blockCnt].hide();
        }
    },
    killGame: function() {
        return this.proto;
    },
    initGameOver: function() {
        this.state = STATE_GAMEOVER;
        this.goPage.show();
        this.timeToReset = 200;
        return this.proto;
    },
    killGameOver: function() {
        this.goPage.hide();
        return this.proto;
    },
    gameLoop: function() {
        switch( this.state ) {
            case STATE_TITLE:
                this.titlePage.update();
                this.titlePage.draw();
                break;
            case STATE_PAUSE:
                this.pausePage.update();
                this.pausePage.draw();
                break;
            case STATE_PLAY:
                this.livesPage.setHtml(" Lives: " + this.lives);
                this.livesPage.draw();

                this.scoresPage.setHtml(" Score: " + this.score);
                this.scoresPage.draw();

                // If the paddle isn't hitting either wall, update it.
                var stopPaddle = true;
                if( !this.actors[this.paddle_id].collide( this.actors[this.left_id] )
                    && !this.actors[this.paddle_id].collide( this.actors[this.right_id] )){
                    this.actors[this.paddle_id].update();
                    stopPaddle = false;
                }

                if( this.actors[this.ball_id].collide( this.actors[this.left_id] )
                    || this.actors[this.ball_id].collide( this.actors[this.right_id] )){
                    this.actors[this.ball_id].vx *= -1;
                }

                var change = 0;

                // top
                if( this.actors[this.ball_id].collide( this.actors[this.top_id] ) ) {
                    this.actors[this.ball_id].vy *= -1;
                } else if( this.actors[this.ball_id].collide( this.actors[this.paddle_id] ) ) {
                    this.actors[this.paddle_id].calcChange( this.actors[this.ball_id] );
                } else if(  this.actors[this.ball_id].collide( this.actors[this.bottom_id] ) ) {
                    this.loseLife();
                } else {
                    var found = false;
                    for( sx in this.blocks ) {
                        if( this.blocks[sx].alive == false ) { continue; }

                        found = true;
                        if( this.blocks[sx].collide( this.actors[this.ball_id]) ) {
                            this.blocks[sx].die();
                            this.score += 20;
                            this.blocks[sx].calcChange( this.actors[this.ball_id] );
                        } else {
                            this.blocks[sx].draw();
                        }
                    }
                    if( !found ) {
                        this.resetLevel();
                    }
                }

                if( stopPaddle == false && this.actors[this.ball_id].vx !== 0) {
                    this.actors[this.ball_id].update();
                }

                var sx;
                for( sx in this.actors ) {
                    this.actors[sx].draw();
                }
                break;
            case STATE_GAMEOVER:
                this.goPage.update();
                this.goPage.draw();
                this.timeToReset -= 1;
                if( this.timeToReset <= 0 ) {
                    this.killGameOver();
                    this.initTitle();
                }
                break;
        }
        return this.proto;
    }
};
