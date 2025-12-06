import base64

# --- КОНФИГУРАЦИЯ ---
PORT = 5006
BASE_64_TOKEN = "ODMxNzUwODI0MDpBQUUyWmJVRkJVMldpTG1fNV9DbHI0aEZWeWxzVEFUSjBfQQ=="
TG_CHAT_ID = "-1003163478361"
TG_THREAD_ID = 17

# Дешифровка токена
try:
    TG_BOT_TOKEN = base64.b64decode(BASE_64_TOKEN).decode('utf-8').strip()
    print(f"Token loaded: {TG_BOT_TOKEN[:5]}...***")
except Exception as e:
    print(f"Ошибка декодирования токена: {e}")
    exit(1)

