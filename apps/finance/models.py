from apps import db


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
