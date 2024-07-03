
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();

// Connect to MongoDB
// mongoose.connect('mongodb://localhost:27017/dd', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect('mongodb+srv://pd14030304:k2DEKi2TKyAYwLRA@cluster0.4poz3y9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true });


// Define the Playlist schema
const playlistSchema = new mongoose.Schema({
  screenId: String,
  playlistName: String,
  playlistId: String,
  videoUrls: [String]
});

const Playlist = mongoose.model('Playlist', playlistSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Playlist API',
      version: '1.0.0',
      description: 'API for managing video playlists'
    },
    servers: [{ url: 'http://localhost:3000' }]
  },
  apis: ['./server.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// POST route to create a new playlist
/**
 * @swagger
 * /submit-playlist:
 *   post:
 *     summary: Create a new playlist
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               screenId:
 *                 type: string
 *               playlistName:
 *                 type: string
 *               playlistId:
 *                 type: string
 *               videoUrls:
 *                 type: array
 *                 items:
 *                   type: string
 *             example:
 *               screenId: "screen1"
 *               playlistName: "My Playlist"
 *               playlistId: "123"
 *               videoUrls:
 *                 - "https://example.com/video1.mp4"
 *                 - "https://example.com/video2.mp4"
 *     responses:
 *       200:
 *         description: Playlist created successfully
 *       500:
 *         description: Internal server error
 */
app.post('/submit-playlist', async (req, res) => {
  const { screenId, playlistName, playlistId, videoUrls } = req.body;
  const playlist = new Playlist({
    screenId,
    playlistName,
    playlistId,
    videoUrls: Array.isArray(videoUrls) ? videoUrls : [videoUrls]
  });

  try {
    await playlist.save();
    res.status(200).send('Playlist saved successfully');
  } catch (error) {
    res.status(500).send('Internal server error');
  }
});

// GET route to retrieve a playlist by screenId
/**
 * @swagger
 * /playlists/{screenId}:
 *   get:
 *     summary: Get a playlist by screen ID
 *     parameters:
 *       - in: path
 *         name: screenId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Playlist found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 screenId:
 *                   type: string
 *                 playlistName:
 *                   type: string
 *                 playlistId:
 *                   type: string
 *                 videoUrls:
 *                   type: array
 *                   items:
 *                     type: string
 *       404:
 *         description: Playlist not found
 */
app.get('/playlists/:screenId', async (req, res) => {
  try {
    const playlist = await Playlist.findOne({ screenId: req.params.screenId });
    if (!playlist) {
      return res.status(404).send('Playlist not found');
    }
    res.status(200).json(playlist);
  } catch (error) {
    res.status(500).send('Internal server error');
  }
});

// PUT route to update a playlist by screenId
/**
 * @swagger
 * /playlists/{screenId}:
 *   put:
 *     summary: Update a playlist by screen ID
 *     parameters:
 *       - in: path
 *         name: screenId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               screenId:
 *                 type: string
 *               playlistName:
 *                 type: string
 *               playlistId:
 *                 type: string
 *               videoUrls:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Playlist updated successfully
 *       404:
 *         description: Playlist not found
 *       500:
 *         description: Internal server error
 */
app.put('/playlists/:screenId', async (req, res) => {
  try {
    const updatedPlaylist = await Playlist.findOneAndUpdate(
      { screenId: req.params.screenId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedPlaylist) {
      return res.status(404).send('Playlist not found');
    }
    res.status(200).json(updatedPlaylist);
  } catch (error) {
    res.status(500).send('Internal server error');
  }
});

// GET all playlists for displaying in frontend
/**
 * @swagger
 * /playlists:
 *   get:
 *     summary: Get all playlists
 *     responses:
 *       200:
 *         description: A list of playlists
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   screenId:
 *                     type: string
 *                   playlistName:
 *                     type: string
 *                   playlistId:
 *                     type: string
 *                   videoUrls:
 *                     type: array
 *                     items:
 *                       type: string
 *       500:
 *         description: Internal server error
 */
app.get('/playlists', async (req, res) => {
  try {
    const playlists = await Playlist.find();
    res.status(200).json(playlists);
  } catch (error) {
    res.status(500).send('Internal server error');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
