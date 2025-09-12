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
    
    
    

#__MODELS__END
