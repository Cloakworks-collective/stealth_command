//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@fhenixprotocol/contracts/FHE.sol";
import "./IAutoBattler.sol";

contract AutoBattler is IAutoBattler {

   uint public constant MAX_ARMY_STRENGTH = 1000;

    /// CONSTRUCTOR ///
    constructor() {
        gameRecord.numberOfBattles = 0;
    }
    

    /// PUBLIC FUNCTIONS ///

    function buildCity(
        string calldata _name,
        inEuint32 calldata _encryptedInfantry,
        inEuint32 calldata _encryptedTanks,
        inEuint32 calldata _encryptedArtillery
    ) 
    public override isNotPlayer{
        // Validate player's army 
        _validateEncryptedArmy(_encryptedInfantry, _encryptedTanks, _encryptedArtillery);

        // Setup a new city with default values and the encrypted defense
        City memory newCity;
        newCity.name = _name;
        newCity.cityStatus = CityStatus.NoDefenseSet;
        newCity.points = 0;
        newCity.lastAttackedAt = 0;
        newCity.lastDefendedAt = 0;

        // set defense
        _setDefense(_encryptedInfantry, _encryptedTanks, _encryptedArtillery);

        // add a new city to the gameRecord
        gameRecord.players[msg.sender] = newCity;
        gameRecord.numberOfCities++;

        // Emit event
        emit CityBuilt(msg.sender, gameRecord.numberOfCities);
    }


    function setDefense(
        inEuint32 calldata _encryptedInfantry,
        inEuint32 calldata _encryptedTanks,
        inEuint32 calldata _encryptedArtillery
    ) public override isPlayer {
        // Validate player's army 
        _validateEncryptedArmy(_encryptedInfantry, _encryptedTanks, _encryptedArtillery);

        // Set defense
        _setDefense(_encryptedInfantry, _encryptedTanks, _encryptedArtillery);

        // Emit event
        emit DefenseSet(msg.sender);
    }


    function attack(
        address _defender, 
        uint32 _infantry,
        uint32 _tanks,
        uint32 _artillery
    ) public override{
        // Validate player's attacking army 
        _validateArmy(_infantry, _tanks, _artillery);

        // Battle
        City storage defenderCity = gameRecord.players[_defender];

        EncryptedArmy memory defense = defenderCity.defense;
        euint32 defendingInfantry = defense.infantry;
        euint32 defendingTanks = defense.tanks;
        euint32 defendingArtillery = defense.artillery;

        euint32 attackingInfantry = FHE.asEuint32(_infantry);
        euint32 attackingTanks = FHE.asEuint32(_tanks);
        euint32 attackingArtillery = FHE.asEuint32(_artillery);

        uint8 attackerPoints = 0;
        // tanks > infantry
        ebool roundOne = attackingTanks.gt(defendingInfantry);
        if (FHE.decrypt(roundOne)){
            attackerPoints++;
        }
    
        // infantry > artillery
        ebool roundTwo = attackingInfantry.gt(defendingArtillery);
        if (FHE.decrypt(roundTwo)){
            attackerPoints++;
        }

        // artillery > tanks
        ebool roundThree = attackingArtillery.gt(defendingTanks);
        if (FHE.decrypt(roundThree)){
            attackerPoints++;
        }

        if (attackerPoints > 1) {
            gameRecord.players[msg.sender].points++;
        } else {
            defenderCity.points++;
        }
    }

    /// INTERNAL FUNCTIONS ///
    function _validateArmy(
        uint32 _infantry, 
        uint32 _tanks,
        uint32 _artillery
    ) internal pure {
        require(_infantry + _tanks + _artillery <= MAX_ARMY_STRENGTH, "Army strength exceeds the limit");
    }

    function _validateEncryptedArmy(
        inEuint32 calldata _encryptedInfantry,
        inEuint32 calldata _encryptedTanks,
        inEuint32 calldata _encryptedArtillery
    ) internal pure {
        euint32 infantry = FHE.asEuint32(_encryptedInfantry);
        euint32 tanks = FHE.asEuint32(_encryptedTanks);
        euint32 artillery = FHE.asEuint32(_encryptedArtillery);

        euint32 eMaxSTrength = FHE.asEuint32(MAX_ARMY_STRENGTH);
        euint32 eTotalStrength = infantry + tanks + artillery;
        FHE.req(eTotalStrength.lt(eMaxSTrength));
    }

    function _setDefense(
        inEuint32 calldata _encryptedInfantry,
        inEuint32 calldata _encryptedTanks,
        inEuint32 calldata _encryptedArtillery
    ) internal {
        euint32 infantry = FHE.asEuint32(_encryptedInfantry);
        euint32 tanks = FHE.asEuint32(_encryptedTanks);
        euint32 artillery = FHE.asEuint32(_encryptedArtillery);
        EncryptedArmy memory _defense = EncryptedArmy(infantry, tanks, artillery);

        City storage playerCity = gameRecord.players[msg.sender];
        playerCity.defense = _defense;
        playerCity.cityStatus = CityStatus.DefenseSet;
    }

    /// GETTERS ///
    function playerState(address _player) public view override returns (      
        CityStatus cityStatus,
        uint256 points,
        uint256 lastAttackedAt,
        uint256 lastDefendedAt
        ) {
        return (
                gameRecord.players[_player].cityStatus,
                gameRecord.players[_player].points,
                gameRecord.players[_player].lastAttackedAt,
                gameRecord.players[_player].lastDefendedAt
            );
    }


}