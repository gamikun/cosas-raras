from wand.drawing import Drawing
from wand.image import Image
from wand.color import Color
from random import Random
from binascii import hexlify
from struct import pack
import subprocess
import math

ffmpeg = subprocess.Popen([
  'ffmpeg',
  '-f', 'image2pipe',
  '-framerate', '60',
  '-probesize', '20M',
  '-vcodec', 'bmp',
  '-y',
  '-i', '-',
  'salida.mp4'
], stdin=subprocess.PIPE)

W = 1920.0
H = 1080.0
CX = W / 2
CY = H / 2

random = Random()

class Dot:
  def __init__(self):
    self.r = random.random() * W * 2
    self.x = 0
    self.y = 0
    self.speed = 1
    self.rotation = random.random() * math.pi * 2
    self.rotation_speed = random.random() * 0.04
    #self.color = hexlify(pack('>I', random.randrange(0, 0xFFFFFF)))
    self.color = Color('#{}'.format(
      hexlify(pack('>I', random.randrange(0, 0xFFFFFF))[1:]).decode()
    ))

dots = [Dot() for x in range(10000)]

def compute():
  for dot in dots:
    dot.r -= dot.speed
    dot.rotation += dot.rotation_speed

    if dot.r < 0:
      dot.r = random.random() * (W / 2) + W / 2
    
    dot.x = dot.r * math.cos(dot.rotation) + CX
    dot.y = dot.r * math.sin(dot.rotation) + CY

def draw_all(draw):
  draw.fill_color = Color('#222222')
  draw.rectangle(left=0, top=0, right=W, bottom=H)
  for dot in dots:
    draw.fill_color = dot.color
    draw.circle(
      (dot.x, dot.y),
      (dot.x + (dot.r * 0.03 + 1), dot.y + (dot.r * 0.03 + 1))
    )

seconds = 10

with Image(width=int(W), height=int(H), background='#222222') as image:
  for index in range(60 * seconds):
    with Drawing() as draw:
      compute()
      draw_all(draw)
      draw(image)
      image.format = 'bmp'
      #image.save(filename="hola.png")
      image.save(file=ffmpeg.stdin)

  