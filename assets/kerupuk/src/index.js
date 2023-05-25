import Phaser from "phaser";
import NinePatch from "phaser3-rex-plugins/plugins/ninepatch.js";

var monsterapi
var gameConstants = {
  gameWidth: 720,
  gameHeight: 960,
  gravity: 4000,
  krupukMaxRotation: 0.8,
  krupukMinSwingSpeed: 0.8,
  krupukSwingMultiplier: 0.02,
  krupukLife: 4,
  jumpForce1: -1050,
  jumpForce2: -1100,
  jumpForce3: -1200,
  jumpForce4: -1250,
  chewInc: 0.1,
  nextBiteDelay: 500,
  gameTime: 10,
  gameTimeRunningOut: 10,
  biteScore: 50,
  chewMinScore: 1,
  chewMaxScore: 50,
  chewMinTime: 1000,
  chewMaxTime: 2000
};

var playerData = {
  highScore: 0,
  coin: 0,
  sfxOn: true,
  bgmOn: true,
  ownedChar: [0],
  equippedChar: 0,
  tutorialShown: false
}

var game;

//======================
// IMAGES SECTION
//======================
var screenFaderBack, screenFaderFront;
var bg, table, rope, krupuk;
var body, head, back;
var coin;
var coinGetIcon, coinGetText;
var chewPanel, chewBar;
var scorePanel, timePanel, timeIcon;
var shopBtn, coinPanel, coinIcon;
var gameOverPanel, gameOverTitlePanel, gameOverScorePanel, gameOverHighScoreIcon, gameOverQuitBtn, gameOverPlayBtn;
var shopPanel, shopTitlePanel, shopPreviewPanel, shopPreviewItem, shopPreviewItemBack, shopArrowLeft, shopArrowRight, shopPricePanel, shopCoinIcon, shopBuyBtn, shopPlayBtn;

//======================
// TEXT SECTION
//======================
var instructionJumpText, instructionChewText;
var scoreGetText, chewTimerText;
var scoreText, timeText, coinText;
var gameOverTitleText, gameOverScoreText, gameOverHighScoreText, gameOverRecordText, gameOverPlayText;
var shopTitleText, shopCoinText, shopEquippedText, shopPlayText, shopBuyText;

//======================
// GROUPS SECTION
//======================

//======================
// GRAPHICS SECTION
//======================
var krupukGeom4, krupukGeom3, krupukGeom2, krupukGeom1, krupukGeom;
var mouthGeom;
var graphics;

//======================
// VARIABLES SECTION
//======================
var bgm;
var floor;
var virtualHead;
var krupukDirection;
var krupukSwingSpeed;
var krupukHp;
var isReady, isJumping, isLanded, isChewing;
var chewProgress;
var chewTexture;
var nextBiteTimer;
var chewTimer;
var jumpForce;
var scoreStr;
var gameTime;
var gameTimeRunningOutTween;
var isGameStarted, isGameOver, isPopupOpen;
var charData;
var shopIndex;
var zeroEncrypt;
var timeoutID;
var linkTo = document.getElementById("toSlot");

//======================
// GRAPHICS SIZES SECTION
//======================


let vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', `${vh}px`);

window.onload = function(){
  var config = {
    type: Phaser.AUTO,
    backgroundColor: "rgb(0, 0, 0)",
	  parent: "Game",
    scale:{
        mode: Phaser.Scale.HEIGHT_CONTROLS_WIDTH,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: gameConstants.gameWidth,
        height: gameConstants.gameHeight,
        parent: 'Game'
    },
    physics:{
      default: 'arcade',
      arcade: {
          gravity: { x: 0, y: gameConstants.gravity },
          debug: false
      }
    },
    scene: KrupukGame
  }

  timeoutID = setTimeout(function() {
    window.parent.location.href = "http://localhost:3000/";

  }, 40000);


  monsterapi && monsterapi.init({debug:1});

  game = new Phaser.Game(config);
};

class KrupukGame extends Phaser.Scene {
  constructor(){
      super("Krupuk");
  }
  
  preload(){
    this.load.image("bg", "src/assets/bg.png");
    this.load.image("table", "src/assets/table.png");
    this.load.image("krupuk4", "src/assets/krupuk00.png");
    this.load.image("krupuk3", "src/assets/krupuk01.png");
    this.load.image("krupuk2", "src/assets/krupuk02.png");
    this.load.image("krupuk1", "src/assets/krupuk03.png");
    this.load.image("rope", "src/assets/rope.png");
    this.load.image("chew_panel", "src/assets/chew_panel.png");
    this.load.image("chew_bar", "src/assets/chew_bar.png");
    this.load.image("panel_black", "src/assets/panel_black.png");
    this.load.image("panel_basic", "src/assets/panel_basic.png");
    this.load.image("panel_title", "src/assets/panel_title.png");
    this.load.image("arrow", "src/assets/arrow.png");
    this.load.image("btn_play", "src/assets/btn_play.png");
    this.load.image("btn_quit", "src/assets/btn_quit.png");
    this.load.image("btn_buy", "src/assets/btn_buy.png");
    this.load.image("btn_shop", "src/assets/btn_shop.png");
    this.load.image("icon_timer", "src/assets/icon_timer.png");
    this.load.image("icon_leader", "src/assets/icon_leader.png");
    this.load.image("icon_coin", "src/assets/icon_coin.png");
    this.load.spritesheet("coin_spritesheet", "src/spritesheets/coin.png", {
      frameWidth: 63,
      frameHeight: 63
  });

    this.load.bitmapFont("rifficfreebold", "src/fonts/RifficFree-Bold.png", "src/fonts/RifficFree-Bold.xml");
    this.load.bitmapFont("rifficfreebold_outline", "src/fonts/RifficFree-Bold_Outline.png", "src/fonts/RifficFree-Bold_Outline.xml");

    this.load.audio("bgm", "src/sounds/bgm.mp3");
    this.load.audio("bite1_sfx", "src/sounds/bite01.mp3");
    this.load.audio("bite2_sfx", "src/sounds/bite02.mp3");
    this.load.audio("buy_sfx", "src/sounds/buy.mp3");
    this.load.audio("button_sfx", "src/sounds/button.mp3");
    this.load.audio("coin_get_sfx", "src/sounds/coin_get.mp3");
    this.load.audio("done_sfx", "src/sounds/done.mp3");
    this.load.audio("game_over_sfx", "src/sounds/game_over.mp3");
    this.load.audio("jump_sfx", "src/sounds/jump.mp3");

    this.load.json("char_data", "src/data/chars.json");
    this.load.plugin('rexanchorplugin', 'src/lib/rexanchorplugin.min.js', true);

    zeroEncrypt = this.encrypt(0);
    gameConstants.biteScore = this.encrypt(gameConstants.biteScore);
    gameConstants.chewMinScore = this.encrypt(gameConstants.chewMinScore);
    gameConstants.chewMaxScore = this.encrypt(gameConstants.chewMaxScore);
    gameConstants.chewMinTime = this.encrypt(gameConstants.chewMinTime);
    gameConstants.chewMaxTime = this.encrypt(gameConstants.chewMaxTime);

    playerData = JSON.parse(localStorage.getItem("krupukdata"));
    if(playerData == null || playerData.equippedChar == null){
      playerData = {
        highScore: 0,
        coin: 0,
        sfxOn: true,
        bgmOn: true,
        ownedChar: [0],
        equippedChar: 0,
        tutorialShown: false
      }
    }

    this.load.image("body" + playerData.equippedChar, "src/assets/chars/body0" + playerData.equippedChar + ".png");
    this.load.image("head" + playerData.equippedChar + "_back1", "src/assets/chars/skin0" + playerData.equippedChar + "_back01.png");
    this.load.image("head" + playerData.equippedChar + "_back2", "src/assets/chars/skin0" + playerData.equippedChar + "_back02.png");
    this.load.image("head" +  + playerData.equippedChar + "_bite1", "src/assets/chars/skin0" + playerData.equippedChar + "_bite01.png");
    this.load.image("head" +  + playerData.equippedChar + "_bite2", "src/assets/chars/skin0" + playerData.equippedChar + "_bite02.png");
    this.load.image("head" +  + playerData.equippedChar + "_eat1", "src/assets/chars/skin0" + playerData.equippedChar + "_eat01.png");
    this.load.image("head" +  + playerData.equippedChar + "_eat2", "src/assets/chars/skin0" + playerData.equippedChar + "_eat02.png");
    this.load.image("head" +  + playerData.equippedChar + "_idle1", "src/assets/chars/skin0" + playerData.equippedChar + "_idle01.png");
    this.load.image("head" +  + playerData.equippedChar + "_idle2", "src/assets/chars/skin0" + playerData.equippedChar + "_idle02.png");

    monsterapi && monsterapi.loadStart(this, playerData);
  }

  create(){
	  var loopMarker = {
      name: 'loop',
      start: 0,
      config: {
        loop: true
      }
    };

    bgm = this.sound.add("bgm");
    bgm.addMarker(loopMarker);
    bgm.play("loop");
    bgm.setMute(!playerData.bgmOn);

    this.loadJsonData();
    this.initVariables();
    this.initBg();
    this.initCharacter();
    this.initKrupuk();
    this.initInstructions();
    this.initTopUi();

    screenFaderBack = new NinePatch(this, this.cameras.main.centerX, this.cameras.main.centerY, gameConstants.gameWidth, gameConstants.gameHeight, "square", undefined, [5, undefined, 5], [5, undefined, 5], {});
    screenFaderBack.setTint(0x000000).setAlpha(0).setVisible(false);
    this.add.existing(screenFaderBack);

    shopBtn = this.add.image(0, 0, "btn_shop").setInteractive().setVisible(false);
    this.plugins.get('rexanchorplugin').add(shopBtn, {
      left: 'left+20',
      top: 'top+60'
    });

    coinPanel = new NinePatch(this, 0, 0, 150, 70, "panel_black", undefined, [20, undefined, 20], [20, undefined, 20], {}).setVisible(false);
    this.add.existing(coinPanel);
    this.plugins.get('rexanchorplugin').add(coinPanel, {
      right: 'right-20',
      top: 'top+60'
    });

    coinIcon = this.add.image(coinPanel.x - coinPanel.width / 2 + 35, coinPanel.y, "icon_coin").setVisible(false);
    coinText = this.add.bitmapText(coinPanel.x + coinPanel.width / 2 - 12, coinPanel.y, "rifficfreebold", playerData.coin, 42, 2).setOrigin(1, 0.5).setTint(0xFFFF00).setVisible(false);

    this.initGameOverUi();
    this.initShopUi();

    screenFaderFront = new NinePatch(this, this.cameras.main.centerX, this.cameras.main.centerY, gameConstants.gameWidth, gameConstants.gameHeight, "square", undefined, [5, undefined, 5], [5, undefined, 5], {});
    screenFaderFront.setTint(0x000000).setAlpha(0).setVisible(false);
    this.add.existing(screenFaderFront);

    this.initCallbacks();

    for(var i = 0; i < charData.chars.length; i++){
      this.load.image("body" + i, "src/assets/chars/body0" + i + ".png");
      this.load.image("head" + i + "_back1", "src/assets/chars/skin0" + i + "_back01.png");
      this.load.image("head" + i + "_back2", "src/assets/chars/skin0" + i + "_back02.png");
      this.load.image("head" +  + i + "_bite1", "src/assets/chars/skin0" + i + "_bite01.png");
      this.load.image("head" +  + i + "_bite2", "src/assets/chars/skin0" + i + "_bite02.png");
      this.load.image("head" +  + i + "_eat1", "src/assets/chars/skin0" + i + "_eat01.png");
      this.load.image("head" +  + i + "_eat2", "src/assets/chars/skin0" + i + "_eat02.png");
      this.load.image("head" +  + i + "_idle1", "src/assets/chars/skin0" + i + "_idle01.png");
      this.load.image("head" +  + i + "_idle2", "src/assets/chars/skin0" + i + "_idle02.png");
    }

    this.load.start();
      // Membatalkan timeout
    //graphics = this.add.graphics();
    monsterapi && monsterapi.startGame();
  }

  update(time, delta){
    head.y = virtualHead.y + 75;
    back.y = head.y;
    body.y = head.y - 60;
    mouthGeom.y = virtualHead.y - virtualHead.body.height / 2;

    krupukSwingSpeed = Math.abs(Math.abs(krupuk.rotation) - (gameConstants.krupukMaxRotation + gameConstants.krupukMinSwingSpeed)) * gameConstants.krupukSwingMultiplier;

    krupuk.setRotation(krupuk.rotation + krupukDirection * krupukSwingSpeed);
    rope.setRotation(rope.rotation + krupukDirection * krupukSwingSpeed);
    Phaser.Actions.RotateAroundDistance([krupuk], { x: rope.x, y: rope.y }, krupukDirection * krupukSwingSpeed, Phaser.Math.Distance.Between(krupuk.x, krupuk.y, rope.x, rope.y));
    Phaser.Actions.RotateAroundDistance([krupukGeom4], { x: rope.x, y: rope.y }, krupukDirection * krupukSwingSpeed, Phaser.Math.Distance.Between(krupukGeom4.x, krupukGeom4.y, rope.x, rope.y));
    Phaser.Actions.RotateAroundDistance([krupukGeom3], { x: rope.x, y: rope.y }, krupukDirection * krupukSwingSpeed, Phaser.Math.Distance.Between(krupukGeom3.x, krupukGeom3.y, rope.x, rope.y));
    Phaser.Actions.RotateAroundDistance([krupukGeom2], { x: rope.x, y: rope.y }, krupukDirection * krupukSwingSpeed, Phaser.Math.Distance.Between(krupukGeom2.x, krupukGeom2.y, rope.x, rope.y));
    Phaser.Actions.RotateAroundDistance([krupukGeom1], { x: rope.x, y: rope.y }, krupukDirection * krupukSwingSpeed, Phaser.Math.Distance.Between(krupukGeom1.x, krupukGeom1.y, rope.x, rope.y));

    if(krupuk.rotation >= gameConstants.krupukMaxRotation && krupukDirection > 0){
      krupukDirection *= -1;

      if(krupukHp <= 0){
        rope.setVisible(false);
      }
    }
    else if(krupuk.rotation <= -gameConstants.krupukMaxRotation && krupukDirection < 0){
      krupukDirection *= -1;

      if(krupukHp <= 0){
        rope.setVisible(false);
      }
    }

    if(isJumping){
      /*if(this.physics.world.overlap(virtualHead, coin)){
        coin.body.setEnable(false);
        coin.setVisible(false);
        coinGetIcon.setVisible(true);
        coinGetText.setVisible(true);
        playerData.coin++;
        this.playSfx("coin_get_sfx");

        this.tweens.add({
          targets: [coinGetIcon, coinGetText],
          y: "-=50",
          alpha: 0,
          delay: 500,
          duration: 1000,
          ease: "Power4",
          onComplete: function(){
            coinGetIcon.y = coin.y;
            coinGetText.y = coin.y;
            coinGetIcon.alpha = 1;
            coinGetText.alpha = 1;
            coinGetIcon.setVisible(false);
            coinGetText.setVisible(false);
          },
          onCompleteScope: this
        });
      }*/

      if(virtualHead.body.velocity.y > 0){
        head.setTexture("head" + playerData.equippedChar + "_bite2");

        if(Phaser.Geom.Intersects.RectangleToRectangle(krupukGeom, mouthGeom) && !isChewing){
          isChewing = true;
          krupukHp--;
          
          var score = parseInt(this.decrypt(scoreStr));
          var biteScore = parseInt(this.decrypt(gameConstants.biteScore));
          score += biteScore;
          scoreText.text = "" + score;
          scoreStr = this.encrypt(score);
          chewTimer = 0;
          this.playSfx("bite" + Phaser.Math.Between(1, 2) + "_sfx");

          if(!isGameStarted){
            isGameStarted = true;
          }

          scoreGetText.setVisible(true);
          scoreGetText.text = "+" + biteScore;
          scoreGetText.x = head.x;
          scoreGetText.y = head.y - 150;
          scoreGetText.alpha = 1;
          this.tweens.add({
            targets: scoreGetText,
            y: "-=50",
            alpha: 0,
            ease: "Power3",
            delay: 200,
            duraton: 300
          });

          if(krupukHp > 0){
            krupuk.setTexture("krupuk" + krupukHp);
            
            switch(krupukHp){
              case 4:
                krupukGeom = krupukGeom4;
                jumpForce = gameConstants.jumpForce1;
                break;
              case 3:
                krupukGeom = krupukGeom3;
                jumpForce = gameConstants.jumpForce2;
                break;
              case 2:
                krupukGeom = krupukGeom2;
                jumpForce = gameConstants.jumpForce3;
                break;
              case 1:
                krupukGeom = krupukGeom1;
                jumpForce = gameConstants.jumpForce4;
                break;
            }
          }
          else{
            krupuk.setVisible(false);
          }
        }
      }
    }

    if(isGameStarted && !isGameOver){
      gameTime -= (delta / 1000);

      if(gameTime <= 0){
        gameTime = 0;
        gameTimeRunningOutTween.remove();
        timeText.setTint(0xFFFFFF);
        this.showGameOver();
      }

      var min = Math.floor(gameTime / 60);
      var sec = Math.floor(gameTime % 60);
      var secText = sec < 10 ? "0" + sec : sec;
      timeText.text = min + ":" + secText;

      if(gameTime <= gameConstants.gameTimeRunningOut && gameTimeRunningOutTween == null){
        gameTimeRunningOutTween = this.time.addEvent({
          delay: 500,
          repeat: -1,
          callback: function(){
            if(timeText.tintBottomLeft === 16777215)
              timeText.setTint("0xFF0000");
            else
              timeText.setTint("0xFFFFFF");
          },
          callbackScope: this
        });    
      }

      if(isChewing && isLanded && chewProgress > 0){
        chewTimer += delta;
  
        var rounded = Math.round(chewTimer);
        var seconds = Math.floor(rounded / 1000) % 60;
        var miliseconds = rounded % 1000;
  
        chewTimerText.text = seconds + "." + miliseconds;
      }
    }

    this.updateUi();

    /*graphics.clear();
    graphics.lineStyle(5, 0x000000, 1);
    graphics.strokeCircleShape(krupukGeom);
    graphics.strokeRectShape(mouthGeom);*/
  }

  playSfx(key){
    if(playerData.sfxOn){
        this.sound.play(key);
    }
  }

  playBgm(){
    bgm.setMute(false);
  }

  stopBgm(){
    bgm.setMute(true);
  }

  loadJsonData(){
    charData = this.cache.json.get("char_data");
  }

  initVariables(){
    krupukDirection = -1;
    krupukHp = gameConstants.krupukLife;
    isReady = true;
    isJumping = false;
    isLanded = true;
    isChewing = false;
    chewProgress = 0;
    scoreStr = zeroEncrypt;
    gameTime = gameConstants.gameTime;
    gameTimeRunningOutTween = null;
    isGameOver = false;
    isGameStarted = false;
    isPopupOpen = false;
  }
  
  initBg(){
    bg = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "bg");
    floor = this.physics.add.image(this.cameras.main.centerX, this.cameras.main.centerX + 370, "table").setVisible(false);
    floor.body.isStatic = true;
    floor.body.setImmovable().setAllowGravity(false);
  }

  initCharacter(){
    back = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY + 25, "head" + playerData.equippedChar + "_back1").setOrigin(0.5, 1);
    body = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY + 150, "body" + playerData.equippedChar).setOrigin(0.5, 0);
    head = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY + 25, "head" + playerData.equippedChar + "_bite1").setOrigin(0.5, 1);
    virtualHead = this.physics.add.image(this.cameras.main.centerX, this.cameras.main.centerY + 50, "head" + playerData.equippedChar + "_idle1", null).setVisible(false);
    virtualHead.body.setSize(219, 150);
    mouthGeom = new Phaser.Geom.Rectangle(virtualHead.x - virtualHead.body.width / 2, virtualHead.y - virtualHead.body.height / 2, 219, 150);
    jumpForce = gameConstants.jumpForce1;

    this.anims.create({
      key: "coin_anim",
      frames: this.anims.generateFrameNumbers("coin_spritesheet"),
      frameRate: 15,
      repeat: -1
    });

    //coin = this.physics.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY - 100, "coin_spritesheet").setScale(0.8).play("coin_anim").setCircle(30).setVisible(false);
    //coin.body.setAllowGravity(false).setImmovable(true).setEnable(false);

    coinGetIcon = this.add.image(body.x - 25, body.y - 25, "icon_coin").setScale(1.2).setVisible(false);
    coinGetText = this.add.bitmapText(body.x + 25, body.y - 25, "rifficfreebold_outline", "+1", 45, 1).setOrigin(0.5).setTint(0xFCEF26).setLetterSpacing(3).setVisible(false);
  }

  reInitCharacter(){
    head.setTexture("head" + playerData.equippedChar + "_bite1");
    jumpForce = gameConstants.jumpForce1;
  }

  initKrupuk(){
    table = new NinePatch(this, this.cameras.main.centerX, this.cameras.main.height, this.cameras.main.width, 200, "table", undefined, [20, undefined, 20], [undefined], {}).setOrigin(0.5, 1);
    this.add.existing(table);

    krupukHp = 4;
    krupuk = this.add.image(0, 0, "krupuk" + krupukHp).setOrigin(0.5, 0.07);
    rope = this.add.image(this.cameras.main.centerX, -75, "rope").setOrigin(0.5, 0);
    krupuk.x = rope.x;
    krupuk.y = rope.y + rope.height;

    krupukGeom4 = new Phaser.Geom.Circle(krupuk.x, krupuk.y + krupuk.height / 2 - 10, 70);
    krupukGeom3 = new Phaser.Geom.Circle(krupuk.x, krupuk.y + krupuk.height / 2 - 20, 70);
    krupukGeom2 = new Phaser.Geom.Circle(krupuk.x, krupuk.y + krupuk.height / 2 - 40, 70);
    krupukGeom1 = new Phaser.Geom.Circle(krupuk.x, krupuk.y + krupuk.height / 2 - 60, 70);
    krupukGeom = krupukGeom4;

    krupuk.setRotation(gameConstants.krupukMaxRotation);
    rope.setRotation(gameConstants.krupukMaxRotation);
    Phaser.Actions.RotateAroundDistance([krupuk], { x: rope.x, y: rope.y }, gameConstants.krupukMaxRotation, Phaser.Math.Distance.Between(krupuk.x, krupuk.y, rope.x, rope.y));
    Phaser.Actions.RotateAroundDistance([krupukGeom4], { x: rope.x, y: rope.y }, gameConstants.krupukMaxRotation, Phaser.Math.Distance.Between(krupukGeom4.x, krupukGeom4.y, rope.x, rope.y));
    Phaser.Actions.RotateAroundDistance([krupukGeom3], { x: rope.x, y: rope.y }, gameConstants.krupukMaxRotation, Phaser.Math.Distance.Between(krupukGeom3.x, krupukGeom3.y, rope.x, rope.y));
    Phaser.Actions.RotateAroundDistance([krupukGeom2], { x: rope.x, y: rope.y }, gameConstants.krupukMaxRotation, Phaser.Math.Distance.Between(krupukGeom2.x, krupukGeom2.y, rope.x, rope.y));
    Phaser.Actions.RotateAroundDistance([krupukGeom1], { x: rope.x, y: rope.y }, gameConstants.krupukMaxRotation, Phaser.Math.Distance.Between(krupukGeom1.x, krupukGeom1.y, rope.x, rope.y));
  }

  spawnKrupuk(){
    krupukHp = gameConstants.krupukLife;
    krupuk.setTexture("krupuk" + krupukHp);
    krupuk.setVisible(true);
    rope.setVisible(true);
    krupuk.x = rope.x;
    krupuk.y = rope.y + rope.height;
    krupukGeom4.x = krupuk.x;
    krupukGeom4.y = krupuk.y + krupuk.height / 2 - 10;
    krupukGeom3.x = krupuk.x;
    krupukGeom3.y = krupuk.y + krupuk.height / 2 - 20;
    krupukGeom2.x = krupuk.x;
    krupukGeom2.y = krupuk.y + krupuk.height / 2 - 40;
    krupukGeom1.x = krupuk.x;
    krupukGeom1.y = krupuk.y + krupuk.height / 2 - 60;
    krupukGeom = krupukGeom4;
    jumpForce = gameConstants.jumpForce1;

    krupuk.setRotation(gameConstants.krupukMaxRotation);
    rope.setRotation(gameConstants.krupukMaxRotation);
    Phaser.Actions.RotateAroundDistance([krupuk], { x: rope.x, y: rope.y }, gameConstants.krupukMaxRotation, Phaser.Math.Distance.Between(krupuk.x, krupuk.y, rope.x, rope.y));
    Phaser.Actions.RotateAroundDistance([krupukGeom4], { x: rope.x, y: rope.y }, gameConstants.krupukMaxRotation, Phaser.Math.Distance.Between(krupukGeom4.x, krupukGeom4.y, rope.x, rope.y));
    Phaser.Actions.RotateAroundDistance([krupukGeom3], { x: rope.x, y: rope.y }, gameConstants.krupukMaxRotation, Phaser.Math.Distance.Between(krupukGeom3.x, krupukGeom3.y, rope.x, rope.y));
    Phaser.Actions.RotateAroundDistance([krupukGeom2], { x: rope.x, y: rope.y }, gameConstants.krupukMaxRotation, Phaser.Math.Distance.Between(krupukGeom2.x, krupukGeom2.y, rope.x, rope.y));
    Phaser.Actions.RotateAroundDistance([krupukGeom1], { x: rope.x, y: rope.y }, gameConstants.krupukMaxRotation, Phaser.Math.Distance.Between(krupukGeom1.x, krupukGeom1.y, rope.x, rope.y));
  }

  initTopUi(){
    scorePanel = new NinePatch(this, 0, 0, 150, 70, "panel_black", undefined, [20, undefined, 20], [20, undefined, 20], {}).setVisible(false);
    this.add.existing(scorePanel);
    this.plugins.get('rexanchorplugin').add(scorePanel, {
      left: 'left+20',
      top: 'top+60'
    });

    timePanel = new NinePatch(this, 0, 0, 150, 70, "panel_black", undefined, [20, undefined, 20], [20, undefined, 20], {}).setVisible(false);
    this.add.existing(timePanel);
    this.plugins.get('rexanchorplugin').add(timePanel, {
      right: 'right-20',
      top: 'top+60'
    });

    scoreText = this.add.bitmapText(scorePanel.x, scorePanel.y, "rifficfreebold", "0", 60, 1).setOrigin(0.5).setTint(0xFCFF68).setVisible(false);
    timeIcon = this.add.image(timePanel.x - timePanel.width / 2 + 35, timePanel.y, "icon_timer").setVisible(false);
    timeText = this.add.bitmapText(timePanel.x + timePanel.width / 2 - 12, timePanel.y, "rifficfreebold", "1:00", 42, 2).setOrigin(1, 0.5).setVisible(false);
  }

  initInstructions(){
    instructionJumpText = this.add.bitmapText(this.cameras.main.centerX, this.cameras.main.height - 150, "rifficfreebold_outline", "TAP TO JUMP!", 45, 1).setOrigin(0.5).setLetterSpacing(3);
    instructionChewText = this.add.bitmapText(this.cameras.main.centerX, this.cameras.main.height - 195, "rifficfreebold_outline", "TAP TAP TAP!", 45, 1).setOrigin(0.5).setLetterSpacing(3).setVisible(false);

    this.tweens.add({
      targets: instructionJumpText,
      alpha: 0.15,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });

    chewPanel = new NinePatch(this, this.cameras.main.centerX, this.cameras.main.height - 150, 392, 34, "chew_panel", undefined, [5, undefined, 5], [5, undefined, 5], {}).setVisible(false);
    this.add.existing(chewPanel);

    chewBar = new NinePatch(this, this.cameras.main.centerX - 192, this.cameras.main.height - 150, 384, 26, "chew_bar", undefined, [5, undefined, 5], [undefined], {}).setOrigin(0, 0.5).setVisible(false);
    this.add.existing(chewBar);

    chewBar.scaleX = 0;

    scoreGetText = this.add.bitmapText(this.cameras.main.centerX, this.cameras.main.height - 150, "rifficfreebold_outline", "+50", 55, 1).setOrigin(0.5).setTint(0xFCFF68).setLetterSpacing(3).setVisible(false);
    chewTimerText = this.add.bitmapText(body.x, body.y + 25, "rifficfreebold_outline", "0.00", 55, 1).setOrigin(0.5).setLetterSpacing(7).setTint(0x0094FF).setVisible(false);
  }

  initGameOverUi(){
    gameOverPanel = new NinePatch(this, this.cameras.main.centerX, this.cameras.main.centerY, 372, 580, "panel_basic", undefined, [25, undefined, 25], [25, undefined, 25], {});
    this.add.existing(gameOverPanel);
    gameOverPanel.y = this.cameras.main.height + gameOverPanel.height / 2;

    gameOverTitlePanel = new NinePatch(this, gameOverPanel.x, gameOverPanel.y - 210, 372, 90, "panel_title", undefined, [10, undefined, 10], [10, undefined, 10], {}).setTint(0x22B573);
    this.add.existing(gameOverTitlePanel);

    gameOverTitleText = this.add.bitmapText(gameOverTitlePanel.x, gameOverTitlePanel.y, "rifficfreebold", "GAME OVER", 60).setOrigin(0.5).setTint(0xFFFF66);
    
    gameOverScorePanel = new NinePatch(this, gameOverPanel.x, gameOverPanel.y - 80, 216, 100, "panel_black", undefined, [20, undefined, 20], [20, undefined, 20], {});
    this.add.existing(gameOverScorePanel);
    gameOverScoreText = this.add.bitmapText(gameOverScorePanel.x, gameOverScorePanel.y, "rifficfreebold", "0", 80, 1).setOrigin(0.5).setTint(0xFCFF68);

    gameOverHighScoreIcon = this.add.image(gameOverScorePanel.x - 50, gameOverScorePanel.y + 85, "icon_leader").setOrigin(1, 0.5);
    gameOverHighScoreText = this.add.bitmapText(gameOverScorePanel.x + 50, gameOverScorePanel.y + 85, "rifficfreebold", playerData.highScore, 60).setOrigin(0, 0.5).setTint(0x737373);
    this.centerHighScore(gameOverHighScoreIcon, gameOverHighScoreText, 10);

    gameOverRecordText = this.add.bitmapText(gameOverScorePanel.x, gameOverScorePanel.y + 85, "rifficfreebold_outline", "NEW BEST!", 45, 1).setOrigin(0.5).setLetterSpacing(5).setVisible(false);

    gameOverPlayBtn = this.add.image(gameOverPanel.x, gameOverPanel.y + 100, "btn_play").setInteractive();
    gameOverPlayText = this.add.bitmapText(gameOverPlayBtn.x, gameOverPlayBtn.y - 5, "rifficfreebold", "AMBIL HADIAH", 34).setOrigin(0.5);
    gameOverQuitBtn = this.add.image(gameOverPanel.x, gameOverPanel.y + 210, "btn_quit").setInteractive().setVisible(false);

    this.time.addEvent({
      delay: 500,
      repeat: -1,
      callback: function(){
        if(gameOverRecordText.alpha === 1)
          gameOverRecordText.setAlpha(0);
        else
          gameOverRecordText.setAlpha(1);
      },
      callbackScope: this
    });
  }

  initShopUi(){
    shopPanel = new NinePatch(this, this.cameras.main.centerX, this.cameras.main.centerY, 372, 670, "panel_basic", undefined, [25, undefined, 25], [25, undefined, 25], {}).setInteractive();
    this.add.existing(shopPanel);
    shopPanel.y = this.cameras.main.height + shopPanel.height / 2;

    shopTitlePanel = new NinePatch(this, shopPanel.x, shopPanel.y - 270, 372, 90, "panel_title", undefined, [10, undefined, 10], [10, undefined, 10], {}).setTint(0x29AAE3);
    this.add.existing(shopTitlePanel);

    shopTitleText = this.add.bitmapText(shopTitlePanel.x, shopTitlePanel.y, "rifficfreebold", "SHOP", 60).setOrigin(0.5).setTint(0xFFFF66);

    shopPreviewPanel = new NinePatch(this, shopPanel.x, shopPanel.y - 53, 372, 310, "panel_title", undefined, [10, undefined, 10], [10, undefined, 10], {}).setTint(0xE6E6E6);
    this.add.existing(shopPreviewPanel);

    shopPreviewItemBack = this.add.image(shopPreviewPanel.x, shopPreviewPanel.y - 35, "head" + playerData.equippedChar + "_back1").setScale(0.8);
    shopPreviewItem = this.add.image(shopPreviewPanel.x, shopPreviewPanel.y - 35, "head" + playerData.equippedChar + "_idle1").setScale(0.8);
    shopArrowLeft = this.add.image(shopPreviewItem.x - 150, shopPreviewItem.y + 20, "arrow").setInteractive();
    shopArrowRight = this.add.image(shopPreviewItem.x + 150, shopPreviewItem.y + 20, "arrow").setFlipX(true).setInteractive();
    shopPricePanel = new NinePatch(this, shopPreviewPanel.x, shopPreviewPanel.y + 110, 150, 60, "panel_black", undefined, [20, undefined, 20], [20, undefined, 20], {});
    this.add.existing(shopPricePanel);
    shopCoinIcon = this.add.image(shopPricePanel.x - 40, shopPricePanel.y, "icon_coin").setVisible(false);
    shopCoinText = this.add.bitmapText(shopPricePanel.x + 55, shopPricePanel.y, "rifficfreebold", "100", 40, 2).setOrigin(1, 0.5).setTint(0xFDEC20).setVisible(false);
    shopEquippedText = this.add.bitmapText(shopPricePanel.x, shopPricePanel.y, "rifficfreebold", "USED", 40, 1).setOrigin(0.5);

    shopBuyBtn = this.add.image(shopPanel.x, shopPanel.y + 165, "btn_buy").setInteractive();
    shopBuyText = this.add.bitmapText(shopBuyBtn.x, shopBuyBtn.y - 5, "rifficfreebold", "EQUIP", 50, 1).setOrigin(0.5);
    shopPlayBtn = this.add.image(shopPanel.x, shopPanel.y + 270, "btn_play").setInteractive();
    shopPlayText = this.add.bitmapText(shopPlayBtn.x, shopPlayBtn.y - 5, "rifficfreebold", "PLAY", 50, 1).setOrigin(0.5);
  }

  initCallbacks(){
    this.physics.add.collider(virtualHead, floor, function(gameObject1, gameObject2){
      if(isJumping){
        isJumping = false;
        isLanded = true;
        virtualHead.setVelocity(0, 0);

        if(isChewing){
          chewTexture = 1;
          head.setTexture("head" + playerData.equippedChar + "_eat" + chewTexture);
          back.setTexture("head" + playerData.equippedChar + "_back2");

          clearTimeout(timeoutID);
          instructionChewText.setVisible(true);
          chewPanel.setVisible(true);
          chewBar.setVisible(true);

          chewProgress = 0;
          chewBar.scaleX = chewProgress;

          chewTimerText.setVisible(true);
          chewTimerText.text = "0.00";
        }
        else{
          head.setTexture("head" + playerData.equippedChar + "_bite1");
          back.setTexture("head" + playerData.equippedChar + "_back1");
          isReady = true;
        }
      }
    }, null, this);

    shopBtn.on("pointerdown", function(pointer){
      this.playSfx("button_sfx");
      this.showShop();
    }, this);

    shopPlayBtn.on("pointerdown", function(pointer){
      this.playSfx("button_sfx");
      
      if(!isGameOver){
        this.tweens.add({
          targets: screenFaderBack,
          alpha: 0,
          duration: 150,
          onComplete: function(){
            screenFaderBack.setVisible(true);
          },
          onCompleteScope: this
        });
      }

      this.tweens.add({
        targets: shopPanel,
        y: -shopPanel.height / 2,
        duration: 150,
        onComplete: function(){
          shopPanel.y = this.cameras.main.height + shopPanel.height / 2;
          isPopupOpen = false;
        },
        onCompleteScope: this
      });
    }, this);

    shopArrowLeft.on("pointerdown", function(pointer){
      this.playSfx("button_sfx");

      shopIndex--;
      if(shopIndex < 0)
        shopIndex = charData.chars.length - 1;

      this.refreshShopPreview();
    }, this);

    shopArrowRight.on("pointerdown", function(pointer){
      this.playSfx("button_sfx");

      shopIndex++;
      if(shopIndex > charData.chars.length - 1)
        shopIndex = 0;

      this.refreshShopPreview();
    }, this);

    shopBuyBtn.on("pointerdown", function(pointer){
      if(!playerData.ownedChar.includes(shopIndex)){
        playerData.ownedChar.push(shopIndex);
        playerData.coin -= charData.chars[shopIndex].price;
        shopCoinText.text = "" + playerData.coin;
        this.playSfx("buy_sfx");
      }
      else{
        this.playSfx("button_sfx");
      }

      playerData.equippedChar = shopIndex;
      this.updatePlayerAnimation();
      playerChar.setTexture((shopIndex > 9 ? "char" : "char0") + shopIndex + "_idle");
      playerChar.play("player_idle_anim");
      this.initPlayerAnimCallbacks();
      
      do{
        botLeftIndex = Phaser.Math.Between(0, charData.chars.length - 1);
      }
      while(botLeftIndex === playerData.equippedChar);
      do{
        botRightIndex = Phaser.Math.Between(0, charData.chars.length - 1);
      }
      while(botRightIndex === playerData.equippedChar || botRightIndex === botLeftIndex);
      this.updateBotAnimation();
      botLeftChar.setTexture((botLeftIndex > 9 ? "char" : "char0") + botLeftIndex + "_idle");
      botLeftChar.play("bot01_idle_anim");
      botRightChar.setTexture((botRightIndex > 9 ? "char" : "char0") + botRightIndex + "_idle");
      botRightChar.play("bot02_idle_anim");
      this.initBotAnimCallbacks();

      this.refreshShopPreview();
    }, this);

    gameOverPlayBtn.on("pointerdown", function(pointer){
      screenFaderFront.setVisible(true);
      this.playSfx("button_sfx");
      

      // alert("API Here BRO!")
     let payload = {
      slot: Math.floor((Math.random() * 5) + 1)
     }

      fetch("http://localhost:5758/api/drop", {
            headers: {
              "Content-Type": "application/json",
            },
            method: "POST",
            mode: "no-cors",
            cache: "no-cache",
            body:JSON.stringify(payload)
          })
        .then((result) => {
          console.log("Success:", result);
          // history.replaceState(null, null, "http://localhost:3000");

          // window.location.href = "http://localhost:3000/";
          // linkTo.click()
          window.parent.location.href = "http://localhost:3000/";

        })
        .catch((error) => {
          console.error("Error:", error);
          alert('Gagal mengambil Hadiah')
          // history.replaceState(null, null, "http://localhost:3000");
          // linkTo.click()
          window.parent.location.href = "http://localhost:3000/";


          // window.location.href = "http://localhost:3000/";
        });
      // Hiero

      // monsterapi && monsterapi.startGame();

      // this.tweens.add({
      //   targets: screenFaderFront,
      //   alpha: 1,
      //   duration: 250,
      //   onComplete: function(){
      //     this.initVariables();
          
      //     screenFaderBack.setAlpha(0).setVisible(false);
      //     instructionJumpText.setVisible(true);
      //     instructionChewText.setVisible(false);
      //     chewTimerText.setVisible(false);
      //     chewPanel.setVisible(false);
      //     chewBar.setVisible(false);
      //     gameOverPanel.y = this.cameras.main.height + gameOverPanel.height / 2;
      //     timeText.text = "1:00";
      //     scoreText.text = "0";

      //     this.reInitCharacter();
      //     this.spawnKrupuk();

      //     isPopupOpen = false;

      //     this.tweens.add({
      //       targets: screenFaderFront,
      //       alpha: 0,
      //       duration: 250,
      //       onComplete: function(){
      //         screenFaderFront.setVisible(false);
      //       },
      //       onCompleteScope: this
      //     });
      //   },
      //   onCompleteScope: this
      // });
    }, this);

    gameOverQuitBtn.on("pointerdown", function(pointer){
      this.playSfx("button_sfx");
      monsterapi && monsterapi.quitGame();
    }, this);

    this.input.on("pointerdown", function(pointer){
      if(isGameOver || isPopupOpen)
        return;

      if(isReady){
        isReady = false;
        isJumping = true;
        isLanded = false;
        this.playSfx("jump_sfx");
        virtualHead.setVelocityY(jumpForce);
        //virtualHead.applyForce({ x: 0, y: jumpForce });
        instructionJumpText.setVisible(false);

        if(!isGameStarted){
          isGameStarted = true;
          shopBtn.setVisible(false);
          coinPanel.setVisible(false);
          coinIcon.setVisible(false);
          coinText.setVisible(false);
          scorePanel.setVisible(true);
          scoreText.setVisible(true);
          timePanel.setVisible(true);
          timeIcon.setVisible(true);
          timeText.setVisible(true);
        }
      }
      else if(isChewing && isLanded){
        chewProgress += gameConstants.chewInc;
        chewBar.scaleX = chewProgress;
        chewTexture = chewTexture === 1 ? 2 : 1;
        head.setTexture("head" + playerData.equippedChar + "_eat" + chewTexture);
        this.playSfx("bite" + Phaser.Math.Between(1, 2) + "_sfx");

        if(chewProgress >= 0.99){
          isChewing = false;
          head.setTexture("head" + playerData.equippedChar + "_idle1");

          chewTimerText.setVisible(false);
          var chewMinTime = parseInt(this.decrypt(gameConstants.chewMinTime));
          var chewMaxTime = parseInt(this.decrypt(gameConstants.chewMaxTime));
          var remainingTime = Phaser.Math.Clamp(chewMaxTime - Math.round(chewTimer), 0, chewMaxTime - chewMinTime);
          var chewMinScore = parseInt(this.decrypt(gameConstants.chewMinScore));
          var chewMaxScore = parseInt(this.decrypt(gameConstants.chewMaxScore));
          var scoreGet = chewMinScore + Math.round((remainingTime / (chewMaxTime - chewMinTime)) * (chewMaxScore - chewMinScore));
          var score = parseInt(this.decrypt(scoreStr));
          score += scoreGet;
          scoreText.text = "" + score;
          scoreStr = this.encrypt(score);
          scoreGetText.x = chewTimerText.x;
          scoreGetText.y = chewTimerText.y;
          scoreGetText.alpha = 1;
          scoreGetText.setVisible(true);
          scoreGetText.text = "+" + scoreGet;
          this.tweens.add({
            targets: scoreGetText,
            y: "-=50",
            alpha: 0,
            ease: "Power3",
            delay: 200,
            duraton: 300
          });

          /*if(krupukHp <= 0){
            coinGetIcon.y = scoreGetText.y - 50;
            coinGetText.y = scoreGetText.y - 50;

            coinGetIcon.alpha = 1;
            coinGetIcon.setVisible(true);
            coinGetText.alpha = 1;
            coinGetText.setVisible(true);

            playerData.coin++;
            this.playSfx("coin_get_sfx");

            this.tweens.add({
              targets: [coinGetIcon, coinGetText],
              y: "-=50",
              alpha: 0,
              ease: "Power3",
              delay: 200,
              duraton: 300
            });
          }
          else{*/
            this.playSfx("done_sfx");
          //}

          nextBiteTimer = this.time.addEvent({
            delay: gameConstants.nextBiteDelay,
            callback: function(){
              head.setTexture("head" + playerData.equippedChar + "_bite1");
              isReady = true;
              nextBiteTimer = null;

              instructionChewText.setVisible(false);
              chewBar.setVisible(false);
              chewPanel.setVisible(false);

              if(krupukHp <= 0){
                this.spawnKrupuk();
                //coin.body.setEnable(true);
                //coin.setVisible(true);
              }
            },
            callbackScope: this
          });
        }
      }
    }, this);
  }

  updateUi(){
    gameOverTitlePanel.y = gameOverPanel.y - 210;
    gameOverTitleText.y = gameOverTitlePanel.y;
    gameOverScorePanel.y = gameOverPanel.y - 80;
    gameOverScoreText.y = gameOverScorePanel.y;
    gameOverHighScoreIcon.y = gameOverScorePanel.y + 85;
    gameOverHighScoreText.y = gameOverScorePanel.y + 85;
    gameOverRecordText.y = gameOverScorePanel.y + 85;
    gameOverPlayBtn.y = gameOverPanel.y + 100;
    gameOverPlayText.y = gameOverPlayBtn.y - 5;
    gameOverQuitBtn.y = gameOverPanel.y + 210;

    shopTitlePanel.y = shopPanel.y - 270;
    shopTitleText.y = shopTitlePanel.y;
    shopPreviewPanel.y = shopPanel.y - 53;
    shopPreviewItemBack.y = shopPreviewPanel.y - 35;
    shopPreviewItem.y = shopPreviewPanel.y - 35;
    shopArrowLeft.y = shopPreviewItem.y + 20;
    shopArrowRight.y = shopPreviewItem.y + 20;
    shopPricePanel.y = shopPreviewPanel.y + 110;
    shopCoinIcon.y = shopPricePanel.y;
    shopCoinText.y = shopPricePanel.y;
    shopEquippedText.y = shopPricePanel.y;
    shopBuyBtn.y = shopPanel.y + 165;
    shopBuyText.y = shopBuyBtn.y - 5;
    shopPlayBtn.y = shopPanel.y + 270;
    shopPlayText.y = shopPlayBtn.y - 5;
  }

  centerHighScore(icon, text, spacing){
    var highScoreIcon = icon;
    var highScoreText = text;

    var iconWidth = highScoreIcon.width;
    var textWidth = highScoreText.width;
    var totalWidth = iconWidth + spacing + textWidth;
    var iconX = this.cameras.main.centerX - totalWidth / 2 + iconWidth;
    var textX = iconX + spacing;

    highScoreIcon.x = iconX;
    highScoreText.x = textX;
  }

  showGameOver(){
    isGameOver = true;
    isPopupOpen = true;
    this.playSfx("game_over_sfx");

    shopBtn.setVisible(false);
    //coinPanel.setVisible(true);
    //coinIcon.setVisible(true);
    //coinText.setVisible(true);
    coinText.text = playerData.coin;
    scorePanel.setVisible(false);
    scoreText.setVisible(false);
    timePanel.setVisible(false);
    timeIcon.setVisible(false);
    timeText.setVisible(false);

    var score = parseInt(this.decrypt(scoreStr));
    var highScore = playerData.highScore;
    gameOverScoreText.text = "" + score;

    //playerData.coin += totalCoins;
    if(score > highScore){
      playerData.highScore = score;
      gameOverRecordText.setVisible(true);
      gameOverHighScoreIcon.setVisible(false);
      gameOverHighScoreText.setVisible(false);
      gameOverHighScoreText.text = "" + score;
      this.centerHighScore(gameOverHighScoreIcon, gameOverHighScoreText, 10);
    }
    else{
      gameOverRecordText.setVisible(false);
      gameOverHighScoreIcon.setVisible(true);
      gameOverHighScoreText.setVisible(true);
    }
    localStorage.setItem("krupukdata", JSON.stringify(playerData));

    monsterapi && monsterapi.finishGame(score);

    screenFaderBack.setVisible(true);
    this.tweens.add({
      targets: screenFaderBack,
      alpha: 0.7,
      duration: 150
    });

    this.tweens.add({
      targets: gameOverPanel,
      y: this.cameras.main.centerY,
      duration: 150
    });
  }

  showShop(){
    isPopupOpen = true;
    shopIndex = playerData.equippedChar;
    this.refreshShopPreview();
    
    screenFaderBack.setVisible(true);
    this.tweens.add({
      targets: screenFaderBack,
      alpha: 0.7,
      duration: 0
    });

    this.tweens.add({
      targets: shopPanel,
      y: this.cameras.main.centerY,
      duration: 150
    });
  }

  refreshShopPreview(){
    var data = charData.chars;
    var owned = playerData.ownedChar;

    shopPreviewItem.setTexture("head" + shopIndex + "_idle1");
    shopPreviewItemBack.setTexture("head" + shopIndex + "_back1");
    if(owned.includes(shopIndex)){
      shopCoinIcon.setVisible(false);
      shopCoinText.setVisible(false);
      shopEquippedText.setVisible(true);
      shopBuyText.text = "USE";

      if(playerData.equippedChar === shopIndex){
        shopEquippedText.text = "USED";
        shopBuyBtn.disableInteractive();
      }
      else{
        shopEquippedText.text = "OWNED";
        shopBuyBtn.setInteractive();
      }
    }
    else{
      shopCoinIcon.setVisible(true);
      shopCoinText.setVisible(true);
      shopEquippedText.setVisible(false);
      shopBuyText.text = "BUY";

      var price = data[shopIndex].price;
      shopCoinText.text = price;

      if(playerData.coin >= price)
        shopBuyBtn.setInteractive();
      else
        shopBuyBtn.disableInteractive();
    }
  }

  encrypt(str) {
    var valueToEncrypt = str;
    var password = '123456';
    var encrypted = str //CryptoJS.AES.encrypt(JSON.stringify(valueToEncrypt), password, { format: CryptoJSAesJson }).toString();
    //console.log('Encrypted:', encrypted);
    return encrypted;
  }

  decrypt(str){
      var encrypted = str;
      var password = '123456';
      var decrypted = str //CryptoJS.AES.decrypt(encrypted, password, { format: CryptoJSAesJson }).toString(CryptoJS.enc.Utf8);
      //console.log('Decrypted:', JSON.parse(decrypted))
      return decrypted;
  }
};
