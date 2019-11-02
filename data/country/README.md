# Country Climate Data

Country climate data (month average precipitation and temperature) for countries in **Coffee-clean.csv**

- Precipitation and temperature data is from **World Bank**, using their [Climate Data API](https://datahelpdesk.worldbank.org/knowledgebase/articles/902061-climate-data-api). Each country is referenced by their *ISO3* code.
- All the data in the Climate Data API are derived from 15 global circulation models (GCMs), the most comprehensive physically-based models of climate change available and used by the Intergovernmental Panel on Climate Change (IPCC) 4th Assessment Reports.

## Country Code Extraction
The country code for countries in our **Coffee-clean.csv** are crawled from [Country ISO3 Code](https://unstats.un.org/unsd/methodology/m49/), with "Taiwan" manually added. The crawled country code is in **CountryCode.csv**.

## Country Temp and Pr Data
Two time periods of data, i.e. *1980 to 1999* and *2020 to 2039*, are retrieved using api. Since there are multiple circulation models, we calculate model mean and save in **temperature-1980_1999.csv**, **temperature-2020_2039.csv**, **precipitation-1980_1999.csv** and **precipitation-2020_2039.csv**. The original model results for each country are saved under *precipitation-mavg* and *temperature-mavg*.