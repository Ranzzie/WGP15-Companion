# WGP15 Controller Companion

Aplikasi pendamping (Companion & Visualizer Web App) untuk **Fantech EOS Pro WGP15** (SoC ZhiXu ZXD2055, Firmware v1.56).

## Fitur Utama
1. **Interactive Controller Visualizer**:
   - Layout fisik asimetris Xbox (Stick kiri atas, D-Pad bawah, ABXY kanan).
   - Real-time highlight untuk semua tombol: ABXY, D-Pad, Bumper LB/RB, View, Menu, Home, Turbo, L3, R3, dan pedal belakang M1/M2.
2. **Stick Circularity & Deadzone Benchmark (Hall Effect)**:
   - Radar koordinat 360° analog stick kiri dan kanan via Canvas 60–120 FPS.
   - Penghitungan otomatis *Average Error %* dan *Max Error %* saat analog diputar mentok ke pinggir.
   - Indikator cincin batas deadzone (5% threshold).
3. **Trigger Travel & Hair-Trigger Lock Gauge**:
   - Pembacaan linear kedalaman tarikan trigger L2/R2 (0.000 – 1.000).
   - Deteksi otomatis status *Physical Hair-Trigger Lock*.
4. **Dual-Rumble Motor Tester**:
   - Uji getar motor fisik: *Soft (30%)*, *Medium (70%)*, *Heavy (100%)*, dan *Pulse Wave* via Web Vibration Actuator API.
5. **Tactical Profile (Tekken 8 Setup)**:
   - Rekomendasi binding tombol Tekken: M1 (`1+2` Throw/Heat Burst), M2 (`3+4` Stance), cross-diagonal (`1+4`, `2+3`), dan input gerak Hadouken/KBD.
6. **WGP15 Onboard Hardware Cheat-Sheet (FW v1.5)**:
   - Panduan praktis kombinasi tombol fisik perangkat keras WGP15 untuk rekam Macro, kalibrasi, swap D-pad, swap layout XYAB, toggle circularity Radial/Pinwheel, dan mode Gyro.

## Cara Menjalankan

### Opsi 1: Docker Compose (Direkomendasikan)
```bash
# Salin konfigurasi environment
cp .env.example .env

# Jalankan container
docker compose up -d
```
Akses web UI melalui browser: `http://localhost:8090`

### Opsi 2: Python Langsung (Standalone)
```bash
python3 server.py
```
Buka browser pada `http://localhost:8090`.

## Penggunaan
1. Hubungkan controller Fantech EOS Pro WGP15 via Kabel USB, Dongle 2.4 GHz, atau Bluetooth.
2. Buka dashboard di browser (Chrome / Brave / Firefox).
3. Tekan salah satu tombol di controller agar browser mengaktifkan Gamepad API.
