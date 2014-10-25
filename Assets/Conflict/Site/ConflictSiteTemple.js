#pragma strict

class ConflictSiteTemple extends ConflictSite {
	function ConflictSiteTemple() {
		// call super constructor
		super();
		
		// set stats and typename
		typeName = "temple";
		attack = 0;
		maximumDefense = 3;
		maximumAllegiance = 5;
		
		defense = maximumDefense;
		allegiance = maximumAllegiance;
	}
}