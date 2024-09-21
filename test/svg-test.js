/*
	SVG Kit

	Copyright (c) 2017 - 2023 Cédric Ronvel

	The MIT License (MIT)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

/* global expect, describe, it, before, after */



const svgKit = require( '..' ) ;



describe( "Find" , () => {
	
	it( "a way to test svg (atom-shell?)" ) ;
} ) ;



describe( "Simple Convex Polygon" , () => {
	
	it( "should check if a coordinate is inside the polygon" , () => {
		var polygon = new svgKit.ConvexPolygon( { points: [
			{ x: 0 , y: 2 } ,
			{ x: 2 , y: 1 } ,
			{ x: 2 , y: -1 } ,
			{ x: -2 , y: -1 } ,
			{ x: -2 , y: 1 } ,
		] } ) ;
		//log( polygon ) ;

		expect( polygon.isInside( { x: 0 , y: 0 } ) ).to.be( true ) ;
		expect( polygon.isInside( { x: 0 , y: 1 } ) ).to.be( true ) ;
		expect( polygon.isInside( { x: 1 , y: 0 } ) ).to.be( true ) ;
		expect( polygon.isInside( { x: 1 , y: 1 } ) ).to.be( true ) ;
		expect( polygon.isInside( { x: 1 , y: 0 } ) ).to.be( true ) ;
		expect( polygon.isInside( { x: -1 , y: 0 } ) ).to.be( true ) ;
		expect( polygon.isInside( { x: -1 , y: 1 } ) ).to.be( true ) ;
		expect( polygon.isInside( { x: -1 , y: 0 } ) ).to.be( true ) ;

		expect( polygon.isInside( { x: 0 , y: -0.5 } ) ).to.be( true ) ;
		expect( polygon.isInside( { x: 1 , y: -0.5 } ) ).to.be( true ) ;
		expect( polygon.isInside( { x: -1 , y: -0.5 } ) ).to.be( true ) ;

		expect( polygon.isInside( { x: 0, y: 3 } ) ).to.be( false ) ;
		expect( polygon.isInside( { x: 3, y: 0 } ) ).to.be( false ) ;
		expect( polygon.isInside( { x: 3, y: 3 } ) ).to.be( false ) ;
		expect( polygon.isInside( { x: 0, y: 3 } ) ).to.be( false ) ;
		expect( polygon.isInside( { x: -3, y: 0 } ) ).to.be( false ) ;
		expect( polygon.isInside( { x: -3, y: 3 } ) ).to.be( false ) ;
		expect( polygon.isInside( { x: -3, y: -3 } ) ).to.be( false ) ;
	} ) ;
} ) ;



describe( "Path" , () => {

	it( "Bezier path" , () => {
		var path = new svgKit.Path() ;
		//path.curve( { cx1: 3 , cy1: 3 , cx2: 3 , cy2: -3 , x: 6 , y: 0 } ) ;
		//path.line( { x: 6 , y: 10 } ) ;
		path.arc( { rx: 4 , ry: 6 , x: 6 , y: 0 } ) ;
		var curves = path.computeCurves() ;
		var curve = curves[ 0 ] ;
		log( "Curve: %I" , curve ) ;

		for ( let i = 0 ; i < curve.length ; i ++ ) {
			let point = curve.getPointAndTangentAtLength( i ) ;
			log( "Point at length %f: %n" , i , point ) ;
		}
		log( "Point at length %f: %n" , curve.length , curve.getPointAndTangentAtLength( curve.length ) ) ;
	} ) ;
} ) ;

