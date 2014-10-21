/*****
	
	Conflict Site Class
	
	*****/
	
class ConflictSite extends ConflictSelectablePiece {
	// Properties
	
	// Conflict Properties
	var allegiance: int = 0;		// allegiance of the site
	var attack: int		= 0; 		// attack value that the site uses to defend itself
	var defense: int    = 3;		// current defense of the site
	
	var maximumAllegiance: int = 3;	// the maximum allegiance of the site. This is the starting allegiance as well
	var maximumDefense:		int = 3;	// maximum site defense and starting defense

	var controllingPlayer: PhotonPlayer = null;		// controlling player of this site
	var playerManager: ConflictPlayerManager = null;
	
	static var uncapturedSitesRemaining: int = 0;		// tracks how many uncaptured sites remain, for determining game end.

	var statFrameImage: Texture;
	
	// Influence and Attack queues
	var playerTurnInfluence: int[] = new int[5];
	var playerTurnAttack: int[] = new int[5];

	// Methods
	
	function ConflictSite() {
		// increment number of uncaptured sites, as all sites start neutral
		uncapturedSitesRemaining++;
		statFrameImage = Resources.Load("Siteframe");
		
		// set influence and attack arrays to 0
		for(var i = 0 ; i < 5 ; i++) {
			playerTurnInfluence[i] = 0;
			playerTurnAttack[i] = 0;
		}
	}
	
	function Start() {
		playerManager = GameObject.FindObjectOfType(ConflictPlayerManager);
	}
	
	function OnGUI() {
		// Display stats
		// Get screen coordinates
		var screenCoordinates = Camera.main.WorldToScreenPoint(transform.position);
		var statFrame = Rect(screenCoordinates.x-30,Screen.height-screenCoordinates.y + 15,125,25);
		
		// draw stats
		GUI.Label(statFrame,statFrameImage);
		GUI.Label(statFrame,"    "+attack+"     "+allegiance + "    "+defense);
	}
	
	// Conflict Methods
	function InfluencedByPlayer(influenceAmount: int, influencingPlayer: PhotonPlayer) {
		// Find this player's player number
		var playerNumber = playerManager.playerList.IndexOf(influencingPlayer);
		
		// set their influence for this turn
		playerTurnInfluence[playerNumber] += influenceAmount;
	}
	
	function AttackedByPlayer(attackDamage: int , attackingPlayer: PhotonPlayer) {
		Debug.Log("attacked by player");
	
		// Find this player's player number
		var playerNumber = playerManager.playerList.IndexOf(attackingPlayer);
		
		// set their attack for this turn
		playerTurnAttack[playerNumber] += attackDamage;
	}
	
	function ResolveTurnInfluence() {
		// Sets new controller based on influence and attack for the turn
		// Find index of controlling player
		var controllingPlayerIndex = -1;
		var defensiveInfluenceValue = 0;
		if(controllingPlayer != null) {
			controllingPlayerIndex = playerManager.playerList.IndexOf(controllingPlayer);
			
			// find the defensive influence value as a POSITIVE integer
			defensiveInfluenceValue = playerTurnInfluence[controllingPlayerIndex];
		}
		
		// iterate through all turn influence values and determine highest player(s)
		var highestInfluencePlayerIndexList = new List.<int>();
		var highestInfluenceValue = 0;
		for(var currentPlayerIndex = 0 ; currentPlayerIndex < 5 ; currentPlayerIndex++) {
			// don't count controlling player
			if(currentPlayerIndex != controllingPlayerIndex) {
				var currentInfluenceValue = playerTurnInfluence[currentPlayerIndex];
				if(currentInfluenceValue > highestInfluenceValue ) {
					highestInfluencePlayerIndexList.Clear();
					highestInfluencePlayerIndexList.Add(currentPlayerIndex);
					highestInfluenceValue = currentInfluenceValue;
				}
				else if (currentInfluenceValue == highestInfluenceValue && highestInfluenceValue != 0) {
					highestInfluencePlayerIndexList.Add(currentPlayerIndex);
				}
			}
		}
				
		// if highest influence value is greater than the current allegiance, give it to a player chosen at random from highest influence player list
		if (highestInfluenceValue - defensiveInfluenceValue > 0 && highestInfluenceValue - defensiveInfluenceValue > allegiance) {
			Debug.Log("setting allegiance to " + (highestInfluenceValue-allegiance));
			// TODO choose player at random on master client and give site to them. For now, just choose the first
			allegiance = highestInfluenceValue - (allegiance + defensiveInfluenceValue);
			var newControllingPlayerIndex = highestInfluencePlayerIndexList[0];
			controllingPlayer = playerManager.playerList[newControllingPlayerIndex];
			defaultColor = playerManager.playerColorList[newControllingPlayerIndex];
			renderer.material.color = defaultColor;
		}
		else if (highestInfluenceValue - defensiveInfluenceValue > 0 && highestInfluenceValue - defensiveInfluenceValue < allegiance) {
			// the controlling player maintains control but loses some allegiance
			allegiance -= highestInfluenceValue - defensiveInfluenceValue;
		}
		else if (highestInfluenceValue - defensiveInfluenceValue > 0 && highestInfluenceValue - defensiveInfluenceValue == allegiance) {
			// the site becomes neutral
			allegiance = 0;
			controllingPlayer = null;
			defaultColor = Color.gray;
			renderer.material.color = defaultColor;
		}
		else {	// highestInfluenceValue is either 0 or less than or equal to defensive influence value
			// add defensive influence to allegiance, since defender won OR no one did anything
			allegiance += defensiveInfluenceValue - highestInfluenceValue;
		}
		
		// Cap allegiance
		allegiance = Mathf.Min(allegiance,maximumAllegiance);
		
		// reset turn influence
		for(var i = 0 ; i < 5 ; i++) {
			playerTurnInfluence[i] = 0;
		}
	}
	
	function ResolveTurnAttacks() {
		// iterate through damage and set maximum damage
		var maximumDamageDealt: int = 0;
		var maxDamagePlayerIndexList = new List.<int>();
		
		for(var i = 0 ; i < 5 ; i++) {
			if(playerTurnAttack[i] > maximumDamageDealt) {
				maxDamagePlayerIndexList.Clear();
				maxDamagePlayerIndexList.Add(i);
				maximumDamageDealt = playerTurnAttack[i];
			}
			else if (playerTurnAttack[i] == maximumDamageDealt && playerTurnAttack[i] > 0 ) {
				maxDamagePlayerIndexList.Add(i);
			}
		}
		
		// reset turn influence
		for(var index = 0 ; index < 5 ; index++) {
			playerTurnAttack[index] = 0;
		}
		
		if(maximumDamageDealt == 0) {
			// if no on attacked this, heal it and return
			defense = Mathf.Min(maximumDefense,defense + 1);
			Debug.Log("heal");
			return;
		}
		
		// deal damage
		defense = Mathf.Max(0,defense - maximumDamageDealt);
		
		// if defense has been rendered to 0, give control of this site to a random max damage dealing player
		if (defense == 0) {
			Debug.Log("attack");
			// TODO choose player at random on master client and give site to them. For now, just choose the first
			var newControllingPlayerIndex = maxDamagePlayerIndexList[0];
			controllingPlayer = playerManager.playerList[newControllingPlayerIndex];
			defaultColor = playerManager.playerColorList[newControllingPlayerIndex];
			renderer.material.color = defaultColor;
		}
	}
	
	function EndTurn() {
		// at the end of the turn, resolve influence and attacks. Remember, attacks resolve second - defenseless sites yield to
		//		conquerers, not merchants
		var startingController = controllingPlayer;
		
		ResolveTurnInfluence();
		ResolveTurnAttacks();
		
		// if this site was captured this turn from neutral, mark it as uncaptured
		if (startingController == null && controllingPlayer != null) {
			uncapturedSitesRemaining--;
		}
		else if(startingController != null && controllingPlayer == null) {
			// if this site was controlled by someone but now isn't, increase number of uncaptured sites
			uncapturedSitesRemaining++;
		}
	}	
}