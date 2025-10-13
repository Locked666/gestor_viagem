/* Adiciona a coluna supply_request na tabela USERS*/
ALTER TABLE USERS add COLUMN supply_request BOOLEAN DEFAULT FALSE;

UPDATE USERS SET supply_request = FALSE  WHERE supply_request IS NULL; 
