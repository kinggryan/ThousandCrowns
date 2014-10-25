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
	private var attack: int = 1;
	private var influence: int = 1;
	private var health:		int  = 6;
	private var maximumHealth: int = 6;
	
	// game properties
	var used: boolean = true;
	var boardSpace: ConflictBoardSpace = null;
	var previousBoardSpace: ConflictBoardSpace = null;	// when units try to move off of enemy spaces, they MUST move to their previous space
	var queuedDamage: int = 0;
	
	// Abilities
	var abilityButtonPrefab: GameObject;
	var abilityButtonObjects: GameObject[] = null;
	var enemyAbilityPrefab: GameObject;
	private var abilities: UnitAbility[] = [UnitAbilityMove(),UnitAbilityAttack(attack),UnitAbilityInfluence(influence)];
	var numberOfAbilities: int = 3;
	var knownAbilityDescriptions: String[];
	
	// Methods
	function Start() {
		abilityButtonPrefab = Resources.Load("ConflictUnitAbilityButtonObject") as GameObject;
		enemyAbilityPrefab = Resources.Load("ConflictUnitEnemyAbilityObject") as GameObject;
		
		// initialize ability description array
		knownAbilityDescriptions = new String[numberOfAbilities];
		
		// Initialize ability data
		var currentAbilityIndex = 0;
		for(var currentAbility in abilities) {
			currentAbility.unit = this;
			currentAbility.abilityIndex = currentAbilityIndex;
			
			// add an unknown ability to ability descriptions
			knownAbilityDescriptions[currentAbilityIndex] = "???";
			
			// increment ability index
			currentAbilityIndex++;
		}
		
		
		// initialize previous spcae to this space
		previousBoardSpace = boardSpace;
	}
	
	// MARK: override methods
	function Select() {
		// if controlled by local player, display abils 
		if(controllingPlayer == PhotonNetwork.player && !used) {
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
				offset.z += 1.5;
			}
		}
		else if(controllingPlayer != PhotonNetwork.player) {
			// show known abilities of opponents' units
			abilityButtonObjects = new GameObject[numberOfAbilities];
			var currentKnownAbilityIndex = 0;
			var currentOffset = Vector3(0,0,0);
		
			for(var currentAbility in knownAbilityDescriptions) {
				abilityButtonObjects[currentKnownAbilityIndex] = GameObject.Instantiate(enemyAbilityPrefab,transform.position+Vector3(8,3,0)+currentOffset,Quaternion.identity);
				var textMesh = abilityButtonObjects[currentKnownAbilityIndex].GetComponentInChildren(TextMesh) as TextMesh;
				textMesh.text = currentAbility;
				
				currentKnownAbilityIndex++;
				currentOffset.z += 1.5;
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
		
		// if this unit is used already or is not ours, we know we can give up selection
		if(used || controllingPlayer != PhotonNetwork.player) {
			Deselect();
			return true;
		}			
		
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
	
	// MARK: Methods
	function UseAbilityGivenIndex(index: int, targetViewID: int) {
		if (index < 0 || index > numberOfAbilities) {
			Debug.LogError("Illegal ability index: " +index);
			return;
		}
		// use ability
		Debug.Log("Using abil: " +abilities[index].helpText);
		Debug.Log(abilities[index]);
		abilities[index].Activate(targetViewID);
		
		// add it to known abilities
		knownAbilityDescriptions[index] = abilities[index].helpText;
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
		health -= damage;
		
		if (health <= 0) {
			// TODO this needs to deal with death
			ConflictLog.LogMessage("DEAD!");
		}
	}
	
	function QueueDamage(damage: int) {
		queuedDamage += damage;
	}
	
	function BattleEnemies() {
		// iterate through units on this space
		for(var currentUnit in boardSpace.units) {
			//if they're an enemy
			var diplomacyManager = GameObject.FindObjectOfType(ConflictDiplomacyManager) as ConflictDiplomacyManager;
			if(diplomacyManager.GetRelationship(currentUnit.controllingPlayer, controllingPlayer) == PlayerRelationship.enemy) {
				// queue your damage on them
				currentUnit.QueueDamage(attack);
			}
		}
	}
	
	function ResolveBattles() {
		// deal all queued damage to yourself
		ReceiveDamage(queuedDamage);
	}
	
	function StartTurn() {
		used = false;
	}
}