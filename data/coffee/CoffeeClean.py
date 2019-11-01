# -*- coding: UTF-8 -*-
import pandas as pd

"""
Processing Steps:
1. remove empty or invalid coffee rows
2. delete unwanted columns in data 
    ('Farm.Name', 'Lot.Number', 'Mill', 'ICO.Number', 'Altitude', 'Number.of.Bags', 'Bag.Weight',
     'In.Country.Partner', 'Category.One.Defects', 'Quakers', 'Category.Two.Defects', 'Expiration', 
     'Certification.Body', 'Certification.Address', 'Certification.Contact')
3. Owner: change empty and non-English string to NA, remove "?" in string
4. Country.of.Origin: deal with Hawaii, Tanzania, Puerto Rico
5. Company: change empty and non-English string to NA, remove "?" in string
6. Producer: change empty and non-English string to NA, remove "?" in string
7. Harvest.Year: change empty and year with character to NA
8. Owner.1: change empty and non-English string to NA, remove "?" in string
9. Variety: change "other" and unknown variety to NA
10. Color: change unknown color to NA
11. Altitude (mean, high, low): change altitude info (ft and m -> m), round to integer, remove column "unit_of_measurement"

Add-on:
1. Processing.Method: change empty and "Other" to NA
2. Region: change empty or with "?" or length < 2 (-) to NA
3. Owner, Company, Producer, Owner.1: deal with capital issue

Special Treatment:
1. remove coffee with too low rating (at last row in original coffee file)
2. code special treatment for producer
"""

def is_english(s):
    try:
        s.encode(encoding='utf-8').decode('ascii')
    except UnicodeDecodeError:
        return False
    return True

coffeeData = pd.DataFrame(pd.read_csv("Coffee.csv", encoding="utf-8"))

# remove empty or invalid coffee row
removeIndex = coffeeData["ID"].index[coffeeData["ID"].apply(lambda x: True if (pd.isna(x) or not x.isdigit()) else False)]
for index in removeIndex:
    coffeeData.drop(axis=0, index=index, inplace=True)
removeIndex = coffeeData["Total.Cup.Points"].index[coffeeData["Total.Cup.Points"].apply(pd.isna)]
for index in removeIndex:
    coffeeData.drop(axis=0, index=index, inplace=True)

# delete unnecessary col
for col in list(['Farm.Name', 'Lot.Number', 'Mill', 'ICO.Number', 'Altitude', 'Number.of.Bags', 'Bag.Weight',
                 'In.Country.Partner', 'Category.One.Defects', 'Quakers', 'Category.Two.Defects', 'Expiration',
                 'Certification.Body', 'Certification.Address', 'Certification.Contact']):
    coffeeData.drop(columns=col, axis=1, inplace=True)

# change "Altitude info" to rounded int, get rid of float number, deal with ft and m issue, drop "unit_of_measurement"
coffeeData.fillna({"unit_of_measurement": "m"}, inplace=True)
for index, row in coffeeData.iterrows():
    for altitudeCol in list(coffeeData.columns)[coffeeData.shape[1] - 3: coffeeData.shape[1]]:
        coffeeData.at[index, altitudeCol] = str(float(coffeeData[altitudeCol][index])*0.3048) if coffeeData["unit_of_measurement"][index] == "ft" else coffeeData[altitudeCol][index]
coffeeData.fillna({altitudeCol: -1 for altitudeCol in list(coffeeData.columns)[coffeeData.shape[1] - 3: coffeeData.shape[1]]}, inplace=True)
coffeeData = coffeeData.round({altitudeCol: 0 for altitudeCol in list(coffeeData.columns)[coffeeData.shape[1] - 3: coffeeData.shape[1]]})
coffeeData = coffeeData.astype({altitudeCol: "int32" for altitudeCol in list(coffeeData.columns)[coffeeData.shape[1] - 3: coffeeData.shape[1]]})
coffeeData.drop(columns="unit_of_measurement", axis=1, inplace=True)

# change unknown "Color" to NA
coffeeData.fillna({"Color": "NA"}, inplace=True)
coffeeData = coffeeData.replace({"Color": {"None", "NA"}})

# remove
removeIndex = coffeeData["ID"].index[coffeeData["ID"].apply(lambda x: True if (pd.isna(x) or not x.isdigit()) else False)]
for index in removeIndex:
    coffeeData.drop(axis=0, index=index, inplace=True)

# change unknown "Processing.Method" to NA (including "other")
coffeeData["Processing.Method"] = coffeeData["Processing.Method"].apply(lambda x: "NA" if pd.isna(x) or x == "Other" else x)

# change unknown "Variety" to NA (including "other")
coffeeData["Variety"] = coffeeData["Variety"].apply(lambda x: "NA" if pd.isna(x) or x == "Other" else x)

# change unknown "Owner.1" and non-English to NA, remove "?"
coffeeData["Owner.1"] = coffeeData["Owner.1"].apply(lambda x: "NA" if not (not pd.isna(x) and is_english(x)) else x)

# change unknown Harvest.Year and non-digit
def deal_harvest_year(s):
    try:
        if pd.isna(s):
            return "NA"
        year = str(int(s))
        return year
    except ValueError:
        if any(c.isalpha() for c in s):
            return "NA"
        else:
            if s.find("/") == -1:
                return "NA"
            else:
                return s.split("/")[0].strip()
coffeeData["Harvest.Year"] = coffeeData["Harvest.Year"].apply(deal_harvest_year)

# change unknown "Producer" and non-English to NA
def special_treat_producer(s):
    if s == "Green Gold Ethiopia | Phone: 0114342032":
        return "Green Gold Ethiopia"
    if s == "Werclein Hernandez Serrano Id.-1506728641":
        return "Werclein Hernandez Serrano"
    if s == "Mariana Cabrera Pantoja; I.D.: 27 423 625":
        return "Mariana Cabrera Pantoja"
    if s == "Exporter Name | Muluneh Kaka | Phone: 0114390290":
        return "Muluneh Kaka"
    if s == "??? & ??? (Tseng Ju Feng & Kuo Jun Hong)":
        return "Tseng Ju Feng & Kuo Jun Hong"
    lowerS = s.lower()
    if not lowerS.find("various") == -1 or not lowerS.find("varios"):
        return "NA"
    return s.replace("Contact name |", "").strip()
coffeeData["Producer"] = coffeeData["Producer"].apply(lambda x: "NA" if (pd.isna(x) or not is_english(x) or len(x) < 2) else x)
coffeeData["Producer"] = coffeeData["Producer"].apply(special_treat_producer)

# change unkown region, non-English, -, with "?" to NA
coffeeData["Region"] = coffeeData["Region"].apply(lambda x: "NA" if (pd.isna(x) or not is_english(x) or not x.find("?") == -1 or len(x) < 2) else x)

# change unknown "Company" and non-English to NA
coffeeData["Company"] = coffeeData["Company"].apply(lambda x: "NA" if (pd.isna(x) or not is_english(x) or len(x) < 2) else x)

# change remove bracket content
def deal_origin_country(s):
    if pd.isna(s):
        return "NA"
    s = s.strip()
    if s == "United States (Hawaii)":
        return "United States"
    if s == "Tanzania, United Republic Of":
        return "Tanzania"
    if s == "United States (Puerto Rico)":
        return "Puerto Rico"
    return s
coffeeData["Country.of.Origin"] = coffeeData["Country.of.Origin"].apply(deal_origin_country)

# change unknown "Owner" and non-English to NA
coffeeData["Owner"] = coffeeData["Owner"].apply(lambda x: "NA" if not (not pd.isna(x) and is_english(x)) else x)

# deal with space issue for "Owner", "Company", "Producer", "Owner.1"
def deal_space_issue(s):
    s = s.replace("?", "").strip()
    return "NA" if len(s) == 0 else s
for column in ["Owner", "Company", "Region", "Producer", "Owner.1"]:
    coffeeData[column] = coffeeData[column].apply(deal_space_issue)

# deal with capital issue for "Owner", "Company", "Producer", "Owner.1"
def deal_capital_issue(s):
    return "NA" if s == "NA" else s.title()
for column in ["Owner", "Company", "Region", "Producer", "Owner.1"]:
    coffeeData[column] = coffeeData[column].apply(deal_capital_issue)

coffeeData.to_csv("Coffee-clean.csv", index=False)