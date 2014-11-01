#pragma strict

// This class should be attached to a unit and a number 0-14 should be assigned. The component will attach the correct unit
//		to the unit object.

enum CharacterName { Filonius,Thomas,Mary,Helena,Robin,Gretta,Brad,Andre,Jade };

class CharacterRoster extends MonoBehaviour {
	// Properties
	var characterName: CharacterName;
	
	function Initialize() {
		var unit: ConflictUnit = GetComponent(ConflictUnit) as ConflictUnit;
	
		// initialize characters
		switch (characterName) {
		case CharacterName.Filonius:
			unit.characterName = "Filonius, the Glittery";
			unit.attack = 0;
			unit.influence = 1;
			unit.maximumHealth = 7;
			unit.abilities = [unit.abilities[0],unit.abilities[1],unit.abilities[2],UnitAbilityInfluenceBonusInSiteTypes(unit.influence,1,["castle","village"])];
			unit.numberOfAbilities = 4;
			unit.unitIcon = Resources.Load("merchanticon",Texture);
			break;
			
		case CharacterName.Thomas:
			unit.characterName = "Sir Thomas";
			unit.attack = 1;
			unit.influence = 1;
			unit.maximumHealth = 8;
			unit.abilities = [unit.abilities[0],unit.abilities[1],unit.abilities[2],UnitAbilityInfluenceBonusInSiteTypes(unit.influence,1,["castle"])];
			unit.numberOfAbilities = 4;
			unit.unitIcon = Resources.Load("knighticon",Texture);
			break;
			
		case CharacterName.Mary:
			unit.characterName = "Mary the Annointed";
			unit.attack = 0;
			unit.influence = 1;
			unit.maximumHealth = 8;
			unit.abilities = [unit.abilities[0],unit.abilities[1],unit.abilities[2],UnitAbilityInfluenceBonusInSiteTypes(unit.influence,1,["temple"])];
			unit.numberOfAbilities = 4;
			unit.unitIcon = Resources.Load("priesticon",Texture);
			break; 
			
		case CharacterName.Helena:
			unit.characterName = "Helena of the North";
			unit.attack = 0;
			unit.influence = 1;
			unit.maximumHealth = 7;
			unit.abilities = [unit.abilities[0],unit.abilities[1],unit.abilities[2],UnitAbilityInfluenceBonusInSiteTypes(unit.influence,2,["castle"])];
			unit.numberOfAbilities = 4;
			unit.unitIcon = Resources.Load("nobleicon",Texture);
			break;
			
		case CharacterName.Robin:
			unit.characterName = "Robin, Champion of the Poor";
			unit.attack = 1;
			unit.influence = 1;
			unit.maximumHealth = 8;
			unit.abilities = [unit.abilities[0],unit.abilities[1],unit.abilities[2],UnitAbilityInfluenceBonusInSiteTypes(unit.influence,1,["village"])];
			unit.numberOfAbilities = 4;
			unit.unitIcon = Resources.Load("knighticon",Texture);
			break;
		
		case CharacterName.Gretta:
			unit.characterName = "Gretta, Conqueror";
			unit.attack = 1;
			unit.influence = 0;
			unit.maximumHealth = 7;
			unit.abilities = [unit.abilities[0],unit.abilities[1],unit.abilities[2],UnitAbilityAttackWithBonus(unit.attack,1,["village","castle"])];
			unit.numberOfAbilities = 4;
			unit.unitIcon = Resources.Load("warrioricon",Texture);
			break;
			
		case CharacterName.Brad:
			unit.characterName = "Brad the Bloodhungry";
			unit.attack = 1;
			unit.influence = 0;
			unit.maximumHealth = 5;
			unit.abilities = [unit.abilities[0],unit.abilities[1],unit.abilities[2],UnitAbilityAttackWithBonus(unit.attack,2,["village"])];
			unit.numberOfAbilities = 4;
			unit.unitIcon = Resources.Load("warrioricon",Texture);
			break;
			
		case CharacterName.Andre:
			unit.characterName = "Andre, Bringer of Light";
			unit.attack = 0;
			unit.influence = 1;
			unit.maximumHealth = 9;
			unit.abilities = [unit.abilities[0],unit.abilities[1],unit.abilities[2],UnitAbilityAttackWithBonus(unit.attack,2,["castle"])];
			unit.numberOfAbilities = 4;
			unit.unitIcon = Resources.Load("knighticon",Texture);
			break;
			
		case CharacterName.Jade:
			unit.characterName = "Jade, Healer";
			unit.attack = 0;
			unit.influence = 1;
			unit.maximumHealth = 8;
			unit.abilities = [unit.abilities[0],unit.abilities[1],unit.abilities[2],UnitAbilityHeal(3)];
			unit.numberOfAbilities = 4;
			unit.unitIcon = Resources.Load("priesticon",Texture);
			break;
			
		default:	break;
		}
	}
}