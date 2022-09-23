// Global variables
const raycaster = new THREE.Raycaster();
const P = new THREE.Vector2( );
const P1 = new THREE.Vector2( );
const P2 = new THREE.Vector2( );
let L1 = 1.5;
let L2 = 2;
let R1 = 0;
let R2 = 0;
let flipJoint = false;

// GUI controller
import { GUI } from '../libs/lil-gui.esm.min.js';

const gui = new GUI();

const armsController = {
    Arm_1_Length: L1,
    Arm_2_Length: L2,
    Reverse_Joint: flipJoint
};

const valuesChanger = function () {
    L1 = armsController.Arm_1_Length;
    L2 = armsController.Arm_2_Length;
    flipJoint = armsController.Reverse_Joint;
}

gui.add( armsController, 'Arm_1_Length', 0.2, 2.1, 0.01 ).onChange( valuesChanger );
gui.add( armsController, 'Arm_2_Length', 0.2, 2.1, 0.01 ).onChange( valuesChanger );
gui.add( armsController, 'Reverse_Joint' ).onChange( valuesChanger );

valuesChanger();

// Getting started
const scene = new THREE.Scene();
//const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const frustumSize = 9;
let aspect = window.innerWidth / window.innerHeight;
let camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

window.addEventListener( 'resize', onWindowResize );
function onWindowResize() {
    aspect = window.innerWidth / window.innerHeight;

    camera.left = - frustumSize * aspect / 2;
    camera.right = frustumSize * aspect / 2;
    camera.top = frustumSize / 2;
    camera.bottom = - frustumSize / 2;

    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

// mouse action
const pointerCoord = new THREE.Vector2();
document.addEventListener('pointermove', onMouseMove);
function onMouseMove(e) {
    if ( e.isPrimary === false ) return;
    // set mouse/pointer position
    pointerCoord.set( e.clientX, e.clientY );
    // <Raycaster>
    // - normalize
    const normalizedPointer = new THREE.Vector2( (pointerCoord.x / window.innerWidth)*2 - 1,
         -(pointerCoord.y / window.innerHeight)*2 + 1 );
    raycaster.setFromCamera( normalizedPointer, camera );
    // intersectObject( what we are hitting )
    // plane wall = scene.children[0]
    const hit = raycaster.intersectObject( scene.children[0], false );
    let rayhit = hit[0].point
    scene.children[1].position.set( rayhit.x, rayhit.y );
}

// initiate
function init() {
    // Mesh: the pointer / mouse / end_effector
    let geometry = new THREE.RingGeometry( 0.13, 0.2, 4 );
    let material = new THREE.MeshBasicMaterial( { color: 0xff1100 } );
    const end_effector = new THREE.Mesh( geometry, material );

    // Mesh: a wall that raycast will hit
    geometry = new THREE.PlaneGeometry( 20, 20 );
    material = new THREE.MeshBasicMaterial( { color: 0xcfcfcf } );
    const plane = ( new THREE.Mesh( geometry, material ) );

    // Mesh: a base of the robot
    geometry = new THREE.CylinderGeometry( .4, .4, 1 );
    material = new THREE.MeshBasicMaterial( { color: 0xff4aff } )
    const base = new THREE.Mesh( geometry, material );

    // Mesh: Arm 1
    // a line is created such that it looks like a hand of theta 0 in the unit circle
    let points = [];
    points.push( new THREE.Vector3( 0, 0, 0 ) );
    points.push( new THREE.Vector3( L1, 0, 0 ) );
    geometry = new THREE.BufferGeometry().setFromPoints( points );
    material = new THREE.LineBasicMaterial({ color: 0x00eeff });
    const arm_1 = new THREE.Line( geometry, material );

    // Mesh: Arm 2
    points = [];
    points.push( new THREE.Vector3( 0, 0, 0 ) );
    points.push( new THREE.Vector3( L2, 0, 0 ) );
    geometry = new THREE.BufferGeometry().setFromPoints( points );
    material = new THREE.LineBasicMaterial({ color: 0x00eeff });
    const arm_2 = new THREE.Line( geometry, material ); 
    
    // Mesh: Visual for "P" (Vector2)
    geometry = new THREE.RingGeometry( 0.2, 0.25, 16 );
    material = new THREE.MeshBasicMaterial( { color: 0xff4d00 } )
    const end_effector_visual = new THREE.Mesh( geometry, material );

    // Mesh: Visual for "P0" = Center
    geometry = new THREE.RingGeometry( 0.5, 1, 6 );
    material = new THREE.MeshBasicMaterial( { color: 0x0059cc } )
    const P0_visual = new THREE.Mesh( geometry, material );

    // Mesh: Visual for "P1"
    geometry = new THREE.RingGeometry( 0.5, 1, 6 );
    material = new THREE.MeshBasicMaterial( { color: 0x0059cc } )
    const P1_visual = new THREE.Mesh( geometry, material );
    
    // Mesh: Visual for "P2"
    geometry = new THREE.RingGeometry( 0.5, 1, 6 );
    material = new THREE.MeshBasicMaterial( { color: 0x0059cc } )
    const P2_visual = new THREE.Mesh( geometry, material );

    // Mesh: Inside Boundary - A circle size of radius 1.
    geometry = new THREE.CircleGeometry( 1, 16 );
    material = new THREE.MeshBasicMaterial( { color: 0x505050 } )
    const bound_inner_visual = new THREE.Mesh( geometry, material );

    // Mesh: Outside Boundary - A circle size of radius 1.
    geometry = new THREE.RingGeometry( 1, 40, 32 );
    material = new THREE.MeshBasicMaterial( { color: 0x404040 } )
    const bound_outer_visual = new THREE.Mesh( geometry, material );

    // Mesh: Critical Boundary - A circle size of radius 1.
    geometry = new THREE.CircleGeometry( 1, 16 );
    material = new THREE.MeshBasicMaterial( { color: 0x404040, transparent: true, opacity: 0.1 } )
    const bound_critical_visual = new THREE.Mesh( geometry, material );

    // Mesh: (Visual only) Arm 1
    points = [];
    for ( let i = -2; i <= 11; i+=0.25 ) {
        if (0 < i && i < 10) { continue; }
        if ( i < 0 ) {
            points.push( new THREE.Vector2( Math.pow( (4-Math.pow(i, 2)), 0.5), i ) );
        } else if ( i == 0 || i == 10 ) {
            points.push( new THREE.Vector2( -0.1 * i + 2, i ) );
        } else if ( 10 < i ) {
            points.push( new THREE.Vector2( Math.pow( (1-Math.pow(i-10, 2)), 0.5), i ) );
        }
    }
    geometry = new THREE.LatheGeometry( points );
    material = new THREE.MeshBasicMaterial( { color: 0x00eeff } )
    const arm_1_visual = new THREE.Mesh( geometry, material );

    // Mesh: (Visual only) Arm 2
    geometry = new THREE.LatheGeometry( points );
    material = new THREE.MeshBasicMaterial( { color: 0x00bfcc } )
    const arm_2_visual = new THREE.Mesh( geometry, material );

    // < Init: Transformations >
    plane.position.z = -0.1;
    end_effector.position.z = 4;
    end_effector_visual.position.z = 3;
    P0_visual.position.z = 2;
    P1_visual.position.z = 2;
    P2_visual.position.z = 2;
    bound_inner_visual.position.z = -0.05;
    bound_outer_visual.position.z = -0.05;

    // we will consider this size as L1 = L2 = 1 Unit.
    let size = 0.15
    P0_visual.scale.set( size, size, size );
    P1_visual.scale.set( size, size, size );
    P2_visual.scale.set( size, size, size );

    // < scene.add >
    scene.add( plane ); // 0
    scene.add( end_effector ); // 1
    arm_1.position.z = -4;
    arm_2.position.z = -4;
    scene.add( arm_1 ); // 2
    scene.add( arm_2 ); // 3
    scene.add( end_effector_visual ); // 4
    scene.add( P1_visual ); // 5
    scene.add( P2_visual ); // 6
    scene.add( bound_inner_visual ); // 7
    scene.add( bound_outer_visual ); // 8
    scene.add( bound_critical_visual ); // 9
    scene.add( arm_1_visual ); // 10
    scene.add( arm_2_visual ); // 11
    scene.add( P0_visual ); // 6
    //scene.add( base ); // 8

    camera.position.z = 10;
}

// game loop
function animate() {
    requestAnimationFrame( animate );

    // P is our mouse/pointer that does not go out of bounds.
    P.set( scene.children[1].position.x, scene.children[1].position.y );

    // Frequently used variables
    const Length_of_P = Math.pow( Math.pow(P.x,2) + Math.pow(P.y,2), 0.5 );
    const Length_of_Inner_bound = Math.abs( L1 - L2 );
    const Length_of_Upper_bound = L1 + L2;

    // Inner Boundary visualization - Lower Bound: Radius cannot be less than | L1 - L2 |
    scene.children[7].scale.set( Length_of_Inner_bound, Length_of_Inner_bound, 0 );

    // Outer Boundary visualization - Upper Bound: Radius cannot be greater than L1 + L2
    scene.children[8].scale.set( Length_of_Upper_bound, Length_of_Upper_bound, 0 );
    
    // End-Effector Constraint / Set End-Effector Position: The P gets constrained by the Inner and Outer Bounds.
    if ( Length_of_P < Length_of_Inner_bound ) {
        P.x = ( P.x / Length_of_P ) * ( Length_of_Inner_bound + 0.0001 );
        P.y = ( P.y / Length_of_P ) * ( Length_of_Inner_bound + 0.0001 );
    } else if ( Length_of_P > Length_of_Upper_bound ) {
        P.x = ( P.x / Length_of_P ) * ( Length_of_Upper_bound - 0.0001 );
        P.y = ( P.y / Length_of_P ) * ( Length_of_Upper_bound - 0.0001 );
    }
    
    // End Effector Position Visualization
    scene.children[4].position.set( P.x, P.y );

    // < Inverse Kinematics: Solving for R1, R2, given P, L1, L2 >
    // 	- First, solve for R2
    if ( flipJoint ) {
        R2 = Math.acos( ( Math.pow(P.x, 2) + Math.pow(P.y, 2) - Math.pow(L1, 2) - Math.pow(L2, 2) ) / ( -2*L1*L2 ) ) - Math.PI;
    } else {
        R2 = Math.acos( ( Math.pow(P.x, 2) + Math.pow(P.y, 2) - Math.pow(L1, 2) - Math.pow(L2, 2) ) / ( 2*L1*L2 ) );
    }
    // 	- Then, solve for R1
    R1 = Math.atan( ( P.y / P.x ) ) - Math.atan( ( L2*Math.sin(R2) ) / ( L1 + L2*Math.cos(R2) ) );
    //		- Doing Trigonometries so it works with 360 degrees...
    if (P.x < 0) {
        R1 += Math.PI;
    }
    /*		- critical_length_of_P_to_Base =  
                Length of the Line ( "(0,0) to end effector's position" ) 
                such that our three points (0, P1, P2) forms a Right Triangle.
                - If this  ( "(0,0) to end effector's position" ) is less than L, we have to add Pi to R1's rotation, which will be final R1.
    */
    const Critical_Length_of_P_to_Base = L2 * Math.sin( Math.acos( L1 / L2 ) );
    if ( Length_of_P < Critical_Length_of_P_to_Base ) { 
        R1 += Math.PI;
    }
    // < End of the Inverse Kinematics Solver >

    // critical_length_of_P_to_Base boundary visualization
    scene.children[9].scale.set( Critical_Length_of_P_to_Base, Critical_Length_of_P_to_Base );

    scene.children[5].position.set( L1*Math.cos(R1), L1*Math.sin(R1) );
    scene.children[6].position.set( L1*Math.cos(R1) + L2*Math.cos(R1+R2), L1*Math.sin(R1) + L2*Math.sin(R1+R2) );
    
    // Arm_2: Set position and R2
    // scene.children[3].position.set( L1*Math.cos(R1), L1*Math.sin(R1) );
    // scene.children[3].rotation.z = R1 + R2;
    
    // Arm_1: Set R1
    // scene.children[2].rotation.z = R1;

    // Arm_2 (Visual): Set position and R2
    scene.children[11].position.set( L1*Math.cos(R1), L1*Math.sin(R1) );
    scene.children[11].rotation.z = R1 + R2 - ( Math.PI / 2 );
    // 	- arms normalized to 1, then mutiply by L2.
    const size_L2 = 1/11 * L2;
    scene.children[11].scale.set( size_L2, size_L2, size_L2 );
    
    // Arm_1 (Visual): Set R1
    scene.children[10].rotation.z = R1 - ( Math.PI / 2 );
    // 	- arms normalized to 1, then mutiply by L1.
    const size_L1 = 1/11 * L1;
    scene.children[10].scale.set( size_L1, size_L1, size_L1 );

    renderer.render( scene, camera );
};
init();
animate();

// Utilities
// takes Object3D.Mesh object, returns Object3D.Line.LineSegments
function show_wireframe( mesh ) {
    const wireframe = new THREE.WireframeGeometry( mesh.geometry );
    const wireMesh = new THREE.LineSegments( wireframe );
    wireMesh.position.set( mesh.position.x, mesh.position.y, mesh.position.z );
    wireMesh.rotation.set( mesh.rotation.x, mesh.rotation.y, mesh.rotation.z );
    wireMesh.scale.set( mesh.scale.x, mesh.scale.y, mesh.scale.z );
    return wireMesh;
}
