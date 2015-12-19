import urllib3
import json

http = urllib3.PoolManager()
r = http.request('GET', 'http://api.penncoursereview.com/v1/depts?token=public')
parsed_json  = json.loads(r.read())
all_departments = parsed_json['result']['values']
num_depts = len(all_departments)
dictionary = dict()
for i in xrange(num_depts):
	dept_name = all_departments[i]['id']
	dictionary[dept_name] = [] #initialize each to be an empty list in the dict
	r2 = http.request('GET', 'http://api.penncoursereview.com/v1/depts/' + dept_name + '?token=public')
	parsed_json = json.loads(r2.read())
	all_courses = parsed_json['result']['coursehistories']
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
