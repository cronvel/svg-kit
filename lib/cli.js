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



var domKit = require( 'dom-kit' ) ;
var svgKit = require( './svg.js' ) ;
var fs = require( 'fs' ) ;
var termkit = require( 'terminal-kit' ) ;
var term = termkit.terminal ;



function cli()
{
	var args = require( 'minimist' )( process.argv.slice( 2 ) ) ;
	
	if ( args._.length < 2 )
	{
		cli.usage() ;
		process.exit( 1 ) ;
	}
	
	var command = args._[ 0 ] ;
	var inputPath = args._[ 1 ] ;
	var outputPath = args._[ 2 ] ;
	delete args._ ;
	
	if ( ! cli.commands[ command ] )
	{
		cli.usage() ;
		process.exit( 1 ) ;
	}
	
	cli.commands[ command ]( inputPath , outputPath , args ) ;
}

module.exports = cli ;
cli.commands = {} ;



cli.usage = function usage()
{
	term( 'Usage is %s <command> <input-file> [<option1>] [...]\n' , process.argv[ 1 ] ) ;
} ;



cli.commands.test = function test( inputPath , outputPath , args )
{
	var inputStr = fs.readFileSync( inputPath , 'utf8' ) ;
	var $doc = domKit.fromXml( inputStr ) ;
	
	//term( '%I\n' , $doc.querySelector( 'path' ) ) ;
	svgKit.inlineToClass( $doc ) ;
	//return ;
	
	var outputStr = domKit.toXml( $doc ) ;
	
	if ( outputPath ) { fs.writeFileSync( outputPath , outputStr ) ; }
	else { process.stdout.write( outputStr + '\n' ) ; }
} ;


