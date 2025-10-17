# -*- encoding: utf-8 -*-
"""
Copyright (c) 2019 - present AppSeed.us
"""

# from email.policy import default
from apps import db
# from sqlalchemy.exc import SQLAlchemyError
# from apps.exceptions.exception import InvalidUsage
# import datetime as dt
# from sqlalchemy.orm import relationship
from enum import Enum
# from .authentication.models import Users

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


class Parametros(db.Model):
    __tablename__ = 'parametros'
    
    id = db.Column(db.Integer, primary_key = True)
    
    valor_diaria = db.Column(db.Float, comment = "Valor padrão da diária")
    supervisor =  db.Column(db.String(100), comment= "supervisor")
    n_script = db.Column(db.Integer, default=0, comment="Número do último script executado")
    
# class Notify(db.model):
#     __tablename__ = 'notificacoes'
    
#     id = db.Column(db.Integer, primary_key = True)
    
#     user = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
#     viagem = db.Column(db.Integer, db.ForeignKey('registro_viagens.id'), nullable=True)
#     tipo = db.Column(db.String(50), nullable=False, comment= "tipo de notificação, ex: altered, new_travel, canceled")
#     mensagem = db.Column(db.String(255), nullable=False)
#     is_read = db.Column(db.Boolean, default=False)
#     timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())
    
#     user = db.relationship('Users', backref=db.backref('notifications', lazy=True))    
    

#__MODELS__END
