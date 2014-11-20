#pragma strict

class ConflictCameraController extends MonoBehaviour {
	// Properties
	var maximumDistanceFromCenterWhileZoomed: float = 25.0;
	var centerPoint = Vector3.zero;
	var zoomed = false;
	var normalDistance: float = 60;
	var zoomedDistanceRatio: float = 0.5;
	
	// Methods
	function Start() {
		normalDistance = transform.position.y;
		centerPoint = transform.position;
	}
	
	function Zoom() {
		Debug.Log("Zooming");
		if(zoomed) {
			zoomed = false;
			transform.position.y = normalDistance;
		}
		else if (!zoomed) {
			zoomed = true;
			transform.position.y *= zoomedDistanceRatio;
		}
	}
	
	function Update() {
		if(Input.GetMouseButtonDown(1)) {
			Zoom();
		}
	}
}