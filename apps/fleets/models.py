from apps import db 


"""Model de frotas."""



class Fleet(db.model):
    __tablename__ = 'Frotas'

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable = False,  comment = "Nome do Veiculo")
    placa = db.Column(db.String(100), nullable = False, comment="Placa do veiculo ")
    marca = db.Column(db.String(100), nullable = False, comment="marca do veiculo ")
    modelo = db.Column(db.String(100), nullable = False, comment="modelo do veiculo ")
    data = db.Column(db.DateTime, default=db.func.now())

