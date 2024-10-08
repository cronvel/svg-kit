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
const VGContainer = require( './VGContainer.js' ) ;
const VGEntity = require( './VGEntity.js' ) ;

const arrayKit = require( 'array-kit' ) ;



function VGClip( params ) {
	VGContainer.call( this , params ) ;
	this.clippingEntities = [] ;
	if ( params ) { this.set( params ) ; }
}

module.exports = VGClip ;

VGClip.prototype = Object.create( VGContainer.prototype ) ;
VGClip.prototype.constructor = VGClip ;
VGClip.prototype.__prototypeUID__ = 'svg-kit/VGClip' ;
VGClip.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



VGClip.prototype.svgTag = 'g' ;
VGClip.prototype.svgClippingGroupTag = 'clipPath' ;
VGClip.prototype.svgContentGroupTag = 'g' ;
VGClip.prototype.supportClippingEntities = true ;



VGClip.prototype.set = function( params ) {
	// .clippingEntity is already detected by VGContainer.prototype#set() and call VGClip#addClippingEntity()
	VGContainer.prototype.set.call( this , params ) ;
} ;



VGClip.prototype.addClippingEntity = function( clippingEntity , clone = false ) {
	clippingEntity = svgKit.objectToVG( clippingEntity , clone ) ;

	if ( clippingEntity ) {
		if ( clippingEntity.parent ) { clippingEntity.parent.removeEntity( clippingEntity ) ; }
		clippingEntity.parent = this ;
		clippingEntity.root = this.root ;
		this.clippingEntities.push( clippingEntity ) ;
		clippingEntity.onAttach() ;
	}
} ;



VGClip.prototype.removeClippingEntity = function( clippingEntity ) {
	if ( clippingEntity instanceof VGEntity ) {
		arrayKit.deleteValue( this.clippingEntities , clippingEntity ) ;
		clippingEntity.root = clippingEntity.parent = null ;
	}
} ;



VGClip.prototype.svgClippingGroupAttributes = function() {
	var attr = {
		id: this._id + '_clipPath'
	} ;

	return attr ;
} ;



VGClip.prototype.svgContentGroupAttributes = function() {
	var attr = {
		'clip-path': 'url(#' + ( this._id + '_clipPath' ) + ')'
	} ;

	return attr ;
} ;

