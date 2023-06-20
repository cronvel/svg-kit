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

/*
	A mesure value, either unit-less, or relative, eventually px.
*/

function Metric( value , unit ) {
	this.value = 0 ;
	this.unit = '' ;
	this.set( value , unit ) ;
}

module.exports = Metric ;



const INPUT_UNITS = {
	'': '' ,
	'px': '' ,
	'em': 'em' ,
	'rel': 'em' ,
	'%': {
		value: v => v * 0.01 ,
		unit: 'em'
	}
} ;

const UNITS_CALC = {
	'': v => v ,
	'em': ( v , relativeTo ) => v * relativeTo
} ;

const REGEXP = /^([0-9]+(?:\.[0-9]+)?) *([a-z%]+)?$/ ;

Metric.prototype.set = function( value , unit = '' ) {
	if ( typeof value === 'string' ) {
		let match = value .match( REGEXP ) ;
		if ( ! match ) { return false ; }
		value = parseFloat( match[ 1 ] ) ;
		unit = match[ 2 ] || '' ;
	}

	unit = INPUT_UNITS[ unit ] ;
	if ( unit === undefined ) { return false ; }
	if ( typeof unit === 'object' ) {
		value = unit.value( value ) ;
		unit = unit.unit ;
	}
	
	this.value = value ;
	this.unit = unit ;

	return true ;
} ;



Metric.prototype.get = function( relativeTo , relativeTo2 , ... relativeToN ) {
	if ( relativeTo instanceof Metric ) { relativeTo = relativeTo.get( relativeTo2 , ... relativeToN ) ; }
	return UNITS_CALC[ this.unit ]( this.value , relativeTo ) ;
} ;



Metric.chainedGet = function( ... metrics ) {
	metrics = metrics.filter( m => ( m instanceof Metric ) || typeof m === 'number' ) ;
	if ( ! metrics.length ) { return ; }
	if ( typeof metrics[ 0 ] === 'number' ) { return metrics[ 0 ] ; }
	var metric = metrics.shift() ;
	return metric.get( ... metrics ) ;
} ;

