# -*- encoding: utf-8 -*-
"""
Copyright (c) 2019 - present AppSeed.us
"""

from email.policy import default
from apps import db
from sqlalchemy.exc import SQLAlchemyError
from apps.exceptions.exception import InvalidUsage
import datetime as dt
from sqlalchemy.orm import relationship
from enum import Enum
from .authentication.models import Users

class CURRENCY_TYPE(Enum):
    usd = 'usd'
    eur = 'eur'
    brl = 'brl'


#__MODELS__
# class Usuarios(db.Model):
#     __tablename__= 'usuarios'

#     id = db.Column(db.Integer, primary_key=True)
#     usuario = db.Column(db.String(100), nullable=False)
#     senha = db.Column(db.String(1000), nullable=True)
#     acesso = db.Column(db.String(100))
#     email = db.Column(db.String(100))
#     foto = db.Column(db.String(1000), comment='Caminho da foto do usuário')
#     setor = db.Column(db.String(100))
#     admin = db.Column(db.Boolean, default=False)
#     diaria = db.Column(db.Boolean, default=True)
#     ativo = db.Column(db.Boolean, default=True)
#     data = db.Column(db.DateTime, default=db.func.now())

#     #__Usuario_FIELDS__END

#     def __init__(self, **kwargs):
#         super(Usuarios, self).__init__(**kwargs)


class Entidades(db.Model):
    __tablename__ = 'entidades'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    data = db.Column(db.DateTime)
    tipo = db.Column(db.String(100))
    ativo = db.Column(db.Boolean, default=True)

    #__Entidades_FIELDS__END

    def __init__(self, **kwargs):
        super(Entidades, self).__init__(**kwargs)


class RegistroViagens(db.Model):
    __tablename__ = 'registro_viagens'

    id = db.Column(db.Integer, primary_key=True)
    entidade_destino = db.Column(db.Integer,db.ForeignKey('entidades.id') ,nullable=False)
    data_inicio = db.Column(db.DateTime)
    data_fim = db.Column(db.DateTime)
    tipo_viagem = db.Column(db.String(100))
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
    # Na model RegistroViagens

    # usuario_rel = db.relationship('Usuarios', backref='viagens', lazy='joined', foreign_keys=[usuario])

    #__Registro_Viagens_FIELDS__END

    def __init__(self, **kwargs):
        super(RegistroViagens, self).__init__(**kwargs)
    

    def __repr__(self):
        return f"{self.entidade_destino} / ${self.n_diaria}"

    @classmethod
    def find_by_id(cls, _id: int) -> "RegistroViagens":
        return cls.query.filter_by(id=_id).first() 

    @classmethod
    def get_list(cls):
        return cls.query.all()

    def save(self) -> None:
        try:
            db.session.add(self)
            db.session.commit()
        except SQLAlchemyError as e:
            db.session.rollback()
            db.session.close()
            error = str(e.__dict__['orig'])
            raise InvalidUsage(error, 422)

    def delete(self) -> None:
        try:
            db.session.delete(self)
            db.session.commit()
        except SQLAlchemyError as e:
            db.session.rollback()
            db.session.close()
            error = str(e.__dict__['orig'])
            raise InvalidUsage(error, 422)
        return    


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


class MovFinanceira(db.Model):

    __tablename__ = 'mov_financeira'
    #__Mov_Financeira_FIELDS__
    id = db.Column(db.Integer, primary_key=True)
    usuario = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    viagem = db.Column(db.Integer, db.ForeignKey('registro_viagens.id'), nullable=True)
    data = db.Column(db.DateTime, default=db.func.current_timestamp())
    #__Mov_Financeira_FIELDS__END

    def __init__(self, **kwargs):
        super(MovFinanceira, self).__init__(**kwargs)


class MovFinanceiraDetalhe(db.Model):

    __tablename__ = 'mov_financeira_detalhe'

    id = db.Column(db.Integer, primary_key=True)

    #__Mov_Financeira_Detalhe_FIELDS__
    mov_financeira = db.Column(db.Integer, db.ForeignKey('mov_financeira.id'), nullable=False)
    valor = db.Column(db.String(255),  nullable=True)
    data_lanc = db.Column(db.DateTime, default=db.func.current_timestamp())
    tipo = db.Column(db.String(255),  nullable=True)
    descricao = db.Column(db.Text, nullable=True)
    usuario = db.Column(db.DateTime, default=db.func.current_timestamp())

    #__Mov_Financeira_Detalhe_FIELDS__END

    def __init__(self, **kwargs):
        super(MovFinanceiraDetalhe, self).__init__(**kwargs)



#__MODELS__END
