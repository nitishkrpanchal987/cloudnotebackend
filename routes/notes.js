const express = require("express");
const fetchUser = require("../middleware/fetchUser");
const router = express.Router();
const Notes = require("../models/Notes")
const { body, validationResult } = require("express-validator");


//Route:1 get all the notes using api/auth/getuser
router.get('/fetchallnotes', fetchUser, async (req, res)=>{
    try{
        const notes = await Notes.find({user: req.user.id})
        res.json(notes);
    }catch{
        console.error(error.message);
        res.status(500).send("some error has occured");
    }
})


//Route:2 Add new notes using api/notes/addnote
router.post('/addnote', fetchUser, [
    body("title", "Enter a valid title").isLength({ min: 5 }),
    body("description", "Enter atleast 5 letters").isLength({ min: 10}),
], async (req, res)=>{
    try{
        const {title, description, tag} = req.body;
    
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
    
        const note = new Notes({
            title, description, tag, user:req.user.id
        })
    
        const savedNote = await note.save()
        
        res.json(savedNote);
    }catch{
        console.error(error.message);
        res.status(500).send("some error has occured");
    }
})

//Route:3 update an existing notes using PUT: api/notes/updatenote
router.put('/updatenote/:id', fetchUser, async (req, res)=>{
    try{
    const {title, description, tag} = req.body;
    const newNote = {};
    if(title) {newNote.title = title};
    if(description) {newNote.description = description};
    if(tag) {newNote.tag = tag};

    let note = await Notes.findById(req.params.id);
    if(!note) {return res.status(404).send("not found")};
    if(note.user.toString() !== req.user.id)
    {
        return res.status(401).send('not allowed');
    }

    note = await Notes.findByIdAndUpdate(req.params.id, {$set: newNote}, {new:true});
    res.json({note});
    }catch{
        console.error(error.message);
        res.status(500).send("some error has occured");
    }
})

//Route:4 delete an existing notes using DELETE: api/notes/deletenote
router.delete('/deletenote/:id', fetchUser, async (req, res)=>{
    try{
    const {title, description, tag} = req.body;

    let note = await Notes.findById(req.params.id);
    if(!note) {return res.status(404).send("not found")};

    //allow deletion only if user owns this note 
    if(note.user.toString() !== req.user.id)
    {
        return res.status(401).send('not allowed');
    }

    note = await Notes.findByIdAndDelete(req.params.id);
    res.json({"success": "note has been deleted", note: note});
    }catch{
        console.error(error.message);
        res.status(500).send("some error has occured");
    }
})

module.exports = router