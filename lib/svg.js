/*
	SVG Kit
	
	Copyright (c) 2017 Cédric Ronvel
	
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



// Load modules
var fs = require( 'fs' ) ;
var domKit = require( 'dom-kit' ) ;



var svg = {} ;
module.exports = svg ;



svg.standalone = function standalone( content , viewBox )
{
	var output = '<?xml version="1.0" encoding="UTF-8"?>\n' ;
	
	if ( ! Array.isArray( viewBox ) ) { viewBox = svg.toAreaArray( viewBox ) ; }
	
	output += '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + viewBox.join( ' ' ) + '">\n' ;
	
	// ?
    // width="500"
    // height="500"
    
    output += content ;
    output += '\n</svg>\n' ;
    
    return output ;
} ;



svg.toAreaArray = function toAreaArray( object )
{
	if ( object.xmin !== undefined && object.xmax !== undefined && object.ymin !== undefined && object.ymax !== undefined )
	{
		return [
			object.xmin ,
			object.ymin ,
			object.xmax - object.xmin ,
			object.ymax - object.ymin
		] ;
	}
	else if ( object.x !== undefined && object.y !== undefined && object.width !== undefined && object.height !== undefined )
	{
		return [
			object.x ,
			object.y ,
			object.width ,
			object.height
		] ;
	}
	else
	{
		return [ 0 , 0 , 100 , 100 ] ;
	}
} ;



svg.inlineToClass = function inlineToClass( $svg )
{
	$svg.querySelectorAll( 'path' ).forEach( function( $path ) {
		console.log( $path.getAttribute( 'style' ) ) ;
	} ) ;
} ;



/*
	old: function attachXmlTo( $container , $svg , options )
	new: function attachTo( $svg , $container , options )
*/
// Dummy ATM...
svg.attachTo = function attachTo( $svg , $container , options )
{
	var viewBox , width , height ;
	
	svg.lightCleanup( $svg ) ;
	
	// Fix id, if necessary
	if ( options.id !== undefined )
	{
		if ( typeof options.id === 'string' ) { $svg.setAttribute( 'id' , options.id ) ; }
		else if ( ! options.id ) { $svg.removeAttribute( 'id' ) ; }
	}
	
	if ( options.class )
	{
		if ( typeof options.class === 'string' ) { $svg.classList.add( options.class ) ; }
		else if ( typeof options.class === 'object' ) { domKit.class( $svg , options.class ) ; }
	}
	
	if ( options.idNamespace ) { domKit.idNamespace( $svg , options.idNamespace ) ; }
	
	if ( options.hidden ) { $svg.style.visibility = 'hidden' ; }
	
	if ( options.noWidthHeightAttr )
	{
		// Save and remove the width and height attribute
		width = $svg.getAttribute( 'width' ) ;
		height = $svg.getAttribute( 'height' ) ;
		
		$svg.removeAttribute( 'height' ) ;
		$svg.removeAttribute( 'width' ) ;
		
		// if the $svg don't have a viewBox attribute, set it now from the width and height (it works most of time)
		if ( ! $svg.getAttribute( 'viewBox' ) && width && height )
		{
			viewBox = '0 0 ' + width + ' ' + height ;
			//console.log( "viewBox:" , viewBox ) ;
			$svg.setAttribute( 'viewBox' , viewBox ) ;
		}
	}
	
	if ( options.css ) { domKit.css( $svg , options.css ) ; }
	
	// If a $container was specified, attach to it
	if ( $container ) { $container.appendChild( $svg ) ; }
} ;



svg.lightCleanup = function lightCleanup( $svg )
{
	removeAllTag( $svg , 'metadata' ) ;
	removeAllTag( $svg , 'script' ) ;
} ;



// Should remove all tags and attributes that have non-registered namespace,
// e.g.: sodipodi, inkscape, etc...
//svg.heavyCleanup = function heavyCleanup( svgElement ) {} ;



function removeAllTag( $container , tag )
{
	var i , elements , element ;
	
	elements = $container.getElementsByTagName( tag ) ;
	
	for ( i = 0 ; i < elements.length ; i ++ )
	{
		element = elements.item( i ) ;
		element.parentNode.removeChild( element ) ;
	}
}




/*
	old: function load( $container , url , options , callback )
	new: loadInto( url , $container , options , callback )
*/
/*
	load( $container , url , [options] , callback )
	
	* url: the URL of the .svg file
	* $container: null or the DOM element where the <svg> tag will be put
	* options: an optional object with optional options
		* id: the id attribute of the <svg> tag (recommanded)
		* class: a string or a class object to add/remove on the <svg> tag
		* hidden: inject the svg but make it hidden (useful to apply modification before the show)
		* noWidthHeightAttr: remove the width and height attribute of the <svg> tag
		* css: a css object to apply on the <svg> tag
	* callback: completion callback
*/
svg.loadInto = function loadInto( url , $container , options , callback )
{
	if ( typeof options === 'function' ) { callback = options ; }
	if ( ! options || typeof options !== 'object' ) { options = {} ; }
	
	if ( ! process.browser )
	{
		// Use Node.js 'fs' module
		
		if ( url.substring( 0 , 7 ) === 'file://' ) { url = url.slice( 7 ) ; }
		
		fs.readFile( url , 'utf8' , function( error , content ) {
			
			if ( error ) { callback( error ) ; return ; }
			
			
			//var parser = new DOMParser() ;
			//var $svg = parser.parseFromString( content , 'application/xml' ).documentElement ;
			var $svg = domKit.fromXml( content ).documentElement ;
			
			try {
				svg.attachTo( $svg , $container , options ) ;
			}
			catch ( error ) {
				callback( error ) ;
				return ;
			}
			
			callback( undefined , $svg ) ;
		} ) ;
	}
	else
	{
		// Use an AJAX HTTP Request
		
		svg.ajax( url , function( error , xmlDoc ) {
			
			if ( error ) { callback( error ) ; return ; }
			
			var $svg = xmlDoc.documentElement ;
			
			try {
				svg.attachTo( $svg , $container , options ) ;
			}
			catch ( error ) {
				callback( error ) ;
				return ;
			}
			
			callback( undefined , $svg ) ;
		} ) ;
	}
} ;



svg.ajax = function ajax( url , callback )
{
	var xhr = new XMLHttpRequest() ;
	
	//console.warn( "ajax url:" , url ) ;
	
	xhr.responseType = 'document' ;
	xhr.onreadystatechange = svg.ajax.ajaxStatus.bind( xhr , callback ) ;
	xhr.open( 'GET', url ) ;
	xhr.send() ;
} ;



svg.ajax.ajaxStatus = function ajaxStatus( callback )
{
	// From MDN: In the event of a communication error (such as the webserver going down),
	// an exception will be thrown in the when attempting to access the 'status' property. 
	
	try {
		if ( this.readyState === 4 )
		{
			if ( this.status === 200 )
			{
				callback( undefined , this.responseXML ) ;
			}
			else if ( this.status === 0 && this.responseXML )	// Yay, loading with file:// does not provide any status...
			{
				callback( undefined , this.responseXML ) ;
			}
			else
			{
				if ( this.status ) { callback( this.status ) ; }
				else { callback( new Error( "[svg-kit] ajaxStatus(): Error with falsy status" ) ) ; }
			}
		}
	}
	catch ( error ) {
		callback( error ) ;
	}
} ;


