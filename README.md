# NottsMissingMaps
The repository for UoN group 25, working on IBM's Missing Maps project.
Our website can be used here: https://missingmaps.eu-gb.cf.appdomain.cloud/
If you want to mess around with work in progress features the development build of the website is deployed here: https://fortestbranchnott.eu-gb.mybluemix.net/ (Warning, build may be broken or contain bugs)

We recommend checking out our wiki!
https://github.com/Carbsta/NottsMissingMaps/wiki

This includes a page for our user manual and our documentation which includes instructions on how to set up the project yourself, recreate our work and take it further.

## The Goal:
To produce a web app that takes arial photography and shows areas of human habitation as well as a report allowing you to view confidence scores. Using IBM Cloud and IBM Watson Visual Recognition.

[Missing Maps](https://www.missingmaps.org/ "Missing Maps homepage") is an open and collabrative project to map unmapped areas of the world providing vital assistance to humanitarian organisations working in the affected areas. We are proud to be working with IBM to help this cause and anyone can get involved by joining in through their website. Our automated tool aims to assist with "Stage 1" of the process, where areas of potential habitation are traced by humans working remotely so volunteers on the ground then know what areas to investigate and add local detail.

## The Tools:
This project is being put together with the help of IBM Watson, by training an image classifier to help identify habitation. Buildings, roads etc. We created our custom classifier using data from the UC Merced Land Use dataset:  http://weegee.vision.ucmerced.edu/datasets/landuse.html
The front end of the website is powered by Vue.js and CSS to provide a slick UX.

## Our Team:
We are a group of students from the University of Nottingham, currently studying in the UK but including representatives from the University's Ningbo campus in China. We each bring our own talents to the team, and our agile kaban process lets us take on tasks to suit our skills and as they become available, but we also take on our own responsibilities within the team:

- [Tom Dudley](https://github.com/Carbsta), team leader and git-master.
- [Yi Ding](https://github.com/DDEle), team admin and lead front-end developer.
- [James Abbott](https://github.com/psyja4), lead IBM Cloud and Visual Recognition developer.
- [Peter Hare](https://github.com/pete234), Dataset researcher and quality control.
- [Sen Lin](https://github.com/SenLin0710), front end developer, style sheet designer, documentation and PR manager.
- [Luke Ellis](https://github.com/Luke551), blog-master, front-end dev and documentation.

## Our Blog:
As part of our work with IBM we are writing about our experience developing this webapp, and delivering that experience through blog posts written by all of us. As we develop the application, between development cycles, we will update the blog with our experiences, and the work that we have done. We are looking forward to bringing you more information about our journey over the coming weeks!

## Our Workflow:
We are producing this app in an agile way using the kaban methodology, we have a [trello board](http://bit.ly/2yU7jBK "Our Trello") where you can see tasks as they move through the development pipeline as well as using the [feature-branch git workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow "Atlassian feature branch workflow tutorial").
Our Master branch corresponds to stable releases and code, and all development work is done on the development branch which is also deployed to the development (unstable) version of the website. We have since moved away from a direct version of the feature branch workflow, but we create branches from the development branch when working on multiple features at once or engaging in large scale refactoring. Once the development branch is stable and contains the newest set of features, we merge it into the master branch to deploy to the user facing website.

## Also See:
- Our Trello board: http://bit.ly/2yU7jBK
- Our document archive: http://bit.ly/2qEDXCZ
- Our blog: https://uonmissingmaps.home.blog/
