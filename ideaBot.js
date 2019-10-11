require('dotenv').config()

const YAML = require('yaml')
const fs = require('fs')
const Jimp = require('jimp')
const Twitter = require('twitter')
const Twit = require('twit')

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
    console.log('Cool. Here we go.')
    let actions = await chooseActions()

    let image = await createImage(actions)

    const postSuccess = await postToTwitter(image, actions)

    if (!postSuccess) {
      console.log(`Didn't work out this time.`)
    } else {
      console.log('We did it.')
    }

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
    fs.readdirSync('images').forEach(file => {
      imageNames.push(file)
    })
    const imageName = imageNames[Math.floor(Math.random() * imageNames.length)]
    image = await Jimp.read(`images/${imageName}`)
    newImage = await image.clone()
    await newImage.resize(600, Jimp.AUTO)

    let x = 10
    let y = 10
    let font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE)
    await newImage.print(
      font,
      x,
      y,
      {
        text: text,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
      },
      580,
      110
    )
    return newImage
  }

  async function postToTwitter(image, actions) {
    const client = new Twit({
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      access_token: process.env.TWITTER_ACCESS_TOKEN_KEY,
      access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
    })

    let imageID = await uploadImage(client, image)

    if (imageID) {
      try {
        return await client.post('statuses/update', { media_ids: [imageID] })
      } catch (err) {
        console.log(err)
        return false
      }
    } else {
      console.log(`Image upload failed`)
      // let text = `An app that ${actions[0]} when somebody ${actions[1]}.`
      // try {
      //   return await client.post('statuses/update', { status: text })
      // } catch (err) {
      //   console.log(err)
      //   return false
      // }
      return false
    }
  }

  async function uploadImage(client, image) {
    const mime = image.getMIME()
    const base64content = await image.getBase64Async(mime)
    const stripIt = 'data:image/png;base64,'
    imgSrcString = base64content.replace(stripIt, '')
    try {
      // upload media to twitter
      const responseData = await client.post('media/upload', {
        media_data: imgSrcString
      })
      return responseData.data.media_id_string
    } catch (err) {
      console.log('Blech')
      console.log(err)
      return false
    }
  }
}
