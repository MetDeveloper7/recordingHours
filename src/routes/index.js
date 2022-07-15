const {Router} = require('express');
const router = Router();
const {getData, createRecording} = require('../controllers/consulta');

router.get('/recording', getData);
router.post('/recording', createRecording);

module.exports = router;