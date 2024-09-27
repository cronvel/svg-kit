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



const svgKit = require( './svg-kit.js' ) ;
const VGEntity = require( './VGEntity.js' ) ;

const arrayKit = require( 'array-kit' ) ;



/*
	A pseudo-entity is an entity not created by user, created internally for rendering/compositing purposes.
	Notable examples are VGFlowingText's sub-entities.
*/

function VGPseudoEntity( params ) {
	VGEntity.call( this , params ) ;
}

module.exports = VGPseudoEntity ;

VGPseudoEntity.prototype = Object.create( VGEntity.prototype ) ;
VGPseudoEntity.prototype.constructor = VGPseudoEntity ;
VGPseudoEntity.prototype.__prototypeUID__ = 'svg-kit/VGPseudoEntity' ;
VGPseudoEntity.prototype.__prototypeVersion__ = require( '../package.json' ).version ;

// Useful?
//VGPseudoEntity.prototype.isPseudoEntity = true ;

