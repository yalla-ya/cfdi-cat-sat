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

    public $version = '4.0';

    public static function check( $value, $catalog, $return = true, $version = null ) {
        if ( $version == null ) $version = isset( $_ENV[ 'CFDI_VERSION' ] ) ? $_ENV[ 'CFDI_VERSION' ] : self::$version ;
        $file = dirname( __FILE__ ) . '/../' . $version . '/json/' . self::decamelize( $catalog ) .'.t.json';
        $catalog = json_decode( file_get_contents( $file ), true );
        $keys = array_keys( $catalog[ 0 ] );
        if ( $return !== true && is_numeric( $return ) ) $return = $keys[ $return ];
        $needle = self::find( $catalog, $value, $keys[ 0 ], $keys[ 1 ] );
        return( $return === 'both' 
            ? $needle[ $keys[ 0 ] ] . ' ' . $needle[ $keys[ 1 ] ] 
            : $needle[ $return === true ? $keys[ 0 ] : $return ] );
    }


    public static function decamelize( $string ) {
        return( str_replace( '__', '_', ltrim( strtolower( preg_replace( '/[A-Z]([A-Z](?![a-z]))*/', '_$0', $string ) ), '_' ) ) );
    }
    
    public static function find( $array, $value, $field1 = null, $field2 = null ) {
        foreach ( $array as $indx => $values ) {
            if ( $field1 == null && $field2 == null ){
                if ( $index == $indx ) return( $values );
            }
            if ( $field1 
                && ( ( is_numeric( $values[ $field1 ] ) &&
                    $values[ $field1 ] == $value
                    ) 
                    || strtolower( trim( $values[ $field1 ] ) ) == strtolower( trim( $value ) )
                ) ) {
                return( $values );
            }
            if ( $field2 
                && ( ( is_numeric( $values[ $field2 ] ) &&
                    $values[ $field2 ] == $value
                    ) 
                    || strtolower( trim( $values[ $field2 ] ) ) == strtolower( trim( $value ) )
                ) ) {
                return( $values );
            }
        }
        return( false );
    }

}
