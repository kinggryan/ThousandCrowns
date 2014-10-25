#pragma strict

class ConflictSiteCastle extends ConflictSite {
	function ConflictSiteCastle() {
		// call super constructor
		super();
		
		// set stats and typename
		typeName = "castle";
		attack = 2;
		maximumDefense = 5;
		maximumAllegiance = 7;
		
		defense = maximumDefense;
		allegiance = maximumAllegiance;
	}
}