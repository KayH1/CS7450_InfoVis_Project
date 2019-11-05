# -*- coding: UTF-8 -*-
import os
import json
import pandas as pd
import http.client

countryCodeDF = pd.DataFrame(pd.read_csv("CoffeeCountryInfo.csv"))
countryCodeDict = dict()
for row in range(countryCodeDF.shape[0]):
	countryCodeDict[countryCodeDF["Country"][row]] = countryCodeDF["ISO3"][row]

# https://datahelpdesk.worldbank.org/knowledgebase/articles/902061-climate-data-api
httpConnectionHome = "climatedataapi.worldbank.org"
httpConnection = http.client.HTTPConnection(httpConnectionHome)
MEANWriteHeader = ["Country", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
countryWriteHeader = ["GCM (circulation model)", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

""" retrieve precipitation for country """
prWriteDict = {header : list() for header in MEANWriteHeader}
requestPrDict = {"rqtype": "mavg", "rqvar": "pr", "start": str(1980), "end": str(1999)}
requestPrUrl = "http://climatedataapi.worldbank.org/climateweb/rest/v1/country/" + requestPrDict["rqtype"] + "/" + \
	requestPrDict["rqvar"] + "/" + requestPrDict["start"] + "/" + requestPrDict["end"]

for country in countryCodeDict.keys():
	requestCountryUrl = requestPrUrl + "/" + countryCodeDict[country]
	print(requestCountryUrl)
	httpConnection.request(method="GET", url=requestCountryUrl)
	countryPrInfo = json.loads(httpConnection.getresponse().read().decode("UTF-8"))
	
	countryWriteDict = {header : list() for header in countryWriteHeader}
	modelMonthAvg = (len(countryWriteHeader) - 1) * [0]
	
	for model in countryPrInfo:
		countryWriteDict[countryWriteHeader[0]].append(model["gcm"])
		for i in range(1, len(countryWriteHeader)):
			countryWriteDict[countryWriteHeader[i]].append(model['monthVals'][i-1])
			modelMonthAvg[i-1] += model['monthVals'][i-1]
	pd.DataFrame(data=countryWriteDict).to_csv("precipitation-mavg/" + country + "-" + requestPrDict["start"] + "_" + requestPrDict["end"] + ".csv", index=False)

	modelMonthAvg = [monthTotal/len(countryPrInfo) for monthTotal in modelMonthAvg]
	prWriteDict[MEANWriteHeader[0]].append(country)
	for i in range(1, len(MEANWriteHeader)):
		prWriteDict[MEANWriteHeader[i]].append(modelMonthAvg[i-1])
pd.DataFrame(data=prWriteDict).to_csv("precipitation-" + requestPrDict["start"] + "_" + requestPrDict["end"] + ".csv", index=False)

""" retrieve temperature for country """
tempWriteDict = {header : list() for header in MEANWriteHeader}
requesttempDict = {"rqtype": "mavg", "rqvar": "tas", "start": str(1980), "end": str(1999)}
requesttempUrl = "http://climatedataapi.worldbank.org/climateweb/rest/v1/country/" + requesttempDict["rqtype"] + "/" + \
	requesttempDict["rqvar"] + "/" + requesttempDict["start"] + "/" + requesttempDict["end"]

for country in countryCodeDict.keys():
	requestCountryUrl = requesttempUrl + "/" + countryCodeDict[country]
	httpConnection.request(method="GET", url=requestCountryUrl)
	countryTempInfo = json.loads(httpConnection.getresponse().read().decode("UTF-8"))
	
	countryWriteDict = {header : list() for header in countryWriteHeader}
	modelMonthAvg = (len(countryWriteHeader) - 1) * [0]
	
	for model in countryTempInfo:
		countryWriteDict[countryWriteHeader[0]].append(model["gcm"])
		for i in range(1, len(countryWriteHeader)):
			countryWriteDict[countryWriteHeader[i]].append(model['monthVals'][i-1])
			modelMonthAvg[i-1] += model['monthVals'][i-1]
	pd.DataFrame(data=countryWriteDict).to_csv("temperature-mavg/" + country + "-" + requesttempDict["start"] + "_" + requesttempDict["end"] + ".csv", index=False)

	modelMonthAvg = [monthTotal/len(countryTempInfo) for monthTotal in modelMonthAvg]
	tempWriteDict[MEANWriteHeader[0]].append(country)
	for i in range(1, len(MEANWriteHeader)):
		tempWriteDict[MEANWriteHeader[i]].append(modelMonthAvg[i-1])
pd.DataFrame(data=tempWriteDict).to_csv("temperature-" + requesttempDict["start"] + "_" + requesttempDict["end"] + ".csv", index=False)