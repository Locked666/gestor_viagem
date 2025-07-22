from flask import jsonify
from apps.exceptions.exception import InvalidUsage


def validadion_user(data):
    
    required_field = ['username', 'email', 'setor']
    
    for field in required_field:
        if not data.get(field):
            raise InvalidUsage(f"Campo Obrigatório faltante: {field}", status_code=400)
        
    
    

