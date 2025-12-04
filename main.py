import http.server
import socketserver
import os
import sys
import json
import urllib.request
import urllib.parse

# --- КОНФИГУРАЦИЯ ---
PORT = 5006
DIRECTORY = os.path.dirname(os.path.abspath(__file__)) # Папка скрипта
TG_BOT_TOKEN = "8317508240:AAE2ZbUFBU2WiLm_5_Clr4hFVylsTATJ0_A"  # Вставьте токен
TG_CHAT_ID = "-1003163478361"       # Вставьте ID чата

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_POST(self):
        # Обработка отправки формы на адрес /send-order
        if self.path == '/send-order':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                self.send_to_telegram(data)
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'ok'}).encode('utf-8'))
            except Exception as e:
                print(f"Error: {e}")
                self.send_response(500)
                self.end_headers()
        else:
            self.send_error(404)

    def send_to_telegram(self, data):
        # Формируем сообщение
        msg = (
            f"🔥 <b>НОВАЯ ЗАЯВКА!</b>\n"
            f"👤 <b>Имя:</b> {data.get('name')}\n"
            f"📞 <b>Телефон:</b> {data.get('phone')}\n"
            f"📍 <b>Город:</b> {data.get('city')}\n"
            f"🎨 <b>Цвет:</b> {data.get('color')}\n"
            f"🚘 <b>Комплект:</b> {data.get('configuration')}\n"
            f"💰 <b>Сумма:</b> {data.get('total_price')} ₽"
        )
        
        if data.get('cdek_address'):
            msg += f"\n📦 <b>СДЭК:</b> {data.get('cdek_address')}"

        # Отправка через API Telegram
        url = f"https://api.telegram.org/bot{TG_BOT_TOKEN}/sendMessage"
        params = {
            'chat_id': TG_CHAT_ID,
            'text': msg,
            'parse_mode': 'HTML'
        }
        data_encoded = urllib.parse.urlencode(params).encode('utf-8')
        req = urllib.request.Request(url, data=data_encoded)
        urllib.request.urlopen(req)

if __name__ == "__main__":
    # Исправление для корректной работы путей
    os.chdir(DIRECTORY) 
    
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"🚀 Сервер запущен: http://localhost:{PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            httpd.shutdown()