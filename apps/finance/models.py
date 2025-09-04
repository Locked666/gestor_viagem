from apps import db


class MovFinanceira(db.Model):

    __tablename__ = 'mov_financeira'
    #__Mov_Financeira_FIELDS__
    id = db.Column(db.Integer, primary_key=True)
    tecnico  = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    viagem = db.Column(db.Integer, db.ForeignKey('registro_viagens.id'), nullable=True)
    
    data_lanc = db.Column(db.DateTime, default=db.func.current_timestamp())
    tipo = db.Column(db.String(2),  nullable=True)
    descricao = db.Column(db.Text, nullable=True)
    valor = db.Column(db.Float(),  nullable=True , default=0.0)

    data = db.Column(db.DateTime, nullable=True, default= db.func.current_timestamp())
    
    

    def __init__(self, **kwargs):
        super(MovFinanceira, self).__init__(**kwargs)
