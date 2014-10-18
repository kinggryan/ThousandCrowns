﻿#pragma strict

/****
	
	Conflict Board Space class
	
	A selectable component that functions as the location for units. 
	
	****/
	
import System.Collections.Generic;
	
class ConflictBoardSpace extends ConflictSelectablePiece {
	// Begin Properties
	
	var connectedBoardSpaces: List.<ConflictBoardSpace> = List.<ConflictBoardSpace>();		// list of connected spaces
	var units: List.<ConflictUnit> = List.<ConflictUnit>();						// units on this space
	var site: ConflictSite = null;
	static var allocatedBoardSpacePhotonViewID = 50;
	
	// Methods
	function Start() {
		DrawLinesToConnectedSpaces();
//		photonView.viewID = allocatedBoardSpacePhotonViewID++;
		//Layout units
		LayoutUnits();
		site = gameObject.AddComponent(ConflictSite);
	}
	
	function DrawLinesToConnectedSpaces() {
		// find or add line renderer
		var lineRenderer: LineRenderer = GetComponent(LineRenderer) as LineRenderer;
		if(lineRenderer == null) {
			lineRenderer = gameObject.AddComponent(LineRenderer) as LineRenderer;
			lineRenderer.material = Resources.Load("LineMaterial") as Material;
			lineRenderer.SetColors(Color.yellow,Color.yellow);
			lineRenderer.SetWidth(0.7,0.7);
			lineRenderer.SetVertexCount(2 * connectedBoardSpaces.Count);
			
			// set each line
			var currentVertex = 0;
			for(var connectedSpace in connectedBoardSpaces) {
				lineRenderer.SetPosition(currentVertex++,transform.position);
				lineRenderer.SetPosition(currentVertex++,connectedSpace.transform.position);
			}
		}	
	}
	
	function LayoutUnits() {
		// Lay units out in a circle around this space
		var unitLayoutDistance = 3;
		var layoutDirection = Vector3.forward * unitLayoutDistance;
		var layoutRotation = Quaternion.AngleAxis(360.0 / units.Count,Vector3.up);
		
		// layout all units
		for(var unit in units) {
			// place unit
			unit.transform.position = transform.position+layoutDirection;
			
			// rotate direction of placement
			layoutDirection = layoutRotation*layoutDirection;
		}
	}
}
	