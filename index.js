#!/usr/bin/env node

import decamelize from 'decamelize';
import XLSX from 'xlsx';
import fs from 'fs';
import csv from 'fast-csv';
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers';
const argv = yargs( hideBin( process.argv ) ).argv;
const decam = argv.decamelize ? argv.decamelize : false;

var version = argv.ver ? argv.ver : "4.0";

var filename = argv.in ? argv.in : null;
if ( !filename ) {
    console.log( "Filename is required with --in filename.xls" );
    exit( 1 );
} 

var workbook = XLSX.readFile( version + '/catCFDI/' + filename );
var sheets = argv.sheet ? [ argv.sheet ] : workbook.SheetNames;
const format = argv.format ? argv.format : 'json';
var dir = argv.dir ? argv.dir : version + '/' + format;

if ( !fs.existsSync( dir ) ){
    fs.mkdirSync( dir, { recursive: true } );
}

function clamp_range(range) {
	if(range.e.r >= (1<<20)) range.e.r = (1<<20)-1;
	if(range.e.c >= (1<<14)) range.e.c = (1<<14)-1;
	return range;
}

var crefregex = /(^|[^._A-Z0-9])([$]?)([A-Z]{1,2}|[A-W][A-Z]{2}|X[A-E][A-Z]|XF[A-D])([$]?)([1-9]\d{0,5}|10[0-3]\d{4}|104[0-7]\d{3}|1048[0-4]\d{2}|10485[0-6]\d|104857[0-6])(?![_.\(A-Za-z0-9])/g;

/*
	deletes `nrows` rows STARTING WITH `start_row`
	- ws         = worksheet object
	- start_row  = starting row (0-indexed) | default 0
	- nrows      = number of rows to delete | default 1
*/

function delete_rows(ws, start_row, nrows) {
	if(!ws) throw new Error("operation expects a worksheet");
	var dense = Array.isArray(ws);
	if(!nrows) nrows = 1;
	if(!start_row) start_row = 0;

	/* extract original range */
	var range = XLSX.utils.decode_range(ws["!ref"]);
	var R = 0, C = 0;

	var formula_cb = function($0, $1, $2, $3, $4, $5) {
		var _R = XLSX.utils.decode_row($5), _C = XLSX.utils.decode_col($3);
		if(_R >= start_row) {
			_R -= nrows;
			if(_R < start_row) return "#REF!";
		}
		return $1+($2=="$" ? $2+$3 : XLSX.utils.encode_col(_C))+($4=="$" ? $4+$5 : XLSX.utils.encode_row(_R));
	};

	var addr, naddr;
	/* move cells and update formulae */
	if(dense) {
		for(R = start_row + nrows; R <= range.e.r; ++R) {
			if(ws[R]) ws[R].forEach(function(cell) { cell.f = cell.f.replace(crefregex, formula_cb); });
			ws[R-nrows] = ws[R];
		}
		ws.length -= nrows;
		for(R = 0; R < start_row; ++R) {
			if(ws[R]) ws[R].forEach(function(cell) { cell.f = cell.f.replace(crefregex, formula_cb); });
		}
	} else {
		for(R = start_row + nrows; R <= range.e.r; ++R) {
			for(C = range.s.c; C <= range.e.c; ++C) {
				addr = XLSX.utils.encode_cell({r:R, c:C});
				naddr = XLSX.utils.encode_cell({r:R-nrows, c:C});
				if(!ws[addr]) { delete ws[naddr]; continue; }
				if(ws[addr].f) ws[addr].f = ws[addr].f.replace(crefregex, formula_cb);
				ws[naddr] = ws[addr];
			}
		}
		for(R = range.e.r; R > range.e.r - nrows; --R) {
			for(C = range.s.c; C <= range.e.c; ++C) {
				addr = XLSX.utils.encode_cell({r:R, c:C});
				delete ws[addr];
			}
		}
		for(R = 0; R < start_row; ++R) {
			for(C = range.s.c; C <= range.e.c; ++C) {
				addr = XLSX.utils.encode_cell({r:R, c:C});
				if(ws[addr] && ws[addr].f) ws[addr].f = ws[addr].f.replace(crefregex, formula_cb);
			}
		}
	}

	/* write new range */
	range.e.r -= nrows;
	if(range.e.r < range.s.r) range.e.r = range.s.r;
	ws["!ref"] = XLSX.utils.encode_range(clamp_range(range));

	/* merge cells */
	if(ws["!merges"]) ws["!merges"].forEach(function(merge, idx) {
		var mergerange;
		switch(typeof merge) {
			case 'string': mergerange = XLSX.utils.decode_range(merge); break;
			case 'object': mergerange = merge; break;
			default: throw new Error("Unexpected merge ref " + merge);
		}
		if(mergerange.s.r >= start_row) {
			mergerange.s.r = Math.max(mergerange.s.r - nrows, start_row);
			if(mergerange.e.r < start_row + nrows) { delete ws["!merges"][idx]; return; }
		} else if(mergerange.e.r >= start_row) mergerange.e.r = Math.max(mergerange.e.r - nrows, start_row);
		clamp_range(mergerange);
		ws["!merges"][idx] = mergerange;
	});
	if(ws["!merges"]) ws["!merges"] = ws["!merges"].filter(function(x) { return !!x; });

	/* rows */
	if(ws["!rows"]) ws["!rows"].splice(start_row, nrows);
}

function process_SAT_sheet( sheetName ) {
    var sheet = workbook.Sheets[ sheetName ];
    var rows = ( sheetName === 'c_RegimenFiscal' || sheetName === 'c_CodigoPostal_Parte_1' || sheetName === 'c_CodigoPostal_Parte_2' ) ? 5 : 4;
    delete_rows( sheet, 0, rows );
	var filename = dir + '/' + ( decam ? decamelize( sheetName ) : sheetName );
	var data = null;
	if ( format == 'json' ) {
		data = XLSX.utils.sheet_to_json( sheet );
		fs.writeFileSync( filename + '.json', JSON.stringify( data ) );
	} else if ( format == 'csv' ) {
		data = XLSX.utils.sheet_to_csv( sheet );
		fs.writeFileSync( filename + '.csv', data );
	}
}

function concatCSVAndOutput(csvFilePaths, outputFilePath) {
	const promises = csvFilePaths.map((path) => {
		return new Promise((resolve) => {
		const dataArray = [];
		return csv
			.parseFile(path, {headers: true})
			.on('data', function(data) {
				dataArray.push(data);
			})
			.on('end', function() {
				resolve(dataArray);
			});
		});
	});

	return Promise.all(promises)
		.then((results) => {

			const csvStream = csv.format({headers: true});
			const writableStream = fs.createWriteStream(outputFilePath);

			writableStream.on('finish', function() {
			console.log('DONE!');
			});

			csvStream.pipe(writableStream);
			results.forEach((result) => {
			result.forEach((data) => {
				csvStream.write(data);
			});
			});
			csvStream.end();

		});
}

sheets.forEach( ( sheet ) => {
    console.log( 'Processing ' + sheet + ' as ' + format + '...' );
    process_SAT_sheet( sheet );
	if ( format == 'json' ) return;
	var base = null; var joins = null;
	if ( sheet == 'c_CodigoPostal_Parte_2' ) {
		joins = [ 'c_CodigoPostal_Parte_1', 'c_CodigoPostal_Parte_2' ];
		base = 'c_CodigoPostal';
	}
	if ( sheet == 'C_Colonia_3' ) {
		joins = [ 'C_Colonia_1', 'C_Colonia_2', 'C_Colonia_3' ];
		base = 'C_Colonia';
	}
	if ( base ) {
		var files = [];
		joins.forEach( ( file ) => {
			files.push( dir + '/' + file + '.' + format );
		} );
		filename = dir + '/' + ( decam ? decamelize( base ) : base ) + '.' + format;
		concatCSVAndOutput( files, filename );
	}
} );