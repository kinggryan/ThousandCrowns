#pragma strict

/*****

	Conflict Log
	
	Displays messages of what's happened in the conflict.
	The only message used by other classes should be "LogMessage", which is a static method - the method finds the actual
	instance of this class and adds the message
	
	*****/
	
class ConflictLog extends MonoBehaviour {
	// Properties
	var messages: String[] = null;
	var maximumMessageNumber: int = 20;
	var displayFrame = Rect(25,75,250,500);
	
	// Methods
	function Start() {
		messages = new String[maximumMessageNumber];
		for(var message in messages) {
			message = "";
		}
	
		// Log start game message
		LogMessage("Game Started");
		LogMessage("GOGOOG");
	}
	
	function LogMessageOnInstance(message: String) {
		// move all messages
		for(var index = maximumMessageNumber - 1 ; index >= 1 ; index--) {
			messages[index] = messages[index-1];
		}
		
		// add new message
		messages[0] = message;
	}
	
	function OnGUI() {
		// draw all messages
		var messageFrame = Rect(25,125,250,25);
		GUI.contentColor = Color.black;
		for(var message in messages) {
			GUI.Label(messageFrame,message);
			// move message frame
			messageFrame.y += 15;
		}
	}
	
	// MARK: static methods
	static function LogMessage(message: String) {
		// find instance
		var logInstance = GameObject.FindObjectOfType(ConflictLog) as ConflictLog;
		logInstance.LogMessageOnInstance(message);
	}
}