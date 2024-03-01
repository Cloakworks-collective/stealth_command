import { expect } from "chai";
import hre from "hardhat";


export function canbuildCity(): void {
    it("can build city", async function () {

        const accounts = await hre.ethers.getSigners();
        const builder = accounts[0];

        const name = "Avalon";
        const infantry = 10;
        const tanks = 10;
        const artillery = 10;

        const eInfantry = await this.instance.instance.encrypt_uint32(
        infantry,
        );
        const eTanks = await this.instance.instance.encrypt_uint32(
        tanks,
        );
        const eArtillery = await this.instance.instance.encrypt_uint32(
        artillery,
        );
        
        await this.autoBattler.connect(builder).buildCity(
            name, 
            eInfantry, 
            eTanks, 
            eArtillery
        );

        const gameRecord = await this.autoBattler.gameRecord();
        expect(gameRecord.numberOfCities === BigInt(1));
        expect(gameRecord.numberOfBattles === BigInt(0));


        const playerState = await this.autoBattler.playerState(builder);
        expect(playerState.points === BigInt(0));
        expect(playerState.cityStatus === BigInt(1));

    });
  }

  export function canAttackWithWinningAttacker(): void {
    it("can attack, computes correct winner when attacker wins", async function () {


        const accounts = await hre.ethers.getSigners();
        const attacker = accounts[0];
        const defender = accounts[1];

        // build defender city
        const eInfantryDefender = await this.instance.instance.encrypt_uint32(
        10,
        );
        const eTanksDefender = await this.instance.instance.encrypt_uint32(
        10,
        );
        const eArtilleryDefender = await this.instance.instance.encrypt_uint32(
        10,
        );
        
        await this.autoBattler.connect(defender).buildCity(
            "Avalon", 
            eInfantryDefender, 
            eTanksDefender, 
            eArtilleryDefender
        );

        // attacker also must have city
        await this.autoBattler.connect(attacker).buildCity(
            "Thebes", 
            eInfantryDefender, 
            eTanksDefender, 
            eArtilleryDefender
        );
        

        const gameRecord = await this.autoBattler.gameRecord();
        expect(gameRecord.numberOfCities === BigInt(2));


        // attack where attacker wins
        const attackingInfantry = 20;
        const attackingTanks = 20;
        const attackingArtillery = 20;

        await this.autoBattler.connect(attacker).attack(
            defender,
            attackingInfantry,
            attackingTanks,
            attackingArtillery
        );

        // there should be 1 battle
        expect(gameRecord.numberOfBattles === BigInt(1));

        // attacker should have 1 point
        const attackerState = await this.autoBattler.playerState(attacker);
        expect(attackerState.points === BigInt(1));

        // defender should have 0 points
        const defenderState = await this.autoBattler.playerState(defender);
        expect(defenderState.points === BigInt(0));

    });
  }


  export function canAttackWithWinningDefender(): void {
    it("can attack, computes correct winner when attacker wins", async function () {


        const accounts = await hre.ethers.getSigners();
        const attacker = accounts[0];
        const defender = accounts[1];

        // build defender city
        const eInfantryDefender = await this.instance.instance.encrypt_uint32(
        10,
        );
        const eTanksDefender = await this.instance.instance.encrypt_uint32(
        10,
        );
        const eArtilleryDefender = await this.instance.instance.encrypt_uint32(
        10,
        );
        
        await this.autoBattler.connect(defender).buildCity(
            "Avalon", 
            eInfantryDefender, 
            eTanksDefender, 
            eArtilleryDefender
        );

        // attacker also must have city
        await this.autoBattler.connect(attacker).buildCity(
            "Thebes", 
            eInfantryDefender, 
            eTanksDefender, 
            eArtilleryDefender
        );
        

        const gameRecord = await this.autoBattler.gameRecord();
        expect(gameRecord.numberOfCities === BigInt(2));


        // attack where attacker wins
        const attackingInfantry = 5;
        const attackingTanks = 5;
        const attackingArtillery = 5;

        await this.autoBattler.connect(attacker).attack(
            defender,
            attackingInfantry,
            attackingTanks,
            attackingArtillery
        );

        // there should be 1 battle
        expect(gameRecord.numberOfBattles === BigInt(1));

        // attacker should have 0 points
        const attackerState = await this.autoBattler.playerState(attacker);
        expect(attackerState.points === BigInt(0));

        // defender should have 1 points
        const defenderState = await this.autoBattler.playerState(defender);
        expect(defenderState.points === BigInt(1));

    });
  }