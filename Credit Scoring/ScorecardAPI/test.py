import requests

data = {'data': "395346,1800,1800,1800.0, 36 months,14.64,62.09,C,10+ years,OWN,50000.0,Source Verified,May-14,n,home_improvement,FL,19.11,0.0,Sep-91,4.0,,7.0,1.0,1203,49.0,32.0,w,0.0,0.0,2090.92,2090.92,290.92,Sep-15,1159.57,Jan-16,0.0,31.0,1,INDIVIDUAL,0.0,965.0,107437.0,2450.0"}
r = requests.get("http://127.0.0.1:5000/credit_rating", json=data)
print('response from server:', r)