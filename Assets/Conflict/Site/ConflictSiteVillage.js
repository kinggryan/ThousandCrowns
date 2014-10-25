﻿#pragma strict

class ConflictSiteVillage extends ConflictSite {
	function ConflictSiteVillage() {
		// call super constructor
		super();
		
		// set stats and typename
		typeName = "village";
		attack = 1;
		maximumDefense = 3;
		maximumAllegiance = 3;
		
		defense = maximumDefense;
		allegiance = maximumAllegiance;
	}
}