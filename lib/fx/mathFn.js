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

"use strict" ;



const PI = Math.PI ;
const PI_2 = 2 * Math.PI ;
const PI_OVER_2 = Math.PI / 2 ;

/*
	Shape: /\___
*/
exports.sineOneOutOfX = ( v , div = 2 ) =>
	Math.floor( v / PI_2 ) % div ? 0 :
	1 + Math.sin( v - PI_OVER_2 ) / 2 ;

/*	        ____
	Shape: /    \_____
*/
exports.sineHalfOutOfX = ( v , div = 2 ) =>
	Math.floor( v / PI ) % div ? (
		Math.floor( v / ( PI *  div ) ) % 2
	) :
		1 + Math.sin( v - PI_OVER_2 ) / 2 ;



function positiveModulo( a , b ) { return a < 0 ? b + ( a % b ) : a % b ; }



const transform = exports.transform = {} ;

transform.cycleAround = ( t , easingName = 'sine' ) => {
	let easingFn = easing[ easingName ] || easing.sine ,
		tLoop = 2 * positiveModulo( t , 1 ) ;

	return (
		tLoop <= 1 ? - 1 + 2 * easingFn( tLoop ) :
		tLoop <= 2 ? - 1 + 2 * easingFn( 2 - tLoop ) :
		0
	) ;
} ;

transform.roundTripAndPause = ( t , pause = 1 , easingName = 'sine' ) => {
	let easingFn = easing[ easingName ] || easing.sine ,
		tLoop = 2 * positiveModulo( t , 1 + pause ) ;

	return (
		tLoop <= 1 ? easingFn( tLoop ) :
		tLoop <= 2 ? easingFn( 2 - tLoop ) :
		0
	) ;
} ;

transform.goPauseReturnPause = ( t , pause = 1 , easingName = 'sine' ) => {
	let easingFn = easing[ easingName ] || easing.sine ,
		tLoop = 2 * positiveModulo( t , 1 + 2 * pause ) ;

	return (
		tLoop <= 1 ? easingFn( tLoop ) :
		tLoop <= 2 * pause + 1 ? 1 :
		tLoop <= 2 * pause + 2 ? easingFn( 2 * pause + 2 - tLoop ) :
		0
	) ;
} ;

const easing = exports.easing = {} ;

easing.linear = t => t ;
easing.sine = t => 0.5 + Math.sin( - PI_OVER_2 + t * PI ) / 2 ;


