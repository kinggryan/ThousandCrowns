#pragma strict


class ChatDialogue extends Photon.MonoBehaviour {

	var mainFrame: Rect = Rect(20,450,235,200);
	var textFrame: Rect = Rect(20,100,235,25);
	var buttonFrame: Rect = Rect(257,100,45,25);
	
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
		var messageFrame = mainFrame;
		
		stringToEdit = GUI.TextField (textFrame, stringToEdit, 25);

		GUI.contentColor = Color.black;
		
		for(var message in messages) {
			GUI.Label(messageFrame,message);
			// move message frame
			messageFrame.y += 15;
		}
		
		if (GUI.Button (buttonFrame, "Send"))
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