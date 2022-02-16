
RENAME TABLE `vtiger_payment_form` TO `_z_archive_vtiger_payment_form`;
RENAME TABLE `vtiger_payment_form_seq` TO `_z_archive_vtiger_payment_form_seq`;

CREATE VIEW `vtiger_payment_form` AS ( SELECT 
	CAST( `payment_code` AS UNSIGNED ) AS `payment_formid`,
	`description` AS `payment_form`,
	CAST( `payment_code` AS UNSIGNED ) AS `sortorderid`,
	1 AS `presence`,
	NULL AS `color`
FROM `sat_cat_c_forma_pago` ); 

RENAME TABLE `vtiger_payment_method` TO `_z_archive_vtiger_payment_method`;
RENAME TABLE `vtiger_payment_method_seq` TO `_z_archive_vtiger_payment_method_seq`;

CREATE VIEW `vtiger_payment_method` AS ( SELECT 
	ROW_NUMBER() AS `payment_methodid`,
	`description` AS `payment_method`,
	0 AS `sortorderid`,
	1 AS `presence`,
	NULL AS `color`
FROM `sat_cat_c_metodo_pago` ); 


RENAME TABLE `vtiger_cfdi_use` TO `_z_archive_vtiger_cfdi_use`;
RENAME TABLE `vtiger_cfdi_use_seq` TO `_z_archive_vtiger_cfdi_use_seq`;

CREATE VIEW `vtiger_cfdi_use` AS SELECT 
	0 AS `cfdi_useid`, 
    '' AS `cfdi_use`,
	0 AS `sortorderid`,
	1 AS `presence`,
    NULL AS `color`,
    0 AS `picklist_valueid`
UNION SELECT 
	ROW_NUMBER() AS `cfdi_useid`,
	`description` AS `cfdi_use`,
	0 AS `sortorderid`,
	1 AS `presence`,
	NULL AS `color`,
	0 AS `picklist_valueid`
FROM `sat_cat_c_uso_cfdi`; 

RENAME TABLE `vtiger_fisical_status` TO `_z_archive_vtiger_fisical_status`;
RENAME TABLE `vtiger_fisical_status_seq` TO `_z_archive_vtiger_fisical_status_seq`;

CREATE VIEW `vtiger_fisical_status` AS ( SELECT 
	CAST( `tax_entity` AS UNSIGNED ) AS `fisical_statusid`,
	`description` AS `fisical_status`,
	CAST( `tax_entity` AS UNSIGNED ) AS `sortorderid`,
	1 AS `presence`,
	NULL AS `color`
FROM `sat_cat_c_regimen_fiscal` ); 


RENAME TABLE `vtiger_type` TO `_z_archive_vtiger_type`;
RENAME TABLE `vtiger_type_seq` TO `_z_archive_vtiger_type_seq`;

CREATE VIEW `vtiger_type` AS ( SELECT 
	ASCII( `document_type` ) AS `typeid`,
	`description` AS `type`,
	ASCII( `document_type` ) AS `sortorderid`,
	1 AS `presence`,
	NULL AS `color`
FROM `sat_cat_c_tipo_de_comprobante` ); 


RENAME TABLE `vtiger_cfdi_relation` TO `_z_archive_vtiger_cfdi_relation`;
RENAME TABLE `vtiger_cfdi_relation_seq` TO `_z_archive_vtiger_cfdi_relation_seq`;

CREATE VIEW `vtiger_cfdi_relation` AS SELECT 
	0 AS `cfdi_relationid`, 
    '' AS `cfdi_relation`,
	0 AS `sortorderid`,
	1 AS `presence`,
    NULL AS `color`,
    0 AS `picklist_valueid`
UNION
SELECT 
	CAST( `document_relation` AS UNSIGNED ) AS `cfdi_relationid`,
	`description` AS `cfdi_relation`,
	CAST( `document_relation` AS UNSIGNED ) AS `sortorderid`,
	1 AS `presence`,
	NULL AS `color`,
    0 AS `picklist_valueid`
FROM `sat_cat_c_tipo_relacion`; 


RENAME TABLE `vtiger_pediment_code` TO `_z_archive_vtiger_pediment_code`;
RENAME TABLE `vtiger_pediment_code_seq` TO `_z_archive_vtiger_pediment_code_seq`;

CREATE VIEW `vtiger_pediment_code` AS ( SELECT 
	CAST( `export_code` AS UNSIGNED ) AS `cfdi_pediment_codeid`,
	`description` AS `pediment_code`,
	CAST( `export_code` AS UNSIGNED ) AS `sortorderid`,
	1 AS `presence`,
	NULL AS `color`
FROM `sat_cat_c_exportacion` ); 


UPDATE vtiger_classifications, vtiger_classificationscf, sat_cat_c_clave_prod_serv
	SET vtiger_classifications.title = sat_cat_c_clave_prod_serv.description,
		vtiger_classifications.tags = sat_cat_c_clave_prod_serv.keywords,
        vtiger_classificationscf.vat_status = sat_cat_c_clave_prod_serv.iva,
		vtiger_classificationscf.tax_status = sat_cat_c_clave_prod_serv.ieps,
		vtiger_classificationscf.annex = sat_cat_c_clave_prod_serv.complement,
		vtiger_classificationscf.start_date = STR_TO_DATE( sat_cat_c_clave_prod_serv.start_date, '%d/%m/%y'),
        vtiger_classificationscf.end_date = STR_TO_DATE( sat_cat_c_clave_prod_serv.end_date, '%d/%m/%y'),
		vtiger_classificationscf.incentivized = sat_cat_c_clave_prod_serv.frontier
WHERE vtiger_classifications.classificationid = vtiger_classificationscf.classificationid
	AND sat_cat_c_clave_prod_serv.product_code = vtiger_classifications.code; 


    UPDATE vtiger_units, vtiger_unitscf, sat_cat_c_clave_unidad
	SET vtiger_units.title = sat_cat_c_clave_unidad.name,
		vtiger_units.tags = sat_cat_c_clave_unidad.keywords,
        vtiger_unitscf.description = sat_cat_c_clave_unidad.description,
		vtiger_unitscf.comment = sat_cat_c_clave_unidad.comments,
		vtiger_unitscf.symbol = sat_cat_c_clave_unidad.symbol,
		vtiger_unitscf.start_date = STR_TO_DATE( sat_cat_c_clave_unidad.start_date, '%d/%m/%y'),
        vtiger_unitscf.end_date = STR_TO_DATE( sat_cat_c_clave_unidad.end_date, '%d/%m/%y')
WHERE vtiger_units.unitid = vtiger_unitscf.unitid
	AND vtiger_units.code = sat_cat_c_clave_unidad.unit_code; 

UPDATE vtiger_units, vtiger_unitscf, sat_cat_c_clave_unidad
	SET vtiger_units.title = sat_cat_c_clave_unidad.name,
        vtiger_unitscf.description = sat_cat_c_clave_unidad.description,
		vtiger_unitscf.comment = sat_cat_c_clave_unidad.comments,
		vtiger_unitscf.symbol = sat_cat_c_clave_unidad.symbol,
		vtiger_unitscf.start_date = STR_TO_DATE( sat_cat_c_clave_unidad.start_date, '%d/%m/%y'),
        vtiger_unitscf.end_date = STR_TO_DATE( sat_cat_c_clave_unidad.end_date, '%d/%m/%y')
WHERE vtiger_units.unitid = vtiger_unitscf.unitid
	AND vtiger_units.code = sat_cat_c_clave_unidad.unit_code; 

-- UPDATE role permission to allow 0 for all existing roles
UPDATE IGNORE `vtiger_role2picklist` SET `picklistvalueid` = 0 WHERE `picklistid` IN
(
	SELECT *
    FROM `vtiger_picklist` 
    WHERE `name` 
		IN ( 'cfdi_relation',  'cfdi_use', 'fisical_status', 'payment_form', 'payment_method', 'pediment_code', 'type' )
);

REPLACE INTO `vtiger_role2picklist` ( SELECT roleid, 0, picklistid, 0 FROM `vtiger_role`, `vtiger_picklist` 
WHERE `vtiger_picklist`.`name` 
		IN ( 'cfdi_relation',  'cfdi_use', 'fisical_status', 'payment_form', 'payment_method', 'pediment_code', 'type' )
);