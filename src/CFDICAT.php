<?php

declare(strict_types=1);

namespace CFDICAT;

class CFDICAT {

    public static function check( $value, $catalog, $return = 'code' ) {
        define( 'CFDICAT_ROOT', dirname( dirname( __FILE__ ) ) );

        print $CFDICAT_ROOT;
    }

}