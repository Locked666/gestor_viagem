# app/socketio_instance.py
from flask_socketio import SocketIO

# Pode forçar o modo threading se quiser evitar problemas com eventlet no início
socketio = SocketIO(cors_allowed_origins="*", async_mode="threading")
