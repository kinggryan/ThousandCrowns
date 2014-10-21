#pragma strict

/***
	
	Conflict Player Manager class
	
	*****/
	
class ConflictPlayerManager extends Photon.MonoBehaviour {
	// Properties
	var playerList: List.<PhotonPlayer> = List.<PhotonPlayer>();
	var playerColorList: Color[] = [Color(1,0,1),Color.red,Color.green,Color.white,Color.yellow];
	var playerColorStringList: String[] = ["Purple","Red","Green","White","Yellow"];
	
	// Methods
	function Start() {
		// If we're on the master client, assign player numbers and tell others to set unit ownership
		if(PhotonNetwork.isMasterClient) {
			AssignPlayerNumbers();
			photonView.RPC("SetPlayerNumbersFromMasterClient",PhotonTargets.Others,playerList[0],playerList[1]);
			
			// assign player units
			photonView.RPC("SetUnitControllers",PhotonTargets.All);
			
			// Now that player numbers are set, let's find the diplomacy manager and set relationships
			var diplomacyManager = GameObject.FindObjectOfType(ConflictDiplomacyManager) as ConflictDiplomacyManager;
			diplomacyManager.InitializePlayerRelationships();
		}
	}	
	
	function AssignPlayerNumbers() {
		// go through each player in the room and assign a number by adding them to the player list
		for(var currentPlayer in PhotonNetwork.playerList) {
			playerList.Add(currentPlayer);
		}
	}
	
	// MARK: RPCs
	@RPC
	function SetPlayerNumbersFromMasterClient(playerOne: PhotonPlayer, playerTwo: PhotonPlayer) {	// TODO this method needs to take up to the maximum # of players as a parameter - 5 by the first playtest
		playerList.Add(playerOne);
		playerList.Add(playerTwo);
		
		// Now that player numbers are set, let's find the diplomacy manager and set relationships
		var diplomacyManager = GameObject.FindObjectOfType(ConflictDiplomacyManager) as ConflictDiplomacyManager;
		diplomacyManager.InitializePlayerRelationships();
	}
	
	@RPC
	function SetUnitControllers() {
		// Go through all units
		for(var unit in GameObject.FindObjectsOfType(ConflictUnit)) {
			var conflictUnit = unit as ConflictUnit;
			// set player based on player number
			if(unit.controllingPlayerNumber >= 0 && unit.controllingPlayerNumber < playerList.Count) {
				unit.controllingPlayer = playerList[unit.controllingPlayerNumber];
				
				// set unit color
				unit.defaultColor = playerColorList[unit.controllingPlayerNumber];
				unit.renderer.material.color = unit.defaultColor;
			}
			
			// set units to unused
			unit.used = false;
		}
	}
}