#pragma strict

/******

	Unit Ability Button
	
	******/
	
class ConflictUnitAbilityButton extends ConflictSelectablePiece {
	// Properties
	var unit: ConflictUnit = null;
	
	var ability: UnitAbility = null;
	
	// Methods
	function OnGUI() {
		// Draw ability text on self
		var screenPosition = Camera.main.WorldToScreenPoint(transform.position + Vector3(-6,0,1));
		var textPosition = Rect(screenPosition.x,Screen.height - screenPosition.y,100,30);	
		GUI.contentColor = Color.black;
		GUI.Label(textPosition,ability.helpText);
	}
	
	// MARK: Override methods
	function Deselect() {
		unit.Deselect();
		super.Deselect();	
	}
	
	function Select() {
		// on select, we want to see if the ability targets. If it doesn't, then check the validity of the ability now and potentially use it
		if(!ability.requiresTargets) {
			// if we can use the current ability
			if(ability.SetAndCheckTarget(null)) {
				// add it to queue
				ability.AddToAbilityQueue();
				Deselect();
				selectedObject = null;
			}
			// else, do nothing
		}
		else {
			// if the ability does require targets, go forward with normal selection routine
			super.Select();
		}
	}
	
	function PieceClicked(clickedPiece: ConflictSelectablePiece) : boolean {
		// if the ability requires targets and we clicked a valid target, add it to queue and deselect
		if(ability.requiresTargets) {
			// if ability can target this
			if(ability.SetAndCheckTarget(clickedPiece)) {
				// add to queue
				ability.AddToAbilityQueue();
				// deselect but don't transfer selection control
				Deselect();
				selectedObject = null;
				return false;
			}
			else {
				// if it is an invalid target, then transfer selection control
				Deselect();
				return true;
			}
		}
		else {
			// if the ability doesn't require targets, how did we get here? Return true by default
			Deselect();
			return true;
		}
	}
}