
## Introduction
Have you ever wondered how much money your favourite video game is making? The purpose of this project is to express information in a interesting and colourful manner.
In this project you can find a data visualisation which use a dataset from www.kaggle.com/datasets that contain information regarding games sales around the world.
**The dashboard gives you the opportunity to explore and find more about subject in an interactive manner**.

**All charts are connected, so you will be able to filter data and find what interests you more**.

## Technologies
* Crossfilter.js - used to manipulate the donations data
* DC.js - built to work natively with crossfilter rendered using d3.js
* D3.js - used to render the interactive graphs
* MongoDB -
* Flask framework
* queue.js
* Heroku deployment
* intro.js - create a step-by-step guide that assigns an interactive pop-up tooltip to graphs

Live version of the data dashboard is available on Heroku:
**https://video-games-dashboard.herokuapp.com/**

## Structure
This project is formed by three parts:
* **graph.js**: a JavaScript file which handle data and charts.
* **video_games.py**: a Python file where all routes and also, data connection, are managed.
* **html templates**: html files which will display chats

## Content
### Charts

* 3 menus select
![](readme_img/menu_select.png)
* 8 charts
![](readme_img/graph.png)
* 2 number display

**List of charts**

Type | Title |
--- | ---
**Line chart** | Sales on region (mil used)
**Line chart** | Total sales (mil USD) per year
**Pie chart** | Entertainment Software Rating Board (ESRB) ratings
**Bar chart** | Game Releases by Platform
**Row chart** | The best-selling games in the world
**Row chart** | The best rated games by users
**Row chart** | The best rated games by critics
**Bar chart** | Game sales by Region and Genre

## **Testing:**
I have tested the responsive part using Blisk which is a useful toolbox for development, debugging and testing,

## Instructions

#### Run the MongoDB Server:
   1. install MongoDB, you can find it [here](https://www.mongodb.com/download-center#community)
   2. run the command in Terminal/Command Prompt:
   `'mongod --config [PATH]\_mongoDB_data\_config\_mongodb_config.conf'` 

#### Upload data file(.csv):
   1. in your Terminal/Command Prompt type mongod to have your server running
   2. copy the csv file in the same directory as the project
   3. open another Terminal/Command Prompt
   4. create a database and upload csv file with the next command 
   `'mongoimport  -d videoGames -c projects --type csv --file video_games_sales.csv --headerline'`
   5. videoGames - the database created
   6. projects - collection name
   7. headerline - treat the first record imported as the field names

#### Running the requirements.txt to install needed packages:

To install all files in the requirements.txt file you need to:

1.  go to the directory where requirements.txt is located in Terminal/Command Prompt
2.  activate your virtualenv
3.  run: `pip install -r requirements.txt` in your shell
