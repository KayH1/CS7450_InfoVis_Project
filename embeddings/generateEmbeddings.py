import time

import numpy as np
import pandas as pd

# standardize the data
from sklearn.preprocessing import StandardScaler

# for dimensionality reduction
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE

# MDS
from sklearn.manifold import MDS

# for clustering
from sklearn.cluster import KMeans

# for plotting/visualizing
import matplotlib.pyplot as plt



# specify whether to use PCA (pca), TSNE (tsne), or MDS (mds)
mode = "mds"

n_clusters = 1

# set the seed so results are reproducible
sd = np.random.randint(0,9999999)
#sd = 1527791
sd = 4412712
print("Seed: {}".format(sd))

np.random.seed(sd)



def main():
    # load the dataset into a dataframe
    coffeeData = pd.DataFrame(pd.read_csv("../data/coffee/Coffee-clean.csv", encoding="utf-8"))

    # specify which columns make up the flavor profile
    flavorProfile = ['flavor', 'aroma', 'aftertaste', 'acidity', 'balance', 'uniformity', 'sweetness', 'cleanCup', 'cupperPoints']

    results = None

    if mode=="pca":
        #coffeeData[flavorProfile] = StandardScaler().fit_transform(coffeeData[flavorProfile])
        #print("Standardized the data")
        print("Performing PCA")
        time_start = time.time()
        pca = PCA(n_components=3)
        results = pca.fit_transform(coffeeData[flavorProfile].values)
        print("PCA complete; took {} seconds".format(time.time()-time_start))
        print("Explained variance (per PC): {}".format(pca.explained_variance_ratio_))
        plt.title("PCA")


    elif mode=="tsne":
        print("Performing t-SNE")
        time_start = time.time()
        tsne = TSNE(n_components=2, verbose=1, perplexity=30, n_iter=5000)
        results = tsne.fit_transform(coffeeData[flavorProfile].values)
        print("t-SNE complete; took {} seconds".format(time.time()-time_start))
        plt.title("t-SNE")


    elif mode=="mds":
        print("Performing MDS")
        time_start = time.time()
        embedding = MDS(n_components=2, random_state=sd, verbose=1, max_iter=400, metric=True)
        results = embedding.fit_transform(coffeeData[flavorProfile])
        print("MDS complete; took {} seconds".format(time.time()-time_start))
        plt.title("Similarity space (distance denotes similarity)")

        # store the results in a new dataframe, add appropriate coffee ID to each row
        coffeeData['mdsX'] = results[:,0]
        coffeeData['mdsY'] = results[:,1]

        #print(mds_coffee.head())
        
        # print the results to a new csv
        coffeeData.to_csv("../data/coffee/coffee-clean.csv", index=False)


    y_pred = KMeans(n_clusters=n_clusters, random_state=sd).fit_predict(results)
    plt.scatter(results[:,0], results[:,1], c=y_pred, s=1)
    plt.axis('off')
    plt.show()



main()