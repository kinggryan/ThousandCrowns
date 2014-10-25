#pragma strict

class ConflictSiteTemple extends ConflictSite {
	function Start() {
		// set stats and typename
		typeName = "temple";
		attack = 0;
		maximumDefense = 3;
		maximumAllegiance = 5;
		
		defense = maximumDefense;
		allegiance = maximumAllegiance;
		
		super.Start();
	}
}