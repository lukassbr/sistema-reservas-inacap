# backend/config/views.py
from django.http import HttpResponse

def home(request):
    html = """
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>INACAP | API Reservas</title>
        <style>
            body { 
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                background-color: #f8f9fa;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
            }
            .card {
                background: white;
                padding: 2.5rem;
                border-radius: 12px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                text-align: center;
                max-width: 450px;
                width: 90%;
                border-top: 6px solid #E30613; /* Rojo INACAP */
            }
            h1 { color: #E30613; margin: 0; font-size: 2.5rem; font-weight: 800; letter-spacing: -1px; }
            h2 { color: #333; margin: 10px 0 5px 0; font-size: 1.5rem; }
            p { color: #6c757d; margin-bottom: 2rem; font-size: 1.1rem; }
            
            .btn-container { display: flex; flex-direction: column; gap: 10px; }
            
            .btn {
                display: block;
                padding: 12px 20px;
                text-decoration: none;
                font-weight: 600;
                border-radius: 6px;
                transition: all 0.2s ease;
            }
            .btn-primary { background-color: #E30613; color: white; border: 2px solid #E30613; }
            .btn-primary:hover { background-color: #b90510; border-color: #b90510; }
            
            .btn-outline { background-color: transparent; color: #E30613; border: 2px solid #E30613; }
            .btn-outline:hover { background-color: #E30613; color: white; }

            .status-dot {
                display: inline-block; width: 10px; height: 10px;
                background-color: #28a745; border-radius: 50%;
                margin-right: 5px;
            }
            .footer { margin-top: 2rem; font-size: 0.85rem; color: #adb5bd; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>INACAP</h1>
            <h2>Sistema de Reservas</h2>
            <p>Servicio Backend API</p>
            
            <div style="margin-bottom: 20px; color: #28a745; font-weight: bold; background: #e6f9e9; padding: 5px 15px; border-radius: 20px; display: inline-block;">
                <span class="status-dot"></span> Sistema Operativo
            </div>

            <div class="btn-container">
                <a href="/admin/" class="btn btn-primary">Ingresar al Panel Administrativo</a>
                <a href="http://localhost:3000" class="btn btn-outline" target="_blank">Abrir Aplicación Web (Frontend)</a>
            </div>

            <div class="footer">
                API REST Framework v1.0 • Sede Temuco
            </div>
        </div>
    </body>
    </html>
    """
    return HttpResponse(html)