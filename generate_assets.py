import struct
import zlib
import math

def save_png(filename, width, height, pixels):
    """
    pixels is a list of bytearray/bytes or 2D array of (r, g, b, a)
    """
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0) # filter byte: none
        for x in range(width):
            r, g, b, a = pixels[y][x]
            raw_data.extend((r, g, b, a))
            
    compressed = zlib.compress(bytes(raw_data), 9)
    
    def chunk(tag, data):
        c = struct.pack(">I", len(data)) + tag + data
        crc = zlib.crc32(tag + data) & 0xffffffff
        return c + struct.pack(">I", crc)

    png = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    png += chunk(b"IHDR", ihdr)
    png += chunk(b"IDAT", compressed)
    png += chunk(b"IEND", b"")
    
    with open(filename, "wb") as f:
        f.write(png)
    print(f"Generated {filename} ({width}x{height})")

def draw_rounded_rect(canvas, x0, y0, w, h, r, color):
    # color = (R, G, B, A)
    x1 = x0 + w
    y1 = y0 + h
    for y in range(len(canvas)):
        for x in range(len(canvas[0])):
            if x0 <= x < x1 and y0 <= y < y1:
                # check corners
                inside = True
                if x < x0 + r and y < y0 + r:
                    dx = x - (x0 + r)
                    dy = y - (y0 + r)
                    if dx*dx + dy*dy > r*r:
                        inside = False
                elif x >= x1 - r and y < y0 + r:
                    dx = x - (x1 - r - 1)
                    dy = y - (y0 + r)
                    if dx*dx + dy*dy > r*r:
                        inside = False
                elif x < x0 + r and y >= y1 - r:
                    dx = x - (x0 + r)
                    dy = y - (y1 - r - 1)
                    if dx*dx + dy*dy > r*r:
                        inside = False
                elif x >= x1 - r and y >= y1 - r:
                    dx = x - (x1 - r - 1)
                    dy = y - (y1 - r - 1)
                    if dx*dx + dy*dy > r*r:
                        inside = False
                
                if inside:
                    # alpha blend
                    cr, cg, cb, ca = color
                    canvas[y][x] = (cr, cg, cb, ca)

def generate_g5():
    W, H = 512, 512
    canvas = [[(0, 0, 0, 0) for _ in range(W)] for _ in range(H)]
    
    # 4 blocks of GradeFlow icon:
    # 1. Top-Left: #f6e8e5 (246, 232, 229, 255)
    draw_rounded_rect(canvas, 44, 44, 188, 120, 20, (246, 232, 229, 255))
    # 2. Bottom-Left: #ea81b4 (234, 129, 180, 255)
    draw_rounded_rect(canvas, 44, 194, 188, 274, 20, (234, 129, 180, 255))
    # 3. Top-Right: #dd2987 (221, 41, 135, 255)
    draw_rounded_rect(canvas, 262, 44, 206, 200, 20, (221, 41, 135, 255))
    # 4. Bottom-Right: #faeaf4 (250, 234, 244, 255)
    draw_rounded_rect(canvas, 262, 274, 206, 194, 20, (250, 234, 244, 255))
    
    save_png("public/g5.png", W, H, canvas)

def generate_g12():
    # Render g12 with icon and clean GradeFlow text
    W, H = 800, 280
    canvas = [[(0, 0, 0, 0) for _ in range(W)] for _ in range(H)]
    
    # Left 4-block icon
    draw_rounded_rect(canvas, 30, 30, 85, 55, 12, (246, 232, 229, 255))
    draw_rounded_rect(canvas, 30, 100, 85, 140, 12, (234, 129, 180, 255))
    draw_rounded_rect(canvas, 130, 30, 95, 95, 12, (221, 41, 135, 255))
    draw_rounded_rect(canvas, 130, 140, 95, 100, 12, (250, 234, 244, 255))
    
    save_png("public/g12.png", W, H, canvas)

generate_g5()
generate_g12()
