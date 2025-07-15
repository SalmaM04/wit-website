// step 1: bring all tools we need
const express = require('express'); // we use express to create the backend server
const cors         = require('cors');  
const { ObjectId } = require('mongodb');
const { MongoClient } = require('mongodb'); // MongoDB's official tool to connect to database
require('dotenv').config(); // loads our secret .env file so we don’t expose private info

// step 2: set up our Express app and choose a port to run it on
const app = express();
const PORT = 3001;

// step 3: this middleware lets us read JSON coming from the frontend form
app.use(cors({
  origin: ['http://localhost:3000', 'https://zesty-cassata-96d7d7.netlify.app']
}));
app.use(express.json());

// step 4: prepare MongoDB connection using our secret key from .env
const client = new MongoClient(process.env.MONGO_URI); // this connects to MongoDB Atlas
let suggestionsCollection; // we’ll set this to our 'suggestions' collection later

// step 5: this function actually connects to the database and picks the collection
async function connectToDB() {
  try {
    await client.connect(); // wait for the connection to finish
    const db = client.db('witWebsite'); // use this name for our database 
    suggestionsCollection = db.collection('suggestions'); // set the collection we’ll use
    console.log('Connected to MongoDB!');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
}

// step 6: run the function above to actually connect!
connectToDB().then(() => {
  if (!suggestionsCollection) {
    console.error("suggestionsCollection is still undefined! Check MongoDB connection or DB/collection name.");
  } else {
    console.log("MongoDB collection successfully loaded.");
  }
});

// step 7: this route is just to test if our backend is alive and running
app.get('/', (req, res) => {
  console.log("GET / request received");
  res.send('Suggestion Box backend is running!');
});

// step 8: this route listens for suggestions from the frontend
app.post('/suggestions', async (req, res) => {
  // Step 8a: grab the suggestion that was submitted from the frontend form
  const suggestion = req.body;

  // step 8b: if the suggestion is empty or missing the text, return an error
  if (!suggestion || !suggestion.text) {
    return res.status(400).json({ error: 'Missing suggestion text' });
  }

  try {
    // step 8c: save the suggestion into our MongoDB collection
    const result = await suggestionsCollection.insertOne(suggestion);

    // step 8d: send back a success message with the MongoDB ID
    res.status(201).json({ message: 'Suggestion saved!', id: result.insertedId });
  } catch (err) {
    // step 8e: if something goes wrong, tell us in the terminal and let frontend know too
    console.error('Error saving suggestion:', err);
    res.status(500).json({ error: 'Failed to save suggestion' });
  }
});

// step 8f: this route fetches all suggestions from MongoDB
app.get('/suggestions', async (req, res) => {
  try {
    const suggestions = await suggestionsCollection.find().toArray(); // get all suggestions
    res.status(200).json(suggestions); // return them as JSON
  } catch (err) {
    console.error('Error fetching suggestions:', err);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

// step 9: this tells Express to actually start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// DELETE a suggestion by ID
app.delete('/suggestions/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await suggestionsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
      res.status(200).json({ message: 'Suggestion deleted' });
    } else {
      res.status(404).json({ error: 'Suggestion not found' });
    }
  } catch (err) {
    console.error('Error deleting suggestion:', err);
    res.status(500).json({ error: 'Failed to delete suggestion' });
  }
});