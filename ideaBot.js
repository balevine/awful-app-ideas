require('dotenv').config()

const YAML = require('yaml')
const fs = require('fs')
const Jimp = require('jimp')
const Twitter = require('twitter')

const fileEvents = fs.readFileSync('./events.yml', 'utf8')
const actionsEvents = YAML.parse(fileEvents)

const fileConsequences = fs.readFileSync('./consequences.yml', 'utf8')
const actionsConsequences = YAML.parse(fileConsequences)

// Load environment variables
const consumerKey = process.env.TWITTER_CONSUMER_KEY
const consumerSecret = process.env.TWITTER_CONSUMER_SECRET
const accessTokenKey = process.env.TWITTER_ACCESS_TOKEN_KEY
const accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET

exports.newIdea = (req, res) => {
  run()

  async function run() {
    let actions = await chooseActions()

    let image = await createImage(actions)

    await postToTwitter(image)

    console.log('We did it.')

    return res.status(200).send('Message received')
  }

  async function chooseActions() {
    // pick two random actions from the lists
    let actionOne =
      actionsConsequences[
        Math.floor(Math.random() * actionsConsequences.length)
      ]
    let actionTwo =
      actionsEvents[Math.floor(Math.random() * actionsEvents.length)]
    return [actionOne, actionTwo]
  }

  async function createImage(actions) {
    let image
    let text = `An app that ${actions[0]} when somebody ${actions[1]}.`
    // choose an image from the files in /assets/images
    let imageNames = []
    fs.readdirSync('/images').forEach(file => {
      imageNames.push(file)
    })
    const imageName = imageNames[Math.floor(Math.random() * imageNames.length)]
    let x = 10
    let y = 10
    image = await Jimp.read(imageName)
    let font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE)
    image = await image.print(
      font,
      x,
      y,
      {
        text: 'Hello world!',
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
      },
      500,
      200
    )
    return image
  }

  async function postToTwitter(image) {
    const client = new Twitter({
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
      access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
    })

    // let imageID = await uploadImage(client, image)

    try {
      // const media_id = client.post('media/upload', { media: image })
      // return media_id
      initUpload() // Declare that you wish to upload some media
        .then(appendUpload) // Send the data for the media
        .then(finalizeUpload) // Declare that you are done uploading chunks
        .then(mediaId => {
          // You now have an uploaded movie/animated gif
          // that you can reference in Tweets, e.g. `update/statuses`
          // will take a `mediaIds` param.
          const status = client.post('statuses/update', { media_ids: mediaId })
        })
        .then(status => {
          console.log(status)
          return status
        })
    } catch (err) {
      console.log(err)
      return false
    }
  }

  async function uploadImage(client, image) {
    try {
      // const media_id = client.post('media/upload', { media: image })
      // return media_id
      initUpload() // Declare that you wish to upload some media
        .then(appendUpload) // Send the data for the media
        .then(finalizeUpload) // Declare that you are done uploading chunks
        .then(mediaId => {
          // You now have an uploaded movie/animated gif
          // that you can reference in Tweets, e.g. `update/statuses`
          // will take a `mediaIds` param.
        })
    } catch (err) {
      console.log(err)
      return false
    }
  }

  /**
   * Step 1 of 3: Initialize a media upload
   * @return Promise resolving to String mediaId
   */
  function initUpload() {
    return makePost('media/upload', {
      command: 'INIT',
      total_bytes: mediaSize,
      media_type: mediaType
    }).then(data => data.media_id_string)
  }

  /**
   * Step 2 of 3: Append file chunk
   * @param String mediaId    Reference to media object being uploaded
   * @return Promise resolving to String mediaId (for chaining)
   */
  function appendUpload(mediaId) {
    return makePost('media/upload', {
      command: 'APPEND',
      media_id: mediaId,
      media: mediaData,
      segment_index: 0
    }).then(data => mediaId)
  }

  /**
   * Step 3 of 3: Finalize upload
   * @param String mediaId   Reference to media
   * @return Promise resolving to mediaId (for chaining)
   */
  function finalizeUpload(mediaId) {
    return makePost('media/upload', {
      command: 'FINALIZE',
      media_id: mediaId
    }).then(data => mediaId)
  }

  /**
   * (Utility function) Send a POST request to the Twitter API
   * @param String endpoint  e.g. 'statuses/upload'
   * @param Object params    Params object to send
   * @return Promise         Rejects if response is error
   */
  function makePost(endpoint, params) {
    return new Promise((resolve, reject) => {
      client.post(endpoint, params, (error, data, response) => {
        if (error) {
          reject(error)
        } else {
          resolve(data)
        }
      })
    })
  }
}
