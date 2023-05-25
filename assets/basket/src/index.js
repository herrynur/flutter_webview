import Phaser from "phaser";
import md5 from "md5";

var gameConstants = {
	gravity: 5,
	gameWidth: 720,
	gameHeight: 960,
	resetBallPositionFrameThreshold: 10,
	ballBounciness: 0.6,
	ballScaleOnLaunch: 0.65,
	ballShootRoundingValue: 10,
	firstHurdleScore: 10,
	secondHurdleScore: 20,
	thirdHurdleScore: 30,
	feverModeEnterCount: 5,
	feverModeGoneTime: 10000,
	lifeCount: 3,
	coinShowScoreGet: 10,
	cheer2ConsecutivePerfectGoals: 3,
	baseScore: 2,
};
var playerData = {
	highScore: 0,
	coin: 0,
	ownedBalls: [0],
	ownedBoards: [0],
	ownedFloors: [0],
	equippedBall: 0,
	equippedBoard: 0,
	equippedFloor: 0,
	sfxOn: true,
	bgmOn: true,
	tutorialShown: false,
};

var game;

//======================
// IMAGES SECTION
//======================
var background;
var ground;
var board;
var boardShadow;
var hoop;
var hoopShine;
var ball;
var ballShading;
var ballShadow;
var ballShine;
var ringCoin;
var panelCoin;
var panelScore;
var btnShop;
var leader;
var coin;
var comboPanel;
var comboPanelActive;
var comboBarBack;
var comboBarFront;
var gameOverPopup;
var gameOverPopupTitle;
var gameOverYourScoreBg;
var tryAgainPopup;
var btnRestart;
var btnQuit;
var btnBuy;
var shopPopup;
var shopPopupTitle;
var shopPreviewBg;
var shopPreview;
var shopPreviewShading;
var shopPreviewHoop;
var priceLabel;
var priceCoin;
var btnPlay;
var screenFader;
var tutorialFinger;

//======================
// NET SECTION
//======================
var net;
var netLines = [];
var netGraphics;
var anchor1;
var anchor2;
var anchor3;
var anchor4;
var left1;
var left2;
var left3;
var left4;
var right1;
var right2;
var right3;
var right4;
var midleft1;
var midright1;
var mid1;
var mid2;
var mid3;

//======================
// TEXT SECTION
//======================
var coinText;
var leaderText;
var scoreText;
var pointText;
var comboText, multiplierText;
//var pointGetText;
var tryAgainText, gameOverText, yourScoreText, resultScoreText, restartText, quitText;
var shopText, shopCategoryText, shopCategoryPrev, shopCategoryNext, shopItemPrev, shopItemNext, shopEquipText, buyText, buyPriceText, playText;

//======================
// GROUPS SECTION
//======================
var ring;
var buyBtnPriceGroup;

//======================
// VARIABLES SECTION
//======================
var ballLives = [];
var ballsData;
var floorsData;
var boardsData;
var hoopsData;
var isEasing;
var isDragging;
var isBallLaunched;
var isFeverMode;
var resetBallPositionFrame = 0;
var collisionCategory1;
var collisionCategory2;
var ringColliderLeft;
var ringColliderRight;
var resetBallPositionTween = null;
var goal = false;
var collideWithHoop = false;
var gameStarted = false;
var gameOver = false;
var scoreStr;
var combo = 0;
var comboBarDecreaseTween = null;
var isXMoving = false;
var lives;
var feverModeCount = 0;
var feverModeTime = 0;
var feverModeMultiplier = 1;
var prevDrag = {
	x: 999999,
	y: 999999,
};
var ballStartPos = {
	x: 0,
	y: 0,
};
var hoopStartPos = {
	x: 0,
	y: 0,
};
var blinkTextTimer = null;
var isPopupOpen = false;
var shopCategories = ["BALL", "BOARD", "FLOOR"];
var shopCategoryIndex = 0;
var shopIndex = 0;
var currentItemPrice = 0;
var coinFlyingUp = false;
var coinAvailable = false;
var consecutivePerfectGoals = 0;
var bgm;
var tutorialTween;
var zeroEncrypt;

//======================
// GRAPHICS SIZES SECTION
//======================
var gameOverWindowSize = new Phaser.Structs.Size(413, 525);
var shopWindowSize = new Phaser.Structs.Size(413, 645);
var tryAgainWindowSize = new Phaser.Structs.Size(413, 98);
var popupTitleSize = new Phaser.Structs.Size(398, 75);
var popupButtonSize = new Phaser.Structs.Size(263, 68);
var shopItemSize = new Phaser.Structs.Size(413, 300);
var shopPriceSize = new Phaser.Structs.Size(300, 113);
var shopPriceTagSize = new Phaser.Structs.Size(225, 60);

let vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty("--vh", `${vh}px`);

window.onload = function () {
	var config = {
		type: Phaser.AUTO,
		//backgroundColor: "rgb(169, 234, 230)",
		scale: {
			mode: Phaser.Scale.HEIGHT_CONTROLS_WIDTH,
			autoCenter: Phaser.Scale.CENTER_BOTH,
			width: gameConstants.gameWidth,
			height: gameConstants.gameHeight,
			parent: "Game",
		},
		physics: {
			default: "matter",
			matter: {
				gravity: { x: 0, y: gameConstants.gravity },
				debug: false,
			},
		},
		scene: BasketBallGame,
		callbacks: {
			postBoot: function (game) {
				//game.canvas.style.width = '100%';
				//game.canvas.style.height = '100%';
			},
		},
	};

	// monsterapi && monsterapi.init({debug:1});
	//highScore = (monsterapi && monsterapi.getHighscore()) || 0;
	game = new Phaser.Game(config);
};

window.addEventListener(
	"resize",
	function (event) {
		//game.scale.resize(window.innerWidth, window.innerHeight);
	},
	this
);

class BasketBallGame extends Phaser.Scene {
	log(evt, data = null) {
		const event = new CustomEvent(evt, { detail: data });
        event.gameInstance = this;
		if (window.parent) window.parent.document.dispatchEvent(event);
	}

	constructor() {
		super("BasketBallGame");
	}

	preload() {

		this.log("game_load_start");

		this.load.image("background", "src/assets/bg.png");
		this.load.image("board_shadow", "src/assets/board_shadow.png");
		this.load.image("board_shadow_medium", "src/assets/board_shadow_medium.png");
		this.load.image("board_shadow_small", "src/assets/board_shadow_small.png");
		this.load.atlas("balls", "src/spritesheets/balls.png", "src/spritesheets/balls.json");
		this.load.atlas("boards", "src/spritesheets/boards.png", "src/spritesheets/boards.json");
		this.load.atlas("ball_shine", "src/spritesheets/shine_ball.png", "src/spritesheets/shine_ball.json");
		this.load.atlas("hoop_shine", "src/spritesheets/shine_hoop.png", "src/spritesheets/shine_hoop.json");
		this.load.image("ball_shadow", "src/assets/ball_shadow.png");
		this.load.image("panel_coin", "src/assets/panel_coin.png");
		this.load.image("panel_score", "src/assets/panel_score.png");
		this.load.image("btn_shop", "src/assets/btn_shop.png");
		this.load.image("leader", "src/assets/leader.png");
		this.load.image("coin", "src/assets/coin.png");
		this.load.spritesheet("coin_spritesheet", "src/spritesheets/coin.png", {
			frameWidth: 63,
			frameHeight: 63,
		});
		this.load.image("chance_on", "src/assets/chance_on.png");
		this.load.image("chance_off", "src/assets/chance_off.png");
		this.load.image("btn_generic", "src/assets/btn_generic.png");
		this.load.image("popup_window", "src/assets/popup_window.png");
		this.load.image("popup_title", "src/assets/popup_title.png");
		this.load.image("square", "src/assets/square.png");

		this.load.bitmapFont("timessquare", "src/fonts/timessquare.png", "src/fonts/timessquare.xml");

		this.load.audio("bgm", "src/sounds/bgm.mp3");
		this.load.audio("bounce1", "src/sounds/bounce1.mp3");
		this.load.audio("bounce2", "src/sounds/bounce2.mp3");
		this.load.audio("bounce3", "src/sounds/bounce3.mp3");
		this.load.audio("cheer1", "src/sounds/cheer1.mp3");
		this.load.audio("cheer2", "src/sounds/cheer2.mp3");
		this.load.audio("coin_appear", "src/sounds/coin_appear.mp3");
		this.load.audio("coin_get", "src/sounds/coin_get.mp3");
		this.load.audio("fail", "src/sounds/fail.mp3");
		this.load.audio("score", "src/sounds/score.mp3");
		this.load.audio("button", "src/sounds/button.mp3");

		if (!this.preventJSONLoad) {
			this.load.json("balls_data", "src/data/balls.json");
			this.load.json("boards_data", "src/data/boards.json");
			this.load.json("floors_data", "src/data/floors.json");
			this.load.json("hoops_data", "src/data/hoops.json");

            this.playerData = JSON.parse(localStorage.getItem("basketballdata"));
		}

        if (this.playerData == null) {
            this.playerData = {
                highScore: 0,
                coin: 0,
                ownedBalls: [0],
                ownedBoards: [0],
                ownedFloors: [0],
                equippedBall: 0,
                equippedBoard: 0,
                equippedFloor: 0,
                sfxOn: true,
                bgmOn: true,
                tutorialShown: false,
            };
        }

		this.load.plugin("rexninepatchplugin", "src/lib/rexninepatchplugin.min.js", true);
		this.load.plugin("rexanchorplugin", "src/lib/rexanchorplugin.min.js", true);

		zeroEncrypt = this.encrypt(0);

		if (!this.playerData.tutorialShown) this.load.image("tutorial_finger", "src/assets/tutorial_finger.png");

		this.load.on(
			"progress",
			function (progress) {
				this.log("game_load_progress", { progress });
			},
			this
		);
		this.load.once(
			"complete",
			function (progress) {
				this.log("game_load_complete", { progress });
			},
			this
		);
	}

	waitReady() {
		let tis = this;
		setTimeout(function () {
			if (ballsData) tis.doCreate();
			else {
				tis.log("game_start_wait");
				tis.waitReady();
			}
		}, 500);
	}

	create() {
		if (this.preventJSONLoad) this.waitReady();
		else this.doCreate();
	}

	doCreate() {
		this.log("game_create");

		screenFader = this.add
			.rexNinePatch({
				x: this.cameras.main.centerX,
				y: this.cameras.main.centerY,
				width: this.cameras.main.width,
				height: this.cameras.main.height,
				key: "square",
				columns: [15, undefined, 15],
				rows: [15, undefined, 15],
			})
			.setOrigin(0.5, 0.5)
			.setDepth(90)
			.setTint(0x000000)
			.setAlpha(0);
		lives = gameConstants.lifeCount;

		this.anims.create({
			key: "coin_anim",
			frames: this.anims.generateFrameNumbers("coin_spritesheet"),
			frameRate: 15,
			repeat: -1,
		});

		var loopMarker = {
			name: "loop",
			start: 0,
			config: {
				loop: true,
			},
		};

		bgm = this.sound.add("bgm");
		bgm.addMarker(loopMarker);
		bgm.play("loop");
		bgm.setMute(!this.playerData.bgmOn);

		this.loadJsonData();
		this.initArena();
		this.initUI();
		this.initTryAgain();
		this.initGameOver();
		this.initShop();
		this.initCallbacks();

		scoreStr = zeroEncrypt;

		this.createComplete = true;
        this.log('game_start')
	}

	update(time, delta) {
		if (!this.createComplete) return;

		if (isDragging && !isEasing && !isBallLaunched) {
			var deltaDrag = {
				x: 0,
				y: 0,
			};

			if (prevDrag.x === 999999) {
				prevDrag.x = this.input.x;
				prevDrag.y = this.input.y;
			}

			deltaDrag.x = this.input.x - prevDrag.x;
			deltaDrag.y = this.input.y - prevDrag.y;

			if (deltaDrag.x === 0 && deltaDrag.y === 0) {
				resetBallPositionFrame++;
				if (resetBallPositionFrame >= gameConstants.resetBallPositionFrameThreshold) {
					this.resetBallPosition();
				}
			}

			ball.x += deltaDrag.x;
			ball.y += deltaDrag.y;

			if (ball.y <= ballStartPos.y - 56) {
				this.launchBall();
			}

			if (!isBallLaunched) {
				if (ball.y > ballStartPos.y) {
					ball.y = ballStartPos.y;
				}
				if (ball.x < ballStartPos.x - 188 || ball.x > ballStartPos.x + 188) {
					this.resetBallPosition();
				}
			}

			prevDrag.x = this.input.x;
			prevDrag.y = this.input.y;
		} else if (!isEasing && !isBallLaunched && (ball.x != ballStartPos.x || ball.y != ballStartPos.y)) {
			this.resetBallPosition();
		}

		if (isBallLaunched) {
			ballShadow.alpha = 0;

			if (resetBallPositionTween != null) {
				resetBallPositionTween.stop();
				resetBallPositionTween = null;
			}

			if (ball.body.velocity.y > 0) {
				ball.setCollisionCategory(collisionCategory1);
				ball.setDepth(5);
				ballShading.setDepth(6);

				if (ball.y >= hoop.y + 150 && !isEasing) {
					isEasing = true;
					var instance = this;
					this.tweens.add({
						targets: ball,
						alpha: 0,
						ease: "Linear",
						duration: 100,
						onComplete: function () {
							if (goal || (!goal && !gameOver)) instance.time.delayedCall(150, instance.respawnBall, [], instance);
						},
						onCompleteScope: instance,
					});

					if (!goal) {
						if (!gameStarted) {
							var tryAgainWords = ["Try again", "Again", "One more time", "Once more"];
							tryAgainText.text = tryAgainWords[Phaser.Math.Between(0, 3)];

							var instance = this;
							this.tweens.add({
								delay: 400,
								targets: tryAgainPopup,
								y: this.cameras.main.height / 2,
								duration: 150,
								completeDelay: 500,
								onComplete: function () {
									instance.tweens.add({
										targets: tryAgainPopup,
										y: -tryAgainWindowSize.height / 2,
										duration: 250,
										onComplete: function () {
											tryAgainPopup.y = instance.cameras.main.height + tryAgainWindowSize.height / 2;
										},
										onCompleteScope: instance,
									});
								},
								onCompleteScope: instance,
							});
						} else {
							combo = 0;
							consecutivePerfectGoals = 0;
							pointText.text = "";
							ballLives[gameConstants.lifeCount - lives].setTexture("chance_off");
							this.playSfx("fail");
							lives--;

							if (lives <= 0 && !gameOver) {
								gameOver = true;
								isPopupOpen = true;

								var score = parseInt(this.decrypt(scoreStr));
								var highScore = this.playerData.highScore;

								resultScoreText.text = "" + score;

								this.tweens.add({
									targets: gameOverPopup,
									y: this.cameras.main.height / 2,
									duration: 150,
								});

								this.tweens.add({
									targets: screenFader,
									alpha: 0.7,
									duration: 150,
								});

								if (comboBarDecreaseTween != null) {
									comboBarDecreaseTween.remove();
									comboBarDecreaseTween = null;
								}

								if (score > highScore) {
									leaderText.text = score;
									this.playerData.highScore = score;

                                    if (!this.preventJSONLoad) {
									    localStorage.setItem("basketballdata", JSON.stringify(this.playerData));
                                    }
								}

								pointText.text = "";
								isXMoving = false;

								// monsterapi && monsterapi.finishGame(score);

								this.log("game_over", { f: score, steps: md5(this.steps || ``) });
							}
						}
					}
				}

				if (!goal) {
					if (ball.y > hoop.y + 11 && ball.y < hoop.y + 71 && ball.x > hoop.x - 38 && ball.x < hoop.x + 38) {
						goal = true;
						gameStarted = true;
						this.playSfx("score");

						if (feverModeTime <= 0 && !isFeverMode) {
							if (feverModeCount === 0) {
								comboBarFront.setVisible(true);
							}

							feverModeCount++;

							var barIncrease = 27.35 / gameConstants.feverModeEnterCount;
							var instance = this;

							this.tweens.add({
								targets: comboBarFront,
								scaleX: "+=" + barIncrease,
								duration: 300,
								onComplete: function () {
									if (feverModeCount >= gameConstants.feverModeEnterCount) {
										instance.feverModeStart();
									}
								},
								onCompleteScope: instance,
							});
						} else if (isFeverMode) {
							hoopShine.setVisible(true);
							hoopShine.play("hoop_shine_anim");
						}

						var scoreBefore = parseInt(this.decrypt(scoreStr));
						var score = scoreBefore;

						if (collideWithHoop) {
							combo = 0;
							consecutivePerfectGoals = 0;
							var point = gameConstants.baseScore * feverModeMultiplier;
							score += point;

							for (let idx = 0; idx < feverModeMultiplier; idx++) {
								this.log("game_step");
							}

							pointText.text = "+" + point;
							//pointGetText.text = "+2";
							//this.animatePointGet();
						} else {
							combo++;
							var point = (gameConstants.baseScore + 1) * feverModeMultiplier;
							/*if(combo <= 1){
                                score += 3;
                                pointText.text = "+3";
                                //pointGetText.text = "+3";
                            }
                            else if(combo <= 2){
                                score += 6;
                                pointText.text = "+6";
                                //pointGetText.text = "+6";
                            }
                            else{
                                score += 9;
                                pointText.text = "+9";
                                //pointGetText.text = "+9";
                            }
                            this.animatePointGet();*/
							score += point;

							for (let idx = 0; idx < feverModeMultiplier; idx++) {
								this.log("game_step_bonus");
							}

							pointText.text = "+" + point;
							consecutivePerfectGoals++;

							if (consecutivePerfectGoals === gameConstants.cheer2ConsecutivePerfectGoals) {
								consecutivePerfectGoals = 0;
								this.playSfx("cheer2");
							} else {
								this.playSfx("cheer1");
							}
						}
						this.animatePointText();
						scoreText.text = "" + score;
						scoreStr = this.encrypt(score);

						if (coinAvailable) {
							this.getCoin();
						}

						if (Math.floor(scoreBefore / gameConstants.coinShowScoreGet) != Math.floor(score / gameConstants.coinShowScoreGet)) {
							//coinAvailable = true;
						}

						if (score >= gameConstants.thirdHurdleScore) {
							if (!isXMoving) {
								isXMoving = true;
								var randX = Phaser.Math.Between(0, 1);
								var randY = Phaser.Math.Between(0, 12);

								if (randX === 0) this.moveRingPositionXY(hoopStartPos.x - 150, hoopStartPos.y - 30 + randY * 8, true);
								else this.moveRingPositionXY(hoopStartPos.x + 150, hoopStartPos.y - 30 + randY * 8, true);
							} else {
								var randY = Phaser.Math.Between(0, 12);

								this.moveRingPositionY(hoopStartPos.y - 30 + randY * 8);
							}
						} else if (score >= gameConstants.secondHurdleScore) {
							var randX = Phaser.Math.Between(0, 30);
							var randY = Phaser.Math.Between(0, 9);

							this.moveRingPositionXY(hoopStartPos.x - 150 + randX * 8, hoopStartPos.y - 30 + randY * 8);
						} else if (score >= gameConstants.firstHurdleScore) {
							var rand = Phaser.Math.Between(0, 30);

							this.moveRingPositionXY(hoopStartPos.x - 150 + rand * 8, hoopStartPos.y);
						}
					}
				}
			}
		}

		if (!isBallLaunched) {
			ballShadow.x = ball.x;
			ballShadow.alpha = 1 - (ballStartPos.y - ball.y) / 56;
		}

		ballShading.x = ball.x;
		ballShading.y = ball.y;
		ballShading.scaleX = ball.scaleX;
		ballShading.scaleY = ball.scaleY;
		ballShading.alpha = ball.alpha;
		ballShine.x = ball.x;
		ballShine.y = ball.y;
		ballShine.scaleX = ball.scaleX;
		ballShine.scaleY = ball.scaleY;
		ballShine.alpha = ball.alpha;

		if (!coinFlyingUp) {
			ringCoin.x = hoop.x;
			ringCoin.y = hoop.y + 83;
		}
		hoopShine.x = hoop.x;
		hoopShine.y = hoop.y;

		this.updateNetAnchors();
		this.listLines();
		this.drawNet();

		this.refreshUI();
	}

	resize(gameSize) {
		var width = gameSize.width;
		var height = gameSize.height;

		//this.cameras.resize(width, height);
	}

	resetBallPosition() {
		if (!isEasing) {
			isEasing = true;
			isDragging = false;
			resetBallPositionTween = this.tweens.add({
				targets: ball,
				y: ballStartPos.y,
				x: ballStartPos.x,
				duration: 100,
				onComplete: function () {
					isEasing = false;
					resetBallPositionTween = null;
				},
			});
			this.tweens.add({
				targets: ballShadow,
				y: ballShadow.y,
				x: ballStartPos.x,
				duration: 100,
			});
		}
	}

	respawnBall() {
		goal = false;
		gameOver = false;
		collideWithHoop = false;
		ball.setAngularVelocity(0);
		ball.setVelocity(0, 0);
		ball.setDepth(30);
		ballShading.setDepth(31);
		ball.rotation = 0;
		ball.scaleX = 1;
		ball.scaleY = 1;
		ball.setIgnoreGravity(true);
		ball.setCollisionCategory(collisionCategory2);
		ball.x = ballStartPos.x;
		ball.y = ballStartPos.y;

		if (coinAvailable) {
			if (!ringCoin.visible) {
				ringCoin.setVisible(true);
				ringCoin.play("coin_anim");
				this.playSfx("coin_appear");
			}
		}

		this.tweens.add({
			targets: ball,
			alpha: 1,
			duration: 100,
			onComplete: function () {
				isBallLaunched = false;
				isEasing = false;
			},
		});
	}

	launchBall() {
		if (!this.playerData.tutorialShown) {
			tutorialFinger.setVisible(false);
			tutorialTween.remove();

			this.playerData.tutorialShown = true;
            if (!this.preventJSONLoad) {
			    localStorage.setItem("basketballdata", JSON.stringify(this.playerData));
            }
		}

		if (!isBallLaunched) {
			isBallLaunched = true;
			isDragging = false;
			var rawForce = Math.round((ball.x - ballStartPos.x) * 100) / 100;
			var neg = rawForce > 0 ? 1 : -1;
			var div = Math.floor(Math.abs(rawForce) / gameConstants.ballShootRoundingValue);
			var mod = Math.abs(rawForce) % gameConstants.ballShootRoundingValue;
			if (mod >= gameConstants.ballShootRoundingValue / 2) rawForce = gameConstants.ballShootRoundingValue * (div + 1);
			else rawForce = gameConstants.ballShootRoundingValue * div;
			var force = {
				x: rawForce * 0.01 * neg,
				y: -2.6,
			};
			var angularVelocity = (ball.x - ballStartPos.x) * 0.003;
			ball.applyForce(force);
			ball.setAngularVelocity(angularVelocity);
			ball.setIgnoreGravity(false);

			this.tweens.add({
				targets: ball,
				scaleX: gameConstants.ballScaleOnLaunch,
				scaleY: gameConstants.ballScaleOnLaunch,
				ease: "Linear",
				duration: 700,
			});
		}
	}

	makeNet() {
		var netAnchorOptions = { ignoreGravity: true, isStatic: true, collisionFilter: { category: collisionCategory2 } };
		var netSideOptions = { ignoreGravity: false, isStatic: false, collisionFilter: { category: collisionCategory1 } };
		var netOtherOptions = { ignoreGravity: false, isStatic: false, collisionFilter: { category: collisionCategory2 } };

		anchor1 = this.matter.add.circle(hoop.x - 56, hoop.y, 4, netAnchorOptions);
		anchor1.label = "anchor1";
		anchor2 = this.matter.add.circle(hoop.x - 26, hoop.y, 4, netAnchorOptions);
		anchor1.label = "anchor2";
		anchor3 = this.matter.add.circle(hoop.x + 26, hoop.y, 4, netAnchorOptions);
		anchor1.label = "anchor3";
		anchor4 = this.matter.add.circle(hoop.x + 56, hoop.y, 4, netAnchorOptions);
		anchor1.label = "anchor4";

		left1 = this.matter.add.circle(hoop.x - 56, hoop.y + 19, 4, netSideOptions);
		left1.label = "left1";
		left1.mass = 0.01;
		left2 = this.matter.add.circle(hoop.x - 56, hoop.y + 38, 4, netSideOptions);
		left2.label = "left2";
		left2.mass = 0.01;
		left3 = this.matter.add.circle(hoop.x - 56, hoop.y + 56, 4, netSideOptions);
		left3.label = "left3";
		left3.mass = 0.01;
		left4 = this.matter.add.circle(hoop.x - 56, hoop.y + 75, 4, netSideOptions);
		left4.label = "left4";
		left4.mass = 0.01;

		right1 = this.matter.add.circle(hoop.x + 56, hoop.y + 19, 4, netSideOptions);
		right1.label = "right1";
		right1.mass = 0.01;
		right2 = this.matter.add.circle(hoop.x + 56, hoop.y + 38, 4, netSideOptions);
		right2.label = "right2";
		right2.mass = 0.01;
		right3 = this.matter.add.circle(hoop.x + 56, hoop.y + 56, 4, netSideOptions);
		right3.label = "right3";
		right3.mass = 0.01;
		right4 = this.matter.add.circle(hoop.x + 56, hoop.y + 75, 4, netSideOptions);
		right4.label = "right4";
		right4.mass = 0.01;

		midleft1 = this.matter.add.circle(hoop.x - 26, hoop.y + 19, 4, netOtherOptions);
		midleft1.label = "midleft1";
		midleft1.mass = 0.01;
		midright1 = this.matter.add.circle(hoop.x + 26, hoop.y + 19, 4, netOtherOptions);
		midright1.label = "midright1";
		midright1.mass = 0.01;

		mid1 = this.matter.add.circle(hoop.x, hoop.y + 30, 4, netOtherOptions);
		mid1.label = "mid1";
		mid1.mass = 0.01;
		mid2 = this.matter.add.circle(hoop.x, hoop.y + 56, 4, netOtherOptions);
		mid2.label = "mid2";
		mid2.mass = 0.01;
		mid3 = this.matter.add.circle(hoop.x, hoop.y + 75, 4, netOtherOptions);
		mid3.label = "mid3";
		mid3.mass = 0.01;

		this.matter.add.joint(anchor1, left1, 23, 0.3);
		this.matter.add.joint(left1, left2, 15, 0.3);
		this.matter.add.joint(left2, left3, 15, 0.3);
		this.matter.add.joint(left3, left4, 15, 0.3);

		this.matter.add.joint(anchor4, right1, 23, 0.3);
		this.matter.add.joint(right1, right2, 15, 0.3);
		this.matter.add.joint(right2, right3, 15, 0.3);
		this.matter.add.joint(right3, right4, 15, 0.3);

		this.matter.add.joint(anchor2, midleft1, 15, 0.3);
		this.matter.add.joint(anchor3, midright1, 15, 0.3);

		this.matter.add.joint(midleft1, left2, 23, 0.3);
		this.matter.add.joint(midright1, right2, 23, 0.3);

		this.matter.add.joint(mid1, midleft1, 23, 0.3);
		this.matter.add.joint(mid1, midright1, 23, 0.3);
		this.matter.add.joint(mid1, left3, 45, 0.3);
		this.matter.add.joint(mid1, right3, 45, 0.3);

		this.matter.add.joint(mid2, left1, 53, 0.3);
		this.matter.add.joint(mid2, right1, 53, 0.3);
		this.matter.add.joint(mid2, left4, 38, 0.3);
		this.matter.add.joint(mid2, right4, 38, 0.3);

		this.matter.add.joint(mid3, left3, 38, 0.3);
		this.matter.add.joint(mid3, right3, 38, 0.3);
	}

	updateNetAnchors() {
		Phaser.Physics.Matter.Matter.Body.setPosition(anchor1, { x: hoop.x - 56, y: hoop.y });
		Phaser.Physics.Matter.Matter.Body.setPosition(anchor2, { x: hoop.x - 26, y: hoop.y });
		Phaser.Physics.Matter.Matter.Body.setPosition(anchor3, { x: hoop.x + 26, y: hoop.y });
		Phaser.Physics.Matter.Matter.Body.setPosition(anchor4, { x: hoop.x + 56, y: hoop.y });

		Phaser.Physics.Matter.Matter.Body.setPosition(ringColliderLeft, { x: hoop.x - 56, y: hoop.y });
		Phaser.Physics.Matter.Matter.Body.setPosition(ringColliderRight, { x: hoop.x + 56, y: hoop.y });
	}

	listLines() {
		netLines = [];

		var line = new Phaser.Geom.Line(anchor1.position.x, anchor1.position.y, left1.position.x, left1.position.y);
		netLines.push(line);
		line = new Phaser.Geom.Line(left1.position.x, left1.position.y, left2.position.x, left2.position.y);
		netLines.push(line);
		line = new Phaser.Geom.Line(left2.position.x, left2.position.y, left3.position.x, left3.position.y);
		netLines.push(line);
		line = new Phaser.Geom.Line(left3.position.x, left3.position.y, left4.position.x, left4.position.y);
		netLines.push(line);

		line = new Phaser.Geom.Line(anchor4.position.x, anchor4.position.y, right1.position.x, right1.position.y);
		netLines.push(line);
		line = new Phaser.Geom.Line(right1.position.x, right1.position.y, right2.position.x, right2.position.y);
		netLines.push(line);
		line = new Phaser.Geom.Line(right2.position.x, right2.position.y, right3.position.x, right3.position.y);
		netLines.push(line);
		line = new Phaser.Geom.Line(right3.position.x, right3.position.y, right4.position.x, right4.position.y);
		netLines.push(line);

		line = new Phaser.Geom.Line(anchor2.position.x, anchor2.position.y, midleft1.position.x, midleft1.position.y);
		netLines.push(line);
		line = new Phaser.Geom.Line(anchor3.position.x, anchor3.position.y, midright1.position.x, midright1.position.y);
		netLines.push(line);

		line = new Phaser.Geom.Line(midleft1.position.x, midleft1.position.y, left2.position.x, left2.position.y);
		netLines.push(line);
		line = new Phaser.Geom.Line(midright1.position.x, midright1.position.y, right2.position.x, right2.position.y);
		netLines.push(line);

		line = new Phaser.Geom.Line(mid1.position.x, mid1.position.y, midleft1.position.x, midleft1.position.y);
		netLines.push(line);
		line = new Phaser.Geom.Line(mid1.position.x, mid1.position.y, midright1.position.x, midright1.position.y);
		netLines.push(line);
		line = new Phaser.Geom.Line(mid1.position.x, mid1.position.y, left3.position.x, left3.position.y);
		netLines.push(line);
		line = new Phaser.Geom.Line(mid1.position.x, mid1.position.y, right3.position.x, right3.position.y);
		netLines.push(line);

		line = new Phaser.Geom.Line(mid2.position.x, mid2.position.y, left1.position.x, left1.position.y);
		netLines.push(line);
		line = new Phaser.Geom.Line(mid2.position.x, mid2.position.y, right1.position.x, right1.position.y);
		netLines.push(line);
		line = new Phaser.Geom.Line(mid2.position.x, mid2.position.y, left4.position.x, left4.position.y);
		netLines.push(line);
		line = new Phaser.Geom.Line(mid2.position.x, mid2.position.y, right4.position.x, right4.position.y);
		netLines.push(line);

		line = new Phaser.Geom.Line(mid3.position.x, mid3.position.y, left3.position.x, left3.position.y);
		netLines.push(line);
		line = new Phaser.Geom.Line(mid3.position.x, mid3.position.y, right3.position.x, right3.position.y);
		netLines.push(line);
	}

	drawNet() {
		netGraphics.clear();
		netGraphics.lineStyle(4, 0xffffff);
		netGraphics.setDepth(10);

		netLines.forEach(function (l) {
			var line = l;
			netGraphics.strokeLineShape(line);
		});
	}

	refreshUI() {
		/*uiGraphics.fillStyle(0xffffff, 1);
        uiGraphics.fillRoundedRect(tryAgainWindow.x, tryAgainWindow.y, tryAgainWindowSize.width, tryAgainWindowSize.height, 20);*/
		tryAgainText.y = tryAgainPopup.y;

		/*uiGraphics.fillStyle(0x000000, screenFader.alpha);
        uiGraphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);

        uiGraphics.fillStyle(0xffffff, 1);
        uiGraphics.fillRoundedRect(gameOverWindow.x, gameOverWindow.y, gameOverWindowSize.width, gameOverWindowSize.height, 20);

        uiGraphics.fillStyle(0x808080, 1);
        uiGraphics.fillRoundedRect(gameOverWindow.x + 10, gameOverWindow.y + 10, popupTitleSize.width, popupTitleSize.height, { tl: 15, tr: 15, bl: 0, br: 0 });*/

		gameOverPopupTitle.y = gameOverPopup.y - gameOverWindowSize.height / 2 + popupTitleSize.height / 2 + 8;
		gameOverYourScoreBg.y = gameOverPopup.y - gameOverWindowSize.height / 2 + 240;
		btnRestart.y = gameOverPopup.y - gameOverWindowSize.height / 2 + 341 + btnRestart.height / 2;
		btnQuit.y = gameOverPopup.y - gameOverWindowSize.height / 2 + 428 + btnQuit.height / 2;
		gameOverText.y = gameOverPopup.y - gameOverWindowSize.height / 2 + 44;
		yourScoreText.y = gameOverPopup.y - gameOverWindowSize.height / 2 + 132;
		resultScoreText.y = gameOverYourScoreBg.y - 3;
		restartText.y = btnRestart.y - 2;
		quitText.y = btnQuit.y - 2;

		/*uiGraphics.fillStyle(0xffffff, 1);
        uiGraphics.fillRoundedRect(shopWindow.x, shopWindow.y, shopWindowSize.width, shopWindowSize.height, 20);

        uiGraphics.fillStyle(0x1ea9c8, 1);
        uiGraphics.fillRoundedRect(shopWindow.x + 10, shopWindow.y + 10, popupTitleSize.width, popupTitleSize.height, { tl: 15, tr: 15, bl: 0, br: 0 });

        uiGraphics.fillStyle(0x9ad8e6, 1);
        uiGraphics.fillRect(shopWindow.x, shopWindow.y + 250, shopWindowSize.width, 300);*/

		shopPopupTitle.y = shopPopup.y - shopWindowSize.height / 2 + popupTitleSize.height / 2 + 8;
		shopPreviewBg.y = shopPopup.y - shopWindowSize.height / 2 + 300;
		shopText.y = shopPopup.y - shopWindowSize.height / 2 + 42;
		shopCategoryText.y = shopPopup.y - shopWindowSize.height / 2 + 132;
		shopCategoryPrev.y = shopPopup.y - shopWindowSize.height / 2 + 132;
		shopCategoryNext.y = shopPopup.y - shopWindowSize.height / 2 + 132;
		shopItemPrev.y = shopPopup.y - shopWindowSize.height / 2 + 297;
		shopItemNext.y = shopPopup.y - shopWindowSize.height / 2 + 297;
		shopPreview.y = shopPopup.y - shopWindowSize.height / 2 + 300;
		shopPreviewShading.y = shopPopup.y - shopWindowSize.height / 2 + 300;
		shopPreviewHoop.y = shopPopup.y - shopWindowSize.height / 2 + 345;
		btnBuy.y = shopPopup.y - shopWindowSize.height / 2 + 485;
		btnPlay.y = shopPopup.y - shopWindowSize.height / 2 + 585;
		priceLabel.y = btnBuy.y;
		priceCoin.y = priceLabel.y;
		buyText.y = btnBuy.y - 3;
		playText.y = btnPlay.y - 3;
		buyPriceText.y = priceLabel.y - 3;
		shopEquipText.y = btnBuy.y - 3;
 	}

	/*animatePointGet(){
        this.time.delayedCall(700, function(){
            this.tweens.add({
                targets: pointGetText,
                y: "-=50",
                alpha: 0,
                duration: 500,
                onComplete: function(){
                    pointGetText.text = "";
                    pointGetText.y = hoop.y + 150
                    pointGetText.alpha = 1;
                },
                onCompleteScope: this
            });
        }, [], this);
    }*/

	animatePointText() {
		this.tweens.add({
			targets: pointText,
			alpha: 1,
			duration: 200,
			completeDelay: 500,
			onComplete: function () {
				this.tweens.add({
					targets: pointText,
					alpha: 0,
					duration: 200,
				});
			},
			onCompleteScope: this,
		});
	}

	moveRingPositionXY(x, y, loopAfterwards = false) {
		var deltaX = x - hoop.x;
		var deltaY = y - hoop.y;
		Phaser.Actions.Call(
			ring.getChildren(),
			function (go) {
				if (!loopAfterwards) {
					this.tweens.add({
						targets: go,
						x: "+=" + deltaX,
						y: "+=" + deltaY,
						duration: 500,
					});
				} else {
					this.tweens.add({
						targets: go,
						x: "+=" + deltaX,
						y: "+=" + deltaY,
						duration: 500,
						onComplete: function () {
							if (x > hoopStartPos.x) {
								this.moveRingPositionLoop(false);
							} else {
								this.moveRingPositionLoop(true);
							}
						},
						onCompleteScope: this,
					});
				}
			},
			this
		);
	}

	moveRingPositionY(y) {
		var deltaY = y - hoop.y;
		Phaser.Actions.Call(
			ring.getChildren(),
			function (go) {
				this.tweens.add({
					targets: go,
					y: "+=" + deltaY,
					duration: 500,
				});
			},
			this
		);
	}

	moveRingPositionLoop(fromLeft) {
		var x = fromLeft ? hoopStartPos.x + 150 : hoopStartPos.x - 150;
		var deltaX = x - hoop.x;

		Phaser.Actions.Call(
			ring.getChildren(),
			function (go) {
				if (fromLeft) {
					this.tweens.add({
						targets: go,
						x: "+=" + deltaX,
						yoyo: true,
						repeat: -1,
						duration: 4000,
					});
				} else {
					this.tweens.add({
						targets: go,
						x: "+=" + deltaX,
						yoyo: true,
						repeat: -1,
						duration: 4000,
					});
				}
			},
			this
		);
	}

	getItemIndexByID(item, ID) {
		var index = -1;

		switch (item) {
			case "ball":
				ballsData.balls.forEach(function (ball, i, array) {
					if (ball["id"] === ID) {
						index = i;
						return;
					}
				});
				break;
			case "board":
				boardData.boards.forEach(function (board, i, array) {
					if (board["id"] === ID) {
						index = i;
						return;
					}
				});
				break;
			case "floor":
				floorsData.floors.forEach(function (floor, i, array) {
					if (floor["id"] === ID) {
						index = i;
						return;
					}
				});
				break;
		}

		return index;
	}

	feverModeStart() {
		isFeverMode = true;
		feverModeTime = gameConstants.feverModeGoneTime;
		feverModeMultiplier = 2;
		ballShine.setVisible(true);

		this.tweens.add({
			targets: comboPanelActive,
			scaleY: 5,
			duration: 150,
			onComplete: function () {
				multiplierText.visible = true;

				blinkTextTimer = this.time.addEvent({
					delay: 500,
					repeat: -1,
					callback: function () {
						multiplierText.visible = !multiplierText.visible;
					},
					callbackScope: this,
				});

				comboBarDecreaseTween = this.tweens.add({
					targets: comboBarFront,
					scaleX: 0,
					duration: gameConstants.feverModeGoneTime,
					onComplete: function () {
						this.feverModeEnd();
						comboBarDecreaseTween = null;
					},
					onCompleteScope: this,
				});
			},
			onCompleteScope: this,
		});
	}

	feverModeEnd() {
		if (isFeverMode) {
			this.tweens.add({
				targets: comboPanelActive,
				scaleY: 2.1,
				duration: 150,
			});
		}

		this.tweens.add({
			targets: comboBarFront,
			scaleX: 0,
			duration: 150,
		});

		isFeverMode = false;
		feverModeCount = 0;
		feverModeTime = 0;
		feverModeMultiplier = 1;
		ballShine.setVisible(false);
		if (blinkTextTimer != null) {
			blinkTextTimer.remove();
			blinkTextTimer = null;
			multiplierText.visible = false;
		}
	}

	loadJsonData() {
		ballsData = this.cache.json.get("balls_data");
		boardsData = this.cache.json.get("boards_data");
		floorsData = this.cache.json.get("floors_data");
		hoopsData = this.cache.json.get("hoops_data");
	}

	buyFailed() {
        btnBuy.setInteractive()
    }

	buyConfirm() {
		var items;

        btnBuy.setInteractive()

		if (shopCategoryIndex == 0) items = this.playerData.ownedBalls;
		else if (shopCategoryIndex == 1) items = this.playerData.ownedBoards;
		else if (shopCategoryIndex == 2) items = this.playerData.ownedFloors;

		if (items.includes(shopIndex)) {
			// equip
			this.playSfx("button");

			switch (shopCategoryIndex) {
				case 0:
					this.playerData.equippedBall = shopIndex;
					ball.setTexture("balls", ballsData.balls[shopIndex]["id"]);

					this.refreshShopItem ("balls", ballsData.balls[shopIndex]["id"], this.playerData.ownedBalls, shopIndex, this.playerData.equippedBall, ballsData.balls[shopIndex]["price"]);
					break;
				case 1:
					this.playerData.equippedBoard = shopIndex;
					board.setTexture("boards", boardsData.boards[shopIndex]["id"]);
					hoop.setTexture("boards", hoopsData.hoops[shopIndex]["id"]);

					if (shopIndex === 3) {
						boardShadow.setTexture("board_shadow_small");
						boardShadow.x = hoop.x + 45;
						boardShadow.y = hoop.y + 15;
					} else if (shopIndex === 5) {
						boardShadow.setTexture("board_shadow_medium");
						boardShadow.x = hoop.x + 50;
						boardShadow.y = hoop.y + 15;
					} else if (shopIndex === 6) {
						boardShadow.setTexture("board_shadow_medium");
						boardShadow.x = hoop.x + 55;
						boardShadow.y = hoop.y;
					} else {
						boardShadow.setTexture("board_shadow");
						boardShadow.x = hoop.x + 68;
						boardShadow.y = hoop.y + 15;
					}

					this.refreshShopItem ("boards", boardsData.boards[shopIndex]["id"], this.playerData.ownedBoards, shopIndex, this.playerData.equippedBoard, boardsData.boards[shopIndex]["price"]);
					break;
				case 2:
					this.playerData.equippedFloor = shopIndex;
					ground.setTexture("boards", floorsData.floors[shopIndex]["id"]);

					this.refreshShopItem ("boards", floorsData.floors[shopIndex]["id"], this.playerData.ownedFloors, shopIndex, this.playerData.equippedFloor, floorsData.floors[shopIndex]["price"]);
					break;
			}
		} else {
			// buy
			if (this.playerData.coin >= currentItemPrice) {
				this.playSfx("coin_appear");
				this.playerData.coin -= currentItemPrice;
				coinText.text = "" + this.playerData.coin;

				switch (shopCategoryIndex) {
					case 0:
						this.playerData.ownedBalls.push(shopIndex);
						this.playerData.equippedBall = shopIndex;
						ball.setTexture("balls", ballsData.balls[shopIndex]["id"]);

						this.refreshShopItem ("balls", ballsData.balls[shopIndex]["id"], this.playerData.ownedBalls, shopIndex, this.playerData.equippedBall, ballsData.balls[shopIndex]["price"]);
						break;
					case 1:
						this.playerData.ownedBoards.push(shopIndex);
						this.playerData.equippedBoard = shopIndex;
						board.setTexture("boards", boardsData.boards[shopIndex]["id"]);
						hoop.setTexture("boards", hoopsData.hoops[shopIndex]["id"]);

						if (shopIndex === 3) {
							boardShadow.setTexture("board_shadow_small");
							boardShadow.x = hoop.x + 45;
							boardShadow.y = hoop.y + 15;
						} else if (shopIndex === 5) {
							boardShadow.setTexture("board_shadow_medium");
							boardShadow.x = hoop.x + 50;
							boardShadow.y = hoop.y + 15;
						} else if (shopIndex === 6) {
							boardShadow.setTexture("board_shadow_medium");
							boardShadow.x = hoop.x + 55;
							boardShadow.y = hoop.y;
						} else {
							boardShadow.setTexture("board_shadow");
							boardShadow.x = hoop.x + 68;
							boardShadow.y = hoop.y + 15;
						}

						this.refreshShopItem ("boards", boardsData.boards[shopIndex]["id"], this.playerData.ownedBoards, shopIndex, this.playerData.equippedBoard, boardsData.boards[shopIndex]["price"]);
						break;
					case 2:
						this.playerData.ownedFloors.push(shopIndex);
						this.playerData.equippedFloor = shopIndex;
						ground.setTexture("boards", floorsData.floors[shopIndex]["id"]);

						this.refreshShopItem ("boards", floorsData.floors[shopIndex]["id"], this.playerData.ownedFloors, shopIndex, this.playerData.equippedFloor, floorsData.floors[shopIndex]["price"]);
						break;
				}
			}
		}

		if (!this.preventJSONLoad) {
		    localStorage.setItem("basketballdata", JSON.stringify(this.playerData));
        }
	}

	initArena() {
		background = this.add.image(gameConstants.gameWidth / 2, gameConstants.gameHeight / 2, "background");
		background.setDisplaySize(gameConstants.gameWidth, gameConstants.gameHeight);
		background.setDepth(0);

		ground = this.add.image(this.cameras.main.centerX, this.cameras.main.height + 48, "boards", floorsData.floors[this.playerData.equippedFloor]["id"]);
		ground.setOrigin(0.5, 1);
		ground.setDepth(1);

		collisionCategory1 = this.matter.world.nextCategory();
		//collisionCategory2 = this.matter.world.nextCategory();

		// horizontal: centerX - 200, centerX + 200
		// vertical: cameraHeight - 610, cameraHeight - 490
		hoop = this.add
			.image(this.cameras.main.centerX, this.cameras.main.height - 428, "boards", hoopsData.hoops[this.playerData.equippedBoard]["id"])
			.setDepth(20)
			.setData({ id: "hoop" });

		var hoopShineAnim = this.anims.create({
			key: "hoop_shine_anim",
			frames: this.anims.generateFrameNames("hoop_shine"),
			frameRate: 15,
			hideOnComplete: true,
		});
		// hoopShineAnim.on(
		// 	"complete",
		// 	function (currentAnim, currentFrame, sprite) {
		// 		hoopShine.setVisible(false);
		// 	},
		// 	this
		// );
		hoopShine = this.add.sprite(hoop.x, hoop.y, "hoop_shine").setDepth(21).setVisible(false);

		board = this.add
			.image(hoop.x, hoop.y - 60, "boards", boardsData.boards[this.playerData.equippedBoard]["id"])
			.setDepth(2)
			.setData({ id: "board" });
		if (this.playerData.equippedBoard === 3)
			boardShadow = this.add
				.image(hoop.x + 45, hoop.y + 15, "board_shadow_small")
				.setAlpha(0.15)
				.setDepth(1)
				.setData({ id: "boardShadow" });
		else if (this.playerData.equippedBoard === 5)
			boardShadow = this.add
				.image(hoop.x + 50, hoop.y + 15, "board_shadow_medium")
				.setAlpha(0.15)
				.setDepth(1)
				.setData({ id: "boardShadow" });
		else if (this.playerData.equippedBoard === 6)
			boardShadow = this.add
				.image(hoop.x + 55, hoop.y, "board_shadow_medium")
				.setAlpha(0.15)
				.setDepth(1)
				.setData({ id: "boardShadow" });
		else
			boardShadow = this.add
				.image(hoop.x + 68, hoop.y + 15, "board_shadow")
				.setAlpha(0.15)
				.setDepth(1)
				.setData({ id: "boardShadow" });

		ringColliderLeft = this.matter.add.circle(hoop.x - 56, hoop.y, 7, { label: "hoopRing", ignoreGravity: true, isStatic: true, collisionFilter: { category: collisionCategory1 } });
		ringColliderRight = this.matter.add.circle(hoop.x + 56, hoop.y, 7, { label: "hoopRing", ignoreGravity: true, isStatic: true, collisionFilter: { category: collisionCategory1 } });

		netGraphics = this.add.graphics();
		this.makeNet();
		this.listLines();
		this.drawNet();

		hoopStartPos.x = hoop.x;
		hoopStartPos.y = hoop.y;

		ball = this.matter.add.image(this.cameras.main.centerX, this.cameras.main.height - 140, "balls", ballsData.balls[this.playerData.equippedBall]["id"]);
		ball.setBody({
			type: "circle",
			radius: 55,
		})
			.setBounce(gameConstants.ballBounciness)
			.setIgnoreGravity(true)
			.setData({ id: "ball" })
			.setDepth(30)
			.setCollisionCategory(collisionCategory2)
			.setInteractive();
		ball.setMass(20);
		ball.body.label = "ball";
		this.input.setDraggable(ball);
		ballShading = this.add.image(ball.x, ball.y, "balls", "ball_lighting.png").setDepth(32);
		ballShadow = this.add.image(ball.x, ball.y + 52, "ball_shadow").setDepth(2);

		var ballShineAnim = this.anims.create({
			key: "ball_shine_anim",
			frames: this.anims.generateFrameNames("ball_shine"),
			frameRate: 15,
			repeat: -1,
		});
		ballShine = this.add.sprite(ball.x, ball.y, "ball_shine", 0).play("ball_shine_anim").setDepth(31).setVisible(false);

		ballStartPos.x = ball.x;
		ballStartPos.y = ball.y;

		ringCoin = this.add
			.sprite(hoop.x, hoop.y + 83, "coin_spritesheet")
			.setScale(0.8)
			.setDepth(9)
			.setVisible(false);

		ring = this.add.group();
		ring.add(boardShadow);
		ring.add(hoop);
		ring.add(board);
	}

	initUI() {
		btnShop = this.add.image(0, 0, "btn_shop").setDepth(110).setInteractive().setVisible(false);
		this.plugins.get("rexanchorplugin").add(btnShop, {
			left: "left+15",
			top: "top+75",
		});
        if (this.hideShop) btnShop.setVisible(false)

		panelCoin = this.add.image(0, 70, "panel_coin").setDepth(110).setVisible(false);
		this.plugins.get("rexanchorplugin").add(panelCoin, {
			right: "right-15",
			top: "top+75",
		});

		panelScore = this.add.image(hoop.x, hoop.y - 150, "panel_score").setDepth(3);

		leader = this.add.image(panelScore.x - 38, panelScore.y - 75, "leader");
		coin = this.add
			.image(panelCoin.x - 41, panelCoin.y + 1, "coin")
			.setDepth(111)
			.setScale(1.5)
			.setVisible(false);

		leaderText = this.add
			.bitmapText(leader.x + 60, leader.y - 3, "timessquare", "0", 53)
			.setOrigin(0.5)
			.setTint(0x879190);
		scoreText = this.add
			.bitmapText(panelScore.x, panelScore.y - 3, "timessquare", "0", 87)
			.setOrigin(0.5, 0.5)
			.setTint(0xff0000)
			.setDepth(4);
		coinText = this.add
			.bitmapText(panelCoin.x + 56, panelCoin.y - 2, "timessquare", "0", 46)
			.setDepth(111)
			.setOrigin(1, 0.5)
			.setTint(0xfdf42d)
			.setVisible(false);
		pointText = this.add
			.bitmapText(hoop.x, hoop.y - 44, "timessquare", "+3", 64)
			.setOrigin(0.5)
			.setDepth(3)
			.setAlpha(0);

		leaderText.text = this.playerData.highScore;
		coinText.text = this.playerData.coin;

		ring.add(pointText);
		ring.add(panelScore);
		ring.add(scoreText);
		ring.add(leader);
		ring.add(leaderText);

		var life = this.add.image(ground.x + 173, ground.y - ground.height - 23, "chance_on").setDepth(2);
		ballLives.push(life);
		life = this.add.image(ground.x + 135, ground.y - ground.height - 23, "chance_on").setDepth(2);
		ballLives.push(life);
		life = this.add.image(ground.x + 98, ground.y - ground.height - 23, "chance_on").setDepth(2);
		ballLives.push(life);

		comboText = this.add.bitmapText(this.cameras.main.centerX, 135, "timessquare", "", 53).setOrigin(0.5).setTint(0x000000);

		comboPanelActive = this.add
			.image(comboText.x, comboText.y + 45 - 16, "square")
			.setSize(15, 15)
			.setScale(28.35, 2.1)
			.setOrigin(0.5, 0)
			.setTint(0x000000);
		multiplierText = this.add
			.bitmapText(comboText.x, comboText.y + 79, "timessquare", "< POINTS x2 >", 45)
			.setDepth(50)
			.setOrigin(0.5)
			.setTint(0xffff00)
			.setVisible(false);
		//var comboPanelMaskShape = this.add.image(comboText.x, comboText.y + 100, "panel_combo_active").setVisible(false);
		//comboPanelActive.mask = new Phaser.Display.Masks.BitmapMask(this, comboPanelMaskShape);
		//multiplierText.mask = new Phaser.Display.Masks.BitmapMask(this, comboPanelMaskShape);

		comboPanel = this.add
			.image(comboText.x, comboText.y + 45, "square")
			.setSize(15, 15)
			.setScale(28.35, 2.1)
			.setOrigin(0.5, 0.5)
			.setTint(0x000000);
		comboBarBack = this.add
			.image(comboText.x, comboText.y + 45, "square")
			.setSize(15, 15)
			.setScale(27.35, 1.1)
			.setOrigin(0.5, 0.5)
			.setTint(0x4d4d4d);
		comboBarFront = this.add
			.image(comboBarBack.x - comboBarBack.displayWidth / 2, comboText.y + 45, "square")
			.setSize(15, 15)
			.setScale(0, 1.1)
			.setOrigin(0, 0.5)
			.setTint(0xffff00);
		//var comboBarMaskShape = this.add.image(comboText.x, comboText.y + 61, "panel_combo_bar").setVisible(false);
		//comboBarFront.mask = new Phaser.Display.Masks.BitmapMask(this, comboBarMaskShape);

		if (!this.playerData.tutorialShown) {
			tutorialFinger = this.add
				.image(ball.x - 30, ball.y + 23, "tutorial_finger")
				.setDepth(70)
				.setAlpha(0);
			tutorialTween = this.tweens.add({
				targets: tutorialFinger,
				alpha: 1,
				duration: 500,
				onComplete: function () {
					this.tweens.add({
						targets: tutorialFinger,
						y: ball.y - 98,
						duration: 750,
						onComplete: function () {
							this.tweens.add({
								targets: tutorialFinger,
								alpha: 0,
								duration: 500,
								onComplete: function () {
									tutorialTween.play();
									tutorialFinger.y = ball.y + 23;
								},
								onCompleteScope: this,
							});
						},
						onCompleteScope: this,
					});
				},
				onCompleteScope: this,
			});
		}
	}

	initTryAgain() {
		tryAgainPopup = this.add
			.rexNinePatch({
				x: this.cameras.main.centerX,
				y: this.cameras.main.height + tryAgainWindowSize.height / 2,
				width: tryAgainWindowSize.width,
				height: tryAgainWindowSize.height,
				key: "popup_window",
				columns: [15, undefined, 15],
				rows: [15, undefined, 15],
			})
			.setOrigin(0.5, 0.5)
			.setDepth(100);

		tryAgainText = this.add
			.text(tryAgainPopup.x, tryAgainPopup.y, "Try Again", {
				font: "53px Arial",
				fill: "rgb(0, 0, 0)",
			})
			.setOrigin(0.5, 0.5)
			.setDepth(101);
	}

	initShop() {
		shopPopup = this.add
			.rexNinePatch({
				x: this.cameras.main.centerX,
				y: this.cameras.main.height + shopWindowSize.height / 2,
				width: shopWindowSize.width,
				height: shopWindowSize.height,
				key: "popup_window",
				columns: [15, undefined, 15],
				rows: [15, undefined, 15],
			})
			.setOrigin(0.5, 0.5)
			.setDepth(105)
			.setInteractive();

		shopPopupTitle = this.add
			.rexNinePatch({
				x: shopPopup.x,
				y: shopPopup.y - shopWindowSize.height / 2 + popupTitleSize.height / 2 + 8,
				width: popupTitleSize.width,
				height: popupTitleSize.height,
				key: "popup_title",
				columns: [15, undefined, 15],
				rows: [15, undefined, 15],
			})
			.setOrigin(0.5, 0.5)
			.setDepth(106)
			.setTint(0x1ea9c8);

		shopPreviewBg = this.add
			.rexNinePatch({
				x: shopPopup.x,
				y: shopPopup.y - shopWindowSize.height / 2 + 300,
				width: shopWindowSize.width,
				height: 225,
				key: "square",
				columns: [15, undefined, 15],
				rows: [15, undefined, 15],
			})
			.setOrigin(0.5, 0.5)
			.setDepth(106)
			.setTint(0x9ad8e6);

		shopText = this.add
			.bitmapText(shopPopup.x, shopPopup.y - shopWindowSize.height / 2 + 42, "timessquare", "SHOP", 65)
			.setOrigin(0.5)
			.setDepth(107);
		shopCategoryText = this.add
			.bitmapText(shopPopup.x, shopPopup.y - shopWindowSize.height / 2 + 132, "timessquare", "BALL", 79)
			.setOrigin(0.5)
			.setDepth(106)
			.setTint(0x000000);
		shopCategoryPrev = this.add
			.bitmapText(shopPopup.x - shopWindowSize.width / 2 + 38, shopPopup.y - shopWindowSize.height / 2 + 132, "timessquare", "<", 80)
			.setOrigin(0.5)
			.setDepth(106)
			.setTint(0x000000)
			.setInteractive();
		shopCategoryNext = this.add
			.bitmapText(shopPopup.x + shopWindowSize.width / 2 - 38, shopPopup.y - shopWindowSize.height / 2 + 132, "timessquare", ">", 80)
			.setOrigin(0.5)
			.setDepth(106)
			.setTint(0x000000)
			.setInteractive();
		shopItemPrev = this.add
			.bitmapText(shopPopup.x - shopWindowSize.width / 2 + 38, shopPopup.y - shopWindowSize.height / 2 + 297, "timessquare", "<", 80)
			.setOrigin(0.5)
			.setDepth(107)
			.setTint(0x000000)
			.setInteractive();
		shopItemNext = this.add
			.bitmapText(shopPopup.x + shopWindowSize.width / 2 - 38, shopPopup.y - shopWindowSize.height / 2 + 297, "timessquare", ">", 80)
			.setOrigin(0.5)
			.setDepth(107)
			.setTint(0x000000)
			.setInteractive();

		shopPreview = this.add
			.image(shopPopup.x, shopPopup.y - shopWindowSize.height / 2 + 300, "balls", ballsData.balls[this.playerData.equippedBall]["id"])
			.setDepth(107)
			.setScale(1.3);
		shopPreviewShading = this.add
			.image(shopPopup.x, shopPopup.y - shopWindowSize.height / 2 + 300, "balls", "ball_lighting.png")
			.setDepth(108)
			.setScale(1.3);
		shopPreviewHoop = this.add
			.image(shopPopup.x, shopPopup.y - shopWindowSize.height / 2 + 345, "boards", hoopsData.hoops[this.playerData.equippedBoard]["id"])
			.setDepth(108)
			.setScale(0.7)
			.setVisible(false);
		btnBuy = this.add
			.image(shopPopup.x, shopPopup.y - shopWindowSize.height / 2 + 510, "btn_generic")
			.setDepth(106)
			.setTint(0x808080);
		btnPlay = this.add
			.image(shopPopup.x, shopPopup.y - shopWindowSize.height / 2 + 611, "btn_generic")
			.setDepth(106)
			.setTint(0xf15a24)
			.setScale(0.75)
			.setInteractive();
		priceLabel = this.add
			.image(btnBuy.x + btnBuy.width / 2 - 105, btnBuy.y, "btn_generic")
			.setDepth(107)
			.setTint(0x1b3e46)
			.setScale(0.5, 0.65)
			.setVisible(false);
		priceLabel.setSize(priceLabel.width * 0.5, priceLabel.height * 0.65);
		priceCoin = this.add
			.image(priceLabel.x - priceLabel.width / 2 + 30, priceLabel.y, "coin")
			.setDepth(108)
			.setScale(1.3)
			.setVisible(false);

		buyText = this.add
			.bitmapText(btnBuy.x - btnBuy.width / 2 + 68, btnBuy.y - 4, "timessquare", "BUY", 61)
			.setOrigin(0.5)
			.setDepth(107)
			.setVisible(false);
		playText = this.add
			.bitmapText(btnPlay.x, btnPlay.y - 3, "timessquare", "PLAY", 56)
			.setOrigin(0.5)
			.setDepth(107);
		buyPriceText = this.add
			.bitmapText(priceLabel.x + priceLabel.width / 2 - 15, priceLabel.y - 3, "timessquare", "150", 46)
			.setOrigin(1, 0.5)
			.setDepth(108)
			.setTint(0xffff00)
			.setVisible(false);
		shopEquipText = this.add
			.bitmapText(btnBuy.x, btnBuy.y - 3, "timessquare", "EQUIPPED", 76)
			.setOrigin(0.5, 0.5)
			.setDepth(108);

		buyBtnPriceGroup = this.add.group();
		buyBtnPriceGroup.add(buyText);
		buyBtnPriceGroup.add(priceLabel);
		buyBtnPriceGroup.add(priceCoin);
		buyBtnPriceGroup.add(buyPriceText);
	}

	initGameOver() {
		gameOverPopup = this.add
			.rexNinePatch({
				x: this.cameras.main.centerX,
				y: this.cameras.main.height + gameOverWindowSize.height / 2,
				width: gameOverWindowSize.width,
				height: gameOverWindowSize.height,
				key: "popup_window",
				columns: [15, undefined, 15],
				rows: [15, undefined, 15],
			})
			.setOrigin(0.5, 0.5)
			.setDepth(100);

		gameOverPopupTitle = this.add
			.rexNinePatch({
				x: gameOverPopup.x,
				y: gameOverPopup.y - gameOverWindowSize.height / 2 + popupTitleSize.height / 2 + 8,
				width: popupTitleSize.width,
				height: popupTitleSize.height,
				key: "popup_title",
				columns: [11, undefined, 11],
				rows: [11, undefined, 11],
			})
			.setOrigin(0.5, 0.5)
			.setDepth(101)
			.setTint(0x808080);

		gameOverYourScoreBg = this.add
			.image(gameOverPopup.x, gameOverPopup.y + 240, "panel_score")
			.setDepth(101)
			.setScale(1.3);
		btnRestart = this.add
			.image(gameOverPopup.x, gameOverPopup.y + 341 + popupButtonSize.height / 2, "btn_generic")
			.setDepth(101)
			.setTint(0xf15a24)
			.setScale(0.75)
			.setInteractive();
		btnQuit = this.add
			.image(gameOverPopup.x, gameOverPopup.y + 428 + popupButtonSize.height / 2, "btn_generic")
			.setDepth(101)
			.setTint(0x808080)
			.setScale(0.75)
			.setInteractive();

		gameOverText = this.add
			.bitmapText(gameOverPopup.x, gameOverPopup.y - gameOverWindowSize.height / 2 + 44, "timessquare", "GAME OVER", 64)
			.setOrigin(0.5)
			.setDepth(102);
		yourScoreText = this.add
			.bitmapText(gameOverPopup.x, gameOverPopup.y - gameOverWindowSize.height / 2 + 132, "timessquare", "YOUR SCORE", 56)
			.setOrigin(0.5)
			.setTint(0x000000)
			.setDepth(101);
		resultScoreText = this.add
			.bitmapText(gameOverYourScoreBg.x, gameOverYourScoreBg.y - 3, "timessquare", "0", 109)
			.setOrigin(0.5)
			.setTint(0xff0000)
			.setDepth(102);
		restartText = this.add
			.bitmapText(btnRestart.x, btnRestart.y - 2, "timessquare", "RESTART", 56)
			.setOrigin(0.5)
			.setDepth(102);
		quitText = this.add
			.bitmapText(btnQuit.x, btnQuit.y - 2, "timessquare", "QUIT", 56)
			.setOrigin(0.5)
			.setDepth(102);
	}

	initCallbacks() {
		this.matter.world.on(
			"collisionstart",
			function (event, bodyA, bodyB) {
				if (bodyA.label === "hoopRing" || bodyB.label === "hoopRing") {
					collideWithHoop = true;
					this.playSfx("bounce" + Phaser.Math.Between(1, 3));
				}
				/*else{
                var pairs = event.pairs;

                for(var i = 0; i < pairs.length; i++){
                    if(pairs[i].isSensor && coinAvailable && goal){
                        var tempCoin = null;
                        var tempBall = null;

                        if(pairs[i].bodyA.isSensor && pairs[i].bodyA.label === "coin" && pairs[i].bodyB.label === "ball"){
                            tempCoin = pairs[i].bodyA;
                            tempBall = pairs[i].bodyB;
                        }
                        else if(pairs[i].bodyB.isSensor && pairs[i].bodyB.label === "coin" && pairs[i].bodyA.label === "ball"){
                            tempCoin = pairs[i].bodyB;
                            tempBall = pairs[i].bodyA;
                        }

                        console.log(pairs[i].bodyA.label + " " + pairs[i].bodyB.label);
                        if(tempCoin != null && tempBall != null){
                            if(tempCoin.gameObject.visible === true){

                            }
                        }
                    }
                }
            }*/
			},
			this
		);

		ball.on("pointerdown", function (pointer) {
			if (!isPopupOpen) {
				isEasing = false;
				isDragging = true;
				resetBallPositionFrame = 0;
				prevDrag.x = 999999;
				prevDrag.y = 999999;
			}
		});

		this.input.on("pointerup", function (pointer) {
			if (!isPopupOpen) {
				isDragging = false;
			}
		});

		btnRestart.on(
			"pointerdown",
			function () {
				this.playSfx("button");
                this.log('game_start')
				isPopupOpen = false;
				gameStarted = false;

				this.tweens.add({
					targets: gameOverPopup,
					y: 0 - gameOverWindowSize.height / 2,
					duration: 250,
					onComplete: function () {
						gameOverPopup.y = this.cameras.main.height + gameOverWindowSize.height / 2;
					},
					onCompleteScope: this,
				});

				this.tweens.add({
					targets: screenFader,
					alpha: 0,
					duration: 250,
				});

				this.respawnBall();
				this.tweens.killAll();
				this.moveRingPositionXY(hoopStartPos.x, hoopStartPos.y);

				ballLives.forEach(function (l) {
					l.setTexture("chance_on");
				});

				this.feverModeEnd();

				lives = gameConstants.lifeCount;

				scoreStr = zeroEncrypt;
				scoreText.text = "0";

				coinFlyingUp = false;
				coinAvailable = false;
				ringCoin.setVisible(false);

				// monsterapi && monsterapi.startGame();
			},
			this
		);

		btnShop.on(
			"pointerdown",
			function () {
				this.playSfx("button");
				isPopupOpen = true;

				btnShop.disableInteractive();
				shopCategoryIndex = 0;
				shopIndex = this.playerData.equippedBall;
				shopCategoryText.text = shopCategories[shopCategoryIndex];
				shopPreview.setTexture("balls", ballsData.balls[shopIndex]["id"]);
				shopPreview.setScale(1.3);
				shopPreviewShading.setVisible(true);
				shopPreviewHoop.setVisible(false);
				this.refreshShopItem ("balls", ballsData.balls[shopIndex]["id"], this.playerData.ownedBalls, shopIndex, this.playerData.equippedBall, ballsData.balls[shopIndex]["price"]);

				this.tweens.add({
					targets: shopPopup,
					y: this.cameras.main.centerY,
					duration: 150,
				});

				this.tweens.add({
					targets: screenFader,
					alpha: 0.7,
					duration: 150,
				});
			},
			this
		);

		btnQuit.on(
			"pointerdown",
			function () {
				this.playSfx("button");
				// monsterapi && monsterapi.quitGame();
        		this.log("game_quit");
			},
			this
		);

		btnBuy.on(
			"pointerdown",
			function () {
                btnBuy.disableInteractive()

				this.log("game_shop", {
					category: typeof shopCategoryIndex == "undefined" ? 0 : shopCategoryIndex,
					index: shopIndex,
					price: () => {
						switch (shopCategoryIndex) {
							case 0:
								return ballsData.chars[showIndex].price;
								break;
							case 1:
								return boardsData.chars[showIndex].price;
								break;
							case 2:
								return floorsData.chars[showIndex].price;
								break;
						}
					},
					buyConfirm: this.buyConfirm,
					buyFailed: this.buyFailed,
				});
			},
			this
		);

		btnPlay.on(
			"pointerdown",
			function () {
				this.playSfx("button");

				this.tweens.add({
					targets: shopPopup,
					y: -shopWindowSize.height / 2,
					duration: 150,
					onComplete: function () {
						shopPopup.y = this.cameras.main.height + shopWindowSize.height / 2;
						btnShop.setInteractive().setVisible(false);
					},
					onCompleteScope: this,
				});

				if (!gameOver) {
					this.tweens.add({
						targets: screenFader,
						alpha: 0,
						duration: 150,
						onComplete: function () {
							isPopupOpen = false;
						},
						onCompleteScope: this,
					});
				}
			},
			this
		);

		shopCategoryPrev.on(
			"pointerdown",
			function () {
				this.playSfx("button");
				shopCategoryIndex--;
				if (shopCategoryIndex < 0) shopCategoryIndex = 2;

				shopCategoryText.text = shopCategories[shopCategoryIndex];

				switch (shopCategoryIndex) {
					case 0:
						shopIndex = this.playerData.equippedBall;
						shopPreview.setScale(1.3);
						shopPreview.setTexture("balls", ballsData.balls[shopIndex]["id"]);
						shopPreviewShading.setVisible(true);
						shopPreviewHoop.setVisible(false);
						this.refreshShopItem ("balls", ballsData.balls[shopIndex]["id"], this.playerData.ownedBalls, shopIndex, this.playerData.equippedBall, ballsData.balls[shopIndex]["price"]);
						break;
					case 1:
						shopIndex = this.playerData.equippedBoard;
						shopPreview.setScale(0.7);
						shopPreview.setTexture("boards", boardsData.boards[shopIndex]["id"]);
						shopPreviewHoop.setTexture("boards", hoopsData.hoops[shopIndex]["id"]);
						shopPreviewShading.setVisible(false);
						shopPreviewHoop.setVisible(true);
						this.refreshShopItem ("boards", boardsData.boards[shopIndex]["id"], this.playerData.ownedBoards, shopIndex, this.playerData.equippedBoard, boardsData.boards[shopIndex]["price"]);
						break;
					case 2:
						shopIndex = this.playerData.equippedFloor;
						shopPreview.setScale(0.5);
						shopPreview.setTexture("boards", floorsData.floors[shopIndex]["id"]);
						shopPreviewShading.setVisible(false);
						shopPreviewHoop.setVisible(false);
						this.refreshShopItem ("boards", floorsData.floors[shopIndex]["id"], this.playerData.ownedFloors, shopIndex, this.playerData.equippedFloor, floorsData.floors[shopIndex]["price"]);
						break;
				}
			},
			this
		);

		shopCategoryNext.on(
			"pointerdown",
			function () {
				this.playSfx("button");
				shopCategoryIndex++;
				if (shopCategoryIndex > 2) shopCategoryIndex = 0;

				shopCategoryText.text = shopCategories[shopCategoryIndex];

				switch (shopCategoryIndex) {
					case 0:
						shopIndex = this.playerData.equippedBall;
						shopPreview.setScale(1.3);
						shopPreview.setTexture("balls", ballsData.balls[shopIndex]["id"]);
						shopPreviewShading.setVisible(true);
						shopPreviewHoop.setVisible(false);
						this.refreshShopItem ("balls", ballsData.balls[shopIndex]["id"], this.playerData.ownedBalls, shopIndex, this.playerData.equippedBall, ballsData.balls[shopIndex]["price"]);
						break;
					case 1:
						shopIndex = this.playerData.equippedBoard;
						shopPreview.setScale(0.7);
						shopPreview.setTexture("boards", boardsData.boards[shopIndex]["id"]);
						shopPreviewHoop.setTexture("boards", hoopsData.hoops[shopIndex]["id"]);
						shopPreviewShading.setVisible(false);
						shopPreviewHoop.setVisible(true);
						this.refreshShopItem ("boards", boardsData.boards[shopIndex]["id"], this.playerData.ownedBoards, shopIndex, this.playerData.equippedBoard, boardsData.boards[shopIndex]["price"]);
						break;
					case 2:
						shopIndex = this.playerData.equippedFloor;
						shopPreview.setScale(0.5);
						shopPreview.setTexture("boards", floorsData.floors[shopIndex]["id"]);
						shopPreviewShading.setVisible(false);
						shopPreviewHoop.setVisible(false);
						this.refreshShopItem ("boards", floorsData.floors[shopIndex]["id"], this.playerData.ownedFloors, shopIndex, this.playerData.equippedFloor, floorsData.floors[shopIndex]["price"]);
						break;
				}
			},
			this
		);

		shopItemPrev.on(
			"pointerdown",
			function () {
				this.playSfx("button");
				shopIndex--;
				switch (shopCategoryIndex) {
					case 0:
						if (shopIndex < 0) {
							shopIndex = ballsData.balls.length - 1;
						}

						this.refreshShopItem ("balls", ballsData.balls[shopIndex]["id"], this.playerData.ownedBalls, shopIndex, this.playerData.equippedBall, ballsData.balls[shopIndex]["price"]);
						break;
					case 1:
						if (shopIndex < 0) {
							shopIndex = boardsData.boards.length - 1;
						}

						shopPreview.setTexture("boards", hoopsData.hoops[shopIndex]["id"]);
						this.refreshShopItem ("boards", boardsData.boards[shopIndex]["id"], this.playerData.ownedBoards, shopIndex, this.playerData.equippedBoard, boardsData.boards[shopIndex]["price"]);
						break;
					case 2:
						if (shopIndex < 0) {
							shopIndex = floorsData.floors.length - 1;
						}

						this.refreshShopItem ("boards", floorsData.floors[shopIndex]["id"], this.playerData.ownedFloors, shopIndex, this.playerData.equippedFloor, floorsData.floors[shopIndex]["price"]);
						break;
				}
			},
			this
		);

		shopItemNext.on(
			"pointerdown",
			function () {
				this.playSfx("button");
				shopIndex++;
                switch (shopCategoryIndex) {
                    case 0:
                        if (shopIndex > ballsData.balls.length - 1) {
                            shopIndex = 0;
                        }

                        this.refreshShopItem ("balls", ballsData.balls[shopIndex]["id"], this.playerData.ownedBalls, shopIndex, this.playerData.equippedBall, ballsData.balls[shopIndex]["price"]);
                        break;
                    case 1:
                        if (shopIndex > boardsData.boards.length - 1) {
                            shopIndex = 0;
                        }

                        shopPreviewHoop.setTexture("boards", hoopsData.hoops[shopIndex]["id"]);
                        this.refreshShopItem ("boards", boardsData.boards[shopIndex]["id"], this.playerData.ownedBoards, shopIndex, this.playerData.equippedBoard, boardsData.boards[shopIndex]["price"]);
                        break;
                    case 2:
                        if (shopIndex > floorsData.floors.length - 1) {
                            shopIndex = 0;
                        }

                        this.refreshShopItem ("boards", floorsData.floors[shopIndex]["id"], this.playerData.ownedFloors, shopIndex, this.playerData.equippedFloor, floorsData.floors[shopIndex]["price"]);
                        break;
                }
			},
			this
		);
	}

    refreshShopPreview(){
        switch (shopCategoryIndex) {
            case 0:
                if (shopIndex > ballsData.balls.length - 1) {
                    shopIndex = 0;
                }

                this.refreshShopItem ("balls", ballsData.balls[shopIndex]["id"], this.playerData.ownedBalls, shopIndex, this.playerData.equippedBall, ballsData.balls[shopIndex]["price"]);
                break;
            case 1:
                if (shopIndex > boardsData.boards.length - 1) {
                    shopIndex = 0;
                }

                shopPreviewHoop.setTexture("boards", hoopsData.hoops[shopIndex]["id"]);
                this.refreshShopItem ("boards", boardsData.boards[shopIndex]["id"], this.playerData.ownedBoards, shopIndex, this.playerData.equippedBoard, boardsData.boards[shopIndex]["price"]);
                break;
            case 2:
                if (shopIndex > floorsData.floors.length - 1) {
                    shopIndex = 0;
                }

                this.refreshShopItem ("boards", floorsData.floors[shopIndex]["id"], this.playerData.ownedFloors, shopIndex, this.playerData.equippedFloor, floorsData.floors[shopIndex]["price"]);
                break;
        }
    }

	refreshShopItem (textureString, textureFrame, ownedItem, shopIndex, equippedItem, itemPrice) {
        console.log(ownedItem)
		shopPreview.setTexture(textureString, textureFrame);
		currentItemPrice = itemPrice;

		if (ownedItem.includes(shopIndex)) {
			Phaser.Actions.Call(buyBtnPriceGroup.getChildren(), function (go) {
				go.setVisible(false);
			});

			if (equippedItem === shopIndex) {
				btnBuy.setTint(0x808080).setInteractive(); //.disableInteractive();
				shopEquipText.setVisible(true);
				shopEquipText.text = "EQUIPPED";
			} else {
				btnBuy.setTint(0x1ea9c8).setInteractive();
				shopEquipText.setVisible(true);
				shopEquipText.text = "EQUIP";
			}
		} else {
			// if (this.playerData.coin >= itemPrice)
            btnBuy.setTint(0x1ea9c8).setInteractive();
			// else btnBuy.setTint(0x808080) //.disableInteractive();

			shopEquipText.setVisible(false);

			Phaser.Actions.Call(buyBtnPriceGroup.getChildren(), function (go) {
				go.setVisible(true);
			});

			buyPriceText.text = itemPrice;
		}
	}

	getCoin() {
		this.playerData.coin++;
		this.playSfx("coin_get");
		coinFlyingUp = true;
		coinAvailable = false;

		ringCoin.anims.stop();
		ringCoin.anims.setProgress(0);
		ringCoin.setDepth(100);

		this.tweens.add({
			targets: ringCoin,
			x: coin.x,
			y: coin.y,
			scale: 0.5,
			duration: 600,
			ease: "Quad",
			onComplete: function () {
				coinText.text = "" + this.playerData.coin;
				ringCoin.setDepth(9);
				ringCoin.x = hoop.x;
				ringCoin.y = hoop.y + 110;
				ringCoin.setScale(0.8);
				ringCoin.setVisible(false);
				coinFlyingUp = false;
			},
			onCompleteScope: this,
		});

		if (!this.preventJSONLoad) {
		    localStorage.setItem("basketballdata", JSON.stringify(this.playerData));
        }
	}

	playSfx(key) {
		if (this.playerData.sfxOn) {
			this.sound.play(key);
		}
	}

	playBgm() {
		bgm && bgm.setMute(false);
	}

	stopBgm() {
		bgm && bgm.setMute(true);
	}

	encrypt(str) {
		// var valueToEncrypt = str;
		// var password = "123456";
		// var encrypted = CryptoJS.AES.encrypt(JSON.stringify(valueToEncrypt), password, { format: CryptoJSAesJson }).toString();
		// //console.log('Encrypted:', encrypted);
		// return encrypted;
		return str;
	}

	decrypt(str) {
		// var encrypted = str;
		// var password = "123456";
		// var decrypted = CryptoJS.AES.decrypt(encrypted, password, { format: CryptoJSAesJson }).toString(CryptoJS.enc.Utf8);
		// //console.log('Decrypted:', JSON.parse(decrypted))
		// return decrypted;
		return str;
	}
}
