#pragma strict

class PlayerRelationship {
	static var neutral = 0;
	static var ally		=	1;
	static var enemy	=	-1;
}

class PlayerRelationshipTransitionState {
	static var none = 0;
	static var awaitingAllianceRequestResponse = 1;
	static var allianceRequestAccepted = 2;
	static var allianceRequestDeclined = 3;
	static var enemyDeclared = 4;
}

class ConflictDiplomacyManager extends Photon.MonoBehaviour {
	// Properties
	var playerRelationshipTable: int[,] = null;
	var playerManager: ConflictPlayerManager = null;
	
	var relationshipTransitionStates: int[] = null;
	
	// Methods
	function InitializePlayerRelationships() {
		// generate size using player list
		playerManager = GameObject.FindObjectOfType(ConflictPlayerManager) as ConflictPlayerManager;
		
		playerRelationshipTable = new int[playerManager.playerList.Count,playerManager.playerList.Count];
		// store outgoing messages
		relationshipTransitionStates = new int[playerManager.playerList.Count];
		
		// set all relationships to neutral
		for(var p1 = 0 ; p1 < playerManager.playerList.Count ; p1++) {
			for(var p2 = 0 ; p2 < playerManager.playerList.Count ; p2++) {
				playerRelationshipTable[p1,p2] = PlayerRelationship.neutral;
			}
			relationshipTransitionStates[p1] = PlayerRelationshipTransitionState.none;
		}
	}
	
	function GetRelationship(playerOne: PhotonPlayer, playerTwo: PhotonPlayer) : int {
		// find the player indices on the player table
		var p1Index: int = playerManager.playerList.IndexOf(playerOne);
		var p2Index: int = playerManager.playerList.IndexOf(playerTwo);
		
		// return a player relationship
		return playerRelationshipTable[p1Index,p2Index];
	}
	
	function OnGUI() {
		// Display all players, as well as ally or war buttons for each
		var displayLocation: Rect = Rect(15,25,250,20);
		var allyButtonLocation: Rect = Rect(115,25,115,20);
		var enemyButtonLocation: Rect = Rect(240,25,115,20);
		
		// save player index
		var playerIndex = 0;
		
		for(var playerColor in playerManager.playerColorStringList) {
			// don't draw it not enough players
			if (playerIndex >= playerManager.playerList.Count) {
				break;
			}
		
			if(playerManager.playerList[playerIndex] != PhotonNetwork.player) {
				var relationship = GetRelationship(PhotonNetwork.player,playerManager.playerList[playerIndex]);
				var transitionState = relationshipTransitionStates[playerIndex];
				if(transitionState == PlayerRelationshipTransitionState.awaitingAllianceRequestResponse) {
					// if we have an outgoing message to this player
					GUI.Label(displayLocation, "Waiting for response: "+playerColor);
				}
				else if(transitionState == PlayerRelationshipTransitionState.allianceRequestAccepted) {
					// if we have an outgoing message to this player
					GUI.Label(displayLocation, "Alliance Accepted: "+playerColor);
				} 
				else if(transitionState == PlayerRelationshipTransitionState.allianceRequestDeclined) {
					// if we have an outgoing message to this player
					GUI.Label(displayLocation, "Alliance Declined: "+playerColor);
				} 
				else if(transitionState == PlayerRelationshipTransitionState.enemyDeclared) {
					// if we have an outgoing message to this player
					GUI.Label(displayLocation, "Enemy declared: "+playerColor);
				} 
				else if(relationship == PlayerRelationship.neutral) {
					GUI.Label(displayLocation, "Player "+playerColor);
			
					// show alliance button
					if(GUI.Button(allyButtonLocation,"Request Alliance")) {
						// send ally request
						var allyRequestTarget = playerManager.playerList[playerIndex];
						photonView.RPC("RequestAlliance",allyRequestTarget);
						
						// set to waiting for this player
						relationshipTransitionStates[playerIndex] = PlayerRelationshipTransitionState.awaitingAllianceRequestResponse;
					}
					// show enemy button
					if(GUI.Button(enemyButtonLocation,"Declare Enemy")) {
						// send ally request
						DeclareEnemy(playerManager.playerList[playerIndex]);
						
						// set to waiting for this player
						relationshipTransitionStates[playerIndex] = PlayerRelationshipTransitionState.enemyDeclared;
					}
				}
				else if (relationship == PlayerRelationship.ally) {
					GUI.Label(displayLocation, "ALLY: "+playerColor);
					// show enemy button
					if(GUI.Button(allyButtonLocation,"Declare Enemy")) {
						// send ally request
						DeclareEnemy(playerManager.playerList[playerIndex]);
						
						// set to waiting for this player
						relationshipTransitionStates[playerIndex] = PlayerRelationshipTransitionState.enemyDeclared;
					}
				}
				else if (relationship == PlayerRelationship.enemy) {
					GUI.Label(displayLocation, "ENEMY: "+playerColor);
					// show alliance button
					if(GUI.Button(allyButtonLocation,"Request Alliance")) {
						// send ally request
						var target = playerManager.playerList[playerIndex];
						photonView.RPC("RequestAlliance",target);
						
						// set to waiting for this player
						relationshipTransitionStates[playerIndex] = PlayerRelationshipTransitionState.awaitingAllianceRequestResponse;
					}
				}
				
				displayLocation.y += 20;
				allyButtonLocation.y += 20;
				enemyButtonLocation.y += 20;
			}
			
			// increase player index
			playerIndex++;
		}
	}
	
	function SendAllianceDeclinedMessage(player: PhotonPlayer) {
		photonView.RPC("AllianceDeclined",player);
		// set alliance declined to state for this player
		var playerIndex = playerManager.playerList.IndexOf(player);
		relationshipTransitionStates[playerIndex] = PlayerRelationshipTransitionState.allianceRequestDeclined;
	}
	
	function SendAllianceAcceptedMessage(toPlayer: PhotonPlayer) {
		// get player
		photonView.RPC("AllianceAccepted",toPlayer);
		// set alliance accepted to state for this player
		var playerIndex = playerManager.playerList.IndexOf(toPlayer);
		relationshipTransitionStates[playerIndex] = PlayerRelationshipTransitionState.allianceRequestAccepted;
	}
	
	function ResetTransitionStates() {
		// set states to none
		for(state in relationshipTransitionStates) {
			state = PlayerRelationshipTransitionState.none;
		}
	}
	
	function DeclareEnemy(enemyPlayer: PhotonPlayer) {
		// Put a message in the log notifying this player about the declined alliance
		var playerIndex = playerManager.playerList.IndexOf(enemyPlayer);
		var playerColor = playerManager.playerColorStringList[playerIndex];
		ConflictLog.LogMessage("Declared Enemy: "+playerColor);
		
		// set transition state to alliance accepted
		relationshipTransitionStates[playerIndex] = PlayerRelationshipTransitionState.enemyDeclared;
		
		// send a message to queue this alliance up
		photonView.RPC("QueueRelationship",PhotonTargets.All,PhotonNetwork.player,enemyPlayer,PlayerRelationship.enemy);
	}
	
	function SetRelationship(playerOne: PhotonPlayer, playerTwo: PhotonPlayer, relationship: int) {
		// find the player indices on the player table
		var p1Index: int = playerManager.playerList.IndexOf(playerOne);
		var p2Index: int = playerManager.playerList.IndexOf(playerTwo);
		
		var previousRelationship = playerRelationshipTable[p1Index,p2Index];
		
		// set relationship
		playerRelationshipTable[p1Index,p2Index] = relationship;
		playerRelationshipTable[p2Index,p1Index] = relationship;
		
		// check for broken alliance
		if(previousRelationship == PlayerRelationship.ally && relationship == PlayerRelationship.enemy) {
			// by convention, we ALWAYS want the betraying player to be player one! this should be the case in ALL calls
			//		that relate to betrayal
			BreakAllianceBetweenPlayers(playerOne,playerTwo);
		}
	}
	
	function BreakAllianceBetweenPlayers(betrayingPlayer: PhotonPlayer, victimPlayer: PhotonPlayer) {
		//		an alliance is broken
		var betrayingPlayerIndex = playerManager.playerList.IndexOf(betrayingPlayer);
		var victimPlayerIndex = playerManager.playerList.IndexOf(victimPlayer);
		ConflictLog.LogMessage("Player "+playerManager.playerColorStringList[betrayingPlayerIndex] + " betrayed player " + playerManager.playerColorStringList[victimPlayerIndex]+"!"); 
	
		// get last two captured sites of betraying player and set allegiance and defense to 1
		var betrayerList = playerManager.playerSitesCapturedQueue[betrayingPlayerIndex];
		if (betrayerList.Count > 1) {
			var betrayingSite = betrayerList[betrayerList.Count - 1];
			betrayingSite.allegiance = 1;
			betrayingSite.defense = 1;
			betrayingSite = betrayerList[betrayerList.Count - 2];
			betrayingSite.allegiance = 1;
			betrayingSite.defense = 1;
		}
		else if (betrayerList.Count > 0) {
			var betrayingSite2 = betrayerList[betrayerList.Count - 1];
			betrayingSite2.allegiance = 1;
			betrayingSite2.defense = 1;
		}
	}
	
	// MARK: RPCs
	
	@RPC
	function RequestAlliance(info: PhotonMessageInfo) {
		// see if we have an outgoing message to that player
		var playerIndex = playerManager.playerList.IndexOf(info.sender);
		if(relationshipTransitionStates[playerIndex] == PlayerRelationshipTransitionState.awaitingAllianceRequestResponse) {
			// if we have sent an ally request to them, immediately tell them that we have accepted their alliance.
			SendAllianceAcceptedMessage(info.sender);
			return;
		}
		else if (relationshipTransitionStates[playerIndex] == PlayerRelationshipTransitionState.enemyDeclared) {
			// if we have declared them an enemy, return a rejection notice
			photonView.RPC("AllianceDeclined",info.sender);
			return;
		}
	
		// Get sender and create an alliance request
		var allianceRequest = gameObject.AddComponent(ConflictAllianceDialogue) as ConflictAllianceDialogue;
		allianceRequest.sendingPlayer = info.sender;
	}
	
	@RPC
	function AllianceDeclined(info: PhotonMessageInfo) {
		// Put a message in the log notifying this player about the declined alliance
		var playerIndex = playerManager.playerList.IndexOf(info.sender);
		var playerColor = playerManager.playerColorStringList[playerIndex];
		ConflictLog.LogMessage("Alliance declined from : "+playerColor);
		
		// set transition state to alliance declined
		relationshipTransitionStates[playerIndex] = PlayerRelationshipTransitionState.allianceRequestDeclined;
	}
	
	@RPC
	function AllianceAccepted(info: PhotonMessageInfo) {
		// Put a message in the log notifying this player about the declined alliance
		var playerIndex = playerManager.playerList.IndexOf(info.sender);
		var playerColor = playerManager.playerColorStringList[playerIndex];
		ConflictLog.LogMessage("Alliance accepted by : "+playerColor);
		
		// set transition state to alliance accepted
		relationshipTransitionStates[playerIndex] = PlayerRelationshipTransitionState.allianceRequestAccepted;
		
		// send a message to queue this alliance up
		photonView.RPC("QueueRelationship",PhotonTargets.All,PhotonNetwork.player,info.sender,PlayerRelationship.ally);
	}
	
	@RPC
	function QueueRelationship(playerOne: PhotonPlayer, playerTwo: PhotonPlayer, newRelationship: int) {
		// get action queue
		var queue = GameObject.FindObjectOfType(ConflictActionQueue) as ConflictActionQueue;
		
		// new info
		var qInfo = QueueDiplomacyInfo();
		qInfo.playerOne = playerOne;
		qInfo.playerTwo = playerTwo;
		qInfo.newRelationship = newRelationship;
		
		// queue it up
		queue.QueueDiplomacyLocallyAndRemotely(qInfo);
	}
}