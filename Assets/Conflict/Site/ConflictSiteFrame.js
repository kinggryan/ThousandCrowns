#pragma strict

class ConflictSiteFrame extends MonoBehaviour {
	// Properties
	var defenseText: TextMesh = null;
	var attackText: TextMesh = null;
	var allegianceText: TextMesh = null;
	
	// Methods
	function SetDefense(defense: int) {
		defenseText.text = defense.ToString();
	}
	
	function SetAllegiance(allegiance: int) {
		allegianceText.text = allegiance.ToString();
	}
	
	function SetAttack(attack: int) {
		attackText.text = attack.ToString();
	}
	
	function SetTexture(icon: Texture) {
		renderer.material.mainTexture = icon;
	}
}