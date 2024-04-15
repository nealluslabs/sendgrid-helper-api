const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const https = require("https");
 sslRootCAs = require('ssl-root-cas')
sslRootCAs.inject()

const omRoute = require('./om');


const app = express();
const port=process.env.PORT||5008


const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

app.use(bodyParser.json());
app.use('/api/om', omRoute);
app.use(cors({
  origin:'*' /*'https://bonecole-student.netlify.app/'*/,
methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
}));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

const developerPrimaryKey = "5b7a54a04b134ed3a70418a59660cb25" /*----> WORKING SANDBOX PRIMARY KEY--->*/ /*'1d7218381da64302851dccbef29bf671'*/



const xReferenceId =    'ae553cb4-60db-42ba-afa0-a9b6638543b6'  // ---> SANDBOX X REFERENCE '2079f714-3a79-4db1-bc3a-e0f608b19b15'  <-- ALSO STORE THIS IN AN ENV VARIABLE


const momoApiKeyUrl = `https://proxy.momoapi.mtn.com/v1_0/apiuser/${xReferenceId}/apikey`
const momoTokenUrl = "https://proxy.momoapi.mtn.com/collection/token";
const momoTokenUrl2 = "https://proxy.momoapi.mtn.com/collection/token/";
const momoRequestToPayUrl = "https://proxy.momoapi.mtn.com/collection/v1_0/requesttopay";
const productionApiKey= 'b82f1f0591384e00b4cd8b2ed91d70df'  //<--- STORE INSIDE ENVIRONMENT VARIABLE WHEN NEXT U WANNA PUSH  29/11/2023

/*============     1*/
app.post('/api/get-token', async (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
    const {} = req.body;
    console.log("GET TOKEN URL HAS BEEN HIT")
  try {

    /* const apiKey = await axios.post(momoApiKeyUrl,{httpsAgent},{
      headers: {
        'X-Reference-Id':xReferenceId,
        'Ocp-Apim-Subscription-Key':developerPrimaryKey, 
        'Content-Type': 'application/json',
},
     })*/

     console.log("THE API KEY IS-->",productionApiKey)



 const modAuth =`${xReferenceId}:${productionApiKey}`
 // const base64data = Buffer.from(`${xReferenceId}:${apiKey.data.apiKey}`).toString('base64')



    const response = await axios.post(momoTokenUrl2,{},
   {
       headers: {
        'Content-Type': 'application/json',
       'X-Reference-Id':xReferenceId,
        'Ocp-Apim-Subscription-Key':developerPrimaryKey,
        'Authorization':`Basic `+`${btoa(modAuth)}`
      }   
    });

    console.log("THE AUTH TOKEN IS-->",response.data)

    return res.json(response.data);
  } catch (error) {
    console.log("ERROR___", error);
    return res.status(500).json({ error:error.message });
  }
});

/*============     2*/

app.post('/api/requesttopay', async (req, res) => {
  res.header('Access-Control-Allow-Origin','*');
  const { momoToken, ...restOfBody } = req.body;
  const myUuid = uuidv4();
  console.log("TAKE NOTE OF THIS UUID------>",myUuid)
  console.log("GET REQUEST TO PAY URL HAS BEEN HIT, MOMO TOKEN IS -->",momoToken)
  try {
    if (!momoToken) {
        return res.status(400).json({ error: 'MoMo token not available' });
      }
     await axios.post(momoRequestToPayUrl, restOfBody, {
      headers: {
        'X-Reference-Id': myUuid,
        'X-Target-Environment': 'mtnguineaconakry',
        'Ocp-Apim-Subscription-Key':developerPrimaryKey,/* '5b7a54a04b134ed3a70418a59660cb25'*/
        'Authorization': `Bearer ${momoToken}`,
        'Content-Type': 'application/json',
},
    });


    return res.json({payerReferenceId:myUuid});

  } catch (error) {
   // console.log("ERROR__", error);
    return res/*.status(500)*/.json({ error:error.message });
  }
});


/*============     3*/


app.post('/api/paystatus', async (req, res) => {
  res.header('Access-Control-Allow-Origin','*');

  const { momoToken,payerReferenceId} = req.body;

setTimeout(async()=>{
  const response2 = await axios.get(`https://proxy.momoapi.mtn.com/collection/v1_0/requesttopay/${payerReferenceId}`, {
    headers: {
      'X-Reference-Id': payerReferenceId,
      'X-Target-Environment': 'mtnguineaconakry',
      'Ocp-Apim-Subscription-Key':developerPrimaryKey,/* '5b7a54a04b134ed3a70418a59660cb25'*/
      'Authorization': `Bearer ${momoToken}`,
      'Content-Type': 'application/json',
},
  });



  console.log("RESPONSE___", response2);
  return res.json(response2.data);
}
,1000)



})



/*============    4 */

app.post('/api/twoaction', async (req, res) => {
  res.header('Access-Control-Allow-Origin','*');
  const { momoToken, ...restOfBody } = req.body;


  const myUuid = uuidv4();
  console.log("TAKE NOTE OF THIS UUID------>",myUuid)
  console.log("GET REQUEST TO PAY URL HAS BEEN HIT, MOMO TOKEN IS -->",momoToken)
  try {
    if (!momoToken) {
        return res.status(400).json({ error: 'MoMo token not available' });
      }
     await axios.post(momoRequestToPayUrl, restOfBody, {
      headers: {
        'X-Reference-Id': myUuid,
        'X-Target-Environment': 'mtnguineaconakry',
        'Ocp-Apim-Subscription-Key':developerPrimaryKey,/* '5b7a54a04b134ed3a70418a59660cb25'*/
        'Authorization': `Bearer ${momoToken}`,
        'Content-Type': 'application/json',
},
    }
  
    
    ).then(()=>{
  
      setTimeout(async()=>{
        const response2 = await axios.get(`https://proxy.momoapi.mtn.com/collection/v1_0/requesttopay/${myUuid}`, {
          headers: {
            'X-Reference-Id': myUuid,
            'X-Target-Environment': 'mtnguineaconakry',
            'Ocp-Apim-Subscription-Key':developerPrimaryKey,/* '5b7a54a04b134ed3a70418a59660cb25'*/
            'Authorization': `Bearer ${momoToken}`,
            'Content-Type': 'application/json',
      },
        });
      
      
      
        console.log("RESPONSE___", response2);
        return res.json(response2.data);
      }
      ,1000)

    })


   // return res.json({payerReferenceId:myUuid});

  } catch (error) {
   // console.log("ERROR__", error);
    return res/*.status(500)*/.json({ error:error.message });
  }

})




app.listen(port, () => {
  console.log(`Proxy server listening at http://localhost:${port}`);
});
