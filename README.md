# Smacks 'n Snacks

This is a full stack application developed for a new business called Smacks 'n Snacks. Users can create an account, log in, place an order, check for delivery and, if needed, delete their account. Users can also update their address, to either allow for delivery to be within distance or due to a move.

## What's included

- Pre-developed Auth app to create authorization requirements for users.
- HTML to set up layouts for each webpage.
- CSS for styling, as well as Bootstrap for navbar.
- Javascript to create functionality for each webpage.
- EJS to pass information from Javascript to .ejs documents, to have components appear on the webpages.
- Mapbox Geocoding client to determine delivery status for users.
- Database and models for user, address, meal orders and smack or nack orders.
 - Dotenv for node modules, SECRET_SESSION, and API key.
 - EJS Templating and EJS Layouts


## Database Models


### User Model

| Column Name | Data Type | Notes |
| --------------- | ------------- | ------------------------------ |
| id | Integer | Serial Primary Key, Auto-generated |
| name | String | Must be provided |
| email | String | Must be unique / used for login |
| password | String | Stored as a hash |
| createdAt | Date | Auto-generated |
| updatedAt | Date | Auto-generated |



### SnSOrder Model

| Column Name | Data Type | Notes |
| --------------- | ------------- | ------------------------------ |
| userId | Integer | Foreign Key from User Model |
| cheesecakeFlavor| String | Must be provided | Choice of flavor
| slice | Integer | Optional | Choice of 1-5 slices |
| eight| Integer | Optional | Choice of 1-5 8in. cheesecakes |
| ten | Integer | Optional |Choice of 1-5 10in. cheesecakes |
| twelve | Integer | Optional | Choice of 1-5 12in. cheesecakes |
| granola | Integer | Optional | Choice of 1-5 6 oz. bags of granola|
| bbq | Integer | Optional | Choice of 1-5 bottles of BBQ-Sauce |

### mealOrder Model

| Column Name | Data Type | Notes |
| --------------- | ------------- | ------------------------------ |
| userId | Integer | Foreign Key from User Model |
| days| Integer | Must be provided | Choice of 3-5 days for meal plan
| protein | String | Must be provided | Choice between 4 proteins for meal plan ( one for all days selected) |
| pasta| Integer | Optional | Choice of 1-5  | can choose different starch per day
| quinoa | Integer | Optional |Choice of 1-5 | can choose different starch per day
| rice | Integer | Optional | Choice of 1-5 | can choose different starch per day
| potatoes | Integer | Optional | Choice of 1-5 | can choose different starch per day
| asparagus | Integer | Optional | Choice of 1-5 | can choose different vegetable per day
| carrots | Integer | Optional | Choice of 1-5 | can choose different vegetable per day
| medley | Integer | Optional | Choice of 1-5 | can choose different vegetable per day


### Address Model

| Column Name | Data Type | Notes |
| --------------- | ------------- | ------------------------------ |
| userId | Integer | Foreign Key from User Model |
| address | String | Must be provided | Lists users street address|
| city | String | Must be provided  | Lists users city|
| zip | Integer | Must be provided | Lists users zip|


## Steps To Create

I Forked and cloned the auth portion of this repo and it had a lot of dependencies already installed, so i ran *npm i* to get those included.
- Some of those were: </br>
-- Express </br>
-- dotenv </br>
-- Express-Session </br>
-- Express-Ejs-Layouts </br>
-- Mapbox </br>
-- Passport </br>
-- Flash </br>
-- MethodOverride </br>
-- Morgan </br>
- Create a database 
- Link your database to your project and create models.
- Create routes for each thing listed that I wanted to achieve ( all goals are listed multiple times in the readme).
- Set up ejs/html for the pages that will be rendered.
- Style those pages accordingly. 
- Boom that's it!
Just kidding. The nitty-gritty of the process is continued below.

 ## Where I started

 Wire-framing and ERD structure. These were modified as the project went on, but setting up a basic structure helped visualize the starting point and the finish line.
I also laid out a list of what needed to get done each day. Every 2 days consisted of a sprint that needed to be complete.


 ### Sprint One

 - Set up all models.</br>
 The models I began with altered over time, but my basics were set up during this sprint.
 - Create *get* routes. </br>
 I wanted to have all get routes working, so that I had actual pages rendering while I worked on functionality.
- Read documentation on API ( Mapbox) and figure out best ways to incorporate into this app.</br>
This step didn't get complete during sprint one. The understanding of what I wanted the API to do and the actual implementation were about 3 days apart, mostly due to not knowing how to get the logic started. I ended up incorporating the haversine formula, which is used the determine the distance between 2 points on a sphere using their latitudes and longitudes. 

```javascript

Number.prototype.toRad = function() {
	return this * Math.PI / 180;
};

function calculateDistanceToFarm(clientLat, clientLon) {
	
	var farmLat = 33.843075437500005;
	var farmLon = -117.997072;
	

	var R = 6371; 
	
	var x1 = farmLat - clientLat;
	var dLat = x1.toRad();
	var x2 = farmLon - clientLon;
	var dLon = x2.toRad();
	var a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(clientLat.toRad()) * Math.cos(farmLat.toRad()) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = R * c;
	console.log(d);
	return d;
}



```

- Create all views and controllers to start building in.


### Sprint Two

- Create the navbar. </br>
Normally, styling comes much later in the development process. However, because the navbar appears on every page, I wanted to have the basic structure of it built, so that I could format the elements and divs around it.
- Create forms and post routes. </br>
This step was a lot more involved than I anticipated. Based on the decision to use drop down quantities for each item, I had to redo my models at this point. Instead of having individual models for orders and items, I created models only for the orders and attached them to the userId.
During this step, creating the update route proved to be extremely challenging. After multiple sessions with instructors, we were able to come up with a solution that created the update route for our delivery address.

```javascript
router.post('/order/delivery', (req, res) => {
    db.user
      .findOne({
        where: {
          
          email: req.body['delivery-email'],
          name: req.body["delivery-name"],
          
        }
      
      })
      .then(function(user) {
        console.log(user.get()); 
        db.address
          .findOrCreate({
            where: {
              userId: user.get().id
            },
            defaults: {
              address: req.body['delivery-address'],
              city: req.body['delivery-city'],
              zip: req.body['delivery-zip']
            }
          })
          .then(function([ address, created ]) {
            if (created) {
              geocodingClient
                .forwardGeocode({
                  query: query
                })
                .send()
                .then((response) => {
                  const match = response.body;
                  // console.log(match);
                  const features = match.features;
                  // console.log("feature[0]");
                  // console.log(features[0]);
                  const coords = features[0].center;
                  const lat = coords[1];
                  const lon = coords[0];
                  // console.log(query)
                  let distance = calculateDistanceToFarm(lat, lon);
                  let msg = sendMessage(distance);
  
                  res.render('order/deliveryStatus', { msg: msg, email: email });
                });
            }else{
              db.address.update({
                address: req.body["delivery-address"],
                city: req.body["delivery-city"],
                zip: req.body["delivery-zip"]
              }, {
                where: { userId: user.get().id }
              }).then(response => {
                 console.log(response);
              })
               
            }
          });
      });
    
```
### Sprint Three

- Finalize all functionality.</br>
The functionality of the routes, for the most part, was fairly easy. I did have a hard time getting my controllers to work, but realized I was calling the pages incorrectly. After that realization, most routes came together fairly easily.
- Styling.</br>
As mentioned above, I used Bootstrap to assist with my navbar. I also used a background image for the wooden texture and encased all content in a div to style in the center of the page.
- Readme.</br>
I took notes throughout the project, adn came together at the end to fill out my readme with a full description.



## The challenges

I went over the two biggest of my challenges above. The functionality of my update ( PUT ) route  and the API performing in the way I needed to to get appropriate information. One that i didn't mention was how hard it was to create a sense of uniformity between pages when they all had different content. I enlisted the help of some classmates, who suggested the outer div having all the formatting and then styling the size and colors using id's. 

## The victories
The confidence in this project fluctuated for me quite a bit. I think the top victory for me is completing a functional app. I had to change, add and drop things to get to functionality, but the end result is something I am very proud of. Getting my api to work with the delivery routing was a huge accomplishment and a large team effort.


### The Shout-outs
This project wouldn't have been even half of what it was without the huge support and guidance of our amazing instructors. In addition to them, I had a lot of support from an outside tutor and from some amazing cohort mates.

So thank you!

Rome</br>
Taylor</br>
Adam</br>
Pete</br>
Sarah</br>
Erik</br>
Seanny</br>
Zintis</br>
Barent</br>
Shane</br>
Levin</br>
Nick</br>
Branden</br>
And everyone else who offered any level of assistance in this project. I appreciate you so much! 

Oh and one more time, THANKS PETE!





      





