# Single-Page Web Application Using a Database - Workout Tracker

This web application allows the user to track their workouts using a MySQL database. Interactions with the database are handled via self-implemented AJAX instructions.

## Instructions to run locally
1. Enter credentials to MySQL database in `dbcon.js`.
2. Install dependencies and start server. Supply a port number when starting server. Port 3000 is shown in the example below.
```
$ npm install
$ node server.js 3000
```
3. Your app should now be running on [localhost:3000](http://localhost:3000/).
4. To initialize table, visit `/reset-table` from your site.
5. Once table is initialized, each visit to your site should automatically pull the table data from your database.