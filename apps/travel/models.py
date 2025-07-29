from apps import db
from sqlalchemy.exc import SQLAlchemyError, IntegrityError


class RegistroViagens(db.Model):
    __tablename__ = 'registro_viagens'

    id = db.Column(db.Integer, primary_key=True)
    entidade_destino = db.Column(db.Integer,db.ForeignKey('entidades.id') ,nullable=False)
    data_inicio = db.Column(db.DateTime)
    data_fim = db.Column(db.DateTime)
    tipo_viagem = db.Column(db.String(100))
    local_viagem = db.Column(db.String(100), comment='Local da viagem')
    n_diaria = db.Column(db.String(100), comment='Número da diária')
    v_diaria = db.Column(db.Float, comment='Valor da diária')
    descricao = db.Column(db.String(100))
    n_intranet = db.Column(db.String(100), comment='Número da visita na intranet', default='0')
    veiculo = db.Column(db.String(100), comment='veículo')
    placa = db.Column(db.String(100), comment='Placa do veículo')
    km_inicial = db.Column(db.String(100), comment='KM inicial')
    km_final = db.Column(db.String(100), comment='KM final')
    n_combustivel = db.Column(db.String(100), comment='Número do combustível')
    total_gasto = db.Column(db.Float, comment='Total gasto na viagem', default=0.0)
    usuario = db.Column(db.Integer, db.ForeignKey('users.id'), comment='ID do usuário que registrou a viagem')
    ativo = db.Column(db.Boolean, default=True)
    data = db.Column(db.DateTime, default=db.func.now())

    entidade_rel = db.relationship('Entidades', backref='viagens', lazy='joined')
    usuario_rel = db.relationship('Users', backref='viagens', lazy='joined')
    
class TecnicosViagens(db.Model):
    __tablename__ = 'tecnicos_viagens'
    id = db.Column(db.Integer, primary_key=True)
    viagem = db.Column(db.Integer, db.ForeignKey('registro_viagens.id'), nullable=False)
    tecnico = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    data = db.Column(db.DateTime, default=db.func.now())
    
    
    

class GastosViagens(db.Model):
    __tablename__ = 'gastos_viagens'
    id = db.Column(db.Integer, primary_key=True)
    viagem = db.Column(db.Integer,db.ForeignKey('registro_viagens.id') ,nullable=False)
    data_gasto = db.Column(db.DateTime, default=db.func.now(), comment='Data do gasto')
    tipo_gasto = db.Column(db.String(100))
    n_documento = db.Column(db.String(100), comment='Número do documento')
    tipo_documento = db.Column(db.String(100), comment='Tipo do documento')
    descricao = db.Column(db.String(100))
    valor = db.Column(db.Float)   
    arquivo = db.Column(db.Integer, db.ForeignKey('documentos_viagens.id'), comment='ID do arquivo')
    ativo = db.Column(db.Boolean, default=True)
    estorno = db.Column(db.Boolean, default=False, comment='Se o gasto tem que ser estornado')
    status = db.Column(db.String(100), default='Pendente', comment='Status do gasto (Pendente, Aprovado, Rejeitado, Parcial)')
    motivo = db.Column(db.String(255), comment='Motivo da rejeição do gasto')
    valor_atual = db.Column(db.Float, default=0.0, comment='Valor atual do gasto após possíveis alterações')
    usuario = db.Column(db.Integer, db.ForeignKey('users.id'), comment='ID do usuário que alterou o gasto')
    
    data = db.Column(db.DateTime, default=db.func.now())   

    #__Gastos_Viagens_FIELDS__END

    def __init__(self, **kwargs):
        super(GastosViagens, self).__init__(**kwargs)


class DocumentosViagens(db.Model):
    __tablename__ = 'documentos_viagens'
    id = db.Column(db.Integer, primary_key=True)
    tipo = db.Column(db.String(100), comment='Tipo do documento')
    data = db.Column(db.DateTime, default=db.func.now())
    arquivo = db.Column(db.String(300)) # Caminho do arquivo.

    #__Documento_Viagens_FIELDS__END

    def __init__(self, **kwargs):
        super(DocumentosViagens, self).__init__(**kwargs)

