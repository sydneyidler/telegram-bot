const { MongoClient } = require("mongodb");

const password = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;
const collectionName = process.env.DB_COLLECTION_NAME;
const uri = `mongodb+srv://admin:${password}@cluster0.dz8aw.mongodb.net/${dbName}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

exports.getCurrencies = async function () {
  try {
    await client.connect();

    const collection = client.db(dbName).collection(collectionName);
    const currencies = await collection.findOne();

    const { timestamp, quotes } = currencies;

    return { timestamp, quotes };
  } finally {
    await client.close();
  }
};

exports.updateCurrencies = async function (quotes, timestamp) {
  try {
    await client.connect();

    const collection = client.db(dbName).collection(collectionName);

    const updateDocument = {
      $set: {
        timestamp,
        quotes,
      },
    };

    const result = await collection.updateOne({}, updateDocument);
  } finally {
    await client.close();
  }
};
