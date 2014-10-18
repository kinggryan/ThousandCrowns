#pragma strict

/****

	This class shows a simple message for a player to make an alliance with another player. 
	
	****/
	
class ConflictAllianceDialogue extends Photon.MonoBehaviour {
	// Properties
	var offset: Vector2 = Vector2.zero;
	var sendingPlayer: PhotonPlayer;
	var offerTimeRemaining:float = 30.0;
	var message: String = "Message";
	
	// Methods
	function Start() {
		// Get player color
		var playerManager = GameObject.FindObjectOfType(ConflictPlayerManager) as ConflictPlayerManager;
		var sendingPlayerIndex = playerManager.playerList.IndexOf(sendingPlayer);
		var sendingPlayerColor = playerManager.playerColorStringList[sendingPlayerIndex];
		
		// set message
		message = "Player " + sendingPlayerColor + " wants to ally you. Accept?";
		offerTimeRemaining = 30.0;
	}
	
	function OnGUI() {
		// Display message and buttons
		var titleRect: Rect = Rect(Screen.width - 125 + offset.x, 25 + offset.y,100,20);
		GUI.Label(titleRect,message);
		
		// display timer
		var timerRect: Rect = Rect(Screen.width - 125 + offset.x, 95 + offset.y,125,20);
		var timeRemaining: int = Mathf.Floor(offerTimeRemaining);
		GUI.Label(timerRect,"Time Remaining: " + timeRemaining.ToString());
		
		// Display buttons
		var yesButtonPosition: Rect = Rect(Screen.width - 120 + offset.x,45 + offset.y, 50, 50);
		var noButtonPosition: Rect = Rect(Screen.width - 60 + offset.x,45 + offset.y, 50, 50);
		if(GUI.Button(yesButtonPosition,"Accept")) {
			Accept();
		}
		if(GUI.Button(noButtonPosition,"Decline")) {
			Decline();
		}
	}
	
	function Update() {
		// Update timer
		offerTimeRemaining -= Time.deltaTime;
		
		// if timer expired, send a rejection message
		if(offerTimeRemaining <= 0) {
			Decline();
		}
	}
	
	function Accept() {
		// notify diplomacy manager of accept
		var diplomacyManager = GameObject.FindObjectOfType(ConflictDiplomacyManager) as ConflictDiplomacyManager;
		diplomacyManager.SendAllianceAcceptedMessage(sendingPlayer);
		
		// destroy self
		gameObject.Destroy(this);
	}
	
	function Decline() {
		// tell other player alliance was declined
		var diplomacyManager = GameObject.FindObjectOfType(ConflictDiplomacyManager) as ConflictDiplomacyManager;
		diplomacyManager.SendAllianceDeclinedMessage(sendingPlayer);
	
		gameObject.Destroy(this);
	}
}