# NottsMissingMaps
The repository for UoN group 25, working on IBM's Missing Maps project.

## The Goal:
To produce a web app that takes arial photography and produces traces that show areas of human habitation as well as a report allowing you to view confidence scores and further breakdowns.

[Missing Maps](https://www.missingmaps.org/ "Missing Maps homepage") is an open and collabrative project to map unmapped areas of the world providing vital assistance to humanitarian organisations working in the affected areas. We are proud to be working with IBM to help this cause and anyone can get involved by joining in through their website. Our automated tool aims to assist with "Stage 1" of the process, where areas of potential habitation are traced by humans working remotely so volunteers on the ground then know what areas to investigate and add local detail.

## The Tools:
This project is being put together with the help of IBM Watson, by training an image classifier to help identify habitation. Buildings, roads etc.
The back end of the app is developed using NodeRed which allows us to build scripts that use IBM cloud tools and include them in our website as node.js files. https://nodered.org/
The front end of the website is powered by Vue.js and CSS to provide a slick UX.

## Our Team:
We are a group of students from the University of Nottingham, currently studying in the UK but including representatives from the University's Ningbo campus in China. We each bring our own talents to the team, and our agile kaban process lets us take on tasks to suit our skills and as they become available, but we also take on our own responsibilities within the team:

- [Tom Dudley](https://github.com/Carbsta), team leader and git-master.
- [Yi Ding](https://github.com/DDEle), team admin and lead front-end developer.
- [James Abbott](https://github.com/psyja4), lead node-red developer.
- [Peter Hare](https://github.com/pete234), node-red and image classification.
- [Sen Lin](https://github.com/SenLin0710), front end developer and style sheet maintainer.
- [Luke Ellis](https://github.com/Luke551), blog-master, front-end dev and data-set researcher.

## Our Blog:
As part of our work with IBM we are writing about our experience developing this webapp, and delivering that experience through blog posts written by all of us. As we develop the application, after every sprint, we will update the blog with our experiences, and the work that we have done. We are looking forward to bringing you more information about our journey over the coming weeks!

## Our Workflow:
We are producing this app in an agile way using the kaban methodology, we have a [trello board](http://bit.ly/2yU7jBK "Our Trello") where you can see tasks as they move through the development pipeline as well as using the [feature-branch git workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow "Atlassian feature branch workflow tutorial").
Our Master branch corresponds to stable releases and code, so currently looks a little bare, but we have various development branches where features are being developed before being merged once they are done, tested and reviewed through pull requests.

## Also See:
- Our Trello board: http://bit.ly/2yU7jBK
- Our document archive: http://bit.ly/2qEDXCZ
- Our blog: https://uonmissingmaps.home.blog/
