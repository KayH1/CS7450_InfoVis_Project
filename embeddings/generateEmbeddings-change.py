import time

import numpy as np
import pandas as pd

# standardize the data
from sklearn.model_selection import GridSearchCV
from sklearn.preprocessing import scale

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
mode = "pca"

# set the seed so results are reproducible
sd = np.random.randint(0,9999999)
#sd = 1527791
sd = 4412712
print("Seed: {}".format(sd))

np.random.seed(sd)


def main():
    # load the dataset into a dataframe
    coffeeData = pd.read_csv("../data/coffee/Coffee-clean.csv", encoding="utf-8")

    # add extra attribute
    flavorProfile = ['flavor', 'aroma', 'aftertaste', 'acidity', 'balance', 'uniformity', 'sweetness', 'cleanCup', 'cupperPoints', 'moisture', 'altitudeMeanMeters']
    x_data = coffeeData.loc[:, flavorProfile]
    x_data = x_data.drop(x_data.query('altitudeMeanMeters==-1').index)

    # specify which columns make up the flavor profile

    results = None

    x_data_std = scale(x_data)

    if mode=="pca":
        print("Performing PCA")
        time_start = time.time()
        pca = PCA(n_components=2)
        pca.fit(x_data_std)
        results = pca.transform(x_data_std)
        print("PCA complete; took {} seconds".format(time.time()-time_start))
        print("Explained variance (per PC): {}".format(pca.explained_variance_ratio_))
        plt.title("PCA")


    elif mode=="tsne":
        print("Performing t-SNE")
        time_start = time.time()
        tsne = TSNE(n_components=2, verbose=1, perplexity=30, n_iter=5000)
        results = tsne.fit_transform(x_data_std)
        print("t-SNE complete; took {} seconds".format(time.time()-time_start))
        plt.title("t-SNE")


    elif mode=="mds":
        print("Performing MDS")
        time_start = time.time()
        embedding = MDS(n_components=2, random_state=sd, verbose=1, max_iter=400, metric=True)
        results = embedding.fit_transform(x_data_std)
        print("MDS complete; took {} seconds".format(time.time()-time_start))
        plt.title("Similarity space (distance denotes similarity)")

        #print(mds_coffee.head())

    k_means_parameter = {"n_clusters": [i + 1 for i in range(1, 10)]}
    k_means = KMeans(random_state=sd)
    k_means_tuning = GridSearchCV(k_means, k_means_parameter, cv=5)
    k_means_tuning.fit(results)
    y_pred = k_means_tuning.predict(results)
    plt.scatter(results[:,0], results[:,1], c=y_pred)
    plt.savefig(mode + '-std-cluster-original-add_attribute.png', dpi=300)
    plt.axis('off')
    plt.show()

    k_means_parameter = {"n_clusters": [i + 1 for i in range(1, 10)]}
    k_means = KMeans(random_state=sd)
    k_means_tuning = GridSearchCV(k_means, k_means_parameter, cv=5)
    k_means_tuning.fit(x_data_std)
    y_pred = k_means_tuning.predict(x_data_std)
    plt.scatter(results[:,0], results[:,1], c=y_pred)
    plt.savefig(mode + '-std-cluster-project-add_attribute.png', dpi=300)
    plt.axis('off')
    plt.show()

main()