import jwt
from datetime import datetime, timedelta
from config import Config

SECRET_KEY = Config.SECRET_KEY

def gerar_token(payload):
    token = jwt.encode(
        {
            **payload,
            "exp": datetime.utcnow() + timedelta(minutes=10)
        },
        SECRET_KEY,
        algorithm="HS256"
    )
    return token
