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
