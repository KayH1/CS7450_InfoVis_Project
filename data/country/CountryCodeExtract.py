# -*- coding: UTF-8 -*-
import os
import selenium
import collections
import pandas as pd
from selenium import webdriver

coffeeData = pd.DataFrame(pd.read_csv("../coffee/Coffee-clean.csv", encoding="utf-8"))
countries = set(coffeeData["Country.of.Origin"])

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