import urllib2
import json
import sys
from progressbar import ProgressBar

url = 'http://api.penncoursereview.com/v1/depts?token=public'
data = json.load(urllib2.urlopen(url))
all_departments = data['result']['values']
department_count = len(all_departments)
courses = set()

with ProgressBar(max_value=department_count) as bar:
    for i in xrange(department_count):
        dept_name = all_departments[i]['id']
        data = json.load(urllib2.urlopen('http://api.penncoursereview.com/v1/depts/' + dept_name + '?token=public'))
        course_histories = data['result']['coursehistories']
        for j in xrange(len(course_histories)):
            aliases = course_histories[j]['aliases']
            for k in xrange(len(aliases)):
                courses.add(aliases[k])
        bar.update(i)

with open(sys.argv[1], 'w') as outfile:
    json.dump(list(courses), outfile, separators=(',', ':'))