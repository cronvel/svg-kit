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
const VGContainer = require( './VGContainer.js' ) ;



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
	if ( clippingEntity ) { this.clippingEntities.push( clippingEntity ) ; }
} ;



VGClip.prototype.svgClippingGroupAttributes = function( root = this ) {
	var attr = {
		id: this._id + '_clipPath'
	} ;

	return attr ;
} ;



VGClip.prototype.svgContentGroupAttributes = function( root = this ) {
	var attr = {
		'clip-path': 'url(#' + ( this._id + '_clipPath' ) + ')'
	} ;

	return attr ;
} ;

