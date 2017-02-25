# -*- coding: utf8 -*-
# 
# Encontrar fotos y juntarla en una sola.
# Author: Gamaliel Espinoza Macedo
# Date: March 24th, 2016
# 
from __future__ import division
import os
import math
import re
import sys
from PIL import Image
from PIL import ImageDraw
from PIL import ImageFont


path = '/Volumes/Secundario/Fototeca.photoslibrary/resources/proxies/derivatives'

width = 1280
cwidth = 1280 / 3
height = 600
perrow = 17
limit = 30000

canvas = Image.new('RGB', (width, height))

iwidth = int(math.ceil(cwidth / perrow))
max_per_block = perrow * height / iwidth
iheight = iwidth

print("iniciando...")

counter = 0
green_images = []
red_images = []
white_images = []

re_file = re.compile(r'_mini_[a-f0-9]{4}\.jpg$')

# encontrar todos los archivos
if not os.path.isfile('./db.data'):
    file_counter = 0
    with open('./db.data', 'w+') as fp:
        for root, dirs, files in os.walk(path):
            for file in files:
                fname = os.path.join(root, file)
                if re_file.search(file):
                    fp.write(fname + '\n')
                    file_counter += 1
    print("files found: {}".format(file_counter))

dbfile = open('./db.data', 'r')

total_green = 0
total_red = 0
total_white = 0

for fname in dbfile:
    with open(fname[:-1], 'rb') as fp:
        img = Image.open(fp)
        total_pixels = iwidth * iheight
        green_pixels = 0
        white_pixels = 0
        red_pixels = 0

        image = img.resize((iwidth, int(iheight)),
                           resample=Image.NEAREST)
        data = image.getdata()

        for color in data:
            r, g, b = color

            if (g > (b + 10) and g > (r + 10)):
                green_pixels += 1

            elif (r > (b + 55) and r > (g + 55)):
                red_pixels += 1  

            elif r > 190 and g > 190 and b > 190:
                white_pixels += 1

        if green_pixels > red_pixels and green_pixels > white_pixels:
            if green_pixels > total_pixels / 3:
                if total_green <= max_per_block:
                    green_images.append(image)
                    total_green += 1

        elif red_pixels > green_pixels and red_pixels > white_pixels:
            if red_pixels > total_pixels / 3:
                if total_red <= max_per_block:
                    red_images.append(image)
                    total_red += 1

        elif white_pixels > red_pixels and white_pixels > green_pixels:
            if white_pixels > total_pixels / 4:
                if total_white <= max_per_block:
                    white_images.append(image)
                    total_white += 1


    if counter == limit:
        break

    if not (counter % 350):
        print(counter)

    counter += 1

print("images found: {}".format(len(red_images) + len(green_images)))

def putgroup(group, offset=0):
    index = 0
    for im in group:
        if not im:
            continue

        raw_index = index / perrow
        flr_index = math.floor(raw_index)
        y = int(flr_index * iheight)
        x = int((raw_index - flr_index) * cwidth)

        canvas.paste(im, (int(x + offset), y))

        index += 1

# Hacer el despliegue
putgroup(green_images, offset=0)
putgroup(white_images, offset=cwidth)
putgroup(red_images,   offset=cwidth * 2)

print("files found: {}".format(counter))
canvas.save('/Users/gama/Desktop/verde.jpeg')

print("listo :D")