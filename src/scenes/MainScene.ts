import Passenger from '../objects/Passenger';
import { levels } from '../config/levels';

import * as passengerSound from '../assets/audio/passenger.wav';
import * as gatesSound from '../assets/audio/gates.wav';
import * as sumoSound from '../assets/audio/sumo.wav';
import * as bijSound from '../assets/audio/bij.mp3';
import * as stationSound from '../assets/audio/station.mp3';

import * as trainBGImg from '../assets/images/pixil-layer-Background.png';
import * as trainInteriorImg from '../assets/images/pixil-layer-Train-interior.png';
import * as trainExteriorImg from '../assets/images/pixil-layer-Train.png';

import * as trainDoorAnim0Img from '../assets/images/pixil-metro0.png';
import * as trainDoorAnim1Img from '../assets/images/pixil-metro1.png';
import * as trainDoorAnim2Img from '../assets/images/pixil-metro2.png';
import * as trainDoorAnim3Img from '../assets/images/pixil-metro3.png';
import * as trainDoorAnim4Img from '../assets/images/pixil-metro4.png';
import * as trainDoorAnim5Img from '../assets/images/pixil-metro5.png';

import * as passenger1anim0Img from '../assets/images/pixil-layer-P1-0.png';
import * as passenger1anim1Img from '../assets/images/pixil-layer-P1-1.png';

import * as passenger2anim0Img from '../assets/images/pixil-layer-P2-0.png';
import * as passenger2anim1Img from '../assets/images/pixil-layer-P2-1.png';

import * as conductorAnim0Img from '../assets/images/pixil-layer-Conductor-0.png';
import * as conductorAnim1Img from '../assets/images/pixil-layer-Conductor-1.png';

import * as sumoAnim0Img from '../assets/images/pixil-layer-Sumo-0.png';
import * as sumoAnim1Img from '../assets/images/pixil-layer-Sumo-1.png';

let currentLevel = 0;
let flaga = true;
let flaga2 = true;

export default class MainScene extends Phaser.Scene {
    private passengersArr: Passenger[];

    private sumoArr: Passenger[];

    private score: number;

    private highScore: number;

    private combo: number;

    private hp: number;

    private startTime: Date;

    private trainLeft: boolean;

    private hsText: Phaser.GameObjects.Text;

    private scoreText: Phaser.GameObjects.Text;

    private comboText: Phaser.GameObjects.Text;

    private hpText: Phaser.GameObjects.Text;

    private trainDoor: Phaser.GameObjects.Sprite;

    private trainInterior: Phaser.GameObjects.Sprite;

    private trainExterior: Phaser.GameObjects.Sprite;

    private background: Phaser.GameObjects.Sprite;

    private progressBar: Phaser.GameObjects.Graphics;

    private music: Phaser.Sound.BaseSound;

    private bij: Phaser.Sound.BaseSound;

    public constructor() {
      super({
        key: 'MainScene',
      });

      this.passengersArr = [];
      this.sumoArr = [];
      this.score = 0;
      this.highScore = Number(localStorage.getItem('hs'));
      this.combo = 1;
      this.hp = 3;

      this.startTime = new Date();
      this.trainLeft = false;
    }

    private addToScore(passenger, points = 10): void {
      const s = points * (this.combo += 1);
      this.score += s;
      if (this.score > this.highScore) {
        if (!this.highScore) {
          this.hsText = this.add.text(
            16,
            56,
            `High score:  ${this.highScore}`,
            {
              fontSize: '32px',
              fill: '#fff',
              fontFamily: 'Pixel miners',
            },
          );
        }

        this.highScore = this.score;

        this.hsText.setText(`High score:  ${this.highScore}`);
        localStorage.setItem('hs', String(this.highScore));
      }

      this.scoreText.setText(`Score:  ${this.score}`);
      this.comboText.setText(`Combo  x${this.combo}`);

      const andOneText = this.add.text(
        passenger.x + 50,
        passenger.y,
        `+${s}`,
        {
          fontSize: '24px',
          fill: '#fff',
          fontFamily: 'Pixel miners',
        },
      );

      this.tweens.add({
        targets: andOneText,
        x: passenger.x + 50,
        y: passenger.y - 50,
        alpha: 0,
        ease: 'Cubic',
        duration: 1000,
        delay: 0,
        repeat: 0,
        yoyo: false,
      });
    }

    private trainLeave(): void {
      this.trainLeft = true;
      this.trainDoor.anims.playReverse('close-door');

      this.tweens.add({
        targets: [
          this.trainInterior,
          this.trainExterior,
          this.trainDoor,
        ],
        x: this.cameras.main.width,
        y: 0,
        ease: 'Cubic',
        duration: 500,
        delay: 800,
        repeat: 0,
        yoyo: false,
        onComplete: (): void => {
          if (this.hp > 0) {
            this.scene.restart();
            currentLevel += 1;
            this.trainLeft = false;
            this.startTime = new Date();
          }
        },
      });
    }

    public preload(): void {
      this.load.image('trainBG', trainBGImg);
      this.load.image('trainInterior', trainInteriorImg);
      this.load.image('trainExterior', trainExteriorImg);

      this.load.image('trainDoorAnim0', trainDoorAnim0Img);
      this.load.image('trainDoorAnim1', trainDoorAnim1Img);
      this.load.image('trainDoorAnim2', trainDoorAnim2Img);
      this.load.image('trainDoorAnim3', trainDoorAnim3Img);
      this.load.image('trainDoorAnim4', trainDoorAnim4Img);
      this.load.image('trainDoorAnim5', trainDoorAnim5Img);

      this.load.image('passenger1anim0', passenger1anim0Img);
      this.load.image('passenger1anim1', passenger1anim1Img);

      this.load.image('passenger2anim0', passenger2anim0Img);
      this.load.image('passenger2anim1', passenger2anim1Img);

      this.load.image('conductorAnim0', conductorAnim0Img);
      this.load.image('conductorAnim1', conductorAnim1Img);

      this.load.image('sumoAnim0', sumoAnim0Img);
      this.load.image('sumoAnim1', sumoAnim1Img);
      this.load.audio('theme', [stationSound]);
      this.load.audio('bij', [bijSound]);
      this.load.audio('sumo', [sumoSound]);
      this.load.audio('passenger', [passengerSound]);
      this.load.audio('gates', [gatesSound]);
    }

    protected create(): void {
      this.startTime = new Date();

      if (flaga2) {
        this.music = this.sound.add('theme', { loop: true, volume: 0.5 });
        this.bij = this.sound.add('bij', { loop: true, volume: 0.15 });

        this.music.play();
        this.bij.play();

        flaga2 = false;
      }

      this.sound.add('sumo');
      this.sound.add('gates');

      this.background = this.add.sprite(0, 0, 'trainBG');
      this.background.setOrigin(0, 0);
      this.background.setScale(5);

      this.trainInterior = this.add.sprite(-this.cameras.main.width, 0, 'trainInterior');
      this.trainInterior.setOrigin(0, 0);
      this.trainInterior.setScale(5);

      this.trainExterior = this.add.sprite(-this.cameras.main.width, 0, 'trainExterior');
      this.trainExterior.setOrigin(0, 0);
      this.trainExterior.setScale(5);

      this.anims.create({
        key: 'door-open',
        frames: [
          {
            key: 'trainDoorAnim0',
            frame: 0,
          },
          {
            key: 'trainDoorAnim1',
            frame: 0,
          },
          {
            key: 'trainDoorAnim2',
            frame: 0,
          },
          {
            key: 'trainDoorAnim3',
            frame: 0,
          },
          {
            key: 'trainDoorAnim4',
            frame: 0,
          },
          {
            key: 'trainDoorAnim5',
            frame: 0,
          },
        ],
        frameRate: 30,
        repeat: 0,
      });

      this.anims.create({
        key: 'door-close',
        frames: [
          {
            key: 'trainDoorAnim5',
            frame: 0,
          },
          {
            key: 'trainDoorAnim4',
            frame: 0,
          },
          {
            key: 'trainDoorAnim3',
            frame: 0,
          },
          {
            key: 'trainDoorAnim2',
            frame: 0,
          },
          {
            key: 'trainDoorAnim1',
            frame: 0,
          },
          {
            key: 'trainDoorAnim0',
            frame: 0,
          },
        ],
        frameRate: 30,
        repeat: 0,
      });

      this.anims.create({
        key: 'passenger1anim',
        frames: [
          {
            key: 'passenger1anim0',
            frame: 0,
          },
          {
            key: 'passenger1anim1',
            frame: 0,
          },
        ],
        frameRate: 8,
        repeat: -1,
      });

      this.anims.create({
        key: 'passenger2anim',
        frames: [
          {
            key: 'passenger2anim0',
            frame: 0,
          },
          {
            key: 'passenger2anim1',
            frame: 0,
          },
        ],
        frameRate: 8,
        repeat: -1,
      });

      this.anims.create({
        key: 'sumoAnim',
        frames: [
          {
            key: 'sumoAnim0',
            frame: 0,
          },
          {
            key: 'sumoAnim1',
            frame: 0,
          },
        ],
        frameRate: 8,
        repeat: -1,
      });

      this.anims.create({
        key: 'conductorAnim',
        frames: [
          {
            key: 'conductorAnim0',
            frame: 0,
          },
          {
            key: 'conductorAnim1',
            frame: 0,
          },
        ],
        frameRate: 8,
        repeat: -1,
      });

      this.trainDoor = this.add.sprite(-this.cameras.main.width, 0, 'trainDoorAnim0');
      this.trainDoor.setOrigin(0, 0);
      this.trainDoor.setScale(5);

      this.progressBar = this.add.graphics();
      const progressBox = this.add.graphics();
      progressBox.fillStyle(0xffffff, 0.8);
      progressBox.fillRect(24, 400 + 270 - 24, 320, 50);

      this.progressBar.fillStyle(0xffffff, 0.8);

      this.scoreText = this.add.text(
        16,
        16,
        `Score:  ${this.score}`,
        {
          fontSize: '32px',
          fill: '#fff',
          fontFamily: 'Pixel miners',
        },
      );

      if (this.highScore) {
        this.hsText = this.add.text(
          16,
          56,
          `High score:  ${this.highScore}`,
          {
            fontSize: '32px',
            fill: '#fff',
            fontFamily: 'Pixel miners',
          },
        );
      }

      this.comboText = this.add.text(
        this.cameras.main.width - 16,
        16,
        `Combo  x${this.combo}`,
        {
          fontSize: '32px',
          fill: '#fff',
          fontFamily: 'Pixel miners',
        },
      );
      this.comboText.setOrigin(1, 0);

      this.hpText = this.add.text(
        this.cameras.main.width - 16,
        56,
        `HP:  ${Math.max(0, this.hp)}`,
        {
          fontSize: '32px',
          fill: '#fff',
          fontFamily: 'Pixel miners',
        },
      );
      this.hpText.setOrigin(1, 0);

      const conductor = this.add.sprite(640, this.cameras.main.height - 50, 'conductorAnim0');
      conductor.setOrigin(0, 1);
      conductor.setScale(5);
      conductor.play('conductorAnim');

      const { left: leftArrow, right: rightArrow } = this.input.keyboard.createCursorKeys();

      leftArrow.on('down', (): void => {
        conductor.x = Math.max(conductor.x - 430, 210);
      });

      rightArrow.on('down', (): void => {
        conductor.x = Math.min(conductor.x + 430, 1070);
      });


      if (flaga) {
        flaga = false;

        const keyShoot = this.input.keyboard.addKey('Q');
        keyShoot.on('down', (): void => {
          const newPassengerArr = [];
          let hasDeleted = false;

          // eslint-disable-next-line no-restricted-syntax, guard-for-in
          for (const i in this.passengersArr) {
            const passengerSprite = this.passengersArr[i];
            if (hasDeleted) {
              newPassengerArr.push(passengerSprite);
              // eslint-disable-next-line no-continue
              continue;
            }

            // eslint-disable-next-line no-continue
            if (!passengerSprite.body) { continue; }

            if (passengerSprite.body.y <= 310) {
              console.log(passengerSprite.body.x, conductor.x);
            }

            if (
              passengerSprite.x >= conductor.x - 50
            && passengerSprite.x <= conductor.x + 50
            && passengerSprite.y <= 390
            ) {
              if (this.sumoArr.indexOf(passengerSprite) !== -1) {
                this.sound.play('sumo');
              }
              passengerSprite.hp -= 1;
              if (passengerSprite.hp === 0) {
                this.addToScore(passengerSprite);
                this.sound.play('passenger');
                passengerSprite.destroy();
                passengerSprite.rect.clear();
                hasDeleted = true;

                // eslint-disable-next-line no-continue
                continue;
              }
            }

            newPassengerArr.push(passengerSprite);
          }

          this.passengersArr = newPassengerArr;
        });
      }


      this.tweens.add({
        targets: [
          this.trainInterior,
          this.trainExterior,
          this.trainDoor,
        ],
        x: 0,
        y: 0,
        ease: 'Cubic',
        duration: 1000,
        onComplete: (): void => {
          this.trainDoor.play('door-open');
          this.setupLevel(this, levels[currentLevel]);
        },
      });
    }

    public update(): void {
      // eslint-disable-next-line no-restricted-syntax
      for (const passengerSprite of this.passengersArr) {
        // eslint-disable-next-line no-continue
        if (!passengerSprite.body) { continue; }

        if (passengerSprite.y < 390 || this.trainLeft) {
          passengerSprite.body.velocity.y = 0;
        } else {
          passengerSprite.body.velocity.y = -200;
        }
      }

      const timeElapsed = new Date().getTime() - this.startTime.getTime();
      const percentageOfTimeToLeave = timeElapsed / (levels[currentLevel].timeToLeave * 1000);
      this.progressBar.fillRect(34, 400 + 280 - 24, 300 * Math.min(1, percentageOfTimeToLeave), 30);

      this.passengersArr.forEach((p): void => {
        if (!p.body) {
          p.rect.clear();
          return;
        }

        if (!p.rect) {
          // eslint-disable-next-line no-param-reassign
          p.rect = this.add.graphics();
        }

        p.rect.clear();

        if (p.initialHp < 4) {
          p.rect.fillStyle(0x4298F1, 1);
        } else {
          p.rect.fillStyle(0xff0000, 1);
        }

        const hpp = p.hp / p.initialHp;
        let w = 100;

        if (p.initialHp < 4) {
          w = 75;
        }
        p.rect.fillRect(p.body.x + 5, p.body.y - p.body.height / 2, w * hpp - p.body.width, 10);
      });

      if (percentageOfTimeToLeave > 1 && !this.trainLeft) {
        if (this.passengersArr.length > 0) {
          this.hp -= this.passengersArr.length;
          console.log(this.hp);
          this.hpText.setText(`HP:  ${Math.max(0, +this.hp)}`);
          this.combo = 1;

          if (this.hp <= 0) {
            document.querySelector('#o').classList.add('v');
            const $score: HTMLElement = document.querySelector('#score') as HTMLElement;
            $score.innerText = String(this.score);
          }
        }

        this.trainLeave();
      }
    }

    private setupLevel(
      game,
      { rowOnePassengers, rowTwoPassengers, rowThreePassengers },
    ): void {
      // eslint-disable-next-line no-restricted-syntax
      for (const passenger of rowOnePassengers) {
        const passengerTime = typeof passenger === 'number' ? passenger : passenger.time;
        const isSumo = typeof passenger !== 'number';
        setTimeout((): void => {
          // eslint-disable-next-line no-shadow
          const passenger = new Passenger(
            game,
            210 + (50 * (Math.random() > 0.5 ? -1 : 1)),
            800 + Math.random() * 100,
            // eslint-disable-next-line no-nested-ternary
            isSumo ? 'sumoAnim0' : Math.round(Math.random()) ? 'passenger1anim0' : 'passenger2anim0',
            isSumo ? 10 : 2,
            // eslint-disable-next-line no-nested-ternary
            isSumo ? 'sumoAnim' : Math.round(Math.random()) ? 'passenger1anim' : 'passenger2anim',
          );
          this.passengersArr.push(passenger);

          if (isSumo) {
            this.sumoArr.push(passenger);
          }
        }, passengerTime);
      }


      // eslint-disable-next-line no-restricted-syntax
      for (const passenger of rowTwoPassengers) {
        const passengerTime = typeof passenger === 'number' ? passenger : passenger.time;
        const isSumo = typeof passenger !== 'number';

        setTimeout((): void => {
          // eslint-disable-next-line no-shadow
          const passenger = new Passenger(
            game,
            640 + (50 * (Math.random() > 0.5 ? -1 : 1)),
            800 + Math.random() * 100,
            // eslint-disable-next-line no-nested-ternary
            isSumo ? 'sumoAnim0' : Math.round(Math.random()) ? 'passenger1anim0' : 'passenger2anim0',
            isSumo ? 10 : 2,
            // eslint-disable-next-line no-nested-ternary
            isSumo ? 'sumoAnim' : Math.round(Math.random()) ? 'passenger1anim' : 'passenger2anim',
          );

          this.passengersArr.push(passenger);
          if (isSumo) {
            this.sumoArr.push(passenger);
          }
        }, passengerTime);
      }

      // eslint-disable-next-line no-restricted-syntax
      for (const passenger of rowThreePassengers) {
        const passengerTime = typeof passenger === 'number' ? passenger : passenger.time;
        const isSumo = typeof passenger !== 'number';

        setTimeout((): void => {
          // eslint-disable-next-line no-shadow
          const passenger = new Passenger(
            game,
            1070 + (50 * (Math.random() > 0.5 ? -1 : 1)),
            800 + Math.random() * 100,
            // eslint-disable-next-line no-nested-ternary
            isSumo ? 'sumoAnim0' : Math.round(Math.random()) ? 'passenger1anim0' : 'passenger2anim0',
            isSumo ? 10 : 2,
            // eslint-disable-next-line no-nested-ternary
            isSumo ? 'sumoAnim' : Math.round(Math.random()) ? 'passenger1anim' : 'passenger2anim',
          );
          this.passengersArr.push(passenger);
          if (isSumo) {
            this.sumoArr.push(passenger);
          }
        }, passengerTime);
      }
    }
}
