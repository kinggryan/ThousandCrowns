#pragma strict

/***
	
	Conflict Player Manager class
	
	*****/
	
class ConflictPlayerManager extends Photon.MonoBehaviour {
	// Properties
	var playerList: List.<PhotonPlayer> = List.<PhotonPlayer>();
	var playerColorList: Color[] = [Color(1,0,1),Color.red,Color.green,Color.white,Color.yellow];
	var playerColorStringList: String[] = ["Purple","Red","Green","White","Yellow"];
	var synchronizedRNGList: List.<int> = List.<int>();			// this list of random ints is sent by the master client to all other clients
																//		and updated as needed. It is used whenever a random number must be generated on
																//		all clients for the same purpose to ensure everyone uses the same number.
	
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
			
			// Add some large number of RNs to clients
			for(var i = 0 ; i < 30 ; i++) {
				var newRandomNumber = Random.Range(0,int.MaxValue);
				synchronizedRNGList.Add(newRandomNumber);
				photonView.RPC("EnqueueRandomNumber",PhotonTargets.Others,newRandomNumber);
			}
		}
		
		
	}	
	
	function AssignPlayerNumbers() {
		// go through each player in the room and assign a number by adding them to the player list
		for(var currentPlayer in PhotonNetwork.playerList) {
			playerList.Add(currentPlayer);
		}
	}
	
	function DequeueRandomNumber() : int {
		var returnValue = synchronizedRNGList[0];
		synchronizedRNGList.RemoveAt(0);
		
		if(PhotonNetwork.isMasterClient) {
			// generate a new random number and send to everyone
			var newRandomNumber : int = Random.Range(0,int.MaxValue);
			synchronizedRNGList.Add(newRandomNumber);
			photonView.RPC("EnqueueRandomNumber",PhotonTargets.Others,newRandomNumber);
		}
		
		return returnValue;
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
			//	unit.defaultColor = playerColorList[unit.controllingPlayerNumber];
			//	unit.renderer.material.color = unit.defaultColor;
				var unitBorders = unit.gameObject.GetComponentsInChildren(ConflictUnitBorder);
				for (var border in unitBorders)
					border.renderer.material.color = playerColorList[unit.controllingPlayerNumber];
			}
			
			// set units to unused
			unit.used = false;
		}
	}
	
	@RPC
	function EnqueueRandomNumber(number: int) {
		synchronizedRNGList.Add(number);
	}
}