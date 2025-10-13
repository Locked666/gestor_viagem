from apps import db 


"""Model de frotas."""



class Fleet(db.model):
    __tablename__ = 'frota'

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable = False,  comment = "Nome do Veiculo")
    placa = db.Column(db.String(100), nullable = False, comment="Placa do veiculo ")
    marca = db.Column(db.String(100), nullable = False, comment="marca do veiculo ")
    modelo = db.Column(db.String(100), nullable = False, comment="modelo do veiculo ")
    data = db.Column(db.DateTime, default=db.func.now())


class RequestPrint(db.model):
    __tablename__ = 'impressao_requisicao'
    id = db.Column(db.Integer, primary_key=True)
    data_impressao = db.Column(db.DateTime, default=db.func.now())
    usuario = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, comment = "Usuário que realizou a impressão")
    veiculo = db.Column(db.Integer, db.ForeignKey('frotas.id'), nullable=False, comment = "Véiculo Utilizado")
    viagem = db.Column(db.Integer, db.ForeignKey('registro_viagens.id'), nullable=True, comment = "Viagem que foi impressa")
    