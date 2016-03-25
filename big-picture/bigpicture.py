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
from PIL import Image
from PIL import ImageDraw
from PIL import ImageFont


path = '/Users/gama/Pictures/Fototeca.photoslibrary/Thumbnails'

width = 1920
height = 1080
perrow = 205
limit = 100000

canvas = Image.new('RGB', (width, height))

iwidth = int(math.ceil(width / perrow))
iheight = iwidth

print("width: {}".format(iwidth))

counter = 0
colors = []
allfiles = []
images = []

# encontrar todos los archivos
if not os.path.isfile('./db.data'):
	with open('./db.data', 'w+') as fp:
		for root, dirs, files in os.walk(path):
			for file in files:
				fname = os.path.join(root, file)
				if file.endswith('.jpg') and not file.endswith('_1024.jpg')\
				and not file.startswith('thumb_'):
					fp.write(fname + '\n')


dbfile = open('./db.data', 'r')
averages = {}
colorines = {}
saturation = {}

for fname in dbfile:
	with open(fname[:-1], 'rb') as fp:
		img = Image.open(fp)
		image = img.resize((iwidth, int(iheight)),
						   resample=Image.NEAREST)
		data = image.getdata()

		average = [0, 0, 0]
		first = True
		maxvalue = 0
		color_indexer = {}
		for color in data:
			r, g, b = color
			if color not in color_indexer:
				color_indexer[color] = 1
			else:
				color_indexer[color] += 1
			if first:
				average[0] = r
				average[1] = g
				average[2] = g
				first = False
			else:
				average[0] = (average[0] + r) / 2
				average[1] = (average[1] + g) / 2
				average[2] = (average[2] + b) / 2

		avgsum = reduce(lambda x, y: x + y, average)
		averages[counter] = avgsum / len(average)
		colorines[counter] = max(color_indexer)
		images.append(image)

	if counter == limit:
		break

	counter += 1

# method types: complex
#				darkness
#				saturation
method = 'darkness' 

if method == 'complex':
	# Ordernar por cantidad de colores
	sorted_indexes = sorted(colorines, key=lambda x: colorines[x])
elif method == 'darkness':
	# Ordernar por averages RGB
	sorted_indexes = sorted(averages, key=lambda x: averages[x])

# Hacer el despliegue
index = 0
for im_index in sorted_indexes:
	im = images[im_index]

	raw_index = index / perrow
	flr_index = math.floor(raw_index)
	y = int(flr_index * iheight)
	x = int((raw_index - flr_index) * width)

	canvas.paste(im, (x, y))

	index += 1

print("files found: {}".format(counter))

canvas.save('/Users/gama/Desktop/global.jpeg')
