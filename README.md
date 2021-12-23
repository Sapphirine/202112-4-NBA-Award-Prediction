# mvp-prediction

## Front-end page startup method

Demo video: Front-end page demo.mp4
### 1. start server

Under folder 'test proxy server', run order:

1. Provide authentication credentials to your application code by setting the environment variable to connect bigquery:

   `$env:GOOGLE_APPLICATION_CREDENTIALS=<json file path>`

   For example:

   `$env:GOOGLE_APPLICATION_CREDENTIALS="E:\database-bigquery-e39fb5537b71.json"`

2. Start server:

   `node server.js`

### 2. start webpage

Under folder 'mvp-prediction-frontend' run order:

1. Install modules

   `npm install`

2. Start webpage

   `npm start`
   
### 3. Front-end page description
    First of all, user should sign up to own an account of his or her own. In this case the web browser can remenber what the user search in history, which save the searching time for not sending requests to the backend every time a user search the same basketball player. 
    After loging in with new account, user shall just input the keywords of a player to the search box. This optimization measure helps users quickly find the player they want to predict without getting stuck like what the player’s full name is. 
    Before the request of predicting MVP award been sent, player card with statistics up to now and news about him are presented at the left part of the interface, which gives user opportunity to get a complete picture of the searched player.
    Finally, the MVP prediction result automatically shows on the right part of the interface with animation. There is no need for users to click the MVP award option, which gives users a convenient search experience. Users also can search other awards to predict, like DPOY and MIP.

![image](https://github.com/Calypso52/mvp-prediction/blob/master/pictures/Front-end%20page%20demo1.png)



![image](https://github.com/Calypso52/mvp-prediction/blob/master/pictures/Front-end%20page%20demo2.png)



![image](https://github.com/Calypso52/mvp-prediction/blob/master/pictures/Front-end%20page%20demo3.png)



![image](https://github.com/Calypso52/mvp-prediction/blob/master/pictures/Front-end%20page%20demo4.png)



![image](https://github.com/Calypso52/mvp-prediction/blob/master/pictures/Front-end%20page%20demo5.png)



![image](https://github.com/Calypso52/mvp-prediction/blob/master/pictures/Front-end%20page%20demo6.png)
