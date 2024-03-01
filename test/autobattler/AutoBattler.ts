import { createFheInstance } from "../../utils/instance";
import type { Signers } from "../types";
import { canAttackWithWinningAttacker, canAttackWithWinningDefender, canbuildCity } from "./AutoBattler.behavior";
import { deployCounterFixture, getTokensFromFaucet } from "./AutoBattler.fixture";
import hre from "hardhat";

describe("Unit tests", function () {
  before(async function () {
    this.signers = {} as Signers;

    // get tokens from faucet if we're on localfhenix and don't have a balance
    await getTokensFromFaucet();
    // deploy test contract
    const { autoBattler, address } = await deployCounterFixture();
    this.autoBattler = autoBattler;

    // initiate fhenixjs
    this.instance = await createFheInstance(hre, address);

    // set admin account/signer
    const signers = await hre.ethers.getSigners();
    this.signers.admin = signers[0];
  });

  describe("AutoBattler", function () {
    canbuildCity();
    canAttackWithWinningAttacker();
    canAttackWithWinningDefender();
  });
});