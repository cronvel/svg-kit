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



function Bezier( ... args ) {
	// Cache those values for faster execution
	this.xs = args.map( v => v.x ) ;
	this.ys = args.map( v => v.y ) ;
	this.length = this.getLength( this.xs , this.ys , 1 ) ;
	this.boundingBox = this.getBoundingBox( this.xs , this.ys ) ;
}

module.exports = Bezier ;



Bezier.prototype.getPointAtLength = function( length ) {
	if ( length === 0 ) { return { x: this.startPoint.x , y: this.startPoint.y } ; }
	if ( length === this.length ) { return { x: this.endPoint.x , y: this.endPoint.y } ; }

	const t = this.getT( this.xs , this.ys , length ) ;
	return this.getPoint( this.xs , this.ys , t ) ;
} ;



Bezier.prototype.getTangentAtLength = function( length ) {
	const t = this.getT( this.xs , this.ys , length ) ;

	const derivative = this.getDerivative( this.xs , this.ys , t ) ;
	const mdl = Math.sqrt( derivative.x * derivative.x + derivative.y * derivative.y ) ;

	let tangent ;

	if ( mdl > 0 ) {
		tangent = { x: derivative.x / mdl , y: derivative.y / mdl } ;
	}
	else {
		tangent = { x: 0 , y: 0 } ;
	}

	tangent.angle = Math.atan2( tangent.y , tangent.x ) ;

	return tangent ;
} ;



// Position + Tangent + Angle (radians)
Bezier.prototype.getPropertiesAtLength = function( length ) {
	const t = this.getT( this.xs , this.ys , length ) ;

	let point , tangent ;

	if ( length === 0 ) { point = { x: this.startPoint.x , y: this.startPoint.y } ; }
	else if ( length === this.length ) { point = { x: this.endPoint.x , y: this.endPoint.y } ; }
	else { point = this.getPoint( this.xs , this.ys , t ) ; }

	const derivative = this.getDerivative( this.xs , this.ys , t ) ;
	const mdl = Math.sqrt( derivative.x * derivative.x + derivative.y * derivative.y ) ;
	
	if ( mdl > 0 ) {
		tangent = { x: derivative.x / mdl , y: derivative.y / mdl } ;
	}
	else {
		tangent = { x: 0 , y: 0 } ;
	}
	
	return {
		x: point.x ,
		y: point.y ,
		dx: tangent.x ,
		dy: tangent.y ,
		angle: Math.atan2( tangent.y , tangent.x )
	} ;
} ;



// Get the t value for a given length
Bezier.prototype.getT = function( xs , ys , length ) {
	let error = 1 ;
	let t = length / this.length ;
	let step = ( length - this.getLength( xs , ys , t ) ) / this.length ;

	let numIterations = 0 ;
	
	while ( error > 0.001 ) {
		const increasedTLength = this.getLength( xs , ys , t + step ) ;
		const increasedTError = Math.abs( length - increasedTLength ) / this.length ;
		if ( increasedTError < error ) {
			error = increasedTError ;
			t += step ;
		}
		else {
			const decreasedTLength = this.getLength( xs , ys , t - step ) ;
			const decreasedTError = Math.abs( length - decreasedTLength ) / this.length ;
			if ( decreasedTError < error ) {
				error = decreasedTError ;
				t -= step ;
			}
			else {
				step /= 2 ;
			}
		}

		numIterations ++ ;
		if ( numIterations > 500 ) {
			break ;
		}
	}

	return t ;
} ;

