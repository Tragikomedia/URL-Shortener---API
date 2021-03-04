const router = require('express').Router();

router.use((req, res, next) => {
    res.set('Content-Type', 'application/json');
    next();
})

router.get('/', (req, res) => {
    const json = JSON.stringify({message: "Hello"});
    res.send(json);
});

router.post('/', (req, res) => {
    const name = JSON.stringify({name: req.body.name});
    res.send(name);
})

module.exports = router;