import type { AutoBattler } from "../../types";
import hre from "hardhat";

export async function deployCounterFixture(): Promise<{
  autoBattler: AutoBattler;
  address: string;
}> {
  const accounts = await hre.ethers.getSigners();
  const contractOwner = accounts[0];

  const AutoBattler = await hre.ethers.getContractFactory("AutoBattler");
  const autoBattler = await AutoBattler.connect(contractOwner).deploy();
  await autoBattler.waitForDeployment();
  const address = await autoBattler.getAddress();
  return { autoBattler, address };
}

export async function getTokensFromFaucet() {
  if (hre.network.name === "localfhenix") {
    const signers = await hre.ethers.getSigners();

    if (
      (await hre.ethers.provider.getBalance(signers[0].address)).toString() ===
      "0"
    ) {
      await hre.fhenixjs.getFunds(signers[0].address);
    }

    if (
      (await hre.ethers.provider.getBalance(signers[1].address)).toString() ===
      "0"
    ) {
      await hre.fhenixjs.getFunds(signers[1].address);
    }  
  }
}