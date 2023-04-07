// Import required dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');

// Create an Express web server
const app = express();
const port = 3000; // Or any other port number you prefer

// Middleware for parsing JSON and handling CORS
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

// Configure Multer middleware for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Specify the directory where uploaded files will be stored
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Specify the filename format for uploaded files
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// Create Multer instance
const upload = multer({ storage: storage });

// Passport middleware for authentication
app.use(passport.initialize());
app.use(passport.session());

// Passport LocalStrategy configuration
passport.use(new LocalStrategy((username, password, done) => {
  // Implement your authentication logic here
}));

// Add any additional passport configuration as needed

// Connect to MongoDB using Mongoose
mongoose.connect('mongodb://localhost/alao_db', { useNewUrlParser: true });

// Define the database schema for digital estate information
const digitalEstateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dob: { type: Date, required: true },
  assets: { type: Array, required: true },
  beneficiaries: { type: Array, required: true },
});

// Define a model for the digital estate schema
const DigitalEstate = mongoose.model('DigitalEstate', digitalEstateSchema);

// Passport configuration
passport.use(new LocalStrategy((username, password, done) => {
  // Find a user by username
  User.findOne({ username }, (err, user) => {
    if (err) { return done(err); }
    if (!user) {
      return done(null, false, { message: 'Incorrect username' });
    }
    // Verify password
    if (!user.verifyPassword(password)) {
      return done(null, false, { message: 'Incorrect password' });
    }
    return done(null, user);
  });
}));

// API route for authenticating a user
app.post('/api/login', passport.authenticate('local'), (req, res) => {
  // Upon successful authentication, return user information
  res.status(200).json(req.user);
});

// API route for logging out a user
app.post('/api/logout', (req, res) => {
  // Logout the currently authenticated user
  req.logout();
  res.status(200).json({ message: 'Logged out successfully' });
});

// API route for checking if a user is authenticated
app.get('/api/check-auth', (req, res) => {
  // Check if a user is authenticated
  if (req.isAuthenticated()) {
    return res.status(200).json({ authenticated: true, user: req.user });
  }
  res.status(401).json({ authenticated: false, user: null });
});


// API route for creating a new digital estate
app.post('/api/digital-estates', upload.single('file'), (req, res) => {
  // Extract data from request body
  const { name, dob, assets, beneficiaries } = req.body;

  // Create a new DigitalEstate document
  const newDigitalEstate = new DigitalEstate({
    name,
    dob,
    assets,
    beneficiaries,
    file: req.file
  });

  // Save the new digital estate to the database
  newDigitalEstate.save()
    .then(savedDigitalEstate => {
      res.status(201).json(savedDigitalEstate);
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to create digital estate' });
    });
});

// API route for retrieving all digital estates
app.get('/api/digital-estates', (req, res) => {
  // Retrieve all DigitalEstate documents from the database
  DigitalEstate.find()
    .then(digitalEstates => {
      res.status(200).json(digitalEstates);
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to retrieve digital estates' });
    });
});

// API route for retrieving a specific digital estate by ID
app.get('/api/digital-estates/:id', (req, res) => {
  // Retrieve a specific DigitalEstate document by ID from the database
  DigitalEstate.findById(req.params.id)
    .then(digitalEstate => {
      if (!digitalEstate) {
        return res.status(404).json({ error: 'Digital estate not found' });
      }
      res.status(200).json(digitalEstate);
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to retrieve digital estate' });
    });
});

// API route for updating a specific digital estate by ID
app.put('/api/digital-estates/:id', (req, res) => {
  // Update a specific DigitalEstate document by ID in the database
  DigitalEstate.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(updatedDigitalEstate => {
      if (!updatedDigitalEstate) {
        return res.status(404).json({ error: 'Digital estate not found' });
      }
      res.status(200).json(updatedDigitalEstate);
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to update digital estate' });
    });
});

// API route for deleting a specific digital estate by ID
app.delete('/api/digital-estates/:id', (req, res) => {
  // Delete a specific DigitalEstate document by ID from the database
  DigitalEstate.findByIdAndDelete(req.params.id)
    .then(deletedDigitalEstate => {
      if (!deletedDigitalEstate) {
        return res.status(404).json({ error: 'Digital estate not found' });
      }
      res.status(200).json({ message: 'Digital estate deleted successfully' });
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to delete digital estate' });
    });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
