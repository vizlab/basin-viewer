# coding: utf-8
from __future__ import print_function
from __future__ import division
import os
import os.path
import re
from argparse import ArgumentParser
from datetime import datetime, timedelta
import json
import csv
import itertools
from multiprocessing import Pool
from glob import glob
import numpy as np

target_rivers = {
    u'遠賀川',
    u'山国川',
    u'筑後川',
    u'矢部川',
    u'松浦川',
    u'六角川',
    u'嘉瀬川',
    u'本明川',
    u'菊池川',
    u'白川',
    u'緑川',
    u'球磨川',
    u'大分川',
    u'大野川',
    u'番匠川',
    u'五ヶ瀬',
    u'小丸川',
    u'大淀川',
    u'川内川',
    u'肝属川',
}


def outpath(filename, dest):
    basename = os.path.basename(filename)[:-4]
    return '{}/{}.csv'.format(dest, basename)


def month_hours(year, month):
    d = datetime(year, month, 1, 0, 0)
    while d.month == month:
        yield d
        d += timedelta(hours=1)


def process(args):
    filename, shapes, dest = args
    basename = os.path.basename(filename)[:-4]
    print(basename)

    pattern = r'surf_(.+)_(m[0-9]{3})_([0-9]{4})([0-9]{2}).grib'
    model, ensemble, year, month = re.match(pattern, basename).groups()
    year = int(year)
    month = int(month)

    data = np.load(filename)
    ts = list(month_hours(year, month))

    writer = csv.writer(open('{}/{}.csv'.format(dest, basename), 'w'))
    for shape in shapes:
        indices = shape['point_indices']
        if not indices['lat']:
            continue
        values = data[:, indices['lat'], indices['lon']]
        count = len(values[0])
        result_min = np.min(values, axis=1)
        result_max = np.max(values, axis=1)
        result_sum = np.sum(values, axis=1)
        result_sumsq = np.sum(values[:] ** 2, axis=1)
        writer.writerows([[
            basename,
            shape['code'],
            t,
            count,
            result_min[i],
            result_max[i],
            result_sum[i],
            result_sumsq[i],
        ] for i, t in enumerate(ts)])


def main():
    parser = ArgumentParser()
    parser.add_argument('--dest', default='result',
                        help='destination directory')
    parser.add_argument('--threads', default=1, type=int,
                        help='number of parallel threads')
    parser.add_argument('--target', nargs=1,
                        help='target geometry file')
    parser.add_argument('--force', action='store_true',
                        help='ignore existing files')
    parser.add_argument('files', nargs='+',
                        help='.npy files')
    args = parser.parse_args()

    if not os.path.exists(args.dest):
        os.makedirs(args.dest)

    shapes = [s for s in json.load(open(args.target[0]))
              if s['name'] in target_rivers]
    filenames = [(f, shapes, args.dest) for f
                 in itertools.chain(*[glob(p) for p in args.files])
                 if args.force or not os.path.exists(outpath(f, args.dest))]

    pool = Pool(args.threads)
    pool.map(process, filenames)


if __name__ == '__main__':
    main()
