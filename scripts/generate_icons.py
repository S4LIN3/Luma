import os
import struct
import zlib
import math

def create_png(width, height, file_path):
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    
    # Generate image raw rows (RGBA)
    raw_data = bytearray()
    center_x = width / 2.0
    center_y = height / 2.0
    radius = min(width, height) * 0.45
    
    for y in range(height):
        raw_data.append(0)  # Filter type 0 (None)
        for x in range(width):
            dx = x - center_x
            dy = y - center_y
            dist = math.sqrt(dx*dx + dy*dy)
            
            if dist < radius:
                # Gradient background from deep violet to luminous cyan/indigo
                t = (x + y) / (width + height)
                r = int(120 + 80 * math.sin(t * 3.14))
                g = int(80 + 120 * math.cos(t * 3.14))
                b = int(240 - 30 * t)
                
                # Draw minimal inner glowing crescent or dot
                inner_dist = math.sqrt((dx - radius*0.2)**2 + (dy - radius*0.2)**2)
                if inner_dist < radius * 0.35:
                    r += 100
                    g += 120
                    b = 255
                    
                r = max(0, min(255, r))
                g = max(0, min(255, g))
                b = max(0, min(255, b))
                a = 255
            elif dist < radius + 1.5:
                # Anti-aliasing edge
                factor = 1.0 - (dist - radius) / 1.5
                r = 130
                g = 100
                b = 240
                a = int(255 * max(0.0, min(1.0, factor)))
            else:
                r, g, b, a = 0, 0, 0, 0
                
            raw_data.extend([max(0, min(255, r)), max(0, min(255, g)), max(0, min(255, b)), max(0, min(255, a))])

    def chunk(chunk_type, data):
        c = chunk_type + data
        crc = zlib.crc32(c) & 0xffffffff
        return struct.pack(">I", len(data)) + c + struct.pack(">I", crc)

    png_bytes = bytearray(b"\x89PNG\r\n\x1a\n")
    # IHDR
    ihdr_data = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    png_bytes.extend(chunk(b"IHDR", ihdr_data))
    
    # IDAT
    compressed = zlib.compress(bytes(raw_data), 9)
    png_bytes.extend(chunk(b"IDAT", compressed))
    
    # IEND
    png_bytes.extend(chunk(b"IEND", b""))
    
    with open(file_path, "wb") as f:
        f.write(png_bytes)
    print(f"Created {file_path} ({width}x{height})")

def create_ico(png_path_32, ico_path):
    # Pack a 32x32 PNG as a single-image Windows ICO
    with open(png_path_32, "rb") as f:
        png_data = f.read()
    
    # ICONDIR
    ico_bytes = bytearray(struct.pack("<HHH", 0, 1, 1))
    # ICONDIRENTRY (width=32, height=32, colors=0, reserved=0, planes=1, bpp=32, size, offset)
    offset = 6 + 16
    entry = struct.pack("<BBBBHHII", 32, 32, 0, 0, 1, 32, len(png_data), offset)
    ico_bytes.extend(entry)
    ico_bytes.extend(png_data)
    
    with open(ico_path, "wb") as f:
        f.write(ico_bytes)
    print(f"Created {ico_path}")

def create_icns(png_path_256, icns_path):
    # Minimal ICNS header with ic08 chunk (256x256 PNG)
    with open(png_path_256, "rb") as f:
        png_data = f.read()
    
    chunk_type = b"ic08" # 256x256 png
    chunk_len = 8 + len(png_data)
    total_len = 8 + chunk_len
    
    icns_bytes = bytearray(b"icns") + struct.pack(">I", total_len)
    icns_bytes.extend(chunk_type + struct.pack(">I", chunk_len))
    icns_bytes.extend(png_data)
    
    with open(icns_path, "wb") as f:
        f.write(icns_bytes)
    print(f"Created {icns_path}")

if __name__ == "__main__":
    icons_dir = "src-tauri/icons"
    os.makedirs(icons_dir, exist_ok=True)
    create_png(32, 32, f"{icons_dir}/32x32.png")
    create_png(128, 128, f"{icons_dir}/128x128.png")
    create_png(256, 256, f"{icons_dir}/128x128@2x.png")
    create_png(512, 512, f"{icons_dir}/icon.png")
    create_ico(f"{icons_dir}/32x32.png", f"{icons_dir}/icon.ico")
    create_icns(f"{icons_dir}/128x128@2x.png", f"{icons_dir}/icon.icns")
