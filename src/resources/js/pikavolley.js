/**
 * The Controller part in MVC pattern
 */

'use strict';
import { GROUND_HALF_WIDTH, PikaPhysics } from './physics.js';
import { MenuView, GameView, FadeInOut, IntroView } from './view.js';
import { PikaKeyboard } from './keyboard.js';
import { PikaAudio } from './audio.js';

/** @typedef {import('@pixi/display').Container} Container */
/** @typedef {import('@pixi/loaders').LoaderResource} LoaderResource */

/** @typedef GameState @type {function():void} */

/**
 * Class representing Pikachu Volleyball game
 */
export class PikachuVolleyball {
  /**
   * Create a Pikachu Volleyball game which includes physics, view, audio
   * @param {Container} stage container which is rendered by PIXI.Renderer or PIXI.CanvasRenderer
   * @param {Object.<string,LoaderResource>} resources resources property of the PIXI.Loader object which is used for loading the game resources
   */
  constructor(stage, resources) {

    this.isScoreSubmitted = false;

    this.view = {
      intro: new IntroView(resources),
      menu: new MenuView(resources),
      game: new GameView(resources),
      fadeInOut: new FadeInOut(resources),
    };
    stage.addChild(this.view.intro.container);
    stage.addChild(this.view.menu.container);
    stage.addChild(this.view.game.container);
    stage.addChild(this.view.fadeInOut.black);
    this.view.intro.visible = false;
    this.view.menu.visible = false;
    this.view.game.visible = false;
    this.view.fadeInOut.visible = false;

    this.audio = new PikaAudio(resources);
    this.physics = new PikaPhysics(true, true);
    this.keyboardArray = [
      new PikaKeyboard( // for player1(Arrow + ',') -> 부스 참가자(왼쪽 피카츄)
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
        'Comma'
      ),
      new PikaKeyboard( // for player2 -> Greedy 인원(오른쪽 피카츄)
        'KeyF', // left
        'KeyH', // right
        'KeyT', // up
        'KeyG', // down
        'KeyZ', // powerhit
      )
    ];

    /** @type {number} game fps */
    this.normalFPS = 25;
    /** @type {number} fps for slow motion */
    this.slowMotionFPS = 5;

    /** @constant @type {number} number of frames for slow motion */
    this.SLOW_MOTION_FRAMES_NUM = 6;
    /** @type {number} number of frames left for slow motion */
    this.slowMotionFramesLeft = 0;
    /** @type {number} number of elapsed normal fps frames for rendering slow motion */
    this.slowMotionNumOfSkippedFrames = 0;

    /** @type {number} 0: with computer, 1: with friend */
    this.selectedWithWho = 0;

    /** @type {number[]} [0] for player 1 score, [1] for player 2 score */
    this.scores = [0, 0];
    /** @type {number} winning score: if either one of the players reaches this score, game ends */


    /*
    <-------------------------------->
    승리 조건 점수 조작 부분(점수 계산은 승리 조건 점수 기준으로 계산하므로 winningScore만 수정해주세요.
    */
    this.winningScore = 7;
    /*
    <-------------------------------->
    승리 조건 점수 조작 부분(점수 계산은 승리 조건 점수 기준으로 계산하므로 winningScore만 수정해주세요.
    */



    /** @type {boolean} Is the game ended? */
    this.gameEnded = false;
    /** @type {boolean} Is the round ended? */
    this.roundEnded = false;
    /** @type {boolean} Will player 2 serve? */
    this.isPlayer2Serve = false;

    /** @type {number} frame counter */
    this.frameCounter = 0;
    /** @type {Object.<string,number>} total number of frames for each game state */
    this.frameTotal = {
      intro: 165,
      afterMenuSelection: 15,
      beforeStartOfNewGame: 15,
      startOfNewGame: 71,
      afterEndOfRound: 5,
      beforeStartOfNextRound: 30,
      gameEnd: 211,
    };

    /** @type {number} counter for frames while there is no input from keyboard */
    this.noInputFrameCounter = 0;
    /** @type {Object.<string,number>} total number of frames to be rendered while there is no input */
    this.noInputFrameTotal = {
      menu: 225,
    };

    /** @type {boolean} true: paused, false: not paused */
    this.paused = false;

    /** @type {boolean} true: stereo, false: mono */
    this.isStereoSound = true;

    /** @type {boolean} true: practice mode on, false: practice mode off */
    this._isPracticeMode = false;

    /**
     * The game state which is being rendered now
     * @type {GameState}
     */
    this.state = this.intro;
  }

  /**
   * Game loop
   * This function should be called at regular intervals ( interval = (1 / FPS) second )
   */
  gameLoop() {
    if (this.paused === true) {
      return;
    }
    if (this.slowMotionFramesLeft > 0) {
      this.slowMotionNumOfSkippedFrames++;
      if (
        this.slowMotionNumOfSkippedFrames %
        Math.round(this.normalFPS / this.slowMotionFPS) !==
        0
      ) {
        return;
      }
      this.slowMotionFramesLeft--;
      this.slowMotionNumOfSkippedFrames = 0;
    }
    // catch keyboard input and freeze it
    this.keyboardArray[0].getInput();
    this.keyboardArray[1].getInput();
    this.state();
  }

  /**
   * Intro: a man with a brief case
   * @type {GameState}
   */
  intro() {
    if (this.frameCounter === 0) {
      this.view.intro.visible = true;
      this.view.fadeInOut.setBlackAlphaTo(0);
      this.audio.sounds.bgm.stop();
    }
    this.view.intro.drawMark(this.frameCounter);
    this.frameCounter++;

    if (
      this.keyboardArray[0].powerHit === 1 ||
      this.keyboardArray[1].powerHit === 1
    ) {
      this.frameCounter = 0;
      this.view.intro.visible = false;
      this.state = this.menu;
    }

    if (this.frameCounter >= this.frameTotal.intro) {
      this.frameCounter = 0;
      this.view.intro.visible = false;
      this.state = this.menu;
    }
  }

  /**
   * Menu: select who do you want to play. With computer? With friend?
   * @type {GameState}
   */
  menu() {
    if (this.frameCounter === 0) {
      this.view.menu.visible = true;
      this.view.fadeInOut.setBlackAlphaTo(0);
      this.selectedWithWho = 0;
      this.view.menu.selectWithWho(this.selectedWithWho);
    }
    this.view.menu.drawFightMessage(this.frameCounter);
    this.view.menu.drawSachisoft(this.frameCounter);
    this.view.menu.drawSittingPikachuTiles(this.frameCounter);
    this.view.menu.drawPikachuVolleyballMessage(this.frameCounter);
    this.view.menu.drawPokemonMessage(this.frameCounter);
    this.view.menu.drawWithWhoMessages(this.frameCounter);
    this.frameCounter++;

    if (
      this.frameCounter < 71 &&
      (this.keyboardArray[0].powerHit === 1 ||
        this.keyboardArray[1].powerHit === 1)
    ) {
      this.frameCounter = 71;
      return;
    }

    if (this.frameCounter <= 71) {
      return;
    }

    if (
      (this.keyboardArray[0].yDirection === -1 ||
        this.keyboardArray[1].yDirection === -1) &&
      this.selectedWithWho === 1
    ) {
      this.noInputFrameCounter = 0;
      this.selectedWithWho = 0;
      this.view.menu.selectWithWho(this.selectedWithWho);
      this.audio.sounds.pi.play();
    } else if (
      (this.keyboardArray[0].yDirection === 1 ||
        this.keyboardArray[1].yDirection === 1) &&
      this.selectedWithWho === 0
    ) {
      this.noInputFrameCounter = 0;
      this.selectedWithWho = 1;
      this.view.menu.selectWithWho(this.selectedWithWho);
      this.audio.sounds.pi.play();
    } else {
      this.noInputFrameCounter++;
    }

    if (
      this.keyboardArray[0].powerHit === 1 ||
      this.keyboardArray[1].powerHit === 1
    ) {
      if (this.selectedWithWho === 1) {
        this.physics.player1.isComputer = false;
        this.physics.player2.isComputer = false;
      } else {
        if (this.keyboardArray[0].powerHit === 1) {
          this.physics.player1.isComputer = false;
          this.physics.player2.isComputer = true;
        } else if (this.keyboardArray[1].powerHit === 1) {
          this.physics.player1.isComputer = true;
          this.physics.player2.isComputer = false;
        }
      }
      this.audio.sounds.pikachu.play();
      this.frameCounter = 0;
      this.noInputFrameCounter = 0;
      this.state = this.afterMenuSelection;
      return;
    }

    // <---------- 일정 시간 이상 입력 없을 경우 자동 AI 모드로 전환(일단 끕시다)---->
    // if (this.noInputFrameCounter >= this.noInputFrameTotal.menu) {
    //   this.physics.player1.isComputer = true;
    //   this.physics.player2.isComputer = true;
    //   this.frameCounter = 0;
    //   this.noInputFrameCounter = 0;
    //   this.state = this.afterMenuSelection;
    // }
  }

  /**
   * Fade out after menu selection
   * @type {GameState}
   */
  afterMenuSelection() {
    this.view.fadeInOut.changeBlackAlphaBy(1 / 16);
    this.frameCounter++;
    if (this.frameCounter >= this.frameTotal.afterMenuSelection) {
      this.frameCounter = 0;
      this.state = this.beforeStartOfNewGame;
    }
  }

  /**
   * Delay before start of new game (This is for the delay that exist in the original game)
   * @type {GameState}
   */
  beforeStartOfNewGame() {
    this.frameCounter++;
    if (this.frameCounter >= this.frameTotal.beforeStartOfNewGame) {
      this.frameCounter = 0;
      this.view.menu.visible = false;
      this.state = this.startOfNewGame;
    }
  }

  /**
   * Start of new game: Initialize ball and players and print game start message
   * @type {GameState}
   */
  startOfNewGame() {
    if (this.frameCounter === 0) {
      this.view.game.visible = true;
      this.gameEnded = false;
      this.roundEnded = false;
      this.isPlayer2Serve = false;
      this.physics.player1.gameEnded = false;
      this.physics.player1.isWinner = false;
      this.physics.player2.gameEnded = false;
      this.physics.player2.isWinner = false;

      this.scores[0] = 0;
      this.scores[1] = 0;
      this.view.game.drawScoresToScoreBoards(this.scores);

      this.physics.player1.initializeForNewRound();
      this.physics.player2.initializeForNewRound();
      this.physics.ball.initializeForNewRound(this.isPlayer2Serve);
      this.view.game.drawPlayersAndBall(this.physics);

      this.view.fadeInOut.setBlackAlphaTo(1); // set black screen
      this.audio.sounds.bgm.play();
    }

    this.view.game.drawGameStartMessage(
      this.frameCounter,
      this.frameTotal.startOfNewGame
    );
    this.view.game.drawCloudsAndWave();
    this.view.fadeInOut.changeBlackAlphaBy(-(1 / 17)); // fade in
    this.frameCounter++;

    if (this.frameCounter >= this.frameTotal.startOfNewGame) {
      this.frameCounter = 0;
      this.view.fadeInOut.setBlackAlphaTo(0);
      this.state = this.round;
    }
  }

  /**
   * Round: the players play volleyball in this game state
   * @type {GameState}
   */
  round() {
    const pressedPowerHit =
      this.keyboardArray[0].powerHit === 1 ||
      this.keyboardArray[1].powerHit === 1;

    // both 컴퓨터 모드에서 아무 키나 누르면 타이틀로
    if (
      this.physics.player1.isComputer &&
      this.physics.player2.isComputer &&
      pressedPowerHit
    ) {
      this.frameCounter = 0;
      this.view.game.visible = false;
      this.state = this.intro;
      return;
    }

    // 물리 연산 & 렌더링
    const isBallTouchingGround = this.physics.runEngineForNextFrame(
      this.keyboardArray
    );
    this.playSoundEffect();
    this.view.game.drawPlayersAndBall(this.physics);
    this.view.game.drawCloudsAndWave();

    // 이미 종료된 상태라면 게임 종료 애니메이션만 처리
    if (this.gameEnded) {
      this.view.game.drawGameEndMessage(this.frameCounter);
      this.frameCounter++;
      if (
        this.frameCounter >= this.frameTotal.gameEnd ||
        (this.frameCounter >= 70 && pressedPowerHit)
      ) {
        this.frameCounter = 0;
        this.view.game.visible = false;
        this.state = this.intro;
      }
      return;
    }

    // 공이 땅에 닿았고, 라운드가 아직 끝나지 않았고, 실제 게임 모드인 경우
    if (
      isBallTouchingGround &&
      !this._isPracticeMode &&
      !this.roundEnded &&
      !this.gameEnded
    ) {
      // 득점 처리
      if (this.physics.ball.punchEffectX < GROUND_HALF_WIDTH) {
        // P2 득점
        this.isPlayer2Serve = true;
        this.scores[1]++;
        if (
          this.scores[1] >= this.winningScore &&
          this.scores[1] - this.scores[0] >= 2
        ) {
          this.gameEnded = true;
          this.physics.player1.isWinner = false;
          this.physics.player2.isWinner = true;
          this.physics.player1.gameEnded = true;
          this.physics.player2.gameEnded = true;
        }
      } else {
        // P1 득점
        this.isPlayer2Serve = false;
        this.scores[0]++;
        if (
          this.scores[0] >= this.winningScore &&
          this.scores[0] - this.scores[1] >= 2
        ) {
          this.gameEnded = true;
          this.physics.player1.isWinner = true;
          this.physics.player2.isWinner = false;
          this.physics.player1.gameEnded = true;
          this.physics.player2.gameEnded = true;
        }
      }

      // 점수판 갱신
      this.view.game.drawScoresToScoreBoards(this.scores);

      // 게임 종료 시 3초 뒤 모달 띄우기 (P1 결과 제출)
      if (this.gameEnded && !this.isScoreSubmitted) {
        setTimeout(() => {
          if (!this.isScoreSubmitted) {
            this.openEndGameModal();
          }
        }, 3000);
      }

      // 슬로모션 처리
      if (!this.gameEnded) {
        this.slowMotionFramesLeft = this.SLOW_MOTION_FRAMES_NUM;
      }
      this.roundEnded = true;
    }

    // 라운드 종료 후 페이드 아웃
    if (this.roundEnded && !this.gameEnded) {
      if (this.slowMotionFramesLeft === 0) {
        this.view.fadeInOut.changeBlackAlphaBy(1 / 16);
        this.state = this.afterEndOfRound;
      }
    }
  }

  /**
   * Fade out after end of round
   * @type {GameState}
   */
  afterEndOfRound() {
    this.view.fadeInOut.changeBlackAlphaBy(1 / 16);
    this.frameCounter++;
    if (this.frameCounter >= this.frameTotal.afterEndOfRound) {
      this.frameCounter = 0;
      this.state = this.beforeStartOfNextRound;
    }
  }

  /**
   * Before start of next round, initialize ball and players, and print ready message
   * @type {GameState}
   */
  beforeStartOfNextRound() {
    if (this.frameCounter === 0) {
      this.view.fadeInOut.setBlackAlphaTo(1);
      this.view.game.drawReadyMessage(false);

      this.physics.player1.initializeForNewRound();
      this.physics.player2.initializeForNewRound();
      this.physics.ball.initializeForNewRound(this.isPlayer2Serve);
      this.view.game.drawPlayersAndBall(this.physics);
    }

    this.view.game.drawCloudsAndWave();
    this.view.fadeInOut.changeBlackAlphaBy(-(1 / 16));

    this.frameCounter++;
    if (this.frameCounter % 5 === 0) {
      this.view.game.toggleReadyMessage();
    }

    if (this.frameCounter >= this.frameTotal.beforeStartOfNextRound) {
      this.frameCounter = 0;
      this.view.game.drawReadyMessage(false);
      this.view.fadeInOut.setBlackAlphaTo(0);
      this.roundEnded = false;
      this.state = this.round;
    }
  }

  /**
   * Play sound effect on {@link round}
   */
  playSoundEffect() {
    const audio = this.audio;
    for (let i = 0; i < 2; i++) {
      const player = this.physics[`player${i + 1}`];
      const sound = player.sound;
      let leftOrCenterOrRight = 0;
      if (this.isStereoSound) {
        leftOrCenterOrRight = i === 0 ? -1 : 1;
      }
      if (sound.pipikachu === true) {
        audio.sounds.pipikachu.play(leftOrCenterOrRight);
        sound.pipikachu = false;
      }
      if (sound.pika === true) {
        audio.sounds.pika.play(leftOrCenterOrRight);
        sound.pika = false;
      }
      if (sound.chu === true) {
        audio.sounds.chu.play(leftOrCenterOrRight);
        sound.chu = false;
      }
    }
    const ball = this.physics.ball;
    const sound = ball.sound;
    let leftOrCenterOrRight = 0;
    if (this.isStereoSound) {
      if (ball.punchEffectX < GROUND_HALF_WIDTH) {
        leftOrCenterOrRight = -1;
      } else if (ball.punchEffectX > GROUND_HALF_WIDTH) {
        leftOrCenterOrRight = 1;
      }
    }
    if (sound.powerHit === true) {
      audio.sounds.powerHit.play(leftOrCenterOrRight);
      sound.powerHit = false;
    }
    if (sound.ballTouchesGround === true) {
      audio.sounds.ballTouchesGround.play(leftOrCenterOrRight);
      sound.ballTouchesGround = false;
    }
  }

  /**
   * Called if restart button clicked
   */
  restart() {
    this.frameCounter = 0;
    this.noInputFrameCounter = 0;
    this.slowMotionFramesLeft = 0;
    this.slowMotionNumOfSkippedFrames = 0;
    this.view.menu.visible = false;
    this.view.game.visible = false;
    this.isScoreSubmitted = false; // 게임 종료 후 플래그 초기화
    this.state = this.intro;
  }

  // 1P 보상 점수 계산
  calculateRewardForPlayer1() {
    const [p1, p2] = this.scores;
    // 듀스 진입 기준: winningScore - 1
    const deuceThreshold = this.winningScore - 1;
    const isDeuce = Math.min(p1, p2) >= deuceThreshold;

    if (isDeuce) {
      // 듀스 승리 => winningScore + 1, 듀스 패배 => winningScore
      return p1 > p2 ? this.winningScore + 1 : this.winningScore;
    } else {
      // 듀스 전 승리 => winningScore + 3, 듀스 전 패배 => 현재 득점
      return p1 > p2 ? this.winningScore + 3 : p1;
    }
  }

  openEndGameModal() {
    this.paused = true;
    const modal = document.getElementById('endGameModal');
    modal.style.display = 'flex';

    const submitBtn = modal.querySelector('button.submit');
    const userInput = modal.querySelector('input.user-id');

    if (!submitBtn || !userInput) return;

    if (!(submitBtn instanceof HTMLButtonElement)) return;
    if (!(userInput instanceof HTMLInputElement)) return;

    const freshBtn = submitBtn.cloneNode(true);
    submitBtn.replaceWith(freshBtn);

    freshBtn.addEventListener('click', async () => {
      const userId = userInput.value;
      const score = this.calculateRewardForPlayer1();

      await this.submitScore(userId, score);
      this.isScoreSubmitted = true;
      modal.style.display = 'none';
      this.paused = false;
      this.restart();
    });
  }

  // 백엔드로 점수 POST
  async submitScore(userId, score) {
    const token = process.env.URL_TOKEN;

    const payload = {
      gameName: "pikachu-volley",
      userId: userId,
      score: score
    };
    try {
      const res = await fetch('https://0by7j8suf2.execute-api.ap-northeast-2.amazonaws.com/proxy/api/result', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      console.log('점수 전송 성공');
    } catch (e) {
      console.error('전송 오류:', e);
    }
  }

  /** @return {boolean} */
  get isPracticeMode() {
    return this._isPracticeMode;
  }

  /**
   * @param {boolean} bool true: turn on practice mode, false: turn off practice mode
   */
  set isPracticeMode(bool) {
    this._isPracticeMode = bool;
    this.view.game.scoreBoards[0].visible = !bool;
    this.view.game.scoreBoards[1].visible = !bool;
  }
}
