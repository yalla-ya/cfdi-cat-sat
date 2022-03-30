<?php

declare(strict_types=1);

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

    public static function check( $value, $catalog, $return = 'code' ) {
        define( 'CFDICAT_ROOT', dirname( dirname( __FILE__ ) ) );

        print $CFDICAT_ROOT;
    }

}