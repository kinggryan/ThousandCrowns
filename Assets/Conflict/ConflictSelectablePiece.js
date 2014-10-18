#pragma strict

/*****
	
	Selectable Piece class
	
	used by any game piece that can be selected and can perform actions
	
	*****/
	
class ConflictSelectablePiece extends Photon.MonoBehaviour {
	// Begin Properties
	
	// Static Properties
	static var selectedObject: ConflictSelectablePiece = null;		//	the currently selected object. Note : objects check this property to verify that they are selected
	
	// Graphical Properties
	var defaultColor: Color = Color.white;
	var highlightColor: Color = Color.yellow;
	var selectedColor: Color = Color.blue;
	
	// End Properties
	
	// Begin Methods
	function Select() {
		selectedObject = this;
		
		renderer.material.color = selectedColor;
	}		// called when selected
	function Deselect() {
		renderer.material.color = defaultColor;
	}		// called when deselected
	
	function OnMouseEnter() {
		if(selectedObject != this)
			Highlight();
	}
	
	function OnMouseExit() {
		if(selectedObject != this)
			Unhighlight();
	}
	
	function Highlight() {
		renderer.material.color = highlightColor;
	}
	
	function Unhighlight() {
		renderer.material.color = defaultColor;
	}
	
	// This method is called on the currently selected object whenever a piece is clicked. This handles
	function PieceClicked(clickedPiece: ConflictSelectablePiece) : boolean { 
		Deselect();
		return true;
	}

	function OnMouseDown() {
		// if we get true, then select this object
		if(selectedObject == null || selectedObject.PieceClicked(this)) {
			Select();
		}
	}
}