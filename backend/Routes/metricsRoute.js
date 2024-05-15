const router = require('express').Router();
const client = require('prom-client');

router.get('/', async(req, res) => {
    try{
        res.set('Content-Type', client.register.contentType);
        res.send(await client.register.metrics())
    }
    catch(err) {
        console.log(err)
        res.status(500).send({err})
    }
});


module.exports = router;
