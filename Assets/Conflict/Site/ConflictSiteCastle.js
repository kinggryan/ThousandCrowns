#pragma strict

class ConflictSiteCastle extends ConflictSite {
	function Start() {
		// set stats and typename
		typeName = "castle";
		attack = 2;
		maximumDefense = 5;
		maximumAllegiance = 7;
		
		defense = maximumDefense;
		allegiance = maximumAllegiance;
		
		super.Start();
	}
}