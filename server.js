const express = require('express')
const app = express()
const cors = require('cors')
const { ObjectId } = require('mongodb')
const MongoClient = require('mongodb').MongoClient
require('dotenv').config()
const PORT = 8000

let db,
    dbConnectionString = process.env.DB_STRING,
    dbName = 'sample_mflix',
    collection

MongoClient.connect(dbConnectionString)
    .then(client => {
        console.log(`Connected to Database`)
        db = client.db(dbName)
        collection = db.collection('movies')
    })

//app.set('view engine', 'ejs')
//app.use(express.static('public'))
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(cors())

app.get("/search", async (request, response) =>{
    try {
        let result=await collection.aggregate({
            "$Search": {
                "autocomplete": {
                    "query": '${request.query.query}',
                    "path": "title",
                    "fuzzy": {
                        "maxEdits":2,
                        "prefixLength": 3
                    }
                }
            }
        }).toArray()
        response.send(result)
    }catch(error){
        response.status(500).send({message: error.message})
    }
})

app.get("/get/:id", async(request,response)=>{
    try{
        let result=await collection.findOne({
            "_id" : ObjectId(request.params.id)
        })
        response.send(result)
    }catch{
        response.status(500).send({message: error.message})

    }
})

/*app.get('/', async (request, response) => {
    try {
        response.render('index.ejs')
    } catch (error) {
        response.status(500).send({message: error.message})
    }
})
*/

//PORT = 8000
app.listen(process.env.PORT || PORT, () => {
    console.log(`Server is running on port`)
})