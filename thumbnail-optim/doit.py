import os
import subprocess as sp


path = '/Users/gama/Pictures/Fototeca.photoslibrary/Thumbnails/2015/08'
counter = 0

for root, dirs, files in os.walk(path):
    for file in files:
        fname = os.path.join(root, file)
        if file.endswith('.jpg'):
            sp.call(['jpegoptim', '-m', '85', fname])

            counter += 1

print("found {} files".format(counter))