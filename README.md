# NBA-Award-prediction

Authors: Yuting Zhou, Zichen Wang, Mingzhe Hu

## Prerequisites

Platform: Google Cloud Platform with BigQuery activated

Software: VSCode

## Data Acquisition

Data fetch is triggered manually or with respect to the current timing. Please run the code in the dataset folder with Python IDE like PyCharm to get the latest data. Please note that you need to run the main script first if you intend to build dataset from scratch. Or you could update dataset by running a certain script to get updated data. These data will be used for either display or award prediction. The algorithm will update the prediction results once the data fetch is complete.

## Front-end page startup method

For details, please take a look at our demo video: `Front-end-page-demo.mp4`

### 1. start server

Please run the program with Visual Studio Code. Under folder 'test proxy server', follow the instructions:

1. Provide authentication credentials to your application code by setting the environment variable to connect bigquery: `$env:GOOGLE_APPLICATION_CREDENTIALS=<json file path>`. For example: `$env:GOOGLE_APPLICATION_CREDENTIALS="E:\database-bigquery-e39fb5537b71.json"`

2. Start server: `node server.js`

### 2. start webpage

Under folder `mvp-prediction-frontend` run the following commands:

1. Install modules: `npm install`

2. Start webpage: `npm start`
   
### 3. Front-end page description
   * First of all, guests should create an account of his or her own. In this case the web
   browser will remember the user history search, which save time for not 
   sending requests to the backend every time a user search the same basketball player. 
   * After logging in with new account, user shall just input the keywords of a player to the search
   box. This optimization measure helps users quickly find the player they want to predict without 
   getting stuck like what the player’s full name is. 
   * Before the request of predicting MVP award been sent, player card with statistics up to now and
   news about him are presented at the left part of the interface, which gives user opportunity to 
   get a complete picture of the searched player.
   * Finally, the MVP prediction result automatically shows on the right part of the interface with 
   animation. There is no need for users to click the MVP award option, which gives users a convenient 
   search experience. Users also can search other awards to predict, like DPOY and MIP.

![image](https://github.com/Calypso52/mvp-prediction/blob/master/pictures/Front-end%20page%20demo1.png)



![image](https://github.com/Calypso52/mvp-prediction/blob/master/pictures/Front-end%20page%20demo2.png)



![image](https://github.com/Calypso52/mvp-prediction/blob/master/pictures/Front-end%20page%20demo3.png)



![image](https://github.com/Calypso52/mvp-prediction/blob/master/pictures/Front-end%20page%20demo4.png)



![image](https://github.com/Calypso52/mvp-prediction/blob/master/pictures/Front-end%20page%20demo5.png)



![image](https://github.com/Calypso52/mvp-prediction/blob/master/pictures/Front-end%20page%20demo6.png)


