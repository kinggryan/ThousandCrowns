#pragma strict

/***
	
	Conflict Turn Controller
	
		***/
		
class ConflictTurnController extends Photon.MonoBehaviour {
	// Properties
	var numberOfDonePlayers: int = 0;
	var actionQueue: ConflictActionQueue = null;
	var turnDone: boolean = false;
	var turnTimeRemaining: float = 0.0;
	
	// Methods
	function Start() {
		// Find Other controllers
		actionQueue = GetComponent(ConflictActionQueue) as ConflictActionQueue;
		turnTimeRemaining = 60 * 2;		// two minutes
	}
	
	function OnGUI() {	
		// Display "Done" Button
		var buttonPosition = Rect(Screen.width - 100,15,50,50);
		if(!turnDone) {
			if(GUI.Button(buttonPosition,"Done")) { //RETURNS TRUE when user clicks on the "Done" button
				turnDone = true;
				photonView.RPC("PlayerTurnDone",PhotonTargets.All);
			}
			// display turn timer
			var timerPosition = Rect(Screen.width - 185,15,75,50);
			GUI.Label(timerPosition,"Time:" +(turnTimeRemaining/60).ToString("F2"));
		}
	}
	
	function EndTurn() {
		// End Turn
		// Activate all actions
		actionQueue.ActivateAllAbilitiesInQueue();
		actionQueue.SetQueuedDiplomacyStates();
		
		// resolve all influence and attacks on sites
		for(var currentSite in GameObject.FindObjectsOfType(ConflictSite)) {
			currentSite.EndTurn();
		}
		
		// Resolve unit battles
		for(var currentUnit in GameObject.FindObjectsOfType(ConflictUnit)) {
			currentUnit.BattleEnemies();
		}
		for(var currentUnit in GameObject.FindObjectsOfType(ConflictUnit)) {
			currentUnit.ResolveBattles();
		}
		
		
		// Start New Turn
		for(var currentUnit in GameObject.FindObjectsOfType(ConflictUnit)) {
			currentUnit.StartTurn();
		}
		
		turnDone = false;
		numberOfDonePlayers = 0;
		
		// TODO add end game method call here
		if(ConflictSite.uncapturedSitesRemaining == 0){  
		EndGame();
		}
	}
	
	function EndGame(){
		var scores = [0, 0, 0, 0, 0]; // initializes all players' scores to 0
		var i = 0;
		var j = 0;
		var max = 0;
		var maxIndex = 0;
		var playerIndex = 0; // used to keep track of which player we are dealing with
		var playerManager = GameObject.FindObjectOfType(ConflictPlayerManager) as ConflictPlayerManager; 

		//traverses all sites in the game and calculate the scores of players
		for(var site in GameObject.FindObjectsOfType(ConflictSite) as ConflictSite[]){ 
			playerIndex = playerManager.playerList.IndexOf(site.controllingPlayer);
			if(site.typeName == "castle")
			{
				scores[playerIndex] += 2;
			}
			else
			{
			scores[playerIndex]++;
			}
		}
		
		//This for loop displays the players in order of their scores
		for(i = 0; i < 5; i++){
			max = scores[0];
			maxIndex = 0;
			for(j = 1; j < 5; j++){
				if(scores[j] > max){
					max = scores[j];
					maxIndex = j;
				}
			}
			ConflictLog.LogMessage("No. " + (i + 1) + " " + playerManager.playerColorStringList[maxIndex] + " " + max);
			scores[maxIndex] = -100;		
		}
		
		gameObject.AddComponent(ReturnToGameLobby); //shows the "return to game lobby" button
	}

	
	function Update() {
		turnTimeRemaining -= Time.deltaTime;
		if (turnTimeRemaining <= 0 && !turnDone) {
			TurnTimerExpired();
		}
	}
	
	function TurnTimerExpired() {
		turnDone = true;
		photonView.RPC("PlayerTurnDone",PhotonTargets.All);
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