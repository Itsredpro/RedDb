# Reddb Database Documentation

## Overview

The `reddb` module provides a simple and lightweight database system for Node.js applications. It is designed to handle JSON-based databases with easy-to-use functions for managing and interacting with data. The module consists of two main classes: `reddbDatabase` for managing the overall database and `reddbDatabaseHandle` for handling internal database processes.

## Table of Contents

1. [Installation](#installation)
2. [Module Configuration](#module-configuration)
3. [reddbDatabaseHandle Class](#reddbdatabasehandle-class)
4. [reddbDatabase Class](#reddbdatabase-class)

## Installation

To use the `reddb` module in your Node.js project, you can install it using npm:

```bash
npm install reddb
```

## Module Configuration

(I) = Internal use case. Modify with caution.

The module provides some configuration options that can be set before using it. These options are defined in the module's exports:

- `debug`: A boolean flag indicating whether debugging is enabled.
- `databaseheadpath`: The default directory path where databases will be stored.
- `extentiontype`: The file extension for database files.
- `maxOnreadyTimeMS`: The maximum time allowed for a database to be ready.
- `throwDangerousData`: A boolean flag indicating whether to throw away databases with potentially harmful/corrupted data.

## `reddbDatabaseHandle` Class

### Constructor

The `reddbDatabaseHandle` class is responsible for handling individual databases. It is initialized with the following parameters:

- `dbname`: A string representing the name of the database. (I)
- `dbpath`: A string representing the path to the database file. (I)
- `dbmaxsize`: The maximum size of the database in characters (default: 100,000). (I)
- `done`: A callback function to be called when the database is successfully loaded. (I)
- `destroy`: A callback function to be called when the database needs to be destroyed. (I)

### Properties

- `cache`: An object representing the in-memory cache of the database. (I)
- `filepath`: The path to the database file. (I)
- `maxsize`: The maximum size of the database. (I)
- `destroy`: The callback function for destroying the database. (I)
- `loaded`: A boolean flag indicating whether the database is loaded. (I)

### Methods

- `save`: Asynchronously saves the current state of the database to the file. 
- `edit`: Allows modification of the database by setting a key-value pair. (I)
- `exist`: Checks if a key exists in the database.

## `reddbDatabase` Class

### Constructor

The `reddbDatabase` class is responsible for managing the overall database. It is initialized with an optional `dbName` parameter, representing the name of the database.

### Properties

- `DBNAME`: The name of the database. (I)
- `databaseLoaded`: A boolean flag indicating whether the database is loaded. (I)
- `dbcharsize`: The maximum size of the database in characters (default: 100,000).
- `saveTimeMS`: The interval (in milliseconds) at which the database should be saved.
- `cInterval`: The interval object for triggering database saves. (I)

### Methods

- `loadData`: Asynchronously loads data from the specified database file.
- `onReady`: Returns a promise that resolves when the database is ready or rejects if the maximum on-ready time is exceeded.
- `setName`: Sets the name of the database.
- `setData`: Sets a key-value pair in the database.
- `getData`: Retrieves the value associated with a key from the database.
- `setSaveInterval`: Updates the interval for saving the database.

## Example Usage

```javascript
const { reddb } = require('reddb');

// Configure reddb module if needed

// Create a new database instance
const myDatabase = new reddb.reddbDatabase('exampleDB');

// Load data from the database file
myDatabase.loadData().then(() => {
  // Database is loaded, perform operations

  // Set data
  myDatabase.setData({ key: 'name', value: 'John Doe' });

  // Get data
  const retrievedData = myDatabase.getData('name');
  console.log('Retrieved Data:', retrievedData);

  // Set save interval
  myDatabase.setSaveInterval(10000);
});

// Wait for the database to be ready
myDatabase.onReady().then(() => {
  console.log('Database is ready!');
});
```
Now, let's demonstrate how to interact with the database once it's loaded.

### Setting Data

To set data in the database, you can use the `setData` method:

```javascript
// Set data
myDatabase.setData({ key: 'age', value: 25 });
```

### Adjusting Save Interval

You can adjust the save interval dynamically using the setSaveInterval method. For example, to set the save interval to 5 seconds:

```javascript
// Set save interval to 5 seconds
myDatabase.setSaveInterval(5000);
```

### Handling Database Ready Event

You can use the onReady method to wait for the database to be ready before performing certain actions:

```javascript
// Wait for the database to be ready
myDatabase.onReady().then(() => {
  console.log('Database is ready!');
  // Perform actions that require the database to be ready
});
```

### Handling Database Save

The database is automatically saved at intervals. However, you can manually trigger a save using the save method:

```javascript
// Manually trigger a save
myDatabase.handle.save();
```

## Conclusion

The reddb module provides a simple yet powerful database solution for Node.js applications. By following this documentation and exploring the provided code, you should be able to integrate and use the module effectively in your projects.

Happy coding!

License: LICENSE.txt
By @itsredstonepro