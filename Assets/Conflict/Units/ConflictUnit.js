#pragma strict

/*****

	Conflict Unit Class
	
	*****/
	
class ConflictUnit extends ConflictSelectablePiece {
	// Properties
	
	var controllingPlayer: PhotonPlayer = null;
	var controllingPlayerNumber: int = -1;			// TODO this property should ultimately be not needed - we're using it now so we can												
													//		can hardcode ownership for these early versions
	
	// Stats
	var attack: int = 0;
	var influence: int = 0;
	var health:		int  = 0;
	var maximumHealth: int = 0;
	
	// game properties
	var used: boolean = true;
	var boardSpace: ConflictBoardSpace = null;
	var previousBoardSpace: ConflictBoardSpace = null;	// when units try to move off of enemy spaces, they MUST move to their previous space
	
	// Abilities
	var abilityButtonPrefab: GameObject;
	var abilityButtonObjects: GameObject[] = null;
	var abilities: UnitAbility[] = [UnitAbilityMove(),UnitAbilityInfluence()];
	var numberOfAbilities: int = 2;
	
	// Methods
	function Start() {
		abilityButtonPrefab = Resources.Load("ConflictUnitAbilityButtonObject") as GameObject;
		
		// Initialize ability data
		var currentAbilityIndex = 0;
		for(var currentAbility in abilities) {
			currentAbility.unit = this;
			currentAbility.abilityIndex = currentAbilityIndex;
			
			// increment ability index
			currentAbilityIndex++;
		}
		
		// initialize previous spcae to this space
		previousBoardSpace = boardSpace;
	}
	
	// MARK: override methods
	function Select() {
		// if controlled by local player, display abils 
		if(controllingPlayer == PhotonNetwork.player) {
			// make buttons
			abilityButtonObjects = new GameObject[numberOfAbilities];
			var currentAbilityIndex = 0;
			var offset = Vector3(0,0,0);
		
			for(var currentAbility in abilities) {
				abilityButtonObjects[currentAbilityIndex] = GameObject.Instantiate(abilityButtonPrefab,transform.position+Vector3(8,3,0)+offset,Quaternion.identity);
				var abilityButtonData = abilityButtonObjects[currentAbilityIndex].GetComponent(ConflictUnitAbilityButton) as ConflictUnitAbilityButton;
				abilityButtonData.unit = this;
				abilityButtonData.ability = abilities[currentAbilityIndex];
				
				currentAbilityIndex++;
				offset.z += 1;
			}
		}
		
		super.Select();
	}
	
	function Deselect() {
		// remove buttons
		for(var button in abilityButtonObjects) {
			GameObject.Destroy(button,0);
		}
		
		super.Deselect();
	}
	
	function PieceClicked(clickedPiece: ConflictSelectablePiece) : boolean { 
		// When something else is clicked and this unit is selected, give them the selection unless the clicked object
		//		was an ability owned by this unit
		
		// If one of this unit's abilities was clicked, then allow it to be selected
		for(var currentAbility in abilityButtonObjects) {
			// get ConflictUnitAbilityButton from ability button object
			var abilityButtonData = currentAbility.GetComponent(ConflictUnitAbilityButton) as ConflictUnitAbilityButton;
			
			if(clickedPiece == abilityButtonData) {
				// else, we want to select the clicked piece, not deselect this piece, and return false
				clickedPiece.Select();
				selectedObject = clickedPiece;
		
				return false;
			}
		}
		
		// it wasn't one of our abilities, deselect and return true
		Deselect();
		return true;
	}
	
	function UseAbilityGivenIndex(index: int, targetViewID: int) {
		if (index < 0 || index > numberOfAbilities) {
			Debug.LogError("Illegal ability index: " +index);
			return;
		}
		// use ability
		Debug.Log("Using abil: " +abilities[index].helpText);
		Debug.Log(abilities[index]);
		abilities[index].Activate(targetViewID);
	}
	
	function MoveToSpace(targetSpace: ConflictBoardSpace) {
		// remove from current space
		boardSpace.units.Remove(this);
		boardSpace.LayoutUnits();
		previousBoardSpace = boardSpace;
		
		// go to new space
		boardSpace = targetSpace;
		targetSpace.units.Add(this);
		
		// layout units on new space
		boardSpace.LayoutUnits();
	}
	
	function ReceiveDamage(damage: int) {
		// TODO this needs to deal with death
		health -= damage;
	}
}