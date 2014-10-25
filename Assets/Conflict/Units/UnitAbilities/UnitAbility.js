	#pragma strict

/*****

	Unit Ability class
	
	*****/
	
class UnitAbility {
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