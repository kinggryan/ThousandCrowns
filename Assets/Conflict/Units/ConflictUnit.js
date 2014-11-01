#pragma strict

/*****

	Conflict Unit Class
	
	*****/
	
class ConflictUnit extends ConflictSelectablePiece {
	// Properties
	
	var controllingPlayer: PhotonPlayer = null;
	var controllingPlayerNumber: int = -1;			// TODO this property should ultimately be not needed - we're using it now so we can												
													//		can hardcode ownership for these early versions
	// Character properties
	var characterName: String = "Name";
	
	// Stats
	public var attack: int = 1;
	public var influence: int = 1;
	private var health:		int  = 6;
	public var maximumHealth: int = 6;
	
	// game properties
	var used: boolean = true;
	var boardSpace: ConflictBoardSpace = null;
	var previousBoardSpace: ConflictBoardSpace = null;	// when units try to move off of enemy spaces, they MUST move to their previous space
	var queuedDamage: int = 0;
	
	// Abilities
	var abilityButtonPrefab: GameObject;
	var abilityButtonObjects: GameObject[] = null;
	var enemyAbilityPrefab: GameObject;
	public var abilities: UnitAbility[] = [UnitAbilityMove(),UnitAbilityAttack(attack),UnitAbilityInfluence(influence)];
	var testAbility: UnitAbility;
	var numberOfAbilities: int = 3;
	var knownAbilityDescriptions: String[];
	
	// Stat Display properties
	var attackStatMesh: TextMesh	=	null;
	var influenceStatMesh: TextMesh	=	null;
	var healthStatMesh: TextMesh	=	null;
	
	var unitIcon: Texture = null;
	
	// Methods
	function Start() {
		// if there's a characterRoster object, initialize it
		var characterRoster = GetComponent(CharacterRoster) as CharacterRoster;
		if (characterRoster != null) {
			characterRoster.Initialize();
			health = maximumHealth;
			renderer.material.mainTexture = unitIcon;
		}
	
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
		
		// set text mesh stuff
		attackStatMesh.text = attack.ToString();
		influenceStatMesh.text = influence.ToString();
		healthStatMesh.text = health.ToString();
	}
	
	// MARK: override methods
	function Select() {
		// find character frame
		var characterFrame = Camera.main.GetComponentInChildren(ConflictCharacterFrame) as ConflictCharacterFrame;
	
		// if controlled by local player, display abils 
		if(controllingPlayer == PhotonNetwork.player && !used) {
			// make buttonsset
			abilityButtonObjects = new GameObject[numberOfAbilities];
			var currentAbilityIndex = 0;
			var offset = Vector3(0,0,3.2);
		
			for(var currentAbility in abilities) {
				abilityButtonObjects[currentAbilityIndex] = GameObject.Instantiate(abilityButtonPrefab,characterFrame.transform.position+Vector3(1.75,1,0)+offset,Quaternion.identity);
				var abilityButtonData = abilityButtonObjects[currentAbilityIndex].GetComponent(ConflictUnitAbilityButton) as ConflictUnitAbilityButton;
				abilityButtonData.unit = this;
				abilityButtonData.ability = abilities[currentAbilityIndex];
				
				currentAbilityIndex++;
				offset.z -= 2;
			}
			
			// set name
			characterFrame.SetNameAndStats(characterName,attack,influence,health);
		}
		else if(controllingPlayer != PhotonNetwork.player) {
			// show known abilities of opponents' units
			abilityButtonObjects = new GameObject[numberOfAbilities];
			var currentKnownAbilityIndex = 0;
			var currentOffset = Vector3(0,0,3.2);
		
			for(var currentAbility in knownAbilityDescriptions) {
				abilityButtonObjects[currentKnownAbilityIndex] = GameObject.Instantiate(enemyAbilityPrefab,characterFrame.transform.position+Vector3(1.75,1,0)+currentOffset,Quaternion.identity);
				var textMesh = abilityButtonObjects[currentKnownAbilityIndex].GetComponentInChildren(TextMesh) as TextMesh;
				textMesh.text = currentAbility;
				
				currentKnownAbilityIndex++;
				currentOffset.z -= 2;
			}
			
			characterFrame.SetNameAndStats(characterName,attack,influence,health);
		}
		
		super.Select();
	}
	
	function Deselect() {
		// remove buttons
		for(var button in abilityButtonObjects) {
			GameObject.Destroy(button,0);
		}
		
		// set name to empty
		var characterFrame = Camera.main.GetComponentInChildren(ConflictCharacterFrame) as ConflictCharacterFrame;
		characterFrame.DeselectUnit();
		
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
		
		healthStatMesh.text = health.ToString();
		
		if (selectedObject == this) {
			var characterFrame = Camera.main.GetComponentInChildren(ConflictCharacterFrame) as ConflictCharacterFrame;
			characterFrame.SetNameAndStats(characterName,attack,influence,health);
		}
	}
	
	function Heal(healAmount: int) {
		health += healAmount;
		
		if (health > maximumHealth)
			health = maximumHealth;
			
		healthStatMesh.text = health.ToString();
		
		if (selectedObject == this) {
			var characterFrame = Camera.main.GetComponentInChildren(ConflictCharacterFrame) as ConflictCharacterFrame;
			characterFrame.SetNameAndStats(characterName,attack,influence,health);
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