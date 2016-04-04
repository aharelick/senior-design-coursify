import urllib2
import json

url = 'http://api.penncoursereview.com/v1/depts?token=public'
data = json.load(urllib2.urlopen(url))
all_departments = data['result']['values']
num_depts = len(all_departments)
dictionary = dict()
for i in xrange(num_depts):
	dept_name = all_departments[i]['id']
	dictionary[dept_name] = [] # initialize each to be an empty list in the dict
	data = json.load(urllib2.urlopen('http://api.penncoursereview.com/v1/depts/' + dept_name + '?token=public'))
	all_courses = data['result']['coursehistories']
	num_courses = len(all_courses)
	for j in xrange(num_courses):
		all_aliases = all_courses[j]['aliases']
		num_aliases = len(all_aliases)
		for k in xrange(num_aliases):
			name_num = all_aliases[k].split('-')
			if (name_num[0] == dept_name):
				dictionary[dept_name].append(name_num[1])

for key in dictionary.keys():
	for value in dictionary[key]:
		print (key + " " + value)
