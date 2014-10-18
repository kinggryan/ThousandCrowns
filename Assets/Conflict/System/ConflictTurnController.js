#pragma strict

/***
	
	Conflict Turn Controller
	
		***/
		
class ConflictTurnController extends Photon.MonoBehaviour {
	// Properties
	var numberOfDonePlayers: int = 0;
	var actionQueue: ConflictActionQueue = null;
	var turnDone: boolean = false;
	
	// Methods
	function Start() {
		// Find Other controllers
		actionQueue = GetComponent(ConflictActionQueue) as ConflictActionQueue;
	}
	
	function OnGUI() {	
		// Display "Done" Button
		var buttonPosition = Rect(750,15,50,50);
		if(!turnDone) {
			if(GUI.Button(buttonPosition,"Done")) {
				turnDone = true;
				photonView.RPC("PlayerTurnDone",PhotonTargets.All);
			}
		}
	}
	
	function EndTurn() {
		// Activate all actions
		actionQueue.ActivateAllAbilitiesInQueue();
		actionQueue.SetQueuedDiplomacyStates();
		
		// resolve all influence and attacks on sites
		for(var currentSite in GameObject.FindObjectsOfType(ConflictSite)) {
			currentSite.EndTurn();
		}
		
		// TODO refresh units
		turnDone = false;
		numberOfDonePlayers = 0;
	}
	
	// MARK: RPCs
	@RPC
	function PlayerTurnDone() {
		// increment number of players who are done
		numberOfDonePlayers++;
		
		// if all players are done, reset number of done players and end the turn
		if(numberOfDonePlayers >= PhotonNetwork.room.playerCount) {
			EndTurn();
		}
	}
}