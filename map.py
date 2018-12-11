from urllib.request import urlretrieve


key = "&key=BVnoPbryKjzDyWvAiMAsCqckFOJ2GHWE"
urlPrefix = "https://www.mapquestapi.com/staticmap/v5/map?&center="
urlSuffix = "&zoom=16&type=hyb&size=1920,1920@2x"



size = 2

for x in [40 + 0.001 * x for x in range(size)]:
	for y in [-76 + 0.001*y for y  in range(size)]:
		filename = str(x) + "," + str(y)
		print("Getting: " + urlPrefix + filename + urlSuffix)
		urlretrieve(urlPrefix + filename + key + urlSuffix, filename= "image/" + filename + ".jpg")
		


print("Finished! ")