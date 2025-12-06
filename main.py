import base64
import os
import json
import uvicorn
from fastapi import FastAPI, Request, Response
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
import httpx

# --- КОНФИГУРАЦИЯ ---
PORT = 5006
# Закодированный токен бота
BASE_64_TOKEN = "ODMxNzUwODI0MDpBQUUyWmJVRkJVMldpTG1fNV9DbHI0aEZWeWxzVEFUSjBfQQ=="
TG_CHAT_ID = "-1003163478361"
TG_THREAD_ID = 17  # ID темы (топика) в супергруппе

# Дешифровка токена
try:
    TG_BOT_TOKEN = base64.b64decode(BASE_64_TOKEN).decode('utf-8').strip()
    print(f"Token loaded: {TG_BOT_TOKEN[:5]}...***")
except Exception as e:
    print(f"Ошибка декодирования токена: {e}")
    exit(1)

# --- МОДЕЛИ ДАННЫХ ---
class OrderData(BaseModel):
    name: str
    phone: str
    city: str = "Не выбран"
    color: str = "Стандарт"
    configuration: str = "Нет"
    gift: str = "Нет"
    total_price: str = "0"
    # Дополнительные поля для отладки, если понадобятся
    cdek_address: Optional[str] = None

# --- ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ ---
app = FastAPI()

# --- MIDDLEWARE (ЗАЩИТА) ---
@app.middleware("http")
async def block_py_files(request: Request, call_next):
    """
    Блокирует доступ к файлам .py, .pyc и .env через браузер
    для безопасности исходного кода.
    """
    path = request.url.path.lower()
    if path.endswith(".py") or path.endswith(".pyc") or path.endswith(".env"):
        return Response("Access denied", status_code=403)
    
    response = await call_next(request)
    return response

# --- ЛОГИКА TELEGRAM ---
async def send_telegram_message(order: OrderData):
    """Отправляет отформатированное сообщение в Telegram"""
    message_text = (
        f"🔥 <b>НОВАЯ ЗАЯВКА!</b>\n"
        f"👤 <b>Имя:</b> {order.name}\n"
        f"📞 <b>Телефон:</b> {order.phone}\n"
        f"📍 <b>Город:</b> {order.city}\n"
        f"🎨 <b>Цвет:</b> {order.color}\n"
        f"🚙 <b>Комплект:</b> {order.configuration}\n"
        f"🎁 <b>Бонус:</b> {order.gift}\n"
        f"💰 <b>Сумма:</b> {order.total_price} руб."
    )

    url = f"https://api.telegram.org/bot{TG_BOT_TOKEN}/sendMessage"
    
    payload = {
        "chat_id": TG_CHAT_ID,
        "text": message_text,
        "parse_mode": "HTML",
        "message_thread_id": TG_THREAD_ID
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload, timeout=10.0)
            if response.status_code != 200:
                print(f"⚠️ Ошибка Telegram API ({response.status_code}): {response.text}")
        except Exception as e:
            print(f"⚠️ Ошибка соединения с Telegram: {e}")

# --- API ЭНДПОИНТЫ ---
@app.post("/send-order")
async def handle_order(order: OrderData):
    """Принимает заявку с сайта и отправляет в Telegram"""
    try:
        await send_telegram_message(order)
        # Возвращаем имя для модального окна на фронтенде
        return {"status": "ok", "message": "Заявка отправлена", "name": order.name}
    except Exception as e:
        print(f"Server Error: {e}")
        return JSONResponse(
            status_code=500, 
            content={"status": "error", "detail": "Ошибка сервера при обработке заявки"}
        )

# --- СТАТИЧЕСКИЕ ФАЙЛЫ ---
# Важно: монтируем статику ПОСЛЕ API маршрутов, чтобы не перехватывать их.
# html=True позволяет открывать index.html просто перейдя в корень сайта.
current_dir = os.path.dirname(os.path.abspath(__file__))
app.mount("/", StaticFiles(directory=current_dir, html=True), name="static")

# --- ТОЧКА ВХОДА ---
if __name__ == "__main__":
    print(f"🚀 Сервер запущен: http://localhost:{PORT}")
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=PORT, 
        reload=True
    )