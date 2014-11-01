#pragma strict

class ReturnToGameLobby extends MonoBehaviour{

function OnGUI()
    {    
    	if(GUI.Button(Rect(15,15,100,100),"Game Lobby"))
    		PhotonNetwork.LoadLevel(0);	

    }

}