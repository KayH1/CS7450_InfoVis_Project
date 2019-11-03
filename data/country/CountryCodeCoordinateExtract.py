# -*- coding: UTF-8 -*-
import os
import selenium
import collections
import pandas as pd
from selenium import webdriver

coffeeData = pd.DataFrame(pd.read_csv("../coffee/Coffee-clean.csv", encoding="utf-8"))
countries = set(coffeeData["countryOfOrigin"])

"""website for ISO code"""
websiteCrawling = "https://unstats.un.org/unsd/methodology/m49/"

"""setting the chrome driver for data crawling"""
chromeDriver = webdriver.Chrome(executable_path="chromedriver.exe")
chromeDriver.get(websiteCrawling)
countryCodeTable = chromeDriver.find_element_by_xpath("//*[@id='ENG_COUNTRIES']/table/tbody")
countryRow = countryCodeTable.find_elements_by_tag_name("tr")
countryCodeDict = collections.defaultdict(lambda: "")
for i in range(1, len(countryRow)):
	country = countryRow[i].find_element_by_xpath("./td[1]").text.strip()
	ISOcode = countryRow[i].find_element_by_xpath("./td[3]").text.strip()
	countryCodeDict[country] = ISOcode
chromeDriver.quit()

""" write dict to csv file """
countryCodeDict["Taiwan"] = "TWN" # special add Taiwan

csvWriteDict = {"Country":list(), "ISO3":list()}
for country in countries:
	csvWriteDict["Country"].append(country)
	csvWriteDict["ISO3"].append(countryCodeDict[country])
countryCodeDF = pd.DataFrame(data=csvWriteDict)
countryCodeDF.to_csv("CountryCode.csv", index=False)

""" extract coordinates and iso2 code """
countryInCoffee = pd.DataFrame(pd.read_csv("CountryCode.csv", encoding="utf-8"))
countryInfoAll = pd.DataFrame(pd.read_csv("CountriesCoordinates.csv", encoding="utf-8"))

countryCodeMap = dict()
for row in range(countryInCoffee.shape[0]):
	countryCodeMap[countryInCoffee["ISO3"][row]] = countryInCoffee["Country"][row]

removeIndex = countryInfoAll["Alpha-3 code"].index[countryInfoAll["Alpha-3 code"].apply(lambda x: True if x.strip() not in countryCodeMap.keys() else False)]
for index in removeIndex:
    countryInfoAll.drop(axis=0, index=index, inplace=True)

countryCodeCoordinateWriteDict = {"Country": list(), "ISO3":list(), "ISO2": list(), "lat": list(), "lng": list()}
for index, row in countryInfoAll.iterrows():
	countryISO3 = countryInfoAll["Alpha-3 code"][index].strip()
	countryCodeCoordinateWriteDict["Country"].append(countryCodeMap[countryISO3])
	countryCodeCoordinateWriteDict["ISO3"].append(countryISO3)
	countryCodeCoordinateWriteDict["ISO2"].append(countryInfoAll["Alpha-2 code"][index].strip())
	countryCodeCoordinateWriteDict["lat"].append(str(float(countryInfoAll["Latitude (average)"][index])))
	countryCodeCoordinateWriteDict["lng"].append(str(float(countryInfoAll["Longitude (average)"][index])))
pd.DataFrame(data=countryCodeCoordinateWriteDict).to_csv("CoffeeCountryInfo.csv", index=False)

os.remove("CountryCode.csv")