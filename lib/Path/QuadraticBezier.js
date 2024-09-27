/*
	SVG Kit

	Copyright (c) 2017 - 2024 Cédric Ronvel

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

"use strict" ;



/*
	Mostly derived from svg-path-properties by RogerVecianaAbzu:
	https://github.com/rveciana/svg-path-properties/blob/master/src/bezier.ts
*/



const Bezier = require( './Bezier.js' ) ;
const BoundingBox = require( '../BoundingBox.js' ) ;



function QuadraticBezier( startPoint , control , endPoint ) {
	this.startPoint = startPoint ;
	this.control = control ;
	this.endPoint = endPoint ;
	Bezier.call( this , startPoint , control , endPoint ) ;
}

module.exports = QuadraticBezier ;

QuadraticBezier.prototype = Object.create( Bezier.prototype ) ;
QuadraticBezier.prototype.constructor = QuadraticBezier ;


// The parametric formula for a given axis
function parametric( ps , t ) {
	const mt = 1 - t ;
	return mt * mt * ps[0] + 2 * mt * t * ps[1] + t * t * ps[2] ;
}



QuadraticBezier.getPoint =
QuadraticBezier.prototype.getPoint = ( xs , ys , t ) => {
	return {
		x: parametric( xs , t ) ,
		y: parametric( ys , t )
	} ;
} ;



QuadraticBezier.getDerivative =
QuadraticBezier.prototype.getDerivative = ( xs , ys , t ) => {
	return {
		x: ( 1 - t ) * 2 * ( xs[1] - xs[0] ) + t * 2 * ( xs[2] - xs[1] ) ,
		y: ( 1 - t ) * 2 * ( ys[1] - ys[0] ) + t * 2 * ( ys[2] - ys[1] )
	} ;
} ;



QuadraticBezier.getLength =
QuadraticBezier.prototype.getLength = ( xs , ys , t = 1 ) => {
	const ax = xs[0] - 2 * xs[1] + xs[2] ;
	const ay = ys[0] - 2 * ys[1] + ys[2] ;
	const bx = 2 * xs[1] - 2 * xs[0] ;
	const by = 2 * ys[1] - 2 * ys[0] ;

	const A = 4 * ( ax * ax + ay * ay ) ;
	const B = 4 * ( ax * bx + ay * by ) ;
	const C = bx * bx + by * by ;

	if ( A === 0 ) {
		return (
			t * Math.sqrt( Math.pow( xs[2] - xs[0] , 2 ) + Math.pow( ys[2] - ys[0] , 2 ) )
		) ;
	}

	const b = B / ( 2 * A ) ;
	const c = C / A ;
	const u = t + b ;
	const k = c - b * b ;

	const uuk = u * u + k > 0 ? Math.sqrt( u * u + k ) : 0 ;
	const bbk = b * b + k > 0 ? Math.sqrt( b * b + k ) : 0 ;
	const term = b + Math.sqrt( b * b + k ) !== 0 && ( ( u + uuk ) / ( b + bbk ) ) !== 0 ?
		k * Math.log( Math.abs( ( u + uuk ) / ( b + bbk ) ) ) :
		0 ;

	return ( Math.sqrt( A ) / 2 ) * ( u * uuk - b * bbk + term ) ;
} ;



// Derived from:
// https://stackoverflow.com/questions/24809978/calculating-the-bounding-box-of-cubic-bezier-curve
QuadraticBezier.getBoundingBox =
QuadraticBezier.prototype.getBoundingBox = function( xs , ys ) {
	var xExtrema = [ xs[0] , xs[2] ] ,
		yExtrema = [ ys[0] , ys[2] ] ;

	getExtrema( xs , xExtrema ) ;
	getExtrema( ys , yExtrema ) ;

	return new BoundingBox(
		Math.min( ... xExtrema ) ,
		Math.min( ... yExtrema ) ,
		Math.max( ... xExtrema ) ,
		Math.max( ... yExtrema )
	) ;
} ;



function getExtrema( ps , pExtrema ) {
	let a = ps[0] - 2 * ps[1] + ps[2] ,
		b = - 2 * ps[0] + 2 * ps[1] ,
		c = ps[0] ;

	if ( Math.abs( a ) > 1e-12 ) {
		let t = - b / ( 2 * a ) ;
		if ( 0 < t && t < 1 ) {
			pExtrema.push( a * t * t + b * t + c ) ;
		}
	}
}

