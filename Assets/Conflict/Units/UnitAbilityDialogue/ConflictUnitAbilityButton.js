#pragma strict

/******

	Unit Ability Button
	
	******/
	
class ConflictUnitAbilityButton extends ConflictSelectablePiece {
	// Properties
	var unit: ConflictUnit = null;
	var ability: UnitAbility = null;
	
	// Methods
	
	// MARK: Override methods
	function Start() {
		var text = GetComponentInChildren(TextMesh) as TextMesh;
		text.text = ability.helpText;
		
		// if the unit is used, make sure you're grayed out	
	//	if(unit.used) {
	//		renderer.material.color = Color.gray;
	//	}
	}
	
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