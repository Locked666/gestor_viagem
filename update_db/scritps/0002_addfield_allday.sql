PRAGMA foreign_keys = 0;

CREATE TABLE sqlitestudio_temp_table AS SELECT *
                                          FROM registro_viagens;

DROP TABLE registro_viagens;

CREATE TABLE registro_viagens (
    id               INTEGER       NOT NULL,
    entidade_destino INTEGER       NOT NULL,
    data_inicio      DATETIME,
    data_fim         DATETIME,
    status           VARCHAR (100),
    tipo_viagem      VARCHAR (100),
    local_viagem     VARCHAR (100),
    descricao        VARCHAR (100),
    veiculo          VARCHAR (100),
    placa            VARCHAR (100),
    km_inicial       VARCHAR (100),
    km_final         VARCHAR (100),
    n_combustivel    VARCHAR (100),
    total_gasto      FLOAT,
    usuario          INTEGER,
    ativo            BOOLEAN,
    data             DATETIME,
    dia_todo         BOOLEAN,
    PRIMARY KEY (
        id
    ),
    FOREIGN KEY (
        entidade_destino
    )
    REFERENCES entidades (id),
    FOREIGN KEY (
        usuario
    )
    REFERENCES users (id) 
);

INSERT INTO registro_viagens (
                                 id,
                                 entidade_destino,
                                 data_inicio,
                                 data_fim,
                                 status,
                                 tipo_viagem,
                                 local_viagem,
                                 descricao,
                                 veiculo,
                                 placa,
                                 km_inicial,
                                 km_final,
                                 n_combustivel,
                                 total_gasto,
                                 usuario,
                                 ativo,
                                 data
                             )
                             SELECT id,
                                    entidade_destino,
                                    data_inicio,
                                    data_fim,
                                    status,
                                    tipo_viagem,
                                    local_viagem,
                                    descricao,
                                    veiculo,
                                    placa,
                                    km_inicial,
                                    km_final,
                                    n_combustivel,
                                    total_gasto,
                                    usuario,
                                    ativo,
                                    data
                               FROM sqlitestudio_temp_table;

DROP TABLE sqlitestudio_temp_table;

PRAGMA foreign_keys = 1;
