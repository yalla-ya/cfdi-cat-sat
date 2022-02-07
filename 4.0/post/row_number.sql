DELIMITER $$
$$
CREATE DEFINER=`root`@`%` FUNCTION `ROW_NUMBER`() RETURNS int(11)
BEGIN
	SET @is_row_number_set = ( SELECT @row_number IS NOT NULL );
	IF ( @is_row_number_set OR @row_number > 100000 ) THEN 
		SET @row_number:= @row_number + 1;
    ELSE SET @row_number:= 1;
    END IF;
RETURN @row_number;
END$$

DELIMITER ;
