import urllib2
import json

url = 'http://api.penncoursereview.com/v1/depts?token=public'
data = json.load(urllib2.urlopen(url))
all_departments = data['result']['values']
num_depts = len(all_departments)

for i in xrange(num_depts):
	print (all_departments[i]['id'])