import cv2
import numpy as np
import requests
import time

# --- CONFIGURACIÓN ---
# URL de tu overlay (donde enviaremos los datos)
# Nota: Para esto necesitarías un pequeño servidor web (como Node.js) 
# o usar un archivo local que 'escuche' cambios.
OVERLAY_URL = "http://localhost:3000/api/pick" 

# Definir las regiones de la pantalla (ROI - Region of Interest) 
# donde aparecen los nombres de los héroes en la fase de draft de MLBB.
# Estos valores dependen de tu resolución de pantalla (ej. 1920x1080)
PLAYER_REGIONS = [
    {"id": "left_0", "x": 100, "y": 200, "w": 150, "h": 50},
    {"id": "left_1", "x": 100, "y": 300, "w": 150, "h": 50},
    # ... y así para los 10 jugadores
]

def capture_screen():
    # Simulación: Captura la pantalla actual (usando mss o similar en un script real)
    # Por ahora, abrimos la webcam o un video de prueba.
    cap = cv2.VideoCapture(0) 
    
    while True:
        ret, frame = cap.read()
        if not ret: break

        for region in PLAYER_REGIONS:
            # Recortar la zona del nombre del héroe
            roi = frame[region['y']:region['y']+region['h'], region['x']:region['x']+region['w']]
            
            # Procesamiento de imagen para mejorar lectura (Gris -> Threshold)
            gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
            _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)

            # --- AQUÍ ENTRARÍA OCR (Tesseract) ---
            # texto = pytesseract.image_to_string(thresh)
            # if "LING" in texto.upper():
            #     requests.post(OVERLAY_URL, json={"team": "left", "index": 0, "hero": "LING"})

            cv2.imshow(region['id'], thresh)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

print("Iniciando 'Ojo de Águila' para MLBB...")
# capture_screen() # Descomentar para ejecutar si tienes Python y OpenCV instalados
