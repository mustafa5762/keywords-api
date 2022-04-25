const express = require('express')
const app = express();
const port = 5000;
const axios = require('axios');
var bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { Schema } = mongoose;

mongoose.connect(
  'mongodb+srv://Keywords:Hasnotyet123@keywords.vmzso.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
)
.then(()=>console.log('connected'))
.catch(e=>console.log(e));



app.use(bodyParser.json());

const keywordSchema = new Schema({
  keyword: String,
  keywordVolume: String,
  keywordCompetition: Number,
  keywordCPC: Number,
  country: String,
  status: String,
  date: {type: Date, default: Date.now},
  suggested: [{ keyword: String, volume: Number, CPC: Number }],
});

const Keyword = mongoose.model('Keyword', keywordSchema);

app.post("/api/keywords", async (req, res) => {
  const isavail = await Keyword.findOne({ keyword:req.body.keyword , country:req.body.country })
  if (isavail) {
    res.send(isavail);
    return;
  };
  const response = await axios.get(`https://db2.keywordsur.fr/keyword_surfer_keywords?country=${req.body.country}&keywords=[%22${req.body.keyword}%22]`)
  const data = response.data[req.body.keyword];
  const see = data.search_volume;
  const vol = see.toString();
  const key = new Keyword({
      keyword: req.body.keyword,
      keywordCompetition: data.competition,
      keywordVolume: vol,
      keywordCPC: data.cpc,
      country: req.body.country,
      status: 'updated',
      suggested: [{keyword: data.similar_keywords[0].keyword, volume:data.similar_keywords[0].search_volume, CPC:data.similar_keywords[0].cpc},{keyword: data.similar_keywords[1].keyword, volume:data.similar_keywords[1].search_volume, CPC:data.similar_keywords[1].cpc},{keyword: data.similar_keywords[2].keyword, volume:data.similar_keywords[2].search_volume, CPC:data.similar_keywords[2].cpc},{keyword: data.similar_keywords[3].keyword, volume:data.similar_keywords[3].search_volume, CPC:data.similar_keywords[3].cpc}]
  });
  const s = await key.save();
  res.send(s);
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});