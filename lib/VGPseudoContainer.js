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



const svgKit = require( './svg-kit.js' ) ;
const VGEntity = require( './VGEntity.js' ) ;

const arrayKit = require( 'array-kit' ) ;



/*
	A pseudo-container is a container for pseudo-entities, entities that are not user-created entities
	but on-the-fly entities created for rendering/compositing purposes.
	A notable example is the VGFlowingText element.
	From a rendering point-of-view, there is not much difference between pseudo-container and container,
	but from the userland point-of-view, they do not exists and are not serialized.
*/

function VGPseudoContainer( params ) {
	VGEntity.call( this , params ) ;

	this.arePseudoEntitiesReady = false ;
	this.pseudoEntities = [] ;
}

module.exports = VGPseudoContainer ;

VGPseudoContainer.prototype = Object.create( VGEntity.prototype ) ;
VGPseudoContainer.prototype.constructor = VGPseudoContainer ;
VGPseudoContainer.prototype.__prototypeUID__ = 'svg-kit/VGPseudoContainer' ;
VGPseudoContainer.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



VGPseudoContainer.prototype.isPseudoContainer = true ;



VGPseudoContainer.prototype.addPseudoEntity = function( pseudoEntity ) {
	if ( pseudoEntity.parent ) { pseudoEntity.parent.removePseudoEntity( pseudoEntity ) ; }
	pseudoEntity.parent = this ;
	pseudoEntity.root = this.root ;
	this.pseudoEntities.push( pseudoEntity ) ;
} ;



VGPseudoContainer.prototype.removePseudoEntity = function( pseudoEntity ) {
	arrayKit.deleteValue( this.pseudoEntities , pseudoEntity ) ;
	pseudoEntity.root = pseudoEntity.parent = null ;
} ;



VGPseudoContainer.prototype.clearPseudoEntities = function() {
	for ( pseudoEntity of this.pseudoEntities ) {
		pseudoEntity.root = pseudoEntity.parent = null ;
	}

	this.pseudoEntities.length = 0 ;
} ;



// To be derived...
VGPseudoContainer.prototype.computePseudoEntities = async function() {} ;

