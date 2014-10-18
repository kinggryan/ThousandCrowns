#pragma strict

import System.Text;
import System.IO;
import System.Runtime.Serialization.Formatters.Binary;
 
import System;
import System.Runtime.Serialization;
import System.Reflection;

/****

	QueueAbility class
	
	****/

class QueueAbilityInfo {
	var unit: ConflictUnit;
	var abilityIndex: int;
	//var parameters: Object[];
	var targetViewID: int;
}

class QueueDiplomacyInfo {
	var playerOne: PhotonPlayer;
	var playerTwo: PhotonPlayer;
	var newRelationship: int;
}

/*****

	Action Queue class
	
	*****/
	
class ConflictActionQueue extends Photon.MonoBehaviour {
	// Properties
	var abilityQueue: List.<QueueAbilityInfo> = new List.<QueueAbilityInfo>();
	var diplomacyQueue: List.<QueueDiplomacyInfo> = new List.<QueueDiplomacyInfo>();
	
	// Methods
	
	// MARK : Ability methods
	function QueueAbilityLocally(qInfo: QueueAbilityInfo) {
		abilityQueue.Add(qInfo);
	}
	
	function QueueAbilityLocallyAndRemotely(qInfo: QueueAbilityInfo) {
		// Queue local
		QueueAbilityLocally(qInfo);
		
		// queue remotely
		var unitViewID = qInfo.unit.photonView.viewID;
		photonView.RPC("QueueAbilityRemotely",PhotonTargets.Others,unitViewID,qInfo.abilityIndex,qInfo.targetViewID);
	}
	
	function ActivateAllAbilitiesInQueue() {
		for(var currentInfo in abilityQueue) {
			// go through queue and use all abilities
			currentInfo.unit.UseAbilityGivenIndex(currentInfo.abilityIndex,currentInfo.targetViewID);
			Debug.Log("use abil with index :" +currentInfo.abilityIndex);
		}
		
		// purge queue
		abilityQueue.Clear();
	}
	
	// MARK: Diplomacy methods
	
	function QueueDiplomacyLocally(qInfo: QueueDiplomacyInfo) {
		diplomacyQueue.Add(qInfo);
	}
	
	function QueueDiplomacyLocallyAndRemotely(qInfo: QueueDiplomacyInfo) {
		// Queue local
		QueueDiplomacyLocally(qInfo);
		
		// queue remotely
		photonView.RPC("QueueDiplomacyRemotely",PhotonTargets.Others,qInfo.playerOne,qInfo.playerTwo,qInfo.newRelationship);
	}
	
	function SetQueuedDiplomacyStates() {
		// get diplomacy controller
		var diplomacyManager = GameObject.FindObjectOfType(ConflictDiplomacyManager) as ConflictDiplomacyManager;
	
		for(var currentInfo in diplomacyQueue) {
			// go through queue and set all relationships
			diplomacyManager.SetRelationship(currentInfo.playerOne,currentInfo.playerTwo,currentInfo.newRelationship);
		}
		
		// purge queue
		diplomacyQueue.Clear();
		diplomacyManager.ResetTransitionStates();
	}
	
	// MARK: RPCs
	
	@RPC
	function QueueAbilityRemotely(unitViewID: int, abilityIndex: int, targetViewID: int) {
		var qInfo = QueueAbilityInfo();
		var targetUnit = PhotonView.Find(unitViewID).GetComponent(ConflictUnit) as ConflictUnit;
		qInfo.unit = targetUnit;
		qInfo.abilityIndex = abilityIndex;
		qInfo.targetViewID = targetViewID;
		
		abilityQueue.Add(qInfo);
	}
	
	@RPC
	function QueueDiplomacyRemotely(playerOne: PhotonPlayer,playerTwo: PhotonPlayer, newRelationship: int) {
		var qInfo = QueueDiplomacyInfo();
		qInfo.playerOne = playerOne;
		qInfo.playerTwo = playerTwo;
		qInfo.newRelationship = newRelationship;
		
		diplomacyQueue.Add(qInfo);
	}
}