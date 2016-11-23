#!/usr/bin/env node
console.log('bin/loadFakeData started')
const Parse = require('parse/node')
const request = require('request-promise')

const Place = Parse.Object.extend('Place')

Parse.initialize('TEST_APP_ID', '', 'TEST_MASTER_KEY')
Parse.serverURL = 'http://localhost:1337/api'

const places = [
  {
    name: 'I piaceri della carne',
    description: 'hello',
    country: 'Italy',
    province: 'BS',
    phone: '0331 4108597',
    town: 'Borgosatollo',
    zipCode: '25010',
    address: 'Via Capo le Case, 27',
    email: 'DavideSabbatini@dayrep.com'
  },
  {
    name: 'Osteria della Madonna',
    description: 'hello',
    country: 'Italy',
    province: 'CA',
    phone: '0386 7472511',
    town: 'Villamar',
    zipCode: '09020',
    address: 'Via degli Aldobrandeschi, 132',
    email: 'UbertoDavide@dayrep.com'
  },
  {
    name: 'La Locanda del Chierichetto',
    description: 'hello',
    country: 'Italy',
    province: 'TO',
    phone: '0386 1744371',
    town: 'Riva Presso Chieri',
    zipCode: '10020',
    address: 'Via Volto San Luca, 88',
    email: 'AnnaMariaSabbatini@rhyta.com'
  },
  {
    name: 'Dai vecchietti di minchiapitittu',
    description: 'hello',
    country: 'Italy',
    province: 'NU',
    phone: '0325 6438391',
    town: 'Ulassai',
    zipCode: '08040',
    address: 'Via Croce Rossa',
    email: 'CatenaMilanesi@rhyta.com'
  },
  {
    name: 'Braci e abbracci',
    description: 'hello',
    country: 'Italy',
    province: 'BG',
    phone: '0367 1268171',
    town: 'Calcio',
    zipCode: '24054',
    address: 'Strada Provinciale 65, 8',
    email: 'QuartoBaresi@dayrep.com'
  },
  {
    name: 'Alla Ghiacciaia',
    description: 'hello',
    country: 'Italy',
    province: 'RC',
    phone: '0364 3964496',
    town: 'Scido',
    zipCode: '89010',
    address: 'Via Giulio Camuzzoni, 32',
    email: 'IvoneDellucci@armyspy.com'
  }
]

const loadFakeData = (async () => {
  const IMAGE_WIDTH_PIXELS = 1024
  const IMAGE_HEIGHT_PIXELS = 640
  for (const place of places) {
    const image = await request.get({ url: `https://unsplash.it/${IMAGE_WIDTH_PIXELS}/${IMAGE_HEIGHT_PIXELS}/?random`, encoding: null })
    const imageCover = await new Parse.File(`image_${place.name}`, { base64: new Buffer(image).toString('base64') }, 'image/jpeg').save()
    const result = await new Place({
      name: place.name,
      description: place.description,
      country: place.country,
      province: place.province,
      phone: place.phone,
      town: place.town,
      zipCode: place.zipCode,
      address: place.address,
      email: place.email,
      imageCover
    }).save({}, { useMasterKey: true })
  }
  console.log('bin/loadFakeData ended')
})()
