#pragma strict


class ChatDialogue extends Photon.MonoBehaviour {

	var left: float = 20;
	var top: float = 70;
	var width: float = 235;
	var height: float = 200;
	
	var textLeft: float = 20;
	var textTop: float = 100;
	var textWidth: float = 235;
	var textHeight: float = 25;
	
	var buttonLeft: float = 257;
	var buttonTop: float = 100;
	var buttonWidth: float = 45;
	var buttonHeight: float = 25;
	
	var messages: String[] = null;
	var maximumMessageNumber: int = 10;
	
	var stringToEdit: String = "";
	
	function Start() {
		messages = new String[maximumMessageNumber];
		for(var message in messages) {
			message = "";
		}
	}
	
	
	function OnGUI() {
		// draw all messages
		var messageFrame = Rect(left, top, width, height);
		
		
		stringToEdit = GUI.TextField (Rect (textLeft, textTop, textWidth, textHeight), stringToEdit, 25);

		GUI.contentColor = Color.black;
		
		for(var message in messages) {
			GUI.Label(messageFrame,message);
			// move message frame
			messageFrame.y += 15;
		}
		
		if (GUI.Button (Rect (buttonLeft, buttonTop, buttonWidth, buttonHeight), "Send"))
		{
				photonView.RPC("sendMessage",PhotonTargets.All, stringToEdit);
				stringToEdit = "";

		}
		}

	@RPC
	function sendMessage(newMessage: String) {
		
		for(var index = maximumMessageNumber - 1 ; index >= 1 ; index--) {
			messages[index] = messages[index-1];
		}
		
		// add new message
		messages[0] = newMessage;
	}

}