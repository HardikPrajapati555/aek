const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();

// Connect to MongoDB
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

/**
 * @swagger
 * components:
 *   schemas:
 *     Playlist:
 *       type: object
 *       required:
 *         - screenId
 *         - playlistName
 *         - playlistId
 *         - videoUrls
 *       properties:
 *         screenId:
 *           type: string
 *           description: ID of the screen
 *         playlistName:
 *           type: string
 *           description: Name of the playlist
 *         playlistId:
 *           type: string
 *           description: ID of the playlist
 *         videoUrls:
 *           type: array
 *           items:
 *             type: string
 *           description: List of video URLs
 *       example:
 *         screenId: 'screen123'
 *         playlistName: 'My Playlist'
 *         playlistId: 'playlist123'
 *         videoUrls: ['http://example.com/video1', 'http://example.com/video2']
 */

/**
 * @swagger
 * /submit-playlist:
 *   post:
 *     summary: Create a new playlist
 *     tags: [Playlists]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             $ref: '#/components/schemas/Playlist'
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
    videoUrls: Array.isArray(videoUrls) ? videoUrls : [videoUrls] // Ensure it's an array
  });

  try {
    await playlist.save();
    res.status(200).send('Playlist saved successfully');
  } catch (error) {
    res.status(500).send('Internal server error');
  }
});

/**
 * @swagger
 * /playlists/{screenId}:
 *   get:
 *     summary: Get a playlist by screenId
 *     tags: [Playlists]
 *     parameters:
 *       - in: path
 *         name: screenId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the screen
 *     responses:
 *       200:
 *         description: Playlist retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Playlist'
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

/**
 * @swagger
 * /playlists/{screenId}:
 *   put:
 *     summary: Update a playlist by screenId
 *     tags: [Playlists]
 *     parameters:
 *       - in: path
 *         name: screenId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the screen
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             $ref: '#/components/schemas/Playlist'
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

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
