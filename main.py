import base64
import uvicorn
import httpx
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
import os

# --- КОНФИГУРАЦИЯ ---
PORT = 5006
BASE_64_TOKEN = "ODMxNzUwODI0MDpBQUUyWmJVRkJVMldpTG1fNV9DbHI0aEZWeWxzVEFUSjBfQQ=="
TG_CHAT_ID = "-1003163478361"
TG_THREAD_ID = 17  # ID ветки (топика) в супергруппе

# Дешифровка токена при запуске
try:
    TG_BOT_TOKEN = base64.b64decode(BASE_64_TOKEN).decode('utf-8').strip()
    print(TG_BOT_TOKEN)
except Exception as e:
    print(f"Ошибка декодирования токена: {e}")
    exit(1)

# Модель данных (валидация входящего JSON)
class OrderData(BaseModel):
    name: str
    phone: str
    city: str = "Не указан"
    color: str = "Не выбран"
    configuration: str = "Стандарт"
    gift: str = "Нет"
    total_price: str | int | float
    cdek_address: Optional[str] = None

app = FastAPI()

# --- ЛОГИКА ОТПРАВКИ В TELEGRAM ---
async def send_telegram_message(data: OrderData):
    msg = (
        f"🔥 <b>НОВАЯ ЗАЯВКА!</b>\n"
        f"👤 <b>Имя:</b> {data.name}\n"
        f"📞 <b>Телефон:</b> {data.phone}\n"
        f"📍 <b>Город:</b> {data.city}\n"
        f"🎨 <b>Цвет:</b> {data.color}\n"
        f"🚘 <b>Комплект:</b> {data.configuration}\n"
        f"🎁 <b>Бонус:</b> {data.gift}\n"
        f"💰 <b>Сумма:</b> {data.total_price} ₽"
    )
    
    if data.cdek_address:
        msg += f"\n📦 <b>СДЭК:</b> {data.cdek_address}"

    url = f"https://api.telegram.org/bot{TG_BOT_TOKEN}/sendMessage"
    
    payload = {
        "chat_id": TG_CHAT_ID,
        "text": msg,
        "parse_mode": "HTML",
        "message_thread_id": TG_THREAD_ID  # <-- Пишем в конкретную ветку
    }

    # trust_env=False заставляет игнорировать настройки системного прокси
    async with httpx.AsyncClient(trust_env=False) as client: 
        response = await client.post(url, json=payload)
        # Логируем ответ от ТГ для отладки
        if response.status_code != 200:
            print(f"Ошибка Telegram API: {response.text}")

# --- API ЭНДПОИНТЫ ---

@app.post("/send-order")
async def handle_order(order: OrderData):
    """Принимает JSON, валидирует и отправляет в ТГ"""
    try:
        await send_telegram_message(order)
        return {"status": "ok", "message": "Заявка отправлена"}
    except Exception as e:
        print(f"Ошибка сервера: {e}")
        return JSONResponse(status_code=500, content={"status": "error", "detail": str(e)})

# Подключаем раздачу статических файлов (index.html, css и т.д.)
# Важно: это должно быть ПОСЛЕ объявления API методов, чтобы /send-order не перекрылся файлом
current_dir = os.path.dirname(os.path.abspath(__file__))
app.mount("/", StaticFiles(directory=current_dir, html=True), name="static")

if __name__ == "__main__":
    print(f"🚀 FastAPI сервер запущен: http://localhost:{PORT}")
    # reload=True позволяет серверу перезагружаться при изменении кода (удобно для разработки)
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)