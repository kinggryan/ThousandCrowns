#pragma strict

// This class should be attached to a unit and a number 0-14 should be assigned. The component will attach the correct unit
//		to the unit object.

enum CharacterName { Galut,Mavia,Arwa,Kawlah,Daborah,Faris,Yaakoub,Umri,Nusaybah,Zenobia,Rabia,Suleiman,Jad,Elias };
/*	New names:	Galut - Male Warrior
				Mavia - Female Warrior
				Helena ->		Arwa - Female Noble/warrior/knight
				Kawlah - Female knight
				Mary ->			Daborah - Female Priest
				Bob ->			Faris - Male Noble
				Filonius -> 	Yaakoub - Male Merchant
				Umri - male
				Nusaybah- female
				Zenobia - female
				Rabia - female
				Suleiman - male
				Jad - male
				Elias - male
				
*/
class CharacterRoster extends MonoBehaviour {
	// Properties
	var characterName: CharacterName;
	
	function Initialize() {
		var unit: ConflictUnit = GetComponent(ConflictUnit) as ConflictUnit;
	
		// initialize characters
		switch (characterName) {
		case CharacterName.Yaakoub:
			unit.characterName = "Yaakoub, the Glittery";
			unit.attack = 0;
			unit.influence = 1;
			unit.maximumHealth = 7;
			unit.abilities = [unit.abilities[0],unit.abilities[1],unit.abilities[2],UnitAbilityInfluenceBonusInSiteTypes(unit.influence,1,["castle","village"])];
			unit.numberOfAbilities = 4;
			unit.unitIcon = Resources.Load("merchanticon",Texture);
			break;
			
		case CharacterName.Umri:
			unit.characterName = "Umri the Well-Spoken";
			unit.attack = 1;
			unit.influence = 1;
			unit.maximumHealth = 8;
			unit.abilities = [unit.abilities[0],unit.abilities[1],unit.abilities[2],UnitAbilityInfluenceBonusInSiteTypes(unit.influence,1,["castle"])];
			unit.numberOfAbilities = 4;
			unit.unitIcon = Resources.Load("knighticon",Texture);
			break;
			
		case CharacterName.Daborah:
			unit.characterName = "Daborah, Prophet";
			unit.attack = 0;
			unit.influence = 1;
			unit.maximumHealth = 8;
			unit.abilities = [unit.abilities[0],unit.abilities[1],unit.abilities[2],UnitAbilityInfluenceBonusInSiteTypes(unit.influence,1,["temple"])];
			unit.numberOfAbilities = 4;
			unit.unitIcon = Resources.Load("priesticon",Texture);
			break; 
			
		case CharacterName.Arwa:
			unit.characterName = "Arwa of the North";
			unit.attack = 0;
			unit.influence = 1;
			unit.maximumHealth = 7;
			unit.abilities = [unit.abilities[0],unit.abilities[1],unit.abilities[2],UnitAbilityInfluenceBonusInSiteTypes(unit.influence,2,["castle"])];
			unit.numberOfAbilities = 4;
			unit.unitIcon = Resources.Load("nobleicon",Texture);
			break;
			
		case CharacterName.Jad:
			unit.characterName = "Jad, Champion of the Poor";
			unit.attack = 1;
			unit.influence = 1;
			unit.maximumHealth = 8;
			unit.abilities = [unit.abilities[0],unit.abilities[1],unit.abilities[2],UnitAbilityInfluenceBonusInSiteTypes(unit.influence,1,["village"])];
			unit.numberOfAbilities = 4;
			unit.unitIcon = Resources.Load("knighticon",Texture);
			break;
		
		case CharacterName.Mavia:
			unit.characterName = "Mavia, Conqueror";
			unit.attack = 1;
			unit.influence = 0;
			unit.maximumHealth = 7;
			unit.abilities = [unit.abilities[0],unit.abilities[1],unit.abilities[2],UnitAbilityAttackWithBonus(unit.attack,1,["village","castle"])];
			unit.numberOfAbilities = 4;
			unit.unitIcon = Resources.Load("warrioricon",Texture);
			break;
			
		case CharacterName.Suleiman:
			unit.characterName = "Suleiman the Bloodhungry";
			unit.attack = 1;
			unit.influence = 0;
			unit.maximumHealth = 5;
			unit.abilities = [unit.abilities[0],unit.abilities[1],unit.abilities[2],UnitAbilityAttackWithBonus(unit.attack,2,["village"])];
			unit.numberOfAbilities = 4;
			unit.unitIcon = Resources.Load("warrioricon",Texture);
			break;
			
		case CharacterName.Elias:
			unit.characterName = "Elias, Bringer of Light";
			unit.attack = 0;
			unit.influence = 1;
			unit.maximumHealth = 9;
			unit.abilities = [unit.abilities[0],unit.abilities[1],unit.abilities[2],UnitAbilityAttackWithBonus(unit.attack,2,["castle"])];
			unit.numberOfAbilities = 4;
			unit.unitIcon = Resources.Load("knighticon",Texture);
			break;
			
		case CharacterName.Rabia:
			unit.characterName = "Rabia, Healer";
			unit.attack = 0;
			unit.influence = 1;
			unit.maximumHealth = 8;
			unit.abilities = [unit.abilities[0],unit.abilities[1],unit.abilities[2],UnitAbilityHeal(3)];
			unit.numberOfAbilities = 4;
			unit.unitIcon = Resources.Load("priesticon",Texture);
			break;
			
		case CharacterName.Faris:
			unit.characterName = "Faris the Quarryman";
			unit.attack = 0;
			unit.influence = 1;
			unit.maximumHealth = 8;
			unit.abilities = [unit.abilities[0],unit.abilities[1],unit.abilities[2],UnitAbilityInfluenceAndHealInSite(unit.influence,1,1,["village"])];;
			unit.numberOfAbilities = 4;
			unit.unitIcon = Resources.Load("merchanticon",Texture);
			break;
			
		case CharacterName.Nusaybah:
			unit.characterName = "Nusaybah the Wallbuilder";
			unit.attack = 0;
			unit.influence = 1;
			unit.maximumHealth = 7;
			unit.abilities = [unit.abilities[0],unit.abilities[1],unit.abilities[2],UnitAbilityInfluenceAndHealInSite(unit.influence,1,1,["village"])];;
			unit.numberOfAbilities = 4;
			unit.unitIcon = Resources.Load("merchanticon",Texture);
			break;
			
		case CharacterName.Zenobia:
			unit.characterName = "Zenobia, High Priestess";
			unit.attack = 0;
			unit.influence = 1;
			unit.maximumHealth = 6;
			unit.abilities = [unit.abilities[0],unit.abilities[1],unit.abilities[2],UnitAbilityInfluenceAndHealInSite(unit.influence,1,1,["temple"])];;
			unit.numberOfAbilities = 4;
			unit.unitIcon = Resources.Load("priesticon",Texture);
			break;
			
		case CharacterName.Galut:
			unit.characterName = "Galut, Militia Trainer";
			unit.attack = 1;
			unit.influence = 0;
			unit.maximumHealth = 8;
			unit.abilities = [unit.abilities[0],unit.abilities[1],unit.abilities[2],UnitAbilityInfluenceAndAttackBonusInSite(unit.influence,1,1,2,["village"])];;
			unit.numberOfAbilities = 4;
			unit.unitIcon = Resources.Load("knighticon",Texture);
			break;
		
		case CharacterName.Kawlah:
			unit.characterName = "Kawlah the Hasty";
			unit.attack = 1;
			unit.influence = 1;
			unit.maximumHealth = 8;
			unit.abilities = [UnitAbilityMove(2),unit.abilities[1],unit.abilities[2]];
			unit.unitIcon = Resources.Load("knighticon",Texture);
			
		default:	break;
		}
	}
}