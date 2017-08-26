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
var path = require( 'path' ) ;
var termkit = require( 'terminal-kit' ) ;
var term = termkit.terminal ;



function cli()
{
	var args = require( 'minimist' )( process.argv.slice( 2 ) ) ;
	
	if ( args._.length < 1 )
	{
		cli.usage() ;
		process.exit( 1 ) ;
	}
	
	var command = args._[ 0 ] ;
	var inputPath = args._[ 1 ] ;
	var outputPath = args._[ 2 ] ;
	delete args._ ;
	
	if ( args.self )
	{
		outputPath = inputPath ;
		delete args.self ;
	}
	
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
	term( 'Usage is: ^c%s <command> <input-file> [<output-file>] [<option1>] [...]^:\n\n' , path.basename( process.argv[ 1 ] ) ) ;
	
	term( '^bAvailable commands:^:\n' ) ;
	term( 'patch : patch the SVG\n' ) ;
	
	term( '^bCommon options:^:\n' ) ;
	term( '--help                   : display the command help\n' ) ;
	term( '--self                   : output in the input file (overwrite it)\n' ) ;
	
	term( '\n' ) ;
} ;



// Example:
// ./bin/svgkit patch ../spellcast/media/icons/mana.svg t.svg --removeIds --removeDefaultStyles --colorClass --removeComments --removeExoticNamespaces --removeWhiteLines
cli.commands.patch = function patch( inputPath , outputPath , args )
{
	var inputStr ;
	
	if ( ! inputPath || args.help )
	{
		term( 'Usage is: ^c%s patch <input-file> [<output-file>] [<option1>] [...]^:\n\n' , path.basename( process.argv[ 1 ] ) ) ;
		
		term( '^bAvailable options:^:\n' ) ;
		term( '--removeIds              : remove all ^/id^ attributes\n' ) ;
		term( '--prefixIds <prefix>     : prefix all ^/id^ and patch url #ref\n' ) ;
		term( '--removeSize             : remove the width and height attribute ^+AND^ style from the <svg> tag\n' ) ;
		term( '--removeDefaultStyles    : remove meaningless style pollution (style set with default values)\n' ) ;
		term( '--colorClass             : move all ^/stroke^ and ^/fill^ color ^/inline styles^ to their own attribute,\n' ) ;
		term( '                           add the ^/primary^ class to class-less shape-elements\n' ) ;
		term( '--removeComments         : remove all comment nodes\n' ) ;
		term( '--removeWhiteSpaces      : remove all white-space\n' ) ;
		term( '--removeWhiteLines       : remove all empty lines\n' ) ;
		term( '--removeExoticNamespaces : remove all tag and attributes that have a namespace different than svg,\n' ) ;
		term( '                           the svg namespace is stripped\n' ) ;
		term( '--spellcast              : turn on --removeIds --removeDefaultStyles --colorClass --removeComments\n' ) ;
		term( '                           --removeExoticNamespaces and --removeWhiteLines, useful for spellcast icons\n' ) ;
		
		term( '\n' ) ;
		return ;
	}
	
	if ( args.spellcast )
	{
		args.removeIds =
			args.removeDefaultStyles =
			args.colorClass =
			args.removeComments =
			args.removeExoticNamespaces =
			args.removeWhiteLines = 
			true ;
	}
	
	try {
		inputStr = fs.readFileSync( inputPath , 'utf8' ) ;
	}
	catch ( error ) {
		term.red( "Can't load file %s: %s\n" , inputPath , error ) ;
		return ;
	}
	
	var $doc = domKit.fromXml( inputStr ) ;
	
	svgKit.patchDocument( $doc , args ) ;
	
	var outputStr = domKit.toXml( $doc ) ;
	
	if ( outputPath ) { fs.writeFileSync( outputPath , outputStr ) ; }
	else { process.stdout.write( outputStr + '\n' ) ; }
} ;


