	#pragma strict

/*****

	Unit Ability class
	
	*****/
	
class UnitAbility extends System.Object {
	// Properties
	var requiresTargets: boolean = false;	// true if the ability targets. False if otherwise
	var helpText: String = "Use Ability";
	
	// MARK: conflict properties
	var unit: ConflictUnit = null;
	var abilityIndex: int = 0;
	
	// Methods
	function Activate(targetViewID: int) { Debug.Log("There was a problem"); }
	function AddToAbilityQueue() {
		var qInfo = QueueAbilityInfo();
		qInfo.unit = unit;
		qInfo.abilityIndex = abilityIndex;
		qInfo.targetViewID = -1;
		
		// enqueue it up!
		var actionQueue = GameObject.FindObjectOfType(ConflictActionQueue) as ConflictActionQueue;
		actionQueue.QueueAbilityLocally(qInfo);
		
		// tell unit that it's been used
		unit.used = true;
	}
	
	function SetAndCheckTarget(target: ConflictSelectablePiece) {
		// This method is called by the ability button to determine whether a given target is valid. 
		return true;
	}
}

/*****

	MovementAbilityClass
	
	*****/
	
class UnitAbilityMove extends UnitAbility {
	// Properties
	var moveValue: int = 1;		// TODO for now, movement only moves one space
	var targetSpace: ConflictBoardSpace = null;

	// Methods
	function UnitAbilityMove() {
		// Default constructor move 1
		requiresTargets = true;
		helpText = "Move 1";
	}
	
	// MARK: override methods
	function Activate(targetViewID: int) {
		// PARAM 0: viewID of the target space
		var targetSpaceObject = PhotonView.Find(targetViewID);
		var targetSpace = targetSpaceObject.GetComponent(ConflictBoardSpace) as ConflictBoardSpace;
		
		//move to that space
		unit.MoveToSpace(targetSpace);
	}
	
	function SetAndCheckTarget(target: ConflictSelectablePiece) {
		// given a target space, is it within range of the current space?
		for(var adjacentSpace in unit.boardSpace.connectedBoardSpaces) {
			if(target == adjacentSpace) {
				// if we're on an enemy space, we can only move to our previous space
				if(unit.boardSpace.site != null && unit.boardSpace.site.controllingPlayer != null) {
					var diplomacyManager = GameObject.FindObjectOfType(ConflictDiplomacyManager) as ConflictDiplomacyManager;
					var playerManager = GameObject.FindObjectOfType(ConflictPlayerManager) as ConflictPlayerManager;
					if(diplomacyManager.GetRelationship(PhotonNetwork.player,unit.boardSpace.site.controllingPlayer) == PlayerRelationship.enemy && target != unit.previousBoardSpace) {
						ConflictLog.LogMessage("Can only retreat from enemy space");
						return false;
					}
				}
				
				// this is a valid target
				targetSpace = target as ConflictBoardSpace;
				return true;
			}
		}
		
		// if it isn't return false
		return false;
	}
	
	function AddToAbilityQueue() {
		var qInfo = QueueAbilityInfo();
		qInfo.unit = unit;
		qInfo.abilityIndex = abilityIndex;
		qInfo.targetViewID = targetSpace.photonView.viewID;
		
		// enqueue it up!
		var actionQueue = GameObject.FindObjectOfType(ConflictActionQueue) as ConflictActionQueue;
		actionQueue.QueueAbilityLocallyAndRemotely(qInfo);
		
		// tell unit that it's been used
		unit.used = true;
	}
}

/*****

	Influence Ability Class
	
	*****/
	
class UnitAbilityInfluence extends UnitAbility {
	// Properties
	var influenceValue: int = 1;	

	// Methods
	// MARK: Constructors
	// Default gives influence 1
	function UnitAbilityInfluence() {
		requiresTargets = false;
		helpText = "Influence " + influenceValue;
	}
	
	function UnitAbilityInfluence(initialInfluence: int) {
		influenceValue = initialInfluence;
		requiresTargets = false;
		helpText = "Influence " + influenceValue;
	}
	
	// MARK: override methods
	function Activate(targetViewID: int) {
		// get this unit's spaces
		var targetSpace = unit.boardSpace;
		
		if(targetSpace.site != null) {
			var bonusInfluence: int = 0;
			// check adjacent sites for a temple you control
			for(var connectedBoardSpace in targetSpace.connectedBoardSpaces) {
				if(connectedBoardSpace.site != null && connectedBoardSpace.site.typeName == "temple" && connectedBoardSpace.site.controllingPlayer == unit.controllingPlayer) {
					// add bonus influence
					bonusInfluence = 1;
					ConflictLog.LogMessage("bonus");
				}
			}
			
			// influence this space
			targetSpace.site.InfluencedByPlayer(influenceValue + bonusInfluence,unit.controllingPlayer);
		}
	}
	
	function SetAndCheckTarget(target: ConflictSelectablePiece) {
		// if this unit's site is controlled by an ally, return false and put a message in the log stating why
		var diplomacyManager = GameObject.FindObjectOfType(ConflictDiplomacyManager) as ConflictDiplomacyManager;
		var playerManager = GameObject.FindObjectOfType(ConflictPlayerManager) as ConflictPlayerManager;
		if(unit.boardSpace.site.controllingPlayer != null && 
		unit.boardSpace.site.controllingPlayer != PhotonNetwork.player &&
		diplomacyManager.GetRelationship(PhotonNetwork.player,unit.boardSpace.site.controllingPlayer) != PlayerRelationship.enemy &&
		diplomacyManager.relationshipTransitionStates[playerManager.playerList.IndexOf(unit.boardSpace.site.controllingPlayer)] != PlayerRelationshipTransitionState.enemyDeclared) {
			ConflictLog.LogMessage("Declare this player an enemy first!");
			return false;
		}
		return true;
	}
	
	function AddToAbilityQueue() {
		var qInfo = QueueAbilityInfo();
		qInfo.unit = unit;
		qInfo.abilityIndex = abilityIndex;
		qInfo.targetViewID = -1;
		
		// enqueue it up!
		var actionQueue = GameObject.FindObjectOfType(ConflictActionQueue) as ConflictActionQueue;
		actionQueue.QueueAbilityLocallyAndRemotely(qInfo);
		
		// tell unit that it's been used
		unit.used = true;
	}
}

/*****

	Attack Ability Class
	
	*****/
	
class UnitAbilityAttack extends UnitAbility {
	// Properties
	var attackValue: int = 1;	

	// Methods
	// MARK: Constructors
	function UnitAbilityAttack() {
		requiresTargets = false;
		helpText = "Attack " + attackValue;
	}
	
	function UnitAbilityAttack(a: int) {
		attackValue = a;
		requiresTargets = false;
		helpText = "Attack " + attackValue;
	}
	
	// MARK: override methods
	function Activate(targetViewID: int) {
		Debug.Log("Attack");
		
		// get this unit's spaces
		var targetSpace = unit.boardSpace;
		
		if(targetSpace.site != null) {
			// attack this space
			targetSpace.site.AttackedByPlayer(attackValue,unit.controllingPlayer);
		
			// site deals damage to this unit
			unit.ReceiveDamage(targetSpace.site.attack);
		}
	}
	
	function SetAndCheckTarget(target: ConflictSelectablePiece) {
		// if this unit's site is controlled by an ally, return false and put a message in the log stating why
		var diplomacyManager = GameObject.FindObjectOfType(ConflictDiplomacyManager) as ConflictDiplomacyManager;
		var playerManager = GameObject.FindObjectOfType(ConflictPlayerManager) as ConflictPlayerManager;
		if(unit.boardSpace.site.controllingPlayer != null && 
			unit.boardSpace.site.controllingPlayer != PhotonNetwork.player &&
			diplomacyManager.GetRelationship(PhotonNetwork.player,unit.boardSpace.site.controllingPlayer) != PlayerRelationship.enemy && 
			diplomacyManager.relationshipTransitionStates[playerManager.playerList.IndexOf(unit.boardSpace.site.controllingPlayer)] != PlayerRelationshipTransitionState.enemyDeclared) {
			ConflictLog.LogMessage("Declare this player an enemy first!");
			return false;
		}
		return true;
	}
	
	function AddToAbilityQueue() {
		var qInfo = QueueAbilityInfo();
		qInfo.unit = unit;
		qInfo.abilityIndex = abilityIndex;
		qInfo.targetViewID = -1;
		
		// enqueue it up!
		var actionQueue = GameObject.FindObjectOfType(ConflictActionQueue) as ConflictActionQueue;
		actionQueue.QueueAbilityLocallyAndRemotely(qInfo);
		
		// tell unit that it's been used
		unit.used = true;
	}
}

// MARK : Special Abilities
/*****

	Influence +x in (sitetypes) Ability Class
	
	*****/
	
class UnitAbilityInfluenceBonusInSiteTypes extends UnitAbility {
	// Properties
	var influenceValue: int = 1;
	var bonusValue: int = 1;
	var bonusTypes: String[] = [];	

	// Methods
	// MARK: Constructors
	// Default gives influence 1
	function UnitAbilityInfluenceBonusInSiteTypes() {
		requiresTargets = false;
		helpText = "Influence " + influenceValue + "(+" + bonusValue + ") in ";
		for (var type in bonusTypes) {
			helpText += type + " ";
		}
		helpText += ".";
	}
	
	function UnitAbilityInfluenceBonusInSiteTypes(initialInfluence: int,bv: int, types: String[]) {
		influenceValue = initialInfluence;
		bonusValue = bv;
		bonusTypes = types;
		requiresTargets = false;
		helpText = "Influence " + influenceValue + "(+" + bonusValue + " in ";
		var typeCount = 0;
		for (var type in bonusTypes) {
			helpText += type;
			if (++typeCount < bonusTypes.Length) {
				helpText += " or ";
			}
		}
		helpText += ")";
	}
	
	// MARK: override methods
	function Activate(targetViewID: int) {
		// get this unit's spaces
		var targetSpace = unit.boardSpace;
		
		if(targetSpace.site != null) {
			var bonusInfluence: int = 0;
			// check adjacent sites for a temple you control
			for(var connectedBoardSpace in targetSpace.connectedBoardSpaces) {
				if(connectedBoardSpace.site != null && connectedBoardSpace.site.typeName == "temple" && connectedBoardSpace.site.controllingPlayer == unit.controllingPlayer) {
					// add bonus influence
					bonusInfluence = 1;
				}
			}
			
			// if this site is one of hte given types
			for(var type in bonusTypes) {
				if (targetSpace.site != null && targetSpace.site.typeName == type) {
					bonusInfluence += bonusValue;
				}
			}
			
			// influence this space
			targetSpace.site.InfluencedByPlayer(influenceValue + bonusInfluence,unit.controllingPlayer);
		}
	}
	
	function SetAndCheckTarget(target: ConflictSelectablePiece) {
		// if this unit's site is controlled by an ally, return false and put a message in the log stating why
		var diplomacyManager = GameObject.FindObjectOfType(ConflictDiplomacyManager) as ConflictDiplomacyManager;
		var playerManager = GameObject.FindObjectOfType(ConflictPlayerManager) as ConflictPlayerManager;
		if(unit.boardSpace.site.controllingPlayer != null && 
		unit.boardSpace.site.controllingPlayer != PhotonNetwork.player &&
		diplomacyManager.GetRelationship(PhotonNetwork.player,unit.boardSpace.site.controllingPlayer) != PlayerRelationship.enemy &&
		diplomacyManager.relationshipTransitionStates[playerManager.playerList.IndexOf(unit.boardSpace.site.controllingPlayer)] != PlayerRelationshipTransitionState.enemyDeclared) {
			ConflictLog.LogMessage("Declare this player an enemy first!");
			return false;
		}
		return true;
	}
	
	function AddToAbilityQueue() {
		var qInfo = QueueAbilityInfo();
		qInfo.unit = unit;
		qInfo.abilityIndex = abilityIndex;
		qInfo.targetViewID = -1;
		
		// enqueue it up!
		var actionQueue = GameObject.FindObjectOfType(ConflictActionQueue) as ConflictActionQueue;
		actionQueue.QueueAbilityLocallyAndRemotely(qInfo);
		
		// tell unit that it's been used
		unit.used = true;
	}
}

/*****

	Attack with bonus Ability Class
	
	*****/
	
class UnitAbilityAttackWithBonus extends UnitAbility {
	// Properties
	var attackValue: int = 1;	
	var bonusValue: int =  1;
	var bonusTypes: String[] = [];

	// Methods
	// MARK: Constructors
	function UnitAbilityAttackWithBonus() {
		requiresTargets = false;
		helpText = "Attack " + attackValue;
	}
	
	function UnitAbilityAttackWithBonus(a: int, bv: int, types: String[]) {
		attackValue = a;
		bonusValue = bv;
		bonusTypes = types;
		requiresTargets = false;
		helpText = "Attack " + attackValue + "(+" + bonusValue + " in ";
		var typeCount = 0;
		for (var type in bonusTypes) {
			helpText += type;
			if (++typeCount < bonusTypes.Length) {
				helpText += " or ";
			}
		}
		helpText += ")";
	}
	
	// MARK: override methods
	function Activate(targetViewID: int) {
		// get this unit's spaces
		var targetSpace = unit.boardSpace;
		
		if(targetSpace.site != null) {
			var bonusDamage = 0;
			
			// if this site is one of the given types
			for(var type in bonusTypes) {
				if (targetSpace.site.typeName == type) {
					bonusDamage += bonusValue;
				}
			}
		
			// attack this space
			targetSpace.site.AttackedByPlayer(attackValue + bonusDamage, unit.controllingPlayer);
		
			// site deals damage to this unit
			unit.ReceiveDamage(targetSpace.site.attack);
		}
	}
	
	function SetAndCheckTarget(target: ConflictSelectablePiece) {
		// if this unit's site is controlled by an ally, return false and put a message in the log stating why
		var diplomacyManager = GameObject.FindObjectOfType(ConflictDiplomacyManager) as ConflictDiplomacyManager;
		var playerManager = GameObject.FindObjectOfType(ConflictPlayerManager) as ConflictPlayerManager;
		if(unit.boardSpace.site.controllingPlayer != null && 
			unit.boardSpace.site.controllingPlayer != PhotonNetwork.player &&
			diplomacyManager.GetRelationship(PhotonNetwork.player,unit.boardSpace.site.controllingPlayer) != PlayerRelationship.enemy && 
			diplomacyManager.relationshipTransitionStates[playerManager.playerList.IndexOf(unit.boardSpace.site.controllingPlayer)] != PlayerRelationshipTransitionState.enemyDeclared) {
			ConflictLog.LogMessage("Declare this player an enemy first!");
			return false;
		}
		return true;
	}
	
	function AddToAbilityQueue() {
		var qInfo = QueueAbilityInfo();
		qInfo.unit = unit;
		qInfo.abilityIndex = abilityIndex;
		qInfo.targetViewID = -1;
		
		// enqueue it up!
		var actionQueue = GameObject.FindObjectOfType(ConflictActionQueue) as ConflictActionQueue;
		actionQueue.QueueAbilityLocallyAndRemotely(qInfo);
		
		// tell unit that it's been used
		unit.used = true;
	}
}

/*****

	Heal Ability Class
	
	*****/
	
class UnitAbilityHeal extends UnitAbility {
	// Properties
	var healValue: int = 1;	

	// Methods
	// MARK: Constructors
	// Default gives influence 1
	function UnitAbilityHeal() {
		requiresTargets = true;
		helpText = "Heal a unit on this space for " + healValue;
	}
	
	function UnitAbilityHeal(hv: int) {
		healValue = hv;
		requiresTargets = true;
		helpText = "Heal a unit on this space for " + healValue;
	}
	
	// MARK: override methods
	function Activate(targetViewID: int) {
		// get this unit's spaces
		var targetObject = PhotonView.Find(targetViewID);
		var targetUnit: ConflictUnit;
		if (targetObject != null) {
			targetUnit = targetObject.GetComponent(ConflictUnit) as ConflictUnit;
		}
		else {
			Debug.LogError("null target value");
		}
		
		if(targetUnit != null) {
			// influence this space
			targetUnit.Heal(healValue);
		}
	}
	
	function SetAndCheckTarget(target: ConflictSelectablePiece) {
		// if this unit's site is controlled by an ally, return false and put a message in the log stating why
		var diplomacyManager = GameObject.FindObjectOfType(ConflictDiplomacyManager) as ConflictDiplomacyManager;
		var playerManager = GameObject.FindObjectOfType(ConflictPlayerManager) as ConflictPlayerManager;
		
		var targetUnit = target as ConflictUnit;
		
		if(targetUnit != null &&
		   targetUnit.boardSpace == unit.boardSpace) {
			return true;
		}
		return false;
	}
	
	function AddToAbilityQueue() {
		var qInfo = QueueAbilityInfo();
		qInfo.unit = unit;
		qInfo.abilityIndex = abilityIndex;
		qInfo.targetViewID = -1;
		
		// enqueue it up!
		var actionQueue = GameObject.FindObjectOfType(ConflictActionQueue) as ConflictActionQueue;
		actionQueue.QueueAbilityLocallyAndRemotely(qInfo);
		
		// tell unit that it's been used
		unit.used = true;
	}
}