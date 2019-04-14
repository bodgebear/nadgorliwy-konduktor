import Passenger, { playerType } from '../objects/Passenger';
import Conductor from '../objects/Conductor';
import GameDataManager from '../objects/GameDataManager';
import { Level, levels } from '../config/levels';
import { createAnimation } from '../utils/createAnimation';

export default class GameScene extends Phaser.Scene {
    private passengersArr: Passenger[];

    private trainLeft: boolean;

    private trainDoor: Phaser.GameObjects.Sprite;

    private trainInterior: Phaser.GameObjects.Sprite;

    private trainExterior: Phaser.GameObjects.Sprite;

    private background: Phaser.GameObjects.Sprite;

    private music: Phaser.Sound.BaseSound;

    private bij: Phaser.Sound.BaseSound;

    private conductor: Conductor;

    private get gdm(): GameDataManager {
      return this.registry.get('gdm');
    }

    public constructor() {
      super({
        key: 'GameScene',
      });

      this.passengersArr = [];

      this.trainLeft = false;
    }

    private addToScore(passenger: Passenger, points = 10): void {
      const s = points * this.gdm.combo;
      this.gdm.addToScore(points);

      passenger.showAndOneText(s);
    }

    private trainLeave(): void {
      this.trainLeft = true;
      this.trainDoor.anims.playReverse('door-open');

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
          if (this.gdm.hp > 0) {
            this.scene.restart();
            this.gdm.nextLevel();
          }
        },
      });
    }

    protected create(): void {
      this.trainLeft = false;
      this.gdm.setStartTime(Date.now());

      if (!this.music || !this.music.isPlaying) {
        this.music = this.sound.add('theme', { loop: true, volume: 0.5 });
        this.music.play();
      }

      if (!this.bij || !this.bij.isPlaying) {
        this.bij = this.sound.add('bij', { loop: true, volume: 0.15 });

        this.bij.play();
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

      this.anims.create(createAnimation(
        'door-open',
        6,
        'trainDoorAnim',
        {
          frameRate: 30,
          repeat: 0,
        },
      ));

      this.anims.create(createAnimation(
        'passenger1anim',
        2,
        'passenger1anim',
        {
          frameRate: 8,
        repeat: -1,
        },
      ));

      this.anims.create(createAnimation(
        'passenger2anim',
        2,
        'passenger2anim',
        {
          frameRate: 8,
        repeat: -1,
        },
      ));

      this.anims.create(createAnimation(
        'sumoAnim',
        2,
        'sumoAnim',
        {
          frameRate: 8,
        repeat: -1,
        },
      ));

      this.anims.create(createAnimation(
        'conductorAnim',
        2,
        'conductorAnim',
        {
          frameRate: 8,
          repeat: -1,
        },
      ));

      this.trainDoor = this.add.sprite(-this.cameras.main.width, 0, 'trainDoorAnim0');
      this.trainDoor.setOrigin(0, 0);
      this.trainDoor.setScale(5);

      this.conductor = new Conductor(this, 640, this.cameras.main.height - 50);

      const { left: leftArrow, right: rightArrow } = this.input.keyboard.createCursorKeys();

      leftArrow.off('down');
      leftArrow.on('down', (): void => {
        this.conductor.goLeft();
      });

      rightArrow.off('down');
      rightArrow.on('down', (): void => {
        this.conductor.goRight();
      });

      const keyShoot = this.input.keyboard.addKey('Q');
      keyShoot.off('down');
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

          if (
            this.conductor.areOnTheSameRow(passengerSprite)
            && passengerSprite.y <= 390
          ) {
            if (passengerSprite.playerType === playerType.Sumo) {
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
          this.setupLevel(this, levels[this.gdm.currentLevel]);
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

      const percentageOfTimeToLeave = this.gdm.getPercentageOfTimeElapsed();

      if (percentageOfTimeToLeave > 1 && !this.trainLeft) {
        if (this.passengersArr.length > 0) {
          this.gdm.dealDamage(this.passengersArr.length);
        }

        this.trainLeave();
      }
    }

    private setupLevel(
      game: Phaser.Scene,
      { rowOnePassengers, rowTwoPassengers, rowThreePassengers }: Level,
    ): void {
      // eslint-disable-next-line no-restricted-syntax
      for (const passenger of rowOnePassengers) {
        const passengerTime = passenger.time;
        const passengerType = passenger.playerType;

        // eslint-disable-next-line no-loop-func
        this.time.delayedCall(passengerTime, (): void => {
          // eslint-disable-next-line no-shadow
          const passenger = new Passenger(
            game,
            210 + (50 * (Math.random() > 0.5 ? -1 : 1)),
            800 + Math.random() * 100,
            passengerType,
            1,
          );
          this.passengersArr.push(passenger);
        }, [], null);
      }


      // eslint-disable-next-line no-restricted-syntax
      for (const passenger of rowTwoPassengers) {
        const passengerTime = passenger.time;
        const passengerType = passenger.playerType;

        // eslint-disable-next-line no-loop-func
        this.time.delayedCall(passengerTime, (): void => {
          // eslint-disable-next-line no-shadow
          const passenger = new Passenger(
            game,
            640 + (50 * (Math.random() > 0.5 ? -1 : 1)),
            800 + Math.random() * 100,
            passengerType,
            2,
          );

          this.passengersArr.push(passenger);
        }, [], this);
      }

      // eslint-disable-next-line no-restricted-syntax
      for (const passenger of rowThreePassengers) {
        const passengerTime = passenger.time;
        const passengerType = passenger.playerType;

        // eslint-disable-next-line no-loop-func
        this.time.delayedCall(passengerTime, (): void => {
          // eslint-disable-next-line no-shadow
          const passenger = new Passenger(
            game,
            1070 + (50 * (Math.random() > 0.5 ? -1 : 1)),
            800 + Math.random() * 100,
            passengerType,
            3,
          );
          this.passengersArr.push(passenger);
        }, [], this);
      }
    }
}