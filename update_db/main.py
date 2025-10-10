import os
import sqlite3
import re

DB_PATH = os.path.abspath(os.path.join("..", "apps", "db.sqlite3"))
SCRIPTS_DIR = os.path.join(os.path.dirname(__file__), "scripts")

def get_current_script_number(conn):
    """Obtém o número do último script executado."""
    cursor = conn.cursor()
    cursor.execute("SELECT n_script FROM parametros LIMIT 1;")
    row = cursor.fetchone()
    return row[0] if row else 0

def set_current_script_number(conn, n_script):
    """Atualiza o número do último script executado."""
    cursor = conn.cursor()
    cursor.execute("UPDATE parametros SET n_script = ?;", (n_script,))
    conn.commit()

def get_pending_scripts(current_n):
    """Retorna lista de scripts .sql com número maior que current_n."""
    scripts = []
    for file in os.listdir(SCRIPTS_DIR):
        if file.endswith(".sql"):
            match = re.match(r"(\d+)_.*\.sql", file)
            if match:
                script_num = int(match.group(1))
                if script_num > current_n:
                    scripts.append((script_num, file))
    return sorted(scripts)

def execute_script(conn, script_path):
    """Executa um script .sql."""
    with open(script_path, "r", encoding="utf-8") as f:
        sql = f.read()
    conn.executescript(sql)
    conn.commit()

def execute_update_db():
    """Função principal para executar scripts pendentes."""
    print("Iniciando verificação de updates no banco de dados...")
    
    if not os.path.exists(DB_PATH):
        print(f"Erro: Banco de dados não encontrado em {DB_PATH}")
        return
    
    conn = sqlite3.connect(DB_PATH)

    try:
        current_n = get_current_script_number(conn)
        print(f"Último script executado: {current_n}")
        
        pending_scripts = get_pending_scripts(current_n)
        
        if not pending_scripts:
            print("Nenhum script novo para executar.")
            return

        for script_num, script_file in pending_scripts:
            script_path = os.path.join(SCRIPTS_DIR, script_file)
            print(f"Executando script {script_file}...")
            try:
                execute_script(conn, script_path)
                set_current_script_number(conn, script_num)
                print(f"Script {script_file} executado com sucesso.")
            except Exception as e:
                print(f"Erro ao executar {script_file}: {e}")
                break  # Interrompe caso haja erro
    finally:
        conn.close()

if __name__ == '__main__':
    execute_update_db()
