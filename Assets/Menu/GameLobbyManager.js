#pragma strict

/*****

	Game Lobby class
	
	Duties include:
	-Joining random lobby or starting one if needed on start
	-On a button press, send an rpc to others in this lobby to go to the game room.
	
	*****/
	
class GameLobbyManager extends Photon.MonoBehaviour {
	// Properties
	
	// Methods
	    // Use this for initialization
    function Start()
    {
        PhotonNetwork.ConnectUsingSettings("0.1");
        
    }

    function OnJoinedLobby()
    {
        Debug.Log("JoinRandom");
        PhotonNetwork.JoinRandomRoom();
    }

    function OnPhotonRandomJoinFailed()
    {
        PhotonNetwork.CreateRoom(null);
    }

    function OnJoinedRoom()
    {
        Debug.Log("Room Joined");
        photonView.viewID = 5;
    }

    function OnGUI()
    {
        GUILayout.Label(PhotonNetwork.connectionStateDetailed.ToString() + ". Player count: "+PhotonNetwork.countOfPlayers+" in room " +PhotonNetwork.room);
    
    	if(GUI.Button(Rect(15,15,100,100),"Start Game"))
    		photonView.RPC("StartGame",PhotonTargets.All);
    }
    
    @RPC
    function StartGame() {
    	// Load Game level, 1
    	PhotonNetwork.LoadLevel(1);	
    }
}