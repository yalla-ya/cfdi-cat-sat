<?php

/**
 * Original Code by yalla ya! (c) 2008 - 2022
 * All Rights Reserved
 *
 * Certificado Fiscal Digital por Internet
 * @version 4.0
 * @package CFDI
 * @copyright 2008-2022 yalla ya! S.A. de C.V. Tlaxcala 106 Col. Roma Sur, Mexico DF 06760
 */

namespace CFDICAT;

class CFDICAT {

    public static function check( $value, $catalog, $return = true, $version = null ) {
        if ( $version == null ) $version = $_ENV[ 'CFDI_VERSION' ];
        $file = dirname( __FILE__ ) . '/../' . $version . '/json/' . self::decamelize( $catalog ) .'.t.json';
        $catalog = json_decode( file_get_contents( $file ), true );
        if ( $return === true ) {
            $return = array_keys( $catalog[ 0 ] )[ 0 ];
        }
        $keys = array_column( $catalog, $return );
        if ( !count( $keys ) ) return( null );
        $key = array_search( $value, $keys );
        if ( $key === false ) return( null );
        return( $catalog[ $key ][ $return ] );
    }


    public static function decamelize( $string ) {
        return( str_replace( '__', '_', ltrim( strtolower( preg_replace( '/[A-Z]([A-Z](?![a-z]))*/', '_$0', $string ) ), '_' ) ) );
    }
    
}
