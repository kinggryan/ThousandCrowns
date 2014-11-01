#pragma strict

class ConflictCharacterFrame extends MonoBehaviour {
	// Properties
	var nameMesh :TextMesh = null;
	var attackMesh: TextMesh = null;
	var influenceMesh: TextMesh = null;
	var healthMesh: TextMesh = null;
	
	// Methods
	function SetNameAndStats(name: String, attack: int, influence: int, health: int) {
		nameMesh.text = name;
		attackMesh.text = attack.ToString();
		influenceMesh.text = influence.ToString();
		healthMesh.text = health.ToString();
	}
	
	function DeselectUnit() {
		nameMesh.text = "";
		attackMesh.text = "";
		influenceMesh.text = "";
		healthMesh.text = "";
	}
}