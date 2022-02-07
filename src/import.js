#!/usr/bin/env node

import fs from 'fs';
import mysql from 'mysql';
import fastcsv from 'fast-csv';
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers';
import { exit } from 'process';
import Importer from 'mysql-import';

const version = "4.0";
const argv = yargs( hideBin( process.argv ) ).argv;

const DB_HOST = argv[ 'host' ] ? argv[ 'host' ] : process.env.DB_HOST;
const DB_PORT = argv[ 'port' ] ? argv[ 'port' ] : process.env.DB_PORT;
const DB_USERNAME = argv[ 'username' ] ? argv[ 'username' ] : process.env.DB_USERNAME;
const DB_PASSWORD = argv[ 'password' ] ? argv[ 'password' ] : process.env.DB_PASSWORD;
const DB_NAME = argv[ 'db' ] ? argv[ 'db' ] : process.env.DB_NAME;

const pkey = argv[ 'pkey' ] ? argv[ 'pkey' ] === "true" : true;
const truncate = argv[ 'truncate' ] ? argv[ 'truncate' ] === "true" : false;
const post = argv[ 'post' ] ? argv[ 'post' ] : null;

var table = argv.table ? argv.table : null;
if ( !table && !post ) {
    console.log( "Table name is required with --table table or run post sql --post scriptname" );
    exit( 1 );
} 

var filename = !post ? ( argv.in ? argv.in : version + '/csv/' + table + '.sql.csv' ) : null;
if ( !filename && !post ) {
    console.log( "Filename is required with --in filename.csv or run post sql --post scriptname" );
    exit( 1 );
} 

let table_prefix = argv[ 'prefix' ] ? argv[ 'prefix' ] : 'sat_cat';
table_prefix = table_prefix ? table_prefix + '_' : '';

const connection = mysql.createConnection( {
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_NAME,
    multipleStatements: true
} );

let csvData = [];
let csvStream = fastcsv
  .parse()
  .on( 'data', function( data ) {
    csvData.push( data );
  } )
  .on( 'end', function() {
    var headers = csvData[ 0 ];
    if ( !headers || headers.length == 0 ) exit( 0 );
    var first = csvData[ 1 ];
    csvData.shift();
    var table_name = table_prefix + table;
    let sql = "CREATE TABLE IF NOT EXISTS `" + table_name + "` ( ";
    for( var i = 0; i < headers.length; i++ ) {
        if ( i > 0 ) sql += ',';
        var column_name = headers[ i ];
        var column_type = column_name == 'keywords' ? 'TEXT' : 'VARCHAR(255)';
        sql += '`' + column_name + '` ' + column_type + ( i == 0 && pkey ? ' PRIMARY KEY' : '' );
    }
    sql += " );"
    console.log( "Running create if no exist table: " + sql );
    connection.query( sql, [], ( error, response ) => {
        if ( error ) {
            console.log( error );
            exit( 0 );
        }
        let query = "";
        if ( !pkey || truncate ) {
            query += "TRUNCATE " + table_name + ";";
        }
        console.log( "Running"  + ( query ? " " + query + " and then " : "" ) + " INSERT/REPLACE to table: " + table_name + " with " + csvData.length + " records." );
        query += "REPLACE INTO " + table_name + " ( `" + headers.join( '`,`') + "` ) VALUES ?;";
        connection.query( query, [ csvData ], ( error, response ) => {
            if ( error ) console.log( 'Error: ', error );
            exit( 0 );
        } );
    } );
  } );

connection.connect( ( error ) => {
    if ( error ) {
        console.error( error );
       // exit( 0 );
    } else {
        if ( filename ) {
            let stream = fs.createReadStream( filename );
            stream.pipe( csvStream );
        }
        if ( post ) {
            let sql = version + '/post/' + post + '.sql';
            const importer = new Importer( { 
                host: DB_HOST,
                port: DB_PORT,
                user: DB_USERNAME,
                password: DB_PASSWORD,
                database: DB_NAME,
             } );
             importer.import( sql ).then( () => {
                var files_imported = importer.getImported();
                console.log( `${files_imported.length} SQL file(s) imported.` );
                exit( 0 );
              } ).catch( err => {
                console.error( err );
                exit( 1 );
              } );
        }



    }
    //exit( 1 );
} );
