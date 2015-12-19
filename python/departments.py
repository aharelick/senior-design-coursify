import urllib3
import json

http = urllib3.PoolManager()
r = http.request('GET', 'http://api.penncoursereview.com/v1/depts?token=public')
parsed_json  = json.loads(r.read())
all_departments = parsed_json['result']['values']
num_depts = len(all_departments)

for i in xrange(num_depts):
	print (all_departments[i]['id'])