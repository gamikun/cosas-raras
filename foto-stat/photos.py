from __future__ import print_function, division
from argparse import ArgumentParser
from StringIO import StringIO
from struct import unpack
import sqlite3
import sys


parser = ArgumentParser(
    description='Generate stats from a Apple Photos Db'
)
parser.add_argument('entity')
parser.add_argument('action')
parser.add_argument('-d', dest='db', type=str)
parser.add_argument('-i', dest='ignore_nameless',
                    default=False, action='store_const',
                    const=True)
parser.add_argument('-l', dest='limit', type=int)


args = parser.parse_args()

db = sqlite3.connect(args.db)


if args.entity == 'face':
    if args.action == 'top':
        cursor = db.cursor()
        query = """
            select faceCount, name
            from RKPerson
            order by faceCount desc
        """

        if args.limit:
            query += ' limit {}'.format(args.limit)

        cursor.execute(query)

        for person in cursor:
            count, name = person

            if name and count:
                print('{} {}'.format(count, name.encode('utf8')))

elif args.entity == 'photo':
    if args.action == 'stats':
        try:
            from bplist import BPListReader

            counter = 0
            allsum = 0
            avg = 0
            total_pixels = 0
            pixel_unit = 'mpx'
            printed_cm = 15.24
            printed_unit = 'cm'
            size_printed = 0

            cursor = db.cursor()
            cursor.execute("""
                select note.value
                from RKMaster as master
                inner join RKMaster_dataNote as note
                    on master.modelId = note.attachedToId
                limit 15000
                -- where master.fileName = 'IMG_5886.JPG'
            """)

            for row in cursor:
                value, = row
                reader = BPListReader(value)
                datos = reader.parse()
                
                if not datos:
                    continue

                exif = datos.get('{Exif}')

                if not exif:
                    continue

                if 'FNumber' in exif:
                    _, fvalue = exif.get('FNumber')
                    counter += 1
                    allsum  += fvalue

                if 'PixelXDimension' in exif:
                    w = exif['PixelXDimension']
                    h = exif['PixelYDimension']
                    total_pixels += w * h
                
                # print(exif)

            if counter > 0:
                avg = allsum / counter

            if total_pixels >= 1000000000000:
                total_mpx = total_pixels / 1000 / 1000 / 1000 / 1000
                pixel_unit = 'tpx'

            elif total_pixels >= 1000000000:
                total_mpx = total_pixels / 1000 / 1000 / 1000
                pixel_unit = 'gpx'

            else:
                total_mpx = total_pixels / 1000 / 1000

            total_printed = printed_cm * counter

            if total_printed > 100000:
                size_printed = total_printed / 100000
                printed_unit = 'km'

            elif total_printed > 100:
                size_printed = total_printed / 100
                printed_unit = 'm'

            else:
                size_printed = total_printed

            print("total: {}".format(counter))
            print("average: f/{:.01f}".format(avg))
            print("total pixels: {:.02f} {}".format(total_mpx, pixel_unit))
            print("your photo printed in 6-inch: {:.01f} {}".format(size_printed, printed_unit))

        except ImportError:
            print("bplist module is not installed", file=sys.stderr)
            print("to install use:", file=sys.stder)
            sys.exit(1)


