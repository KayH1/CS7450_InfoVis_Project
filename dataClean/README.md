# Data Clean
Two datasets are cleaned (**Coffee** and **Country**).
- **Coffee** is cleaned and processing steps as following.
- **Country** is already clean, with only absent values.

## Processing Steps
- Remove empty or invalid coffee rows
- Delete unwanted columns in data 
    (*'Farm.Name'*, *'Lot.Number'*, *'Mill'*, *'ICO.Number'*, *'Altitude'*, *'Number.of.Bags'*, *'Bag.Weight'*,
     *'In.Country.Partner'*, *'Category.One.Defects'*, *'Quakers'*, *'Category.Two.Defects'*, *'Expiration'*, 
     *'Certification.Body'*, *'Certification.Address'*, *'Certification.Contact'*)
- *Owner*: change empty and non-English string to NA, remove "?" in string
- *Country.of.Origin*: deal with Hawaii, Tanzania, Puerto Rico
- *Company*: change empty and non-English string to NA, remove "?" in string
- *Producer*: change empty and non-English string to NA, remove "?" in string
- *Harvest.Year*: change empty and year with character to NA
- *Owner.1*: change empty and non-English string to NA, remove "?" in string
- *Variety*: change "Other" and unknown variety to NA
- *Color*: change unknown color to NA
- *Altitude (mean, high, low)*: change altitude info (ft and m -> m), round to integer, remove column *'unit_of_measurement'*

## Special Treatment
- Remove coffee with too low rating (at last row in original coffee file)